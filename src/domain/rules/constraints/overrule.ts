/* ============================================================
   NORTHSIDE OVERRULES ONE OF THE PRICE LIST'S OWN CLAUSES, WITH A
   BECAUSE (judge.md, data round, missing item 4; verify 2, missing
   item 3: "no overrule act exists").

   WHAT A CLAUSE OF THE PRICE LIST DOES, AND SO WHAT OVERRULING IT
   CHANGES. The build's lists ARE the price list's pairings
   (`houseMeasures.ts`, BUILD_DOES), so no clause is a switch the
   build reads and none can be turned off there. Where a clause acts
   is Review: every offer that breaks an asserted clause is a case in
   its queue (`review/houseBreaks.ts`), "the price list breaking its
   own rules". Overruling the clause is Northside saying it does not
   hold to it, and why — so those breaks are left alone in Review, as
   meant, by Northside, on that day, and the clause says so where it
   stands. Holding to it again brings exactly those breaks back.

   KEPT WITH NORTHSIDE'S FILE, THROUGH THE ONE DOOR. It is Review's own
   record (`OrgProfile.leftAlone`, a settings change through
   `changeOrg`, with its Undo and the set-apart refusal): each break's
   key stamped as Review stamps a case left as meant, and one key of
   its own, `rule:<ref>`, which no finding ever matches, holding the
   instant, the person and the because. Nothing new is stored and no
   other screen learns a new word.

   A BREAK THAT COMES WITH A NEW PRICE LIST is not covered: it was not
   standing when Northside overruled the clause, and it is raised in
   Review as any new case is. The clause says how many stand outside
   the overrule, counted by `overruleOf` as `outside`.

   Pure: no React, no store, no DOM.
   ============================================================ */

import type { CatalogueCommand } from '@/domain/catalogue/commands'
import { changeOrg, withKey } from '@/domain/catalogue/orgCommands'
import type { WorkbookRuleRef } from './workbookRules'

/** The key the overrule itself is kept under. No finding's key begins so. */
export const overruleKey = (ref: WorkbookRuleRef): string => `rule:${ref}`

/** The longest because kept: the record's words are read back up to 200 characters each. */
export const BECAUSE_MAX = 120

const SEP = ' | '

/** The stamp Review writes on a case left as meant (`review/standing.ts`, `stampOf`). */
const meantStamp = (at: string, who: string): string =>
  `meant ${at}${who.trim() !== '' ? ` ${who.trim()}` : ''}`

/** One clause overruled, read back. */
export interface Overruled {
  /** ISO instant */
  at: string
  /** the person at the desk; '' where nobody was named */
  who: string
  because: string
  /** the breaks it left alone that are still left so */
  left: number
  /** breaks of this clause standing now that it does not cover (a new price list's) */
  outside: number
}

/**
 * THE OVERRULE OF ONE CLAUSE, or null where Northside holds to it. `breakKeys` are the clause's
 * breaks on the price list as it stands (Review's own keys, `house:<ref>:…`).
 */
export function overruleOf(
  ref: WorkbookRuleRef,
  leftAlone: Readonly<Record<string, string>> | undefined,
  breakKeys: readonly string[],
): Overruled | null {
  const raw = leftAlone?.[overruleKey(ref)]
  if (!raw || !raw.startsWith('overruled ')) return null
  const cut = raw.indexOf(SEP)
  const head = (cut < 0 ? raw : raw.slice(0, cut)).slice('overruled '.length).trim()
  const because = cut < 0 ? '' : raw.slice(cut + SEP.length).trim()
  const [at = '', ...who] = head.split(' ')
  const stamp = meantStamp(at, who.join(' '))
  let left = 0
  let outside = 0
  for (const key of breakKeys) {
    if (leftAlone?.[key] === stamp) left += 1
    else if (!leftAlone?.[key]) outside += 1
  }
  return { at, who: who.join(' '), because, left, outside }
}

/** Why an overrule cannot be kept as written, or '' where it can. */
export function overruleMissing(because: string): string {
  const t = because.trim()
  if (t === '')
    return 'Say why Northside does not hold to it first: the because is what Review and the next reader will see.'
  if (t.length > BECAUSE_MAX)
    return `Say it in ${BECAUSE_MAX} characters or fewer: this one is ${t.length}.`
  return ''
}

/**
 * OVERRULE IT: every break standing now left alone as meant, stamped as Review stamps one, and
 * the overrule kept with its because — one step, with its Undo.
 */
export function overruleCommand(a: {
  ref: WorkbookRuleRef
  breakKeys: readonly string[]
  because: string
  at: string
  who: string
  said: string
}): CatalogueCommand {
  return changeOrg(a.said, 'leftAlone', (org) => {
    const missing = overruleMissing(a.because)
    if (missing !== '') return missing
    const next = { ...org.leftAlone }
    const stamp = meantStamp(a.at, a.who)
    for (const key of a.breakKeys) next[key] ??= stamp
    const who = a.who.trim()
    next[overruleKey(a.ref)] = `overruled ${a.at}${who === '' ? '' : ` ${who}`}${SEP}${a.because
      .trim()
      .replace(/\s+/g, ' ')}`
    return { ...org, leftAlone: next }
  })
}

/**
 * HOLD TO IT AGAIN: the overrule taken away, and the breaks it left alone brought back into
 * Review's queue — only those, never a case Review left alone on another day.
 */
export function holdAgainCommand(ref: WorkbookRuleRef, said: string): CatalogueCommand {
  return changeOrg(said, 'leftAlone', (org) => {
    const raw = org.leftAlone?.[overruleKey(ref)]
    if (!raw) return ''
    const cut = raw.indexOf(SEP)
    const head = (cut < 0 ? raw : raw.slice(0, cut)).slice('overruled '.length).trim()
    const [at = '', ...who] = head.split(' ')
    const stamp = meantStamp(at, who.join(' '))
    const next = { ...org.leftAlone }
    delete next[overruleKey(ref)]
    for (const [key, v] of Object.entries(next))
      if (key.startsWith(`house:${ref}:`) && v === stamp) delete next[key]
    return withKey(org, 'leftAlone', Object.keys(next).length > 0 ? next : undefined)
  })
}
