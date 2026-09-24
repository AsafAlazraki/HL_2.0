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
import {
  INCLUDED,
  NO_PRICE_TYPED,
  noLevelDeclared,
  readDocument,
  type DocumentLine,
} from '@/domain/quote/document'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import {
  DECLARING_A_LEVEL,
  NOT_PRICED_ON_PAPER,
  asLine,
  bandFigure,
  bandSum,
  bandsOnPaper,
  cellWord,
  codesOf,
  deskWhy,
  NO_LEVEL_ON_IT,
  noteOnPaper,
  offeredOf,
  offeredSay,
  paperTitle,
  priceRows,
  pricedAtSay,
  rowFigure,
  printedSay,
  reasonsOf,
  underTheTotal,
  unitlessOf,
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
      said: 'Something',
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

  it('never prints a Haines Signature hull as Included at $0 (m2-last-critique blocker 1)', () => {
    /* the file holds every Haines Signature boat at nought in every rung */
    const quote = minted('boat_haines', '525F')
    const doc = readDocument(quote)
    const hull = bandsOnPaper(doc)
      .flatMap((b) => b.tables)
      .find((t) => t.subject)!.lines[0]
    expect(cellWord(hull)).toBe(NOT_PRICED_ON_PAPER)
    expect(cellWord(hull)).not.toBe(INCLUDED)
    /* "Your price" says the hull has no figure rather than $0 */
    const band = priceRows(doc).find((r) => r.key === `band:${doc.sections[0].id}`)!
    expect(band.amount).toBeNull()
    expect(underTheTotal(doc)).not.toBe('')
  })

  it('prints a price put on an unpriced hull as the hull’s price, with no bargain and no price file', () => {
    const quote = minted('boat_haines', '525F')
    const [hull, ...rest] = quote.lines
    const priced: QuoteDef = {
      ...quote,
      lines: [
        {
          ...hull,
          overridePrice: 54_900,
          overrideReason: 'The price file holds no price for this boat.',
        },
        ...rest,
      ],
    }
    const doc = readDocument(priced)
    const line = bandsOnPaper(doc)
      .flatMap((b) => b.tables)
      .find((t) => t.subject)!.lines[0]
    expect(cellWord(line)).toBe('')
    expect(line.amount).toBe(54_900)
    /* the customer's copy: the figure, and nothing said about it */
    expect(noteOnPaper(line)).toBe('')
    expect(noteOnPaper(line)).not.toMatch(APP_WORDS)
    /* the dealer's note: whose figure it is, and why it was put on */
    const why = reasonsOf(doc).find((r) => r.label === hull.label)?.why ?? ''
    expect(why).toBe('priced by hand at $54,900 — the price file holds no price for this boat')
    expect(quoteTotals(priced).unpricedCount).toBe(quoteTotals(quote).unpricedCount - 1)
  })

  it('reads a figure, Included or Not priced on this quote in the money column, and nothing else', () => {
    expect(cellWord(lineIn('charged'))).toBe('')
    expect(cellWord(lineIn('included'))).toBe(INCLUDED)
    expect(cellWord(lineIn('unpriced'))).toBe(NOT_PRICED_ON_PAPER)
  })

  it('never prints a band’s subtotal as a nought: Included where all of it is, no figure where a line is not priced', () => {
    /* the words alone, one band at a time */
    const lines = (...states: DocumentLine['state'][]) => states.map(lineIn)
    expect(bandSum(lines('charged', 'included'), 199)).toEqual({ amount: 199, included: false })
    expect(bandSum(lines('charged', 'unpriced'), 199)).toEqual({ amount: 199, included: false })
    expect(bandSum(lines('unpriced'), null)).toEqual({ amount: null, included: false })
    expect(bandSum(lines('included', 'included'), 0)).toEqual({ amount: 0, included: true })
    expect(bandSum(lines('included', 'unpriced'), 0)).toEqual({ amount: null, included: false })
    expect(bandFigure(bandSum(lines('included'), 0))).toBe(INCLUDED)
    expect(bandFigure(bandSum(lines('included', 'unpriced'), 0))).toBe('—')
    expect(bandFigure(bandSum(lines('charged'), 199))).toBe('$199')

    /* and on a real quote: the 529 with its motor at nothing, and its
       trailer at nothing beside a second trailer line nobody priced —
       the shape a Stacer 499 WildRider's Dealer fit printed as "$0" */
    const quote = minted('boat_stacer', '529 Assault Pro')
    /* each line found by the band it prints in, never by its place in the list */
    const before = readDocument(quote)
    const lineOfBand = (band: string) =>
      quote.lines.find((l) =>
        before.sections
          .find((s) => s.name === band)!
          .tables.some((t) => t.lines.some((d) => d.id === l.id)),
      )!
    const motor = lineOfBand('Motor')
    const trailer = lineOfBand('Trailer')
    const rest = quote.lines.filter((l) => l !== motor && l !== trailer)
    const second = `${trailer.id}-unpriced`
    const odd: QuoteDef = {
      ...quote,
      lines: [
        ...rest,
        { ...motor, unitPrice: 0, qty: 1 },
        { ...trailer, unitPrice: 0, qty: 1 },
        { ...trailer, id: second, unitPrice: null, qty: 1 },
      ],
      /* the second line is the trailer register's, as a pick would file it */
      sections: quote.sections.map((s) =>
        s.lineIds.includes(trailer.id) ? { ...s, lineIds: [...s.lineIds, second] } : s,
      ),
    }
    const doc = readDocument(odd)
    const rows = priceRows(doc)
    const said = rows.map((row) => rowFigure(row))
    expect(said).not.toContain('$0')
    const bandOf = (id: string) => {
      const section = doc.sections.find((s) =>
        s.tables.some((t) => t.lines.some((l) => l.id === id)),
      )
      return rows.find((r) => r.key === `band:${section!.id}`)!
    }
    expect(rowFigure(bandOf(motor.id))).toBe(INCLUDED)
    expect(rowFigure(bandOf(trailer.id))).toBe(NOT_PRICED_ON_PAPER)
    /* it still adds up to the engine's own total, and the buyer is told */
    const sum = rows.reduce((n, row) => n + (row.amount ?? 0), 0)
    expect(Math.round(sum * 100) / 100).toBe(quoteTotals(odd).total)
    expect(underTheTotal(doc)).toBe(
      'One item is not priced on this quote and is not in this total.',
    )
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
    /* THE EXACT MODEL AS THE COVER HEADS IT, "(Tournament)" kept — the
       quote spec's §10 example, word for word (Phase 0, 2026-09-25) —
       and never the file's key string */
    expect(paperTitle(doc)).toBe(
      'Northside Marine quote NSM-PAPER – Stacer 529 Assault Pro (Tournament)',
    )
    expect(paperTitle(doc)).toBe(`Northside Marine quote NSM-PAPER – ${doc.subject.title}`)
    expect(paperTitle(doc)).not.toContain(quote.subjectLabel)
    /* a quote that froze no name is called by its reference alone */
    expect(paperTitle(readDocument({ ...quote, organisation: undefined }))).toBe(
      `Quote NSM-PAPER – ${doc.subject.title}`,
    )
  })

  it('ends a line of the note once, even where the engine’s sentence already ended it', () => {
    expect(asLine('Rigging Kits: 6 more offered')).toBe('Rigging Kits: 6 more offered.')
    expect(asLine('GFAB Trailers: Nothing is paired with this one yet.')).toBe(
      'GFAB Trailers: Nothing is paired with this one yet.',
    )
  })

  it('phrases a register’s census by what it did', () => {
    const o = { title: 'T', took: 0, more: 4, held: 0, say: '' }
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

/* ============================================================
   THE NOTE IN THE DEALER'S WORDS (m2-last-critique.md, major 5):
   "this register carries no price column at all", "Cash — 3 of the
   4 lines carry that rung", "Pair it on the subject's own page", and
   the rigging kit still in pipes.
   ============================================================ */
/** A line with only what `deskWhy` reads: its level and the engine’s reason. */
const lineWhy = (over: Partial<DocumentLine>): DocumentLine =>
  ({ rung: 'Cash', why: '', ...over }) as unknown as DocumentLine

describe('the note says the engine’s reasons in the dealer’s words', () => {
  it('says each of the engine’s reasons as a dealer would, exactly and only those', () => {
    /* A TABLE THAT DECLARES NO PRICE LEVEL, said as that (2026-09-25).
       It was "the price file has no price for it at any level", from the
       engine's "this register carries no price column at all" — false of
       Rigging Kits (Kit Sell Price, Sell Price, Install Retail Sell) and
       Dealer Fit Packages (Act Sell, Sell). */
    expect(
      deskWhy(lineWhy({ rung: null, why: noLevelDeclared('Rigging Kits') }), 'Rigging Kits'),
    ).toBe(
      `no price level is declared for Rigging Kits, so it has no price on this quote and is not in the total; ${DECLARING_A_LEVEL}`,
    )
    expect(DECLARING_A_LEVEL).not.toMatch(/levels screen/)
    /* a line typed on the quote with no price */
    expect(deskWhy(lineWhy({ rung: null, why: NO_PRICE_TYPED }))).toBe(
      `${NO_PRICE_TYPED}, so it is not in the total`,
    )
    /* the old sentence is no longer the engine's, and is not dressed up */
    expect(
      deskWhy(lineWhy({ rung: null, why: 'this register carries no price column at all' })),
    ).toBe('this register carries no price column at all')
    expect(deskWhy(lineWhy({ why: 'the price file carries no figure for it at Cash' }))).toBe(
      'the price file has no Cash price for it, so it is not in the total',
    )
    expect(deskWhy(lineWhy({ why: 'Cash states a charge of nothing for it' }))).toBe(
      `its Cash price on the price file is nothing, so the paper reads ${INCLUDED}`,
    )
    /* anything else is the engine's own words, untouched */
    expect(deskWhy(lineWhy({ why: 'somebody’s reason' }))).toBe('somebody’s reason')
  })

  it('reads the engine’s real reasons off a real quote, so a change of wording there fails here', () => {
    const quote = minted('boat_highfield', 'ADV7')
    const doc = readDocument(quote)
    const reasons = reasonsOf(doc)
    expect(reasons.length, 'the ADV7 carries no line without a price').toBeGreaterThan(0)
    for (const r of reasons) {
      expect(r.why).not.toMatch(/\b(register|column|rung)\b/i)
      /* named as the paper names the line: the kit's " · ", never its "|" */
      expect(r.said).not.toContain('|')
    }
  })

  it('names the level the paper is priced at by its declared name, counted in lines', () => {
    const doc = readDocument(minted('boat_highfield', 'ADV7'))
    expect(doc.rung).not.toBeNull()
    const said = pricedAtSay(doc)
    expect(said.startsWith(`${doc.rung!.label}, on `)).toBe(true)
    expect(said).not.toMatch(/\brung\b/i)
    const all = { ...doc, rung: { ...doc.rung!, carriedBy: 4, of: 4 } }
    expect(pricedAtSay(all)).toBe(`${doc.rung!.label}, on every line.`)
    const some = { ...doc, rung: { ...doc.rung!, carriedBy: 3, of: 4 } }
    expect(pricedAtSay(some)).toBe(`${doc.rung!.label}, on 3 of the 4 lines.`)
    expect(pricedAtSay({ ...doc, rung: null })).toBe(NO_LEVEL_ON_IT)
  })

  it('says the workshop’s facts with a kit’s parts parted by " · " and the facts by ";"', () => {
    const doc = readDocument(minted('boat_stacer', '529 Assault Pro'))
    const shop = workshopOf(doc)
    const piped = shop.find((w) => w.label.startsWith('Yamaha'))
    expect(piped, 'the 529’s motor carries no workshop facts').toBeTruthy()
    for (const w of shop) {
      expect(w.facts).not.toContain('|')
      expect(w.said).not.toContain('|')
    }
    expect(piped!.facts).toMatch(/Rigging Kit Option [^;]+ · [^;]+;/)
  })

  it('does not print the engine’s instruction about a page this app does not have', () => {
    for (const o of offeredOf(readDocument(minted('boat_highfield', 'ADV7')))) {
      expect(offeredSay(o)).not.toMatch(/own page/)
    }
  })
})

/* ============================================================
   THE PICTURE AND THE MEASURES, SAID FOR THE DEALER (2026-09-25).
   m2-last-critique-2.md: the note said "printed at 656 × 369, never
   enlarged" of a picture the band showed 656 × 270 of; and Jeanneau's
   "Draft 0.45" reached the customer with no unit.
   ============================================================ */
describe('the note says the picture as printed and the measures left off', () => {
  it('says the held size and the size measured on paper, and "never enlarged" only where it is so', () => {
    const held = { width: 1_100, height: 619 }
    expect(printedSay(held, { w: 658, h: 370 })).toBe(
      'Held 1,100 × 619, printed whole at 658 × 370, never enlarged',
    )
    expect(printedSay(held, null)).toBe('Held 1,100 × 619, printed whole')
    expect(printedSay(held, { w: 1_200, h: 675 })).toBe(
      'Held 1,100 × 619, printed whole at 1,200 × 675, larger than the pixels held',
    )
  })

  it('says every measure the paper leaves off, with why, and the paper does not print it', () => {
    const doc = readDocument(minted('boat_jeanneau', 'Merry Fisher 605'))
    expect(doc.subject.unitless.map((s) => s.label)).toContain('Draft')
    const said = unitlessOf(doc)
    const draft = said.find((s) => s.startsWith('Draft '))
    expect(draft).toMatch(/^Draft \d+\.\d+: neither the price file nor the maker states its unit$/)
    expect(doc.subject.specs.map((s) => s.label)).not.toContain('Draft')
    /* a boat whose every measure carries its unit leaves nothing off */
    expect(unitlessOf(readDocument(minted('boat_highfield', 'ADV7')))).toEqual([])
  })
})
