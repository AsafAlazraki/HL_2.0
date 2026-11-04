/* ============================================================
   WHO CHOSE A LIST'S PRICE, AND WHEN — KEPT, NOT ONLY FOR THE SESSION.

   WHY THIS EXISTS (the verifier of Prices, 2026-11-04). "Asaf chose
   it at 8:28 am today" was read off the store's session steps, and
   after a reload the settled list said only "You chose Sell". The
   catalogue already keeps who last wrote each cell on this computer
   (`domain/catalogue/table/stamps.ts`, a record per cell, kept with
   the price list). A list's price choice is kept the same way: one
   stamp per list, under a row id no line of the list can carry
   (`prices:<table>`), written by the step that named, changed or put
   back the list's prices — the way back included, because the way
   back is the last act that set them.

   A REACH SWITCH IS NOT A CHOICE OF PRICE: a step whose only change
   is who may read a price (`….mayReachCustomer`) stamps nothing.

   Pure. The store hands each step's event in and keeps what comes
   back; nothing here reads a clock or a name.
   ============================================================ */

import type { CatalogueEvent } from '@/domain/catalogue/commands'
import { stampId, type CellStamp, type Stamps } from '@/domain/catalogue/table/stamps'

/** The row id a list's price choice is kept under: no line of any list carries it. */
export const choiceRow = (tableId: string): string => `prices:${tableId}`
const CHOICE_FIELD = 'ladder'

/** `<table>.priceLevels` (a way back) or `<table>.priceLevels.<key>` (a price named or taken off) */
const CHOICE_PATH = /^(.+)\.priceLevels(?:\.([^.]+))?$/

/** The lists whose price one step chose, with the who and when it was taken under. */
function listsChosen(
  e: CatalogueEvent,
  by?: string,
  at?: string,
): Array<{ tableId: string; at: string; by?: string }> {
  const whoNow = e.by ?? by
  const whenNow = e.at || at || ''
  if (e.events && e.events.length > 0)
    return e.events.flatMap((inner) => listsChosen(inner, whoNow, whenNow))
  if (e.kind !== 'prices-changed' && e.kind !== 'undone' && e.kind !== 'redone') return []
  const ids = new Set<string>()
  for (const c of e.changed) {
    const m = CHOICE_PATH.exec(c.path)
    if (m) ids.add(m[1]!)
  }
  return [...ids].map((tableId) => ({
    tableId,
    at: whenNow,
    ...(whoNow ? { by: whoNow } : {}),
  }))
}

/** The stamps after one step, with each list whose price it chose stamped. The same object back
 *  when it chose none, so a store that writes by identity writes nothing. */
export function pricesStamped(stamps: Stamps, e: CatalogueEvent, orgId: string): Stamps {
  const lists = listsChosen(e)
  if (lists.length === 0) return stamps
  const next: Record<string, CellStamp> = { ...stamps }
  for (const l of lists) {
    const rowId = choiceRow(l.tableId)
    const id = stampId(rowId, CHOICE_FIELD)
    next[id] = {
      id,
      orgId,
      rowId,
      fieldId: CHOICE_FIELD,
      at: l.at,
      ...(l.by ? { by: l.by } : {}),
    }
  }
  return next
}

/** WHO LAST CHOSE THE PRICE OF ANY OF THESE LISTS, AND WHEN, where it is kept; null where it is
 *  not (a choice made before this was kept, or on another computer). */
export function chosenOf(
  stamps: Stamps,
  tableIds: readonly string[],
): { at: string; by?: string } | null {
  let last: CellStamp | null = null
  for (const tableId of tableIds) {
    const s = stamps[stampId(choiceRow(tableId), CHOICE_FIELD)]
    if (s && (!last || s.at > last.at)) last = s
  }
  if (!last) return null
  return last.by ? { at: last.at, by: last.by } : { at: last.at }
}
