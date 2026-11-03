/* ============================================================
   WHAT IS NEW ON THIS COMPUTER SINCE THE PRICE LIST LANDED.

   The Master Price File carries one packing instant (`packedAt`), and
   every line it brings carries that same instant as its `updatedAt`
   and `createdAt` (measured on the pack of 2026-09-16: all 15,691
   lines). A line written on this computer since — a price changed on
   the sheet, a line added, a new price list brought in on Shelf and
   applied — carries the instant it was written. So a line is NEW when
   either of its two stamps is after the packing, and nothing else is
   needed to say so: no history, no second copy of the file.

   WHAT IT DOES NOT SAY, AND THE SCREEN MUST NOT: who wrote it, or
   that it was a price. A stamp says a line was written, and the sheet
   says which cell. The figure is "lines changed on this computer",
   never "prices Northside changed".

   Pure: no store, no clock, no DOM.
   ============================================================ */
import type { EntityDef, RowData } from '@/domain/model'

export interface ChangedList {
  tableId: string
  tableName: string
  lines: number
  /** THE LINE WRITTEN LAST ON IT, by its row id, so a door to the list can open AT the change
   *  (the verifier of Data, round 1: Labour Rates opened at its top, not at the line changed) */
  lastRowId: string
}

export interface ChangedReport {
  /** lines written after the packing, across the lists read */
  lines: number
  /** the lists with any, the most first (a tie by name) */
  byList: ChangedList[]
  /** the latest stamp among them, ISO, or null when there is none */
  last: string | null
}

const instant = (iso: string | undefined): number => {
  const t = iso ? Date.parse(iso) : Number.NaN
  return Number.isNaN(t) ? Number.NEGATIVE_INFINITY : t
}

/**
 * The lines written after `since` on the lists `among` names (every list handed in when it is
 * left out). A `since` that is not a date answers nothing changed, rather than everything.
 */
export function changedSince(
  tables: Readonly<Record<string, EntityDef>>,
  rows: Readonly<Record<string, readonly RowData[]>>,
  since: string,
  among?: (tableId: string) => boolean,
): ChangedReport {
  const from = Date.parse(since)
  if (Number.isNaN(from)) return { lines: 0, byList: [], last: null }
  const byList: ChangedList[] = []
  let total = 0
  let last = Number.NEGATIVE_INFINITY
  let lastIso: string | null = null
  for (const table of Object.values(tables)) {
    if (among && !among(table.id)) continue
    let n = 0
    let own = Number.NEGATIVE_INFINITY
    let ownRow = ''
    for (const row of rows[table.id] ?? []) {
      const updated = instant(row.updatedAt)
      const created = instant(row.createdAt)
      const at = Math.max(updated, created)
      if (at <= from) continue
      n += 1
      if (at > own) {
        own = at
        ownRow = row.id
      }
      if (at > last) {
        last = at
        lastIso = updated >= created ? row.updatedAt : row.createdAt
      }
    }
    if (n > 0) {
      byList.push({ tableId: table.id, tableName: table.name, lines: n, lastRowId: ownRow })
      total += n
    }
  }
  byList.sort((a, b) => b.lines - a.lines || a.tableName.localeCompare(b.tableName))
  return { lines: total, byList, last: lastIso }
}
