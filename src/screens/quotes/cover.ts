/* ============================================================
   THE PICTURE OF THE QUOTE IN HAND — what the room under the rows holds
   for the quote the cursor is on (the M2-close critique's finding 6,
   rule (e); the quote in hand, and no other, since 2026-09-29).

   Read down two rungs, stopping at the first that holds:

     1. THE PHOTOGRAPH on the water, when the heroes ledger holds that
        exact model. Until 2026-09-29 a photograph of ANY quote's boat
        won over the one in hand, and the room showed -03's hull while
        the panel read -01 (the second components critique, finding 10).
     2. THE ROW'S OWN CATALOGUE COPY — the picture the quote froze
        (`subjectImage.src`, the maker's own address), when this
        repository ships a copy of that exact address. It is the exact
        colourway on the document, a studio render cut out on white,
        so it is drawn on white at no more than its own pixels.

   AND THERE IS NO THIRD RUNG (2026-10-29, built-critique-m3-2.md major
   7). Until then a quote whose boat was not pictured got a cover all the
   same: the maker's mark at three fifths of the room's width over "No
   photograph of this boat yet.", or that sentence alone. At 1440 × 900
   that was a 520px Highfield wordmark under the one row, and the critic
   read the whole screen as a placeholder. A mark is not a picture of the
   boat, and a frame that says it holds no picture is a hole with a
   caption. Where neither rung holds, `coverOf` answers nothing and the
   room offers where the next quote starts instead (Quotes.tsx, `Makers`).

   A picture belongs only to the exact model it depicts (CLAUDE.md):
   the copy is matched on the frozen address and on nothing else.

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

export type Cover<P> = { rung: 'photo'; picture: P } | { rung: 'studio'; copy: HeldCopy }

export interface CoverReaders<P> {
  /** the photograph on the water of this quote's exact model, or nothing */
  photo: (quote: QuoteDef) => P | undefined
  /** the exact picture held of this quote's boat, or nothing */
  copy: (quote: QuoteDef) => HeldCopy | undefined
}

/** The first rung that holds for one quote, or nothing where no picture of its boat is held.
 *  Pure: the readers are handed in. */
export function coverOf<P>(quote: QuoteDef, readers: CoverReaders<P>): Cover<P> | undefined {
  const picture = readers.photo(quote)
  if (picture !== undefined) return { rung: 'photo', picture }
  const copy = readers.copy(quote)
  if (copy !== undefined) return { rung: 'studio', copy }
  return undefined
}

/** The exact picture held of this quote's boat — the row's own copy, or one a person marked as
 *  exactly that row (`copyOf` in `@/data/pictures`, the one reader) — or nothing. */
export function heldCopyOf(quote: QuoteDef): HeldCopy | undefined {
  const held = copyOf(itemOfQuote(quote))
  return held ? { src: held.src, width: held.width, height: held.height } : undefined
}
