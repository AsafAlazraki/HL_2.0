/* ============================================================
   THE WHOLE QUEUE IN ONE LOOK — found by typing, grouped by check or
   by list, and marked where it is new (the judge of Review,
   2026-11-04: J8 "see every case at once / find by list or maker —
   not possible", and J11 "after a new price file, see what is new").

   A case is found by the words it stands on: every name it names, its
   list's name, its heading, its codes. Every word typed must be in
   them, in any order and any case — "lone star", "formosa", "parts".

   NEW is read off the lines' own stamps, as Data's "New since" is
   (`changed.ts`): a line the price list brought carries the instant
   the file was packed; a line written on this computer since — a
   price typed on the sheet, a new price list applied from Shelf —
   carries the instant it was written. A case standing on such a line
   is new since the file was packed. What a new file SETTLED cannot be
   said: the file before is not kept on this computer, only its packing
   instant (DECISIONS 2026-11-04).

   PURE: cases, the lists and their lines in.
   ============================================================ */

import { readCell, rowLabel, type EntityDef, type RowData } from '@/domain/model'
import { linesOfCase, tableOfCase, type Case } from './cases'

type Tables = Readonly<Record<string, EntityDef>>
type Rows = Readonly<Record<string, readonly RowData[]>>

const CODE_WORDS = /^(code|model code|part number)$/i

/** Every word a case can be found by, lower case, one string. */
export function wordsOfCase(c: Case, tables: Tables, rows: Rows): string {
  const out: string[] = []
  const table = tables[tableOfCase(c)]
  if (table) out.push(table.name)
  switch (c.kind) {
    case 'boat':
    case 'none':
      if (c.group.category) out.push(c.group.category)
      break
    case 'two':
      out.push(c.item.name, ...c.item.lines.map((l) => l.code))
      break
    case 'twins':
      out.push(c.twin.name, c.twin.tableName)
      break
    case 'house':
      out.push(c.clause.said, ...c.clause.breaks.flatMap((b) => [b.boat, b.what]))
      break
    case 'note':
      out.push(...c.group.lines.map((l) => l.heading ?? ''))
      break
    case 'nameless':
      out.push(...c.group.items.map((i) => `${i.says} ${i.code}`))
      break
    case 'band':
      out.push(c.line.label, c.line.code)
      break
    case 'cost':
      out.push(c.group.priceName)
      break
  }
  for (const line of linesOfCase(c)) {
    const t = tables[line.tableId]
    const row = (rows[line.tableId] ?? []).find((r) => r.id === line.rowId)
    if (!t || !row) continue
    out.push(rowLabel(t, row))
    const code = t.fields.find((f) => CODE_WORDS.test(f.name.trim()))
    const v = code ? readCell(row, code.id) : null
    if (typeof v === 'string' || typeof v === 'number') out.push(String(v))
  }
  return out.join(' ').toLowerCase()
}

/** Does a case hold every word typed? An empty find holds every case. */
export function caseFound(words: string, typed: string): boolean {
  const asked = typed
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w !== '')
  return asked.every((w) => words.includes(w))
}

const instant = (iso: string | undefined): number => {
  const t = iso ? Date.parse(iso) : Number.NaN
  return Number.isNaN(t) ? 0 : t
}

/** Is any line this case stands on written after the price file was packed? */
export function writtenSince(c: Case, rows: Rows, packedAt: string): boolean {
  const packed = instant(packedAt)
  if (packed === 0) return false
  for (const line of linesOfCase(c)) {
    const row = (rows[line.tableId] ?? []).find((r) => r.id === line.rowId)
    if (!row) continue
    if (instant(row.updatedAt) > packed || instant(row.createdAt) > packed) return true
  }
  return false
}
