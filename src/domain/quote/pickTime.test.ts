/* ============================================================
   THE TWO ACTS THAT READ THE SHEET AFTER THE QUOTE EXISTS.

   Everything else on a document is frozen at the mint and never
   looks at the catalogue again. Two acts deliberately do look, and
   both are arguable enough to be worth asserting against the real
   file rather than a fixture:

     · REFINISH — the same boat in another finish. Porsche's rail
       opens on a swatch grid and pressing a swatch changes the
       colour of the car without touching anything else on the
       build. Here the finish is a ROW, so it means re-rooting the
       quote on a sibling row: the subject re-minted from that row at
       the quote's own rung, and every other line left exactly where
       it was. Nothing about a motor or a trailer is a fact about the
       hull's colour.

     · RE-READING TODAY'S PRICES — two decisions, never one.
       `priceChanges` says what WOULD move and changes nothing;
       `applyPriceChanges` moves it. A silent restatement is worse
       than a stale number, because the salesperson believes the
       page.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { rowLabel, type QuoteDef, type RowData } from '@/domain/model'
import { loadPack } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import { apply, applyPriceChanges, isDone, refinish } from './commands'
import { mintQuoteFromView, priceChanges } from './freeze'

const NOW = '2026-09-17T02:00:00.000Z'

const pack = await loadPack()
const ctx = pack.ctx
const stacer = pack.byKey('boat_stacer')
const rows = pack.rowsByEntity[stacer.id] ?? []

/* THE HULL AND ITS SIBLING, both found by asking rather than by
   naming a row id: a row id typed into a test is a test that goes
   green on the wrong boat the first time the seed is regenerated. */
const subject = rows.find(
  (r: RowData) => rowLabel(stacer, r) === 'Stacer - 529 Assault Pro (Tournament)',
)
const sibling = rows.find((r: RowData) => r.id !== subject?.id)

function quoteIt(): QuoteDef {
  expect(subject).toBeDefined()
  const view = createViewFor(ctx, stacer.id)
  const quote = mintQuoteFromView(ctx, {
    viewId: view.id,
    rowId: (subject as RowData).id,
    reference: 'PICK-0001',
  })
  expect(quote).not.toBeNull()
  return quote as QuoteDef
}

describe('the same boat in another finish', () => {
  it('re-roots the subject and leaves every other line where it was', () => {
    const quote = quoteIt()
    expect(sibling).toBeDefined()
    const others = quote.lines.filter((l) => l.entityId !== stacer.id)
    expect(others.length).toBeGreaterThan(0)

    const outcome = apply(quote, refinish(ctx, (sibling as RowData).id), NOW)
    expect(isDone(outcome)).toBe(true)
    if (!isDone(outcome)) return

    const next = outcome.next
    expect(next.rootRowId).toBe((sibling as RowData).id)
    expect(next.subjectLabel).toBe(rowLabel(stacer, sibling as RowData))
    expect(next.subjectLabel).not.toBe(quote.subjectLabel)
    /* the subject line is a fresh freeze of the sibling; every other
       line is the SAME OBJECT it was */
    expect(next.lines.filter((l) => l.entityId !== stacer.id)).toEqual(others)
    expect(next.levelKey).toBe(quote.levelKey)
    expect(outcome.event.kind).toBe('subject-refinished')
  })

  it('goes back to the finish it was on, keeping a line picked in between', () => {
    const quote = quoteIt()
    const forward = apply(quote, refinish(ctx, (sibling as RowData).id), NOW)
    if (!isDone(forward)) throw new Error('refinish refused')

    const back = apply(forward.next, forward.inverse, NOW)
    if (!isDone(back)) throw new Error('the way back refused')
    expect(back.next.rootRowId).toBe(quote.rootRowId)
    expect(back.next.subjectLabel).toBe(quote.subjectLabel)
    expect(back.next.subjectSpecs).toEqual(quote.subjectSpecs)
  })

  it('refuses a row that is not on the sheet, rather than emptying the quote', () => {
    const quote = quoteIt()
    const outcome = apply(quote, refinish(ctx, 'row-that-does-not-exist'), NOW)
    expect(isDone(outcome)).toBe(false)
  })

  it('does nothing when it is already that row', () => {
    const quote = quoteIt()
    const outcome = apply(quote, refinish(ctx, quote.rootRowId), NOW)
    expect(isDone(outcome)).toBe(false)
  })
})

describe('re-reading today’s prices is a diff before it is a write', () => {
  it('reports nothing to do when the sheet has not moved', () => {
    /* the quote was minted from THIS context a moment ago, so
       today's prices are the quote's prices */
    expect(priceChanges(ctx, quoteIt())).toEqual([])
  })

  it('reports a line whose row has left the sheet as gone, and never zeroes it', () => {
    const quote = quoteIt()
    const orphan: QuoteDef = {
      ...quote,
      lines: quote.lines.map((l) => ({ ...l, rowId: 'row-that-does-not-exist' })),
    }
    const changes = priceChanges(ctx, orphan)
    expect(changes.length).toBe(orphan.lines.length)
    for (const c of changes) {
      expect(c.gone).toBe(true)
      /* the frozen figure stands: the quote never needed the row to
         print, and a line zeroed because a row moved would be a
         different document */
      const was = orphan.lines.find((l) => l.id === c.lineId)
      expect(c.from).toBe(was?.unitPrice)
      expect(c.to).toBe(was?.unitPrice)
    }
    /* and applying a diff of nothing but `gone` lines changes nothing */
    expect(isDone(apply(orphan, applyPriceChanges(changes), NOW))).toBe(false)
  })

  it('moves a line whose price really did move, and puts it back', () => {
    const quote = quoteIt()
    /* the sheet moves under the document: the hull's cash rung goes
       up by a thousand, which is what a reimport looks like */
    const hull = quote.lines[0]
    const stale: QuoteDef = {
      ...quote,
      lines: [{ ...hull, unitPrice: (hull.unitPrice ?? 0) - 1000 }, ...quote.lines.slice(1)],
    }
    const changes = priceChanges(ctx, stale)
    const forHull = changes.find((c) => c.lineId === hull.id)
    expect(forHull).toBeDefined()
    expect(forHull?.gone).toBe(false)
    expect(forHull?.to).toBe(hull.unitPrice)

    const outcome = apply(stale, applyPriceChanges(changes), NOW)
    if (!isDone(outcome)) throw new Error('applyPriceChanges refused')
    expect(outcome.next.lines[0].unitPrice).toBe(hull.unitPrice)
    expect(outcome.event.kind).toBe('prices-reread')

    const back = apply(outcome.next, outcome.inverse, NOW)
    if (!isDone(back)) throw new Error('the way back refused')
    expect(back.next.lines[0].unitPrice).toBe((hull.unitPrice ?? 0) - 1000)
  })
})
