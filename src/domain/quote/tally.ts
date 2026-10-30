/* ============================================================
   WHAT THE TOTAL IS MADE OF, AT A GLANCE (the owner, 2026-10-30:
   "Total should move from top right to bottom left area and be way
   nicer and more visual").

   The build's total stands at the bottom left with a bar under it,
   one length per part of the boat that carries a price — the hull,
   the motor, the trailer, the dealer fit — each as long as its share
   of the figure, and a key naming each part with its own figure.
   What has nothing on it yet is named as not chosen, never drawn as
   a length of nothing.

   PURE AND COUNTED HERE, never in screen code (built-critique-m3-2.md,
   carried finding 8: counts were summed in Fitment.tsx and Rules.tsx).
   It reads the chapters' own subtotals, which the rail already worked
   from the quote's lines, and adds nothing to them: no figure here is
   new, and the shares are of the figures the chapters state.
   ============================================================ */

import type { TableKind } from '@/domain/model'

/** One part of the build, as its chapter states it. */
export interface TallyPart {
  id: string
  /** the chapter's own name: "The hull", "Motor", "Dealer fit" */
  name: string
  /** what it is, for its ink */
  kind: TableKind
  /** its subtotal, or null where nothing on it carries a figure */
  amount: number | null
  /** how many lines of the quote it holds */
  lines: number
}

/** One length of the bar. */
export interface TallyShare {
  id: string
  /** the part's name as the key says it: "Hull", "Motor", "Dealer fit" */
  name: string
  kind: TableKind
  amount: number
  /** its share of the figures drawn, 0 to 1; the shares sum to 1 */
  share: number
}

export interface Tally {
  /** the parts with a figure, in the build's own order */
  shares: TallyShare[]
  /** the parts with a line on them and no figure: said in the key, drawn as no length */
  unpriced: string[]
  /** the parts nothing is on yet, by the key's names: "Motor", "Trailer" */
  open: string[]
}

/** "The hull" is "Hull" in a key: the article belongs to a heading, not a label. */
export function keyName(name: string): string {
  const bare = name.replace(/^the\s+/i, '').trim()
  return bare === '' ? name : bare.charAt(0).toUpperCase() + bare.slice(1)
}

/** What the total is made of, read off the chapters' own subtotals. */
export function tallyOf(parts: readonly TallyPart[]): Tally {
  const priced = parts.filter((p) => p.amount !== null && p.amount > 0)
  const whole = priced.reduce((sum, p) => sum + (p.amount ?? 0), 0)
  return {
    shares: priced.map((p) => ({
      id: p.id,
      name: keyName(p.name),
      kind: p.kind,
      amount: p.amount ?? 0,
      share: whole > 0 ? (p.amount ?? 0) / whole : 0,
    })),
    unpriced: parts
      .filter((p) => p.lines > 0 && (p.amount === null || p.amount <= 0))
      .map((p) => keyName(p.name)),
    open: parts.filter((p) => p.lines === 0).map((p) => keyName(p.name)),
  }
}

/** "Not chosen yet: motor and trailer", or '' where every part has something on it. */
export function openSay(open: readonly string[]): string {
  if (open.length === 0) return ''
  const words = open.map((name) => name.toLowerCase())
  const list =
    words.length === 1 ? words[0]! : `${words.slice(0, -1).join(', ')} and ${words.at(-1)!}`
  return `Not chosen yet: ${list}`
}
