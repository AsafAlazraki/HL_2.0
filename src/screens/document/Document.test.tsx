import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { EntityDef, ModuleDef, QuoteDef, RowData } from '@/domain/model'
import { makeCtx, rowLabel } from '@/domain/model'
import { money } from '@/domain/money'
import { catalogue, ctxFrom } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import { issue, mintQuote, quoteTotals, setCustomer, setNote } from '@/domain/quote'
import { INCLUDED, NOT_PRICED_HERE, readDocument } from '@/domain/quote/document'
import { Document, NO_QUOTE_HERE, NO_TERMS, PRINT_IS_THE_PAGE } from './Document'
import { NOT_PRICED_ON_PAPER } from './paper'

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
  /* THE CONTEXT EVERY SCREEN THAT FREEZES BUILDS — `ctxFrom` and not a
     hand-made one — so the letterhead this suite reads is the one the
     app freezes: the business the loaded file names. */
  const ctx = makeCtx({
    ...ctxFrom(sheet),
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

/** Everything printed on the sheets, and nothing standing beside them.
 *  `.doc-page` is the sheet; what a printer lays down is what is inside
 *  one, so an assertion about the paper reads this and never the screen
 *  — `getByText` would find the same words in the note beside the sheet
 *  and pass while the paper still carried them. */
const onThePaper = (container: HTMLElement): string =>
  [...container.querySelectorAll('.doc-page')].map((page) => page.textContent ?? '').join('\n')

/** The note beside the sheet, which print takes away with the room. */
const theNote = (): HTMLElement =>
  screen.getByRole('complementary', { name: 'What is not on the paper' })

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

  /* CRITIQUE OF MILESTONE 2, BLOCKER #2: "The one object that leaves the
     building has no dealership on it." The name is read off the pack's
     own manifest, never typed here. */
  it('opens with the dealership the file names, and never says it is unnamed', () => {
    const { container } = render(<Document quoteId={quote.id} />)
    const business = pack.manifest.name
    expect(business.trim()).not.toBe('')
    const cover = container.querySelector('.doc-page[data-page="1"]')!
    const letterhead = cover.querySelector('.doc-cover__house')
    expect(letterhead).toHaveTextContent(business)
    /* the first words on page 1 are the dealership's: the page label
       before them is the room's, drawn only on a phone and never printed */
    const printed = [...cover.querySelectorAll('.doc-page__flow')]
      .map((flow) => flow.textContent ?? '')
      .join('')
    expect(printed.trim().startsWith(business)).toBe(true)
    expect(onThePaper(container)).not.toMatch(/not been named/i)
    /* and every later page carries it in the running head */
    for (const page of container.querySelectorAll('.doc-page:not([data-page="1"])')) {
      expect(page.querySelector('.doc-page__house')).toHaveTextContent(business)
    }
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

  it('draws a band per section that put something on the quote, each head carrying its subtotal', () => {
    const { container } = render(<Document quoteId={quote.id} />)
    const doc = readDocument(quote)
    const taken = doc.sections.filter((s) => s.tables.some((t) => t.lines.length > 0))
    expect(taken.length).toBeGreaterThan(1)
    const heads = [...container.querySelectorAll('.doc-page .doc-band__name')].map(
      (node) => node.textContent ?? '',
    )
    for (const section of taken) {
      expect(heads.some((head) => head.includes(section.name))).toBe(true)
      if (section.subtotal !== null) {
        expect(onThePaper(container)).toContain(money(section.subtotal))
      }
    }
    /* a band with nothing on the quote is off the paper whole */
    for (const section of doc.sections.filter((s) => !taken.includes(s))) {
      expect(heads.some((head) => head.includes(section.name))).toBe(false)
    }
  })

  it('prints every frozen line on the paper, and its code on the note beside it', () => {
    const { container } = render(<Document quoteId={quote.id} />)
    const paper = onThePaper(container)
    for (const line of quote.lines) {
      expect(paper).toContain(line.label)
      /* the dealer's key for a row is not a thing a buyer orders by —
         unless the file's own name for it already carries it */
      if (line.code && !line.label.includes(line.code)) expect(paper).not.toContain(line.code)
      if (line.code) expect(theNote()).toHaveTextContent(line.code)
    }
  })

  it('dates the paper where a buyer reads a date, and keeps the freezing for the dealer', () => {
    const { container } = render(<Document quoteId={quote.id} />)
    expect(container.querySelector('.doc-cover__when')).toHaveTextContent(/^Issued \d/)
    expect(onThePaper(container)).not.toMatch(/reimport|frozen|cannot move/i)
    expect(
      within(theNote()).getByText(/a new price file changes the next quote/),
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
    /* the letterhead too: it was frozen at mint, and the file that named
       it is gone */
    expect(again.container.querySelector('.doc-cover__house')).toHaveTextContent(pack.manifest.name)

    await loadTheFile()
  })
})

/* ============================================================
   THE THREE WORDS, ON THE PAGE
   ============================================================ */

/**
 * THE WORD ON THE ROW, NOT THE WORD ON THE PAGE. Each case below finds
 * the LINE by its own name and reads the cell beside it, so a document
 * where no line said the word cannot pass by the word standing
 * somewhere else.
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

describe('a figure, Included and Not priced on this quote read as three', () => {
  let quote: QuoteDef
  beforeEach(() => {
    quote = issuedQuote('boat_stacer', '529 Assault Pro')
  })

  it('needs no legend: the words in the money column are the buyer’s own', () => {
    const { container } = render(<Document quoteId={quote.id} />)
    /* the legend defined "the level below" and "the price file" to a
       buyer; the words it explained now explain themselves */
    expect(screen.queryByRole('region', { name: 'How to read a line' })).toBeNull()
    const cells = [
      ...container.querySelectorAll('.doc-page .doc-row:not(.doc-row--cols) .doc-row__fig'),
    ]
    expect(cells.length).toBeGreaterThan(0)
    for (const cell of cells) {
      const said = (cell.textContent ?? '').trim()
      const isFigure = /^[−+]?\$/.test(said)
      expect(
        isFigure || said === INCLUDED || said === NOT_PRICED_ON_PAPER,
        `a cell reads "${said}"`,
      ).toBe(true)
    }
  })

  it('prints Included on the row where the file states a charge of nothing, never $0', () => {
    const [first, ...rest] = quote.lines
    insteadFile({ ...quote, lines: [{ ...first, unitPrice: 0, qty: 1 }, ...rest] })
    render(<Document quoteId={quote.id} />)
    expect(cellFor(first.label)).toBe(INCLUDED)
    expect(cellFor(first.label)).not.toContain('$')
  })

  it('prints Not priced on this quote on the row, and the reason on the dealer’s note', () => {
    const [first, ...rest] = quote.lines
    const withBlank: QuoteDef = { ...quote, lines: [{ ...first, unitPrice: null }, ...rest] }
    insteadFile(withBlank)
    const { container } = render(<Document quoteId={quote.id} />)
    const line = readDocument(withBlank)
      .sections.flatMap((s) => s.tables)
      .flatMap((t) => t.lines)
      .find((l) => l.id === first.id)!
    expect(cellFor(first.label)).toBe(NOT_PRICED_ON_PAPER)
    /* the engine's word is the dealer's, and it stays off the paper */
    expect(onThePaper(container)).not.toContain(NOT_PRICED_HERE)
    /* the reason names the price column, so it is the dealer's to read */
    expect(line.why).not.toBe('')
    expect(onThePaper(container)).not.toContain(line.why)
    expect(within(theNote()).getByText(new RegExp(escapeRe(line.why)))).toBeInTheDocument()
    /* and the buyer is told the one thing they need, beside the total */
    expect(onThePaper(container)).toContain(
      'One item is not priced on this quote and is not in this total.',
    )
  })

  it('a charged line prints a figure and neither of the two words', () => {
    const charged = quote.lines.find((l) => (l.unitPrice ?? 0) > 0)
    expect(charged, 'this hull raises no priced line').toBeDefined()
    render(<Document quoteId={quote.id} />)
    const cell = cellFor(charged!.label)
    expect(cell).toContain('$')
    expect(cell).not.toContain(INCLUDED)
    expect(cell).not.toContain(NOT_PRICED_ON_PAPER)
  })

  it('counts what a register offered and nobody took on the note, never on the paper', () => {
    const some = quote.sections.find(
      (s) => s.lineIds.length > 0 && (s.pickedCount ?? 0) > s.lineIds.length,
    )
    const none = quote.sections.find((s) => s.lineIds.length === 0 && (s.pickedCount ?? 0) > 0)
    expect(
      some ?? none,
      'this hull offers nothing it did not take, so the case is vacuous',
    ).toBeDefined()
    const { container } = render(<Document quoteId={quote.id} />)
    expect(onThePaper(container)).not.toMatch(/offered|Not taken|Optional\./)

    if (some) {
      const offered = (some.pickedCount ?? 0) - some.lineIds.length
      expect(
        within(theNote()).getAllByText(new RegExp(`: ${offered} more offered`)).length,
      ).toBeGreaterThan(0)
    }
    if (none) {
      expect(
        within(theNote()).getAllByText(new RegExp(`: ${none.pickedCount} offered, none taken`))
          .length,
      ).toBeGreaterThan(0)
    }
  })
})

/* ============================================================
   YOUR PRICE ADDS UP, WHERE THE READER CAN SEE IT
   ============================================================ */

describe('your price', () => {
  it('lists every band the paper printed, and they sum to the total under the rule', () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    render(<Document quoteId={quote.id} />)
    const price = screen.getByRole('region', { name: 'Your price' })
    const figures = [...price.querySelectorAll('.doc-sum:not(.doc-sum--total) dd')]
      .map((dd) => (dd.textContent ?? '').trim())
      .filter((said) => said.startsWith('$'))
      .map((said) => Number(said.replace(/[$,]/g, '')))
    expect(figures.length).toBeGreaterThan(1)
    const sum = figures.reduce((n, x) => n + x, 0)
    expect(money(sum)).toBe(money(quoteTotals(quote).total))
    expect(within(price).getByText('Total, tax included')).toBeInTheDocument()
  })
})

/* ============================================================
   THE TERMS, THE PRINT, AND NO DOCUMENT AT ALL
   ============================================================ */

describe('the dealer’s terms', () => {
  it('print none where none were typed, and the paper says nothing about it', () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    /* the file names the business and carries no standing terms, so this
       quote really was raised with none */
    expect(quote.note).toBeUndefined()
    const { container } = render(<Document quoteId={quote.id} />)
    expect(screen.queryByRole('region', { name: 'The terms of this quote' })).toBeNull()
    expect(onThePaper(container)).not.toMatch(/terms/i)
    expect(within(theNote()).getByText(NO_TERMS)).toBeInTheDocument()
  })

  it('print what the document froze, not what the business says today', () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    const written = { ...quote, note: 'This quote is valid for 30 days from the date above.' }
    quotes.setState({ quotes: [written] })
    const { container } = render(<Document quoteId={written.id} />)
    expect(onThePaper(container)).toContain('This quote is valid for 30 days from the date above.')
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
  it('prints, and says where the PDF comes from in a salesperson’s words', async () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    const print = vi.fn<() => void>()
    render(<Document quoteId={quote.id} print={print} />)
    await userEvent.click(screen.getByRole('button', { name: 'Print' }))
    expect(print).toHaveBeenCalledTimes(1)
    expect(screen.getByText(PRINT_IS_THE_PAGE)).toBeInTheDocument()
    expect(PRINT_IS_THE_PAGE).not.toMatch(/renderer|nodes/)
  })

  it('names the page for the quote while it is open, so a saved PDF is not called HelmLogic', () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    const before = document.title
    const { unmount } = render(<Document quoteId={quote.id} />)
    expect(document.title).toBe(
      `${pack.manifest.name} quote ${quote.reference} – ${quote.subjectLabel}`,
    )
    unmount()
    expect(document.title).toBe(before)
  })

  it('offers the way back to the build, and none of the doors the pill carries', async () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    const goBack = vi.fn<() => void>()
    render(
      <Document
        quoteId={quote.id}
        goBack={goBack}
        ways={[
          { href: '/', title: 'Home', say: '' },
          { href: '/quotes', title: 'The register', say: '' },
          { href: '/quote/new', title: 'Start a quote', say: '' },
        ]}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Back to the build' }))
    expect(goBack).toHaveBeenCalledTimes(1)
    /* rule (a): the pill carries the doors, so the paper's own chrome
       repeats none of them — and draws no ways at all beside the sheet */
    expect(screen.queryByRole('navigation', { name: 'Elsewhere in this app' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Home' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'The register' })).toBeNull()
  })
})

describe('no document at this address', () => {
  it('says so in the dealer’s words, and offers only what the pill does not', () => {
    render(
      <Document
        quoteId="nothing-is-filed-here"
        goBack={vi.fn<() => void>()}
        ways={[
          { href: '/', title: 'Home', say: '' },
          { href: '/quotes', title: 'The register', say: '' },
          { href: '/quote/new', title: 'Start a quote', say: '' },
        ]}
      />,
    )
    expect(screen.getByText(/No quote is filed at this address/)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(escapeRe(NO_QUOTE_HERE)))).toBeInTheDocument()
    /* rule (c): no plan word on a screen */
    expect(screen.getByTestId('document')).not.toHaveTextContent(/Milestone|backend/)
    /* a quote this browser does not hold has no build to go back to */
    expect(screen.queryByRole('button', { name: 'Back to the build' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Start a quote' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Home' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'The register' })).toBeNull()
  })
})

/* ============================================================
   WHAT IS ON THE PAPER AND WHAT IS ON THE DESK.

   The flow critique of 2026-09-18 read five things off an issued
   document that were written for the person who MADE it; the reading
   of 2026-09-23 found eleven more (`paper.ts` names them). None of
   them is deleted and none of them is on a sheet.
   ============================================================ */

/** The quote spec's rule 3 (`docs/research/proposal/quote-spec.md` §0):
 *  the words the customer's copy never prints. */
const APP_WORDS =
  /\b(price file|level|rung|register|rows?|offered|frozen|reimport(?:ed)?|slot|engine hole|prop part|source cell|organisation|milestone)\b/i

describe('the sheet is the customer’s and the room is the dealer’s', () => {
  let quote: QuoteDef
  beforeEach(() => {
    quote = issuedQuote('boat_stacer', '529 Assault Pro')
  })

  it('uses the customer’s words and none of the app’s', () => {
    const { container } = render(<Document quoteId={quote.id} />)
    const paper = onThePaper(container)
    expect(paper.length).toBeGreaterThan(200)
    const hit = APP_WORDS.exec(paper)
    expect(hit, `“${hit?.[0]}” is printed on the customer’s sheet`).toBeNull()
  })

  it('prints not one instruction for the dealer on a sheet of A4', () => {
    const { container } = render(<Document quoteId={quote.id} />)
    const paper = onThePaper(container)
    for (const said of [
      'Uploading one puts it here',
      'pair it on the subject',
      'Pair it on the subject',
      'offered and not taken',
      'Priced at',
      'Total at',
      'Prop Part',
      'Engine Hole',
      'nobody has typed one',
      'Every line below carries a figure',
    ]) {
      expect(paper, `“${said}” is printed on the customer’s sheet`).not.toContain(said)
    }
  })

  it('keeps every one of them on the floor, in the note beside the sheet', () => {
    render(<Document quoteId={quote.id} />)
    const note = theNote()
    /* it is in the room and not on a page: a note inside a sheet
       would print, and printing it is the defect */
    expect(note.closest('.doc-page')).toBeNull()

    const doc = readDocument(quote)
    expect(within(note).getByText(/no mark is held for this dealership yet/)).toBeInTheDocument()
    expect(within(note).getAllByText(/offered/).length).toBeGreaterThan(0)
    expect(within(note).getByText(/no rate is typed on this quote/)).toBeInTheDocument()
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

  it('leaves a bare register off the paper, and says on the note what to do about it', () => {
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
    expect(onThePaper(container)).not.toContain('is paired with this one yet')
    expect(onThePaper(container)).not.toContain('own page and it shows here')
    expect(within(theNote()).getByText(/is paired with this one yet/)).toBeInTheDocument()
    expect(within(theNote()).getByText(/own page and it shows here/)).toBeInTheDocument()
  })

  it('leaves the name blank on a draft addressed to nobody, and tells the dealer why', () => {
    const blank: QuoteDef = { ...quote, state: 'draft', customer: { name: '' } }
    delete blank.issuedAt
    insteadFile(blank)
    const { container } = render(<Document quoteId={blank.id} />)
    /* a line to write on, the height of a name, and nothing said on it */
    expect(container.querySelector('.doc-page .doc-money__blank')).not.toBeNull()
    expect(onThePaper(container)).not.toMatch(/nobody/i)
    expect(
      within(theNote()).getByText(/cannot be given to a customer until it has a name/),
    ).toBeInTheDocument()
  })
})
