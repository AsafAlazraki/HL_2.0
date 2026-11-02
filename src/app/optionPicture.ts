/* ============================================================
   ONE OPTION'S PICTURES, BOUND TO THE APP — what a screen hands
   `AddPicture` (src/ui/AddPicture.tsx) so the control acts on the
   catalogue's own commands, as the person at the desk:

     <AddPicture {...useOptionPicture(itemOf(table, row, address), name)} />

   The control is the kit's and knows no store; the commands are the
   domain's (`src/domain/catalogue/pictureCommands.ts`) and know no
   React. This is the one hand between them, so every screen that puts
   the control on an option — the build's tiles, the catalogue, the
   price list's details — binds it the same way and no screen writes
   its own.

   WHAT STANDS is the row's gallery as the one reader orders it
   (`galleryOf`, the held pictures and every one Northside added, the
   cover first), read again whenever the pictures, their arrangements
   or the price list move, so the frame draws what every other screen
   draws for that option.

   EACH ACT IS ONE STEP on the catalogue's stack, answered with its
   sentence and its way back, pinned to that step (`undo(eventId)`).

   AND A ROW'S GALLERY, LARGE, for a screen that only shows pictures
   (Fitment, a place's range, a catalogue card): `useGalleryLarge`
   hands the lightbox the row's gallery, the cover first.
   ============================================================ */
import { useMemo } from 'react'
import { isDone, type CatalogueCommand } from '@/domain/catalogue/commands'
import {
  addOwnPictures,
  coverPicture,
  movePicture,
  removeOwnPicture,
} from '@/domain/catalogue/pictureCommands'
import {
  galleryLineOf,
  galleryOf,
  itemOf,
  srcSetOf,
  type HeldPicture,
  type Item,
} from '@/data/pictures'
import { catalogue } from '@/state/catalogue'
import { session } from '@/state/session'
import type { TableKind } from '@/domain/model'
import {
  largeOf,
  type AddPictureProps,
  type GalleryShot,
  type LightboxPicture,
  type PictureStep,
} from '@/ui'
import { useCatalogue } from './useStores'

/** One command on the catalogue's stack, as the control's step. */
export function stepOf(command: CatalogueCommand): PictureStep {
  const store = catalogue.getState()
  const outcome = store.apply(command)
  if (!isDone(outcome)) return { refused: outcome.refused }
  const eventId = outcome.event.id
  return {
    said: outcome.said,
    undo: () => {
      const back = catalogue.getState().undo(eventId)
      return isDone(back) ? back.said : back.refused
    },
  }
}

/** One picture of a gallery as the control draws it, with its provenance said. */
export function shotOf(p: HeldPicture, name: string): GalleryShot {
  const { source, standing } = galleryLineOf(p)
  const srcSet = srcSetOf(p)
  return {
    id: p.id,
    src: p.src,
    width: p.width,
    height: p.height,
    ...(srcSet ? { srcSet } : {}),
    alt: p.subject.trim() !== '' ? p.subject : `The ${name}`,
    source,
    standing,
    own: p.added !== undefined,
  }
}

/** A row's gallery as the control draws it, the cover first. */
export const shotsOf = (gallery: readonly HeldPicture[], name: string): GalleryShot[] =>
  gallery.map((p) => shotOf(p, name))

/** THE ROW'S GALLERY, read again whenever the pictures, their arrangements or the price list
 *  move — the reader is rebuilt by the store before any screen paints. */
export function useGallery(item: Item): readonly HeldPicture[] {
  const { table, row, address } = item
  const own = useCatalogue((s) => s.ownPictures)
  const orders = useCatalogue((s) => s.galleries)
  const rows = useCatalogue((s) => s.rows)
  return useMemo(
    () => galleryOf(itemOf(table, row, address)),
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- the store's records move the reader's answer
    [table, row, address, own, orders, rows],
  )
}

/** A ROW'S GALLERY, LARGE: the lightbox's pictures, the cover first and marked. */
export function useGalleryLarge(item: Item, name: string): LightboxPicture[] {
  const gallery = useGallery(item)
  return useMemo(() => largeOf(name, shotsOf(gallery, name)), [gallery, name])
}

/** Who is at the desk now: the provenance of every act. */
const by = (): string | null => session.getState().name

/**
 * THE CONTROL'S PROPS FOR ONE OPTION. `name` is the option as this screen says it ("Yamaha
 * F60LC"); the price list's own name is filed beside it by the command, whatever is said here.
 */
export function useOptionPicture(
  item: Item,
  name: string,
  kind?: TableKind,
): Omit<AddPictureProps, 'read'> {
  const { table, row } = item
  const gallery = useGallery(item)
  const shots = useMemo(() => shotsOf(gallery, name), [gallery, name])
  const shown = shots.map((s) => s.id)
  return {
    option: name,
    gallery: shots,
    ...(kind ? { kind } : {}),
    onAdd: (pictures) => stepOf(addOwnPictures({ table, row, name, pictures, by: by() })),
    onRemove: (id) =>
      id.startsWith('own:')
        ? stepOf(removeOwnPicture(id.slice('own:'.length), by()))
        : { refused: '' },
    onCover: (id) => stepOf(coverPicture({ table, row, name, shown, id, by: by() })),
    onMove: (id, to) => stepOf(movePicture({ table, row, name, shown, id, to, by: by() })),
  }
}
