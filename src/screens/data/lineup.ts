/* ============================================================
   WHAT A TABLE HOLDS, CUT THE WAY THE FILE CUTS IT — the lineup a
   table's spread draws when it is opened.

   A dealer opening Highfield Inflatables on this screen is opening a
   maker, and a maker is its series: ROLL-UP, CLASSIC, SPORT … each
   with the boats filed under it. The register's own head already says
   "588 variants in 7 series" (`domain/modules/register`, which counts
   the distinct headings off the table's FIRST hierarchy column); this
   says WHICH seven, and how many of the 588 each one holds, read off
   the same column the same way, so the two can never disagree.

   NOTHING IS INVENTED, ORDERED OR ROUNDED. The headings come in the
   order they first appear in the file — the order a dealer has
   already learned on the sheet, never a ranking by size — and each
   count is the number of rows filed under it. A row with nothing in
   the heading column is counted apart, as filed under none, rather
   than dropped: a lineup whose counts did not add back to the table
   would be a figure the file does not carry.

   A TABLE WITH NO HEADINGS HAS NO LINEUP. Formosa's 39 models are one
   flat list and the labour rates are eighteen lines; `lineupOf`
   answers null for both and the spread draws no chart, rather than a
   chart of one bar.

   It lives beside the screen, the way `file.ts` does, because it is
   this screen's reading of a table and nothing else draws it. It is
   pure: no React, no store, no DOM.
   ============================================================ */
import type { EntityDef, RowData } from '@/domain/model'

/** One heading the first level of a table cuts its rows into. */
export interface Branch {
  /** the heading as the file writes it, trimmed */
  name: string
  /** rows filed under it */
  rows: number
}

export interface Lineup {
  /** every heading, in the order it first appears in the file */
  branches: Branch[]
  /** rows with nothing in the heading column — filed under none */
  unfiled: number
  /** the rows the lineup was read off, so a bar is a share of a stated whole */
  total: number
  /** the largest heading's rows: a bar's length is its rows over this */
  most: number
}

/** The heading a row is filed under, the way the register counts it. */
function headingOf(value: unknown): string | null {
  if (typeof value === 'string') {
    const said = value.trim()
    return said === '' ? null : said
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return null
}

/**
 * The lineup of one table: its first-level headings, in the file's
 * order, each with the rows filed under it. Null for a table the file
 * declares no headings on, or one whose rows carry none.
 */
export function lineupOf(
  table: EntityDef | undefined,
  rows: readonly RowData[] | undefined,
): Lineup | null {
  const first = table?.hierarchy?.[0]
  if (!first || !rows || rows.length === 0) return null
  const counts = new Map<string, number>()
  let unfiled = 0
  for (const row of rows) {
    const heading = headingOf(row.values[first])
    if (heading === null) {
      unfiled += 1
      continue
    }
    counts.set(heading, (counts.get(heading) ?? 0) + 1)
  }
  if (counts.size === 0) return null
  const branches = [...counts].map(([name, n]) => ({ name, rows: n }))
  return {
    branches,
    unfiled,
    total: rows.length,
    most: branches.reduce((m, b) => Math.max(m, b.rows), 0),
  }
}

/** What a spread has room to draw of a lineup, and what it says of the rest. */
export interface LineupShown {
  shown: Branch[]
  /** headings not drawn */
  more: number
  /** rows under the headings not drawn */
  moreRows: number
}

/**
 * THE FIRST `room` HEADINGS, IN THE FILE'S ORDER, AND A COUNT OF THE
 * REST. Parts & Accessories is cut into 187 categories, and 187 bars
 * is a sheet, not a lineup; the spread draws the first few and says
 * how many more there are and how many rows they hold, so nothing is
 * hidden without being counted. Never the LARGEST few: that would be a
 * ranking the file does not make.
 */
export function lineupShown(lineup: Lineup, room: number): LineupShown {
  const fits = Math.max(0, Math.floor(room))
  /* ONE LEFT OVER IS DRAWN, NOT COUNTED: "and 1 more" takes the line
     its own bar would, so a lineup one over the room shows them all. */
  const keep = lineup.branches.length <= fits + 1 ? lineup.branches.length : fits
  const shown = lineup.branches.slice(0, keep)
  const rest = lineup.branches.slice(keep)
  return {
    shown,
    more: rest.length,
    moreRows: rest.reduce((n, b) => n + b.rows, 0),
  }
}
