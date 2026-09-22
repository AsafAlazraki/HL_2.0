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

   TWO READINGS, BECAUSE A REGISTER WITH ONE QUOTE IN IT IS A REAL
   STATE. "No fake data" means a ruler cannot plant eighteen quotes to
   count; the walk in `e2e/mint.ts` mints ONE, the way a dealer would.
   So `readDensity` reads two things off the page and reports both:
   the records a person can see right now, and the records the list
   would HOLD at the pitch of the real row it is drawing — the room a
   full list would have, less the band heads that stand in it whether
   the bands are full or empty, divided by the measured pitch. The
   requirement is met by either; a register with no record on it fails
   outright, because a pitch nobody measured is a figure nobody has.

   A RECORD IS A ROW WITH MORE THAN ONE CELL. A band head and an
   empty-band notice are rows too — a grid gives them to a reader as
   rows — but each is one cell spanning the grid, and a ruler that
   counted them as records would count a register's furniture as its
   contents. A band head is the FIRST row of its rowgroup, which is the
   only thing the ruler knows about any screen's bands.

   `fixture.spec.ts` points both readings at pages built to fail.
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

/**
 * WHERE THE ROOM IS, said by the route rather than guessed by the ruler. A bare register
 * takes only the height its bands need — a frame with 500px of nothing in it is a hole,
 * not a frame — so the grid's own box is not the room a full list would have. `room` is
 * the element whose box IS that room (the screen's own list track), and `minus` names
 * what stands inside it that is not the list: an act row under it, say. Absent, the ruler
 * reads the grid's nearest scrolling ancestor, clipped to the window.
 */
export interface DensitySpec {
  room?: string
  minus?: string[]
}

export interface DensityRead {
  /** rows of any kind fully in view — the reading `countReadableRows` gives */
  shown: number
  /** record rows (more than one cell) fully in view */
  records: number
  /** the median border-box height of the record rows on the page, or null with none */
  pitch: number | null
  /** the height the list is given, in px */
  room: number
  /** the height the band heads take out of it, in px */
  heads: number
  /** floor((room − heads) / pitch); 0 when there is no pitch to divide by */
  capacity: number
}

export function readDensity(spec: DensitySpec): DensityRead {
  const height = window.innerHeight
  const rows = [...document.querySelectorAll<HTMLElement>('[role="row"]')]
  /* declared inside on purpose: `page.evaluate` ships this one function to the page, and a
     helper at module scope would not be there when it runs */
  const cells = '[role="gridcell"], [role="cell"]'
  const isRecord = (row: Element): boolean => row.querySelectorAll(cells).length > 1
  /* A ROW'S BOX IS THE BOX ITS CELLS OCCUPY. A register whose cells sit
     in one CSS grid so that every column lines up draws the row with
     `display: contents`, and such a row has no box of its own — its
     bounding rect is 0×0 at the origin. Measured 2026-09-22 on the
     quotes register: the ruler read the draft it had just minted as a
     collapsed row and counted the three band heads and three notices,
     which ARE boxes, and nothing else. So a row that has no height is
     measured by the union of its cells before it is called collapsed. */
  const boxOf = (row: Element): { top: number; bottom: number; height: number } => {
    const own = row.getBoundingClientRect()
    if (own.height >= 2) return own
    const parts = [...row.querySelectorAll(cells)]
      .map((c) => c.getBoundingClientRect())
      .filter((c) => c.height >= 2)
    if (parts.length === 0) return own
    const top = Math.min(...parts.map((c) => c.top))
    const bottom = Math.max(...parts.map((c) => c.bottom))
    return { top, bottom, height: bottom - top }
  }

  let shown = 0
  let records = 0
  const pitches: number[] = []
  for (const row of rows) {
    const r = boxOf(row)
    if (r.height < 2) continue
    const inView = r.top >= 0 && r.bottom <= height
    if (inView) shown++
    if (isRecord(row)) {
      pitches.push(r.height)
      if (inView) records++
    }
  }
  pitches.sort((a, b) => a - b)
  const pitch = pitches.length === 0 ? null : pitches[Math.floor(pitches.length / 2)]!

  let heads = 0
  for (const group of document.querySelectorAll('[role="rowgroup"]')) {
    const head = group.querySelector('[role="row"]')
    if (head && !isRecord(head)) heads += boxOf(head).height
  }

  let room = 0
  if (spec.room) {
    const box = document.querySelector(spec.room)
    if (box) {
      room = box.getBoundingClientRect().height
      for (const sel of spec.minus ?? []) {
        const taken = document.querySelector(sel)
        if (taken) room -= taken.getBoundingClientRect().height
      }
    }
  } else {
    const grid = document.querySelector('[role="grid"], [role="table"]')
    let scroller: Element | null = grid
    while (scroller && scroller !== document.body) {
      const o = getComputedStyle(scroller).overflowY
      if (o === 'auto' || o === 'scroll') break
      scroller = scroller.parentElement
    }
    const r = (scroller ?? grid)?.getBoundingClientRect()
    if (r) room = Math.max(0, Math.min(r.bottom, height) - Math.max(r.top, 0))
  }

  const capacity = pitch === null ? 0 : Math.max(0, Math.floor((room - heads) / pitch))
  return { shown, records, pitch, room, heads, capacity }
}
