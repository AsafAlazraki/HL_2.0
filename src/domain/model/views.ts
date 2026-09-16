import type { ClauseGroup } from './rules'

/* ---------------------------------------------------------- */
/* Views — the configurable page (see VIEW_SPEC.md)           */
/* ---------------------------------------------------------- */

/** One related table shown on a view — "the motors that fit this boat".
 *
 *  RULE vs FILTER is the distinction that keeps this understandable, and
 *  they must never be conflated:
 *    rule   = what is RELATED       (structural; lives on the join)
 *    filter = what is SHOWN now     (cosmetic; lives on the view) */
export interface ViewBlock {
  id: string
  /** the related table */
  tableId: string
  /** the join table carrying the pairs, when the relationship is curated */
  joinTableId?: string
  /** what is related. Absent = show everything in `tableId`. */
  rule?: ClauseGroup
  /** what is shown right now — never changes what is related */
  filters?: ColumnFilter[]
  /** which columns to show, in order; absent = a sensible few */
  columns?: string[]
  /** nesting: accessories under motors. Max depth 3 including the root. */
  children?: ViewBlock[]
}

/** A cosmetic narrowing of what a block displays. Mirrors the table view's
 *  own filter vocabulary so the same control serves both. */
export type ColumnFilter =
  | { kind: 'values'; fieldId: string; selected: string[] }
  | { kind: 'contains'; fieldId: string; text: string }

export interface ViewDef {
  id: string
  /** the tenant key — see EntityDef.orgId. A view is persisted with the
   *  catalogue now; the old shadow registry that lost it on reload is
   *  not carried across. */
  orgId: string
  name: string
  /** the table whose rows this view is "for" — usually Boats */
  rootTableId: string
  blocks: ViewBlock[]
  createdAt: string
  updatedAt: string
}
