import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { sellableRows } from '@/domain/catalogue/views/sellable'
import type { EntityDef, RowData } from '@/domain/model'
import { findLines } from './find'
import { caseTwinsOf, suppliersIn, supplierSaid } from './suppliers'
import {
  makerWords,
  saidNames,
  supplierReadings,
  suppliersElsewhere,
  type SupplierElsewhere,
} from './readings'

/* WHAT THE PRICE LIST SAYS OF ITS OWN SUPPLIER CODES: each rule shown to hold and to refuse where
   it should, then measured on the real price list (data/northside). */

const yamaha: SupplierElsewhere = { list: 'Yamaha Outboards', supplier: 'Yamaha', lines: 3, of: 3 }

describe('a code another list names', () => {
  it('reads YAM and Yam as the one supplier written in words that begins with their letters', () => {
    const lines = [
      { maker: 'YAM', heading: 'CONTROL CABLES' },
      { maker: 'Yam', heading: 'PROPELLERS - Yamaha' },
      { maker: 'YAM', heading: 'KEY SWITCHES' },
    ]
    expect(supplierReadings(lines, [yamaha]).map((r) => [r.code, r.name, r.from])).toEqual([
      ['YAM', 'Yamaha', 'list'],
      ['Yam', 'Yamaha', 'list'],
    ])
  })

  it('reads nothing where two suppliers begin with the letters, or the code is under three', () => {
    const two: SupplierElsewhere[] = [
      { list: 'Haines Signature Factory Packages', supplier: 'Haines Signature', lines: 1, of: 1 },
      { list: 'Dunbier / Haines BMT', supplier: 'Haines / Dunbier BMT', lines: 1, of: 1 },
    ]
    expect(supplierReadings([{ maker: 'HAI', heading: 'TRAILER PARTS' }], two)).toEqual([])
    expect(supplierReadings([{ maker: 'YA', heading: 'X' }], [yamaha]).map((r) => r.code)).toEqual(
      [],
    )
    /* the supplier's word must be longer than the code: a code is not read as itself */
    expect(
      supplierReadings(
        [{ maker: 'GFAB', heading: 'X' }],
        [{ list: 'GFAB Trailers', supplier: 'GFAB', lines: 1, of: 1 }],
      ),
    ).toEqual([])
  })

  it('falls back to the headings where no list names the code, and every line must agree', () => {
    const lines = [
      { maker: 'LOW', heading: 'LOWRANCE' },
      { maker: 'LOW', heading: 'LOWRANCE' },
      { maker: 'GAR', heading: 'GARMIN STRIKER' },
      { maker: 'GAR', heading: 'NMEA 2000' },
    ]
    expect(supplierReadings(lines, [])).toEqual([
      { code: 'LOW', name: 'Lowrance', from: 'heading', agree: 2, lines: 2 },
    ])
  })

  it('says a maker’s words as the price list writes them, casing a shouted word by its list', () => {
    expect(makerWords('EPROPULSION - Electric Outboards', ['ePropulsion Outboards'])).toBe(
      'ePropulsion',
    )
    expect(makerWords('Telwater Pty Ltd', ['Stacer Trailers'])).toBe('Telwater Pty Ltd')
    expect(makerWords('DUNBIER', ['Mackay Trailers'])).toBe('Dunbier')
  })

  it('says Northside’s own name over the reading, and the reading where it gave none', () => {
    const readings = supplierReadings([{ maker: 'YAM', heading: 'X' }], [yamaha])
    expect(saidNames(readings, undefined)).toEqual({ YAM: 'Yamaha' })
    expect(saidNames(readings, { YAM: 'Yamaha Motor', LOW: ' ' })).toEqual({ YAM: 'Yamaha Motor' })
  })

  it('reads every list but the parts with a field called Supplier', () => {
    const entities = {
      parts: { id: 'parts', name: 'Parts', fields: [{ id: 'p.d', name: 'Supplier' }] },
      mot: { id: 'mot', name: 'Yamaha Outboards', fields: [{ id: 'm.q', name: 'Supplier' }] },
      oils: { id: 'oils', name: 'Oils', fields: [{ id: 'o.c', name: 'Consumable' }] },
    } as unknown as Record<string, EntityDef>
    const row = (v: Record<string, unknown>) => ({ values: v }) as unknown as RowData
    const rows = {
      parts: [row({ 'p.d': 'YAM' })],
      mot: [row({ 'm.q': 'Yamaha' }), row({ 'm.q': ' Yamaha ' }), row({})],
    }
    expect(suppliersElsewhere(entities, rows, 'parts')).toEqual([
      { list: 'Yamaha Outboards', supplier: 'Yamaha', lines: 2, of: 3 },
    ])
  })
})

describe('the readings, on the live price list', () => {
  let pack: PackFixture
  let lines: {
    id: string
    name: string
    product: string
    code: string
    heading: string
    maker: string
  }[]
  beforeAll(async () => {
    pack = await loadPack()
    const text = (v: unknown): string =>
      typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : ''
    lines = sellableRows(pack.rowsByEntity[pack.byKey('parts').id] ?? []).map((row) => ({
      id: row.id,
      name: text(row.values['parts.c']),
      product: text(row.values['parts.c']),
      code: text(row.values['parts.e']),
      heading: text(row.values['parts.cat']),
      maker: text(row.values['parts.d']),
    }))
  })

  it('reads YAM and Yam as Yamaha off the Yamaha Outboards, and LOW, GAR and SIM off their headings', () => {
    const elsewhere = suppliersElsewhere(pack.ctx.entities, pack.rowsByEntity, 'parts')
    expect(elsewhere).toContainEqual({
      list: 'Yamaha Outboards',
      supplier: 'Yamaha',
      lines: 209,
      of: 209,
    })
    const readings = supplierReadings(lines, elsewhere)
    const said = readings.map((r) => [r.code, r.name, r.from])
    expect(said).toContainEqual(['YAM', 'Yamaha', 'list'])
    expect(said).toContainEqual(['Yam', 'Yamaha', 'list'])
    expect(said).toContainEqual(['EPR', 'ePropulsion', 'list'])
    expect(said).toContainEqual(['LOW', 'Lowrance', 'heading'])
    expect(said).toContainEqual(['GAR', 'Garmin', 'heading'])
    expect(said).toContainEqual(['SIM', 'Simrad', 'heading'])
    /* 78 codes on the parts on sale; BBB, SAW, BLA and the rest are read as nothing */
    expect(said.map(([code]) => code)).not.toContain('BBB')
    expect(said.map(([code]) => code)).not.toContain('SAW')
  })

  it('finds all 671 Yamaha lines by the word, and counts YAM and Yam as one maker, on day one', () => {
    const readings = supplierReadings(
      lines,
      suppliersElsewhere(pack.ctx.entities, pack.rowsByEntity, 'parts'),
    )
    const names = saidNames(readings, undefined)
    const yam = lines.filter((l) => /^yam$/i.test(l.maker)).length
    expect(yam).toBe(671)
    const found = findLines(
      lines.map((l) => ({ ...l, makerSaid: supplierSaid(l.maker, names) })),
      'yamaha',
    ).found
    expect(found.filter((l) => /^yam$/i.test(l.maker)).length).toBe(671)
    expect(suppliersIn(lines, names).find((s) => s.said === 'Yamaha')).toMatchObject({
      codes: ['YAM', 'Yam'],
      lines: 671,
      named: true,
    })
    /* and the two codes are no longer offered as twins to name */
    expect(caseTwinsOf(lines, names)).toEqual([])
  })
})
