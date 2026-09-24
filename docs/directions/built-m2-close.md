# Milestone 2's fix round, closed: what is on screen now

Written 2026-09-24, the last hands on the tree this round. The specification was
`docs/directions/built-critique-m2.md` (four blockers, fourteen majors, nine minors); the walk it
came from is `docs/directions/built-m2.md`. Everything below was measured on this tree, after the
fixes this pass made, and nothing is carried over from a builder's report without being driven.

**How it was driven.** The built app was served by `vite preview` and walked cold twice over:

- **By hand, at 1440 × 900**, in a real Chrome driven one press at a time and screenshotted at
  every step: the door → a name → the blue door → Home → the pill to Quotes, Customers, History and
  Data → a maker's plate → the sheet → the finder, typing a Highfield model and landing on its row
  → shutting a model, writing a cell, Undo → New quote → the ADV7 and its colourways → the build →
  a motor → Trade's cascade, declined → Who it is for → the finale → Give it to the customer → the
  document → Quotes → History → Customers, filing the name → a reload of each. That walk, and
  reading its photographs, found eight faults the gate had not; all eight are fixed below.
- **By script, at 1440 × 900, 1280 × 800, 1920 × 1080 and 390 × 844** (the phone with touch and a
  coarse pointer), each a fresh browser walking the same sale end to end and photographing every
  screen into `docs/directions/<screen>/built/`, reading each screen's fit, sideways scroll and
  visible keycaps as it went. It minted its quote through the picker's own act, typed its customer
  at the build and filed them with the pile's own press — nothing planted.

Every screen is still **PROVISIONAL** in `docs/SCREENS.md`: the owner has not looked.

---

## The gate, alone, on this tree

| gate | result |
| --- | --- |
| `npm test` | **193 test files, 3,276 tests, 14 static rules, no failures** — 203 s wall on an idle desk (vitest 161 s). Typecheck on both projects, oxlint at zero warnings and prettier all clean. |
| `npm run build` | green, about 4 s, **no warning** (the `shell.test.tsx` route warning is gone) |
| `npm run e2e` | **1,188 tests, 2 workers, 53.7 minutes — 910 passed, 278 skipped, 0 failed**, alone on an idle desk, on the final tree (the run before it, without the last spine fix and its case, was 1,182 tests, 904 passed, 0 failed, 53.2 minutes). The 278 skipped are by design: the ruler fixtures run at one viewport and density at 1280 × 800 only; a hand skips the keyboard cases. Flow checks passing by spec: shell 87, data 76, sheet 75, configurator 69, cascade 66, document 61, history 55, picker 46, customers 43, entry 39, quotes 33, home 24, lost 6; rulers 200. |

The first `npm test` of this pass was **red, 1 of 3,271**, and it was the app's test and not the
machine: `src/routes/shell.test.tsx` still asserted that the dead end draws all three front doors,
after the Lost fixer had (deliberately, rule (a)) stopped it repeating the two the pill carries. The
case now pins the same property on the new shape — the act and the picker are real links on the
screen, the register is a real link on the pill, and none is drawn twice. The first full
`npm run e2e` of this pass, on the tree the fixers left, was **1,170 tests: 893 passed, 277 skipped,
0 failed, 63.6 minutes** with 2 workers; everything after it was re-measured once the fixes below
were in.

---

## What driving it found that the gate did not, and what was done

Each of these was seen on a screenshot of the built app, reproduced by a probe, fixed, and pinned by
a test that fails on the old tree.

1. **A row found from inside the sheet did not open.** From Home the finder lands on its row (the
   flow test's path). From the sheet itself, on another chapter, the same press switched to Sport
   and stopped at scrollTop 460 with SP330 in the window — no lit row, no record: react-virtuoso's
   `scrollToIndex` estimates every undrawn block at the 28 px band's height. The grid now looks
   again after each ask and succeeds only when the row's cell is inside the window twice running,
   bringing a drawn-but-hidden row in by its own box (at 844 × 390 the list is 206 px tall and a row
   deep in a 15-variant block was below it), bounded at eight asks.
2. **The same `?at=` reloaded lost its row.** The row opened, then TanStack Router's scroll
   restoration wrote 979 back into the virtualised list, where SP330 to SP420 stood. The router
   restores scroll on every address but `/data/<table>`, whose position is its address. New flow
   case: *a row found from inside the sheet opens that row, and a reload keeps it open* — six sizes.
3. **"Shut SP560" did nothing after the finder landed in SP560.** The found row's model is held
   open, so the press wrote `flip=` into the address and left fifteen rows drawn — a silently dead
   control. The press now asks for the opposite of what is drawn and ends the hold on that model.
   New flow case at five sizes (a hand's found row is its record, full screen).
4. **The figure per material was cut on the laptop.** At 1280 the render beside the spine's words
   cut `PVC $41,340 · HYP $48,3…` and `HYP $4,500…`, the one thing a spine exists to say. The words
   now claim the figure line's width and the render yields (about 100 px beside a price range,
   never enlarged). Measured after: 0 cut figure lines at 1280, 1440, 1920 and 834, both chapters.
5. **The lit row's keys were clipped at 1280** as `$1,524 [nter] edits · Space record`: right-aligned
   in a clipped cell, they overflowed to the left. The tail is a size container that drops the keys
   whole under 15 rem and keeps its `record` button; the keys stay in `?`. The spine flow case
   below also reads every lit row's tail for overflow, in every chapter, at six sizes.
6. **The finder could not find a boat by the words a dealer types.** `SP560 B-B-B` answered nothing,
   `Highfield SP560` answered a REDCO trailer, `SP560 HYP` answered only Dealer Fit packages —
   because the boat is spelled `Highfield - SP560 (HYP) B-B-B`. A row whose name has every typed word
   at the start of a word now answers too, ranked after every row holding the run. Driven after:
   all three put the Highfield boats first; `ADV7 LG-W-WB` finds the one row. The engine's ported
   case that `min hp` names columns and no row still passes, which is why a word must START a word.
7. **Two sentences false on this tree.** Data dated the Customers register it had just made
   `Filed at this desk · 23 Sept 2026` beside a customer page saying `2026-09-24` (filed at 00:54
   Brisbane; the UTC day was sliced) — it now reads the local day. And `/nope` typed on a desk where
   the file was open printed **"This business has not been named yet"** above the dead end for the
   length of the read (#15's fault on another screen); the line is blank until the read ends.
8. **A render's caption stood under its block at 1920.** `spineFit` budgets the render against the
   block and not the line under it, so a 100 px render in a four-variant block put "WH · 2 of 4
   variants" 7 px below the block's edge. The caption now counts in the picture's height (it may use
   the bottom padding), and the picture keeps `spineFit`'s box when it yields width, so it scales
   down whole rather than taking the photograph's own taller ratio. New flow case: every spine in
   every chapter says its figure whole and keeps its picture inside its block — six sizes.

Smaller, done in the same pass: `Other Charges` printed `0` beside Base Freight's `$0` in the
sheet's head (`isMoney` missed the plural; `Fees` too); the picker's brand head printed `1 models`;
the cascade's dead end still ended "…with the backend at **Milestone 6**"; the route test file was
renamed `-shell.test.tsx` so the build stops warning. `docs/DECISIONS.md` has one dated line each.

---

## The critique's list, item by item

| # | the finding | on this tree |
| --- | --- | --- |
| 1 | `?at=` opens row one | **Closed.** From Home, from inside the sheet on another chapter, and on a reload of the address: the found row is lit a third of the way down with its record under it (SP560 (HYP) B-B-B, HBS126, Sport). The last two were broken until this pass. |
| 2 | No dealership on the paper | **Closed.** Page 1 reads NORTHSIDE MARINE over QUOTATION · 20260916-01 at all four sizes; the tab (and a saved PDF) is "Northside Marine quote 20260916-01 – Highfield - SP660 (PVC) W-W-WB". |
| 3 | The ADV7's colourways below a hidden scroll | **Closed.** The seven codes sit in the plate's foot directly above `Start the quote` at every size; nothing scrolls inside the plate at 1280, 1440 or 1920. |
| 4 | History's day in an impossible order | **Closed.** `started · addressed · issued` at all four sizes and after a reload; `started · 1 pick · addressed · issued` on the hand-driven sale. |
| 5 | Registers under eighteen at 1280 | **Closed**, by the ruler's own reading — see the table under "Density". |
| 6 | Three screens one composition | **Closed** for the two it named: the sheet has no right-hand column at any width (the record opens under its row) and Data's press opens a full-measure spread under the plate. `/quotes` keeps its panel; it is now the only list-left, detail-right screen. |
| 7 | The gate red | **Closed.** Green end to end (above). |
| 8 | The configurator's bars overlap by 33 px | **Closed.** The masthead measures itself; the flow case asserts the field and the stage never start above it. |
| 9 | `Quotes 0` beside one filed quote | **Closed.** `Quotes 1` beside "1 quote is filed in this browser" on every walk; `Customers 1 · Data 54` once the book exists. |
| 10 | Home, Lost and Customers overflow | **Closed.** Every screen that claims to fit does, at 800, 900 and 1,080; Lost is 844 in 844 at 390. |
| 11 | An amber act refusing at rest | **Closed** on the sheet (no form, no refusal, zero `aria-disabled` at rest) and Customers (the act refuses only after an empty press). |
| 12 | A write unfolds the sheet | **Closed.** RU230KAM shut, a Cash cell written ($3,060 → $12,345) and undone, RU230KAM still shut after each — at 1280, 1440 and 1920. |
| 13 | Four ways back, "Data" three times | **Closed.** The pill has no `‹`; the sheet, Data, the register, History and the paper draw no door the pill carries. |
| 14 | Router patterns and plan words | **Closed** for every string found: History, Entry, the build, the paper, the picker, Data, the register — and the cascade's dead end, done in this pass. |
| 15 | `/quotes` says the file is missing while reading it | **Closed** there; the same fault on the dead end was found and closed in this pass. |
| 16 | Filing a customer contradicted | **Closed.** "This quote was given to the name “R. Kelleher” before they were filed", counted as "1 quote by name". |
| 17 | Mostly empty floor | **Better, not closed** — see Quotes, History and Customers below. |
| 18 | Keycaps on a phone | **Closed.** Zero visible keycaps on every screen of the 390 walk. |
| 19 | Data's placeholder cut at 390 | **Closed** ("A table, a kind, a place or a workbook"). |
| 20 | The sheet's sentence under the tab bar | **Closed** — it stands above the list. |
| 21 | A blank crest | **Closed.** The helm before a file names a business, NM after. |
| 22 | The sheet looks like a spreadsheet | **Closed as a redesign** — the price list (below). |
| 23 | Home's wireframe empty state | **Closed** on Home. The register's empty state still draws one (below). |
| 24 | A Mercury on a Yamaha quote | **Closed.** The caption says the photograph is the maker's own rig and names this quote's motor. |
| 25 | "1 of them carry" | **Closed** ("1 of them carries no price at all"). |
| 26 | `data-1920x1080-plate.png` was the sheet | **Closed.** Re-photographed as Data's own spread. |
| 27 | `NO_CONFIGURATOR` alive in the source | **Closed.** The constant and its test are gone. |

**Density at 1280 × 800**, from the ruler's own reading in the final run:

| register | in view | room | holds |
| --- | --- | --- | --- |
| the sheet (Highfield) | 20 records, 28 px pitch | 596 px less 28 px of band head | **20 of 18** |
| the sheet (Highfield × Yamaha, × NSM Custom Trailers) | 20 each | 596 px | **21** each (`sheet.spec`) |
| Data | 18 records | 514 px | **18 of 18** |
| Customers, the book | 1 record | 626 px | **22 of 18**; **18 of 18** with the four desk groups standing (`customers.spec`) |
| History | 1 line | 654 px less 61 px for Today | **21 of 18**; **18 of 18** three days deep (`history.spec`) |
| Quotes | 1 record | 611 px less 72 px of band heads | **19 of 18** |

The other rulers, same run: contrast 0 below threshold on every screen at every viewport it measured; cut 0 cut everywhere (the sheet elides 9 · 22 · 42 · 41 · 41 · 34 runs with an ellipsis from phone to wide, Data 1 · 1 · 1 · 19 · 11 · 5, each with its ellipsis); overlap 0 overlapping on all thirteen routes at 1440 × 900. The overlap ruler compares only runs outside positioned layers, and on the sheet that is 40 runs with 256 set aside — see the sheet below.

---

## Screen by screen

Fit is `scrollHeight / innerHeight` read by the walk. "Caps" is keycaps visible on screen.

### Entry (`/sign-in`)

**Changed:** the fourth sentence says "Each person gets a sign-in of their own once quotes are kept
online" instead of a plan word; the photograph's table is named "Stacer · 91 rows in the file";
"28 of them say what fits what"; its fit is asserted in a flow test.

- **1440 × 900, 1280 × 800, 1920 × 1080:** 900/900, 800/800, 1,080/1,080. The Stacer 481 under its
  veil, the NORTHSIDE / MARINE pennant, one field and two doors. Pressing the blue door reads the
  file in about 4 s on this desk with both steps ticking beneath it.
- **390 × 844:** 1,214 px, scrolls on purpose; the doors are the last thing on the page.
- **Still wrong:** the caption beside the photograph — "Held photograph 1,771 × 1,183, drawn here
  at 1,440 × 962, never enlarged · stacer.com.au · in the image ledger since 16 September 2026" — is
  the image ledger talking, on the first screen anyone sees. Every page load logs a 404 for
  `/favicon.ico`.

### Home (`/`)

**Changed:** fits its window at the three desk sizes; the empty drafts column is a sentence and three
numbered steps (Choose the boat · Build it · Give it to the customer); the search helper says "⌕
Find, on the bar, opens what it finds" to a finger; the photographs fade in (cut under reduced
motion).

- **1440 × 900:** 900/900. Two photographs as one fold, the desk and the amber `New quote`, six
  counted figures, the makers' marks on paper, the drafts column — the best-looking screen.
- **1280 × 800:** 800/800. Everything above holds; the makers' plate is the column that reaches the
  foot.
- **1920 × 1080:** 1,080/1,080. The photographs take the width.
- **390 × 844:** 2,439 px, no keycaps, the tab bar at the foot.
- **Still wrong:** nothing measurable. The logo the owner asked to be the showpiece is Northside's
  own mark, and the repository holds none (`marks-ledger.json` has no Northside row), so the name is
  set in type and the crest is `NM`.

### The shell (every address but `/sign-in`)

**Changed:** no `‹`; the Quotes door counts what the register counts; the crest is the helm until a
file names the business, then `NM` on a 40 px medallion; keycaps vanish under a coarse pointer in
the primitive itself.

- **Desk sizes:** `NM · Home · Quotes 0 · Customers · Data 53 · History · ⌕ Find Ctrl K`, `Quotes 1`
  after the sale, `Customers 1 · Data 54` once the book is made. It covers no screen's words
  (flow case at six sizes).
- **390 × 844:** the tab bar, five words and the ⌕, no keycaps; the finder's rows read "Press a row
  and it does what it says".
- **Still wrong:** the finder does not read the dealer's own codes — `HBS126` finds nothing there
  (the sheet's own find field does find it). `yamaha f90` lists Pre-Delivery packages, which hold
  the run, above the F90 motors, which hold the words.

### The picker (`/quote/new`)

**Changed:** the colourway question stands in the plate's foot with the act; the plate grows with the
window; at rest it draws the shelf (one bar per register); in a hand it lists no models until asked
(1,439 px, was 17,325); `NO_CONFIGURATOR` is gone; "1 model" (this pass).

- **1440 × 900:** 900/900. ADV7: picture, three figures, `COLOURWAY — 7 CODES` with all seven chips,
  `$105,930`, `Start the quote` refused with its sentence directly under the chips; one press on
  LG-W-WB makes it live and names "Light Grey / White / White/Blue".
- **1280 × 800 / 1920 × 1080:** 800/800, 1,080/1,080; the same foot, nothing scrolling inside it.
- **390 × 844:** rest 1,439 px; ADV7 1,153 px, the chips above the act in one window.
- **Still wrong:** a model with no held picture (the PA700EW, chosen by the 1280 walk before it was
  pinned to the ADV7) leaves about 120 px of empty plate between its figures and its colourways.
  "Held copy 1,100 × 619, never enlarged · a studio picture from …" is ledger language again.

### The configurator (`/quote/$id`)

**Changed:** the masthead measures itself so nothing sticks under it; the stage caption names whose rig
is in the photograph and what this quote carries; "1 of them carries"; the plan word is gone; the
find field's `/` is a quiet cap that a finger never sees.

- **1440 / 1280 / 1920:** 2,109 px of page at all three (the build is a long page by design), the
  total `$124,421` in the masthead from the first paint; the finale 1,203–1,220 px.
- **390 × 844:** 3,828 px; the stage on top, the chapters stacked, no keycaps.
- **Still wrong:** on the deepest model, the SP660, no photograph is held, so the stage is the
  maker's mark on navy — honest and plain on the screen where the sale happens.

### The cascade (`/quote/$id/cascade`)

**Changed:** its dead end no longer names Milestone 6 (this pass).

- **1440 / 1280 / 1920:** 1,299 / 1,307 / 1,255 px. "Pricing at Trade changes 2 lines.", cards by
  cause, the build on its plate at the left.
- **390 × 844:** 2,013 px, the decision block last.
- **Still wrong:** the plate's small print ("On the plate: this row's own copy, 1,100 × 619, never
  enlarged — a studio picture from …") is ledger language on a showroom screen.

### The document (`/quote/$id/document`)

**Changed:** the dealership named on page 1; the customer's copy says only what the dealership says to
a customer (the working notes moved to the panel beside the paper); "Not priced on this quote";
the chrome carries `Back to the build` and `Print` and no pill door; the tab names the quote.

- **1440 / 1280 / 1920:** 2,537 px — two sheets of A4 at true size; NORTHSIDE MARINE, QUOTATION ·
  20260916-01, Issued 16 September 2026, then the hull.
- **390 × 844:** 3,244 px; "PAGE 1 OF 2 · A4", the same order.
- **Still wrong:** nothing found on this pass. The proposal round (Milestone 5 queue) is where the
  paper is meant to look the part.

### The quotes register (`/quotes`)

**Changed:** the door's count agrees; a reading state; the register runs to the foot and its room shows
the newest quote's boat when the heroes ledger holds that exact model; no Home in its head.

- **1440 × 900:** 900/900. With the ADV7 on it (hand walk) the room under the rows is the ADV7 on the
  water, captioned with the reference and the customer.
- **1280 × 800:** 800/800. With the SP660 on it (no hero held) the room is ~415 px of empty panel.
- **1920 × 1080:** 1,080/1,080, the same.
- **390 × 844:** 862 px — 18 px of scroll on the filed register; 1,317 px empty.
- **Still wrong:** the empty state's right panel still draws "A ROW WILL READ LIKE THIS" as dashed
  boxes labelled `the boat`, `the customer`, `the total`, `reference`, `age` — the wireframe the
  critic called the weakest object on Home, left standing here; at 1280 × 800 that panel's last
  paragraph sits under the panel's own fold and scrolls. A quote on a model with no hero leaves the
  room empty.

### Customers (`/customers`)

**Changed:** a spread — the words or the letter's paper on the left, one blue card to act in on the
right; the form rests live; a typed name that is exactly one filed person is listed on their page
as "given to the name … before they were filed"; the book's act above its rows.

- **1440 / 1280 / 1920:** 900/900, 800/800, 1,080/1,080 in every state walked (teaching, pile,
  letter, book).
- **390 × 844:** teaching 1,323 px, pile 1,119, letter 1,315 (the card first, on purpose), book
  844/844.
- **Still wrong:** at 1920 the letter's spread ends at about 680 px, with the floor below.

### Data (`/data`)

**Changed:** a maker's press opens a full-measure spread under its plate (its mark, its lineup as
bars, what pairs with it as tiles with the other makers' marks, `Open the sheet`); at 640–1439 a
plate's pairings are a line of ticks; no Home; the file-state sentence; the placeholder; the desk's
own register dated in the local calendar (this pass).

- **1440 × 900:** 900/900. Seven plates, the ledger of every base table by place, the ticks.
- **1280 × 800:** 800/800, 18 rows in view.
- **1920 × 1080:** 1,080/1,080. The spread is re-photographed as itself (critique #26).
- **390 × 844:** 2,658 px, plates stacked with their pairing lines.
- **Still wrong:** the order of what pairs with a maker depends on how the sheet came into the
  browser. On the first visit after the blue door Highfield read Yamaha, NSM, GFAB, Dealer Fit,
  Parts; after any reload (IndexedDB returns tables by id) it read Dealer Fit, GFAB, Parts, NSM,
  Yamaha. The catalogue store re-sorts rows into the file's order and not tables.

### The sheet (`/data/$table`)

**Changed: redesigned.** Direction A of `docs/directions/sheet-redesign/`, "The price list": one series
at a time as a chapter on a blue bar; each model one block whose spine says once what its variants
share — name, count, the lit rung's figure per material, one line per shared section, the held
render — and rows that say only what differs (Variant, Model Code, Cash, Trade, Warranty); PVC and
HYP as a real grouping level; what the whole table shares said once in the head (Matrix, Base
Freight, Other Charges, both marked cost); the record opens under its row; shut models live in the
address; the columns menu holds the other 26; Every column and Pictures are the other two doors.

- **1440 × 900:** 900/900. The Highfield wordmark heads the page — the one place a maker's mark is
  the showpiece of a working screen. A found row sits lit a third of the way down with its record
  (the variant's own render, IDENTITY, COST BUILD marked cost, MOTOR ENVELOPE) under it.
- **1280 × 800:** 800/800. 20 records in view, holds 20 of 18. After this pass the spine's figure is
  whole beside a ~100 px render and the lit row carries only its `record` button.
- **1920 × 1080:** 1,080/1,080; the render, its caption and the figure per material stand side by side inside every block (asserted per chapter at six sizes in the flow case added this pass — the caption had stood 7 px under a four-variant block here until the last fix of the round).
- **390 × 844:** 844/844, no keycaps. The list rests shut to the model; a press opens it in place;
  a row's record is the screen with "← Back to the price list" first.
- **Still wrong:** on a wide screen the spine is a fixed width and, beside a 15-variant block, mostly
  blank paper under three lines; a tablet's spine draws no render; at 834 the find field's
  placeholder is cut ("Find a model, a code or"); shutting the found row's own model moves the list
  to the next model, so its shut line can stand just above the window; the overlap ruler set 256 runs
  aside as positioned layers here and compared 40, so its "0 overlapping" is thin evidence — the
  clipped keys at 1280 were found by eye, not by a ruler; a single-letter shortcut remap (WCAG
  2.1.4) is still owed.

### History (`/history`)

**Changed:** one order for a day (`inDiaryOrder`); every day and place in words; the head's Home gone;
keycaps only on a keyboard; the spine has an end — a rhythm of the last fourteen days, dot per
event in its strand's ink, and at a blue ring the day the diary began with what it has held.

- **1440 / 1280 / 1920:** 900/900, 800/800, 1,080/1,080. Today, one line
  `09:00 · started · addressed · issued · Highfield - SP660 (PVC) W-W-WB · R. Kelleher · GIVEN
  $124,421`, the rhythm, the ring.
- **390 × 844:** 844/844 with the line and the ring; the legend becomes "Tap a line to open it where
  it is, and tap it again to fold it."
- **Still wrong:** with one line on it, a wide screen is still about 600 px of composed but empty floor
  between the line, the rhythm and the ring.

### The dead end (any address with no screen)

**Changed:** one loud way out (Home) and only the door the pill does not carry (Start a quote); no
address printed but the one typed; a dealer's sentence; it fits; blank eyebrow while reading (this
pass).

- **1440 / 1280 / 1920:** 900/900, 800/800, 1,080/1,080, "NORTHSIDE MARINE" over "There is nothing at
  this address." once the sheet is read.
- **390 × 844:** 844/844.
- **Still wrong:** nothing found.

---

## Still wrong, ranked by what the owner would hit first

1. **The finder does not read codes.** `HBS126`, the code a dealer orders by, finds nothing in Ctrl K
   (the sheet's own field finds it).
2. **Ledger language on showroom screens.** "Held copy 1,100 × 619, never enlarged", "drawn here at
   609 × 406", "in the image ledger since…" on Entry, the picker, the build and the cascade. True,
   and not a dealer's words.
3. **The register's empty state is a wireframe**, the fault #23 fixed on Home; and at 1280 its panel
   scrolls.
4. **Empty floor at wide sizes** where one record is the honest state: the register with a model that
   has no hero (~415 px), History at 1920 (about 600 px), Customers at 1920 (~400 px), the sheet's spine
   beside a long block.
5. **Data's pairing order depends on the load path** (file order on the first visit, id order after a
   reload).
6. **The sheet's smaller edges:** the tablet's cut placeholder, no render on a tablet spine, the shut
   line jumping above the window, the overlap ruler's thin coverage on this screen.
7. **A 404 for `/favicon.ico` on every load**, and WCAG 2.1.4 owed on the single-letter keys.

## Evidence

Every screen was re-photographed on this tree at 1440 × 900, 1280 × 800, 1920 × 1080 and 390 × 844
under `docs/directions/<screen>/built/<screen>-<size>[-state].png` (entry, home, shell, quotes,
history, customers, data, sheet, lost, picker, configurator, cascade, document — 114 files; Entry's
and Home's `-m2` names are rewritten with the same shots so the walk that cites them still resolves).
The 390 full-page shots are taken as a tall window, because Playwright's `fullPage` under mobile
emulation drops `pointer: coarse` until the next navigation (measured: coarse true → false → true
across the shot and a reload) and would have photographed a desk's keycaps on a phone. The `flow-*`
and `after-*` shots are earlier rounds' and were left as they were.

**Deleted, because their faults are fixed:** `sheet/built/FAULT-sheet-1440x900-at-opens-row-one.png`
(#1), `document/built/FAULT-document-1440x900-unnamed-business.png` (#2),
`picker/built/FAULT-picker-1440x900-colourway-hidden.png` (#3). No `FAULT-*` shot remains.
