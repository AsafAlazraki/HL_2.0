/* Naming the way a list is priced, as one step with its exact way back, on Northside's own
   Rigging Kits and Yamahas. */
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { isDone, type CatalogueCommand } from '@/domain/catalogue/commands'
import type { CatalogueData } from '@/domain/catalogue/sheet'
import { ladderOn } from '@/domain/catalogue/priceCommands'
import { priceLevelsFor } from '@/domain/quote/pricing'
import type { PriceLevel } from '@/domain/model'
import { nameWay } from './nameWay'

let pack: PackFixture
let data: CatalogueData

beforeAll(async () => {
  pack = await loadPack()
  const priceLevels: Record<string, PriceLevel[]> = {}
  for (const t of pack.entities) if (t.priceLevels?.length) priceLevels[t.id] = t.priceLevels
  data = {
    tables: Object.fromEntries(pack.entities.map((t) => [t.id, t])),
    rows: pack.rowsByEntity,
    priceLevels,
  } as unknown as CatalogueData
})

const run = (d: CatalogueData, c: CatalogueCommand) => {
  const o = c(d, '2026-11-04T00:00:00.000Z')
  if (!isDone(o)) throw new Error(`refused: ${o.refused}`)
  return o
}

const KIT = ['cash', 'trade', 'fitted']

describe('a way named', () => {
  it('prices Rigging Kits supplied and fitted, cash and trade, in one step, and its way back', () => {
    const supplied = run(
      data,
      nameWay(
        [
          {
            tableId: 'rig_kits',
            rungs: [
              { key: 'cash', fieldId: 'rig_kits.k' },
              { key: 'trade', fieldId: 'rig_kits.l' },
              { key: 'fitted', fieldId: 'rig_kits.ac' },
            ],
          },
        ],
        KIT,
        'Every rigging kit is priced supplied, or fitted, from the next quote.',
      ),
    )
    const kits = supplied.next.tables.rig_kits!
    expect(priceLevelsFor(kits).map((l) => [l.key, l.label, l.scope, l.named])).toEqual([
      ['cash', 'Kit Sell Price', 'quote', true],
      ['trade', 'Trade Price', 'quote', true],
      ['fitted', 'Sell Price', 'line', true],
    ])
    expect(supplied.event.kind).toBe('prices-changed')

    /* always fitted: the fitted price comes off, since the kit is never sold supplied */
    const fitted = run(
      supplied.next,
      nameWay(
        [
          {
            tableId: 'rig_kits',
            rungs: [
              { key: 'cash', fieldId: 'rig_kits.ac' },
              { key: 'trade', fieldId: 'rig_kits.ad' },
            ],
          },
        ],
        KIT,
        'Every rigging kit is priced fitted from the next quote.',
      ),
    )
    expect(ladderOn(fitted.next, fitted.next.tables.rig_kits!).map((l) => l.fieldId)).toEqual([
      'rig_kits.ac',
      'rig_kits.ad',
    ])
    /* and the way back is exactly what stood */
    const back = run(fitted.next, fitted.inverse)
    expect(ladderOn(back.next, back.next.tables.rig_kits!)).toBe(
      ladderOn(supplied.next, supplied.next.tables.rig_kits!),
    )
    const none = run(supplied.next, supplied.inverse)
    expect(priceLevelsFor(none.next.tables.rig_kits!)).toEqual([])
  })

  it('leaves a motor’s Trade Price alone, and a choice that changes nothing is no step', () => {
    const rrp = run(
      data,
      nameWay(
        [{ tableId: 'mot_yamaha', rungs: [{ key: 'cash', fieldId: 'mot_yamaha.bb' }] }],
        ['cash'],
        'Every Yamaha motor shows its RRP + Freight Inc GST.',
      ),
    )
    expect(ladderOn(rrp.next, rrp.next.tables.mot_yamaha!).map((l) => [l.key, l.fieldId])).toEqual([
      ['cash', 'mot_yamaha.bb'],
      ['trade', 'mot_yamaha.bl'],
    ])
    const again = nameWay(
      [{ tableId: 'mot_yamaha', rungs: [{ key: 'cash', fieldId: 'mot_yamaha.bb' }] }],
      ['cash'],
      'again',
    )(rrp.next, '2026-11-04T00:00:01.000Z')
    expect(again).toEqual({ refused: '' })
  })

  it('refuses a cost as a price, with its sentence', () => {
    const o = nameWay(
      [{ tableId: 'boat_stacer', rungs: [{ key: 'cash', fieldId: 'boat_stacer.iy' }] }],
      ['cash'],
      'x',
    )(data, '2026-11-04T00:00:00.000Z')
    expect(isDone(o)).toBe(false)
    expect('refused' in o && o.refused).toMatch(/can never be a price/)
  })
})
