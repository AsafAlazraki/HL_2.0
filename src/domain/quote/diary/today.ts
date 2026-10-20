/* ============================================================
   TODAY, IN ONE LINE — the glance a salesperson takes once or twice a
   day (docs/research/refs/home2/why.md, job 6), read off the diary
   this browser keeps and nothing else.

   IT COUNTS EVENTS THAT HAPPENED HERE. Quotes started today (a quote
   minted, or a new version made) and quotes given today (issued). The
   line says no time: "the last at 10:19" under a card that said "Given
   today at 10:17" was one fact twice, and with drafts open nobody could
   tell the last of what (2026-10-20, the second cold critique of Home,
   major 6); the time is still read, as `lastAt`. It is not a target, a rate or a
   trend: Northside sets none, and a figure against one would be
   invented. A day on which the diary holds nothing says so, and says
   the day the last thing was kept, in the diary's own words.

   A BROWSER THAT HAS KEPT NO QUOTE IS NOT ASKED. `todayOf` answers
   null, and the screen says the day-one sentence it owns, because
   "nothing has moved today" over an empty desk is the same fact told
   as if something might have.

   PURE. `today` is handed in as `YYYY-MM-DD`, as every diary reading
   takes it, so the caller's calendar and this file's are one.
   ============================================================ */
import type { QuoteDef } from '@/domain/model'
import { localDay } from '@/domain/quote/day'
import { dayWritten, indexDays, localTimeOf } from './days'

export interface TodayLine {
  /** quotes started today: minted, or a new version made */
  started: number
  /** quotes given today */
  given: number
  /** documents touched today, whatever was done to them */
  touched: number
  /** `09:48`, the time of the last thing kept today, or '' */
  lastAt: string
  /** the last day anything was kept, `YYYY-MM-DD` */
  lastDay: string
  /** the line itself */
  said: string
}

const quotes = (n: number): string => `${n.toLocaleString('en-AU')} ${n === 1 ? 'quote' : 'quotes'}`

/** Today's line, or null for a browser that has kept no quote. */
export function todayOf(filed: readonly QuoteDef[], today: string): TodayLine | null {
  if (filed.length === 0) return null
  const days = indexDays(filed)
  const lastDay = days[0]?.day ?? ''
  const day = days.find((d) => d.day === today)
  if (!day) {
    const when = dayWritten(lastDay, today)
    return {
      started: 0,
      given: 0,
      touched: 0,
      lastAt: '',
      lastDay,
      said:
        when === ''
          ? 'Nothing has moved today.'
          : `Nothing has moved today. The last thing kept was on ${when}.`,
    }
  }
  let started = 0
  let given = 0
  let last = ''
  for (const entry of day.entries) {
    for (const event of entry.events) {
      if (event.kind === 'minted' || event.kind === 'versioned') started += 1
      if (event.kind === 'issued') given += 1
      if (event.at > last) last = event.at
    }
    if (entry.lastAt > last) last = entry.lastAt
  }
  const lastAt = last === '' ? '' : localTimeOf(last)
  const parts: string[] = []
  if (started > 0) parts.push(`${quotes(started)} started`)
  if (given > 0)
    parts.push(started > 0 ? `${given.toLocaleString('en-AU')} given` : `${quotes(given)} given`)
  if (parts.length === 0) parts.push(`${quotes(day.entries.length)} worked on`)
  const head = `Today: ${parts.join(' and ')}`
  return {
    started,
    given,
    touched: day.entries.length,
    lastAt,
    lastDay,
    said: `${head}.`,
  }
}

/**
 * THE QUOTES GIVEN ON ONE DAY, newest given first — what Home draws as
 * documents a week in, beside the drafts, rather than as people owed a
 * call (`people/owed.ts` leaves today's out: the customer has the quote
 * in their hand). Read off the document's own `issuedAt`, in the
 * reader's calendar, and nothing else.
 */
export function givenOn(filed: readonly QuoteDef[], day: string): QuoteDef[] {
  return filed
    .filter(
      (quote) => quote.state === 'issued' && quote.issuedAt && localDay(quote.issuedAt) === day,
    )
    .toSorted((a, b) => ((a.issuedAt ?? '') < (b.issuedAt ?? '') ? 1 : -1))
}
