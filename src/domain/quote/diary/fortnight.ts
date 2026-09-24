/* ============================================================
   THE FORTNIGHT AS HISTORY DRAWS IT AT A DESK — the days the diary
   KEPT, each with the quotes it touched, and the days before it began
   said once, as one span.

   m2-last-critique.md major 7 (the specification's major 10): "History
   at 1440 is a fortnight of thirteen empty dashed boxes beside today's
   three dots". Every one of those thirteen was a day BEFORE THE DIARY
   BEGAN — `rhythmOf` marks them `kept: false`, and its own comment says
   why they are not quiet days: nothing was being written in this
   browser then. A 210px box for each of them spent the desk on thirteen
   repetitions of one fact. That fact is said once now, "12 – 24 Sep ·
   before this diary began", and the room goes to the days that were
   kept, each carrying what was done on it: the quotes it touched, most
   recently touched first, which the screen draws with their boats.

   NOTHING IS INVENTED OR DROPPED. Every kept day of the window is
   here, in calendar order, including a kept day with nothing done
   (which IS a quiet day, and is drawn as one); the before-span counts
   exactly the days `rhythmOf` marked unkept. PURE: no clock, no store.
   ============================================================ */

import type { QuoteDef } from '@/domain/model'
import type { DiaryDay, RhythmDay } from './days'

/** One kept day of the window, and the quotes touched on it, most recently touched first. */
export interface FortnightDay extends RhythmDay {
  touched: QuoteDef[]
}

export interface Fortnight {
  /** the days of the window before the diary began, as one span — null when every day was kept */
  before: { first: RhythmDay; last: RhythmDay; days: number } | null
  /** the days since it began, oldest first */
  kept: FortnightDay[]
}

export function fortnightOf(rhythm: readonly RhythmDay[], days: readonly DiaryDay[]): Fortnight {
  const unkept = rhythm.filter((d) => !d.kept)
  const byDay = new Map(days.map((d) => [d.day, d]))
  return {
    before:
      unkept.length === 0
        ? null
        : { first: unkept[0]!, last: unkept[unkept.length - 1]!, days: unkept.length },
    kept: rhythm
      .filter((d) => d.kept)
      .map((d) => ({ ...d, touched: (byDay.get(d.day)?.entries ?? []).map((e) => e.quote) })),
  }
}

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/**
 * THE SPAN BEFORE THE DIARY BEGAN, IN WORDS — "12 – 24 Sep", "31 Aug – 3 Sep", "24 Sep".
 * The month is written once where both ends share it. Read off the days' own `YYYY-MM-DD`,
 * so it is the reader's calendar and never a clock.
 */
export function spanWritten(first: RhythmDay, last: RhythmDay): string {
  const monthOf = (d: RhythmDay): string => MONTH_SHORT[Number(d.day.slice(5, 7)) - 1] ?? ''
  if (first.day === last.day) return `${first.date} ${monthOf(first)}`
  return monthOf(first) === monthOf(last)
    ? `${first.date} – ${last.date} ${monthOf(last)}`
    : `${first.date} ${monthOf(first)} – ${last.date} ${monthOf(last)}`
}
