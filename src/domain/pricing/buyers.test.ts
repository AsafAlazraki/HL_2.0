/* What each buyer pays for one line, read as a quote reads it, and finding a line by its name or
   its code. The figures are the price list's own. */
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { priceIn } from '@/domain/catalogue/priceCommands'
import { freezeLevels, priceAtLevel } from '@/domain/quote/pricing'
import type { EntityDef, PriceLevel, RowData } from '@/domain/model'
import { buyersOf, findLines, type LineEntry, type Sheet } from './buyers'

let pack: PackFixture
let sheet: Sheet
const table = (id: string): EntityDef => pack.entities.find((e) => e.id === id)!
const rowOf = (id: string, test: (r: RowData) => boolean): RowData =>
  (pack.rowsByEntity[id] ?? []).find(test)!

beforeAll(async () => {
  pack = await loadPack()
  const priceLevels: Record<string, PriceLevel[]> = {}
  for (const t of pack.entities) if (t.priceLevels) priceLevels[t.id] = t.priceLevels
  sheet = {
    tables: Object.fromEntries(pack.entities.map((t) => [t.id, t])),
    rows: pack.rowsByEntity,
    priceLevels,
  }
})

describe('each buyer', () => {
  it('reads the F90XB at $14,531 for a customer and its Trade Price for a trade buyer', () => {
    const f90 = rowOf(
      'mot_yamaha',
      (r) =>
        r.values['mot_yamaha.g'] === 'F90XB' || String(r.values['mot_yamaha.c']).endsWith('F90XB'),
    )
    const b = buyersOf(sheet, table('mot_yamaha'), f90)
    expect(b.map((x) => [x.key, x.state, x.column])).toEqual([
      ['cash', 'reads', 'Sell Price'],
      ['trade', 'reads', 'Trade Price'],
    ])
    expect(b[0]!.figure).toBe(14531)
    expect(b[0]!.cell).toBe('Motor Library!BF')
  })

  it('says a Jeanneau with no Trade cannot be priced for a trade buyer, as a quote finds it', () => {
    const t = table('boat_jeanneau')
    const row = rowOf('boat_jeanneau', (r) => priceIn(r, 'boat_jeanneau.qt') === null)
    const trade = buyersOf(sheet, t, row).find((x) => x.key === 'trade')!
    expect(trade.state).toBe('blank')
    /* and the quote agrees: the frozen rung prices nothing */
    expect(priceAtLevel(freezeLevels(t, row.values), 'trade').unitPrice).toBeNull()
  })

  it('says a trailer’s trade buyer pays Sell inc Rego, the list having no Trade', () => {
    const t = table('trl_redco')
    const row = rowOf('trl_redco', (r) => priceIn(r, 'trl_redco.ca') !== null)
    const trade = buyersOf(sheet, t, row).find((x) => x.key === 'trade')!
    expect([trade.state, trade.column]).toEqual(['falls', 'Sell inc Rego'])
    expect(priceAtLevel(freezeLevels(t, row.values), 'trade').priceColumnName).toBe('Sell inc Rego')
  })

  it('keeps Warranty Northside’s own, and says a kit not chosen and its sub-dealer figure', () => {
    const boat = rowOf('boat_stacer', () => true)
    const w = buyersOf(sheet, table('boat_stacer'), boat).find((x) => x.key === 'warranty')!
    expect(w.northsideOnly).toBe(true)
    const kit = rowOf('rig_kits', (r) => priceIn(r, 'rig_kits.m') !== null)
    const k = buyersOf(sheet, table('rig_kits'), kit)
    expect(k.map((x) => [x.key, x.state])).toEqual([['cash', 'unchosen']])
  })
})

describe('finding a line', () => {
  const entries: LineEntry[] = [
    { tableId: 'm', rowId: '1', name: 'F90XB', code: 'F90XB', list: 'Yamaha' },
    { tableId: 'm', rowId: '2', name: 'F90XB2 · White', code: 'F90XB2', list: 'Yamaha' },
    { tableId: 'b', rowId: '3', name: '309 Skimma', code: 'S309', list: 'Stacer' },
    { tableId: 'b', rowId: '4', name: 'Sport 560 · Hypalon', code: 'HBS114', list: 'Highfield' },
  ]
  it('puts a code typed whole first, then a code begun, then names', () => {
    expect(findLines(entries, 'f90xb').map((e) => e.rowId)).toEqual(['1', '2'])
    expect(findLines(entries, 'skimma').map((e) => e.rowId)).toEqual(['3'])
    expect(findLines(entries, 'sport hypalon').map((e) => e.rowId)).toEqual(['4'])
    expect(findLines(entries, 'h')).toEqual([])
  })
})
