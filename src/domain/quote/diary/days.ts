/* ============================================================
   THE DIARY, CUT BY THE DAY SOMETHING HAPPENED.

   `history.ts` cuts a list of quotes by `createdAt`, which is the
   right calendar for the register and the wrong one for a diary.
   A quote started on Monday and issued on Friday sits under Monday
   there, with `20260824-01 is issued` among the sentences beneath it
   — one head over two calendars, which is the exact fault
   `docs/research/refs/history/notes.md` §0.1 caught GitHub printing
   (`live/github-pr-20463-commits.png`: the head reads `Commits on
   Dec 14, 2020`, every row under it `committed on Dec 15, 2020`) and
   the critic then found at home (`critique-m2.md` §5). This file is
   the reader the diary lacked: an index of EVENTS by the local day
   each one fell on, so a day head can only ever stand over things
   that happened on that day.

   ONE CALENDAR, AND IT IS `day.ts`'S. Every instant on an event is a
   UTC ISO string; the day it belongs to is read through `localDay`,
   which is the one rule the reference, the document's date plate and
   the register already share. Brisbane is UTC+10, so an event at
   02:00 local on Friday is still Thursday in UTC, and this file never
   looks at the string's first ten characters. The timezone suite
   pins that rule; the test beside this file pins it here.

   WHAT A DAY HOLDS. For each day, newest day first: the quotes
   TOUCHED that day — one entry per quote, ordered by the last thing
   that happened to it, newest first — and on each entry the events
   that fell on that day, OLDEST FIRST, because that is the order a
   diary is read in. And a tally, every figure of which is a count or
   a sum of frozen numbers:

     quotes       how many documents were touched that day
     events       how many things happened to them
     given        how many of them were ISSUED that day — an `issued`
                  event on that day, never the document's state
     givenTotal   THE SUM OF `quoteTotals(q).total` OVER THOSE, which
                  is the figure printed on each of their sheets — the
                  frozen lines plus the signed adjustments, tax
                  inclusive — and it is the total they were issued
                  AT, because an issued document's lines are frozen
                  from that moment and `apply` refuses every write
                  afterwards. Never a forecast, never a pipeline.
     givenSummed  how many of the `given` carried a figure at all —
                  the denominator, printed whenever it is not the
                  numerator. The issue gate refuses a document with
                  nothing priced on it, so on this engine the two are
                  equal; a hand-edited file is still counted honestly.

   A DOCUMENT WITH NO DIARY IS NOT HIDDEN. A quote whose `events` is
   empty — filed before the store kept the mint's own sentence on the
   document, or read out of an import that dropped the log — has no
   day it was touched on, and a reader that skipped it would be the
   "hidden without a count" the sweep lists under avoid. It is placed
   under the day it was MADE, off `createdAt`, with no events, so the
   screen can say that its diary is empty rather than say nothing.

   PURE. No React, no store, no DOM, no clock. `today` is handed in
   as a `YYYY-MM-DD` string wherever it is needed, exactly as
   `history.ts` takes it, so the caller's calendar and this file's
   are one reading.
   ============================================================ */

import type { QuoteDef, QuoteEvent, QuoteEventKind } from '@/domain/model'
import { localDay, localDayOf } from '@/domain/quote/day'
import { isEmptyQuote, quoteTotals, totalIsNothingByDefault } from '@/domain/quote/totals'

/* ---------------------------------------------------------- */
/* The shapes                                                  */
/* ---------------------------------------------------------- */

export interface DayEntry {
  quote: QuoteDef
  /** the events on this quote that fell on this day, OLDEST FIRST.
   *  Empty only for a document that carries no diary at all. */
  events: QuoteEvent[]
  /** the instant of the last of them — or `createdAt` when there are
   *  none — which is what the day's order is by */
  lastAt: string
}

export interface DayTally {
  quotes: number
  events: number
  given: number
  givenTotal: number
  givenSummed: number
}

export interface DiaryDay {
  /** `YYYY-MM-DD` in the reader's own zone */
  day: string
  /** the quotes touched, most recently touched first */
  entries: DayEntry[]
  tally: DayTally
}

/* ---------------------------------------------------------- */
/* The index                                                  */
/* ---------------------------------------------------------- */

/** An instant as a number to order by. An instant nobody can read sorts after every one
 *  that can, in its own log order, so the order stays total and a hand-edited file still
 *  draws — the day beside it is `localDay`'s business, not this one's. */
const whenOf = (at: string): number => {
  const ms = Date.parse(at)
  return Number.isNaN(ms) ? Number.POSITIVE_INFINITY : ms
}

/**
 * THE ORDER THINGS HAPPENED IN, and the one place it is decided.
 *
 * By instant first. Where two events SHARE an instant — which every minted walk does, because
 * its clock is fixed, and which a fast hand or a batch can do in any millisecond — by their
 * place in the quote's own log, `quote.events`, which the engine only ever APPENDS to
 * (`commands.ts`: "NEVER EDITED AND NEVER TRIMMED") and so is the truth about which came
 * first. Until 2026-09-23 the tie fell to the event's id, and an id is `newId()` — random —
 * so one walk printed `addressed · started · issued` and the next `issued · addressed ·
 * started`, on one tree, both impossible (built-critique-m2.md #4). The log position is
 * read off the array this is handed, so it must be handed ONE quote's events in their log
 * order, or a slice of them that kept it; every caller in this file is.
 */
export function inDiaryOrder(events: readonly QuoteEvent[]): QuoteEvent[] {
  return events
    .map((event, place) => ({ event, place, when: whenOf(event.at) }))
    .sort((a, b) => (a.when !== b.when ? (a.when < b.when ? -1 : 1) : a.place - b.place))
    .map((held) => held.event)
}

/** The day one event fell on, in the reader's own zone. */
export const eventDay = (event: QuoteEvent): string => localDay(event.at)

/**
 * Every day anything happened, newest first, each carrying the quotes
 * touched that day and, on each, that day's events oldest first.
 */
export function indexDays(quotes: readonly QuoteDef[]): DiaryDay[] {
  /* day -> quote id -> that day's events */
  const byDay = new Map<string, Map<string, QuoteEvent[]>>()
  const touch = (day: string, quoteId: string): QuoteEvent[] => {
    let onDay = byDay.get(day)
    if (!onDay) {
      onDay = new Map()
      byDay.set(day, onDay)
    }
    let held = onDay.get(quoteId)
    if (!held) {
      held = []
      onDay.set(quoteId, held)
    }
    return held
  }

  const byId = new Map<string, QuoteDef>()
  for (const q of quotes) {
    byId.set(q.id, q)
    if (q.events.length === 0) {
      /* no diary at all: the day it was made, and nothing on it */
      touch(localDay(q.createdAt), q.id)
      continue
    }
    for (const e of q.events) touch(eventDay(e), q.id).push(e)
  }

  const days: DiaryDay[] = []
  for (const [day, onDay] of byDay) {
    const entries: DayEntry[] = []
    for (const [quoteId, events] of onDay) {
      const quote = byId.get(quoteId)
      if (!quote) continue
      /* `events` was pushed walking `q.events`, so it is this quote's log, in log order,
         cut to the day — exactly what `inDiaryOrder` reads its tie-break off */
      const ordered = inDiaryOrder(events)
      const last = ordered[ordered.length - 1]
      entries.push({ quote, events: ordered, lastAt: last ? last.at : quote.createdAt })
    }
    /* MOST RECENTLY TOUCHED FIRST. Two quotes touched in one millisecond — every quote on a
       minted walk — are told apart by their REFERENCES, newest first: a reference is minted
       in sequence (`20260916-02` after `-01`) and is the same on every run, where an id is
       random and would swap the two lines between one run and the next. The id is the last
       resort, for two documents a hand-edited file gave one reference. */
    entries.sort(
      (a, b) =>
        whenOf(b.lastAt) - whenOf(a.lastAt) ||
        (a.quote.reference < b.quote.reference
          ? 1
          : a.quote.reference > b.quote.reference
            ? -1
            : 0) ||
        (a.quote.id < b.quote.id ? 1 : a.quote.id > b.quote.id ? -1 : 0),
    )
    days.push({ day, entries, tally: tallyOf(entries) })
  }

  days.sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : 0))
  return days
}

/** The day's counted facts. See the header for which sum `givenTotal` is. */
export function tallyOf(entries: readonly DayEntry[]): DayTally {
  const t: DayTally = { quotes: entries.length, events: 0, given: 0, givenTotal: 0, givenSummed: 0 }
  for (const entry of entries) {
    t.events += entry.events.length
    if (!entry.events.some((e) => e.kind === 'issued')) continue
    t.given += 1
    const q = entry.quote
    if (isEmptyQuote(q) || totalIsNothingByDefault(q)) continue
    t.givenTotal += quoteTotals(q).total
    t.givenSummed += 1
  }
  return t
}

/**
 * WHERE THE DIARY BEGINS, AND WHAT IT HAS HELD SINCE — the foot of the spine. A spine drawn
 * newest first ends at the first thing this browser ever kept, and that end is a fact the
 * screen can print instead of leaving the floor under the last line bare (critique #17):
 * the day and instant of the first event, how many documents have been kept since, how many
 * of them were given, and the sum they were given at.
 *
 * EVERY FIGURE IS THE DAY TALLIES ADDED UP, and that is honest for the given ones because a
 * document is issued ONCE — `apply` refuses every write after it, and a change is a new
 * version, which is a new document — so an `issued` event counted on its day is never
 * counted again on another. `kept` is the documents themselves, not the day tallies' sum,
 * because a quote touched on three days is under three heads and is still one quote.
 * null for a browser that has kept nothing.
 */
export interface DiarySince {
  /** the first day anything was kept, `YYYY-MM-DD` in the reader's zone */
  day: string
  /** the instant of the first thing kept — an event, or a diary-less document's making */
  at: string
  kept: number
  given: number
  givenTotal: number
  givenSummed: number
}

export function diarySince(quotes: readonly QuoteDef[]): DiarySince | null {
  if (quotes.length === 0) return null
  let at = ''
  let first = Number.POSITIVE_INFINITY
  for (const q of quotes) {
    const instants = q.events.length === 0 ? [q.createdAt] : q.events.map((e) => e.at)
    for (const instant of instants) {
      const when = whenOf(instant)
      if (when < first || at === '') {
        first = when
        at = instant
      }
    }
  }
  const days = indexDays(quotes)
  let given = 0
  let givenTotal = 0
  let givenSummed = 0
  for (const d of days) {
    given += d.tally.given
    givenTotal += d.tally.givenTotal
    givenSummed += d.tally.givenSummed
  }
  const last = days[days.length - 1]
  return {
    day: last ? last.day : localDay(at),
    at,
    kept: quotes.length,
    given,
    givenTotal,
    givenSummed,
  }
}

/**
 * THE RHYTHM OF THE LAST FEW DAYS — one entry per calendar day up to and including `today`,
 * OLDEST FIRST, each carrying ONE STRAND PER EVENT that fell on it, in the order they
 * happened. It is the diary drawn as a picture of work — a busy day is a tall column of
 * dots, a quiet one a bare mark — and every dot is an event that was kept, so nothing on it
 * can be more or less than the diary holds.
 *
 * A DAY BEFORE THE DIARY BEGAN IS NOT A QUIET DAY. `kept` is false for a day before `began`
 * (`diarySince(...).day`): nothing was being written in this browser then, and a screen that
 * drew it like a day with nothing done would be saying something it does not know.
 *
 * The calendar is `day.ts`'s: each day is stepped back from `today` in LOCAL fields and
 * written by `localDayOf`, so a month's end and a daylight-saving change fall where the
 * reader's own calendar puts them.
 */
export interface RhythmDay {
  /** `YYYY-MM-DD` in the reader's zone */
  day: string
  /** `Wed`, and the day of the month, for the column's own label */
  weekday: string
  date: number
  /** the day written out, for a reader that cannot see the column */
  written: string
  /** one strand per event that day, in the order they happened */
  strands: KindStrand[]
  /** how many documents were touched that day */
  quotes: number
  /** on or after the day the diary began */
  kept: boolean
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function rhythmOf(
  days: readonly DiaryDay[],
  today: string,
  count: number,
  began: string | null,
): RhythmDay[] {
  const [y = Number.NaN, m = Number.NaN, d = Number.NaN] = today.split('-').map((n) => Number(n))
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d) || count < 1) return []
  const byDay = new Map(days.map((x) => [x.day, x]))
  const out: RhythmDay[] = []
  for (let back = count - 1; back >= 0; back -= 1) {
    const at = new Date(y, m - 1, d - back)
    const day = localDayOf(at)
    const held = byDay.get(day)
    /* every event on the day, across its quotes, in the order it happened: the quotes
       touched least recently first, each in its own diary order, then by instant */
    const seen: { when: number; seq: number; strand: KindStrand }[] = []
    for (const entry of held ? [...held.entries].reverse() : []) {
      for (const e of entry.events) {
        seen.push({ when: whenOf(e.at), seq: seen.length, strand: STRAND[e.kind] })
      }
    }
    seen.sort((a, b) => (a.when !== b.when ? (a.when < b.when ? -1 : 1) : a.seq - b.seq))
    out.push({
      day,
      weekday: WEEKDAY_SHORT[at.getDay()] ?? '',
      date: at.getDate(),
      written: dayWritten(day, today),
      strands: seen.map((s) => s.strand),
      quotes: held ? held.entries.length : 0,
      kept: began !== null && day >= began,
    })
  }
  return out
}

/** The days one quote was touched on, newest first — the "and on N
 *  other days" a folded line says, and the way between them. */
export function daysOf(quote: QuoteDef): string[] {
  const seen = new Set<string>()
  if (quote.events.length === 0) seen.add(localDay(quote.createdAt))
  for (const e of quote.events) seen.add(eventDay(e))
  return [...seen].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
}

/** Only the days from `from` on, `from` being `spanFrom`'s answer:
 *  null keeps every day. The cut is by the day something HAPPENED,
 *  never by the day a document was made, which is the whole reason
 *  this file exists beside `filterQuotes`. */
export function daysFrom(days: readonly DiaryDay[], from: string | null): DiaryDay[] {
  if (from === null) return [...days]
  return days.filter((d) => d.day >= from)
}

/* ---------------------------------------------------------- */
/* The words on a folded line                                  */
/* ---------------------------------------------------------- */

/**
 * WHAT A FOLDED LINE COUNTS, IN WORDS — the sweep's own example is
 * `7 picks · 1 put back · priced at Trade · issued`, and the pattern is
 * `live/github-pr-20463-scrolled.png`'s `eps1lon added 21 commits`:
 * same-kind events fold into one counted line, opened beneath.
 *
 * THESE ARE WORDS FOR KINDS, NOT SENTENCES ABOUT EVENTS. A line that
 * reads `7 picks` has said how many things of one kind happened and
 * nothing about any of them; the sentences are the commands' own
 * `said`, printed only when the line is opened. The kinds appear in
 * the order they first happened that day, so `started · 7 picks ·
 * issued` reads the way the day went — and that order is
 * `inDiaryOrder`'s, applied HERE as well as in `indexDays`, so the
 * promise holds for whatever a caller hands in: a day's slice already
 * ordered (unchanged by a second pass) or a quote's raw log.
 */
const KIND_WORDS: Record<QuoteEventKind, [one: string, many: (n: string) => string]> = {
  minted: ['started', (n) => `started ${n} times`],
  versioned: ['a new version', (n) => `${n} new versions`],
  'line-added': ['1 pick', (n) => `${n} picks`],
  'line-removed': ['1 taken off', (n) => `${n} taken off`],
  'qty-set': ['a quantity', (n) => `${n} quantities`],
  'level-set': ['repriced', (n) => `repriced ${n} times`],
  'line-level-set': ['a line repriced', (n) => `${n} lines repriced`],
  'override-set': ['a price typed', (n) => `${n} prices typed`],
  'override-cleared': ['a typed price cleared', (n) => `${n} typed prices cleared`],
  'adjustment-added': ['an adjustment', (n) => `${n} adjustments`],
  'adjustment-changed': ['an adjustment changed', (n) => `${n} adjustment changes`],
  'adjustment-removed': ['an adjustment taken off', (n) => `${n} adjustments taken off`],
  'prices-reread': ['prices re-read', (n) => `prices re-read ${n} times`],
  'subject-refinished': ['refinished', (n) => `refinished ${n} times`],
  'customer-set': ['addressed', (n) => `addressed ${n} times`],
  'customer-unlinked': ['unlinked from the register', (n) => `unlinked ${n} times`],
  'note-set': ['terms written', (n) => `terms written ${n} times`],
  'tax-rate-set': ['tax set', (n) => `tax set ${n} times`],
  'prepared-by-set': ['prepared by set', (n) => `prepared by set ${n} times`],
  issued: ['issued', (n) => `issued ${n} times`],
  undone: ['1 put back', (n) => `${n} put back`],
  redone: ['1 redone', (n) => `${n} redone`],
}

/** Said on a line for a document that carries no diary at all. */
export const NO_DIARY = 'no diary kept'

/**
 * WHICH STRAND OF A QUOTE'S LIFE A KIND BELONGS TO — six, and each is a thing a dealer
 * already says: it was begun, it was built, it was priced, it was addressed, it was given,
 * or a step was taken back. The screen gives each strand an ink so a folded line can be
 * read at a glance (`started · addressed · issued` in three colours reads as a quote that
 * went the whole way in one sitting) — which ink is the screen's, and the strand is here
 * because WHICH kinds go together is a fact about the engine, not about a stylesheet.
 */
export type KindStrand = 'begun' | 'built' | 'priced' | 'addressed' | 'given' | 'back'

const STRAND: Record<QuoteEventKind, KindStrand> = {
  minted: 'begun',
  versioned: 'begun',
  'line-added': 'built',
  'line-removed': 'built',
  'qty-set': 'built',
  'adjustment-added': 'built',
  'adjustment-changed': 'built',
  'adjustment-removed': 'built',
  'subject-refinished': 'built',
  'level-set': 'priced',
  'line-level-set': 'priced',
  'override-set': 'priced',
  'override-cleared': 'priced',
  'prices-reread': 'priced',
  'tax-rate-set': 'priced',
  'customer-set': 'addressed',
  'customer-unlinked': 'addressed',
  'note-set': 'addressed',
  'prepared-by-set': 'addressed',
  issued: 'given',
  undone: 'back',
  redone: 'back',
}

/** The strand one kind belongs to. */
export const strandOf = (kind: QuoteEventKind): KindStrand => STRAND[kind]

/** The strands in the order a quote lives them, each with the word its key prints. */
export const STRANDS: readonly KindStrand[] = [
  'begun',
  'built',
  'priced',
  'addressed',
  'given',
  'back',
]
/* THE KEY SAYS THE WORDS THE LINES SAY (2026-09-24, the M2-close critique's minor 15). A
   line prints `started · addressed · issued`, and the key under it printed "begun · built ·
   priced · addressed · given · taken back" — two vocabularies for one colour. Each strand is
   now keyed by the word its most common kind prints on a line (`KIND_WORDS` above), so the
   eye can match a pip on a line to its word in the key. */
export const STRAND_TITLE: Record<KindStrand, string> = {
  begun: 'started',
  built: 'picks',
  priced: 'repriced',
  addressed: 'addressed',
  given: 'issued',
  back: 'put back',
}

/** One counted word on a folded line: which kind, how many, what it says, and its strand. */
export interface KindPart {
  kind: QuoteEventKind
  n: number
  words: string
  strand: KindStrand
}

/** The counted words a folded line is made of, in the order each kind first happened. */
export function kindParts(events: readonly QuoteEvent[]): KindPart[] {
  const counts = new Map<QuoteEventKind, number>()
  for (const e of inDiaryOrder(events)) counts.set(e.kind, (counts.get(e.kind) ?? 0) + 1)
  const parts: KindPart[] = []
  for (const [kind, n] of counts) {
    const words = KIND_WORDS[kind]
    parts.push({
      kind,
      n,
      words: n === 1 ? words[0] : words[1](n.toLocaleString('en-AU')),
      strand: STRAND[kind],
    })
  }
  return parts
}

export function kindsSay(events: readonly QuoteEvent[]): string {
  if (events.length === 0) return NO_DIARY
  return kindParts(events)
    .map((p) => p.words)
    .join(' · ')
}

/* ---------------------------------------------------------- */
/* The day, written out                                        */
/* ---------------------------------------------------------- */

const WEEKDAY_WORDS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_WORDS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/**
 * A `YYYY-MM-DD` day as a person writes it at the top of a diary page — `Wednesday
 * 16 September` — with the year only when it is not `today`'s. Printed beside `Today`
 * and `Yesterday`, which name the day without dating it; the ISO string it replaces was a
 * database's way of writing a date and never a dealer's. '' for a day it cannot read.
 */
export function dayWritten(day: string, today: string): string {
  const [y = Number.NaN, m = Number.NaN, d = Number.NaN] = day.split('-').map((n) => Number(n))
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return ''
  const at = new Date(y, m - 1, d)
  if (Number.isNaN(at.getTime()) || at.getMonth() !== m - 1 || at.getDate() !== d) return ''
  const sameYear = today.slice(0, 4) === String(y).padStart(4, '0')
  return `${WEEKDAY_WORDS[at.getDay()]} ${d} ${MONTH_WORDS[m - 1]}${sameYear ? '' : ` ${y}`}`
}

/* ---------------------------------------------------------- */
/* The time of day                                             */
/* ---------------------------------------------------------- */

/** `09:12`, in the reader's own zone — the same fields `localDayOf`
 *  reads, one step finer. An unparseable instant is '' rather than
 *  `NaN:NaN`; the day beside it still prints. */
export function localTimeOf(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const p = (n: number): string => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}`
}
