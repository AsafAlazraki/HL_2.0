# Milestone 2's second close, judged cold

Independent critique, 2026-09-24. Read-only: this file is the only thing written in the repository.

**What was read.** `docs/directions/built-critique-m2.md` whole (the specification), `docs/directions/built-m2-close-2.md`
whole, `docs/directions/built-critique-m2-close.md` whole, `docs/STATUS.md`'s top section, `docs/SCREENS.md` whole. Every
current shot under `docs/directions/*/built/` for the thirteen screens at 1440, and the 1280, 1920, 390, 834 × 1112 and
844 × 390 shots of the sheet, picker, quotes, history, customers and data. Source where a still cannot prove a thing:
`src/ui/button.css`, `src/ui/refusal.css`, `src/screens/configurator/{Configurator.tsx,say.ts}`,
`src/domain/quote/{commands.ts,cascade.ts,colourway.ts}`, `src/screens/cascade/{Cascade.tsx,proposal.ts}`,
`src/screens/document/paper.ts`, `src/screens/quotes/Panel.tsx`, `src/screens/history/History.tsx`,
`src/screens/home/{Home.tsx,holdings.ts}`, `src/screens/sheet/{Grid.tsx,sheet.css}`, `src/screens/picker/picker.css`,
`index.html`.

**What was measured here, rather than inherited.**

- `npx tsx tools/check.ts` on this tree: **14 rules, no failures.** `npm test` and `npm run e2e` were not re-run.
- `dist/` (13:15, no source file newer) served by `vite preview` on port 5711 and driven by Playwright, each walk a fresh
  profile through the real door (the blue door reached Home in 1.9 s). The whole sale — the ADV7 in B-G-B, a Yamaha
  F250XCB added, addressed to R. Kelleher, given, printed — at 1440 × 900; the same walk at 1280 × 800, 1920 × 1080 and
  390 × 844 (touch, coarse pointer), probing fit, sideways scroll, visible keycaps and type under 11px on sixteen
  states each; the picker and the sheet at 834 × 1112 and 844 × 390 under touch; a contrast probe over every visible
  `.ui-refusal` on fifteen states.
- Fit: every desk route 800/800, 900/900, 1,080/1,080 but the build, the cascade at 1280 and the paper, which scroll by
  design. Sideways scroll 0 everywhere. Keycaps 0 at 390. No text under 11px. No page error.

---

## The first critique's 27, item by item

| # | finding | verdict | evidence on this tree |
|---|---|---|---|
| 1 | `?at=` opens row one | **CLOSED** | `?at=boat_highfield:491&in=Sport` held its address and lit HBS116 with its record (`sheet-1440x900-found.png`, and driven). |
| 2 | No dealership on the paper | **CLOSED** | Page 1: NORTHSIDE MARINE · QUOTATION · 20260924-01, driven at four sizes. |
| 3 | ADV7 colourways behind a hidden scroll | **CLOSED at the desk, OPEN elsewhere** | At 1280/1440/1920 the seven chips stand above the act. At 390 the act is at y = 951 in an 844 window with the chips under the tab bar; at 834 × 1112 and 844 × 390 the whole plate is off screen after the press (new blocker 2). |
| 4 | History's day in an impossible order | **CLOSED** | `started · addressed · issued`, and `started · 1 pick · addressed · issued` with a motor. |
| 5 | Registers under 18 at 1280 | **CLOSED** | The ruler's reading; not re-measured here. |
| 6 | Three screens one composition | **CLOSED** | Only `/quotes` is list-left, detail-right. |
| 7 | The gate red | **CLOSED** for the guard (14 rules, measured here); the other two gates are the verifier's. |
| 8 | Configurator bars overlap | **CLOSED** | No overlap at three desk sizes. |
| 9 | `Quotes 0` beside one quote | **CLOSED** | `Quotes 1` beside "1 quote is filed". |
| 10 | Screens overflow their window | **CLOSED** | See measurements above. |
| 11 | Amber act refusing at rest | **CLOSED at rest** | But the sentence a refused act carries is now invisible (new blocker 1), and the picker's plate for any many-colour model still rests on a refused amber act (minor 21). |
| 12 | A write unfolds the sheet | **CLOSED** | `sheet-1440x900-edited.png`: RU230KAM stays shut. |
| 13 | Four ways back | **CLOSED** | |
| 14 | Router patterns and plan words | **CLOSED for those words** | A promise of an unbuilt act replaced them (major 4). |
| 15 | `/quotes` says the file is missing while reading it | **CLOSED** | `Quotes.tsx:665` says "Looking for a price file…"; not re-driven. |
| 16 | Filing a customer contradicted | **CLOSED** | The quoted person is a customer at once. |
| 17 | Mostly empty floor at a desk | **OPEN** | Major 10. |
| 18 | Keycaps on a phone | **CLOSED** | 0 at 390. The desk carries 17–25 per register instead (major 11). |
| 19 | Data's placeholder cut at 390 | **CLOSED** | |
| 20 | The sheet's sentence under the tab bar | **CLOSED** | |
| 21 | Blank crest | **CLOSED** | NM medallion. A direct load of the paper shows the helm and `Data` with no count (minor 17). His own mark is still nowhere (major 12). |
| 22 | The sheet looks like a spreadsheet | **OPEN** | Major 7. |
| 23 | Home's wireframe empty state | **CLOSED** | |
| 24 | A Mercury on a Yamaha quote | **CLOSED** | The caption names the maker's rig and this quote's motor. |
| 25 | "1 of them carry" | **CLOSED** | |
| 26 | Data's wide plate shot was the sheet | **CLOSED** | `data-1920x1080-plate.png` is Data's spread. |
| 27 | `NO_CONFIGURATOR` alive | **CLOSED** | Comments only. |

Twenty-three closed, two open (#17, #22), two closed at the desk and open at another size or state (#3, #11).

---

## Does the sheet still feel like a database?

**Yes.** It is the best-typeset it has been, and it is still a data grid. At 1440 the resting sheet is 32 variants in five
columns of numbers under a column header that advertises `26 more ▸`. The variant is a code (`WH`, `LG-W-WB`,
`DG-G-MB`) that nobody reads aloud. Each model block is seven to ten spec facts at 12px ("Boat Rego Decals Rego Letters
Not Required"). One of eight Roll-Up models has a picture. The head prints `Matrix · Highfield Inflatables`,
`Base Freight cost $0` and "33 columns, 5 of them cost". The record under a found row is a key-value list: `Matrix`,
`Tube Dia. cm`, `Deadrise °`. `Every column` is still the 33-column grid with `〃` ditto marks and "held as a link".
The domain can already say "Black / Grey / Black" (`src/domain/quote/colourway.ts`), but the sheet prints `B-G-B`.
"The tables — still too complicated and hard to use visually" still describes it.

---

## Blockers

### 1. The sentence under a refused act is 1.23:1, so the sale's one refusal cannot be read

Open the finale on any quote that has no name yet. Under the amber `Give it to the customer` the reason reads "This quote is
addressed to nobody. It cannot be given to a customer until it has a name." The measured colour is rgb(221,233,243) on
white, **1.23:1**. Open an issued quote's peek on `/quotes` and the sentence under `Discard this quote` ("This quote has
been given to the customer, so it stays…") is the same, 1.23:1.

The cause is `src/ui/button.css:215–227`, which inks `.ui-refusal` inside a `door`, `veiled` or `act` frame with
`--color-neutral-100`. That was written for the dark room ("neutral-100 on the ground measures 14.95:1"). On 2026-09-24
the day became the default and the rule was not turned. The contrast ruler reads resting routes only, which is why it reports "0
below threshold" while the one sentence that says why a sale cannot close is invisible. The effect is a silently disabled
control on the screen where the sale happens.

### 2. On a tablet, pressing a boat appears to do nothing

At 834 × 1112 and 844 × 390 with touch, open Highfield, scroll to Adventure and press ADV7. The card gains a ring, and nothing else
in the window changes. The plate with the photograph, colours, price and `Start the quote` is drawn `position: static` at the top
of the page: measured at 199 px of a 7,127 px document while the press happened at scrollY 5,983 (6,819 at 844 × 390).
The right half of the window beside the pressed card is empty paper. `picker.spec`'s "the act is on the screen" case
calls `scrollIntoViewIfNeeded()` for these sizes, so the test does the scroll a dealer beside a hull never would.
`docs/SCREENS.md` and CLAUDE.md both name 834 as a size every board must hold.

### 3. The cascade tells the dealer "Standard" for a line the customer's paper calls unpriced

`src/domain/quote/cascade.ts:349` sets `standard: row.to === null && row.why === 'no price column on this table'`. The file
carries no "standard" fact; the word is inferred from a missing column. On the ADV7 the DEC rigging kit then reads:

- **The cascade:** `Standard` in its figure column, under its own card heading "the price file gives it no price of its own".
- **The build:** "Not priced yet".
- **The finale:** counts it in "Carrying no price 1".
- **The customer's paper, page 2:** "Not priced on this quote", and under the total "One item is not priced on this quote
  and is not in this total".

A dealer who reads the cascade tells the customer the kit is standard, while the paper in the customer's hand says it is an
extra that has not been priced yet. The word is an invented fact, and it contradicts the one object that leaves the building.

---

## Major

### 1. Home's first figure says 810 boats; the picker it opens says 289 models

`WHAT NORTHSIDE MARINE SELLS · 810 BOATS`, followed by a sentence explaining that the figure is not boats ("a boat listed in four
colours is four lines, not four boats on the floor"). One click on New quote: "289 models from 7 makers". The makers'
plates beside it say `588 lines`. The verifier ranks it first and it is still there.

### 2. An Undo that can never work sits on every freshly issued quote

After `Give it to the customer` the build pins "20260924-01 is issued · **Undo**" (`Configurator.tsx:462–466`). `issue`
returns `inverse: NO_WAY_BACK` (`commands.ts:1383`). Pressing it raises a banner that says "nothing can go back on it".
That is the third copy of that sentence on one screen: it already stands under PRICED AT and in the finale. The screen offers an
act and refuses it in the same place.

### 3. Engine words still on dealer screens

Every one the verifier listed is still there, and the register's peek adds more:

- **The peek:** `RUNG cash` and "the same frozen lines" (`Panel.tsx:408`).
- **The register's panel:** "1 quote, in three bands", and "each figure is the sum of that document's own frozen lines".
- **History's empty state:** "the rung it was priced at", "by register and by model", "a node on this spine".
- **The paper's side panel:** "this register carries no price column at all", "2 of the 3 lines carry that rung",
  "Pair it on the subject's own page".
- **The heads of Quotes and History:** "53 tables · 15,691 rows", where Home and Entry say lists and lines.
- **Entry:** "no tables, no rows, no fitment".
- **The sheet:** `Matrix`.
- **The build, under the headline total on every quote:** "3 lines, each at the price it was picked at · 1 of them carries
  no price at all"; the finale's statistics block reads `LINES 3 · CARRYING NO PRICE 1`.

### 4. Two empty states promise an act that does not exist

"Work is kept here — not on a server — until the file is exported" (`Panel.tsx:147`, `History.tsx:1444`). There is no
export anywhere in the app; import/export is a later milestone. This is the same fault as "arrives with the backend at
Milestone 6", in new words.

### 5. The boat's name is the file's key string, on every screen and on the customer's paper

`Highfield - ADV7 (HYP) B-G-B` appears as:

- the build's headline, twice
- the register's row
- History's line
- the customer's card
- the cascade
- 36px on page 1 of the quotation.

Page 2 prints `DEC Rigging Kit | 6x9 Binnacle | CL5 Gauge Kit | 6X6 Sng Key Switch | 16 Pin 8.0m Harness | Fuel
Filter` with the file's pipes. The specs print `OA Length 6.98` and `Beam 2.68` with no unit, beside `Tube Dia 32 cm`.

The app already knows the words. Home's caption says "Highfield Adventure 7", and the stage caption says "HYP B-G-B (Black / Grey / Black)". It
uses them on one caption and prints the key everywhere else. "All of the same functionality, presented beautifully": the
one object that leaves the building reads like an export.

### 6. The colour choice has no colour

The picker's `Colour · 7` is seven mono chips reading `B-G-B`, `B-G-LB`, `LG-W-WB`; the name appears only after a
press. The sheet's Variant column is the same codes, 588 times. `colourway.ts` decodes 483 of 604 Highfield rows
to names. "A bit more colour usage please": the one place where colour is the content, the screen shows text.

### 7. The sheet is still a data grid (#22 open)

As described in the section above. This is the owner's own sentence, on the screen he named.

### 8. On a tablet `+ variant` is painted over every open model's facts

At 834 × 1112 and 844 × 390 under touch, `sheet.css:2487–2490` shows `.sh-spine__add` permanently, and it is absolutely
positioned (`sheet.css:973`) over the spine's last line. Every open block in view reads "+3 m + variant" or "+3 mor
+ variant". At the desk, hovering a spine lays it over the render's caption: "WH · 2 of 4 varia + variant"
(overlap measured against `.sh-spine__caption`). The overlap ruler runs at 1440 at rest, and the tablet shots were taken
with a fine pointer, so neither saw it.

### 9. At 390 the ADV7's act is below the fold

`Start the quote` sits at y = 951 in an 844 window, and the colour chips sit under the tab bar. The refusal's "above" is off
screen. The verifier ranks it fourth, and it is still open.

### 10. Wide floor is still floor (#17 open)

- **History:** the fortnight is thirteen empty dashed boxes about 210 px tall, beside one tile with three 10px dots. At 1920 it
  also has about 100 px of empty band above and below it.
- **`/quotes`:** three band tiles, 140–175 px tall each, holding one digit.
- **The sheet:** about 700 px of blank spine beside a found record at 1440 and 1920.
- **A customer's page:** about 300 px of empty left column at 1920.
- **`Only the models` at 1440:** about 340 px of empty paper.

### 11. The registers teach a keyboard nobody asked for

Visible keycaps at 1280 and 1920:

| screen | keycaps |
|---|---|
| Data | 25 |
| History | 23 |
| Quotes | 19 |
| Customers | 17 |

The Quotes panel spends two paragraphs on them ("Those keys belong to the register and to nothing else: a single letter does
nothing at all unless the list itself has the focus…"). The single-letter keys T, W, M, Y, N, B, J, K, V and Q still owe
WCAG 2.1.4. "I can't stress enough how easy this system has to be to use."

### 12. The logo he asked to be the showpiece is nowhere, and three screens apologise for it

The crest is `NM` in type. Entry's second line explains why ("The name is set in type because Northside Marine's own
mark has not been added yet. Nothing stands in for it."). So does the paper's side panel ("The letterhead: Set in type, because no mark is held"), and
Home says "Stabicraft: no public wordmark verified". The app has no place for him to give it his mark. That is honest,
and it is the first thing he asked for.

---

## Minor

13. **The issued build's caption still says "with no motor yet — 02 Motor is where one goes on"** (`say.ts:321`) on a quote
    that can no longer take one.
14. **Home's makers' marks are not doors**: `img` with empty `alt` outside any link; pressing Stacer does nothing. Data's are
    doors.
15. **The sheet's step line after a write** says "Cell edit · Highfield Inflatables", not which price went from what to what.
    The tablet placeholder is still cut ("Find a model, a code or a"). The verifier's cursor-after-chapter fault was not
    re-proved here.
16. **Every tab reads "HelmLogic"** (`index.html:15`). Only the paper sets a title, so there are no per-screen titles (WCAG 2.4.2),
    and the software's name stands where Northside's should. `/favicon.ico` still returns 404.
17. **A direct load of `/quote/$id/document` shows the helm for a crest and `Data` with no count**, because the paper
    renders with no catalogue. The pill changes identity with how you arrived.
18. **Data's plate pairings reorder between visits.** Read from the file, Yamaha is first; read from this browser, Dealer Fit is
    first (`data-1440x900.png` against a reload). This was open on the first close and is still open.
19. **"Prepared by Asaf. Saved as you go — close this and come back to it any time."** stands on an issued, read-only quote.
20. **History:** "Today: every day is inside it." (`History.tsx:843`, sentence logic inline) and the fortnight does not follow
    the range. One line says `issued` in its kinds and `GIVEN` as its standing. The quotes-only-on-hidden-days count is
    derived in the screen (`History.tsx:365–374`), not in `src/domain`.
21. **The picker's plate for any many-colour model rests on a refused amber act.** The picker also labels facts with the file's headers
    (`INT LENGTH CM`, `BOAT WEIGHT KG`, `HULL LENGTH (MTR)`, `BOTTOMSIDES`), and eleven of sixteen Sport cards are pale
    tiles printing the model code large above the same code.
22. **Data's loudest act is `New register`.** It is amber at the top of the desk and the first object under the title at 390, and it opens a
    dialog that explains "Register is what it is called on this screen until it holds a kind".
23. **History's opened line at 1440:** the calendar's second row is cut by the key bar at the foot.

---

## Would he accept it on sight?

**No.** He would like the picker, which is now a showroom and the best screen in the app, and Data's plates. He would stop
at the build, where the headline is `Highfield - ADV7 (HYP) B-G-B` over "3 lines… 1 of them carries no price at all".
He would stop at the sheet, which is a better-dressed grid. Then he would hand the printed quote to someone and watch them
read "(HYP) B-G-B" and a pipe-joined rigging kit marked "Not priced on this quote", when the cascade told him it was
standard. The three blockers are hours of work, not days: one CSS rule re-inked for the day, a sticky or scrolled-to plate
on the tablet, and deleting an inference in `cascade.ts:349`. Do them first, but they are not why he says no.

**The one thing to change first: name every boat and every colour the way a person says it, everywhere.** Replace the
file's key string with the model's name, the material and the colourway in words ("Highfield Adventure 7 · Hypalon ·
Black / Grey / Black") on:

- the build
- the paper
- the register
- History
- Customers
- the cascade
- the finder.

Draw the colourway as colour on the picker's chips and on the sheet's Variant column, from the decode `colourway.ts`
already holds. Print a unit beside every measure. It is one change that reaches every screen he will open and the one
object his customer holds. It is also the most direct answer to "it still feels like a database" that the app has not
yet tried.
