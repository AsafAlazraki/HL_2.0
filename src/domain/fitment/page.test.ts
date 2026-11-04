/* ============================================================
   ONE BOAT'S PAGE, READ OFF THE REAL PRICE LIST — the Patrol 600 and
   the Sport 560 the fit-flow boards were drawn on
   (docs/directions/fit-flow/directions.md). Every figure below is the
   one the board printed, counted again here.
   ============================================================ */
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { makeCtx, rowLabel, type CatalogueCtx, type RowData } from '@/domain/model'
import { emptySheet, indexRows, type CatalogueData } from '@/domain/catalogue/sheet'
import { isDone } from '@/domain/catalogue/commands'
import { readBoatFit, type BoatFit } from './boat'
import { changeFit } from './change'
import { versionsOf } from './versions'
import { heldBack } from './plate'
import { pickedLines, riggedOf } from './rigged'
import { createViewFor } from '@/domain/catalogue/views'
import { mintQuoteFromView } from '@/domain/quote/freeze'
import {
  canPutOnOf,
  carriesCode,
  changesOn,
  decidesSaid,
  modelWordsOf,
  namedForOf,
  quoteStartOf,
  quoteStartSaid,
  takenOffOf,
  takenOffSaid,
} from './page'

vi.setConfig({ testTimeout: 60_000 })

const NOW = new Date(2026, 10, 5, 12).toISOString()
const PA600 = 'boat_highfield:298'
const SP560 = 'boat_highfield:483'

let pack: PackFixture
let sheet: CatalogueData

const ctxOf = (data: CatalogueData): CatalogueCtx =>
  makeCtx({ ...pack.ctx, rowsByEntity: data.rows, orgId: 'northside' })
const fitOf = (data: CatalogueData, rowId: string): BoatFit =>
  readBoatFit(ctxOf(data), { tableId: 'boat_highfield', rowId })!

beforeAll(async () => {
  pack = await loadPack()
  const rows: Record<string, RowData[]> = {}
  for (const e of pack.entities) rows[e.id] = [...(pack.rowsByEntity[e.id] ?? [])]
  sheet = {
    ...emptySheet(),
    orgId: 'northside',
    tables: Object.fromEntries(pack.entities.map((e) => [e.id, e])),
    rows,
    index: indexRows(rows),
  }
})

describe('the model in words', () => {
  it('names the model, says it short, and reads its code where the price list files it', () => {
    const fit = fitOf(sheet, PA600)
    expect(
      rowLabel(
        pack.byKey('boat_highfield'),
        pack.rowsByEntity.boat_highfield!.find((r) => r.id === PA600)!,
      ),
    ).toBe('Highfield - PA600 Open (PVC) LG-W-DG')
    expect(modelWordsOf(fit, 'Highfield Patrol 600', 'Highfield')).toEqual({
      name: 'Highfield Patrol 600',
      short: 'Patrol 600',
      code: 'PA600',
    })
  })

  it('reads a code only where it stands as a word of its own', () => {
    expect(carriesCode('Sundeck for PA600', 'PA600')).toBe(true)
    expect(carriesCode('GFAB Tandem Axel Trailer t/s Highfield PA600', 'PA600')).toBe(true)
    expect(carriesCode('Patrol - PA600 OB PVC - LG-W-DG', 'PA600')).toBe(true)
    expect(carriesCode('Patrol - PA600EW HYP - B-B-B', 'PA600')).toBe(false)
    expect(carriesCode('Patrol - PA6000', 'PA600')).toBe(false)
    expect(carriesCode('anything', '')).toBe(false)
  })

  it('reads no code from a model filed as a word', () => {
    const fit = { ...fitOf(sheet, PA600), path: ['Coaster', 'Coaster', '600 ST (PVC) DG-G-DB'] }
    expect(modelWordsOf(fit, 'Highfield Coaster', 'Highfield').code).toBe('')
  })
})

describe('named for it, and not listed for it', () => {
  it('counts the Patrol 600’s: one trailer, 40 dealer-fit packages and a sundeck', () => {
    const fit = fitOf(sheet, PA600)
    const named = namedForOf(ctxOf(sheet), fit, 'PA600')
    const bySlot = (slot: string) => named.filter((n) => n.slot === slot)
    expect(bySlot('trailer').map((n) => [n.name, n.price])).toEqual([
      ['GFAB Tandem Axel Trailer t/s Highfield Patrol 600', 23063],
    ])
    expect(bySlot('dealer_fit')).toHaveLength(40)
    expect(bySlot('parts').map((n) => [n.name, n.price])).toEqual([['Sundeck for PA600', 1750]])
    /* nothing made for it is ever named here */
    const made = new Set(fit.lists.flatMap((l) => l.made.map((m) => m.place.rowId)))
    expect(named.some((n) => made.has(n.place.rowId))).toBe(false)
  })

  it('counts the Sport 560’s: no trailer (its own is made for it), 15 packages and two parts', () => {
    const fit = fitOf(sheet, SP560)
    const named = namedForOf(ctxOf(sheet), fit, 'SP560')
    expect(named.filter((n) => n.slot === 'trailer')).toHaveLength(0)
    expect(named.filter((n) => n.slot === 'dealer_fit')).toHaveLength(15)
    expect(named.filter((n) => n.slot === 'parts').map((n) => n.name)).toEqual([
      'Boat Cover · SP560',
      'Stern Shade for SP560',
    ])
  })
})

describe('the reasons, with what the page says on its own set apart', () => {
  it('the Patrol 600’s 433 other trailers, the named one apart, add up to every one on sale', () => {
    const fit = fitOf(sheet, PA600)
    const named = namedForOf(ctxOf(sheet), fit, 'PA600')
    const apart = new Set(named.map((n) => n.place.rowId))
    const held = heldBack(ctxOf(sheet), fit, 'trailer', apart)
    expect(held.groups.map((g) => [g.id, g.count])).toEqual([
      ['this', 11],
      ['another', 131],
      ['unnamed', 291],
    ])
    expect(held.others).toBe(433)
    expect(held.others + 1 + fit.trailer!.made.length).toBe(fit.trailer!.onSale)
    expect(held.groups[0]!.example?.name).not.toBe(
      'GFAB Tandem Axel Trailer t/s Highfield Patrol 600',
    )
  })

  it('the Patrol 600’s other 204 motors, by reason, as the board counted them', () => {
    const fit = fitOf(sheet, PA600)
    const held = heldBack(ctxOf(sheet), fit, 'motor', new Set())
    expect(held.groups.map((g) => [g.id, g.count])).toEqual([
      ['under', 60],
      ['over', 72],
      ['shaft', 10],
      ['steering', 1],
      ['inside', 14],
      ['rigs', 47],
    ])
    expect(held.others).toBe(204)
  })
})

describe('a motor taken off stays itself', () => {
  it('is read as taken off, with when, and never filed among the motors that never fitted', () => {
    const fit = fitOf(sheet, PA600)
    const f150 = fit.motor!.made.find((m) => m.name === 'Yamaha F150XC')!
    const versions = versionsOf(ctxOf(sheet), fit.place)!.versions.map((v) => v.place)
    const change = changeFit(ctxOf(sheet), fit, f150.place, 'off', versions)
    if ('refused' in change) throw new Error(change.refused)
    const done = change.command(sheet, NOW)
    if (!isDone(done)) throw new Error(done.refused)
    const after = fitOf(done.next, PA600)
    const taken = takenOffOf(ctxOf(done.next), after)
    expect(taken.map((t) => [t.slot, t.name, t.price])).toEqual([['motor', 'Yamaha F150XC', 22461]])
    expect(takenOffSaid(taken[0]!.on, new Date(NOW))).toBe('Taken off today')

    /* the reasons set it apart, so "in range and not listed" is still the 14 that never were */
    const apart = new Set(taken.map((t) => t.place.rowId))
    const held = heldBack(ctxOf(done.next), after, 'motor', apart)
    expect(held.groups.find((g) => g.id === 'inside')?.count).toBe(14)
    expect(held.others).toBe(204)
    /* and it is not offered as a motor to put on: it is put back */
    expect(canPutOnOf(ctxOf(done.next), after, taken).map((l) => l.place.rowId)).not.toContain(
      f150.place.rowId,
    )
    expect(changesOn(ctxOf(done.next), after)).toEqual({ added: 0, removed: 1 })
    expect(changesOn(ctxOf(sheet), fit)).toEqual({ added: 0, removed: 0 })
  })

  it('counts a motor put on by Northside, and not the price list’s own lines marked put on', () => {
    const fit = fitOf(sheet, PA600)
    const inside = canPutOnOf(ctxOf(sheet), fit, [])[0]!
    const change = changeFit(ctxOf(sheet), fit, inside.place, 'on')
    if ('refused' in change) throw new Error(change.refused)
    const done = change.command(sheet, NOW)
    if (!isDone(done)) throw new Error(done.refused)
    expect(changesOn(ctxOf(done.next), fitOf(done.next, PA600))).toEqual({ added: 1, removed: 0 })
  })

  it('says when, by the calendar', () => {
    const today = new Date(2026, 10, 5, 9)
    expect(takenOffSaid(new Date(2026, 10, 4, 18).toISOString(), today)).toBe('Taken off yesterday')
    expect(takenOffSaid(new Date(2026, 10, 1, 18).toISOString(), today)).toBe(
      'Taken off on 1 November',
    )
    expect(takenOffSaid('', today)).toBe('Taken off by Northside')
  })
})

describe('the motors Northside can put on', () => {
  it('are the 14 the Patrol 600 takes by its own figures that the price list does not list', () => {
    const fit = fitOf(sheet, PA600)
    const can = canPutOnOf(ctxOf(sheet), fit, [])
    expect(can).toHaveLength(14)
    expect(can.every((l) => l.slot === 'motor')).toBe(true)
  })
})

describe('what decides the page', () => {
  it('names the rules and Northside’s changes, or that there are none', () => {
    expect(decidesSaid(0, { added: 0, removed: 0 })).toBe(
      'What decides this page: the price list says what fits which boat. None of Northside’s rules is switched on, and Northside has changed nothing on this boat.',
    )
    expect(decidesSaid(2, { added: 1, removed: 3 })).toBe(
      'What decides this page: the price list says what fits which boat. 2 of Northside’s rules are switched on, and Northside has put 1 on this boat by hand and taken 3 off it.',
    )
  })
})

describe('the quote this starts', () => {
  it('the Patrol 600 with the recommended motor: $47,059 at Cash, before the rigging kit', () => {
    const fit = fitOf(sheet, PA600)
    const rig = riggedOf(ctxOf(sheet), fit).find((r) => r.motor.starred)!
    const q = quoteStartOf({ name: 'Highfield Patrol 600', price: fit.price }, rig, null, [])
    expect(q.names).toEqual(['Highfield Patrol 600', 'Yamaha F115XB and its rigging kit'])
    expect(q.lines).toBe(3)
    expect(q.total).toBe(47059)
    expect(quoteStartSaid(q, 'Cash')).toBe('at Cash, before the rigging kit')
  })

  it('the Sport 560 with its trailer and a part ticked: $66,982, every ticked line on it', () => {
    const fit = fitOf(sheet, SP560)
    const rig = riggedOf(ctxOf(sheet), fit).find((r) => r.motor.starred)!
    const trailer = fit.trailer!.made.find((t) => t.crosses)!
    const parts = fit.lists.find((l) => l.tableId === 'parts')!.made
    const batteries = parts.find((m) => m.name === '2 x MFM50 Batteries')!
    const packages = fit.lists.find((l) => l.tableId === 'dealer_fit')!.made.slice(0, 1)
    const q = quoteStartOf({ name: 'Highfield Sport 560', price: fit.price }, rig, trailer, [
      batteries,
      ...packages,
    ])
    expect(q.names).toEqual([
      'Highfield Sport 560',
      'Yamaha F90XB and its rigging kit',
      'REDCO Custom / Highfield Sport 560 Aluminium · TA600-MOB',
      '2 x MFM50 Batteries',
      packages[0]!.name,
    ])
    expect(q.lines).toBe(6)
    expect(q.total).toBe(66982)
    expect(q.unpriced).toBe(1)
    expect(quoteStartSaid(q, 'Cash')).toBe(
      'at Cash, before the rigging kit, and 1 with no price yet',
    )
  })

  it('carries every ticked fit-out line onto the quote it starts, beside the motor and the trailer', () => {
    /* the walk, major: "I put the part on, started the quote, and it isn't there" */
    const world = makeCtx({ ...ctxOf(sheet), views: { ...pack.ctx.views }, orgId: 'northside' })
    const fit = readBoatFit(world, { tableId: 'boat_highfield', rowId: SP560 })!
    const view = createViewFor(world, 'boat_highfield')
    const quote = mintQuoteFromView(world, {
      viewId: view.id,
      rowId: SP560,
      reference: 'T-1',
      hullAlone: true,
    })!
    const trailer = fit.trailer!.made.find((t) => t.crosses)!
    const batteries = fit.lists.find((l) => l.tableId === 'parts')!.made[0]!
    const pack1 = fit.lists.find((l) => l.tableId === 'dealer_fit')!.made[0]!
    const pack2 = fit.lists.find((l) => l.tableId === 'dealer_fit')!.made[1]!
    const { adds, kept } = pickedLines(world, quote, [
      { tableId: trailer.place.tableId, key: trailer.key },
      { tableId: 'parts', key: batteries.key },
      { tableId: 'dealer_fit', key: pack1.key },
      { tableId: 'dealer_fit', key: pack2.key },
    ])
    expect(kept).toEqual([])
    expect(adds.map((a) => a.line.label)).toEqual([
      trailer.label,
      batteries.label,
      pack1.label,
      pack2.label,
    ])
  })
})
