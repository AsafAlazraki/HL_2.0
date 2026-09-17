# Where the rebuild stands

Written 2026-09-17. Everything below is measured on the tree, not expected. `npm test` and `npm run build && npm run e2e` are green.

## Milestone 0 is done

| part | evidence |
|---|---|
| **The golden proof** | The Stacer 529 Assault Pro, frozen by the OLD engine against the OLD seed and by the NEW engine against the NEW pack, is the same document member for member: hull $28,530, the six Yamahas with the F90LB starred at $14,330, the TA1400S13SB trailer at $8,703, and every spec, rung source cell, provenance note, pair fact, denominator and rule reason. |
| The domain contract | `src/domain/model/*`, fifteen files, every argued comment kept. `orgId` required on every persisted record; `QuoteEvent`, `QuoteChapter`, `Verdict` and `CatalogueCtx` added. |
| The pack | 53 tables · 15,691 rows · 28 joins, asserted before writing, the old fingerprint `1qz08ne` reproduced, deterministic ids. `npm run pack` rebuilds it in ~15 s. |
| Cost columns | 139 named, up from the old repo's 115. The four it missed: `Total Nett CTD`, `Settlement`, `Discount`, `GP`. |
| The engine | Solver, formula engine, rule engine, linter, trailer fitment with its arc-consistency solver, constraints and discovery, the quote modules, views, catalogue, modules, table, levels, review, sentence rules, io, people, diary. Each with its suite. No assertion edited. |
| The quote engine | `freeze.ts` byte-for-byte then mechanically edited: fourteen store reads and six live reads became one injected context across seventeen functions. Twenty-five mutators became commands with inverses and typed events. Undo lifted out with an injected clock. |
| The seam | Memory and Dexie adapters under one contract suite, the identity-diff ledger ported with its nine tests, a wipe that never clears quotes. |
| Pictures | 329 catalogue copies at long edge 1100, plus eight stage heroes at 2560 and seventeen brand marks for twelve of thirteen brands, each with provenance. |
| The app | The browser loads the pack and reads 53 tables and 15,691 rows back out, asserted at all six viewports. |
| Gates | 146 test files, 2,332 tests, 14 static rules each reading real files, 51 Playwright checks across six viewports. |

## What the audits caught that the builders missed

Three verify-and-critique rounds ran after the port. Each found something no single agent could see.

1. **Five suites, 77 cases, dropped without a note**, each sitting on a boundary between two port groups. The quote-issue gate, customer freezing, the module-blocks suite, the rule-creation guard, and the timezone suite that pins Brisbane as UTC+10 where a morning instant belongs to the previous UTC day. All recovered.
2. **The old design system crossed anyway.** Three easing tokens byte-identical to `HL_Playground/src/styles/system.css`, same names, same order — in a repo where every agent's brief forbids it. The first fix replaced one with another curve copied from the old repo's `ds.css`. `tools/check/oldSystem.ts` now refuses any authored value that reappears from the old stylesheets, with one auditable exemption for published standards.
3. **A guard was reading zero files and the run said "no failures".** `no-cost-column-in-a-screen` was scoped to a folder that does not exist, so the rule protecting cost from a customer surface measured nothing. A fixture test cannot see this; only a walk of the real tree can. The run now prints a per-rule file count and fails a rule that read nothing.
4. **The rulers had never been seen to fail.** Each guarded its own non-vacuity, but on a tree with one placeholder route "0 below threshold" is also what a broken parser returns. Each now has a page built to fail in front of it.

## Milestone 1: two screens built and joined, both provisional

Written 2026-09-17, measured on this tree. Entry and Home are built from the recommended boards while the owner was away, under the plan's standing rule, and are marked **provisional** in `docs/SCREENS.md` until he has looked. The Milestone 0 placeholder at `/` is gone; the evidence it printed is asserted in `e2e/flows/pack-loads.spec.ts` against Home's own stamp.

The shell that joins them: a browser with no name in the session lands on Entry, one with a name lands on Home, both as `beforeLoad` redirects. Entry's blue door is the only thing in the app that can fetch the price file; Home calls `catalogue.load(repository)`, which cannot — so the blank door leaves Home honestly empty, and a second visit reads the whole sheet back out of IndexedDB in 315 ms on a desk and 392 ms in a hand with no pack file fetched. A blank desk says so and offers the door back at `/sign-in?again=true`, with the remembered name already in the field.

Gates after Milestone 1's first two screens: **151 test files, 2,401 tests**, 14 static rules, **131 Playwright checks passing across six viewports** (61 skipped: the ruler fixtures and the viewport-scoped rulers, plus density, which has no Cockpit screen to measure yet).

## The configurator is built, and the picker now opens it (2026-09-17)

`/quote/$id` is built from direction **B, "Stage and rail"** of `docs/research/refs/configurator/notes.md` §5, chosen by the builder because the owner handed the picks over, and **provisional** in `docs/SCREENS.md` until he has looked. The picker's one refusal — "the configurator is not built yet" — is retired by having built it: pressing *Start the quote* now navigates to the document it just wrote, and `e2e/flows/picker.spec.ts` asserts it lands rather than asserting the old apology.

**Six chapters, and not one of them is a table.** `orderBands` gives the four the price file can carry — 01 The hull · 02 Motor · 03 Trailer · 04 Dealer fit — and the two it cannot follow them: *Who it is for* and *The finale*. On a Highfield SP560 that is seven of the file's own tables folded into four chapters, with the trailer chapter holding two headings and the dealer-fit chapter three.

**What is measured on this tree, on that hull:**

| | |
|---|---|
| the running price | `$66,584` in the masthead at the first paint, sticky at every width, a `PriceFigure` that never animates |
| the shut build | four chapter heads state their own answer and their own subtotal, so the whole build reads in six lines |
| chapter 01 | 15 finishes of the SP560, seven PVC at a delta of `no change` and eight Hypalon at `+$7,010` — each priced by re-rooting the document and asking the one summation what it would total |
| the search | one field over every chapter: "battery" selects 172 rows, 170 of them past a shortlist, in 18 ms, with the match bolded and the dealer's own code beside every name |
| a refusal | a row the pairings left out stays an ordinary live row, and the engine's own sentence is said once above the list where every row off it gives the same reason |
| undo | on every pick, in the rail's head, pinned to the command's event id, with "Put it back" after a way back |
| the finale | `issueBlockers`' own sentence under a refused act; issued, the screen goes read-only with `ISSUED_REFUSAL` on every control and offers a new version |

**Two things in the engine were genuinely missing and were put there with tests.** `QuoteLine.code` — the code a dealer orders by, frozen by `mintLine` from the four spellings this file uses, because a frozen line could say which workbook cell a figure came from and not what a supplier would recognise on the phone. And `finishLevels` in `domain/catalogue/fold.ts`, which parsed its own key back apart with `lastIndexOf(':')` and therefore returned the EMPTY SET for every table on this dealer's file, silently; nothing had called it yet, and its suite passed fabricated row ids with no colon in them.

Gates after it: **159 test files, 2,557 tests**, 14 static rules, **263 Playwright checks passing across six viewports**, 90 skipped.

**The one red check, and it is not this screen's.** `density — quotes` reads 6 rows at 1280×800 against a requirement of 18, because every ruler opens a browser nobody has used and the register is honestly empty — the three band headers and the three notices under them are what a grid exposes as rows. `docs/DECISIONS.md` records that state being accepted when the register joined `e2e/routes.ts`. What has changed is that the app can now MINT a quote, so the ruler harness can grow the third `arrive` mode that entry names — a walk that signs in, loads the file, picks a hull and starts a quote — and point density at a register with documents in it. That is a change to `e2e/routes.ts` and five rulers rather than to any screen, and it is the first thing to do next.

**`/quote/$id` is deliberately NOT in `e2e/routes.ts` yet**, for the same reason: neither `fresh` nor `through-the-door` reaches a document. The geometry it owes is measured in `e2e/flows/configurator.spec.ts` at all six widths instead, which is what `quotes.spec.ts` does for its own rows.

## Design: every built screen has directions, and the owner has not looked

- **Entry.** Four boards at `docs/directions/entry/`, critiqued and revised. Recommended: **B, "Veil and card"** — a Stacer 481 SeaMaster at dusk under a veil, a card clear of the water, two doors as full-width bars, and a panel naming the photograph's own row (`boat_stacer`, 91 rows) so the picture is not decoration.
- **Home.** Four boards at `docs/directions/home/`. Recommended: **B, "Cinema day"** — a Highfield on open water, six figures readable across a desk, one amber act. The critic: the only one that looks like a boat business rather than a spreadsheet with a greeting on it.
- Rebuild either canvas with `npx tsx tools/research/board.ts <screen>`; screenshot with `npx tsx tools/research/shots.ts <screen>`.

## Research and imagery, complete

110 reference frames for entry and home's own set, three modalities each, every claim tied to the frame that shows it. 4,768 picture candidates across eighteen brands, 4,320 verified live with pixel sizes. Highfield publishes real on-water photography per model up to 8047×5367, which retired the plan's biggest visual risk; Stacer publishes its on-water work at web size, which is why a board must say which brand it stands on.

## Next

1. The owner looks at Entry and Home in the browser and says yes, or says what to change. Both are built and provisional until he does.
2. Milestone 1's remaining screens: picker, place, configurator, cascade, document, quotes register — each with its own sweep and directions. Each joins `e2e/routes.ts` on the day it is built, and says how it is reached.
3. The first refusals to retire as their screens arrive: New quote (waiting on the picker), and both photograph plates on Home (waiting on a register screen).

## Open questions for the owner

1. The 1,193 obsolete Highfield SKUs: a 26th retired table, or none?
2. Where to record the 25 Mercury and twin-bundle motor names the Motor Library does not hold.
3. What the 121 Highfield colourway codes `I`, `O`, `R`, `WH` mean. A question for the dealer, never a guess.
4. `public/seed-images` is 12.1 MB. Smaller long edge, lower quality, or leave it?
5. `rig_kits` carries `Sell Price` and `Trade Price` that the old engine never priced and no rung reads.
6. Does "full customisability" stop at colour, mark and pictures, or extend to handing over the layout? The second is a page builder and its own milestone. See `docs/CUSTOMISATION.md`.
