# The shelf, round 2 — sources index

Captured 2026-11-04. Frames are 1440 × 900 unless marked 390.

How they were captured:
- Most frames come from `tools/research/capture.ts`, with the lists `list-live.json`, `list-live2.json`, `list-img.json`, `list-gallery.json`, `list-gallery2.json` and `list-hand.json`.
- Ten live frames and one 390 frame were driven by hand in Playwright. The ledger marks each of these `via: playwright MCP`.

The ledger, with the title and final URL of every frame, is `sources.json` in each folder. Frames are gitignored and mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\shelf\round-2\`.

A help-centre picture is cited by its own address, with the page it illustrates named in the line. "Opened" means read by eye in this sweep, and only opened frames are cited in `notes.md`.

## live/ (40 frames, 38 opened)

| frame | URL | one line |
|---|---|---|
| `live/recce-demo.png` | https://pr1.cloud.datarecce.io/ (→ pr1.demo.datarecce.io) | Recce demo: a lineage canvas as the way in, a legend for Added/Removed/Modified/Impacted, and "2 results · 1 diff" on a node. |
| `live/recce-analysis.png` | https://pr1.demo.datarecce.io/ | The customers model opened: *Row Count: 1,856 rows · No Change*, with Profile · Value · Top-K · Histogram. |
| `live/recce-value-diff.png` | https://pr1.demo.datarecce.io/ | Value diff: *1856 total (1856 common, 0 added, 0 removed)*, then Matched and Matched % per column, sorted so *1.19 %* is first. |
| `live/recce-checklist.png` | https://pr1.demo.datarecce.io/checks/?id=abbe5f4e-… | Checklist: ten checks, each with a ✓, *Outdated* chips, and **Approved**. |
| `live/workbookdiff.png` | https://workbookdiff.com/ | Two file doors, Original and Updated, with "Try Sample Files" and "Compare Excel Files". |
| `live/workbookdiff-sample.png` | https://workbookdiff.com/ | The samples chosen: *quarterly-budget-v1.xlsx · 7.1 KB / Ready to compare*. |
| `live/workbookdiff-result.png` | https://workbookdiff.com/ | Counted kinds as tiles, then Search, Worksheet and Change type, *Showing 10 of 10*, and Before / After. The site header covers the result's heading. |
| `live/dolthub-new-diff.png` | https://www.dolthub.com/blog/2021-07-14-new-diff-page/ (image "The new diff page") | DoltHub diff: Diff Overview per table at the left, and **Hide Column** on a header. |
| `live/dolthub-big-summary.png` | same blog, "Big diff summary" | *461173 Rows Deleted 0.62% · 1677052 Rows Added 2.27% … 99.38%*, with a − row and a + row for each change. |
| `live/dolthub-filter.png` | same blog, "Filtering a diff table" (first frame) | *Filter by: all changes*, and 28,874 added rows in one green wall. |
| `live/dolthub-hide-columns.png` | same blog, "Hide and unhide columns" (first frame) | A census line over a wide table of added rows. |
| `live/gh-desktop-partial.png` | https://docs.github.com/en/desktop/making-changes-in-a-branch/committing-and-reviewing-changes-to-your-project-in-github-desktop#creating-a-partial-commit | One checkbox over *3 changed files*, one per file, and "toggle … with the Spacebar or Enter". |
| `live/attio-review-values.png` | https://a.storyblok.com/f/234930/2460x1470/502cdab970/review-values-import.png (attio.com/help/reference/imports-exports/csv-imports/import-data-into-attio-via-csv) | Four numbered steps, file column → attribute pairs, raw → mapped values, *Automatically mapped 80*, *Empty 67 rows → Skipped*. |
| `live/attio-preview-import.png` | https://a.storyblok.com/f/234930/2460x1474/9508a59052/preview-import.png (same page) | *495 Companies ready for import*, with *0 will be created · 495 will be updated*, a glyph per row, and Start import pinned. |
| `live/attio-records-already.png` | https://a.storyblok.com/f/234930/1558x616/bda4a70d83/for-records-already-in-list.png (same page) | *For records already in the list: Add again / Update existing*, and *CEO → Company › CEO › Name*. |
| `live/attio-confirm-import.png` | https://a.storyblok.com/f/234930/5760x4096/033139483d/confirm-import_final.png (attio.com/blog/the-new-attio-importer-is-here) | *34,582 Companies ready*, with *33,097 created · 1,485 updated* mixed row by row. |
| `live/attio-sort-review.png` | https://a.storyblok.com/f/234930/866x486/a464912fe2/sort-review-values-step-import.png | Captured, not opened, not cited. |
| `live/airtable-csv-mapping.png` | assets.usepylon.com image (support.airtable.com/docs/csv-import-extension) | CSV import: *Merge with existing records* switched off, a toggle per field, and *74 records will be created* said twice. |
| `live/openrefine-reconcile-hover.png` | https://openrefine.org/assets/images/reconcilehover-a9fd6853e09716dfd7d81acb648e4203.png (openrefine.org/docs/manual/reconciling) | Candidates with scores under each cell, then **Match this Cell · Match All Identical Cells · Cancel**. |
| `live/openrefine-reconcile-ambiguous.png` | https://openrefine.org/assets/images/reconcileParis-dd3d74a30c832ae23f778928098ff50b.gif (same page) | *Paris*: eight candidates, plus *Create new item* and *Search for match*. |
| `live/openrefine-reconcile-window.png` | https://openrefine.org/assets/images/reconcilewindow2-82c0c0cac0e5f354d50f94b9eccdea1d.png (same page) | Reconcile column: the types, *Include?* per other column, and *Auto-match candidates with high confidence*. Opened, not cited. |
| `live/figma-publish-library.png` | https://help.figma.com/hc/article_attachments/25924823045655 (help.figma.com/…/360025508373-Publish-a-library) | Publish library: a search, *☑ Changes (1 of 1)*, and *☑ White box · Added*. |
| `live/figma-branch-list.png` | https://help.figma.com/hc/article_attachments/6008580195223 (help.figma.com/…/5693123873687) | Branch review: *Mobile revision Q2/22 · 34 changes*, design thumbnails marked + Added, and *Merge branch* for the whole branch. |
| `live/figma-branch-side.png` | https://help.figma.com/hc/article_attachments/6008252022295 (same article) | Before | Latest, *Change details* per layer, and *2 of 13*. Opened, not cited. |
| `live/hubspot-imports-table.png` | knowledge.hubspot.com …/review-import-table.png (knowledge.hubspot.com/import-and-export/view-and-analyze-previous-imports) | *Monitor your imports & syncs*: Name · New · Updated · Errors · System · Source, where *Restore* reads 12 · 239 · 0. |
| `live/hubspot-import-summary.png` | knowledge.hubspot.com …/review-import-records.png (same article) | Summary: *IMPORT ROWS 4 · NEW RECORDS 4 · UPDATED RECORDS --*, then *Errors (0) · Deals (4)*. |
| `live/hubspot-past-imports-page.png` | https://knowledge.hubspot.com/import-and-export/view-and-analyze-previous-imports | Captured, not opened, not cited. |
| `live/onedrive-restore.png` | https://support.microsoft.com/en-us/onedrive/media/restore-your-onedrive-002.png (support.microsoft.com/en-us/onedrive/restore-your-onedrive) | *All changes after 3/20/2024 … will be rolled back*, a bar per day, and ticked changes under *Today - 3/21/2024 (26)*. |
| `live/obsidian-version-history.png` | https://publish-01.obsidian.md/access/…/version-history-collaboration.png (obsidian.md/help/sync/version-history) | Revisions grouped by day and device, *Show changes*, Copy and Restore. |
| `live/updraft-dashboard.png` | https://ps.w.org/updraftplus/assets/screenshot-1.png?rev=1927660 (wordpress.org/plugins/updraftplus/) | Next scheduled backups beside **Backup Now**, then *Existing Backups 2*, each with its kinds and Restore beside a red Delete. |
| `live/updraft-restore-components.png` | https://ps.w.org/updraftplus/assets/screenshot-4.png?rev=1686200 (same page) | A backup's kinds as separate buttons (Database · Plugins · Themes · Uploads · Others). |
| `live/dockmaster-parts-load.png` | https://portal.dockmaster.com/docs/dockmaster-desktop/inventory-management/vendor-loads/inventory-parts-load/ | DockMaster (marine DMS) docs: a vendor price book is loaded per vendor, with Update Prices on by default. |
| `live/dockmaster-price-factor.png` | https://portal.dockmaster.com/docs/dockmaster-desktop/inventory-management/pricing/price-change-using-factor/ | "This routine only calculates", the write is a second program, and a backup is asked for first. |
| `live/dockmaster-pricebook-1.png` | portal.dockmaster.com/assets/images/29d687fc-… (…/loading-vendor-price-books/) | Inventory Parts Load: *00013 MERCURY MARINE*, departments, Update Prices / Cost / Load New Items / Conflict on Price, and a data file. |
| `live/dockmaster-pricebook-2.png` | portal.dockmaster.com/assets/images/38b9aa7d-… (same page) | View Sample: ten raw rows of the file, zero-padded (*00034.15*). |
| `live/dockmaster-pricebook-3.png` | portal.dockmaster.com/assets/images/c1614ce4-… (same page) | The vendor's Parts Information: *Vendor Load Code MERC.NET.DMS · Merc Net DMS format*. |
| `live/datasette-facets.png` | https://latest.datasette.io/fixtures/facetable?_facet=state&_facet=_city_id&_facet=on_earth | Counted facets over a table (*state 3: CA 10, MI 4, MC 1*). Opened, not cited: the entry round used Datasette. |
| `live/weblate-changes.png` | https://hosted.weblate.org/changes/ | A public changes ledger, with Latest / Newer / Jump to date / Older and an old → new string per entry. Opened, not cited. |
| `live/glide-grid.png` | https://grid.glideapps.com/ | Glide Data Grid's showcase grid. A style page; the "lots of rows" switch could not be pressed. Opened, not cited. |
| `live/osmcha.png` | https://osmcha.org/ | OSMCha: *0 changesets.* beside a sign-in. A queue behind sign-in, cited only as a failure. |

## gallery/ (10 frames, 6 opened)

| frame | URL | one line |
|---|---|---|
| `gallery/refero-import.png` | https://refero.design/search?q=import | The query is ignored: default results, then "Log In or Sign Up to See All". Gated. |
| `gallery/refero-review-changes.png` | https://refero.design/search?q=review%20changes | The same gated page. |
| `gallery/mobbin-import.png` | https://mobbin.com/search/web/screens?q=import (→ sign-up) | Mobbin's landing page. Gated. |
| `gallery/dribbble-data-import.png` | https://dribbble.com/tags/data-import | Import concepts, including an "Import CSV Summary" thumbnail (rows in file, duplicated, imported). Thumbnails too small to cite. |
| `gallery/dribbble-csv-import.png` | https://dribbble.com/tags/csv-import | Attio's own CSV-import shot (file columns → attributes, with a value preview) among others. Thumbnail only. |
| `gallery/dribbble-version-history.png` | https://dribbble.com/tags/version-history | Version-history panels (Lyearn, Joey Banks): entries dated, with who. Thumbnails only. |
| `gallery/nicelydone-import.png`, `gallery/nicelydone-import-2.png` | https://nicelydone.club/tags/import, …/examples/tags/import | "Page not found". Not opened. |
| `gallery/saasframe-import.png` | https://www.saasframe.io/categories/import | "Not Found". Not opened. |
| `gallery/saasinterface-import.png` | https://saasinterface.com/search/?q=import | "Page not found". Not opened. |

## hand/ (390 × 844; 4 frames, 2 opened)

| frame | URL | one line |
|---|---|---|
| `hand/workbookdiff-390.png` | https://workbookdiff.com/ | At 390, the result's head (*10 detected changes · v1.xlsx -> v2.xlsx*) comes about 1,800 px down, under three cards. |
| `hand/datasette-facets-390.png` | https://latest.datasette.io/fixtures/facetable?… | At 390 the facets stack as counted lists. Opened, not cited. |
| `hand/weblate-changes-390.png` | https://hosted.weblate.org/changes/ | Title "Checking your browser": bot protection at 390. Not fought, not opened. |
| `hand/dockmaster-parts-load-390.png` | portal.dockmaster.com …/inventory-parts-load/ | Captured, not opened. |

## Real evidence (files, not frames)

- `src/domain/io/tableCsv.ts`: `CellChange { rowId, rowLabel, fieldId, columnName, from, to, value }`. Every changed cell is named by its column.
- `src/domain/io/newFile.ts`: `FileLine` keeps one `from`/`to` (the read figure) and a `figures` count, and `NewFilePlan.checkFirst` holds the lines to look at first.
- `package.json`: `react-virtuoso` ^4.18.0.
- Every figure about Parts Module (2) is the judge's (`docs/directions/data-round/shelf/judge.md`).

## Failed

| source | URL | why |
|---|---|---|
| DoltHub blog images, direct | https://static.dolthub.com/blogimages/new-diff-page/… and …/table_status_changes.png, …/diff_view_workbench.png | Each served as a download. The first four were taken as element shots of the blog page instead. The two Workbench images were not retaken. |
| Notion import picture | notion.com/_next/image?…import_image__1_.png (notion.com/help/import-data-into-notion) | Served as a download. The page shows only the menu of import sources, and says nothing about merging into a database. |
| QuickBooks exclude bank transactions | https://quickbooks.intuit.com/learn-support/en-us/help-article/banking/exclude-bank-transactions-quickbooks-online/L6S4hOSr2_US_en_US | `ERR_HTTP2_PROTOCOL_ERROR` to an automated browser. Not fought. |
| Dribbble shot pages | https://dribbble.com/tags/data-import (driven) | The page reloaded as "Loading…" when scripted. Treated as bot protection. Not fought. |
| Stripe manage prices | https://docs.stripe.com/products-prices/manage-prices | No interface pictures of a bulk price change. |
| Retool editable table | https://docs.retool.com/classic-apps/guides/data/table/edit-data | No interface pictures. |
| Shopify product import | https://help.shopify.com/en/manual/products/import-export/import-products | No picture of the import preview (as in round 1). |
| Linear import guide | https://linear.app/docs/import-issues | Only a picture of migration assistants, which has no shape for this screen. |
| Sublime Merge staging | https://www.sublimemerge.com/docs/staging | 404. |
| Tower chunk and line staging | https://www.git-tower.com/help/guides/working-copy/stage-changes/mac | Only a 532 px file-list picture, too small to show line staging. Not captured. |
| OSMCha, refero, mobbin | above | Sign-in required. Each frame is kept, and only OSMCha's is cited, as a failure. |
| Weblate at 390 | above | Bot check. |
| nicelydone, saasframe, saasinterface | above | 404 for an import tag or category. |
