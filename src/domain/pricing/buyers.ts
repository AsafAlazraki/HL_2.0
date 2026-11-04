/* ============================================================
   WHAT EACH BUYER PAYS FOR ONE LINE — the answer to the question a
   salesperson asks most at the desk, "what does a trade buyer pay for
   this?", read off the line's own cells and the list's prices exactly
   as a quote would read them, with where each figure comes from.

   WHY THIS EXISTS (the judge of Prices, 2026-11-04, L4, S2). Nothing
   in the Data rooms answered it: the sheet shows a list's columns, not
   its buyers, and Prices read one specimen line per list.

   AS A QUOTE READS IT, measured, not believed. A list with no Trade
   price prices a trade quote at its first price (`priceAtLevel` falls
   to the first rung), so a trailer's trade buyer pays Sell inc Rego.
   A list that HAS a Trade price and a line with nothing in it is not
   priced on a trade quote at all: the frozen rung reads null, so
   Jeanneau's eight boats with no Trade are "not priced" for a trade
   buyer, never Cash (measured on the Jeanneau with no Trade,
   2026-11-04: `priceAtLevel` → unitPrice null). A boat's nought is no
   figure (`boatRungs`).

   SUB-DEALER. Rigging Kits are the only list on the price list this
   app reads that carries a sub-dealer figure, and it is the same
   figure as their trade figure on every kit. A quote is priced for a
   customer or a trade buyer, so it is said, never priced.

   Pure: no React, no store.
   ============================================================ */

import { CASH, ladderOn, priceIn } from '@/domain/catalogue/priceCommands'
import { mayReachCustomer } from '@/domain/pricing/worked'
import { cellOf } from '@/domain/pricing/meaning'
import { sellFigures, type SellFigure } from '@/domain/pricing/unchosen'
import { LEVEL_TITLE, type EntityDef, type PriceLevel, type RowData } from '@/domain/model'
import type { CatalogueData } from '@/domain/catalogue/sheet'

export type BuyerKey =
  'cash' | 'trade' | 'warranty' | 'fitted' | 'fitted-trade' | 'sub' | 'sub-fitted'

/** How one buyer's figure is reached. */
export type BuyerState =
  /** read off the line, at the list's price for this buyer */
  | 'reads'
  /** the list has no price for this buyer, so a quote reads its first price */
  | 'falls'
  /** the list has the price and this line holds nothing in it: a quote cannot price it */
  | 'blank'
  /** the list names no price at all: Northside has not chosen one */
  | 'unchosen'
  /** on the price list, and no quote is priced at it */
  | 'said'

export interface BuyerPrice {
  key: BuyerKey
  /** who pays it, in the dealer's word */
  who: string
  state: BuyerState
  /** the figure a quote reads for this buyer, or the figure the file holds; null where none */
  figure: number | null
  /** the price list's own column it is read from */
  column: string
  /** its workbook cell, where the column's record names one */
  cell: string
  /** a price a quote cannot be given at until Northside lets it reach a customer */
  northsideOnly: boolean
  /** where Northside has not chosen: the sell figures the line holds, in the file's order */
  could?: SellFigure[]
}

const WHO: Record<BuyerKey, string> = {
  cash: 'A customer',
  trade: 'A trade buyer',
  warranty: 'A warranty job',
  fitted: 'Fitted',
  'fitted-trade': 'A trade buyer, fitted',
  sub: 'A sub-dealer',
  'sub-fitted': 'A sub-dealer, fitted',
}

/** The data a buyer's price is read from. */
export type Sheet = Pick<CatalogueData, 'tables' | 'rows' | 'priceLevels'>

function read(
  table: EntityDef,
  row: RowData,
  key: BuyerKey,
  level: PriceLevel,
  first: PriceLevel,
): BuyerPrice {
  const field = table.fields.find((f) => f.id === level.fieldId)
  const figure = priceIn(row, level.fieldId)
  return {
    key,
    who: WHO[key],
    state: figure === null ? 'blank' : 'reads',
    figure,
    column: level.label,
    cell: field ? cellOf(field) : '',
    northsideOnly: !mayReachCustomer(table, level) && level !== first,
  }
}

/**
 * EVERY BUYER'S PRICE FOR ONE LINE: a customer's, a trade buyer's, Warranty where the list has it,
 * the fitted price where the list has one, and the sub-dealer figure where the file carries one.
 * In that order, the order a dealer is asked them.
 */
export function buyersOf(data: Sheet, table: EntityDef, row: RowData): BuyerPrice[] {
  const ladder = ladderOn(data, table)
  const cash = ladder.find((l) => l.key === CASH)
  const out: BuyerPrice[] = []
  if (!cash) {
    out.push({
      key: 'cash',
      who: WHO.cash,
      state: 'unchosen',
      figure: null,
      column: '',
      cell: '',
      northsideOnly: false,
      could: sellFigures(table, row),
    })
    return out
  }
  const customer = read(table, row, 'cash', cash, cash)
  /* a price worked from cost and kept from customers is still the figure a quote reads */
  customer.northsideOnly = !mayReachCustomer(table, cash)
  out.push(customer)

  const trade = ladder.find((l) => l.key === 'trade')
  if (trade) out.push(read(table, row, 'trade', trade, cash))
  else
    out.push({
      ...customer,
      key: 'trade',
      who: WHO.trade,
      state: customer.state === 'blank' ? 'blank' : 'falls',
    })

  for (const key of ['warranty', 'fitted', 'fitted-trade'] as const) {
    const level = ladder.find((l) => l.key === key)
    if (level) out.push(read(table, row, key, level, cash))
  }

  /* THE FILE'S OWN SUB-DEALER FIGURES, said where the list carries them, never priced: Rigging Kits
     carries one for the kit supplied (M) and one, after its Sell Price, for the kit fitted (AE) */
  const isSub = (name: string) => /^sub ?dealer price$/i.test(name.trim())
  const subs = table.fields.filter((f) => isSub(f.name))
  const sellAt = table.fields.findIndex((f) => f.name === 'Sell Price')
  for (const sub of subs) {
    const fitted =
      subs.length > 1 && sellAt >= 0 && table.fields.findIndex((f) => f.id === sub.id) > sellAt
    const key = fitted ? 'sub-fitted' : 'sub'
    out.push({
      key,
      who: WHO[key],
      state: 'said',
      figure: priceIn(row, sub.id),
      column: sub.name,
      cell: cellOf(sub),
      northsideOnly: false,
    })
  }
  return out
}

/** The buyer's word for a rung key, as the quote's own control says it. */
export const rungWord = (key: string): string => LEVEL_TITLE[key] ?? key

/* ---------------------------------------------------------- */
/* Finding a line                                              */
/* ---------------------------------------------------------- */

/** One line a person could look up: its list, its row, the name it is said by, and its code. */
export interface LineEntry {
  tableId: string
  rowId: string
  name: string
  code: string
  /** the list, as the page names it */
  list: string
}

const fold = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/** Codes compared with nothing but their letters and figures: "F90 XB" is "f90xb". */
const squash = (s: string): string => fold(s).replace(/\s+/g, '')

/**
 * THE LINES A PERSON MEANT, best first: a code typed whole, then a code begun, then a name begun,
 * then every word typed found in the name or the code; lines that answer alike stand in the
 * order the price list lays them, boats first. Two letters at least; never more than
 * `limit` lines.
 */
export function findLines(entries: readonly LineEntry[], query: string, limit = 6): LineEntry[] {
  return searchLines(entries, query, limit).lines
}

/**
 * THE LINES FOUND, AND HOW MANY ANSWERED. EVERY LIST ANSWERING HAS ITS BEST LINE SHOWN before any
 * list has a second (the verifier of Prices, 2026-11-04: "Tiller Conversion Kit" filled all six
 * places with Dealer Fit packages, and the Rigging Kit of that name could be found only by its
 * code); the rest fill by rank, and what is shown stands in the order the ranking gives.
 */
export function searchLines(
  entries: readonly LineEntry[],
  query: string,
  limit = 6,
): { lines: LineEntry[]; total: number } {
  const q = fold(query)
  if (q.length < 2) return { lines: [], total: 0 }
  const words = q.split(' ')
  const qs = squash(query)
  const scored: Array<{ e: LineEntry; rank: number; at: number }> = []
  for (const [at, e] of entries.entries()) {
    const name = fold(e.name)
    const code = squash(e.code)
    let rank = -1
    if (code !== '' && code === qs) rank = 0
    else if (code !== '' && qs.length >= 3 && code.startsWith(qs)) rank = 1
    else if (name.startsWith(q)) rank = 2
    else if (words.every((w) => name.includes(w) || (code !== '' && code.includes(w)))) rank = 3
    if (rank >= 0) scored.push({ e, rank, at })
  }
  /* the price list's own order breaks a tie: a boat before the kit made for it */
  const sorted = scored.toSorted((a, b) => a.rank - b.rank || a.at - b.at)
  const shown = new Set<(typeof sorted)[number]>()
  const lists = new Set<string>()
  for (const s of sorted) {
    if (shown.size >= limit) break
    if (lists.has(s.e.list)) continue
    lists.add(s.e.list)
    shown.add(s)
  }
  for (const s of sorted) {
    if (shown.size >= limit) break
    shown.add(s)
  }
  return {
    lines: sorted.filter((s) => shown.has(s)).map((s) => s.e),
    total: sorted.length,
  }
}
