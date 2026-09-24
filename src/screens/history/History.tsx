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
import { Button, Input, PriceFigure, closesStage, isField, stageKeyOf } from '@/ui'
import { makeCtx, type QuoteDef, type QuoteEvent } from '@/domain/model'
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
  type RhythmDay,
} from '@/domain/quote/diary/days'
import { countPriceFile } from '@/domain/catalogue/priceFile'
import { useCatalogue, useQuotes, useSession } from '@/app/useStores'
import { quotes as quotesStore } from '@/state/quotes'
import { ctxFrom } from '@/state/catalogue'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { fortnightOf, spanWritten, type Fortnight } from '@/domain/quote/diary/fortnight'
import { boatPicture } from './pictures'
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

  const move = useCallback(
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
      move(1)
      return
    }
    if (key === 'ArrowUp') {
      event.preventDefault()
      move(-1)
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
    <main className="hy" data-testid="history" data-read={read ? '' : undefined}>
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
        {held > 0 ? (
          <div className="hy-spans" role="group" aria-label="Which days">
            {SPANS.map((s) => (
              <span className="hy-span" key={s} data-on={span === s ? '' : undefined}>
                <Button
                  intent="veiled"
                  size="sm"
                  aria-pressed={span === s}
                  onClick={() => setSpan((was) => (was === s ? 'all' : s))}
                >
                  {SPAN_TITLE[s]}
                </Button>
              </span>
            ))}
            {span !== 'all' ? (
              <span className="hy-span">
                <Button intent="veiled" size="sm" onClick={() => setSpan('all')}>
                  {SPAN_TITLE.all}
                </Button>
              </span>
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
              <Button intent="veiled" size="sm" onClick={() => setCustomerFilter(ANY_CUSTOMER)}>
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

/** How many of a day's quotes a tile draws before it counts the rest: with its boat where the
 *  tile is wide, by name where it is one of many. */
const BOATS_WIDE = 4
const BOATS_NARROW = 2

/**
 * THE DIARY DRAWN AS A PICTURE OF WORK: the last fourteen calendar days, one dot for every
 * event kept on each, in its strand's ink and in the order it happened (`rhythmOf`). A busy
 * day stands tall; a day with nothing done is a bare mark on the line; a day before the diary
 * began is drawn as not kept — a broken line — because nothing was being written then and a
 * quiet day is a different fact. A reader that cannot see the columns hears each day in words.
 * It is a picture, not a control: the spans above cut the calendar, and a day is reached on
 * the spine.
 *
 * FROM A TABLET UP IT IS A CALENDAR OF THE DAYS THE DIARY KEPT, each with what was done on it
 * (2026-09-25, m2-last-critique.md major 7). The desk drew fourteen tiles, and on a young
 * diary thirteen were empty dashed boxes — every one a day before the diary began, the same
 * fact thirteen times. Those days are one span now, said once in words (`fortnightOf`), and
 * the room goes to the days that were kept: each tile carries the quotes it touched, the boat
 * of each drawn from the copy of its own frozen picture where one is held (`boatPicture`),
 * large where few days share the row and by name where many do. A phone keeps the strip.
 */
function Rhythm({
  days,
  fortnight,
  today,
}: {
  days: readonly RhythmDay[]
  fortnight: Fortnight
  today: string
}) {
  const named = useId()
  const touched = new Map(fortnight.kept.map((d) => [d.day, d.touched]))
  const before = fortnight.before
  const cells = fortnight.kept.length + (before ? 1 : 0)
  const wide = fortnight.kept.length <= 3
  const room = wide ? BOATS_WIDE : BOATS_NARROW
  return (
    <figure className="hy-rhythm" aria-labelledby={named}>
      <figcaption className="hy-rhythm__cap" id={named}>
        The last fourteen days · a dot for each thing done
      </figcaption>
      <ol
        className="hy-rhythm__days"
        data-row={cells <= 7 ? 'one' : 'two'}
        data-before={before ? '' : undefined}
        data-wide={wide ? '' : undefined}
        style={{ '--kept': Math.max(1, fortnight.kept.length) } as CSSProperties}
      >
        {before ? (
          <li className="hy-rhythm__before">
            <span className="hy-rhythm__span">{spanWritten(before.first, before.last)}</span>
            <span className="hy-rhythm__was">
              {before.days === 1 ? 'the day' : `the ${au(before.days)} days`} before this diary
              began
            </span>
          </li>
        ) : null}
        {days.map((d) => {
          const shown = d.strands.slice(0, RHYTHM_CAP)
          const more = d.strands.length - shown.length
          const quotes = touched.get(d.day) ?? []
          const drawn = quotes.slice(0, room)
          const left = quotes.length - drawn.length
          return (
            <li
              className="hy-rhythm__day"
              key={d.day}
              data-kept={d.kept ? '' : undefined}
              data-today={d.day === today ? '' : undefined}
            >
              <span className="hy-rhythm__more" aria-hidden="true">
                {more > 0 ? `+${au(more)}` : ''}
              </span>
              <span className="hy-rhythm__beads" aria-hidden="true">
                {shown.map((strand, i) => (
                  /* A DOT'S IDENTITY IS ITS PLACE IN THE DAY: the list is derived from the
                     day's events in the order they happened and never reorders, inserts or
                     filters, which is the reconciliation bug the rule exists to catch. */
                  // eslint-disable-next-line react/no-array-index-key
                  <span className="hy-bead" key={i} data-strand={strand} />
                ))}
              </span>
              <span className="hy-rhythm__when" aria-hidden="true">
                <span className="hy-rhythm__wd">{d.weekday}</span>
                <span className="hy-rhythm__d">{d.date}</span>
              </span>
              {d.kept ? (
                drawn.length > 0 ? (
                  /* READ AS WELL AS SEEN: the boats are words a reader hears after the day,
                     and words the contrast ruler measures — an aria-hidden run is set aside */
                  <ul className="hy-rhythm__boats">
                    {drawn.map((q) => {
                      const picture = boatPicture(q)
                      const who = q.customer.name.trim()
                      return (
                        <li className="hy-boat" key={q.id} data-pictured={picture ? '' : undefined}>
                          {picture ? (
                            <span className="hy-boat__frame">
                              <img
                                className="hy-boat__pic"
                                src={picture.src}
                                width={picture.width}
                                height={picture.height}
                                alt=""
                                loading="lazy"
                                decoding="async"
                              />
                            </span>
                          ) : null}
                          <span className="hy-boat__name">{boatOfQuote(q).name}</span>
                          <span className="hy-boat__who">{who === '' ? q.reference : who}</span>
                        </li>
                      )
                    })}
                    {left > 0 ? (
                      <li className="hy-boat hy-boat--more">{`and ${au(left)} more`}</li>
                    ) : null}
                  </ul>
                ) : (
                  <span className="hy-rhythm__quiet" aria-hidden="true">
                    Nothing done
                  </span>
                )
              ) : null}
              <span className="hy-sr">
                {`${d.written}: ${
                  !d.kept
                    ? 'before this diary began'
                    : d.strands.length === 0
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
}: {
  filed: readonly QuoteDef[]
  /** every day of the whole diary — nothing is narrowed when the origin is drawn */
  days: readonly DiaryDay[]
  today: string
  span: SpanKey
  hidden: { days: number; quotes: number }
  narrowed: boolean
  onEveryDay: () => void
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
          <Button intent="veiled" size="sm" onClick={onEveryDay}>
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
          whatever the days leave, and no longer than the rhythm under a full diary. The
          rhythm of the last fortnight stands at its foot, one dot for every event kept. */}
      <div className="hy-end__run">
        <Rhythm days={rhythm} fortnight={fortnight} today={today} />
      </div>
      <p className="hy-end__lab">
        <span className="hy-end__node" aria-hidden="true" />
        Since {time === '' ? '' : `${time}, `}
        {when === '' ? since.day : when}
      </p>
      <dl className="hy-end__figs">
        <div className="hy-fig">
          <dt className="hy-fig__say">{since.kept === 1 ? 'quote written' : 'quotes written'}</dt>
          <dd className="hy-fig__n">{au(since.kept)}</dd>
        </div>
        <div className="hy-fig" data-strand="given">
          <dt className="hy-fig__say">
            {since.given === 1 ? 'given to a customer' : 'given to customers'}
          </dt>
          <dd className="hy-fig__n">{au(since.given)}</dd>
        </div>
        {since.givenSummed > 0 ? (
          <div className="hy-fig" data-strand="given">
            <dt className="hy-fig__say">
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

function Day({
  day,
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
      <div className="hy-dayhead" role="row">
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
              <Button
                intent={open === '' ? 'act' : 'veiled'}
                aria-label="New quote"
                onClick={onStart}
                refusedBecause={newQuote ? undefined : NO_WAY_TO_THE_PICKER}
              >
                New quote
              </Button>
            </span>
          ) : null}
        </div>
      </div>

      {/* THE LAST STEP AND ITS WAY BACK, on the head of the spine —
          the configurator's rail head, not a toast. Pinned to the
          document the step made. */}
      {isToday && (step || refused) ? (
        <div className="hy-steprow" role="row">
          <div className="hy-steprow__cell" role="gridcell" aria-colspan={COLUMNS}>
            {step ? (
              <output className="hy-step" data-testid="last-step">
                <span className="hy-step__said">{step.saids.join(' · ')}</span>
                {step.discarded ? null : (
                  <>
                    <Button intent="veiled" size="sm" onClick={() => onGoTo(step.quoteId)}>
                      Its line
                    </Button>
                    <Button intent="veiled" size="sm" onClick={onTakeBack}>
                      Discard it
                    </Button>
                  </>
                )}
              </output>
            ) : null}
            {refused ? (
              <p className="hy-alarm" role="alert">
                {refused}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {day.entries.length === 0 ? (
        <div className="hy-empty" role="row">
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
        </div>
      ) : (
        day.entries.map((entry) => {
          const key = keyOf(day.day, entry.quote.id)
          return (
            <Line
              key={key}
              lineKey={key}
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
        })
      )}
    </div>
  )
}

/* ---------------------------------------------------------- */
/* Day one: the empty state, drawn to teach                     */
/* ---------------------------------------------------------- */

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
        <p className="hy-teach__q">What will appear here</p>
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
        <p className="hy-teach__q">Why it is empty today</p>
        {/* WHAT IS TRUE TODAY, AND NOTHING ELSE (built-critique-m2-close-2.md,
            major 4): this said "Work is kept here — not on a server — until the
            file is exported", and no screen has an export. */}
        <p className="hy-teach__a">{WHERE_THE_DIARY_IS_KEPT}</p>
      </section>

      <section className="hy-teach__block">
        <p className="hy-teach__q">Where a quote starts</p>
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
              <Button intent="veiled" onClick={openTheFile}>
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
        <p className="hy-teach__q">How a line is coloured</p>
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

function Line({
  lineKey,
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

  return (
    <>
      <div
        className="hy-line"
        role="row"
        id={lineId(lineKey)}
        ref={(element) => {
          hold(lineKey, element)
        }}
        data-on={on ? '' : undefined}
        data-open={open ? '' : undefined}
        data-standing={standing}
        aria-selected={on}
        aria-expanded={open}
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
        <span className="hy-cell hy-cell--standing" role="gridcell">
          {STANDING_TITLE[standing]}
        </span>
        <span className="hy-cell hy-cell--total" role="gridcell">
          {total === null ? (
            <span className="hy-nofigure">{nothing ? NOTHING_ON_IT : NOT_PRICED}</span>
          ) : (
            <PriceFigure amount={total} />
          )}
        </span>
      </div>

      {open ? (
        <Fold
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
    </>
  )
}

/** What opening a document does, said before it is pressed. */
const opensAs = (standing: ReturnType<typeof standingOf>): string =>
  standing === 'draft' ? 'Open the build' : 'Open the document'
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

  return (
    <div className="hy-fold" role="row" data-testid="fold">
      <div className="hy-fold__cell" role="gridcell" aria-colspan={COLUMNS}>
        <div className="hy-fold__top">
          <span className="hy-fold__standing" data-standing={standing}>
            {STANDING_TITLE[standing]}
          </span>
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
          <Button intent="veiled" size="sm" aria-label="Close" onClick={onClose}>
            Close
          </Button>
        </div>

        <p className="hy-fold__boat">
          <b>{boatOfQuote(quote).say}</b>
          {' · '}
          {quote.customer.name.trim() === '' ? 'nobody named on it' : quote.customer.name.trim()}
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
                  <Button intent="veiled" size="sm" onClick={() => onGoTo(version.id)}>
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
          <div className="hy-acts__one">
            <Button
              intent="act"
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
              about a shut sheet. */}
          <div className="hy-acts__one">
            <Button
              intent="veiled"
              aria-label="Quote this again, at today’s prices"
              refusedBecause={why === '' ? undefined : why}
              onClick={() => onAgain(quote)}
            >
              Quote this again, at today’s prices
            </Button>
          </div>
          {why === '' ? (
            <p className="hy-acts__where">
              A new draft for the same {boatOfQuote(quote).name} on the same page, priced from the
              file as it reads today and addressed to the same person. Not one figure is copied from
              this one, and nothing on this one changes.
            </p>
          ) : !sheetOpen && openTheFile ? (
            <div className="hy-acts__one">
              <Button intent="veiled" size="sm" onClick={openTheFile}>
                Load the Master Price File
              </Button>
            </div>
          ) : null}

          {rowId && openCustomer ? (
            <div className="hy-acts__one">
              <Button intent="veiled" size="sm" onClick={() => openCustomer(rowId)}>
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
    </div>
  )
}
