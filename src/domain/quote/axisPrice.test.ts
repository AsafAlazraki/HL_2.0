import { describe, expect, it } from 'vitest'
import { axisOnePrice } from './axisPrice'

const on = { current: true, amount: 41_340, delta: 0 }

describe('an axis whose every choice is one price', () => {
  it('is one price where every other choice moves the total by nothing', () => {
    expect(
      axisOnePrice([on, { current: false, amount: 41_340, delta: 0 }, { ...on, current: false }]),
    ).toBe(true)
  })

  it('is not, the moment one choice moves the total', () => {
    expect(
      axisOnePrice([
        on,
        { current: false, amount: 41_340, delta: 0 },
        { current: false, amount: 48_350, delta: 7_010 },
      ]),
    ).toBe(false)
  })

  it('never calls a choice the price list gives no price the same price', () => {
    expect(axisOnePrice([on, { current: false, amount: null, delta: 0 }])).toBe(false)
  })

  it('says nothing of an axis with one choice, which is no choice', () => {
    expect(axisOnePrice([on])).toBe(false)
  })
})
