/* ============================================================
   A MOVE ON MANY FIGURES AT ONCE — a maker's rise of 4 %, $100 more
   on every hull, every Trade rounded to the nearest $10 — worked out
   line by line before anything is written, so the plate can show each
   figure before and after, and then written as ONE batch of the
   engine's own `updateCell`s: one step, one Undo (the judge's G10).

   Pure. It reads the figures the lines carry and the move a person
   typed; it never reaches for a rate the file does not hold, and a
   line with no figure in the column is left as it is and counted.

   NOT A PROMOTION AND NOT A LEVEL. LATER keeps time-bounded overrides
   and landed cost by exchange rate deferred; Prices (/levels) keeps
   Trade as a share of Cash. This writes figures into the price file,
   exactly as typing them would, and Undo takes them all back.
   ============================================================ */
import type { CellValue, EntityDef, FieldDef } from '@/domain/model'
import { batch, updateCell, type CatalogueCommand } from '@/domain/catalogue/commands'
import type { ViewRow } from './core'
import { leadOf, type LeadSplit } from './priceList'

export type Move =
  /** by a share of itself: 4 is a rise of 4 %, −2.5 a fall */
  | { kind: 'percent'; by: number }
  /** by an amount: 100 is $100 more, −50 is $50 less */
  | { kind: 'add'; by: number }
  /** to the nearest multiple: 10 rounds $2,883 to $2,880 */
  | { kind: 'round'; to: number }
  /** to its twin's figure and an amount more: Hypalon at its PVC line + $2,500 (`planTwin`) */
  | { kind: 'twin'; base: string; by: number }

export type MoveKind = Move['kind']

/** To the cent, as the currency is held: a 4 % rise on $2,770 is $2,880.80. */
const cents = (n: number): number => Math.round(n * 100) / 100

export function moved(value: number, move: Move): number {
  switch (move.kind) {
    case 'percent':
      return cents(value * (1 + move.by / 100))
    case 'add':
      return cents(value + move.by)
    case 'round':
      return cents(Math.round(value / move.to) * move.to)
    case 'twin':
      /* a twin's figure is read off its twin, line by line (`planTwin`), never off itself */
      return cents(value)
  }
}

/**
 * What a person typed, read as a move of the kind they chose — or the sentence why not. A
 * percentage under −100 would take a price below nothing, and rounding to nothing is no rounding.
 */
export function readMove(kind: MoveKind, typed: string, base = ''): Move | { refused: string } {
  const text = typed
    .replace(/[$,%\s]/g, '')
    .replace(/^\+/, '')
    .replace(/^−/, '-')
  if (text === '') return { refused: 'Type how much first.' }
  const n = Number(text)
  if (!Number.isFinite(n)) return { refused: `“${typed.trim()}” is not a number.` }
  if (kind === 'percent') {
    if (n === 0) return { refused: 'A change of 0 % changes nothing.' }
    if (n <= -100) return { refused: 'A fall of 100 % or more would take every price to nothing.' }
    return { kind, by: n }
  }
  if (kind === 'add') {
    if (n === 0) return { refused: 'Adding $0 changes nothing.' }
    return { kind, by: n }
  }
  /* $0 more is a figure too: Hypalon at exactly its PVC line's price */
  if (kind === 'twin') return { kind, base, by: n }
  if (n <= 0) return { refused: 'Round to an amount above $0, such as 10.' }
  return { kind, to: n }
}

export interface MovedLine {
  rowId: string
  before: number
  after: number
}

export interface MovePlan {
  lines: MovedLine[]
  /** lines with no figure in the column, left as they are */
  blank: number
  /** lines the move leaves where they were (already on the round figure) */
  same: number
  /** lines the move would take below nothing, which it refuses whole */
  negative: number
}

const figure = (v: CellValue | undefined): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null

/** Every line's figure before and after, before anything is written. */
export function planMove(
  rows: readonly ViewRow[],
  field: FieldDef,
  rowIndexes: readonly number[],
  move: Move,
): MovePlan {
  const lines: MovedLine[] = []
  let blank = 0
  let same = 0
  let negative = 0
  for (const i of rowIndexes) {
    const row = rows[i]
    if (!row) continue
    const before = figure(row.values[field.id])
    if (before === null) {
      blank += 1
      continue
    }
    const after = moved(before, move)
    if (after < 0) negative += 1
    if (after === before) {
      same += 1
      continue
    }
    lines.push({ rowId: row.rowId, before, after })
  }
  return { lines, blank, same, negative }
}

const plain = new Intl.NumberFormat('en-AU', { maximumFractionDigits: 2 })

/** The move as the step line says it: "raised 4 %", "$100 added", "rounded to the nearest $10". */
export function moveSaid(move: Move): string {
  switch (move.kind) {
    case 'percent':
      return move.by > 0
        ? `raised ${plain.format(move.by)} %`
        : `lowered ${plain.format(-move.by)} %`
    case 'add':
      return move.by > 0
        ? `$${plain.format(move.by)} added`
        : `$${plain.format(-move.by)} taken off`
    case 'round':
      return `rounded to the nearest $${plain.format(move.to)}`
    case 'twin':
      return move.by === 0
        ? `set to its ${move.base} line`
        : move.by > 0
          ? `set to its ${move.base} line + $${plain.format(move.by)}`
          : `set to its ${move.base} line − $${plain.format(-move.by)}`
  }
}

/**
 * WHY A MOVE CANNOT BE WRITTEN, SAID BEFORE THE PRESS (the verifier: a −$6,000 move previewed
 * "$2,770 → −$3,230" beside a live "Change 4", and said no only after it was pressed). The same
 * reason `moveWrite` gives after a press, in the tense of a plan — or null where it can be.
 */
export function planRefusal(plan: MovePlan): string | null {
  if (plan.negative === 0) return null
  return `${plan.negative} ${plan.negative === 1 ? 'line' : 'lines'} would go below $0, so this change cannot be made. Nothing is written while any would.`
}

/* ---------------------------------------------------------- */
/* A line from its twin                                        */
/* ---------------------------------------------------------- */

const escape = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * THE SAME LINE IN ANOTHER MATERIAL: "HYP B-G-B" is "PVC B-G-B", "Open (HYP) LG-W-DG" is "Open
 * (PVC) LG-W-DG" — the leading word the price list already reads (`leadOf`) swapped for `base`
 * where it stands, and nothing else touched. '' where the text names no leading word.
 */
export function twinText(split: LeadSplit, text: string, base: string): string {
  const lead = leadOf(split, text)
  if (lead === '') return ''
  if (lead === base) return text.trim()
  const m = new RegExp(`(^|[\\s(])${escape(lead)}(?=$|[\\s)])`).exec(text)
  if (!m) return ''
  const at = m.index + m[1]!.length
  return `${text.slice(0, at)}${base}${text.slice(at + lead.length)}`.trim()
}

export interface TwinPlan extends MovePlan {
  /** lines in the base material already: they are what the others are read from */
  based: number
  /** lines with no twin in the base material, or one with no figure: left as they are */
  alone: number
}

/**
 * HYPALON AT ITS PVC LINE AND AN AMOUNT MORE (the judge's missing arithmetic): each selected line
 * that is not in the base material takes its twin's figure plus `by` — its twin being the line of
 * the same model, the same colourway, in the base material (`twinOf`, which the screen builds over
 * the whole list). A line in the base material, or one with no twin to read, is left as it is and
 * counted; so is one already there.
 */
export function planTwin(
  rows: readonly ViewRow[],
  field: FieldDef,
  rowIndexes: readonly number[],
  move: { kind: 'twin'; base: string; by: number },
  twinOf: (row: ViewRow) => ViewRow | 'base' | undefined,
): TwinPlan {
  const lines: MovedLine[] = []
  let blank = 0
  let same = 0
  let negative = 0
  let based = 0
  let alone = 0
  for (const i of rowIndexes) {
    const row = rows[i]
    if (!row) continue
    const twin = twinOf(row)
    if (twin === 'base') {
      based += 1
      continue
    }
    const from = twin ? figure(twin.values[field.id]) : null
    if (from === null) {
      alone += 1
      continue
    }
    const before = figure(row.values[field.id])
    if (before === null) {
      blank += 1
      continue
    }
    const after = cents(from + move.by)
    if (after < 0) negative += 1
    if (after === before) {
      same += 1
      continue
    }
    lines.push({ rowId: row.rowId, before, after })
  }
  return { lines, blank, same, negative, based, alone }
}

/**
 * The plan written: one batch, one step, one way back — or the sentence why not. A move that
 * would take any line below nothing is refused whole, because half a price rise is a price list
 * nobody chose.
 */
export function moveWrite(
  table: EntityDef,
  field: FieldDef,
  plan: MovePlan,
  move: Move,
  noun: { one: string; many: string },
): { command: CatalogueCommand; cells: number } | { refused: string } {
  if (plan.negative > 0)
    return {
      refused: `${plan.negative} ${plan.negative === 1 ? 'line' : 'lines'} would go below $0, so nothing was changed.`,
    }
  if (plan.lines.length === 0)
    return { refused: `No ${field.name} here would change, so nothing was written.` }
  const n = plan.lines.length
  const said = `${field.name} ${moveSaid(move)} on ${n} ${n === 1 ? noun.one : noun.many} in ${table.name}.`
  return {
    command: batch(
      plan.lines.map((l) => updateCell(table.id, l.rowId, field.id, l.after)),
      { said },
    ),
    cells: n,
  }
}
