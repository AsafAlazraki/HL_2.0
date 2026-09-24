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

   THE PRICE LIST'S WORDS ARE HERE TOO (2026-09-23): what a spine says
   in its lines, what a series band says once, what a picture's
   caption says it depicts. Each is a sentence made of the file's own
   column names and the file's own values, never a word about boats
   this file would have had to know.
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
import { batch, updateCell, type CatalogueCommand } from '@/domain/catalogue/commands'
import {
  coerceCellText,
  normalizeRange,
  type Range,
  type ViewRow,
} from '@/domain/catalogue/table/core'
import { countLabel, leafNoun, type LeafNoun } from '@/domain/catalogue/table/grouping'
import { cellPrintText, cellText } from '@/domain/catalogue/table/helpers'
import type { LeadFigure } from '@/domain/catalogue/table/priceList'
import type { Said } from '@/domain/catalogue/table/saidOnce'
import { bandOf, formatCell, rangePairs, splitUnit } from '@/domain/catalogue/views/columns'
import type { Held } from './pictures'

/* ---------------------------------------------------------- */
/* Sentences                                                   */
/* ---------------------------------------------------------- */

/** Where every table is listed — the pill's own Data door. */
export const DATA_INDEX = '/data'

export const noTable = (id: string): string =>
  `No table on this sheet is called “${id}”. Every table is listed behind the Data door.`

export const NO_SHEET =
  'No price file is open in this browser, so there is no table to draw. Load the Master Price File and this sheet fills.'

export const NO_WAY_TO_THE_FILE =
  'This screen was handed no way to the door, so nothing was opened. The file is loaded at the sign-in door.'

/** The word at a cost column's head — the dealer's own figure, shown
 *  on the dealer's own sheet and never on anything a customer sees. */
export const COST_WORD = 'cost'

/** Said on a picture whose address the ledger holds no copy of. */
export const HELD_AS_A_LINK = 'held as a link'

/**
 * THE PICTURES DOOR'S ONE REFUSAL, said once for the whole door, beside
 * the first list of names it is about. The critique counted 7 of
 * Roll-Up's 8 tiles as grey boxes each printing the same 22 words, 32 of
 * Highfield's 67 (built-critique-m2-close.md §9): the door that exists to
 * make the table visual was mostly one refusal, repeated. The reason is
 * the same for every name, so it is said once — with how many it is
 * about, and, where the file gives the maker's address, that this browser
 * holds no copy — and every later list carries only its heading.
 *
 * `across` is the door when its names stand on more than one shelf
 * (Stacer's 22 series): then the sentence counts the door, not the
 * shelf it happens to stand beside.
 */
export function noPictureSentence(
  bare: number,
  linked: number,
  across?: { of: number; noun: LeafNoun },
): string {
  if (bare === 0) return ''
  const unheld = bare - linked
  if (across) {
    const lead = `${bare} of the ${countLabel(across.of, across.noun)} here ${bare === 1 ? 'has' : 'have'} no picture.`
    if (linked === 0)
      return `${lead} The price file carries none for ${bare === 1 ? 'it' : 'them'}.`
    const which = linked === bare ? (bare === 1 ? 'it' : 'each') : `${linked} of them`
    const rest = unheld > 0 ? `; it carries none for the other ${unheld}` : ''
    return `${lead} The price file gives the maker’s web address for ${which}, and this browser holds no copy${rest}.`
  }
  const these = bare === 1 ? 'this one' : `these ${bare}`
  if (linked === 0) return `The price file carries no picture for ${these}.`
  if (linked === bare)
    return `The price file gives the maker’s web address for ${bare === 1 ? 'this one' : `each of ${these}`}, and this browser holds no copy.`
  return `The price file gives the maker’s web address for ${linked} of ${these}, and this browser holds no copy; it carries none for the other ${unheld}.`
}

/**
 * A door with no picture on it at all — Mackay's 125 trailers — is not a
 * wall of names under a Pictures heading: it says so once, in a sentence,
 * and offers the price list, which has every one of them.
 */
export function noPictureAtAll(
  of: number,
  linked: number,
  noun: LeafNoun,
): { say: string; why: string } {
  const say = `No picture is held here for any of these ${countLabel(of, noun)}.`
  if (linked === 0) return { say, why: 'The price file carries none.' }
  const which = linked === of ? 'each' : `${linked} of them`
  const rest = linked < of ? `; it carries none for the other ${of - linked}` : ''
  return {
    say,
    why: `The price file gives the maker’s web address for ${which}, and this browser holds no copy${rest}. The price list has every one of them.`,
  }
}

/** A hand refuses sideways scroll and says where the rest is. */
export const handSentence = (hidden: readonly string[]): string =>
  hidden.length === 0
    ? ''
    : `${listed(hidden)} and the other columns are in each row’s record — press a row to read and change them.`

export const PICTURE_CELL_REFUSAL =
  'This column holds pictures, and a picture is a file rather than a word. The held copy is drawn here; the address behind it is on the record.'

/** A name or two, then "and N more", so a sentence never runs on. */
function listed(names: readonly string[]): string {
  if (names.length <= 3) return names.join(', ')
  return `${names.slice(0, 3).join(', ')}, ${names.length - 3} more`
}

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

/** What a picture cell holds: the held copy, or the words "held as a
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
/* The price list's words                                      */
/* ---------------------------------------------------------- */

/** A fact said once, in the file's own column name: the name, the
 *  value, and the unit the column name carried — `Max Load 350 kg`,
 *  `Beam 1.37`, `Eng Configuration Tiller`. */
export function factText(table: EntityDef, field: FieldDef, text: string): string {
  const { base, unit } = splitUnit(field.name)
  const value =
    field.type === 'number' && text !== '' && Number.isFinite(Number(text))
      ? formatCell(field, Number(text), undefined, bandOf(table, field))
      : text
  /* a value that already names its column is said once: Highfield's
     "Boat Registration" column holds "Boat Registration Not Required",
     and the spine read "Boat Registration Boat Registration Not Required" */
  const named = value.toLowerCase().startsWith(base.trim().toLowerCase())
  if (named) return unit ? `${value} ${unit}` : value
  return unit ? `${base} ${value} ${unit}` : `${base} ${value}`
}

export interface FactLine {
  /** the section the facts are filed under, for its accent */
  sectionId: string
  accent: string | undefined
  text: string
  /** the same facts one by one, so a spine can lay them into its lines whole */
  facts: string[]
}

/** The unit a typed value ends in — `HP` of `4 HP` — and the value without it. */
const unit = (s: string): string => /\s(\S+)$/.exec(s)?.[1] ?? ''
const bare = (s: string): string => s.replace(/\s\S+$/, '')

/**
 * THE SPINE'S LINES: every fact said once at this drawer, grouped by
 * the section the file files it under, one line per section, in the
 * file's own order. A `Min X` and a `Max X` of one pair are read as
 * one range (`HP 4` where both say 4 HP, `HP 8–10` where they do not).
 * A cost is never on a spine — the head says the ones the table
 * shares, and the record carries the rest under their own word — and
 * an empty value says nothing.
 */
export function factLines(table: EntityDef, facts: readonly Said[]): FactLine[] {
  const by = new Map(facts.map((s) => [s.fieldId, s.text]))
  const pairs = rangePairs(table, { alsoText: true })
  const paired = new Map<string, string>()
  const skip = new Set<string>()
  for (const p of pairs) {
    const lo = by.get(p.min.id)
    const hi = by.get(p.max.id)
    if (lo === undefined || hi === undefined || lo === '' || hi === '') continue
    const same = unit(lo) !== '' && unit(lo) === unit(hi)
    const a = same ? bare(lo) : lo
    const b = same ? bare(hi) : hi
    const range = a === b ? a : `${a}–${b}`
    /* a pair whose label IS its unit ("Min HP" / "Max HP", typed "4 HP")
       says the unit once: `4 HP`, `8–10 HP` */
    const label =
      same && p.label.trim().toLowerCase() === unit(lo).toLowerCase() ? '' : `${p.label} `
    paired.set(p.min.id, `${label}${range}${same ? ` ${unit(lo)}` : ''}`)
    skip.add(p.max.id)
  }
  const sections = table.sections ?? []
  /* THE ORDER A SPINE SAYS THEM IN: the first section (what the thing
     is), then the sections the file itself marked with an accent (on a
     boat, the motor envelope), then the rest as the file lists them —
     so a spine with room for three lines says the length, the
     horsepower and the load before it says the hull's weight */
  const marked = sections.slice(1).filter((s) => s.accent !== undefined)
  const order = [
    ...sections.slice(0, 1).map((s) => s.id),
    ...marked.map((s) => s.id),
    ...sections
      .slice(1)
      .filter((s) => s.accent === undefined)
      .map((s) => s.id),
    '',
  ]
  const lines = new Map<string, string[]>()
  for (const f of table.fields) {
    const text = by.get(f.id)
    if (text === undefined || text === '' || skip.has(f.id)) continue
    if (f.type === 'image' || isCostColumn(table, f)) continue
    if (/^source$/i.test(f.name.trim()) || f.id.startsWith('__')) continue
    const key = f.sectionId && sections.some((s) => s.id === f.sectionId) ? f.sectionId : ''
    const list = lines.get(key) ?? []
    list.push(paired.get(f.id) ?? factText(table, f, text))
    lines.set(key, list)
  }
  const out: FactLine[] = []
  for (const id of order) {
    const list = lines.get(id)
    if (!list || list.length === 0) continue
    out.push({
      sectionId: id,
      accent: sections.find((s) => s.id === id)?.accent,
      text: list.join(' · '),
      facts: list,
    })
  }
  return out
}

/** The spine's price: `PVC $2,770 · HYP $4,500–$5,320`, or one figure
 *  or range where the rows have no leading word. */
/** One figure a card prints: the leading word it is for ("PVC"), or '', and the figure. */
export interface CardFigure {
  lead: string
  figure: string
}

/** The lit rung's figures one by one: "$2,770", "$4,500–$5,320". */
export const figuresOf = (figures: readonly LeadFigure[]): CardFigure[] =>
  figures.map((f) => ({
    lead: f.lead,
    figure: f.lo === f.hi ? money(f.lo) : `${money(f.lo)}–${money(f.hi)}`,
  }))

export function figuresText(figures: readonly LeadFigure[]): string {
  return figures
    .map((f) => {
      const figure = f.lo === f.hi ? money(f.lo) : `${money(f.lo)}–${money(f.hi)}`
      return f.lead === '' ? figure : `${f.lead} ${figure}`
    })
    .join(' · ')
}

/** What a series band says once about every row under it. */
export function bandSays(table: EntityDef, facts: readonly Said[]): string {
  return factLines(table, facts)
    .map((l) => l.text)
    .join(' · ')
}

/** The caption under a spine's render: which rows it depicts, so a
 *  picture beside four variants never passes for all four. */
export function pictureCaption(
  depicts: readonly string[],
  count: number,
  of: number,
  noun: LeafNoun,
): string {
  const which = depicts.filter((d) => d !== '').join(', ')
  const share = count === of ? `all ${countLabel(of, noun)}` : `${count} of ${countLabel(of, noun)}`
  return which === '' ? share : `${which} · ${share}`
}

/** How many of a series' models hold a render, said once on its band. */
export function picturesHeld(held: number, of: number, branch: LeafNoun): string {
  if (of === 0) return ''
  if (held === 0) return `no picture held for its ${branch.many}`
  return `pictures held for ${held} of ${countLabel(of, branch)}`
}

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
/* The Pictures door                                           */
/* ---------------------------------------------------------- */

export interface Card {
  key: string
  /** the model's name, or the row's own on a table whose rows are the models */
  name: string
  /** where this card sits: its series, or '' */
  under: string
  /** "4 variants" — or nothing, on a card that is one row */
  count: string
  picture: Held | null
  /** what the picture depicts, said under it */
  caption: string
  /** true when the file carries an address this browser holds no copy of */
  linkedOnly: boolean
  /** the lit rung's figures, per leading word where there is one */
  price: string
  /** the same figures one by one, so a card can set the word apart from the figure */
  figures: CardFigure[]
  /** the row a press opens on: the one the picture depicts, or the first */
  rowId: string
  /** on a pairing, the label of the row the price file recommends */
  recommended: string | null
}

/** A `RowData` shape for `rowLabel`, which reads values only. */
export const asRow = (table: EntityDef, row: ViewRow): RowData => ({
  id: row.rowId,
  orgId: table.orgId,
  entityId: table.id,
  values: row.values as Record<string, CellValue>,
  createdAt: '',
  updatedAt: '',
})

/** On a pairing, the label of the row the price file recommends. */
export function recommendedOf(
  table: EntityDef,
  rows: readonly ViewRow[],
  refLabel: (refEntityId: string | undefined, rowId: string) => string | undefined,
): string | null {
  const second =
    table.role === 'join' ? table.fields.filter((f) => f.type === 'reference')[1] : undefined
  if (!second) return null
  const starred = rows.find((r) => r.values[PAIR_RECOMMENDED_FIELD] === true)
  const id = starred?.values[second.id]
  return typeof id === 'string' ? (refLabel(second.refEntityId, id) ?? null) : null
}

/** A row's own name, for a card that is one row. */
export const nameOfRow = (table: EntityDef, row: ViewRow): string =>
  rowLabel(table, asRow(table, row))
