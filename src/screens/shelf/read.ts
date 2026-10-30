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
 * this computer — the sentence's own advice, and the amber act beside it. A computer that holds
 * nothing of Northside's own but the price list as it came has nothing a copy would keep.
 */
export function forgetRefusal(here: Inventory, copySaved: boolean): string | null {
  if (copySaved || !hasOwnWork(here)) return null
  return 'Save a copy first: none has been saved on this computer, so nothing of this could come back.'
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
const money = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
})

export const count = (n: number): string => whole.format(n)

/** A price as the dealer reads it: $1,540, $242.10. */
export function dollars(n: number): string {
  return money.format(Math.round(n * 100) / 100)
}

export const plural = (n: number, one: string, many: string): string =>
  `${count(n)} ${n === 1 ? one : many}`

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
