/* ============================================================
   io/beside — A SAVED COPY SET BESIDE THIS COMPUTER, BEFORE IT IS
   BROUGHT BACK.

   The shelf's judge (item 9): the restore page said the copy's quote
   "joins them" when that quote was already here, and never compared
   the copy with this computer. This measures both: the copy's price
   list against this one line by line (the same, different, here only,
   in the copy only), and the copy's quotes split into those new here
   and those already here — a quote already here is left exactly as it
   is (`src/screens/shelf/acts.ts`, `bringBack`).

   Pure.
   ============================================================ */
import type { QuoteDef, RowData } from '@/domain/model'

export interface PriceListsBeside {
  /** lines on both, every figure and word alike */
  same: number
  /** lines on both that read differently */
  differ: number
  /** lines this computer has and the copy does not */
  hereOnly: number
  /** lines the copy has and this computer does not */
  copyOnly: number
}

const valuesOf = (r: RowData): string =>
  JSON.stringify(
    Object.keys(r.values)
      .toSorted()
      .map((k) => [k, r.values[k]]),
  )

/** The two price lists, line by line, by the line's own id; `skip` names lists that are not the
 *  price list (Customers). */
export function priceListsBeside(
  here: Readonly<Record<string, readonly RowData[]>>,
  copy: Readonly<Record<string, readonly RowData[]>>,
  skip: ReadonlySet<string> = new Set(),
): PriceListsBeside {
  const mine = new Map<string, string>()
  for (const [table, rows] of Object.entries(here)) {
    if (skip.has(table)) continue
    for (const r of rows) mine.set(`${table}:${r.id}`, valuesOf(r))
  }
  let same = 0
  let differ = 0
  let copyOnly = 0
  const seen = new Set<string>()
  for (const [table, rows] of Object.entries(copy)) {
    if (skip.has(table)) continue
    for (const r of rows) {
      const key = `${table}:${r.id}`
      seen.add(key)
      const at = mine.get(key)
      if (at === undefined) copyOnly += 1
      else if (at === valuesOf(r)) same += 1
      else differ += 1
    }
  }
  let hereOnly = 0
  for (const key of mine.keys()) if (!seen.has(key)) hereOnly += 1
  return { same, differ, hereOnly, copyOnly }
}

/** The copy's quotes: those that would come here new, and those already here (left as they are). */
export function quotesBeside(
  here: readonly QuoteDef[],
  copy: readonly QuoteDef[],
): { fresh: QuoteDef[]; already: QuoteDef[] } {
  const ids = new Set(here.map((q) => q.id))
  return {
    fresh: copy.filter((q) => !ids.has(q.id)),
    already: copy.filter((q) => ids.has(q.id)),
  }
}
