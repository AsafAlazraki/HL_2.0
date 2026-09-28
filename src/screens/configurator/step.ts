import { SUBJECT_CHAPTER, type QuoteDef, type TableKind } from '@/domain/model'
import type { Act } from './chapters'

/* ============================================================
   THE LAST STEP, AND WHETHER ITS WAY BACK CAN WORK.

   The build's toast says the last thing that happened on this document
   and, beside it, the way back from it (it stood in the rail's head
   until 2026-09-28). It offered one on EVERY step,
   and the step `Give it to the customer` leaves is the one act in this
   app that has none: `issue` hands the store `NO_WAY_BACK`
   (`src/domain/quote/commands.ts`), and `apply` refuses every other
   inverse once a quote is issued. So each freshly given quote carried
   "20260924-01 is issued · Undo", and the press raised a third copy of
   "nothing can go back on it" on one screen — an act offered and
   refused in the same place (built-critique-m2-close-2.md, major 2).

   AN ACT THAT CANNOT WORK IS NEVER OFFERED, and this is the one place
   that decides whether this one can. The way on from an issued quote is
   `Make a new version`, in the finale, and that act does work.
   ============================================================ */

/** The last thing that happened, in the command's own sentence, and
 *  the event it minted — which is what the way back is pinned to. */
export interface Step {
  said: string
  eventId: string
  /** this step was itself a way back, so the offer is to put it back */
  wasUndo: boolean
  /** the kind of thing it happened to, where it happened to one — the glyph the toast
   *  that says it wears (a motor's, a trailer's, the boat's); a name has none */
  kind?: TableKind
}

/** The kind of the table a chapter of this document draws, where it names one. */
export function kindOf(
  quote: Pick<QuoteDef, 'chapters'>,
  chapterId: string,
): TableKind | undefined {
  return quote.chapters.find((chapter) => chapter.id === chapterId)?.kind
}

/** The kind of the boat the document is for: what a finish or a price on the hull is said with. */
export function kindOfBoat(quote: Pick<QuoteDef, 'chapters'>): TableKind | undefined {
  return kindOf(quote, SUBJECT_CHAPTER)
}

/**
 * THE KIND OF THING A PRESS WROTE TO, read off the document: the chapter a line goes into or
 * comes out of, and the boat's own for a finish. Nothing is guessed from a label, so a line
 * whose chapter names no kind is said with no glyph.
 */
export function kindOfAct(
  act: Act,
  quote: Pick<QuoteDef, 'chapters' | 'sections'>,
): TableKind | undefined {
  if (act.do === 'refinish') return kindOfBoat(quote)
  const blockId =
    act.do === 'add'
      ? act.blockId
      : quote.sections.find((section) => section.lineIds.includes(act.lineId))?.blockId
  return blockId === undefined ? undefined : kindOf(quote, blockId)
}

/** The words on the way back, when there is one. */
export type WayBack = 'Undo' | 'Put it back'

/**
 * The way back from `step` on `quote`, or null when none can work.
 *
 * TWO FACTS, BOTH READ OFF THE DOCUMENT:
 *  · A QUOTE THAT IS NOT A DRAFT REFUSES EVERY COMMAND, the way back
 *    included. That is `apply`'s first line, and it is why an issued
 *    quote's step is a sentence with nothing beside it.
 *  · THE STEP IS THE LAST THING THAT HAPPENED ON IT. The store pins a
 *    press to the step's event and refuses when anything has happened
 *    since ("that step is no longer the one to go back on"), so a step
 *    something else has moved past has nothing to offer either. Every
 *    command appends its event to the document's diary, the undone and
 *    the redone included, so the diary's last entry is the one question.
 */
export function wayBack(step: Step, quote: Pick<QuoteDef, 'state' | 'events'>): WayBack | null {
  if (quote.state !== 'draft') return null
  const last = quote.events[quote.events.length - 1]
  if (last?.id !== step.eventId) return null
  return step.wasUndo ? 'Put it back' : 'Undo'
}
