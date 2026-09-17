# Quotes register — the sweep

Driven 2026-09-17. **174 sources · 169 frames · 152 distinct images · 5 refused**, counted from the files; the seventeen byte-identical pairs and every refusal are in `sources-index.md`. Paths are relative to `docs/research/refs/quotes/`; stock is `C:\Users\Asaf\dev\hl-refs\ref\`. **Every frame cited was opened and looked at.**

**The job.** Every draft and issued quote; find one by reference, customer or boat; open it; make a new version; an honest empty state, because on day one there are none. Cockpit, not Showroom: **18 rows at 1280 × 800**.

## 0. Corrections, by looking and by counting

1. **The stock for this screen is mostly not registers.** Of the 21 frames in `ref/tables/`, ten are marketing or documentation pages, three are **bot walls** (`boatsales-list`, `yachtworld`, `mercury-compare`) and `airtable-universe-2` was shot mid-load with every thumbnail grey; `sources-index.md` names each. **`ref/tables/github-issues.png` is the only frame there showing a real dense working register**, so the plan's "rows led by hull thumbnails" cannot be drawn from the stock at all.
2. **`ref/porsche-saved-1.png` / `-2` are not saved configurations** but the model-series picker carrying one door — "Do you already have a configuration?" over a black **Load saved configuration**. The stock's only saved-work reference is a button.
3. **Xero refuses** (three URLs, one login page), so nothing about its Draft/Sent/Accepted/Declined vocabulary is evidenced here; Shopify's is (§1). **Height is confirmed dead** — `ERR_CONNECTION_CLOSED`.

---

## 1. What is genuinely best for this section

**`ref/tables/github-issues.png` and `live/github-pulls-vscode.png` — the best row anatomy, and the answer to what earns weight.** A leading glyph, the title at full weight, everything else in one grey meta line: `#336520 opened 2 hours ago by Sanskar (sanskarIN) · Review required`. The head carries the counts as figures with glyphs, facets as quiet dropdowns, one green primary far right. **Draft is a hollow grey glyph, open a filled green one — state is the glyph; the coloured pills in the row are user-authored labels, not state.** For a quote the title slot is the boat and the customer; the reference and the date go in the grey line; the total is the one thing GitHub has no equivalent for.

**`live/linear-filters.png` — the best structure.** No state column exists. Rows sit under group headers that *are* the state: `⬤ In Review 2 / 11`, `○ Todo 2 / 10` — glyph, name, count as a fraction. Above them the filters are removable chips on one line (`Assignee is any of ▪▪▪ 3 assignees ×`, `Labels include ⬤ Feature ×`) with `Match all filters` right. Nine rows and three bands fit in ~290 px of image. `live4/linear-issue-status.png` shows why: statuses group into categories (Triage · Backlog · Unstarted · Started), each glyph's *shape* encoding the stage and carrying its own count and a sentence. Hue is a tint of the shape, never the message.

**`live4/shopify-order-statuses-scrolled.png` — the structure for draft/issued/superseded.** Verbatim: "Orders are either **Open** or **Archived**, but can have additional statuses", each explained in a sentence in a Status | Description table. A quote is `draft` or `issued`; *superseded* is an additional status of an issued one, not a third peer, and belongs as a sentence rather than a third colour.

**`live4/mercury-banking.png` and `marine/marinemax-inventory.png` — the money, and the honest refusal.** Mercury: a circular mark, a two-line identity (`Ops / Payroll` over `Checking ··8799`), the figure right-aligned with **the cents as a smaller superscript** — `$2,023,267·¹²` — and `+ Create Account` as the **last row of the register**. MarineMax: `2,967 Results` plain above, one search field and one `Filters` button; a card of eyebrow `25.0' | New`, a corner state chip, the model as title, the price left and the **stock number `# 207335` small grey right** — with **"Request Pricing" standing exactly where the price stands** when the figure cannot be shown.

**`live4/linear-search.png` and `live/stripe-search.png` — find-by-anything, twice.** Linear's field is useful at **zero keystrokes**: it already lists *Recent issues* as four rows of ID, glyph and title; `/` searches title, description and comments, `O`+`I` restricts to identifier. Stripe publishes the grammar — a term may be "the last four digits of a card", "the payment method type", "the business name" or `last week`, and "**No additional context is necessary for most searches**". `live4/bringatrailer-results.png` writes it as a placeholder: "Search for make, model, category, or anything else…".

---

## 2. The patterns worth taking, named

**The state is the band, not the pill.** `live/linear-filters.png`. Three bands — Draft (n) · Issued (n) · Superseded (n) — each a header of glyph, word and count. Every row still shows the glyph, so a row torn out of context reads, and no row spends width on a coloured word.

**The count lives with the thing it counts.** `ref/tables/github-issues.png` (`Open 18,480` / `Closed 235,087`), `live4/bringatrailer-results.png` ("View 263,518 Completed Auctions"). Our only figures are the three state counts; on day one all three are zero and printed as zero.

**Filters as removable chips inside the field, never a filter bar.** `live/sentry-issues.png` puts the token `is unresolved ×` *in* the search field with `Save As` beside it. `marine/marinemax-empty.png` keeps the chip after it returns nothing (`Make: zzzz ×`) with `Clear All` under it, quotes the term back — "We're sorry, we could not find any matches for "zzzz"." — and fills the space beneath with **"You may also like"** and real stock.

**Which facts a row carries, chosen as chips.** `live/linear-display-options.png`: List/Board, Grouping, Ordering, and **Display properties as a wrap of toggle chips** (ID · Status · Labels · Project · Due date · Created · Updated · Assignee) — columns without a column model, and `docs/reference/dense-tables-and-selection.md` records that **Linear has no column model whatsoever**. Its `Show empty groups` toggle is our day-one question, and `live3/airtable-grid-scrolled.png` adds the honest label: "Hide fields" becomes "**X fields hidden**".

**Tap Space to peek, hold Space to glance.** `live/linear-peek.png`: a card over the dimmed list with ID, title, chips and `Created … by … · Updated 1 day ago`; arrows move rows with it open. Airtable binds the same key.

**Versions as a rail with one Latest and a Compare per version.** `live/github-releases-vscode.png`: every version in a left rail, the current one barred, a green outlined `Latest` on the newest, a `Compare ▾` at each block's top right. `live3/figma-version-scrolled.png` names the verbs — create and name · view · duplicate · restore · share · delete. "Make a new version" is Figma's *duplicate and name*, and its result is GitHub's *Latest*.

---

## 3. Type and motion, as observed

**Two sizes and two greys do all the work.** In `ref/tables/github-issues.png` the title is ~15 px full black and the meta line ~12 px grey; `live/linear-filters.png` is tighter still — one size, one weight, opacity the only differentiator.

**Money is right-aligned, tabular, cents demoted** (`live4/mercury-banking.png`, ~60 % of the dollar size) and never animated in any frame captured. **Relative time beats a date** — "opened 2 hours ago" (`live/github-releases-vscode.png`), `Today` and `This Evening` as *headings* (`live3/things-scrolled.png`); a date appears only where the fact is historical, "Sold for USD $1,000,999 / on 9/15/2026".

**Motion: one instance proven across 169 frames, and it is a failure.** `marine/theyachtmarket-list.png` caught the hero mid-crossfade with "Aluba" and "Hanse 458" printed over each other. Everything else is a control that exists rather than motion proven. A working register moves as little as possible; `docs/reference/dense-tables-and-selection.md` carries Superhuman's minimal-animation line and the RAIL 100 ms budget a row press must meet.

**The density arithmetic, from a published ladder.** `live4/retool-row-heights.png`, read directly: **X-Small 20 · Small 32 · Medium 48 · Large 60 · Dynamic**. At 1280 × 800, minus an app rail (~56), a register head (~64), a find row (~44) and a column head (~32), **604 px remain**. Eighteen rows at 32 px = 576: fits. **Plus three group bands = 672: does not.** A grouped direction runs 28 px rows (504 + 84 = 588) or shows sixteen.

---

## 4. What to avoid, each with its frame

- **Everything above the first row.** `marine/boattrader-au.png`, Australia's own marine register: seven state checkboxes, two dropdowns, a view toggle, a pager, `Save Search`, `Email Alerts` and two ad units above the rows, and **three rows visible at 1440 × 900**. Length, year and price sit in three walled cells at one size and weight, so `AU $110,000` reads no louder than `2020`.
- **A promotional hero in front of the register.** `marine/brisbaneyamaha-instock.png`: IN STOCK BOATS gives its first 700 px to an aerial and a logo wall, then prints "Scroll down to view our models".
- **A zero that is silent.** `marine/whitworths-search-empty.png` — Australia's largest marine retailer answers a search matching nothing with the heading "Search Results" and **550 px of white**. `live3/ramp-bills-scrolled.png` is the same fault inside a card: three panels reading "Up to", number absent.
- **A wall of attribute pills, and a promotion in a row's slot.** `live4/bringatrailer-results.png` gives every card four chips before a single fact; `live4/hagerty-marketplace.png` corrects that (**only the exceptional row gets one**) but lets a black "Ready to sell?" card take a tile, where it reads as a record.
- **A greyed primary with no sentence.** `live3/github-issues-zero.png`: at zero the register rightly keeps its frame and prints a literal `0` in both facets, but `New issue` is dimmed with nothing saying why.

---

## 5. The day-one empty state, from the systems that publish one

**It is a first run, not an error, and the distinction is published.** `live3/primer-empty-states-scrolled.png`, GitHub's own pattern, separates *first time user experiences* from *error states*: "If the space is empty because this the feature hasn't been used yet, **the action should initiate a creation flow or link to a feature**", the secondary action being "a text link located below the primary action button". `live3/nngroup-empty-states.png`: empty states "communicate system status, increase learnability of the system, and deliver direct pathways for key tasks."

**Two brands in our own price file already write an absence as two questions.** `marine/stacer-boats.png` and `marine/quintrex-boats.png`, both Telwater sites, answer a missing page with **"WHAT HAPPENED?"** (three plain reasons) and **"WHAT DO I DO?"** (a way onward). Our register with no quotes says what the page will hold, why it is empty today, and offers New quote — never "No data".

---

## 6. Four directions

Each a different composition **and** a different order and grouping of the content.


**A — "The ledger".** One full-width column; no rail, no thumbnails, no state column. Grouped **by state, then recency**: three bands — Draft (n) · Issued (n) · Superseded (n) — each a header of glyph, word and count; a row is glyph · boat at full weight · customer grey beside it · total right-aligned · reference and age small grey far right. Find is a token field above the bands; 28 px rows, so eighteen fit under three bands (§3).
**Exclusive to A:** `live/linear-filters.png` — the group header that *is* the state, carrying an `n / m` fraction over removable typed chips; and `live4/linear-issue-status.png` — statuses grouped into categories where the glyph's shape carries the stage. **Only A makes state the structure rather than a column**, so only A prints three honest zeros on day one without a coloured pill anywhere.

**B — "The day book".** A single centred measure, generous air, grouped **by day, not state**: `Today`, `Yesterday`, `Thursday 11 September`, `Earlier`. The date is written once in the left gutter; the day's own sum sits at the right of its header, from frozen lines. A row is time · boat · customer as a small second line · total, and state is one 8 px glyph.
**Exclusive to B:** `live3/things-scrolled.png` — headings are times of day under a hairline, every row carries a small grey second line naming its project, rows run ~23 px, and exactly one row earns a coloured tag; and `live4/bringatrailer-results.png` — money and date as one two-line body-weight statement under a time-bounded heading. **Only B is ordered by when the work happened**, which is what a sales manager actually asks.

**C — "The stock card".** Photograph-led, grouped **by boat**: a 3-up grid at 1440 collapsing to 96 px-thumbnail rows below ~1100 — the only direction that is a grid on a desk and a list on a phone rather than a reflowed table. Card: the held catalogue picture, a thin state rule under it, an eyebrow of `5.29 m | Stacer`, the model as title, a fact strip from the frozen lines, total left and reference small grey right.
**Exclusive to C:** `marine/marinemax-inventory.png` — the eyebrow, corner state chip, title and price-and-stock-number foot line, with "Request Pricing" where the price stands; and `live4/hagerty-marketplace.png` — state as a thin rule under the picture, one figure and one time on the line beneath, a chip only on the exceptional row. **Only C shows the boat**, so only C must answer what happens to the quarter of rows with no held picture (§7).

**D — "The one field".** The screen at rest **is** a search field with the last-touched quotes beneath it; the full register is what Enter on an empty field returns. Typing narrows across reference, customer, boat and total at once, and results group **by what matched** — Customers · Boats · References — with the fragment marked, not by state and not by date.
**Exclusive to D:** `live4/linear-search.png` — the empty field listing *Recent issues* before a character is typed, `/` over title, description and comments, `O`+`I` restricting to identifier; and `live/stripe-search.png` — the published grammar that one field takes a card's last four digits, a method name, a business name or `last week`. **Only D makes the finding the screen** rather than a control on it: a person who knows one fragment of one quote never learns a filter.

Owed by all four, from §2: the version rail, peek on Space, and New quote as the last row *or* the head's filled block.

---

## 7. The imagery question

**Measured on disk, 2026-09-17.** `images.json`: **453 addresses · 329 held · 122 scene · 207 studio**, every held copy **320–1100 px wide**. `heroes-ledger.json`: **eight photographs** — four Highfield (ADV7, PA600, SP560 2560 × 1708, SP600), four Stacer (309 Skimma, 359 Territory Striker, 481 SeaMaster, 519 Sea Ranger SDF). `marks-ledger.json`: **18 rows for twelve brands**, Mercury white-ink only, **Stabicraft carrying `"no public wordmark verified"`**.

**What a row can honestly carry.** A **64–96 px thumbnail from the catalogue tier**: all 329 held copies clear 320 px, so it is the one picture size the seed serves without upscaling. A 400 px card picture works for 327 of 329.

**What it cannot.** A stage photograph per row: the hero ledger holds eight models and **not one is the Stacer 529 Assault Pro**, the boat of the golden quote. And **124 of 453 addresses are unheld**, so about a quarter of rows carry no picture — C must draw its no-picture row as a designed state, the brand mark on a tinted plate with the model name, never a grey box. Highfield is renders in the catalogue tier and real water in the hero tier; Stacer publishes its on-water work at web size, which is why two of its four heroes are 1200–1500 px; Stabicraft has no mark, so no direction may lead a row with one without saying what happens to Stabicraft. Northside Marine's own mark is still not in the repo with provenance, so a board answering "I want the logo to be the showpiece" with it is drawing an asset we cannot ship. A second dealership replaces every photograph and the mark — the real reason C designs its picture-less state first, not last.
