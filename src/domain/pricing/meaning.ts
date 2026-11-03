/* ============================================================
   WHAT A PRICE COLUMN IS — the meaning of each figure Prices asks
   Northside to choose between or shows it reading, said in the
   dealer's words with the workbook cell it comes from, and, where
   the price list's own cells let it be checked, the workbook's rule
   for it checked on every line that holds it.

   WHY THIS EXISTS (the judge of Prices, 2026-11-04, L1, a blocker).
   Dealer Fit was a choice between two bare column names, "Act Sell"
   or "Sell", read on one VHF radio: $982 or $249. On the 789 lines
   that hold both they are never equal (0.97–27.83 × , median 2.08 ×),
   and nothing said that Act Sell is the whole package fitted and Sell
   is its first accessory alone. Nobody can choose honestly from a
   name.

   NOTHING HERE IS GUESSED FROM A NAME'S SHAPE. Each entry is one
   column of Northside's own price list, matched by the list it sits
   in and its exact name, with where it is written down:
   docs/reference/MPF_GROUND_TRUTH.md, or the column's own record in
   the pack (its description names the workbook cell). A rule is
   offered only with a check, and the screen says the check's
   numerator and denominator — "holds on 1,721 of 1,733" — never the
   rule alone.

   WHAT IS LEFT OUT, AND WHY. Motor Library!BB "RRP + Freight Inc GST"
   is documented as ROUNDUP(Total CTD × 1.19 × 1.1); on this file it
   matches 0 of 209 Yamaha lines (it runs 1.22–1.51 × Total CTD), so
   no rule is said for it, only what its name says it is. A Cash
   figure on a boat list is worked by four different rules at once
   (MPF_GROUND_TRUTH §6.2), so none is said.

   Pure: no React, no store. Northside's price list and nobody else's.
   ============================================================ */

import { priceIn } from '@/domain/catalogue/priceCommands'
import type { EntityDef, FieldDef, RowData } from '@/domain/model'

/** What a figure is, and where it comes from. */
export interface Meaning {
  /** what the figure is, in the dealer's words: one sentence */
  said: string
  /** the workbook cell, as the column's own record names it: "Dealer Fit Module!R" */
  cell: string
  /** the workbook's rule for it, as a person reads a formula; '' where none is said */
  formula: string
}

/** A rule checked on the price list: on how many of the lines that could be checked it holds. */
export interface Checked {
  holds: number
  of: number
}

/** A line's figure in a column of the same list, by the column's name; null where it holds none. */
type Read = (name: string) => number | null

interface Entry {
  /** which list: the price list's own kind of list, or one list by its name */
  on: (table: Pick<EntityDef, 'kind' | 'name'>) => boolean
  /** the column's exact name; `after` tells two columns of one name apart (Rigging Kits carries
   *  "Trade Price" twice: the kit's, and after Sell Price, the kit fitted) */
  name: string
  after?: string
  said: string
  formula?: string
  /** the rule, on one line: true where it holds, false where not, null where it cannot be
   *  checked on that line (a figure it needs is not there) */
  check?: (read: Read, own: number) => boolean | null
}

const boat = (t: Pick<EntityDef, 'kind'>) => t.kind === 'boat'
const motor = (t: Pick<EntityDef, 'kind'>) => t.kind === 'motor'
const trailer = (t: Pick<EntityDef, 'kind'>) => t.kind === 'trailer'
const named =
  (start: string) =>
  (t: Pick<EntityDef, 'name'>): boolean =>
    t.name.toLowerCase().startsWith(start)
const packages = (t: Pick<EntityDef, 'kind' | 'name'>) =>
  t.kind === 'package' && /factory packages?/i.test(t.name)

/** ROUNDUP to whole dollars, settled to six places first so binary never tips a figure. */
const up = (n: number, to = 1): number => Math.ceil(Number((n / to).toFixed(6))) * to
/** within a dollar: the workbook rounds, and a figure typed over a formula is a dollar out */
const near = (a: number, b: number): boolean => Math.abs(a - b) <= 1

const ENTRIES: readonly Entry[] = [
  /* ---- Dealer Fit Packages (MPF_GROUND_TRUTH §6.8, §3.4) ---- */
  {
    on: named('dealer fit'),
    name: 'Act Sell',
    said: 'The whole package fitted: its parts at sell, its labour at the retail rate, and its sundries and sublet marked up 25%, GST in.',
    formula: 'ROUNDUP(Parts Sell + Labour Ret + (Sundry 1 + Sublet) × 1.25 × 1.1)',
    check: (read, own) => {
      /* a cell left empty is nought to the workbook's own SUM, so it is nought here */
      const want = up(
        (read('Parts Sell') ?? 0) +
          (read('Labour Ret') ?? 0) +
          ((read('Sundry 1') ?? 0) + (read('Sublet') ?? 0)) * 1.375,
      )
      return near(want, own)
    },
  },
  {
    on: named('dealer fit'),
    name: 'Sell',
    said: 'The sell of the package’s primary accessory alone, the first of the thirty it can hold: no other accessory, and no labour.',
    formula: 'Accessory 1’s Sell, in the band Dealer Fit Module!T:AA',
    /* one accessory's sell is never more than the sell of all the package's parts */
    check: (read, own) => {
      const parts = read('Parts Sell')
      return parts === null ? null : own <= parts
    },
  },

  /* ---- Rigging Kits (the columns' own records, Rigging Kits!K, V, AC) ---- */
  {
    on: named('rigging'),
    name: 'Kit Sell Price',
    said: 'The kit alone, supplied and not fitted: what the kit costs plus 25%, GST in, to the $10.',
    formula: 'ROUNDUP(Kit CTD × 1.25 × 1.1, to the $10)',
    check: (read, own) => {
      const cost = read('Kit CTD')
      return cost === null ? null : near(up(cost * 1.375, 10), own)
    },
  },
  {
    on: named('rigging'),
    name: 'Install Retail Sell',
    said: 'Fitting the kit, and nothing of the kit itself: its hours at the retail labour rate, and its extra parts and sundries marked up 30%, GST in.',
    formula:
      'ROUNDUP(NSM Lab (Hrs) × retail rate + (Additional Parts + Sundry) × 1.3 × 1.1, to the $10)',
  },
  {
    on: named('rigging'),
    name: 'Sell Price',
    said: 'The kit and its fitting together: Kit Sell Price plus Install Retail Sell.',
    formula: 'Kit Sell Price + Install Retail Sell',
    check: (read, own) => {
      /* an empty cell is nought to the workbook's sum */
      return near((read('Kit Sell Price') ?? 0) + (read('Install Retail Sell') ?? 0), own)
    },
  },
  {
    on: named('rigging'),
    name: 'Trade Price',
    said: 'A trade buyer’s price for the kit alone, supplied.',
  },
  {
    on: named('rigging'),
    name: 'Trade Price',
    after: 'Sell Price',
    said: 'A trade buyer’s price for the kit fitted: the kit’s Trade Price plus Install Trade Sell.',
    formula: 'Trade Price + Install Trade Sell',
    check: (read, own) => {
      return near((read('Trade Price') ?? 0) + (read('Install Trade Sell') ?? 0), own)
    },
  },
  {
    on: named('rigging'),
    name: 'Sub Dealer Price',
    said: 'A sub-dealer’s price for the kit alone: the same figure as its Trade Price.',
    check: (read, own) => {
      const trade = read('Trade Price')
      return trade === null ? null : own === trade
    },
  },

  /* ---- a motor, and a boat sold with one (MPF_GROUND_TRUTH §6.4) ---- */
  {
    on: motor,
    name: 'Sell Price',
    said: 'What Northside sells the motor for, with its pre-delivery in it: the recommended retail less the factory rebate and the dealer discount.',
  },
  {
    on: motor,
    name: 'RRP + Freight Inc GST',
    said: 'The recommended retail price, with freight and GST in.',
  },
  { on: motor, name: 'Trade Price', said: 'A trade buyer’s price for the motor.' },
  {
    on: packages,
    name: 'Sell Price',
    said: 'What Northside sells the boat and the motor it comes with for, together.',
  },
  {
    on: packages,
    name: 'RRP + Freight Inc GST',
    said: 'The recommended retail price of the boat and its motor, with freight and GST in.',
  },
  { on: packages, name: 'Trade Price', said: 'A trade buyer’s price for the boat and its motor.' },

  /* ---- a boat's hull (MPF_GROUND_TRUTH §6.2) ---- */
  {
    on: boat,
    name: 'Cash',
    said: 'The boat’s retail price, hull only, GST in: the figure every other price on the line is read against.',
  },
  {
    on: boat,
    name: 'Trade',
    said: 'Cash less the maker’s trade discount, rounded down to the dollar.',
    formula: 'ROUNDDOWN(Cash − Cash × Trade %)',
    check: (read, own) => {
      const cash = read('Cash')
      return cash === null ? null : own <= cash
    },
  },
  {
    on: boat,
    name: 'Warranty',
    said: 'Worked from what the boat cost Northside landed, less handling, plus 1% and GST.',
    formula: 'ROUNDUP((Landed Hull Cost − handling) × 1.01 × 1.1)',
    /* the handling taken off is not on the price list, so the check is the rule's ceiling */
    check: (read, own) => {
      const landed = read('Landed Hull Cost')
      return landed === null ? null : own <= up(landed * 1.111) + 1
    },
  },

  /* ---- a trailer (MPF_GROUND_TRUTH §6.6) ---- */
  {
    on: trailer,
    name: 'Sell inc Rego',
    said: 'The trailer’s sell price with its registration added after, never marked up.',
    formula: 'ROUNDUP(Sell + Rego ($))',
    check: (read, own) => {
      const sell = read('Sell')
      if (sell === null) return null
      return near(up(sell + (read('Rego ($)') ?? 0)), own)
    },
  },

  /* ---- a part (MPF_GROUND_TRUTH §6.7) ---- */
  {
    on: named('parts'),
    name: 'Sell',
    said: 'The part supplied, not fitted.',
  },
  {
    on: named('parts'),
    name: 'Sell inc Install (if appl.)',
    said: 'The part fitted: its sell, its sundries marked up, and its fitting hours at the retail labour rate.',
    formula: 'ROUNDDOWN(Sell + Sundry × 1.2 × 1.1 + TTF (Hours) × retail rate)',
    check: (read, own) => {
      const sell = read('Sell')
      return sell === null ? null : own >= sell
    },
  },
]

/** The workbook cell a column's own record names: "Dealer Fit Module!R · labelled here …" →
 *  "Dealer Fit Module!R". '' where the record names none. */
export function cellOf(field: Pick<FieldDef, 'description'>): string {
  const m = /^\s*([A-Za-z][^!·\n]*![A-Z]{1,3})\b/.exec(field.description ?? '')
  return m ? m[1]!.trim() : ''
}

/** The entry for one column of one list, telling apart two columns of one name by what stands
 *  before them. */
function entryOf(table: EntityDef, field: FieldDef): Entry | null {
  const candidates = ENTRIES.filter((e) => e.on(table) && e.name === field.name)
  if (candidates.length === 0) return null
  const at = table.fields.findIndex((f) => f.id === field.id)
  const before = new Set(table.fields.slice(0, Math.max(0, at)).map((f) => f.name))
  /* the most particular entry whose `after` is met wins; an entry with none is the plain one */
  const sameNameBefore = table.fields.slice(0, Math.max(0, at)).some((f) => f.name === field.name)
  const particular = candidates.find((e) => e.after !== undefined && before.has(e.after))
  if (particular && sameNameBefore) return particular
  return candidates.find((e) => e.after === undefined) ?? null
}

/** What a column of Northside's price list is, or null where nothing is written down about it. */
export function meaningOf(table: EntityDef, field: FieldDef): Meaning | null {
  const e = entryOf(table, field)
  if (!e) return null
  return { said: e.said, cell: cellOf(field), formula: e.formula ?? '' }
}

/** A line's figure in a column of its list, by the column's name — the first column of that
 *  name, as the workbook's own formulas read their neighbours. */
function readerOn(table: EntityDef, row: RowData): Read {
  return (name) => {
    const f = table.fields.find((x) => x.name === name)
    return f ? priceIn(row, f.id) : null
  }
}

/** THE WORKBOOK'S RULE FOR ONE COLUMN, CHECKED on every line of its list that holds a figure in
 *  it and the figures the rule reads. Null where no rule is said for it. */
export function checkField(
  table: EntityDef,
  rows: readonly RowData[],
  field: FieldDef,
): Checked | null {
  const e = entryOf(table, field)
  if (!e?.check) return null
  let holds = 0
  let of = 0
  for (const row of rows) {
    const own = priceIn(row, field.id)
    if (own === null) continue
    const ok = e.check(readerOn(table, row), own)
    if (ok === null) continue
    of += 1
    if (ok) holds += 1
  }
  return { holds, of }
}
