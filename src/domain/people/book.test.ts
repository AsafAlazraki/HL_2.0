import { describe, expect, it } from 'vitest'
import type { EntityDef, QuoteDef, QuoteLine, RowData } from '@/domain/model'
import { emptySheet, indexRows } from '@/domain/catalogue/sheet'
import { addRow, createTable, isDone } from '@/domain/catalogue/commands'
import { customerHistory, indexQuotes } from '@/domain/quote/diary/history'
import {
  CUSTOMER_ADDRESS_FIELD,
  CUSTOMER_EMAIL_FIELD,
  CUSTOMER_NOTE_FIELD,
  CUSTOMER_PHONE_FIELD,
  CUSTOMER_TABLE_ID,
  customerRegister,
  readCustomer,
} from './customers'
import {
  DESK_TITLE,
  QUOTED,
  addedSay,
  alreadyFiled,
  behindSay,
  broughtUpSay,
  cellsFor,
  cellsFromQuote,
  changeSay,
  countCustomers,
  customersSay,
  daySaid,
  draftsBehind,
  fieldsToFile,
  firstDay,
  givenOf,
  groupBook,
  isQuoted,
  keepsNameSay,
  lastTouched,
  letterShape,
  lineagesOf,
  openAs,
  orderBook,
  pageColumns,
  placeLines,
  quotedOn,
  quotedPeople,
  quotesSay,
  reachSay,
  readBook,
  readEveryone,
  readPage,
  readTypedNames,
  registerShape,
  rowQuotesSay,
  sinceSay,
  unfiledNames,
} from './book'

/* ============================================================
   THE BOOK, READ — pure arithmetic over a register and a pile of
   quotes, with no store and no browser. Every document below is the
   smallest honest quote `customerLink.test.ts` builds; nothing is
   seeded into the app and no figure is typed twice.
   ============================================================ */

const ISO = '2026-01-01T00:00:00.000Z'

function register(extra: EntityDef['fields'] = []): EntityDef {
  return {
    id: CUSTOMER_TABLE_ID,
    orgId: 'northside',
    name: 'Customers',
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

function person(id: string, values: Record<string, string>, updatedAt = ISO): RowData {
  return { id, orgId: 'northside', entityId: CUSTOMER_TABLE_ID, values, createdAt: ISO, updatedAt }
}

let n = 0
function quote(over: Partial<QuoteDef> = {}): QuoteDef {
  n += 1
  const hull: QuoteLine = {
    id: `l${n}`,
    entityId: 'tbl_boats',
    rowId: 'row_1',
    label: 'A hull',
    qty: 1,
    unitPrice: 62_000,
    priceFieldId: 'fld_cash',
    priceColumnName: 'Cash',
    levelKey: 'cash',
    levelResolved: 'cash',
    levels: [{ key: 'cash', label: 'Cash', fieldId: 'fld_cash', value: 62_000, scope: 'quote' }],
  }
  const at = new Date(Date.UTC(2026, 0, 1 + n, 2)).toISOString()
  return {
    id: `q${n}`,
    orgId: 'northside',
    reference: `202601${String(1 + n).padStart(2, '0')}-01`,
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
    createdAt: at,
    updatedAt: at,
    ...over,
  }
}

const to = (rowId: string, name = 'R. Kelleher'): Partial<QuoteDef> => ({
  customer: { name },
  customerRef: { tableId: CUSTOMER_TABLE_ID, rowId },
})

/* ---------------------------------------------------------- */

describe('the register is made with the columns customers.ts declares', () => {
  it('carries the well-known id, a Name column first, then the four with their sentences', () => {
    const shape = registerShape()
    expect(shape.tableId).toBe(CUSTOMER_TABLE_ID)
    expect(shape.fields?.[0]).toMatchObject({ name: 'Name', type: 'text', required: true })
    expect(shape.fields?.map((f) => f.id).slice(1)).toEqual([
      CUSTOMER_PHONE_FIELD,
      CUSTOMER_EMAIL_FIELD,
      CUSTOMER_ADDRESS_FIELD,
      CUSTOMER_NOTE_FIELD,
    ])
    expect(shape.fields?.[4]?.description).toBe('For the yard — never printed on a quote.')
  })

  it('mints the Name column id each time, so two registers never share one', () => {
    expect(registerShape().fields?.[0]?.id).not.toBe(registerShape().fields?.[0]?.id)
  })

  it('is a table createTable makes, and addRow then files a person readCustomer reads', () => {
    const sheet = { ...emptySheet(), orgId: 'northside', index: indexRows({}) }
    const made = createTable(registerShape())(sheet, ISO)
    expect(isDone(made)).toBe(true)
    if (!isDone(made)) return
    const table = customerRegister(made.next.tables)
    expect(table?.name).toBe('Customers')
    const nameId = table?.displayFieldId ?? ''
    const filed = addRow(CUSTOMER_TABLE_ID, {
      [nameId]: 'R. Kelleher',
      [CUSTOMER_NOTE_FIELD]: 'blue Hilux',
    })(made.next, ISO)
    expect(isDone(filed)).toBe(true)
    if (!isDone(filed) || !table) return
    const row = filed.next.rows[CUSTOMER_TABLE_ID][0]
    expect(readCustomer(table, row)).toMatchObject({ name: 'R. Kelleher', note: 'blue Hilux' })
  })
})

describe('the form is one form on both days', () => {
  it('is the shape the register will be made with, before there is one, under the name id given', () => {
    const fields = fieldsToFile(undefined, 'f-minted')
    expect(fields.map((f) => f.name)).toEqual(['Name', 'Phone', 'Email', 'Address', 'Notes'])
    expect(fields[0].id).toBe('f-minted')
  })

  it('is the register’s own columns once there is one, a dealer’s included, the label first', () => {
    const own = register([{ id: 'f-abn', name: 'ABN', type: 'text' }])
    own.fields = [...own.fields.slice(1), own.fields[0]]
    const fields = fieldsToFile(own, 'f-name')
    expect(fields.map((f) => f.name)).toContain('ABN')
    expect(fields[0].id).toBe('f-name')
  })
})

describe('the letter tells the columns apart by their job', () => {
  it('finds the four by id and hands the dealer’s own column to others', () => {
    const shape = letterShape(register([{ id: 'f-abn', name: 'ABN', type: 'text' }]))
    expect(shape.name?.id).toBe('f-name')
    expect(shape.phone?.id).toBe(CUSTOMER_PHONE_FIELD)
    expect(shape.note?.id).toBe(CUSTOMER_NOTE_FIELD)
    expect(shape.others.map((f) => f.name)).toEqual(['ABN'])
  })

  it('leaves a deleted column undefined rather than inventing one', () => {
    const own = register()
    own.fields = own.fields.filter((f) => f.id !== CUSTOMER_PHONE_FIELD)
    expect(letterShape(own).phone).toBeUndefined()
  })
})

describe('a row of the book', () => {
  it('counts the quotes to a row and reads the newest one’s standing and day', () => {
    const rows = [person('c1', { 'f-name': 'R. Kelleher', [CUSTOMER_PHONE_FIELD]: '0400' })]
    const older = quote(to('c1'))
    const newer = quote({ ...to('c1'), state: 'issued', issuedAt: '2026-03-01T02:00:00.000Z' })
    const quotes = [older, newer]
    const book = readBook(register(), rows, quotes, indexQuotes(quotes))
    expect(book).toHaveLength(1)
    expect(book[0]).toMatchObject({
      rowId: 'c1',
      name: 'R. Kelleher',
      contact: '0400',
      quotes: 2,
      latest: { id: newer.id, reference: newer.reference, standing: 'given', day: '2026-03-01' },
    })
  })

  it('reads a person with no quote as none, never as a figure', () => {
    const book = readBook(register(), [person('c1', { 'f-name': 'A' })], [], indexQuotes([]))
    expect(book[0].quotes).toBe(0)
    expect(book[0].latest).toBeNull()
    expect(book[0].contact).toBe('')
  })

  it('is touched by the later of its own edit and its newest quote', () => {
    const rows = [person('c1', { 'f-name': 'A' }, '2026-05-01T00:00:00.000Z')]
    const q = quote(to('c1'))
    const book = readBook(register(), rows, [q], indexQuotes([q]))
    expect(book[0].touched).toBe('2026-05-01T00:00:00.000Z')
  })
})

describe('the last one touched', () => {
  it('is the newest, and on a tie the later in the register', () => {
    const rows = [
      person('c1', { 'f-name': 'A' }, '2026-02-01T00:00:00.000Z'),
      person('c2', { 'f-name': 'B' }, '2026-03-01T00:00:00.000Z'),
      person('c3', { 'f-name': 'C' }, '2026-03-01T00:00:00.000Z'),
    ]
    const book = readBook(register(), rows, [], indexQuotes([]))
    expect(lastTouched(book)).toBe('c3')
    expect(lastTouched([])).toBeUndefined()
  })
})

describe('order and grouping are controls, never the rest state', () => {
  const rows = [
    person('c1', { 'f-name': 'Zoe' }),
    person('c2', { 'f-name': '' }),
    person('c3', { 'f-name': 'Adam' }),
  ]

  it('puts whoever was touched last first at rest, and keeps the list order on a tie', () => {
    const stamped = [
      person('c1', { 'f-name': 'Zoe' }, '2026-02-01T00:00:00.000Z'),
      person('c2', { 'f-name': '' }, '2026-03-01T00:00:00.000Z'),
      person('c3', { 'f-name': 'Adam' }, '2026-02-01T00:00:00.000Z'),
    ]
    const book = readBook(register(), stamped, [], indexQuotes([]))
    expect(orderBook(book, 'recent').map((r) => r.rowId)).toEqual(['c2', 'c1', 'c3'])
    /* and never touches the list it was handed */
    expect(book.map((r) => r.rowId)).toEqual(['c1', 'c2', 'c3'])
  })

  it('alphabetises only when pressed, with an unnamed row last', () => {
    const book = readBook(register(), rows, [], indexQuotes([]))
    expect(orderBook(book, 'name').map((r) => r.name)).toEqual(['Adam', 'Zoe', ''])
  })

  it('groups by the standing of the latest quote, drafts first, and leaves empty groups out', () => {
    const q1 = quote(to('c1', 'Zoe'))
    const q2 = quote({ ...to('c3', 'Adam'), state: 'issued' })
    const quotes = [q1, q2]
    const book = readBook(register(), rows, quotes, indexQuotes(quotes))
    const groups = groupBook(book, 'desk')
    expect(groups.map((g) => g.title)).toEqual([
      DESK_TITLE.draft,
      DESK_TITLE.given,
      DESK_TITLE.none,
    ])
    expect(groups[0].rows.map((r) => r.rowId)).toEqual(['c1'])
    expect(groups[2].rows.map((r) => r.rowId)).toEqual(['c2'])
  })

  it('is one untitled group when nothing is grouping it', () => {
    const book = readBook(register(), rows, [], indexQuotes([]))
    const groups = groupBook(book, 'none')
    expect(groups).toHaveLength(1)
    expect(groups[0].title).toBe('')
    expect(groups[0].rows).toHaveLength(3)
  })
})

describe('names typed on quotes with nobody filed behind them', () => {
  it('lists each such quote once, newest first, and leaves the rest out', () => {
    const typed = quote({ customer: { name: 'A walk-in', contact: ['0400'] } })
    const filed = quote(to('c1'))
    const nobody = quote()
    const typedIssued = quote({ customer: { name: 'A walk-in' }, state: 'issued' })
    const quotes = [typed, filed, nobody, typedIssued]
    const pile = unfiledNames(quotes, indexQuotes(quotes))
    expect(pile.map((p) => p.quoteId)).toEqual([typedIssued.id, typed.id])
    expect(pile[1]).toMatchObject({ name: 'A walk-in', contact: ['0400'], addressable: true })
    /* a given quote keeps what it was given, so it cannot be re-addressed */
    expect(pile[0].addressable).toBe(false)
  })

  it('never folds two quotes that carry one typed name into one person', () => {
    const a = quote({ customer: { name: 'Dave' } })
    const b = quote({ customer: { name: 'Dave' } })
    expect(unfiledNames([a, b], indexQuotes([a, b]))).toHaveLength(2)
  })
})

/* THE CRITIC'S #16, AS ARITHMETIC. A dealer files "J. Harrow" off the
   pile, from a quote that was already given; the engine rightly leaves
   that quote addressed by the name it was given. Until 2026-09-23 the
   screen then said, on the same page, that the name was still unfiled
   and that J. Harrow had no quotes. These cases hold the reading that
   replaced it: the relation is said, and nothing is addressed. */
describe('a typed name that is exactly one filed person’s name', () => {
  const LATER = '2026-06-01T00:00:00.000Z'
  const filedLater = (id: string, name: string): RowData => ({
    ...person(id, { 'f-name': name }),
    createdAt: LATER,
    updatedAt: LATER,
  })

  it('leaves the pile and is said on their page, given before they were filed', () => {
    const given = quote({
      customer: { name: 'J. Harrow', contact: ['0400'] },
      state: 'issued',
      issuedAt: '2026-01-02T00:00:00.000Z',
    })
    const index = indexQuotes([given])
    const rows = [filedLater('c1', 'J. Harrow')]
    const typed = readTypedNames(register(), rows, index)
    expect(typed.unfiled).toEqual([])
    expect(typed.byName).toEqual([
      {
        quoteId: given.id,
        reference: given.reference,
        name: 'J. Harrow',
        standing: 'given',
        day: '2026-01-02',
        rowId: 'c1',
        before: true,
        addressable: false,
      },
    ])
    /* and NOTHING was addressed: a reading, never a write */
    expect(given.customerRef).toBeUndefined()
  })

  it('is the same name in any case and with its spaces trimmed, and nothing looser', () => {
    const a = quote({ customer: { name: '  j. harrow ' } })
    const b = quote({ customer: { name: 'J Harrow' } })
    const index = indexQuotes([a, b])
    const typed = readTypedNames(register(), [filedLater('c1', 'J. Harrow')], index)
    expect(typed.byName.map((l) => l.quoteId)).toEqual([a.id])
    expect(typed.unfiled.map((l) => l.quoteId)).toEqual([b.id])
  })

  it('stays on the pile when two people carry the name, and says how many', () => {
    const q = quote({ customer: { name: 'Dave' } })
    const rows = [filedLater('c1', 'Dave'), filedLater('c2', 'Dave')]
    const typed = readTypedNames(register(), rows, indexQuotes([q]))
    expect(typed.byName).toEqual([])
    expect(typed.unfiled).toHaveLength(1)
    expect(typed.unfiled[0]!.namesakes).toBe(2)
  })

  it('says a name typed after the filing as that, and a draft can still be addressed', () => {
    const rows = [person('c1', { 'f-name': 'J. Harrow' })] // filed on ISO, before every quote
    const draft = quote({ customer: { name: 'J. Harrow' } })
    const typed = readTypedNames(register(), rows, indexQuotes([draft]))
    expect(typed.byName[0]).toMatchObject({ before: false, addressable: true })
  })

  it('reads a quote given in the same instant as the filing as given before it', () => {
    /* the rulers' fixed clock stamps a whole walk with one instant */
    const at = '2026-09-16T00:00:00.000Z'
    const q = quote({
      customer: { name: 'J. Harrow' },
      state: 'issued',
      issuedAt: at,
      createdAt: at,
    })
    const rows = [{ ...person('c1', { 'f-name': 'J. Harrow' }), createdAt: at, updatedAt: at }]
    expect(readTypedNames(register(), rows, indexQuotes([q])).byName[0]!.before).toBe(true)
  })

  it('reads a quote given after the filing as after it, and addresses nothing', () => {
    const q = quote({
      customer: { name: 'J. Harrow' },
      state: 'issued',
      issuedAt: '2026-02-01T00:00:00.000Z',
    })
    const typed = readTypedNames(
      register(),
      [person('c1', { 'f-name': 'J. Harrow' })],
      indexQuotes([q]),
    )
    expect(typed.byName[0]).toMatchObject({ before: false, addressable: false })
    expect(q.customerRef).toBeUndefined()
  })

  it('is the whole pile when there is no book at all', () => {
    const q = quote({ customer: { name: 'J. Harrow' } })
    const typed = readTypedNames(undefined, [], indexQuotes([q]))
    expect(typed.byName).toEqual([])
    expect(typed.unfiled.map((l) => l.quoteId)).toEqual([q.id])
  })

  it('puts the quote on their row, counted apart, and reads its standing at the desk', () => {
    const given = quote({ customer: { name: 'J. Harrow' }, state: 'issued' })
    const quotes = [given]
    const index = indexQuotes(quotes)
    const book = readBook(register(), [filedLater('c1', 'J. Harrow')], quotes, index)
    expect(book[0]).toMatchObject({
      quotes: 0,
      byName: 1,
      latest: { id: given.id, standing: 'given', byName: true },
    })
    /* "Quoted, waiting" and never "Not yet quoted" */
    expect(groupBook(book, 'desk').map((g) => g.title)).toEqual([DESK_TITLE.given])
    expect(rowQuotesSay(book[0]!.quotes, book[0]!.byName)).toBe('1 quote')
  })

  it('counts addressed and by-name quotes together, as quotes, without the engine’s distinction', () => {
    expect(rowQuotesSay(0, 0)).toBe('no quotes')
    expect(rowQuotesSay(2, 0)).toBe('2 quotes')
    expect(rowQuotesSay(0, 2)).toBe('2 quotes')
    expect(rowQuotesSay(2, 1)).toBe('3 quotes')
  })

  it('sums only what was given, by the engine’s own totals', () => {
    const given = quote({ state: 'issued' })
    const draft = quote()
    const index = indexQuotes([given, draft])
    expect(givenOf([given, draft], index)).toEqual({ count: 1, total: 62_000 })
  })
})

describe('one person’s quotes, by lineage', () => {
  it('puts a version and what it replaced in one lineage, newest first', () => {
    const first = quote({ ...to('c1'), state: 'issued' })
    const second = quote({ ...to('c1'), supersedesId: first.id })
    const lone = quote(to('c1'))
    const quotes = [first, second, lone]
    const index = indexQuotes(quotes)
    const lineages = lineagesOf(customerHistory('c1', quotes, index), index)
    expect(lineages.map((l) => l.quotes.map((q) => q.id))).toEqual([
      [lone.id],
      [second.id, first.id],
    ])
    expect(lineages[1].rootId).toBe(first.id)
  })

  it('lists only this person’s quotes under a lineage', () => {
    const first = quote({ ...to('c1'), state: 'issued' })
    const theirs = quote({ ...to('c2', 'Somebody else'), supersedesId: first.id })
    const quotes = [first, theirs]
    const index = indexQuotes(quotes)
    const lineages = lineagesOf(customerHistory('c1', quotes, index), index)
    expect(lineages).toHaveLength(1)
    expect(lineages[0].quotes.map((q) => q.id)).toEqual([first.id])
  })
})

describe('the cells a filing writes', () => {
  it('agrees with fileCustomer’s own positional rule, line for line', async () => {
    const { fileCustomer } = await import('@/domain/quote/freeze')
    const { makeCtx } = await import('@/domain/model')
    const table = register()
    const ctx = makeCtx({
      orgId: 'northside',
      entities: { [CUSTOMER_TABLE_ID]: table },
      rowsByEntity: { [CUSTOMER_TABLE_ID]: [] },
      now: () => ISO,
    })
    let written: Record<string, unknown> = {}
    fileCustomer(
      ctx,
      {
        addRow: (entityId, values = {}) => {
          written = values
          return { id: 'c9', orgId: 'northside', entityId, values, createdAt: ISO, updatedAt: ISO }
        },
      },
      ' R. Kelleher ',
      ['0400 000 000', '', 'rk@example.test'],
    )
    expect(cellsFor('f-name', ' R. Kelleher ', ['0400 000 000', '', 'rk@example.test'])).toEqual(
      written,
    )
  })

  it('writes the note under its own column and never a blank cell', () => {
    expect(cellsFor('f-name', 'A', [], ' blue Hilux ')).toEqual({
      'f-name': 'A',
      [CUSTOMER_NOTE_FIELD]: 'blue Hilux',
    })
  })
})

describe('the small words', () => {
  it('opens a draft as a draft and a given quote as paper', () => {
    expect(openAs('draft')).toBe('draft')
    expect(openAs('given')).toBe('issued')
    expect(openAs('replaced')).toBe('superseded')
  })

  it('counts in the right number', () => {
    expect(quotesSay(0)).toBe('no quotes')
    expect(quotesSay(1)).toBe('1 quote')
    expect(quotesSay(2)).toBe('2 quotes')
  })

  it('says the duplicate by name', () => {
    expect(alreadyFiled('Sarah Jones')).toBe('A Sarah Jones is already a customer.')
  })
})

describe('days and headings as the desk says them (M2-close #4, #19)', () => {
  it('says today, then the diary’s own words, and never the ISO date', () => {
    expect(daySaid('2026-09-24', '2026-09-24')).toBe('today')
    expect(daySaid('2026-09-16', '2026-09-24')).toBe('Wednesday 16 September')
    expect(daySaid('2025-12-31', '2026-01-02')).toBe('Wednesday 31 December 2025')
    expect(daySaid('', '2026-09-24')).toBe('')
    expect(daySaid('not a day', '2026-09-24')).toBe('not a day')
  })
})

/* ============================================================
   THE M2-CLOSE CRITIQUE'S FINDING 7, AS ARITHMETIC. "Give a quote to
   M. Duffy, then press Customers: 'Nobody is filed yet.'" Everyone a
   quote names is a customer, one per name, as a reading that writes
   nothing; the book keeps a person when the page is given something.
   ============================================================ */

describe('everyone a quote names is a customer (M2-close #7)', () => {
  it('reads a name on a quote as a customer, with no book at all, and writes nothing', () => {
    const given = quote({
      customer: { name: 'M. Duffy', contact: ['0400 555 010'] },
      state: 'issued',
      issuedAt: '2026-01-05T00:00:00.000Z',
    })
    const index = indexQuotes([given])
    const everyone = readEveryone(undefined, [], [given], index)
    expect(everyone.rows).toHaveLength(1)
    expect(everyone.rows[0]).toMatchObject({
      rowId: `${QUOTED}${given.id}`,
      kept: false,
      name: 'M. Duffy',
      contact: '0400 555 010',
      quotes: 0,
      byName: 1,
      latest: { id: given.id, standing: 'given', day: '2026-01-05', byName: true },
    })
    expect(everyone.people).toEqual([
      { rowId: `${QUOTED}${given.id}`, name: 'M. Duffy', contact: ['0400 555 010'], note: '' },
    ])
    expect(isQuoted(everyone.rows[0]!.rowId)).toBe(true)
    expect(given.customerRef).toBeUndefined()
    expect(countCustomers(undefined, [], [given])).toBe(1)
  })

  it('draws quotes that carry one name as one person, keyed by the oldest, read from the newest', () => {
    const older = quote({ customer: { name: 'M. Duffy', contact: ['old line'] } })
    const newer = quote({ customer: { name: ' m. duffy', contact: ['0400 555 010'] } })
    const other = quote({ customer: { name: 'J. Harrow' } })
    const index = indexQuotes([older, newer, other])
    const people = quotedPeople(readTypedNames(undefined, [], index).unfiled)
    expect(people.map((p) => p.key)).toEqual([`${QUOTED}${other.id}`, `${QUOTED}${older.id}`])
    const duffy = people[1]!
    expect(duffy.lines.map((l) => l.quoteId)).toEqual([newer.id, older.id])
    expect(duffy.contact).toEqual(['0400 555 010'])
    expect(duffy.name).toBe('m. duffy')
  })

  it('keeps a name two kept people share apart, one quote each, and counts the namesakes', () => {
    const a = quote({ customer: { name: 'Dave' } })
    const b = quote({ customer: { name: 'Dave' } })
    const rows = [person('c1', { 'f-name': 'Dave' }), person('c2', { 'f-name': 'Dave' })]
    const index = indexQuotes([a, b])
    const people = quotedPeople(readTypedNames(register(), rows, index).unfiled)
    expect(people).toHaveLength(2)
    expect(people.every((p) => p.namesakes === 2)).toBe(true)
    expect(countCustomers(register(), rows, [a, b])).toBe(4)
  })

  it('puts a name exactly one kept person carries on their row, never as a second customer', () => {
    const q = quote({ customer: { name: 'J. Harrow' }, state: 'issued' })
    const rows = [person('c1', { 'f-name': 'J. Harrow' })]
    const everyone = readEveryone(register(), rows, [q], indexQuotes([q]))
    expect(everyone.rows.map((r) => [r.rowId, r.kept, r.byName])).toEqual([['c1', true, 1]])
  })
})

describe('a person’s page, read once', () => {
  it('reads a name on quotes from its newest quote, with the quote it was typed on', () => {
    const older = quote({
      customer: { name: 'M. Duffy' },
      state: 'issued',
      issuedAt: '2026-01-03T00:00:00.000Z',
    })
    const newer = quote({ customer: { name: 'M. Duffy', contact: ['mduffy@example.test'] } })
    const quotes = [older, newer]
    const index = indexQuotes(quotes)
    const everyone = readEveryone(undefined, [], quotes, index)
    const page = readPage(`${QUOTED}${older.id}`, undefined, [], quotes, index, everyone, 'f-n')!
    expect(page).toMatchObject({
      kept: false,
      name: 'M. Duffy',
      block: ['mduffy@example.test'],
      values: { 'f-n': 'M. Duffy', [CUSTOMER_EMAIL_FIELD]: 'mduffy@example.test' },
      since: '2026-01-03',
      changed: '',
      namesakes: 0,
      behind: [],
    })
    expect(page.source?.quoteId).toBe(newer.id)
    expect(page.quotes.map((q) => q.id)).toEqual([newer.id, older.id])
  })

  it('reads a kept person’s row, every quote on their page, and the drafts behind it', () => {
    const rows = [
      {
        ...person('c1', { 'f-name': 'R. Kelleher', [CUSTOMER_PHONE_FIELD]: '0400' }),
        createdAt: '2026-01-02T00:00:00.000Z',
        updatedAt: '2026-01-09T00:00:00.000Z',
      },
    ]
    const addressed = quote({ ...to('c1'), state: 'issued' })
    const typed = quote({ customer: { name: 'R. Kelleher' } })
    const quotes = [addressed, typed]
    const index = indexQuotes(quotes)
    const everyone = readEveryone(register(), rows, quotes, index)
    const page = readPage('c1', register(), rows, quotes, index, everyone, 'f-name')!
    expect(page).toMatchObject({
      kept: true,
      name: 'R. Kelleher',
      block: ['0400'],
      source: null,
      changed: '2026-01-09',
    })
    expect(page.values[CUSTOMER_PHONE_FIELD]).toBe('0400')
    expect(page.quotes.map((q) => q.id).sort()).toEqual([addressed.id, typed.id].sort())
    /* the typed draft prints no phone and is addressed to nobody; the given one keeps its own */
    expect(page.behind.map((q) => q.id)).toEqual([typed.id])
  })

  it('dates a customer from their first quote when it came before they were kept', () => {
    const q = quote({
      customer: { name: 'A' },
      state: 'issued',
      issuedAt: '2025-12-01T00:00:00.000Z',
    })
    const rows = [{ ...person('c1', { 'f-name': 'A' }), createdAt: '2026-03-01T00:00:00.000Z' }]
    const index = indexQuotes([q])
    const everyone = readEveryone(register(), rows, [q], index)
    expect(readPage('c1', register(), rows, [q], index, everyone, 'f-name')!.since).toBe(
      '2025-12-01',
    )
  })

  it('is null for a key that names nobody', () => {
    const index = indexQuotes([])
    const everyone = readEveryone(register(), [], [], index)
    expect(readPage('gone', register(), [], [], index, everyone, 'f-name')).toBeNull()
    expect(readPage(`${QUOTED}gone`, register(), [], [], index, everyone, 'f-name')).toBeNull()
  })

  it('is drawn with the book’s columns, or the shape the book will be made with', () => {
    const made = registerShape()
    const cols = pageColumns(undefined, made, 'f-minted')
    expect(cols.displayFieldId).toBe('f-minted')
    expect(cols.fields.map((f) => f.name)).toEqual(['Name', 'Phone', 'Email', 'Address', 'Notes'])
    expect(letterShape(cols).name?.id).toBe('f-minted')
    const own = register()
    expect(pageColumns(own, made, 'f-name')).toBe(own)
  })
})

describe('a line typed on a quote, under the column it belongs in', () => {
  it('reads an email, a phone and an address by their look', () => {
    expect(placeLines(['0400 123 456', 'm@x.test', '12 Wharf St, Brisbane'])).toEqual({
      phone: '0400 123 456',
      email: 'm@x.test',
      address: '12 Wharf St, Brisbane',
    })
    expect(placeLines(['m@x.test'])).toEqual({ phone: '', email: 'm@x.test', address: '' })
    expect(placeLines(['+61 (7) 3000-1234'])).toMatchObject({ phone: '+61 (7) 3000-1234' })
  })

  it('never drops a line: a second of a kind and anything else joins the address', () => {
    expect(placeLines(['0400 111 222', '0400 333 444', 'Lot 4'])).toEqual({
      phone: '0400 111 222',
      email: '',
      address: '0400 333 444, Lot 4',
    })
    /* too few digits to be a phone */
    expect(placeLines(['Unit 12'])).toMatchObject({ phone: '', address: 'Unit 12' })
    expect(placeLines(['', '  '])).toEqual({ phone: '', email: '', address: '' })
  })

  it('writes the name and the placed lines, and never a blank cell', () => {
    expect(cellsFromQuote('f-name', ' M. Duffy ', ['m@x.test'])).toEqual({
      'f-name': 'M. Duffy',
      [CUSTOMER_EMAIL_FIELD]: 'm@x.test',
    })
  })
})

describe('the drafts a change on a page reaches', () => {
  it('names a draft addressed with older details, and one that only carries the name', () => {
    const rows = [person('c1', { 'f-name': 'R. Kelleher', [CUSTOMER_PHONE_FIELD]: '0400' })]
    const stale = quote(to('c1'))
    const current = quote({
      customer: { name: 'R. Kelleher', contact: ['0400'] },
      customerRef: { tableId: CUSTOMER_TABLE_ID, rowId: 'c1' },
    })
    const typed = quote({ customer: { name: 'R. Kelleher' } })
    const given = quote({ customer: { name: 'R. Kelleher' }, state: 'issued' })
    const theirs = quote({ customer: { name: 'Somebody else' } })
    const index = indexQuotes([stale, current, typed, given, theirs])
    expect(
      draftsBehind(register(), rows, 'c1', index)
        .map((q) => q.id)
        .sort(),
    ).toEqual([stale.id, typed.id].sort())
    expect(draftsBehind(register(), rows, 'nobody', index)).toEqual([])
  })
})

describe('the words a page says', () => {
  it('says a change as the line now reads, and a name as the new name', () => {
    expect(changeSay('M. Duffy', 'Phone', '0400 123 456', false)).toBe(
      'M. Duffy’s phone is 0400 123 456.',
    )
    expect(changeSay('M. Duffy', 'Phone', '', false)).toBe('M. Duffy’s phone is taken off.')
    expect(changeSay('M. Duffy', 'Name', 'Mick Duffy', true)).toBe('M. Duffy is now Mick Duffy.')
    expect(changeSay('', 'Email', 'a@b.test', false)).toBe('Their email is a@b.test.')
  })

  it('says the drafts a change reached, and nothing when it reached none', () => {
    expect(reachSay([])).toBe('')
    expect(reachSay(['20260924-02'])).toBe(' Their draft 20260924-02 prints it too.')
    expect(reachSay(['a', 'b'])).toBe(' Their drafts a, b print it too.')
    expect(broughtUpSay(['a'])).toBe('a now prints their details as they are here.')
    expect(behindSay(['a'])).toBe('a is a draft and still prints the details it was written with.')
  })

  it('counts customers, adds one, and dates one, in the dealer’s words', () => {
    expect(customersSay(1)).toBe('1 customer')
    expect(customersSay(1200)).toBe('1,200 customers')
    expect(addedSay(' Sarah Jones ')).toBe('Sarah Jones is added.')
    expect(sinceSay('2026-09-24', '2026-09-24')).toBe('A customer since today')
    expect(sinceSay('2026-09-16', '2026-09-24')).toBe('A customer since Wednesday 16 September')
    expect(sinceSay('', '2026-09-24')).toBe('A customer')
    expect(firstDay(['2026-02-01', '', '2025-12-31'])).toBe('2025-12-31')
    expect(firstDay([])).toBe('')
  })

  it('counts the people whose newest quote is on a day', () => {
    const q = quote({ customer: { name: 'A' } })
    const index = indexQuotes([q])
    const rows = readEveryone(undefined, [], [q], index).rows
    expect(quotedOn(rows, rows[0]!.latest!.day)).toBe(1)
    expect(quotedOn(rows, '1999-01-01')).toBe(0)
  })
})

describe('a new name does not leave a person’s own drafts behind', () => {
  it('reaches a draft the caller names, whatever name it carries, and never a given one', () => {
    const rows = [person('c1', { 'f-name': 'Mick Duffy' })]
    const draft = quote({ customer: { name: 'M. Duffy' } })
    const given = quote({ customer: { name: 'M. Duffy' }, state: 'issued' })
    const index = indexQuotes([draft, given])
    expect(draftsBehind(register(), rows, 'c1', index)).toEqual([])
    expect(
      draftsBehind(register(), rows, 'c1', index, [draft.id, given.id]).map((q) => q.id),
    ).toEqual([draft.id])
  })

  it('says which given quotes keep the old name, and nothing when none do', () => {
    expect(keepsNameSay([], 'M. Duffy')).toBe('')
    expect(keepsNameSay(['20260924-01'], 'M. Duffy')).toBe(
      ' 20260924-01 was given to “M. Duffy” and keeps that name.',
    )
    expect(keepsNameSay(['a', 'b'], 'M. Duffy')).toBe(
      ' a, b were given to “M. Duffy” and keep that name.',
    )
  })
})
