/* ============================================================
   io/afterChoices — THE PRICE LIST AFTER THIS WORKBOOK, WITH WHAT A
   PERSON LEFT OUT AND PLACED: one count per fate, for every place the
   change sheet says it.

   The verifier (docs/directions/data-round/shelf/verify-1.md, gap 4):
   after placing the 47 lines the workbook's own Code names, the four
   tiles still read "61 can't be placed" and "3,082 lines change" while
   the legend under the bar read "14 can't be placed" and "3,102
   change" — two figures under one label on one screen. The legend
   counted the choices, the tiles did not. Both now read this.

   Pure: no React, no store, no DOM.
   ============================================================ */

import type { ChangeSet, Choices } from './changeSet'

export interface AfterChoices {
  /** lines of the price list left exactly as they are */
  stays: number
  /** lines that change: the workbook's changes kept, and lines placed that move something */
  change: number
  /** new lines kept */
  fresh: number
  /** lines that cannot be placed and are not */
  cannot: number
  /** of the workbook's changes, how many are left out */
  outChange: number
  /** of its new lines, how many are left out */
  outNew: number
  /** lines that could not be placed, placed by a person */
  placed: number
  /** of those, the ones that move a figure (the rest already read exactly so) */
  placedMoving: number
}

export function afterChoices(set: ChangeSet, c: Choices): AfterChoices {
  let outChange = 0
  let outNew = 0
  let placed = 0
  let placedMoving = 0
  for (const l of set.lines) {
    if (l.fate === 'change') {
      if (c.out.has(l.key)) outChange += 1
    } else if (l.fate === 'new') {
      if (c.out.has(l.key)) outNew += 1
    } else {
      const rowId = c.placed.get(l.key)
      const cand = rowId ? l.candidates?.find((x) => x.rowId === rowId) : undefined
      if (!cand) continue
      placed += 1
      if (cand.cells.length > 0) placedMoving += 1
    }
  }
  return {
    stays: set.unmoved + outChange - placedMoving,
    change: set.changing - outChange + placedMoving,
    fresh: set.adding - outNew,
    cannot: set.cannot - placed,
    outChange,
    outNew,
    placed,
    placedMoving,
  }
}
