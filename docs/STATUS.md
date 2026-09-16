# Where Milestone 0 stands

Written 2026-09-16, after the build ran out of account usage credits mid-flight. Everything below is measured, not expected. `npm test` and `npm run build && npm run e2e` are green at commit `426344a`.

## Done, green, committed

| part | evidence |
|---|---|
| The domain contract, `src/domain/model/*` | 68 tests. Fifteen files, every argued comment kept. `orgId` required everywhere; `QuoteEvent`, `QuoteChapter`, `Verdict`, `CatalogueCtx` added. |
| The pack, `tools/seed/*` → `data/northside/*` | 41 tests. 53 tables · 15,691 rows · 28 joins, asserted before writing. Old fingerprint `1qz08ne` reproduced. Deterministic ids. `npm run pack` re-runs it in ~15 s. |
| Cost columns | 139 named, up from the old repo's 115. The four it missed: `Total Nett CTD`, `Settlement`, `Discount`, `GP`. |
| Pictures | 329 held (122 scene · 207 studio), 118 unheld, 6 refused. 109 fetched this session, none refused. 12.1 MB. |
| The repository seam, `src/data/*` | 72 tests. Memory and Dexie adapters under one contract suite; the identity-diff ledger ported verbatim with its 9 tests. A wipe never clears quotes. |
| Three stores, `src/state/{catalogue,session,prefs}.ts` | Tested. `prefs` is the only `localStorage` user. |
| The solver and the formula engine, `src/domain/rules/{configure,formula}` | Ported verbatim with their suites. The plan's named `excludes` defect is fixed: the old `it.fails` is a plain passing test with the same assertion. |
| Leaf libraries | `src/domain/{id,money,mark}.ts`. |
| Primitives, `src/ui/*` | Thirteen Base UI wrappers refusing `className`/`style`; `Button` renders `refusedBecause` as a sentence; `PriceFigure` never counts up; the Escape ladder is pure. Tokens are **provisional** and say so. |
| Research, Entry screen | Three modality notes under `docs/research/refs/entry/` (live, gallery, stock) with ~90 frames and their `sources.json`. |
| Research, Home screen | Live frames only, `docs/research/refs/home/live/`. No notes. |
| Imagery, Highfield and Stacer | `docs/research/imagery/{highfield,stacer}.{json,md}`: 2,207 verified candidates. **Highfield has real on-water photography after all** — `media.highfieldboats.com` carries per-model galleries, 8 photographs of the SP560 alone up to 8047×5367. That removes the plan's biggest visual risk. |

## Not done — the agents died here

Every one of these failed with "You're out of usage credits", not with a code error. Nothing is half-written in the tree: the gate is green because the failed agents wrote nothing.

1. **The rule engine port** (`lib/rules/*` → `src/domain/rules/engine/*`), the linter (`lib/lint`), `adopt.ts`, and the shared measurement-aware comparator `src/domain/compare.ts`.
2. **Seven engine port groups**: fitment (incl. `trailerFitment.ts`), constraints and discovery, the pure quote modules, views and catalogue, modules, table/levels/review/sentence rules, io/people/diary.
3. **The quote engine**: `freeze.ts` and `pairs.ts` with the injected `Ctx`, `commands.ts` with inverses and events, `undo.ts`, `src/state/quotes.ts`, the golden 529 Assault Pro diff, the empty-catalogue and no-cost invariants.
4. **Integration**: the pack into Dexie end to end, `src/domain/index.ts` as a curated barrel.
5. **Guards beyond the four layering rules**: no literal colour, no undeclared token, no px under 11, no `.ui-` outside `src/ui`, no reader-facing "entity"/"UID", no cost column name under `src/screens`, font-face cross-check. Each needs its fixture test.
6. **The rulers** under `e2e/rulers/`: contrast, overlap, cut, ramp, density. Only the smoke flow exists.
7. **Component tests for `src/ui`** (by role and text).
8. **Research**: the Entry and Home syntheses (`notes.md`, `sources-index.md`), the Home gallery and stock sweeps, the completeness critic.
9. **Imagery**: Stabicraft/Surtees, Jeanneau/Haines/Formosa, motors/trailers/brand marks, and the merge into `candidates.json` with `tools/research/measure-images.ts`.

## How to resume

The three workflows cache every completed agent. Re-invoking with the same run id replays the finished ones instantly and runs only what failed:

```bash
# in Claude Code, not a shell:
# Workflow({scriptPath: '…/hl2-milestone-0-port-wf_63533489-56f.js',        resumeFromRunId: 'wf_63533489-56f',  args: {date: '2026-09-16'}})
# Workflow({scriptPath: '…/hl2-research-sweep-entry-home-wf_63c46360-be7.js', resumeFromRunId: 'wf_63c46360-be7', args: {date: '2026-09-16'}})
# Workflow({scriptPath: '…/hl2-imagery-sourcing-wf_93682bb8-ffd.js',        resumeFromRunId: 'wf_93682bb8-ffd', args: {date: '2026-09-16'}})
```

The scripts live under `C:\Users\Asaf\.claude\projects\C--Users-Asaf-Desktop-HL-2-0\854574d4-cd08-4d5d-b540-e243f2c0a446\workflows\scripts\`. Each run's `journal.jsonl` beside it holds every finished agent's full report.

Resume needs account usage credits: claude.ai/settings/usage.

## Open questions for the owner

Carried from the plan, still unanswered, none blocking:

1. The 1,193 obsolete Highfield SKUs: a 26th retired table, or none?
2. Where to record the 25 Mercury and twin-bundle motor names the Motor Library does not hold.
3. What the 121 Highfield colourway codes `I`, `O`, `R`, `WH` mean. A question for the dealer, never a guess.
4. `public/seed-images` is 12.1 MB. Smaller long edge, lower quality, or leave it?
5. Two money columns worth an eye: `rig_kits` carries `Sell Price`/`Trade Price` that the old engine never priced, and no rung reads them.
