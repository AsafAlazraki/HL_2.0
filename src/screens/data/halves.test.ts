import { describe, expect, it } from 'vitest'
import { HEAD_WEIGHT, inTwo, type Group } from './halves'

const group = (placeId: string, rows: number): Group<string> => ({
  placeId,
  place: placeId,
  rows: Array.from({ length: rows }, (_, i) => `${placeId}${i + 1}`),
})
const one = (): number => 1
const height = (parts: { rows: string[]; continued: boolean }[]): number =>
  parts.reduce((s, p) => s + HEAD_WEIGHT + p.rows.length, 0)

describe('the lists you sell from, in two columns of one height', () => {
  it('cuts between two groups where that evens the columns', () => {
    const [a, b] = inTwo([group('m', 3), group('f', 3), group('t', 3), group('p', 3)], one)
    expect(a.map((p) => p.placeId)).toEqual(['m', 'f'])
    expect(b.map((p) => p.placeId)).toEqual(['t', 'p'])
    expect([...a, ...b].every((p) => !p.continued)).toBe(true)
  })

  it('cuts inside a group that is half the ledger, and says it again over its second part', () => {
    /* the file's own shape: motors 2, factory packages 2, trailers 9, parts 2, then four of one */
    const groups = [
      group('m', 2),
      group('f', 2),
      group('t', 9),
      group('p', 2),
      group('d', 1),
      group('l', 1),
      group('o', 1),
      group('r', 1),
    ]
    const [a, b] = inTwo(groups, one)
    expect(a.at(-1)!.placeId).toBe('t')
    expect(b[0]!.placeId).toBe('t')
    expect(b[0]!.continued).toBe(true)
    expect(Math.abs(height(a) - height(b))).toBeLessThanOrEqual(1 + HEAD_WEIGHT)
  })

  it('keeps the file’s order and every row, once', () => {
    const groups = [group('m', 2), group('t', 9), group('p', 4)]
    const [a, b] = inTwo(groups, one)
    expect([...a, ...b].flatMap((p) => p.rows)).toEqual(groups.flatMap((g) => g.rows))
  })

  it('weighs a taller row as taller', () => {
    const [a] = inTwo([group('a', 4), group('b', 4)], (row) => (row.startsWith('a') ? 2 : 1))
    expect(a.flatMap((p) => p.rows).length).toBeLessThan(4 + 4)
    expect(a[0]!.placeId).toBe('a')
  })

  it('leaves one group of one row whole, and nothing in the second column', () => {
    const [a, b] = inTwo([group('a', 1)], one)
    expect(a).toHaveLength(1)
    expect(b).toEqual([])
  })

  it('draws nothing from nothing', () => {
    expect(inTwo([], one)).toEqual([[], []])
  })
})
