/* ============================================================
   A PRICE WORKED FROM COST — the two columns of Northside's price
   list whose figure the workbook computes from what a thing costs
   Northside, said with the cell that computes it.

   WHY THIS EXISTS. The cost guard (`isCostColumn` in
   `src/domain/quote/pricing.ts`) refuses a column that IS a cost —
   `Base Cost`, `Landed Hull Cost` and the rest — as a price. It cannot
   see a column that is COMPUTED from cost and named like a price, and
   the price list has two:

     Warranty                Boat Module!RB = ROUNDUP((IY−IW)*1.01*1.1,)
                             landed hull cost, less domestic handling,
                             plus 1%, plus GST
                             docs/reference/MPF_GROUND_TRUTH.md §6.2
                             (the table at line 885)

     RRP + Freight Inc GST   Motor Library!BB = ROUNDUP(AX*1.19*1.1,)
                             Total CTD (what the motor costs Northside),
                             plus 19%, plus GST
                             docs/reference/MPF_GROUND_TRUTH.md line 941

   A customer who read a Warranty figure off a quote would be reading
   Northside's landed cost plus one per cent. So a price worked from
   cost STARTS as Northside's only, and the dealer decides whether it
   may reach a customer (`PriceLevel.mayReachCustomer`, set on Prices).

   NOTHING HERE IS GUESSED FROM A NAME'S SHAPE. Each entry is one
   column, matched by its exact name, with the cell that proves it. A
   third needs a third cell, not a pattern.
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
  'rrp freight inc gst': {
    said: 'Worked from what the motor costs Northside, plus 19% and GST.',
    formula: 'ROUNDUP(AX × 1.19 × 1.1)',
    source: 'Motor Library!BB · docs/reference/MPF_GROUND_TRUTH.md, Motor Library, Retail',
  },
}

/** The cell that works this column from cost, or null when the price list prices it plainly. */
export function workedFromCost(field: Pick<FieldDef, 'name'>): WorkedFromCost | null {
  return WORKED[plain(field.name)] ?? null
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
