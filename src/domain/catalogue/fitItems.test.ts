import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { fitItemsOf } from './fitItems'

const pack = await loadPack()
const tables = Object.fromEntries(pack.entities.map((e) => [e.id, e]))
const items = fitItemsOf(tables, pack.rowsByEntity)
const of = (table: string) => items.filter((i) => i.tableId === table)

describe('the things a dealer fits, one by one', () => {
  it('names the parts, the packages (dealer fit and the makers’ motor packages), the rigging kits and the consumables, and nothing else', () => {
    expect(new Set(items.map((i) => i.tableId))).toEqual(
      new Set([
        'parts',
        'dealer_fit',
        'mot_pkg_haines',
        'mot_pkg_jeanneau',
        'rig_kits',
        'oils_lubes',
      ]),
    )
  })

  it('accounts for every named row of each register exactly once', () => {
    for (const table of ['parts', 'dealer_fit', 'rig_kits', 'oils_lubes']) {
      const display = tables[table]!.displayFieldId!
      const named = (pack.rowsByEntity[table] ?? []).filter(
        (r) => typeof r.values[display] === 'string' && String(r.values[display]).trim() !== '',
      )
      const listed = of(table).flatMap((i) => i.variants.map((v) => v.rowId))
      expect(listed.toSorted(), table).toEqual(named.map((r) => r.id).toSorted())
    }
  })

  it('makes one item of one name, and never joins two names that share a code', () => {
    for (const item of items) expect(item.variants.every((v) => v.label === item.name)).toBe(true)
    /* "Garmin - GPSMAP 1022xsv" and "GPSMAP 1022xsv" are both 010-01740-02, said two ways */
    const a = of('parts').find((i) => i.name === 'Garmin - GPSMAP 1022xsv')
    const b = of('parts').find((i) => i.name === 'GPSMAP 1022xsv')
    expect(a?.variants.map((v) => v.code)).toEqual(['010-01740-02'])
    expect(b?.variants.map((v) => v.code)).toEqual(['010-01740-02'])
    /* the file lists the WR10 under two headings with one code: one item, two rows */
    expect(of('parts').find((i) => i.name === 'WR10 Remote Only')?.variants).toHaveLength(2)
  })
})
