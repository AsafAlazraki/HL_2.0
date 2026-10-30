import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { QuoteDef, QuoteLine } from '@/domain/model'
import { money } from '@/domain/money'
import { NOTHING_FOUND } from '@/domain/quote/find'
import { quoteTotals } from '@/domain/quote/totals'
import { createMemoryDatabase } from '@/data/memory/database'
import { memoryQuotes } from '@/data/memory/repositories'
import { quotes } from '@/state/quotes'
import { NOTHING_QUOTED_YET, NO_WAY_TO_OPEN, NO_WAY_TO_THE_PICKER, Quotes } from './Quotes'

/* ============================================================
   QUOTES, A DESK OF DEALS, RENDERED AND PRESSED, BY ROLE AND BY TEXT
   (the flow round, 2026-10-30).

   Every document below is built in this file. Nothing is seeded into
   the app and nothing is invented for a person to look at: these are
   the shapes `mintQuote` and `newVersionOf` produce, written down so
   the register can be driven in a page with no router and no price
   file in it. The walk through the real picker is in
   `e2e/flows/quotes.spec.ts`, which is where a document that a person
   made gets opened by the screen that lists it.

   NO FIGURE HERE IS TYPED TWICE. Where a test asserts a total it asks
   `quoteTotals` for it and looks for that on the screen, so a test
   cannot agree with a register that has drifted from the engine —
   both have to agree with the document.

   THE STORE IS REOPENED ON A FRESH MEMORY DATABASE BEFORE EVERY CASE.
   vitest gives one module instance to a whole file, so a document
   filed in one case is filed for the rest of it otherwise — and the
   first assertion this suite makes is that an empty register is
   empty.
   ============================================================ */

const ORG = 'northside'
/** Every act a screen could promise and none of this app's screens does:
 *  an export or import, a backup or restore, a sync, a server or the
 *  internet, an upload or download, an email, a send, a share or a sign-in.
 *  Printing is real and is not on the list. */
const NO_PROMISED_ACT =
  /\b(export|import|backup|back up|restore|sync|server|online|upload|download|e-?mail|send|share|sign-?in|signature)/i
/** a Brisbane morning, fixed, so "2 hours ago" is a fact and not a clock */
const NOW = new Date('2026-09-17T10:00:00+10:00')
const clock = () => NOW

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

function doc(over: Partial<QuoteDef> = {}): QuoteDef {
  n += 1
  const hull = line('Stacer 529 Assault Pro', 28_530)
  const at = new Date(NOW.getTime() - n * 3_600_000).toISOString()
  return {
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
    customer: { name: 'R. Kelleher' },
    preparedBy: 'Asaf',
    createdAt: at,
    updatedAt: at,
    ...over,
  }
}

/** File one document the way the app files one: through the store. */
const fileIt = (quote: QuoteDef): QuoteDef => {
  quotes.getState().file(quote, {
    id: `e-${quote.id}`,
    kind: 'minted',
    at: quote.createdAt,
    said: `${quote.subjectLabel} — quote ${quote.reference}`,
    changed: [],
  })
  return quote
}

/* THE TWO SEAMS, AS SPIES. The screen never reaches for the router,
   so what a press does is a function this suite hands in and then
   reads back — which is the same shape the route hands in, and the
   reason a register can be driven at all without a browser. */
interface Opened {
  id: string
  state: string
}
let opened: Opened[] = []
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
})

const draw = () => render(<Quotes business="Northside Marine" now={clock} {...seams} />)
/** the same screen handed nowhere to go */
const drawStranded = () => render(<Quotes business="Northside Marine" now={clock} />)

/** one deal's card, by the customer (or the words for nobody) its head names */
const deal = (who: string) => screen.getByRole('listitem', { name: who })
const group = (word: string) => screen.getByRole('region', { name: new RegExp(`^${word}`) })

/* ---------------------------------------------------------- */

describe('an empty desk', () => {
  it('says so once, quietly, beside the act that starts the first quote', async () => {
    draw()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Quotes')
    expect(screen.getByText(NOTHING_QUOTED_YET)).toBeInTheDocument()
    /* no group stands empty: an empty "Given 0" was a row saying nothing */
    expect(
      screen.queryByRole('region', { name: /^Being written|^With the customer|^Replaced/ }),
    ).toBeNull()
    const act = screen.getByRole('button', { name: 'New quote' })
    await userEvent.click(act)
    expect(started).toBe(1)
    expect(document.body.textContent ?? '').not.toMatch(NO_PROMISED_ACT)
  })

  it('says where nothing could be started, when handed no way there', async () => {
    drawStranded()
    await userEvent.click(screen.getByRole('button', { name: 'New quote' }))
    expect(screen.getByText(NO_WAY_TO_THE_PICKER)).toBeInTheDocument()
  })
})

describe('one deal, led by the picture, the customer and the total', () => {
  it('draws the customer, what is sold, the reference and the frozen total, and its next act', async () => {
    const q = fileIt(doc())
    draw()
    const card = deal('R. Kelleher')
    expect(within(card).getByText('Stacer 529 Assault Pro')).toBeInTheDocument()
    expect(within(card).getByText(new RegExp(q.reference))).toBeInTheDocument()
    expect(card).toHaveTextContent(money(quoteTotals(q).total))
    /* the next act for a draft is to carry on building it, and it opens where it is written */
    await userEvent.click(within(card).getByRole('button', { name: 'Carry on building' }))
    expect(opened).toEqual([{ id: q.id, state: 'draft' }])
    /* the group counts, never sums */
    expect(within(group('Being written')).getByRole('heading', { level: 2 })).toHaveTextContent(
      'Being written1',
    )
  })

  it('names nobody honestly where no customer is on it yet', () => {
    fileIt(doc({ customer: { name: '  ' } }))
    draw()
    expect(deal('No customer named yet')).toBeInTheDocument()
  })

  it('says where nothing could be opened, on the card that was pressed', async () => {
    fileIt(doc())
    drawStranded()
    await userEvent.click(screen.getByRole('button', { name: 'Carry on building' }))
    expect(within(deal('R. Kelleher')).getByText(NO_WAY_TO_OPEN)).toBeInTheDocument()
  })

  it('discards a draft only when asked twice, and says it was', async () => {
    const q = fileIt(doc())
    draw()
    await userEvent.click(screen.getByRole('button', { name: 'Discard' }))
    expect(screen.getByText(/A discarded draft cannot be put back/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Keep it' }))
    expect(quotes.getState().quotes).toHaveLength(1)
    await userEvent.click(screen.getByRole('button', { name: 'Discard' }))
    await userEvent.click(screen.getByRole('button', { name: 'Discard it' }))
    expect(quotes.getState().quotes).toHaveLength(0)
    expect(screen.getByText(`${q.reference} was discarded.`)).toBeInTheDocument()
  })
})

describe('deals in several states, made by the real acts', () => {
  it('keeps a given quote with the customer while its new version is written', async () => {
    const given = fileIt(
      doc({ state: 'issued', issuedAt: NOW.toISOString(), customer: { name: 'Tom Barker' } }),
    )
    fileIt(doc({ customer: { name: 'Mia Tran' } }))
    draw()
    /* the given quote's next act is its paper */
    const card = deal('Tom Barker')
    await userEvent.click(within(card).getByRole('button', { name: 'Open the printed quote' }))
    expect(opened).toEqual([{ id: given.id, state: 'issued' }])

    await userEvent.click(within(card).getByRole('button', { name: 'Make a new version' }))
    /* the new draft is under Being written; the given one is still with the customer */
    expect(within(group('With the customer')).getByText('Tom Barker')).toBeInTheDocument()
    expect(within(group('Being written')).getAllByText('Tom Barker')).toHaveLength(1)
    expect(screen.queryByRole('region', { name: /^Replaced/ })).toBeNull()
    const draftRef = quotes.getState().quotes.find((q) => q.supersedesId === given.id)!.reference
    expect(
      within(within(group('With the customer')).getByRole('listitem')).getByText(
        `A new version, ${draftRef}, is being written.`,
      ),
    ).toBeInTheDocument()
    expect(within(group('Being written')).getAllByRole('listitem')).toHaveLength(2)
    /* no group adds two customers' totals together */
    const sum = quoteTotals(quotes.getState().quotes[0]!).total * 2
    expect(document.body.textContent ?? '').not.toContain(money(sum))
  })

  it('moves a given quote under Replaced once its new version is given', () => {
    const first = fileIt(
      doc({ state: 'issued', issuedAt: NOW.toISOString(), customer: { name: 'Tom Barker' } }),
    )
    fileIt(
      doc({
        state: 'issued',
        issuedAt: NOW.toISOString(),
        supersedesId: first.id,
        customer: { name: 'Tom Barker' },
      }),
    )
    draw()
    const replaced = group('Replaced')
    expect(within(replaced).getByText(/^Replaced by \d/)).toBeInTheDocument()
    expect(
      within(replaced).getByRole('button', { name: 'Open the printed quote' }),
    ).toBeInTheDocument()
  })
})

describe('finding one, when there are enough to need it', () => {
  it('offers the find field from the eighth deal, and quotes the words back', async () => {
    for (let i = 0; i < 8; i += 1) fileIt(doc({ customer: { name: `Customer ${i}` } }))
    draw()
    const find = screen.getByRole('searchbox', { name: 'Find a quote' })
    await userEvent.type(find, 'nobody-like-this')
    expect(screen.getByText(NOTHING_FOUND('nobody-like-this'))).toBeInTheDocument()
    await userEvent.clear(find)
    await userEvent.type(find, 'Customer 3')
    expect(screen.getByText('1 of 8 match “Customer 3”.')).toBeInTheDocument()
  })

  it('draws no find field for a desk of fewer', () => {
    fileIt(doc())
    draw()
    expect(screen.queryByRole('searchbox')).toBeNull()
  })
})
