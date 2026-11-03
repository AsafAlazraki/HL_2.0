/* ============================================================
   SOLD BELOW WHAT IT COSTS NORTHSIDE (the judge of Review, data
   round 2026-11-04, missing item 7: "Below cost loses the most money
   per sale").

   A list declares its prices (`priceLevelsFor`) and keeps, beside
   each, what the line costs Northside: in the parts list, Sell beside
   CTD in the supply columns and Sell inc Install beside Total CTD in
   the fitted ones. The cost a price is set against is READ FROM THE
   FILE'S OWN LAYOUT — the nearest column before the price, in the
   same section of the list, that is a cost (`isCostColumn`) and says
   so in its name ("CTD", "Cost") — never typed per list. A section
   with no such column has nothing to compare, and is not checked.

   A line is below cost when both figures are above $0 and the price is
   under the cost. Counted over the lines on sale that carry both, so
   the figure is n of the lines that could be checked.

   THE COST NEVER LEAVES THIS FILE AS A FIGURE ON A FINDING. Review is
   an admin surface, and the sheet already shows the cost with its tag;
   but until Northside's people can be told apart by what they may see,
   a finding carries the fact ("sells below its cost") and the price it
   sells at, never what it costs. The order inside a case is by line,
   as the file writes them.

   PURE: it takes the lists and their lines.
   ============================================================ */

import {
  isDiscontinued,
  isRetired,
  readCell,
  rowLabel,
  type EntityDef,
  type FieldDef,
} from '@/domain/model'
import { isCostColumn, priceLevelsFor } from '@/domain/quote/pricing'
import type { Meant, ReviewWorld } from './checks'

const COST_NAME = /\b(ctd|cost)\b/i

/** The cost column a price is set against: the nearest cost before it in its own section. */
export function costBeside(table: EntityDef, priceFieldId: string): FieldDef | null {
  const at = table.fields.findIndex((f) => f.id === priceFieldId)
  const price = table.fields[at]
  if (!price) return null
  for (let i = at - 1; i >= 0; i -= 1) {
    const f = table.fields[i]!
    if (f.sectionId !== price.sectionId) break
    if (f.type === 'number' && COST_NAME.test(f.name) && isCostColumn(table, f)) return f
  }
  return null
}

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)

export interface BelowCostLine {
  key: string
  rowId: string
  name: string
  /** what it sells at, at this price */
  price: number
}

export interface BelowCostGroup {
  key: string
  tableId: string
  tableName: string
  /** the price read, by the list's own name ('Sell', 'Sell inc Install (if appl.)') */
  priceName: string
  priceFieldId: string
  /** the lines on sale carrying both this price and its cost above $0: the denominator */
  tested: number
  lines: BelowCostLine[]
}

export function belowCost(world: ReviewWorld, meant: Meant = {}) {
  const groups: BelowCostGroup[] = []
  let left = 0
  const tables = Object.values(world.entities)
    .filter((e): e is EntityDef => !!e)
    .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id))
  for (const table of tables) {
    if (table.role === 'join' || isRetired(table)) continue
    for (const level of priceLevelsFor(table)) {
      const cost = costBeside(table, level.fieldId)
      if (!cost) continue
      let tested = 0
      const lines: BelowCostLine[] = []
      for (const row of world.rowsByEntity[table.id] ?? []) {
        if (isDiscontinued(row)) continue
        const price = num(readCell(row, level.fieldId))
        const paid = num(readCell(row, cost.id))
        if (price === null || paid === null || price <= 0 || paid <= 0) continue
        tested += 1
        if (price >= paid) continue
        const key = `cost:${table.id}:${row.id}:${level.fieldId}:${price}`
        if (meant[key]) {
          left += 1
          continue
        }
        lines.push({
          key,
          rowId: row.id,
          name: rowLabel(table, row).replace(/\s+/g, ' ').trim(),
          price,
        })
      }
      if (tested > 0)
        groups.push({
          key: `cost:${table.id}:${level.fieldId}`,
          tableId: table.id,
          tableName: table.name,
          priceName: level.label,
          priceFieldId: level.fieldId,
          tested,
          lines,
        })
    }
  }
  return {
    /** every price checked, with what it found: a group with no lines held on every line */
    groups,
    count: groups.reduce((n, g) => n + g.lines.length, 0),
    tested: groups.reduce((n, g) => n + g.tested, 0),
    meant: left,
  }
}
