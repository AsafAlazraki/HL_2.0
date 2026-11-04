/* ============================================================
   A PRICE WORKED FROM COST — the column of Northside's price list
   whose figure the workbook computes from what a thing costs
   Northside, said with the cell that computes it.

   WHY THIS EXISTS. The cost guard (`isCostColumn` in
   `src/domain/quote/pricing.ts`) refuses a column that IS a cost —
   `Base Cost`, `Landed Hull Cost` and the rest — as a price. It cannot
   see a column that is COMPUTED from cost and named like a price:

     Warranty                Boat Module!RB = ROUNDUP((IY−IW)*1.01*1.1,)
                             landed hull cost, less domestic handling,
                             plus 1%, plus GST
                             docs/reference/MPF_GROUND_TRUTH.md §6.2
                             (the table at line 885)

   A customer who read a Warranty figure off a quote would be reading
   Northside's landed cost plus one per cent. So a price worked from
   cost STARTS as Northside's only, and the dealer decides whether it
   may reach a customer (`PriceLevel.mayReachCustomer`, set on Prices).

   A MOTOR'S RRP + FREIGHT INC GST IS NOT ONE, MEASURED (the verifier
   of Prices, 2026-11-04, a blocker). MPF_GROUND_TRUTH.md line 941
   documents Motor Library!BB as ROUNDUP(AX × 1.19 × 1.1), Total CTD
   plus 19% and GST, and this file once started it as Northside's own
   for that reason — which refused every Yamaha quote once a dealer
   chose it. On Northside's own file that formula holds on 0 of the 209
   Yamaha lines, even within a dollar (BB runs 1.22–1.51 × AX; the
   F90XB's AX of $12,115.06 works to $15,859, and its BB is $17,643, the figure the Display
   Sheet prints). The claim is not true of the figures, so nothing is
   kept for it: it is the recommended retail price, as its name and
   its band ("Retail Pricing") say. The cost guard still files it with
   the costs by its name, so it is the one retail price a dealer may
   NAME past that guard (`mayBeNamed`); named, it reaches a customer
   as any price does. Pinned on the real file in `worked.pack.test.ts`.

   NOTHING HERE IS GUESSED FROM A NAME'S SHAPE. Each entry is one
   column, matched by its exact name, with the cell that proves it. A
   second needs a second cell, checked on the file, not a pattern.
   ============================================================ */

import type { EntityDef, FieldDef, PriceLevel } from '@/domain/model'

/** What the workbook does to cost to reach this figure, in the dealer's words and in its own. */
export interface WorkedFromCost {
  /** the sentence a dealer reads */
  said: string
  /** the workbook's own formula, as its cell holds it */
  formula: string
  /** the cell, and where in this repository it is written down */
  source: string
}

/** Comparable form of a name: no case, no punctuation — the same reduction `normName` makes. */
const plain = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const WORKED: Readonly<Record<string, WorkedFromCost>> = {
  warranty: {
    said: 'Worked from what the boat cost Northside landed, less handling, plus 1% and GST.',
    formula: 'ROUNDUP((IY − IW) × 1.01 × 1.1)',
    source: 'Boat Module!RB · docs/reference/MPF_GROUND_TRUTH.md §6.2',
  },
}

/** The cell that works this column from cost, or null when the price list prices it plainly. */
export function workedFromCost(field: Pick<FieldDef, 'name'>): WorkedFromCost | null {
  return WORKED[plain(field.name)] ?? null
}

/** A RETAIL PRICE THE COST GUARD FILES WITH THE COSTS BY ITS NAME: a motor's RRP + Freight Inc GST,
 *  the recommended retail (Motor Library!BB, in the band "Retail Pricing"). Not worked from cost
 *  on this file (0 of 209), so once a dealer names it, it starts as any price does. */
const RETAIL_BY_NAME: ReadonlySet<string> = new Set(['rrp freight inc gst'])

/** MAY A DEALER NAME THIS COLUMN AS A PRICE although the cost guard files it with the costs: a
 *  price worked from cost (which then starts as Northside's own), or a retail price the guard
 *  files by its name. Every other column the guard files is a cost, and never a price. */
export function mayBeNamed(field: Pick<FieldDef, 'name'>): boolean {
  return workedFromCost(field) !== null || RETAIL_BY_NAME.has(plain(field.name))
}

/**
 * MAY THIS PRICE REACH A CUSTOMER. The dealer's answer where he gave one; otherwise the price
 * list's — a column worked from cost may not, and every other price may.
 */
export function mayReachCustomer(
  entity: Pick<EntityDef, 'fields'>,
  level: Pick<PriceLevel, 'fieldId' | 'mayReachCustomer'>,
): boolean {
  if (level.mayReachCustomer !== undefined) return level.mayReachCustomer
  const field = entity.fields.find((f) => f.id === level.fieldId)
  return field ? workedFromCost(field) === null : true
}

/** The same answer for a price fixed on a line, which carries its reach or, made before the
 *  reach was fixed with it, its name. */
export function frozenMayReach(level: {
  label: string
  reach?: 'customer' | 'northside'
}): boolean {
  if (level.reach !== undefined) return level.reach === 'customer'
  return workedFromCost({ name: level.label }) === null
}
