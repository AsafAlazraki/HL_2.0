/* ============================================================
   THE BOAT'S CHOICES, AS THE HULL CHAPTER DRAWS THEM.

   The axes are the domain's (`boatChoices`, src/domain/quote/choices.ts:
   read off the file, counted, every figure the engine's). This adds the
   one thing a pure module may not reach: each option's own picture,
   from the image ledger, under the ledger's own rule — a picture belongs
   only to the exact thing it depicts.

     · a MODEL or a VERSION is drawn with its own picture on the reader's
       ladder (`pictureOf`: the model on the water, then the row's own
       copy, then the picture a person attached to its model) — every one
       of them a picture of that model;
     · a COLOUR is drawn with the colourway's own render only (`copyOf`),
       never another colourway's, and with its swatches where none is held;
     · a MATERIAL is a word, and has no picture.
   ============================================================ */

import type { CatalogueCtx, QuoteDef } from '@/domain/model'
import { boatChoices, goodsChoices, type AxisId, type BoatOption } from '@/domain/quote/choices'
import { goodsFacts } from '@/domain/quote/goodsFacts'
import { copyOf, creditOf, itemOf, pictureOf, srcSetOf, type HeldPicture } from '@/data/pictures'
import type { OptionRow } from './chapters'

export interface DrawnOption extends BoatOption {
  picture: OptionRow['picture']
  /** the picture is a photograph on the water, which fills its well; a maker's drawing or render
   *  stands whole in it */
  scene: boolean
  /** WHAT TELLS ONE MOTOR FROM THE NEXT, as its own row states it — "150 hp · 228 kg · 20″
   *  shaft" (`goodsFacts`, the words the same motor wears offered on a boat's quote). A motor-only
   *  quote's tiles read "F130LA", "LF150XC +$17", "F150LD no change" and nothing else, so a person
   *  could not tell what differs (the paper-quote critique, 2026-10-31, gap 10). '' on a boat's
   *  axes and on any row whose register carries none of the three. */
  facts: string
}

export interface DrawnAxis {
  id: AxisId
  title: string
  /** "9 nearest of 138" where the axis draws fewer than its series holds (`goodsChoices`) */
  count?: string
  options: DrawnOption[]
  /** whether any option on the axis carries a picture, so the axis is drawn as pictures */
  pictured: boolean
}

export interface DrawnChoices {
  axes: DrawnAxis[]
  series: string
  siblings: number
  why: string
}

function drawn(held: HeldPicture | null): OptionRow['picture'] {
  if (!held) return null
  const srcSet = srcSetOf(held)
  return {
    src: held.src,
    width: held.width,
    height: held.height,
    ...(srcSet ? { srcSet } : {}),
    credit: creditOf(held),
  }
}

/** The hull chapter's choices, each option with the picture the ledger holds for it; on a quote
 *  for a motor, a trailer or a part, its own chapter's, the ones beside it on the price list
 *  (`goodsChoices`), each with its own row's picture. */
export function readBoatChoices(ctx: CatalogueCtx, quote: QuoteDef): DrawnChoices {
  const root = ctx.entities[quote.rootTableId]
  const boat = root?.kind === 'boat'
  const choices = boat ? boatChoices(ctx, quote) : goodsChoices(ctx, quote)
  const rows = boat ? [] : (ctx.rowsByEntity[quote.rootTableId] ?? [])
  return {
    series: choices.series,
    siblings: choices.siblings,
    why: choices.why,
    axes: choices.axes.map((axis) => {
      const options = axis.options.map((option) => {
        const item = itemOf(quote.rootTableId, option.rowId, option.address)
        const held =
          axis.id === 'material' ? null : axis.id === 'colour' ? copyOf(item) : pictureOf(item)
        const facts = boat
          ? ''
          : goodsFacts(
              root,
              rows.find((r) => r.id === option.rowId),
            )
        return { ...option, picture: drawn(held), scene: held?.verdict === 'scene', facts }
      })
      return {
        id: axis.id,
        title: axis.title,
        ...(axis.count ? { count: axis.count } : {}),
        options,
        pictured: options.some((o) => o.picture !== null),
      }
    }),
  }
}
