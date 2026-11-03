/* ============================================================
   A TRAILER OVER ITS ATM IS NOT TOWED AWAY ON A QUOTE (the fitment
   verifier, 2026-11-03, major: the GFAB SP660 said "750 kg over it"
   and still offered Quote this one and Recommend it, and Start made a
   quote with it and said nothing).

   The weighing is the plate's own (`loadOf`, `towOf`): what the boat
   puts on the trailer, the trailer's own weight where it is not already
   in, against the ATM the price list rates it at. Where that is over,
   the trailer is not put on a quote started here, is not made the
   recommended, and is left off the quote the plate's foot would start
   — each said as a sentence with its figures, where it is refused.

   A trailer with no ATM on the price list, or a boat with no weight,
   is not refused: nothing is measured, so nothing is decided.

   Pure: no React, no store.
   ============================================================ */
import type { CatalogueCtx } from '@/domain/model'
import type { BoatFit, TrailerMade } from './boat'
import { loadOf, towOf, type Tow } from './plate'
import { figure } from './say'

/** What the refusal is of: a press for the quote, a press for the recommended, or the quote the
 *  plate's foot starts, which leaves it off. */
export type AtmAct = 'quote' | 'star' | 'start'

/** The trailer's weighing where it is over its ATM; null where it clears, or nothing is weighed. */
export function overAtm(ctx: CatalogueCtx, fit: BoatFit, trailer: TrailerMade): Tow | null {
  const tow = towOf(ctx, loadOf(ctx, fit), trailer)
  return tow.standing === 'over' && tow.rated !== null && tow.total !== null ? tow : null
}

/** The sentence a trailer over its ATM is refused with, its figures the price list's own. */
export function atmSaid(name: string, tow: Tow, act: AtmAct): string {
  const rated = tow.rated ?? 0
  const total = tow.total ?? 0
  const outcome =
    act === 'quote'
      ? 'so it is not put on the quote'
      : act === 'star'
        ? 'so it is not made the recommended trailer'
        : 'so it is left off this quote'
  return `The ${name} is rated ${figure(rated)} kg and would carry ${figure(total)} kg, ${figure(total - rated)} kg over, ${outcome}. Its ATM decides that.`
}

/** The refusal for one trailer and one act, or '' where its ATM clears what it would carry. */
export function atmRefusal(
  ctx: CatalogueCtx,
  fit: BoatFit,
  trailer: TrailerMade,
  act: AtmAct,
): string {
  const tow = overAtm(ctx, fit, trailer)
  return tow ? atmSaid(trailer.name, tow, act) : ''
}
