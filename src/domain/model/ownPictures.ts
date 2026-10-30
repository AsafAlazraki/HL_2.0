/* ============================================================
   A PICTURE NORTHSIDE ADDS TO ONE OPTION — the record, the rule that
   decides when it is drawn, and the sentences said about it.

   WHAT THE ORIGINAL'S USERS VALUED, AND WHAT IT GOT WRONG
   (docs/directions/flow/original.md §3). A dealer could put their own
   picture on a colourway, a dealer-fit selection or a fit-up item, in
   four admin screens, with no record of who added it or when, removed
   by one hover-revealed X with no way back, and a selection with no
   upload fell back to its first component's picture — one part standing
   in for a package, four anchor sizes drawn as one. This is the one way
   it is done here, and each of those is answered:

     · IT BELONGS TO ONE OPTION. A row of a register, by its id, and the
       name the price list gave that row when the picture was added. The
       dealer's act is the statement that it depicts that exact item, so
       it is drawn as exact and a person's — and NEVER for another row:
       no sibling, no package, no "similar" part. Nothing here copies it.
     · ITS PROVENANCE IS A PERSON AND A DAY: "Added by Asaf, 30 October
       2026", said wherever it is drawn with its words.
     · IT IS DRAWN BY THE ONE READER. `withOwnPictures` lays these over
       the book the three bundled ledgers make (`./pictures.ts`), so the
       build, the catalogue and the paper ask the same question they
       always asked and get the dealer's picture where it is the answer.
     · A HELD PICTURE OF THE EXACT ITEM STILL WINS, unless the dealer
       chose theirs (`chosen`). "Exact" is the book's own word: the price
       file's own copy for that row, or a picture a person marked as that
       row, model and finish. A picture of the model in another colourway
       is not the exact item, so the dealer's picture of the exact item
       is drawn over it.
     · IF THE PRICE LIST NO LONGER NAMES THE ROW AS IT DID, THE PICTURE
       IS NOT DRAWN. Row ids are the price file's own order; a new file
       that inserts a line moves every later one, and a picture of the
       Yamaha F60LC must not land on whatever now stands at its place.
       It is kept — a copy brought back, or the file put back, draws it
       again — and simply never answers for another item
       (`standingOwnPictures` in `@/domain/catalogue/pictureCommands`).

   THE BYTES ARE OURS. `src` is a `data:image/` address this app redrew
   from the dealer's file (`src/ui/pictureFile.ts`), never an address on
   somebody else's host: the original's fit-up pictures were hotlinked
   and rotted, and a hotlink on the customer's paper is a picture that
   may not print. A record whose `src` is anything else is refused at
   the door of a backup (`readOwnPicture`) and by the command.

   PURE. No React, no store, no DOM: the browser half that reads a file
   and redraws it is `src/ui/pictureFile.ts`, and the decision taken
   before a byte is read is here (`ownPicturePlan`).
   ============================================================ */
import { sizeSay } from '../modules/size'
import type { Found, Item, Picture, PictureBook } from './pictures'

/** One picture Northside added to one option. */
export interface OwnPicture {
  id: string
  /** the tenant key every filed record carries */
  orgId: string
  /** the register the option is a row of */
  table: string
  /** the option's row */
  row: string
  /** THE OPTION'S IDENTITY: the name the price list gave the row when the picture was added. It
   *  is drawn only while the row still carries it. */
  option: string
  /** the option as the dealer read it on the screen where they added it — "Yamaha F60LC" —
   *  for the alt text and the sentences; the price list's own name where none was said */
  name: string
  /** our own bytes: a `data:image/` address, redrawn to `OWN_PICTURE_EDGE` at most */
  src: string
  /** the stored pixels */
  width: number
  height: number
  /** the stored bytes, measured off `src` */
  bytes: number
  /** the dealer's file, by its own name, when it had one (a pasted picture has none) */
  file?: string
  /** who added it: the name given at the desk */
  addedBy: string
  /** when, ISO */
  addedAt: string
  /** the dealer chose this over a held picture of the exact item */
  chosen: boolean
}

/* ---------------------------------------------------------- */
/* The bounds                                                  */
/* ---------------------------------------------------------- */

/**
 * THE LONGEST SIDE A DEALER'S PICTURE IS KEPT AT: 1,100 pixels. MEASURED, not chosen: every
 * catalogue picture the app ships is held at a long edge of 1,100 (274 model pictures in
 * `pictures.json` and 329 row copies in `images.json`, 2026-10-30), and no screen draws a
 * picture past the pixels it holds (`Picture`, "never enlarged"). So 1,100 is the largest an
 * option's picture is ever drawn, and storing more is bytes no screen and no paper uses.
 */
export const OWN_PICTURE_EDGE = 1100

/** Above this a file is not read at all: reading 40 MB into a string to find out what it is
 *  is a freeze a person cannot cancel. The bound the place's mark already keeps (logo.ts). */
export const OWN_PICTURE_READ_LIMIT = 32 * 1024 * 1024

/** What a kept picture may weigh once redrawn: a 1,100-pixel picture saved losslessly by a
 *  browser that cannot write WebP is about 2 MB, and nothing redrawn here is near this. */
export const OWN_PICTURE_KEEP_LIMIT = 4 * 1024 * 1024

/** `data:image/…` and nothing else: our own bytes, never an address on another host. */
const OWN_BYTES = /^data:image\/(?:jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/

/** True of a `src` this app made from a dealer's file. */
export const isOwnBytes = (src: string): boolean => OWN_BYTES.test(src)

/* ---------------------------------------------------------- */
/* The sentences                                               */
/* ---------------------------------------------------------- */

const quoted = (file: string | undefined): string =>
  file && file.trim() !== '' ? `“${file.trim()}”` : 'That file'

/** Said when a file is not a picture. Names what is allowed. */
export const notAPicture = (file: string | undefined, option: string): string =>
  `${quoted(file)} is not a picture, so it cannot be the ${option}’s. A photograph or a drawing can: JPEG, PNG, WebP or GIF.`

/** Said when a file is too large to read. Carries both figures. */
export const tooLarge = (file: string | undefined, size: number): string =>
  `${quoted(file)} is ${sizeSay(size)}, and a picture over ${sizeSay(
    OWN_PICTURE_READ_LIMIT,
  )} is not read. Save a smaller copy: an option’s picture is kept at ${OWN_PICTURE_EDGE} pixels across at most.`

/** Said when the browser could not open what it was given. */
export const unreadable = (file: string | undefined): string =>
  `${quoted(file)} could not be opened as a picture. It may be damaged or of a kind this browser cannot open; save it as a JPEG or PNG and add it again.`

/** Said when what was pasted is words. An address is not fetched: a picture from the web is
 *  kept only once it is saved here, so it can never rot or be refused on the paper. */
export const pastedWords = (address: boolean): string =>
  address
    ? 'That is an address, not a picture. A picture from the web is kept only once it is saved here: save it, then choose it or drop it here.'
    : 'What was pasted is words, not a picture. Copy the picture itself and paste again, or choose its file.'

/** Said when more than one file is dropped or pasted at once: an option has one picture, and
 *  choosing among them for the dealer would be choosing which depicts the item. */
export const manyFiles = (n: number): string =>
  `That is ${n} files at once. An option has one picture, so drop or paste just the one that shows it.`

/** Said when what was dropped carried no file at all — a picture dragged out of another web
 *  page arrives as its address, and an address is not fetched. */
export const DROPPED_NO_FILE =
  'What was dropped is an address on the web, not a picture. Save the picture first, then drop the saved file here.'

/** Said when nothing could be added because nobody is named at the desk. */
export const NOBODY_AT_THE_DESK =
  'Nobody is named at the desk, so the picture could not say who added it. Give your name at the door first.'

/** Said where the option a press was about has left the price list. */
export const OPTION_GONE = 'That option is no longer in the price list.'

/** Said where a picture a press was about has already gone. */
export const PICTURE_GONE = 'That picture is already off.'

/* ---------------------------------------------------------- */
/* Before a byte is read                                       */
/* ---------------------------------------------------------- */

export type OwnPicturePlan = { do: 'refuse'; why: string } | { do: 'read' }

/** Read it, or refuse it with a sentence — decided on the file's declared kind and size alone. */
export function ownPicturePlan(
  file: { type: string; size: number; name?: string },
  option: string,
): OwnPicturePlan {
  /* an SVG is a document that can carry script; it is drawn here only as pixels, and a drawing
     saved as a PNG says the same thing, so the kinds offered are the four a camera, a maker's
     page and a screenshot produce */
  if (!/^image\/(?:jpeg|png|webp|gif)$/i.test(file.type)) {
    return { do: 'refuse', why: notAPicture(file.name, option) }
  }
  if (file.size > OWN_PICTURE_READ_LIMIT) {
    return { do: 'refuse', why: tooLarge(file.name, file.size) }
  }
  return { do: 'read' }
}

/** True of pasted words that are an address on the web. */
export const isAnAddress = (text: string): boolean => /^\s*(?:https?:)?\/\//i.test(text)

/* ---------------------------------------------------------- */
/* Its provenance, said                                         */
/* ---------------------------------------------------------- */

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

/** "30 October 2026", the day in the reader's own zone; an unreadable instant as written. */
export function daySaid(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** THE PROVENANCE LINE: "Added by Asaf, 30 October 2026". */
export const addedLine = (p: Pick<OwnPicture, 'addedBy' | 'addedAt'>): string =>
  `Added by ${p.addedBy}, ${daySaid(p.addedAt)}`

/* ---------------------------------------------------------- */
/* Read, defensively — a backup is untrusted                    */
/* ---------------------------------------------------------- */

const text = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')
const whole = (v: unknown): number =>
  typeof v === 'number' && Number.isInteger(v) && v > 0 ? v : 0

/** The bytes a `data:` address really holds: four characters for three, less the padding. */
export function bytesOf(src: string): number {
  const comma = src.indexOf(',')
  if (comma === -1) return src.length
  const body = src.slice(comma + 1)
  const pad = body.endsWith('==') ? 2 : body.endsWith('=') ? 1 : 0
  return Math.max(0, Math.floor((body.length * 3) / 4) - pad)
}

/**
 * ONE RECORD FROM OUTSIDE, or nothing. Every field narrowed; `src` must be our own bytes and
 * within the bounds; ids must be safe to key a map by (`safeId`, the backup's own test). Whose
 * it is comes from the caller, never from the file — the backup's rule for every record.
 */
export function readOwnPicture(
  raw: unknown,
  orgId: string,
  safeId: (v: unknown) => v is string,
): OwnPicture | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null
  const r = raw as Record<string, unknown>
  const id = r['id']
  const table = r['table']
  const row = r['row']
  if (!safeId(id) || !safeId(table) || !safeId(row)) return null
  const src = typeof r['src'] === 'string' ? r['src'] : ''
  if (!isOwnBytes(src)) return null
  const bytes = bytesOf(src)
  if (bytes > OWN_PICTURE_KEEP_LIMIT) return null
  const width = whole(r['width'])
  const height = whole(r['height'])
  if (width === 0 || height === 0 || Math.max(width, height) > OWN_PICTURE_EDGE) return null
  const option = text(r['option'])
  const addedBy = text(r['addedBy'])
  const addedAt = text(r['addedAt'])
  if (option === '' || addedBy === '' || Number.isNaN(new Date(addedAt).getTime())) return null
  const file = text(r['file'])
  return {
    id,
    orgId,
    table,
    row,
    option,
    name: text(r['name']) || option,
    src,
    width,
    height,
    bytes,
    ...(file !== '' ? { file } : {}),
    addedBy,
    addedAt,
    chosen: r['chosen'] === true,
  }
}

/* ---------------------------------------------------------- */
/* Laid over the book                                           */
/* ---------------------------------------------------------- */

const keyOf = (table: string, row: string): string => `${table}\n${row}`

/** The dealer's picture as the reader answers with it: exact, a person's, its provenance said. */
export function pictureOfOwn(p: OwnPicture): Picture {
  return {
    id: `own:${p.id}`,
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

/**
 * THE BOOK, WITH NORTHSIDE'S OWN PICTURES LAID OVER IT. `own` is the pictures that still stand
 * (their option still named as it was); the first for an option wins, and there is one.
 *
 * Every question a screen asks is answered the same way: the dealer's picture where they chose
 * it, or where no picture of the exact item is held; otherwise the book's own answer. The
 * price file's own copy (`rowCopy`) and a model's picture (`modelPicture`) are questions about
 * the shipped ledgers and are not changed. The model on the water (`hero`) is the dealer's
 * only where they chose theirs: a hero is a photograph of the MODEL, and a dealer's picture of
 * one option is not drawn as the model's unless they said so.
 */
export function withOwnPictures(book: PictureBook, own: readonly OwnPicture[]): PictureBook {
  if (own.length === 0) return book
  const byOption = new Map<string, OwnPicture>()
  for (const p of own)
    if (!byOption.has(keyOf(p.table, p.row))) byOption.set(keyOf(p.table, p.row), p)
  const ownOf = (item: Item): OwnPicture | null => byOption.get(keyOf(item.table, item.row)) ?? null

  /** the dealer's picture, where it is the answer for this item */
  const wins = (item: Item): Picture | null => {
    const p = ownOf(item)
    if (!p) return null
    return p.chosen || !book.exactHeld(item) ? pictureOfOwn(p) : null
  }
  const found = (picture: Picture): Found => ({ held: true, picture })

  return {
    ...book,
    own: ownOf,
    hero: (item) => {
      const p = ownOf(item)
      return p?.chosen ? pictureOfOwn(p) : book.hero(item)
    },
    catalogue: (item) => wins(item) ?? book.catalogue(item),
    picture: (item) => wins(item) ?? book.picture(item),
    /* THE PAPER: the dealer's where it wins; else the book's, where the book may print one; and
       where the book holds the exact item but may not print it (a row's own copy that no person
       marked cannot sit beside a line), the dealer's — a person's statement of that exact item */
    forCover: (item) => {
      const w = wins(item)
      if (w) return found(w)
      const held = book.forCover(item)
      const p = ownOf(item)
      return held.held || !p ? held : found(pictureOfOwn(p))
    },
    forLine: (item) => {
      const w = wins(item)
      if (w) return found(w)
      const held = book.forLine(item)
      const p = ownOf(item)
      return held.held || !p ? held : found(pictureOfOwn(p))
    },
    notes: (item) => (wins(item) ? [] : book.notes(item)),
  }
}
