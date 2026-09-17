/* ============================================================
   Lint engine — applyLintFix().
   The ONLY write-coupled file in src/domain/rules/lint. Every mutation
   goes through a callback the caller hands in (never a direct state
   write), and every fix is data-preserving per REVIEW_SPEC.md.

   WHAT CHANGED ON THE WAY INTO src/domain, AND WHY IT IS THE SAME
   FUNCTION. In the old app this file read `useProjectStore.getState()`
   at the top of every helper and called store actions on it. The
   domain is pure now, so the reads arrive as a `CatalogueCtx` — a
   SNAPSHOT, which is exactly what `getState()` gave it: each helper
   read the state once and then worked from the objects the writes
   handed back (`created`, `nf`, `newRow`), never from a re-read. The
   writes arrive as `CatalogueWrites`, one callback per store action it
   used, with the same signatures and the same return values.

   Write behaviors we deliberately work WITH (the store's, and any
   adapter that fills this interface must keep them):
   - updateField wipes a field's cell values when its type
     changes → for convert-to-select / convert-to-reference we
     capture the old values FIRST, then re-write the mapped
     values with updateCell afterwards;
   - for convert-to-formula that wipe is correct and desired;
   - addField / addRow / createEntity return the created objects
     carrying their fresh ids.
   ============================================================ */

import type {
  AccentKey,
  CatalogueCtx,
  CellValue,
  EntityDef,
  FieldDef,
  RowData,
  XY,
} from '@/domain/model'
import { rowLabel } from '@/domain/model'
import type { LintFix } from './types'
import { nameKey } from './heuristics'

/**
 * The writes a fix makes, handed in by the caller. Each one is the
 * store action of the same name; `createEntity` seeds a required
 * 'Name' text field and returns the entity carrying it, which step 3
 * of the extract below depends on.
 */
export interface CatalogueWrites {
  updateEntity: (id: string, patch: Partial<Omit<EntityDef, 'id' | 'fields' | 'createdAt'>>) => void
  createEntity: (partial?: { name?: string; position?: XY; accent?: AccentKey }) => EntityDef
  addField: (
    entityId: string,
    partial?: Partial<Omit<FieldDef, 'id'>> & { id?: string },
  ) => FieldDef | null
  updateField: (entityId: string, fieldId: string, patch: Partial<Omit<FieldDef, 'id'>>) => void
  removeField: (entityId: string, fieldId: string) => void
  addRow: (entityId: string, values?: Record<string, CellValue>) => RowData | null
  updateCell: (entityId: string, rowId: string, fieldId: string, value: CellValue) => void
}

/** matching key for label/option comparison: trimmed, case-insensitive */
const matchKey = (v: CellValue): string => String(v).trim().toLowerCase()

const isEmptyCell = (v: CellValue | undefined): v is null | undefined | '' =>
  v === null || v === undefined || v === ''

/** `base`, or `base 2`, `base 3`… — first name whose key is not taken. */
function uniqueName(base: string, takenKeys: ReadonlySet<string>): string {
  const b = base.trim() || 'Field'
  if (!takenKeys.has(nameKey(b))) return b
  let n = 2
  while (takenKeys.has(nameKey(`${b} ${n}`))) n += 1
  return `${b} ${n}`
}

export function applyLintFix(fix: LintFix, ctx: CatalogueCtx, write: CatalogueWrites): void {
  switch (fix.kind) {
    case 'rename-entity': {
      if (!ctx.entities[fix.entityId]) return
      write.updateEntity(fix.entityId, { name: fix.name })
      return
    }
    case 'rename-field': {
      const e = ctx.entities[fix.entityId]
      if (!e || !e.fields.some((f) => f.id === fix.fieldId)) return
      write.updateField(fix.entityId, fix.fieldId, { name: fix.name })
      return
    }
    case 'set-display-field': {
      const e = ctx.entities[fix.entityId]
      if (!e || !e.fields.some((f) => f.id === fix.fieldId)) return
      write.updateEntity(fix.entityId, { displayFieldId: fix.fieldId })
      return
    }
    case 'make-required': {
      const e = ctx.entities[fix.entityId]
      if (!e || !e.fields.some((f) => f.id === fix.fieldId)) return
      write.updateField(fix.entityId, fix.fieldId, { required: true })
      return
    }
    case 'remove-field': {
      write.removeField(fix.entityId, fix.fieldId)
      return
    }
    case 'convert-to-reference':
      applyConvertToReference(fix, ctx, write)
      return
    case 'convert-to-select':
      applyConvertToSelect(fix, ctx, write)
      return
    case 'convert-to-formula': {
      const e = ctx.entities[fix.entityId]
      if (!e || !e.fields.some((f) => f.id === fix.fieldId)) return
      // the store wipes this field's cells on the type change — correct and desired
      write.updateField(fix.entityId, fix.fieldId, { type: 'formula', formula: fix.formula })
      return
    }
    case 'extract-entity':
      applyExtractEntity(fix, ctx, write)
      return
    default: {
      const exhaustive: never = fix
      void exhaustive
    }
  }
}

/* ---------------------------------------------------------- */
/* convert-to-reference                                       */
/* ---------------------------------------------------------- */

function applyConvertToReference(
  fix: Extract<LintFix, { kind: 'convert-to-reference' }>,
  ctx: CatalogueCtx,
  write: CatalogueWrites,
): void {
  const entity = ctx.entities[fix.entityId]
  const target = ctx.entities[fix.refEntityId]
  if (!entity || !target) return
  const field = entity.fields.find((f) => f.id === fix.fieldId)
  if (!field) return

  // already a reference: old cells hold row ids, not labels — no label mapping
  if (field.type === 'reference') {
    if (field.refEntityId === fix.refEntityId) return
    const captured = (ctx.rowsByEntity[fix.entityId] ?? []).map((r) => ({
      rowId: r.id,
      value: r.values[fix.fieldId],
    }))
    write.updateField(fix.entityId, fix.fieldId, {
      type: 'reference',
      refEntityId: fix.refEntityId,
    })
    // ids of the previous target cannot survive a retarget
    for (const c of captured) {
      if (!isEmptyCell(c.value)) write.updateCell(fix.entityId, c.rowId, fix.fieldId, null)
    }
    return
  }

  // 1 — capture old cell values BEFORE the type change wipes them
  const captured = (ctx.rowsByEntity[fix.entityId] ?? []).map((r) => ({
    rowId: r.id,
    value: r.values[fix.fieldId],
  }))

  // 2 — index the target's rows by their display label (first label wins)
  const byLabel = new Map<string, string>()
  for (const row of ctx.rowsByEntity[fix.refEntityId] ?? []) {
    const key = rowLabel(target, row).trim().toLowerCase()
    if (key && !byLabel.has(key)) byLabel.set(key, row.id)
  }

  // 3 — flip the type (store wipes cells + strips stale config)
  write.updateField(fix.entityId, fix.fieldId, { type: 'reference', refEntityId: fix.refEntityId })

  // 4 — re-write: case-insensitive trimmed match → row id, non-match → null
  for (const c of captured) {
    if (isEmptyCell(c.value)) continue
    const match = byLabel.get(matchKey(c.value))
    write.updateCell(fix.entityId, c.rowId, fix.fieldId, match ?? null)
  }
}

/* ---------------------------------------------------------- */
/* convert-to-select                                          */
/* ---------------------------------------------------------- */

function applyConvertToSelect(
  fix: Extract<LintFix, { kind: 'convert-to-select' }>,
  ctx: CatalogueCtx,
  write: CatalogueWrites,
): void {
  const entity = ctx.entities[fix.entityId]
  if (!entity) return
  const field = entity.fields.find((f) => f.id === fix.fieldId)
  if (!field) return

  // 1 — capture BEFORE updateField (a text→select type change wipes cells;
  //     select→select keeps them, and the same re-write normalizes either way)
  const captured = (ctx.rowsByEntity[fix.entityId] ?? []).map((r) => ({
    rowId: r.id,
    value: r.values[fix.fieldId],
  }))

  // 2 — set type + options
  write.updateField(fix.entityId, fix.fieldId, { type: 'select', options: [...fix.options] })

  // 3 — re-write: kept when they match an option (case-insensitive → canonical
  //     casing), else null
  const canonical = new Map<string, string>()
  for (const o of fix.options) {
    const k = o.trim().toLowerCase()
    if (k && !canonical.has(k)) canonical.set(k, o)
  }
  for (const c of captured) {
    if (isEmptyCell(c.value)) continue
    const match = canonical.get(matchKey(c.value))
    write.updateCell(fix.entityId, c.rowId, fix.fieldId, match ?? null)
  }
}

/* ---------------------------------------------------------- */
/* extract-entity — the flagship fix                          */
/* ---------------------------------------------------------- */

function applyExtractEntity(
  fix: Extract<LintFix, { kind: 'extract-entity' }>,
  ctx: CatalogueCtx,
  write: CatalogueWrites,
): void {
  const src = ctx.entities[fix.entityId]
  if (!src) return
  const moved: FieldDef[] = []
  for (const id of fix.fieldIds) {
    const f = src.fields.find((x) => x.id === id)
    if (f) moved.push(f)
  }
  if (moved.length === 0) return
  const movedIds = new Set(moved.map((f) => f.id))

  // 1 — capture every source row's moved-value tuple BEFORE any mutation
  const sourceRows = (ctx.rowsByEntity[src.id] ?? []).map((r) => ({
    rowId: r.id,
    tuple: moved.map((f) => r.values[f.id] ?? null),
  }))

  // 2 — create the new entity (accent auto via the store, positioned near the
  //     source); dedupe the name so we never trip the duplicate-name guardrail
  const takenEntityKeys = new Set(Object.values(ctx.entities).map((e) => nameKey(e.name)))
  const newName = uniqueName(fix.newEntityName.trim() || 'Extracted', takenEntityKeys)
  const created = write.createEntity({
    name: newName,
    position: { x: src.position.x + 380, y: src.position.y + 40 },
  })

  // 3 — the store seeds a required 'Name' text field; keep it only when the
  //     moved fields bring no text field of their own (spec: ensure a required
  //     text Name exists exactly when none of the moved fields is text)
  const seeded = created.fields.find((f) => f.type === 'text' && nameKey(f.name) === 'name')
  const movedHasText = moved.some((f) => f.type === 'text')
  const movedNameKeys = new Set(moved.map((f) => nameKey(f.name)))
  let nameFieldId: string | null = null
  if (movedHasText) {
    if (seeded) write.removeField(created.id, seeded.id)
  } else if (seeded && !movedNameKeys.has(nameKey(seeded.name))) {
    nameFieldId = seeded.id // already { name:'Name', type:'text', required:true }
  } else {
    if (seeded) write.removeField(created.id, seeded.id)
    const nf = write.addField(created.id, {
      name: uniqueName('Name', movedNameKeys),
      type: 'text',
      required: true,
    })
    nameFieldId = nf?.id ?? null
  }

  // 4 — move the fields in: same shapes as new FieldDefs (fresh ids from the
  //     store); remember old → new id mapping for the data migration
  const idMap = new Map<string, string>()
  let firstTextNewId: string | null = null
  for (const f of moved) {
    const partial: Partial<Omit<FieldDef, 'id'>> = { name: f.name, type: f.type }
    if (f.description !== undefined) partial.description = f.description
    if (f.required !== undefined) partial.required = f.required
    if (f.options !== undefined) partial.options = [...f.options]
    if (f.refEntityId !== undefined) partial.refEntityId = f.refEntityId
    if (f.formula !== undefined) partial.formula = f.formula
    if (f.defaultValue !== undefined) partial.defaultValue = f.defaultValue
    const nf = write.addField(created.id, partial)
    if (!nf) continue
    idMap.set(f.id, nf.id)
    if (firstTextNewId === null && f.type === 'text') firstTextNewId = nf.id
  }

  // 5 — label rows by the first moved text field, else the Name field
  const displayFieldId = firstTextNewId ?? nameFieldId
  if (displayFieldId) write.updateEntity(created.id, { displayFieldId })

  // 6 — migrate data: distinct value-tuples of the moved fields become rows of
  //     the new entity (first-seen order; all-blank tuples create no row)
  const isEmpty = (v: CellValue) => v === null || v === ''
  const rowForTuple = new Map<string, string>()
  for (const srcRow of sourceRows) {
    if (srcRow.tuple.every(isEmpty)) continue
    const key = JSON.stringify(srcRow.tuple)
    if (rowForTuple.has(key)) continue
    const values: Record<string, CellValue> = {}
    moved.forEach((f, i) => {
      const nid = idMap.get(f.id)
      if (nid) values[nid] = srcRow.tuple[i]
    })
    if (nameFieldId) {
      // no moved text field to label rows with — synthesize one from the tuple
      const label = srcRow.tuple
        .filter((v) => !isEmpty(v))
        .map(String)
        .join(' / ')
      if (label) values[nameFieldId] = label
    }
    const newRow = write.addRow(created.id, values)
    if (newRow) rowForTuple.set(key, newRow.id)
  }

  // 7 — reference field on the source, named after the new entity (deduped
  //     against the fields that will remain after the move)
  const remainingKeys = new Set(
    src.fields.filter((f) => !movedIds.has(f.id)).map((f) => nameKey(f.name)),
  )
  const refField = write.addField(src.id, {
    name: uniqueName(created.name, remainingKeys),
    type: 'reference',
    refEntityId: created.id,
  })

  // 8 — wire each source row's reference cell at its tuple's new row
  if (refField) {
    for (const srcRow of sourceRows) {
      const targetRowId = rowForTuple.get(JSON.stringify(srcRow.tuple))
      if (targetRowId) write.updateCell(src.id, srcRow.rowId, refField.id, targetRowId)
    }
  }

  // 9 — remove the moved fields from the source LAST
  for (const f of moved) write.removeField(src.id, f.id)
}
