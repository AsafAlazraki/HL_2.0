import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import {
  DISCONTINUED_FIELD_ID,
  isDiscontinued,
  isRetired,
  type EntityDef,
  type RowData,
} from '@/domain/model'
import { countBoats } from '@/domain/quote/boats'
import { LEDGER } from '@/domain/quote/spoken'
import { TRAILERS, makerDoors } from './makers'

/* ============================================================
   The makers as doors, off the real pack. No figure is typed: each
   is walked out of data/northside/ here by the rule written in the
   test and compared with the module, so a door that drifts from the
   file fails, and so does a file that drifts from the doors.
   ============================================================ */

let pack: PackFixture
let tables: Record<string, EntityDef>
let rows: Record<string, RowData[]>

beforeAll(async () => {
  pack = await loadPack()
  tables = Object.fromEntries(pack.entities.map((e) => [e.id, e]))
  rows = pack.rowsByEntity
})

const live = (id: string): number => (rows[id] ?? []).filter((r) => !isDiscontinued(r)).length

describe('makerDoors', () => {
  it('opens one door per boat maker, counted in models as the picker counts them', () => {
    const doors = makerDoors(tables, rows).filter((d) => d.kind === 'boat')
    const count = countBoats(tables, rows).byMaker.filter((m) => m.boats > 0)
    expect(doors).toHaveLength(count.length)
    for (const door of doors) {
      const maker = count.find((m) => m.id === door.key)!
      expect(door.count).toBe(maker.boats)
      expect(door.said).toBe(`${maker.boats.toLocaleString('en-AU')} models`)
      expect(door.opens).toEqual({ at: 'picker', tableId: maker.id })
    }
  })

  it('names a boat maker as its rows write it, not as the register is filed', () => {
    const doors = makerDoors(tables, rows)
    const highfield = pack.byKey('boat_highfield')
    const said = LEDGER.makers.find((m) => m.table === highfield.id)?.maker
    expect(said).toBeDefined()
    const door = doors.find((d) => d.key === highfield.id)!
    expect(door.name).toBe(said)
    expect(door.name).not.toBe(highfield.name)
  })

  it('puts the heaviest maker first, boats then motors then the trailers', () => {
    const doors = makerDoors(tables, rows)
    const kinds = doors.map((d) => d.kind)
    expect(kinds.indexOf('motor')).toBeGreaterThan(kinds.lastIndexOf('boat'))
    expect(kinds.at(-1)).toBe('trailer')
    const boats = countBoats(tables, rows).byMaker.filter((m) => m.boats > 0)
    const heaviest = boats.toSorted((a, b) => b.lines - a.lines)[0]!
    expect(doors[0]?.key).toBe(heaviest.id)
  })

  it('opens every motor maker where a motor is sold, the build, counted in the motors it still sells', () => {
    const motors = Object.values(tables).filter(
      (t) => t.kind === 'motor' && t.role !== 'join' && !isRetired(t) && live(t.id) > 0,
    )
    const doors = makerDoors(tables, rows).filter((d) => d.kind === 'motor')
    expect(doors.map((d) => d.key).toSorted()).toEqual(motors.map((t) => t.id).toSorted())
    for (const door of doors) {
      expect(door.count).toBe(live(door.key))
      expect(door.opens).toEqual({ at: 'build' })
      /* "Yamaha Outboards" is filed with the kind's own word; the door says the maker */
      expect(door.name).not.toMatch(/outboards?$/i)
      expect(tables[door.key]?.name.startsWith(door.name)).toBe(true)
    }
  })

  it('draws the trailers as one door that counts the lists still sold from', () => {
    const lists = Object.values(tables).filter(
      (t) => t.kind === 'trailer' && t.role !== 'join' && !isRetired(t) && live(t.id) > 0,
    )
    const retired = Object.values(tables).filter((t) => t.kind === 'trailer' && isRetired(t))
    const door = makerDoors(tables, rows).find((d) => d.kind === 'trailer')!
    expect(door.name).toBe(TRAILERS)
    expect(door.count).toBe(lists.length)
    expect(door.tableIds.toSorted()).toEqual(lists.map((t) => t.id).toSorted())
    /* the obsolete list is history, not stock */
    for (const old of retired) expect(door.tableIds).not.toContain(old.id)
    expect(door.opens).toEqual({ at: 'build' })
  })

  it('draws no door for a register with nothing left to sell, and none for a join', () => {
    const yamaha = Object.values(tables).find((t) => t.kind === 'motor')!
    const gone = {
      ...rows,
      [yamaha.id]: (rows[yamaha.id] ?? []).map((r) => ({
        ...r,
        values: { ...r.values, [DISCONTINUED_FIELD_ID]: true },
      })),
    }
    const kept = makerDoors(tables, rows).map((d) => d.key)
    expect(kept).toContain(yamaha.id)
    const after = makerDoors(tables, gone)
    expect(after.map((d) => d.key)).not.toContain(yamaha.id)
    expect(after.every((d) => tables[d.tableIds[0] ?? '']?.role !== 'join')).toBe(true)
  })

  it('opens nothing on an empty sheet', () => {
    expect(makerDoors({}, {})).toEqual([])
  })
})
