/* ============================================================
   WHAT THE FILE ACTUALLY HOLDS — every figure this screen prints,
   counted off the sheet that loaded.

   NOT ONE NUMBER HERE IS TYPED. The manifest carries a header saying
   53 tables and 15,691 rows, and the store carries the tables and the
   rows themselves; when the two disagree the store is right and the
   header is a hope. So everything below walks what arrived. A table
   that failed to load makes a figure smaller, which is the point.

   BOATS ARE COUNTED AS A PERSON COUNTS THEM (2026-09-24). The file
   counts ROWS: a row is a hull in one variant at one price, and seven
   of them are one Highfield ADV7. This panel printed "810 BOATS" — the
   rows — beside a picker that says "289 models from 7 makers", and
   explained under it that the figure was not boats
   (built-critique-m2-close-2.md, major 1). A person asked how many
   boats Northside sells means models, so the boat figure is
   `countBoats` (src/domain/quote/boats.ts), the one derivation every
   screen that counts boats asks — the picker's models are its boats —
   and the rows stay on the shelf's own line for the one who wants them.
   Nothing is invented: a model is the file's own grouping.

   A KIND IS LABELLED BY THE DEALER'S OWN PLACES, not by the word the
   model uses for it. `TableKind` is a type in the contract — 'custom'
   is the absence of a kind rather than a thing anybody sells — while
   the nine places minted when the file lands are named in the
   dealership's own words: Labour Rates, Oils & Consumables,
   Registration Costs. So a kind's label is the names of the places
   that hold it.

   IT COUNTS THE FILE, NOT THE SHEET (the critique of Milestone 2's
   close, blocker 2). The customers book is a table on the sheet, of no
   kind and in no place, and this module used to walk every table on
   the sheet: filing M. Duffy printed "65 Labour Rates · Oils &
   Consumables · Registration Costs" where the file carries 64, and a
   masthead of 54 tables and 15,692 rows — counted into the figure,
   named by nobody. So the first thing done below is to set the desk's
   own tables aside by the one rule every screen that counts the file
   now shares (`domain/catalogue/priceFile.ts`), and every figure is
   walked out of what is left. That also means every register a kind
   counts is in a place, so a kind's label always names every register
   behind its figure: the fallback that printed a figure with nobody's
   name on it cannot be reached.
   ============================================================ */
import { rowsOfModel } from '@/domain/catalogue/depicts'
import { countBoats } from '@/domain/quote/boats'
import { priceFileOf } from '@/domain/catalogue/priceFile'
import {
  TABLE_KINDS,
  type EntityDef,
  type ModuleDef,
  type RowData,
  type TableKind,
} from '@/domain/model'

/** One register: a table of the file, with what it holds counted. */
export interface Register {
  id: string
  name: string
  rows: number
  /** the boats a person counts in it — its models (`countBoats`) on a
   *  boat register; its rows on any other, where a line is one thing */
  boats: number
}

/** One sort of thing the business sells, with the places that hold it. */
export interface KindHolding {
  kind: TableKind
  /** what the panel calls it — see `labelFor` */
  label: string
  /** the places that hold it, named as the dealership names them */
  places: string[]
  rows: number
  /** WHAT THE PANEL PRINTS for it: boats as a person counts them (models)
   *  for the boats, lines of the file for every other kind */
  figure: number
  registers: Register[]
}

export interface Holdings {
  /** every table the price file brought, joins and retired ones
   *  included — never a table made at this desk */
  tables: number
  /** every row in those */
  rows: number
  /** tables that record what fits what */
  joins: number
  /** rows inside those */
  joinRows: number
  /** the rest: the things the business sells */
  baseRows: number
  baseTables: number
  /** the sorts of thing, in the order the panel reads them, with
   *  nothing that has no register in this file */
  kinds: KindHolding[]
  /** the boat registers, one per maker */
  boats: Register[]
}

/**
 * The order the six figures read across the desk. It is stated rather
 * than derived because it is a reading order — what the business sells
 * first, then what goes on it — and a sheet whose kinds arrived in a
 * different order should still read the same way. A kind with no
 * register in this file is not drawn: a zero nobody can act on is
 * noise.
 */
const KIND_ORDER: readonly TableKind[] = [
  'boat',
  'motor',
  'trailer',
  'package',
  'accessory',
  'dealer',
  'custom',
]

const countOf = (rows: Readonly<Record<string, readonly RowData[]>>, id: string): number =>
  rows[id]?.length ?? 0

/**
 * THE ORDER A SHELF OF REGISTERS READS, stated here for the same reason
 * KIND_ORDER above is stated: otherwise it is decided by the storage
 * engine. Measured 2026-09-17 on the built screen — the seven makers
 * arrived in the file's own order on a first visit and alphabetically
 * out of IndexedDB on every visit after, so the composition of the
 * brightest object on Home changed between the first open and the
 * second while no figure changed.
 *
 * The order is the biggest register first, because that is a fact about
 * the file rather than about the browser: the maker a dealership holds
 * the most rows of leads the shelf. Two registers of equal size fall
 * back to their names, so the order is total and a re-pack cannot
 * shuffle it.
 */
const inReadingOrder = (registers: Register[]): Register[] =>
  registers.toSorted((a, b) => b.rows - a.rows || a.name.localeCompare(b.name, 'en-AU'))

/** The places that hold at least one table of this kind, in the order
 *  they were minted, named as the dealership names them. */
function placesHolding(
  kind: TableKind,
  tables: Readonly<Record<string, EntityDef>>,
  modules: Readonly<Record<string, ModuleDef>>,
): string[] {
  return Object.values(modules)
    .toSorted((a, b) => a.order - b.order)
    .filter((place) => place.tableIds.some((id) => tables[id]?.kind === kind))
    .map((place) => place.name)
}

/**
 * WHAT THE PANEL CALLS ONE SORT OF THING.
 *
 * Where exactly one place holds a kind, the panel uses that place's
 * name, because that is the dealership's own word for exactly this set
 * — "Parts & Accessories", not "Accessories". Where several do, the
 * kind's own noun covers them all, and the places are a level down.
 *
 * `custom` is the exception and has to be: it is not a kind, it is the
 * absence of one, and the contract calls it "Custom table" — a word
 * from the model, which is the kind of word tools/check.ts refuses on
 * a rendered surface. Those registers are named instead, by the
 * dealership: Labour Rates, Oils & Consumables, Registration Costs.
 * Every register counted here is in a place (see the header), so the
 * places ARE the registers behind the figure, every one of them named;
 * there is no fallback to the contract's word, which was the path a
 * figure took when it counted a register the label did not name.
 */
function labelFor(kind: TableKind, places: string[]): string {
  if (places.length === 1) return places[0] ?? ''
  if (kind === 'custom') return places.join(' · ')
  return TABLE_KINDS[kind].label
}

/**
 * What the price file holds, walked out of the sheet that loaded.
 * `modules` are the places the file landed with; a sheet handed none
 * shows no file, and counts nothing (`priceFileOf`).
 */
export function holdingsOf(
  sheet: Readonly<Record<string, EntityDef>>,
  rows: Readonly<Record<string, readonly RowData[]>>,
  modules: Readonly<Record<string, ModuleDef>> = {},
): Holdings {
  const tables = priceFileOf(sheet, modules).tables
  const all = Object.values(tables)
  const base = all.filter((t) => t.role !== 'join')
  const joins = all.filter((t) => t.role === 'join')

  const boatCount = countBoats(
    base.filter((t) => t.kind === 'boat'),
    rows,
  )
  const boatsIn = (t: EntityDef): number =>
    t.kind === 'boat'
      ? (boatCount.byMaker.find((m) => m.id === t.id)?.boats ?? 0)
      : countOf(rows, t.id)
  const registersOf = (kind: TableKind): Register[] =>
    inReadingOrder(
      base
        .filter((t) => t.kind === kind)
        .map((t) => ({ id: t.id, name: t.name, rows: countOf(rows, t.id), boats: boatsIn(t) })),
    )

  const kinds: KindHolding[] = []
  for (const kind of KIND_ORDER) {
    const registers = registersOf(kind)
    if (registers.length === 0) continue
    const places = placesHolding(kind, tables, modules)
    kinds.push({
      kind,
      label: labelFor(kind, places),
      places,
      rows: registers.reduce((n, r) => n + r.rows, 0),
      figure: kind === 'boat' ? boatCount.boats : registers.reduce((n, r) => n + r.rows, 0),
      registers,
    })
  }

  const rowsIn = (list: readonly EntityDef[]): number =>
    list.reduce((n, t) => n + countOf(rows, t.id), 0)

  return {
    tables: all.length,
    rows: rowsIn(all),
    joins: joins.length,
    joinRows: rowsIn(joins),
    baseRows: rowsIn(base),
    baseTables: base.length,
    kinds,
    boats: registersOf('boat'),
  }
}

/**
 * HOW MANY ROWS OF A REGISTER ARE ONE MODEL — the fact the two
 * photographs on this screen are captioned with, and the one thing
 * home says that no other screen says: a model is not a row.
 *
 * The register declares its own hierarchy, so the model level is read
 * from the table rather than assumed. Highfield files its model level
 * as the bare code `ADV7`, and Stacer files its models as `Stacer - 519
 * Sea Ranger SDF (Centre Console)`, where the model is inside a longer
 * name.
 *
 * THE RULE IS THE APP'S, NOT THIS SCREEN'S (the M2-close critique,
 * finding 11). This used to be its own reading — an exact name first,
 * else any name merely CONTAINING the model — while the build asked
 * for an exact name only, so Home captioned the Stacer 519's photograph
 * "2 versions of this boat on the price file" and the build drew a
 * wordmark for both of them. It is now `rowsOfModel` in
 * `@/domain/catalogue/depicts`, the same rule the build's stage and the
 * picker's plate draw the photograph by, so the figure under a
 * photograph counts exactly the rows the sale draws it for.
 */
export function modelRowsOf(table: EntityDef, rows: readonly RowData[], model: string): number {
  return rowsOfModel(table, rows, model)
}
