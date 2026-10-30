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
import { boatChoices, type AxisId, type BoatOption } from '@/domain/quote/choices'
import { copyOf, creditOf, itemOf, pictureOf, srcSetOf, type HeldPicture } from '@/data/pictures'
import type { OptionRow } from './chapters'

export interface DrawnOption extends BoatOption {
  picture: OptionRow['picture']
}

export interface DrawnAxis {
  id: AxisId
  title: string
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

/** The hull chapter's choices, each option with the picture the ledger holds for it. */
export function readBoatChoices(ctx: CatalogueCtx, quote: QuoteDef): DrawnChoices {
  const choices = boatChoices(ctx, quote)
  return {
    series: choices.series,
    siblings: choices.siblings,
    why: choices.why,
    axes: choices.axes.map((axis) => {
      const options = axis.options.map((option) => {
        const item = itemOf(quote.rootTableId, option.rowId, option.address)
        const picture =
          axis.id === 'material'
            ? null
            : axis.id === 'colour'
              ? drawn(copyOf(item))
              : drawn(pictureOf(item))
        return { ...option, picture }
      })
      return {
        id: axis.id,
        title: axis.title,
        options,
        pictured: options.some((o) => o.picture !== null),
      }
    }),
  }
}
