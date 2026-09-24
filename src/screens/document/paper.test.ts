/* ============================================================
   THE CUSTOMER'S COPY, WITHOUT A BROWSER.

   Every case reads a quote minted on the real Master Price File by the
   engine's own `mintQuote`, and asks `paper.ts` what the sheet prints
   and what the dealer is told instead. No figure below is typed: each
   total is the engine's, and the sum is checked against it.
   ============================================================ */
import { beforeAll, describe, expect, it } from 'vitest'
import type { QuoteDef, QuoteLine, RowData } from '@/domain/model'
import { makeCtx, rowLabel } from '@/domain/model'
import { createViewFor } from '@/domain/catalogue/views'
import { mintQuote, quoteTotals } from '@/domain/quote'
import { INCLUDED, readDocument, type DocumentLine } from '@/domain/quote/document'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import {
  NOT_PRICED_ON_PAPER,
  asLine,
  bandsOnPaper,
  cellWord,
  codesOf,
  noteOnPaper,
  offeredOf,
  offeredSay,
  paperTitle,
  priceRows,
  reasonsOf,
  underTheTotal,
  workshopOf,
} from './paper'

let pack: PackFixture

beforeAll(async () => {
  pack = await loadPack()
})

/** A quote on one row of the real file, minted as the picker mints one. */
function minted(key: string, find: string): QuoteDef {
  const table = pack.byKey(key)
  const rows = (pack.rowsByEntity[table.id] ?? []) as RowData[]
  const row = rows.find((r) => rowLabel(table, r).includes(find))
  expect(row, `${key} has no row matching ${find}`).toBeDefined()
  const ctx = makeCtx({ ...pack.ctx, views: { ...pack.ctx.views } })
  const view = createViewFor(ctx, table.id)
  const made = mintQuote(ctx, { viewId: view.id, rowId: row!.id, reference: 'NSM-PAPER' })
  expect(made).not.toBeNull()
  return made!.quote
}

/** A line in one state and nothing else, for the money column's word. */
const lineIn = (state: DocumentLine['state']): DocumentLine =>
  ({ state }) as unknown as DocumentLine

/** The quote spec's rule 3: words the customer's copy never prints. */
const APP_WORDS =
  /\b(price file|level|rung|register|rows?|offered|frozen|reimport(?:ed)?|slot|engine hole|prop part|source cell)\b/i

describe('what the customer’s copy prints', () => {
  it('leaves a register that put nothing on the quote off the paper, and a band with none left off whole', () => {
    const doc = readDocument(minted('boat_stacer', '529 Assault Pro'))
    const bands = bandsOnPaper(doc)
    expect(bands.length).toBeGreaterThan(1)
    for (const band of bands) {
      expect(band.tables.length).toBeGreaterThan(0)
      for (const table of band.tables) expect(table.lines.length).toBeGreaterThan(0)
      expect(band.named).toBe(band.tables.length > 1)
    }
    const printed = new Set(bands.map((b) => b.section.id))
    for (const section of doc.sections) {
      const took = section.tables.some((t) => t.lines.length > 0)
      expect(printed.has(section.id)).toBe(took)
    }
  })

  it('adds up: the bands and the adjustments are the total, on the real file', () => {
    for (const [key, find] of [
      ['boat_stacer', '529 Assault Pro'],
      ['boat_highfield', 'SP560'],
    ] as const) {
      const quote = minted(key, find)
      const doc = readDocument(quote)
      const rows = priceRows(doc)
      const sum = rows.reduce((n, row) => n + (row.amount ?? 0), 0)
      expect(Math.round(sum * 100) / 100, `${find} does not add up`).toBe(quoteTotals(quote).total)
    }
  })

  it('writes the line under a name in the buyer’s words, and none of the app’s', () => {
    for (const [key, find] of [
      ['boat_stacer', '529 Assault Pro'],
      ['boat_highfield', 'SP560'],
    ] as const) {
      const doc = readDocument(minted(key, find))
      for (const band of bandsOnPaper(doc)) {
        for (const line of band.tables.flatMap((t) => t.lines)) {
          const said = noteOnPaper(line)
          expect(APP_WORDS.exec(said), `“${said}” under ${line.label}`).toBeNull()
        }
      }
    }
  })

  it('says what a figure already includes, the way a buyer reads it', () => {
    const doc = readDocument(minted('boat_stacer', '529 Assault Pro'))
    const withCharges = bandsOnPaper(doc)
      .flatMap((b) => b.tables.flatMap((t) => t.lines))
      .find((line) => line.contains.length > 0)
    expect(
      withCharges,
      'no line on this quote carries a charge, so the case is vacuous',
    ).toBeDefined()
    expect(noteOnPaper(withCharges!)).toMatch(/^Includes /)
  })

  it('prints the arithmetic of a quantity and a price agreed by hand, with its reason', () => {
    const base: DocumentLine = {
      id: 'l1',
      label: 'Something',
      code: 'X1',
      qty: 2,
      state: 'charged',
      unit: 199,
      amount: 398,
      overridden: true,
      frozenUnit: 250,
      overrideReason: 'Matched a written offer',
      rung: 'Cash',
      offRung: false,
      facts: [{ label: 'Slot', value: '1' }],
      contains: [],
      say: '',
      why: '',
    }
    const said = noteOnPaper(base)
    expect(said).toContain('2 × $199')
    expect(said).toContain('Price agreed at $199 — Matched a written offer')
    /* the file's own figure and the workshop's slot are the dealer's */
    expect(said).not.toContain('$250')
    expect(said).not.toContain('Slot')
  })

  it('reads a figure, Included or Not priced on this quote in the money column, and nothing else', () => {
    expect(cellWord(lineIn('charged'))).toBe('')
    expect(cellWord(lineIn('included'))).toBe(INCLUDED)
    expect(cellWord(lineIn('unpriced'))).toBe(NOT_PRICED_ON_PAPER)
  })

  it('says under the total only what a buyer needs, and only when it is true', () => {
    const doc = readDocument(minted('boat_stacer', '529 Assault Pro'))
    const at = (n: number) => underTheTotal({ ...doc, totals: { ...doc.totals, unpricedCount: n } })
    expect(at(0)).toBe('')
    expect(at(1)).toBe('One item is not priced on this quote and is not in this total.')
    expect(at(3)).toBe('3 items are not priced on this quote and are not in this total.')
  })
})

describe('what the dealer is told instead', () => {
  it('counts every register that offered more than it put on the quote', () => {
    const quote = minted('boat_stacer', '529 Assault Pro')
    const doc = readDocument(quote)
    const census = offeredOf(doc)
    expect(census.length).toBeGreaterThan(0)
    for (const o of census) expect(offeredSay(o)).not.toBe('')
    /* the subject offers nothing and withholds nothing */
    const hull = doc.sections.flatMap((s) => s.tables).find((t) => t.subject)
    expect(census.some((o) => o.title === hull?.title && o.took > 0)).toBe(false)
  })

  it('names the saved PDF for the dealership and the quote, not for the app', () => {
    const quote = minted('boat_stacer', '529 Assault Pro')
    const doc = readDocument({ ...quote, organisation: 'Northside Marine' })
    expect(paperTitle(doc)).toBe(`Northside Marine quote NSM-PAPER – ${quote.subjectLabel}`)
    /* a quote that froze no name is called by its reference alone */
    expect(paperTitle(readDocument({ ...quote, organisation: undefined }))).toBe(
      `Quote NSM-PAPER – ${quote.subjectLabel}`,
    )
  })

  it('ends a line of the note once, even where the engine’s sentence already ended it', () => {
    expect(asLine('Rigging Kits: 6 more offered')).toBe('Rigging Kits: 6 more offered.')
    expect(asLine('GFAB Trailers: Nothing is paired with this one yet.')).toBe(
      'GFAB Trailers: Nothing is paired with this one yet.',
    )
  })

  it('phrases a register’s census by what it did', () => {
    const o = { title: 'T', took: 0, more: 4, held: 0, say: '', next: '' }
    expect(offeredSay(o)).toBe('4 offered, none taken')
    expect(offeredSay({ ...o, took: 1, more: 6 })).toBe('6 more offered')
    expect(offeredSay({ ...o, more: null })).toBe(
      'none taken, and how many it offered cannot be said',
    )
    expect(offeredSay({ ...o, more: 0, say: 'Nothing is paired with this one yet.' })).toBe(
      'Nothing is paired with this one yet.',
    )
    expect(offeredSay({ ...o, took: 1, more: 0, held: 2 })).toBe('2 held back as no longer sold')
  })

  it('keeps the codes, the workshop’s facts and the reasons, in the order the lines print', () => {
    const quote = minted('boat_stacer', '529 Assault Pro')
    const doc = readDocument(quote)
    const codes = codesOf(doc)
    const withCode = quote.lines.filter((l: QuoteLine) => l.code && l.code.trim() !== '')
    expect(codes).toHaveLength(withCode.length)
    for (const w of workshopOf(doc)) expect(w.facts).not.toBe('')
    for (const r of reasonsOf(doc)) expect(r.why).not.toBe('')
  })
})
