/* ============================================================
   WHAT THE SUMMARY LISTS: every line on the quote, once, in the
   build's own order, with its picture and its figure.

   Read off the rail the build already drew, so the summary and the
   chapters cannot disagree: a chapter's lines are its tables' chosen
   rows and, under them, the lines its list does not carry (`also` —
   nothing on a quote is ever invisible). The thing the quote is for —
   the boat, or the motor, trailer or product sold on its own — is the
   subject's line, which no table draws; it leads.
   ============================================================ */

import type { TableKind } from '@/domain/model'
import type { OptionRow, Rail } from './chapters'

export interface SummaryItem {
  key: string
  /** the name a person says */
  name: string
  /** the chapter it is in, by its name — "Motor" */
  chapter: string
  /** what kind of thing it is, for its ink */
  kind: TableKind
  /** its figure at the quote's price, or null where it carries none */
  amount: number | null
  picture: OptionRow['picture']
}

/** Every line on the quote: the boat first, then each chapter's lines in the rail's order. */
export function summaryItems(
  rail: Rail,
  boat: {
    name: string
    amount: number | null
    picture: OptionRow['picture']
    /** where it sits: the hull chapter on a boat; the list it was sold from on anything else */
    chapter: string
    kind: TableKind
  } | null,
): SummaryItem[] {
  const out: SummaryItem[] = []
  if (boat) {
    out.push({
      key: 'boat',
      name: boat.name,
      chapter: boat.chapter,
      kind: boat.kind,
      amount: boat.amount,
      picture: boat.picture,
    })
  }
  for (const chapter of rail.chapters) {
    if (chapter.kind !== 'band') continue
    for (const table of chapter.tables) {
      for (const row of [...table.rows.filter((r) => r.fitted), ...table.also]) {
        out.push({
          key: `${table.id}:${row.key}`,
          name: `${row.stem === '' ? '' : `${row.stem} `}${row.tail}`.trim(),
          chapter: chapter.name,
          kind: table.kind,
          amount: row.amount,
          picture: row.picture,
        })
      }
    }
  }
  return out
}

/** The first email address a contact line holds, or ''. The line is printed as typed, so it may
 *  hold a phone number, an address, or an email among other words. */
export function emailIn(contact: string): string {
  return /[^\s@<>(),;:]+@[^\s@<>(),;:]+\.[a-z]{2,}/i.exec(contact)?.[0] ?? ''
}
