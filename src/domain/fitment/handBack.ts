/* ============================================================
   WHICH DRAFT WHAT FITS MAY HAND BACK (fit flow, round 2, walk 1,
   major 1, 2026-11-05).

   The walk: "The bar said Highfield Patrol 600 · Yamaha F115XB, $47,059,
   Start the quote. I pressed it and got the earlier quote with the
   F130XA at $48,199." The picker's guard — a draft already standing for
   this boat with nobody named on it is handed back rather than written
   twice — was asked as it stood, and the earlier draft came back with
   its own motor, so what was chosen on What fits was ignored.

   The guard is the picker's, and it is right there: the picker starts
   the boat alone, so the draft it hands back is the same thing it would
   have written. What fits starts the boat WITH what was chosen. So it
   hands back only a draft that nothing has been done to since it was
   made — its one event is the mint, its one line is the boat, and it
   carries no adjustment of anyone's. That draft is the boat alone, and what was
   chosen goes onto it exactly as onto a new one. Any other draft is
   somebody's work: it is kept as it was, and a new quote is written
   with what the bar names, said in one sentence.
   ============================================================ */

import type { QuoteDef } from '@/domain/model'

/** Nothing has been done to this quote since it was made: its only event is the mint, and its
 *  one line is the boat it was made for. */
export function untouched(quote: QuoteDef): boolean {
  return (
    quote.state === 'draft' &&
    quote.lines.every((l) => l.entityId === quote.rootTableId && l.rowId === quote.rootRowId) &&
    quote.adjustments.length === 0 &&
    quote.events.every((e) => e.kind === 'minted')
  )
}

/** The standing draft What fits may start on, or undefined where a new quote is written. */
export function handsBack(standing: QuoteDef | undefined): QuoteDef | undefined {
  return standing && untouched(standing) ? standing : undefined
}

/**
 * The sentence for a standing draft kept as it was while a new quote is written: said with the
 * press, so nobody wonders where the earlier one went. Empty where no draft stood, or where the
 * one standing was handed back.
 */
export function keptSaid(standing: QuoteDef | undefined): string {
  if (!standing || untouched(standing)) return ''
  return `Quote ${standing.reference} for this boat already holds work, so it is kept as it was.`
}
