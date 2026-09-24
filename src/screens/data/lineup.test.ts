import { beforeAll, describe, expect, it } from 'vitest'
import type { EntityDef, RowData } from '@/domain/model'
import { readTableRegister } from '@/domain/modules/register'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { lineupOf, lineupShown } from './lineup'

/* ============================================================
   THE LINEUP, READ OFF THE REAL FILE AND OFF THREE SMALL ONES.

   The real pack is read twice: once by `lineupOf`, and once by the
   register the head of the screen prints, which counts the same
   first-level headings its own way. The two must agree on how many
   there are, and the lineup's rows must add back to the table — or the
   spread would be drawing a figure the file does not carry. No count
   is written into this file.
   ============================================================ */

let pack: PackFixture

beforeAll(async () => {
  pack = await loadPack()
})

const tableOf = (id: string): EntityDef => pack.entities.find((e) => e.id === id)!
const rowsOf = (id: string): RowData[] => pack.rowsByEntity[id] ?? []

describe('a lineup read off the file', () => {
  it('agrees with the register on how many headings every table is cut into', () => {
    const register = readTableRegister(
      Object.fromEntries(pack.entities.map((e) => [e.id, e])),
      pack.rowsByEntity,
      pack.ctx.modules,
    )
    let read = 0
    for (const table of pack.entities.filter((e) => e.role !== 'join')) {
      const facts = register.facts[table.id]!
      const lineup = lineupOf(table, rowsOf(table.id))
      if (facts.branches === 0) {
        expect(lineup, `${table.name} is cut into nothing`).toBeNull()
        continue
      }
      read += 1
      expect(lineup, `${table.name} has a lineup`).not.toBeNull()
      expect(lineup!.branches.length, table.name).toBe(facts.branches)
      /* every row is under a heading or counted as under none */
      const added = lineup!.branches.reduce((n, b) => n + b.rows, 0) + lineup!.unfiled
      expect(added, `${table.name}'s headings add back to its rows`).toBe(facts.rows)
      expect(lineup!.total).toBe(facts.rows)
      expect(lineup!.most).toBe(Math.max(...lineup!.branches.map((b) => b.rows)))
    }
    expect(read, 'the file has tables with headings to read').toBeGreaterThan(0)
  })

  it('keeps the headings in the order the file first writes them', () => {
    const id = 'boat_highfield'
    const table = tableOf(id)
    const first = table.hierarchy![0]!
    const seen: string[] = []
    for (const row of rowsOf(id)) {
      const v = row.values[first]
      const heading = typeof v === 'string' ? v.trim() : ''
      if (heading !== '' && !seen.includes(heading)) seen.push(heading)
    }
    expect(lineupOf(table, rowsOf(id))!.branches.map((b) => b.name)).toEqual(seen)
  })

  it('draws no lineup for a flat table', () => {
    const flat = pack.entities.find(
      (e) => e.role !== 'join' && (e.hierarchy ?? []).length === 0 && rowsOf(e.id).length > 0,
    )
    expect(flat, 'the file has a flat table').toBeDefined()
    expect(lineupOf(flat, rowsOf(flat!.id))).toBeNull()
  })
})

describe('a lineup read off a small table', () => {
  const table = { id: 't', hierarchy: ['t.s'] } as unknown as EntityDef
  const row = (id: string, s: unknown): RowData =>
    ({ id, values: { 't.s': s } }) as unknown as RowData

  it('counts a row with no heading apart, and never drops it', () => {
    const lineup = lineupOf(table, [row('1', 'A'), row('2', ' '), row('3', 'A'), row('4', 7)])!
    expect(lineup.branches).toEqual([
      { name: 'A', rows: 2 },
      { name: '7', rows: 1 },
    ])
    expect(lineup.unfiled).toBe(1)
    expect(lineup.total).toBe(4)
  })

  it('is null for rows that carry no heading at all, and for no rows', () => {
    expect(lineupOf(table, [row('1', ''), row('2', null)])).toBeNull()
    expect(lineupOf(table, [])).toBeNull()
    expect(lineupOf(undefined, [row('1', 'A')])).toBeNull()
  })

  it('shows the first few in the file’s order and counts the rest', () => {
    const lineup = lineupOf(table, [
      row('1', 'A'),
      row('2', 'B'),
      row('3', 'B'),
      row('4', 'C'),
      row('5', 'C'),
      row('6', 'C'),
    ])!
    expect(lineupShown(lineup, 9).more).toBe(0)
    expect(lineupShown(lineup, 1)).toEqual({
      shown: [{ name: 'A', rows: 1 }],
      more: 2,
      moreRows: 5,
    })
  })

  it('draws the one left over rather than counting it', () => {
    const lineup = lineupOf(table, [row('1', 'A'), row('2', 'B'), row('3', 'C')])!
    /* "and 1 more" would take the line its own bar takes */
    expect(lineupShown(lineup, 2)).toEqual({ shown: lineup.branches, more: 0, moreRows: 0 })
    expect(lineupShown(lineup, 0).shown).toEqual([])
  })
})
