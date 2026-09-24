/* ============================================================
   THE REGISTER OF THE DEALER'S TABLES — every figure and every word
   the Data screen draws, resolved in one place with no React in it.

   WHAT IT ANSWERS, and nothing more:

     what the file holds, counted            readTableRegister().head
     the boat tables, with what pairs        .plates
     every other base table, under its place .rows
     one table's page                        pageOf()
     does a table answer a query             matchesTable()
     the workbook sentence off a description provenanceLine()

   NOTHING HERE IS A LIST WRITTEN IN APP CODE. The places are the
   modules `mint.ts` minted from table keys when the file landed, read
   back through `placesOf` (places.ts) in the modules' own order; a
   plate is any base table whose kind is `boat`, which is what
   TABLE_KINDS means by "the table IS the brand"; a pairing is a join
   table read by its OWN reference columns in the file's own column
   order — the first names the side it hangs off, the second the far
   side, and anything after that rides along (the eight motor joins
   carry `Rigging Kit Option → Rigging Kits` third). A dealership that
   files an eighth brand tomorrow gets an eighth plate with no code
   change, and a pharmacy with no boat table at all gets no plates and
   every table as a row.

   NOTHING HERE INVENTS A FIGURE. Every count is the length of a row
   list that loaded; a table with no description carries no
   provenance sentence and says so through `provenance.kind`; a table
   in no module was filed at this desk and says THAT, with the day it
   was made read off its own `createdAt` — never a sentence typed for
   it.

   THE NOUNS ARE THE DEALER'S OWN. `leafNoun` and `branchNoun`
   (`domain/catalogue/table/grouping`) read what one row of a table
   is and what one heading is off the table's own columns — "588
   variants in 7 series", "18 rates", "434 pairings" — and `kindWord`
   below prints a kind's label from TABLE_KINDS. The one word this
   file writes for itself is `Register`, for a table that declares no
   kind, because `TABLE_KINDS.custom.label` is "Custom table", which
   is a word from the model.
   ============================================================ */

import {
  TABLE_KINDS,
  isRetired,
  type EntityDef,
  type ModuleDef,
  type PriceLevel,
  type RowData,
  type TableKind,
} from '@/domain/model'
import { countTables, madeAtThisDesk, priceFileOf } from '@/domain/catalogue/priceFile'
import { branchNoun, leafNoun, type LeafNoun } from '@/domain/catalogue/table/grouping'
import { localDay } from '@/domain/quote/day'
import { isCostColumn } from '@/domain/quote/pricing'
import { placesOf } from './places'

/* ---------------------------------------------------------- */
/* Words                                                       */
/* ---------------------------------------------------------- */

/** The word for a table that declares no kind. `TABLE_KINDS.custom`
 *  is labelled "Custom table", and "table" is not what a dealer calls
 *  the labour rates; the seed's own note calls the three of them "a
 *  register that other places read". */
export const REGISTER_WORD = 'Register'

/** The word a dealer-made table's provenance carries. */
export const FILED_AT_THIS_DESK = 'Filed at this desk'

/** The place a table in no module is listed under. */
export const DESK_PLACE = 'Filed at this desk'

/** What a kind is called on a row: TABLE_KINDS' own label, except for
 *  the absence of a kind, which has the one word above. */
export function kindWord(kind: TableKind): string {
  return kind === 'custom' ? REGISTER_WORD : TABLE_KINDS[kind].label
}

/**
 * A COUNT AS A DEALER READS IT. `countLabel` in `table/grouping` writes
 * the bare integer — `3587 products` — which is right for a column
 * header and wrong on a register beside `15,691 rows` in the same head.
 * The grouping is `face.ts`'s, four files along, and the locale is named
 * rather than left to the machine so the string is the same on every
 * one of them.
 */
const grouped = (n: number): string => n.toLocaleString('en-AU')

const counted = (n: number, noun: LeafNoun): string =>
  `${grouped(n)} ${n === 1 ? noun.one : noun.many}`

const kindOf = (e: EntityDef): TableKind =>
  e.kind !== undefined && e.kind in TABLE_KINDS ? e.kind : 'custom'

const isJoin = (e: EntityDef): boolean => e.role === 'join'

/* ---------------------------------------------------------- */
/* Provenance                                                  */
/* ---------------------------------------------------------- */

/**
 * THE WORKBOOK SENTENCE, cut off the table's own description.
 *
 * The packer writes every table's description as one sentence saying
 * where it came from — `Trailer Module.xlsx · sheet “Trailer Module”,
 * rows 4–85.` — followed by paragraphs of reading notes. A register
 * row has 28px and wants the first sentence; the page wants the
 * whole. So this returns the text up to the first full stop that is
 * followed by a new sentence (a space and a capital, a digit, a
 * bracket or an opening quote — `(5).xlsx` is not a sentence end,
 * because no space follows its stop), and cuts a dash clause off the
 * end where the packer wrote one (`rows 4–1350 — the eighth workbook,
 * read directly …`).
 *
 * Nothing is added: a description with no stop at all is returned
 * whole, and an empty one is null, which the row prints as the
 * absence it is.
 */
export function provenanceLine(description: string | undefined): string | null {
  const said = (description ?? '').trim()
  if (said === '') return null
  const firstStop = /\.(?=\s+[A-Z0-9“"(])/.exec(said)
  let line = firstStop ? said.slice(0, firstStop.index + 1) : said
  const dash = line.indexOf(' — ')
  if (dash > 0) line = line.slice(0, dash)
  return line.trim()
}

export type Provenance =
  /** the file's own sentence about the table */
  | { kind: 'file'; line: string; whole: string }
  /** a table the file did not bring — made here, on the day its own record says */
  | { kind: 'desk'; line: string; whole: string; madeOn: string }
  /** a table from the file whose description is empty */
  | { kind: 'none'; line: null; whole: '' }

/** The day part of an ISO stamp, or the stamp itself when it is not one. */
/** The day a table was made, in the dealer's own calendar. It sliced the stored instant's
 *  first ten characters, which is the UTC day: a register filed at 00:54 on 24 September in
 *  Brisbane said "Filed at this desk · 23 Sept 2026" beside a customer page saying
 *  2026-09-24 (driven 2026-09-24). `localDay` is the rule the quote reference already uses. */
const dayOf = (iso: string): string => localDay(iso)

/* ---------------------------------------------------------- */
/* One table's facts                                           */
/* ---------------------------------------------------------- */

export interface TableFacts {
  id: string
  name: string
  kind: TableKind
  /** the kind, as a row prints it */
  kindWord: string
  /** history rather than stock — drawn, and said to be */
  retired: boolean
  rows: number
  /** what one row of it is, in the dealer's own word */
  leaf: LeafNoun
  /** what one heading is, or null for a flat table */
  branch: LeafNoun | null
  /** how many headings the first level cuts the rows into */
  branches: number
  /** "588 variants in 7 series", "18 rates" */
  holds: string
  /** THE TWO HALVES OF `holds`, APART, because a register column that
   *  right-aligns the count cannot also carry the heading phrase: the
   *  long one — "3,587 products in 187 categories" — overflowed its
   *  cell's start edge and printed "87 products", a figure the file
   *  does not carry, where a reader saw no ellipsis and had no way to
   *  know. Measured on this pack, 2026-09-23. The screen draws them in
   *  two cells; nothing cuts a string apart to find them. */
  leafSay: string
  /** "in 187 categories", or null for a table with no headings */
  branchSay: string | null
  columns: number
  /** columns the file marks as cost — counted, never named */
  costColumns: number
  /** the declared price ladder's labels — "Cash · Trade" */
  levels: string[]
  provenance: Provenance
}

/** One join, read by its own reference columns. */
export interface Pairing {
  joinId: string
  joinName: string
  /** the side it hangs off — the first reference column's table */
  ownerId: string
  ownerName: string
  /** the far side — the second reference column's table */
  farId: string
  farName: string
  farKind: TableKind
  /** anything after the second reference rides along */
  extras: { id: string; name: string }[]
  /** how many pairings the join records */
  rows: number
  retired: boolean
}

export interface Plate extends TableFacts {
  pairings: Pairing[]
  /** rows across every pairing list hanging off it */
  pairingRows: number
}

export interface RegisterRow extends TableFacts {
  /** the place it is filed under, as the dealer names it */
  place: string
  placeId: string
  /** first row of its place's run */
  leads: boolean
  /** how many rows the place holds on this register */
  placeSize: number
  /** whether the place head is worth printing on the leading row: a
   *  place named for its one table would print the same word twice */
  headed: boolean
  /** the boats whose pairing lists name it, and how many pairings */
  namedBy: { boats: string[]; pairings: number }
}

/**
 * THE HEAD COUNTS THE PRICE FILE, AND THE DESK'S OWN APART (the
 * critique of Milestone 2's close, blocker 2). It counted every table
 * on the sheet, so filing the first customer printed "54 tables ·
 * 15,692 rows" on the line above the fingerprint of a file that has
 * 53: the book was counted as the file. The file is now told from the
 * desk by `domain/catalogue/priceFile.ts` — the rule this register
 * already printed its rows by — and what was made here is its own
 * figure, `desk`, which a screen says in its own words or not at all.
 */
export interface RegisterHead {
  /** the price file's tables, joins included */
  tables: number
  rows: number
  joins: number
  joinRows: number
  base: number
  baseRows: number
  /** the price file's boat tables */
  boats: number
  /** the tables made at this desk — the customers book, a new register */
  desk: { tables: number; rows: number }
}

export interface TableRegister {
  head: RegisterHead
  plates: Plate[]
  rows: RegisterRow[]
  /** every join, so a page can list what names a table */
  pairings: Pairing[]
  /** every table's facts by id, joins included, so a page can be
   *  drawn for a pairing list too */
  facts: Record<string, TableFacts>
}

/* ---------------------------------------------------------- */
/* Reading                                                     */
/* ---------------------------------------------------------- */

const distinctBranches = (table: EntityDef, rows: readonly RowData[]): number => {
  const first = table.hierarchy?.[0]
  if (!first) return 0
  const seen = new Set<string>()
  for (const row of rows) {
    const v = row.values[first]
    if (typeof v === 'string' && v.trim() !== '') seen.add(v.trim())
    else if (typeof v === 'number') seen.add(String(v))
  }
  return seen.size
}

function factsOf(
  table: EntityDef,
  rows: readonly RowData[],
  ladder: readonly PriceLevel[] | undefined,
  filedHere: boolean,
): TableFacts {
  const kind = kindOf(table)
  const leaf = leafNoun(table)
  const branch = branchNoun(table)
  const branches = branch ? distinctBranches(table, rows) : 0
  const leafSay = counted(rows.length, leaf)
  const branchSay = branch && branches > 0 ? `in ${counted(branches, branch)}` : null
  const holds = branchSay ? `${leafSay} ${branchSay}` : leafSay

  const whole = (table.description ?? '').trim()
  const line = provenanceLine(whole)
  let provenance: Provenance
  if (filedHere) {
    /* A TABLE MADE AT THIS DESK SAYS SO ON ITS ROW WHATEVER ITS
       DESCRIPTION SAYS. The customers register carries a description
       of its own, and a row that printed that sentence where every
       other row prints a workbook would read as though a workbook had
       brought it. The description is kept whole for the page. */
    const madeOn = dayOf(table.createdAt)
    provenance = {
      kind: 'desk',
      line: `${FILED_AT_THIS_DESK} · ${madeOn}`,
      whole,
      madeOn,
    }
  } else if (line === null) {
    provenance = { kind: 'none', line: null, whole: '' }
  } else {
    provenance = { kind: 'file', line, whole }
  }

  return {
    id: table.id,
    name: table.name,
    kind,
    kindWord: kindWord(kind),
    retired: isRetired(table),
    rows: rows.length,
    leaf,
    branch,
    branches,
    holds,
    leafSay,
    branchSay,
    columns: table.fields.length,
    costColumns: table.fields.filter((f) => isCostColumn(table, f)).length,
    levels: (ladder ?? table.priceLevels ?? []).map((l) => l.label),
    provenance,
  }
}

/** A join's two ends and its riders, in the file's own column order. */
function pairingOf(
  join: EntityDef,
  tables: Readonly<Record<string, EntityDef>>,
  rows: readonly RowData[],
): Pairing | null {
  const refs = join.fields.filter((f) => f.type === 'reference' && f.refEntityId)
  const owner = refs[0] ? tables[refs[0].refEntityId as string] : undefined
  const far = refs[1] ? tables[refs[1].refEntityId as string] : undefined
  if (!owner || !far) return null
  const extras = refs
    .slice(2)
    .map((f) => tables[f.refEntityId as string])
    .filter((t): t is EntityDef => t !== undefined)
    .map((t) => ({ id: t.id, name: t.name }))
  return {
    joinId: join.id,
    joinName: join.name,
    ownerId: owner.id,
    ownerName: owner.name,
    farId: far.id,
    farName: far.name,
    farKind: kindOf(far),
    extras,
    rows: rows.length,
    retired: isRetired(join),
  }
}

/**
 * The whole register, read off what loaded.
 *
 * ORDER. Plates and rows follow the places — the modules' own stored
 * order and each module's own table order (`placesOf`) — because that
 * is the dealer's order and not the storage engine's: read back out
 * of IndexedDB the tables arrive alphabetically, and a register whose
 * first plate changed between the first open and the second would be
 * a register nobody could learn. A base table in no module comes
 * last, under the desk's own place, in the order it was made.
 */
export function readTableRegister(
  tables: Readonly<Record<string, EntityDef>>,
  rows: Readonly<Record<string, readonly RowData[]>>,
  modules: Readonly<Record<string, ModuleDef>>,
  priceLevels: Readonly<Record<string, readonly PriceLevel[]>> = {},
): TableRegister {
  const all = Object.values(tables)
  const rowsOf = (id: string): readonly RowData[] => rows[id] ?? []

  /* the joins, by their own columns */
  const pairings: Pairing[] = []
  for (const t of all) {
    if (!isJoin(t)) continue
    const p = pairingOf(t, tables, rowsOf(t.id))
    if (p) pairings.push(p)
  }

  /* which base tables the places file, and in what order */
  const filed = new Set<string>()
  const placed: { table: EntityDef; placeId: string; place: string }[] = []
  const places = placesOf(
    modules as Record<string, ModuleDef>,
    tables as Record<string, EntityDef>,
    rows as Record<string, RowData[]>,
  )
  for (const place of places) {
    const module = modules[place.moduleId]
    const ids = place.tableId ? [place.tableId] : (module?.tableIds ?? [])
    for (const id of ids) {
      const table = tables[id]
      if (!table || isJoin(table) || filed.has(id)) continue
      filed.add(id)
      placed.push({ table, placeId: place.moduleId, place: place.moduleName })
    }
  }
  /* and the rest — made at this desk, in the order they were made */
  const desk = all
    .filter((t) => !isJoin(t) && !filed.has(t.id))
    .toSorted((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))
  for (const table of desk) placed.push({ table, placeId: 'desk', place: DESK_PLACE })

  /* the file, told from the desk by the one rule every screen that
     counts the file counts by */
  const file = priceFileOf(tables, modules)

  const facts: Record<string, TableFacts> = {}
  for (const t of all) {
    facts[t.id] = factsOf(
      t,
      rowsOf(t.id),
      priceLevels[t.id],
      !isJoin(t) && madeAtThisDesk(file, t.id),
    )
  }

  /* the plates: every base table whose kind is boat, in place order */
  const plates: Plate[] = []
  const listed: RegisterRow[] = []
  const runs = new Map<string, number>()
  for (const { table, placeId, place } of placed) {
    const f = facts[table.id]!
    if (f.kind === 'boat') {
      const mine = pairings.filter((p) => p.ownerId === table.id)
      plates.push({ ...f, pairings: mine, pairingRows: mine.reduce((n, p) => n + p.rows, 0) })
      continue
    }
    const naming = pairings.filter(
      (p) => p.farId === table.id || p.extras.some((x) => x.id === table.id),
    )
    const boats = [...new Set(naming.map((p) => p.ownerName))]
    const run = runs.get(placeId) ?? 0
    runs.set(placeId, run + 1)
    listed.push({
      ...f,
      place,
      placeId,
      leads: run === 0,
      placeSize: 0,
      headed: false,
      namedBy: { boats, pairings: naming.reduce((n, p) => n + p.rows, 0) },
    })
  }
  for (const row of listed) {
    row.placeSize = runs.get(row.placeId) ?? 1
    row.headed = row.leads && (row.placeSize > 1 || row.place !== row.name)
  }

  const theFile = countTables(file.tables, rows)
  const theDesk = countTables(file.desk, rows)

  return {
    head: {
      tables: theFile.tables,
      rows: theFile.rows,
      joins: theFile.joins,
      joinRows: theFile.joinRows,
      base: theFile.baseTables,
      baseRows: theFile.baseRows,
      boats: plates.filter((p) => !madeAtThisDesk(file, p.id)).length,
      desk: { tables: theDesk.tables, rows: theDesk.rows },
    },
    plates,
    rows: listed,
    pairings,
    facts,
  }
}

/* ---------------------------------------------------------- */
/* One page                                                    */
/* ---------------------------------------------------------- */

/** One pairing as a page lists it: the OTHER side, from where the
 *  page stands. A boat's page lists what pairs with it; a motor's
 *  page lists the boats that pair with it; a rigging kit's page lists
 *  the boat pairings it rides on. */
export interface PagePairing extends Pairing {
  /** the table on the other end from the page */
  otherId: string
  otherName: string
  /** how this table stands in the join: it owns it, it is the far
   *  side, or it rides along */
  standing: 'owner' | 'far' | 'rider'
}

export interface TablePage {
  facts: TableFacts
  pairings: PagePairing[]
  /** rows across those */
  pairingRows: number
  /** for a pairing list itself: its two ends and riders, by name */
  ends: { ownerName: string; farName: string; extras: string[] } | null
}

export function pageOf(register: TableRegister, tableId: string): TablePage | null {
  const facts = register.facts[tableId]
  if (!facts) return null
  const listed: PagePairing[] = []
  for (const p of register.pairings) {
    if (p.ownerId === tableId) {
      listed.push({ ...p, otherId: p.farId, otherName: p.farName, standing: 'owner' })
    } else if (p.farId === tableId) {
      listed.push({ ...p, otherId: p.ownerId, otherName: p.ownerName, standing: 'far' })
    } else if (p.extras.some((x) => x.id === tableId)) {
      listed.push({ ...p, otherId: p.ownerId, otherName: p.ownerName, standing: 'rider' })
    }
  }
  const self = register.pairings.find((p) => p.joinId === tableId)
  return {
    facts,
    pairings: listed,
    pairingRows: listed.reduce((n, p) => n + p.rows, 0),
    ends: self
      ? { ownerName: self.ownerName, farName: self.farName, extras: self.extras.map((x) => x.name) }
      : null,
  }
}

/* ---------------------------------------------------------- */
/* Finding one                                                 */
/* ---------------------------------------------------------- */

/** Every word has to hit something, and it may hit the name, the
 *  kind, the place or the workbook sentence — the four facts a row
 *  prints. The same rule `domain/quote/find` keeps for a quote. */
export function matchesTable(row: RegisterRow | Plate, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return true
  const hay = [
    row.name,
    row.kindWord,
    'place' in row ? row.place : TABLE_KINDS.boat.label,
    row.provenance.line ?? '',
    row.leaf.many,
  ]
    .join(' ')
    .toLowerCase()
  return words.every((w) => hay.includes(w))
}

/** What the register says when a query matches nothing. */
export const NOTHING_CALLED = (query: string): string =>
  `Nothing on this sheet is called “${query.trim()}”. A table answers to its name, its kind, its place or the workbook it came from.`
