/* ============================================================
   THE CHANDLERY'S SHELF — every part and accessory the price list
   sells, as the chandlery reads it: its heading (so its aisle), its
   maker as the file writes it, its name as a person says it, its own
   picture where the ledger holds one, and its price at the level the
   quote is on (Cash on /catalogue). Read off the catalogue store's
   context; the aisles and every count are the domain's
   (`src/domain/catalogue/aisles.ts`), never summed here.

   A PRICE IS A SELL PRICE AT A DECLARED LEVEL, minted by the engine's
   own `mintLine` exactly as the build mints a line it puts on a quote,
   so the figure on the tile is the figure the quote will carry and no
   cost column is ever read (CLAUDE.md, Honesty).
   ============================================================ */

import type { CatalogueCtx, EntityDef, QuoteLine, RowData } from '@/domain/model'
import { makeEngine } from '@/domain/catalogue/views/pairs'
import { sellableRows } from '@/domain/catalogue/views/sellable'
import { type PartIn } from '@/domain/catalogue/aisles'
import { aisleWithPlacings } from '@/domain/chandlery/placing'
import { lineAmount, mintLine } from '@/domain/quote'
import { lineSaid, nameFirst } from '@/domain/quote/spoken'
import { copyOf, creditOf, itemOf, srcSetOf, type Item } from '@/data/pictures'

/** The register the chandlery is built on: the price list's own parts and accessories. */
export const PARTS_TABLE = 'parts'

/** One part on the shelf, before it is priced. */
export interface ShelfPart extends PartIn {
  /** the heading the price list files it under, '' where it gives none */
  heading: string
  row: RowData
  aisle: string
  maker: string
  /** the price list's own product words, for the search and the picture's caption */
  product: string
  /** the code the shop orders it by, the workbook's operation code, and how it is fitted, as the
   *  price list writes them ('' where it writes none) */
  code: string
  op: string
  install: string
}

/** One part as a tile draws it. */
export interface PartTile {
  id: string
  /** the name as a person says it */
  name: string
  /** its sell price at the level, or null where the price list gives it none */
  amount: number | null
  /** the line the press puts on the quote, at that level */
  line: QuoteLine
  /** the part as the one reader is asked about it: its gallery's row */
  item: Item
  /** its own picture — its cover where it is exactly this part — or null; never another part's */
  picture: {
    id: string
    src: string
    width: number
    height: number
    srcSet?: string
    credit: string
  } | null
}

/** The parts register, where the price list has one. */
export function partsTable(ctx: CatalogueCtx): EntityDef | undefined {
  return ctx.entities[PARTS_TABLE]
}

const text = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')
/** a code may be written as a number (46070): read as the shop writes it */
const said = (v: unknown): string => (typeof v === 'number' ? String(v) : text(v))

/** Every part on sale, in the price list's own order, with its aisle and maker. */
export function shelfOf(ctx: CatalogueCtx): ShelfPart[] {
  const table = partsTable(ctx)
  if (!table) return []
  const heading = table.hierarchy?.[0] ?? `${PARTS_TABLE}.cat`
  const supplier = table.fields.find((f) => /^supplier$/i.test(f.name))?.id
  const product = table.fields.find((f) => /^product$/i.test(f.name))?.id
  const named = (name: RegExp): string | undefined =>
    table.fields.find((f) => name.test(f.name))?.id
  const code = named(/^code$/i)
  const op = named(/^operation code$/i)
  const install = named(/^install type$/i)
  /* WHERE NORTHSIDE PUT A HEADING NO AISLE NAMES (src/domain/chandlery/placing.ts) */
  const placed = ctx.org?.aisles
  return sellableRows(ctx.rowsByEntity[table.id] ?? []).map((row) => {
    const h = text(row.values[heading])
    return {
      id: row.id,
      heading: h,
      row,
      aisle: aisleWithPlacings({ id: row.id, heading: h }, placed),
      maker: supplier ? text(row.values[supplier]) : '',
      product: product ? text(row.values[product]) : '',
      code: code ? said(row.values[code]) : '',
      op: op ? said(row.values[op]) : '',
      install: install ? text(row.values[install]) : '',
    }
  })
}

/** Whether a part has its own picture, as the one reader answers. */
export function hasPicture(id: string): boolean {
  return copyOf(itemOf(PARTS_TABLE, id)) !== null
}

/** WHERE A PART STANDS, for `aislesOf`: the aisle the shelf read for it, Northside's placing
 *  included. */
export const shelfAisle = (part: PartIn): string => (part as ShelfPart).aisle

/** A pricer for one level, made once per shelf: the engine is built once, not per tile. */
export function pricerFor(
  ctx: CatalogueCtx,
  levelKey: string,
): (part: ShelfPart) => PartTile | null {
  const table = partsTable(ctx)
  if (!table) return () => null
  const engine = makeEngine(ctx)
  return (part) => {
    const line = mintLine({ ctx, engine, entity: table, row: part.row, levelKey })
    const item = itemOf(PARTS_TABLE, part.id, line.image?.src)
    const held = copyOf(item)
    const srcSet = held ? srcSetOf(held) : undefined
    return {
      id: part.id,
      name: nameFirst(lineSaid(line.label, table.name), line.code),
      amount: lineAmount(line).amount,
      line,
      item,
      picture: held
        ? {
            id: held.id,
            src: held.src,
            width: held.width,
            height: held.height,
            ...(srcSet ? { srcSet } : {}),
            credit: creditOf(held),
          }
        : null,
    }
  }
}
