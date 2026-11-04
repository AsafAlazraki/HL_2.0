/* ============================================================
   WHAT THE SHELF COUNTS — Northside's own work, kind by kind, read off
   the stores and never typed. Pure, so a node suite holds every figure
   the inventory prints to the stores it was read from.

   THE SIX KINDS a copy carries, in the order a manager fears losing
   them (docs/directions/shelf-boards/d-the-safe.html): the quotes, the
   customers, the rules Northside wrote, its settings, the pictures it
   chose, and the price list as it stands on this computer.
   ============================================================ */
import type {
  CatalogueCtx,
  CellValue,
  ConstraintDef,
  DiscoveredRule,
  EntityDef,
  ModuleDef,
  OrgProfile,
  PriceLevel,
  QuoteDef,
  RowData,
} from '@/domain/model'
import { CUSTOMER_TABLE_ID } from '@/domain/people/customers'
import { countCustomers } from '@/domain/people/book'
import { lineSaid, nameFirst, spokenBoat } from '@/domain/quote/spoken'
import type { CatalogueData } from '@/domain/catalogue/sheet'

export interface Inventory {
  quotes: number
  /** of those, the ones given to a customer */
  given: number
  /** EVERY CUSTOMER, AS THE PILL AND CUSTOMERS COUNT THEM: the people kept on Customers and
   *  every name a quote carries (`countCustomers`). The shelf said "Customers 0 · none yet"
   *  under a pill that said 1, because it counted the kept ones only (built-critique-m4.md,
   *  major 5). One figure for one fact, on every screen. */
  customers: number
  /** of those, the ones kept on Customers — what a copy brought back replaces; a name on a
   *  quote stays with its quote */
  kept: number
  rules: number
  /** details set on Settings, the trading name among them */
  details: number
  people: number
  /** whether a look was chosen on Settings */
  look: boolean
  /** marks and photographs chosen on a place's own page and on Settings */
  pictures: number
  /** places with a picture or a mark chosen */
  placesDressed: number
  lists: number
  lines: number
}

const DETAILS = [
  'name',
  'legalName',
  'abn',
  'address',
  'phone',
  'email',
  'website',
  'gstRate',
  'validDays',
  'deposit',
  'quoteTerms',
] as const

/** How many of Northside's details are set: the trading name is one of them. */
export function detailsSet(org: OrgProfile | undefined): number {
  if (!org) return 0
  let n = 0
  for (const key of DETAILS) {
    const v = org[key]
    if (typeof v === 'number' || (typeof v === 'string' && v.trim() !== '')) n += 1
  }
  return n
}

/** Pictures Northside chose: a place's photograph or its own mark, and the marks on Settings. */
export function picturesChosen(
  modules: Readonly<Record<string, ModuleDef>>,
  org: OrgProfile | undefined,
): { pictures: number; places: number } {
  let pictures = 0
  let places = 0
  for (const m of Object.values(modules)) {
    for (const dress of Object.values(m.dress ?? {})) {
      let here = 0
      if (dress.hero && dress.hero.from !== 'none') here += 1
      if (dress.mark && dress.mark.from === 'own') here += 1
      if (here > 0) places += 1
      pictures += here
    }
  }
  if (org?.marks?.paper) pictures += 1
  if (org?.marks?.water) pictures += 1
  if (org?.look?.door?.picture) pictures += 1
  if (org?.look?.hero?.picture) pictures += 1
  return { pictures, places }
}

export function inventoryOf(
  data: Pick<CatalogueData, 'tables' | 'rows' | 'modules' | 'constraintDefs'> & {
    org?: OrgProfile | undefined
  },
  quotes: readonly QuoteDef[],
): Inventory {
  let lists = 0
  let lines = 0
  for (const id of Object.keys(data.tables)) {
    if (id === CUSTOMER_TABLE_ID) continue
    lists += 1
    lines += data.rows[id]?.length ?? 0
  }
  const chosen = picturesChosen(data.modules, data.org)
  const kept = data.rows[CUSTOMER_TABLE_ID] ?? []
  return {
    quotes: quotes.length,
    given: quotes.filter((q) => q.state !== 'draft').length,
    customers: countCustomers(data.tables[CUSTOMER_TABLE_ID], kept, quotes),
    kept: kept.length,
    rules: data.constraintDefs.length,
    details: detailsSet(data.org),
    people: data.org?.people?.length ?? 0,
    look: Boolean(data.org?.look && Object.keys(data.org.look).length > 0),
    pictures: chosen.pictures,
    placesDressed: chosen.places,
    lists,
    lines,
  }
}

/** What a copy holds, counted the same way, read off the copy itself. */
export function inventoryOfCopy(copy: {
  entities: readonly EntityDef[]
  rows?: Readonly<Record<string, readonly RowData[]>>
  modules?: readonly ModuleDef[]
  constraints?: readonly ConstraintDef[]
  org?: OrgProfile
  quotes?: readonly QuoteDef[]
}): Inventory {
  const tables: Record<string, EntityDef> = {}
  for (const e of copy.entities) tables[e.id] = e
  const modules: Record<string, ModuleDef> = {}
  for (const m of copy.modules ?? []) modules[m.id] = m
  return inventoryOf(
    {
      tables,
      rows: (copy.rows ?? {}) as Record<string, RowData[]>,
      modules,
      constraintDefs: [...(copy.constraints ?? [])],
      org: copy.org,
    },
    copy.quotes ?? [],
  )
}

/* ------------------------------------------------------------ */
/* the copy's own name                                           */
/* ------------------------------------------------------------ */

/** `Northside Marine copy 2026-10-30 0941.json` — the business, the word, the day and the minute. */
const pad = (n: number): string => String(n).padStart(2, '0')

export function copyFileName(business: string, at: Date): string {
  const day = `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`
  const time = `${pad(at.getHours())}${pad(at.getMinutes())}`
  const who = business.replace(/[\\/:*?"<>|]+/g, ' ').trim() || 'Northside Marine'
  return `${who} copy ${day} ${time}.json`
}

/* ------------------------------------------------------------ */
/* what clearing the price list keeps                            */
/* ------------------------------------------------------------ */

/** Northside's own work, which a clear of the price list puts back over the list as it came. */
export interface KeptThroughAClear {
  customers: { table: EntityDef; rows: RowData[] } | null
  constraintDefs: ConstraintDef[]
  discoveredRules: DiscoveredRule[]
  /** the places with what Northside set on them */
  modules: ModuleDef[]
  /** the prices Northside decided on Prices, per list */
  priceLevels: Record<string, PriceLevel[]>
}

/**
 * WHAT STAYS WHEN THE PRICE LIST IS CLEARED. The price list's own lines go back to the Master
 * Price File as it came with the app; what Northside made on top of it does not go with them:
 * its customers (a list of its own, beside the price list), the rules it wrote, the places as
 * it dressed them, and the prices it decided. Quotes and settings are kept elsewhere and are
 * never touched by a clear at all.
 */
export function keptThroughAClear(
  data: Pick<
    CatalogueData,
    'tables' | 'rows' | 'constraintDefs' | 'discoveredRules' | 'modules' | 'priceLevels'
  >,
): KeptThroughAClear {
  const table = data.tables[CUSTOMER_TABLE_ID]
  return {
    customers: table ? { table, rows: [...(data.rows[CUSTOMER_TABLE_ID] ?? [])] } : null,
    constraintDefs: [...data.constraintDefs],
    discoveredRules: [...data.discoveredRules],
    modules: Object.values(data.modules),
    priceLevels: { ...data.priceLevels },
  }
}

/* ------------------------------------------------------------ */
/* forgetting everything, only once a copy is saved              */
/* ------------------------------------------------------------ */

/** Whether this computer holds anything of Northside's own that only a copy could bring back. */
export const hasOwnWork = (n: Inventory): boolean =>
  n.quotes + n.customers + n.rules + n.pictures > 0

/**
 * WHY EVERYTHING MAY NOT BE FORGOTTEN YET, or null. Forgetting everything with no copy ever saved
 * took every quote with it, guarded only by a sentence that said "save a copy first" and then let
 * the press through (built-critique-m4.md, major 9). It is refused until a copy has been saved on
 * this computer — the sentence's own advice, and the amber act beside it.
 *
 * ON EVERY COMPUTER, DAY ONE TOO (the shelf's verify-2.md, gap 1). A computer with no quote,
 * customer or rule was let through with no copy, under a page that still offered "Save a copy
 * first": but a price typed on the sheet, a workbook applied or a detail set on Settings is
 * Northside's work as well, and none of it is counted here. One rule, said once: no copy, no
 * forgetting.
 */
export function forgetRefusal(copySaved: boolean): string | null {
  if (copySaved) return null
  return 'Save a copy first: none has been saved from this computer, so nothing done on it could come back.'
}

/**
 * WHAT FORGETTING TAKES OF NORTHSIDE'S OWN, WITHOUT ITS NOUGHTS: "1 quote (1 given), 2 customers
 * and 3 rules Northside wrote", or null with none of any. The rest page's card read "0 quotes, 0
 * customers" where its own page did not (verify-2.md, gap 7): both say it from here.
 */
export function forgetOwnSaid(
  n: Pick<Inventory, 'quotes' | 'given' | 'customers' | 'rules'>,
): string | null {
  const said = [
    n.quotes > 0
      ? `${plural(n.quotes, 'quote', 'quotes')}${n.given > 0 ? ` (${count(n.given)} given)` : ''}`
      : null,
    n.customers > 0 ? plural(n.customers, 'customer', 'customers') : null,
    n.rules > 0 ? plural(n.rules, 'rule Northside wrote', 'rules Northside wrote') : null,
  ].filter((x): x is string => x !== null)
  return said.length === 0 ? null : listSaid(said)
}

/**
 * A FIGURE KEPT WITH ITS UNIT. A name wrapping in its column broke "1.8 m Aerial" into "1.8 / m
 * Aerial" (verify-2.md, gap 10): the space between a figure and the unit after it is one that
 * does not break.
 */
export function keepUnits(name: string): string {
  return name.replace(
    /(\d)\s+(mm|cm|m|km|kg|g|lb|lbs|hp|kw|kW|l|L|ltr|litre|litres|ft|in|V|v|A|Ah|W|mtr|Mtr|knots?)\b/g,
    '$1 $2',
  )
}

/* ------------------------------------------------------------ */
/* a line of the workbook, as a person says it                   */
/* ------------------------------------------------------------ */

/**
 * A LINE OF A WORKBOOK, NAMED THE WAY EVERY OTHER SCREEN NAMES IT. The change sheet printed the
 * workbook's own cell — "Stacer - 509 Assault Pro (Tournament)" — which undid the earlier
 * round's one change (docs/DECISIONS.md, 2026-09-24; built-critique-m4.md, major 4). A boat is
 * `spokenBoat`'s ("Stacer 509 Assault Pro · Tournament"); anything else is said as the build
 * says a line (`lineSaid`, then `nameFirst`). Under its own list's head, whose name already
 * says the maker, the maker is not said again: "509 Assault Pro · Tournament" under "Stacer".
 * The workbook's own cell stays beside it for the person who opens the workbook in Excel.
 */
export function lineName(
  raw: string,
  list: { tableId: string; name: string; kind?: EntityDef['kind'] | undefined },
  underItsList: boolean,
): string {
  const cell = raw.replace(/\s+/g, ' ').trim()
  if (cell === '') return cell
  if (list.kind === 'boat') {
    const boat = spokenBoat(list.tableId, cell)
    if (underItsList && boat.maker !== '' && boat.say.startsWith(`${boat.maker} `)) {
      const sameMaker = list.name.toLowerCase().startsWith(boat.maker.toLowerCase())
      if (sameMaker) return boat.say.slice(boat.maker.length + 1)
    }
    return boat.say
  }
  return nameFirst(lineSaid(cell, list.name))
}

/* ------------------------------------------------------------ */
/* the figures, as they are said                                 */
/* ------------------------------------------------------------ */

const whole = new Intl.NumberFormat('en-AU')
const wholeMoney = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0,
})
const centsMoney = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const count = (n: number): string => whole.format(n)

/** A price as the dealer reads it: $1,540, $242.10 — whole dollars bare, cents always two
 *  (the judge's "$242.1": one formatter with no least number of places dropped the nought). */
export function dollars(n: number): string {
  const cents = Math.round(n * 100) / 100
  return (Number.isInteger(cents) ? wholeMoney : centsMoney).format(cents)
}

const ratio = new Intl.NumberFormat('en-AU', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
const plainNumber = new Intl.NumberFormat('en-AU', { maximumFractionDigits: 2 })

/** A figure of a line as its kind is read: money in dollars, a proportion to three places, any
 *  other number as it is, words as they are, and nothing as an em rule. */
export function figureSaid(v: CellValue, as: 'money' | 'ratio' | 'plain'): string {
  if (v === null || v === '' || Array.isArray(v)) return '—'
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) return '—'
    return as === 'money' ? dollars(v) : as === 'ratio' ? ratio.format(v) : plainNumber.format(v)
  }
  return v.replace(/\s+/g, ' ').trim()
}

/** The places a kind is read to, and the most a move is ever followed to. */
const PLACES = { money: 2, ratio: 3, plain: 2 } as const
const DEEPEST = 6

function atPlaces(v: number, as: 'money' | 'ratio' | 'plain', places: number): string {
  return new Intl.NumberFormat('en-AU', {
    ...(as === 'money' ? { style: 'currency' as const, currency: 'AUD' } : {}),
    minimumFractionDigits: as === 'plain' ? 0 : PLACES[as],
    maximumFractionDigits: places,
  }).format(v)
}

/**
 * A FIGURE THAT MOVED, BOTH SIDES OF THE ARROW, AT THE PRECISION THAT MOVED. The sheet printed
 * "$479.20 → $479.20" on a Dealer Fit line where the price list carried 479.204 and the
 * workbook 479.2 (verify-1.md, gap 1): the two read alike at cents. Where the usual places say
 * the same, both sides are read one place further until they differ, as far as six; "$479.204 →
 * $479.20", "$8.41 → $8.415". A figure that moves by less than that is not a change at all
 * (`movesNothing`, src/domain/io/noise.ts) and never reaches here.
 */
export function movedSaid(
  from: CellValue,
  to: CellValue,
  as: 'money' | 'ratio' | 'plain',
): { from: string; to: string } {
  const was = figureSaid(from, as)
  const now = figureSaid(to, as)
  if (was !== now || typeof from !== 'number' || typeof to !== 'number')
    return { from: was, to: now }
  if (!Number.isFinite(from) || !Number.isFinite(to)) return { from: was, to: now }
  for (let places = PLACES[as] + 1; places <= DEEPEST; places += 1) {
    const a = atPlaces(from, as, places)
    const b = atPlaces(to, as, places)
    if (a !== b) return { from: a, to: b }
  }
  return { from: was, to: now }
}

/** A move as a share of where it was: "+6%", "−97%"; null where it cannot be said. */
export function shareMoved(from: CellValue, to: CellValue): string | null {
  if (typeof from !== 'number' || typeof to !== 'number' || from === 0 || from === to) return null
  const pct = Math.round(((to - from) / Math.abs(from)) * 100)
  if (pct === 0) return to > from ? '+<1%' : '−<1%'
  return `${pct > 0 ? '+' : '−'}${Math.abs(pct).toLocaleString('en-AU')}%`
}

export const plural = (n: number, one: string, many: string): string =>
  `${count(n)} ${n === 1 ? one : many}`

/** A list said as a person says it: "a", "a and b", "a, b and c". */
export function listSaid(words: readonly string[]): string {
  if (words.length <= 1) return words[0] ?? ''
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`
}

/**
 * NORTHSIDE'S OWN WORK, SAID WITHOUT ITS NOUGHTS: "1 quote and 2 customers". The clear page read
 * "0 quotes… 0 customers, 0 rules Northside wrote" (verify-1.md, gap 9): a kind with none is
 * left out of the sentence, and with none of any, null, so the sentence that holds it says so.
 */
export function kindsSaid(n: Pick<Inventory, 'quotes' | 'customers' | 'rules'>): string | null {
  const said = [
    n.quotes > 0 ? plural(n.quotes, 'quote', 'quotes') : null,
    n.customers > 0 ? plural(n.customers, 'customer', 'customers') : null,
    n.rules > 0 ? plural(n.rules, 'rule Northside wrote', 'rules Northside wrote') : null,
  ].filter((x): x is string => x !== null)
  return said.length === 0 ? null : listSaid(said)
}

/** A copy's own day, said: "today at 9:41", "29 October at 16:02". */
export function whenSaid(iso: string, now: Date): string {
  const at = new Date(iso)
  if (Number.isNaN(at.getTime())) return ''
  const time = at.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })
  const sameDay = at.toDateString() === now.toDateString()
  if (sameDay) return `today at ${time}`
  const day = at.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
  return `${day} at ${time}`
}

/** The world a copy is written from: the sheet, its settings and every quote. */
export type CopyWorld = CatalogueCtx
