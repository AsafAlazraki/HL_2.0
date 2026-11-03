import { useCallback, useEffect, useState } from 'react'
import { say, undo, unsay } from '@/ui'
import { catalogue } from '@/state/catalogue'
import { isDone } from '@/domain/catalogue/commands'
import type { CatalogueCtx } from '@/domain/model'
import type { BoatFit, Place } from '@/domain/fitment/boat'
import { changeFit, starFit, type FitChange, type FitWay } from '@/domain/fitment/change'

/* ============================================================
   ONE PRESS PUTS A THING ON A BOAT, TAKES IT OFF, OR MAKES IT THE
   RECOMMENDED — said with its Undo; the plate's tiles and the whole
   list's lines share it.

   ON EVERY VERSION OF THE MODEL (the fitment judge, 2026-11-03,
   blocker 1): the screen hands in the model's versions, so the step is
   made on each and its sentence counts them.

   A refusal is kept against the thing it refused, so the screen says
   it where the press was made (rule: a refusal is a sentence with its
   reason, where it is refused), and it goes the moment another press
   is made.
   ============================================================ */

const STEP = 'fitment-step'

export interface FitRefusal {
  rowId: string
  why: string
}

interface Held extends FitRefusal {
  /** the boat it was refused on: another boat's refusal is never said on this one */
  boat: string
}

export type FitAct = FitWay | 'star'

export function useFitChange(ctx: CatalogueCtx, fit: BoatFit | null, versions: readonly Place[]) {
  const [held, setRefusal] = useState<Held | null>(null)
  useEffect(() => () => unsay(STEP), [])
  const boat = fit?.place.rowId ?? ''
  const refusal: FitRefusal | null = held && held.boat === boat ? held : null

  const change = useCallback(
    (target: Place, act: FitAct, place: 'motor' | 'trailer' = 'motor'): void => {
      if (!fit) return
      const asked: FitChange =
        act === 'star'
          ? starFit(ctx, fit, target, place, versions)
          : changeFit(ctx, fit, target, act, versions)
      if ('refused' in asked) {
        setRefusal(asked.refused === '' ? null : { boat, rowId: target.rowId, why: asked.refused })
        return
      }
      const outcome = catalogue.getState().apply(asked.command)
      if (!isDone(outcome)) {
        setRefusal(
          outcome.refused === '' ? null : { boat, rowId: target.rowId, why: outcome.refused },
        )
        return
      }
      setRefusal(null)
      const eventId = outcome.event.id
      undo(
        asked.said,
        () => {
          const back = catalogue.getState().undo(eventId)
          say(isDone(back) ? back.said : back.refused || 'Nothing to change.', { id: STEP })
        },
        { id: STEP },
      )
    },
    [ctx, fit, boat, versions],
  )

  return { change, refusal }
}
