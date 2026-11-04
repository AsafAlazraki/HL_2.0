/* ============================================================
   HOW FAR A LINE MOVED, AS A NARROWING OF THE CHANGE SHEET.

   The sheet narrowed by "doubled or halved" and nothing between: a
   salesperson who wants the lines that moved a tenth or more had to
   read three thousand of them (the shelf's verify-2.md, "the change
   sheet as a working tool"). These are the sizes of move a person
   asks for, each measured at the price a quote reads, either way:

       10% or more · 25% or more · 50% or more

   MEASURED, NEVER GUESSED. A line's move is |new − old| ÷ |old| at
   the figure a quote reads (`ChangeLine.read`); a line with no such
   figure, or one that only moved another figure, has no size of move
   and is in none of them. A figure that leaves or crosses nought has
   moved as far as a figure can, and is in all three.

   PURE. No store, no DOM.
   ============================================================ */
import type { ChangeLine, Narrow } from './changeSet'

export const SWINGS = [10, 25, 50] as const
export type Swing = (typeof SWINGS)[number]

/** The sheet's narrowing, with the size of move a person asked for. */
export type NarrowBy = Narrow & { swing?: Swing | undefined }

export const isSwing = (v: unknown): v is Swing =>
  (SWINGS as readonly number[]).includes(typeof v === 'string' ? Number(v) : (v as number))

/** How far the price a quote reads moved, as a share of where it was; null where it did not. */
export function movedShare(l: Pick<ChangeLine, 'fate' | 'read'>): number | null {
  if (l.fate !== 'change' || !l.read) return null
  const { from, to } = l.read
  if (typeof from !== 'number' || typeof to !== 'number' || from === to) return null
  if (from === 0 || from < 0 !== to < 0) return Number.POSITIVE_INFINITY
  return Math.abs(to - from) / Math.abs(from)
}

/** The lines whose price a quote reads moved by at least this much, either way. */
export function bySwing<L extends Pick<ChangeLine, 'fate' | 'read'>>(
  lines: readonly L[],
  at: Swing | undefined,
): L[] {
  if (at === undefined) return [...lines]
  return lines.filter((l) => {
    const share = movedShare(l)
    return share !== null && share * 100 >= at - 1e-9
  })
}

/** How many lines each size of move holds, counted on the same lines. */
export function swingCounts(
  lines: readonly Pick<ChangeLine, 'fate' | 'read'>[],
): Record<Swing, number> {
  const out = { 10: 0, 25: 0, 50: 0 } as Record<Swing, number>
  for (const l of lines) {
    const share = movedShare(l)
    if (share === null) continue
    for (const s of SWINGS) if (share * 100 >= s - 1e-9) out[s] += 1
  }
  return out
}
