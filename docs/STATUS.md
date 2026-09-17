# Where Milestone 0 stands

Rewritten 2026-09-17 after the port critique. The version before it was written on 2026-09-16, when the build ran out of usage credits mid-flight, and it still listed nine finished areas under "Not done" — the exact failure the plan diagnoses in the first attempt ("docs that lagged the tree, so sessions rebuilt what already existed"). Everything below is measured on this tree, in this session, not expected.

## Milestone 0 is complete and green

Measured 2026-09-17, on `main` with the round-2 and round-3 fixes in the working tree:

| command | result |
|---|---|
| `npm run typecheck` | clean, both `tsconfig.app.json` and `tsconfig.node.json` |
| `npm run lint` | `oxlint --max-warnings 0 src tools e2e`, clean |
| `npm run format:check` | clean |
| `npm run unit` | **146 files · 2,332 tests, all passing**, 55.27 s |
| `npm run check` | **14 rules, no failures**, and every rule now prints how many files it read |
| `npm run build` | 297.12 kB entry chunk (95.44 kB gzip), 1.68 s |
| `npm run e2e` | **102 tests over six viewports: 51 passed, 51 skipped, 0 failed**, 1.0 min |

The skips are honest and of two kinds. Sixteen are the rulers against screens that do not exist yet, each one naming what it will owe when they do (`density — no Cockpit screen exists yet (it will owe 18 rows at 1280×800)`). The other thirty-five are `e2e/rulers/fixture.spec.ts`, which proves the five rulers can fail and runs at one viewport because its pages are fabricated and its arithmetic does not change with the window — seven tests run, thirty-five say `the proof is read once, not per viewport`. That is the same shape `overlap` and `ramp` already use.

## Done and green

| part | evidence |
|---|---|
| The domain contract, `src/domain/model/*` | 68 tests. `orgId` required on every persisted record; `QuoteEvent`, `QuoteChapter`, `Verdict`, `CatalogueCtx` added. |
| The pack, `tools/seed/*` → `data/northside/*` | 50 tests (31 over the written pack, 13 through Dexie and back, 6 over the boot, 4 over the packer's verdict). 53 tables · 15,691 rows · 28 joins, asserted before writing. Old fingerprint `1qz08ne` reproduced. Deterministic ids: table = seed key, row = `key:ordinal`, field = `key.column`. |
| Cost columns | 139 named, up from the old repo's 115. The four it missed: `Total Nett CTD`, `Settlement`, `Discount`, `GP`. RRP and Sell stay visible — they are the customer's prices. |
| Pictures | 329 held (122 scene · 207 studio), 118 unheld, 6 refused. 12.1 MB. Provenance asserted from the image ledger. |
| The repository seam, `src/data/*` | 106 tests across the folder (93, plus the 13 over the hero and brand-mark ledgers). Memory and Dexie adapters under one `describe.each` contract suite; the identity-diff ledger ported verbatim. A wipe never clears quotes. `pack.dexie.test.ts` proves the reload. |
| Four stores | `src/state/{catalogue,session,prefs,quotes}.ts`. `prefs` is the only `localStorage` user; `quotes` carries the undo stack, the events and the write-behind. |
| The rule engine, the solver, the formula engine | `src/domain/rules/{engine,configure,formula,lint,adopt}`, ported verbatim with their suites. The plan's named `excludes` defect is fixed: the old `it.fails` is a plain passing test with the same assertion. |
| The seven engine port groups | fitment (incl. `trailerFitment`), constraints and discovery, the pure quote modules, views and catalogue, modules, table/levels/review/sentence rules, io/people/diary. |
| The quote engine | `freeze.ts` and `pairs.ts` on the injected `CatalogueCtx`, `commands.ts` with inverses and events, `src/state/quotes.ts`, the 529 Assault Pro golden diff (provenanced: the fixture carries the command line that produced it), and the two invariants against the real pack — an issued quote renders against an empty catalogue, and no cost value reaches a line, spec or pair fact. |
| Integration | the pack into Dexie end to end; `src/domain/index.ts` and the per-feature barrels. |
| The static guard, `tools/check.ts` | 14 rules — `no-literal-colour`, `no-undeclared-token`, `no-tiny-px`, `no-ui-selector-outside-ui`, `no-reader-facing-entity`, `no-cost-column-in-a-screen`, `font-tokens-and-faces-agree`, `domain-is-pure`, `domain-touches-no-dom`, `only-data-imports-dexie`, `only-prefs-uses-localstorage`, `no-usesyncexternalstore`, `source-is-text`, `no-old-design-system`. Every one has a fixture test proving it can fail (`tools/check/rules.test.ts`, 62 cases), every one prints the number of files it read, and a rule that read none fails the run. |
| The rulers | `e2e/rulers/{contrast,cut,density,overlap,ramp}.spec.ts` walking every declared route, over five measurements in `e2e/rulers/measure/*`; `e2e/rulers/fixture.spec.ts` proves all five can fail against planted pages. Plus the shot recipe and the two flows, run at six viewports (phone, phone landscape, tablet, laptop, desktop, wide). |
| The imagery ledgers | `images.json` in `src/data/pack.test.ts` (8 cases), and the hero tier and brand marks in `src/data/imagery.test.ts` (13). Every recorded `sha256` is recomputed from the bytes on disk; every hero's model resolves in its table's display field. |
| Primitives, `src/ui/*` | Thirteen Base UI wrappers refusing `className`/`style`, tested by role and text in 11 suites — three of the fourteen component files are covered inside a sibling's, because they are drawn together and testing them apart would be testing the harness: `PriceFigure` in `Figure.test.tsx`, `Refusal` in `Button.test.tsx`, `Input` in `Field.test.tsx` (a control with no label is not a control). `Button` renders `refusedBecause` as a sentence; `PriceFigure` never counts up; the Escape ladder is pure. Tokens are **provisional** and say so, and every motion value now cites the Material Design 3 token it is. |
| Research, Entry and Home | `docs/research/refs/{entry,home}/` with their notes and `sources.json`. |
| Imagery | `docs/research/imagery/*` — Highfield, Stacer, Stabicraft/Surtees, Jeanneau/Haines/Formosa, motors/trailers/brand marks, merged into `candidates.json`. |

## The round-1 port critique, and what it changed (2026-09-17)

The critic counted node suites folder by folder against `HL_Playground` and found six dropped with no note. All six are now in the tree, and `docs/DECISIONS.md` carries the dated line:

| old suite | where it is now | cases |
|---|---|---|
| `features/quote/issue.test.ts` | `src/domain/quote/issue.test.ts` | 19, whole |
| `features/crm/link.test.ts` | `src/state/customerLink.test.ts` | 15 of 19 — the four about `ensureCustomerRegister` need the M2 catalogue commands, and the file says so |
| `features/modules/moduleBlocks.test.ts` | `src/domain/modules/moduleBlocks.test.ts` | 11, whole, on the pack |
| `features/constraints/newRule.test.ts` | `src/domain/rules/constraints/newRule.test.ts` | 19, whole |
| `features/quote/referenceDay.test.ts` | `src/domain/quote/referenceDay.test.ts` | 6, whole |
| `features/quote/quoteTerms.test.ts` | `src/domain/quote/quoteTerms.test.ts` | 5, asserted at the mint rather than at a store setter that does not exist yet |

One export came with them: `nthToday` / `referenceForNow` in `freeze.ts`, with the registry as an argument instead of a module-level list. Before this, **nothing in the tree could mint a reference at all** — `mintQuote` takes one and no caller could compute it.

## The round-2 audit, and what it changed (2026-09-17)

Two majors and five minors, all closed. The gate moved from 143 files · 2,267 tests to **145 · 2,298**, and `check` from 11 rules to 13.

| finding | what was done |
|---|---|
| Three easing tokens in `tokens.css` were byte-identical to `HL_Playground/src/styles/system.css`, under the same names, with the duration ladder renamed beneath them — and the file cited nothing, so a reader could not tell a published curve from a lifted one | The curves and the ladder are Material Design 3's published motion tokens, each line naming the token it is. `src/ui/motion.ts`'s springs were the same old ladder in seconds and are now the same three durations as the CSS. The focus ring says which WCAG criterion its two-ring recipe answers |
| Three suites had each deferred "an organisation's identity survives a rename" to an admin screen that does not exist, so nothing measured it | `src/domain/people/organisation.ts` — `setOrganisation` and `setQuoteTerms`, pure, with the old store action's reasoning intact. 14 cases in its suite. The ten cases that can never come across (`orgKeyOf`, `legacyOrgKeyOf`, `adoptSlugKey`) are named with the decision that retired them; `undo.test.ts` and `quote/quoteTerms.test.ts` both point at it |
| — and chasing it found a live defect: `keepingOrganisation` put back the name and industry only, re-dating the business and re-deriving its key on every import | `ApplyPorts.setOrganisation` takes the whole profile. `memoryApply`'s replace now clears the organisation the way the store does, so the wrapper can be measured at all. 4 cases in `src/domain/io/keepOrganisation.test.ts` |
| `domain-is-pure` matched import lines, so a DOM global written inside a domain function passed it | `domain-touches-no-dom`, reading masked source like the two text rules, with six fixture cases |
| No guard could see a raw U+0000 or a CRLF line ending — the one defect class that had already shipped once in the old repo, green on every gate | `source-is-text`, one finding per file per kind with the count in the sentence, six fixture cases. `data/` is out of scope on purpose |
| Five old suites were legitimately out of scope but named nowhere | Five lines in `docs/LATER.md`, each saying what it measured and what it waits on |
| A stray 144 KB contact sheet at the repo root, in no ledger | Deleted, and `/*.png` and friends added to `.gitignore` so the next probe cannot land there |
| This file claimed thirteen primitives "each with a `.test.tsx`"; there are 11 suites for 14 component files | Corrected above, with the three that are covered inside a sibling named. `Input`'s one untested prop (`mono`) gained a case |

## The round-3 audit, and what it changed (2026-09-17)

Three majors and six minors; the majors and five of the minors are closed. The gate moved from 145 files · 2,298 tests to **146 · 2,332**, and `npm run e2e` from 60 tests to 102.

| finding | what was done |
|---|---|
| The five rulers proved they had measured something and never that they could detect a failure. Their measurements were closures passed to `page.evaluate` — unexported, unimportable, never run against a known-bad page — so the contrast sweep's five corrections were arithmetic nobody had watched fail, on a route with two measurable text nodes | Each measurement is its own module under `e2e/rulers/measure/`, moved with every line of its reasoning; the specs are the walk and the report. `e2e/rulers/fixture.spec.ts`, 7 tests, points all five at pages built to fail one named way at a time — hand-computed ratios (2.85 plain, 1.4 through two tints, 3.98 composited, 1.16 on the ramp), a planted overlap beside its three exemptions, a cut beside an elision on both axes, tokens inside an `@media`, twenty rows in view beside one below the fold |
| `no-cost-column-in-a-screen` — the guard that keeps cost off a customer's page — was scoped to `src/screens/`, which does not exist, so it read zero files while `check` printed `14 rules, no failures`. Its fixture test could not see that, because a fixture hands the rule a fabricated path | Both surface rules now cover `src/screens/`, `src/routes/` and `src/ui/`, because the plan puts the quote document at `routes/quote.$id.document`. `runRules` returns a per-rule file count, `tools/check.ts` prints all fourteen and exits non-zero on any rule that read nothing, and `rules.test.ts` runs the same walk over the real tree. The counts today: 160, 160, 190, 200, 201, 32, 32, 33, 3, 20, 34, 1, 511, 217 |
| The hero and brand-mark ledgers carried provenance that no test read — nothing asserted a hero's file exists, that a mark's bytes are the bytes recorded, or that a hero's model resolves to a real row | `src/data/imagery.test.ts`, 13 cases. Every entry one-for-one against its folder, every recorded `sha256` recomputed off the disk, no hero larger than its source, every hero's model found in its table's display field, every mark's brand named by a table or by a row, and the one refused mark (Stabicraft) carrying a measured reason with no stand-in |
| `no-old-design-system` was dark on CI with nothing recording it, and could not see a value lifted into a `.ts` file — which was half of the defect it was written for | It reads `.ts`/`.tsx` under `src/` as well, searching for the old values as literal strings; test files stay out of reach so the fixture can still fabricate one. `tools/check.ts` prints how many old values it compared against and from where (67, from `C:\Users\Asaf\dev\HL_Playground`), and a test asserts the set is non-empty on a machine that has the old repo |
| `LATER.md`'s register of old suites that did not come across named five; the critic counted 29 more | All 29 are in `docs/LATER.md` now with their case counts (500 in total) and what each waits on, plus the seven that read as dropped and are not — including `features/search/encoding.test.ts`, which came across as the `source-is-text` rule rather than as a suite |
| `Menu` and `Select` proved a refusal is described, not that a keyboard can reach it — which rested on two Base UI internals nobody asserts | Both suites walk the arrows onto the refused row, assert focus lands there and that it still refuses to act |
| Two pointer errors: `tools/check.ts` named a fixture file that does not exist, and `ports.test.ts` checked one of the two ports `launch.json` repeats | The header names `tools/check/rules.test.ts`; `ports.test.ts` checks both ports and that they differ |
| `marque.ts` defined an exported flag by `--t-hero`, a token from the old repo's ramp that does not exist here | The ported sentence stays as written; a note beside it says the token is the old ramp's, that nothing visual crosses, and how the first screen that draws a lockup should read `long` |

Not closed, and it is not a defect: `docs/STATUS.md` and `docs/DECISIONS.md` lagging the tree is fixed by this section and by five new dated lines, but the drift itself can only be prevented by measuring before writing, which is what this file says at the top.

## Not done — and it is Milestone 1's work, not a gap

1. **Every screen.** Nothing under `src/screens/` exists yet. Milestone 1 is entry → home → catalogue → configurator → document, each one from its own reference sweep and its own picked direction.
2. **The organisation record and the admin screens** that type the standing terms, the name and the appearance. `OrgProfile` reaches the engine as `ctx.org`; nothing writes it.
3. **The catalogue commands** — `createEntity`, `addField`, `addRow`, `updateCell`, `deleteRow` and the project history stack. Milestone 2. Four ported test cases are waiting on them, named in `src/state/customerLink.test.ts`, and two old modules are parked in `docs/LATER.md` for the same reason.

## Open questions for the owner

Carried from the plan, still unanswered, none blocking:

1. The 1,193 obsolete Highfield SKUs: a 26th retired table, or none?
2. Where to record the 25 Mercury and twin-bundle motor names the Motor Library does not hold.
3. What the 121 Highfield colourway codes `I`, `O`, `R`, `WH` mean. A question for the dealer, never a guess.
4. `public/seed-images` is 12.1 MB. Smaller long edge, lower quality, or leave it?
5. Two money columns worth an eye: `rig_kits` carries `Sell Price`/`Trade Price` that the old engine never priced, and no rung reads them.

## Open follow-ups (2026-09-17)

- **The home boards were briefed that `public/brand-marks/` does not exist.** It did not when they started; seventeen marks landed while they were drawing, covering twelve of thirteen brands. So every home board says its brand row is named in type and describes what it becomes when marks arrive. They have arrived. After the home critique settles, run one more pass letting each board use `public/brand-marks/*` where its own idea calls for it, and check `data/northside/marks-ledger.json` first: Mercury is white-ink only and Stabicraft has no mark at all, so a shelf must handle both without a hole in it.
- **The entry boards predate two requirements.** They were drawn before the owner asked for responsive at every screen size and before customisation became architecture, so unlike the home boards they carry no `reflow` or `replaceable` answer. Whichever direction he picks must answer both before it is built as a screen.
