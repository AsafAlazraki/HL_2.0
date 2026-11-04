/* ============================================================
   THE LENS ONTO THE QUOTE'S PAGES — where, and how large, Settings
   draws the part of a quote a line being set lands in (src/screens/
   manage/Proof.tsx). Pure: it is handed the measured boxes, in the
   pages' own drawn pixels, and answers a placement.

   The pages are drawn at `drawn` of their printed size (two thirds at
   a desk, less in a hand). The lens MAGNIFIES (the verifier of
   Settings, round 2: drawn at 0.66 the lit Prepared by, terms and
   deposit read at about 7 px): the lit part is drawn as large as its
   window holds it with `air` round it, never larger than it prints and
   never smaller than the pages are drawn; a part wider than its window
   is never drawn under `legible` of its printed size, and is then read
   from its start, cut at its far side. A part the pages do not draw
   yet (terms nobody wrote) is shown where it will print: the head of
   its page, at the pages' width.
   ============================================================ */

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

export interface LensAsk {
  /** the lit part, or the head of its page where the part is not drawn yet */
  part: Box
  /** whether `part` is the lit part itself */
  own: boolean
  /** the pages' own drawn size */
  pages: { w: number; h: number }
  /** the window's size */
  port: { w: number; h: number }
  /** the share of their printed size the pages are drawn at */
  drawn: number
  /** the air kept round the part, on each side */
  air: number
  /** the least share of its printed size a part wider than the window is drawn at */
  legible: number
}

export interface Placed {
  x: number
  y: number
  s: number
}

/** Where the pages stand in the window (`x`, `y`) and at what scale of their drawn size (`s`). */
export function lensPlace(ask: LensAsk): Placed {
  const { part, own, pages, port, drawn, air, legible } = ask
  const most = 1 / drawn
  const room = (n: number): number => Math.max(1, n)
  const s = own
    ? Math.max(
        1,
        Math.min(most, (port.w - air * 2) / room(part.w), (port.h - air * 2) / room(part.h)),
        Math.min(most, legible / drawn, (port.h - air * 2) / room(part.h)),
      )
    : Math.max(1, Math.min(most, port.w / room(pages.w)))
  /* the part in the window's middle, as near as the pages' own edges allow; pages smaller than
     the window stand in its middle */
  const mid = (span: number, from: number, size: number, whole: number): number =>
    whole * s <= span
      ? (span - whole * s) / 2
      : Math.max(span - whole * s, Math.min(0, span / 2 - (from + size / 2) * s))
  const x =
    own && part.w * s + air * 2 > port.w
      ? Math.max(port.w - pages.w * s, Math.min(0, air - part.x * s))
      : mid(port.w, part.x, part.w, pages.w)
  const y = own
    ? mid(port.h, part.y, part.h, pages.h)
    : Math.max(port.h - pages.h * s, Math.min(0, -part.y * s))
  return { x: Math.round(x), y: Math.round(y), s: Math.round(s * 1000) / 1000 }
}
