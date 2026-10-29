/* ============================================================
   THE CASE QUEUE — what is wrong in the price list, as the cases
   a dealer settles one at a time (direction E of
   docs/directions/review-boards/, judged 2026-10-28).

   A CASE IS ONE FIX, NOT ONE LINE (the verdict's must-change). The
   checks count lines, and the screen's rail still does — 69 on the
   file as it stands — but the queue advances by the fix: the 46
   lines on sale with no price are 18 cases, one per group of the
   list's own (its Category or Series), so the 8 Lone Star winch
   kits are priced in one case and the 4 factory-fit trailer plugs
   are left as meant in one press. A wrong-size trailer stays one
   case a trailer: "Never derive the band" (`registration.ts`), and
   a band chosen for nine at once would be exactly that.

   THE MOST MONEY FIRST. The trailers charged too little lead, the
   largest sum first; then those charged too much; then one name at
   two prices, the widest apart first; then the lines with no price,
   the largest group first; then what could give a wrong pick — two
   under one name, a line with nothing to name it. Tidy is outside
   the queue: none of it changes a price.

   PURE: it orders what `review()` found. No React, no store.
   ============================================================ */

import type { NoPriceGroup, Nameless, PlaceGroup, Reband, Review, TwoPrices, Twins } from './checks'

/** The checks a case can come from, in the order they cost Northside. */
export type CaseKind = 'band' | 'two' | 'none' | 'twins' | 'nameless'
export const CASE_KINDS: readonly CaseKind[] = ['band', 'two', 'none', 'twins', 'nameless']

export type Case =
  | { kind: 'band'; key: string; line: Reband }
  | {
      kind: 'two'
      key: string
      tableId: string
      tableName: string
      priceName: string
      item: TwoPrices
    }
  | { kind: 'none'; key: string; group: NoPriceGroup }
  | { kind: 'twins'; key: string; twin: Twins }
  | { kind: 'nameless'; key: string; group: PlaceGroup<Nameless> }

/** How many of the check's lines one case settles: the rail's ticks it lights. */
export function linesIn(c: Case): number {
  switch (c.kind) {
    case 'band':
    case 'two':
    case 'twins':
      return 1
    case 'none':
      return c.group.lines.length
    case 'nameless':
      return c.group.items.length
  }
}

/** The keys that leave a whole case as meant: every line it names, with the value that made it. */
export function meantKeysOf(c: Case): string[] {
  switch (c.kind) {
    case 'band':
      return [c.line.key]
    case 'two':
      return [c.item.key]
    case 'twins':
      return [c.twin.key]
    case 'none':
      return c.group.lines.map((l) => l.key)
    case 'nameless':
      return c.group.items.map((i) => i.key)
  }
}

/** The money one case moves on every sale: + charged too little, − charged too much, else 0. */
export const moneyOf = (c: Case): number => (c.kind === 'band' ? (c.line.to?.delta ?? 0) : 0)

export function queueOf(review: Review): Case[] {
  const band: Case[] = review.band.lines
    .map((line) => ({ kind: 'band' as const, key: line.key, line }))
    /* the most money first: charged too little, then a trailer with no single fix, then over */
    .sort((a, b) => (b.line.to?.delta ?? 0) - (a.line.to?.delta ?? 0))

  const two: Case[] = review.twoPrices.groups
    .flatMap((g) =>
      g.items.map((item) => ({
        kind: 'two' as const,
        key: item.key,
        tableId: g.tableId,
        tableName: g.tableName,
        priceName: g.priceName,
        item,
      })),
    )
    .sort((a, b) => b.item.high - b.item.low - (a.item.high - a.item.low))

  /* `noPrice` already stands the largest group first, the name breaking a tie */
  const none: Case[] = review.noPrice.groups.map((group) => ({
    kind: 'none' as const,
    key: group.key,
    group,
  }))

  const twins: Case[] = review.twins.items.map((twin) => ({
    kind: 'twins' as const,
    key: twin.key,
    twin,
  }))

  const nameless: Case[] = review.nameless.groups.map((group) => ({
    kind: 'nameless' as const,
    key: `nameless:${group.tableId}`,
    group,
  }))

  return [...band, ...two, ...none, ...twins, ...nameless]
}

/** Lines still standing in each check, the rail's five segments: Σ is `review.open`. */
export function linesByKind(cases: readonly Case[]): Record<CaseKind, number> {
  const out: Record<CaseKind, number> = { band: 0, two: 0, none: 0, twins: 0, nameless: 0 }
  for (const c of cases) out[c.kind] += linesIn(c)
  return out
}

/**
 * THE CASES OF EACH CHECK, COUNTED AS THE QUEUE WALKS THEM (built-critique-m3.md, major 11:
 * "69 to settle" stood beside "Case 1 of 37", and Data's door said "69 to fix"). The queue
 * advances by the fix, so what is left to settle is counted in fixes too: the head, each check's
 * chip and the door on Data all say the cases, and the five here add to the queue's length.
 */
export function casesByKind(cases: readonly Case[]): Record<CaseKind, number> {
  const out: Record<CaseKind, number> = { band: 0, two: 0, none: 0, twins: 0, nameless: 0 }
  for (const c of cases) out[c.kind] += 1
  return out
}
