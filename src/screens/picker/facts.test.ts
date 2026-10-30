import { describe, expect, it } from 'vitest'
import { spokenFact } from './facts'

/* Each case is a label and value `measured` hands the strip on the real file (Formosa,
   Stacer, Stabicraft, Yamaha, the trailers), measured on 2026-10-30. */
describe('a figure is said with its noun', () => {
  it('says Min and Max over horsepower as power, with the unit as it is written', () => {
    expect(spokenFact({ label: 'Max', value: '90 HP' })).toEqual({
      label: 'Max power',
      value: '90 hp',
    })
    expect(spokenFact({ label: 'Min', value: '2 HP' })).toEqual({
      label: 'Min power',
      value: '2 hp',
    })
  })

  it('leaves a Min or Max that is not power as the file wrote it', () => {
    expect(spokenFact({ label: 'Max', value: '6' })).toEqual({ label: 'Max', value: '6' })
  })

  it('sets every label in sentence case, keeping the letters the file means as letters', () => {
    expect(spokenFact({ label: 'WEIGHT', value: '17 kg' }).label).toBe('Weight')
    expect(spokenFact({ label: 'Hull Length', value: '4.82 m' }).label).toBe('Hull length')
    expect(spokenFact({ label: 'OA Length', value: '2.3 m' }).label).toBe('OA length')
    expect(spokenFact({ label: 'ATM', value: '750 kg' }).label).toBe('ATM')
  })

  it('drops the file\'s "@" and reads a trailing "in" as the inch on a bare figure', () => {
    expect(spokenFact({ label: 'Hull Weight @ (Dry)', value: '265 kg' }).label).toBe(
      'Hull weight (dry)',
    )
    expect(spokenFact({ label: 'Wheel Size in', value: '13' })).toEqual({
      label: 'Wheel size',
      value: '13 in',
    })
  })
})
