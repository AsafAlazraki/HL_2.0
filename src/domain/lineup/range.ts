/* ============================================================
   A MAKER'S RANGE, AS ITS OWN PAGE READS IT — the spans its head and
   its series print, the order its models stand in, the words a series
   is said in, and the rows of the compare.

   A SPAN IS MEASURED WITH ITS DENOMINATOR. "from $15,040 to $129,830
   at Cash · 199 of 199 versions priced": the least and the most figure
   the rows carry at one declared price, and how many of the rows carry
   one. A row holding 0 is not a price and is not in the span.

   ONLY A PRICE THAT MAY REACH A CUSTOMER IS SPANNED. Which those are is
   the dealer's answer on Prices, or the price list's where he gave none
   (`mayReachCustomer`): Warranty, worked from landed cost, is named
   with its reason and never printed as a figure here.

   Pure: no React, no store, no DOM.
   ============================================================ */
import { readCell, type EntityDef, type PriceLevel, type RowData } from '@/domain/model'
import { priceLevelsFor } from '@/domain/quote/pricing'
import { mayReachCustomer } from '@/domain/pricing/worked'
import { lengthOf, type ModelMeasures } from './measure'

/* ---------------------------------------------------------- */
/* Spans                                                       */
/* ---------------------------------------------------------- */

export interface Span {
  lo: number | null
  hi: number | null
  /** rows carrying a figure above zero */
  priced: number
  /** rows read */
  of: number
}

/** The figures a set of rows carries in one column, as a span with its denominator. */
export function spanAt(rows: readonly RowData[], fieldId: string): Span {
  let lo: number | null = null
  let hi: number | null = null
  let priced = 0
  for (const row of rows) {
    const v = readCell(row, fieldId)
    if (typeof v !== 'number' || !(v > 0)) continue
    priced += 1
    lo = lo === null ? v : Math.min(lo, v)
    hi = hi === null ? v : Math.max(hi, v)
  }
  return { lo, hi, priced, of: rows.length }
}

/** A list's declared prices, split by whether a customer may be shown them. */
export interface LevelsRead {
  shown: PriceLevel[]
  /** declared, and Northside's own: named with the reason, never printed as a figure */
  kept: PriceLevel[]
}

export function levelsRead(table: EntityDef | undefined): LevelsRead {
  const levels = priceLevelsFor(table)
  const shown: PriceLevel[] = []
  const kept: PriceLevel[] = []
  for (const level of levels) (table && mayReachCustomer(table, level) ? shown : kept).push(level)
  return { shown, kept }
}

/** The span of a length measure across models: "2.3 to 9.2 m", or null. */
export function lengthSpan(measures: readonly ModelMeasures[]): { lo: number; hi: number } | null {
  let lo: number | null = null
  let hi: number | null = null
  for (const m of measures) {
    if (m.length?.kind !== 'span') continue
    lo = lo === null ? m.length.lo : Math.min(lo, m.length.lo)
    hi = hi === null ? m.length.hi : Math.max(hi, m.length.hi)
  }
  return lo === null || hi === null ? null : { lo, hi }
}

/* ---------------------------------------------------------- */
/* The words a series is said in                               */
/* ---------------------------------------------------------- */

/**
 * A HEADING THE FILE WROTE IN CAPITALS, SAID AS A PERSON SAYS IT: "SKIMMAS" reads "Skimmas" and
 * "OCEAN RANGER SDFS" reads "Ocean Ranger SDFs", as the models under them already read. A word
 * with no vowel is a set of letters (SDF, BMT) and keeps them; a heading with any small letter
 * in it is the file's own mixed case ("REDCO - Sportsman Trailers") and is left exactly as it is.
 */
export function headingSaid(heading: string): string {
  if (/[a-z]/.test(heading) || !/[A-Z]/.test(heading)) return heading
  return heading.replace(/[A-Z][A-Z0-9']*/g, (word) => {
    const letters = word.replace(/S$/, '')
    if (!/[AEIOUY]/.test(letters)) return word.length > letters.length ? `${letters}s` : word
    return word[0] + word.slice(1).toLowerCase()
  })
}

/* ---------------------------------------------------------- */
/* The order models stand in                                   */
/* ---------------------------------------------------------- */

export const ORDERS = ['file', 'price', 'length'] as const
export type Order = (typeof ORDERS)[number]

export interface Orderable {
  /** the model's place in the price list's own order */
  at: number
  /** its least figure at the page's price, or null */
  from: number | null
  measures: ModelMeasures
}

/** Models in an order: the price list's own, by price from the least, or by length from the
 *  shortest. A model with no figure to sort by stands after those with one, in file order. */
export function ordered<T extends Orderable>(models: readonly T[], order: Order): T[] {
  if (order === 'file') return [...models].sort((a, b) => a.at - b.at)
  const key = (m: T): number | null => (order === 'price' ? m.from : lengthOf(m.measures))
  return [...models].sort((a, b) => {
    const ka = key(a)
    const kb = key(b)
    if (ka === null && kb === null) return a.at - b.at
    if (ka === null) return 1
    if (kb === null) return -1
    return ka - kb || a.at - b.at
  })
}

/* ---------------------------------------------------------- */
/* The compare                                                 */
/* ---------------------------------------------------------- */

export interface CompareRow {
  /** the band it stands in */
  band: 'Price' | 'Specifications' | 'What fits'
  label: string
  /** one cell per model, in the order given; '—' where the price list carries nothing */
  cells: string[]
  /** the cells are not all the same */
  differs: boolean
}

export const NOTHING_FILED = '—'

/**
 * THE ROWS OF THE COMPARE, each a label and one cell per model, band by band. A row no model
 * carries is left out; a model that carries nothing in a row another carries prints a dash.
 */
export function compareRows(
  bands: readonly {
    band: CompareRow['band']
    label: string
    cells: readonly (string | null)[]
  }[],
): CompareRow[] {
  return bands
    .filter((r) => r.cells.some((c) => c !== null))
    .map((r) => {
      const cells = r.cells.map((c) => c ?? NOTHING_FILED)
      return {
        band: r.band,
        label: r.label,
        cells,
        differs: cells.some((c) => c !== cells[0]),
      }
    })
}
