/* ============================================================
   THE BUILD'S ADD, ON THE REAL PRICE LIST: the SP660's GFAB, over its
   ATM, is refused with Fitment's own sentence on a quote started from
   Fitment (the fitment verifier, 2026-11-03: one press put it on at
   $111,778 with no word); the REDCO, which clears it, is not.
   ============================================================ */
import { describe, expect, it, vi } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { makeCtx, type QuoteDef } from '@/domain/model'
import { createViewFor } from '@/domain/catalogue/views'
import { mintQuoteFromView } from '@/domain/quote/freeze'
import { addLine } from '@/domain/quote/commands'
import { readBoatFit } from './boat'
import { pickedLines, riggedOf } from './rigged'
import { atmOnQuote } from './quoteAtm'

vi.setConfig({ testTimeout: 60_000 })

const pack = await loadPack()
const world = makeCtx({ ...pack.ctx, views: { ...pack.ctx.views }, orgId: 'northside' })
const SP660 = { tableId: 'boat_highfield', rowId: 'boat_highfield:513' }
const fit = readBoatFit(world, SP660)!

/** The SP660's quote with the F200XC on it, as Fitment's Start makes it. */
function startedWithF200XC(): QuoteDef {
  const view = createViewFor(world, SP660.tableId)
  let quote = mintQuoteFromView(world, {
    viewId: view.id,
    rowId: SP660.rowId,
    reference: 'T-1',
    hullAlone: true,
  })!
  const rig = riggedOf(world, fit).find((r) => r.model === 'F200XC')!
  const { adds } = pickedLines(world, quote, [{ tableId: rig.motor.place.tableId, key: rig.key }])
  for (const add of adds) {
    const done = addLine(add.blockId, add.line)(quote, '2026-11-03T00:00:00.000Z')
    if ('refused' in done) throw new Error(done.refused)
    quote = done.next
  }
  return quote
}

/** The trailer's line the build would put on, minted as its candidate. */
function trailerLine(quote: QuoteDef, starred: boolean) {
  const t = fit.trailer!.made.find((m) => m.starred === starred)!
  const { adds } = pickedLines(world, quote, [{ tableId: t.place.tableId, key: t.key }])
  return { name: t.name, line: adds[0]!.line }
}

describe('a trailer over its ATM, pressed on the build', () => {
  it('refuses the GFAB with its figures, weighed with the motor on the quote', () => {
    const quote = startedWithF200XC()
    const gfab = trailerLine(quote, false)
    /* the SP660 740 kg, the F200XC 227 kg and the GFAB's own 1,990 kg against its 2,200 kg ATM */
    expect(atmOnQuote(world, quote, [gfab.line])).toBe(
      `The ${gfab.name} is rated 2,200 kg and would carry 2,957 kg, 757 kg over, so it is not put on the quote. Its ATM decides that.`,
    )
  })

  it('refuses nothing for the REDCO, which clears it, nor for a line that is not a trailer', () => {
    const quote = startedWithF200XC()
    const redco = trailerLine(quote, true)
    expect(atmOnQuote(world, quote, [redco.line])).toBe('')
    expect(atmOnQuote(world, quote, [])).toBe('')
  })

  it('weighs the boat alone where the quote carries no motor, and the motor swapped in', () => {
    const view = createViewFor(world, SP660.tableId)
    const bare = mintQuoteFromView(world, {
      viewId: view.id,
      rowId: SP660.rowId,
      reference: 'T-2',
      hullAlone: true,
    })!
    const gfab = trailerLine(bare, false)
    expect(atmOnQuote(world, bare, [gfab.line])).toMatch(/would carry 2,730 kg, 530 kg over/)
    const quote = startedWithF200XC()
    const motorId = quote.lines.find((l) => world.entities[l.entityId]?.kind === 'motor')!.id
    expect(atmOnQuote(world, quote, [gfab.line], [motorId])).toMatch(/would carry 2,730 kg/)
  })
})
