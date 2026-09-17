/* ============================================================
   Rules engine — value resolution, comparison, clause evaluation.

   Everything here is row-level: given a row (or a pair of rows) it
   resolves a FieldPath / ValueExpr and decides whether a clause holds.
   Nothing here knows about the graph.

   SCOPE CONVENTION (the heart of the feature — see RULES_SPEC.md):
   inside a MATCH node a clause's `left` resolves against the CANDIDATE
   row (the motor) and a `{kind:'field'}` right-hand side resolves
   against the SOURCE row (the boat). Outside a match — filter,
   condition, action values — there is no candidate scan, so the sides
   resolve by FIELD OWNERSHIP: the row whose entity actually owns the
   field id wins, preferring the row named by the scope. Field ids are
   unique per entity, so that is unambiguous.

   Never throws. A missing entity, a deleted field, a dangling link or a
   broken formula all resolve to `null` (with a deduped warning when the
   cause is a schema mistake rather than ordinary missing data).

   THE COMPARISON ITSELF NOW LIVES IN '@/domain/compare', because the
   solver compares the same values and there may be only one answer to
   "is 8 less than 10 HP". It is re-exported here so every caller that
   reached for `compareValues` beside the engine still finds it.
   ============================================================ */

import {
  RULE_NODE_KINDS,
  UNARY_OPS,
  rowLabel,
  type CellValue,
  type Clause,
  type ClauseGroup,
  type EntityDef,
  type FieldDef,
  type FieldPath,
  type RowData,
  type RuleNode,
  type ValueExpr,
} from '@/domain/model'
import {
  compileFormula,
  evalExpr,
  type EvalContext,
  type EvalEnv,
  type Expr,
  evaluateRowValues,
} from '@/domain/rules/formula'
import { asBoolean, compareValues, isEmptyValue } from '@/domain/compare'
import type { RuleRunContext } from './types'

export { compareValues, isEmptyValue } from '@/domain/compare'
export type { CompareOutcome } from '@/domain/compare'

/* ---------------------------------------------------------- */
/* Small shared shapes                                        */
/* ---------------------------------------------------------- */

/** A row plus the entity it belongs to — the engine's unit of "a row". */
export interface RowRef {
  entityId: string
  row: RowData
}

/** Where a warning came from. `label` is the human node name. */
export interface NodeSite {
  nodeId?: string
  label: string
}

export interface ClauseScopes {
  /** row a clause's `left` path resolves against */
  left: RowRef | undefined
  /** row a `{kind:'field'}` right-hand side resolves against */
  right: RowRef | undefined
  /** false inside a match (strict spec convention); true elsewhere,
   *  where the row that owns the field id wins */
  byOwnership: boolean
}

/* ---------------------------------------------------------- */
/* Node labels — every warning names its node                 */
/* ---------------------------------------------------------- */

export function nodeLabel(node: RuleNode, entities: Record<string, EntityDef>): string {
  switch (node.kind) {
    case 'match': {
      const target = entities[node.config.targetEntityId]
      return target ? `Match "${target.name}"` : 'Match'
    }
    case 'output': {
      const label = (node.config.label ?? '').trim()
      return label ? `Output "${label}"` : 'Output'
    }
    case 'loop': {
      const src = node.config.source
      if (src && src.kind === 'entity') {
        const e = entities[src.entityId]
        if (e) return `For each "${e.name}"`
      }
      return 'For each'
    }
    case 'action':
      return `Action (${node.config.action?.op ?? 'unconfigured'})`
    default:
      return RULE_NODE_KINDS[node.kind]?.label ?? node.kind
  }
}

/* ---------------------------------------------------------- */
/* Engine — indexes, caches, resolution                       */
/* ---------------------------------------------------------- */

export interface RuleEngine {
  readonly warnings: string[]
  readonly nodeWarnings: Record<string, string[]>
  /** deduped by (node, message) so a per-row mistake warns once */
  warn(site: NodeSite, message: string): void
  entity(entityId: string | undefined): EntityDef | undefined
  rows(entityId: string | undefined): RowData[]
  row(entityId: string | undefined, rowId: string): RowData | undefined
  /** the entity that declares this field id (ids are unique per entity) */
  ownerOf(fieldId: string | undefined): EntityDef | undefined
  fieldOf(entityId: string | undefined, fieldId: string | undefined): FieldDef | undefined
  /** all values of a row, formula fields COMPUTED (memoized) */
  valuesOf(ref: RowRef | undefined): Record<string, CellValue>
  readField(ref: RowRef | undefined, fieldId: string, site: NodeSite): CellValue
  resolveFieldPath(ref: RowRef | undefined, path: FieldPath, site: NodeSite): CellValue
  resolveValue(expr: ValueExpr | undefined, ref: RowRef | undefined, site: NodeSite): CellValue
  evalGroup(group: ClauseGroup | undefined, scopes: ClauseScopes, site: NodeSite): boolean
  /** row whose entity owns `fieldId`, preferring `preferred` */
  pickOwner(
    fieldId: string | undefined,
    preferred: RowRef | undefined,
    other: RowRef | undefined,
  ): RowRef | undefined
  label(ref: RowRef | undefined): string
}

const firstHop = (path: FieldPath | undefined): string | undefined =>
  path ? (path.viaFieldId ?? path.fieldId) : undefined

export function createEngine(ctx: RuleRunContext): RuleEngine {
  const entities = ctx?.entities ?? {}
  const rowsByEntity = ctx?.rowsByEntity ?? {}

  const warnings: string[] = []
  const nodeWarnings: Record<string, string[]> = {}
  const seenWarnings = new Set<string>()

  const rowIndexes = new Map<string, Map<string, RowData>>()
  const valuesCache = new Map<string, Record<string, CellValue>>()
  const nameIndexes = new Map<string, Map<string, FieldDef>>()
  const astCache = new Map<string, Expr | null>()
  let fieldOwners: Map<string, EntityDef> | undefined

  const entity = (entityId: string | undefined): EntityDef | undefined =>
    entityId ? entities[entityId] : undefined

  const rows = (entityId: string | undefined): RowData[] => {
    if (!entityId) return []
    const list = rowsByEntity[entityId]
    return Array.isArray(list) ? list : []
  }

  const rowIndexOf = (entityId: string): Map<string, RowData> => {
    let idx = rowIndexes.get(entityId)
    if (!idx) {
      idx = new Map()
      for (const r of rows(entityId)) if (r && r.id) idx.set(r.id, r)
      rowIndexes.set(entityId, idx)
    }
    return idx
  }

  const row = (entityId: string | undefined, rowId: string): RowData | undefined => {
    if (!entityId || !rowId) return undefined
    return rowIndexOf(entityId).get(rowId)
  }

  const ownerOf = (fieldId: string | undefined): EntityDef | undefined => {
    if (!fieldId) return undefined
    if (!fieldOwners) {
      fieldOwners = new Map()
      for (const e of Object.values(entities)) {
        for (const f of e?.fields ?? []) {
          if (!fieldOwners.has(f.id)) fieldOwners.set(f.id, e)
        }
      }
    }
    return fieldOwners.get(fieldId)
  }

  const fieldOf = (
    entityId: string | undefined,
    fieldId: string | undefined,
  ): FieldDef | undefined => {
    if (!fieldId) return undefined
    const e = entity(entityId)
    return e?.fields?.find((f) => f.id === fieldId)
  }

  const warn = (site: NodeSite, message: string): void => {
    const key = `${site.nodeId ?? ''}|${message}`
    if (seenWarnings.has(key)) return
    seenWarnings.add(key)
    warnings.push(message)
    if (site.nodeId) {
      const bucket = nodeWarnings[site.nodeId] ?? (nodeWarnings[site.nodeId] = [])
      bucket.push(message)
    }
  }

  const evalCtx: EvalContext = {
    lookupRow: (entityId, rowId) => row(entityId, rowId),
    lookupEntity: (entityId) => entity(entityId),
  }

  const valuesOf = (ref: RowRef | undefined): Record<string, CellValue> => {
    if (!ref || !ref.row) return {}
    const key = `${ref.entityId}\u0000${ref.row.id}`
    let values = valuesCache.get(key)
    if (!values) {
      const e = entity(ref.entityId)
      try {
        values = e ? evaluateRowValues(e, ref.row, evalCtx) : { ...ref.row.values }
      } catch {
        /* spreading a missing value yields {} on its own — the `?? {}`
           that stood here read as a guard against something that
           cannot happen */
        values = { ...ref.row.values }
      }
      valuesCache.set(key, values)
    }
    return values
  }

  const label = (ref: RowRef | undefined): string => {
    if (!ref || !ref.row) return '(none)'
    const e = entity(ref.entityId)
    if (!e) return ref.row.id
    try {
      return rowLabel(e, ref.row)
    } catch {
      return ref.row.id
    }
  }

  const readField = (ref: RowRef | undefined, fieldId: string, site: NodeSite): CellValue => {
    if (!ref) return null
    const e = entity(ref.entityId)
    if (!e) return null
    const f = fieldOf(ref.entityId, fieldId)
    if (!f) {
      warn(site, `${site.label}: reads a field that is not on "${e.name}" — read as empty.`)
      return null
    }
    const v = valuesOf(ref)[fieldId]
    return v === undefined ? null : v
  }

  /** One-hop link traversal, then a plain field read. A missing hop
   *  field is a schema mistake (warn); a blank or dangling link is
   *  ordinary data (silent null). */
  const resolveFieldPath = (
    ref: RowRef | undefined,
    path: FieldPath | undefined,
    site: NodeSite,
  ): CellValue => {
    if (!ref || !path || !path.fieldId) return null
    const e = entity(ref.entityId)
    if (!e) return null

    if (path.viaFieldId) {
      const via = fieldOf(ref.entityId, path.viaFieldId)
      if (!via) {
        warn(site, `${site.label}: follows a link field that no longer exists on "${e.name}".`)
        return null
      }
      if (via.type !== 'reference' || !via.refEntityId) {
        warn(site, `${site.label}: "${via.name}" is not a link field, so it cannot be followed.`)
        return null
      }
      const raw = valuesOf(ref)[via.id]
      if (raw === null || raw === undefined || raw === '') return null
      const linked = row(via.refEntityId, String(raw))
      if (!linked) return null /* dangling link — ordinary data */
      return readField({ entityId: via.refEntityId, row: linked }, path.fieldId, site)
    }

    return readField(ref, path.fieldId, site)
  }

  const nameIndexOf = (e: EntityDef): Map<string, FieldDef> => {
    let idx = nameIndexes.get(e.id)
    if (!idx) {
      idx = new Map()
      for (const f of e.fields ?? []) {
        const key = f.name.trim().toLowerCase()
        if (!idx.has(key)) idx.set(key, f)
      }
      nameIndexes.set(e.id, idx)
    }
    return idx
  }

  const astOf = (src: string): Expr | null => {
    if (astCache.has(src)) return astCache.get(src) ?? null
    let ast: Expr | null = null
    try {
      ast = compileFormula(src).ast
    } catch {
      ast = null
    }
    astCache.set(src, ast)
    return ast
  }

  /** Evaluate an inline formula against the row in whose scope it
   *  appears. A parse or runtime failure is null + one warning. */
  const evalFormulaSrc = (
    src: string | undefined,
    ref: RowRef | undefined,
    site: NodeSite,
  ): CellValue => {
    if (!src || !src.trim()) {
      warn(site, `${site.label}: has an empty calculation — read as empty.`)
      return null
    }
    if (!ref) return null
    const e = entity(ref.entityId)
    if (!e) return null
    const ast = astOf(src)
    if (!ast) {
      warn(
        site,
        `${site.label}: the calculation "${src.trim()}" could not be read — treated as empty.`,
      )
      return null
    }
    const values = valuesOf(ref)
    const byName = nameIndexOf(e)
    const env: EvalEnv = {
      resolveField: (name: string): CellValue => {
        const f = byName.get(name.trim().toLowerCase())
        if (!f) throw new Error(`Unknown field [${name}]`)
        const v = values[f.id] ?? null
        if (f.type === 'reference') {
          if (v === null || v === '') return null
          const linked = row(f.refEntityId, String(v))
          const target = entity(f.refEntityId)
          return target && linked ? rowLabel(target, linked) : String(v)
        }
        return v
      },
    }
    try {
      return evalExpr(ast, env)
    } catch {
      warn(
        site,
        `${site.label}: the calculation "${src.trim()}" could not be worked out on "${e.name}" — treated as empty.`,
      )
      return null
    }
  }

  const resolveValue = (
    expr: ValueExpr | undefined,
    ref: RowRef | undefined,
    site: NodeSite,
  ): CellValue => {
    if (!expr) return null
    switch (expr.kind) {
      case 'literal':
        return expr.value === undefined ? null : expr.value
      case 'field':
        return resolveFieldPath(ref, expr.path, site)
      case 'formula':
        return evalFormulaSrc(expr.src, ref, site)
      default:
        return null
    }
  }

  const owns = (ref: RowRef | undefined, fieldId: string | undefined): boolean => {
    if (!ref || !fieldId) return false
    return Boolean(fieldOf(ref.entityId, fieldId))
  }

  const pickOwner = (
    fieldId: string | undefined,
    preferred: RowRef | undefined,
    other: RowRef | undefined,
  ): RowRef | undefined => {
    if (owns(preferred, fieldId)) return preferred
    if (owns(other, fieldId)) return other
    return preferred ?? other
  }

  const evalClause = (
    clause: Clause | undefined,
    scopes: ClauseScopes,
    site: NodeSite,
  ): boolean => {
    if (!clause || !clause.left || !clause.left.fieldId) {
      warn(site, `${site.label}: has an unfinished condition — treated as not matching.`)
      return false
    }

    const leftRef = scopes.byOwnership
      ? pickOwner(firstHop(clause.left), scopes.left, scopes.right)
      : scopes.left
    const left = resolveFieldPath(leftRef, clause.left, site)

    if (UNARY_OPS.includes(clause.op)) {
      switch (clause.op) {
        case 'isEmpty':
          return isEmptyValue(left)
        case 'notEmpty':
          return !isEmptyValue(left)
        case 'isTrue':
          return asBoolean(left)
        case 'isFalse':
          return !asBoolean(left)
        default:
          return false
      }
    }

    if (!clause.right) {
      warn(
        site,
        `${site.label}: a condition has nothing to compare against — treated as not matching.`,
      )
      return false
    }

    const rightRef =
      scopes.byOwnership && clause.right.kind === 'field'
        ? pickOwner(firstHop(clause.right.path), scopes.right, scopes.left)
        : scopes.right
    const right = resolveValue(clause.right, rightRef, site)

    const outcome = compareValues(clause.op, left, right)
    if (outcome.mismatch)
      warn(site, `${site.label}: ${outcome.mismatch} — treated as not matching.`)
    return outcome.result
  }

  /** AND is vacuously true when empty (validateRule blocks empty groups
   *  so nothing silently matches everything); OR is false when empty. */
  const evalGroup = (
    group: ClauseGroup | undefined,
    scopes: ClauseScopes,
    site: NodeSite,
  ): boolean => {
    const clauses = group?.clauses ?? []
    if (group?.combinator === 'OR') {
      for (const c of clauses) if (evalClause(c, scopes, site)) return true
      return false
    }
    for (const c of clauses) if (!evalClause(c, scopes, site)) return false
    return true
  }

  return {
    warnings,
    nodeWarnings,
    warn,
    entity,
    rows,
    row,
    ownerOf,
    fieldOf,
    valuesOf,
    readField,
    resolveFieldPath,
    resolveValue,
    evalGroup,
    pickOwner,
    label,
  }
}
