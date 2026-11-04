import { describe, expect, it } from 'vitest'
import { rowLabel, type QuoteDef, type RowData } from '@/domain/model'
import { loadPack } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import { mintQuoteFromView } from './freeze'
import { draftsBehind, listMovedOn, listMovedSay, quoteName } from './listMoved'
import { spokenBoat } from './spoken'

/* ============================================================
   THE PRICE LIST MOVED UNDER A QUOTE BEING WRITTEN, said and never
   written: over the real pack, a quote minted from it, and the same
   quote with its hull kept a thousand dollars under the price list —
   which is what a quote looks like after a new price list is applied.
   ============================================================ */

const pack = await loadPack()
const ctx = pack.ctx
const stacer = pack.byKey('boat_stacer')
const subject = (pack.rowsByEntity[stacer.id] ?? []).find(
  (r: RowData) => rowLabel(stacer, r) === 'Stacer - 529 Assault Pro (Tournament)',
)

function quoteIt(): QuoteDef {
  expect(subject).toBeDefined()
  const view = createViewFor(ctx, stacer.id)
  const quote = mintQuoteFromView(ctx, {
    viewId: view.id,
    rowId: (subject as RowData).id,
    reference: '20261104-01',
  })
  expect(quote).not.toBeNull()
  return quote as QuoteDef
}

function behind(quote: QuoteDef, by: number): QuoteDef {
  const hull = quote.lines[0]!
  return {
    ...quote,
    lines: [{ ...hull, unitPrice: (hull.unitPrice ?? 0) - by }, ...quote.lines.slice(1)],
  }
}

describe('a quote being written whose price list moved', () => {
  it('says nothing where the price list reads what the quote keeps', () => {
    const quote = quoteIt()
    expect(listMovedOn(ctx, quote)).toEqual([])
    expect(listMovedSay([])).toBe('')
    expect(draftsBehind(ctx, [quote])).toEqual([])
  })

  it('names the line, the price it keeps and the one the price list reads, and counts the difference', () => {
    const quote = quoteIt()
    const hull = quote.lines[0]!
    const stale = behind(quote, 1000)
    const moved = listMovedOn(ctx, stale)
    expect(moved).toHaveLength(1)
    expect(moved[0]!.lineId).toBe(hull.id)
    expect(moved[0]!.keeps).toBe((hull.unitPrice ?? 0) - 1000)
    expect(moved[0]!.reads).toBe(hull.unitPrice)
    /* the hull is named as the quote heads itself, never by the file's own cell */
    expect(moved[0]!.name).toBe(spokenBoat(stacer.id, quote.subjectLabel).say)
    expect(moved[0]!.name).not.toContain(' - ')

    const drafts = draftsBehind(ctx, [stale])
    expect(drafts).toHaveLength(1)
    expect(drafts[0]!.reference).toBe('20261104-01')
    expect(drafts[0]!.name).toBe(quoteName(stale))
    expect(drafts[0]!.by).toBe(1000 * hull.qty)
    expect(drafts[0]!.customer).toBeNull()
  })

  it('says it in one sentence, both figures in it, and the press is left to the person', () => {
    const quote = quoteIt()
    const hull = quote.lines[0]!
    const said = listMovedSay(listMovedOn(ctx, behind(quote, 1000)))
    const to = (hull.unitPrice ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })
    expect(said).toMatch(/^The price list now reads \$/)
    expect(said).toContain(to)
    expect(said).toContain('the price it had when it was chosen')
  })

  it('never reads a quote already given: its prices are final', () => {
    const given: QuoteDef = { ...behind(quoteIt(), 1000), state: 'issued' }
    expect(listMovedOn(ctx, given)).toEqual([])
    expect(draftsBehind(ctx, [given])).toEqual([])
  })
})
