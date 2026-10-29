/* ============================================================
   A PRICE NOT CHOSEN IS NOT A PRICE MISSING (built-critique-m3.md,
   blocker 1), on the real price list.

   The Tube Covers to suit PVC Boat · 3.4 Mtr went on the Classic 340
   and the build said "Dealer Fit Packages have no price on the price
   list". Its line holds sell figures. Every figure asserted below is
   read off the line in the test, never typed.
   ============================================================ */
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { rowLabel, type EntityDef, type RowData } from '@/domain/model'
import { namePrice, priceIn } from '@/domain/catalogue/priceCommands'
import { emptySheet, indexRows, type CatalogueData } from '@/domain/catalogue/sheet'
import { isDone } from '@/domain/catalogue/commands'
import { sellColumns, sellFigures, unchosenOn } from './unchosen'

let pack: PackFixture
let fit: EntityDef
let covers: RowData

beforeAll(async () => {
  pack = await loadPack()
  fit = pack.byKey('dealer_fit')
  covers = (pack.rowsByEntity[fit.id] ?? []).find((r) =>
    rowLabel(fit, r).startsWith('Tube Covers to suit PVC Boat - 3.4 Mtr'),
  ) as RowData
})

describe('a line whose list names no price', () => {
  it('holds sell figures on the Tube Covers, so the price is not chosen, not missing', () => {
    expect(covers, 'the seed carries the Tube Covers for the 3.4 m boat').toBeDefined()
    const figures = unchosenOn(fit, covers)
    expect(figures).not.toBeNull()
    /* every figure is the line's own cell, under the column's own name */
    for (const { label, figure } of figures!) {
      const f = fit.fields.find((x) => x.name === label)!
      expect(priceIn(covers, f.id)).toBe(figure)
    }
    /* never a package's Parts Sell, never a cost, never a trade figure */
    expect(figures!.map((f) => f.label)).not.toContain('Parts Sell')
    for (const f of sellColumns(fit)) expect(f.name).not.toMatch(/cost|trade|^parts\b/i)
    expect(figures!.length).toBeGreaterThan(1)
  })

  it('is chosen once Prices names one of them, and then nothing is said', () => {
    const rows: Record<string, RowData[]> = {}
    for (const e of pack.entities) rows[e.id] = [...(pack.rowsByEntity[e.id] ?? [])]
    const sheet: CatalogueData = {
      ...emptySheet(),
      orgId: 'northside',
      tables: Object.fromEntries(pack.entities.map((e) => [e.id, e])),
      rows,
      index: indexRows(rows),
      priceLevels: {},
    }
    const first = sellFigures(fit, covers)[0]!
    const fieldId = fit.fields.find((f) => f.name === first.label)!.id
    const done = namePrice(fit.id, 'cash', fieldId)(sheet, '2026-10-28T09:00:00.000Z')
    expect(isDone(done)).toBe(true)
    if (!isDone(done)) return
    expect(unchosenOn(done.next.tables[fit.id], covers)).toBeNull()
  })

  it('says nothing for a list that names its price, or a line with no figure at all', () => {
    const yamaha = pack.byKey('mot_yamaha')
    const motor = (pack.rowsByEntity[yamaha.id] ?? [])[0] as RowData
    expect(unchosenOn(yamaha, motor)).toBeNull()
    const blank: RowData = { ...covers, values: {} }
    expect(unchosenOn(fit, blank)).toBeNull()
    expect(unchosenOn(undefined, covers)).toBeNull()
  })
})
