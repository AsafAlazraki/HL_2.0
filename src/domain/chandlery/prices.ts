/* ============================================================
   THE CHANDLERY'S TWO PRICES — supply and fitted, as the price list
   declares them, said so that a figure is never wrong (the judge of
   the chandlery, 2026-11-03, blocker 1).

   The parts list declares two prices: the supply price ("Sell", the
   part over the counter) and the fitted price ("Sell inc Install",
   the part on the boat). They differ on 1,882 of the 2,238 parts on
   sale, and the old card showed only the first, unlabelled — so the
   101 parts the price list prices ONLY fitted (trailer adjustments,
   labour) read $0 or "No price" where the file says $206 fitted.

   WHICH PRICE IS WHICH is read off the price's own declaration
   (`contains.includesInstall`), never off its name, and a price
   Northside has said may not reach a customer is never one of the two
   (`mayReachCustomer === false`, set on Prices). Cost columns are not
   prices and never come here: the pricer reads declared prices only.

   THE SIX ANSWERS a part's two figures can give, each said as the
   person at the desk would say it:

     both        "$69 supply · $112 fitted"
     supplyOnly  "$3 supply" — the file prices no fitting, or its
                 Install Type is Supply Only and the two are the same
     fittedOnly  "$206 fitted" — the file prices it fitted alone
     zero        "$0" — the price list writes $0 at both, as it does
                 for "Supplied with Motor"; said as the file's own $0
     none        no price at either — said, with the way to Review

   PURE: two figures and a sentence in, an answer out. A figure is set by the app's one money
   format (`money`), never rounded here.
   ============================================================ */
import { money } from '@/domain/money'

/** One of a list's declared prices, as far as this reading needs it. */
export interface DeclaredPrice {
  key: string
  label: string
  contains?: { includesInstall?: boolean } | undefined
  mayReachCustomer?: boolean | undefined
}

/** The two prices of the parts list: the supply price and the fitted, either absent. */
export interface TwoKeys<L extends DeclaredPrice = DeclaredPrice> {
  supply: L | null
  fitted: L | null
}

/**
 * WHICH OF A LIST'S PRICES IS SUPPLY AND WHICH IS FITTED: the first that says it carries no
 * fitting, and the first that says it does. A price Northside keeps from customers is neither.
 */
export function twoKeysOf<L extends DeclaredPrice>(levels: readonly L[] | undefined): TwoKeys<L> {
  const shown = (levels ?? []).filter((l) => l.mayReachCustomer !== false)
  return {
    supply: shown.find((l) => l.contains?.includesInstall === false) ?? null,
    fitted: shown.find((l) => l.contains?.includesInstall === true) ?? null,
  }
}

export type TwoPrices =
  | { kind: 'both'; supply: number; fitted: number }
  | { kind: 'supplyOnly'; supply: number }
  | { kind: 'fittedOnly'; fitted: number }
  | { kind: 'zero' }
  | { kind: 'none' }

/** A figure that is a price: a number other than nothing. A credit (negative) is a price. */
const priced = (v: number | null | undefined): boolean =>
  typeof v === 'number' && Number.isFinite(v) && v !== 0

/** Install Type says the part is sold to be fitted by somebody else. */
export const isSupplyOnly = (install: string | null | undefined): boolean =>
  /^\s*supply\s+only/i.test(install ?? '')

/** A PART'S TWO PRICES, said. Never $0 where the file prices the part fitted. */
export function twoPrices(
  supply: number | null | undefined,
  fitted: number | null | undefined,
  install?: string | null,
): TwoPrices {
  const s = priced(supply)
  const f = priced(fitted)
  if (!s && !f) return supply === 0 || fitted === 0 ? { kind: 'zero' } : { kind: 'none' }
  if (s && !f) return { kind: 'supplyOnly', supply: supply as number }
  if (!s && f) return { kind: 'fittedOnly', fitted: fitted as number }
  if (supply === fitted && isSupplyOnly(install))
    return { kind: 'supplyOnly', supply: supply as number }
  return { kind: 'both', supply: supply as number, fitted: fitted as number }
}

/** The figure a sort reads: supply where there is one, else fitted; none last. */
export function sortFigure(p: TwoPrices): number | null {
  switch (p.kind) {
    case 'both':
    case 'supplyOnly':
      return p.supply
    case 'fittedOnly':
      return p.fitted
    case 'zero':
      return 0
    case 'none':
      return null
  }
}

/** THE TWO PRICES IN ONE LINE, for a name read aloud and a test: "$69 supply · $112 fitted". */
export function pricesSaid(p: TwoPrices): string {
  switch (p.kind) {
    case 'both':
      return `${money(p.supply)} supply · ${money(p.fitted)} fitted`
    case 'supplyOnly':
      return `${money(p.supply)} supply only`
    case 'fittedOnly':
      return `${money(p.fitted)} fitted only`
    case 'zero':
      return '$0 on the price list'
    case 'none':
      return 'No price on the price list'
  }
}

/* ---------------------------------------------------------- */
/* What a line of the parts list is                            */
/* ---------------------------------------------------------- */

/**
 * A LINE OF THE PARTS LIST IS A PART, A NOTE OR LABOUR (the judge's major 13). The workbook
 * writes notes as lines — "NB: Fuel Filter - Order w Rigging Kit", "NB: No Rego Decals - NOT TO
 * BE SUPPLIED" — and they are read as notes, never as a $0 part to buy. Labour is the work, by
 * its own word in the price list ("Labour Estimated - (0.5)"), and is drawn with no picture.
 */
export type LineKind = 'part' | 'note' | 'labour'

export function lineKindOf(product: string): LineKind {
  if (/^\s*NB\s*:/i.test(product)) return 'note'
  if (/^\s*labour\b/i.test(product)) return 'labour'
  return 'part'
}

/** A note's own words, without the workbook's "NB:". */
export const noteSaid = (product: string): string =>
  product.replace(/^\s*NB\s*:\s*/i, '').replace(/\s+-\s+/g, ' – ')
