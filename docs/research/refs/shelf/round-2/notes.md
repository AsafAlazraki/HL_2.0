# The shelf, round 2: the sweep for the redraw

Driven 2026-11-04 for the judge's **redraw** of the change sheet, and for deepening the rest page (`docs/directions/data-round/shelf/judge.md`).

**Counts.**
- **64 sources, 54 frames, 46 opened:** 38 in `live/`, 6 in `gallery/`, 2 in `hand/`.
- Eight frames were captured and not opened.
- Ten sources gave no frame, and nine frames show only a sign-in, a bot check or a 404. All of these are under "Failed" in `sources-index.md`.
- Paths are relative to `docs/research/refs/shelf/round-2/`. Round 1's frames are `../live/…`.
- None of the 1,942 URLs already in `refs/**/sources.json` was driven again.

**What round 1 did not use.** Round 1 (`../notes.md`) asked how a re-issue is *said*: the census, the arrow in the cell, the edition header, the inventory a copy is. Every frame it used holds a handful of changes. This round looked only for the tools that work through four thousand: a census by column, filters and a find, an include per line, choosing which row an ambiguous line means, mapping a heading, an import ledger, a restore that compares, and a marine dealer's own price-book load.

**The file's facts.** All of these are the judge's, measured on Northside's `Parts Module (2).xlsx`:
- Speed: read 2.2 s, apply 1.2 s, undo 1.5 s.
- The change set: 3,899 changes (3,082 change, 817 new), 61 that can't be placed, and 12,609 of 15,691 lines unmoved.
- Dealer Fit has 1,625 changes.
- Parts has 2,297 lines. 47 of them can't be placed, and on 243 the Sell did not move.
- There are 25 lines to look at first, the Dee Shackle $98 → $3 among them.
- The edition: the price list of 16 September 2026, fingerprint `a22d3e1051af`.

**The engine fact.** `tableCsv.ts` already holds a `CellChange { columnName, from, to }` for every cell, so naming each column old → new is honest. `FileLine` keeps only the read figure and a count, which is why the screen says "and 9 other figures". A board counts its per-column figures from `CellChange` before printing them.

## 1. What is genuinely best, and why

**1 · A census by column, the moved one first.** In `live/recce-value-diff.png`, Recce heads a model with *Model: customers, 1856 total (1856 common, 0 added, 0 removed)*.
- Then one row per **column**, with Matched and Matched %, sorted ascending: *customer_lifetime_val… 22 · 1.19 %* on top, every other column *1856 · 100.00 %*.
- The figures are mono and right-aligned, so the one column below 100 % is found without reading.
- This cures "9 figures · and 9 other figures". Dealer Fit says *which columns* moved, and on how many lines, before any line is shown. A press on a column filters the lines to it.

**2 · The change set as a working table.** `live/workbookdiff-result.png` compares two versions of an .xlsx in the browser (`live/workbookdiff-sample.png`: *quarterly-budget-v1.xlsx · 7.1 KB / Ready to compare*).
- First, tiles of counted kinds (*3 Value changed · 1 Formula changed · 1 Worksheet added*).
- Then **Search changes**, a **Worksheet** select and a **Change type** select, with *Showing 10 of 10*.
- Then a table: Change · Worksheet · Location · Before · After.
- A footnote says filters "change the table view only". That is our rule: a filter narrows what is seen, never what Apply writes.

**3 · Include, line by line, under one tick for the whole.**
- `live/gh-desktop-partial.png`: GitHub Desktop sets one checkbox over *3 changed files* and one on each file, and the docs add *toggle the checkbox with the Spacebar or Enter*.
- `live/figma-publish-library.png`: Figma's Publish library heads its list with *☑ Changes (1 of 1)* over a search.
- Ours: "☑ Changes (3,898 of 3,899)", the Dee Shackle unticked, and "Apply 3,898 changes". It stays one command with one inverse, built from the kept lines.
- The counter-example is Figma's branch review (`live/figma-branch-list.png`, *Merge branch*), which is all or nothing. Its help says *there isn't a way to select or merge specific changes*.

**4 · Settle the line that can't be placed by choosing its row.** OpenRefine's reconciliation leaves an ambiguous cell where it is and lists its candidates under it, each with a score (`live/openrefine-reconcile-hover.png`: *Jónsdóttir, Jóni (19)*, *Create new item*).
- Hovering a candidate offers **Match this Cell · Match All Identical Cells · Cancel**.
- `live/openrefine-reconcile-ambiguous.png` shows *Paris* with eight candidates.
- Ours: "two lines here share this name", with both rows offered by code and price. "This one" settles one line, "every line with this name" settles the rest, and the line joins the plan.

**5 · A heading nobody recognised, mapped by pointing.**
- `live/attio-review-values.png`: Attio's importer numbers its steps (*Upload file · Map columns · Review values · Preview import*). It pairs each file column with its attribute (*Industries → Categories*) and shows raw → mapped values under *Automatically mapped 80*, *Empty 67 rows → Skipped*.
- `live/airtable-csv-mapping.png`: Airtable has a toggle per field, and says *74 records will be created* at the head and again beside Save.
- Ours: the workbook's own heading, *Parts & Accessories Module*, gets a *Your column → Will become* row instead of a refusal with no act (judge item 8).

**6 · The preview, counted where the act is.**
- `live/attio-preview-import.png`: *495 Companies ready for import*, and on the right *+ 0 will be created · ⟳ 495 will be updated*. The same glyph sits in every row's gutter, and **Start import** is pinned at the foot.
- `live/attio-confirm-import.png` mixes the two kinds row by row: *33,097 created · 1,485 updated*.

**7 · Every file brought in, kept as a ledger.**
- `live/hubspot-imports-table.png` is titled *Monitor your imports & syncs*. Its columns are Import Name · New · Updated · Errors · System · Source. One import is called *Restore*, and reads *12 · 239 · 0*.
- `live/updraft-dashboard.png`: *Existing Backups 2*, each row dated, with **Restore**. `live/obsidian-version-history.png`: revisions under a day (*11 revisions via Desktop*).
- This is the judge's item 6. It needs a record of its own, a schema change.

**8 · A restore that says what it will undo.**
- `live/onedrive-restore.png`: *All changes after 3/20/2024, 12:00:00 AM will be rolled back* under the date, a bar per day, then ticked changes under *Today - 3/21/2024 (26)*.
- `live/updraft-restore-components.png` restores a copy kind by kind (Database · Plugins · Themes · Uploads · Others).
- `live/attio-records-already.png` names what happens to what is already there: *Add again / Update existing*.
- Together they draw the judge's item 9: this computer beside the copy, kind by kind, with the copy's quotes split into *new here* and *already here*.

**9 · A marine dealer's own price-book load.** DockMaster (the marine DMS) loads a vendor's price book per vendor.
- `live/dockmaster-pricebook-1.png`: *00013 MERCURY MARINE*, with ticks for Update Prices, Update Cost, Load New Items and Conflict on Price.
- `live/dockmaster-pricebook-3.png`: a load code set once on the vendor (*MERC.NET.DMS*).
- `live/dockmaster-price-factor.png`: *Price Change Using Factor* "only calculates", and a second program writes. Its page asks for "a valid backup … prior to running this process", which is our read-then-Apply and our "save a copy first".
- Per-vendor loading makes **by supplier** the grouping a marine admin already thinks in.

## 2. Patterns worth taking, named

- **The column census** (`live/recce-value-diff.png`): "Sell inc Install · N of 1,625 lines", counted from `CellChange`, sorted by how many lines moved. A press filters to that column.
- **Showing N of M** (`live/workbookdiff-result.png`): a find, plus selects for list, supplier and kind (higher · lower · new · can't place · other figures only).
- **The master tick** (`live/gh-desktop-partial.png`, `live/figma-publish-library.png`): a tick for the file, each list and each line, all toggled by Space. Apply counts the ticks.
- **Match this line / every line with this name** (§1.4) and **Your column → Will become** (§1.5).
- **Will be updated · will be created, at the act** (`live/attio-preview-import.png`): one dock that never scrolls away, and is one line at 844 × 390.
- **The step strip** (`live/attio-review-values.png`): each step is a URL search param (`?see=changes&step=settle`).
- **The approved tick** (`live/recce-checklist.png`): ten checks, each with a ✓, *Outdated* chips and **Approved**. Ours: each of the 25 is *kept* or *left out*, and the group says "18 of 25 looked at".
- **The import ledger** (`live/hubspot-imports-table.png`), with **Restore on the row** (`live/updraft-dashboard.png`).
- **The roll-back sentence** (`live/onedrive-restore.png`), said under the act, and **calculate, then write** (`live/dockmaster-price-factor.png`), said in the band.

## 3. Type and motion, as observed

- **A large count over a small two-line label:** ochre numerals of about 22 px over bold 11 px labels, eight to a row (`live/workbookdiff-result.png`).
- **Mono, right-aligned shares:** *1.19 %* against *100.00 %* (`live/recce-value-diff.png`). DoltHub colours the count and greys the share: *461173 Rows Deleted 0.62%* (`live/dolthub-big-summary.png`).
- **A glyph carries the kind, not a colour:** ⟳ and + in the gutter and again beside the counts (`live/attio-preview-import.png`).
- **A day as a heading with its count:** *Today - 3/21/2024 (26)* (`live/onedrive-restore.png`).
- **Motion:** every frame is a still. The DoltHub gifs were taken at their first frame (`live/dolthub-hide-columns.png`, `live/dolthub-filter.png`). So a filter swaps rows in place, a tick changes the dock's count in place, and under reduced motion nothing moves.

## 4. What to avoid, each with its frame

- **A sticky bar over its own result:** the header covers *10 detected changes* (`live/workbookdiff-result.png`).
- **The result under a chooser on a phone:** at 390 it starts about 1,800 px down, under three marketing cards (`hand/workbookdiff-390.png`).
- **A wall of one colour:** 28,874 added rows, all green (`live/dolthub-filter.png`). New lines fold to a count, with the first few named.
- **Two rows per change**, again (`live/dolthub-big-summary.png`).
- **A canvas as the way in, with a legend over the work:** Recce's lineage is the entry (`live/recce-demo.png`), and its legend covers nodes (`live/recce-value-diff.png`).
- **A sample instead of a preview:** ten raw, zero-padded rows (*00034.15*) and no word of what changes (`live/dockmaster-pricebook-2.png`).
- **"--" for zero:** *UPDATED RECORDS --* (`live/hubspot-import-summary.png`). Say 0.
- **Restore and Delete at equal weight:** side by side, the same size (`live/updraft-dashboard.png`).
- **"0 changesets." when the reason is a sign-in** (`live/osmcha.png`).

## 5. Directions

The judge asks for three directions for the change sheet, drawn on Parts Module (2). Each must show five things at 390, 844 × 390, 1440 and 1920:
- Dealer Fit's columns, named;
- IBC, found by supplier;
- the Dee Shackle, held back;
- the 61 lines that can't be placed, settled;
- Apply, in view.

The rules for all three boards:
- Each names two exclusive references that no earlier board used: not round 1, and not the data, review, entry or choosing rounds.
- Round 1's DoltHub, daff and Figma-library frames stay open to all three.
- None is list-left, detail-right (critique-m2).

**E · "The working table": one filtered register.**
- *Composition:*
  - A band with WorkbookDiff's counted tiles: change · new · can't place · unmoved, with its share.
  - A sticky row: find, list, supplier, kind, and "Showing N of 3,899".
  - One virtualised table (react-virtuoso is already a dependency). Its columns are ☑ · name · list · supplier, then one Before → After column per changed column, so Dealer Fit's columns are named in the header.
  - A dock: "☑ 3,898 of 3,899 · Apply 3,898 changes · Undo puts them all back".
- *Order:* census → filter → lines → act.
- *Exclusives:* `live/workbookdiff-result.png`, `live/gh-desktop-partial.png`.
- *Only this screen:* any change in a 39.8 MB workbook is found in two keystrokes and left out with one Space.
- *Reflow:*
  - 390: each line becomes "name · list" over "column old → new", and the filters sit behind one "Filter · 2".
  - 844 × 390: the census is one line, and the dock is one line of 44 px.
  - 1920: every changed column shows, with no sideways scroll.

**F · "Four steps": settle before you see.**
- *Composition:* Attio's step strip, Read · Settle · Look · Apply, at `?see=changes&step=`.
  - **Settle** holds only what needs a person: the 61 lines that can't be placed, each with OpenRefine's candidates (code, price, *this one*, *every line with this name*), and any unrecognised paste heading as Your column → Will become.
  - **Look** shows the lists as tabs, "will be updated · will be created" at the right, and a glyph in every gutter.
  - **Apply** restates the count and its Undo.
- *Order:* problems → preview → act.
- *Exclusives:* `live/attio-preview-import.png` (with `live/attio-review-values.png`), `live/openrefine-reconcile-hover.png`.
- *Only this screen:* Apply never carries a line nobody placed, and the paste door and the file door share step 2.
- *Reflow:*
  - 390: "Step 2 of 4 · Settle", and each candidate is a full-width choice of 44 px.
  - 844 × 390: the strip and the dock share one line.
  - 1920: a line sits beside its own candidates. That is one item, not a list beside a detail.

**G · "By exception": a review queue, columns first.**
- *Composition:* one column of bands that open in place.
  - "Look at these first, 25": Recce's checklist, each line *kept* or *left out*, with "18 of 25 looked at".
  - "Can't be placed, 61".
  - "By supplier", counted from the plan.
  - "By list": each list opens to its column census, then to the lines of the column pressed.
  - Unmoved lines appear as a count only.
  - A dock holds the census and Apply.
- *Order:* risk → structure → lines → act.
- *Exclusives:* `live/recce-value-diff.png`, `live/recce-checklist.png`.
- *Only this screen:* 1,625 Dealer Fit changes are read as a few columns before any line.
- *Reflow:*
  - 390: the bands stack.
  - 844 × 390: one band is open at a time.
  - 1920: risk and structure sit side by side.

**D, deepened (not redrawn): the rest page.**
- At the head: "Price list of 16 September 2026 · `a22d3e1051af`", with the last copy beside it (`../live/apple-tm-latest.png`).
- A ledger of files brought in, as `live/hubspot-imports-table.png` draws it: name, size, day, who, changes, applied or put back. On day one it holds one true row: the packed file.
- Before Apply, the quotes being written that the file moves, said in a sentence. With no drafts it says "No quote being written reads a line this file moves".
- Bring back in two columns, this computer beside the copy, kind by kind (`live/updraft-restore-components.png`), with the copy's quotes split as `live/attio-records-already.png` splits them.
- After Apply, "Save a copy now", the way UpdraftPlus sets **Backup Now** beside its schedule (`live/updraft-dashboard.png`).
- *Exclusives:* `live/onedrive-restore.png`, `live/hubspot-imports-table.png`.

**Not in the brief.** DockMaster's per-supplier load is, for a workbook that arrives whole, E's supplier filter plus the master tick.

## 6. The imagery question

The best tools for a change set are typographic: Recce, WorkbookDiff, Attio's preview and DoltHub carry no pictures. Figma's branch review shows thumbnails (`live/figma-branch-list.png`) only because its objects *are* pictures. Ours are prices.

What the seed can honestly put on this screen:
- A list that is a maker may carry its mark from `marks-ledger.json`. Stabicraft has no mark, so its name is set in type. Mercury's mark is white ink, so it needs a dark plate.
- A supplier is set in type.
- No boat photograph belongs on a price line.
- The rest page keeps Northside's mark, smaller than the judge's measured 190 px head.

`docs/SCREENS.md` row 146 is the shelf's; the directions round updates its references.
