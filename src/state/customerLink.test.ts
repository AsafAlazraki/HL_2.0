/* ============================================================
   THE LINK BETWEEN A QUOTE AND A CUSTOMER — and the promise it is
   not allowed to break.

   The whole feature rests on one sentence, and every test below is
   a way of asking it:

     A QUOTE PRINTS FROM FROZEN VALUES. The customer's row id is
     kept for ONE question — "what else have we quoted them?" — and
     for nothing that is drawn, totalled or printed.

   So the tests that matter are the destructive ones. Rename the
   customer, and the document handed over last week still says what
   it said. Delete them from the register, and every document still
   opens, still prints and still totals. Those two are the reason
   `customer` and `customerRef` are two fields instead of one, and
   if either ever fails, the quote has stopped being a photograph
   and Monday's price can move by Friday.

   THE STRUCTURAL PROMISE IS TESTED TOO: the register is a table
   like any other, made once, undoable in ONE step, and never made
   by anything except the button that names it.
   ============================================================ */

/* ============================================================
   PORTED 2026-09-17 FROM `features/crm/link.test.ts`. Fifteen of its
   nineteen cases are here with their assertions unchanged; the four
   that could not come across are named at the bottom of this note,
   with what they need.

   WHY IT SITS UNDER `src/state` AND NOT UNDER `src/domain`. The old
   suite asked one question of two halves of the app at once: the
   pure half (freeze a customer by value, read the register, file a
   typed name) and the registry half (link it onto a document, issue
   the document, ask what else we quoted them). The pure half is
   `@/domain/quote/freeze` and `@/domain/people/customers`, which take
   a `CatalogueCtx` and read nothing; the registry half is the quotes
   store here. A test that only drove the pure half would not notice
   the store letting a link through, which is the failure mode this
   file was written against — so it drives both, from the one place
   that may import both.

   THE FOUR STORE WRITES BECOME A CONTEXT. `ensureCustomerRegister`,
   `addCustomer`, `setCustomerCell` and `removeCustomer` were
   `features/crm/register.ts` — five calls into the project store
   (`createEntity`, `addField`, `addRow`, `updateCell`, `deleteRow`).
   None of those five exists yet: the catalogue commands are
   Milestone 2. So the register is BUILT AS A CONTEXT here, exactly as
   `ensureCustomerRegister` built it and exactly as
   `people/customers.test.ts` already builds it, and a write is the
   next context. That is the port rule for a store read verbatim —
   the subject under test is what `freezeCustomer` does with the world
   it is handed, and this hands it the same world.

   WHAT COULD NOT COME ACROSS, and what each needs:

   · 'arrives with the well-known id, a name column and the four
     contact columns', 'is made once — asking twice returns the same
     table and adds no columns', 'is ONE undo step, not seven' — all
     three are assertions about `ensureCustomerRegister` itself, which
     is `createEntity` + four `addField`s + `updateEntity` collapsed
     into one history step by the project store. There is no project
     store and no history stack in this milestone. They come back with
     the catalogue commands in M2.
   · 'survives being renamed and re-columned — it is still the
     register' — already held, by
     `domain/people/customers.test.ts` › 'is the table with the
     well-known id, whatever it has been renamed to'. Not duplicated.
   · 'adds a ROW when there is one, carrying the lines already typed
     on the quote' IS here, because `fileCustomer` takes its one write
     as a callback.
   ============================================================ */
import { beforeEach, describe, expect, it } from 'vitest'
import type {
  CatalogueCtx,
  CellValue,
  EntityDef,
  QuoteDef,
  QuoteEvent,
  QuoteLine,
  RowData,
} from '@/domain/model'
import { makeCtx } from '@/domain/model'
import {
  CUSTOMER_EMAIL_FIELD,
  CUSTOMER_NOTE_FIELD,
  CUSTOMER_PHONE_FIELD,
  CUSTOMER_TABLE_ID,
  customerRegister,
  readCustomer,
} from '@/domain/people/customers'
import {
  customerBook,
  fileCustomer,
  freezeCustomer,
  hasCustomerRegister,
} from '@/domain/quote/freeze'
import { issue, linkCustomer, unlinkCustomer } from '@/domain/quote/commands'
import { quoteTotals } from '@/domain/quote/totals'
import { normQuotes } from '@/domain/io/envelope'
import { createQuotesStore, type QuotesStore } from './quotes'

const ISO = '2026-01-01T00:00:00.000Z'

/* ---------------------------------------------------------- */
/* The register, as a context                                 */
/* ---------------------------------------------------------- */

/** The register as `ensureCustomerRegister` builds it: a plain `Name`
 *  with an ordinary generated id — which is the point, the label
 *  column is the app's own election and not a private constant of
 *  this feature — then the four well-known columns. */
function registerTable(): EntityDef {
  return {
    id: CUSTOMER_TABLE_ID,
    orgId: 'northside',
    name: 'Customers',
    accent: 'teal',
    kind: 'custom',
    role: 'base',
    description: 'The people and businesses you sell to.',
    fields: [
      { id: 'f-name', name: 'Name', type: 'text', required: true },
      { id: CUSTOMER_PHONE_FIELD, name: 'Phone', type: 'text' },
      { id: CUSTOMER_EMAIL_FIELD, name: 'Email', type: 'text' },
      { id: '__cst_address', name: 'Address', type: 'text' },
      { id: CUSTOMER_NOTE_FIELD, name: 'Notes', type: 'text' },
    ],
    position: { x: 0, y: 0 },
    createdAt: ISO,
    updatedAt: ISO,
  }
}

/** The world, rebuilt on every write. `ctx` is what the pure half is
 *  handed; the four helpers under it are the four store writes the
 *  old suite made, each one producing the next world. */
let ctx: CatalogueCtx
let rows: RowData[] = []
let rowN = 0

const rebuild = (): void => {
  ctx = makeCtx({
    orgId: 'northside',
    entities: { [CUSTOMER_TABLE_ID]: registerTable() },
    rowsByEntity: { [CUSTOMER_TABLE_ID]: rows },
    now: () => ISO,
  })
}

/** `ensureCustomerRegister` — the table exists from here on. */
function ensureCustomerRegister(): EntityDef {
  rebuild()
  return customerRegister(ctx.entities) as EntityDef
}

/** The store's own `addRow`, which is what `fileCustomer` is handed
 *  and what `addCustomer` was a pass-through to. */
function addRow(entityId: string, values: Record<string, CellValue> = {}): RowData | null {
  if (entityId !== CUSTOMER_TABLE_ID) return null
  rowN += 1
  const row: RowData = {
    id: `cst:${rowN}`,
    orgId: 'northside',
    entityId,
    values,
    createdAt: ISO,
    updatedAt: ISO,
  }
  rows = [...rows, row]
  rebuild()
  return row
}

const addCustomer = (values: Record<string, CellValue>): RowData | null =>
  addRow(CUSTOMER_TABLE_ID, values)

/** `setCustomerCell` — one cell of one customer, and the next world. */
function setCustomerCell(rowId: string, fieldId: string, value: CellValue): void {
  rows = rows.map((r) => (r.id === rowId ? { ...r, values: { ...r.values, [fieldId]: value } } : r))
  rebuild()
}

/** `removeCustomer` — out of the register, and NOTHING on any quote
 *  is touched, which is the whole reason a quote freezes a customer
 *  rather than pointing at them. */
function removeCustomer(rowId: string): void {
  rows = rows.filter((r) => r.id !== rowId)
  rebuild()
}

const nameFieldId = (): string => {
  const table = customerRegister(ctx.entities)
  if (!table) throw new Error('no register')
  return table.fields[0].id
}

/* ---------------------------------------------------------- */
/* The registry                                               */
/* ---------------------------------------------------------- */

let store: QuotesStore

/* -- the smallest honest quote, all of it frozen -------------- */

let n = 0
function draft(over: Partial<QuoteDef> = {}): QuoteDef {
  n += 1
  const hull: QuoteLine = {
    id: `l${n}`,
    entityId: 'tbl_boats',
    rowId: 'row_1',
    label: 'A hull',
    qty: 1,
    unitPrice: 62000,
    priceFieldId: 'fld_cash',
    priceColumnName: 'Cash',
    levelKey: 'cash',
    levelResolved: 'cash',
    levels: [{ key: 'cash', label: 'Cash', fieldId: 'fld_cash', value: 62000, scope: 'quote' }],
  }
  const quote: QuoteDef = {
    id: `q${n}`,
    /* three fields the contract now requires that the old literal did
       not carry — `orgId` on every persisted record, `chapters` and
       `events` on every quote. Stricter typing, not a changed test. */
    orgId: 'northside',
    reference: `2026010${n}-01`,
    state: 'draft',
    viewId: 'view_1',
    rootTableId: 'tbl_boats',
    rootRowId: 'row_1',
    subjectLabel: 'A hull',
    subjectSpecs: [],
    sections: [{ blockId: '__subject', tableId: 'tbl_boats', title: 'Boats', lineIds: [hull.id] }],
    chapters: [{ id: '__subject', title: 'Boats', tableId: 'tbl_boats' }],
    lines: [hull],
    adjustments: [],
    events: [],
    levelKey: 'cash',
    customer: { name: '' },
    createdAt: new Date(2026, 0, 1 + n).toISOString(),
    updatedAt: new Date(2026, 0, 1 + n).toISOString(),
    ...over,
  }
  const event: QuoteEvent = {
    id: `ev-${quote.id}`,
    kind: 'minted',
    at: quote.createdAt,
    said: `A hull — quote ${quote.reference}`,
    changed: [],
  }
  store.getState().file(quote, event)
  return quote
}

const getQuote = (id: string): QuoteDef | undefined => store.getState().get(id)
const quotesForCustomer = (rowId: string): QuoteDef[] => store.getState().forCustomer(rowId)
const issueQuote = (id: string): void => void store.getState().apply(id, issue())
const link = (id: string, frozen: Pick<QuoteDef, 'customer' | 'customerRef'>): void =>
  void store.getState().apply(id, linkCustomer(frozen))
const unlink = (id: string): void => void store.getState().apply(id, unlinkCustomer())

beforeEach(() => {
  /* a clean project and a clean registry every time */
  rows = []
  rowN = 0
  n = 0
  rebuild()
  ctx = makeCtx({ orgId: 'northside', entities: {}, rowsByEntity: {}, now: () => ISO })
  store = createQuotesStore({ now: () => ISO, writeBehindMs: 0 })
})

/* ============================================================
   MAKING THE REGISTER
   ============================================================ */

describe('the register is a table like any other', () => {
  it('is not there until somebody asks for it', () => {
    expect(customerRegister(ctx.entities)).toBeUndefined()
    expect(hasCustomerRegister(ctx)).toBe(false)
    expect(customerBook(ctx)).toEqual([])
  })
})

/* ============================================================
   FREEZING ONE ONTO A QUOTE
   ============================================================ */

describe('picking a customer freezes them onto the document', () => {
  let rowId = ''

  beforeEach(() => {
    ensureCustomerRegister()
    const row = addCustomer({
      [nameFieldId()]: 'R. Kelleher',
      [CUSTOMER_PHONE_FIELD]: '0400 000 000',
      [CUSTOMER_EMAIL_FIELD]: 'rk@example.test',
      [CUSTOMER_NOTE_FIELD]: 'chased twice about the 2023 invoice',
    })
    rowId = row?.id ?? ''
  })

  it('copies the name and the printable contact lines, and NOT the note', () => {
    const frozen = freezeCustomer(ctx, rowId)
    expect(frozen?.customer).toEqual({
      name: 'R. Kelleher',
      contact: ['0400 000 000', 'rk@example.test'],
    })
    expect(JSON.stringify(frozen)).not.toContain('2023 invoice')
  })

  it('keeps the row id beside the frozen details, never instead of them', () => {
    const frozen = freezeCustomer(ctx, rowId)
    expect(frozen?.customerRef).toEqual({ tableId: CUSTOMER_TABLE_ID, rowId })
  })

  it('returns null for a row that has gone, so nothing writes a link to nothing', () => {
    expect(freezeCustomer(ctx, 'not-a-row')).toBeNull()
  })

  it('writes both halves of the link in one act', () => {
    const q = draft()
    const frozen = freezeCustomer(ctx, rowId)
    if (frozen) link(q.id, frozen)
    expect(getQuote(q.id)?.customer.name).toBe('R. Kelleher')
    expect(getQuote(q.id)?.customerRef?.rowId).toBe(rowId)
  })

  /* ---------------------------------------------------------- */
  /* THE TWO THAT MATTER                                        */
  /* ---------------------------------------------------------- */

  it('DOES NOT RE-ADDRESS ITSELF when the register is corrected afterwards', () => {
    const q = draft()
    const frozen = freezeCustomer(ctx, rowId)
    if (frozen) link(q.id, frozen)

    setCustomerCell(rowId, nameFieldId(), 'Rob Kelleher')
    setCustomerCell(rowId, CUSTOMER_PHONE_FIELD, '0400 111 111')

    /* the register moved on, the document did not */
    expect(
      readCustomer(ctx.entities[CUSTOMER_TABLE_ID], ctx.rowsByEntity[CUSTOMER_TABLE_ID][0]).name,
    ).toBe('Rob Kelleher')
    expect(getQuote(q.id)?.customer).toEqual({
      name: 'R. Kelleher',
      contact: ['0400 000 000', 'rk@example.test'],
    })
    /* and it is still THEIR quote — the link is what followed them */
    expect(quotesForCustomer(rowId).map((x) => x.id)).toEqual([q.id])
  })

  it('STILL PRINTS AND STILL TOTALS after the customer is deleted', () => {
    const q = draft()
    const frozen = freezeCustomer(ctx, rowId)
    if (frozen) link(q.id, frozen)
    issueQuote(q.id)

    removeCustomer(rowId)

    const after = getQuote(q.id) as QuoteDef
    expect(after.state).toBe('issued')
    expect(after.customer.name).toBe('R. Kelleher')
    expect(after.customer.contact).toEqual(['0400 000 000', 'rk@example.test'])
    expect(quoteTotals(after).total).toBe(62000)
    /* the pointer is all that is dangling, and only the history
       question reads it */
    expect(after.customerRef?.rowId).toBe(rowId)
    expect(customerBook(ctx)).toEqual([])
  })
})

/* ============================================================
   THE HISTORY WITH THEM
   ============================================================ */

describe('what else have we quoted them', () => {
  let rowId = ''
  let otherId = ''

  beforeEach(() => {
    ensureCustomerRegister()
    rowId = addCustomer({ [nameFieldId()]: 'R. Kelleher' })?.id ?? ''
    otherId = addCustomer({ [nameFieldId()]: 'R. Kelleher' })?.id ?? ''
  })

  it('matches on the id, so two people with the same name are two people', () => {
    const a = draft()
    const b = draft()
    const one = freezeCustomer(ctx, rowId)
    const two = freezeCustomer(ctx, otherId)
    if (one) link(a.id, one)
    if (two) link(b.id, two)

    expect(quotesForCustomer(rowId).map((q) => q.id)).toEqual([a.id])
    expect(quotesForCustomer(otherId).map((q) => q.id)).toEqual([b.id])
  })

  it('has nothing to say about a quote addressed to a typed name', () => {
    const q = draft({ customer: { name: 'A walk-in' } })
    expect(q.customerRef).toBeUndefined()
    expect(quotesForCustomer('')).toEqual([])
    expect(quotesForCustomer(rowId)).toEqual([])
  })
})

/* ============================================================
   UNLINKING, FILING, AND THE ISSUED GATE
   ============================================================ */

describe('the link can be taken off without touching the document', () => {
  it('keeps every printed word and drops only the pointer', () => {
    ensureCustomerRegister()
    const rowId = addCustomer({ [nameFieldId()]: 'R. Kelleher' })?.id ?? ''
    const q = draft()
    const frozen = freezeCustomer(ctx, rowId)
    if (frozen) link(q.id, frozen)

    unlink(q.id)

    expect(getQuote(q.id)?.customer.name).toBe('R. Kelleher')
    expect(getQuote(q.id)?.customerRef).toBeUndefined()
    expect(quotesForCustomer(rowId)).toEqual([])
  })
})

describe('filing a typed name', () => {
  it('REFUSES when there is no register — typing a name is not asking for a table', () => {
    expect(fileCustomer(ctx, { addRow }, 'R. Kelleher', ['0400 000 000'])).toBeNull()
    expect(customerRegister(ctx.entities)).toBeUndefined()
    expect(Object.keys(ctx.entities)).toHaveLength(0)
  })

  it('adds a ROW when there is one, carrying the lines already typed on the quote', () => {
    ensureCustomerRegister()
    const frozen = fileCustomer(ctx, { addRow }, 'R. Kelleher', ['0400 000 000', 'rk@example.test'])
    expect(frozen?.customer).toEqual({
      name: 'R. Kelleher',
      contact: ['0400 000 000', 'rk@example.test'],
    })
    const book = customerBook(ctx)
    expect(book).toHaveLength(1)
    expect(book[0].name).toBe('R. Kelleher')
  })
})

describe('an issued quote is closed to this like everything else', () => {
  it('refuses to be re-addressed after it has been given to somebody', () => {
    ensureCustomerRegister()
    const rowId = addCustomer({ [nameFieldId()]: 'R. Kelleher' })?.id ?? ''
    const q = draft({ customer: { name: 'A walk-in' } })
    issueQuote(q.id)
    expect(getQuote(q.id)?.state).toBe('issued')

    const frozen = freezeCustomer(ctx, rowId)
    if (frozen) link(q.id, frozen)
    unlink(q.id)

    expect(getQuote(q.id)?.customer.name).toBe('A walk-in')
    expect(getQuote(q.id)?.customerRef).toBeUndefined()
  })
})

/* ============================================================
   ACROSS A FILE BOUNDARY
   ============================================================ */

describe('the link travels in an export and never re-prices anything', () => {
  const stamp = '2026-01-01T00:00:00.000Z'

  it('carries both halves through a round trip', () => {
    ensureCustomerRegister()
    const rowId =
      addCustomer({
        [nameFieldId()]: 'R. Kelleher',
        [CUSTOMER_PHONE_FIELD]: '0400 000 000',
      })?.id ?? ''
    const q = draft()
    const frozen = freezeCustomer(ctx, rowId)
    if (frozen) link(q.id, frozen)

    const wire = JSON.parse(JSON.stringify([getQuote(q.id)])) as unknown
    const back = normQuotes(wire, stamp, 'northside')

    expect(back).toHaveLength(1)
    expect(back[0].customer).toEqual({ name: 'R. Kelleher', contact: ['0400 000 000'] })
    expect(back[0].customerRef).toEqual({ tableId: CUSTOMER_TABLE_ID, rowId })
    expect(quoteTotals(back[0]).total).toBe(62000)
  })

  it('drops a malformed pointer and keeps the document whole', () => {
    const q = draft({ customer: { name: 'R. Kelleher' } })
    const wire = JSON.parse(JSON.stringify([getQuote(q.id)])) as Array<Record<string, unknown>>
    wire[0].customerRef = { tableId: 'a table', rowId: '../../etc' }

    const back = normQuotes(wire, stamp, 'northside')
    expect(back[0].customerRef).toBeUndefined()
    expect(back[0].customer.name).toBe('R. Kelleher')
    expect(quoteTotals(back[0]).total).toBe(62000)
  })
})
