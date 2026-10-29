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
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@phosphor-icons/react'
import {
  Button,
  Dialog,
  DialogClose,
  Field,
  Icon,
  Input,
  KIND_GLYPH,
  KindMark,
  Plate as Surface,
  Refusal,
  Select,
  closesStage,
  isField,
  stageKeyOf,
} from '@/ui'
import { TABLE_KINDS, type AccentKey, type TableKind } from '@/domain/model'
import { TABLE_NEEDS_NAME, createTable, tableTaken } from '@/domain/catalogue/commands'
import { countBoats } from '@/domain/quote/boats'
import { FIND_FIELD_AT } from '@/domain/quote/find'
import {
  NOTHING_CALLED,
  matchesTable,
  pageOf,
  readTableRegister,
  type Plate,
  type RegisterRow,
  type TablePage,
} from '@/domain/modules/register'
import { useCatalogue, usePrefs } from '@/app/useStores'
import { PRICE_LIST_ROOMS, fitmentOf, pricesOf } from '@/app/ways'
import { catalogue } from '@/state/catalogue'
import { findBoats } from '@/domain/fitment/boat'
import { review } from '@/domain/rules/review/checks'
import { queueOf } from '@/domain/rules/review/cases'
import { markFor, type MarkChoice } from '@/screens/home/ledgers'
import { readLadder } from '@/screens/levels/read'
import { MEANT_PREF, meantOf } from '@/screens/review/read'
import { glyphOfWay } from '@/screens/shell/glyphs'
import { packedOn, provenanceOfSheet } from './file'
import { lineupOf } from './lineup'
import { NO_WAY_TO_THE_SHEET, Spread, type Arrival } from './Spread'
import { canTurn, markName, turn } from './turn'
import './data.css'

export { NO_WAY_TO_CUSTOMERS, NO_WAY_TO_THE_SHEET } from './Spread'

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
   pair with it, and the workbook it came from.

   PRESSING ONE OPENS IT, AND NOT BESIDE THE ROWS (2026-09-23). Until
   then a press drew the table's page as a --spacing(90) column beside
   the ledger — the critique's #6 measured it as the quotes register's
   shape and the sheet's, one token under three names. Now a press
   opens the table where the ledger was: the SPREAD (`./Spread.tsx`),
   the maker's own mark large on its own paper, its lineup in its
   kind's ink, what pairs with it as tiles carrying the other makers'
   marks, and the one act that opens its sheet. The shelf stays above
   it lit on the maker that is open; "Back to the lists" or Escape
   brings the ledger back with the cursor where it was. One answer at
   every width, including 1920, where a plate used to jump straight to
   the sheet and so had no opened state to show (#26).

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
   · IN THE KIT (2026-09-28). The same composition in the component
     language of src/ui: the plates are the kit's option tiles on the
     blue room, the ledger a white plate with the kit's register in it,
     the spread a white plate whose pairings are option tiles, every
     act with its glyph. The showpiece moment is the maker's MARK: a
     pointer's press turns the page and the logo flies from its plate
     into the spread's cover (`./turn.ts`); the sheet's head carries the
     same name, so it can fly on into the sheet. data.css says what
     moves and when; nothing that is a figure does.
   · THE SHELF IS ONE TAB STOP. Seven plates carrying twenty-eight
     pairing lines would be forty-two tab stops between the find field
     and the ledger, which is the shape a person presses Tab through
     and gives up on. The shelf is a roving composite instead: Tab
     lands on it once, ← → move between makers, ↑ ↓ move down a
     maker's pairing lines, Enter or Space presses the one under the
     cursor. Every act on it is keyboard-reachable.

   ── EVERY FACT ONCE, IN THE DEALER'S WORDS (2026-10-20) ────────
   The refine round read this screen word by word (docs/WORDS.md) and
   with the overlap ruler that no longer sets positioned layers aside.
   · WHAT GOES WITH A MAKER IS INSIDE ITS PLATE. The pairing lines
     hung under the plates on the room's ground, each count ending 2–6px
     from the next maker's glyph ("1,342 ▣ Dealer Fit Packages"), so a
     count could not be told from its neighbour's. They are now the
     plate's own foot, on its paper, and carry no count: "2,519
     pairings" beside a row saying "209 motors" was two figures for one
     list in two units. A boat maker is counted in models, as Home and
     the picker count it (`countBoats`): Highfield's 67, not its 588
     lines, which its spread still counts as variants.
   · A ROW SAYS ITS NAME, ITS COUNT AND WHAT IT FITS. The kind's word
     ("Trailers" eight times under TRAILERS) is gone — its glyph and
     its count's own noun ("73 trailers") already say it — and so is
     the workbook and sheet, which every trailer row repeated; it is on
     the list's spread, one press away. The pack generator's reading
     notes, which a row's hover printed, reach no screen.
   · THE HEAD SAYS THE PRICE LIST'S DATE AND SIZE, once; the
     fingerprint is the date's hover. "Register" is a list, the
     dialog asks what is on it, and the sentence under the ledger that
     explained how to press it is gone.
   ============================================================ */

/* THE REFUSALS AND THE PROVENANCE WORD live with the spread, which is
   where they are said (`./Spread.tsx`), and are exported from here as
   they always were. None of them names an address any more: "/data/
   $table" and "/customers" were a router's words on a dealer's screen
   (the critique's #14, rule (c)). */

/** What the dialog offers for "What is on it?" — TABLE_KINDS' own
 *  labels (Boats, Motors, Trailers …), and "Something else" for the
 *  absence of a kind, which the model calls "Custom table". */
const KIND_CHOICES: { value: TableKind; label: string }[] = (
  Object.keys(TABLE_KINDS) as TableKind[]
).map((kind) => ({ value: kind, label: kind === 'custom' ? 'Something else' : TABLE_KINDS[kind].label }))

export interface DataPosition {
  at?: string
  find?: string
}

export interface DataProps {
  /** whose price list it is. ACCEPTED AND NOT DRAWN since 2026-10-20: the crest on the bar
   *  names the business on every screen, and an eyebrow here said it a second time. */
  business?: string | null
  /** THE WAY HOME, WHICH THIS SCREEN NO LONGER DRAWS. The pill carries
   *  Home on every screen, and a head that repeated it was the third
   *  and fourth "way back" in one window (critique #13, rule (a)). The
   *  route still hands it; it is accepted and not drawn, so the route
   *  and this screen can change on their own days. */
  goHome?: () => void
  /** the door to the Master Price File, for a browser with no sheet */
  openTheFile?: () => void
  /** ONE TABLE, OPENED ON THE SHEET at /data/$table — the address
   *  belongs to the route, and this screen hands it the id */
  openTable?: (tableId: string) => void
  /** the customers register's own screen, at /customers */
  openCustomers?: () => void
  /** AN ADDRESS THIS SCREEN LINKS TO, followed by the router on a plain press — the price
   *  list's rooms at the head (`PRICE_LIST_ROOMS`), a maker's prices and one of its boats on
   *  its spread. Without it every one of them is still a real link the browser follows. */
  go?: (href: string) => void
  /** the table whose page is open, by id — a position, in the address */
  at?: string
  /** what was typed into the find field */
  find?: string
  onPosition?: (position: DataPosition) => void
}

/* A PRESS DOES THE SAME THING AT EVERY WIDTH. Until 2026-09-23 a plate
   at 1900px and over opened the sheet outright, because the plate
   carried its whole page there; so Data's opened state did not exist
   at the showroom width and its evidence was a picture of the sheet
   (critique #26). A plate now opens its spread everywhere, and the
   spread's act opens the sheet. */

interface Step {
  /** the list the write made, which the step names in the dealer's words */
  name: string
  eventId: string
  wasUndo: boolean
}

/** WHAT THE ONE WRITE SAYS, in this screen's words: the command's own sentence is "Table
 *  added", the engine's (docs/WORDS.md). */
const stepSaid = (step: Step): string =>
  step.wasUndo ? `“${step.name}” is taken off your own lists.` : `“${step.name}” is on your own lists.`

/** The command's two refusals a dealer can meet here, in the dealer's words. */
function refusalSaid(refused: string): string {
  if (refused === TABLE_NEEDS_NAME) return 'A list needs a name.'
  const taken = tableTaken('')
  const lead = taken.slice(0, taken.indexOf('“'))
  if (refused.startsWith(lead)) return refused.replace(lead, 'There is already a list called ')
  return refused
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
  openTheFile,
  openTable,
  openCustomers,
  go,
  at: arrivedAt = '',
  find: askedFor = '',
  onPosition,
}: DataProps) {
  const status = useCatalogue((s) => s.status)
  const problem = useCatalogue((s) => s.problem)
  const version = useCatalogue((s) => s.version)
  const tables = useCatalogue((s) => s.tables)
  const rows = useCatalogue((s) => s.rows)
  const modules = useCatalogue((s) => s.modules)
  const priceLevels = useCatalogue((s) => s.priceLevels)
  const meantPref = usePrefs((s) => s.values[MEANT_PREF])

  const read = status === 'ready' || status === 'failed'
  /* STILL LOOKING, which is not the same as having found nothing: until
     the store answers, this screen says it is looking for a price file
     and names no business, rather than printing "No price file is open"
     over a read that is about to succeed (the critique's #15, found on
     /quotes and true here too). */
  const looking = (status === 'empty' || status === 'loading') && problem === null
  const open = status === 'ready' && Object.keys(tables).length > 0

  const register = useMemo(
    () => readTableRegister(tables, rows, modules, priceLevels),
    [tables, rows, modules, priceLevels],
  )
  /* A BOAT MAKER IS COUNTED IN MODELS, by the one count Home and the picker read
     (`countBoats`): Highfield is 67 models there, and a plate here that said "588 variants"
     was a second figure for one maker on the screen beside them. */
  const models = useMemo(() => {
    const byId = new Map<string, number>()
    for (const m of countBoats(tables, rows).byMaker) byId.set(m.id, m.boats)
    return byId
  }, [tables, rows])

  /* WHAT IS WRONG IN THE PRICE LIST, COUNTED AS REVIEW COUNTS IT: the same read (`review`),
     with what the dealer left as meant set aside the same way, and counted in CASES, as Review's
     head and its "Case 1 of 37" count them (built-critique-m3.md, major 11: this door said "69
     to fix" beside Review's "Case 1 of 37"), so the figure on Review's door is Review's own. It is read AFTER the screen has
     drawn — a tenth of a second on this file, measured 2026-10-22, and the ledger is what a
     person came for — and until then the door is its word alone, as a door on the pill is
     before its store has answered. */
  const [wrong, setWrong] = useState<number | null>(null)
  useEffect(() => {
    if (!open) {
      setWrong(null)
      return
    }
    let dropped = false
    const timer = window.setTimeout(() => {
      if (dropped) return
      setWrong(queueOf(review({ entities: tables, rowsByEntity: rows }, meantOf(meantPref))).length)
    }, 0)
    return () => {
      dropped = true
      window.clearTimeout(timer)
    }
  }, [open, tables, rows, meantPref])

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
  /* HOW THE OPEN SPREAD ARRIVED: turned from its plate (the mark flew), risen into place (a
     pointer's press whose spread opened out of sight, or no View Transitions here), or simply
     there (a key, which is never animated). `./turn.ts` says why. */
  const [arrival, setArrival] = useState<Arrival>(null)

  const room = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const shelf = useRef<HTMLUListElement>(null)
  useShelfFit(shelf, open ? register.plates.length : 0)
  const field = useRef<HTMLElement>(null)
  const pageRef = useRef<HTMLElement>(null)
  const rowsRef = useRef(new Map<string, HTMLDivElement>())
  /* WHERE THE FOCUS GOES WHEN A SPREAD OPENS AND CLOSES. The ledger
     steps away while a spread is open, so a spread opened from the
     ledger's own keyboard takes the focus (it would otherwise fall to
     the page body, where Escape means nothing), and gives it back to
     the ledger when it closes. A spread opened from the shelf leaves
     the focus on the plate, which is still there. */
  const focusSpread = useRef(false)
  const backToList = useRef(false)

  /* THE SHELF'S OWN CURSOR: which of its buttons Tab lands on. It
     starts on the first maker's door and follows the focus, so leaving
     the shelf and coming back returns to the thing last pressed. */
  const [shelfAt, setShelfAt] = useState<string>('')

  const known = wanted !== '' && register.facts[wanted] !== undefined
  const onRows = shown.some((r) => r.id === wanted)
  const cursor = onRows ? wanted : known ? wanted : (shown[0]?.id ?? '')
  /* MEMOISED, because it is an effect's dependency: `pageOf` hands back
     a new object on every call, and an effect keyed on a new object
     every render writes the address every render. */
  const page: TablePage | null = useMemo(
    () => (peeking && known ? pageOf(register, wanted) : null),
    [peeking, known, register, wanted],
  )
  const here = shown.findIndex((r) => r.id === cursor)
  const atRow: RegisterRow | undefined = here >= 0 ? shown[here] : undefined
  /* THE LINEUP OF THE TABLE THAT IS OPEN, read off the same store rows
     the register counted, so its bars add back to the count on the
     plate. */
  const lineup = useMemo(
    () => (page ? lineupOf(tables[page.facts.id], rows[page.facts.id]) : null),
    [page, tables, rows],
  )
  /* WHERE THE SPREAD'S PRICES ARE SET: the list's own place on Prices' ladder, read by the
     ladder's own reader, so a list Prices groups with others ("Every trailer") opens that
     group. A list Prices does not carry — Labour Rates, a list made here — has no such place,
     and its prices stay words. */
  const pricesHref = useMemo(() => {
    if (!page) return undefined
    const column = readLadder({ tables, rows, priceLevels }).find((c) =>
      c.tableIds.includes(page.facts.id),
    )
    return column ? pricesOf(column.id) : undefined
  }, [page, tables, rows, priceLevels])
  /* ONE OF A BOAT MAKER'S BOATS, ON FITMENT: the first still sold, in the price list's own
     order — the boat Fitment's own finder answers first for the maker's name — and named on
     the press, so nobody is taken to a boat they were not told of. */
  const fits = useMemo(() => {
    if (!page || page.facts.kind !== 'boat' || page.ends !== null) return undefined
    const boat = findBoats(
      { entities: tables, rowsByEntity: rows },
      page.facts.name,
      Infinity,
    ).found.find((b) => b.place.tableId === page.facts.id)
    return boat ? { name: boat.name, href: fitmentOf(boat.place.rowId) } : undefined
  }, [page, tables, rows])
  /* WHICH PLATE A SPREAD WAS OPENED FROM, so its top edge can point at
     it; a row's table and a pairing list have no plate. */
  const plateAt = page ? register.plates.findIndex((p) => p.id === page.facts.id) : -1
  const openedFrom = plateAt >= 0 ? { index: plateAt, of: register.plates.length } : null

  /* THE FOCUS FOLLOWS THE SPREAD IN AND OUT. See `focusSpread`. */
  useEffect(() => {
    if (page) {
      if (focusSpread.current) {
        focusSpread.current = false
        backToList.current = true
        pageRef.current?.focus({ preventScroll: true })
      }
      return
    }
    if (backToList.current) {
      backToList.current = false
      list.current?.focus({ preventScroll: true })
    }
  }, [page])

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

  /* A SPREAD THAT OPENED WHERE NOBODY CAN SEE IT LOOKS LIKE A PRESS THAT
     DID NOTHING. At a desk it opens right under the shelf and nothing
     moves; on a phone the shelf is seven plates tall and the spread opens
     under the last of them, a screen and a half down. The scroll is never
     smoothed — the spread's own arrival is the one motion here. */
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

  /** A PRESS THAT CHANGES WHAT IS OPEN, turned where it can be seen and a pointer made it
   *  (`./turn.ts`): the room the spread opens in is the body's, and it is on the screen when
   *  its top is in the upper part of the window — the same test the scroll below uses. */
  const turned = useCallback((pointer: boolean, update: () => void) => {
    if (!pointer) {
      setArrival(null)
      update()
      return
    }
    const top = room.current?.getBoundingClientRect().top
    const seen = top !== undefined && top >= 0 && top < window.innerHeight * 0.6
    if (seen && canTurn()) {
      turn(() => {
        setArrival('turned')
        update()
      })
      return
    }
    setArrival('risen')
    update()
  }, [])

  /** A page is opened on a table — a plate's, a row's, a chip's. */
  const openPage = useCallback(
    (tableId: string, pointer = false) => {
      turned(pointer, () => {
        setCursor(tableId)
        setPeeking(true)
        setRefused(null)
      })
    },
    [turned],
  )

  /** ANYTHING ON THE SHELF PRESSED — a plate, the counted strip under
   *  it, or one of its pairing lines — opens what was pressed, at every
   *  width, which is what a press does on a row too. A plate is a
   *  toggle (`aria-pressed`): pressing the maker that is already open
   *  closes it, the way pressing a lit tab again would. */
  const pressShelf = useCallback(
    (tableId: string, pointer: boolean) => {
      if (page && page.facts.id === tableId) turned(pointer, () => setPeeking(false))
      else openPage(tableId, pointer)
    },
    [page, openPage, turned],
  )

  /** Back to the tables, from the spread's own act or its Escape. */
  const closeSpread = useCallback(
    (pointer: boolean) => {
      turned(pointer, () => setPeeking(false))
    },
    [turned],
  )

  /* ============================================================
     THE ONE WRITE ON THIS SCREEN, AND ITS WAY BACK.
     ============================================================ */
  const make = useCallback((name: string, kind: TableKind): string | null => {
    const outcome = catalogue.getState().apply(createTable({ name, kind }))
    if ('refused' in outcome) return refusalSaid(outcome.refused)
    setStep({
      name: outcome.event.tableName ?? name.trim(),
      eventId: outcome.event.id,
      wasUndo: false,
    })
    setRefused(null)
    /* the new table is the one the event named; it lands under the
       desk's own place and its page opens on it, as the dialog closes
       over it — the dialog's own exit is the motion */
    const made = outcome.event.tableId
    if (made) {
      setArrival(null)
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
    setStep({ name: step.name, eventId: outcome.event.id, wasUndo: !step.wasUndo })
  }, [step])

  /* ============================================================
     THE KEYBOARD, BOUND TO THE LEDGER AND NOT TO THE WINDOW, AND NO KEY
     HERE IS A CHARACTER (2026-09-25, m2-last-critique.md major 7 — the
     specification's major 11). J, K, N and `/` were single-character
     shortcuts WCAG 2.2 SC 2.1.4 asks to be switchable, and twenty-five
     caps taught them at a desk. What is left is what every list has:
     the arrows, Home and End, Space to open a table here, Enter to open
     its sheet, Escape to step back.
     ============================================================ */
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (isField(event.target)) return
    const key = event.key
    if (event.metaKey || event.ctrlKey || event.altKey) return

    if (key === 'ArrowDown') {
      event.preventDefault()
      stepRows(1)
      return
    }
    if (key === 'ArrowUp') {
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
        /* the ledger steps away under the spread, so the focus goes with it */
        focusSpread.current = true
        openPage(atRow.id)
      }
      return
    }
    if (key === 'Enter') {
      event.preventDefault()
      if (atRow) openIt(atRow.id)
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
    const items = [
      ...(shelf.current?.querySelectorAll<HTMLElement>('[data-shelf-item]') ?? []),
    ].filter((el) => el.getClientRects().length > 0)
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
          {/* THE BUSINESS IS NOT NAMED HERE. Its name is the crest's, on the bar every screen
              carries, and "NORTHSIDE MARINE" over the title was the same fact twice in one
              window (docs/WORDS.md, one fact one place). */}
          <h1 className="dt-title">Data</h1>
        </div>

        {open ? <Rooms wrong={wrong} go={go} /> : null}

        {open && findable ? (
          <div className="dt-find">
            <span className="dt-find__field">
              <Input
                id="dt-find-field"
                ref={field}
                type="search"
                icon={MagnifyingGlassIcon}
                aria-label="Find a list"
                value={query}
                onValueChange={setQuery}
                onKeyDown={onFieldKey}
                aria-describedby={narrowed ? 'dt-find-said' : undefined}
                /* what a dealer looks a list up by: its name, or the section it is
                   under ("Trailers"); the workbook still answers, said nowhere */
                placeholder="A list or a section"
              />
            </span>
          </div>
        ) : null}

        {open ? (
          <span className="dt-act">
            {/* AN ACT IN THE HEAD, AND A QUIET ONE: a register of tables
                changes once per import, and a 70px act row under the ledger
                would cost the list two and a half of the eighteen rows it
                owes. It is NOT the screen's amber (built-critique-m2-close-2.md
                minor 22, 2026-09-25): Data is where the file is read, and a
                new register is the rarest thing done here, so the loudest
                object at the top of the desk and the first under the title
                at 390 was the one act nobody came for. In the kit it is the
                plate's pale well with its plus (2026-09-28): a firm act that
                is not the one thing, drawn for the blue room it stands on. */}
            <Button intent="secondary" icon={PlusIcon} onClick={() => setMaking(true)}>
              New list
            </Button>
          </span>
        ) : null}

        <div className="dt-head__stamp">
          {problem !== null ? (
            <p className="dt-stamp-line" role="alert">
              {problem}
            </p>
          ) : looking || !read ? (
            <p className="dt-stamp-line">Looking for the price list…</p>
          ) : open ? (
            <>
              {/* THE PRICE LIST AND ITS DATE, ONCE, in Entry's words. The fingerprint is the
                  date's hover and nowhere else: seven characters of mono and "read from this
                  browser · packed" were the engine's account of the file, on the line a
                  dealer reads for which price list this is (docs/WORDS.md). */}
              <p
                className="dt-stamp-line dt-stamp-file"
                data-testid="data-file"
                title={
                  provenance.known
                    ? `Master Price File · fingerprint ${provenance.file.fingerprint}`
                    : undefined
                }
              >
                {provenance.known ? (
                  <>
                    The price list of <b>{packedOn(provenance.file.packedAt, 'long')}</b>
                  </>
                ) : (
                  'The Master Price File'
                )}
              </p>
              <p className="dt-stamp-line" data-testid="data-counts">
                {/* THE PRICE LIST'S SIZE IS SAID HERE AND ON NO SALE SCREEN (docs/WORDS.md: the
                    pill's "Data 53" is the shell's to drop). "28 say what fits which boat" stood
                    over rows that each say what they fit, and is gone (the refine round's second
                    pass, 2026-10-21). The file's own: a list made here is not counted in it, and
                    is listed last under "Your own lists". */}
                <span className="dt-stamp-unit">
                  <b>{n(register.head.tables)}</b> lists
                </span>
                {' · '}
                <span className="dt-stamp-unit">
                  <b>{n(register.head.rows)}</b> lines
                </span>
              </p>
            </>
          ) : null}
        </div>
      </header>

      {step || refused ? (
        <div className="dt-said">
          {/* WHAT THE LAST WRITE SAID, on a white capsule with its way back at its end —
              a done tick in the given ink before the words, and the way back's own glyph
              turning the way the write will be turned */}
          {step ? (
            <output className="dt-step" data-testid="last-step" data-ground="plate">
              <span className="dt-step__done" aria-hidden="true">
                <Icon glyph={CheckCircleIcon} weight="fill" />
              </span>
              <span className="dt-step__said">{stepSaid(step)}</span>
              <Button
                intent="secondary"
                size="sm"
                icon={step.wasUndo ? ArrowClockwiseIcon : ArrowCounterClockwiseIcon}
                onClick={goBack}
              >
                {step.wasUndo ? 'Put it back' : 'Undo'}
              </Button>
            </output>
          ) : null}
          {refused ? (
            <p className="dt-alarm" role="alert" data-ground="plate">
              <Refusal>{refused}</Refusal>
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
                models={models.get(plate.id)}
                index={i}
                on={page !== null && wanted === plate.id}
                tabStop={shelfCursor}
                onPress={(pointer) => pressShelf(plate.id, pointer)}
                onMore={(pointer) => openPage(plate.id, pointer)}
                onChip={pressShelf}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {open && narrowed ? (
        <p className="dt-narrowed" id="dt-find-said" role="status">
          {shown.length === 0
            ? NOTHING_CALLED(query)
            : `${n(shown.length)} of ${n(register.rows.length)} lists match “${query.trim()}”.`}
        </p>
      ) : null}

      <div className="dt-body" ref={room} data-open={page ? '' : undefined}>
        {page ? (
          <Spread
            /* a new spread for a new table, so its arrival is drawn again */
            key={page.facts.id}
            hold={pageRef}
            page={page}
            lineup={lineup}
            from={openedFrom}
            arrival={arrival}
            onClose={closeSpread}
            onOpen={openIt}
            canOpen={Boolean(openTable)}
            openCustomers={openCustomers}
            pricesHref={pricesHref}
            fits={fits}
            go={go}
            holds={
              plateAt >= 0
                ? holdsSay(register.plates[plateAt]!, models.get(page.facts.id))
                : undefined
            }
          />
        ) : null}

        {open ? (
          /* THE LEDGER STEPS AWAY WHILE A SPREAD IS OPEN, and is kept rather
             than thrown away: its cursor, its scroll and its rows are where
             they were when the spread closes. */
          <div className="dt-ledger" data-ground="plate" hidden={page !== null}>
            <div
              className="dt-list"
              ref={list}
              role="grid"
              tabIndex={0}
              aria-label="Lists"
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
                      onPoint={(id) => {
                        /* the ledger steps away under the spread, so the focus
                           goes into the spread and Escape brings the ledger back;
                           a row is only ever pressed by a pointer, so it turns */
                        focusSpread.current = true
                        openPage(id, true)
                      }}
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
            {/* NO SENTENCE UNDER THE ROWS. "Press a maker or a list to open it here; its sheet is
                one more press" explained the screen to the person using it; a row that lights
                under the pointer and carries its arrow says it (docs/WORDS.md, rule 1). */}
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
/* The price list's rooms                                      */
/* ---------------------------------------------------------- */

/* THE FOUR ROOMS BEHIND THE DATA DOOR, AT ITS HEAD (2026-10-22, the critique of Milestone 3,
   blocker 1: "three of the four new screens have no door"). Rules, Fitment, Review and Prices
   are the price list read four ways, and until this line the only way into three of them was
   to know a word to type into the finder. They are drawn as a small capsule of their own in the
   pill's vocabulary — a glyph, a word, and a count in its well — because they are doors, and
   the dealer learnt what a door looks like on the pill. The list is `PRICE_LIST_ROOMS`, the one
   the finder reads, so no address is spelled here. Review carries the one figure: what is wrong
   in the price list, counted as Review counts it; a clean list draws no count at all. */
function Rooms({ wrong, go }: { wrong: number | null; go?: (href: string) => void }) {
  return (
    <nav className="dt-rooms" aria-label="Behind the price list" data-ground="plate">
      <ul className="dt-rooms__list">
        {PRICE_LIST_ROOMS.map((room) => {
          const glyph = glyphOfWay(room.href)
          const counted = room.href === '/review' && wrong !== null
          const said = !counted
            ? `${room.word} — ${room.title.toLowerCase()}`
            : wrong === 0
              ? `${room.word} — nothing is wrong in your price list`
              : `${room.word} — ${n(wrong)} ${wrong === 1 ? 'case' : 'cases'} to settle in your price list`
          return (
            <li key={room.href} className="dt-room">
              <Button
                intent="quiet"
                size="sm"
                href={room.href}
                icon={glyph ?? undefined}
                aria-label={said}
                title={room.say}
                onClick={go ? () => go(room.href) : undefined}
              >
                {room.word}
                {counted && wrong > 0 ? (
                  <span className="dt-room__count" data-testid="data-wrong">
                    {n(wrong)} to settle
                  </span>
                ) : null}
              </Button>
            </li>
          )
        })}
      </ul>
    </nav>
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

/** WHAT A LIST FITS, in the dealer's words (docs/WORDS.md: "pairs with 6 boats" → "fits 6
 *  boats"). A list no boat names says so: "fits no boat yet" where a thing can be fitted to a
 *  boat — a motor, a trailer, a part — and "not tied to a boat" for a list of rates or costs,
 *  which no boat is ever fitted with. */
export function fitsSay(boats: number, kind: TableKind): string {
  if (boats === 0) return kind === 'custom' ? 'not tied to a boat' : 'fits no boat yet'
  return `fits ${n(boats)} ${boats === 1 ? 'boat' : 'boats'}`
}

/* ---------------------------------------------------------- */
/* One row                                                     */
/* ---------------------------------------------------------- */

/* A ROW SAYS ITS NAME, ITS COUNT AND WHAT IT FITS, and nothing it shares with the rows around
   it. Its kind is its glyph in its own ink (the count's noun says it in words: "73 trailers"),
   its place is the margin head once per run, and where it came from — a workbook and a sheet,
   the same one eight times under TRAILERS — is on its spread, one press away. It carries no
   hover: the pack generator's reading notes were its title until 2026-10-20, and those stay
   in docs. */
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
      <span className="dt-cell dt-cell--kind" role="gridcell">
        <KindMark kind={row.kind} size="sm" />
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
        {row.retired ? null : fitsSay(row.namedBy.models, row.kind)}
      </span>
      {/* THE KIT'S REGISTER ARROW: it says a press opens this row, and it slides forward
          under the pointer and on the row under the cursor. A picture of the press and
          nothing a reader needs, so the cell holding it says nothing. */}
      <span className="dt-cell dt-cell--go" role="gridcell" aria-hidden="true">
        <Icon glyph={ArrowRightIcon} />
      </span>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* One plate                                                   */
/* ---------------------------------------------------------- */

/* WHAT GOES WITH A MAKER IS THE PLATE'S OWN FOOT, ON ITS PAPER (2026-10-20). It hung under the
   plate on the room's ground, and the overlap reading found each line's count ending 2–6px
   from the next maker's glyph: "2,519 ▣ Yamaha Outboards 239" read as one line across two
   makers. Inside the plate the plate's own padding is the gutter, and the lines carry no count
   — "2,519 pairings" was the engine's unit beside a row saying "209 motors".

   At 1440 and over, and on a phone, every list is drawn by name. Between 640 and 1439, where
   the eighteen rows are owed, the foot is ONE line: "Goes with" and one glyph per kind of
   thing, in its own ink — a motor, a trailer, a part, a fit package — and the names are on the
   maker's spread, one press away. */

/* THE PLATE'S DOOR IS THIS SCREEN'S OWN BUTTON and not a `Tile`, and
   the reason is the shelf's one tab stop: a Tile is a tab stop of its
   own by design, and the roving cursor above needs `tabindex` on every
   button it moves between. So the plate carries the kit's option tile
   by hand, in the kit's own tokens (`data.css`). */

/** A click a pointer made. A key's click on a button has no pointer
 *  behind it and says so with a `detail` of 0. */
const byPointer = (event: { detail: number }): boolean => event.detail > 0

/** What a maker holds, as Home and the picker count it: its models, in the series the price
 *  list cuts them into. A table whose lines are its models already says so. */
function holdsSay(plate: Plate, models: number | undefined): string {
  if (models === undefined || models === 0 || models === plate.rows) return plate.holds
  const said = `${n(models)} ${models === 1 ? 'model' : 'models'}`
  return plate.branchSay ? `${said} ${plate.branchSay}` : said
}

/** Each kind once, in the order the lists first name it. */
function kindsOf(plate: Plate): TableKind[] {
  const seen: TableKind[] = []
  for (const p of plate.pairings) if (!seen.includes(p.farKind)) seen.push(p.farKind)
  return seen
}

/**
 * IN A HAND THE FIRST WINDOW ENDS ON A SEAM BETWEEN TWO PLATES, never through one
 * (refine-critique.md, major 5, 2026-10-21). At 390 × 844 Formosa's "Yamaha Outboards" stood
 * at 791–806 and the tab bar begins at 794: half over the bar and half under it, until the page
 * moved. Every plate's door takes the same air round its mark — the plates of a shelf are drawn
 * alike — so the last whole plate ends 18px above the bar (the air the pill keeps over a head on
 * a desk; the bar stands 6px inside its room), and the next begins under the bar's ground. The
 * mark itself is never enlarged: drawn twice its size, Highfield's ran the plate's width and
 * Stabicraft's name stood in an empty box. The air is never more than the mark is tall; of the
 * plates that can end there, the furthest down. Where none can, the doors keep the stylesheet's.
 *
 * MEASURED, NOT TYPED: the plates' own places on the page, the air already given taken away so
 * the measure does not move when it does, and the bar's room read off the shelf's
 * `scroll-margin-block-end`, which is `--shell-foot` (data.css) and 0 wherever the bar is not at
 * the foot.
 */
const ROOM_AIR = 12
function useShelfFit(shelf: RefObject<HTMLUListElement | null>, plates: number): void {
  useEffect(() => {
    const ul = shelf.current
    if (!ul || plates === 0 || typeof ResizeObserver === 'undefined') return
    const pageTop = (el: HTMLElement): number => {
      let y = 0
      for (let at: HTMLElement | null = el; at; at = at.offsetParent as HTMLElement | null)
        y += at.offsetTop
      return y
    }
    let given = 0
    let last = ''
    const fit = (): void => {
      const foot = Number.parseFloat(getComputedStyle(ul).scrollMarginBlockEnd) || 0
      const mark = ul.querySelector<HTMLElement>('.dt-plate__mark')?.offsetHeight ?? 0
      let best: number | null = null
      if (foot > 0 && mark > 0) {
        const fold = window.innerHeight - foot - ROOM_AIR
        const cards = [...ul.querySelectorAll<HTMLElement>(':scope > .dt-plate')]
        for (const [i, card] of cards.entries()) {
          const k = i + 1
          const air = Math.floor((fold - (pageTop(card) + card.offsetHeight - k * given)) / k)
          if (air >= 0 && air <= mark) best = air
        }
      }
      const said = best === null ? '' : `${best}px`
      if (said === last) return
      last = said
      given = best ?? 0
      if (said === '') {
        ul.style.removeProperty('--plate-air')
        delete ul.dataset.fit
      } else {
        ul.style.setProperty('--plate-air', said)
        ul.dataset.fit = ''
      }
    }
    fit()
    const watch = new ResizeObserver(fit)
    watch.observe(ul)
    window.addEventListener('resize', fit)
    return () => {
      watch.disconnect()
      window.removeEventListener('resize', fit)
    }
  }, [shelf, plates])
}

function PlateCard({
  plate,
  models,
  index,
  on,
  tabStop,
  onPress,
  onMore,
  onChip,
}: {
  plate: Plate
  /** its models as `countBoats` counts them, or undefined where it counts none */
  models: number | undefined
  index: number
  on: boolean
  /** the id of the one shelf button Tab lands on */
  tabStop: string
  onPress: (pointer: boolean) => void
  onMore: (pointer: boolean) => void
  onChip: (joinId: string, pointer: boolean) => void
}) {
  const choice: MarkChoice = markFor(plate.name, 'paper')
  const lists = plate.pairings.length
  const stop = (id: string): 0 | -1 => (id === tabStop ? 0 : -1)
  const holds = holdsSay(plate, models)
  return (
    <li className="dt-plate" data-on={on ? '' : undefined} data-testid="plate">
      <button
        type="button"
        className="dt-plate__door"
        id={doorId(plate.id)}
        data-shelf-item=""
        data-plate={index}
        data-item={0}
        data-ground="plate"
        tabIndex={stop(doorId(plate.id))}
        aria-label={`${plate.name} · ${holds}`}
        aria-pressed={on}
        onClick={(event) => onPress(byPointer(event))}
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
              /* the mark travels from here into the spread's cover, so while its spread is
                 open the cover carries its name and the plate does not (`./turn.ts`) */
              style={on ? undefined : { viewTransitionName: markName(plate.id) }}
            />
          ) : (
            <span className="dt-plate__typed">{plate.name}</span>
          )}
        </span>
        {/* A PLATE NAMES ITS MAKER EXACTLY ONCE, as Home's makers do: the drawn mark is the
            name, and where none is drawn the name is set in type in its place. The name under a
            mark said the maker a second time on six of seven plates (the refine round's second
            pass, 2026-10-21); a reader hears it in the door's own name. */}
        <span className="dt-plate__holds">
          {holds}
          {plate.retired ? ' · no longer sold' : ''}
        </span>
      </button>
      <div className="dt-plate__foot" data-ground="plate">
        {lists > 0 ? (
          <>
            <ul className="dt-chips" aria-label={`What goes with ${plate.name}`}>
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
                    aria-label={`${p.farName}${p.retired ? ' · no longer sold' : ''}`}
                    onClick={(event) => onChip(p.joinId, byPointer(event))}
                  >
                    {/* what goes with it, as its kind's glyph in its own ink: an engine is a
                        motor list before its name is read */}
                    <span className="dt-glyph" data-accent={accentOf(p.farKind)} aria-hidden="true">
                      <Icon glyph={KIND_GLYPH[p.farKind]} weight="fill" />
                    </span>
                    <span className="dt-chip__name">{p.farName}</span>
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="dt-plate__strip"
              id={moreId(plate.id)}
              data-shelf-item=""
              data-plate={index}
              data-item={lists + 1}
              tabIndex={stop(moreId(plate.id))}
              aria-label={`What goes with ${plate.name}: ${plate.pairings.map((p) => p.farName).join(', ')}`}
              onClick={(event) => onMore(byPointer(event))}
            >
              <span className="dt-strip__say">Goes with</span>
              <span className="dt-strip__kinds" aria-hidden="true">
                {kindsOf(plate).map((kind) => (
                  <span key={kind} className="dt-glyph" data-accent={accentOf(kind)}>
                    <Icon glyph={KIND_GLYPH[kind]} weight="fill" />
                  </span>
                ))}
              </span>
            </button>
          </>
        ) : (
          <p className="dt-plate__none">Nothing on the price list goes with it yet.</p>
        )}
      </div>
    </li>
  )
}

/* ---------------------------------------------------------- */
/* Teaching, on a desk with no file                            */
/* ---------------------------------------------------------- */

function Teach({ openTheFile }: { openTheFile?: () => void }) {
  return (
    /* ON THE KIT'S WHITE PLATE, with the door back as the one amber act: loading the file
       is the only thing this state can be pressed for */
    <div className="dt-teach">
      <Surface as="section" label="The price list" pad="lg">
        <div className="dt-teach__in">
          <TeachWords openTheFile={openTheFile} />
        </div>
      </Surface>
    </div>
  )
}

/* THREE SHORT ANSWERS, about the price list and never about how the app keeps it: "this
   screen reads what this browser has kept and never the file itself" was the engine's account
   of itself (docs/WORDS.md, rule 1). "This computer" is the one phrase for where it is kept. */
function TeachWords({ openTheFile }: { openTheFile?: () => void }) {
  return (
    <>
      <h2 className="dt-teach__head">No price list is open on this computer.</h2>
      <div>
        <p className="dt-teach__q">What lands here</p>
        <p className="dt-teach__a">
          <b>Every list on the Master Price File</b>: the boat makers across the top with what
          goes with each, and the motors, trailers, parts, fit packages and rates beneath them.
        </p>
      </div>
      <div>
        <p className="dt-teach__q">Why it is empty today</p>
        <p className="dt-teach__a">
          This computer holds no copy of it: it was read once and not kept, or it was cleared.
        </p>
      </div>
      <div>
        <p className="dt-teach__q">What to do</p>
        <p className="dt-teach__a">Load the Master Price File. It is kept on this computer after that.</p>
      </div>
      {openTheFile ? (
        <div className="dt-teach__door">
          <Button intent="act" icon={ArrowRightIcon} onClick={openTheFile}>
            Load the Master Price File
          </Button>
        </div>
      ) : null}
    </>
  )
}

/* ---------------------------------------------------------- */
/* The dialog that makes a list                                */
/* ---------------------------------------------------------- */

/* A LIST OF THE DEALER'S OWN, ASKED FOR IN THE DEALER'S WORDS (2026-10-20). The dialog said
   "register" three times, "row" three times, "column" twice, "kind" three times and
   "workbook" once, and promised how the sheet would grow. It now says what the list is for
   and asks one question about it, and makes no promise about rows and columns. */
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
      title="A new list"
      description="A list of your own — boat show leads, a price you keep. It starts with names; add what you need."
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
          <Button intent="primary" icon={PlusIcon} onClick={submit}>
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
        <Field label="What is on it?">
          <Select<TableKind>
            options={KIND_CHOICES}
            value={kind}
            /* the choice wears its glyph on the trigger, the same one its row will */
            kind={kind}
            onValueChange={(next) => setKind(next ?? 'custom')}
            aria-label="What is on it?"
          />
        </Field>
      </div>
    </Dialog>
  )
}
