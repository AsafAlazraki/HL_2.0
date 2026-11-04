/* ============================================================
   WHERE A PLACE'S PAGE STANDS, in a module of its own.

   `/places/$id` reads these in `validateSearch`, which stays in the
   entry chunk when the router splits the route's component away.
   Imported from `Place.tsx`, they took the whole place screen, its
   livery and the picture ledger into the entry chunk with them, and
   the first page of the app downloaded them all (measured 2026-10-30:
   the entry chunk at 1,046,677 bytes).

   TWO VIEWS SINCE THE LINE-UP (2026-11-04): the range, with its
   prices, quotes, partners and changes after it, and Settings. The
   Quotes and Prices tabs became plates after the range, so an old
   address that named one opens the range, where both now stand.
   ============================================================ */

export const PLACE_TABS = ['range', 'settings'] as const
export type PlaceTab = (typeof PLACE_TABS)[number]

export const PLACE_ORDERS = ['file', 'price', 'length'] as const
export type PlaceOrder = (typeof PLACE_ORDERS)[number]

/** The most boats set side by side. */
export const COMPARE_MOST = 3

/** WHERE THE PAGE STANDS INSIDE ITSELF, every part of it in the address. */
export interface PlaceAt {
  /** the series the models are filtered to, as the price list files it; '' for those filed
   *  under none; absent for every model */
  series?: string
  /** the order the models stand in; absent is the price list's own */
  sort?: Exclude<PlaceOrder, 'file'>
  /** what is typed in the find */
  find?: string
  /** the boats set side by side, by their anchor rows, in the order chosen */
  compare?: string[]
  /** the compare is opened */
  see?: 'compare'
  /** the heading open on a list that is not a boat maker */
  in?: string
}

/** A value as the address carries it. The router reads a value that looks like a figure as one
 *  (`in=150` typed by hand is the number 150), so a figure is read back as the word it was. */
const str = (v: unknown, most = 200): string | undefined => {
  const s = typeof v === 'number' && Number.isFinite(v) ? String(v) : v
  return typeof s === 'string' && s.length <= most ? s : undefined
}
const word = (v: unknown, most = 200): string | undefined => {
  const s = str(v, most)
  return s !== undefined && s.trim() !== '' ? s : undefined
}

/** An address's search, read rather than trusted: a value that is not one is simply absent. */
export function readPlaceAt(search: Record<string, unknown>): PlaceAt {
  const at: PlaceAt = {}
  const series = str(search.series)
  if (series !== undefined) at.series = series
  if (search.sort === 'price' || search.sort === 'length') at.sort = search.sort
  const find = word(search.find, 120)
  if (find) at.find = find
  const compare = word(search.compare, 400)
  if (compare) {
    const keys = [
      ...new Set(
        compare
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
      ),
    ]
    if (keys.length > 0) at.compare = keys.slice(0, COMPARE_MOST)
  }
  if (search.see === 'compare') at.see = 'compare'
  const open = str(search.in)
  if (open !== undefined) at.in = open
  return at
}

/** The position written back as an address's search. */
export function writePlaceAt(at: PlaceAt): Record<string, string> {
  const out: Record<string, string> = {}
  if (at.series !== undefined) out.series = at.series
  if (at.sort) out.sort = at.sort
  if (at.find) out.find = at.find
  if (at.compare && at.compare.length > 0) out.compare = at.compare.join(',')
  if (at.see) out.see = at.see
  if (at.in !== undefined) out.in = at.in
  return out
}
