import { describe, expect, it } from 'vitest'
import { specLabel, specValue, specsSaid } from './specSay'

describe('a boat’s specification, said as a person says it', () => {
  it('says the file’s shorthand in full, in a sentence’s casing', () => {
    expect(specLabel('Shaft Lgth')).toBe('Shaft length')
    expect(specLabel('Eng Configuration')).toBe('Engine configuration')
    expect(specLabel('Tube Dia.')).toBe('Tube diameter')
    expect(specLabel('Int Length')).toBe('Inside length')
    expect(specLabel('Int. Beam')).toBe('Inside beam')
    expect(specLabel('Hull Weight @ (Dry)')).toBe('Hull weight (dry)')
    expect(specLabel('Max Load')).toBe('Maximum load')
    expect(specLabel('OA Length')).toBe('Length overall')
    expect(specLabel('BMT Weight (Dry)')).toBe('BMT weight (dry)')
    expect(specLabel('Fuel Capcity')).toBe('Fuel capacity')
  })

  it('writes units as a person does, and changes no figure', () => {
    expect(specValue('105 ltr')).toBe('105 L')
    expect(specValue('90 HP')).toBe('90 hp')
    expect(specValue('4.51m to 6.0m')).toBe('4.51 m to 6.0 m')
    expect(specValue('1.35')).toBe('1.35')
    expect(specValue('Remote')).toBe('Remote')
  })

  it('says the horsepower range as one row, and leaves out what is not the boat', () => {
    const said = specsSaid([
      { label: 'Matrix', value: 'Highfield Inflatables' },
      { label: 'Min', value: '90 HP' },
      { label: 'Model Code', value: 'HBS113' },
      { label: 'Max', value: '115 HP' },
      { label: 'Fuel Capacity', value: '105 ltr' },
    ])
    expect(said).toEqual([
      { label: 'Power', value: '90–115 hp' },
      { label: 'Fuel capacity', value: '105 L' },
    ])
  })

  it('keeps one end of the range under its own word where the file gives only one', () => {
    expect(specsSaid([{ label: 'Max', value: '60 HP' }])).toEqual([
      { label: 'Maximum power', value: '60 hp' },
    ])
  })
})
