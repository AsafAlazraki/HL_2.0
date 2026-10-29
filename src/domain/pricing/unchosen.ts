/* ============================================================
   A PRICE NORTHSIDE HAS NOT CHOSEN — one fact, read the same way by
   Prices (`/levels`), the build and the finale's give.

   WHY THIS EXISTS (built-critique-m3.md, blocker 1). Dealer Fit
   Packages, Rigging Kits and the two factory-package lists declare no
   price, and the build said so as "Dealer Fit Packages have no price on
   the price list", under a total that left the Tube Covers out. The
   seed's line for them carries Sell $2,790 and Act Sell $2,834. Prices,
   one door away, said the true thing: the price list holds two sell
   figures and names none. Two screens, two facts. This is the one
   reading both now ask:

     NOT CHOSEN   the list names no price, and the price list holds a
                  sell figure on the line — Northside chooses which, on
                  Prices, once, for the whole list;
     NO FIGURE    nothing on the line could be a price at all — the
                  price list really has none for it.

   WHAT COUNTS AS A SELL FIGURE moved here from Prices' own reader
   (`src/screens/levels/read.ts`), which now imports it, so the list
   Prices offers to choose from and the figures the build says exist
   cannot drift apart: a sell column the engine would take as a price,
   never a trade or sub-dealer figure, never a cost, never a package's
   "Parts Sell" (the parts inside it, not the package).

   Pure: no React, no store.
   ============================================================ */

import { cannotBePrice, priceIn } from '@/domain/catalogue/priceCommands'
import { isCostColumn, isPriced } from '@/domain/quote/pricing'
import { workedFromCost } from '@/domain/pricing/worked'
import type { EntityDef, FieldDef, RowData } from '@/domain/model'

const SELLS = /\bsell\b|\bretail\b|\brrp\b|\bprice\b/i
/* a trade or sub-dealer price is another price, not a list's own; a package's Parts Sell is
   the parts inside it, not the package */
const NOT_A_SELL = /trade|sub ?dealer|\bctd\b|cost|^parts\b/i

/** The columns a list could name as its price: its own sell columns, by the price list's names,
 *  that the engine would take as a price. */
export function sellColumns(table: EntityDef): FieldDef[] {
  return table.fields.filter(
    (f) =>
      SELLS.test(f.name) &&
      !NOT_A_SELL.test(f.name) &&
      cannotBePrice(table, f) === null &&
      !(isCostColumn(table, f) && workedFromCost(f) === null),
  )
}

/** One figure the price list holds on a line, by its column's own name. */
export interface SellFigure {
  label: string
  figure: number
}

/** The sell figures one line holds, in the price list's own column order; none where it holds
 *  none. */
export function sellFigures(table: EntityDef, row: RowData): SellFigure[] {
  const out: SellFigure[] = []
  for (const f of sellColumns(table)) {
    const figure = priceIn(row, f.id)
    if (figure !== null) out.push({ label: f.name, figure })
  }
  return out
}

/**
 * THE LIST NAMES NO PRICE, AND THIS LINE HOLDS A SELL FIGURE: Northside has not chosen which of
 * its figures prices it. The figures, in the price list's order; null where the list names a
 * price (it is chosen) or where the line holds nothing that could be one (there is no figure).
 */
export function unchosenOn(
  table: EntityDef | undefined,
  row: RowData | undefined,
): SellFigure[] | null {
  if (!table || !row || isPriced(table)) return null
  const figures = sellFigures(table, row)
  return figures.length > 0 ? figures : null
}
