/* ============================================================
   THE REGISTER, AS A READING OF DOCUMENTS ALREADY WRITTEN.

   Every draft and issued quote, banded, counted, summed and aged —
   and not one figure computed from live data. Each row here is read
   off a frozen document: `quoteTotals` sums the lines the quote
   froze, `subjectLabel` and `customer.name` are what the document
   prints, and the state is the state on the document plus one fact
   about its neighbours (whether anything supersedes it).

   WHY IT IS HERE AND NOT IN THE SCREEN. CLAUDE.md: "A derivation is a
   pure function in src/domain." The quotes register has four of them
   — which band a document falls in, what a row says where a figure
   cannot be shown, how old a document reads, and which documents form
   one version chain — and every one of them is a rule about
   documents rather than a rule about pixels. A component that worked
   them out in JSX would be a second engine, and the day the peek and
   the row disagreed about whether a quote was superseded there would
   be nowhere to look.

   ── SUPERSEDED IS NOT A THIRD STATE ON THE DOCUMENT ───────────

   `QuoteState` is `draft | issued` and there is no third, for the
   reason `model/quote.ts` gives: a third state would need writing,
   and nothing writes it. Superseded is a fact about the SET — an
   issued quote that some later draft names in `supersedesId`. So it
   is derived here, from the documents themselves, and it can never
   drift out of step with the link that produces it.

   `live4/shopify-order-statuses-scrolled.png` is the evidence for
   drawing it as a band rather than as a peer state. Shopify,
   verbatim: "Orders are either Open or Archived, but can have
   additional statuses", each explained in a sentence. Superseded is
   an ADDITIONAL STATUS of an issued quote — it is still issued,
   nothing was edited behind anyone's back — and the band header
   carries that sentence rather than a third colour.

   ── THE BAND IS THE STATE ─────────────────────────────────────

   `live/linear-filters.png`: no state column exists; rows sit under
   group headers that ARE the state, each a glyph, a name and a count
   as a fraction. `ref/tables/github-issues.png` puts the count with
   the thing it counts (`Open 18,480` / `Closed 235,087`). So a band
   carries `shown` and `held` and the screen prints `2 / 7` while a
   query is narrowing; on day one all three bands are zero and print
   zero, which is the whole of the honest empty state's arithmetic.

   ── THE SUM IS OF WHAT IT SAYS IT IS ──────────────────────────

   A band's sum is the sum of the rows in it THAT CARRY A FIGURE, and
   `summed` is how many those were. A draft whose lines are unpriced
   has no total anybody decided on (`totalIsNothingByDefault`), so it
   contributes nothing and is counted out loud instead — the
   numerator and the denominator, which is what CLAUDE.md asks of
   every measured claim.

   PURE. No React, no store, no DOM, no clock: `now` arrives as an
   argument everywhere it is needed, exactly as it does in
   `commands.ts`.
   ============================================================ */

import type { QuoteDef } from '@/domain/model'
import { localDay } from './day'
import { matches } from './find'
import { isEmptyQuote, quoteTotals, totalIsNothingByDefault } from './totals'

/* ---------------------------------------------------------- */
/* The three bands                                             */
/* ---------------------------------------------------------- */

export type RegisterStateId = 'draft' | 'issued' | 'superseded'

export interface RegisterBandSpec {
  id: RegisterStateId
  /** the word, as a dealer says it */
  word: string
  /** what this band is, in one sentence, printed on the header */
  say: string
  /** what an EMPTY one of these means — printed on day one, when
   *  saying "no results" would be an apology for the true state */
  empty: string
}

/**
 * The order is fixed and it is the life of a document: written,
 * given, replaced. A person learns it once and it never reorders
 * itself under them — the same promise `bands.ts` makes about the
 * five decisions on a quote.
 */
export const REGISTER_BANDS: readonly RegisterBandSpec[] = [
  {
    id: 'draft',
    word: 'Draft',
    say: 'Still being written. Everything on a draft can be changed.',
    empty: 'Nothing is being written right now.',
  },
  {
    id: 'issued',
    word: 'Issued',
    say: 'Given to the customer. Read-only from the moment it went out.',
    empty: 'Nothing has been given to a customer yet.',
  },
  {
    id: 'superseded',
    word: 'Superseded',
    say: 'Issued, and a newer version has replaced it. It is still the document that customer was given; nothing was edited behind anyone’s back.',
    empty: 'No quote has been replaced by a newer version.',
  },
]

/* ---------------------------------------------------------- */
/* One row                                                     */
/* ---------------------------------------------------------- */

/**
 * WHAT A ROW OF THIS REGISTER CARRIES, and nothing else.
 *
 * The sweep decided the weight (`docs/research/refs/quotes/notes.md`
 * §1, from `ref/tables/github-issues.png` and
 * `live/github-pulls-vscode.png`): the title slot is the boat and the
 * customer, the reference and the age go in the quiet line, and the
 * total is the one thing GitHub has no equivalent for — so it gets a
 * column of its own, right-aligned and tabular, the way
 * `live4/mercury-banking.png` sets a balance.
 */
export interface RegisterRow {
  id: string
  reference: string
  state: RegisterStateId
  /** the boat, as the document froze it */
  boat: string
  /** the name on the document, or null when nobody has been named */
  customer: string | null
  /** the figure the customer would read, or null when there is none */
  total: number | null
  /** where the figure would stand, when there is no figure to put
   *  there — `marine/marinemax-inventory.png` puts "Request Pricing"
   *  in exactly that slot rather than leaving it blank */
  insteadOfTotal: string | null
  /** how many lines on the document carry no price at all */
  unpriced: number
  /** how many lines it has, priced or not */
  lines: number
  createdAt: string
  updatedAt: string
  issuedAt: string | null
  preparedBy: string | null
  /** the document this one was copied from, when it was */
  supersedesId: string | null
  supersedes: string | null
  /** the document that replaced this one, when one has */
  supersededById: string | null
  supersededBy: string | null
}

/** THE ONE SENTENCE WHERE A FIGURE CANNOT STAND. Both cases are
 *  drafts — the issue gate refuses either before it can be given to
 *  anybody (`issueBlockers`) — so neither ever reaches a customer. */
export const NOTHING_ON_IT = 'Nothing on it yet'
export const NOT_PRICED = 'Not priced yet'

/** Which band one document falls in. `superseded` is the only one
 *  that is not written on the document, and it is a fact about the
 *  set: something newer names this one. */
export function bandOf(quote: QuoteDef, superseded: ReadonlySet<string>): RegisterStateId {
  if (quote.state === 'draft') return 'draft'
  return superseded.has(quote.id) ? 'superseded' : 'issued'
}

/** Every id that some other document supersedes, and the document
 *  that supersedes it. Built once per read rather than searched per
 *  row: a register is a list, and a list that searches itself once
 *  per row is the quadratic nobody notices until there are hundreds. */
export function supersededBy(quotes: readonly QuoteDef[]): Map<string, QuoteDef> {
  const by = new Map<string, QuoteDef>()
  for (const q of quotes) {
    if (!q.supersedesId) continue
    /* NEWEST WINS. Two versions made from one issued quote is a real
       thing a person can do — two salespeople, one boat — and the
       register names the later of them, because that is the one the
       conversation is on. The list arrives newest first, so the first
       seen is the newest and nothing later overwrites it. */
    if (!by.has(q.supersedesId)) by.set(q.supersedesId, q)
  }
  return by
}

/** One document, read as a row. Nothing here reads the catalogue:
 *  every value is one the document froze. */
export function registerRow(
  quote: QuoteDef,
  superseded: ReadonlySet<string>,
  replacedBy: ReadonlyMap<string, QuoteDef>,
  byId: ReadonlyMap<string, QuoteDef>,
): RegisterRow {
  const totals = quoteTotals(quote)
  const nothing = isEmptyQuote(quote)
  const undecided = !nothing && totalIsNothingByDefault(quote)
  const replacement = replacedBy.get(quote.id)
  const from = quote.supersedesId ? byId.get(quote.supersedesId) : undefined
  const name = quote.customer.name.trim()

  return {
    id: quote.id,
    reference: quote.reference,
    state: bandOf(quote, superseded),
    boat: quote.subjectLabel,
    customer: name === '' ? null : name,
    total: nothing || undecided ? null : totals.total,
    insteadOfTotal: nothing ? NOTHING_ON_IT : undecided ? NOT_PRICED : null,
    unpriced: totals.unpricedCount,
    lines: quote.lines.length,
    createdAt: quote.createdAt,
    updatedAt: quote.updatedAt,
    issuedAt: quote.issuedAt ?? null,
    preparedBy: quote.preparedBy?.trim() ? quote.preparedBy.trim() : null,
    supersedesId: quote.supersedesId ?? null,
    /* THE REFERENCE, NOT THE ID, because a reference is what a person
       says out loud. A link whose target has been discarded keeps the
       id and has no reference to print, and the screen says that
       rather than printing a dangling word. */
    supersedes: from?.reference ?? null,
    supersededById: replacement?.id ?? null,
    supersededBy: replacement?.reference ?? null,
  }
}

/* ---------------------------------------------------------- */
/* The bands, with their counts and their sums                 */
/* ---------------------------------------------------------- */

export interface RegisterBand {
  spec: RegisterBandSpec
  /** the rows after the query, in the order they arrived */
  rows: RegisterRow[]
  /** how many this band holds in all, whatever the query says */
  held: number
  /** the sum of the shown rows that carry a figure */
  sum: number
  /** how many of the shown rows that was — the denominator, printed
   *  whenever it differs from `rows.length` */
  summed: number
}

export interface Register {
  bands: RegisterBand[]
  /**
   * EVERY ROW THE QUERY KEPT, IN THE ORDER THEY ARE DRAWN — band by
   * band, newest first inside each — and NOT in the order the
   * repository handed them over.
   *
   * It is the cursor's order, so it has to be the eye's. Built in
   * document order instead, measured at 1280×800 on a register of 23:
   * the newest document was an issued one that a later draft
   * superseded, so it sat in the LAST band, the cursor landed on it at
   * the first paint, and the register opened scrolled to its own
   * bottom with the first band's header off the top. `J` would have
   * walked the same wrong path afterwards.
   */
  shown: RegisterRow[]
  /** how many documents there are in all */
  held: number
  /** true when there is not one document in this browser */
  bare: boolean
}

/**
 * THE WHOLE READING, in one pass.
 *
 * The query is `matches` from `find.ts` and deliberately not a second
 * matcher: that file was written because two surfaces with one search
 * box each will quietly disagree about whether a query hits. Word by
 * word over the reference, the customer, the boat and who prepared
 * it — and nothing else, for the reason `find.ts` gives: a row that
 * matched on a line three screens inside it could not say why it was
 * there.
 */
export function readRegister(quotes: readonly QuoteDef[], query = ''): Register {
  const replacedBy = supersededBy(quotes)
  const superseded = new Set(replacedBy.keys())
  const byId = new Map(quotes.map((q) => [q.id, q]))
  const asked = query.trim()

  const bands: RegisterBand[] = REGISTER_BANDS.map((spec) => ({
    spec,
    rows: [],
    held: 0,
    sum: 0,
    summed: 0,
  }))
  const at = new Map(bands.map((b) => [b.spec.id, b]))

  for (const quote of quotes) {
    const row = registerRow(quote, superseded, replacedBy, byId)
    const band = at.get(row.state)
    if (!band) continue
    band.held += 1
    if (asked !== '' && !matches(quote, asked)) continue
    band.rows.push(row)
    if (row.total !== null) {
      band.sum += row.total
      band.summed += 1
    }
  }

  /* band by band, which is the order they are drawn in — see `shown` */
  const shown = bands.flatMap((band) => band.rows)

  return { bands, shown, held: quotes.length, bare: quotes.length === 0 }
}

/* ---------------------------------------------------------- */
/* The version chain                                           */
/* ---------------------------------------------------------- */

/**
 * EVERY VERSION OF ONE CONVERSATION, oldest first.
 *
 * `newVersionOf` writes ONE link and says so — "not a chain model:
 * production's versioning module keys chains on a `rootQuoteId` that
 * nothing writes". A chain is what those single links add up to, and
 * reading it is this function's whole job: walk `supersedesId` back
 * to the first document, then walk the replacements forward.
 *
 * `live/github-releases-vscode.png` is the shape it is drawn as: every
 * version in a rail, the newest carrying `Latest`. The last element
 * here is that one.
 *
 * A CYCLE CANNOT HAPPEN AND IS STOPPED ANYWAY. `supersedesId` is
 * written once, at mint, naming a document that already existed — so
 * a loop would need a file somebody had edited by hand. The seen-set
 * costs nothing and turns "the register hangs" into "the register
 * shows what it can read".
 */
export function versionsOf(quotes: readonly QuoteDef[], id: string): QuoteDef[] {
  const byId = new Map(quotes.map((q) => [q.id, q]))
  const replacedBy = supersededBy(quotes)
  const here = byId.get(id)
  if (!here) return []

  const seen = new Set<string>([id])
  const back: QuoteDef[] = []
  let older = here.supersedesId ? byId.get(here.supersedesId) : undefined
  while (older && !seen.has(older.id)) {
    seen.add(older.id)
    back.unshift(older)
    older = older.supersedesId ? byId.get(older.supersedesId) : undefined
  }

  const forward: QuoteDef[] = []
  let newer = replacedBy.get(here.id)
  while (newer && !seen.has(newer.id)) {
    seen.add(newer.id)
    forward.push(newer)
    newer = replacedBy.get(newer.id)
  }

  return [...back, here, ...forward]
}

/* ---------------------------------------------------------- */
/* How old a document reads                                    */
/* ---------------------------------------------------------- */

/** A week, in milliseconds — the line where a document stops being
 *  something that just happened and becomes something with a date. */
const A_WEEK = 7 * 24 * 60 * 60 * 1000

/**
 * RELATIVE TIME BEATS A DATE, AND ONLY FOR A WHILE.
 *
 * Measured across the sweep (`notes.md` §3): GitHub writes "opened 2
 * hours ago", Things makes `Today` and `This Evening` headings, and a
 * date appears only where the fact is historical — Bring a Trailer's
 * "Sold for USD $1,000,999 on 9/15/2026". So: minutes, hours and days
 * while the work is live, and after a week the calendar day itself.
 *
 * THE DAY IS THE READER'S OWN, through `localDay`. Every timestamp on
 * a quote is a UTC instant, and `day.ts` records what happened the
 * last time a surface printed one with `.slice(0, 10)`: at UTC+10 the
 * document's own banner and its plate named two different days for one
 * act, for the first ten hours of every morning.
 */
export function ageSay(iso: string, nowMs: number): string {
  const at = new Date(iso).getTime()
  if (Number.isNaN(at)) return localDay(iso)
  const since = nowMs - at
  if (since < 0) return localDay(iso)
  if (since < 60_000) return 'just now'
  if (since < 3_600_000) {
    const n = Math.floor(since / 60_000)
    return `${n} ${n === 1 ? 'minute' : 'minutes'} ago`
  }
  if (since < 86_400_000) {
    const n = Math.floor(since / 3_600_000)
    return `${n} ${n === 1 ? 'hour' : 'hours'} ago`
  }
  if (since < A_WEEK) {
    const n = Math.floor(since / 86_400_000)
    return `${n} ${n === 1 ? 'day' : 'days'} ago`
  }
  return localDay(iso)
}
