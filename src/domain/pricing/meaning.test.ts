/* What a price column is, and its rule checked on Northside's own price list. Every count here
   is measured off the pack; none is typed into the module. */
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import type { EntityDef } from '@/domain/model'
import { cellOf, checkField, meaningOf } from './meaning'

let pack: PackFixture
const table = (id: string): EntityDef => pack.entities.find((e) => e.id === id)!
const field = (id: string, fieldId: string) => table(id).fields.find((f) => f.id === fieldId)!
const check = (id: string, fieldId: string) =>
  checkField(table(id), pack.rowsByEntity[id] ?? [], field(id, fieldId))

beforeAll(async () => {
  pack = await loadPack()
})

describe('what a figure is', () => {
  it('says Dealer Fit’s Act Sell is the whole package fitted, and Sell its first accessory alone', () => {
    const act = meaningOf(table('dealer_fit'), field('dealer_fit', 'dealer_fit.r'))!
    expect(act.cell).toBe('Dealer Fit Module!R')
    expect(act.said).toMatch(/^The whole package fitted/)
    expect(act.formula).toContain('Parts Sell + Labour Ret')
    const sell = meaningOf(table('dealer_fit'), field('dealer_fit', 'dealer_fit.w'))!
    expect(sell.cell).toBe('Dealer Fit Module!W')
    expect(sell.said).toMatch(/primary accessory alone/)
  })

  it('tells Rigging Kits’ two Trade Prices apart by the column before them', () => {
    const kit = meaningOf(table('rig_kits'), field('rig_kits', 'rig_kits.l'))!
    const fitted = meaningOf(table('rig_kits'), field('rig_kits', 'rig_kits.ad'))!
    expect(kit.said).toMatch(/kit alone, supplied/)
    expect(fitted.said).toMatch(/kit fitted/)
    expect(fitted.cell).toBe('Rigging Kits!AD')
  })

  it('says no rule for a motor’s RRP + Freight Inc GST, which the file does not keep', () => {
    const rrp = meaningOf(table('mot_yamaha'), field('mot_yamaha', 'mot_yamaha.bb'))!
    expect(rrp.formula).toBe('')
    expect(check('mot_yamaha', 'mot_yamaha.bb')).toBeNull()
  })

  it('reads the cell off the column’s own record, and nothing where it names none', () => {
    expect(cellOf({ description: 'Boat Module!QR · labelled here by header row 3.' })).toBe(
      'Boat Module!QR',
    )
    expect(cellOf({ description: 'Workbook sheet and row this record was read from.' })).toBe('')
  })
})

describe('the workbook’s rule, checked on every line', () => {
  it('holds Act Sell’s formula on 1,721 of the 1,733 lines that hold it', () => {
    expect(check('dealer_fit', 'dealer_fit.r')).toEqual({ holds: 1721, of: 1733 })
  })

  it('finds Sell never above the package’s Parts Sell', () => {
    expect(check('dealer_fit', 'dealer_fit.w')).toEqual({ holds: 789, of: 789 })
  })

  it('finds a kit’s Sell Price is its kit plus its fitting, and its fitted trade the same sum', () => {
    expect(check('rig_kits', 'rig_kits.ac')).toEqual({ holds: 621, of: 642 })
    expect(check('rig_kits', 'rig_kits.ad')).toEqual({ holds: 621, of: 621 })
    expect(check('rig_kits', 'rig_kits.m')).toEqual({ holds: 628, of: 628 })
  })

  it('finds every boat’s Warranty at or under landed cost plus 1% and GST', () => {
    for (const id of ['boat_stacer', 'boat_highfield', 'boat_formosa']) {
      const c = check(id, `${id}.rb`)!
      expect(c.holds).toBe(c.of)
      expect(c.of).toBeGreaterThan(0)
    }
  })
})
