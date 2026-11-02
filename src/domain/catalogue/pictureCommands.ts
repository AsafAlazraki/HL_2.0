/* ============================================================
   NORTHSIDE'S PICTURES OF ONE OPTION, CHANGED THE WAY EVERYTHING IN
   THE PRICE LIST IS CHANGED — one command with its inverse, the
   sentence the step says, and the event the audit keeps.

   FOUR ACTS, ONE SHAPE. Adding pictures to a row, taking one off,
   choosing the row's cover and moving a picture in the row's gallery
   are each an EXCHANGE of whole records: the pictures and the
   arrangement that leave, and the ones that arrive. The way back is the
   same exchange the other way round, closed over the very records, so
   Undo after "take it off" puts back the same bytes with the same
   "Added by Asaf, 30 October 2026" — never a copy re-dated to the undo
   — and Undo after "make it the cover" puts back the arrangement as it
   stood, or none.

   AN OPTION HAS A GALLERY (2026-11-02). Adding a picture adds it beside
   the ones already there; several dropped at once are one step. Its
   cover and its order are the row's arrangement (`GalleryOrder` in
   `@/domain/model/gallery`), kept beside the pictures and carried in
   the backup with them.

   THE OPTION'S IDENTITY IS READ HERE, NOT HANDED IN. The command reads
   the name the price list gives the row now (`rowLabel`) and files it
   on the picture and the arrangement, so a screen cannot attach either
   to one row under another's name. `standingOwnPictures` and
   `standingGalleries` hold them to it ever after: a record whose row
   the price list no longer names as it did is kept and not drawn
   (`@/domain/model/ownPictures` says why).

   WHAT A GALLERY HOLDS IS THE READER'S. The held pictures come from the
   ledgers the app ships, which this pure layer does not read, so the
   cover and the order are handed in as the ids the reader drew (the
   app's binding, `src/app/optionPicture.ts`). A picture of Northside's
   is checked here against the row it must belong to; an id naming no
   picture of the row is skipped by the reader, never drawn.

   Pure: no React, no store. The clock is the one the store hands in.
   ============================================================ */
import { newId } from '@/domain/id'
import { rowLabel } from '@/domain/model'
import { moveIn, ownId, type GalleryOrder } from '@/domain/model/gallery'
import {
  NOBODY_AT_THE_DESK,
  NOT_IN_GALLERY,
  OPTION_GONE,
  OWN_PICTURE_EDGE,
  OWN_PICTURE_KEEP_LIMIT,
  PICTURE_GONE,
  bytesOf,
  isOwnBytes,
  type OwnPicture,
} from '@/domain/model/ownPictures'
import type { CatalogueChange, CatalogueCommand, CatalogueEvent, Done } from './commands'
import type { CatalogueData } from './sheet'

/** A picture as the browser half hands it over, redrawn and measured (`src/ui/pictureFile.ts`). */
export interface PictureTaken {
  /** our own bytes: `data:image/…;base64,…` */
  src: string
  width: number
  height: number
  /** the file's own name, when there was a file */
  file?: string
}

/** Said when a picture handed in is not one this app redrew. A guard on the screen's wiring. */
export const NOT_OUR_BYTES =
  'That picture was not made here from a file, so it is not kept. Choose the file, paste the picture or drop it here.'

/** Said where the cover is asked to move: it is drawn first, whatever the order. */
export const COVER_STAYS_FIRST =
  'The cover is always shown first. Make another picture the cover, and this one can move.'

/** Said when a picture handed in is over the bounds. A guard on the screen's wiring. */
export const overTheBounds = (w: number, h: number): string =>
  `That picture is ${w} × ${h}. An option’s picture is kept at ${OWN_PICTURE_EDGE} pixels across at most.`

/* ---------------------------------------------------------- */
/* Which records stand                                         */
/* ---------------------------------------------------------- */

/** The name the price list gives this row now, or null where the row is not in that register. */
export function optionNamed(data: CatalogueData, table: string, row: string): string | null {
  const entity = data.tables[table]
  const found = data.index.rowById[row]
  if (!entity || !found || found.entityId !== table) return null
  return rowLabel(entity, found)
}

/** Oldest first, the id breaking a tie; pictures added in one step keep the order of their files. */
const byAdded = (a: OwnPicture, b: OwnPicture): number =>
  a.addedAt.localeCompare(b.addedAt) ||
  (a.file ?? '').localeCompare(b.file ?? '', 'en', { numeric: true }) ||
  a.id.localeCompare(b.id)

/**
 * THE PICTURES THAT MAY BE DRAWN: each one whose row is still in its register and still named
 * as it was named when the picture was added. Oldest first, so a row's gallery lists the
 * dealer's pictures in the order he added them.
 */
export function standingOwnPictures(data: CatalogueData): OwnPicture[] {
  const all = Object.values(data.ownPictures ?? {})
  return all.filter((p) => optionNamed(data, p.table, p.row) === p.option).toSorted(byAdded)
}

/** Every picture standing for this one option, oldest first. */
export function ownPicturesFor(
  data: CatalogueData,
  table: string,
  row: string,
): readonly OwnPicture[] {
  return standingOwnPictures(data).filter((p) => p.table === table && p.row === row)
}

/** The first picture standing for this one option, or null. */
export function ownPictureFor(data: CatalogueData, table: string, row: string): OwnPicture | null {
  return ownPicturesFor(data, table, row)[0] ?? null
}

/** THE ARRANGEMENTS THAT STAND: each whose row the price list still names as it did. Oldest
 *  first; where two stand for one row, the reader takes the latest. */
export function standingGalleries(data: CatalogueData): GalleryOrder[] {
  return Object.values(data.galleries ?? {})
    .filter((o) => optionNamed(data, o.table, o.row) === o.option)
    .toSorted((a, b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id))
}

/** The arrangement standing for this one option, or null. */
export function galleryFor(data: CatalogueData, table: string, row: string): GalleryOrder | null {
  return standingGalleries(data).findLast((o) => o.table === table && o.row === row) ?? null
}

/* ---------------------------------------------------------- */
/* The one exchange                                            */
/* ---------------------------------------------------------- */

interface Exchange {
  leave: readonly OwnPicture[]
  arrive: readonly OwnPicture[]
  /** the arrangement that leaves and the one that arrives, where the act moves one */
  orderLeaves?: GalleryOrder | null
  orderArrives?: GalleryOrder | null
  /** the option the step is about, for the label and the audit */
  about: { table: string; row: string; name: string }
  said: string
  /** what the inverse says */
  back: string
}

/** A map with some records gone and some come; NONE LEFT IS SAID AS THE KEY ON PURPOSE, never
 *  left out: the store merges a step's data over what it holds, so a key left out would leave
 *  the last record standing after its Undo (measured in `src/state/catalogue.pictures.test.ts`). */
function swapped<T extends { id: string }>(
  held: Readonly<Record<string, T>> | undefined,
  leave: readonly T[],
  arrive: readonly T[],
): Record<string, T> | undefined {
  const next: Record<string, T> = { ...held }
  for (const r of leave) delete next[r.id]
  for (const r of arrive) next[r.id] = r
  return Object.keys(next).length === 0 ? undefined : next
}

function exchange(x: Exchange): CatalogueCommand {
  return (data: CatalogueData, now: string) => {
    const held = data.ownPictures ?? {}
    for (const p of x.leave) if (!held[p.id]) return { refused: PICTURE_GONE }
    const orders = data.galleries ?? {}
    const moves = x.orderLeaves !== undefined || x.orderArrives !== undefined
    const ordersLeave = x.orderLeaves ? [x.orderLeaves] : []
    const ordersArrive = x.orderArrives ? [x.orderArrives] : []
    for (const o of ordersLeave) if (!orders[o.id]) return { refused: '' }
    const nextData: CatalogueData = {
      ...data,
      ownPictures: swapped(data.ownPictures, x.leave, x.arrive),
      ...(moves ? { galleries: swapped(data.galleries, ordersLeave, ordersArrive) } : {}),
    }
    const key = `${x.about.table}.${x.about.row}`
    const changed: CatalogueChange[] = []
    if (x.leave.length > 0 || x.arrive.length > 0) {
      changed.push({
        path: `ownPictures.${key}`,
        from: x.leave.map((p) => p.id).join(' ') || null,
        to: x.arrive.map((p) => p.id).join(' ') || null,
      })
    }
    if (moves) {
      changed.push({
        path: `galleries.${key}`,
        from: x.orderLeaves ? [x.orderLeaves.cover ?? '', ...x.orderLeaves.order].join(' ') : null,
        to: x.orderArrives ? [x.orderArrives.cover ?? '', ...x.orderArrives.order].join(' ') : null,
      })
    }
    const event: CatalogueEvent = {
      id: newId(),
      kind: 'picture-set',
      at: now,
      said: x.said,
      label: `Picture · ${x.about.name}`,
      tableId: x.about.table,
      rowId: x.about.row,
      changed,
    }
    const done: Done = {
      next: nextData,
      said: x.said,
      event,
      inverse: exchange({
        leave: x.arrive,
        arrive: x.leave,
        ...(moves
          ? { orderLeaves: x.orderArrives ?? null, orderArrives: x.orderLeaves ?? null }
          : {}),
        about: x.about,
        said: x.back,
        back: x.said,
      }),
    }
    return done
  }
}

/** "your picture" to the person who added it, "Mia’s picture" to anybody else. */
const whose = (p: OwnPicture, asking: string | undefined): string =>
  asking && asking.trim() === p.addedBy ? 'your picture' : `${p.addedBy}’s picture`

const capital = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

const counted = (n: number): string =>
  n === 1 ? 'Your picture is' : `Your ${n.toLocaleString('en-AU')} pictures are`

/* ---------------------------------------------------------- */
/* Adding                                                      */
/* ---------------------------------------------------------- */

export interface AddOwnPictures {
  table: string
  row: string
  /** the option as the screen names it — "Yamaha F60LC"; the price list's own name if absent */
  name?: string
  /** one or several, in the order given */
  pictures: readonly PictureTaken[]
  /** who is at the desk: the provenance */
  by: string | null | undefined
}

/** One picture to add, as the screens hand it over one at a time. */
export interface AddOwnPicture extends Omit<AddOwnPictures, 'pictures'> {
  picture: PictureTaken
}

/**
 * ADD PICTURES TO ONE OPTION, beside the ones it has: one step, however many. Refused, with its
 * sentence, where nobody is named at the desk, where the option has left the price list, and
 * where a picture is not one the browser half made (a guard on the wiring: a screen hands over
 * only what `pictureFile.ts` returned) — the whole step, so a drop of five is all or none.
 */
export function addOwnPictures(args: AddOwnPictures): CatalogueCommand {
  return (data: CatalogueData, now: string) => {
    const by = args.by?.trim() ?? ''
    if (by === '') return { refused: NOBODY_AT_THE_DESK }
    const option = optionNamed(data, args.table, args.row)
    if (option === null) return { refused: OPTION_GONE }
    /* a sheet that came from nowhere is nobody's, and a record filed for nobody is refused */
    if (!data.orgId) return { refused: OPTION_GONE }
    if (args.pictures.length === 0) return { refused: '' }
    for (const { src, width, height } of args.pictures) {
      if (!isOwnBytes(src) || bytesOf(src) > OWN_PICTURE_KEEP_LIMIT) {
        return { refused: NOT_OUR_BYTES }
      }
      if (!(width > 0) || !(height > 0) || Math.max(width, height) > OWN_PICTURE_EDGE) {
        return { refused: overTheBounds(width, height) }
      }
    }
    const name = args.name?.trim() || option
    const orgId = data.orgId
    const arrived: OwnPicture[] = args.pictures.map((picture) => {
      const file = picture.file?.trim() ?? ''
      return {
        id: newId(),
        orgId,
        table: args.table,
        row: args.row,
        option,
        name,
        src: picture.src,
        width: Math.round(picture.width),
        height: Math.round(picture.height),
        bytes: bytesOf(picture.src),
        ...(file !== '' ? { file } : {}),
        addedBy: by,
        addedAt: now,
        chosen: false,
      }
    })
    const n = arrived.length
    return exchange({
      leave: [],
      arrive: arrived,
      about: { table: args.table, row: args.row, name },
      said: `${counted(n)} on the ${name} now.`,
      back: `${counted(n)} off the ${name}.`,
    })(data, now)
  }
}

/** ADD ONE PICTURE TO ONE OPTION, beside any it has (`addOwnPictures`). */
export const addOwnPicture = ({ picture, ...args }: AddOwnPicture): CatalogueCommand =>
  addOwnPictures({ ...args, pictures: [picture] })

/* ---------------------------------------------------------- */
/* Taking one off                                              */
/* ---------------------------------------------------------- */

/** TAKE ONE OF NORTHSIDE'S PICTURES OFF ITS OPTION. Its way back puts the same picture back, as
 *  it was added, in the place it had: the arrangement still names it. */
export function removeOwnPicture(id: string, asking?: string | null): CatalogueCommand {
  return (data: CatalogueData, now: string) => {
    const p = data.ownPictures?.[id]
    if (!p) return { refused: PICTURE_GONE }
    const it = whose(p, asking ?? undefined)
    return exchange({
      leave: [p],
      arrive: [],
      about: p,
      said: `${capital(it)} is off the ${p.name}.`,
      back: `${capital(it)} is back on the ${p.name}.`,
    })(data, now)
  }
}

/* ---------------------------------------------------------- */
/* The cover and the order                                     */
/* ---------------------------------------------------------- */

export interface ArrangeGallery {
  table: string
  row: string
  /** the option as the screen names it; the price list's own name if absent */
  name?: string
  /** the gallery's pictures as the reader drew them, by id, the cover first */
  shown: readonly string[]
  /** who is at the desk */
  by: string | null | undefined
}

/** The checks every arrangement shares; the record it starts from, or a refusal. */
function arranging(
  data: CatalogueData,
  args: ArrangeGallery,
  id: string,
):
  | { refused: string }
  | { was: GalleryOrder | null; option: string; name: string; by: string; orgId: string } {
  const by = args.by?.trim() ?? ''
  if (by === '') return { refused: NOBODY_AT_THE_DESK }
  const option = optionNamed(data, args.table, args.row)
  if (option === null || !data.orgId) return { refused: OPTION_GONE }
  if (!args.shown.includes(id)) return { refused: NOT_IN_GALLERY }
  /* one of Northside's must be a picture of THIS row that still stands */
  if (id.startsWith('own:')) {
    const mine = ownPicturesFor(data, args.table, args.row).some((p) => ownId(p) === id)
    if (!mine) return { refused: NOT_IN_GALLERY }
  }
  return {
    was: galleryFor(data, args.table, args.row),
    option,
    name: args.name?.trim() || option,
    by,
    orgId: data.orgId,
  }
}

/** The arrangement as it will stand: the same record where there was one, a new one where not. */
function arrangement(
  was: GalleryOrder | null,
  at: { table: string; row: string; option: string; name: string; by: string; orgId: string },
  change: { cover?: string; order: string[] },
  now: string,
): GalleryOrder {
  return {
    id: was?.id ?? newId(),
    orgId: was?.orgId ?? at.orgId,
    table: at.table,
    row: at.row,
    option: at.option,
    name: at.name,
    ...(change.cover ? { cover: change.cover } : {}),
    order: change.order,
    by: at.by,
    at: now,
  }
}

/** What a picture is called in a sentence: the dealer's by whose it is, a held one as the maker's. */
function called(data: CatalogueData, id: string, asking: string): string {
  if (!id.startsWith('own:')) return 'the maker’s picture'
  const p = data.ownPictures?.[id.slice('own:'.length)]
  return p ? whose(p, asking) : 'that picture'
}

/**
 * MAKE ONE PICTURE OF THE GALLERY THE ROW'S COVER: drawn first in its gallery, and drawn for the
 * row everywhere the app draws it. Making the cover what is already the cover is nothing.
 */
export function coverPicture(args: ArrangeGallery & { id: string }): CatalogueCommand {
  return (data: CatalogueData, now: string) => {
    const at = arranging(data, args, args.id)
    if ('refused' in at) return at
    if (args.shown[0] === args.id) return { refused: '' }
    const next = arrangement(
      at.was,
      { ...args, ...at },
      { cover: args.id, order: [...args.shown] },
      now,
    )
    const it = called(data, args.id, at.by)
    return exchange({
      leave: [],
      arrive: [],
      orderLeaves: at.was,
      orderArrives: next,
      about: { table: args.table, row: args.row, name: at.name },
      said: `The ${at.name}’s cover is ${it} now.`,
      back: `The ${at.name}’s cover is as it was.`,
    })(data, now)
  }
}

/**
 * MOVE ONE PICTURE TO A NEW PLACE IN THE GALLERY. The cover stays first: a picture moved to the
 * front of the others stands second, and only "make it the cover" puts one first. Moving one to
 * where it stands is nothing.
 */
export function movePicture(
  args: ArrangeGallery & { id: string; /** its place among them all, 0 the cover */ to: number },
): CatalogueCommand {
  return (data: CatalogueData, now: string) => {
    const at = arranging(data, args, args.id)
    if ('refused' in at) return at
    const cover = args.shown[0]
    if (args.id === cover) return { refused: COVER_STAYS_FIRST }
    const to = Math.max(1, Math.min(args.shown.length - 1, Math.round(args.to)))
    const order = moveIn(args.shown, args.id, to)
    if (order.every((id, i) => id === args.shown[i])) return { refused: '' }
    const next = arrangement(
      at.was,
      { ...args, ...at },
      { ...(at.was?.cover ? { cover: at.was.cover } : {}), order },
      now,
    )
    const place = order.indexOf(args.id) + 1
    return exchange({
      leave: [],
      arrive: [],
      orderLeaves: at.was,
      orderArrives: next,
      about: { table: args.table, row: args.row, name: at.name },
      said: `${capital(called(data, args.id, at.by))} is ${place} of ${order.length} on the ${at.name} now.`,
      back: `The ${at.name}’s pictures are in the order they were.`,
    })(data, now)
  }
}
