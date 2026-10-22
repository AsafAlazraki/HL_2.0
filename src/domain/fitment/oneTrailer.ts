/* ============================================================
   ONE BOAT, ONE TRAILER — decided once, for every trailer list at once.

   THE FAULT. A quote is started by bringing across, for each list the
   boat's page draws, the price list's own choice: the starred row, or,
   where nothing is starred, the one row when there is only one
   (`mintQuoteFromView`). That ran PER LIST, and a boat can have its
   trailers in two lists. The SP660 is in Highfield's NSM Custom list,
   where the REDCO TA600T-MOB is starred, and in Highfield's GFAB list,
   where one GFAB tandem stands alone and unstarred — so a new SP660
   quote started with both: GFAB $24,723 and REDCO $12,643, the trailer
   section $37,366, on page 2 of the customer's printed quote. The
   fitment sweep counted 87 boats that start a quote with two trailers
   (Highfield 51, Stabicraft 27, Surtees 9; notes.md §0.5).

   THE RULE, as the dealer would say it (`ONE_TRAILER` in `say.ts`):
   "One trailer to a boat, because a boat sits on one trailer."

     · the star wins — and if two lists each star one, the first list
       in the boat page's own order wins, so the answer never depends
       on anything but the price list;
     · with no star in any trailer list, a single trailer across all
       of them comes across;
     · otherwise none does, and each section still says how many were
       waiting (`pickedCount`), exactly as a list with several unstarred
       motors already does.

   EVERY OTHER KIND KEEPS THE PER-LIST RULE IT ALWAYS HAD, which is what
   keeps `src/domain/quote/golden.test.ts` untouched: the 529 Assault Pro
   has one trailer list with one starred trailer, and still brings it.
   ============================================================ */

import type { TableKind } from '@/domain/model'

/** One list on a boat's page, as the mint sees it: its kind and, in
 *  order, whether each of its rows is the price list's own star. */
export interface ListOffer {
  id: string
  kind: TableKind | undefined
  starred: readonly boolean[]
}

/** For each list, the positions of the rows that come across onto a new
 *  quote. A list missing from the answer brings nothing. */
export function whatComesAcross(lists: readonly ListOffer[]): Map<string, number[]> {
  const out = new Map<string, number[]>()

  /* every list but the trailers: the rule each list always had */
  for (const list of lists) {
    if (list.kind === 'trailer') continue
    const stars = list.starred.flatMap((s, i) => (s ? [i] : []))
    out.set(list.id, stars.length > 0 ? stars : list.starred.length === 1 ? [0] : [])
  }

  /* the trailers, across every list that holds one */
  const trailers = lists.filter((l) => l.kind === 'trailer')
  for (const list of trailers) out.set(list.id, [])
  const firstStar = trailers
    .flatMap((l) => l.starred.map((s, i) => ({ id: l.id, i, s })))
    .find((t) => t.s)
  if (firstStar) {
    out.set(firstStar.id, [firstStar.i])
    return out
  }
  const all = trailers.flatMap((l) => l.starred.map((_, i) => ({ id: l.id, i })))
  if (all.length === 1) out.set(all[0]!.id, [all[0]!.i])
  return out
}
