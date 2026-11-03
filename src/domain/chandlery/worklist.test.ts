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
