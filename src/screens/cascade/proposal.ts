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

   AND A LINE WITH NO FIGURE READS HERE AS THE PAPER READS IT. Which
   of the three a line is — charged, included, not priced — is
   `linesAsRead`'s answer (the paper's own derivation, in
   `src/domain/quote/cascade.ts`), and the word is the paper's own
   `cellWord`. The sheet told the dealer `Standard` for a rigging kit
   the customer's paper called "Not priced on this quote" until
   2026-09-24; the two now cannot disagree, because they are one call.

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
   and THREE by cause —

     now priced at Trade                                 the hull,
                                                         two Yamahas
     no Trade price on the price file — it stays at      two trailers,
       its Cash price                                    the batteries
     the price file has no price for it at any level,    the tube covers,
       so it is not in the total                         the rigging kit

   It was FIVE until 2026-09-24, and two of them were one cause named
   twice: the engine names a level by each list's own column, so the
   Yamahas moved to "Trade Price" beside the hull's "Trade", and the
   trailers stayed at "Sell inc Rego" beside the batteries' "Sell" —
   all of them Cash. Each level is now said by its declared name
   (`movedSay`, `heldSay`, `domain/quote/levelSaid.ts`;
   m2-last-critique.md, major 5).

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
  isDone,
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
  linesAsRead,
  totalAfterRemoval,
  type PriceOf,
} from '@/domain/quote/cascade'
import { noLevelDeclared, type DocumentLine } from '@/domain/quote/document'
import { selectPartners, TRAILER_FITMENT } from '@/domain/fitment/trailerFitment'
import { boatOfQuote, codeBeside, lineSaid, saidOnQuote } from '@/domain/quote/spoken'
import { lineLevelSaid } from '@/domain/quote/levelSaid'
import { cellWord } from '@/screens/document/paper'

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
 *  never drawn as zero. Terraform's `"ami-02c9…" -> "ami-0d7d6…"` is
 *  the shape: old, new, and the arithmetic between them shown rather
 *  than hidden. */
export interface CauseRow {
  id: string
  label: string
  /** the code a dealer orders by, frozen onto the line */
  code: string
  from: number | null
  to: number | null
  /** the price level each figure is read at, by the level's declared
   *  name — `Cash` and `Trade`, never the list's own column names
   *  `Sell Price` and `Trade Price` (m2-last-critique.md, major 5).
   *  '' where the line has no price column at all. */
  fromColumn: string
  toColumn: string
  /**
   * THE WORD THE CUSTOMER'S PAPER PRINTS FOR THIS LINE where it prints
   * no figure — `Included`, `Not priced on this quote` — on the
   * document before the change and on the one after it. '' where a
   * figure prints. Read off `linesAsRead` (the paper's own derivation)
   * and `cellWord` (the paper's own word), and never decided here: the
   * word `Standard` stood in this place until 2026-09-24, inferred
   * from a missing price column, on a line the paper called unpriced.
   */
  fromWord: string
  toWord: string
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
  /** the paper's word for the thing asked for, where it prints no
   *  figure — a new hull the file prices at nothing, or not at all.
   *  '' where a figure prints, and on a price level, which is not a
   *  line and has no figure of its own. */
  askedWord: string
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
 *  The engine's three sentences are about the workbook — "no price column
 *  on this table", "no Trade column — stays at Sell inc Rego", "priced by
 *  hand at Sell inc Install (if appl.)" — and are matched EXACTLY, so the
 *  day the engine changes its words this falls back to them rather than
 *  guessing, and `proposal.test.ts` fails. `stays` is the level the line
 *  keeps, by its declared name: "it stays at Sell inc Rego" beside "Price
 *  it at Trade" named one quote's one level three ways (m2-last-critique.md,
 *  major 5), where the trailer's Sell inc Rego IS its Cash price.
 *
 *  THE FIRST ONE SAID "no price of its own" until 2026-09-24, and "of
 *  its own" was the same invention as the `Standard` printed under it:
 *  it implies the price is carried somewhere else, and the price file
 *  says nothing of the kind. Then, until 2026-09-25, it said "the price
 *  file has no price for it at any level", which was false too: Rigging
 *  Kits carries Kit Sell Price, Sell Price and Install Retail Sell, and
 *  Dealer Fit Packages carries Act Sell and Sell — what neither table
 *  has is a DECLARED price level. So the reason is the paper's own,
 *  from the paper's own derivation (`noLevelDeclared` in
 *  src/domain/quote/document.ts), with the table named as the paper
 *  names it (`table`, the chapter the line was picked from), and the
 *  consequence the paper states — it is not in the total. One reason,
 *  one source, on the cascade and on the customer's paper. */
export function heldSay(line: ConflictLine, rung: string, stays: string, table?: string): string {
  if (line.why === 'no price column on this table') {
    return `${table ? noLevelDeclared(table) : 'no price level is declared for it'}, so it is not in the total`
  }
  if (line.why === `no ${rung} column — stays at ${line.toColumn}`) {
    return `no ${rung} price on the price file — it stays at its ${stays} price`
  }
  if (line.why === `priced by hand at ${line.fromColumn}`) {
    return `priced by hand at ${stays}`
  }
  return line.why
}

/** THE ENGINE'S REASON FOR A LINE THAT MOVES, with the level named as
 *  the dealership declared it: `cascade.ts` says "now priced at Trade
 *  Price" for a motor and "now priced at Trade" for the hull, and the
 *  two causes were drawn as two headings over one decision. Matched
 *  EXACTLY, like `heldSay`; anything else is the engine's own words. */
export function movedSay(because: string, line: ConflictLine, level: string): string {
  return because === `now priced at ${line.toColumn}` && level !== ''
    ? `now priced at ${level}`
    : because
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

/** The paper's word for one line of one document, '' where the paper
 *  prints a figure for it — or where that document does not carry the
 *  line at all, which leaves the figure to say what it can. */
const wordOn = (read: ReadonlyMap<string, DocumentLine>, lineId: string): string => {
  const line = read.get(lineId)
  return line ? cellWord(line) : ''
}

/** A line of one document as its paper names it — the hull as the boat,
 *  anything else as `lineSaid` says it with the register it came from —
 *  and its code only where that name does not already carry it: the
 *  cascade printed "Yamaha - F250XCB" over "F250XCB" (m2-last-critique.md,
 *  major 4). */
const namedOn = (
  doc: QuoteDef,
  line: { id: string; label: string },
): { label: string; code: string } => {
  const frozen = doc.lines.find((l) => l.id === line.id)
  const label = frozen ? saidOnQuote(doc, frozen) : lineSaid(line.label)
  return { label, code: codeBeside(label, frozen?.code) }
}

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

  /* EACH SIDE OF A ROW READS THE WAY ITS OWN PAPER WOULD. Before is
     this document; after is the one the act itself writes — `setLevel`
     run on it, not a second re-pricing composed here — so a line the
     file prices at nothing at the new level reads `Included` on the
     sheet exactly as it would on the paper printed after accepting.
     The clock is the document's own: nothing is written, only read. */
  const before = linesAsRead(quote)
  const done = setLevel(rung.key)(quote, quote.updatedAt)
  const after = isDone(done) ? linesAsRead(done.next) : before

  /* EACH SIDE'S LEVEL BY ITS DECLARED NAME, read off the line on that
     side's own document: the one standing, and the one the act writes */
  const levelBefore = new Map(quote.lines.map((l) => [l.id, lineLevelSaid(l)]))
  const levelAfter = new Map(
    (isDone(done) ? done.next : quote).lines.map((l) => [l.id, lineLevelSaid(l)]),
  )
  const rowOf = (line: ConflictLine): CauseRow => ({
    id: line.lineId,
    ...namedOn(quote, { id: line.lineId, label: line.label }),
    from: line.from,
    to: line.to,
    fromColumn: levelBefore.get(line.lineId) ?? '',
    toColumn: levelAfter.get(line.lineId) ?? '',
    fromWord: wordOn(before, line.lineId),
    toWord: wordOn(after, line.lineId),
    delta: movedBy(line.from, line.to),
  })

  const causes = new Causes()
  for (const line of conflict.changed) {
    const because = said.get(line.lineId)?.because ?? ''
    causes.add(movedSay(because, line, levelAfter.get(line.lineId) ?? ''), 'moves', rowOf(line))
  }
  /* THE TABLE EACH LINE WAS PICKED FROM, named as the paper names it:
     the chapter's own title from the same `buildSteps` the document
     reads, so the reason a held line gives here is word for word the
     one its customer reads on the paper */
  const tableOf = new Map(
    buildSteps(quote).flatMap((step) => step.lines.map((l) => [l.id, step.title] as const)),
  )
  for (const line of conflict.held) {
    causes.add(
      heldSay(line, rung.label, levelAfter.get(line.lineId) ?? '', tableOf.get(line.lineId)),
      'holds',
      rowOf(line),
    )
  }

  return {
    proposal: {
      kind: 'level',
      cascade,
      askedWord: '',
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
    return { refused: `This quote is already written against the ${boatOfQuote(quote).say}.` }
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
          label: boatOfQuote(next).say,
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

  /* THE PAPER'S READING OF BOTH DOCUMENTS: the one standing, and the
     one `refinishSubject` has already written for the new hull. */
  const readBefore = linesAsRead(quote)
  const readAfter = linesAsRead(next)

  const causes = new Causes()
  /* THE ROW THAT WAS ASKED FOR NEEDS NO REASON, and `CascadeRow.
     because` is explicit that '' is that state. A sentence invented
     here to fill the heading would be the one thing this screen
     refuses to do. */
  causes.add('', 'moves', {
    id: after.id,
    /* the hull as a person says it; its code stands beside it */
    label: boatOfQuote(next).say,
    code: after.code ?? '',
    from: lineAmount(before).amount,
    to: lineAmount(after).amount,
    fromColumn: lineLevelSaid(before),
    toColumn: lineLevelSaid(after),
    fromWord: wordOn(readBefore, before.id),
    toWord: wordOn(readAfter, after.id),
    delta: movedBy(lineAmount(before).amount, lineAmount(after).amount),
  })

  /* A PARTNER'S FIGURES ARE READ OFF THE NEW DOCUMENT — `fitmentCascade`
     was handed `next`'s lines — so its word is read off the same one,
     and the word and the figure beside it cannot come from two papers.
     A row that comes off has no "after" on any paper; the screen says
     `off the quote` there. The row is named as the paper that carries it
     names it (`namedOn`): the new document where it stays, the standing
     one where it comes off. */
  const rowOf = (row: CascadeRow, to: number | null, stays: boolean): CauseRow => ({
    id: row.id,
    ...namedOn(next.lines.some((l) => l.id === row.id) ? next : quote, row),
    from: row.amount,
    to,
    fromColumn: '',
    toColumn: '',
    fromWord: wordOn(readAfter, row.id),
    toWord: stays ? wordOn(readAfter, row.id) : '',
    delta: to === null && row.amount !== null ? -row.amount : movedBy(row.amount, to),
  })

  for (const row of removed) causes.add(row.because, 'off', rowOf(row, null, false))
  for (const row of unchecked) {
    if (row.id.startsWith('floor:')) causes.note(FLOOR_UNCHECKED, 'unchecked')
    else causes.add(row.because, 'unchecked', rowOf(row, row.amount, true))
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
    /* the boats as a person says them (built-critique-m2-close-2.md) */
    title: `The hull becomes the ${boatOfQuote(next).say}.`,
    subtitle: `Everything else on this quote was paired with the ${boatOfQuote(quote).say}; this is what the change makes of it.`,
    asked: {
      label: boatOfQuote(next).say,
      amount: lineAmount(after).amount,
      ...(next.subjectImage?.src ? { image: next.subjectImage.src } : {}),
    },
    added: [],
    removed,
    unchecked,
    /* each as the paper would name it once it is on the quote */
    alternatives: (reading?.alternatives ?? []).map((alt) => ({
      ...alt,
      label: lineSaid(alt.label),
    })),
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
      askedWord: wordOn(readAfter, after.id),
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
