/* ============================================================
   WHAT STANDS, AND WHAT WAS LEFT ALONE — the queue split by what
   Northside chose to leave (the judge of Review, 2026-11-04: B1, the
   clean day said "each one holds" with nine trailers still in the
   wrong size; and missing item 10, "left alone as a list with reason,
   when and by whom, brought back one at a time").

   Every case is found on the price list as it stands (`review` with
   nothing left alone), and then split, line by line, by the keys
   Northside left: what is still open walks the queue; what was left is
   a case of its own in the left-alone list, with the reason, the day
   and the person, and its money said as LEFT ALONE, never as $0.

   A KEY IS A FINDING AND THE VALUE THAT MADE IT (`checks.ts`): a key
   left alone that no longer matches a finding suppresses nothing and
   is not listed — the case came back on its own when its value moved.

   ONE RECORD, A STAMP A KEY: "meant 2026-11-04T09:12:00.000Z Asaf".
   An older stamp kept before the person was written ("meant <ISO>")
   reads as nobody named.

   PURE: cases and the record in, the two lists out.
   ============================================================ */

import type { Meant } from './checks'
import { meantKeysOf, moneyOf, type Case } from './cases'

/** The two reasons a case is left alone. */
export type LeftAs = 'meant' | 'wrong'

export interface LeftStamp {
  as: LeftAs
  /** ISO instant; '' where the stamp holds none */
  at: string
  /** the person at the desk; '' where the stamp names nobody */
  who: string
}

/** The stamp one press writes on every key it leaves. */
export const stampOf = (as: LeftAs, at: string, who: string): string =>
  `${as} ${at}${who.trim() !== '' ? ` ${who.trim()}` : ''}`

/** A stamp read back: its reason, its instant and its person. */
export function readStamp(stamp: string): LeftStamp {
  const [first = '', at = '', ...rest] = stamp.trim().split(' ')
  return {
    as: first === 'wrong' ? 'wrong' : 'meant',
    at: /^\d{4}-\d{2}-\d{2}T/.test(at) ? at : '',
    who: rest.join(' '),
  }
}

/** A case cut down to the findings `keep` keeps; null when it keeps none. */
export function restrict(c: Case, keep: (key: string) => boolean): Case | null {
  switch (c.kind) {
    case 'band':
      return keep(c.line.key) ? c : null
    case 'two':
      return keep(c.item.key) ? c : null
    case 'twins':
      return keep(c.twin.key) ? c : null
    case 'boat':
    case 'none':
    case 'cost':
    case 'note': {
      const lines = (c.group.lines as Array<{ key: string }>).filter((l) => keep(l.key))
      if (lines.length === 0) return null
      if (lines.length === c.group.lines.length) return c
      return { ...c, group: { ...c.group, lines } } as Case
    }
    case 'house': {
      const breaks = c.clause.breaks.filter((b) => keep(b.key))
      if (breaks.length === 0) return null
      if (breaks.length === c.clause.breaks.length) return c
      return { ...c, clause: { ...c.clause, breaks } }
    }
    case 'nameless': {
      const items = c.group.items.filter((i) => keep(i.key))
      if (items.length === 0) return null
      if (items.length === c.group.items.length) return c
      return { ...c, group: { ...c.group, items } }
    }
  }
}

export interface LeftCase {
  /** the case as it was left: only the findings left alone */
  c: Case
  /** the stamp of the latest press that left any of it */
  stamp: LeftStamp
  /** the keys to take out of the record to bring it back */
  keys: string[]
}

export interface Standing {
  /** what is still to settle, in the queue's order */
  open: Case[]
  /** what was left alone, in the queue's order */
  left: LeftCase[]
}

/** The queue, split by what was left alone. */
export function standingOf(all: readonly Case[], meant: Meant): Standing {
  const open: Case[] = []
  const left: LeftCase[] = []
  for (const c of all) {
    const still = restrict(c, (k) => !meant[k])
    if (still) open.push(still)
    const gone = restrict(c, (k) => !!meant[k])
    if (!gone) continue
    const keys = [...new Set(meantKeysOf(gone))]
    const stamps = keys.map((k) => readStamp(meant[k] ?? ''))
    const latest = stamps.reduce((a, b) => (b.at > a.at ? b : a), stamps[0]!)
    left.push({ c: gone, stamp: latest, keys })
  }
  return { open, left }
}

/** THE MONEY A LIST OF CASES MOVES ON ONE SALE OF EACH: charged too little, and too much. */
export function moneyOfCases(cases: readonly Case[]): {
  notCharged: number
  chargedOver: number
  under: number
  over: number
} {
  let notCharged = 0
  let chargedOver = 0
  let under = 0
  let over = 0
  for (const c of cases) {
    const m = moneyOf(c)
    if (m > 0) {
      notCharged += m
      under += 1
    } else if (m < 0) {
      chargedOver -= m
      over += 1
    }
  }
  return { notCharged, chargedOver, under, over }
}

/**
 * THE RECORD NORTHSIDE KEEPS, read from where it is kept: the keys left alone on Northside's own
 * profile (kept with its file, `OrgProfile.leftAlone`), over any this computer kept in its own
 * preferences before 2026-11-04 (`review.meant`), which still count until they are brought back.
 */
export function meantFrom(
  onProfile: Readonly<Record<string, string>> | undefined,
  onThisComputer: Meant,
): Meant {
  return { ...onThisComputer, ...onProfile }
}
