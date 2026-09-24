/* ============================================================
   A BOAT'S NOUGHT IS NO PRICE — against the real file.

   m2-last-critique.md blocker 1: the picker said the Haines Signature
   hulls carry no price, the build read $0, and the customer's paper
   printed "01 The hull $0 · Included" with "Your price" the trailer
   alone. Each case below is a place that disagreement lived, asked of a
   document the real engine minted off the real pack.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import type { EntityDef, FrozenLevel, QuoteDef } from '@/domain/model'
import { priceLevelsFor } from './pricing'
import { mintQuoteFromView, priceChanges } from './freeze'
import { INCLUDED, NOT_PRICED_HERE, readDocument } from './document'
import { issueBlockers, lineAmount, quoteTotals } from './totals'
import { apply, isDone, setOverride } from './commands'
import { levelConflict } from './conflict'
import {
  HULL_PRICE_REASON,
  HULL_UNPRICED_WHY,
  boatRungs,
  hullHasNoPrice,
  hullLineOf,
  hullPriceOf,
  readHullPrice,
} from './nought'

const pack = await loadPack()
const ctx = pack.ctx
const NOW = '2026-09-24T09:00:00.000Z'

const boats = pack.entities.filter((e) => e.kind === 'boat' && e.role !== 'join')

/** The boat rows whose every rung is a nought, per register. */
function noughts(): Array<{ entity: EntityDef; rowId: string }> {
  const out: Array<{ entity: EntityDef; rowId: string }> = []
  for (const entity of boats) {
    const levels = priceLevelsFor(entity)
    for (const row of pack.rowsByEntity[entity.id] ?? []) {
      if (levels.length > 0 && levels.every((l) => row.values[l.fieldId] === 0)) {
        out.push({ entity, rowId: row.id })
      }
    }
  }
  return out
}

/** A real quote on a boat the file holds at nought, addressed. */
function nought(): QuoteDef {
  const first = noughts()[0]
  const view = createViewFor(ctx, first.entity.id)
  const quote = mintQuoteFromView(ctx, { viewId: view.id, rowId: first.rowId, reference: 'NIL' })
  if (!quote) throw new Error('the file raised no quote on a nought boat')
  return { ...quote, customer: { name: 'R. Kelleher' } }
}

const hullOf = (quote: QuoteDef) =>
  readDocument(quote)
    .sections.flatMap((s) => s.tables)
    .find((t) => t.subject)!.lines[0]

describe('what the file carries', () => {
  it('holds a boat either at a figure or at a nought in every rung, never both', () => {
    let mixed = 0
    let nil = 0
    for (const entity of boats) {
      const levels = priceLevelsFor(entity)
      for (const row of pack.rowsByEntity[entity.id] ?? []) {
        const cells = levels.map((l) => row.values[l.fieldId])
        const zeros = cells.filter((v) => v === 0).length
        const figures = cells.filter((v) => typeof v === 'number' && v > 0).length
        if (zeros > 0 && figures > 0) mixed += 1
        if (zeros > 0 && figures === 0) nil += 1
      }
    }
    expect(mixed).toBe(0)
    /* measured 2026-09-24: nine Haines Signature and nine Formosa */
    expect(nil).toBe(noughts().length)
    expect(nil).toBeGreaterThan(0)
    expect(new Set(noughts().map((n) => n.entity.name))).toContain('Haines Signature')
  })
})

describe('boatRungs', () => {
  const rung = (key: string, value: number | null): FrozenLevel => ({
    key,
    label: key,
    fieldId: `t.${key}`,
    value,
    scope: 'quote',
  })
  const levels = [rung('cash', 0), rung('trade', 41_340), rung('warranty', null)]

  it('reads a boat’s nought as no figure and keeps every other figure', () => {
    expect(boatRungs({ kind: 'boat' }, levels).map((l) => l.value)).toEqual([null, 41_340, null])
  })

  it('leaves every other register alone, where a nought is the file’s “no charge”', () => {
    for (const kind of ['motor', 'trailer', 'part', undefined] as const) {
      expect(boatRungs(kind ? ({ kind } as EntityDef) : undefined, levels)).toEqual(levels)
    }
  })
})

describe('a boat the file holds at nought, quoted', () => {
  it('freezes its hull as not priced, at every rung', () => {
    const quote = nought()
    const hull = hullLineOf(quote)!
    expect(hull.unitPrice).toBeNull()
    expect(hull.levels.length).toBeGreaterThan(0)
    for (const level of hull.levels) expect(level.value).toBeNull()
    expect(hullPriceOf(quote)?.state).toBe('none')
    expect(hullHasNoPrice(quote)).toBe(true)
  })

  it('never prints the boat as Included: the paper and the build say one thing', () => {
    const quote = nought()
    const line = hullOf(quote)
    expect(line.state).toBe('unpriced')
    expect(line.say).toBe(NOT_PRICED_HERE)
    expect(line.say).not.toBe(INCLUDED)
    expect(line.amount).toBeNull()
    /* counted out loud and left out of the total, never added as $0 */
    expect(quoteTotals(quote).unpricedCount).toBeGreaterThanOrEqual(1)
    const rest = quote.lines
      .filter((l) => l.id !== hullLineOf(quote)!.id)
      .reduce((n, l) => n + (lineAmount(l).amount ?? 0), 0)
    expect(quoteTotals(quote).total).toBe(rest)
  })

  it('may not be given to the customer while the boat has no price', () => {
    const quote = nought()
    expect(issueBlockers(quote)).toContain(HULL_UNPRICED_WHY)
  })

  it('takes a price put on it, gives, and prints that price as the boat’s', () => {
    const quote = nought()
    const hull = hullLineOf(quote)!
    const done = apply(quote, setOverride(hull.id, 54_900, HULL_PRICE_REASON), NOW)
    expect(isDone(done)).toBe(true)
    if (!isDone(done)) return
    const priced = done.next

    expect(hullPriceOf(priced)?.state).toBe('typed')
    expect(hullHasNoPrice(priced)).toBe(false)
    expect(issueBlockers(priced)).toEqual([])
    const line = hullOf(priced)
    expect(line.state).toBe('charged')
    expect(line.amount).toBe(54_900)
    expect(line.frozenUnit).toBeNull()
    expect(quoteTotals(priced).total).toBe(quoteTotals(quote).total + 54_900)

    /* and the way back is the command's own inverse, to no price again */
    const back = apply(priced, done.inverse, NOW)
    expect(isDone(back)).toBe(true)
    if (!isDone(back)) return
    expect(hullPriceOf(back.next)?.state).toBe('none')
    expect(back.said).toContain('has no price on this quote again')
  })

  it('keeps the price put on it when the quote moves to another price level', () => {
    const quote = nought()
    const hull = hullLineOf(quote)!
    const done = apply(quote, setOverride(hull.id, 54_900, HULL_PRICE_REASON), NOW)
    if (!isDone(done)) throw new Error('refused')
    const other = hull.levels.find((l) => l.key !== quote.levelKey && l.scope === 'quote')
    expect(other).toBeDefined()
    const conflict = levelConflict(done.next, other!.key, other!.label)
    /* the hull is not a line the move changes: it has no figure at any
       level to move to, and the price a person put on it stands */
    expect(conflict?.changed.find((r) => r.lineId === hull.id)).toBeUndefined()
    const held = conflict?.held.find((r) => r.lineId === hull.id)
    if (held) expect(held.to).toBe(54_900)
  })

  it('agrees with today’s reading of the file, so no false price change is reported', () => {
    const quote = nought()
    const hull = hullLineOf(quote)!
    expect(priceChanges(ctx, quote).find((c) => c.lineId === hull.id)).toBeUndefined()
  })
})

describe('a boat the file prices', () => {
  it('freezes every figure exactly as the file states it', () => {
    const highfield = boats.find((b) => b.id === 'boat_highfield')!
    const row = (pack.rowsByEntity[highfield.id] ?? [])[0]
    const view = createViewFor(ctx, highfield.id)
    const quote = mintQuoteFromView(ctx, { viewId: view.id, rowId: row.id, reference: 'FIG' })!
    const hull = hullLineOf(quote)!
    expect(hull.unitPrice).not.toBeNull()
    for (const level of hull.levels) expect(level.value).toBe(row.values[level.fieldId])
    expect(hullPriceOf(quote)?.state).toBe('file')
    expect(issueBlockers({ ...quote, customer: { name: 'R. Kelleher' } })).toEqual([])
  })
})

describe('readHullPrice', () => {
  it('reads a typed figure the way every typed amount is read', () => {
    expect(readHullPrice('54900')).toEqual({ price: 54_900 })
    expect(readHullPrice('$54,900')).toEqual({ price: 54_900 })
    expect(readHullPrice(' 54,900.50 ')).toEqual({ price: 54_900.5 })
  })

  it('refuses a blank, a word and a nought, each with its reason', () => {
    for (const typed of ['', '   ', 'fifty', '5e4', '0', '$0', '-100']) {
      const read = readHullPrice(typed)
      expect('refused' in read).toBe(true)
      if ('refused' in read) expect(read.refused).toMatch(/\.$/)
    }
    expect(readHullPrice('0')).toEqual({ refused: expect.stringContaining('included') })
  })
})
