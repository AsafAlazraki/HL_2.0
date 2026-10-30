import { useCallback, useEffect, useState } from 'react'
import { say, undo, unsay } from '@/ui'
import { catalogue } from '@/state/catalogue'
import { isDone } from '@/domain/catalogue/commands'
import type { CatalogueCtx } from '@/domain/model'
import type { BoatFit, Place } from '@/domain/fitment/boat'
import { changeFit, type FitWay } from '@/domain/fitment/change'

/* ============================================================
   ONE PRESS PUTS A THING ON A BOAT OR TAKES IT OFF, said with its
   Undo — the plate's tiles and the whole list's lines share it.

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

export function useFitChange(ctx: CatalogueCtx, fit: BoatFit | null) {
  const [held, setRefusal] = useState<Held | null>(null)
  useEffect(() => () => unsay(STEP), [])
  const boat = fit?.place.rowId ?? ''
  const refusal: FitRefusal | null = held && held.boat === boat ? held : null

  const change = useCallback(
    (target: Place, way: FitWay): void => {
      if (!fit) return
      const asked = changeFit(ctx, fit, target, way)
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
    [ctx, fit, boat],
  )

  return { change, refusal }
}
