/* ============================================================
   EVERY PRICE A RIGGING KIT CARRIES, AS THE FILE LAYS THEM — three
   ways it is sold (the kit supplied, the fitting alone, the kit
   fitted) by three buyers (a customer, a trade buyer, a sub-dealer):
   nine columns of Rigging Kits, K L M · V W X · AC AD AE.

   WHY THIS EXISTS (the verifier of Prices, 2026-11-04, A10 and the
   sub-dealer item). The settled Rigging Kits panel listed four
   buyers' rows, each with its meaning and cell said again under the
   ways that already said them, and three of the file's nine figures —
   the fitted trade figure (AD), Install Sub Dealer Sell (X) and the
   fitted sub-dealer figure (AE) — were never drawn. Laid as the
   file's own grid, every figure stands once, and the grid's own
   arithmetic is the rule: fitted is supplied plus fitting, for each
   buyer, checked on every kit, with its numerator and denominator.

   WHICH OF THEM A QUOTE READS is the list's ladder, read here, never
   assumed: a cell a price on the ladder reads carries that price's
   key; every other cell is on the price list and read by no quote.

   Pure: no React, no store. Northside's Rigging Kits and nothing else;
   a list without all nine columns has no grid (null).
   ============================================================ */

import { priceIn } from '@/domain/catalogue/priceCommands'
import { cellOf } from '@/domain/pricing/meaning'
import type { Checked } from '@/domain/pricing/meaning'
import type { EntityDef, FieldDef, PriceLevel, RowData } from '@/domain/model'

export type KitWay = 'supplied' | 'fitting' | 'fitted'
export type KitBuyer = 'customer' | 'trade' | 'sub'

export const KIT_WAYS: readonly KitWay[] = ['supplied', 'fitting', 'fitted']
export const KIT_BUYERS: readonly KitBuyer[] = ['customer', 'trade', 'sub']

/** One figure of the grid: its column, its workbook cell, how many kits hold it. */
export interface KitCell {
  fieldId: string
  /** the price list's own name for the column */
  column: string
  /** the workbook cell its record names: "Rigging Kits!AD" */
  cell: string
  /** kits holding a figure in it */
  held: number
  /** the figure on the line the grid is read on; null where it holds none */
  figure: number | null
  /** the price on the ladder that reads it — 'cash', 'trade', 'fitted', 'fitted-trade' — or null
   *  where no quote reads it */
  key: string | null
}

export interface KitGrid {
  /** three rows of three, in KIT_WAYS × KIT_BUYERS order */
  cells: Record<KitWay, Record<KitBuyer, KitCell>>
  /** fitted is supplied plus fitting, checked for each buyer on every kit holding its fitted
   *  figure (within a dollar; an empty cell is nought, as the workbook sums it) */
  sums: Record<KitBuyer, Checked>
  /** a sub-dealer's figure the same as a trade buyer's, on every kit holding it, per row */
  subIsTrade: Record<KitWay, Checked>
}

/** The columns, by the file's names; `after` tells apart a name the list carries twice. */
const COLUMNS: Record<KitWay, Record<KitBuyer, { name: string; after?: string }>> = {
  supplied: {
    customer: { name: 'Kit Sell Price' },
    trade: { name: 'Trade Price' },
    sub: { name: 'Sub Dealer Price' },
  },
  fitting: {
    customer: { name: 'Install Retail Sell' },
    trade: { name: 'Install Trade Sell' },
    sub: { name: 'Install Sub Dealer Sell' },
  },
  fitted: {
    customer: { name: 'Sell Price' },
    trade: { name: 'Trade Price', after: 'Sell Price' },
    sub: { name: 'Sub Dealer Price', after: 'Sell Price' },
  },
}

/** A column by its name: the first of that name, or the first standing after `after`. */
function columnOf(table: EntityDef, name: string, after?: string): FieldDef | undefined {
  if (after === undefined) return table.fields.find((f) => f.name === name)
  const from = table.fields.findIndex((f) => f.name === after)
  return from < 0 ? undefined : table.fields.slice(from + 1).find((f) => f.name === name)
}

const near = (a: number, b: number): boolean => Math.abs(a - b) <= 1

/**
 * THE NINE FIGURES OF A RIGGING KIT LIST, read on one line and counted across the list, each with
 * the price on the ladder that reads it. Null where the list does not carry all nine.
 */
export function readKitGrid(
  table: EntityDef,
  rows: readonly RowData[],
  ladder: readonly PriceLevel[],
  on: RowData | null,
): KitGrid | null {
  const fields = {} as Record<KitWay, Record<KitBuyer, FieldDef>>
  for (const way of KIT_WAYS) {
    const row = {} as Record<KitBuyer, FieldDef>
    for (const buyer of KIT_BUYERS) {
      const c = COLUMNS[way][buyer]
      const f = columnOf(table, c.name, c.after)
      if (!f) return null
      row[buyer] = f
    }
    fields[way] = row
  }
  /* the fitted trade and sub-dealer columns must be their own, not the supplied ones again */
  if (fields.fitted.trade.id === fields.supplied.trade.id) return null
  if (fields.fitted.sub.id === fields.supplied.sub.id) return null

  const cells = {} as KitGrid['cells']
  for (const way of KIT_WAYS) {
    const row = {} as Record<KitBuyer, KitCell>
    for (const buyer of KIT_BUYERS) {
      const f = fields[way][buyer]
      row[buyer] = {
        fieldId: f.id,
        column: f.name,
        cell: cellOf(f),
        held: rows.filter((r) => priceIn(r, f.id) !== null).length,
        figure: on ? priceIn(on, f.id) : null,
        key: ladder.find((l) => l.fieldId === f.id)?.key ?? null,
      }
    }
    cells[way] = row
  }

  const sums = {} as KitGrid['sums']
  for (const buyer of KIT_BUYERS) {
    let holds = 0
    let of = 0
    for (const r of rows) {
      const fitted = priceIn(r, fields.fitted[buyer].id)
      if (fitted === null) continue
      of += 1
      const parts =
        (priceIn(r, fields.supplied[buyer].id) ?? 0) + (priceIn(r, fields.fitting[buyer].id) ?? 0)
      if (near(parts, fitted)) holds += 1
    }
    sums[buyer] = { holds, of }
  }

  const subIsTrade = {} as KitGrid['subIsTrade']
  for (const way of KIT_WAYS) {
    let holds = 0
    let of = 0
    for (const r of rows) {
      const sub = priceIn(r, fields[way].sub.id)
      if (sub === null) continue
      of += 1
      if (sub === priceIn(r, fields[way].trade.id)) holds += 1
    }
    subIsTrade[way] = { holds, of }
  }

  return { cells, sums, subIsTrade }
}
