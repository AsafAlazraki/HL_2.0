/* ============================================================
   EVERY WAY THE SHEET CHANGES, AS A COMMAND WITH ITS OWN WAY BACK.

   This is the write half of the old `useProjectStore` — `updateCell`,
   `addRow`, `deleteRow`, `addField`, `updateField`, `removeField`,
   `createEntity`, `deleteEntity` — with the store, the two-tab guard
   and the microtask history taken away. What is left is what was
   always pure: given the sheet as it stands and the clock, each one
   says what it did, hands back the exact way to undo it, says the
   sentence a person reads, and mints the event the audit keeps. The
   shape is `domain/quote/commands.ts`'s, for the reason its header
   gives: A TOAST WHOSE UNDO DOES NOT UNDO IS WORSE THAN NO TOAST, and
   the only undo that cannot lie is the one the act itself hands
   back, by value.

   WHAT THE OLD STORE ARGUED, AND WHERE EACH ARGUMENT NOW LIVES.

     · "A COMMIT THAT CHANGED NOTHING IS NOT A STEP. Opening a cell
       and pressing Enter writes the value straight back; recording
       it would spend an undo on a keystroke that did nothing, and
       after three of them Ctrl+Z appears broken." — `updateCell`
       returns NOTHING for the same value, and the store records
       nothing.
     · "A RETYPE IS THE DESTRUCTIVE ONE — it drops every stored value
       in the column — so it is named separately from a rename." —
       `retypeField` and `renameField` are two commands with two
       labels, and the retype carries what `columnFacts` counts:
       how many cells cross as the same fact and how many can only
       be cleared.
     · "cascade: drop reference fields that point at the deleted
       entity" — `deleteTable` still does, and now also into the
       pages and the modules (`deleteCascade.ts`) and says the whole
       of it before the act.
     · "an explicit id is only for well-known system columns; a
       clash would silently shadow an existing column, so refuse it"
       — `addField` refuses, with the sentence.
     · "stale config from the old type must not linger" — a retype
       drops options, the link target, the formula and the default.

   WHAT THE OLD STORE DID NOT DO, AND THIS DOES.

     · A ROW DELETE HAS A BLAST RADIUS. The old `deleteRow` filtered
       one list; every pairing that named the row was left pointing
       at nothing. `cascadeOfRowDelete` counts them and the command
       takes them, and the sentence says so before the press.
     · A RENAME CARRIES THE CALCULATIONS WITH IT. Formula references
       resolve by name, so `renameField` rewrites every reader on the
       table (`dependents.ts`) rather than orphaning it.
     · THE REFUSALS ARE SENTENCES RETURNED, never a silent no-op: a
       cost column may not become a rung of a price ladder, a
       pairing's identity columns keep their type and their place,
       and a table nobody can file (no organisation) is not made.

   THE WAY BACK IS BY REFERENCE. Every command captures the objects
   it replaces and its inverse puts THOSE objects back — the row as
   it was, the table as it was, the pages as they were — never
   today's re-reading of them. That is `removeLine`'s discipline one
   floor down, and it has a second dividend: the repository writes
   the difference by object identity (`data/dexie/ledger.ts`), so an
   undo of an unflushed edit costs the disk nothing at all.

   THE LABELS ARE THE OLD HISTORY'S, VERBATIM. "Cell edit · Boats",
   "5 cell edits · Highfield Inflatables", "Column retyped · Boats",
   "Table deleted · Boats" — `labelFor` in `domain/undo.ts` still
   writes them, and a `batch` collapses many acts into one label the
   way one turn of the event loop used to. A screen prefixes "Undone"
   itself; the sentence a step said is kept on its event.

   A TABLE THE PACK DECLARES MAY BE EDITED, AND ITS PROVENANCE SAYS
   SO. The packer writes each table's own provenance into its
   `description` — the workbook, the sheet, the rows it was read
   from. Nothing here refuses to touch such a table: the file is the
   dealer's data and the dealer may change it. What every event
   carries is that line, so an audit read later says which table of
   the price file was changed, not merely which id.
   ============================================================ */

import {
  ACCENT_KEYS,
  TABLE_KINDS,
  isPairFieldId,
  isSystemFieldId,
  rowLabel,
  type AccentKey,
  type CellValue,
  type ColumnSection,
  type EntityDef,
  type FieldDef,
  type FieldType,
  type ModuleDef,
  type PriceLevel,
  type RowData,
  type RuleDef,
  type RungContents,
  type TableKind,
  type TableRole,
  type ViewDef,
  type XY,
} from '@/domain/model'
import { newId } from '@/domain/id'
import { labelFor, type Op } from '@/domain/undo'
import { isCostColumn } from '@/domain/quote/pricing'
import { countLabel, leafNoun } from '@/domain/catalogue/table/grouping'
import { cellText, draftColumnName, isFilled, retypePlan, type RetypePlan } from './columnFacts'
import {
  cascadeOfDelete,
  cascadeOfRowDelete,
  cascadeParts,
  rowCascadeSay,
  sayAlso,
  type DeleteCascade,
  type RowCascade,
} from './deleteCascade'
import {
  entityDependents,
  entityPages,
  fieldViewers,
  formulaReaders,
  nameList,
  renameFieldRefs,
  retargetBreakage,
  retypeBreakage,
  ruleBreakage,
  type EntityDependents,
  type EntityPages,
  type PageUse,
  type RuleBreak,
} from './dependents'
import { hasRow, indexRows, type CatalogueData } from './sheet'

/* ---------------------------------------------------------- */
/* What a command is                                          */
/* ---------------------------------------------------------- */

/** What an act did to the sheet, in the audit's own vocabulary. A
 *  closed list, because "sheet changed" is an entry nobody can
 *  search. 'undone' and 'redone' are stamped by the store, which is
 *  the only thing that knows which direction a command ran in. */
export type CatalogueEventKind =
  | 'cell-set'
  | 'row-added'
  | 'row-deleted'
  | 'column-added'
  | 'column-renamed'
  | 'column-retyped'
  | 'column-repointed'
  | 'column-deleted'
  | 'table-created'
  | 'table-deleted'
  | 'batch'
  | 'undone'
  | 'redone'

export type CatalogueChangeValue = string | number | boolean | null

export interface CatalogueChange {
  path: string
  from: CatalogueChangeValue
  to: CatalogueChangeValue
}

export interface CatalogueEvent {
  id: string
  kind: CatalogueEventKind
  /** when, ISO — from the injected clock, never `Date.now()` in a command */
  at: string
  /** the sentence the step said, kept verbatim so the audit and the
   *  screen never disagree about what happened */
  said: string
  /** what the history calls it — "5 cell edits · Highfield Inflatables"
   *  — which is `said` for every act but a batch that had a sentence
   *  of its own, the way the old stack labelled a burst while the
   *  toast said the act */
  label: string
  /** who, when the session had a name */
  by?: string
  tableId?: string
  /** the table's name AS IT WAS before the act, which for a delete
   *  is the only moment it can be read */
  tableName?: string
  rowId?: string
  fieldId?: string
  /** the table's own provenance line, when the pack wrote one */
  provenance?: string
  /** the counted blast radius, as the sentence said before the act */
  also?: string
  /** 'undone' / 'redone' only: the event this one reverses or restores */
  undoes?: string
  /** a batch: the acts inside it, in order */
  events?: CatalogueEvent[]
  /** what changed, each by value */
  changed: CatalogueChange[]
}

/** What a command DID: the sheet it produces, the way back, the
 *  label a surface says, and the event the audit keeps. */
export interface Done {
  next: CatalogueData
  /** the exact way back, closed over the objects it puts back */
  inverse: CatalogueCommand
  said: string
  event: CatalogueEvent
}

/** Why a command did nothing.
 *
 *  `refused` IS A SENTENCE WHERE THERE IS ONE TO SAY AND '' WHERE
 *  NOTHING HAPPENED. A refusal is printed where the act was
 *  attempted; "nothing happened" is silence, and the store records
 *  no step for it — which is the old "a commit that changed nothing
 *  is not a step", kept. */
export interface Refused {
  refused: string
}

export type Outcome = Done | Refused

export const isDone = (o: Outcome): o is Done => 'next' in o

/** One change to the sheet. Given the sheet as it stands and the
 *  clock, it returns what it did or why it did nothing. It never
 *  throws and it never writes. */
export type CatalogueCommand = (data: CatalogueData, now: string) => Outcome

/**
 * THE ONE DOOR. A sheet has no issued state, so nothing is refused
 * here that the command did not refuse itself; what the door adds is
 * `by`, stamped once rather than inside every command, for the reason
 * `quote/commands.ts` gives: three call sites agreeing by hand is
 * three chances to forget.
 */
export function apply(
  data: CatalogueData,
  command: CatalogueCommand,
  now: string,
  by?: string,
): Outcome {
  const done = command(data, now)
  if (!isDone(done)) return done
  return by ? { ...done, event: { ...done.event, by } } : done
}

/* ---------------------------------------------------------- */
/* The sentences                                              */
/* ---------------------------------------------------------- */

export const TABLE_GONE = 'That table is no longer on the sheet.'
export const ROW_GONE = 'That row is no longer on the sheet.'
export const COLUMN_GONE = 'That column is no longer on this table.'
export const NO_ORG =
  'This sheet has no organisation to file a table under, so nothing can be made on it.'
export const UID_LOCKED = 'UID is the row’s own identity and is never typed into.'
export const COLUMN_NEEDS_NAME = 'A column needs a name.'
export const TABLE_NEEDS_NAME = 'A table needs a name.'

export const computedColumn = (f: FieldDef): string =>
  `${f.name} is worked out from other columns — there is no cell to write.`
export const columnTaken = (name: string): string =>
  `This table already has a column called “${name}”.`
export const tableTaken = (name: string): string => `There is already a table called “${name}”.`
export const notALink = (f: FieldDef): string =>
  `${f.name} is not a link column, so there is nothing to re-point.`
export const linkNeedsTable = (id: string | undefined): string =>
  id === undefined || id === ''
    ? 'A link column needs a table to point at.'
    : `A link column needs a table to point at, and “${id}” is not on the sheet.`
export const notARowOf = (f: FieldDef, target: EntityDef, value: string): string =>
  `“${value}” is not a row of ${target.name}, so ${f.name} cannot point at it.`
export const costAsRung = (f: FieldDef): string =>
  `${f.name} is a cost column, and cost never reaches a customer surface, so it cannot be a price level.`
export const rungNotANumber = (f: FieldDef): string =>
  `${f.name} would be a ${f.type} column, and a rung of the price ladder is a number.`
export const rungTaken = (key: string): string =>
  `This table already has a “${key}” rung on its price ladder.`

/** The three things a column can be that lock it, each with the
 *  verb the act was going to do. */
type Locked = 'keeps its type' | 'stays' | 'keeps its name'

export const machinery = (f: FieldDef, does: Locked): string =>
  `${f.name} is machinery on a pairing — every pairing carries it and the register locks it, so it ${does}.`
export const pairingIdentity = (table: EntityDef, f: FieldDef, does: Locked): string =>
  `${f.name} is what makes ${table.name} a pairing — the pairing stands on it, so it ${does}.`
export const ladderRung = (f: FieldDef, rung: PriceLevel): string =>
  `${f.name} is the ${rung.label} rung of this table’s price ladder, so it keeps its type.`

/* ---------------------------------------------------------- */
/* The labels — the old history's words, verbatim             */
/* ---------------------------------------------------------- */

type LabelledKind = Exclude<CatalogueEventKind, 'batch' | 'undone' | 'redone'>

const OPS: Record<LabelledKind, Op> = {
  'cell-set': { one: 'Cell edit', many: (n) => `${n} cell edits` },
  'row-added': { one: 'Row added', many: (n) => `${n} rows added` },
  'row-deleted': { one: 'Row deleted', many: (n) => `${n} rows deleted` },
  'column-added': { one: 'Column added', many: (n) => `${n} columns added` },
  'column-renamed': { one: 'Column renamed', many: (n) => `${n} column changes` },
  'column-retyped': { one: 'Column retyped', many: (n) => `${n} column changes` },
  'column-repointed': { one: 'Column re-pointed', many: (n) => `${n} column changes` },
  'column-deleted': { one: 'Column deleted', many: (n) => `${n} columns deleted` },
  'table-created': { one: 'Table added' },
  'table-deleted': { one: 'Table deleted' },
}

/** "Cell edit · Boats" */
const label = (kind: LabelledKind, where: string | undefined): string =>
  labelFor([{ ...OPS[kind], where }])

/** The op an event stands for, so a batch can label itself the way a
 *  burst of the old history did. */
const opOf = (e: CatalogueEvent): Op =>
  e.kind === 'batch' || e.kind === 'undone' || e.kind === 'redone'
    ? { one: e.said, where: e.tableName }
    : { ...OPS[e.kind], where: e.tableName }

/* ---------------------------------------------------------- */
/* Writing an event                                           */
/* ---------------------------------------------------------- */

interface EventArgs {
  kind: CatalogueEventKind
  at: string
  said: string
  label?: string
  tableId?: string
  tableName?: string
  rowId?: string
  fieldId?: string
  provenance?: string
  also?: string
  events?: CatalogueEvent[]
  changed?: CatalogueChange[]
}

const event = (a: EventArgs): CatalogueEvent => ({
  id: newId(),
  kind: a.kind,
  at: a.at,
  said: a.said,
  label: a.label ?? a.said,
  ...(a.tableId !== undefined ? { tableId: a.tableId } : {}),
  ...(a.tableName !== undefined ? { tableName: a.tableName } : {}),
  ...(a.rowId !== undefined ? { rowId: a.rowId } : {}),
  ...(a.fieldId !== undefined ? { fieldId: a.fieldId } : {}),
  ...(a.provenance !== undefined ? { provenance: a.provenance } : {}),
  ...(a.also !== undefined && a.also !== '' ? { also: a.also } : {}),
  ...(a.events !== undefined ? { events: a.events } : {}),
  changed: a.changed ?? [],
})

const change = (path: string, from: CatalogueChangeValue, to: CatalogueChangeValue) => ({
  path,
  from,
  to,
})

/** A cell for an event's `changed`: what the sheet HELD, with
 *  "nothing" as null and a picture list as its count — never a
 *  blob of addresses in an audit line. */
const held = (v: CellValue | undefined): CatalogueChangeValue => {
  if (v === null || v === undefined) return null
  if (Array.isArray(v)) return cellText(v)
  return v
}

/** Which columns moved between two shapes of one table, by id. */
function fieldChanges(tableId: string, from: EntityDef, to: EntityDef): CatalogueChange[] {
  const out: CatalogueChange[] = []
  const was = new Map(from.fields.map((f) => [f.id, f]))
  const is = new Map(to.fields.map((f) => [f.id, f]))
  for (const [id, f] of was) {
    const g = is.get(id)
    const path = `${tableId}.fields.${id}`
    if (!g) {
      out.push(change(`${path}.name`, f.name, null))
      continue
    }
    if (f.name !== g.name) out.push(change(`${path}.name`, f.name, g.name))
    if (f.type !== g.type) out.push(change(`${path}.type`, f.type, g.type))
    if (f.refEntityId !== g.refEntityId) {
      out.push(change(`${path}.refEntityId`, f.refEntityId ?? null, g.refEntityId ?? null))
    }
  }
  for (const [id, g] of is) {
    if (!was.has(id)) out.push(change(`${tableId}.fields.${id}.name`, null, g.name))
  }
  return out
}

/* ---------------------------------------------------------- */
/* Small helpers                                              */
/* ---------------------------------------------------------- */

/** Nothing happened and nothing is owed. */
const NOTHING: Refused = { refused: '' }

const touch = <T extends { updatedAt: string }>(o: T, now: string): T => ({ ...o, updatedAt: now })

/** two cell values that are the same value. Two distinct arrays are
 *  never assumed equal — a picture list is re-ordered in place by
 *  building a new one, and calling that "unchanged" would lose it. */
const cellUnchanged = (a: CellValue | undefined, b: CellValue): boolean =>
  a === b || (a == null && b == null)

const sameName = (a: string, b: string): boolean =>
  a.trim().toLowerCase() === b.trim().toLowerCase()

/** The ladder a table stands on: the filed record first, the table's
 *  own declaration where nothing has been filed. */
const ladderOf = (data: CatalogueData, table: EntityDef): PriceLevel[] =>
  data.priceLevels[table.id] ?? table.priceLevels ?? []

/** A column that makes a join a join: one of its links, or the pair
 *  machinery every curated join carries. */
const isPairingIdentity = (table: EntityDef, f: FieldDef): boolean =>
  table.role === 'join' && f.type === 'reference'

/** The sheet with one table's rows replaced, and an index derived
 *  from the result. */
function withRows(data: CatalogueData, tableId: string, list: RowData[]): CatalogueData {
  const rows = { ...data.rows, [tableId]: list }
  return { ...data, rows, index: indexRows(rows) }
}

const noun = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`

/* ============================================================
   RESTORING — the shared ways back.

   Three shapes, because three kinds of act replace three kinds of
   thing: a ROW (a cell edit), a TABLE'S SHAPE with or without its
   rows and ladder (every column act), and a WHOLE TABLE with what
   went with it (a delete). Each puts back the objects it was handed,
   by reference, and each hands back the opposite restore as its own
   way back — so undo and redo are both exact.
   ============================================================ */

/** Put one row back as it was. NOTHING when the row has gone since:
 *  writing a value to a row that is off the sheet is writing to
 *  nothing, and taking a row off is its own step with its own undo. */
function putRow(kind: LabelledKind, tableId: string, row: RowData): CatalogueCommand {
  return (data, now) => {
    const table = data.tables[tableId]
    const list = data.rows[tableId]
    if (!table || !list) return NOTHING
    const at = list.findIndex((r) => r.id === row.id)
    if (at < 0) return NOTHING
    const cur = list[at]
    if (cur === row) return NOTHING
    const next = [...list]
    next[at] = row
    const said = label(kind, table.name)
    const changed: CatalogueChange[] = []
    for (const key of new Set([...Object.keys(cur.values), ...Object.keys(row.values)])) {
      if (!cellUnchanged(cur.values[key], row.values[key] ?? null)) {
        changed.push(
          change(`${tableId}.${row.id}.${key}`, held(cur.values[key]), held(row.values[key])),
        )
      }
    }
    return {
      next: withRows(data, tableId, next),
      said,
      event: event({
        kind,
        at: now,
        said,
        tableId,
        tableName: table.name,
        rowId: row.id,
        provenance: table.description,
        changed,
      }),
      inverse: putRow(kind, tableId, cur),
    }
  }
}

/** A row taken off, with where it sat, so it can come back there. */
interface Taken {
  tableId: string
  row: RowData
  at: number
}

/** Put rows back where they sat, and other rows back as they were.
 *  `back` is the way back from this restore — the act that took them
 *  off, so undo and redo stay one pair. NOTHING when the first row
 *  is already back, which is the "somebody put it back by hand" case
 *  and the "second undo pointing at the same step" case at once. */
function restoreRows(
  kind: LabelledKind,
  taken: readonly Taken[],
  replaced: readonly RowData[],
  back: CatalogueCommand,
): CatalogueCommand {
  return (data, now) => {
    const subject = taken[0]
    if (!subject) return NOTHING
    const table = data.tables[subject.tableId]
    if (!table) return NOTHING
    if ((data.rows[subject.tableId] ?? []).some((r) => r.id === subject.row.id)) return NOTHING

    const rows: Record<string, RowData[]> = { ...data.rows }
    /* IN REVERSE, AT THE INDEX EACH WAS TAKEN FROM: the rows were
       taken one at a time, each index read from the list as it
       stood, so unwinding them in the opposite order lands every one
       exactly where it sat */
    for (let i = taken.length - 1; i >= 0; i -= 1) {
      const t = taken[i]
      const list = [...(rows[t.tableId] ?? [])]
      if (list.some((r) => r.id === t.row.id)) continue
      list.splice(Math.min(t.at, list.length), 0, t.row)
      rows[t.tableId] = list
    }
    for (const r of replaced) {
      const list = rows[r.entityId] ?? []
      const i = list.findIndex((x) => x.id === r.id)
      if (i < 0) continue
      const copy = [...list]
      copy[i] = r
      rows[r.entityId] = copy
    }
    const said = label(kind, table.name)
    return {
      next: { ...data, rows, index: indexRows(rows) },
      said,
      event: event({
        kind,
        at: now,
        said,
        tableId: subject.tableId,
        tableName: table.name,
        rowId: subject.row.id,
        provenance: table.description,
        changed: [
          change(`${subject.tableId}.${subject.row.id}`, null, rowLabel(table, subject.row)),
        ],
      }),
      inverse: back,
    }
  }
}

/** A table's shape as it was, with its rows and its ladder when the
 *  act touched them. `ladder: null` means "there was none". */
interface Shape {
  table: EntityDef
  rows?: RowData[]
  ladder?: PriceLevel[] | null
}

/** Put a table's shape back — its columns, and its rows and ladder
 *  when the act moved them. NOTHING when the table has gone: a
 *  deleted table is its own step. */
function restoreShape(kind: LabelledKind, tableId: string, was: Shape): CatalogueCommand {
  return (data, now) => {
    const cur = data.tables[tableId]
    if (!cur) return NOTHING
    const curRows = data.rows[tableId] ?? []
    const curLadder = data.priceLevels[tableId]

    let next: CatalogueData = { ...data, tables: { ...data.tables, [tableId]: was.table } }
    const changed = fieldChanges(tableId, cur, was.table)
    if (was.rows) {
      next = withRows(next, tableId, was.rows)
    }
    if (was.ladder !== undefined) {
      const priceLevels = { ...data.priceLevels }
      if (was.ladder === null) delete priceLevels[tableId]
      else priceLevels[tableId] = was.ladder
      next = { ...next, priceLevels }
    }
    const said = label(kind, cur.name)
    return {
      next,
      said,
      event: event({
        kind,
        at: now,
        said,
        tableId,
        tableName: cur.name,
        provenance: cur.description,
        changed,
      }),
      inverse: restoreShape(kind, tableId, {
        table: cur,
        ...(was.rows ? { rows: curRows } : {}),
        ...(was.ladder !== undefined ? { ladder: curLadder ?? null } : {}),
      }),
    }
  }
}

/** Everything a deleted table took with it, by reference. */
interface Struck {
  table: EntityDef
  rows: RowData[]
  ladder: PriceLevel[] | null
  /** other tables as they were before their link columns went */
  others?: Record<string, EntityDef>
  /** their rows as they were before the link cells went */
  otherRows?: Record<string, RowData[]>
  rules?: Readonly<Record<string, RuleDef>>
  views?: Readonly<Record<string, ViewDef>>
  modules?: Readonly<Record<string, ModuleDef>>
}

/** Put a struck table back with everything that went with it — the
 *  half a person could not see going. NOTHING when a table with that
 *  id is already on the sheet. */
function reinstateTable(struck: Struck): CatalogueCommand {
  return (data, now) => {
    const { table } = struck
    if (data.tables[table.id]) return NOTHING
    const tables: Record<string, EntityDef> = {
      ...data.tables,
      ...struck.others,
      [table.id]: table,
    }
    const rows: Record<string, RowData[]> = {
      ...data.rows,
      ...struck.otherRows,
      [table.id]: struck.rows,
    }
    const priceLevels = { ...data.priceLevels }
    if (struck.ladder) priceLevels[table.id] = struck.ladder
    const said = label('table-created', table.name)
    return {
      next: {
        ...data,
        tables,
        rows,
        index: indexRows(rows),
        priceLevels,
        rules: struck.rules ?? data.rules,
        views: struck.views ?? data.views,
        modules: struck.modules ?? data.modules,
      },
      said,
      event: event({
        kind: 'table-created',
        at: now,
        said,
        tableId: table.id,
        tableName: table.name,
        provenance: table.description,
        changed: [change(`tables.${table.id}.name`, null, table.name)],
      }),
      inverse: deleteTable(table.id),
    }
  }
}

/** Take a table off that was just made: the table and its rows and
 *  ladder, and nothing else, because nothing else could have grown
 *  on it. NOTHING when it is already gone. */
function dropTable(tableId: string): CatalogueCommand {
  return (data, now) => {
    const table = data.tables[tableId]
    if (!table) return NOTHING
    const rows = data.rows[tableId] ?? []
    const tables = { ...data.tables }
    delete tables[tableId]
    const rest = { ...data.rows }
    delete rest[tableId]
    const priceLevels = { ...data.priceLevels }
    const ladder = priceLevels[tableId] ?? null
    delete priceLevels[tableId]
    const said = label('table-deleted', table.name)
    return {
      next: {
        ...data,
        tables,
        rows: rest,
        index: indexRows(rest),
        priceLevels,
      },
      said,
      event: event({
        kind: 'table-deleted',
        at: now,
        said,
        tableId,
        tableName: table.name,
        provenance: table.description,
        changed: [change(`tables.${tableId}.name`, table.name, null)],
      }),
      inverse: reinstateTable({ table, rows, ladder }),
    }
  }
}

/* ============================================================
   CELLS AND ROWS
   ============================================================ */

/**
 * One cell. The write the sheet makes most, and the one the old
 * store explained the most about — "nothing about a number you just
 * typed is invisible a second later", so this is the act a screen
 * does NOT toast; it is recorded, and Ctrl+Z gives the cell back.
 *
 * A LINK CELL MUST POINT AT A ROW OF THE TABLE IT LINKS TO. The old
 * store wrote whatever it was handed; a dead id in a link cell is
 * exactly the silent loss `cascadeOfRowDelete` exists to prevent on
 * the other side, so it is refused on this one, with the row and the
 * table named.
 */
export const updateCell =
  (tableId: string, rowId: string, fieldId: string, value: CellValue): CatalogueCommand =>
  (data, now) => {
    const table = data.tables[tableId]
    if (!table) return { refused: TABLE_GONE }
    const list = data.rows[tableId] ?? []
    const at = list.findIndex((r) => r.id === rowId)
    if (at < 0) return { refused: ROW_GONE }
    if (isSystemFieldId(fieldId)) return { refused: UID_LOCKED }
    const field = table.fields.find((f) => f.id === fieldId)
    if (!field) return { refused: COLUMN_GONE }
    if (field.type === 'formula') return { refused: computedColumn(field) }
    if (field.type === 'reference' && typeof value === 'string' && value !== '') {
      const target = field.refEntityId ? data.tables[field.refEntityId] : undefined
      if (!target) return { refused: linkNeedsTable(field.refEntityId) }
      if (!(data.rows[target.id] ?? []).some((r) => r.id === value)) {
        return { refused: notARowOf(field, target, value) }
      }
    }

    const prev = list[at]
    /* A COMMIT THAT CHANGED NOTHING IS NOT A STEP. */
    if (cellUnchanged(prev.values[fieldId], value)) return NOTHING

    const row = touch({ ...prev, values: { ...prev.values, [fieldId]: value } }, now)
    const next = [...list]
    next[at] = row
    const said = label('cell-set', table.name)
    return {
      next: withRows(data, tableId, next),
      said,
      event: event({
        kind: 'cell-set',
        at: now,
        said,
        tableId,
        tableName: table.name,
        rowId,
        fieldId,
        provenance: table.description,
        changed: [
          change(`${tableId}.${rowId}.${fieldId}`, held(prev.values[fieldId]), held(value)),
        ],
      }),
      inverse: putRow('cell-set', tableId, prev),
    }
  }

/**
 * A row at the foot of the table. Cells arrive from the caller or
 * from each column's default; a calculated column is never stored
 * and a column the table does not have is not written. The id is
 * minted here unless the caller needs it first — a screen that puts
 * the caret in the new row does.
 */
export const addRow =
  (
    tableId: string,
    values?: Record<string, CellValue>,
    rowId: string = newId(),
  ): CatalogueCommand =>
  (data, now) => {
    const table = data.tables[tableId]
    if (!table) return { refused: TABLE_GONE }
    if (hasRow(data.rows, rowId))
      return { refused: `A row with the id “${rowId}” is already on the sheet.` }

    const cells: Record<string, CellValue> = {}
    for (const f of table.fields) {
      if (f.type === 'formula') continue
      if (values && f.id in values) cells[f.id] = values[f.id]
      else if (f.defaultValue !== undefined) cells[f.id] = f.defaultValue
    }
    const row: RowData = {
      id: rowId,
      orgId: table.orgId,
      entityId: tableId,
      values: cells,
      createdAt: now,
      updatedAt: now,
    }
    const list = data.rows[tableId] ?? []
    const said = label('row-added', table.name)
    return {
      next: withRows(data, tableId, [...list, row]),
      said,
      event: event({
        kind: 'row-added',
        at: now,
        said,
        tableId,
        tableName: table.name,
        rowId,
        provenance: table.description,
        changed: [change(`${tableId}.${rowId}`, null, rowLabel(table, row))],
      }),
      inverse: takeRowOff(tableId, rowId),
    }
  }

/** The way back from adding a row: the raw removal, NOTHING when the
 *  row is already off. Its own way back puts THIS row back at the
 *  index it held — never a re-add, which would mint a new id. */
function takeRowOff(tableId: string, rowId: string): CatalogueCommand {
  return (data, now) => {
    const table = data.tables[tableId]
    const list = data.rows[tableId]
    if (!table || !list) return NOTHING
    const at = list.findIndex((r) => r.id === rowId)
    if (at < 0) return NOTHING
    const row = list[at]
    const said = label('row-deleted', table.name)
    return {
      next: withRows(
        data,
        tableId,
        list.filter((r) => r.id !== rowId),
      ),
      said,
      event: event({
        kind: 'row-deleted',
        at: now,
        said,
        tableId,
        tableName: table.name,
        rowId,
        provenance: table.description,
        changed: [change(`${tableId}.${rowId}`, rowLabel(table, row), null)],
      }),
      inverse: restoreRows('row-added', [{ tableId, row, at }], [], takeRowOff(tableId, rowId)),
    }
  }
}

/** What deleting a row would take with it, before it is asked for. */
export interface DeleteRowRadius {
  cascade: RowCascade
  /** the sentence, or '' when nothing else is named by the row */
  said: string
}

export function deleteRowRadius(
  data: CatalogueData,
  tableId: string,
  rowId: string,
): DeleteRowRadius {
  const cascade = cascadeOfRowDelete(data.tables, data.rows, tableId, rowId)
  return { cascade, said: rowCascadeSay(cascade) }
}

/**
 * A row off the sheet — AND EVERYTHING THAT NAMED IT. The pairings
 * that go and the links that are emptied are counted by
 * `cascadeOfRowDelete`, said in `also`, and done here off the same
 * answer. The way back puts every one of them back where it sat.
 */
export const deleteRow =
  (tableId: string, rowId: string): CatalogueCommand =>
  (data, now) => {
    const table = data.tables[tableId]
    if (!table) return { refused: TABLE_GONE }
    const list = data.rows[tableId] ?? []
    const at = list.findIndex((r) => r.id === rowId)
    if (at < 0) return { refused: ROW_GONE }
    const row = list[at]
    const radius = deleteRowRadius(data, tableId, rowId)

    const rows: Record<string, RowData[]> = { ...data.rows }
    const taken: Taken[] = [{ tableId, row, at }]
    rows[tableId] = list.filter((r) => r.id !== rowId)

    for (const hold of radius.cascade.pairings) {
      let working = rows[hold.tableId] ?? []
      for (const id of hold.rowIds) {
        const i = working.findIndex((r) => r.id === id)
        if (i < 0) continue
        taken.push({ tableId: hold.tableId, row: working[i], at: i })
        working = working.filter((_, k) => k !== i)
      }
      rows[hold.tableId] = working
    }

    /* THE ROW AS IT WAS BEFORE THIS ACT, once per row, however many
       link columns on it named the subject */
    const originals = new Map<string, RowData>()
    for (const hold of radius.cascade.unlinked) {
      const ids = new Set(hold.rowIds)
      rows[hold.tableId] = (rows[hold.tableId] ?? []).map((r) => {
        if (!ids.has(r.id)) return r
        if (!originals.has(r.id)) originals.set(r.id, r)
        const values = { ...r.values }
        delete values[hold.fieldId]
        const next = touch({ ...r, values }, now)
        return next
      })
    }

    const said = label('row-deleted', table.name)
    return {
      next: {
        ...data,
        rows,
        index: indexRows(rows),
      },
      said,
      event: event({
        kind: 'row-deleted',
        at: now,
        said,
        tableId,
        tableName: table.name,
        rowId,
        provenance: table.description,
        also: radius.said,
        changed: [change(`${tableId}.${rowId}`, rowLabel(table, row), null)],
      }),
      inverse: restoreRows('row-added', taken, [...originals.values()], deleteRow(tableId, rowId)),
    }
  }

/* ============================================================
   COLUMNS
   ============================================================ */

export interface AddFieldArgs {
  name?: string
  type?: FieldType
  description?: string
  required?: boolean
  sectionId?: string
  options?: string[]
  refEntityId?: string
  formula?: string
  defaultValue?: CellValue
  /** declare the new column as a rung of the table's price ladder —
   *  refused for a cost column, by construction and not by manners */
  level?: { key: string; label?: string; scope: 'quote' | 'line'; contains?: RungContents }
  /** for well-known system columns only; omit it and one is minted */
  fieldId?: string
}

/**
 * A column at the end of the table. Named by the caller or as
 * `Column N` (never `Field N`); refused when the name or the id is
 * already on the table, when a link points nowhere, and when it is
 * asked to be a rung of the ladder that a rung cannot be.
 */
export const addField =
  (tableId: string, args: AddFieldArgs = {}): CatalogueCommand =>
  (data, now) => {
    const table = data.tables[tableId]
    if (!table) return { refused: TABLE_GONE }
    const fieldId = args.fieldId ?? newId()
    if (table.fields.some((f) => f.id === fieldId)) {
      return { refused: `A column with the id “${fieldId}” is already on this table.` }
    }
    const name = args.name?.trim() || draftColumnName(table.fields.map((f) => f.name))
    if (table.fields.some((f) => sameName(f.name, name))) return { refused: columnTaken(name) }
    const type = args.type ?? 'text'
    if (type === 'reference' && !(args.refEntityId && data.tables[args.refEntityId])) {
      return { refused: linkNeedsTable(args.refEntityId) }
    }

    const field: FieldDef = { id: fieldId, name, type }
    if (args.description !== undefined) field.description = args.description
    if (args.required !== undefined) field.required = args.required
    if (args.sectionId !== undefined) field.sectionId = args.sectionId
    if (type === 'select' && args.options) field.options = [...args.options]
    if (type === 'reference' && args.refEntityId) field.refEntityId = args.refEntityId
    if (type === 'formula' && args.formula !== undefined) field.formula = args.formula
    if (type !== 'formula' && args.defaultValue !== undefined)
      field.defaultValue = args.defaultValue

    let ladder: PriceLevel[] | undefined
    if (args.level) {
      const shaped: EntityDef = { ...table, fields: [...table.fields, field] }
      if (type !== 'number') return { refused: rungNotANumber(field) }
      if (isCostColumn(shaped, field)) return { refused: costAsRung(field) }
      const had = ladderOf(data, table)
      if (had.some((l) => l.key === args.level?.key)) return { refused: rungTaken(args.level.key) }
      const rung: PriceLevel = {
        key: args.level.key,
        label: args.level.label ?? name,
        fieldId,
        scope: args.level.scope,
        ...(args.level.contains ? { contains: args.level.contains } : {}),
      }
      ladder = [...had, rung]
    }

    const nextTable = touch(
      { ...table, fields: [...table.fields, field], ...(ladder ? { priceLevels: ladder } : {}) },
      now,
    )
    const priceLevels = ladder ? { ...data.priceLevels, [tableId]: ladder } : data.priceLevels
    const said = label('column-added', table.name)
    return {
      next: { ...data, tables: { ...data.tables, [tableId]: nextTable }, priceLevels },
      said,
      event: event({
        kind: 'column-added',
        at: now,
        said,
        tableId,
        tableName: table.name,
        fieldId,
        provenance: table.description,
        changed: [
          change(`${tableId}.fields.${fieldId}.name`, null, name),
          change(`${tableId}.fields.${fieldId}.type`, null, type),
          ...(ladder
            ? [change(`${tableId}.priceLevels.${args.level?.key ?? ''}`, null, fieldId)]
            : []),
        ],
      }),
      inverse: restoreShape('column-added', tableId, {
        table,
        ...(ladder ? { ladder: data.priceLevels[tableId] ?? null } : {}),
      }),
    }
  }

/**
 * A new name — AND THE CALCULATIONS THAT READ THE OLD ONE. Formula
 * references resolve by name, so every reader `formulaReaders` finds
 * is rewritten with `renameFieldRefs` in the same step; the old
 * store renamed and left `Error — Unknown field [Base Cost]` behind.
 * The way back is the table as it was, readers and all.
 */
export const renameField =
  (tableId: string, fieldId: string, name: string): CatalogueCommand =>
  (data, now) => {
    const table = data.tables[tableId]
    if (!table) return { refused: TABLE_GONE }
    const field = table.fields.find((f) => f.id === fieldId)
    if (!field) return { refused: COLUMN_GONE }
    if (isPairFieldId(fieldId)) return { refused: machinery(field, 'keeps its name') }
    const clean = name.trim()
    if (clean === '') return { refused: COLUMN_NEEDS_NAME }
    if (clean === field.name) return NOTHING
    if (table.fields.some((f) => f.id !== fieldId && sameName(f.name, clean))) {
      return { refused: columnTaken(clean) }
    }

    const readers = formulaReaders(table, field)
    const rewritten = new Set(readers.map((r) => r.id))
    const fields = table.fields.map((f) => {
      if (f.id === fieldId) return { ...f, name: clean }
      if (!rewritten.has(f.id) || !f.formula) return f
      return { ...f, formula: renameFieldRefs(f.formula, field.name, clean).src }
    })
    const also =
      readers.length === 0
        ? ''
        : `${noun(readers.length, 'calculated column', 'calculated columns')} that read it (${nameList(readers.map((r) => r.name))}) now ${readers.length === 1 ? 'reads' : 'read'} “${clean}”.`
    const said = label('column-renamed', table.name)
    return {
      next: { ...data, tables: { ...data.tables, [tableId]: touch({ ...table, fields }, now) } },
      said,
      event: event({
        kind: 'column-renamed',
        at: now,
        said,
        tableId,
        tableName: table.name,
        fieldId,
        provenance: table.description,
        also,
        changed: [change(`${tableId}.fields.${fieldId}.name`, field.name, clean)],
      }),
      inverse: restoreShape('column-renamed', tableId, { table }),
    }
  }

/** What a retype would do, before it is asked for. */
export interface RetypeRadius {
  plan: RetypePlan
  /** rules that would gain a blocker */
  rules: RuleBreak[]
  /** the sentence about the cells, always said */
  said: string
  /** null when the retype may run; otherwise why not */
  refusal: string | null
}

const retypeSentence = (plan: RetypePlan, to: FieldType): string => {
  if (plan.filled === 0) return 'The column is empty, so nothing is lost.'
  const cells = noun(plan.filled, 'value', 'values')
  const carried = plan.carried.length
  const lost = plan.lost
  if (lost === 0) return `All ${cells} cross as ${to}.`
  if (carried === 0) {
    return `None of the ${cells} can be read as ${to}, so all ${plan.filled} ${plan.filled === 1 ? 'is' : 'are'} cleared.`
  }
  return `${carried} of ${cells} cross as ${to}; ${lost} cannot and ${lost === 1 ? 'is' : 'are'} cleared.`
}

/** Why a column may not change type, or null. Shared by the radius
 *  and the command so the sheet and the act agree. */
function retypeRefusal(
  data: CatalogueData,
  table: EntityDef,
  field: FieldDef,
  to: FieldType,
  refEntityId: string | undefined,
): string | null {
  if (isPairFieldId(field.id)) return machinery(field, 'keeps its type')
  if (isPairingIdentity(table, field)) return pairingIdentity(table, field, 'keeps its type')
  const rung = ladderOf(data, table).find((l) => l.fieldId === field.id)
  if (rung) return ladderRung(field, rung)
  if (to === 'reference' && !(refEntityId && data.tables[refEntityId])) {
    return linkNeedsTable(refEntityId)
  }
  return null
}

export function retypeRadius(
  data: CatalogueData,
  tableId: string,
  fieldId: string,
  to: FieldType,
  refEntityId?: string,
): RetypeRadius {
  const table = data.tables[tableId]
  const field = table?.fields.find((f) => f.id === fieldId)
  if (!table || !field) {
    return {
      plan: { filled: 0, carried: [], lostSamples: [], lost: 0 },
      rules: [],
      said: '',
      refusal: table ? COLUMN_GONE : TABLE_GONE,
    }
  }
  const plan = retypePlan(data.rows[tableId], field, to)
  return {
    plan,
    rules: retypeBreakage(
      {
        entities: data.tables as Record<string, EntityDef>,
        rowsByEntity: data.rows as Record<string, RowData[]>,
      },
      data.rules as Record<string, RuleDef>,
      tableId,
      fieldId,
      to,
    ),
    said: retypeSentence(plan, to),
    refusal: retypeRefusal(data, table, field, to, refEntityId),
  }
}

export interface RetypeExtra {
  /** the choices, when the new type is a list */
  options?: string[]
  /** the table, when the new type is a link */
  refEntityId?: string
  /** the expression, when the new type is calculated */
  formula?: string
}

/**
 * A change of TYPE — THE DESTRUCTIVE ONE, and the one the old sheet
 * made with no value of the data in sight. What crosses is what
 * `convertCell` can read as the new type, written plainly; what
 * cannot is cleared, and the count of each is said before and kept
 * on the event. The old store cleared every cell and left a person
 * to type 187 numbers back in; this carries the 186 that were
 * numbers and clears the one that read "3 + 1".
 *
 * A PAIRING'S IDENTITY COLUMNS KEEP THEIR TYPE. The two links that
 * make a join a join, and the three pair columns every curated join
 * carries, are what `pairs.ts` reads a pairing by. Retyping one is
 * not a change to a column, it is the end of the relationship, and
 * that is `deleteTable`'s act with its own sentence.
 *
 * A RUNG OF THE PRICE LADDER KEEPS ITS TYPE, because a quote prices
 * from that column and a rung that is text prices nothing.
 */
export const retypeField =
  (tableId: string, fieldId: string, to: FieldType, extra: RetypeExtra = {}): CatalogueCommand =>
  (data, now) => {
    const table = data.tables[tableId]
    if (!table) return { refused: TABLE_GONE }
    const field = table.fields.find((f) => f.id === fieldId)
    if (!field) return { refused: COLUMN_GONE }
    if (field.type === to) return NOTHING
    const why = retypeRefusal(data, table, field, to, extra.refEntityId)
    if (why !== null) return { refused: why }

    const plan = retypePlan(data.rows[tableId], field, to)
    const carried = new Map(plan.carried.map((c) => [c.rowId, c.value]))

    const shaped: FieldDef = { ...field, type: to }
    /* stale config from the old type must not linger */
    delete shaped.options
    delete shaped.refEntityId
    delete shaped.formula
    delete shaped.defaultValue
    if (to === 'select' && extra.options) shaped.options = [...extra.options]
    if (to === 'reference' && extra.refEntityId) shaped.refEntityId = extra.refEntityId
    if (to === 'formula' && extra.formula !== undefined) shaped.formula = extra.formula

    const list = data.rows[tableId] ?? []
    const rows = list.map((r) => {
      if (!isFilled(r.values[fieldId])) return r
      const values = { ...r.values }
      const kept = carried.get(r.id)
      if (kept === undefined) delete values[fieldId]
      else values[fieldId] = kept
      const next = touch({ ...r, values }, now)
      return next
    })
    const fields = table.fields.map((f) => (f.id === fieldId ? shaped : f))
    const said = label('column-retyped', table.name)
    return {
      next: withRows(
        { ...data, tables: { ...data.tables, [tableId]: touch({ ...table, fields }, now) } },
        tableId,
        rows,
      ),
      said,
      event: event({
        kind: 'column-retyped',
        at: now,
        said,
        tableId,
        tableName: table.name,
        fieldId,
        provenance: table.description,
        also: retypeSentence(plan, to),
        changed: [
          change(`${tableId}.fields.${fieldId}.type`, field.type, to),
          change(`${tableId}.fields.${fieldId}.carried`, null, plan.carried.length),
          change(`${tableId}.fields.${fieldId}.cleared`, null, plan.lost),
        ],
      }),
      inverse: restoreShape('column-retyped', tableId, { table, rows: list }),
    }
  }

/** What re-pointing a link would do, before it is asked for. */
export interface RetargetRadius {
  /** links that would be emptied */
  filled: number
  rules: RuleBreak[]
  said: string
  refusal: string | null
}

function retargetRefusal(data: CatalogueData, field: FieldDef, toTableId: string): string | null {
  if (field.type !== 'reference') return notALink(field)
  if (!data.tables[toTableId]) return linkNeedsTable(toTableId)
  return null
}

const retargetSentence = (n: number, from: string, to: string): string =>
  n === 0 ? '' : `${noun(n, 'link', 'links')} emptied — a row id of ${from} means nothing in ${to}.`

export function retargetRadius(
  data: CatalogueData,
  tableId: string,
  fieldId: string,
  toTableId: string,
): RetargetRadius {
  const table = data.tables[tableId]
  const field = table?.fields.find((f) => f.id === fieldId)
  if (!table || !field) {
    return { filled: 0, rules: [], said: '', refusal: table ? COLUMN_GONE : TABLE_GONE }
  }
  const filled = (data.rows[tableId] ?? []).filter((r) => isFilled(r.values[fieldId])).length
  const from = field.refEntityId ? data.tables[field.refEntityId]?.name : undefined
  return {
    filled,
    rules: retargetBreakage(
      {
        entities: data.tables as Record<string, EntityDef>,
        rowsByEntity: data.rows as Record<string, RowData[]>,
      },
      data.rules as Record<string, RuleDef>,
      tableId,
      fieldId,
      toTableId,
    ),
    said: retargetSentence(
      filled,
      from ?? 'the old table',
      data.tables[toTableId]?.name ?? toTableId,
    ),
    refusal: retargetRefusal(data, field, toTableId),
  }
}

/**
 * Re-aim a link at another table — AND EMPTY EVERY LINK, in the same
 * step. The old designer did this as two calls inside one event
 * handler and relied on the microtask to fold them; here it is one
 * act, because "a row id of the old target means nothing in the new
 * one" is the reason the cells go, and a person pressing Ctrl+Z is
 * owed both halves back together.
 */
export const retargetField =
  (tableId: string, fieldId: string, toTableId: string): CatalogueCommand =>
  (data, now) => {
    const table = data.tables[tableId]
    if (!table) return { refused: TABLE_GONE }
    const field = table.fields.find((f) => f.id === fieldId)
    if (!field) return { refused: COLUMN_GONE }
    if (field.refEntityId === toTableId) return NOTHING
    const why = retargetRefusal(data, field, toTableId)
    if (why !== null) return { refused: why }

    const shaped: FieldDef = { ...field, refEntityId: toTableId }
    delete shaped.defaultValue
    const list = data.rows[tableId] ?? []
    let emptied = 0
    const rows = list.map((r) => {
      if (!isFilled(r.values[fieldId])) return r
      emptied += 1
      /* NULL, NOT A MISSING KEY — the old designer's re-point wrote
         null into every link, and a link a person emptied is a stored
         nothing rather than a cell nobody ever filled */
      const next = touch({ ...r, values: { ...r.values, [fieldId]: null } }, now)
      return next
    })
    const from = field.refEntityId
      ? (data.tables[field.refEntityId]?.name ?? field.refEntityId)
      : 'nowhere'
    const fields = table.fields.map((f) => (f.id === fieldId ? shaped : f))
    const said = label('column-repointed', table.name)
    return {
      next: withRows(
        { ...data, tables: { ...data.tables, [tableId]: touch({ ...table, fields }, now) } },
        tableId,
        rows,
      ),
      said,
      event: event({
        kind: 'column-repointed',
        at: now,
        said,
        tableId,
        tableName: table.name,
        fieldId,
        provenance: table.description,
        also: retargetSentence(emptied, from, data.tables[toTableId].name),
        changed: [
          change(`${tableId}.fields.${fieldId}.refEntityId`, field.refEntityId ?? null, toTableId),
          change(`${tableId}.fields.${fieldId}.emptied`, null, emptied),
        ],
      }),
      inverse: restoreShape('column-repointed', tableId, { table, rows: list }),
    }
  }

/** What deleting a column would take, and what would be left holding
 *  on to it — the old confirm's own sentence, computed. */
export interface DeleteFieldRadius {
  /** cells holding a value, which go */
  filled: number
  /** rungs of the price ladder standing on it, which go */
  rungs: PriceLevel[]
  /** calculated columns on the table that read it — left broken, named */
  readers: FieldDef[]
  /** rules that would gain a blocker */
  rules: RuleBreak[]
  /** pages that name it */
  pages: PageUse[]
  /** what goes: "This also removes …", or '' */
  said: string
  /** what is left holding on, or '' */
  holding: string
  refusal: string | null
}

function deleteFieldRefusal(table: EntityDef, field: FieldDef): string | null {
  if (isPairFieldId(field.id)) return machinery(field, 'stays')
  if (isPairingIdentity(table, field)) return pairingIdentity(table, field, 'stays')
  return null
}

export function deleteFieldRadius(
  data: CatalogueData,
  tableId: string,
  fieldId: string,
): DeleteFieldRadius {
  const table = data.tables[tableId]
  const field = table?.fields.find((f) => f.id === fieldId)
  if (!table || !field) {
    return {
      filled: 0,
      rungs: [],
      readers: [],
      rules: [],
      pages: [],
      said: '',
      holding: '',
      refusal: table ? COLUMN_GONE : TABLE_GONE,
    }
  }
  const filled = (data.rows[tableId] ?? []).filter((r) => isFilled(r.values[fieldId])).length
  const rungs = ladderOf(data, table).filter((l) => l.fieldId === fieldId)
  const readers = formulaReaders(table, field)
  const rules = ruleBreakage(
    {
      entities: data.tables as Record<string, EntityDef>,
      rowsByEntity: data.rows as Record<string, RowData[]>,
    },
    data.rules as Record<string, RuleDef>,
    tableId,
    fieldId,
  )
  const pages = fieldViewers(
    data.views as Record<string, ViewDef>,
    data.tables as Record<string, EntityDef>,
    tableId,
    fieldId,
  )

  const parts: string[] = []
  if (filled > 0) parts.push(noun(filled, 'value', 'values'))
  if (rungs.length === 1) parts.push(`the ${rungs[0].label} rung of the price ladder`)
  else if (rungs.length > 1) parts.push(`${rungs.length} rungs of the price ladder`)

  const holds: string[] = []
  if (readers.length > 0) {
    holds.push(
      `${noun(readers.length, 'calculated column', 'calculated columns')} (${nameList(readers.map((r) => r.name))}) ${readers.length === 1 ? 'reads' : 'read'} it`,
    )
  }
  if (rules.length > 0) holds.push(`${noun(rules.length, 'rule names', 'rules name')} it`)
  if (pages.length > 0) holds.push(`${noun(pages.length, 'page shows', 'pages show')} it`)
  const holding =
    holds.length === 0 ? '' : `${nameList(holds).replace(/^./, (c) => c.toUpperCase())}.`

  return {
    filled,
    rungs,
    readers,
    rules,
    pages,
    said: sayAlso(parts),
    holding,
    refusal: deleteFieldRefusal(table, field),
  }
}

/**
 * A column off the table, with its cells and the rungs standing on
 * it. The way back puts the column at its own place in the list, in
 * its own band, with its values — the old delete sheet's own promise,
 * kept by putting the table object back rather than re-adding.
 */
export const deleteField =
  (tableId: string, fieldId: string): CatalogueCommand =>
  (data, now) => {
    const table = data.tables[tableId]
    if (!table) return { refused: TABLE_GONE }
    const field = table.fields.find((f) => f.id === fieldId)
    if (!field) return { refused: COLUMN_GONE }
    const why = deleteFieldRefusal(table, field)
    if (why !== null) return { refused: why }
    const radius = deleteFieldRadius(data, tableId, fieldId)

    const shaped: EntityDef = { ...table, fields: table.fields.filter((f) => f.id !== fieldId) }
    if (shaped.displayFieldId === fieldId) delete shaped.displayFieldId
    if (shaped.hierarchy?.includes(fieldId)) {
      shaped.hierarchy = shaped.hierarchy.filter((id) => id !== fieldId)
    }
    let priceLevels = data.priceLevels
    if (radius.rungs.length > 0) {
      const kept = ladderOf(data, table).filter((l) => l.fieldId !== fieldId)
      const next = { ...data.priceLevels }
      if (kept.length === 0) delete next[tableId]
      else next[tableId] = kept
      priceLevels = next
      if (shaped.priceLevels) {
        if (kept.length === 0) delete shaped.priceLevels
        else shaped.priceLevels = kept
      }
    }

    const list = data.rows[tableId] ?? []
    const rows = list.map((r) => {
      if (!(fieldId in r.values)) return r
      const values = { ...r.values }
      delete values[fieldId]
      const next = touch({ ...r, values }, now)
      return next
    })
    const said = label('column-deleted', table.name)
    return {
      next: withRows(
        { ...data, tables: { ...data.tables, [tableId]: touch(shaped, now) }, priceLevels },
        tableId,
        rows,
      ),
      said,
      event: event({
        kind: 'column-deleted',
        at: now,
        said,
        tableId,
        tableName: table.name,
        fieldId,
        provenance: table.description,
        also: [radius.said, radius.holding].filter(Boolean).join(' '),
        changed: [
          change(`${tableId}.fields.${fieldId}.name`, field.name, null),
          change(`${tableId}.fields.${fieldId}.cleared`, null, radius.filled),
        ],
      }),
      inverse: restoreShape('column-deleted', tableId, {
        table,
        rows: list,
        ...(radius.rungs.length > 0 ? { ladder: data.priceLevels[tableId] ?? null } : {}),
      }),
    }
  }

/* ============================================================
   TABLES
   ============================================================ */

export interface CreateTableArgs {
  name?: string
  kind?: TableKind
  role?: TableRole
  description?: string
  accent?: AccentKey
  /** the columns, ids included; one `Name` text column when absent */
  fields?: FieldDef[]
  hierarchy?: string[]
  sections?: ColumnSection[]
  /** the ladder — refused for a rung on a cost column or a non-number */
  priceLevels?: PriceLevel[]
  /** for restoring a well-known table only; omit it and one is minted */
  tableId?: string
  position?: XY
}

/**
 * A table on the sheet. Refused without an organisation to file it
 * under, with a name another table holds, and with a ladder standing
 * on a cost column — the packer refuses that declaration and the app
 * refuses it again here, by construction.
 */
export const createTable =
  (args: CreateTableArgs = {}): CatalogueCommand =>
  (data, now) => {
    if (data.orgId === null) return { refused: NO_ORG }
    const tableId = args.tableId ?? newId()
    if (data.tables[tableId])
      return { refused: `There is already a table with the id “${tableId}” on the sheet.` }
    const meta = args.kind ? TABLE_KINDS[args.kind] : undefined
    const name = args.name?.trim() || meta?.label || ''
    if (name === '') return { refused: TABLE_NEEDS_NAME }
    if (Object.values(data.tables).some((t) => sameName(t.name, name)))
      return { refused: tableTaken(name) }

    const fields: FieldDef[] = args.fields
      ? args.fields.map((f) => ({ ...f }))
      : [{ id: newId(), name: 'Name', type: 'text', required: true }]
    const seenIds = new Set<string>()
    const seenNames = new Set<string>()
    for (const f of fields) {
      if (f.name.trim() === '') return { refused: 'Every column needs a name.' }
      if (seenIds.has(f.id)) return { refused: `Two columns cannot share the id “${f.id}”.` }
      const key = f.name.trim().toLowerCase()
      if (seenNames.has(key)) return { refused: `Two columns cannot share the name “${f.name}”.` }
      seenIds.add(f.id)
      seenNames.add(key)
      if (f.type === 'reference' && !(f.refEntityId && data.tables[f.refEntityId])) {
        return { refused: `The link column ${f.name} points at a table that is not on the sheet.` }
      }
    }
    for (const id of args.hierarchy ?? []) {
      if (!seenIds.has(id))
        return { refused: 'The hierarchy names a column the table does not have.' }
    }

    const count = Object.keys(data.tables).length
    const table: EntityDef = {
      id: tableId,
      orgId: data.orgId,
      name,
      accent: args.accent ?? meta?.accent ?? ACCENT_KEYS[count % ACCENT_KEYS.length],
      fields,
      position: args.position ?? {
        x: 120 + (count % 3) * 560,
        y: 120 + Math.floor(count / 3) * 420,
      },
      createdAt: now,
      updatedAt: now,
    }
    if (args.kind) table.kind = args.kind
    table.role = args.role ?? 'base'
    if (args.description !== undefined) table.description = args.description
    if (args.hierarchy && args.hierarchy.length > 0) table.hierarchy = [...args.hierarchy]
    if (args.sections && args.sections.length > 0)
      table.sections = args.sections.map((s) => ({ ...s }))
    const display = fields.find((f) => f.type !== 'formula') ?? fields[0]
    if (display) table.displayFieldId = display.id

    if (args.priceLevels && args.priceLevels.length > 0) {
      for (const rung of args.priceLevels) {
        const f = fields.find((x) => x.id === rung.fieldId)
        if (!f)
          return { refused: `The ${rung.label} rung points at a column the table does not have.` }
        if (f.type !== 'number') return { refused: rungNotANumber(f) }
        if (isCostColumn(table, f)) return { refused: costAsRung(f) }
      }
      table.priceLevels = args.priceLevels.map((l) => ({ ...l }))
    }

    const said = label('table-created', name)
    return {
      next: {
        ...data,
        tables: { ...data.tables, [tableId]: table },
        rows: { ...data.rows, [tableId]: [] },
        priceLevels: table.priceLevels
          ? { ...data.priceLevels, [tableId]: table.priceLevels }
          : data.priceLevels,
      },
      said,
      event: event({
        kind: 'table-created',
        at: now,
        said,
        tableId,
        tableName: name,
        changed: [
          change(`tables.${tableId}.name`, null, name),
          change(`tables.${tableId}.columns`, null, fields.length),
        ],
      }),
      inverse: dropTable(tableId),
    }
  }

/** Everything deleting a table takes with it, worked out before. */
export interface DeleteTableRadius {
  /** rows on the table, in the dealer's own word for them */
  rows: string
  dependents: EntityDependents
  pages: EntityPages
  cascade: DeleteCascade
  ladder: PriceLevel[]
  /** the whole of it as one sentence, or '' for a table nothing holds */
  said: string
  refusal: string | null
}

export function deleteTableRadius(data: CatalogueData, tableId: string): DeleteTableRadius {
  const table = data.tables[tableId]
  const empty: DeleteTableRadius = {
    rows: '',
    dependents: { links: [], rootedRules: [], brokenRules: [] },
    pages: { rootedViews: [], blockViews: [], places: [] },
    cascade: cascadeOfDelete(tableId, {}, {}),
    ladder: [],
    said: '',
    refusal: TABLE_GONE,
  }
  if (!table) return empty
  const list = data.rows[tableId] ?? []
  const dependents = entityDependents(
    {
      entities: data.tables as Record<string, EntityDef>,
      rowsByEntity: data.rows as Record<string, RowData[]>,
    },
    data.rules as Record<string, RuleDef>,
    tableId,
  )
  const pages = entityPages(
    data.views as Record<string, ViewDef>,
    data.modules as Record<string, ModuleDef>,
    tableId,
  )
  const cascade = cascadeOfDelete(tableId, data.views, data.modules)
  const ladder = ladderOf(data, table)

  const parts: string[] = []
  if (list.length > 0) parts.push(countLabel(list.length, leafNoun(table)))
  if (dependents.links.length === 1) {
    const [l] = dependents.links
    parts.push(`the ${l.columnName} link on ${l.tableName}`)
  } else if (dependents.links.length > 1) {
    parts.push(`${dependents.links.length} link columns on other tables`)
  }
  if (dependents.rootedRules.length === 1)
    parts.push(`the rule ${dependents.rootedRules[0].ruleName}`)
  else if (dependents.rootedRules.length > 1) parts.push(`${dependents.rootedRules.length} rules`)
  parts.push(...cascadeParts(cascade))

  return {
    rows: countLabel(list.length, leafNoun(table)),
    dependents,
    pages,
    cascade,
    ladder,
    said: sayAlso(parts),
    refusal: null,
  }
}

/**
 * A table off the sheet — WITH ITS ROWS, THE LINK COLUMNS ON OTHER
 * TABLES AIMED AT IT, THE RULES ROOTED ON IT, AND WHAT THE PAGES AND
 * MODULES LOSE. Every one of those is counted by `deleteTableRadius`
 * before the act and put back by the way back, which is the half the
 * old sheet's sentence promised and the old store could not keep,
 * because views and modules were not in its cascade.
 */
export const deleteTable =
  (tableId: string): CatalogueCommand =>
  (data, now) => {
    const table = data.tables[tableId]
    if (!table) return { refused: TABLE_GONE }
    const radius = deleteTableRadius(data, tableId)
    const list = data.rows[tableId] ?? []

    const tables: Record<string, EntityDef> = {}
    const others: Record<string, EntityDef> = {}
    const otherRows: Record<string, RowData[]> = {}
    const rows: Record<string, RowData[]> = { ...data.rows }
    delete rows[tableId]
    for (const [id, e] of Object.entries(data.tables)) {
      if (id === tableId) continue
      const aimed = e.fields.filter((f) => f.type === 'reference' && f.refEntityId === tableId)
      if (aimed.length === 0) {
        tables[id] = e
        continue
      }
      others[id] = e
      tables[id] = touch({ ...e, fields: e.fields.filter((f) => !aimed.includes(f)) }, now)
      const before = data.rows[id] ?? []
      otherRows[id] = before
      const ids = aimed.map((f) => f.id)
      rows[id] = before.map((r) => {
        if (!ids.some((fid) => fid in r.values)) return r
        const values = { ...r.values }
        for (const fid of ids) delete values[fid]
        const next = touch({ ...r, values }, now)
        return next
      })
    }

    const rules: Record<string, RuleDef> = {}
    for (const [rid, r] of Object.entries(data.rules))
      if (r.rootEntityId !== tableId) rules[rid] = r
    const priceLevels = { ...data.priceLevels }
    delete priceLevels[tableId]

    const said = label('table-deleted', table.name)
    return {
      next: {
        ...data,
        tables,
        rows,
        index: indexRows(rows),
        rules,
        views: radius.cascade.views,
        modules: radius.cascade.modules,
        priceLevels,
      },
      said,
      event: event({
        kind: 'table-deleted',
        at: now,
        said,
        tableId,
        tableName: table.name,
        provenance: table.description,
        also: radius.said,
        changed: [
          change(`tables.${tableId}.name`, table.name, null),
          change(`tables.${tableId}.rows`, list.length, null),
        ],
      }),
      inverse: reinstateTable({
        table,
        rows: list,
        ladder: data.priceLevels[tableId] ?? null,
        others,
        otherRows,
        rules: data.rules,
        views: data.views,
        modules: data.modules,
      }),
    }
  }

/* ============================================================
   THE BATCH — many acts, one step.

   The old history collapsed everything recorded in one turn of the
   event loop into one entry: a paste of forty cells, a strike of
   eight rows, the 187 `updateCell` calls of a level being set. That
   grouping was done by NOTICING that they shared a microtask, and
   `features/levels/apply.ts` had to say "the loop below must stay
   synchronous — a chunked write would be 187 undo steps". Here the
   grouping is SAID: a batch is one command, its inverse is the
   inverses in reverse, and its label is what `labelFor` gave the
   burst — "187 cell edits · Highfield Inflatables" — unless the
   caller has a sentence of its own.

   ALL OR NOTHING. A command inside the batch that REFUSES refuses
   the whole batch with its sentence, and nothing is written: a step
   half taken is the phantom entry the old `record(op)` used to leave.
   A command that did NOTHING is skipped, and a batch in which every
   command did nothing is itself nothing.
   ============================================================ */

export interface BatchOptions {
  /** the sentence the whole act says, where the caller has one —
   *  "Shaft Lgth set to “XL” on 187 variants in Ocean Master" */
  said?: string
}

export const batch =
  (commands: readonly CatalogueCommand[], options: BatchOptions = {}): CatalogueCommand =>
  (data, now) => {
    let current = data
    const inverses: CatalogueCommand[] = []
    const events: CatalogueEvent[] = []
    for (const command of commands) {
      const outcome = command(current, now)
      if (!isDone(outcome)) {
        if (outcome.refused === '') continue
        return outcome
      }
      current = outcome.next
      inverses.push(outcome.inverse)
      events.push(outcome.event)
    }
    if (events.length === 0) return NOTHING

    const burst = labelFor(events.map(opOf))
    const said = options.said ?? burst
    const tableIds = new Set(events.map((e) => e.tableId))
    const one = tableIds.size === 1 ? events[0] : undefined
    return {
      next: current,
      said,
      event: event({
        kind: 'batch',
        at: now,
        said,
        label: burst,
        tableId: one?.tableId,
        tableName: one?.tableName,
        provenance: one?.provenance,
        events,
        changed: events.flatMap((e) => e.changed),
      }),
      inverse: batch([...inverses].reverse(), options),
    }
  }
