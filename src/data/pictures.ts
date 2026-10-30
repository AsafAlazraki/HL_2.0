/* ============================================================
   EVERY PICTURE THE APP DRAWS, AND EVERY MARK — ONE READER.

   THE COMPONENTS CRITIQUE, BLOCKER 3 (2026-09-28). The Stacer 519 Sea
   Ranger SDF's own photograph was drawn on the picker, the build's
   stage, Home and the Quotes register, and said to be missing on three
   screens: the cascade, Customers and the paper, whose cover printed
   Stacer's logo on a pale box. The ledgers were right; each screen read
   them for itself, and three asked a narrower question than the build.
   Until 2026-10-20 there were still eight readers — this file and seven
   screen-local copies (the picker, the stage, Home, the sheet, Entry,
   the Quotes register's cover) — and a picture could be drawn on one
   and refused on another.

   SO THERE IS ONE ANSWER, and it is `pictureBook` in
   `@/domain/model/pictures`: pure, handed the three ledgers, and pinned
   by its own test (never a stand-in, never enlarged, a colourway render
   only on its colourway, a gap returned as a gap). This file only hands
   it the ledgers this bundle carries and the deployment's base address,
   so a picture is served under a sub-path as well as at the root, and
   names the questions the screens ask. What a screen DRAWS with the
   answer — a blurred ground, a cover band, a well in a row — and the
   words it says about it stay the screen's. What it can no longer do is
   get a different answer.

   WHY THE LEDGERS RIDE IN THE BUNDLE. They are data the pack ships
   beside the price file, and Entry's door is the one thing in this app
   that reads `data/northside/` over the network: a fetch here would
   leave a first visit with no network holding pictures for a reason
   nobody could see. Entry hands the same domain reader the copies it
   fetched (`src/screens/entry/facts.ts`).

   AND NORTHSIDE'S OWN PICTURES (2026-10-30). A picture the dealer adds
   to one option is laid over the book here (`withOwnPictures`), from the
   pictures the catalogue store last handed over (`./ownPictures.ts`), so
   the build, the catalogue and the paper draw it by asking exactly what
   they asked before. The book is rebuilt only when those move.

   AN ITEM IS A ROW: its register, its id, and the address the price file
   gave it. A quote freezes all three (`rootTableId`, `rootRowId`,
   `subjectImage`), so the paper asks exactly what the build asked even
   with the catalogue closed.
   ============================================================ */
import {
  namesTheSame,
  pictureBook,
  type Found,
  type HeldMark,
  type Ink,
  type Item,
  type MarkChoice,
  type Picture,
  type PictureBook,
} from '@/domain/model/pictures'
import type { QuoteDef } from '@/domain/model'
import { addedLine, withOwnPictures, type OwnPicture } from '@/domain/model/ownPictures'
import { heldOwnPictures, ownPicturesVersion } from './ownPictures'
import imagesRaw from '../../data/northside/images.json?raw'
import marksRaw from '../../data/northside/marks-ledger.json?raw'
import picturesRaw from '../../data/northside/pictures.json?raw'

export type { Found, HeldMark, Ink, Item, MarkChoice, OwnPicture, Picture }

/** A picture this repository ships, at the size it ships it — the domain's answer. */
export type HeldPicture = Picture

/** A generated file that will not parse is a generator problem; the screen draws the gap. */
function parsed(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

let book: PictureBook | undefined
let dressed: { version: number; book: PictureBook } | undefined

/** The one reader: the ledgers in the bundle, built once, with Northside's own pictures over them. */
export function pictures(): PictureBook {
  book ??= pictureBook(
    { images: parsed(imagesRaw), pictures: parsed(picturesRaw), marks: parsed(marksRaw) },
    import.meta.env.BASE_URL,
  )
  const version = ownPicturesVersion()
  if (dressed?.version !== version) {
    dressed = { version, book: withOwnPictures(book, heldOwnPictures()) }
  }
  return dressed.book
}

/** One row, as the reader is asked about it. */
export const itemOf = (table: string, row: string, address?: string): Item => ({
  table,
  row,
  ...(address && address.trim() !== '' ? { address: address.trim() } : {}),
})

/** The row a quote is written against, frozen on the quote itself. */
export const itemOfQuote = (quote: QuoteDef): Item =>
  itemOf(quote.rootTableId, quote.rootRowId, quote.subjectImage?.src)

/** The model on the water, or nothing. */
export const heroOf = (item: Item): HeldPicture | null => pictures().hero(item)

/** THE EXACT CATALOGUE PICTURE: the row's own copy, or a model picture a person marked as
 *  exactly this row (model and finish) — never another colourway. */
export function copyOf(item: Item): HeldPicture | null {
  const book = pictures()
  /* Northside's own picture of this option is exact by the dealer's word: where it is the one
     drawn, it is the copy */
  if (book.own(item)) {
    const drawn = book.catalogue(item)
    if (drawn?.added) return drawn
  }
  const own = book.rowCopy(item)
  if (own) return own
  const model = book.modelPicture(item, 'catalogue')
  return model?.exact ? model : null
}

/** The catalogue picture a screen may draw for the MODEL: the row's own, then its model's,
 *  which may be another colourway (`exact: false` says so). */
export const catalogueOf = (item: Item): HeldPicture | null => pictures().catalogue(item)

/** THE PICTURE NORTHSIDE ADDED TO THIS ONE OPTION, where one stands — for its provenance line
 *  and for Remove. Whether it is the one DRAWN is the ladder's question (`pictureOf`). */
export const ownOf = (item: Item): OwnPicture | null => pictures().own(item)

/** The held picture of this exact item, which wins over Northside's own unless it chose its own. */
export const exactHeldOf = (item: Item): HeldPicture | null => pictures().exactHeld(item)

/** A screen's ladder: the model on the water, then the catalogue picture. */
export const pictureOf = (item: Item): HeldPicture | null => pictures().picture(item)

export const heroOfQuote = (quote: QuoteDef): HeldPicture | null => heroOf(itemOfQuote(quote))

/** THE BOAT'S PICTURE for a quote, on a screen — what the stage, the cascade and Customers draw. */
export const pictureOfQuote = (quote: QuoteDef): HeldPicture | null =>
  pictureOf(itemOfQuote(quote))

/** What the customer's paper may print on its cover for this quote, or why nothing. */
export const coverOfQuote = (quote: QuoteDef): Found => pictures().forCover(itemOfQuote(quote))

/** What a line on the customer's paper may carry beside it, or why nothing. */
export const lineOf = (item: Item): Found => pictures().forLine(item)

/** The narrower copies as a `srcset`, or nothing for a picture held at one size. */
export const srcSetOf = (held: Pick<HeldPicture, 'widths'>): string | undefined =>
  held.widths.length > 1 ? held.widths.map((w) => `${w.src} ${w.width}w`).join(', ') : undefined

/**
 * THE MAKER'S MARK IN THE INK THIS GROUND NEEDS, or why there is none.
 * Recolouring somebody else's mark is not something a ledger can offer,
 * so a maker held only in the other ink is refused with that reason —
 * Mercury and Stabicraft publish white ink alone, and white ink cannot be
 * printed on a white page.
 */
export const markOf = (register: string | undefined, ink: Ink): MarkChoice =>
  pictures().mark(register, ink)

/** The mark for a dark ground — the file's blue, a dark well — in white ink, or why not. */
export const markOnDark = (register: string | undefined): MarkChoice => markOf(register, 'white')

/** The mark for paper, in dark ink, or why not. */
export const markOnPaper = (register: string | undefined): MarkChoice => markOf(register, 'dark')

/**
 * THE DEALERSHIP'S OWN MARK ON ITS LETTERHEAD, in the dark ink paper needs — and only for
 * the business the quote froze, so a quote raised under another name never wears it.
 */
export function letterheadOf(business: string | null | undefined): MarkChoice {
  const name = business?.trim() ?? ''
  if (name === '') return { drawn: false, because: 'No business name was frozen onto this quote.' }
  const own = pictures().organisation('dark')
  if (own.drawn && !namesTheSame(name, own.mark.brand)) {
    return { drawn: false, because: `The mark held is ${own.mark.brand}’s, not ${name}’s.` }
  }
  return own
}

/** The host an address belongs to, for a caption. A malformed address says less rather than throwing. */
export function hostOf(address: string): string {
  try {
    return new URL(address).host
  } catch {
    return 'an address this file carries'
  }
}

/** WHERE A PICTURE CAME FROM, in one line a person reads under it large (the build's lightbox):
 *  "Added by Asaf, 30 October 2026" for Northside's own, else the maker's host it was read off. */
export function creditOf(held: Pick<HeldPicture, 'added' | 'address' | 'tier'>): string {
  if (held.added) return addedLine({ addedBy: held.added.by, addedAt: held.added.at })
  return `${held.tier === 'hero' ? 'Photograph' : 'Picture'} from ${hostOf(held.address)}`
}
