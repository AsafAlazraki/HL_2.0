/* ============================================================
   THE CUSTOMER'S COPY, WITHOUT A BROWSER.

   Every case reads a quote minted on the real Master Price File by the
   engine's own `mintQuote`, and asks `paper.ts` what the sheet prints
   and what the dealer is told instead. No figure below is typed: each
   total is the engine's, and the sum is checked against it.
   ============================================================ */
import { beforeAll, describe, expect, it } from 'vitest'
import { money } from '@/domain/money'
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
import { isDone } from '@/domain/quote/commands'
import { swapLines } from '@/domain/quote/swap'
import { codeBeside } from '@/domain/quote/spoken'
import { readRail } from '@/screens/configurator/chapters'
import {
  NOT_PRICED_ON_PAPER,
  asLine,
  bandFigure,
  bandSum,
  bandsOnPaper,
  cellWord,
  codeGap,
  codesOf,
  linesOf,
  deskWhy,
  gstSay,
  includesSay,
  kitsOnPaper,
  NO_LEVEL_ON_IT,
  noteOnPaper,
  offeredOf,
  offeredSay,
  paperTitle,
  piped,
  priceRows,
  pricedAtSay,
  rowFigure,
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
      own: [],
      unsaid: [],
      item: null,
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
    /* "Your price" prints no row for a band with no figure, never $0: the hull's own line says
       its price is to be confirmed, once */
    expect(priceRows(doc).find((r) => r.key === `band:${doc.sections[0].id}`)).toBeUndefined()
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
      return rows.find((r) => r.key === `band:${section!.id}`)
    }
    expect(rowFigure(bandOf(motor.id)!)).toBe(INCLUDED)
    /* the trailer's band has no figure, so it is not a row: no row says an item has no price */
    expect(bandOf(trailer.id)).toBeUndefined()
    expect(said).not.toContain(NOT_PRICED_ON_PAPER)
    /* it still adds up to the engine's own total */
    const sum = rows.reduce((n, row) => n + row.amount, 0)
    expect(Math.round(sum * 100) / 100).toBe(quoteTotals(odd).total)
    /* the buyer is told on the line itself */
    const unpriced = doc.sections
      .flatMap((s) => s.tables)
      .flatMap((t) => t.lines)
      .find((l) => l.id === second)!
    expect(cellWord(unpriced)).toBe(NOT_PRICED_ON_PAPER)
    /* and the count of what is outside the total names it as its row does, never "One item"
       (build-close-critique-2.md, major 5) */
    expect(underTheTotal(doc)).toBe(
      `The ${unpriced.said} has no price on this quote, so it is not in this total.`,
    )
  })

  it('counts what is outside the total only when it is true, naming a line where it can', () => {
    const doc = readDocument(minted('boat_stacer', '529 Assault Pro'))
    expect(linesOf(doc).filter((l) => l.state === 'unpriced')).toEqual([])
    /* a count with no line to name it by is still said, as a count */
    const at = (n: number) => underTheTotal({ ...doc, totals: { ...doc.totals, unpricedCount: n } })
    expect(at(0)).toBe('')
    expect(at(1)).toBe('One item has no price on this quote, so it is not in this total.')
    expect(at(3)).toBe('3 items have no price on this quote, so they are not in this total.')
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
    expect(offeredSay({ ...o, took: 1, more: 0, held: 2 })).toBe('2 no longer sold')
  })

  it('keeps the codes, the workshop’s facts and the reasons, in the order the lines print', () => {
    const quote = minted('boat_stacer', '529 Assault Pro')
    const doc = readDocument(quote)
    const codes = codesOf(doc)
    /* EVERY CODE IS KEPT, BESIDE WHAT IT ORDERS (the refine round, 2026-10-21): each line's code
       is on the note with the line's name, unless that name already says every word of it */
    const withCode = linesOf(doc).filter((l) => l.code !== null)
    for (const line of withCode) {
      const said = codeBeside(line.said, line.code)
      if (said === '') expect(codes.map((c) => c.said)).not.toContain(line.said)
      else expect(codes).toContainEqual({ said: line.said, code: line.code })
    }
    expect(codes.length).toBeGreaterThan(0)
    expect(quote.lines.some((l: QuoteLine) => l.code && l.code.trim() !== '')).toBe(true)
    /* the motor's code is its name, "Yamaha F90LB", and is said once */
    for (const c of codes) expect(codeBeside(c.said, c.code)).toBe(c.code)
    for (const w of workshopOf(doc)) expect(w.facts).not.toBe('')
    for (const r of reasonsOf(doc)) expect(r.why).not.toBe('')
  })

  /* the refine round, 2026-10-21: the note printed "704-6Y82L-##-05", the price list's "##" */
  it('names the gap a rigging kit’s code leaves for the cable length, and keeps every other character', () => {
    expect(codeGap('704-6Y82L-##-05')).toEqual({
      before: '704-6Y82L-',
      gap: 'cable length',
      after: '-05',
    })
    expect(codeGap('6YC-##/##-00')?.gap).toBe('cable lengths')
    expect(codeGap('9ST-704-6Y82L-22-07')).toBeNull()
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
      'Northside had not chosen which figure prices Rigging Kits when it went on, so it is not in the total',
    )
    /* never "no price on the price list": the list holds its figures and names none
       (built-critique-m3.md, blocker 1) */
    expect(
      deskWhy(lineWhy({ rung: null, why: noLevelDeclared('Rigging Kits') }), 'Rigging Kits'),
    ).not.toMatch(/no (w+ )?price on the price list/)
    /* a line typed on the quote with no price */
    expect(deskWhy(lineWhy({ rung: null, why: NO_PRICE_TYPED }))).toBe(
      `${NO_PRICE_TYPED}, so it is not in the total`,
    )
    /* the old sentence is no longer the engine's, and is not dressed up */
    expect(
      deskWhy(lineWhy({ rung: null, why: 'this register carries no price column at all' })),
    ).toBe('this register carries no price column at all')
    expect(deskWhy(lineWhy({ why: 'the price file carries no figure for it at Cash' }))).toBe(
      'the price list has no Cash price for it, so it is not in the total',
    )
    expect(deskWhy(lineWhy({ why: 'Cash states a charge of nothing for it' }))).toBe(
      `the price list charges nothing for it at Cash, so it reads ${INCLUDED}`,
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
    expect(pricedAtSay(all)).toBe(`${doc.rung!.label}, on every item.`)
    /* the count stands only where no reason on the note names the item it leaves out */
    const unnamed = linesOf(doc).filter((l) => l.state === 'unpriced' && l.rung === null).length
    const some = {
      ...doc,
      rung: { ...doc.rung!, carriedBy: doc.rung!.of - unnamed - 1, of: doc.rung!.of },
    }
    expect(pricedAtSay(some)).toBe(
      `${doc.rung!.label}, on ${some.rung.carriedBy} of the ${some.rung.of} items.`,
    )
    const named = { ...doc, rung: { ...doc.rung!, carriedBy: doc.rung!.of - unnamed } }
    if (unnamed > 0)
      expect(pricedAtSay(named)).toBe(`${doc.rung!.label}, on every item with a price.`)
    expect(pricedAtSay({ ...doc, rung: null })).toBe(NO_LEVEL_ON_IT)
  })

  it('says the workshop’s facts with a kit’s parts parted by " · " and the facts by ";"', () => {
    const doc = readDocument(minted('boat_stacer', '529 Assault Pro'))
    const shop = workshopOf(doc)
    const motorShop = shop.find((w) => w.label.startsWith('Yamaha'))
    expect(motorShop, 'the 529’s motor carries no workshop facts').toBeTruthy()
    for (const w of shop) {
      expect(w.facts).not.toContain('|')
      expect(w.said).not.toContain('|')
    }
    expect(motorShop!.facts).toMatch(/Rigging Kit Option [^;]+ · [^;]+;/)
  })

  it('does not print the engine’s instruction about a page this app does not have', () => {
    for (const o of offeredOf(readDocument(minted('boat_highfield', 'ADV7')))) {
      expect(offeredSay(o)).not.toMatch(/own page/)
    }
  })
})

/* ============================================================
   THE MEASURES, SAID FOR THE DEALER (2026-09-25). Jeanneau's "Draft
   0.45" reached the customer with no unit. (The cover picture's size in
   pixels, measured on paper, was said here too until the refine critique,
   18: how the screen draws a picture is not the boat's, and the note now
   says what the picture shows and whose it is — Document.test.tsx.)
   ============================================================ */
describe('the note says the measures left off', () => {
  it('says every measure the paper leaves off, with why, and the paper does not print it', () => {
    const doc = readDocument(minted('boat_jeanneau', 'Merry Fisher 605'))
    expect(doc.subject.unitless.map((s) => s.label)).toContain('Draft')
    const said = unitlessOf(doc)
    const draft = said.find((s) => s.startsWith('Draft '))
    expect(draft).toMatch(/^Draft \d+\.\d+: neither the price list nor the maker states its unit$/)
    expect(doc.subject.specs.map((s) => s.label)).not.toContain('Draft')
    /* a boat whose every measure carries its unit leaves nothing off */
    expect(unitlessOf(readDocument(minted('boat_highfield', 'ADV7')))).toEqual([])
  })
})

/* ============================================================
   A RIGGING KIT, SAID BY THE MOTOR IT IS FOR (docs/WORDS.md rule 4;
   build-close-critique-2.md, major 1 and minor 13). After the change of
   mind on the Stacer 519 the paper named the F115LB's kit "Mech Rigging
   Kit · 704 Binnacle Mount w 6Y8 2 Gauges, 5 m Harness, Cables &
   Filter" on page 2, under "Your price" and on the note, and the
   workshop read "Motor Yamaha - F115LB2 (White)" beside an F115LB.
   ============================================================ */
describe('a rigging kit, said by the motor it is for', () => {
  /** The 519 minted as the picker mints it, then the F115LB pressed, as the build's tile does. */
  function changedItsMind(): QuoteDef {
    const table = pack.byKey('boat_stacer')
    const rows = (pack.rowsByEntity[table.id] ?? []) as RowData[]
    const row = rows.find((r) => rowLabel(table, r).includes('519 Sea Ranger SDF'))!
    const ctx = makeCtx({ ...pack.ctx, views: { ...pack.ctx.views } })
    const view = createViewFor(ctx, table.id)
    const quote = mintQuote(ctx, { viewId: view.id, rowId: row.id, reference: 'NSM-KIT' })!.quote
    const tile = readRail(ctx, quote)
      .chapters.find((c) => c.id === 'motor')!
      .tables.flatMap((t) => t.rows)
      .find((r) => r.tail === 'Yamaha F115LB')
    expect(tile?.act.do, 'the F115LB is not offered as a swap on the 519').toBe('swap')
    if (tile?.act.do !== 'swap') throw new Error('not a swap')
    const done = swapLines(tile.act.swap)(quote, '')
    if (!isDone(done)) throw new Error('the swap was refused')
    return done.next
  }

  it('names the kit by its motor wherever the paper and the note name a line', () => {
    const raw = readDocument(changedItsMind())
    const doc = kitsOnPaper(raw)
    const kits = doc.sections
      .flatMap((s) => s.tables)
      .filter((t) => /rigging kits?/i.test(t.title))
      .flatMap((t) => t.lines)
    expect(kits.length, 'the F115LB brought no kit').toBe(1)
    const kit = kits[0]!
    expect(kit.said).toBe('Rigging kit for the F115LB')
    /* the price list's description is not the name anywhere the customer or the dealer reads one */
    const description = raw.sections
      .flatMap((s) => s.tables)
      .flatMap((t) => t.lines)
      .find((l) => l.id === kit.id)!.said
    expect(description).not.toBe(kit.said)
    for (const said of linesOf(doc).map((l) => l.said)) expect(said).not.toBe(description)
    for (const r of reasonsOf(doc)) expect(r.said).not.toBe(description)
    /* not priced, its own line says its price is to come, and the count names it by its motor */
    if (kit.state === 'unpriced') {
      expect(cellWord(kit)).toBe(NOT_PRICED_ON_PAPER)
      expect(underTheTotal(doc)).toBe(
        'The rigging kit for the F115LB has no price on this quote, so it is not in this total.',
      )
    }
  })

  it('keeps the description for the workshop, once, and prints no second motor beside the kit', () => {
    const raw = readDocument(changedItsMind())
    const doc = kitsOnPaper(raw)
    const shop = workshopOf(doc)
    const kit = shop.find((w) => w.said === 'Rigging kit for the F115LB')
    expect(kit, 'the kit carries no workshop line').toBeTruthy()
    /* the price list's own words, whole, as the paper said them before: pipes and short forms said */
    const description = linesOf(raw).find((l) => l.label === kit!.label)!.said
    expect(description).toContain('Binnacle')
    expect(kit!.facts.startsWith(description)).toBe(true)
    /* the kit's own "Motor" fact went: the name says the motor */
    expect(kit!.facts).not.toMatch(/^Motor |; Motor /)
    expect(shop.map((w) => w.facts).join('\n')).not.toMatch(/F115LB2/)
    /* and the motor no longer names the same kit a second time */
    const motor = shop.find((w) => w.said === 'Yamaha F115LB')
    expect(motor?.facts ?? '').not.toContain(piped(kit!.label))
    expect(motor?.facts ?? '').not.toContain(description)
  })

  it('leaves a quote with no rigging kit as it was', () => {
    const doc = readDocument(minted('boat_highfield', 'ADV7'))
    const kits = doc.sections.flatMap((s) => s.tables).filter((t) => /rigging kits?/i.test(t.title))
    if (kits.length === 0) expect(kitsOnPaper(doc)).toBe(doc)
    else expect(kitsOnPaper(doc).sections.length).toBe(doc.sections.length)
  })
})

describe('what the total includes, and its GST (2026-10-31)', () => {
  it('says in one sentence what the priced lines already contain, by whose it is', () => {
    const doc = readDocument(minted('boat_stacer', '529 Assault Pro'))
    const said = includesSay(doc)
    expect(said).toMatch(/^Includes the (motor|trailer)’s /)
    expect(said.endsWith('.')).toBe(true)
  })

  it('says no GST figure until a rate is on the quote, and the workbook’s own once one is', () => {
    const quote = minted('boat_stacer', '529 Assault Pro')
    expect(gstSay(readDocument(quote))).toBe('')
    const doc = readDocument({ ...quote, taxRate: 10 })
    expect(gstSay(doc)).toBe(`Includes GST of ${money(doc.totals.total / 11)} at 10%`)
  })

  it('numbers the bands the paper prints 01, 02, 03 with none skipped', () => {
    const doc = readDocument(minted('boat_stacer', '529 Assault Pro'))
    const nums = bandsOnPaper(doc).map((b) => b.num)
    expect(nums).toEqual(nums.map((_, i) => String(i + 1).padStart(2, '0')))
  })
})
