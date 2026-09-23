/* ============================================================
   THE BOOK — every reading the customers screen makes, as arithmetic.

   `customers.ts` reads ONE person out of the register and matches a
   query against the list; `diary/history.ts` answers "what else have
   we quoted them" for one row id. What neither carries is the shape
   of the SCREEN that shows a book of people: the row a name list
   draws, the order a dealer may press it into, the grouping by what
   they are doing next, the pile of names typed on quotes with nobody
   filed behind them, and the columns the register is made with on the
   day the first person is filed. Those are here, pure, so the screen
   draws what this file hands back and invents no figure of its own.

   FOUR RULES THIS FILE KEEPS, each argued where it is kept:

     · THE REST ORDER IS THE REGISTER'S. `readCustomers` says a list
       that silently alphabetises disagrees with the table it came
       from; `orderBook` re-sorts only when handed the order a person
       pressed, and hands the list back untouched otherwise.
     · A GROUP IS THE STANDING OF THE LATEST QUOTE, and a person with
       no quote is a group of their own rather than a blank. Nothing
       here says "won", "lost" or "sale" — `history.ts` has no such
       word and this file does not invent one.
     · A NAME TYPED ON A QUOTE IS NOT A PERSON IN THE BOOK. `unfiledNames`
       lists each such quote as its own line, never folding two quotes
       that carry the same typed name: `customerLink.test.ts` › "two
       people with the same name are two people".
     · THE REGISTER IS MADE WITH THE COLUMNS `customers.ts` DECLARES,
       and a Name column with an ordinary minted id — the label column
       is the app's own election, not a private constant of this
       feature, which is what `customerLink.test.ts` builds too.
   ============================================================ */

import type { EntityDef, FieldDef, QuoteDef, RowData } from '@/domain/model'
import { newId } from '@/domain/id'
import type { CreateTableArgs } from '@/domain/catalogue/commands'
import type { RegisterStateId } from '@/domain/quote/register'
import { localDay } from '@/domain/quote/day'
import {
  customerHistory,
  standingOf,
  type CustomerHistoryRead,
  type HistoryIndex,
  type Standing,
} from '@/domain/quote/diary/history'
import {
  CUSTOMER_ADDRESS_FIELD,
  CUSTOMER_COLUMNS,
  CUSTOMER_EMAIL_FIELD,
  CUSTOMER_NOTE_FIELD,
  CUSTOMER_PHONE_FIELD,
  CUSTOMER_TABLE_ID,
  customerFormFields,
  readCustomers,
} from './customers'

/* ---------------------------------------------------------- */
/* Making the register                                        */
/* ---------------------------------------------------------- */

/** What the book is called on the sheet, and what its description
 *  says. Both are the dealer's to rename afterwards. */
export const REGISTER_NAME = 'Customers'
export const REGISTER_SAYS = 'The people and businesses you sell to.'

/** The arguments `createTable` is handed the day the first customer
 *  is filed: the well-known id, a plain `Name` with a minted id, then
 *  the four columns `customers.ts` declares with their own sentences.
 *  Minted per call so two registers made in two tests never share a
 *  name column id. */
export function registerShape(): CreateTableArgs {
  const fields: FieldDef[] = [
    { id: newId(), name: 'Name', type: 'text', required: true },
    ...CUSTOMER_COLUMNS.map((c): FieldDef => ({
      id: c.id,
      name: c.name,
      type: 'text',
      description: c.description,
    })),
  ]
  return {
    tableId: CUSTOMER_TABLE_ID,
    name: REGISTER_NAME,
    kind: 'custom',
    description: REGISTER_SAYS,
    fields,
  }
}

/** The columns a person types into, whether or not the register
 *  exists yet: the register's own where there is one, and the shape
 *  it will be made with where there is not — so the form is one form
 *  on both days. The label column comes first either way, because a
 *  form asks who somebody is before how to reach them; `nameId` names
 *  it, and is the Name column of the shape the book will be made with
 *  on the day there is no register. */
export function fieldsToFile(register: EntityDef | undefined, nameId: string): FieldDef[] {
  const fields = register
    ? customerFormFields(register)
    : (registerShape().fields ?? []).map((f, i) => (i === 0 ? { ...f, id: nameId } : f))
  const name = fields.find((f) => f.id === nameId)
  return name ? [name, ...fields.filter((f) => f.id !== nameId)] : fields
}

/* ---------------------------------------------------------- */
/* The letter                                                 */
/* ---------------------------------------------------------- */

/** The register's columns, told apart by the job each does on the
 *  letter. A dealer may delete any of the four well-known ones, so
 *  each is optional; whatever else they added is `others`, drawn as
 *  label and value in the table's own order. */
export interface LetterShape {
  name: FieldDef | undefined
  phone: FieldDef | undefined
  email: FieldDef | undefined
  address: FieldDef | undefined
  note: FieldDef | undefined
  others: FieldDef[]
}

export function letterShape(register: EntityDef): LetterShape {
  const fields = customerFormFields(register)
  const nameId = register.displayFieldId ?? fields[0]?.id
  const find = (id: string): FieldDef | undefined => fields.find((f) => f.id === id)
  const known = new Set([
    nameId,
    CUSTOMER_PHONE_FIELD,
    CUSTOMER_EMAIL_FIELD,
    CUSTOMER_ADDRESS_FIELD,
    CUSTOMER_NOTE_FIELD,
  ])
  return {
    name: nameId === undefined ? undefined : find(nameId),
    phone: find(CUSTOMER_PHONE_FIELD),
    email: find(CUSTOMER_EMAIL_FIELD),
    address: find(CUSTOMER_ADDRESS_FIELD),
    note: find(CUSTOMER_NOTE_FIELD),
    others: fields.filter((f) => !known.has(f.id)),
  }
}

/** THE FROZEN-DETAIL SENTENCE, in the dealer's words. Stripe writes it
 *  as "until an invoice is finalized"; here a quote is frozen the
 *  moment it is written, and a change to the book reaches only the
 *  next one. */
export const CHANGE_REACHES_NEXT_QUOTE =
  'A change here is used on the next quote. Quotes already written keep what they were given.'

/* ---------------------------------------------------------- */
/* A row of the book                                          */
/* ---------------------------------------------------------- */

export interface BookRow {
  rowId: string
  /** '' is a real state: a row exists and nobody has named it yet */
  name: string
  /** the first printable contact line, or '' */
  contact: string
  /** how many quotes are addressed to this row */
  quotes: number
  /** the newest quote addressed to this row, or null */
  latest: { id: string; reference: string; standing: Standing; day: string } | null
  /** ISO: the later of the row's own last edit and the newest quote
   *  to it being touched — "the last one touched" reads this */
  touched: string
}

const later = (a: string, b: string): string => (a > b ? a : b)

/**
 * The whole book, one row per person, in the register's own order.
 *
 * Every figure is a length or a stamp read off a document: the count
 * is `customerHistory`'s `all.length`, the standing is `standingOf`,
 * the day is the newest quote's own. Nothing is estimated.
 */
export function readBook(
  register: EntityDef,
  rows: readonly RowData[],
  quotes: readonly QuoteDef[],
  index: HistoryIndex,
): BookRow[] {
  const people = readCustomers(register, rows)
  const stamps = new Map(rows.map((r) => [r.id, r.updatedAt || r.createdAt]))
  return people.map((p) => {
    const history = customerHistory(p.rowId, quotes, index)
    const newest = history.all[0]
    const own = stamps.get(p.rowId) ?? ''
    return {
      rowId: p.rowId,
      name: p.name,
      contact: p.contact[0] ?? '',
      quotes: history.all.length,
      latest: newest
        ? {
            id: newest.id,
            reference: newest.reference,
            standing: standingOf(index, newest.id),
            day: localDay(newest.issuedAt ?? newest.createdAt),
          }
        : null,
      touched: newest ? later(own, newest.updatedAt || newest.createdAt) : own,
    }
  })
}

/** The person the screen opens on when the address names nobody: the
 *  one touched most recently, and on a tie the later in the register.
 *  Undefined for an empty book. */
export function lastTouched(book: readonly BookRow[]): string | undefined {
  let best: BookRow | undefined
  for (const row of book) {
    if (!best || row.touched >= best.touched) best = row
  }
  return best?.rowId
}

/* ---------------------------------------------------------- */
/* Order and grouping — controls a person presses             */
/* ---------------------------------------------------------- */

/** `register` is the rest state and the only one the list is ever in
 *  without somebody pressing for the other. */
export type BookOrder = 'register' | 'name'

export const BOOK_ORDERS: readonly BookOrder[] = ['register', 'name']

/** The alphabet, AS A PRESSED CONTROL. `readCustomers` refuses to
 *  alphabetise on its own and this honours that: the list comes back
 *  untouched unless the order handed in is the one a person chose.
 *  An unnamed row sorts last rather than first, so it never heads the
 *  list. */
export function orderBook(rows: readonly BookRow[], order: BookOrder): BookRow[] {
  if (order === 'register') return [...rows]
  return [...rows].sort((a, b) => {
    if (a.name === '' && b.name !== '') return 1
    if (b.name === '' && a.name !== '') return -1
    return a.name.localeCompare(b.name, 'en-AU')
  })
}

export type BookGrouping = 'none' | 'desk'

export const BOOK_GROUPINGS: readonly BookGrouping[] = ['none', 'desk']

/** The four things a person in the book can be doing next, by the
 *  standing of the newest quote to them. The order is what a dealer
 *  does next: the drafts first. */
export type DeskKey = Standing | 'none'

export const DESK_ORDER: readonly DeskKey[] = ['draft', 'given', 'replaced', 'none']

/** In the dealer's words. No "won", no "lost": nothing in this app
 *  records that anybody bought anything. */
export const DESK_TITLE: Record<DeskKey, string> = {
  draft: 'On a draft',
  given: 'Quoted, waiting',
  replaced: 'Replaced',
  none: 'Not yet quoted',
}

export interface BookGroup {
  key: DeskKey | 'all'
  /** '' for the one ungrouped list, which draws no head */
  title: string
  rows: BookRow[]
}

/** The list cut into what each person is doing next, or left whole.
 *  Rows keep the order they were handed in inside each group, so the
 *  alphabet and the register order both survive the cut. Empty groups
 *  are left out: a head over nothing is a row spent on air. */
export function groupBook(rows: readonly BookRow[], grouping: BookGrouping): BookGroup[] {
  if (grouping === 'none') return [{ key: 'all', title: '', rows: [...rows] }]
  const by = new Map<DeskKey, BookRow[]>()
  for (const row of rows) {
    const key: DeskKey = row.latest ? row.latest.standing : 'none'
    const held = by.get(key)
    if (held) held.push(row)
    else by.set(key, [row])
  }
  return DESK_ORDER.filter((key) => by.has(key)).map((key) => ({
    key,
    title: DESK_TITLE[key],
    rows: by.get(key) ?? [],
  }))
}

/* ---------------------------------------------------------- */
/* Names typed on quotes, with nobody filed behind them        */
/* ---------------------------------------------------------- */

export interface UnfiledName {
  quoteId: string
  reference: string
  /** the name as the document carries it */
  name: string
  /** the printable lines the document carries, in printing order */
  contact: string[]
  standing: Standing
  day: string
  /** a draft can still be addressed to the row that filing makes; an
   *  issued quote keeps what it was given and cannot */
  addressable: boolean
}

/**
 * Every quote addressed to a typed name with no row behind it, newest
 * first — the pile `history.ts` calls `NO_CUSTOMER`, laid out one line
 * per quote so it can be filed from.
 *
 * ONE LINE PER QUOTE, NEVER PER NAME. Two quotes that both say "Dave"
 * may be two people, and nothing in this app ever knew otherwise; a
 * pile that folded them would be claiming they are one.
 */
export function unfiledNames(_quotes: readonly QuoteDef[], index: HistoryIndex): UnfiledName[] {
  return index.order
    .filter((q) => q.customerRef === undefined && q.customer.name.trim() !== '')
    .map((q) => ({
      quoteId: q.id,
      reference: q.reference,
      name: q.customer.name.trim(),
      contact: [...(q.customer.contact ?? [])],
      standing: standingOf(index, q.id),
      day: localDay(q.issuedAt ?? q.createdAt),
      addressable: q.state === 'draft',
    }))
}

/* ---------------------------------------------------------- */
/* One person's quotes, by lineage                            */
/* ---------------------------------------------------------- */

export interface Lineage {
  /** the oldest quote in the conversation, which names it */
  rootId: string
  /** this person's quotes in it, newest first */
  quotes: QuoteDef[]
}

/** The quotes addressed to one row, cut into the conversations they
 *  belong to (`versionsOf`'s lineages), newest conversation first and
 *  newest version first inside each. A quote nobody versioned is a
 *  lineage of one. Only THIS person's quotes are listed under a
 *  lineage: a version re-addressed to somebody else is theirs. */
export function lineagesOf(history: CustomerHistoryRead, index: HistoryIndex): Lineage[] {
  const out: Lineage[] = []
  const at = new Map<string, Lineage>()
  for (const q of history.all) {
    const rootId = index.rootOf.get(q.id) ?? q.id
    const held = at.get(rootId)
    if (held) {
      held.quotes.push(q)
      continue
    }
    const made: Lineage = { rootId, quotes: [q] }
    at.set(rootId, made)
    out.push(made)
  }
  return out
}

/** Where a quote of each standing opens — the register's own three
 *  words, which the route reads to choose between the build and the
 *  paper. */
export const openAs = (standing: Standing): RegisterStateId =>
  standing === 'draft' ? 'draft' : standing === 'given' ? 'issued' : 'superseded'

/** The day a quote is dated by on a letter: the act that froze it
 *  where there was one, the day it was started otherwise. */
export const quoteDay = (q: QuoteDef): string => localDay(q.issuedAt ?? q.createdAt)

/* ---------------------------------------------------------- */
/* The cells a filing writes                                  */
/* ---------------------------------------------------------- */

/**
 * The cells `addRow` is handed for one person: the name under the
 * register's label column, and each contact line under the printed
 * column in the same position — `fileCustomer`'s own positional rule,
 * kept here so a filing that goes through `batch` (the day the book is
 * made) and one that goes through `fileCustomer` write the same row.
 * `book.test.ts` holds the two to each other. Blank lines are not
 * written: a cell nobody filled is a cell that is not there.
 */
export function cellsFor(
  nameFieldId: string,
  name: string,
  contact: readonly string[] = [],
  note = '',
): Record<string, string> {
  const cells: Record<string, string> = { [nameFieldId]: name.trim() }
  const printed = [CUSTOMER_PHONE_FIELD, CUSTOMER_EMAIL_FIELD, CUSTOMER_ADDRESS_FIELD]
  printed.forEach((fieldId, i) => {
    const line = contact[i]
    if (typeof line === 'string' && line.trim() !== '') cells[fieldId] = line.trim()
  })
  if (note.trim() !== '') cells[CUSTOMER_NOTE_FIELD] = note.trim()
  return cells
}

/* ---------------------------------------------------------- */
/* Two sentences the screen must not phrase twice             */
/* ---------------------------------------------------------- */

/** Said inline under the filing form when the exact rung of
 *  `matchCustomers` hits: the two acts stand beside it. */
export const alreadyFiled = (name: string): string => `A ${name} is already filed.`

/** The one figure a person's name list carries, in words. */
export const quotesSay = (n: number): string =>
  n === 0 ? 'no quotes' : n === 1 ? '1 quote' : `${n.toLocaleString('en-AU')} quotes`
