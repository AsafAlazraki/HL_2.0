/* ============================================================
   THE LISTS YOU SELL FROM, IN TWO COLUMNS OF ONE HEIGHT — where a desk
   lays the ledger out (data.css, 1100 and up).

   The verifier of Data, round 2, found the eighteen lists beside the
   table of what fits ending 330 to 340 px below it at 1280, 1440 and
   1920, over empty floor. Stacked, with the lists run in two columns,
   the floor moved inside the ledger: the browser's own columns keep a
   group whole, and Trailers is nine of the eighteen, so one column ran
   thirteen lists and the other six.

   So the ledger is cut once, in the file's order, where the two
   columns come out nearest one height — between two groups where that
   is near enough, inside a group where it is not. A group cut in two
   says its name again over its second part ("Trailers, continued"),
   which counts as a head in that column. Nothing is reordered: the
   first column ends where the second begins, and the keys step
   through them in that order.

   It lives beside the screen, the way `lineup.ts` does, because it is
   this screen's layout of its ledger and nothing else draws it. Pure:
   no React, no store, no DOM.
   ============================================================ */

/** One group of the ledger, the way the screen files its lists. */
export interface Group<R> {
  placeId: string
  place: string
  rows: R[]
}

/** A group, or the part of one, a column draws. */
export interface Part<R> extends Group<R> {
  /** the second part of a group cut in two, whose head says it again */
  continued: boolean
}

/** How tall a group's head stands, in rows. */
export const HEAD_WEIGHT = 0.75

/**
 * The ledger in two columns, in the file's order, at the cut that leaves the taller column
 * shortest. `weight` is a row's height in rows (a row with a second line is taller). A cut
 * between two groups is kept wherever its taller column is within a head's height of the best cut
 * inside a group, so a group is cut only where that clearly evens the columns.
 */
export function inTwo<R>(
  groups: readonly Group<R>[],
  weight: (row: R) => number,
  head = HEAD_WEIGHT,
): [Part<R>[], Part<R>[]] {
  const sums = groups.map((g) => g.rows.reduce((s, row) => s + weight(row), 0))
  const total = sums.reduce((s, h) => s + head + h, 0)
  type Cut = { g: number; r: number; tallest: number }
  /* between: after group g (g + 1 groups in the first column); inside: r rows of group g kept */
  let between: Cut = { g: groups.length, r: 0, tallest: total }
  let inside: Cut | null = null
  let before = 0
  groups.forEach((group, g) => {
    let kept = 0
    group.rows.forEach((row, i) => {
      kept += weight(row)
      const r = i + 1
      if (r === group.rows.length) return
      const left = before + head + kept
      const tallest = Math.max(left, total - left + head)
      if (!inside || tallest < inside.tallest) inside = { g, r, tallest }
    })
    before += head + sums[g]!
    const tallest = Math.max(before, total - before)
    if (tallest < between.tallest) between = { g: g + 1, r: 0, tallest }
  })
  const cut: Cut = inside !== null && (inside as Cut).tallest + head < between.tallest ? inside : between
  const first: Part<R>[] = []
  const second: Part<R>[] = []
  groups.forEach((group, g) => {
    if (g < cut.g) first.push({ ...group, rows: [...group.rows], continued: false })
    else if (g === cut.g && cut.r > 0) {
      first.push({ ...group, rows: group.rows.slice(0, cut.r), continued: false })
      second.push({ ...group, rows: group.rows.slice(cut.r), continued: true })
    } else second.push({ ...group, rows: [...group.rows], continued: false })
  })
  return [first, second]
}
