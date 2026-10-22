/* ============================================================
   ONE BOAT, ONE TRAILER — the rule, and the SP660 it was found on.

   A new SP660 quote brought both the starred REDCO from NSM Custom and the
   lone GFAB tandem: GFAB $24,723 and REDCO $12,643, the trailer section
   $37,366 (e2e/out/document-Lb7JK_gGkY.pdf page 2). The rule is asserted
   on its own and then on the real mint.
   ============================================================ */
import { describe, expect, it, vi } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { rowLabel } from '@/domain/model'
import { createViewFor } from '@/domain/catalogue/views'
import { mintQuoteFromView } from '@/domain/quote/freeze'
import { whatComesAcross } from './oneTrailer'

/* the second case mints a quote for every boat on the price list, 810 of them */
vi.setConfig({ testTimeout: 60_000 })

describe('the rule', () => {
  it('lets the star win across every trailer list', () => {
    const across = whatComesAcross([
      { id: 'nsm', kind: 'trailer', starred: [false, true] },
      { id: 'gfab', kind: 'trailer', starred: [false] },
    ])
    expect(across.get('nsm')).toEqual([1])
    expect(across.get('gfab')).toEqual([])
  })

  it('brings the first starred trailer only, where two lists each star one', () => {
    const across = whatComesAcross([
      { id: 'a', kind: 'trailer', starred: [true] },
      { id: 'b', kind: 'trailer', starred: [true] },
    ])
    expect(across.get('a')).toEqual([0])
    expect(across.get('b')).toEqual([])
  })

  it('brings a lone trailer across, and none where there is a real choice', () => {
    expect(whatComesAcross([{ id: 'a', kind: 'trailer', starred: [false] }]).get('a')).toEqual([0])
    const two = whatComesAcross([
      { id: 'a', kind: 'trailer', starred: [false] },
      { id: 'b', kind: 'trailer', starred: [false] },
    ])
    expect(two.get('a')).toEqual([])
    expect(two.get('b')).toEqual([])
  })

  it('leaves every other kind to the rule it always had', () => {
    const across = whatComesAcross([
      { id: 'm', kind: 'motor', starred: [false, true, true] },
      { id: 'one', kind: 'accessory', starred: [false] },
      { id: 'many', kind: 'package', starred: [false, false] },
    ])
    expect(across.get('m')).toEqual([1, 2])
    expect(across.get('one')).toEqual([0])
    expect(across.get('many')).toEqual([])
  })
})

const pack = await loadPack()
const ctx = { ...pack.ctx, views: { ...pack.ctx.views } }

describe('on the real price list', () => {
  it('starts an SP660 quote with the starred REDCO and no GFAB beside it', () => {
    const highfield = pack.byKey('boat_highfield')
    const sp660 = (pack.rowsByEntity[highfield.id] ?? []).find(
      (r) => rowLabel(highfield, r) === 'Highfield - SP660 (PVC) W-W-WB',
    )!
    const view = createViewFor(ctx, highfield.id)
    const quote = mintQuoteFromView(ctx, { viewId: view.id, rowId: sp660.id, reference: 'T-2' })!
    const trailers = quote.sections.filter((s) => ctx.entities[s.tableId]?.kind === 'trailer')
    expect(trailers.map((s) => [s.title, s.lineIds.length, s.pickedCount])).toEqual([
      ['NSM Custom Trailers', 1, 1],
      ['GFAB Trailers', 0, 1],
    ])
    const on = quote.lines.filter((l) => ctx.entities[l.entityId]?.kind === 'trailer')
    expect(on).toHaveLength(1)
    expect(on[0]?.label).toContain('TA600T-MOB')
    expect(on[0]?.unitPrice).toBe(12643)
  })

  it('never starts any boat’s quote with two trailers', () => {
    let twice = 0
    let boats = 0
    for (const table of pack.entities) {
      if (table.kind !== 'boat') continue
      const view = createViewFor(ctx, table.id)
      for (const row of pack.rowsByEntity[table.id] ?? []) {
        const quote = mintQuoteFromView(ctx, { viewId: view.id, rowId: row.id, reference: 'T' })
        if (!quote) continue
        boats += 1
        const trailers = quote.lines.filter((l) => ctx.entities[l.entityId]?.kind === 'trailer')
        if (trailers.length > 1) twice += 1
      }
    }
    expect(boats).toBeGreaterThan(800)
    expect(twice).toBe(0)
  })
})
