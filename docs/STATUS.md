# Where Milestone 0 stands

Rewritten 2026-09-17 after the port critique. The version before it was written on 2026-09-16, when the build ran out of usage credits mid-flight, and it still listed nine finished areas under "Not done" — the exact failure the plan diagnoses in the first attempt ("docs that lagged the tree, so sessions rebuilt what already existed"). Everything below is measured on this tree, in this session, not expected.

## Milestone 0 is complete and green

Measured 2026-09-17, on `main` with the round-1 fixes in the working tree:

| command | result |
|---|---|
| `npm run typecheck` | clean, both `tsconfig.app.json` and `tsconfig.node.json` |
| `npm run lint` | `oxlint --max-warnings 0 src tools e2e`, clean |
| `npm run format:check` | clean |
| `npm run unit` | **143 files · 2,267 tests, all passing**, 57.19 s |
| `npm run check` | **11 rules, no failures** |
| `npm run build` | 297.12 kB entry chunk (95.44 kB gzip), 1.94 s |
| `npm run e2e` | **60 tests over six viewports: 44 passed, 16 skipped, 0 failed**, 59.6 s |

The sixteen skips are honest: five rulers × the screens that do not exist yet, each one naming what it will owe when they do (`density — no Cockpit screen exists yet (it will owe 18 rows at 1280×800)`).

## Done and green

| part | evidence |
|---|---|
| The domain contract, `src/domain/model/*` | 68 tests. `orgId` required on every persisted record; `QuoteEvent`, `QuoteChapter`, `Verdict`, `CatalogueCtx` added. |
| The pack, `tools/seed/*` → `data/northside/*` | 50 tests (31 over the written pack, 13 through Dexie and back, 6 over the boot, 4 over the packer's verdict). 53 tables · 15,691 rows · 28 joins, asserted before writing. Old fingerprint `1qz08ne` reproduced. Deterministic ids: table = seed key, row = `key:ordinal`, field = `key.column`. |
| Cost columns | 139 named, up from the old repo's 115. The four it missed: `Total Nett CTD`, `Settlement`, `Discount`, `GP`. RRP and Sell stay visible — they are the customer's prices. |
| Pictures | 329 held (122 scene · 207 studio), 118 unheld, 6 refused. 12.1 MB. Provenance asserted from the image ledger. |
| The repository seam, `src/data/*` | 93 tests across the folder. Memory and Dexie adapters under one `describe.each` contract suite; the identity-diff ledger ported verbatim. A wipe never clears quotes. `pack.dexie.test.ts` proves the reload. |
| Four stores | `src/state/{catalogue,session,prefs,quotes}.ts`. `prefs` is the only `localStorage` user; `quotes` carries the undo stack, the events and the write-behind. |
| The rule engine, the solver, the formula engine | `src/domain/rules/{engine,configure,formula,lint,adopt}`, ported verbatim with their suites. The plan's named `excludes` defect is fixed: the old `it.fails` is a plain passing test with the same assertion. |
| The seven engine port groups | fitment (incl. `trailerFitment`), constraints and discovery, the pure quote modules, views and catalogue, modules, table/levels/review/sentence rules, io/people/diary. |
| The quote engine | `freeze.ts` and `pairs.ts` on the injected `CatalogueCtx`, `commands.ts` with inverses and events, `src/state/quotes.ts`, the 529 Assault Pro golden diff (provenanced: the fixture carries the command line that produced it), and the two invariants against the real pack — an issued quote renders against an empty catalogue, and no cost value reaches a line, spec or pair fact. |
| Integration | the pack into Dexie end to end; `src/domain/index.ts` and the per-feature barrels. |
| The static guard, `tools/check.ts` | 11 rules — `no-literal-colour`, `no-undeclared-token`, `no-tiny-px`, `no-ui-selector-outside-ui`, `no-reader-facing-entity`, `no-cost-column-in-a-screen`, `font-tokens-and-faces-agree`, `domain-is-pure`, `only-data-imports-dexie`, `only-prefs-uses-localstorage`, `no-usesyncexternalstore`. Every one has a fixture test proving it can fail (`tools/check/rules.test.ts`, 33 cases). |
| The rulers | `e2e/rulers/{contrast,cut,density,overlap,ramp}.spec.ts`, plus the shot recipe and the two flows, run at six viewports (phone, phone landscape, tablet, laptop, desktop, wide). |
| Primitives, `src/ui/*` | Thirteen Base UI wrappers refusing `className`/`style`, each with a `.test.tsx` by role and text; `Button` renders `refusedBecause` as a sentence; `PriceFigure` never counts up; the Escape ladder is pure. Tokens are **provisional** and say so. |
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
