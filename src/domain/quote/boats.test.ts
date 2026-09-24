import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { isDiscontinued, readCell, type EntityDef, type RowData } from '@/domain/model'
import { boatsSaid, countBoats, modelKeyOf } from './boats'

/* ============================================================
   How many boats, off the real pack. No figure is typed: each is
   walked out of data/northside/ here by a rule written out in the test
   (a Highfield model is its series and its model; every other boat is
   its row) and compared with the module.
   ============================================================ */

let pack: PackFixture
let tables: Record<string, EntityDef>
let rows: Record<string, RowData[]>

beforeAll(async () => {
  pack = await loadPack()
  tables = Object.fromEntries(pack.entities.map((e) => [e.id, e]))
  rows = pack.rowsByEntity
})

describe('countBoats', () => {
  it('counts a Highfield model once however many finishes the file lists it in', () => {
    const hf = pack.byKey('boat_highfield')
    const live = (rows[hf.id] ?? []).filter((r) => !isDiscontinued(r))
    const byHand = new Set(
      live.map(
        (r) =>
          `${String(readCell(r, 'boat_highfield.series'))}|${String(readCell(r, 'boat_highfield.model'))}`,
      ),
    )
    const count = countBoats(tables, rows)
    const mine = count.byMaker.find((m) => m.id === hf.id)!
    expect(mine.boats).toBe(byHand.size)
    expect(mine.lines).toBe(live.length)
    expect(mine.boats).toBeLessThan(mine.lines)
  })

  it('counts every other boat as its line, and adds up to fewer boats than lines', () => {
    const count = countBoats(tables, rows)
    let lines = 0
    let boats = 0
    for (const table of pack.entities.filter((e) => e.kind === 'boat' && e.retired !== true)) {
      const live = (rows[table.id] ?? []).filter((r) => !isDiscontinued(r))
      lines += live.length
      boats += new Set(live.map((r) => modelKeyOf(table, r))).size
      if ((table.hierarchy ?? []).length < 3) {
        expect(count.byMaker.find((m) => m.id === table.id)!.boats).toBe(live.length)
      }
    }
    expect(count.lines).toBe(lines)
    expect(count.boats).toBe(boats)
    expect(count.boats).toBeLessThan(count.lines)
    expect(count.makers).toBe(count.byMaker.filter((m) => m.boats > 0).length)
  })

  it('counts nothing on a file with no boats — an empty state is the true state', () => {
    expect(countBoats({}, {})).toMatchObject({ boats: 0, makers: 0, lines: 0 })
  })

  it('says its noun', () => {
    expect(boatsSaid(1)).toBe('1 boat')
    expect(boatsSaid(289)).toBe('289 boats')
  })
})
