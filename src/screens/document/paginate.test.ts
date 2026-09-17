/* ============================================================
   THE PACKER, WITHOUT A BROWSER.

   Every case here is arithmetic on numbers a browser measured, which
   is the whole reason the packing is not done in JSX: a page
   assignment that can only be checked by looking at a screenshot is a
   page assignment nobody checks.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { paginate, type Atom } from './paginate'

/** n atoms of one height, named by their index. */
const rows = (n: number, height: number, from = 0): Atom[] =>
  Array.from({ length: n }, (_, i) => ({ id: `r${i + from}`, height }))

describe('packing atoms into pages', () => {
  it('draws nothing for nothing', () => {
    expect(paginate([], 800)).toEqual([])
  })

  it('fills a page and starts the next', () => {
    expect(paginate(rows(5, 100), 250)).toEqual([['r0', 'r1'], ['r2', 'r3'], ['r4']])
  })

  it('fills a page exactly without spilling', () => {
    expect(paginate(rows(4, 100), 200)).toEqual([
      ['r0', 'r1'],
      ['r2', 'r3'],
    ])
  })

  it('never splits an atom, which is what keeps a break out of a table row', () => {
    const packed = paginate(rows(7, 30), 100)
    expect(packed.flat()).toEqual(['r0', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6'])
    for (const page of packed) expect(page.length).toBeLessThanOrEqual(3)
  })

  it('gives an atom taller than the page a page of its own rather than looping', () => {
    const packed = paginate(
      [
        { id: 'a', height: 50 },
        { id: 'huge', height: 900 },
      ],
      200,
    )
    expect(packed).toEqual([['a'], ['huge']])
  })
})

/** a section head that keeps its column row and its first line */
const head = (id: string, height: number): Atom => ({ id, height, keepWithNext: 2 })

describe('a heading is never left alone at the foot of a page', () => {
  it('moves the head down when its first rows will not fit under it', () => {
    /* room for three 30px atoms. The head lands fourth, so on the old
       rule it would sit alone at the foot with its rows overleaf. */
    const packed = paginate([...rows(2, 30), head('h', 30), ...rows(2, 30, 2)], 100)
    expect(packed[0]).toEqual(['r0', 'r1'])
    expect(packed[1]).toEqual(['h', 'r2', 'r3'])
  })

  it('leaves the head where it is when the run does fit', () => {
    const packed = paginate([...rows(1, 30), head('h', 30), ...rows(2, 30, 1)], 130)
    expect(packed).toEqual([['r0', 'h', 'r1', 'r2']])
  })

  it('does not push a head down a page its run could never fit on either', () => {
    /* the run is 300 against a 100px page: pushing it would empty one
       page and change nothing, so the head is weighed on its own */
    const packed = paginate([head('h', 30), ...rows(3, 90)], 100)
    expect(packed[0][0]).toBe('h')
  })
})

describe('an atom that opens its own page', () => {
  it('starts a fresh one even when there is room above', () => {
    const packed = paginate(
      [
        { id: 'cover', height: 50 },
        { id: 'body', height: 50, breakBefore: true },
      ],
      800,
    )
    expect(packed).toEqual([['cover'], ['body']])
  })

  it('does not open an empty page when it is already at the top', () => {
    expect(paginate([{ id: 'cover', height: 50, breakBefore: true }], 800)).toEqual([['cover']])
  })
})

describe('a browser that has laid nothing out', () => {
  it('draws one page with every atom on it rather than none', () => {
    /* happy-dom, and a print preview before the fonts land, both hand
       in nothing measured. Losing content there would be the worst
       failure this file could have. */
    expect(paginate(rows(4, 0), 0)).toEqual([['r0', 'r1', 'r2', 'r3']])
    expect(paginate(rows(4, 0), Number.NaN)).toEqual([['r0', 'r1', 'r2', 'r3']])
  })

  it('keeps every atom exactly once, whatever the room', () => {
    for (const room of [0, 1, 37, 100, 1000, 10_000]) {
      const packed = paginate(rows(23, 43), room)
      expect(packed.flat()).toHaveLength(23)
      expect(new Set(packed.flat()).size).toBe(23)
    }
  })
})
