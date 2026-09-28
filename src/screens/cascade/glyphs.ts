import {
  AnchorIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  QuestionIcon,
  TagIcon,
} from '@phosphor-icons/react'
import type { CatalogueCtx, QuoteDef, TableKind } from '@/domain/model'
import type { Glyph } from '@/ui'
import type { Fate } from './proposal'

/* ============================================================
   THE CASCADE'S GLYPHS (the component kit, 2026-09-28).

   A FATE IS SAID IN A WORD AND READ BY ITS GLYPH. The word on a
   card's head — Re-priced, Held, Comes off, Goes on, Not checked —
   is what happens to the lines under it; the glyph beside it is what
   lets a dealer run an eye down four cards and see which of them
   move money. A new price tag for a line re-priced; an anchor for a
   line that is held where it is, because this is a boat dealer's app
   and "held" is what an anchor does; a minus and a plus for a line
   that comes off and one that goes on; a question for what could not
   be checked at all. None of them is a kind's glyph or a state's
   (src/ui/glyphs.ts), so a fate never reads as a motor or a draft.

   THE FATE HAS NO INK OF ITS OWN. The kit gives every ink one job
   (tokens.css, THE KIT) and none of them is "what happens to a line":
   the glyph is drawn in the well's own ink, and the word says it.

   A LEVEL'S GLYPH AND THE BOAT'S TRAVEL NAME ARE THE BUILD'S, imported
   rather than spelt again (src/screens/configurator/glyphs.ts): the
   rung a dealer picked on the build must be the same money or
   handshake here, and the photograph that stood on the build's stage
   lands on this card only if both screens name it the same way.
   ============================================================ */

export const FATE_GLYPH: Record<Fate, Glyph> = {
  moves: TagIcon,
  holds: AnchorIcon,
  off: MinusCircleIcon,
  on: PlusCircleIcon,
  unchecked: QuestionIcon,
}

/**
 * WHAT A LINE ON THE SHEET IS, read off the table its frozen line was picked from — a hull,
 * a motor, a trailer, a rigging kit — so the row carries the kind's own glyph in its own ink.
 *
 * A line the decision PUTS ON has no frozen line on this quote yet: the new hull of a finish
 * change is the one such line (`finishProposal` names it with the cause that has no reason),
 * and its table is the quote's own root. Anything else not on the quote has no kind to say,
 * and draws none rather than a guess.
 */
export function kindOfLine(
  ctx: CatalogueCtx,
  quote: QuoteDef,
  lineId: string,
  askedHull: boolean,
): TableKind | undefined {
  const line = quote.lines.find((l) => l.id === lineId)
  const table = line ? line.entityId : askedHull ? quote.rootTableId : undefined
  return table === undefined ? undefined : ctx.entities[table]?.kind
}

export { boatTravel, levelGlyph } from '@/screens/configurator/glyphs'
