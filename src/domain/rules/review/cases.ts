/* ============================================================
   THE CASE QUEUE — what is wrong in the price list, as the cases
   a dealer settles one at a time (direction E of
   docs/directions/review-boards/, judged 2026-10-28; deepened by the
   judge of 2026-11-04).

   A CASE IS ONE FIX, NOT ONE LINE (the verdict's must-change). The
   checks count lines; the queue advances by the fix: the lines on
   sale with no price are one case per group of the list's own (its
   Category or Series), so the 8 Lone Star winch kits are priced in
   one case and the 4 factory-fit trailer plugs are left as meant in
   one press. A wrong-size trailer stays one case a trailer: "Never
   derive the band" (`registration.ts`), and a band chosen for nine at
   once would be exactly that.

   ORDERED BY WHAT IT RISKS ON A QUOTE, then by the money measured
   (the judge of 2026-11-04, B3: nine Formosa boats on sale at $0
   ranked 13th, behind a $4 difference on a vented cover):

     1 boat      a boat on sale with no price is a $0 quote; the boat
                 whose priced sibling sells for the most leads
     2 band      a trailer registered as the wrong size, the largest
                 sum a sale first, then those charged too much
     3 cost      a line sold below what it costs Northside
     4 two       one name at two prices, the widest apart first
     5 none      a part on sale with no price, the largest group first
     6 note      a note on sale as if it were a product
     7 house     an offer that breaks a rule the price list asserts
     8 twins     two columns under one name
     9 nameless  a line on sale with nothing to name it

   Tidy is outside the queue: none of it changes a price.

   PURE: it orders what `review()` found. No React, no store.
   ============================================================ */

import type { NoPriceGroup, Nameless, PlaceGroup, Reband, Review, TwoPrices, Twins } from './checks'
import type { BelowCostGroup } from './belowCost'
import type { NoteGroup } from './notes'
import type { HouseClause } from './houseBreaks'

/** The checks a case can come from, in the order of what they risk. */
export type CaseKind =
  'boat' | 'band' | 'cost' | 'two' | 'none' | 'note' | 'house' | 'twins' | 'nameless'
export const CASE_KINDS: readonly CaseKind[] = [
  'boat',
  'band',
  'cost',
  'two',
  'none',
  'note',
  'house',
  'twins',
  'nameless',
]

export type Case =
  | { kind: 'boat'; key: string; group: NoPriceGroup }
  | { kind: 'band'; key: string; line: Reband }
  | { kind: 'cost'; key: string; group: BelowCostGroup }
  | {
      kind: 'two'
      key: string
      tableId: string
      tableName: string
      priceName: string
      item: TwoPrices
    }
  | { kind: 'none'; key: string; group: NoPriceGroup }
  | { kind: 'note'; key: string; group: NoteGroup }
  | { kind: 'house'; key: string; clause: HouseClause }
  | { kind: 'twins'; key: string; twin: Twins }
  | { kind: 'nameless'; key: string; group: PlaceGroup<Nameless> }

/** A line one case names: its list, its row, and the key that leaves it alone. */
export interface CaseLine {
  key: string
  tableId: string
  rowId: string
}

/**
 * EVERY LINE A CASE NAMES, each with the key that leaves it alone — the doors to the price list,
 * the quotes it touches, and what "left alone" keeps all read this one list. A two-column case
 * names no line (its key is the column pair), and a rule broken names the pairing lines that
 * write it.
 */
export function linesOfCase(c: Case): CaseLine[] {
  switch (c.kind) {
    case 'band':
      return [{ key: c.line.key, tableId: c.line.tableId, rowId: c.line.rowId }]
    case 'two':
      return c.item.lines.map((l) => ({ key: c.item.key, tableId: c.tableId, rowId: l.rowId }))
    case 'boat':
    case 'none':
    case 'cost':
    case 'note':
      return c.group.lines.map((l) => ({ key: l.key, tableId: c.group.tableId, rowId: l.rowId }))
    case 'house':
      return c.clause.breaks.flatMap((b) =>
        b.lines.map((l) => ({ key: b.key, tableId: l.list, rowId: l.line })),
      )
    case 'twins':
      return []
    case 'nameless':
      return c.group.items.map((i) => ({ key: i.key, tableId: i.tableId, rowId: i.rowId }))
  }
}

/** How many of the check's findings one case settles. */
export function linesIn(c: Case): number {
  switch (c.kind) {
    case 'band':
    case 'two':
    case 'twins':
      return 1
    case 'boat':
    case 'none':
    case 'cost':
    case 'note':
      return c.group.lines.length
    case 'house':
      return c.clause.breaks.length
    case 'nameless':
      return c.group.items.length
  }
}

/** The keys that leave a whole case alone: every finding it names, with the value that made it. */
export function meantKeysOf(c: Case): string[] {
  switch (c.kind) {
    case 'band':
      return [c.line.key]
    case 'two':
      return [c.item.key]
    case 'twins':
      return [c.twin.key]
    case 'boat':
    case 'none':
    case 'cost':
    case 'note':
      return c.group.lines.map((l) => l.key)
    case 'house':
      return c.clause.breaks.map((b) => b.key)
    case 'nameless':
      return c.group.items.map((i) => i.key)
  }
}

/** The money one case moves on every sale: + charged too little, − charged too much, else 0. */
export const moneyOf = (c: Case): number => (c.kind === 'band' ? (c.line.to?.delta ?? 0) : 0)

/** The list a case stands on. */
export function tableOfCase(c: Case): string {
  switch (c.kind) {
    case 'band':
      return c.line.tableId
    case 'two':
      return c.tableId
    case 'boat':
    case 'none':
    case 'cost':
    case 'note':
    case 'nameless':
      return c.group.tableId
    case 'house':
      return c.clause.breaks[0]?.lines[0]?.list ?? ''
    case 'twins':
      return c.twin.tableId
  }
}

/** The price of the like line a boat case stands beside: the sense of scale for a $0 boat. */
export const besidePrice = (c: Case): number =>
  c.kind === 'boat' ? Math.max(0, ...c.group.lines.map((l) => l.beside?.price ?? 0)) : 0

export function queueOf(review: Review): Case[] {
  /* `noPrice` already stands the largest group first, the name breaking a tie */
  const boat: Case[] = review.noPrice.groups
    .filter((g) => g.boat)
    .map((group) => ({ kind: 'boat' as const, key: group.key, group }))
    .sort((a, b) => besidePrice(b) - besidePrice(a))

  const band: Case[] = review.band.lines
    .map((line) => ({ kind: 'band' as const, key: line.key, line }))
    /* the most money first: charged too little, then a trailer with no single fix, then over */
    .sort((a, b) => (b.line.to?.delta ?? 0) - (a.line.to?.delta ?? 0))

  const cost: Case[] = (review.belowCost?.groups ?? [])
    .filter((g) => g.lines.length > 0)
    .map((group) => ({ kind: 'cost' as const, key: group.key, group }))

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

  const none: Case[] = review.noPrice.groups
    .filter((g) => !g.boat)
    .map((group) => ({ kind: 'none' as const, key: group.key, group }))

  const note: Case[] = (review.notes?.groups ?? []).map((group) => ({
    kind: 'note' as const,
    key: group.key,
    group,
  }))

  const house: Case[] = (review.house?.clauses ?? []).map((clause) => ({
    kind: 'house' as const,
    key: clause.key,
    clause,
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

  return [...boat, ...band, ...cost, ...two, ...none, ...note, ...house, ...twins, ...nameless]
}

const noneOfEach = (): Record<CaseKind, number> => ({
  boat: 0,
  band: 0,
  cost: 0,
  two: 0,
  none: 0,
  note: 0,
  house: 0,
  twins: 0,
  nameless: 0,
})

/** Lines still standing in each check: Σ is `review.open`. */
export function linesByKind(cases: readonly Case[]): Record<CaseKind, number> {
  const out = noneOfEach()
  for (const c of cases) out[c.kind] += linesIn(c)
  return out
}

/**
 * THE CASES OF EACH CHECK, COUNTED AS THE QUEUE WALKS THEM (built-critique-m3.md, major 11:
 * "69 to settle" stood beside "Case 1 of 37", and Data's door said "69 to fix"). The queue
 * advances by the fix, so what is left to settle is counted in fixes too: the head, each check's
 * chip and the door on Data all say the cases, and the counts here add to the queue's length.
 */
export function casesByKind(cases: readonly Case[]): Record<CaseKind, number> {
  const out = noneOfEach()
  for (const c of cases) out[c.kind] += 1
  return out
}
