/* ============================================================
   WHAT CHANGED, NET — against the price list as it came (fit flow,
   round 2, the cold walk).

   "I took the F150XC off and put it back, and Data says 'Highfield ×
   Yamaha — Motor Fitment 10 lines changed'", while What fits said
   "Northside has changed nothing on this boat". Both were measured:
   ten pairing lines were written twice since the packing, and each
   now reads exactly as the Master Price File has it. A stamp says a
   line was written (`changedSince`); it cannot say whether the line
   still differs.

   So the lists a stamp names are compared, cell by cell, with the
   same lists as the Master Price File carries them (`asLoaded`, the
   sheet's own comparison), and a line counts as changed only where
   it differs, or the file does not carry it. Where the file cannot be
   fetched, the stamps' figure stands and the screen says it is what
   was written.

   Pure: the file's rows are handed in.
   ============================================================ */
import type { EntityDef, RowData } from '@/domain/model'
import type { ChangedList, ChangedReport } from '@/domain/catalogue/changed'
import { asLoaded } from '@/domain/catalogue/table/asLoaded'

const instant = (iso: string | undefined): number => {
  const t = iso ? Date.parse(iso) : Number.NaN
  return Number.isNaN(t) ? Number.NEGATIVE_INFINITY : t
}

/**
 * The written report, kept to the lines that still differ from the file. `files` holds each list
 * the report names as the Master Price File carries it; a list missing from it is kept as written.
 */
export function netChanged(
  written: ChangedReport,
  tables: Readonly<Record<string, EntityDef>>,
  rows: Readonly<Record<string, readonly RowData[]>>,
  files: ReadonlyMap<string, readonly RowData[]>,
): ChangedReport {
  const byList: ChangedList[] = []
  let total = 0
  let last = Number.NEGATIVE_INFINITY
  let lastIso: string | null = null
  for (const list of written.byList) {
    const table = tables[list.tableId]
    const file = files.get(list.tableId)
    const now = rows[list.tableId] ?? []
    if (!table || !file) {
      byList.push(list)
      total += list.lines
      const row = now.find((r) => r.id === list.lastRowId)
      const at = row ? Math.max(instant(row.updatedAt), instant(row.createdAt)) : last
      if (row && at > last) {
        last = at
        lastIso = instant(row.updatedAt) >= instant(row.createdAt) ? row.updatedAt : row.createdAt
      }
      continue
    }
    const differ = asLoaded(now, file, table.fields).rows
    if (differ.size === 0) continue
    let own = Number.NEGATIVE_INFINITY
    let ownRow = ''
    for (const row of now) {
      if (!differ.has(row.id)) continue
      const at = Math.max(instant(row.updatedAt), instant(row.createdAt))
      if (at > own) {
        own = at
        ownRow = row.id
      }
      if (at > last) {
        last = at
        lastIso = instant(row.updatedAt) >= instant(row.createdAt) ? row.updatedAt : row.createdAt
      }
    }
    byList.push({ ...list, lines: differ.size, lastRowId: ownRow })
    total += differ.size
  }
  byList.sort((a, b) => b.lines - a.lines || a.tableName.localeCompare(b.tableName))
  return { lines: total, byList, last: lastIso }
}
