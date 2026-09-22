/* ============================================================
   THE ROUTES THE RULERS WALK.

   One list, exported, so that adding a screen adds it to every ruler
   at once. The old repo's contrast sweep carried its own list of five
   screens, three of which had been renamed or rebuilt underneath it;
   it reported COULD NOT OPEN for a screen that no longer existed and
   clean for the two empty states, and both of the failures a human
   sweep later found were on screens it had never opened. A guard aimed
   at a screen that no longer exists is worse than no guard.

   Each route carries the proof that it arrived. `ready` is a selector
   the screen only has once it is really there, so a ruler can never
   measure the previous page, a spinner, or a blank body and call it
   clean.

   `register` says which kind of screen it is, because one ruler asks a
   question only of a register: a Cockpit screen owes 18 rows at
   1280×800, and a Showroom screen owes nothing of the sort.
   ============================================================ */

export type Register = 'foundation' | 'cockpit' | 'showroom'

export interface Route {
  /**
   * The address, as a person would type it — or, for the three screens
   * of the sale, the address with `$id` where the reference the app
   * minted goes, because a document's address does not exist until
   * somebody has pressed the act that writes one.
   */
  path: string
  /** What to call it in a ruler's report. */
  name: string
  register: Register
  /** A selector that exists only once this screen has really arrived. */
  ready: string
  /**
   * HOW A VISITOR GETS HERE, because from Milestone 1 typing the
   * address is not always enough. `fresh` is a browser nobody has used
   * — the first-visit rule sends it to the door. `through-the-door` is
   * the real flow: a name given on Entry and the Master Price File
   * loaded, which is the only way Home has a sheet to draw, since Home
   * reads this browser and never the file.
   *
   * `with-a-document` is the third mode, added 2026-09-18, and the
   * reason it exists is in `e2e/mint.ts`: the configurator, the cascade
   * and the document have no address until a quote has been minted, so
   * for six months of this rebuild the three screens the sale actually
   * happens on faced none of the five rulers. It signs in, loads the
   * file, chooses the deepest model on it and presses the act on the
   * picker — a walk, never a record planted in IndexedDB.
   *
   * It is a walk rather than a seeded localStorage key on purpose: a
   * ruler that measured a Home nobody could reach would be measuring a
   * screen the app does not have.
   */
  arrive?: 'fresh' | 'through-the-door' | 'with-a-document'
  /**
   * WHAT IS PRESSED AFTER THE QUOTE EXISTS, for a screen that even a
   * minted reference cannot address.
   *
   * `a rung` presses *See what <rung> does* on the build, because the
   * cascade's address carries `?fix=` — the pick that raised it — and a
   * ruler that typed one would be inventing a decision nobody made.
   * `the sale` addresses the draft and gives it to the customer, then
   * opens the sheet from the finale, because a draft's lines are still
   * moving and the paper a customer keeps is the issued one.
   */
  raise?: 'a rung' | 'the sale'
  /**
   * WHERE A COCKPIT SCREEN'S ROOM IS, for the density ruler: the element
   * whose box is the room a full list would have, and what stands inside
   * it that is not the list. A bare register takes only the height its
   * bands need, so the grid's own box says nothing about how many rows
   * the screen would hold. `measure/density.ts` says how it is read.
   */
  density?: { room?: string; minus?: string[] }
}

/**
 * Every screen joins this list on the day it is built, and joins five rulers by doing so.
 * `/` was Milestone 0's placeholder proof and is Home from Milestone 1; `/sign-in` is the
 * entry screen, built from the picked direction and provisional until the owner looks at it
 * (docs/SCREENS.md).
 */
export const routes: Route[] = [
  {
    path: '/',
    name: 'home',
    register: 'showroom',
    /* the stamp, which exists only once a sheet is really in the app:
       a Home drawn over a blank sheet cannot show it, so a ruler can
       never mistake the empty state for the loaded one */
    ready: '[data-testid="pack-counts"]',
    arrive: 'through-the-door',
  },
  {
    path: '/sign-in',
    name: 'entry',
    register: 'showroom',
    ready: '[data-testid="entry"]',
    arrive: 'fresh',
  },
  {
    path: '/quotes',
    name: 'quotes',
    /* THE FIRST COCKPIT SCREEN, and it is one: dense, worked in, and
       it owes eighteen rows at 1280×800.

       IT IS REACHED WITH A DOCUMENT ON IT, from 2026-09-22. Until then
       every ruler opened a browser nobody had used and `density` read
       "6 rows" off an empty register — three band heads and three
       notices — a number that meant nothing either way, and the day
       the walk could mint a quote it was the one red line on the gate.
       Now the walk mints one and the ruler reads the pitch of that
       real row against the room the list is given: `.qr-body` is the
       screen grid's own list track, the same height bare or full, and
       `.qr-act` is the act row that stands under the list inside it.
       `e2e/flows/quotes.spec.ts` reads the same two boxes against the
       register's `--row-h` token, so the token and the drawn row are
       measured to agree. */
    register: 'cockpit',
    /* the register, ONCE IT HAS READ THIS BROWSER: `data-read` is the
       store's own `loaded`. The main element is on the page before the
       read lands, and a ruler that measured then counted the band heads
       and not the document the walk had just filed. */
    ready: '[data-testid="quotes"][data-read]',
    arrive: 'with-a-document',
    density: { room: '.qr-body', minus: ['.qr-act'] },
  },
  {
    /* THE PICKER, and it is a Showroom screen rather than a Cockpit
       one. Its middle column is a register of 289 models and it is
       dense — but a Cockpit screen is a sheet a dealer works a day in,
       and this is the room somebody is standing in while a hull is
       chosen. Claiming `cockpit` to collect a ruler would be claiming
       the wrong thing about the screen. */
    path: '/quote/new',
    name: 'picker',
    register: 'showroom',
    /* the masthead's counted line, which exists only once a sheet is
       really in the app: over a blank sheet the picker draws the blank
       state instead, so no ruler can measure the empty one and report
       it as the loaded one */
    ready: '[data-testid="picker-counts"]',
    arrive: 'through-the-door',
  },
  {
    /* THE BUILD, AND THE FIRST OF THE THREE SCREENS THE SALE HAPPENS ON.

       All three were deliberately absent from this list until
       2026-09-18, with the same sentence in all three of their flow
       specs: every ruler opens a browser nobody has used, and neither
       `fresh` nor `through-the-door` reaches a document. The critique of
       that day measured what the gap cost — 11px labels at 2.99 : 1 on
       this screen, shipped green, because the contrast ruler had never
       opened it. `with-a-document` is the third mode, and building it
       was a change to this file and `e2e/shots/recipe.ts` rather than to
       any screen.

       `showroom` and not `cockpit`. A Cockpit screen is a sheet a dealer
       works a day in and owes eighteen rows at 1280×800; this is the
       room a customer is standing in while their boat is specified, and
       its options are tiles rather than a grid's rows. Claiming
       `cockpit` to collect a sixth ruler would be claiming the wrong
       thing about the screen, which is the trap `docs/DECISIONS.md`
       records the register refusing in the other direction.

       READY IS THE RUNNING PRICE AND NOT THE SCREEN'S OWN NAME: the same
       component draws "no quote is filed at this address", and for the
       first few hundred milliseconds of a cold load that is honestly
       what it does not yet know. The total exists only once a document
       is really in hand. */
    path: '/quote/$id',
    name: 'configurator',
    register: 'showroom',
    ready: '[data-testid="running-total"]',
    arrive: 'with-a-document',
  },
  {
    /* THE CASCADE, REACHED BY THE PRESS THAT RAISES IT.

       Its address carries `?fix=` — the pick the decision is about — and
       a sheet with nothing to decide on it is refused by the engine, so
       a typed address would have measured the refusal rather than the
       screen. `raise: 'a rung'` presses *See what <rung> does* on the
       build, which is the one channel a dealer reaches it by that costs
       nothing to set up; the other, a finish that moves the total, is
       measured in the screen's own flow. */
    path: '/quote/$id/cascade',
    name: 'cascade',
    register: 'showroom',
    ready: '[data-testid="decision"]',
    arrive: 'with-a-document',
    raise: 'a rung',
  },
  {
    /* THE DOCUMENT, ISSUED, BECAUSE THAT IS THE ONE A CUSTOMER HOLDS.

       A draft renders here too and says `Quotation · draft` on its
       masthead, but a draft's lines are still moving and the finale
       offers no sheet to open until there is something frozen to draw.
       `raise: 'the sale'` therefore addresses the quote and gives it to
       the customer before opening it — so what five rulers measure is
       the object the flow exists to produce.

       `showroom`: it is the least Cockpit surface in the app. It is a
       sheet of A4 that a person is handed, and it has no rows in the
       sense a register does — the lines on it are the ones that were
       frozen, and the paginator's own flow counts them. */
    path: '/quote/$id/document',
    name: 'document',
    register: 'showroom',
    ready: '[data-testid="document-total"]',
    arrive: 'with-a-document',
    raise: 'the sale',
  },
  {
    /* THE DEAD END, AND IT IS A ROUTE IN THIS LIST WITHOUT BEING A ROUTE
       IN THE APP. `/nope` matches nothing, which is the point: what
       draws here is the root's `notFoundComponent`, and it is a built
       screen with its own stylesheet rather than a fallback. Until
       2026-09-18 what drew here was a white page with the words "Not
       Found" on it — measured by the flow critique with zero buttons on
       it — so the one surface in this app a person could reach and not
       leave was also the one surface no ruler had ever opened.

       `foundation` and not `showroom`: it is nobody's register. It owes
       contrast, cut, overlap and the ramp at six viewports, and it owes
       no row count, because a screen about an address has no rows.

       THROUGH THE DOOR rather than fresh, because a person who mistypes
       an address is a person already working: that state has the
       dealership's name on it and the blank one does not, so the walk
       measures the screen a dealer actually meets. */
    path: '/nope',
    name: 'lost',
    register: 'foundation',
    ready: '[data-testid="lost"]',
    arrive: 'through-the-door',
  },
]

export const cockpitRoutes = (): Route[] => routes.filter((r) => r.register === 'cockpit')
