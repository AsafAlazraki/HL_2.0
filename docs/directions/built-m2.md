# What is actually on screen after Milestone 2

Written 2026-09-23 by driving the BUILT app — `npm run build`, then `vite preview` on 5161 — as a
boat dealer's sales manager would: land cold with an empty browser, type a name, press the blue
door, and then work. Every step was screenshotted and every screenshot was opened and looked at.
Every figure below was read off the live DOM or off the pixels, never off a stylesheet comment and
never off a board.

The shots are under `docs/directions/<screen>/built/`, named `<screen>-<width>x<height>.png`. Four
widths were walked end to end — **1440 × 900**, **390 × 844**, **1920 × 1080** and **1280 × 800** —
because 1280 is where the eighteen-row promise is made and it turned out to be where four of the
five Cockpit registers break it. Three shots are named `FAULT-…` and are the evidence for the three
worst things in this document. Entry's and Home's four carry a `-m2` suffix: this walk wrote over the
committed shots of 2026-09-17 on its first pass, those seven files were restored from `HEAD` byte for
byte (`git hash-object` compared against `git rev-parse HEAD:<path>`), and the new ones were kept
beside them — `built.md` records what losing that before-evidence cost the last time.

Every screen in this app is still **PROVISIONAL** in `docs/SCREENS.md`: the owner has not looked at
any of them.

---

## The five things that are actually broken

Read this section if you read nothing else. Each is reproducible and each has a shot.

1. **A found row opens the wrong row.** `docs/directions/sheet/built/FAULT-sheet-1440x900-at-opens-row-one.png`.
   The shell's headline claim is that the finder reaches a ROW and not only a register. Type `SP560`
   into Ctrl K, press Enter on *Highfield - SP560 (HYP) B-B-B*, and the address that lands is
   `/data/boat_highfield?at=boat_highfield:496` — the right row id — while the record panel that
   opens says **ROLL-UP › RU230KAM · Highfield - RU230KAM (PVC) WH**, which is row 1 of 588, and the
   grid never moves. Typing the address by hand does the same: `?at=mot_yamaha:53` (an F90LB) opens
   `Yamaha - F2.5SMHB` and rewrites the address to `?at=mot_yamaha:1`. On a screen where the next
   thing a dealer does is press Enter to edit a cell, this points them at a record that is not the
   one they asked for. `e2e/flows/shell.spec.ts` is green over it because it asserts only
   `toHaveURL(/\/data\/boat_highfield\?at=/)` — that the address carries *some* `at` — and never
   that the row shown is the row pressed.

2. **The paper a customer is handed has no dealership on it.**
   `docs/directions/document/built/FAULT-document-1440x900-unnamed-business.png`. The first line of
   the printed quote is **"This business has not been named yet"**, on a desk where every other
   screen's masthead says **Northside Marine**. `readDocument` takes `quote.organisation` (the
   organisation record, which this pack does not carry); every screen takes `catalogue.business`
   (the manifest's own name, which it does). The app knows the name and the one object that leaves
   the building does not use it.

3. **Four of the five Cockpit registers do not hold eighteen rows at 1280 × 800.** Measured by their
   own flow tests on this run: the customers book **16**, Data **16**, History **17**, the sheet
   **16 records** (capacity 15). Only the sheet's shows up in the `density` ruler, because that ruler
   takes `max(records, capacity)` and three near-empty registers report a large capacity. The cause
   is arithmetic and is written down in `docs/DECISIONS.md` for the sheet alone: the shell's
   `--shell-inset: 56px` took between 32 and 48 px off every masthead, and at a 28 px pitch that is
   one to two rows. `docs/SCREENS.md`'s rows for the sheet (18 records, holds 17), Data (holds 18)
   and the customers book (holds 21) were all measured before the pill existed and are now false.

4. **Editing a cell throws the sheet's shape away.** Fold `ROLL-UP` on Highfield Inflatables — the
   panel's count drops from 588 to 556 and the band head shows `▸`. Press Enter on any cell, type,
   press Enter: the write lands (`Cell edit · Highfield Inflatables · Undo`) and every folded band
   is open again, with the grid back at the top of 588 rows. Column folds survive; row folds do not.
   A dealer who folds the file down to the series they are working on loses it on every write.

5. **The picker cannot start a multi-colourway quote without discovering a hidden scroll.**
   `docs/directions/picker/built/FAULT-picker-1440x900-colourway-hidden.png`. On the ADV7 the act is
   correctly refused — `--color-act-refused`, `aria-disabled`, `cursor: not-allowed`, and a sentence
   — but the sentence reads *"Choose a colourway above and this becomes live"* and there is nothing
   above it to choose. `.picker-stage__body` is 320 px of port over 646 px of content with no visible
   scrollbar; the seven `COLOURWAY — 7 CODES` chips sit 326 px down it, and scrolling to them pushes
   the boat's photograph and its three specs out of the panel. Measured at 1440 × 900.

Two more that are smaller but wrong:

- **The pill says `Quotes 0` beside a register that holds 1.** The door counts open DRAFTS; the word
  beside the count is `Quotes`. On `/quotes` with one issued quote on screen the pill reads
  `Quotes 0` and the register reads *"1 quote is filed in this browser"*. The same shell round fixed
  exactly this fault for the tables count (`docs/DECISIONS.md`, "a door that disagrees with the
  screen it opens") and left it standing here.
- **`/quotes` tells you the price file is not open while it is reading it.** It has `sheetOpen` and
  nothing else, so during the read it prints *"No price file is open in this browser."* and
  *"This business has not been named yet"*. Measured on a loaded machine that window was ~18 seconds;
  on an idle one it is a flash. Home, Data, the sheet and Customers all have a reading state and say
  *"Looking for a price file in this browser…"*.

---

## Entry (`/sign-in`)

**1440 × 900.** 900 px of page in a 900 px window — the only screen in the app that still fits
exactly. The Stacer 481 SeaMaster fills the window under its veil, the navy pennant hangs off the
top edge with `NORTHSIDE / MARINE` in it, the panel right of centre names `boat_stacer · 91 rows`
and the held size (1,771 × 1,183, drawn 1,440 × 962), and the card carries one field and two doors.
Pressing the blue door with an empty field refuses in place — *"A name is needed — it is what the
quote prints as prepared by."* — and the busy state names both steps as they tick. There is no pill
here and there should not be. One thing reads wrong for a dealer: *"Sign-in that really checks who
you are arrives with the backend at **Milestone 6**."* A Milestone is a word from this repository's
plan, not from a boat dealership, and it is the fourth sentence on the first screen anyone sees.

**390 × 844.** 1,214 px of page, so 370 px of scroll. The pennant, the card and the two doors stack
and the photograph goes behind them; the foot sentence is one flick down. Nothing is cut and nothing
overlaps. This is the one screen with no pill at the foot, so the doors are the last thing on the
page and reach the bottom edge, which is right.

**1920 × 1080.** 1080 in 1080, no scroll in either axis. The photograph is drawn at its held size and
the caption says so. The card stays left and the panel stays right of centre; the extra 480 px of
width goes to water, which is the composition working.

---

## Home (`/`)

**1440 × 900.** `docs/directions/home/built/home-1440x900-m2.png`. The best-looking screen in the
Showroom half: two photographs as one fold with a named plate on each, the counted desk under them,
one amber `New quote`, the six figures, the makers' plate in paper white with twelve real wordmarks
on it, and the drafts column. **It no longer fits.** The page is **915 px in a 900 px window** — a
15 px vertical scroll — and what falls off is the last line of the drafts column, *"Work is kept in
this browser until the file is exported…"*, sliced by the bottom of the window. The masthead is
116 px tall because it gave 40 px to `--shell-inset` (`docs/DECISIONS.md`, 16 → 56); before the pill
the page was ~875. No test guards this: `e2e/flows/home.spec.ts` has no `scrollHeight` assertion,
and `docs/STATUS.md`'s "800 in 800, 900 in 900 and 1,080 in 1,080" is now false at all three.

**390 × 844.** `home-390x844-m2.png`. 2,737 px of page. The order is right for a hand — name, stamp,
greeting, the amber act, the search field, then the photographs — and the tab bar sits at the foot
with the five words and a dot. The helper under the search field still says *"Ctrl K opens the
finder"* on a device with no Ctrl key; the register's own legend switches to touch language at this
width and this one does not.

**1920 × 1080.** 1,084 px in 1,080 — 4 px over, so the same fault as 1440 but nearly closed. The
fold takes the extra width and the two photographs grow; the drafts column stays 340 px and the
diagram inside it is the weakest object on the screen at any width — a wireframe of labelled empty
boxes where every other empty state in this app is a sentence.

---

## The shell (every address but `/sign-in`)

**1440 × 900.** `docs/directions/shell/built/shell-1440x900-pill.png` and `-finder.png`. One pill,
554 px wide and 42 px tall, floating 8 px from the top edge, centred: `NM · Home · Quotes 0 ·
Customers · Data 53 · History · ⌕ Find Ctrl K`, with a `‹ <where>` chip added on a screen that is
inside another. It never overlaps a screen's own words at this width — measured on all twelve — and
it costs no layout track, which is the direction working. Two things are wrong with it. The count
beside `Quotes` is open drafts, so it disagrees with the register it opens (above). And on a screen
inside the register the pill reads `‹ Quotes … Quotes 1` — the same word twice, 200 px apart, meaning
two different things. The finder is the best thing this round built: `Ctrl K` from any of the twelve,
a scope chip (`THE DESK` on Home), the five doors as rows with their own sentences and `G`+letter
keys, `New quote N` and `Load the file L` as acts, and a real search that reaches a row inside a
table — which then opens the wrong row, as above.

**390 × 844.** The pill drops to the foot as a tab bar, 358 px wide at `y = 794`, with the five words
set as they are written and a dot for work waiting. It is a navigation bar and not the floating
action bar the owner rejected, and it reads well. But it prints `Ctrl` and `K` as keycaps on a phone,
and the `?` sheet it advertises is deliberately absent at this width because "a phone has none of
these keys" — the rule is applied to the sheet and not to the bar that points at it. `N` is printed
on `New quote` at this width too, on the register and on Data and on History.

**1920 × 1080.** Identical box, centred at `x = 683`. On the four Cockpit screens the pill's Home
stands about 700 px from the screen's own `Home` button in the top-right corner, and on a sheet there
are four ways back in one window — the pill's `‹ Data`, the pill's `Home`, the screen's `Data` and the
screen's `Home`. `docs/DECISIONS.md` records the register's duplicate deliberately ("the one
duplication this shell leaves standing"); on a sheet it is doubled again.

---

## The picker (`/quote/new`)

**1440 × 900.** `docs/directions/picker/built/picker-1440x900.png`. 900 in 900, no scroll. Three
tiers live at once — seven registers with row counts down the left, 289 models in the middle with a
price on every one, a fact panel on the right — and every figure is counted off the file, including
the honest *"792 of those rows carry a figure at the Cash rung; the other 18 hold a zero there, and a
zero is not a price."* The fault is the hidden colourway scroll above. There is a second, smaller one:
the right panel has ~350 px of dead space under its three figures when no model is chosen, and 646 px
of content crammed into 320 px when one is.

**390 × 844.** **17,325 px of page** — a 16,481 px scroll, which is 20 windows. The register list, the
model list and the panel stack, and the 67 Highfield models are one column with nothing to jump by;
the find field is the only way through and it is above them. It works and it is not cut, but it is the
longest page in the app by a factor of five.

**1920 × 1080.** 1080 in 1080. The three columns take the extra width evenly and the model rows get
long enough that the price sits a long way from the name; at this width a middle column of 800 px is
carrying a name and one figure.

---

## The configurator (`/quote/$id`)

**1440 × 900.** `docs/directions/configurator/built/configurator-1440x900.png`. The stage left, the
rail right, the running price in the masthead from the first paint, six chapters each stating its own
answer and its own subtotal. **The two sticky bars now overlap.** `e2e/flows/configurator.spec.ts:397`
measures `find.top − mast.bottom` and reads **−32.69 px** at 1280 — the masthead grew to clear the
pill and now runs 33 px into the search field that is supposed to sit under it. It is red at all
three widths the case runs at (1280, 1440, 1920; it skips below 1200, where the field is static),
and it is the app, not the machine. Second, on a Highfield
SP560 the stage photograph shows a **Mercury** outboard while the quote's chosen motor is a Yamaha
F90XB; the caption gives the picture's provenance and says nothing about the motor in it, and a
customer sitting at the desk will read the picture. Third, a grammar fault of the kind this repo has
fixed twice: *"3 lines, every figure frozen when it was picked · **1 of them carry** no price at all."*

**390 × 844.** 3,537 px of page. The stage goes to the top, the chapters stack, the price stays in the
masthead. The act is in the flow, not floating. Readable.

**1920 × 1080.** 2,004 px of page, same as 1440 — the rail does not take the extra width, so the
chapters keep their measure and the stage grows. Correct.

---

## The cascade (`/quote/$id/cascade`)

**1440 × 900.** `docs/directions/cascade/built/cascade-1440x900.png`. The strongest single screen in
the app. *"Pricing at Trade changes 2 lines."*, the committed total held still, the build on its plate
to the left, and four cards grouped by CAUSE in the engine's own words — `now priced at Trade`,
`now priced at Trade Price`, `no Trade column — stays at Sell inc Rego` — each with the from → to and
the delta. 1,037 px of page, so 137 px of scroll to reach the decision block, which is `position:
static` and not a floating bar.

**390 × 844.** 1,759 px. The plate goes above the cards, the cards stack, the decision block is last.
Nothing is cut.

**1920 × 1080.** 1080 in 1080, no scroll — the only one of the three sale screens that fits at this
width. The cards keep their measure and the plate grows.

---

## The document (`/quote/$id/document`)

**1440 × 900.** `docs/directions/document/built/document-1440x900.png`. A4 at true size on the dark
floor with crop marks, the dealer's own note panel beside it, `Back to the build` and an amber
`Print`. 3,761 px of page for three sheets, which is the paginator's own count. The cover picture is
the boat's held studio render at 656 × 369 and says so. The fault is the unnamed business at the top
of the customer's page (above). The chrome carries `Home · The register · Start a quote` as real
links, plus the pill's `‹ The build` and `Home` — five ways off a screen whose subject is one sheet
of paper.

**390 × 844.** 3,653 px. The sheet goes to one column and stays at A4's proportions; the desk note
goes under it. The print act is in the flow.

**1920 × 1080.** 3,761 px — the same, because the sheet is a physical size and does not grow. The
floor either side is 560 px of nothing, which is what a 1:1 A4 costs on a wide screen and is the
right trade.

---

## The quotes register (`/quotes`)

**1440 × 900.** `docs/directions/quotes/built/quotes-1440x900-filed.png`. 900 in 900. Three bands,
one issued quote on a 28 px row with the boat, the customer, the figure, the reference and
`just now`; the peek panel on the right teaching the keyboard; the amber `New quote N` under the last
row, so the frame ends where the rows do. The density ruler reads **1 record · 28 px pitch · 605 px
room less 72 px of band heads → holds 19** at 1280 × 800, which passes. With one quote on it, 530 px
of the window — nearly two thirds — is empty dark floor below the frame. That is the honest state and
it is drawn honestly, but it is the emptiest screen in the app at a desk.

**390 × 844.** `quotes-390x844-filed.png`. 865 px of page, 21 px of scroll. The row becomes two lines,
the key legend is correctly replaced by the touch sentence — and `N` is still printed on the act.

**1920 × 1080.** 1080 in 1080. The ledger keeps its measure and the panel keeps 360 px; the floor
below the frame is now ~750 px.

**The same shape twice.** `.qr-body` is `minmax(0, 1fr) var(--panel-w)` with `--panel-w:
--spacing(90)`, and `.sh-body` on the sheet is `minmax(0, 1fr) var(--side-w)` with `--side-w:
--spacing(90)` — the same composition at the same measure, at rest, on two Cockpit screens, with the
same `--spacing(110)` and `--spacing(100)` steps above and below. This is exactly the finding
`critique-m2.md` §3 was written to prevent, and the round's assignment did prevent it on Data (one
column at rest, two only `[data-open]`), on Customers (a letter) and on History (a spine).

---

## Customers (`/customers`)

**1440 × 900.** `docs/directions/customers/built/customers-1440x900-pile.png`. The letter is a 720 px
column in the middle of the window with ~360 px of dead floor on each side; the masthead puts the
title far left, the counts centred under the pill and `Home` far right, three alignments across one
line. The teaching state is the best-written empty state in the app — what a customer is here, why it
is empty today, what to do — and the pile of names typed on quotes is under it with an act each.
Filing works: *"J. Harrow is filed, and the book was made to hold them. · Undo"*, the address becomes
`?who=…`, and the catalogue goes from 53 tables to 54. **But the result reads as a failure.** After
filing the person a quote is addressed to, the header still says *"1 NAME TYPED ON QUOTES, NOT
FILED"* and the person's own page says *"IN THE BOOK · **NO QUOTES** · FILED 2026-09-23"*. The engine
is right — an issued quote keeps the name it was given — but a dealer who has just filed the customer
on a quote sees the app deny that they have one, twice, on the same screen.

**390 × 844.** 844 in 844 with the pile on it — it and History are the two screens off the sale flow
that fit a hand exactly (the register is 865, the sheet 1,510, Data 2,594).
The letter becomes the screen and the acts stack.

**1920 × 1080.** 1,171 px of page on the teaching state and 1,320 with the pile on it, so 91 and
240 px of scroll, and the 720 px column now sits in 1,920 px with 600 px of dark on each side. At this
width the letter reads as a narrow strip in a large empty room. At 1280 × 800 the same two states are
1,171 and 1,320 px against an 800 px window — 371 and 520 px of scroll — so on the dealer's own laptop
the filing form is always below the fold.

---

## Data (`/data`)

**1440 × 900.** `docs/directions/data/built/data-1440x900.png` and `-plate.png`. 900 in 900, no scroll.
Seven paper plates across the top carrying the makers' own wordmarks large — this is the one place in
the app that answers *"I want the logo to be the showpiece thing"*, and it answers it inside the
Cockpit rather than on a poster. Under them eighteen rows at a 28 px pitch with the kind in its own
ink (carmine motors, ochre trailers, viridian accessories, violet packages, teal registers), the
count in the table's own noun, what pairs with it, and the workbook it came from. Pressing a plate
opens its page beside the rows with the provenance whole and an amber `Open the sheet`. It is the
best Cockpit screen and the only one that answers *"a bit more colour usage please"*. At 1280 × 800
its own flow test reads **16 rows against the 18 it owes**.

**390 × 844.** `data-390x844.png`. 2,594 px. The plates stack with their pairing lists, the ledger
follows, the tab bar is at the foot. One visible defect: the find field's placeholder is cut
mid-word — *"A table, a kind, a place, or the workbook it came fro"*.

**1920 × 1080.** `data-1920x1080.png`. 1080 in 1080. Each plate carries its whole page — provenance
and `Open the sheet` — so nothing is owed to a pane, which is direction B's ledger kept as the wide
state. 130 px of empty floor at the bottom and a masthead whose five parts are spread thin across
1,920 px.

---

## The sheet (`/data/$table`)

**1440 × 900.** `docs/directions/sheet/built/sheet-1440x900.png`. 900 in 900. The file's own order as
one grid under `series ▸ model ▸ variant`, the count on every band, the depth ladder and the row
height as named controls, the cost columns marked `cost` at their head with *"5 of these columns are
the dealer's own cost. A quote never reads them."* beside them — the only screen in the app where a
cost column is drawn, and it says so. 28 rows in view at this width, of which 20 are records.

Four things read badly. The `at=` fault above. The fold reset on write above. The `IMAGE LINK` column
draws the held photograph at **34 × 24 px** at the resting row height — a boat on water at 34 px is a
white smudge, and the same column says `held as a link` on the rows with no copy, so one column shows
two unrelated kinds of thing. And the right panel opens at rest with `ADD A COLUMN` — an empty field,
two selects and an amber act already refused (*"A column needs a name before it can be offered."*) —
so the most prominent object in the panel is a form nobody asked for, permanently saying no.

**390 × 844.** `sheet-390x844.png`. 1,510 px. The grid becomes `BOAT · VARIANT` with the boat name
elided, which is the right reduction. The sentence that explains it — *"The other 29 columns are in
the record; press a row to read and…"* — is drawn at the very bottom edge and is clipped by the
floating tab bar.

**1920 × 1080.** 1080 in 1080, 34 rows in view. The grid takes the extra width and more of the 33
columns show; the side panel stays 400 px.

**1280 × 800.** The one red ruler on this run: **16 records in view · 28 px pitch · 607 px room less
168 px of band heads → holds 15**, against the 18 a Cockpit screen owes. `docs/DECISIONS.md` records
this deliberately ("the pill costs the sheet two rows"). `docs/SCREENS.md` still says 18 and 17.

---

## History (`/history`)

**1440 × 900.** `docs/directions/history/built/history-1440x900-filed.png`. 900 in 900. One spine,
Today always at the top with its tally (`1 quote · 3 events · 1 given $128,108`) and the amber
`New quote` on the node, one folded line per quote touched. A line opens in place to the quote's own
diary — three dated events, `Open the document`, and `Quote this again, at today's prices`, which
really works: it writes `20260923-02` for the same boat addressed to the same person and offers
`Its line` and `Discard it`. Two faults. The sentence under the first act reads *"It opens as the
sheet the customer was given, at A4, at **/quote/$id/document**"* — a dealer is shown a developer's
placeholder in an address. And the counted line's order is not the order things happened: this run
printed `started · addressed · issued` live and `addressed · started · issued` in the walk that made
`history-1440x900-filed.png`; `kindsSay` walks a `Map` in insertion order and nothing sorts the
events first.

**390 × 844.** 844 in 844 with a quote on it — it fits. The line wraps under the day node and the
spine stays at the gutter.

**1920 × 1080.** 1080 in 1080, and with one day and one line on it, 780 px of the window is empty
floor. At 1280 × 800 its own flow test reads **17 lines against 18**.

---

## The dead end (any address with no screen)

**1440 × 900.** 900 in 900. The address is the subject, in mono, labelled and wrapping; one amber act
to Home and two doors carrying `/` and `/quotes` as real links. It now also carries the pill, so
there are five ways out of a screen whose whole job is one way out.

**390 × 844.** 867 px of page — **23 px of scroll**, where `docs/STATUS.md` records "844 of 844, the
whole screen on one screen". The 56 px the tab bar reserves at the foot is what took it over.

**1920 × 1080.** 1080 in 1080, band centred at 800 px. At **1280 × 800** it is 838 px — 38 px of
scroll — for the same reason.

---

## Where the flow breaks, in order

1. `Ctrl K` → a row → the wrong record opens (sheet).
2. The document leaves the building without the dealership's name on it.
3. Four registers owe eighteen rows at 1280 × 800 and give 16, 16, 17 and 16.
4. A cell edit unfolds the sheet and scrolls it back to the top.
5. The picker's colourway chips are below a hidden scroll, under a refusal that points up at them.
6. Home, the dead end and Customers no longer fit their windows at the widths they were drawn at.
7. `/quotes` says the price file is not open while it is reading it.
8. The pill's `Quotes` count disagrees with the register it opens.
9. Filing a customer from the pile leaves the pile saying the name is unfiled and the customer saying
   they have no quotes.
10. Keycaps (`Ctrl`, `K`, `N`) are printed at 390 on a device with none of those keys.

## Where two Cockpit screens read as the same shape

One pair, and it is measurable rather than a matter of taste: **`/quotes` and `/data/$table`** are
both `minmax(0, 1fr) var(--<x>-w)` at rest with the panel token set to `--spacing(90)` at 1280,
`--spacing(110)` and `--spacing(100)` at the steps either side — list left, 360 px detail right,
identical. Data, Customers and History are each a different shape, so the round's assignment did the
job it was set; the pair that repeats is the Milestone 1 register and the Milestone 2 sheet, and
nobody was assigned to compare those two.

---

## Refusal rot: every refusal sentence in `src/screens/**`, and whether it is still true

Grepped for `refusedBecause`, "not built", "does not exist" and "yet" across `src/screens/**`
(2026-09-23). Twenty-nine exported refusal constants and the engine's `ISSUED_REFUSAL` were read
against this tree.

**One is false.** `src/screens/picker/Picker.tsx:100`, `NO_CONFIGURATOR` — _"The configurator is the
next screen of this milestone and it is not built yet, so nothing was navigated to."_ The
configurator was built on 2026-09-17, and `src/routes/quote.new.tsx:97` says so in a comment three
lines above the prop that retires it. The sentence renders at `Picker.tsx:978` and is asserted by
`Picker.test.tsx:300`. It cannot appear in the running app — the route always passes `openQuote` —
but it is a false sentence in the source and a component test holds it there, which is exactly the
shape of the three rots this repo has already had to fix.

**Two are true but speak the wrong language to a dealer.**

- `History.tsx:1256-1257` (`WHAT_OPENING_DOES`) renders in NORMAL operation, not as a refusal:
  _"It opens where it is written, still changeable, at **/quote/$id**."_ and _"…at
  **/quote/$id/document**."_ A dealer is shown a router placeholder where an address should be.
- Four refusal constants spell `$id` and `$table` the same way — `Quotes.tsx:161`,
  `History.tsx:174`, `Customers.tsx:200`, `Data.tsx:156` — and four reader-facing sentences on Entry,
  the configurator, the cascade and the document end _"…arrives with the backend at Milestone 6."_

**Every other refusal is true on this tree.** `NO_WAY_BACK`, `NO_FIX`, `NO_QUOTE`, `NO_FILE`,
`NO_DOCUMENT_HERE`, `BUILD_TYPES_NOT_FILES`, `NO_SHEET_FOR_A_BOOK`, `NAME_NEEDED`,
`GIVEN_KEEPS_ITS_NAME`, `NOBODY_AT_THIS_ADDRESS`, `NO_WAY_TO_OPEN` (×3), `NO_WAY_TO_THE_PICKER` (×4),
`NO_WAY_TO_THE_SHEET`, `NO_WAY_TO_CUSTOMERS`, `NO_PROVENANCE`, `NO_TERMS`, `NO_LETTERHEAD`, `NO_RUNG`,
`NO_SHEET_TO_PRICE_FROM`, `NO_DIARY_SAY`, `NO_WAY_TO_A_FILED_QUOTE`, `NO_WAY_OUT`,
`ONLY_ISSUED_IS_VERSIONED`, `ISSUED_IS_NOT_DISCARDED`, `NO_SHEET`, `NO_WAY_TO_THE_FILE`,
`PICTURE_CELL_REFUSAL`, `NO_PICTURE_FOR_MODEL`, `NO_FILE_YET`, and the engine's `ISSUED_REFUSAL`
(which was driven: pressing `Undo` on an issued quote raises it as a live `role="alert"`).
`NO_PICKER_HERE` and `NO_DOCUMENT_SCREEN` are gone, deleted rather than reworded, as the record says.

## What `docs/STATUS.md` now says that this tree does not

- "`/quote/$id`", "`/quote/$id/cascade`" and "`/quote/$id/document`" are each described as
  "deliberately NOT in `e2e/routes.ts`". All three are in it.
- Home: "800 in 800, 900 in 900 and 1,080 in 1,080." Measured today: **822**, **915** and **1,084**.
- `/nope` at 390 × 844: "844 of 844, the whole screen on one screen." Measured today: **867**.
- "172 test files, 2,891 tests." Measured today: **186 test files, 3,116 tests**.
- Its top two sections stop at Milestone 2's research and engine; the five screens this round built —
  the shell, Data, the sheet, Customers and History — have no section in it at all.

## The gate, measured on this tree (2026-09-23)

`npm run build`: green, **3.35 s**. Every build and every `vite preview` prints one warning —
`Route file "src/routes/shell.test.tsx" does not export a Route. This file will not be included in
the route tree.` — with the fix in its own message (rename to `-shell.test.tsx`).

`npm test`: **186 test files, 3,116 tests**, 14 static rules each reading real files. Red on three
consecutive full runs — 1, 2 and 2 failures, 139.85 s, 135.47 s and 141.70 s, the third with the
machine otherwise idle — every one of them in `src/screens/sheet/Sheet.test.tsx` and every one a
**5,000 ms timeout** (5,434 / 5,186 / 5,053 / 5,063 / 8,936 ms; the last is nine seconds on an idle
desk, so this is not only contention). The file alone passes: **14 of 14 in 23.57 s**. It is the
slowest `.test.tsx` in the suite and the `dom` vitest project is the only one of the two with no
`testTimeout` — the `node` project sets 20,000 ms and `vitest.config.ts` argues for it in the words
this case needs: _"A timeout that fires on load rather than on a hang teaches people to re-run a red
gate, which is worse than no gate."_ Because `npm test` chains with `&&`, a red `unit` also means
`npm run check` never runs; run alone it is **14 rules, no failures**.

`npm run e2e`, alone, on an idle machine: **1,002 tests, 2 workers, 46.0 minutes — 752 passed,
237 skipped, 13 failed**. Not one failure is a timeout; every one is an assertion with a number.

| failing check | viewports | what it reads |
| --- | --- | --- |
| `flows/home.spec.ts:57` | all six | presses `Ctrl K` and expects Home's own search field focused. The shell took `Ctrl K` for the finder on 2026-09-23 and left Home `/` — which works, driven — and this assertion was never updated. A stale test, not an app fault. |
| `flows/configurator.spec.ts:397` | laptop, desktop, wide | `find.top − mast.bottom` = **−32.69 px**: the two sticky bars overlap by 33 px since the masthead grew to clear the pill. |
| `flows/customers.spec.ts:190` | laptop | **16** rows against 18 |
| `flows/data.spec.ts:296` | laptop | **16** rows against 18 |
| `flows/history.spec.ts:202` | laptop | **17** lines against 18 |
| `rulers/density.spec.ts` — sheet | laptop | **16 records · 28 px pitch · 607 px room less 168 px of band heads → holds 15** |

The density ruler's own five readings at 1280 × 800, printed by the run: history 19, quotes 19,
sheet 15, customers-book 20, data 16-with-18-records. Three of those pass only because the ruler
asserts `max(records, capacity)` and a near-empty register reports a large capacity — the screens'
own flow tests, which read the room, fail on the same tree at the same width.
