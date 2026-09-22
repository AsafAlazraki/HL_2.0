import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { EntityDef, ModuleDef, QuoteDef, RowData } from '@/domain/model'
import { makeCtx, rowLabel } from '@/domain/model'
import { money } from '@/domain/money'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import { issue, mintQuote, quoteTotals, setCustomer, setNote } from '@/domain/quote'
import { INCLUDED, NOT_PRICED_HERE, OPTIONAL, readDocument } from '@/domain/quote/document'
import { Document, NO_TERMS } from './Document'

/* ============================================================
   The document, rendered against the real pack, read by role and by
   text — and then rendered again with the price file thrown away.

   THE SECOND HALF IS THE POINT. `invariants.test.ts` asserts that an
   issued quote reads identically against an empty catalogue; that is
   a promise about the ENGINE. This is the promise about the SCREEN:
   the catalogue store is emptied, the component is rendered, and
   every figure, every name and every sentence is still there. A
   document that needed the sheet would fail here and nowhere else.

   NOT ONE FIGURE BELOW IS TYPED INTO AN ASSERTION. Every total,
   subtotal and count is computed by the engine in the test and then
   looked for on the screen, the same discipline the picker's and the
   configurator's suites keep.
   ============================================================ */

let pack: PackFixture

const loadTheFile = async (): Promise<void> => {
  await catalogue.getState().load({
    entities: pack.entities,
    rowsByEntity: pack.rowsByEntity,
    manifest: pack.manifest,
    modules: Object.values(pack.ctx.modules) as ModuleDef[],
  })
}

/** A quote on one row of the real file, filed exactly as the picker
 *  files one, addressed and then given to the customer. */
function issuedQuote(key: string, find: string): QuoteDef {
  const table: EntityDef = pack.byKey(key)
  const rows = (pack.rowsByEntity[table.id] ?? []) as RowData[]
  const row = rows.find((r) => rowLabel(table, r).includes(find))
  expect(row, `${key} has no row matching ${find}`).toBeDefined()
  const sheet = catalogue.getState()
  const ctx = makeCtx({
    entities: sheet.tables as Record<string, EntityDef>,
    rowsByEntity: sheet.rows as Record<string, RowData[]>,
    views: { ...sheet.views },
    modules: pack.ctx.modules,
    priceLevels: pack.ctx.priceLevels,
    orgId: 'northside',
  })
  const view = createViewFor(ctx, table.id)
  const minted = mintQuote(ctx, { viewId: view.id, rowId: row!.id, reference: 'NSM-DOC' })
  expect(minted).not.toBeNull()
  quotes.getState().file(minted!.quote, minted!.event)
  const id = minted!.quote.id
  expect(quotes.getState().apply(id, setCustomer({ name: 'R. Kelleher' }))).not.toHaveProperty(
    'refused',
  )
  expect(quotes.getState().apply(id, issue())).not.toHaveProperty('refused')
  return quotes.getState().get(id)!
}

const filed = (id: string): QuoteDef => quotes.getState().get(id)!

beforeAll(async () => {
  pack = await loadPack()
  await loadTheFile()
  await quotes.getState().openFor('northside')
  session.getState().signIn('Asaf')
})

describe('the issued quote, on the page', () => {
  let quote: QuoteDef
  beforeEach(() => {
    quote = issuedQuote('boat_stacer', '529 Assault Pro')
  })

  it('names the boat, the reference and who it is for', () => {
    render(<Document quoteId={quote.id} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(quote.subjectLabel)
    expect(screen.getAllByText(quote.reference).length).toBeGreaterThan(0)
    expect(screen.getByText('R. Kelleher')).toBeInTheDocument()
  })

  it('prints the price beside who it is for, at the engine’s own total', () => {
    render(<Document quoteId={quote.id} />)
    const total = quoteTotals(quote).total
    const figure = screen.getByTestId('document-total')
    expect(figure).toHaveTextContent(money(total))
    /* IT IS A `PriceFigure` AND NOT A COUNTER: a `data` element
       carrying the value verbatim. An issued figure that counts up
       reads as a figure still being decided. */
    const data = figure.querySelector('data.ui-price')
    expect(data).not.toBeNull()
    expect(data?.getAttribute('value')).toBe(String(total))
  })

  it('draws a section per band, each head carrying its own subtotal', () => {
    render(<Document quoteId={quote.id} />)
    const doc = readDocument(quote)
    expect(doc.sections.length).toBeGreaterThan(1)
    for (const section of doc.sections) {
      expect(screen.getAllByText(section.name).length).toBeGreaterThan(0)
      if (section.subtotal !== null) {
        expect(screen.getAllByText(money(section.subtotal)).length).toBeGreaterThan(0)
      }
    }
  })

  it('prints every frozen line, with the dealer’s own code beside it', () => {
    render(<Document quoteId={quote.id} />)
    for (const line of quote.lines) {
      expect(screen.getAllByText(line.label).length).toBeGreaterThan(0)
      if (line.code) expect(screen.getAllByText(line.code).length).toBeGreaterThan(0)
    }
  })

  it('says it was given to the customer, and what that means', () => {
    render(<Document quoteId={quote.id} />)
    expect(screen.getAllByText(/Given to the customer/i).length).toBeGreaterThan(0)
    expect(
      screen.getByText(/the file can be reimported twice and nothing here moves/),
    ).toBeInTheDocument()
  })
})

/* ============================================================
   THE PROMISE: THE SHEET IS GONE AND THE DOCUMENT IS UNCHANGED
   ============================================================ */

describe('against an empty catalogue', () => {
  it('renders every word and every figure with the price file thrown away', async () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    const first = render(<Document quoteId={quote.id} />)
    const before = first.container.textContent
    first.unmount()

    /* THE SHEET, GONE. Not a mocked context and not an empty prop —
       the store the whole app reads, emptied. */
    await catalogue.getState().load({ entities: [], rowsByEntity: {}, manifest: undefined })
    expect(Object.keys(catalogue.getState().tables)).toEqual([])

    const again = render(<Document quoteId={quote.id} />)
    expect(again.container.textContent).toBe(before)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(quote.subjectLabel)
    expect(screen.getByTestId('document-total')).toHaveTextContent(money(quoteTotals(quote).total))

    await loadTheFile()
  })
})

/* ============================================================
   THE THREE WORDS, ON THE PAGE
   ============================================================ */

/**
 * THE WORD ON THE ROW, NOT THE WORD ON THE PAGE. All three are printed
 * in the legend, so `getByText('Included')` would pass on a document
 * where no line said it — which is the vacuous assertion this
 * repository's guards exist to catch. Each case below finds the LINE by
 * its own name and reads the cell beside it.
 */
const cellFor = (label: string): string => {
  /* the hull's own name is on the cover as well as on its row, so the
     match is the one that has a row around it */
  const row = screen
    .getAllByText(label)
    .map((node) => node.closest('.doc-row'))
    .find((found) => found !== null)
  expect(row, `${label} is not drawn on a row`).toBeTruthy()
  return row!.querySelector('.doc-row__fig')?.textContent ?? ''
}

/** The document the store holds, replaced wholesale. It is how a test
 *  reaches a frozen state the seed does not happen to produce — a blank
 *  where a price belongs — without a second pack. */
const insteadFile = (next: QuoteDef): void => {
  quotes.setState({ quotes: [next] })
}

/** A sentence the engine wrote, as a pattern that matches it. */
const escapeRe = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

describe('Included, Optional and Not priced read as three', () => {
  let quote: QuoteDef
  beforeEach(() => {
    quote = issuedQuote('boat_stacer', '529 Assault Pro')
  })

  it('defines all three where a reader meets them', () => {
    render(<Document quoteId={quote.id} />)
    const legend = screen.getByRole('region', { name: 'How to read a line' })
    for (const word of [INCLUDED, OPTIONAL, NOT_PRICED_HERE]) {
      expect(within(legend).getByText(word)).toBeInTheDocument()
    }
  })

  it('prints Included on the row where the file states a charge of nothing, never $0', () => {
    const [first, ...rest] = quote.lines
    insteadFile({ ...quote, lines: [{ ...first, unitPrice: 0, qty: 1 }, ...rest] })
    render(<Document quoteId={quote.id} />)
    expect(cellFor(first.label)).toBe(INCLUDED)
    expect(cellFor(first.label)).not.toContain('$')
  })

  it('prints Not priced at this level on the row, and the reason under the name', () => {
    const [first, ...rest] = quote.lines
    const withBlank: QuoteDef = { ...quote, lines: [{ ...first, unitPrice: null }, ...rest] }
    insteadFile(withBlank)
    render(<Document quoteId={quote.id} />)
    const line = readDocument(withBlank)
      .sections.flatMap((s) => s.tables)
      .flatMap((t) => t.lines)
      .find((l) => l.id === first.id)!
    expect(cellFor(first.label)).toBe(NOT_PRICED_HERE)
    /* the money column carries three words and never a paragraph; the
       reason is under the name, with the rest of the line's own
       provenance */
    expect(line.why).not.toBe('')
    expect(screen.getAllByText(new RegExp(escapeRe(line.why))).length).toBeGreaterThan(0)
  })

  it('a charged line prints a figure and neither of the two words', () => {
    const charged = quote.lines.find((l) => (l.unitPrice ?? 0) > 0)
    expect(charged, 'this hull raises no priced line').toBeDefined()
    render(<Document quoteId={quote.id} />)
    const cell = cellFor(charged!.label)
    expect(cell).toContain('$')
    expect(cell).not.toContain(INCLUDED)
    expect(cell).not.toContain(NOT_PRICED_HERE)
  })

  it('states what a register offered and nobody took, as a count and not an absent row', () => {
    /* one that had lines and left some on the shelf, and one that
       took nothing at all — the two are different sentences and both
       have to say the number */
    const some = quote.sections.find(
      (s) => s.lineIds.length > 0 && (s.pickedCount ?? 0) > s.lineIds.length,
    )
    const none = quote.sections.find((s) => s.lineIds.length === 0 && (s.pickedCount ?? 0) > 0)
    expect(
      some ?? none,
      'this hull offers nothing it did not take, so the case is vacuous',
    ).toBeDefined()
    render(<Document quoteId={quote.id} />)

    if (some) {
      const offered = (some.pickedCount ?? 0) - some.lineIds.length
      expect(
        screen.getAllByText(new RegExp(`${offered} more (was|were) offered from`)).length,
      ).toBeGreaterThan(0)
    }
    if (none) {
      expect(
        screen.getAllByText(
          new RegExp(`${none.pickedCount} (row was|rows were) offered from .* and none is`),
        ).length,
      ).toBeGreaterThan(0)
    }
  })
})

/* ============================================================
   THE TERMS, THE PRINT, AND NO DOCUMENT AT ALL
   ============================================================ */

describe('the dealer’s terms', () => {
  it('say there are none rather than inventing a sentence', () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    /* the pack has no organisation on it — onboarding mints one — so
       this quote really was raised with no standing terms */
    expect(quote.note).toBeUndefined()
    render(<Document quoteId={quote.id} />)
    expect(screen.getByText(NO_TERMS)).toBeInTheDocument()
  })

  it('print what the document froze, not what the business says today', () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    const written = { ...quote, note: 'This quote is valid for 30 days from the date above.' }
    quotes.setState({ quotes: [written] })
    render(<Document quoteId={written.id} />)
    expect(
      screen.getByText('This quote is valid for 30 days from the date above.'),
    ).toBeInTheDocument()
    expect(screen.queryByText(NO_TERMS)).toBeNull()
  })

  it('refuses an edit on an issued quote with the engine’s own sentence', () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    const outcome = quotes.getState().apply(quote.id, setNote('Valid for 14 days.'))
    expect(outcome).toHaveProperty('refused')
    expect(filed(quote.id).note).toBeUndefined()
  })
})

describe('the act on the floor', () => {
  it('prints, and says where the PDF comes from', async () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    const print = vi.fn<() => void>()
    render(<Document quoteId={quote.id} print={print} />)
    await userEvent.click(screen.getByRole('button', { name: 'Print' }))
    expect(print).toHaveBeenCalledTimes(1)
    expect(screen.getByText(/there is no second renderer here/)).toBeInTheDocument()
  })

  it('offers the way back to the build', async () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    const goBack = vi.fn<() => void>()
    render(<Document quoteId={quote.id} goBack={goBack} />)
    await userEvent.click(screen.getByRole('button', { name: 'Back to the build' }))
    expect(goBack).toHaveBeenCalledTimes(1)
  })
})

describe('no document at this address', () => {
  it('says so, and does not pretend the address is broken', () => {
    render(<Document quoteId="nothing-is-filed-here" />)
    expect(screen.getByText(/No quote is filed at this address/)).toBeInTheDocument()
  })
})

/* ============================================================
   WHAT IS ON THE PAPER AND WHAT IS ON THE DESK.

   The flow critique of 2026-09-18 read five things off an issued
   document that were written for the person who MADE it: an upload
   instruction for a letterhead, where to pair an empty register, a
   census of the register, the cover picture's held pixels, and
   `TOTAL AT CASH` with the count of lines carrying that rung. None of
   them is deleted and none of them is on a sheet.

   THE ASSERTIONS ARE ON THE SHEETS AND NOT ON THE SCREEN, because
   `getByText` would find every one of these in the desk note and pass
   while the paper still carried them. `.doc-page` is the sheet; what
   a printer lays down is what is inside one.
   ============================================================ */

/** Everything printed on the sheets, and nothing standing beside them. */
const onThePaper = (container: HTMLElement): string =>
  [...container.querySelectorAll('.doc-page')].map((page) => page.textContent ?? '').join('\n')

describe('the sheet is the customer’s and the room is the dealer’s', () => {
  let quote: QuoteDef
  beforeEach(() => {
    quote = issuedQuote('boat_stacer', '529 Assault Pro')
  })

  it('prints not one instruction for the dealer on a sheet of A4', () => {
    const { container } = render(<Document quoteId={quote.id} />)
    const paper = onThePaper(container)
    expect(paper.length).toBeGreaterThan(200)
    for (const said of [
      'Uploading one puts it here',
      'pair it on the subject',
      'Pair it on the subject',
      'offered and not taken',
      'frozen when the quote was raised',
      'Priced at',
      'Total at',
    ]) {
      expect(paper, `“${said}” is printed on the customer’s sheet`).not.toContain(said)
    }
  })

  it('keeps every one of them on the floor, in the note beside the sheet', () => {
    render(<Document quoteId={quote.id} />)
    const note = screen.getByRole('complementary', { name: 'What is not on the paper' })
    /* it is in the room and not on a page: a note inside a sheet
       would print, and printing it is the defect */
    expect(note.closest('.doc-page')).toBeNull()

    const doc = readDocument(quote)
    expect(within(note).getByText(/Uploading one puts it here/)).toBeInTheDocument()
    expect(within(note).getByText(/offered and not taken|cannot be said/)).toBeInTheDocument()
    if (doc.rung) {
      expect(
        within(note).getByText(
          new RegExp(`${escapeRe(doc.rung.label)} — ${doc.rung.carriedBy} of the ${doc.rung.of}`),
        ),
      ).toBeInTheDocument()
    }
  })

  it('names the total without naming the column it was read from', () => {
    const { container } = render(<Document quoteId={quote.id} />)
    const doc = readDocument(quote)
    expect(doc.rung, 'this quote carries no rung, so the case is vacuous').toBeTruthy()
    /* the tax convention is a fact about the figure and stays with it */
    const label = container.querySelector('.doc-money__sum .doc-lab')?.textContent
    expect(label).toBe(doc.totals.taxRate === null ? 'Total, tax included' : 'Total')
    expect(onThePaper(container)).not.toContain(`Total at ${doc.rung!.label}`)
  })

  it('states what a bare register did not carry, without saying where to fix it', () => {
    const target = quote.sections.find((s) => s.lineIds.length === 0 && s.blockId !== undefined)
    expect(target, 'this hull has no empty register, so the case is vacuous').toBeTruthy()
    const bare: QuoteDef = {
      ...quote,
      sections: quote.sections.map((s) =>
        s.blockId === target!.blockId ? { ...s, lineIds: [], pickedCount: 0, heldCount: 0 } : s,
      ),
      lines: quote.lines.filter((l) => !target!.lineIds.includes(l.id)),
    }
    insteadFile(bare)
    const { container } = render(<Document quoteId={bare.id} />)
    expect(onThePaper(container)).toContain('is paired with this one yet')
    expect(onThePaper(container)).not.toContain('own page and it shows here')
    const note = screen.getByRole('complementary', { name: 'What is not on the paper' })
    expect(within(note).getByText(/own page and it shows here/)).toBeInTheDocument()
  })
})
