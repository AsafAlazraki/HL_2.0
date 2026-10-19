import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import { rowLabel, type QuoteDef, type QuoteLine, type RowData } from '@/domain/model'
import { apply, isDone, mintQuoteFromView, quoteTotals, removeLine } from '@/domain/quote'
import { hullTakesTwo, kitGoesWith, nameKey, orphanedKits, swapLines } from './swap'

/* ============================================================
   A CHANGE OF MIND AS ONE COMMAND, on the real pack (build-close-
   critique.md, 2026-10-19, majors 1 and 2). Every figure is the
   engine's own; nothing is typed but the names the file writes.
   ============================================================ */

const pack = await loadPack()
const ctx = pack.ctx

function quoteOn(key: string, find: (label: string) => boolean): QuoteDef {
  const table = pack.byKey(key)
  const row = ((pack.rowsByEntity[table.id] ?? []) as RowData[]).find((r) =>
    find(rowLabel(table, r)),
  )
  expect(row, `${key} has no such row`).toBeDefined()
  const view = createViewFor(ctx, table.id)
  return mintQuoteFromView(ctx, { viewId: view.id, rowId: row!.id, reference: 'SWAP' })!
}

const sea = quoteOn(
  'boat_stacer',
  (l) => l.includes('519 Sea Ranger SDF') && l.includes('Centre Console'),
)
const motorOf = (q: QuoteDef): QuoteLine =>
  q.lines.find((l) => l.entityId === 'mot_yamaha' || l.label.startsWith('Yamaha - '))!
const kitOf = (q: QuoteDef): QuoteLine => q.lines.find((l) => kitGoesWith(l, motorOf(q)))!

describe('the rigging kit a motor names', () => {
  it('reads the file’s own names, letters and figures in order, never by resemblance', () => {
    expect(nameKey('Yamaha - F90LB')).toBe(nameKey('Yamaha · F90LB'))
    expect(nameKey('Yamaha - F90LB')).not.toBe(nameKey('Yamaha - F90LB2 - White'))
    const motor = motorOf(sea)
    const kit = kitOf(sea)
    expect(kit, 'the 519 carries the F90LB’s kit as it is minted').toBeDefined()
    expect(kitGoesWith(kit, motor)).toBe(true)
    expect(orphanedKits(sea)).toEqual([])
  })

  it('names a kit left on the quote for a motor that has gone', () => {
    const motor = motorOf(sea)
    const off = apply(sea, removeLine(motor.id), '2026-10-19T00:00:00.000Z')
    if (!isDone(off)) throw new Error('the motor would not come off')
    const found = orphanedKits(off.next)
    expect(found.map((o) => o.line.id)).toEqual([kitOf(sea).id])
    expect(nameKey(found[0]!.motor)).toBe(nameKey(motor.label))
  })
})

describe('a swap is one step with one way back', () => {
  const motor = motorOf(sea)
  const kit = kitOf(sea)
  const other = { ...motor, id: 'other-motor', label: 'Yamaha - F115LB' }
  const swap = {
    off: [motor.id, kit.id],
    on: [{ blockId: sea.sections.find((s) => s.lineIds.includes(motor.id))!.blockId, line: other }],
    said: 'on instead',
    back: 'back again',
  }

  it('takes off and puts on in one event, and its way back puts back exactly what was there', () => {
    const done = apply(sea, swapLines(swap), '2026-10-19T00:00:00.000Z')
    if (!isDone(done)) throw new Error('the swap was refused')
    expect(done.next.lines.some((l) => l.id === motor.id)).toBe(false)
    expect(done.next.lines.some((l) => l.id === kit.id)).toBe(false)
    expect(done.next.lines.some((l) => l.id === other.id)).toBe(true)
    expect(done.next.events.length).toBe(sea.events.length + 1)
    expect(done.said).toBe('on instead')

    const back = apply(done.next, done.inverse, '2026-10-19T00:00:01.000Z')
    if (!isDone(back)) throw new Error('the way back was refused')
    expect(back.said).toBe('back again')
    expect(back.next.lines).toEqual(sea.lines)
    expect(back.next.sections).toEqual(sea.sections)
    expect(quoteTotals(back.next).total).toBe(quoteTotals(sea).total)

    /* and the way back from the way back is the swap again */
    const again = apply(back.next, back.inverse, '2026-10-19T00:00:02.000Z')
    if (!isDone(again)) throw new Error('putting it back was refused')
    expect(again.next.lines.map((l) => l.id)).toEqual(done.next.lines.map((l) => l.id))
  })

  it('does nothing, and says nothing, on a document that moved since it was offered', () => {
    const off = apply(sea, removeLine(motor.id), '2026-10-19T00:00:00.000Z')
    if (!isDone(off)) throw new Error('the motor would not come off')
    expect(swapLines(swap)(off.next, '2026-10-19T00:00:01.000Z')).toEqual({ refused: '' })
  })
})

describe('whether the hull takes two motors', () => {
  it('reads the hull’s own power columns: a twin-rated Highfield yes, the 519 no', () => {
    expect(hullTakesTwo(ctx, sea)).toBe(false)
    const twin = quoteOn('boat_highfield', (l) => l.includes('PA860'))
    expect(hullTakesTwo(ctx, twin)).toBe(true)
  })
})
