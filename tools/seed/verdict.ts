/* ============================================================
   IS THIS PICTURE A SCENE OR A STUDIO SHOT?

   The chaptered configurator fills the window with a boat's
   photograph when it has one — Saxdor's shape, driven live on
   2026-09-15 — and puts the render large on a quiet ground when it
   does not. Which of the two a picture IS cannot be a list of makers,
   because the seed holds both kinds for one brand (Stacer's Assault
   Pro is an on-water photograph; its Outlaw is a package render on
   white), and it cannot be a guess, because the owner's rule is "no
   fake data": a white-ground render stretched to a full-bleed chapter
   would be a lie about what the file holds.

   So the picture is asked. It is drawn at 32x32 and the ring of
   pixels round its edge is sampled: a render on white has a white
   ring; a photograph of a boat on water has sky and sea in it.

   THIS IS THE OLD `scene.ts` JUDGE AS A PURE FUNCTION OVER PIXELS.
   The old app asked the question in the browser, per address, on a
   canvas, and remembered the answer per session. The answer cannot
   change — the pixels are a committed file — so the packer asks it
   once with `sharp`, writes the verdict into the image ledger, and
   the browser never decodes a picture to learn what it already knows.
   `judge` is the loop, unchanged; `verdictOf` is the decode.
   ============================================================ */

import sharp from 'sharp'
import type { ImageVerdict } from '../../src/domain/model'

/** the side the picture is drawn at before its edge ring is read */
export const SIDE = 32

/** how much of the edge ring must be near-white before a picture is
 *  a studio shot; a photograph's sky is bright but not paper */
const PAPER = 235
const STUDIO_SHARE = 0.7
/** the most colour a render's edge ring carries; the dullest
 *  photograph in the seed (a grey Stabicraft on grey water) is 0.13 */
const NEUTRAL = 0.06

/** The verdict over RGBA pixels of a `w` by `h` picture. */
export function judge(d: Uint8Array | Uint8ClampedArray, w: number, h: number): ImageVerdict {
  let light = 0
  let n = 0
  let sat = 0
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (x > 1 && x < w - 2 && y > 1 && y < h - 2) continue
      const i = (y * w + x) * 4
      /* A canvas reads a fully transparent pixel as transparent BLACK,
         whatever colour sat under the alpha; raw RGBA keeps that
         colour. Read it the canvas's way, so a logo on a transparent
         ground judges as it did in the browser. */
      const a = d[i + 3]
      const r = a === 0 ? 0 : d[i]
      const g2 = a === 0 ? 0 : d[i + 1]
      const b2 = a === 0 ? 0 : d[i + 2]
      const l = (r + g2 + b2) / 3
      const mx = Math.max(r, g2, b2)
      const mn = Math.min(r, g2, b2)
      n += 1
      if (l > PAPER) light += 1
      sat += mx === 0 ? 0 : (mx - mn) / mx
    }
  }
  /* TWO TESTS, EITHER MAKES A STUDIO SHOT. Paper: most of the ring is
     near-white. Neutral: the ring has no colour in it — a render
     whose subject runs to the picture's edge (Highfield's RU280,
     cropped top-down, grey tube on every side) is not white there
     but it is grey; a photograph's ring has sky and water in it.
     Measured on seventeen seed pictures, 2026-09-15: every render's
     ring saturates at 0.00–0.01, every photograph's at 0.13–0.64.
     Luminance spread was tried first and does not separate them
     (renders 7–48, photographs 28–65). */
  if (light / n > STUDIO_SHARE) return 'studio'
  if (sat / n < NEUTRAL) return 'studio'
  return 'scene'
}

/** The verdict for a held picture on disk. The picture is drawn at
 *  32x32 the way `drawImage(img, 0, 0, 32, 32)` drew it — stretched to
 *  the square, aspect ignored — and read as RGBA. A file that cannot
 *  be decoded is a packer failure and throws; the old "treat as
 *  studio" fallback was for a host refusing a canvas, which has no
 *  equivalent for bytes this repository holds. */
export async function verdictOf(file: string): Promise<ImageVerdict> {
  const { data, info } = await sharp(file)
    .resize(SIDE, SIDE, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  return judge(data, info.width, info.height)
}
