/* ============================================================
   WHAT THE SHEET CAN BE ASKED, AND WHAT IT CHECKS — pure, over the
   rows the price list is drawing. No React, no store, no DOM.

   THE ADMIN'S WEEKLY QUESTIONS ARE ABOUT VALUES, NOT WORDS (the sheet's
   judge, 2026-11-03, G9): which lines have no Trade price, which are
   discontinued, which Cash is under the landed cost, which have no
   picture, every Max HP of 150 or more, every line changed since the
   file came in. The finder matches words; these match values. Each is
   one token in the address (`?only=`), so a question asked is a link
   that can be kept, and clearing it restores exactly what the file
   says — a filter is a pair of spectacles and writes nothing.

   A RULE SHOWN IS MEASURED FROM THE FILE. "Cash is at or above Trade"
   is not a belief about boats: it is counted over the lines of this
   list that carry both figures, and it is offered as a question, and
   used as a warning, only where the file itself keeps it on nine lines
   in ten or more — with its numerator and its denominator said beside
   the rule: "on 588 of 588 lines with both". A list where Trade sits above
   Cash as often as below gets no such question and no such warning.

   WHICH COST A PRICE IS HELD AGAINST: the cost column filed in the
   price's own section where the file files one there (Parts' Sell
   beside its CTD, Sell inc Install beside Total CTD, Yamaha's Sell
   Price beside its Total CTD), else the list's one total cost — the
   landed or total CTD, by the file's own column name.
   ============================================================ */
import type { CellValue, EntityDef, FieldDef } from '@/domain/model'
import type { ViewRow } from './core'

/* ---------------------------------------------------------- */
/* The tokens                                                  */
/* ---------------------------------------------------------- */

export type Only =
  /** the column has nothing in it */
  | { kind: 'empty'; fieldId: string }
  /** a yes/no column says yes — Discontinued */
  | { kind: 'yes'; fieldId: string }
  /** one figure on the line is under another on the same line */
  | { kind: 'under'; fieldId: string; than: string }
  /** a figure compared with a number a person typed */
  | { kind: 'at-least' | 'at-most'; fieldId: string; value: number }
  /** the line differs from the price file as it came */
  | { kind: 'changed' }

const SEP = '~'

export function onlyToken(o: Only): string {
  switch (o.kind) {
    case 'empty':
    case 'yes':
      return `${o.kind}${SEP}${o.fieldId}`
    case 'under':
      return `under${SEP}${o.fieldId}${SEP}${o.than}`
    case 'at-least':
    case 'at-most':
      return `${o.kind}${SEP}${o.fieldId}${SEP}${o.value}`
    case 'changed':
      return 'changed'
  }
}

/** One token read back — or null where it names no column of this table, or is not a shape
 *  this screen writes. A search param is something somebody typed. */
export function readOnlyToken(token: string, table: EntityDef): Only | null {
  const parts = token.split(SEP)
  const has = (id: string | undefined): id is string =>
    id !== undefined && table.fields.some((f) => f.id === id)
  const [kind, a, b] = parts
  if (kind === 'changed' && parts.length === 1) return { kind: 'changed' }
  if ((kind === 'empty' || kind === 'yes') && parts.length === 2 && has(a))
    return { kind, fieldId: a }
  if (kind === 'under' && parts.length === 3 && has(a) && has(b) && a !== b)
    return { kind, fieldId: a, than: b }
  if ((kind === 'at-least' || kind === 'at-most') && parts.length === 3 && has(a)) {
    const value = Number(b)
    if (b !== undefined && b.trim() !== '' && Number.isFinite(value))
      return { kind, fieldId: a, value }
  }
  return null
}

/** The address's `only`, read: comma-joined tokens, each one kept only where it reads. */
export function readOnly(param: string | undefined, table: EntityDef): Only[] {
  if (!param) return []
  const out: Only[] = []
  const seen = new Set<string>()
  for (const raw of param.split(',')) {
    const o = readOnlyToken(raw.trim(), table)
    if (!o) continue
    const key = onlyToken(o)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(o)
  }
  return out
}

export const joinOnly = (list: readonly Only[]): string | undefined =>
  list.length === 0 ? undefined : list.map(onlyToken).join(',')

/* ---------------------------------------------------------- */
/* Reading a value                                              */
/* ---------------------------------------------------------- */

const LEADING_FIGURE = /^\s*(-?\d[\d,]*(?:\.\d+)?)/

/** A figure on the line: a number, or a text that opens on one ("250 HP" is 250, "2 x 150HP"
 *  is 2 — the file's own first figure, which is why a comparison names its column). */
export function figureIn(value: CellValue | undefined): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string') return null
  const m = LEADING_FIGURE.exec(value)
  if (!m) return null
  const n = Number(m[1]!.replace(/,/g, ''))
  return Number.isFinite(n) ? n : null
}

export function isEmptyValue(value: CellValue | undefined): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  return false
}

/* ---------------------------------------------------------- */
/* Applying                                                    */
/* ---------------------------------------------------------- */

export interface OnlyContext {
  /** the rows that differ from the price file as it came; absent where the file is not here */
  changed?: ReadonlySet<string>
}

export function keeps(row: ViewRow, o: Only, ctx: OnlyContext = {}): boolean {
  switch (o.kind) {
    case 'empty':
      return isEmptyValue(row.values[o.fieldId])
    case 'yes':
      return row.values[o.fieldId] === true
    case 'under': {
      const a = figureIn(row.values[o.fieldId])
      const b = figureIn(row.values[o.than])
      return a !== null && b !== null && a < b
    }
    case 'at-least':
    case 'at-most': {
      const a = figureIn(row.values[o.fieldId])
      if (a === null) return false
      return o.kind === 'at-least' ? a >= o.value : a <= o.value
    }
    case 'changed':
      return ctx.changed?.has(row.rowId) ?? false
  }
}

/** Every question at once: a line stays when it answers all of them. */
export function applyOnly(
  rows: readonly ViewRow[],
  list: readonly Only[],
  ctx: OnlyContext = {},
): ViewRow[] {
  if (list.length === 0) return [...rows]
  return rows.filter((r) => list.every((o) => keeps(r, o, ctx)))
}

/* ---------------------------------------------------------- */
/* What each question says                                     */
/* ---------------------------------------------------------- */

const nameOf = (table: EntityDef, id: string): string =>
  table.fields.find((f) => f.id === id)?.name.trim() ?? id

const plain = new Intl.NumberFormat('en-AU', { maximumFractionDigits: 2 })

/** A question as a person asks it: "No Trade", "Discontinued", "Cash under Landed Hull Cost",
 *  "Max HP at least 150", "Changed here". */
export function onlySaid(table: EntityDef, o: Only): string {
  switch (o.kind) {
    case 'empty': {
      const f = table.fields.find((x) => x.id === o.fieldId)
      return f?.type === 'image' ? 'No picture' : `No ${nameOf(table, o.fieldId)}`
    }
    case 'yes':
      return nameOf(table, o.fieldId)
    case 'under':
      return `${nameOf(table, o.fieldId)} under ${nameOf(table, o.than)}`
    case 'at-least':
      return `${nameOf(table, o.fieldId)} at least ${plain.format(o.value)}`
    case 'at-most':
      return `${nameOf(table, o.fieldId)} at most ${plain.format(o.value)}`
    case 'changed':
      return 'Changed here'
  }
}

/* ---------------------------------------------------------- */
/* The rules the file keeps                                    */
/* ---------------------------------------------------------- */

/** A price held at or above another figure on the same line — measured, never assumed. */
export interface KeptRule {
  fieldId: string
  than: string
  /** `than` is a cost column, the dealer's own */
  cost: boolean
  /** lines carrying both figures where the price is at or above it */
  holds: number
  /** lines carrying both figures */
  of: number
}

/** The share of lines a rule must hold on before the sheet offers it or warns by it. */
export const RULE_HOLDS = 0.9
/** The fewest lines with both figures a rule is measured over. */
export const RULE_FLOOR = 3

const TOTAL_COST = [/^total ctd$/i, /landed/i, /^act ctd$/i, /^nett ctd$/i, /^kit ctd$/i, /^ctd$/i]

/** The cost a price is held against: one filed in its own section, else the list's total. */
export function costFor(
  table: EntityDef,
  price: FieldDef,
  isCost: (f: FieldDef) => boolean,
): FieldDef | undefined {
  const costs = table.fields.filter((f) => f.type === 'number' && isCost(f))
  const named = (f: FieldDef): number => {
    const i = TOTAL_COST.findIndex((re) => re.test(f.name.trim()))
    return i < 0 ? TOTAL_COST.length : i
  }
  const ranked = (list: FieldDef[]): FieldDef | undefined =>
    list.filter((f) => named(f) < TOTAL_COST.length).toSorted((a, b) => named(a) - named(b))[0]
  const beside = price.sectionId
    ? ranked(costs.filter((f) => f.sectionId === price.sectionId))
    : undefined
  return beside ?? ranked(costs)
}

function measure(
  rows: readonly ViewRow[],
  fieldId: string,
  than: string,
  skip?: string,
): { holds: number; of: number } {
  let holds = 0
  let of = 0
  for (const r of rows) {
    if (r.rowId === skip) continue
    const a = figureIn(r.values[fieldId])
    const b = figureIn(r.values[than])
    if (a === null || b === null) continue
    of += 1
    if (a >= b) holds += 1
  }
  return { holds, of }
}

/**
 * THE RULES THIS LIST KEEPS: each declared price against its cost, and the first price against
 * the next rung of the ladder — kept only where the file holds it on nine lines in ten or more,
 * over three lines or more. `skip` leaves one line out of the count: the one being changed, so a
 * rule is measured on the rest of the file and never on the figure it is about to judge.
 */
export function keptRules(
  table: EntityDef,
  rows: readonly ViewRow[],
  prices: readonly { fieldId: string }[],
  isCost: (f: FieldDef) => boolean,
  skip?: string,
): KeptRule[] {
  const out: KeptRule[] = []
  const field = (id: string): FieldDef | undefined => table.fields.find((f) => f.id === id)
  const keep = (fieldId: string, than: string, cost: boolean): void => {
    if (fieldId === than || out.some((r) => r.fieldId === fieldId && r.than === than)) return
    const m = measure(rows, fieldId, than, skip)
    if (m.of >= RULE_FLOOR && m.holds >= m.of * RULE_HOLDS) out.push({ fieldId, than, cost, ...m })
  }
  for (const level of prices) {
    const f = field(level.fieldId)
    if (!f) continue
    const c = costFor(table, f, isCost)
    if (c) keep(f.id, c.id, true)
  }
  /* the first price against the next rung only — Cash above Trade — and not every rung after it:
     a warranty figure under Cash is not a thing a dealer is warned of (measured on the built
     sheet, 2026-11-03: three warnings stood under one Cash, the third about Warranty) */
  const [first, next] = prices
  if (first && next) keep(first.fieldId, next.fieldId, false)
  return out
}

/** "on 588 of 588 lines with both" — the measurement, said. */
export const ruleSaid = (r: KeptRule): string =>
  `on ${r.holds.toLocaleString('en-AU')} of ${r.of.toLocaleString('en-AU')} lines with both`

/* ---------------------------------------------------------- */
/* The warning before a price is kept                          */
/* ---------------------------------------------------------- */

export interface PriceWarning {
  rule: KeptRule
  /** the figure written, and the one it is under */
  value: number
  than: number
}

/**
 * WHAT A NEW FIGURE BREAKS (the judge's G11): Cash $850 written on a line whose Landed Hull Cost
 * is $1,671.43 and whose Trade is $2,631. Each comparison is a rule the rest of the file keeps,
 * measured without this line; a figure at or above each says nothing. A warning, never a
 * refusal: the dealer may mean it, and the step line offers Undo beside it.
 */
export function warningsFor(
  table: EntityDef,
  rows: readonly ViewRow[],
  prices: readonly { fieldId: string }[],
  isCost: (f: FieldDef) => boolean,
  rowId: string,
  fieldId: string,
  value: CellValue,
): PriceWarning[] {
  const v = figureIn(value)
  const row = rows.find((r) => r.rowId === rowId)
  if (v === null || !row) return []
  const out: PriceWarning[] = []
  for (const rule of keptRules(table, rows, prices, isCost, rowId)) {
    if (rule.fieldId !== fieldId) continue
    const than = figureIn(row.values[rule.than])
    if (than !== null && v < than) out.push({ rule, value: v, than })
  }
  /* the cost first: selling under cost is the one that loses money */
  return out.toSorted((a, b) => Number(b.rule.cost) - Number(a.rule.cost))
}

/* ---------------------------------------------------------- */
/* The questions a list can be asked                            */
/* ---------------------------------------------------------- */

export interface Question {
  only: Only
  said: string
  /** how many of the lines asked over answer it */
  count: number
  /** the measurement behind a rule's question, or '' */
  rule: string
}

/**
 * THE QUESTIONS THIS LIST CAN ANSWER, each counted over its lines: a price missing, a yes/no the
 * file marks (Discontinued, Obsolete), a kept rule broken, a picture missing, a line changed
 * here. Nothing is offered that the list's own columns cannot answer.
 */
export function questionsOf(
  table: EntityDef,
  rows: readonly ViewRow[],
  prices: readonly { fieldId: string }[],
  isCost: (f: FieldDef) => boolean,
  ctx: OnlyContext = {},
): Question[] {
  const out: Question[] = []
  const ask = (only: Only, rule = ''): void => {
    const count = rows.filter((r) => keeps(r, only, ctx)).length
    out.push({ only, said: onlySaid(table, only), count, rule })
  }
  for (const level of prices) {
    if (table.fields.some((f) => f.id === level.fieldId))
      ask({ kind: 'empty', fieldId: level.fieldId })
  }
  for (const f of table.fields) {
    if (f.type === 'boolean' && /discontinued|obsolete|superseded/i.test(f.name))
      ask({ kind: 'yes', fieldId: f.id })
  }
  for (const rule of keptRules(table, rows, prices, isCost)) {
    ask({ kind: 'under', fieldId: rule.fieldId, than: rule.than }, ruleSaid(rule))
  }
  const image = table.fields.find((f) => f.type === 'image')
  if (image) ask({ kind: 'empty', fieldId: image.id })
  if (ctx.changed) ask({ kind: 'changed' })
  return out
}

/** The columns a figure can be compared on: numbers, and texts that open on a figure on most
 *  lines ("250 HP"). */
export function comparable(table: EntityDef, rows: readonly ViewRow[]): FieldDef[] {
  return table.fields.filter((f) => {
    if (f.type === 'number') return true
    if (f.type !== 'text') return false
    let filled = 0
    let figures = 0
    for (const r of rows) {
      const v = r.values[f.id]
      if (isEmptyValue(v)) continue
      filled += 1
      if (figureIn(v) !== null) figures += 1
    }
    return filled >= RULE_FLOOR && figures * 10 >= filled * 9
  })
}
