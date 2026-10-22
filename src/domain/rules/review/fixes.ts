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
