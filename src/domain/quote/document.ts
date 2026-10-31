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
   in one file is that the table, the section foot and the dealer's
   note must not phrase them three ways:

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

   THERE IS NO LEGEND. `HOW_TO_READ` defined the three words "at the
   level below" for a buyer, and the paper stopped printing it on
   2026-09-23; its third meaning also said a register "has no price
   column at all", which was false of the two tables it was said of
   (below). It is gone rather than kept unread (2026-09-25): the paper's
   money column says its own words, and why a line reads as it does is
   said per line on the dealer's note beside the sheet.

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
  FrozenLetterhead,
  FrozenPreparer,
  FrozenCustomer,
  ImageRef,
  PaperSection,
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
import { boatOfQuote, lineSaid, measured, nameFirst, saidOnQuote } from './spoken'
import { boatTitle } from './title'
import { levelWord, lineLevelSaid } from './levelSaid'
import type { Colourway } from './colourway'
import { accentOnQuote } from '@/domain/northside/letterhead'
import { PAPER_SECTIONS, SUBJECT_CHAPTER } from '@/domain/model'
import { quietCaps } from './specSay'
import { factSheet, keyFacts, specSheet, type SpecGroup } from './specSheet'
import { nameOnPaper, paperFacts, trailerOnPaper, type PaperFact } from './paperWords'

/* ---------------------------------------------------------- */
/* The three words                                            */
/* ---------------------------------------------------------- */

/** A line the file prices at nothing. Never `$0`. */
export const INCLUDED = 'Included'

/** A row the register offered and nobody took. Never a line. */
export const OPTIONAL = 'Optional'

/** A line the file carries no figure for at this rung. Never `$0`. */
export const NOT_PRICED_HERE = 'Not priced at this level'

/** WHY A LINE FROM A TABLE THAT DECLARES NO PRICE LEVEL HAS NO FIGURE,
 *  with the table's own name. It said "this register carries no price
 *  column at all" until 2026-09-25, and that was false of the tables it
 *  was said of: Rigging Kits carries Kit Sell Price, Sell Price and
 *  Install Retail Sell, and Dealer Fit Packages Act Sell and Sell — the
 *  file prices them, and neither declares a price level
 *  (`data/northside/manifest.json`, `priceLevels: []` for `rig_kits` and
 *  `dealer_fit`), so no quote can read a figure off them. */
export const noLevelDeclared = (table: string): string => `no price level is declared for ${table}`

/** Why a line a person typed onto the quote has no figure. */
export const NO_PRICE_TYPED = 'no price was typed for it'

/* ---------------------------------------------------------- */
/* One line                                                   */
/* ---------------------------------------------------------- */

/** Which of the three the money column prints. */
export type LineState = 'charged' | 'included' | 'unpriced'

export interface DocumentLine {
  id: string
  /** the name on the quote, frozen */
  label: string
  /** WHAT THE PAPER PRINTS FOR IT, as a person says it: the hull as
   *  the cover heads it, `boatTitle`'s ("Highfield ADV7 · Hypalon ·
   *  Black / Grey / Black", "Stacer 529 Assault Pro (Tournament)"), and
   *  every other line as `lineSaid` says it ("Yamaha
   *  F250XCB", "REDCO Custom / Highfield ADV7 Aluminium · TA700T-EH") —
   *  the file's own words, joined as a person says them, never a guess */
  said: string
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
  /** the rung this line was actually priced at, in the dealer's word:
   *  the level's declared name (`Cash`), never the list's own column
   *  (`Sell Price`) — m2-last-critique.md, major 5 */
  rung: string | null
  /** true when the quote asked for a rung this table has no column
   *  for, so the line was priced at the table's first one instead */
  offRung: boolean
  /** the join's own facts — the rigging kit, the prop, the slot */
  facts: ReadonlyArray<{ label: string; value: string }>
  /** THE ITEM'S OWN FACTS, as a customer reads them — "Power 90 hp", "Rated to (ATM) 1,500 kg" —
   *  frozen onto the line at the pick (`lineFacts.ts`); empty on a line that froze none */
  own: ReadonlyArray<{ label: string; value: string }>
  /** THE ITEM'S OWN FACTS THE PAPER LEAVES OFF — a value that is no fact ("Opt") or a shorthand no
   *  rule reads (`paperWords.ts`) — named to the dealer on the note beside the sheet */
  unsaid: readonly PaperFact[]
  /** WHICH ROW IT IS, for the picture reader: the line's own register and row and the picture
   *  address the file gave it. Ids are kept for exactly this kind of lookup ("open this row");
   *  nothing drawn or totalled reads them. Null on a line a person typed. */
  item: { table: string; row: string; address?: string } | null
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

/** One frozen line. `table` is the name of the table it was picked
 *  from, as the quote froze it; undefined for a line typed on the quote. */
function readLine(line: QuoteLine, said?: string, table?: string): DocumentLine {
  const facts = paperFacts(line.facts ?? [])
  const { unit, amount, overridden } = lineAmount(line)
  const level = line.levels.find((l) => l.key === line.levelResolved)
  const rung = level ? levelWord(level.key, level.label) : lineLevelSaid(line) || null
  const state: LineState = amount === null ? 'unpriced' : amount === 0 ? 'included' : 'charged'

  const contains: string[] = []
  for (const charge of CHARGES) {
    if (chargeAlreadyIn([line], charge).length > 0) contains.push(CONTAINS_SAY[charge])
  }

  return {
    id: line.id,
    label: line.label,
    said: said ?? lineSaid(line.label),
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
    own: facts.printed,
    unsaid: facts.left,
    item:
      line.entityId === '' || line.rowId === ''
        ? null
        : {
            table: line.entityId,
            row: line.rowId,
            ...(line.image?.src ? { address: line.image.src } : {}),
          },
    contains,
    say: state === 'included' ? INCLUDED : state === 'unpriced' ? NOT_PRICED_HERE : '',
    /* TWO WAYS TO CARRY NO FIGURE, AND THEY ARE ONE STATE. The table
       has the rung and this row's cell was blank, or the table declares
       no price level at all — which is true of Rigging Kits and Dealer
       Fit Packages on this file, though both carry sell columns. Both
       are "not priced here"; only the reason differs, so only the
       reason is said here. */
    why:
      state === 'unpriced'
        ? rung
          ? `the price file carries no figure for it at ${rung}`
          : table === undefined
            ? NO_PRICE_TYPED
            : noLevelDeclared(table)
        : state === 'included' && rung
          ? `${rung} states a charge of nothing for it`
          : '',
  }
}

/** A registered item's name as the paper prints it (`paperWords.ts`). */
function itemSaid(line: QuoteLine, said: string, kind: TableKind): string {
  const named = nameOnPaper(said)
  if (kind !== 'trailer') return named
  return trailerOnPaper(
    named,
    (line.facts ?? []).some((fact) => /boats of/i.test(fact.label)),
  )
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

function readTable(step: BuildStep, kind: TableKind, hull: string): DocumentTable {
  /* the hull's own line is the boat, said as the paper's cover says it;
     every other line as a person says it, its register saying which
     word is the maker — "Yamaha F250XCB" (m2-last-critique.md, major 4) */
  const lines = step.lines.map((line) =>
    readLine(
      line,
      /* and without the code nobody says aloud (`nameFirst`, minor 15): the paper printed the
         trailer as "TA1400S13SB · T Alloy 1400 …"; its code stays in the dealer's note. The file's
         shorthand in a name is said in full ("w" is "with", "2mtr" is "2 m"), and a trailer the
         file codes is said as a person says it, its rating and size left to its facts
         (`paperWords.ts`) */
      step.subject
        ? hull
        : itemSaid(line, nameFirst(lineSaid(line.label, step.title), line.code ?? undefined), kind),
      step.title,
    ),
  )
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
  /** NORTHSIDE'S LETTERHEAD, as the quote was given with it (Milestone 4); null on a quote given
   *  before /manage existed. A draft's screen lays today's over it before reading. */
  letterhead: FrozenLetterhead | null
  /** THE COLOUR ITS PAPER IS PINNED TO, as `#rrggbb`: the brand colour it was given in (or the
   *  designed blue), so a colour chosen later never repaints it. Null on a draft, which wears
   *  today's like the rest of the app. */
  accent: string | null
  /** who prepared it, with how to reach them, as it was given; null where only a name is known */
  preparer: FrozenPreparer | null
  customer: FrozenCustomer
  subject: {
    /** the price file's own string for the boat, verbatim — the
     *  dealer's, for the note beside the paper, and never printed on it */
    label: string
    /** the boat as a person says it, read off that string by
     *  `spokenBoat`: "Highfield ADV7" */
    name: string
    /** its material and colour in words — "Hypalon · Black / Grey /
     *  Black"; '' when the file names neither */
    detail: string
    /** the colourway, for a swatch the paper may draw; null when none */
    colour: Colourway | null
    /** THE EXACT MODEL AS THE PAPER HEADS IT (`boatTitle`): the name,
     *  with a bracket that names which model it is kept in its brackets
     *  — "Stacer 529 Assault Pro (Tournament)" */
    title: string
    /** its material and colourway in words, set under the title —
     *  "Hypalon · Black / Grey / Black"; '' when the file names neither */
    finish: string
    /** the frozen specifications the customer's paper prints, each with
     *  the unit the file's column or the maker states (`measured`) —
     *  "OA Length 6.98 m" — or a whole count ("Cabins 2") */
    specs: ReadonlyArray<{ label: string; value: string }>
    /** THE MEASURES LEFT OFF THE PAPER: a figure with a decimal point
     *  whose unit neither the file's column nor the maker states —
     *  Jeanneau's "Draft 0.45", Stabicraft's "Int. Beam 1.35". A measure
     *  with no unit is half a fact, and a unit supplied here would be a
     *  figure invented, so the customer is handed neither; the dealer's
     *  note beside the sheet says each one and why. */
    unitless: ReadonlyArray<{ label: string; value: string }>
    image?: ImageRef
    /** WHAT KIND OF THING IS SOLD — the subject's own chapter kind: `boat`, or a motor, a
     *  trailer, a part on a quote that is not for a boat. Null where the quote froze no kind. */
    kind: TableKind | null
    /** the series it is filed under, in a name's case (`quietCaps`); '' where none */
    series: string
    /** EVERY SPECIFICATION THE FILE HOLDS FOR IT, said and grouped for the specification page
     *  (`specSheet`) — the frozen full list where the quote carries one, else the five */
    sheet: SpecGroup[]
    /** the four the cover sets large (`keyFacts`) */
    key: ReadonlyArray<{ label: string; value: string }>
    /** THE FACTS THE PAPER LEAVES OFF — "Fuel capacity Opt", a shorthand no rule reads — named to
     *  the dealer on the note beside the sheet, never printed (`paperWords.ts`) */
    unsaid: readonly PaperFact[]
  }
  /** THE OPTIONAL SECTIONS, AS CHOSEN (quote-spec §7a): true = printed. Read off the quote, so
   *  a given quote prints what was chosen before it was given. */
  chosen: Record<PaperSection, boolean>
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
  const boat = boatOfQuote(quote)
  const titled = boatTitle(quote.rootTableId, quote.subjectLabel)
  const specs = quote.subjectSpecs.map((spec) => measured(quote.rootTableId, spec))
  const every = (quote.subjectSpecsAll ?? quote.subjectSpecs).map((spec) =>
    measured(quote.rootTableId, spec),
  )
  const kinds = kindsFrom(quote)
  /* A QUOTE THAT IS NOT FOR A BOAT IS SPECIFIED BY ITS ITEM'S OWN FACTS: a repower's motor reads
     "Power 115 hp", never the file's "HP Rating 115" and "Prop Opt" */
  const subjectKind = kinds[SUBJECT_CHAPTER] ?? null
  const subjectLine = quote.lines.find((l) =>
    quote.sections.find((s) => s.blockId === SUBJECT_CHAPTER)?.lineIds.includes(l.id),
  )
  const itemSpecified =
    subjectKind !== null && subjectKind !== 'boat' && (subjectLine?.facts?.length ?? 0) > 0
  /* THE FILE'S WORDS SAID IN FULL, OR LEFT OFF (`paperWords.ts`): "Shaft length XL" is "Extra
     long", "Fuel capacity Opt" is no fact and is named to the dealer instead */
  const itemFacts = paperFacts(subjectLine?.facts ?? [])
  const grouped = itemSpecified
    ? factSheet(itemFacts.printed)
    : specSheet(every.filter((spec) => !unitlessMeasure(spec.value)))
  const unsaid: PaperFact[] = itemSpecified ? itemFacts.left : []
  const cleaned = grouped.flatMap((group) => {
    /* an item's own facts are said once, above; a boat's specification is said here */
    if (itemSpecified) return [group]
    const facts = paperFacts(group.rows)
    unsaid.push(...facts.left)
    return facts.printed.length > 0 ? [{ ...group, rows: facts.printed }] : []
  })
  const sheet = sheetOnPaper(cleaned)
  const off = quote.paperOff ?? []

  const sections: DocumentSection[] = bands.map((band) => {
    /* the hull's own line is said as the paper's cover heads it: the
       exact model, then its finish */
    const tables = band.tables.map((t) => readTable(t.step, t.kind, titled.say))
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

  /* a line a person typed is printed in their own words, as typed */
  const typed = looseLines(quote).map((line) => readLine(line, saidOnQuote(quote, line)))
  const onDocument = [...sections.flatMap((s) => s.tables.flatMap((t) => t.lines)), ...typed]

  return {
    reference: quote.reference,
    issued: quote.state !== 'draft',
    issuedAt: quote.issuedAt ?? null,
    business: said(quote.organisation),
    preparedBy: said(quote.preparedBy),
    letterhead: quote.letterhead ?? null,
    accent: accentOnQuote(quote),
    preparer: quote.preparer ?? null,
    customer: quote.customer,
    subject: {
      label: quote.subjectLabel,
      name: boat.name,
      detail: boat.detail,
      colour: boat.colour,
      title: titled.title,
      finish: titled.finish,
      specs: specs.filter((spec) => !unitlessMeasure(spec.value)),
      unitless: specs.filter((spec) => unitlessMeasure(spec.value)),
      ...(quote.subjectImage ? { image: quote.subjectImage } : {}),
      kind: subjectKind,
      series: quote.subjectSeries ? quietCaps(quote.subjectSeries) : '',
      sheet,
      key: itemSpecified ? itemFacts.printed.slice(0, 4) : keyFacts(cleaned),
      unsaid,
    },
    chosen: Object.fromEntries(PAPER_SECTIONS.map((s) => [s, !off.includes(s)])) as Record<
      PaperSection,
      boolean
    >,
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

/** Said to the dealer where nothing on the printed quote lets the customer reach Northside. */
export const NO_WAY_TO_REACH =
  'None of Northside’s address, phone or email is set on Settings, so this printed quote gives the customer no way to reach Northside.'

/**
 * WHETHER THE PAPER LETS A CUSTOMER REACH NORTHSIDE (the printed quote's critic, 2026-10-31: no
 * address, phone, email or ABN on any of six papers, and nothing said at the give). '' where the
 * letterhead carries an address, a phone or an email, or the salesperson's phone or email prints;
 * otherwise the sentence, said to the dealer where the quote is printed and given (quote-spec §0,
 * rule 5: "a sentence at the moment of issue"). The paper itself never says it: a customer is
 * told only what they need, and nothing is filled from a guess.
 */
export function unreachableSay(
  letterhead: FrozenLetterhead | null,
  preparer: FrozenPreparer | null,
  details = true,
): string {
  const set = (v: string | undefined): boolean => v !== undefined && v.trim() !== ''
  const northside =
    details &&
    letterhead !== null &&
    [letterhead.address, letterhead.phone, letterhead.email].some(set)
  const person = preparer !== null && [preparer.phone, preparer.email].some(set)
  return northside || person ? '' : NO_WAY_TO_REACH
}

/** The largest specification set as one list rather than in groups. */
const FLAT_UP_TO = 12

/**
 * THE SPECIFICATION AS THE PAPER GROUPS IT: in groups only where every group holds two facts or
 * more. A heading over one row ("Weight", "Details", "Capacity") reads as a heading with nothing
 * under it (the printed quote's critic, 2026-10-31), so a sheet of up to twelve facts with such a
 * group is one list in the file's order of groups, and a longer one gathers its lone facts under
 * "Details". A sheet of one group needs no heading at all: it is returned as one list.
 */
export function sheetOnPaper(groups: readonly SpecGroup[]): SpecGroup[] {
  const rows = groups.flatMap((group) => group.rows)
  const one = (): SpecGroup[] => (rows.length === 0 ? [] : [{ id: 'more', name: '', rows }])
  if (groups.length <= 1) return one()
  const lone = groups.filter((group) => group.rows.length === 1)
  if (lone.length === 0) return [...groups]
  if (rows.length <= FLAT_UP_TO) return one()
  const kept = groups.filter((group) => group.rows.length > 1 && group.id !== 'more')
  const rest = groups.filter((group) => group.rows.length === 1 || group.id === 'more')
  const details = rest.flatMap((group) => group.rows)
  if (details.length >= 2) return [...kept, { id: 'more', name: 'Details', rows: details }]
  /* one lone fact and nothing to gather it with: it joins the group before it */
  const last = kept[kept.length - 1]
  return last ? [...kept.slice(0, -1), { ...last, rows: [...last.rows, ...details] }] : one()
}

/** A figure, or a span of two, and nothing else — `measured`'s own. */
const BARE_FIGURE = /^-?\d[\d,]*(?:\.\d+)?(?:\s*[–-]\s*-?\d[\d,]*(?:\.\d+)?)?$/

/**
 * A MEASURE WITH NO UNIT: a bare figure, or a span of two, written with
 * a decimal point — "0.45", "1.35". `measured` has already put on every
 * unit the file's column or the maker states, so a decimal still bare
 * here is one nobody states a unit for. A whole number stays: on this
 * file every bare one is a count ("Cabins 2", "Berths 2", "Air Chambers
 * 6"), measured over every boat row on 2026-09-25, and a count is whole
 * without a unit.
 */
export function unitlessMeasure(value: string): boolean {
  const bare = value.trim()
  return BARE_FIGURE.test(bare) && bare.includes('.')
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
