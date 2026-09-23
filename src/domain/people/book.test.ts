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
  alreadyFiled,
  cellsFor,
  fieldsToFile,
  groupBook,
  lastTouched,
  letterShape,
  lineagesOf,
  openAs,
  orderBook,
  quotesSay,
  readBook,
  registerShape,
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

  it('hands the register order back untouched', () => {
    const book = readBook(register(), rows, [], indexQuotes([]))
    expect(orderBook(book, 'register').map((r) => r.rowId)).toEqual(['c1', 'c2', 'c3'])
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
    expect(alreadyFiled('Sarah Jones')).toBe('A Sarah Jones is already filed.')
  })
})
