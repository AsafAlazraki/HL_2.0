/* ============================================================
   WHO IS OWED A CALL — the people a salesperson rings this morning,
   read off what this browser holds and nothing it does not.

   WHY IT EXISTS (docs/research/refs/home2/why.md, §2.10 and job 3).
   After R. Kelleher was given a quote and J. Harrow was filed with no
   quote at all, Home said nothing about either: the pill counted
   "Customers 2" and that was the only trace. Both are owed a call.

   TWO KINDS OF PERSON, and nothing in between:

     · GIVEN, WAITING — the newest quote to them was handed over and is
       still the current word (`Standing` 'given': not replaced by a
       later version). Oldest given first, because the one who has
       waited longest is rung first.
     · NOT YET QUOTED — kept in the book with no quote to them at all.
       Newest touched first, because the one filed this morning is the
       one whose details are freshest.

   A person whose newest quote is a draft is not owed a call: the
   draft is being written, and it stands with the drafts. A replaced
   quote is followed by the version that replaced it, which is theirs
   too and is the newer.

   A PROMISE IT CAN KEEP: THE LAST SEVEN DAYS (2026-10-20, the cold
   critique of the built Home, major 9). This app records no call, so
   "given and not yet followed up" cannot be known, and a list of
   everyone whose newest quote was given becomes, within a month,
   everyone ever quoted, led by the oldest. So the list says only what
   is true and still useful:

     · GIVEN ON ONE OF THE SEVEN DAYS BEFORE TODAY. Not today: a person
       given a quote this morning has it in their hand, and may still
       be sitting at the desk. Home draws today's given quotes as
       documents, not as people owed a call.
     · KEPT WITH NO QUOTE, TOUCHED IN THE LAST SEVEN DAYS, today
       included: a person filed this morning and sent away without a
       quote is the one most owed a call.

   Older than that, a person is found by name in Customers, where every
   one of them is kept. THE NUMBER TO RING is the person's own first
   contact line, read as a phone by its look (`placeLines`), and
   nothing is dialled or recorded.

   NO SCORE, NO HEAT, NO "LIKELY TO CLOSE". Nothing in this app records
   that anybody bought anything (`diary/history.ts` says the same), so
   the only facts here are a standing and a day, each read off a
   document. The day is said as the diary says a day — "today", or
   "Friday 16 October" — and never as a count of days, which a reader
   can count differently from the screen (the judge's finding on board
   D2: "Given the ADV7 on Friday, 3 days ago", from Friday 16 to
   Tuesday 20).
   ============================================================ */
import type { BookRow } from './book'
import { daySaid, placeLines } from './book'
import { localDay } from '@/domain/quote/day'
import type { HistoryIndex } from '@/domain/quote/diary/history'
import { boatOfQuote } from '@/domain/quote/spoken'

export interface OwedACall {
  /** the book's row id, or the quoted name's key */
  key: string
  /** true for a person kept in the book */
  kept: boolean
  name: string
  why: 'given' | 'unquoted'
  /** the quote they are waiting on, for a person given one */
  quoteId: string | null
  reference: string | null
  /** the boat on it, as its headline says it — "Highfield ADV7" */
  boat: string | null
  /** `YYYY-MM-DD` it was given, '' for a person with no quote */
  day: string
  /** the one line under their name */
  said: string
  /** their first contact line as it prints, or '' */
  contact: string
  /** that line, where it reads as a phone number, or '' */
  phone: string
}

/** How many days a person stays owed a call: the week before today. */
export const OWED_FOR_DAYS = 7

/** The `YYYY-MM-DD` that is `n` calendar days before `day`. */
export function dayBefore(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number)
  if (!y || !m || !d) return day
  const at = new Date(Date.UTC(y, m - 1, d - n))
  return at.toISOString().slice(0, 10)
}

/** Said under a person kept in the book with no quote to them. */
export const NO_QUOTE_YET = 'No quote yet.'

/** The sentence under a person given a quote: the boat, and the day. */
export function givenSaid(boat: string, day: string, today: string): string {
  const when = daySaid(day, today)
  if (when === '') return `Given the ${boat}.`
  return when === 'today' ? `Given the ${boat} today.` : `Given the ${boat} on ${when}.`
}

/** Everybody owed a call this week: those given a quote on one of the
 *  seven days before today (oldest given first), then those kept with no
 *  quote and touched in the last seven days (newest touched first). A
 *  row with no name is nobody a salesperson can ring, and is left out. */
export function owedACall(
  rows: readonly BookRow[],
  index: HistoryIndex,
  today: string,
): OwedACall[] {
  const given: OwedACall[] = []
  const unquoted: { row: BookRow; owed: OwedACall }[] = []
  const since = dayBefore(today, OWED_FOR_DAYS)
  for (const row of rows) {
    const name = row.name.trim()
    if (name === '') continue
    const contact = row.contact.trim()
    const phone = placeLines([contact]).phone
    if (row.latest === null) {
      if (!row.kept) continue
      const touched = localDay(row.touched)
      if (touched <= since || touched > today) continue
      unquoted.push({
        row,
        owed: {
          key: row.rowId,
          kept: true,
          name,
          why: 'unquoted',
          quoteId: null,
          reference: null,
          boat: null,
          day: '',
          said: NO_QUOTE_YET,
          contact,
          phone,
        },
      })
      continue
    }
    if (row.latest.standing !== 'given') continue
    /* given today is in their hand; given before the week is Customers' to find */
    if (row.latest.day >= today || row.latest.day < since) continue
    const quote = index.byId.get(row.latest.id)
    const boat = quote ? boatOfQuote(quote).name : ''
    given.push({
      key: row.rowId,
      kept: row.kept,
      name,
      why: 'given',
      quoteId: row.latest.id,
      reference: row.latest.reference,
      boat: boat === '' ? null : boat,
      day: row.latest.day,
      said: boat === '' ? `Given ${row.latest.reference}.` : givenSaid(boat, row.latest.day, today),
      contact,
      phone,
    })
  }
  given.sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : a.name.localeCompare(b.name)))
  unquoted.sort((a, b) =>
    a.row.touched < b.row.touched ? 1 : a.row.touched > b.row.touched ? -1 : 0,
  )
  return [...given, ...unquoted.map((u) => u.owed)]
}
