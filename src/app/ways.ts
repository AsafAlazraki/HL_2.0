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
 * WHAT KEEPS IT HONEST. `src/routes/-shell.test.tsx` mounts the real route tree at every href
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
 * has room for a name — "Quotes" on the pill, "Every quote" in a sentence — and a screen
 * that had to shorten a title itself would shorten it differently on the next screen.
 */
export interface Door extends Way {
  /** the one word the pill prints */
  word: string
  /**
   * WHICH ADDRESSES BELONG TO THIS DOOR, as a prefix test rather than an equality: the sheet
   * at `/data/boat_highfield` is behind the Data door, and the build at `/quote/abc` is
   * behind Quotes. `at()` below resolves it, longest prefix first.
   */
  under: readonly string[]
  /**
   * THE SCREENS BEHIND THIS DOOR THAT ARE NOT ON THE PILL (2026-10-22, Fitment). A screen that
   * reads the same thing the door opens — what fits which boat is the price list read one boat
   * at a time — lights this door while a person is on it (it is in `under`), and the finder
   * offers it by name. It is here, on the door, so the one list stays one list: the pill draws
   * the doors, the finder draws the doors and their rooms, the door's own screen draws its rooms
   * at its head (Data, `src/screens/data`), and no address is spelled twice.
   *
   * A ROOM IS DRAWN WHERE ITS DOOR OPENS, NOT ONLY IN THE FINDER (2026-10-22, the critique of
   * Milestone 3, blocker 1: "three of the four new screens have no door"). Until then a room was
   * reachable only by somebody who already knew to type its word into the finder.
   */
  rooms?: readonly Room[]
}

/** A screen behind a door: an address, its word in the finder, and what it does. */
export interface Room extends Way {
  word: string
}

/**
 * THE FIVE DOORS, in the order the pill prints them: the showroom first, then the three
 * registers a dealer works in, then the diary that reads back over all of them.
 *
 * NO DOOR HAS A KEY (2026-09-25). Each had a letter, reached as `G` then that letter from
 * anywhere and printed on its row in the finder; no letter is a shortcut in this app now
 * (WCAG 2.2 SC 2.1.4), and the pill prints every door on every screen.
 */
export const DOORS: readonly Door[] = [
  {
    href: '/',
    word: 'Home',
    title: 'Home',
    say: 'Who to call, the quotes being written, and every maker’s boats.',
    under: ['/', '/manage'],
    /* MILESTONE 4 (2026-10-29): Northside's own room, behind its front page. The pill keeps the
       five doors its phone bar was measured for, so Settings is a room of Home — Home is
       Northside's own page, and Settings is where Northside makes Home, its quotes and the app
       its own. Home's own "Arrange Home" opens it, and the finder finds it by its word. */
    rooms: [
      {
        href: '/manage',
        word: 'Settings',
        title: 'Northside, as it prints and shows',
        say: 'Northside’s details on every quote, its people, its colour and pictures, and what its front page shows.',
      },
    ],
  },
  {
    href: '/quotes',
    word: 'Quotes',
    title: 'Every quote',
    say: 'Every quote, draft, given or replaced, found by its number, the customer or the boat.',
    under: ['/quotes', '/quote'],
  },
  {
    href: '/customers',
    word: 'Customers',
    title: 'Every customer',
    say: 'The people and businesses this dealership sells to, and what each one has been quoted.',
    under: ['/customers'],
  },
  {
    href: '/data',
    word: 'Data',
    title: 'The price list',
    say: 'The Master Price File itself: every list it carries, open to read and change.',
    under: ['/data', '/places', '/rules', '/fitment', '/review', '/levels', '/shelf'],
    /* THE PRICE LIST'S ROOMS. Milestone 3's four, in the order its brief meets them: say what may be
       sold with what, see what fits a boat and why the rest do not, find what is wrong, set what
       things cost. Data draws them at its head; the finder offers them by word.

       NO PLACES ROOM (2026-10-30, built-critique-m4.md major 1): Milestone 4 put a second register
       of the same 25 lists here, cards on colours beside Data's plates and rows, with the same
       figures and Data lit on both. Simple wins: Data is the one register, and a maker's own page
       (`/places/$id`, its line, mark, photograph and colour) is opened from its spread on Data.
       `/places` alone sends a person to Data. */
    rooms: [
      {
        /* MILESTONE 3 (2026-10-22): the business's own rules, written in a sentence and refused
           in the build on the next pick. It stood on the pill as a sixth door until the critique
           of Milestone 3 (blocker 1): six words do not fit a phone's bar, so in a hand it was in
           the finder alone and left the bar the moment a person left it. Behind Data, like the
           other three rooms, it is one press from Data's head at every size, and the pill keeps
           the five doors its bar was measured for (2026-09-23). */
        href: '/rules',
        word: 'Rules',
        title: 'What may be sold with what',
        say: 'The rules Northside sets on what may be sold with what, and what each refuses in the build.',
      },
      {
        /* MILESTONE 3 (2026-10-22): the price list read one boat at a time — board C of
           docs/directions/fitment-boards/ drew it with Data lit */
        href: '/fitment',
        word: 'Fitment',
        title: 'What goes on a boat',
        say: 'One boat, every motor, trailer and fit-out that goes on it, and why the rest do not.',
      },
      {
        /* MILESTONE 3 (2026-10-22): what is wrong in the price list, each with its fix beside it.
           Board A of docs/directions/review-boards/ drew it as a door of its own; a sixth door does
           not fit the pill at 834 (measured 2026-10-22: History ran under Find), so it is the
           price list's own room, with Data lit while it is open */
        href: '/review',
        word: 'Review',
        title: 'What is wrong in the price list',
        say: 'A trailer registered as the wrong size, a line on sale with no price, one name at two prices: each with its fix.',
      },
      {
        /* MILESTONE 3 (2026-10-22, rebuilt 2026-10-28 as direction F of
           docs/directions/levels-boards/, "Yours to decide"): the price decisions only Northside
           can make, what it works from cost and keeps to itself, and every other list's price as
           the price list sets it. The pill holds no sixth door at 834 (Review's measure, above),
           so it is a room of the price list, with Data lit while it is open */
        href: '/levels',
        word: 'Prices',
        title: 'What only you can decide about price',
        say: 'Which figure a quote shows where the price list has not said, Warranty kept to Northside, and Trade as a share of Cash.',
      },
      {
        /* MILESTONE 4 (2026-10-30, board D of docs/directions/shelf-boards/, "The safe", drawn with
           Data lit): where a new version of the Master Price File comes in, every change shown
           before it is written, and where Northside's own work is saved as one file and brought
           back on a new computer. Last, because it is the rarest thing done to the price list. */
        href: '/shelf',
        word: 'Shelf',
        title: 'A new price list, and Northside’s work kept safe',
        say: 'Bring in a new Master Price File and see every change before it is written; save a copy of Northside’s work and bring it back on a new computer.',
      },
    ],
  },
  {
    href: '/history',
    word: 'History',
    title: 'The diary',
    say: 'Everything that happened to every quote, day by day, in the words it was said in.',
    under: ['/history'],
  },
]

/**
 * THE PRICE LIST'S ROOMS, as the one door that carries them lists them — what Data draws at
 * its head, in the same order and the same words the finder offers (2026-10-22).
 */
export const PRICE_LIST_ROOMS: readonly Room[] = DOORS.find((d) => d.href === '/data')?.rooms ?? []

/**
 * TWO ROOMS OPENED AT A PLACE IN THEM, spelled here beside the rooms so an address and its
 * position are written once: Prices with one list's prices open (its route's `list`), and
 * Fitment on one boat (its route's `boat`, the boat's line on the price list). Data's spread
 * reaches both — "Prices: Cash · Trade" opens that maker's prices, and what goes with a boat
 * maker opens Fitment on one of its boats (the critique of Milestone 3, blocker 1).
 */
export const pricesOf = (list: string): string => `/levels?list=${encodeURIComponent(list)}`
export const fitmentOf = (boat: string): string => `/fitment?boat=${encodeURIComponent(boat)}`
/** A MAKER'S OWN PAGE — its line, mark, photograph and colour — as `/places/$id` reads it: the
 *  list it stands for (`addressOf`, src/domain/modules/livery.ts). */
export const placeOf = (address: string): string => `/places/${encodeURIComponent(address)}`

/** The picker, which is an act rather than a door: it WRITES a document. It is the third way
 *  a dead end offers and the first act the finder offers, and it is spelled here so neither
 *  of them spells it. */
export const START_A_QUOTE: Way = {
  href: '/quote/new',
  title: 'Start a quote',
  say: 'Choose the boat, every model on the price list by maker, and the quote starts on it.',
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
 *
 * THE LIT DOOR IS THE WAY BACK TO ITS REGISTER. Until 2026-09-23 the pill also drew a `‹`
 * named for where it went — `‹ Data` on a sheet, `‹ Quotes` on a build, `‹ The build` on the
 * cascade and the paper — and every one of them said a destination something else in the same
 * window already said: the lit `Data 53` three words along, or the screen's own "Back to the
 * build" (critique of Milestone 2, #13: "four ways back in one window, and the word 'Data'
 * three times"). The pill now carries the doors and nothing else, and a screen inside a
 * document carries its own way back, which knows more than an address can (the cascade's
 * returns to the chapter it was raised from).
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
  /* fitment reads the price list on the room's plain ground, not over a photograph */
  if (path === '/fitment') return 'cockpit'
  /* the rules are written on a plain ground, not over a photograph: the pill stands opaque */
  if (path === '/rules') return 'cockpit'
  /* the checks stand on a plain ground, not over a photograph */
  if (path === '/review') return 'cockpit'
  /* the prices are a ladder on a plain ground, not over a photograph */
  if (path === '/levels') return 'cockpit'
  /* Settings stands on paper and on water, never over a photograph: the pill stands opaque */
  if (path === '/manage') return 'cockpit'
  /* a maker's own page stands on the room's plain ground, its photograph inside its head */
  if (path === '/places' || path.startsWith('/places/')) return 'cockpit'
  /* the shelf stands on the room's plain ground, its blue band the only water on it */
  if (path === '/shelf') return 'cockpit'
  return 'showroom'
}

/**
 * THE APP'S OWN NAME, as the browser's tab already prints it (`index.html`'s `<title>`, which
 * `ways.test.ts` holds this to). It is said where no dealership has been named yet — the
 * crest's accessible name before a file is read (`src/domain/shell/crest.ts`) — and nowhere a
 * dealership's own name belongs.
 */
export const APP_NAME = 'HelmLogic'

/**
 * NO WAYS AT ALL, as one stable reference. A component that wrote
 * `ways = []` in its own signature would mint a fresh array on every
 * render and break referential equality for everything below it; this
 * is the same empty list every time, and a screen handed it draws the
 * sentence it has for being given nowhere to go.
 */
export const NO_WAYS: readonly Way[] = []
