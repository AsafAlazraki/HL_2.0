/* ============================================================
   APPLYING A LEVEL — the only part of this feature that writes.

   IT GOES THROUGH `updateCell`, ONE ROW AT A TIME, AND THAT IS NOT A
   COMPROMISE. Three properties fall out of it that a bespoke bulk
   mutation would have had to re-earn:

     1. ONE ACT IS ONE UNDO STEP. The old store's header stated the
        contract: "All the recording that happens in one turn of the
        event loop collapses into one entry, closed on the following
        microtask." So 187 `updateCell` calls in one synchronous loop
        were ONE history entry labelled "187 cell edits · Highfield
        Inflatables", and Ctrl+Z put every one of the 187 back
        together — and the loop had to stay synchronous, with no
        `await`, no `setTimeout`, no chunking, or it would have been
        187 undo steps. Here the grouping is SAID rather than noticed:
        the 187 cell edits are one `batch`, whose inverse is the 187
        inverses, and the property no longer depends on which
        microtask anything ran in.

     2. IT PERSISTS. The store stamps `updatedAt` on each row it
        writes and schedules the flush. Nothing here knows or needs to
        know that.

     3. IT IS REFUSED IN THE SAME PLACE EVERYTHING ELSE IS. A cell the
        sheet will not take — a calculated column, a row that has gone
        — is refused by `updateCell` with its own sentence, and the
        batch refuses whole with it. This file does not re-implement
        that check, so it can never disagree with it.

   AND IT FLOWS ONTO THE QUOTES BY DOING NOTHING. The cells are real.
   A quote built after this reads the rows and finds the new value; a
   quote built before it holds what it held, because a quote is a
   document about a moment. There is no propagation step, because
   there is nothing to propagate.

   THE TOAST IS RULE 9, AND IT IS THE STORE'S `onApplied`, NOT A
   DIALOG. The act is undoable, so it is done first and reported
   after, with UNDO on the note pinned to the exact step it is about.
   Nothing here asks a question — the blast radius was on screen,
   computed, before the button was pressed.

   PORT NOTE. `features/levels/apply.ts` reached for
   `useProjectStore.getState().updateCell` and the say bus. This
   takes the store's `apply` as a port — handed in, never reached
   for — and returns the same three fields the old result carried.
   ============================================================ */

import {
  batch,
  updateCell,
  isDone,
  type CatalogueCommand,
  type Outcome,
} from '@/domain/catalogue/commands'
import type { LeafNoun } from '@/domain/catalogue/table/grouping'
import { describeDone, type SetPlan } from './levels'

export interface ApplyResult {
  /** how many cells were written */
  written: number
  /** the sentence that was said, so a caller can log or test it */
  said: string
  /** why nothing happened, when nothing happened */
  refusal: string | null
}

/** The one act a plan becomes: every write, as one step, saying the
 *  plan's own sentence. Null when the plan carries a refusal. */
export function levelPlanCommand(plan: SetPlan, noun: LeafNoun): CatalogueCommand | null {
  if (plan.refusal !== null) return null
  return batch(
    plan.writes.map((rowId) => updateCell(plan.entityId, rowId, plan.fieldId, plan.value)),
    { said: describeDone(plan, noun) },
  )
}

/**
 * Runs a plan.
 *
 * A plan carrying a refusal is not run and not reported as done —
 * the refusal was already on screen where the act was refused
 * (rule 10), and saying it a second time in a toast would be the
 * app telling somebody something they are already looking at.
 *
 * `apply` is the store's own door, handed in. A batch the sheet
 * refuses comes back as that refusal, with nothing written.
 */
export function applyLevelPlan(
  plan: SetPlan,
  noun: LeafNoun,
  apply: (command: CatalogueCommand) => Outcome,
): ApplyResult {
  const command = levelPlanCommand(plan, noun)
  if (command === null) return { written: 0, said: '', refusal: plan.refusal }

  const outcome = apply(command)
  if (!isDone(outcome)) {
    return { written: 0, said: '', refusal: outcome.refused === '' ? null : outcome.refused }
  }
  return { written: plan.writes.length, said: outcome.said, refusal: null }
}
