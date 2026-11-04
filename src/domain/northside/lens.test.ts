import { describe, expect, it } from 'vitest'
import { lensPlace, type LensAsk } from './lens'

/* The boxes are the pages' own drawn pixels: an A4 page (794 px) drawn at two thirds is 524 px
   wide, two pages about 1,500 px tall. */
const desk: Omit<LensAsk, 'part' | 'own'> = {
  pages: { w: 524, h: 1500 },
  port: { w: 536, h: 240 },
  drawn: 0.66,
  air: 16,
  legible: 0.75,
}

describe('lensPlace', () => {
  it('draws a small lit part at its printed size, never larger, in the middle of the window', () => {
    /* the total's block: 102 × 54 drawn */
    const at = lensPlace({ ...desk, own: true, part: { x: 200, y: 400, w: 102, h: 54 } })
    expect(at.s).toBeCloseTo(1 / 0.66, 2)
    /* its middle stands at the window's middle */
    expect(Math.round(at.x + (200 + 51) * at.s)).toBe(268)
    expect(Math.round(at.y + (400 + 27) * at.s)).toBe(120)
  })

  it('draws a tall part as large as the window holds it, with its air', () => {
    const at = lensPlace({ ...desk, own: true, part: { x: 40, y: 900, w: 300, h: 300 } })
    expect(at.s).toBe(1)
  })

  it('never draws the pages smaller than they are drawn', () => {
    const at = lensPlace({ ...desk, own: true, part: { x: 0, y: 0, w: 524, h: 600 } })
    expect(at.s).toBe(1)
  })

  it('keeps a part wider than its window at three quarters of its printed size, read from its start', () => {
    /* a phone: the page drawn at 0.41, the total's block across the whole page */
    const at = lensPlace({
      pages: { w: 326, h: 930 },
      port: { w: 326, h: 202 },
      drawn: 0.41,
      air: 16,
      legible: 0.75,
      own: true,
      part: { x: 40, y: 86, w: 280, h: 31 },
    })
    expect(at.s).toBeCloseTo(0.75 / 0.41, 2)
    /* its start stands its air in from the window's edge */
    expect(Math.round(at.x + 40 * at.s)).toBe(16)
  })

  it('stays inside the pages at their edges', () => {
    const at = lensPlace({ ...desk, own: true, part: { x: 2, y: 2, w: 60, h: 20 } })
    expect(at.x).toBe(0)
    expect(at.y).toBe(0)
    /* and at the far edge, the pages' end stands at the window's */
    const end = lensPlace({ ...desk, own: true, part: { x: 460, y: 1480, w: 60, h: 18 } })
    expect(Math.round(end.x + 524 * end.s)).toBe(536)
    expect(Math.round(end.y + 1500 * end.s)).toBe(240)
  })

  it('shows the head of the page where the part is not drawn yet, at the pages’ width', () => {
    const at = lensPlace({ ...desk, own: false, part: { x: 0, y: 760, w: 524, h: 740 } })
    expect(at.s).toBeCloseTo(536 / 524, 2)
    expect(at.y).toBe(Math.round(-760 * at.s))
  })
})
