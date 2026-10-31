import { describe, expect, it } from 'vitest'
import { foldToggled, foldedOf, unfolded } from './folded'

describe('the chapters a person has folded', () => {
  it('reads nothing kept as nothing folded, so every chapter stands open', () => {
    expect(foldedOf(undefined)).toEqual([])
    expect(foldedOf(null)).toEqual([])
    expect(foldedOf('motor')).toEqual([])
    expect(foldedOf({ motor: true })).toEqual([])
  })

  it('reads a kept list of chapter ids, each once, and drops what is not a short word', () => {
    expect(foldedOf(['fit', 'motor', 'fit', 3, '', '  ', 'x'.repeat(61), ' trailer '])).toEqual([
      'fit',
      'motor',
      'trailer',
    ])
  })

  it('folds an open chapter and opens a folded one on a press of its head', () => {
    expect(foldToggled([], 'motor')).toEqual(['motor'])
    expect(foldToggled(['motor', 'fit'], 'motor')).toEqual(['fit'])
  })

  it('opens a chapter the reader is taken to, and leaves the rest as they were', () => {
    expect(unfolded(['motor', 'fit'], 'fit')).toEqual(['motor'])
    expect(unfolded(['motor'], 'hull')).toEqual(['motor'])
  })
})
