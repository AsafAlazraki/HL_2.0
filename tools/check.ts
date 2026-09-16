/**
 * The one static guard. Each rule lands with the code it protects (Milestone 0 step 7)
 * and ships with a fixture test in `tools/check.test.ts` that proves it can fail.
 *
 * Planned rules: no literal colour outside the token file; no undeclared `var(--…)`;
 * no font size under 11px; no `localStorage` outside `src/state/prefs.ts`; no
 * `useSyncExternalStore` anywhere; no "entity" or "UID" in reader-facing strings; no cost
 * column name under `src/screens`; `src/domain` imports no React, store, DOM or Dexie;
 * nothing outside `src/data` imports Dexie; no `.ui-` selector outside `src/ui`.
 */
import { rules } from './check/rules'
import { runRules } from './check/run'

const failures = await runRules(rules, process.cwd())
if (failures.length > 0) {
  for (const f of failures)
    console.error(`${f.rule}: ${f.file}${f.line ? `:${f.line}` : ''} — ${f.message}`)
  console.error(`\ncheck: ${failures.length} failure${failures.length === 1 ? '' : 's'}`)
  process.exit(1)
}
console.log(`check: ${rules.length} rule${rules.length === 1 ? '' : 's'}, no failures`)
