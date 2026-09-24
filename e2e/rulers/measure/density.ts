/// <reference lib="dom" />
/* eslint-disable unicorn/consistent-function-scoping -- the measuring function below runs
   INSIDE the page: Playwright serialises it and evaluates it with no closure, so its helpers
   cannot be hoisted out of it without breaking at runtime. */

/* ============================================================
   density — how many rows a person can read at rest, once the list
   is full.

   The plan states the requirement per table shape before a grid is
   written: 18 rows on a dealer's laptop, and a two-level hierarchy
   costs two lines per four rows, so a grouped register must earn its
   grouping. A register that shows twelve rows makes a person scroll to
   compare two boats that are three rows apart, which is the whole job.

   ONE READING. "No fake data" means a ruler cannot plant eighteen
   quotes to count; the walk in `e2e/mint.ts` mints ONE, the way a
   dealer would. So the figure this ruler asserts is how many records
   the list would show at rest if it were full, at the pitch of the
   real row it is drawing now. On the sheet's 588 rows that is the rows
   on screen; on a register with one quote in it, it is the rows it
   would have. Until 2026-09-23 the ruler asserted the larger of that
   and the records in view, and the larger of two readings is the one
   that hides a fault: on that day it passed Data on 18 records a
   person could not all read (16 could), and the customers book on a
   room of 561px that a full book there does not have (430px — the pile
   of typed names stands under it).

   THE ROOM IS ASKED OF THE LAYOUT, NOT ADDED UP. A full list is a list
   whose content is taller than any window. So the ruler lays one
   invisible block of 100,000px at the end of the list, reads where the
   list's box then ends, and takes the block away again inside the same
   task — before the browser paints, before any observer runs, and
   without a row, a record or a byte of data. Whatever the screen does
   with a tall list is what gets measured: a list that scrolls inside
   its frame shrinks to the room its frame leaves it, pushing the act
   row and the legend under it to the frame's foot and eating any auto
   margin; a list with no frame to stop it runs to the bottom of the
   window. Margins, gaps, borders, a filing form in the column, a row
   of keys — all of it is subtracted by the layout engine itself, so no
   route can declare the wrong furniture and no builder can add a line
   of text to the room without it coming off the figure.

     room  from the top of the list's first row (below any sticky
           column heads) to the lowest edge a person can see of the
           full list: its own scrollport, every scroller around it, the
           window, and anything `position: fixed` painted over it —
           the shell's pill is one, and it is why a room measured
           before the pill existed is not the room today;
     heads the band heads standing in that room, which stand whether
           their bands are full or empty;
     holds floor((room − heads) / pitch).

   WHAT A PERSON CAN READ, for the records in view and for the pitch:
   a row whose box is inside the window, inside EVERY scroller around
   it — Data's eighteenth row sat inside the window and outside its own
   list's scrollport, and the old reading called it readable — and
   clear of anything floating over the page. `[role="row"]` is what a
   grid gives a screen reader, so it is what this counts; a register
   that does not expose rows to a reader has a second defect, and this
   ruler finds it as a first one.

   TWO CHECKS ON THE RULER ITSELF. Every record a person can read has
   to be in the list the route names (`strays`), or the route has named
   the wrong list. And a full list can never hold fewer records than a
   person can already read in the bare one (`records ≤ capacity`), or
   the arithmetic is wrong and not the screen.

   A RECORD IS A ROW WITH MORE THAN ONE CELL. A band head and an
   empty-band notice are rows too — a grid gives them to a reader as
   rows — but each is one cell spanning the grid, and a ruler that
   counted them as records would count a register's furniture as its
   contents. A band head is the FIRST row of its rowgroup, which is the
   only thing the ruler knows about any screen's bands. An empty-band
   notice is counted as room: a full band has no notice.

   `fixture.spec.ts` points every part of this at pages built to fail.
   ============================================================ */

/**
 * WHICH LIST, said by the route rather than guessed by the ruler: the element that carries
 * the register's `role="grid"` — the box its rows scroll in — so a screen with a second grid
 * on it (a record panel, a plate) can never be measured by mistake.
 */
export interface DensitySpec {
  list: string
}

export interface DensityRead {
  /** rows of any kind a person can read now: in the window, in every scroller, clear of the pill */
  shown: number
  /** record rows (more than one cell) a person can read now, in the named list */
  records: number
  /** record rows a person can read now that are NOT in the named list — should be 0 */
  strays: number
  /** the median border-box height of the record rows in the list, or null with none */
  pitch: number | null
  /** the height, in px, a person can see of the list once it is full, from its first row down */
  room: number
  /** px of that list something `position: fixed` stands over — the pill, today */
  covered: number
  /** px of band heads standing in the room */
  heads: number
  /** floor((room − heads) / pitch); 0 when there is no pitch to divide by */
  capacity: number
  /** true when the list is its own scroller; false when a full list grows until something
   *  around it, or the window, stops it */
  framed: boolean
  /** the route's selector, when it matched nothing */
  missing: string | null
}

export function readDensity(spec: DensitySpec): DensityRead {
  /* EVERYTHING IS DECLARED INSIDE on purpose: `page.evaluate` ships this one function to
     the page, and a helper at module scope would not be there when it runs. */
  const H = window.innerHeight
  const W = window.innerWidth
  const cells = '[role="gridcell"], [role="cell"]'
  const isRecord = (row: Element): boolean => row.querySelectorAll(cells).length > 1
  /** the first row of its rowgroup, when that row is not itself a record */
  const isHead = (row: Element): boolean =>
    !isRecord(row) && row.closest('[role="rowgroup"]')?.querySelector('[role="row"]') === row
  type Box = { top: number; bottom: number; left: number; right: number; height: number }

  /* A ROW'S BOX IS THE BOX ITS CELLS OCCUPY. A register whose cells sit in one CSS grid so
     that every column lines up draws the row with `display: contents`, and such a row has no
     box of its own — its bounding rect is 0×0 at the origin. Measured 2026-09-22 on the
     quotes register. So a row with no height is measured by the union of its cells. */
  const boxOf = (el: Element): Box => {
    const own = el.getBoundingClientRect()
    if (own.height >= 2) return own
    const parts = [...el.querySelectorAll(cells)]
      .map((c) => c.getBoundingClientRect())
      .filter((c) => c.height >= 2)
    if (parts.length === 0) return own
    const top = Math.min(...parts.map((c) => c.top))
    const bottom = Math.max(...parts.map((c) => c.bottom))
    const left = Math.min(...parts.map((c) => c.left))
    const right = Math.max(...parts.map((c) => c.right))
    return { top, bottom, left, right, height: bottom - top }
  }

  /** What a box can show of its content: its own client area, when it clips. */
  const clips = (el: Element): boolean => {
    const cs = getComputedStyle(el)
    return cs.display !== 'contents' && (cs.overflowY !== 'visible' || cs.overflowX !== 'visible')
  }
  const portOf = (el: Element): { top: number; bottom: number } => {
    const r = el.getBoundingClientRect()
    return { top: r.top + el.clientTop, bottom: r.top + el.clientTop + el.clientHeight }
  }
  /** Every scroller around `el`, and the window, intersected: the band it can be seen in. */
  const clipOf = (el: Element, self = false): { top: number; bottom: number } => {
    let top = 0
    let bottom = H
    for (let a = self ? el : el.parentElement; a; a = a.parentElement) {
      if (a === document.documentElement || a === document.body) break
      if (!clips(a)) continue
      const p = portOf(a)
      top = Math.max(top, p.top)
      bottom = Math.min(bottom, p.bottom)
    }
    return { top, bottom }
  }

  /* HALF A PIXEL OF GRACE on every edge: a row laid at 799.6 is on the screen, and a ruler
     that failed it would be measuring the rounding and not the layout. */
  const GRACE = 0.5

  /* WHAT FLOATS OVER THE PAGE: every `position: fixed` thing that is visible and is the
     topmost thing at its own centre — so a layer painted BEHIND the page is not one. */
  const covers: Box[] = []
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el)
    if (cs.position !== 'fixed' || cs.visibility === 'hidden') continue
    const f = el.getBoundingClientRect()
    if (f.width < 2 || f.height < 2) continue
    const x = Math.min(W - 1, Math.max(0, f.left + f.width / 2))
    const y = Math.min(H - 1, Math.max(0, f.top + f.height / 2))
    const hit = document.elementFromPoint(x, y)
    if (hit && el.contains(hit)) covers.push(f)
  }
  const across = (a: Box, b: Box) => a.left < b.right - 1 && b.left < a.right - 1
  const under = (b: Box) =>
    covers.some((f) => across(f, b) && f.top < b.bottom - GRACE && b.top < f.bottom - GRACE)
  const readable = (row: Element, b: Box): boolean => {
    if (b.height < 2) return false
    const c = clipOf(row)
    return b.top >= c.top - GRACE && b.bottom <= c.bottom + GRACE && !under(b)
  }

  const list = document.querySelector(spec.list)

  /* ---- now: what a person can read on the list as it stands ------------------------- */
  let shown = 0
  let records = 0
  let strays = 0
  const pitches: number[] = []
  for (const row of document.querySelectorAll('[role="row"]')) {
    const b = boxOf(row)
    const seen = readable(row, b)
    if (seen) shown++
    if (!isRecord(row)) continue
    const mine = list !== null && list.contains(row)
    if (mine && b.height >= 2) pitches.push(b.height)
    if (seen && mine) records++
    else if (seen) strays++
  }
  pitches.sort((a, b) => a - b)
  const pitch = pitches.length === 0 ? null : pitches[Math.floor(pitches.length / 2)]!

  if (!list) {
    return {
      shown,
      records,
      strays,
      pitch,
      room: 0,
      covered: 0,
      heads: 0,
      capacity: 0,
      framed: false,
      missing: spec.list,
    }
  }

  /* ---- full: the same list with more in it than any window holds --------------------- */
  const block = document.createElement('div')
  block.setAttribute('aria-hidden', 'true')
  block.style.cssText =
    'display:block;block-size:100000px;min-block-size:100000px;grid-column:1/-1;visibility:hidden;margin:0;padding:0;border:0'
  list.append(block)
  try {
    /* the top: the list's first row that a full list would still start with — a record, or
       the head of a band — so the column heads a sticky header stands above them are not room */
    const first = [...list.querySelectorAll('[role="row"]')].find(
      (row) => isRecord(row) || isHead(row),
    )
    const port = portOf(list)
    const start = first ? boxOf(first).top : port.top
    const seen = clipOf(list, true)
    let top = Math.max(start, seen.top)
    let bottom = seen.bottom
    const whole = Math.max(0, bottom - top)
    const lb = list.getBoundingClientRect()
    for (const f of covers) {
      if (!across(f, lb) || f.bottom <= top || f.top >= bottom) continue
      if (f.top + f.height / 2 <= (top + bottom) / 2) top = Math.max(top, f.bottom)
      else bottom = Math.min(bottom, f.top)
    }
    const room = Math.max(0, bottom - top)

    /* each head once, even where a rowgroup sits inside another and both begin with it */
    const standing = new Set<Element>()
    for (const group of list.querySelectorAll('[role="rowgroup"]')) {
      const head = group.querySelector('[role="row"]')
      if (head && isHead(head)) standing.add(head)
    }
    let heads = 0
    for (const head of standing) {
      const b = boxOf(head)
      const c = clipOf(head)
      const t = Math.max(b.top, top, c.top)
      const u = Math.min(b.bottom, bottom, c.bottom)
      heads += Math.max(0, u - t)
    }

    return {
      shown,
      records,
      strays,
      pitch,
      room,
      covered: Math.max(0, whole - room),
      heads,
      capacity: pitch === null ? 0 : Math.max(0, Math.floor((room - heads) / pitch)),
      framed: clips(list),
      missing: null,
    }
  } finally {
    block.remove()
  }
}
