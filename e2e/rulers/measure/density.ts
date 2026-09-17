/// <reference lib="dom" />

/* ============================================================
   density — how many rows a person can actually read, right now.

   The plan states the requirement per table shape before a grid is
   written: 18 rows on a dealer's laptop, and a two-level hierarchy
   costs two lines per four rows, so a grouped register must earn its
   grouping. A register that shows twelve rows makes a person scroll to
   compare two boats that are three rows apart, which is the whole job.

   It counts what a person can actually READ: a row whose box is inside
   the viewport, not a row that exists in a virtualiser's buffer below
   the fold. `[role="row"]` is what a grid gives a screen reader, so it
   is what this counts — a register that does not expose rows to a
   reader has a second defect, and this ruler finds it as a first one.

   Nine lines, and still worth its own module: it is the one ruler with
   no screen to measure yet, so the only way to know its arithmetic
   works is to point it at a page built with a known number of rows
   above and below the fold. `fixture.spec.ts` does exactly that.
   ============================================================ */

/** Rows fully inside the viewport, by the `[role="row"]` a grid gives a reader. */
export function countReadableRows(): number {
  const height = window.innerHeight
  let seen = 0
  for (const row of document.querySelectorAll('[role="row"]')) {
    const r = row.getBoundingClientRect()
    if (r.height < 2) continue
    if (r.top >= 0 && r.bottom <= height) seen++
  }
  return seen
}
