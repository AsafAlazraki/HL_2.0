/* ============================================================
   io/noise — A CELL THAT MOVES NOTHING IS NOT A CHANGE.

   MEASURED on Northside's own `Parts Module (2).xlsx` against the
   pack of 16 September 2026 (2026-11-04): of the figures the change
   sheet printed with the same text either side of the arrow, 17 were
   the workbook's own arithmetic landing a hair away from the pack's —
   Boatcatch Small's CTD 555.2760000000001 → 555.276, a Garmin cable's
   P&A 35 → 34.99999999999999 — and 96 were a name with a space left
   at its end ("EKS Add on Kit Single" → "EKS Add on Kit Single ").
   The merge (`./tableCsv`, `sameCellValue`) asks `Object.is`, which is
   right for a file a person typed; a workbook's formulas are not typed,
   and neither difference is anything a person could read, write or
   price. Each was counted as a change, written by Apply and shown as
   "X → X".

   So a figure that agrees to nine significant places, and words that
   agree once their ends are trimmed, move nothing: the plan drops
   them, and a line left with nothing that moves is not a change at
   all. A move the file really makes stays, however small — Transom
   Spacer 8 mm's P&A 8.41 → 8.41464 is a figure the workbook carries,
   and the sheet shows it at the precision that moved.

   Pure: no React, no store, no DOM.
   ============================================================ */

import type { CellValue, RowData } from '@/domain/model'
import type { TableUploadPlan } from './tableCsv'

/** Two figures this close are one figure the arithmetic spelled twice: nine significant places. */
const SAME = 1e-9

/** Whether writing `to` over `from` would move nothing a person could read. */
export function movesNothing(from: CellValue | undefined, to: CellValue | undefined): boolean {
  if (typeof from === 'number' && typeof to === 'number') {
    if (!Number.isFinite(from) || !Number.isFinite(to)) return Object.is(from, to)
    return Math.abs(from - to) <= SAME * Math.max(1, Math.abs(from), Math.abs(to))
  }
  if (typeof from === 'string' && typeof to === 'string') {
    return from.replace(/\s+/g, ' ').trim() === to.replace(/\s+/g, ' ').trim()
  }
  return false
}

/** The merge's plan with every cell that moves nothing taken out, and its count of lines that
 *  change counted again from what is left. */
export function withoutNoise(plan: TableUploadPlan, rows: readonly RowData[]): TableUploadPlan {
  const byId = new Map(rows.map((r) => [r.id, r]))
  const changes = plan.changes.filter(
    (c) => !movesNothing(byId.get(c.rowId)?.values[c.fieldId] ?? null, c.value),
  )
  if (changes.length === plan.changes.length) return plan
  return { ...plan, changes, overwritten: new Set(changes.map((c) => c.rowId)).size }
}
