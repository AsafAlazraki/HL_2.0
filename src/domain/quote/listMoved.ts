/* ============================================================
   A QUOTE BEING WRITTEN, AND THE PRICE LIST MOVED UNDER IT.

   A line keeps the price it had when it was chosen (`freeze.ts`, "the
   pick IS the write"). A new price list applied on the shelf, or a
   figure typed on the sheet, leaves every quote exactly as it was —
   which is right, and was also silent: the draft read "Dealer fit
   $249" after the price list had come to read $240, with no word that
   it had (the shelf's verify-2.md, gap 2).

   THIS SAYS IT, AND CHANGES NOTHING. It is `priceChanges` read for the
   salesperson: the lines of a draft whose own figure the price list
   now reads differently, the figure each keeps and the one the price
   list gives today. Putting today's price on is a second, separate
   press (`applyPriceChanges`, with its inverse).

   READ OFF THE QUOTE AND THE PRICE LIST AS THEY ARE, never off a note
   of what a workbook did, so it says the same after a reload, on the
   shelf and on the quote alike. A given quote is never read: its
   prices are final.

   PURE. No store, no DOM, no clock.
   ============================================================ */
import type { CatalogueCtx, QuoteDef } from '@/domain/model'
import { money } from '@/domain/money'
import { priceChanges, type PriceChange } from './freeze'
import { lineSaid, nameFirst, spokenBoat } from './spoken'
import { boatTitle } from './title'

export interface MovedLine {
  lineId: string
  /** the line as a person says it: "Dealer fit · GME GX700W"; the hull by its title */
  name: string
  qty: number
  /** the price the line keeps, as it was when it was chosen */
  keeps: number
  /** the price the price list gives it today, at the quote's level */
  reads: number
  /** the re-reading itself, for the press that puts today's price on */
  change: PriceChange
}

/** The lines of a quote being written whose price the price list now reads differently. */
export function listMovedOn(ctx: CatalogueCtx, quote: QuoteDef): MovedLine[] {
  if (quote.state !== 'draft') return []
  const byId = new Map(quote.lines.map((l) => [l.id, l]))
  const out: MovedLine[] = []
  for (const change of priceChanges(ctx, quote)) {
    if (change.gone || change.from === null || change.to === null) continue
    if (change.from === change.to) continue
    const line = byId.get(change.lineId)
    if (!line) continue
    out.push({
      lineId: line.id,
      name: lineName(quote, line.label),
      qty: line.qty,
      keeps: change.from,
      reads: change.to,
      change,
    })
  }
  return out
}

/** A line named as the build names it; the quote's own subject by its title, its finish left to
 *  the quote's head: "Highfield Sport 660". */
function lineName(quote: QuoteDef, label: string): string {
  if (label === quote.subjectLabel) return boatTitle(quote.rootTableId, label).title
  return nameFirst(lineSaid(label.replace(/\s+/g, ' ').trim()))
}

/** A quote named as it heads itself: "Highfield Sport 660 · PVC · White / White / White/Blue". */
export const quoteName = (quote: QuoteDef): string =>
  spokenBoat(quote.rootTableId, quote.subjectLabel).say

export interface DraftBehind {
  quoteId: string
  reference: string
  /** as the quote heads itself, never the file's code for it */
  name: string
  customer: string | null
  lines: MovedLine[]
  /** what the lines would come to at today's prices, less what they keep, quantity counted */
  by: number
}

/** Every quote being written that carries a line the price list now reads differently. */
export function draftsBehind(ctx: CatalogueCtx, quotes: readonly QuoteDef[]): DraftBehind[] {
  const out: DraftBehind[] = []
  for (const q of quotes) {
    const lines = listMovedOn(ctx, q)
    if (lines.length === 0) continue
    const by = lines.reduce((n, l) => n + (l.reads - l.keeps) * l.qty, 0)
    const customer = q.customer?.name?.trim() ?? ''
    out.push({
      quoteId: q.id,
      reference: q.reference,
      name: quoteName(q),
      customer: customer === '' ? null : customer,
      lines,
      by: Math.round(by * 100) / 100,
    })
  }
  return out
}

/**
 * THE SENTENCE A QUOTE BEING WRITTEN CARRIES UNDER ITS TOTAL, or '' when nothing on it moved:
 * "The price list now reads $240 for Dealer fit · GME GX700W, which keeps $249 here, the price
 * it had when it was chosen." Two or more are counted, and the first is named.
 */
export function listMovedSay(lines: readonly MovedLine[]): string {
  if (lines.length === 0) return ''
  if (lines.length === 1) {
    const l = lines[0]!
    return `The price list now reads ${money(l.reads)} for ${l.name}, which keeps ${money(l.keeps)} here, the price it had when it was chosen.`
  }
  const l = lines[0]!
  return `The price list now reads differently for ${lines.length.toLocaleString('en-AU')} lines here, each kept at the price it had when it was chosen: ${l.name} keeps ${money(l.keeps)}, the price list reads ${money(l.reads)}.`
}
