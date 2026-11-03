import { beforeAll, describe, expect, it } from 'vitest'
import type { EntityDef, RowData } from '@/domain/model'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { outlineLevels, viewRowsOf } from './table/outline'
import { buildGroups } from './table/grouping'
import { chaptersOf } from './table/priceList'
import { headingDoorOf } from './headingDoor'

/* ============================================================
   EVERY HEADING HAS A DOOR THAT LANDS AT IT, read off the real file.
   No heading or row id is typed here but the two the verifier of Data
   pressed (Rigging Kits' oldest dated section and Highfield's Classic);
   every other figure is read off the pack.
   ============================================================ */

let pack: PackFixture
let tables: Record<string, EntityDef>

beforeAll(async () => {
  pack = await loadPack()
  tables = Object.fromEntries(pack.entities.map((e) => [e.id, e]))
})

const rowsOf = (id: string): RowData[] => pack.rowsByEntity[id] ?? []
const textOf = (r: { text: Record<string, string> }, id: string): string => r.text[id] ?? ''

describe('the door to a heading', () => {
  it('opens a list read in chapters at the chapter, by its name', () => {
    expect(
      headingDoorOf(tables['boat_highfield']!, tables, rowsOf('boat_highfield'), 'Classic'),
    ).toEqual({
      in: 'Classic',
    })
  })

  it('opens a list with no chapters at the first line filed under the heading', () => {
    const heading = 'RIGGING KITS - Jeanneau DB/43 OB (as at 19/5/2022)'
    const table = tables['rig_kits']!
    const door = headingDoorOf(table, tables, rowsOf('rig_kits'), heading)
    expect(door).not.toBeNull()
    expect(door && 'at' in door, 'a row, because the sheet has no chapter to name').toBe(true)
    const level = outlineLevels(table, tables)[0]!
    const view = viewRowsOf(table, rowsOf('rig_kits'))
    const first = view.find((r) => textOf(r, level).trim() === heading)!
    expect(door).toEqual({ at: first.rowId })
  })

  /* the lists a heading press on Data opens: every list with headings of its own (a list of what
     fits is opened by its boat, never by a heading of Data's) */
  it('has a door for every outer heading of every list, of the kind the sheet reads', () => {
    let doors = 0
    for (const table of pack.entities.filter((e) => e.role !== 'join')) {
      const levels = outlineLevels(table, tables)
      if (levels.length === 0) continue
      const view = viewRowsOf(table, rowsOf(table.id))
      const roots = buildGroups(view, levels, textOf)
      const chapters = new Set(chaptersOf(roots, levels).map((c) => c.value))
      for (const root of roots) {
        if (root.value === '') continue
        const door = headingDoorOf(table, tables, rowsOf(table.id), root.value)
        doors += 1
        if (chapters.has(root.value)) {
          expect(door, `${table.name} › ${root.value}`).toEqual({ in: root.value })
          continue
        }
        expect(door && 'at' in door, `${table.name} › ${root.value} is a row`).toBe(true)
        const row = view.find((r) => door && 'at' in door && r.rowId === door.at)!
        expect(textOf(row, levels[0]!).trim(), `${table.name}: the row is under its heading`).toBe(
          root.value,
        )
      }
    }
    expect(doors, 'the file has headings to open').toBeGreaterThan(0)
  })

  it('has no door to a heading the list does not carry, and none to nothing', () => {
    const table = tables['rig_kits']!
    expect(headingDoorOf(table, tables, rowsOf('rig_kits'), 'No such section')).toBeNull()
    expect(headingDoorOf(table, tables, rowsOf('rig_kits'), '  ')).toBeNull()
  })
})
