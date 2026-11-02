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

describe('a band that runs over a page break (the printed quote’s critic, 2026-10-31)', () => {
  it('starts the next page as full as the head it repeats there', () => {
    const atoms: Atom[] = [
      { id: 'head', height: 40, keepWithNext: 1 },
      { id: 'a', height: 50, carry: 30 },
      { id: 'b', height: 50, carry: 30 },
      { id: 'c', height: 50, carry: 30 },
    ]
    /* 40 + 50 + 50 = 140 fits a room of 150; c opens page 2 under its 30 px continued head */
    expect(paginate(atoms, 150)).toEqual([['head', 'a', 'b'], ['c']])
    /* page 2 holds c and d under the head (30 + 50 + 50 = 130); in a room of 120 the carry
       leaves room for one line a page (30 + 50 + 50 > 120) */
    const more: Atom[] = [...atoms, { id: 'd', height: 50, carry: 30 }]
    expect(paginate(more, 150)).toEqual([
      ['head', 'a', 'b'],
      ['c', 'd'],
    ])
    expect(paginate(more, 120)).toEqual([['head', 'a'], ['b'], ['c'], ['d']])
  })
})

describe('what an atom gives up where it opens a page (2026-11-03, the Patrol 600)', () => {
  /* the hull-only Patrol 600 at 1440: the specification, then the price and the signatures, each
     gauged with the air over its head (24 px), in a room of 934 */
  const patrol: Atom[] = [
    { id: 'cover', height: 934, breakBefore: true },
    { id: 'specs', height: 522, breakBefore: true, lead: 24 },
    { id: 'price', height: 95, keepWithNext: 1, lead: 24 },
    { id: 'accept', height: 326, lead: 24 },
  ]

  it('counts the air a part head drops at the top of a sheet, so the price stands with the specification', () => {
    /* 522 − 24 + 95 + 326 = 919 of 934 */
    expect(paginate(patrol, 934)).toEqual([['cover'], ['specs', 'price', 'accept']])
    /* without the credit the same atoms spend a sheet more: 522 + 95 + 326 = 943 */
    const without = patrol.map((a) => ({ ...a, lead: 0 }))
    expect(paginate(without, 934)).toEqual([['cover'], ['specs'], ['price', 'accept']])
  })

  it('gives nothing up under a band’s head said again, and nothing off the page it is not first on', () => {
    const atoms: Atom[] = [
      { id: 'a', height: 100 },
      { id: 'b', height: 100, carry: 30, lead: 20 },
    ]
    /* b opens page 2 under its 30 px head: 30 + 100, no credit; the room is 120 */
    expect(paginate(atoms, 120)).toEqual([['a'], ['b']])
    /* and after another atom it weighs its whole height: 100 + 100 > 190 + nothing */
    expect(
      paginate(
        [
          { id: 'a', height: 100 },
          { id: 'b', height: 100, lead: 20 },
        ],
        190,
      ),
    ).toEqual([['a'], ['b']])
  })
})

describe('the sheets are evened (the owner’s fully specced quote, 2026-11-03)', () => {
  /* the Sport 660 at its shape: the specification opens page 2, the quote's head, the hull and the
     motor follow it; the trailer and Dealer fit run on to page 3; the price and the signatures
     open nothing, so they could follow on, but they keep together and do not fit page 3 */
  const atoms: Atom[] = [
    { id: 'specs', height: 420, breakBefore: true },
    { id: 'quote-head', height: 90, keepWithNext: 1 },
    { id: 'sec:hull', height: 50, keepWithNext: 1 },
    { id: 'line:hull', height: 70 },
    { id: 'sec:motor', height: 50, keepWithNext: 1 },
    { id: 'line:motor', height: 100 },
    { id: 'sec:trailer', height: 50, keepWithNext: 1 },
    { id: 'line:trailer', height: 80 },
    { id: 'sec:fit', height: 50, keepWithNext: 1 },
    { id: 'line:a', height: 60 },
    { id: 'line:b', height: 60 },
    { id: 'line:c', height: 60 },
    { id: 'price', height: 400, keepWithNext: 1 },
    { id: 'accept', height: 250 },
  ]

  it('moves the end of a full sheet on to the next where the two then end nearer even', () => {
    const pages = paginate(atoms, 800)
    expect(pages).toEqual([
      ['specs', 'quote-head', 'sec:hull', 'line:hull'],
      [
        'sec:motor',
        'line:motor',
        'sec:trailer',
        'line:trailer',
        'sec:fit',
        'line:a',
        'line:b',
        'line:c',
      ],
      ['price', 'accept'],
    ])
  })

  it('never parts a head from what it keeps, never moves across a part that opens its own sheet, and never adds a sheet', () => {
    const pages = paginate(atoms, 800)
    for (const page of pages) expect(page.at(-1)).not.toMatch(/^(sec:|quote-head)/)
    expect(pages[0]![0]).toBe('specs')
    expect(pages).toHaveLength(3)
    /* a sheet opening a part of its own is never filled from the one before it */
    const opened = paginate(
      [
        { id: 'a', height: 700 },
        { id: 'b', height: 100 },
        { id: 'c', height: 100, breakBefore: true },
      ],
      800,
    )
    expect(opened).toEqual([['a', 'b'], ['c']])
  })

  it('leaves two sheets as they are where no break leaves them nearer even by a line', () => {
    expect(
      paginate(
        [
          { id: 'a', height: 400 },
          { id: 'b', height: 390 },
          { id: 'c', height: 380 },
        ],
        800,
      ),
    ).toEqual([['a', 'b'], ['c']])
  })
})

describe('the evening runs until nothing moves', () => {
  it('lets a sheet that gave its end to the next take from the one before it', () => {
    /* three sheets of runs: the middle sheet gives its end to the last, and then has room to take
       the end of the first */
    const atoms: Atom[] = [
      { id: 'a', height: 300 },
      { id: 'b', height: 300 },
      { id: 'c', height: 150 },
      { id: 'd', height: 300 },
      { id: 'e', height: 300 },
      { id: 'f', height: 150 },
      { id: 'g', height: 100 },
    ]
    const pages = paginate(atoms, 800)
    expect(pages).toHaveLength(3)
    const used = pages.map((page) =>
      page.reduce((n, id) => n + (atoms.find((a) => a.id === id)?.height ?? 0), 0),
    )
    /* no sheet ends more than half empty, where filling in turn left the last at 100 of 800 */
    for (const u of used) expect(u).toBeGreaterThanOrEqual(400)
  })
})
