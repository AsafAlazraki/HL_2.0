/**
 * The one static guard. Each rule lands with the code it protects (Milestone 0 step 7)
 * and ships with a fixture test in `tools/check/rules.test.ts` that proves it can fail.
 *
 * Planned rules: no literal colour outside the token file; no undeclared `var(--…)`;
 * no font size under 11px; no `localStorage` outside `src/state/prefs.ts`; no
 * `useSyncExternalStore` anywhere; no "entity" or "UID" in reader-facing strings; no cost
 * column name on a rendered surface; `src/domain` imports no React, store, DOM or Dexie;
 * nothing outside `src/data` imports Dexie; no `.ui-` selector outside `src/ui`.
 *
 * Two more were added after the round-2 audit, and both close a hole the plan's list left:
 * `domain-touches-no-dom` reads the globals the import rule structurally cannot see
 * (`document`, `window`, `new Image()`), and `source-is-text` refuses a raw U+0000 or a
 * CRLF line ending, which is the one class of defect every other gate here is blind to.
 * A fourteenth, `no-old-design-system`, came out of the round-2 critique's finding that
 * three easing tokens had been copied byte-for-byte out of HL_Playground.
 *
 * AND THE RUN SAYS WHAT EACH RULE MEASURED. A fixture test proves a rule CAN fire; it
 * cannot prove the rule is pointed at anything, because it hands the rule a fabricated
 * path. `no-cost-column-in-a-screen` was scoped to `src/screens/`, which does not exist on
 * this tree, so the highest-stakes honesty guard in the repo read zero files for a week and
 * the run printed the same cheerful line it prints when everything is checked. So every
 * rule's file count is printed, and a rule that read NOTHING is a failure with its own
 * sentence: a guard aimed at a folder that is not there is not a guard.
 */
import { oldSystemEvidence, rules } from './check/rules'
import { blindRules, runRules } from './check/run'

const { failures, read } = await runRules(rules, process.cwd())

const width = Math.max(...read.map((r) => r.rule.length))
for (const r of read) console.log(`  ${r.rule.padEnd(width)}  ${String(r.files).padStart(4)} files`)
console.log(
  oldSystemEvidence.values > 0
    ? `  (no-old-design-system compared against ${oldSystemEvidence.values} authored values from ${oldSystemEvidence.root})`
    : `  (no-old-design-system found no old repo at ${oldSystemEvidence.root}, so it compared against nothing — it is evidence, not a dependency)`,
)

const all = [...blindRules(read), ...failures]
if (all.length > 0) {
  for (const f of all)
    console.error(`${f.rule}: ${f.file}${f.line ? `:${f.line}` : ''} — ${f.message}`)
  console.error(`\ncheck: ${all.length} failure${all.length === 1 ? '' : 's'}`)
  process.exit(1)
}
console.log(`check: ${rules.length} rule${rules.length === 1 ? '' : 's'}, no failures`)
