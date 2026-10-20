/* ============================================================
   THE COVER OF THE QUOTE IN HAND — what the room under the rows holds
   for the quote the cursor is on (the M2-close critique's finding 6,
   rule (e); the quote in hand, and no other, since 2026-09-29).

   Until 2026-09-24 the room was the page's own paper whenever the
   heroes ledger held no photograph of a filed quote's model, which on
   this file is every model but eight: at 1920×1080 a bordered, empty
   frame about 690px tall under one row. Nothing may be invented to
   fill it, and nothing needs to be. The quote in hand is real and its
   boat has, on almost every model, something honest to show — read
   down the ladder the build's own stage and the customers' letter
   already read, one rung at a time, stopping at the first that holds:

     1. THE PHOTOGRAPH on the water, when the heroes ledger holds that
        exact model. Until 2026-09-29 a photograph of ANY quote's boat
        won over the one in hand, and the room showed -03's hull while
        the panel read -01 (the second components critique, finding 10).
     2. THE ROW'S OWN CATALOGUE COPY — the picture the quote froze
        (`subjectImage.src`, the maker's own address), when this
        repository ships a copy of that exact address. It is the exact
        colourway on the document, a studio render cut out on white,
        so it is drawn on white at no more than its own pixels.
     3. THE MAKER'S OWN MARK, in the ink paper needs, where no picture
        of the boat is held. A mark is not a picture of the boat and it
        is never drawn as one: the cover says in words that no picture
        is held and whose mark this is.
     4. THE NAME, SET IN TYPE. Always true, and never a hole.

   A picture belongs only to the exact model it depicts (CLAUDE.md):
   the copy is matched on the frozen address and on nothing else, and
   the mark on the maker's name, never a resemblance.

   THE PICTURES ARE THE ONE READER'S (`@/data/pictures`), since
   2026-10-20: this file read the image ledger for itself until then,
   by address alone, so a logo the price file points a row at, or a
   sister model's photograph, could stand on this cover while the paper
   refused it. The reader is asked by the quote's own row.
   ============================================================ */
import type { QuoteDef } from '@/domain/model'
import { copyOf, itemOfQuote } from '@/data/pictures'

/** A copy this repository ships of one address, at the size it ships it. */
export interface HeldCopy {
  src: string
  width: number
  height: number
}

/** A maker's mark, in the ink a white page needs. */
export interface CoverMark {
  src: string
  width: number
  height: number
  brand: string
}

export type Cover<P> =
  | { rung: 'photo'; picture: P }
  | { rung: 'studio'; copy: HeldCopy }
  | { rung: 'mark'; mark: CoverMark }
  | { rung: 'type' }

export interface CoverReaders<P> {
  /** the photograph on the water of this quote's exact model, or nothing */
  photo: (quote: QuoteDef) => P | undefined
  /** the exact picture held of this quote's boat, or nothing */
  copy: (quote: QuoteDef) => HeldCopy | undefined
  /** the maker's dark mark for this quote's register, or nothing */
  mark: (quote: QuoteDef) => CoverMark | undefined
}

/** The first rung that holds, for one quote. Pure: the readers are handed in. */
export function coverOf<P>(quote: QuoteDef, readers: CoverReaders<P>): Cover<P> {
  const picture = readers.photo(quote)
  if (picture !== undefined) return { rung: 'photo', picture }
  const copy = readers.copy(quote)
  if (copy !== undefined) return { rung: 'studio', copy }
  const mark = readers.mark(quote)
  if (mark !== undefined) return { rung: 'mark', mark }
  return { rung: 'type' }
}

/** The exact picture held of this quote's boat — the row's own copy, or one a person marked as
 *  exactly that row (`copyOf` in `@/data/pictures`, the one reader) — or nothing. */
export function heldCopyOf(quote: QuoteDef): HeldCopy | undefined {
  const held = copyOf(itemOfQuote(quote))
  return held ? { src: held.src, width: held.width, height: held.height } : undefined
}
