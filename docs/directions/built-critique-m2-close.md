# Milestone 2's close, judged cold

Independent critique, 2026-09-24. Read-only: this file is the only thing written in the repository.

**What was read.** `docs/directions/built-critique-m2.md` whole (the specification), `docs/directions/built-m2-close.md`
whole, `docs/STATUS.md`'s top section, `docs/SCREENS.md`'s thirteen rows and its fit table, `docs/PLAN.md`'s standing
rules, and the `DECISIONS.md` entries on theme and the brief. Every current shot under `docs/directions/*/built/` for the
thirteen screens at 1440, 1280, 1920 and 390. Source where a still cannot prove a thing: `src/screens/sheet/{Grid.tsx,
sheet.css,Sheet.test.tsx}`, `src/domain/shell/finder.ts`, `src/screens/home/{Home.tsx,holdings.ts,ledgers.ts}`,
`src/screens/configurator/{stage.ts,Configurator.tsx}`, `src/screens/cascade/Cascade.tsx`, `src/screens/data/Spread.tsx`,
`src/screens/quotes/Panel.tsx`, `src/domain/quote/diary/days.ts`.

**What was measured here, rather than inherited.**

- `npx tsx tools/check.ts` on this tree: **14 rules, no failures.** `npm test` and `npm run e2e` were not re-run (the
  machine runs the browser gate alone and this pass drove a browser instead).
- The built app (`dist/`, 03:21, no source file newer) served by `vite preview` on port 5711 and driven by Playwright
  from a persistent profile: signed in, the blue door read the file in 3.7 s; a sale walked by hand on the SP560 (minted
  `20260924-01`, addressed to M. Duffy, given, printed), a Stacer 519 Sea Ranger SDF draft (`-02`), an ADV7 draft (`-03`)
  taken to the cascade at 1920; M. Duffy filed from the pile. Screens photographed and measured at 1280 × 800,
  1440 × 900, 1920 × 1080, 834 × 1112 and 390 × 844 (touch, coarse pointer).
- On the phone, ten routes: **0 sideways scroll, 0 visible keycaps.** At the desk, nine routes fit 800, 900 and 1,080.
  No text under 11px on ten routes at 1440.

---

## The previous critique's 27, item by item

| # | finding | verdict | evidence on this tree |
|---|---|---|---|
| 1 | `?at=` opens row one | **CLOSED** | Ctrl K from inside the sheet, `PA700 B-B-B` ⏎ → `?at=boat_highfield:352&in=Patrol`, B-B-B lit with its record under it. |
| 2 | No dealership on the paper | **CLOSED** | Page 1 of `20260924-01`: NORTHSIDE MARINE · QUOTATION · Issued 24 September 2026. |
| 3 | ADV7 colourways behind a hidden scroll | **CLOSED** | The seven chips stand directly above `Start the quote`; pressing B-G-B at 1920 made it live. |
| 4 | History's day in an impossible order | **CLOSED** | `started · addressed · issued` on the hand-driven sale, at 1440 and 390. |
| 5 | Registers under 18 at 1280 | **CLOSED** | The sheet shows 20 at 1280 (`sheet-1280x800.png`). The other four are the ruler's reading, not re-measured here. |
| 6 | Three screens one composition | **CLOSED** | The sheet has no right column; Data's press opens a full-measure spread. `/quotes` alone is list-left, detail-right. |
| 7 | The gate red | **CLOSED** for the guard (14 rules, measured here); the other two gates are the verifier's figures. |
| 8 | Configurator bars overlap | **CLOSED** | No overlap at 1440 or 1920 on three quotes. |
| 9 | `Quotes 0` beside one quote | **CLOSED** | `Quotes 3` beside three quotes. |
| 10 | Screens overflow their window | **CLOSED** | 800/800, 900/900, 1,080/1,080 on nine routes. |
| 11 | Amber act refusing at rest | **CLOSED** at rest. Refusals are now loudest behind the sheet's Pictures door instead (finding 9). |
| 12 | A write unfolds the sheet | **CLOSED** as written: RU230KAM stays shut through a write. The line it stays shut to has no name (blocker 1). |
| 13 | Four ways back | **CLOSED** | No `‹`; no door the pill carries is drawn on the sheet's head. |
| 14 | Router patterns and plan words | **CLOSED** for those words. Three new developer words reach a dealer (finding 4). |
| 15 | `/quotes` says the file is missing while reading it | **CLOSED** per the verifier; not re-driven. |
| 16 | Filing a customer contradicted | **CLOSED** as a contradiction; the idea underneath is still too hard (finding 7). |
| 17 | Mostly empty floor at a desk | **OPEN** | See finding 6. |
| 18 | Keycaps on a phone | **CLOSED** | 0 `kbd` visible on ten routes at 390, coarse pointer. |
| 19 | Data's placeholder cut at 390 | **CLOSED** | |
| 20 | The sheet's sentence under the tab bar | **CLOSED** | |
| 21 | Blank crest | **CLOSED** | NM on a medallion. It is still type, not his mark (M4 owes it). |
| 22 | The sheet looks like a spreadsheet | **OPEN** | The resting price list is a real redesign. Behind it, `Every column` prints `Matrix · Highfield Inflatables` and `held as a link` on every row, exactly what #22 quoted; `Only the models` has no names (blocker 1); spine specs are cut (finding 10). |
| 23 | Home's wireframe empty state | **CLOSED** on Home. The same diagram stands on `/quotes` (`Panel.tsx:180`, finding 17). |
| 24 | A Mercury on a Yamaha quote | **CLOSED** | The caption names the maker's rig and this quote's motor. |
| 25 | "1 of them carry" | **CLOSED** | |
| 26 | Data's wide plate shot was the sheet | **CLOSED** | `data-1920x1080-plate.png` is Data's spread. |
| 27 | `NO_CONFIGURATOR` alive | **CLOSED** | Only a comment and a test comment remain. |

Twenty-four closed, two open, and one (#12) closed in a way that introduced a blocker.

---

## Does the sheet still feel like a database?

**Yes, less than before, and the doors behind it make it worse again.** At rest it is the best the sheet has been: the
maker's wordmark, a series bar, one named spine per model with its figure per material. But on first paint a spreadsheet
cursor sits on a cell (`RU230KAM · PVC · WH` outlined), keycaps (`Enter edits · Space`) sit in the lit row, and five mono
columns sit under a column header with `26 more ▸ · 5 cost`. Each of the three other doors undoes the idea:
`Only the models` is a list of prices with no names, `Pictures` is mostly grey refusal tiles, and `Every column` is the
33-column spreadsheet the previous critique rejected, unchanged. The record under a row is still `Matrix`,
`Image Link: held, 1100 × 619`, `Deadrise °: –`.

---

## Blockers

### 1. A shut model has no name, so "Only the models" is a list of prices for nothing

Press `Only the models` on the Highfield sheet at 1440. The screen draws eight lines, each reading
`▸  PVC $2,770 · HYP $4,500–$5,320  ■`, with no model name on any of them. On Sport it is sixteen lines, from
`PVC $15,040` to `HYP $129,830`. Measured: the `.sh-spine__name` element is **0 px wide** on every shut spine at 834,
1280, 1440 and 1920. It is 211–307 px only on the phone, where the spine takes the hand layout. Shutting one model by its
`▾` does the same thing (`sheet-1440x900-edited.png`, the top line under ROLL-UP).

The cause is this round's own fix #4. `sheet.css` now gives `.sh-spine__words > .sh-spine__name` the rule
`contain: inline-size`, so the name's intrinsic width is zero. The shut layout then gives it `flex: none`
(`.sh-spine[data-shut]:not([data-hand]) .sh-spine__name`), so the name is drawn at that width. The spec line under it
goes the same way and survives only as its accent square. `Sheet.test.tsx:359` stays green over this because it asks
for the button by its `aria-label` ("Open RU230KAM"), which the vanished text does not affect. The verifier's #12 check
counted the fold and never read the line.

### 2. Filing a customer turns them into something Northside Marine sells

File M. Duffy from the pile, then open Home. The **WHAT NORTHSIDE MARINE SELLS** panel changes as follows:

- `64 LABOUR RATES · OILS & CONSUMABLES · REGISTRATION COSTS` becomes **65**.
- The masthead goes from `53 TABLES · 15,691 ROWS` to **54 · 15,692**.
- `25 registers hold those 7,012 rows` becomes **26 · 7,013**.
- The search field becomes `Search 15,692 rows`.

`/quotes` and `/history` now say "Priced from the Master Price File · 54 tables". Data lists the book among the price
file's registers as `Customers · 1 row`, next to the fingerprint `1qz08ne` of a file that had 53.

The cause is in `holdings.ts:138`: the `custom` kind is labelled with the names of the places that hold it, and the
customer book is `custom` with no place. It is counted in the figure but not named in the label. The showroom prints a
false figure, and every name filed makes it more false.

---

## Major

### 3. The door into every sale is a database report

The picker at 1440 carries **2,642 words, 128 of them "row" or "rows"** and 10 "register". Its visible text includes:

- "Which hull is it? Choose the register, then the model…"
- "810 rows · 289 models · 42 series · 7 registers"
- "792 of those rows carry a figure at the Cash rung"
- "A number beside a register counts ROWS of this file, not boats on a floor"
- "ROWS ON THIS SHEET, BY REGISTER"
- "A model is not a row"
- `7 rows · one figure` under each model
- "This model is 7 rows of the price file, and a quote is written against ONE of them."

The list of 289 models is text with no pictures. The same register has four nouns on four screens:

| screen | figure |
|---|---|
| Home | `810 BOATS`, then `588 rows` on the plate, corrected underneath with "A row is a line of the price file, not a boat on the floor." |
| The picker | `289 models` |
| The sheet | `588 variants of 67 models` |
| Data | `588 variants in 7 series` |

This is the owner's first sentence ("it still feels like a database"), on the screen every sale passes through.

### 4. Database and developer words run through the sale screens

- **The build:** "A quote is written against ONE row of Highfield Inflatables… Choosing another **re-roots the document**
  on that row" (`Configurator.tsx:1167`, and again on the phone).
- **Chapter 04:** "no price column on this table" printed under every dealer-fit and rigging row (six times on one SP560
  quote). Also "Highfield × P/D Parts names which ones go with this one." and "699 of this table's 2,937 rows are no longer
  sold".
- **The cascade:** "This boat's row carries no picture **this repository** holds a copy of" (`Cascade.tsx:606`).
- **Home's masthead:** "READ FROM THIS BROWSER · **IN 438 MS**" (`Home.tsx:346`).
- **Customers:** "A row in a book that is a table on the sheet…", "not to this row", "A table on the sheet · Customers · 5
  columns".

`rung`, `frozen lines` and `the shelf` appear on the build, the cascade and the register. The four words #14 removed have
been replaced by these.

### 5. Blue and white was the brief; eleven of thirteen screens are a dark navy room

`PLAN.md`: "Blue and white was the brief… dark mode is offered, not default". `DECISIONS.md` 2026-09-18 made dark the
only theme to fix a scrollbar, and named what lost as an old 09-16 line, not the owner's brief. Entry, Home, the picker,
the build, the cascade, the document's floor, Quotes, Lost, History, Data and Customers rest on near-black navy. Only
the sheet and the paper are white. The one colour at rest on most screens is an amber act. The owner has never been
asked about this, and he would name it within a minute.

### 6. Empty floor at a desk is still the rest state (#17, open)

| screen | what the wide window shows |
|---|---|
| `/quotes` at 1920 on a model with no photograph | A bordered, empty register frame about 690 px tall, beside a panel whose middle about 500 px is empty (`quotes-1920x1080-filed.png`). At 1440 it is about 500 px. |
| History at 1920 | One line, then about 300 px of nothing above the rhythm and 280 px below it. |
| Customers' book at 1920 | The last text ends at 229 px of 1,080. The letter ends at 611. |
| The cascade at 1920 on a no-picture model | The left 896 px, 47% of the window, is empty navy with a small card at mid-height (`cascade-1920x1080.png`). |

The honest state is one record. Drawing one record as a full-height empty frame is the fault the previous critique named.

### 7. A customer the dealer just quoted is "Nobody"

Give a quote to M. Duffy, then press Customers: "**Nobody is filed yet.**" The screen then explains in three headed
paragraphs that a name typed on a quote is not a customer until a second act files it into "a book that is a table on
the sheet". Filing does work. It also adds a table to Data (`Data 54`) and a figure to Home (blocker 2). The previous
critique's contradiction is gone, and the two-step idea behind it is still there. "We are supposed to be taking a
complicated thing and making it super super easy."

### 8. Ctrl K sends a boat to the database, and cannot find what a dealer types

- **Every boat the finder answers has one verb: `Open it on the sheet`** (`finder.ts:378`). There is no way to quote the
  boat you just found.
- `HBS126` (the code a dealer orders by) answers "Nothing in this browser matches".
- `trailer for sp560` answers nothing.
- `yamaha f90` puts four Pre-Delivery packages above the F90 motors.

### 9. The sheet's Pictures door is a wall of refusals

On Roll-Up, 7 of 8 tiles are grey boxes, each printing the same 22 words: "No picture is held for this model: the price
file carries the maker's address and this browser holds no copy". Across Highfield it is 32 of 67 tiles. The door that
exists to make the table visual is mostly one refusal, repeated.

### 10. The spine cuts what it exists to say

| width | spine spec lines cut with an ellipsis, in view |
|---|---|
| 1280, Roll-Up | 5 of 15 |
| 1440, Roll-Up | 6 of 18 |
| 1920, Roll-Up | 1 of 22 |
| Sport, at every width | 2 of 8 |

Examples: `OA Length 2.3 · Beam 1.37 · Tube Di…`, `Boat Registration Up to and inc 4.5m · Boat Rego Decals…`. At
1280 with a found row, four of the SP560's six lines are cut (`sheet-1280x800-found.png`). At 1920 the spine keeps a
fixed width beside a wide empty strip and still cuts. The verifier measured the figure line, and these are the lines
under it.

### 11. The photograph on Home is a boat the build says has no photograph

Home's second hero reads "STACER · 519 Sea Ranger SDF · 91 rows in that register, and **2 of them are this model**". Quote
either of those two rows (Centre or Side Console) and both the picker and the build say "The row names a picture and no
copy of it is held here, so nothing stands in for it". The stage is then the Stacer wordmark on navy.

The cause is that the two screens match pictures to models differently. `home/ledgers.ts` matches a model name that
stands alone inside the label; `configurator/stage.ts:226` requires a hierarchy value to equal it exactly. That is two
derivations of "which boat is this picture", both inside `src/screens`. CLAUDE.md puts a derivation in `src/domain`, once.
The same photograph is sold on Home and missing from the sale.

### 12. Home's search field does not search

"SEARCH THE FILE BY NAME". Type `SP560` and it answers "35 rows carry that word. Ctrl K opens the finder…". Press Enter
and nothing happens: no result, no finder, no navigation (measured, the URL and the page unchanged). It is a counter under
a search label, on the showroom's second-loudest control.

---

## Minor

13. **The lit first chapter is jammed against its edge.** `Roll-Up 32` has zero padding on its paper tab at every desk
    width (`sheet.css:317` gives the first chapter a −14 px margin inside an `overflow-x: auto` strip, which clips it).
    It is the resting state of the sheet.
14. **A record loses a label.** When the picture is held as a link, the `Image Link` term is 0 px wide and the value
    `held as a link: https://www.highfieldboat…` runs into the label column (PA700EW B-B-B at 1440).
15. **History's colour key names words its lines never print.** The line says `started · addressed · issued` and `GIVEN`.
    The key underneath says `begun · built · priced · addressed · given · taken back` (`days.ts:415`).
16. **Data's spread says something false about the sheet.** "The sheet is all 588 variants as one grid, in the file's own
    order" (`Spread.tsx:207`) was true before the redesign. The sheet is now one series at a time.
17. **The register's empty state is still the wireframe.** "A ROW WILL READ LIKE THIS" in dashed boxes (`Panel.tsx:180`),
    and three screens print "No photograph stands on this screen…", which is a sentence written to a critic.
18. **The makers' marks on Home do nothing.** They are not doors (Data's are). The hero's act, `Open Highfield
    Inflatables`, opens a list of 67 models, not the ADV7 in the photograph.
19. **Dates in two formats on one page.** Customers reads `FILED 2026-09-24` and `given · 2026-09-24` beside `Given ·
    today` and "Issued 24 September 2026" elsewhere.
20. **The build numbers its last two chapters `·`.** `01 02 03 04 · ·`.
21. **Picture provenance on showroom screens.** "Stage copy 2,560 × 1,708, drawn here at 624 × 416, never enlarged",
    "Held copy 1,100 × 619", "in the image ledger since…" appear on Entry, the picker, the build and the cascade. The
    verifier already listed this; it is still true.
22. **Found-row shot at 1440 shows a caption with no picture.** `sheet-1440x900-found.png` shows `W-W-WB · 2 of 15
    variants` with no render above it. The shot caught a lazy image before it loaded, and it is the evidence file for
    #1.
23. **Two items carried as known.** The 404 for `/favicon.ico` on every load, and WCAG 2.1.4 (remappable single-letter
    keys: N, B, T, W, M, Y, J, K) is still owed.

---

## Would he accept it on sight?

**No.** He would be pleased by the ADV7 on the build and the cascade (the one quote that has its photograph), and by
Data's plates. He would stop at the picker, because "Choose the register… 810 rows… a zero is not a price" is the
database he has rejected five times. Then at the sheet, where `Only the models` is a column of prices with no boats. Then
at Customers, which tells him the person he just quoted is nobody.

**The one thing to change first: take the database out of the words, starting with the picker.** Every screen in the
sale speaks the engine's language (row, register, rung, table, column, frozen lines, re-roots, repository, milliseconds)
and explains itself in paragraphs to a reader who, by the owner's own persona, reads nothing. The picker should show
boats with their pictures, by maker and series, with a price and one act, and the arithmetic about rows should move to
Data, where it belongs. Two of the blockers are one-line fixes that belong in the same pass, and they are not the reason
he will say no:

- Blocker 1: remove `contain: inline-size` from the shut spine.
- Blocker 2: keep the customer book out of what Northside sells.
