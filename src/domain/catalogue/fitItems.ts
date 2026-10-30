/* ============================================================
   THE THINGS A DEALER FITS, ONE BY ONE — so a picture can belong to one.

   A boat, a motor and a trailer are models the picker collapses rows
   into (`fleetOf`, src/screens/picker/fleet.ts). A part, a dealer-fit
   package, a rigging kit or a consumable is not: the price file sells
   each row as one thing, named in its own display column ("Garmin -
   GPSMAP 1022xsv", "Railblaza - Tracwedge Sideport Gunwale Mount").
   The owner, 2026-10-28: "if parts and things dont have images go get
   them". A picture of a part is attached to that part's NAME in its
   register, and so to exactly the rows that carry that name — the same
   item the file wrote down twice, never a sister part.

   ONE ITEM IS ONE NAME IN ONE REGISTER. Two rows with the same name in
   the same register are one item (the file lists "WR10 Remote Only"
   under two headings, with the one code); two rows with different names
   are two items even when their codes agree, because the file chose to
   say them differently and a picture is attached to what is said.

   WHICH REGISTERS: those the build's fit chapter offers (`accessory`,
   `package`) and Oils & Consumables, the one `custom` register whose
   rows are things on a shelf rather than a rate or a fee.

   PURE: no React, no store, no ledger. The picture ledger's test and
   the tool that holds a picture read it the same way.
   ============================================================ */
import type { EntityDef, RowData } from '@/domain/model'

/** The registers whose rows are things a dealer fits or sells over the counter. */
export const FIT_KINDS: readonly string[] = ['accessory', 'package']
export const FIT_SHELVES: readonly string[] = ['oils_lubes']

/** One thing the file sells, as a picture ledger names it. */
export interface FitItem {
  tableId: string
  register: string
  /** the row's own display name, as the file spells it */
  name: string
  variants: { rowId: string; label: string; cell: string; code: string }[]
}

/** Whether a register's rows are things a picture can be of. */
export const isFitRegister = (table: EntityDef): boolean =>
  FIT_KINDS.includes(table.kind ?? '') || FIT_SHELVES.includes(table.id)

const said = (v: unknown): string =>
  typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : ''

/** The field a register files its own code in: the first named "Code", "Part Number" or "Part No.". */
function codeField(table: EntityDef): string {
  const f = table.fields.find((x) => /^(code|part number|part no\.?)$/i.test(x.name.trim()))
  return f?.id ?? ''
}

/** Every item of every fit register, by its name, with the rows that carry that name. */
export function fitItemsOf(
  tables: Readonly<Record<string, EntityDef>>,
  rows: Readonly<Record<string, readonly RowData[]>>,
): FitItem[] {
  const out: FitItem[] = []
  for (const table of Object.values(tables)) {
    if (!isFitRegister(table)) continue
    const display = table.displayFieldId ?? ''
    if (display === '') continue
    const code = codeField(table)
    const byName = new Map<string, FitItem>()
    for (const row of rows[table.id] ?? []) {
      const name = said(row.values[display])
      if (name === '') continue
      let item = byName.get(name)
      if (!item) {
        item = { tableId: table.id, register: table.name, name, variants: [] }
        byName.set(name, item)
        out.push(item)
      }
      item.variants.push({
        rowId: row.id,
        label: name,
        cell: '',
        code: code === '' ? '' : said(row.values[code]),
      })
    }
  }
  return out
}
