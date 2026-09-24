/* ============================================================
   THE FINDER'S GRAMMAR, ON THE REAL FILE.

   Every assertion here is a PROPERTY of the grammar rather than a
   figure off today's pack, for the reason `search.northside.test.ts`
   states beside its own: the seed is a living document, and "every
   row carries a verb" stays true when a brand is added where
   "=== 11" does not. The two figures that ARE asserted are the two
   the module would be wrong about rather than merely different —
   nothing typed answers with the five doors, and the customer
   register is never answered twice.
   ============================================================ */
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { buildSearchIndex, search, type SearchIndex } from '@/domain/catalogue/search'
import { CUSTOMER_TABLE_ID } from '@/domain/people/customers'
import { DOORS } from '@/app/ways'
import { MIN_ASK, NOTHING_MATCHED, readFinder, type FinderInput } from './finder'

let index: SearchIndex
let boatTables: Set<string>

beforeAll(async () => {
  const pack = await loadPack()
  index = buildSearchIndex(pack.ctx.entities, pack.ctx.rowsByEntity)
  boatTables = new Set(
    Object.values(pack.ctx.entities)
      .filter((e) => e.kind === 'boat')
      .map((e) => e.id),
  )
})

const DOOR_ROWS = DOORS.map((d) => ({ href: d.href, word: d.word, say: d.say }))

const ACTS = [
  {
    act: 'new-quote' as const,
    name: 'New quote',
    say: 'Choose a hull and start a document.',
    verb: 'Start it',
  },
  {
    act: 'load-the-file' as const,
    name: 'Load the file',
    say: 'Read the Master Price File into this browser.',
    verb: 'Read it in',
  },
]

const ask = (query: string, over: Partial<FinderInput> = {}) =>
  readFinder({
    query,
    doors: DOOR_ROWS,
    acts: ACTS,
    recent: [],
    result: query.trim().length >= MIN_ASK ? search(index, query) : null,
    people: [],
    boatTables,
    customerTableId: CUSTOMER_TABLE_ID,
    ...over,
  })

describe('at rest, before a character is typed', () => {
  it('offers the five doors and the acts, and nothing is empty-handed', () => {
    const reading = ask('')
    expect(reading.asking).toBe(false)
    const doors = reading.groups.find((g) => g.id === 'doors')
    expect(doors?.rows.map((r) => r.name)).toEqual(DOORS.map((d) => d.word))
    expect(reading.groups.find((g) => g.id === 'acts')?.rows).toHaveLength(ACTS.length)
    expect(reading.options.length).toBeGreaterThanOrEqual(DOORS.length)
  })

  it('puts where this browser has been above the doors, and only when there is one', () => {
    expect(ask('').groups.map((g) => g.id)).not.toContain('recent')
    const back = ask('', {
      recent: [
        {
          id: 'recent:/data',
          name: 'Data',
          fact: 'the tables',
          verb: 'Go back',
          target: { at: 'door', href: '/data' },
        },
      ],
    })
    expect(back.groups.map((g) => g.id)).toEqual(['recent', 'doors', 'acts'])
  })

  it('puts the screen’s own rows first, under its own chip', () => {
    const reading = ask('', {
      scope: {
        word: 'This build',
        title: 'On this build',
        rows: [
          {
            id: 'here:battery',
            name: 'Battery',
            fact: '3 chapters',
            verb: 'Go to it',
            target: { at: 'here', id: 'battery' },
          },
        ],
      },
    })
    expect(reading.groups[0]?.title).toBe('On this build')
    expect(reading.options[0]?.name).toBe('Battery')
  })
})

describe('while typing', () => {
  it('answers a table by name, and the row is a kind of its own', () => {
    const reading = ask('highfield')
    const tables = reading.groups.find((g) => g.id === 'tables')
    expect(tables && tables.rows.length > 0).toBe(true)
    expect(tables?.rows.every((r) => r.target.at === 'table')).toBe(true)
    /* the critic's §4: a ROW is reached, not only the register it
       lives in */
    const rowKinds = reading.options.filter((r) => r.target.at === 'row')
    expect(rowKinds.length).toBeGreaterThan(0)
  })

  it('answers a boat under its own word rather than under a table name', () => {
    const reading = ask('sp560')
    const boats = reading.groups.find((g) => g.id === 'boats')
    expect(boats?.title).toBe('Boats')
    expect(boats && boats.rows.length > 0).toBe(true)
    for (const row of boats?.rows ?? []) {
      expect(row.target.at).toBe('row')
      expect(row.verb).not.toBe('')
    }
  })

  it('every row in every group carries a verb and a stable id', () => {
    for (const q of ['yamaha', 'trailer', 'highfield', '560', 'stacer']) {
      const reading = ask(q)
      const ids = new Set<string>()
      for (const row of reading.options) {
        expect(row.verb.trim()).not.toBe('')
        expect(row.name.trim()).not.toBe('')
        expect(ids.has(row.id)).toBe(false)
        ids.add(row.id)
      }
      expect(reading.options).toHaveLength(reading.groups.reduce((n, g) => n + g.rows.length, 0))
    }
  })

  it('takes a door by its first letters, and only by its first letters', () => {
    expect(ask('cust').groups[0]?.id).toBe('doors')
    expect(ask('cust').options[0]?.name).toBe('Customers')
    /* "at" is inside Data and inside nothing a person means by it */
    const inside = ask('at')
    expect(inside.groups.find((g) => g.id === 'doors')).toBeUndefined()
  })

  it('never answers the customer register as a table of rows', () => {
    const reading = ask('customer', {
      people: [{ rowId: 'r1', name: 'Customer Example', contact: '0400 000 000' }],
    })
    for (const row of reading.options) {
      if (row.target.at === 'row') expect(row.target.tableId).not.toBe(CUSTOMER_TABLE_ID)
    }
    const people = reading.groups.find((g) => g.id === 'people')
    expect(people?.rows[0]?.fact).toBe('0400 000 000')
    expect(people?.rows[0]?.verb).toBe('Open their page')
  })

  it('opens a draft where it is written and an issued quote as the paper', () => {
    const withQuotes = buildSearchIndex(
      {},
      {},
      {
        quotes: [
          {
            id: 'q1',
            reference: '20260923-01',
            subject: 'SP560',
            customer: 'A Name',
            issued: false,
            total: 1,
          },
          {
            id: 'q2',
            reference: '20260923-02',
            subject: 'SP560',
            customer: 'A Name',
            issued: true,
            total: 1,
          },
        ],
      },
    )
    const reading = readFinder({
      query: '20260923',
      doors: DOOR_ROWS,
      acts: ACTS,
      recent: [],
      result: search(withQuotes, '20260923'),
      people: [],
      boatTables: new Set(),
      customerTableId: CUSTOMER_TABLE_ID,
    })
    const rows = reading.groups.find((g) => g.id === 'quotes')?.rows ?? []
    expect(rows.map((r) => r.verb)).toEqual(['Open the build', 'Open the paper'])
    expect(rows.map((r) => (r.target.at === 'quote' ? r.target.issued : null))).toEqual([
      false,
      true,
    ])
  })

  it('says what it could not find, in the query’s own words', () => {
    const reading = ask('zzzzqqqq')
    expect(reading.options).toHaveLength(0)
    expect(reading.nothing).toBe(NOTHING_MATCHED('zzzzqqqq'))
  })

  it('marks the run that matched, and marks nothing when the run is elsewhere', () => {
    const reading = ask('cust')
    const door = reading.options[0]!
    expect(door.at).toBe(0)
    expect(door.length).toBe(4)
    const people = readFinder({
      query: '0400',
      doors: DOOR_ROWS,
      acts: ACTS,
      recent: [],
      result: null,
      people: [{ rowId: 'r1', name: 'Marcus Webb', contact: '0400 123 456' }],
      boatTables: new Set(),
      customerTableId: CUSTOMER_TABLE_ID,
    })
    /* matched on a phone number: the run is not in the name, so
       nothing is marked */
    expect(people.groups.find((g) => g.id === 'people')?.rows[0]?.at).toBe(-1)
  })
})

describe('one row, once', () => {
  it('drops a global row the scope already drew, and drops the group it emptied', () => {
    const only = buildSearchIndex(
      {},
      {},
      {
        quotes: [
          {
            id: 'q1',
            reference: '20260923-01',
            subject: 'SP560',
            customer: 'A Name',
            issued: false,
            total: 1,
          },
        ],
      },
    )
    const scoped = readFinder({
      query: '20260923',
      doors: DOOR_ROWS,
      acts: ACTS,
      recent: [],
      result: search(only, '20260923'),
      people: [],
      boatTables: new Set(),
      customerTableId: CUSTOMER_TABLE_ID,
      scope: {
        word: 'The desk',
        title: 'On the desk',
        rows: [
          {
            id: 'quote:q1',
            name: '20260923-01',
            fact: 'SP560 · A Name',
            verb: 'Open the build',
            target: { at: 'quote', id: 'q1', issued: false },
          },
        ],
      },
    })
    expect(scoped.options.filter((r) => r.id === 'quote:q1')).toHaveLength(1)
    expect(scoped.groups.map((g) => g.id)).not.toContain('quotes')
    expect(scoped.groups[0]?.title).toBe('On the desk')
  })
})

describe('a boat is something to sell (critique of Milestone 2’s close, #8)', () => {
  /* THE SHAPES, on a stub of what the shell hands in: which lines are
     one boat is the picker's question and `src/screens/shell/lines.test.ts`
     asks it of the real fleet; here the grammar over its answer. */
  const facts = (id: string, name: string) => ({
    id,
    name,
    kind: 'boat' as const,
    accent: 'blue' as const,
    retired: false,
    rowCount: 3,
    fieldCount: 5,
  })
  const table = facts('tb', 'Maker Boats')
  const hit = (rowId: string, label: string, code?: string) => ({
    rowId,
    label,
    rank: 0 as const,
    at: -1,
    length: 0,
    ...(code ? { code: { text: code, at: 0, length: code.length } } : {}),
  })
  const model = { model: 'r1', modelName: 'Q100', maker: 'Maker Boats', versions: 2 }
  const lines = {
    boat: (_t: string, rowId: string) =>
      rowId === 'r3'
        ? null
        : {
            ...model,
            name: rowId === 'r1' ? 'Q100 (A)' : 'Q100 (B)',
            amount: rowId === 'r1' ? 100 : 200,
          },
    price: () => null,
    ink: () => 'blue' as const,
  }
  const answer = (hits: ReturnType<typeof hit>[], query = 'q100') =>
    readFinder({
      query,
      doors: [],
      acts: [],
      recent: [],
      result: {
        modules: [],
        tables: [],
        groups: [{ table, hits, more: 0, total: hits.length }],
        quotes: [],
        columns: [],
        columnTotal: 0,
        rowTotal: hits.length,
        rowShown: hits.length,
      },
      people: [],
      boatTables: new Set(['tb']),
      customerTableId: CUSTOMER_TABLE_ID,
      lines,
    })

  it('collapses the versions of one model into one line, onto the picker', () => {
    const boats = answer([hit('r1', 'Maker - Q100 (A)'), hit('r2', 'Maker - Q100 (B)')]).groups[0]!
    expect(boats.rows).toHaveLength(1)
    expect(boats.rows[0]).toMatchObject({
      name: 'Q100',
      fact: 'Maker Boats · 2 versions',
      figure: '$100 – $200',
      verb: 'Choose the version',
      target: { at: 'model', model: 'r1' },
    })
    expect(boats.ink).toBe('blue')
  })

  it('answers one version as a quote to start, and its line on the sheet below it', () => {
    const boats = answer([hit('r1', 'Maker - Q100 (A)', 'MB1')], 'mb1').groups[0]!
    expect(boats.rows.map((r) => [r.verb, r.target.at])).toEqual([
      ['Start a quote', 'start'],
      ['Open it on the sheet', 'row'],
    ])
    expect(boats.rows[0]).toMatchObject({
      name: 'Q100 (A)',
      fact: 'Maker Boats · one of 2 versions',
      figure: '$100',
      code: { text: 'MB1', at: 0, length: 3 },
    })
    expect(boats.rows[1]!.name).toBe('Maker - Q100 (A)')
  })

  it('says a line the picker does not offer is no longer sold, and sends it to the sheet', () => {
    const boats = answer([hit('r3', 'Maker - Q100 (Old)')]).groups[0]!
    expect(boats.rows[0]).toMatchObject({ fact: 'no longer sold', verb: 'Open it on the sheet' })
  })
})
