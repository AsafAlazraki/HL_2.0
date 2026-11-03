# Data, round 2 — sources index

Driven 2026-11-03 for the Data redraw (`docs/directions/data-round/data/judge.md`), headless Chromium `en-AU` through `tools/research/capture.ts`. `live/` and `gallery/` at 1440 × 900, `hand/` at 390 × 844. Consent banners were answered with the most privacy-preserving control present. **Nothing was signed in, nothing was typed into a form, and no bot protection was fought.** Frames are gitignored; the durable copies are mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\data\round-2\{live,gallery,hand}\`. Each folder's `sources.json` records the date, the final URL and the page title of every row.

**Counted from the ledgers:** 58 rows (41 `live` · 11 `gallery` · 6 `hand`), 57 frames on disk (one row produced no frame), 0 byte-identical pairs (md5 over all 57). **52 frames were opened** with the Read tool: 18 one at a time, and 34 in nine tiles built with `sharp` (the six `hand/` frames three-up at native size, the rest two-up at half scale). Two stock frames from other sweeps were opened for the notes: `review/live2/gh-security-overview-img.png` and `shelf/live/dolthub-pull-compare.png`. That makes 29 Read calls in all.

**Every source here is new to the Data sweep.** Before driving anything, the 1,377 distinct final URLs in every `docs/research/refs/**/sources.json` were listed, and anything already captured was left out. The only overlap is the DoltHub repository: `shelf/` captured one pull request's compare, and this round captures the repository home and the commit log.

**Refused, dead or not what was asked, with the reason:**
- `live/yamaha-outboard-parts`: no frame, `ERR_CERT_COMMON_NAME_INVALID`.
- `live/wikidata-constraints`: the constraint report now says *Login required*. Not signed in.
- `live/garmin-transducers`: Garmin's own *ERROR 404*. The address was a guess.
- `live/osm-history` and `live/osm-history-brisbane`: both addresses landed on the map with the *Welcome to OpenStreetMap!* panel, and no changeset list appeared. **OSM's history list is not evidenced.**
- `live/bigcommerce-price-lists`: the article page redirected to a force.com record stub with *Author · Article Status · Record Locked*, and no content.
- `live/shopify-search`, `live/vercel-project-dashboard` and `live/notion-home`: each redirected to a parent page (*Productivity tools*, *Projects overview*, *Navigate Notion with the sidebar*). They are kept, but the notes do not cite them.
- `gallery/saasframe-*`: the site shows three examples and then *Upgrade to SaaSFrame Pro now to see 186 more Dashboard examples*. `gallery/saasinterface` and `gallery/mobbin-web` put their galleries behind *Access The Gallery* and *Join for free*. Not signed in.

**Captured but not opened:** `gallery/land-book`, `gallery/lapa` and `gallery/siteinspire`. Their ledger titles say they are landing-page galleries, not admin screens. The two failures above with titles only (`wikidata-constraints`, `garmin-transducers`) were not opened either.

## `live/` — 41 rows, 40 frames

| id | URL | one line |
|---|---|---|
| `github-pulse` | github.com/vercel/next.js/pulse | **A week as state.** *October 26 – November 2, 2026* with *Period: 1 week ▾*. An Overview card has two split bars (*231 Active pull requests*, *70 Active issues*) over four counted cells (*125 Merged · 106 Open · 48 Closed · 22 New*). Then a *Summary* sentence with its figures in bold (*39 authors have pushed 126 commits … 36,790 additions and 7,913 deletions*), and the repo's tabs carry counts (*Issues 1.1k · Pull requests 2.7k · Security and quality 72*) |
| `github-pulse-scrolled` | same | the lists under a ruled head that is a sentence: *10 releases published by 2 people*, *125 pull requests merged by 25 people*. Each row is a title with `#100950 merged 1 hour ago` beneath |
| `wiki-recentchanges` | en.wikipedia.org/wiki/Special:RecentChanges | a register of changes under a day head (*3 November 2026*). Each row is time · page · `(diff \| hist)` · a byte delta in green or red, bold when large (*(+14,010)*) · who · why. Above it are *View new changes since 04:59, 3 November 2026* and *50 changes, 1 day ▾*, active filters as removable chips, and a legend box of abbreviations |
| `osm-history` | openstreetmap.org/history → /#map=5/… | the map and the welcome panel; no history |
| `nyc-open-data` | data.cityofnewyork.us/…/h9gi-nx95/about_data | **A dataset's About.** The title and one paragraph, then at the right *Last Updated November 3, 2026* and *Data Provided By*. Under *About this Dataset*: *Updated* over a large date, then *Data Last Updated · Metadata Last Updated* side by side, *Date Created April 29, 2014*, *Views 963K · Downloads 409K*, and a labelled table with *Update Frequency: Daily* |
| `nyc-open-data-scrolled` | same | *What's in this Dataset?* is one card: *Rows 2.3M · Columns 29 · Each row is a Motor Vehicle Collision*. Under it, *Columns (29)* as Name · Description · API Field Name · Data Type, and an attachment with a verified tick |
| `plausible-public` | plausible.io/plausible.io | a public live dashboard: *49 current visitors* with a green dot, six metric cells in small caps over figures with period-change chips (*703k ↗61%*), a line chart, then two panels with tabs (*Sources*, *Top pages*), each row lit by a proportional bar behind it |
| `linear-pulse` | linear.app/changelog/2025-04-16-pulse | the launch note for Pulse, *a personalized feed for what's happening across your company*; the product shot sits below the fold |
| `shopify-home` | help.shopify.com/en/manual/shopify-admin/shopify-home | Home's contents (*Order tasks · Home cards · Insights*) and a *Metrics on Shopify Home* section saying a new store sees setup tasks before its metrics. Text only |
| `akeneo-dashboard` | help.akeneo.com/…/discover-the-dashboard-in-details | **A catalogue admin's home.** Under *Hello Julia! Glad to see you here.* and an illustration: *PROJECTS* as *Todo 0 · In progress 1204 · Done 34*, each with a link (*97% products in progress*); then *COMPLETENESS OVER CHANNELS AND LOCALES* as thin bars with a percentage and a sentence (*You still have some work to do, but you're on the right path.*) |
| `akeneo-dqi` | help.akeneo.com/…/manage-your-data-quality | a settings toggle and steps; text, no dashboard |
| `npm-versions` | npmjs.com/package/react?activeTab=versions | **Counted tabs as doors.** *Readme · Code · 0 Dependencies · 217222 Dependents · 2,999 Versions*, each in its own colour and underline. *Current Tags* as Version · Downloads (Last 7 Days) · Tag, and a side column with *Last publish 3 days ago* |
| `dolthub-repo` | dolthub.com/repositories/dolthub/standard-charge-files | a versioned database: *updated 4 years ago · 70.2 MB* under the name, tabs (*Database · About · Commit Log · Releases …*), the tables in a left pane with *Add new table* |
| `dolthub-commits` | …/commits/main | *Commits from 4 years ago* on a spine; each card has a message, *who committed 02/05/2023, 11:42 am*, and the hash at the right |
| `datagov-au` | data.gov.au/data/dataset?sort=metadata_modified+desc | a photographic hero, then *141,350 datasets found* with *Order by Last Modified* |
| `bigcommerce-price-lists` | support.bigcommerce.com/…/Price-Lists | a force.com stub (see above) |
| `shopify-import` | help.shopify.com/…/import-products | prose and a video thumbnail; the import preview is not in the frame |
| `shopify-search` | → help.shopify.com/…/productivity-tools | a section index (see above) |
| `vercel-project-dashboard` | → vercel.com/docs/projects | prose (see above) |
| `notion-home` | → notion.com/help/navigate-with-the-sidebar | sidebar help (see above) |
| `retool-templates` | retool.com/templates | template cards with illustrations; *Admin Panel · Dashboard* under use cases |
| `datafold-diff` | docs.datafold.com/data-diff/what-is-data-diff | a diagram of two tables matched row by row, with ticks, crosses and a *mismatch* chip between them |
| `crutchfield-outfit` | crutchfield.com/car/carselector.aspx | **A fitment door.** *Find what ✓ Fits your vehicle*, with *Fits* in green beside a tick, two choosers (*Please Select Year*, *Please Select Make*), and a frieze of vehicle outlines that includes boats |
| `yamaha-outboard-parts` | yamahaoutboardparts.com | no frame (certificate error) |
| `github-search-facets` | github.com/search?q=outboard&type=repositories | **One find answered in kinds.** *Filter by* lists each kind with its count (*Repositories 171 · Issues 2.1k · Pull requests 2.7k · AI resources 43 · Discussions 79*), with the current kind tinted and barred. The head reads *171 results (179 ms)*, and each result carries *Updated on 30 Nov 2019* |
| `mdn-search` | developer.mozilla.org/en-US/search?q=grid | *Found 437 documents*. Each result has its kind as a small breadcrumb over the title (*Glossary*, *CSS / How to / Layout cookbook*), with the matched word highlighted in the excerpt |
| `boatwizard` | boatsgroup.com/boatwizard | a marine back office's marketing: a wordmark hero; the product shot is a small laptop render |
| `ids-astra` | ids-astra.com | a marine and RV DMS's marketing hero with a photograph; no product |
| `tekion` | tekion.com | a car DMS's marketing hero; no product |
| `dealerrock` | dealerrock.com | a marine and RV DMS: a product montage too small to read, over a strip of the rooms in caps (*SALES + SERVICE + PARTS + INVENTORY + CRM …*) |
| `plytix` | plytix.com | a PIM: a product grid shot and an AI card that says *1,255 products have been updated* over a *Review changes* button |
| `salsify` | salsify.com | marketing hero and video |
| `akeneo-dashboard-widgets` | as `akeneo-dashboard`, scrolled | the projects widget (*Todo 0 · In progress 186 · Done 0*) and its empty sentence (*You have no current project, create a new project.*) |
| `akeneo-dashboard-widgets-2` | same, further | **Last operations**: *your latest imports, your latest exports, your latest updates*. A table of Date · Type · Profile name · Username · Status (*COMPLETED* chip) · Warnings, with *VIEW ALL* and *DETAILS* |
| `datagovuk-price-paid` | data.gov.uk/dataset/…/archived-price-paid-information-residential-property-1995-2017 | *Publisher · Updated 8 October 2025 · Topic · Licence* as a labelled list, then *Data links* headed *Link · Format · Preview · Updated*, a date on every file |
| `wikidata-constraints` | wikidata.org/wiki/Special:ConstraintReport/Q42 | *Login required* |
| `wiki-page-info` | en.wikipedia.org/w/index.php?title=Boat&action=info | **A page's facts as labelled rows.** *Edit history*: creator, *Date of page creation 22:53, 3 August 2001*, *Date of latest edit 09:52, 10 June 2026*, *Total number of edits 4,896*, *Recent number of edits (within past 30 days) 0*. A zero is printed as a figure |
| `osm-history-brisbane` | openstreetmap.org/history#map=13/-27.4698/153.0251 | Brisbane's map and the welcome panel; no history |
| `garmin-transducers` | garmin.com/en-AU/c/marine/transducers | *ERROR 404* |
| `github-insights-community` | github.com/vercel/next.js/community | **What is there and what is missing.** *Here's how this project compares to recommended community standards*, a progress bar, then a checklist. A tick and a link marks what exists (*README · Code of conduct · Contributing · License · Security policy*). A dot and plain text marks what is missing (*Issue templates*) |
| `github-labels` | github.com/vercel/next.js/labels | *Active 89 · Archived 0* as a counted switch; each label is a coloured chip with its sentence and an open-item count at the right |

## `gallery/` — 11 rows

| id | URL | one line |
|---|---|---|
| `saasframe-dashboards` | saasframe.io/categories/dashboard | *Dashboard 189*: three thumbnails (Wise, Mintlify, June), then the paywall |
| `saasframe-tables` | saasframe.io/categories/table | *Table 89*: three dark thumbnails (Moss, Dub), then the paywall |
| `saasframe-current` | saasframe.io/examples/current-dashboard | one feed dashboard with an empty-state card; tagged *Empty State · Skeleton Screen* |
| `saasinterface` | saasinterface.com | landing page; the gallery is behind a button |
| `nicelydone` | nicelydone.club | landing page, *Explore 219,344 screens*; sign-in to browse |
| `mobbin-web` | mobbin.com/browse/web/apps → /?redirect_to=… | landing page, *Join for free* |
| `land-book` | land-book.com | not opened |
| `lapa` | lapa.ninja | not opened |
| `siteinspire` | siteinspire.com | not opened |
| `awwwards-dashboard` | awwwards.com/websites/dashboard | dashboard concept shots, chiefly devices on gradients; a cookie notice the tool would not accept |
| `recent-design-interface` | recent.design | a typographic and poster wall; no admin |

## `hand/` — 6 rows, 390 × 844, read three-up at native size

| id | URL | one line |
|---|---|---|
| `github-pulse-390` | github.com/vercel/next.js/pulse | the tabs fold into *More ▾*, but the eight Insights links stack as full rows **above** the period, so the state starts at y ≈ 520 |
| `wiki-recentchanges-390` | en.m.wikipedia.org → en.wikipedia.org/…/RecentChanges | the legend box takes half the measure, and page names break letter by letter (*W / u (region)*) |
| `nyc-open-data-390` | data.cityofnewyork.us/…/about_data | the tabs stay, and the card keeps *Last Updated November 3, 2026* beside the provider. *About this Dataset* opens with *Updated* and a 24 px date, then the three dated rows |
| `plausible-390` | plausible.io/plausible.io | six metric cells, two-up, then the chart full width; the whole state is in the first window |
| `dolthub-repo-390` | dolthub.com/…/standard-charge-files | *updated 4 years ago · 70.2 MB* stays under the name, and the tab row becomes one select (*About ▾*) |
| `npm-versions-390` | npmjs.com/package/react?activeTab=versions | the counted tabs become five full-width rows, each with its own coloured edge, and the table follows |
