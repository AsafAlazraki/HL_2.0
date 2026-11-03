# Data, built — data round, 2026-11-03

Direction A, "The Monday list" (`boards/a.html`), with two grafts from C (`boards/c.html`): the matrix of the 28 lists of what fits, and the answer to a find drawn where the find is. Built in `src/screens/data/` with its own styles. It is **provisional until the owner picks by eye** (`docs/SCREENS.md`, "The data round"). The decision is in `docs/DECISIONS.md` (2026-11-03), and it names B and C as the directions that lost.

Every figure below was measured on the built app through the real door (`throughTheDoor`, then the Master Price File loaded), at all six sizes, from `e2e/out/dist-6232`. Screenshots of every state at every size are in `after/` (102 files, named `<size>-<nn>-<state>.png`). The server was stopped before this was written.

## What the screen is now

1. **The head** says which price list it is and how big: "The price list of 16 September 2026 · 53 lists · 15,691 lines". It says how current the prices are, from the headings' own words: "Prices dated in their own headings from 19 May 2022 to 5 August 2026 · Last change on this computer: none yet". One find covers the whole file.
2. **Needs Northside** is a checklist with 5 open items and 1 done. Each item has a figure, what it is out of, and a door:
   - 37 cases to settle, on 69 of 15,691 lines. The door is *Settle them*, to Review.
   - 4 price answers, covering 2,725 of 15,691 lines. The door is *Choose*, to Prices at the largest answer.
   - 25 sections dated in their heading, of the 222 headings in the 5 lists that date any, with a by-year strip. The door is *Oldest first*, which opens Rigging Kits on the sheet at "RIGGING KITS - Jeanneau DB/43 OB (as at 19/5/2022)".
   - 311 lines in 4 of the 18 lists you sell from that no list of what fits names. The door is *Largest first*, to Mackay's spread.
   - 3 rules noticed and not written, with 0 written by Northside. The door is *Read them*, to Rules.
   - Done, with a tick: 53 lists of 53 on this computer.
3. **New since 16 September 2026** shows "0 lines changed on this computer, of 15,691". It then lists the lists changed (each opens its sheet), the lists made here (each opens its spread), and Shelf's two doors.
4. **The six rooms** are counted doors, in the order `PRICE_LIST_ROOMS` gives them:
   - Rules: 7 kept by the price list, with 0 written and 3 noticed.
   - Fitment: 289 models, from 7 makers, in 28 lists of what fits.
   - Catalogue: 2,238 parts on sale, in 18 aisles, 197 pictured.
   - Review: 37 to settle, then 138 to tidy.
   - Prices: 4 to choose, with 10 settled by the price list.
   - Shelf: "No copy saved yet".
5. **What the price list holds** comes last:
   - Eight maker tiles, each with its mark drawn once. The eighth is *Every maker* (289 models · 810 lines, and 28 lists · 8,679 lines), and it opens Fitment.
   - The 18 lists you sell from, as a ledger. A row says what stands on it ("19 to settle · 11 dated headings").
   - The 28 lists of what fits, as one table of maker × kind (Motors · Trailers · Packages · Accessories, then Lines). On a phone it becomes one card per maker.
6. **A spread** opens under the tiles. The mark is not drawn a second time for a maker. Every heading opens the sheet at that heading (`/data/<list>?in=<heading>`), and a dated heading carries an ochre dot. A long lineup draws 12 headings, and one press draws the rest: Parts shows all 187. A maker's Fitment door is "Choose its model on Fitment" (`/fitment?maker=Highfield`).

## The pure readers added under `src/domain`, each with its tests

- `catalogue/asAt.ts`: the date each heading states in its own words, read as d/m/yy, d.m.yy or d-m-yyyy. Nothing that is not a calendar day is read. On the pack: 25 sections, 5 lists, 222 headings in them, 462 lines. Oldest 2022-05-19, newest 2026-08-05.
- `catalogue/changed.ts`: lines written after `packedAt`, by list. On the pack: 0.
- `catalogue/fileFind.ts`: one find over makers, lists, sections and lines, using text cells only (no numbers, references, source cells or engine keys). F115 gives 306 lines in 12 lists, "Highfield" gives 1 maker, and "KAM" gives 100 lines. 4.7 ms a find, measured in node.
- `modules/fitsMatrix.ts`: the 28 lists as maker × kind, columns in the order a boat is built.
- `rules/review/byList.ts`: Review's cases by the list each one is on.

## The judge's jobs, each walked

| Job | Now |
|---|---|
| J1 which list, how big, how current | Head: the date, 53 · 15,691, and the as-at span. The date no longer wraps mid-phrase (`.dt-nw`). |
| J2 grouped holdings | 7 makers, 18 lists in their groups, and 28 lists of what fits as a table with every count. |
| J3 open Highfield | The spread opens under the lit tile. The mark is drawn once. All 7 series can be pressed, and they add to 588. Where from: Boat Module (5).xlsx. |
| J4 open a list to change it | Row, then spread, then *Open the list*, or Enter on a row. A heading opens the sheet at that heading. |
| J5 find | Highfield finds 1 maker and the tiles narrow to 1, so the false sentence is gone. F115: "306 lines hold “F115”, in 12 lists", each list opens narrowed (`?find=F115`). Nothing: "Nothing on the price list holds “zzqqxx”: no maker, list, section or line." |
| J6 what needs me | The checklist above. |
| J7 what is new | New since, with the zero as a figure. |
| J8 make and undo | An empty name is refused at the field: "A list needs a name." Nothing is made. The made spread says "0 lines". Undo stands over the spread it opened and turns to Put it back. |
| J9 prices, own page, Fitment | Prices at the maker, the maker's own page, and Fitment's chooser at the maker. |
| J10 F115 at the desk | The answer says the bar's Find puts a line on a quote and links the Catalogue. |
| J11 no file | The three answers and the door, unchanged. |
| J12 a list no longer sold | Its spread fits: sideways 0 px at 390. Its own-page button wraps. |

## The judge's gaps, each measured closed

- **390 OBSOLETE sideways:** scrollWidth equals the window width in all 72 measured states (12 states × 6 sizes), including `/data?at=trl_obsolete` at 390. It is guarded by data.spec ("nothing scrolls sideways…") at six sizes and by a new ruler route, `data-obsolete`.
- **Empty name makes "Custom table":** it is now refused at the field, at six sizes (data.spec, and `Data.test.tsx`).
- **The find denies a maker on screen:** fixed. See J5.
- **390, 0 of 18 in the first window:** the first window holds the head, the find and the first four needs. With nothing scrolled it ends on a seam between two needs (`useFoldAir`; data.spec "in a hand…", `acrossTheBar` = []). A spread opens under the tiles and is scrolled to.
- **844×390, the spread under the bar:** the spread's top is at 84 px against a bar at 8–52 (Highfield, Parts, Yamaha, OBSOLETE, join, made). Guarded by data.spec "a spread opens where it can be seen".
- **1920, 22 % empty floor:** the state fills the window. Needs and the column run 7:5, the rooms are 2×3, and the eight makers stand whole in the first window, ending at about y 992 of 1080 in `1920x1080-01-arrive.png`, with the two ledgers' heads under them.
- **Text under 12 px:** 0 nodes in all 72 measured states (it was 42–79).

## Tests rewritten to the new truth, each named

- `src/screens/data/Data.test.tsx`: rewritten (39 tests). The plates' `.dt-plate__*` shape, the "Goes with" chips, "fits no boat yet", "Every line of it, to read and change.", the head's rooms nav "Behind the price list", the find's "Find a list" and "lists match", and "What fits the <first boat>" are all gone, replaced by the needs, new since, counted rooms, tiles, ledger, matrix, whole-file find, refusal of an empty name and Fitment's chooser.
- `e2e/flows/data.spec.ts`: rewritten (17 tests). Removed:
  - "fits the window at rest and with a maker open — rule (d)". The page is now a scrolling foundation, by direction.
  - "the shelf ends on a seam between two plates". It is now "the first window ends on a seam".
  - The room nav name.
  - "What fits the" / `?boat=`. It is now `?maker=`.
- `e2e/routes.ts`: `data` moved from `cockpit` (18 rows at 1280×800, the density ruler) to `foundation`, because the direction puts the state above the 18 lists. The 18 are still asserted as rows by data.spec. Added the `data-find` and `data-obsolete` routes. `data-stacer` now waits on `data-rested` (the arrival's scroll made).
- `src/screens/data/lineup.test.ts`: unchanged and passing.

## Gate, measured 2026-11-03

- prettier: clean on every file touched.
- oxlint `--max-warnings 0 src tools e2e`: 0 in my files. Other agents' half-finished catalogue work fails it: `src/screens/catalogue/Door.tsx`, `Step.tsx` and `ByCode.tsx`.
- `tsc -p tsconfig.node.json`: clean. `tsc -p tsconfig.app.json`: 0 in my files. The errors are in another agent's `src/domain/chandlery/prices.ts`, `src/screens/catalogue/Chandlery.tsx` and `Wares.tsx`.
- vitest, my paths: 6 files, 58 tests passed.
- `tools/check.ts`: 0 failures in my files. 589 elsewhere, almost all `no-ui-selector-outside-ui`, in the boards' compiled `kit.css` copies under `docs/directions/data-round/*/boards/` and in catalogue work in progress.
- Playwright with `HL2_PREVIEW_PORT=6232`, `e2e/flows/data.spec.ts` plus every ruler on the `data*` routes, on all six projects: 189 passed, 0 failed, 75 skipped (size-gated). Other screens' specs that walk Data (places, review's door, pack-loads, home's made list, shell's scrolled register) at laptop and phone: 14 passed.
