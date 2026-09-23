/**
 * THE ADDRESSES THIS APP HAS A SCREEN FOR, in one list, in the order a person needs them.
 *
 * Written 2026-09-18 for the screen that draws a dead end. The critique measured `/nope` and
 * found a white page with the words "Not Found" on it, no dealership, no controls and no way
 * back — in an app that is otherwise entirely dark and named. A screen can only offer a way
 * out if something knows what the ways ARE, and until this file nothing did: every address in
 * the app was a string literal inside the one route that owns it.
 *
 * WHY IT IS HERE AND NOT IN A SCREEN. Which address a press lands on is a fact about the
 * app's shape, not about any one screen's layout — the same argument `src/routes/index.tsx`
 * makes when it says a document's address belongs to the route. Three screens need this list
 * (the lost screen, and the two "no quote is filed at this address" states, which were dead
 * ends of their own), and three copies of it would drift the first time an address moved.
 *
 * WHAT KEEPS IT HONEST. `src/routes/shell.test.tsx` mounts the real route tree at every href
 * below and asserts a real screen arrives — not the lost screen. So a door that stopped
 * existing, or an address that was renamed underneath this file, fails the suite instead of
 * printing an invitation to nowhere. No figure is quoted in any sentence here: what each
 * screen counts is counted on that screen, off the store.
 *
 * ── THE FIVE DOORS, ADDED 2026-09-23 WITH THE SHELL ───────────────────────────────────
 *
 * The shell (`src/screens/shell`) draws a pill over every screen but Entry, and its finder
 * offers the same doors as rows. THE PILL AND THE FINDER READ THIS ONE LIST: a second copy
 * inside either of them is how a door comes to exist in the navigation and nowhere else, or
 * to be spelled two ways in one app. `FRONT_DOORS` — the dead end's own offer, which is
 * three ways with a sentence each and not five words in a row — is now BUILT from the same
 * records rather than written again beside them, so `/` and `/quotes` are spelled once in
 * this repository and read twice.
 *
 * WHY `Data` IS A DOOR AND NOT A SETTING. "I WANT THE DATA STUFF AS ITS OWN MENU ITEM. NOT
 * UNDER ADMIN!" — the owner, in capitals. It is the fourth word on the pill, at rest, on
 * every screen, which is the whole reason `docs/research/refs/critique-m2.md` §9 refuses the
 * two directions that would have put it behind a Menu or behind a keystroke.
 */

/** A way out of where somebody is: a real address, what is there, and what it does. */
export interface Way {
  /** the address, exactly as a person would type it */
  href: string
  /** what is there, as the screen itself is named */
  title: string
  /** one sentence saying what that screen does */
  say: string
}

/**
 * ONE OF THE FIVE DOORS THE SHELL CARRIES. It is a `Way` with the three facts a pill needs
 * that a sentence does not.
 *
 * `word` AND `title` ARE BOTH HERE ON PURPOSE. A pill has room for one word and a dead end
 * has room for a name — "Quotes" on the pill, "The register" in a sentence — and a screen
 * that had to shorten a title itself would shorten it differently on the next screen.
 */
export interface Door extends Way {
  /** the one word the pill prints */
  word: string
  /** the single key that opens it from the finder, printed on the row */
  key: string
  /**
   * WHICH ADDRESSES BELONG TO THIS DOOR, as a prefix test rather than an equality: the sheet
   * at `/data/boat_highfield` is behind the Data door, and the build at `/quote/abc` is
   * behind Quotes. `at()` below resolves it, longest prefix first.
   */
  under: readonly string[]
}

/**
 * THE FIVE DOORS, in the order the pill prints them: the showroom first, then the three
 * registers a dealer works in, then the diary that reads back over all of them.
 *
 * The keys are the finder's, one press each, and none of them collides with a screen's own
 * single-key vocabulary because the finder owns the keyboard while it is open
 * (`src/screens/shell/Finder.tsx`).
 */
export const DOORS: readonly Door[] = [
  {
    href: '/',
    word: 'Home',
    key: 'H',
    title: 'Home',
    say: 'The showroom: what this dealership sells, photographed, with every draft that is open.',
    under: ['/'],
  },
  {
    href: '/quotes',
    word: 'Quotes',
    key: 'Q',
    title: 'The register',
    say: 'Every draft, issued and superseded quote in this browser, found by reference, customer or boat.',
    under: ['/quotes', '/quote'],
  },
  {
    href: '/customers',
    word: 'Customers',
    key: 'C',
    title: 'The book',
    say: 'The people and businesses this dealership sells to, and what each one has been quoted.',
    under: ['/customers'],
  },
  {
    href: '/data',
    word: 'Data',
    key: 'D',
    title: 'The tables',
    say: 'The dealer’s own file: every table it carries, and the sheet each one opens on.',
    under: ['/data'],
  },
  {
    href: '/history',
    word: 'History',
    key: 'Y',
    title: 'The diary',
    say: 'Every event on every quote in this browser, by day, with what was said at the time.',
    under: ['/history'],
  },
]

/** The picker, which is an act rather than a door: it WRITES a document. It is the third way
 *  a dead end offers and the first act the finder offers, and it is spelled here so neither
 *  of them spells it. */
export const START_A_QUOTE: Way = {
  href: '/quote/new',
  title: 'Start a quote',
  say: 'The picker: every model the Master Price File carries, by register, with what each one holds.',
}

const doorFor = (href: string): Door => {
  const found = DOORS.find((d) => d.href === href)
  /* not a guard against a caller: a door that stopped existing is a
     mistake in THIS file, and the sentence says which one */
  if (!found) throw new Error(`No door is filed at ${href}`)
  return found
}

/**
 * THE WAYS OUT OF A DEAD END, which is a different question from "where can I go": a person
 * who mistyped an address wants the showroom, the register, or to start the thing they came
 * to start. Built from `DOORS` so the addresses are spelled once.
 */
export const FRONT_DOORS: readonly Way[] = [doorFor('/'), doorFor('/quotes'), START_A_QUOTE]

/**
 * WHICH DOOR AN ADDRESS IS BEHIND, by longest prefix. `/data/boat_highfield` is Data,
 * `/quote/abc/cascade` is Quotes, and an address behind no door at all — `/sign-in`, or
 * something mistyped — answers `null`, which is what lets the pill print nothing highlighted
 * rather than guessing.
 */
export function doorAt(pathname: string): Door | null {
  const path = normalise(pathname)
  let best: Door | null = null
  let longest = -1
  for (const door of DOORS) {
    for (const prefix of door.under) {
      const hit = prefix === '/' ? path === '/' : path === prefix || path.startsWith(prefix + '/')
      if (hit && prefix.length > longest) {
        best = door
        longest = prefix.length
      }
    }
  }
  return best
}

/** A trailing slash is the same address; a query and a hash are not part of the question. */
function normalise(pathname: string): string {
  const cut = pathname.split('?')[0]!.split('#')[0]!
  return cut.length > 1 && cut.endsWith('/') ? cut.slice(0, -1) : cut
}

/**
 * THE TWO SCREENS THE SHELL DOES NOT STAND ON, and it is one address plus everything the
 * router could not match.
 *
 * Entry is the door into the app: a browser with no name in the session lands there whatever
 * was typed, and a pill offering five screens to somebody who has not said who they are
 * would be five refusals in a row. The sweep's own rule — every board, §5 — is "none puts a
 * shell on Entry".
 */
export const NO_SHELL_AT: readonly string[] = ['/sign-in']

export const hasShell = (pathname: string): boolean => !NO_SHELL_AT.includes(normalise(pathname))

/**
 * WHAT KIND OF SURFACE AN ADDRESS DRAWS, which is the one fact the pill needs about a screen
 * it knows nothing else about: over a photograph it is translucent, over a register it is
 * opaque. The same two words `e2e/routes.ts` uses, and for the same reason — a Cockpit screen
 * is a sheet a dealer works a day in, a Showroom screen is a room somebody is standing in.
 */
export type Surface = 'showroom' | 'cockpit'

export function surfaceAt(pathname: string): Surface {
  const path = normalise(pathname)
  if (path === '/quotes' || path === '/customers' || path === '/history') return 'cockpit'
  if (path === '/data' || path.startsWith('/data/')) return 'cockpit'
  return 'showroom'
}

/**
 * BACK, NAMED FOR ITS DESTINATION — the pill's `‹`.
 *
 * `docs/research/refs/shell/notes.md` §1.5 settles what it says: Linear's `‹ Changelog`, and
 * the document's own `Back to the build`, which this app already had before the shell did. So
 * the rule is one sentence: a screen inside another screen names the one it is inside, and a
 * door names nothing, because a door is where you already are.
 *
 * IT IS DERIVED FROM THE ADDRESS AND NOT REMEMBERED. A remembered back is the browser's job
 * and the browser already does it; what this answers is "what is this screen inside", which
 * is a fact about the app's shape and is the same however somebody arrived.
 */
export interface StepBack {
  href: string
  /** what is there, as the `‹` prints it */
  word: string
}

export function backFrom(pathname: string): StepBack | null {
  const path = normalise(pathname)
  const quote = /^\/quote\/([^/]+)/.exec(path)
  if (quote) {
    const id = quote[1]!
    if (id === 'new') return { href: '/quotes', word: 'Quotes' }
    /* the cascade and the paper are both inside the build that raised
       them, and the document already says so in its own words */
    if (path.endsWith('/cascade') || path.endsWith('/document')) {
      return { href: `/quote/${id}`, word: 'The build' }
    }
    return { href: '/quotes', word: 'Quotes' }
  }
  if (/^\/data\/[^/]+$/.test(path)) return { href: '/data', word: 'Data' }
  return null
}

/**
 * NO WAYS AT ALL, as one stable reference. A component that wrote
 * `ways = []` in its own signature would mint a fresh array on every
 * render and break referential equality for everything below it; this
 * is the same empty list every time, and a screen handed it draws the
 * sentence it has for being given nowhere to go.
 */
export const NO_WAYS: readonly Way[] = []
