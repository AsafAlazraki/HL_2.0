import { describe, expect, it } from 'vitest'
import { inShow, showCounts, suppliersShown } from './facets'

const lines = [
  { id: 'a', pic: true, kind: 'part' },
  { id: 'b', pic: false, kind: 'part' },
  { id: 'c', pic: false, kind: 'labour' },
  { id: 'd', pic: false, kind: 'note' },
]
const read = {
  pictured: (l: (typeof lines)[number]) => l.pic,
  takes: (l: (typeof lines)[number]) => l.kind === 'part',
}

describe('which parts an aisle shows', () => {
  it('says No picture of the parts that could take one, and keeps labour and notes under All', () => {
    expect(lines.filter((l) => inShow(l, 'without', read)).map((l) => l.id)).toEqual(['b'])
    expect(lines.filter((l) => inShow(l, 'pictured', read)).map((l) => l.id)).toEqual(['a'])
    expect(lines.filter((l) => inShow(l, 'all', read)).map((l) => l.id)).toEqual([
      'a',
      'b',
      'c',
      'd',
    ])
    expect(showCounts(lines, read)).toEqual({ pictured: 1, all: 4, without: 1 })
  })

  it('counts the suppliers shown, and keeps the one chosen at 0 so it can be let go', () => {
    const every = [
      { said: 'LSM', lines: 21 },
      { said: 'BBB', lines: 9 },
    ]
    const counted = [
      { said: 'LSM', lines: 1 },
      { said: 'BBB', lines: 0 },
    ]
    expect(suppliersShown(counted, every, '')).toEqual([{ said: 'LSM', lines: 1 }])
    expect(suppliersShown(counted, every, 'BBB')).toEqual([
      { said: 'LSM', lines: 1 },
      { said: 'BBB', lines: 0 },
    ])
    /* a supplier the aisle does not have is not drawn as a chip */
    expect(suppliersShown(counted, every, 'ZZZ')).toEqual([{ said: 'LSM', lines: 1 }])
  })
})
