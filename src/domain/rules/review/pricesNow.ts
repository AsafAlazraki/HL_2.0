/* ============================================================
   WHAT EACH OF A LINE'S PRICES READS NOW: $0, or blank (the verifier
   of Review, 2026-11-04, round 1, gap 4: on the $0 cases that say what
   they come with, the lede said "$0 at Sell and Sell inc Install" and
   each line then said its Sell inc Install "stays blank" — the file
   holds $0 there, and the sheet shows it).

   A case's lines are on sale with no price at EVERY price their list
   declares (`checks.ts`), each one $0 or blank. Said once where every
   line reads alike, and line by line only where they differ — so the
   lede never claims a $0 a line does not hold, and a line never says
   "blank" of a cell that holds $0.

   PURE: the list, its lines, and the prices it declares.
   ============================================================ */

import { readCell, type EntityDef, type RowData } from '@/domain/model'
import { priceLevelsFor } from '@/domain/quote/pricing'

/** One declared price on one line: $0, or blank. */
export type PriceNow = { label: string; zero: boolean }

/** Each price the list declares, as the line reads it: $0, or blank (null, '' or not a figure). */
export function pricesNow(table: EntityDef | undefined, row: RowData | undefined): PriceNow[] {
  if (!table || !row) return []
  return priceLevelsFor(table).map((l) => ({
    label: l.label,
    zero: readCell(row, l.fieldId) === 0,
  }))
}

export interface PricesSaid {
  /** the prices every line holds at $0 */
  zeroAll: string[]
  /** the prices every line leaves blank */
  blankAll: string[]
  /** true when the lines differ, so each says its own */
  differ: boolean
}

/** The prices said once over a case's lines: $0 on every line, blank on every line, or differing. */
export function pricesSaid(lines: ReadonlyArray<readonly PriceNow[]>): PricesSaid {
  const first = lines[0] ?? []
  const labels = first.map((p) => p.label)
  const zeroAll = labels.filter((label) =>
    lines.every((l) => l.find((p) => p.label === label)?.zero === true),
  )
  const blankAll = labels.filter((label) =>
    lines.every((l) => l.find((p) => p.label === label)?.zero === false),
  )
  return { zeroAll, blankAll, differ: zeroAll.length + blankAll.length < labels.length }
}
