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
import { aisleOf, type PartIn } from '@/domain/catalogue/aisles'
import { lineAmount, mintLine } from '@/domain/quote'
import { lineSaid, nameFirst } from '@/domain/quote/spoken'
import { copyOf, creditOf, itemOf, srcSetOf } from '@/data/pictures'

/** The register the chandlery is built on: the price list's own parts and accessories. */
export const PARTS_TABLE = 'parts'

/** One part on the shelf, before it is priced. */
export interface ShelfPart extends PartIn {
  row: RowData
  aisle: string
  maker: string
  /** the price list's own product words, for the search and the picture's caption */
  product: string
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
  /** its own picture, or null — never another part's */
  picture: { src: string; width: number; height: number; srcSet?: string; credit: string } | null
}

/** The parts register, where the price list has one. */
export function partsTable(ctx: CatalogueCtx): EntityDef | undefined {
  return ctx.entities[PARTS_TABLE]
}

const text = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')

/** Every part on sale, in the price list's own order, with its aisle and maker. */
export function shelfOf(ctx: CatalogueCtx): ShelfPart[] {
  const table = partsTable(ctx)
  if (!table) return []
  const heading = table.hierarchy?.[0] ?? `${PARTS_TABLE}.cat`
  const supplier = table.fields.find((f) => /^supplier$/i.test(f.name))?.id
  const product = table.fields.find((f) => /^product$/i.test(f.name))?.id
  return sellableRows(ctx.rowsByEntity[table.id] ?? []).map((row) => {
    const h = text(row.values[heading])
    return {
      id: row.id,
      heading: h,
      row,
      aisle: aisleOf(h),
      maker: supplier ? text(row.values[supplier]) : '',
      product: product ? text(row.values[product]) : '',
    }
  })
}

/** Whether a part has its own picture, as the one reader answers. */
export function hasPicture(id: string): boolean {
  return copyOf(itemOf(PARTS_TABLE, id)) !== null
}

/** THE WORDS A SEARCH ANSWERS TO: the part's name, never its code (the board: "A name, never a
 *  code"). Every word typed must be in it. */
export function matchesName(part: ShelfPart, query: string): boolean {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w !== '')
  if (words.length === 0) return true
  const hay = part.product.toLowerCase()
  return words.every((w) => hay.includes(w))
}

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
    const held = copyOf(itemOf(PARTS_TABLE, part.id, line.image?.src))
    const srcSet = held ? srcSetOf(held) : undefined
    return {
      id: part.id,
      name: nameFirst(lineSaid(line.label, table.name), line.code),
      amount: lineAmount(line).amount,
      line,
      picture: held
        ? {
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
