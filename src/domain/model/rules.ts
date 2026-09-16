import type { CellValue } from './fields'
import type { TableKind, XY } from './tables'

/* ---------------------------------------------------------- */
/* Business rules (milestone 2 — shapes are stable now so     */
/* exports stay forward-compatible)                           */
/* ---------------------------------------------------------- */

/** Where a value comes from. `viaFieldId` hops through a reference field
 *  first, so a Deal rule can read [Boat → Price] — one hop only, which keeps
 *  the picker honest and evaluation cheap. */
export interface FieldPath {
  viaFieldId?: string
  fieldId: string
}

export type ValueExpr =
  | { kind: 'literal'; value: CellValue }
  | { kind: 'field'; path: FieldPath }
  | { kind: 'formula'; src: string } /* evaluated by @/domain/rules/formula */

export type CompareOp =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'isEmpty'
  | 'notEmpty'
  | 'isTrue'
  | 'isFalse'

/** Ops that take no right-hand side. */
export const UNARY_OPS: CompareOp[] = ['isEmpty', 'notEmpty', 'isTrue', 'isFalse']

export interface Clause {
  id: string
  left: FieldPath
  op: CompareOp
  /** absent for unary ops */
  right?: ValueExpr
}

export interface ClauseGroup {
  combinator: 'AND' | 'OR'
  clauses: Clause[]
}

/** One route out of a condition node. `id` doubles as the React Flow source
 *  handle id; every condition also has an implicit 'else' handle. */
export interface ConditionBranch {
  id: string
  label: string
  group: ClauseGroup
}

export const ELSE_HANDLE = 'else' as const
export const OUT_HANDLE = 'out' as const
export const LOOP_BODY_HANDLE = 'body' as const
export const LOOP_NEXT_HANDLE = 'next' as const

export type LoopSource =
  | { kind: 'entity'; entityId: string } /* every row of an entity */
  | { kind: 'linked'; viaFieldId: string } /* rows pointing here via a link */

export type ActionOp =
  | { op: 'set'; fieldId: string; value: ValueExpr }
  | { op: 'create'; entityId: string; values: Record<string, ValueExpr> }
  | { op: 'flag'; label: string; tone: 'info' | 'warn' | 'danger' }
  /** Write the current (source, match) pair into a join entity — this is how
   *  a fitment rule persists "this motor fits this boat". */
  | {
      op: 'link'
      joinEntityId: string
      /** reference field on the join pointing back at the SOURCE row */
      sourceFieldId: string
      /** reference field on the join pointing at the MATCHED row */
      matchFieldId: string
      /** extra columns written on the join row (e.g. a fitment note) */
      values?: Record<string, ValueExpr>
    }

/** Which row a FieldPath resolves against inside a match/output context.
 *  'source' = the row the rule is currently working (e.g. the Boat).
 *  'match'  = the candidate row being tested or matched (e.g. the Motor). */
export type RowScope = 'source' | 'match'

/** A column in a combined view — names both the row it comes from and the
 *  field on it, so a view can show Boat.Name beside Motor.HP. */
export interface ViewColumn {
  scope: RowScope
  fieldId: string
  /** optional override for the column header */
  label?: string
}

export type RuleNodeKind =
  | 'start' /* entry — walks the rows of the rule's root entity */
  | 'match' /* find rows of another entity that FIT this one */
  | 'condition' /* if / else-if / else — one out-handle per branch + else */
  | 'filter' /* narrow the working set */
  | 'find' /* follow a link field to a single related row */
  | 'loop' /* for-each; 'body' runs per item, 'next' continues after */
  | 'action' /* set / create / flag / link */
  | 'output' /* emit into a named result set */

export interface RuleNodeConfigMap {
  start: Record<string, never>
  /** The compatibility primitive. For each SOURCE row, scan every row of
   *  `targetEntityId` and keep the ones satisfying `group`.
   *
   *  Scope convention inside a match: a clause's `left` FieldPath resolves
   *  against the CANDIDATE row (the motor), and a `{kind:'field'}` right-hand
   *  side resolves against the SOURCE row (the boat). So "motors that fit
   *  this boat" is two clauses:
   *      left [HP]  gte  right field [Min HP]
   *      left [HP]  lte  right field [Max HP]
   *  `emptyBehavior` decides what happens when nothing fits: 'skip' drops the
   *  source row, 'passThrough' carries it on with no match attached. */
  match: {
    targetEntityId: string
    group: ClauseGroup
    emptyBehavior: 'skip' | 'passThrough'
  }
  condition: { branches: ConditionBranch[] }
  filter: { group: ClauseGroup }
  find: { viaFieldId: string }
  loop: { source: LoopSource }
  action: { action: ActionOp }
  /** Columns may draw from either side of the pair, which is what makes this
   *  a COMBINED view (Boat.Name beside Motor.Model and Motor.HP). */
  output: { label: string; columns?: ViewColumn[] }
}

/** Discriminated on `kind` — `config` is always the matching shape. */
export type RuleNode = {
  [K in RuleNodeKind]: {
    id: string
    kind: K
    position: XY
    config: RuleNodeConfigMap[K]
  }
}[RuleNodeKind]

/* ---------------------------------------------------------- */
/* Constraints — business rules as editable ENGLISH SENTENCES  */
/*                                                            */
/* A rule reads:                                              */
/*   "When Water is Salt, Prop material must be Stainless."   */
/* and every underlined word is a control. There is no second */
/* representation — the sentence IS the editor. This replaces  */
/* the flow-chart builder on the default path; RuleDef stays   */
/* for the procedural flows that genuinely need a graph.       */
/* See MOCKUP_FINDINGS.md.                                    */
/* ---------------------------------------------------------- */

export type ConstraintKind =
  /** When <if>, then <then> must hold. Runs both ways — the
   *  contrapositive is free, which is what makes picking a motor first
   *  narrow the boat list. */
  | 'implies'
  /** These can never be chosen together. */
  | 'excludes'
  /** Choosing <if> makes <then> mandatory rather than merely allowed. */
  | 'requires'
  /** Only these combinations are approved — the curated whitelist. This
   *  is our join table wearing a rule's clothes, and it is why a curated
   *  menu can outrank a computed range. */
  | 'table'

export interface ConstraintDef {
  id: string
  /** the tenant key — see EntityDef.orgId. The old registry was keyed
   *  by organisation from outside the record; the record now says
   *  whose it is itself, and a Dexie table holds it. */
  orgId: string
  kind: ConstraintKind
  /** the left-hand side of the sentence */
  if: ClauseGroup
  /** the right-hand side; absent for 'table', which uses `combinations` */
  then?: ClauseGroup
  /** approved combinations for kind 'table': fieldId -> allowed value */
  combinations?: Array<Record<string, CellValue>>

  /** A short lower-case clause written to read after "because…" —
   *  e.g. "the hull is not rated for that much power".
   *  NOT the rule name and NOT the expression — this is what a person
   *  sees when an option is unavailable, so it has to be human.
   *
   *  It must state a REASON THAT IS TRUE. The example that used to sit
   *  in this comment was invented, and invented reasons propagate: it
   *  reached the UI as placeholder text and read, on screen, as a rule
   *  the business had written. Nothing here is decorative. */
  because: string
  /** optional longer explanation for the why panel */
  why?: string

  /** WHAT THIS RULE IS ALLOWED TO DO WHEN IT DISAGREES WITH A ROW.
   *
   *  'block' — the value leaves the picker. This is what every rule did
   *            before this field existed, and it stays the default so
   *            nothing already written changes meaning.
   *  'warn'  — the value STAYS and is annotated with `because`. Nothing
   *            is pruned.
   *
   *  IT EXISTS BECAUSE A MEASURED PATTERN IS NOT A STATED RULE. The
   *  discovery engine reads a price file and proposes the rules it
   *  already follows; every one of those is OBSERVED — read off values,
   *  not off a formula — and an observed pattern can be a coincidence.
   *  Pruning on a coincidence deletes real business, so `workbookRules`
   *  has always refused to build an observed seed with a kind that
   *  prunes. That refusal was enforced by keeping discovered patterns
   *  out of this store altogether, in a register of their own.
   *
   *  One field lets them come home. A discovered rule is a rule — it can
   *  be listed, edited, turned off and reasoned about like any other —
   *  and it carries, in the type, the one thing that must never be true
   *  of it: that it may quietly remove something a dealer sells.
   *
   *  ANYTHING THAT PRUNES MUST READ THIS. Absent means 'block', for the
   *  rules written before it. */
  severity?: 'block' | 'warn'

  /** Turning a rule OFF beats deleting it: the experiment is reversible
   *  and the authoring survives. */
  enabled: boolean
  /** true once a person has changed it — surfaced as an "edited" tag */
  edited?: boolean
  /** where it came from: 'authored' by a user, or an import/preset */
  source?: string
  /** higher wins when two constraints disagree */
  priority?: number
  createdAt: string
  updatedAt: string
}

/** Why a value is unavailable. Written at the MOMENT of removal rather
 *  than reconstructed afterwards, so a blocked value always knows its
 *  reason — the same discipline as PairOrigin on a view. */
export interface BlockedValue {
  constraintId: string
  /** the constraint's `because` clause, ready to print after "because" */
  because: string
}

/** What the configurator knows after propagation: for every field, which
 *  values are still possible, which are blocked and why. */
export interface ConfigureState {
  /** fieldId -> the values still available */
  domains: Record<string, CellValue[]>
  /** fieldId -> value -> why it went */
  blocked: Record<string, Record<string, BlockedValue>>
  /** fieldId -> the single remaining value, when settled */
  settled: Record<string, CellValue>
  /** constraints that fired during this solve */
  fired: string[]
  /** constraints that contradict the current choices */
  problems: Array<{ constraintId: string; message: string }>
}

/* ============================================================
   DISCOVERED RULES — what a person decided about a measured
   pattern, with the measurement that earned the decision.

   The discovery engine reads a price file and proposes the rules
   it already follows. Every one is OBSERVED — read off values, not
   off a formula — so a decision about one is stored HERE, as a
   record of its own, and a kept one is adopted into the rule
   store as a `ConstraintDef` carrying severity 'warn'. This
   register is the decision of record: it holds the figures the
   person agreed to, it holds dismissals (which are not rules at
   all), and it holds every kept pattern this app cannot yet state
   as a sentence, with the blocker in words.

   THE FIGURES ARE COPIED IN RATHER THAN REFERENCED, on purpose: a
   person kept this sentence when it read 626 of 626, and a later
   run over an edited price file may read differently. Keeping
   both means the screen can say so instead of quietly restating a
   new number as though it were the one that was agreed to.

   The shapes below are structurally the discovery engine's own
   (`CandidateShape`, `Enforcement`, `BoundColumn`,
   `CandidateBinding` in domain/rules/constraints/discover) so a
   candidate maps onto a record without a translation layer; they
   are declared here because a persisted record belongs to the
   contract and the engine belongs to the rules.
   ============================================================ */

export type DiscoveryDecision = 'kept' | 'dismissed'

export type DiscoveredShape =
  'categorical-selector' | 'numeric-bound' | 'join-key' | 'functional-dependency' | 'uniqueness'

/** What may be DONE with an observed pattern. There is no 'filter'
 *  member, and adding one would be the failure the discovery engine
 *  exists to avoid: a measured pattern may never prune. */
export type DiscoveredEnforcement = 'warn' | 'report'

/** One column, named the way the rest of the app names columns.
 *  `conceptKey` is `kind::normalised name`, the key the column-concept
 *  index mints, so a measured column resolves back to something a
 *  sentence may be pointed at without parsing an id. */
export interface DiscoveredColumn {
  kind: TableKind
  /** the column's own name, as the price file writes it */
  name: string
  /** `kind::normalised name` */
  conceptKey: string
  /** how many tables of the kind carry it */
  tables: number
}

/** The two columns a finding binds. `far` is the side being CHOSEN
 *  FROM — the catalogue the finding narrows; `near` is the side being
 *  chosen FOR, and is null on the categorical selector, whose near
 *  side is read from its own table's name. */
export interface DiscoveredBinding {
  far: DiscoveredColumn
  near: DiscoveredColumn | null
}

/**
 * A DECISION, WITH THE MEASUREMENT THAT EARNED IT.
 */
export interface DiscoveredRule {
  /** the candidate's stable id — a re-run of the same project
   *  produces the same one, which is what makes a decision stick */
  id: string
  /** the tenant key — see EntityDef.orgId */
  orgId: string
  decision: DiscoveryDecision
  shape: DiscoveredShape
  relationship: string
  statement: string
  because: string
  source: string
  /** ALWAYS 'observed'. Nothing here was stated by the business. */
  evidence: 'observed'
  /** never prunes — there is no third member of `DiscoveredEnforcement` */
  enforcement: DiscoveredEnforcement
  /** THE TWO COLUMNS THE FINDING BINDS, so the decision can be turned
   *  into a rule that points at something. A decision stored before
   *  adoption existed has no `binds`, and adoption answers it with a
   *  blocker rather than a guess — which is why this is optional and
   *  why nothing here back-fills it. */
  binds?: DiscoveredBinding | null
  hits: number
  tested: number
  /** mean share of the catalogue left standing, where the shape has
   *  one; null where it narrows nothing */
  meanLeft: number | null
  catalogue: number | null
  counterExampleTotal: number
  decidedAt: string
}

/* ---------------------------------------------------------- */
/* Flow rules — the procedural graph                          */
/* ---------------------------------------------------------- */

export interface RuleEdge {
  id: string
  source: string
  target: string
  /** condition → a branch id or ELSE_HANDLE; loop → 'body' | 'next';
   *  everything else → 'out' */
  sourceHandle?: string
}

/** Default config for a freshly dropped node of each kind.
 *  Built fresh on every call — two nodes must never share a clauses array. */
export function defaultRuleNodeConfig<K extends RuleNodeKind>(kind: K): RuleNodeConfigMap[K] {
  const defaults: { [P in RuleNodeKind]: RuleNodeConfigMap[P] } = {
    start: {},
    match: {
      targetEntityId: '',
      group: { combinator: 'AND', clauses: [] },
      emptyBehavior: 'skip',
    },
    condition: { branches: [] },
    filter: { group: { combinator: 'AND', clauses: [] } },
    find: { viaFieldId: '' },
    loop: { source: { kind: 'entity', entityId: '' } },
    action: { action: { op: 'flag', label: 'Flagged', tone: 'info' } },
    output: { label: 'Result' },
  }
  return defaults[kind]
}

export interface RuleNodeKindMeta {
  label: string
  tag: string
  cssVar: string
  blurb: string
}

/** Palette metadata — label, mono tag, ink, and the one-line explanation
 *  shown in the palette and the node inspector. */
export const RULE_NODE_KINDS: Record<RuleNodeKind, RuleNodeKindMeta> = {
  start: {
    label: 'Start',
    tag: 'RUN',
    cssVar: 'var(--accent-graphite)',
    blurb: 'Where the rule begins — walks each row of the chosen table.',
  },
  match: {
    label: 'Match',
    tag: 'FIT',
    cssVar: 'var(--accent-carmine)',
    blurb:
      'Find the rows of another table that fit this one — a boat’s min/max HP against every motor’s HP.',
  },
  condition: {
    label: 'Condition',
    tag: 'IF',
    cssVar: 'var(--accent-ochre)',
    blurb: 'Route rows down different paths depending on what they contain.',
  },
  filter: {
    label: 'Filter',
    tag: 'WHR',
    cssVar: 'var(--accent-teal)',
    blurb: 'Keep only the rows that match — the rest stop here.',
  },
  find: {
    label: 'Find linked',
    tag: 'LNK',
    cssVar: 'var(--accent-blue)',
    blurb: 'Follow a link to the related row and carry it forward.',
  },
  loop: {
    label: 'For each',
    tag: 'LOOP',
    cssVar: 'var(--accent-violet)',
    blurb: 'Repeat the body once per row in a collection.',
  },
  action: {
    label: 'Action',
    tag: 'DO',
    cssVar: 'var(--accent-viridian)',
    blurb: 'Set a value, create a row, or flag what you found.',
  },
  output: {
    label: 'Output',
    tag: 'OUT',
    cssVar: 'var(--accent-carmine)',
    blurb: 'Collect the row into a named result set you can view as a table.',
  },
}

export interface RuleDef {
  id: string
  /** the tenant key — see EntityDef.orgId */
  orgId: string
  name: string
  description?: string
  /** the entity this rule runs against */
  rootEntityId: string
  enabled: boolean
  nodes: RuleNode[]
  edges: RuleEdge[]
  createdAt: string
  updatedAt: string
}
