/* ============================================================
   THE NINE FIGURES OF A RIGGING KIT, read off Northside's own file:
   the Tiller Conversion Kit · F20G's every price, the counts behind
   each column, and the grid's arithmetic checked on every kit.
   ============================================================ */
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { readKitGrid, KIT_BUYERS, KIT_WAYS } from './kitGrid'
import { waysFor } from './ways'
import type { PriceLevel } from '@/domain/model'

let pack: PackFixture

beforeAll(async () => {
  pack = await loadPack()
})

const f20g = () =>
  (pack.rowsByEntity.rig_kits ?? []).find((r) => r.values['rig_kits.d'] === '9YA_TCK_F20G')!

describe('the rigging kits grid', () => {
  it('reads all nine columns, by the file’s own names and cells', () => {
    const kits = pack.byKey('rig_kits')
    const grid = readKitGrid(kits, pack.rowsByEntity.rig_kits ?? [], [], null)!
    const cells = KIT_WAYS.map((w) => KIT_BUYERS.map((b) => grid.cells[w][b].cell))
    expect(cells).toEqual([
      ['Rigging Kits!K', 'Rigging Kits!L', 'Rigging Kits!M'],
      ['Rigging Kits!V', 'Rigging Kits!W', 'Rigging Kits!X'],
      ['Rigging Kits!AC', 'Rigging Kits!AD', 'Rigging Kits!AE'],
    ])
    const held = KIT_WAYS.map((w) => KIT_BUYERS.map((b) => grid.cells[w][b].held))
    expect(held).toEqual([
      [628, 628, 628],
      [621, 621, 621],
      [642, 621, 621],
    ])
  })

  it('checks fitted as supplied plus fitting for each buyer, and the sub-dealer against trade', () => {
    const kits = pack.byKey('rig_kits')
    const grid = readKitGrid(kits, pack.rowsByEntity.rig_kits ?? [], [], null)!
    expect(grid.sums).toEqual({
      customer: { holds: 621, of: 642 },
      trade: { holds: 621, of: 621 },
      sub: { holds: 621, of: 621 },
    })
    expect(grid.subIsTrade).toEqual({
      supplied: { holds: 628, of: 628 },
      fitting: { holds: 621, of: 621 },
      fitted: { holds: 621, of: 621 },
    })
  })

  it('marks the cells a quote reads under supplied-or-fitted, and reads one kit’s figures', () => {
    const kits = pack.byKey('rig_kits')
    const supplied = waysFor(kits, pack.rowsByEntity.rig_kits ?? []).find(
      (w) => w.id === 'supplied',
    )!
    const ladder: PriceLevel[] = supplied.rungs.map((r) => ({
      key: r.key,
      label: r.label,
      fieldId: r.fieldId,
      scope: r.key === 'cash' || r.key === 'trade' ? 'quote' : 'line',
    }))
    const grid = readKitGrid(kits, pack.rowsByEntity.rig_kits ?? [], ladder, f20g())!
    expect(KIT_WAYS.map((w) => KIT_BUYERS.map((b) => grid.cells[w][b].key))).toEqual([
      ['cash', 'trade', null],
      [null, null, null],
      ['fitted', 'fitted-trade', null],
    ])
    expect(KIT_WAYS.map((w) => KIT_BUYERS.map((b) => grid.cells[w][b].figure))).toEqual([
      [900, 855, 855],
      [160, 152, 152],
      [1060, 1007, 1007],
    ])
  })

  it('has no grid for a list without the nine columns', () => {
    expect(readKitGrid(pack.byKey('mot_yamaha'), [], [], null)).toBeNull()
  })
})
