/* ============================================================
   THE ONE COMPARATOR. Type-aware, measurement-aware, never throws.

   It lived inside the rule engine (`lib/rules/evaluate.ts`), and the
   solver carried a second, older copy of the same semantics in
   `lib/configure/values.ts` with a note saying it "deliberately
   mirrors" the first. Two copies of an ordering is two answers to the
   same question, and the plan names fixing that as a Milestone 0
   repair: ONE measurement-aware comparator for the solver and the
   rule engine. This file is it, and it sits at the root of the domain
   because it belongs to neither of them.

   WHAT THE ENGINE GETS is exactly what it had: `compareValues`
   returns `{ result, mismatch }` — false plus a sentence when the two
   sides are genuinely different types, so a run can warn in words
   instead of pretending "8" > "10 HP".

   WHAT THE SOLVER STILL NEEDS, for whoever wires it up: a THREE-VALUED
   view (its `compare` answers `undefined` for "cannot tell", which is
   what lets a rule fail open instead of pruning a value it cannot
   judge), and the two image cases its own layer carries — an empty
   image list reads as blank, and a non-empty one orders against
   nothing. `mismatch` is the seam for the first; the second has no
   test on this side of the house, so it is not invented here.

   Never throws, for any input.
   ============================================================ */

import type { CellValue, CompareOp } from '@/domain/model'

/* ---------------------------------------------------------- */
/* Value helpers                                              */
/* ---------------------------------------------------------- */

/** 'YYYY-MM-DD', optionally with a time part — ISO strings sort
 *  correctly as plain text, which is what makes date ordering free. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}(?:[T ].*)?$/

export function isEmptyValue(v: CellValue | undefined): boolean {
  return v === null || v === undefined || (typeof v === 'string' && v.trim() === '')
}

/* ============================================================
   A MEASUREMENT IS A NUMBER WITH ITS UNIT STILL ATTACHED.

   THE FAILURE THIS FIXES, MEASURED. A spreadsheet writes "10 HP" in a
   column of numbers, because a person typed the unit. `asNumber` says
   `Number("10 HP")` is NaN, so the comparison fell through to the last
   branch of `compareValues` and ordered the two sides as TEXT. On the
   seeded rule "Motor fitment — Highfield", running the real price file
   at full scale, that made "8" > "10 HP" — lexicographically true, and
   wrong about outboards — and it REJECTED 243 of the 2,519 pairings
   the workbook itself writes, silently, with nothing on screen to say
   why. Alphabetical order over a column of horsepower is not an
   opinion about the data; it is a bug wearing a result's clothes.

   WHAT IS PARSED, and nothing else: an optional sign, digits with
   optional thousands separators and decimals, then an OPTIONAL short
   unit token of letters, degree, per-cent, inch or foot marks. It is
   deliberately the same shape the seed generator parses when it reads
   a workbook (tools/seed/gen_lib.py `parse_num`), because these values
   arrive from exactly there.

   WHAT IS REFUSED, on purpose. "2 x 300 HP" — a twin rig — has no
   single number, so it does not parse, and a clause over it reports a
   mismatch rather than guessing. That is FITMENT_RULES.md F1's own
   position: Max HP has to be decomposed into total, rig count and
   per-engine AT IMPORT before a twin rig can be ordered, and inventing
   an order for it here would be answering a question nobody settled.

   TWO DIFFERENT UNITS DO NOT ORDER EITHER. "500 mm" against "20 in" is
   a mismatch with a sentence, not a silent false. A bare number orders
   against a measurement, because a column of unitless numbers compared
   with a column that spells its unit out is the ordinary case and the
   one that started this.
   ============================================================ */

interface Measure {
  n: number
  /** lower-cased unit token, or '' when the value carries none */
  unit: string
}

const MEASURE = /^([+-]?[\d,]*\.?\d+)\s*([A-Za-z°%"']{1,6})?$/

function asMeasure(v: CellValue): Measure | undefined {
  if (typeof v === 'number') return Number.isFinite(v) ? { n: v, unit: '' } : undefined
  if (typeof v !== 'string') return undefined
  const m = MEASURE.exec(v.trim())
  if (!m) return undefined
  const n = Number(m[1].replace(/,/g, ''))
  if (!Number.isFinite(n)) return undefined
  return { n, unit: (m[2] ?? '').toLowerCase() }
}

/** Two measurements are comparable when they agree on the unit, or when
 *  one of them does not name one. */
const commensurable = (a: Measure, b: Measure): boolean =>
  a.unit === b.unit || a.unit === '' || b.unit === ''

function asStrictBoolean(v: CellValue): boolean | undefined {
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') {
    const t = v.trim().toLowerCase()
    if (t === 'true' || t === 'yes') return true
    if (t === 'false' || t === 'no') return false
  }
  return undefined
}

/** Forgiving truthiness, used only by the isTrue / isFalse operators. */
export function asBoolean(v: CellValue): boolean {
  const b = asStrictBoolean(v)
  if (b !== undefined) return b
  if (typeof v === 'number') return v !== 0
  if (typeof v === 'string') return v.trim() !== '' && v.trim() !== '0'
  return false
}

function asText(v: CellValue): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  return String(v)
}

const normText = (v: CellValue): string => asText(v).trim().toLowerCase()

/** Type name used in mismatch warnings — deliberately value-free so the
 *  same mistake on 10 000 rows collapses to ONE warning. */
function typeName(v: CellValue): string {
  if (isEmptyValue(v)) return 'an empty cell'
  if (typeof v === 'number') return 'a number'
  if (typeof v === 'boolean') return 'a yes/no value'
  if (typeof v === 'string' && ISO_DATE.test(v.trim())) return 'a date'
  /* "a measurement" rather than "text", or the sentence a person reads
     when a plate reading "50 HP" meets a twin rig reading "2 x 300 HP"
     is "text cannot be compared with text", which explains nothing and
     is the kind of message that makes somebody distrust the whole
     screen. Named after the date test so an ISO string stays a date. */
  if (typeof v === 'string' && asMeasure(v) !== undefined) return 'a measurement'
  return 'text'
}

/* ---------------------------------------------------------- */
/* Comparison — type aware, never throws                      */
/* ---------------------------------------------------------- */

export interface CompareOutcome {
  result: boolean
  /** set when the two sides are genuinely different types; the caller
   *  turns it into a warning and treats the clause as not matching */
  mismatch?: string
}

function orderNumbers(op: CompareOp, a: number, b: number): boolean {
  switch (op) {
    case 'eq':
      return a === b
    case 'neq':
      return a !== b
    case 'gt':
      return a > b
    case 'gte':
      return a >= b
    case 'lt':
      return a < b
    case 'lte':
      return a <= b
    default:
      return false
  }
}

function orderStrings(op: CompareOp, a: string, b: string): boolean {
  switch (op) {
    case 'eq':
      return a === b
    case 'neq':
      return a !== b
    case 'gt':
      return a > b
    case 'gte':
      return a >= b
    case 'lt':
      return a < b
    case 'lte':
      return a <= b
    default:
      return false
  }
}

/**
 * Compare two cell values with a binary operator.
 * - number vs number (or numeric text, "10 HP" included) -> numeric
 * - date vs date -> ISO text order, which is chronological
 * - text vs text -> trimmed + case-insensitive
 * - yes/no vs yes/no -> equality only
 * - a blank on either side never orders, and only equals another blank
 * - genuinely mismatched types (a number vs non-numeric text) return
 *   false with a `mismatch` explanation — never an exception
 */
export function compareValues(op: CompareOp, left: CellValue, right: CellValue): CompareOutcome {
  /* text operators coerce both sides; they can never mismatch */
  if (op === 'contains' || op === 'startsWith' || op === 'endsWith') {
    const a = normText(left)
    const b = normText(right)
    if (op === 'contains') return { result: a.includes(b) }
    if (op === 'startsWith') return { result: a.startsWith(b) }
    return { result: a.endsWith(b) }
  }

  const leftEmpty = isEmptyValue(left)
  const rightEmpty = isEmptyValue(right)
  if (leftEmpty || rightEmpty) {
    /* missing data is a data condition, not a type error — no warning */
    if (op === 'eq') return { result: leftEmpty && rightEmpty }
    if (op === 'neq') return { result: !(leftEmpty && rightEmpty) }
    return { result: false }
  }

  const mismatch = (): CompareOutcome => ({
    result: false,
    mismatch: `${typeName(left)} cannot be compared with ${typeName(right)}`,
  })

  /* a real number on either side forces a numeric comparison */
  if (typeof left === 'number' || typeof right === 'number') {
    const a = asMeasure(left)
    const b = asMeasure(right)
    if (a === undefined || b === undefined) return mismatch()
    if (!commensurable(a, b)) {
      return {
        result: false,
        mismatch: `“${a.unit}” and “${b.unit}” are different units, so these cannot be put in order`,
      }
    }
    return { result: orderNumbers(op, a.n, b.n) }
  }

  /* a real boolean on either side forces an equality comparison */
  if (typeof left === 'boolean' || typeof right === 'boolean') {
    const a = asStrictBoolean(left)
    const b = asStrictBoolean(right)
    if (a === undefined || b === undefined) return mismatch()
    if (op === 'eq') return { result: a === b }
    if (op === 'neq') return { result: a !== b }
    return {
      result: false,
      mismatch: 'yes/no values cannot be put in order',
    }
  }

  /* both sides are strings from here */
  const ls = asText(left).trim()
  const rs = asText(right).trim()
  if (ISO_DATE.test(ls) && ISO_DATE.test(rs)) return { result: orderStrings(op, ls, rs) }

  const lm = asMeasure(ls)
  const rm = asMeasure(rs)
  if (lm !== undefined && rm !== undefined) {
    if (commensurable(lm, rm)) return { result: orderNumbers(op, lm.n, rm.n) }
    return {
      result: false,
      mismatch: `“${lm.unit}” and “${rm.unit}” are different units, so these cannot be put in order`,
    }
  }
  /* ONE SIDE IS A MEASUREMENT AND THE OTHER IS PROSE. Ordering those
     alphabetically is what put "8" above "10 HP"; it is refused with a
     sentence instead, and equality still answers, because "same text"
     is a question that has an answer whatever the two sides are. */
  if (lm !== undefined || rm !== undefined) {
    if (op === 'eq') return { result: ls.toLowerCase() === rs.toLowerCase() }
    if (op === 'neq') return { result: ls.toLowerCase() !== rs.toLowerCase() }
    return mismatch()
  }

  return { result: orderStrings(op, ls.toLowerCase(), rs.toLowerCase()) }
}
