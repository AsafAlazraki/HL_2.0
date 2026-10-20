/* ============================================================
   THE PICTURES THE PICKER DRAWS, ASKED OF THE ONE READER.

   A card and a plate show a MODEL, so a model's picture is read down
   the build's own ladder (`@/data/pictures`, over
   `@/domain/model/pictures`): the model on the water where
   `pictures.json` holds one for it, then the anchor row's own copy,
   then the picture a person attached to the model — which on a model
   the file sells in several colourways may be one of them, and is the
   model's picture on every other (`exact: false`). Nothing stands in
   for anything: a model with none is drawn as its name set as a cover,
   never as another boat's picture.

   Until 2026-10-20 this file read the three ledgers itself, in a copy
   of the reading the sheet, Home and the stage each kept; a picture
   could then be drawn on one screen and refused on another. What is
   left here is the picker's own shape — `at`, `w`, `h`, and a mark's
   `scale` (`markScale`) so marks of every shape weigh the same.

   The floor is paper, so the picker draws each maker's DARK mark and
   sets the maker's name in type where none is held — a maker held in
   white ink alone (Mercury, Stabicraft) is set in type too, because
   recolouring somebody else's mark is not something a ledger can offer.
   ============================================================ */
import type { ImageRef } from '@/domain/model'
import { itemOf, markOnPaper, pictureOf as readPicture, pictures } from '@/data/pictures'
import { markScale } from './fleet'

/** A picture this repository actually ships, at the size it ships it. */
export interface Held {
  /** the same-origin address of the held copy, under the deployment's base */
  at: string
  /** the held copy's own pixels. Nothing is ever drawn past them. */
  w: number
  h: number
  /** the maker's own address */
  address: string
  /** scene on the water, or studio on white — measured, never read off a file name */
  verdict: string
  /** narrower copies of the same picture, narrowest first, for a `srcset` */
  widths: { at: string; w: number }[]
  /** what it shows, in the ledger's own words ("Stacer 519 Sea Ranger SDF on the water");
   *  '' for a row's own copy */
  subject: string
  /** it shows exactly the model's anchor row; false for another colourway of the model */
  exact: boolean
}

/** A maker's wordmark in dark ink, for paper. */
export interface HeldMark {
  brand: string
  at: string
  w: number
  h: number
  /** its height as a multiple of the screen's mark height (`markScale`) */
  scale: number
}

/** What a model is to the reader: its register, its anchor row and that row's own address. */
export interface Pictured {
  tableId: string
  key: string
  img?: ImageRef
}

const itemOfModel = (model: Pictured) => itemOf(model.tableId, model.key, model.img?.src)

const shaped = (p: NonNullable<ReturnType<typeof readPicture>>): Held => ({
  at: p.src,
  w: p.width,
  h: p.height,
  address: p.address,
  verdict: p.verdict,
  widths: p.widths.map((w) => ({ at: w.src, w: w.width })),
  subject: p.subject,
  exact: p.exact,
})

/** The anchor row's OWN copy, or null — the price file's own picture, unless a finding refuses it. */
export function heldCopy(model: Pictured): Held | null {
  const own = pictures().rowCopy(itemOfModel(model))
  return own ? shaped(own) : null
}

/** THE PICTURE OF ONE MODEL, down the build's ladder, or null — drawn as the model's name. */
export function pictureOf(model: Pictured): Held | null {
  const p = readPicture(itemOfModel(model))
  return p ? shaped(p) : null
}

/** `srcset` for a held picture, or undefined where it ships one size. */
export const srcSetOf = (held: Held): string | undefined =>
  held.widths.length > 1 ? held.widths.map((c) => `${c.at} ${c.w}w`).join(', ') : undefined

/** The dark mark held for the maker a register is named after, or null. */
export function markOf(register: string): HeldMark | null {
  const choice = markOnPaper(register)
  if (!choice.drawn) return null
  const { brand, src, width, height } = choice.mark
  return { brand, at: src, w: width, h: height, scale: markScale(width, height) }
}
