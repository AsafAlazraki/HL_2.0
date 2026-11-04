/* A price across its whole list, measured off Northside's price list, and two tiny lists whose
   arithmetic can be read at a glance. */
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import type { RowData } from '@/domain/model'
import { linesAbove, noFigureIn, percentOf, sameFigure, spreadOf, timesOf } from './spread'

let pack: PackFixture
const rows = (id: string): RowData[] => pack.rowsByEntity[id] ?? []

beforeAll(async () => {
  pack = await loadPack()
})

const line = (id: string, values: Record<string, number | string | null>): RowData =>
  ({ id, entityId: 't', values }) as unknown as RowData

describe('one figure against another', () => {
  it('counts both, equal, above and below, and the low, middle and high share', () => {
    const s = spreadOf(
      [
        line('1', { a: 200, b: 100 }),
        line('2', { a: 100, b: 100 }),
        line('3', { a: 50, b: 100 }),
        line('4', { a: 0, b: 100 }),
        line('5', { a: 70, b: null }),
      ],
      'a',
      'b',
    )!
    expect(s).toEqual({ both: 3, equal: 1, above: 1, below: 1, low: 0.5, median: 1, high: 2 })
    expect(spreadOf([line('1', { a: null, b: 1 })], 'a', 'b')).toBeNull()
  })

  it('reads Dealer Fit’s Act Sell against Sell on the 789 lines with both: never equal', () => {
    const s = spreadOf(rows('dealer_fit'), 'dealer_fit.r', 'dealer_fit.w')!
    expect([s.both, s.equal, timesOf(s.low), timesOf(s.median), timesOf(s.high)]).toEqual([
      789,
      0,
      '0.97',
      '2.08',
      '27.83',
    ])
  })

  it('finds Warranty above Cash on eight Stacer boats, and on no Highfield', () => {
    expect(linesAbove(rows('boat_stacer'), 'boat_stacer.rb', 'boat_stacer.qr')).toHaveLength(8)
    expect(
      linesAbove(rows('boat_highfield'), 'boat_highfield.rb', 'boat_highfield.qr'),
    ).toHaveLength(0)
    const h = spreadOf(rows('boat_highfield'), 'boat_highfield.rb', 'boat_highfield.qr')!
    expect([percentOf(h.low), percentOf(h.high)]).toEqual([55, 67])
  })

  it('finds the factory packages’ RRP + Freight Inc GST the same figure as their Sell Price', () => {
    for (const id of ['mot_pkg_haines', 'mot_pkg_jeanneau'])
      expect(sameFigure(rows(id), `${id}.bb`, `${id}.bf`)).toBe(true)
    expect(sameFigure(rows('mot_yamaha'), 'mot_yamaha.bb', 'mot_yamaha.bf')).toBe(false)
  })
})

describe('what a count of no figure is made of', () => {
  it('tells nothing written from a nought, a figure under nought and a word', () => {
    expect(
      noFigureIn(
        [
          line('1', { a: null }),
          line('2', { a: 0 }),
          line('3', { a: 'POA' }),
          line('4', { a: 5 }),
          line('5', { a: -2030 }),
          line('6', { a: -531, b: 'CREDIT - Battery Switch' }),
        ],
        'a',
      ),
    ).toEqual({ blank: 1, nought: 1, under: 1, words: 1 })
  })

  it('counts the five Jeanneau factory packages under $0 apart from the eleven at it', () => {
    expect(noFigureIn(rows('mot_pkg_jeanneau'), 'mot_pkg_jeanneau.bf')).toEqual({
      blank: 0,
      nought: 11,
      under: 5,
      words: 0,
    })
  })

  it('reads Parts’ 146 with no Sell as 27 with nothing and 119 at nought', () => {
    /* every line of the list, discontinued among them: Prices counts the lines on sale itself */
    expect(noFigureIn(rows('parts'), 'parts.l')).toEqual({
      blank: 27,
      nought: 119,
      under: 0,
      words: 0,
    })
  })
})
