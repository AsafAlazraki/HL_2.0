# The chandlery: three directions for the redraw, 2026-11-03

The judge (`judge.md`) said **redraw**. The idea was right: aisles counted off the file, the gallery, the dealer's picture door, and the aisle as a search param. The shape was wrong for a list where only 197 of 2,238 parts are pictured. It also showed one unlabelled price, and an aisle opened out of sight. The sweep is `docs/research/refs/choosing/round-2/notes.md`.

Each direction below is a different **order and grouping** of the same true content:

- **A** groups by aisle, then by the file's heading, as a page.
- **B** groups by aisle in a rail, and by heading as rows of one sortable table.
- **C** groups first by who is looking (the customer or Northside), then by aisle on Show and by the work on Keep.

All three answer J1–J15 and the judge's §3 items 1–13. Each board ends with its own jobs table.

**Boards:** `boards/a.html`, `boards/b.html` and `boards/c.html`. Each HTML is the screen itself, responsive, followed by the board's notes on paper. The notes cover the job, what only this screen does, the order and grouping, two new references, one or two further states drawn live, the two prices, the mark, what a dealer can replace, the type specimen, motion, keyboard and reduced motion, reflow at every size, honest constraints, and the jobs table.

**Shots:** `boards/shots/<id>-<w>x<h>.png` at 390×844, 844×390, 834×1112, 1280×800, 1440×900 and 1920×1080, plus a whole-page `-full.png` at 1440 and 390. I read every one. The shooter measured the screen above the notes at all 18 sizes:

- 0 px of sideways scroll
- 0 text nodes under 12 px
- 0 text boxes cut by their own box

**Rebuilding them:**

1. Run `FACTS_OUT=docs/directions/data-round/catalogue/boards/facts.out npx vitest run --config docs/directions/data-round/catalogue/boards/facts.config.mjs` to re-read the figures.
2. `node boards/draw.mjs` draws the boards.
3. `node boards/shoot.cjs` shoots them.

**Kit:** the boards read the app's own built stylesheet (`boards/kit.css`, copied from `e2e/out/dist-6240`). Every colour, size, radius and shadow is a token. Buttons, chips, segmented controls and kbd are the kit's own `.ui-*` classes, and the glyphs are the app's Phosphor set, including the aisle drawings from `Chandlery.tsx`.

## Where every figure comes from

`boards/extract.facts.ts` runs the **app's own modules** over the real pack (`src/test/fixtures/pack.ts` reading `data/northside`):

- `shelfOf` and `aislesOf` give every part on sale with its heading, aisle and supplier.
- `pricerFor(ctx, 'cash')` and `pricerFor(ctx, 'fitted')` mint each part at both declared levels through `mintLine`, named by `lineSaid` as a quote carries it.
- `hasPicture` and the picture ledger's `exactRows` give the 197 pictured parts and their files in `public/seed-images`.
- The six `join_*_pd` lists give the pairings.

`boards/facts.mjs` derives every count from those rows when the boards are drawn. No cost column is read.

Measured:

| What | Figure |
|---|---|
| On sale | 2,238 parts, 18 aisles and *Not sorted yet* (28), 180 headings |
| Pictured | 197 of 2,238: Sounders 161, Electric 14, Radios 12, Stereo 10 |
| Supply ≠ fitted | 1,882 of 2,238, where both are numbers |
| Priced fitted only | 101; *Trailer Adjustment · 15 to 17ft* is $206 fitted, $0 supply |
| Install Type *Supply Only* | 282 |
| No price at either level | 25, shown with the door to Review |
| $0 at both levels, as the file writes it | 15; *Supplied with Motor* is one |
| Supplier strings | 79: 78 codes and words, and 18 lines with none; YAM 459 and Yam 212 differ only in capitals |
| Supplier names a heading proposes | LOW → Lowrance 144/144, GAR → Garmin 72/72, SIM → Simrad 34/34, MOM → Momentum 11/11, RAY → Raymarine 2/2 |
| Pairings | 2,561 in 6 P/D lists over **42** part rows (41 on sale); the Stacer 529 Assault Pro (Tournament) is paired with 4 |
| Find | *lowrance* finds 144 of 144 by its heading; *SG002* finds Safety Gear · Smooth Waters by its code |

**Three corrections to the judge, measured:**

1. The P/D lists pair **42** distinct part rows, not 75. The entity description agrees: "the 42 parts the seeded hulls DO name".
2. *Labour Estimated · (0.25)* is the line priced $44 fitted. *(0.5)* is $87.
3. The judge asked for **TTF hours** on the card. The manifest declares `parts.o` (TTF hours) a **cost column**, with P&A, CTD, MU, Base List, Labour $ and Total CTD. So no board shows hours on a surface a customer reads. The Install Type (`parts.n`, not a cost column) is shown when a line is opened, in A, or in a row's acts, in B.

## A: The aisle as a page (recommended)

**URL:** `/catalogue?aisle=anchoring&boat=boat_stacer:30`

**Drawn:** Anchoring & mooring, with the Stacer 529 Assault Pro (Tournament) chosen.

**Order:**

1. A way back to every aisle.
2. The aisle's name, large, with its 66 parts, 6 headings and 0 pictured counted.
3. A docked head: find (name, code, supplier), **Pictured | All**, supplier chips, the boat chip. *Pictured* is refused with its sentence, because nothing in this aisle has a picture.
4. **Made for this boat**, holding 1 of the 4 parts the P/D list pairs with it.
5. The file's six headings as sections, in file order. In a section, pictured parts come first as cards, and the rest are ruled lines with code, supplier, supply and fitted.
6. A line opens in place. It shows its heading, how it is fitted and the boats it is paired with, then three doors: its line in the sheet, Northside's own picture, and a quote. The quote door is refused on day one with its sentence and the switch.

**Second state:** the door, `/catalogue`. Northside's mark heads it, then every aisle with its headings counted (DigiKey's index), and the sentence for a wrong `?aisle=`.

**Third state:** Lowrance in Sounders: 93 cards, then 51 lines.

**References new to this board:**

- Apple *Cases & Protection*, scrolled (`live/apple-iphone-cases-compat-scrolled.png`)
- Mazda *BT-50 accessories* (`live/mazda-bt50-accessories-top.png`)

**What only this screen does:** each aisle has its own page and address, and what the price list pairs with the customer's boat comes first.

**Reflow:**

| Size | Layout |
|---|---|
| 1920 | Sections in two columns |
| 1440 / 1280 | Lines in four columns; the first section is above the fold |
| 834 | Lines in two rows |
| 844 × 390 | The dock folds to find, Pictured \| All and a *Supplier, boat* button |
| 390 | The dock folds the same way; each line is stacked |

## B: The rail and the ledger

**URL:** `/catalogue?aisle=propellers&sort=file`

**Drawn:** Propellers & motor care, 447 lines.

**Order:**

1. Find for the whole chandlery.
2. A rail headed by Northside's mark: the 19 aisles counted, and the open aisle's 10 headings counted under it.
3. Docked tools:
   - the aisle with its counts
   - sort
   - **All | With a picture | Without**
   - supplier chips
   - the boat chip
   - the measured proposal "YAM and Yam differ only in their capitals … Make them one"
4. One table with sortable columns: picture where held (no box where not), part, code, supplier, supply, fitted, and *Line*. A group row per heading. *NB:* lines are drawn as notes, not parts.

**Second state:** find by *lowrance* (144 lines, grouped by aisle) and by *SG002*.

**Third state:** naming suppliers in Data, with the five measured proposals.

**References new to this board:**

- DigiKey's category table (`live/digikey-toggle-table.png`)
- Blue Bottle Marine's counted facet rail (`live/bluebottle-bla-grid-scrolled.png`)

**What only this screen does:** it walks 447 lines in one table that keeps its place and sorts by any column. That includes the cheapest *fitted*.

**Reflow:**

| Size | Layout |
|---|---|
| 1920 | Rail 18rem |
| 1440 / 1280 | Rail 16rem and seven columns |
| 834 and 844 × 390 | The rail folds to an aisle button; code and supplier sit under the name |
| 390 | Stacked cells with both prices labelled, never a sideways scroll |

## C: Two rooms, Show and Keep

**URLs:** `/catalogue?room=show&aisle=radios` and `?room=keep`

**Drawn:** Show, Radios & beacons.

**Order:**

1. Northside's mark at shop-sign size, **Show (for the customer) | Keep (for Northside)**, and find.
2. **Show:** the aisle held large with *Change aisle*, its 12 photographs as large cards, then the other 35 as type grouped by heading. Every part has both prices. There is no code, no supplier and no *Add a picture*. Parts with no price do not appear on Show.
3. **Keep** (second state) is grouped by the work:
   - **To picture:** 2,041 of 2,238, a bar per aisle, the multi-drop where a file lands only on the part whose code its name carries, and the worklist.
   - **To place:** the 28 under DFO kits and no heading, each with *Put in an aisle*.
   - **To name:** YAM/Yam and the five proposals.
   - **To price:** 25 → Review.
   - **Notes, not parts:** 2.
   - **The quote switch:** off.

**References new to this board:**

- Akeneo's product grid, *List | Gallery* and *Picture is not empty* (`live/akeneo-grid-filters.png`)
- Akeneo's product link rules (`live/akeneo-product-link-rules.png`)

**What only this screen does:** it separates what the customer sees from the work the list needs, over the same aisles, with one control.

**Reflow:**

| Size | Show | Keep |
|---|---|---|
| 1920 | Cards 6 a row | 3 columns |
| 1440 | Cards 5 a row | 3 columns |
| 834 | Cards 3 a row | 2 columns |
| 844 × 390 | 4 short cards in the first window | 2 columns |
| 390 | Cards 2 a row, a type list in one column | 1 column |

## Recommended: A, with three grafts

**A**, because it is the one shape that holds the 9% and the 91% without either spoiling the other:

- A pictured section leads with cards, and an unpictured one is clean lines. No dashed box is ever shown to a customer.
- The aisle opens at the top of a page at every size, so J1's blocker cannot come back.
- The customer's boat comes first, which is what the salesperson at the desk is selling to.
- The opened line keeps the admin's three doors in the place the part is, without a second room to learn.

B is denser, but its supplier codes and seven columns read as a sheet in front of a customer, and the sheet already exists. C is the most honest about the work. But the work it gathers is already the business of the Data page's *Needs Northside*, and Review, Prices and Shelf, so a second room in the chandlery would duplicate it.

**Grafts, each from a losing board:**

1. **From B:** sortable column heads and a *Without* value on Pictured | All. This gives the admin J9 inside any aisle.
2. **From B and C:** the supplier-naming proposals and the YAM/Yam merge, as a Northside list in Data with Undo. A reads the names once given.
3. **From C:** the picture drop matched by the code in the file name. It lives on the opened line and in Data's *Needs Northside*, not as a Keep room.

The pure derivations the build owes, each with tests in `src/domain/catalogue`:

- `twoPrices`, with its five kinds
- the heading namer
- `makerProposals` and `caseTwins`
- find by name, code, supplier and heading

The aisle-of-heading placement becomes a Northside setting with an inverse.
