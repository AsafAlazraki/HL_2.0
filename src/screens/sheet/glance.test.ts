import { describe, expect, it } from 'vitest'
import { HOLD_MS, heldAsGlance } from './glance'

describe('a held Space is a glance, a tapped one a peek', () => {
  it('reads a quick tap as a peek, and a key held on an open record as a glance', () => {
    expect(heldAsGlance(1_000, 1_020, 1_090)).toBe(false)
    expect(heldAsGlance(1_000, 1_020, 1_020 + HOLD_MS)).toBe(true)
  })

  it('reads a key let go before the record had finished opening as a tap, however late it is handled', () => {
    /* the probe's slowest tap: handled 193 ms after the key went down, before the open was done */
    expect(heldAsGlance(1_922, null, 2_115)).toBe(false)
    expect(heldAsGlance(1_922, null, 1_922 + 10 * HOLD_MS)).toBe(false)
  })

  it('counts the hold from the record being open, so a slow opening never turns a tap into a glance', () => {
    /* the probe: down at 2,359, open at 2,493, up at 2,509 — 150 ms after the key went down, but
       16 ms of it with the record open */
    expect(heldAsGlance(2_359, 2_493, 2_509)).toBe(false)
    expect(heldAsGlance(2_359, 2_493, 2_493 + HOLD_MS)).toBe(true)
  })

  it('counts from the key going down when the record was open before it', () => {
    expect(heldAsGlance(500, 100, 500 + HOLD_MS - 1)).toBe(false)
    expect(heldAsGlance(500, 100, 500 + HOLD_MS)).toBe(true)
  })
})
