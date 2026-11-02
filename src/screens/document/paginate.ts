/* ============================================================
   PACKING A DOCUMENT INTO PAGES.

   WHY THIS EXISTS AT ALL. This screen prints from the SAME DOM it
   draws, so the sheet on the floor and the sheet in the printer have
   to be the same object — and the only way a screen can draw a page
   BOX is to know where the page ends. CSS `break-inside: avoid` tells
   the printer where not to break and tells the screen nothing: a
   browser gives a scrolling document no page boundaries to draw.

   So the page assignment is made here, once, from measured heights,
   and BOTH surfaces read it: each page is its own element, the screen
   stacks them with the floor showing between, and print puts a
   `break-after` on each one. The printed page count is therefore the
   number of elements, and `e2e/flows/document.spec.ts` asserts the
   PDF against exactly that count.

   IT IS PURE AND IT IS HERE RATHER THAN IN `src/domain`. A band, a
   refusal and a subtotal are rules about documents; this is a rule
   about pixels, and `src/domain` is where a rule goes that a
   stylesheet could not change. The screen measures; this packs.

   ── THE TWO RULES, AND BOTH COME OFF THE SWEEP ───────────────

   1 · A BREAK NEVER FALLS THROUGH A ROW. An atom is the smallest
       thing a reader reads as one — a table row, a heading, a
       paragraph — and an atom is never split. That is the whole of
       the requirement "page breaks fall between sections, not through
       a table row": rows are atoms, so a break can only fall between
       two of them.

   2 · A HEADING IS NEVER LEFT ALONE AT THE FOOT. `keepWithNext` is
       how many atoms must land on the same page as this one — a
       section head keeps its column header and its first row — and
       when they do not all fit, the head moves down with them. It is
       the classic widow rule and it is the reason a section head is
       never the last thing on a page.

   ── AND WHAT IT DELIBERATELY DOES NOT DO ─────────────────────

   IT DOES NOT START EVERY SECTION ON A FRESH PAGE. `docs/research/
   refs/document/notes.md` §4 names the failure and the frame that
   shows it — `porsche-pdf-3`, three rows on an otherwise empty A4 —
   and adds that "our sections are smaller, so a naive one ships
   several of these". Sections flow. The cover is the one page allowed
   to be mostly white, because a cover is a cover.

   NOTHING IS MEASURED HERE. Heights arrive as numbers, so this can be
   tested without a browser, and a browser with no layout — a happy-dom
   render, a print preview before the fonts land — hands in nothing and
   gets one page back, which draws every atom in document order and
   loses nothing.
   ============================================================ */

export interface Atom {
  /** the atom's identity, and the key React draws it under */
  id: string
  /** its measured height in CSS pixels at the page's own measure */
  height: number
  /** how many atoms after this one must sit on the same page */
  keepWithNext?: number
  /** this atom opens a page of its own */
  breakBefore?: boolean
  /**
   * THE HEAD IT IS PRINTED UNDER WHERE IT OPENS A PAGE: the height of its band's head, said again
   * as "continued" at the top of the next sheet, so a line that runs over a page break is never a
   * line belonging to nothing on its page (the printed quote's critic, 2026-10-31: "Garmin NMEA
   * Backbone/Drop Cable" opened page 3 under the running head with no band over it). The page that
   * it opens starts that much fuller.
   */
  carry?: number
  /**
   * WHAT IT GIVES UP WHERE IT OPENS A PAGE: a part's head drops the air over it at the top of a
   * sheet (`.doc-atom:first-child .doc-part`). Heights are gauged as if nothing opened a page, so
   * an atom's height never depends on where the last assignment put it: a price that fits a sheet
   * by a few pixels only when it is not first on it was moved to the next sheet, measured shorter
   * there, moved back, and so on until React stopped the screen (2026-11-03, the Patrol 600).
   * Not given where a band's head is said again above it (`carry`).
   */
  lead?: number
}

/**
 * The atoms, packed into pages of `room` pixels, in order.
 *
 * `room` is the page's own content box, read off the running browser
 * rather than written here: the stylesheet states the paper and the
 * margins, and the screen hands in what those come to. A room of
 * nought or less is a browser that has not laid anything out yet, and
 * the honest answer there is one page with everything on it — never
 * an empty document and never a guess.
 */
export function paginate(atoms: readonly Atom[], room: number): string[][] {
  if (atoms.length === 0) return []
  if (!Number.isFinite(room) || room <= 0) return [atoms.map((a) => a.id)]

  const pages: string[][] = [[]]
  let used = 0

  const start = (): void => {
    pages.push([])
    used = 0
  }

  atoms.forEach((atom, i) => {
    const page = pages[pages.length - 1]

    /* THE RUN THIS ATOM HAS TO KEEP WITH — itself plus however many
       follow it. A run taller than a whole page can never be kept
       together, so the atom is weighed on its own rather than being
       pushed down a page it will not fit on either. */
    let run = atom.height
    for (let k = 1; k <= (atom.keepWithNext ?? 0) && i + k < atoms.length; k += 1) {
      run += atoms[i + k].height
    }
    const need = run > room ? atom.height : run

    const carry = atom.carry ?? 0
    if (page.length > 0 && (atom.breakBefore === true || used + need > room)) {
      start()
      used = carry
    }
    const opens = pages[pages.length - 1].length === 0 && carry === 0
    pages[pages.length - 1].push(atom.id)
    used += atom.height - (opens ? (atom.lead ?? 0) : 0)
  })

  /* a page that nothing landed on is a page nobody asked for — it
     happens when the last atom carried `breakBefore` and was the only
     thing left */
  return balanced(
    pages.filter((page) => page.length > 0),
    atoms,
    room,
  )
}

/* ============================================================
   AND THEN THE SHEETS ARE EVENED (the owner's fully specced quote, read
   2026-11-03: "the page breaks leave a lot of blank paper. On page 2 the
   last content ends at ~690 pt … on page 3 the last line ends at ~598
   pt, so about 180 pt (22% of the page) is blank").

   Filling each sheet in turn fills the first to its foot and leaves the
   white on the next. Where two sheets run on into each other — the
   second does not open a part of its own (`breakBefore`) — the end of
   the first may move over to the second, at a break the rules above
   allow, wherever that leaves the two sheets nearer even: the most white
   either of them then shows is less than before. Nothing moves onto a
   sheet it does not fit, nothing parts a head from what it keeps, and
   the number of sheets never changes. The pairs are evened from the last
   to the first, so a sheet that has taken from the one before it is not
   then emptied into the one after.
   ============================================================ */

/** The least a move must take off the most white either sheet shows, in CSS px: a line's worth.
 *  Sheets a few pixels from even are even. */
const EVEN_ENOUGH = 24

/** How full a sheet holding these atoms is, as the packer counts it. */
function usedOf(ids: readonly string[], byId: ReadonlyMap<string, Atom>): number {
  const first = byId.get(ids[0] ?? '')
  const carry = first?.carry ?? 0
  return ids.reduce(
    (n, id, k) =>
      n + (byId.get(id)?.height ?? 0) - (k === 0 && carry === 0 ? (byId.get(id)?.lead ?? 0) : 0),
    carry,
  )
}

/** True where a page may break before the atom at `cut` of this sheet: no atom before it keeps it. */
function breaksAt(ids: readonly string[], cut: number, byId: ReadonlyMap<string, Atom>): boolean {
  if (cut <= 0 || cut >= ids.length) return false
  return ids.slice(0, cut).every((id, k) => k + (byId.get(id)?.keepWithNext ?? 0) < cut)
}

function balanced(pages: string[][], atoms: readonly Atom[], room: number): string[][] {
  const byId = new Map(atoms.map((a) => [a.id, a]))
  const out = pages.map((page) => [...page])
  /* AGAIN, UNTIL NOTHING MOVES: a sheet that gave its end to the next has room to take from the
     one before it. Every move takes a line's worth off the most white of a pair, so it ends. */
  let passes = 0
  while (passes < out.length * 2 && evenOnce(out, byId, room)) passes += 1
  return out
}

/** One pass over the pairs, from the last to the first; true where anything moved. */
function evenOnce(out: string[][], byId: ReadonlyMap<string, Atom>, room: number): boolean {
  let moved = false
  for (let p = out.length - 2; p >= 0; p -= 1) {
    const here = out[p]!
    const next = out[p + 1]!
    if (byId.get(next[0] ?? '')?.breakBefore === true) continue
    const worst = Math.max(room - usedOf(here, byId), room - usedOf(next, byId))
    let best: { cut: number; worst: number } | null = null
    for (let cut = 1; cut < here.length; cut += 1) {
      if (!breaksAt(here, cut, byId)) continue
      const kept = here.slice(0, cut)
      const onNext = [...here.slice(cut), ...next]
      if (usedOf(onNext, byId) > room) continue
      const after = Math.max(room - usedOf(kept, byId), room - usedOf(onNext, byId))
      if (best === null || after < best.worst) best = { cut, worst: after }
    }
    if (best !== null && best.worst <= worst - EVEN_ENOUGH) {
      out[p] = here.slice(0, best.cut)
      out[p + 1] = [...here.slice(best.cut), ...next]
      moved = true
    }
  }
  return moved
}
