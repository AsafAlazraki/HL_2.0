/* ============================================================
   THE RIG, PRICED — read off the real price list (the fitment judge,
   2026-11-03: blockers 2 and 3, majors 4 and 5). Nothing planted: the
   one change made here is the one Northside makes on Prices, naming
   the rigging kits' Sell Price as their price, and it is made to the
   list as Prices writes it.
   ============================================================ */
import { describe, expect, it, vi } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { makeCtx, type CatalogueCtx } from '@/domain/model'
import { createViewFor } from '@/domain/catalogue/views'
import { mintQuoteFromView } from '@/domain/quote/freeze'
import { readBoatFit } from './boat'
import { boatFacts, compareOf, pickedLines, riggedOf, rigSaid, sharedFacts } from './rigged'

vi.setConfig({ testTimeout: 60_000 })

const pack = await loadPack()
const ctx = pack.ctx
const SP660 = { tableId: 'boat_highfield', rowId: 'boat_highfield:513' }
const fit = readBoatFit(ctx, SP660)!

/** The rigging kits priced as Northside would price them on Prices: their own Sell Price. */
function kitsPriced(): CatalogueCtx {
  const kits = ctx.entities['rig_kits']!
  return makeCtx({
    ...ctx,
    entities: {
      ...ctx.entities,
      rig_kits: {
        ...kits,
        priceLevels: [{ key: 'cash', label: 'Sell Price', fieldId: 'rig_kits.ac', scope: 'quote' }],
      },
    },
    orgId: 'northside',
  })
}

describe('each motor, rigged', () => {
  const rigs = riggedOf(ctx, fit)

  it('reads the seven offered with the kit, prop and engine hole each pairing names', () => {
    expect(rigs.map((r) => r.model)).toEqual([
      'F175XC',
      'F175XCB',
      'F200XC',
      'F200XCB',
      'F200XCC',
      'F200XSA',
      'F200XSA2 · White',
    ])
    const first = rigs[0]!
    expect(first.motor.price).toBe(25355)
    expect(first.kit?.name).toMatch(/^Mech Rigging Kit · 703 Side Mount/)
    expect(first.kit?.place).toEqual({ tableId: 'rig_kits', rowId: 'rig_kits:186' })
    expect(first.with).toEqual([
      {
        label: 'Prop',
        value: 'Propeller - Reliance SDS M Series (F150 to F300) · 68F-459xx-xx',
      },
      { label: 'Engine hole', value: 'Not yet known: the price list says TBA' },
    ])
  })

  it('adds no kit into a figure while Northside has not chosen the kits’ price, and says so', () => {
    const first = rigs[0]!
    expect(first.kit?.price).toBeNull()
    expect(first.kit?.unchosen?.map((f) => [f.label, f.figure])).toEqual([
      ['Kit Sell Price', 3110],
      ['Install Retail Sell', 930],
      ['Sell Price', 4040],
    ])
    expect(first.total).toBeNull()
    expect(rigSaid(first)).toBe('The rigging kit’s price is not chosen yet, so it is not added in.')
  })

  it('prices the motor and its kit together once the kits’ price is chosen', () => {
    const priced = riggedOf(kitsPriced(), readBoatFit(kitsPriced(), SP660)!)
    expect(priced[0]!.kit?.price).toBe(4040)
    expect(priced[0]!.total).toBe(25355 + 4040)
    expect(rigSaid(priced[0]!)).toBe('The motor and its rigging kit, on this boat.')
  })

  it('says what every pairing names alike once', () => {
    expect(sharedFacts(rigs).map((f) => f.label)).toEqual(['Prop', 'Engine hole'])
    expect(sharedFacts(rigs.slice(0, 1))).toEqual([])
  })

  it('sets them side by side, a dash where the price list says nothing, no row of dashes', () => {
    const rows = compareOf(ctx, rigs)
    const row = (label: string) => rows.find((r) => r.label === label)?.cells
    expect(row('Horsepower')).toEqual([
      '175 hp',
      '175 hp',
      '200 hp',
      '200 hp',
      '200 hp',
      '200 hp',
      '200 hp',
    ])
    expect(row('Weight')![4]).toBe('—')
    expect(row('Motor')![0]).toBe('$25,355')
    expect(row('Rigging kit price')).toEqual(Array(7).fill('Not chosen'))
    /* nothing is priced together until the kits are: the row is not drawn */
    expect(row('On this boat')).toBeUndefined()
  })
})

describe('the boat’s own facts', () => {
  it('reads the SP660’s own row, never money', () => {
    expect(boatFacts(ctx, SP660)).toEqual([
      { label: 'Length', value: '6.52 m' },
      { label: 'Beam', value: '2.59 m' },
      { label: 'People', value: '13' },
      { label: 'Load', value: '1,287 kg' },
      { label: 'Fuel', value: '140 L' },
      { label: 'Weight', value: '740 kg' },
      { label: 'Shaft', value: 'Extra-long (25″)' },
      { label: 'Steering', value: 'Remote' },
    ])
  })

  it('says a towed weight as the road’s, and reads every maker’s own column names', () => {
    const bmt = ctx.entities['boat_stacer']!.fields.find((f) => f.name === 'BMT Weight (Dry) kg')!
    const stacer = ctx.rowsByEntity['boat_stacer']!.find(
      (r) => typeof r.values[bmt.id] === 'number',
    )!
    const facts = boatFacts(ctx, { tableId: 'boat_stacer', rowId: stacer.id })
    expect(facts.map((f) => f.label)).toContain('Length')
    expect(facts.map((f) => f.label)).toContain('On the road')
    expect(JSON.stringify(facts)).not.toMatch(/\$|Cost|Cash/)
  })
})

describe('the lines a quote started here begins with', () => {
  it('are the build’s own candidates for the motor, its kit and the trailer chosen', () => {
    const world = makeCtx({ ...ctx, views: { ...ctx.views }, orgId: 'northside' })
    const view = createViewFor(world, SP660.tableId)
    const quote = mintQuoteFromView(world, {
      viewId: view.id,
      rowId: SP660.rowId,
      reference: 'T-1',
      hullAlone: true,
    })!
    const rig = riggedOf(ctx, fit)[2]!
    const trailer = fit.trailer!.made.find((t) => !t.crosses)!
    const { adds, kept } = pickedLines(world, quote, [
      { tableId: rig.motor.place.tableId, key: rig.key },
      { tableId: rig.kit!.place.tableId, key: rig.key },
      { tableId: trailer.place.tableId, key: trailer.key },
    ])
    expect(kept).toEqual([])
    expect(adds.map((a) => a.line.label)).toEqual([
      'Yamaha - F200XC',
      expect.stringMatching(/^DEC Rigging Kit/),
      trailer.label,
    ])
    expect(adds[0]!.line.unitPrice).toBe(27565)
    expect(adds[0]!.line.pairRowId).toBe(rig.key)
  })
})
