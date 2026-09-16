/* ============================================================
   THE PRICE LADDER, DECLARED BY THE PACKER.

   The old app resolved a table's rungs at read time from an exact-name
   allow-list per kind (`NAMED_LEVELS` in features/quote/pricing.ts)
   and refused a cost column by construction (`isCostColumn`). That
   resolver and that exclusion are ported here VERBATIM — the names,
   the four `RungContents` with their source cells, the cost list, the
   band-first rule — and run ONCE, at pack time, so every priced table
   on the pack carries its ladder as data (`PackTableMeta.priceLevels`,
   `EntityDef.priceLevels`) and no Northside column name has to live in
   app code. The app's `priceLevelsFor` reads the declaration first and
   still refuses a cost column again; the packer refuses harder — a
   named rung that lands on a cost band THROWS rather than being
   skipped, because a silent skip is how a rung goes missing.

   What follows, down to `NAMED_LEVELS`, is pricing.ts's own text.

   ONE RULE GOVERNS EVERY RUNG:

     If the number is not a column in the project's own data, the
     quote does not produce it.

   No exception, and in particular no exception for the numbers
   "everybody knows": no 29% markup, no hourly labour rate, no tax
   divisor, no deposit percentage, no trade discount. Every one of
   those is a real figure in the Master Price File and NOT ONE OF
   THEM is a column in the seeded data. Reproducing them here would
   be inventing pricing policy from memory of a spreadsheet.

   WHAT IS ALREADY INSIDE THE NUMBER WE READ — and must therefore
   never be added to it:
     · motor pre-delivery is inside `Sell Price` (Motor Library!BF
       ← AX ← AV Total PD Allowance). Adding PD double-charges it.
     · trailer registration is inside `Sell inc Rego` (CA = DB77).
       Reading `Sell` + `Rego ($)` is the same double-charge.
     · part labour is inside `Sell inc Install (if appl.)` (Y ← P
       ← O TTF Hours). A fitted line reads Y, a supply line reads L.
       Never L + P.

   AND NO MARKUP, EVER. The workbook applies exactly one — 29% on
   the hull, `Boat Module!AB265` — and `BMT - MU` is not a column in
   the seeded data. The `Cash` / `Trade` / `Warranty` rungs we read
   ARE the hand-maintained hull-only prices (QR/QT/RB), already
   rounded by the business upstream. Re-deriving them would replace
   a number a person approved with a number a program guessed.
   ============================================================ */

import type {
  ColumnSection,
  EntityDef,
  FieldDef,
  PriceLevel,
  RungContents,
  TableKind,
} from '../../src/domain/model'

/* ---------------------------------------------------------- */
/* Names                                                      */
/* ---------------------------------------------------------- */

/** Comparable form of a column name: no case, no punctuation.
 *  'Sell inc Install (if appl.)' → 'sell inc install if appl'. */
export const normName = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/* ---------------------------------------------------------- */
/* The hard exclusion — cost never reaches a quote surface     */
/* ---------------------------------------------------------- */

/** Column names in the seeded data that are a COST or a MARKUP, and
 *  are therefore forbidden on every quote surface — picker, document
 *  and print — and forbidden in any total. Each one is a real column
 *  in the seed; the failure prevented is a customer reading the
 *  dealer's buy price off a quotation. */
const COST_COLUMNS = new Set(
  [
    'Base Cost',
    'Landed Hull Cost',
    'Landed CTD',
    'Nett CTD',
    'Dealer List Price',
    'Dealer',
    'Nett Price',
    'Landed',
    'Total CTD',
    'Base List',
    'P&A',
    'CTD',
    'MU',
    'HO - MU',
    'BMT - MU',
    'EX Rate',
    'Base Freight',
    'Other Charges',
    'Road Freight',
    'Freight',
    'Quad Freight',
    'Stamp Duty',
    'Handling',
    'Dazmac',
    'IYT Logistics',
    'ABP Compl.',
    'Aus Spec',
    'Total PD Allowance',
    'Labour ($)',
    'TTF (Hours)',
    'RRP + Freight Inc GST',

    /* ---- ADDED HERE, NOT IN THE OLD REPO'S LIST (2026-09-16) ----
       The four below are cost or margin in the seed and the old list
       missed them, so 32 columns across eleven tables were reaching
       every surface that trusts `costColumns`. Each is quoted from
       MPF_GROUND_TRUTH.md, which derives it from the workbook's own
       formulas:

         Total Nett CTD   Trailer!BS, "BS TOTAL NETT CTD = AS + BQ
                          ← the true cost". CTD is cost-to-dealer.
                          `Nett CTD` and `Total CTD` were already
                          here; this third spelling was not.
         Settlement       Trailer!AP, `=AN*5%`, the second deduction
                          in "AQ Nett Price = AN − AO − AP
                          (Dealer − Discount − Settlement)". The
                          whole ladder is the dealer's buy price;
                          `Dealer` and `Nett Price` were already here.
         Discount         Trailer!AO, the first deduction in that same
                          line. It is the SUPPLIER's discount off the
                          dealer's buy price, not a customer discount
                          — a customer discount is an adjustment on a
                          quote, never a seed column.
         GP               Trailer!BU `=BW/1.1 − BS`, Parts!K
                          `=L/1.1 − I`, Dealer Fit!Q, rig kits
                          `GP ($)`, oils `GP`. Gross profit: the one
                          figure a customer must never read. (`MU`
                          was already here and catches `MU %`, which
                          normalises to the same name; `GP %` and
                          `GP ($)` normalise to `gp`.)

       NOT added, deliberately: `RRP` and `Sell` are the customer's
       own prices, and `Sell inc Rego` with them. The parts table
       files `Sell` under the "Supply Pricing" band and it is still
       the customer's figure — the band test above says so. */
    'Total Nett CTD',
    'Settlement',
    'Discount',
    'GP',
  ].map(normName),
)

const sectionOf = (entity: EntityDef, field: FieldDef): ColumnSection | undefined =>
  field.sectionId ? entity.sections?.find((s) => s.id === field.sectionId) : undefined

/** True when a column is a cost or a markup — by the BAND the
 *  business filed it under first, then by its own name.
 *
 *  Band first because that is the business's own statement: the seed
 *  files `Base Cost` under "Cost Build" and `Dealer List Price`
 *  under "Cost Ladder". Name second, so a table with no bands is
 *  still safe. NOT by accent: the parts table bands `Sell` under
 *  "Supply Pricing", which is graphite and is nonetheless the
 *  customer's price. */
export function isCostColumn(entity: EntityDef, field: FieldDef): boolean {
  const band = normName(sectionOf(entity, field)?.name ?? '')
  if (band.includes('cost') || band.includes('markup')) return true
  const n = normName(field.name)
  return COST_COLUMNS.has(n) || n.includes('cost') || n.startsWith('landed ')
}

/* ---------------------------------------------------------- */
/* The levels a table declares                                */
/* ---------------------------------------------------------- */

interface NamedLevel {
  key: string
  column: string
  scope: 'quote' | 'line'
  contains?: RungContents
}

/* ---------------------------------------------------------- */
/* What each named column already contains                     */
/* ---------------------------------------------------------- */

/** `Sell inc Rego` contains the registration fee. ASSERTED by the
 *  trailer sheet's own formula — SERVICE_AND_THEMES.md §3.1 reads
 *  `CA = ROUNDUP(BW+BZ,)`, the sell price plus `BZ Rego ($)` at face
 *  value with no markup, which is the same paragraph's proof that a
 *  registration fee is never marked up. */
const TRAILER_SELL_INC_REGO: RungContents = {
  includesRegistration: true,
  source: 'Trailer Module!CA “Sell inc Rego” = ROUNDUP(BW+BZ,) · SERVICE_AND_THEMES.md §3.1',
}

/** A motor's `Sell Price` contains pre-delivery. ASSERTED by the
 *  chain the head of this file already cites. Registration and
 *  fitting are NOT stated either way for a motor, so neither is
 *  claimed. */
const MOTOR_SELL: RungContents = {
  includesPreDelivery: true,
  source: 'Motor Library!BF ← AX ← AV “Total PD Allowance”',
}

/** A part's fitted rung contains the labour to fit it. */
const PART_SELL_INC_INSTALL: RungContents = {
  includesInstall: true,
  source: 'Parts Maintenance!Y “Sell inc Install (if appl.)” ← P ← O “TTF (Hours)”',
}

/** A part's supply rung does NOT — and saying so is the whole reason
 *  `false` exists beside `undefined`. `L` is the supply price and `Y`
 *  is the fitted one; charging fitting on a line priced at `L` is
 *  correct, and a guard that could not tell the two apart would
 *  refuse the right thing as loudly as the wrong one. */
const PART_SELL: RungContents = {
  includesInstall: false,
  source: 'Parts Maintenance!L “Sell” — the supply rung; the fitted rung is Y',
}

/** A boat's hull-only rungs do NOT contain registration. ASSERTED by
 *  the quote sheet publishing both numbers side by side:
 *  `D41 = 110,600` hull only and `D42 = ROUNDUP(D41+A23,) = 111,014`
 *  hull plus rego — a difference of exactly the 414 fee. So a
 *  registration line beside a boat is right, and beside a trailer is
 *  a second charge. That is §3.1's "never add it twice", and it is
 *  the one place in this table where the two subjects of one concept
 *  disagree. */
const BOAT_HULL_ONLY: RungContents = {
  includesRegistration: false,
  source:
    'Managers View!D41 “HULL ONLY SALE” vs D42 “HULL ONLY inc Boat Registration” — they differ by the fee · SERVICE_AND_THEMES.md §2.4, §3.1',
}

/** The named price columns per kind of table, in the order the
 *  business offers them, taken VERBATIM from the seeded Northside
 *  data and its workbook cells:
 *
 *    boat       Cash · Trade · Warranty     Boat Module   QR / QT / RB
 *    motor      Sell Price · Trade Price    Motor Library BF / BL
 *    trailer    Sell inc Rego               Trailer Mod.  CA
 *    accessory  Sell · Sell inc Install     Parts Maint.  L / Y
 *
 *  `scope` decides which rungs the ONE control at the top of a quote
 *  may offer. `warranty` exists only on boats and `fitted` only on
 *  parts, so neither is a whole-quote choice: switching a whole
 *  quote to "fitted" would ask a trailer for a rung no trailer has.
 *
 *  An exact-name allow-list is the only honest resolver: it can be
 *  wrong by OMISSION, in which case the line says "not priced here"
 *  and waits for a person, but it can never be wrong by ACCIDENT,
 *  which is exactly what a regex is. */
const NAMED_LEVELS: Partial<Record<TableKind, NamedLevel[]>> = {
  boat: [
    { key: 'cash', column: 'Cash', scope: 'quote', contains: BOAT_HULL_ONLY },
    { key: 'trade', column: 'Trade', scope: 'quote', contains: BOAT_HULL_ONLY },
    { key: 'warranty', column: 'Warranty', scope: 'line', contains: BOAT_HULL_ONLY },
  ],
  motor: [
    { key: 'cash', column: 'Sell Price', scope: 'quote', contains: MOTOR_SELL },
    /* `Trade Price` (Motor Library!BL) — no cell says whether
       pre-delivery is inside it, so nothing is claimed. Silence here
       is the third state doing its job. */
    { key: 'trade', column: 'Trade Price', scope: 'quote' },
  ],
  trailer: [
    { key: 'cash', column: 'Sell inc Rego', scope: 'quote', contains: TRAILER_SELL_INC_REGO },
  ],
  accessory: [
    { key: 'cash', column: 'Sell', scope: 'quote', contains: PART_SELL },
    {
      key: 'fitted',
      column: 'Sell inc Install (if appl.)',
      scope: 'line',
      contains: PART_SELL_INC_INSTALL,
    },
  ],
  /* a package's price is a view's business, a dealer has none, and a
     custom table has told us nothing — all three are UNPRICED rather
     than guessed at */
}

export interface DeclaredLevels {
  /** the ladder — empty means THIS TABLE IS NOT PRICED and a quote
   *  leaves the amount for a person */
  priceLevels: PriceLevel[]
  /** field ids that must never reach a customer surface */
  costColumns: string[]
}

/**
 * The columns a quote may read a price from, for THIS table, decided
 * once. EMPTY MEANS THIS TABLE IS NOT PRICED — never a guess, never a
 * regex on a column name. A rigging kit and a propeller are priced in
 * workbooks we do not hold, so their lines carry no number and say so.
 *
 * THE REFUSAL IS A THROW. The old resolver skipped a named column
 * that was a cost column and carried on; the packer stops, because a
 * ladder written with a rung missing is a pack that prices a trade
 * deal at the wrong rung with nothing on screen to say so.
 */
export function declareLevels(entity: EntityDef): DeclaredLevels {
  const costColumns = entity.fields.filter((f) => isCostColumn(entity, f)).map((f) => f.id)
  const wanted = entity.kind ? NAMED_LEVELS[entity.kind] : undefined
  if (!wanted) return { priceLevels: [], costColumns }

  const priceLevels: PriceLevel[] = []
  for (const { key, column, scope, contains } of wanted) {
    const want = normName(column)
    const named = entity.fields.filter(
      (f) => (f.type === 'number' || f.type === 'formula') && normName(f.name) === want,
    )
    const onCost = named.filter((f) => isCostColumn(entity, f))
    if (onCost.length > 0) {
      const band = sectionOf(entity, onCost[0])?.name ?? '(no band)'
      throw new Error(
        `${entity.id}: the ${key} rung would read “${onCost[0].name}” (${onCost[0].id}), which is a cost column — filed under “${band}”. Refused.`,
      )
    }
    const field = named[0]
    if (field) {
      priceLevels.push({
        key,
        label: field.name,
        fieldId: field.id,
        scope,
        ...(contains ? { contains } : {}),
      })
    }
  }
  return { priceLevels, costColumns }
}
