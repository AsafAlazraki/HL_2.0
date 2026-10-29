/* ============================================================
   THE FIXES — every press on the Review screen, as a command
   through the catalogue's one door (`commands.ts`), so every one
   is one step with its own sentence, its own typed event, and its
   own way back from the toast.

   NOTHING HERE CHOOSES FOR THE DEALER. A re-band writes the one
   band whose own label admits the trailer's weight
   (`bandsAdmitting`), and only when exactly one does; the press is
   one trailer at a time, because `registration.ts`'s first
   requirement is "Never derive the band" and a band chosen for nine
   at once would be exactly that. A name is the name the dealer typed.
   ============================================================ */

import { batch, renameField, updateCell, type CatalogueCommand } from '@/domain/catalogue/commands'
import { money } from '@/domain/money'
import type { CellValue } from '@/domain/model'
import type { Reband } from './checks'

/** Why a re-band cannot be pressed, in the dealer's words; '' when it can. */
export function rebandRefusal(line: Reband): string {
  if (line.to) return ''
  if (line.admits.length > 1)
    return `At ${line.atmKg.toLocaleString('en-AU')} kg this trailer fits more than one rego type (${line.admits.join(', ')}), so which one is yours to choose in the price list.`
  return `No rego type on the fee list states a weight of ${line.atmKg.toLocaleString('en-AU')} kg, so which one is yours to choose in the price list.`
}

/**
 * ONE TRAILER, ONE STEP: its band, its fee and its Sell inc Rego, written together or not at
 * all (`batch`), so the toast's Undo puts all three back. `name` is how the screen says the
 * trailer; the sentence is the one the toast and the step keep.
 */
export function rebandCommand(line: Reband, name: string): CatalogueCommand | null {
  const to = line.to
  if (!to) return null
  const writes: CatalogueCommand[] = [
    updateCell(line.tableId, line.rowId, line.columns.band, to.band),
  ]
  if (line.columns.fee) writes.push(updateCell(line.tableId, line.rowId, line.columns.fee, to.fee))
  if (line.columns.sell && to.sell !== null)
    writes.push(updateCell(line.tableId, line.rowId, line.columns.sell, to.sell))
  const sells = to.sell !== null ? `, and sells at ${money(to.sell)}` : ''
  return batch(writes, {
    said: `${name} is registered ${to.word} at ${money(to.fee)}${sells}.`,
  })
}

/** A line with nothing to name it, named as the dealer typed it. */
export function nameLineCommand(
  tableId: string,
  tableName: string,
  rowId: string,
  fieldId: string,
  name: string,
): CatalogueCommand | null {
  const clean = name.replace(/\s+/g, ' ').trim()
  if (clean === '') return null
  return batch([updateCell(tableId, rowId, fieldId, clean)], {
    said: `A line in ${tableName} is now called “${clean}”.`,
  })
}

/** One of two things under one name, given a name of its own. */
export function nameTwinCommand(
  tableId: string,
  fieldId: string,
  was: string,
  name: string,
): CatalogueCommand | null {
  const clean = name.replace(/\s+/g, ' ').trim()
  if (clean === '' || clean === was) return null
  return batch([renameField(tableId, fieldId, clean)], {
    said: `One of the two called “${was}” is now “${clean}”.`,
  })
}

/* ============================================================
   THE CASE QUEUE'S WRITES (direction E, 2026-10-28): several lines
   that share one fix, written as ONE step, so one Undo takes the
   whole case back. Every figure is the one the dealer typed or the
   one a line he chose already carries — nothing here proposes one.
   ============================================================ */

/**
 * A PRICE AS A DEALER TYPES ONE: "2100", "$2,100", "2,100.50". A number above $0, to the cent,
 * or null when what was typed is not a price ('' is null too: nothing was typed).
 */
export function typedPrice(typed: string): number | null {
  const clean = typed.replace(/[$,\s]/g, '')
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null
  const n = Number(clean)
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Each line given the price the dealer typed for it, at the list's own price, in one step. */
export function priceLinesCommand(
  tableId: string,
  tableName: string,
  fieldId: string,
  priceName: string,
  lines: ReadonlyArray<{ rowId: string; name: string; price: number }>,
): CatalogueCommand | null {
  if (lines.length === 0) return null
  const writes = lines.map((l) => updateCell(tableId, l.rowId, fieldId, l.price))
  const only = lines.length === 1 ? lines[0] : undefined
  return batch(writes, {
    said: only
      ? `${only.name} is now ${money(only.price)} at ${priceName}.`
      : `${lines.length} lines in ${tableName} are now priced at ${priceName}.`,
  })
}

/** Each line given the name the dealer typed for it, in one step. */
export function nameLinesCommand(
  tableId: string,
  tableName: string,
  fieldId: string,
  lines: ReadonlyArray<{ rowId: string; name: string }>,
): CatalogueCommand | null {
  const named = lines
    .map((l) => ({ rowId: l.rowId, name: l.name.replace(/\s+/g, ' ').trim() }))
    .filter((l) => l.name !== '')
  if (named.length === 0) return null
  const only = named.length === 1 ? named[0] : undefined
  return batch(
    named.map((l) => updateCell(tableId, l.rowId, fieldId, l.name)),
    {
      said: only
        ? `A line in ${tableName} is now called “${only.name}”.`
        : `${named.length} lines in ${tableName} now have names.`,
    },
  )
}

/**
 * ONE NAME, ONE PRICE: every price the chosen line carries, copied onto the other lines of the
 * same name — the dealer chose which, by its price. Nothing else on either line moves.
 */
export function onePriceCommand(
  tableId: string,
  name: string,
  chosen: { levels: ReadonlyArray<{ fieldId: string; value: CellValue }>; price: number },
  others: ReadonlyArray<{ rowId: string }>,
): CatalogueCommand | null {
  if (others.length === 0) return null
  const writes = others.flatMap((o) =>
    chosen.levels.map((l) => updateCell(tableId, o.rowId, l.fieldId, l.value)),
  )
  return batch(writes, { said: `Every “${name}” now sells at ${money(chosen.price)}.` })
}
