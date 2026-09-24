/* ============================================================
   THE PROPOSAL, READ OFF ONE `fix` IN THE ADDRESS — grouped by
   CAUSE, priced, and carrying the command that would accept it.

   WHAT THIS FILE IS. The cascade draws three kinds of thing and not
   one of them is invented here: the shape is `domain/model/offer`'s
   `Cascade`, the figures are `levelConflict`'s and `quoteTotals`',
   the sentences are `cascadeOfConflict`'s and `fitmentCascade`'s,
   and the act is `setLevel`'s or `refinish`'s — each already a
   command with an inverse and a typed event. This turns them into
   one shape the screen can draw in one pass, so the screen holds no
   arithmetic and no phrasing of its own.

   IT IS PURE AND IT IS TESTED WITHOUT A BROWSER, the same
   arrangement `src/screens/configurator/chapters.ts` and
   `src/screens/picker/fleet.ts` keep: a screen-local reading, with
   its own suite against the real pack.

   ── WHY IT GROUPS BY CAUSE AND NOT BY VERB ───────────────────

   This is direction B of `docs/research/refs/cascade/notes.md` §6,
   and the grouping IS the direction. Porsche's sheet groups by verb
   — one card of things added, one card of things removed — and the
   sweep's §5 counts the cost: five removed rows all reading "not
   compatible with your selection", naming neither the selection nor
   what about it. Group by verb and the reason has nowhere to go but
   onto every row; group by CAUSE and the reason is the heading, said
   once, owning the rows it explains.

   MEASURED on a Highfield SP560 with eight lines, moved from Cash to
   Trade: three lines move and five hold, which is two cards by verb
   and FOUR by cause —

     now priced at Trade                                 the hull
     now priced at Trade Price                           two Yamahas
     no Trade price on the price file — it stays at
       Sell inc Rego                                     two trailers
     no Trade price on the price file — it stays at Sell the batteries
     the price file gives it no price of its own —       the tube covers,
       it stays as it is                                 the rigging kit

   — where each heading is the engine's decision, and each owns the
   rows it is about. The FACT is always the engine's: which line moves,
   which holds, to which column and why. Three of its sentences are
   said here in a dealer's words instead of the workbook's (M2-close
   critique #4): a held line's "no price column on this table" and "no
   Trade column — stays at …" (`heldSay`, matched exactly and falling
   back to the engine's own words), and the trailer-load check that
   cannot run (`FLOOR_UNCHECKED`). Where a channel gave no sentence
   the group has no heading rather than a sentence this file made up.

   ── THE TWO CHANNELS THAT FIRE ON A DEALER'S OWN PRICE FILE ──

   THE RUNG. `levelConflict` is wired, correct and, until this screen
   existed, invisible: pressing Trade re-priced every line silently.
   It is the one pick in this application that changes ALL of what is
   already chosen at once.

   THE HULL. `fitmentCascade` was written for "what does this subject
   do to the partners already on the quote", and its own header says
   the event does not exist in this app yet because `rootRowId` is
   written once at creation. THAT IS NO LONGER TRUE: `refinishSubject`
   re-roots a standing quote onto another row of the same register,
   which is exactly the event, and this file is that builder's first
   caller. The trailer, the motor and the rigging on the document
   were paired with the OLD row; the reading says what the new one
   makes of them.

   ── WHAT ACCEPT DOES, AND WHY IT IS A LIST ───────────────────

   `acts` is the commands accept applies, in order, each through
   `quotes.apply` so each pushes its own inverse. It is ONE command
   on the rung — `setLevel` — and one plus a `removeLine` per rejected
   partner on the hull, because a sheet that showed a row under "comes
   off" while accepting left it on the quote would be lying about the
   one thing this screen exists to say.

   MEASURED, and it is not a hypothetical. A marque is a property of
   the model, so every finish of one model shares it and a trailer
   PAIRED with this hull is never rejected — but a person can put an
   unpaired one on, through the configurator's own "show all 434 in
   NSM Custom Trailers" switch, which reaches every live row whether or
   not the price file paired it. `proposal.test.ts` does exactly that
   and then asserts the row comes off, the total is the one the sheet
   promised, and the inverses put both back.
   ============================================================ */

import type { Alternative, CascadeRow, CatalogueCtx, QuoteDef, QuoteLine } from '@/domain/model'
import type { Cascade } from '@/domain/model'
import {
  SUBJECT_BLOCK,
  buildSteps,
  lineAmount,
  quoteLevelChoices,
  quoteTotals,
  refinish,
  refinishSubject,
  removeLine,
  sectionKinds,
  setLevel,
  stepOffer,
  type QuoteCommand,
} from '@/domain/quote'
import { levelConflict, type ConflictLine } from '@/domain/quote/conflict'
import {
  cascadeOfConflict,
  fitmentCascade,
  totalAfterRemoval,
  type PriceOf,
} from '@/domain/quote/cascade'
import { selectPartners, TRAILER_FITMENT } from '@/domain/fitment/trailerFitment'

/* ---------------------------------------------------------- */
/* The address                                                 */
/* ---------------------------------------------------------- */

/** What the `fix` search param names. The first colon separates the
 *  channel from its argument and no later one does — a row id is
 *  `boat_highfield:483`, so splitting on every colon would lose half
 *  of it. */
export type Fix = { kind: 'level'; key: string } | { kind: 'finish'; rowId: string } | null

export function readFix(fix: string): Fix {
  const at = fix.indexOf(':')
  if (at < 1) return null
  const channel = fix.slice(0, at)
  const rest = fix.slice(at + 1).trim()
  if (rest === '') return null
  if (channel === 'level') return { kind: 'level', key: rest }
  if (channel === 'finish') return { kind: 'finish', rowId: rest }
  return null
}

/** The address a configurator writes to raise one. Kept here so the
 *  screen that opens the sheet and the sheet that reads it cannot
 *  spell the same fix two ways. */
export const levelFix = (key: string): string => `level:${key}`
export const finishFix = (rowId: string): string => `finish:${rowId}`

/* ---------------------------------------------------------- */
/* What a row of the sheet is                                  */
/* ---------------------------------------------------------- */

/** What happens to the rows under one cause.
 *
 *    'moves'      the figure changes and the line stays
 *    'holds'      the line stays exactly as it is
 *    'off'        accepting takes it off the quote
 *    'on'         accepting puts it on
 *    'unchecked'  it stays, and something about it could not be
 *                 checked at all — PCPartPicker's disclaimer, per
 *                 subject rather than per page */
export type Fate = 'moves' | 'holds' | 'off' | 'on' | 'unchecked'

/** One line the decision touches, with both figures.
 *
 *  `from` and `to` are the figures the document carries before and
 *  after, and `null` is a real state — "there is no figure here" —
 *  never drawn as zero. `standard` is the other kind of nothing.
 *  Terraform's `"ami-02c9…" -> "ami-0d7d6…"` is the shape: old, new,
 *  and the arithmetic between them shown rather than hidden. */
export interface CauseRow {
  id: string
  label: string
  /** the code a dealer orders by, frozen onto the line */
  code: string
  from: number | null
  to: number | null
  /** the column each figure is read from, as the business wrote it */
  fromColumn: string
  toColumn: string
  standard: boolean
  /** what this row moves the total by. `null` where either side
   *  carries no figure — never 0. */
  delta: number | null
}

/** One reason, and everything it explains.
 *
 *  `because` is the ENGINE'S OWN SENTENCE, read off `CascadeRow.
 *  because` — the constraint's `explain()`, the partner's banner and
 *  its marque, the column a rung falls back to. '' where the channel
 *  gave none, which is the row a person asked for and which needs no
 *  reason (`domain/model/offer.ts` says so in as many words). */
export interface Cause {
  id: string
  because: string
  fate: Fate
  rows: CauseRow[]
  /** what this whole cause moves the total by, or null where not one
   *  of its rows carries a figure on both sides */
  moves: number | null
}

export interface Proposal {
  kind: 'level' | 'finish'
  /** the engine's own shape: title, subtitle, what was asked for, the
   *  committed total, the proposed one, the difference, and the name
   *  of the act */
  cascade: Cascade
  /** one counted line about the thing asked for, so the block that
   *  names it is never a label over an empty cell: how many of this
   *  document's lines carry the rung, or the code the new hull is
   *  ordered by. Counted off the document, never typed. */
  askedSay: string
  causes: Cause[]
  /** what could go on instead, priced, cheapest first */
  alternatives: Alternative[]
  /** lines this decision does not touch at all, counted off the
   *  frozen lines — never a figure the contract does not carry */
  untouched: number
  /** the commands accept applies, in order. See the header. */
  acts: QuoteCommand[]
}

export type Reading = { proposal: Proposal } | { refused: string }

export const isRefused = (r: Reading): r is { refused: string } => 'refused' in r

/* ---------------------------------------------------------- */
/* Sentences this screen says for itself                       */
/* ---------------------------------------------------------- */

/* A REASON ON A ROW IS THE ENGINE'S. A sentence about the ADDRESS is
   this screen's, because no engine knows what somebody typed. The
   sweep counted a cascade route that could not be addressed —
   Porsche's `/feasibility-notification?optionAdded=04P` without the
   whole build redirects to "Select a Model Series" — and named
   surviving that as this screen's requirement. These are how it
   survives. */

/* IN A DEALER'S WORDS (M2-close critique #4): no "cascade", no "the
   pick travels in the address", no "frozen". What a person at the desk
   is owed is what this page can and cannot do for them. */
export const NO_FIX =
  'This link does not say which change to price, so there is nothing here to accept or leave.'

export const NO_QUOTE =
  'No quote is filed at this address. A quote is kept in the browser it was written in, so a link to one only opens on the computer that wrote it. Every quote this browser holds is under Quotes.'

export const NO_FILE =
  'The Master Price File is not loaded in this browser, so nothing can be priced again. Every price already on the quote stays as it was picked.'

/** What the engine says under a level move — "The committed total does
 *  not move until you accept." — in the words of the desk. */
export const UNTIL_YOU_ACCEPT = 'Nothing on the quote changes until you accept.'

/** THE TRAILER'S LOAD AGAINST THE NEW HULL, WHERE IT CANNOT BE CHECKED.
 *  The engine says it three ways, each about the workbook: "No load
 *  column has been named for this project, so the capacity floor
 *  cannot run", "… has no weight column — the band does not carry
 *  one", "This row leaves … empty". Every one means the same thing to
 *  the person choosing a finish, and it is said once, with no row under
 *  it: the engine's placeholder row read "Towing weight — —". */
export const FLOOR_UNCHECKED =
  'Whether the trailer on this quote can carry the new hull is not checked — the price file gives no weight to check it against.'

/** WHY A LINE KEEPS ITS PRICE ON ANOTHER LEVEL, in the dealer's words.
 *  The engine's two sentences are about the workbook — "no price column
 *  on this table", "no Trade column — stays at Sell inc Rego" — and are
 *  matched EXACTLY, so the day the engine changes its words this falls
 *  back to them rather than guessing, and `proposal.test.ts` fails. */
export function heldSay(line: ConflictLine, rung: string): string {
  if (line.why === 'no price column on this table') {
    return 'the price file gives it no price of its own — it stays as it is'
  }
  if (line.why === `no ${rung} column — stays at ${line.toColumn}`) {
    return `no ${rung} price on the price file — it stays at ${line.toColumn}`
  }
  return line.why
}

/* ---------------------------------------------------------- */
/* Grouping                                                    */
/* ---------------------------------------------------------- */

/** Causes in the order their first row appeared, which is the
 *  engine's own order over the document. A Map keeps it; sorting by
 *  anything else would be this file deciding which cause matters
 *  most, and it does not know. */
class Causes {
  private readonly by = new Map<string, Cause>()

  add(because: string, fate: Fate, row: CauseRow): void {
    const id = `${fate}:${because}`
    const found = this.by.get(id)
    if (found) {
      found.rows.push(row)
      return
    }
    this.by.set(id, { id, because, fate, rows: [row], moves: null })
  }

  /** A reason about the whole decision rather than about a line on the
   *  quote — it heads a card with nothing under it. */
  note(because: string, fate: Fate): void {
    const id = `${fate}:${because}`
    if (!this.by.has(id)) this.by.set(id, { id, because, fate, rows: [], moves: null })
  }

  done(): Cause[] {
    const out = [...this.by.values()]
    for (const cause of out) {
      let sum = 0
      let any = false
      for (const row of cause.rows) {
        if (row.delta === null) continue
        sum += row.delta
        any = true
      }
      cause.moves = any ? sum : null
    }
    return out
  }
}

/** The arithmetic of one row, shown rather than hidden. A figure
 *  missing on either side is not a zero and the difference is not
 *  knowable, so it is null. */
const movedBy = (from: number | null, to: number | null): number | null =>
  from === null || to === null ? null : to - from

/* ---------------------------------------------------------- */
/* THE RUNG                                                    */
/* ---------------------------------------------------------- */

function levelProposal(quote: QuoteDef, key: string): Reading {
  const rungs = quoteLevelChoices(quote.lines)
  const rung = rungs.find((r) => r.key === key)
  if (!rung) {
    return {
      refused:
        rungs.length === 0
          ? 'No line on this quote has another price level, so there is nothing to move it to.'
          : `No line on this quote has a price level called “${key}”. Its lines are priced at ${rungs.map((r) => r.label).join(' and ')}.`,
    }
  }

  const conflict = levelConflict(quote, rung.key, rung.label)
  if (!conflict) {
    return {
      refused:
        quote.levelKey === rung.key
          ? `This quote is already priced at ${rung.label}, so there is nothing here to accept.`
          : `Nothing on this quote changes price at ${rung.label}, so there is nothing here to accept.`,
    }
  }

  /* THE SENTENCES ARE READ BACK OUT OF THE ENGINE, not composed from
     the same facts a second time. `cascadeOfConflict` is the one
     place a `ConflictLine` becomes a sentence; this indexes what it
     said by the line it said it about, so every heading on the
     screen is a string that came out of `src/domain/quote/cascade.ts`
     and nothing else. */
  const cascade = {
    ...cascadeOfConflict(conflict, { label: rung.label, amount: null }),
    subtitle: UNTIL_YOU_ACCEPT,
  }
  const said = new Map<string, CascadeRow>()
  for (const row of [...cascade.added, ...cascade.removed, ...cascade.unchecked]) {
    said.set(row.id, row)
  }
  const codes = new Map(quote.lines.map((l) => [l.id, l.code ?? '']))

  const rowOf = (line: ConflictLine): CauseRow => ({
    id: line.lineId,
    label: line.label,
    code: codes.get(line.lineId) ?? '',
    from: line.from,
    to: line.to,
    fromColumn: line.fromColumn,
    toColumn: line.toColumn,
    standard: said.get(line.lineId)?.standard === true,
    delta: movedBy(line.from, line.to),
  })

  const causes = new Causes()
  for (const line of conflict.changed) {
    causes.add(said.get(line.lineId)?.because ?? '', 'moves', rowOf(line))
  }
  for (const line of conflict.held) {
    causes.add(heldSay(line, rung.label), 'holds', rowOf(line))
  }

  return {
    proposal: {
      kind: 'level',
      cascade,
      askedSay: `${rung.carriedBy.toLocaleString('en-AU')} of ${quote.lines.length.toLocaleString('en-AU')} ${quote.lines.length === 1 ? 'line' : 'lines'} on this quote ${rung.carriedBy === 1 ? 'has' : 'have'} a ${rung.label} price`,
      causes: causes.done(),
      alternatives: [],
      untouched: Math.max(0, quote.lines.length - conflict.changed.length - conflict.held.length),
      acts: [setLevel(rung.key)],
    },
  }
}

/* ---------------------------------------------------------- */
/* THE HULL                                                    */
/* ---------------------------------------------------------- */

/** What the price file charges for one partner row, at the rung this
 *  quote is on — read off the engine's own frozen candidates rather
 *  than off a live cell, so an alternative on the sheet is priced the
 *  way it would be priced if it were picked.
 *
 *  SCOPED TO THE TRAILER SECTIONS, because that is the only kind
 *  `TRAILER_FITMENT` selects between, and asking every section for
 *  its whole table would walk a 2,937-row parts register to price six
 *  trailers. */
function partnerPrices(ctx: CatalogueCtx, quote: QuoteDef): PriceOf {
  const priced = new Map<string, number | null>()
  const kinds = sectionKinds(ctx, quote)
  for (const step of buildSteps(quote)) {
    if (kinds[step.id] !== TRAILER_FITMENT.partnerKind) continue
    for (const candidate of stepOffer(ctx, quote, step.section, { all: true }).candidates) {
      priced.set(
        `${candidate.line.entityId}:${candidate.line.rowId}`,
        lineAmount(candidate.line).amount,
      )
    }
  }
  return (partnerTableId, rowId) => priced.get(`${partnerTableId}:${rowId}`) ?? null
}

/** The one line a quote's subject block holds, before or after. */
const subjectLine = (quote: QuoteDef): QuoteLine | undefined => {
  const ids = new Set(quote.sections.find((s) => s.blockId === SUBJECT_BLOCK)?.lineIds ?? [])
  return quote.lines.find((l) => ids.has(l.id))
}

function finishProposal(ctx: CatalogueCtx, quote: QuoteDef, rowId: string): Reading {
  if (quote.rootRowId === rowId) {
    return { refused: `This quote is already written against ${quote.subjectLabel}.` }
  }
  const next = refinishSubject(ctx, quote, rowId)
  if (!next || next === quote) {
    return {
      refused: `That finish is not on the price file, so the hull on this quote cannot be changed to it.`,
    }
  }

  const before = subjectLine(quote)
  const after = subjectLine(next)
  if (!before || !after) {
    return { refused: 'This quote has no hull on it, so there is no hull to change.' }
  }

  const committed = quoteTotals(quote).total

  /* WHAT THE NEW HULL MAKES OF WHAT IS ALREADY ON THE QUOTE. The
     partner lines are handed in as they stand; `fitmentCascade`
     matches each against the reading for the row being proposed and
     says, in its own words, which ones are built for another marque
     and what it could not check at all. */
  const fit = selectPartners(ctx, TRAILER_FITMENT, quote.rootTableId, rowId)
  const partners = next.lines
    .filter((l) => l.id !== after.id)
    .map((l) => ({
      lineId: l.id,
      partnerTableId: l.entityId,
      rowId: l.rowId,
      label: l.label,
      amount: lineAmount(l).amount,
    }))
  const reading = fit
    ? fitmentCascade(
        fit,
        {
          label: next.subjectLabel,
          amount: lineAmount(after).amount,
          ...(next.subjectImage?.src ? { image: next.subjectImage.src } : {}),
        },
        partners,
        committed,
        partnerPrices(ctx, next),
      )
    : null

  const removed = reading?.removed ?? []
  const unchecked = reading?.unchecked ?? []
  const lineIds = new Set(next.lines.map((l) => l.id))

  const causes = new Causes()
  /* THE ROW THAT WAS ASKED FOR NEEDS NO REASON, and `CascadeRow.
     because` is explicit that '' is that state. A sentence invented
     here to fill the heading would be the one thing this screen
     refuses to do. */
  causes.add('', 'moves', {
    id: after.id,
    label: after.label,
    code: after.code ?? '',
    from: lineAmount(before).amount,
    to: lineAmount(after).amount,
    fromColumn: before.priceColumnName ?? '',
    toColumn: after.priceColumnName ?? '',
    standard: false,
    delta: movedBy(lineAmount(before).amount, lineAmount(after).amount),
  })

  const codes = new Map(next.lines.map((l) => [l.id, l.code ?? '']))
  const rowOf = (row: CascadeRow, to: number | null): CauseRow => ({
    id: row.id,
    label: row.label,
    code: codes.get(row.id) ?? '',
    from: row.amount,
    to,
    fromColumn: '',
    toColumn: '',
    standard: row.standard,
    delta: to === null && row.amount !== null ? -row.amount : movedBy(row.amount, to),
  })

  for (const row of removed) causes.add(row.because, 'off', rowOf(row, null))
  for (const row of unchecked) {
    if (row.id.startsWith('floor:')) causes.note(FLOOR_UNCHECKED, 'unchecked')
    else causes.add(row.because, 'unchecked', rowOf(row, row.amount))
  }

  /* THE ARITHMETIC IS THE ENGINE'S. `refinishSubject` has already
     re-rooted the document and `quoteTotals` has already summed it;
     what is left is that the rows under "comes off" are still
     standing in that sum, because taking them off is the second
     command in `acts` and it has not run yet. That subtraction is
     `totalAfterRemoval` in `domain/quote/cascade.ts` — this file
     performs no arithmetic of its own, which is what its header has
     always claimed. */
  const to = totalAfterRemoval(quoteTotals(next).total, removed)

  const cascade: Cascade = {
    id: finishFix(rowId),
    title: `The hull becomes ${next.subjectLabel}.`,
    subtitle: `Everything else on this quote was paired with ${quote.subjectLabel}; this is what the change makes of it.`,
    asked: {
      label: next.subjectLabel,
      amount: lineAmount(after).amount,
      ...(next.subjectImage?.src ? { image: next.subjectImage.src } : {}),
    },
    added: [],
    removed,
    unchecked,
    alternatives: reading?.alternatives ?? [],
    from: committed,
    to,
    delta: to - committed,
    accept: 'Change the hull',
  }

  const touched = new Set<string>([after.id, ...removed.map((r) => r.id)])
  for (const row of unchecked) if (lineIds.has(row.id)) touched.add(row.id)

  return {
    proposal: {
      kind: 'finish',
      cascade,
      askedSay:
        after.code === undefined || after.code === ''
          ? `${next.lines.length.toLocaleString('en-AU')} ${next.lines.length === 1 ? 'line' : 'lines'} on this quote`
          : `Ordered as ${after.code}`,
      causes: causes.done(),
      alternatives: cascade.alternatives,
      untouched: Math.max(0, next.lines.length - touched.size),
      acts: [refinish(ctx, rowId), ...removed.map((row) => removeLine(row.id))],
    },
  }
}

/* ---------------------------------------------------------- */
/* The one door                                                */
/* ---------------------------------------------------------- */

/**
 * WHAT THE ADDRESS PROPOSES, or the sentence saying why it proposes
 * nothing.
 *
 * A refusal here is never a blank screen and never a redirect: the
 * sweep's §5 names a cascade route that cannot be addressed as the
 * failure to avoid, and the way to avoid it is to say plainly what
 * this address asked for and why the document has moved past it.
 */
export function readProposal(ctx: CatalogueCtx, quote: QuoteDef, fix: string): Reading {
  const asked = readFix(fix)
  if (!asked) return { refused: NO_FIX }
  if (asked.kind === 'level') return levelProposal(quote, asked.key)
  return finishProposal(ctx, quote, asked.rowId)
}
