/* ============================================================
   THE LADDER, READ OFF THE PRICE LIST — what Prices (`/levels`)
   draws, counted from the loaded catalogue and from nothing else.

   ONE COLUMN PER LIST A CUSTOMER BUYS FROM, in the price list's own
   order: the seven boat makers, every trailer (eight makers' lists that
   read alike, so they share one column), the two motor makers, the
   factory packages (two lists that read alike), Dealer Fit, Parts and
   Rigging Kits. Labour Rates, Oils & Consumables and Registration Costs
   are not sold as a line, and are not on the ladder.

   EACH PRICE IS ONE OF THREE THINGS, and the screen says which as a
   fact, never as a hole: it READS a column of the price list (with how
   many lines hold a figure in it), it FALLS to Cash because the list has
   no column for it, or it is NOT PRICED — the list has sell columns and
   has not said which is its price.

   THE DATA ROUND (the judge of Prices, 2026-11-04) DEEPENED WHAT EACH
   COLUMN CARRIES, and nothing else of its shape: every figure Northside
   is asked to choose between says what it is and the workbook cell it
   comes from, with the workbook's rule checked on every line
   (`src/domain/pricing/meaning.ts`); two figures are read against each
   other over the whole list, never on one line (`spread.ts`); a list
   with no price is offered the WAYS it could be priced, every price a
   way names written in one step (`ways.ts`); and every count of lines
   with no figure carries the doors to the sheet that open exactly those
   lines, one door per kind of nothing.

   No figure here is typed. Every count is a count of lines; every
   figure is one line's own cell, and the line is named beside it.
   ============================================================ */

import type { CatalogueData } from '@/domain/catalogue/sheet'
import { CASH, ladderOn, priceIn, type LineNoun } from '@/domain/catalogue/priceCommands'
import { isCostColumn } from '@/domain/quote/pricing'
import { mayBeNamed, mayReachCustomer, workedFromCost } from '@/domain/pricing/worked'
import { cellOf, checkField, meaningOf, type Checked, type Meaning } from '@/domain/pricing/meaning'
import { linesAbove, noFigureIn, spreadOf, type Spread } from '@/domain/pricing/spread'
import { pricedBy, wayChosen, waysFor, type Way } from '@/domain/pricing/ways'
import type { LineEntry } from '@/domain/pricing/buyers'
import { countBoats } from '@/domain/quote/boats'
import { factoryPackage, lineSaid, spokenBoat } from '@/domain/quote/spoken'
import { nameOnPaper } from '@/domain/quote/paperWords'
import { figureIn, joinOnly, type Only } from '@/domain/catalogue/table/only'
import { readKitGrid, type KitGrid } from '@/domain/pricing/kitGrid'
import {
  isRetired,
  rowLabel,
  type EntityDef,
  type FieldDef,
  type PriceLevel,
  type RowData,
} from '@/domain/model'

/** What the ladder is read from: the price list's lists, their lines and their prices. */
export type Sheet = Pick<CatalogueData, 'tables' | 'rows' | 'priceLevels'>

/* ---------------------------------------------------------- */
/* Shapes                                                      */
/* ---------------------------------------------------------- */

export type Shelf = 'boats' | 'trailers' | 'motors' | 'packages' | 'parts'

export const SHELF_TITLE: Record<Shelf, string> = {
  boats: 'Boats',
  trailers: 'Trailers',
  motors: 'Motors',
  packages: 'Packages',
  parts: 'Parts & kits',
}

/** One line of the price list, named as a person reads it, with what the one picture reader
 *  is asked about it: its list, its line and the price list's own Image Link for it. */
export interface Sample {
  rowId: string
  name: string
  tableId: string
  /** the line's own Image Link, or '' — always '' for a factory package, whose Image Link is
   *  the picture of the motor it comes with and never of the package (CLAUDE.md: a picture
   *  belongs only to the exact model it depicts) */
  image: string
  /** the line is the one on the quote that sent the dealer here */
  onQuote?: boolean
  /** no picture is drawn for it at all: a factory package, whose held picture is its motor's */
  bare?: boolean
}

/** One price a way names, read on the sample line, with what it is. */
export interface Figure {
  key: string
  label: string
  fieldId: string
  /** the sample line's figure, or null when it holds none */
  figure: number | null
  meaning: Meaning | null
  /** the workbook's rule, checked across the column's every line; null where none is said */
  checked: Checked | null
}

/** A way a list could be priced, as the page draws it. */
export interface WayView {
  id: string
  title: string
  /** every price it names, read on the sample line, Cash first */
  figures: Figure[]
  /** lines it would price: those holding a figure in its Cash column, across the column */
  priced: number
  /** other columns holding the same figure as its Cash on every line */
  alsoNamed: string[]
  /** the ladder stands on it today */
  current: boolean
  /** the engine starts its Cash as Northside's own: a quote at it cannot be given until he lets
   *  it reach a customer */
  kept: boolean
  /** the way itself, for the write */
  way: Way
}

/** Two ways' Cash read against each other over every line holding both: the larger over the
 *  smaller, so the spread reads "Act Sell is 0.97–27.83 × Sell". */
export interface Between {
  more: string
  less: string
  spread: Spread
  /** THE LINES WHERE THE LARGER FIGURE IS UNDER THE SMALLER, with the door that opens exactly them
   *  on the sheet (the verifier of Prices, 2026-11-04: Rigging Kits' "Sell Price is 0.02–1.65 ×
   *  Kit Sell Price" was said with no comment and no door); null where there is none */
  under: Door | null
}

/** A DOOR TO THE LINES BEHIND A COUNT: the sheet, asked exactly the lines counted. */
export interface Door {
  tableId: string
  /** `/data/<table>?only=<token>` */
  href: string
  count: number
  /** what the lines are, as the door says it: "with nothing in Sell", "at $0 in Sell" */
  said: string
}

export type CashCell =
  | {
      state: 'reads'
      label: string
      priced: number
      /** lines at nought or blank — no price */
      none: number
      sample: Sample | null
      figure: number | null
      /** the dealer chose it on this screen */
      named: boolean
      mayReach: boolean
      /** the ways a customer's quote could be priced that a dealer may choose between: a motor's
       *  Sell Price and its RRP + Freight, or the ways a list he priced here was chosen from, so
       *  it can be changed where it was made. Null where there is nothing to choose between. */
      ways: WayView[] | null
      /** two figures a customer's quote could print, never chosen between: the owner's to choose */
      fork: boolean
      /** the list's sell columns hold one figure under two names on every line */
      forkAgrees: string[]
      between: Between | null
      meaning: Meaning | null
    }
  | {
      state: 'not-priced'
      ways: WayView[]
      between: Between | null
      sample: Sample | null
    }

export type TradeCell =
  | {
      state: 'falls'
      to: string
      /** THE LIST'S OWN TRADE COLUMN, carried and named by no price: the factory packages' Trade
       *  Price (Motor Library!BL), the same figure as Sell Price on all 73 priced lines (the
       *  verifier of Prices, round 2: "The list has no Trade price" was false). Null where the
       *  list carries none. */
      carried: { label: string; cell: string; same: number; of: number } | null
    }
  | { state: 'nothing' }
  | {
      state: 'reads'
      label: string
      /** lines with a Cash figure */
      priced: number
      /** of those, the same figure as Cash */
      same: number
      /** of those, no Trade figure — a trade quote cannot price them */
      blank: number
      /** the one share of Cash every other line holds, rounded down as the price list does */
      share: number | null
      /** the lowest and highest share of Cash, whole per cent, where they differ */
      low: number
      high: number
      sample: Sample | null
      cash: number | null
      trade: number | null
      meaning: Meaning | null
    }

export interface WarrantyCell {
  label: string
  priced: number
  /** what a priced line is, counted: "boats", or "finishes" where the list counts its boats apart
   *  from its lines (Highfield: 588 finishes of 67 boats) */
  unit: string
  low: number
  high: number
  /** lines whose Warranty figure is above their Cash */
  above: number
  /** those lines, named */
  aboveNames: string[]
  mayReach: boolean
  /** the widest gap on the list: the line, its Cash and its Warranty */
  widest: { sample: Sample; cash: number; warranty: number } | null
}

export interface Column {
  /** the table's id, or the shared column's own key */
  id: string
  tableIds: string[]
  shelf: Shelf
  /** as the head prints it */
  name: string
  /** the table whose maker's mark is drawn, when the column is one maker */
  markOf: string | null
  /** lines on the list(s) */
  lines: number
  /** A BOAT MAKER IS COUNTED IN MODELS, by the one count Home, the picker and Data read
   *  (`countBoats`). Null where a line is a model. */
  models: number | null
  noun: LineNoun
  cash: CashCell
  trade: TradeCell
  /** the fitted price, chosen line by line: Parts' Sell inc Install, a kit's Sell Price */
  fitted: { label: string; priced: number; meaning: Meaning | null } | null
  warranty: WarrantyCell | null
  /** the file's sub-dealer figure, where the list carries one; no quote is priced at it */
  sub: { label: string; held: number; sameAsTrade: number } | null
  /** the doors to the lines behind each count of no figure */
  doors: { cash: Door[]; trade: Door[]; warranty: Door[] }
  /** RIGGING KITS' NINE FIGURES, supplied, fitting and fitted by customer, trade and sub-dealer,
   *  read on the list's sample line (`kitGrid.ts`); null on every other list */
  kit: KitGrid | null
  /** the cost names on the list(s), Northside's only, never a price */
  costs: string[]
  /** a sample cost column, for the engine's refusal sentence */
  costField: { table: EntityDef; field: FieldDef } | null
  /** the price is quiet: it reads the price list as every list does */
  quiet: { cash: boolean; trade: boolean }
}

/* ---------------------------------------------------------- */
/* Small readers                                               */
/* ---------------------------------------------------------- */

/** The maker's word for a list: the first word of its name ("Highfield Inflatables" → Highfield). */
const makerOf = (table: EntityDef): string => table.name.split(/\s+/)[0] ?? table.name

/** A factory package's own picture is not on the price list: its Image Link is its motor's. */
const isFactoryPackage = (table: EntityDef): boolean =>
  table.kind === 'package' && /factory packages?/i.test(table.name)

/** A line's name as a person reads it — the maker's prefix the price list writes on every line
 *  ("Stacer - 309 Skimma") taken off, since the column already names the maker. */
export function sampleOf(table: EntityDef, row: RowData): Sample {
  return {
    rowId: row.id,
    name: spokenLine(table, rowLabel(table, row)),
    tableId: table.id,
    image: isFactoryPackage(table) ? '' : imageOf(table, row),
    ...(isFactoryPackage(table) ? { bare: true } : {}),
  }
}

/** A LINE AS A PERSON SAYS IT, by the one namer the build, the cascade and the paper ask
 *  (`src/domain/quote/spoken.ts`), with the file's shorthand said in full as the build and the
 *  paper say it (`nameOnPaper`): "3.4 m", never "3.4 Mtr" (the judge of Prices, 2026-11-04: the
 *  Tube Covers were "3.4 Mtr" here and "3.4 m" on the build). The maker the list already names
 *  comes off. A factory package keeps its boat beside the motor it comes with. */
export function spokenLine(table: EntityDef, label: string): string {
  if (table.kind === 'boat') {
    const boat = spokenBoat(table.id, label)
    return boat.say.startsWith(`${boat.maker} `) ? boat.say.slice(boat.maker.length + 1) : boat.say
  }
  const pack = factoryPackage(label, table.name)
  if (pack) return `${pack.boat} · ${pack.said}`
  const maker = makerOf(table)
  const bare = label.toLowerCase().startsWith(`${maker.toLowerCase()} - `)
    ? label.slice(maker.length + 3)
    : label
  return nameOnPaper(lineSaid(bare, table.name))
}

/** The price list's own Image Link on a line, for the one picture reader, or ''. */
function imageOf(table: EntityDef, row: RowData): string {
  const field = table.fields.find((f) => f.type === 'image')
  const v = field ? row.values[field.id] : null
  if (!Array.isArray(v)) return ''
  const first = v[0] as { src?: unknown } | undefined
  return typeof first?.src === 'string' ? first.src : ''
}

const rowsOf = (data: Sheet, tableIds: readonly string[]): RowData[] =>
  tableIds.flatMap((id) => data.rows[id] ?? [])

/** The column the pack marks a line no longer sold with. */
const DISCONTINUED = '__discontinued'

/** A line on sale: not marked no longer sold, and not one of a kit list's banner rows (the
 *  pack's Sentinel, "Not a kit") — the lines the look-up finds, and the only lines this page
 *  counts. */
const isOnSale = (tableId: string, row: RowData): boolean =>
  row.values[DISCONTINUED] !== true && row.values[`${tableId}.sentinel`] !== true

/**
 * THE PRICE LIST'S LINES ON SALE, and only those. Every count on Prices is of them (the verifier
 * of Prices, round 2: Dealer Fit's 1,777 held 201 discontinued lines, Parts' 2,937 held 699, and
 * Rigging Kits' 650 held 28 discontinued and 7 banner rows, which the look-up already skipped).
 * A list with nothing to take out keeps its own rows, so reading twice changes nothing.
 */
export function onSale(data: Sheet): Sheet {
  let rows: Record<string, RowData[]> | null = null
  for (const [id, list] of Object.entries(data.rows)) {
    const kept = list.filter((r) => isOnSale(id, r))
    if (kept.length === list.length) continue
    rows ??= { ...data.rows }
    rows[id] = kept
  }
  return rows ? { ...data, rows } : data
}

/** The same column on another list of the column, by its name and its place among columns of
 *  that name (Rigging Kits carries "Trade Price" twice). */
export function sameField(
  lead: EntityDef,
  fieldId: string,
  other: EntityDef,
): FieldDef | undefined {
  const f = lead.fields.find((x) => x.id === fieldId)
  if (!f) return undefined
  if (other.id === lead.id) return f
  const nth = lead.fields.filter((x) => x.name === f.name).findIndex((x) => x.id === f.id)
  return other.fields.filter((x) => x.name === f.name)[nth]
}

/** Lines holding a figure in a column, across every list of the column. */
function heldAcross(data: Sheet, tables: readonly EntityDef[], fieldId: string): number {
  const lead = tables[0]!
  let n = 0
  for (const t of tables) {
    const f = sameField(lead, fieldId, t)
    if (!f) continue
    for (const r of data.rows[t.id] ?? []) if (priceIn(r, f.id) !== null) n += 1
  }
  return n
}

/** Two checks of one rule, on two lists, as one. */
const plus = (a: Checked | null, b: Checked): Checked =>
  a ? { holds: a.holds + b.holds, of: a.of + b.of } : b

/** The workbook's rule for a column, checked across every list of the column. */
function checkedAcross(data: Sheet, tables: readonly EntityDef[], fieldId: string): Checked | null {
  const lead = tables[0]!
  let out: Checked | null = null
  for (const t of tables) {
    const f = sameField(lead, fieldId, t)
    if (!f) continue
    const c = checkField(t, data.rows[t.id] ?? [], f)
    if (!c) continue
    out = plus(out, c)
  }
  return out
}

/**
 * THE SHEET, ASKED EXACTLY THE LINES A COUNT HERE COUNTS: the question, and — every count on this
 * page being of lines on sale (`onSale`) — "not discontinued" and "not a banner" beside it on a
 * list that marks either, so the sheet shows the number the door says (the verifier of Prices,
 * round 2: "the other 44 hold no Act Sell" were 42 discontinued and 2 on sale).
 */
function sheetHref(table: EntityDef, ...asked: Only[]): string {
  const marks = [DISCONTINUED, `${table.id}.sentinel`]
    .filter((id) => table.fields.some((f) => f.id === id))
    .map((fieldId): Only => ({ kind: 'not', fieldId }))
  return `/data/${encodeURIComponent(table.id)}?only=${encodeURIComponent(joinOnly([...asked, ...marks]) ?? '')}`
}

/**
 * THE DOORS TO THE LINES WITH NO FIGURE IN A COLUMN, across every list of the column: one door
 * per list and per kind of nothing — nothing written, a nought, or a figure under nought that is
 * no price (`src/domain/pricing/credit.ts`) — each with the count the sheet will show. A figure
 * written as a word ("POA") has no question the sheet can ask, so no door.
 */
export function doorsOf(data: Sheet, tables: readonly EntityDef[], fieldId: string): Door[] {
  const lead = tables[0]!
  const out: Door[] = []
  for (const t of tables) {
    const f = sameField(lead, fieldId, t)
    if (!f) continue
    const rows = data.rows[t.id] ?? []
    const none = noFigureIn(rows, f.id)
    /* A DOOR IS ONE LINE IN A HAND (a button does not wrap): on a column of several lists it names
       the list by its maker, and the column is the one the sentence beside it already names */
    const said = (kind: string): string =>
      tables.length > 1
        ? `${kind} on ${t.name.replace(/\s+(trailers|factory packages)$/i, '')}`
        : `${kind} in ${f.name}`
    /* every figure under nought the sheet would show beside a nought, a credit among them */
    const minus = rows.filter((r) => (figureIn(r.values[f.id]) ?? 0) < 0).length
    if (none.blank > 0)
      out.push({
        tableId: t.id,
        href: sheetHref(t, { kind: 'empty', fieldId: f.id }),
        count: none.blank,
        said: said('with nothing'),
      })
    if (none.nought > 0)
      out.push({
        tableId: t.id,
        /* "at most 0" alone takes in every figure under nought: asked "at least 0" too, it is nought */
        href:
          minus > 0
            ? sheetHref(
                t,
                { kind: 'at-most', fieldId: f.id, value: 0 },
                { kind: 'at-least', fieldId: f.id, value: 0 },
              )
            : sheetHref(t, { kind: 'at-most', fieldId: f.id, value: 0 }),
        count: none.nought,
        said: said('at $0'),
      })
    /* the sheet's "under 0" shows a credit as well, so the door stands only where none is one */
    if (none.under > 0 && none.under === minus)
      out.push({
        tableId: t.id,
        href: sheetHref(t, { kind: 'below', fieldId: f.id, value: 0 }),
        count: none.under,
        said: said('under $0'),
      })
  }
  return out
}

/* ---------------------------------------------------------- */
/* The ways a list is priced                                   */
/* ---------------------------------------------------------- */

/** The motor a customer's quote was matched on to the dollar: Mark McWilliams matched the
 *  original's PDF to Northside's Display Sheet on the Yamaha F90XB at $17,643, its RRP + Freight
 *  Inc GST (HelmLogic tasks/RELEASE_NOTES_v1.32.0.md:26; Motor Library!R82). It is the sample the
 *  motor's two prices are shown on when the list carries it; the figures are read off its line. */
export const MATCHED_ON = 'F90XB'

/** The line a list's ways are read on: the matched motor where the list carries it, else a line
 *  holding every way's figures, else any line holding one. */
function sampleRow(
  table: EntityDef,
  rows: readonly RowData[],
  ways: readonly Way[],
): RowData | null {
  const code = table.fields.find((f) => f.name === 'Model Code')
  const matched = code ? rows.find((r) => r.values[code.id] === MATCHED_ON) : undefined
  if (matched) return matched
  const ids = ways.flatMap((w) => w.rungs.map((r) => r.fieldId))
  return (
    rows.find((r) => ids.every((id) => priceIn(r, id) !== null)) ??
    rows.find((r) => ways.every((w) => priceIn(r, w.rungs[0]!.fieldId) !== null)) ??
    rows.find((r) => ids.some((id) => priceIn(r, id) !== null)) ??
    null
  )
}

/** One way as the page draws it, read on the sample line. */
function viewOf(
  data: Sheet,
  tables: readonly EntityDef[],
  way: Way,
  row: RowData | null,
  current: boolean,
): WayView {
  const lead = tables[0]!
  const rows = rowsOf(
    data,
    tables.map((t) => t.id),
  )
  const cash = lead.fields.find((f) => f.id === way.rungs[0]!.fieldId)
  return {
    id: way.id,
    title: way.title,
    figures: way.rungs.map((r) => {
      const f = lead.fields.find((x) => x.id === r.fieldId)!
      return {
        key: r.key,
        label: r.label,
        fieldId: r.fieldId,
        figure: row ? priceIn(row, r.fieldId) : null,
        meaning: meaningOf(lead, f),
        checked: checkedAcross(data, tables, r.fieldId),
      }
    }),
    priced:
      tables.length === 1 ? pricedBy(way, rows) : heldAcross(data, tables, way.rungs[0]!.fieldId),
    alsoNamed: way.alsoNamed,
    current,
    kept: cash ? workedFromCost(cash) !== null : false,
    way,
  }
}

/** Two single-figure ways read against each other over the whole column. */
function betweenOf(
  data: Sheet,
  tables: readonly EntityDef[],
  ways: readonly WayView[],
): Between | null {
  if (ways.length !== 2) return null
  const [a, b] = ways
  const rows = rowsOf(
    data,
    tables.map((t) => t.id),
  )
  const fa = a!.figures[0]!
  const fb = b!.figures[0]!
  if (tables.length > 1 || fa.fieldId === fb.fieldId) return null
  const ab = spreadOf(rows, fa.fieldId, fb.fieldId)
  if (!ab) return null
  const [more, less] = ab.median >= 1 ? [fa, fb] : [fb, fa]
  const spread = ab.median >= 1 ? ab : spreadOf(rows, fb.fieldId, fa.fieldId)!
  /* counted as the sheet's own question counts it (`only.ts`, "under"), so the door's count is the
     count the sheet shows */
  const count = rows.filter((r) => {
    const x = figureIn(r.values[more.fieldId])
    const y = figureIn(r.values[less.fieldId])
    return x !== null && y !== null && x < y
  }).length
  const lead = tables[0]!
  return {
    more: more.label,
    less: less.label,
    spread,
    under:
      count > 0
        ? {
            tableId: lead.id,
            href: sheetHref(lead, { kind: 'under', fieldId: more.fieldId, than: less.fieldId }),
            count,
            said: `with ${more.label} under ${less.label}`,
          }
        : null,
  }
}

/* ---------------------------------------------------------- */
/* Cash                                                        */
/* ---------------------------------------------------------- */

function cashOf(data: Sheet, tables: readonly EntityDef[]): CashCell {
  const lead = tables[0]!
  const leadRows = data.rows[lead.id] ?? []
  const ladder = ladderOn(data, lead)
  const cash = ladder.find((l) => l.key === CASH)
  const all = waysFor(lead, leadRows)

  if (!cash) {
    /* NOT PRICED: the ways every list in the column could name */
    const ways = all.filter((w) =>
      w.rungs.every((r) => tables.every((t) => sameField(lead, r.fieldId, t))),
    )
    const row = sampleRow(lead, leadRows, ways)
    const views = ways.map((w) => viewOf(data, tables, w, row, false))
    return {
      state: 'not-priced',
      sample: row ? sampleOf(lead, row) : null,
      ways: views,
      between: betweenOf(data, tables, views),
    }
  }

  const priced = heldAcross(data, tables, cash.fieldId)
  const lines = rowsOf(
    data,
    tables.map((t) => t.id),
  ).length
  const field = lead.fields.find((f) => f.id === cash.fieldId)
  const chosen = wayChosen(all, ladder)

  /* THE FORK: a list carrying a figure a customer's quote could print beside the one its Cash
     reads, and not already one of its prices — the motor's RRP + Freight beside its Sell Price.
     A part's Sell inc Install is its fitted price already, so it is no rival. */
  const rivals = all.filter(
    (w) =>
      w.rungs.length === 1 &&
      (w.rungs[0]!.fieldId === cash.fieldId ||
        !ladder.some((l) => l.fieldId === w.rungs[0]!.fieldId)),
  )
  const fork = tables.length === 1 && rivals.length > 1 && cash.named !== true
  const forkAgrees = all.find((w) => w.rungs[0]!.fieldId === cash.fieldId)?.alsoNamed ?? []
  /* the ways a choice made here can be changed among, where it was made */
  const choosable =
    tables.length === 1 && rivals.length > 1
      ? rivals
      : cash.named === true && all.length > 1
        ? all
        : null
  const row =
    sampleRow(lead, leadRows, choosable ?? []) ??
    leadRows.find((r) => priceIn(r, cash.fieldId) !== null) ??
    null
  const views = choosable
    ? choosable.map((w) =>
        viewOf(
          data,
          tables,
          w,
          row,
          chosen ? w.id === chosen.id : w.rungs[0]!.fieldId === cash.fieldId,
        ),
      )
    : null
  return {
    state: 'reads',
    label: cash.label,
    priced,
    none: lines - priced,
    sample: row ? sampleOf(lead, row) : null,
    figure: row ? priceIn(row, cash.fieldId) : null,
    named: cash.named === true,
    mayReach: mayReachCustomer(lead, cash),
    ways: views,
    fork,
    forkAgrees,
    between: views ? betweenOf(data, tables, views) : null,
    meaning: field ? meaningOf(lead, field) : null,
  }
}

/* ---------------------------------------------------------- */
/* Trade                                                       */
/* ---------------------------------------------------------- */

/** The one whole share p for which ROUNDDOWN(cash × p%) is this trade figure, or null. */
function exactShare(cash: number, trade: number): number | null {
  const guess = Math.round((trade / cash) * 100)
  for (const p of [guess, guess + 1, guess - 1]) {
    if (Math.floor(Number(((cash * p) / 100).toFixed(6))) === trade) return p
  }
  return null
}

/** A list's own trade column that no price names, read against its Cash on every line holding
 *  Cash: how many hold the same figure. Null where the list carries none. */
function carriedTrade(
  data: Sheet,
  tables: readonly EntityDef[],
  cashId: string,
): Extract<TradeCell, { state: 'falls' }>['carried'] {
  const lead = tables[0]!
  const ladder = ladderOn(data, lead)
  const own = lead.fields.find(
    (f) => /^trade\b/i.test(f.name.trim()) && !ladder.some((l) => l.fieldId === f.id),
  )
  if (!own) return null
  let of = 0
  let same = 0
  for (const t of tables) {
    const cf = sameField(lead, cashId, t)
    const tf = sameField(lead, own.id, t)
    if (!cf || !tf) continue
    for (const r of data.rows[t.id] ?? []) {
      const cv = priceIn(r, cf.id)
      if (cv === null) continue
      of += 1
      if (priceIn(r, tf.id) === cv) same += 1
    }
  }
  return { label: own.name, cell: cellOf(own), same, of }
}

function tradeOf(data: Sheet, tables: readonly EntityDef[], cash: CashCell): TradeCell {
  if (cash.state !== 'reads') return { state: 'falls', to: 'Not priced', carried: null }
  if (cash.priced === 0) return { state: 'nothing' }
  const lead = tables[0]!
  const ladder = ladderOn(data, lead)
  const c = ladder.find((l) => l.key === CASH)!
  const t = ladder.find((l) => l.key === 'trade')
  if (!t || tables.length > 1)
    return { state: 'falls', to: c.label, carried: carriedTrade(data, tables, c.fieldId) }

  let priced = 0
  let same = 0
  let blank = 0
  let low = Infinity
  let high = -Infinity
  const shares = new Set<number | null>()
  /* the same line the Cash figure is shown on, so the two figures are one line's two prices */
  const leadRows = data.rows[lead.id] ?? []
  let sample: RowData | undefined = cash.sample
    ? leadRows.find((r) => r.id === cash.sample?.rowId)
    : undefined
  for (const r of leadRows) {
    const cv = priceIn(r, c.fieldId)
    if (cv === null) continue
    priced += 1
    const tv = priceIn(r, t.fieldId)
    sample ??= r
    if (tv === null) {
      blank += 1
      continue
    }
    if (tv === cv) {
      same += 1
      shares.add(100)
    } else shares.add(exactShare(cv, tv))
    const pc = (tv / cv) * 100
    low = Math.min(low, pc)
    high = Math.max(high, pc)
  }
  const only = shares.size === 1 ? [...shares][0]! : null
  const field = lead.fields.find((f) => f.id === t.fieldId)
  return {
    state: 'reads',
    label: t.label,
    priced,
    same,
    blank,
    share: only,
    low: Number.isFinite(low) ? Math.round(low) : 100,
    high: Number.isFinite(high) ? Math.round(high) : 100,
    sample: sample ? sampleOf(lead, sample) : null,
    cash: sample ? priceIn(sample, c.fieldId) : null,
    trade: sample ? priceIn(sample, t.fieldId) : null,
    meaning: field ? meaningOf(lead, field) : null,
  }
}

/* ---------------------------------------------------------- */
/* Warranty                                                    */
/* ---------------------------------------------------------- */

function warrantyOf(data: Sheet, table: EntityDef): WarrantyCell | null {
  const ladder = ladderOn(data, table)
  const c = ladder.find((l) => l.key === CASH)
  const w = ladder.find((l) => l.key === 'warranty')
  if (!c || !w) return null
  const rows = data.rows[table.id] ?? []
  let priced = 0
  let low = Infinity
  let high = -Infinity
  let widest: WarrantyCell['widest'] = null
  for (const r of rows) {
    const cv = priceIn(r, c.fieldId)
    const wv = priceIn(r, w.fieldId)
    if (cv === null || wv === null) continue
    priced += 1
    const pc = (wv / cv) * 100
    low = Math.min(low, pc)
    high = Math.max(high, pc)
    if (!widest || cv - wv > widest.cash - widest.warranty)
      widest = { sample: sampleOf(table, r), cash: cv, warranty: wv }
  }
  const above = linesAbove(rows, w.fieldId, c.fieldId)
  return {
    label: w.label,
    priced,
    unit: 'boats',
    low: Number.isFinite(low) ? Math.round(low) : 0,
    high: Number.isFinite(high) ? Math.round(high) : 0,
    above: above.length,
    aboveNames: above.map((r) => sampleOf(table, r).name),
    mayReach: mayReachCustomer(table, w),
    widest,
  }
}

/* ---------------------------------------------------------- */
/* The columns                                                 */
/* ---------------------------------------------------------- */

const SHELF_OF: Partial<Record<string, Shelf>> = {
  boat: 'boats',
  trailer: 'trailers',
  motor: 'motors',
  package: 'packages',
  accessory: 'parts',
}

const SHELVES: readonly Shelf[] = ['boats', 'trailers', 'motors', 'packages', 'parts']

/** Two lists read alike when their prices are the same prices by the same names — or, for lists
 *  with no price, when they could name the same columns as one. */
const shapeOf = (data: Sheet, t: EntityDef): string => {
  const ladder = ladderOn(data, t)
  return ladder.length > 0
    ? ladder.map((l) => `${l.key}:${l.label}`).join('|')
    : `none:${waysFor(t, [])
        .map((w) => w.rungs.map((r) => r.label).join('+'))
        .join('|')}`
}

const nounOf = (shelf: Shelf, tables: readonly EntityDef[], finishes: boolean): LineNoun => {
  const lead = tables[0]!
  /* docs/WORDS.md: "variant" stays on the price list editor; the dealer says finish */
  if (shelf === 'boats' && finishes)
    return { one: `${makerOf(lead)} finish`, many: `${makerOf(lead)} finishes` }
  if (shelf === 'boats') return { one: `${makerOf(lead)} boat`, many: `${makerOf(lead)} boats` }
  if (shelf === 'motors') return { one: `${makerOf(lead)} motor`, many: `${makerOf(lead)} motors` }
  if (shelf === 'trailers') return { one: 'trailer', many: 'trailers' }
  if (tables.length > 1) return { one: 'factory package', many: 'factory packages' }
  const name = lead.name.toLowerCase()
  if (name.startsWith('dealer fit'))
    return { one: 'dealer fit package', many: 'dealer fit packages' }
  if (name.startsWith('rigging')) return { one: 'rigging kit', many: 'rigging kits' }
  if (name.startsWith('parts')) return { one: 'part', many: 'parts' }
  return { one: lead.name, many: lead.name }
}

function nameOf(shelf: Shelf, tables: readonly EntityDef[]): string {
  const lead = tables[0]!
  if (shelf === 'trailers') return 'Every trailer'
  if (tables.length > 1) return 'Factory packages'
  if (lead.name.startsWith('Dealer Fit')) return 'Dealer Fit'
  if (lead.name.startsWith('Parts')) return 'Parts'
  return lead.name
}

/** A sub-dealer figure, by the price list's own name for it. */
const isSub = (f: FieldDef): boolean => /^sub ?dealer price$/i.test(f.name.trim())

/** The column for a group of lists that read alike. */
function columnOf(data: Sheet, shelf: Shelf, tables: EntityDef[]): Column {
  const lead = tables[0]!
  const cash = cashOf(data, tables)
  const trade = tradeOf(data, tables, cash)
  const ladder = ladderOn(data, lead)
  const fittedRung = ladder.find((l: PriceLevel) => l.key === 'fitted')
  const costs = new Set<string>()
  let costField: Column['costField'] = null
  for (const t of tables)
    for (const f of t.fields)
      /* a price worked from cost is not "never a price": the dealer may name it, above */
      if (isCostColumn(t, f) && f.type === 'number' && !mayBeNamed(f)) {
        costs.add(f.name)
        costField ??= { table: t, field: f }
      }
  const lines = rowsOf(
    data,
    tables.map((t) => t.id),
  ).length
  const counted =
    shelf === 'boats' && tables.length === 1 && (lead.hierarchy ?? []).length >= 3
      ? (countBoats([lead], data.rows).byMaker[0]?.boats ?? null)
      : null
  const models = counted !== null && counted > 0 && counted !== lines ? counted : null
  const cashRung = ladder.find((l) => l.key === CASH)
  const tradeRung = ladder.find((l) => l.key === 'trade')
  const warrantyRung = ladder.find((l) => l.key === 'warranty')

  /* THE FILE'S SUB-DEALER FIGURE, where the list carries one beside its trade figure */
  const tradeAt = tradeRung ? lead.fields.findIndex((f) => f.id === tradeRung.fieldId) : -1
  const subField =
    (tradeAt >= 0 ? lead.fields.slice(tradeAt + 1).find(isSub) : undefined) ??
    lead.fields.find(isSub)
  const kitTrade = tradeRung ?? null
  const sub =
    subField && tables.length === 1
      ? (() => {
          const rows = data.rows[lead.id] ?? []
          const tradeId =
            kitTrade?.fieldId ?? lead.fields.find((f) => f.name === 'Trade Price')?.id ?? ''
          let held = 0
          let same = 0
          for (const r of rows) {
            const s = priceIn(r, subField.id)
            if (s === null) continue
            held += 1
            if (s === priceIn(r, tradeId)) same += 1
          }
          return { label: subField.name, held, sameAsTrade: same }
        })()
      : null

  const fittedField = fittedRung ? lead.fields.find((f) => f.id === fittedRung.fieldId) : undefined
  const leadRows = data.rows[lead.id] ?? []
  const kitOn = cash.sample ? (leadRows.find((r) => r.id === cash.sample?.rowId) ?? null) : null
  return {
    id: tables.length > 1 ? `${shelf}:${lead.id}` : lead.id,
    tableIds: tables.map((t) => t.id),
    shelf,
    name: nameOf(shelf, tables),
    markOf: tables.length === 1 && (shelf === 'boats' || shelf === 'motors') ? lead.name : null,
    lines,
    models,
    noun: nounOf(shelf, tables, models !== null),
    cash,
    trade,
    fitted: fittedRung
      ? {
          label: fittedRung.label,
          priced: (data.rows[lead.id] ?? []).filter((r) => priceIn(r, fittedRung.fieldId) !== null)
            .length,
          meaning: fittedField ? meaningOf(lead, fittedField) : null,
        }
      : null,
    warranty: (() => {
      const w = shelf === 'boats' ? warrantyOf(data, lead) : null
      /* a list counted in models has lines that are its finishes, and Warranty is read per line */
      return w && models !== null ? { ...w, unit: 'finishes' } : w
    })(),
    sub,
    kit: tables.length === 1 ? readKitGrid(lead, leadRows, ladder, kitOn) : null,
    doors: {
      cash: cashRung ? doorsOf(data, tables, cashRung.fieldId) : [],
      trade:
        tradeRung && trade.state === 'reads' && trade.blank > 0
          ? doorsOf(data, tables, tradeRung.fieldId)
          : [],
      warranty:
        warrantyRung && cashRung && shelf === 'boats' && tables.length === 1
          ? [
              {
                tableId: lead.id,
                href: sheetHref(lead, {
                  kind: 'under',
                  fieldId: cashRung.fieldId,
                  than: warrantyRung.fieldId,
                }),
                count: linesAbove(data.rows[lead.id] ?? [], warrantyRung.fieldId, cashRung.fieldId)
                  .length,
                said: `with ${warrantyRung.label} above ${cashRung.label}`,
              },
            ].filter((d) => d.count > 0)
          : [],
    },
    costs: [...costs],
    costField,
    quiet: {
      cash: cash.state === 'reads' && cash.none === 0 && !cash.fork && cash.mayReach,
      trade:
        trade.state === 'falls' ||
        (trade.state === 'reads' && trade.same === trade.priced && trade.blank === 0),
    },
  }
}

/**
 * THE LADDER: every list a customer buys from, one column each — or one column for lists that
 * read alike, which is how eight trailer makers become "Every trailer" — in the price list's own
 * order within each shelf.
 */
export function readLadder(all: Sheet): Column[] {
  const data = onSale(all)
  const byShelf = new Map<Shelf, EntityDef[][]>()
  /* THE PRICE LIST'S OWN ORDER: the file lays its lists out in reading order, and each list's
     place is where it was laid (`position`), so reading it back by row then column is that order */
  const ordered = Object.values(data.tables).toSorted(
    (a, b) => a.position.y - b.position.y || a.position.x - b.position.x,
  )
  for (const table of ordered) {
    if (table.role === 'join') continue
    /* A LIST NO LONGER SOLD IS NOT ON THE LADDER (built-critique-m3.md, major 11) */
    if (isRetired(table)) continue
    const shelf = table.kind ? SHELF_OF[table.kind] : undefined
    if (!shelf) continue
    const groups = byShelf.get(shelf) ?? []
    /* boats and motors are one column per maker, whatever their columns: their prices differ */
    const alike =
      shelf === 'boats' || shelf === 'motors'
        ? undefined
        : groups.find((g) => shapeOf(data, g[0]!) === shapeOf(data, table))
    if (alike) alike.push(table)
    else groups.push([table])
    byShelf.set(shelf, groups)
  }
  const out: Column[] = []
  for (const shelf of SHELVES)
    for (const tables of byShelf.get(shelf) ?? []) out.push(columnOf(data, shelf, tables))
  return out
}

/** The lists whose Warranty is set by the one switch on the Northside ground. */
export const warrantyTargets = (columns: readonly Column[]) =>
  columns
    .filter((c) => c.warranty !== null)
    .flatMap((c) => c.tableIds.map((tableId) => ({ tableId, key: 'warranty' })))

/* ============================================================
   THE PAGE, BY WHO HAS TO ACT — direction F, "Yours to decide"
   (docs/directions/levels-boards/, judged 2026-10-28).

   YOURS TO CHOOSE — a question only Northside can answer: a motor's
   two figures nobody has chosen between, or a list with sell figures
   and no price. In the order of how many lines each answer prices.

   KEPT FROM CUSTOMERS — a price that starts as Northside's own
   (Warranty on every boat; a motor's RRP + Freight once it is chosen),
   with the one switch that says whether it may reach a customer.

   SETTLED — everything else, in the price list's own order, each with
   the one fact that says how it prices: by the price list, or by you.
   ============================================================ */

/** A question only the dealer can answer is still open on this list. */
export function undecided(col: Column): boolean {
  const c = col.cash
  if (c.state === 'not-priced') return true
  return c.fork
}

/** THE LINE WARRANTY IS READ ON: the Highfield SP560 (HYP) W-W-WB, model code HBS114 (Boat
 *  Module!R837), the line the customer's-paper analysis measured Warranty on — $32,166 against
 *  Cash $48,350 (docs/research/proposal/analysis.md §4). The figures are read off its line,
 *  never typed; a price list without it reads Warranty on the widest gap instead. */
export const WARRANTY_READ_ON = 'HBS114'

/** One line a kept price is read on: the line, its figure, and the one it stands against. */
export interface KeptSpecimen {
  sample: Sample
  /** the maker, in one word */
  maker: string
  figure: number
  against: number
  againstLabel: string
}

/** ONE MAKER'S WARRANTY ACROSS ITS LIST, for the well's scale. */
export interface KeptRange {
  maker: string
  tableId: string
  /** lines holding both figures */
  priced: number
  /** what those lines are: "boats", or "finishes" */
  unit: string
  low: number
  high: number
  above: number
  aboveNames: string[]
  /** the door to the lines above Cash */
  door: Door | null
}

/** A PRICE THAT STARTS AS NORTHSIDE'S OWN, and its one switch. */
export interface Kept {
  /** where its step is said: 'warranty', or the list's id with '#reach' */
  id: string
  label: string
  /** what it is on, in a few words: "every boat, from 7 makers" */
  on: string
  targets: Array<{ tableId: string; key: string }>
  mayReach: boolean
  /** what it is, and its cell; for Warranty the workbook's rule, checked */
  meaning: Meaning | null
  checked: Checked | null
  specimen: KeptSpecimen | null
  /** each maker's range against Cash, where the price is read against Cash */
  ranges: KeptRange[]
  /** what a quote cannot do while it is Northside's only */
  whileOff: string
}

export interface Desk {
  choose: Column[]
  kept: Kept[]
  settled: Column[]
}

/** How far a list's Warranty falls under its Cash on its widest line. */
const gap = (c: Column): number =>
  c.warranty?.widest ? c.warranty.widest.cash - c.warranty.widest.warranty : -Infinity

function warrantySpecimen(data: Sheet, columns: readonly Column[]): KeptSpecimen | null {
  for (const col of columns) {
    const table = data.tables[col.tableIds[0]!]
    if (!table) continue
    const code = table.fields.find((f) => f.name === 'Model Code')
    const row = code
      ? (data.rows[table.id] ?? []).find((r) => r.values[code.id] === WARRANTY_READ_ON)
      : undefined
    if (!row) continue
    const ladder = ladderOn(data, table)
    const c = ladder.find((l) => l.key === CASH)
    const w = ladder.find((l) => l.key === 'warranty')
    const cv = c ? priceIn(row, c.fieldId) : null
    const wv = w ? priceIn(row, w.fieldId) : null
    if (!c || cv === null || wv === null) continue
    return {
      sample: sampleOf(table, row),
      maker: makerOf(table),
      figure: wv,
      against: cv,
      againstLabel: c.label,
    }
  }
  const widest = columns.filter((c) => c.warranty?.widest).toSorted((a, b) => gap(b) - gap(a))[0]
  const w = widest?.warranty?.widest
  const table = widest ? data.tables[widest.tableIds[0]!] : undefined
  if (!w || !table) return null
  return {
    sample: w.sample,
    maker: makerOf(table),
    figure: w.warranty,
    against: w.cash,
    againstLabel: 'Cash',
  }
}

/** The page: what is the dealer's to choose, what starts as Northside's own, what is settled. */
export function readDesk(all: Sheet, columns: readonly Column[]): Desk {
  const data = onSale(all)
  const choose = columns
    .filter(undecided)
    .toSorted((a, b) => b.lines - a.lines || a.name.localeCompare(b.name))
  const settled = columns.filter((c) => !undecided(c))
  const kept: Kept[] = []

  const boats = columns.filter((c) => c.warranty !== null && c.warranty.priced > 0)
  const label = boats[0]?.warranty?.label
  if (label) {
    const lead = data.tables[boats[0]!.tableIds[0]!]
    const field = lead?.fields.find((f) => f.name === label)
    let checked: Checked | null = null
    for (const col of boats) {
      const t = data.tables[col.tableIds[0]!]
      const f = t?.fields.find((x) => x.name === label)
      const c = t && f ? checkField(t, data.rows[t.id] ?? [], f) : null
      if (c) checked = plus(checked, c)
    }
    kept.push({
      id: 'warranty',
      label,
      on: `every boat, from ${boats.length} ${boats.length === 1 ? 'maker' : 'makers'}`,
      targets: warrantyTargets(columns.filter((c) => c.warranty !== null)),
      mayReach: boats.some((c) => c.warranty?.mayReach === true),
      meaning: lead && field ? meaningOf(lead, field) : null,
      checked,
      specimen: warrantySpecimen(data, boats),
      ranges: boats.map((col) => ({
        maker: makerOf(data.tables[col.tableIds[0]!]!),
        tableId: col.tableIds[0]!,
        priced: col.warranty!.priced,
        unit: col.warranty!.unit,
        low: col.warranty!.low,
        high: col.warranty!.high,
        above: col.warranty!.above,
        aboveNames: col.warranty!.aboveNames,
        door: col.doors.warranty[0] ?? null,
      })),
      whileOff: `While it is off, a quote with a line at ${label} cannot be given.`,
    })
  }

  /* A PRICE THE DEALER POINTED AT A FIGURE THE ENGINE STARTS AS NORTHSIDE'S OWN */
  for (const col of settled) {
    const c = col.cash
    if (c.state !== 'reads' || !c.named) continue
    const lead = data.tables[col.tableIds[0]!]
    const field = lead?.fields.find((f) => f.name === c.label)
    if (!lead || !field || workedFromCost(field) === null) continue
    const other = c.ways?.find((w) => !w.current && w.figures[0]?.figure !== null)
    kept.push({
      id: `${col.id}#reach`,
      label: c.label,
      on: `every ${col.noun.one}`,
      targets: col.tableIds.map((tableId) => ({ tableId, key: CASH })),
      mayReach: c.mayReach,
      meaning: meaningOf(lead, field),
      checked: null,
      specimen:
        c.sample && c.figure !== null && other && other.figures[0]!.figure !== null
          ? {
              sample: c.sample,
              maker: makerOf(lead),
              figure: c.figure,
              against: other.figures[0]!.figure,
              againstLabel: other.title,
            }
          : null,
      ranges: [],
      whileOff: `While it is off, a quote with a ${col.noun.one} on it cannot be given.`,
    })
  }
  return { choose, kept, settled }
}

/** THE QUESTION an undecided list asks, in the dealer's words. */
export function questionOf(col: Column): string {
  const c = col.cash
  if (c.state === 'not-priced') {
    /* one figure under several names is still a price nobody has named, and a quote with one of
       these lines cannot be given until it is — but there is nothing to choose between */
    /* the figure's names are said once, on the way's own tile (the verifier of Prices, round 2:
       "one figure under 2 names" stood in the row, in the panel and on the tile) */
    if (c.ways.length === 1)
      return `Your price list names no price for a ${col.noun.one}. Until you name one, each on a quote is priced by hand.`
    /* a way of several prices is a way of selling: Rigging Kits supplied or fitted */
    if (c.ways.some((w) => w.figures.length > 1))
      return `How is a ${col.noun.one} sold: supplied, or always fitted? Until you choose, each one on a quote is priced by hand.`
    return `Which figure is a ${col.noun.one}’s price? Until you choose, each one on a quote is priced by hand.`
  }
  return `Which figure does a customer’s quote show? Today it shows ${c.label}.`
}

/** THE SAME LIST READ ON THE LINE THE DEALER CAME FROM — the line on the quote that sent him
 *  here (built-critique-m3-2.md, major 2). The line's name and its own figures stand where any
 *  line of the list stood, so the choice is made on what the customer is looking at. */
export function onLine(data: Sheet, col: Column, tableId: string, rowId: string): Column {
  if (!col.tableIds.includes(tableId)) return col
  const table = data.tables[tableId]
  const row = data.rows[tableId]?.find((r) => r.id === rowId)
  if (!table || !row) return col
  const sample: Sample = { ...sampleOf(table, row), onQuote: true }
  const lead = data.tables[col.tableIds[0]!]!
  const again = (ws: WayView[]): WayView[] =>
    ws.map((w) => ({
      ...w,
      figures: w.figures.map((f) => {
        const field = sameField(lead, f.fieldId, table)
        return { ...f, figure: field ? priceIn(row, field.id) : null }
      }),
    }))
  const c = col.cash
  if (c.state === 'not-priced') return { ...col, cash: { ...c, sample, ways: again(c.ways) } }
  const cashField = ladderOn(data, table).find((l) => l.key === CASH)?.fieldId
  return {
    ...col,
    cash: {
      ...c,
      sample,
      figure: cashField ? priceIn(row, cashField) : null,
      ways: c.ways ? again(c.ways) : null,
    },
  }
}

const count = (value: number): string => new Intl.NumberFormat('en-AU').format(value)

/** A name's trailing note taken off: "Sell inc Install (if appl.)" → "Sell inc Install". */
export const plainName = (label: string): string => label.replace(/\s*\([^)]*\)\s*$/, '')

/** THE ONE FACT a settled list's tile says: how it prices, then what differs. */
export function settledFact(col: Column): string {
  const c = col.cash
  if (c.state === 'not-priced') return 'Not priced'
  if (c.priced === 0) return `No ${c.label} on any`
  const t = col.trade
  const said: string[] = []
  if (t.state === 'reads' && t.same < t.priced - t.blank) {
    said.push(
      t.share !== null && t.same === 0
        ? `${t.label} is ${t.share}% of ${c.label}`
        : `${t.label} is ${t.low}–${t.high}% of ${c.label}`,
    )
  } else if (col.fitted) {
    said.push(`${c.label}, or ${plainName(col.fitted.label)} fitted`)
  } else if (c.named) {
    said.push(`Priced at ${c.label}`)
  } else if (t.state === 'reads' && t.blank > 0) {
    /* NOT "ONE PRICE FOR EVERY BUYER" OVER LINES A TRADE BUYER CANNOT BE PRICED ON (the verifier of
       Prices, round 2: Jeanneau's tile said it over 8 boats with no Trade) */
    said.push(`${t.label} is ${c.label} on ${count(t.same)}`)
  } else {
    said.push('One price for every buyer')
  }
  if (c.none > 0) said.push(`${count(c.none)} not priced`)
  if (t.state === 'reads' && t.blank > 0) said.push(`${count(t.blank)} with no ${t.label}`)
  return said.join(' · ')
}

/** A boat maker sold in its own factory packages: the package list whose name begins with the
 *  maker's (Haines Signature → Haines Signature Factory Packages), or null. */
export function soldAsPackage(data: Sheet, col: Column): string | null {
  if (col.shelf !== 'boats') return null
  const lead = data.tables[col.tableIds[0]!]
  if (!lead) return null
  const pkg = Object.values(data.tables).find(
    (t) => t.kind === 'package' && t.id !== lead.id && t.name.startsWith(`${lead.name} `),
  )
  return pkg ? pkg.name : null
}

/* ---------------------------------------------------------- */
/* Every line a person could look up                           */
/* ---------------------------------------------------------- */

const CODE_COLUMNS = ['Model Code', 'Code', 'Part Number']

/** EVERY LINE ON SALE, named as the build names it, with the code the dealer orders by — what the
 *  look-up finds by. A line marked no longer sold, and a kit list's banner rows, are not lines. */
export function lineEntries(data: Sheet, columns: readonly Column[]): LineEntry[] {
  const out: LineEntry[] = []
  for (const col of columns)
    for (const tableId of col.tableIds) {
      const table = data.tables[tableId]
      if (!table) continue
      const code = CODE_COLUMNS.map((n) => table.fields.find((f) => f.name === n)).find(Boolean)
      for (const row of data.rows[tableId] ?? []) {
        if (!isOnSale(tableId, row)) continue
        const label = rowLabel(table, row)
        if (label.trim() === '') continue
        const c = code ? row.values[code.id] : null
        out.push({
          tableId,
          rowId: row.id,
          name: spokenLine(table, label),
          code: typeof c === 'string' ? c : '',
          list: col.shelf === 'boats' ? makerOf(table) : col.name,
        })
      }
    }
  return out
}
