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

/**
 * HOME HAS THE FILE IN — the signal every walk to Home waits on. Until 2026-10-31 it was the
 * price list's stamp, "Price list of 16 September 2026" (`data-testid="pack-counts"`), and the
 * owner removed it from Home: "Let's remove the price list of 16 september on home page". What
 * stands now is the screen's own root, which says `data-file="open"` only once a sheet is really
 * in the app — never in a browser with no copy of the file, so a ruler still cannot mistake the
 * empty state for the loaded one — and `data-from`, where that sheet came from on this open.
 */
export const HOME_READY = '[data-testid="home"][data-file="open"]'

/** Home with the file in, read from the pack (Entry's open) or out of this browser. */
export const homeFrom = (from: 'pack' | 'repository'): string =>
  `${HOME_READY}[data-from="${from}"]`

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
   *
   * `the package` presses *View final package* at the build's foot (2026-10-31): the final
   * package stands over the build at the build's own address, so it is reached by its act.
   */
  raise?: 'a rung' | 'the sale' | 'the package'
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
    /* the root's `data-file="open"`, which exists only once a sheet is really in the app:
       a Home in a browser with no copy of the file cannot carry it, so a ruler can never
       mistake the empty state for the loaded one (HOME_READY, above) */
    ready: HOME_READY,
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
    /* IT IS REACHED WITH A DOCUMENT ON IT, from 2026-09-22: the walk mints one, so the rulers
       read a real deal rather than an empty desk. */
    /* A DESK OF DEALS FROM 2026-10-30, NOT A COCKPIT: the owner's "i dont like the quotes home
       page" redesigned it as one card per deal led by its picture, its customer and its total
       (docs/DECISIONS.md), so the eighteen-row density a ledger owed is no longer its measure. */
    register: 'showroom',
    /* the desk, ONCE IT HAS READ THIS BROWSER: `data-read` is the store's own `loaded` */
    ready: '[data-testid="quotes"][data-read]',
    arrive: 'with-a-document',
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
    /* THE FINAL PACKAGE (the owner, 2026-10-31: "let's go view final package … and we can see the
       pdf quote preview"), over the whole window at the build's own address, `?at=finale`: the
       boat, its handover card, every line, and the printed quote rendered beside them. Reached by
       its act, as a dealer reaches it, on a draft nobody is named on yet, so the refusal under the
       give and the name's own fields are measured too. */
    path: '/quote/$id',
    name: 'final package',
    register: 'showroom',
    ready: '[data-testid="final-package"]:not([data-preparing])',
    arrive: 'with-a-document',
    raise: 'the package',
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
    /* ONE LINE'S DETAILS, WITH ITS GALLERY (2026-11-02): the Formosa GRT 425 (Tiller), whose
       photograph on the water, the price list's own picture and its studio picture are one
       gallery under its name, the cover first, and the acts on the picture picked. Where a dealer
       keeps a boat's pictures outside the build, measured at six viewports like every screen.
       `ready` is the gallery's own strip, drawn only once the line's details are open and its
       pictures read. */
    path: '/data/boat_formosa?at=boat_formosa%3A1',
    name: 'sheet-record-pictures',
    register: 'foundation',
    ready: '[data-testid="sheet"][data-read] [data-testid="sheet-record"] .ui-addpic-strip',
    arrive: 'through-the-door',
  },
  {
    /* A LIST THAT IS NOT A BOAT LIST (the sheet's data round, 2026-11-03): Parts & Accessories,
       2,937 products in 188 categories, each category a band over its products. The judge found
       the finder standing 9px over the bar's own sentence at 834 and a price head drawn under the
       lit one at 1440 and 1920 here, and no ruler had opened a list that is not a boat list.
       `foundation`: contrast, cut, overlap and the ramp at six viewports. */
    path: '/data/parts',
    name: 'sheet-parts',
    register: 'foundation',
    ready: '[data-testid="sheet"][data-read] [data-testid="sheet-grid"]',
    arrive: 'through-the-door',
  },
  {
    /* A SEARCH THAT FINDS NOTHING (2026-11-03): the sentence where the list would be, the other
       lists that carry the words, and the way back — a state that was column heads over a blank
       page until the data round. */
    path: '/data/boat_highfield?find=F4SMHA',
    name: 'sheet-nothing',
    register: 'foundation',
    ready: '[data-testid="sheet"][data-read] [data-testid="sheet-nothing"]',
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
    /* DATA (direction A, "The Monday list", 2026-11-03): the Master Price File as one place —
       what needs Northside, what is new, the rooms, then every list it carries. A FOUNDATION
       and no longer a Cockpit register: the judge of Data (docs/directions/data-round/data/
       judge.md) found the screen a register of containers with no place for the price file's
       state, and the direction the owner's brief asks for leads with that state above the
       inventory, so the eighteen lists stand under it and are not owed in the first window at
       1280×800 (docs/DECISIONS.md, 2026-11-03). All eighteen are still one ledger, counted by
       data.spec.

       THROUGH THE DOOR, because this screen reads this browser and never the file; `ready` is
       the screen's own `data-read`, set once the catalogue store has answered. */
    path: '/data',
    name: 'data',
    register: 'foundation',
    ready: '[data-testid="data"][data-read]',
    arrive: 'through-the-door',
  },
  {
    /* DATA ANSWERING A FIND (2026-11-03, the judge's L5): one find over the whole price file,
       its answer drawn under the field and the tiles and the ledger narrowed. F115 is a code the
       file carries in 306 lines across twelve lists, so the answer is at its longest here. */
    path: '/data?find=F115',
    name: 'data-find',
    register: 'foundation',
    ready: '[data-testid="data-answer"]',
    arrive: 'through-the-door',
  },
  {
    /* THE LIST NO LONGER SOLD, OPENED (the judge's L3: at 390 its spread scrolled the page to
       425px, and no ruler had ever opened it) */
    path: '/data?at=trl_obsolete',
    name: 'data-obsolete',
    register: 'foundation',
    /* at rest: the arrival's scroll has been made (Data.tsx, `data-rested`) */
    ready: '[data-testid="data"][data-rested] [data-testid="data-page"]',
    arrive: 'through-the-door',
  },
  {
    /* A MAKER'S SPREAD ON DATA, with the door to its own page (2026-10-30, built-critique-m4.md
       major 1: Data is the one register of the lists, and a place's line, mark, photograph and
       colour are one press from its spread). FOUNDATION: one maker read in one look. `ready` is
       the door itself, which exists only once the store has answered and the place is found. */
    path: '/data?at=boat_stacer',
    name: 'data-stacer',
    register: 'foundation',
    ready:
      '[data-testid="data"][data-rested] [data-testid="data-page"] a[href="/places/boat_stacer"]',
    arrive: 'through-the-door',
  },
  {
    /* RULES (Milestone 3, rebuilt 2026-10-28 as board A, "The house rules"): where a dealer
       says what may be sold with what. A SHOWROOM and not a Cockpit register: its clauses are
       the seven its price list keeps and the handful Northside writes, read rather than worked
       eighteen at a time. It owes contrast, cut, overlap and focus at six sizes, and no row
       count. THROUGH THE DOOR, because the rules are filed beside the sheet this browser keeps;
       `data-read` is set only once that sheet is in, so no ruler measures "Reading the price
       list…". At rest nothing is open. */
    path: '/rules',
    name: 'rules',
    register: 'showroom',
    ready: '[data-testid="rules"][data-read]',
    arrive: 'through-the-door',
  },
  {
    /* RULES, WRITING (2026-10-28): a new clause open under Motors, with its count and the boats
       as marks in the margin beside it at 1280 and wider, and under it below. Measured on its own
       because the margin is where an overlap would be: the noticed box above the count, the count
       beside the sentence, the act beside both. `data-testid="census"` exists only once the
       clause has read the sheet. */
    path: '/rules?open=new:motor',
    name: 'rules-writing',
    register: 'showroom',
    ready: '[data-testid="rules"][data-read] [data-testid="census"]',
    arrive: 'through-the-door',
  },
  {
    /* FITMENT AT REST (Milestone 3, rebuilt 2026-10-28 as direction F, "The plate"): one boat —
       the SP660 the board was drawn on, by its line on the price list — on its own riveted plate,
       the Motor line pressed open under it: seven priced tiles and four reasons. `foundation`:
       a plate, tiles and a handful of reasons, not a register, so it owes contrast, cut, overlap
       and focus at six sizes and no row count; Show all below carries the register. THROUGH THE
       DOOR, because it reads the price list this browser keeps, and `data-boat` is set only once
       the boat has really been read, so no ruler measures "Looking for the price list…" or the
       boat chooser. */
    path: '/fitment?boat=boat_highfield%3A513',
    name: 'fitment',
    register: 'foundation',
    ready: '[data-testid="fitment"][data-read][data-boat][data-mode="plate"]',
    arrive: 'through-the-door',
  },
  {
    /* FITMENT'S TRAILER LINE: E's answer under F's plate — two trailers, each an ATM bar with
       what really goes on the road ticked on it (the boat, its motor and the trailer itself), the
       one-trailer rule where the second is offered, and three reasons. Measured on its own
       because the ticks, the warning and the rule are where an overlap or a cut would be. */
    path: '/fitment?boat=boat_highfield%3A513&line=trailer',
    name: 'fitment-trailer',
    register: 'foundation',
    ready: '[data-testid="fitment"][data-read][data-boat][data-mode="plate"] .ft-trailers',
    arrive: 'through-the-door',
  },
  {
    /* FITMENT'S SHOW ALL, THE COCKPIT REGISTER: every trailer on sale for the SP660, grouped by
       the reason each is or is not offered — 2 made for it, then 10, 131 in six makers and 291
       — on one tab stop. `.ft-list` is the grid; its group heads are the first row of each
       rowgroup and come off the room. The address names the list, as a position does. */
    path: '/fitment?boat=boat_highfield%3A513&all=trailer',
    name: 'fitment-all',
    register: 'cockpit',
    ready: '[data-testid="fitment"][data-read][data-boat][data-mode="all"]',
    arrive: 'through-the-door',
    density: { list: '.ft-list' },
  },
  {
    /* FITMENT WITH NO BOAT CHOSEN, THE PLATE ASKING (built-critique-m3.md, major 7): the same
       riveted plate with "Which boat?" as its name, the field and seven makers' own marks on it,
       and the three lines a boat answers in words. What a stakeholder sees on pressing Fitment,
       so the rulers measure it at six sizes. `data-mode="choose"` is drawn only once the price
       list has been read, so no ruler measures "Looking for the price list…". */
    path: '/fitment',
    name: 'fitment-choose',
    register: 'foundation',
    ready: '[data-testid="fitment"][data-read][data-mode="choose"] .ft-mks',
    arrive: 'through-the-door',
  },
  {
    /* THE CHANDLERY'S FRONT (the data round, 2026-11-03, direction A "the aisle as a page"):
       Northside's mark, find, the boat, and every aisle as a plate with its largest headings.
       The judge of the chandlery found the rulers had never opened /catalogue, which is how
       picture-door text cut at every size shipped. `foundation`: a page of plates, owed
       contrast, cut, overlap and the ramp at six sizes and no row count. `ready` is the front
       itself, drawn only once the price list has been read. */
    path: '/catalogue',
    name: 'catalogue',
    register: 'foundation',
    ready: '[data-testid="catalogue"][data-read] [data-testid="catalogue-door"]',
    arrive: 'through-the-door',
  },
  {
    /* AN AISLE WITH ITS PHOTOGRAPHS: Radios & beacons, 12 of its 47 parts pictured, the pictured
       headings first as cards, the rest as ruled lines with both prices. Not Sounders (161
       cards and 85 lines): the contrast ruler shoots every run of text on its pixels, and on
       Sounders that walk outlasts a ruler's 30 seconds, so the same composition is measured where
       it can finish; Sounders is shot at the six sizes in docs/directions/data-round/catalogue/after/. */
    path: '/catalogue?aisle=radios',
    name: 'catalogue-radios',
    register: 'foundation',
    ready: '[data-testid="catalogue"][data-read] [data-testid="catalogue-aisle"] .chd-cards',
    arrive: 'through-the-door',
  },
  {
    /* AN AISLE WITH NONE, FOR A BOAT, A LINE OPENED: Anchoring & mooring for the Stacer 529
       Assault Pro (Tournament), what the price list makes for it first, and Sand Anchor Kit · 4lb
       opened in place with its ways on and Northside's own picture control. */
    path: '/catalogue?aisle=anchoring&boat=boat_stacer%3A30&open=parts%3A38',
    name: 'catalogue-line',
    register: 'foundation',
    ready:
      '[data-testid="catalogue"][data-read] [data-testid="catalogue-aisle"] .chd-line[data-open]',
    arrive: 'through-the-door',
  },
  {
    /* FIND OVER THE WHOLE CHANDLERY: "sarca", answered by the price list's heading SARCA ANCHORS
       and by the name, the lines grouped by aisle under one sentence counting them. Not "lowrance"
       (144 answers, 93 of them cards): the focus ruler Tabs every control, and that walk outlasts
       a ruler's 30 seconds; catalogue.spec counts the 144. */
    path: '/catalogue?find=sarca',
    name: 'catalogue-find',
    register: 'foundation',
    ready: '[data-testid="catalogue"][data-read] .chd-found',
    arrive: 'through-the-door',
  },
  {
    /* THE SUPPLIERS IN NORTHSIDE'S WORDS: what the headings propose, the codes that differ only
       in their capitals, and every supplier code with its name or the field to give it. */
    path: '/catalogue?view=suppliers',
    name: 'catalogue-suppliers',
    register: 'foundation',
    ready: '[data-testid="catalogue"][data-read] [data-testid="catalogue-suppliers"]',
    arrive: 'through-the-door',
  },
  {
    /* THE PARTS WITH NO PICTURE, ACROSS EVERY AISLE (the verifier of the chandlery, round 1, J9):
       the parts the quotes here carry, the most quoted first (none on a fresh computer, which
       the page says), then every aisle with how many of its parts have none and the way to them. */
    path: '/catalogue?view=pictures',
    name: 'catalogue-pictures',
    register: 'foundation',
    ready: '[data-testid="catalogue"][data-read] [data-testid="catalogue-pictures"]',
    arrive: 'through-the-door',
  },
  {
    /* REVIEW (Milestone 3, rebuilt 2026-10-28 as board E, "The case queue"; deepened in the data
       round, 2026-11-04): what is wrong in Northside's own price list, one case at a time — a
       rail counting the 39 cases still to settle, the index of every case beside the stage at a
       desk, one stage with the first case (the nine Formosa boats on sale at $0, each with its
       field and its door, one amber press), and the next two cases beneath it.
       FOUNDATION, not cockpit: one case is read in one look, never worked down eighteen rows,
       so it owes contrast, cut, overlap and focus at six sizes and no row count. THROUGH THE
       DOOR, because it counts the price list this browser keeps; `data-read` is set only once
       that price list is in, and the stage's title only once a case is on it, so no ruler
       measures "Reading the price list…". */
    path: '/review',
    name: 'review',
    register: 'foundation',
    ready: '[data-testid="review"][data-read] .rv-stage__title',
    arrive: 'through-the-door',
  },
  {
    /* PRICES (Milestone 3, rebuilt 2026-10-28 as direction F, "Yours to decide"): the four
       questions only Northside can answer, Warranty on Northside's own dark ground with its
       switch, and the ten settled lists as tiles led by their makers' marks — at rest, nothing
       open. `foundation`: four questions, a switch and ten facts are read in one look, not worked
       down eighteen lines at a time, so it owes contrast, cut, overlap and focus at six sizes and
       no row count. THROUGH THE DOOR, because it reads the price list this browser keeps;
       `data-read` is set only once it is in. */
    path: '/levels',
    name: 'levels',
    register: 'foundation',
    ready: '[data-testid="levels"][data-read]',
    arrive: 'through-the-door',
  },
  {
    /* PRICES WITH A SHARE TO SET: Stacer's settled tile pressed open across its row — the 309
       Skimma pictured with both its prices, the typed share of Cash and what it would write —
       the state the rulers would otherwise never open. The address names the list, as a
       position does. */
    path: '/levels?list=boat_stacer',
    name: 'levels-share',
    register: 'foundation',
    ready: '[data-testid="levels"][data-read] [data-testid="prices-open"]',
    arrive: 'through-the-door',
  },
  {
    /* ONE PLACE, OPENED from its spread on Data, the one register of the lists (since
       built-critique-m4.md major 1 took the wall of place cards at /places away): Highfield's
       livery on its own photograph, its act, its series tiles and one card per model (the line-up,
       2026-11-04). `data-place` is drawn only once the place has been read. */
    path: '/places/boat_highfield',
    name: 'places-highfield',
    register: 'foundation',
    ready: '[data-testid="place"][data-place="boat_highfield"]',
    arrive: 'through-the-door',
  },
  {
    /* THE LINE-UP'S COMPARE OPENED (the data round, 2026-11-04): three Sport models side by
       side in bands under the range head, the rows that differ lit — the widest state the page
       has, where a cut or an overlap would be. Every part of it is in the address. */
    path: '/places/boat_highfield?series=Sport&compare=boat_highfield%3A483%2Cboat_highfield%3A498%2Cboat_highfield%3A513&see=compare',
    name: 'places-compare',
    register: 'foundation',
    ready: '[data-testid="place"][data-place="boat_highfield"] .pl-compare',
    arrive: 'through-the-door',
  },
  {
    /* A LIST THAT IS NOT A BOAT MAKER, read as its own range: Yamaha's horsepower ladder and the
       motors of one rating, on the compact head a place with no photograph stands on. */
    path: '/places/mot_yamaha?in=150',
    name: 'places-motors',
    register: 'foundation',
    ready: '[data-testid="place"][data-place="mot_yamaha"] .pl-lines',
    arrive: 'through-the-door',
  },
  {
    /* A PLACE'S SETTINGS: Stacer's line, its mark's three choices, its eleven photographs and
       its eight grounds — the panel where an overlap or a cut would be. */
    path: '/places/boat_stacer?tab=settings',
    name: 'places-settings',
    register: 'foundation',
    ready: '[data-testid="place"][data-place="boat_stacer"][data-tab="settings"]',
    arrive: 'through-the-door',
  },
  {
    /* SETTINGS (Milestone 4, board C "Paper and water"): what prints on the left, what shows on
       the right, the pill on the seam. FOUNDATION, not cockpit: a letterhead, four lines, a
       person and the look are read in one look, never worked eighteen rows at a time. THROUGH
       THE DOOR, the true day one: no quote started, so the letterhead is drawn on its own with
       every empty line dashed. `data-read` is set once the catalogue and the quotes have both
       answered. */
    path: '/manage',
    name: 'manage',
    register: 'foundation',
    ready: '[data-testid="manage"][data-read] [data-testid="letterhead"]',
    arrive: 'through-the-door',
  },
  {
    /* SETTINGS WITH A LINE OPEN, ON A REAL DRAFT: the letterhead drawn on the newest draft the
       walk started, and the ABN's field open under it — the state where an overlap or a cut
       would be. The address names the line, as a position does. */
    path: '/manage?line=abn',
    name: 'manage-line',
    register: 'foundation',
    ready: '[data-testid="manage"][data-read] [data-testid="manage-editor"]',
    arrive: 'with-a-document',
  },
  {
    /* THE SHELF (Milestone 4, board D "The safe"): Northside's mark as the showpiece, the blue
       panel a new Master Price File comes in through, the inventory of Northside's work counted
       for the true day one (no quote, no customer, no copy saved yet), the way a copy comes back,
       and the two carmine-edged acts that take things away. FOUNDATION, not cockpit: six counted
       kinds and two acts are read in one look, never worked eighteen lines at a time. THROUGH THE
       DOOR, because it counts what this computer keeps; `data-read` is set only once the
       catalogue and the quotes have both answered. The change sheet needs a workbook chosen by a
       person, so e2e/flows/shelf.spec.ts walks it. */
    path: '/shelf',
    name: 'shelf',
    register: 'foundation',
    ready: '[data-testid="shelf"][data-read] .sf-kinds',
    arrive: 'through-the-door',
  },
  {
    /* THE SHELF'S PAGE BEFORE THE PRICE LIST IS CLEARED: what goes and what stays, counted, the
       amber "Save a copy first" and the act that names its consequence. Its own address, so the
       rulers measure the page a dealer reads before the one act that cannot be undone. */
    path: '/shelf?see=clear',
    name: 'shelf-clear',
    register: 'foundation',
    ready: '[data-testid="shelf"][data-see="clear"]',
    arrive: 'through-the-door',
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
  {
    /* THE KIT — the component language, whole (2026-09-28). Every primitive in src/ui in its
       states, on the 529 as the price file holds it, by day on the room, on white plates,
       over the 529's photograph and on the night's navy ground; the states only a pointer can
       reach (hover, a held press, focus) are drawn frozen beside the live controls
       (`data-specimen`), so this walk measures them at rest.

       `foundation`: nobody's register. It owes contrast in both themes, cut and overlap at
       six viewports, and the ramp, and no row count. FRESH, because the kit reads the five
       tables it draws for itself and asks for no name: a ruler that walked the door first
       would be measuring the door. `ready` is `data-read`, set once the file has answered,
       so no ruler measures "Reading the 529 from the price file…". */
    path: '/kit',
    name: 'kit',
    register: 'foundation',
    ready: '[data-testid="kit"][data-read]',
    arrive: 'fresh',
  },
]

export const cockpitRoutes = (): Route[] => routes.filter((r) => r.register === 'cockpit')
