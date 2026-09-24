/* ============================================================
   THE NEWEST QUOTE WHOSE BOAT IS PHOTOGRAPHED — what the register
   draws in the room its rows leave (rule (e), critique #17).

   With one quote filed the register used to end two thirds of the way
   up the window, and a register may not invent a row to fill it. What
   it may do is show a real one better: the boat on the newest quote,
   on the water, when the image ledger holds a photograph of THAT
   model — never a stand-in, never a boat of the same maker, never a
   resemblance. `pictureOf` is Home's own reader of the heroes ledger
   (`pictureForSubject`), which answers for an exact model standing as
   its own word in the label and for nothing else, and it is handed in
   so this stays a pure function a test can hold to the file.

   NEWEST IS THE REGISTER'S OWN ORDER: a quote is dated by the act
   that froze it when it was given to a customer, and by its last touch
   while it is a draft — the instant a row is aged by. Ties fall to the
   later reference, which is the later of two written in one second.

   IF NO QUOTE HERE HAS ITS BOAT HELD, THE ANSWER IS NULL, and since
   2026-09-24 the register then asks this same function for the newest
   quote of all (a reader that holds every boat) and draws that quote's
   cover instead (`./cover.ts`): its own catalogue copy, its maker's mark
   or its name in type. Nothing is ever drawn as a photograph of it.
   ============================================================ */
import type { QuoteDef } from '@/domain/model'
import type { RegisterRow } from '@/domain/quote/register'

export interface Pictured<P> {
  row: RegisterRow
  picture: P
}

/** The instant the register ages a row by. */
const agedAt = (row: RegisterRow): string => row.issuedAt ?? row.updatedAt

export function newestPictured<P>(
  rows: readonly RegisterRow[],
  quotes: readonly QuoteDef[],
  pictureOf: (tableId: string, label: string) => P | undefined,
): Pictured<P> | null {
  const byId = new Map(quotes.map((q) => [q.id, q]))
  const newest = rows.toSorted(
    (a, b) => agedAt(b).localeCompare(agedAt(a)) || b.reference.localeCompare(a.reference),
  )
  for (const row of newest) {
    const quote = byId.get(row.id)
    if (!quote) continue
    const picture = pictureOf(quote.rootTableId, quote.subjectLabel)
    if (picture !== undefined) return { row, picture }
  }
  return null
}
