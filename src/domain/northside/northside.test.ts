/* ============================================================
   NORTHSIDE AS IT PRINTS AND SHOWS — the arithmetic and the sentences
   behind /manage, pinned: a colour measured on its ground and refused
   only at the floor, a veil worked from a picture's own pixels, a mark's
   ink, each line Northside types read or refused, the letterhead a quote
   prints, the one switch, Home's arrangement and the one style element.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import type { OrgProfile } from '@/domain/model'
import {
  FLOOR,
  hexOf,
  nearestPasses,
  parseHex,
  readBrand,
  rgbFromOklch,
  scaleOf,
  whiteOnHex,
} from './colour'
import { abnAddsUp, detailSaid, readDetail } from './details'
import {
  contactLine,
  freezeLetterhead,
  letterheadOf,
  letterheadOnQuote,
  preparerOf,
  validUntil,
} from './letterhead'
import { changeRefusal, personNameRefusal, setApartRefusal } from './people'
import { asBuilt, boatsFirst, moved, sectionOrder, shown, shows } from './home'
import { motionOf, personLookOf, propertiesOf, styleText } from './look'
import { inkOf, veilFor } from './pixels'
import { readOrg } from './read'
import { DESIGNED_ACCENT } from './colour'

const NORTHSIDE: OrgProfile = { name: 'Northside Marine', industry: 'marine', createdAt: '' }

/** n pixels of one colour, RGBA. */
const pixels = (n: number, rgba: [number, number, number, number]): number[] =>
  Array.from({ length: n }, () => rgba).flat()

describe('a colour Northside may choose', () => {
  it('reads a hex written either way, and nothing else', () => {
    expect(parseHex('#0066CC')).toBe('#0066cc')
    expect(parseHex('06c')).toBe('#0066cc')
    expect(parseHex('blue')).toBeNull()
    expect(parseHex('#12345')).toBeNull()
  })

  it('works the designed accent back out of tokens.css’s own blue-600', () => {
    expect(hexOf(rgbFromOklch({ l: 0.512, c: 0.1554, h: 255.7 }))).toBe('#1a65bd')
  })

  it('measures the mark’s own blue as white words on it, and lets it be Northside’s', () => {
    const blue = readBrand('#0066cc')
    expect(blue.whiteOn).toBeCloseTo(5.57, 2)
    expect(blue.refused).toBeNull()
  })

  it('refuses the site’s yellow at the floor alone, with the measured ratio in the sentence', () => {
    const yellow = readBrand('#ffea28')
    expect(yellow.refused).toBe(
      'White on #FFEA28 is 1.23 : 1, under the 4.5 : 1 that Northside’s name on the water and the words on a chosen choice need.',
    )
  })

  it('never refuses a navy for looking like a boat: only the floor refuses (the judge, 2026-10-29)', () => {
    expect(readBrand('#00429a').refused).toBeNull()
  })

  it('offers the nearest colours that pass, each one measured over the floor', () => {
    const near = nearestPasses('#ffea28')
    expect(near.passes.length).toBe(2)
    expect(near.tried).toBeGreaterThan(100_000)
    for (const pass of near.passes) {
      expect(whiteOnHex(pass.hex)).toBeGreaterThanOrEqual(FLOOR)
      expect(readBrand(pass.hex).refused).toBeNull()
    }
  })

  it('works eleven steps from one colour, the brand itself at 600', () => {
    const scale = scaleOf('#0066cc')
    expect(scale.map((s) => s.step)).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950])
    expect(scale.find((s) => s.step === 600)?.hex).toBe('#0066cc')
    const lightness = scale.map((s) => s.colour.l)
    for (let i = 1; i < lightness.length; i += 1)
      expect(lightness[i]!).toBeLessThan(lightness[i - 1]!)
  })
})

describe('what a picture’s own pixels say', () => {
  it('veils a white sky until white words on it clear the floor', () => {
    const read = veilFor(pixels(400, [250, 250, 250, 255]))
    expect(read.bare).toBeLessThan(1.1)
    expect(read.veil).toBeGreaterThan(0.5)
    expect(read.whiteOn).toBeGreaterThanOrEqual(FLOOR)
  })

  it('needs no veil over a dark picture, and says so', () => {
    const read = veilFor(pixels(400, [10, 20, 40, 255]))
    expect(read.veil).toBe(0)
  })

  it('reads a mark’s ink: dark on clear pixels, light on clear pixels, a dark mark on its own white', () => {
    const clear = pixels(50, [0, 0, 0, 0])
    expect(inkOf([...clear, ...pixels(50, [0, 102, 204, 255])])?.ink).toBe('dark')
    expect(inkOf([...clear, ...pixels(50, [255, 255, 255, 255])])?.ink).toBe('light')
    expect(
      inkOf([...pixels(80, [255, 255, 255, 255]), ...pixels(20, [0, 102, 204, 255])])?.ink,
    ).toBe('dark')
    expect(inkOf(clear)).toBeNull()
  })
})

describe('a line Northside types', () => {
  it('keeps an ABN whose digits add up, printed in its groups', () => {
    expect(abnAddsUp('51824753556')).toBe(true)
    expect(readDetail('abn', '51824753556')).toEqual({ ok: true, value: '51 824 753 556' })
  })

  it('refuses an ABN that is short, or whose digits do not add up, in a sentence', () => {
    expect(readDetail('abn', '1234')).toEqual({
      ok: false,
      refused: 'An ABN is eleven digits, and this is 4.',
    })
    const wrong = readDetail('abn', '51 824 753 557')
    expect(wrong.ok).toBe(false)
  })

  it('reads a rate and a number of days inside what they can mean', () => {
    expect(readDetail('gstRate', '10%')).toEqual({ ok: true, value: 10 })
    expect(readDetail('gstRate', '150').ok).toBe(false)
    expect(readDetail('validDays', '30')).toEqual({ ok: true, value: 30 })
    expect(readDetail('validDays', '2.5').ok).toBe(false)
  })

  it('clears a line left empty, and says what an empty line prints', () => {
    expect(readDetail('phone', '  ')).toEqual({ ok: true, value: undefined })
    expect(detailSaid(NORTHSIDE, 'abn')).toEqual({ set: false, said: 'None given, so none prints' })
    expect(detailSaid({ ...NORTHSIDE, validDays: 30 }, 'validDays')).toEqual({
      set: true,
      said: '30 days',
    })
  })
})

describe('the letterhead', () => {
  const mark = { src: '/brand-marks/northside-marine.png', width: 1798, height: 448 }

  it('is the price list’s name, the mark the app carries and the designed blue, and nothing else, before anything is set', () => {
    expect(letterheadOf(undefined, 'Northside Marine', mark)).toEqual({
      name: 'Northside Marine',
      mark,
      accent: DESIGNED_ACCENT,
    })
  })

  it('prints a legal name only where it differs from the trading name', () => {
    expect(
      letterheadOf({ ...NORTHSIDE, legalName: 'northside marine' }, null, null)?.legalName,
    ).toBeUndefined()
    expect(
      letterheadOf({ ...NORTHSIDE, legalName: 'Northside Marine Pty Ltd' }, null, null)?.legalName,
    ).toBe('Northside Marine Pty Ltd')
  })

  it('never prints a light mark Northside added on paper; a dark one takes the held one’s place', () => {
    const light = {
      src: 'data:image/png;base64,AA',
      width: 10,
      height: 4,
      ink: 'light' as const,
      name: 'w.png',
      keptAt: '',
    }
    expect(letterheadOf({ ...NORTHSIDE, marks: { paper: light } }, null, mark)?.mark).toEqual(mark)
    const dark = { ...light, ink: 'dark' as const }
    expect(letterheadOf({ ...NORTHSIDE, marks: { paper: dark } }, null, mark)?.mark?.src).toBe(
      dark.src,
    )
  })

  it('works the day a quote stands until from the local day it was given', () => {
    /* 23:30 in Brisbane on the 31st is the 31st, whatever UTC says */
    expect(validUntil('2026-10-31T13:30:00.000Z', 30)).toBe('2026-11-30')
    const frozen = freezeLetterhead(
      { name: 'Northside Marine', validDays: 14 },
      '2026-10-29T00:00:00.000Z',
    )
    expect(frozen.validUntil).toBe('2026-11-12')
  })

  it('says the contact line in the order a letterhead prints it, each part only where given', () => {
    expect(
      contactLine({
        name: 'N',
        abn: '51 824 753 556',
        phone: '07 0000 0000',
        address: '1 A St\nB QLD',
      }),
    ).toEqual(['ABN 51 824 753 556', '1 A St, B QLD', '07 0000 0000'])
  })

  it('prints today’s on a draft, the one it was given with on a given quote, and none on an old one', () => {
    const today = { name: 'Northside Marine', abn: '51 824 753 556' }
    expect(letterheadOnQuote({ state: 'draft' }, today)).toBe(today)
    expect(letterheadOnQuote({ state: 'issued', letterhead: { name: 'Then' } }, today)?.name).toBe(
      'Then',
    )
    expect(letterheadOnQuote({ state: 'issued' }, today)).toBeNull()
  })

  it('prints who prepared it with how to reach them, or the name alone', () => {
    const people = [{ id: 'p1', name: 'Mia Tran', title: 'Sales', phone: '0400 000 000' }]
    expect(preparerOf(people, 'mia tran')).toEqual({
      name: 'Mia Tran',
      title: 'Sales',
      phone: '0400 000 000',
    })
    expect(preparerOf(people, 'Asaf')).toEqual({ name: 'Asaf' })
    expect(preparerOf(people, '')).toBeUndefined()
  })
})

describe('the one switch', () => {
  const people = [
    { id: 'a', name: 'Asaf' },
    { id: 'b', name: 'Mia', mayChange: false as const },
  ]

  it('refuses only a person Northside set apart, with who may instead', () => {
    expect(changeRefusal({ people }, 'Asaf')).toBeNull()
    expect(changeRefusal({ people }, 'Nobody listed')).toBeNull()
    expect(changeRefusal({ people }, 'mia')).toBe(
      'Mia is set apart from changing prices and settings, so nothing was changed. Asaf may.',
    )
  })

  it('never sets apart the last person who may', () => {
    expect(setApartRefusal(people, 'a', false)).toMatch(/^Somebody has to be able/)
    expect(setApartRefusal(people, 'b', true)).toBeNull()
  })

  it('refuses a person with no name or a name already here', () => {
    expect(personNameRefusal(people, ' ')).toMatch(/^A person needs a name/)
    expect(personNameRefusal(people, 'asaf')).toBe('Asaf is already one of Northside’s people.')
    expect(personNameRefusal(people, 'asaf', 'a')).toBeNull()
  })
})

describe('Home, as Northside arranges it', () => {
  it('is as built with nothing set', () => {
    expect(sectionOrder(undefined)).toEqual(['desk', 'boats', 'makers'])
    expect(asBuilt(undefined)).toBe(true)
  })

  it('moves a section by one place and hides one without forgetting it', () => {
    const swapped = moved(undefined, 'makers', -1)
    expect(sectionOrder(swapped)).toEqual(['desk', 'makers', 'boats'])
    const hidden = shown(swapped, 'boats', false)
    expect(shows(hidden, 'boats')).toBe(false)
    expect(sectionOrder(hidden)).toContain('boats')
    expect(shows(shown(hidden, 'boats', true), 'boats')).toBe(true)
  })

  it('puts Northside’s boats first, in its order, and keeps the rest', () => {
    expect(boatsFirst(['a', 'b', 'c'], ['c', 'x', 'a'], (b) => b)).toEqual(['c', 'a', 'b'])
  })
})

describe('the one style element', () => {
  it('writes nothing for a look as designed', () => {
    expect(styleText(undefined, {})).toBe('')
  })

  it('writes Northside’s layer and then the person’s, so the person’s wins', () => {
    const text = styleText(
      { brand: '#0066cc', corners: 'square', spacing: 'roomy' },
      { spacing: 'close' },
    )
    expect(text).toContain('--color-blue-600:')
    expect(text).toContain('--radius-plate: 3px')
    expect(text.indexOf('--list-step: 8px')).toBeLessThan(text.indexOf('--list-step: -4px'))
  })

  it('never writes a colour refused at the floor, whatever is kept', () => {
    expect(propertiesOf({ brand: '#ffea28' })).toEqual({})
  })

  it('takes the person’s motion over Northside’s, and reads a stored layer defensively', () => {
    expect(motionOf({ motion: 'less' }, {})).toBe('less')
    expect(motionOf({ motion: 'less' }, { motion: 'system' })).toBe('system')
    expect(personLookOf({ spacing: 'roomy', motion: 'sideways' })).toEqual({ spacing: 'roomy' })
  })
})

describe('Northside’s details, read back', () => {
  it('keeps every field it knows and leaves out what cannot mean anything', () => {
    const read = readOrg({
      name: 'Northside Marine',
      industry: 'marine',
      abn: '51 824 753 556',
      gstRate: 10,
      validDays: 400,
      people: [{ id: 'p', name: 'Mia', mayChange: false }, { name: 'no id' }],
      look: {
        brand: '#0066CC',
        corners: 'blobby',
        hero: { picture: 'highfield-adv7', veil: 0.48 },
      },
      home: { order: ['makers', 'nonsense'], hidden: ['desk'] },
      marks: {
        paper: { src: 'https://elsewhere.example/x.png', width: 1, height: 1, ink: 'dark' },
      },
    })
    expect(read).toEqual({
      name: 'Northside Marine',
      industry: 'marine',
      createdAt: '',
      abn: '51 824 753 556',
      gstRate: 10,
      people: [{ id: 'p', name: 'Mia', mayChange: false }],
      look: { brand: '#0066cc', hero: { picture: 'highfield-adv7', veil: 0.48 } },
      home: { order: ['makers'], hidden: ['desk'] },
    })
  })

  it('reads no profile out of what has no name', () => {
    expect(readOrg({ industry: 'marine' })).toBeUndefined()
    expect(readOrg('nope')).toBeUndefined()
  })
})
