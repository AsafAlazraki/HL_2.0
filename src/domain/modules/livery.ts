/* ============================================================
   A PLACE'S LIVERY — its address, its ground, its mark, its
   photograph, and what it holds — read once, for the index and the
   page alike (Milestone 4, /places, board A "The livery").

   THE FAULT THIS FIXES, as the plan names it: the original hung the
   logo on the module while the card was per place, so seven boat
   brands shared one mark. Here every place reads its OWN livery off
   `ModuleDef.dress[tableId]`, and where Northside has set nothing it
   wears what is true of it on day one:

     · the maker's own mark, in white ink where the app ships one and
       on a white plate in the maker's own colours where only that is
       shipped — and its name set in type where no mark is shipped at
       all (REDCO / Tinka, NSM Custom, Parts & Accessories …), never
       initials and never another maker's mark;
     · one of ITS OWN boats on the water, chosen from the photographs
       the app ships with, captioned with the model it shows — never a
       photograph of something else, because only a picture whose
       register is this place's table is ever offered;
     · its kind's ground, from a bounded set every one of which white
       words clear at 4.5 : 1, measured here (`GROUNDS`).

   EVERY FIGURE IS /data's FIGURE. A card that said 2,238 where /data
   says 2,937 was the board's own UX error (places-boards verdict,
   must-change). `holdsSay` is the figure /data prints for the same
   table — the register's `holds`, with a boat maker counted in models
   as Home and the picker count it — and what is no longer sold is
   said beside it as its own clause, from the same census.

   Pure: no React, no store, no DOM. The picture book is handed in.
   ============================================================ */
import {
  TABLE_KINDS,
  isDiscontinued,
  isRetired,
  type EntityDef,
  type GroundKey,
  type ImageRef,
  type LiveryInk,
  type ModuleDef,
  type PlaceDress,
  type QuoteDef,
  type RowData,
  type TableKind,
} from '@/domain/model'
import type { HeldMark, Picture, PictureBook } from '@/domain/model/pictures'
import { whiteOn, type Oklch } from '@/domain/appearance/accent'
import { modelKeyOf } from '@/domain/quote/boats'
import { branchOf } from './read'
import type { Place } from './places'
import type { Pairing, TableFacts, TableRegister } from './register'

const n = (v: number): string => v.toLocaleString('en-AU')

/* ---------------------------------------------------------- */
/* Where a place is                                            */
/* ---------------------------------------------------------- */

/** The tables a place stands for: its one table, or every live table of a module that is one
 *  place. */
export function tablesOfPlace(
  place: Place,
  modules: Readonly<Record<string, ModuleDef>>,
): string[] {
  if (place.tableId) return [place.tableId]
  return [...(modules[place.moduleId]?.tableIds ?? [])]
}

/** The key a place's livery is kept under on its module: its table, or '' for a module that is
 *  one place. */
export const dressKey = (place: Place): string => place.tableId ?? ''

/** A PLACE'S ADDRESS, as `/places/$id` spells it: the table it stands for — the same word the
 *  sheet's own address uses (`/data/boat_highfield`) — so a place and its list read alike. A
 *  module whose tables are all gone falls back to its own id. */
export function addressOf(place: Place, modules: Readonly<Record<string, ModuleDef>>): string {
  return place.tableId ?? modules[place.moduleId]?.tableIds[0] ?? place.moduleId
}

/** The place an address names, or undefined for an address no place answers to. */
export function placeAt(
  places: readonly Place[],
  modules: Readonly<Record<string, ModuleDef>>,
  address: string,
): Place | undefined {
  return places.find((p) => addressOf(p, modules) === address)
}

/** What Northside has set on a place — every part absent on day one. */
export function dressOf(place: Place, modules: Readonly<Record<string, ModuleDef>>): PlaceDress {
  return modules[place.moduleId]?.dress?.[dressKey(place)] ?? {}
}

/* ---------------------------------------------------------- */
/* The ground                                                  */
/* ---------------------------------------------------------- */

export interface Ground {
  key: GroundKey
  /** the colour's name, as a person picking it reads it */
  name: string
  /** byte for byte as tokens.css declares the step it paints with */
  ink: Oklch
  /** white words on it, measured (WCAG 2.x) */
  contrast: number
}

/** White words on a ground must clear this, as on Northside's accent (docs/CUSTOMISATION.md). */
export const GROUND_FLOOR = 4.5

const RAW_GROUNDS: readonly [GroundKey, string, Oklch][] = [
  /* --color-cobalt-700, the boat's own ink */
  ['cobalt', 'Cobalt', { l: 0.38, c: 0.14, h: 268 }],
  /* --color-blue-800 */
  ['navy', 'Navy', { l: 0.36, c: 0.12, h: 258 }],
  /* --color-carmine-600, the motor's */
  ['carmine', 'Carmine', { l: 0.5, c: 0.16, h: 22 }],
  /* --color-violet-600, the package's */
  ['violet', 'Violet', { l: 0.5, c: 0.15, h: 300 }],
  /* --color-teal-600, the dealer's */
  ['teal', 'Teal', { l: 0.49, c: 0.08, h: 197 }],
  /* --color-viridian-600, the accessory's */
  ['viridian', 'Viridian', { l: 0.49, c: 0.1, h: 163 }],
  /* --color-ochre-600, the trailer's */
  ['ochre', 'Ochre', { l: 0.5, c: 0.09, h: 95 }],
  /* --color-neutral-700 */
  ['graphite', 'Graphite', { l: 0.38, c: 0.049, h: 239.9 }],
]

/** Every ground a place may stand on, each with white measured on it. */
export const GROUNDS: readonly Ground[] = RAW_GROUNDS.map(([key, name, ink]) => ({
  key,
  name,
  ink,
  contrast: Math.round(whiteOn(ink) * 100) / 100,
}))

/** The ground a place stands on until Northside picks one: its kind's own ink. */
export const KIND_GROUND: Readonly<Record<TableKind, GroundKey>> = {
  boat: 'cobalt',
  motor: 'carmine',
  package: 'violet',
  trailer: 'ochre',
  accessory: 'viridian',
  dealer: 'teal',
  custom: 'graphite',
}

export function groundOf(place: Pick<Place, 'kind' | 'retired'>, dress: PlaceDress): Ground {
  const key = dress.ground ?? (place.retired ? 'graphite' : KIND_GROUND[place.kind])
  return GROUNDS.find((g) => g.key === key) ?? GROUNDS[0]!
}

/* ---------------------------------------------------------- */
/* The mark                                                    */
/* ---------------------------------------------------------- */

/** One drawable mark: straight on the ground in white ink, or on a white plate in its own. */
export interface DrawnMark {
  on: 'ground' | 'plate'
  src: string
  width?: number
  height?: number
  /** Northside's own file rather than the maker's */
  own: boolean
}

export type LiveryMark = { drawn: true; mark: DrawnMark } | { drawn: false; because: string }

/** The maker's marks the app ships for a place, in both inks, or why one is not there. */
export interface MarkInks {
  white: HeldMark | null
  dark: HeldMark | null
  /** said where the white ink is offered and cannot be had */
  noWhite: string
  noDark: string
}

const markSaid = (name: string): string => `No mark for ${name} yet.`

export function markInks(name: string, book: Pick<PictureBook, 'mark'>): MarkInks {
  const white = book.mark(name, 'white')
  const dark = book.mark(name, 'dark')
  const why = (c: typeof white): string => {
    if (c.drawn) return ''
    /* the book's own sentence names the ink a maker publishes; "held" is not a dealer's word */
    return /ink only/.test(c.because) ? c.because.replace(/, which.*$/, '.') : markSaid(name)
  }
  return {
    white: white.drawn ? white.mark : null,
    dark: dark.drawn ? dark.mark : null,
    noWhite: why(white),
    noDark: why(dark),
  }
}

/** The ink a mark needs to stand where it stands: white on the colour, its own on a plate. */
export const inkOf = (on: DrawnMark['on']): LiveryInk => (on === 'ground' ? 'white' : 'dark')
/** Where a mark in an ink stands. */
export const onOf = (ink: LiveryInk): DrawnMark['on'] => (ink === 'white' ? 'ground' : 'plate')

const fromHeld = (m: HeldMark, on: DrawnMark['on']): DrawnMark => ({
  on,
  src: m.src,
  width: m.width,
  height: m.height,
  own: false,
})

const fromOwn = (image: ImageRef, ink: LiveryInk): DrawnMark => ({
  on: ink === 'white' ? 'ground' : 'plate',
  src: image.src,
  ...(image.w ? { width: image.w } : {}),
  ...(image.h ? { height: image.h } : {}),
  own: true,
})

/**
 * THE MARK A PLACE WEARS ON ITS GROUND. Northside's choice first; then the maker's white ink,
 * which stands on the ground; then the maker's own colours, on a white plate; then the name,
 * set in type, with the sentence saying why.
 */
export function liveryMark(
  name: string,
  dress: PlaceDress,
  book: Pick<PictureBook, 'mark'>,
): LiveryMark {
  const inks = markInks(name, book)
  const pick = dress.mark
  if (pick?.from === 'own') return { drawn: true, mark: fromOwn(pick.image, pick.ink) }
  if (pick?.from === 'name') return { drawn: false, because: `${name} wears its name.` }
  if (pick?.from === 'maker') {
    const held = pick.ink === 'white' ? inks.white : inks.dark
    if (held)
      return { drawn: true, mark: fromHeld(held, pick.ink === 'white' ? 'ground' : 'plate') }
  }
  if (inks.white) return { drawn: true, mark: fromHeld(inks.white, 'ground') }
  if (inks.dark) return { drawn: true, mark: fromHeld(inks.dark, 'plate') }
  return { drawn: false, because: markSaid(name) }
}

/* ---------------------------------------------------------- */
/* The photograph                                              */
/* ---------------------------------------------------------- */

/** A place's own boats on the water, as the app ships them — the photographs it may stand on.
 *  ONLY ITS OWN: a picture whose register is another table is never offered, so a place cannot
 *  be given a photograph of something it does not sell. A picture a person marked as its boat
 *  comes before one chosen by machine; otherwise the order the photographs are kept in. */
export function heroesOf(
  tableIds: readonly string[],
  book: Pick<PictureBook, 'heroes'>,
): Picture[] {
  const mine = book.heroes().filter((p) => tableIds.includes(p.table))
  return mine.toSorted((a, b) => Number(b.person) - Number(a.person))
}

export type LiveryHero =
  | { shown: true; from: 'maker'; picture: Picture; caption: string; chosen: boolean }
  | { shown: true; from: 'own'; image: ImageRef; caption: string }
  | { shown: false; because: string; chosen: boolean }

/** Said under Northside's own photograph, which nobody has told the app the model of. */
export const OWN_PICTURE = 'Northside’s own photograph'

export function liveryHero(
  name: string,
  tableIds: readonly string[],
  dress: PlaceDress,
  book: Pick<PictureBook, 'heroes'>,
): LiveryHero {
  const pick = dress.hero
  if (pick?.from === 'none') {
    return { shown: false, because: `Northside shows no photograph for ${name}.`, chosen: true }
  }
  if (pick?.from === 'own')
    return { shown: true, from: 'own', image: pick.image, caption: OWN_PICTURE }
  const own = heroesOf(tableIds, book)
  if (pick?.from === 'maker') {
    const it = own.find((p) => p.id === pick.id)
    if (it) return { shown: true, from: 'maker', picture: it, caption: it.subject, chosen: true }
  }
  const first = own[0]
  if (first)
    return { shown: true, from: 'maker', picture: first, caption: first.subject, chosen: false }
  return { shown: false, because: `No photograph of ${name} on the water yet.`, chosen: false }
}

/* ---------------------------------------------------------- */
/* What it holds — /data's own figure                          */
/* ---------------------------------------------------------- */

/** WHAT A TABLE HOLDS, AS /data PRINTS IT: the register's `holds`, and a boat maker counted
 *  in its models (`countBoats`) in the series the price list cuts them into. The same rule as
 *  Data's plate, so the two screens print one figure for one list. */
export function holdsSay(facts: TableFacts, models: number | undefined): string {
  if (models === undefined || models === 0 || models === facts.rows) return facts.holds
  const said = `${n(models)} ${models === 1 ? 'model' : 'models'}`
  return facts.branchSay ? `${said} ${facts.branchSay}` : said
}

export interface PlaceFigure {
  /** "67 models in 7 series", "2,937 products in 187 categories" */
  holds: string
  /** "699 no longer sold", or null where everything is still sold */
  held: string | null
}

/** The facts the register keeps for one table, plate or row. */
export function factsOf(register: TableRegister, tableId: string): TableFacts | undefined {
  return (
    register.plates.find((p) => p.id === tableId) ?? register.rows.find((r) => r.id === tableId)
  )
}

/** How many lines of a table are no longer sold: discontinued lines, or every line of a list
 *  that is itself no longer sold. */
export function heldCount(table: EntityDef | undefined, rows: readonly RowData[]): number {
  if (!table) return 0
  if (isRetired(table)) return rows.length
  return rows.filter((r) => isDiscontinued(r)).length
}

export function placeFigure(
  tableIds: readonly string[],
  register: TableRegister,
  models: ReadonlyMap<string, number>,
  tables: Readonly<Record<string, EntityDef>>,
  rows: Readonly<Record<string, readonly RowData[]>>,
): PlaceFigure {
  const said: string[] = []
  let held = 0
  let retired = tableIds.length > 0
  for (const id of tableIds) {
    const facts = factsOf(register, id)
    if (facts) said.push(holdsSay(facts, models.get(id)))
    held += heldCount(tables[id], rows[id] ?? [])
    retired &&= tables[id] !== undefined && isRetired(tables[id])
  }
  return {
    holds: said.join(' · '),
    held: retired ? 'No longer sold' : held > 0 ? `${n(held)} no longer sold` : null,
  }
}

/* ---------------------------------------------------------- */
/* Its range                                                   */
/* ---------------------------------------------------------- */

export interface RangePart {
  /** the heading as the price list writes it — a series, a category, a section */
  name: string
  /** lines still sold under it */
  lines: number
  /** models under it, counted as `countBoats` counts them (a boat maker's); lines otherwise */
  models: number
  /** one of its own photographs on the water, or null */
  picture: Picture | null
  /** how many of the place's photographs show something under it */
  pictured: number
}

/** A PLACE'S RANGE, by the first heading its price list cuts it by, in the price list's own
 *  order. Empty for a list with no headings, which the page draws as its lines instead. */
export function rangeOf(
  table: EntityDef | undefined,
  rows: readonly RowData[],
  heroes: readonly Picture[],
): RangePart[] {
  if (!table || (table.hierarchy ?? []).length < 2) return []
  const boat = table.kind === 'boat'
  const parts = new Map<string, { lines: number; keys: Set<string>; ids: Set<string> }>()
  for (const row of rows) {
    if (isDiscontinued(row)) continue
    const name = branchOf(table, row)
    if (name === '') continue
    const part = parts.get(name) ?? { lines: 0, keys: new Set<string>(), ids: new Set<string>() }
    part.lines += 1
    part.keys.add(boat ? modelKeyOf(table, row) : row.id)
    part.ids.add(row.id)
    parts.set(name, part)
  }
  return [...parts].map(([name, part]) => {
    const shown = heroes.filter((h) => h.table === table.id && h.rows.some((r) => part.ids.has(r)))
    return {
      name,
      lines: part.lines,
      models: part.keys.size,
      picture: shown[0] ?? null,
      pictured: shown.length,
    }
  })
}

/* ---------------------------------------------------------- */
/* What goes with it                                           */
/* ---------------------------------------------------------- */

export interface GoesWith {
  tableId: string
  name: string
  kind: TableKind
  /** the lines that say one of this place's things fits one of that place's */
  fits: number
}

/**
 * THE PLACES THIS ONE GOES WITH, each counted by the lines that say what fits what — the
 * price list's own lists of what fits which boat, read from both ends: Highfield goes with
 * Yamaha Outboards (2,519), and Yamaha Outboards goes with Highfield. Most first. A list no
 * longer sold is left out, as /data leaves it out.
 */
export function goesWith(
  tableIds: readonly string[],
  pairings: readonly Pairing[],
  tables: Readonly<Record<string, EntityDef>>,
): GoesWith[] {
  const mine = new Set(tableIds)
  const tally = new Map<string, number>()
  for (const p of pairings) {
    if (p.retired) continue
    const other = mine.has(p.ownerId) ? p.farId : mine.has(p.farId) ? p.ownerId : null
    if (other === null || mine.has(other)) continue
    tally.set(other, (tally.get(other) ?? 0) + p.rows)
  }
  const out: GoesWith[] = []
  for (const [tableId, fits] of tally) {
    const t = tables[tableId]
    if (!t || isRetired(t)) continue
    const kind = t.kind && t.kind in TABLE_KINDS ? t.kind : 'custom'
    out.push({ tableId, name: t.name, kind, fits })
  }
  return out.sort((a, b) => b.fits - a.fits || a.name.localeCompare(b.name))
}

/* ---------------------------------------------------------- */
/* Its quotes                                                  */
/* ---------------------------------------------------------- */

/** Every quote that is about this place — written on one of its boats, or carrying one of its
 *  lines — newest first. */
export function placeQuotes(tableIds: readonly string[], quotes: readonly QuoteDef[]): QuoteDef[] {
  const mine = new Set(tableIds)
  return quotes
    .filter((q) => mine.has(q.rootTableId) || q.lines.some((l) => mine.has(l.entityId)))
    .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
}
