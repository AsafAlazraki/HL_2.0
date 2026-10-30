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
  OFFER_CAP,
  PAIR_SLOT_LABEL,
  buildSteps,
  chargeAlreadyIn,
  issueBlockers,
  lineAmount,
  orderBands,
  quoteLevelChoices,
  quoteTotals,
  rungIncludes,
  sectionKinds,
  stepOffer,
  stepReason,
  weighPick,
  type Band,
  type BuildStep,
  type QuoteLevelChoice,
  type StepOffer,
  type StepReason,
} from '@/domain/quote'
import { distinguishingFacts, splitOnSharedStem, type ShownFact } from '@/domain/quote/distinguish'
import { lineLevelSaid } from '@/domain/quote/levelSaid'
import {
  boatOfQuote,
  codeBeside,
  factoryPackage,
  lineSaid,
  nameFirst as spokenName,
  saidOnQuote,
} from '@/domain/quote/spoken'
import {
  hullTakesTwo,
  kitGoesWith,
  motorNamedBy,
  orphanedKits,
  swapLines,
  type GoingOn,
  type Swap,
} from '@/domain/quote/swap'
import { isDone } from '@/domain/quote/commands'
import { priceChanges, type PriceChange } from '@/domain/quote/freeze'
import { isPriced } from '@/domain/quote/pricing'
import { sellColumns, unchosenOn } from '@/domain/pricing/unchosen'
import { ADDRESSED_TO_NOBODY } from '@/domain/quote/totals'
import { money } from '@/domain/money'
import { readFinishes, type Finishes } from './finishes'
import { readBoatChoices, type DrawnChoices } from './boat'
import { goodsSaid, nameFirst, powerOf, trailerSizeOf } from './goods'
import { copyOf, creditOf, itemOf, srcSetOf } from '@/data/pictures'
import { measureMotorOnBoat } from '@/domain/fitment/envelope'
import { ONE_TRAILER, sayVerdict } from '@/domain/fitment/say'
import {
  chargeSay,
  inSentence,
  includesSay,
  orphanSay,
  ruledGiveSay,
  unpricedGiveSay,
  unpricedWaitSay,
  NOBODY_WAITS,
  severalSay,
  swapSay,
  warnedGiveSay,
} from './say'
import { pairRuling, pairSaid, type PickRuling } from '@/domain/rules/constraints/pairRules'
import { refusedOnQuote, rulesOnBoat } from '@/domain/quote/ruled'

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
  /** ONE STEP THAT TAKES LINES OFF AND PUTS OTHERS ON — a motor put on instead of the one there,
   *  with its rigging kit (`swapLines`, src/domain/quote/swap.ts) */
  | { do: 'swap'; swap: Swap; label: string }

/** One pressable row of a chapter — a motor, a trailer, a part, a
 *  finish. Everything a card prints is on it, already read. */
export interface OptionRow {
  /** the PAIRING's identity, never the minted line's: a line id is
   *  fresh on every render and React keyed on one loses the focus
   *  inside the card every time a neighbour changes */
  key: string
  /** THE NAME A PERSON SAYS (`nameFirst`: the spoken name without the
   *  parts that are the line's own code, or a trailer's boat size its
   *  row states apart), split into the part every row here shares and
   *  the part that is this row's own */
  stem: string
  tail: string
  /** THE PRICE LIST'S OWN WORDS FOR IT, where the name said is not them: a rigging kit is said by
   *  the motor it is for ("Rigging kit for the F175XC", docs/WORDS.md rule 4) and its description
   *  goes under For the workshop. '' where the name is the price list's own. */
  listed: string
  /** the business's own code for it, frozen onto the line — '' where
   *  the name already says every word of it. Drawn quietly, never
   *  leading (the components critique, 2026-09-29, blocker 2). */
  code: string
  /** a motor's power as the file rates it — "90" — for the power
   *  chips over a list of motors; '' for anything else */
  power: string
  /** ANOTHER ROW OF THIS LIST HAS THE SAME NAME, so the pairing's own
   *  facts are what tell it apart and they stand on its face; anywhere
   *  else they are the workshop's, one press away. */
  twin: boolean
  /** the figure the file states, and the price level it was read at,
   *  by the level's declared name — `Cash`, never the list's own
   *  column name `Sell Price` (m2-last-critique.md, major 5). null
   *  where the row has no price column at all. */
  amount: number | null
  column: string | null
  /** what the press moves the running total by, and to. `delta` is
   *  null where the row carries no price at all — never 0. */
  delta: number | null
  would: number
  /** the price file's own star, and it is the file's alone */
  starred: boolean
  /** A RULE OF THE DEALER'S WARNS ABOUT IT ON THIS BOAT (built-critique-m3-2.md, major 3: the
   *  warned F25SWTC's tile carried no mark and its name said nothing). Its because is said once,
   *  above the list; the tile carries the mark and its name says it to a reader. */
  warned: boolean
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
  /** THE THING ITSELF, where the ledger holds its picture: the row's
   *  own Image Link, resolved to the copy this repository ships
   *  (`copyOf` in @/data/pictures), or one a person marked as exactly this
   *  item. null where neither is held, or a finding refuses it —
   *  never a stand-in. */
  picture: {
    src: string
    width: number
    height: number
    /** the narrower copies, for the picture drawn large */
    srcSet?: string
    /** where it came from, under it large (`creditOf`) */
    credit: string
  } | null
  /** the two or three facts its own row states that decide it — a
   *  motor's "90 hp · 162 kg · 20″ shaft", a trailer's "for a 4.9–5.3
   *  m boat · 1,400 kg ATM · 13″ wheels" (`goodsSaid`); '' for
   *  anything whose file states none */
  spec: string
  /** what this row's own rung already contains, said as a word
   *  where a second charge would otherwise be added twice */
  contains: string
  /** the workbook cell the figure was read from */
  source: string
  act: Act
  /** WHAT THE PRESS PUTS IT ON INSTEAD OF, by the name its tile says — "Yamaha F90LB" — where
   *  the press is a swap; '' where the press adds or takes off */
  instead: string
  /** ON A HULL WHOSE OWN ROW SAYS IT TAKES TWO MOTORS, the press that puts this one on beside
   *  the one there rather than in its place; null everywhere else */
  beside: Act | null
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
  /** the price list's register this table offers from (`parts` is the chandlery's) */
  tableId: string
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
  /** WHAT EVERY PRICE IN THIS LIST ALREADY HAS IN IT, said once over
   *  it — "Every price here includes pre-delivery." — where every row
   *  carries the same word (`includesSay`). It stood on each Yamaha
   *  tile as "PRE-DELIVERY INCLUDED", four times in one chapter. ''
   *  where the rows differ, and then each row keeps its own. */
  includes: string
  /** the whole live table is being shown, narrowing switched off */
  showingAll: boolean
  /** this table's own subtotal, or null where its lines carry no
   *  price at all. Never drawn as 0. */
  amount: number | null
  /** THE LIST IS THE PRICE FILE'S OWN PAIRINGS WITH THIS HULL — a
   *  list somebody wrote down in the workbook, which the counts line
   *  says in five words ("4 of 209 paired with this hull") instead of
   *  printing the list's workbook name over it. */
  paired: boolean
  /** NOT ONE ROW HERE CARRIES A PRICE, because the table has no price
   *  column at all. Said once, over the rows, rather than under each
   *  of them: the SP560 printed "no price column on this table" six
   *  times in one chapter (M2-close critique #4). */
  unpriced: boolean
  /** A MOTOR OR A TRAILER LIST WHOSE SHELF HOLDS A PICTURE, drawn as the
   *  kit's photographed option tiles rather than rows of text (the
   *  component critique, 2026-09-28, blocker 1). A row of it with no
   *  picture held draws its kind in the tile's well, never a stand-in;
   *  a list of parts, fits or charges, which the file gives no pictures,
   *  stays a ruled list. */
  pictured: boolean
  /** WHAT THE DEALER'S OWN RULES SAY ABOUT THIS LIST, one entry per rule that refuses or warns
   *  here (Milestone 3: a rule written on /rules changes what the build refuses on the next
   *  pick, with its own because). A refused row is not on `rows`: it is named here, once, above
   *  the list, with the rule's sentence and its because. A warned row stays on `rows`. */
  ruled: RuledHere[]
  /** ONE TRAILER TO A BOAT (2026-10-22): the rule, said once in the trailer section, on the list
   *  whose press would put a second trailer on — which it no longer does: the press puts it on
   *  in place of the one there (`swapTrailers`). The sentence is the engine's (`ONE_TRAILER` in
   *  `@/domain/fitment/say`). '' everywhere else. */
  oneTrailer: string
  /** A LIST WHOSE PRICE NORTHSIDE HAS NOT CHOSEN (built-critique-m3.md, blocker 1): it names no
   *  price and holds sell figures, so Prices is where it is settled, once. The list's id there
   *  (the door's `list`), or '' for a list that names its price or holds no sell figure. */
  unchosen: string
}

/** One of the dealer's rules, speaking where it bites. */
export interface RuledHere {
  ruleId: string
  /** true: these are not offered here; false: they are, and the rule warns about them */
  refuses: boolean
  /** the rule as it was written on /rules */
  sentence: string
  because: string
  /** what it refuses or warns about here, as the tiles name them */
  names: string[]
  /** of those, ones already on this quote — kept on it, never taken off by a rule */
  onQuote: string[]
  /** how many it took off the list the price list makes for this boat — not counting a row
   *  reached only by searching past it — so the shut head never counts them as on offer */
  fromTheList: number
  /** A WARNING ABOUT EVERY TILE THIS LIST SHOWS, said as "every motor offered here" rather than
   *  three names and "2 more" (the Stacer 379 Proline under "at least 30 hp": all five motors).
   *  The words, or '' where it names its tiles — always '' for a refusal, whose tiles are gone. */
  every: string
}

/**
 * WHAT A LIST OFFERS FOR THIS BOAT, AS ITS TILES SHOW IT: what the narrowing admitted, less what is
 * no longer sold and less what the dealer's own rules refuse (built-critique-m3.md, blocker 4 —
 * "Back to the 3 made for this boat" opened on 2 offered and 1 refused). Fitment counts the same
 * list the same way (`offeredOf`), so the two screens say one number.
 */
export function offeredHere(table: Pick<ChapterTable, 'counts' | 'ruled'>): number {
  const refused = table.ruled.reduce((n, r) => n + (r.refuses ? r.fromTheList : 0), 0)
  return Math.max(0, table.counts.admitted - table.counts.heldCount - refused)
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
  /** where the whole decision stands, in one clause — on a chapter of
   *  the price file, `said` then `rest` as the head draws them */
  fact: string
  /** THE ANSWER AS A PERSON SAYS IT, leading the shut head: "Yamaha
   *  F90LB", "T Alloy 1400 ATM S 13" Skid Braked", "Stacer 519 Sea
   *  Ranger SDF · Centre Console" — never "chosen: TA1400S13SB · …"
   *  (the components critique, 2026-09-29, blocker 2). '' where nothing
   *  is chosen; absent on the two chapters that are not the file's. */
  said?: string
  /** what is still open beside it, quietly: "3 more offered", "nothing
   *  paired yet". Absent where `fact` is the whole of it. */
  rest?: string
  /** the chosen thing's own picture, where the ledger holds one — the
   *  head of a shut motor or trailer chapter shows what is on the quote */
  picture?: OptionRow['picture']
  /** the chapter's own subtotal, or null */
  amount: number | null
  tables: ChapterTable[]
  /** the hull's other finishes — chapter 01 only */
  finishes?: Finishes
  /** THE BOAT ITSELF, CHOSEN HERE (the owner, 2026-10-30): its model, version, material and
   *  colour, each an axis of choices with what each does to the total — chapter 01 only */
  boat?: DrawnChoices
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
  /** every reason it may not be given to a customer yet — `issueBlockers`' own, and one per
   *  rule of the dealer's that refuses a line still standing on it, with that rule's because */
  blockers: string[]
  /** THE SAME CAUSES, ONE FOR ONE WITH `blockers`, said as one of several (built-critique-m3-2.md,
   *  major 5): each without "cannot be given", which the finale says once over the list
   *  (`giveWaitsLead`). Where one cause stands alone, the finale says its whole sentence from
   *  `blockers`. */
  waits: string[]
  /** ONE PER RULE THAT WARNS ABOUT A LINE ON THE QUOTE, said in the finale beside the give
   *  (built-critique-m3-2.md, major 3): a warning that lived only above a list scrolled away
   *  before the quote was handed over. A warning never refuses the give. */
  warnedOnQuote: string[]
  /** a charge one of its own price columns already contains */
  doubleCharged: string[]
  /** EVERY LINE ON THE QUOTE FOR A MOTOR THE BOAT DOES NOT CARRY, said at the line's own list
   *  and in the finale, with the press that puts it right */
  orphans: OrphanFix[]
  /** the lines that carry no price, by the names their tiles say, for the finale's notes */
  unpricedNames: string[]
  /** beside `unpricedNames`, one for one: the list each comes from, by its heading, where the
   *  price list prices nothing in that whole list ("Rigging Kits"); '' where it prices others */
  unpricedLists: string[]
  /** beside `unpricedNames`, one for one: WHY the line has no price (built-critique-m3.md,
   *  blocker 1) — `unchosen`, its list holds sell figures and Northside has not chosen which is
   *  its price; `before`, the list has a price now and this line went on before it did;
   *  `none`, the price list has no figure for it */
  unpricedWhy: UnpricedWhy[]
  /** beside `unpricedNames`: the list's id on Prices, for the door to it; '' for `none` */
  unpricedTables: string[]
  /** beside `unpricedNames`: for a `before` line, the price the price list now gives it, ready
   *  to put on with `applyPriceChanges`; null for every other */
  unpricedAgain: Array<PriceChange | null>
}

/** Why a line on the quote carries no price. */
export type UnpricedWhy = 'unchosen' | 'before' | 'none'

/** A kit for a motor that is not on the boat, and what to do about it. */
export interface OrphanFix {
  lineId: string
  /** the section the kit is in, so its own list says it */
  blockId: string
  said: string
  /** the kit the motor on the boat names, in its place; else the kit off the quote */
  act: Act
  actSay: string
}

export interface RailOptions {
  /** what was typed above the chapters. Under `SEARCH_MIN` letters
   *  it is not a search and the rail is the shortlist. */
  query?: string
  /** the block ids whose narrowing has been switched off */
  showAll?: ReadonlySet<string>
  /** how many rows a list switched to its whole range draws at most (`OFFER_CAP` unless said) */
  cap?: number
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

/** A pairing fact as the line it sits under is said: "Helm Master L2 ·
 *  6X9 Binnacle", never the file's "Helm Master L2 - 6X9 Binnacle"
 *  (m2-last-critique.md, major 4). The whole value stays whole. */
const saidFact = (fact: ShownFact): ShownFact => ({
  ...fact,
  value: lineSaid(fact.value),
  full: lineSaid(fact.full),
})

/* ---------------------------------------------------------- */
/* Reading one table                                           */
/* ---------------------------------------------------------- */

/**
 * WHY A ROW IS NOT ON THE LIST FOR THIS BOAT, IN THE DEALER'S WORDS (docs/WORDS.md: "paired",
 * "pairing", "the price file" → "made for this boat", "the price list"). The engine's curated case
 * reads "Highfield × Dealer Fit does not pair it with Highfield Sport 560. Nothing is wrong with it
 * — the price file simply never recorded that pairing." The fact is kept whole: the price list
 * does not list it for this boat, and nothing is wrong with it. A rule's own clause, with its
 * figures on both sides, is the engine's and is passed through.
 */
function outsideSaid(why: string): string {
  const curated =
    / does not pair it with .+\. Nothing is wrong with it — the price file simply never recorded that pairing\.$/
  return curated.test(why)
    ? 'The price list does not list it for this boat. Nothing is wrong with it.'
    : why
}

/** The words `stepReason` gives a list the price file wrote down,
 *  which is how this screen tells that case from a rule's. */
const curatedSay = (via: string): string => `${via} names which ones go with this one`

function readTable(
  ctx: CatalogueCtx,
  quote: QuoteDef,
  step: BuildStep,
  kind: TableKind,
  options: RailOptions,
  takesTwo: boolean,
  rulings: Rulings | null = null,
): ChapterTable {
  const showingAll = options.showAll?.has(step.id) === true
  const query = (options.query ?? '').trim()
  const searching = query.length >= SEARCH_MIN
  const counts = stepOffer(ctx, quote, step.section, {
    ...(searching ? { query } : {}),
    ...(showingAll ? { all: true } : {}),
    ...(showingAll && options.cap !== undefined ? { cap: options.cap } : {}),
  })

  /* COMPUTED OVER THE WHOLE SHELF AT ONCE, because "does this fact
     tell these rows apart" is not a question one card can answer
     about itself. */
  const shown = distinguishingFacts(counts.candidates.map((c) => shelfFacts(c.line)))

  /* EVERY ROW AS A PERSON SAYS IT, and its code only where the name does
     not already carry it: the row read "Yamaha - F250XCB F250XCB", the
     file's key string and then the same six characters from the Model
     Code column (m2-last-critique.md, major 4). Now "Yamaha F250XCB".
     AND THE NAME LEADS WITH THE THING, NOT ITS CODE (the components
     critique, 2026-09-29, blocker 2): "T Alloy 1400 ATM S 13" Skid
     Braked", with TA1400S13SB kept beside it for the dealer. */
  const found = counts.candidates.map((c) => {
    const said = goods(ctx, c.line, step.title, quote)
    /* A FACTORY PACKAGE MADE FOR ANOTHER BOAT SAYS WHICH (the refine round, 2026-10-21). A
       package is said by its motor, the "Yamaha F130XA package" (`factoryPackage`), because on
       this quote its boat is the headline's. Show all lists every boat's packages, and five
       "Yamaha F130XA package" lines would be five boats told apart by nothing. */
    const pack = c.outside === true ? factoryPackage(c.line.label, step.title) : null
    return pack ? { ...said, name: `${said.name} · for the ${pack.boat}` } : said
  })
  const labels = found.map((g) => g.name)
  const twins = new Map<string, number>()
  for (const name of labels) twins.set(name, (twins.get(name) ?? 0) + 1)
  const built: OptionRow[] = counts.candidates.map((candidate, i) => {
    const line = candidate.line
    const weighed = weighPick(quote, line, candidate.alreadyLineId)
    const split = splitOnSharedStem(labels, i)
    const { name, ...own } = found[i]!
    return {
      ...own,
      key: candidate.key,
      stem: split.stem,
      tail: split.tail,
      code: codeBeside(name, line.code),
      twin: (twins.get(name) ?? 0) > 1,
      amount: lineAmount(line).amount,
      column: lineLevelSaid(line) || null,
      delta: weighed.delta,
      would: weighed.would,
      starred: recommendedHere(ctx, quote, line),
      warned: false,
      fitted: candidate.alreadyLineId !== undefined,
      outside: candidate.outside === true,
      /* the engine names the hull by the file's key ("… does not pair it
         with Highfield - ADV7 (HYP) B-G-B"); the build says the boat as
         every other line of it does, and says the engine's curated case
         in the dealer's words (`outsideSaid`) */
      why: outsideSaid(
        (candidate.outsideWhy ?? '').split(quote.subjectLabel).join(boatOfQuote(quote).say),
      ),
      facts: (shown[i] ?? []).map(saidFact),
      contains: containsSay(line),
      source: line.sourceNote ?? '',
      act: candidate.alreadyLineId
        ? { do: 'remove', lineId: candidate.alreadyLineId, label: line.label }
        : { do: 'add', blockId: step.id, line },
      instead: '',
      beside: null,
    }
  })

  /* THE DEALER'S OWN RULES, WHERE THEY BITE (Milestone 3). A row a rule refuses is not offered:
     it leaves the list and is named once above it, under the rule's own sentence and because —
     one sentence per rule, never one per row (analysis.md, learning 4). A row already on the
     quote is never taken off by a rule; it stays, and the sentence says it is there. */
  const ruled: RuledHere[] = []
  const refusedKeys = new Set<string>()
  /* which tiles each warning is about, so a warning about every one says so (`RuledHere.every`) */
  const warnedKeys = new Map<string, Set<string>>()
  if (rulings) {
    for (const [i, candidate] of counts.candidates.entries()) {
      const ruling = rulings.pick(candidate.line.entityId, candidate.line.rowId)
      if (!ruling) continue
      const row = built[i]!
      const fitted = candidate.alreadyLineId !== undefined
      const name = labels[i] ?? row.tail
      if (ruling.refusedBy) {
        note(ruled, ruling.refusedBy, true, name, fitted, rulings)
        if (!fitted) refusedKeys.add(row.key)
        /* a line a rule refuses is never "Recommended" beside "Not offered on this boat": the
           price list's star gives way to the dealer's own rule */
        row.starred = false
        const entry = ruled.find((r) => r.ruleId === ruling.refusedBy!.id && r.refuses)
        if (entry && !fitted && candidate.outside !== true) entry.fromTheList += 1
      }
      for (const warn of ruling.warnedBy) {
        note(ruled, warn, false, name, fitted, rulings)
        warnedKeys.set(warn.id, (warnedKeys.get(warn.id) ?? new Set<string>()).add(row.key))
      }
      if (ruling.warnedBy.length > 0) row.warned = true
    }
  }
  const rows = built.filter((row) => !refusedKeys.has(row.key))
  for (const entry of ruled) {
    const keys = warnedKeys.get(entry.ruleId)
    const all = !entry.refuses && rows.length > 1 && rows.every((r) => keys?.has(r.key) === true)
    entry.every = all ? `every ${kind === 'trailer' ? 'trailer' : 'motor'} offered here` : ''
  }

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
    .map((line) => {
      const { name, ...own } = goods(ctx, line, step.title, quote)
      const weighed = weighPick(quote, line, line.id)
      return {
        ...own,
        key: line.id,
        stem: '',
        tail: name,
        code: codeBeside(name, line.code),
        twin: false,
        amount: lineAmount(line).amount,
        column: lineLevelSaid(line) || null,
        delta: weighed.delta,
        would: weighed.would,
        starred: recommendedHere(ctx, quote, line),
        warned: (rulings?.pick(line.entityId, line.rowId)?.warnedBy.length ?? 0) > 0,
        fitted: true,
        outside: false,
        /* WHERE IT SITS ON THE QUOTE, the engine's own reason (refine-critique-2.md, 11): a
           motor put on from Show all that is outside the horsepower this boat's own row
           states says so here too, from `@/domain/fitment`, never "nothing wrong" */
        why: envelopeWhy(ctx, quote, line),
        facts: shelfFacts(line).map((f) => saidFact({ ...f, full: f.value, reduced: false })),
        contains: containsSay(line),
        source: line.sourceNote ?? '',
        act: { do: 'remove', lineId: line.id, label: line.label },
        instead: '',
        beside: null,
      }
    })

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
  /* AND WHERE THE ROWS GIVE MORE THAN ONE REASON, THE COMMONEST IS SAID ONCE (2026-10-22). A
     boat's horsepower now speaks for a motor outside it ("Under the 40–60 hp this boat takes."),
     so under Show all a list carries two or three reasons rather than one, and the old test —
     every row identical — lifted none of them: the curated sentence stood on every tile again.
     The reason most rows give is said above them; a row with another keeps its own. */
  const off = rows.filter((r) => r.outside && r.why !== '')
  const tally = new Map<string, number>()
  for (const r of off) tally.set(r.why, (tally.get(r.why) ?? 0) + 1)
  const [commonest, times] = [...tally].reduce<[string, number]>(
    (best, next) => (next[1] > best[1] ? next : best),
    ['', 0],
  )
  const shared = times > 1 ? commonest : ''
  if (shared !== '') for (const row of rows) if (row.outside && row.why === shared) row.why = ''

  /* THE FILE'S OWN PICK, NAMED RATHER THAN STARRED. §4 of the sweep
     counted what the best references do with a recommendation:
     Saxdor pre-answers the chapter and offers a door out, Apple says
     it in words, Porsche names the answer in text above the row —
     "None uses a star, a ribbon or a colour." The substance was
     already right here, because `mintQuote` brings the starred motor
     and the starred trailer across at mint; the glyph was the one
     treatment every reference was measured as avoiding. */
  const recommended = counts.candidates.find((c) => recommendedHere(ctx, quote, c.line))
  const reason = stepReason(ctx, quote, step.section)
  const priced = [...rows, ...also]

  return {
    id: step.id,
    tableId: step.section.tableId,
    title: step.title,
    kind,
    reason,
    counts,
    rows,
    also,
    /* THE FACT, IN THE DEALER'S WORDS. `steps.ts` pairs a bare stop's
       fact with an instruction — "Pair it on the subject's own page and
       it shows here" — and that instruction names a page this app does
       not have, in the engine's word for a hull (M2-close critique #4).
       A bare stop is a list the price file paired nothing into, so it
       says exactly that; every other stop's sentence is the engine's
       own, which already reads as a dealer would say it. */
    why: step.reach === 'bare' ? `Nothing from ${step.title} is made for this boat.` : step.why,
    sharedWhy: shared,
    /* said as its tile says it, so the sentence and the tile name one thing one way */
    recommends: recommended ? (labels[counts.candidates.indexOf(recommended)] ?? '') : '',
    /* each named as its tile names it */
    severalSay: severalSay(
      kind,
      step.lines.map((line) => spokenName(lineSaid(line.label, step.title), line.code)),
      takesTwo,
    ),
    includes: includesSay(priced.map((row) => row.contains)),
    showingAll,
    amount: step.amount,
    /* the engine's curated case, which is the only one whose reason is
       "this list was written down" rather than a rule doing arithmetic */
    paired: reason?.via !== undefined && reason.what === curatedSay(reason.via),
    unpriced:
      priced.length > 0 && priced.every((row) => row.column === null && row.amount === null),
    pictured:
      (kind === 'motor' || kind === 'trailer') && priced.some((row) => row.picture !== null),
    ruled,
    oneTrailer: '',
    unchosen: unchosenList(ctx, step.section.tableId),
  }
}

/** The list's id on Prices where it names no price and holds sell figures to choose from; ''
 *  where its price is named, or nothing on it could be one (`src/domain/pricing/unchosen.ts`). */
function unchosenList(ctx: CatalogueCtx, tableId: string): string {
  const table = ctx.entities[tableId]
  return table && !isPriced(table) && sellColumns(table).length > 0 ? table.id : ''
}

/** A motor line against the boat its quote is for: the envelope's sentence where the motor is
 *  outside the horsepower the boat's own row states, '' otherwise. */
function envelopeWhy(ctx: CatalogueCtx, quote: QuoteDef, line: QuoteLine): string {
  const standing = measureMotorOnBoat(
    ctx,
    { tableId: quote.rootTableId, rowId: quote.rootRowId },
    { tableId: line.entityId, rowId: line.rowId },
  )
  return standing.kind === 'outside' ? sayVerdict(standing.verdict) : ''
}

/* ---------------------------------------------------------- */
/* The dealer's own rules, read once per paint                 */
/* ---------------------------------------------------------- */

/** The rules in force, asked of one pick by its table and row — null where none speaks. */
interface Rulings {
  pick: (entityId: string, rowId: string) => PickRuling | null
  sentenceOf: (ruleId: string) => string
}

/**
 * THE RULES IN FORCE ON THIS BOAT, built once per read of the rail. A rule reads the boat the
 * quote is on and the motor or trailer offered: `pairRuling` (src/domain/rules/constraints/
 * pairRules.ts) holds what a rule says about a pick, and switched off it says nothing. Only a
 * motor or a trailer is ever asked, so a search that reaches two thousand parts never walks one.
 */
function rulingsFor(ctx: CatalogueCtx, quote: QuoteDef): Rulings | null {
  /* THE ONE READING THE MINT ASKS TOO (`@/domain/quote/ruled`), so what a new draft brings
     across and what the build offers can never disagree */
  const pick = rulesOnBoat(ctx, quote.rootTableId, quote.rootRowId)
  if (!pick) return null
  const reading = pairRuling(ctx, ctx.constraintDefs ?? [])
  const said = new Map(reading.rules.map(({ rule, shape }) => [rule.id, pairSaid(shape)]))
  return { pick, sentenceOf: (ruleId) => said.get(ruleId) ?? '' }
}

/** One more thing a rule speaks about here, said under that rule's one sentence. */
function note(
  ruled: RuledHere[],
  rule: { id: string; because: string },
  refuses: boolean,
  name: string,
  fitted: boolean,
  rulings: Rulings,
): void {
  let entry = ruled.find((r) => r.ruleId === rule.id && r.refuses === refuses)
  if (!entry) {
    entry = {
      ruleId: rule.id,
      refuses,
      sentence: rulings.sentenceOf(rule.id),
      because: rule.because,
      names: [],
      onQuote: [],
      fromTheList: 0,
      every: '',
    }
    ruled.push(entry)
  }
  if (!entry.names.includes(name)) entry.names.push(name)
  if (fitted && !entry.onQuote.includes(name)) entry.onQuote.push(name)
}

/** The line's own picture, its name as a person says it, and, for a motor
 *  or a trailer, its facts — read off the row the line was frozen from. The
 *  picture is the one the row itself names (the line's `image`, which keeps
 *  the maker's address), resolved to the held copy; nothing is matched by
 *  resemblance. The name is `lineSaid`'s without the line's own code, and a
 *  trailer's without the boat size its row states apart (`goods.ts`). */
function goods(
  ctx: CatalogueCtx,
  line: QuoteLine,
  register: string,
  quote: QuoteDef,
): Pick<OptionRow, 'picture' | 'spec' | 'power' | 'listed'> & { name: string } {
  /* the exact item: its own copy, or one a person marked as exactly it — never a logo */
  const held = copyOf(itemOf(line.entityId, line.rowId, line.image?.src))
  const entity = ctx.entities[line.entityId]
  /* only a motor and a trailer say facts, so only their rows are looked for —
     a search that reaches two thousand parts never walks their register per row */
  const row =
    entity?.kind === 'motor' || entity?.kind === 'trailer'
      ? (ctx.rowsByEntity[line.entityId] ?? []).find((r) => r.id === line.rowId)
      : undefined
  const listed = nameFirst(lineSaid(line.label, register), line.code, trailerSizeOf(entity, row))
  const kit = kitSaid(ctx, quote, line)
  return {
    picture: held
      ? {
          src: held.src,
          width: held.width,
          height: held.height,
          ...(srcSetOf(held) ? { srcSet: srcSetOf(held) } : {}),
          credit: creditOf(held),
        }
      : null,
    spec: goodsSaid(entity, row),
    power: powerOf(entity, row),
    name: kit === '' ? listed : kit,
    listed: kit === '' ? '' : listed,
  }
}

/** The register the price list keeps its rigging kits in, by its own name. */
const RIGGING_KITS = /\brigging kits?\b/i

/** A motor's name without its maker, as a dealer says it beside the maker's own kit: "F175XC". */
function modelOf(motor: string): string {
  /* "Yamaha F115LB" and the file's own "Yamaha · F115LB" alike */
  const model = motor.replace(/^\S+(?:\s+·)?\s+/, '')
  return model === '' ? motor : model
}

/**
 * A RIGGING KIT IS SAID BY THE MOTOR IT IS FOR (docs/WORDS.md, rule 4; build-close-critique-2.md
 * major 1). After the change of mind the kit was named by the price list's description — "Mech
 * Rigging Kit · 704 Binnacle Mount w 6Y8 2 Gauges, 5 m Harness, Cables & Filter" — in the
 * chapter head and the finale: the database's sentence at the moment the customer is watching.
 * The motor is the file's, never a guess: the motor on this quote the kit goes with
 * (`kitGoesWith`), else the motor its own row names. '' for anything that is not a rigging kit,
 * and for a kit that names no motor, which keeps the price list's words.
 */
export function kitSaid(ctx: CatalogueCtx, quote: QuoteDef, line: QuoteLine): string {
  if (!RIGGING_KITS.test(ctx.entities[line.entityId]?.name ?? '')) return ''
  const on = quote.lines.find(
    (m) => m.id !== line.id && ctx.entities[m.entityId]?.kind === 'motor' && kitGoesWith(line, m),
  )
  const named = motorNamedBy(line)
  const motor = on ? lineName(ctx, quote, on) : named === '' ? '' : spokenName(lineSaid(named))
  return motor === '' ? '' : `Rigging kit for the ${modelOf(motor)}`
}

/**
 * THE PRICE LIST'S PICK, WHILE IT STILL FITS THE BOAT AS IT STANDS (the refine round, 2026-10-21:
 * with the F115LB on, Dealer fit still marked "Rigging kit for the F90LB · Recommended", a kit for
 * a motor that is not on the boat). The file stars the kit of the motor it recommends, so a line
 * that names a motor is recommended only while a motor it goes with is on the quote
 * (`kitGoesWith`). A line that names no motor, and any line on a quote that carries no motor of
 * its own (a package with its motor in it), keeps the file's word as it is.
 */
export function recommendedHere(ctx: CatalogueCtx, quote: QuoteDef, line: QuoteLine): boolean {
  if (line.recommended !== true) return false
  if (motorNamedBy(line) === '') return true
  const motors = quote.lines.filter(
    (m) => m.id !== line.id && ctx.entities[m.entityId]?.kind === 'motor',
  )
  return motors.length === 0 || motors.some((m) => kitGoesWith(line, m))
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
  const takesTwo = hullTakesTwo(ctx, quote)
  const rulings = rulingsFor(ctx, quote)

  const chapters: Chapter[] = bands.map((band) => {
    /* CHAPTER 01 IS THE ONE THE ENGINE CALLS UNDECIDABLE, and on
       this screen it is a decision: the quote is rooted on one row
       of a model that may be sixteen. `finishes.ts` says the rest. */
    const finishes = band.id === 'hull' ? readFinishes(ctx, quote) : undefined
    /* AND THE HULL'S OWN LIST IS NOT DRAWN AT ALL. The subject's step
       has no shortlist — the engine offers nothing on the table a quote
       is rooted on — so it drew "0 of 0 offered", "This chapter has
       nothing left on its shelf" and the hull a second time under "Also
       on this quote … not in the list above", with −$41,340 beside it
       as though taking the hull off a boat quote were a choice (the
       SP560 and the Stacer 519, M2-close critique #4). The hull is
       still never invisible: it is the chapter head's "chosen:", the
       masthead's name and the stage's, and where the model comes in
       finishes it is the lit row of the list the finishes draw. */
    const shown = band.id === 'hull' ? band.tables.filter((t) => !t.step.subject) : band.tables
    const tables = shown.map((t) =>
      readTable(ctx, quote, t.step, t.kind, options, takesTwo, rulings),
    )
    const answer = answerOf(ctx, band, quote, tables)
    const chapter: Chapter = {
      id: band.id,
      num: band.num,
      name: band.name,
      kind: 'band',
      fact: [answer.said, answer.rest].filter((s) => s !== '').join(' · '),
      said: answer.said,
      rest: answer.rest,
      picture: answer.picture,
      amount: band.amount,
      tables,
      offered: tables.reduce((n, t) => n + t.rows.length, 0),
      matched: tables.reduce((n, t) => n + (searching ? t.counts.matched : t.rows.length), 0),
      lines: band.tables.reduce((n, t) => n + t.step.lines.length, 0),
    }
    if (finishes) chapter.finishes = finishes
    if (band.id === 'hull') chapter.boat = readBoatChoices(ctx, quote)
    return chapter
  })

  /* WHO IT IS FOR IS NOT A CHAPTER ANY MORE (the owner, 2026-10-30: "customer details i live in
     the top bar so we can remove who it for in the right hand scrolly"). The name and its line of
     contact are the masthead's, and the rail is the build and its finale. */

  const totals = quoteTotals(quote)
  /* THE FINALE'S HEAD SAYS WHERE THE GIVE STANDS, AND NOTHING ELSE SAYS IT (the refine round,
     2026-10-21). It said "4 items, still a draft" and then "given to the customer": the count
     was the price pill's "4 of 5 items priced", the state was the masthead's dot, and "to the
     customer" was the card's "Given to Jordan Avery" a line below. What a shut finale owes the
     dealer is whether it can be given yet, and once it is, that it was. */
  const blockers = issueBlockers(quote)
  const waits = blockers.map((why) => (why === ADDRESSED_TO_NOBODY ? NOBODY_WAITS : why))
  /* A LINE THE DEALER'S OWN RULE REFUSES REFUSES THE GIVE, once per rule, with its because
     (built-critique-m3-2.md, blocker 1: a refused F130XA stood on the quote, the finale said
     nothing, and the paper printed it). A warning never refuses; it is said beside the give. */
  const warnedOnQuote: string[] = []
  if (quote.state === 'draft') {
    const sentence = (id: string): string => rulings?.sentenceOf(id) ?? ''
    for (const { rule, lines } of refusedOnQuote(ctx, quote)) {
      const names = lines.map((line) => lineName(ctx, quote, line))
      const said = ruledGiveSay(names, rule.because, sentence(rule.id))
      blockers.push(said)
      waits.push(said)
    }
    if (rulings) {
      const warned = new Map<string, { because: string; names: string[] }>()
      for (const line of quote.lines) {
        for (const rule of rulings.pick(line.entityId, line.rowId)?.warnedBy ?? []) {
          const entry = warned.get(rule.id) ?? { because: rule.because, names: [] }
          entry.names.push(lineName(ctx, quote, line))
          warned.set(rule.id, entry)
        }
      }
      for (const [id, { because, names }] of warned) {
        warnedOnQuote.push(warnedGiveSay(names, because, sentence(id)))
      }
    }
  }
  /* THE SUMMARY, AS A SALESPERSON SAYS IT (the owner, 2026-10-30: "big one page one filled screen
     summary with print and send"). It was "The finale", a word nobody at a desk says; the id stays
     `finale`, the address every link to it already carries. */
  chapters.push({
    id: 'finale',
    num: '',
    name: 'The summary',
    kind: 'finale',
    fact:
      quote.state !== 'draft'
        ? 'given'
        : blockers.length === 0
          ? 'ready to give'
          : /* A QUOTE WITH NO NAME AND NOTHING ELSE IN THE WAY SAYS ITS PLACE, NOT THE GAP (the refine
               round, 2026-10-21: "nobody named yet", "A quote needs a name before it can be
               given." and "not ready to give yet" in one window). The missing name is Who it is
               for's to say, just above, so this head says only where the give comes in the build;
               any other reason is said once, in the open finale over its act. A shut head is
               never empty: it is the outline. */
            blockers.every((why) => why === ADDRESSED_TO_NOBODY)
            ? 'after their name'
            : 'not ready to give yet',
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
  /* EACH LINE NAMED AS ITS TILE NAMES IT (2026-09-29, the components critique's minor 15, on
     the finale): the paper's reading kept the trailer's code in front, so the finale said
     "TA1400S13SB · T Alloy 1400 ATM S 13" Skid Braked · 4.9 - 5.3 m already has registration in
     its Cash price" under the act. The boat is still said as every screen says it, and a line
     typed by hand as it was typed. */
  const named = (label: string): string => {
    const line = quote.lines.find((l) => l.label === label)
    if (!line) return lineSaid(label)
    if (line.label === quote.subjectLabel || line.entityId === '') return saidOnQuote(quote, line)
    const register = quote.sections.find((s) => s.tableId === line.entityId)?.title ?? ''
    return goods(ctx, line, register, quote).name
  }
  for (const charge of ['registration', 'install', 'preDelivery'] as const) {
    const found = chargeAlreadyIn(quote.lines, charge).map((f) => ({ ...f, line: named(f.line) }))
    const said = chargeSay(found, charge)
    if (said) doubleCharged.push(said)
  }

  /* ── A CHANGE OF MIND, AND THE KIT THAT GOES WITH THE MOTOR ── */
  const motorSteps = bands
    .flatMap((band) => band.tables)
    .filter((t) => t.kind === 'motor' && !t.step.subject)
  /* THE KITS THE FILE OFFERS THIS HULL, read once and never through the search: a kit the motor
     names is offered in its place whatever the field holds */
  let offered: GoingOn[] | null = null
  const offers = (): GoingOn[] => {
    offered ??= bands
      .flatMap((band) => band.tables)
      .filter((t) => t.kind !== 'motor' && !t.step.subject)
      .flatMap((t) =>
        stepOffer(ctx, quote, t.step.section, {})
          .candidates.filter((c) => c.alreadyLineId === undefined)
          .map((c) => ({ blockId: t.step.id, line: c.line })),
      )
    return offered
  }
  /* A GIVEN QUOTE'S MOTORS ARE WEIGHED AS A CHANGE OF MIND TOO (refine, 2026-10-21, blocker): with
     the swap read only on a draft, the same F115LB quote read "F90LB −$2,337" before it was given
     and "+$14,330" after, every other motor's whole price with a plus sign, as if the customer
     would carry two. Nothing on a given quote can be pressed; its figure says what the change
     would do on the new version that is the way on, which is the swap's, and only the press
     stays a draft's. */
  swapMotors(ctx, quote, chapters, motorSteps, offers, {
    takesTwo,
    total: totals.total,
    live: quote.state === 'draft',
  })
  swapTrailers(ctx, quote, chapters, { total: totals.total, live: quote.state === 'draft' })

  const unpricedLines = quote.lines.filter(
    (line) => line.label !== quote.subjectLabel && lineAmount(line).amount === null,
  )
  /* WHY EACH HAS NO PRICE, read off today's price list (built-critique-m3.md, blocker 1): a list
     whose price is not chosen is not a list with no price, and a line put on before its list was
     priced can take that price in one press */
  const again = unpricedLines.length > 0 ? priceChanges(ctx, quote) : []
  const unpricedWhy: UnpricedWhy[] = []
  const unpricedTables: string[] = []
  const unpricedAgain: Array<PriceChange | null> = []
  for (const line of unpricedLines) {
    const table = ctx.entities[line.entityId]
    const row = table
      ? (ctx.rowsByEntity[table.id] ?? []).find((r) => r.id === line.rowId)
      : undefined
    const now = again.find((c) => c.lineId === line.id && !c.gone && c.to !== null) ?? null
    const why: UnpricedWhy = now ? 'before' : unchosenOn(table, row) ? 'unchosen' : 'none'
    unpricedWhy.push(why)
    unpricedTables.push(why === 'none' || !table ? '' : table.id)
    unpricedAgain.push(now)
  }
  if (quote.state === 'draft') {
    const names = unpricedLines.map((line) => named(line.label))
    const lists = unpricedLines.map(
      (line) => quote.sections.find((s) => s.lineIds.includes(line.id))?.title ?? '',
    )
    blockers.push(...unpricedGiveSay(names, unpricedWhy, lists))
    waits.push(...unpricedWaitSay(names, unpricedWhy, lists))
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
    blockers,
    waits,
    warnedOnQuote,
    doubleCharged,
    orphans: orphansOf(ctx, quote, motorSteps, offers),
    unpricedNames: unpricedLines.map((line) => named(line.label)),
    /* a line frozen with no price column at all comes from a list the price list prices nothing
       in, which is the list's fact (`lineLevelSaid`'s '' is a fact, never a level), and frozen,
       so it reads the same on a given quote and through a search */
    unpricedLists: unpricedLines.map((line) =>
      lineLevelSaid(line) === ''
        ? (quote.sections.find((s) => s.lineIds.includes(line.id))?.title ?? '')
        : '',
    ),
    unpricedWhy,
    unpricedTables,
    unpricedAgain,
  }
}

/** THE MOTOR GOING OFF, WITHOUT THE MAKER BOTH SHARE: "instead of the F90LB" on a Yamaha's tile,
 *  never "instead of the Yamaha F90LB" down a whole list of Yamahas. */
function withoutMaker(off: string, on: string): string {
  const [maker, ...rest] = off.split(' ')
  return rest.length > 0 && on.split(' ')[0] === maker ? rest.join(' ') : off
}

/** A line's name as its tile says it, read off its own section's title; a rigging kit by the
 *  motor it is for (`kitSaid`). */
function lineName(ctx: CatalogueCtx, quote: QuoteDef, line: QuoteLine, title?: string): string {
  const register = title ?? quote.sections.find((s) => s.lineIds.includes(line.id))?.title ?? ''
  const kit = ctx.entities[line.entityId]?.kind === 'motor' ? '' : kitSaid(ctx, quote, line)
  return kit === '' ? spokenName(lineSaid(line.label, register), line.code) : kit
}

/**
 * WITH ONE MOTOR ON, A PRESS ON ANOTHER PUTS IT ON INSTEAD (build-close-critique.md, 2026-10-19,
 * major 1). The customer says "actually, the 115" and the press does what he said: one step that
 * takes the F90LB off and puts the F115LB on, with one way back. Where the motor going off had
 * its rigging kit on the quote and the motor going on names a kit of its own that the file offers
 * this hull, the kit changes in the same step — the rigger is never handed the old motor's kit.
 * A kit both motors share stays. The figure on the tile is what the whole step does to the total,
 * asked of the engine's own summation on the document the step would leave.
 *
 * ON A HULL WHOSE OWN ROW SAYS IT TAKES TWO, the plain add stays one press away beside it
 * (`beside`). With no motor on, or two already, a press adds and takes off as it always did.
 */
function swapMotors(
  ctx: CatalogueCtx,
  quote: QuoteDef,
  chapters: Chapter[],
  motorSteps: readonly { step: BuildStep }[],
  offers: () => GoingOn[],
  {
    takesTwo,
    total,
    live,
  }: {
    takesTwo: boolean
    total: number
    /** a draft, so the press becomes the swap; a given quote's tiles are weighed, never pressed */
    live: boolean
  },
): void {
  const on = motorSteps.flatMap((t) => t.step.lines)
  if (on.length !== 1) return
  const old = on[0]!
  const tables = chapters.flatMap((c) => c.tables).filter((t) => t.kind === 'motor')
  const oldRow = tables
    .flatMap((t) => [...t.rows, ...t.also])
    .find((r) => r.act.do === 'remove' && r.act.lineId === old.id)
  const oldName = oldRow ? nameOf(oldRow) : lineName(ctx, quote, old)
  const kits = quote.lines.filter((line) => line.id !== old.id && kitGoesWith(line, old))
  for (const table of tables) {
    for (const row of table.rows) {
      if (row.act.do !== 'add') continue
      const line = row.act.line
      const off = kits.filter((kit) => !kitGoesWith(kit, line))
      const kit = off.length > 0 ? offers().find((o) => kitGoesWith(o.line, line)) : undefined
      const name = nameOf(row)
      const instead = withoutMaker(oldName, name)
      const priced = lineAmount(line).amount !== null
      const words = swapSay(name, instead, kit !== undefined, priced ? 0 : null)
      const swap: Swap = {
        off: [old.id, ...off.map((k) => k.id)],
        on: [{ blockId: row.act.blockId, line }, ...(kit ? [kit] : [])],
        said: words.said,
        back: words.back,
      }
      const done = swapLines(swap)(quote, '')
      if (!isDone(done)) continue
      const would = quoteTotals(done.next).total
      /* the step says what it did to the total, which is only known once it is weighed */
      if (priced) swap.said = swapSay(name, instead, kit !== undefined, would - total).said
      if (live) {
        if (takesTwo) row.beside = row.act
        row.act = { do: 'swap', swap, label: line.label }
      }
      row.instead = instead
      row.would = would
      row.delta = would - total
    }
  }
}

/**
 * A KIT FOR A MOTOR THE BOAT DOES NOT CARRY, AND THE PRESS THAT PUTS IT RIGHT (build-close-
 * critique.md, 2026-10-19, major 2). Where a motor on the quote names a kit of its own that the
 * file offers this hull, the press puts that kit on in this one's place, in one step; where none
 * does, it takes this one off. Either has its way back in the toast.
 */
function orphansOf(
  ctx: CatalogueCtx,
  quote: QuoteDef,
  motorSteps: readonly { step: BuildStep }[],
  offers: () => GoingOn[],
): OrphanFix[] {
  const found = orphanedKits(quote)
  if (found.length === 0) return []
  const motorTitle = motorSteps[0]?.step.title ?? ''
  const motors = motorSteps.flatMap((t) => t.step.lines)
  return found.map(({ line, motor }) => {
    const kitName = lineName(ctx, quote, line)
    const motorName = spokenName(lineSaid(motor, motorTitle))
    const section = quote.sections.find((s) => s.lineIds.includes(line.id))
    let act: Act = { do: 'remove', lineId: line.id, label: line.label }
    let actSay = 'Take it off the quote'
    for (const m of motors) {
      const kit = offers().find((o) => kitGoesWith(o.line, m))
      if (!kit) continue
      const title = quote.sections.find((s) => s.blockId === kit.blockId)?.title
      const newName = lineName(ctx, quote, kit.line, title)
      const amount = lineAmount(kit.line).amount
      act = {
        do: 'swap',
        label: kit.line.label,
        swap: {
          off: [line.id],
          on: [kit],
          said: `${newName} put on the quote instead of the ${inSentence(kitName)}${amount === null ? ' · no price on it' : ` · ${money(amount)}`}`,
          back: `${newName} off the quote again, and the ${inSentence(kitName)} back on`,
        },
      }
      actSay = `Put on the kit for the ${modelOf(lineName(ctx, quote, m, motorTitle))} instead`
      break
    }
    return {
      lineId: line.id,
      blockId: section?.blockId ?? '',
      said: orphanSay(kitName, motorName),
      act,
      actSay,
    }
  })
}

/* ---------------------------------------------------------- */
/* What a shut head says                                       */
/* ---------------------------------------------------------- */

/** en-AU digits, as every count on the build is written. */
const au = (n: number): string => n.toLocaleString('en-AU')

/** A row's whole name, as its tile or row draws it. */
const nameOf = (row: OptionRow): string => (row.stem === '' ? row.tail : `${row.stem} ${row.tail}`)

/**
 * ONE TRAILER TO A BOAT, WHERE THE BUILD OFFERS THE SECOND (2026-10-22). A boat whose trailers
 * sit in two lists — the SP660's starred REDCO in NSM Custom, its GFAB tandem in GFAB — offered
 * the second as an add, and a press put two trailers on one boat. With one trailer on the quote,
 * a press on any other trailer now puts it on IN PLACE of the one there, in one step with one
 * way back, weighed as the motor's change of mind is; and the list it is pressed in says the
 * rule once, in the engine's words (`ONE_TRAILER`). With none on, a press adds; with two already
 * on — a quote written before this rule — every press adds and takes off as it always did.
 */
function swapTrailers(
  ctx: CatalogueCtx,
  quote: QuoteDef,
  chapters: Chapter[],
  { total, live }: { total: number; live: boolean },
): void {
  const tables = chapters.flatMap((c) => c.tables).filter((t) => t.kind === 'trailer')
  const on = quote.lines.filter((line) => ctx.entities[line.entityId]?.kind === 'trailer')
  if (on.length !== 1) return
  const old = on[0]!
  const oldRow = tables
    .flatMap((t) => [...t.rows, ...t.also])
    .find((r) => r.act.do === 'remove' && r.act.lineId === old.id)
  const oldName = oldRow ? nameOf(oldRow) : lineName(ctx, quote, old)
  let said = false
  for (const table of tables) {
    let offers = false
    for (const row of table.rows) {
      if (row.act.do !== 'add') continue
      offers = true
      const line = row.act.line
      const name = nameOf(row)
      const priced = lineAmount(line).amount !== null
      const words = swapSay(name, oldName, false, priced ? 0 : null)
      const swap: Swap = {
        off: [old.id],
        on: [{ blockId: row.act.blockId, line }],
        said: words.said,
        back: words.back,
      }
      const done = swapLines(swap)(quote, '')
      if (!isDone(done)) continue
      const would = quoteTotals(done.next).total
      if (priced) swap.said = swapSay(name, oldName, false, would - total).said
      if (live) row.act = { do: 'swap', swap, label: line.label }
      row.instead = oldName
      row.would = would
      row.delta = would - total
    }
    if (offers && !said) {
      table.oneTrailer = ONE_TRAILER
      said = true
    }
  }
}

/**
 * THE ANSWER A SHUT CHAPTER STATES, AS A PERSON SAYS IT (the components critique, 2026-09-29,
 * blocker 2: "chosen: TA1400S13SB · T Alloy 1400 ATM S 13" Skid Braked · 4.9 - 5.3 m · 1 to
 * choose from"). What is on the quote leads, named exactly as its tile names it — "T Alloy 1400
 * ATM S 13" Skid Braked", the boat as every screen says it — and what is still open follows,
 * quietly: "3 more offered". The engine's own clause (`stateSay`) said the same facts behind a
 * "chosen:" and the file's code; the counts here are the ones it reads, off the same frozen
 * sections: what each section's list picked and did not put on, what it held back as no longer
 * sold, and a section minted before the counts existed, which cannot say and is not a zero.
 */
function answerOf(
  ctx: CatalogueCtx,
  band: Band,
  quote: QuoteDef,
  tables: readonly ChapterTable[],
): { said: string; rest: string; picture: OptionRow['picture'] } {
  const drawn = new Map<string, OptionRow>()
  for (const table of tables) {
    for (const row of [...table.rows, ...table.also]) {
      if (row.act.do === 'remove') drawn.set(row.act.lineId, row)
    }
  }
  const names: string[] = []
  let picture: OptionRow['picture'] = null
  let offered = 0
  let held = 0
  let unknown = 0
  for (const { step } of band.tables) {
    for (const line of step.lines) {
      const row = step.subject ? undefined : drawn.get(line.id)
      names.push(
        step.subject
          ? saidOnQuote(quote, line)
          : row
            ? nameOf(row)
            : lineName(ctx, quote, line, step.title),
      )
      if (picture === null && row?.picture) picture = row.picture
    }
    if (step.subject) continue
    held += step.section.heldCount ?? 0
    /* WHAT THE DEALER'S OWN RULES REFUSE IS NOT OFFERED (Milestone 3): the list above says so in
       the rule's words, and the shut head does not count it as still on offer. A list a rule
       speaks on is counted as its tiles count it (`offeredHere`, Fitment's count too), less
       what is on the quote from it: the frozen `pickedCount` cannot be trusted there, because a
       draft started before the rule counted the refused rows in it and one started after it
       does not (`mintQuoteFromView` never offers what a rule refuses). */
    const table = tables.find((t) => t.id === step.id)
    if (table && table.ruled.some((r) => r.refuses)) {
      const fitted = table.rows.filter((r) => r.fitted && !r.outside).length
      offered += Math.max(0, offeredHere(table) - fitted)
      continue
    }
    const picked = step.section.pickedCount
    if (picked === undefined) {
      unknown += 1
      continue
    }
    offered += Math.max(0, picked - step.lines.length)
  }
  if (names.length > 0) {
    const others = names.length - 1
    return {
      said:
        others === 0
          ? names[0]!
          : `${names[0]} and ${au(others)} ${others === 1 ? 'other' : 'others'}`,
      rest: offered > 0 ? `${au(offered)} more offered` : '',
      picture,
    }
  }
  /* A LIST THE DEALER'S RULES EMPTIED IS NOT ONE THE PRICE LIST LEFT BARE: the Stacer 659's
     head read "nothing made for this boat yet" under a rule that refuses all eleven motors the
     price list makes for it. It says whose decision it was; the list says which rule and why. */
  const ruledOut = tables.reduce(
    (n, t) => n + t.ruled.reduce((m, r) => m + (r.refuses ? r.fromTheList : 0), 0),
    0,
  )
  const rest =
    offered > 0
      ? `${au(offered)} offered`
      : ruledOut > 0
        ? 'none your rule allows'
        : held > 0
          ? `${au(held)} no longer sold`
          : unknown > 0
            ? 'not chosen'
            : 'nothing made for this boat yet'
  return { said: '', rest, picture: null }
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

/* ---------------------------------------------------------- */
/* Rigging kits, said against the quote's motor                 */
/* ---------------------------------------------------------- */

/** The price list's register of rigging kits, which is one kit per motor. */
export const RIG_KITS = 'rig_kits'

/**
 * ONLY THE KITS FOR A MOTOR ON THIS QUOTE (the flow walk, item 5: Dealer fit offered rigging kits
 * for the F90LB2 White on a quote with no such motor, and "Show all 622"). A kit's tile names its
 * motor (`kitSaid`), so a kit is offered where its words name the code of a motor on the quote;
 * a kit already on the quote is never taken out of sight. With no motor on the quote no kit is
 * offered, and the list says why once (`KITS_WAIT`).
 */
/** The words of a kit's name, each a whole token, so the F90LB is not the F90LB2. */
const kitWords = (row: OptionRow): Set<string> =>
  new Set(`${row.stem}${row.tail} ${row.listed}`.toUpperCase().split(/[^A-Z0-9.]+/))

export function kitsForMotors(rows: readonly OptionRow[], motors: readonly string[]): OptionRow[] {
  const codes = motors.map((m) => m.trim().toUpperCase()).filter((m) => m !== '')
  return rows.filter((row) => row.fitted || codes.some((code) => kitWords(row).has(code)))
}

/** Why no rigging kit is offered while the quote has no motor. */
export const KITS_WAIT =
  'Each rigging kit is made for one motor. Choose the motor in 02 Motor and its kit is offered here.'

/** Why no kit is offered for the motor this quote carries. */
export const kitsNone = (motors: readonly string[]): string =>
  `The price list has no rigging kit for the ${motors.join(' or the ')}.`
