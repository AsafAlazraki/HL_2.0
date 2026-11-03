/* ============================================================
   THE PRICE LIST'S OTHER RULES: THE ONES THAT HOLD, AND THE ONE THAT
   CANNOT BE TESTED (the verifier of Review, 2026-11-04, round 1:
   "the judge's rule exceptions 16 and 127 are not drawn").

   The judge read three exceptions off the workbook's own measures in
   the rule ledger (`ruleLedger.ts`): the 3 that break the shaft rule
   (F6), the 16 that break the kit-range rule (F15, 555 of 571) and the
   127 that break the propeller rule (A3, 3,890 of 4,017). Review draws
   the 3 as a case (`houseBreaks.ts`). The 16 and the 127 are not on
   this price list, and that is said, measured, rather than left out:

     F15 is measured on the sheet here, and holds on every offer it can
         be tested on (501 of 501 on the pack of 16 September 2026) —
         the workbook's 16 are the workbook's figure, said as such.
     A3  cannot be tested on any sheet this app reads: the motor list
         writes "Opt" for its propeller on most of its motors (181 of
         the 209 Yamahas), so an offer names no one propeller to
         compare with. That count is measured here, off the file.

   Only the clauses Review reads are said: the price list ASSERTS them
   (evidence 'asserted') and REFUSES on them (not counted 'under') —
   the same filter `houseBreaks` keeps, so the two never disagree about
   which rules are the file's own.

   PURE: the lists and their lines in, the clauses out.
   ============================================================ */

import { isDiscontinued, readCell } from '@/domain/model'
import { PAIRING_RULES } from '@/domain/rules/constraints/ruleLedger'
import { WORKBOOK_RULES, type WorkbookRuleRef } from '@/domain/rules/constraints/workbookRules'
import { measureClause } from '@/domain/rules/constraints/houseMeasures'
import type { ReviewWorld } from './checks'

export interface Measure {
  held: number
  tested: number
}

export interface HeldClause {
  ref: WorkbookRuleRef
  said: string
  /** measured on this price list, every offer holding */
  here: Measure
  /** THE WORKBOOK'S OWN FIGURE, where it counted breaks this price list does not have */
  workbook: Measure | null
}

export interface UntestedClause {
  ref: WorkbookRuleRef
  said: string
  /** the workbook's own figure, which this price list cannot measure again */
  workbook: Measure | null
  /** what an offer would have to name for it to be tested: 'propeller' */
  what: string
  /** why it cannot be tested here, measured: a list that writes no single value to compare */
  unwritten: Array<{ list: string; field: string; written: string; lines: number; of: number }>
}

/** The rule ledger's clauses Review reads: asserted by the price list, and refused on. */
function readClauses() {
  return PAIRING_RULES.filter(
    (e) =>
      e.counts !== 'under' && WORKBOOK_RULES.find((s) => s.ref === e.ref)?.evidence === 'asserted',
  )
}

const PROPELLER = /^prop(eller)?\b/i

/**
 * WHERE A MOTOR LIST WRITES NO ONE PROPELLER: its propeller column, the value it writes most when
 * that value is not a propeller ("Opt"), and on how many of its lines.
 */
function propellerUnwritten(world: ReviewWorld): UntestedClause['unwritten'] {
  const out: UntestedClause['unwritten'] = []
  for (const table of Object.values(world.entities)) {
    if (!table || table.kind !== 'motor') continue
    const field = table.fields.find((f) => PROPELLER.test(f.name.trim()))
    if (!field) continue
    const rows = (world.rowsByEntity[table.id] ?? []).filter((r) => !isDiscontinued(r))
    const said = new Map<string, number>()
    for (const row of rows) {
      const v = readCell(row, field.id)
      const word = typeof v === 'string' ? v.trim() : ''
      if (word !== '') said.set(word, (said.get(word) ?? 0) + 1)
    }
    /* the word written most is the list's "no single propeller" only where it names none: a word
       with no figure in it ("Opt"), where every propeller the list names carries its pitch */
    const [written, lines] = [...said.entries()].toSorted((a, b) => b[1] - a[1])[0] ?? ['', 0]
    if (written === '' || /\d/.test(written) || lines === 0) continue
    out.push({ list: table.name, field: field.name.trim(), written, lines, of: rows.length })
  }
  return out
}

const differs = (a: Measure, b: Measure): boolean => a.tested - a.held !== b.tested - b.held

/** The price list's own rules that hold here, and the ones this price list cannot test. */
export function houseHeld(world: ReviewWorld): { held: HeldClause[]; untested: UntestedClause[] } {
  const held: HeldClause[] = []
  const untested: UntestedClause[] = []
  for (const entry of readClauses()) {
    const measured = measureClause(entry.ref, world)
    const workbook = entry.measure
      ? { held: entry.measure.held, tested: entry.measure.tested }
      : null
    if (!measured) {
      untested.push({
        ref: entry.ref,
        said: entry.said,
        workbook,
        what: entry.ref === 'A3' ? 'propeller' : '',
        unwritten: entry.ref === 'A3' ? propellerUnwritten(world) : [],
      })
      continue
    }
    /* a clause broken here is a case of its own (`houseBreaks`); one tested on nothing says
       nothing */
    if (measured.under || measured.exceptions.length > 0 || measured.tested === 0) continue
    const here = { held: measured.held, tested: measured.tested }
    held.push({
      ref: entry.ref,
      said: entry.said,
      here,
      workbook: workbook && differs(workbook, here) ? workbook : null,
    })
  }
  return { held, untested }
}
