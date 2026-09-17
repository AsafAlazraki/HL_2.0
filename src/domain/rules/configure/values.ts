/* ============================================================
   Configure — values: keys, comparison, English formatting.

   The solver works over CELL VALUES, not rows, so it needs its own
   small value layer. It deliberately mirrored the semantics of the
   rule engine's comparison (numbers before dates before text, blanks
   never order, case-insensitive text) so a preview and a run can
   never disagree — but it did NOT import it, and carried a second
   copy of the ordering with a comment saying so.

   THAT SECOND COPY IS GONE, and this file calls '@/domain/compare'
   instead. Two copies of an ordering is two answers to the same
   question, and the plan names fixing it as a Milestone 0 repair:
   ONE measurement-aware comparator for the solver and the rule
   engine. What the solver gains by the move is the measurement: the
   old copy read `Number("10 HP")` as NaN and fell through to text,
   which is what once ordered "8" above "10 HP" and rejected 243 of
   2,519 pairings the workbook itself writes. A preview that prunes a
   value the run would keep is the exact disagreement the mirroring
   was for.

   ONE DIFFERENCE SURVIVES, and it is the important one: `compare`
   returns `undefined` when the two sides are genuinely different
   types. A three-valued answer is what lets the solver keep a value
   it cannot judge (rules fail open — CONFIG_FINDINGS.md §4.4)
   instead of pruning it away and blaming an innocent rule. The
   shared comparator reports the same fact as a `mismatch` sentence
   beside a `false`; the translation is one line at the bottom of
   `compare`.

   AND TWO CASES STAY HERE, because they are this layer's own and the
   shared comparator says so in its header: an empty image list reads
   as blank, and a non-empty one orders against nothing.

   Nothing here throws, for any input.
   ============================================================ */

import { compareValues } from '@/domain/compare'
import { isImageValue, imageCellText, type CellValue, type CompareOp } from '@/domain/model'

/** The key a value is indexed by inside `domains` and `blocked`.
 *  `String(v)` exactly as ConfigureState documents, so `true`, `4` and
 *  `'Salt'` all index. Image lists never enter an enumerable domain,
 *  so the array case never reaches here in practice. */
export const valueKey = (v: CellValue): string => String(v)

/** Read a key off a plain object without tripping over inherited
 *  members ('constructor', 'toString', …). */
export function ownKey<T>(bag: Record<string, T> | undefined, key: string): T | undefined {
  if (!bag) return undefined
  return Object.prototype.hasOwnProperty.call(bag, key) ? bag[key] : undefined
}

/** Write a key onto a plain object safely — `defineProperty` stores
 *  '__proto__' as an ordinary key instead of re-pointing the prototype. */
export function setKey<T>(bag: Record<string, T>, key: string, value: T): void {
  Object.defineProperty(bag, key, {
    value,
    enumerable: true,
    writable: true,
    configurable: true,
  })
}

/** Blank — nothing written. A rule whose right-hand side is blank is
 *  UNFINISHED, never "must equal nothing": the sentence editor persists
 *  `{ kind: 'literal', value: '' }` the moment a value box is cleared,
 *  and "must be blank" is written with the isEmpty operator instead. */
export function isBlank(v: CellValue | undefined): boolean {
  if (v === null || v === undefined) return true
  if (typeof v === 'string') return v.trim() === ''
  if (isImageValue(v)) return v.length === 0
  return false
}

function asStrictBoolean(v: CellValue): boolean | undefined {
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') {
    const t = v.trim().toLowerCase()
    if (t === 'true' || t === 'yes') return true
    if (t === 'false' || t === 'no') return false
  }
  return undefined
}

/** Forgiving truthiness — used only by the isTrue / isFalse operators,
 *  and total, so `isFalse` really is the negation of `isTrue`. */
export function asBoolean(v: CellValue): boolean {
  const b = asStrictBoolean(v)
  if (b !== undefined) return b
  if (typeof v === 'number') return v !== 0
  if (typeof v === 'string') return v.trim() !== '' && v.trim() !== '0'
  if (isImageValue(v)) return v.length > 0
  return false
}

function asText(v: CellValue): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  if (isImageValue(v)) return imageCellText(v)
  return String(v)
}

const normText = (v: CellValue): string => asText(v).trim().toLowerCase()

/**
 * Compare two cell values.
 *   true       the test holds
 *   false      the test definitely does not hold
 *   undefined  the two sides cannot be compared at all — the caller
 *              must treat this as "unknown", never as "no"
 *
 * The ordering itself is '@/domain/compare', shared with the rule
 * engine. Three things happen before it is asked, and each is this
 * layer's own rather than the comparator's:
 */
export function compare(op: CompareOp, left: CellValue, right: CellValue): boolean | undefined {
  /* 1. Text operators coerce both sides and can never be unknown —
        and they coerce an image list through `imageCellText`, which
        the shared comparator does not do because nothing on its side
        of the house holds pictures in a clause. */
  if (op === 'contains') return normText(left).includes(normText(right))
  if (op === 'startsWith') return normText(left).startsWith(normText(right))
  if (op === 'endsWith') return normText(left).endsWith(normText(right))

  /* 2. Blank. Missing data is a data condition, not a type error, and
        `isBlank` counts an EMPTY IMAGE LIST as blank, which is the
        first of the two image cases this layer carries. */
  const leftBlank = isBlank(left)
  const rightBlank = isBlank(right)
  if (leftBlank || rightBlank) {
    if (op === 'eq') return leftBlank && rightBlank
    if (op === 'neq') return !(leftBlank && rightBlank)
    return false
  }

  /* 3. The second image case: a non-empty image list is not orderable
        against anything. */
  if (isImageValue(left) || isImageValue(right)) return undefined

  /* Everything else is the one comparator. A `mismatch` is its way of
     saying the two sides are genuinely different types — the same
     fact the solver spells `undefined`, and the reason it keeps a
     value it cannot judge instead of pruning it. */
  const outcome = compareValues(op, left, right)
  return outcome.mismatch === undefined ? outcome.result : undefined
}

/** The operators that take no right-hand side, answered against one
 *  candidate value. Total — never unknown. */
export function testUnary(op: CompareOp, v: CellValue): boolean {
  switch (op) {
    case 'isEmpty':
      return isBlank(v)
    case 'notEmpty':
      return !isBlank(v)
    case 'isTrue':
      return asBoolean(v)
    case 'isFalse':
      return !asBoolean(v)
    default:
      return false
  }
}

/** Thousands separators without a locale, so the same input always
 *  produces the same sentence on every machine. */
function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return String(n)
  const s = String(Math.abs(n))
  if (s.includes('e') || s.includes('E')) return String(n)
  const dot = s.indexOf('.')
  const whole = dot === -1 ? s : s.slice(0, dot)
  const frac = dot === -1 ? '' : s.slice(dot)
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${n < 0 ? '-' : ''}${grouped}${frac}`
}

/** A value as a person would read it mid-sentence. */
export function formatValue(v: CellValue): string {
  if (v === null || v === undefined) return 'nothing'
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  if (typeof v === 'number') return formatNumber(v)
  if (isImageValue(v)) return v.length === 0 ? 'no images' : imageCellText(v)
  return String(v)
}
