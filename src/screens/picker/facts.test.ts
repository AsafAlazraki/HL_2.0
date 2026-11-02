import { describe, expect, it } from 'vitest'
import { specsSaid } from '@/domain/quote/specSay'
import { spokenFacts } from './facts'

/* Each case is a label and value `measured` hands the strip on the real file (Formosa, Stacer,
   Highfield, Stabicraft, the trailers), measured on 2026-10-30.

   REWRITTEN 2026-11-02 (the quote round's audit, S5): the picker said "OA length", "Int length"
   and "Max power" where the build says "Length overall", "Inside length" and "Maximum power", so
   the strip now asks the build's namer and these cases say the build's words. */
describe('a figure is said with its noun, in the build’s words', () => {
  it('says the file’s shorthand in full, as the build does', () => {
    expect(spokenFacts([{ label: 'OA Length', value: '6.0 m' }])).toEqual([
      { label: 'Length overall', value: '6.0 m' },
    ])
    expect(spokenFacts([{ label: 'Int Length', value: '154 cm' }])).toEqual([
      { label: 'Inside length', value: '154 cm' },
    ])
  })

  it('says a lone Max over horsepower as the build does, and Min and Max as one range', () => {
    expect(spokenFacts([{ label: 'Max', value: '90 HP' }])).toEqual([
      { label: 'Maximum power', value: '90 hp' },
    ])
    expect(
      spokenFacts([
        { label: 'Min', value: '60 HP' },
        { label: 'Max', value: '90 HP' },
      ]),
    ).toEqual([{ label: 'Power', value: '60–90 hp' }])
  })

  it('sets every label in sentence case, keeping the letters the file means as letters', () => {
    const [weight, hull, atm] = spokenFacts([
      { label: 'WEIGHT', value: '17 kg' },
      { label: 'Hull Length', value: '4.82 m' },
      { label: 'ATM', value: '750 kg' },
    ])
    expect(weight?.label).toBe('Weight')
    expect(hull?.label).toBe('Hull length')
    expect(atm?.label).toBe('ATM')
  })

  it('drops the file\'s "@" and reads a trailing "in" as the inch on a bare figure', () => {
    expect(spokenFacts([{ label: 'Hull Weight @ (Dry)', value: '265 kg' }])[0]?.label).toBe(
      'Hull weight (dry)',
    )
    expect(spokenFacts([{ label: 'Wheel Size in', value: '13' }])).toEqual([
      { label: 'Wheel size', value: '13 in' },
    ])
  })

  it('is word for word the build’s namer on every fact it does not move a unit for', () => {
    const facts = [
      { label: 'OA Length', value: '4.82 m' },
      { label: 'Int Width', value: '120 cm' },
      { label: 'Min', value: '40 HP' },
      { label: 'Max', value: '60 HP' },
      { label: 'Max People', value: '5' },
    ]
    expect(spokenFacts(facts)).toEqual(specsSaid(facts))
  })
})
