/* The price ladder and what a rung already contains. The argument for
   why every figure on a quote is a VALUE and never an id is the header
   of quote.ts; these are the shapes it freezes from. */

/* ---------------------------------------------------------- */
/* Price levels — QUOTE_SPEC §8.2                             */
/* ---------------------------------------------------------- */

/** One column a quote may read a price from.
 *
 *  `key` is shared across tables ('cash', 'trade') so ONE choice
 *  prices a whole quote; `label` is the column as the business
 *  wrote it, which differs per table for the same key — a boat's
 *  cash rung is called `Cash` and a motor's is called `Sell Price`.
 *
 *  `scope` is this workflow's addition to §8.2 and it is what stops
 *  the quote-wide chooser from offering nonsense. `warranty` exists
 *  only on boats and `fitted` only on parts: offering either as a
 *  whole-quote level would price a trailer at "fitted", which is not
 *  a rung any trailer has. Quote-wide keys drive the one control at
 *  the top; line keys are offered on the line they belong to. */
export interface PriceLevel {
  key: string
  label: string
  fieldId: string
  scope: 'quote' | 'line'
  /** what this column's number ALREADY CONTAINS — see `RungContents` */
  contains?: RungContents
}

/* ---------------------------------------------------------- */
/* What a price column already contains                       */
/* ---------------------------------------------------------- */

/**
 * WHAT IS ALREADY INSIDE THE NUMBER, AS DATA RATHER THAN AS PROSE.
 *
 * `docs/specs/SERVICE_AND_THEMES.md` §3.2 theme 5, which is where
 * this shape and these three names come from, verbatim:
 *
 *   "`Sell inc Rego` includes registration; `Cash` does not. `Sell
 *    inc Install` includes labour; `Sell` does not. Every *'must
 *    never add this twice'* sentence in QUOTE_SPEC §2.3 is a fact
 *    about what a price column already contains. Three optional
 *    booleans on `PriceLevel` move all of them from prose into data,
 *    and the quote's rule becomes mechanical: **never add a charge
 *    that a line's own price column already includes.**"
 *
 * Until this existed the four facts were a paragraph at the head of
 * `pricing.ts` — correct, cited, and readable by nobody but a
 * developer. A paragraph cannot refuse anything. This can.
 *
 * THREE STATES, NOT TWO, AND THE THIRD IS THE HONEST ONE.
 *
 *   `true`      a cell says this column contains that charge
 *   `false`     a cell says it does NOT — the sibling rung is where
 *               the charge lives, so charging it here is correct
 *   `undefined` nobody has read a cell either way
 *
 * The difference between `false` and `undefined` is the difference
 * between "the workbook rules this out" and "we have not looked",
 * and a surface must be able to say which. Only `true` refuses; only
 * `false` reassures; `undefined` says nothing at all, which is what
 * this app does everywhere else it has not measured something.
 *
 * `source` is the fourth field and §3.2 said three. It is here
 * because this repository does not state a business fact without the
 * cell it came from — `sourceNote` on a line, `readFrom` on a mass
 * band, `Source` on every seeded row. A flag that refuses a charge
 * and cannot say why is DESIGN_PRINCIPLES rule 10 broken by the
 * mechanism that exists to keep it.
 */
export interface RungContents {
  /** the registration fee is inside this number */
  includesRegistration?: boolean
  /** the labour to fit the thing is inside this number */
  includesInstall?: boolean
  /** pre-delivery is inside this number */
  includesPreDelivery?: boolean
  /** the cell that says so, e.g. 'Trailer Module!CA = ROUNDUP(BW+BZ,)' */
  source: string
}

/** The three charges a price column can already contain. Closed on
 *  purpose: a fourth needs a cell in a workbook, not a string. */
export type RungCharge = 'registration' | 'install' | 'preDelivery'

/** What each charge is called on screen, in the business's own
 *  nouns rather than ours. */
export const CHARGE_TITLE: Record<RungCharge, string> = {
  registration: 'registration',
  install: 'fitting labour',
  preDelivery: 'pre-delivery',
}

/** The whole-quote rungs, in the order the business offers them.
 *  Deliberately NOT a hardcoded list of six, two of which return the
 *  same number and one of which is unreachable — which is what
 *  production shipped. */
export const QUOTE_LEVEL_ORDER = ['cash', 'trade'] as const

/** The business's own word for each rung, used by the one control at
 *  the top of a quote. Each line still records the column name it was
 *  actually read from, so `Cash` on the chooser and `Sell Price` on a
 *  motor line never disagree — they are the same decision, named at
 *  two different altitudes. */
export const LEVEL_TITLE: Record<string, string> = {
  cash: 'Cash',
  trade: 'Trade',
  warranty: 'Warranty',
  fitted: 'Fitted',
}

/* ---------------------------------------------------------- */
/* The ladder as a persisted record                           */
/* ---------------------------------------------------------- */

/** A table's declared ladder, persisted as one record per table.
 *
 *  `EntityDef.priceLevels` is where `priceLevelsFor` reads a ladder,
 *  and it stays so. This record is the same list filed on its own,
 *  so the Levels screen can rewrite one ladder without rewriting a
 *  2,500-row table, and so the packer's declarations
 *  (`PackTableMeta.priceLevels`) land somewhere with an `orgId` before
 *  the table they belong to is loaded. The catalogue store writes the
 *  two in one step; `CatalogueCtx.priceLevels` indexes them by table. */
export interface PriceLevelRecord {
  /** the table's own id — one ladder per table */
  id: string
  /** the tenant key — see EntityDef.orgId */
  orgId: string
  tableId: string
  levels: PriceLevel[]
  updatedAt: string
}

/* ---------------------------------------------------------- */
/* A frozen rung — QUOTE_SPEC §8.1                            */
/* ---------------------------------------------------------- */

/** One rung of this line, captured at the moment it was picked.
 *
 *  NOT in §8.1, and argued: §5 says changing the level "re-reads
 *  every line's frozen number FROM THE SAME FROZEN SOURCE CELL it
 *  recorded". The only way that sentence is literally true is if
 *  every rung was captured at pick time. Capture them all and a
 *  level change becomes pure arithmetic on frozen data — no store
 *  read, no chance that switching to Trade on Friday quietly picks
 *  up Tuesday's reimport. */
export interface FrozenLevel {
  key: string
  /** the column as the business writes it, e.g. 'Sell inc Rego' */
  label: string
  fieldId: string
  /** null is a REAL state: this table has that rung and it is empty */
  value: number | null
  scope: 'quote' | 'line'
  /** what this column's number already contains, FROZEN with it.
   *
   *  It travels on the line for the same reason every other field
   *  does: a quote renders from its own lines and never reads a base
   *  table, so the sentence "this price already has the rego in it"
   *  has to be on the photograph or the document cannot say it. It is
   *  a VALUE — three booleans and a cell reference — which is exactly
   *  what the header of quote.ts permits a line to carry. */
  contains?: RungContents
}
