import { describe, expect, it } from 'vitest'
import { evenly, gridOf, rowsFor, shareOf } from './rows'

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

describe('one set of columns for every row', () => {
  it('draws seven facts at three as 3 / 2+1 / 2+1, and at four as 4 / 2+1+1', () => {
    expect(gridOf(7, 3)).toEqual({ columns: 3, spans: [1, 1, 1, 2, 1, 2, 1] })
    expect(gridOf(7, 4)).toEqual({ columns: 4, spans: [1, 1, 1, 1, 2, 1, 1] })
  })

  it('draws four at three as 2 + 2, and eight at four as 4 + 4', () => {
    expect(gridOf(4, 3)).toEqual({ columns: 2, spans: [1, 1, 1, 1] })
    expect(gridOf(8, 4)).toEqual({ columns: 4, spans: [1, 1, 1, 1, 1, 1, 1, 1] })
  })

  it('fills every row to its columns, and never leaves one alone, from 1 to 40', () => {
    for (let n = 1; n <= 40; n += 1) {
      for (const most of [2, 3, 4, 5, 8]) {
        const { columns, spans } = gridOf(n, most)
        expect(spans).toHaveLength(n)
        expect(columns).toBeLessThanOrEqual(most)
        /* walk the rows: each sums to the columns exactly */
        let used = 0
        let inRow = 0
        for (const s of spans) {
          used += s
          inRow += 1
          expect(used).toBeLessThanOrEqual(columns)
          if (used === columns) {
            if (n > 1 && columns > 1) expect(inRow).toBeGreaterThan(1)
            used = 0
            inRow = 0
          }
        }
        expect(used).toBe(0)
      }
    }
  })

  it('says whether things share their rows evenly', () => {
    expect(evenly(7, 3)).toBe(false)
    expect(evenly(6, 3)).toBe(true)
    expect(evenly(2, 3)).toBe(true)
    expect(evenly(7, 7)).toBe(true)
  })
})
