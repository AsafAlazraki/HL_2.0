import type { ImageRef } from './images'
import type { CustomerRef, FrozenCustomer } from './people'
import type { FrozenLevel } from './pricing'
import type { TableKind } from './tables'

/* ============================================================
   THE QUOTE'S SHAPES.

   MODULE_SYSTEM §9: "two types move, unchanged, from
   `src/features/quote/types.ts` into `model.ts`: `PriceLevel` and
   `QuoteDef` and their satellites. The file was written to be moved
   verbatim and says so. Cost: one import path."

   That file's own header gave the reason it was not here: "QUOTE_SPEC
   §8.1 / §8.2 asks the ORCHESTRATOR to put them in '@/types/model'.
   That file is not this workflow's to edit, so they live here until
   it is — the same arrangement `viewDefs.ts` made when the store had
   no place for a ViewDef." The reason has expired, and this is the
   move. Nothing is widened: the definitions are the ones that file
   carried, verbatim, with their arguments.

   WHY IT MATTERS BEYOND TIDINESS. `ProjectExport` is declared in this
   contract and carries quotes; `io/envelope.ts` validates them at the
   door. Both were reaching across a feature boundary for the shape of
   the file format, which is exactly the kind of import the contract
   exists to make unnecessary.

   WHY EVERY FIELD ON A LINE IS A VALUE AND NEVER AN ID — the rule
   that shaped all of this, kept verbatim from the file it came from.

   A quote given to a customer on Monday must say the same number on
   Friday, and the price file may be reimported twice in between. So a
   line carries the NUMBER, the COLUMN it came from, the LEVEL it was
   read at and the join row's own facts, all by value. The ids it
   keeps are for exactly two things — "open this row on the sheet" and
   "make another quote like this one" — and for nothing that is drawn
   or totalled.
   ============================================================ */

/* ---------------------------------------------------------- */
/* A line — QUOTE_SPEC §8.1                                   */
/* ---------------------------------------------------------- */

/** Where a quote line's number came from, frozen at the moment it
 *  was picked. A quote renders from these and never reads a base
 *  table. */
export interface QuoteLine {
  id: string
  /** references — for "open this row", never for pricing */
  entityId: string
  rowId: string
  /** the join row that recorded the pick, when there was one */
  pairRowId?: string

  /* -- FROZEN ---------------------------------------------- */

  label: string
  qty: number
  /** null is a REAL state: "not priced here". Never rendered as 0.
   *  `showZeros="0"` on the workbook's own quote sheet makes an
   *  unmatched lookup render as BLANK, indistinguishable from a free
   *  inclusion. We render the opposite of blank. */
  unitPrice: number | null
  priceFieldId: string | null
  priceColumnName: string | null
  /** the level asked for, and the one actually used when this table
   *  had no column for it — so "why is this at cash?" is answerable.
   *  Production loses the level entirely on save and every trade
   *  quote's PDF prices the hull at cash. */
  levelKey: string
  levelResolved: string
  /** every rung this row carries, so a level change is frozen data */
  levels: FrozenLevel[]
  /** a rung a person chose FOR THIS LINE — a part switched to fitted,
   *  a hull switched to warranty. A quote-wide level change leaves a
   *  pinned line alone, because "fitted" is not an answer any trailer
   *  or motor has and a whole-quote switch must not silently unpick
   *  the one decision a person made by hand. */
  pinnedLevel?: boolean
  /** the seed's own Source cell, e.g. 'Boat Module!R282 KZ..LD' */
  sourceNote?: string
  /**
   * THE BUSINESS'S OWN CODE FOR THIS THING, frozen like everything
   * else a document prints — `HBR005`, `F90XB`, `TA1400S13SB`,
   * `GME-GX700WPK`. It is what a dealer orders by, reads down a
   * column and rings a supplier about, and until now a frozen line
   * could not say it: `sourceNote` is where the figure came FROM (a
   * cell in a workbook) and the label is prose. Two different facts.
   *
   * Absent where the table carries no such column, which is a real
   * state and never an empty string.
   */
  code?: string
  /** the join's own columns — rigging kit, prop, engine hole, slot.
   *  THIS is the five-way association; production loses it to a
   *  fuzzy name match that fails open. */
  pairFacts?: Array<{ label: string; value: string }>
  recommended?: boolean
  image?: ImageRef

  /** An override sits BESIDE the frozen figure, never over it — the
   *  same discipline as PairOrigin on a view and BlockedValue on a
   *  constraint: the reason is written at the moment of the decision,
   *  never reconstructed afterwards. */
  overridePrice?: number
  overrideReason?: string
}

/* ---------------------------------------------------------- */
/* Adjustments                                                */
/* ---------------------------------------------------------- */

/** What kind of row this is. NOT in §8.1, and argued: the four
 *  controls the spec names ("Add a discount", "Add a rebate", "Add a
 *  trade-in", "Add a line") differ in the SIGN of what a person
 *  types and in one printed qualifier. Without this the app either
 *  asks a salesperson to type a minus sign — and is silently wrong
 *  when they forget — or hardcodes the sign per button and forgets
 *  it on the document. */
export type AdjustmentKind = 'discount' | 'rebate' | 'tradeIn' | 'line'

/** A discount, a rebate, a trade-in, a free line. Always its own
 *  visible row, always signed, NEVER folded into a subtotal — the
 *  workbook's own `Dealer Discount Given` (AB169) is a visible line
 *  on the customer's page, and the moment it stops being one nobody
 *  can answer "why is this $3,000 cheaper than the list?". */
export interface QuoteAdjustment {
  id: string
  kind: AdjustmentKind
  /** typed by a person. Never pre-filled and never suggested. */
  label: string
  /** signed: negative for a discount, a rebate and a trade-in */
  amount: number
  note?: string
}

/* ---------------------------------------------------------- */
/* The quote                                                  */
/* ---------------------------------------------------------- */

/** `draft` — everything editable.
 *  `issued` — the moment it was given to a customer: read-only, and
 *  the only remaining action is "Make a new version", which copies
 *  it into a fresh draft carrying `supersedesId` so the conversation
 *  has a history and neither document was edited behind anyone's
 *  back. There is no third state and no expiry engine: production
 *  shipped a complete, correct expiry module whose `expiryAt` is
 *  written nowhere, so both gates that depend on it never fire. */
export type QuoteState = 'draft' | 'issued'

export interface QuoteSection {
  blockId: string
  tableId: string
  title: string
  lineIds: string[]
  /** How many rows the view page had picked for this block when the
   *  quote was minted. Frozen with everything else, so it still reads
   *  true if the page is re-curated afterwards.
   *
   *  It exists so an EMPTY section can explain itself. A block is a
   *  menu — four picked motors are four a hull may be sold with, and a
   *  rig has one — so when several are picked and none is starred, the
   *  choice is genuinely a person's. Without this number the section
   *  said "Nothing from Yamaha Outboards on this quote yet", which
   *  reads as "you configured nothing" when in fact four choices were
   *  waiting. Absent on quotes minted before this existed. */
  pickedCount?: number
  /** How many rows the view page would have offered for this block
   *  that were HELD BACK because they are no longer sold — a
   *  discontinued row, or every row of a retired table.
   *
   *  It exists for the same reason `pickedCount` does. A section that
   *  quietly offered five of eight is a section a salesperson stops
   *  trusting; the picker says the number in words instead. Frozen
   *  with everything else, so the sentence still reads true if the
   *  sheet changes afterwards.
   *
   *  NOTHING ABOUT IT REACHES AN EXISTING LINE. A line on the quote
   *  is a frozen copy and prints what it froze — this number only
   *  describes what the PICKER declined to offer. */
  heldCount?: number
}

/* ---------------------------------------------------------- */
/* Chapters — the walk, frozen with the document              */
/* ---------------------------------------------------------- */

/** The first chapter of every quote is the subject itself — the hull
 *  the whole document is about. It is a chapter because a person
 *  walking the sequence has to be able to look at what they are
 *  configuring; it is never a chapter with candidates, because there
 *  is exactly one boat on a quote for one boat. The same literal is
 *  the subject section's `blockId`. */
export const SUBJECT_CHAPTER = '__subject'

/** THE LAST STOP, AND IT IS NOT A SECTION — the question no table can
 *  carry: who is it for. Declared beside the first stop so the walk,
 *  the remembered place and the preview of the walk all name one id. */
export const HANDOVER_CHAPTER = '__handover'

/** One chapter of the configurator's walk, frozen on the quote.
 *
 *  CHAPTERS ARE THE QUOTE'S SECTIONS (docs/DECISIONS.md): a section
 *  chapter draws the section whose `blockId` it names, and the two
 *  chapters that draw no section — the subject and the handover —
 *  are the ends of the walk. The list is written at mint time, in the
 *  view's own order, and is never re-derived from the live view: a
 *  page re-curated on Tuesday must not reorder the walk a person is
 *  in the middle of on Monday, which is the same promise every price
 *  on the page keeps. A direction that needs a chapter with nothing
 *  behind it draws from the frozen specs and colourways, never by
 *  widening this shape. */
export interface QuoteChapter {
  /** SUBJECT_CHAPTER, a section's `blockId`, or HANDOVER_CHAPTER */
  id: string
  /** the heading, in the dealer's words — the table name for a section */
  title: string
  /** the table the chapter is about, where it is about one */
  tableId?: string
  kind?: TableKind
}

/* ---------------------------------------------------------- */
/* Events — the per-document audit                            */
/* ---------------------------------------------------------- */

/** What a command did to a document. A closed list, because an event
 *  nobody can name is an event nobody can search for, and because
 *  each kind is a sentence the audit prints in one voice. The names
 *  are the commands in `domain/quote/commands`, in the past tense. */
export type QuoteEventKind =
  /** the quote came into being, from a view, a subject row and a rung */
  | 'minted'
  /** a fresh draft was copied from another and supersedes it */
  | 'versioned'
  | 'line-added'
  | 'line-removed'
  | 'qty-set'
  /** the quote-wide rung moved */
  | 'level-set'
  /** one line was pinned to a rung of its own */
  | 'line-level-set'
  | 'override-set'
  | 'override-cleared'
  | 'adjustment-added'
  | 'adjustment-changed'
  | 'adjustment-removed'
  /** today's prices were re-read onto the lines a person had seen move */
  | 'prices-reread'
  /** the subject was re-rooted on a sibling row — the same boat in another finish */
  | 'subject-refinished'
  /** the customer block was written — typed, or frozen from the register */
  | 'customer-set'
  /** the register pointer was dropped and the name kept */
  | 'customer-unlinked'
  /** the validity sentence */
  | 'note-set'
  | 'tax-rate-set'
  | 'prepared-by-set'
  | 'issued'
  /** a step was undone; `undoes` names the event put back */
  | 'undone'
  /** an undone step was put back again */
  | 'redone'

/** A figure or a word, by value. What an event records is what the
 *  document printed before and after, never a pointer into it. */
export type QuoteChangeValue = string | number | boolean | null

/** One thing the event changed. `path` is dotted into the document —
 *  'levelKey', 'lines.<id>.qty', 'adjustments.<id>.amount',
 *  'customer.name', 'state' — and a line's or an adjustment's arrival
 *  or departure is its `label` moving between null and the word. */
export interface QuoteChange {
  path: string
  from: QuoteChangeValue
  to: QuoteChangeValue
}

/** THE PER-DOCUMENT AUDIT the original app had and this one owed.
 *  Written by `apply` in the quotes store the moment a command runs,
 *  beside the inverse it pushes, and kept on the quote so it travels
 *  with the document into an export and out again. Never edited and
 *  never trimmed: an issued quote's history is part of what was
 *  handed over. */
export interface QuoteEvent {
  id: string
  kind: QuoteEventKind
  /** when, ISO — from the injected clock, never `Date.now()` in a command */
  at: string
  /** the sentence the toast said, kept verbatim so the audit and the
   *  screen never disagree about what happened */
  said: string
  /** who, as the document prints it, when the session had a name */
  by?: string
  /** the line it touched, when it touched one */
  lineId?: string
  /** the adjustment it touched, when it touched one */
  adjustmentId?: string
  /** 'undone' / 'redone' only: the event this one reverses or restores */
  undoes?: string
  /** what changed, each by value */
  changed: QuoteChange[]
}

export interface QuoteDef {
  id: string
  /** the tenant key — see EntityDef.orgId */
  orgId: string
  reference: string
  state: QuoteState
  /** the page it was configured on, and the row it is for */
  viewId: string
  rootTableId: string
  rootRowId: string
  /** frozen: the subject's name and the specs printed under it */
  subjectLabel: string
  subjectSpecs: Array<{ label: string; value: string }>
  subjectImage?: ImageRef
  /** lines grouped the way the view page grouped them */
  sections: QuoteSection[]
  /** the walk, in order, frozen with the sections it draws — see QuoteChapter */
  chapters: QuoteChapter[]
  lines: QuoteLine[]
  adjustments: QuoteAdjustment[]
  /** everything that happened to this document, oldest first */
  events: QuoteEvent[]
  levelKey: string
  /** typed by a person, as a percentage. Absent = the document
   *  prints the inclusive sentence and no ex-tax line. NEVER
   *  defaulted: `1.1` hardcoded in seven production files while
   *  `organisation.gstPercentage` sat unread is the exact trap. */
  taxRate?: number
  /** WHAT THE DOCUMENT PRINTS, and the only thing it prints. Frozen
   *  the moment a customer is picked, exactly like a line's price:
   *  a name corrected in the register on Friday does not rewrite the
   *  quote handed over on Monday, and a customer deleted from the
   *  register does not blank the document they were given. */
  customer: FrozenCustomer
  /** WHO IT WAS ADDRESSED TO, AS A ROW — kept for exactly ONE thing:
   *  "show me this customer's other quotes".
   *
   *  It is not an exception to the rule at the top of this file, it
   *  is the FIRST of the two ids that rule already allows — the
   *  "open this row on the sheet" id — and it is the same shape, and
   *  the same promise, as `rootTableId` / `rootRowId` one field up:
   *  a pointer nothing drawn or totalled ever reads.
   *
   *  THE TEST THIS MUST KEEP PASSING: delete the customer from the
   *  register, or open the quote in a project where that register
   *  never existed, and the printed document is UNCHANGED — because
   *  every word on it came from `customer` above. If this field ever
   *  becomes something a renderer resolves, the quote has stopped
   *  being a photograph and Monday's number can move by Friday.
   *
   *  `tableId` travels with `rowId` because the register is an
   *  ordinary table with an ordinary id, and a project may be
   *  imported alongside another. Absent on every quote addressed to
   *  a name somebody typed, which stays a legitimate way to write a
   *  quote — a walk-in is not a filing error. */
  customerRef?: CustomerRef
  preparedBy?: string
  organisation?: string
  /** the validity sentence, typed. The workbook's own is a typed
   *  sentence on the sheet, not a computation. */
  note?: string
  supersedesId?: string
  issuedAt?: string
  createdAt: string
  updatedAt: string
}
