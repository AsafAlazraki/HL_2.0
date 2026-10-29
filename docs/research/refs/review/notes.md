# Review — the sweep (second pass, 2026-10-28)

This pass builds on the 2026-10-22 sweep (`live/`, committed at a77b1dc) and on the built screen (`docs/directions/review/built/m3-2-1440.png`).

- **New frames:** `live2/` holds 45 sources, 43 frames and 2 failures. QuickBooks AU failed again (`ERR_HTTP2_PROTOCOL_ERROR`), and Figma's modal image was served as a download.
- **Opened this pass: 36.** That is 28 from `live2/`, 7 re-opened from `live/`, and the built shot. Only these are cited.
- **Dead frames:** three `live2/` frames are blank, because GitHub's blog images refuse a direct load, and one is a 404.

## 0. What the engine finds on this file — measured today

`review()` and `lintProject` were run on `loadPack()` through a scratch vitest config outside the repository. The file is **53 lists and 15,691 lines**.

| check | open | where | fix today |
|---|---|---|---|
| Registered as the wrong size | **9** of 430 | 7 heavier than Small (Dunbier ALP ×3, GFAB Offroad Sportski ×4): **$819 not charged**. 2 lighter than Large (REDCO/Tinka): **$234 over** | `rebandCommand`, one line a press |
| One name, two prices | **3** | Mackay MLJ6000T-14-HB $21,223 / $21,633. PU5000-14-M $9,423 / $10,043. Outboard Vented Cover $129 / $133 | named in place |
| On sale, no price | **147** | Parts 138 in 20 groups. Formosa 9 (every SRT 715/755: Cash, Trade and landed cost all 0). Haines' 9 package boats rightly excluded | sheet |
| Two under one name | **4** | Dealer Fit Packages Code ×2 and CTD ×2. Rigging Kits Trade Price ×2 and Sub Dealer Price ×2 | `nameTwinCommand` |
| Nothing to name it | **7** | Mackay 3, Parts 3, Rigging Kits 1 | `nameLineCommand` |
| Tidy | **138** | free text with few values 108, plural names 10, prefix clusters 8, unlinked 7, no identifier 3, repeating 2 | folded |

`open` = **170**, which is Data's "170 to fix". The linter alone gives 142 marks: 4 blockers and 138 advisories, as `rollup.test.ts` pins.

**Two findings change the boards before anything is drawn.**

1. **101 of the 147 "no price" lines have a price.**
   - `noPrice` reads only a list's *first* declared level. Parts declares two in the manifest: Sell (`parts.l`) and **Sell inc Install** (`parts.y`, `ROUNDDOWN(SUM(V:X))`, MPF_GROUND_TRUTH §6).
   - The 86 labour estimates, 10 Highfield option installs and 5 trailer adjustments are $0 supplied by design and priced fitted. `Labour Estimated - (0.25)` reads $44, and `Install - Highfield Console` reads $252.
   - **46 remain when every level is read:**
     - 21 real products blank at both levels, among them 8 Lone Star winch kits, 3 anchor kits, 3 hoses and a Minn Kota Terrova.
     - 16 lines at $0 at both levels whose names say they are included or not supplied, such as "Supplied with Motor" and "Trailer Plug - Std Factory Fit".
     - Formosa's 9.
   - The fix belongs in src/domain with a test: a line is unpriced only when every declared level is blank or $0. The build owns that change.
   - Until it lands, 147 is a figure that is false for 101 lines.
2. **Seven lists are never price-checked.**
   - These are Dealer Fit Packages (1,777 lines), Rigging Kits (650), Haines' and Jeanneau's factory packages (39 and 50), Labour Rates, Oils & Consumables, and Registration Costs. That is 2,580 lines.
   - None of them declares a price level, and `firstPrice` skips such a list. So MPF §8 item 12's "45 bundles currently have no sell price" cannot surface here.
   - The screen says so, as Steam Deck's *Unknown* (`docs/reference/explaining-a-refusal.md:141`).

**Citations re-checked.** Each still holds against this tree:
- MPF §8 item 14 (9 rows in the wrong band, 7 undercharged $117 each) holds to the dollar.
- HELMLOGIC_GROUND_TRUTH:775 ("can grab the wrong price") holds; its figures are production's.
- FITMENT_RULES §1.5 is what `soldAsPackage` encodes.
- Nix/Cargo in `explaining-a-refusal.md` ("rank the fixes and price them") is this screen's charter.

## 1. What is genuinely best — the five hard questions

**1 · Readable, and acted on.** The best make the *fix* the title, and price it.
- `live2/dependabot-create-update.png` heads the alert "**Upgrade addressable to fix 1 Dependabot alert** in Gemfile.lock", then one green **Create Dependabot security update**.
- `live2/aws-ta-cost.png` leads with **Potential monthly savings $7,082.26** in green, beside the counts.
- `live/sonarcloud-monica-issues.png` prices the set: "59 issues 4h 52min effort".
- `live/apple-iphone-storage.png` puts **Enable** at the row's end, then says what is kept ("Your documents & data will be saved").

A dealer acts when the row names his trailer, its dollars and one press, as the built screen already does (`review/built/m3-2-1440.png`: "Small · $166" → "Large · $283 +$117").

**2 · Grouping.**
- **By state, with the clean counted.** `live2/aws-ta-recs.png` reads *Action recommended 42 · Investigation recommended 127 · Checks with excluded items 28*, each split by category. `aws-ta-cost` adds **10 No problems detected** as a figure.
- **By the fix that clears several.** Dependabot says "fix **2** Dependabot alerts" (`live2/dependabot-dismiss.png`). Snyk groups issues under the upgrade that clears them (`live/snyk-fix.png`). OpenRefine shows clusters with their **New cell value**, size and row count (`live2/openrefine-cluster-dialog.png`).
- **By check.** HubSpot's tabs read **Name (4) · Email (0) · Location (2)** (`live2/hubspot-dq-formatting.png`).

The linter's severity is wrong for us: a $117 undercharge is "advisory" in nobody's books. So the order is money, then a wrong pick, then tidy, grouped inside each by the fix.

**3 · Applying a fix to the real file.**
- `live2/hubspot-dq-formatting.png` is a table: *Issue · Current · Proposed Fix ✎ · Accept · Reject*. The proposal can be retyped before it is written.
- `live2/gsheets-cleanup-panel.png` shows a tinted proposal, "Apply to all cells below", the cells it touches by address (B37 USA, B42 US), and ✓ / ✗.
- OpenRefine's **Merge selected & re-cluster** writes, then checks again.

Ours: the proposed cell beside the real one, one said `batch` through `catalogue/commands.ts`, Undo from the toast or History, and `review()` re-run after.

**4 · Dismissal, and whether it returns.**
- `live2/dependabot-dismiss.png` asks why, from five reasons ("A fix has already been started", "Risk is tolerable to this project", "This alert is inaccurate or incorrect"…), plus a comment.
- `live2/vercel-allowlist.png` is a text page, so it is cited for words only. Its entry keeps a **reason**, a **location** and the **details** that made it a finding.
- `checks.ts` already keys "left as meant" on the thing and its value, so a finding returns when the value moves.

Simple wins: two reasons, **"It's meant"** and **"The check is wrong here"** (the 101 labour lines prove we need the second). The left-alone are counted in one quiet line, as AWS counts "28 Checks with excluded items".

**5 · The clean day.**
- `live2/azure-advisor-score.png`: the Security card keeps its place and says **"You are following all of our security recommendations"** under a tick, while its neighbours carry counts. AWS counts its clean; HubSpot keeps **Email (0)**.
- `live/hemingway-clean.png` fails: every kind stays in its alarm colour at zero.

Ours: every check keeps its line as the sentence now true ("All 430 trailers with a weight are registered at their own size"), and under them the seven unchecked lists are named.

## 2. Patterns worth taking, named

Each is shown in §1; the names are what the boards cite.

| pattern | frame |
|---|---|
| The fix as the title | `live2/dependabot-create-update.png` |
| The savings figure | `live2/aws-ta-cost.png` |
| The counted clean | `live2/aws-ta-cost.png` |
| Clean in its own place | `live2/azure-advisor-score.png` |
| The zero tab | `live2/hubspot-dq-formatting.png` |
| Current → Proposed ✎ | `live2/hubspot-dq-formatting.png` |
| Apply to all, cells listed | `live2/gsheets-cleanup-panel.png` |
| Merge and re-check | `live2/openrefine-cluster-dialog.png` |
| The reason at the leave | `live2/dependabot-dismiss.png` |
| The top set | `live/sonarcloud-monica-issues.png` |
| Fix by the cause | `live/snyk-fix.png` |
| Kept, said before the act | `live/apple-iphone-storage.png` |
| The pair with the act between (the built screen's own primary) | `live/xero-reconcile-help-3.png` |

## 3. Type and motion, as observed

- **AWS**: big, light numerals over a coloured state word, the money in green at the same size; the figure is read first.
- **HubSpot**: a small grey label over each value; Accept outlined, so twenty rows of buttons stay quiet.
- **Dependabot**: a large regular title, the fix line bold with its count as a link, one saturated act.
- **Hemingway**: a serif for the document, a sans for the judgement (`live/hemingway-editor.png`).

No motion was observed, because the GIFs are captured at one instant. Wanted here: an accepted row leaves while the head's figure counts down (the kit's `Figure`), and changes in place under reduced motion.

## 4. What to avoid, each with its frame

- **Tiles with no count**: six illustrated report tiles and not one figure, so you open each to learn if anything is wrong (`live2/bitwarden-reports-img.png`).
- **A score**: "1038 FANTASTIC" (`live2/watchtower-dashboard.png`), "Score 54%" (`live2/azure-advisor-score.png`), and 100 / 96 / 100 / 80 rings (`live2/pagespeed-clean.png`).
- **A change with no base**: "6 ▲ 100%" and "detected by HubSpot AI", on equal cards whatever they cost (`live2/hubspot-dq-overview.png`).
- **Machinery on screen**: "Key collision · Fingerprint" (`live2/openrefine-cluster-dialog.png`), and "Old Algorithm / New Algorithm" (`live2/sentry-similar.png`).
- **Promotion before the work**: two banners take 500px above the first rule (`live2/grafana-alerts.png`).
- **Alarm at zero, and an upsell in a finding's slot** (`live/hemingway-clean.png`).
- **The same lesson three times** (`live/sonarcloud-monica-issues.png`).
- **Rules and Review as one shape**: the critic's open finding (`docs/directions/built-critique-m3-2.md`). The built foot is a stack of white rounded bars, each a title, a count and "Open" (`review/built/m3-2-1440.png`). No board below ends in that stack.
- **Text pages as exclusives** (critique-m2, fault 2): Vercel, Cloudflare, Google Ads and Figma's article gave words only. No board claims them.

## 5. Four directions

Drawn on 9 · 3 · **46** · 4 · 7, with 138 tidy and the seven unchecked lists (46 assumes the level fix; without it, draw 147 with its true split). Each is checked against this round's other compositions — Rules: margin, field, spine, card wall; Fitment: census, axis, callouts, matrix; Prices: matrix, sentences, forks, bands — and against the built plates.

### A · "The worktable" — one check at a time, proposal editable

- **Composition:** a full-width strip of check tabs in cost order, each with its count: *Wrong size 9 · Two prices 3 · No price 46 · Two under one name 4 · Nothing to name it 7 · Tidy 138*. A tab at zero keeps its tick. Under it sits ONE check's table: Line (mark and name) · What's wrong (the engine's sentence) · As it reads · Will read ✎ · Accept · Leave.
- **Order and grouping:** by check, then by list.
- **Exclusives:** `live2/hubspot-dq-formatting.png` and `live/sonarcloud-monica-issues.png`.
- **Only here:** the proposal is a cell the dealer may retype before it is written.
- **Reflow:**
  - **390:** the tabs become one select ("Wrong size · 9 ▾"); each row stacks the name, *reads → will read*, and two full-width acts.
  - **834:** "What's wrong" folds under the name.
  - **1920:** capped at 1,440, with the width going to the sentence.
- **Northside sets:** the tab order, the checks, and whether Tidy is a tab.
- **Risk:** its rows echo the built pair. It differs in showing one check, not the stack.

### B · "The statement" — reconciled like a bank statement

- **Composition:** a full-width ledger.
  - **Head:** **$819 not charged · $234 charged over · 46 not priced**, never netted.
  - **Four AWS-style bands:** *Costs money*, *Could give a wrong pick*, *Found nothing* (each check's true sentence with its tick, kept every day) and *Left as meant*.
  - **Lines:** each check is one statement line with right-aligned *Lines · Too little · Too much*, opening into its findings as a statement opens into transactions.
  - **Foot:** "Not yet checked: 7 lists, 2,580 lines, carry no declared price."
- **Order and grouping:** by state, then by money.
- **Exclusives:** `live2/aws-ta-cost.png` and `live2/azure-advisor-score.png`.
- **Only here:** the clean day reads like a settled account: every line ticked, both sums **$0**.
- **Reflow:**
  - **390:** each line takes two rows.
  - **834:** three columns.
  - **1920:** capped at 1,280.
- **Northside sets:** the checks, the band order, and whether *Found nothing* opens.

### C · "One at a time" — the case queue (recommended)

- **Composition:** a centred stage of about 720px holding one case:
  - the fix as the title: "Register the Offroad Single Sportski Trailer as Large";
  - the evidence: the line as it reads, its weight, and the label it was read from ("Up to 1.02t", `Registration Costs!C16`);
  - one priced act: "Change it · +$117";
  - "Leave it", with its two reasons;
  - what is kept.
- **Around the stage:** a rail above counts the cases left and "$819 still not charged", both from the engine. The next two cases peek beneath as titles.
- **Order and grouping:** one case per fix, by dollars, then by the number of lines it clears. A case may clear several lines ("Price the 8 Lone Star winch kits" opens the sheet at the first). Tidy comes last, as one case.
- **Exclusives:** `live2/dependabot-create-update.png` with `live2/dependabot-dismiss.png` (one product), and `live/apple-iphone-storage.png`.
- **Only here:** the price list settled in one sitting, line by line, with nothing else on screen.
- **Reflow:**
  - **390:** native; the acts sit at the thumb.
  - **834:** 640 wide.
  - **1920:** the stage holds at 720, and today's settled cases run as one counted line under it.
- **Northside sets:** the queue order, and whether Tidy enters it.
- **Risk:** Entry B's floated card. It differs: no photograph, no veil, and a queue rail.
- **Why recommended:** it is the simplest, native on a phone, and it ends; the last case becomes the clean day. Graft B's "both sums $0" sentence onto that clean day.

### D · "Clusters" — tick several, apply once, check again

- **Composition:** a full-width table, one row per fix. Each row has a tick, the lines in it (the two Mackay MLJ lines at $21,223 and $21,633), *Will read*, and the lines touched.
  - **Facets:** a 280px column of three small bar facets: dollars at stake, list, kind.
  - **Foot:** sticky, reading "Apply 6 ticked · 23 lines · one Undo". The checks re-run and the table re-clusters.
  - **Registration:** a size is never ticked in bulk, so each band fault is its own one-line cluster.
- **Order and grouping:** by fix, largest first.
- **Exclusives:** `live2/openrefine-cluster-dialog.png` and `live2/gsheets-cleanup-panel.png`.
- **Only here:** several faults cleared by one press, with the screen checking itself again.
- **Reflow:**
  - **390:** the facets become chips, the rows become ticked blocks, and the foot bar runs full width.
  - **834:** the facets become one filter row.
  - **1920:** 280 of facets and 1,120 of table.
- **Northside sets:** the default facet, and the Tidy clusters.
- **Risk:** the sheet's grid. It differs because its rows are fixes, not lines.

Tabbed table, statement, queue, clusters: by check, by state, by fix singly, by fix severally. None is a list beside a detail; none ends in rounded bars.

## 6. Imagery

**None.** The picture is the price list. The only images are makers' marks already held in `data/northside/marks-ledger.json`, at line height, as the built screen draws them. The clean day is set in type.
