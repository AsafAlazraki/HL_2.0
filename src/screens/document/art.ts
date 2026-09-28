/* ============================================================
   WHAT GOES ON THE COVER OF A SHEET OF PAPER, AND WHAT IS SAID WHERE
   NOTHING CAN.

   THE SAME LADDER THE BUILD'S STAGE WALKS, READ BY THE SAME READER.
   Until 2026-09-28 this file read the catalogue ledger for itself, by
   the row's address alone, and never the heroes ledger — so the Stacer
   519 Sea Ranger SDF, photographed on the water on the picker, the
   build's stage, Home and the Quotes register, printed Stacer's logo on
   a pale box as its cover, and the note beside the paper said "no copy
   of it is held here" (the components critique, blocker 3). The picture
   is now `pictureOfQuote` in `@/data/pictures`, the one reader every
   screen of the sale asks: the model on the water, then the row's own
   copy, then nothing. It is asked with the quote alone — by the label
   the quote froze — because the paper renders with no catalogue at all.
   So the photograph the picker's card showed and the stage stood on is
   the photograph that lands on the cover, and the plan's one
   choreography ends on the boat.

   A MARK ON PAPER NEEDS DARK INK, which is the one thing this ladder
   asks differently from the stage. `docs/research/refs/document/
   notes.md` §6 counted it: Mercury publishes its mark in WHITE INK ONLY,
   so on paper Mercury is a word. `markOnPaper` refuses it
   with that reason, and the note beside the paper says it.

   AND THE DEALER'S OWN MARK IS NOT IN THE LEDGER. §6 again: a quote is
   letterhead, and a board that draws the dealer's logo is drawing an
   asset we cannot ship. So the letterhead is the business's name set as
   type, and the note says so once rather than drawing a grey rectangle
   where a logo would go. `docs/CUSTOMISATION.md` is where Northside
   sets its own.

   THE COVER PICTURE IS A BAND AND NEVER A BLEED, and that is measured
   rather than chosen: A4 at 300 dpi is 2480 × 3508 px and not one held
   picture is 3508 px tall, so a cover that filled the page would be
   enlarging somebody's photograph past its own pixels. The band's
   height is the stylesheet's; this file carries the held size, so the
   note can print what was held and what was drawn.
   ============================================================ */
import {
  hostOf,
  markOnPaper,
  pictureOfQuote,
  type HeldMark,
  type HeldPicture,
} from '@/data/pictures'
import type { QuoteDef } from '@/domain/model'

export { hostOf }

/** What the cover draws for this boat, and why it draws that. */
export type CoverArt =
  | { kind: 'photograph'; held: HeldPicture }
  | { kind: 'mark'; mark: HeldMark; because: string }
  | { kind: 'word'; because: string }

/**
 * WHAT TO PUT ON THE COVER for this quote's boat, down the ladder: the
 * boat's picture (the model on the water, then the row's own copy), then
 * the maker's mark in the ink paper needs, then the name set as type —
 * each rung carrying, in the dealer's words, the reason the rung above it
 * could not be taken.
 */
export function coverArt(quote: QuoteDef, register: string): CoverArt {
  const held = pictureOfQuote(quote)
  if (held) return { kind: 'photograph', held }

  const address = quote.subjectImage?.src.trim() ?? ''
  const missing =
    address === ''
      ? 'The price file names no picture for this boat, so nothing is printed and nothing is invented.'
      : 'No photograph of this boat is held yet, so nothing stands in for one.'

  const mark = markOnPaper(register)
  return mark.drawn
    ? { kind: 'mark', mark: mark.mark, because: missing }
    : { kind: 'word', because: `${missing} ${mark.because}` }
}

/**
 * THE LINE UNDER A PHOTOGRAPH OF THE MODEL, on the customer's paper.
 *
 * The heroes ledger holds one photograph per MODEL, taken by its maker in
 * the maker's own finish and with the maker's own rig — the build's stage
 * says so under it (`configurator/say.ts`, `pictureSays`), and the paper a
 * customer keeps owes them the same courtesy a brochure's "shown with
 * optional equipment" does. The row's own copy is the exact boat on the
 * quote and needs no line.
 */
export function pictured(held: HeldPicture): string | null {
  if (held.tier !== 'hero' || held.subject === '') return null
  return `Pictured: the ${held.subject}, in its maker’s own finish and rig.`
}
