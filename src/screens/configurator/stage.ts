/* ============================================================
   WHAT STANDS ON THE STAGE, AND WHAT IS SAID WHERE NOTHING CAN.

   THE SWEEP'S RULE, §6, and it is the one every direction had to
   answer: "a second dealership replaces the photographs and the
   mark, so every direction must degrade photograph → mark →
   wordmark; a chapter head that NEEDS a photograph has no Stabicraft
   chapter." This is that ladder, as one function, so the screen has
   one thing to draw and one sentence to print.

   AND THE OTHER HALF OF §6: "the stage cannot answer the rail."
   Porsche swings ten cameras to the option you picked. The pack
   holds ONE picture per model, no interiors, no second angle, and a
   colourway render for very few — so a stage that responded to a
   motor would be promising a render pipeline that does not exist.
   This stage shows the HULL and changes only when the hull does,
   which on this screen is the finish chapter and nothing else.

   NOTHING IS ENLARGED. The reader hands back the held copy's own pixel
   width and height, and they are handed to the stylesheet as the
   ceiling, exactly as entry and home do with theirs.

   THE PICTURE IS THE ONE READER'S (`@/data/pictures`, over
   `@/domain/model/pictures`), since 2026-10-20: the model's photograph
   on the water where `pictures.json` holds one for this row's model,
   then the row's own copy, then the picture a person attached to its
   model. This file used to read the three ledgers for itself; it now
   only walks the ladder below them — the maker's mark in the ink this
   dark room needs, then the name set as type.
   ============================================================ */
import type { CatalogueCtx, QuoteDef } from '@/domain/model'
import {
  heroOf,
  hostOf,
  itemOfQuote,
  markOnDark,
  pictureOf,
  type HeldMark,
  type HeldPicture,
  type Item,
} from '@/data/pictures'

export { hostOf }

/** A picture this repository actually ships, at the size it ships it. `beyond` is what this
 *  quote's row says beyond the hull a photograph is of — "Side Console" on the Stacer 519,
 *  whose one photograph is drawn for both of its consoles — which the caption says (`say.ts`),
 *  so the picture never implies a version it may not show. */
export type Held = HeldPicture

/** A maker's wordmark in the ink it is published in. */
export type Mark = HeldMark

/** What the stage draws for one hull, and why it draws that. */
export type StageArt =
  | { kind: 'photograph'; held: Held }
  | { kind: 'mark'; mark: Mark; because: string }
  | { kind: 'word'; because: string }

/**
 * THE STAGE PHOTOGRAPH FOR THE HULL THIS QUOTE IS ROOTED ON, or nothing — the model on the
 * water, attached to this row's model by row id in `pictures.json`, never by a name standing
 * inside a longer one. A quote whose row the open sheet no longer holds draws nothing here
 * rather than a picture of a row nobody can open.
 */
export function hullHero(ctx: CatalogueCtx, quote: QuoteDef): Held | null {
  const table = ctx.entities[quote.rootTableId]
  if (!table) return null
  const row = (ctx.rowsByEntity[quote.rootTableId] ?? []).find((r) => r.id === quote.rootRowId)
  if (!row) return null
  return heroOf(itemOfQuote(quote))
}

/**
 * WHAT TO PUT ON THE STAGE for this hull, down the ladder: the model's own photograph on the
 * water, then the catalogue picture (the row's own copy, then the picture a person attached to
 * its model), then the maker's mark in the ink this dark room needs, then the name set as
 * type — each step carrying the reason the step above it could not be taken.
 */
export function stageArt(
  item: Item,
  register: string,
  hero: Held | null = null,
  /** what the quote is for, as a person says it: a part is not a boat (`quoteSells`) */
  noun = 'boat',
): StageArt {
  if (hero) return { kind: 'photograph', held: hero }

  const held = pictureOf(item)
  if (held) return { kind: 'photograph', held }

  /* IN A DEALER'S WORDS (M2-close critique #4; docs/WORDS.md since the refine round, 2026-10-21:
     "No photograph of this boat yet." as one sentence, the same on every screen). The maker's
     mark beside it says itself; "so its maker's mark is shown" explained what was in view. */
  const missing =
    item.address === undefined || item.address === ''
      ? `The price list names no picture for this ${noun}`
      : `No photograph of this ${noun} yet`
  /* THE DARK ROOM WANTS WHITE INK. A maker publishes the ink it publishes; a dark wordmark on
     this screen's ground is a smudge, and recolouring somebody else's mark is not an option a
     ledger can offer. */
  const mark = markOnDark(register)
  if (mark.drawn) {
    return { kind: 'mark', mark: mark.mark, because: `${missing}.` }
  }
  if (
    register.trim() !== '' &&
    /^[^:]+: /.test(mark.because) &&
    !mark.because.includes(' ink only')
  ) {
    return { kind: 'word', because: `${missing}. ${mark.because}` }
  }
  /* A LIST SOLD ON ITS OWN THAT HAS NO MAKER (Parts & Accessories) is not missing a maker's mark:
     its name in type is all there is to say (start-needs.md, item 4) */
  if (noun !== 'boat') return { kind: 'word', because: `${missing}.` }
  return {
    kind: 'word',
    because: `${missing}, and no mark for its maker either, so the name is set in type.`,
  }
}
