/* ============================================================
   WHAT A QUOTE SELLS, AND THE WORD FOR IT.

   THE OWNER, 2026-10-30: "quotes are not just boats - also motors or
   trailers or even dealer fit things as well". New quote mints a quote
   on a Yamaha, a Dunbier trailer or a sand anchor exactly as it mints
   one on a boat; only the table the quote is rooted on differs. The
   build said the subject as a boat wherever it named it ("No other
   finish of this boat", "Nothing from Formosa is made for this boat",
   "Not chosen yet: hull") and offered boats in a chapter called "The
   hull" on a repower (docs/directions/quote-page/start-needs.md).

   So every surface asks this once: is the quote for a boat, and if
   not, what one of the things it sells is called. The word is the
   register's own (`leafNoun`: the naming column the dealer headed,
   "Motor", "Trailer", "Product", "Package"), never one typed here. A
   boat register's naming column says "Model" or "Variant", which is a
   word about the file rather than the thing, so a boat is a boat.

   AND WHAT OF ITS COLUMNS ARE THE THING'S. A boat's register is its
   maker's specification, read by `specSay`. A list sold on its own
   carries the dealership's record beside the thing: the flag that it
   is no longer sold, the supplier, the codes, and on Dealer Fit
   Packages the labour, the sundries and the gross profit — measured on
   2026-10-31, a Minn Kota package's strip read "GP $847.19" under its
   photograph. `goodsSpecs` keeps only what describes the thing: never
   money (the grid's own adjudication, `isMoney`), never a cost column,
   never the record.
   ============================================================ */

import { DISCONTINUED_FIELD_ID, type CatalogueCtx, type EntityDef } from '@/domain/model'
import type { TableKind } from '@/domain/model'
import { leafNoun } from '@/domain/catalogue/table/grouping'
import { bandOf, isMoney, splitUnit } from '@/domain/catalogue/views/columns'
import { isCostColumn } from './pricing'

export interface Sells {
  /** the quote is for a boat: its first chapter is the hull, and a boat's words are right */
  boat: boolean
  /** the kind of the table it is rooted on */
  kind: TableKind
  /** one of what it sells, as a person says it — "boat", "motor", "trailer", "product" */
  noun: string
}

/** What a quote is for, read off the table it is rooted on. A quote whose table is no longer on
 *  the sheet is read as it was always read, a boat's. */
export function quoteSells(ctx: CatalogueCtx, quote: { rootTableId: string }): Sells {
  const root = ctx.entities[quote.rootTableId]
  const kind: TableKind = root?.kind ?? 'boat'
  if (!root || kind === 'boat') return { boat: true, kind: 'boat', noun: 'boat' }
  return { boat: false, kind, noun: leafNoun(root).one }
}

/** "The motor", the heading its chapter carries. */
export const headingOf = (sells: Sells): string => (sells.boat ? 'The hull' : `The ${sells.noun}`)

/** The record's own columns, which describe the dealership's list rather than the thing. */
const THE_RECORD = /^(supplier|source|.*\bcodes?)$/i

/**
 * THE SPECIFICATIONS OF A THING SOLD ON ITS OWN, without the dealership's record: what the build
 * shows under its picture. Each spec is matched to the column it was read from by the label the
 * freeze gives it (the column's name without its unit); a spec that matches no column (a range
 * said over two) is a measure and is kept.
 */
export function goodsSpecs<T extends { label: string }>(
  entity: EntityDef | undefined,
  specs: readonly T[],
): T[] {
  if (!entity) return [...specs]
  return specs.filter((spec) => {
    const label = spec.label.trim().toLowerCase()
    const fields = entity.fields.filter(
      (f) =>
        f.name.trim().toLowerCase() === label ||
        splitUnit(f.name).base.trim().toLowerCase() === label,
    )
    if (THE_RECORD.test(spec.label.trim())) return false
    return !fields.some(
      (f) =>
        f.id === DISCONTINUED_FIELD_ID ||
        isMoney(f.name, bandOf(entity, f)) ||
        isCostColumn(entity, f),
    )
  })
}
