/* ============================================================
   A BOAT THE PRICE FILE PRICES AT NOUGHT HAS NO PRICE.

   MEASURED on the Master Price File, 2026-09-24: all nine Haines
   Signature rows, and nine of Formosa's thirty-nine, carry 0 in Cash,
   in Trade and in Warranty, and 0 in every one of their cost columns
   beside it. No other boat register on the file has a 0 in a price
   column. Of the file's 810 boat rows, 792 carry a figure and no
   nought, 18 carry a nought in every rung and in every cost column,
   and none mixes the two. A nought on a whole boat is a price
   nobody has entered.

   THE APP ALREADY READ IT THAT WAY IN TWO PLACES AND THE OTHER WAY IN
   A THIRD, and the third was the one that leaves the building
   (m2-last-critique.md, blocker 1). The picker's fleet counts a boat's
   nought as "no figure" and its plate says "No price on file"; the
   engine's own gate (`totals.ts`, refusal 3) names the Haines nought
   as the "we do not know" kind. But the hull line was frozen at
   `unitPrice: 0`, and `readDocument` reads a frozen 0 as INCLUDED — a
   price file stating a charge of nothing — so the customer's paper for
   a Haines Signature Fisher 525F printed "01 The hull $0 · Included",
   and "Your price" was the trailer alone.

   So the reading is made ONCE, where a boat becomes a line: a rung a
   boat register states as 0 is frozen as no figure (`null`, which
   `model/quote.ts` declares the real state "not priced here"). Every
   reader downstream — the build's chapter, the finale's count, the
   cascade, the paper and "Your price" — then says "Not priced on this
   quote" from the one fact, and nobody has to remember the rule.

   WHAT IT DOES NOT DO. It leaves every other register alone: a nought
   on a part, a kit or a trailer can be a real "no charge", and the
   engine's INCLUDED is the right word for it. It invents no figure: a
   boat with no price is priced by the person selling it, on the build
   (`HULL_PRICE_REASON` is what that act records beside the figure).

   PURE. No React, no store, no DOM.
   ============================================================ */

import {
  SUBJECT_CHAPTER,
  type EntityDef,
  type FrozenLevel,
  type QuoteDef,
  type QuoteLine,
} from '@/domain/model'
import { money } from '@/domain/money'
import { parseAmount } from './pricing'

/**
 * The rungs of one row, as a quote may freeze them. A boat register's
 * nought is no figure; every other register's rungs pass through
 * untouched, so a nought on a part still reads as the file's "no
 * charge".
 */
export function boatRungs(
  entity: Pick<EntityDef, 'kind'> | undefined,
  levels: readonly FrozenLevel[],
): FrozenLevel[] {
  if (entity?.kind !== 'boat') return [...levels]
  return levels.map((level) => (level.value === 0 ? { ...level, value: null } : level))
}

/** The hull's own line: the first line of the subject's section. */
export function hullLineOf(quote: Pick<QuoteDef, 'lines' | 'sections'>): QuoteLine | undefined {
  const id = quote.sections.find((s) => s.blockId === SUBJECT_CHAPTER)?.lineIds[0]
  return id === undefined ? undefined : quote.lines.find((l) => l.id === id)
}

/**
 * WHERE THE BOAT'S OWN PRICE STANDS, read off the frozen hull line.
 *
 *  · `file`   the price file priced it, and that figure is on the quote
 *  · `typed`  the file holds no price for it and the person selling it
 *             put one on — an override beside a frozen `null`
 *  · `none`   the file holds no price and nobody has put one on yet
 *
 * A hull the file prices and somebody overrode is still `file`: that is
 * a price agreed against the file's, which the paper already prints as
 * one, and it is not what this reading is for.
 */
export type HullPriceState = 'file' | 'typed' | 'none'

export interface HullPrice {
  state: HullPriceState
  /** the hull's line; what it charges is `lineAmount`'s, the one summation */
  line: QuoteLine
}

export function hullPriceOf(quote: Pick<QuoteDef, 'lines' | 'sections'>): HullPrice | null {
  const line = hullLineOf(quote)
  if (!line) return null
  if (line.unitPrice !== null) return { state: 'file', line }
  if (typeof line.overridePrice === 'number' && Number.isFinite(line.overridePrice)) {
    return { state: 'typed', line }
  }
  return { state: 'none', line }
}

/** True where the boat itself carries no price on this quote. */
export const hullHasNoPrice = (quote: Pick<QuoteDef, 'lines' | 'sections'>): boolean =>
  hullPriceOf(quote)?.state === 'none'

/**
 * THE REASON WRITTEN BESIDE A PRICE PUT ON A BOAT THE FILE DOES NOT
 * PRICE. An override is refused on a document without a reason
 * (`issueBlockers`, refusal 4), because the reason is written at the
 * moment of the decision. For this one act the reason IS the fact that
 * offered it — the act is only drawn where the file holds no price — so
 * it is recorded as that fact, at that moment, and a person is not
 * asked to type a sentence the screen already knows is true.
 */
export const HULL_PRICE_REASON = 'The price file holds no price for this boat.'

/** What a person typed as the boat's price: the figure, or the sentence
 *  that says why it is not one, said where it was typed. */
export type HullPriceAsk = { price: number } | { refused: string }

/**
 * THE BOAT'S PRICE AS TYPED. Read by `parseAmount`, the one reader of a
 * typed amount, so "$54,900", "54900" and "54,900.00" are one figure
 * and "5e4" is none. Blank is not nought, and nought is refused: a
 * boat at $0 is the fault this whole file exists to end, and the paper
 * would print it as Included.
 */
export function readHullPrice(text: string): HullPriceAsk {
  const typed = text.trim()
  if (typed === '') {
    return { refused: 'Type the boat’s price first, in dollars, with tax included.' }
  }
  const amount = parseAmount(typed)
  if (amount === null) {
    return { refused: `“${typed}” is not a price. Type it in figures, in dollars.` }
  }
  if (amount <= 0) {
    return {
      refused: `A boat is priced above ${money(0)}. The customer’s paper would print a price of nothing as included.`,
    }
  }
  return { price: Math.round(amount * 100) / 100 }
}

/**
 * WHY A QUOTE WHOSE BOAT CARRIES NO PRICE MAY NOT BE GIVEN. The total
 * of such a quote is the trailer and the extras, printed under the
 * boat's name — the same "we do not know" read as a price that refusal
 * 3 exists for, one line down.
 */
export const HULL_UNPRICED_WHY =
  'The boat has no price on this quote, so its total would be everything but the boat. Put its price on it in 01 The hull before it goes to the customer.'
