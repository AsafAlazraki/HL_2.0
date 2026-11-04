# The shelf, round 2: three directions for the change sheet (2026-11-04)

The judge (`judge.md`) said **redraw** the change sheet (`/shelf?see=changes` and the paste beside it) and **deepen** the rest page. The sweep is `docs/research/refs/shelf/round-2/notes.md`. Three static boards are drawn on Northside's own `Parts Module (2).xlsx`, read through the app's own `readWorkbook` and `planNewFile` against the real pack:

| Board | File | Shots |
|---|---|---|
| A · One working table | `boards/a.html` | `boards/shots/a-1440x900.png`, `a-390x844.png` (all six sizes, plus `-full` and `a-stateN-1440/390`) |
| B · Settle, then look | `boards/b.html` | `boards/shots/b-1440x900.png`, `b-390x844.png` (all six sizes) |
| C · Columns before lines | `boards/c.html` | `boards/shots/c-1440x900.png`, `c-390x844.png` (all six sizes) |

**Recommended: A, "One working table".**

## How the figures were got

`boards/extract.facts.ts` (run by `boards/facts.config.mjs` through vitest) reads the 39.8 MB workbook and writes `boards/facts.json`. `boards/facts.mjs` derives every figure the boards print from that file. No figure is typed in by hand. The extractor reproduces the judge's census exactly:
- 3,082 change, 817 new, 61 can't be placed, 3,899 changes;
- 12,609 of 15,691 lines unmoved;
- Parts: 1,457 change, 793 new, 47 can't place, and 243 whose Sell did not move;
- Dealer Fit: 1,625 change, 24 new, 14 can't place.

Four things this round measured that the judge did not:

1. **Every moved column, counted from `CellChange`.**
   - Parts moves 11 columns: MU 1,346, Sell 1,236, Sell inc Install 1,233, CTD 1,122, Total CTD 1,119, P&A 941, Base List 890, Operation Code 283, Code 126, Product 54, Supplier 10.
   - Dealer Fit moves 20: MU 1,597, GP 1,597, Parts Sell 1,586, Act Sell 1,586, CTD 1,546, Tot Parts CTD 1,546, Act CTD 1,546, Accessory 1 Sell 585, Accessory 1 CTD 396, Code 395, and ten more on fewer than 1 line in 10.
   - Dealer Fit carries a second Code and a second CTD for its primary accessory (the workbook's "Accessory - 1", columns T to Y), so the boards name those "Accessory 1 …".
2. **The workbook's own Code settles most of the 61.**
   - For 43 of the 61, the line's Code is on exactly one of the two lines here that share its name. For 4 more, Code and Supplier together pick one. That makes **47 of 61** placed with a suggestion.
   - Each suggestion was merged through the engine's own `mergeLines` against that one line alone. 20 add a change (132 figures) and 27 already read exactly so.
   - That leaves **14 for a person**:
     - 9 whose Code is on neither line (Highfield's covers and sundecks are carried twice in the workbook, under an old code and a new one);
     - 4 that name two lines which are the same line twice (Yamaha Trailer Support, Sport - SP360 HYP);
     - 1 said twice ("Not Required").
3. **Suppliers.**
   - Parts carries 70 supplier codes once case is ignored. The file writes Yamaha's as both "Yam" (201 lines) and "YAM" (199).
   - IBC is 58 lines, all in one category ("TUBE COVERS - To suit Highfield Boats"), and all 58 are lower at Sell.
   - Dealer Fit has no supplier column.
4. **Findings for the build, not for the screen.**
   - The app's cost rule (`isCostColumn`) misses Dealer Fit's GP, Tot Parts CTD, Act CTD and Labour CTD. The boards mark those columns "Northside's own" anyway, so the build must widen the rule.
   - The pack files the second Boat Cover - SP360 line (and the console covers beside it) under the category "LOWRANCE - HDS Live". Board C's compare shows this as the pack holds it. Fixing it belongs to Review.

## The three directions

Each board shows the five things the judge asked for, at every size:
- Dealer Fit's columns, named;
- IBC, found by supplier;
- the Dee Shackle ($98 → $3), held back;
- the 61 that can't be placed, settled;
- Apply, in view.

Each board also answers jobs A1 to A12, S1 to S4, the salesperson's question and every "missing" item. A table on each board says where each one is done.

The boards differ in **order and grouping**, not only in look:

| | A · One working table | B · Settle, then look | C · Columns before lines |
|---|---|---|---|
| Order | census → filter → lines → act | problems → preview → act | risk → structure → lines → act |
| Grouping | none until the person filters | by what a person must decide | by exception, then column per list, then supplier |
| First window | the tiles, the toolbar, one table with every moved column named, the dock | the step strip, then the 14 to place as cards | "12,609 of 15,691 stay exactly as they are", then the 25 and the 61 side by side |
| Leave a line out | a tick on every line, a master tick, and Space | Keep / Leave out in Settle, and a tick in Look | Keep / Leave out, plus a tick per supplier |
| Settle the 61 | in the line, as radios: "Place the 47 the Code names" | cards (OpenRefine) | a compare table per line |
| Rest page | the edition as its first line, a ledger of files, the drafts sentence | a new computer: this computer beside the copy, kind by kind, and a day-by-day record | after Apply: an inventory led by the edition, "no copy holds today's changes", and history by day |
| Exclusive references | WorkbookDiff (`live/workbookdiff-result.png`), GitHub Desktop partial commit (`live/gh-desktop-partial.png`) | OpenRefine reconciliation (`live/openrefine-reconcile-hover.png`), Airtable CSV import (`live/airtable-csv-mapping.png`) | Recce value diff and checklist (`live/recce-value-diff.png`, `live/recce-checklist.png`), DockMaster vendor price book (`live/dockmaster-pricebook-1.png`) |

Paths are under `docs/research/refs/shelf/round-2/`. No earlier board in `docs/directions/` cites any of these six. Attio, HubSpot, Figma and DoltHub were used by earlier boards, so they are not anyone's primary here.

**What this screen does that no other does.** It is the only place a figure on the price list moves by the thousand, and the only screen that asks a person to vouch for a file somebody else wrote.

**Reflow.** Each board's notes give 390 × 844, 844 × 390, 834 × 1112, 1280 × 800, 1440 × 900 and 1920 × 1080. Every board was shot at all six sizes and every shot was read.

Measured in the screen above the notes, at all six sizes on all three boards:
- sideways scroll 0;
- no text under 12 px;
- no text cut by its own box.

At 390 the dock sits above the bar, and every act a thumb needs is 44 px.

**Honest emptiness.**
- No quote, customer, rule, setting, picture or copy exists on this computer, so each is drawn as 0 or none. That includes the salesperson's line: "No quote is being written on this computer, so no file would move one".
- No person's name is drawn on the ledger.
- The copy B brings back is the one state 4 would have saved, so its counts are derived from the plan.
- The paste is the judge's own measured one ($1,640 → $1,300).

## Why A

**Simple wins.** A is one screen with one model:
- a tick on every line;
- one batch built from the kept lines, so the command keeps its one inverse;
- a dock that counts what Apply will write.

Every one of the judge's five demands is reached from the same register, by a tile or a chip:
- Supplier IBC is two presses.
- Dealer Fit's ten busiest columns are columns. The other ten are named in the line, so nothing is ever "other figures".
- The Dee Shackle is one Space.
- The 47 are one press.
- Apply never leaves the window.

It reflows from a table at 1,200 px and up to labelled cards below that, without changing what is shown. That is the judge's "works at every size" in its plainest form. It is also the register an admin already knows from Excel, with the arithmetic done for them.

**What the others do better.**
- B's Settle step is the gentlest way to meet the 14, and its after-Apply band ("Save a copy now") is the best answer to judge item 11.
- C's column table is the most beautiful summary of a large change: Dealer Fit read as 20 counted columns before any line.

**Worth grafting onto A when it is built:**
- C's column counts. A already prints each column's count in its header.
- B's "Save a copy now" band after Apply.

Neither graft changes A's order.

**Against A.** Its first window is a lot of table. The tiles ("doubled or halved 25", "can't be placed 61") are what keep the risky lines one press away, and they must stay.

## Not done here

- Nothing was built and no app file was touched. The work is only under `docs/directions/data-round/shelf/`.
- The boards were not published as an Artifact canvas, and nothing was committed. Both are left to the round's orchestrator.
- The ledger, the day-by-day record and the copy's edition need a record of their own: a schema change, decided when the winner is built.
