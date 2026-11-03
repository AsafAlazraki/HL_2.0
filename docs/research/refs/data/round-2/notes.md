# Data, round 2: the sweep for the redraw

Driven 2026-11-03 for the judge's **redraw** (`docs/directions/data-round/data/judge.md`): the price file's *state* above its *inventory*. **58 sources · 57 frames · 52 opened · 2 stock frames opened**. The counts, refusals and URLs are in `sources-index.md`. Paths are relative to `docs/research/refs/data/round-2/`. Stock frames are relative to `docs/research/refs/`. A frame is cited only if it was opened.

**What round 1 did not use.** Round 1 (`../notes.md`) asked what the file *holds*: trees, registers, provenance strips and hashes. Every frame it drew from is inventory: `tree/github-repo-root`, `tree/hf-model-tree`, `live/hf-datasets-glue`, `prov/pypi-details-open`. It did not look for a period summary, a change log of data, a dataset's own dates, a checklist of what is missing, a find that answers in kinds, counted tabs as doors, or a phone that leads with state, and this round looked only for those. Before driving, every URL already in `refs/**/sources.json` (1,377) was listed and left out.

**The file's facts this round may draw on**, all from the judge's measurements (J1, J2, J6, J7, L1–L6):

- 53 lists and 15,691 lines.
- 28 lists of what fits which boat, holding 8,679 lines.
- 4 lists that no boat names, holding 311 lines.
- 25 section headings that carry an "as at" date. The oldest is 19/5/2022.
- One `packedAt`, with every row's `updatedAt` equal to it (2026-09-16T08:16:21Z). On the file as loaded fresh, therefore, **0 lines have been changed by Northside**.
- Review: 37 to settle.
- Catalogue: 2,937 products.

Every other figure below is quoted from the judge or from round 1's notes.

## 1. What is genuinely best, and why

**State before inventory: a period summary, counted, then the lists.** `live/github-pulse.png` is the best single frame for this screen. It opens with a date range and a period chooser. Under them, an *Overview* card puts four counted cells beside each other (*125 Merged · 106 Open · 48 Closed · 22 New*). Next comes one *Summary* sentence with its figures in bold: *39 authors have pushed 126 commits … 36,790 additions and 7,913 deletions*. Only after that (`live/github-pulse-scrolled.png`) do the lists come, each under a ruled head that is a sentence: *125 pull requests merged by 25 people*. That is L1, L2 and L4 together. Ours: *Since the price list of 16 September 2026* · cells for *37 to settle* (Review), *lists no boat names: 4 · 311 lines*, *sections dated before the file: 25* and *lines Northside changed: 0* · then the lists.

**A data change said with its numerator and denominator.** `shelf/live/dolthub-pull-compare.png` (stock) prints *0 Rows Deleted 0.00% · 0 Rows Added 0.00% · 32 Rows Modified 0.44% · 39 Cells Modified 0.01% · 7,199 Rows Unmodified 99.56%*. A *Diff Overview* pane at the left gives each table one line (*hospitals −0 +0 32*). That is J7's missing shape: Northside's own changes by list, each with its numerator and denominator. `live/dolthub-repo.png` states its staleness in the head: *updated 4 years ago · 70.2 MB*.

**A dataset's own dates, kept apart.** `live/nyc-open-data.png` keeps three dates apart. *Updated* sits over a large date. Under it are *Data Last Updated* and *Metadata Last Updated* side by side, then *Date Created* and *Update Frequency: Daily* in a labelled table. `live/nyc-open-data-scrolled.png` then answers "what is in it" in one card: *Rows 2.3M · Columns 29 · Each row is a Motor Vehicle Collision*. For J1 this splits "the file's date" (packedAt), "Northside's last change" (the newest updatedAt after it) and "how current the prices are" (the as-at headings). `live/datagovuk-price-paid.png` gives every data link its own **Updated** column. That is where the 25 as-at headings belong: a date where the heading carries one, none where it does not.

**What is missing as a checklist of doors.** `live/github-insights-community.png` reads *Here's how this project compares to recommended community standards*, then a progress bar, then rows. A present item has a tick and a link. A missing one has a dot and plain text. This is the "what needs Northside" band (L1) drawn as a list a dealer can finish. Each row is a door with its count, and a finished row turns to a tick rather than vanishing. `review/live2/gh-security-overview-img.png` (stock) adds the date beside the figure: *156,127 ↑28.9% as of Sep 18, 2024*. Ours prints the date and leaves out the arrow (§4).

**One find, answered in kinds.** `live/github-search-facets.png` answers *outboard* with a *Filter by* column of kinds, each counted (*Repositories 171 · Issues 2.1k · Pull requests 2.7k · Discussions 79*), the current kind tinted and barred. `live/mdn-search.png` prints *Found 437 documents* and puts each result's kind as a small breadcrumb over its title. That is J5's cure. *Highfield* answers *Makers 1 · Lists of what fits 5 · Sections …* with counts from the readers, and the plates narrow with it. Drawn under the field, it ends the false "Nothing … is called 'Highfield'".

**Counted tabs as doors.** `live/npm-versions.png` sets its tabs as *0 Dependencies · 217222 Dependents · 2,999 Versions*, each in its own ink, and a zero is printed rather than hidden. At 390 (`hand/npm-versions-390.png`) they become five full-width rows, each with a coloured edge. That is L4: the six rooms as doors saying what is inside them.

**The zero said as a figure.** `live/wiki-page-info.png` prints *Recent number of edits (within past 30 days) 0* under *Total number of edits 4,896*. So *Lines Northside has changed since 16 September 2026: 0* is a figure, not an absent band.

## 2. The interaction patterns worth taking, named

The six in §1 are named there: **the period summary** (`live/github-pulse.png`, its period the file's own, *since 16 September 2026*, never a chooser, since a "Period: 1 week" would be invented), **the diff census** (`shelf/live/dolthub-pull-compare.png`, pressed per list onto its sheet filtered to the changed lines), **the three dates** (`live/nyc-open-data.png`), **dated rows** (`live/datagovuk-price-paid.png`), **the answer in kinds** (`live/github-search-facets.png`, `live/mdn-search.png`) and **the counted door** (`live/npm-versions.png`). Four more:

**The "since" line.** `live/wiki-recentchanges.png`: *View new changes since 04:59, 3 November 2026* above *50 changes, 1 day ▾*. Rows go newest first under day heads, each with a signed delta, green or red, bold when large (*(+14,010)*). Ours: the price moved.

**The standards checklist.** `live/github-insights-community.png`. A progress bar over it is honest only where a denominator exists: Review has one (cases settled of cases raised), and the dated sections have one only as *25 of the 222 headings in the five lists that date any* (judge L1).

**Last operations.** `live/akeneo-dashboard-widgets-2.png`: *your latest imports, your latest exports, your latest updates* as Date · Type · Who · Status chip · Warnings, with *VIEW ALL*. This is Shelf's door: the last price list brought in, and the last backup made. If neither has happened, it says so in one sentence, as `live/akeneo-dashboard-widgets.png` does: *You have no current project, create a new project.*

**The fitment door.** `live/crutchfield-outfit.png`: *Find what ✓ Fits your vehicle* with a chooser in place of an arbitrary first item. That is J9 and L15. Fitment from a maker should offer a choice of boat, and never open the first boat in file order.

## 3. Type and motion, as observed

- **Figure over label, or label over figure, never both in one band.** GitHub Pulse sets the count bold at body size, then its label in grey beneath, with a coloured glyph before the count (`live/github-pulse.png`). Plausible sets a small-caps label over an 18 px figure (`live/plausible-public.png`). NYC sets *Updated* small over a 24 px coloured date (`hand/nyc-open-data-390.png`).
- **Ink carries meaning.** DoltHub colours only the census number (red deleted, green added, grey unmodified) and keeps the word plain (`shelf/live/dolthub-pull-compare.png`). Wikipedia does the same for byte deltas, bold past a threshold (`live/wiki-recentchanges.png`). npm gives each counted tab its own ink and a matching underline (`live/npm-versions.png`).
- **A sentence carries the summary** (`live/github-pulse.png`), and our register already writes sentences.
- **Motion.** Fifty-four stills prove none. The two live cues are a *Live updates* button that pulls rather than pushes (`live/wiki-recentchanges.png`) and a green dot beside *49 current visitors* (`live/plausible-public.png`). The price file changes when someone acts, so the state band moves only when a count changes. A count that changes swaps in place under reduced motion, and the judge's L16 (a ≈1 s stagger) stays fixed.

## 4. What to avoid, each with its frame

- **Trend chips without history.** `live/plausible-public.png` puts *↗61%* on every figure, and `review/live2/gh-security-overview-img.png` *↑28.9%*. Our file has one `packedAt` and no earlier file, so any arrow would be invented. Print *as at* dates, not deltas.
- **A greeting and an illustration where the state goes.** `live/akeneo-dashboard.png` opens with *Hello Julia! Glad to see you here.* and a portrait over the figures.
- **Encouragement in place of a figure.** `live/akeneo-dashboard.png` prints *You still have some work to do, but you're on the right path.* under a 1 % bar. Ours says the figure and its door.
- **The nav before the state on a phone.** `hand/github-pulse-390.png` stacks eight Insights links as full rows above the period, so the state starts at y ≈ 520. The judge measured our own version of this (lists at y 1,426).
- **Names broken letter by letter.** `hand/wiki-recentchanges-390.png` keeps a legend box at half the measure, and the page names break into single letters.
- **A chip wall of colours.** `live/github-labels.png` gives 89 chips 89 inks. A list keeps its kind's one accent.
- **Marketing standing in for a back office.** `live/boatwizard.png`, `live/dealerrock.png`, `live/ids-astra.png` and `live/tekion.png` all show heroes and unreadable laptop renders. **No marine or car dealer back office shows its price-file screen without signing in**, so none is a reference here. DealerRock's rooms in caps (*SALES + SERVICE + PARTS*) are the strip of words the judge faults.
- **Galleries behind a wall.** `gallery/saasframe-dashboards.png` shows three examples and then *Upgrade … to see 186 more*. `gallery/saasinterface.png`, `gallery/nicelydone.png` and `gallery/mobbin-web.png` are landing pages.

## 5. Three directions, each owing the same floor

**Every board owes** the judge's three fixes (no sideways scroll on the OBSOLETE spread at 390, *Make it* with no name refused in a sentence, the spread clear of the floating bar at 844×390); the spread's content, `register.ts` counting, the one write with Undo, the keyboard and reduced motion; every figure from an existing reader plus one tested pure parser in `src/domain` for the headings' own "as at" text; a reflow at six sizes; and two references no earlier board used (round 1's are all excluded).

**A — "The Monday page."** One column, top to bottom:

1. The head: the file and its three dates.
2. **Needs Northside**, a checklist. Each row is a tick or a dot, a sentence, its figure with a denominator, and a door: *37 to settle* → Review; *4 lists no boat names · 311 lines* → those lists; *25 sections priced as at an earlier date, oldest 19/5/2022* → those sections on the sheet; Prices left undecided → Prices; rules refusing something on sale → Rules.
3. **New since 16 September 2026**: the diff census per list. On the file as loaded fresh it reads *0 lines changed*, said as a figure, with the lists made here counted beside it.
4. The six rooms as counted doors.
5. The holdings: makers as a compact strip, and the 18 base lists and 28 lists of what fits as rows with their counts.

**Exclusive to A:** `live/github-insights-community.png` and `live/wiki-page-info.png`. **Only A makes the work the first thing on the page and turns a finished item into a tick.**

Reflow:
- 1920: the checklist and the census side by side over a full-width ledger, which fills the judge's 22 % empty floor.
- 834, 1280 and 1440: one column, the state above the fold.
- 844×390: the head and the checklist only, then the rest.
- 390: the head, the checklist as rows, the rooms as `hand/npm-versions-390.png` rows, then the lists, with the spread opening at the row pressed.

**B — "The file's About."** The price file drawn as a published dataset:

- The title, then **Updated** in large type with *the file's date · Northside's last change · the oldest as-at* beside it (`live/nyc-open-data.png`).
- One census card: *Lists 53 · Lines 15,691*, with what a line is said in the file's own nouns (`live/nyc-open-data-scrolled.png`).
- One table of every list. Each row has its kind, its line count, what it fits, **its oldest as-at date (blank where its headings carry none)**, Northside's changes to it, and its Review cases. The 28 fitment lists are rows grouped under their maker.
- The rooms are the page's tabs, counted.

**Exclusive to B:** `live/nyc-open-data.png` and `live/datagovuk-price-paid.png`. **Only B gives every list its own date and its own state in a column**, so the 1440 and 1920 rows are full where today their right half is blank (L11).

Reflow:
- 1920 and 1440: all columns.
- 1280: the as-at and the changes merge into one *state* cell.
- 834: name · lines · state.
- 844×390: the census card in one row, then the table at 834's columns.
- 390: the census card, then rows of name and state, with dates under the name. The tabs become one select, as in `hand/dolthub-repo-390.png`.

**C — "Find, then pulse."** The find is the head, full width, over the whole file. When the field is filled, the page is the answer: kinds counted at the left (*Makers · Lists of what fits · Sections · Lines*), each result with its kind over its title, and the plates narrowed. A line answer (*F115*) carries a pointer to its sheet and to the Catalogue, which closes J10's dead end. When the field is empty, the page is a **Pulse** for *since 16 September 2026*: four counted cells (to settle · undecided · changed by Northside · made here), one sentence with bold figures, then the lists under sentence heads (*28 lists of what fits, 8,679 lines across 7 makers*).

**Exclusive to C:** `live/github-search-facets.png` and `live/github-pulse.png`. **Only C answers "where is it" and "what changed" at the head.** Its risk: needs read as figures, not doors, so the board shows each cell pressed.

Reflow:
- 1920: kinds at the left, the answer, and the Pulse at the right.
- 1280 and 1440: kinds at the left and the answer; the Pulse above the lists when the field is empty.
- 834 and 844×390: the kinds as a counted chip row over the answer.
- 390: the field sticky, kinds as one counted select, the cells two-up (`hand/plausible-390.png` holds its whole state in the first window).

**A direction the sweep suggests and does not draw:** a metrics dashboard of trend tiles and a chart (`live/plausible-public.png`). Rejected: every row shares one `updatedAt`, so a chart would plot one point.

## 6. The imagery question

Nothing in this round changes round 1's answer (`../notes.md` §6). A list depicts many models, so its only honest picture is its maker's mark, which 14 of the 25 base lists have and none of the 28 lists of what fits. Every frame that leads with state is typographic (GitHub, NYC Open Data, DoltHub, Wikipedia, npm), its colour an ink on a figure. The one photograph-led frame is `live/datagov-au.png`, whose aerial hero pushes *141,350 datasets found* below 690 px, and it is the failure. Crutchfield's vehicle outlines (`live/crutchfield-outfit.png`) signal a kind without depicting a model. Where a maker's spread wants a cover, the heroes ledger's on-water photographs (4 Highfield, 4 Stacer) are the only honest ones (judge L13). A maker with none draws no cover.
