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

    if (page.length > 0 && (atom.breakBefore === true || used + need > room)) start()
    pages[pages.length - 1].push(atom.id)
    used += atom.height
  })

  /* a page that nothing landed on is a page nobody asked for — it
     happens when the last atom carried `breakBefore` and was the only
     thing left */
  return pages.filter((page) => page.length > 0)
}
