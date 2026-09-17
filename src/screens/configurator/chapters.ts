/* ============================================================
   THE RAIL, READ OFF THE DOCUMENT AND THE SHEET — one chapter per
   decision, and every figure on it computed by the engine.

   WHAT THIS FILE IS. The configurator draws six kinds of thing and
   not one of them is invented here: the chapters are `orderBands`'s,
   the counts and the shortlist are `stepOffer`'s, the narrowing's
   own words and its measured rate are `stepReason`'s, the sentence a
   chapter with nothing to offer says is `buildSteps`'s, the sentence
   a row off the shortlist carries is `outsideWhy`'s, and the change
   a press would make to the total is `weighPick`'s. This turns them
   into one shape a rail can draw, in one pass, so the screen holds
   no arithmetic and no phrasing of its own.

   IT IS PURE AND IT IS TESTED WITHOUT A BROWSER, the same
   arrangement `src/screens/picker/fleet.ts` keeps: a screen-local
   reading, with its own suite against the real pack.

   ── THE ONE PLACE THIS SCREEN DEPARTS FROM THE SWEEP ──────────

   §2 names "delta against what is fitted — every candidate priced
   relative to the current pick, negatives with a minus", off
   `deep/whaler-engines-chapter.png`, where the fitted 40hp reads $0
   and the 25hp reads −$853.

   THAT IS A RADIO GROUP'S ARITHMETIC AND OUR CHAPTERS ARE NOT RADIO
   GROUPS. `addLine` adds and `removeLine` removes; a section holds
   as many lines as a dealer puts on it, which is the engine's own
   model and is right — a quote really can carry two parts from one
   table, and on this file `Highfield ADV7` slots 4–9 are six
   pairings of the SAME motor told apart by six rigging kits. A
   screen that printed Whaler's −$853 beside a row whose press would
   ADD a second motor would be printing a figure about a press
   nobody can make.

   So the delta is kept and its meaning is the press: `weighPick`
   asks the one summation what the document would total if this row
   went on — or came off, for a row already on it, which is why a
   fitted row's figure is negative. The sign is what the press does.
   ============================================================ */

import type { CatalogueCtx, QuoteDef, QuoteLine, TableKind } from '@/domain/model'
import {
  HANDOVER_TITLE,
  OFFER_CAP,
  PAIR_SLOT_LABEL,
  buildSteps,
  chargeAlreadyIn,
  chargeAlreadyInSentence,
  issueBlockers,
  lineAmount,
  orderBands,
  quoteLevelChoices,
  quoteTotals,
  rungIncludes,
  sectionKinds,
  severalOnStepSentence,
  stepOffer,
  stepReason,
  weighPick,
  type BuildStep,
  type QuoteLevelChoice,
  type StepOffer,
  type StepReason,
} from '@/domain/quote'
import { distinguishingFacts, splitOnSharedStem, type ShownFact } from '@/domain/quote/distinguish'
import { readFinishes, type Finishes } from './finishes'

/** How few letters make a search. Two, which is what the quote
 *  feature's own subject search uses; one letter selects a third of
 *  a 2,937-row table and is a keystroke rather than a question. */
export const SEARCH_MIN = 2

/* ---------------------------------------------------------- */
/* What a press would do                                       */
/* ---------------------------------------------------------- */

/** The act a row on the rail carries. The screen turns each of these
 *  into the engine's own command; nothing here runs one. */
export type Act =
  | { do: 'add'; blockId: string; line: QuoteLine }
  | { do: 'remove'; lineId: string; label: string }
  | { do: 'refinish'; rowId: string; label: string }

/** One pressable row of a chapter — a motor, a trailer, a part, a
 *  finish. Everything a card prints is on it, already read. */
export interface OptionRow {
  /** the PAIRING's identity, never the minted line's: a line id is
   *  fresh on every render and React keyed on one loses the focus
   *  inside the card every time a neighbour changes */
  key: string
  /** the label, split into the part every row here shares and the
   *  part that is this row's own */
  stem: string
  tail: string
  /** the business's own code for it, frozen onto the line */
  code: string
  /** the figure the file states, and the column it was read from */
  amount: number | null
  column: string | null
  /** what the press moves the running total by, and to. `delta` is
   *  null where the row carries no price at all — never 0. */
  delta: number | null
  would: number
  /** the price file's own star, and it is the file's alone */
  starred: boolean
  /** already on the quote, so the press takes it off */
  fitted: boolean
  /** off the shortlist: reached by searching past the narrowing or
   *  by asking for the whole table */
  outside: boolean
  /** why it is off the shortlist, in the engine's own words */
  why: string
  /** the pairing's own columns, reduced to what tells these rows
   *  apart — the rigging kit, the prop, the engine hole */
  facts: ShownFact[]
  /** what this row's own rung already contains, said as a word
   *  where a second charge would otherwise be added twice */
  contains: string
  /** the workbook cell the figure was read from */
  source: string
  act: Act
}

/* ---------------------------------------------------------- */
/* One table inside a chapter                                  */
/* ---------------------------------------------------------- */

/** A table is a heading inside a chapter, never a chapter of its
 *  own — `src/domain/quote/bands.ts` argues that at length, and the
 *  seven-band screen it was written to end is the one this replaces. */
export interface ChapterTable {
  /** the section's own block id, which is this table's identity here */
  id: string
  title: string
  kind: TableKind
  /** the narrowing, in the operator's words, with the rate the price
   *  file measures about pairings of this kind */
  reason: StepReason | null
  /** every count the counted rail prints */
  counts: StepOffer
  rows: OptionRow[]
  /** lines of this section that the list above does not carry — a
   *  row picked from outside the shortlist, or one the current
   *  search does not match. Nothing on a quote is ever invisible. */
  also: OptionRow[]
  /** the sentence for a stop with nothing to decide, from the engine */
  why: string
  /** the one reason EVERY row off this shortlist shares, said once
   *  above them instead of forty times between them. '' when the
   *  rows give different reasons, and then each keeps its own. */
  sharedWhy: string
  /** THE ROW THE PRICE FILE ITSELF RECOMMENDS, by name, so the
   *  recommendation can be a sentence above the list rather than a
   *  glyph on the row. '' where this table stars nothing, which is
   *  every dealer-fit and parts join on this file and all three GFAB
   *  trailer joins (`research/refs/configurator/notes.md` §0). */
  recommends: string
  /** what it means that this section already carries more than one
   *  line, in the engine's own words. '' for none and for one. */
  severalSay: string
  /** the whole live table is being shown, narrowing switched off */
  showingAll: boolean
  /** this table's own subtotal, or null where its lines carry no
   *  price at all. Never drawn as 0. */
  amount: number | null
}

/* ---------------------------------------------------------- */
/* A chapter                                                   */
/* ---------------------------------------------------------- */

export type ChapterKind = 'band' | 'handover' | 'finale'

export interface Chapter {
  id: string
  /** the reading order the engine fixes — '01'…'05'. '' on the two
   *  chapters that are not a kind of thing on the price file. */
  num: string
  name: string
  kind: ChapterKind
  /** where the whole decision stands, in one clause, from the engine */
  fact: string
  /** the chapter's own subtotal, or null */
  amount: number | null
  tables: ChapterTable[]
  /** the hull's other finishes — chapter 01 only */
  finishes?: Finishes
  /** how many rows this chapter has DRAWN right now, across its
   *  tables. Never more than `OFFER_CAP` per table. */
  offered: number
  /** how many rows the current search SELECTED here, drawn or not.
   *  Equal to `offered` when nothing is typed. */
  matched: number
  /** how many lines of the quote this chapter holds */
  lines: number
}

/** What the whole rail knows about itself, so the screen asks once. */
export interface Rail {
  chapters: Chapter[]
  /** a search is running */
  searching: boolean
  /** ROWS THE SEARCH SELECTED across every chapter — not the rows
   *  drawn. The first cut counted the drawn ones and then said how
   *  many of them were "beyond" the narrowing, which is a figure
   *  `stepOffer` computes over the whole selection: measured on the
   *  SP560 for "battery", the screen read "81 rows carry those words
   *  — 170 of them the shortlist was standing in front of", and 170
   *  of 81 is not a sentence anybody can believe. */
  hits: number
  /** of those, how many the narrowing had been standing in front of */
  beyond: number
  /** how many of them are actually on the screen. Lower than `hits`
   *  only where `OFFER_CAP` trimmed a chapter, and the sentence says
   *  so where it is. */
  drawn: number
  /** what the document totals now */
  total: number
  /** lines on it carrying no price at all */
  unpriced: number
  /** the rungs this quote as a whole could be set to */
  rungs: QuoteLevelChoice[]
  /** every reason it may not be given to a customer yet */
  blockers: string[]
  /** a charge one of its own price columns already contains */
  doubleCharged: string[]
}

export interface RailOptions {
  /** what was typed above the chapters. Under `SEARCH_MIN` letters
   *  it is not a search and the rail is the shortlist. */
  query?: string
  /** the block ids whose narrowing has been switched off */
  showAll?: ReadonlySet<string>
}

/* ---------------------------------------------------------- */
/* Reading one row                                             */
/* ---------------------------------------------------------- */

/** What a rung already has in it, as a word rather than a figure —
 *  the sweep's "standard is not $0.00" read onto this file, where
 *  the distinction that matters is a charge already inside a price
 *  column. '' where no cell says either way, which is never coerced
 *  to "no". */
function containsSay(line: QuoteLine): string {
  const level = line.levels.find((l) => l.key === line.levelResolved)
  if (rungIncludes(level, 'registration') === true) return 'registration included'
  if (rungIncludes(level, 'install') === true) return 'fitting included'
  if (rungIncludes(level, 'preDelivery') === true) return 'pre-delivery included'
  return ''
}

/** The pairing's own facts, minus the slot.
 *
 *  THE SLOT IS THE PAIRING'S IDENTITY AND NOT A PROPERTY OF THE
 *  GOODS. `freeze.ts` names it and says why a shelf of different
 *  motors must leave it out: on a shelf it varies for the same
 *  reason a row number varies, and "Slot 9" is jargon on a screen a
 *  customer can see. It stays on the line for the document. */
const shelfFacts = (line: QuoteLine): Array<{ label: string; value: string }> =>
  (line.pairFacts ?? []).filter((f) => f.label !== PAIR_SLOT_LABEL)

/* ---------------------------------------------------------- */
/* Reading one table                                           */
/* ---------------------------------------------------------- */

function readTable(
  ctx: CatalogueCtx,
  quote: QuoteDef,
  step: BuildStep,
  kind: TableKind,
  options: RailOptions,
): ChapterTable {
  const showingAll = options.showAll?.has(step.id) === true
  const query = (options.query ?? '').trim()
  const searching = query.length >= SEARCH_MIN
  const counts = stepOffer(ctx, quote, step.section, {
    ...(searching ? { query } : {}),
    ...(showingAll ? { all: true } : {}),
  })

  /* COMPUTED OVER THE WHOLE SHELF AT ONCE, because "does this fact
     tell these rows apart" is not a question one card can answer
     about itself. */
  const shown = distinguishingFacts(counts.candidates.map((c) => shelfFacts(c.line)))

  const labels = counts.candidates.map((c) => c.line.label)
  const rows: OptionRow[] = counts.candidates.map((candidate, i) => {
    const line = candidate.line
    const weighed = weighPick(quote, line, candidate.alreadyLineId)
    const split = splitOnSharedStem(labels, i)
    return {
      key: candidate.key,
      stem: split.stem,
      tail: split.tail,
      code: line.code ?? '',
      amount: lineAmount(line).amount,
      column: line.priceColumnName,
      delta: weighed.delta,
      would: weighed.would,
      starred: line.recommended === true,
      fitted: candidate.alreadyLineId !== undefined,
      outside: candidate.outside === true,
      why: candidate.outsideWhy ?? '',
      facts: shown[i] ?? [],
      contains: containsSay(line),
      source: line.sourceNote ?? '',
      act: candidate.alreadyLineId
        ? { do: 'remove', lineId: candidate.alreadyLineId, label: line.label }
        : { do: 'add', blockId: step.id, line },
    }
  })

  /* NOTHING ON A QUOTE IS EVER INVISIBLE. A line picked from outside
     the shortlist, or one the search in the field does not match, is
     still charging the customer — so it is drawn under the list with
     its own way off, rather than silently disappearing the moment
     somebody types. */
  const drawn = new Set(
    rows.filter((r) => r.fitted).map((r) => (r.act as { lineId: string }).lineId),
  )
  const also: OptionRow[] = step.lines
    .filter((line) => !drawn.has(line.id))
    .map((line) => ({
      key: line.id,
      stem: '',
      tail: line.label,
      code: line.code ?? '',
      amount: lineAmount(line).amount,
      column: line.priceColumnName,
      delta: weighPick(quote, line, line.id).delta,
      would: weighPick(quote, line, line.id).would,
      starred: line.recommended === true,
      fitted: true,
      outside: false,
      why: '',
      facts: shelfFacts(line).map((f) => ({ ...f, full: f.value, reduced: false })),
      contains: containsSay(line),
      source: line.sourceNote ?? '',
      act: { do: 'remove', lineId: line.id, label: line.label },
    }))

  /* ONE REASON SAID ONCE, MANY REASONS SAID ON THE ROW.
     MEASURED on the SP560 at 1440x900: searching "battery" reached
     78 rows of `Dealer Fit Packages`, and every one of them carried
     the same 121-character sentence — "Highfield × Dealer Fit does
     not pair it with Highfield - SP560 (PVC) W-W-WB…" — so forty
     identical paragraphs were drawn between forty rows, and the
     sentence a person needed to read once became the largest thing
     in the chapter.

     It is the curated case, and the reason is a fact about the LIST
     rather than about any row in it: the price file never wrote the
     pairing down. Where a measured rule is doing the rejecting each
     row has its own figures on both sides of its own clause, they
     differ, and rule 10 puts each one on the row it is about. So the
     test is mechanical — identical text on every row off the
     shortlist — and nothing is ever dropped: it is either up there
     once or down here on each. */
  const off = rows.filter((r) => r.outside && r.why !== '')
  const firstWhy = off[0]?.why ?? ''
  const shared = off.length > 1 && off.every((r) => r.why === firstWhy) ? firstWhy : ''
  if (shared !== '') for (const row of rows) if (row.outside) row.why = ''

  /* THE FILE'S OWN PICK, NAMED RATHER THAN STARRED. §4 of the sweep
     counted what the best references do with a recommendation:
     Saxdor pre-answers the chapter and offers a door out, Apple says
     it in words, Porsche names the answer in text above the row —
     "None uses a star, a ribbon or a colour." The substance was
     already right here, because `mintQuote` brings the starred motor
     and the starred trailer across at mint; the glyph was the one
     treatment every reference was measured as avoiding. */
  const recommended = counts.candidates.find((c) => c.line.recommended === true)

  return {
    id: step.id,
    title: step.title,
    kind,
    reason: stepReason(ctx, quote, step.section),
    counts,
    rows,
    also,
    why: step.why,
    sharedWhy: shared,
    recommends: recommended?.line.label ?? '',
    severalSay: severalOnStepSentence(step) ?? '',
    showingAll,
    amount: step.amount,
  }
}

/* ---------------------------------------------------------- */
/* The whole rail                                              */
/* ---------------------------------------------------------- */

/**
 * Every chapter of one quote, in the engine's own fixed order, with
 * the two the price file cannot carry after them.
 *
 * WHY THE LAST TWO HAVE NO NUMBER. `bands.ts` numbers the five
 * decisions 01–05 and states that the numbers are a READING ORDER
 * and never a count, so that "03" means TRAILER on every document
 * whatever tables a business happens to hold. "Who it is for" and
 * the finale are not kinds of thing on a price file, and giving them
 * 06 and 07 would make the number mean two different things in one
 * column. They carry their names.
 */
export function readRail(ctx: CatalogueCtx, quote: QuoteDef, options: RailOptions = {}): Rail {
  const steps = buildSteps(quote)
  const bands = orderBands(steps, sectionKinds(ctx, quote))
  const query = (options.query ?? '').trim()
  const searching = query.length >= SEARCH_MIN

  const chapters: Chapter[] = bands.map((band) => {
    const tables = band.tables.map((t) => readTable(ctx, quote, t.step, t.kind, options))
    const chapter: Chapter = {
      id: band.id,
      num: band.num,
      name: band.name,
      kind: 'band',
      fact: band.fact,
      amount: band.amount,
      tables,
      offered: tables.reduce((n, t) => n + t.rows.length, 0),
      matched: tables.reduce((n, t) => n + (searching ? t.counts.matched : t.rows.length), 0),
      lines: band.tables.reduce((n, t) => n + t.step.lines.length, 0),
    }
    /* CHAPTER 01 IS THE ONE THE ENGINE CALLS UNDECIDABLE, and on
       this screen it is a decision: the quote is rooted on one row
       of a model that may be sixteen. `finishes.ts` says the rest. */
    if (band.id === 'hull') chapter.finishes = readFinishes(ctx, quote)
    return chapter
  })

  chapters.push({
    id: 'handover',
    num: '',
    name: HANDOVER_TITLE,
    kind: 'handover',
    fact:
      quote.customer.name.trim() === '' ? 'nobody named yet' : `for ${quote.customer.name.trim()}`,
    amount: null,
    tables: [],
    offered: 0,
    matched: 0,
    lines: 0,
  })

  const totals = quoteTotals(quote)
  chapters.push({
    id: 'finale',
    num: '',
    name: 'The finale',
    kind: 'finale',
    fact:
      quote.state === 'draft'
        ? `${quote.lines.length} ${quote.lines.length === 1 ? 'line' : 'lines'}, still a draft`
        : 'given to the customer',
    amount: totals.total,
    tables: [],
    offered: 0,
    matched: 0,
    lines: quote.lines.length,
  })

  /* THE HULL'S FINISHES ARE ROWS OF THE ROOT TABLE and are searched
     here rather than in `readTable`, because a finish is not a
     candidate: `stepOffer` has nothing to say about the table a
     quote is rooted on. */
  const hull = chapters.find((c) => c.finishes)
  if (hull?.finishes) {
    const found = searching
      ? hull.finishes.rows.filter((f) => matchesFinish(f.label, query)).length
      : hull.finishes.rows.length
    hull.offered += found
    hull.matched += found
  }

  let hits = 0
  let beyond = 0
  let drawn = 0
  for (const chapter of chapters) {
    hits += chapter.matched
    drawn += chapter.offered
    for (const table of chapter.tables) beyond += table.counts.beyond
  }

  /* THE THREE CHARGES A PRICE COLUMN CAN ALREADY CONTAIN, asked of
     the lines that are really on the document. It is evidence and
     never a refusal: a person may legitimately add a transfer fee to
     a quote whose trailer is priced at a rung that has registration
     in it, and this app does not invent the dealer's pricing policy. */
  const doubleCharged: string[] = []
  for (const charge of ['registration', 'install', 'preDelivery'] as const) {
    const said = chargeAlreadyInSentence(chargeAlreadyIn(quote.lines, charge), charge)
    if (said) doubleCharged.push(said)
  }

  return {
    chapters,
    searching,
    hits,
    beyond,
    drawn,
    total: totals.total,
    unpriced: totals.unpricedCount,
    rungs: quoteLevelChoices(quote.lines),
    blockers: issueBlockers(quote),
    doubleCharged,
  }
}

/** Every typed word somewhere in a finish's own label — the same
 *  word-by-word test `stepOffer` runs over a row, kept here because
 *  a finish is a row of the ROOT table and never a candidate. */
export function matchesFinish(label: string, query: string): boolean {
  const hay = label.toLowerCase()
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w !== '')
    .every((word) => hay.includes(word))
}

/** The cap the shortlist is trimmed at, re-exported so the screen
 *  can say the number rather than carry its own copy of it. */
export { OFFER_CAP }
