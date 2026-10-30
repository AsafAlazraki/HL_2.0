/* ============================================================
   A PLACE'S FOUR TABS, in a module of their own.

   `/places/$id` reads them in `validateSearch`, which stays in the
   entry chunk when the router splits the route's component away.
   Imported from `Place.tsx`, they took the whole place screen, its
   livery and the picture ledger into the entry chunk with them, and
   the first page of the app downloaded them all (measured 2026-10-30:
   the entry chunk at 1,046,677 bytes).
   ============================================================ */

export const PLACE_TABS = ['range', 'quotes', 'prices', 'settings'] as const
export type PlaceTab = (typeof PLACE_TABS)[number]
