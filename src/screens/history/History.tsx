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
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { Button, Input, Kbd, PriceFigure, closesStage, isField, stageKeyOf } from '@/ui'
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
  daysFrom,
  eventDay,
  indexDays,
  kindsSay,
  localTimeOf,
  type DayEntry,
  type DiaryDay,
} from '@/domain/quote/diary/days'
import { useCatalogue, useQuotes, useSession } from '@/app/useStores'
import { quotes as quotesStore } from '@/state/quotes'
import { ctxFrom } from '@/state/catalogue'
import { PACK_ORG_ID } from '@/data/pack/boot'
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
 *  way to a document. */
export const NO_WAY_TO_OPEN =
  'This screen was handed no way to open a document, so nothing was opened. A draft opens at /quote/$id and an issued quote at /quote/$id/document.'
/** Said at the act, when nothing handed this screen a way to the picker. */
export const NO_WAY_TO_THE_PICKER =
  'This screen was handed no way to the picker, so nothing was started. The picker is at /quote/new.'
/** Said where `Quote this again` stands, on a desk whose price file is
 *  shut. `whyNotAgain` would otherwise say the row is off the sheet,
 *  which is a different fact from the sheet not being open at all. */
export const NO_SHEET_TO_PRICE_FROM =
  'No price file is open in this browser, so there is nothing to price it from today. Load the Master Price File and this quote can be raised again at today’s prices.'
/** Said in an opened line for a document filed with no diary on it. */
export const NO_DIARY_SAY =
  'This document carries no diary. It was filed before the sentence that made it was kept on the document, so the only day it can be placed on is the day it was made. It still opens and still prints.'

/** WHERE THE OTHER TWO COCKPIT SCREENS OF THIS ROUND ARE, by address.
 *  The customers screen is being built beside this one; the fold links
 *  to it by address where a quote points at a row of the register. */
export const CUSTOMERS_ADDRESS = '/customers'

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
const SPAN_KEY: Record<SpanKey, string> = {
  all: 'Esc',
  today: 'T',
  week: 'W',
  month: 'M',
  year: 'Y',
}

export function History({
  business = null,
  goHome,
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

  const spine = useRef<HTMLDivElement>(null)
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
    const port = spine.current
    if (!row || !port) return
    const box = row.getBoundingClientRect()
    const inside = port.getBoundingClientRect()
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
          `${quote.subjectLabel} could not be quoted again: the row was read and the document came back empty. Nothing was written.`,
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
     THE KEYBOARD, BOUND TO THE SPINE AND NOT TO THE WINDOW — WCAG 2.2
     SC 2.1.4's own "active only on focus" exemption, the register's
     argument. J/K and the arrows move; Space opens a line in place
     and shuts it; Enter opens the document; Q raises the quote under
     the cursor again; N starts one; the four spans are T, W, M, Y;
     `/` is the find field; Escape climbs the ladder — the fold, then
     the typed words, then the customer, then the span. Each key is
     printed on the control it belongs to.
     ============================================================ */
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (isField(event.target)) return
    const key = event.key
    if (event.metaKey || event.ctrlKey || event.altKey) return

    if (key === 'ArrowDown' || key === 'j' || key === 'J') {
      event.preventDefault()
      move(1)
      return
    }
    if (key === 'ArrowUp' || key === 'k' || key === 'K') {
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
    if (key === 'q' || key === 'Q') {
      event.preventDefault()
      const at = entryAt(cursor)
      if (at) again(at.entry.quote)
      return
    }
    if (key === 'n' || key === 'N') {
      event.preventDefault()
      startOne()
      return
    }
    if (key === '/') {
      event.preventDefault()
      field.current?.focus()
      return
    }
    const spanKey = SPANS.find((s) => SPAN_KEY[s].toLowerCase() === key.toLowerCase())
    if (spanKey && filed.length > 0) {
      event.preventDefault()
      setSpan((was) => (was === spanKey ? 'all' : spanKey))
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

  return (
    <main className="hy" data-testid="history" data-read={read ? '' : undefined}>
      <header className="hy-head">
        <div className="hy-head__who">
          <p className="hy-eyebrow">{business ?? 'This business has not been named yet'}</p>
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
                  <Kbd>{SPAN_KEY[s]}</Kbd>
                </Button>
              </span>
            ))}
            {span !== 'all' ? (
              <span className="hy-span">
                <Button intent="veiled" size="sm" onClick={() => setSpan('all')}>
                  {SPAN_TITLE.all}
                  <Kbd>Esc</Kbd>
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
            <span className="hy-find__key">
              <Kbd>/</Kbd>
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
            {sheetOpen
              ? `Priced from the Master Price File · ${au(Object.keys(sheet.tables).length)} tables`
              : 'No price file is open in this browser. Every figure here was frozen when it was written.'}
          </p>
        </div>

        {goHome ? (
          <div className="hy-head__back">
            <Button intent="veiled" onClick={goHome}>
              Home
            </Button>
          </div>
        ) : null}
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
            ? `${narrowed ? ' ' : ''}${SPAN_TITLE[span]}: ${hidden.quotes === 0 && hidden.days === 0 ? 'every day is inside it.' : `${au(hidden.quotes)} ${hidden.quotes === 1 ? 'quote' : 'quotes'} on ${au(hidden.days)} earlier ${hidden.days === 1 ? 'day' : 'days'} ${hidden.quotes === 1 && hidden.days === 1 ? 'is' : 'are'} outside it.`}`
            : ''}
          {customer !== ANY_CUSTOMER ? (
            <>
              {' '}
              <Button intent="veiled" size="sm" onClick={() => setCustomerFilter(ANY_CUSTOMER)}>
                Everyone
                <Kbd>Esc</Kbd>
              </Button>
            </>
          ) : null}
        </p>
      ) : null}

      <div className="hy-body">
        <div
          className="hy-spine"
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

        {/* THE VOCABULARY, PRINTED WHERE THERE IS A KEYBOARD, and taken
            away under `pointer: coarse` — the register's device rule.
            Each key with a control is also on it; these are the ones
            whose act has no control of its own. */}
        <p className="hy-keys">
          <Kbd>J</Kbd>
          <Kbd>K</Kbd> move · <Kbd>Space</Kbd> opens a line in place · <Kbd>Enter</Kbd> opens the
          document · <Kbd>Esc</Kbd> closes
        </p>
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
  const title = dayTitle(day.day, today)
  const t = day.tally
  return (
    <div
      className="hy-day"
      role="rowgroup"
      aria-label={title}
      data-today={isToday ? '' : undefined}
    >
      {/* THE NODE. The absolute day once, on the head; the row says
          the time (`live/github-commits.png`). The tally beside it is
          B's gutter figure kept as a fact: counts, and one sum of
          frozen totals with its denominator when they differ. */}
      <div className="hy-dayhead" role="row">
        <div className="hy-dayhead__cell" role="gridcell" aria-colspan={5}>
          <span className="hy-node" aria-hidden="true" />
          <span className="hy-dayhead__title">{title}</span>
          <span className="hy-dayhead__stamp">{day.day}</span>
          {t.quotes > 0 ? (
            <span className="hy-dayhead__tally">
              {au(t.quotes)} {t.quotes === 1 ? 'quote' : 'quotes'} · {au(t.events)}{' '}
              {t.events === 1 ? 'event' : 'events'}
              {t.given > 0 ? (
                <>
                  {' '}
                  · {au(t.given)} given
                  {t.givenSummed > 0 ? (
                    <>
                      {' '}
                      <PriceFigure amount={t.givenTotal} />
                      {t.givenSummed < t.given
                        ? ` from ${au(t.givenSummed)} of ${au(t.given)}`
                        : ''}
                    </>
                  ) : null}
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
                <Kbd>N</Kbd>
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
          <div className="hy-steprow__cell" role="gridcell" aria-colspan={5}>
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
          <div className="hy-empty__cell" role="gridcell" aria-colspan={5}>
            {bare ? (
              <Teaching sheetOpen={sheetOpen} openTheFile={openTheFile} />
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

function Teaching({ sheetOpen, openTheFile }: { sheetOpen: boolean; openTheFile?: () => void }) {
  return (
    <div className="hy-teach">
      <h2 className="hy-teach__head">Nothing has been written in this diary yet.</h2>

      <section className="hy-teach__block">
        <p className="hy-teach__q">What will appear here</p>
        <p className="hy-teach__a">
          Every quote, on the day something happened to it: the day it was started, each motor,
          trailer or part put on it, the rung it was priced at, the name it was addressed to, the
          moment it was given to the customer, and every step taken back. Each day is a node on this
          spine; each quote touched that day is one line under it, counted in words — and the line
          opens to the sentences the app said as it happened, with the time each one was said.
        </p>
      </section>

      <section className="hy-teach__block">
        <p className="hy-teach__q">Why it is empty today</p>
        <p className="hy-teach__a">
          No quote has been started in this browser. Work is kept here — not on a server — until the
          file is exported, so a new machine starts with an empty diary, and that is the true state
          rather than a fault. No entry is invented to fill it.
        </p>
      </section>

      <section className="hy-teach__block">
        <p className="hy-teach__q">Where a quote starts</p>
        <p className="hy-teach__a">
          At <b>/quote/new</b>. <b>New quote</b>, on the Today node above, opens the picker: every
          boat on the price file, by register and by model. The moment one is chosen this diary gets
          its first line, under Today, reading <b>started</b>; the register at <b>/quotes</b> lists
          the same document by where it stands.
        </p>
        {sheetOpen ? null : (
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

      {/* THE ANATOMY OF A LINE, DRAWN EMPTY WITH EVERY REGION NAMED —
          the one way to show what a line will be without writing a
          quote nobody made. Out of the reading order: a diagram. */}
      <p className="hy-teach__cap">A line will read like this</p>
      <div className="hy-spec" aria-hidden="true">
        <span className="hy-spec__well hy-spec__well--quiet">reference</span>
        <span className="hy-spec__well">what happened, counted</span>
        <span className="hy-spec__well hy-spec__well--quiet">the boat · who it is for</span>
        <span className="hy-spec__well hy-spec__well--quiet">standing</span>
        <span className="hy-spec__well hy-spec__well--right">the total</span>
      </div>
      <p className="hy-teach__foot">
        No photograph stands on this screen: a diary is made of sentences and dates, and nothing
        stands in for one. A total on a line is the sum of that document’s own frozen lines, never a
        live price read.
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
        <span className="hy-cell hy-cell--ref" role="gridcell">
          {quote.reference}
          {of > 1 ? <span className="hy-mark">{`v${nth} of ${of}`}</span> : null}
        </span>
        {/* WHAT HAPPENED IS THE TITLE. On the register the boat is the
            title and the state the band; on a diary the day is the
            band and what was DONE is the thing a person came to read,
            so it takes the weight and the boat takes the quiet line. */}
        <span className="hy-cell hy-cell--what" role="gridcell">
          {kindsSay(entry.events)}
        </span>
        <span className="hy-cell hy-cell--who" role="gridcell">
          <span className="hy-boat">{quote.subjectLabel}</span>
          <span className="hy-customer">{name === '' ? 'Nobody named on it' : name}</span>
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
const WHAT_OPENING_DOES: Record<ReturnType<typeof standingOf>, string> = {
  draft: 'It opens where it is written, still changeable, at /quote/$id.',
  given: 'It opens as the sheet the customer was given, at A4, at /quote/$id/document.',
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
  /* THE WHOLE DIARY, OLDEST FIRST, EACH ENTRY DATED, with the ones on
     this day marked — so the head above stands over its own day and
     every other day names itself on its own entry. */
  const diary: QuoteEvent[] = quote.events.toSorted((a, b) =>
    a.at < b.at ? -1 : a.at > b.at ? 1 : 0,
  )
  const onThisDay = new Set(entry.events.map((e) => e.id))
  const why = whyNot(quote)
  const rowId = quote.customerRef?.rowId
  const dayWord = dayTitle(day.day, today)

  return (
    <div className="hy-fold" role="row" data-testid="fold">
      <div className="hy-fold__cell" role="gridcell" aria-colspan={5}>
        <div className="hy-fold__top">
          <span className="hy-fold__standing">{STANDING_TITLE[standing]}</span>
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
            <Kbd>Esc</Kbd>
          </Button>
        </div>

        <p className="hy-fold__boat">
          <b>{quote.subjectLabel}</b>
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
              <Kbd>Enter</Kbd>
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
              <Kbd>Q</Kbd>
            </Button>
          </div>
          {why === '' ? (
            <p className="hy-acts__where">
              A new draft for the same {quote.subjectLabel} on the same page, priced from the file
              as it reads today and addressed to the same person. Not one figure is copied from this
              one, and nothing on this one changes.
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
                Every quote to this person, at {CUSTOMERS_ADDRESS}. The name on this document stays
                as it was frozen; the register may say something newer.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
