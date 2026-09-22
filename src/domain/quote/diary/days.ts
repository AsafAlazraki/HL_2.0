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
import { localDay } from '@/domain/quote/day'
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

const oldestFirst = (a: QuoteEvent, b: QuoteEvent): number =>
  a.at < b.at ? -1 : a.at > b.at ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0

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
      const ordered = [...events].sort(oldestFirst)
      const last = ordered[ordered.length - 1]
      entries.push({ quote, events: ordered, lastAt: last ? last.at : quote.createdAt })
    }
    /* most recently touched first, with a stable tie-break on the id
       so two quotes touched in one millisecond do not swap places
       between two renders */
    entries.sort((a, b) =>
      a.lastAt !== b.lastAt
        ? a.lastAt < b.lastAt
          ? 1
          : -1
        : a.quote.id < b.quote.id
          ? 1
          : a.quote.id > b.quote.id
            ? -1
            : 0,
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
 * issued` reads the way the day went.
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

export function kindsSay(events: readonly QuoteEvent[]): string {
  if (events.length === 0) return NO_DIARY
  const counts = new Map<QuoteEventKind, number>()
  for (const e of events) counts.set(e.kind, (counts.get(e.kind) ?? 0) + 1)
  const parts: string[] = []
  for (const [kind, n] of counts) {
    const words = KIND_WORDS[kind]
    parts.push(n === 1 ? words[0] : words[1](n.toLocaleString('en-AU')))
  }
  return parts.join(' · ')
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
