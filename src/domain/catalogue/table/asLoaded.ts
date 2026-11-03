/* ============================================================
   WHAT NORTHSIDE CHANGED, AGAINST THE PRICE FILE AS IT CAME (the
   sheet's judge, G12). The Shelf keeps Northside's work safe against a
   new file, but on the sheet a changed cell looked like every other.
   This compares the lines as they stand on this computer with the same
   list as the Master Price File carries it, cell by cell, and hands
   back what each changed cell held in the file.

   Pure. The file's rows are handed in by whoever fetched them; a list
   whose file is not to hand is compared with nothing and marks
   nothing, which is the honest answer.

   A LINE THE FILE DOES NOT CARRY is new here, and is said so whole
   rather than cell by cell. A picture is compared by its addresses, so
   a picture re-ordered or added is a change and the same list read
   back is not.
   ============================================================ */
import { isImageValue, type CellValue, type FieldDef, type RowData } from '@/domain/model'
import type { CatalogueEvent } from '@/domain/catalogue/commands'

export interface AsLoaded {
  /** rowId → fieldId → what the file held */
  cells: Map<string, Map<string, CellValue>>
  /** lines the file does not carry */
  added: Set<string>
  /** every line that differs: a changed cell, or new */
  rows: Set<string>
}

export const NOTHING_CHANGED: AsLoaded = { cells: new Map(), added: new Set(), rows: new Set() }

const empty = (v: CellValue | undefined): boolean =>
  v === null || v === undefined || (typeof v === 'string' && v.trim() === '')

export function sameValue(a: CellValue | undefined, b: CellValue | undefined): boolean {
  if (empty(a) && empty(b)) return true
  if (empty(a) || empty(b)) {
    /* an emptied picture list is no picture, as no value is */
    const list = empty(a) ? b : a
    return Array.isArray(list) && list.length === 0
  }
  if (isImageValue(a as CellValue) || isImageValue(b as CellValue)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false
    return a.length === b.length && a.every((x, i) => x.src === b[i]!.src)
  }
  if (typeof a === 'number' || typeof b === 'number') return Number(a) === Number(b)
  return a === b
}

export function asLoaded(
  now: readonly RowData[],
  file: readonly RowData[],
  fields: readonly FieldDef[],
): AsLoaded {
  const byId = new Map(file.map((r) => [r.id, r]))
  const cells = new Map<string, Map<string, CellValue>>()
  const added = new Set<string>()
  const rows = new Set<string>()
  for (const row of now) {
    const was = byId.get(row.id)
    if (!was) {
      added.add(row.id)
      rows.add(row.id)
      continue
    }
    for (const f of fields) {
      if (f.type === 'formula') continue
      const before = was.values[f.id]
      if (sameValue(row.values[f.id], before)) continue
      let line = cells.get(row.id)
      if (!line) {
        line = new Map()
        cells.set(row.id, line)
      }
      line.set(f.id, before ?? null)
      rows.add(row.id)
    }
  }
  return { cells, added, rows }
}

/** The last act that wrote one cell, in this session's own record: who and when, where the
 *  session kept it. A batch's own acts are read inside it; nothing is guessed where none is
 *  kept (the record of a sheet is the session's, `EVENTS_KEPT` in src/state/catalogue.ts). */
export function lastChangeOf(
  events: readonly CatalogueEvent[],
  rowId: string,
  fieldId: string,
): { by?: string; at: string } | undefined {
  const hit = (e: CatalogueEvent): CatalogueEvent | undefined => {
    if (e.kind === 'undone') return undefined
    if (e.events && e.events.length > 0) {
      for (let i = e.events.length - 1; i >= 0; i -= 1) {
        const inner = hit(e.events[i]!)
        if (inner) return { ...inner, by: inner.by ?? e.by, at: inner.at || e.at }
      }
      return undefined
    }
    return e.rowId === rowId && e.fieldId === fieldId ? e : undefined
  }
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const e = hit(events[i]!)
    if (e) return e.by ? { by: e.by, at: e.at } : { at: e.at }
  }
  return undefined
}

/** What the file held in one cell, when this computer's copy differs from it; undefined where not. */
export function wasInFile(
  changes: AsLoaded,
  rowId: string,
  fieldId: string,
): { was: CellValue } | undefined {
  const line = changes.cells.get(rowId)
  return line && line.has(fieldId) ? { was: line.get(fieldId) ?? null } : undefined
}
