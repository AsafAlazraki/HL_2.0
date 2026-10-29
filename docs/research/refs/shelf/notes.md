# The shelf — the sweep

Driven 2026-10-29 with `tools/research/capture.ts` into `live/`, `live2/` and `hand/`. **34 frames captured, 33 opened, plus 3 stock frames: 36 Read calls of 40.** Without shape: `live/dolthub-pull-compare-scrolled.png` (repeats its pair; the page scrolls an inner pane), `live/dropbox-rewind.png` and `live2/gmail-undo.png` (title cards), and the three stock frames. `hand/rsi-validation-390.png` was not opened and is not cited. Nineteen refusals are under "Failed" in `sources-index.md`. Paths are relative to `docs/research/refs/shelf/`.

**The job.** A new Master Price File arrives: see exactly what moves, in a dealer's words, before anything is written, then `Apply (N changes)` and Undo after, with every issued quote untouched. Paste from Excel gets the same preview. Northside's own work goes out as one file and comes back into a fresh browser. Clearing the sheet and forgetting everything are possible, never accidental. **Direction name: "The shelf"** — a dealer puts a version on the shelf and takes one down (`src/domain/io/shelf.ts`).

## 0. Corrections, by measuring

1. **"Gone" is never deleted.** `tableCsv.ts`: `untouched` — "rows on this table with no line in the file. NEVER DELETED." The fourth bucket is "in Northside's file, not in this one: kept as it is". Retiring such a row is the dealer's own act on the sheet.
2. **The plan is per table.** `planTableUpload` plans one table; a 53-table preview is 53 plans summed. A pure `planFile`, if needed, goes in `src/domain/io` with a test.
3. **A real re-issue is on this machine.** `mpf-workbooks/Parts Module (1).xlsx` and `(2).xlsx`, compared from their extracts, differ on two sheets only. On Parts Maintenance, 58 rows changed, all of them IBC's "Tube Covers to suit PVC Boat". On Dealer Fit Module, the 67 packages built on them changed too. "Tube Covers to suit PVC Boat - 2.0 Mtr" goes from Sell 1,300 to 1,540, and the pack (`parts.json`, `Source = Parts Maintenance!R597`) holds it at **$1,640**. That is three real figures in three real files. No date says which is newest, so a board must not say.
4. **The scale is real.** A crude by-Code comparison of Parts Module (2) against the pack's `parts` table counts 1,556 Sell figures equal, 1,106 different (476 higher in the pack, 630 lower), 863 codes only in the workbook and 144 only in the pack. The pack has 2,806 distinct codes over 2,937 rows. "Apply (2,318 changes)" is the right order. These are not the engine's figures (it matches on the row key, then the name), and a board re-measures before printing.
5. **A `blob:` picture does not travel.** `envelope.ts` treats `blob:` as "our own bytes" (`OWN_PIXELS`), but a blob address dies with its session. A backup that promises "the pictures Northside chose" must carry their bytes.
6. **Places are not pinned through a restore.** `restoreAfterClear.test.ts` sets them aside (`modules: {}`) and says so. No board promises a restored mark until a test does.
7. **The bands the extracts hold and the pack drops** (`HL_Playground/tools/seed/extracts/`, counted by column band, header rows included):

   | band | rows with a value |
   |---|---|
   | Deposit schedule, QC..QH | 826 of 865 (823 of 862 boat rows) |
   | Lead times, QJ..QO | 826 of 865 (brief: 821; reconciled when the packer runs) |
   | Trailer features, R..AL | 231 of 533 (230 trailers) |
   | Standard inclusions, W..BV | **0** |
   | Factory options, BX..IG | **0** |

   This sweep wrote only under `docs/research/refs/shelf/`. Carrying the three present bands, with column letter and `Source`, is build work in `tools/seed/pack.ts`. The two empty bands need Northside's **Boat Module** and **Factory Options Module** workbooks, which are not on this machine.

## 1. What is best, and the five hard questions

**1 · Confidence over 15,691 rows.** Say first what does NOT change, as a share. `live/dolthub-pull-compare.png` heads the table with **"0 Rows Deleted 0.00% · 0 Rows Added 0.00% · 32 Rows Modified 0.44% · 39 Cells Modified 0.01% · 7,199 Rows Unmodified 99.56%"**: counts in colour, shares in grey, one line. Then show only changed cells, old inside new. `live/daff-live.png` writes **`D. Duck→L. L. Buck`** in one cell, marks rows `+++` and `---`, and folds unchanged rows to `...`. `live/daff-vs-diff.png` is the argument in one picture: the line diff of a CSV deletes and re-adds every row, while the table diff shows five moves. Group by cause where the file allows it. The real re-issue in §0 is one supplier, IBC, and `live/figma-lib-a.png` heads an update with **"Updates from Stickers v1 · Published by Crystal Tong 2 days ago"**.

**2 · The moment before Apply, and the Undo after.** Restate the census on the act, and name what cannot come back.

- `live/bc-folder-sync.png` puts **"Change right so it has the same files/folders as the left. Copy 72 file(s) to right, 5.16 MB · Delete 1 file(s) on right, 14.9 KB"** above the list.
- `live/planetscale-deploy.png` names the undo window inside the act's menu: "a 30 minute revert window" against "Instant deployments cannot be reverted".
- Ours is simpler. Undo is the command inverse, and `evidence.ts` keeps the last 10 merges, 300 cells each, with the true `cellTotal`.
- The dock reads "Apply 2,318 changes". After the press it reads "Applied 2,318 · Undo" in the same place, with "0 issued quotes changed".

**3 · What a backup holds.** Kinds, counts, a total. `live/apple-migration-choose.png` shows six ticked rows, each with a size at the right, over **"188.83 GB selected to transfer. 243.63 GB available on Mac."** Ours lists quotes, customers, rules, settings and pictures, counted. The price file is named once, as the version the copy was made against (fingerprint `a22d3e1051af`, packed 2026-09-16). `live/apple-tm-latest.png` states the last copy as a phrase, **"Latest Backup … Today, 9:41 AM"**, above `Back Up Now`.

**4 · Possible, never accidental.** List what goes and what stays on a page, before the act.

- `live2/apple-ios-erase-list.png` is a full screen, not an alert: one sentence, then **"The following items will be safely removed"** over four rows (Apps and Data 36.76 GB · Apple Account · Find My · Wallet 1 item), with `Continue` and `Not Now`.
- `live2/github-archive-warnings.png` lists the consequences, asks you to type the name, and makes the act say it: "I understand the consequences, archive this repository".
- `live/supabase-pitr-confirm.png` sets the restore point large and focus-rings **Cancel**.
- Ours already has its sentence: "A quote is a photograph of what was offered on the day."

**5 · At 390.** `hand/dolthub-compare-390.png` stacks the census as five lines, each a count, a label and a share, still above the rows. `hand/gh-pr-files-390.png` loses the tree, the `+55 −54` census and the "Files changed 28" tab: a phone with no total.

## 2. Patterns worth taking, named

- **The unchanged share** (`live/dolthub-pull-compare.png`): what did not move, as a percentage, beside what did.
- **The arrow in the cell** and **the fold** (`live/daff-live.png`): `$1,540 → $1,640` where the Sell figure lives, and unchanged runs as one `…` line that opens.
- **The edition header** (`live/figma-lib-a.png`): the update named by source and age, with per-item `Update` and one `Update all`.
- **Current | Updated, one at a time** (`live/figma-lib-c.png`): the object twice, labelled, **"1 of 4 instances"**, `Update instance` beside `Update all`.
- **The operation sentence** (`live/bc-folder-sync.png`).
- **The undo window inside the act** (`live/planetscale-deploy.png`).
- **The counted act** (`live/actual-import.png`): **"Import 7 transactions"**, each value shown as read (`2026-10-09 → 10/09/2026`), and a `+` on each new row. The original HelmLogic did the same with `Apply (23 writes)`.
- **Replace, or keep both** (`live/apple-migration-keep-both.png`): the destructive choice carries its own safety, "Keep a copy of the data…".
- **The inventory with a total** (`live/apple-migration-choose.png`). **The list of what goes** (`live2/apple-ios-erase-list.png`). **The act that says its consequence** (`live2/github-archive-warnings.png`, `live/supabase-pitr-confirm.png`).
- **The paste door under the file door** (`live/csvbox-demo.png`): "Or click here to copy paste table data" below the drop zone.
- **The header row chosen by pointing** (`live/rsi-select-header.png`) and **Your table → Will become** (`live/rsi-match.png`): how a wrong guess from `looksLikeHeader` or `proposeMapping` is put right.

## 3. Type and motion

- **Mono figures, grey shares.** `live/dolthub-pull-compare.png` uses tabular values, so one jumped price can be found in a long column.
- **The thing at risk is the largest type.** `live/supabase-pitr-confirm.png` sets the restore point at about 28 px against 15 px body.
- **A bold title, then one grey line** (`live/apple-migration-choose.png`, `live2/apple-ios-erase-list.png`): one question, asked once.
- **Colour never alone.** `live/bc-table-compare.png` hatches the missing side and counts it: "10 difference row(s)".
- **No motion was captured; every frame is a still.** So the only claim is placement: Apply becomes Undo in the dock, never a toast (`evidence.ts` was written against the original's four-second toast). Reduced motion is honoured.

## 4. What to avoid

- **Two whole rows for one change, the change off screen.** In `live/dolthub-pull-compare.png` each modified row is a `−` row and a `+` row, identical in all five visible columns; the changed cell is off the right edge at 1440. Changed columns go beside the name.
- **A line diff of a table** (`live/daff-vs-diff.png`, left).
- **Colour with no words** (`live/rsi-validation.png`): blue, yellow and pink cells with no legend, and an uncounted `Confirm`.
- **A wall of parser options** (`live/actual-import.png`): delimiter, encoding, skip lines, flip amount. `pasteBlock.ts` sniffs these, and a dealer never sees them unless a guess was wrong.
- **A census that disagrees with the diff** (`live/planetscale-dr-page.png`): 0 Created · 0 Altered · 0 Dropped beside a removed line drawn in red.
- **An export that says only what it leaves out** (`live/bitwarden-export.png`). `live/wordpress-export.png` lists the kinds in italics with no count.
- **The modal everybody clicks through** (`live/apple-erase-assistant.png`): a red act the size of Cancel, directly above it, over a dimmed stage.
- **A change found only by hovering** (`live/figma-lib-b.png`): the update sits behind a refresh icon and "Review update" in a menu.
- **A phone that loses the total:** see §1.5.

## 5. Directions

Four boards, none narrow-list-left, detail-right; each differs in composition, order and grouping.

**A · "The edition": one supplier's change, as a decision.**
- *Composition:* a centred stage.
  - The head names the edition: "Parts Module (2) · 58 IBC tube covers · 67 packages built on them".
  - One line at a time, Current | Updated, with Sell large.
  - A counted filmstrip beneath ("1 of 58").
- *Order and grouping:* cause → lines → act, grouped by who changed it (the supplier named in the rows).
- *Exclusive references:* `live/figma-lib-c.png`, `live/figma-lib-a.png`.
- *Only this screen:* a price change read as a supplier's decision, as a dealer hears it.
- *Reflow:* at 390, Current sits over Updated and the strip swipes. At 834, the two sit side by side. At 1920, the stage holds reading width and the strip shows more.
- *Northside sets:* the level figures are read at (Cash or Sell, from the ladder) and the accent.

**B · "The census": the whole file as one register.**
- *Composition:* full width, with no side list.
  - A head band carries the census: new · changed · unchanged % · only in Northside's file.
  - Rows go by place, then table, in tabular columns.
  - A table opens in place to a daff grid of its changed rows only: changed columns pinned beside the name, `old→new` in the cell, unchanged runs folded.
- *Order and grouping:* file → places → tables → cells, grouped by the file's own structure.
- *Exclusive references:* `live/dolthub-pull-compare.png`, `live/daff-live.png`.
- *Only this screen:* says 15,691 rows at once and still finds the one price that jumped.
- *Reflow:* at 390, the census stacks as in `hand/dolthub-compare-390.png`, a table opens full screen, and cells become "label · was → now" lines. At 834, rows take two columns. At 1920, every changed column shows without sideways scroll.
- *Northside sets:* the level, and whether cost columns show (internal, but prices still read through the ladder).

**C · "The two shelves": this browser beside the file.**
- *Composition:* a mirror.
  - "On this browser" sits left and "In the file you brought" right.
  - A gutter between them marks each place: → for will change, + for new, · for kept.
  - The operation sentence spans the top: "Make this browser's prices match the file: change 1,106 · add 863 · keep 144 the file doesn't name". These are §0.4's crude figures, re-measured before print.
  - The act names its undo reach.
- *Order and grouping:* operation → two sides → act, grouped by direction of movement.
- *Exclusive references:* `live/bc-folder-sync.png`, `live/planetscale-deploy.png`.
- *Only this screen:* both versions at once, so which wins is seen.
- *Reflow:* at 390, one list of "here → there" rows. At 834, the panes narrow and the gutter stays. At 1920, the panes gain category heads.
- *Northside sets:* the arrow accent and the level.

**D · "The safe": Northside's work first, the price file a door.**
- *Composition:* a vertical page.
  - At the head, one door: "A new price file? Bring it in", which opens A, B or C's preview.
  - **Northside's work** as an inventory with counts and a total. On day one that is 0 quotes, 0 customers, 0 rules Northside has written, its settings and 0 chosen pictures. It reads "No copy saved yet" until one exists, then "Latest copy · today, 9:41", with `Save a copy`.
  - **Bring back a copy**, with replace or keep both.
  - At the foot, the two dangerous acts, each a list of what goes and what stays, and an act that says its consequence.
- *Order and grouping:* hold → save → restore → forget, grouped by what is at risk.
- *Exclusive references:* `live/apple-migration-choose.png`, `live2/apple-ios-erase-list.png`; supporting `live/apple-tm-latest.png`, `live2/github-archive-warnings.png`.
- *Only this screen:* makes moving to a new laptop, the only way until Milestone 6, the obvious act.
- *Reflow:* at 390 it is already a column. At 834, the inventory takes two columns. At 1920, inventory and restore sit side by side, the dangerous acts full width below.
- *Northside sets:* the backup's file name and the accent. The mark is read from `marks-ledger.json`'s organisation row.

**Not in the brief:** D. If A, B or C wins, D's bands still need a place, and the board draws where.

## 6. What the seed can honestly put here

- **The file:** `manifest.json` holds 53 tables, 15,691 rows, sha `a22d3e1051af`, packed 2026-09-16. Every backup and every preview states it.
- **A real change:** the IBC tube cover at 1,300, 1,540 and $1,640 (§0.3), and Parts Module (2) against the pack (§0.4), printed only as the engine measures it.
- **Day one:** 0 quotes, 0 customers, 0 chosen pictures. A board must look finished with those zeros.
- **Marks:** `marks-ledger.json` has seventeen marks for twelve of thirteen brands. They may stand beside a place's census row. Stabicraft has none, so its name is set in type. Mercury is white ink only and needs a dark plate.
- **Heroes:** the eight in `heroes-ledger.json` have no job here beyond being counted in a backup.
- **The missing bands:** the preview says that standard inclusions (W..BV) and factory options (BX..IG) are on no row and arrive with the Boat Module and Factory Options Module workbooks.

`docs/SCREENS.md` is left for the directions round. Claimed primaries (A Figma; B DoltHub, daff; C Beyond Compare, PlanetScale; D Apple Migration Assistant, iOS erase) are in no existing row.
