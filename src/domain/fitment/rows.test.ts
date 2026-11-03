import { describe, expect, it } from 'vitest'
import { rowsFor, shareOf } from './rows'

describe('sharing things over rows, none alone and no blank cell', () => {
  it('shares seven motor tiles 4 + 3 at four to a row, and 3 + 2 + 2 at three', () => {
    expect(rowsFor(7, 4)).toEqual([4, 3])
    expect(rowsFor(7, 3)).toEqual([3, 2, 2])
  })

  it('shares five reasons 3 + 2 at three to a row, and in one row at five', () => {
    expect(rowsFor(5, 3)).toEqual([3, 2])
    expect(rowsFor(5, 5)).toEqual([5])
  })

  it('never leaves one alone on a row where three or more go to a row', () => {
    for (let n = 2; n <= 40; n += 1) {
      for (const most of [3, 4, 5]) {
        const rows = rowsFor(n, most)
        expect(rows.reduce((a, b) => a + b, 0)).toBe(n)
        expect(Math.max(...rows)).toBeLessThanOrEqual(most)
        expect(Math.max(...rows) - Math.min(...rows)).toBeLessThanOrEqual(1)
        if (rows.length > 1) expect(Math.min(...rows)).toBeGreaterThan(1)
      }
    }
  })

  it('tells each thing how many share its row, in order', () => {
    expect(shareOf(7, 3)).toEqual([3, 3, 3, 2, 2, 2, 2])
    expect(shareOf(1, 4)).toEqual([1])
    expect(shareOf(0, 4)).toEqual([])
    expect(shareOf(3, 1)).toEqual([1, 1, 1])
  })
})
