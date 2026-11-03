/* ============================================================
   NOTHING ALONE ON A ROW, AND NO BLANK CELL AT A ROW'S END (the
   fitment verifier, 2026-11-03: seven motor tiles stood 3 + 3 + 1, and
   five reasons 3 + 2 with a blank third cell at 834).

   n things at most `most` to a row are shared over as few rows as
   that takes, as evenly as they go, the fuller rows first: seven at
   most three are 3 + 2 + 2, seven at most four are 4 + 3, five at most
   three are 3 + 2. Each thing is told how many share its row, and the
   screen gives it that share of the row's width, so every row is full.

   Pure: no React, no DOM.
   ============================================================ */

/** How many things share each row, the fuller rows first. */
export function rowsFor(n: number, most: number): number[] {
  if (n <= 0) return []
  const per = Math.max(1, Math.floor(most))
  const rows = Math.ceil(n / per)
  const base = Math.floor(n / rows)
  const extra = n % rows
  return Array.from({ length: rows }, (_, i) => base + (i < extra ? 1 : 0))
}

/** For each of n things in order, how many share its row. */
export function shareOf(n: number, most: number): number[] {
  return rowsFor(n, most).flatMap((k) => Array.from({ length: k }, () => k))
}

/** Do n things at most `most` to a row share their rows evenly, every row the same count? */
export function evenly(n: number, most: number): boolean {
  const rows = rowsFor(n, most)
  return rows.every((k) => k === rows[0])
}

export interface Grid {
  /** the columns every row is drawn on */
  columns: number
  /** for each thing in order, how many of those columns it takes: 1, or 2 where it fills a row
   *  one short */
  spans: number[]
}

/**
 * ONE SET OF COLUMNS FOR EVERY ROW (the fitment verifier, 2026-11-03: the Classic 340's seven facts
 * stood 3 + 2 + 2 at 390 and 4 + 3 at 834, rows 2 and 3 off row 1's columns). n things at most
 * `most` to a row are drawn on one grid; a row one short is filled by its first thing taking two
 * columns, so every row is full, nothing stands alone and every edge lines up with the row above:
 * seven at three are 3 / 2+1 / 2+1, seven at four are 4 / 2+1+1. Where no row would be full at
 * that width, one column fewer is tried (four at three are 2 + 2).
 */
export function gridOf(n: number, most: number): Grid {
  if (n <= 0) return { columns: 1, spans: [] }
  for (let c = Math.min(Math.max(1, Math.floor(most)), n); c >= 1; c -= 1) {
    const rows = rowsFor(n, c)
    const full = rows.some((k) => k === c)
    const short = rows.filter((k) => k < c)
    /* a short row is one short, and keeps two of its own beside the one that widens */
    const fillable = short.every((k) => k === c - 1 && k >= 2)
    if (short.length === 0 || (full && fillable)) {
      return {
        columns: c,
        spans: rows.flatMap((k) => Array.from({ length: k }, (_, i) => (k < c && i === 0 ? 2 : 1))),
      }
    }
  }
  return { columns: 1, spans: Array.from({ length: n }, () => 1) }
}
