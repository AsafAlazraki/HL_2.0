import { inflateSync } from 'node:zlib'

/* ============================================================
   THE PIXELS A SCREEN ACTUALLY PAINTED.

   WHY THIS EXISTS. `measure/contrast.ts` builds the ground under a run
   of text by walking `parentElement` and reading `backgroundColor`.
   That is the right answer for type on a surface and it is BLIND to the
   one thing the entry screen is made of: a photograph. Entry's picture
   is an `<img>` inside `.entry-ground`, a `position: fixed` SIBLING of
   the band the words are in, so the walk composites the ancestor chain,
   reaches `.entry` at `--color-ground` and reports 14.95:1 for a caption
   that is really at 4.1:1 on the water it is drawn on. That is how a
   4.1:1 caption shipped green (docs/directions/built-critique.md,
   2026-09-17).

   So where the DOM cannot answer, the PIXELS are asked: Playwright
   screenshots the viewport, this module decodes the PNG in Node, and
   the ground under each run is measured off what was painted. It is the
   same method the critic used by hand — tiles across the run, the
   tile's median luminance taken as the ground behind the glyphs.

   WHY A DECODER LIVES HERE. Nothing in this project's dependency tree
   exposes one: Playwright bundles `pngjs` privately and reaching into
   `playwright-core/lib/utilsBundle` is reaching into somebody's
   internals. A PNG is a length-prefixed chunk list around a zlib
   stream, `node:zlib` does the hard half, and the rest is the five
   filters from the spec (RFC 2083 §6).

   AND IT IS PROVED AGAINST A PICTURE WHOSE ANSWER IS KNOWN. Vitest
   cannot reach this folder — its two projects are `src/**` and
   `tools/**`, and Playwright owns `e2e/` — so the proof is a Playwright
   fixture instead, and is better for it: `fixture.spec.ts` builds a
   page whose picture is half black and half white, screenshots it, and
   asserts the two halves come back at luminance 0 and 1 and the same
   pale ink at 17.02:1 and 1.23:1 on them. Both figures are arithmetic a
   reader can do on paper.

   THE MEDIAN, NOT THE MEAN. A tile under a line of 12px type is mostly
   ground with glyphs over it: at a typical coverage the median pixel of
   the tile is a background pixel, while the mean is dragged toward the
   ink and would report a ground nobody painted. It is also why the
   tiles are small — 24px wide is about two characters, so a run that
   crosses from dark water into bright spray is measured in both places
   rather than averaged into one comfortable number.
   ============================================================ */

export interface Image {
  width: number
  height: number
  /** RGBA, four bytes per pixel, row-major. */
  data: Uint8Array
}

/** A rectangle in image pixels, as `getBoundingClientRect` gives one. */
export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10]

/**
 * A PNG as the browser writes one: 8 bits per channel, no interlace, colour type 2 (RGB) or
 * 6 (RGBA). Anything else throws a sentence rather than returning a picture that is not the
 * one on disk — a ruler that guesses at its own evidence is worse than no ruler.
 */
export function decodePng(bytes: Uint8Array): Image {
  for (const [i, byte] of SIGNATURE.entries()) {
    if (bytes[i] !== byte) throw new Error('that is not a PNG: the eight-byte signature is wrong.')
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let at = 8
  let width = 0
  let height = 0
  let channels = 0
  const idat: Uint8Array[] = []
  while (at + 8 <= bytes.length) {
    const length = view.getUint32(at)
    const kind = String.fromCharCode(bytes[at + 4]!, bytes[at + 5]!, bytes[at + 6]!, bytes[at + 7]!)
    const body = bytes.subarray(at + 8, at + 8 + length)
    if (kind === 'IHDR') {
      width = view.getUint32(at + 8)
      height = view.getUint32(at + 12)
      const depth = body[8]!
      const colour = body[9]!
      const interlace = body[12]!
      if (depth !== 8) throw new Error(`this decoder reads 8 bits per channel, not ${depth}.`)
      if (interlace !== 0) throw new Error('this decoder reads no interlaced PNG.')
      if (colour !== 2 && colour !== 6) {
        throw new Error(`this decoder reads colour type 2 or 6, not ${colour}.`)
      }
      channels = colour === 2 ? 3 : 4
    } else if (kind === 'IDAT') {
      idat.push(body)
    } else if (kind === 'IEND') {
      break
    }
    at += 12 + length /* length, type, body, CRC */
  }
  if (width === 0 || height === 0 || channels === 0) throw new Error('the PNG carried no IHDR.')
  const raw = new Uint8Array(inflateSync(Buffer.concat(idat)))
  return { width, height, data: unfilter(raw, width, height, channels) }
}

/** RFC 2083 §6: five filters, each row naming its own, each reading the row above. */
function unfilter(raw: Uint8Array, width: number, height: number, channels: number): Uint8Array {
  const stride = width * channels
  const out = new Uint8Array(width * height * 4)
  const line = new Uint8Array(stride)
  const above = new Uint8Array(stride)
  let at = 0
  for (let y = 0; y < height; y++) {
    const filter = raw[at++]!
    for (let i = 0; i < stride; i++) {
      const x = raw[at + i]!
      const a = i >= channels ? line[i - channels]! : 0
      const b = above[i]!
      const c = i >= channels ? above[i - channels]! : 0
      line[i] =
        filter === 0
          ? x
          : filter === 1
            ? x + a
            : filter === 2
              ? x + b
              : filter === 3
                ? x + ((a + b) >> 1)
                : filter === 4
                  ? x + paeth(a, b, c)
                  : (() => {
                      throw new Error(`row ${y} names filter ${filter}, which is not one of five.`)
                    })()
    }
    at += stride
    for (let x = 0; x < width; x++) {
      const from = x * channels
      const to = (y * width + x) * 4
      out[to] = line[from]!
      out[to + 1] = line[from + 1]!
      out[to + 2] = line[from + 2]!
      out[to + 3] = channels === 4 ? line[from + 3]! : 255
    }
    above.set(line)
  }
  return out
}

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c
}

/* ---- the arithmetic, the same WCAG 2.x formula measure/contrast.ts runs ---------------- */

const channel = (v: number): number => {
  const s = v / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

/** WCAG relative luminance of one sRGB triple. */
export const luminance = (r: number, g: number, b: number): number =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)

/** The contrast ratio between two luminances, either way round. */
export const ratio = (a: number, b: number): number =>
  (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)

/** One tile of a run of text: where it is, and the ground measured under it. */
export interface Tile {
  x: number
  width: number
  /** the median painted pixel of the tile, taken as the ground behind the glyphs */
  ground: number[]
  groundLuminance: number
  ratio: number
}

/** The MEDIAN PAINTED PIXEL, by luminance — a pixel that is really on the screen, not a mean
 *  of three channels that no monitor ever showed. */
function medianPixel(pixels: number[][]): number[] {
  const sorted = pixels.toSorted(
    (a, b) => luminance(a[0]!, a[1]!, a[2]!) - luminance(b[0]!, b[1]!, b[2]!),
  )
  return sorted[sorted.length >> 1]!
}

/** Translucent ink over the ground it is really painted on. */
const over = (ink: number[], ground: number[]): number[] =>
  [0, 1, 2].map((i) => (ink[3] ?? 1) * ink[i]! + (1 - (ink[3] ?? 1)) * ground[i]!)

/**
 * The ground under a run of text, tile by tile, and the worst ratio the run makes there. The
 * ink is rgba as the page computed it, composited over each tile's own ground the same way
 * `measure/contrast.ts` composites it over a background colour — correction (3), kept.
 *
 * The rect is in image pixels; `scale` converts CSS pixels when a shot was not taken at one
 * pixel per pixel (the recipe fixes deviceScaleFactor at 1 and asserts it, so this is 1 in
 * this repo and a parameter for the day it is not).
 */
export function measureRun(
  image: Image,
  rect: Rect,
  ink: number[],
  options: { tile?: number; scale?: number } = {},
): { ratio: number; tiles: Tile[] } {
  const scale = options.scale ?? 1
  const tileWidth = options.tile ?? 24
  const left = Math.max(0, Math.round(rect.x * scale))
  const top = Math.max(0, Math.round(rect.y * scale))
  const right = Math.min(image.width, Math.round((rect.x + rect.width) * scale))
  const bottom = Math.min(image.height, Math.round((rect.y + rect.height) * scale))
  const tiles: Tile[] = []
  if (right <= left || bottom <= top) return { ratio: Number.POSITIVE_INFINITY, tiles }

  for (let x = left; x < right; x += tileWidth) {
    const end = Math.min(right, x + tileWidth)
    const pixels: number[][] = []
    for (let py = top; py < bottom; py++) {
      for (let px = x; px < end; px++) {
        const at = (py * image.width + px) * 4
        pixels.push([image.data[at]!, image.data[at + 1]!, image.data[at + 2]!])
      }
    }
    if (pixels.length === 0) continue
    const ground = medianPixel(pixels)
    const groundLuminance = luminance(ground[0]!, ground[1]!, ground[2]!)
    const painted = over(ink, ground)
    tiles.push({
      x,
      width: end - x,
      ground,
      groundLuminance,
      ratio: ratio(luminance(painted[0]!, painted[1]!, painted[2]!), groundLuminance),
    })
  }
  const worst = tiles.reduce((low, t) => Math.min(low, t.ratio), Number.POSITIVE_INFINITY)
  return { ratio: worst, tiles }
}

/** The median luminance of a rectangle — what "the picture is gone" is measured with: the
 *  critique of 2026-09-17 read 0.0066 where entry's phone photograph was against 0.0068 for
 *  the flat ground, which is the same picture twice. */
export function medianLuminance(image: Image, rect: Rect, scale = 1): number {
  const left = Math.max(0, Math.round(rect.x * scale))
  const top = Math.max(0, Math.round(rect.y * scale))
  const right = Math.min(image.width, Math.round((rect.x + rect.width) * scale))
  const bottom = Math.min(image.height, Math.round((rect.y + rect.height) * scale))
  const values: number[] = []
  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      const at = (y * image.width + x) * 4
      values.push(luminance(image.data[at]!, image.data[at + 1]!, image.data[at + 2]!))
    }
  }
  if (values.length === 0) return 0
  const sorted = values.toSorted((a, b) => a - b)
  return sorted[sorted.length >> 1]!
}
