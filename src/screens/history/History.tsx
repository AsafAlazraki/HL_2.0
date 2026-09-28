/* ============================================================
   TWO LINT RULES TURNED OFF FOR THIS FILE, for the reasons the quotes
   register gives at length in `src/screens/quotes/Quotes.tsx` and
   which hold here word for word: the density ruler reads
   `[role="row"]` off the page, and a spine whose lines are `<tr>`s
   laid out as CSS grids announces less than these divs do; and the
   grid uses the APG `aria-activedescendant` pattern — ONE tab stop
   that owns the whole keyboard vocabulary — rather than a key
   handler per line, which is the roving-tabindex pattern this
   deliberately is not.
   ============================================================ */
/* eslint-disable jsx-a11y/prefer-tag-over-role, jsx-a11y/click-events-have-key-events */
import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react'
import {
  ArrowDownIcon,
  ArrowRightIcon,
  CalendarDotsIcon,
  CheckCircleIcon,
  ClockCounterClockwiseIcon,
  DatabaseIcon,
  FilePlusIcon,
  FileTextIcon,
  FolderOpenIcon,
  HandCoinsIcon,
  InfoIcon,
  MagnifyingGlassIcon,
  PaletteIcon,
  QuestionIcon,
  RepeatIcon,
  SignpostIcon,
  TrashIcon,
  TrayIcon,
  UserIcon,
  XIcon,
} from '@phosphor-icons/react'
import {
  Button,
  Chip,
  Icon,
  Input,
  Picture,
  PriceFigure,
  Refusal,
  StatusDot,
  closesStage,
  isField,
  move,
  stageKeyOf,
  transition,
  useStill,
  type Glyph,
  type QuoteState,
} from '@/ui'
import { makeCtx, type EntityDef, type QuoteDef, type QuoteEvent } from '@/domain/model'
import { createViewFor } from '@/domain/catalogue/views'
import {
  freezeCustomer,
  linkCustomer,
  mintQuote,
  referenceForNow,
  setCustomer,
  subjectStillOnSheet,
  unsellableSubject,
} from '@/domain/quote'
import { localDay, localDayOf } from '@/domain/quote/day'
import { FIND_FIELD_AT } from '@/domain/quote/find'
import { boatOfQuote } from '@/domain/quote/spoken'
import { NOTHING_ON_IT, NOT_PRICED, type RegisterStateId } from '@/domain/quote/register'
import { isEmptyQuote, quoteTotals, totalIsNothingByDefault } from '@/domain/quote/totals'
import { quoteAgain, whyNotAgain, type AgainPorts } from '@/domain/quote/diary/again'
import {
  ANY_CUSTOMER,
  NO_CUSTOMER,
  SPAN_TITLE,
  STANDING_TITLE,
  dayTitle,
  filterQuotes,
  indexQuotes,
  spanFrom,
  standingOf,
  versionMark,
  versionsOf,
  type HistoryIndex,
  type SpanKey,
} from '@/domain/quote/diary/history'
import {
  NO_DIARY,
  STRANDS,
  STRAND_TITLE,
  dayWritten,
  daysFrom,
  diarySince,
  eventDay,
  inDiaryOrder,
  indexDays,
  kindParts,
  localTimeOf,
  rhythmOf,
  strandOf,
  type DayEntry,
  type DiaryDay,
  type DiarySince,
  type KindStrand,
} from '@/domain/quote/diary/days'
import { countPriceFile } from '@/domain/catalogue/priceFile'
import { useCatalogue, useQuotes, useSession } from '@/app/useStores'
import { quotes as quotesStore } from '@/state/quotes'
import { ctxFrom } from '@/state/catalogue'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { fortnightOf, spanWritten, type Fortnight } from '@/domain/quote/diary/fortnight'
import { markOnDark, pictureOfQuote, srcSetOf } from '@/data/pictures'
import { boatTravel } from '@/screens/picker/travel'
import './history.css'

/* ============================================================
   HISTORY — direction A, "The spine", from
   docs/research/refs/history/notes.md §5, ASSIGNED for this round
   because the critic found that the obvious picks across the five
   Cockpit sweeps would stamp one list-left, detail-right shape on
   four screens (critique-m2.md §3). Provisional until the owner
   looks (docs/SCREENS.md).

   WHAT THIS SCREEN DOES THAT NO OTHER DOES: it shows what was DONE,
   event by event, on the day it was done. The register is STATE —
   where every document stands now; this is TIME — what happened to
   them, in the app's own words, on which day. Home counts, the
   register lists, the document prints; only this reads the diary.

   THE COMPOSITION. One vertical spine. Each day is a node on it,
   newest first, Today always at the top whether or not anything has
   happened yet — because today is where the next entry goes, and
   the one act on this screen, New quote, sits on that node. Under a
   node, ONE FOLDED LINE per quote touched that day: the reference in
   mono, what happened counted in words (`started · 7 picks · issued`,
   `kindsSay`'s own), the boat and who it is for, where the document
   stands, and its frozen total. A line opens IN PLACE to that
   quote's diary: its versions as dated entries, every event on it
   oldest first as one dated list with the day's own entries marked,
   and at the foot the act on a past thing — `Quote this again, at
   today's prices` — or the sentence refusing it, where it is refused.

   B'S GUTTER TALLY IS KEPT, as a figure the day head carries:
   `3 quotes · 11 events · 1 given · $66,584` — every one a count or
   a sum of frozen lines (`tallyOf`, and its header says which sum).
   C'S ONE-QUOTE DIARY IS KEPT, as what a folded line opens into
   rather than a second pane beside the list — which is the whole of
   why this screen is not another master–detail.

   ── THE FRAMES THIS LEANS ON, and what each decided ─────────
   `live/github-commits.png` — the day as a node on a spine, the
   absolute date once on the head, the rows beneath it: the shape.
   `live/github-pr-20463-scrolled.png` — `eps1lon added 21 commits`
   as ONE line on the spine with the 21 beneath: same-kind events
   counted into one line. `live/sublime-merge.png` — message over
   author with the time set right, three tones and nothing else: the
   weight of an opened entry, the sentence at full weight, `by` and
   the time in the quiet tone. `live/stripe-payouts-timeline.png` —
   "see the return reason listed in the Timeline section": the
   refusal on the timeline, which is where `whyNotAgain` stands.
   `hand/github-commits-390.png` — in a hand the spine stays at the
   gutter and the meta wraps under the title: the 390 reflow. Linear
   is deliberately NOT leaned on: it is the register's primary and the
   critic found it claimed twice in this sweep.

   ── WHAT THE FOLD IS ─────────────────────────────────────────
   AN INVENTION, owned as one: no frame shows a counted line folded
   and then opened in place — GitHub's 21 commits are simply open
   beneath their line, with no fold control anywhere, and Linear's
   collapsed history is a changelog sentence (critique-m2.md §1). The
   stylesheet header says what the fold is and why.

   ── WHAT THE CRITIC FOUND, AND HOW IT IS ANSWERED ────────────
   · THE CALENDAR. `groupByDay` cuts by `createdAt`, so a quote
     started Monday and issued Friday sat under Monday with
     `… is issued` beneath it. `src/domain/quote/diary/days.ts` is
     the reader over `QuoteEvent.at` this screen is drawn from: a
     day head stands over that day's events and nothing else, and
     the same document appears under every day it was touched.
   · THE ROOM is 657px measured on the quotes register at 1280×800,
     not the 604 the sweep estimated; this screen's own arithmetic is
     in `history.css` and measured on the built screen.
   · `helmlogic-original.md` §2.3 "Everything after issued" — the
     original's contracts, deposits, schedules and factory tracking —
     is read and does NOT apply: none of it is written by this
     engine, so none of it can be diaried, and a diary that drew a
     "delivered" node nobody wrote would be the fake data this repo
     refuses. What does apply is its own honesty line: the original's
     per-document audit is what `QuoteEvent` is, and this screen is
     the first surface to read it whole.
   · `dense-tables-and-selection.md` — what applies: `content-
     visibility` over JS virtualisation (its rejection row), the
     shortcut rendered inline to teach it (its adoption row), and
     WCAG 2.1.4's exemption for single keys "active only on focus",
     which is why every letter below is bound to the spine and to
     nothing else.

   ── WHAT THE BUILT CRITIQUE FOUND, 2026-09-23 (built-critique-m2.md) ──
   · #4, A DAY IN AN ORDER THAT CANNOT HAVE HAPPENED — `addressed ·
     started · issued` at 1440 and `issued · addressed · started` at
     390, one tree. Fixed in the ENGINE (`inDiaryOrder`, days.ts): by
     instant, then by the event's place in its quote's own log, never
     by a random id. Nothing on this screen sorts events by itself any
     more; the fold's whole diary reads through the same function.
   · #14, ROUTER PATTERNS SHOWN TO A DEALER — `/quote/$id`, `/quote/
     $id/document`, `/quote/new`, `/customers`. Every one is words now,
     and the acts beside them are what go there.
   · #17, ONE LINE AND 700PX OF FLOOR. The spine now runs to its own
     END: the foot of the spine is where the diary began — the day and
     time of the first thing this browser kept, and what it has held
     since, counted (`diarySince`). With one line it stands at the foot
     of the window and the spine is drawn down to it, so the floor is
     the length of the diary rather than what was left over; with a
     full diary it is simply the last thing on the spine.
   · #18, KEYCAPS ON A PHONE — and, from 2026-09-25, at a desk too
     (m2-last-critique.md major 7): no cap is drawn anywhere on this
     screen, and the foot says how to open a line in words a finger
     and a mouse share.
   · RULE (a), THE PILL CARRIES THE DOORS: the head's own Home is gone.
   · AND ONE THE CRITIC DID NOT NAME: while the price file was still
     being read, the head said "No price file is open in this browser"
     — false for those seconds (the register's #15), and in a sentence
     long enough to wrap, so the head's height, and with it the room
     the density ruler reads, hung on which state the file was in. It
     says "Looking for a price file" now, in one line that never wraps,
     and the head is one height in every state.
   · COLOUR, WHICH THE OWNER ASKED FOR ("a bit more colour usage"): each
     counted word on a line carries a pip in its STRAND's ink — begun,
     built, priced, addressed, given, taken back (`strandOf`) — so a
     line that went the whole way in one sitting reads blue, violet,
     green before a word of it is read. The inks are the model's own
     accent tokens; the key to them is printed at the foot.

   ── WHAT IS TRUE ON THIS BUILD AND WOULD NOT BE ON A BOARD ────
   · EVERY SENTENCE ON AN OPENED LINE IS A COMMAND'S OWN `said`
     (`src/domain/quote/commands.ts`), printed verbatim with its own
     time. This file writes sentences about ADDRESSES and about
     ABSENCES — where a press lands, why the diary is empty — and
     never one about an event.
   · A DOCUMENT WITH NO DIARY IS SHOWN, not skipped: it sits under
     the day it was made and its line says `no diary kept`. Until
     2026-09-22 every freshly minted document was one, because the
     store put the document away without the event that made it; it
     keeps it now (`src/state/quotes.ts`, `file`).
   · QUOTE THIS AGAIN IS NOT A RESTORE. `quoteAgain` mints a NEW
     draft for the same row on the same page at TODAY's prices, and
     re-freezes the customer from the register where there is one.
     It writes through the engine's own doors and the new document
     lands under Today with its own first line — the diary records
     the act it just did. Its way back is `Discard it`, pinned to
     the document it made.

   ── IN THE KIT'S LANGUAGE, 2026-09-28 ─────────────────────────
   The owner: "components are so bland and boring". The same spine,
   the same days, the same folded lines — drawn in the kit's
   materials, glyphs and motion (src/ui, tokens.css THE KIT):
     · THE SPANS ARE THE KIT'S CHIPS, the chosen one filled with the
       accent, because in the kit the accent means "chosen".
     · WHERE A QUOTE STANDS is the kit's status dot beside its word —
       draft rose, given leaf, replaced graphite — the same three inks
       the register's bands and a customer's page wear, so a standing
       reads alike on every screen that says one.
     · TODAY'S NODE IS THE ACCENT, ringed: "where you are" is the
       accent's one job, and the amber it wore is the act's alone.
     · EVERY ACT CARRIES ITS GLYPH — a new paper on New quote, the arrow
       or the paper on the act that opens, a repeat on Quote this again.
     · A LINE OPENS OUT OF ITSELF: the fold grows from the line on the
       kit's travel spring and shuts faster than it opened, and a line
       the diary gains after the first paint fades in while the lines
       under it slide down to make room — never on an arrow key, and
       nothing moves while a caret is in the find field.
     · THE SHOWPIECE IS THE DIARY BEING WRITTEN, once, on the first
       paint: the spine draws down from Today to the day the diary
       began, each day's node lands on it, and the fortnight's dots
       drop into their days one after another (history.css, MOTION).
   ============================================================ */

/** Said where the press happened, when nothing handed this screen a
 *  way to a document. IN THE DEALER'S WORDS: until 2026-09-23 this and
 *  the next spelt the router's own patterns, `/quote/$id`, to a person
 *  (built-critique-m2.md #14). A refusal says where else the thing is. */
export const NO_WAY_TO_OPEN =
  'This screen was handed no way to open a document, so nothing was opened. Quotes, on the bar, opens every document filed here.'
/** Said at the act, when nothing handed this screen a way to the picker. */
export const NO_WAY_TO_THE_PICKER =
  'This screen was handed no way to the picker, so nothing was started. New quote on Home or on Quotes starts one.'
/** Said where `Quote this again` stands, on a desk whose price file is
 *  shut. `whyNotAgain` would otherwise say the row is off the sheet,
 *  which is a different fact from the sheet not being open at all. */
export const NO_SHEET_TO_PRICE_FROM =
  'No price file is open in this browser, so there is nothing to price it from today. Load the Master Price File and this quote can be raised again at today’s prices.'
/** Said in an opened line for a document filed with no diary on it. */
export const NO_DIARY_SAY =
  'This document carries no diary. It was filed before the sentence that made it was kept on the document, so the only day it can be placed on is the day it was made. It still opens and still prints.'
/** Why an empty diary is empty, said as what is true today. It never names
 *  an export, a backup, a sync or a server: none of them is on any screen,
 *  and a sentence that points at one is a promise nobody can press
 *  (built-critique-m2-close-2.md, major 4). */
export const WHERE_THE_DIARY_IS_KEPT =
  'No quote has been started in this browser. A quote is kept in the browser it was written in, so one written on another computer — or in another browser on this one — has no line here. An empty diary is the true state, not a fault. No entry is invented to fill it.'

export interface HistoryPosition {
  span?: SpanKey
  who?: string
  customer?: string
  open?: string
  day?: string
}

export interface HistoryProps {
  /** whose diary it is, read off what was opened; null is honest */
  business?: string | null
  /** NOT DRAWN, since 2026-09-23: the pill carries Home on every screen, and a screen's own
   *  head never repeats a door the pill already carries (the round's rule (a), critique
   *  #13). The route still hands it, so the seam is declared; nothing here reads it. */
  goHome?: () => void
  /** the door to the Master Price File, for a browser with no sheet */
  openTheFile?: () => void
  /** the picker, at `/quote/new`, where a quote is started */
  newQuote?: () => void
  /** one filed document, opened where it belongs: a draft where it is
   *  written, an issued or superseded one as the paper the customer
   *  holds. The state travels with the id because the route owns
   *  both addresses. */
  openQuote?: (id: string, state: RegisterStateId) => void
  /** one customer's own page, by the row the quote points at */
  openCustomer?: (rowId: string) => void
  /** the clock, injected: a test says which instant it is asking about */
  now?: () => Date
  /* ── THE ADDRESS ── a position inside a screen is a URL search param */
  span?: SpanKey
  who?: string
  customer?: string
  /** the id of the quote whose line is open, and the day it is open on */
  open?: string
  day?: string
  onPosition?: (position: HistoryPosition) => void
}

/** The last act on this screen and its way back — the rail-head
 *  pattern the configurator settled, never a toast. */
interface Step {
  /** the sentences the commands said, in order */
  saids: string[]
  /** the document the act made, which the way back is pinned to */
  quoteId: string
  reference: string
  /** true once the way back has been taken */
  discarded: boolean
}

const THE_CLOCK = (): Date => new Date()
const au = (n: number): string => n.toLocaleString('en-AU')
/** How long the diary's arrival is given before it lets go: its longest run — the beginning's
 *  words fading in after the spine's run has landed — is the morph's 588ms and the sheet's
 *  300ms, and a line that arrives after that is simply a line that arrived. */
const ARRIVAL_MS = 1200

/** One line on the spine, named by the day it is under and the
 *  document it is: the same quote appears under every day it was
 *  touched, so neither alone is a key. */
const keyOf = (day: string, quoteId: string): string => `${day}|${quoteId}`
const splitKey = (key: string): { day: string; quoteId: string } => {
  const at = key.indexOf('|')
  return at < 0 ? { day: '', quoteId: key } : { day: key.slice(0, at), quoteId: key.slice(at + 1) }
}
export const lineId = (key: string): string => `hy-line-${key.replace('|', '-')}`

const SPANS: readonly SpanKey[] = ['today', 'week', 'month', 'year']

export function History({
  business = null,
  openTheFile,
  newQuote,
  openQuote,
  openCustomer,
  now = THE_CLOCK,
  span: arrivedSpan = 'all',
  who: arrivedWho = '',
  customer: arrivedCustomer = ANY_CUSTOMER,
  open: arrivedOpen = '',
  day: arrivedDay = '',
  onPosition,
}: HistoryProps) {
  const filed = useQuotes((s) => s.quotes)
  const read = useQuotes((s) => s.loaded)
  const problem = useQuotes((s) => s.problem)
  const sheet = useCatalogue((s) => s)
  const whoIsHere = useSession((s) => s.name)

  const [span, setSpan] = useState<SpanKey>(arrivedSpan)
  const [who, setWho] = useState(arrivedWho)
  const [customer, setCustomerFilter] = useState(arrivedCustomer)
  /* THE CURSOR IS A LINE KEY, NOT AN INDEX — a span that narrows the
     spine or a quote raised again moves every index under a person. */
  const [wanted, setCursor] = useState<string>(arrivedOpen ? keyOf(arrivedDay, arrivedOpen) : '')
  const [asked, setOpen] = useState<string>(arrivedOpen ? keyOf(arrivedDay, arrivedOpen) : '')
  const [step, setStep] = useState<Step | null>(null)
  const [refused, setRefused] = useState<string | null>(null)
  /* THE DIARY IS BEING WRITTEN: true from the first paint until a moment after the diary has
     been read, which is how long the showpiece takes (history.css, MOTION). After it, a line
     the diary gains fades in on `enter` and nothing replays the arrival. */
  const [arriving, setArriving] = useState(true)
  useEffect(() => {
    if (!read) return
    const done = window.setTimeout(() => setArriving(false), ARRIVAL_MS)
    return () => window.clearTimeout(done)
  }, [read])

  /* THE GRID AND ITS SCROLLPORT ARE TWO BOXES since 2026-09-23: the grid is the one tab
     stop that owns the keyboard, and the port around it also carries the foot of the spine
     — where the diary began — which is not a row and must not be inside a grid. */
  const spine = useRef<HTMLDivElement>(null)
  const port = useRef<HTMLDivElement>(null)
  const field = useRef<HTMLElement>(null)
  const rowsRef = useRef(new Map<string, HTMLDivElement>())

  const today = localDayOf(now())
  const index = useMemo(() => indexQuotes(filed), [filed])

  /* THE NARROWING IS THE ENGINE'S, in two cuts on two calendars. The
     customer and the typed words cut the DOCUMENTS (`filterQuotes`,
     with its span left open); the span then cuts the DAYS by when
     something happened (`daysFrom`), which is the calendar a diary is
     read on and the one `filterQuotes` alone could not give. */
  const narrowedQuotes = useMemo(
    () => filterQuotes(filed, index, { standing: 'all', customer, span: 'all', query: who }, today),
    [filed, index, customer, who, today],
  )
  const allDays = useMemo(() => indexDays(narrowedQuotes), [narrowedQuotes])
  const from = spanFrom(span, today)
  const days = useMemo(() => daysFrom(allDays, from), [allDays, from])

  /* what the span hid, counted: the days, and the quotes only on them */
  const hidden = useMemo(() => {
    if (from === null) return { days: 0, quotes: 0 }
    const shownIds = new Set(days.flatMap((d) => d.entries.map((e) => e.quote.id)))
    const onlyHidden = new Set<string>()
    for (const d of allDays) {
      if (d.day >= from) continue
      for (const e of d.entries) if (!shownIds.has(e.quote.id)) onlyHidden.add(e.quote.id)
    }
    return { days: allDays.length - days.length, quotes: onlyHidden.size }
  }, [allDays, days, from])

  const events = useMemo(() => filed.reduce((n, q) => n + q.events.length, 0), [filed])

  /* TODAY IS ALWAYS THE FIRST NODE, drawn whether or not anything has
     happened yet, because today is where the next entry goes and the
     act that makes one sits on it. */
  const drawn = useMemo<DiaryDay[]>(() => {
    const todayDay: DiaryDay = days.find((d) => d.day === today) ?? {
      day: today,
      entries: [],
      tally: { quotes: 0, events: 0, given: 0, givenTotal: 0, givenSummed: 0 },
    }
    return [todayDay, ...days.filter((d) => d.day !== today)]
  }, [days, today])

  /* every line, in the order it is drawn — the cursor's order */
  const lines = useMemo(
    () => drawn.flatMap((d) => d.entries.map((e) => keyOf(d.day, e.quote.id))),
    [drawn],
  )
  const entryAt = useCallback(
    (key: string): { day: DiaryDay; entry: DayEntry } | undefined => {
      const { day, quoteId } = splitKey(key)
      const d = drawn.find((x) => x.day === day)
      const entry = d?.entries.find((e) => e.quote.id === quoteId)
      return d && entry ? { day: d, entry } : undefined
    },
    [drawn],
  )

  /* THE CURSOR NEVER POINTS AT NOTHING WHILE THERE IS SOMETHING TO
     POINT AT, and it is derived rather than repaired — the register's
     rule, for the register's reason. A line opened by address that is
     no longer drawn simply is not open. */
  /* A LINE NAMED BY ADDRESS WITHOUT ITS DAY — `?open=<id>` alone — is
     the newest line drawn for that document; a line no longer drawn
     is simply not a line. */
  const resolve = useCallback(
    (key: string): string => {
      if (key === '') return ''
      if (lines.includes(key)) return key
      const { day, quoteId } = splitKey(key)
      if (day !== '') return ''
      return lines.find((l) => splitKey(l).quoteId === quoteId) ?? ''
    },
    [lines],
  )
  const cursor = resolve(wanted) || (lines[0] ?? '')
  const open = resolve(asked)

  useEffect(() => {
    const at = open === '' ? undefined : splitKey(open)
    onPosition?.({
      span: span === 'all' ? undefined : span,
      who: who.trim() === '' ? undefined : who,
      customer: customer === ANY_CUSTOMER ? undefined : customer,
      open: at?.quoteId,
      day: at?.day,
    })
  }, [onPosition, span, who, customer, open])

  /* the cursor line is kept on screen, without smoothing, and a line
     already in the port is left alone — the register measured why */
  useEffect(() => {
    if (cursor === '') return
    const row = rowsRef.current.get(cursor)
    const scroller = port.current
    if (!row || !scroller) return
    const box = row.getBoundingClientRect()
    const inside = scroller.getBoundingClientRect()
    if (box.top >= inside.top && box.bottom <= inside.bottom) return
    row.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  const moveBy = useCallback(
    (by: number) => {
      if (lines.length === 0) return
      const here = lines.indexOf(cursor)
      const start = here < 0 ? 0 : here
      const next = Math.min(lines.length - 1, Math.max(0, start + by))
      setCursor(lines[next] ?? '')
    },
    [cursor, lines],
  )

  const toggle = useCallback((key: string) => {
    setCursor(key)
    setOpen((was) => (was === key ? '' : key))
  }, [])

  /** Open a document where it belongs. */
  const openIt = useCallback(
    (quote: QuoteDef) => {
      if (!openQuote) {
        setRefused(NO_WAY_TO_OPEN)
        return
      }
      openQuote(quote.id, stateFor(index, quote))
    },
    [index, openQuote],
  )

  const startOne = useCallback(() => {
    if (!newQuote) {
      setRefused(NO_WAY_TO_THE_PICKER)
      return
    }
    newQuote()
  }, [newQuote])

  /** Move to one quote's line — the newest day it is drawn on, or, if
   *  the span has cut every one of its days, with the span opened. */
  const goToQuote = useCallback(
    (quoteId: string) => {
      const key = lines.find((k) => splitKey(k).quoteId === quoteId)
      if (key) {
        setCursor(key)
        setOpen(key)
        return
      }
      const anyDay = allDays.find((d) => d.entries.some((e) => e.quote.id === quoteId))
      if (!anyDay) return
      setSpan('all')
      const k = keyOf(anyDay.day, quoteId)
      setCursor(k)
      setOpen(k)
    },
    [allDays, lines],
  )

  /* ============================================================
     THE ACT ON A PAST THING, and its refusal where it stands.

     `whyNotAgain` reads the sheet through `AgainPorts`, which are
     the engine's own doors bound to this browser's catalogue: the
     row still on the sheet, the row still sold. `quoteAgain` then
     mints through `createViewFor` and `mintQuote` — the same two
     calls the picker's act makes — files the document through the
     store, and re-freezes the customer from the register where the
     old document points at a row, or carries the typed name across
     where it does not. Not one figure is copied: that is the whole
     difference between this and "make a new version", and the
     sentence under the control says so.
     ============================================================ */
  const sheetOpen = sheet.status === 'ready' && Object.keys(sheet.tables).length > 0
  /* THE MAKER OF A QUOTE'S BOAT, by the name of the register its hull is a row of — whose mark
     a fortnight's card puts in its well where no photograph of the boat is held */
  const makerOf = useCallback(
    (q: QuoteDef): string | undefined =>
      (sheet.tables as Record<string, EntityDef | undefined>)[q.rootTableId]?.name,
    [sheet.tables],
  )

  const portsFor = useCallback(
    (at: Date, saids: string[]): AgainPorts => {
      const ctx = makeCtx({
        ...ctxFrom(sheet),
        views: { ...sheet.views },
        orgId: PACK_ORG_ID,
        quotes: [...filed],
        now: () => at.toISOString(),
      })
      let frozenRef: { tableId: string; rowId: string } | undefined
      return {
        subjectStillOnSheet: (q) => subjectStillOnSheet(ctx, q) !== undefined,
        unsellableSubject: (tableId, rowId) => unsellableSubject(ctx, tableId, rowId),
        quoteLikeThisOne: (q) => {
          const view = createViewFor(ctx, q.rootTableId)
          /* the same rung where the row still carries it; otherwise
             the rung a new quote opens at, which `mintQuote` chooses */
          const rungs = ctx.priceLevels[q.rootTableId] ?? []
          const minted = mintQuote(ctx, {
            viewId: view.id,
            rowId: q.rootRowId,
            reference: referenceForNow(quotesStore.getState().quotes, at),
            ...(rungs.some((r) => r.key === q.levelKey) ? { levelKey: q.levelKey } : {}),
            ...(whoIsHere ? { preparedBy: whoIsHere } : {}),
          })
          if (!minted) return null
          quotesStore.getState().file(minted.quote, minted.event)
          saids.push(minted.event.said)
          return quotesStore.getState().get(minted.quote.id) ?? minted.quote
        },
        freezeCustomer: (rowId) => {
          const frozen = freezeCustomer(ctx, rowId)
          if (!frozen) return null
          frozenRef = frozen.customerRef
          return frozen.customer
        },
        linkCustomer: (quoteId, frozen) => {
          const out = quotesStore
            .getState()
            .apply(
              quoteId,
              linkCustomer(
                frozenRef ? { customer: frozen, customerRef: frozenRef } : { customer: frozen },
              ),
            )
          if ('said' in out) saids.push(out.said)
        },
        patchQuote: (quoteId, patch) => {
          if (!patch.customer) return
          const out = quotesStore.getState().apply(quoteId, setCustomer(patch.customer))
          if ('said' in out) saids.push(out.said)
        },
      }
    },
    [filed, sheet, whoIsHere],
  )

  /** Why this quote cannot be raised again today, or '' when it can. */
  const whyNot = useCallback(
    (quote: QuoteDef): string => {
      if (!sheetOpen) return NO_SHEET_TO_PRICE_FROM
      return whyNotAgain(quote, portsFor(now(), []))
    },
    [now, portsFor, sheetOpen],
  )

  const again = useCallback(
    (quote: QuoteDef) => {
      const why = whyNot(quote)
      if (why !== '') {
        setRefused(why)
        return
      }
      const at = now()
      const saids: string[] = []
      const made = quoteAgain(quote, portsFor(at, saids))
      if (!made) {
        setRefused(
          `The ${boatOfQuote(quote).name} could not be quoted again: its line on the price file was read and the quote came back empty. Nothing was written.`,
        )
        return
      }
      setRefused(null)
      setStep({ saids, quoteId: made.id, reference: made.reference, discarded: false })
      const key = keyOf(localDayOf(at), made.id)
      setCursor(key)
      setOpen('')
    },
    [now, portsFor, whyNot],
  )

  /** THE WAY BACK FROM THE ONE WRITE ON THIS SCREEN, pinned to the
   *  document it made. A mint has no inverse — undoing a document into
   *  existence is discarding it — so this is `discard`, and it refuses
   *  with the store's own sentence if that document has moved on. */
  const takeItBack = useCallback(() => {
    if (!step || step.discarded) return
    const outcome = quotesStore.getState().discard(step.quoteId)
    const refusal = 'refused' in outcome && outcome.refused.trim() !== '' ? outcome.refused : null
    if (refusal) {
      setRefused(refusal)
      return
    }
    setRefused(null)
    setStep({
      ...step,
      discarded: true,
      saids: [`${step.reference} was discarded. It is not filed here any more.`],
    })
  }, [step])

  /* ============================================================
     THE KEYBOARD, BOUND TO THE SPINE AND NOT TO THE WINDOW, AND NO KEY
     HERE IS A CHARACTER (2026-09-25, m2-last-critique.md major 7 — the
     specification's major 11). J, K, Q, N, T, W, M, Y and `/` were
     single-character shortcuts WCAG 2.2 SC 2.1.4 asks to be switchable,
     and twenty-three caps taught them at a desk. What is left is what
     every list has: the arrows, Home and End move; Space opens a line in
     place and shuts it; Enter opens the document; Escape climbs the
     ladder — the fold, then the typed words, then the customer, then the
     span. Every other act is a control on the screen.
     ============================================================ */
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (isField(event.target)) return
    const key = event.key
    if (event.metaKey || event.ctrlKey || event.altKey) return

    if (key === 'ArrowDown') {
      event.preventDefault()
      moveBy(1)
      return
    }
    if (key === 'ArrowUp') {
      event.preventDefault()
      moveBy(-1)
      return
    }
    if (key === 'Home') {
      event.preventDefault()
      if (lines[0]) setCursor(lines[0])
      return
    }
    if (key === 'End') {
      event.preventDefault()
      const last = lines[lines.length - 1]
      if (last) setCursor(last)
      return
    }
    if (key === ' ' || key === 'Spacebar') {
      event.preventDefault()
      if (event.repeat) return
      if (cursor !== '') toggle(cursor)
      return
    }
    if (key === 'Enter') {
      event.preventDefault()
      const at = entryAt(cursor)
      if (at) openIt(at.entry.quote)
      return
    }
    if (key === 'Escape' && closesStage(stageKeyOf(event.nativeEvent))) {
      event.preventDefault()
      if (open !== '') setOpen('')
      else if (who !== '') setWho('')
      else if (customer !== ANY_CUSTOMER) setCustomerFilter(ANY_CUSTOMER)
      else if (span !== 'all') setSpan('all')
    }
  }

  const onFieldKey = (event: ReactKeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setWho('')
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'Enter') {
      event.preventDefault()
      spine.current?.focus()
    }
  }

  /* THE SPINE'S SHAPE, AS ONE STRING: which lines stand under which day, and whether the last
     step is said on Today's head. Every row's travel depends on it, so a line the diary gains —
     a quote raised again, a span let go — slides what is under it down to make room, and an
     arrow key, which only moves the cursor, measures nothing. A fold opening is not in it: the
     fold grows on its own spring and the lines under it are simply carried down by it. */
  const shape = `${step ? 'said' : ''}|${drawn
    .map((d) => `${d.day}:${d.entries.map((e) => e.quote.id).join(',')}`)
    .join('|')}`

  const held = filed.length
  const bare = read && held === 0
  const findable = held >= FIND_FIELD_AT
  const narrowed = who.trim() !== '' || customer !== ANY_CUSTOMER
  const customerName =
    customer === ANY_CUSTOMER
      ? null
      : customer === NO_CUSTOMER
        ? 'a typed name with no row behind it'
        : (filed.find((q) => q.customerRef?.rowId === customer)?.customer.name.trim() ?? customer)
  /* THE PRICE FILE WHILE IT IS BEING READ IS NEITHER OPEN NOR SHUT, and the head says which
     of the three it is — the register was caught saying "not open" during the read (#15). */
  const sheetReading = sheet.status === 'empty' || sheet.status === 'loading'

  return (
    <main
      className="hy"
      data-testid="history"
      data-read={read ? '' : undefined}
      data-arriving={read && arriving ? '' : undefined}
    >
      <header className="hy-head">
        <div className="hy-head__who">
          {/* THE BUSINESS, OR NOTHING YET: until the file has been read there is no name to
              print, and "not named" would be a claim about a file nobody has opened — or,
              once the read has found no file, about a business nobody named, which Northside
              is not (the sentence went on 2026-09-25). The line keeps its height, so the head
              does not move when the name arrives. */}
          <p className="hy-eyebrow">{business ?? ' '}</p>
          <h1 className="hy-title">History</h1>
        </div>

        {/* THE SPANS ARE DRAWN ONLY WHEN THERE IS SOMETHING TO CUT
            (the old render suite's rule: no filter bar over nothing),
            and the chosen one is marked by a rule the SCREEN draws
            under it — the primitive has no pressed look and a screen
            never reaches into one. Netlify's `Last hour · Last day ·
            Last 7 days` are the sweep's evidence for named spans as
            controls; the names are `SPAN_TITLE`'s. */}
        {/* IN THE KIT THE SPANS ARE CHIPS (src/ui/Chip.tsx): a white capsule each, the chosen
            one filled with the accent — the accent's one job is "chosen" — and pressed again it
            lets go, back to every day. The way back to every day is a chip of its own, led by
            the diary's own glyph, while a span is on. */}
        {held > 0 ? (
          <div className="hy-spans" role="group" aria-label="Which days">
            {SPANS.map((s) => (
              <Chip
                key={s}
                selected={span === s}
                onSelect={() => setSpan((was) => (was === s ? 'all' : s))}
              >
                {SPAN_TITLE[s]}
              </Chip>
            ))}
            {span !== 'all' ? (
              <Chip icon={ClockCounterClockwiseIcon} onSelect={() => setSpan('all')}>
                {SPAN_TITLE.all}
              </Chip>
            ) : null}
          </div>
        ) : null}

        {findable ? (
          <div className="hy-find">
            <span className="hy-find__field">
              <Input
                id="hy-find-field"
                ref={field}
                type="search"
                icon={MagnifyingGlassIcon}
                aria-label="Find in the diary"
                value={who}
                onValueChange={setWho}
                onKeyDown={onFieldKey}
                aria-describedby={narrowed ? 'hy-narrowed' : undefined}
                placeholder="A customer, a reference, a boat, a line"
              />
            </span>
          </div>
        ) : null}

        <div className="hy-head__stamp">
          {problem !== null ? (
            <p className="hy-stamp-line" role="alert">
              {problem}
            </p>
          ) : !read ? (
            <p className="hy-stamp-line">Reading what this browser has kept…</p>
          ) : (
            <p className="hy-stamp-line">
              <b>{au(held)}</b> {held === 1 ? 'quote' : 'quotes'} · <b>{au(allDays.length)}</b>{' '}
              {allDays.length === 1 ? 'day' : 'days'} · <b>{au(events)}</b>{' '}
              {events === 1 ? 'event' : 'events'}
            </p>
          )}
          <p className="hy-stamp-line hy-stamp-file">
            {/* THE FILE'S OWN GLYPH, the drum the Data door carries */}
            <span className="hy-stamp-glyph" aria-hidden="true">
              <Icon glyph={DatabaseIcon} />
            </span>
            {/* THE PRICE FILE'S TABLES, NOT THE SHEET'S (the critique of
                Milestone 2's close, blocker 2): the customers book is a
                table on the sheet, and this line read 54 the moment the
                first person was filed. */}
            {/* LISTS, as Home and Entry count the file, and "as it was written" rather
                than the engine's "frozen" (m2-last-critique.md, major 5) */}
            {sheetOpen
              ? `Priced from the Master Price File · ${au(countPriceFile(sheet.tables, sheet.rows, sheet.modules).tables)} lists`
              : sheetReading
                ? 'Looking for a price file in this browser…'
                : 'No price file is open · every figure here is as it was written'}
          </p>
        </div>
      </header>

      {/* WHAT A NARROWING DID, said between the head and the spine and
          only while one is on: the words quoted back, the customer
          named, the span counted — never a silent shorter list. */}
      {narrowed || (span !== 'all' && held > 0) ? (
        <p className="hy-narrowed" id="hy-narrowed" role="status">
          {narrowed
            ? narrowedQuotes.length === 0
              ? who.trim() !== ''
                ? `Nothing in the diary matches “${who.trim()}”. A quote is found here by its reference, its customer, its boat, a section or a line on it.`
                : `Nothing here is addressed to ${customerName}.`
              : `${au(narrowedQuotes.length)} of ${au(held)} ${who.trim() !== '' ? `match “${who.trim()}”` : `${narrowedQuotes.length === 1 ? 'is' : 'are'} addressed to ${customerName}`}.`
            : ''}
          {span !== 'all'
            ? /* "Today: every day is inside it." read as a riddle (built-critique-m2-close-2.md
                 minor 20); a span that hides nothing now says what it holds */
              `${narrowed ? ' ' : ''}${hidden.quotes === 0 && hidden.days === 0 ? `${SPAN_TITLE[span]} holds every quote in the diary.` : `${SPAN_TITLE[span]}: ${au(hidden.quotes)} ${hidden.quotes === 1 ? 'quote' : 'quotes'} on ${au(hidden.days)} earlier ${hidden.days === 1 ? 'day' : 'days'} ${hidden.quotes === 1 && hidden.days === 1 ? 'is' : 'are'} outside it.`}`
            : ''}
          {customer !== ANY_CUSTOMER ? (
            <>
              {' '}
              <Button
                intent="secondary"
                size="sm"
                icon={XIcon}
                onClick={() => setCustomerFilter(ANY_CUSTOMER)}
              >
                Everyone
              </Button>
            </>
          ) : null}
        </p>
      ) : null}

      <div className="hy-body">
        {/* THE PORT: the grid, and after it the spine's own end. `.hy-spine` is the box the
            lines scroll in and the list the density ruler fills; the end is not a row, so it
            stands outside the grid and inside the port, and the ruler neither counts it nor
            takes it off the room. */}
        <div className="hy-spine" ref={port}>
          <div
            className="hy-grid"
            ref={spine}
            role="grid"
            tabIndex={0}
            aria-label="History"
            aria-rowcount={lines.length}
            aria-activedescendant={cursor === '' ? undefined : lineId(cursor)}
            onKeyDown={onKeyDown}
          >
            {drawn.map((day) => (
              <Day
                key={day.day}
                day={day}
                shape={shape}
                today={today}
                index={index}
                bare={bare}
                read={read}
                cursor={cursor}
                open={open}
                step={day.day === today ? step : null}
                refused={day.day === today ? refused : null}
                whyNot={whyNot}
                sheetOpen={sheetOpen}
                sheetReading={sheetReading}
                openTheFile={openTheFile}
                newQuote={newQuote}
                canOpen={Boolean(openQuote)}
                openCustomer={openCustomer}
                onStart={startOne}
                onTakeBack={takeItBack}
                onPoint={(key) => {
                  toggle(key)
                  spine.current?.focus()
                }}
                onOpenDocument={openIt}
                onAgain={again}
                onGoTo={goToQuote}
                onClose={() => {
                  setOpen('')
                  spine.current?.focus()
                }}
                hold={(key, element) => {
                  if (element) rowsRef.current.set(key, element)
                  else rowsRef.current.delete(key)
                }}
              />
            ))}
          </div>
          {read && !bare ? (
            <End
              filed={filed}
              days={allDays}
              today={today}
              span={span}
              hidden={hidden}
              narrowed={narrowed}
              onEveryDay={() => setSpan('all')}
              makerOf={makerOf}
            />
          ) : null}
        </div>

        {/* THE FOOT: the key to the colours, and how to open a line, in one sentence true of
            a finger and a mouse alike. No keycap: the legend of J K Space Enter Esc that stood
            here at a desk went on 2026-09-25 (m2-last-critique.md major 7). */}
        {/* ON AN EMPTY DIARY THE FOOT IS EMPTY TOO: every press it would teach
            acts on a line, and there is no line yet — the teaching above says how one comes. */}
        <div className="hy-foot">
          {bare ? null : (
            <>
              <Inks />
              <p className="hy-touch">
                <span className="hy-touch__glyph" aria-hidden="true">
                  <Icon glyph={InfoIcon} />
                </span>
                Press a line to open it where it is, and press it again to fold it.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

/** Where a document opens is a fact about the document: a draft where
 *  it is written, an issued or replaced one as paper. */
function stateFor(index: HistoryIndex, quote: QuoteDef): RegisterStateId {
  const standing = standingOf(index, quote.id)
  return standing === 'draft' ? 'draft' : standing === 'replaced' ? 'superseded' : 'issued'
}

/** How many cells a line has, which is what a full-width row spans. */
const COLUMNS = 6

/** One strand's pip and word — the ink is the stylesheet's, read off `data-strand`. */
function Inked({ strand, children }: { strand: KindStrand | 'none'; children: string }) {
  return (
    <span className="hy-kind" data-strand={strand}>
      {children}
    </span>
  )
}

/**
 * WHAT HAPPENED, COUNTED, IN INK. The words are `kindParts`' own, in the order each kind
 * first happened (`inDiaryOrder`); the separators are kept in the text — a reader hears
 * `started · addressed · issued` — and the eye reads the pips instead.
 */
function Kinds({ events }: { events: readonly QuoteEvent[] }) {
  if (events.length === 0) return <Inked strand="none">{NO_DIARY}</Inked>
  return (
    <>
      {kindParts(events).map((part, i) => (
        <Fragment key={part.kind}>
          {i > 0 ? <span className="hy-kind__sep"> · </span> : null}
          <Inked strand={part.strand}>{part.words}</Inked>
        </Fragment>
      ))}
    </>
  )
}

/** The key to the inks: six words, each in its own colour. */
function Inks() {
  return (
    <p className="hy-inks">
      {STRANDS.map((s) => (
        <Inked key={s} strand={s}>
          {STRAND_TITLE[s]}
        </Inked>
      ))}
    </p>
  )
}

/* ---------------------------------------------------------- */
/* The rhythm of the last fortnight                             */
/* ---------------------------------------------------------- */

/** How many days the rhythm draws, and how many dots one day draws before it counts the rest. */
const RHYTHM_DAYS = 14
const RHYTHM_CAP = 24

/** How many of the fortnight's quotes stand over it with their boats before the rest are
 *  counted: four photographs fill a desk's measure, and two rows of two fill a hand. */
const BOATS_SHOWN = 4

/** Where the name of a boat's maker is read, to put its mark in the well of a boat no
 *  photograph is held of — the register its hull is a row of, while the file is open. */
type MakerOf = (quote: QuoteDef) => string | undefined

/**
 * ONE BOAT OF THE FORTNIGHT: its photograph where one is held — read by the one reader every
 * screen of the sale asks (`@/data/pictures`, 2026-09-28: the model on the water, then the
 * row's own copy), so the Stacer 519 History drew as a name on an empty plate is the same
 * photograph here as on the picker, the stage and the paper — and where none is, the maker's
 * own mark on Northside's band, saying so. Never a stand-in for the boat.
 *
 * THE PHOTOGRAPH TRAVELS. The first card of each hull carries the name the picker's card, the
 * build's stage and the paper's cover give that hull (`boatTravel`), so "Open the build" or
 * "Open the document" in the line's fold morphs this photograph into the stage or the cover
 * (PLAN.md § "Motion choreography for the flow"). Only a photograph is named — a mark is not
 * the boat — and never two on one screen.
 */
function BoatCard({
  quote,
  maker,
  travels,
}: {
  quote: QuoteDef
  maker: string | undefined
  travels: boolean
}) {
  const held = pictureOfQuote(quote)
  const who = quote.customer.name.trim()
  const mark = held ? null : markOnDark(maker)
  return (
    <li className="hy-card" data-art={held ? 'photograph' : 'mark'}>
      <span className="hy-card__frame" data-verdict={held?.verdict}>
        {held ? (
          <span className="hy-card__shot">
            <Picture
              src={held.src}
              srcSet={srcSetOf(held)}
              sizes="(min-width: 640px) 26rem, 50vw"
              alt=""
              width={held.width}
              height={held.height}
              /* what the packer measured it to be: a scene fills its frame, a render on white
                 sits whole on the frame's own white */
              fit={held.verdict === 'scene' ? 'cover' : 'contain'}
              shared={travels ? boatTravel(quote.rootTableId, quote.rootRowId) : undefined}
            />
          </span>
        ) : (
          <>
            {mark?.drawn ? (
              <img
                className="hy-card__mark"
                src={mark.mark.src}
                width={mark.mark.width}
                height={mark.mark.height}
                alt={mark.mark.brand}
                decoding="async"
              />
            ) : null}
            <span className="hy-card__none">no photograph held</span>
          </>
        )}
      </span>
      <span className="hy-card__name">{boatOfQuote(quote).name}</span>
      <span className="hy-card__who">{who === '' ? quote.reference : who}</span>
    </li>
  )
}

/**
 * THE DIARY DRAWN AS A PICTURE OF WORK: the last fourteen calendar days, one dot for every
 * event kept on each, in its strand's ink and in the order it happened (`rhythmOf`). A busy
 * day stands tall; a day with nothing done is a bare mark on the line. It is a picture, not a
 * control: the spans above cut the calendar, and a day is reached on the spine.
 *
 * REDRAWN 2026-09-29 (components-critique.md major 13): "the 'last fourteen days' is a white
 * plate of about 1,000 × 430 px holding one day's name, one boat, one person and five dots,
 * beside a dashed box". The tile was stretched to fill the floor under a young diary, and a
 * young diary has one day to put in it. Two things now, at every size, and neither is a plate:
 *
 *   · THE FOURTEEN DAYS ARE ONE STRIP on the room — every kept day a column of its dots over
 *     its date, today on the accent's wash — and the days before the diary began are ONE CELL
 *     of the strip, as wide as the days it stands for, with its broken line and the span said
 *     once in words. The strip is exactly as tall as its busiest day.
 *   · THE BOATS OF THE FORTNIGHT STAND OVER IT, newest first: each boat the fortnight quoted,
 *     once for each person, as its photograph with the boat and the person under it, sized by
 *     the room the window has — or, where no photograph is held, as its maker's mark on a
 *     shorter band that says so. So the floor under a young diary is the boat it was for, on the
 *     water, where it was an empty plate — and nothing is stretched to fill anything.
 *
 * Until 2026-09-29 a desk drew a tile per kept day with its boats inside, from its own copy
 * reader (`history/pictures.ts`, which asked the catalogue ledger alone and so never found the
 * 519's photograph); the kept day's boats are the spine's own lines, so the fortnight carries
 * each boat once rather than a day's list twice.
 */
function Rhythm({
  fortnight,
  today,
  makerOf,
}: {
  fortnight: Fortnight
  today: string
  makerOf: MakerOf
}) {
  const named = useId()
  const before = fortnight.before
  /* EACH BOAT THE FORTNIGHT QUOTED, FOR EACH PERSON, ONCE, most recently touched first — the
     order the spine reads in, and the order the cards stand in from today's end of the strip.
     Two versions of one conversation are one boat for one person, and drew one photograph
     twice side by side until they were one card (2026-09-29). */
  const quotes = useMemo(() => {
    const seen = new Set<string>()
    const out: QuoteDef[] = []
    for (const d of fortnight.kept.toReversed()) {
      for (const q of d.touched) {
        const one = `${q.rootTableId}|${q.rootRowId}|${q.customer.name.trim().toLowerCase()}`
        if (seen.has(one)) continue
        seen.add(one)
        out.push(q)
      }
    }
    return out
  }, [fortnight])
  const shown = quotes.slice(0, BOATS_SHOWN)
  const left = quotes.length - shown.length
  /* ONE NAME PER HULL ON A SCREEN: two quotes for one boat stand as two cards, and only the
     newest of them travels */
  const travelling = new Set<string>()
  return (
    <figure className="hy-rhythm" aria-labelledby={named}>
      <figcaption className="hy-rhythm__cap" id={named}>
        <span className="hy-rhythm__glyph" aria-hidden="true">
          <Icon glyph={CalendarDotsIcon} />
        </span>
        The last fourteen days · a dot for each thing done
      </figcaption>
      {shown.length > 0 ? (
        /* READ AS WELL AS SEEN: the boats are words a reader hears, and words the contrast
           ruler measures — an aria-hidden run is set aside */
        <ul className="hy-rhythm__boats" aria-label="The boats they were for">
          {shown.map((q) => {
            const hull = `${q.rootTableId}|${q.rootRowId}`
            const travels = !travelling.has(hull)
            travelling.add(hull)
            return <BoatCard key={q.id} quote={q} maker={makerOf(q)} travels={travels} />
          })}
          {left > 0 ? <li className="hy-card hy-card--more">{`and ${au(left)} more`}</li> : null}
        </ul>
      ) : null}
      <ol
        className="hy-rhythm__days"
        data-before={before ? '' : undefined}
        style={
          {
            '--before': before ? before.days : 0,
            '--kept': Math.max(1, fortnight.kept.length),
          } as CSSProperties
        }
      >
        {before ? (
          <li className="hy-rhythm__before">
            <span className="hy-rhythm__rule" aria-hidden="true" />
            <span className="hy-rhythm__was">
              <span className="hy-rhythm__span">{spanWritten(before.first, before.last)}</span>{' '}
              <span className="hy-rhythm__words">
                {`· ${before.days === 1 ? 'the day' : `the ${au(before.days)} days`} before this diary began`}
              </span>
            </span>
          </li>
        ) : null}
        {fortnight.kept.map((d) => {
          const shownDots = d.strands.slice(0, RHYTHM_CAP)
          const more = d.strands.length - shownDots.length
          return (
            <li
              className="hy-rhythm__day"
              key={d.day}
              data-kept=""
              data-today={d.day === today ? '' : undefined}
            >
              <span className="hy-rhythm__col" aria-hidden="true">
                {more > 0 ? <span className="hy-rhythm__more">{`+${au(more)}`}</span> : null}
                <span className="hy-rhythm__beads">
                  {shownDots.map((strand, i) => (
                    /* A DOT'S IDENTITY IS ITS PLACE IN THE DAY: the list is derived from the
                       day's events in the order they happened and never reorders, inserts or
                       filters, which is the reconciliation bug the rule exists to catch. */
                    // eslint-disable-next-line react/no-array-index-key
                    <span className="hy-bead" key={i} data-strand={strand} />
                  ))}
                </span>
              </span>
              <span className="hy-rhythm__when" aria-hidden="true">
                <span className="hy-rhythm__wd">{d.weekday}</span>
                <span className="hy-rhythm__d">{d.date}</span>
              </span>
              <span className="hy-sr">
                {`${d.written}: ${
                  d.strands.length === 0
                    ? 'nothing done'
                    : `${au(d.strands.length)} ${d.strands.length === 1 ? 'thing' : 'things'} done, on ${au(d.quotes)} ${d.quotes === 1 ? 'quote' : 'quotes'}`
                }`}
              </span>
            </li>
          )
        })}
      </ol>
    </figure>
  )
}

/* ---------------------------------------------------------- */
/* The end of the spine                                         */
/* ---------------------------------------------------------- */

/** What a figure at the diary's beginning counts, as a glyph before its words, in the
 *  figure's own ink. */
function FigGlyph({ glyph }: { glyph: Glyph }) {
  return (
    <span className="hy-fig__glyph" aria-hidden="true">
      <Icon glyph={glyph} weight="bold" />
    </span>
  )
}

/**
 * WHERE THE SPINE STOPS, SAID. Three ends, one at a time: the end of what a narrowing
 * matched; the end of a span, with what it left out counted and the way back to every
 * day; or — with nothing narrowed — the BEGINNING of the diary, which is where a spine
 * drawn newest first truly ends: the first thing this browser kept, when, and what it has
 * held since (`diarySince`). The stylesheet stands it at the foot of the port when the
 * diary is short, with the spine drawn down to it, and after the last day when it is long.
 */
function End({
  filed,
  days,
  today,
  span,
  hidden,
  narrowed,
  onEveryDay,
  makerOf,
}: {
  filed: readonly QuoteDef[]
  /** every day of the whole diary — nothing is narrowed when the origin is drawn */
  days: readonly DiaryDay[]
  today: string
  span: SpanKey
  hidden: { days: number; quotes: number }
  narrowed: boolean
  onEveryDay: () => void
  makerOf: MakerOf
}) {
  const since = useMemo<DiarySince | null>(() => diarySince(filed), [filed])
  const rhythm = useMemo(
    () => rhythmOf(days, today, RHYTHM_DAYS, since?.day ?? null),
    [days, today, since],
  )
  const fortnight = useMemo(() => fortnightOf(rhythm, days), [rhythm, days])

  if (narrowed) {
    return (
      <div className="hy-end" data-end="narrowed">
        <p className="hy-end__lab">
          <span className="hy-end__node" aria-hidden="true" />
          The end of what matches
        </p>
      </div>
    )
  }

  if (span !== 'all' && hidden.days > 0) {
    return (
      <div className="hy-end" data-end="span">
        <p className="hy-end__lab">
          <span className="hy-end__node" aria-hidden="true" />
          {SPAN_TITLE[span]} ends here
        </p>
        <p className="hy-end__say">
          {au(hidden.quotes)} {hidden.quotes === 1 ? 'quote' : 'quotes'} on {au(hidden.days)}{' '}
          earlier {hidden.days === 1 ? 'day' : 'days'}{' '}
          {hidden.quotes === 1 && hidden.days === 1 ? 'is' : 'are'} outside it.
        </p>
        <span className="hy-end__act">
          <Button
            intent="secondary"
            size="sm"
            icon={ClockCounterClockwiseIcon}
            onClick={onEveryDay}
          >
            Show every day
          </Button>
        </span>
      </div>
    )
  }

  if (!since) return null
  const time = localTimeOf(since.at)
  const when = dayWritten(since.day, today)
  return (
    <section className="hy-end" data-end="origin" aria-label="Where this diary begins">
      {/* THE RUN OF SPINE between the oldest day and the day the diary began: as long as
          whatever the days leave. The fortnight stands in it — its boats over its fourteen
          days — as tall as what it holds and never stretched to fill the run. */}
      <div className="hy-end__run">
        <Rhythm fortnight={fortnight} today={today} makerOf={makerOf} />
      </div>
      <p className="hy-end__lab">
        <span className="hy-end__node" aria-hidden="true" />
        Since {time === '' ? '' : `${time}, `}
        {when === '' ? since.day : when}
      </p>
      <dl className="hy-end__figs">
        <div className="hy-fig">
          <dt className="hy-fig__say">
            <FigGlyph glyph={FileTextIcon} />
            {since.kept === 1 ? 'quote written' : 'quotes written'}
          </dt>
          <dd className="hy-fig__n">{au(since.kept)}</dd>
        </div>
        <div className="hy-fig" data-strand="given">
          <dt className="hy-fig__say">
            <FigGlyph glyph={CheckCircleIcon} />
            {since.given === 1 ? 'given to a customer' : 'given to customers'}
          </dt>
          <dd className="hy-fig__n">{au(since.given)}</dd>
        </div>
        {since.givenSummed > 0 ? (
          <div className="hy-fig" data-strand="given">
            <dt className="hy-fig__say">
              <FigGlyph glyph={HandCoinsIcon} />
              {since.givenSummed < since.given
                ? `given, from the ${au(since.givenSummed)} of ${au(since.given)} that carry a figure`
                : 'given, as printed on their sheets'}
            </dt>
            <dd className="hy-fig__n">
              <PriceFigure amount={since.givenTotal} />
            </dd>
          </div>
        ) : null}
      </dl>
      <p className="hy-end__say">
        This is where the diary begins: the first thing this browser kept. Work is kept here, not on
        a server, so nothing from before it was ever written here.
      </p>
    </section>
  )
}

/* ---------------------------------------------------------- */
/* One day — a node on the spine and the lines under it         */
/* ---------------------------------------------------------- */

/** HOW A ROW OF THE SPINE MOVES WHEN THE SPINE CHANGES SHAPE: from where it stood to where it
 *  stands, on the kit's travel spring, and only its position — never its size. */
const TRAVELS = { layout: 'position', transition: move.travel } as const

function Day({
  day,
  shape,
  today,
  index,
  bare,
  read,
  cursor,
  open,
  step,
  refused,
  whyNot,
  sheetOpen,
  sheetReading,
  openTheFile,
  newQuote,
  canOpen,
  openCustomer,
  onStart,
  onTakeBack,
  onPoint,
  onOpenDocument,
  onAgain,
  onGoTo,
  onClose,
  hold,
}: {
  day: DiaryDay
  /** the spine's shape, which every row's travel depends on */
  shape: string
  today: string
  index: HistoryIndex
  bare: boolean
  read: boolean
  cursor: string
  open: string
  step: Step | null
  refused: string | null
  whyNot: (quote: QuoteDef) => string
  sheetOpen: boolean
  sheetReading: boolean
  openTheFile?: () => void
  newQuote?: () => void
  canOpen: boolean
  openCustomer?: (rowId: string) => void
  onStart: () => void
  onTakeBack: () => void
  onPoint: (key: string) => void
  onOpenDocument: (quote: QuoteDef) => void
  onAgain: (quote: QuoteDef) => void
  onGoTo: (quoteId: string) => void
  onClose: () => void
  hold: (key: string, element: HTMLDivElement | null) => void
}) {
  const isToday = day.day === today
  /* THE DAY AS A DIARY PAGE WRITES IT. `Today` and `Yesterday` name a day without dating
     it, so the date is written out beside them; every other day IS its date, written out.
     The ISO string that stood here was a database's way of writing a day; it is kept only
     where a machine reads it, in `dateTime`. */
  const word = dayTitle(day.day, today)
  const written = dayWritten(day.day, today)
  const named = word === 'Today' || word === 'Yesterday'
  const heading = named || written === '' ? word : written
  const t = day.tally
  return (
    <div
      className="hy-day"
      role="rowgroup"
      aria-label={heading}
      data-today={isToday ? '' : undefined}
    >
      {/* THE NODE. The day once, on the head; each line says its own time. The tally beside
          it is B's gutter figure kept as a fact: counts, and one sum of frozen totals with
          its denominator when they differ — the given part in the given ink. */}
      <motion.div className="hy-dayhead" role="row" {...TRAVELS} layoutDependency={shape}>
        <div className="hy-dayhead__cell" role="gridcell" aria-colspan={COLUMNS}>
          <span className="hy-dayhead__words">
            <span className="hy-node" aria-hidden="true" />
            <time className="hy-dayhead__title" dateTime={day.day}>
              {heading}
            </time>
            {named && written !== '' ? <span className="hy-dayhead__date">{written}</span> : null}
          </span>
          {t.quotes > 0 ? (
            <span className="hy-dayhead__tally">
              {au(t.quotes)} {t.quotes === 1 ? 'quote' : 'quotes'} · {au(t.events)}{' '}
              {t.events === 1 ? 'event' : 'events'}
              {t.given > 0 ? (
                <>
                  {' · '}
                  <span className="hy-given">
                    {/* THE KIT'S GLYPH FOR A QUOTE GIVEN, in the given ink, beside its words */}
                    <span className="hy-given__glyph" aria-hidden="true">
                      <Icon glyph={CheckCircleIcon} weight="fill" />
                    </span>
                    {au(t.given)} given
                    {t.givenSummed > 0 ? (
                      <>
                        {' '}
                        <PriceFigure amount={t.givenTotal} />
                        {t.givenSummed < t.given
                          ? ` from ${au(t.givenSummed)} of ${au(t.given)}`
                          : ''}
                      </>
                    ) : null}
                  </span>
                </>
              ) : null}
            </span>
          ) : isToday && !bare && read ? (
            <span className="hy-dayhead__tally">nothing yet today</span>
          ) : null}
          {/* THE ONE ACT, ON TODAY'S NODE, because today is where the
              next entry goes. It is the live amber while nothing on
              the screen is open; with a line open, the act is inside
              that line. */}
          {isToday ? (
            <span className="hy-dayhead__act">
              {/* THE FINDER'S OWN GLYPH FOR STARTING A QUOTE, a new paper: the act ends on it in
                  the kit's dark disc, and stepped back while a line is open it leads the word */}
              <Button
                intent={open === '' ? 'act' : 'veiled'}
                icon={FilePlusIcon}
                aria-label="New quote"
                onClick={onStart}
                refusedBecause={newQuote ? undefined : NO_WAY_TO_THE_PICKER}
              >
                New quote
              </Button>
            </span>
          ) : null}
        </div>
      </motion.div>

      {/* THE LAST STEP AND ITS WAY BACK, on the head of the spine —
          the configurator's rail head, not a toast. Pinned to the
          document the step made. */}
      {isToday && (step || refused) ? (
        <motion.div className="hy-steprow" role="row" {...TRAVELS} layoutDependency={shape}>
          <div className="hy-steprow__cell" role="gridcell" aria-colspan={COLUMNS}>
            {step ? (
              <output className="hy-step" data-testid="last-step">
                <span className="hy-step__glyph" aria-hidden="true">
                  <Icon
                    glyph={step.discarded ? TrashIcon : CheckCircleIcon}
                    weight={step.discarded ? 'bold' : 'fill'}
                  />
                </span>
                <span className="hy-step__said">{step.saids.join(' · ')}</span>
                {step.discarded ? null : (
                  <>
                    <Button
                      intent="secondary"
                      size="sm"
                      icon={ArrowDownIcon}
                      onClick={() => onGoTo(step.quoteId)}
                    >
                      Its line
                    </Button>
                    <Button intent="secondary" size="sm" icon={TrashIcon} onClick={onTakeBack}>
                      Discard it
                    </Button>
                  </>
                )}
              </output>
            ) : null}
            {refused ? (
              /* THE KIT'S REFUSAL: its warning glyph before the sentence, in the sentence's
                 own ink, where the press was refused */
              <p className="hy-alarm" role="alert">
                <Refusal>{refused}</Refusal>
              </p>
            ) : null}
          </div>
        </motion.div>
      ) : null}

      {day.entries.length === 0 ? (
        <motion.div className="hy-empty" role="row" {...TRAVELS} layoutDependency={shape}>
          <div className="hy-empty__cell" role="gridcell" aria-colspan={COLUMNS}>
            {bare ? (
              <Teaching
                sheetOpen={sheetOpen}
                sheetReading={sheetReading}
                openTheFile={openTheFile}
              />
            ) : !read ? (
              <p className="hy-empty__say">Reading what this browser has kept…</p>
            ) : (
              <p className="hy-empty__say">
                Nothing has happened today. The days below are the last time something did.
              </p>
            )}
          </div>
        </motion.div>
      ) : (
        /* A LINE THE DIARY GAINS AFTER THE FIRST PAINT FADES IN, and one it loses fades out
           faster than it came; the lines of the first paint arrive with the spine instead
           (history.css, MOTION) */
        <AnimatePresence initial={false}>
          {day.entries.map((entry) => {
            const key = keyOf(day.day, entry.quote.id)
            return (
              <Line
                key={key}
                lineKey={key}
                shape={shape}
                day={day}
                entry={entry}
                today={today}
                index={index}
                on={key === cursor}
                open={key === open}
                whyNot={whyNot}
                openTheFile={openTheFile}
                sheetOpen={sheetOpen}
                canOpen={canOpen}
                openCustomer={openCustomer}
                onPoint={onPoint}
                onOpenDocument={onOpenDocument}
                onAgain={onAgain}
                onGoTo={onGoTo}
                onClose={onClose}
                hold={hold}
              />
            )
          })}
        </AnimatePresence>
      )}
    </div>
  )
}

/* ---------------------------------------------------------- */
/* Day one: the empty state, drawn to teach                     */
/* ---------------------------------------------------------- */

/** A question the empty diary answers, led by the glyph of what it is about. */
function Question({ glyph, children }: { glyph: Glyph; children: string }) {
  return (
    <p className="hy-teach__q">
      <span className="hy-teach__glyph" aria-hidden="true">
        <Icon glyph={glyph} />
      </span>
      {children}
    </p>
  )
}

function Teaching({
  sheetOpen,
  sheetReading,
  openTheFile,
}: {
  sheetOpen: boolean
  sheetReading: boolean
  openTheFile?: () => void
}) {
  return (
    <div className="hy-teach">
      <h2 className="hy-teach__head">Nothing has been written in this diary yet.</h2>

      <section className="hy-teach__block">
        <Question glyph={TrayIcon}>What will appear here</Question>
        <p className="hy-teach__a">
          {/* IN THE DEALER'S WORDS (built-critique-m2-close-2.md, major 3): this
              said "the rung it was priced at" and "Each day is a node on this
              spine", the design's words for a price level and a day's heading. */}
          Every quote, on the day something happened to it: the day it was started, each motor,
          trailer or part put on it, each time it was repriced, the name it was addressed to, the
          moment it was given to the customer, and every step taken back. Each day has a heading
          like Today&rsquo;s above, and each quote touched that day is one line under it, counted in
          words — and the line opens to the sentences the app said as it happened, with the time
          each one was said.
        </p>
      </section>

      <section className="hy-teach__block">
        <Question glyph={QuestionIcon}>Why it is empty today</Question>
        {/* WHAT IS TRUE TODAY, AND NOTHING ELSE (built-critique-m2-close-2.md,
            major 4): this said "Work is kept here — not on a server — until the
            file is exported", and no screen has an export. */}
        <p className="hy-teach__a">{WHERE_THE_DIARY_IS_KEPT}</p>
      </section>

      <section className="hy-teach__block">
        <Question glyph={SignpostIcon}>Where a quote starts</Question>
        <p className="hy-teach__a">
          <b>New quote</b>, at the top of this diary, opens the picker: every boat on the price
          file, by maker and by model. The moment one is chosen this diary gets its first line,
          under Today, reading <b>started</b> — and <b>Quotes</b>, on the bar, lists the same
          document by where it stands.
        </p>
        {sheetOpen || sheetReading ? null : (
          <div className="hy-teach__door">
            <p className="hy-teach__a">
              No price file is open in this browser either, so there is nothing to quote from.
            </p>
            {openTheFile ? (
              <Button intent="veiled" icon={FolderOpenIcon} onClick={openTheFile}>
                Load the Master Price File
              </Button>
            ) : null}
          </div>
        )}
      </section>

      {/* THE KEY TO THE INKS, in words — never a drawing of a line nobody wrote. Until
          2026-09-23 this was a wireframe of five dashed boxes, the same weak object the
          critic found on Home (#23); a line's colours are the one thing a reader cannot
          learn from a sentence, so they are what is shown. */}
      <section className="hy-teach__block">
        <Question glyph={PaletteIcon}>How a line is coloured</Question>
        <p className="hy-teach__a">
          Each word on a line carries the colour of what it was, so a quote that went the whole way
          in one sitting reads at a glance:
        </p>
        <Inks />
      </section>
      {/* SAID TO THE DEALER, NOT TO A CRITIC (the M2-close critique's minor 17): this foot
          explained that no photograph stood on the screen. */}
      <p className="hy-teach__foot">
        The quote you start next is the first line here, under today, the moment it is started.
      </p>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* One folded line, and what it opens into                      */
/* ---------------------------------------------------------- */

/** Where a quote stands, in the kit's word for it (src/ui/glyphs.ts): a replaced quote is
 *  superseded, and its dot and its ink are the kit's. The word printed stays this screen's. */
const kitStanding = (standing: ReturnType<typeof standingOf>): QuoteState =>
  standing === 'replaced' ? 'superseded' : standing

function Line({
  lineKey,
  shape,
  day,
  entry,
  today,
  index,
  on,
  open,
  whyNot,
  openTheFile,
  sheetOpen,
  canOpen,
  openCustomer,
  onPoint,
  onOpenDocument,
  onAgain,
  onGoTo,
  onClose,
  hold,
}: {
  lineKey: string
  /** the spine's shape, which the line's travel depends on */
  shape: string
  day: DiaryDay
  entry: DayEntry
  today: string
  index: HistoryIndex
  on: boolean
  open: boolean
  whyNot: (quote: QuoteDef) => string
  openTheFile?: () => void
  sheetOpen: boolean
  canOpen: boolean
  openCustomer?: (rowId: string) => void
  onPoint: (key: string) => void
  onOpenDocument: (quote: QuoteDef) => void
  onAgain: (quote: QuoteDef) => void
  onGoTo: (quoteId: string) => void
  onClose: () => void
  hold: (key: string, element: HTMLDivElement | null) => void
}) {
  const { quote } = entry
  const standing = standingOf(index, quote.id)
  const [nth, of] = versionMark(index, quote.id)
  const name = quote.customer.name.trim()
  const nothing = isEmptyQuote(quote)
  const undecided = !nothing && totalIsNothingByDefault(quote)
  const total = nothing || undecided ? null : quoteTotals(quote).total
  /* A LINE ON ITS WAY OUT IS NO LONGER A LINE. For the kit's `exit` it stays drawn while it
     fades, and for that moment it is out of the grid a reader walks and out of a pointer's
     way, so nothing can open a document the diary has just let go of. */
  const present = useIsPresent()

  return (
    <>
      <motion.div
        className="hy-line"
        role={present ? 'row' : 'none'}
        aria-hidden={present ? undefined : true}
        inert={!present}
        id={present ? lineId(lineKey) : undefined}
        ref={(element: HTMLDivElement | null) => {
          hold(lineKey, element)
        }}
        {...TRAVELS}
        layoutDependency={shape}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: move.enter }}
        exit={{ opacity: 0, transition: move.exit }}
        data-on={on ? '' : undefined}
        data-open={open ? '' : undefined}
        data-standing={standing}
        aria-selected={present ? on : undefined}
        aria-expanded={present ? open : undefined}
        onClick={() => onPoint(lineKey)}
      >
        {/* THE TIME IT WAS LAST TOUCHED THAT DAY, which is what the day's lines are in order
            of — a diary is read by its times, and the day head above dates them. */}
        <span className="hy-cell hy-cell--time" role="gridcell">
          <time dateTime={entry.lastAt}>{localTimeOf(entry.lastAt)}</time>
        </span>
        {/* WHAT HAPPENED IS THE TITLE. On the register the boat is the
            title and the state the band; on a diary the day is the
            band and what was DONE is the thing a person came to read,
            so it takes the weight and the boat takes the quiet line. */}
        <span className="hy-cell hy-cell--what" role="gridcell">
          <Kinds events={entry.events} />
        </span>
        <span className="hy-cell hy-cell--who" role="gridcell">
          <span className="hy-boat">{boatOfQuote(quote).say}</span>
          <span className="hy-customer">{name === '' ? 'Nobody named on it' : name}</span>
        </span>
        {/* THE REFERENCE AT THE RIGHT, in mono, where GitHub keeps the sha (the sweep's §1.3) */}
        <span className="hy-cell hy-cell--ref" role="gridcell">
          {quote.reference}
          {of > 1 ? <span className="hy-mark">{`v${nth} of ${of}`}</span> : null}
        </span>
        {/* WHERE IT STANDS, AS THE KIT SAYS IT: a dot in the standing's own ink beside its
            word — draft rose, given leaf, replaced graphite — the same three the register's
            bands and a customer's page wear */}
        <span className="hy-cell hy-cell--standing" role="gridcell">
          <StatusDot state={kitStanding(standing)}>{STANDING_TITLE[standing]}</StatusDot>
        </span>
        <span className="hy-cell hy-cell--total" role="gridcell">
          {total === null ? (
            <span className="hy-nofigure">{nothing ? NOTHING_ON_IT : NOT_PRICED}</span>
          ) : (
            <PriceFigure amount={total} />
          )}
        </span>
      </motion.div>

      {/* THE FOLD GROWS OUT OF ITS LINE and shuts faster than it opened (Fold, below); a line
          open on the first paint — one the address named — is simply open. */}
      <AnimatePresence initial={false}>
        {open && present ? (
          <Fold
            key="fold"
            quote={quote}
            entry={entry}
            day={day}
            today={today}
            index={index}
            standing={standing}
            mark={[nth, of]}
            whyNot={whyNot}
            openTheFile={openTheFile}
            sheetOpen={sheetOpen}
            canOpen={canOpen}
            openCustomer={openCustomer}
            onOpenDocument={onOpenDocument}
            onAgain={onAgain}
            onGoTo={onGoTo}
            onClose={onClose}
          />
        ) : null}
      </AnimatePresence>
    </>
  )
}

/** What opening a document does, said before it is pressed. */
const opensAs = (standing: ReturnType<typeof standingOf>): string =>
  standing === 'draft' ? 'Open the build' : 'Open the document'
/** THE GLYPH THE OPENING ACT ENDS ON: an arrow into the build a draft is written on, the paper
 *  — the glyph the build's own "Open the document" carries — for one given or replaced. */
const opensWith = (standing: ReturnType<typeof standingOf>): Glyph =>
  standing === 'draft' ? ArrowRightIcon : FileTextIcon
/** IN WORDS, NEVER AN ADDRESS: until 2026-09-23 two of these ended "at /quote/$id" — a
 *  router's placeholder, shown to a dealer in normal operation (built-critique-m2.md #14). */
export const WHAT_OPENING_DOES: Record<ReturnType<typeof standingOf>, string> = {
  draft: 'It opens on the build, where it is written and can still be changed.',
  given: 'It opens as the sheet the customer was given, ready to print on A4.',
  replaced:
    'It opens as the sheet that customer was given. A newer version has replaced it, and this is still the document they hold.',
}

function Fold({
  quote,
  entry,
  day,
  today,
  index,
  standing,
  mark,
  whyNot,
  openTheFile,
  sheetOpen,
  canOpen,
  openCustomer,
  onOpenDocument,
  onAgain,
  onGoTo,
  onClose,
}: {
  quote: QuoteDef
  entry: DayEntry
  day: DiaryDay
  today: string
  index: HistoryIndex
  standing: ReturnType<typeof standingOf>
  mark: [number, number]
  whyNot: (quote: QuoteDef) => string
  openTheFile?: () => void
  sheetOpen: boolean
  canOpen: boolean
  openCustomer?: (rowId: string) => void
  onOpenDocument: (quote: QuoteDef) => void
  onAgain: (quote: QuoteDef) => void
  onGoTo: (quoteId: string) => void
  onClose: () => void
}) {
  const versions = versionsOf(index, quote.id)
  const [nth, of] = mark
  const replaces = quote.supersedesId ? index.byId.get(quote.supersedesId) : undefined
  const replacedBy = (index.supersededBy.get(quote.id) ?? [])
    .map((id) => index.byId.get(id))
    .filter((q): q is QuoteDef => q !== undefined)
  /* THE WHOLE DIARY, IN THE ORDER IT HAPPENED, EACH ENTRY DATED, with the ones on this day
     marked — so the head above stands over its own day and every other day names itself
     on its own entry. The order is the engine's (`inDiaryOrder`), the same one the folded
     line counted in, so the line and what it opens into can never disagree. */
  const diary: QuoteEvent[] = inDiaryOrder(quote.events)
  const onThisDay = new Set(entry.events.map((e) => e.id))
  const why = whyNot(quote)
  const rowId = quote.customerRef?.rowId
  const dayWord = dayTitle(day.day, today)
  /* A FOLD ON ITS WAY SHUT IS NO LONGER WHAT THE LINE OPENED INTO: while it closes on the
     kit's `exit` it is out of the grid and out of a pointer's way, and nothing in it can be
     pressed or found. */
  const present = useIsPresent()
  /* HEIGHT IS MOVEMENT: `motion` stills transforms and layout under reduced motion but not a
     height, so the fold asks for itself — under reduced motion, or while a caret is in the find
     field (src/ui/MotionRoot.tsx), it opens and shuts at once and only its words fade. */
  const reduced = useReducedMotion()
  const still = useStill()
  const quiet = Boolean(reduced) || still

  return (
    <div
      className="hy-fold"
      role={present ? 'row' : 'none'}
      aria-hidden={present ? undefined : true}
      inert={!present}
      data-testid={present ? 'fold' : undefined}
    >
      <div className="hy-fold__cell" role={present ? 'gridcell' : 'none'} aria-colspan={COLUMNS}>
        {/* THE FOLD GROWS OUT OF ITS LINE on the kit's travel spring — its height from
            nothing to what it holds — and its words fade in on `enter`; shut, it goes back on
            `exit`, faster than it came. Under reduced motion, or while a caret is in the find
            field, it is simply open or shut (src/ui/MotionRoot.tsx). */}
        <motion.div
          className="hy-fold__body"
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: 'auto',
            opacity: 1,
            transition: quiet
              ? transition('enter', true)
              : { height: move.travel, opacity: move.enter },
          }}
          exit={{ height: 0, opacity: 0, transition: quiet ? transition('exit', true) : move.exit }}
        >
          <div className="hy-fold__in">
            <div className="hy-fold__top">
              <StatusDot state={kitStanding(standing)}>{STANDING_TITLE[standing]}</StatusDot>
              <span className="hy-fold__ref">{quote.reference}</span>
              {/* THE CHAIN READS AS A SENTENCE, with counts, and never as
                  a diagram (`live/github-pr-20463.png`, and the sweep's
                  avoid list on Fork's coloured rails). */}
              {of > 1 ? (
                <span className="hy-chain">
                  {`v${nth} of ${of}`}
                  {replaces ? ` · replaces ${replaces.reference}` : ''}
                  {replacedBy.length > 0
                    ? ` · replaced by ${replacedBy.map((q) => q.reference).join(' and ')}`
                    : ''}
                </span>
              ) : null}
              <Button intent="quiet" size="sm" icon={XIcon} aria-label="Close" onClick={onClose}>
                Close
              </Button>
            </div>

            <p className="hy-fold__boat">
              <b>{boatOfQuote(quote).say}</b>
              {' · '}
              {quote.customer.name.trim() === ''
                ? 'nobody named on it'
                : quote.customer.name.trim()}
              {quote.preparedBy?.trim() ? ` · prepared by ${quote.preparedBy.trim()}` : ''}
            </p>

            {versions.length > 1 ? (
              <section className="hy-versions" aria-label="Its versions">
                <p className="hy-fold__lab">{au(versions.length)} versions of this conversation</p>
                <ol className="hy-versions__list">
                  {versions.map((version, i) => (
                    <li
                      className="hy-versions__item"
                      key={version.id}
                      data-here={version.id === quote.id ? '' : undefined}
                    >
                      <span className="hy-versions__n">{`v${i + 1}`}</span>
                      <Button intent="quiet" size="sm" onClick={() => onGoTo(version.id)}>
                        {version.reference}
                      </Button>
                      <span className="hy-versions__fact">
                        {dayTitle(localDay(version.createdAt), today)} ·{' '}
                        {STANDING_TITLE[standingOf(index, version.id)]}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            <section className="hy-diary" aria-label="Its diary">
              <p className="hy-fold__lab">
                {diary.length === 0
                  ? NO_DIARY
                  : `${au(diary.length)} ${diary.length === 1 ? 'event' : 'events'} in all · ${au(entry.events.length)} on ${dayWord}`}
              </p>
              {diary.length === 0 ? (
                <p className="hy-diary__none">{NO_DIARY_SAY}</p>
              ) : (
                <ol className="hy-diary__list">
                  {diary.map((e) => (
                    <li
                      className="hy-entry"
                      key={e.id}
                      data-strand={strandOf(e.kind)}
                      data-on-day={onThisDay.has(e.id) ? '' : undefined}
                    >
                      <time className="hy-entry__when" dateTime={e.at}>
                        {dayTitle(eventDay(e), today)} · {localTimeOf(e.at)}
                      </time>
                      <span className="hy-entry__said">{e.said}</span>
                      {e.by ? <span className="hy-entry__by">by {e.by}</span> : null}
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <div className="hy-acts">
              <div className="hy-acts__one hy-acts__one--act">
                <Button
                  intent="act"
                  icon={opensWith(standing)}
                  aria-label={opensAs(standing)}
                  refusedBecause={canOpen ? undefined : NO_WAY_TO_OPEN}
                  onClick={() => onOpenDocument(quote)}
                >
                  {opensAs(standing)}
                </Button>
              </div>
              <p className="hy-acts__where">{WHAT_OPENING_DOES[standing]}</p>

              {/* THE ACT ON A PAST THING, and it is not a restore. Its
                  refusal stands where the button is, in the engine's own
                  sentence (`whyNotAgain`), or in this screen's one sentence
                  about a shut sheet. VEILED, because it can refuse: the fold
                  is the room's panel, navy at night, and a veiled control's
                  sentence turns with the theme where a secondary one's is
                  inked for a ground that is light in both. */}
              <div className="hy-acts__one">
                <Button
                  intent="veiled"
                  icon={RepeatIcon}
                  aria-label="Quote this again, at today’s prices"
                  refusedBecause={why === '' ? undefined : why}
                  onClick={() => onAgain(quote)}
                >
                  Quote this again, at today’s prices
                </Button>
              </div>
              {why === '' ? (
                <p className="hy-acts__where">
                  A new draft for the same {boatOfQuote(quote).name} on the same page, priced from
                  the file as it reads today and addressed to the same person. Not one figure is
                  copied from this one, and nothing on this one changes.
                </p>
              ) : !sheetOpen && openTheFile ? (
                <div className="hy-acts__one">
                  <Button intent="secondary" size="sm" icon={FolderOpenIcon} onClick={openTheFile}>
                    Load the Master Price File
                  </Button>
                </div>
              ) : null}

              {rowId && openCustomer ? (
                <div className="hy-acts__one">
                  <Button
                    intent="secondary"
                    size="sm"
                    icon={UserIcon}
                    onClick={() => openCustomer(rowId)}
                  >
                    Their history
                  </Button>
                  <p className="hy-acts__where">
                    Every quote to this person, on their own page in Customers. The name on this
                    document stays as it was written; their page may say something newer.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
