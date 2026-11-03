/* ============================================================
   A RUN OF SPACES IS ONE SPACE TO THE SHEET'S FIND. The price file
   writes Parts line 575 and 576 as "Outboard Vented Cover - YAMAHA 4
   CYL 2.8L F150D  F175A  F200F (2023>)", two spaces between the
   motors; Review names the pair with one, and so does a person. The
   verifier of Review (2026-11-04, round 2) pressed "See both in the
   price list" and read "0 match". The two strings below are the
   file's own, copied from data/northside/tables/parts.json.
   ============================================================ */

import { describe, expect, it } from 'vitest'
import type { FieldDef } from '@/domain/model'
import { applyView, type ViewRow } from './core'

const FILE = 'Outboard Vented Cover - YAMAHA 4 CYL 2.8L F150D  F175A  F200F (2023>)'
const fields: FieldDef[] = [
  { id: 'name', name: 'Description', type: 'text' },
  { id: 'code', name: 'Code', type: 'text' },
]
const row = (rowId: string, code: string): ViewRow => ({
  rowId,
  values: { name: FILE, code },
  text: { name: FILE, code },
})
const rows = [
  row('parts:399', 'Y10A-V'),
  row('parts:400', 'Y10A-VW'),
  {
    rowId: 'other',
    values: { name: 'Outboard Cover', code: 'X' },
    text: { name: 'Outboard Cover', code: 'X' },
  },
]
const found = (search: string): string[] => applyView(rows, fields, { search }).map((r) => r.rowId)

describe('the sheet’s find reads a run of spaces as one', () => {
  it('finds both lines by the name said with one space between the motors', () => {
    expect(found('Outboard Vented Cover - YAMAHA 4 CYL 2.8L F150D F175A F200F (2023>)')).toEqual([
      'parts:399',
      'parts:400',
    ])
  })

  it('still finds them by the file’s own string, two spaces and all', () => {
    expect(found(FILE)).toEqual(['parts:399', 'parts:400'])
  })

  it('reads spaces typed twice, or around the words, as one', () => {
    expect(found('  f150d   f175a ')).toEqual(['parts:399', 'parts:400'])
  })

  it('still narrows: a word no line holds finds nothing', () => {
    expect(found('F150D F999')).toEqual([])
  })
})
