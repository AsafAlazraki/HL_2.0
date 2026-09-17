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
import { SUBJECT_CHAPTER, makeCtx, type QuoteDef, type QuoteLine } from '@/domain/model'
import { loadPack } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import { mintQuoteFromView } from './freeze'
import {
  HOW_TO_READ,
  INCLUDED,
  NOT_PRICED_HERE,
  OPTIONAL,
  kindsFrom,
  readDocument,
} from './document'

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
    expect(doc.subject.specs).toEqual(quote.subjectSpecs)
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

  it('a blank on a register with no price column at all gives the other reason', () => {
    const line = firstLineOf(withFirstLine({ unitPrice: null, levels: [], priceColumnName: null }))
    expect(line.state).toBe('unpriced')
    expect(line.rung).toBeNull()
    /* BOTH WAYS OF CARRYING NO FIGURE ARE ONE STATE. The column says
       the same three words; only the reason differs. */
    expect(line.say).toBe(NOT_PRICED_HERE)
    expect(line.why).toContain('no price column')
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

  it('publishes one legend, and it names all three', () => {
    expect(HOW_TO_READ.map((r) => r.word)).toEqual([INCLUDED, OPTIONAL, NOT_PRICED_HERE])
    for (const row of HOW_TO_READ) expect(row.means.length).toBeGreaterThan(40)
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
