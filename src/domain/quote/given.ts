/* ============================================================
   WHAT WAS GIVEN TO A CUSTOMER, COUNTED IN ONE PLACE.

   Two screens counted this fact two ways (components-critique-2.md,
   finding 9). After 20260929-01 was given to Jordan Test and a new
   version made, Customers read "GIVEN 0 · GIVEN, IN ALL $0" for them
   and History read "1 given · $55,223". Customers' count asked the
   quote's STANDING, and a quote with a newer version stands as
   `replaced`, so the one document Jordan Test was handed was not
   counted. History asked whether it was ISSUED, and it was. History
   was right: a replaced quote was given — `STANDING_SAY` says so in
   as many words — and the Quotes peek of -01 says it "is still the
   document they hold". A newer version is a new document; it does
   not take the old one out of the customer's hand.

   SO A QUOTE WAS GIVEN WHEN IT WAS ISSUED, and nothing else decides
   it. `issue` is the one act with no way back (`NO_WAY_BACK` in
   commands.ts) and a new version is a fresh draft that carries none
   of the old document's diary (`newVersionOf`), so the state is the
   whole answer and it can never be taken back.

   WHAT IT COMES TO is the figure printed on each of their sheets,
   `quoteTotals(q).total` — the frozen lines plus the signed
   adjustments, tax inclusive — summed over the given documents that
   carry a figure at all. `givenSummed` is that denominator, and a
   screen prints it whenever it is not `given`. The issue gate refuses
   a document with nothing priced on it, so on this engine the two are
   equal; a hand-edited file is still counted honestly.

   EVERY DOCUMENT IS COUNTED ONCE, by its id, whatever list it arrives
   in. A person's page and a diary's day both hand in lists built by
   other readers, and a count that trusted them to be distinct would be
   one bug away from counting a sheet twice.

   WHO READS IT: History's day tallies and the foot of its diary
   (`quote/diary/days.ts`), and the three figures on a customer's page
   (`screens/customers`). A screen that wants to say what was given
   reads this, and nothing else.

   PURE. No React, no store, no DOM, no clock.
   ============================================================ */

import type { QuoteDef } from '@/domain/model'
import { isEmptyQuote, quoteTotals, totalIsNothingByDefault } from './totals'

/** Handed to the customer: issued, whether or not a later version was made since. */
export const wasGiven = (quote: QuoteDef): boolean => quote.state === 'issued'

export interface GivenTally {
  /** how many documents were handed to a customer */
  given: number
  /** the sum of what those carrying a figure printed, as printed */
  givenTotal: number
  /** how many of the `given` carried a figure — the denominator */
  givenSummed: number
}

/** What a list of quotes was given at: how many, the sum, and how many that sum is over. */
export function givenTally(quotes: readonly QuoteDef[]): GivenTally {
  const t: GivenTally = { given: 0, givenTotal: 0, givenSummed: 0 }
  const counted = new Set<string>()
  for (const q of quotes) {
    if (!wasGiven(q) || counted.has(q.id)) continue
    counted.add(q.id)
    t.given += 1
    if (isEmptyQuote(q) || totalIsNothingByDefault(q)) continue
    t.givenTotal += quoteTotals(q).total
    t.givenSummed += 1
  }
  return t
}
