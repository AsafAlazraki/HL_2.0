/* The quotes on the desk a price decision touches: drafts carrying the list, the lines waiting
   for its price, and issued quotes said apart. */
import { describe, expect, it } from 'vitest'
import type { QuoteDef, QuoteLine } from '@/domain/model'
import { standingOn } from './standing'

const line = (entityId: string, unitPrice: number | null, overridePrice?: number): QuoteLine =>
  ({
    id: `${entityId}-${unitPrice}`,
    entityId,
    rowId: 'r',
    unitPrice,
    ...(overridePrice !== undefined ? { overridePrice } : {}),
  }) as QuoteLine

const quote = (
  id: string,
  state: 'draft' | 'issued',
  lines: QuoteLine[],
  updatedAt: string,
  name = '',
): Pick<QuoteDef, 'id' | 'reference' | 'state' | 'lines' | 'customer' | 'updatedAt'> => ({
  id,
  reference: `REF-${id}`,
  state,
  lines,
  customer: { name },
  updatedAt,
})

describe('the quotes standing', () => {
  it('counts drafts carrying the list, waiting ones first, and issued quotes apart', () => {
    const s = standingOn(
      [
        quote('a', 'draft', [line('dealer_fit', 2790)], '2026-11-04T01:00:00Z'),
        quote(
          'b',
          'draft',
          [line('dealer_fit', null), line('boat', 1)],
          '2026-11-03T01:00:00Z',
          'R. Kelleher',
        ),
        quote('c', 'issued', [line('dealer_fit', 2790)], '2026-11-02T01:00:00Z'),
        quote('d', 'draft', [line('boat', 1)], '2026-11-04T02:00:00Z'),
        quote('e', 'draft', [line('dealer_fit', null, 300)], '2026-11-01T01:00:00Z'),
      ],
      new Set(['dealer_fit']),
    )
    expect(s.drafts.map((q) => [q.id, q.lines, q.waiting, q.customer])).toEqual([
      ['b', 1, 1, 'R. Kelleher'],
      ['a', 1, 0, ''],
      ['e', 1, 0, ''],
    ])
    expect(s.issued).toBe(1)
  })
})
