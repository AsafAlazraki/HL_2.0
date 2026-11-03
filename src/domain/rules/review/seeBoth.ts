/* ============================================================
   "SEE BOTH" ON TWO HEADINGS OF ONE NAME — where the price list opens
   (the verifier of Review, 2026-11-04, round 2: "See both on a pair of
   headings opens Every column at Identity, the two columns off
   screen").

   Behind Every column the sheet draws all of a list's columns, 44 on
   Rigging Kits; the two "Trade Price" headings stood eleven hundred
   pixels apart. So the door names the two columns (`col`, which the
   sheet lights and brings into the window) and folds every section
   that holds neither of them, keeping the one that holds the line's
   name, so what stands between the two is only what shares their
   sections.

   PURE: a list's definition and two column ids in; the sections to
   fold, in the list's own order.
   ============================================================ */

import { displayFieldOf, type EntityDef } from '@/domain/model'

/** The sections of `table` that hold neither of `fieldIds` nor the line's name. */
export function foldedBesides(table: EntityDef, fieldIds: readonly string[]): string[] {
  const keep = new Set<string>()
  for (const id of [...fieldIds, displayFieldOf(table)?.id ?? '']) {
    const section = table.fields.find((f) => f.id === id)?.sectionId
    if (section) keep.add(section)
  }
  return (table.sections ?? []).map((s) => s.id).filter((id) => !keep.has(id))
}

/** The sheet's search for Every column with the two columns lit and every other section folded. */
export function seeBothSearch(table: EntityDef, fieldIds: readonly string[]): string {
  const fold = foldedBesides(table, fieldIds)
  const col = fieldIds.map(encodeURIComponent).join(',')
  return `?door=every&col=${col}${fold.length > 0 ? `&fold=${fold.map(encodeURIComponent).join(',')}` : ''}`
}
