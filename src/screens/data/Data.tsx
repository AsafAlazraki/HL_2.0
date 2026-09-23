/* ============================================================
   TWO LINT RULES TURNED OFF FOR THIS FILE, for the reasons the quotes
   register gives at length in `src/screens/quotes/Quotes.tsx` and
   which hold here word for word: the density ruler reads
   `[role="row"]` off the page, and a ledger whose rows are `<tr>`s
   laid out as CSS grids announces less than these divs do; and the
   grid uses the APG `aria-activedescendant` pattern — ONE tab stop
   that owns the whole keyboard vocabulary — rather than a key handler
   per row, which is the roving-tabindex pattern this deliberately is
   not.
   ============================================================ */
/* eslint-disable jsx-a11y/prefer-tag-over-role, jsx-a11y/click-events-have-key-events */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from 'react'
import {
  Button,
  Dialog,
  DialogClose,
  Field,
  Input,
  Kbd,
  Select,
  closesStage,
  isField,
  stageKeyOf,
} from '@/ui'
import { TABLE_KINDS, type AccentKey, type TableKind } from '@/domain/model'
import { createTable } from '@/domain/catalogue/commands'
import { CUSTOMER_TABLE_ID } from '@/domain/people/customers'
import { FIND_FIELD_AT } from '@/domain/quote/find'
import {
  DESK_PLACE,
  FILED_AT_THIS_DESK,
  REGISTER_WORD,
  NOTHING_CALLED,
  kindWord,
  matchesTable,
  pageOf,
  readTableRegister,
  type PagePairing,
  type Plate,
  type RegisterRow,
  type TableFacts,
  type TablePage,
} from '@/domain/modules/register'
import { useCatalogue } from '@/app/useStores'
import { catalogue } from '@/state/catalogue'
import { markFor, type MarkChoice } from '@/screens/home/ledgers'
import { packedOn, provenanceOfSheet } from './file'
import './data.css'

/* ============================================================
   DATA — direction C, "The showpiece row", from
   docs/research/refs/data/notes.md §5, ASSIGNED for this round: the
   critic found that the obvious picks across the five Cockpit sweeps
   would stamp one list-left, detail-right shape on four screens
   (critique-m2.md §3), and the owner asked for this screen in
   capitals — "I WANT THE DATA STUFF AS ITS OWN MENU ITEM. NOT UNDER
   ADMIN!" — so it is its own door at /data. Provisional until the
   owner looks (docs/SCREENS.md).

   WHAT THIS SCREEN DOES THAT NO OTHER DOES: it shows the dealer what
   their file HOLDS, grouped the way they think — Stacer with its
   motor, trailer, fit and parts pairings hanging off it, not 53 rows
   — with every table's count, its kind in words and where it came
   from, and opens any one into the sheet. Home counts the file; the
   sheet works one table; this is the REGISTER of the tables — which
   answers the one question the critic said the sweep left open
   (critique-m2.md §4): of gallery, register and record, this screen
   is the register; the plates are the one gallery-like thing on it,
   and the page that opens beside the rows is its record.

   THE COMPOSITION. Seven paper plates across the top, one per boat
   table, each the maker's own mark large — "I want the logo to be the
   showpiece thing", answered inside the Cockpit — with what it holds
   under the mark and, under the plate, one line per pairing list
   hanging off it in words a dealer says: `Yamaha Outboards · 2,519
   pairings`, ticked in the motor kind's ink, never the word for the
   mechanism. Under the plates, every other base table as a row under
   its place's margin head; a row says its kind, what one row of it is
   in the table's own noun (`209 motors`, `18 rates`), how many boats
   pair with it, and the workbook it came from. Pressing a plate or a
   row opens that table's page beside the rows — A's column view, kept
   as what a press does — with its provenance in full, the file's one
   sha256 and fingerprint labelled, its pairings as rows, and the act
   that opens the sheet. At 1920 the plates carry their whole page and
   a brand needs none (B's ledger: everything visible, no pane).

   ── THE CRITIC'S FINDINGS, ANSWERED ──────────────────────────
   · THE PLATE ROW IS DRAWN FROM NO FRAME. Owned as an invention in
     `data.css`'s header, which names the two frames that inform it
     (`prov/dockerhub-tags.png`, `live/airtable-interface-designer.png`)
     without claiming either as its picture. Neither is GitHub.
   · 25 BASE TABLES, 28 JOINS, NO VIEW TABLES. The register reads
     `role` off every table and draws two things: plates and rows for
     base tables, chips and page lines for joins. Nothing here draws a
     third kind.
   · ONE FILE-LEVEL sha256 AND FINGERPRINT. `./file.ts` reads them
     off the shipped manifest once; the fingerprint sits once on the
     head's blue line and the hash once on a page, labelled. A table's
     provenance is its workbook · sheet · row range, cut off its own
     description by `provenanceLine`, and its rows' own Source cells
     are on the sheet.
   · A TABLE WITH NO DESCRIPTION SAYS SO. `NO_PROVENANCE` is printed
     where the sentence would be. Measured on this pack (2026-09-22,
     `data/northside/entities.json`): all 53 carry one, so the case
     is kept for a file that does not. The SEVEN the critic counted
     are the seven base tables no pairing list names — REDCO,
     Dunbier, Mackay, ePropulsion, Labour Rates, Oils & Consumables,
     Registration Costs — and their rows say that instead: "no boat
     pairs with it".

   ── WHAT IS TRUE ON THIS BUILD AND WOULD NOT BE ON A BOARD ────
   · EVERY FIGURE IS COUNTED OFF THE STORE through
     `domain/modules/register`, never typed and never read off the
     manifest's header. A table that failed to load makes a figure
     smaller, which is the point.
   · THE PLACES ARE THE MODULES `mint.ts` MINTED when the file landed,
     read back through `placesOf`; nothing here is a list in app code.
     A base table in no place was FILED AT THIS DESK and its row says
     so with the day it was made, which is how a register a dealer
     makes — the customers register, once it exists — appears here
     with its own provenance.
   · ONE WRITE, WITH ITS WAY BACK. `New register` applies `createTable`
     through `src/state/catalogue.ts` — a command with an inverse, a
     said sentence and a typed event — and UNDO is pinned to that
     event's id in the step line under the head, the configurator's
     rail head and never a toast. The new row appears under "Filed at
     this desk" the moment the command lands.
   · A MARK IS THE LEDGER'S OR NOTHING. `markFor` (Home's own reader
     of `marks-ledger.json`) answers with the mark in dark ink for the
     paper the plate is, or with the reason there is none — Stabicraft
     records "no public wordmark verified" — and the name is then set
     in type on the same paper, with the reason on its page. No
     stand-in, no monogram.
   · THE SHELF IS ONE TAB STOP. Seven plates carrying twenty-eight
     pairing lines would be forty-two tab stops between the find field
     and the ledger, which is the shape a person presses Tab through
     and gives up on. The shelf is a roving composite instead: Tab
     lands on it once, ← → move between makers, ↑ ↓ move down a
     maker's pairing lines, Enter or Space presses the one under the
     cursor. Every act on it is keyboard-reachable and the legend
     says so.
   ============================================================ */

/** Said where the press happened, when nothing handed this screen a
 *  way to the sheet. */
export const NO_WAY_TO_THE_SHEET =
  'This screen was handed no way to the sheet, so nothing was opened. A table opens at /data/$table.'
/** Said on the customers register's page, when nothing handed this
 *  screen a way to that screen. */
export const NO_WAY_TO_CUSTOMERS =
  'This screen was handed no way to the customers register, so nothing was opened. It is at /customers.'
/** Said where a table's workbook sentence would stand, for a table the
 *  file brought with no description on it. */
export const NO_PROVENANCE = 'No provenance note on this table'
/** THE CUSTOMERS SCREEN'S ADDRESS, in one constant: it is built beside
 *  this screen in this round and is linked by address. */
export const CUSTOMERS_ADDRESS = '/customers'

/** What the dialog offers as "what one row of it is" — TABLE_KINDS'
 *  own labels, and one word of this screen's for the absence of a
 *  kind, which the model calls "Custom table". */
const KIND_CHOICES: { value: TableKind; label: string }[] = (
  Object.keys(TABLE_KINDS) as TableKind[]
).map((kind) => ({ value: kind, label: kind === 'custom' ? 'Something else' : TABLE_KINDS[kind].label }))

export interface DataPosition {
  at?: string
  find?: string
}

export interface DataProps {
  /** whose register it is, read off what was opened; null is honest */
  business?: string | null
  /** the way back to Home, handed in so the screen never reaches for
   *  the router and can be pressed in a component test */
  goHome?: () => void
  /** the door to the Master Price File, for a browser with no sheet */
  openTheFile?: () => void
  /** ONE TABLE, OPENED ON THE SHEET at /data/$table — the address
   *  belongs to the route, and this screen hands it the id */
  openTable?: (tableId: string) => void
  /** the customers register's own screen, at /customers */
  openCustomers?: () => void
  /** the table whose page is open, by id — a position, in the address */
  at?: string
  /** what was typed into the find field */
  find?: string
  onPosition?: (position: DataPosition) => void
}

/** The showroom width, under which a plate cannot carry its whole page.
 *  Read in JS only for the one decision CSS cannot take: what a press
 *  on a plate DOES. `data.css` draws the plate's own sentence and act
 *  from the same width. */
const WIDE = '(min-width: 1900px)'

/** Whether the window is the showroom width, where a plate carries its
 *  whole page and pressing it opens the sheet outright. */
function useWide(): boolean {
  const [wide, setWide] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(WIDE).matches
      : false,
  )
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const q = window.matchMedia(WIDE)
    const on = () => setWide(q.matches)
    q.addEventListener('change', on)
    return () => q.removeEventListener('change', on)
  }, [])
  return wide
}

interface Step {
  said: string
  eventId: string
  wasUndo: boolean
}

const n = (value: number): string => value.toLocaleString('en-AU')

/** One id per row, so `aria-activedescendant` names the row a reader
 *  is on. */
export const rowId = (tableId: string): string => `dt-row-${tableId}`
/** One id per pressable thing on the shelf, so the roving cursor is a
 *  string a re-render cannot lose. */
const doorId = (tableId: string): string => `dt-door-${tableId}`
const chipId = (joinId: string): string => `dt-chip-${joinId}`
const moreId = (tableId: string): string => `dt-more-${tableId}`

export function Data({
  business = null,
  goHome,
  openTheFile,
  openTable,
  openCustomers,
  at: arrivedAt = '',
  find: askedFor = '',
  onPosition,
}: DataProps) {
  const status = useCatalogue((s) => s.status)
  const problem = useCatalogue((s) => s.problem)
  const from = useCatalogue((s) => s.from)
  const version = useCatalogue((s) => s.version)
  const tables = useCatalogue((s) => s.tables)
  const rows = useCatalogue((s) => s.rows)
  const modules = useCatalogue((s) => s.modules)
  const priceLevels = useCatalogue((s) => s.priceLevels)

  const read = status === 'ready' || status === 'failed'
  const open = status === 'ready' && Object.keys(tables).length > 0
  const wide = useWide()

  const register = useMemo(
    () => readTableRegister(tables, rows, modules, priceLevels),
    [tables, rows, modules, priceLevels],
  )

  const [query, setQuery] = useState(askedFor)
  const narrowed = query.trim() !== ''
  const shown = useMemo(
    () => (narrowed ? register.rows.filter((r) => matchesTable(r, query)) : register.rows),
    [register, query, narrowed],
  )

  /* THE CURSOR IS A TABLE ID, NOT AN INDEX, for the register's reason:
     a row's place moves the moment a query narrows the list. `at` is
     both the row under the cursor and the page that is open; the page
     is open exactly when `at` names a table that is here. */
  const [wanted, setCursor] = useState<string>(arrivedAt)
  const [peeking, setPeeking] = useState<boolean>(arrivedAt !== '')
  const [step, setStep] = useState<Step | null>(null)
  const [refused, setRefused] = useState<string | null>(null)
  const [making, setMaking] = useState(false)

  const list = useRef<HTMLDivElement>(null)
  const shelf = useRef<HTMLUListElement>(null)
  const field = useRef<HTMLElement>(null)
  const pageRef = useRef<HTMLElement>(null)
  const rowsRef = useRef(new Map<string, HTMLDivElement>())

  /* THE SHELF'S OWN CURSOR: which of its buttons Tab lands on. It
     starts on the first maker's door and follows the focus, so leaving
     the shelf and coming back returns to the thing last pressed. */
  const [shelfAt, setShelfAt] = useState<string>('')

  const known = wanted !== '' && register.facts[wanted] !== undefined
  const onRows = shown.some((r) => r.id === wanted)
  const cursor = onRows ? wanted : known ? wanted : (shown[0]?.id ?? '')
  const page: TablePage | null = peeking && known ? pageOf(register, wanted) : null
  const here = shown.findIndex((r) => r.id === cursor)
  const atRow: RegisterRow | undefined = here >= 0 ? shown[here] : undefined

  useEffect(() => {
    onPosition?.({
      at: page ? wanted : undefined,
      find: query === '' ? undefined : query,
    })
  }, [onPosition, page, wanted, query])

  useEffect(() => {
    if (cursor === '' || !onRows) return
    const row = rowsRef.current.get(cursor)
    const port = list.current
    if (!row || !port) return
    const box = row.getBoundingClientRect()
    const inside = port.getBoundingClientRect()
    if (box.top >= inside.top && box.bottom <= inside.bottom) return
    row.scrollIntoView({ block: 'nearest' })
  }, [cursor, onRows])

  /* A PAGE THAT OPENED WHERE NOBODY CAN SEE IT LOOKS LIKE A PRESS THAT DID
     NOTHING. Beside the rows it is already in view and `nearest` moves
     nothing; under 1200 it is a block above them, and on a phone that block
     is a screen and a half up. Never smoothed: this screen has no motion. */
  useEffect(() => {
    if (!page) return
    let dropped = false
    const bring = (): void => {
      if (dropped) return
      const opened = pageRef.current
      if (!opened) return
      const box = opened.getBoundingClientRect()
      /* ALREADY IN VIEW IS LEFT ALONE. Beside the rows the page's head
         is a couple of hundred pixels down and nothing should move —
         and `scrollIntoView` moves every scrollable ancestor, including
         the screen's own `overflow: hidden` frame, which would slide
         the whole composition. So the press only scrolls when the thing
         it opened is not on the screen. */
      if (box.top >= 0 && box.top < window.innerHeight * 0.6) return
      opened.scrollIntoView({ block: 'start' })
    }
    /* AFTER THE ADDRESS HAS SETTLED, and that is why it is two frames
       and not a call. Opening a page writes `?at=` through the router,
       the router restores this address's remembered scroll when the
       navigation commits, and a scroll made before that commit is
       simply undone — measured at 390x844 on 2026-09-23: the page
       opened 1,406px down the document and the window stayed at 0. */
    const frame = requestAnimationFrame(() => requestAnimationFrame(bring))
    return () => {
      dropped = true
      cancelAnimationFrame(frame)
    }
  }, [page])

  const stepRows = useCallback(
    (by: number) => {
      if (shown.length === 0) return
      const start = here < 0 ? 0 : here
      const next = Math.min(shown.length - 1, Math.max(0, start + by))
      setCursor(shown[next]!.id)
    },
    [here, shown],
  )

  /* ONE FUNCTION OPENS THE SHEET, whichever way a person asked. */
  const openIt = useCallback(
    (tableId: string) => {
      if (!openTable) {
        setRefused(NO_WAY_TO_THE_SHEET)
        return
      }
      openTable(tableId)
    },
    [openTable],
  )

  /** A page is opened on a table — a plate's, a row's, a chip's. */
  const openPage = useCallback((tableId: string) => {
    setCursor(tableId)
    setPeeking(true)
    setRefused(null)
  }, [])

  /** ANYTHING ON THE SHELF PRESSED — a plate, or one of the pairing
   *  lines under it. On the showroom width the plate already carries
   *  its whole page, so the press opens the sheet; everywhere else it
   *  opens the page, which is what a press does on a row too. One
   *  answer for the whole shelf: a chip that jumped straight to a
   *  sheet while the plate beside it opened a page would be two rules
   *  on one object. */
  const pressShelf = useCallback(
    (tableId: string) => {
      if (wide) openIt(tableId)
      else openPage(tableId)
    },
    [wide, openIt, openPage],
  )

  /* ============================================================
     THE ONE WRITE ON THIS SCREEN, AND ITS WAY BACK.
     ============================================================ */
  const make = useCallback((name: string, kind: TableKind): string | null => {
    const outcome = catalogue.getState().apply(createTable({ name, kind }))
    if ('refused' in outcome) return outcome.refused
    setStep({ said: outcome.said, eventId: outcome.event.id, wasUndo: false })
    setRefused(null)
    /* the new table is the one the event named; it lands under the
       desk's own place and its page opens on it */
    const made = outcome.event.tableId
    if (made) {
      setCursor(made)
      setPeeking(true)
    }
    return null
  }, [])

  const goBack = useCallback(() => {
    if (!step) return
    const outcome = step.wasUndo
      ? catalogue.getState().redo()
      : catalogue.getState().undo(step.eventId)
    if ('refused' in outcome) {
      if (outcome.refused !== '') setRefused(outcome.refused)
      return
    }
    setRefused(null)
    setStep({ said: outcome.said, eventId: outcome.event.id, wasUndo: !step.wasUndo })
  }, [step])

  /* ============================================================
     THE KEYBOARD, BOUND TO THE LEDGER AND NOT TO THE WINDOW — the
     register's vocabulary, for the register's reasons (WCAG 2.2 SC
     2.1.4's third exemption: active only on focus).
     ============================================================ */
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (isField(event.target)) return
    const key = event.key
    if (event.metaKey || event.ctrlKey || event.altKey) return

    if (key === 'ArrowDown' || key === 'j' || key === 'J') {
      event.preventDefault()
      stepRows(1)
      return
    }
    if (key === 'ArrowUp' || key === 'k' || key === 'K') {
      event.preventDefault()
      stepRows(-1)
      return
    }
    if (key === 'Home') {
      event.preventDefault()
      if (shown[0]) setCursor(shown[0].id)
      return
    }
    if (key === 'End') {
      event.preventDefault()
      const last = shown[shown.length - 1]
      if (last) setCursor(last.id)
      return
    }
    if (key === ' ' || key === 'Spacebar') {
      event.preventDefault()
      if (event.repeat) return
      if (atRow) {
        if (peeking && wanted === atRow.id) setPeeking(false)
        else openPage(atRow.id)
      }
      return
    }
    if (key === 'Enter') {
      event.preventDefault()
      if (atRow) openIt(atRow.id)
      return
    }
    if (key === '/') {
      event.preventDefault()
      field.current?.focus()
      return
    }
    if (key === 'n' || key === 'N') {
      event.preventDefault()
      setMaking(true)
      return
    }
    if (key === 'Escape' && closesStage(stageKeyOf(event.nativeEvent))) {
      event.preventDefault()
      if (peeking) setPeeking(false)
      else if (query !== '') setQuery('')
    }
  }

  /* THE SHELF'S KEYBOARD: arrows move the cursor between the makers and
     down one maker's pairing lines; the press itself is the button's
     own. A line the stylesheet has taken away at this width (the
     fourth pairing onward on a laptop) has no box, and the cursor
     steps over it to the counted line that stands in its place. */
  const onShelfKey = (event: ReactKeyboardEvent<HTMLUListElement>): void => {
    const at = event.target
    if (!(at instanceof HTMLElement) || at.dataset['shelfItem'] === undefined) return
    if (event.metaKey || event.ctrlKey || event.altKey) return
    const items = [...(shelf.current?.querySelectorAll<HTMLElement>('[data-shelf-item]') ?? [])]
      .filter((el) => el.getClientRects().length > 0)
    const plate = Number(at.dataset['plate'])
    const item = Number(at.dataset['item'])
    const find = (p: number, i: number): HTMLElement | undefined =>
      items.find((el) => Number(el.dataset['plate']) === p && Number(el.dataset['item']) === i)
    const doors = items.filter((el) => el.dataset['item'] === '0')
    let next: HTMLElement | undefined
    if (event.key === 'ArrowRight') next = find(plate + 1, 0)
    else if (event.key === 'ArrowLeft') next = find(plate - 1, 0)
    else if (event.key === 'ArrowDown') {
      next = items.find((el) => Number(el.dataset['plate']) === plate && Number(el.dataset['item']) > item)
    } else if (event.key === 'ArrowUp') {
      next = items
        .filter((el) => Number(el.dataset['plate']) === plate && Number(el.dataset['item']) < item)
        .at(-1)
    } else if (event.key === 'Home') next = doors[0]
    else if (event.key === 'End') next = doors.at(-1)
    else if (event.key === 'Escape' && closesStage(stageKeyOf(event.nativeEvent))) {
      if (peeking) {
        event.preventDefault()
        setPeeking(false)
      }
      return
    } else return
    if (!next) return
    event.preventDefault()
    next.focus()
  }

  const onFieldKey = (event: ReactKeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setQuery('')
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'Enter') {
      event.preventDefault()
      list.current?.focus()
      if (shown[0] && here < 0) setCursor(shown[0].id)
    }
  }

  const findable = register.rows.length + register.plates.length >= FIND_FIELD_AT
  const provenance = provenanceOfSheet(version)
  const firstDoor = register.plates[0] ? doorId(register.plates[0].id) : ''
  const shelfCursor = shelfAt === '' ? firstDoor : shelfAt

  return (
    <main className="dt" data-testid="data" data-read={read ? '' : undefined}>
      <header className="dt-head">
        <div className="dt-head__who">
          <p className="dt-eyebrow">{business ?? 'This business has not been named yet'}</p>
          <h1 className="dt-title">Data</h1>
        </div>

        {open && findable ? (
          <div className="dt-find">
            <span className="dt-find__field">
              <Input
                id="dt-find-field"
                ref={field}
                type="search"
                aria-label="Find a table"
                value={query}
                onValueChange={setQuery}
                onKeyDown={onFieldKey}
                aria-describedby={narrowed ? 'dt-find-said' : undefined}
                placeholder="A table, a kind, a place, or the workbook it came from"
              />
            </span>
            <span className="dt-find__key">
              <Kbd>/</Kbd>
            </span>
          </div>
        ) : null}

        {open ? (
          <span className="dt-act">
            {/* THE ONE ACT, IN THE HEAD: a register of tables changes once
                per import, and a 70px act row under the ledger would cost
                the list two and a half of the eighteen rows it owes. It
                steps back while a page is open, because the page's own
                act is then the thing to press. */}
            <Button
              intent={page ? 'veiled' : 'act'}
              aria-label="New register"
              onClick={() => setMaking(true)}
            >
              New register
              <span className="dt-cap">
                <Kbd>N</Kbd>
              </span>
            </Button>
          </span>
        ) : null}

        <div className="dt-head__stamp">
          {problem !== null ? (
            <p className="dt-stamp-line" role="alert">
              {problem}
            </p>
          ) : !read ? (
            <p className="dt-stamp-line">Reading what this browser has kept…</p>
          ) : open ? (
            <p className="dt-stamp-line" data-testid="data-counts">
              <b>{n(register.head.tables)}</b> tables · <b>{n(register.head.rows)}</b> rows ·{' '}
              <b>{n(register.head.joins)}</b> of them pairing lists
            </p>
          ) : (
            <p className="dt-stamp-line">No price file is open in this browser</p>
          )}
          {open ? (
            <p className="dt-stamp-line dt-stamp-file" data-testid="data-file">
              Master Price File
              {from === null ? '' : from === 'pack' ? ' · read from the file' : ' · read from this browser'}
              {provenance.known ? (
                <>
                  {' '}
                  · packed {packedOn(provenance.file.packedAt)} ·{' '}
                  <b className="dt-mono">{provenance.file.fingerprint}</b>
                </>
              ) : null}
            </p>
          ) : null}
        </div>

        {goHome ? (
          <div className="dt-head__back">
            <Button intent="veiled" onClick={goHome}>
              Home
            </Button>
          </div>
        ) : null}
      </header>

      {step || refused ? (
        <div className="dt-said">
          {step ? (
            <output className="dt-step" data-testid="last-step">
              <span>{step.said}</span>
              <Button intent="veiled" size="sm" onClick={goBack}>
                {step.wasUndo ? 'Put it back' : 'Undo'}
              </Button>
            </output>
          ) : null}
          {refused ? (
            <p className="dt-alarm" role="alert">
              {refused}
            </p>
          ) : null}
        </div>
      ) : null}

      {open && register.plates.length > 0 ? (
        <section className="dt-plates" aria-label="The boat makers">
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
          <ul
            className="dt-plates__list"
            ref={shelf}
            data-testid="data-shelf"
            onKeyDown={onShelfKey}
            onFocus={(event) => {
              const at = event.target
              if (at instanceof HTMLElement && at.dataset['shelfItem'] !== undefined) {
                setShelfAt(at.id)
              }
            }}
          >
            {register.plates.map((plate, i) => (
              <PlateCard
                key={plate.id}
                plate={plate}
                index={i}
                on={page !== null && wanted === plate.id}
                tabStop={shelfCursor}
                onPress={() => pressShelf(plate.id)}
                onMore={() => openPage(plate.id)}
                onChip={pressShelf}
                openSheet={() => openIt(plate.id)}
                canOpen={Boolean(openTable)}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {open && narrowed ? (
        <p className="dt-narrowed" id="dt-find-said" role="status">
          {shown.length === 0
            ? NOTHING_CALLED(query)
            : `${n(shown.length)} of ${n(register.rows.length)} tables match “${query.trim()}”. Every word has to hit something, so typing more narrows.`}
        </p>
      ) : null}

      <div className="dt-body" data-open={page ? '' : undefined}>
        {page ? (
          <Page
            hold={pageRef}
            page={page}
            onClose={() => {
              setPeeking(false)
              list.current?.focus()
            }}
            onOpen={openIt}
            canOpen={Boolean(openTable)}
            openCustomers={openCustomers}
            fileProvenance={provenance}
          />
        ) : null}

        {open ? (
          <div className="dt-ledger">
            <div
              className="dt-list"
              ref={list}
              role="grid"
              tabIndex={0}
              aria-label="Tables"
              aria-rowcount={shown.length}
              aria-activedescendant={atRow ? rowId(atRow.id) : undefined}
              onKeyDown={onKeyDown}
            >
              {groupsOf(shown).map((group) => (
                <div
                  className="dt-place"
                  role="rowgroup"
                  aria-label={group.place}
                  key={group.placeId}
                >
                  {group.rows.map((row, i) => (
                    <Row
                      key={row.id}
                      row={row}
                      leads={i === 0}
                      on={row.id === cursor}
                      peeking={page !== null && row.id === wanted}
                      onPoint={openPage}
                      onOpen={openIt}
                      hold={(id, element) => {
                        if (element) rowsRef.current.set(id, element)
                        else rowsRef.current.delete(id)
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
            <p className="dt-keys">
              <Kbd>J</Kbd>
              <Kbd>K</Kbd> move · <Kbd>Space</Kbd> opens its page · <Kbd>Enter</Kbd> opens the
              sheet · <Kbd>/</Kbd> find · <Kbd>Esc</Kbd> closes · <Kbd>←</Kbd>
              <Kbd>→</Kbd> the makers · <Kbd>↓</Kbd> their pairings
            </p>
          </div>
        ) : read ? (
          <Teach openTheFile={openTheFile} />
        ) : null}
      </div>

      <MakeDialog open={making} onOpenChange={setMaking} make={make} />
    </main>
  )
}

/* ---------------------------------------------------------- */
/* The groups a narrowed list still has                        */
/* ---------------------------------------------------------- */

interface Group {
  placeId: string
  place: string
  rows: RegisterRow[]
}

/** Rows in their places' runs, with a narrowed list keeping only the
 *  places that still have a row. */
function groupsOf(rows: readonly RegisterRow[]): Group[] {
  const out: Group[] = []
  for (const row of rows) {
    const last = out[out.length - 1]
    if (last && last.placeId === row.placeId) last.rows.push(row)
    else out.push({ placeId: row.placeId, place: row.place, rows: [row] })
  }
  return out
}

const accentOf = (kind: TableKind): AccentKey => TABLE_KINDS[kind].accent

/** "pairs with 6 boats", or the honest absence. */
export function pairsSay(boats: number): string {
  if (boats === 0) return 'no boat pairs with it'
  return `pairs with ${n(boats)} ${boats === 1 ? 'boat' : 'boats'}`
}

/** A row's provenance, as the row prints it: the workbook's first
 *  sentence, or the day it was made here, or the honest absence. */
function provenanceSay(f: TableFacts): string {
  if (f.provenance.kind === 'desk') return `${FILED_AT_THIS_DESK} · ${packedOn(f.provenance.madeOn)}`
  return f.provenance.line ?? NO_PROVENANCE
}

/* ---------------------------------------------------------- */
/* One row                                                     */
/* ---------------------------------------------------------- */

function Row({
  row,
  leads,
  on,
  peeking,
  onPoint,
  onOpen,
  hold,
}: {
  row: RegisterRow
  leads: boolean
  on: boolean
  peeking: boolean
  onPoint: (id: string) => void
  onOpen: (id: string) => void
  hold: (id: string, element: HTMLDivElement | null) => void
}) {
  return (
    <div
      className="dt-row"
      role="row"
      id={rowId(row.id)}
      ref={(element) => {
        hold(row.id, element)
      }}
      data-on={on ? '' : undefined}
      data-peeking={peeking ? '' : undefined}
      data-leads={leads ? '' : undefined}
      data-headed={leads && row.headed ? '' : undefined}
      data-retired={row.retired ? '' : undefined}
      aria-selected={on}
      onClick={() => onPoint(row.id)}
      onDoubleClick={() => onOpen(row.id)}
    >
      <span className="dt-cell dt-cell--place" role="gridcell">
        {leads && row.headed ? row.place : ''}
      </span>
      <span className="dt-cell dt-cell--kind" role="gridcell" data-accent={accentOf(row.kind)}>
        <span className="dt-tick" data-accent={accentOf(row.kind)} aria-hidden="true" />
        <span className="dt-kindword">{row.kindWord}</span>
      </span>
      <span className="dt-cell dt-cell--name" role="gridcell">
        <span className="dt-name">{row.name}</span>
        {row.retired ? <span className="dt-retired">no longer sold</span> : null}
      </span>
      {/* THE COUNT AND ITS HEADINGS ARE TWO CELLS, because one cell that
          right-aligned both clipped the count's own first digits with no
          ellipsis to say so — "3,587 products" printed as "87 products".
          `register.ts` hands the two halves over already apart. */}
      <span className="dt-cell dt-cell--holds" role="gridcell">
        {row.leafSay}
      </span>
      <span className="dt-cell dt-cell--branch" role="gridcell">
        {row.branchSay ?? ''}
      </span>
      <span className="dt-cell dt-cell--pairs" role="gridcell">
        {pairsSay(row.namedBy.boats.length)}
      </span>
      <span
        className="dt-cell dt-cell--prov"
        role="gridcell"
        data-desk={row.provenance.kind === 'desk' ? '' : undefined}
        title={row.provenance.whole || undefined}
      >
        {provenanceSay(row)}
      </span>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* One plate                                                   */
/* ---------------------------------------------------------- */

/** THE LAPTOP'S PLATE SHOWS THIS MANY LISTS and counts the rest; the
 *  stylesheet hides the fourth onward between 640 and 1439 and draws
 *  the counted line. It is stated here so the line's own number and
 *  the sheet's `nth-child(n + 4)` are one fact. */
export const CHIPS_ON_A_LAPTOP = 3

/* THE PLATE'S DOOR IS THIS SCREEN'S OWN BUTTON and not a `Tile`, and
   the reason is the shelf's one tab stop: a Tile is a tab stop of its
   own by design, and the roving cursor above needs `tabindex` on every
   button it moves between. The sheet's outline and the configurator's
   chapter heads draw their own buttons for their own reasons; this one
   carries the paper, the ring and the pressed bar in `data.css`. */
function PlateCard({
  plate,
  index,
  on,
  tabStop,
  onPress,
  onMore,
  onChip,
  openSheet,
  canOpen,
}: {
  plate: Plate
  index: number
  on: boolean
  /** the id of the one shelf button Tab lands on */
  tabStop: string
  onPress: () => void
  onMore: () => void
  onChip: (joinId: string) => void
  openSheet: () => void
  canOpen: boolean
}) {
  const choice: MarkChoice = markFor(plate.name, 'paper')
  const more = plate.pairings.length - CHIPS_ON_A_LAPTOP
  const stop = (id: string): 0 | -1 => (id === tabStop ? 0 : -1)
  return (
    <li className="dt-plate" data-on={on ? '' : undefined} data-testid="plate">
      <button
        type="button"
        className="dt-plate__door"
        id={doorId(plate.id)}
        data-shelf-item=""
        data-plate={index}
        data-item={0}
        tabIndex={stop(doorId(plate.id))}
        aria-label={`${plate.name} · ${plate.holds}`}
        aria-pressed={on}
        onClick={onPress}
      >
        <span className="dt-plate__mark">
          {choice.drawn ? (
            <img
              className="dt-plate__img"
              src={choice.mark.src}
              alt=""
              width={choice.mark.width}
              height={choice.mark.height}
              decoding="async"
            />
          ) : (
            <span className="dt-plate__typed">{plate.name}</span>
          )}
        </span>
        {/* A PLATE NAMES ITS MAKER EXACTLY ONCE: under a drawn mark the
            name is the eyebrow, for the two held marks that are a
            script and a device; where none is drawn the name IS the
            mark, above. */}
        {choice.drawn ? <span className="dt-plate__name">{plate.name}</span> : null}
        <span className="dt-plate__holds">
          {plate.holds}
          {plate.retired ? ' · no longer sold' : ''}
        </span>
      </button>
      {plate.pairings.length > 0 ? (
        <ul className="dt-chips" aria-label={`What pairs with ${plate.name}`}>
          {plate.pairings.map((p, j) => (
            <li key={p.joinId}>
              <button
                type="button"
                className="dt-chip"
                id={chipId(p.joinId)}
                data-shelf-item=""
                data-plate={index}
                data-item={j + 1}
                tabIndex={stop(chipId(p.joinId))}
                data-retired={p.retired ? '' : undefined}
                aria-label={`${p.farName} · ${n(p.rows)} pairings${p.retired ? ' · no longer sold' : ''}`}
                title={p.joinName}
                onClick={() => onChip(p.joinId)}
              >
                <span className="dt-tick" data-accent={accentOf(p.farKind)} aria-hidden="true" />
                <span className="dt-chip__name">{p.farName}</span>
                <span className="dt-chip__n">
                  {n(p.rows)} <span className="dt-chip__word">pairings</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="dt-plate__none">No pairing list hangs off it yet.</p>
      )}
      {more > 0 ? (
        <button
          type="button"
          className="dt-plate__more"
          id={moreId(plate.id)}
          data-shelf-item=""
          data-plate={index}
          data-item={plate.pairings.length + 1}
          tabIndex={stop(moreId(plate.id))}
          onClick={onMore}
        >
          and {n(more)} more
        </button>
      ) : null}
      <p className="dt-plate__prov">{provenanceSay(plate)}</p>
      <span className="dt-plate__act">
        <Button
          intent="veiled"
          size="sm"
          onClick={openSheet}
          refusedBecause={canOpen ? undefined : NO_WAY_TO_THE_SHEET}
        >
          Open the sheet
        </Button>
      </span>
    </li>
  )
}

/* ---------------------------------------------------------- */
/* One page                                                    */
/* ---------------------------------------------------------- */

const STANDING_HEAD: Record<PagePairing['standing'], string> = {
  owner: 'What pairs with it',
  far: 'The boats it pairs with',
  rider: 'The pairing lists it rides on',
}

function Page({
  hold,
  page,
  onClose,
  onOpen,
  canOpen,
  openCustomers,
  fileProvenance,
}: {
  hold: RefObject<HTMLElement | null>
  page: TablePage
  onClose: () => void
  onOpen: (id: string) => void
  canOpen: boolean
  openCustomers?: () => void
  fileProvenance: ReturnType<typeof provenanceOfSheet>
}) {
  const f: TableFacts = page.facts
  const choice = markFor(f.name, 'paper')
  const isPairingList = page.ends !== null
  const customers = f.id === CUSTOMER_TABLE_ID
  const standing = page.pairings[0]?.standing ?? 'owner'
  return (
    <aside
      className="dt-page"
      ref={hold}
      aria-label="The table under the cursor"
      data-testid="data-page"
    >
      <div className="dt-page__top">
        <span className="dt-page__kind">{isPairingList ? 'Pairing list' : f.kindWord}</span>
        <Button intent="veiled" size="sm" onClick={onClose} aria-label="Close the page">
          Close
          <span className="dt-cap">
            <Kbd>Esc</Kbd>
          </span>
        </Button>
      </div>

      {!isPairingList ? (
        <div className="dt-page__paper">
          {choice.drawn ? (
            <img
              className="dt-page__img"
              src={choice.mark.src}
              alt=""
              width={choice.mark.width}
              height={choice.mark.height}
              decoding="async"
            />
          ) : (
            <span className="dt-page__typed">{f.name}</span>
          )}
        </div>
      ) : null}
      {!isPairingList && !choice.drawn && f.kind === 'boat' ? (
        <p className="dt-page__why">{choice.because}</p>
      ) : null}

      <h2 className="dt-page__name">{f.name}</h2>
      <p className="dt-page__holds">
        {f.holds}
        {f.retired ? ' · history rather than stock, so nothing from it is offered to a customer' : ''}
      </p>

      {/* THE ACT STANDS WITH THE NAME, NOT AT THE FOOT. A page on Stacer is a mark, a
          name, four labelled facts and three pairing lines; at 1440 the foot of that is
          below the pane's own fold, and the one thing this page exists to do was a scroll
          away. Measured 2026-09-23. */}
      <div className="dt-acts">
        <div className="dt-acts__one">
          <Button
            intent="act"
            onClick={() => onOpen(f.id)}
            refusedBecause={canOpen ? undefined : NO_WAY_TO_THE_SHEET}
          >
            Open the sheet
            <span className="dt-cap">
              <Kbd>Enter</Kbd>
            </span>
          </Button>
        </div>
        <p className="dt-acts__where">
          It opens at /data/{f.id}, every row of it as a grid, where a cell can be changed.
        </p>
        {customers ? (
          <div className="dt-acts__one">
            <Button
              intent="veiled"
              onClick={openCustomers}
              refusedBecause={openCustomers ? undefined : NO_WAY_TO_CUSTOMERS}
            >
              Open the customers register
            </Button>
            <p className="dt-acts__where">The register a dealer works in is at {CUSTOMERS_ADDRESS}.</p>
          </div>
        ) : null}
        <p className="dt-touchsay">Press a row to read it here; the act above opens it.</p>
      </div>

      <dl className="dt-facts">
        {page.ends ? (
          <div className="dt-facts__row">
            <dt>Its two ends</dt>
            <dd>
              {page.ends.ownerName} with {page.ends.farName}
              {page.ends.extras.length > 0 ? (
                <span className="dt-facts__quiet">
                  {' '}
                  · carrying {page.ends.extras.join(', ')}
                </span>
              ) : null}
            </dd>
          </div>
        ) : null}
        <div className="dt-facts__row">
          <dt>Columns</dt>
          <dd>
            {n(f.columns)}
            {f.costColumns > 0 ? (
              <span className="dt-facts__quiet">
                {' '}
                · {n(f.costColumns)} of them the dealer&rsquo;s own figures, kept off every
                customer surface
              </span>
            ) : null}
          </dd>
        </div>
        <div className="dt-facts__row">
          <dt>Priced at</dt>
          <dd>
            {f.levels.length > 0 ? (
              f.levels.join(' · ')
            ) : (
              <span className="dt-facts__quiet">No price ladder is declared on it</span>
            )}
          </dd>
        </div>
        <div className="dt-facts__row">
          <dt>Where from</dt>
          <dd>
            {f.provenance.kind === 'file' ? (
              f.provenance.whole
            ) : f.provenance.kind === 'desk' ? (
              <>
                {FILED_AT_THIS_DESK}, on {packedOn(f.provenance.madeOn)}
                {f.provenance.whole ? ` — ${f.provenance.whole}` : ''}
                <span className="dt-facts__quiet"> · it is not in the packed file</span>
              </>
            ) : (
              <span className="dt-facts__quiet">{NO_PROVENANCE}</span>
            )}
          </dd>
        </div>
        {f.provenance.kind === 'file' ? (
          <div className="dt-facts__row">
            <dt>The file</dt>
            <dd>
              {fileProvenance.known ? (
                <>
                  <span className="dt-facts__quiet">
                    Packed {packedOn(fileProvenance.file.packedAt)} from a source whose sha256 is
                  </span>
                  <code className="dt-hash">{fileProvenance.file.sha256}</code>
                  <span className="dt-facts__quiet">
                    Fingerprint <b className="dt-mono">{fileProvenance.file.fingerprint}</b> — one
                    for the whole file, so a re-import can be checked against it.
                  </span>
                </>
              ) : (
                <span className="dt-facts__quiet">{fileProvenance.because}</span>
              )}
            </dd>
          </div>
        ) : null}
      </dl>

      {!isPairingList ? (
        <section className="dt-pairs" aria-label={STANDING_HEAD[standing]}>
          <p className="dt-pairs__head">
            {STANDING_HEAD[standing]}
            {page.pairings.length > 0
              ? ` · ${n(page.pairings.length)} ${page.pairings.length === 1 ? 'list' : 'lists'} · ${n(page.pairingRows)} pairings`
              : ''}
          </p>
          {page.pairings.length > 0 ? (
            <ul className="dt-pairs__list">
              {page.pairings.map((p) => (
                <li key={p.joinId}>
                  <button
                    type="button"
                    className="dt-pair"
                    data-retired={p.retired ? '' : undefined}
                    title={p.joinName}
                    onClick={() => onOpen(p.joinId)}
                  >
                    <span
                      className="dt-tick"
                      data-accent={accentOf(p.standing === 'owner' ? p.farKind : 'boat')}
                      aria-hidden="true"
                    />
                    <span className="dt-pair__name">{p.otherName}</span>
                    <span className="dt-pair__n">
                      {n(p.rows)} pairings{p.retired ? ' · no longer sold' : ''}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="dt-pairs__none">
              {f.kind === 'boat'
                ? 'No pairing list hangs off it yet: nothing in the file says what motor, trailer, fit or part goes on it.'
                : 'No boat pairs with it: no pairing list in the file names a row of it.'}
            </p>
          )}
        </section>
      ) : null}

    </aside>
  )
}

/* ---------------------------------------------------------- */
/* Teaching, on a desk with no file                            */
/* ---------------------------------------------------------- */

function Teach({ openTheFile }: { openTheFile?: () => void }) {
  return (
    <section className="dt-teach" aria-label="What this register is">
      <h2 className="dt-teach__head">No price file is open in this browser.</h2>
      <div>
        <p className="dt-teach__q">What lands here</p>
        <p className="dt-teach__a">
          <b>Every table the Master Price File carries</b>, counted: the boat makers as plates
          across the top with what pairs with each, and every other register — motors, trailers,
          parts, fit, the rate sheets — as a row that says its kind, what one row of it is, and
          the workbook it came from.
        </p>
      </div>
      <div>
        <p className="dt-teach__q">Why it is empty today</p>
        <p className="dt-teach__a">
          This screen reads what this browser has kept and never the file itself. The blank door
          on the way in loads nothing, and nothing is stood in for a table that is not here.
        </p>
      </div>
      <div>
        <p className="dt-teach__q">What to do</p>
        <p className="dt-teach__a">
          Load the Master Price File and every one of its tables lands on this register, read
          from the file once and kept here after that.
        </p>
      </div>
      {openTheFile ? (
        <div className="dt-teach__door">
          <Button intent="primary" onClick={openTheFile}>
            Load the Master Price File
          </Button>
        </div>
      ) : null}
    </section>
  )
}

/* ---------------------------------------------------------- */
/* The dialog that makes a register                            */
/* ---------------------------------------------------------- */

function MakeDialog({
  open,
  onOpenChange,
  make,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  make: (name: string, kind: TableKind) => string | null
}) {
  const [name, setName] = useState('')
  const [kind, setKind] = useState<TableKind>('custom')
  const [error, setError] = useState<string | null>(null)

  const submit = (): void => {
    const refusal = make(name, kind)
    if (refusal) {
      setError(refusal)
      return
    }
    setError(null)
    setName('')
    setKind('custom')
    onOpenChange(false)
  }

  return (
    <Dialog
      title="A new register"
      description={`It is filed at this desk, with one Name column to start, and opens as a sheet where columns and rows are added. Its row here says “${DESK_PLACE}” where the others say their workbook.`}
      open={open}
      onOpenChange={(next) => {
        if (!next) setError(null)
        onOpenChange(next)
      }}
      size="sm"
      actions={
        <>
          <DialogClose>
            <Button intent="quiet">Not now</Button>
          </DialogClose>
          <Button intent="primary" onClick={submit}>
            Make it
          </Button>
        </>
      }
    >
      <div className="dt-make">
        <Field label="What it is called" error={error ?? undefined}>
          <Input
            value={name}
            onValueChange={(next) => {
              setName(next)
              if (error) setError(null)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                submit()
              }
            }}
            placeholder="Boat show leads"
          />
        </Field>
        <Field
          label="What one row of it is"
          description={`${REGISTER_WORD} is what it is called on this screen until it holds a kind.`}
        >
          <Select<TableKind>
            options={KIND_CHOICES}
            value={kind}
            onValueChange={(next) => setKind(next ?? 'custom')}
            aria-label="What one row of it is"
          />
        </Field>
        <p className="dt-make__say">
          Its kind is a word for what one row of it is — {kindWord('boat').toLowerCase()},{' '}
          {kindWord('motor').toLowerCase()}, {kindWord('trailer').toLowerCase()} — and a register of
          boats made here takes a plate of its own with its name set in type.
        </p>
      </div>
    </Dialog>
  )
}
