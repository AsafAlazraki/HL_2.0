/* What each buyer pays for one line, read as a quote reads it, and finding a line by its name or
   its code. The figures are the price list's own. */
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { priceIn } from '@/domain/catalogue/priceCommands'
import { freezeLevels, priceAtLevel } from '@/domain/quote/pricing'
import { boatRungs } from '@/domain/quote/nought'
import type { EntityDef, PriceLevel, RowData } from '@/domain/model'
import { buyersOf, findLines, searchLines, type LineEntry, type Sheet } from './buyers'
import { waysFor } from './ways'

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

  it('reads a kit priced supplied or fitted for every buyer, fitted trade and both sub-dealer figures', () => {
    const kits = table('rig_kits')
    const supplied = waysFor(kits, pack.rowsByEntity.rig_kits ?? []).find(
      (w) => w.id === 'supplied',
    )!
    const ladder: PriceLevel[] = supplied.rungs.map((r) => ({
      key: r.key,
      label: r.label,
      fieldId: r.fieldId,
      scope: r.key === 'cash' || r.key === 'trade' ? 'quote' : 'line',
      named: true,
    }))
    const named: Sheet = { ...sheet, priceLevels: { ...sheet.priceLevels, rig_kits: ladder } }
    const f20g = rowOf('rig_kits', (r) => r.values['rig_kits.d'] === '9YA_TCK_F20G')
    const b = buyersOf(named, { ...kits, priceLevels: ladder }, f20g)
    expect(b.map((x) => [x.key, x.figure, x.cell])).toEqual([
      ['cash', 900, 'Rigging Kits!K'],
      ['trade', 855, 'Rigging Kits!L'],
      ['fitted', 1060, 'Rigging Kits!AC'],
      ['fitted-trade', 1007, 'Rigging Kits!AD'],
      ['sub', 855, 'Rigging Kits!M'],
      ['sub-fitted', 1007, 'Rigging Kits!AE'],
    ])
  })
})

describe('a figure under nought', () => {
  /* the verifier of Prices, round 2, a blocker: once Sell Price was named, the look-up gave a
     customer the MF1095FLYS2 with Mercury Twin 300 HP at −$29,390 */
  const pkgs = () => table('mot_pkg_jeanneau')
  const mercury = () =>
    rowOf('mot_pkg_jeanneau', (r) => r.values['mot_pkg_jeanneau.d'] === '16L3AK')
  const sell: PriceLevel[] = [
    {
      key: 'cash',
      label: 'Sell Price',
      fieldId: 'mot_pkg_jeanneau.bf',
      scope: 'quote',
      named: true,
    },
  ]
  const named = (): Sheet => ({
    ...sheet,
    priceLevels: { ...sheet.priceLevels, mot_pkg_jeanneau: sell },
  })

  it('is no price for a customer or a trade buyer, and the quote freezes it as none', () => {
    const t = { ...pkgs(), priceLevels: sell }
    const b = buyersOf(named(), t, mercury())
    expect(b.map((x) => [x.key, x.state, x.figure, x.under?.[0]?.figure])).toEqual([
      ['cash', 'under', null, -29_390],
      ['trade', 'under', null, -29_390],
    ])
    /* the list's own Trade Price, named by no price, is said, never denied */
    expect(b[1]!.carried).toEqual({ column: 'Trade Price', cell: 'Motor Library!BL', figure: null })
    /* and the quote agrees: a package under nought freezes as no figure (nought.ts) */
    const frozen = boatRungs(t, freezeLevels(t, mercury().values))
    expect(priceAtLevel(frozen, 'cash').unitPrice).toBeNull()
  })

  it('is said where Northside has not chosen, beside the figures that could be a price', () => {
    const b = buyersOf(sheet, pkgs(), mercury())
    expect(b[0]!.state).toBe('unchosen')
    expect(b[0]!.could).toEqual([])
    expect(b[0]!.under).toEqual([
      { label: 'RRP + Freight Inc GST', figure: -29_390 },
      { label: 'Sell Price', figure: -29_390 },
    ])
  })

  it('is a price on a line the price list names a credit', () => {
    const credit = rowOf('parts', (r) =>
      String(r.values['parts.c']).startsWith('CREDIT - Batteries'),
    )
    const b = buyersOf(sheet, table('parts'), credit)
    expect([b[0]!.state, b[0]!.figure]).toEqual(['reads', -531])
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

  it('shows every list’s best line before any list’s second, and counts every line found', () => {
    const many: LineEntry[] = [
      ...Array.from({ length: 8 }, (_, i) => ({
        tableId: 'dealer_fit',
        rowId: `d${i}`,
        name: `Tiller Conversion Kit · Package ${i}`,
        code: '',
        list: 'Dealer Fit',
      })),
      {
        tableId: 'rig_kits',
        rowId: 'k1',
        name: 'Tiller Conversion Kit · F20G',
        code: '9YA_TCK_F20G',
        list: 'Rigging Kits',
      },
    ]
    const found = searchLines(many, 'tiller conversion kit')
    expect(found.total).toBe(9)
    expect(found.lines).toHaveLength(6)
    expect(found.lines.map((e) => e.rowId)).toEqual(['d0', 'k1', 'd1', 'd2', 'd3', 'd4'])
  })
})
