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
import { DESK_TITLE, QUOTED, alreadyFiled, behindSay } from '@/domain/people/book'
import { engineWordsIn } from '@/screens/configurator/say'
import { createMemoryDatabase } from '@/data/memory/database'
import { memoryQuotes } from '@/data/memory/repositories'
import { catalogue, ctxFrom } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import {
  Customers,
  NAME_NEEDED,
  NOBODY_AT_THIS_ADDRESS,
  NO_SHEET_FOR_A_BOOK,
  NO_WAY_TO_OPEN,
  NO_WAY_TO_THE_PICKER,
  WHERE_CUSTOMERS_COME_FROM,
} from './Customers'

/* ============================================================
   THE BOOK, RENDERED AND PRESSED, BY ROLE AND BY TEXT.

   NOTHING HERE IS SEEDED AND NOBODY HERE IS INVENTED. Every person
   in this file is a name typed on a quote, or added or kept by
   pressing the screen's own act, through `catalogue.apply` — the same
   command, the same inverse and the same typed event a dealer's press
   produces — and every quote is the smallest honest document
   `customerLink.test.ts` builds. The first assertion the suite makes
   is that a desk where nobody is a customer says where customers come
   from, and draws no table.

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

/** Add one person by hand, through the screen's own form — opening it
 *  first from a person's page, where it is one press away. */
async function addByHand(name: string, cells: Record<string, string> = {}): Promise<void> {
  if (!screen.queryByRole('form', { name: 'Add a customer' })) {
    await userEvent.click(screen.getByRole('button', { name: /^Add a customer/ }))
  }
  const form = screen.getByRole('form', { name: 'Add a customer' })
  await userEvent.type(within(form).getByLabelText('Name'), name)
  for (const [label, value] of Object.entries(cells)) {
    await userEvent.type(within(form).getByLabelText(label), value)
  }
  await userEvent.click(within(form).getByRole('button', { name: /^Add (them|another)/ }))
}

const theBook = (): EntityDef | undefined => customerRegister(catalogue.getState().tables)
const bookRows = (): readonly RowData[] => catalogue.getState().rows[CUSTOMER_TABLE_ID] ?? []
const paper = (): HTMLElement => document.querySelector('.cu-paper') as HTMLElement
/** the head's count, as one line of text */
const stamp = (): string => document.querySelector('.cu-stamp-line')?.textContent ?? ''

/* ============================================================ */

describe('a desk where nobody is a customer yet says where customers come from', () => {
  it('says it in one sentence, not three headed paragraphs, and draws no table', () => {
    draw()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Customers')
    expect(
      screen.getByRole('heading', { name: 'Everyone you quote appears here.' }),
    ).toBeInTheDocument()
    expect(screen.getByText(WHERE_CUSTOMERS_COME_FROM)).toBeInTheDocument()
    /* the lesson about a second act is gone, and so is its vocabulary */
    for (const gone of ['What a customer is here', 'Why it is empty today', 'What to do']) {
      expect(screen.queryByText(gone)).toBeNull()
    }
    expect(screen.getByTestId('customers').textContent).not.toMatch(/\bfiled?\b|the book/i)
    expect(screen.queryByRole('grid')).not.toBeInTheDocument()
    expect(screen.queryByRole('row')).not.toBeInTheDocument()
    expect(screen.getByText('No customers yet')).toBeInTheDocument()
  })

  it('invents no photograph', () => {
    draw()
    expect(document.querySelectorAll('img')).toHaveLength(0)
  })

  it('rests with the form open and its act live, and no refusal on the screen (#11)', () => {
    draw()
    const act = within(screen.getByRole('form', { name: 'Add a customer' })).getByRole('button', {
      name: 'Add them',
    })
    expect(act).not.toHaveAttribute('aria-disabled', 'true')
    expect(screen.queryByText(NAME_NEEDED)).toBeNull()
  })

  it('says the reason where it was refused, puts the caret on the name, and takes it back', async () => {
    draw()
    const form = screen.getByRole('form', { name: 'Add a customer' })
    await userEvent.click(within(form).getByRole('button', { name: 'Add them' }))
    expect(theBook()).toBeUndefined()
    expect(within(form).getByText(NAME_NEEDED)).toBeVisible()
    expect(within(form).getByLabelText('Name')).toHaveFocus()
    await userEvent.type(within(form).getByLabelText('Name'), 'S')
    expect(screen.queryByText(NAME_NEEDED)).toBeNull()
  })

  it('starts a quote at the picker', async () => {
    draw()
    await press('Start a quote')
    expect(started).toBe(1)
  })
})

/* ============================================================
   THE M2-CLOSE CRITIQUE'S FINDING 7, AS A RENDER SEES IT. "Give a
   quote to M. Duffy, then press Customers: 'Nobody is filed yet.'"
   The person a quote names is a customer the moment the name is
   typed; nothing is filed to make them one; the first time the dealer
   gives their page something to keep, the book keeps them in the same
   press, with one Undo, and their drafts print it too.
   ============================================================ */

describe('the person the dealer has just quoted is a customer (M2-close #7)', () => {
  it('opens on M. Duffy, the moment the quote names them, with nothing filed', () => {
    const given = fileAQuote({
      customer: { name: 'M. Duffy' },
      state: 'issued',
      issuedAt: '2026-09-16T00:00:00.000Z',
    })
    draw()
    expect(screen.getByTestId('customers')).toHaveAttribute('data-mode', 'letter')
    expect(within(paper()).getByRole('heading')).toHaveTextContent('M. Duffy')
    expect(stamp()).toMatch(/^1 customer\b/)
    expect(screen.getByRole('region', { name: /Quotes for M\. Duffy/ })).toHaveTextContent(
      given.reference,
    )
    /* nobody, filing, a pile, the book: none of it is said */
    const said = screen.getByTestId('customers').textContent ?? ''
    expect(said).not.toMatch(/Nobody|\bfiled?\b|not filed|typed on a quote|in the book/i)
    /* and reading the screen wrote nothing */
    expect(theBook()).toBeUndefined()
    expect(quotes.getState().get(given.id)!.customerRef).toBeUndefined()
  })

  it('draws the lines the quote printed, and says the quote they were typed on', () => {
    const draft = fileAQuote({ customer: { name: 'M. Duffy', contact: ['0400 555 010'] } })
    draw()
    expect(paper()).toHaveTextContent('0400 555 010')
    expect(screen.getByText(`As typed on ${draft.reference}.`)).toBeInTheDocument()
    /* the typed line is a phone, so its act says so */
    expect(screen.getByRole('button', { name: 'Change phone' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add email' })).toBeInTheDocument()
  })

  it('reads an email typed on the quote as their email, never as their phone', () => {
    fileAQuote({ customer: { name: 'M. Duffy', contact: ['mduffy@example.test'] } })
    draw()
    expect(screen.getByRole('button', { name: 'Change email' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add phone' })).toBeInTheDocument()
  })

  it('draws two quotes that carry one name as one customer with both of them', () => {
    const a = fileAQuote({ customer: { name: 'M. Duffy' } })
    const b = fileAQuote({ customer: { name: 'm. duffy ' }, state: 'issued', issuedAt: ISO })
    draw()
    const list = screen.getByRole('region', { name: /Quotes for M\. Duffy/ })
    expect(list).toHaveTextContent(a.reference)
    expect(list).toHaveTextContent(b.reference)
    expect(stamp()).toMatch(/^1 customer\b/)
  })

  it('keeps them the first time their page is given something, and their draft prints it', async () => {
    const draft = fileAQuote({ customer: { name: 'M. Duffy' } })
    const given = fileAQuote({
      customer: { name: 'M. Duffy' },
      state: 'issued',
      issuedAt: ISO,
    })
    draw()
    /* the same page before and after — only the attribute a test reads tells them apart */
    expect(document.querySelector('.cu-letter')).not.toHaveAttribute('data-kept')
    await press('Add phone')
    await userEvent.type(screen.getByLabelText('Phone'), '0400 123 456')
    await press(/^Done/)
    expect(document.querySelector('.cu-letter')).toHaveAttribute('data-kept')

    /* ONE press made the book and the row, with the name and the phone */
    expect(theBook()?.name).toBe('Customers')
    expect(bookRows()).toHaveLength(1)
    const row = bookRows()[0]!
    expect(row.values[CUSTOMER_PHONE_FIELD]).toBe('0400 123 456')
    expect(readCustomer(theBook()!, row).name).toBe('M. Duffy')
    /* the draft is addressed to them and prints the phone; the given quote keeps what it was given */
    const now = quotes.getState().get(draft.id)!
    expect(now.customerRef?.rowId).toBe(row.id)
    expect(now.customer.contact).toEqual(['0400 123 456'])
    expect(quotes.getState().get(given.id)!.customerRef).toBeUndefined()
    /* the page stays on them, and says what happened in the dealer's words */
    expect(within(paper()).getByRole('heading')).toHaveTextContent('M. Duffy')
    expect(paper()).toHaveTextContent('0400 123 456')
    const step = screen.getByTestId('last-step')
    expect(step).toHaveTextContent(
      `M. Duffy’s phone is 0400 123 456. Their draft ${draft.reference} prints it too.`,
    )
    expect(step.textContent).not.toMatch(/\bfiled?\b|the book|row|table/i)
  })

  it('takes the whole keep back on one press, and the page stays on the same person', async () => {
    const draft = fileAQuote({ customer: { name: 'M. Duffy' } })
    draw()
    await press('Add phone')
    await userEvent.type(screen.getByLabelText('Phone'), '0400 123 456')
    await press(/^Done/)
    await userEvent.click(
      within(screen.getByTestId('last-step')).getByRole('button', { name: 'Undo' }),
    )

    expect(theBook(), 'the book was made by that press, so the way back unmakes it').toBeUndefined()
    expect(quotes.getState().get(draft.id)!.customerRef).toBeUndefined()
    expect(within(paper()).getByRole('heading')).toHaveTextContent('M. Duffy')
    expect(screen.queryByText(NOBODY_AT_THIS_ADDRESS)).toBeNull()
    const step = screen.getByTestId('last-step')
    expect(step).toHaveTextContent(/^Taken back: M\. Duffy’s phone/)

    await userEvent.click(within(step).getByRole('button', { name: 'Put it back' }))
    expect(bookRows()).toHaveLength(1)
    expect(quotes.getState().get(draft.id)!.customerRef?.rowId).toBe(bookRows()[0]!.id)
    expect(within(paper()).getByRole('heading')).toHaveTextContent('M. Duffy')
  })

  it('takes a new name with their drafts, and says the given quote keeps the old one', async () => {
    const draft = fileAQuote({ customer: { name: 'M. Duffy' } })
    const given = fileAQuote({ customer: { name: 'M. Duffy' }, state: 'issued', issuedAt: ISO })
    draw()
    await press('Change name')
    const field = screen.getByLabelText('Name')
    await userEvent.clear(field)
    await userEvent.type(field, 'Mick Duffy')
    await press(/^Done/)

    expect(within(paper()).getByRole('heading')).toHaveTextContent('Mick Duffy')
    const now = quotes.getState().get(draft.id)!
    expect(now.customerRef?.rowId).toBe(bookRows()[0]!.id)
    expect(now.customer.name).toBe('Mick Duffy')
    expect(quotes.getState().get(given.id)!.customer.name).toBe('M. Duffy')
    expect(screen.getByTestId('last-step')).toHaveTextContent(
      `M. Duffy is now Mick Duffy. Their draft ${draft.reference} prints it too. ${given.reference} was given to “M. Duffy” and keeps that name.`,
    )
    /* the given quote stands as that name's own customer, which the sentence said first */
    expect(stamp()).toMatch(/^2 customers\b/)
  })

  it('keeps a quote two customers are already called apart, and says why', async () => {
    await catalogue.getState().load({
      entities: [aSheet(), registerTable()],
      rowsByEntity: {
        boat_stacer: [] as RowData[],
        [CUSTOMER_TABLE_ID]: ['d1', 'd2'].map((id) => ({
          id,
          orgId: ORG,
          entityId: CUSTOMER_TABLE_ID,
          values: { 'f-name': 'Dave' },
          createdAt: ISO,
          updatedAt: ISO,
        })),
      },
      manifest: { name: 'Northside Marine' } as never,
    })
    const q = fileAQuote({ customer: { name: 'Dave' } })
    draw({ who: `${QUOTED}${q.id}` })
    expect(screen.getByText(/2 other customers are called Dave/)).toBeInTheDocument()
    expect(stamp()).toMatch(/^3 customers\b/)
  })
})

describe('adding somebody by hand makes the book, in one step, with one undo', () => {
  it('writes the book and the person together and says so plainly', async () => {
    draw()
    await addByHand('Sarah Jones', { Phone: '0400 123 456' })

    expect(theBook()?.name).toBe('Customers')
    expect(bookRows()).toHaveLength(1)
    const step = screen.getByTestId('last-step')
    expect(step).toHaveTextContent('Sarah Jones is added.')
    expect(within(step).getByRole('button', { name: 'Undo' })).toBeInTheDocument()
  })

  it('takes the book away again with the person, on one press', async () => {
    draw()
    await addByHand('Sarah Jones')
    await userEvent.click(within(screen.getByTestId('last-step')).getByRole('button'))

    expect(theBook()).toBeUndefined()
    expect(
      within(screen.getByTestId('last-step')).getByRole('button', { name: 'Put it back' }),
    ).toBeInTheDocument()
  })

  it('lands on whoever was touched last when an addition is taken back, never on nobody', async () => {
    fileAQuote({ customer: { name: 'M. Duffy' } })
    draw()
    await addByHand('Sarah Jones')
    expect(within(paper()).getByRole('heading')).toHaveTextContent('Sarah Jones')
    await userEvent.click(within(screen.getByTestId('last-step')).getByRole('button'))
    expect(screen.queryByText(NOBODY_AT_THIS_ADDRESS)).toBeNull()
    expect(within(paper()).getByRole('heading')).toHaveTextContent('M. Duffy')
  })
})

describe('the page is the resting state, and the paper is what prints', () => {
  it('prints the block the document prints, in the document’s own order, under the letterhead', async () => {
    draw()
    await addByHand('Sarah Jones', {
      Phone: '0400 123 456',
      Email: 'sarah@example.test',
      Address: '12 Harbour Rd, Redcliffe QLD 4020',
      Notes: 'Blue Hilux, keen on a 529',
    })

    const read = readCustomer(theBook()!, bookRows()[0]!)
    expect(within(paper()).getByRole('heading')).toHaveTextContent('Sarah Jones')
    const printed = [...paper().querySelectorAll('.cu-paper__line')].map((p) => p.textContent)
    expect(printed).toEqual(read.contact)
    expect(printed).toEqual([
      '0400 123 456',
      'sarah@example.test',
      '12 Harbour Rd, Redcliffe QLD 4020',
    ])
    /* page 1 of a quotation heads the sheet with the dealership, so the paper does */
    expect(paper()).toHaveTextContent(/Northside Marine\s*Quotation/)
  })

  it('keeps the yard’s note off the paper, and off the document', async () => {
    const quote = fileAQuote({ customer: { name: 'Someone else' } })
    draw()
    await addByHand('Sarah Jones', { Phone: '0400 123 456', Notes: 'Blue Hilux, keen on a 529' })

    expect(paper().textContent).not.toContain('Blue Hilux')
    const band = screen.getByRole('complementary', { name: 'The yard’s note' })
    expect(band).toHaveTextContent('Blue Hilux, keen on a 529')
    expect(band).toHaveTextContent(/never printed on a quote/i)

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
    await addByHand('Sarah Jones')
    expect(paper().textContent).not.toMatch(/No phone|No email|No address/)
    expect(paper()).toHaveTextContent(/prints the name alone/)
    expect(screen.getByRole('button', { name: 'Add phone' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change name' })).toBeInTheDocument()
  })

  it('changes a line through the sheet’s own command, with the way back', async () => {
    draw()
    await addByHand('Sarah Jones')
    await press('Add phone')
    await userEvent.type(screen.getByLabelText('Phone'), '0400 123 456')
    await press(/^Done/)

    expect(bookRows()[0]!.values[CUSTOMER_PHONE_FIELD]).toBe('0400 123 456')
    expect(paper().textContent).toContain('0400 123 456')
    const step = screen.getByTestId('last-step')
    expect(step).toHaveTextContent('Sarah Jones’s phone is 0400 123 456.')
    await userEvent.click(within(step).getByRole('button', { name: 'Undo' }))
    expect(bookRows()[0]!.values[CUSTOMER_PHONE_FIELD] ?? '').toBe('')
  })

  it('says nobody is at an address that names nobody', async () => {
    await openWithABook({ 'f-name': 'Sarah Jones' })
    draw({ who: 'not-a-row' })
    expect(screen.getByRole('heading', { name: NOBODY_AT_THIS_ADDRESS })).toBeInTheDocument()
  })
})

describe('the quotes on a page', () => {
  const aLetterWithOneQuote = async (over: Partial<QuoteDef> = {}): Promise<QuoteDef> => {
    await openWithABook({ 'f-name': 'Sarah Jones' })
    return fileAQuote({ ...frozenFor(THE_ROW), ...over })
  }

  it('leads a row with the boat, its reference, its standing in words and the register’s total', async () => {
    const quote = await aLetterWithOneQuote()
    draw()

    const list = screen.getByRole('region', { name: /Quotes for Sarah Jones/ })
    expect(list).toHaveTextContent('Stacer 529 Assault Pro')
    expect(list).toHaveTextContent(quote.reference)
    expect(list).toHaveTextContent('Draft')
    const total = quoteTotals(quotes.getState().get(quote.id)!).total
    expect(list.textContent).toContain(String(Math.round(total).toLocaleString('en-AU')))
  })

  /* THE ONE THING TO CHANGE FIRST (built-critique-m2-close-2.md): the
     customer's card names the boat as a person says it, its colour drawn
     beside its words, and never the file's key string */
  it('names a Highfield boat as a person says it, with its colour drawn', async () => {
    await aLetterWithOneQuote({
      rootTableId: 'boat_highfield',
      subjectLabel: 'Highfield - ADV7 (HYP) B-G-B',
    })
    draw()
    const list = screen.getByRole('region', { name: /Quotes for Sarah Jones/ })
    expect(list).toHaveTextContent('Highfield ADV7')
    expect(list).toHaveTextContent('Hypalon · Black / Grey / Black')
    expect(list.textContent).not.toContain('(HYP)')
    expect(list.querySelectorAll('.ui-swatch')).toHaveLength(3)
  })

  it('says in words that no photograph is held, under the maker’s own mark and never a stand-in', async () => {
    await aLetterWithOneQuote()
    draw()
    const list = screen.getByRole('region', { name: /Quotes for/ })
    expect(list).toHaveTextContent('no photograph held')
    const pictures = [...list.querySelectorAll('img')]
    expect(pictures.map((img) => img.getAttribute('data-mark'))).toEqual(['Stacer'])
  })

  it('draws the words alone for a maker with no mark held', async () => {
    await aLetterWithOneQuote({ rootTableId: 'boat_nobody' })
    draw()
    const list = screen.getByRole('region', { name: /Quotes for/ })
    expect(list).toHaveTextContent('no photograph held')
    expect(list.querySelectorAll('img')).toHaveLength(0)
  })

  it('opens a draft where it is written', async () => {
    const draft = await aLetterWithOneQuote()
    draw()
    await userEvent.click(
      within(screen.getByRole('region', { name: /Quotes for/ })).getByRole('button'),
    )
    expect(opened).toEqual([{ id: draft.id, state: 'draft' }])
  })

  it('opens a given quote as the paper the customer keeps', async () => {
    const given = await aLetterWithOneQuote({ state: 'issued', issuedAt: ISO })
    draw()
    await userEvent.click(
      within(screen.getByRole('region', { name: /Quotes for/ })).getByRole('button'),
    )
    expect(opened).toEqual([{ id: given.id, state: 'issued' }])
  })

  it('refuses to open with a sentence when it was handed no way to', async () => {
    await aLetterWithOneQuote()
    render(<Customers business="Northside Marine" now={clock} />)
    await userEvent.click(
      within(screen.getByRole('region', { name: /Quotes for/ })).getByRole('button'),
    )
    expect(screen.getByText(NO_WAY_TO_OPEN)).toBeInTheDocument()
  })

  it('brings a draft that prints older details up to date, on one press with its way back', async () => {
    await openWithABook({ 'f-name': 'Sarah Jones', [CUSTOMER_PHONE_FIELD]: '0400 111 222' })
    const draft = fileAQuote() // typed "Sarah Jones" on the build, with no phone
    draw()
    expect(screen.getByText(behindSay([draft.reference]))).toBeInTheDocument()
    await press('Bring it up to date')
    const now = quotes.getState().get(draft.id)!
    expect(now.customerRef?.rowId).toBe(THE_ROW)
    expect(now.customer.contact).toEqual(['0400 111 222'])
    expect(screen.queryByText(behindSay([draft.reference]))).toBeNull()
    await userEvent.click(
      within(screen.getByTestId('last-step')).getByRole('button', { name: 'Undo' }),
    )
    expect(quotes.getState().get(draft.id)!.customerRef).toBeUndefined()
  })
})

describe('two Sarah Joneses at the desk, and no modal anywhere', () => {
  it('says one is already a customer, with open and add-another beside it', async () => {
    draw()
    await addByHand('Sarah Jones')
    await press(/^Add a customer/)

    const form = screen.getByRole('form', { name: 'Add a customer' })
    await userEvent.type(within(form).getByLabelText('Name'), 'Sarah Jones')

    expect(screen.getAllByText(alreadyFiled('Sarah Jones'))).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Open Sarah Jones' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add another Sarah Jones' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('finds a name that is only on a quote too, so nobody is added twice by accident', async () => {
    fileAQuote({ customer: { name: 'M. Duffy' } })
    draw()
    await press(/^Add a customer/)
    const form = screen.getByRole('form', { name: 'Add a customer' })
    await userEvent.type(within(form).getByLabelText('Name'), 'M. Duffy')
    expect(screen.getByText(alreadyFiled('M. Duffy'))).toBeInTheDocument()
  })

  it('keeps both, because two people with the same name are two people', async () => {
    draw()
    await addByHand('Sarah Jones')
    await press(/^Add a customer/)
    const form = screen.getByRole('form', { name: 'Add a customer' })
    await userEvent.type(within(form).getByLabelText('Name'), 'Sarah Jones')
    await press('Add another Sarah Jones')
    await userEvent.click(within(form).getByRole('button', { name: /^Add another Sarah Jones$/ }))

    expect(bookRows()).toHaveLength(2)
  })
})

const names = (): string[] =>
  within(screen.getByRole('grid', { name: 'Customers' }))
    .getAllByRole('row')
    .map((r) => r.querySelector('.cu-cell--name')?.textContent ?? '')

describe('everyone: the latest first at rest, the alphabet as a press', () => {
  /* three customers, touched an hour apart: Zara quoted first, then Adam,
     then Mia — `fileAQuote` stamps each an hour before the last */
  const three = (): void => {
    fileAQuote({ customer: { name: 'Mia Cole' } })
    fileAQuote({ customer: { name: 'Adam Bell' } })
    fileAQuote({ customer: { name: 'Zara Hunt' } })
  }

  it('lists whoever was touched last first, until somebody presses A to Z', async () => {
    three()
    draw()
    await press(/^Every customer/)
    expect(names()).toEqual(['Mia Cole', 'Adam Bell', 'Zara Hunt'])
    expect(screen.getByText('Latest first')).toBeInTheDocument()

    await press('A to Z')
    expect(names()).toEqual(['Adam Bell', 'Mia Cole', 'Zara Hunt'])
  })

  it('cuts the list by what each person is doing next, when that is pressed', async () => {
    draw()
    await addByHand('Zara Bell')
    await press(/^Every customer/)
    await press('By what is next')
    expect(screen.getByText(DESK_TITLE.none)).toBeInTheDocument()
  })

  it('moves the cursor on the arrows, answers no single letter and prints no keycap', async () => {
    three()
    draw()
    await press(/^Every customer/)

    /* seventeen caps and five single-letter keys until 2026-09-25 (m2-last-critique.md major 7) */
    expect(document.querySelectorAll('kbd')).toHaveLength(0)

    const grid = screen.getByRole('grid', { name: 'Customers' })
    grid.focus()
    await userEvent.keyboard('jkn/')
    expect(grid).toHaveFocus()
    expect(screen.queryByRole('button', { name: 'Add them' })).toBeNull()
    await userEvent.keyboard('{ArrowDown}')
    const rows = within(grid).getAllByRole('row')
    expect(rows[1]).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{Enter}')
    expect(within(paper()).getByRole('heading')).toHaveTextContent('Adam Bell')
  })

  it('quotes back the words that found nobody', async () => {
    three()
    draw()
    await press(/^Every customer/)
    await userEvent.type(screen.getByLabelText('Find a customer'), 'hovercraft')
    expect(screen.getByText(/No customer matches “hovercraft”/)).toBeInTheDocument()
  })
})

describe('the doors off this screen', () => {
  it('offers everyone at once on Data by address, once anybody is kept', async () => {
    draw()
    await addByHand('Sarah Jones')
    const door = screen.getByRole('link', { name: /Edit everyone at once/ })
    expect(door).toHaveAttribute('href', `/data/${CUSTOMER_TABLE_ID}`)
  })

  it('offers no such door while everyone is still a name on a quote', () => {
    fileAQuote({ customer: { name: 'M. Duffy' } })
    draw()
    expect(screen.queryByRole('link', { name: /Edit everyone at once/ })).toBeNull()
  })
})

describe('the dealer’s own columns', () => {
  it('draws a column this app never shipped, off the paper, and names no store', async () => {
    await openWithABook({ 'f-name': 'Sarah Jones', 'f-abn': '51 824 753 556' }, [
      { id: 'f-abn', name: 'ABN', type: 'text' },
    ])
    draw()

    expect(screen.getByText('ABN')).toBeInTheDocument()
    expect(screen.getByText('51 824 753 556')).toBeInTheDocument()
    expect(paper().textContent).not.toContain('51 824 753 556')
    expect(screen.queryByText(/table on the sheet|columns|Kept for each/)).toBeNull()
  })

  it('reads the name through the register’s own display column, whatever it is called', async () => {
    await openWithABook({ 'f-name': 'Sarah Jones' })
    draw()
    expect(within(paper()).getByRole('heading')).toHaveTextContent('Sarah Jones')
  })
})

describe('the app-wide rules of 2026-09-23', () => {
  it('draws no Home of its own, because the pill carries it (rule a)', async () => {
    await openWithABook({ 'f-name': 'Sarah Jones' })
    render(<Customers business="Northside Marine" now={clock} goHome={() => {}} {...seams} />)
    expect(screen.queryByRole('button', { name: 'Home' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Home' })).toBeNull()
  })

  it('shows no router pattern and no plan word in a sentence it can say (rule c)', () => {
    for (const said of [
      NO_WAY_TO_OPEN,
      NO_WAY_TO_THE_PICKER,
      WHERE_CUSTOMERS_COME_FROM,
      NO_SHEET_FOR_A_BOOK,
    ]) {
      expect(said).not.toMatch(/\/quote|\$id|Milestone/)
    }
  })
})

/* ============================================================
   THE M2-CLOSE CRITIQUE, #4 AND #19. "A row in a book that is a table
   on the sheet", "not to this row", "A table on the sheet · Customers ·
   5 columns", "FILED 2026-09-24". Every state the critic walked — an
   empty desk, a name on a given quote, everyone, a person's page — read
   whole against the one list of words a dealer never reads, and dated
   as a person dates a thing.
   ============================================================ */
const wordsOnScreen = (): string[] =>
  engineWordsIn(screen.getByTestId('customers').textContent ?? '')

describe('the customers screen speaks the dealer’s words (M2-close #4, #7, #19)', () => {
  it('on an empty desk', () => {
    draw()
    expect(wordsOnScreen()).toEqual([])
  })

  it('on the page of a name on a given quote, and on everyone', async () => {
    fileAQuote({
      customer: { name: 'M. Duffy' },
      state: 'issued',
      issuedAt: '2026-09-16T00:00:00.000Z',
    })
    draw()
    expect(wordsOnScreen()).toEqual([])
    /* the given quote's day, as the diary writes it — never 2026-09-16 */
    expect(screen.getByText(/· Wednesday 16 September/)).toBeInTheDocument()
    expect(screen.queryByText(/2026-09-1\d/)).toBeNull()
    expect(screen.getByText(/^A customer since Wednesday 16 September/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /^Every customer/ }))
    expect(screen.getByRole('grid')).toBeInTheDocument()
    expect(wordsOnScreen()).toEqual([])
    expect(screen.getByTestId('customers').textContent).not.toMatch(/\d{4}-\d{2}-\d{2}/)
    expect(screen.getByText('Wednesday 16 September')).toBeInTheDocument()
  })

  it('on a kept person’s page, dated as a person dates it', async () => {
    fileAQuote({
      customer: { name: 'M. Duffy' },
      state: 'issued',
      issuedAt: '2026-09-16T00:00:00.000Z',
    })
    draw()
    await press('Add phone')
    await userEvent.type(screen.getByLabelText('Phone'), '0400 123 456')
    await press(/^Done/)
    expect(wordsOnScreen()).toEqual([])
    const eyebrow = screen.getByText(/^A customer since/)
    expect(eyebrow.textContent).not.toMatch(/\d{4}-\d{2}-\d{2}/)
  })
})
