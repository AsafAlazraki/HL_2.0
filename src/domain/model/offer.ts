import type { CompareOp } from './rules'
import type { QuoteLine } from './quote'

/* ============================================================
   WHAT A QUOTE MAY TAKE NEXT — the vocabulary every chapter, every
   picker and the cascade sheet share.

   Three channels decide whether a row is offered: the view's own
   rule (the join and its clauses), the constraints in force (a
   ConstraintDef that blocks or warns), and fitment (the trailer's
   series banner and load floor, the motor's HP envelope). The old
   app answered each in its own words — a sentence composed in
   `stepOffer`, a `because` read off the solver, a `PartnerVerdict`
   with both marques — and the three could not be read by one
   surface. Here every channel writes the same closed record, a
   VERDICT, and the sentence is composed once, from the facts, at
   the surface that prints it.

   NOTHING IN A VERDICT IS INVENTED. Each member carries the numbers
   it turned on — the clause that failed and the two values it
   compared, the capacity and the load, the marque the banner names
   — read off the rows and the rules at the moment of the decision,
   the same discipline as `BlockedValue` on a constraint and
   `PairOrigin` on a join. Where a value cannot be read honestly the
   field is absent, never guessed at; and a `because` on a blocked
   or warned value is the rule's own clause, written by the person
   who wrote the rule, never composed here.
   ============================================================ */

/* ---------------------------------------------------------- */
/* Relations                                                   */
/* ---------------------------------------------------------- */

/** A relationship this table has with another, carried on a join.
 *  `otherId` is the related table, `joinId` the join recording which
 *  of its rows go with which. The read half of the view feature
 *  derives these from the tables alone (`domain/catalogue/views/
 *  relations`); the shape is declared here so a quote, a module and
 *  a fitment reading name a relation the same way. */
export interface Relation {
  otherId: string
  joinId: string
}

/** A relation this table really has, that a customer-facing surface
 *  refuses to draw — and WHICH of the two things is history, because
 *  the two are different sentences.
 *
 *    'table'  the related table itself is retired. "OBSOLETE Trailers
 *             — No Longer Available" is a shelf, not stock.
 *    'pairs'  the related table is live, but the join recording which
 *             of its rows go with this one is retired. "Surtees ×
 *             OBSOLETE Trailers" is a whole list of nothing but
 *             retired stock. */
export interface WithheldRelation extends Relation {
  reason: 'table' | 'pairs'
}

/* ---------------------------------------------------------- */
/* Verdicts                                                    */
/* ---------------------------------------------------------- */

/** One clause of a block's rule that this row did not satisfy, with
 *  the two values it compared where both could be read. `value` is
 *  the candidate's own cell and `against` the subject's, formatted
 *  the way the register prints them; either is absent where the
 *  clause hops through a link or evaluates a formula and there is no
 *  single cell to quote. */
export interface FailedClause {
  /** the column the clause reads, as the dealer named it */
  field: string
  op: CompareOp
  value?: string
  against?: string
}

/** Why a candidate stands where it does. A CLOSED UNION OF FACTS:
 *  every member names its channel in `kind` and carries the figures
 *  the decision turned on, so a surface can print the sentence and a
 *  test can assert the number. There is no member that carries a
 *  free reason, because a reason nobody can check is a reason nobody
 *  can trust. */
export type Verdict =
  /** the block's rule did not admit it; the clauses that failed, re-run
   *  one at a time so the ones named are the ones that rejected it */
  | { kind: 'outside-rule'; failed: FailedClause[] }
  /** a person took the pair out (`__origin` = 'removed'); the row stays
   *  and restoring it is one click */
  | { kind: 'removed' }
  /** no longer sold — the row's own `__discontinued` flag */
  | { kind: 'discontinued' }
  /** the whole table is history rather than stock */
  | { kind: 'retired-table'; tableId: string }
  /** the table is live but the join recording its pairs is retired */
  | { kind: 'retired-pairs'; joinId: string }
  /** a constraint that BLOCKS disagrees; `because` is its own clause */
  | { kind: 'blocked'; constraintId: string; because: string }
  /** a constraint that WARNS disagrees; the value stays */
  | { kind: 'warned'; constraintId: string; because: string }
  /** the partner's banner names another marque than the subject's;
   *  `subjectMarque` is null where the subject's marque is unnamed */
  | { kind: 'built-for-another'; bannerMarque: string; subjectMarque: string | null }
  /** the partner's rated capacity is under the subject's load — a
   *  warning, never a removal; `source` names the columns compared */
  | { kind: 'under-floor'; capacity: number; load: number; source: string }
  /** the load floor could not run on this subject; `why` is measured
   *  ("no weight-headed column in the band"), not composed */
  | { kind: 'floor-not-evaluable'; why: string }
  /** the motor's HP is outside the hull's envelope; a null bound is a
   *  bound the hull does not state */
  | { kind: 'outside-envelope'; hp: number; min: number | null; max: number | null }

/** Where a candidate stands, derived from its verdicts and never
 *  stored beside them: one fact that holds a row back outranks any
 *  number that merely flag it.
 *
 *    'offered'    nothing disagrees
 *    'flagged'    still offered; something warns
 *    'unchecked'  still offered; something could not be checked
 *    'outside'    reachable by search or the whole-catalogue switch,
 *                 and marked so a row the price file never paired
 *                 with this hull cannot look like one it did
 *    'held'       never offered on a customer-facing surface */
export type Standing = 'offered' | 'flagged' | 'unchecked' | 'outside' | 'held'

const HELD = new Set<Verdict['kind']>([
  'removed',
  'discontinued',
  'retired-table',
  'retired-pairs',
  'blocked',
])
const OUTSIDE = new Set<Verdict['kind']>(['outside-rule', 'built-for-another', 'outside-envelope'])
const FLAGGED = new Set<Verdict['kind']>(['warned', 'under-floor'])

/** The standing a set of verdicts adds up to. Held beats outside beats
 *  flagged beats unchecked; an empty list is offered. */
export function standingOf(verdicts: readonly Verdict[]): Standing {
  let standing: Standing = 'offered'
  for (const v of verdicts) {
    if (HELD.has(v.kind)) return 'held'
    if (OUTSIDE.has(v.kind)) standing = 'outside'
    else if (FLAGGED.has(v.kind) && standing !== 'outside') standing = 'flagged'
    else if (v.kind === 'floor-not-evaluable' && standing === 'offered') standing = 'unchecked'
  }
  return standing
}

/* ---------------------------------------------------------- */
/* Candidates                                                  */
/* ---------------------------------------------------------- */

/** One row a chapter may put on the quote, already frozen: picking it
 *  is one push, no second read.
 *
 *  THE CANDIDATE'S IDENTITY IS NOT ITS LINE'S. `line.id` is fresh on
 *  every offer, because a line's id is its identity ON A QUOTE — two
 *  picks of one motor are two lines. A surface that keys on it
 *  rebuilds its list on every keystroke and loses the focus on any
 *  card inside it (measured on a Highfield CL360: eight refusal rows
 *  tagged in the DOM, none survived one pick). So `key` is the
 *  pairing — the join row id where there is a join, the row id where
 *  there is not — which is also what "is this one already on the
 *  quote" is keyed on, because those are the same question. */
export interface Candidate {
  key: string
  /** the line a pick would write, minted at offer time at the quote's rung */
  line: QuoteLine
  /** the line on the quote this candidate is already on, if any */
  alreadyLineId?: string
  standing: Standing
  /** every fact about it, in the order the channels spoke */
  verdicts: Verdict[]
}

/* ---------------------------------------------------------- */
/* The cascade                                                 */
/* ---------------------------------------------------------- */

/** One line the decision adds, removes or holds.
 *
 *  `amount` is `number | null` and `null` is a real state — "there is
 *  no figure here" — never rendered as zero.
 *
 *  THERE IS NO `standard` FLAG ANY MORE (2026-09-24). It was declared
 *  for "a figure of zero because the thing is standard equipment",
 *  Porsche's word, and the price file carries no such fact: the one
 *  place that ever set it inferred it from a missing price column, and
 *  the cascade then told a dealer "Standard" for a rigging kit the
 *  customer's paper prints "Not priced on this quote"
 *  (built-critique-m2-close-2.md blocker 3). What a line reads as —
 *  charged, included, not priced — is the paper's own derivation
 *  (`readDocument`, read through `linesAsRead`), never a flag here. */
export interface CascadeRow {
  id: string
  label: string
  amount: number | null
  /** why this row is where it is. A sentence, always, read off the
   *  channel that put it here — never composed from a template that
   *  has lost the numbers. '' only where the row needs no reason
   *  (a plain addition the person asked for). */
  because: string
  /** the facts the sentence was composed from, where a channel wrote
   *  them; absent on a plain addition */
  verdicts?: Verdict[]
}

/** Something the person could take instead, priced.
 *
 *  The cheapest is pre-selected, which is the half of Porsche's
 *  design the teardown found they do NOT ship on the removal shape —
 *  their sheet offers nothing at all. */
export interface Alternative {
  id: string
  label: string
  amount: number | null
  /** what makes this one different, in the dealer's own words */
  note: string
}

/** The reason the sheet is open, and the arithmetic of accepting it.
 *
 *  ONE SHAPE FOR "THIS CHOICE CHANGES OTHER THINGS", whatever channel
 *  noticed it — a level move, a rule removing a value, a fitment
 *  rejection — and it is a ROUTE (`/quote/$id/cascade?fix=&from=`),
 *  so Back, refresh and a shared link behave. `id` is the `fix` the
 *  route names; `from` is the chapter it was raised in and lives in
 *  the URL, not here.
 *
 *  Taken from Porsche, driven live 2026-09-10: the two-card shape
 *  (what this adds / what this removes), each card carrying its own
 *  price chip; the committed total frozen while the sheet is open;
 *  and a footer that prices THE DECISION — the option plus everything
 *  it drags in — rather than the thing that was clicked. Beaten: every
 *  removed row on their sheet reads "not compatible with your
 *  selection", naming neither the selection nor what about it. WE
 *  HOLD THE REASON: every `because` below is read off measured data. */
export interface Cascade {
  id: string
  /** one line, present tense, naming what is happening */
  title: string
  /** one sentence under it, saying why. Never a paragraph. */
  subtitle: string
  /** what the person asked for */
  asked: { label: string; amount: number | null; image?: string }
  /** what accepting would add */
  added: CascadeRow[]
  /** what accepting would take off, each saying why */
  removed: CascadeRow[]
  /** what stays but could not be checked — PCPartPicker's disclaimer,
   *  per subject rather than per page. Empty is the common case. */
  unchecked: CascadeRow[]
  /** priced alternatives; `alternatives[0]` is the cheapest and is
   *  what the sheet pre-selects */
  alternatives: Alternative[]
  /** the committed total. Does not move while the sheet is open. */
  from: number
  /** what the total becomes on Accept */
  to: number
  /** shown, never hidden */
  delta: number
  /** named, never a bare OK */
  accept: string
}
