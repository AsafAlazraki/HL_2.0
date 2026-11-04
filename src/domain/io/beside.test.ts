import { describe, expect, it } from 'vitest'
import type { QuoteDef, RowData } from '@/domain/model'
import { priceListsBeside, quotesBeside } from './beside'

/* ============================================================
   A COPY SET BESIDE THIS COMPUTER: its price list line by line, and
   its quotes split into new here and already here.
   ============================================================ */

const row = (id: string, values: RowData['values']): RowData =>
  ({ id, entityId: 'parts', values }) as RowData

describe('a copy beside this computer', () => {
  it('counts the lines alike, different, here only and in the copy only, Customers left aside', () => {
    const here = {
      parts: [row('a', { l: 1 }), row('b', { l: 2 }), row('c', { l: 3 })],
      customers: [row('x', { n: 'R' })],
    }
    const copy = {
      parts: [row('a', { l: 1 }), row('b', { l: 5 }), row('d', { l: 4 })],
      customers: [],
    }
    expect(priceListsBeside(here, copy, new Set(['customers']))).toEqual({
      same: 1,
      differ: 1,
      hereOnly: 1,
      copyOnly: 1,
    })
  })

  it('reads a line alike whatever order its figures were written in', () => {
    expect(
      priceListsBeside({ t: [row('a', { x: 1, y: 2 })] }, { t: [row('a', { y: 2, x: 1 })] }).same,
    ).toBe(1)
  })

  it('splits the copy’s quotes into those new here and those already here', () => {
    const q = (id: string) => ({ id }) as QuoteDef
    const split = quotesBeside([q('1')], [q('1'), q('2')])
    expect(split.already.map((x) => x.id)).toEqual(['1'])
    expect(split.fresh.map((x) => x.id)).toEqual(['2'])
  })
})
