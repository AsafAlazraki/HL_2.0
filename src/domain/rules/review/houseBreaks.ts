/* ============================================================
   THE PRICE LIST BREAKING ITS OWN RULES (the judge of Review, data
   round 2026-11-04, missing item 7: "the Rules measures name no
   exceptions anywhere"; Review is where they become cases).

   Rules measures each of the price list's own clauses on the sheet
   loaded here (`houseMeasures.ts`) and keeps every offer that breaks
   it, with the pairing line it is written on. This reads those same
   measures — never a second count — and keeps the clauses the price
   list ASSERTS and REFUSES on (evidence 'asserted', not counted
   'under'): a clause that is never refused ("a trailer rated under the
   boat's weight is never refused") has offers under it by design, and
   a pattern nobody wrote down ('observed') is not the file's rule to
   break. A clause measured to hold on every offer makes no case.

   PURE: the lists and their lines in, the clauses broken out.
   ============================================================ */

import { PAIRING_RULES } from '@/domain/rules/constraints/ruleLedger'
import { WORKBOOK_RULES, type WorkbookRuleRef } from '@/domain/rules/constraints/workbookRules'
import { groupExceptions, measureClause } from '@/domain/rules/constraints/houseMeasures'
import type { Meant, ReviewWorld } from './checks'

export interface HouseBreak {
  key: string
  /** the boat as a person says it */
  boat: string
  /** what it is offered */
  what: string
  /** why it breaks the clause, in the dealer's words */
  why: string
  /** the pairing lines that write it (a model's colourways each write it again) */
  lines: Array<{ list: string; listName: string; line: string }>
}

export interface HouseClause {
  key: string
  ref: WorkbookRuleRef
  /** the clause in the ledger's own words */
  said: string
  /** offers it was tested on, and of those how many hold: the measure Rules draws */
  held: number
  tested: number
  breaks: HouseBreak[]
}

export function houseBreaks(world: ReviewWorld, meant: Meant = {}) {
  const clauses: HouseClause[] = []
  let left = 0
  for (const entry of PAIRING_RULES) {
    if (entry.counts === 'under') continue
    const seed = WORKBOOK_RULES.find((s) => s.ref === entry.ref)
    if (seed?.evidence !== 'asserted') continue
    const measured = measureClause(entry.ref, world)
    if (!measured || measured.under || measured.exceptions.length === 0) continue
    const breaks: HouseBreak[] = []
    for (const g of groupExceptions(measured.exceptions)) {
      const first = g.lines[0]
      if (!first) continue
      const key = `house:${entry.ref}:${first.list}:${first.line}`
      if (meant[key]) {
        left += 1
        continue
      }
      breaks.push({ key, boat: g.boat, what: g.what, why: g.why, lines: g.lines })
    }
    if (breaks.length > 0)
      clauses.push({
        key: `house:${entry.ref}`,
        ref: entry.ref,
        said: entry.said,
        held: measured.held,
        tested: measured.tested,
        breaks,
      })
  }
  return { clauses, count: clauses.reduce((n, c) => n + c.breaks.length, 0), meant: left }
}
