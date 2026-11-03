/* The ways a list with no price can be priced, read off Northside's own lists. */
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import type { EntityDef, PriceLevel } from '@/domain/model'
import { pricedBy, wayChosen, waysFor } from './ways'

let pack: PackFixture
const table = (id: string): EntityDef => pack.entities.find((e) => e.id === id)!
const ways = (id: string) => waysFor(table(id), pack.rowsByEntity[id] ?? [])

beforeAll(async () => {
  pack = await loadPack()
})

describe('the ways', () => {
  it('offers Rigging Kits supplied-or-fitted and always-fitted, each with its trade figure', () => {
    const w = ways('rig_kits')
    expect(w.map((x) => x.title)).toEqual(['Supplied, or fitted', 'Always fitted'])
    expect(w[0]!.rungs.map((r) => [r.key, r.fieldId])).toEqual([
      ['cash', 'rig_kits.k'],
      ['trade', 'rig_kits.l'],
      ['fitted', 'rig_kits.ac'],
    ])
    expect(w[1]!.rungs.map((r) => [r.key, r.fieldId])).toEqual([
      ['cash', 'rig_kits.ac'],
      ['trade', 'rig_kits.ad'],
    ])
    const rows = pack.rowsByEntity.rig_kits ?? []
    expect(w.map((x) => pricedBy(x, rows))).toEqual([628, 642])
  })

  it('offers Dealer Fit its two figures, the most widely held first', () => {
    expect(ways('dealer_fit').map((x) => [x.title, x.alsoNamed])).toEqual([
      ['Act Sell', []],
      ['Sell', []],
    ])
  })

  it('folds the factory packages’ two names for one figure into one way, at Sell Price', () => {
    for (const id of ['mot_pkg_haines', 'mot_pkg_jeanneau']) {
      const w = ways(id)
      expect(w).toHaveLength(1)
      expect(w[0]!.title).toBe('Sell Price')
      expect(w[0]!.alsoNamed).toEqual(['RRP + Freight Inc GST'])
    }
  })

  it('keeps the Yamahas’ two figures apart, and knows the way a ladder already stands on', () => {
    const w = ways('mot_yamaha')
    expect(w.map((x) => x.title).toSorted()).toEqual(['RRP + Freight Inc GST', 'Sell Price'])
    const ladder = table('mot_yamaha').priceLevels as PriceLevel[]
    expect(wayChosen(w, ladder)?.title).toBe('Sell Price')
  })
})
