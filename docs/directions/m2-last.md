# The last of Milestone 2, verified: what is on screen now

Written 2026-09-24 by this round's verifier, alone on the machine, the last hands on the tree before
a fresh critic. The specification was the final critic's `docs/directions/built-critique-m2-close-2.md`:
three blockers, its one thing to change first (every boat and every colour named the way a person
says it, a unit on every measure), and the majors no later round owns. Six fixers answered it
(the refusal ink, the picker on a tablet, the cascade's "Standard", the names, the dead Undo, the
false promises). Everything below was measured on this tree after the six fixes this pass made;
nothing is carried over from a fixer's report without being driven or read off the gate.

**How it was driven.** A script walked one sale cold, in a fresh browser at each size, through the
real door and the real acts, and photographed each screen into `docs/directions/<screen>/built/`:
the door (the blue door reached Home in 1.9 s) → New quote → Highfield → the ADV7, pressed where it
stands in Highfield's list (a tap on the tablet, which has touch) → Black / Grey / Black → Start the
quote → the build → the Yamaha F250XCB → See what Trade does → Leave it as it is → Who it is for,
R. Kelleher → the finale → Give it to the customer → Open the document → the paper printed to a PDF
and read → Quotes → History → Customers. At **1440 × 900** and at **834 × 1112 with touch**. No page
error and no console error at either size. Every photograph was then read by eye, and the printed
PDF page by page, as the customer would read it.

Every screen is still **PROVISIONAL** in `docs/SCREENS.md`: the owner has not looked.

---

## The gate, alone, on this tree

| gate | reading |
| --- | --- |
| `npm test` | **206 test files, 3,504 tests, 14 static rules, no failures** — 188 s wall (vitest 150.6 s); typecheck on both projects, oxlint at zero warnings, prettier clean |
| `npm run build` | green, 3.5–3.7 s, no warning |
| `npm run e2e` | **1,344 tests, 2 workers, 57.4 minutes — 1,024 passed, 320 skipped, 0 failed**, alone on an idle desk. Passed by spec: shell 105, sheet 98, data 76, configurator 75, cascade 72, document 62, picker 61, history 55, customers 43, entry 39, quotes 36, home 36, pack-loads 12, recipe 12, smoke 6, lost 6; rulers 230 (contrast 84, cut 84, fixture 16, ramp 14, overlap 14, refusal 13, density 5) |

Nothing was red, so nothing needed a second reading with `--last-failed`. The 320 skipped are by
design: the ruler fixtures and the refusal board run at one viewport, density at 1280 × 800 only, the
print cases at 1440 only; a hand skips the keyboard and desk-only cases. Before the full run, the
print cases were run alone at 1440 (3 of 3), and the new one once with the shell's print rule taken
out (1 failed, "Received: visible"), to see it fail.

**The rulers on this tree.** Contrast: 0 below threshold on all fourteen routes at six sizes, each
read by day and by night. Refusal: the finale's "This quote is addressed to nobody…" and the given
peek's "This quote has been given to the customer, so it stays…" at **9.93 : 1 by day and 7.88 : 1
at night**; entry's "The Master Price File is being read now." at 12.19 : 1 at 844 × 390 (its lowest) and
15.61–15.96 : 1 at the other five sizes, in both themes.
Cut 0, overlap 0 at 1440. Density at 1280 × 800: the sheet holds 20 of 18 (its pairings 21), Data 18
of 18, Customers 22 of 18 (19 grouped), History 21 of 18 (18 three days deep), Quotes 19 of 18.

---

## What this pass did

### Left in `notFixed` because it was another agent's file

1. **The route leaves the window where it is on a refinement** (the picker's fixer). The router's
   scroll to the top on every new address was being undone inside the screen after it happened.
   `goTo` now takes `{ stay: true }` for a material or a colour and `src/routes/quote.new.tsx` turns
   it into `resetScroll: false`; a new maker or a new boat is still a new page. Measured: after
   Black / Grey / Black the tablet's window stayed at 6,025 (6,025 before the press) with the act at
   715–767. Pinned in `Picker.test.tsx`.
2. **The build says what the paper says** (the cascade's fixer). The build's chapter head said "Not
   priced yet", its line under the total "1 of them carries no price at all" and its finale
   "Carrying no price" for the rigging kit the paper prints "Not priced on this quote". All three now
   use the paper's words: the Dealer fit chapter reads **Not priced on this quote**, the masthead "4
   lines, each at the price it was picked at · 1 of them is not priced on this quote", the finale
   **Not priced 1**. Pinned in `say.test.ts`.
3. **`CascadeRow.standard` is gone from the contract** (the cascade's fixer: "not this change's
   file"). After the inference was deleted the flag was declared, written `false` five times and read
   nowhere. `src/domain/model/offer.ts` no longer declares it and `cascade.test.ts` holds that no row
   carries it. The golden proof is untouched and green.

### Found by driving, and fixed

4. **The shell printed on the customer's paper.** The first PDF of R. Kelleher's quotation carried
   the pill — `NM · Home · Quotes 1 · Customers 1 · Data 53 · History · Find Ctrl K` — across the
   head of both A4 pages, above NORTHSIDE MARINE: the pill is `position: fixed`, and a printer repeats
   a fixed box on every sheet. The print gate only counted pages. `shell.css` now hides the pill and
   the finder in print, and `document.spec` "prints the sheets and nothing of the app around them"
   emulates print and fails on any word painted outside the sheets. Run with the rule taken out, it
   fails ("Received: visible"); with it, it passes, and the PDF read after carries the two sheets
   and nothing else.
5. **A given quote's build invited a motor and a return** (the critic's minors 13 and 19). The stage
   caption said "with no motor yet — 02 Motor is where one goes on" and the note "Saved as you go —
   close this and come back to it any time" on a quote nothing can change. It now says "with no
   motor" and "Kept in this browser exactly as it was given." Pinned in `say.test.ts`.
6. **The maker's name ran into the caption at 834.** In the build's band the maker's line sat 4 px
   under "This quote: …", reading as the caption's last line; it has the 16 px it has on a desk.

Each has a dated line in `docs/DECISIONS.md`.

---

## The final critic's list

### The three blockers

| # | finding | on this tree |
| --- | --- | --- |
| 1 | The reason under a refused act at 1.23 : 1 | **CLOSED.** The ink is a role (`--color-ink-reason`, `-paper`, `-picture`); the fixer measured 9.93 : 1 by day and 7.88 at night under "Give it to the customer" and under the given peek's "Discard this quote". The new refusal ruler reaches both states, and entry's doors with the file held at the wire, at six sizes in both themes, and reads each reason by its text; the contrast ruler now reads every route by day and by night. Both are in the e2e run above. |
| 2 | On a tablet a pressed boat appears to do nothing | **CLOSED.** Driven with touch at 834 × 1112: the ADV7 tapped at the foot of Highfield's list, and the plate stands beside the list in the window — name at 110–146, the seven colours, $105,930, `Start the quote` at 714–766 of 1,112, the pressed card at 931–1,112. After Black / Grey / Black the window did not move and the act came live in place. 844 × 390 and 390 × 844 are the picker flow's new case at six sizes. |
| 3 | The cascade says "Standard" for a line the paper calls unpriced | **CLOSED.** The cascade's third card reads "the price file has no price for it at any level, so it is not in the total" over the DEC rigging kit, **Not priced on this quote**; the paper prints the same words on page 2 and in Your price; the build's chapter head now says it too (fix 2). |

### The one thing to change first

**CLOSED for boats and colours, on every screen the critic named.**

- **The build:** headline `Highfield ADV7` over three swatches and "Hypalon · Black / Grey / Black";
  the hull chapter "chosen: Highfield ADV7 · Hypalon · Black / Grey / Black · 7 finishes"; the stage
  caption "This quote: Hypalon in Black / Grey / Black, with the Yamaha - F250XCB from 02 Motor."
- **The paper:** "Highfield ADV7" at 36 px with its swatches, the hull line "Highfield ADV7 · Hypalon ·
  Black / Grey / Black", the rigging kit's pipes said as dots, the tab and the saved PDF "Northside
  Marine quote 20260924-01 – Highfield ADV7".
- **The finder:** Ctrl K, "adv7 b-g-b" → "ADV7 · Hypalon · Black / Grey / Black · HBA001 · Highfield
  Inflatables · one of 7 versions · $105,930 · Start a quote", then the file's own "Highfield - ADV7
  (HYP) B-G-B … as Highfield Inflatables lists it · Open it on the sheet" for the dealer.
- **The register, History, Customers and the cascade:** "Highfield ADV7 · Hypalon · Black / Grey /
  Black" as the row, the line, the card (with its swatches) and the card's title.
- **The picker:** at 1440 the chips are the colour's swatches beside its name, two to a row; at 834
  they are the swatches alone, and the line under them names the chip chosen ("Black / Grey / Black ·
  B-G-B").
- **Units:** OA Length 6.98 m, Beam 2.68 m, Tube Dia 32 cm, Int Length 519 cm, Int Width 200 cm on
  the build and the paper; 6.98 m, 519 cm and 1,300 kg on the picker's plate.

**"ADV7", not "Adventure 7".** The critic's example is not the maker's name: the maker's page for
the model (adventure.highfieldboats.com/boat/adv/adv7/) is headed ADV7, and the ledger
`data/northside/names.json` records the page, its heading and its title, read 2026-09-24. Under
the rule that nothing is invented, the app says what the maker says. A code neither the file nor the
maker decodes (I, O, R, WH) stays the code and draws no swatch.

### The majors

| # | finding | on this tree |
| --- | --- | --- |
| 1 | Home's 810 boats beside the picker's 289 models | **CLOSED.** Home reads "What Northside Marine sells · 289 boats" and "Highfield Inflatables · 67 models", looked at after the gate; one rule (`countBoats`) is shared with the picker's fleet. |
| 2 | An Undo that can never work on a given quote | **CLOSED.** 0 Undo on the given build at both sizes; the rail says "20260924-01 is issued" and nothing beside it. |
| 3 | Engine words on dealer screens | **Open outside the sale.** Still on this tree: the register's head "Priced from the Master Price File · 53 tables · 15,691 rows" and History's "· 53 tables"; the register's panel "1 quote, in three bands" and "each figure is the sum of that document's own frozen lines"; the paper's side panel (the dealer's, never printed) "this register carries no price column at all", "Cash — 3 of the 4 lines carry that rung", "Pair it on the subject's own page and it shows here"; the cascade's "it stays at Sell inc Rego". History's teaching state is in the dealer's words now. |
| 4 | Empty states promise an export | **CLOSED.** |
| 5 | The key string as the boat's name | **CLOSED for boats** (above). |
| 6 | The colour choice has no colour | **CLOSED** on the picker, the build, the paper and Customers; on the sheet the Variant column draws a flag beside `LG` and leaves `WH`, which nothing decodes, as the code with no flag (looked at after the gate). |
| 7 | The sheet is still a data grid | **Open.** No round owned it. |
| 8 | `+ variant` painted over the spine on a tablet | **Open.** No round owned it. |
| 9 | The ADV7's act below the fold at 390 | **Closed by the picker's fixer**, held by the picker flow's case at six sizes. |
| 10 | Wide floor is still floor | **Open.** History at 1440 is a fortnight of thirteen empty dashed boxes beside today's three dots; at 834 about 280 px of empty band between today's line and the fortnight. |
| 11 | Keycaps at the desk | **Open.** Quotes (J K Space Enter Esc, N), History (T W M Y, N, J K Space Enter Esc), Customers (/ B N Esc). |
| 12 | His own mark | **Open**, Milestone 4. |

---

## The sale, screen by screen

### The picker (`/quote/new`)

- **1440 × 900:** 900 / 900. The ADV7 pressed at the foot of Adventure: plate name at 234–270,
  photograph, three figures with units, "Colour · 7" as seven named chips in two columns, $105,930,
  the act refused at rest in its quiet amber with "A quote is for one ADV7 in one colour, so choose a
  colour above first." After Black / Grey / Black: "Colour · 7 in Hypalon", the chip ringed, the act
  live at 802–854.
- **834 × 1112, touch:** see blocker 2. The list is two cards abreast beside a sticky plate.
- **Still wrong:** at 834 the seven chips are unnamed swatches until one is pressed, and two of them
  differ only by half a square (Light Grey / White / White/Blue against Light Grey / White / Light
  Blue); on a touch screen nothing names a chip before it is chosen. The plate for a many-colour
  model still rests on a refused act (minor 21).

### The build (`/quote/$id`)

- **1440 × 900:** 1,192 px, scrolls by design. Headline, swatches, $128,108 then $159,958 with the
  motor, "4 lines, each at the price it was picked at · 1 of them is not priced on this quote".
  Chapters: The hull $105,930 · Motor $31,850 · Trailer $22,178 · Dealer fit **Not priced on this
  quote**. Given: "NORTHSIDE MARINE · QUOTE 20260924-01 · GIVEN TO THE CUSTOMER", Open the document,
  no Undo, "Prepared by Asaf. Kept in this browser exactly as it was given."
- **834 × 1112:** 1,712 px. The stage is a band, photograph beside its words, the caption 16 px above
  HIGHFIELD INFLATABLES (fix 6).
- **Still wrong:** on a given quote the Motor chapter of a quote with no motor still reads "Nothing on
  it yet" and chapters still count what is "offered".

### The cascade (`/quote/$id/cascade`)

- **1440 × 900:** 1,217 px with the motor. "Pricing at Trade changes 2 lines." The ADV7's render on
  its card, "Highfield ADV7 · Hypalon · Black / Grey / Black", −$5,297 on the hull, −$454 on the
  Yamaha, the trailer held at its only price, the rigging kit **Not priced on this quote**.
- **834 × 1112:** 1,582 px, the card above the sheet.
- **Still wrong:** at 834 the card's title wraps as "Highfield ADV7 · Hypalon / · Black / Grey /
  Black", a line that starts on its separator; "Sell inc Rego" and "Trade Price" are the file's column
  names.

### The paper (`/quote/$id/document`), read as the customer reads it

The PDF, two A4 pages (`document/built/document-printed.pdf`):

- **Page 1:** NORTHSIDE MARINE · QUOTATION · 20260924-01 · Issued 24 September 2026; the ADV7's
  studio render on white; HIGHFIELD INFLATABLES; **Highfield ADV7**; three swatches, "Hypalon · Black
  / Grey / Black"; five measures with their units; Summary: prepared for R. Kelleher, prepared by
  Asaf; Total, tax included **$159,958**; "One item is not priced on this quote and is not in this
  total."
- **Page 2:** 01 The hull $105,930 · 02 Motor "Yamaha - F250XCB", includes pre-delivery, $31,850 ·
  03 Trailer "REDCO Custom / Highfield ADV7 Aluminium - TA700T-EH", includes registration, $22,178 ·
  04 Dealer fit, the kit in dots, **Not priced on this quote** · Your price, the four chapters, the
  total, the same sentence under it.
- **Nothing of the app is on it** (fix 4). No cost, no code, no engine word.
- **Still wrong:** the motor and the trailer are printed in the file's own words with its " - "
  ("Yamaha - F250XCB"); the naming work covered boats only. Page 1 leaves about a quarter of the
  sheet empty under the summary.

### The register (`/quotes`), History and Customers

- **1440 × 900 and 834 × 1112:** each fits its window (900 / 900, 1,112 / 1,112).
- **The register:** the row "Highfield ADV7 · Hypalon · Black / Grey / Black · R. Kelleher · $159,958 ·
  20260924-01"; at 1440 the room is the ADV7 on the water with its caption band.
- **History:** "20:00 · started · 1 pick · addressed · issued · Highfield ADV7 · Hypalon · Black / Grey
  / Black · R. Kelleher · GIVEN · $159,958 · 20260924-01" (the tablet walk), in the order it happened.
- **Customers:** R. Kelleher's page, and their quote card "Highfield ADV7" over "Hypalon · Black /
  Grey / Black" with its swatches on the navy card.
- **Still wrong:** major 3's words and major 11's keycaps (table above), major 10's empty floor. On
  Customers' navy card the two black swatches are black on navy: the name beside them carries the
  colour, but the squares themselves nearly vanish (their hairline is drawn for a pale ground).

---

## Still wrong, ranked by what the owner would hit first

1. **Engine words and file headers outside the sale** — "53 tables · 15,691 rows" on the register
   and History, "frozen lines" and "three bands" on the register's panel, "rung", "register" and
   "subject" in the note beside the paper, "Sell inc Rego" on the cascade.
2. **Keycaps at the desk** on Quotes, History and Customers, and WCAG 2.1.4 still owed on the single
   letters.
3. **The sheet** is still a well-typeset grid (major 7), with `+ variant` over the spine on a tablet
   (major 8).
4. **Motors and trailers keep the file's punctuation** on the paper and the build ("Yamaha -
   F250XCB").
5. **On a tablet the colour chips carry no names** until one is pressed.
6. **Empty floor** on History at every size.
7. **Small edges:** "Nothing on it yet" on a given quote's empty chapter; the cascade card's title
   wrapping on its separator at 834; black swatches on Customers' navy card.
8. **Northside's own mark** is still nowhere (Milestone 4).
9. **The owner has looked at none of it.**

## Evidence

This walk's photographs, each a fresh browser, under `docs/directions/<screen>/built/`:

- **1440 × 900:** `picker-1440x900` (the doors), `-adv7`, `-chosen`; `configurator-1440x900`,
  `-finale`, `-issued`; `cascade-1440x900`; `document-1440x900` and `-full`; `quotes-1440x900-filed`;
  `history-1440x900-filed`; `customers-1440x900-letter`.
- **834 × 1112, touch:** the same set under `-834x1112`.
- **The printed quote:** `document/built/document-printed.pdf`, the PDF of R. Kelleher's quotation as
  printed from the paper at 1440.

The 1280, 1920 and 390 shots were not re-taken in this pass.
