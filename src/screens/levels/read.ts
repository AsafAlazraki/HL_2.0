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
   no column for it ("No Trade price, so a trade quote stays at Sell inc
   Rego"), or it is NOT PRICED — the list has sell columns and has not
   said which is its price.

   THE ORDINARY IS QUIET AND THE DIFFERENT IS LOUD (the verdict's
   must-change on board A). `quiet` on a cell means "it says what every
   list says": Cash on all its lines, Trade the same figure as Cash. A
   cell that is not quiet is one of the handful of facts that differ —
   Highfield's 95%, Formosa's nine boats at nought, Jeanneau's eight with
   no Trade, the Yamahas' two columns, the lists with no price.

   No figure here is typed. Every count is a count of lines; every
   figure is one line's own cell, and the line is named beside it.
   ============================================================ */

import type { CatalogueData } from '@/domain/catalogue/sheet'
import { CASH, ladderOn, priceIn, type LineNoun } from '@/domain/catalogue/priceCommands'
import { isCostColumn, namedLevelsFor } from '@/domain/quote/pricing'
import { mayReachCustomer, workedFromCost, type WorkedFromCost } from '@/domain/pricing/worked'
import { sellColumns } from '@/domain/pricing/unchosen'
import { countBoats } from '@/domain/quote/boats'
import { factoryPackage, lineSaid, spokenBoat } from '@/domain/quote/spoken'
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
  /** the line's own Image Link, or '' */
  image: string
  /** the line is the one on the quote that sent the dealer here */
  onQuote?: boolean
}

/** A column a list's price could read, with what the price list holds in it. */
export interface Candidate {
  fieldId: string
  label: string
  /** lines holding a figure in it, across every list in the column */
  priced: number
  /** the sample line's figure, or null when it holds none */
  figure: number | null
  /** worked from cost, so it would start as Northside's only */
  worked: WorkedFromCost | null
  /** the column the price reads today */
  current: boolean
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
      /** worked from cost, said when the dealer pointed Cash at such a column */
      worked: WorkedFromCost | null
      mayReach: boolean
      /** two columns a customer's quote could print (a motor's Sell Price and its RRP + Freight),
       *  each with its figure on one motor — the owner's to choose, never chosen for him */
      fork: Candidate[] | null
      /** the two columns hold the same figure on every line */
      forkAgrees: boolean
      /** A LIST THE DEALER GAVE A PRICE ON THIS SCREEN keeps the figures it was chosen from, so
       *  the choice can be changed where it was made: the fork, or the sell figures a list that
       *  was Not priced named one of. Null where nothing was ever chosen between. */
      choices: Candidate[] | null
    }
  | {
      state: 'not-priced'
      candidates: Candidate[]
      sample: Sample | null
    }

export type TradeCell =
  | { state: 'falls'; to: string }
  | { state: 'nothing' }
  | {
      state: 'reads'
      label: string
      /** lines with a Cash figure */
      priced: number
      /** of those, the same figure as Cash */
      same: number
      /** of those, no Trade figure — a trade quote stays at Cash on them */
      blank: number
      /** the one share of Cash every other line holds, rounded down as the price list does */
      share: number | null
      /** the lowest and highest share of Cash, whole per cent, where they differ */
      low: number
      high: number
      sample: Sample | null
      cash: number | null
      trade: number | null
    }

export interface WarrantyCell {
  label: string
  priced: number
  low: number
  high: number
  /** lines whose Warranty figure is above their Cash */
  above: number
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
   *  (`countBoats`): Highfield's 588 lines are its 67 boats in their finishes, so its head says
   *  "67 boats" as every other maker's head counts boats, and its lines are named as finishes. Null
   *  where a line is a model. */
  models: number | null
  noun: LineNoun
  cash: CashCell
  trade: TradeCell
  /** Parts' second customer price, chosen line by line */
  fitted: { label: string; priced: number } | null
  warranty: WarrantyCell | null
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

/* WHAT COUNTS AS A SELL FIGURE is the domain's (`sellColumns`, src/domain/pricing/unchosen.ts), so
   the figures Prices offers and the figures the build says exist are one reading */

/** The maker's word for a list: the first word of its name ("Highfield Inflatables" → Highfield). */
const makerOf = (table: EntityDef): string => table.name.split(/\s+/)[0] ?? table.name

/** A line's name as a person reads it — the maker's prefix the price list writes on every line
 *  ("Stacer - 309 Skimma") taken off, since the column already names the maker. */
export function sampleOf(table: EntityDef, row: RowData): Sample {
  return {
    rowId: row.id,
    name: spokenLine(table, rowLabel(table, row)),
    tableId: table.id,
    image: imageOf(table, row),
  }
}

/** A LINE AS A PERSON SAYS IT, by the one namer the build, the cascade and the paper ask
 *  (`src/domain/quote/spoken.ts`), so Prices never prints the file's key where the build says a
 *  name (built-critique-m3-2.md, M13: "Highfield SP560 (HYP) W-W-WB", "Tiller Conversion Kit -
 *  F20G", "SIG 525F w Yamaha - F90XB"). The maker the list already names comes off: Stacer's line
 *  is the "309 Skimma", Highfield's the "Sport 560 · Hypalon · White / White / White/Blue". A
 *  factory package keeps its boat beside the motor it comes with. */
function spokenLine(table: EntityDef, label: string): string {
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
  return lineSaid(bare, table.name)
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

/** Lines holding a figure in a column, by its name, across every list in a column. */
function pricedIn(data: Sheet, tables: readonly EntityDef[], name: string): number {
  let n = 0
  for (const t of tables) {
    const f = t.fields.find((x) => x.name === name)
    if (!f) continue
    for (const r of data.rows[t.id] ?? []) if (priceIn(r, f.id) !== null) n += 1
  }
  return n
}

/* ---------------------------------------------------------- */
/* Cash                                                        */
/* ---------------------------------------------------------- */

/** The motor a customer's quote was matched on to the dollar: Mark McWilliams matched the
 *  original's PDF to Northside's Display Sheet on the Yamaha F90XB at $17,643, its RRP + Freight
 *  Inc GST (HelmLogic tasks/RELEASE_NOTES_v1.32.0.md:26; Motor Library!R82). It is the sample the
 *  motor's two prices are shown on when the list carries it; the figures are read off its line. */
export const MATCHED_ON = 'F90XB'

function forkSample(table: EntityDef, rows: readonly RowData[], a: string, b: string): RowData {
  const code = table.fields.find((f) => f.name === 'Model Code')
  const matched = code ? rows.find((r) => r.values[code.id] === MATCHED_ON) : undefined
  return (
    matched ??
    rows.find((r) => {
      const x = priceIn(r, a)
      const y = priceIn(r, b)
      return x !== null && y !== null && x !== y
    }) ??
    rows.find((r) => priceIn(r, a) !== null) ??
    rows[0]!
  )
}

function cashOf(data: Sheet, tables: readonly EntityDef[]): CashCell {
  const lead = tables[0]!
  const ladders = tables.map((t) => ladderOn(data, t))
  const cash = ladders[0]!.find((l) => l.key === CASH)
  const rows = rowsOf(
    data,
    tables.map((t) => t.id),
  )

  if (!cash) {
    /* NOT PRICED: the candidates every list in the column carries, by name */
    const named = sellColumns(lead).filter((f) =>
      tables.every((t) => t.fields.some((x) => x.name === f.name)),
    )
    const leadRows = data.rows[lead.id] ?? []
    const row =
      leadRows.find((r) => named.every((f) => priceIn(r, f.id) !== null)) ??
      leadRows.find((r) => named.some((f) => priceIn(r, f.id) !== null)) ??
      null
    return {
      state: 'not-priced',
      sample: row ? sampleOf(lead, row) : null,
      candidates: named.map((f) => ({
        fieldId: f.id,
        label: f.name,
        priced: pricedIn(data, tables, f.name),
        figure: row ? priceIn(row, f.id) : null,
        worked: workedFromCost(f),
        current: false,
      })),
    }
  }

  let priced = 0
  for (const t of tables) {
    const rung = ladderOn(data, t).find((l) => l.key === CASH)
    if (!rung) continue
    for (const r of data.rows[t.id] ?? []) if (priceIn(r, rung.fieldId) !== null) priced += 1
  }
  const field = lead.fields.find((f) => f.id === cash.fieldId)

  /* THE FORK: a list carrying a column worked from cost beside the one Cash reads — the motor's
     RRP + Freight beside its Sell Price — shows both, and the owner chooses */
  const ladder = ladders[0]!
  const worked = lead.fields.find(
    (f) =>
      workedFromCost(f) !== null &&
      (f.type === 'number' || f.type === 'formula') &&
      /* Warranty is a price of its own on the boat lists, not a second Cash */
      !ladder.some((l) => l.fieldId === f.id && l.key !== CASH),
  )
  const plainId = namedLevelsFor(lead).find((l) => l.key === CASH)?.fieldId
  const plain = lead.fields.find((f) => f.id === plainId)
  let fork: Candidate[] | null = null
  let forkAgrees = false
  let sampleRow: RowData | undefined = rows.find((r) => priceIn(r, cash.fieldId) !== null)
  if (tables.length === 1 && worked && plain && worked.id !== plain.id) {
    const leadRows = data.rows[lead.id] ?? []
    sampleRow = forkSample(lead, leadRows, plain.id, worked.id)
    forkAgrees = leadRows.every((r) => priceIn(r, plain.id) === priceIn(r, worked.id))
    fork = [plain, worked].map((f) => ({
      fieldId: f.id,
      label: f.name,
      priced: pricedIn(data, tables, f.name),
      figure: sampleRow ? priceIn(sampleRow, f.id) : null,
      worked: workedFromCost(f),
      current: f.id === cash.fieldId,
    }))
  }

  /* THE FIGURES A NAMED LIST WAS CHOSEN FROM, offered again where the choice was made */
  let choices: Candidate[] | null = fork && !forkAgrees ? fork : null
  if (!choices && cash.named === true) {
    const named = sellColumns(lead).filter((f) =>
      tables.every((t) => t.fields.some((x) => x.name === f.name)),
    )
    if (named.length > 1) {
      const leadRows = data.rows[lead.id] ?? []
      const row =
        leadRows.find((r) => named.every((f) => priceIn(r, f.id) !== null)) ??
        leadRows.find((r) => named.some((f) => priceIn(r, f.id) !== null))
      if (row) sampleRow = row
      choices = named.map((f) => ({
        fieldId: f.id,
        label: f.name,
        priced: pricedIn(data, tables, f.name),
        figure: row ? priceIn(row, f.id) : null,
        worked: workedFromCost(f),
        current: f.name === cash.label,
      }))
    }
  }

  const sampleTable = sampleRow ? (tables.find((t) => t.id === sampleRow.entityId) ?? lead) : lead
  return {
    state: 'reads',
    label: cash.label,
    priced,
    none: rows.length - priced,
    sample: sampleRow ? sampleOf(sampleTable, sampleRow) : null,
    figure: sampleRow ? priceIn(sampleRow, cash.fieldId) : null,
    named: cash.named === true,
    worked: field ? workedFromCost(field) : null,
    mayReach: mayReachCustomer(lead, cash),
    fork,
    forkAgrees,
    choices,
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

function tradeOf(data: Sheet, tables: readonly EntityDef[], cash: CashCell): TradeCell {
  if (cash.state !== 'reads') return { state: 'falls', to: 'Not priced' }
  if (cash.priced === 0) return { state: 'nothing' }
  const lead = tables[0]!
  const ladder = ladderOn(data, lead)
  const c = ladder.find((l) => l.key === CASH)!
  const t = ladder.find((l) => l.key === 'trade')
  if (!t || tables.length > 1) return { state: 'falls', to: c.label }

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
  let priced = 0
  let above = 0
  let low = Infinity
  let high = -Infinity
  let widest: WarrantyCell['widest'] = null
  for (const r of data.rows[table.id] ?? []) {
    const cv = priceIn(r, c.fieldId)
    const wv = priceIn(r, w.fieldId)
    if (cv === null || wv === null) continue
    priced += 1
    if (wv > cv) above += 1
    const pc = (wv / cv) * 100
    low = Math.min(low, pc)
    high = Math.max(high, pc)
    if (!widest || cv - wv > widest.cash - widest.warranty)
      widest = { sample: sampleOf(table, r), cash: cv, warranty: wv }
  }
  return {
    label: w.label,
    priced,
    low: Number.isFinite(low) ? Math.round(low) : 0,
    high: Number.isFinite(high) ? Math.round(high) : 0,
    above,
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
    : `none:${sellColumns(t)
        .map((f) => f.name)
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
      if (isCostColumn(t, f) && f.type === 'number' && workedFromCost(f) === null) {
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
        }
      : null,
    warranty: shelf === 'boats' ? warrantyOf(data, lead) : null,
    costs: [...costs],
    costField,
    quiet: {
      cash:
        cash.state === 'reads' &&
        cash.none === 0 &&
        cash.fork === null &&
        cash.worked === null &&
        cash.mayReach,
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
export function readLadder(data: Sheet): Column[] {
  const byShelf = new Map<Shelf, EntityDef[][]>()
  /* THE PRICE LIST'S OWN ORDER: the file lays its lists out in reading order, and each list's
     place is where it was laid (`position`), so reading it back by row then column is that order */
  const ordered = Object.values(data.tables).toSorted(
    (a, b) => a.position.y - b.position.y || a.position.x - b.position.x,
  )
  for (const table of ordered) {
    if (table.role === 'join') continue
    /* A LIST NO LONGER SOLD IS NOT ON THE LADDER (built-critique-m3.md, major 11: Prices counted
       "444 trailers" where Rules and Fitment count the 434 on sale). The obsolete trailers are
       history the price list keeps so an old quote still opens; nothing is priced from them
       again, so there is nothing about their price to decide here. */
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

   Three groups, and every list stands in exactly one place:

   YOURS TO CHOOSE — a question only Northside can answer: a motor's
   two figures nobody has chosen between, or a list with sell figures
   and no price. In the order of how many lines each answer prices.

   WORKED FROM COST — a price the price list works from what something
   cost Northside (Warranty on every boat; a motor's RRP + Freight once
   it is chosen), with the one switch that says whether it may reach a
   customer.

   SETTLED BY YOUR PRICE LIST — everything else, in the price list's
   own order, each with the one fact that says how it prices.
   ============================================================ */

/** A question only the dealer can answer is still open on this list. */
export function undecided(col: Column): boolean {
  const c = col.cash
  if (c.state === 'not-priced') return true
  return c.fork !== null && !c.forkAgrees && !c.named
}

/** THE LINE WARRANTY IS READ ON: the Highfield SP560 (HYP) W-W-WB, model code HBS114 (Boat
 *  Module!R837), the line the customer's-paper analysis measured Warranty on — $32,166 against
 *  Cash $48,350 (docs/research/proposal/analysis.md §4; the formula,
 *  docs/reference/MPF_GROUND_TRUTH.md line 885). The figures are read off its line, never
 *  typed; a price list without it reads Warranty on the widest gap instead. */
export const WARRANTY_READ_ON = 'HBS114'

/** One line a price worked from cost is read on: the line, its figure, and the one it stands
 *  against. */
export interface KeptSpecimen {
  sample: Sample
  /** the maker, in one word */
  maker: string
  figure: number
  against: number
  againstLabel: string
}

/** A PRICE WORKED FROM COST, and its one switch. */
export interface Kept {
  /** where its step is said: 'warranty', or the list's id with '#reach' */
  id: string
  label: string
  /** what it is on, in a few words: "every boat, from 7 makers" */
  on: string
  targets: Array<{ tableId: string; key: string }>
  mayReach: boolean
  worked: WorkedFromCost
  specimen: KeptSpecimen | null
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
  /* the widest gap, where the price list carries no SP560 (HYP) */
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

/** The page: what is the dealer's to choose, what is worked from cost, what is settled. */
export function readDesk(data: Sheet, columns: readonly Column[]): Desk {
  const choose = columns
    .filter(undecided)
    .toSorted((a, b) => b.lines - a.lines || a.name.localeCompare(b.name))
  const settled = columns.filter((c) => !undecided(c))
  const kept: Kept[] = []

  const boats = columns.filter((c) => c.warranty !== null)
  const label = boats[0]?.warranty?.label
  const worked = label ? workedFromCost({ name: label }) : null
  if (label && worked) {
    kept.push({
      id: 'warranty',
      label,
      on: `every boat, from ${boats.length} ${boats.length === 1 ? 'maker' : 'makers'}`,
      targets: warrantyTargets(boats),
      mayReach: boats.some((c) => c.warranty?.mayReach === true),
      worked,
      specimen: warrantySpecimen(data, boats),
      whileOff: `While it is off, a quote with a line at ${label} cannot be given.`,
    })
  }

  /* A MOTOR'S PRICE THE DEALER POINTED AT A FIGURE WORKED FROM COST */
  for (const col of settled) {
    const c = col.cash
    if (c.state !== 'reads' || !c.named || !c.worked) continue
    const other = c.choices?.find((k) => !k.current && k.figure !== null)
    const table = data.tables[col.tableIds[0]!]
    kept.push({
      id: `${col.id}#reach`,
      label: c.label,
      on: `every ${col.noun.one}`,
      targets: col.tableIds.map((tableId) => ({ tableId, key: CASH })),
      mayReach: c.mayReach,
      worked: c.worked,
      specimen:
        c.sample && table && c.figure !== null && other && other.figure !== null
          ? {
              sample: c.sample,
              maker: makerOf(table),
              figure: c.figure,
              against: other.figure,
              againstLabel: other.label,
            }
          : null,
      whileOff: `While it is off, a quote with a ${col.noun.one} on it cannot be given.`,
    })
  }
  return { choose, kept, settled }
}

/** THE QUESTION an undecided list asks, in the dealer's words. */
export function questionOf(col: Column): string {
  if (col.cash.state === 'not-priced')
    /* what a quote does until it is chosen, as the build says it (built-critique-m3.md, blocker
       1): "Not priced" was a word no other screen printed, and the build now refuses to give a
       quote with such a line until it is priced */
    return `Which figure is a ${col.noun.one}’s price? Until you choose, each one on a quote is priced by hand.`
  /* WHAT A QUOTE SHOWS TODAY, said with the question (built-critique-m3-2.md, minor: the Yamaha
     line asked which figure without saying which one a quote prints until it is answered) */
  return `Which figure does a customer’s quote show? Today it shows ${col.cash.label}.`
}

/** THE SAME LIST READ ON THE LINE THE DEALER CAME FROM — the line on the quote that sent him
 *  here (built-critique-m3-2.md, major 2): Prices from the Classic 340's finale showed a VHF
 *  Radio's figures while the quote carried the Tube Covers. The line's name and its own figures
 *  stand where any line of the list stood, so the choice is made on what the customer is looking
 *  at. The list is returned as it was when the line is not on it. */
export function onLine(data: Sheet, col: Column, tableId: string, rowId: string): Column {
  if (!col.tableIds.includes(tableId)) return col
  const table = data.tables[tableId]
  const row = data.rows[tableId]?.find((r) => r.id === rowId)
  if (!table || !row) return col
  const sample: Sample = { ...sampleOf(table, row), onQuote: true }
  const figureOf = (label: string): number | null => {
    const field = table.fields.find((f) => f.name === label)
    return field ? priceIn(row, field.id) : null
  }
  const again = (cs: Candidate[]): Candidate[] =>
    cs.map((k) => ({ ...k, figure: figureOf(k.label) }))
  const c = col.cash
  if (c.state === 'not-priced')
    return { ...col, cash: { ...c, sample, candidates: again(c.candidates) } }
  const cashField = ladderOn(data, table).find((l) => l.key === CASH)?.fieldId
  return {
    ...col,
    cash: {
      ...c,
      sample,
      figure: cashField ? priceIn(row, cashField) : null,
      fork: c.fork ? again(c.fork) : null,
      choices: c.choices ? again(c.choices) : null,
    },
  }
}

const count = (value: number): string => new Intl.NumberFormat('en-AU').format(value)

/** A name's trailing note taken off: "Sell inc Install (if appl.)" → "Sell inc Install". */
const plainName = (label: string): string => label.replace(/\s*\([^)]*\)\s*$/, '')

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
