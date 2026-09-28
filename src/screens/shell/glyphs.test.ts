import { describe, expect, it } from 'vitest'
import { DOORS, FRONT_DOORS, START_A_QUOTE } from '@/app/ways'
import { DOOR_GLYPHS, WAY_GLYPH, glyphOfWay } from './glyphs'

/* A door added to src/app/ways.ts without a glyph would stand bare on the pill beside four
   that have one; this is where that is caught, not on the owner's screen. */
describe('the glyph of a way', () => {
  it('draws every door the pill carries', () => {
    for (const door of DOORS) expect(glyphOfWay(door.href), door.href).not.toBeNull()
    expect(DOOR_GLYPHS.map((d) => d.href)).toEqual(DOORS.map((d) => d.href))
  })

  it('draws every way out of a dead end, the act that writes a quote included', () => {
    for (const way of FRONT_DOORS) expect(glyphOfWay(way.href), way.href).not.toBeNull()
    expect(glyphOfWay(START_A_QUOTE.href)).not.toBeNull()
  })

  it('gives no two places one glyph, so a glyph always says which place', () => {
    const glyphs = Object.values(WAY_GLYPH)
    expect(new Set(glyphs).size).toBe(glyphs.length)
  })

  it('answers nothing for an address it does not know, rather than a stand-in', () => {
    expect(glyphOfWay('/nope')).toBeNull()
  })
})
