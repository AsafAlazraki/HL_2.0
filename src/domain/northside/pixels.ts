/* ============================================================
   WHAT A PICTURE'S OWN PIXELS SAY — the veil a photograph needs under
   white words, and the ink a mark is drawn in.

   docs/CUSTOMISATION.md: "The scrim is a real piece of engineering, not
   a CSS opacity. It is computed from the picture's own pixels in the
   region the text sits over." These are the two readings, as pure
   arithmetic over RGBA bytes: the screen draws the picture into a
   canvas, hands the bytes here, and keeps the answer beside the choice.
   ============================================================ */

import { FLOOR, luminanceOf, ratio, rgbFromOklch } from './colour'

/** RGBA bytes, four to a pixel — `ImageData.data`'s shape. */
export type Pixels = ArrayLike<number>

/** The navy the veil is laid in: tokens.css's `--color-neutral-950`, oklch(18.9% 0.0309 231.6). */
const VEIL = rgbFromOklch({ l: 0.189, c: 0.0309, h: 231.6 })

/** The brightest pixels are read at this share from the top, so one glint is not the picture. */
export const BRIGHT_SHARE = 0.02

/** The highest luminance white words clear the floor on: (1.05 / 4.5) − 0.05. */
const CEILING = 1.05 / FLOOR - 0.05

/** The luminance at the given share from the brightest, of the pixels under the words. */
function brightAt(data: Pixels, veil: number): number {
  const lums: number[] = []
  for (let i = 0; i + 3 < data.length; i += 4) {
    const rgb = [0, 1, 2].map(
      (k) => (data[i + k]! / 255) * (1 - veil) + VEIL[k]! * veil,
    ) as unknown as readonly [number, number, number]
    lums.push(luminanceOf(rgb))
  }
  if (lums.length === 0) return 0
  lums.sort((a, b) => b - a)
  return lums[Math.min(lums.length - 1, Math.floor(lums.length * BRIGHT_SHARE))]!
}

export interface VeilReading {
  /** 0 to 1, rounded UP to the hundredth: the navy laid over the picture */
  veil: number
  /** white on the brightest of it, once veiled */
  whiteOn: number
  /** white on the brightest of it, bare */
  bare: number
}

/**
 * The least navy, in hundredths, that brings white words to the floor over the brightest
 * pixels of the region they sit on. A dark photograph needs none, and says so.
 */
export function veilFor(data: Pixels): VeilReading {
  const bare = ratio(1, brightAt(data, 0))
  if (bare >= FLOOR) return { veil: 0, whiteOn: bare, bare }
  let lo = 0
  let hi = 1
  for (let i = 0; i < 20; i += 1) {
    const mid = (lo + hi) / 2
    if (brightAt(data, mid) <= CEILING) hi = mid
    else lo = mid
  }
  const veil = Math.min(1, Math.ceil(hi * 100) / 100)
  return { veil, whiteOn: ratio(1, brightAt(data, veil)), bare }
}

/** A veil as a manager reads it: "a 53% veil". */
export const saidVeil = (veil: number): string =>
  veil === 0 ? 'no veil needed' : `a ${Math.round(veil * 100)}% veil`

/* ---------------------------------------------------------- */
/* A mark's ink                                                */
/* ---------------------------------------------------------- */

/** A mark is a graphic: it needs 3 : 1 to be seen (WCAG 2.2, SC 1.4.11). */
export const MARK_FLOOR = 3

export interface InkReading {
  ink: 'dark' | 'light'
  /** the mark's own ink on white paper */
  onPaper: number
  /** how many of its pixels are drawn at all */
  drawn: number
}

/**
 * What a mark is drawn in: the average of its opaque pixels, measured on white paper. Null for
 * a file with nothing drawn in it.
 */
export function inkOf(data: Pixels): InkReading | null {
  /* A FILE WITH NO CLEAR PIXELS IS A MARK ON ITS OWN WHITE GROUND (a JPEG off a letterhead):
     its near-white pixels are that ground, not ink, and are left out of the reading */
  let clear = false
  for (let i = 3; i < data.length; i += 4) {
    if (data[i]! < 128) {
      clear = true
      break
    }
  }
  let drawn = 0
  let sum = 0
  for (let i = 0; i + 3 < data.length; i += 4) {
    const alpha = data[i + 3]! / 255
    if (alpha < 0.5) continue
    const lum = luminanceOf([data[i]! / 255, data[i + 1]! / 255, data[i + 2]! / 255])
    if (!clear && lum > 0.85) continue
    drawn += 1
    sum += lum
  }
  if (drawn === 0) return null
  const onPaper = ratio(1, sum / drawn)
  return { ink: onPaper >= MARK_FLOOR ? 'dark' : 'light', onPaper, drawn }
}
