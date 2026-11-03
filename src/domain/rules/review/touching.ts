/* ============================================================
   WHAT A CASE TOUCHES: THE QUOTES THAT CARRY ITS LINES (the judge of
   Review, 2026-11-04, missing item 8 and J15: "a Formosa SRT 715 at $0
   or an ALP 5.3M at the wrong rego goes on a quote without a word").

   A quote is a photograph: its lines froze their price when picked, and
   it never reads the price list again. But each frozen line keeps the
   list and the row it was picked from ("for 'open this row', never for
   pricing", `QuoteLine`), and the quote keeps the row its boat came
   from. So a case that names a line can say which quotes on this
   computer carry it, with a door to each — and a case fixed today
   still says the draft holds the old figure until the line is picked
   again there.

   Only the lines a case names are matched: a column pair (two under
   one name) names no line, and touches no quote.

   PURE: cases and quotes in, the quotes each case touches out.
   ============================================================ */

import type { QuoteDef } from '@/domain/model'
import { boatOfQuote } from '@/domain/quote/spoken'
import { linesOfCase, type Case } from './cases'

export interface QuoteTouch {
  id: string
  reference: string
  state: QuoteDef['state']
  /** who it is for, as the quote froze it; '' when nobody is named yet */
  who: string
  /** its boat as every screen says it */
  boat: string
  /** what on it the case names: the boat itself, or a line on it */
  carries: 'boat' | 'line'
}

/** Each case's key → the quotes that carry any line it names, newest first. */
export function quotesTouching(
  cases: readonly Case[],
  quotes: readonly QuoteDef[],
): Map<string, QuoteTouch[]> {
  const byLine = new Map<string, Array<{ q: QuoteDef; carries: 'boat' | 'line' }>>()
  const add = (at: string, q: QuoteDef, carries: 'boat' | 'line'): void => {
    const list = byLine.get(at) ?? []
    if (!list.some((x) => x.q.id === q.id)) list.push({ q, carries })
    byLine.set(at, list)
  }
  for (const q of quotes) {
    add(`${q.rootTableId}\u0000${q.rootRowId}`, q, 'boat')
    for (const l of q.lines) add(`${l.entityId}\u0000${l.rowId}`, q, 'line')
  }
  const out = new Map<string, QuoteTouch[]>()
  for (const c of cases) {
    const seen = new Map<string, QuoteTouch>()
    for (const line of linesOfCase(c)) {
      for (const { q, carries } of byLine.get(`${line.tableId}\u0000${line.rowId}`) ?? []) {
        if (seen.has(q.id)) continue
        seen.set(q.id, {
          id: q.id,
          reference: q.reference,
          state: q.state,
          who: q.customer?.name?.trim() ?? '',
          boat: boatOfQuote(q).say,
          carries,
        })
      }
    }
    if (seen.size > 0) {
      const touched = [...seen.values()]
      const at = new Map(quotes.map((q, i) => [q.id, i]))
      touched.sort((a, b) => (at.get(a.id) ?? 0) - (at.get(b.id) ?? 0))
      out.set(c.key, touched)
    }
  }
  return out
}
