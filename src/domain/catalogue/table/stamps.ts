/* ============================================================
   WHO LAST WROTE A CELL, AND WHEN — KEPT, NOT ONLY FOR THE SESSION.

   The sheet marks a cell this computer changed against the Master
   Price File (`asLoaded.ts`), and its record said who and when only
   while the session's own audit still held the step: after a reload
   it said "The Master Price File had $2,770" and nothing about who
   (the sheet's verifier, 2026-11-03, v12-changed-after-reload).

   A STAMP IS ONE CELL'S LAST WRITE: the row, the column, who, when.
   One record per cell ever written, so what is kept is bounded by
   the cells Northside touched and never by how often. A step that
   writes many cells (a move across a selection, a paste) stamps each
   one with the step's who and when; a way back stamps what it put
   back, because the way back is the last act that wrote it.

   Pure. The store hands each step's event in and keeps what comes
   back; nothing here reads a clock or a name.
   ============================================================ */
import type { CatalogueEvent } from '@/domain/catalogue/commands'

export interface CellStamp {
  /** `stampId(rowId, fieldId)` */
  id: string
  orgId: string
  rowId: string
  fieldId: string
  /** when, ISO, from the step */
  at: string
  /** who, when the session had a name */
  by?: string
}

export type Stamps = Readonly<Record<string, CellStamp>>

export const NO_STAMPS: Stamps = Object.freeze({})

export const stampId = (rowId: string, fieldId: string): string => `${rowId}#${fieldId}`

/** Every cell one step wrote, in order, with the who and when it was written under: an act
 *  inside a batch carries the batch's name and time where it has none of its own. */
export function cellsWritten(
  e: CatalogueEvent,
  by?: string,
  at?: string,
): Array<{ rowId: string; fieldId: string; at: string; by?: string }> {
  const whoNow = e.by ?? by
  const whenNow = e.at || at || ''
  if (e.events && e.events.length > 0) {
    return e.events.flatMap((inner) => cellsWritten(inner, whoNow, whenNow))
  }
  if (e.rowId === undefined) return []
  if (e.kind !== 'cell-set' && e.kind !== 'undone' && e.kind !== 'redone') return []
  const rowId = e.rowId
  /* A WAY BACK PUTS THE WHOLE LINE BACK and names no column; the cells it wrote are the ones its
     changes name, `<table>.<row>.<column>` */
  const prefix = `${e.tableId ?? ''}.${rowId}.`
  const fields =
    e.fieldId !== undefined
      ? [e.fieldId]
      : e.changed
          .filter((c) => e.tableId !== undefined && c.path.startsWith(prefix))
          .map((c) => c.path.slice(prefix.length))
          .filter((f) => f !== '')
  return fields.map((fieldId) => ({
    rowId,
    fieldId,
    at: whenNow,
    ...(whoNow ? { by: whoNow } : {}),
  }))
}

/** The stamps after one step. The same object back when the step wrote no cell, so a store that
 *  writes by identity writes nothing. */
export function stamped(stamps: Stamps, e: CatalogueEvent, orgId: string): Stamps {
  const cells = cellsWritten(e)
  if (cells.length === 0) return stamps
  const next: Record<string, CellStamp> = { ...stamps }
  for (const c of cells) {
    const id = stampId(c.rowId, c.fieldId)
    next[id] = { id, orgId, ...c }
  }
  return next
}

/** Who last wrote this cell and when, where it is kept; undefined where nothing is. */
export function stampOf(
  stamps: Stamps,
  rowId: string,
  fieldId: string,
): { at: string; by?: string } | undefined {
  const s = stamps[stampId(rowId, fieldId)]
  if (!s) return undefined
  return s.by ? { at: s.at, by: s.by } : { at: s.at }
}
