/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { BandsFile } from './bands'

/* ============================================================
   THE BANDS THE PACK CARRIES BESIDE ITS ROWS (tools/seed/bands.ts):
   every row they name is a row of the pack, every cell is filed under
   the sheet its own Source cell names, and nothing is carried for a
   band the extracts do not hold.
   ============================================================ */

const read = <T>(at: string): T =>
  JSON.parse(readFileSync(new URL(`../../data/northside/${at}`, import.meta.url), 'utf8')) as T

interface Entity {
  id: string
  kind?: string
  role?: string
}
interface Row {
  id: string
  values: Record<string, unknown>
}

const file = read<BandsFile>('bands.json')
const entities = read<Entity[]>('entities.json')
const rowsOf = (id: string): Row[] => read<Row[]>(`tables/${id}.json`)

describe('the bands beside the rows', () => {
  it('names only rows of the pack, each cell under the sheet its Source cell names', () => {
    const rows = new Map(entities.flatMap((e) => rowsOf(e.id).map((r) => [r.id, r] as const)))
    const sheetOf = new Map(file.bands.map((b) => [b.id, b.sheet]))
    for (const [rowId, held] of Object.entries(file.rows)) {
      const row = rows.get(rowId)
      expect(row, rowId).toBeDefined()
      for (const [band, { source, cells }] of Object.entries(held)) {
        expect(source.startsWith(`${sheetOf.get(band)}!R`)).toBe(true)
        expect(Object.values(row!.values)).toContain(source)
        expect(Object.keys(cells).length).toBeGreaterThan(0)
      }
    }
  })

  it('carries the deposit schedule and the lead times on every boat, and the features on trailers', () => {
    const boats = entities
      .filter((e) => e.kind === 'boat' && e.role !== 'join')
      .flatMap((e) => rowsOf(e.id))
    const held = (band: string) => Object.values(file.rows).filter((r) => r[band]).length
    expect(held('deposit')).toBe(boats.length)
    expect(held('lead')).toBe(boats.length)
    expect(held('features')).toBeGreaterThan(0)
    expect(file.bands.map((b) => b.id)).toEqual(['deposit', 'lead', 'features'])
    expect(file.bands[0].columns.map((c) => c.letter)).toEqual(['QD', 'QE', 'QF', 'QG', 'QH'])
  })
})
