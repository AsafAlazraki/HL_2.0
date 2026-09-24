# Milestone 2's second fix round, closed: what is on screen now

Written 2026-09-24 by the verifier of the second fix round, the last hands on the tree this round.
The specifications were `docs/directions/built-critique-m2.md` (four blockers, fourteen majors,
nine minors) and the fresh critic's `docs/directions/built-critique-m2-close.md` (two blockers,
ten majors, eleven minors), which the second round's fixers answered screen by screen. The first
round's own close is `docs/directions/built-m2-close.md`. Everything below was measured on this
tree, after the four fixes this pass made; nothing is carried over from a fixer's report without
being driven or read off the gate.

**How it was driven.**

- **By hand, at 1440 × 900**, in a Chromium driven one press at a time on a cold origin (an
  address this browser had never opened, so nothing was in its storage), a screenshot read at every
  step: the door → a name → the blue door (3.5 s to Home) → Home → the pill to Quotes, Customers,
  History and Data → Highfield's plate → the sheet → Ctrl K, `Highfield - SP560 (HYP) LG-W-WB` →
  "Open it on the sheet" → Roll-Up, shut RU230KAM, a Cash cell written and undone → Only the
  models → Pictures → Every column → Home → New quote → Highfield → the ADV7 and its seven
  colourways → B-G-B → the build → "See what Trade does" → Leave it as it is → Who it is for,
  R. Kelleher → the finale → Give it to the customer → the document → Quotes → History →
  Customers → a reload of each. That walk found four faults the gate had not; all four are fixed
  below and each is pinned by a test.
- **By script, at 1440 × 900, 1280 × 800, 1920 × 1080 and 390 × 844** (the phone with touch and a
  coarse pointer), each a fresh browser walking the same sale end to end — the ADV7 in B-G-B
  addressed to R. Kelleher and given, then a Stacer 519 Sea Ranger SDF started from Home's
  photograph — photographing every screen into `docs/directions/<screen>/built/` and reading each
  screen's fit, sideways scroll and visible keycaps as it went. It minted its quotes through the
  picker's own act and typed its customer at the build; nothing was planted. No page error at any
  size; the one console error on every load is the known 404 for `/favicon.ico`.

Every screen is still **PROVISIONAL** in `docs/SCREENS.md`: the owner has not looked.

---

## The gate, alone, on this tree

| gate | on the tree the fixers left | on the final tree, after this pass's four fixes |
| --- | --- | --- |
| `npm test` | **202 test files, 3,438 tests, 14 static rules, no failures** — 183 s wall (vitest 146.6 s); typecheck on both projects, oxlint at zero warnings and prettier clean | **202 test files, 3,439 tests, 14 static rules, no failures** — 182 s wall (vitest 145.8 s) |
| `npm run build` | green, 3.4 s, no warning | green (rebuilt by every Playwright run below) |
| `npm run e2e` | **1,284 tests, 2 workers, 56.4 minutes — 989 passed, 295 skipped, 0 failed** | **1,284 tests, 2 workers, 56.2 minutes — 989 passed, 295 skipped, 0 failed**, alone on an idle desk. Passed by spec: shell 105, sheet 98, data 76, configurator 69, cascade 66, document 61, picker 55, history 55, customers 43, entry 39, quotes 36, home 36, pack-loads 12, recipe 12, smoke 6, lost 6; rulers 214 (contrast 84, cut 84, ramp 14, overlap 14, fixture 13, density 5) |

Nothing was red, so nothing needed re-running for a machine-or-app verdict. The 295 skipped are by
design: the ruler fixtures run at one viewport and density at 1280 × 800 only; a hand skips the
keyboard and desk-only cases. Between the two full runs, the touched flow specs were run alone at
six viewports: `sheet`, `home`, `entry` and `data` — 246 passed and 3 failed (fix 1's new
assertion at 834, 1280 and 1440, against a first cut that read the gutter off a probe, which a
headless browser reports as 0); then the sheet alone, 95 passed and 3 failed (a second cut that took
the gutter off the whole width and so dropped the tablet's Model Code column, which three tablet
flows caught); then 98 of 98.

**The rulers on the final tree** (the second full run; the first read the same on every route, but for
one text node fewer on the sheet at 1280 — 301 against 302 — where the spine gave back 15 px):

| register | density at 1280 × 800 |
| --- | --- |
| the sheet (Highfield) | 20 records in view · 28 px pitch · 596 px less 28 px of band head → **holds 20 of 18** |
| the sheet's pairings (Highfield × Yamaha, × NSM Custom Trailers) | 20 in view each · **holds 21** |
| Data | 18 in view · 514 px → **18 of 18** |
| Customers, the book | 1 record · 630 px → **22 of 18**; **19 of 18** with the four desk groups standing |
| History | 1 line · 654 px less 61 px for Today → **21 of 18**; **18 of 18** three days deep |
| Quotes | 1 record · 611 px less 72 px of band heads → **19 of 18** |

Contrast: **0 below threshold on all fourteen routes at all six viewports** (the sheet measured 83 ·
127 · 221 · 301 · 297 · 300 text nodes from phone to wide; Data 206 · 113 · 113 · 158 · 235 · 242).
Cut: **0 cut anywhere**; elided with an ellipsis, the sheet 1 · 18 · 34 · 33 · 33 · 33, Data 1 · 1 ·
1 · 19 · 11 · 5, the Pictures door 1 at each size, every other route 0. Overlap at 1440: **0
overlapping on all fourteen routes** — but on the sheet it compared 39 runs and set 274 aside as
positioned layers, so its evidence there is still thin.

---

## What driving it found that the gate did not, and what was done

1. **The price list scrolled sideways at every desk but the widest.** At 834, 844, 1280 and 1440
   the grid under the price list carried a horizontal scrollbar: the columns and the spine were
   chosen against the sheet body's box, and the list keeps a stable scrollbar gutter, so the content
   was 15 px wider than the list's inside (1,376 px in 1,361 at 1440, 1,216 in 1,201 at 1280, 786 in
   771 at 834). `useWidth` in `Sheet.tsx` now reads the list's own gutter off `.sh-grid` and the
   spine — which takes what the columns leave — gives it back; the columns are still chosen from the
   box. Two first cuts failed and were corrected before the final gate: a probe for the scrollbar
   reads 0 in a headless browser while the list still keeps its 15 px gutter, and taking the gutter
   off the whole width dropped Model Code at 834. Pinned: `sheet.spec` "fits the window it is drawn
   at…" now asserts the price list's grid never scrolls sideways, at six sizes; without the gutter
   given back it fails at 834, 1280 and 1440. Measured after: 0 px of
   sideways scroll in the price list at 834, 844, 1280, 1440 and 1920 and on the Highfield × Yamaha
   pairing at 1280; Every column still runs off sideways by design (3,703 px at 1440).
2. **Home's search field did nothing on Enter** (critique of M2's close #12, open until now). Type
   `SP560`, it said "35 lines carry that word" — and Enter left the page as it was. The shell now
   lends its finder through the scope seat (`useLendFinder` / `useFinder` in
   `src/screens/shell/scope.tsx`), and Enter opens the finder with the words typed, scoped "The desk",
   answering them as Ctrl K does: `SP560` → the SP560, "15 versions, $41,340 – $48,350, Choose the
   version", then its Dealer Fit packages and parts. The helper says "Enter opens them in the
   finder" to a keyboard and "Search, on the keyboard, opens them in the finder" to a finger; the
   `?` sheet lists the key. Pinned: a component case (Enter hands `crossfire` over; a one-letter word
   is not handed over) and `home.spec` at six sizes (the finder opens with the words, answers, and
   Escape leaves the field as it was).
3. **The first screen anyone sees still spoke the image ledger and the database** (M2-close critique
   #21, and #4's words): "Stacer · 91 rows in the file", "one of those rows", "53 tables · 15,691
   rows · 28 of them say what fits what", and "Held photograph 1,771 × 1,183, drawn here at 1,440 ×
   962, never enlarged · stacer.com.au · in the image ledger since 16 September 2026". Entry now says
   lists and lines, as Home's masthead does, and "Photograph from stacer.com.au", as the build
   does; the held and drawn pixels moved to `data-held` / `data-drawn` on the photograph so "never
   enlarged" stays checkable. The reading steps say "Putting 53 lists and 15,691 lines into the
   app". Pinned in `Entry.test.tsx` (the ledger's words are asserted absent) and `entry.spec`.
4. **Data's spread said something false about the sheet** (M2-close critique minor #16): "The sheet
   is all 588 variants as one grid, in the file's own order". It now reads "On the sheet, all 588
   variants can be read and changed." Pinned in `Data.test.tsx` and `data.spec`.

Each has a dated line in `docs/DECISIONS.md`.

---

## The first critique's list, item by item (`built-critique-m2.md`)

| # | the finding | on this tree |
| --- | --- | --- |
| 1 | `?at=` opens row one | **Closed.** From the finder at all four sizes: `?at=boat_highfield:491&in=Sport`, the Sport chapter lit, HBS116's row lit with "Highfield - SP560 (HYP) LG-W-WB" as the record's heading; at 390 the record is the screen with "← Back to the price list". |
| 2 | No dealership on the paper | **Closed.** Page 1: NORTHSIDE MARINE · QUOTATION · 20260924-01 · Issued 24 September 2026, at all four sizes; the tab reads "Northside Marine quote 20260924-01 – Highfield - ADV7 (HYP) B-G-B". |
| 3 | The ADV7's colourways behind a hidden scroll | **Closed on a desk.** Seven chips above the refused act and its sentence ("choose a colour above first"); B-G-B makes it live and names "Black / Grey / Black". At 390 the chips sit at the fold under the tab bar and the act is below it (see still wrong). |
| 4 | History's day in an impossible order | **Closed.** `started · addressed · issued` at every size (13:06 at 1440) and after a reload. |
| 5 | Registers under eighteen at 1280 | **Closed** by the ruler (table above). |
| 6 | Three screens one composition | **Closed.** The sheet has no right-hand column; Data's press opens a full-measure spread; `/quotes` alone keeps list-left, detail-right. |
| 7 | The gate red | **Closed.** Green end to end, twice. |
| 8 | The configurator's bars overlap | **Closed.** Nothing sticks under the masthead on the ADV7 or the Stacer at three desk sizes (flow case green at six). |
| 9 | `Quotes 0` beside one filed quote | **Closed.** "Quotes — 1 filed" beside "1 quote is filed in this browser", every size, and after a reload. |
| 10 | Screens overflow their window | **Closed.** Every screen that claims to fit does, at 800, 900 and 1,080 (table below). |
| 11 | An amber act refusing at rest | **Closed.** |
| 12 | A write unfolds the sheet | **Closed.** RU230KAM shut, a Cash cell written (3,060 → 12,345) and undone, still shut after each, at 1280, 1440 and 1920; the shut line reads "▸ RU230KAM 4 variants · PVC $2,770 · HYP $4,500–$5,320 · OA Length 2.3 · Beam 1.37 · …". |
| 13 | Four ways back | **Closed.** |
| 14 | Router patterns and plan words | **Closed.** |
| 15 | `/quotes` says the file is missing while reading it | **Closed.** |
| 16 | Filing a customer contradicted | **Closed, and the idea underneath is gone:** the person a quote names is a customer at once — "1 customer · 1 quoted today", their page, their boat. |
| 17 | Mostly empty floor at a desk | **Mostly closed.** The register's room is the newest quote's cover (the ADV7 on the water, captioned, with its figure); History's fortnight is a two-week calendar of day tiles with today ringed; a customer's page draws their boat large. What is left is below. |
| 18 | Keycaps on a phone | **Closed.** 0 visible keycaps on every screen of the 390 walk, coarse pointer true throughout. |
| 19 | Data's placeholder cut at 390 | **Closed.** |
| 20 | The sheet's sentence under the tab bar | **Closed.** |
| 21 | A blank crest | **Closed.** NM on its medallion; still type, because no Northside mark is held (Milestone 4). |
| 22 | The sheet looks like a spreadsheet | **Closed at rest and on its doors:** the price list, Only the models (every line named), Pictures (pictures first, one counted sentence for the rest). Every column is still the 33-column grid, on purpose, one press away. |
| 23 | Home's wireframe empty state | **Closed** on Home and on the register ("Start the first quote with a maker", seven marks as doors). |
| 24 | A Mercury on a Yamaha quote | **Closed.** |
| 25 | "1 of them carry" | **Closed.** |
| 26 | Data's wide plate shot | **Closed.** `data-1920x1080-plate.png` is Data's spread. |
| 27 | `NO_CONFIGURATOR` alive | **Closed.** |

## The second critique's list (`built-critique-m2-close.md`)

| # | the finding | on this tree |
| --- | --- | --- |
| B1 | A shut model has no name | **Closed.** Every shut line names its model beside its figure and what it shares; Only the models on Sport is sixteen named lines, SP300 to SP900. |
| B2 | Filing a customer turns them into something Northside sells | **Closed.** After the sale the pill reads `Customers 1 · Data 53`, Home still counts 53 lists and 15,691 lines, and `/quotes` and History say 53 tables. |
| 3 | The picker is a database report | **Closed.** The door into every sale is seven makers' cards, each its own mark over a photograph of one of its boats, "39 models · from $23,950"; a maker is its boats as cards by series; a boat is its plate. "289 models from 7 makers, at Cash prices." |
| 4 | Database words on the sale screens | **Closed on the sale** (build, cascade, picker — held by a guard); **Entry closed by this pass.** Still on the register's panel, History's teaching state and the paper's side panel (still wrong, 2). |
| 5 | Blue and white was the brief | **Closed.** Every screen but the door rests on the day: pale blue ground, white paper, the file's blue for the pill, the picker's band and the lit chapter; amber is the act. The door is a photograph under its veil. |
| 6 | Empty floor at a desk | **Mostly closed** (see #17 above). |
| 7 | A quoted customer is "Nobody" | **Closed.** |
| 8 | Ctrl K sends a boat to the database | **Closed.** A version found is "Start a quote"; a model of many versions is "Choose the version"; `HBS126` finds the SP560 (HYP) B-B-B first; `trailer for sp560` and `yamaha f90` are answered (flow cases green at six sizes). |
| 9 | The Pictures door is a wall of refusals | **Closed.** Sport: five picture cards, then "Without a picture · 11", one counted sentence and a list of names with their figures. |
| 10 | The spine cuts what it exists to say | **Closed.** Whole facts, "+n more" where a block has no room (flow case green at six sizes). |
| 11 | Home's photograph is a boat the build says has none | **Closed.** Quote the 519 Sea Ranger SDF from Home: the same photograph on the picker's plate and the build's stage, captioned "This quote: Centre Console, with the Yamaha - F90LB from 02 Motor." |
| 12 | Home's search field does not search | **Closed by this pass** (fix 2). |
| 13–23 | minors | 13, 14, 15, 17, 19, 20, 21 (on the sale and now on Entry), 22 **closed**; 16 **closed by this pass**; 18 (Home's makers' marks do nothing) **open**; 23 (favicon 404, WCAG 2.1.4) **open**. |

---

## Screen by screen

Fit is `scrollHeight / innerHeight` read by the walk; "—" and a figure is a page that scrolls on
purpose. Sideways scroll was 0 on every screen at every size. Keycaps were 0 at 390 everywhere.

### Entry (`/sign-in`)

**Changed:** this pass — lists and lines, "Photograph from stacer.com.au", the pixels as data on the
photograph.
- **1280 / 1440 / 1920:** 800/800, 900/900, 1,080/1,080. The Stacer 481 at dusk under its veil, the
  NORTHSIDE / MARINE pennant, one field, the blue door ("53 lists · 15,691 lines · 28 of them say
  what fits what") and the veiled one. The blue door reads the file and lands on Home in 1.8–3.5 s.
- **390:** 1,180 px, scrolls on purpose; no keycap.
- **Still wrong:** the blank door still says "no tables, no rows, no fitment"; "The name is set in
  type because Northside Marine's own mark has not been added yet. Nothing stands in for it." is a
  sentence to a critic on the first screen; it is the one screen still dark, by design, because it
  is a photograph.

### Home (`/`)

**Changed this round:** blue and white; the photographs' acts are "Quote the ADV7" and "Quote the 519
Sea Ranger SDF" and open those boats; lists and lines; no stopwatch; this pass — Enter hands the
search to the finder.
- **1280 / 1440 / 1920:** 800/800, 900/900, 1,080/1,080. Two photographs as one fold, the desk and
  the amber New quote, the counted file, the makers' marks on paper, and Open drafts — after the sale
  "1 filed in all — 1 issued" over the issued card (the ADV7's photograph, R. Kelleher, $128,108).
- **390:** 2,454 px; the tab bar at the foot.
- **Still wrong:** "810 BOATS" counts lines of the boat tables — the sentence under it says a boat in
  four colours is four lines — beside the picker's "289 models" and the makers' "588 lines"; the
  makers' marks are not doors (Data's are).

### The shell (every address but `/sign-in`)

**Changed this round:** the finder's boats are sold from it ("Start a quote", "Choose the version"),
codes are read, "trailer for sp560" is a question it answers, its lines are a price list; the
Customers door counts everyone Customers does; this pass — it lends itself to Home's field.
- **Desk sizes:** `NM · Home · Quotes 0 · Customers · Data 53 · History · ⌕ Find Ctrl K`, then
  `Quotes 1 · Customers 1 · Data 53` after the sale, and `Quotes 2` once the Stacer draft stands.
- **390:** the tab bar, five words and the ⌕, no counts and no keycaps.
- **Still wrong:** nothing found on this pass.

### The picker (`/quote/new`)

**Changed this round: rebuilt as a showroom** — the makers' doors with their photographs, a maker's
boats as cards by series (a photograph where one is held, the model's name set large on the file's
blue where none is), a boat on its plate; the question on the file's blue band.
- **1280 / 1440 / 1920:** 800/800, 900/900, 1,080/1,080 at rest, with a maker, with the ADV7 and
  with a colourway chosen. The ADV7's plate: its photograph, three figures, "Colour · 7" chips,
  $105,930, and the act refused with its sentence until a colour is pressed.
- **390:** rest 1,627 px; ADV7 1,158; chosen 1,113.
- **Still wrong:** at 390 the ADV7's chips stand at the fold under the tab bar and the act below it,
  so the refusal's "above" is off screen until the plate is scrolled; the plate carries 50–60 px of
  empty paper above and below the photograph at 1920.

### The configurator (`/quote/$id`)

**Changed this round:** the dealer's words (no rows, rungs or re-rooting), "4 of 209 paired with this
hull", the hull drawn once, provenance in one line, the Stacer's photograph from Home.
- **1280 / 1440 / 1920:** 1,177 px at rest (scrolls by design), 1,162–1,179 at the finale, 1,257–1,265
  issued; the total `$128,108` in the masthead from the first paint; the Stacer 519 978–1,107.
- **390:** 2,404 px at rest, 2,493 issued; stage first, chapters stacked.
- **Still wrong:** on the issued quote the stage caption still says "with no motor yet — 02 Motor is
  where one goes on", on a quote that can no longer take one.

### The cascade (`/quote/$id/cascade`)

- **1280 / 1440 / 1920:** 1,050, 1,046 and 1,080/1,080. "Pricing at Trade changes one line.", the
  ADV7's render on its plate over the blurred photograph, −$5,297, "Price it at Trade" and "Leave it
  as it is" (which returns to the chapter it came from).
- **390:** 1,758 px.
- **Still wrong:** nothing found.

### The document (`/quote/$id/document`)

- **1280 / 1440 / 1920:** 2,537 px — two sheets of A4 at true size; NORTHSIDE MARINE, QUOTATION ·
  20260924-01, Issued 24 September 2026, the ADV7's render, its figures.
- **390:** 2,905 px; "PAGE 1 OF 2 · A4" first.
- **Still wrong:** the panel beside the paper (the dealer's, not the customer's) still speaks the
  engine: "this register carries no price column at all", "2 of the 3 lines carry that rung", "Pair
  it on the subject's own page".

### The quotes register (`/quotes`)

**Changed this round:** the room shows the newest quote's cover; an empty register offers the seven
makers as doors.
- **1280 / 1440 / 1920:** 800/800, 900/900, 1,080/1,080 empty and filed. Filed: the ADV7 on the
  water filling the room under the one row, its caption band "ISSUED · Highfield Adventure 7 on the
  water · the hull on 20260924-01 · R. Kelleher · $128,108".
- **390:** empty 1,132 px; filed 984.
- **Still wrong:** the panel still says "each figure is the sum of that document's own frozen lines"
  and "The register's three bands"; its three band tiles are mostly empty at 1920; the head says "53
  tables · 15,691 rows" where Home and Entry say lists and lines.

### Customers (`/customers`)

**Changed this round:** the person a quote names is a customer at once; dates in words; their boat
drawn large; the book's room shows the person under the cursor.
- **1280 / 1440 / 1920:** 800/800, 900/900, 1,080/1,080 empty, on R. Kelleher's page and in the book.
  Their page: the quotation's head "Prepared for R. Kelleher", four one-press acts, the yard's notes,
  written 1 · given 1 · $128,108, and their quote's render on the navy card.
- **390:** empty 949 px; their page 1,200; the book 844/844.
- **Still wrong:** at 1920 about 300 px of the left column is empty between the yard's notes and the
  totals.

### Data (`/data`)

**Changed:** this pass — the spread's sentence about the sheet.
- **1280 / 1440 / 1920:** 800/800, 900/900, 1,080/1,080 at rest and with Highfield's spread open.
- **390:** 2,662 px at rest, 2,649 with the spread.
- **Still wrong:** Data is the one screen that is meant to speak tables and rows, and does.

### The sheet (`/data/$table`)

**Changed this round:** every shut line named; the spine says every fact whole and takes the room the
columns leave; no cursor or keycap until touched; the Pictures door is pictures first; the first
chapter's padding; a record's labels keep their width; this pass — no sideways scroll in the price
list.
- **1280 / 1440 / 1920:** 800/800, 900/900, 1,080/1,080 at rest, found, shut-and-edited, Only the
  models and Pictures. The Highfield wordmark heads the page; Roll-Up's eight models with their
  figure per material; the found row lit in Sport with its record under it.
- **390:** 844/844; the list rests shut to the model, a press opens it in place (four rows, 844/844),
  a row's record is the screen.
- **Still wrong:** at 1920 the spine column beside a found row's open record is ~600 px of blank
  paper; after a found row in one chapter, pressing another chapter puts the keyboard's cursor on
  that chapter's last row, so the first arrow key scrolls to the bottom; the step line after a write
  says "Cell edit · Highfield Inflatables" and not which price changed from what to what; the head's
  "Matrix · Highfield Inflatables" and the record's Matrix line are the file's column name; the
  tablet's find placeholder is cut ("Find a model, a code or").

### History (`/history`)

**Changed this round:** the fortnight is a two-week calendar of day tiles at a desk, a dot per event in
its strand's ink, today ringed; the key says the lines' own words.
- **1280 / 1440 / 1920:** 800/800, 900/900, 1,080/1,080 empty and filed; filed: Today · 1 quote · 3
  events · 1 given $128,108, the line `13:06 · started · addressed · issued · Highfield - ADV7 (HYP)
  B-G-B · R. Kelleher · 20260924-01 · GIVEN · $128,108`, the calendar, and "Since 13:06 … 1 quote
  written · 1 given · $128,108".
- **390:** empty 994 px; filed 844/844 with the fortnight as a strip of fourteen days.
- **Still wrong:** the teaching state still says "by register and by model" and "the rung it was
  priced at".

### The dead end (any address with no screen)

- **1280 / 1440 / 1920 / 390:** 800/800, 900/900, 1,080/1,080, 844/844. NORTHSIDE MARINE, "There is
  nothing at this address.", the address typed, one amber Home, and Start a quote.
- **Still wrong:** nothing found.

---

## Still wrong, ranked by what the owner would hit first

1. **Home counts 810 "boats" that are lines**, beside the picker's 289 models and the makers' 588
   lines. The first figure on the showroom disagrees with the screen its New quote opens.
2. **Engine words left on dealer screens outside the sale**: the register's panel ("frozen lines",
   "the register's three bands"), History's teaching state ("register", "rung"), the paper's side
   panel ("register", "rung", "subject"), "53 tables · 15,691 rows" on the register's and History's
   heads, Entry's blank door ("no tables, no rows"), and "Matrix" on the sheet.
3. **The issued build's caption invites a motor it can no longer take** ("02 Motor is where one goes
   on").
4. **At 390 the ADV7's act is below the fold** and its chips half under the tab bar.
5. **Wide floor that is still floor**: the sheet's spine beside an open record at 1920, the
   register's band tiles, the customer page's left column at 1920.
6. **Home's makers' marks are not doors.**
7. **The sheet's smaller edges**: the cursor after a chapter change, the terse step line after a
   write, the tablet's cut placeholder.
8. **A 404 for `/favicon.ico` on every load**, and WCAG 2.1.4 owed on the single-letter keys.
9. **The owner has looked at none of it.**

## Evidence

Every screen was re-photographed on this tree at 1440 × 900, 1280 × 800, 1920 × 1080 and 390 × 844
under `docs/directions/<screen>/built/<screen>-<size>[-state].png`: entry (and its `-m2` names, and
`-390x844-full`), home (and `-m2`, `-390x844-full`), shell (`-pill`, `-finder`), data (rest,
`-plate`), sheet (rest, `-found`, `-edited`, `-models`, `sheet-pictures-<size>`, and
`sheet-390x844-open`), picker (rest, `-adv7`, `-chosen`, `-stacer519`), configurator (rest,
`-finale`, `-issued`, `-stacer519`), cascade, document, quotes (`-empty`, `-filed`), history
(`-empty`, `-filed`), customers (`-empty`, `-letter`, `-book`) and lost. This round's own extra sheet
shots that the width fix changed were re-taken too: `sheet-834x1112`, `sheet-844x390`,
`sheet-pairing-1280x800`, `sheet-every-column-1440x900`, `sheet-found-row-1440x900` and
`sheet-open-390x844`. The 390 shots are the phone's first window, taken with a coarse pointer;
`entry-390x844-full` and `home-390x844-full` are a tall window. Files dated before 2026-09-24
(`flow-*`, `after-*`, Entry's and Home's state shots of 2026-09-17/18) are earlier rounds' evidence
and were left as they were; they show the dark theme and old words.

**No `FAULT-*` shot exists in the tree**, so none was deleted: the first close deleted all three
(`sheet/built/FAULT-sheet-1440x900-at-opens-row-one.png`,
`document/built/FAULT-document-1440x900-unnamed-business.png`,
`picker/built/FAULT-picker-1440x900-colourway-hidden.png`) and their faults are still fixed.
