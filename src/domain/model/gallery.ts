/* ============================================================
   A ROW'S GALLERY: EVERY PICTURE OF ONE OPTION, IN ONE ORDER, ONE OF
   THEM ITS COVER (the owner, 2026-10-31: "per boat and product the
   ability to have more than one image and cover image and whatnot").

   WHAT IS IN IT. Every picture the one reader may draw for this exact
   row, held and Northside's alike:
     · the HELD pictures, in the ladder's own order — the model on the
       water, the price file's own picture of the row, the model's
       studio picture — each once (two copies of one maker's address
       are one picture);
     · NORTHSIDE'S OWN, every picture the dealer added to this row that
       still stands (`standingOwnPictures`), oldest first.
   Each keeps its own provenance: a held picture its maker's host and
   the person who marked it, the dealer's "Added by Asaf, 2 November
   2026". A picture of another row is never in it — no sibling, no
   package, no "similar" part — because both ledgers are keyed by row.

   ONE IS THE COVER, AND IT COMES FIRST. By default it is the picture
   the app already drew for this row (the held photograph, or the
   dealer's where nothing of the exact item is held, or the one the
   dealer chose over the maker's before galleries existed), so a row
   nobody arranged looks exactly as it did. The dealer may choose
   another — any picture of the gallery, held or his own — and from
   then the whole app draws that one for the row: the build's stage
   and tiles, Home, the register, and the paper where the paper may
   print it (`printableOnCover`, `printableOnLine`).

   THE ARRANGEMENT IS A RECORD OF ITS OWN (`GalleryOrder`): the row,
   the name the price list gave it when it was arranged, the cover the
   dealer chose and the order he put the others in, who and when. It
   stands only while the price list still names the row as it did,
   for the reason a picture does (`./ownPictures.ts`): a new file that
   moves a row must not hand its arrangement to whatever now stands
   there. Ids it names that are not in the gallery any more are
   skipped; pictures it does not name follow in their own order.

   PURE. No React, no store, no DOM.
   ============================================================ */
import { addedLine, type OwnPicture } from './ownPictures'
import type { Found, Item, Picture, PictureBook } from './pictures'

/** The dealer's arrangement of one row's gallery. */
export interface GalleryOrder {
  id: string
  /** the tenant key every filed record carries */
  orgId: string
  table: string
  row: string
  /** THE ROW'S IDENTITY: the name the price list gave it when it was arranged */
  option: string
  /** the row as the dealer read it where he arranged it, for the sentences */
  name: string
  /** the picture the dealer chose as the cover, by its id in the gallery; absent is the default */
  cover?: string
  /** the gallery's pictures in the dealer's order, by id; the cover is drawn first whatever its
   *  place here */
  order: string[]
  /** who arranged it last, and when (ISO) */
  by: string
  at: string
}

/** The key one row's records are filed under. */
export const galleryKey = (table: string, row: string): string => `${table}\n${row}`

/* ---------------------------------------------------------- */
/* Read, defensively — a backup is untrusted                    */
/* ---------------------------------------------------------- */

/** THE MOST IDS AN ARRANGEMENT IS READ WITH. A defensive bound on a file from outside, not a
 *  figure anybody is shown: the held ledgers give a row three pictures at most (309 model
 *  pictures and 453 row copies, measured 2026-11-02), so an order of hundreds is not one this
 *  app wrote. */
export const GALLERY_ORDER_LIMIT = 200

const text = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')
/** an id inside an order: a ledger id, `row:<the maker's address>` or `own:<id>` */
const pictureId = (v: unknown): v is string =>
  typeof v === 'string' && v.length > 0 && v.length <= 2048 && !/[\n\r]/.test(v)

/** ONE ARRANGEMENT FROM OUTSIDE, or nothing. Whose it is comes from the caller, never the file. */
export function readGalleryOrder(
  raw: unknown,
  orgId: string,
  safeId: (v: unknown) => v is string,
): GalleryOrder | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null
  const r = raw as Record<string, unknown>
  const id = r['id']
  const table = r['table']
  const row = r['row']
  if (!safeId(id) || !safeId(table) || !safeId(row)) return null
  const option = text(r['option'])
  const by = text(r['by'])
  const at = text(r['at'])
  if (option === '' || by === '' || Number.isNaN(new Date(at).getTime())) return null
  const list = Array.isArray(r['order']) ? (r['order'] as unknown[]) : []
  const order = [...new Set(list.filter(pictureId))].slice(0, GALLERY_ORDER_LIMIT)
  const cover = pictureId(r['cover']) ? (r['cover'] as string) : undefined
  return {
    id,
    orgId,
    table,
    row,
    option,
    name: text(r['name']) || option,
    ...(cover ? { cover } : {}),
    order,
    by,
    at,
  }
}

/* ---------------------------------------------------------- */
/* The pictures, as the reader answers with them                */
/* ---------------------------------------------------------- */

/** The id a dealer's picture has in a gallery. */
export const ownId = (p: Pick<OwnPicture, 'id'>): string => `own:${p.id}`

/** The dealer's picture as the reader answers with it: exact, a person's, its provenance said. */
export function pictureOfOwn(p: OwnPicture): Picture {
  return {
    id: ownId(p),
    src: p.src,
    width: p.width,
    height: p.height,
    widths: [{ src: p.src, width: p.width }],
    tier: 'catalogue',
    address: '',
    pageUrl: '',
    verdict: 'own',
    subject: p.name,
    table: p.table,
    model: '',
    rows: [p.row],
    standing: 'row',
    exact: true,
    person: true,
    depicts: p.name,
    differs: [],
    verification: addedLine(p),
    licenceNote: 'Northside’s own picture.',
    beyond: '',
    added: { by: p.addedBy, at: p.addedAt },
  }
}

/** Each picture once, the first kept: by id, and two copies of one maker's address are one. */
export function onceEach(pictures: readonly (Picture | null | undefined)[]): Picture[] {
  const ids = new Set<string>()
  const addresses = new Set<string>()
  const out: Picture[] = []
  for (const p of pictures) {
    if (!p || ids.has(p.id)) continue
    if (p.address !== '' && addresses.has(p.address)) continue
    ids.add(p.id)
    if (p.address !== '') addresses.add(p.address)
    out.push(p)
  }
  return out
}

/** THE HELD PICTURES OF A ROW, in the ladder's order: the model on the water, the price file's
 *  own picture of the row, the model's studio picture. The first is the book's own answer
 *  (`picture`), so a row nobody arranged opens on the picture it was always drawn with. */
export function heldGallery(
  book: Pick<PictureBook, 'hero' | 'rowCopy' | 'modelPicture'>,
  item: Item,
): Picture[] {
  return onceEach([book.hero(item), book.rowCopy(item), book.modelPicture(item, 'catalogue')])
}

/** A COVER THE CUSTOMER'S PAPER MAY PRINT: the dealer's own (exact by his word), a photograph a
 *  person marked, the price file's own picture of the row, or a studio picture of this exact row
 *  — the paper's own ladder (`forCover` in `./pictures.ts`), asked of one picture. */
export function printableOnCover(p: Picture): boolean {
  if (p.added) return true
  if (p.tier === 'hero') return p.person
  if (p.id.startsWith('row:')) return true
  return p.exact
}

/** A PICTURE A LINE ON THE PAPER MAY CARRY: the dealer's own, or one a person marked as this
 *  exact row (`forLine`). */
export const printableOnLine = (p: Picture): boolean =>
  p.added !== undefined || (p.tier === 'catalogue' && p.person && p.exact)

/** One id moved to a new place in an order, the rest kept in theirs. */
export function moveIn(ids: readonly string[], id: string, to: number): string[] {
  const from = ids.indexOf(id)
  if (from === -1) return [...ids]
  const rest = ids.filter((x) => x !== id)
  const at = Math.max(0, Math.min(rest.length, to))
  return [...rest.slice(0, at), id, ...rest.slice(at)]
}

/* ---------------------------------------------------------- */
/* Laid over the book                                           */
/* ---------------------------------------------------------- */

/**
 * THE BOOK, WITH NORTHSIDE'S OWN PICTURES AND ARRANGEMENTS LAID OVER IT. `own` and `orders` are
 * the ones that stand (their row still named as it was), oldest first.
 *
 * WHERE THE DEALER CHOSE A COVER, every question a screen asks of the row — the model on the
 * water, the catalogue picture, a screen's ladder — is answered with it, and the paper prints it
 * where the paper may (`printableOnCover`, `printableOnLine`), falling to its own ladder where it
 * may not. ELSEWHERE nothing a screen drew moves: the dealer's picture is drawn where he chose it
 * over the maker's, or where no picture of the exact item is held; otherwise the book's own
 * answer. The price file's own copy (`rowCopy`) and a model's picture (`modelPicture`) are
 * questions about the shipped ledgers and are never changed.
 */
export function withGalleries(
  book: PictureBook,
  own: readonly OwnPicture[],
  orders: readonly GalleryOrder[] = [],
): PictureBook {
  if (own.length === 0 && orders.length === 0) return book
  const owned = new Map<string, OwnPicture[]>()
  for (const p of own) {
    const key = galleryKey(p.table, p.row)
    owned.set(key, [...(owned.get(key) ?? []), p])
  }
  const arranged = new Map<string, GalleryOrder>()
  for (const o of orders) {
    const key = galleryKey(o.table, o.row)
    const was = arranged.get(key)
    if (!was || o.at >= was.at) arranged.set(key, o)
  }
  const ownsOf = (item: Item): readonly OwnPicture[] =>
    owned.get(galleryKey(item.table, item.row)) ?? []
  const orderOf = (item: Item): GalleryOrder | null =>
    arranged.get(galleryKey(item.table, item.row)) ?? null

  /** THE DEALER'S PICTURE THAT IS DRAWN WITHOUT AN ARRANGEMENT, as before galleries: the one he
   *  chose over the maker's, else his first where nothing of the exact item is held */
  const wins = (item: Item): Picture | null => {
    const list = ownsOf(item)
    const chosen = list.find((p) => p.chosen)
    if (chosen) return pictureOfOwn(chosen)
    const first = list[0]
    return first && !book.exactHeld(item) ? pictureOfOwn(first) : null
  }

  /** the gallery in its own order: the picture drawn first, then the held, then the dealer's */
  const natural = (item: Item): Picture[] =>
    onceEach([wins(item), ...book.gallery(item), ...ownsOf(item).map(pictureOfOwn)])

  /** the cover the dealer chose, where it is still in the gallery */
  const chosenCover = (item: Item): Picture | null => {
    const o = orderOf(item)
    if (!o?.cover) return null
    return natural(item).find((p) => p.id === o.cover) ?? null
  }

  /* THE COVER LEADS, WHATEVER THE ORDER: the one chosen, else the one drawn by default; then the
     others in the dealer's order; then any he never placed, in their own */
  const gallery = (item: Item): readonly Picture[] => {
    const all = natural(item)
    const o = orderOf(item)
    if (!o) return all
    const byId = new Map(all.map((p) => [p.id, p]))
    const listed = o.order.flatMap((id) => byId.get(id) ?? [])
    return onceEach([chosenCover(item) ?? all[0], ...listed, ...all])
  }

  const found = (picture: Picture): Found => ({ held: true, picture })

  return {
    ...book,
    own: (item) => {
      const cover = chosenCover(item)
      const list = ownsOf(item)
      return (cover?.added ? list.find((p) => ownId(p) === cover.id) : null) ?? list[0] ?? null
    },
    owns: ownsOf,
    arrangement: orderOf,
    gallery,
    cover: (item) => gallery(item)[0] ?? null,
    chosenCover,
    hero: (item) => {
      const cover = chosenCover(item)
      if (cover) return cover
      const chosen = ownsOf(item).find((p) => p.chosen)
      return chosen ? pictureOfOwn(chosen) : book.hero(item)
    },
    catalogue: (item) => chosenCover(item) ?? wins(item) ?? book.catalogue(item),
    picture: (item) => chosenCover(item) ?? wins(item) ?? book.picture(item),
    /* THE PAPER: the chosen cover where the paper may print it; else the dealer's where it wins;
       else the book's, where the book may print one; and where the book holds the exact item but
       may not print it (a row's own copy no person marked cannot sit beside a line), the
       dealer's first — a person's statement of that exact item */
    forCover: (item) => {
      const cover = chosenCover(item)
      if (cover && printableOnCover(cover)) return found(cover)
      const w = wins(item)
      if (w) return found(w)
      const held = book.forCover(item)
      const first = ownsOf(item)[0]
      return held.held || !first ? held : found(pictureOfOwn(first))
    },
    forLine: (item) => {
      const cover = chosenCover(item)
      if (cover && printableOnLine(cover)) return found(cover)
      const w = wins(item)
      if (w) return found(w)
      const held = book.forLine(item)
      const first = ownsOf(item)[0]
      return held.held || !first ? held : found(pictureOfOwn(first))
    },
    /* what a finding says about the row's own picture, only where that picture is the one drawn */
    notes: (item) => {
      const cover = chosenCover(item)
      if (cover) return cover.id.startsWith('row:') ? book.notes(item) : []
      return wins(item) ? [] : book.notes(item)
    },
  }
}

/** The book with Northside's own pictures over it and no arrangement: `withGalleries`. */
export const withOwnPictures = (book: PictureBook, own: readonly OwnPicture[]): PictureBook =>
  withGalleries(book, own, [])

/* ---------------------------------------------------------- */
/* What a picture in a gallery is, said                         */
/* ---------------------------------------------------------- */

/** The host an address belongs to, for a caption. A malformed address says less rather than throwing. */
export function hostOf(address: string): string {
  try {
    return new URL(address).host
  } catch {
    return 'an address this file carries'
  }
}

/** WHERE ONE PICTURE OF A GALLERY CAME FROM: "Added by Asaf, 2 November 2026" for Northside's
 *  own; "Photograph from stabicraft.com.au" or "Picture from yamaha-motor.com.au" for a held one. */
export function sourceOf(p: Pick<Picture, 'added' | 'address' | 'tier'>): string {
  if (p.added) return addedLine({ addedBy: p.added.by, addedAt: p.added.at })
  if (p.address === '') return 'A picture this app holds'
  return `${p.tier === 'hero' ? 'Photograph' : 'Picture'} from ${hostOf(p.address)}`
}

/** WHAT A HELD PICTURE SHOWS THAT IS NOT EXACTLY THIS ROW, or '' where it is exactly the row (the
 *  dealer's own is, by his word). Said under it wherever the gallery is drawn large. */
export function standingOf(
  p: Pick<Picture, 'added' | 'exact' | 'standing' | 'model' | 'beyond'>,
): string {
  if (p.added || p.exact) return ''
  if (p.standing === 'hull') {
    return p.beyond !== ''
      ? `The ${p.model} hull it is built on; this one is the ${p.beyond}.`
      : `The ${p.model} hull it is built on.`
  }
  return 'The model; its finish may not be this one’s.'
}
