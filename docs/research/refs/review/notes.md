# Review — the sweep

Driven 2026-10-22 into `live/` at 1440 × 900: **42 sources, 40 frames, 2 failed** (QuickBooks AU, `ERR_HTTP2_PROTOCOL_ERROR`). Five frames are dead by title and unopened: two WAVE (Cloudflare, not fought), Sonar's dogfood (redirect), Xero find-and-recode (login wall), one Sonar 404. **31 opened**: 29 ours plus `quotes/live/sentry-issues.png` and `cascade/software3/excel-detect-errors.png`; eight were misses. Nothing unopened is cited.

## 0. What the engine finds on this file — measured

`lintProject` on `loadPack()`, via a scratch vitest config; nothing written to `src/`.

| rule | marks | tables | fix |
|---|---|---|---|
| Duplicate field name | **4 blockers** | 2 | none |
| Free text, few values | 108 | 50 | convert to list |
| Plural table name | 10 | 10 | rename |
| Hidden table | 8 | 7 | extract |
| Unlinked table | 7 | 7 | none |
| No required identifier | 3 | 3 | make required |
| Repeating columns | 2 | 1 | extract |

**142 marks on 53 tables** (as `rollup.test.ts` pins), **11 with no fix**: a data modeller's lessons, not a dealer's.

**Free text, few values (108):** 28 sit on pairing tables' `Origin`, which `retypeRadius` refuses ("machinery on a pairing"); 55 propose a list of *one* value (`Supplier` on Dunbier Trailers); 19 are both. Only **44** would run and make a real list.

**Fixes that read wrong for Northside:** "Oils & Consumable", "Surtees × OBSOLETE Trailer"; "Extract 'Rate' table" from `Rate · Rate (Exc GST) · Rate (inc GST)`, a GST pair; four "Extract 'Trailer'" on trailer tables' own columns; "Unlinked" on Labour Rates and Registration Costs, lookup lists by design.

**Not one mark carries a dollar.** The faults that cost Northside money are outside the linter.

- **Registration** (`constraints/registration.ts` `atmBandDisagreements`). It tested 430 trailers, and **9 disagree with their own band**.
  - Four GFAB Offroad Sportskis (1,500 kg) and three Dunbier ALPs (1,450–2,000 kg) are banded `Small – Up to 1.02t` at $166. That is **undercharged $117 each**.
  - Tinka TA450 (740 kg) and TA450MO-B (1,000 kg) are banded Large at $283. That is overcharged $117 each.
  - The fees were checked in `data/northside/tables/registration.json`.
  - This is MPF_GROUND_TRUTH §14's nine (2 + 4 + 3), and all nine are seeded. The S1 comment in `workbookRules.ts`, "Three of the nine are in the seeded subset", is stale.
- **The same name at two prices** (a probe, not in `src/`). There are **25**: 17 parts (the 7 `DISCONTINUED – No Longer Available` placeholders left out), 6 dealer-fit bundles and 2 Mackay trailers.
  - The widest gap is `Battery, Lithium 24v 100Amp (Bluetooth)`, at $1,899 and $2,890.
  - HELMLOGIC_GROUND_TRUTH §7, "A user picking by name can grab the wrong price", holds. Its Mackay figures ($18,400 / $21,400) are production's. The seed's are $6,796 / $7,276 Nett.
- **A blank or $0 first sell column**:
  - Parts: 146
  - Dealer Fit: 137, of them 44 blank. MPF §12 counted 45 in the workbook.
  - Rigging Kits: 22
  - Jeanneau packages: 13
  - Formosa: 9 of 39
  - Haines Signature: all 9, priced as boat-and-motor packages, so not a fault; a check must know it (FITMENT_RULES §1.5's 52-row Haines exception).
- **Two blockers that become money.** Rigging Kits has two `Trade Price` columns and two `Sub Dealer Price` columns. Which one prices a kit?
- **Rows with nothing to name them**: 10 rows across Mackay, Parts and Rigging Kits.

**The write path.** `applyLintFix` takes `CatalogueWrites` callbacks; nothing adapts `catalogue/commands.ts` to them. `commands.ts` has `batch` ("many acts, one step", all or nothing, one sentence), so **one fix is one batch and one Undo**. Missing: rename a table (10 fixes), set required (3), set display field. `retypeRadius` takes no options, so on all 108 list fixes it says "None of the 16 values can be read as select, so all 16 are cleared", which is false because `applyLintFix` writes the values back. No dismissal record exists.

**To build, in `src/domain` with tests:** `review/checks.ts` (band, same name at two prices, blank sell excluding held-back rows), a fix-to-batch adapter, `renameTable` and `setRequired`, list options on `retypeRadius`, a dismissal keyed on the finding id.

## 1. What is genuinely best — the five hard questions

**1 · Readable, and acted on.**
- `live/sonarcloud-monica-issues.png`: **Top issues 59 | All issues 438**, then "59 issues **4h 52min** effort": a curated few, priced.
- `live/apple-iphone-storage.png`: the name, **Enable** at the right end, then "Save up to 145.2 MB … Your documents & data will be saved".
- `live/xero-reconcile-help.png`: the count in the button ("**Reconcile 20 items**"), the money first ("Balance difference 7,112.95").

A dealer acts when it names his trailer and its dollars: "7 trailers registered as small: $117 each not charged."

**2 · Grouping.** The answer is not by table: rollup's own measurement is 195 blocks for 142 sentences. Nor is it by the linter's severity, because a $117 undercharge is "advisory" in nobody's books. The order is **by what it costs**:
1. **Money**: band, two prices, no sell
2. **A wrong pick**: twin columns, nameless rows
3. **Tidy**, folded and counted

Inside each band, group **by the fix that clears several**: `live/snyk-fix.png` files vulnerabilities under the dependency whose upgrade clears them, **Fix these vulnerabilities** at the head, and its facet "Fixable 55 · Partially fixable 15 · No supported fix 36" is the honesty we owe 11 marks: "No fix — needs you."

**3 · Applying a fix to the real file.**
- `live/xero-reconcile-help-3.png` sets the statement line on the left, the suggested match on the right in green, and **OK** in the gutter between them. Below sits "1 other possible match found".
- So the fix is drawn as the file's cell and the cell it would become. The press runs one `batch`. It is said first ("Registration on 7 trailers goes from $166 to $283") and undone from the toast or History (`UNDO_DEPTH` 50, pinned to the event).
- `registration.ts` "MAY NOT derive a band". So money is fixed **one press per row by the dealer**, and never with a Fix all.

**4 · Dismissal, and whether it returns.**
- `live/sentry-states-triage-2.png` archives "until the issue gets worse", forever, for a period, or until N events. "A plain Resolve treats any later event as a regression". `live/sentry-states-triage.png` names that state Regressed: "A resolved issue that's come up again".
- Datadog mutes for "one hour, one day, or forever" (`live/datadog-manage-monitors.png`).

Simple wins, so we take one act, **Leave it — it's meant**, with an optional reason and no timer. It is keyed on the finding id (`rule:table:columns`), so it comes back only if what it named changes. For money checks the key is the row and its value. Dismissed marks are counted in one line at the foot.

**5 · The clean day.** Most ledgers fail here.
- `live/hemingway-clean.png` keeps every category in its alarm colour at zero: "0 of 0 sentences are very hard to read", "Grade 0 Good."
- Search Console has the better answer: fixed, "the issue count goes to zero and drops to the bottom of the table" (`live/gsc-validate-fix.png`). Its "What *not* to look for: 100% coverage" (`live/gsc-page-indexing.png`) is the clause that keeps tidy advice from blocking "clean".
- `live/sonarcloud-explore.png` shows **Passed** with 269 reliability issues still counted: the gate is about what matters.

So the clean day is a list of what was checked, each a sentence that is now true, for example "All 430 trailers with a weight are in their own band." It also says what was *not* checked: boats' bands are untested (`registrationKeys` reads trailers only). That is Steam Deck's *Unknown* (`explaining-a-refusal.md`).

## 2. Patterns worth taking, named

- **The top set**: Top issues against All issues (`sonarcloud-monica-issues`). Ours: Money and Picks against Everything.
- **The price on the finding**: "5min effort" per card, the total in the head. Ours: dollars, or "No price changes."
- **The count in the act**: "Reconcile 20 items" (`xero-reconcile-help`). Ours: "Review 7 trailers".
- **The pair with the act between**: as it is, as it would be, OK in the gutter (`xero-reconcile-help-3`).
- **The proposer's tag**: each line tagged `Rule · Match · Manual · Memory · Prediction`, with "In the past, you've reconciled similar statement lines in this way" (`xero-reconcile-mkt`). Ours: "Registration check — read from the fee table's label 'Up to 1.02t'".
- **Fix by the cause**: one upgrade clears many (`snyk-fix`). Ours: "Rename the second Trade Price — clears 2 marks."
- **The painted file**: marks on the text by kind; the rail says "1 of 13 sentences is very hard to read", an eye hides a kind (`hemingway-editor`).
- **The overview ruler**: red ticks on the scroll track where errors sit (`vscode-problems`).
- **Since the last look**: Change · Added · New · Removed per issue (`ahrefs-site-audit`).
- **Comes back if it changes**: Regressed, Escalating (`sentry-states-triage`, `-2`).
- **Sinks at zero**: a fixed issue stays named at 0, at the foot (`gsc-validate-fix`).
- **Saving first, act right, what is kept last** (`apple-iphone-storage`).

## 3. Type and motion, as observed

- **Hemingway**: the document in a serif, the rail in a sans, so the file reads apart from the judgement; colour alone carries the kind, each count in a chip of its colour (`hemingway-editor`).
- **Sonar**: the title is a sentence naming both facts ("Duplicate id 'viewer' found. First occurrence was on line 55."), grey meta trailing right ("L151 · 5min effort · 3 years ago").
- **Apple**: three tones: black title, **Enable** in the tint, grey body. **Xero**: one saturated **OK** between two greys.
- **Sentry**: a sparkline per issue with its state word under it (`quotes/live/sentry-issues.png`).

The frames are static, so no motion was observed. What this screen needs is what GSC describes: a fixed finding **sinks** to a "fixed today" line while the head's figure counts down (the kit's `Figure` already rolls).

## 4. What to avoid, each with its frame

- **The same lesson three times**: three identical "Duplicate id … found" cards (`sonarcloud-monica-issues`), the case `rollup.ts` exists for.
- **A grade**: "96 Excellent" (`ahrefs-site-audit`), letters A–E (`sonarcloud-explore`), "Grade 8 Good." (`hemingway-editor`). A price file is not marked out of 100.
- **Alarm at zero** (`hemingway-clean`), and **an upsell in a finding's slot** (Hemingway's green "Upgrade" card in the rail).
- **Overlays on the evidence**: "Watch demo" over the table (`ahrefs-site-audit`), a consent banner over Watchtower (`onepassword-watchtower-help`).
- **Text pages as exclusives** (the critic's fault 2): GSC, Sentry's docs and Datadog are cited for words only.
- **The engine's own faults**: the wrong-English renames and the false "all cleared" radius must never print.

## 5. Four directions

Each one draws the true counts: 9 band faults, 25 names at two prices, 4 twin columns and 10 nameless rows in the open; 135 tidy marks folded.

### A · "Reconcile" — the split ledger

- **Composition:** full-width rows. Each row has two halves: *as the file reads* (the row, the cell, its figure) and *as it would read*, with **OK** in a 56px gutter between them. Over the rows sits one money line: "$819 of registration not charged · $234 overcharged".
- **Order and grouping:** by check, under three bands. Money first, then Picks, then Tidy as one folded line ("71 suggestions about the file's shape; 64 more that cannot run").
- **Exclusives:** `xero-reconcile-help-3` and `xero-reconcile-mkt`. They are one product, so the fallback third is `languagetool-example` (the offending word as the title: "error's — Extraneous apostrophe").
- **Only here:** a proposed cell stands beside the real one before anything is written.
- **390:** the halves stack, as-is over would-be, and OK goes full-width beneath. **834:** halves at 50/50. **1920:** the measure is capped at 1,280, and the halves gain the row's context (ATM, band, fee).
- **Northside sets:** which checks run, a check's on/off, and whether Tidy shows at all.

### B · "Recommendations" — one column, ranked by worth (recommended)

- **Composition:** a single centred column of at most 680px. Its head is **one bar of the whole file**: 15,691 rows as a strip by table, with the segments that hold a fault marked.
- **Under the bar:** cards ranked by dollars. Each card has a title, its price in one line ("Charge $117 more on 7 trailers"), the act at the right end of the title row ("Review 7"), and a grey sentence saying what is kept and how it is undone.
- **Order and grouping:** by the fix that clears several, then by money, then by marks cleared.
- **Exclusives:** `apple-iphone-storage` and `snyk-fix`.
- **Only here:** fixes ranked by what they are worth to the business.
- **390:** this is the native form. **834:** the column is 600 wide and the bar runs full width. **1920:** the column holds at 680 and the bar spans 1,280 above it.
- **Northside sets:** the ranking (money first), a floor under which a price gap is ignored (say $5), and the checks.
- **Why recommended:** it is the simplest, and Apple's own phone already teaches it.

### C · "The marked file" — the file drawn

- **Composition:** a canvas. The 53 tables are horizontal bars, with length on a log scale of rows, and pairings fold into their maker. Marks are painted where the faults sit, in the kind's ink, with a ruler down the right edge.
- **The legend rail:** sentences of the form "9 of 430 trailers are in the wrong band", each with an eye that hides its kind. A mark opens `/data/$table` at the row.
- **Order:** the file's own order (makers, motors, trailers, parts). This is grouping by place, read as a picture.
- **Exclusives:** `hemingway-editor` and `vscode-problems`.
- **Only here:** the whole file at once, with where it is wrong.
- **390:** a vertical list of tables, each with a tick strip, and the legend becomes a chip row on top. **834:** the legend sits under the field. **1920:** a 1,280 field beside a 320 rail.
- **Northside sets:** the kinds shown at first.

### D · "Since you last looked" — the census

- **Composition:** one row per **check**, not per finding: 10 rows. Each has the check's sentence, then four figures: **Found · Fixed · Left as meant · Left**. The head is dated: "Read Thursday 22 October · 15,691 rows". A row opens inline to its rolled findings.
- **The Fixed column** fills through the session. `lintProject` is pure, so the screen re-lints after each catalogue event. On day one, everything is Found.
- **Order and grouping:** by check, money first.
- **Exclusives:** `ahrefs-site-audit` (a change column on every issue) and `sonarcloud-monica-issues` (the top-and-all head with its total price).
- **Only here:** the file's health as figures that move while you fix.
- **390:** the four figures fold to "Left 9 · Fixed 0" under the sentence. **834 and 1920:** the four columns are kept. There is no trend line, because no lint history is stored.
- **Northside sets:** which checks run.

Mirrored ledger, column, canvas, census; grouped by finding, fix, place, check. None is a list beside a detail.

## 6. Imagery

**None.** A Cockpit screen whose picture is the file itself (B's bar, C's field). The clean day is set in type: the checks, each now true, with the date read.
