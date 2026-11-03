/* ============================================================
   NAME THE WAY A LIST IS PRICED — every price a way names, written on
   every list of the column, as ONE step with its exact way back.

   WHY A COMMAND OF ITS OWN (the judge of Prices, 2026-11-04, L6).
   `namePrice` names one price on one list. A way can name three on a
   list — Rigging Kits supplied-or-fitted is Cash at Kit Sell Price,
   Trade at the kit's Trade Price and Fitted at the kit and fitting's
   Sell Price — and changing to "Always fitted" must take the fitted
   price OFF, or a kit sold always fitted would still offer a second
   fitted figure on the quote. No command took a price off a ladder.
   This one sets the prices a list's ways decide (`owned`: the keys any
   of its ways names) to exactly the chosen way's, and leaves every
   other price the list carries as it was: a motor's Trade Price is not
   the Yamahas' question, so choosing RRP + Freight leaves it alone.

   WHAT A PRICE CONTAINS TRAVELS WITH ITS COLUMN, as `namePrice` says:
   a price pointed at the column it already read keeps what it held and
   the dealer's answer on who may read it; pointed at a new column, it
   takes what the price list is known to carry there (`namedLevelsFor`)
   and starts with the engine's own answer on reach.

   A LADDER IS WRITTEN IN BOTH PLACES IT LIVES — the table's own
   `priceLevels` and the filed `priceLevels[tableId]` — as
   `priceCommands.ts` writes it. Its way back puts exactly those objects
   back.

   Pure: no React, no store. The clock is the one the store hands in.
   ============================================================ */

import { newId } from '@/domain/id'
import { CASH, cannotBePrice, ladderOn } from '@/domain/catalogue/priceCommands'
import { namedLevelsFor } from '@/domain/quote/pricing'
import { TABLE_GONE, COLUMN_GONE } from '@/domain/catalogue/commands'
import type { CatalogueChange, CatalogueCommand, CatalogueEvent } from '@/domain/catalogue/commands'
import type { CatalogueData } from '@/domain/catalogue/sheet'
import type { EntityDef, PriceLevel } from '@/domain/model'

/** One list's share of a way: the prices it names there, by that list's own columns. */
export interface WayOnList {
  tableId: string
  rungs: Array<{ key: string; fieldId: string }>
}

interface Was {
  tableId: string
  table: EntityDef
  filed: PriceLevel[] | undefined
}

function eventOf(
  at: string,
  said: string,
  changed: CatalogueChange[],
  table?: EntityDef,
): CatalogueEvent {
  return {
    id: newId(),
    kind: 'prices-changed',
    at,
    said,
    label: table ? `Prices changed · ${table.name}` : 'Prices changed',
    ...(table ? { tableId: table.id, tableName: table.name } : {}),
    changed,
  }
}

/** Put the lists' ladders back exactly as they were; its own way back is the state it found. */
function restore(was: readonly Was[], said: string): CatalogueCommand {
  return (data, now) => {
    const present = was.filter((w) => data.tables[w.tableId])
    if (present.length === 0) return { refused: '' }
    const back: Was[] = present.map((w) => ({
      tableId: w.tableId,
      table: data.tables[w.tableId]!,
      filed: data.priceLevels[w.tableId],
    }))
    const tables = { ...data.tables }
    const priceLevels = { ...data.priceLevels }
    for (const w of present) {
      tables[w.tableId] = w.table
      if (w.filed === undefined) delete priceLevels[w.tableId]
      else priceLevels[w.tableId] = w.filed
    }
    return {
      next: { ...data, tables, priceLevels },
      inverse: restore(back, said),
      said,
      event: eventOf(
        now,
        said,
        present.map((w) => ({
          path: `${w.tableId}.priceLevels`,
          from: 'changed',
          to: 'as it was',
        })),
        present.length === 1 ? present[0]!.table : undefined,
      ),
    }
  }
}

/** The order a ladder is read in: Cash first, then Trade, then the rest as they stood. */
const ORDER = [CASH, 'trade']
const rank = (key: string): number => {
  const i = ORDER.indexOf(key)
  return i < 0 ? ORDER.length : i
}

/**
 * EVERY LIST OF A COLUMN PRICED THE CHOSEN WAY, as one step. `owned` are the keys the list's ways
 * decide between; on each list they are set to exactly the way's prices, every other price kept.
 * Nothing changing is no step at all (''); a column that cannot be a price is refused with its
 * sentence.
 */
export function nameWay(
  lists: readonly WayOnList[],
  owned: readonly string[],
  said: string,
): CatalogueCommand {
  return (data: CatalogueData, now: string) => {
    const was: Was[] = []
    const changed: CatalogueChange[] = []
    const tables = { ...data.tables }
    const priceLevels = { ...data.priceLevels }
    for (const list of lists) {
      const table = data.tables[list.tableId]
      if (!table) return { refused: TABLE_GONE }
      const ladder = ladderOn(data, table)
      const next: PriceLevel[] = ladder.filter(
        (l) => !owned.includes(l.key) || list.rungs.some((r) => r.key === l.key),
      )
      for (const r of list.rungs) {
        const field = table.fields.find((f) => f.id === r.fieldId)
        if (!field) return { refused: COLUMN_GONE }
        const why = cannotBePrice(table, field)
        if (why) return { refused: why }
        const at = next.findIndex((l) => l.key === r.key)
        const had = at >= 0 ? next[at] : undefined
        const sameColumn = had?.fieldId === field.id
        const contains = sameColumn
          ? had?.contains
          : namedLevelsFor(table).find((l) => l.fieldId === field.id)?.contains
        const rung: PriceLevel = {
          key: r.key,
          label: field.name,
          fieldId: field.id,
          scope: had?.scope ?? (r.key === CASH || r.key === 'trade' ? 'quote' : 'line'),
          ...(contains ? { contains } : {}),
          ...(sameColumn && had?.mayReachCustomer !== undefined
            ? { mayReachCustomer: had.mayReachCustomer }
            : {}),
          named: true,
        }
        if (had) next[at] = rung
        else next.push(rung)
        if (!(sameColumn && had?.named === true))
          changed.push({
            path: `${table.id}.priceLevels.${r.key}`,
            from: had?.fieldId ?? null,
            to: field.id,
          })
      }
      for (const l of ladder)
        if (!next.some((x) => x.key === l.key))
          changed.push({ path: `${table.id}.priceLevels.${l.key}`, from: l.fieldId, to: null })
      const ordered = next
        .map((l, i) => ({ l, i }))
        .toSorted((a, b) => rank(a.l.key) - rank(b.l.key) || a.i - b.i)
        .map((x) => x.l)
      was.push({ tableId: table.id, table, filed: data.priceLevels[table.id] })
      tables[table.id] = { ...table, priceLevels: ordered, updatedAt: now }
      priceLevels[table.id] = ordered
    }
    if (changed.length === 0) return { refused: '' }
    return {
      next: { ...data, tables, priceLevels },
      inverse: restore(was, said),
      said,
      event: eventOf(now, said, changed, was.length === 1 ? was[0]!.table : undefined),
    }
  }
}
