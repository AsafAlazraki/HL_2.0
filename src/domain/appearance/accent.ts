/* ============================================================
   AN ACCENT NORTHSIDE MAY CHOOSE, AND ONE IT MAY NOT — WITH THE
   SENTENCE THAT SAYS WHY.

   The component kit gives every ink one job (src/styles/tokens.css,
   THE KIT). The accent is Northside's own and its job is "where you
   are and what is chosen": the chosen ring and chip, the lit door, the
   band its name stands on. The kit's judge (2026-09-28) asked that the
   settings refuse, with a sentence, an accent that would take another
   ink's job — "otherwise the first accent Northside picks breaks the
   one thing this kit is for: colour that means one thing everywhere".
   docs/CUSTOMISATION.md adds the contrast floor: the accent carries
   white words (the band, a chosen chip), so white on it must clear
   4.5 : 1.

   An accent is REFUSED when:
     · it is not a colour — under 0.05 of OKLCH chroma a chosen chip
       cannot be told from the ink around it;
     · white on it is under 4.5 : 1;
     · its hue lands within 15° of an ink that means something else —
       the act's amber, a kind's ink, a status's ink;
     · it is within 0.09 of such an ink in OKLab, whatever its hue: the
       boat's cobalt is set apart from the accent by lightness, not by
       hue, and this is what keeps an accent from darkening onto it.

   Pure arithmetic on OKLCH, converted to sRGB by the published OKLab
   matrices (Björn Ottosson, 2020) and measured with the WCAG 2.x
   relative-luminance formula — the same arithmetic tokens.css's
   figures were measured with. The settings panel (Milestone 4) calls
   this; the kit's specimen (/kit) shows it.
   ============================================================ */

export interface Oklch {
  /** lightness, 0 to 1 */
  l: number
  c: number
  /** hue in degrees */
  h: number
}

interface Reserved {
  /** what the ink is, in a sentence's words */
  name: string
  /** what it means, which an accent on it would contradict */
  job: string
  ink: Oklch
  /** whether its hue alone is guarded; the boat is set apart by lightness instead */
  byHue: boolean
}

/** The day's inks with a job, byte for byte as tokens.css declares them. */
export const RESERVED_INKS: readonly Reserved[] = [
  {
    name: 'the act’s amber',
    job: 'amber is the one thing a person presses, and a chosen motor would read as an act waiting',
    ink: { l: 0.783, c: 0.1453, h: 73 },
    byHue: true,
  },
  {
    name: 'a motor’s carmine',
    job: 'carmine says a thing is a motor, and a chosen trailer would read as one',
    ink: { l: 0.5, c: 0.16, h: 22 },
    byHue: true,
  },
  {
    name: 'a trailer’s ochre',
    job: 'ochre says a thing is a trailer, and a chosen motor would read as one',
    ink: { l: 0.5, c: 0.09, h: 95 },
    byHue: true,
  },
  {
    name: 'an accessory’s viridian',
    job: 'viridian says a thing is an accessory',
    ink: { l: 0.49, c: 0.1, h: 163 },
    byHue: true,
  },
  {
    name: 'a package’s violet',
    job: 'violet says a thing is a package',
    ink: { l: 0.5, c: 0.15, h: 300 },
    byHue: true,
  },
  {
    name: 'a dealer’s teal',
    job: 'teal says a thing is a dealer',
    ink: { l: 0.49, c: 0.08, h: 197 },
    byHue: true,
  },
  {
    name: 'a boat’s cobalt',
    job: 'cobalt says a thing is a boat, and every boat would read as chosen',
    ink: { l: 0.38, c: 0.14, h: 268 },
    byHue: false,
  },
  {
    name: 'a draft’s rose',
    job: 'rose says a quote is still a draft',
    ink: { l: 0.52, c: 0.17, h: 350 },
    byHue: true,
  },
  {
    name: 'a given quote’s leaf',
    job: 'leaf says a quote has been given to its customer',
    ink: { l: 0.5, c: 0.13, h: 135 },
    byHue: true,
  },
]

/** How close a hue may come to a reserved one, in degrees. */
export const HUE_GUARD = 15
/** How close, in OKLab, a colour may come to a reserved ink whatever its hue. */
export const NEAR = 0.09
/** Below this chroma a colour is a grey. */
export const GREY = 0.05
/** The contrast white words on the accent must clear. */
export const FLOOR = 4.5

const lab = ({ l, c, h }: Oklch): [number, number, number] => {
  const r = (h * Math.PI) / 180
  return [l, c * Math.cos(r), c * Math.sin(r)]
}

/** Distance in OKLab. */
export function distance(a: Oklch, b: Oklch): number {
  const [l1, a1, b1] = lab(a)
  const [l2, a2, b2] = lab(b)
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2)
}

/** Degrees between two hues, the short way round. */
export function hueGap(a: number, b: number): number {
  const d = Math.abs((((a - b) % 360) + 360) % 360)
  return Math.min(d, 360 - d)
}

/** Relative luminance (WCAG 2.x) of an OKLCH colour, clamped into sRGB. */
export function luminance(colour: Oklch): number {
  const [L, a, b] = lab(colour)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((v) => Math.min(1, Math.max(0, v)))
  return 0.2126 * lin[0]! + 0.7152 * lin[1]! + 0.0722 * lin[2]!
}

/** White on this colour, as a WCAG ratio. */
export function whiteOn(colour: Oklch): number {
  return 1.05 / (luminance(colour) + 0.05)
}

/**
 * Why Northside may not have this accent, as a sentence — or null, when it may.
 */
export function accentRefusal(colour: Oklch): string | null {
  if (colour.c < GREY)
    return 'An accent has to be a colour: in a grey, a chosen chip could not be told from the ink around it.'
  const white = whiteOn(colour)
  if (white < FLOOR)
    return `White on this colour is ${white.toFixed(2)} : 1, under the ${FLOOR} : 1 that Northside’s name on the band and the words on a chosen chip need.`
  for (const r of RESERVED_INKS) {
    const onHue = r.byHue && hueGap(colour.h, r.ink.h) < HUE_GUARD
    if (onHue || distance(colour, r.ink) < NEAR) return `The accent cannot be ${r.name}: ${r.job}.`
  }
  return null
}

/** An OKLCH colour as CSS writes it, for the one place an accent is set: a style on the root. */
export function cssOf(colour: Oklch): string {
  return `oklch(${Number((colour.l * 100).toFixed(2))}% ${colour.c} ${colour.h})`
}

export interface AccentChoice {
  key: string
  /** the colour's own word — not a name anybody gave it */
  name: string
  colour: Oklch
}

/**
 * THE ACCENTS THE KIT'S SPECIMEN LETS A PERSON TRY, so the owner can see the kit stay designed
 * when Northside moves its accent (docs/CUSTOMISATION.md) — and see two refused with their
 * sentences. The first is the accent the app has; the others are colours, not settings, and a
 * preview sets nothing that outlives the page.
 */
export const ACCENT_PREVIEWS: readonly AccentChoice[] = [
  { key: 'blue', name: 'The file’s blue', colour: { l: 0.512, c: 0.1554, h: 255.7 } },
  { key: 'plum', name: 'Plum', colour: { l: 0.42, c: 0.13, h: 325 } },
  { key: 'rust', name: 'Rust', colour: { l: 0.42, c: 0.11, h: 45 } },
  { key: 'amber', name: 'Amber', colour: { l: 0.55, c: 0.11, h: 70 } },
  { key: 'carmine', name: 'Carmine', colour: { l: 0.5, c: 0.17, h: 25 } },
]
