/* ============================================================
   WHAT ELSE GOES WHEN A TABLE GOES

   MODULE_SYSTEM §2, defect 2: "`deleteEntity` does not cascade into
   views. Delete a table and its module would point at nothing."

   Verified before writing this. `deleteEntity` cascaded into four
   things — the other tables' reference fields, the rows, the rules
   rooted at it, and the selection — and into neither views nor
   modules. So a dealer who deleted `Boats` kept a Boats page whose
   `rootTableId` named a table that no longer existed, and a module
   whose `tableIds[0]` did the same. Nothing crashed; the screens
   simply drew nothing and said nothing about why, which is worse.

   ── THE FOUR DECISIONS, AND WHY EACH IS WHAT IT IS ───────────

   A PAGE WHOSE ROOT IS GONE IS DELETED. `ViewDef.rootTableId` is
   "the table whose rows this view is FOR" — it is not a reference the
   page can lose and carry on; it is what the page is. There is no
   honest state for a page of nothing.

   A BLOCK WHOSE TABLE IS GONE IS DROPPED, and the page survives. A
   block is one related table among several — "accessories under
   motors" — so losing one costs the page a section, not its subject.
   Blocks nest to depth 3, so the drop recurses.

   A MODULE LOSES THE TABLE FROM `tableIds` and survives if any
   remain, INCLUDING when the one it loses was `[0]`, the primary.
   The next table becomes primary. A module is "the tables it is
   about"; being about fewer of them is a smaller module, not a
   broken one.

   A MODULE WITH NO TABLES LEFT IS DELETED, for the same reason the
   page is: model.ts calls a module "the TABLES it is about, the
   VERBS a person may use in it, how its list is DRAWN, and where it
   sits". Strip the tables and there is no place to stand.

   AND `viewId` IS CLEARED RATHER THAN THE MODULE DELETED when the
   page it pointed at has gone. The contract already blesses that
   state in as many words: "Absent means the module lists but does
   not open — which is a legitimate module, not a broken one." So
   this is the one dangling pointer with a defined resting place, and
   we put it there instead of inventing a rule.

   ── WHY IT IS A PURE FUNCTION AND NOT FOUR LINES IN THE STORE ──

   Because the interesting part is the ARITHMETIC — what survived and
   what did not — and DESIGN_PRINCIPLES §7 wants that arithmetic on
   screen before the act: "A confirm states its blast radius,
   computed." A store action that mutates and returns void cannot be
   asked "what would this cost?" without doing it. This can, and the
   dialog and the deletion then read the same function, so the
   preview and the act cannot disagree — the discipline
   `levelConflict` already keeps for the price rung.
   ============================================================ */

import type { EntityDef, ModuleDef, RowData, ViewBlock, ViewDef } from '@/domain/model'

/** What a delete would leave behind, and what it would take with it. */
export interface DeleteCascade {
  views: Record<string, ViewDef>
  modules: Record<string, ModuleDef>
  /** named, for the sentence a confirm has to say */
  deletedViews: string[]
  deletedModules: string[]
  /** modules that survive with fewer tables than they had */
  narrowedModules: string[]
  /** modules that keep their place but stop opening, because the page
   *  they opened has gone */
  closedModules: string[]
  /** blocks dropped out of pages that survive */
  droppedBlocks: number
}

/** Drop every block for `tableId`, at any depth. Returns the SAME
 *  array when nothing changed, so an untouched page keeps its
 *  identity and React is not handed a new object to diff. */
function pruneBlocks(
  blocks: readonly ViewBlock[],
  tableId: string,
  count: { n: number },
): ViewBlock[] {
  let changed = false
  const kept: ViewBlock[] = []
  for (const b of blocks) {
    if (b.tableId === tableId) {
      count.n += 1
      changed = true
      continue
    }
    const children = b.children ? pruneBlocks(b.children, tableId, count) : undefined
    /* A JOIN TABLE IS ALSO A TABLE and can also be deleted. A block
       whose `joinTableId` has gone is not curated any more; it is a
       block over `tableId` with no pairs, which is the "show
       everything" state the contract already allows. Losing the join
       is not losing the block. */
    const lostJoin = b.joinTableId === tableId
    if (children === b.children && !lostJoin) {
      kept.push(b)
      continue
    }
    changed = true
    const next: ViewBlock = { ...b }
    if (lostJoin) delete next.joinTableId
    if (children) next.children = children
    kept.push(next)
  }
  return changed ? kept : (blocks as ViewBlock[])
}

/**
 * WHAT DELETING `tableId` DOES TO THE PAGES AND MODULES.
 *
 * Pure: handed the two records, returns the two records it would
 * leave plus the counts a sentence needs. Nothing here reads the
 * store, so the confirm and the deletion can both call it.
 */
export function cascadeOfDelete(
  tableId: string,
  views: Readonly<Record<string, ViewDef>>,
  modules: Readonly<Record<string, ModuleDef>>,
): DeleteCascade {
  const nextViews: Record<string, ViewDef> = {}
  const deletedViews: string[] = []
  const count = { n: 0 }

  for (const [vid, v] of Object.entries(views)) {
    if (v.rootTableId === tableId) {
      deletedViews.push(v.name)
      continue
    }
    const blocks = pruneBlocks(v.blocks, tableId, count)
    nextViews[vid] = blocks === v.blocks ? v : { ...v, blocks }
  }

  const nextModules: Record<string, ModuleDef> = {}
  const deletedModules: string[] = []
  const narrowedModules: string[] = []
  const closedModules: string[] = []

  for (const [mid, m] of Object.entries(modules)) {
    const tableIds = m.tableIds.filter((t) => t !== tableId)
    if (tableIds.length === 0) {
      deletedModules.push(m.name)
      continue
    }
    const narrowed = tableIds.length !== m.tableIds.length
    const orphanedView = m.viewId !== undefined && nextViews[m.viewId] === undefined
    if (!narrowed && !orphanedView) {
      nextModules[mid] = m
      continue
    }
    if (narrowed) narrowedModules.push(m.name)
    if (orphanedView) closedModules.push(m.name)
    const next: ModuleDef = { ...m, tableIds }
    if (orphanedView) delete next.viewId
    nextModules[mid] = next
  }

  return {
    views: nextViews,
    modules: nextModules,
    deletedViews,
    deletedModules,
    narrowedModules,
    closedModules,
    droppedBlocks: count.n,
  }
}

/** One name is named; more than one is counted, because a confirm
 *  that lists eleven page titles is a confirm nobody reads. */
function some(
  parts: string[],
  names: readonly string[],
  one: (n: string) => string,
  many: (n: number) => string,
): void {
  if (names.length === 0) return
  parts.push(names.length === 1 ? one(names[0]) : many(names.length))
}

/** The clauses of the sentence, so a caller with MORE to say — the
 *  table delete also takes rows, link columns and rooted rules —
 *  can put its own clauses in front and still say one sentence. */
export function cascadeParts(c: DeleteCascade): string[] {
  const parts: string[] = []
  some(
    parts,
    c.deletedViews,
    (n) => `the page ${n}`,
    (n) => `${n} pages`,
  )
  some(
    parts,
    c.deletedModules,
    (n) => `the module ${n}`,
    (n) => `${n} modules`,
  )
  some(
    parts,
    c.narrowedModules,
    (n) => `a table from ${n}`,
    (n) => `a table from ${n} modules`,
  )
  some(
    parts,
    c.closedModules,
    (n) => `the page ${n} opens`,
    (n) => `the pages ${n} modules open`,
  )
  if (c.droppedBlocks > 0) {
    parts.push(
      c.droppedBlocks === 1 ? 'one section of a page' : `${c.droppedBlocks} sections of pages`,
    )
  }
  return parts
}

/** `This also removes a, b and c.` — or '' when there is nothing to
 *  say, so a caller can ask "is there anything to say" without
 *  counting fields. One joiner for every blast radius on the sheet. */
export function sayAlso(parts: readonly string[]): string {
  if (parts.length === 0) return ''
  if (parts.length === 1) return `This also removes ${parts[0]}.`
  const last = parts[parts.length - 1]
  return `This also removes ${parts.slice(0, -1).join(', ')} and ${last}.`
}

/**
 * THE BLAST RADIUS, AS A SENTENCE — §7, computed rather than warned.
 *
 * Returns '' when nothing beyond the table itself is touched.
 */
export function cascadeSay(c: DeleteCascade): string {
  return sayAlso(cascadeParts(c))
}

/* ============================================================
   WHAT ELSE GOES WHEN A ROW GOES

   The old store's `deleteRow` filtered one list and stopped. What it
   left behind was every pairing that named the row: a join row whose
   Boat cell holds the id of a boat that is no longer on the sheet.
   Nothing crashed — `pairs.ts` looks the id up, finds nothing and
   skips the pair — so the loss was silent, which is the one kind
   this repository refuses. And the pack is where it would happen: a
   Highfield hull is named by 118 rows across five joins.

   ── THE TWO DECISIONS, AND WHY EACH IS WHAT IT IS ─────────────

   A PAIRING WHOSE HALF IS GONE IS DELETED. `tables.ts` calls a join
   "a declared relationship between two base tables, plus whatever
   belongs to the PAIRING rather than to either side" — a rigging kit,
   a prop, the engine hole. Those are facts about THIS BOAT with THAT
   MOTOR, and with the boat gone they are facts about nothing. The
   same argument `cascadeOfDelete` makes for a page whose root is
   gone: there is no honest state for a pairing of nothing. Only
   rows on a table whose `role` is 'join' go this way.

   A LINK ON A BASE TABLE IS EMPTIED, AND THE ROW STAYS. A package
   that pointed at the boat is still a package — a row of its own
   table with its own price — and what it has lost is one cell. The
   cell is cleared rather than left holding a dead id, for the reason
   the old re-point sheet gave when it nulled every link: "a row id
   of the old target means nothing" once the target is not there.

   ONE LEVEL, DELIBERATELY. A pairing that goes could itself be named
   by a row elsewhere; nothing on the pack does that, and a cascade
   that recursed would be a blast radius nobody could read off one
   sentence. If a sheet ever pairs its pairings, the count here will
   say what is left holding on, and that is the moment to decide.

   Pure, like the table cascade above it, and for the same reason: a
   confirm asks it what a delete would cost, and the command reads
   the same answer to do it, so the two cannot disagree.
   ============================================================ */

/** One column on one table, and the rows of it that name the row. */
export interface RowHold {
  tableId: string
  tableName: string
  fieldId: string
  fieldName: string
  rowIds: string[]
}

export interface RowCascade {
  /** rows on JOIN tables that pair the row with something — they go */
  pairings: RowHold[]
  /** rows on other tables whose link cell holds the row — the cell
   *  is emptied and the row stays */
  unlinked: RowHold[]
}

/**
 * WHAT DELETING ONE ROW DOES TO THE ROWS THAT NAME IT. Every
 * reference column on the sheet aimed at the row's table is walked,
 * and every row whose cell holds this id is counted under the column
 * it holds it in. Tables and columns come back in the sheet's own
 * order, so two runs say the same sentence.
 */
export function cascadeOfRowDelete(
  tables: Readonly<Record<string, EntityDef>>,
  rows: Readonly<Record<string, readonly RowData[]>>,
  tableId: string,
  rowId: string,
): RowCascade {
  const pairings: RowHold[] = []
  const unlinked: RowHold[] = []
  for (const table of Object.values(tables)) {
    const aimed = table.fields.filter((f) => f.type === 'reference' && f.refEntityId === tableId)
    if (aimed.length === 0) continue
    const list = rows[table.id] ?? []
    for (const field of aimed) {
      const rowIds: string[] = []
      for (const row of list) if (row.values[field.id] === rowId) rowIds.push(row.id)
      if (rowIds.length === 0) continue
      const hold: RowHold = {
        tableId: table.id,
        tableName: table.name,
        fieldId: field.id,
        fieldName: field.name,
        rowIds,
      }
      if (table.role === 'join') pairings.push(hold)
      else unlinked.push(hold)
    }
  }
  return { pairings, unlinked }
}

const total = (holds: readonly RowHold[]): number => holds.reduce((n, h) => n + h.rowIds.length, 0)

/** The clauses, for a caller that says them beside its own. */
export function rowCascadeParts(c: RowCascade): string[] {
  const parts: string[] = []
  if (c.pairings.length === 1) {
    const [p] = c.pairings
    const n = p.rowIds.length
    parts.push(`${n} ${n === 1 ? 'pairing' : 'pairings'} from ${p.tableName}`)
  } else if (c.pairings.length > 1) {
    parts.push(`${total(c.pairings)} pairings from ${c.pairings.length} tables`)
  }
  if (c.unlinked.length === 1) {
    const [u] = c.unlinked
    const n = u.rowIds.length
    parts.push(`the ${u.fieldName} link on ${n} ${n === 1 ? 'row' : 'rows'} of ${u.tableName}`)
  } else if (c.unlinked.length > 1) {
    parts.push(`the links on ${total(c.unlinked)} rows of ${c.unlinked.length} tables`)
  }
  return parts
}

/** The blast radius of a row delete, as one sentence, or '' when the
 *  row is named by nothing. */
export function rowCascadeSay(c: RowCascade): string {
  return sayAlso(rowCascadeParts(c))
}
