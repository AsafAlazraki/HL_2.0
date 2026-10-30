/* ============================================================
   WHAT A PICTURE'S OWN PIXELS SAY — the veil a photograph needs under
   white words, and the ink a mark is drawn in.

   docs/CUSTOMISATION.md: "The scrim is a real piece of engineering, not
   a CSS opacity. It is computed from the picture's own pixels in the
   region the text sits over." These are the two readings, as pure
   arithmetic over RGBA bytes: the screen draws the picture into a
   canvas, hands the bytes here, and keeps the answer beside the choice.
   ============================================================ */

import { FLOOR, luminanceOf, ratio, rgbFromOklch, toLinear } from './colour'

/** RGBA bytes, four to a pixel — `ImageData.data`'s shape. */
export type Pixels = ArrayLike<number>

/** The navy the veil is laid in: tokens.css's `--color-neutral-950`, oklch(18.9% 0.0309 231.6). */
const VEIL = rgbFromOklch({ l: 0.189, c: 0.0309, h: 231.6 })

/** The brightest pixels are read at this share from the top, so one glint is not the picture. */
export const BRIGHT_SHARE = 0.02

/** The highest luminance white words clear the floor on: (1.05 / 4.5) − 0.05. */
const CEILING = 1.05 / FLOOR - 0.05

/** The value that would stand at index `k` were `values` sorted from the largest down. It
 *  reorders `values`, which is the caller's own scratch copy. */
function largestAt(values: Float64Array, k: number): number {
  let lo = 0
  let hi = values.length - 1
  while (lo < hi) {
    const pivot = values[(lo + hi) >> 1]!
    let i = lo
    let j = hi
    while (i <= j) {
      while (values[i]! > pivot) i += 1
      while (values[j]! < pivot) j -= 1
      if (i <= j) {
        const t = values[i]!
        values[i] = values[j]!
        values[j] = t
        i += 1
        j -= 1
      }
    }
    if (k <= j) hi = j
    else if (k >= i) lo = i
    else return values[k]!
  }
  return values[k]!
}

/**
 * THE PICTURE READ ONCE, then veiled as often as the search asks. The bytes are turned into
 * channels 0..1 a single time, and the brightest share is found by selection rather than by
 * sorting every pixel: the same figure `luminanceOf` and a full sort gave, worked in a small
 * part of the time (measured 2026-10-30: the screen's nine photographs took 10.0 s of the main
 * thread on opening Settings at 390, which is what the rulers timed out on).
 */
function brightness(data: Pixels): (veil: number) => number {
  const n = Math.floor(data.length / 4)
  const r = new Float64Array(n)
  const g = new Float64Array(n)
  const b = new Float64Array(n)
  for (let p = 0; p < n; p += 1) {
    r[p] = data[p * 4]! / 255
    g[p] = data[p * 4 + 1]! / 255
    b[p] = data[p * 4 + 2]! / 255
  }
  const k = Math.min(n - 1, Math.floor(n * BRIGHT_SHARE))
  const lums = new Float64Array(n)
  const [vr, vg, vb] = VEIL
  return (veil) => {
    if (n === 0) return 0
    const keep = 1 - veil
    for (let p = 0; p < n; p += 1) {
      lums[p] =
        0.2126 * toLinear(r[p]! * keep + vr * veil) +
        0.7152 * toLinear(g[p]! * keep + vg * veil) +
        0.0722 * toLinear(b[p]! * keep + vb * veil)
    }
    return largestAt(lums, k)
  }
}

export interface VeilReading {
  /** 0 to 1, in hundredths: the navy laid over the picture */
  veil: number
  /** white on the brightest of it, once veiled */
  whiteOn: number
  /** white on the brightest of it, bare */
  bare: number
}

/**
 * The least navy, in hundredths, that brings white words to the floor over the brightest
 * pixels of the region they sit on. A dark photograph needs none, and says so. The search is
 * over the hundredths themselves, the only veils a manager is shown, so it asks seven readings
 * of the picture rather than twenty-two.
 */
export function veilFor(data: Pixels): VeilReading {
  const brightAt = brightness(data)
  const bare = ratio(1, brightAt(0))
  if (bare >= FLOOR) return { veil: 0, whiteOn: bare, bare }
  let lo = 0
  let hi = 100
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (brightAt(mid / 100) <= CEILING) hi = mid
    else lo = mid
  }
  const veil = hi / 100
  return { veil, whiteOn: ratio(1, brightAt(veil)), bare }
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
