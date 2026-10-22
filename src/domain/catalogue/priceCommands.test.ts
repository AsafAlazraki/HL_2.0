/* ============================================================
   NORTHSIDE'S PRICES THROUGH THE STORE'S OWN DOOR, ON THE REAL
   PRICE LIST — every write a command, every command one way back,
   and the way back exact.

   The figures asserted are the price list's own, read off
   data/northside: Stacer's 91 boats hold Trade = Cash on all 91, the
   309 Skimma at $1,730; Highfield's Trade is 95% of Cash on all 588;
   the F90XB is $14,531 at Sell Price and $17,643 at RRP + Freight Inc
   GST; Rigging Kits declare no price at all.
   ============================================================ */
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { freezeLevels, priceLevelsFor } from '@/domain/quote/pricing'
import { frozenMayReach } from '@/domain/pricing/worked'
import type { PriceLevel, RowData } from '@/domain/model'
import { emptySheet, indexRows, type CatalogueData } from './sheet'
import { isDone, type CatalogueCommand, type Done } from './commands'
import {
  cannotBePrice,
  ladderOn,
  letReach,
  namePrice,
  readShare,
  shareFigure,
  sharePlan,
} from './priceCommands'

const NOW = '2026-10-22T09:00:00.000Z'

let pack: PackFixture
let sheet: CatalogueData

beforeAll(async () => {
  pack = await loadPack()
  const rows: Record<string, RowData[]> = {}
  const priceLevels: Record<string, PriceLevel[]> = {}
  for (const e of pack.entities) {
    rows[e.id] = [...(pack.rowsByEntity[e.id] ?? [])]
    if (e.priceLevels?.length) priceLevels[e.id] = e.priceLevels
  }
  sheet = {
    ...emptySheet(),
    orgId: 'northside',
    tables: Object.fromEntries(pack.entities.map((e) => [e.id, e])),
    rows,
    index: indexRows(rows),
    priceLevels,
  }
})

function run(data: CatalogueData, command: CatalogueCommand): Done {
  const out = command(data, NOW)
  if (!isDone(out)) throw new Error(`refused: ${out.refused}`)
  return out
}

const field = (tableId: string, name: string) =>
  sheet.tables[tableId]!.fields.find((f) => f.name === name)!

describe('naming a list’s price', () => {
  it('gives Rigging Kits a price, read by every quote from then, and the way back takes it off', () => {
    expect(priceLevelsFor(sheet.tables.rig_kits)).toEqual([])
    const kit = field('rig_kits', 'Kit Sell Price')
    const done = run(sheet, namePrice('rig_kits', 'cash', kit.id))
    expect(done.said).toBe(
      'Every Rigging Kits line is priced at its Kit Sell Price from the next quote.',
    )
    expect(done.event.kind).toBe('prices-changed')
    /* written where a quote reads it, and filed */
    const ladder = priceLevelsFor(done.next.tables.rig_kits)
    expect(ladder.map((l) => [l.key, l.label, l.named])).toEqual([['cash', 'Kit Sell Price', true]])
    expect(done.next.priceLevels.rig_kits).toEqual(ladder)

    const back = run(done.next, done.inverse)
    expect(priceLevelsFor(back.next.tables.rig_kits)).toEqual([])
    expect(back.next.priceLevels.rig_kits).toBeUndefined()
  })

  it('points the Yamahas at RRP + Freight, and back at Sell Price with what it contains', () => {
    const rrp = field('mot_yamaha', 'RRP + Freight Inc GST')
    const sell = field('mot_yamaha', 'Sell Price')
    const f90xb = sheet.rows.mot_yamaha!.find((r) => r.values['mot_yamaha.d'] === 'F90XB')!

    const toRrp = run(sheet, namePrice('mot_yamaha', 'cash', rrp.id))
    const motor = toRrp.next.tables.mot_yamaha!
    const cash = freezeLevels(motor, f90xb.values).find((l) => l.key === 'cash')!
    expect([cash.label, cash.value]).toEqual(['RRP + Freight Inc GST', 17643])
    /* no cell says what RRP + Freight contains, so nothing is claimed */
    expect(cash.contains).toBeUndefined()
    /* worked from cost: Northside's only until the dealer lets it reach a customer */
    expect(frozenMayReach(cash)).toBe(false)

    const toSell = run(toRrp.next, namePrice('mot_yamaha', 'cash', sell.id))
    const again = freezeLevels(toSell.next.tables.mot_yamaha!, f90xb.values)[0]!
    expect([again.label, again.value]).toEqual(['Sell Price', 14531])
    expect(again.contains?.includesPreDelivery).toBe(true)
  })

  it('records the choice of the column a price already reads, changing no figure', () => {
    const sell = field('mot_yamaha', 'Sell Price')
    const done = run(sheet, namePrice('mot_yamaha', 'cash', sell.id))
    expect(done.said).toBe(
      'Yamaha Outboards keeps Sell Price as its Cash price, now by your choice.',
    )
    const cash = ladderOn(done.next, done.next.tables.mot_yamaha!)[0]!
    expect([cash.fieldId, cash.named, cash.contains?.includesPreDelivery]).toEqual([
      sell.id,
      true,
      true,
    ])
    /* a second press is nothing, not a second step */
    expect(namePrice('mot_yamaha', 'cash', sell.id)(done.next, NOW)).toEqual({ refused: '' })
  })

  it('refuses a cost as a price, in words a dealer reads', () => {
    const base = field('boat_stacer', 'Base Cost')
    expect(cannotBePrice(sheet.tables.boat_stacer!, base)).toBe(
      'Base Cost is what something costs Northside, and a cost never reaches a customer, so it can never be a price.',
    )
    expect(namePrice('boat_stacer', 'cash', base.id)(sheet, NOW)).toEqual({
      refused: cannotBePrice(sheet.tables.boat_stacer!, base),
    })
  })
})

describe('letting a price reach a customer', () => {
  const boats = () =>
    Object.values(sheet.tables)
      .filter((t) => t.kind === 'boat' && t.role !== 'join')
      .map((t) => ({ tableId: t.id, key: 'warranty' }))

  it('lets Warranty reach a customer on all seven boat lists as one step, and undoes as one', () => {
    expect(boats()).toHaveLength(7)
    const on = run(sheet, letReach(boats(), true))
    expect(on.said).toBe('Warranty may reach a customer now: a quote priced at it can be given.')
    for (const { tableId } of boats()) {
      const w = ladderOn(on.next, on.next.tables[tableId]!).find((l) => l.key === 'warranty')!
      expect(w.mayReachCustomer).toBe(true)
    }
    const back = run(on.next, on.inverse)
    for (const { tableId } of boats()) {
      expect(back.next.tables[tableId]).toBe(sheet.tables[tableId])
      expect(back.next.priceLevels[tableId]).toBe(sheet.priceLevels[tableId])
    }
  })

  it('does nothing, and says nothing, when the answer is already the answer', () => {
    const on = run(sheet, letReach(boats(), true))
    expect(letReach(boats(), true)(on.next, NOW)).toEqual({ refused: '' })
  })
})

describe('one price as a share of another', () => {
  it('reads a typed share, and refuses one that is not a share of Cash', () => {
    expect(readShare('95%')).toEqual({ percent: 95 })
    expect(readShare(' 96.5 ')).toEqual({ percent: 96.5 })
    expect(readShare('')).toEqual({ refused: 'Type the share of Cash, as a per cent.' })
    expect('refused' in readShare('110')).toBe(true)
    expect('refused' in readShare('0')).toBe(true)
    expect('refused' in readShare('ninety')).toBe(true)
  })

  it('rounds down to the dollar, as the price list’s Trade does', () => {
    expect(shareFigure(1730, 95)).toBe(1643)
    expect(shareFigure(100, 95)).toBe(95)
  })

  it('counts Stacer before writing: 91 written, 91 the same as Cash today, none blank', () => {
    const plan = sharePlan(sheet, 'boat_stacer', 'trade', 95, {
      one: 'Stacer boat',
      many: 'Stacer boats',
    })!
    expect([
      plan.total,
      plan.priced,
      plan.blank,
      plan.written,
      plan.sameAsFrom,
      plan.already,
    ]).toEqual([91, 91, 0, 91, 91, 0])
    expect(plan.sample).toEqual({ rowId: 'boat_stacer:1', from: 1730, now: 1730, after: 1643 })
    expect(plan.refusal).toBeNull()
  })

  it('writes 91 real cells as ONE step, and one undo puts all 91 back', () => {
    const plan = sharePlan(sheet, 'boat_stacer', 'trade', 95, {
      one: 'Stacer boat',
      many: 'Stacer boats',
    })!
    const done = run(sheet, plan.command!)
    expect(done.said).toBe('Trade is 95% of Cash on 91 Stacer boats.')
    expect(done.event.kind).toBe('batch')
    expect(done.event.events).toHaveLength(91)
    const first = done.next.rows.boat_stacer!.find((r) => r.id === 'boat_stacer:1')!
    expect(first.values['boat_stacer.qt']).toBe(1643)

    const back = run(done.next, done.inverse)
    const again = back.next.rows.boat_stacer!.find((r) => r.id === 'boat_stacer:1')!
    expect(again.values['boat_stacer.qt']).toBe(1730)
    expect(
      back.next.rows.boat_stacer!.every(
        (r) => r.values['boat_stacer.qt'] === r.values['boat_stacer.qr'],
      ),
    ).toBe(true)
  })

  it('refuses Highfield at 95%, which is what every Highfield already holds', () => {
    const plan = sharePlan(sheet, 'boat_highfield', 'trade', 95, {
      one: 'Highfield boat',
      many: 'Highfield boats',
    })!
    expect([plan.priced, plan.already, plan.written]).toEqual([588, 588, 0])
    expect(plan.refusal).toBe(
      'Every Highfield boat with a Cash figure already holds 95% of it as Trade.',
    )
    expect(plan.command).toBeNull()
  })

  it('leaves a boat with no Cash exactly as it is, and counts it', () => {
    const plan = sharePlan(sheet, 'boat_formosa', 'trade', 95, {
      one: 'Formosa boat',
      many: 'Formosa boats',
    })!
    expect([plan.total, plan.priced, plan.blank]).toEqual([39, 30, 9])
  })
})
