/* ============================================================
   WHAT THE FILE ACTUALLY HOLDS — every figure this screen prints,
   counted off the sheet that loaded.

   NOT ONE NUMBER HERE IS TYPED. The manifest carries a header saying
   53 tables and 15,691 rows, and the store carries the tables and the
   rows themselves; when the two disagree the store is right and the
   header is a hope. So everything below walks what arrived. A table
   that failed to load makes a figure smaller, which is the point.

   THERE IS NO TOTAL OF BOATS FOR SALE, and this module does not
   compute one. The file counts ROWS: a row is a hull in one variant at
   one price, seven of them are one Highfield model, and nothing in the
   file says how many boats a dealer could sell. CLAUDE.md calls an
   invented figure the one unforgivable thing, so "810 rows" is what is
   offered and "810 boats" is never said.

   A KIND IS LABELLED BY THE DEALER'S OWN PLACES, not by the word the
   model uses for it. `TableKind` is a type in the contract — 'custom'
   is the absence of a kind rather than a thing anybody sells — while
   the nine places minted when the file lands are named in the
   dealership's own words: Labour Rates, Oils & Consumables,
   Registration Costs. So a kind's label is the names of the places
   that hold it, and the contract's own label is the fallback for a
   sheet with no places filed yet.
   ============================================================ */
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
}

/** One sort of thing the business sells, with the places that hold it. */
export interface KindHolding {
  kind: TableKind
  /** what the panel calls it — see `labelFor` */
  label: string
  /** the places that hold it, named as the dealership names them */
  places: string[]
  rows: number
  registers: Register[]
}

export interface Holdings {
  /** every table that loaded, joins and retired ones included */
  tables: number
  /** every row that loaded */
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
 */
function labelFor(kind: TableKind, places: string[]): string {
  if (places.length === 1) return places[0] ?? ''
  if (kind === 'custom' && places.length > 0) return places.join(' · ')
  return TABLE_KINDS[kind].label
}

export function holdingsOf(
  tables: Readonly<Record<string, EntityDef>>,
  rows: Readonly<Record<string, readonly RowData[]>>,
  modules: Readonly<Record<string, ModuleDef>> = {},
): Holdings {
  const all = Object.values(tables)
  const base = all.filter((t) => t.role !== 'join')
  const joins = all.filter((t) => t.role === 'join')

  const registersOf = (kind: TableKind): Register[] =>
    base
      .filter((t) => t.kind === kind)
      .map((t) => ({ id: t.id, name: t.name, rows: countOf(rows, t.id) }))

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
 * from the table rather than assumed. Two spellings are answered, in
 * this order: Highfield files its model level as the bare code `ADV7`,
 * and Stacer files its models as `Stacer - 519 Sea Ranger SDF (Centre
 * Console)`, where the model is inside a longer name. An exact match
 * wins outright; only where there is none is a containing name
 * counted, so `519 SeaMaster` is never counted as `519 Sea Ranger
 * SDF`.
 */
export function modelRowsOf(table: EntityDef, rows: readonly RowData[], model: string): number {
  const levels = table.hierarchy?.length ? table.hierarchy : [table.displayFieldId ?? '']
  const wanted = model.trim().toLowerCase()
  if (wanted === '') return 0

  const values = (row: RowData): string[] =>
    levels
      .map((fieldId) => row.values[fieldId])
      .filter((v): v is string => typeof v === 'string')
      .map((v) => v.trim().toLowerCase())

  const exact = rows.filter((row) => values(row).includes(wanted)).length
  if (exact > 0) return exact
  return rows.filter((row) => values(row).some((v) => v.includes(wanted))).length
}
