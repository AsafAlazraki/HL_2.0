/* ============================================================
   A NOTE ON SALE AS IF IT WERE A PRODUCT (the judge of Review, data
   round 2026-11-04, B2 and missing item 4).

   The price list keeps its own notes as lines: a heading's divider
   ("OBSOLETE PARTS (NB: Parts No Longer Available or Used)"), an
   instruction to whoever orders ("NB: Fuel Filter - Order w Rigging
   Kit", "NB: No Rego Decals - NOT TO BE SUPPLIED"), and lines with
   nothing on them at all under a heading of notes. The old checks read
   them as products: the screen asked, with the one amber press, for a
   price on "OBSOLETE PARTS" and a name for three blank "SPECIAL NOTES"
   lines. A note is not priced and not named; it is taken off sale,
   which writes the price list's own Discontinued column.

   READ FROM THE FILE'S OWN WORDS, never a list of rows:
     · a name that opens with the file's "NB" or "OBSOLETE" — the
       workbook's own way of writing a note (a product that only
       carries "(NB: 2 Required)" in brackets is still a product);
     · a line with no name, no code and no price: nothing on it says
       what it is, and nothing on it could be quoted.
   A $0 line that says what it comes with ("Supplied with Motor",
   "Trailer Plug - Std Factory Fit") is NOT a note: it is a choice a
   build offers at $0 on purpose, and stays the no-price check's, said
   there as one that may be meant.

   PURE: it takes the lists and their lines.
   ============================================================ */

import {
  displayFieldOf,
  isDiscontinued,
  isRetired,
  readCell,
  type CellValue,
  type EntityDef,
  type FieldDef,
  type RowData,
} from '@/domain/model'
import { priceLevelsFor } from '@/domain/quote/pricing'
import type { Meant, ReviewWorld } from './checks'

/** The file's own way of opening a note: "NB: …", "OBSOLETE PARTS …". A name that only CARRIES
 *  a note in brackets ("Transom Mount Prop Light (NB: 2 Required)") is a product with a word for
 *  whoever orders it, priced like any other, and is not one. */
const NOTE_WORDS = /^\s*(?:NB\b|OBSOLETE\b)/i

/** Is this name one of the price list's notes? */
export const isNoteName = (name: string): boolean => NOTE_WORDS.test(name)

/**
 * A $0 LINE THAT SAYS WHAT IT COMES WITH, in the file's own words: "Supplied with Motor",
 * "Cables Supplied with Rigging Kit", "Trailer Plug - Std Factory Fit", "FF - Factory Fitted",
 * "Not Required", "TotalTilt with Limiter (Std)". Its $0 is the price list saying the thing is
 * already paid for elsewhere, so a case of nothing but these asks first to leave them at $0.
 */
const COMES_WITH = /\bsupplied with\b|\bfactory fit(?:ted)?\b|\bnot required\b|\(std\)/i

export const saysWhatItComesWith = (name: string): boolean => COMES_WITH.test(name)

const blank = (v: CellValue): boolean => v === null || v === undefined || v === ''

const codeColumnOf = (table: EntityDef): FieldDef | undefined =>
  table.fields.find((f) => /^(code|model code|part number)$/i.test(f.name.trim()))

/** A line with no name, no code and no price: nothing on it says what it is. */
export function isEmptyLine(table: EntityDef, row: RowData): boolean {
  const name = displayFieldOf(table)
  if (!name || !blank(readCell(row, name.id))) return false
  const code = codeColumnOf(table)
  if (code && !blank(readCell(row, code.id))) return false
  const levels = priceLevelsFor(table)
  return levels.every((l) => {
    const v = readCell(row, l.fieldId)
    return blank(v) || v === 0
  })
}

/** Why a line is a note: its name says so, or nothing on it says anything. null when it is not. */
export function noteOf(table: EntityDef, row: RowData): 'says' | 'empty' | null {
  if (table.role === 'join' || isRetired(table) || isDiscontinued(row)) return null
  const name = displayFieldOf(table)
  const said = name ? readCell(row, name.id) : null
  if (typeof said === 'string' && isNoteName(said)) return 'says'
  return isEmptyLine(table, row) ? 'empty' : null
}

/** WHERE A LINE CAME FROM in the workbook, off the list's own Source column: "Parts Maintenance!
 *  R2905" is line 2,905 of the Parts Maintenance tab. null where the list keeps no source. */
export function sourceOf(table: EntityDef, row: RowData): { tab: string; line: number } | null {
  const src = table.fields.find((f) => f.name.trim().toLowerCase() === 'source')
  const cell = src ? readCell(row, src.id) : null
  if (typeof cell !== 'string') return null
  const m = /^(.+?)!R(\d+)\b/.exec(cell.trim())
  return m ? { tab: m[1]!.trim(), line: Number(m[2]) } : null
}

export interface NoteLine {
  key: string
  rowId: string
  /** the line's name as the file writes it; '' when it has none */
  name: string
  /** what makes it a note */
  why: 'says' | 'empty'
  /** the heading it stands under (its Category or Series), or null */
  heading: string | null
  source: { tab: string; line: number } | null
}

export interface NoteGroup {
  key: string
  tableId: string
  tableName: string
  lines: NoteLine[]
}

const GROUP_WORDS = ['category', 'series', 'section']

/** Every note on sale, a group a list, in the list's own order. */
export function notesOnSale(world: ReviewWorld, meant: Meant = {}) {
  const groups: NoteGroup[] = []
  let left = 0
  const tables = Object.values(world.entities)
    .filter((e): e is EntityDef => !!e)
    .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id))
  for (const table of tables) {
    const nameCol = displayFieldOf(table)
    const groupCol = table.fields.find((f) => GROUP_WORDS.includes(f.name.trim().toLowerCase()))
    const lines: NoteLine[] = []
    for (const row of world.rowsByEntity[table.id] ?? []) {
      const why = noteOf(table, row)
      if (!why) continue
      const key = `note:${table.id}:${row.id}`
      if (meant[key]) {
        left += 1
        continue
      }
      const name = nameCol ? readCell(row, nameCol.id) : null
      const heading = groupCol ? readCell(row, groupCol.id) : null
      lines.push({
        key,
        rowId: row.id,
        name: typeof name === 'string' ? name.replace(/\s+/g, ' ').trim() : '',
        why,
        heading: typeof heading === 'string' && heading.trim() !== '' ? heading.trim() : null,
        source: sourceOf(table, row),
      })
    }
    if (lines.length > 0)
      groups.push({ key: `note:${table.id}`, tableId: table.id, tableName: table.name, lines })
  }
  return { groups, count: groups.reduce((n, g) => n + g.lines.length, 0), meant: left }
}
