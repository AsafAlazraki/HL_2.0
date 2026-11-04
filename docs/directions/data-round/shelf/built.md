# The shelf, round 2: built (2026-11-04)

Direction **A, "One working table"** (`boards/a.html`), with the three judges' grafts:

- from C, the opening sentence ("12,609 of 15,691 lines stay exactly as they are.") with a bar in the census's four inks and its legend, in place of A's fifth tile;
- from C, "What moves on Dealer Fit Packages: 20 figures", each a chip with its count that filters the table to the lines moving it;
- from C, the triage of the doubled or halved: Keep / Leave out on each line and "1 of 25 looked at";
- from B, "Save a copy now" in the dock the moment Apply has written.

C's compare table for a line that can't be placed was not taken: the line is settled in place by radio cards that carry the same facts (Code, Supplier, the price a quote reads, where it was first read, "the Code says this one"), which keeps one model for the whole register. Marked PROVISIONAL in `docs/SCREENS.md`; the dated decision is in `docs/DECISIONS.md`.

## What was built

| Where | What |
|---|---|
| `src/domain/io/changeSet.ts` (new) | The plan as one table: every line in workbook order (a line that can't be placed where it stands), every figure that moves named old → new, Northside's own marked (`isOwnFigure`: the app's cost rule, widened for Dealer Fit's GP, MU, Tot Parts CTD, Act CTD and Labour CTD), namesakes told apart by their group ("Primary Accessory Code"), a count per figure per list, suppliers with case ignored ("Yam" and "YAM" are one), the lines that share a name with what placing on each would change (the engine's own `mergeLines` against that one line) and the one the workbook's Code names. Narrowing (`narrowed`), the choices (`tally`, `placeRefusal`, `placeSuggested`) and **one batch with one inverse from what is kept** (`chosenCommand`). The quotes being written whose lines a kept change would move (`draftsMoved`). |
| `src/domain/io/brought.ts` (new) | The account of every workbook brought in on this computer: read, applied (and how many), put back, cleared; what is on the price list since it came with the app. Kept as one pref, `shelf.brought`. |
| `src/domain/io/beside.ts` (new) | A copy set beside this computer: its price list line by line (alike, different, here only, copy only) and its quotes split into new here and already here. |
| `src/screens/shelf/Changes.tsx` | The change sheet, redrawn. |
| `src/screens/shelf/Shelf.tsx` | The rest page, deepened; the visit (workbook, choices, what was looked at, the Apply whose Undo is next) outlives a walk away; a reload says what it forgot. |
| `src/screens/shelf/Pages.tsx` | Bring back drawn as this computer beside the copy. Clear writes "cleared" to the account. |
| `src/screens/shelf/Paste.tsx`, `pasted.ts` | The workbook's own headings; the name column found by its names; "your heading → what it becomes" with a select on every pasted heading. |
| `src/screens/shelf/read.ts` | `dollars` fixed ($242.10); `figureSaid`, `shareMoved`. |
| `src/screens/shelf/media.ts`, `shelf.css` | The width hook for table or cards; the stylesheet with its reflow written in its header. |
| `src/routes/shelf.tsx` | The narrowing as search params (`list`, `who`, `way`, `twice`, `q`, `fig`, written with replace) and two new `see` words, `unread` and `uncopied`. |
| `e2e/flows/shelf-shots.spec.ts` (new) | Every state at every size on Northside's own workbook, measured as shot. Runs only with `HL2_SHELF_SHOTS` and only where the workbook is. |

## Measured on Northside's Parts Module (2).xlsx (39.8 MB), in the built app

Six sizes, `HL2_PREVIEW_PORT=6292`, the last run after the last change to the screen:

| | 390×844 | 844×390 | 834×1112 | 1280×800 | 1440×900 | 1920×1080 |
|---|---|---|---|---|---|---|
| read and planned, file chosen → "is read" (ms) | 2,954 | 3,072 | 2,481 | 2,102 | 2,910 | 2,375 |
| Apply 3,918, press → "are on the price list" (ms) | 1,761 | 2,036 | 1,625 | 1,965 | 1,740 | 2,206 |

At every size, in each of the 17 states shot (`after/<state>--<size>.png`): sideways scroll 0, text under 12px 0, a control under 24px 0, text cut by its own box 0, Apply out of the window 0 (on every change-sheet state), page errors 0.

The census the screen prints, which `changeSet.test.ts` holds to the workbook where it is on this computer: 3,082 change, 817 new, 61 can't be placed, 47 of them named by their own Code, 25 doubled or halved, 12,609 of 15,691 unmoved; Dealer Fit 1,625 changes each with every figure named; IBC 58 lines, all lower at Sell; placing the 47 adds 20 changes (132 figures).

### Jobs

- **A1** bring in the .xlsx: done (times above).
- **A2** see what moves before anything is written: the sentence, the bar and its legend, and the account's "Read, not applied".
- **A3** the price that jumped: one press on "doubled or halved", sorted furthest first, Keep / Leave out on each, "N of 25 looked at".
- **A4** one list in full: list → its figures counted as chips; every line names every figure. Dealer Fit at 1440 shows MU, GP, Parts Sell, Act Sell, CTD, Tot Parts CTD, Act CTD as columns (7 from 1,400px, 9 from 1,800px, 5 below), the rest named in the line ("Primary Accessory CTD $223.65 → $202.36").
- **A5** one product or supplier: find by name, code, supplier or category; supplier IBC in two presses; by a supplier the lines fall into the workbook's categories ("TUBE COVERS - To suit Highfield Boats · 58 lines · all 58 lower at Sell").
- **A6** the 61: one press on the tile (was 57 presses and 16 s); "Place the 47 the Code names" in one more; each of the 14 settled by its radios; a line already written by another is refused in a sentence on its radio.
- **A7** Apply and Undo as one step: done from the dock and from Files brought in; a given quote's printed text unchanged (`shelf.spec.ts`).
- **A8** apply part, holding back the Dee Shackle: one tick or Leave out; "3,918 of 3,919 changes in · 1 left out: Dee Shackle (Forged) w Captive Bolt 6 mm · S/S 316G".
- **A9** paste with "Parts & Accessories Module": read as the Product by its names ("1 of 1 pasted lines name a line on Parts & Accessories"); every heading can be pointed elsewhere.
- **A10** a wrong file at either door: the sentences kept.
- **A11** which price list and what came before: "The price list of 16 September 2026 · 53 lists · 15,691 lines · fingerprint a22d3e1051af · no workbook applied since"; after Apply "1 workbook applied since, the last today at 3:40 pm"; the account survives a reload.
- **A12** clear: its page kept, and the clear written to the account.
- **S1–S2** kept; Save a copy is the one amber act at the head, and after Apply it says "3,918 changes are on the price list that no copy holds yet".
- **S3** bring back: this computer beside the copy kind by kind, the price list line by line, the copy's quotes "new here" or "already here"; no more "joins them".
- **S4** kept.
- **Salesperson**: "No quote is being written on this computer, so no workbook would move one", or each draft by reference with the lines a kept change moves and the sum. What the screen says is what the code does: a quote's line keeps the price it had when it was chosen (`freeze.ts`); the judge's "drafts read the live price list" is not so, and the screen does not say it.

### The judge's gaps

| Gap | Now |
|---|---|
| Dealer Fit "9 figures · and 9 other figures" | every figure named, columns and line |
| Parts "4 figures · and 4 other figures" | the same |
| the 61 after 2,250 lines, 129,526 px down | in workbook order, one press away; the page with every line is 148,553 px at 1440 but nothing needs scrolling to reach |
| Apply 6,697 px down | pinned in view at every size, measured on every state |
| "$242.1" | "$242.10" (`read.test.ts`) |
| paste refused | read by its names; pointable |
| restore "joins them", prose zeros | the table and the split |
| rest page mark and lede; 844×390 filled by head and band; 976 px column at 1920 | the date leads; the column holds 1,280px with the account using it |
| "file." orphan | the save is one act at the head |
| "more than double or fall below half" (rule ≥ 2) | "doubled or more, or fell to half or less" |
| the share bar without a legend | four inks with a legend |
| 28px controls at 390 | the kit's small buttons gone from the screen; no control under 24px measured at any size |

## Tests

New: `src/domain/io/changeSet.test.ts` (12, of which one reads the real workbook when it is here), `brought.test.ts` (3), `beside.test.ts` (3); `read.test.ts` +4 (the workbook's heading, pointing, dollars, figures).

Rewritten to the new truth, each named:

- `Shelf.test.tsx` "says which price list this computer holds…" (was "counts Northside's work…": the h1 is the price list's date, not "…work, kept safe.", and there is no blue band);
- `Shelf.test.tsx` "shows the change before it is written…" (the h1 is the file; the sentence is an h2; Undo said as "it" for one; the account's "Read, not applied", "Applied: 1", "Put back by Undo");
- `Shelf.test.tsx` "leaves a line out by its tick and writes the rest as one step" (new);
- `e2e/flows/shelf.spec.ts` the first walk (the account in place of the band, the change tile as a filter, the line's place said as "Boat Module, line N", the list sentence and "See the N" gone) and the second (`/^No copy saved yet/`, "1 quote comes here new").

Gates run: prettier; oxlint at zero over src, tools, e2e; tsc app and node; vitest over `src/screens/shelf` and the three new domain files with `newFile.test.ts`: 43 passed; `e2e/flows/shelf.spec.ts`, the shots and the rulers on `shelf` and `shelf-clear` at all six projects (results in the report). `tools/check.ts`: nothing in this round's files; it fails on the boards' `kit.css` copies under `docs/directions/data-round/{shelf,places,catalogue,data}/boards/`, which no-ui-selector-outside-ui reads (1,822), committed by the boards' round, not chased here.

## Not done, and why

- **The account is one pref, not a Dexie table**: forgotten with everything else, not carried by a copy. DECISIONS names it.
- **The applied plan is in memory**: after a reload the change sheet is gone (said where it was), the account says what was applied.
- **At 844×390 the dock drops its Undo sentence** to stay one line; the sentence is in Files brought in.
- **`isCostColumn` is not widened for the whole app**: the shelf widens it locally. Whether Dealer Fit's GP, MU and the CTDs reach a customer surface elsewhere is outside this screen and is worth its own look.
- **A line's own boat or maker mark** is not drawn on the lines; the list head names the list.
