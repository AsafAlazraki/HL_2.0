/* ============================================================
   WHAT THE FINDER CAN SAY ABOUT A LINE THE MATCHER FOUND — the boat
   it is a version of, its price, and the ink of its kind.

   Written 2026-09-24 for the critique of Milestone 2's close, #8. The
   finder's grammar (`src/domain/shell/finder.ts`) turns a found boat
   into something to sell, and to do that it has to know which lines of
   the file are ONE boat. That is the picker's question, answered once
   in `src/screens/picker/fleet.ts` — "SP560" is fifteen lines under
   Sport ▸ SP560 — and the critique's #11 is exactly what happens when a
   second screen answers it a second way (Home sold a photograph the
   build said it did not have). So this reads the picker's own fleet
   and never groups a line itself. The key it hands on is the picker's
   own key, which is what `/quote/new?model=` carries.

   THE PRICE IS THE LIST'S OWN FIRST RUNG, through `priceReadOf` — the
   reader the catalogue index already uses, which refuses a cost column
   and a forbidden band by construction (`src/domain/modules/read.ts`).
   A boat's figure is the fleet's, which is the quote engine's own read
   at the rung a quote opens at. A zero is not a price, and a line no
   longer sold has none to offer.

   NOTHING HERE IS BUILT UNTIL THE FINDER ASKS, and it is built once
   per reading of the sheet: `Shell.tsx` memoises it on the store's
   own references while the finder is open.
   ============================================================ */
import {
  isDiscontinued,
  readCell,
  type AccentKey,
  type EntityDef,
  type RowData,
} from '@/domain/model'
import { priceReadOf } from '@/domain/modules/read'
import type { FinderBoat, FinderLines } from '@/domain/shell/finder'
import { fleetOf } from '@/screens/picker/fleet'

export function readLines(
  tables: Readonly<Record<string, EntityDef>>,
  rows: Readonly<Record<string, readonly RowData[]>>,
  rowById: Readonly<Record<string, RowData>>,
): FinderLines {
  const boats = new Map<string, FinderBoat>()
  for (const brand of fleetOf(tables, rows).brands) {
    for (const model of brand.models) {
      for (const version of model.variants) {
        boats.set(version.rowId, {
          model: model.key,
          /* AS A PERSON SAYS IT (built-critique-m2-close-2.md, the one
             thing to change first): "Sport 560", and a version "Sport 560 ·
             Hypalon · Black / Black / Black", beside the maker's name in the
             line's fact — the file's own string is the line the finder adds
             for the dealer */
          modelName: model.shown,
          maker: model.register,
          name: version.shown,
          versions: model.rows,
          amount: version.amount,
        })
      }
    }
  }

  /* the price column, resolved once per list rather than once per line */
  const priceField = new Map<string, string | null>()
  const priceFieldOf = (tableId: string): string | null => {
    const held = priceField.get(tableId)
    if (held !== undefined) return held
    const table = tables[tableId]
    const read = table ? priceReadOf(table) : undefined
    const id = read ? read.field.id : null
    priceField.set(tableId, id)
    return id
  }

  return {
    boat: (tableId, rowId) => {
      const boat = boats.get(rowId)
      return boat && tables[tableId] ? boat : null
    },
    price: (tableId, rowId) => {
      const boat = boats.get(rowId)
      if (boat) return boat.amount
      const row = rowById[rowId]
      const fieldId = priceFieldOf(tableId)
      if (!row || fieldId === null || isDiscontinued(row)) return null
      const v = readCell(row, fieldId)
      return typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null
    },
    ink: (tableId): AccentKey => tables[tableId]?.accent ?? 'graphite',
  }
}
