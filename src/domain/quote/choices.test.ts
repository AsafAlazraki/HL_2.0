/* ============================================================
   CHOOSING THE BOAT INSIDE ITS CHAPTER — asserted against the real
   pack. Every count and figure below was measured on Northside's own
   price file on 2026-10-30 by `boatChoices` itself, and each one is a
   claim the hull chapter draws: how many models a series holds, which
   axes a boat differs by, and what each press does to the total.
   ============================================================ */

import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import { rowLabel, type EntityDef, type QuoteDef, type RowData } from '@/domain/model'
import { apply, isDone, mintQuoteFromView, quoteTotals, refinish } from '@/domain/quote'
import { refinishSubject } from './freeze'
import { boatChoices, goodsChoices, NO_OTHER_BOAT, type BoatChoices } from './choices'

const pack = await loadPack()
const ctx = pack.ctx

function quoteOn(key: string, find: string): QuoteDef {
  const table: EntityDef = pack.byKey(key)
  const rows = pack.rowsByEntity[table.id] ?? []
  const row = rows.find((r: RowData) => rowLabel(table, r).includes(find))
  expect(row, `${key} has no row matching ${find}`).toBeDefined()
  const view = createViewFor(ctx, table.id)
  const quote = mintQuoteFromView(ctx, { viewId: view.id, rowId: row!.id, reference: 'NSM-TEST' })
  expect(quote).not.toBeNull()
  return quote!
}

const axis = (choices: BoatChoices, id: string) => choices.axes.find((a) => a.id === id)

describe('the axes a boat differs by, read off the file', () => {
  it('reads a Highfield Sport 560 as model, material and colour, across the whole series', () => {
    const quote = quoteOn('boat_highfield', 'SP560 (PVC) W-W-WB')
    const choices = boatChoices(ctx, quote)
    expect(choices.series).toBe('Sport')
    expect(choices.siblings).toBe(199)
    expect(choices.axes.map((a) => a.title)).toEqual(['Model', 'Material', 'Colour'])
    const model = axis(choices, 'model')!
    expect(model.options.length).toBe(16)
    expect(model.options.filter((o) => o.current).map((o) => o.say)).toEqual(['Sport 560'])
    expect(model.options.find((o) => o.say === 'Sport 520')!.delta).toBe(-7150)
    expect(model.options.find((o) => o.say === 'Sport 600')!.delta).toBe(13130)
    /* the seven models above the 660 are filed in Hypalon only, so the PVC this quote is in
       cannot be kept: the nearest row is taken, and the option says so */
    expect(model.options.filter((o) => !o.exact).length).toBe(6)
    const material = axis(choices, 'material')!
    expect(material.options.map((o) => `${o.say} ${o.delta}`)).toEqual(['PVC 0', 'Hypalon 7010'])
    const colour = axis(choices, 'colour')!
    expect(colour.options.length).toBe(7)
    expect(colour.options.every((o) => o.delta === 0 && o.colour !== null)).toBe(true)
  })

  it('reads a Stabicraft 1850 Supercab as a model in three versions', () => {
    const choices = boatChoices(ctx, quoteOn('boat_stabicraft', '1850 Supercab (Sportfish)'))
    expect(choices.axes.map((a) => a.title)).toEqual(['Model', 'Version'])
    expect(axis(choices, 'model')!.options.map((o) => o.say)).toEqual([
      '1850 Supercab',
      '2050 Supercab',
      '2350 Supercab',
    ])
    expect(axis(choices, 'trim')!.options.map((o) => `${o.say} ${o.delta}`)).toEqual([
      'Adventure -12700',
      'Sportfish 0',
      'Profish 18400',
    ])
  })

  it('never names a version the file does not: a Stacer Skimma is five models, no "Standard"', () => {
    const choices = boatChoices(ctx, quoteOn('boat_stacer', '319 Skimma'))
    expect(choices.axes.map((a) => a.id)).toEqual(['model'])
    expect(axis(choices, 'model')!.options.map((o) => o.say)).toEqual([
      '309 Skimma',
      '319 Skimma',
      '359 Skimma',
      '319 Skimma HS',
      '359 Skimma HS',
    ])
  })

  it('reads a register that groups by nothing as one series (Formosa, 39 rows)', () => {
    const choices = boatChoices(ctx, quoteOn('boat_formosa', 'SRT 565 (Territory)'))
    expect(choices.siblings).toBe(39)
    expect(axis(choices, 'model')!.options.length).toBe(14)
    expect(axis(choices, 'trim')!.options.map((o) => o.say)).toEqual([
      'Side Console',
      'Territory',
      'Centre Console',
      'X Bowrider',
      'Centre Cabin',
    ])
  })

  it('says so where a boat is alone in its series', () => {
    const choices = boatChoices(ctx, quoteOn('boat_stabicraft', '1450 Explorer'))
    expect(choices.axes).toEqual([])
    expect(choices.why).toBe(NO_OTHER_BOAT)
  })

  it('offers nothing on a quote that is not for a boat', () => {
    const choices = boatChoices(ctx, quoteOn('mot_yamaha', 'F90'))
    expect(choices.axes).toEqual([])
    expect(choices.why).toBe('')
  })
})

describe('every figure is the engine’s, and a press lands where the option says', () => {
  const quote = quoteOn('boat_highfield', 'SP560 (PVC) W-W-WB')
  const choices = boatChoices(ctx, quote)
  const options = choices.axes.flatMap((a) => a.options)

  it('prices each option as the total of the quote it would produce, less this one', () => {
    const now = quoteTotals(quote).total
    for (const option of options) {
      const next = refinishSubject(ctx, quote, option.rowId)!
      expect(option.would).toBe(quoteTotals(next).total)
      expect(option.delta).toBe(option.would - now)
      expect(option.label).toBe(next.subjectLabel)
    }
  })

  it('re-roots the quote on the option’s row through the engine’s own command, with its way back', () => {
    const sport520 = axis(choices, 'model')!.options.find((o) => o.say === 'Sport 520')!
    const outcome = apply(quote, refinish(ctx, sport520.rowId), '2026-10-30T00:00:00.000Z')
    expect(isDone(outcome)).toBe(true)
    if (!isDone(outcome)) return
    expect(outcome.next.rootRowId).toBe(sport520.rowId)
    expect(quoteTotals(outcome.next).total).toBe(sport520.would)
    /* and the boat it now is reads its own axes, with the 520 the one chosen */
    const again = boatChoices(ctx, outcome.next)
    expect(axis(again, 'model')!.options.find((o) => o.current)!.say).toBe('Sport 520')
  })
})

describe('what else changes with a choice that cannot keep the rest', () => {
  it('says the Sport 700 ST comes in Hypalon, where the quote is in PVC', () => {
    const choices = boatChoices(ctx, quoteOn('boat_highfield', 'SP560 (PVC) W-W-WB'))
    const st = axis(choices, 'model')!.options.find((o) => o.say === 'Sport 700 ST')!
    expect(st.exact).toBe(false)
    expect(st.also).toEqual(['Hypalon'])
    const sport520 = axis(choices, 'model')!.options.find((o) => o.say === 'Sport 520')!
    expect(sport520.also).toEqual([])
  })
})

/* ============================================================
   A MOTOR, A TRAILER OR A PART SOLD ON ITS OWN, CHOSEN AMONG THE ONES
   BESIDE IT ON THE PRICE LIST (the build page round, 2026-10-31).
   Measured on the pack that day by `goodsChoices` itself.
   ============================================================ */
describe('the ones beside a thing sold on its own', () => {
  const on = (tableId: string, find: string): QuoteDef => {
    const table = ctx.entities[tableId]!
    const row = (pack.rowsByEntity[tableId] ?? []).find((r: RowData) =>
      rowLabel(table, r).includes(find),
    )
    expect(row, `${tableId} has no row matching ${find}`).toBeDefined()
    const view = createViewFor(ctx, tableId)
    return mintQuoteFromView(ctx, { viewId: view.id, rowId: row!.id, reference: 'NSM-TEST' })!
  }

  it('offers a repower the nine motors nearest it of its 138 four-strokes', () => {
    const quote = on('mot_yamaha', 'F90LB')
    const choices = goodsChoices(ctx, quote)
    expect(choices.series).toBe('Four Stroke Models')
    expect(choices.siblings).toBe(138)
    expect(choices.axes).toHaveLength(1)
    const motor = choices.axes[0]!
    expect(motor.title).toBe('Motor')
    expect(motor.count).toBe('9 nearest of 138')
    expect(motor.options).toHaveLength(9)
    /* the maker every option shares is the bar's mark's, and each is the engine's own total */
    expect(motor.options.filter((o) => o.current).map((o) => o.say)).toEqual(['F90LB'])
    expect(motor.options.every((o) => !o.say.startsWith('Yamaha'))).toBe(true)
    const now = quoteTotals(quote).total
    for (const option of motor.options) {
      const next = refinishSubject(ctx, quote, option.rowId)!
      expect(option.would).toBe(quoteTotals(next).total)
      expect(option.delta).toBe(option.would - now)
    }
    expect(motor.options.find((o) => o.say === 'F75LB')!.delta).toBe(-1520)
  })

  it('offers a sand anchor the other sizes of its kit, and says which carry no price', () => {
    const choices = goodsChoices(ctx, on('parts', 'Sand Anchor Kit - 10lb'))
    const product = choices.axes[0]!
    expect(product.title).toBe('Product')
    expect(product.count).toBeUndefined()
    expect(product.options.map((o) => o.say)).toEqual([
      'Sand Anchor Kit · 4lb',
      'Sand Anchor Kit · 6lb',
      'Sand Anchor Kit · 8lb',
      'Sand Anchor Kit · 10lb',
      'Sand Anchor Kit · 13lb',
      'Reef Anchor Kit · 8 mm w 50mtr Rope & 4mtr Chain',
      'Reef Anchor Kit · 10 mm w 50mtr Rope & 4mtr Chain',
      'Reef Anchor Kit · 13 mm w 50mtr Rope & 4mtr Chain',
    ])
    /* a reef anchor kit the price list gives no price is no price, never a saving */
    expect(product.options.filter((o) => o.amount === null)).toHaveLength(3)
  })

  it('offers nothing on a boat, which is the hull chapter’s to choose', () => {
    expect(goodsChoices(ctx, quoteOn('boat_highfield', 'SP560 (PVC) W-W-WB')).axes).toEqual([])
  })
})
