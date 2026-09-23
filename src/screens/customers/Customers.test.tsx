import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { CellValue, EntityDef, FieldDef, QuoteDef, QuoteLine, RowData } from '@/domain/model'
import { makeCtx } from '@/domain/model'
import { readDocument } from '@/domain/quote/document'
import { freezeCustomer } from '@/domain/quote/freeze'
import { linkCustomer } from '@/domain/quote/commands'
import { quoteTotals } from '@/domain/quote/totals'
import {
  CUSTOMER_ADDRESS_FIELD,
  CUSTOMER_EMAIL_FIELD,
  CUSTOMER_NOTE_FIELD,
  CUSTOMER_PHONE_FIELD,
  CUSTOMER_TABLE_ID,
  customerRegister,
  readCustomer,
} from '@/domain/people/customers'
import { DESK_TITLE, alreadyFiled } from '@/domain/people/book'
import { createMemoryDatabase } from '@/data/memory/database'
import { memoryQuotes } from '@/data/memory/repositories'
import { catalogue, ctxFrom } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import {
  BUILD_TYPES_NOT_FILES,
  Customers,
  GIVEN_KEEPS_ITS_NAME,
  NOBODY_AT_THIS_ADDRESS,
  NO_WAY_TO_OPEN,
} from './Customers'

/* ============================================================
   THE BOOK, RENDERED AND PRESSED, BY ROLE AND BY TEXT.

   NOTHING HERE IS SEEDED AND NOBODY HERE IS INVENTED. Every person
   in this file is filed by pressing the screen's own act, through
   `catalogue.apply` — the same command, the same inverse and the same
   typed event a dealer's press produces — and every quote is the
   smallest honest document `customerLink.test.ts` builds. The first
   assertion the suite makes is that a browser with no book says so
   and draws no table.

   NO FIGURE IS TYPED TWICE. A total on a letter is asked of
   `quoteTotals` and then looked for on the screen, and the lines on
   the paper are asked of `readCustomer` — the function `freezeCustomer`
   itself calls — so a paper that drifted from the document would fail
   here rather than in front of a customer.

   BOTH STORES ARE REOPENED BEFORE EVERY CASE. vitest gives one module
   instance to a whole file, so a person filed in one case is filed for
   the rest of it otherwise.
   ============================================================ */

const ORG = 'northside'
const ISO = '2026-01-01T00:00:00.000Z'
const NOW = new Date('2026-09-17T10:00:00+10:00')
const clock = () => NOW

/** ONE ORDINARY TABLE, so the sheet is open. A browser with a price
 *  file in it has tables; the book is simply not one of them yet. */
function aSheet(): EntityDef {
  return {
    id: 'boat_stacer',
    orgId: ORG,
    name: 'Stacer',
    accent: 'blue',
    kind: 'boat',
    role: 'base',
    fields: [{ id: 'f-model', name: 'Model', type: 'text' }],
    position: { x: 0, y: 0 },
    createdAt: ISO,
    updatedAt: ISO,
  }
}

const openTheSheet = (): Promise<void> =>
  catalogue.getState().load({
    entities: [aSheet()],
    rowsByEntity: { boat_stacer: [] as RowData[] },
    manifest: { name: 'Northside Marine' } as never,
  })

/** The register as the app makes it, with whatever a dealer added. */
function registerTable(extra: FieldDef[] = []): EntityDef {
  return {
    id: CUSTOMER_TABLE_ID,
    orgId: ORG,
    name: 'Clients',
    accent: 'teal',
    kind: 'custom',
    role: 'base',
    displayFieldId: 'f-name',
    fields: [
      { id: 'f-name', name: 'Name', type: 'text', required: true },
      { id: CUSTOMER_PHONE_FIELD, name: 'Phone', type: 'text' },
      { id: CUSTOMER_EMAIL_FIELD, name: 'Email', type: 'text' },
      { id: CUSTOMER_ADDRESS_FIELD, name: 'Address', type: 'text' },
      { id: CUSTOMER_NOTE_FIELD, name: 'Notes', type: 'text' },
      ...extra,
    ],
    position: { x: 0, y: 0 },
    createdAt: ISO,
    updatedAt: ISO,
  }
}

const THE_ROW = 'cst-1'

/**
 * A BROWSER THAT ALREADY HAS A BOOK — which is every day after the
 * first. Nobody is invented: this is the row a filing wrote yesterday,
 * read back out of the database the way `catalogue.load` reads every
 * other table back. The cases that are ABOUT filing press the act.
 */
const openWithABook = (values: Record<string, CellValue>, extra: FieldDef[] = []): Promise<void> =>
  catalogue.getState().load({
    entities: [aSheet(), registerTable(extra)],
    rowsByEntity: {
      boat_stacer: [] as RowData[],
      [CUSTOMER_TABLE_ID]: [
        {
          id: THE_ROW,
          orgId: ORG,
          entityId: CUSTOMER_TABLE_ID,
          values,
          createdAt: ISO,
          updatedAt: ISO,
        },
      ],
    },
    manifest: { name: 'Northside Marine' } as never,
  })

/** What a quote freezes off that row — the build's own reading. */
const frozenFor = (rowId: string) =>
  freezeCustomer(makeCtx({ ...ctxFrom(catalogue.getState()), orgId: ORG }), rowId)!

let n = 0

function line(label: string, unitPrice: number | null): QuoteLine {
  n += 1
  return {
    id: `l${n}`,
    entityId: 'boat_stacer',
    rowId: 'row_1',
    label,
    qty: 1,
    unitPrice,
    priceFieldId: 'fld_cash',
    priceColumnName: 'Cash',
    levelKey: 'cash',
    levelResolved: 'cash',
    levels: [{ key: 'cash', label: 'Cash', fieldId: 'fld_cash', value: unitPrice, scope: 'quote' }],
  }
}

/** The smallest honest document, filed the way the picker files one. */
function fileAQuote(over: Partial<QuoteDef> = {}): QuoteDef {
  n += 1
  const hull = line('Stacer 529 Assault Pro', 28_530)
  const at = new Date(NOW.getTime() - n * 3_600_000).toISOString()
  const quote: QuoteDef = {
    id: `q${n}`,
    orgId: ORG,
    reference: `2026091${n}-01`,
    state: 'draft',
    viewId: 'view_1',
    rootTableId: 'boat_stacer',
    rootRowId: 'row_1',
    subjectLabel: 'Stacer 529 Assault Pro',
    subjectSpecs: [],
    sections: [
      { blockId: '__subject', tableId: 'boat_stacer', title: 'Stacer', lineIds: [hull.id] },
    ],
    chapters: [{ id: '__subject', title: 'Stacer', tableId: 'boat_stacer' }],
    lines: [hull],
    adjustments: [],
    events: [],
    levelKey: 'cash',
    customer: { name: 'Sarah Jones' },
    preparedBy: 'Asaf',
    createdAt: at,
    updatedAt: at,
    ...over,
  }
  quotes.getState().file(quote, {
    id: `e-${quote.id}`,
    kind: 'minted',
    at: quote.createdAt,
    said: `${quote.subjectLabel} — quote ${quote.reference}`,
    changed: [],
  })
  return quote
}

/* THE SEAMS, AS SPIES: the screen never reaches for the router, so what
   a press does is a function handed in and read back — the same shape
   the route hands in. */
let opened: { id: string; state: string }[] = []
let started = 0
const seams = {
  openQuote: (id: string, state: string) => {
    opened.push({ id, state })
  },
  newQuote: () => {
    started += 1
  },
}

beforeEach(async () => {
  n = 0
  opened = []
  started = 0
  await quotes.getState().open(memoryQuotes(ORG, { db: createMemoryDatabase() }))
  await openTheSheet()
})

const draw = (props: Record<string, unknown> = {}) =>
  render(<Customers business="Northside Marine" now={clock} {...seams} {...props} />)

const press = (name: RegExp | string) => userEvent.click(screen.getByRole('button', { name }))

/** File one person by hand, through the screen's own form. */
async function fileByHand(name: string, cells: Record<string, string> = {}): Promise<void> {
  const form = screen.getByRole('form', { name: /File (the first )?customer/ })
  await userEvent.type(within(form).getByLabelText('Name'), name)
  for (const [label, value] of Object.entries(cells)) {
    await userEvent.type(within(form).getByLabelText(label), value)
  }
  await userEvent.click(within(form).getByRole('button', { name: /^File/ }))
}

const theBook = (): EntityDef | undefined => customerRegister(catalogue.getState().tables)
const bookRows = (): readonly RowData[] => catalogue.getState().rows[CUSTOMER_TABLE_ID] ?? []

/* ============================================================ */

describe('a browser with no book says so, and draws no table', () => {
  it('teaches what a customer is, why it is empty and what to do', () => {
    draw()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Customers')
    expect(screen.getByRole('heading', { name: 'Nobody is filed yet.' })).toBeInTheDocument()
    expect(screen.getByText('What a customer is here')).toBeInTheDocument()
    expect(screen.getByText('Why it is empty today')).toBeInTheDocument()
    expect(screen.getByText('What to do')).toBeInTheDocument()
    /* the one sentence about what the build does not do yet, kept as a
       constant so the pass that retires it has one place to look */
    expect(screen.getByText(new RegExp(BUILD_TYPES_NOT_FILES.slice(0, 40)))).toBeInTheDocument()
  })

  it('draws no grid at all rather than an empty one', () => {
    draw()
    expect(screen.queryByRole('grid')).not.toBeInTheDocument()
    expect(screen.queryByRole('row')).not.toBeInTheDocument()
  })

  it('says the book is a table the sheet does not carry yet', () => {
    draw()
    expect(theBook()).toBeUndefined()
    expect(
      screen.getByText(/Made as a table on the Master Price File sheet the day the first person/),
    ).toBeInTheDocument()
  })

  it('invents no photograph, and says why there is none', () => {
    draw()
    expect(document.querySelectorAll('img')).toHaveLength(0)
    expect(screen.getByText(/No photograph stands on this screen/)).toBeInTheDocument()
  })
})

describe('the first filing makes the book, in one step, with one undo', () => {
  it('writes the table and the row together and says both', async () => {
    draw()
    await fileByHand('Sarah Jones', { Phone: '0400 123 456' })

    expect(theBook()?.name).toBe('Customers')
    expect(bookRows()).toHaveLength(1)
    const step = screen.getByTestId('last-step')
    expect(step).toHaveTextContent('Sarah Jones is filed')
    expect(within(step).getByRole('button', { name: 'Undo' })).toBeInTheDocument()
  })

  it('takes the table away again with the row, on one press', async () => {
    draw()
    await fileByHand('Sarah Jones')
    await userEvent.click(within(screen.getByTestId('last-step')).getByRole('button'))

    expect(theBook(), 'the book was made by that act, so the way back unmakes it').toBeUndefined()
    expect(
      within(screen.getByTestId('last-step')).getByRole('button', { name: 'Put it back' }),
    ).toBeInTheDocument()
  })

  it('refuses a filing with no name, where the filing is', async () => {
    draw()
    const form = screen.getByRole('form', { name: /File the first customer/ })
    await userEvent.click(within(form).getByRole('button', { name: /^File/ }))
    expect(theBook()).toBeUndefined()
    expect(screen.getByText('A person needs a name before they can be filed.')).toBeInTheDocument()
  })
})

describe('the letter is the resting state, and the paper is what prints', () => {
  it('prints the block the document prints, in the document’s own order', async () => {
    draw()
    await fileByHand('Sarah Jones', {
      Phone: '0400 123 456',
      Email: 'sarah@example.test',
      Address: '12 Harbour Rd, Redcliffe QLD 4020',
      Notes: 'Blue Hilux, keen on a 529',
    })

    const book = theBook()!
    const read = readCustomer(book, bookRows()[0]!)
    /* the engine's own reading, drawn in the engine's own order */
    const paper = document.querySelector('.cu-paper')!
    expect(within(paper as HTMLElement).getByRole('heading')).toHaveTextContent('Sarah Jones')
    const printed = [...paper.querySelectorAll('.cu-paper__line')].map((p) => p.textContent)
    expect(printed).toEqual(read.contact)
    expect(printed).toEqual([
      '0400 123 456',
      'sarah@example.test',
      '12 Harbour Rd, Redcliffe QLD 4020',
    ])
  })

  it('keeps the yard’s note off the paper, and off the document', async () => {
    const quote = fileAQuote()
    draw()
    await fileByHand('Sarah Jones', {
      Phone: '0400 123 456',
      Notes: 'Blue Hilux, keen on a 529',
    })

    /* on the screen: the note is in its own band, on the floor, never
       on the plate */
    const paper = document.querySelector('.cu-paper')!
    expect(paper.textContent).not.toContain('Blue Hilux')
    const band = screen.getByRole('complementary', { name: 'The yard’s note' })
    expect(band).toHaveTextContent('Blue Hilux, keen on a 529')
    expect(band).toHaveTextContent(/never printed on a quote/i)

    /* and on the document, read by the printer's own reader: freeze the
       row onto the quote the way the build does, then ask
       `readDocument` what a customer would be handed */
    const ctx = makeCtx({ ...ctxFrom(catalogue.getState()), orgId: ORG })
    const frozen = freezeCustomer(ctx, bookRows()[0]!.id)!
    const linked = quotes.getState().apply(quote.id, linkCustomer(frozen))
    expect('refused' in linked).toBe(false)
    const printedQuote = readDocument(quotes.getState().get(quote.id)!)
    expect(printedQuote.customer.contact).toEqual(['0400 123 456'])
    expect(JSON.stringify(printedQuote)).not.toContain('Blue Hilux')
  })

  it('shows an absent line as an act and never as a value on the paper', async () => {
    draw()
    await fileByHand('Sarah Jones')
    const paper = document.querySelector('.cu-paper')!
    expect(paper.textContent).not.toMatch(/No phone|No email|No address/)
    expect(paper).toHaveTextContent(/prints the name alone/)
    expect(screen.getByRole('button', { name: 'Add phone' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change name' })).toBeInTheDocument()
  })

  it('changes a line through the sheet’s own command, with the way back', async () => {
    draw()
    await fileByHand('Sarah Jones')
    await press('Add phone')
    await userEvent.type(screen.getByLabelText('Phone'), '0400 123 456')
    await press(/^Done/)

    expect(bookRows()[0]!.values[CUSTOMER_PHONE_FIELD]).toBe('0400 123 456')
    expect(document.querySelector('.cu-paper')!.textContent).toContain('0400 123 456')
    const step = screen.getByTestId('last-step')
    expect(step).toHaveTextContent(/A change here is used on the next quote/)
    await userEvent.click(within(step).getByRole('button', { name: 'Undo' }))
    expect(bookRows()[0]!.values[CUSTOMER_PHONE_FIELD] ?? '').toBe('')
  })

  it('says nobody is at an address that names no row', async () => {
    await openWithABook({ 'f-name': 'Sarah Jones' })
    draw({ who: 'not-a-row' })
    expect(screen.getByRole('heading', { name: NOBODY_AT_THIS_ADDRESS })).toBeInTheDocument()
  })
})

describe('the quotes on a letter', () => {
  const aLetterWithOneQuote = async (over: Partial<QuoteDef> = {}): Promise<QuoteDef> => {
    await openWithABook({ 'f-name': 'Sarah Jones' })
    return fileAQuote({ ...frozenFor(THE_ROW), ...over })
  }

  it('leads a row with the boat, its reference, its standing in words and the register’s total', async () => {
    const quote = await aLetterWithOneQuote()
    draw()

    const list = screen.getByRole('region', { name: /Quotes addressed to Sarah Jones/ })
    expect(list).toHaveTextContent('Stacer 529 Assault Pro')
    expect(list).toHaveTextContent(quote.reference)
    expect(list).toHaveTextContent('Draft')
    /* the figure is asked of the engine, never typed */
    const total = quoteTotals(quotes.getState().get(quote.id)!).total
    expect(list.textContent).toContain(String(Math.round(total).toLocaleString('en-AU')))
  })

  it('says in words that no picture is held, rather than drawing a hole', async () => {
    await aLetterWithOneQuote()
    draw()
    const list = screen.getByRole('region', { name: /Quotes addressed to/ })
    expect(list).toHaveTextContent('no picture held')
    expect(list.querySelectorAll('img')).toHaveLength(0)
  })

  it('opens a draft where it is written', async () => {
    const draft = await aLetterWithOneQuote()
    draw()
    await userEvent.click(
      within(screen.getByRole('region', { name: /Quotes addressed to/ })).getByRole('button'),
    )
    expect(opened).toEqual([{ id: draft.id, state: 'draft' }])
  })

  it('opens a given quote as the paper the customer keeps', async () => {
    const given = await aLetterWithOneQuote({ state: 'issued', issuedAt: ISO })
    draw()
    await userEvent.click(
      within(screen.getByRole('region', { name: /Quotes addressed to/ })).getByRole('button'),
    )
    expect(opened).toEqual([{ id: given.id, state: 'issued' }])
  })

  it('refuses to open with a sentence when it was handed no way to', async () => {
    await aLetterWithOneQuote()
    render(<Customers business="Northside Marine" now={clock} />)
    await userEvent.click(
      within(screen.getByRole('region', { name: /Quotes addressed to/ })).getByRole('button'),
    )
    expect(screen.getByText(NO_WAY_TO_OPEN)).toBeInTheDocument()
  })
})

describe('two Sarah Joneses at the desk, and no modal anywhere', () => {
  it('says one is already filed, with open and file-another beside it', async () => {
    draw()
    await fileByHand('Sarah Jones')
    await press(/^File a customer/)

    const form = screen.getByRole('form', { name: 'File a customer' })
    await userEvent.type(within(form).getByLabelText('Name'), 'Sarah Jones')

    /* ONCE, not twice: the act is refused BY this block rather than
       carrying a second copy of the same sentence under itself */
    expect(screen.getAllByText(alreadyFiled('Sarah Jones'))).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Open Sarah Jones' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'File another Sarah Jones' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('keeps both, because two people with the same name are two people', async () => {
    draw()
    await fileByHand('Sarah Jones')
    await press(/^File a customer/)
    const form = screen.getByRole('form', { name: 'File a customer' })
    await userEvent.type(within(form).getByLabelText('Name'), 'Sarah Jones')
    await press('File another Sarah Jones')
    await userEvent.click(within(form).getByRole('button', { name: /^File another Sarah Jones$/ }))

    expect(bookRows()).toHaveLength(2)
  })
})

const names = (): string[] =>
  within(screen.getByRole('grid', { name: 'Customers' }))
    .getAllByRole('row')
    .map((r) => r.querySelector('.cu-cell--name')?.textContent ?? '')

describe('the book: register order at rest, the alphabet as a press', () => {
  const fileTwo = async (): Promise<void> => {
    await fileByHand('Zara Bell')
    await press(/^File a customer/)
    const form = screen.getByRole('form', { name: 'File a customer' })
    await userEvent.type(within(form).getByLabelText('Name'), 'Adam Cole')
    await userEvent.click(within(form).getByRole('button', { name: /^File them$/ }))
  }

  it('lists people in the order they were filed until somebody presses A to Z', async () => {
    draw()
    await fileTwo()
    await press(/^Everyone in the book/)

    expect(names()).toEqual(['Zara Bell', 'Adam Cole'])
    expect(screen.getByText('In the order they were filed')).toBeInTheDocument()

    await press('A to Z')
    expect(names()).toEqual(['Adam Cole', 'Zara Bell'])
  })

  it('cuts the book by what each person is doing next, when that is pressed', async () => {
    draw()
    await fileTwo()
    await press(/^Everyone in the book/)
    await press('At the desk')

    expect(screen.getByText(DESK_TITLE.none)).toBeInTheDocument()
  })

  it('prints its keyboard beside the list and moves the cursor on J and K', async () => {
    draw()
    await fileTwo()
    await press(/^Everyone in the book/)

    const keys = screen.getByText(/move/).closest('p')!
    expect(keys).toHaveTextContent('J')
    expect(keys).toHaveTextContent('Enter')
    expect(keys).toHaveTextContent('/')

    const grid = screen.getByRole('grid', { name: 'Customers' })
    grid.focus()
    await userEvent.keyboard('j')
    const rows = within(grid).getAllByRole('row')
    expect(rows[1]).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('heading', { name: 'Adam Cole' })).toBeInTheDocument()
  })

  it('quotes back the words that found nobody', async () => {
    draw()
    await fileTwo()
    await press(/^Everyone in the book/)
    await userEvent.type(screen.getByLabelText('Find a customer'), 'hovercraft')
    expect(screen.getByText(/Nothing in the book matches “hovercraft”/)).toBeInTheDocument()
  })
})

describe('the names typed on quotes, with nobody filed behind them', () => {
  it('lists one line per quote and files the name from there', async () => {
    const draft = fileAQuote()
    draw()

    const pile = screen.getByRole('region', { name: 'Names typed on quotes, not filed' })
    expect(pile).toHaveTextContent('Sarah Jones')
    expect(pile).toHaveTextContent(draft.reference)

    await userEvent.click(within(pile).getByRole('button', { name: /^File Sarah Jones/ }))

    expect(bookRows()).toHaveLength(1)
    /* and the draft is addressed to the row the press made */
    expect(quotes.getState().get(draft.id)!.customerRef?.rowId).toBe(bookRows()[0]!.id)
  })

  it('folds nothing: two quotes that both say Sarah Jones are two lines', async () => {
    fileAQuote()
    fileAQuote()
    draw()
    const pile = screen.getByRole('region', { name: 'Names typed on quotes, not filed' })
    expect(within(pile).getAllByRole('listitem')).toHaveLength(2)
  })

  it('says a given quote keeps the name it was given', async () => {
    fileAQuote({ state: 'issued', issuedAt: ISO })
    draw()
    const pile = screen.getByRole('region', { name: 'Names typed on quotes, not filed' })
    expect(pile).toHaveTextContent(GIVEN_KEEPS_ITS_NAME)
  })
})

describe('the doors off this screen', () => {
  it('offers the book as a sheet, by address', async () => {
    draw()
    await fileByHand('Sarah Jones')
    const door = screen.getByRole('link', { name: /Open the book as a sheet/ })
    expect(door).toHaveAttribute('href', `/data/${CUSTOMER_TABLE_ID}`)
  })

  it('starts a quote at the picker', async () => {
    draw()
    await press('Start a quote')
    expect(started).toBe(1)
  })
})

describe('the dealer’s own columns', () => {
  it('draws a column this app never shipped, off the floor and never on the paper', async () => {
    await openWithABook({ 'f-name': 'Sarah Jones', 'f-abn': '51 824 753 556' }, [
      { id: 'f-abn', name: 'ABN', type: 'text' },
    ])
    draw()

    expect(screen.getByText('ABN')).toBeInTheDocument()
    expect(screen.getByText('51 824 753 556')).toBeInTheDocument()
    expect(document.querySelector('.cu-paper')!.textContent).not.toContain('51 824 753 556')
    /* the head says the dealer's own name for the table, not ours */
    expect(screen.getByText(/A table on the sheet · Clients · 6 columns/)).toBeInTheDocument()
  })

  it('reads the name through the register’s own display column, whatever it is called', async () => {
    await openWithABook({ 'f-name': 'Sarah Jones' })
    draw()
    expect(
      within(document.querySelector('.cu-paper') as HTMLElement).getByRole('heading'),
    ).toHaveTextContent('Sarah Jones')
  })
})
