import { describe, expect, it } from 'vitest'
import { jointsOf, keepSeparators } from './wrap'

const NO_BREAK = ' '

describe('a name never wraps onto its own separator (m2-last-critique.md, minor 8)', () => {
  it('keeps each spaced "·" and "/" on the word before it, and leaves a break after it', () => {
    expect(keepSeparators('Highfield ADV7 · Hypalon · Black / Grey / Black')).toBe(
      `Highfield ADV7${NO_BREAK}· Hypalon${NO_BREAK}· Black${NO_BREAK}/ Grey${NO_BREAK}/ Black`,
    )
  })

  it('changes no word: with its spaces made spaces again it is the name', () => {
    const said = 'Stacer 519 Sea Ranger SDF · Centre Console'
    expect(keepSeparators(said).replaceAll(NO_BREAK, ' ')).toBe(said)
  })

  it('hands back a name with no spaced separator exactly as it came', () => {
    expect(keepSeparators('Black / Grey / White/Blue')).toBe(
      `Black${NO_BREAK}/ Grey${NO_BREAK}/ White/Blue`,
    )
    expect(keepSeparators('Yamaha F250XCB')).toBe('Yamaha F250XCB')
    expect(keepSeparators('· Hypalon')).toBe('· Hypalon')
    expect(keepSeparators('')).toBe('')
  })
})

describe('a name breaks at its largest joint first', () => {
  it('parts a spoken boat at its "·": the boat, its material, its colourway whole', () => {
    expect(jointsOf('Highfield ADV7 · Hypalon · Black / Grey / Black')).toEqual([
      `Highfield ADV7${NO_BREAK}·`,
      `Hypalon${NO_BREAK}·`,
      `Black${NO_BREAK}/ Grey${NO_BREAK}/ Black`,
    ])
  })

  it('parts a colourway said alone at its "/", and keeps a colour named as two whole', () => {
    expect(jointsOf('Light Grey / White / White/Blue')).toEqual([
      `Light Grey${NO_BREAK}/`,
      `White${NO_BREAK}/`,
      'White/Blue',
    ])
  })

  it('joined with a space, the parts are the name as keepSeparators sets it', () => {
    for (const said of [
      'Highfield ADV7 · Hypalon · Black / Grey / Black',
      'REDCO Custom / Highfield ADV7 Aluminium · TA700T-EH',
      'DEC Rigging Kit · 6x9 Binnacle · CL5 Gauge Kit · 6X6 Single Key Switch',
      'Black / Grey / White/Blue',
      'Stacer 519 Sea Ranger SDF · Centre Console',
      'Yamaha F250XCB',
      'I-B-C',
    ]) {
      expect(jointsOf(said).join(' ')).toBe(keepSeparators(said))
    }
  })

  it('hands back a name with no spaced joint as one part, and nothing for no name', () => {
    expect(jointsOf('Yamaha F250XCB')).toEqual(['Yamaha F250XCB'])
    expect(jointsOf('White/Blue')).toEqual(['White/Blue'])
    expect(jointsOf('')).toEqual([])
  })
})
