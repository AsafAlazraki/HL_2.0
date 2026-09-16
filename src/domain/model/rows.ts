import type { CellValue, FieldDef, FieldType } from './fields'
import type { EntityDef } from './tables'

export interface RowData {
  id: string
  /** the tenant key — see EntityDef.orgId */
  orgId: string
  entityId: string
  /** keyed by FieldDef.id; formula fields never appear here */
  values: Record<string, CellValue>
  createdAt: string
  updatedAt: string
}

/* ---------------------------------------------------------- */
/* Helpers                                                    */
/* ---------------------------------------------------------- */

/* ---------------------------------------------------------- */
/* System columns                                             */
/* ---------------------------------------------------------- */

/** Every row already carries a unique id. Surfacing it as a locked
 *  system column gives every entity a real primary key by default —
 *  visible, referenceable and exported, but never renamed, retyped,
 *  reordered or deleted, and never typed into. Keeping it OUT of
 *  `EntityDef.fields` means it costs no storage, cannot collide with
 *  a user field name, and never trips the schema linter. */
export const UID_FIELD_ID = '__uid'

export const UID_FIELD: Readonly<FieldDef> = Object.freeze({
  id: UID_FIELD_ID,
  name: 'UID',
  type: 'text' as FieldType,
  required: true,
  description: 'System identifier — unique per row, assigned when the row is created.',
})

/* ============================================================
   DISCONTINUED NEVER REACHES A SALESPERSON.

   The workbook records what a dealer USED to sell as well as what
   they sell now — the Boat Module keeps everything below its own
   `OBSOLETE MODELS` divider at row 1005, and the Trailer Module
   still carries stock that is no longer available. That history is
   worth keeping: it is what an old quote was written against, and
   deleting it would make yesterday's documents unreadable.

   But 30 live pairings offer a discontinued trailer and EIGHT of
   them offer it as the boat's STANDARD fit. Somebody would have
   quoted it.

   So the rule is: the data stays, and no surface a customer can see
   ever offers it. One boolean, on the row, because a product is
   discontinued individually — and one on the table, because
   sometimes an entire relationship is (Surtees x OBSOLETE
   Trailers is a whole join of nothing but retired stock).

   It is a NORMAL BOOLEAN COLUMN, not a hidden flag: a person can
   see it in the grid, sort by it, and change it. A dealer who
   brings a model back does so by typing in a cell, not by asking
   for a developer.
   ============================================================ */
export const DISCONTINUED_FIELD_ID = '__discontinued'

export const DISCONTINUED_FIELD: Readonly<FieldDef> = Object.freeze({
  id: DISCONTINUED_FIELD_ID,
  name: 'Discontinued',
  type: 'boolean' as FieldType,
  description:
    'No longer sold. The row is kept — old quotes were written against it — but it is never offered on a page a customer sees.',
})

/** Is this row still sellable? Everything customer-facing asks this:
 *  the module index, a view page's blocks, the pickers a quote adds
 *  from. The sheet itself does NOT ask — the sheet is where a person
 *  maintains their data, and hiding rows from the person who has to
 *  fix them is how data rots unseen. */
export const isDiscontinued = (row: RowData): boolean => row.values[DISCONTINUED_FIELD_ID] === true

/** A whole table that is history rather than stock. Same reasoning as
 *  the row flag, one level up: the join survives so an old document
 *  still resolves, and nothing offers it. */
export const isRetired = (entity: EntityDef): boolean => entity.retired === true

export const isSystemFieldId = (fieldId: string): boolean => fieldId === UID_FIELD_ID

/** The entity's columns as a user sees them: UID first, then their own. */
export function visibleFields(entity: EntityDef): FieldDef[] {
  return [UID_FIELD as FieldDef, ...entity.fields]
}

/** Read a cell by field id, resolving system columns.
 *  Formula fields are not stored, so they are absent here by design —
 *  compute those through '@/domain/rules/formula'. */
export function readCell(row: RowData, fieldId: string): CellValue {
  if (isSystemFieldId(fieldId)) return row.id
  return row.values[fieldId] ?? null
}

export function displayFieldOf(entity: EntityDef): FieldDef | undefined {
  if (entity.displayFieldId) {
    const f = entity.fields.find((field) => field.id === entity.displayFieldId)
    if (f) return f
  }
  return entity.fields.find((f) => f.type !== 'formula') ?? entity.fields[0]
}

/** Label for a row using the entity's display field. */
export function rowLabel(entity: EntityDef, row: RowData): string {
  const f = displayFieldOf(entity)
  const v = f ? row.values[f.id] : null
  if (v === null || v === undefined || v === '') return `(untitled ${entity.name.toLowerCase()})`
  return String(v)
}

/* ---------------------------------------------------------- */
/* Pair fields — the three columns every curated join carries */
/* ---------------------------------------------------------- */

/** How a single related row was decided, so the page can always answer
 *  "why is this here?" / "why is this missing?".
 *  - 'rule'    the rule matched it
 *  - 'added'   a person pinned it in despite the rule
 *  - 'removed' a person took it out; kept as a row so it can be restored */
export type PairOrigin = 'rule' | 'added' | 'removed'

export const PAIR_ORIGIN_FIELD = '__origin'
export const PAIR_RECOMMENDED_FIELD = '__recommended'
/** Display order within a block — the order the salesperson sees. */
export const PAIR_ORDER_FIELD = '__order'

/** The three columns every curated join carries. They are created with
 *  these exact ids so a pair row can be read without a name lookup, and
 *  they are locked in the grid like the UID column.
 *
 *  ON THE PACK THESE ARE THE ONLY THREE FIELD IDS THAT ARE NOT
 *  `<seed key>.<column key>`: they keep their literal ids, because a
 *  pair row is read by them and never by name. The workbook's own
 *  `Recommended` and `Slot` columns are mapped onto `__recommended`
 *  and `__order` by the packer, so the starred motor actually stars. */
export const PAIR_FIELDS: ReadonlyArray<{ id: string; name: string; type: FieldType }> = [
  { id: PAIR_ORIGIN_FIELD, name: 'Origin', type: 'text' },
  { id: PAIR_RECOMMENDED_FIELD, name: 'Recommended', type: 'boolean' },
  { id: PAIR_ORDER_FIELD, name: 'Order', type: 'number' },
]

export const isPairFieldId = (fieldId: string): boolean =>
  fieldId === PAIR_ORIGIN_FIELD ||
  fieldId === PAIR_RECOMMENDED_FIELD ||
  fieldId === PAIR_ORDER_FIELD
