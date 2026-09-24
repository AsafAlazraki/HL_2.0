# The last of Milestone 2, second pass, verified: what is on screen now

Written 2026-09-25 by this round's second verifier, alone on the machine, the last hands on the tree
before a fresh critic. The specification is the final critic's `docs/directions/built-critique-m2-close-2.md`;
the round's first verifier wrote `docs/directions/m2-last.md`, a fresh critic answered it in
`docs/directions/m2-last-critique.md` (two blockers, five majors, seven minors), and one fixer per
screen answered that critic. Their work is the twenty dated lines of `docs/DECISIONS.md` from "The
finder and Home's search find a boat by the name the app prints" to "A horsepower range says its
unit once". Everything below was measured on this tree after the three changes this pass made.
Nothing is carried over from a fixer's report without being driven or read off the gate.

**Before anything ran**, eight servers the fixers and the critic had left behind were stopped: three
`vite` dev servers and five previews, on ports 6591–6630. That left the machine to the gate.

**How it was driven.** A script walked one sale cold, in a fresh browser at each size, through the
real door and the real acts, and photographed each screen into `docs/directions/<screen>/built/`.
The steps: the blue door → Home's New quote → Highfield → the ADV7, pressed where it stands in the
list (tapped on the tablet, which has touch, after scrolling to it as a hand would) → Black / Grey /
Black → Start the quote → the build → the Yamaha F250XCB → See what Trade does → Leave it as it is
→ Who it is for, R. Kelleher → the finale → Give it to the customer → Open the document → the paper,
printed to a PDF and read under print at A4 width → Quotes → History → Customers, R. Kelleher. It
ran at **1440 × 900** and at **834 × 1112 with touch**, with no page error and no console error at
either size. A second maker was driven at 1440: a Haines Signature Fisher 525F, which the file holds
at nought, was priced on the build, given, and its paper read. Ctrl K and Home's field were asked
every name the critic typed. Every photograph was read by eye.

Every screen is still **PROVISIONAL** in `docs/SCREENS.md`: the owner has not looked.

---

## The gate, alone, on this tree

| gate | reading |
| --- | --- |
| `npm test` | **215 test files, 3,628 tests, 14 static rules, no failures**, 193 s wall (vitest 156.5 s); typecheck on both projects, oxlint at zero warnings, prettier clean. The fixers' tree before this pass was already green: 215 files, 3,626 tests, 201 s. |
| `npm run build` | green, 3.5 s, no warning |
| `npm run e2e` | **1,404 tests, 2 workers, 61.9 minutes: 1,075 passed, 323 skipped, 6 failed**, alone on an idle desk. The 6 were one case at six sizes, and a real red (below). With its cause fixed, the case passes alone at six sizes with `--last-failed --timeout 120000 --workers 1`: **6 of 6**. The whole `shell.spec` then ran at six sizes: **111 passed, 3 skipped, 0 failed**, 6.0 minutes. |

**Passed by spec, in the full run:**

- Flows: shell 105 (+6 once fixed), sheet 98, configurator 81, cascade 78, picker 76, data 76, document 74, history 55, customers 49, quotes 42, entry 39, home 36, pack-loads 12, smoke 6, lost 6.
- The shot recipe: 12.
- Rulers, 230 in all: contrast 84, cut 84, fixture 16, ramp 14, overlap 14, refusal 13, density 5.

The 323 skipped are skipped by design:

- the ruler fixtures and the refusal board run at one viewport
- density runs at 1280 × 800 only
- the print cases run at 1440 only
- a hand skips the keyboard-only and desk-only cases

**The one red, and its cause.** Case: "a boat found by its code is quoted from the finder, and the build opens on it". It asked the build it opened for the file's model code, "SP560". The build no longer prints that code anywhere. The boat is "Highfield Sport 560". The trailer used to carry the code inside its own name ("REDCO Custom / Highfield SP560 Aluminium - TA600-MOB"), and it now reads "… Highfield Sport 560 Aluminium · TA600-MOB". That came from this round's naming of motors and trailers, and the fixer who made it did not run the shell's flows. The build had opened on the right boat: the failure's own page text reads "chosen: Highfield Sport 560 · Hypalon · Black / Black / Black", which is HBS126. So the assertion was wrong, not the app. The case now reads the found row's name off the finder and asks the build for it.

**The rulers on this tree:**

- **Contrast:** 0 below threshold on every route at six sizes, read by day and by night.
- **Refusal:**
  - the finale's "This quote is addressed to nobody…": **9.93 : 1 by day, 7.88 : 1 at night**
  - Entry's "The Master Price File is being read now.": 12.19 : 1 at its lowest (844 × 390), and 14.65–15.96 : 1 elsewhere
  - the board's room reasons: 8.7 : 1
- **Cut:** 0.
- **Overlap:** 0 at 1440.
- **Density at 1280 × 800:**
  - the sheet holds 20 of 18
  - Data holds 18 of 18
  - Customers holds 22 of 18
  - History holds 21 of 18
  - Quotes holds 19 of 18

`src/domain/quote/golden.test.ts` does not differ from HEAD and is green.

---

## What this pass did

### Left in notFixed because it was another agent's file

1. **No letter is a door** (the registers' keycap fixer: "Not this change's: the shell's global
   G-then-letter chord"). `G` then H, Q, C, D or Y went to that door from any screen outside a field.
   Those are character keys with no way to turn them off, which WCAG 2.2 SC 2.1.4 does not allow.
   The chord is gone from `Shell.tsx`, its line from the `?` sheet, and the `key` from every door in
   `src/app/ways.ts`. The same reading found the finder printing `N` beside New quote and `L` beside
   Load the file. N was the registers' new-quote letter, retired the same day, and L was never bound
   to anything, so the finder was printing keys that do nothing. Finder rows now carry no key.
   `shell.spec` "no letter is a door, with or without a G in front of it" passes at six sizes: G D C
   leaves the address alone, and no row of the finder has a `kbd`.

### Found by driving, and fixed

2. **The finder named the Haines by its Model Code.** Asked "haines signature fisher 525f", Ctrl K
   answered "Fisher 525F · Haines Signature · Start a quote". The card says "Signature Fisher 525F"
   and the build and paper say "Haines Signature Fisher 525F". The picker's fixer had changed a
   MODEL's words. The finder prints a VERSION's words (`Variant.shown`), which still took the maker
   off the front of the whole name, and for Haines that took the row's own first word as well.
   `versionShown` in `fleet.ts` now says a version as its card says the model, then what follows the
   name. The finder's rule for printing a code beside a boat now also leaves off a code whose every
   word the name already says, which is the build's own `codeBeside`, so the line does not read
   "Signature Fisher 525F  Fisher 525F". Pinned in `fleet.test.ts` (every boat version on the file),
   `lines.test.ts` and `shell.spec`. Driven after: "Signature Fisher 525F · Haines Signature · Start
   a quote".

### Found, and deliberately not changed

3. **"Fuel Capcity" on a Haines quote.** The Haines register names its column "Fuel Capcity L". The
   six other boat registers write "Fuel Capacity". The misspelling prints on the picker's plate, the
   build, and page 1 of the customer's paper ("Fuel Capcity 100 L"). A correction through the names
   ledger was written, and then taken out again. `spoken.ts` holds that "a typo stays a typo … the
   sheet is where the dealer corrects his file", and the sheet can rename the column. The decision is
   the owner's; it is listed under "still wrong".

Each change has a dated line in `docs/DECISIONS.md`.

---

## The fresh critic's list (`m2-last-critique.md`), item by item

| # | finding | on this tree |
| --- | --- | --- |
| B1 | A Haines Signature quote tells the customer the boat is "Included" at $0 | **CLOSED.** The picker says "No price on file" and "you put the price on it". The build opens on 01 The hull with "The boat's price, tax included" and "Put this price on the boat". The masthead reads "The boat has no price yet, so this is everything but the boat" at $8,473. After 71,500 the total is $79,973. The given paper reads "01 The hull $71,500 · Haines Signature Fisher 525F", and Your price reads "The hull $71,500 … Total, tax included $79,973". No "Included" and no $0 appear. |
| B2 | The finder and Home refuse the names the app prints | **CLOSED.** Ctrl K finds a boat for "sport 560", "highfield sport 560", "patrol 700" (EW and ST), "roll up 230" (AL and KAM), "haines signature fisher 525f", "jeanneau merry fisher 605", "adv7 black" (the quote, then "ADV7 · 5 of its 7 versions") and "HBS126". Home's field answers "sport 560" with "15 lines answer to that." |
| 3 | Pressing a motor opens the hull's seven finishes | **CLOSED.** After the F250XCB, the open chapter is "Who it is for", at 1440 and at 834. |
| 4 | Motors and trailers are the file's key strings on the paper | **CLOSED.** The paper reads "Yamaha F250XCB · Includes pre-delivery" and "REDCO Custom / Highfield ADV7 Aluminium · TA700T-EH · Includes registration". The kit is in dots. |
| 5 | Engine words and file columns on dealer screens | **CLOSED on the sale.** The register's and History's heads say "53 lists · 15,691 lines". The panel says "1 quote, by where it stands" and "at the prices it was written at". The cascade says "Cash → Trade", with one "now priced at Trade" heading, "no Trade price on the price file — it stays at its Cash price", and no `Sell inc Rego`, `Sell Price` or `Trade Price` anywhere. The finale says "already has pre-delivery in its Cash price". The note beside the paper says "Priced at · Cash, on 3 of the 4 lines". |
| 6 | The picker names Stacer and Haines boats differently from the build | **CLOSED on the picker**, and now in the finder too (fix 2). The picker shows "Signature Fisher 525F", and its series reads "Fisher Series · 5 models · as at 18.03.2026". |
| 7 | Keycaps, the sheet's grid, History's floor, the mark | **Keycaps CLOSED:** 0 visible on Quotes, History and Customers at both sizes, and no letter is a shortcut anywhere (fix 1). **History's floor CLOSED:** one cell says "12 – 24 Sep, the 13 days before this diary began", and the kept day is a tile with the ADV7's render, its name and R. Kelleher, at 900 / 900 and 1,112 / 1,112. **The sheet's model names** are spoken now ("Roll Up 230 KAM"), and `+ variant` has moved into the record. **Still open:** the sheet is still a grid, and Northside's mark (Milestone 4). |
| 8–14 | The minors | Separators: no name opens a line on "·" or "/", and each breaks at its largest joint on the cascade, the peek and the chips. Black swatches on Customers' navy card are edged (9.61 : 1, per the fixer). "Max 250 HP HP" is gone (`sheet.spec` reads "Max 250 HP" at six sizes, green in this run). The picker's act waits in the plate's pale blue and is amber only once a colour is chosen: oklch(0.9 0.05 249) at rest, oklch(0.783 0.145 73) live, both measured here. A given quote shows no "See what Trade does". **Still open:** the Haines chapters read 01, 03, 04 (by design, see below), and a change made less than 300 ms before a reload was not re-driven. |

## The final critic's list (`built-critique-m2-close-2.md`)

- **The three blockers stay closed.**
  - The finale's reason reads 9.93 : 1 by day and 7.88 : 1 at night (the refusal ruler, this run).
  - The tablet plate stands beside the list (this walk, at 834 × 1112).
  - The cascade and the paper agree on the rigging kit: "Not priced on this quote".
- **The one thing to change first is closed.** A boat reads "Highfield ADV7 · Hypalon · Black / Grey /
  Black" on the build, the cascade, the paper, the register, History, Customers and the finder.
  Colourways are drawn as colour on the picker's chips (named at 1440 and at 834), the build, the
  paper and Customers. Every measure carries its unit: 6.98 m, 2.68 m, 32 cm, 519 cm, 200 cm and
  1,300 kg.

---

## The sale, screen by screen

### The picker (`/quote/new`)

- **1440 × 900** (`picker-1440x900`, `-adv7`, `-chosen`): 900 / 900. "289 models from 7 makers, at
  Cash prices." The ADV7 stands at the foot of Adventure and is pressed without scrolling. The plate
  shows:
  - the name at 234–270
  - three figures with their units
  - "Colour · 7": seven chips, each with its swatches and its name
  - $105,930
  - the act waiting in pale blue at 773–825, with "A quote is for one ADV7 in one colour, so choose a
    colour above first."

  After Black / Grey / Black the plate reads "Colour · 7 in Hypalon" and "Black / Grey / Black ·
  B-G-B". The act is amber and live at 802–854.
- **834 × 1112, touch** (`-834x1112-*`): the ADV7 was tapped after scrolling to it (scrollY 3,107).
  The page reflowed to 6,025 so the card stayed in view, and the plate stands sticky beside it:
  - the name at 110–146
  - seven named chips, one to a row
  - the act at 934–986 of 1,112
  - the pressed card at 931–1,112

  After the colour the window did not move and the act was live at 935–987.
- **Still wrong:** "Sport 760 WL (Windlass)" keeps the file's bracket on the card's name line, while
  the card's cover splits it as "Sport 760 WL" over "Windlass". The ledger keeps WL(Windlass) exactly
  as the file writes it.

### The build (`/quote/$id`)

- **1440 × 900:** the headline is "Highfield ADV7" over three swatches and "Hypalon · Black / Grey /
  Black". The total is $128,108, then $159,958 once the motor is on, over "4 lines, each at the price
  it was picked at · 1 of them is not priced on this quote". The chapters:
  - 01 The hull, $105,930
  - 02 Motor, "chosen: Yamaha F250XCB · 2 more offered"
  - 03 Trailer, $22,178
  - 04 Dealer fit, Not priced on this quote

  Once the motor is on, Who it is for opens. The finale shows LINES 4 · NOT PRICED 1 · TOTAL $159,958.
  Given, the head reads "NORTHSIDE MARINE · QUOTE 20260925-01 · GIVEN TO THE CUSTOMER" with Open the
  document, the rail reads "20260925-01 is issued", and there is no Undo and no "See what Trade does".
  The page is 1,189 px, and 1,277 px given.
- **834 × 1112:** 1,709 px, and 1,747 px given. The stage is a band, with the photograph beside its
  words.

### The cascade (`/quote/$id/cascade`)

- **1440 × 900:** 1,111 px. "Pricing at Trade changes 2 lines." The card reads "Highfield ADV7 ·
  Hypalon · Black / Grey / Black", $159,958. Under "now priced at Trade" the hull falls by $5,297
  (HBA001) and the Yamaha by $454. The trailer is held: "no Trade price on the price file — it stays
  at its Cash price". The DEC kit is held, Not priced on this quote. The change is −$5,751:
  "$159,958 now · $154,207 if you accept."
- **834 × 1112:** 1,475 px. The card sits above the sheet, and its name breaks at its joints:
  "Highfield ADV7 · Hypalon ·" over "Black / Grey / Black".

### The paper (`/quote/$id/document`), read as the customer reads it

`document/built/document-printed.pdf`, 2 pages of A4 (counted by `e2e/print/pdf.ts`). It was read
under print emulation at A4 width.

- **Page 1:**
  - NORTHSIDE MARINE · QUOTATION · 20260925-01 · Issued 25 September 2026
  - the ADV7's studio render on white
  - HIGHFIELD INFLATABLES
  - **Highfield ADV7**, its swatches, and "Hypalon · Black / Grey / Black"
  - OA Length 6.98 m, Beam 2.68 m, Tube Dia 32 cm, Int Length 519 cm, Int Width 200 cm
  - Summary: prepared for R. Kelleher, prepared by Asaf; Total, tax included **$159,958**; "One item
    is not priced on this quote and is not in this total."
- **Page 2:**
  - 01 The hull $105,930: the boat said whole
  - 02 Motor $31,850: Yamaha F250XCB, includes pre-delivery
  - 03 Trailer $22,178: REDCO Custom / Highfield ADV7 Aluminium · TA700T-EH, includes registration
  - 04 Dealer fit —: the kit in dots, Not priced on this quote
  - Your price: the same four chapters, the total, and the same sentence under it
- **Nothing of the app prints.** Print emulation shows only the two sheets, and no cost, no code and
  no engine word appear.
- The browser tab and the saved PDF read "Northside Marine quote 20260925-01 – Highfield ADV7".
- **Still wrong:** page 1 leaves about a quarter of the sheet empty under the summary. The dealer's
  note beside the paper (never printed) still speaks the image ledger: "Held 1,100 × 619, printed at
  656 × 369, never enlarged".

### The register (`/quotes`), History and Customers

- **All three** fit their window at both sizes (900 / 900 and 1,112 / 1,112), and 0 keycaps are
  visible.
- **The register:** the row reads "Highfield ADV7 · Hypalon · Black / Grey / Black · R. Kelleher ·
  $159,958 · 20260925-01". The head reads "Priced from the Master Price File · 53 lists · 15,691
  lines". At 1440 the room below the list is the ADV7 on the water.
- **History:** "03:15 · started · 1 pick · addressed · issued · Highfield ADV7 · Hypalon · Black /
  Grey / Black · R. Kelleher · GIVEN · $159,958 · 20260925-01". The fortnight is one cell for the days
  before the diary and one tile for today, carrying its boat.
- **Customers:** R. Kelleher's page. Their quote card is the ADV7's render, "Highfield ADV7",
  "Hypalon · Black / Grey / Black" with edged swatches, and "20260925-01 · Given · today".
- **Still wrong:** on History's line the " · R. Kelleher" after the boat's name sits a space further
  off than the other separators. Home's issued card breaks the name inside its colourway
  ("Hypalon · Black / Grey /" over "Black"). The joint rule is applied on the cascade, the peek and
  the chips only.

### A second maker: the Haines Signature Fisher 525F, at 1440

- **The picker:** "Signature Fisher 525F · No price on file", with "The price file holds no price for
  this boat. The quote still opens, and you put the price on it."
- **The build:** it opens on the hull, where the price is put on (see B1). There is no motor chapter,
  so the chapters read 01, 03, 04.
- **The paper:** prints the price put on the build as the hull's price, with "Your price" matching it.
  It also prints 01, 03, 04 and "Fuel Capcity 100 L".

The gap in the numbering is a recorded decision in `src/domain/quote/bands.ts`: the numbers are a
fixed reading order, so 03 always means Trailer. On the customer's paper it still reads as a missing
section. That call is the owner's.

---

## Still wrong, ranked by what the owner would hit first

1. **The sheet is still a grid** (the final critic's major 7), though its models now read by name
   and `+ variant` is in the record.
2. **The customer's paper for a quote with no motor** numbers its chapters 01, 03, 04. On a Haines
   quote it also prints the file's own "Fuel Capcity". Both follow recorded rules: a fixed reading
   order, and a typo stays a typo. Both are the owner's call.
3. **On a phone the colour chips carry no names** until one is pressed (the picker's fixer measured
   that naming them pushes the act under the tab bar; the owner's call).
4. **`?` and `/` are still shortcuts on a single character** at the desk: the sheet of keys, and into
   the field on Home and the build. WCAG 2.1.4 is owed on them. No letter is a shortcut any more.
5. **Small edges:** Home's issued card breaks inside the colourway. History's line spaces its last
   separator wide. The Highfield card name keeps "(Windlass)". Page 1 of the paper is a quarter
   empty. The image-ledger words sit in the note beside the paper. Home still says "Stabicraft: no
   public wordmark verified".
6. **A change made less than 300 ms before a reload** is lost (the critic's minor 13). Not re-driven
   here.
7. **Northside's own mark** is still nowhere (Milestone 4).
8. **The owner has looked at none of it.**

## Evidence

This walk's photographs, each from a fresh browser, under `docs/directions/<screen>/built/`:

- **1440 × 900:**
  - `picker-1440x900` (the doors), `-adv7`, `-chosen`
  - `configurator-1440x900`, `-finale`, `-issued`
  - `cascade-1440x900`
  - `document-1440x900` and `-full`
  - `quotes-1440x900-filed`
  - `history-1440x900-filed`
  - `customers-1440x900-letter`
- **834 × 1112, touch:** the same set under `-834x1112`.
- **The printed quote:** `document/built/document-printed.pdf`, R. Kelleher's quotation printed from
  the paper at 1440.

The 1280, 1920 and 390 shots were not re-taken in this pass. The e2e gate walks all six sizes.
