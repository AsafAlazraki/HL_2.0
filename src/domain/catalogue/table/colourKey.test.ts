import { describe, expect, it } from 'vitest'
import type { CatalogueData } from '@/domain/catalogue/sheet'
import { readOrg } from '@/domain/northside/read'
import { COLOUR_CHOICES, colourKey, nameColour, stripesOf } from './colourKey'

const NOW = '2026-11-03T00:00:00.000Z'
const data = (colours?: Record<string, string>): CatalogueData =>
  ({
    business: 'Northside Marine',
    orgId: 'northside',
    org: {
      name: 'Northside Marine',
      industry: 'marine',
      createdAt: '',
      ...(colours ? { colours } : {}),
    },
  }) as unknown as CatalogueData

describe('the colour key', () => {
  it('draws a code part by part: the parts it knows, and the one nobody has named', () => {
    const s = stripesOf('I-B-C')!
    expect(s.parts.map((p) => p.name)).toEqual([null, 'Black', 'Carbon'])
    expect(s.parts.map((p) => p.swatches)).toEqual([[], ['black'], ['carbon']])
    expect(s.say).toBe('I, not named / Black / Carbon')
    /* a two-colour part draws both */
    expect(stripesOf('W-W-WB')!.parts[2]!.swatches).toEqual(['white', 'blue'])
  })

  it('draws nothing for a code it knows nothing of, or one that is not a colourway', () => {
    expect(stripesOf('WH')).toBeNull()
    expect(stripesOf('340')).toBeNull()
    expect(stripesOf('(Dune)')).toBeNull()
  })

  it('draws a letter Northside named, and says it is Northside’s', () => {
    const s = stripesOf('WH', { WH: 'White' })!
    expect(s.parts[0]).toEqual({ token: 'WH', name: 'White', swatches: ['white'], by: 'northside' })
  })

  it('lists every letter the codes carry, counted, the unnamed first', () => {
    const key = colourKey(['W-W-WB', 'I-B-C', 'B-B-B', 'WH', '340'])
    expect(key.slice(0, 2).map((k) => [k.token, k.name])).toEqual([
      ['I', null],
      ['WH', null],
    ])
    expect(key.find((k) => k.token === 'B')!.lines).toBe(2)
    expect(key.find((k) => k.token === 'W')!.lines).toBe(1)
    expect(key.some((k) => k.token === '340')).toBe(false)
  })

  it('names a letter as one step with its way back, and refuses what it cannot draw', () => {
    const out = nameColour('I', 'White')(data(), NOW)
    expect('next' in out && out.next.org?.colours).toEqual({ I: 'White' })
    expect('said' in out && out.said).toBe('I is named White on the colour key')
    if (!('next' in out)) throw new Error('refused')
    const back = out.inverse(out.next, NOW)
    expect('next' in back && back.next.org?.colours).toBeUndefined()

    expect(nameColour('I', 'Ivory')(data(), NOW)).toEqual({
      refused: expect.stringContaining('“Ivory” is not a colour the key can draw'),
    })
    expect(nameColour('B', 'White')(data(), NOW)).toEqual({
      refused: 'B is named by the price file itself, as Black, so it is not renamed here.',
    })
    const cleared = nameColour('I', null)(data({ I: 'White' }), NOW)
    expect('next' in cleared && cleared.next.org?.colours).toBeUndefined()
  })

  it('keeps only names it can draw when Northside’s profile is read back', () => {
    const org = readOrg({
      name: 'Northside Marine',
      industry: 'marine',
      colours: { I: 'White', O: 'Ivory', lower: 'White', WH: COLOUR_CHOICES[0] },
    })
    expect(org?.colours).toEqual({ I: 'White', WH: COLOUR_CHOICES[0] })
  })
})
