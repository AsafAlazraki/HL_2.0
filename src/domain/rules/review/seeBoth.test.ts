/* ============================================================
   "SEE BOTH" ON TWO HEADINGS OF ONE NAME, measured on the real lists:
   Rigging Kits' two "Trade Price" headings stand in Kit Pricing
   (letter L) and Total (letter AD), its name in Identity; Dealer Fit
   Packages' two "Code" headings stand in Identity and Primary
   Accessory.
   ============================================================ */

import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { foldedBesides, seeBothSearch } from './seeBoth'

const pack = await loadPack()
const table = (id: string) => pack.entities.find((e) => e.id === id)!

describe('See both, on two headings of one name', () => {
  it('folds every section that holds neither heading nor the line’s name', () => {
    expect(foldedBesides(table('rig_kits'), ['rig_kits.l', 'rig_kits.ad'])).toEqual([
      'install',
      'contents',
      'cable-options',
      'source',
    ])
    expect(foldedBesides(table('dealer_fit'), ['dealer_fit.d', 'dealer_fit.u'])).toEqual([
      'supply',
      'rigging',
      'fitted',
      'source',
    ])
  })

  it('opens Every column with the two lit', () => {
    expect(seeBothSearch(table('rig_kits'), ['rig_kits.l', 'rig_kits.ad'])).toBe(
      '?door=every&col=rig_kits.l,rig_kits.ad&fold=install,contents,cable-options,source',
    )
  })
})
