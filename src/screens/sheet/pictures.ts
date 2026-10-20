/* ============================================================
   THE PICTURES THE SHEET DRAWS, ASKED OF THE ONE READER.

   The sheet is the price file itself, so the picture beside a row is
   that row's OWN picture address — the cell's value — resolved to the
   copy this repository ships of it (`@/data/pictures`, over
   `@/domain/model/pictures`), or the words "held as a link". A person's
   ruling on that address still holds here: a logo the file points a
   trailer at, or a sister model's photograph, is not drawn beside the
   row, exactly as it is not drawn on the quote. The row is named by its
   id, which is unique across the whole file, so the ruling needs nothing
   else.

   The price list prints on paper, so its head carries the maker's DARK
   mark where one is held, and the table's name in type where none is.

   Until 2026-10-20 this file read `images.json` and `marks-ledger.json`
   itself; a picture refused by the paper could then stand in a cell.
   ============================================================ */
import { markOf, pictures } from '@/data/pictures'

/** A picture this repository actually ships, at the size it ships it. */
export interface Held {
  at: string
  w: number
  h: number
  address: string
  /** scene or studio, as the packer measured it off the pixels */
  verdict: string
  /** for a picture of the MODEL (not the row's own copy): the rows it shows exactly */
  exactRows?: readonly string[]
}

/** A maker's wordmark, in the ink the ledger holds it in. */
export interface HeldMark {
  brand: string
  ink: 'dark' | 'white'
  at: string
  w: number
  h: number
}

/** The copy held of the row's own address, or `null` — for every address this repository
 *  does not ship, and for one a person refused for this row. */
export function heldCopy(address: string | undefined, rowId?: string): Held | null {
  const at = address?.trim() ?? ''
  if (at === '') return null
  const own = pictures().rowCopy({ table: '', row: rowId ?? '', address: at })
  return own
    ? { at: own.src, w: own.width, h: own.height, address: at, verdict: own.verdict }
    : null
}

/**
 * THE PICTURE A MODEL'S BLOCK MAY CARRY — in the gallery behind the Pictures door and beside
 * a block of variants on the price list: the row's own copy, or else the picture a person
 * attached to the MODEL (`pictures.json`), which the picker and the build already draw. A
 * cell is still the row's own address alone (`heldCopy`): the sheet is the price file. Until
 * 2026-10-20 the gallery asked only the row's copy, and said "Pictures 35 of 67 models" and
 * "this browser holds no copy" of seven Roll Ups the picker drew.
 */
export function blockCopy(table: string, address: string | undefined, rowId: string): Held | null {
  const own = heldCopy(address, rowId)
  if (own) return own
  const book = pictures()
  const model = book.modelPicture({ table, row: rowId }, 'catalogue')
  if (!model) return null
  return {
    at: model.src,
    w: model.width,
    h: model.height,
    address: model.address,
    verdict: model.verdict,
    exactRows: model.rows.filter((row) => {
      const it = book.modelPicture({ table, row }, 'catalogue')
      return it?.id === model.id && it.exact
    }),
  }
}

/** The rows a block's picture shows exactly, where the picture is the model's. */
export const exactRowsOf = (held: Held): readonly string[] | undefined => held.exactRows

/** The mark held for the maker a register is named after, in the ink asked for — the price
 *  file calls the register "Highfield Inflatables" and the ledger calls the maker "Highfield",
 *  so the match is the same name or the register's name beginning with the maker's and a space.
 *  `rest` is what of the register's name the mark does not already say: "Inflatables". */
export function markFor(
  register: string,
  ink: HeldMark['ink'],
): { mark: HeldMark; rest: string } | null {
  const choice = markOf(register, ink)
  if (!choice.drawn) return null
  const { brand, src, width, height } = choice.mark
  const name = register.trim()
  return {
    mark: { brand, ink, at: src, w: width, h: height },
    rest: name.slice(brand.trim().length).trim(),
  }
}
