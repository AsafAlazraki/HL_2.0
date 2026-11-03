/* ============================================================
   WHAT A CHECK STILL FINDS ON THE CLEAN DAY, COUNTED AS IT IS SAID
   (the verifier of Review, 2026-11-04, round 1, gaps 1 and 2).

   The clean day names each check that still finds something because
   Northside left it alone. Two of its figures were wrong:

     "9 trailers … $819 on one sale of each, not charged" — only 7 of
     the 9 are charged too little ($819 is 7 × $117); the other 2 are
     charged $234 too much, and the sentence gave the 9 the 7's money
     and never said the 2's.

     "6 lines still sell below their cost" — 4 lines: the Battery
     Lithium 50Amp and the O Ring 13210-09350 are each below cost at
     Sell and again at Sell inc Install, two findings on one line.

   So a check's cases left alone are counted here three ways: the
   findings the queue counts, the distinct lines of the price list they
   stand on, and the money split by its direction — never one sum.

   PURE: cases in, counts out.
   ============================================================ */

import { linesIn, linesOfCase, moneyOf, type Case, type CaseKind } from './cases'

export interface MoneyWay {
  /** cases moving money this way */
  n: number
  /** the dollars on one sale of each */
  sum: number
}

export interface KindCounted {
  cases: number
  /** findings, as the queue counts them (a line below cost at two prices is two) */
  findings: number
  /** distinct lines of the price list the cases stand on (that line is one) */
  lines: number
  /** lines that carry more than one finding of the check: below cost at two of its prices */
  twice: number
  /** charged too little, on one sale of each */
  under: MoneyWay
  /** charged too much, on one sale of each */
  over: MoneyWay
}

/** The distinct lines of the price list a set of cases stands on: a list and a row, once each. */
export function distinctLines(cases: readonly Case[]): number {
  const seen = new Set<string>()
  for (const c of cases) for (const l of linesOfCase(c)) seen.add(`${l.tableId}\u0000${l.rowId}`)
  return seen.size
}

/** One check's cases, counted three ways. */
export function countedOf(cases: readonly Case[]): KindCounted {
  /* each line of the price list, with the findings standing on it */
  const perLine = new Map<string, Set<string>>()
  let findings = 0
  const under: MoneyWay = { n: 0, sum: 0 }
  const over: MoneyWay = { n: 0, sum: 0 }
  for (const c of cases) {
    findings += linesIn(c)
    for (const l of linesOfCase(c)) {
      const at = `${l.tableId}\u0000${l.rowId}`
      perLine.set(at, (perLine.get(at) ?? new Set()).add(l.key))
    }
    const m = moneyOf(c)
    if (m > 0) {
      under.n += 1
      under.sum += m
    } else if (m < 0) {
      over.n += 1
      over.sum -= m
    }
  }
  const lines = perLine.size
  const twice = [...perLine.values()].filter((keys) => keys.size > 1).length
  return { cases: cases.length, findings, lines, twice, under, over }
}

/** The cases of each check, counted; a check with none is absent. */
export function countedByKind(cases: readonly Case[]): Partial<Record<CaseKind, KindCounted>> {
  const by = new Map<CaseKind, Case[]>()
  for (const c of cases) by.set(c.kind, [...(by.get(c.kind) ?? []), c])
  const out: Partial<Record<CaseKind, KindCounted>> = {}
  for (const [kind, list] of by) out[kind] = countedOf(list)
  return out
}
