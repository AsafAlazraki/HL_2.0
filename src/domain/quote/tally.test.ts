import { describe, expect, it } from 'vitest'
import { keyName, openSay, tallyOf, type TallyPart } from './tally'

/* The parts are shapes, not a quote: the figures are the arithmetic's inputs and stand for
   nothing on the price list. The build reads the real chapters' subtotals into the same shape. */
const part = (
  id: string,
  name: string,
  kind: TallyPart['kind'],
  amount: number | null,
  lines: number,
): TallyPart => ({ id, name, kind, amount, lines })

describe('what the total is made of', () => {
  it('gives each priced part its share of the figures drawn, in the build order', () => {
    const tally = tallyOf([
      part('hull', 'The hull', 'boat', 300, 1),
      part('motor', 'Motor', 'motor', 100, 1),
      part('trailer', 'Trailer', 'trailer', null, 0),
    ])
    expect(tally.shares.map((s) => [s.name, s.share])).toEqual([
      ['Hull', 0.75],
      ['Motor', 0.25],
    ])
    expect(tally.shares.reduce((sum, s) => sum + s.share, 0)).toBe(1)
  })

  it('names what nothing is on yet, and draws it as no length', () => {
    const tally = tallyOf([
      part('hull', 'The hull', 'boat', 300, 1),
      part('motor', 'Motor', 'motor', null, 0),
      part('trailer', 'Trailer', 'trailer', null, 0),
    ])
    expect(tally.open).toEqual(['Motor', 'Trailer'])
    expect(tally.shares).toHaveLength(1)
    expect(openSay(tally.open)).toBe('Not chosen yet: motor and trailer')
  })

  it('keeps a part with a line and no figure apart from one with nothing on it', () => {
    const tally = tallyOf([
      part('hull', 'The hull', 'boat', 300, 1),
      part('fit', 'Dealer fit', 'accessory', null, 1),
    ])
    expect(tally.unpriced).toEqual(['Dealer fit'])
    expect(tally.open).toEqual([])
  })

  it('says nothing is open where everything has something on it', () => {
    expect(openSay([])).toBe('')
    expect(openSay(['Motor'])).toBe('Not chosen yet: motor')
    expect(openSay(['Motor', 'Trailer', 'Dealer fit'])).toBe(
      'Not chosen yet: motor, trailer and dealer fit',
    )
  })

  it('draws no share where nothing carries a figure', () => {
    expect(tallyOf([part('hull', 'The hull', 'boat', null, 1)]).shares).toEqual([])
  })

  it('says a heading as a key says it', () => {
    expect(keyName('The hull')).toBe('Hull')
    expect(keyName('Dealer fit')).toBe('Dealer fit')
  })
})
