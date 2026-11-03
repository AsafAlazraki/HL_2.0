import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { columnNote } from './columnNotes'

/* the note is held to the file: the column it speaks of is in the pack, typed the one figure
   the note says it is on every line, and the figure it names is the file's own */
const DATA = path.resolve(__dirname, '../../../../data/northside')
const read = <T>(file: string): T => JSON.parse(readFileSync(path.join(DATA, file), 'utf8')) as T

describe('columnNote', () => {
  const rows = read<{ values: Record<string, unknown> }[]>('tables/labour_rates.json')

  it('says what Labour Rates’ Actual is, from what the file carries', () => {
    const note = columnNote('labour_rates.e')
    expect(note).toContain('Std Service Schedules')
    expect(note).toContain('Northside')
    /* Actual is 105 on every one of the 18 rates */
    expect(rows.length).toBe(18)
    expect(rows.every((r) => r.values['labour_rates.e'] === 105)).toBe(true)
    /* the $130.09 it names is a Rate (Exc GST) the file carries, to the cent */
    expect(
      rows.some((r) => {
        const v = r.values['labour_rates.g']
        return typeof v === 'number' && Math.round(v * 100) === 13_009
      }),
    ).toBe(true)
  })

  it('says nothing of a column it has no note for', () => {
    expect(columnNote('labour_rates.h')).toBe('')
    expect(columnNote('no.such')).toBe('')
  })
})
