/* ============================================================
   WHAT GOES ON THE COVER OF A SHEET OF PAPER, AND WHAT IS SAID WHERE
   NOTHING CAN.

   THE SAME READER THE BUILD'S STAGE ASKS, AND THE PAPER'S OWN QUESTION.
   Since 2026-10-20 the cover asks `coverOfQuote` (`forCover` in
   `@/domain/model/pictures`): the model on the water where a person
   marked that photograph (a hero the machine chose stays on the
   screens), the row's own copy, or a picture a person marked as exactly
   this row — never one a
   person refused for it (the REDCO and TINKA logos a trailer row points
   at; the 529 Assault photograph the 509's row points at), and never a
   render of the model in another colourway, which a screen may show
   captioned as the model's and a customer's paper may not.
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

   THE DEALER'S OWN MARK IS THE LETTERHEAD (since 2026-10-20). §6 again:
   a quote is letterhead. Northside Marine's dark-ink mark, taken from
   its own site's header, is in `marks-ledger.json` as the organisation's
   mark, and the cover prints it (`letterheadOf` in `@/data/pictures`).
   Where none is held, the name is set as type and the note says so once,
   rather than drawing a grey rectangle where a logo would go.

   THE COVER PICTURE IS A BAND AND NEVER A BLEED, and that is measured
   rather than chosen: A4 at 300 dpi is 2480 × 3508 px and not one held
   picture is 3508 px tall, so a cover that filled the page would be
   enlarging somebody's photograph past its own pixels. The band's
   height is the stylesheet's; this file carries the held size, so the
   note can print what was held and what was drawn.
   ============================================================ */
import { coverOfQuote, hostOf, markOnPaper, type HeldMark, type HeldPicture } from '@/data/pictures'
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
  /* THE PAPER'S OWN QUESTION (`forCover`): never a picture a person refused for this row — a
     logo, a sister model — and never a render of the model in another colourway */
  const found = coverOfQuote(quote)
  if (found.held) return { kind: 'photograph', held: found.picture }

  const address = quote.subjectImage?.src.trim() ?? ''
  /* IN THE DEALER'S WORDS (docs/WORDS.md): the reader's sentence carries the person's reason as
     it was written in the picture ledger ("… on a centre-console row"), which is the engine's
     word. The note says what the photograph shows instead (`refusedSay`). Matched exactly, so a
     new wording in the reader falls back to one plain sentence. */
  const refused = /^The price file’s own picture for this item is refused: (.+)\.$/.exec(
    found.because,
  )
  const missing = refused
    ? refusedSay(refused[1])
    : /refused/.test(found.because)
      ? REFUSED_PLAIN
      : address === ''
        ? 'The price list names no picture for this boat, so none is printed.'
        : 'No photograph of this boat yet.'

  const mark = markOnPaper(register)
  return mark.drawn
    ? { kind: 'mark', mark: mark.mark, because: missing }
    : { kind: 'word', because: `${missing} ${mark.because}` }
}

const REFUSED_PLAIN = 'The price list’s photograph is of another model, so it is left off.'

/** The engine's words a person's reason may carry (docs/WORDS.md): with any of them the reason
 *  is not printed, only the plain sentence. */
const ENGINE = /\b(rows?|file|table|column|register)\b/i

/**
 * WHY THE PRICE LIST'S PHOTOGRAPH IS LEFT OFF THE COVER, as the dealer says it: what the
 * photograph shows, never where the ledger filed it. docs/WORDS.md's own sentence is the 519
 * Centre Console's: "The price list's photograph shows the side console, so it is left off."
 */
export function refusedSay(rule: string): string {
  const said = (shows: string): string =>
    ENGINE.test(shows)
      ? REFUSED_PLAIN
      : `The price list’s photograph shows ${shows}, so it is left off.`
  const model = /^not that exact model(?: \((.+)\))?$/.exec(rule.trim())
  if (!model) return said(rule.trim())
  const why = model[1] ?? ''
  /* "side console shown on a centre-console row" */
  const shown = /^(.+?) shown on an? .+$/.exec(why)
  if (shown) return said(`the ${shown[1]}`)
  /* "a sister floor: the AL render on a KAM row" */
  const render = /^a sister (\w+): the (\S+) render on an? (\S+) \w+$/.exec(why)
  if (render) return said(`the ${render[2]} ${render[1]}, not the ${render[3]}`)
  /* "a different configuration: steering console, not tiller" */
  const layout = /^a different configuration: (.+), not (.+)$/.exec(why)
  if (layout) return said(`a ${layout[1]}, not a ${layout[2]}`)
  /* "a sister model" */
  if (/^an? [\w -]+$/.test(why)) return said(why)
  return REFUSED_PLAIN
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
  if (held.tier === 'hero' && held.subject !== '') {
    return `Pictured: the ${held.subject}, in its maker’s own finish and rig.`
  }
  /* A PERSON SAW SOMETHING IN IT THE QUOTE MAY NOT SAY — the 529's Evinrude, a bimini, a
     trailer under a render — recorded as `differs` in pictures.json. The customer is told
     only that the picture may differ; the dealer's note names what. */
  if (held.differs.length > 0) {
    return 'Pictured with equipment that may differ from this quote. Your boat is as quoted below.'
  }
  return null
}
