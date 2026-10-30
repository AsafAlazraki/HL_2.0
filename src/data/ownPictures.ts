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
import type { OwnPicture } from '@/domain/model/ownPictures'

let held: readonly OwnPicture[] = []
let version = 0

/** Hand the reader the pictures that stand now. The same list again changes nothing. */
export function holdOwnPictures(next: readonly OwnPicture[]): void {
  if (next === held) return
  if (next.length === held.length && next.every((p, i) => p === held[i])) return
  held = next
  version += 1
}

/** The pictures that stand, as last handed over. */
export const heldOwnPictures = (): readonly OwnPicture[] => held

/** How many times the pictures have moved: the reader rebuilds its answer when this does. */
export const ownPicturesVersion = (): number => version
