/* ============================================================
   A STEP ON SETTINGS, KEPT: the one way a change on this screen is
   applied, for the paper and the water alike. A refusal comes back as
   its sentence, said where it was refused; a kept change is said with
   its Undo, pinned to the inverse of exactly this step.

   WHERE ITS UNDO STANDS (the verifier of Settings, round 2: "the Undo
   toast still stands for 8 s over live controls"). At a desk the two
   halves stand side by side, and the toaster's corner is over whichever
   half was not pressed: a terms line kept on the paper stood its Undo
   over a photograph's Home press on the water. There the card stands in
   the band beside the pill instead, which at a desk is the stage's own
   navy or the index's head, and never a control. In a hand it stands
   above the foot as everywhere, and the part pressed is scrolled clear
   of it (`clearOfTheToast`).
   ============================================================ */

import { say, undo } from '@/ui'
import { isDone, type CatalogueCommand } from '@/domain/catalogue/commands'
import { catalogue } from '@/state/catalogue'
import { DESK, clearOfTheToast } from './hooks'

const atADesk = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(DESK).matches

/** Say a step that has no way back of its own, where a step's Undo would stand. */
export function sayStep(text: string): void {
  say(text, { id: 'manage-step', ...(atADesk() ? { position: 'top-right' as const } : {}) })
}

/** Apply a settings change; a refusal comes back as its sentence, a kept change as its Undo. */
export function keep(command: CatalogueCommand): string | null {
  const outcome = catalogue.getState().apply(command)
  if (!isDone(outcome)) return outcome.refused === '' ? null : outcome.refused
  const eventId = outcome.event.id
  const position = atADesk() ? ('top-right' as const) : undefined
  const where = position ? { position } : {}
  undo(
    outcome.said,
    () => {
      const back = catalogue.getState().undo(eventId)
      if (isDone(back)) say(back.said, { id: 'manage-step', ...where })
      else if (back.refused !== '') say(back.refused, { id: 'manage-step', ...where })
    },
    { id: 'manage-step', testId: 'manage-step', ...where },
  )
  if (!position) clearOfTheToast()
  return null
}
