/**
 * DETERMINISTIC IDS — the old set re-keyed so the same row has the same id on every
 * machine, in every pack, and after a Postgres import.
 *
 *   table id   = the seed key                 'boat_stacer'
 *   row id     = key ':' 1-based ordinal      'boat_stacer:12'
 *   field id   = key '.' column key           'boat_stacer.qr'
 *
 * except a column whose key starts `__`, which keeps that key AS its id. That is the old
 * builder's own rule and it covers four columns, not three: the pair fields `__origin`,
 * `__recommended` and `__order`, which `readPairs` looks up by the literal string, and
 * `__discontinued`, which `isDiscontinued` reads by the literal string
 * (`DISCONTINUED_FIELD_ID`). A prefixed id on that one would silently un-discontinue
 * every obsolete part and package, so it keeps its literal id for the same reason the
 * pair fields do.
 *
 * Every reference is rewritten — `refEntityId`, `displayFieldId`, `hierarchy`, and each
 * reference CELL on a join row, which holds a row id — and a reference that does not
 * resolve throws: a link is an id or it is nothing. Image cells keep the manufacturer's
 * address and get a deterministic id of their own, `<row id>/<column key>/<index>`.
 *
 * THE ORDINAL IS THE BUILT ORDER, which is the seed literal's order: pass 1 of the old
 * builder keeps every base row, and pass 2 keeps every join row whose two sides resolve.
 * The packer verifies against the source that no join row was dropped, so the ordinal in
 * the file and the ordinal on the sheet are the same number.
 */
import type {
  CellValue,
  ColumnSection,
  EntityDef,
  FieldDef,
  ImageRef,
  RowData,
} from '../../src/domain/model'
import type { SeedColumn } from './source'
import { verifyColumns } from './source'

export const ORG_ID = 'northside'

/* The old shapes, structurally: what the snapshot carries, no more. */
export interface OldField {
  id: string
  name: string
  type: FieldDef['type']
  description?: string
  sectionId?: string
  refEntityId?: string
}
export interface OldEntity {
  id: string
  name: string
  kind?: EntityDef['kind']
  role?: EntityDef['role']
  retired?: boolean
  accent: EntityDef['accent']
  description?: string
  displayFieldId?: string
  hierarchy?: string[]
  sections?: ColumnSection[]
  position: { x: number; y: number }
  fields: OldField[]
}
export interface OldRow {
  id: string
  entityId: string
  values: Record<string, CellValue>
}
export interface OldProject {
  entities: OldEntity[]
  rowsByEntity: Record<string, OldRow[]>
  idByKey: Record<string, string>
}

export interface Rekeyed {
  entities: EntityDef[]
  rowsByEntity: Record<string, RowData[]>
  /** old entity id → seed key */
  keyOf: Map<string, string>
}

export function rekey(
  project: OldProject,
  columns: Map<string, SeedColumn[]>,
  stamp: string,
): Rekeyed {
  const keyOf = new Map<string, string>()
  for (const [key, id] of Object.entries(project.idByKey)) keyOf.set(id, key)

  /* old field id → new field id, and old row id → new row id, both global
     because the old ids are nanoids and never collide across tables */
  const fieldIdOf = new Map<string, string>()
  const rowIdOf = new Map<string, string>()
  const colKeyOfField = new Map<string, string>()

  for (const e of project.entities) {
    const key = keyOf.get(e.id)
    if (!key) throw new Error(`entity ${e.id} (${e.name}) has no seed key in idByKey`)
    const cols = columns.get(key)
    if (!cols) throw new Error(`${key}: no columns were read from the source`)
    verifyColumns(key, cols, e.fields)
    e.fields.forEach((f, i) => {
      const col = cols[i].key
      fieldIdOf.set(f.id, col.startsWith('__') ? col : `${key}.${col}`)
      colKeyOfField.set(f.id, col)
    })
    ;(project.rowsByEntity[e.id] ?? []).forEach((r, i) => rowIdOf.set(r.id, `${key}:${i + 1}`))
  }

  const newField = (id: string, where: string): string => {
    const hit = fieldIdOf.get(id)
    if (!hit) throw new Error(`${where}: field ${id} is not on any table`)
    return hit
  }

  const entities: EntityDef[] = project.entities.map((e) => {
    const key = keyOf.get(e.id) as string
    return {
      id: key,
      orgId: ORG_ID,
      name: e.name,
      ...(e.description !== undefined ? { description: e.description } : {}),
      accent: e.accent,
      ...(e.kind ? { kind: e.kind } : {}),
      ...(e.role ? { role: e.role } : {}),
      ...(e.retired ? { retired: true } : {}),
      ...(e.hierarchy
        ? { hierarchy: e.hierarchy.map((h) => newField(h, `${key}.hierarchy`)) }
        : {}),
      ...(e.sections ? { sections: e.sections } : {}),
      fields: e.fields.map((f): FieldDef => {
        const refKey = f.refEntityId ? keyOf.get(f.refEntityId) : undefined
        if (f.refEntityId && !refKey) {
          throw new Error(`${key}.${f.name}: refEntityId ${f.refEntityId} names no table`)
        }
        return {
          id: newField(f.id, key),
          name: f.name,
          type: f.type,
          ...(f.description !== undefined ? { description: f.description } : {}),
          ...(f.sectionId !== undefined ? { sectionId: f.sectionId } : {}),
          ...(refKey ? { refEntityId: refKey } : {}),
        }
      }),
      ...(e.displayFieldId
        ? { displayFieldId: newField(e.displayFieldId, `${key}.displayFieldId`) }
        : {}),
      position: e.position,
      createdAt: stamp,
      updatedAt: stamp,
    }
  })

  const rowsByEntity: Record<string, RowData[]> = {}
  for (const e of project.entities) {
    const key = keyOf.get(e.id) as string
    const typeOf = new Map(e.fields.map((f) => [f.id, f.type]))
    rowsByEntity[key] = (project.rowsByEntity[e.id] ?? []).map((r) => {
      const id = rowIdOf.get(r.id) as string
      const values: Record<string, CellValue> = {}
      for (const [oldField, value] of Object.entries(r.values)) {
        const field = newField(oldField, id)
        const type = typeOf.get(oldField)
        if (type === 'reference') {
          if (typeof value !== 'string') throw new Error(`${id}: ${field} holds a non-id link`)
          const target = rowIdOf.get(value)
          if (!target) throw new Error(`${id}: ${field} points at ${value}, which is no row`)
          values[field] = target
        } else if (Array.isArray(value)) {
          const col = colKeyOfField.get(oldField) as string
          values[field] = value.map((img, i): ImageRef => ({
            id: `${id}/${col}/${i + 1}`,
            src: img.src,
            ...(img.name !== undefined ? { name: img.name } : {}),
            ...(img.w !== undefined ? { w: img.w } : {}),
            ...(img.h !== undefined ? { h: img.h } : {}),
            ...(img.alt !== undefined ? { alt: img.alt } : {}),
          }))
        } else {
          values[field] = value
        }
      }
      return { id, orgId: ORG_ID, entityId: key, values, createdAt: stamp, updatedAt: stamp }
    })
  }

  return { entities, rowsByEntity, keyOf }
}
