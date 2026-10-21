import { describe, expect, it } from 'vitest'
import { crestMarkOf, ownBusiness } from './crest'
import { pictures } from './pictures'

describe('the crest reads the dealership’s own mark off the marks ledger', () => {
  it('is Northside’s white mark for Northside, the same file the one reader holds', () => {
    const own = pictures().organisation('white')
    expect(own.drawn).toBe(true)
    expect(crestMarkOf('Northside Marine')).toBe(own.drawn ? own.mark.src : null)
    expect(crestMarkOf('Northside Marine')).toMatch(/brand-marks\/northside-marine-white\.png$/)
  })

  it('is nothing for another business, and nothing before a business is named', () => {
    expect(crestMarkOf('Whitworths')).toBeNull()
    expect(crestMarkOf('')).toBeNull()
    expect(crestMarkOf(null)).toBeNull()
  })
})

describe('whose app this is, before a file has said', () => {
  it('is the one organisation the marks ledger holds, and its mark is the crest’s', () => {
    expect(ownBusiness()).toBe('Northside Marine')
    expect(crestMarkOf(ownBusiness())).toMatch(/brand-marks\/northside-marine-white\.png$/)
  })
})
