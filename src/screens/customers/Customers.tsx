/* ============================================================
   FOUR LINT RULES TURNED OFF FOR THIS FILE. The first two are the
   register's own (`src/screens/quotes/Quotes.tsx`, verbatim in
   spirit); the second two are this screen's, and are argued here
   because a rule turned off without a reason is a rule nobody can
   turn back on.

   `jsx-a11y/prefer-tag-over-role` asks for `<table>` where the book
   is drawn. The density ruler reads `[role="row"]` off the page — a
   written attribute, which a `<tr>` does not carry — and a row here
   is a CSS grid at a desk and a two-line block in a hand, which
   drops a table element's implicit semantics the moment `display`
   changes. `jsx-a11y/click-events-have-key-events` asks each row for
   its own key handler; the book uses the APG's `aria-activedescendant`
   pattern, ONE tab stop that owns the vocabulary.

   `jsx-a11y/no-noninteractive-tabindex` and
   `jsx-a11y/no-noninteractive-element-interactions` are both about ONE
   element: the letter, which is an `<article>` carrying `tabIndex={0}`
   and a key handler. That is deliberate and it is the only shape WCAG
   2.2 SC 2.1.4 allows for a single-character shortcut — the third
   exemption is "active only when a component has focus", and a REGION
   that cannot take focus cannot scope a shortcut to itself. The
   alternative the rules would leave is a listener on the window, which
   is the failure the criterion is written against: `b` typed into a
   field somewhere else in the app must not open the book. The article
   carries an `aria-label` naming whose letter it is, so a reader that
   lands on it is told what it has landed on.
   ============================================================ */
/* eslint-disable jsx-a11y/prefer-tag-over-role, jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { Button, Input, PriceFigure, Swatches, Tile, closesStage, isField, stageKeyOf } from '@/ui'
import type { EntityDef, FieldDef, QuoteDef, RowData } from '@/domain/model'
import { displayFieldOf, makeCtx } from '@/domain/model'
import { newId } from '@/domain/id'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { useCatalogue, useQuotes } from '@/app/useStores'
import { catalogue as catalogueStore, ctxFrom } from '@/state/catalogue'
import { quotes as quotesStore } from '@/state/quotes'
import {
  addRow,
  batch,
  createTable,
  updateCell,
  type CatalogueCommand,
} from '@/domain/catalogue/commands'
import { linkCustomer } from '@/domain/quote/commands'
import { freezeCustomer } from '@/domain/quote/freeze'
import { localDay } from '@/domain/quote/day'
import { boatOfQuote } from '@/domain/quote/spoken'
import { readRegister, type RegisterRow, type RegisterStateId } from '@/domain/quote/register'
import {
  STANDING_TITLE,
  indexQuotes,
  standingOf,
  type HistoryIndex,
} from '@/domain/quote/diary/history'
import {
  CUSTOMER_TABLE_ID,
  customerRegister,
  exactCustomer,
  matchCustomers,
  type CustomerRead,
} from '@/domain/people/customers'
import { groupByDescription } from '@/domain/people/form'
import {
  CHANGE_REACHES_NEXT_QUOTE,
  addedSay,
  alreadyFiled,
  behindSay,
  broughtUpSay,
  cellsFromQuote,
  changeSay,
  customersSay,
  daySaid,
  draftsBehind,
  fieldsToFile,
  givenOf,
  groupBook,
  isQuoted,
  keepsNameSay,
  lastTouched,
  letterShape,
  openAs,
  orderBook,
  pageColumns,
  quoteDay,
  quotedOn,
  quotesSay,
  reachSay,
  readEveryone,
  readPage,
  registerShape,
  rowQuotesSay,
  sinceSay,
  type BookGroup,
  type BookGrouping,
  type BookOrder,
  type BookRow,
  type PageColumns,
  type PageRead,
} from '@/domain/people/book'
import { heldCopy, markOf } from './pictures'
import './customers.css'

/* ============================================================
   CUSTOMERS — direction C, "The letter", from
   docs/research/refs/customers/notes.md §5, ASSIGNED for this round
   (critique-m2.md §3) and provisional in docs/SCREENS.md until the
   owner looks.

   WHY THE ASSIGNMENT HOLDS. The critic counted five of the twenty
   Milestone 2 directions as one list-left, detail-right composition
   across four Cockpit screens, and customers A was one of them. C is
   the one board on this sweep whose resting state is not a list at
   all: the screen opens on ONE PERSON, as a page — the name as the
   heading, the address printed as the document prints it, the phone
   and the email on one line, the yard's note in a band that says it
   is never printed, and every quote addressed to them as a row led by
   the boat's own held picture — so the shape a dealer meets is a
   letter on a desk, and the book of everybody is a door off it. "Only
   C shows the dealer the typo before the customer does", the critic's
   own best sentence on this sweep, is what the page is for: the
   document prints these five lines as they are written here.

   ── WHAT THE SWEEP DECIDED, AND WHERE ─────────────────────────

   THE CARD AT REST is `deep/monica-card-1300.png`: initials are not
   drawn (a second dealership replaces the mark, not the people) but
   the rest is — an identity line, two labelled facts side by side,
   a short RECENTLY, one foot. The FROZEN-DETAIL SENTENCE is
   `deep/stripe-customer-page-3.png`'s "until an invoice is
   finalized", said under the fields in the dealer's words.

   THE ABSENT VALUE IS AN ACT, never a tile: `deep/govuk-summary-list.png`
   puts *Add* beside a missing contact where *Change* stands beside a
   present one, and that is exactly what a missing phone gets here.
   `deep/attio-record-tabs.png` printing "No values" fourteen times is
   the failure it avoids.

   THE POSSIBLE DUPLICATE UNDER THE FORM is
   `deep/linear-similar-issues-now-scrolled.png`: matching rows appear
   beneath the fields as a name is typed, each an act, and filing
   stays live. Pipedrive's rule (flag, never merge) and Apple's *Keep
   Both* as the default are why the exact hit says "A Sarah Jones is
   already filed" with *Open* and *File another* beside it and no
   modal anywhere.

   THE BOOK ITSELF is `crm/linear-manage-members.png`: one search, no
   column head, no pager. Its rows are the density ruler's rows.

   ── WHAT THE LOST DIRECTIONS LEND ─────────────────────────────

   A's alphabet is here as a CONTROL a dealer presses, never the rest
   state — the critic's §5: `readCustomers` refuses to alphabetise on
   its own. B's "a dealer who adds ABN sees it as a column the same
   minute" is here as the door to the sheet at /data/__customers, and
   as the letter drawing whatever columns the register has. D's "who
   is at the desk" is the book's grouping option, by the standing of
   each person's latest quote.

   ── WHAT IS TRUE ON THIS BUILD AND WOULD NOT BE ON A BOARD ────

   · EVERYONE A QUOTE NAMES IS A CUSTOMER, from the moment the name is
     typed on the build (2026-09-24, the M2-close critique's finding 7:
     "the person the dealer just quoted is Nobody"). The list and the
     page are `readEveryone`'s — the people the book keeps and the
     names on quotes, drawn alike, one person per name. There is no
     second act: a name on a quote is KEPT the first time the dealer
     gives their page something to keep — a phone, an address, a note —
     in the same press, with one Undo, and their drafts print it too.
   · THE BOOK DOES NOT EXIST UNTIL THE FIRST PERSON IS KEPT. The first
     keep makes it — `batch([createTable, addRow])`, one step, one Undo,
     which is the contract's "made once, undoable in one step, never
     made by anything except the act that names it" — and nothing on
     the screen says "table", "sheet", "row" or "filed" about it.
   · A GIVEN QUOTE KEEPS WHAT IT WAS GIVEN, because the engine refuses
     to re-address one (`customerLink.test.ts`); it stands on the
     person's page as theirs, by the name it carries.
   · THE PICTURE ON A QUOTE ROW IS THE BOAT'S HELD CATALOGUE COPY, not
     a miniature of the A4 cover: see `./pictures.ts` for the critic's
     finding and the answer. Where none is held, the maker's own mark
     stands in the well — the configurator's ladder, never a stand-in
     for the boat (2026-09-23).
   · NO PERSON IS INVENTED. The empty state is the true state and it
     says, in one sentence, where customers come from.
   ============================================================ */

/** WHERE CUSTOMERS COME FROM, in one sentence — the empty state's whole
 *  lesson. It replaced three headed paragraphs that taught a second act
 *  ("File it here and it is kept for their next quote") the dealer no
 *  longer has to make (M2-close critique #7). */
export const WHERE_CUSTOMERS_COME_FROM =
  'Type who a quote is for on the build, and they are here the moment you do — with their boat and every quote to them.'

/** Said where a keep would happen, on a desk with no price file. The
 *  customers are kept with the file, so nothing can be saved without
 *  one. It said "The book is a table on that sheet" — the store's
 *  anatomy, to a dealer (M2-close critique #4). */
export const NO_SHEET_FOR_A_BOOK =
  'The Master Price File is not loaded in this browser, and customers are kept with it, so nothing here can be saved until it is loaded.'

export const NAME_NEEDED = 'A customer needs a name before they can be added.'

export const NOBODY_AT_THIS_ADDRESS =
  'No customer is at this address. They may have been taken out, or the link came from another computer.'

/** Said where the press happened, when nothing handed this screen a
 *  way to a document. RULE (c), 2026-09-23: it named two router
 *  patterns to a dealer; it now says what would have happened, in his
 *  words, and no address at all. */
export const NO_WAY_TO_OPEN =
  'This screen was handed no way to open a quote, so nothing was opened. A draft opens where it is written; a given quote opens as the paper the customer was handed.'

export const NO_WAY_TO_THE_PICKER =
  'This screen was handed no way to start a quote, so nothing was started. A quote starts by picking the boat.'

/** The address the kept customers have on Data, which is B's best idea
 *  kept: a column a dealer adds there is on every page the same minute. */
export const BOOK_AS_A_SHEET = `/data/${CUSTOMER_TABLE_ID}`

/** What the find field answers, quoted back — the register's own
 *  grammar for an empty find, in this screen's words. */
export const nothingInTheBook = (query: string): string =>
  `No customer matches “${query.trim()}”. Customers are found by name, phone, email, address or the yard’s note.`

/* ---------------------------------------------------------- */
/* The address                                                 */
/* ---------------------------------------------------------- */

/** A position inside this screen, as the URL carries it. */
export interface CustomersPosition {
  /** the row the letter is open on, or the cursor in the book */
  who?: string
  /** what was typed into the find field */
  find?: string
  /** 'all' while the whole book is open instead of a letter */
  book?: 'all'
  /** the order a person pressed the book into; absent is the register's */
  order?: BookOrder
  /** 'desk' while the book is cut by what each person is doing next */
  group?: BookGrouping
  /** '1' while the filing form is open */
  file?: '1'
}

export interface CustomersProps {
  business?: string | null
  who?: string
  find?: string
  book?: boolean
  order?: BookOrder
  group?: BookGrouping
  file?: boolean
  onPosition?: (position: CustomersPosition) => void
  /** ACCEPTED AND NOT DRAWN, since 2026-09-23 — rule (a): the pill
   *  carries Home on every screen, so this screen's own head no longer
   *  repeats it (critique-m2 #13). The route still hands it in; the
   *  prop goes when the route is next touched. */
  goHome?: () => void
  openTheFile?: () => void
  newQuote?: () => void
  /** one document, opened where it belongs: a draft where it is
   *  written, a given quote as the paper */
  openQuote?: (id: string, state: RegisterStateId) => void
  /** the clock, injected */
  now?: () => Date
}

/** The last thing that happened, and the way back from it. A change on
 *  a person's page is one write on the sheet — the cell, or on the day a
 *  name on a quote is first kept, the row (and the book with it) — and
 *  one write per draft of theirs that must print it, so the step keeps
 *  every event id and reverses them all, the drafts first. `from` is the
 *  key the page was open on before the first keep, so Undo lands the
 *  dealer back on the same person rather than on a row that has gone. */
interface Step {
  said: string
  sheet: { eventId: string } | null
  quotes: { id: string; eventId: string }[]
  wasUndo: boolean
  /** the page's key before the step, and after it */
  from?: string
  to?: string
}

type Mode = 'reading' | 'bare' | 'empty' | 'book' | 'letter'

const THE_CLOCK = (): Date => new Date()

/** en-AU grouping, once. */
const au = (n: number): string => n.toLocaleString('en-AU')

export function Customers({
  business = null,
  who: arrivedAt = '',
  find: askedFor = '',
  book: arrivedOnBook = false,
  order: arrivedOrder = 'recent',
  group: arrivedGroup = 'none',
  file: arrivedFiling = false,
  onPosition,
  openTheFile,
  newQuote,
  openQuote,
  now = THE_CLOCK,
}: CustomersProps) {
  const status = useCatalogue((s) => s.status)
  const sheetProblem = useCatalogue((s) => s.problem)
  const tables = useCatalogue((s) => s.tables)
  const rows = useCatalogue((s) => s.rows)
  const orgId = useCatalogue((s) => s.orgId)
  const filed = useQuotes((s) => s.quotes)
  const quotesRead = useQuotes((s) => s.loaded)
  const quotesProblem = useQuotes((s) => s.problem)

  /* THE TWO STORES HAVE BOTH ANSWERED. The main element is on the page
     before either read lands, and a ruler that measured then would
     measure a sentence about reading. */
  const sheetAnswered = status === 'ready' || status === 'failed'
  const read = quotesRead && sheetAnswered
  const sheetOpen = status === 'ready' && orgId !== null

  const register = customerRegister(tables as Record<string, EntityDef>)
  /* MEMOISED BECAUSE IT IS THE INPUT TO TWO MORE READINGS. `rows[id]`
     is the store's own array and does not change between renders, but
     the `?? []` on a browser with no book mints a new one every time,
     which would re-read the whole book on every keystroke. */
  const bookRows: readonly RowData[] = useMemo(
    () => (register ? (rows[register.id] ?? []) : []),
    [register, rows],
  )
  const index = useMemo(() => indexQuotes(filed), [filed])
  /* EVERYONE A QUOTE NAMES IS A CUSTOMER (M2-close critique #7). The
     screen said "Nobody is filed yet" beside the person the dealer had
     just quoted, and taught a second act — filing — that made them one.
     Now the list is everyone kept in the book AND everyone a quote names
     (`readEveryone`), drawn alike; a name on a quote is kept the first
     time the dealer gives their page something to keep. `book` is the
     rows the screen draws and `people` the same people for finding. */
  const everyone = useMemo(
    () => readEveryone(register, bookRows, filed, index),
    [register, bookRows, filed, index],
  )
  const book = everyone.rows
  const people = everyone.people
  /* THE MAKER OF THE BOAT A QUOTE IS FOR, by the name of the register its
     hull is a row of — what the mark rung of `BoatArt` reads */
  const makerOf = useCallback(
    (q: QuoteDef): string | undefined => (tables as Record<string, EntityDef>)[q.rootTableId]?.name,
    [tables],
  )
  /* the register's own reading of every document, keyed by id, so a
     row on a letter prints the total and the word the register would */
  const rowsById = useMemo(() => {
    const by = new Map<string, RegisterRow>()
    for (const band of readRegister(filed).bands) for (const row of band.rows) by.set(row.id, row)
    return by
  }, [filed])

  const [query, setQuery] = useState(askedFor)
  const [bookOpen, setBookOpen] = useState(arrivedOnBook)
  const [order, setOrder] = useState<BookOrder>(arrivedOrder)
  const [group, setGroup] = useState<BookGrouping>(arrivedGroup)
  const [filing, setFiling] = useState(arrivedFiling)
  const [wanted, setWanted] = useState(arrivedAt)
  const [step, setStep] = useState<Step | null>(null)
  const [refused, setRefused] = useState<string | null>(null)

  const field = useRef<HTMLElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const letter = useRef<HTMLElement>(null)
  const rowsRef = useRef(new Map<string, HTMLDivElement>())

  /* WHO THE LETTER IS FOR, DERIVED. The address names a row; where it
     names none, or names one that has gone, the last one touched is
     the honest default — and a row the address names that is not in
     the book is said so, not silently swapped for somebody else. */
  const known = book.some((r) => r.rowId === wanted)
  const subjectId = known ? wanted : wanted === '' ? (lastTouched(book) ?? '') : ''
  const missing = wanted !== '' && !known && book.length > 0

  const mode: Mode = !read
    ? 'reading'
    : book.length === 0
      ? register
        ? 'empty'
        : 'bare'
      : bookOpen
        ? 'book'
        : 'letter'

  /* THE SHAPE THE BOOK IS MADE WITH, minted once per visit: the form
     draws its columns and the first filing hands the same object to
     `createTable`, so the name typed lands under the Name column the
     table is made with and not under a second minting of it. */
  const shape = useMemo(() => registerShape(), [])
  const nameId = register ? (displayFieldOf(register)?.id ?? '') : (shape.fields?.[0]?.id ?? '')
  /* the columns a person's page is drawn with: the book's, or the shape
     the book will be made with on the day a name on a quote is first kept */
  const columns = useMemo(() => pageColumns(register, shape, nameId), [register, shape, nameId])

  /* the book, ordered and cut as the two pressed controls say, then
     narrowed by the find field — the engine's two rungs keep the
     register order behind them */
  const shown = useMemo(() => {
    const ordered = orderBook(book, order)
    const q = query.trim()
    if (q === '') return ordered
    const hits = new Set(matchCustomers(people, q, people.length).map((c) => c.rowId))
    return ordered.filter((r) => hits.has(r.rowId))
  }, [book, order, query, people])
  const groups = useMemo(() => groupBook(shown, group), [shown, group])
  const flat = useMemo(() => groups.flatMap((g) => g.rows), [groups])

  /* the cursor in the book, derived the register's way: never at
     nothing while there is something to point at */
  const cursorKnown = flat.some((r) => r.rowId === wanted)
  const cursor = cursorKnown ? wanted : (flat[0]?.rowId ?? '')
  const here = flat.findIndex((r) => r.rowId === cursor)

  useEffect(() => {
    onPosition?.({
      who: mode === 'book' ? cursor || undefined : subjectId || undefined,
      find: query.trim() === '' ? undefined : query,
      book: mode === 'book' ? 'all' : undefined,
      order: order === 'recent' ? undefined : order,
      group: group === 'none' ? undefined : group,
      file: filing ? '1' : undefined,
    })
  }, [onPosition, mode, cursor, subjectId, query, order, group, filing])

  /* the cursor row is kept on screen without smoothing, and a row
     already in view is left alone (the register's own finding) */
  useEffect(() => {
    if (mode !== 'book' || cursor === '') return
    const row = rowsRef.current.get(cursor)
    const port = list.current
    if (!row || !port) return
    const box = row.getBoundingClientRect()
    const inside = port.getBoundingClientRect()
    if (box.top >= inside.top && box.bottom <= inside.bottom) return
    row.scrollIntoView({ block: 'nearest' })
  }, [mode, cursor])

  /* ============================================================
     THE ACTS. Every write goes through a store's `apply` — a command
     with its inverse, its sentence and its typed event — and the way
     back is pinned to the event, under the head, where every press on
     this screen can see it.
     ============================================================ */

  const openLetter = useCallback((rowId: string) => {
    setWanted(rowId)
    setBookOpen(false)
    setQuery('')
    setFiling(false)
  }, [])

  const openBook = useCallback(() => {
    setBookOpen(true)
    setQuery('')
  }, [])

  const openIt = useCallback(
    (quote: QuoteDef) => {
      if (!openQuote) {
        setRefused(NO_WAY_TO_OPEN)
        return
      }
      openQuote(quote.id, openAs(standingOf(index, quote.id)))
    },
    [index, openQuote],
  )

  /**
   * EVERY DRAFT OF THEIRS THAT DOES NOT YET PRINT WHAT THE BOOK KEEPS,
   * addressed to them afresh through the quotes store — the same link
   * the build's customer would make, one command per draft, each with
   * its own way back. Read AFTER the sheet's write has landed, so the
   * freeze reads the row as it now is (freeze.ts's "one-line widening").
   * A given quote is never among them (`draftsBehind`).
   */
  const reachDrafts = useCallback(
    (
      rowId: string,
      also: readonly string[] = [],
    ): { writes: Step['quotes']; refs: string[]; refusals: string[] } => {
      const state = catalogueStore.getState()
      const kept = customerRegister(state.tables as Record<string, EntityDef>)
      const out = { writes: [] as Step['quotes'], refs: [] as string[], refusals: [] as string[] }
      if (!kept) return out
      const behind = draftsBehind(
        kept,
        state.rows[kept.id] ?? [],
        rowId,
        indexQuotes(quotesStore.getState().quotes),
        also,
      )
      if (behind.length === 0) return out
      const frozen = freezeCustomer(makeCtx({ ...ctxFrom(state), orgId: PACK_ORG_ID }), rowId)
      if (!frozen) return out
      for (const q of behind) {
        const linked = quotesStore.getState().apply(q.id, linkCustomer(frozen))
        if ('refused' in linked) {
          if (linked.refused !== '') out.refusals.push(`${q.reference}: ${linked.refused}`)
          continue
        }
        out.writes.push({ id: q.id, eventId: linked.event.id })
        out.refs.push(q.reference)
      }
      return out
    },
    [],
  )

  /**
   * ADD ONE PERSON BY HAND — somebody who has not been quoted yet. On
   * the day there is no book this is ONE step, the book and the row in a
   * batch with one Undo, and every day after it is a row.
   */
  const fileOne = useCallback(
    (name: string, cells: Record<string, string>): void => {
      if (!sheetOpen) {
        setRefused(NO_SHEET_FOR_A_BOOK)
        return
      }
      if (name.trim() === '') {
        setRefused(NAME_NEEDED)
        return
      }
      const rowId = newId()
      const said = addedSay(name)
      const command: CatalogueCommand = register
        ? addRow(CUSTOMER_TABLE_ID, cells, rowId)
        : batch([createTable(shape), addRow(CUSTOMER_TABLE_ID, cells, rowId)], { said })
      const outcome = catalogueStore.getState().apply(command)
      if ('refused' in outcome) {
        setRefused(outcome.refused === '' ? null : outcome.refused)
        return
      }
      setRefused(null)
      /* taken back, the person is gone, so the page goes to whoever was
         touched last ('') rather than saying nobody is at the address */
      setStep({
        said,
        sheet: { eventId: outcome.event.id },
        quotes: [],
        wasUndo: false,
        from: '',
        to: rowId,
      })
      setFiling(false)
      setWanted(rowId)
      setBookOpen(false)
    },
    [register, shape, sheetOpen],
  )

  /**
   * A CHANGE ON THE PAGE OF A PERSON WHO IS ONLY A NAME ON QUOTES, and it
   * is the moment the book keeps them: ONE write — the row, with the name
   * and every line their newest quote carries under the column
   * `placeLines` puts it in, and the change — and on the day there is no
   * book, the book with it, in one batch. Their drafts are then addressed
   * to the row they now have, so they print it too. One Undo takes it all
   * back, and the page stays on the same person throughout.
   */
  const keepThem = useCallback(
    (key: string, fieldId: string, value: string): boolean => {
      const who = everyone.quoted.find((p) => p.key === key)
      if (!who) {
        setRefused(NOBODY_AT_THIS_ADDRESS)
        return false
      }
      if (!sheetOpen) {
        setRefused(NO_SHEET_FOR_A_BOOK)
        return false
      }
      const cells = cellsFromQuote(nameId, who.name, who.contact)
      const typed = value.trim()
      if ((cells[fieldId] ?? '') === typed) return true
      if (fieldId === nameId && typed === '') {
        setRefused(NAME_NEEDED)
        return false
      }
      if (typed === '') delete cells[fieldId]
      else cells[fieldId] = typed
      const rowId = newId()
      const column = columns.fields.find((f) => f.id === fieldId)
      const head = changeSay(who.name, column?.name ?? '', typed, fieldId === nameId)
      const command: CatalogueCommand = register
        ? addRow(CUSTOMER_TABLE_ID, cells, rowId)
        : batch([createTable(shape), addRow(CUSTOMER_TABLE_ID, cells, rowId)], { said: head })
      const outcome = catalogueStore.getState().apply(command)
      if ('refused' in outcome) {
        setRefused(outcome.refused === '' ? null : outcome.refused)
        return false
      }
      const reached = reachDrafts(
        rowId,
        who.lines.filter((l) => l.addressable).map((l) => l.quoteId),
      )
      setRefused(reached.refusals.length > 0 ? reached.refusals.join(' ') : null)
      setStep({
        said: `${head}${reachSay(reached.refs)}${
          fieldId === nameId
            ? keepsNameSay(
                who.lines.filter((l) => !l.addressable).map((l) => l.reference),
                who.name,
              )
            : ''
        }`,
        sheet: { eventId: outcome.event.id },
        quotes: reached.writes,
        wasUndo: false,
        from: key,
        to: rowId,
      })
      setWanted(rowId)
      return true
    },
    [columns, everyone, nameId, reachDrafts, register, shape, sheetOpen],
  )

  /** ONE CELL ON THE PAGE OF A PERSON THE BOOK KEEPS, through the sheet's
   *  own command, and then every draft of theirs that must print it. A
   *  person who is so far a name on quotes is kept by the same press. */
  const changeCell = useCallback(
    (rowId: string, fieldId: string, value: string): boolean => {
      if (isQuoted(rowId)) return keepThem(rowId, fieldId, value)
      const before = people.find((p) => p.rowId === rowId)?.name ?? ''
      const outcome = catalogueStore
        .getState()
        .apply(
          updateCell(CUSTOMER_TABLE_ID, rowId, fieldId, value.trim() === '' ? null : value.trim()),
        )
      if ('refused' in outcome) {
        /* '' is the command's word for "nothing changed", which is not
           a refusal and prints nothing */
        setRefused(outcome.refused === '' ? null : outcome.refused)
        return outcome.refused === ''
      }
      const reached = reachDrafts(
        rowId,
        (everyone.byName.get(rowId) ?? []).filter((l) => l.addressable).map((l) => l.quoteId),
      )
      setRefused(reached.refusals.length > 0 ? reached.refusals.join(' ') : null)
      const column = columns.fields.find((f) => f.id === fieldId)
      setStep({
        said: `${changeSay(before, column?.name ?? '', value.trim(), fieldId === nameId)}${reachSay(reached.refs)}${
          fieldId === nameId
            ? keepsNameSay(
                (everyone.byName.get(rowId) ?? [])
                  .filter((l) => !l.addressable)
                  .map((l) => l.reference),
                before,
              )
            : ''
        }`,
        sheet: { eventId: outcome.event.id },
        quotes: reached.writes,
        wasUndo: false,
      })
      return true
    },
    [columns, everyone, keepThem, nameId, people, reachDrafts],
  )

  /** A DRAFT THAT PRINTS OLDER DETAILS THAN THE BOOK NOW KEEPS — typed
   *  before they were kept, or addressed before a change — brought up to
   *  date in one press, with its own way back. */
  const bringUp = useCallback(
    (rowId: string): void => {
      const reached = reachDrafts(rowId)
      setRefused(reached.refusals.length > 0 ? reached.refusals.join(' ') : null)
      if (reached.writes.length === 0) return
      setStep({
        said: broughtUpSay(reached.refs),
        sheet: null,
        quotes: reached.writes,
        wasUndo: false,
      })
    },
    [reachDrafts],
  )

  const goBack = useCallback(() => {
    if (!step) return
    let sheet = step.sheet
    const quotes: Step['quotes'] = []
    const refuse = (said: string): void => {
      setRefused(said === '' ? null : said)
    }
    if (step.wasUndo) {
      /* forward again, in the order the act ran: the sheet, then each draft */
      if (sheet) {
        const out = catalogueStore.getState().redo()
        if ('refused' in out) return refuse(out.refused)
        sheet = { eventId: out.event.id }
      }
      for (const q of step.quotes) {
        const out = quotesStore.getState().redo(q.id)
        if ('refused' in out) return refuse(out.refused)
        quotes.push({ id: q.id, eventId: out.event.id })
      }
    } else {
      /* back, the drafts first and the sheet last, each pinned to its own event */
      for (const q of step.quotes.toReversed()) {
        const out = quotesStore.getState().undo(q.id, q.eventId)
        if ('refused' in out) return refuse(out.refused)
        quotes.unshift({ id: q.id, eventId: out.event.id })
      }
      if (sheet) {
        const out = catalogueStore.getState().undo(sheet.eventId)
        if ('refused' in out) return refuse(out.refused)
        sheet = { eventId: out.event.id }
      }
    }
    setRefused(null)
    /* THE PAGE STAYS ON THE SAME PERSON: a first keep made them a row, so
       taking it back returns the page to the name on their quotes, and
       putting it back returns it to the row */
    if (step.from !== undefined && step.to !== undefined) {
      setWanted(step.wasUndo ? step.to : step.from)
    }
    setStep({ ...step, sheet, quotes, wasUndo: !step.wasUndo })
  }, [step])

  const startOne = useCallback(() => {
    if (!newQuote) {
      setRefused(NO_WAY_TO_THE_PICKER)
      return
    }
    newQuote()
  }, [newQuote])

  /* ============================================================
     THE KEYBOARD, bound to the book's grid and never to the window, and
     NO KEY HERE IS A CHARACTER (2026-09-25, m2-last-critique.md major 7
     — the specification's major 11). J, K, N, B and `/` were
     single-character shortcuts WCAG 2.2 SC 2.1.4 asks to be switchable,
     and seventeen caps taught them at a desk; B and N answered on the
     whole of a customer's page. What is left is what every list has:
     the arrows, Home and End, Enter to open, Escape to step back. Every
     other act is a control on the screen.
     ============================================================ */
  const onBookKey = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (isField(event.target)) return
    if (event.metaKey || event.ctrlKey || event.altKey) return
    const key = event.key
    const move = (by: number): void => {
      if (flat.length === 0) return
      const from = here < 0 ? 0 : here
      const next = Math.min(flat.length - 1, Math.max(0, from + by))
      setWanted(flat[next]!.rowId)
    }
    if (key === 'ArrowDown') {
      event.preventDefault()
      move(1)
    } else if (key === 'ArrowUp') {
      event.preventDefault()
      move(-1)
    } else if (key === 'Home') {
      event.preventDefault()
      if (flat[0]) setWanted(flat[0].rowId)
    } else if (key === 'End') {
      event.preventDefault()
      const last = flat[flat.length - 1]
      if (last) setWanted(last.rowId)
    } else if (key === 'Enter') {
      event.preventDefault()
      if (cursor !== '') openLetter(cursor)
    } else if (key === 'Escape' && closesStage(stageKeyOf(event.nativeEvent))) {
      event.preventDefault()
      if (filing) setFiling(false)
      else if (query !== '') setQuery('')
      else if (subjectId !== '' || cursor !== '') openLetter(cursor || subjectId)
    }
  }

  const onLetterKey = (event: ReactKeyboardEvent<HTMLElement>): void => {
    if (isField(event.target)) return
    if (event.metaKey || event.ctrlKey || event.altKey) return
    const key = event.key
    if (key === 'Escape' && closesStage(stageKeyOf(event.nativeEvent))) {
      event.preventDefault()
      if (filing) setFiling(false)
      else if (query !== '') setQuery('')
    }
  }

  const onFieldKey = (event: ReactKeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setQuery('')
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      if (mode === 'book') {
        list.current?.focus()
        return
      }
      const first = matchCustomers(people, query, 1)[0]
      if (first) openLetter(first.rowId)
      return
    }
    if (event.key === 'ArrowDown' && mode === 'book') {
      event.preventDefault()
      list.current?.focus()
    }
  }

  const narrowed = query.trim() !== ''
  const found = useMemo(
    () => (narrowed && mode === 'letter' ? matchCustomers(people, query, 8) : []),
    [narrowed, mode, people, query],
  )
  /* the day the list and the page date themselves against */
  const today = localDay(now().toISOString())
  const quotedToday = quotedOn(book, today)
  /* THE PERSON THE PAGE IS OPEN ON, read once (`readPage`) — kept, or a
     name on quotes, drawn by the same page */
  const page = useMemo(
    () =>
      subjectId === ''
        ? null
        : readPage(subjectId, register, bookRows, filed, index, everyone, nameId),
    [subjectId, register, bookRows, filed, index, everyone, nameId],
  )

  const said = step ? (
    <output className="cu-step" data-testid="last-step">
      <span className="cu-step__said">{step.wasUndo ? `Taken back: ${step.said}` : step.said}</span>
      <Button intent="veiled" size="sm" onClick={goBack}>
        {step.wasUndo ? 'Put it back' : 'Undo'}
      </Button>
    </output>
  ) : null

  return (
    <main
      className="cu"
      data-testid="customers"
      data-mode={mode}
      data-read={read ? '' : undefined}
      data-book={mode === 'book' ? '' : undefined}
    >
      <header className="cu-head">
        <div className="cu-head__who">
          <p className="cu-eyebrow">{business ?? 'This business has not been named yet'}</p>
          <h1 className="cu-title">Customers</h1>
        </div>

        {/* THE FIND FIELD IS THE WAY TO A LETTER, so it is drawn the
            moment there is anybody to find — the letter is the rest
            state and the book is a door, which is why a field over a
            three-person book is not the clutter `FIND_FIELD_AT` exists
            to remove: here it is the navigation. */}
        {book.length > 0 ? (
          <div className="cu-find">
            <span className="cu-find__field">
              <Input
                id="cu-find-field"
                ref={field}
                type="search"
                aria-label="Find a customer"
                value={query}
                onValueChange={setQuery}
                onKeyDown={onFieldKey}
                aria-describedby={narrowed ? 'cu-find-said' : undefined}
                placeholder="A name, a phone, an email, or the yard’s note"
              />
            </span>
          </div>
        ) : null}

        <div className="cu-head__stamp">
          {quotesProblem !== null ? (
            <p className="cu-stamp-line" role="alert">
              {quotesProblem}
            </p>
          ) : sheetProblem !== null && status === 'failed' ? (
            <p className="cu-stamp-line" role="alert">
              {sheetProblem}
            </p>
          ) : !read ? (
            <p className="cu-stamp-line">Reading what this browser has kept…</p>
          ) : book.length > 0 ? (
            <p className="cu-stamp-line">
              <b>{au(book.length)}</b> {book.length === 1 ? 'customer' : 'customers'}
              {quotedToday > 0 ? ` · ${au(quotedToday)} quoted today` : ''}
            </p>
          ) : (
            <p className="cu-stamp-line">No customers yet</p>
          )}
          {/* ONE COUNT AND NOTHING ABOUT HOW THEY ARE KEPT (M2-close
              critique #7). The head read "1 person in the book · 1 name
              typed on a quote, not filed" over "Kept for each: Name ·
              Phone · Email · Address · Notes" — the book's anatomy and the
              second act, on the first line a dealer reads. Everyone a
              quote names is counted, and "quoted today" is the one figure
              about them that changes while he watches. */}
        </div>

        {/* THE BOOK'S ACT STANDS ON THE HEAD'S OWN LINE, the way Data's
            does: in a register the rows are the room, and an act row
            under them was 70px of it (critique-m2 #5). No Home here —
            the pill carries it (rule a). */}
        {mode === 'book' ? (
          <div className="cu-head__act">
            <Button
              intent={filing ? 'veiled' : 'act'}
              aria-label="Add a customer"
              aria-expanded={filing}
              onClick={() => setFiling(!filing)}
            >
              Add a customer
            </Button>
          </div>
        ) : null}
      </header>

      {/* WHAT THE LAST ACT SAID, AND THE WAY BACK FROM IT — under the
          head, in its own track, pinned to the event: the configurator's
          rail head and never a toast. In the book it stands on the
          book's own bar instead, beside the controls, so it costs the
          rows nothing. */}
      {step && mode !== 'book' ? said : null}

      {refused ? (
        <p className="cu-alarm" role="alert">
          {refused}
        </p>
      ) : null}

      {/* THE EIGHT NAMES AS YOU TYPE, on the letter — C's own finding
          field. In the book the same words narrow the rows instead. */}
      {mode === 'letter' && narrowed ? (
        <div className="cu-found" id="cu-find-said" role="status">
          {found.length === 0 ? (
            <p className="cu-found__say">{nothingInTheBook(query)}</p>
          ) : (
            <>
              {/* one sentence for a finger and a mouse; Enter in the field still
                  opens the first, and no cap is drawn for it (2026-09-25) */}
              <p className="cu-found__say">
                {au(found.length)} of {au(people.length)} match “{query.trim()}” · press a name to
                open their page
              </p>
              <ul className="cu-found__list">
                {found.map((c) => (
                  <li key={c.rowId}>
                    <Button intent="veiled" size="sm" onClick={() => openLetter(c.rowId)}>
                      {c.name === '' ? 'Unnamed' : c.name}
                      {c.contact[0] ? (
                        <span className="cu-found__contact">{c.contact[0]}</span>
                      ) : null}
                    </Button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ) : null}
      {mode === 'book' && narrowed ? (
        <p className="cu-narrowed" id="cu-find-said" role="status">
          {shown.length === 0
            ? nothingInTheBook(query)
            : `${au(shown.length)} of ${au(book.length)} match “${query.trim()}”.`}
        </p>
      ) : null}

      {mode === 'reading' ? (
        <div className="cu-body" data-mode="reading">
          <p className="cu-reading">Reading what this browser has kept…</p>
        </div>
      ) : mode === 'bare' || mode === 'empty' ? (
        <Bare
          made={mode === 'empty'}
          sheetOpen={sheetOpen}
          status={status}
          register={register}
          nameId={nameId}
          people={people}
          onFile={fileOne}
          onOpen={openLetter}
          openTheFile={openTheFile}
          startOne={startOne}
          canStart={Boolean(newQuote)}
        />
      ) : mode === 'book' ? (
        <Book
          business={business}
          groups={groups}
          narrowed={narrowed}
          cursor={cursor}
          order={order}
          group={group}
          filing={filing}
          register={register}
          nameId={nameId}
          people={people}
          quotes={index}
          makerOf={makerOf}
          said={said}
          list={list}
          rowsRef={rowsRef}
          onKeyDown={onBookKey}
          onPoint={(rowId) => {
            setWanted(rowId)
            list.current?.focus()
          }}
          onOpen={openLetter}
          setOrder={setOrder}
          setGroup={setGroup}
          setFiling={setFiling}
          onFile={fileOne}
          today={today}
          rowsById={rowsById}
          now={now}
          onOpenQuote={openIt}
          canOpen={Boolean(openQuote)}
        />
      ) : (
        <Letter
          ref={letter}
          business={business}
          columns={columns}
          register={register}
          nameId={nameId}
          page={page}
          missing={missing}
          count={book.length}
          index={index}
          rowsById={rowsById}
          makerOf={makerOf}
          people={people}
          filing={filing}
          now={now}
          onKeyDown={onLetterKey}
          onChange={changeCell}
          onOpenQuote={openIt}
          onBringUp={bringUp}
          canOpen={Boolean(openQuote)}
          openBook={openBook}
          setFiling={setFiling}
          onFile={fileOne}
          onOpen={openLetter}
        />
      )}
    </main>
  )
}

/** One id per row, so `aria-activedescendant` names the row a reader
 *  is on. */
export const rowDomId = (rowId: string): string => `cu-row-${rowId}`

/* ---------------------------------------------------------- */
/* The empty state, which is the true state and teaches       */
/* ---------------------------------------------------------- */

/**
 * NOBODY IS A CUSTOMER YET — no quote names anyone, and nobody has been
 * added by hand. The honest state, and it draws no empty table:
 * Atlassian's rule (`empty/atlassian-empty-state-writing.png`) is the
 * reason and where to go next, in two sentences, and Shopify's is who
 * fills a customer list — the sale, with "by hand" as the alternative.
 *
 * ONE SENTENCE ABOUT WHERE CUSTOMERS COME FROM, NOT THREE HEADED
 * PARAGRAPHS (2026-09-24, M2-close critique #7). The words taught a
 * second act — "a name typed on a quote goes on that quote only; file
 * it here" — and the screen no longer asks for one: the person a quote
 * names is on this screen the moment the name is typed. So the words
 * say that, and the one act a dealer can take here that the build does
 * not already take for him stands beside them on the file's blue: add
 * somebody who has not been quoted yet, with the form open and LIVE.
 * Nothing on this spread refuses before it has been pressed. One column
 * in a hand, the form first.
 */
function Bare({
  made,
  sheetOpen,
  status,
  register,
  nameId,
  people,
  onFile,
  onOpen,
  openTheFile,
  startOne,
  canStart,
}: {
  made: boolean
  sheetOpen: boolean
  status: string
  register: EntityDef | undefined
  nameId: string
  people: readonly CustomerRead[]
  onFile: (name: string, cells: Record<string, string>) => void
  onOpen: (rowId: string) => void
  openTheFile?: () => void
  startOne: () => void
  canStart: boolean
}) {
  return (
    <div className="cu-body" data-mode={made ? 'empty' : 'bare'}>
      <section className="cu-spread cu-spread--bare" aria-label="No customers yet">
        <div className="cu-leaf cu-leaf--words">
          <h2 className="cu-teach__head">Everyone you quote appears here.</h2>
          <p className="cu-teach__lead">{WHERE_CUSTOMERS_COME_FROM}</p>
          <p className="cu-teach__a">
            {made
              ? 'Everyone added here before has been taken out again, and no quote names anybody. '
              : ''}
            Somebody you have not quoted yet can be added now, and a quote to them later finds them
            here.
          </p>

          {!sheetOpen ? (
            <div className="cu-teach__door">
              <p className="cu-teach__a">
                {status === 'loading' || status === 'empty'
                  ? 'Looking for a price file in this browser…'
                  : NO_SHEET_FOR_A_BOOK}
              </p>
              {openTheFile && status !== 'loading' ? (
                <Button intent="veiled" onClick={openTheFile}>
                  Load the Master Price File
                </Button>
              ) : null}
            </div>
          ) : null}

          <div className="cu-doors cu-doors--start">
            <Button
              intent="veiled"
              onClick={startOne}
              refusedBecause={canStart ? undefined : NO_WAY_TO_THE_PICKER}
            >
              Start a quote
            </Button>
          </div>
        </div>

        <div className="cu-leaf cu-leaf--acts">
          <FileForm
            register={register}
            nameId={nameId}
            people={people}
            sheetOpen={sheetOpen}
            onFile={onFile}
            onOpen={onOpen}
          />
        </div>
      </section>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* Adding a customer by hand, the possible duplicate under it */
/* ---------------------------------------------------------- */

/**
 * ONE FORM ON BOTH DAYS. Its columns are the register's own where
 * there is one and the shape the register will be made with where
 * there is not (`fieldsToFile`), captioned by `groupByDescription` so
 * three columns that say one sentence say it once.
 *
 * THE POSSIBLE DUPLICATE IS UNDER THE FORM AND THE ACT STAYS LIVE
 * (`deep/linear-similar-issues-now-scrolled.png`). As a name is typed
 * the matching people appear beneath the fields — kept, or a name on a
 * quote — each an act that opens them; the exact hit says "A Sarah Jones
 * is already a customer." with *Open* and *Add another* beside it —
 * Apple's *Keep Both* as the default, in two buttons and no modal.
 *
 * THE ACT IS LIVE AT REST (critique-m2 #11). It rested amber with "A
 * person needs a name before they can be filed." under it, which made
 * the brightest thing on the screen a refusal nobody had earned. Now
 * the press is what refuses: pressed with no name, the sentence stands
 * under the act, where it was refused, and the caret goes to the Name
 * field it is about. A name typed takes the sentence away again.
 */
function FileForm({
  register,
  nameId,
  people,
  sheetOpen,
  onFile,
  onOpen,
  onClose,
}: {
  register: EntityDef | undefined
  /** the column the name goes under — the register's label column,
   *  or the Name column the book will be made with */
  nameId: string
  people: readonly CustomerRead[]
  sheetOpen: boolean
  onFile: (name: string, cells: Record<string, string>) => void
  onOpen: (rowId: string) => void
  onClose?: () => void
}) {
  const fields = useMemo(() => fieldsToFile(register, nameId), [register, nameId])
  const groups = useMemo(() => groupByDescription(fields), [fields])
  const [typed, setTyped] = useState<Record<string, string>>({})
  const [another, setAnother] = useState(false)
  const [tried, setTried] = useState(false)
  const nameField = useRef<HTMLInputElement>(null)

  const name = (typed[nameId] ?? '').trim()
  const twin = name === '' ? undefined : exactCustomer(people, name)
  const alike = name.length < 2 ? [] : matchCustomers(people, name, 8).filter((c) => c !== twin)

  /* EVERY TYPED COLUMN IS WRITTEN, the dealer's own included — a
     blank cell is not: a cell nobody filled is a cell that is not
     there. The name is trimmed under its own column. */
  const submit = (): void => {
    const cells: Record<string, string> = {}
    for (const f of fields) {
      const said = (typed[f.id] ?? '').trim()
      if (said !== '') cells[f.id] = said
    }
    cells[nameId] = name
    onFile(name, cells)
    setTyped({})
    setAnother(false)
    setTried(false)
  }

  /* THE REFUSAL, AND WHERE ITS SENTENCE ALREADY IS. A name already in
     the book is refused BY the block drawn under the fields, not by a
     second copy of the same sentence under the act: `Button`'s own
     `refusedBy` exists for exactly this. No sheet is said at once,
     because nothing typed here can change it; no name is said only
     once somebody has pressed. */
  const twinSaidAt = 'cu-twin-said'
  const refusal = !sheetOpen ? NO_SHEET_FOR_A_BOOK : tried && name === '' ? NAME_NEEDED : undefined
  const refusedByTwin = refusal === undefined && twin !== undefined && !another

  return (
    <form
      className="cu-file"
      aria-label="Add a customer"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        if (!sheetOpen || refusedByTwin) return
        if (name === '') {
          setTried(true)
          nameField.current?.focus()
          return
        }
        submit()
      }}
    >
      <p className="cu-file__title">Add a customer</p>
      {groups.map((group) => (
        <div className="cu-file__group" key={group.fields.map((f) => f.id).join('|')}>
          <div className="cu-file__fields">
            {group.fields.map((f) => (
              <div className="cu-ask" key={f.id}>
                <label className="cu-ask__lab" htmlFor={`cu-file-${f.id}`}>
                  {f.name}
                </label>
                <Input
                  id={`cu-file-${f.id}`}
                  ref={f.id === nameId ? nameField : undefined}
                  value={typed[f.id] ?? ''}
                  onValueChange={(value) => {
                    setTyped((was) => ({ ...was, [f.id]: value }))
                    setAnother(false)
                  }}
                  autoComplete={f.id === nameId ? 'name' : 'off'}
                  placeholder={f.id === nameId ? 'Who they are' : ''}
                />
              </div>
            ))}
          </div>
          {group.say !== '' ? <p className="cu-file__cap">{group.say}</p> : null}
        </div>
      ))}

      {/* THE POSSIBLE DUPLICATES, under the fields, the act still live */}
      {twin && !another ? (
        <div className="cu-twin" role="status">
          <p className="cu-twin__say" id={twinSaidAt}>
            {alreadyFiled(name)}
          </p>
          <div className="cu-twin__acts">
            <Button intent="veiled" size="sm" onClick={() => onOpen(twin.rowId)}>
              Open {twin.name}
            </Button>
            <Button intent="veiled" size="sm" onClick={() => setAnother(true)}>
              Add another {name}
            </Button>
          </div>
        </div>
      ) : null}
      {alike.length > 0 ? (
        <div className="cu-alike">
          <p className="cu-alike__say">Already a customer, and possibly the same person</p>
          <ul className="cu-alike__list">
            {alike.map((c) => (
              <li key={c.rowId}>
                <Button intent="veiled" size="sm" onClick={() => onOpen(c.rowId)}>
                  Open {c.name === '' ? 'the person with no name' : c.name}
                  {c.contact[0] ? <span className="cu-found__contact">{c.contact[0]}</span> : null}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="cu-file__acts">
        <span className="cu-file__go">
          <Button
            intent="act"
            type="submit"
            refusedBecause={refusal}
            refusedBy={refusedByTwin ? twinSaidAt : undefined}
          >
            {another ? `Add another ${name}` : 'Add them'}
          </Button>
        </span>
        {onClose ? (
          <span className="cu-file__close">
            <Button intent="veiled" size="sm" onClick={onClose}>
              Close
            </Button>
          </span>
        ) : null}
      </div>
    </form>
  )
}

/* ---------------------------------------------------------- */
/* The book: one search, no column head, no pager             */
/* ---------------------------------------------------------- */

/**
 * THE BOOK, AND THE ROOM IS THE ROWS'. Its act stands on the head's own
 * line and its two pressed controls, the last act's sentence and the
 * keys share ONE bar above the list, so everything a full book is not
 * costs one line (critique-m2 #5: 16 rows against 18 owed, with an act
 * row and the pile both standing under the list).
 *
 * THE END OF THE BOOK IS INSIDE THE LIST'S PORT, after the last row: a
 * short book ends in a sentence that says it is everyone, rather than
 * in floor (rule e), and a full one scrolls the sentence away, so it
 * costs a full book nothing. It is not a row and the grid does not hold
 * it; the port (`.cu-list`, the density ruler's list) does.
 */
function Book({
  business,
  groups,
  narrowed,
  cursor,
  order,
  group,
  filing,
  register,
  nameId,
  people,
  quotes,
  makerOf,
  said,
  list,
  rowsRef,
  onKeyDown,
  onPoint,
  onOpen,
  setOrder,
  setGroup,
  setFiling,
  onFile,
  today,
  rowsById,
  now,
  onOpenQuote,
  canOpen,
}: {
  /** the dealership's name, for the paper the glance draws */
  business: string | null
  today: string
  /** the register's reading of every quote, for the total the glance prints */
  rowsById: ReadonlyMap<string, RegisterRow>
  now: () => Date
  onOpenQuote: (quote: QuoteDef) => void
  canOpen: boolean
  groups: BookGroup[]
  narrowed: boolean
  cursor: string
  order: BookOrder
  group: BookGrouping
  filing: boolean
  /** the book, or undefined while everyone is still a name on a quote */
  register: EntityDef | undefined
  nameId: string
  people: readonly CustomerRead[]
  quotes: HistoryIndex
  makerOf: (q: QuoteDef) => string | undefined
  said: ReactNode
  list: RefObject<HTMLDivElement | null>
  rowsRef: RefObject<Map<string, HTMLDivElement>>
  onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void
  onPoint: (rowId: string) => void
  onOpen: (rowId: string) => void
  setOrder: (order: BookOrder) => void
  setGroup: (group: BookGrouping) => void
  setFiling: (open: boolean) => void
  onFile: (name: string, cells: Record<string, string>) => void
}) {
  const total = groups.reduce((n, g) => n + g.rows.length, 0)
  /* the person the room under the rows shows: the one under the cursor, or the first */
  const everyone = groups.flatMap((g) => g.rows)
  const glanced = everyone.find((r) => r.rowId === cursor) ?? everyone[0]
  const glancedQuote = glanced?.latest ? quotes.byId.get(glanced.latest.id) : undefined
  return (
    <div className="cu-body" data-mode="book">
      <div className="cu-ledger">
        <div className="cu-bar">
          {said}
          <div className="cu-orders" role="group" aria-label="How the list is read">
            <Button
              intent="veiled"
              size="sm"
              aria-pressed={order === 'name'}
              onClick={() => setOrder(order === 'name' ? 'recent' : 'name')}
            >
              A to Z
            </Button>
            <Button
              intent="veiled"
              size="sm"
              aria-pressed={group === 'desk'}
              onClick={() => setGroup(group === 'desk' ? 'none' : 'desk')}
            >
              By what is next
            </Button>
            <span className="cu-orders__say">
              {order === 'name' ? 'A to Z' : 'Latest first'}
              {group === 'desk' ? ', by what each is doing next' : ''}
            </span>
          </div>
        </div>

        {filing ? (
          <FileForm
            register={register}
            nameId={nameId}
            people={people}
            sheetOpen
            onFile={onFile}
            onOpen={onOpen}
            onClose={() => setFiling(false)}
          />
        ) : null}

        <div className="cu-list" ref={list}>
          <div
            className="cu-grid"
            role="grid"
            tabIndex={0}
            aria-label="Customers"
            aria-rowcount={total}
            aria-activedescendant={cursor === '' ? undefined : rowDomId(cursor)}
            onKeyDown={onKeyDown}
          >
            {groups.map((g) => (
              <div
                className="cu-group"
                role="rowgroup"
                aria-label={g.title === '' ? 'Every customer' : g.title}
                key={g.key}
              >
                {g.title === '' ? null : (
                  <div className="cu-grouphead" role="row">
                    <div className="cu-grouphead__cell" role="gridcell" aria-colspan={5}>
                      <span className="cu-grouphead__word">{g.title}</span>
                      <span className="cu-grouphead__count">{au(g.rows.length)}</span>
                    </div>
                  </div>
                )}
                {g.rows.map((row) => (
                  <BookLine
                    key={row.rowId}
                    row={row}
                    on={row.rowId === cursor}
                    today={today}
                    onPoint={onPoint}
                    onOpen={onOpen}
                    hold={(rowId, element) => {
                      if (element) rowsRef.current.set(rowId, element)
                      else rowsRef.current.delete(rowId)
                    }}
                  />
                ))}
              </div>
            ))}
            {total === 0 ? (
              <div className="cu-group" role="rowgroup" aria-label="Nobody">
                <div className="cu-bandempty" role="row">
                  <div className="cu-bandempty__cell" role="gridcell" aria-colspan={5}>
                    {narrowed ? 'No customer matches.' : 'Nobody is a customer yet.'}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          {total > 0 ? (
            <p className="cu-end">
              {narrowed
                ? `That is everyone the find matches.`
                : `That is everyone — ${customersSay(total)}. Everyone a quote is written for joins this list.`}{' '}
              <span className="cu-fine">
                Double-click a name, or press Enter, to open their page.
              </span>
              <span className="cu-coarse">
                Press a name, then press it again to open their page.
              </span>
              {register ? (
                <>
                  {' '}
                  <Button intent="veiled" size="sm" href={BOOK_AS_A_SHEET}>
                    Edit everyone at once
                  </Button>
                </>
              ) : null}
            </p>
          ) : null}
        </div>

        {/* ============================================================
            THE ROOM THE ROWS LEAVE (2026-09-24, the M2-close critique's
            finding 6: "Customers' book at 1920: the last text ends at 229 px
            of 1,080"). A book of one person is honestly one row, and nothing
            is invented under it. What the room holds is that person, larger:
            the block a quote prints for them on paper, and the newest quote
            to them with its boat — the first lines of their page, with the
            way onto it. It follows the cursor, so arrowing down the book
            reads each person here without leaving the list. It takes only
            what the rows leave (`customers.css`): a full book shrinks it to
            nothing, and the density ruler reads the room it always did.
            ============================================================ */}
        <div className="cu-room">
          {glanced ? (
            <Glance
              business={business}
              row={glanced}
              quote={glancedQuote}
              maker={glancedQuote ? makerOf(glancedQuote) : undefined}
              register={glancedQuote ? rowsById.get(glancedQuote.id) : undefined}
              now={now}
              onOpen={onOpen}
              onOpenQuote={onOpenQuote}
              canOpen={canOpen}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

/**
 * ONE PERSON, AT A GLANCE, in the room under the book's rows: the paper
 * their quotes print (`Prepared for`, the name, the first contact line
 * the book already reads), and their newest quote as the letter draws it.
 * The act opens their page; the quote opens where the register would.
 */
function Glance({
  business,
  row,
  quote,
  maker,
  register,
  now,
  onOpen,
  onOpenQuote,
  canOpen,
}: {
  /** the dealership's name, heading the paper as page 1 of a quotation does */
  business: string | null
  row: BookRow
  quote: QuoteDef | undefined
  maker: string | undefined
  register: RegisterRow | undefined
  now: () => Date
  onOpen: (rowId: string) => void
  onOpenQuote: (quote: QuoteDef) => void
  canOpen: boolean
}) {
  const name = row.name === '' ? 'Nobody has named them yet' : row.name
  return (
    <section className="cu-glance" aria-label={`${name}, at a glance`}>
      <div className="cu-glance__paper">
        <div className="cu-paper">
          {business ? (
            <p className="cu-paper__head">
              <span>{business}</span>
              <span>Quotation</span>
            </p>
          ) : null}
          <p className="cu-paper__lab">Prepared for</p>
          <p className="cu-paper__name">{name}</p>
          {row.contact === '' ? null : <p className="cu-paper__line">{row.contact}</p>}
        </div>
        <span className="cu-glance__act">
          <Button intent="veiled" onClick={() => onOpen(row.rowId)}>
            Open their page
          </Button>
        </span>
      </div>
      <div className="cu-leaf cu-leaf--quotes cu-glance__quotes">
        <p className="cu-quotes__head">
          <span>{quote ? 'Their newest quote' : 'Their quotes'}</span>
        </p>
        {quote ? (
          <div className="cu-quotes" data-few="">
            <QuoteRow
              quote={quote}
              maker={maker}
              row={register}
              standing={row.latest?.standing ?? 'draft'}
              onOpen={onOpenQuote}
              canOpen={canOpen}
              now={now}
            />
          </div>
        ) : (
          <p className="cu-teach__a">No quote to them yet.</p>
        )}
      </div>
    </section>
  )
}

function BookLine({
  row,
  on,
  today,
  onPoint,
  onOpen,
  hold,
}: {
  row: BookRow
  on: boolean
  /** the reader's own day, so the latest quote's day reads as a person dates it */
  today: string
  onPoint: (rowId: string) => void
  onOpen: (rowId: string) => void
  hold: (rowId: string, element: HTMLDivElement | null) => void
}) {
  return (
    <div
      className="cu-row"
      role="row"
      id={rowDomId(row.rowId)}
      ref={(element) => {
        hold(row.rowId, element)
      }}
      data-on={on ? '' : undefined}
      aria-selected={on}
      onClick={() => (on ? onOpen(row.rowId) : onPoint(row.rowId))}
      onDoubleClick={() => onOpen(row.rowId)}
    >
      <span className="cu-cell cu-cell--name" role="gridcell">
        {row.name === '' ? <span className="cu-unnamed">Unnamed</span> : row.name}
      </span>
      <span className="cu-cell cu-cell--contact" role="gridcell">
        {row.contact}
      </span>
      <span className="cu-cell cu-cell--quotes" role="gridcell">
        {rowQuotesSay(row.quotes, row.byName)}
      </span>
      <span
        className="cu-cell cu-cell--latest"
        role="gridcell"
        data-standing={row.latest?.standing}
      >
        {row.latest ? `${STANDING_TITLE[row.latest.standing]} · ${row.latest.reference}` : ''}
      </span>
      <span className="cu-cell cu-cell--day" role="gridcell">
        {row.latest ? daySaid(row.latest.day, today) : ''}
      </span>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* The letter                                                 */
/* ---------------------------------------------------------- */

function Letter({
  ref,
  business,
  columns,
  register,
  nameId,
  page,
  missing,
  count,
  index,
  rowsById,
  makerOf,
  people,
  filing,
  now,
  onKeyDown,
  onChange,
  onOpenQuote,
  onBringUp,
  canOpen,
  openBook,
  setFiling,
  onFile,
  onOpen,
}: {
  ref: RefObject<HTMLElement | null>
  /** the dealership's name, as page 1 of a quotation heads the sheet */
  business: string | null
  /** the columns the page is drawn with — the book's, or the shape it
   *  will be made with while everyone is still a name on a quote */
  columns: PageColumns
  register: EntityDef | undefined
  nameId: string
  /** the person, read once (`readPage`); null where the address names nobody */
  page: PageRead | null
  missing: boolean
  count: number
  index: HistoryIndex
  rowsById: ReadonlyMap<string, RegisterRow>
  makerOf: (q: QuoteDef) => string | undefined
  people: readonly CustomerRead[]
  filing: boolean
  now: () => Date
  onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void
  onChange: (key: string, fieldId: string, value: string) => boolean
  onOpenQuote: (quote: QuoteDef) => void
  onBringUp: (rowId: string) => void
  canOpen: boolean
  openBook: () => void
  setFiling: (open: boolean) => void
  onFile: (name: string, cells: Record<string, string>) => void
  onOpen: (rowId: string) => void
}) {
  const shape = useMemo(() => letterShape(columns), [columns])
  const captions = useMemo(
    () => groupByDescription(columns.fields.filter((f) => f.type !== 'formula')),
    [columns],
  )
  const given = useMemo(
    () => (page ? givenOf(page.quotes, index) : { count: 0, total: 0 }),
    [page, index],
  )
  /* WHICH LINE OF THE PRINTED BLOCK IS BEING TYPED INTO, by column id.
     One at a time, because there is one editor and it stands under the
     plate rather than on it. */
  const [editing, setEditing] = useState<string | null>(null)

  if (!page) {
    return (
      <div className="cu-body" data-mode="letter">
        <section className="cu-spread cu-spread--one" aria-label="No customer at this address">
          <div className="cu-leaf cu-leaf--words">
            <h2 className="cu-teach__head">
              {missing ? NOBODY_AT_THIS_ADDRESS : 'Nobody to show.'}
            </h2>
            <div className="cu-doors">
              <Button intent="veiled" onClick={openBook}>
                Every customer
              </Button>
            </div>
          </div>
        </section>
      </div>
    )
  }

  const said = (f: FieldDef | undefined): string => (f ? (page.values[f.id] ?? '') : '')
  const captionFor = (f: FieldDef | undefined): string =>
    f ? (captions.find((g) => g.fields.some((x) => x.id === f.id))?.say ?? '') : ''
  const name = page.name
  const printed = [shape.phone, shape.email, shape.address].filter((f): f is FieldDef => Boolean(f))
  /* WHERE THE DETAILS ON THE PAPER COME FROM, said once in the margin: the
     book's own caption for a kept person, and for a name on quotes the
     quote they were typed on — so a phone that is not there is plainly
     not on that quote, rather than lost somewhere. */
  const printedSay = page.source
    ? `As typed on ${page.source.reference}.`
    : captionFor(printed[0]) || 'Printed on a quote, as it is written here.'
  const nameSay = name === '' ? 'Nobody has named them yet' : name
  const today = localDay(now().toISOString())
  const total = page.quotes.length
  const edited = editing === null ? undefined : columns.fields.find((f) => f.id === editing)

  return (
    <div className="cu-body" data-mode="letter">
      {/* THE LETTER IS A FOCUSABLE REGION, so its three keys are live
          only while a person is in it (WCAG 2.2 SC 2.1.4, third
          exemption) and the legend at its foot brightens when they are.

          A SPREAD OF TWO LEAVES AT A DESK (2026-09-23, critique-m2 #10
          and #17): the paper and everything about the person on the
          left, every quote to them on the right, the doors across the
          foot of both — so a letter with a quote on it is one window at
          1280x800 and no longer a 720px strip in a 1920px room.

          ONE PAGE FOR EVERY CUSTOMER (2026-09-24, M2-close critique #7):
          the person a quote names and the person the book keeps are drawn
          by the same page with the same acts, and nothing on it says
          which. `data-kept` is for a test to read, never a word. */}
      <article
        className="cu-letter cu-spread"
        ref={ref as RefObject<HTMLElement>}
        tabIndex={0}
        aria-label={`${nameSay}, a customer`}
        data-kept={page.kept ? '' : undefined}
        onKeyDown={onKeyDown}
      >
        <div className="cu-leaf cu-leaf--paper">
          <p className="cu-letter__eyebrow">
            {sinceSay(page.since, today)} · {quotesSay(total)}
            {page.changed === '' ? '' : ` · details changed ${daySaid(page.changed, today)}`}
          </p>

          {/* ============================================================
              THE BLOCK A QUOTE PRINTS, ON PAPER.

              THIS IS THE DIRECTION, AND IT IS OWNED AS AN INVENTION.
              `src/screens/document/Document.tsx` prints the customer as
              `Prepared for`, the name, then each line of
              `FrozenCustomer.contact` — and `freezeCustomer` fills that
              array from `readCustomer`, which reads
              `CUSTOMER_CONTACT_FIELDS` in order and drops the blanks.
              The block below is `readPage`'s, which reads the SAME
              function on the SAME row for a kept person — and for a name
              on quotes, the lines the newest of those quotes printed — so
              the block on this paper and the block on the A4 cannot
              disagree without a test going red.

              THE PAPER IS THE CUSTOMER'S AND THE ROOM IS THE DEALER'S —
              the document screen's own rule, kept literally. Nothing the
              customer will not see is on the plate: the acts stand off it
              in the margin, the yard's note is a band on the blue, and a
              column the dealer added themselves is a row off it too. An
              absent line does not print "No phone" on the paper, because
              a quote does not print that either — it prints nothing,
              which is exactly what the plate shows, with *Add phone*
              waiting in the margin (`deep/govuk-summary-list.png`). */}
          <section className="cu-printed" aria-label="What a quote prints">
            <div className="cu-paper">
              {business ? (
                <p className="cu-paper__head">
                  <span>{business}</span>
                  <span>Quotation</span>
                </p>
              ) : null}
              <p className="cu-paper__lab">Prepared for</p>
              <h2 className="cu-paper__name" data-empty={name === '' ? '' : undefined}>
                {nameSay}
              </h2>
              {page.block.map((line) => (
                <p className="cu-paper__line" key={line}>
                  {line}
                </p>
              ))}
              {page.block.length === 0 ? (
                <p className="cu-paper__none">
                  {printed.length === 0
                    ? 'No phone, email or address is kept for customers any more, so a quote prints the name alone.'
                    : 'Nothing else is written for them yet, so a quote to them prints the name alone.'}
                </p>
              ) : null}
            </div>

            <div className="cu-margin">
              <p className="cu-cap">{printedSay}</p>
              <div className="cu-margin__acts">
                {[shape.name, shape.phone, shape.email, shape.address]
                  .filter((f): f is FieldDef => Boolean(f))
                  .map((f) => (
                    <Button
                      key={f.id}
                      intent="veiled"
                      size="sm"
                      aria-expanded={editing === f.id}
                      onClick={() => setEditing(editing === f.id ? null : f.id)}
                    >
                      {said(f) === '' ? 'Add' : 'Change'} {f.name.toLowerCase()}
                    </Button>
                  ))}
              </div>
              <p className="cu-frozen">{CHANGE_REACHES_NEXT_QUOTE}</p>
            </div>
          </section>

          {/* THE ONE EDITOR, OFF THE PAPER. A press in the margin opens it
              under the plate, in the dealer's own room, with the column's
              name on the label — never a caret on the customer's sheet.
              Enter commits, Escape cancels, and a refusal stands where it
              was refused rather than in a toast. */}
          {edited ? (
            <Editing
              key={edited.id}
              field={edited}
              value={said(edited)}
              rowId={page.key}
              onChange={onChange}
              onDone={() => setEditing(null)}
            />
          ) : null}

          {/* THE YARD'S NOTE, in a band that says what it is, and a band
              that no document ever reads: `freezeCustomer` copies the
              three printed columns and nothing else, and the screen's
              own suite holds `readDocument` to it. */}
          {shape.note ? (
            <aside className="cu-note" aria-label="The yard’s note">
              <p className="cu-cap cu-cap--note">
                {captionFor(shape.note) || 'For the yard — never printed on a quote.'}
              </p>
              <Editable
                field={shape.note}
                value={said(shape.note)}
                rowId={page.key}
                onChange={onChange}
                as="p"
              />
            </aside>
          ) : null}

          {shape.others.length > 0 ? (
            <dl className="cu-others">
              {shape.others.map((f) => (
                <div className="cu-others__row" key={f.id}>
                  <dt>{f.name}</dt>
                  <dd>
                    <Editable
                      field={f}
                      value={said(f)}
                      rowId={page.key}
                      onChange={onChange}
                      as="span"
                    />
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          {page.namesakes > 1 ? (
            <p className="cu-frozen">
              {au(page.namesakes)} other customers are called {name}, so this quote is shown on its
              own rather than guessed to be one of theirs.
            </p>
          ) : null}
          {page.addressedAs.length > 0 ? (
            <p className="cu-frozen">
              Their quotes carry the name as it was when each was written:{' '}
              {page.addressedAs.join(', ')}.
            </p>
          ) : null}

          {/* THREE FIGURES, COUNTED, AT THE SIZE A FIGURE IS READ — Home's
              own treatment of a count, on this person: how many quotes,
              how many went out of the door, and what those came to at the
              prices the customer was given (`givenOf`, over the engine's
              own totals). Drawn only where there is a quote to count.

              ON THE ROOM, AT THE FOOT OF THE PERSON'S LEAF (2026-09-24). They
              stood at the head of the blue card, over the boat, and the leaf
              beside it ended under the yard's note with the room showing
              below it. Now the person's leaf runs the card's height: their
              paper at the top, what they come to at the foot, and the card
              beside it is the boat. */}
          {total > 0 ? (
            <dl className="cu-figures" aria-label={`What ${nameSay} comes to`}>
              <div className="cu-figures__one">
                <dt>Written</dt>
                <dd>{au(total)}</dd>
              </div>
              <div className="cu-figures__one">
                <dt>Given</dt>
                <dd>{au(given.count)}</dd>
              </div>
              <div className="cu-figures__one" data-money="">
                <dt>Given, in all</dt>
                <dd>
                  <PriceFigure amount={given.total} />
                </dd>
              </div>
            </dl>
          ) : null}
        </div>

        {/* EVERY QUOTE TO THEM, newest first, each led by the boat's held
            picture where one is held. A PERSON WITH ONE OR TWO QUOTES HAS
            THEIR BOATS SHOWN LARGE (2026-09-24, the M2-close critique's
            finding 6: at 1920 the letter ended at 611 of 1,080). What fills
            the card is the boats they were quoted, drawn down the same
            ladder at the size a boat is looked at; with three or more they
            are rows again, because then the list is the thing to read. */}
        <div className="cu-leaf cu-leaf--quotes">
          <section
            className="cu-quotes"
            aria-label={`Quotes for ${nameSay}`}
            data-few={total > 0 && total <= 2 ? String(total) : undefined}
          >
            <h3 className="cu-quotes__head">
              <span>Their quotes</span>
              {total === 0 ? <span className="cu-quotes__count">{quotesSay(0)}</span> : null}
            </h3>
            {total > 0 ? (
              <ul className="cu-lineage__list" aria-label={`Every quote to ${nameSay}`}>
                {page.quotes.map((q) => (
                  <li key={q.id}>
                    <QuoteRow
                      quote={q}
                      maker={makerOf(q)}
                      row={rowsById.get(q.id)}
                      standing={standingOf(index, q.id)}
                      onOpen={onOpenQuote}
                      canOpen={canOpen}
                      now={now}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="cu-teach__a">
                No quote to them yet. A quote is written to them on the build, under “Who it is
                for”.
              </p>
            )}

            {/* A DRAFT THAT PRINTS OLDER DETAILS than this page now keeps —
                typed before they were kept, or written before a change — is
                said once, with the one press that brings it up to date. A
                given quote is never here: it keeps what it was given. */}
            {page.behind.length > 0 ? (
              <div className="cu-behind">
                <p className="cu-frozen">{behindSay(page.behind.map((q) => q.reference))}</p>
                <Button intent="primary" size="sm" onClick={() => onBringUp(page.key)}>
                  {page.behind.length === 1 ? 'Bring it up to date' : 'Bring them up to date'}
                </Button>
              </div>
            ) : null}
          </section>
        </div>

        <footer className="cu-letter__foot">
          <div className="cu-doors">
            <span className="cu-doors__act">
              {/* ONE NAME FOR ONE ACT, on all three states of this screen. */}
              <Button
                intent={filing ? 'veiled' : 'act'}
                aria-expanded={filing}
                onClick={() => setFiling(!filing)}
              >
                Add a customer
              </Button>
            </span>
            <Button intent="veiled" onClick={openBook}>
              Every customer
              <span className="cu-doors__count">{au(count)}</span>
            </Button>
            {register ? (
              <Button intent="veiled" size="sm" href={BOOK_AS_A_SHEET}>
                Edit everyone at once
              </Button>
            ) : null}
          </div>
          {filing ? (
            <FileForm
              register={register}
              nameId={nameId}
              people={people}
              sheetOpen
              onFile={onFile}
              onOpen={onOpen}
              onClose={() => setFiling(false)}
            />
          ) : null}
        </footer>
      </article>
    </div>
  )
}

/**
 * THE ONE EDITOR ON THIS SCREEN, and the only place a caret ever sits
 * on a customer's details. The original app's rule (`helmlogic-
 * original.md` §4, held by the critic on re-reading): Enter and the
 * *Done* control commit through `updateCell`, Escape cancels, and a
 * refusal stands where it was refused rather than in a toast — this
 * one hands the refusal up to the screen's own alarm line, which is
 * the same rule at this screen's scale.
 *
 * IT IS GIVEN A `key` BY EVERY CALLER, so moving from Phone to Email
 * remounts it and the box opens on the value it is about.
 */
function Editing({
  field,
  value,
  rowId,
  onChange,
  onDone,
}: {
  field: FieldDef | undefined
  value: string
  rowId: string
  onChange: (rowId: string, fieldId: string, value: string) => boolean
  onDone: () => void
}) {
  const [draft, setDraft] = useState(value)
  const inputId = `cu-edit-${field?.id ?? 'none'}`
  if (!field) return null

  const commit = (): void => {
    if (onChange(rowId, field.id, draft)) onDone()
  }

  return (
    <div className="cu-edit">
      <label className="cu-ask__lab" htmlFor={inputId}>
        {field.name}
      </label>
      <div className="cu-edit__row">
        <Input
          id={inputId}
          value={draft}
          onValueChange={setDraft}
          autoFocus
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commit()
            } else if (event.key === 'Escape') {
              event.preventDefault()
              onDone()
            }
          }}
        />
        <Button intent="veiled" size="sm" onClick={commit}>
          Done
        </Button>
        <Button intent="veiled" size="sm" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

/**
 * A VALUE THAT IS AN ACT — GOV.UK's summary list: *Change* beside a
 * value, *Add* where there is none, and never a placeholder printed as
 * a value.
 *
 * WHY THE PRINTED BLOCK DOES NOT USE THIS. A value and its act sit
 * together here, which is right for everything drawn on the dark floor:
 * the yard's note and the columns a dealer added themselves. The three
 * printed lines are on PAPER, and a *Change* button standing on a
 * customer's own sheet would be the one thing on that plate the
 * customer will never see — so those lines are drawn on the paper and
 * their acts stand off it, in the margin. The editor is the same
 * component either way.
 */
function Editable({
  field,
  value,
  rowId,
  onChange,
  as,
}: {
  field: FieldDef | undefined
  value: string
  rowId: string
  onChange: (rowId: string, fieldId: string, value: string) => boolean
  as: 'span' | 'p'
}) {
  const [editing, setEditing] = useState(false)
  if (!field) return null

  if (editing) {
    return (
      <Editing
        field={field}
        value={value}
        rowId={rowId}
        onChange={onChange}
        onDone={() => setEditing(false)}
      />
    )
  }

  const Tag = as
  const empty = value === ''
  return (
    <div className="cu-fact" data-as={as} data-empty={empty ? '' : undefined}>
      <Tag className="cu-fact__value">
        {empty ? <span className="cu-fact__absent">No {field.name.toLowerCase()}</span> : value}
      </Tag>
      <span className="cu-fact__act">
        <Button
          intent="veiled"
          size="sm"
          onClick={() => setEditing(true)}
          aria-label={`${empty ? 'Add' : 'Change'} ${field.name.toLowerCase()}`}
        >
          {empty ? 'Add' : 'Change'}
        </Button>
      </span>
    </div>
  )
}

/**
 * THE BOAT A QUOTE IS FOR, DOWN THE LADDER: the held photograph of the
 * exact boat the quote froze, where this repository ships one; else the
 * maker's own mark in white, with the words "no photograph held" under
 * it, so the mark says who made the boat and the words say what is not
 * here (`./pictures.ts`); else the words alone. Nothing stands in for a
 * photograph, and a mark is never drawn as one.
 */
function BoatArt({ quote, maker }: { quote: QuoteDef | undefined; maker: string | undefined }) {
  const held = heldCopy(quote?.subjectImage?.src)
  if (held) {
    return (
      <img
        className="cu-art__photo"
        src={held.src}
        alt=""
        width={held.width}
        height={held.height}
        decoding="async"
        loading="lazy"
      />
    )
  }
  const mark = markOf(maker)
  return (
    <span className="cu-art" data-marked={mark ? '' : undefined}>
      {mark ? (
        <img
          className="cu-art__mark"
          data-mark={mark.brand}
          src={mark.src}
          alt=""
          width={mark.width}
          height={mark.height}
          decoding="async"
        />
      ) : null}
      <span className="cu-art__say">no photograph held</span>
    </span>
  )
}

/**
 * ONE QUOTE ON A LETTER: the boat, down `BoatArt`'s ladder — the
 * no-photograph row is designed first, because about a quarter of
 * addresses are unheld — then the boat, the standing in a word, the day
 * and the total the register would print. It opens where the register
 * would open it.
 */
function QuoteRow({
  quote,
  maker,
  row,
  standing,
  onOpen,
  canOpen,
  now,
}: {
  quote: QuoteDef
  /** the register the boat is a row of, by its name, for the maker's mark */
  maker: string | undefined
  row: RegisterRow | undefined
  standing: 'draft' | 'given' | 'replaced'
  onOpen: (quote: QuoteDef) => void
  canOpen: boolean
  now: () => Date
}) {
  const age = daySaid(quoteDay(quote), localDay(now().toISOString()))
  /* the boat as a person says it (built-critique-m2-close-2.md): its name,
     then its material and colour on a line of their own, drawn as colour */
  const spoken = boatOfQuote(quote)
  const boat = spoken.say
  return (
    <Tile
      tone="room"
      shape="row"
      onSelect={() => onOpen(quote)}
      refusedBecause={canOpen ? undefined : NO_WAY_TO_OPEN}
      label={`${boat}, ${quote.reference}, ${STANDING_TITLE[standing].toLowerCase()}, ${age}`}
    >
      <span className="cu-quote" data-standing={standing}>
        <span className="cu-quote__pic">
          <BoatArt quote={quote} maker={maker} />
        </span>
        <span className="cu-quote__main">
          <span className="cu-quote__boat">{spoken.name}</span>
          {spoken.detail === '' ? null : (
            <span className="cu-quote__detail">
              <Swatches colour={spoken.colour} size="sm" />
              {spoken.detail}
            </span>
          )}
          <span className="cu-quote__facts">
            <span className="cu-quote__ref">{quote.reference}</span> ·{' '}
            <span className="cu-quote__standing">{STANDING_TITLE[standing]}</span> · {age}
            {row?.supersedes ? ` · replaces ${row.supersedes}` : ''}
            {row?.supersededBy ? ` · replaced by ${row.supersededBy}` : ''}
          </span>
        </span>
        <span className="cu-quote__money">
          {row === undefined || row.total === null ? (
            <span className="cu-quote__nofigure">{row?.insteadOfTotal ?? ''}</span>
          ) : (
            <PriceFigure amount={row.total} />
          )}
        </span>
      </span>
    </Tile>
  )
}
