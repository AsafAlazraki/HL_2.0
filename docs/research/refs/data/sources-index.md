# Data — sources index

Every source driven for the data-register sweep, 2026-09-22, headless Chromium `en-AU` via `tools/research/capture.ts`; `live/`, `live2/`, `tree/` and `prov/` at 1440 × 900, `hand/` at 390 × 844. Consent banners were answered with the most privacy-preserving control present; **nothing was signed in, nothing was typed into a form, and no bot protection was fought.** Frames are gitignored; the durable copies are mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\data\{live,live2,tree,prov,hand}\`.

**The earlier run of 2026-09-22 left nothing on disk** — no `refs/data/` folder and no `hl2/data` mirror existed when this run began — so every frame here is from this run. A row is a source driven, not a picture taken.

**The figures, counted from the files on disk 2026-09-22.** This index holds **59 rows** across five ledgers; **1 produced no frame** (`prov/pypi-hashes-open`, reason below); so **58 frames** are on disk, **56 distinct images**, and the mirror under `hl2\data\` holds the same 58. **39 frames were opened** with the Read tool (33 of this sweep's, six stock), against the budget of 45; the six `hand/` frames were read as two three-up tiles.

**Byte-identical pairs, each a finding:** `live/snowflake-databases` = `live/snowflake-databases-scrolled` (the page scrolls inside its own container, so the wheel step did nothing; the tree screenshot is at the top anyway). `live/kaggle-iris` = `prov/kaggle-iris-explorer` (the `/data` address renders the same Data Card; the explorer is a tab that needs a press).

**Refused, dead or occluded, with the reason:** `prov/pypi-hashes-open` — no frame; PyPI has renamed *view hashes* to *Details*, so the click timed out (re-driven in `live2/pypi-details-open`). `tree/partzilla-yamaha` — `Page Not Found`. `tree/boatsnet-yamaha` — Cloudflare *Just a moment…*, not fought. `tree/refero-file-browser` — the search ignored the query, printed six marketing home pages and *"74,921 more pages hidden · Log In or Sign Up"*. `tree/finder-views` and `tree/finder-column-view` — both guessed guide ids resolved to the Mac User Guide landing page; **Finder's column view is not evidenced in this sweep.** `live/baserow-template-live` and `live/kaggle-iris` carry a cookie banner the tool would not accept (Baserow *Got it*, Kaggle *OK, Got it*) — both frames are readable above it.

**Opened and found weak, so cited only for what they say:** `live/airtable-templates`, `live/airtable-interface-designer` and `live/tableplus` are marketing pages (the Airtable one carries a usable product shot); `live/airtable-record-detail`, `live2/airtable-record-detail-scrolled`, `live/notion-views`, `live/supabase-tables-scrolled`, `live2/supabase-tables-editor`, `live/bigquery-explorer-scrolled`, `live/linear-projects`, `live2/linear-projects-scrolled` and `tree/raycast-file-search` are documentation whose product screenshot sits below the fold or is a video. **Not opened** (the ledger title or the file size said text, a landing or a duplicate): `live/notion-templates`, `live/baserow-templates`, `live/supabase-db-overview`, `live/retool-database`, `live/retool-data-sources`, `live/nocodb-docs`, `live/bigquery-explorer`, `live/metabase-browse`, `live/linear-project-overview`, `live/directus-collections`, `live/beekeeper`, `live2/retool-database-scrolled`, `live2/directus-collections-scrolled`, `tree/gdrive-help`, `tree/dropbox-home`, `tree/coda-home`, `prov/npm-code-tab`, `prov/kaggle-iris-explorer`. Stock re-read for this screen: `ref/tables/supabase-table.png` (a docs page), `ref/tables/craft-docs-table-2.png` (Craft marketing), `customers/empty/baserow-home.png` (Baserow marketing), `customers/empty/notion-create-database.png` (a video thumbnail of a Projects Database with view tabs), `home/live2/github-repos-register.png` (a real register — cited in §4 of the notes).

## `live/` — 26 rows

| id | URL | one line |
|---|---|---|
| `airtable-templates` | airtable.com/templates | template gallery: bases as picture cards under use-case chips; an AI chat panel occludes the right third |
| `airtable-interface-designer` | airtable.com/platform/interface-designer | marketing; one product shot of a two-pane record review, a linked record drawn as a card with STATUS · LAST MILESTONE and *Add a record* |
| `airtable-record-detail` | support.airtable.com/docs/airtable-interface-layout-record-detail | plan/permission table and prose; the layout screenshot is below the fold |
| `notion-views` | notion.com/help/views-filters-and-sorts | a video thumbnail of *Projects Database* with view tabs All launches · Feed · Timeline · Status and *+ New item* as the last row |
| `notion-templates` | notion.com/templates | template marketplace, cards |
| `supabase-db-overview` | supabase.com/docs/guides/database/overview | docs landing, three-column |
| `supabase-tables-scrolled` | supabase.com/docs/guides/database/tables | the TABLE / COLUMN diagram with types in mono caps under each column; the dashboard shot begins at the fold |
| `retool-database` | docs.retool.com/database | docs landing (title *Retool Docs*) |
| `retool-data-sources` | docs.retool.com/data-sources | docs prose |
| `baserow-templates` | baserow.io/templates | gallery of live templates |
| `baserow-template-live` | baserow.io/templates/project-tracker | **a live public database**: tables as an indented list at the left of the grid, view bar with *1 Sort* and *1 hidden field* tinted, *8 rows* at the foot |
| `nocodb-docs` | nocodb.com/docs/product-docs → /docs/product | docs landing |
| `snowflake-databases` | docs.snowflake.com/…/ui-snowsight-data-databases → …/ui-snowsight-data | Horizon Catalog Explorer: DB › schema › *Tables* / *Views* / *Stages* / *Data Pipelines*, a glyph per kind, names truncated at the pane edge · **byte-identical to `-scrolled`** |
| `snowflake-databases-scrolled` | same | same frame |
| `bigquery-explorer` | cloud.google.com/bigquery/docs/bigquery-web-ui → docs.cloud.google.com/… | docs; not opened |
| `bigquery-explorer-scrolled` | same | scrolled past the Explorer screenshot to prose about menu sections |
| `metabase-browse` | metabase.com/docs/latest/exploration-and-organization/exploration | docs; not opened (re-driven scrolled in `live2/`) |
| `grist-raw-data` | support.getgrist.com/raw-data | **Raw data tables**: glyph · emoji · name, `TABLE ID: Breeders` small caps at the right, one `…` menu with *Remove*; the page "lists all data tables in your document and summarizes your document's usage statistics" |
| `grist-raw-data-scrolled` | same | the same list two rows deep: `TABLE ID: ALL_Contact_Information` under the name, `ROWS: 25` and `ROWS: 1,469` at the right; the *Duplicate Table* dialog with its warning sentence |
| `linear-projects` | linear.app/docs/projects | a project's overview: Properties · Initiatives · Labels · Resources · Customers as labelled chip rows, *Latest update · On track · dylan · 9d ago* |
| `linear-project-overview` | linear.app/docs/project-overview | docs; not opened |
| `hf-datasets-glue` | huggingface.co/datasets/nyu-mll/glue | **one dataset, twelve subsets**: `Subset (12) · ax · 1.1k rows ▾`, `Split (1) · test · 1.1k rows ▾`, column heads with type and a histogram, *Number of rows 1,485,043 · Total file size 162 MB* at the right |
| `kaggle-iris` | kaggle.com/datasets/uciml/iris | Data Card: title, one line, picture, tabs with counts *Code (8190) · Discussion (33)*, *Expected update frequency: Not specified* · **byte-identical to `prov/kaggle-iris-explorer`** |
| `directus-collections` | docs.directus.io/… → directus.com/docs/… | docs; not opened (re-driven scrolled in `live2/`) |
| `tableplus` | tableplus.com | marketing hero with a laptop render; the table sidebar is visible and unreadable at that scale |
| `beekeeper` | beekeeperstudio.io | marketing; not opened |

## `tree/` — 12 rows

| id | URL | one line |
|---|---|---|
| `finder-views` | support.apple.com/en-au/guide/mac-help/mchlp2606/mac → …/welcome/mac | guide landing; the id was a guess |
| `finder-column-view` | support.apple.com/en-au/guide/mac-help/mchl6b63a23e/mac → …/welcome/mac | guide landing; the id was a guess |
| `github-repo-root` | github.com/vercel/next.js | **the repo root**: `canary ▾ · 2704 Branches · 4057 Tags`, the latest commit as a head row (`cdecbe0 · 7 hours ago · 35,750 Commits`), then folder · last commit sentence in grey · age, 14 rows in 590 px; *About* at the right with *Releases 3,855 · v16.3.5 Latest* |
| `github-repo-tree` | github.com/vercel/next.js/blob/canary/package.json | **the file tree beside the file**: *Files* pane with a branch chooser and *Go to file*, rows at 32 px, the current file tinted with a blue bar; over the file a commit strip (`0927d3e · yesterday · History`) and `348 lines (348 loc) · 15.7 KB` |
| `raycast-file-search` | manual.raycast.com/file-search | a video; the text: matches "appear inline as you go", `↵` opens, `Ctrl K` the Action Panel |
| `gdrive-help` | support.google.com/drive/answer/2375057 | help prose; not opened |
| `dropbox-home` | dropbox.com/features/cloud-storage | marketing; not opened |
| `coda-home` | coda.io | marketing; not opened |
| `hf-model-tree` | huggingface.co/openai-community/gpt2/tree/main | **the best register anatomy**: `main ▾ · gpt2 · 5.63 GB`, `History: 26 commits`, a commit row with `607a30d` in a chip and VERIFIED, then rows of glyph · name · *Safe* chip · size right-aligned · `xet` chip · download · the commit sentence in grey mono · age; 13 rows in 500 px |
| `refero-file-browser` | refero.design/search?q=file%20browser | login wall; the query was ignored |
| `partzilla-yamaha` | partzilla.com/catalog/yamaha/outboard | `Page Not Found` |
| `boatsnet-yamaha` | boats.net/catalog/yamaha/outboard | Cloudflare wall, not fought |

## `prov/` — 8 rows, 7 frames

| id | URL | one line |
|---|---|---|
| `pypi-files` | pypi.org/project/requests/#files | *Release files*: sdist and wheel as two small tables of File · Size · Uploaded with a *Details* button per file, *Total release size: 215.9 kB* at the foot; no hash in the register |
| `pypi-hashes-open` | same | **no frame** — *view hashes* no longer exists |
| `hf-lfs-file` | huggingface.co/openai-community/gpt2/blob/main/model.safetensors | **the object's own page**: commit strip, an act row ending in `548 MB`, the sentence "This file is stored with Xet. It is too big to display, but you can still download it.", then *Xet Pointer Details* with `SHA256: 248dfc39…` in mono and a one-line explanation; a tensors tree with counts on every group head `h (12) › h.0 (3)` |
| `dockerhub-tags` | hub.docker.com/_/nginx/tags | the mark large at the head; a tag card with `docker pull nginx:trixie-perl` in mono and a table whose FIRST column is the 12-character digest as a link; `+5 more…` |
| `github-commits` | github.com/vercel/next.js/commits/canary | commits grouped under *Commits on Sep 22, 2026* on a timeline spine; a row is message · author · age · `✓ 122 / 127` · *Verified* chip · `cdecbe0` mono · copy · browse |
| `github-release-assets` | github.com/microsoft/vscode/releases/latest → …/tag/1.138.0 | `1.138.0 · Latest`, one line of facts with glyphs (*released this last week · 635 commits to main since · tag · 7debcd0 ✓*), *Assets 2* collapsible, each asset name · age |
| `npm-code-tab` | npmjs.com/package/react?activeTab=code | not opened |
| `kaggle-iris-explorer` | kaggle.com/datasets/uciml/iris/data | **byte-identical to `live/kaggle-iris`** |

## `hand/` — 6 rows, 390 × 844, read tiled three-up at native size

| id | URL | one line |
|---|---|---|
| `github-repo-390` | github.com/vercel/next.js | the sentence column is dropped: folder · name · age at 41 px, *View all files* as the last row, the tab row into `…`, one green *Code ▾* |
| `hf-tree-390` | huggingface.co/openai-community/gpt2/tree/main | the head stacks (chips, three full-width acts, tabs), then `main ▾ · gpt2 · 5.63 GB`, the commit card, rows of name · size · chip · download with the sentence dropped |
| `hf-glue-390` | huggingface.co/datasets/nyu-mll/glue | **six phone rows of chips before the tabs** — the chip wall as a phone failure |
| `baserow-template-390` | baserow.io/templates/project-tracker | the table list folds behind `»`, the name column stays pinned while the grid scrolls sideways, *8 rows* stays at the foot; cookie banner over the lower third |
| `grist-raw-390` | support.getgrist.com/raw-data | one column; the list screenshot shrinks to unreadable |
| `snowflake-390` | docs.snowflake.com/…/ui-snowsight-data | *On this page* and *Related content* fold into two disclosure buttons; the tree screenshot keeps native width |

## `live2/` — 7 rows, the second pass (scrolled documentation, and the PyPI dialog)

| id | URL | one line |
|---|---|---|
| `supabase-tables-editor` | supabase.com/docs/guides/database/tables | a dark video player paused on the Table Editor's empty state (*New table · Search · All tables › profiles* faintly at its left); five numbered steps |
| `airtable-record-detail-scrolled` | support.airtable.com/docs/airtable-interface-layout-record-detail → …/articles/5805061650-… | the scroll did not happen (the page scrolls in its own container); same content as `live/airtable-record-detail` |
| `retool-database-scrolled` | docs.retool.com/database | not opened |
| `metabase-browse-scrolled` | metabase.com/docs/latest/exploration-and-organization/exploration | **search results for "accounts"**: `5 RESULTS`, each a kind glyph · name · breadcrumb *Sample Database › PUBLIC · Created 19 days ago* · a one-line description in grey with a left rule; facets right (Content type · Creator · Last editor · dates), *Verified items only* |
| `directus-collections-scrolled` | docs.directus.io/… → directus.com/docs/… | not opened |
| `pypi-details-open` | pypi.org/project/requests/#files → #requests-2.34.2.tar.gz | **the file's own page**: *Release files / requests-2.34.2.tar.gz* as label · value rows — Download URL · Size · Tags · *SHA-256 checksum* (mono, bordered, copy control, *How to use checksums* under the label) · BLAKE2b · Upload date · *Uploaded using Trusted Publishing? Yes* · *Uploaded via `twine/6.1.0`* — then **Provenance**: "Provenance describes where a file came from" and an attestation card, "PyPI verified that this artifact, at this checksum, originated from the publisher listed below" |
| `linear-projects-scrolled` | linear.app/docs/projects | a video thumbnail and prose: "the only required field is the project name"; deleted projects sit "under the *Recently deleted projects* tab for 30 days" |
