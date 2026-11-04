/* ============================================================
   WHAT FITS HANDS BACK ONLY A DRAFT NOBODY HAS TOUCHED — read off the
   real price list (fit flow, round 2, walk 1, major 1: a second Start
   the quote reopened the earlier draft with its F130XA and ignored the
   F115XB the bar named).
   ============================================================ */
import { describe, expect, it, vi } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { makeCtx, type QuoteDef } from '@/domain/model'
import { createViewFor } from '@/domain/catalogue/views'
import { mintQuote } from '@/domain/quote'
import { addLine, isDone } from '@/domain/quote/commands'
import { readBoatFit } from './boat'
import { pickedLines, riggedOf } from './rigged'
import { handsBack, keptSaid, untouched } from './handBack'

vi.setConfig({ testTimeout: 60_000 })

const pack = await loadPack()
const ctx = pack.ctx
const SP660 = { tableId: 'boat_highfield', rowId: 'boat_highfield:513' }

/** A draft as the store files it: the mint's own event kept on it. */
function minted(reference: string): QuoteDef {
  const world = makeCtx({ ...ctx, views: { ...ctx.views }, orgId: 'northside' })
  const view = createViewFor(world, SP660.tableId)
  const made = mintQuote(world, {
    viewId: view.id,
    rowId: SP660.rowId,
    reference,
    hullAlone: true,
  })!
  return { ...made.quote, events: [...made.quote.events, made.event] }
}

describe('the draft What fits may start on', () => {
  it('is a draft nothing has been done to since it was made, the boat alone', () => {
    const fresh = minted('T-1')
    expect(fresh.lines.map((l) => l.rowId)).toEqual([SP660.rowId])
    expect(fresh.events.map((e) => e.kind)).toEqual(['minted'])
    expect(untouched(fresh)).toBe(true)
    expect(handsBack(fresh)).toBe(fresh)
    expect(keptSaid(fresh)).toBe('')
  })

  it('is never a draft that already carries a motor, which is kept as it was', () => {
    const world = makeCtx({ ...ctx, views: { ...ctx.views }, orgId: 'northside' })
    const fresh = minted('T-2')
    const fit = readBoatFit(ctx, SP660)!
    const rig = riggedOf(ctx, fit)[0]!
    const { adds } = pickedLines(world, fresh, [{ tableId: rig.motor.place.tableId, key: rig.key }])
    expect(adds).toHaveLength(1)
    const step = addLine(adds[0]!.blockId, adds[0]!.line)(fresh, fresh.createdAt)
    expect(isDone(step)).toBe(true)
    if (!isDone(step)) return
    const worked: QuoteDef = { ...step.next, events: [...step.next.events, step.event] }
    expect(worked.lines).toHaveLength(2)
    expect(untouched(worked)).toBe(false)
    expect(handsBack(worked)).toBeUndefined()
    expect(keptSaid(worked)).toBe(
      'Quote T-2 for this boat already holds work, so it is kept as it was.',
    )
  })

  it('is no draft at all where none stands, and says nothing', () => {
    expect(handsBack(undefined)).toBeUndefined()
    expect(keptSaid(undefined)).toBe('')
  })

  it('is never a given quote', () => {
    const given: QuoteDef = { ...minted('T-3'), state: 'issued' }
    expect(untouched(given)).toBe(false)
  })
})
