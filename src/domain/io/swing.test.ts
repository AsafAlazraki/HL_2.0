import { describe, expect, it } from 'vitest'
import { bySwing, isSwing, movedShare, swingCounts } from './swing'

/* ============================================================
   THE SIZE OF A MOVE, measured at the price a quote reads, either
   way, on lines made the way the change set makes them.
   ============================================================ */

const line = (from: number | null, to: number | null, fate: 'change' | 'new' = 'change') => ({
  fate,
  read: from === null && to === null ? null : { label: 'Sell', fieldId: 'sell', from, to },
})

describe('how far a line moved', () => {
  it('reads the share either way, and nothing where the price a quote reads did not move', () => {
    expect(movedShare(line(100, 110))).toBeCloseTo(0.1)
    expect(movedShare(line(100, 90))).toBeCloseTo(0.1)
    expect(movedShare(line(100, 100))).toBeNull()
    expect(movedShare(line(null, null))).toBeNull()
    /* a new line has no "before" to have moved from */
    expect(movedShare(line(100, 200, 'new'))).toBeNull()
    /* leaving or crossing nought is as far as a figure can move */
    expect(movedShare(line(0, 5))).toBe(Number.POSITIVE_INFINITY)
  })

  it('narrows to the lines that moved at least so far, and counts each size on the same lines', () => {
    const lines = [
      line(819, 769), // −6%
      line(100, 110), // +10%
      line(100, 74), // −26%
      line(479.204, 479.2), // a hair
      line(3, 98), // far
      line(null, null), // another figure only
    ]
    expect(bySwing(lines, undefined)).toHaveLength(6)
    expect(bySwing(lines, 10)).toHaveLength(3)
    expect(bySwing(lines, 25)).toHaveLength(2)
    expect(bySwing(lines, 50)).toHaveLength(1)
    expect(swingCounts(lines)).toEqual({ 10: 3, 25: 2, 50: 1 })
  })

  it('reads only the sizes it offers off an address', () => {
    expect(isSwing('10')).toBe(true)
    expect(isSwing(25)).toBe(true)
    expect(isSwing('33')).toBe(false)
    expect(isSwing('x')).toBe(false)
  })
})
