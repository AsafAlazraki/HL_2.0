import { describe, expect, it } from 'vitest'
import { unpicturedByUse } from './worklist'

const parts = [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }, { id: 'p4' }, { id: 'p5' }]
const pictured = new Set(['p2'])
const has = (id: string): boolean => pictured.has(id)

describe('the parts with no picture, across every aisle', () => {
  it('counts every part without a picture against every part on sale', () => {
    const list = unpicturedByUse(parts, has, new Map())
    expect(list.total).toBe(5)
    expect(list.without).toBe(4)
  })

  it('ranks only the parts quotes carry, the most quoted first, the list’s order breaking a tie', () => {
    const times = new Map([
      ['p4', 1],
      ['p1', 1],
      ['p5', 3],
      ['p2', 9],
    ])
    const list = unpicturedByUse(parts, has, times)
    expect(list.quoted.map((q) => [q.part.id, q.times])).toEqual([
      ['p5', 3],
      ['p1', 1],
      ['p4', 1],
    ])
  })

  it('ranks nothing where no quote here carries a part: there is nothing to rank by', () => {
    expect(unpicturedByUse(parts, has, new Map()).quoted).toEqual([])
  })
})

describe('the lines that take no picture', () => {
  const lines = [
    { id: 'a', aisle: 'workshop', kind: 'labour' },
    { id: 'b', aisle: 'workshop', kind: 'part' },
    { id: 'c', aisle: 'workshop', kind: 'note' },
    { id: 'd', aisle: 'radios', kind: 'part' },
    { id: 'e', aisle: 'radios', kind: 'part' },
  ]
  const takes = (l: { kind: string }): boolean => l.kind === 'part'

  it('leaves labour and notes out of both counts, and says how many it left out', () => {
    const list = unpicturedByUse(lines, (id) => id === 'e', new Map([['a', 4]]), takes)
    expect([list.without, list.total, list.untaken]).toEqual([2, 3, 2])
    /* a labour line on four quotes is still not on the worklist: it can take no picture */
    expect(list.quoted).toEqual([])
  })

  it('counts each aisle’s parts that take a picture, and those with none', () => {
    const list = unpicturedByUse(lines, (id) => id === 'e', new Map(), takes)
    expect(Object.fromEntries(list.byAisle)).toEqual({
      workshop: { takes: 1, without: 1 },
      radios: { takes: 2, without: 1 },
    })
  })
})
