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
   * ONE PRESS ON THE SCREEN ITSELF, AFTER ARRIVING, for a screen whose
   * register does not exist until somebody makes it.
   *
   * `file the name` presses the one act on the customers screen's pile
   * — the names typed on quotes with nobody filed behind them — which
   * is the only thing in this app that creates the customer register.
   * Without it the density ruler opens a book that is honestly empty
   * and has no row to read a pitch off. `e2e/shots/recipe.ts` says why
   * it is a press and not a planted row.
   */
  then?: 'file the name'
  /**
   * WHICH LIST A COCKPIT SCREEN'S DENSITY IS MEASURED ON: the element that
   * carries the register's `role="grid"`, the box its rows scroll in. The
   * route names the list and nothing else. The room a full list would
   * have is asked of the layout by the ruler — the list is made taller
   * than any window for the length of one measurement — so what stands
   * round it (an act row, a legend, a filing form, the pill) comes off
   * the figure without any route having to declare it, and cannot go
   * stale when a builder moves it. Until 2026-09-23 this named a box and
   * the furniture inside it, and three of five declarations had drifted
   * from the screens they described. `measure/density.ts` says how it is
   * read.
   */
  density?: { list: string }
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
       a Home in a browser with no copy of the file cannot show it, so a ruler can
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
       real row against the room `.qr-list` has once it is full — the
       act row under it is pushed to the foot of the frame and comes off
       the figure by itself. The ruler is the only density reading of
       this screen; `e2e/flows/quotes.spec.ts` no longer adds up its own. */
    register: 'cockpit',
    /* the register, ONCE IT HAS READ THIS BROWSER: `data-read` is the
       store's own `loaded`. The main element is on the page before the
       read lands, and a ruler that measured then counted the band heads
       and not the document the walk had just filed. */
    ready: '[data-testid="quotes"][data-read]',
    arrive: 'with-a-document',
    density: { list: '.qr-list' },
  },
  {
    /* THE PICKER, and it is a Showroom screen rather than a Cockpit
       one: seven makers' doors at rest, then a maker's boats as
       photographs, then one boat on its plate — the room somebody is
       standing in while a boat is chosen, not a sheet a dealer works a
       day in. Claiming `cockpit` to collect a ruler would be claiming
       the wrong thing about the screen. */
    path: '/quote/new',
    name: 'picker',
    register: 'showroom',
    /* the masthead's counted line, which exists only once a sheet is
       really in the app: with no file in this browser the picker draws
       the teaching state instead, so no ruler can measure the empty one and report
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
    /* THE DIARY, AND IT IS THE SECOND COCKPIT SCREEN: dense, worked in,
       and it owes eighteen lines at 1280×800.

       IT IS REACHED WITH A DOCUMENT ON IT, the register's way: the walk
       mints one, waits the write-behind out and reloads onto this
       address, so the ruler reads the pitch of a real line under a real
       day head rather than the teaching state. The walk's clock is
       fixed, so the document it mints is under Today — one node, one
       line, which is the honest state of a browser somebody has just
       started one quote in.

       `.hy-spine` is the list: the port the lines scroll in, holding the
       grid and, after it, the spine's own end — where the diary began,
       which is not a row, so the ruler neither counts it nor takes it
       off the room (2026-09-23). The ruler makes the port full, and the
       foot under it stays at the foot of the body. Today's node is a
       band head and comes off the room. `e2e/flows/history.spec.ts`
       reads this same measurement to ask the stricter question its
       builder set — eighteen with two more day nodes standing. */
    path: '/history',
    name: 'history',
    register: 'cockpit',
    /* the diary, ONCE IT HAS READ THIS BROWSER: `data-read` is the
       store's own `loaded`, for the reason the register gives */
    ready: '[data-testid="history"][data-read]',
    arrive: 'with-a-document',
    density: { list: '.hy-spine' },
  },
  {
    /* THE SHEET — THE PRICE LIST — on the file's worst table. Highfield
       Inflatables is 588 rows in 33 columns under series ▸ model ▸
       variant, and its first chapter is the Roll-Up series — eight
       models of four rows, the most models per row on the pack — so the
       density ruler reads the resting state where the eighteen were
       hardest to hold. Since 2026-09-23 a model costs no line of its
       own: its spine stands beside its rows (`src/screens/sheet/sheet.css`,
       "THE DENSITY ARITHMETIC"), and the one head in the room is the
       series band. A Cockpit screen: a dealer works a day in it.

       `ready` is the screen's own `data-read`, set once the store has
       answered: the same main draws "Reading what this browser has
       kept…" for the first paint, and a ruler that measured then would
       measure a sentence. THROUGH THE DOOR, because the sheet reads
       this browser and never the file: only the blue door on Entry
       puts a table where this address can find it.

       THE LIST is the virtualiser's own scroller, `.sh-grid`, and it is
       already full: the room runs from the series band under the column
       heads to the foot of the scrollport. The band is a `rowgroup` whose
       one row is its head, and the ruler subtracts it; a model is a
       `rowgroup` whose first row is already a variant, its spine a
       rowheader beside it, so it subtracts nothing. The pairings are
       measured by the same ruler in `e2e/flows/sheet.spec.ts`. */
    path: '/data/boat_highfield',
    name: 'sheet',
    register: 'cockpit',
    ready: '[data-testid="sheet"][data-read]',
    arrive: 'through-the-door',
    density: { list: '.sh-grid' },
  },
  {
    /* THE SHEET'S PICTURES DOOR, on the same first chapter — Roll-Up,
       where the second critique counted 7 of 8 tiles as one refusal
       repeated (built-critique-m2-close.md §9). Until 2026-09-24 no
       ruler had opened this door at all. `foundation`: it owes
       contrast, cut, overlap and the ramp at six viewports, and no row
       count — it is a plate of pictures and a short list of names, not
       a register. `ready` is the gallery itself, which exists only once
       the store has answered and the door is open. */
    path: '/data/boat_highfield?door=pictures',
    name: 'sheet-pictures',
    register: 'foundation',
    ready: '[data-testid="sheet"][data-read] [data-testid="sheet-gallery"]',
    arrive: 'through-the-door',
  },
  {
    /* THE LETTER — CUSTOMERS AT REST, and the first of this screen's TWO
       rows in this list.

       ONE SCREEN, TWO STATES, AND A RULER CAN ONLY OPEN ONE OF THEM.
       `/customers` opens on ONE PERSON, as a page; `?book=all` is the
       door to the register of everybody. The density ruler has to be
       pointed at the book, because that is the part with rows — and if
       that were the only row here, the four rulers that measure type,
       contrast, truncation and overlap would never once have opened the
       state a dealer actually arrives in. That is exactly how the
       configurator shipped 11px labels at 2.99 : 1 (see the build's own
       entry below): a screen nobody's ruler opened. So the resting
       state gets its own row.

       `foundation` and not `cockpit`. It is a letter about one person
       and it has no rows in the sense a register does, the same reason
       `/nope` carries `foundation` — it owes contrast, cut, overlap and
       the ramp at six viewports and owes no row count. The row below
       carries the register's claim and the eighteen rows with it.

       NO PRESS AFTER ARRIVING, since 2026-09-24 (M2-close critique #7):
       the person the sale names is a customer the moment the name is
       typed, so the walk lands on their page with nothing filed. */
    path: '/customers',
    name: 'customers',
    ready: '[data-testid="customers"][data-read][data-mode="letter"]',
    register: 'foundation',
    arrive: 'with-a-document',
    raise: 'the sale',
  },
  {
    /* THE BOOK, AND IT IS THE FOURTH COCKPIT SCREEN: the register of the
       people this dealership sells to, dense, worked in, and owing
       eighteen rows at 1280×800. It is the second of this screen's two
       rows; the one above says why there are two.

       IT IS REACHED WITH A DOCUMENT *AND* A PERSON. The walk goes
       through the whole sale — which is where a name is typed, at the
       desk, by a person — and reloads onto this address, where that
       name is a customer with nothing more pressed (2026-09-24, M2-close
       critique #7: until then a second act had to FILE the name off a
       pile before the list had a row, and the route pressed it). No
       planted row, and the list the ruler measures is the list a dealer
       would have.

       THE ADDRESS CARRIES `?book=all` because the letter is this
       screen's resting state and the BOOK is the part that owes rows.
       A position inside a screen is a search param here, so naming the
       book is the same act as typing the address of it.

       `.cu-list` is the list, and the ruler makes it full: whatever the
       book stands under it — its act row, a filing form, the glance — is
       pushed down by a full list exactly as far as this screen's layout
       pushes it, and the room is what is left above the fold. The
       figure that stood here ("727px less 70px … holds 23") was read
       before the pill existed and was not true on 2026-09-23.
       `e2e/flows/customers.spec.ts` reads this same measurement to ask
       the stricter question its builder set — eighteen with the four
       desk groups standing. */
    path: '/customers?book=all',
    name: 'customers-book',
    register: 'cockpit',
    /* the book, ONCE IT HAS READ BOTH STORES AND IS SHOWING THE LIST:
       `data-read` is the two stores' own `loaded`, and `data-book` is
       set only in the book's own mode — so no ruler can measure the
       letter, the teaching state, or a sentence about reading. */
    ready: '[data-testid="customers"][data-read][data-book]',
    arrive: 'with-a-document',
    raise: 'the sale',
    density: { list: '.cu-list' },
  },
  {
    /* DATA, AND IT IS THE THIRD COCKPIT SCREEN: the register of the
       dealer's own tables, at its own door — "I WANT THE DATA STUFF AS
       ITS OWN MENU ITEM. NOT UNDER ADMIN!" — dense, worked in, and it
       owes eighteen rows at 1280×800.

       THROUGH THE DOOR, because this screen reads this browser and never
       the file: only the blue door on Entry puts a table where this
       address can find it, and with no file in this browser it draws the teaching
       state instead, which has no rows in it at all. It needs no
       document: its records are the tables the file brought, so the walk
       that mints a quote would cost two minutes and change nothing it
       measures.

       `ready` is the screen's own `data-read`, set once the catalogue
       store has ANSWERED — the same main draws "Reading what this
       browser has kept…" for the first paint, and a ruler that measured
       then would measure a sentence.

       THE LIST is `.dt-list`, the ledger's own scroller, with the legend
       under it. The plates above it are not in the room, which is the
       point: they are what this screen spends its height on, and the
       ruler reads what is left. Its rows are `rowgroup`s per place with
       no head row of their own — the place is a cell in the margin of
       its first row — so the ruler's `heads` reading is 0 here and every
       row in the room is a record. On this file all eighteen registers
       are drawn at once, and until 2026-09-23 the ruler counted all
       eighteen as readable because they were inside the WINDOW, while
       the last two were outside the list's own scrollport. */
    path: '/data',
    name: 'data',
    register: 'cockpit',
    ready: '[data-testid="data"][data-read]',
    arrive: 'through-the-door',
    density: { list: '.dt-list' },
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
