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
  type RefObject,
} from 'react'
import { Button, Input, Kbd, PriceFigure, Tile, closesStage, isField, stageKeyOf } from '@/ui'
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
import { readRegister, type RegisterRow, type RegisterStateId } from '@/domain/quote/register'
import {
  STANDING_TITLE,
  customerHistory,
  indexQuotes,
  standingOf,
  type HistoryIndex,
} from '@/domain/quote/diary/history'
import {
  CUSTOMER_TABLE_ID,
  customerRegister,
  exactCustomer,
  matchCustomers,
  readCustomers,
  type CustomerRead,
} from '@/domain/people/customers'
import { groupByDescription } from '@/domain/people/form'
import {
  CHANGE_REACHES_NEXT_QUOTE,
  alreadyFiled,
  cellsFor,
  fieldsToFile,
  groupBook,
  lastTouched,
  letterShape,
  lineagesOf,
  openAs,
  orderBook,
  quoteDay,
  quotesSay,
  readBook,
  registerShape,
  unfiledNames,
  type BookGroup,
  type BookGrouping,
  type BookOrder,
  type BookRow,
  type UnfiledName,
} from '@/domain/people/book'
import { heldCopy } from './pictures'
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

   · THE BOOK DOES NOT EXIST UNTIL THE FIRST PERSON IS FILED, and
     the screen says so rather than drawing an empty table. The first
     filing is ONE step — `batch([createTable, addRow])` — with one
     Undo, which is the contract's "made once, undoable in one step,
     never made by anything except the button that names it".
   · THE BUILD TYPES A NAME AND DOES NOT FILE IT. `BUILD_TYPES_NOT_FILES`
     is the one constant that says so; the pile of names typed on
     quotes is listed here and each can be filed from here — a draft is
     then addressed to the row it made, and a given quote keeps what it
     was given, because the engine refuses to re-address one
     (`customerLink.test.ts`).
   · THE PICTURE ON A QUOTE ROW IS THE BOAT'S HELD CATALOGUE COPY, not
     a miniature of the A4 cover: see `./pictures.ts` for the critic's
     finding and the answer.
   · NO PERSON IS INVENTED. The empty state is the true state and it
     teaches.
   ============================================================ */

/** THE ONE SENTENCE ABOUT WHAT THE BUILD DOES NOT DO YET, kept as one
 *  constant so the pass that makes the build file into the book can
 *  retire it in one place. */
export const BUILD_TYPES_NOT_FILES =
  'The build’s “Who it is for” types a name onto the quote and does not file it in the book yet, so a name typed on a draft is filed from here — and the draft is then addressed to the person it makes.'

/** Said where a filing would happen, on a desk with no sheet. The book
 *  is a table on the sheet, so it cannot be read or made without one. */
export const NO_SHEET_FOR_A_BOOK =
  'No price file is open in this browser. The book is a table on that sheet, so it cannot be read or made until the Master Price File is loaded.'

export const NAME_NEEDED = 'A person needs a name before they can be filed.'

/** Said beside a given quote in the pile: the engine refuses to
 *  re-address one, and this says why that is right. */
export const GIVEN_KEEPS_ITS_NAME =
  'A given quote keeps what it was given, so it stays addressed by the typed name. The next quote can be addressed to the row this files.'

export const NOBODY_AT_THIS_ADDRESS =
  'No customer is filed at this address. The row may have been taken off the book, or the link came from another computer.'

/** Said where the press happened, when nothing handed this screen a
 *  way to a document. */
export const NO_WAY_TO_OPEN =
  'This screen was handed no way to open a document, so nothing was opened. A draft opens at /quote/$id and a given quote at /quote/$id/document.'

export const NO_WAY_TO_THE_PICKER =
  'This screen was handed no way to the picker, so nothing was started. The picker is at /quote/new.'

/** The address the book has as a sheet, which is B's best idea kept:
 *  a column a dealer adds there is on the letter the same minute. */
export const BOOK_AS_A_SHEET = `/data/${CUSTOMER_TABLE_ID}`

/** What the find field answers, quoted back — the register's own
 *  grammar for an empty find, in this book's words. */
export const nothingInTheBook = (query: string): string =>
  `Nothing in the book matches “${query.trim()}”. People are found by name, phone, email, address, or the yard’s note.`

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
  goHome?: () => void
  openTheFile?: () => void
  newQuote?: () => void
  /** one document, opened where it belongs: a draft where it is
   *  written, a given quote as the paper */
  openQuote?: (id: string, state: RegisterStateId) => void
  /** the clock, injected */
  now?: () => Date
}

/** The last thing that happened, and the way back from it. A filing
 *  from the pile is two writes on two stores — the row on the sheet
 *  and the address on the draft — so the step keeps both event ids
 *  and reverses both, the second first. */
interface Step {
  said: string
  sheet: { eventId: string } | null
  quote: { id: string; eventId: string } | null
  wasUndo: boolean
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
  order: arrivedOrder = 'register',
  group: arrivedGroup = 'none',
  file: arrivedFiling = false,
  onPosition,
  goHome,
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
  const people = useMemo(
    () => (register ? readCustomers(register, bookRows) : []),
    [register, bookRows],
  )
  const book = useMemo(
    () => (register ? readBook(register, bookRows, filed, index) : []),
    [register, bookRows, filed, index],
  )
  const pile = useMemo(() => unfiledNames(filed, index), [filed, index])
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
    : !register
      ? 'bare'
      : book.length === 0
        ? 'empty'
        : bookOpen
          ? 'book'
          : 'letter'

  /* THE SHAPE THE BOOK IS MADE WITH, minted once per visit: the form
     draws its columns and the first filing hands the same object to
     `createTable`, so the name typed lands under the Name column the
     table is made with and not under a second minting of it. */
  const shape = useMemo(() => registerShape(), [])
  const nameId = register ? (displayFieldOf(register)?.id ?? '') : (shape.fields?.[0]?.id ?? '')

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
      order: order === 'register' ? undefined : order,
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
   * FILE ONE PERSON. On the day there is no book this is ONE step —
   * the table and the row in a batch, one Undo — and every day after
   * it is a row. When the name came off a draft, the draft is then
   * addressed to the row through the quotes store, and the step keeps
   * both ways back.
   */
  const fileOne = useCallback(
    (name: string, cells: Record<string, string>, from?: UnfiledName): void => {
      if (!sheetOpen) {
        setRefused(NO_SHEET_FOR_A_BOOK)
        return
      }
      if (name.trim() === '') {
        setRefused(NAME_NEEDED)
        return
      }
      const rowId = newId()
      let command: CatalogueCommand
      let made = ''
      if (register) {
        command = addRow(CUSTOMER_TABLE_ID, cells, rowId)
      } else {
        command = batch([createTable(shape), addRow(CUSTOMER_TABLE_ID, cells, rowId)], {
          said: `${name.trim()} is filed, and the book was made to hold them.`,
        })
        made = ' The book is a table on the sheet now.'
      }
      const outcome = catalogueStore.getState().apply(command)
      if ('refused' in outcome) {
        setRefused(outcome.refused === '' ? null : outcome.refused)
        return
      }
      setRefused(null)
      let said = register ? `${name.trim()} is filed.${made}` : outcome.said
      let quote: Step['quote'] = null

      if (from?.addressable) {
        /* the context is read AFTER the row landed, so the freeze reads
           the row it is about — freeze.ts's own "one-line widening" */
        const ctx = makeCtx({ ...ctxFrom(catalogueStore.getState()), orgId: PACK_ORG_ID })
        const frozen = freezeCustomer(ctx, rowId)
        if (frozen) {
          const linked = quotesStore.getState().apply(from.quoteId, linkCustomer(frozen))
          if ('refused' in linked) {
            if (linked.refused !== '')
              said += ` ${from.reference} was not addressed to them: ${linked.refused}`
          } else {
            quote = { id: from.quoteId, eventId: linked.event.id }
            said += ` ${from.reference} is addressed to them.`
          }
        }
      }
      setStep({ said, sheet: { eventId: outcome.event.id }, quote, wasUndo: false })
      setFiling(false)
      /* a person filed by hand is opened; one filed from the pile stays
         where the pile is, with the cursor on the row it made */
      setWanted(rowId)
      if (!from) setBookOpen(false)
    },
    [register, shape, sheetOpen],
  )

  /** File a name off a quote, with the lines the document carries. */
  const filePile = useCallback(
    (one: UnfiledName): void => fileOne(one.name, cellsFor(nameId, one.name, one.contact), one),
    [fileOne, nameId],
  )

  /** ONE CELL ON THE LETTER, through the sheet's own command. */
  const changeCell = useCallback((rowId: string, fieldId: string, value: string): boolean => {
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
    setRefused(null)
    setStep({
      said: `${outcome.said}. ${CHANGE_REACHES_NEXT_QUOTE}`,
      sheet: { eventId: outcome.event.id },
      quote: null,
      wasUndo: false,
    })
    return true
  }, [])

  const goBack = useCallback(() => {
    if (!step) return
    const saids: string[] = []
    let sheet = step.sheet
    let quote = step.quote
    const refuse = (said: string): void => {
      setRefused(said === '' ? null : said)
    }
    if (step.wasUndo) {
      /* forward again, in the order the act ran: the sheet, then the draft */
      if (sheet) {
        const out = catalogueStore.getState().redo()
        if ('refused' in out) return refuse(out.refused)
        saids.push(out.said)
        sheet = { eventId: out.event.id }
      }
      if (quote) {
        const out = quotesStore.getState().redo(quote.id)
        if ('refused' in out) return refuse(out.refused)
        saids.push(out.said)
        quote = { id: quote.id, eventId: out.event.id }
      }
    } else {
      /* back, the second write first, each pinned to its own event */
      if (quote) {
        const out = quotesStore.getState().undo(quote.id, quote.eventId)
        if ('refused' in out) return refuse(out.refused)
        saids.push(out.said)
        quote = { id: quote.id, eventId: out.event.id }
      }
      if (sheet) {
        const out = catalogueStore.getState().undo(sheet.eventId)
        if ('refused' in out) return refuse(out.refused)
        saids.push(out.said)
        sheet = { eventId: out.event.id }
      }
    }
    setRefused(null)
    setStep({ said: saids.join(' '), sheet, quote, wasUndo: !step.wasUndo })
  }, [step])

  const startOne = useCallback(() => {
    if (!newQuote) {
      setRefused(NO_WAY_TO_THE_PICKER)
      return
    }
    newQuote()
  }, [newQuote])

  /* ============================================================
     THE KEYBOARD — the Linear vocabulary, bound to the book's grid and
     to the letter, never to the window (WCAG 2.2 SC 2.1.4's third
     exemption), and each key printed where its act is.
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
    if (key === 'ArrowDown' || key === 'j' || key === 'J') {
      event.preventDefault()
      move(1)
    } else if (key === 'ArrowUp' || key === 'k' || key === 'K') {
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
    } else if (key === '/') {
      event.preventDefault()
      field.current?.focus()
    } else if (key === 'n' || key === 'N') {
      event.preventDefault()
      setFiling((was) => !was)
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
    if (key === '/') {
      event.preventDefault()
      field.current?.focus()
    } else if (key === 'n' || key === 'N') {
      event.preventDefault()
      setFiling((was) => !was)
    } else if (key === 'b' || key === 'B') {
      event.preventDefault()
      openBook()
    } else if (key === 'Escape' && closesStage(stageKeyOf(event.nativeEvent))) {
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
  const columns = register ? register.fields.length : 0

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
            <span className="cu-find__key">
              <Kbd>/</Kbd>
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
          ) : register ? (
            <p className="cu-stamp-line">
              <b>{au(book.length)}</b> {book.length === 1 ? 'person' : 'people'} in the book
              {pile.length > 0
                ? ` · ${au(pile.length)} ${pile.length === 1 ? 'name' : 'names'} typed on quotes, not filed`
                : ''}
            </p>
          ) : (
            <p className="cu-stamp-line">
              No book yet
              {pile.length > 0
                ? ` · ${au(pile.length)} ${pile.length === 1 ? 'name' : 'names'} typed on quotes`
                : ''}
            </p>
          )}
          <p className="cu-stamp-line cu-stamp-file">
            {register
              ? `A table on the sheet · ${register.name} · ${au(columns)} columns`
              : sheetOpen
                ? 'Made as a table on the Master Price File sheet the day the first person is filed'
                : 'No price file is open in this browser, so there is no sheet for a book to be on'}
          </p>
        </div>

        {goHome ? (
          <div className="cu-head__back">
            <Button intent="veiled" onClick={goHome}>
              Home
            </Button>
          </div>
        ) : null}
      </header>

      {/* WHAT THE LAST ACT SAID, AND THE WAY BACK FROM IT — under the
          head, in its own track, pinned to the event: the configurator's
          rail head and never a toast. */}
      {step ? (
        <output className="cu-step" data-testid="last-step">
          <span className="cu-step__said">{step.said}</span>
          <Button intent="veiled" size="sm" onClick={goBack}>
            {step.wasUndo ? 'Put it back' : 'Undo'}
          </Button>
        </output>
      ) : null}

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
              <p className="cu-found__say">
                {au(found.length)} of {au(people.length)} match “{query.trim()}” · <Kbd>Enter</Kbd>{' '}
                opens the first
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
            : `${au(shown.length)} of ${au(book.length)} match “${query.trim()}”. A name that starts with it comes first; the rest keep the book’s order.`}
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
          pile={pile}
          filing={filing || mode === 'bare'}
          onFile={fileOne}
          onFilePile={filePile}
          onOpen={openLetter}
          openTheFile={openTheFile}
          startOne={startOne}
          canStart={Boolean(newQuote)}
          setFiling={setFiling}
        />
      ) : mode === 'book' ? (
        <Book
          groups={groups}
          narrowed={narrowed}
          cursor={cursor}
          order={order}
          group={group}
          filing={filing}
          register={register!}
          nameId={nameId}
          people={people}
          pile={pile}
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
          onFilePile={filePile}
        />
      ) : (
        <Letter
          ref={letter}
          register={register!}
          nameId={nameId}
          row={bookRows.find((r) => r.id === subjectId)}
          person={people.find((p) => p.rowId === subjectId)}
          missing={missing}
          count={book.length}
          quotes={filed}
          index={index}
          rowsById={rowsById}
          pile={pile}
          people={people}
          filing={filing}
          now={now}
          onKeyDown={onLetterKey}
          onChange={changeCell}
          onOpenQuote={openIt}
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
 * NO BOOK, OR A BOOK WITH NOBODY IN IT. Both are honest states and
 * neither draws an empty table: Atlassian's rule (`empty/atlassian-
 * empty-state-writing.png`) is the reason and where to go next, in
 * two sentences, and Shopify's is who fills a customer list — the
 * sale, with "by hand" as the alternative. Here the sale does not file
 * yet (`BUILD_TYPES_NOT_FILES`), so the names it typed are the pile
 * beneath, each one an act.
 */
function Bare({
  made,
  sheetOpen,
  status,
  register,
  nameId,
  people,
  pile,
  filing,
  onFile,
  onFilePile,
  onOpen,
  openTheFile,
  startOne,
  canStart,
  setFiling,
}: {
  made: boolean
  sheetOpen: boolean
  status: string
  register: EntityDef | undefined
  nameId: string
  people: readonly CustomerRead[]
  pile: readonly UnfiledName[]
  filing: boolean
  onFile: (name: string, cells: Record<string, string>) => void
  onFilePile: (one: UnfiledName) => void
  onOpen: (rowId: string) => void
  openTheFile?: () => void
  startOne: () => void
  canStart: boolean
  setFiling: (open: boolean) => void
}) {
  return (
    <div className="cu-body" data-mode={made ? 'empty' : 'bare'}>
      <section className="cu-letter cu-letter--teach" aria-label="The book">
        <p className="cu-letter__eyebrow">The book</p>
        <h2 className="cu-teach__head">
          {made ? 'The book is made, and nobody is in it yet.' : 'Nobody is filed yet.'}
        </h2>

        <div className="cu-teach__block">
          <p className="cu-teach__q">What a customer is here</p>
          <p className="cu-teach__a">
            A row in a book that is a table on the sheet: a <b>name</b>, a <b>phone</b>, an{' '}
            <b>email</b> and an <b>address</b>, each printed on a quote exactly as it is written
            here — and a <b>note for the yard</b> that never is.
          </p>
        </div>
        <div className="cu-teach__block">
          <p className="cu-teach__q">Why it is empty today</p>
          <p className="cu-teach__a">
            {made
              ? 'Every row was taken off, or the book was made and nobody has been filed in it since. Nothing is invented to fill it.'
              : 'No quote has been addressed to a filed person, and the book itself is not made until the first one is.'}{' '}
            {BUILD_TYPES_NOT_FILES}
          </p>
        </div>
        <div className="cu-teach__block">
          <p className="cu-teach__q">What to do</p>
          <p className="cu-teach__a">
            File a person below
            {made ? '' : ' — the first filing makes the book, in one step, with Undo'}; or start a
            quote, address it, and file the name from here.
          </p>
        </div>

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

        {pile.length > 0 ? <Pile pile={pile} onFile={onFilePile} sheetOpen={sheetOpen} /> : null}

        {filing ? (
          <FileForm
            register={register}
            nameId={nameId}
            people={people}
            first={!made && !register}
            sheetOpen={sheetOpen}
            onFile={onFile}
            onOpen={onOpen}
            onClose={made ? () => setFiling(false) : undefined}
          />
        ) : (
          <div className="cu-teach__door">
            <Button intent="act" aria-label="File a customer" onClick={() => setFiling(true)}>
              File a customer
              <Kbd>N</Kbd>
            </Button>
          </div>
        )}

        <div className="cu-doors">
          <Button
            intent="veiled"
            onClick={startOne}
            refusedBecause={canStart ? undefined : NO_WAY_TO_THE_PICKER}
          >
            Start a quote
          </Button>
          <p className="cu-teach__foot">
            No photograph stands on this screen: a picture belongs to the exact boat on a quote, and
            appears on a letter beside the quote it depicts.
          </p>
        </div>
      </section>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* The pile: names typed on quotes, with nobody filed behind   */
/* ---------------------------------------------------------- */

function Pile({
  pile,
  onFile,
  sheetOpen,
}: {
  pile: readonly UnfiledName[]
  onFile: (one: UnfiledName) => void
  sheetOpen: boolean
}) {
  return (
    <section className="cu-pile" aria-label="Names typed on quotes, not filed">
      <p className="cu-teach__q">
        {au(pile.length)} {pile.length === 1 ? 'name' : 'names'} typed on quotes, with nobody filed
        behind {pile.length === 1 ? 'it' : 'them'}
      </p>
      <ul className="cu-pile__list">
        {pile.map((one) => (
          <li className="cu-pile__row" key={one.quoteId}>
            <span className="cu-pile__who">
              <span className="cu-pile__name">{one.name}</span>
              <span className="cu-pile__facts">
                {one.reference} · {STANDING_TITLE[one.standing].toLowerCase()} · {one.day}
                {one.contact.length > 0 ? ` · ${one.contact.join(' · ')}` : ''}
              </span>
            </span>
            <span className="cu-pile__act">
              <Button
                intent="veiled"
                size="sm"
                onClick={() => onFile(one)}
                refusedBecause={sheetOpen ? undefined : NO_SHEET_FOR_A_BOOK}
              >
                File {one.name}
              </Button>
              <span className="cu-pile__say">
                {one.addressable
                  ? `Files them with the lines on ${one.reference}, and addresses that draft to them.`
                  : GIVEN_KEEPS_ITS_NAME}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------------------------------------------------------- */
/* The filing form, with the possible duplicate under it       */
/* ---------------------------------------------------------- */

/**
 * ONE FORM ON BOTH DAYS. Its columns are the register's own where
 * there is one and the shape the register will be made with where
 * there is not (`fieldsToFile`), captioned by `groupByDescription` so
 * three columns that say one sentence say it once.
 *
 * THE POSSIBLE DUPLICATE IS UNDER THE FORM AND THE ACT STAYS LIVE
 * (`deep/linear-similar-issues-now-scrolled.png`). As a name is typed
 * the matching rows appear beneath the fields, each an act that opens
 * them; the exact hit says "A Sarah Jones is already filed." with
 * *Open* and *File another* beside it — Apple's *Keep Both* as the
 * default, in two buttons and no modal.
 */
function FileForm({
  register,
  nameId,
  people,
  first,
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
  /** this filing makes the book */
  first: boolean
  sheetOpen: boolean
  onFile: (name: string, cells: Record<string, string>) => void
  onOpen: (rowId: string) => void
  onClose?: () => void
}) {
  const fields = useMemo(() => fieldsToFile(register, nameId), [register, nameId])
  const groups = useMemo(() => groupByDescription(fields), [fields])
  const [typed, setTyped] = useState<Record<string, string>>({})
  const [another, setAnother] = useState(false)

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
  }

  /* THE REFUSAL, AND WHERE ITS SENTENCE ALREADY IS. A name already in
     the book is refused BY the block drawn under the fields, not by a
     second copy of the same sentence under the act: `Button`'s own
     `refusedBy` exists for exactly this, and its comment holds the
     measurement — "one reason shared belongs above, not copied". The
     other two refusals have no block of their own, so they carry their
     sentence. */
  const twinSaidAt = 'cu-twin-said'
  const refusal = !sheetOpen ? NO_SHEET_FOR_A_BOOK : name === '' ? NAME_NEEDED : undefined
  const refusedByTwin = refusal === undefined && twin !== undefined && !another

  return (
    <form
      className="cu-file"
      aria-label={first ? 'File the first customer' : 'File a customer'}
      onSubmit={(event) => {
        event.preventDefault()
        if (refusal === undefined && !refusedByTwin) submit()
      }}
    >
      <p className="cu-teach__q">{first ? 'File the first customer' : 'File a customer'}</p>
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

      {/* THE POSSIBLE DUPLICATES, under the fields, filing still live */}
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
              File another {name}
            </Button>
          </div>
        </div>
      ) : null}
      {alike.length > 0 ? (
        <div className="cu-alike">
          <p className="cu-alike__say">Already in the book, and possibly the same person</p>
          <ul className="cu-alike__list">
            {alike.map((c) => (
              <li key={c.rowId}>
                <Button intent="veiled" size="sm" onClick={() => onOpen(c.rowId)}>
                  Open {c.name === '' ? 'the unnamed row' : c.name}
                  {c.contact[0] ? <span className="cu-found__contact">{c.contact[0]}</span> : null}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="cu-file__acts">
        <Button
          intent="act"
          type="submit"
          refusedBecause={refusal}
          refusedBy={refusedByTwin ? twinSaidAt : undefined}
        >
          {first ? 'File the first customer' : another ? `File another ${name}` : 'File them'}
        </Button>
        <p className="cu-file__say">
          {first
            ? 'This makes the book: a table called Customers on the sheet, with these five columns, and this person as its first row. One step, with Undo.'
            : 'One row on the book, with Undo. Their next quote can be addressed to them.'}
        </p>
        {onClose ? (
          <Button intent="veiled" size="sm" onClick={onClose}>
            Close
            <Kbd>Esc</Kbd>
          </Button>
        ) : null}
      </div>
    </form>
  )
}

/* ---------------------------------------------------------- */
/* The book: one search, no column head, no pager             */
/* ---------------------------------------------------------- */

function Book({
  groups,
  narrowed,
  cursor,
  order,
  group,
  filing,
  register,
  nameId,
  people,
  pile,
  list,
  rowsRef,
  onKeyDown,
  onPoint,
  onOpen,
  setOrder,
  setGroup,
  setFiling,
  onFile,
  onFilePile,
}: {
  groups: BookGroup[]
  narrowed: boolean
  cursor: string
  order: BookOrder
  group: BookGrouping
  filing: boolean
  register: EntityDef
  nameId: string
  people: readonly CustomerRead[]
  pile: readonly UnfiledName[]
  list: RefObject<HTMLDivElement | null>
  rowsRef: RefObject<Map<string, HTMLDivElement>>
  onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void
  onPoint: (rowId: string) => void
  onOpen: (rowId: string) => void
  setOrder: (order: BookOrder) => void
  setGroup: (group: BookGrouping) => void
  setFiling: (open: boolean) => void
  onFile: (name: string, cells: Record<string, string>) => void
  onFilePile: (one: UnfiledName) => void
}) {
  const total = groups.reduce((n, g) => n + g.rows.length, 0)
  return (
    <div className="cu-body" data-mode="book">
      <div className="cu-ledger">
        <div
          className="cu-list"
          ref={list}
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
              aria-label={g.title === '' ? 'Everyone in the book' : g.title}
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
                  {narrowed ? 'Nobody in the book matches.' : 'Nobody is in the book yet.'}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* THE ACT IS THE LAST ROW OF THE BOOK, in the flow and never a
            floating bar, with the two pressed controls beside it and
            the vocabulary printed on the same line. */}
        <div className="cu-act">
          <span className="cu-act__who">
            <Button
              intent={filing ? 'veiled' : 'act'}
              aria-label="File a customer"
              onClick={() => setFiling(!filing)}
            >
              File a customer
              <Kbd>N</Kbd>
            </Button>
          </span>
          <div className="cu-orders" role="group" aria-label="How the book is read">
            <Button
              intent="veiled"
              size="sm"
              aria-pressed={order === 'name'}
              onClick={() => setOrder(order === 'name' ? 'register' : 'name')}
            >
              A to Z
            </Button>
            <Button
              intent="veiled"
              size="sm"
              aria-pressed={group === 'desk'}
              onClick={() => setGroup(group === 'desk' ? 'none' : 'desk')}
            >
              At the desk
            </Button>
            <span className="cu-orders__say">
              {order === 'name' ? 'A to Z' : 'In the order they were filed'}
              {group === 'desk' ? ', by what each is doing next' : ''}
            </span>
          </div>
          <p className="cu-keys">
            <Kbd>J</Kbd>
            <Kbd>K</Kbd> move · <Kbd>Enter</Kbd> opens · <Kbd>/</Kbd> finds · <Kbd>Esc</Kbd> back to
            the letter
          </p>
        </div>

        {filing ? (
          <FileForm
            register={register}
            nameId={nameId}
            people={people}
            first={false}
            sheetOpen
            onFile={onFile}
            onOpen={onOpen}
            onClose={() => setFiling(false)}
          />
        ) : null}

        {pile.length > 0 ? <Pile pile={pile} onFile={onFilePile} sheetOpen /> : null}
      </div>
    </div>
  )
}

function BookLine({
  row,
  on,
  onPoint,
  onOpen,
  hold,
}: {
  row: BookRow
  on: boolean
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
      onClick={() => onPoint(row.rowId)}
      onDoubleClick={() => onOpen(row.rowId)}
    >
      <span className="cu-cell cu-cell--name" role="gridcell">
        {row.name === '' ? <span className="cu-unnamed">Unnamed</span> : row.name}
      </span>
      <span className="cu-cell cu-cell--contact" role="gridcell">
        {row.contact}
      </span>
      <span className="cu-cell cu-cell--quotes" role="gridcell">
        {quotesSay(row.quotes)}
      </span>
      <span className="cu-cell cu-cell--latest" role="gridcell">
        {row.latest ? `${STANDING_TITLE[row.latest.standing]} · ${row.latest.reference}` : ''}
      </span>
      <span className="cu-cell cu-cell--day" role="gridcell">
        {row.latest ? row.latest.day : ''}
      </span>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* The letter                                                 */
/* ---------------------------------------------------------- */

function Letter({
  ref,
  register,
  nameId,
  row,
  person,
  missing,
  count,
  quotes,
  index,
  rowsById,
  pile,
  people,
  filing,
  now,
  onKeyDown,
  onChange,
  onOpenQuote,
  canOpen,
  openBook,
  setFiling,
  onFile,
  onOpen,
}: {
  ref: RefObject<HTMLElement | null>
  register: EntityDef
  nameId: string
  row: RowData | undefined
  person: CustomerRead | undefined
  missing: boolean
  count: number
  quotes: readonly QuoteDef[]
  index: HistoryIndex
  rowsById: ReadonlyMap<string, RegisterRow>
  pile: readonly UnfiledName[]
  people: readonly CustomerRead[]
  filing: boolean
  now: () => Date
  onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void
  onChange: (rowId: string, fieldId: string, value: string) => boolean
  onOpenQuote: (quote: QuoteDef) => void
  canOpen: boolean
  openBook: () => void
  setFiling: (open: boolean) => void
  onFile: (name: string, cells: Record<string, string>) => void
  onOpen: (rowId: string) => void
}) {
  const shape = useMemo(() => letterShape(register), [register])
  const captions = useMemo(
    () => groupByDescription(register.fields.filter((f) => f.type !== 'formula')),
    [register],
  )
  const history = useMemo(
    () => (row ? customerHistory(row.id, quotes, index) : null),
    [row, quotes, index],
  )
  const lineages = useMemo(() => (history ? lineagesOf(history, index) : []), [history, index])
  /* WHICH LINE OF THE PRINTED BLOCK IS BEING TYPED INTO, by column id.
     One at a time, because there is one editor and it stands under the
     plate rather than on it. */
  const [editing, setEditing] = useState<string | null>(null)

  if (!row || !person) {
    return (
      <div className="cu-body" data-mode="letter">
        <section className="cu-letter" aria-label="No customer at this address">
          <p className="cu-letter__eyebrow">The book</p>
          <h2 className="cu-teach__head">{missing ? NOBODY_AT_THIS_ADDRESS : 'Nobody to show.'}</h2>
          <div className="cu-doors">
            <Button intent="veiled" onClick={openBook}>
              Everyone in the book
              <Kbd>B</Kbd>
            </Button>
          </div>
        </section>
      </div>
    )
  }

  const said = (f: FieldDef | undefined): string => {
    if (!f) return ''
    const v = row.values[f.id]
    return v === null || v === undefined ? '' : String(v).trim()
  }
  const captionFor = (f: FieldDef | undefined): string =>
    f ? (captions.find((g) => g.fields.some((x) => x.id === f.id))?.say ?? '') : ''
  const name = said(shape.name)
  const printed = [shape.phone, shape.email, shape.address].filter((f): f is FieldDef => Boolean(f))
  const printedSay = captionFor(printed[0])
  const nameSay = name === '' ? 'Nobody has named this row yet' : name
  /* THE LINES THE PAPER CARRIES, READ BY THE FUNCTION THE FREEZE READS.
     `person` is `readCustomer(register, row)` and `freezeCustomer` calls
     exactly that before copying `contact` onto a document — so this is
     not a second reading of the row, it is THE reading, drawn early. */
  const block = person.contact
  const givenSum = history?.givenTotal ?? 0
  const heldTotal = quotes.length

  return (
    <div className="cu-body" data-mode="letter">
      {/* THE LETTER IS A FOCUSABLE REGION, so its three keys are live
          only while a person is in it (WCAG 2.2 SC 2.1.4, third
          exemption) and the legend at its foot brightens when they are. */}
      <article
        className="cu-letter"
        ref={ref as RefObject<HTMLElement>}
        tabIndex={0}
        aria-label={`${nameSay}, in the book`}
        onKeyDown={onKeyDown}
      >
        <p className="cu-letter__eyebrow">
          In the book · {quotesSay(history?.all.length ?? 0)} · filed {localDay(row.createdAt)}
          {row.updatedAt !== row.createdAt ? ` · changed ${localDay(row.updatedAt)}` : ''}
        </p>

        {/* ============================================================
            THE BLOCK A QUOTE PRINTS, ON PAPER.

            THIS IS THE DIRECTION, AND IT IS OWNED AS AN INVENTION. The
            critic's finding on C was that its exclusive
            (`deep/stripe-customer-page-3.png`) is a text page showing
            no shape, and that the board had to be re-sourced or the
            composition owned. It is owned, here, and anchored to
            something stronger than a frame: the app's OWN document.
            `src/screens/document/Document.tsx` prints the customer as
            `Prepared for`, the name, then each line of
            `FrozenCustomer.contact` — and `freezeCustomer` fills that
            array from `readCustomer`, which reads
            `CUSTOMER_CONTACT_FIELDS` in order and drops the blanks.
            `printedBlock` below reads the SAME function on the SAME
            row, so the block on this paper and the block on the A4
            cannot disagree without a test going red.

            IT IS NOT A SECOND RENDERER AND IT IS NOT THE A4 COVER. The
            sweep's C drew "a miniature of its own A4 cover", which the
            critic correctly says must be the document's own DOM scaled
            or nothing; a three-page A4 scaled into every row of a
            letter is too heavy for a row, so the quote rows lead with
            the boat's held picture instead (see `./pictures.ts`). What
            is drawn here is not the cover: it is five lines of a
            person's own record, on the plate the document is printed
            on, so that the dealer reads them the way the customer
            will. "Only C shows the dealer the typo before the customer
            does" is the critic's own best sentence about this board,
            and a typo is only visible where it will be read.

            THE PAPER IS THE CUSTOMER'S AND THE ROOM IS THE DEALER'S —
            the document screen's own rule, kept literally. Nothing the
            customer will not see is on the plate: the acts stand off it
            in the margin below, the yard's note is a band on the dark
            floor, and a column the dealer added themselves is a row on
            the floor too. An absent line does not print "No phone" on
            the paper, because a quote does not print that either — it
            prints nothing, which is exactly what the plate shows, with
            *Add phone* waiting in the margin (`deep/govuk-summary-
            list.png`: an absent value is an act, never a placeholder). */}
        <section className="cu-printed" aria-label="What a quote prints">
          <div className="cu-paper">
            <p className="cu-paper__lab">Prepared for</p>
            <h2 className="cu-paper__name" data-empty={name === '' ? '' : undefined}>
              {name === '' ? 'Nobody has named this row yet' : name}
            </h2>
            {block.map((line) => (
              <p className="cu-paper__line" key={line}>
                {line}
              </p>
            ))}
            {block.length === 0 ? (
              <p className="cu-paper__none">
                {printed.length === 0
                  ? 'This book has none of the three printed columns any more.'
                  : 'Nothing else is filled in, so a quote to them prints the name alone.'}
              </p>
            ) : null}
          </div>

          <div className="cu-margin">
            <p className="cu-cap">
              {printedSay === '' ? 'Printed on a quote, as it is written here.' : printedSay}
            </p>
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
            The original app's rule holds inside it (`helmlogic-original.md`
            §4): Enter commits, Escape cancels, and a refusal stands under
            the field rather than in a toast. */}
        {editing !== null ? (
          <Editing
            key={editing}
            field={register.fields.find((f) => f.id === editing)}
            value={said(register.fields.find((f) => f.id === editing))}
            rowId={row.id}
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
              rowId={row.id}
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
                    rowId={row.id}
                    onChange={onChange}
                    as="span"
                  />
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {history && history.addressedAs.some((n) => n !== name) ? (
          <p className="cu-frozen">
            Their quotes carry the name as it was when each was written:{' '}
            {history.addressedAs.filter((n) => n !== name).join(', ')}.
          </p>
        ) : null}

        {/* EVERY QUOTE ADDRESSED TO THEM, by lineage, latest first, each
            led by the boat's held picture where one is held. */}
        <section className="cu-quotes" aria-label={`Quotes addressed to ${nameSay}`}>
          <h3 className="cu-quotes__head">
            <span>Quotes</span>
            <span className="cu-quotes__count">
              {history ? (
                <>
                  {quotesSay(history.all.length)}
                  {history.given.length > 0 ? (
                    <>
                      {' '}
                      · {au(history.given.length)} given, <PriceFigure amount={givenSum} />
                    </>
                  ) : null}
                </>
              ) : null}
            </span>
          </h3>
          {lineages.length === 0 ? (
            <p className="cu-teach__a">
              No quote is addressed to this row yet. A quote is addressed on the build, under “Who
              it is for”
              {pile.length > 0
                ? `; ${au(pile.length)} ${pile.length === 1 ? 'quote carries a typed name' : 'quotes carry typed names'} with nobody filed behind ${pile.length === 1 ? 'it' : 'them'}, in the book`
                : ''}
              .{heldTotal === 0 ? ' Nothing is filed in this browser yet.' : ''}
            </p>
          ) : (
            <ul className="cu-lineages">
              {lineages.map((line) => (
                <li className="cu-lineage" key={line.rootId}>
                  {line.quotes.length > 1 ? (
                    <p className="cu-lineage__head">
                      {au(line.quotes.length)} versions of one conversation, latest first
                    </p>
                  ) : null}
                  <ul className="cu-lineage__list">
                    {line.quotes.map((q) => (
                      <li key={q.id}>
                        <QuoteRow
                          quote={q}
                          row={rowsById.get(q.id)}
                          standing={standingOf(index, q.id)}
                          onOpen={onOpenQuote}
                          canOpen={canOpen}
                          now={now}
                        />
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="cu-letter__foot">
          <div className="cu-doors">
            <Button intent="veiled" onClick={openBook}>
              Everyone in the book
              <span className="cu-doors__count">{au(count)}</span>
              <Kbd>B</Kbd>
            </Button>
            {/* ONE NAME FOR ONE ACT, on all three states of this screen.
                It read "File another" here and "File a customer" on the
                book and the empty state, which is three names for one
                press on one screen — the thing "i can't stress enough
                how easy this system has to be to use" is against. */}
            <Button intent={filing ? 'veiled' : 'act'} onClick={() => setFiling(!filing)}>
              File a customer
              <Kbd>N</Kbd>
            </Button>
            <Button intent="veiled" size="sm" href={BOOK_AS_A_SHEET}>
              Open the book as a sheet
            </Button>
          </div>
          <p className="cu-keys">
            <Kbd>/</Kbd> finds · <Kbd>B</Kbd> everyone · <Kbd>N</Kbd> files · <Kbd>Esc</Kbd> clears
          </p>
          {filing ? (
            <FileForm
              register={register}
              nameId={nameId}
              people={people}
              first={false}
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
          <Kbd>Enter</Kbd>
        </Button>
        <Button intent="veiled" size="sm" onClick={onDone}>
          Cancel
          <Kbd>Esc</Kbd>
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
 * ONE QUOTE ON A LETTER: the boat's held picture where one is held and
 * the words "no picture held" where none is — the no-picture row is
 * designed first, because about a quarter of addresses are unheld —
 * then the boat, the standing in a word, the day and the total the
 * register would print. It opens where the register would open it.
 */
function QuoteRow({
  quote,
  row,
  standing,
  onOpen,
  canOpen,
  now,
}: {
  quote: QuoteDef
  row: RegisterRow | undefined
  standing: 'draft' | 'given' | 'replaced'
  onOpen: (quote: QuoteDef) => void
  canOpen: boolean
  now: () => Date
}) {
  const held = heldCopy(quote.subjectImage?.src)
  const day = quoteDay(quote)
  const age = localDay(now().toISOString()) === day ? 'today' : day
  return (
    <Tile
      tone="room"
      shape="row"
      onSelect={() => onOpen(quote)}
      refusedBecause={canOpen ? undefined : NO_WAY_TO_OPEN}
      label={`${quote.subjectLabel}, ${quote.reference}, ${STANDING_TITLE[standing].toLowerCase()}, ${age}`}
    >
      <span className="cu-quote" data-standing={standing}>
        <span className="cu-quote__pic">
          {held ? (
            <img
              className="cu-quote__img"
              src={held.src}
              alt=""
              width={held.width}
              height={held.height}
              decoding="async"
              loading="lazy"
            />
          ) : (
            <span className="cu-quote__nopic">no picture held</span>
          )}
        </span>
        <span className="cu-quote__main">
          <span className="cu-quote__boat">{quote.subjectLabel}</span>
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
