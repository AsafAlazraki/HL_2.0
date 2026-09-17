/* ============================================================
   Rules engine — static check, run BEFORE a rule executes.

   `runRule` calls this first: any BLOCKER stops the run before a single
   row is read (which is also what makes a cycle-without-a-loop safe —
   it can never hang). Advisories are notes; they never stop a run.

   Config problems on a node that is NOT connected to Start are reported
   as advisories rather than blockers, so half-wired scratch nodes on the
   canvas never stop a working flow from running.

   Never throws.
   ============================================================ */

import {
  ELSE_HANDLE,
  LOOP_BODY_HANDLE,
  LOOP_NEXT_HANDLE,
  OUT_HANDLE,
  UNARY_OPS,
  type ClauseGroup,
  type EntityDef,
  type FieldPath,
  type RuleDef,
  type RuleEdge,
  type RuleNode,
} from '@/domain/model'
import { validateFormula } from '@/domain/rules/formula'
import { createEngine, nodeLabel } from './evaluate'
import type { RuleIssue, RuleRunContext } from './types'

/** No match row on this path yet. */
const NO_MATCH = '\u0000none'
/** Different paths bring different match entities here. */
const AMBIGUOUS = '\u0000many'

const isConcrete = (s: string | undefined): boolean =>
  Boolean(s) && s !== NO_MATCH && s !== AMBIGUOUS

/* ---------------------------------------------------------- */

export function validateRule(rule: RuleDef, ctx: RuleRunContext): RuleIssue[] {
  const issues: RuleIssue[] = []
  try {
    collect(rule, ctx, issues)
  } catch (e) {
    issues.push({
      severity: 'blocker',
      message: `This rule could not be checked: ${e instanceof Error ? e.message : String(e)}`,
    })
  }
  return issues
}

/* ---------------------------------------------------------- */

function collect(rule: RuleDef, ctx: RuleRunContext, issues: RuleIssue[]): void {
  const entities = ctx?.entities ?? {}
  const eng = createEngine(ctx ?? { entities: {}, rowsByEntity: {} })
  const nodes: RuleNode[] = Array.isArray(rule?.nodes) ? rule.nodes.filter(Boolean) : []
  const edges: RuleEdge[] = Array.isArray(rule?.edges) ? rule.edges.filter(Boolean) : []
  const nodeById = new Map<string, RuleNode>()
  for (const n of nodes) if (n?.id) nodeById.set(n.id, n)

  const labelOf = (n: RuleNode): string => nodeLabel(n, entities)

  if (nodes.length === 0) {
    issues.push({
      severity: 'blocker',
      message: 'This rule has no nodes yet — drop a Start node on the canvas to begin.',
    })
    return
  }

  /* -- structure ------------------------------------------- */

  const starts = nodes.filter((n) => n.kind === 'start')
  if (starts.length === 0) {
    issues.push({
      severity: 'blocker',
      message: 'This rule has no Start node, so there is nowhere to begin.',
    })
  }
  for (const extra of starts.slice(1)) {
    issues.push({
      nodeId: extra.id,
      severity: 'blocker',
      message: 'This rule has more than one Start node — keep exactly one.',
    })
  }

  const root: EntityDef | undefined = entities[rule?.rootEntityId ?? '']
  if (!root) {
    issues.push({
      nodeId: starts[0]?.id,
      severity: 'blocker',
      message: 'The table this rule runs against no longer exists — choose another.',
    })
  }

  /* -- reachability + which entity the MATCH row holds ------ */

  const outgoing = new Map<string, RuleEdge[]>()
  for (const e of edges) {
    if (!nodeById.has(e.source)) continue
    const list = outgoing.get(e.source)
    if (list) list.push(e)
    else outgoing.set(e.source, [e])
  }

  const matchState = new Map<string, string>()
  const queue: string[] = []
  for (const s of starts) {
    if (!matchState.has(s.id)) {
      matchState.set(s.id, NO_MATCH)
      queue.push(s.id)
    }
  }
  while (queue.length > 0) {
    const id = queue.shift() as string
    const node = nodeById.get(id)
    if (!node) continue
    const incoming = matchState.get(id) ?? NO_MATCH
    for (const edge of outgoing.get(id) ?? []) {
      if (!nodeById.has(edge.target)) continue
      const next = matchStateOut(node, edge.sourceHandle ?? OUT_HANDLE, incoming, entities, eng)
      const seen = matchState.get(edge.target)
      const merged = seen === undefined ? next : seen === next ? seen : AMBIGUOUS
      if (seen === undefined || merged !== seen) {
        matchState.set(edge.target, merged)
        queue.push(edge.target)
      }
    }
  }

  const reachable = (n: RuleNode): boolean => starts.length === 0 || matchState.has(n.id)
  const add = (n: RuleNode, message: string, severity?: RuleIssue['severity']): void => {
    issues.push({
      nodeId: n.id,
      severity: severity ?? (reachable(n) ? 'blocker' : 'advisory'),
      message,
    })
  }

  /* -- per-node configuration ------------------------------- */

  const checkPath = (
    node: RuleNode,
    path: FieldPath | undefined,
    scope: EntityDef | undefined,
    side: string,
  ): void => {
    const label = labelOf(node)
    if (!path?.fieldId) {
      add(node, `${label}: a condition has no ${side} field chosen.`)
      return
    }
    if (path.viaFieldId) {
      const owner = scope ?? eng.ownerOf(path.viaFieldId)
      const via = owner?.fields?.find((f) => f.id === path.viaFieldId)
      if (!via) {
        add(node, `${label}: follows a link field that no longer exists.`)
        return
      }
      if (via.type !== 'reference' || !via.refEntityId || !entities[via.refEntityId]) {
        add(node, `${label}: "${via.name}" no longer links to a table that exists.`)
        return
      }
      const target = entities[via.refEntityId]
      if (!target.fields?.some((f) => f.id === path.fieldId)) {
        add(node, `${label}: reads a field that is no longer on "${target.name}".`)
      }
      return
    }
    if (scope) {
      if (!scope.fields?.some((f) => f.id === path.fieldId)) {
        add(node, `${label}: reads a field that is no longer on "${scope.name}".`)
      }
      return
    }
    if (!eng.ownerOf(path.fieldId)) {
      add(node, `${label}: reads a field that no longer exists.`)
    }
  }

  const checkGroup = (
    node: RuleNode,
    group: ClauseGroup | undefined,
    leftScope: EntityDef | undefined,
    what: string,
  ): void => {
    const label = labelOf(node)
    const clauses = group?.clauses ?? []
    if (clauses.length === 0) {
      add(
        node,
        group?.combinator === 'OR'
          ? `${label}: ${what} has no conditions, so nothing can ever match — add at least one.`
          : `${label}: ${what} has no conditions, so every row would match — add at least one.`,
      )
      return
    }
    for (const clause of clauses) {
      checkPath(node, clause?.left, leftScope, 'left')
      if (UNARY_OPS.includes(clause?.op)) continue
      const right = clause?.right
      if (!right) {
        add(node, `${label}: a condition has nothing to compare against.`)
        continue
      }
      if (right.kind === 'field') {
        checkPath(node, right.path, root, 'right')
      } else if (right.kind === 'formula') {
        if (root) {
          const res = validateFormula(right.src ?? '', root)
          if (!res.ok) {
            add(
              node,
              `${label}: the calculation "${right.src ?? ''}" is not valid — ${res.error}.`,
              'advisory',
            )
          }
        }
      }
    }
  }

  let outputCount = 0

  for (const node of nodes) {
    const label = labelOf(node)
    switch (node.kind) {
      case 'start':
        break

      case 'match': {
        const cfg = node.config
        if (!cfg?.targetEntityId) {
          add(node, `${label} has no table to search — choose what it should match against.`)
          break
        }
        const target = entities[cfg.targetEntityId]
        if (!target) {
          add(node, `${label} searches a table that no longer exists.`)
          break
        }
        checkGroup(node, cfg.group, target, 'the match')
        break
      }

      case 'filter':
        checkGroup(node, node.config?.group, undefined, 'the filter')
        break

      case 'condition': {
        const branches = node.config?.branches ?? []
        if (branches.length === 0) {
          add(node, `${label} has no branches — add one, or delete the node.`)
          break
        }
        for (const branch of branches) {
          checkGroup(
            node,
            branch?.group,
            undefined,
            `branch "${branch?.label || branch?.id || '?'}"`,
          )
        }
        break
      }

      case 'find': {
        const viaFieldId = node.config?.viaFieldId
        if (!viaFieldId) {
          add(node, `${label} has no link to follow — choose a link field.`)
          break
        }
        const owner = eng.ownerOf(viaFieldId)
        const via = owner?.fields?.find((f) => f.id === viaFieldId)
        if (!owner || !via) {
          add(node, `${label} follows a link field that no longer exists.`)
          break
        }
        if (via.type !== 'reference' || !via.refEntityId || !entities[via.refEntityId]) {
          add(node, `${label}: "${via.name}" no longer links to a table that exists.`)
        }
        break
      }

      case 'loop': {
        const src = node.config?.source
        if (!src) {
          add(node, `${label} has nothing to loop over.`)
          break
        }
        if (src.kind === 'entity') {
          if (!src.entityId) {
            add(node, `${label} has no table to loop over — choose one.`)
          } else if (!entities[src.entityId]) {
            add(node, `${label} loops over a table that no longer exists.`)
          }
        } else {
          if (!src.viaFieldId) {
            add(node, `${label} has no link field to gather rows from — choose one.`)
            break
          }
          const owner = eng.ownerOf(src.viaFieldId)
          const via = owner?.fields?.find((f) => f.id === src.viaFieldId)
          if (!owner || !via) {
            add(node, `${label} gathers rows through a link field that no longer exists.`)
          } else if (via.type !== 'reference' || !via.refEntityId) {
            add(node, `${label}: "${via.name}" is not a link field.`)
          }
        }
        break
      }

      case 'action': {
        checkAction(node, add, labelOf, entities, eng, root, matchState.get(node.id))
        break
      }

      case 'output': {
        outputCount += 1
        const cfg = node.config
        if (!(cfg?.label ?? '').trim()) {
          add(
            node,
            `${label} has no name — its rows will land in a view called "Result".`,
            'advisory',
          )
        }
        const columns = cfg?.columns ?? []
        if (columns.length === 0) {
          add(node, `${label} has no columns — choose what the result table should show.`)
          break
        }
        const matched = matchState.get(node.id)
        for (const col of columns) {
          if (!col?.fieldId) {
            add(node, `${label} has a column with no field chosen.`)
            continue
          }
          const scope =
            col.scope === 'match'
              ? isConcrete(matched)
                ? entities[matched as string]
                : undefined
              : root
          if (scope) {
            if (!scope.fields?.some((f) => f.id === col.fieldId)) {
              const owner = eng.ownerOf(col.fieldId)
              add(
                node,
                owner
                  ? `${label}: a column reads "${owner.name}", which is not the ${col.scope} row here — it will read as empty.`
                  : `${label}: a column reads a field that no longer exists.`,
                owner ? 'advisory' : undefined,
              )
            }
          } else if (!eng.ownerOf(col.fieldId)) {
            add(node, `${label}: a column reads a field that no longer exists.`)
          }
        }
        break
      }

      default:
        break
    }
  }

  /* -- cycles that no For each node bounds ------------------ */

  for (const scc of loopFreeCycles(nodes, edges)) {
    const names = scc.map((id) => {
      const n = nodeById.get(id)
      return n ? labelOf(n) : id
    })
    issues.push({
      nodeId: scc[0],
      severity: 'blocker',
      message:
        scc.length === 1
          ? `${names[0]} is wired back into itself, which would never finish — remove that edge or put a For each node on the path.`
          : `These nodes are wired in a circle that would never finish: ${names.join(' → ')}. Remove an edge, or put a For each node on the path.`,
    })
  }

  /* -- global advisories ------------------------------------ */

  if (starts.length > 0) {
    for (const n of nodes) {
      if (!matchState.has(n.id)) {
        issues.push({
          nodeId: n.id,
          severity: 'advisory',
          message: `${labelOf(n)} is not connected to the Start node, so it never runs.`,
        })
      }
    }
  }

  if (outputCount === 0) {
    issues.push({
      severity: 'advisory',
      message: 'This rule has no Output node, so it will not produce a result table.',
    })
  }

  for (const e of edges) {
    if (!nodeById.has(e.source) || !nodeById.has(e.target)) {
      issues.push({
        severity: 'advisory',
        message: 'A connection points at a node that has been deleted — it is ignored.',
      })
      break
    }
  }
}

/* ---------------------------------------------------------- */
/* Action checks                                              */
/* ---------------------------------------------------------- */

function checkAction(
  node: Extract<RuleNode, { kind: 'action' }>,
  add: (n: RuleNode, message: string, severity?: RuleIssue['severity']) => void,
  labelOf: (n: RuleNode) => string,
  entities: Record<string, EntityDef>,
  eng: ReturnType<typeof createEngine>,
  root: EntityDef | undefined,
  matched: string | undefined,
): void {
  const label = labelOf(node)
  const action = node.config?.action
  if (!action) {
    add(node, `${label} has nothing to do — choose an action.`)
    return
  }

  switch (action.op) {
    case 'set': {
      if (!action.fieldId) {
        add(node, `${label} has no field to set — choose one.`)
        return
      }
      const owner = eng.ownerOf(action.fieldId)
      const field = owner?.fields?.find((f) => f.id === action.fieldId)
      if (!owner || !field) {
        add(node, `${label} sets a field that no longer exists.`)
        return
      }
      if (field.type === 'formula') {
        add(node, `${label}: "${field.name}" is calculated, so it cannot be set.`)
        return
      }
      if (action.value === undefined) {
        add(node, `${label} has no value to write into "${field.name}".`)
      }
      return
    }

    case 'create': {
      if (!action.entityId) {
        add(node, `${label} has no table to create rows in — choose one.`)
        return
      }
      if (!entities[action.entityId]) {
        add(node, `${label} creates rows in a table that no longer exists.`)
        return
      }
      for (const fieldId of Object.keys(action.values ?? {})) {
        if (!entities[action.entityId].fields?.some((f) => f.id === fieldId)) {
          add(
            node,
            `${label} writes a column that is no longer on "${entities[action.entityId].name}".`,
          )
        }
      }
      return
    }

    case 'link': {
      if (!action.joinEntityId) {
        add(node, `${label} has no link table — choose or create one.`)
        return
      }
      const join = entities[action.joinEntityId]
      if (!join) {
        add(node, `${label} writes into a link table that no longer exists.`)
        return
      }
      const sourceField = join.fields?.find((f) => f.id === action.sourceFieldId)
      const matchField = join.fields?.find((f) => f.id === action.matchFieldId)
      if (!action.sourceFieldId || !sourceField) {
        add(
          node,
          `${label}: "${join.name}" has no link field pointing back at the row being walked.`,
        )
      } else if (sourceField.type !== 'reference') {
        add(node, `${label}: "${sourceField.name}" on "${join.name}" is not a link field.`)
      } else if (root && sourceField.refEntityId !== root.id) {
        add(
          node,
          `${label}: "${sourceField.name}" links to "${
            entities[sourceField.refEntityId ?? '']?.name ?? 'a deleted table'
          }", not "${root.name}".`,
        )
      }

      if (!action.matchFieldId || !matchField) {
        add(node, `${label}: "${join.name}" has no link field pointing at the matched row.`)
      } else if (matchField.type !== 'reference') {
        add(node, `${label}: "${matchField.name}" on "${join.name}" is not a link field.`)
      } else if (isConcrete(matched) && matchField.refEntityId !== matched) {
        add(
          node,
          `${label}: "${matchField.name}" links to "${
            entities[matchField.refEntityId ?? '']?.name ?? 'a deleted table'
          }", but the matched row here is a "${entities[matched as string]?.name ?? '?'}".`,
        )
      } else if (matched === NO_MATCH) {
        add(node, `${label} runs before anything has been matched, so there is no pair to link.`)
      }

      for (const fieldId of Object.keys(action.values ?? {})) {
        if (!join.fields?.some((f) => f.id === fieldId)) {
          add(node, `${label} writes a column that is no longer on "${join.name}".`)
        }
      }
      return
    }

    case 'flag': {
      if (!(action.label ?? '').trim()) {
        add(node, `${label} has no wording — it will read "Flagged".`, 'advisory')
      }
      return
    }

    default:
      add(node, `${label} has an action this version does not understand.`)
  }
}

/* ---------------------------------------------------------- */
/* Match-entity inference + cycle detection                   */
/* ---------------------------------------------------------- */

function matchStateOut(
  node: RuleNode,
  handle: string,
  incoming: string,
  entities: Record<string, EntityDef>,
  eng: ReturnType<typeof createEngine>,
): string {
  switch (node.kind) {
    case 'match':
      return node.config?.targetEntityId && entities[node.config.targetEntityId]
        ? node.config.targetEntityId
        : AMBIGUOUS
    case 'find': {
      const owner = eng.ownerOf(node.config?.viaFieldId)
      const via = owner?.fields?.find((f) => f.id === node.config?.viaFieldId)
      return via?.refEntityId && entities[via.refEntityId] ? via.refEntityId : AMBIGUOUS
    }
    case 'loop': {
      if (handle === LOOP_NEXT_HANDLE) return incoming
      if (handle !== LOOP_BODY_HANDLE) return incoming
      const src = node.config?.source
      if (!src) return AMBIGUOUS
      if (src.kind === 'entity') {
        return src.entityId && entities[src.entityId] ? src.entityId : AMBIGUOUS
      }
      const owner = eng.ownerOf(src.viaFieldId)
      return owner ? owner.id : AMBIGUOUS
    }
    default:
      return incoming
  }
}

/**
 * Strongly connected components of the graph WITH every For each node
 * removed. A cycle that survives that removal has nothing bounding it,
 * which is precisely the "cycle not mediated by a loop" blocker.
 * Returns each offending component in stable node order.
 */
function loopFreeCycles(nodes: RuleNode[], edges: RuleEdge[]): string[][] {
  const order = new Map<string, number>()
  const ids: string[] = []
  nodes.forEach((n, i) => {
    if (n.kind === 'loop') return
    order.set(n.id, i)
    ids.push(n.id)
  })

  const adj = new Map<string, string[]>()
  const selfEdges = new Set<string>()
  for (const e of edges) {
    if (!order.has(e.source) || !order.has(e.target)) continue
    if (e.source === e.target) selfEdges.add(e.source)
    const list = adj.get(e.source)
    if (list) list.push(e.target)
    else adj.set(e.source, [e.target])
  }

  /* iterative Tarjan — no recursion, so a huge graph cannot blow the stack */
  const index = new Map<string, number>()
  const low = new Map<string, number>()
  const onStack = new Set<string>()
  const stack: string[] = []
  const found: string[][] = []
  let counter = 0

  for (const start of ids) {
    if (index.has(start)) continue
    const work: Array<{ id: string; next: number }> = [{ id: start, next: 0 }]
    index.set(start, counter)
    low.set(start, counter)
    counter += 1
    stack.push(start)
    onStack.add(start)

    while (work.length > 0) {
      const frame = work[work.length - 1]
      const neighbours = adj.get(frame.id) ?? []
      if (frame.next < neighbours.length) {
        const w = neighbours[frame.next]
        frame.next += 1
        if (!index.has(w)) {
          index.set(w, counter)
          low.set(w, counter)
          counter += 1
          stack.push(w)
          onStack.add(w)
          work.push({ id: w, next: 0 })
        } else if (onStack.has(w)) {
          low.set(frame.id, Math.min(low.get(frame.id) ?? 0, index.get(w) ?? 0))
        }
        continue
      }
      work.pop()
      const parent = work[work.length - 1]
      if (parent) {
        low.set(parent.id, Math.min(low.get(parent.id) ?? 0, low.get(frame.id) ?? 0))
      }
      if (low.get(frame.id) === index.get(frame.id)) {
        const scc: string[] = []
        let w: string | undefined
        do {
          w = stack.pop()
          if (w === undefined) break
          onStack.delete(w)
          scc.push(w)
        } while (w !== frame.id)
        if (scc.length > 1 || selfEdges.has(frame.id)) {
          scc.sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0))
          found.push(scc)
        }
      }
    }
  }

  return found
}

/* keep the handle constants referenced so their intent is documented
   here as well as in walk.ts */
void ELSE_HANDLE
