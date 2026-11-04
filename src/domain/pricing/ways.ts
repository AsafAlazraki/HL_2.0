/* ============================================================
   THE WAYS A LIST WITH NO PRICE CAN BE PRICED — what Prices offers
   Northside to choose between for Dealer Fit, Rigging Kits and the
   factory packages, each as the prices it would name.

   A WAY IS A SET OF PRICES, NOT ONE COLUMN. For most lists it is one:
   the column a customer's price is read from. Rigging Kits are priced
   by the file the way Parts are, supplied and fitted, cash and trade
   (the judge of Prices, 2026-11-04, L6): Kit Sell Price is the kit
   alone, Install Retail Sell is the fitting alone, Sell Price is the
   two together, and the file holds a trade figure for the kit
   supplied and for the kit fitted. Offering Install Retail Sell as a
   rival to Kit Sell Price priced a kit at its fitting labour, and
   naming one column threw the trade figure away, so a trade buyer's
   quote could not price the kit. So Rigging Kits are offered two
   ways, each naming every price it needs in one step:

     Supplied, or fitted   Cash Kit Sell Price · Trade Trade Price ·
                           Fitted Sell Price · Fitted, trade the
                           kit-fitted Trade Price (Rigging Kits!AD),
                           so a trade buyer of a fitted kit has the
                           file's own trade figure (the verifier of
                           Prices, 2026-11-04)
     Always fitted         Cash Sell Price · Trade the kit-fitted
                           Trade Price

   TWO COLUMNS THAT ARE ONE FIGURE ARE ONE WAY (L2, a blocker). The
   factory packages' RRP + Freight Inc GST equals their Sell Price on
   every line that holds either, so offering it apart was a choice
   between one figure and itself. The way is named at the column the
   cost guard does not file with the costs (Sell Price), and says the
   other names the same figure.

   Pure: no React, no store.
   ============================================================ */

import { CASH, priceIn } from '@/domain/catalogue/priceCommands'
import { sellColumns } from '@/domain/pricing/unchosen'
import { mayBeNamed } from '@/domain/pricing/worked'
import { sameFigure } from '@/domain/pricing/spread'
import type { EntityDef, FieldDef, PriceLevel, RowData } from '@/domain/model'

/** One price a way names: its key on the ladder and the column it reads. */
export interface WayRung {
  key: string
  fieldId: string
  /** the column's own name */
  label: string
}

export interface Way {
  /** stable within a list: the cash column's id, or the way's own word */
  id: string
  /** what the way is called on its tile: the column's name, or the way's own words */
  title: string
  /** every price it names, Cash first */
  rungs: WayRung[]
  /** other columns of the list that hold the same figure as its Cash on every line */
  alsoNamed: string[]
}

const field = (table: EntityDef, name: string, after?: string): FieldDef | undefined =>
  table.fields.find(
    (f, i) =>
      f.name === name &&
      (after === undefined || table.fields.slice(0, i).some((x) => x.name === after)),
  )

/** THE FITTED TRADE PRICE: a line's price fitted, for a trade buyer — a kit's Rigging Kits!AD. A
 *  line's own rung, as `fitted` is. */
export const FITTED_TRADE = 'fitted-trade'

const rung = (key: string, f: FieldDef): WayRung => ({ key, fieldId: f.id, label: f.name })

/** RIGGING KITS' TWO WAYS, where the list carries every column they read; null elsewhere. */
function kitWays(table: EntityDef): Way[] | null {
  const kit = field(table, 'Kit Sell Price')
  const fitting = field(table, 'Install Retail Sell')
  const both = field(table, 'Sell Price')
  const kitTrade = table.fields.find((f) => f.name === 'Trade Price')
  const bothTrade = field(table, 'Trade Price', 'Sell Price')
  if (!kit || !fitting || !both || !kitTrade || !bothTrade || bothTrade.id === kitTrade.id)
    return null
  return [
    {
      id: 'supplied',
      title: 'Supplied, or fitted',
      rungs: [
        rung(CASH, kit),
        rung('trade', kitTrade),
        rung('fitted', both),
        rung(FITTED_TRADE, bothTrade),
      ],
      alsoNamed: [],
    },
    {
      id: 'fitted',
      title: 'Always fitted',
      rungs: [rung(CASH, both), rung('trade', bothTrade)],
      alsoNamed: [],
    },
  ]
}

/**
 * THE WAYS ONE LIST COULD BE PRICED, the most widely held first: Rigging Kits' two, or one way per
 * sell column with columns that are one figure on every line folded into one — named at the
 * column the engine lets reach a customer, the other said beside it.
 */
export function waysFor(table: EntityDef, rows: readonly RowData[]): Way[] {
  const kits = kitWays(table)
  if (kits) return kits
  const columns = sellColumns(table)
  const held = (f: FieldDef) => rows.filter((r) => priceIn(r, f.id) !== null).length
  const groups: FieldDef[][] = []
  for (const f of columns) {
    const same = groups.find((g) => sameFigure(rows, g[0]!.id, f.id))
    if (same) same.push(f)
    else groups.push([f])
  }
  return groups
    .map((g) => {
      /* the column a quote may print without a switch leads; the rest name the same figure */
      const lead = g.find((f) => !mayBeNamed(f)) ?? g[0]!
      return {
        id: lead.id,
        title: lead.name,
        rungs: [rung(CASH, lead)],
        alsoNamed: g.filter((f) => f.id !== lead.id).map((f) => f.name),
        held: held(lead),
      }
    })
    .toSorted((a, b) => b.held - a.held)
    .map(({ held: _held, ...way }) => way)
}

/** The way a ladder already stands on, or null: every rung it names reads the way's column. */
export function wayChosen(ways: readonly Way[], ladder: readonly PriceLevel[]): Way | null {
  return (
    ways.find((w) =>
      w.rungs.every((r) => ladder.some((l) => l.key === r.key && l.fieldId === r.fieldId)),
    ) ?? null
  )
}

/** Lines a way prices: those holding a figure in its Cash column. */
export function pricedBy(way: Way, rows: readonly RowData[]): number {
  const cash = way.rungs[0]!
  return rows.filter((r) => priceIn(r, cash.fieldId) !== null).length
}
