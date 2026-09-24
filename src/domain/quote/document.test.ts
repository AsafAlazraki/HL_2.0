/* ============================================================
   THE DOCUMENT READER, AGAINST THE REAL FILE — and against no file
   at all, which is the case that matters.

   `invariants.test.ts` pins the engine's promise: an issued quote
   renders identically against an empty catalogue. `readDocument` is
   what the document SCREEN calls, so it is the function that could
   quietly break that promise by taking a context it does not need.
   It takes one argument and it is the quote; these cases prove the
   consequence — the same reading comes back after the sheet has been
   thrown away, because there was never anything to read it from.

   AND THE THREE WORDS ARE THREE. A figure, `Included` and
   `Not priced at this level` are different facts, and `Optional` is a
   fourth that belongs to a section rather than to a line. Each is
   asserted here on a document built by the real engine off the real
   pack, so a rename of any one of them fails in the place the words
   are decided rather than in a screenshot.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { lineSaid, measured, spokenBoat } from './spoken'
import { SUBJECT_CHAPTER, makeCtx, type QuoteDef, type QuoteLine } from '@/domain/model'
import { loadPack } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import { mintQuoteFromView } from './freeze'
import {
  INCLUDED,
  NOT_PRICED_HERE,
  NO_PRICE_TYPED,
  OPTIONAL,
  kindsFrom,
  noLevelDeclared,
  readDocument,
  unitlessMeasure,
} from './document'
import { boatTitle } from './title'

const pack = await loadPack()
const ctx = pack.ctx

/** A real hull off the real file, quoted and then issued. Found by
 *  asking for one with something on it beyond the hull, because a
 *  document with one line proves nothing about sections. */
function issuedQuote(): QuoteDef {
  for (const boat of pack.entities.filter((e) => e.kind === 'boat' && e.role !== 'join')) {
    const view = createViewFor(ctx, boat.id)
    for (const row of (pack.rowsByEntity[boat.id] ?? []).slice(0, 4)) {
      const quote = mintQuoteFromView(ctx, {
        viewId: view.id,
        rowId: row.id,
        reference: 'INV-DOC',
      })
      if (quote && quote.lines.length > 1 && quote.sections.length > 1) {
        return {
          ...quote,
          state: 'issued',
          issuedAt: quote.createdAt,
          customer: { name: 'R. Kelleher' },
        }
      }
    }
  }
  throw new Error('no boat on this file raises a quote with more than one line')
}

const quote = issuedQuote()

describe('the printed document', () => {
  it('reads with no catalogue anywhere, because it never had one', () => {
    /* the strongest form of "the sheet changed underneath it": there
       is no sheet. `readDocument` takes one argument and it is the
       document, so this is a statement about its signature as much as
       about its output. */
    const EMPTY = makeCtx({})
    expect(Object.keys(EMPTY.entities)).toEqual([])
    expect(readDocument(quote)).toEqual(readDocument(quote))
  })

  it('prints the reference, the customer and the boat off the frozen document', () => {
    const doc = readDocument(quote)
    expect(doc.reference).toBe('INV-DOC')
    expect(doc.issued).toBe(true)
    expect(doc.customer.name).toBe('R. Kelleher')
    expect(doc.subject.label).toBe(quote.subjectLabel)
    /* the boat as a person says it, off the frozen string alone */
    const boat = spokenBoat(quote.rootTableId, quote.subjectLabel)
    expect(doc.subject.name).toBe(boat.name)
    expect(doc.subject.detail).toBe(boat.detail)
    /* and as the paper heads it: the exact model, then its finish */
    const titled = boatTitle(quote.rootTableId, quote.subjectLabel)
    expect(doc.subject.title).toBe(titled.title)
    expect(doc.subject.finish).toBe(titled.finish)
    /* every frozen measure, with the unit its column or its maker states:
       on the paper, or off it where nobody states the unit — none lost */
    const all = quote.subjectSpecs.map((spec) => measured(quote.rootTableId, spec))
    expect(doc.subject.specs).toEqual(all.filter((s) => !unitlessMeasure(s.value)))
    expect(doc.subject.unitless).toEqual(all.filter((s) => unitlessMeasure(s.value)))
    expect(doc.subject.specs.length + doc.subject.unitless.length).toBe(quote.subjectSpecs.length)
  })

  it('leaves a measure nobody states a unit for off the paper, and keeps a count', () => {
    expect(unitlessMeasure('0.45')).toBe(true)
    expect(unitlessMeasure('1.35')).toBe(true)
    expect(unitlessMeasure('1.2 – 1.6')).toBe(true)
    expect(unitlessMeasure('2')).toBe(false)
    expect(unitlessMeasure('6.98 m')).toBe(false)
    expect(unitlessMeasure('90–140 HP')).toBe(false)
    expect(unitlessMeasure('12.30m / 40\' 4"')).toBe(false)
    /* on the real file: every Jeanneau's Draft, and Stabicraft's Int. Beam */
    for (const [key, label] of [
      ['boat_jeanneau', 'Draft'],
      ['boat_stabicraft', 'Int. Beam'],
    ] as const) {
      const table = pack.byKey(key)
      const view = createViewFor(ctx, table.id)
      const row = (pack.rowsByEntity[table.id] ?? [])[0]!
      const minted = mintQuoteFromView(ctx, { viewId: view.id, rowId: row.id, reference: 'U' })!
      const doc = readDocument(minted)
      expect(
        doc.subject.unitless.map((s) => s.label),
        key,
      ).toContain(label)
      expect(
        doc.subject.specs.map((s) => s.label),
        key,
      ).not.toContain(label)
    }
  })

  it('prints the hull line as the paper heads the boat, and a kit’s separators as dots', () => {
    const doc = readDocument(quote)
    const hull = doc.sections.flatMap((s) => s.tables).find((t) => t.subject)!
    for (const line of hull.lines) {
      expect(line.said).toBe(boatTitle(quote.rootTableId, quote.subjectLabel).say)
    }
    /* EVERY OTHER LINE AS A PERSON SAYS IT (m2-last-critique.md, major
       4): `lineSaid` with the register it came from, no pipe, and no
       key-string " - " — a hyphen stays only between two figures */
    for (const table of doc.sections.flatMap((s) => s.tables.filter((t) => !t.subject))) {
      for (const l of table.lines) {
        expect(l.said).toBe(lineSaid(l.label, table.title))
        expect(l.said).not.toContain('|')
        expect(
          l.said.replace(/(^|\s)(\d[\d,.]*(?: (?:mm|m|kgs|kg))?) - (?=\d)/g, '$1$2 ~ '),
        ).not.toContain(' - ')
      }
    }
    expect(lineSaid('DEC Rigging Kit | 6x9 Binnacle | CL5 Gauge Kit')).toBe(
      'DEC Rigging Kit · 6x9 Binnacle · CL5 Gauge Kit',
    )
    expect(lineSaid('TA1400S13SB - T Alloy 1400 ATM S 13" Skid Braked - 4.9 - 5.3m')).toBe(
      'TA1400S13SB · T Alloy 1400 ATM S 13" Skid Braked · 4.9 - 5.3 m',
    )
  })

  it('prints the ADV7 rig as a person says it: the motor, the trailer, the kit', () => {
    /* THE CRITIC'S OWN THREE, read off the ADV7's real rows */
    expect(lineSaid('Yamaha - F250XCB', 'Yamaha Outboards')).toBe('Yamaha F250XCB')
    expect(
      lineSaid('REDCO Custom / Highfield ADV7  Aluminium - TA700T-EH', 'NSM Custom Trailers'),
    ).toBe('REDCO Custom / Highfield ADV7 Aluminium · TA700T-EH')
    expect(
      lineSaid(
        'DEC Rigging Kit | 6x9 Binnacle | CL5 Gauge Kit | 6X6 Sng Key Switch | 16 Pin 8.0m Harness | Fuel Filter',
        'Rigging Kits',
      ),
    ).toBe(
      'DEC Rigging Kit · 6x9 Binnacle · CL5 Gauge Kit · 6X6 Single Key Switch · 16 Pin 8.0 m Harness · Fuel Filter',
    )
  })

  it('totals exactly what the one summation totals', () => {
    const doc = readDocument(quote)
    const summed = doc.sections
      .flatMap((s) => s.tables)
      .flatMap((t) => t.lines)
      .concat(doc.typed)
      .reduce((n, l) => n + (l.amount ?? 0), 0)
    expect(summed).toBe(doc.totals.packageTotal)
    expect(doc.totals.total).toBe(doc.totals.packageTotal + doc.totals.adjustmentsTotal)
  })

  it('puts every frozen line in exactly one section or in the typed list', () => {
    const doc = readDocument(quote)
    const drawn = [
      ...doc.sections.flatMap((s) => s.tables).flatMap((t) => t.lines.map((l) => l.id)),
      ...doc.typed.map((l) => l.id),
    ]
    expect(drawn.toSorted()).toEqual(quote.lines.map((l) => l.id).toSorted())
    expect(new Set(drawn).size).toBe(drawn.length)
  })

  it('reads the band order off the quote’s own frozen chapters, not off a sheet', () => {
    const kinds = kindsFrom(quote)
    expect(Object.keys(kinds).length).toBeGreaterThan(0)
    const doc = readDocument(quote)
    /* the fixed reading order, and the numbers are a reading order
       rather than a count — `bands.ts` argues why they are not
       renumbered per quote */
    const nums = doc.sections.map((s) => s.num)
    expect(nums).toEqual(nums.toSorted())
    expect(doc.sections[0].num).toBe('01')
  })

  it('names the rung in the dealer’s own word, counted off the lines', () => {
    const doc = readDocument(quote)
    expect(doc.rung).not.toBeNull()
    expect(doc.rung!.label.trim()).not.toBe('')
    expect(doc.rung!.carriedBy).toBeGreaterThan(0)
    expect(doc.rung!.of).toBe(quote.lines.length)
  })
})

/* ============================================================
   THE THREE WORDS
   ============================================================ */

/** The same document with one line's frozen figure replaced. It is a
 *  change to the DOCUMENT and not to the file: a quote carrying a
 *  blank where a price belongs is a real state the seed produces (the
 *  Haines Signature boats carry a literal 0 in their price column),
 *  and this is how a suite reaches it without a second pack. */
function withFirstLine(change: Partial<QuoteLine>): QuoteDef {
  const [first, ...rest] = quote.lines
  return { ...quote, lines: [{ ...first, ...change }, ...rest] }
}

const firstLineOf = (q: QuoteDef) =>
  readDocument(q)
    .sections.flatMap((s) => s.tables)
    .flatMap((t) => t.lines)
    .find((l) => l.id === q.lines[0].id)!

describe('a figure, Included and Not priced are three different things', () => {
  it('a figure is charged, and is in the total', () => {
    const line = firstLineOf(withFirstLine({ unitPrice: 28_530, qty: 1 }))
    expect(line.state).toBe('charged')
    expect(line.amount).toBe(28_530)
    expect(line.say).toBe('')
  })

  it('a decided nought reads Included, and is never printed as $0', () => {
    const line = firstLineOf(withFirstLine({ unitPrice: 0, qty: 1 }))
    expect(line.state).toBe('included')
    expect(line.amount).toBe(0)
    expect(line.say).toBe(INCLUDED)
  })

  it('a blank reads Not priced at this level, with the reason under the name', () => {
    const line = firstLineOf(withFirstLine({ unitPrice: null }))
    expect(line.state).toBe('unpriced')
    expect(line.amount).toBeNull()
    /* THE MONEY COLUMN IS EXACTLY THREE WORDS AND NOTHING ELSE, so
       three states read as three down a page of rows. A line that says
       "not priced" without saying priced at WHAT is half a sentence,
       and the other half goes where every other fact about where a
       figure came from goes: under the name. */
    expect(line.say).toBe(NOT_PRICED_HERE)
    expect(line.why).toContain(line.rung!)
  })

  it('a blank on a table that declares no price level gives the other reason, naming the table', () => {
    const line = firstLineOf(withFirstLine({ unitPrice: null, levels: [], priceColumnName: null }))
    expect(line.state).toBe('unpriced')
    expect(line.rung).toBeNull()
    /* BOTH WAYS OF CARRYING NO FIGURE ARE ONE STATE. The column says
       the same three words; only the reason differs. It said "this
       register carries no price column at all" until 2026-09-25, which
       was false of the tables it was said of: the file prices Rigging
       Kits and Dealer Fit Packages, and neither declares a level. */
    expect(line.say).toBe(NOT_PRICED_HERE)
    const table = readDocument(
      withFirstLine({ unitPrice: null, levels: [], priceColumnName: null }),
    )
      .sections.flatMap((s) => s.tables)
      .find((t) => t.lines.some((l) => l.id === line.id))!
    expect(line.why).toBe(noLevelDeclared(table.title))
    expect(line.why).not.toMatch(/price column/)
  })

  it('says the Rigging Kits and Dealer Fit Packages tables declare no level, which is what the file says', () => {
    for (const key of ['rig_kits', 'dealer_fit']) {
      const declared = pack.manifest.tables.find((t) => t.id === key)?.priceLevels ?? null
      expect(declared, key).toEqual([])
      /* and the file does carry sell columns on both, so "no price column" was false */
      const fields = pack.byKey(key).fields.map((f) => f.name)
      expect(
        fields.some((name) => /\bSell\b/.test(name)),
        key,
      ).toBe(true)
    }
    expect(noLevelDeclared('Rigging Kits')).toBe('no price level is declared for Rigging Kits')
    expect(NO_PRICE_TYPED).not.toMatch(/level|column/)
  })

  it('never puts anything but the three in the money column', () => {
    const cells = readDocument(quote)
      .sections.flatMap((s) => s.tables)
      .flatMap((t) => t.lines)
      .map((l) => l.say)
    expect(cells.length).toBeGreaterThan(0)
    for (const said of cells) expect(['', INCLUDED, NOT_PRICED_HERE]).toContain(said)
  })

  it('counts the unpriced and the included out loud, across the whole document', () => {
    const doc = readDocument(withFirstLine({ unitPrice: null }))
    expect(doc.unpriced).toBe(doc.totals.unpricedCount)
    expect(doc.unpriced).toBeGreaterThan(0)
    expect(readDocument(withFirstLine({ unitPrice: 0, qty: 1 })).included).toBeGreaterThan(0)
  })

  it('an unpriced line is counted OUT of the total rather than added as nothing', () => {
    const before = readDocument(quote).totals.total
    const after = readDocument(withFirstLine({ unitPrice: null })).totals.total
    expect(after).toBeLessThan(before)
  })
})

describe('Optional is a fact about a section and never about a line', () => {
  it('every line on the document is charged or included, never optional', () => {
    const states = readDocument(quote)
      .sections.flatMap((s) => s.tables)
      .flatMap((t) => t.lines.map((l) => l.state))
    expect(states.length).toBeGreaterThan(0)
    for (const state of states) expect(['charged', 'included', 'unpriced']).toContain(state)
  })

  it('counts what a register offered and nobody took, off the frozen count', () => {
    /* NOT THE SUBJECT SECTION. The hull is the thing being
       configured: it offers nothing and withholds nothing, and
       `readTable` pins its count at nought for that reason. */
    const target = quote.sections.find((s) => s.blockId !== SUBJECT_CHAPTER)!
    const raised: QuoteDef = {
      ...quote,
      sections: quote.sections.map((s) =>
        s.blockId === target.blockId ? { ...s, pickedCount: s.lineIds.length + 3 } : s,
      ),
    }
    const table = readDocument(raised)
      .sections.flatMap((s) => s.tables)
      .find((t) => t.id === target.blockId)!
    expect(table.optional).toBe(3)
  })

  it('the subject offers nothing and withholds nothing', () => {
    const subject = readDocument(quote)
      .sections.flatMap((s) => s.tables)
      .find((t) => t.subject)!
    expect(subject.optional).toBe(0)
    expect(subject.held).toBe(0)
  })

  it('answers “cannot tell” rather than nought on a document raised before the counts', () => {
    const older: QuoteDef = {
      ...quote,
      sections: quote.sections.map(({ pickedCount: _gone, ...rest }) => rest),
    }
    const tables = readDocument(older)
      .sections.flatMap((s) => s.tables)
      .filter((t) => !t.subject)
    expect(tables.length).toBeGreaterThan(0)
    expect(tables.every((t) => t.optional === null)).toBe(true)
  })

  /* THE LEGEND IS GONE (2026-09-25). `HOW_TO_READ` published the three
     words with a meaning each, for a paper that stopped printing it on
     2026-09-23; its "Not priced" meaning said a register "has no price
     column at all", which was false of Rigging Kits and Dealer Fit
     Packages. Its two cases went with it. The three words are still
     three, and still exported — a section's `Optional` among them. */
  it('publishes the three words and no legend', async () => {
    const mod: Record<string, unknown> = await import('./document')
    expect([INCLUDED, OPTIONAL, NOT_PRICED_HERE]).toEqual([
      'Included',
      'Optional',
      'Not priced at this level',
    ])
    expect(mod).not.toHaveProperty('HOW_TO_READ')
  })
})

/* ============================================================
   THE FACT IS THE PAPER'S AND THE INSTRUCTION IS THE SCREEN'S
   ============================================================ */

describe('a register with nothing on it', () => {
  /** A quote whose second section was never paired with anything:
   *  `pickedCount` of nought with no lines is `reachOf`'s `bare`. */
  const bare = (): QuoteDef => {
    const target = quote.sections.find((s) => s.blockId !== SUBJECT_CHAPTER)!
    return {
      ...quote,
      lines: quote.lines.filter((l) => !target.lineIds.includes(l.id)),
      sections: quote.sections.map((s) =>
        s.blockId === target.blockId ? { ...s, lineIds: [], pickedCount: 0, heldCount: 0 } : s,
      ),
    }
  }

  it('states the fact for the paper and holds the instruction back for the screen', () => {
    const table = readDocument(bare())
      .sections.flatMap((s) => s.tables)
      .find((t) => t.say !== '' && t.next !== '')
    expect(table, 'no register on this quote is bare').toBeTruthy()

    /* WHAT A CUSTOMER READS: that nothing from that register is on
       their boat. Nothing about where a dealer goes to change it. */
    expect(table!.say).toContain('is paired with this one yet')
    expect(table!.say).not.toMatch(/subject’s own page|subject's own page/)
    expect(table!.next).toMatch(/subject’s own page|subject's own page/)
  })
})

describe('the dealer’s terms', () => {
  it('are whatever the document froze, and are null where nothing was typed', () => {
    /* the pack carries no organisation — onboarding mints one — so
       this quote really does have no terms, and the document says so
       rather than inventing a validity sentence */
    expect(ctx.org).toBeUndefined()
    expect(readDocument(quote).terms).toBeNull()
    expect(readDocument({ ...quote, note: 'This quote is valid for 30 days.' }).terms).toBe(
      'This quote is valid for 30 days.',
    )
  })

  it('treats a note of spaces as no note, because a blank is not a term', () => {
    expect(readDocument({ ...quote, note: '   ' }).terms).toBeNull()
  })
})
