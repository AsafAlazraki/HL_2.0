/* ============================================================
   A COLOUR TAKEN FROM A PHOTOGRAPH'S OWN PIXELS (the judge of
   Settings, 2026-11-04, L10: the two colours offered, #1A65BD at 5.76
   and #0066CC at 5.56 : 1, are two blues a customer could not tell
   apart). Material's "source colour" read the plain way: every pixel's
   hue is put in one of 24 bins, weighted by how much colour it carries
   (OKLCH chroma), and the heaviest bin's mean colour is the photograph's
   own. Grey, white and black pixels weigh nothing, so a white hull on a
   grey sky gives the colour of the water or the canopy, not of the sky.

   THEN IT IS MEASURED, as every colour Northside may wear is: where
   white words on it do not clear the floor, the nearest colour of the
   same hue that does is offered instead, and said as such.

   Pure: bytes in (RGBA, as a canvas hands them), a colour out.
   ============================================================ */

import { hexOf, nearestPasses, oklchOf, readBrand, rgbFromOklch, type Oklch } from './colour'

const BINS = 24
/** a pixel carrying less colour than this is grey, white or black, and weighs nothing */
const GREY = 0.03
/** a photograph whose heaviest hue carries less colour than this, per pixel, has none of its own */
const ENOUGH = 0.002

export interface SourceColour {
  /** the photograph's own colour, as its pixels give it */
  own: string
  /** the colour offered: its own where white words read on it, else the nearest that does */
  offered: string
  /** true where the offer is the nearest that reads, not the photograph's own */
  moved: boolean
}

/** The photograph's own colour and the one offered, or null where its pixels carry none. */
export function sourceColourOf(data: ArrayLike<number>): SourceColour | null {
  const weight = new Float64Array(BINS)
  const sums = Array.from({ length: BINS }, () => ({ l: 0, c: 0, x: 0, y: 0 }))
  let pixels = 0
  for (let i = 0; i + 3 < data.length; i += 4) {
    if ((data[i + 3] ?? 0) < 128) continue
    pixels += 1
    const o = oklchOf([(data[i] ?? 0) / 255, (data[i + 1] ?? 0) / 255, (data[i + 2] ?? 0) / 255])
    if (o.c < GREY) continue
    const bin = Math.floor((((o.h % 360) + 360) % 360) / (360 / BINS)) % BINS
    weight[bin]! += o.c
    const s = sums[bin]!
    s.l += o.l * o.c
    s.c += o.c * o.c
    const r = (o.h * Math.PI) / 180
    s.x += Math.cos(r) * o.c
    s.y += Math.sin(r) * o.c
  }
  if (pixels === 0) return null
  let best = -1
  for (let b = 0; b < BINS; b += 1) if (best < 0 || weight[b]! > weight[best]!) best = b
  const w = weight[best] ?? 0
  if (best < 0 || w / pixels < ENOUGH) return null
  const s = sums[best]!
  const mean: Oklch = {
    l: s.l / w,
    c: s.c / w,
    h: ((Math.atan2(s.y, s.x) * 180) / Math.PI + 360) % 360,
  }
  const own = hexOf(rgbFromOklch(mean))
  if (readBrand(own).refused === null) return { own, offered: own, moved: false }
  const near = nearestPasses(own, 1).passes[0]
  return near ? { own, offered: near.hex, moved: true } : null
}
