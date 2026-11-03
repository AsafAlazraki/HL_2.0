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
