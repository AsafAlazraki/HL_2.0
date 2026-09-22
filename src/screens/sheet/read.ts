/* ============================================================
   WHAT THE SHEET READS AND WHAT IT WRITES, as pure functions over the
   engine — no React, no DOM, no store. The screen calls these; the
   store applies what they build; nothing in `Sheet.tsx` phrases a
   sentence about the data that is not phrased here or in the engine.

   THE WRITES ARE BATCHES OF THE ENGINE'S OWN COMMANDS. A fill, a
   paste, a clear and a set-all are each many `updateCell`s and ONE
   step: `batch` in `domain/catalogue/commands.ts` refuses whole if any
   part refuses, skips the parts that change nothing, and hands back
   one inverse — so the UNDO the screen pins to the event undoes the
   whole fill, which is critique-m2's finding (4) answered by
   construction rather than by care.
   ============================================================ */
import {
  isImageValue,
  PAIR_RECOMMENDED_FIELD,
  primaryImage,
  rowLabel,
  type CellValue,
  type EntityDef,
  type FieldDef,
  type RowData,
} from '@/domain/model'
import { money } from '@/domain/money'
import { isCostColumn } from '@/domain/quote/pricing'
import { priceReadOf } from '@/domain/modules/read'
import { batch, updateCell, type CatalogueCommand } from '@/domain/catalogue/commands'
import {
  coerceCellText,
  normalizeRange,
  type Range,
  type ViewRow,
} from '@/domain/catalogue/table/core'
import { countLabel, leafNoun, type GroupNode } from '@/domain/catalogue/table/grouping'
import { cellPrintText, cellText } from '@/domain/catalogue/table/helpers'
import { bandOf, formatCell } from '@/domain/catalogue/views/columns'
import type { Held } from './pictures'

/* ---------------------------------------------------------- */
/* Sentences                                                   */
/* ---------------------------------------------------------- */

/** Where every table is listed. Said as an address, because the
 *  index screen is being built beside this one (docs/PLAN.md, M2) and
 *  an address is true before the screen at it is drawn. */
export const DATA_INDEX = '/data'

export const noTable = (id: string): string =>
  `No table on this sheet is called “${id}”. Every table is listed at ${DATA_INDEX}.`

export const NO_SHEET =
  'No price file is open in this browser, so there is no table to draw. Load the Master Price File and this sheet fills.'

export const NO_WAY_TO_THE_FILE =
  'This screen was handed no way to the door, so nothing was opened. The file is loaded at /sign-in.'

/** The word at a cost column's head — the dealer's own figure, shown
 *  on the dealer's own sheet and never on anything a customer sees. */
export const COST_WORD = 'cost'

export const costSentence = (n: number, of: number): string =>
  n === 0
    ? ''
    : `${n} of ${of} columns ${n === 1 ? 'is' : 'are'} the dealer’s own cost, marked “${COST_WORD}” at the head. ${n === 1 ? 'It shows' : 'They show'} on this sheet and never on a quote.`

/** Said on a picture cell whose address the ledger holds no copy of. */
export const HELD_AS_A_LINK = 'held as a link'

export const NO_PICTURE_FOR_MODEL = 'No picture is held for this model'

/** A hand refuses sideways scroll and says where the rest is. */
export const handSentence = (hidden: number): string =>
  hidden === 0
    ? ''
    : `The other ${hidden} ${hidden === 1 ? 'column is' : 'columns are'} in the record: press a row to read and change them.`

export const PICTURE_CELL_REFUSAL =
  'This column holds pictures, and a picture is a file rather than a word. The held copy is drawn here; the address behind it is on the record.'

/* ---------------------------------------------------------- */
/* Cells                                                       */
/* ---------------------------------------------------------- */

/** The text a cell PAINTS: money as money, a link by its name, a
 *  picture as nothing (it is drawn, not printed). */
export function paintOf(table: EntityDef, field: FieldDef, row: ViewRow): string {
  const value = row.values[field.id] ?? null
  if (field.type === 'image') return ''
  if (field.type === 'reference') return row.text[field.id] ?? ''
  const text = cellText(value, field)
  if (field.type === 'number') return cellPrintText(field, value, text)
  return formatCell(field, value, undefined, bandOf(table, field))
}

/** The text an editor is SEEDED with: the stored figure, never the
 *  painted one, so a person who typed 41340 sees 41340. */
export function seedOf(field: FieldDef, row: ViewRow): string {
  if (field.type === 'reference') return row.text[field.id] ?? ''
  return cellText(row.values[field.id] ?? null, field)
}

export type PictureCell = { kind: 'held'; held: Held } | { kind: 'link'; address: string } | null

/** What a picture cell draws: the held copy, or the words "held as a
 *  link" for an address the ledger holds no copy of, or nothing for
 *  an empty cell. */
export function pictureOf(
  row: ViewRow,
  field: FieldDef,
  heldCopy: (address: string | undefined) => Held | null,
): PictureCell {
  const v = row.values[field.id]
  if (v === undefined || v === null || !isImageValue(v)) return null
  const first = primaryImage(v)
  if (!first?.src) return null
  const held = heldCopy(first.src)
  return held ? { kind: 'held', held } : { kind: 'link', address: first.src }
}

export const isCost = (table: EntityDef, field: FieldDef): boolean => isCostColumn(table, field)

/* ---------------------------------------------------------- */
/* Writes                                                      */
/* ---------------------------------------------------------- */

export interface Write {
  command: CatalogueCommand
  /** how many cells the step would touch */
  cells: number
  /** what could not be written, each with the engine's own reason */
  skipped: string[]
}

const NOTHING: Write = { command: batch([]), cells: 0, skipped: [] }

const cellsWord = (n: number): string => `${n} ${n === 1 ? 'cell' : 'cells'}`

/** Empty every filled cell in the range, as one step. */
export function clearWrite(
  tableId: string,
  tableName: string,
  rows: readonly ViewRow[],
  fields: readonly FieldDef[],
  range: Range,
): Write {
  const n = normalizeRange(range)
  const commands: CatalogueCommand[] = []
  for (let r = n.r0; r <= n.r1; r += 1) {
    const row = rows[r]
    if (!row) continue
    for (let c = n.c0; c <= n.c1; c += 1) {
      const f = fields[c]
      if (!f || f.type === 'formula') continue
      const v = row.values[f.id]
      if (v === undefined || v === null || v === '') continue
      commands.push(updateCell(tableId, row.rowId, f.id, null))
    }
  }
  if (commands.length === 0) return NOTHING
  return {
    command: batch(commands, { said: `Cleared ${cellsWord(commands.length)} in ${tableName}.` }),
    cells: commands.length,
    skipped: [],
  }
}

/** Write the top row of the range down every row under it, column by
 *  column — Excel's Ctrl D, as one step with one way back. */
export function fillDownWrite(
  table: EntityDef,
  rows: readonly ViewRow[],
  fields: readonly FieldDef[],
  range: Range,
): Write {
  const n = normalizeRange(range)
  const top = rows[n.r0]
  if (!top || n.r1 === n.r0) return NOTHING
  const commands: CatalogueCommand[] = []
  const skipped: string[] = []
  for (let c = n.c0; c <= n.c1; c += 1) {
    const f = fields[c]
    if (!f || f.type === 'formula') continue
    if (f.type === 'image') {
      skipped.push(PICTURE_CELL_REFUSAL)
      continue
    }
    const value = top.values[f.id] ?? null
    for (let r = n.r0 + 1; r <= n.r1; r += 1) {
      const row = rows[r]
      if (!row) continue
      commands.push(updateCell(table.id, row.rowId, f.id, value))
    }
  }
  if (commands.length === 0) return { ...NOTHING, skipped }
  const from = fields[n.c0] ? seedOf(fields[n.c0]!, top) : ''
  const said =
    n.c0 === n.c1
      ? `Filled ${cellsWord(commands.length)} down with “${from}” in ${table.name}.`
      : `Filled ${cellsWord(commands.length)} down from the top row in ${table.name}.`
  return { command: batch(commands, { said }), cells: commands.length, skipped }
}

/** Set one column to one value across the given rows, as one step —
 *  the act the mixed set offers. */
export function setAllWrite(
  table: EntityDef,
  rows: readonly ViewRow[],
  field: FieldDef,
  rowIndexes: readonly number[],
  text: string,
  refLabels?: Map<string, string>,
): Write {
  const coerced = coerceCellText(text, field, refLabels)
  if (!coerced.ok) return { ...NOTHING, skipped: [coerced.reason] }
  const commands: CatalogueCommand[] = []
  for (const r of rowIndexes) {
    const row = rows[r]
    if (row) commands.push(updateCell(table.id, row.rowId, field.id, coerced.value))
  }
  if (commands.length === 0) return NOTHING
  const shown = coerced.value === null ? 'nothing' : `“${cellText(coerced.value, field)}”`
  return {
    command: batch(commands, {
      said: `${field.name} set to ${shown} on ${countLabel(commands.length, leafNoun(table))} in ${table.name}.`,
    }),
    cells: commands.length,
    skipped: [],
  }
}

/**
 * Paste a block of text at the active cell: each cell read through
 * `coerceCellText`, a cell that does not fit its column left as it
 * was and its reason kept, columns past the last omitted, rows past
 * the last omitted and counted — the contract Grist prints and this
 * sheet says in its own sentence.
 */
export function pasteWrite(
  table: EntityDef,
  rows: readonly ViewRow[],
  fields: readonly FieldDef[],
  at: { row: number; col: number },
  block: readonly (readonly string[])[],
  refLabelsOf: (field: FieldDef) => Map<string, string> | undefined,
): Write & { said: string } {
  const commands: CatalogueCommand[] = []
  const skipped: string[] = []
  let past = 0
  let beyond = 0
  block.forEach((line, i) => {
    const row = rows[at.row + i]
    if (!row) {
      past += 1
      return
    }
    line.forEach((text, j) => {
      const f = fields[at.col + j]
      if (!f) {
        beyond += 1
        return
      }
      if (f.type === 'formula' || f.type === 'image') {
        skipped.push(
          f.type === 'image' ? PICTURE_CELL_REFUSAL : `${f.name} is worked out from other columns.`,
        )
        return
      }
      const coerced = coerceCellText(text, f, refLabelsOf(f))
      if (!coerced.ok) {
        skipped.push(coerced.reason)
        return
      }
      commands.push(updateCell(table.id, row.rowId, f.id, coerced.value))
    })
  })
  const notes: string[] = []
  if (past > 0)
    notes.push(
      `${past} ${past === 1 ? 'row' : 'rows'} past the end of the table ${past === 1 ? 'was' : 'were'} not pasted`,
    )
  if (beyond > 0)
    notes.push(
      `${cellsWord(beyond)} past the last column ${beyond === 1 ? 'was' : 'were'} left out`,
    )
  if (skipped.length > 0)
    notes.push(
      `${cellsWord(skipped.length)} did not fit ${skipped.length === 1 ? 'its' : 'their'} column and ${skipped.length === 1 ? 'was' : 'were'} left as ${skipped.length === 1 ? 'it was' : 'they were'}`,
    )
  const tail = notes.length === 0 ? '' : ` ${notes.join('; ')}.`
  const said = `Pasted ${cellsWord(commands.length)} into ${table.name}.${tail}`
  if (commands.length === 0) return { ...NOTHING, skipped, said }
  return { command: batch(commands, { said }), cells: commands.length, skipped, said }
}

/* ---------------------------------------------------------- */
/* The mixed set                                               */
/* ---------------------------------------------------------- */

export interface MixedValue {
  text: string
  count: number
}

/** The distinct values one column holds across the given rows, most
 *  held first — Figma's "Selection colors", which lists each fill once
 *  with a count before anything is written. An empty cell is listed as
 *  its own value, because "3 of them are blank" is a fact a fill has
 *  to say before it fills. */
export function mixedSet(
  rows: readonly ViewRow[],
  field: FieldDef,
  rowIndexes: readonly number[],
): MixedValue[] {
  const counts = new Map<string, number>()
  for (const r of rowIndexes) {
    const row = rows[r]
    if (!row) continue
    const text = seedOf(field, row)
    counts.set(text, (counts.get(text) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([text, count]) => ({ text, count }))
    .toSorted((a, b) => b.count - a.count || a.text.localeCompare(b.text))
}

/* ---------------------------------------------------------- */
/* The gallery                                                 */
/* ---------------------------------------------------------- */

export interface Card {
  key: string
  /** the drawer's own value — a model, a category, a hull's label */
  name: string
  /** where this card sits: its branch's value, or '' on a one-level table */
  under: string
  /** "4 variants" / "266 products" / "3 pairings" */
  count: string
  /** the first held copy among its rows, or nothing */
  picture: Held | null
  /** true when the table has a picture column and this drawer holds
   *  an address the ledger has no copy of — so the card can say
   *  which of the two absences it is */
  linkedOnly: boolean
  /** "$2,631–$3,150" or a single figure, from the table's own price
   *  column, or null on a table with none */
  priceBand: string | null
  priceLabel: string | null
  /** on a pairing, the label of the row the price file recommends */
  recommended: string | null
  rows: ViewRow[]
}

const priceBandOf = (values: number[]): string | null => {
  if (values.length === 0) return null
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  return lo === hi ? money(lo) : `${money(lo)}–${money(hi)}`
}

/** One card per innermost drawer. A flat table is one card per row,
 *  so the unit is still the thing a dealer names. */
export function cardsOf(
  table: EntityDef,
  roots: readonly GroupNode[],
  view: readonly ViewRow[],
  heldCopy: (address: string | undefined) => Held | null,
  refLabel: (refEntityId: string | undefined, rowId: string) => string | undefined,
): Card[] {
  const noun = leafNoun(table)
  const image = table.fields.find((f) => f.type === 'image')
  const price = priceReadOf(table)
  const second =
    table.role === 'join' ? table.fields.filter((f) => f.type === 'reference')[1] : undefined

  const build = (key: string, name: string, under: string, rows: ViewRow[]): Card => {
    let picture: Held | null = null
    let linkedOnly = false
    if (image) {
      for (const row of rows) {
        const p = pictureOf(row, image, heldCopy)
        if (p?.kind === 'held') {
          picture = p.held
          break
        }
        if (p?.kind === 'link') linkedOnly = true
      }
    }
    const figures: number[] = []
    if (price) {
      for (const row of rows) {
        const v = row.values[price.field.id]
        if (typeof v === 'number' && Number.isFinite(v)) figures.push(v)
      }
    }
    let recommended: string | null = null
    if (second) {
      const starred = rows.find((r) => r.values[PAIR_RECOMMENDED_FIELD] === true)
      const id = starred?.values[second.id]
      if (typeof id === 'string') recommended = refLabel(second.refEntityId, id) ?? null
    }
    return {
      key,
      name,
      under,
      count: countLabel(rows.length, noun),
      picture,
      linkedOnly: picture === null && linkedOnly,
      priceBand: priceBandOf(figures),
      priceLabel: price?.label ?? null,
      recommended,
      rows,
    }
  }

  if (roots.length === 0) {
    return view.map((row) => build(row.rowId, rowLabel(table, asRow(table, row)), '', [row]))
  }
  const out: Card[] = []
  const walk = (nodes: readonly GroupNode[], under: string): void => {
    for (const n of nodes) {
      if (n.children.length > 0) walk(n.children, n.value)
      else out.push(build(n.key, n.value === '' ? '(unassigned)' : n.value, under, n.leaves))
    }
  }
  walk(roots, '')
  return out
}

/** A `RowData` shape for `rowLabel`, which reads values only. */
const asRow = (table: EntityDef, row: ViewRow): RowData => ({
  id: row.rowId,
  orgId: table.orgId,
  entityId: table.id,
  values: row.values as Record<string, CellValue>,
  createdAt: '',
  updatedAt: '',
})
