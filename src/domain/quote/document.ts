/* ============================================================
   THE DOCUMENT, READ OFF THE DOCUMENT.

   WHAT THIS FILE IS. `/quote/$id/document` draws an issued quote on
   screen and on A4 from ONE DOM. Everything it prints is a reading of
   a frozen `QuoteDef` and nothing else: no `CatalogueCtx` comes in,
   because a document that could see the sheet is a document whose
   figures can move between Monday and Friday. `invariants.test.ts`
   asserts that promise on the engine; this file is the part of it a
   SCREEN could otherwise break, so the derivation lives here where it
   can be tested without a renderer (CLAUDE.md: "a derivation is a pure
   function in src/domain").

   ── THE THREE WORDS, WHICH ARE THREE DIFFERENT FACTS ──────────

   `docs/research/refs/document/notes.md` §2, "Standard is not $0.00":
   Porsche keeps three states in one right-aligned column — a figure,
   `Standard Equipment`, and a chip on the row it qualifies — and the
   fourth, a section nobody entered, is GOV.UK's written 'Not
   provided'. Ours are these, and the whole reason they are constants
   in one file is that the table, the section foot and the legend must
   not phrase them three ways:

     INCLUDED    the price file states a charge of NOTHING for this
                 line at the rung this quote is on. It is on the boat
                 and there is nothing further to pay for it. A frozen
                 `unitPrice` of 0 — a decided zero, never a blank.
     OPTIONAL    a row this register OFFERED and nobody put on the
                 quote. It is not on the boat and it is not in the
                 total; it is counted from `pickedCount`, which
                 `mintQuoteFromView` froze onto the section, so the
                 count still reads true if the page is re-curated
                 afterwards. It is a fact about a SECTION and never
                 about a line: every line on a frozen document is
                 either charged or included, by construction.
     NOT PRICED  the file carries no figure for this row at this rung
                 — `unitPrice: null`, which `model/quote.ts` declares
                 as "a REAL state: 'not priced here'. Never rendered
                 as 0." It is on the boat and the document cannot say
                 what it costs, which is worth printing precisely
                 because a silent $0 is the fault the whole freeze was
                 written against (`showZeros="0"` on the workbook's
                 own quote sheet).

   THEY READ AS THREE IN GREYSCALE. The sweep measured the same
   `Basic equipment` chip at rgb(89,163,83) on Porsche's screen and
   rgb(183,183,186) in the PDF of that identical configuration — green
   means included, grey means inert, and the print threw the meaning
   away. So each state carries a WORD; a hue may follow it, and never
   the other way round.

   ── THE ORDER IS THE BUILD'S OWN ─────────────────────────────

   `orderBands` gives the fixed reading order — 01 The hull, 02 Motor,
   03 Trailer, 04 Dealer fit, 05 Administration — and it takes the
   kinds as an argument. The configurator hands it `sectionKinds`,
   which reads the sheet. THIS file hands it the kinds the quote
   FROZE onto its own chapters (`QuoteChapter.kind`, written by
   `chaptersOf` at mint), so the document and the build read in one
   order and the document still reads it with the sheet gone.

   PURE. No React, no store, no DOM, no clock.
   ============================================================ */

import type {
  FrozenCustomer,
  ImageRef,
  QuoteAdjustment,
  QuoteDef,
  QuoteLine,
  RungCharge,
  TableKind,
} from '@/domain/model'
import { orderBands, type BandId } from './bands'
import { buildSteps, type BuildStep } from './steps'
import { chargeAlreadyIn, quoteLevelChoices } from './pricing'
import { lineAmount, looseLines, quoteTotals, type QuoteTotals } from './totals'

/* ---------------------------------------------------------- */
/* The three words                                            */
/* ---------------------------------------------------------- */

/** A line the file prices at nothing. Never `$0`. */
export const INCLUDED = 'Included'

/** A row the register offered and nobody took. Never a line. */
export const OPTIONAL = 'Optional'

/** A line the file carries no figure for at this rung. Never `$0`. */
export const NOT_PRICED_HERE = 'Not priced at this level'

/** The legend the document prints, so a reader is never left to infer
 *  which of the three a blank meant. One place, so the table cell and
 *  the explanation cannot drift. */
export const HOW_TO_READ: ReadonlyArray<{ word: string; means: string }> = [
  {
    word: INCLUDED,
    means:
      'The price file states a charge of nothing for this line at the level below. It is on the boat and there is nothing further to pay for it.',
  },
  {
    /* THE COUNT'S OWN PROVENANCE IS NOT IN THIS SENTENCE, and was
       until 2026-09-18: "The count is the one frozen when the quote
       was raised" is a fact about how this app freezes a register, and
       a customer reading a glossary on their own quotation has no use
       for it. It is said on the screen instead, in the dealer's note
       beside the sheet, with the census it belongs to. */
    word: OPTIONAL,
    means:
      'Offered with this boat and not on this quote. It is not on the boat and it is not in the total.',
  },
  {
    word: NOT_PRICED_HERE,
    means:
      'It is on the boat, and the price file carries no figure for it at the level below — either that cell is blank or the register it came from has no price column at all, and the line says which. It is counted out of the total rather than added as nothing.',
  },
]

/* ---------------------------------------------------------- */
/* One line                                                   */
/* ---------------------------------------------------------- */

/** Which of the three the money column prints. */
export type LineState = 'charged' | 'included' | 'unpriced'

export interface DocumentLine {
  id: string
  /** the name on the quote, frozen */
  label: string
  /** the dealer's own code for it, absent where the table has none */
  code: string | null
  qty: number
  state: LineState
  /** the figure charged, null when there is none to charge */
  unit: number | null
  amount: number | null
  /** a price somebody typed, with the frozen one beside it */
  overridden: boolean
  frozenUnit: number | null
  overrideReason: string | null
  /** the rung this line was actually priced at, in the dealer's word */
  rung: string | null
  /** true when the quote asked for a rung this table has no column
   *  for, so the line was priced at the table's first one instead */
  offRung: boolean
  /** the join's own facts — the rigging kit, the prop, the slot */
  facts: ReadonlyArray<{ label: string; value: string }>
  /** the charges this line's own price column already contains, in
   *  the business's nouns. Evidence, never a refusal. */
  contains: readonly string[]
  /**
   * THE MONEY COLUMN'S OWN WORDS, and it is EXACTLY one of three
   * things: '' where a figure is printed, `Included`, or `Not priced
   * at this level`. Nothing else ever lands in that column, which is
   * what makes three states read as three down a page of rows rather
   * than as a paragraph in a cell.
   */
  say: string
  /**
   * WHY, where the word alone would leave a question. It goes UNDER
   * THE NAME with the rest of a line's provenance — the rigging kit,
   * the prop, the arithmetic of a quantity — which is where
   * `live/stripe-billing` puts a derivation and where this document
   * puts every other fact about where a figure came from.
   *
   * The first cut printed it in the money column after the words, and
   * `Not priced at this level — the register carries no price column`
   * wrapped to three lines in a 16-character column, so one row stood
   * three times the height of its neighbours and the column stopped
   * reading as a column. '' when there is nothing to add.
   */
  why: string
}

/** The three charges a rung can already contain, asked one at a time
 *  because `chargeAlreadyIn` answers about a whole quote. */
const CHARGES: readonly RungCharge[] = ['registration', 'install', 'preDelivery']

/** What one charge is called under a line. The nouns are the ones
 *  `CHARGE_TITLE` publishes; they are spelled here in the sentence
 *  case a line note is set in rather than re-cased at the surface. */
const CONTAINS_SAY: Record<RungCharge, string> = {
  registration: 'registration',
  install: 'the labour to fit it',
  preDelivery: 'pre-delivery',
}

function readLine(line: QuoteLine): DocumentLine {
  const { unit, amount, overridden } = lineAmount(line)
  const level = line.levels.find((l) => l.key === line.levelResolved)
  const rung = level?.label ?? line.priceColumnName
  const state: LineState = amount === null ? 'unpriced' : amount === 0 ? 'included' : 'charged'

  const contains: string[] = []
  for (const charge of CHARGES) {
    if (chargeAlreadyIn([line], charge).length > 0) contains.push(CONTAINS_SAY[charge])
  }

  return {
    id: line.id,
    label: line.label,
    code: line.code && line.code.trim() !== '' ? line.code : null,
    qty: Number.isFinite(line.qty) && line.qty > 0 ? line.qty : 1,
    state,
    unit,
    amount,
    overridden,
    frozenUnit: line.unitPrice,
    overrideReason:
      line.overrideReason && line.overrideReason.trim() !== '' ? line.overrideReason.trim() : null,
    rung: rung ?? null,
    offRung: line.levelKey !== line.levelResolved,
    facts: line.pairFacts ?? [],
    contains,
    say: state === 'included' ? INCLUDED : state === 'unpriced' ? NOT_PRICED_HERE : '',
    /* TWO WAYS TO CARRY NO FIGURE, AND THEY ARE ONE STATE. The
       register has the rung and this row's cell was blank, or the
       register carries no price column at all — which is true of real
       tables on this file. Both are "not priced here"; only the reason
       differs, so only the reason is said here. */
    why:
      state === 'unpriced'
        ? rung
          ? `the price file carries no figure for it at ${rung}`
          : 'this register carries no price column at all'
        : state === 'included' && rung
          ? `${rung} states a charge of nothing for it`
          : '',
  }
}

/* ---------------------------------------------------------- */
/* One register inside a section                              */
/* ---------------------------------------------------------- */

export interface DocumentTable {
  /** the section's own block id */
  id: string
  /** the register, as the dealer named it */
  title: string
  kind: TableKind
  /** the hull the whole document is about, which offers nothing */
  subject: boolean
  lines: DocumentLine[]
  /** the sum of the lines that carry a figure, null when none does */
  subtotal: number | null
  /** lines carrying no price at all */
  unpriced: number
  /** lines the file prices at nothing */
  included: number
  /**
   * Rows this register offered and nobody took — `pickedCount` minus
   * what landed. `null` on a document raised before the counts
   * existed, which is a "cannot tell" and never a zero.
   */
  optional: number | null
  /** rows held back as no longer sold, frozen at mint */
  held: number
  /** the sentence a register with nothing on it prints. '' otherwise */
  say: string
  /**
   * WHAT THE DEALER DOES ABOUT AN EMPTY REGISTER — `BuildStep.andThen`,
   * carried here so the SCREEN can offer it beside the sheet and the
   * PAPER does not print it. Until 2026-09-18 `say` was one sentence
   * with the instruction welded on, and a customer's A4 read "pair it
   * on the subject's own page and it shows here". '' when there is
   * nothing to do about it.
   */
  next: string
}

function readTable(step: BuildStep, kind: TableKind): DocumentTable {
  const lines = step.lines.map(readLine)
  const picked = step.section.pickedCount
  return {
    id: step.id,
    title: step.title,
    kind,
    subject: step.subject,
    lines,
    subtotal: step.amount,
    unpriced: step.unpriced,
    included: lines.filter((l) => l.state === 'included').length,
    /* THE SUBJECT OFFERS NOTHING AND WITHHOLDS NOTHING. It is the
       thing being configured; `pickedCount` is undefined on it by
       construction, and reading that as "cannot tell" would print a
       question mark over a hull that is plainly on the document. */
    optional: step.subject ? 0 : picked === undefined ? null : Math.max(0, picked - lines.length),
    held: step.subject ? 0 : (step.section.heldCount ?? 0),
    say: lines.length > 0 ? '' : step.why,
    next: lines.length > 0 ? '' : step.andThen,
  }
}

/* ---------------------------------------------------------- */
/* One section of the document                                */
/* ---------------------------------------------------------- */

export interface DocumentSection {
  id: BandId
  /** the reading order, printed. Never a count — `bands.ts` argues it */
  num: string
  name: string
  kind: TableKind
  tables: DocumentTable[]
  /** the sum of every register in it, null when none carries a figure */
  subtotal: number | null
  /** how many lines it puts on the quote */
  lines: number
  /** rows offered and not taken, across the section. null = cannot tell */
  optional: number | null
  /** true when the section holds more than one register, so each one's
   *  own name is printed as a sub-head. `bands.ts`: a heading is drawn
   *  "only where a place really spans more than one table". */
  named: boolean
}

/* ---------------------------------------------------------- */
/* The whole printed document                                 */
/* ---------------------------------------------------------- */

export interface PrintedRung {
  key: string
  /** the business's own word for it, from a line that carries it */
  label: string
  /** how many lines carry this rung */
  carriedBy: number
  /** out of how many lines */
  of: number
}

export interface PrintedQuote {
  reference: string
  issued: boolean
  issuedAt: string | null
  /** whose letterhead — frozen at mint from the organisation's name */
  business: string | null
  preparedBy: string | null
  customer: FrozenCustomer
  subject: {
    label: string
    specs: ReadonlyArray<{ label: string; value: string }>
    image?: ImageRef
  }
  sections: DocumentSection[]
  /** lines belonging to no register — typed on the quote itself.
   *  Drawn last and never dropped: they still charge the customer. */
  typed: DocumentLine[]
  adjustments: readonly QuoteAdjustment[]
  totals: QuoteTotals
  /** the rung the whole document is on, or null when no line carries
   *  a quote-wide one */
  rung: PrintedRung | null
  /** the dealer's standing terms, frozen at mint. null where the
   *  organisation had none — the document says so rather than
   *  inventing a sentence. */
  terms: string | null
  supersedesId: string | null
  /** lines carrying no price at all, across the whole document */
  unpriced: number
  /** lines the file prices at nothing */
  included: number
  /** rows offered and not taken. null when no section can say */
  optional: number | null
}

/**
 * The document, read for printing. One argument, and it is the frozen
 * quote: everything below is arithmetic on what is already written
 * down.
 */
export function readDocument(quote: QuoteDef): PrintedQuote {
  const steps = buildSteps(quote)
  const bands = orderBands(steps, kindsFrom(quote))

  const sections: DocumentSection[] = bands.map((band) => {
    const tables = band.tables.map((t) => readTable(t.step, t.kind))
    let optional: number | null = null
    for (const table of tables) {
      if (table.optional === null) continue
      optional = (optional ?? 0) + table.optional
    }
    return {
      id: band.id,
      num: band.num,
      name: band.name,
      kind: band.kind,
      tables,
      subtotal: band.amount,
      lines: tables.reduce((n, t) => n + t.lines.length, 0),
      optional,
      named: tables.length > 1,
    }
  })

  let optional: number | null = null
  for (const section of sections) {
    if (section.optional === null) continue
    optional = (optional ?? 0) + section.optional
  }

  const typed = looseLines(quote).map(readLine)
  const onDocument = [...sections.flatMap((s) => s.tables.flatMap((t) => t.lines)), ...typed]

  return {
    reference: quote.reference,
    issued: quote.state !== 'draft',
    issuedAt: quote.issuedAt ?? null,
    business: said(quote.organisation),
    preparedBy: said(quote.preparedBy),
    customer: quote.customer,
    subject: {
      label: quote.subjectLabel,
      specs: quote.subjectSpecs,
      ...(quote.subjectImage ? { image: quote.subjectImage } : {}),
    },
    sections,
    typed,
    adjustments: quote.adjustments,
    totals: quoteTotals(quote),
    rung: rungOf(quote),
    terms: said(quote.note),
    supersedesId: quote.supersedesId ?? null,
    unpriced: onDocument.filter((l) => l.state === 'unpriced').length,
    included: onDocument.filter((l) => l.state === 'included').length,
    optional,
  }
}

/** A word somebody typed, or null. '' and '   ' are both "nobody said
 *  anything", and a document prints the absence rather than a blank
 *  where a name belongs. */
const said = (value: string | undefined): string | null =>
  value !== undefined && value.trim() !== '' ? value.trim() : null

/**
 * The kinds, off the quote's OWN chapters rather than off the sheet.
 *
 * `chaptersOf` froze `EntityDef.kind` onto every chapter at mint for
 * exactly this reason — so a band head can have its hue without a
 * live read. A quote raised before chapters existed has none, and
 * every section then falls to `custom`, which lands in
 * `05 Administration` and colours neutral: the order survives, and
 * nothing is invented to rescue it.
 */
export function kindsFrom(quote: QuoteDef): Record<string, TableKind> {
  const out: Record<string, TableKind> = {}
  for (const chapter of quote.chapters) {
    if (chapter.kind) out[chapter.id] = chapter.kind
  }
  return out
}

/**
 * Which rung this document is on, with the dealer's own word for it.
 *
 * `quoteLevelChoices` reads the LINES and not the tables, which is
 * what makes it answerable with the sheet gone. A quote whose lines
 * carry no quote-wide rung at all — every one of them priced at a
 * table with a single column — answers null, and the document says
 * the level is the one each register carries rather than printing a
 * key nobody uses out loud.
 */
function rungOf(quote: QuoteDef): PrintedRung | null {
  const choice = quoteLevelChoices(quote.lines).find((c) => c.key === quote.levelKey)
  if (!choice) return null
  return {
    key: choice.key,
    label: choice.label,
    carriedBy: choice.carriedBy,
    of: quote.lines.length,
  }
}
