/* ============================================================
   WHAT REVIEW FINDS ON ONE LINE, WHERE IT IS PICKED — measured on the
   real price list. Dunbier carries two ALP 5.3M-13Bs: line 67 (the
   Fibreglass Boat one) is registered Small at 1,450 kg, line 55 is
   already Large. Parts 399 and 400 share one name at two prices.
   ============================================================ */

import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import type { EntityDef } from '@/domain/model'
import { bandReview, type ReviewWorld } from './checks'
import { wrongOnPick } from './onPick'

const pack = await loadPack()

function world(): ReviewWorld {
  const entities: Record<string, EntityDef> = {}
  for (const e of pack.entities) entities[e.id] = e
  return { entities, rowsByEntity: pack.rowsByEntity }
}

describe('Review’s word where a line is picked', () => {
  it('says a trailer registered as the wrong size, with what its rego is short', () => {
    expect(wrongOnPick(world(), 'trl_dunbier', 'trl_dunbier:67')).toEqual([
      'The price list registers it as Small, though it is rated 1,450 kg, so its rego is $117 short. Review has it.',
    ])
  })

  it('says nothing of the ALP 5.3M-13B already registered Large', () => {
    expect(wrongOnPick(world(), 'trl_dunbier', 'trl_dunbier:55')).toEqual([])
  })

  it('says a name at two prices, and which of the two this line is', () => {
    const said = wrongOnPick(world(), 'parts', 'parts:399')
    expect(said).toHaveLength(1)
    expect(said[0]).toMatch(
      /^Its name is at two prices in Parts & Accessories, \$129 and \$133 .+; this one is \$133\. Review has it\.$/,
    )
  })

  it('says nothing Northside left alone, and never a cost', () => {
    const w = world()
    const key = bandReview(w).lines.find((l) => l.rowId === 'trl_dunbier:67')!.key
    expect(wrongOnPick(w, 'trl_dunbier', 'trl_dunbier:67', { [key]: 'meant' })).toEqual([])
    for (const said of [
      ...wrongOnPick(w, 'trl_dunbier', 'trl_dunbier:67'),
      ...wrongOnPick(w, 'parts', 'parts:399'),
    ])
      expect(said).not.toMatch(/cost|margin/i)
  })
})
