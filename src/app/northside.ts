/* ============================================================
   NORTHSIDE'S LETTERHEAD, AS IT STANDS TODAY — worked once, for every
   screen that prints it or gives a quote with it.

   The pure half is `src/domain/northside/letterhead.ts`. What this file
   adds is the one thing the domain may not reach: the mark the app
   carries, read off the pictures it ships (`@/data/pictures`), for the
   business the price list names. A trading name changed on /manage
   keeps the mark, because the mark is looked up by the file's own name.
   ============================================================ */

import type { FrozenLetterhead, FrozenPreparer, OrgProfile } from '@/domain/model'
import type { IssueStamp } from '@/domain/quote/commands'
import { letterheadOf, preparerOf, type PaperMark } from '@/domain/northside/letterhead'
import { letterheadOf as heldMarkOf } from '@/data/pictures'
import marksRaw from '../../data/northside/marks-ledger.json?raw'
import { namesTheSame } from '@/domain/model/pictures'
import { parseHex } from '@/domain/northside/colour'

/** The dark mark the app carries for this business, or null. */
export function heldPaperMark(business: string | null | undefined): PaperMark | null {
  const choice = heldMarkOf(business)
  return choice.drawn
    ? { src: choice.mark.src, width: choice.mark.width, height: choice.mark.height }
    : null
}

/** The letterhead as it stands: what /manage keeps over what the price list names. */
export function letterheadNow(state: {
  org?: OrgProfile | undefined
  business: string | null
}): FrozenLetterhead | null {
  return letterheadOf(state.org, state.business, heldPaperMark(state.business))
}

/** Who prepares a quote, as it stands: the person on /manage by this name, or the name alone. */
export function preparerNow(
  state: { org?: OrgProfile | undefined },
  name: string | null | undefined,
): FrozenPreparer | undefined {
  return preparerOf(state.org?.people, name)
}

/** What the give copies on: the letterhead, the person, and Northside's GST rate and standing
 *  terms, as they stand at that moment — so a draft started before GST was set on Settings is
 *  given at Northside's rate (built-m4-2.md, the first finding). */
export function issueStampNow(
  state: { org?: OrgProfile | undefined; business: string | null },
  preparedBy: string | null | undefined,
): IssueStamp {
  const letterhead = letterheadNow(state)
  const preparer = preparerNow(state, preparedBy)
  const rate = state.org?.gstRate
  const terms = state.org?.quoteTerms?.trim()
  return {
    ...(letterhead ? { letterhead } : {}),
    ...(preparer ? { preparer } : {}),
    ...(rate !== undefined && Number.isFinite(rate) ? { taxRate: rate } : {}),
    ...(terms ? { terms } : {}),
  }
}

/* ---------------------------------------------------------- */
/* The colour Northside's own mark is drawn in                 */
/* ---------------------------------------------------------- */

/** THE INK OF NORTHSIDE'S OWN DARK MARK, as the marks it ships with record it ("ink"), for
 *  Settings to offer as a colour "from the mark" with where it came from. Null where no mark of
 *  the business is held in dark ink, or its ink is not written down. */
export function markInkOf(
  business: string | null | undefined,
): { hex: string; from: string; confirm: boolean } | null {
  const name = business?.trim() ?? ''
  if (name === '') return null
  let rows: unknown
  try {
    rows = JSON.parse(marksRaw)
  } catch {
    return null
  }
  if (!Array.isArray(rows)) return null
  for (const row of rows as Record<string, unknown>[]) {
    if (row.role !== 'organisation' || row.variant !== 'dark') continue
    if (typeof row.brand !== 'string' || !namesTheSame(name, row.brand)) continue
    const hex = typeof row.ink === 'string' ? parseHex(row.ink) : null
    if (!hex) return null
    const host = typeof row.host === 'string' ? row.host.replace(/^www\./, '') : ''
    const verified = typeof row.verifiedBy === 'string' ? row.verifiedBy : ''
    return { hex, from: host, confirm: /owner to confirm/i.test(verified) }
  }
  return null
}
