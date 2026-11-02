/* ============================================================
   THE PACKER, WITHOUT A BROWSER.

   Every case here is arithmetic on numbers a browser measured, which
   is the whole reason the packing is not done in JSX: a page
   assignment that can only be checked by looking at a screenshot is a
   page assignment nobody checks.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import {
  FILL_AIR,
  FILL_LEAST,
  LINE_BESIDE,
  fillOf,
  paginate,
  type Atom,
  type FillReading,
} from './paginate'

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

describe('the last sheet’s room goes to the boat (the quote round’s audit, round 3, D2)', () => {
  /* the Stacer 499's last sheet at 1440, as gauged: the price 280 tall beside its 1,100 × 733
     photograph drawn 231 × 154, then the signatures, 606 of a room of 934 */
  const stacer: FillReading = {
    room: 934,
    used: 606,
    atom: 280,
    above: 76,
    boat: 8,
    line: 42,
    picture: 154,
    gap: 24,
    figs: 176,
    width: 658,
    inset: 0,
    held: { width: 1100, height: 733 },
    beside: true,
  }

  it('draws the photograph larger, its line beside it, until the sheet is full but for its air', () => {
    const fill = fillOf(stacer)
    expect(fill?.beside).toBe(true)
    /* the budget: 280 + 328 − 40 − 76 − 8 − 24 − 176 = 284, under the measure's 458 × 305 */
    expect(fill?.height).toBe(280 + (934 - 606) - FILL_AIR - 76 - 8 - 24 - 176)
    /* and so the price stands no taller than the room it was given */
    const drawn = 76 + 8 + fill!.height + 24 + 176
    expect(drawn).toBeLessThanOrEqual(280 + (934 - 606) - FILL_AIR)
  })

  it('never draws the picture past its pixels, nor wider than the measure leaves it', () => {
    const small = fillOf({ ...stacer, held: { width: 300, height: 200 } })
    expect(small?.height).toBe(200)
    /* with a sheet of room the photograph takes the whole measure, its line under it */
    const tall = fillOf({ ...stacer, used: 0, atom: 280 })
    expect(tall).toEqual({ height: Math.floor((658 * 733) / 1100), beside: false })
    /* with less, it stands beside its line, at most the measure less the line's column */
    const mid = fillOf({ ...stacer, used: 550 })
    expect(mid?.beside).toBe(true)
    expect(mid?.height).toBe(Math.floor(((658 - LINE_BESIDE) * 733) / 1100))
  })

  it('sets a studio picture on the measure with its line under it', () => {
    /* the F115LB: Yamaha's 800 × 600 studio picture on its pale panel, 24 px of panel either side */
    const motor = fillOf({
      ...stacer,
      used: 625,
      atom: 299,
      above: 99,
      boat: 24,
      line: 25,
      picture: 151,
      figs: 132,
      inset: 24,
      held: { width: 800, height: 600 },
      beside: false,
    })
    expect(motor?.beside).toBe(false)
    expect(motor?.height).toBe(299 + (934 - 625) - FILL_AIR - 99 - 24 - 24 - 132 - 25)
  })

  it('leaves a full sheet, and a picture that would grow by less than a line, as they were', () => {
    /* the Sport 560's last sheet: 911 of 934 */
    expect(fillOf({ ...stacer, used: 911 })).toBeNull()
    expect(fillOf({ ...stacer, used: 934 - FILL_AIR - FILL_LEAST + 1 })).toBeNull()
    expect(fillOf({ ...stacer, held: { width: 0, height: 0 } })).toBeNull()
    /* a picture already as large as its pixels */
    expect(fillOf({ ...stacer, picture: 733, held: { width: 1100, height: 733 } })).toBeNull()
  })
})
