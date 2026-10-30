/* ============================================================
   A PICTURE NORTHSIDE ADDS TO ONE OPTION, CHANGED THE WAY EVERYTHING
   IN THE PRICE LIST IS CHANGED — one command with its inverse, the
   sentence the step says, and the event the audit keeps.

   THREE ACTS, ONE SHAPE. Adding a picture, taking it off, and choosing
   it over the maker's are each an EXCHANGE of whole records: the ones
   that leave and the ones that arrive. The way back is the same
   exchange the other way round, closed over the very records, so Undo
   after "take it off" puts back the same bytes with the same "Added by
   Asaf, 30 October 2026" — never a copy re-dated to the undo.

   ONE PICTURE PER OPTION. Adding a second replaces the first, and the
   step says whose it replaces; Undo puts the first back.

   THE OPTION'S IDENTITY IS READ HERE, NOT HANDED IN. The command reads
   the name the price list gives the row now (`rowLabel`) and files it
   on the picture, so a screen cannot attach a picture to one row under
   another's name. `standingOwnPictures` holds every picture to it ever
   after: a picture whose row the price list no longer names as it did
   is kept and not drawn (`@/domain/model/ownPictures` says why).

   Pure: no React, no store. The clock is the one the store hands in.
   ============================================================ */
import { newId } from '@/domain/id'
import { rowLabel } from '@/domain/model'
import {
  NOBODY_AT_THE_DESK,
  OPTION_GONE,
  OWN_PICTURE_EDGE,
  OWN_PICTURE_KEEP_LIMIT,
  PICTURE_GONE,
  bytesOf,
  daySaid,
  isOwnBytes,
  type OwnPicture,
} from '@/domain/model/ownPictures'
import type { CatalogueCommand, CatalogueEvent, Done } from './commands'
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

/** Said when a picture handed in is over the bounds. A guard on the screen's wiring. */
export const overTheBounds = (w: number, h: number): string =>
  `That picture is ${w} × ${h}. An option’s picture is kept at ${OWN_PICTURE_EDGE} pixels across at most.`

/* ---------------------------------------------------------- */
/* Which pictures stand                                        */
/* ---------------------------------------------------------- */

/** The name the price list gives this row now, or null where the row is not in that register. */
export function optionNamed(data: CatalogueData, table: string, row: string): string | null {
  const entity = data.tables[table]
  const found = data.index.rowById[row]
  if (!entity || !found || found.entityId !== table) return null
  return rowLabel(entity, found)
}

/**
 * THE PICTURES THAT MAY BE DRAWN: each one whose row is still in its register and still named
 * as it was named when the picture was added. Oldest first, so where two stand for one option
 * (a picture kept, its row renamed, and named back) the reader takes the first.
 */
export function standingOwnPictures(data: CatalogueData): OwnPicture[] {
  const all = Object.values(data.ownPictures ?? {})
  return all
    .filter((p) => optionNamed(data, p.table, p.row) === p.option)
    .toSorted((a, b) => a.addedAt.localeCompare(b.addedAt) || a.id.localeCompare(b.id))
}

/** The picture standing for this one option, or null. */
export function ownPictureFor(data: CatalogueData, table: string, row: string): OwnPicture | null {
  return standingOwnPictures(data).find((p) => p.table === table && p.row === row) ?? null
}

/* ---------------------------------------------------------- */
/* The one exchange                                            */
/* ---------------------------------------------------------- */

interface Exchange {
  leave: readonly OwnPicture[]
  arrive: readonly OwnPicture[]
  /** the option the step is about, for the label and the audit */
  about: OwnPicture
  said: string
  /** what the inverse says (the store rewrites it as a way back) */
  back: string
}

function exchange(x: Exchange): CatalogueCommand {
  return (data: CatalogueData, now: string) => {
    const held = data.ownPictures ?? {}
    for (const p of x.leave) if (!held[p.id]) return { refused: PICTURE_GONE }
    const next: Record<string, OwnPicture> = { ...held }
    for (const p of x.leave) delete next[p.id]
    for (const p of x.arrive) next[p.id] = p
    /* NONE LEFT IS SAID AS THE KEY ON PURPOSE, never left out: the store merges a step's data
       over what it holds, so a key left out would leave the last picture standing after its
       Undo (measured in `src/state/catalogue.pictures.test.ts`) */
    const nextData: CatalogueData = {
      ...data,
      ownPictures: Object.keys(next).length === 0 ? undefined : next,
    }
    const event: CatalogueEvent = {
      id: newId(),
      kind: 'picture-set',
      at: now,
      said: x.said,
      label: `Picture · ${x.about.name}`,
      tableId: x.about.table,
      rowId: x.about.row,
      changed: [
        {
          path: `ownPictures.${x.about.table}.${x.about.row}`,
          from: x.leave.map((p) => p.id).join(' ') || null,
          to: x.arrive.map((p) => p.id).join(' ') || null,
        },
      ],
    }
    const done: Done = {
      next: nextData,
      said: x.said,
      event,
      inverse: exchange({
        leave: x.arrive,
        arrive: x.leave,
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

/* ---------------------------------------------------------- */
/* The three acts                                              */
/* ---------------------------------------------------------- */

export interface AddOwnPicture {
  table: string
  row: string
  /** the option as the screen names it — "Yamaha F60LC"; the price list's own name if absent */
  name?: string
  picture: PictureTaken
  /** who is at the desk: the provenance */
  by: string | null | undefined
  /** shown over a held picture of the exact item from the start */
  chosen?: boolean
}

/**
 * ADD A PICTURE TO ONE OPTION. Refused, with its sentence, where nobody is named at the desk,
 * where the option has left the price list, and where the picture is not one the browser half
 * made (a guard on the wiring: a screen hands over only what `pictureFile.ts` returned).
 */
export function addOwnPicture(args: AddOwnPicture): CatalogueCommand {
  return (data: CatalogueData, now: string) => {
    const by = args.by?.trim() ?? ''
    if (by === '') return { refused: NOBODY_AT_THE_DESK }
    const option = optionNamed(data, args.table, args.row)
    if (option === null) return { refused: OPTION_GONE }
    /* a sheet that came from nowhere is nobody's, and a record filed for nobody is refused */
    if (!data.orgId) return { refused: OPTION_GONE }
    const { src, width, height } = args.picture
    if (!isOwnBytes(src) || bytesOf(src) > OWN_PICTURE_KEEP_LIMIT) return { refused: NOT_OUR_BYTES }
    if (!(width > 0) || !(height > 0) || Math.max(width, height) > OWN_PICTURE_EDGE) {
      return { refused: overTheBounds(width, height) }
    }
    const name = args.name?.trim() || option
    const file = args.picture.file?.trim() ?? ''
    const arrived: OwnPicture = {
      id: newId(),
      orgId: data.orgId,
      table: args.table,
      row: args.row,
      option,
      name,
      src,
      width: Math.round(width),
      height: Math.round(height),
      bytes: bytesOf(src),
      ...(file !== '' ? { file } : {}),
      addedBy: by,
      addedAt: now,
      chosen: args.chosen === true,
    }
    const was = ownPictureFor(data, args.table, args.row)
    const said = was
      ? `Your picture is on the ${name} now, in place of the one ${was.addedBy} added on ${daySaid(was.addedAt)}.`
      : `Your picture is on the ${name} now.`
    return exchange({
      leave: was ? [was] : [],
      arrive: [arrived],
      about: arrived,
      said,
      back: was ? `The ${name} has ${whose(was, by)} again.` : `Your picture is off the ${name}.`,
    })(data, now)
  }
}

/** TAKE AN OPTION'S PICTURE OFF. Its way back puts the same picture back, as it was added. */
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

/**
 * SHOW THE DEALER'S PICTURE OVER THE MAKER'S PICTURE OF THE EXACT ITEM, or the maker's again.
 * Choosing what is already chosen is nothing, and nothing is not a step.
 */
export function chooseOwnPicture(
  id: string,
  chosen: boolean,
  asking?: string | null,
): CatalogueCommand {
  return (data: CatalogueData, now: string) => {
    const p = data.ownPictures?.[id]
    if (!p) return { refused: PICTURE_GONE }
    if (p.chosen === chosen) return { refused: '' }
    const it = whose(p, asking ?? undefined)
    return exchange({
      leave: [p],
      arrive: [{ ...p, chosen }],
      about: p,
      said: chosen
        ? `The ${p.name} shows ${it} instead of the maker’s.`
        : `The ${p.name} shows the maker’s picture again. ${capital(it)} is kept.`,
      back: chosen
        ? `The ${p.name} shows the maker’s picture again.`
        : `The ${p.name} shows ${it} again.`,
    })(data, now)
  }
}
