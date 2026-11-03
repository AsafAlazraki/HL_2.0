/* ============================================================
   REVIEW'S CASES, BY THE LIST EACH ONE IS ON — so Data can say on a
   list's own row how many of Review's cases stand on it (the judge of
   Data, 2026-11-03, L11: the wide screens' blank right half carries
   each list's state).

   Counted off the same queue Review walks (`queueOf`), so the cases on
   every list add back to the figure on Review's door. Pure.
   ============================================================ */
import { tableOfCase, type Case } from './cases'

/** The list a case stands on. */
export const listOfCase = (c: Case): string => tableOfCase(c)

/** How many cases stand on each list, by its id. */
export function casesByList(cases: readonly Case[]): Map<string, number> {
  const out = new Map<string, number>()
  for (const c of cases) {
    const id = listOfCase(c)
    out.set(id, (out.get(id) ?? 0) + 1)
  }
  return out
}
