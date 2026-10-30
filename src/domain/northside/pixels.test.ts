import { describe, expect, it } from 'vitest'
import { FLOOR, luminanceOf, ratio, rgbFromOklch } from './colour'
import { BRIGHT_SHARE, veilFor } from './pixels'

/* ============================================================
   THE VEIL READ FAST GIVES THE FIGURE THE VEIL READ SLOWLY GAVE.

   veilFor was rewritten on 2026-10-30 because Settings spent 10 s of the
   main thread reading its nine photographs. This is the reading it
   replaced, kept here word for word as the reference: every pixel
   blended, its luminance taken, the whole list sorted, and the veil
   bisected twenty times then rounded up to the hundredth. The pictures
   are made by a seeded walk, so a run is the same run every time.
   ============================================================ */

const VEIL = rgbFromOklch({ l: 0.189, c: 0.0309, h: 231.6 })
const CEILING = 1.05 / FLOOR - 0.05

function referenceBright(data: ArrayLike<number>, veil: number): number {
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

function referenceVeil(data: ArrayLike<number>): { veil: number; whiteOn: number; bare: number } {
  const bare = ratio(1, referenceBright(data, 0))
  if (bare >= FLOOR) return { veil: 0, whiteOn: bare, bare }
  let lo = 0
  let hi = 1
  for (let i = 0; i < 20; i += 1) {
    const mid = (lo + hi) / 2
    if (referenceBright(data, mid) <= CEILING) hi = mid
    else lo = mid
  }
  const veil = Math.min(1, Math.ceil(hi * 100) / 100)
  return { veil, whiteOn: ratio(1, referenceBright(data, veil)), bare }
}

/** A picture of n pixels: a seeded walk round a base colour, with some bright glints. */
function picture(seed: number, n: number, base: [number, number, number]): number[] {
  let s = seed
  const next = (): number => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
  const out: number[] = []
  for (let p = 0; p < n; p += 1) {
    const glint = next() < 0.05 ? 120 : 0
    for (const c of base)
      out.push(Math.max(0, Math.min(255, Math.round(c + (next() - 0.5) * 90 + glint))))
    out.push(255)
  }
  return out
}

describe('the veil, read once and selected', () => {
  const cases: [string, [number, number, number]][] = [
    ['a pale sky', [215, 225, 235]],
    ['a turquoise shallow', [90, 190, 200]],
    ['a grey overcast', [150, 155, 160]],
    ['a deep sea', [20, 50, 90]],
    ['a white hull in sun', [240, 240, 238]],
  ]
  for (const [i, [name, base]] of cases.entries()) {
    it(`gives the slow reading's veil on ${name}`, () => {
      const data = picture(17 + i, 4000, base)
      const fast = veilFor(data)
      const slow = referenceVeil(data)
      expect(fast.veil).toBe(slow.veil)
      expect(fast.bare).toBeCloseTo(slow.bare, 10)
      expect(fast.whiteOn).toBeCloseTo(slow.whiteOn, 10)
      if (fast.veil > 0) expect(fast.whiteOn).toBeGreaterThanOrEqual(FLOOR)
    })
  }

  it('reads an empty picture as needing no veil', () => {
    expect(veilFor([]).veil).toBe(0)
  })
})
