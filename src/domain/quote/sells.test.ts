/* ============================================================
   WHAT A QUOTE SELLS — against the real pack. A quote is minted on a
   row of each kind of register exactly as New quote mints one, and
   every word asserted is the register's own (measured 2026-10-31).
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import { rowLabel, type QuoteDef, type RowData } from '@/domain/model'
import { mintQuoteFromView } from './index'
import { allSpecsOf } from './freeze'
import { goodsSpecs, headingOf, quoteSells } from './sells'

const pack = await loadPack()
const ctx = pack.ctx

function quoteOn(tableId: string, find: string): QuoteDef {
  const table = ctx.entities[tableId]!
  const row = (pack.rowsByEntity[tableId] ?? []).find((r: RowData) =>
    rowLabel(table, r).includes(find),
  )
  expect(row, `${tableId} has no row matching ${find}`).toBeDefined()
  const view = createViewFor(ctx, tableId)
  const quote = mintQuoteFromView(ctx, { viewId: view.id, rowId: row!.id, reference: 'NSM-TEST' })
  expect(quote).not.toBeNull()
  return quote!
}

describe('what a quote is for, and the word for one of it', () => {
  it('is a boat on a boat register, whatever its naming column calls a row', () => {
    const sells = quoteSells(ctx, quoteOn('boat_highfield', 'SP560'))
    expect(sells).toEqual({ boat: true, kind: 'boat', noun: 'boat' })
    expect(headingOf(sells)).toBe('The hull')
  })

  it('is the register’s own word for anything sold on its own', () => {
    const said = (tableId: string, find: string): string => {
      const sells = quoteSells(ctx, quoteOn(tableId, find))
      expect(sells.boat).toBe(false)
      return `${sells.kind} ${sells.noun} · ${headingOf(sells)}`
    }
    expect(said('mot_yamaha', 'F90LB')).toBe('motor motor · The motor')
    expect(said('trl_dunbier', '4M-13SL')).toBe('trailer trailer · The trailer')
    expect(said('parts', 'Sand Anchor Kit - 10lb')).toBe('accessory product · The product')
    expect(said('dealer_fit', 'Minn Kota')).toBe('package package · The package')
  })

  it('reads a quote whose register has gone as it always read, a boat’s', () => {
    expect(quoteSells(ctx, { rootTableId: 'no-such-table' }).boat).toBe(true)
  })
})

describe('the specifications of a thing sold on its own, without the dealership’s record', () => {
  it('leaves a part with nothing but its record without a specification', () => {
    const quote = quoteOn('parts', 'Sand Anchor Kit - 10lb')
    /* the file's own reading: the flag, the supplier, the code, the install type and the
       operation code — every one of them the record, none of them the anchor */
    expect(allSpecsOf(ctx, quote).map((s) => s.label)).toEqual([
      'Discontinued',
      'Supplier',
      'Code',
      'Install Type',
      'Operation Code',
    ])
    expect(goodsSpecs(ctx.entities.parts, allSpecsOf(ctx, quote))).toEqual([])
  })

  it('never shows a package’s labour, sundries or gross profit', () => {
    const quote = quoteOn('dealer_fit', 'Minn Kota')
    const all = allSpecsOf(ctx, quote).map((s) => s.label)
    expect(all).toContain('GP')
    expect(all).toContain('Labour Ret')
    const kept = goodsSpecs(ctx.entities.dealer_fit, allSpecsOf(ctx, quote)).map((s) => s.label)
    for (const money of ['GP', 'Labour Ret', 'Total Lab', 'Sundry 1', 'Sublet', 'Code']) {
      expect(kept).not.toContain(money)
    }
    expect(kept).toEqual(['Lab Hrs', 'Accessory (Primary)'])
  })

  it('keeps every measure of a motor and drops its supplier and its codes', () => {
    const quote = quoteOn('mot_yamaha', 'F90LB')
    const kept = goodsSpecs(ctx.entities.mot_yamaha, allSpecsOf(ctx, quote)).map((s) => s.label)
    expect(kept).toContain('WEIGHT')
    expect(kept).toContain('HP Rating')
    expect(kept).toContain('Shaft Length')
    expect(kept).not.toContain('Supplier')
    expect(kept).not.toContain('PD Operation Code')
  })
})
