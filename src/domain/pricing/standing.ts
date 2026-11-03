/* ============================================================
   THE QUOTES ALREADY ON THE DESK THAT A PRICE DECISION TOUCHES —
   counted before the decision is written.

   WHY THIS EXISTS (the judge of Prices, 2026-11-04, L8). Northside
   makes these decisions with live deals on the desk, and the screen
   said only "from the next quote". A quote is a photograph: its lines
   froze their prices when they went on (`freezeLevels`), so a choice
   made here moves no figure on any quote already written. What it
   does change is the line that went on BEFORE its list had a price —
   it waits, unpriced, and the build offers to price it at the chosen
   figure in one press. So the count is: the drafts carrying lines
   from the list, and of them the lines still waiting for this price.
   An issued quote is never touched, and is said apart.

   Pure: no React, no store.
   ============================================================ */

import type { QuoteDef } from '@/domain/model'

export interface StandingQuote {
  id: string
  reference: string
  /** who it is for, as the quote froze it; '' where nobody is named yet */
  customer: string
  /** its lines from the list */
  lines: number
  /** of those, the lines with no price, waiting for this one */
  waiting: number
}

export interface Standing {
  /** drafts carrying a line from the list, the ones waiting first, then newest first */
  drafts: StandingQuote[]
  /** issued quotes carrying a line from the list: frozen, never moved */
  issued: number
}

/** The quotes on the desk that carry a line from these lists. */
export function standingOn(
  quotes: readonly Pick<
    QuoteDef,
    'id' | 'reference' | 'state' | 'lines' | 'customer' | 'updatedAt'
  >[],
  tableIds: ReadonlySet<string>,
): Standing {
  const drafts: Array<StandingQuote & { at: string }> = []
  let issued = 0
  for (const q of quotes) {
    const on = q.lines.filter((l) => tableIds.has(l.entityId))
    if (on.length === 0) continue
    if (q.state === 'issued') {
      issued += 1
      continue
    }
    drafts.push({
      id: q.id,
      reference: q.reference,
      customer: q.customer?.name.trim() ?? '',
      lines: on.length,
      /* a price typed on the line by hand is not waiting: the salesperson already priced it */
      waiting: on.filter((l) => l.unitPrice === null && l.overridePrice === undefined).length,
      at: q.updatedAt,
    })
  }
  return {
    drafts: drafts
      .toSorted((a, b) => Number(b.waiting > 0) - Number(a.waiting > 0) || b.at.localeCompare(a.at))
      .map(({ at: _at, ...q }) => q),
    issued,
  }
}
