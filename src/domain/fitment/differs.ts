/* ============================================================
   HOW TWO MOTORS OF ONE RATING DIFFER, as the price list says it
   (fit flow, walk 2, F10, 2026-11-05).

   THE WALK: "The customer said F150. The F150XC and F150XCB both go
   on it, side by side, with nothing to say how they differ." Both are
   150 hp, 228 kg and 25″, so the facts a motor is chosen by say the
   same thing twice. The price list does say how they differ, in the
   motor's own identity columns: the F150XC is "Mech with Hydraulic
   Steering", "Power Trim & Tilt", "L4 / 2670cc"; the F150XCB is "DEC
   with Hydraulic Steering", "TotalTilt", "L4 / 2785cc".

   So among the motors a list draws, those of one rating and one shaft
   are read against each other, and each is given the columns whose
   cells differ among them, by the column's own name. Only the identity
   columns are read, never a figure: no price, no cost. A column whose
   cells are near enough one per row (a model code) says nothing a name
   does not, and is left out.

   Pure: no React, no store.
   ============================================================ */
import { readCell, type CatalogueCtx, type EntityDef, type RowData } from '@/domain/model'
import { motorFactsOf } from '@/domain/quote/goodsFacts'
import type { Place } from './boat'

const cell = (row: RowData, id: string): string => {
  const v = readCell(row, id)
  return typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : ''
}

/** The columns two motors can be told apart by: the table's identity text columns, less its
 *  name, its levels and the ones that are near enough a different cell per row. */
function tellingFields(ctx: CatalogueCtx, table: EntityDef): EntityDef['fields'] {
  const rows = ctx.rowsByEntity[table.id] ?? []
  const skip = new Set([table.displayFieldId, ...(table.hierarchy ?? [])])
  return table.fields.filter((f) => {
    if (f.type !== 'text' || f.sectionId !== 'identity' || skip.has(f.id)) return false
    const filled = rows.map((r) => cell(r, f.id)).filter((v) => v !== '')
    if (filled.length === 0) return false
    return new Set(filled).size / filled.length <= 0.8
  })
}

/**
 * For each motor among `places` that shares its rating and its shaft with another of them, what
 * tells it apart: "Control: Mech with Hydraulic Steering · Tilt & Trim: Power Trim & Tilt ·
 * Cylinders / Displacement: L4 / 2670cc". A motor with no such sibling, or none that differs in a
 * column the file fills, is absent from the map.
 */
export function differsOf(ctx: CatalogueCtx, places: readonly Place[]): Map<string, string> {
  const out = new Map<string, string>()
  const groups = new Map<string, Array<{ place: Place; row: RowData; table: EntityDef }>>()
  for (const place of places) {
    const table = ctx.entities[place.tableId]
    const row = (ctx.rowsByEntity[place.tableId] ?? []).find((r) => r.id === place.rowId)
    if (!table || !row || table.kind !== 'motor') continue
    const facts = motorFactsOf(table, row)
    if (!facts.hp) continue
    const key = `${table.id}|${facts.hp}|${facts.shaft ?? ''}`
    groups.set(key, [...(groups.get(key) ?? []), { place, row, table }])
  }
  const telling = new Map<string, EntityDef['fields']>()
  for (const members of groups.values()) {
    if (members.length < 2) continue
    const table = members[0]!.table
    if (!telling.has(table.id)) telling.set(table.id, tellingFields(ctx, table))
    const fields = telling
      .get(table.id)!
      .filter((f) => new Set(members.map((m) => cell(m.row, f.id))).size > 1)
    for (const m of members) {
      const said = fields
        .map((f) => ({ name: f.name.trim(), value: cell(m.row, f.id) }))
        .filter((f) => f.value !== '')
        .map((f) => `${f.name}: ${f.value}`)
      if (said.length > 0) out.set(m.place.rowId, said.join(' · '))
    }
  }
  return out
}
