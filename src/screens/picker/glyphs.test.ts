import { describe, expect, it } from 'vitest'
import { EngineIcon, RulerIcon, ScalesIcon } from '@phosphor-icons/react'
import { factGlyph, stripGlyphs } from './glyphs'
import { boatTravel, markTravel } from './travel'

/* ============================================================
   A FIGURE'S GLYPH IS READ OFF ITS LABEL, AND A STRIP HAS A GLYPH ON
   EVERY FIGURE OR ON NONE — the labels below are the price file's own
   column names (data/northside/entities.json), not invented ones.
   ============================================================ */

describe('the glyph beside a figure', () => {
  it('reads what the figure measures off the words of its label', () => {
    expect(factGlyph('OA Length')).toBe(RulerIcon)
    expect(factGlyph('Hull Weight (Dry)')).toBe(ScalesIcon)
    /* a weight before it is a motor */
    expect(factGlyph('Max Main Motor Weight')).toBe(ScalesIcon)
    expect(factGlyph('Max HP')).toBe(EngineIcon)
  })

  it('draws a glyph on every figure of a strip, or on none of them', () => {
    expect(stripGlyphs(['OA Length', 'Int Length', 'Boat Weight']).every(Boolean)).toBe(true)
    /* "Tube Dia." names nothing drawn here, so its neighbours carry none either */
    expect(stripGlyphs(['OA Length', 'Tube Dia.', 'Boat Weight'])).toEqual([null, null, null])
  })
})

describe('the names a picture travels under', () => {
  it('are identifiers the browser accepts, one per row and one per maker', () => {
    const name = boatTravel('boat_highfield', 'boat_highfield-483')
    expect(name).toMatch(/^[A-Za-z_][A-Za-z0-9_-]*$/)
    expect(name).not.toBe(boatTravel('boat_highfield', 'boat_highfield-484'))
    expect(markTravel('boat_stacer')).toMatch(/^[A-Za-z_][A-Za-z0-9_-]*$/)
    expect(markTravel('boat_stacer')).not.toBe(boatTravel('boat_stacer', 'boat_stacer'))
  })
})
