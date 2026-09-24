/* ============================================================
   THE PRICE FILE, TOLD APART FROM WHAT WAS MADE AT THIS DESK — the
   one rule every screen that counts the file counts by.

   WHY IT EXISTS (the critique of Milestone 2's close, blocker 2). The
   customers book is a table on the sheet: the day the first person is
   filed, `createTable` makes it beside the file's own 53. Every screen
   that counted the file was counting the SHEET — `Object.keys(tables)`
   — so filing M. Duffy turned Home's "64 Labour Rates · Oils &
   Consumables · Registration Costs" into 65, its masthead into 54
   tables and 15,692 rows, its field into "Search 15,692 rows", /quotes
   and /history into "Priced from the Master Price File · 54 tables",
   and set the book on Data beside the fingerprint of a file that had
   53. A false figure on the showroom, and a larger one with every name
   filed.

   THE RULE. A table the file brought is filed in a place. The nine
   places are minted from the file's own table keys in the same breath
   the file lands (`@/data/pack/boot`), and `modules/mint.ts` promises
   that every base table of the file belongs to one — the retired
   trailers included. So:

     · a BASE table no place files was made at this desk: the customers
       book, or a register pressed into being on Data;
     · a JOIN is the file's until one of the tables it links is the
       desk's, and the desk's from then on.

   It is the rule Data already printed a row by — "Filed at this desk"
   (`modules/register.ts`) — lifted out so Home, the pill, Data's head,
   the quotes register and the diary count by the same one, and no two
   of them can disagree about how big the file is.

   A SHEET WITH NO PLACES SHOWS NO FILE. Nothing on it says any table
   came from a price file, so every table is counted as the desk's.
   That is the answer Data's register already gave such a sheet, and
   the app never makes one: a file never lands without its places.

   NOTHING IS TAKEN OFF THE SHEET. This is a reading. The book stays a
   table, on Data under the desk's own place and on Customers as a book
   of people; it is simply not the price file, and not a thing the
   business sells.
   ============================================================ */
import type { EntityDef, ModuleDef, RowData } from '@/domain/model'

export interface PriceFile {
  /** the tables the file brought, joins included, by id */
  tables: Record<string, EntityDef>
  /** the tables made at this desk, by id */
  desk: Record<string, EntityDef>
}

/** The price file's size, every figure the length of a row list that loaded. */
export interface PriceFileCount {
  /** every table the file brought, joins included */
  tables: number
  /** every row in those */
  rows: number
  /** the tables that record what fits what */
  joins: number
  joinRows: number
  /** the rest: the registers of things */
  baseTables: number
  baseRows: number
}

const isJoin = (table: EntityDef): boolean => table.role === 'join'

/** The tables a join links, by its own reference columns. */
const linkedBy = (join: EntityDef): string[] =>
  join.fields.flatMap((f) => (f.type === 'reference' && f.refEntityId ? [f.refEntityId] : []))

/** The file's tables and the desk's, apart. Each keeps the order it was handed in. */
export function priceFileOf(
  tables: Readonly<Record<string, EntityDef>>,
  modules: Readonly<Record<string, ModuleDef>>,
): PriceFile {
  const placed = new Set<string>()
  for (const place of Object.values(modules)) for (const id of place.tableIds) placed.add(id)

  const all = Object.values(tables)
  const deskBase = new Set(all.filter((t) => !isJoin(t) && !placed.has(t.id)).map((t) => t.id))

  const file: Record<string, EntityDef> = {}
  const desk: Record<string, EntityDef> = {}
  for (const table of all) {
    const ours = isJoin(table)
      ? !linkedBy(table).some((id) => deskBase.has(id))
      : !deskBase.has(table.id)
    if (ours) file[table.id] = table
    else desk[table.id] = table
  }
  return { tables: file, desk }
}

/** Whether one table is the desk's rather than the file's. */
export const madeAtThisDesk = (file: PriceFile, tableId: string): boolean =>
  file.desk[tableId] !== undefined

/** How big a set of tables is, counted off the rows that loaded. */
export function countTables(
  tables: Readonly<Record<string, EntityDef>>,
  rows: Readonly<Record<string, readonly RowData[]>>,
): PriceFileCount {
  const count: PriceFileCount = {
    tables: 0,
    rows: 0,
    joins: 0,
    joinRows: 0,
    baseTables: 0,
    baseRows: 0,
  }
  for (const table of Object.values(tables)) {
    const held = rows[table.id]?.length ?? 0
    count.tables += 1
    count.rows += held
    if (isJoin(table)) {
      count.joins += 1
      count.joinRows += held
    } else {
      count.baseTables += 1
      count.baseRows += held
    }
  }
  return count
}

/** The price file's own size: what Home's masthead, the pill's Data door,
 *  Data's head, the quotes register and the diary print. */
export const countPriceFile = (
  tables: Readonly<Record<string, EntityDef>>,
  rows: Readonly<Record<string, readonly RowData[]>>,
  modules: Readonly<Record<string, ModuleDef>>,
): PriceFileCount => countTables(priceFileOf(tables, modules).tables, rows)
