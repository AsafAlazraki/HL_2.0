# The document (the issued quote, on screen and on A4) — the sweep

Driven 2026-09-17. **93 sources driven · 88 frames written · 5 failed outright**, plus **4 crops** cut from frames already taken (`sharp`, `*-crop.png`). Of the 88, **37 landed on a 404, a block, a bot wall or a maintenance page** — five caught only by opening the picture, because the page returned a live-looking `<title>` (`live/polestar-4-design`, `live/collectingcars-lot` and three more, listed in `sources-index.md`). So this rests on **51 live frames + 4 crops** and **20 stock frames re-read** under `C:\Users\Asaf\dev\hl-refs\ref\`. Live frames: `docs/research/refs/document/live/` (gitignored, mirrored to `…\hl-refs\hl2\document\live\`); URLs in `sources-index.md`. **43 frames were opened; only those are cited.**

The job: a cover with the boat, the price beside who it is for, sections as tables, the dealer's terms, a print pixel-faithful to the screen. The app's refusals: cost never reaches this surface, the issued figure never animates, every line renders from what was frozen at issue.

## 0. The stock answered most of this — and one piece is broken

`configurator-teardowns-2026.md` names the gap: *"Mercedes' `Copy Link to Build` + PDF is the dealer leave-behind artefact we do not have."* This is that artefact. Two corrections, made by looking:

1. **`ref/porsche-summary.pdf` is truncated** — no `%%EOF`, 247 KB, pdf.js refuses it; `live/porsche-summary-pdf.png` is the grey "rendering…" frame that proves it. The stock has **one** working Porsche PDF (`porsche-configuration.pdf`, 15 pages, 6 captured as `porsche-pdf-1..6`), not two.
2. **Three of the stock's `tables/` "spec" frames are 404 pages** — `tables/axopar-specs`, `tables/porsche-compare`, `tables/stabicraft-specs`. No board may cite them about setting a table.

## 1. What is genuinely best for this section

**Porsche's configuration PDF is the target and it is A4.** `porsche-pdf-1..6` are 952 × 1347 px — ratio **1.415** against A4's 1.414. The cover (`porsche-pdf-1`): a ghosted `911` behind a side-elevation render on a pale panel; the name centred; a `2027` pill; one line of promise; the code; **the link that resolves the code**; a date pill. Then a rule, `Summary` centred, one money row — `Your 911 Carrera Configuration` against `Price for equipment` / `$0.00` — and a ~6 pt asterisk paragraph. **The lower 35 % of the cover is deliberately empty.**

**The section table** (`porsche-pdf-2`): Category · Option · Option code · Price. The category is bold in the left column and **not repeated** on the rows beneath it; a ~28 px thumbnail sits beside the option name; the code is grey, right-aligned; the price is right-aligned and, where there is none, the cell reads **`Standard Equipment`** — never `$0.00`, never a dash. Three sections fit page 2; page 3 (`porsche-pdf-3`) carries **three rows and 900 px of white**. The document does not pack. The unpriced half (`porsche-pdf-5`, `-6`) is a different object — no table, bold group heads over a hairline, square bullets, ~40 lines a page.

**The screen half** (`porsche-summary-a..d`): the left column scrolls a hero card then *Your selected equipment*, each section head carrying a count chip (`Technology 11`); each row is thumbnail · name · ⓘ · code · price-or-`Standard Equipment` · `Change ›`. The right rail holds the price under its own label, `Calculate Driveaway Price`, **Select a dealer / Save / Create Porsche Code**, then **Download configuration (PDF)** and **Load existing configuration** as text links. And `porsche-print-options` answers "one page or six": a modal, *Select PDF content*, five ticked boxes — Prices · Selected equipment · Standard Equipment · Technical Data · Vehicle images — and one black **Create PDF**. The length is a control, not a guess.

**GOV.UK publishes the rules the rest only demonstrate** (`live/govuk-check-answers`, `-summary-list`, `-confirmation`). A confirmation page *"must include: a reference number, if there is one; details of what happens next and when; contact details for the service; links to information or services that users are likely to need next; **a way for users to save a record of the transaction, for example, as a PDF**"*. A summary is two-thirds wide *"so the action links are closer to the other content… Users with screen magnifiers are less likely to miss them"*. And: *"If you have questions that are optional, let users know they've skipped it… by showing their response as 'Not provided'."*

**Stripe is the best transactional document on the web.** `live/stripe-hosted-invoice-docs` puts the amount first at ~34 px, the due date under it, `To / From / Memo` as a label-value block, the itemisation one link away. `live/stripe-group-line-items`: *"you can hide groups of line items… if some are excessively detailed: you can configure it so that only their **group-level subtotal** is visible."* `live/stripe-rendering-templates` names what our frozen renderer is.

**The marine register, which nobody here had read.** `live/saxdor-brochure-pdf` and `-late` are the Saxdor 320 GTC's own 17-page A4 brochure through pdf.js: a running head (`320 GTC` left, the mark right) over a full-bleed photograph; story spreads whose caption column is **anchored to the bottom** of a two-thirds-empty white half; whole pages of photograph with no type; then page 12, `LAYOUTS & SPECS` — eleven hairline rows at ~55 % page width, label light, value at a fixed indent, lower third white (`live/saxdor-brochure-specs-crop`). The model page repeats it on screen (`live/saxdor-specs-crop`): a 4 × 3 fact grid, both unit systems in every figure (`10.28 m / 33 ft 7 in`), its own footnote; and the qualifier the trade already writes (`live/saxdor-pricing-crop`): `€163 000*` · *"\*Starting price with two Mercury 200 hp V6 engines (excl. VAT…)"*.

## 2. The patterns worth taking, named

**The price that says what it is a price for.** Porsche writes `Price for equipment*`, not `Price` (`porsche-pdf-1`); Saxdor names the exact engines behind its starting figure (`live/saxdor-pricing-crop`). Ours prints the rung's name and the tax convention beside the figure, always.

**Standard is not $0.00.** `porsche-pdf-2` keeps three states in one right-aligned column: a figure, `Standard Equipment`, a `Basic equipment` chip on the row it qualifies. `ConflictLine.to: number | null` already means "not priced here"; this is how it draws. The fourth state — a section never entered — is GOV.UK's written **'Not provided'** (`live/govuk-check-answers`), not an absent row.

**The band head carries the subtotal.** `live/qwilr-interactive-quote-crop`: a dark band reading `Add-ons`, a chevron, `SUBTOTAL $750.00` at its right, `Description | Item | Price` beneath. Adopt the band; **reject the per-row checkbox** — an issued line cannot be unticked.

**The arithmetic printed under the name.** `live/stripe-billing` sets `API requests` / `10,000 × A$0.0023/request` / `A$23.00`, then `Estimated monthly total: A$54.45` at the foot. A rig kit at `qty × unit` reads its own sum, so the total is auditable — `price-framing-and-bundles.md`'s lesson from Sonos's five broken savings.

**The Change link that names what it changes.** `live/govuk-summary-list` (key · value · `Change`, hairline between, no vertical rules) plus the published requirement that its hidden text says *what* it changes. Porsche's `Change ›` (`porsche-summary-b`) is the same control unnamed. On an issued quote each of ours is a refusal with a sentence.

**The reference, twice: in the panel and in the foot.** `live/govuk-confirmation` sets `Your reference number HDJ2123F` in a solid block as the second-largest thing on the page; `porsche-pdf-1..6` repeats `Porsche Code: PV84NJR4` left and the page number right on **every** page, and the cover states it as a resolvable URL.

**The superseded document says so, and offers the way on.** `live/yachtworld-boat-detail`: *"This listing is no longer available. To help you continue your search, we've curated similar listings…"* — what `QuoteDef.supersedesId` needs.

**Turn the cell borders off first.** `live/butterick-tables` sets one table twice, `CLUTTERED` / `CLEAN`, then `DENSE` / `NOT`: borders off to start, cell margins from 0.03″ up in 0.01″ steps, top and bottom bigger than the sides. `live/butterick-page-margins` — *"One inch is not enough"* — gives 1.5–2.0″ at 12 pt and a bottom margin ~0.25″ deeper than the top.

## 3. Type and motion, as observed

Scale read off `porsche-pdf-1` at 952 px wide: the model name is roughly **4×** the table's row text and **5×** the footnote; `Summary` and the money row about **2×**. Saxdor inverts it — spec rows ~1/3 of the section head, the table barely half the measure (`live/saxdor-brochure-specs-crop`).

**Motion, provable from stills.** I diffed the right 460 px of `porsche-summary-a/b/c/d`: a↔b and a↔c differ by **1.81 %** of subpixels (b↔c are identical there) while the left column over the same scroll differs by **23.13 %** — so the price-and-acts rail is **pinned across three viewport-heights**. At `summary-d` that region differs by **28.32 %**: the rail has released and a marketing photograph has taken the space. The figure never changes: `$0.00` in all four, which is what an issued figure does.

**Colour, and the failure it exposes.** The *same* `Basic equipment` chip is **rgb(89, 163, 83)** — mid green — on the screen summary (`porsche-summary-b`) and **rgb(183, 183, 186)** — neutral grey — in the PDF of that identical configuration (`porsche-pdf-2`), measured. Print is not pixel-faithful at Porsche, and the difference carries meaning: green reads *included*, grey reads *inert*.

**The page as furniture.** `live/pagedjs-home` draws crop marks in the window's corners and sets the site inside a page box — the only frame here where the page is the object, not the viewport (`live/vivliostyle-viewer` is its sibling).

## 4. What to avoid, each with its frame

- **A colour that survives on screen and dies on paper** — `porsche-summary-b` vs `porsche-pdf-2`, measured above. Our three line states must read in greyscale before getting a hue.
- **A page 90 % white because the section ended** — `porsche-pdf-3`, three rows on A4. Porsche's break is honest per section, but our sections are smaller, so a naive one ships several of these.
- **The document ends and marketing begins** — `porsche-summary-d`: the rail lets go, a lifestyle card appears.
- **Personal data before the document** — `live/rivian-configurations` blanks the page behind *"Enter your postal code"*; `live/whaler-home` throws a five-field newsletter modal over the home. Nothing was typed.
- **A consent card with no refusal** — `live/saxdor-specs-scrolled` and `-pricing-scrolled` (Accept only, so the privacy-preserving pass had nothing to press), `live/betterproposals-templates`, `live/ikea-kitchen-planner`, `live/highfield-sp560-page`.
- **Print and export as two operations** — `live/notion-print` gives *Export as PDF* and *Print a Notion page* separate sections. Ours is one DOM.
- **A grid where a table should be** — `live/butterick-tables`' `CLUTTERED` example, a border round every cell.
- **A price with no configuration named** — `live/yachtworld-boat-detail`: `$159,848`, `$136,358`, `$400,000`, a town beneath each, nothing else.
- **A 404 that reports a real title** (`live/polestar-4-design`, `live/collectingcars-lot`) and **a truncated artefact taken on trust** (`ref/porsche-summary.pdf`).

**And a failed hunt, recorded not filled in.** The included / for-a-fee / not-available matrix was chased at Qantas, Virgin, Air NZ, Jetstar, Singapore Airlines and two insurers; all 404'd, blocked or served link lists (`live/qantas-fare-table`). **No board may claim a tick-dollar-dash matrix here**; the three states come from Porsche and GOV.UK.

## 5. Four directions — each a different composition *and* order

**A — "The sheet, at true size."** The A4 page is the only object on screen, on a grey floor at 1:1 where the window allows, with a gutter rail of page numbers. **Order:** the printed order; nothing on screen that is not on paper. **Grouping:** by page. Chrome is one pill — Print · Download · Back.
*Exclusive:* `live/pagedjs-home` (crop marks and a page box as the page's own furniture) and `live/saxdor-brochure-pdf` (a marine A4 with a bottom-anchored caption column and photograph pages carrying no type).
*Only this screen:* its ruler is a **diff between printed and on-screen DOM** — one object, one size.

**B — "The rail and the record."** Porsche's split inverted for a dealer: a pinned rail holding **who it is for, the reference, the total and the acts**, the record scrolling beside it. **Order:** party and price first, then the boat, then the sections. **Grouping:** by section, each band head carrying count and subtotal.
*Exclusive:* `porsche-summary-b` (count chip, per-row Change) and `live/stripe-billing` (the derivation under each line name, the total at the foot).
*Only this screen:* the only one showing a frozen line beside the rung it was frozen at, and where every `Change` refuses with a sentence.

**C — "The ledger."** No cover above the fold: one table of every frozen line at register density, identity column pinned, sections as collapsible bands with subtotals, the boat a 96 px thumbnail by the reference. **Order:** money first, provenance second; the cover exists only in print. **Grouping:** by rung and by state — priced · standard · not priced — not by chapter.
*Exclusive:* `porsche-pdf-5` (the unpriced half as bullets under bold heads — a document inside the document) and `live/qwilr-interactive-quote-crop` (the band head carrying `SUBTOTAL`).
*Only this screen:* the only place the dealer reads the frozen figure and today's file in one row.

**D — "The brochure."** Full-bleed photographic chapters; a caption column anchored low against a wide white half; tables small and narrow in a generous page. **Order:** boat, story, specification, money, terms — money *last*, the opposite of B, which the board must defend against "the price beside who it is for". **Grouping:** by what the customer looks at, every priced line in one spread.
*Exclusive:* `live/saxdor-brochure-pdf-late` (`LAYOUTS & SPECS`: eleven hairline rows at ~55 % measure, lower third white, and the range strip marking where this model sits) and `live/highfield-request-quote` (a brand the file carries, at hero scale on its water).
*Only this screen:* the only direction that must survive a render — Highfield's catalogue tier is 115 held pictures with **zero** scenes, so D names its brand on its face.

## 6. The imagery question — measured, and it decides the cover

Counts re-run from `images.json` and the two ledgers, 2026-09-17.

**Tier one, the catalogue copies** — 453 addresses · **329 held** · 122 scenes · 207 studio, `meta.longEdge: 1100`. Porsche's per-line thumbnail is ~28 px on a 952 px A4 render — ~84 px at 300 dpi, and **all 329 clear it**. Tier one's honest job here is the per-line thumbnail, nothing larger.

**Tier two** — `heroes-ledger.json`, **eight photographs**, each with a source page and a sha256: Highfield SP560 2560 × 1708, SP600 2560 × 1918, PA600 2560 × 1707, ADV7 2560 × 1706; Stacer 519 Sea Ranger 2560 × 1694, 481 SeaMaster 1771 × 1183, 309 Skimma 1500 × 1010, 359 Territory Striker 1200 × 800.

A4 is 210 × 297 mm — **2480 × 3508 px at 300 dpi**, 1240 × 1754 at 150. For a full-width cover **band**: five of the eight clear 2480 px at 300 dpi, seven clear 1240 px at 150, and the 359 Territory Striker clears neither and must be inset. **No held picture can fill a full A4 bleed at 300 dpi** — 3508 px tall is beyond every one. The cover is a band, not a bleed: measured, not chosen.

**The marks.** `marks-ledger.json`: 18 rows, 13 brands, 17 files — five brands in dark **and** white, six dark only, **Mercury white-ink only** (`mercury-white.png`, 1200 × 292), so a Mercury mark cannot sit on a white page: it needs a dark band, or it is a word. **Stabicraft is `"error": "no public wordmark verified"`**, so its mark slot is the brand's name in type. And **Northside Marine's own mark is not in the ledger.** A quote is letterhead, so this bites hardest here: a board that draws the dealer's logo is drawing an asset we cannot ship, and must say so.

**The second dealership.** `live/betterproposals-templates` is the shape — every cover reads `yourlogo` and *"Written by {{sender_first_name}} at {{brand_company_name}}"*: mark slot, photograph slot, one colour, all tokens. Every direction must read when the mark is a word, the photograph a render, the colour not blue.
