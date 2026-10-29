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
import { codeBeside, lineSaid, nameFirst } from '@/domain/quote/spoken'
import { nameKey } from '@/domain/quote/swap'
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
 * THE CUSTOMER'S WORD FOR A LINE THE PRICE LIST GIVES NO FIGURE, printed once, in that line's
 * own money cell.
 *
 * The engine's word is `Not priced at this level` (`NOT_PRICED_HERE`), and it is the dealer's,
 * on the build and on the note beside this sheet. A buyer does not know what a level is. The
 * paper said "Not priced on this quote" until the refine round (2026-10-21), and said it again
 * in "Your price" and in a sentence under the total telling the customer an item was missing
 * from it. What is true for the person holding the paper is that this item's price is still to
 * come, which is what a dealer says across the desk, and a price still to come is plainly not
 * in the total printed beside it. So the line says the whole fact, and nothing else on the paper
 * repeats it. The dealer is told before the give, once, under the finale's total
 * (`totalNoteSay`), and why, on the note beside the sheet (`deskWhy`).
 */
export const NOT_PRICED_ON_PAPER = 'Price to be confirmed'

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
 * unpriced lines: the head's dash, and no row under "Your price" (the
 * line itself says its price is to be confirmed). Either way it adds
 * nothing to the total, as before.
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
 * slot), why a line reads `Included` or `Price to be confirmed`,
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
  /** never null: a band with no figure at all is not a row (`priceRows`) */
  amount: number
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
 *
 * A BAND WITH NO FIGURE IS NOT A ROW HERE (the refine round, 2026-10-21). Dealer fit holding only
 * the rigging kit printed "Dealer fit · Not priced on this quote", the third time the customer
 * read that one item had no price. It adds nothing to the total, so the rows still sum to it, and
 * the kit's own line on the page above says its price is to be confirmed.
 */
export function priceRows(doc: PrintedQuote): PriceRow[] {
  const rows: PriceRow[] = []
  const band = (key: string, label: string, sum: BandSum): void => {
    if (sum.amount !== null)
      rows.push({ key, label, amount: sum.amount, included: sum.included, signed: false })
  }
  for (const { section, tables } of bandsOnPaper(doc)) {
    band(
      `band:${section.id}`,
      section.name,
      bandSum(
        tables.flatMap((t) => t.lines),
        section.subtotal,
      ),
    )
  }
  if (doc.typed.length > 0) band('typed', OTHER_ITEMS, bandSum(doc.typed, typedTotal(doc)))
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
  row.included ? INCLUDED : row.signed ? signedMoney(row.amount) : money(row.amount)

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

/** A name as it stands inside a sentence: "Rigging kit for …" (`kitsOnPaper`) takes a small r;
 *  a name the price list wrote keeps its capitals. */
const inSentence = (name: string): string =>
  name.startsWith('Rigging kit for ') ? `r${name.slice(1)}` : name

/**
 * WHAT IS NOT IN THE TOTAL, as one sentence naming the items: "The rigging kit for the F115LB has
 * no price on this quote, so it is not in this total.", counting instead past three, where the
 * names would be a paragraph. '' where everything is priced.
 *
 * THE PAPER NO LONGER PRINTS IT (the refine round, 2026-10-21). It stood under the cover's total
 * and, until the round before, under "Your price" too, so the customer read at the moment of
 * trust that something was missing from the figure (build-close-critique-2.md, major 5). The
 * item's own line now says "Price to be confirmed", and the dealer reads this sentence before the
 * give, under the finale's total, in the build's own words (`totalNoteSay`). It stays as the
 * paper's count of what is outside the total, which the cascade's test holds against the build's.
 */
export function underTheTotal(doc: PrintedQuote): string {
  const n = doc.totals.unpricedCount
  if (n <= 0) return ''
  const one = n === 1
  const names = linesOf(doc)
    .filter((line) => line.state === 'unpriced')
    .map((line) => `the ${inSentence(line.said)}`)
  if (names.length === n && n <= 3 && new Set(names).size === n) {
    const said = andList(names)
    return `${said.charAt(0).toUpperCase()}${said.slice(1)} ${one ? 'has' : 'have'} no price on this quote, so ${one ? 'it is' : 'they are'} not in this total.`
  }
  return one
    ? 'One item has no price on this quote, so it is not in this total.'
    : `${n.toLocaleString('en-AU')} items have no price on this quote, so they are not in this total.`
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
  /** items the price list marks as no longer sold, and so not offered */
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
    /* the engine's "Nothing from GFAB Trailers is paired with this one yet." said the section
       twice and in its own word (docs/WORDS.md: paired → made for this boat); matched exactly,
       so the day the engine changes its sentence this falls back to it */
    if (o.say === `Nothing from ${o.title} is paired with this one yet.`)
      phrase.push('none is listed for this boat yet')
    else if (o.say !== '') phrase.push(o.say)
    else if (o.more === null) phrase.push('none taken, and how many it offered cannot be said')
    else if (o.more > 0) phrase.push(`${o.more.toLocaleString('en-AU')} offered, none taken`)
    else phrase.push('nothing on this quote')
  } else if (o.more === null) {
    phrase.push('how many more it offered cannot be said')
  } else if (o.more > 0) {
    phrase.push(`${o.more.toLocaleString('en-AU')} more offered`)
  }
  if (o.held > 0) phrase.push(`${o.held.toLocaleString('en-AU')} no longer sold`)
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
 * and Sell. What is true is that neither has a price a quote is priced
 * at, so no quote can read a figure off them — and that is what the note
 * says, naming the price this quote is at (`at`, "Cash"), as the
 * cascade's card does: "Rigging Kits have no Cash price on the price
 * list". Until the refine round (2026-10-21) it said "no price level is
 * declared for Rigging Kits … declaring one is the dealership's own act,
 * and no screen in this app does it today": the engine's word and a
 * sentence about the app (docs/WORDS.md).
 *
 * AND "HAVE NO CASH PRICE ON THE PRICE LIST" WAS READ AS "THE PRICE IS MISSING" (built-critique-
 * m3.md, blocker 1): the Tube Covers' line holds Sell $2,790, and Prices says the list holds two
 * sell figures and names none. Every list on Northside's price list that names no price holds
 * sell figures to choose from (Prices' "Yours to choose": Dealer Fit, Rigging Kits and the two
 * factory-package lists), so the note says the true thing, in the past, because the line was
 * priced when it went on and a choice made since does not reach back into it.
 */
export function deskWhy(line: DocumentLine, table?: string): string {
  if (line.rung === null && table !== undefined && line.why === noLevelDeclared(table)) {
    return `Northside had not chosen which figure prices ${table} when it went on, so it is not in the total`
  }
  if (line.rung === null && line.why === NO_PRICE_TYPED) {
    return `${NO_PRICE_TYPED}, so it is not in the total`
  }
  if (
    line.rung !== null &&
    line.why === `the price file carries no figure for it at ${line.rung}`
  ) {
    return `the price list has no ${line.rung} price for it, so it is not in the total`
  }
  if (line.rung !== null && line.why === `${line.rung} states a charge of nothing for it`) {
    return `the price list charges nothing for it at ${line.rung}, so it reads ${INCLUDED}`
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

/** Why a line reads `Included` or `Price to be confirmed`, and the
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
      said.push(`${money(line.frozenUnit)} on the price list`)
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
 *  hole — per line. The fitter's, not the buyer's. A pairing's "Slot" is not said: it is
 *  which of the price list's motor columns the pairing was written in, a number the rigger has
 *  no use for (docs/WORDS.md: "Print the prop and engine hole for the rigger and drop Slot"). Each line is
 *  named as the paper names it, and a fact's own "|" is said as " · ",
 *  as the build says it; the facts are parted by ";" so a kit's parts
 *  and the next fact never read as one list (m2-last-critique.md,
 *  major 5: "the rigging kit still in pipes"). */
export function workshopOf(
  doc: PrintedQuote,
): Array<{ label: string; said: string; facts: string }> {
  return linesOf(doc)
    .map((line) => ({ line, facts: line.facts.filter((f) => !/^slot$/i.test(f.label.trim())) }))
    .filter(({ facts }) => facts.length > 0)
    .map(({ line, facts }) => ({
      label: line.label,
      said: line.said,
      facts: facts
        .map((f) => [f.label, piped(f.value)].filter((part) => part !== '').join(' '))
        .join('; '),
    }))
}

/* ---------------------------------------------------------- */
/* A rigging kit, by the motor it is for                        */
/* ---------------------------------------------------------- */

/** The section the price list keeps its rigging kits in, by its own name. */
const RIGGING_KITS = /\brigging kits?\b/i

/** One of a line's own facts by its label, or ''. */
const factOf = (line: DocumentLine, label: string): string =>
  line.facts.find((f) => f.label.trim().toLowerCase() === label)?.value.trim() ?? ''

/** A motor's name without its maker, as a dealer says it beside the maker's own kit: "F115LB". */
function modelOf(motor: string): string {
  const model = motor.replace(/^\S+(?:\s+·)?\s+/, '')
  return model === '' ? motor : model
}

/**
 * A RIGGING KIT IS SAID BY THE MOTOR IT IS FOR, ON THE PAPER TOO (docs/WORDS.md, rule 4;
 * build-close-critique-2.md, major 1). After the change of mind the build and the cascade said
 * "Rigging kit for the F115LB", and the customer's page 2, its "Your price" sentence and the note
 * beside it still printed the price list's description, "Mech Rigging Kit · 704 Binnacle Mount w
 * 6Y8 2 Gauges, 5 m Harness, Cables & Filter", as the line's name. The paper reads the quote
 * alone, so the motor is read off the printed lines, as the build's `kitSaid` reads it off the
 * quote: the motor on this quote that names this kit as its own option, or that the kit's own
 * line names; else the motor the kit's line names. A kit that names no motor keeps the price
 * list's words.
 *
 * THE DESCRIPTION IS KEPT WHOLE, FOR THE WORKSHOP. It becomes the kit's first workshop fact, and
 * the facts that would then say one thing twice go: the kit's own "Motor" (the name says the
 * motor now; it printed "Motor Yamaha - F115LB2 (White)" beside an F115LB, two motors for the
 * rigger to choose between — the same critique's minor 13), and the motor's "Rigging Kit Option",
 * which named the same kit in the same words one line above it.
 */
export function kitsOnPaper(doc: PrintedQuote): PrintedQuote {
  const motors = doc.sections
    .flatMap((s) => s.tables)
    .filter((t) => t.kind === 'motor')
    .flatMap((t) => t.lines)
  const renamed = new Map<string, DocumentLine>()
  const kitsOn = new Set<string>()
  for (const table of doc.sections.flatMap((s) => s.tables)) {
    if (!RIGGING_KITS.test(table.title)) continue
    for (const kit of table.lines) {
      const own = factOf(kit, 'motor')
      const on = motors.find((m) => {
        const option = factOf(m, 'rigging kit option')
        return (
          (option !== '' && nameKey(option) === nameKey(kit.label)) ||
          (own !== '' && nameKey(own) === nameKey(m.label))
        )
      })
      const motor = on ? on.said : own === '' ? '' : nameFirst(lineSaid(own))
      if (motor === '') continue
      kitsOn.add(nameKey(kit.label))
      renamed.set(kit.id, {
        ...kit,
        said: `Rigging kit for the ${modelOf(motor)}`,
        facts: [
          /* as the paper said it until now: the file's words, its pipes and its short forms said */
          { label: '', value: kit.said },
          /* and what the motor's own line already says for the rigger (its prop, its engine hole) */
          ...kit.facts.filter(
            (f) =>
              f.label.trim().toLowerCase() !== 'motor' &&
              !(on?.facts ?? []).some(
                (m) => m.label.trim() === f.label.trim() && m.value.trim() === f.value.trim(),
              ),
          ),
        ],
      })
    }
  }
  if (renamed.size === 0) return doc
  const read = (line: DocumentLine): DocumentLine => {
    const kit = renamed.get(line.id)
    if (kit) return kit
    const option = factOf(line, 'rigging kit option')
    if (option === '' || !kitsOn.has(nameKey(option))) return line
    return {
      ...line,
      facts: line.facts.filter((f) => f.label.trim().toLowerCase() !== 'rigging kit option'),
    }
  }
  return {
    ...doc,
    sections: doc.sections.map((s) => ({
      ...s,
      tables: s.tables.map((t) => ({ ...t, lines: t.lines.map(read) })),
    })),
  }
}

/** THE LEVEL THE PAPER IS PRICED AT, for the note: the level's declared
 *  name and how many lines carry it. It said "Cash — 3 of the 4 lines
 *  carry that rung" (m2-last-critique.md, major 5).
 *
 *  THE COUNT IS SAID ONLY WHERE NOTHING ELSE ON THE NOTE ACCOUNTS FOR IT (the refine round,
 *  2026-10-21). "Cash, on 4 of the 5 items" stood under "Rigging kit for the F175XC: Rigging Kits
 *  have no Cash price on the price list", which is the fifth item, said again as a sum. Where
 *  every item without the price is one "Why an item reads as it does" names, the row says the
 *  price alone. */
export function pricedAtSay(doc: PrintedQuote): string {
  if (doc.rung === null) return NO_LEVEL_ON_IT
  const { label, carriedBy, of } = doc.rung
  if (carriedBy >= of) return `${label}, on every item.`
  const named = linesOf(doc).filter((line) => line.state === 'unpriced' && line.rung === null)
  if (of - carriedBy === named.length) return `${label}, on every item with a price.`
  return `${label}, on ${carriedBy.toLocaleString('en-AU')} of the ${of.toLocaleString('en-AU')} items.`
}

/** Items that read Included with no reason on the note's "Why" row (`reasonsOf`), which the
 *  "Priced at" row counts instead: every other one is named, with its reason, a row above. */
export function includedUnsaid(doc: PrintedQuote): number {
  return linesOf(doc).filter((line) => line.state === 'included' && deskWhy(line) === '').length
}

/** Said where no line on the quote carries a whole-quote price level. */
export const NO_LEVEL_ON_IT =
  'No item on this quote has a price to choose between, so none is named.'

/**
 * THE MEASURES THE PAPER LEAVES OFF, said for the dealer: a figure no
 * source gives a unit for ("Draft 0.45"), which `readDocument` keeps off
 * the customer's copy rather than hand over half a fact.
 */
export function unitlessOf(doc: PrintedQuote): string[] {
  return doc.subject.unitless.map(
    (spec) => `${spec.label} ${spec.value}: neither the price list nor the maker states its unit`,
  )
}

/**
 * THE DEALER'S OWN CODES, EACH BESIDE WHAT IT ORDERS, in the order the lines print (the refine
 * round, 2026-10-21). The note printed them run together — "SS519SRCCL · F90LB · TA1400S13SB ·
 * 704-6Y82L-##-05" — four codes and not a word of which is which, the motor's said a second time
 * where its name is "Yamaha F90LB", and the rigging kit's with the price list's "##" in it. Each
 * is now the item as the paper names it and its code; a code its name already says is not printed
 * again (`codeBeside`); the gap is named by `codeGap`.
 */
export function codesOf(doc: PrintedQuote): Array<{ said: string; code: string }> {
  return linesOf(doc).flatMap((line) => {
    const code = codeBeside(line.said, line.code)
    return code === '' ? [] : [{ said: line.said, code }]
  })
}

/** "##", or a twin kit's "##/##", where a cable rigging kit's code leaves the length out. */
const CODE_GAP = /#{2,}(?:\/#{2,})*/u

/**
 * WHERE THE PRICE LIST'S CODE LEAVES A GAP, THE GAP IS NAMED, as the cascade names it. A cable
 * rigging kit's code carries "##" where the cable length goes — "704-6Y82L-##-05" beside "-10-"
 * and "-11-" with 10' and 11' cables on the price list — because the length is the boat's, and
 * the workshop fits it. Every other character is the file's. null where there is no gap.
 */
export function codeGap(code: string): { before: string; gap: string; after: string } | null {
  const gap = CODE_GAP.exec(code)
  if (gap === null) return null
  return {
    before: code.slice(0, gap.index),
    gap: gap[0].includes('/') ? 'cable lengths' : 'cable length',
    after: code.slice(gap.index + gap[0].length),
  }
}
