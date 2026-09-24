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

   THE RULES THIS FILE KEEPS, each argued where it is kept:

     · EVERYONE A QUOTE NAMES IS A CUSTOMER (2026-09-24, `readEveryone`).
       The book keeps a person; a name typed on a quote is already one,
       drawn on the same page with the same acts, and kept the first
       time the dealer gives the page something to keep.
     · THE REST ORDER IS THE LAST TOUCHED FIRST, and the alphabet is a
       control a person presses. `readCustomers` says a list that
       silently alphabetises disagrees with the table it came from, and
       `orderBook` never does.
     · A GROUP IS THE STANDING OF THE LATEST QUOTE, and a person with
       no quote is a group of their own rather than a blank. Nothing
       here says "won", "lost" or "sale" — `history.ts` has no such
       word and this file does not invent one.
     · A NAME TYPED ON A QUOTE IS NOT A ROW IN THE BOOK. `unfiledNames`
       lists each such quote as its own line, never folding two quotes
       that carry the same typed name: `customerLink.test.ts` › "two
       people with the same name are two people". `quotedPeople` draws
       quotes that carry one name as one person, and says so as a claim
       about the name; it links nothing.
     · BUT A TYPED NAME THAT IS EXACTLY ONE FILED PERSON'S NAME IS SAID
       AS THAT, and not as a name nobody is filed behind. The engine is
       right that a given quote keeps the name it was given and is never
       re-addressed; the screen was wrong to count that name as unfiled
       and the person as having no quotes, the moment after the dealer
       filed them off that very quote (critique-m2 #16). `readTypedNames`
       says the relation plainly — this quote was given to this name,
       before or after the person was filed — and never claims it is
       ADDRESSED to them, which only `customerRef` can say.
     · THE REGISTER IS MADE WITH THE COLUMNS `customers.ts` DECLARES,
       and a Name column with an ordinary minted id — the label column
       is the app's own election, not a private constant of this
       feature, which is what `customerLink.test.ts` builds too.
   ============================================================ */

import type { EntityDef, FieldDef, QuoteDef, RowData } from '@/domain/model'
import { isSystemFieldId } from '@/domain/model'
import { newId } from '@/domain/id'
import type { CreateTableArgs } from '@/domain/catalogue/commands'
import type { RegisterStateId } from '@/domain/quote/register'
import { localDay } from '@/domain/quote/day'
import { dayWritten } from '@/domain/quote/diary/days'
import { quoteTotals } from '@/domain/quote/totals'
import {
  customerHistory,
  indexQuotes,
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
  readCustomer,
  readCustomers,
  type CustomerRead,
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

/** What a person's page is drawn from: the book's columns and which
 *  one names a person. */
export type PageColumns = Pick<EntityDef, 'fields' | 'displayFieldId'>

/** The columns a person's page is drawn with: the book's own where
 *  there is a book, and on a desk with none yet the shape the book will
 *  be made with (`registerShape`), its Name column under `nameId` — so
 *  the page of a person who is only a name on a quote offers *Add phone*
 *  exactly where the first save will put it. */
export function pageColumns(
  register: EntityDef | undefined,
  made: CreateTableArgs,
  nameId: string,
): PageColumns {
  if (register) return register
  const fields = (made.fields ?? []).map((f, i) => (i === 0 ? { ...f, id: nameId } : f))
  return { fields, displayFieldId: nameId }
}

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

export function letterShape(register: PageColumns): LetterShape {
  const fields = register.fields.filter((f) => f.type !== 'formula' && !isSystemFieldId(f.id))
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
  'A change here reaches their drafts and their next quote. A quote already given keeps what it was given.'

/* ---------------------------------------------------------- */
/* A row of the book                                          */
/* ---------------------------------------------------------- */

export interface BookRow {
  /** the row's id for a person kept in the book; for a person who is
   *  so far only a name typed on quotes, `QUOTED` and the id of the
   *  oldest quote that carries the name (`quotedPeople`) */
  rowId: string
  /** true for a person kept in the book, false for a name on quotes */
  kept: boolean
  /** '' is a real state: a row exists and nobody has named it yet */
  name: string
  /** the first printable contact line, or '' */
  contact: string
  /** how many quotes are addressed to this row */
  quotes: number
  /** how many quotes carry exactly this person's name, typed, and are
   *  addressed to nobody — `readTypedNames`'s `byName` */
  byName: number
  /** the newest quote addressed to this row OR given to their name,
   *  or null; `byName` says which of the two it is */
  latest: {
    id: string
    reference: string
    standing: Standing
    day: string
    byName: boolean
  } | null
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
 *
 * A QUOTE GIVEN TO A PERSON'S EXACT NAME IS ON THEIR ROW, COUNTED APART.
 * `quotes` stays the count of documents ADDRESSED to the row, which is
 * the only thing `customerRef` can say; `byName` is the count of
 * documents that carry exactly their name typed and are addressed to
 * nobody. The standing and the day read the newer of the two, so a
 * person filed off a quote that was given is "Quoted, waiting" at the
 * desk and not "Not yet quoted" — the second would be the screen
 * contradicting the act the dealer has just made.
 */
export function readBook(
  register: EntityDef,
  rows: readonly RowData[],
  quotes: readonly QuoteDef[],
  index: HistoryIndex,
): BookRow[] {
  const people = readCustomers(register, rows)
  const stamps = new Map(rows.map((r) => [r.id, r.updatedAt || r.createdAt]))
  const named = byNameOf(readTypedNames(register, rows, index).byName)
  return people.map((p) => {
    const history = customerHistory(p.rowId, quotes, index)
    const theirs = (named.get(p.rowId) ?? []).map((one) => index.byId.get(one.quoteId)!)
    const newest = [...history.all, ...theirs].sort(newestFirst)[0]
    const own = stamps.get(p.rowId) ?? ''
    return {
      rowId: p.rowId,
      kept: true,
      name: p.name,
      contact: p.contact[0] ?? '',
      quotes: history.all.length,
      byName: theirs.length,
      latest: newest
        ? {
            id: newest.id,
            reference: newest.reference,
            standing: standingOf(index, newest.id),
            day: localDay(newest.issuedAt ?? newest.createdAt),
            byName: newest.customerRef?.rowId !== p.rowId,
          }
        : null,
      touched: newest ? later(own, newest.updatedAt || newest.createdAt) : own,
    }
  })
}

/** Newest first by the day it was started, then by id — `history.ts`'s own
 *  order, so a row's latest and the diary's never disagree on a tie. */
const newestFirst = (a: QuoteDef, b: QuoteDef): number => {
  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1
  return a.id < b.id ? 1 : a.id > b.id ? -1 : 0
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

/** `recent` is the rest state and the only one the list is ever in
 *  without somebody pressing for the other.
 *
 *  IT WAS `register`, the order people were filed in (2026-09-24). Once
 *  everyone a quote names is a customer (`readEveryone`), most of the
 *  people on the screen were never filed at all, so "the order they
 *  were filed" is an order they are not in — and the person a dealer
 *  has just quoted belongs at the top, not under everyone filed before
 *  them. The rest order is now the one a desk works in: whoever was
 *  touched last, first. */
export type BookOrder = 'recent' | 'name'

export const BOOK_ORDERS: readonly BookOrder[] = ['recent', 'name']

/** Latest first at rest, and the alphabet AS A PRESSED CONTROL.
 *  `readCustomers` refuses to alphabetise on its own and this honours
 *  that. `recent` is `touched`, newest first, and on a tie the order
 *  the list was handed in (the sort is stable). An unnamed row sorts
 *  last in the alphabet rather than first, so it never heads the list. */
export function orderBook(rows: readonly BookRow[], order: BookOrder): BookRow[] {
  if (order === 'recent') {
    return [...rows].sort((a, b) => (a.touched === b.touched ? 0 : a.touched < b.touched ? 1 : -1))
  }
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
  /** how many people in the book carry exactly this name — 0 on every
   *  line of the pile but one: two or more namesakes, where the name
   *  cannot be read as any one of theirs (`readTypedNames`) */
  namesakes: number
}

/**
 * Every quote addressed to a typed name with no row behind it, newest
 * first — the pile `history.ts` calls `NO_CUSTOMER`, laid out one line
 * per quote so it can be filed from.
 *
 * ONE LINE PER QUOTE, NEVER PER NAME. Two quotes that both say "Dave"
 * may be two people, and nothing in this app ever knew otherwise; a
 * pile that folded them would be claiming they are one.
 *
 * This is every such quote, whoever is in the book. The screen draws
 * `readTypedNames`, which takes out the ones whose name IS somebody's.
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
      namesakes: 0,
    }))
}

/**
 * A quote that carries, typed, exactly the name of ONE person in the
 * book, and is addressed to nobody. Not a claim that it is theirs — a
 * claim about a name, which is all either document can make.
 */
export interface ByName {
  quoteId: string
  reference: string
  /** the name as the document carries it */
  name: string
  standing: Standing
  day: string
  /** the one person in the book whose name this is */
  rowId: string
  /** the quote was started before that person was filed — the case the
   *  pile makes, where a dealer files the name off the quote it is on */
  before: boolean
  /** a draft can still be addressed to them; a given quote keeps the
   *  name it was given, and the engine refuses to re-address it */
  addressable: boolean
}

export interface TypedNames {
  /** the pile: names nobody in the book carries, or more than one does */
  unfiled: UnfiledName[]
  /** names exactly one person in the book carries, newest first */
  byName: ByName[]
}

/**
 * THE TYPED NAMES, SPLIT BY WHETHER THE BOOK HAS THEM.
 *
 * "EXACTLY" IS THE APP'S ONE RULE FOR THE SAME NAME — `exactCustomer`'s,
 * the one that says "A Sarah Jones is already filed" under the form:
 * trimmed, and the same letters in any case. No initials are expanded,
 * no spelling is forgiven, and nothing here guesses.
 *
 * ONE NAMESAKE, AND THE QUOTE IS SAID ON THEIR PAGE. Two or more, and it
 * stays on the pile, carrying the count: "two people with the same
 * name are two people" (`customerLink.test.ts`), so a name two rows
 * share is read as neither's. None, and it is the pile it always was.
 *
 * Every line is still one quote. Nothing is folded, nothing is
 * addressed, and no document is touched: this is a reading.
 */
export function readTypedNames(
  register: EntityDef | undefined,
  rows: readonly RowData[],
  index: HistoryIndex,
): TypedNames {
  const people = register ? readCustomers(register, rows) : []
  const filedAt = new Map(rows.map((r) => [r.id, r.createdAt]))
  const holders = new Map<string, string[]>()
  for (const p of people) {
    const key = sameName(p.name)
    if (key === '') continue
    holders.set(key, [...(holders.get(key) ?? []), p.rowId])
  }
  const unfiled: UnfiledName[] = []
  const byName: ByName[] = []
  for (const one of unfiledNames([], index)) {
    const held = holders.get(sameName(one.name)) ?? []
    if (held.length !== 1) {
      unfiled.push({ ...one, namesakes: held.length })
      continue
    }
    const rowId = held[0]!
    const q = index.byId.get(one.quoteId)!
    byName.push({
      quoteId: one.quoteId,
      reference: one.reference,
      name: one.name,
      standing: one.standing,
      day: one.day,
      rowId,
      /* THE QUOTE'S OWN ACT AGAINST THE FILING: the day it was given
         where it was, the day it was started where it is a draft. AT THE
         SAME INSTANT IT IS "BEFORE" — measured 2026-09-23 under the
         rulers' fixed clock, where every stamp in a walk is one instant:
         a filing off the pile presupposes the quote it was filed from,
         and no name can be typed after a filing in the same instant. */
      before: (q.issuedAt ?? q.createdAt) <= (filedAt.get(rowId) ?? ''),
      addressable: one.addressable,
    })
  }
  return { unfiled, byName }
}

/** `exactCustomer`'s comparison, as a key. */
const sameName = (name: string): string => name.trim().toLowerCase()

/** The by-name lines, by the person whose name they carry. */
export function byNameOf(lines: readonly ByName[]): Map<string, ByName[]> {
  const by = new Map<string, ByName[]>()
  for (const one of lines) by.set(one.rowId, [...(by.get(one.rowId) ?? []), one])
  return by
}

/* ---------------------------------------------------------- */
/* Everyone a quote names, and everyone kept                   */
/* ---------------------------------------------------------- */

/**
 * THE PERSON THE DEALER HAS JUST QUOTED IS A CUSTOMER (2026-09-24).
 *
 * The M2-close critique's finding 7: give a quote to M. Duffy, press
 * Customers, and the screen said "Nobody is filed yet", then explained
 * in three headed paragraphs that a name typed on a quote is not a
 * customer until a second act files it into the book. The engine's
 * distinction is real — a name typed on a quote is that quote's own
 * copy, and only a row in the book is kept for the next one — but it is
 * the engine's, and not the dealer's. So everyone a quote names is a
 * customer on this screen from the moment the name is typed, and the
 * book keeps a person the first time the dealer gives their page
 * something to keep (a phone, an address, a note). No second act.
 *
 * ONE PERSON PER NAME, AND THE CLAIM IS ABOUT THE NAME. Quotes that
 * carry exactly the same typed name (`exactCustomer`'s rule: trimmed,
 * in any case, nothing looser) are drawn as one person with every one of
 * those quotes on their page — the claim `readTypedNames` already makes
 * on a kept person's page, made before anybody is kept. Nothing is
 * addressed and no document is touched by it: this is a reading. Where
 * two or more people in the book already carry the name, the rule of
 * `customerLink.test.ts` stands — the quote is none of theirs — and it
 * is drawn as a person of its own, by its one quote.
 */
export const QUOTED = 'quoted-'

/** True for the key of a person who is so far only a name on quotes. */
export const isQuoted = (key: string): boolean => key.startsWith(QUOTED)

export interface QuotedPerson {
  /** `QUOTED` and the id of the OLDEST quote carrying the name, so the
   *  key a page is open on does not move when a newer quote names them */
  key: string
  /** the name as the newest of their quotes carries it */
  name: string
  /** the lines the newest of their quotes prints, as typed */
  contact: string[]
  /** every quote carrying the name, newest first — the first is the
   *  one the page's details are read from */
  lines: UnfiledName[]
  /** people in the book already called this: 0, or two and more */
  namesakes: number
}

/** The names on quotes, one person per name (see above), newest first
 *  by their newest quote — `unfiled` is handed in newest first. */
export function quotedPeople(unfiled: readonly UnfiledName[]): QuotedPerson[] {
  const out: QuotedPerson[] = []
  const at = new Map<string, QuotedPerson>()
  for (const one of unfiled) {
    const held = one.namesakes === 0 ? at.get(sameName(one.name)) : undefined
    if (held) {
      held.lines.push(one)
      held.key = QUOTED + one.quoteId
      continue
    }
    const made: QuotedPerson = {
      key: QUOTED + one.quoteId,
      name: one.name,
      contact: [...one.contact],
      lines: [one],
      namesakes: one.namesakes,
    }
    if (one.namesakes === 0) at.set(sameName(one.name), made)
    out.push(made)
  }
  return out
}

/** A name on quotes, read the way `readCustomer` reads a kept person, so
 *  the find field and the page treat the two alike. It has no note: a
 *  note is something the dealer adds, and adding one keeps them. */
export function readQuoted(p: QuotedPerson): CustomerRead {
  return { rowId: p.key, name: p.name, contact: [...p.contact], note: '' }
}

/** A name on quotes as a row of the list. Every quote carries their
 *  name and none is addressed to a row, so all of them count as
 *  `byName`; the standing and the day are the newest one's, and the
 *  person is touched when any of their quotes last was. */
export function quotedRow(p: QuotedPerson, index: HistoryIndex): BookRow {
  const newest = p.lines[0]
  let touched = ''
  for (const line of p.lines) {
    const q = index.byId.get(line.quoteId)
    if (q) touched = later(touched, q.updatedAt || q.createdAt)
  }
  return {
    rowId: p.key,
    kept: false,
    name: p.name,
    contact: p.contact[0] ?? '',
    quotes: 0,
    byName: p.lines.length,
    latest: newest
      ? {
          id: newest.quoteId,
          reference: newest.reference,
          standing: newest.standing,
          day: newest.day,
          byName: true,
        }
      : null,
    touched,
  }
}

export interface Everyone {
  /** everyone on the screen: the people kept in the book, in the book's
   *  order, then the names on quotes, newest first */
  rows: BookRow[]
  /** the same people read as `readCustomer` reads them, for finding */
  people: CustomerRead[]
  /** the names on quotes, with the quotes that carry each */
  quoted: QuotedPerson[]
  /** quotes carrying exactly one kept person's name, by that person */
  byName: Map<string, ByName[]>
}

/** EVERYONE THE SCREEN COUNTS AS A CUSTOMER: kept, or named on a quote. */
export function readEveryone(
  register: EntityDef | undefined,
  rows: readonly RowData[],
  quotes: readonly QuoteDef[],
  index: HistoryIndex,
): Everyone {
  const typed = readTypedNames(register, rows, index)
  const quoted = quotedPeople(typed.unfiled)
  return {
    rows: [
      ...(register ? readBook(register, rows, quotes, index) : []),
      ...quoted.map((p) => quotedRow(p, index)),
    ],
    people: [...(register ? readCustomers(register, rows) : []), ...quoted.map(readQuoted)],
    quoted,
    byName: byNameOf(typed.byName),
  }
}

/** HOW MANY CUSTOMERS THE SCREEN PRINTS, for a door that must print the
 *  figure the screen behind it prints ("THE DOOR COUNTS WHAT THE SCREEN
 *  BEHIND IT COUNTS", `src/domain/shell/doors.ts`). */
export function countCustomers(
  register: EntityDef | undefined,
  rows: readonly RowData[],
  quotes: readonly QuoteDef[],
): number {
  return readEveryone(register, rows, quotes, indexQuotes(quotes)).rows.length
}

/* ---------------------------------------------------------- */
/* One person's page                                           */
/* ---------------------------------------------------------- */

/** Everything one person's page draws, kept or a name on quotes, read
 *  once so the page holds no logic of its own. */
export interface PageRead {
  key: string
  kept: boolean
  /** '' is a real state for a kept row nobody has named */
  name: string
  /** the lines a quote to them prints, in printing order */
  block: string[]
  /** each column's text by column id, '' where there is none — what the
   *  page's *Add* and *Change* read, and what an editor opens on */
  values: Record<string, string>
  /** the day they became a customer, as a `YYYY-MM-DD`: the day of their
   *  first quote, or the day they were added, whichever came first */
  since: string
  /** the day a kept person's details last changed, when it is not the
   *  day they were kept; else '' */
  changed: string
  /** every quote on their page — addressed to them, or carrying their
   *  name — newest first */
  quotes: QuoteDef[]
  /** for a name on quotes: the newest quote that carries it, which the
   *  page's details are read from; null for a kept person */
  source: UnfiledName | null
  /** for a name on quotes: people in the book already called this */
  namesakes: number
  /** drafts on the page that print older details than the book keeps */
  behind: QuoteDef[]
  /** names their quotes carry other than the one they have now */
  addressedAs: string[]
}

const cellText = (v: unknown): string => {
  if (v === null || v === undefined) return ''
  if (typeof v === 'string') return v.trim()
  if (typeof v === 'number') return String(v)
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  return ''
}

/** ONE PERSON'S PAGE, by the key the address names — a kept person's row
 *  id, or a name on quotes (`QUOTED`). Null where the key names nobody. */
export function readPage(
  key: string,
  register: EntityDef | undefined,
  rows: readonly RowData[],
  quotes: readonly QuoteDef[],
  index: HistoryIndex,
  everyone: Everyone,
  nameId: string,
): PageRead | null {
  if (isQuoted(key)) {
    const p = everyone.quoted.find((q) => q.key === key)
    if (!p) return null
    return {
      key,
      kept: false,
      name: p.name,
      block: [...p.contact],
      values: cellsFromQuote(nameId, p.name, p.contact),
      since: firstDay(p.lines.map((l) => l.day)),
      changed: '',
      quotes: p.lines
        .map((l) => index.byId.get(l.quoteId))
        .filter((q): q is QuoteDef => q !== undefined),
      source: p.lines[0] ?? null,
      namesakes: p.namesakes,
      behind: [],
      addressedAs: [],
    }
  }
  if (!register) return null
  const row = rows.find((r) => r.id === key)
  if (!row) return null
  const person = readCustomer(register, row)
  const history = customerHistory(row.id, quotes, index)
  const theirs = (everyone.byName.get(row.id) ?? [])
    .map((l) => index.byId.get(l.quoteId))
    .filter((q): q is QuoteDef => q !== undefined)
  const values: Record<string, string> = {}
  for (const f of register.fields) values[f.id] = cellText(row.values[f.id])
  const on = [...history.all, ...theirs].sort(newestFirst)
  const kept = localDay(row.createdAt)
  const changed = localDay(row.updatedAt || row.createdAt)
  return {
    key,
    kept: true,
    name: person.name,
    block: person.contact,
    values,
    since: firstDay([kept, ...on.map(quoteDay)]),
    changed: changed === kept ? '' : changed,
    quotes: on,
    source: null,
    namesakes: 0,
    behind: draftsBehind(register, rows, row.id, index),
    addressedAs: history.addressedAs.filter((n) => n !== person.name),
  }
}

/* ---------------------------------------------------------- */
/* A typed line, under the column it belongs in                */
/* ---------------------------------------------------------- */

export interface PlacedLines {
  phone: string
  email: string
  address: string
}

const EMAIL_LINE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_LINE = /^\+?[\d\s().-]+$/
const digitsIn = (line: string): number => line.replace(/\D/g, '').length

/**
 * WHICH COLUMN A LINE TYPED ON A QUOTE BELONGS UNDER, read off its look.
 * The build asks for "one line of contact, as it should print" — a phone,
 * an email or an address — and the page of a person who is only a name on
 * that quote offers *Change phone* or *Add address* against it; placed by
 * position alone (`cellsFor`, `fileCustomer`'s rule) an email typed there
 * would be offered as their phone. An email is one word with an @ and a
 * dot after it; a phone is digits with the marks phones are written with,
 * six digits at least; anything else is an address, and a second line of
 * a kind already placed joins the address rather than being dropped.
 * Nothing is corrected and nothing is guessed beyond that.
 */
export function placeLines(contact: readonly string[]): PlacedLines {
  const placed: PlacedLines = { phone: '', email: '', address: '' }
  const rest: string[] = []
  for (const raw of contact) {
    const line = raw.trim()
    if (line === '') continue
    if (placed.email === '' && EMAIL_LINE.test(line)) placed.email = line
    else if (placed.phone === '' && PHONE_LINE.test(line) && digitsIn(line) >= 6)
      placed.phone = line
    else rest.push(line)
  }
  placed.address = rest.join(', ')
  return placed
}

/** The cells a person who is only a name on a quote is kept with: the
 *  name under the book's name column and each typed line under the
 *  column `placeLines` puts it in. Blank cells are not written. */
export function cellsFromQuote(
  nameFieldId: string,
  name: string,
  contact: readonly string[],
): Record<string, string> {
  const placed = placeLines(contact)
  const cells: Record<string, string> = { [nameFieldId]: name.trim() }
  if (placed.phone !== '') cells[CUSTOMER_PHONE_FIELD] = placed.phone
  if (placed.email !== '') cells[CUSTOMER_EMAIL_FIELD] = placed.email
  if (placed.address !== '') cells[CUSTOMER_ADDRESS_FIELD] = placed.address
  return cells
}

/* ---------------------------------------------------------- */
/* The drafts a change on a page reaches                       */
/* ---------------------------------------------------------- */

const sameLines = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && a.every((line, i) => line === b[i])

/**
 * THE DRAFTS ON A KEPT PERSON'S PAGE THAT DO NOT YET PRINT WHAT THE BOOK
 * KEEPS FOR THEM — addressed to their row with other details, or
 * carrying exactly their name and addressed to nobody — newest first, so
 * a change made on the page reaches them in the same step as the change.
 * A draft is still being written and is the dealer's to change; a GIVEN
 * quote is never here, because it keeps what it was given and the engine
 * refuses to re-address it.
 *
 * `also` names drafts the caller knows are theirs whatever name they
 * carry — the drafts on a name's page the moment that name is kept, or
 * the ones that carried a kept person's name just before it was changed —
 * so a new name does not leave them behind under the old one.
 */
export function draftsBehind(
  register: EntityDef,
  rows: readonly RowData[],
  rowId: string,
  index: HistoryIndex,
  also: readonly string[] = [],
): QuoteDef[] {
  const row = rows.find((r) => r.id === rowId)
  if (!row) return []
  const now = readCustomer(register, row)
  const named = new Set([
    ...(byNameOf(readTypedNames(register, rows, index).byName).get(rowId) ?? []).map(
      (l) => l.quoteId,
    ),
    ...also,
  ])
  return index.order.filter((q) => {
    if (q.state !== 'draft') return false
    if (q.customerRef?.rowId !== rowId && !named.has(q.id)) return false
    return !(
      q.customerRef?.rowId === rowId &&
      q.customer.name === now.name &&
      sameLines(q.customer.contact ?? [], now.contact)
    )
  })
}

/** The quotes cell of a row, in words. It said which were addressed
 *  and which carried the name "by name" ("3 quotes, 1 by name"): the
 *  engine's distinction, and not one a dealer makes about a person he
 *  quoted (M2-close critique #7). Every quote on a person's page is
 *  theirs, and the cell counts them. */
export function rowQuotesSay(addressed: number, byName: number): string {
  return quotesSay(addressed + byName)
}

/**
 * THE GIVEN FIGURE ON A LETTER, over every quote the page lists — the
 * ones addressed to the person and the ones given to their name. Each
 * total is `quoteTotals`' own and only a GIVEN quote is summed: a
 * draft is not an offer and a replaced one was taken back.
 */
export function givenOf(
  quotes: readonly QuoteDef[],
  index: HistoryIndex,
): { count: number; total: number } {
  let count = 0
  let total = 0
  for (const q of quotes) {
    if (standingOf(index, q.id) !== 'given') continue
    count += 1
    total += quoteTotals(q).total
  }
  return { count, total }
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

/** Said inline under the form when the exact rung of `matchCustomers`
 *  hits — a person kept in the book, or a name already on a quote: the
 *  two acts stand beside it. It said "is already filed", the book's
 *  verb, which a dealer never needed (M2-close critique #7). */
export const alreadyFiled = (name: string): string => `A ${name} is already a customer.`

/** How many customers, in words. */
export const customersSay = (n: number): string =>
  n === 1 ? '1 customer' : `${n.toLocaleString('en-AU')} customers`

/** How many of these people had their newest quote on this day — the
 *  head's "quoted today", counted off the list and never estimated. */
export const quotedOn = (rows: readonly BookRow[], day: string): number =>
  rows.filter((r) => r.latest !== null && r.latest.day === day).length

/** The earliest of some `YYYY-MM-DD` days, '' for none. */
export const firstDay = (days: readonly string[]): string =>
  days.filter((d) => d !== '').reduce((a, b) => (a === '' || b < a ? b : a), '')

/** When somebody became a customer, as the page's eyebrow says it. */
export function sinceSay(since: string, today: string): string {
  if (since === '') return 'A customer'
  return since === today ? 'A customer since today' : `A customer since ${daySaid(since, today)}`
}

/** Drafts on a page that print older details than it now keeps. */
export function behindSay(refs: readonly string[]): string {
  return refs.length === 1
    ? `${refs[0]} is a draft and still prints the details it was written with.`
    : `${refs.join(', ')} are drafts and still print the details they were written with.`
}

/** What adding a person by hand says. */
export const addedSay = (name: string): string => `${name.trim()} is added.`

/** What a change on a person's page says, in the dealer's words: the
 *  line as it now reads, or that it is gone. The name column says the
 *  new name; a change is never said as a column and a cell. */
export function changeSay(who: string, column: string, value: string, isName: boolean): string {
  const said = value.trim()
  if (isName) return who === '' ? `Now called ${said}.` : `${who} is now ${said}.`
  const whose = who === '' ? 'Their' : `${who}’s`
  const what = column.trim().toLowerCase() || 'detail'
  return said === '' ? `${whose} ${what} is taken off.` : `${whose} ${what} is ${said}.`
}

/** The drafts a change reached, said after it: a draft is still being
 *  written, so it prints the change at once. '' when none. */
export function reachSay(refs: readonly string[]): string {
  if (refs.length === 0) return ''
  if (refs.length === 1) return ` Their draft ${refs[0]} prints it too.`
  return ` Their drafts ${refs.join(', ')} print it too.`
}

/** Said after a new name, when quotes already given carry the old one:
 *  they keep it, and so they stand as that name's own customer — the
 *  sentence says why before the dealer sees it. '' when none. */
export function keepsNameSay(refs: readonly string[], name: string): string {
  if (refs.length === 0) return ''
  return refs.length === 1
    ? ` ${refs[0]} was given to “${name}” and keeps that name.`
    : ` ${refs.join(', ')} were given to “${name}” and keep that name.`
}

/** What bringing drafts up to date says. */
export function broughtUpSay(refs: readonly string[]): string {
  return refs.length === 1
    ? `${refs[0]} now prints their details as they are here.`
    : `${refs.join(', ')} now print their details as they are here.`
}

/** The one figure a person's name list carries, in words. */
export const quotesSay = (n: number): string =>
  n === 0 ? 'no quotes' : n === 1 ? '1 quote' : `${n.toLocaleString('en-AU')} quotes`

/* ---------------------------------------------------------- */
/* Days and headings, as the desk says them                   */
/* ---------------------------------------------------------- */

/** A `YYYY-MM-DD` day as the book says it: `today`, or the diary's own
 *  `Wednesday 16 September` (with the year only when it is another
 *  year's). The letter read `FILED 2026-09-24` and the pile
 *  `given · 2026-09-24` beside `Given · today` and "Issued 24 September
 *  2026" elsewhere — a database's date beside a person's (M2-close
 *  critique #19). A day it cannot read is printed as it came. */
export function daySaid(day: string, today: string): string {
  if (day === '') return ''
  if (day === today) return 'today'
  return dayWritten(day, today) || day
}
