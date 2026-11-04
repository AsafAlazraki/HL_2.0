/* ============================================================
   WHO CHOSE A LIST'S PRICE IS KEPT: a step naming a price stamps the
   list with its who and when, its way back stamps it again, a batch
   stamps each list it chose, and a reach switch stamps nothing.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import type { CatalogueEvent } from '@/domain/catalogue/commands'
import { NO_STAMPS } from '@/domain/catalogue/table/stamps'
import { chosenOf, pricesStamped } from './chosen'

const event = (over: Partial<CatalogueEvent>): CatalogueEvent => ({
  id: 'e1',
  kind: 'prices-changed',
  at: '2026-11-04T08:28:00.000Z',
  said: 'Every rigging kit is priced supplied, or fitted.',
  label: 'Prices changed · Rigging Kits',
  changed: [],
  ...over,
})

describe('who chose a list’s price', () => {
  it('stamps a list whose price a step named, with who and when, and reads it back', () => {
    const stamps = pricesStamped(
      NO_STAMPS,
      event({
        by: 'Asaf',
        changed: [{ path: 'rig_kits.priceLevels.cash', from: null, to: 'rig_kits.k' }],
      }),
      'northside',
    )
    expect(chosenOf(stamps, ['rig_kits'])).toEqual({ at: '2026-11-04T08:28:00.000Z', by: 'Asaf' })
    expect(chosenOf(stamps, ['dealer_fit'])).toBeNull()
  })

  it('stamps the way back too, and the latest of a column’s lists wins', () => {
    const one = pricesStamped(
      NO_STAMPS,
      event({ changed: [{ path: 'pkg_a.priceLevels.cash', from: null, to: 'x' }] }),
      'northside',
    )
    const two = pricesStamped(
      one,
      event({
        kind: 'undone',
        at: '2026-11-04T09:00:00.000Z',
        by: 'Mark',
        changed: [{ path: 'pkg_b.priceLevels', from: 'changed', to: 'as it was' }],
      }),
      'northside',
    )
    expect(chosenOf(two, ['pkg_a', 'pkg_b'])).toEqual({
      at: '2026-11-04T09:00:00.000Z',
      by: 'Mark',
    })
    /* no name in the session: when, and no who */
    expect(chosenOf(two, ['pkg_a'])).toEqual({ at: '2026-11-04T08:28:00.000Z' })
  })

  it('stamps every list a batch chose, under the batch’s who and when', () => {
    const stamps = pricesStamped(
      NO_STAMPS,
      event({
        kind: 'batch',
        by: 'Asaf',
        events: [
          event({ at: '', changed: [{ path: 'a.priceLevels.cash', from: null, to: 'f' }] }),
          event({ at: '', changed: [{ path: 'b.priceLevels.trade', from: null, to: 'g' }] }),
        ],
      }),
      'northside',
    )
    expect(chosenOf(stamps, ['b'])?.by).toBe('Asaf')
    expect(chosenOf(stamps, ['a'])?.at).toBe('2026-11-04T08:28:00.000Z')
  })

  it('stamps nothing for a reach switch or a written cell, and hands the same object back', () => {
    const reach = event({
      changed: [
        {
          path: 'boat_stacer.priceLevels.warranty.mayReachCustomer',
          from: null,
          to: true,
        },
      ],
    })
    expect(pricesStamped(NO_STAMPS, reach, 'northside')).toBe(NO_STAMPS)
    const cell = event({
      kind: 'cell-set',
      changed: [{ path: 'boat_stacer.r1.boat_stacer.qt', from: 1, to: 2 }],
    })
    expect(pricesStamped(NO_STAMPS, cell, 'northside')).toBe(NO_STAMPS)
  })
})
