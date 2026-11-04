import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { isDiscontinued, type RowData } from '@/domain/model'
import { readTableRegister } from '@/domain/modules/register'
import { headingOf, shelfCountOf } from './shelfCount'

/* THE CATALOGUE'S COUNT AGAINST DATA'S, measured on the real price list (data/northside): the
   catalogue says its share of the very figures Data's plate prints for Parts & Accessories. */

let pack: PackFixture
let rows: RowData[]

beforeAll(async () => {
  pack = await loadPack()
  rows = pack.rowsByEntity[pack.byKey('parts').id] ?? []
})

const lines = () => rows.map((r) => ({ heading: r.values['parts.cat'], sold: !isDiscontinued(r) }))

describe('the parts list, counted both ways', () => {
  it('counts what Data counts, and what of it is on sale', () => {
    const c = shelfCountOf(lines())
    expect(c).toEqual({
      lines: 2937,
      onSale: 2238,
      gone: 699,
      headings: 187,
      headingsOnSale: 179,
      onSaleUnheaded: 25,
    })
  })

  it('agrees with the figures Data’s own register prints for the list', () => {
    const c = shelfCountOf(lines())
    const tables = Object.fromEntries(pack.entities.map((e) => [e.id, e]))
    const register = readTableRegister(tables, pack.rowsByEntity, pack.ctx.modules)
    const facts = register.facts[pack.byKey('parts').id]!
    expect(facts.rows).toBe(c.lines)
    expect(facts.branches).toBe(c.headings)
  })
})

describe('the rule, case by case', () => {
  it('reads a heading trimmed, a number as written, and anything else as none', () => {
    expect(headingOf('  LIGHTING ')).toBe('LIGHTING')
    expect(headingOf(46070)).toBe('46070')
    expect(headingOf(null)).toBe('')
    expect(headingOf(undefined)).toBe('')
    expect(headingOf(true)).toBe('')
  })

  it('counts a heading once, a line under none under no heading, and a line gone as gone', () => {
    expect(
      shelfCountOf([
        { heading: 'A', sold: true },
        { heading: ' A', sold: true },
        { heading: 'B', sold: false },
        { heading: '', sold: true },
        { heading: '', sold: false },
      ]),
    ).toEqual({
      lines: 5,
      onSale: 3,
      gone: 2,
      headings: 2,
      headingsOnSale: 1,
      onSaleUnheaded: 1,
    })
  })

  it('counts nothing in an empty list', () => {
    expect(shelfCountOf([])).toEqual({
      lines: 0,
      onSale: 0,
      gone: 0,
      headings: 0,
      headingsOnSale: 0,
      onSaleUnheaded: 0,
    })
  })
})
