/* A figure under nought on the real price list: a credit where the file names one, and no price
   anywhere else. Every figure is the price list's own. */
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { priceIn, underNoughtIn } from '@/domain/catalogue/priceCommands'
import { sellColumns } from './unchosen'
import { isCredit } from './credit'

let pack: PackFixture

beforeAll(async () => {
  pack = await loadPack()
})

describe('a figure under nought', () => {
  it('stands in a sell column on seven lines of the whole file: two Parts credits and five Jeanneau packages', () => {
    const found: Array<[string, string, number, boolean]> = []
    for (const t of pack.entities)
      for (const r of pack.rowsByEntity[t.id] ?? [])
        for (const f of sellColumns(t)) {
          const v = r.values[f.id]
          if (typeof v === 'number' && v < 0) found.push([t.id, f.name, v, isCredit(r)])
        }
    const lines = new Set(found.map(([t, , v]) => `${t}:${v}`))
    expect(lines.size).toBe(7)
    expect(found.filter(([t]) => t === 'parts').every(([, , , c]) => c)).toBe(true)
    expect(found.filter(([t]) => t === 'mot_pkg_jeanneau').some(([, , , c]) => c)).toBe(false)
    expect(
      [...new Set(found.filter(([t]) => t === 'mot_pkg_jeanneau').map(([, , v]) => v))].toSorted(
        (a, b) => a - b,
      ),
    ).toEqual([-29_390, -27_970, -21_690, -8_690, -2_030])
  })

  it('is a price on a credit and no price on a package', () => {
    const credit = pack.rowsByEntity.parts!.find((r) =>
      String(r.values['parts.c']).startsWith('CREDIT - Batteries'),
    )!
    expect([priceIn(credit, 'parts.l'), underNoughtIn(credit, 'parts.l')]).toEqual([-531, null])
    const pkg = pack.rowsByEntity.mot_pkg_jeanneau!.find(
      (r) => r.values['mot_pkg_jeanneau.d'] === '16L3AK',
    )!
    expect([
      priceIn(pkg, 'mot_pkg_jeanneau.bf'),
      underNoughtIn(pkg, 'mot_pkg_jeanneau.bf'),
    ]).toEqual([null, -29_390])
  })
})
