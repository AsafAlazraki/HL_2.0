/* ============================================================
   WHAT PLACES DRAWS, READ ONCE FROM THE STORES — every figure
   counted by the domain (`src/domain/modules/livery.ts`, `places.ts`,
   `register.ts`) and nothing summed here. The index and the opened
   page read the same card, so a place is the same colour, mark,
   photograph and figure in both.
   ============================================================ */
import {
  TABLE_KINDS,
  type EntityDef,
  type ModuleDef,
  type PriceLevel,
  type QuoteDef,
  type RowData,
  type TableKind,
} from '@/domain/model'
import type { PictureBook } from '@/domain/model/pictures'
import { countBoats } from '@/domain/quote/boats'
import { placesOf, type Place } from '@/domain/modules/places'
import { buildEntries } from '@/domain/modules/read'
import { readTableRegister, type TableRegister } from '@/domain/modules/register'
import {
  addressOf,
  dressOf,
  factsOf,
  goesWith,
  groundOf,
  heroesOf,
  liveryHero,
  liveryMark,
  placeAt,
  placeFigure,
  placeQuotes,
  rangeOf,
  tablesOfPlace,
  type Ground,
  type LiveryHero,
  type LiveryMark,
  type PlaceFigure,
  type RangePart,
} from '@/domain/modules/livery'
import { pricesOf } from '@/app/ways'
import { readLadder } from '@/screens/levels/read'

export interface World {
  tables: Readonly<Record<string, EntityDef>>
  rows: Readonly<Record<string, RowData[]>>
  modules: Readonly<Record<string, ModuleDef>>
  priceLevels: Readonly<Record<string, PriceLevel[]>>
}

/** The kind as a dealer reads it on this screen. The model's label for a list with no kind is
 *  a word for the mechanism, so these three lists are "Other lists". */
export function kindWord(kind: TableKind): string {
  return kind === 'custom' ? 'Other lists' : TABLE_KINDS[kind].label
}

export interface PlaceCard {
  place: Place
  address: string
  name: string
  kind: TableKind
  ground: Ground
  mark: LiveryMark
  hero: LiveryHero
  figure: PlaceFigure
  /** whether the name is printed beside the mark: not where the maker's own mark already says
   *  exactly it (Stacer's mark over the word STACER is one fact twice) */
  nameShown: boolean
  /** Northside's own line, or null on day one */
  line: string | null
  /** how many of its own boats the app has on the water */
  photographs: number
  tableIds: string[]
}

export interface PlacesRead {
  cards: PlaceCard[]
  register: TableRegister
}

export function readPlaces(world: World, book: PictureBook): PlacesRead {
  const tables = world.tables as Record<string, EntityDef>
  const rows = world.rows as Record<string, RowData[]>
  const modules = world.modules as Record<string, ModuleDef>
  const register = readTableRegister(
    tables,
    rows,
    modules,
    world.priceLevels as Record<string, PriceLevel[]>,
  )
  const models = new Map(countBoats(tables, rows).byMaker.map((m) => [m.id, m.boats]))
  const cards = placesOf(modules, tables, rows).map((place): PlaceCard => {
    const tableIds = tablesOfPlace(place, modules)
    const dress = dressOf(place, modules)
    return {
      place,
      address: addressOf(place, modules),
      name: place.name,
      kind: place.kind,
      ground: groundOf(place, dress),
      mark: liveryMark(place.name, dress, book),
      hero: liveryHero(place.name, tableIds, dress, book),
      figure: placeFigure(tableIds, register, models, tables, rows),
      nameShown: !(
        dress.mark?.from !== 'own' &&
        liveryMark(place.name, dress, book).drawn &&
        book.marksFor(place.name)[0]?.brand.toLowerCase() === place.name.toLowerCase()
      ),
      line: dress.line ?? null,
      photographs: heroesOf(tableIds, book).length,
      tableIds,
    }
  })
  return { cards, register }
}

export interface KindRun {
  kind: TableKind
  word: string
  cards: PlaceCard[]
}

/** The cards by kind, the kinds in the order Northside's own places first name them. */
export function runsOf(cards: readonly PlaceCard[]): KindRun[] {
  const runs: KindRun[] = []
  for (const card of cards) {
    let run = runs.find((r) => r.kind === card.kind)
    if (!run) {
      run = { kind: card.kind, word: kindWord(card.kind), cards: [] }
      runs.push(run)
    }
    run.cards.push(card)
  }
  return runs
}

/* ---------------------------------------------------------- */
/* One place, opened                                           */
/* ---------------------------------------------------------- */

export interface Partner {
  tableId: string
  name: string
  kind: TableKind
  fits: number
  /** the partner's own address on this screen, or null where it is no place */
  address: string | null
  mark: LiveryMark
  ground: Ground
}

export interface PlaceLine {
  id: string
  label: string
  price: string
}

export interface PlacePage {
  card: PlaceCard
  /** the one list the place stands for, for its range and its words */
  table: EntityDef | undefined
  range: RangePart[]
  /** a list with no headings, drawn line by line */
  lines: PlaceLine[]
  /** what one line of it is, in the dealer's word ("motors", "products") */
  noun: string
  partners: Partner[]
  quotes: QuoteDef[]
  /** the prices the list declares, in the sale's words beside the price list's own */
  prices: { said: string; filed: string }[]
  /** where its prices are set, or null for a list Prices does not carry */
  pricesHref: string | null
  /** lines of it changed on this computer since the price list came in */
  edited: number
  /** a boat maker's own boats can be quoted from here */
  quotable: boolean
  /** what the act calls one of its boats: the maker's own name off its mark ("Highfield"),
   *  or the place's name where no mark is shipped */
  quoteWord: string
}

export function readPlace(
  world: World,
  read: PlacesRead,
  address: string,
  quotes: readonly QuoteDef[],
  book: PictureBook,
): PlacePage | null {
  const modules = world.modules as Record<string, ModuleDef>
  const place = placeAt(
    read.cards.map((c) => c.place),
    modules,
    address,
  )
  const card = read.cards.find((c) => c.place === place)
  if (!card) return null
  const tables = world.tables as Record<string, EntityDef>
  const rows = world.rows as Record<string, RowData[]>
  const first = card.tableIds[0]
  const table = first ? tables[first] : undefined
  const own = heroesOf(card.tableIds, book)
  const range = rangeOf(table, first ? (rows[first] ?? []) : [], own)
  const lines =
    range.length === 0 && table
      ? buildEntries([table], rows, { facts: false }).map((e) => ({
          id: e.rowId,
          label: e.label,
          price: e.price,
        }))
      : []
  const facts = first ? factsOf(read.register, first) : undefined
  const byTable = (id: string): PlaceCard | undefined =>
    read.cards.find((c) => c.tableIds.includes(id))
  const partners = goesWith(card.tableIds, read.register.pairings, tables).map((g): Partner => {
    const other = byTable(g.tableId)
    return {
      ...g,
      address: other?.address ?? null,
      mark: other?.mark ?? { drawn: false, because: '' },
      ground: other?.ground ?? card.ground,
    }
  })
  const column = readLadder({ tables, rows, priceLevels: world.priceLevels }).find((c) =>
    card.tableIds.some((id) => c.tableIds.includes(id)),
  )
  let edited = 0
  for (const id of card.tableIds)
    for (const row of rows[id] ?? []) if (row.updatedAt !== row.createdAt) edited += 1
  const quotable =
    card.kind === 'boat' &&
    !card.place.retired &&
    (modules[card.place.moduleId]?.capabilities ?? []).includes('quote')
  return {
    card,
    table,
    range,
    lines,
    noun: facts?.leaf.many ?? 'lines',
    partners,
    quotes: placeQuotes(card.tableIds, quotes),
    prices: facts?.prices ?? [],
    pricesHref: column ? pricesOf(column.id) : null,
    edited,
    quotable,
    quoteWord: book.marksFor(card.name)[0]?.brand ?? card.name,
  }
}
