/* ============================================================
   NORTHSIDE'S COLOUR, MEASURED — one colour typed, the scale worked
   from it, and every figure a manager reads counted, never assumed.

   docs/CUSTOMISATION.md: "a brand colour, from which the app derives the
   scale rather than asking for eleven values", and "a choice that would
   put text under 4.5 : 1 on its own ground is refused with the reason,
   not rendered". The judge of /manage (2026-10-29) narrowed the refusal
   to the contrast floor alone: board B also refused a navy "as a boat's
   cobalt", and that rule is not the floor and is not carried here.
   `src/domain/appearance/accent.ts` keeps its stricter reading for the
   kit's specimen; Northside's own choice is measured by this file.

   THE ARITHMETIC. sRGB is converted to OKLab by Björn Ottosson's
   published matrices (2020), the same ones `accent.ts` and tokens.css's
   figures use, and contrast is the WCAG 2.x relative-luminance ratio.
   A colour is in gamut when every sRGB channel lands in 0..1 before it
   is clamped.
   ============================================================ */

export interface Oklch {
  l: number
  c: number
  h: number
}

type Rgb = readonly [number, number, number]

/** The ratio white words on the brand must clear (CUSTOMISATION.md's floor). */
export const FLOOR = 4.5

/** `#rgb` or `#rrggbb`, any case, with or without the hash. Null for anything else. */
export function parseHex(raw: string): string | null {
  const text = raw.trim().replace(/^#/, '').toLowerCase()
  if (/^[0-9a-f]{3}$/.test(text))
    return `#${text
      .split('')
      .map((c) => c + c)
      .join('')}`
  if (/^[0-9a-f]{6}$/.test(text)) return `#${text}`
  return null
}

const toLinear = (c: number): number => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const toGamma = (c: number): number => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

/** `#rrggbb` as sRGB channels 0..1. */
export function rgbOf(hex: string): Rgb {
  const n = Number.parseInt(hex.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

/** sRGB channels 0..1 as `#rrggbb`, clamped. */
export function hexOf(rgb: Rgb): string {
  return `#${rgb
    .map((c) =>
      Math.round(Math.min(1, Math.max(0, c)) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

/** WCAG 2.x relative luminance of sRGB channels 0..1. */
export function luminanceOf(rgb: Rgb): number {
  const [r, g, b] = rgb.map(toLinear) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** The WCAG ratio between two luminances, the lighter over the darker. */
export function ratio(a: number, b: number): number {
  const [hi, lo] = a >= b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}

/** A ratio as a manager reads it: two places, always, "5.57 : 1". */
export const saidRatio = (r: number): string => `${(Math.floor(r * 100) / 100).toFixed(2)} : 1`

export function oklchOf(rgb: Rgb): Oklch {
  const [r, g, b] = rgb.map(toLinear) as [number, number, number]
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const c = Math.hypot(A, B)
  const h = ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360
  return { l: L, c, h }
}

/** OKLCH as sRGB channels, UNCLAMPED, so a caller can tell whether it is in gamut. */
export function rgbFromOklch({ l: L, c, h }: Oklch): Rgb {
  const rad = (h * Math.PI) / 180
  const A = c * Math.cos(rad)
  const B = c * Math.sin(rad)
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
  return [
    toGamma(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    toGamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    toGamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ]
}

const inGamut = (rgb: Rgb): boolean => rgb.every((v) => v >= -0.0005 && v <= 1.0005)

/** The same lightness and hue, with the chroma taken down until sRGB can draw it. */
export function intoGamut(colour: Oklch): Oklch {
  let lo = 0
  let hi = colour.c
  if (inGamut(rgbFromOklch(colour))) return colour
  for (let i = 0; i < 24; i += 1) {
    const mid = (lo + hi) / 2
    if (inGamut(rgbFromOklch({ ...colour, c: mid }))) lo = mid
    else hi = mid
  }
  return { ...colour, c: lo }
}

/** An OKLCH colour as CSS writes it — the one place the brand is written: the style at boot. */
export function cssOklch({ l, c, h }: Oklch): string {
  return `oklch(${Number((l * 100).toFixed(2))}% ${Number(c.toFixed(4))} ${Number(h.toFixed(1))})`
}

const WHITE = 1

/** White words on this colour, as a WCAG ratio. */
export const whiteOnHex = (hex: string): number => ratio(WHITE, luminanceOf(rgbOf(hex)))

/** The colour as ink on white paper, as a WCAG ratio. The same number as white on it. */
export const onPaperHex = whiteOnHex

/* ---------------------------------------------------------- */
/* The scale, worked from one colour                          */
/* ---------------------------------------------------------- */

/** The eleven steps tokens.css names `--color-blue-*`, in order. */
export const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
export type Step = (typeof STEPS)[number]

/**
 * THE DESIGNED SCALE'S SHAPE, read off tokens.css's blue (2026-09-17): each step's lightness,
 * and its chroma as a share of step 600's. The brand stands at 600, where `--color-accent`
 * points, and the other ten keep the designed scale's lightness and its chroma in proportion.
 */
const SHAPE: Record<Step, { l: number; c: number }> = {
  50: { l: 0.954, c: 0.125 },
  100: { l: 0.9, c: 0.322 },
  200: { l: 0.844, c: 0.532 },
  300: { l: 0.781, c: 0.669 },
  400: { l: 0.695, c: 0.775 },
  500: { l: 0.603, c: 0.887 },
  600: { l: 0.512, c: 1 },
  700: { l: 0.435, c: 0.933 },
  800: { l: 0.36, c: 0.772 },
  900: { l: 0.295, c: 0.611 },
  950: { l: 0.23, c: 0.45 },
}

/** What each step is for, in the words of the job it does — Radix's grouping by job. */
export const STEP_JOB: Record<Step, string> = {
  50: 'the room',
  100: 'a wash',
  200: 'an edge',
  300: 'ink on the water',
  400: 'an edge',
  500: 'a field’s edge',
  600: 'the colour itself',
  700: 'words in the colour',
  800: 'deep water',
  900: 'deep water',
  950: 'deep water',
}

export interface ScaleStep {
  step: Step
  colour: Oklch
  hex: string
  /** the step as ink on white paper */
  onPaper: number
  /** white words on the step */
  whiteOn: number
}

/**
 * The scale worked from the brand. Step 600 IS the brand; a step lighter or darker moves by
 * the designed scale's own distance from 600, so a darker brand darkens the room's tint by
 * less than it darkens its own deep water, and every step is brought into sRGB by chroma.
 */
export function scaleOf(brandHex: string): ScaleStep[] {
  const brand = oklchOf(rgbOf(brandHex))
  const shift = brand.l - SHAPE[600].l
  return STEPS.map((step) => {
    const shape = SHAPE[step]
    /* the shift fades towards both ends, so the room stays a room and the night stays dark */
    const weight =
      step === 600
        ? 1
        : step < 600
          ? (shape.l - SHAPE[50].l) / (SHAPE[600].l - SHAPE[50].l)
          : (shape.l - SHAPE[950].l) / (SHAPE[600].l - SHAPE[950].l)
    const colour =
      step === 600
        ? brand
        : intoGamut({
            l: Math.min(0.985, Math.max(0.12, shape.l + shift * weight)),
            c: brand.c * shape.c,
            h: brand.h,
          })
    const rgb = rgbFromOklch(colour)
    const hex = step === 600 ? brandHex : hexOf(rgb)
    const lum = luminanceOf(rgbOf(hex))
    return { step, colour, hex, onPaper: ratio(WHITE, lum), whiteOn: ratio(WHITE, lum) }
  })
}

/* ---------------------------------------------------------- */
/* Whether it may be Northside's, and what nearly is           */
/* ---------------------------------------------------------- */

export interface BrandReading {
  hex: string
  /** white words on it: Northside's name on the water, the words on a chosen choice */
  whiteOn: number
  /** words in the colour (step 700) on the room's own tint (step 50) */
  wordsOnRoom: number
  /** null when it may be Northside's; the sentence when it may not */
  refused: string | null
}

/** Measure a brand colour on the grounds it will actually sit on. */
export function readBrand(hex: string): BrandReading {
  const scale = scaleOf(hex)
  const at = (s: Step): ScaleStep => scale.find((x) => x.step === s)!
  const white = whiteOnHex(hex)
  const words = ratio(luminanceOf(rgbOf(at(700).hex)), luminanceOf(rgbOf(at(50).hex)))
  let refused: string | null = null
  if (white < FLOOR)
    refused = `White on ${hex.toUpperCase()} is ${saidRatio(white)}, under the ${FLOOR} : 1 that Northside’s name on the water and the words on a chosen choice need.`
  else if (words < FLOOR)
    refused = `Words in this colour on its own tinted room are ${saidRatio(words)}, under the ${FLOOR} : 1 they need.`
  return { hex, whiteOn: white, wordsOnRoom: words, refused }
}

export interface NearPass {
  hex: string
  whiteOn: number
  /** how far it is from what was asked, in OKLab */
  distance: number
}

const distanceOf = (a: Oklch, b: Oklch): number => {
  const ra = (a.h * Math.PI) / 180
  const rb = (b.h * Math.PI) / 180
  return Math.hypot(
    a.l - b.l,
    a.c * Math.cos(ra) - b.c * Math.cos(rb),
    a.c * Math.sin(ra) - b.c * Math.sin(rb),
  )
}

/**
 * THE NEAREST COLOURS THAT PASS, as Contrast Finder offers them: every colour on a grid of
 * lightness, chroma and hue around the one asked for is drawn, measured, and kept when it
 * passes; the nearest by OKLab distance come back, with how many were tried. Two at most, and
 * never two whose hex is the same.
 */
export function nearestPasses(hex: string, most = 2): { passes: NearPass[]; tried: number } {
  const asked = oklchOf(rgbOf(hex))
  const found: NearPass[] = []
  let tried = 0
  for (let dh = -40; dh <= 40; dh += 2) {
    for (let l = 0.2; l <= 0.75; l += 0.005) {
      for (let c = 0.02; c <= 0.3; c += 0.01) {
        tried += 1
        const colour = { l, c, h: (asked.h + dh + 360) % 360 }
        const rgb = rgbFromOklch(colour)
        if (!inGamut(rgb)) continue
        const candidate = hexOf(rgb)
        const white = whiteOnHex(candidate)
        if (white < FLOOR) continue
        found.push({ hex: candidate, whiteOn: white, distance: distanceOf(asked, colour) })
      }
    }
  }
  found.sort((a, b) => a.distance - b.distance || a.hex.localeCompare(b.hex))
  const passes: NearPass[] = []
  for (const pass of found) {
    /* two offered colours a person could not tell apart are one offer */
    const near = passes.some(
      (p) => distanceOf(oklchOf(rgbOf(p.hex)), oklchOf(rgbOf(pass.hex))) < 0.04,
    )
    if (near || readBrand(pass.hex).refused !== null) continue
    passes.push(pass)
    if (passes.length >= most) break
  }
  return { passes, tried }
}

/** The CSS custom properties the brand writes: the eleven steps of the scale, and nothing else. */
export function brandProperties(hex: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const step of scaleOf(hex)) out[`--color-blue-${step.step}`] = cssOklch(step.colour)
  return out
}
