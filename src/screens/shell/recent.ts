import type { PrefValue } from '@/state/prefs'
import type { FinderRow } from '@/domain/shell/finder'

/* ============================================================
   WHERE THIS BROWSER HAS BEEN — the finder's first group, before a
   character is typed.

   KEPT FROM DIRECTION B, which is the only board that drew a section
   that fills itself: Stripe's Shortcuts — "your pinned and most
   recently visited pages" (`live2/stripe-dashboard-shortcuts-section.png`)
   — and Notion's search, which jumps "to a recently visited page"
   before anything is typed (`live2/notion-sidebar-scrolled.png`).
   `docs/LATER.md` had already named the old repo's `moduleRecent` as
   the thing to bring across.

   IT LIVES IN PREFS AND NOWHERE ELSE. `src/state/prefs.ts` is the one
   module in this app that touches the browser's key-value store and
   `tools/check.ts` fails the build on a second one. A visited place is
   exactly what that file's header says belongs there: a per-browser
   convenience, nothing a second person or a second device would need.
   Under a private window or a full disk, `prefs.persistent` is false
   and this list simply lives for the life of the tab — the finder is
   no worse than it was, which is why nothing here refuses.

   ONLY A PLACE THAT CAN BE NAMED IS KEPT. A row that read
   "/quote/a1b2c3" would be a link to a document whose reference the
   list does not know; the shell names a place off the store before
   it remembers it, and remembers nothing it could not name.
   ============================================================ */

export const RECENT_KEY = 'shell.recent'

/** Six. Stripe's own section runs to about that, and the finder's
 *  resting list already carries five doors and two acts underneath —
 *  a recall list longer than the menu below it is a wall. */
export const RECENT_KEPT = 6

/** One place this browser came back from.
 *
 *  THE INDEX SIGNATURE IS NOT DECORATION. A pref is JSON that survives
 *  the round trip through a string store unchanged (`prefs.ts`), and
 *  `PrefValue` says so in the type system: a record of `PrefValue`.
 *  Declaring that here is what lets this go into prefs and come back
 *  out without a cast anywhere — and a cast at a storage boundary is
 *  exactly where a shape stops being checked. */
export interface RecentPlace {
  [key: string]: PrefValue
  href: string
  /** what it is called, as the app spells it */
  name: string
  /** the kind, so the row reads like every other row in the finder */
  fact: string
}

const isPlace = (v: PrefValue): v is RecentPlace =>
  typeof v === 'object' &&
  v !== null &&
  !Array.isArray(v) &&
  typeof v['href'] === 'string' &&
  typeof v['name'] === 'string' &&
  typeof v['fact'] === 'string'

/**
 * What was kept, read back. A value that is not a list of places is
 * DROPPED rather than repaired: it is either somebody else's or
 * broken, and neither is ours to rewrite — the same rule
 * `prefs.ts` applies to a value that is not JSON.
 */
export function readRecent(value: PrefValue | undefined): RecentPlace[] {
  if (!Array.isArray(value)) return []
  return value.filter(isPlace).slice(0, RECENT_KEPT)
}

/**
 * The list with this place at its head, newest first, each address
 * once.
 *
 * THE PLACE SOMEBODY IS STANDING ON IS NOT IN IT. A recall list whose
 * first row is the screen already on the display spends its most
 * valuable line on a press that does nothing — so the shell remembers
 * an address when it LEAVES it, and this is what that looks like.
 */
export function remember(list: readonly RecentPlace[], place: RecentPlace): RecentPlace[] {
  return [place, ...list.filter((p) => p.href !== place.href)].slice(0, RECENT_KEPT)
}

/**
 * The kept places as rows the finder can draw, with the verb every
 * row in that list carries.
 *
 * THE IDS ARE THEIR OWN AND NOT THE DOORS'. `readFinder` draws each
 * id once, so a recall row keyed `door:/data` would take Data OUT of
 * the five doors below it — and the five doors being there, always,
 * at rest, is what the whole direction is for. "Go back to Data" and
 * "Go to Data" are two answers to two questions, and Stripe draws
 * both for the same reason.
 */
export function recentRows(list: readonly RecentPlace[], notAt: string): FinderRow[] {
  return list
    .filter((p) => p.href !== notAt)
    .map((p) => ({
      id: `recent:${p.href}`,
      name: p.name,
      fact: p.fact,
      verb: 'Go back to it',
      target: { at: 'door' as const, href: p.href },
    }))
}
