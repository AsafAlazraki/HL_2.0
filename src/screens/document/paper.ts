import { money } from '@/domain/money'
import { signedMoney } from '@/domain/quote'
import {
  INCLUDED,
  NO_PRICE_TYPED,
  noLevelDeclared,
  type DocumentLine,
  type DocumentSection,
  type DocumentTable,
  type PrintedQuote,
} from '@/domain/quote/document'
import { paperFileTitle } from '@/domain/quote/title'

/* ============================================================
   THE CUSTOMER'S COPY, AND WHAT THE DEALER IS TOLD INSTEAD.

   Pure, and read off the printed quote and nothing else — the same
   discipline `art.ts` and `paginate.ts` keep beside it, so the screen
   draws what these decide and a test can hold them without a
   renderer.

   WHY IT EXISTS (critique of Milestone 2, #2, and the brief for this
   round: "read the document as the CUSTOMER who is handed it"). Read
   that way on 2026-09-23, the sheet a customer keeps carried, besides
   the quote itself: "Every figure on this document was frozen when the
   line was picked and cannot move"; "6 more were offered from Yamaha
   Outboards"; "4 rows were offered from Dealer Fit Packages and none is
   on this quote"; the prop part number, the engine hole and the slot
   under a motor; "this register carries no price column at all";
   "Amounts are what the price file states… A tax rate is typed by a
   person or it is absent, and nobody has typed one"; a legend defining
   "the level below"; "No terms are printed, because this business has
   not typed any… raised on a sheet with no organisation on it"; and
   "the file can be reimported twice and nothing here moves". Every one
   of them is true, and every one of them is the app talking to itself
   on a piece of paper addressed to somebody else.

   `docs/research/proposal/quote-spec.md` §0 rule 3 is the standard:
   the customer's copy never prints price file, level, rung, register,
   rows, offered, frozen, reimport, slot, engine hole, prop part or
   source cell. Those facts are not deleted. They are the dealer's, and
   they stand in the note beside the sheet, which print takes away with
   the room.
   ============================================================ */

/**
 * THE CUSTOMER'S WORD FOR A LINE THE FILE CARRIES NO FIGURE FOR.
 *
 * The engine's word is `Not priced at this level` (`NOT_PRICED_HERE`),
 * and it is the right word for the dealer, who knows what a level is
 * and reads it on the build and on the note beside this sheet. A buyer
 * does not, and the legend that used to explain it on the paper
 * explained it in the price file's own vocabulary. The quote spec's
 * wording (§5, "Money column") is this one: it says what is true for
 * the person holding the paper — this item has no price on THIS quote
 * — and the reason goes on the dealer's note.
 */
export const NOT_PRICED_ON_PAPER = 'Not priced on this quote'

/** The name the typed-in lines print under — lines belonging to no register. */
export const OTHER_ITEMS = 'Other items'

/** The adjustments band, in the customer's words. */
export const ADJUSTMENTS = 'Adjustments'

/* ---------------------------------------------------------- */
/* What prints                                                  */
/* ---------------------------------------------------------- */

/** One band as the customer's copy prints it. */
export interface PaperBand {
  section: DocumentSection
  /** only the registers that put something on the quote, in their own order */
  tables: readonly DocumentTable[]
  /** a sub-head per register, only where more than one is left to head */
  named: boolean
}

/**
 * THE BANDS THE PAPER PRINTS. A register with nothing on the quote is
 * left off, and a band with no register left is left off whole — the
 * quote spec's §5: "A band with nothing on it is left out of the
 * customer's copy". What it offered and nobody took is the dealer's
 * census, and `offeredOf` hands it to the note.
 */
export function bandsOnPaper(doc: PrintedQuote): PaperBand[] {
  const out: PaperBand[] = []
  for (const section of doc.sections) {
    const tables = section.tables.filter((table) => table.lines.length > 0)
    if (tables.length === 0) continue
    out.push({ section, tables, named: tables.length > 1 })
  }
  return out
}

/** True where a register prints a quantity column: only where one of
 *  its lines is at more than one. A column of `1`s is a digit a reader
 *  has to work out for nothing. */
export const hasQuantity = (lines: readonly DocumentLine[]): boolean =>
  lines.some((line) => line.qty > 1)

/** The money cell's word, or '' where a figure prints. Exactly one of
 *  three things, as the engine promises for its own column. */
export function cellWord(line: DocumentLine): string {
  if (line.state === 'included') return INCLUDED
  if (line.state === 'unpriced') return NOT_PRICED_ON_PAPER
  return ''
}

/**
 * WHAT A BAND'S SUBTOTAL PRINTS, on its head and under "Your price".
 *
 * Its figure, wherever something in it is charged. Where nothing is, a
 * nought is not the answer: `$0` beside a band says the band costs
 * nothing. Found 2026-09-25 reading a Stacer 499 WildRider's paper as
 * its buyer would: Dealer fit held the steering install the file prices
 * at nothing (Included) and the rigging kit no declared level prices
 * (Not priced on this quote), and the paper read "04 Dealer fit $0" and
 * "Dealer fit $0", which says the kit is free.
 *
 * So a band whose every line the file includes at no charge reads
 * Included, as each of its lines does. A band holding a line that is not
 * priced, with nothing charged beside it, has no figure, like a band of
 * unpriced lines: the head's dash, and Not priced on this quote under
 * "Your price". Either way it adds nothing to the total, as before.
 */
export interface BandSum {
  /** the figure, or null where the band has none to print */
  amount: number | null
  /** every line in it is Included, and so the band is */
  included: boolean
}

export function bandSum(lines: readonly DocumentLine[], subtotal: number | null): BandSum {
  if (subtotal !== 0) return { amount: subtotal, included: false }
  if (lines.some((line) => line.state === 'charged')) return { amount: 0, included: false }
  if (lines.some((line) => line.state === 'unpriced')) return { amount: null, included: false }
  return { amount: 0, included: lines.length > 0 }
}

/** What a band's head prints at its right end: a figure, Included, or a
 *  dash where it has no figure. Never a nought standing for either. */
export const bandFigure = (sum: BandSum): string =>
  sum.included ? INCLUDED : sum.amount === null ? '—' : money(sum.amount)

/** "registration", "registration and pre-delivery", "a, b and c". */
const andList = (items: readonly string[]): string =>
  items.length <= 1
    ? (items[0] ?? '')
    : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`

/**
 * THE ONE LINE UNDER A LINE'S NAME, in the customer's words: the
 * arithmetic of a quantity (`live/stripe-billing`), what the figure
 * already contains, and a price agreed by hand with the reason written
 * beside it. What is NOT here, and is on the dealer's note: the
 * workshop facts of a pairing (rigging kit, prop part, engine hole,
 * slot), why a line reads `Included` or `Not priced on this quote`,
 * and the file's own figure under a price agreed by hand.
 */
export function noteOnPaper(line: DocumentLine): string {
  const said: string[] = []
  if (line.qty > 1 && line.unit !== null) said.push(`${line.qty} × ${money(line.unit)}`)
  if (line.contains.length > 0) said.push(`Includes ${andList(line.contains)}`)
  /* A PRICE PUT ON A LINE THE FILE DOES NOT PRICE IS SIMPLY ITS PRICE
     (2026-09-24). A Haines Signature hull is on the file at nought, so
     the dealer puts its price on it at the build; "Price agreed at
     <his figure> — The price file holds no price for this boat" would tell
     the customer a figure was bargained against another and would print
     the price file on their copy. There was no other figure: the reason
     goes on the dealer's note, `reasonsOf`. */
  if (line.overridden && line.frozenUnit !== null) {
    said.push(
      `Price agreed at ${money(line.unit ?? 0)}${line.overrideReason ? ` — ${line.overrideReason}` : ''}`,
    )
  }
  return said.join(' · ')
}

/** One row of "Your price". */
export interface PriceRow {
  key: string
  label: string
  /** null where the band carries no figure at all */
  amount: number | null
  /** a band whose every line is Included says so (`bandSum`) */
  included: boolean
  /** an adjustment prints its sign, because it is against the rest */
  signed: boolean
}

/**
 * "YOUR PRICE" — every band the paper printed, then the typed lines,
 * then each adjustment on its own row with its own reason, then the
 * tax lines where a person typed a rate. The quote spec's §8, and its
 * rule 7: the bands and the adjustments sum to the total, which
 * `paper.test.ts` proves on the real file rather than promises here.
 * The total itself is not a row: the screen sets it under the rule.
 */
export function priceRows(doc: PrintedQuote): PriceRow[] {
  const rows: PriceRow[] = bandsOnPaper(doc).map(({ section, tables }) => ({
    key: `band:${section.id}`,
    label: section.name,
    ...bandSum(
      tables.flatMap((t) => t.lines),
      section.subtotal,
    ),
    signed: false,
  }))
  if (doc.typed.length > 0) {
    rows.push({
      key: 'typed',
      label: OTHER_ITEMS,
      ...bandSum(doc.typed, typedTotal(doc)),
      signed: false,
    })
  }
  for (const adjustment of doc.adjustments) {
    rows.push({
      key: `adj:${adjustment.id}`,
      label: adjustment.label,
      amount: adjustment.amount,
      included: false,
      signed: true,
    })
  }
  return rows
}

/** The figure a price row prints. */
export const rowFigure = (row: PriceRow): string =>
  row.included
    ? INCLUDED
    : row.amount === null
      ? NOT_PRICED_ON_PAPER
      : row.signed
        ? signedMoney(row.amount)
        : money(row.amount)

/** The typed lines' own subtotal, null when none of them carries a figure. */
export function typedTotal(doc: PrintedQuote): number | null {
  return doc.typed.reduce<number | null>(
    (n, line) => (line.amount === null ? n : (n ?? 0) + line.amount),
    null,
  )
}

/** What the total is called on the paper: the tax convention is a fact
 *  about the figure beside it, and the price column it was read from is
 *  not (that is the dealer's, on the note). */
export const totalLabel = (doc: PrintedQuote): string =>
  doc.totals.taxRate === null ? 'Total, tax included' : 'Total'

/** The one sentence under the total, and only where there is something
 *  the customer needs to know: an item on the boat with no price. */
export function underTheTotal(doc: PrintedQuote): string {
  const n = doc.totals.unpricedCount
  if (n <= 0) return ''
  return n === 1
    ? 'One item is not priced on this quote and is not in this total.'
    : `${n.toLocaleString('en-AU')} items are not priced on this quote and are not in this total.`
}

/* ---------------------------------------------------------- */
/* What the dealer is told instead                              */
/* ---------------------------------------------------------- */

/** One register's census, for the note beside the sheet. */
export interface Offered {
  title: string
  /** lines it put on the quote */
  took: number
  /** rows it offered and nobody took; null where the quote is too old to say */
  more: number | null
  /** rows held back as no longer sold */
  held: number
  /** the engine's own sentence for a register with nothing on the quote */
  say: string
}

/**
 * EVERY REGISTER THAT HAS SOMETHING TO REPORT, in the document's order:
 * one that took nothing (and so is off the paper), one that offered
 * more than it took, one that held rows back. The hull offers nothing
 * and withholds nothing, so it never appears.
 */
export function offeredOf(doc: PrintedQuote): Offered[] {
  const out: Offered[] = []
  for (const section of doc.sections) {
    for (const table of section.tables) {
      if (table.subject) continue
      const took = table.lines.length
      if (took > 0 && table.optional === 0 && table.held === 0) continue
      out.push({
        title: table.title,
        took,
        more: table.optional,
        held: table.held,
        /* NOT `table.next`. The engine pairs a bare list with "Pair it on
           the subject's own page and it shows here", a page this app does
           not have, in the engine's word for a hull — the build dropped it
           for the same reason (M2-close critique #4), and the note beside
           the paper printed it until m2-last-critique.md, major 5. */
        say: table.say,
      })
    }
  }
  return out
}

/** One register's census as a phrase: "6 more offered", "4 offered,
 *  none taken", and the engine's own sentence where it wrote one. */
export function offeredSay(o: Offered): string {
  /* `phrase` and not a name for its pieces: the cost guard reads that
     word followed by a dot as a field of the Parts table, which carries
     cost columns, and a false alarm there is cheaper to avoid than to
     exempt */
  const phrase: string[] = []
  if (o.took === 0) {
    if (o.say !== '') phrase.push(o.say)
    else if (o.more === null) phrase.push('none taken, and how many it offered cannot be said')
    else if (o.more > 0) phrase.push(`${o.more.toLocaleString('en-AU')} offered, none taken`)
    else phrase.push('nothing on this quote')
  } else if (o.more === null) {
    phrase.push('how many more it offered cannot be said')
  } else if (o.more > 0) {
    phrase.push(`${o.more.toLocaleString('en-AU')} more offered`)
  }
  if (o.held > 0) phrase.push(`${o.held.toLocaleString('en-AU')} held back as no longer sold`)
  return phrase.join('; ')
}

/**
 * WHAT THE SAVED PDF IS CALLED. A browser proposes the page's title as
 * the file name in its print window, and the page's title was the app's
 * — a salesperson who chose Save as PDF got `HelmLogic.pdf` for the one
 * object that leaves the building with the dealership's name on it. The
 * quote spec's §10 names this shape: `Northside Marine quote
 * 20260923-01 – Stacer 529 Assault Pro (Tournament)`. A quote that froze
 * no business name is called by its reference alone. The boat is the
 * exact model as the cover heads it (`boatTitle` in
 * `src/domain/quote/title.ts`): "(Tournament)" kept, because that is
 * which 529 it is — it was dropped until 2026-09-25 — and not its colour,
 * whose " / " a file name cannot hold.
 */
export const paperTitle = (doc: PrintedQuote): string =>
  paperFileTitle(doc.business, doc.reference, doc.subject.title)

/** A phrase as a line of the note: the full stop added only where the
 *  phrase does not already end a sentence of its own — the engine's
 *  sentence for an unpaired register does. */
export const asLine = (said: string): string => (/[.!?]$/.test(said) ? said : `${said}.`)

/** A sentence carried inside another: its first letter lowered, its
 *  full stop dropped, so "The price file holds none." reads as a clause. */
const lowerFirst = (said: string): string =>
  said.replace(/[.]$/, '').replace(/^\p{Lu}(?!\p{Lu})/u, (c) => c.toLowerCase())

/** Every line on the document, in the order it is printed. */
export function linesOf(doc: PrintedQuote): DocumentLine[] {
  return [...doc.sections.flatMap((s) => s.tables.flatMap((t) => t.lines)), ...doc.typed]
}

/**
 * WHERE A PRICE LEVEL IS DECLARED, said where the note says one is not.
 * No screen in this app declares one today, so the note says whose act
 * it is and does not send the dealer to a screen that does not exist.
 */
export const DECLARING_A_LEVEL =
  'declaring one is the dealership’s own act, and no screen in this app does it today'

/**
 * WHY A LINE READS AS IT DOES, in the dealer's words. The engine's
 * reasons are about the workbook — "no price level is declared for
 * Rigging Kits", "the price file carries no figure for it at Cash",
 * "Cash states a charge of nothing for it" (`readLine` in
 * `domain/quote/document.ts`) — and the note beside the paper printed
 * them as they were (m2-last-critique.md, major 5). They are matched
 * EXACTLY, as the cascade's `heldSay` matches its own, so the day the
 * engine changes its words this falls back to them rather than guessing.
 * The level is the one the line is priced at, by its declared name
 * (`DocumentLine.rung`); `table` is the name of the table the line was
 * picked from, undefined for a line typed on the quote.
 *
 * IT SAID "the price file has no price for it at any level" UNTIL
 * 2026-09-25, and that was false: Rigging Kits carries Kit Sell Price,
 * Sell Price and Install Retail Sell, and Dealer Fit Packages Act Sell
 * and Sell. What is true is that neither declares a price level, so no
 * quote can read a figure off them — and that is what the note says.
 */
export function deskWhy(line: DocumentLine, table?: string): string {
  if (line.rung === null && table !== undefined && line.why === noLevelDeclared(table)) {
    return `${noLevelDeclared(table)}, so it has no price on this quote and is not in the total; ${DECLARING_A_LEVEL}`
  }
  if (line.rung === null && line.why === NO_PRICE_TYPED) {
    return `${NO_PRICE_TYPED}, so it is not in the total`
  }
  if (
    line.rung !== null &&
    line.why === `the price file carries no figure for it at ${line.rung}`
  ) {
    return `the price file has no ${line.rung} price for it, so it is not in the total`
  }
  if (line.rung !== null && line.why === `${line.rung} states a charge of nothing for it`) {
    return `its ${line.rung} price on the price file is nothing, so the paper reads ${INCLUDED}`
  }
  return line.why
}

/** One reason on the note: the line as the paper names it (`said`,
 *  "DEC Rigging Kit · 6x9 Binnacle", never the file's pipes), and its
 *  `label`, the file's own string, which is how a line is known. */
export interface DeskReason {
  label: string
  said: string
  why: string
}

/** Why a line reads `Included` or `Not priced on this quote`, and the
 *  file's own figure under a price agreed by hand — the reasons the
 *  paper no longer prints under the name. */
export function reasonsOf(doc: PrintedQuote): DeskReason[] {
  const out: DeskReason[] = []
  /* every line in the order it prints, with the table it was picked from */
  const lines: Array<{ line: DocumentLine; table?: string }> = [
    ...doc.sections.flatMap((s) =>
      s.tables.flatMap((t) => t.lines.map((line) => ({ line, table: t.title }))),
    ),
    ...doc.typed.map((line) => ({ line })),
  ]
  for (const { line, table } of lines) {
    const said: string[] = []
    const why = deskWhy(line, table)
    if (why !== '') said.push(why)
    if (line.overridden && line.frozenUnit !== null) {
      said.push(`${money(line.frozenUnit)} on the file`)
    }
    /* the customer's copy prints a price put on an unpriced line as the
       line's price and nothing more, so the dealer is told here whose
       figure it is and why it was put on */
    if (line.overridden && line.frozenUnit === null && line.unit !== null) {
      said.push(
        `priced by hand at ${money(line.unit)}${line.overrideReason ? ` — ${lowerFirst(line.overrideReason)}` : ''}`,
      )
    }
    if (line.overridden && !line.overrideReason) said.push('no reason was written beside it')
    if (said.length > 0) out.push({ label: line.label, said: line.said, why: said.join('; ') })
  }
  return out
}

/** A fact's own "|" said as " · ", and nothing else of its words moved:
 *  "Helm Master L2 - 6X9 Binnacle | Bolt on DES" is the build's "Helm
 *  Master L2 - 6X9 Binnacle · Bolt on DES", and a prop's "- 17\"" and a
 *  motor's "Yamaha - F250XCB" are the workshop's words as the file wrote
 *  them. */
export const piped = (value: string): string =>
  value
    .split('|')
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter((part) => part !== '')
    .join(' · ')

/** The workshop facts a pairing carries — rigging kit, prop, engine
 *  hole, slot — per line. The fitter's, not the buyer's. Each line is
 *  named as the paper names it, and a fact's own "|" is said as " · ",
 *  as the build says it; the facts are parted by ";" so a kit's parts
 *  and the next fact never read as one list (m2-last-critique.md,
 *  major 5: "the rigging kit still in pipes"). */
export function workshopOf(
  doc: PrintedQuote,
): Array<{ label: string; said: string; facts: string }> {
  return linesOf(doc)
    .filter((line) => line.facts.length > 0)
    .map((line) => ({
      label: line.label,
      said: line.said,
      facts: line.facts.map((f) => `${f.label} ${piped(f.value)}`).join('; '),
    }))
}

/** THE LEVEL THE PAPER IS PRICED AT, for the note: the level's declared
 *  name and how many lines carry it. It said "Cash — 3 of the 4 lines
 *  carry that rung" (m2-last-critique.md, major 5). */
export function pricedAtSay(doc: PrintedQuote): string {
  if (doc.rung === null) return NO_LEVEL_ON_IT
  const { label, carriedBy, of } = doc.rung
  return carriedBy >= of
    ? `${label}, on every line.`
    : `${label}, on ${carriedBy.toLocaleString('en-AU')} of the ${of.toLocaleString('en-AU')} lines.`
}

/** Said where no line on the quote carries a whole-quote price level. */
export const NO_LEVEL_ON_IT =
  'No line on this quote has a price level to choose between, so none is named.'

/**
 * THE MEASURES THE PAPER LEAVES OFF, said for the dealer: a figure no
 * source gives a unit for ("Draft 0.45"), which `readDocument` keeps off
 * the customer's copy rather than hand over half a fact.
 */
export function unitlessOf(doc: PrintedQuote): string[] {
  return doc.subject.unitless.map(
    (spec) => `${spec.label} ${spec.value}: neither the price file nor the maker states its unit`,
  )
}

/** A width and a height, as the note says a picture's size. */
const sizeSay = (w: number, h: number): string =>
  `${w.toLocaleString('en-AU')} × ${h.toLocaleString('en-AU')}`

/**
 * THE COVER PICTURE'S SIZE, AS HELD AND AS PRINTED, for the note. `drawn`
 * is measured in the paper's own geometry (the document screen reads it
 * while the sheaf is gauged), so it is the box the printer lays down and
 * not the window's; null until it has been measured. The picture is
 * fitted whole, so "whole" is the stylesheet's promise and the figure is
 * the measurement; "never enlarged" is said only where the figures show
 * it.
 */
export function printedSay(
  held: { width: number; height: number },
  drawn: { w: number; h: number } | null,
): string {
  const was = `Held ${sizeSay(held.width, held.height)}`
  if (drawn === null) return `${was}, printed whole`
  const enlarged = drawn.w > held.width || drawn.h > held.height
  return `${was}, printed whole at ${sizeSay(drawn.w, drawn.h)}, ${
    enlarged ? 'larger than the pixels held' : 'never enlarged'
  }`
}

/** The dealer's own codes, in the order the lines print. */
export function codesOf(doc: PrintedQuote): string[] {
  return linesOf(doc)
    .map((line) => line.code)
    .filter((code): code is string => code !== null)
}
