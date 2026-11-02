/* ============================================================
   THE PICTURES NORTHSIDE ADDED, AS THE ONE READER SEES THEM.

   The catalogue store holds them (they change through its commands,
   with their way back) and the one reader draws them
   (`src/data/pictures.ts`). This is the hand between the two, and
   nothing else: the store hands over the pictures that stand each time
   they or the price list move, and the reader asks for them when it is
   asked a question.

   WHY A HAND AND NOT AN IMPORT. The reader carries the three ledgers in
   its bundle, 585 kB, and the store is read at the very first paint; a
   store that imported the reader would put the ledgers in front of the
   door. And the reader reaching up into a store would be `src/data`
   reading `src/state`, the wrong way round. So both read this, which
   carries no picture of its own.
   ============================================================ */
import type { GalleryOrder } from '@/domain/model/gallery'
import type { OwnPicture } from '@/domain/model/ownPictures'

let held: readonly OwnPicture[] = []
let orders: readonly GalleryOrder[] = []
let version = 0

/** The same list again, record for record. */
const same = <T>(a: readonly T[], b: readonly T[]): boolean =>
  a === b || (a.length === b.length && a.every((x, i) => x === b[i]))

/** Hand the reader the pictures that stand now. The same list again changes nothing. */
export function holdOwnPictures(next: readonly OwnPicture[]): void {
  if (same(next, held)) return
  held = next
  version += 1
}

/** Hand the reader the arrangements of galleries that stand now (`@/domain/model/gallery`). */
export function holdGalleries(next: readonly GalleryOrder[]): void {
  if (same(next, orders)) return
  orders = next
  version += 1
}

/** The arrangements that stand, as last handed over. */
export const heldGalleries = (): readonly GalleryOrder[] => orders

/** The pictures that stand, as last handed over. */
export const heldOwnPictures = (): readonly OwnPicture[] => held

/** How many times the pictures or their arrangements have moved: the reader rebuilds its answer
 *  when this does. */
export const ownPicturesVersion = (): number => version
