/* ============================================================
   THE PRICE QUESTIONS NORTHSIDE HAS NOT ANSWERED, SAID ON HOME BEFORE
   THE SALE (built-critique-m3-2.md, major 5).

   A stakeholder opening the hosted link starts on an empty browser, so
   their first quote is everybody's first quote: the Classic 340's draft
   carries the recommended Tube Covers, Dealer Fit Packages name no
   price, and the finale refuses the give. Nothing had said so before
   the customer sat down — Prices did, one door away, under "Yours to
   choose 4". Home is where the owner sets up, so it says it once here.

   ONE READING, NOT TWO: the questions are Prices' own (`readDesk` over
   `readLadder`, src/screens/levels/read.ts), so Home's count and Prices'
   count are the same figure and cannot drift. Nothing is summed here.

   WHICH OF THEM STOP A QUOTE: a list with sell figures and no price
   (`not-priced`) is the one the build refuses to give until its line is
   priced — by hand on the quote, or for good on Prices. A motor's two
   figures nobody has chosen between do not stop anything: a quote shows
   the one it shows today. So the sentence names only the first kind.

   Pure: no React, no store.
   ============================================================ */

import { readDesk, readLadder, type Sheet } from '@/screens/levels/read'

export interface PriceAsks {
  /** the questions Prices lists under "Yours to choose" */
  count: number
  /** the line nouns whose quote waits on a hand price until answered — "dealer fit package" */
  stopping: string[]
}

/** What Prices asks of Northside, read the way Prices reads it; null where nothing is asked. */
export function priceAsksOf(sheet: Sheet): PriceAsks | null {
  const choose = readDesk(sheet, readLadder(sheet)).choose
  if (choose.length === 0) return null
  return {
    count: choose.length,
    stopping: [
      ...new Set(choose.filter((c) => c.cash.state === 'not-priced').map((c) => c.noun.one)),
    ],
  }
}

/** "a dealer fit package, rigging kit or factory package" */
function eitherOf(nouns: readonly string[]): string {
  const a = /^[aeiou]/i.test(nouns[0] ?? '') ? 'an' : 'a'
  if (nouns.length <= 1) return nouns[0] ? `${a} ${nouns[0]}` : ''
  return `${a} ${nouns.slice(0, -1).join(', ')} or ${nouns[nouns.length - 1]}`
}

/** The one sentence Home says of them, with what they stop where they stop anything. */
export function priceAsksSay(asks: PriceAsks): string {
  const one = asks.count === 1
  const head = `${asks.count} price ${one ? 'question waits' : 'questions wait'} for you.`
  if (asks.stopping.length === 0) return head
  return `${head} Until ${one ? 'it is' : 'they are'} answered, ${eitherOf(asks.stopping)} on a quote is priced by hand before the quote can be given.`
}
