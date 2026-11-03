/* ============================================================
   WHAT THE CHANDLERY DRAWS, READ ONCE PER SHEET — every part on sale
   as a WARE: its name as a person says it, its two prices, what kind
   of line it is, its supplier in Northside's words, its own picture or
   none, and the boats the price list makes it for.

   Every figure is the engine's own: a price is the part minted at a
   declared price by `mintLine` (`pricerFor`, shelf.ts), exactly as a
   quote would carry it, so no cost column is read and nothing is
   rounded here. The pure readings are the domain's
   (`src/domain/chandlery/*`); this file only binds them to the
   pictures and the pricer, which the domain may not reach.

   Pricing a part mints a line, so it is done for the parts a page
   shows — an aisle, a find's answer — and never for the whole list on
   the way in.
   ============================================================ */
import type { CatalogueCtx, EntityDef } from '@/domain/model'
import { isDiscontinued, rowLabel } from '@/domain/model'
import { spokenBoat } from '@/domain/quote/spoken'
import {
  lineKindOf,
  twoKeysOf,
  twoPrices,
  type LineKind,
  type TwoPrices,
} from '@/domain/chandlery/prices'
import { supplierSaid, type SupplierNames } from '@/domain/chandlery/suppliers'
import { madeForOf, type MadeFor } from '@/domain/chandlery/madeFor'
import { pricerFor, partsTable, type PartTile, type ShelfPart } from './shelf'

/** One part as the chandlery draws it. */
export interface Ware extends ShelfPart {
  /** the name as a person says it: "Sand Anchor Kit · 4lb" */
  name: string
  prices: TwoPrices
  kind: LineKind
  /** the supplier in Northside's words, or the code as the file writes it */
  supplier: string
  /** the part's tile at the supply price: its picture, its gallery's item */
  tile: PartTile | null
}

/** THE TWO PRICERS, one per declared price, built once per sheet. */
export interface Pricers {
  supply: ((part: ShelfPart) => PartTile | null) | null
  fitted: ((part: ShelfPart) => PartTile | null) | null
  /** the price's own names, as Prices declares them, for the sentence that says what they are */
  supplyLabel: string
  fittedLabel: string
}

export function pricersOf(ctx: CatalogueCtx): Pricers {
  const table = partsTable(ctx)
  const keys = twoKeysOf(table ? (ctx.priceLevels[table.id] ?? table.priceLevels) : undefined)
  return {
    supply: keys.supply ? pricerFor(ctx, keys.supply.key) : null,
    fitted: keys.fitted ? pricerFor(ctx, keys.fitted.key) : null,
    supplyLabel: keys.supply?.label ?? '',
    fittedLabel: keys.fitted?.label ?? '',
  }
}

/** ONE PART, PRICED AND NAMED: what a line or a card draws. */
export function wareOf(part: ShelfPart, pricers: Pricers, named: SupplierNames | undefined): Ware {
  const s = pricers.supply?.(part) ?? null
  const f = pricers.fitted?.(part) ?? null
  const tile = s ?? f
  return {
    ...part,
    name: tile?.name ?? part.product,
    prices: twoPrices(s?.amount ?? null, f?.amount ?? null, part.install),
    kind: lineKindOf(part.product),
    supplier: supplierSaid(part.maker, named),
    tile,
  }
}

/** A boat as the chip and the opened line say it: "Stacer 529 Assault Pro (Tournament)". */
export interface BoatSaid {
  id: string
  tableId: string
  name: string
  detail: string
  /** the name and what the price list adds after it: "Stacer 529 Assault Pro · Tournament" */
  full: string
}

/** Every boat line on the price list, by its id, named as a person says it. */
export function boatsById(ctx: CatalogueCtx): ReadonlyMap<string, BoatSaid> {
  const out = new Map<string, BoatSaid>()
  for (const entity of Object.values(ctx.entities) as EntityDef[]) {
    if (entity.kind !== 'boat') continue
    for (const row of ctx.rowsByEntity[entity.id] ?? []) {
      const spoken = spokenBoat(entity.id, rowLabel(entity, row))
      const detail = isDiscontinued(row)
        ? [spoken.detail, 'no longer sold'].filter((w) => w !== '').join(' · ')
        : spoken.detail
      out.set(row.id, {
        id: row.id,
        tableId: entity.id,
        name: spoken.name,
        detail,
        full: detail === '' ? spoken.name : `${spoken.name} · ${detail}`,
      })
    }
  }
  return out
}

/** What the price list makes for each boat, read off its own lists of pairs. */
export function madeForIn(ctx: CatalogueCtx): MadeFor | null {
  const table = partsTable(ctx)
  return table ? madeForOf(ctx.entities, ctx.rowsByEntity, table.id) : null
}

/** THE PLACE THAT SELLS THE PARTS, and whether a quote may start from it today. */
export interface PartsPlace {
  id: string
  name: string
  quotes: boolean
}

export function partsPlaceOf(ctx: CatalogueCtx): PartsPlace | null {
  const table = partsTable(ctx)
  if (!table) return null
  const place = Object.values(ctx.modules).find((m) => m.tableIds.includes(table.id))
  return place
    ? { id: place.id, name: place.name, quotes: place.capabilities.includes('quote') }
    : null
}
