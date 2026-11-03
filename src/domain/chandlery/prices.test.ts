import { describe, expect, it } from 'vitest'
import { lineKindOf, noteSaid, pricesSaid, sortFigure, twoKeysOf, twoPrices } from './prices'

/* THE TWO PRICES, said so that a figure is never wrong (the judge of the chandlery, blocker 1).
   Each case is a shape the live parts list carries; the real list is measured in
   chandlery.northside.test.ts. */
describe('a part’s two prices', () => {
  it('says both where the file prices supply and fitted', () => {
    expect(twoPrices(69, 112, 'Labour Estimated - (0.25)')).toEqual({
      kind: 'both',
      supply: 69,
      fitted: 112,
    })
    expect(pricesSaid(twoPrices(69, 112))).toBe('$69 supply · $112 fitted')
  })

  it('says the fitted figure, never $0, where the file prices the part fitted alone', () => {
    expect(twoPrices(0, 206)).toEqual({ kind: 'fittedOnly', fitted: 206 })
    expect(twoPrices(null, 44)).toEqual({ kind: 'fittedOnly', fitted: 44 })
    expect(pricesSaid(twoPrices(0, 206))).toBe('$206 fitted only')
  })

  it('says supply only where the file prices no fitting, or Install Type says Supply Only', () => {
    expect(twoPrices(3, null)).toEqual({ kind: 'supplyOnly', supply: 3 })
    expect(twoPrices(3, 0)).toEqual({ kind: 'supplyOnly', supply: 3 })
    expect(twoPrices(120, 120, 'Supply Only - Installation Not Included')).toEqual({
      kind: 'supplyOnly',
      supply: 120,
    })
    /* the same figure with no such word is still two prices that happen to agree */
    expect(twoPrices(120, 120, '')).toEqual({ kind: 'both', supply: 120, fitted: 120 })
  })

  it('keeps the file’s own $0 apart from no price at all', () => {
    expect(twoPrices(0, 0)).toEqual({ kind: 'zero' })
    expect(twoPrices(0, null)).toEqual({ kind: 'zero' })
    expect(twoPrices(null, null)).toEqual({ kind: 'none' })
    expect(pricesSaid({ kind: 'none' })).toBe('No price on the price list')
  })

  it('reads a credit as a price', () => {
    expect(twoPrices(-531, -531)).toEqual({ kind: 'both', supply: -531, fitted: -531 })
    expect(pricesSaid(twoPrices(-531, -531))).toBe('−$531 supply · −$531 fitted')
  })

  it('sorts by supply, else fitted, and puts no price last', () => {
    expect(sortFigure(twoPrices(69, 112))).toBe(69)
    expect(sortFigure(twoPrices(0, 206))).toBe(206)
    expect(sortFigure({ kind: 'none' })).toBeNull()
  })
})

describe('which declared price is which', () => {
  const cash = { key: 'cash', label: 'Sell', contains: { includesInstall: false } }
  const fitted = { key: 'fitted', label: 'Sell inc Install', contains: { includesInstall: true } }

  it('reads supply and fitted off the declaration, never the name', () => {
    expect(twoKeysOf([fitted, cash])).toEqual({ supply: cash, fitted })
  })

  it('never offers a price Northside keeps from customers', () => {
    expect(twoKeysOf([cash, { ...fitted, mayReachCustomer: false }])).toEqual({
      supply: cash,
      fitted: null,
    })
    expect(twoKeysOf(undefined)).toEqual({ supply: null, fitted: null })
  })
})

describe('what a line of the parts list is', () => {
  it('reads the workbook’s notes as notes and labour as labour', () => {
    expect(lineKindOf('NB: Fuel Filter - Order w Rigging Kit')).toBe('note')
    expect(lineKindOf('Labour Estimated - (0.5)')).toBe('labour')
    expect(lineKindOf('Sand Anchor Kit - 4lb')).toBe('part')
    expect(noteSaid('NB: No Rego Decals - NOT TO BE SUPPLIED')).toBe(
      'No Rego Decals – NOT TO BE SUPPLIED',
    )
  })
})
