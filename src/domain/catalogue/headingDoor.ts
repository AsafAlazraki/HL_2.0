/* ============================================================
   THE ADDRESS THAT OPENS A LIST AT ONE OF ITS HEADINGS — the door a
   heading press on Data (a lineup's bar, a find's section, "Oldest
   first") hands the sheet.

   THE SHEET HAS TWO WAYS TO STAND AT A HEADING, and only one of them
   for any list. A list read one series at a time (Highfield's seven
   series, the sheet's CHAPTERS: two to twelve outer headings over a
   level below them, `chaptersOf`) opens at a chapter by its name,
   `?in=Classic`. Every other sectioned list — Parts' 187 categories,
   Rigging Kits' 26 sections, NSM Custom's eight series of one level —
   is one long list with its headings in it, and a chapter name there
   is read as no chapter at all: the sheet opened at its top (the
   verifier of Data, round 1: "Oldest first" on Rigging Kits drew
   TILLER CONVERSION KITS, the list's first section, not the one it
   named). Such a list opens at a ROW, `?at=<row>`, and the row is the
   first line filed under the heading, so the sheet stands at the
   heading with its first line in view.

   It is decided by the sheet's own readers — `outlineLevels`,
   `viewRowsOf`, `buildGroups`, `chaptersOf` — called the way the sheet
   calls them, so the door and the sheet can never disagree about
   whether a list has chapters. A heading the list does not carry has no
   door: null, and the caller opens the list at its top and says so
   rather than pretend.

   Pure: no store, no DOM.
   ============================================================ */
import type { EntityDef, RowData } from '@/domain/model'
import { outlineLevels, viewRowsOf } from './table/outline'
import { buildGroups, collectLeaves } from './table/grouping'
import { chaptersOf } from './table/priceList'
import type { ViewRow } from './table/core'

/** Where the sheet stands: at a chapter by its name, or at one row. */
export type HeadingDoor = { in: string } | { at: string }

const textOf = (row: ViewRow, fieldId: string): string => row.text[fieldId] ?? ''

/**
 * The address that opens `table` at the outer heading `heading`, or null where the list carries
 * no such heading. `tables` is every list, because a list of what fits takes its outline from
 * the boat list it links to.
 */
export function headingDoorOf(
  table: EntityDef,
  tables: Readonly<Record<string, EntityDef>>,
  rows: readonly RowData[],
  heading: string,
): HeadingDoor | null {
  const said = heading.trim()
  if (said === '') return null
  const levels = outlineLevels(table, tables)
  if (levels.length === 0) return null
  const roots = buildGroups(viewRowsOf(table, rows), levels, textOf)
  const root = roots.find((n) => n.value === said)
  if (!root) return null
  if (chaptersOf(roots, levels).some((c) => c.value === root.value)) return { in: root.value }
  const first = collectLeaves(root)[0]
  return first ? { at: first.rowId } : null
}
