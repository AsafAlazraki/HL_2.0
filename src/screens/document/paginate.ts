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
  return pages.filter((page) => page.length > 0)
}

/* ============================================================
   THE LAST SHEET'S ROOM GOES TO THE BOAT (the quote round's audit,
   round 3, D2, 2026-11-03).

   A last sheet that holds only "Your price" and the signatures has
   room left on it, and three rounds placed that room three ways: under
   the signatures (round 1: "the lower third blank"), between the price
   and the signatures (round 2: "about 210px of empty page"), and shared
   above and below them (round 3: "a band of white still stands between
   them", 52–74 mm). Each was the same white moved about. Where the
   price carries the cover's own picture, the room is the picture's
   instead: it is drawn larger, over the figures, until the sheet is
   full but for `FILL_AIR`, and the signatures follow the figures.

   THE PICTURE IS NEVER ENLARGED AND NEVER CROPPED. It grows only up to
   the pixels held (`held`), and only as wide as the sheet's measure;
   where that stops it short of the room, the rest of the room stays as
   it was. A picture that would grow by less than a line is left as it
   was too: a sheet a few millimetres short of full is a sheet, and a
   picture that moves for nothing is a picture that moves.

   PURE, LIKE `paginate`: the screen measures the price in the paper's
   own geometry (`data-gauging`, where the picture is always drawn as it
   was) and hands the numbers in, so a fill can never feed back into the
   page assignment it was read from.
   ============================================================ */

/** The air, in CSS px, a filled sheet keeps between the figures and the signatures, about 10 mm,
 *  shared above and below them by the signatures' own margins. */
export const FILL_AIR = 40

/** The least a picture grows by before it is grown at all, in CSS px: a line of the paper. */
export const FILL_LEAST = 32

/** The narrowest the picture's own line (its name and finish) stands beside it, gap included. */
export const LINE_BESIDE = 200

/** The price as the paper's geometry drew it, and the sheet it stands on. */
export interface FillReading {
  /** the page's own content box, and the height of every atom on the price's page */
  room: number
  used: number
  /** the price's whole height, and what of it is not its body: its head and its own padding */
  atom: number
  above: number
  /** the picture's figure without the picture and its line: its padding */
  boat: number
  /** the picture's line (its name and finish) and the picture, as drawn beside the figures */
  line: number
  picture: number
  /** the room between the picture and the figures once they stand one over the other */
  gap: number
  /** the figures' own height */
  figs: number
  /** the sheet's measure, and what the figure keeps either side of the picture (a studio panel) */
  width: number
  inset: number
  /** the pixels held: never drawn past them */
  held: { width: number; height: number }
  /** the line may stand beside the picture: a photograph's ground, not a studio panel */
  beside: boolean
}

/** How the price's picture fills its sheet: its height in CSS px, and whether its line stands
 *  beside it or under it. */
export interface Fill {
  height: number
  beside: boolean
}

/** THE PICTURE'S HEIGHT ON A SHEET WITH ROOM LEFT, or null where the price stays as drawn. */
export function fillOf(r: FillReading): Fill | null {
  const left = r.room - r.used
  if (!(left > FILL_AIR + FILL_LEAST) || r.held.width <= 0 || r.held.height <= 0) return null
  const ratio = r.held.height / r.held.width
  const budget = r.atom + left - FILL_AIR - r.above - r.boat - r.gap - r.figs
  const under = Math.min(budget - r.line, (r.width - r.inset) * ratio, r.held.height)
  const beside = r.beside
    ? Math.min(budget, (r.width - r.inset - LINE_BESIDE) * ratio, r.held.height)
    : -1
  const besideFits = beside >= r.line && beside >= under
  const height = Math.floor(besideFits ? beside : under)
  if (height < r.picture + FILL_LEAST) return null
  return { height, beside: besideFits }
}
