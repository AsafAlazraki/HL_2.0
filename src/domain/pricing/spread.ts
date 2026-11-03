/* ============================================================
   A PRICE ACROSS ITS WHOLE LIST — how far one figure sits from
   another on every line that holds both, counted, so a rule is shown
   with its numerator and denominator and never read off one line.

   WHY THIS EXISTS (the judge of Prices, 2026-11-04, L3). Each list
   was told through one specimen line where the file carries the
   spread: Warranty is 55–67% of Cash on Highfield and 93–110% on
   Stacer, and above Cash on eight Stacer boats, which no one line
   could say. An owner must see a Warranty above Cash before letting
   it reach a customer.

   AND WHAT A COUNT IS MADE OF (L5). "146 not priced" on Parts is 27
   lines with nothing in Sell and 119 with a nought, and the sheet's
   questions (`only.ts`) ask "nothing in it" and "at most 0"
   separately, so a door that opens the lines behind a count is two
   doors when the count is made of two kinds, each with its own count.

   Pure: no React, no store.
   ============================================================ */

import { priceIn } from '@/domain/catalogue/priceCommands'
import type { CellValue, RowData } from '@/domain/model'

/** One figure against another, over every line that holds both. */
export interface Spread {
  /** lines holding both figures */
  both: number
  /** of those, the same figure */
  equal: number
  /** of those, the first figure above the second */
  above: number
  /** of those, the first figure below the second */
  below: number
  /** the smallest, middle and largest share of the second figure the first is, as a ratio */
  low: number
  median: number
  high: number
}

/** The first figure as a share of the second on every line that holds both; null where none
 *  does. Nought is no figure, as a quote reads it. */
export function spreadOf(rows: readonly RowData[], a: string, b: string): Spread | null {
  const ratios: number[] = []
  let equal = 0
  let above = 0
  let below = 0
  for (const row of rows) {
    const x = priceIn(row, a)
    const y = priceIn(row, b)
    if (x === null || y === null) continue
    ratios.push(x / y)
    if (x === y) equal += 1
    else if (x > y) above += 1
    else below += 1
  }
  if (ratios.length === 0) return null
  ratios.sort((p, q) => p - q)
  const mid = ratios.length / 2
  const median =
    ratios.length % 2 === 1 ? ratios[Math.floor(mid)]! : (ratios[mid - 1]! + ratios[mid]!) / 2
  return {
    both: ratios.length,
    equal,
    above,
    below,
    low: ratios[0]!,
    median,
    high: ratios.at(-1)!,
  }
}

/** The lines whose first figure is above their second — Warranty above Cash. */
export function linesAbove(rows: readonly RowData[], a: string, b: string): RowData[] {
  return rows.filter((row) => {
    const x = priceIn(row, a)
    const y = priceIn(row, b)
    return x !== null && y !== null && x > y
  })
}

/** Two figures that are one figure: equal on every line where either is held, and held on one
 *  line at least. */
export function sameFigure(rows: readonly RowData[], a: string, b: string): boolean {
  let held = 0
  for (const row of rows) {
    const x = priceIn(row, a)
    const y = priceIn(row, b)
    if (x === null && y === null) continue
    if (x !== y) return false
    held += 1
  }
  return held > 0
}

/** A ratio as a whole per cent, the way the workbook's shares are read: 0.9637 → 96. */
export const percentOf = (ratio: number): number => Math.round(ratio * 100)

/** A ratio as "× " to two places: 2.0831 → "2.08". */
export const timesOf = (ratio: number): string =>
  (Math.round(ratio * 100) / 100).toLocaleString('en-AU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

/* ---------------------------------------------------------- */
/* What a "no figure" count is made of                         */
/* ---------------------------------------------------------- */

const blank = (v: CellValue | undefined): boolean =>
  v === null || v === undefined || (typeof v === 'string' && v.trim() === '')

const nought = (v: CellValue | undefined): boolean =>
  v === 0 || (typeof v === 'string' && /^\s*\$?\s*0+(\.0+)?\s*$/.test(v))

/** THE LINES WITH NO FIGURE IN A COLUMN, BY KIND: nothing written, and a nought written where
 *  nobody priced it. The sheet asks each as its own question (`?only=empty~…`, `at-most~…~0`). */
export interface NoFigure {
  blank: number
  nought: number
  /** a word or a mark that is not a figure ("POA", "Std") */
  words: number
}

export function noFigureIn(rows: readonly RowData[], fieldId: string): NoFigure {
  const out: NoFigure = { blank: 0, nought: 0, words: 0 }
  for (const row of rows) {
    if (priceIn(row, fieldId) !== null) continue
    const v = row.values[fieldId]
    if (blank(v)) out.blank += 1
    else if (nought(v)) out.nought += 1
    else out.words += 1
  }
  return out
}
