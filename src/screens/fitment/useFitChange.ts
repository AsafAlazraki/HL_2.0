import { useCallback, useState } from 'react'
import { catalogue } from '@/state/catalogue'
import { isDone } from '@/domain/catalogue/commands'
import type { CatalogueCtx } from '@/domain/model'
import type { BoatFit, Place } from '@/domain/fitment/boat'
import { changeFit, starFit, type FitChange, type FitWay } from '@/domain/fitment/change'
import { standingChanges } from '@/domain/fitment/page'

/* ============================================================
   CHANGING WHAT NORTHSIDE OFFERS ON A BOAT, ONLY IN CHANGE MODE
   (the fit flow, direction A, 2026-11-05).

   One press puts a thing on the boat, takes it off, or makes it the
   recommended, on every version of the model, as one catalogue step —
   or, for a line made for one version alone, on that version (`only`).

   NO TOAST (the walk, majors 12 and the toast over the last rows): the
   step is kept in the page's own list of changes, said once in the
   past tense, with Undo it beside it. A refusal is kept against the
   line it refused, so the page says it where the press was made, and
   it goes the moment another press is made.

   WHAT UNDO SAYS IS WHAT IS NOW SO (walk 2, F7): "Undone. No longer
   so: The Yamaha F150XC is taken off …" was read at a glance as the
   take-off. The step's own way back says "Undone: the Yamaha F150XC
   goes on the Highfield Patrol 600 again, …". And the count is of the
   changes that still stand (walk 2, F9): off and back on is none.
   ============================================================ */

export interface FitRefusal {
  rowId: string
  why: string
}

interface Held extends FitRefusal {
  /** the boat it was refused on: another boat's refusal is never said on this one */
  boat: string
}

export type FitAct = FitWay | 'star'

/** One change made here, and the step that undoes it. */
export interface Made {
  said: string
  /** what is so once it is undone */
  back: string
  eventId: string
  target: string
  act: FitAct
}

/** `name` is the model as the page's title says it ("Highfield Patrol 600"): a change is made on
 *  every version, so its sentence names the model, never the version's own name ("… 600 Open"). */
export function useFitChange(
  ctx: CatalogueCtx,
  fit: BoatFit | null,
  versions: readonly Place[],
  name = '',
) {
  const [held, setRefusal] = useState<Held | null>(null)
  const [ledger, setLedger] = useState<Made[]>([])
  /* what the last Undo said, until the next press */
  const [undone, setUndone] = useState('')
  const boat = fit?.place.rowId ?? ''
  const refusal: FitRefusal | null = held && held.boat === boat ? held : null

  const change = useCallback(
    (
      target: Place,
      act: FitAct,
      place: 'motor' | 'trailer' = 'motor',
      only?: readonly Place[],
    ): void => {
      if (!fit) return
      setUndone('')
      /* a change made on this version alone names the version, never the whole model */
      const model = only
        ? { ...fit, name: [fit.name, fit.detail].filter((s) => s !== '').join(' · ') }
        : name === ''
          ? fit
          : { ...fit, name }
      const reach = only ?? versions
      const asked: FitChange =
        act === 'star'
          ? starFit(ctx, model, target, place, reach)
          : changeFit(ctx, model, target, act, reach)
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
      setLedger((was) => [
        ...was,
        {
          said: asked.said,
          back: asked.back,
          eventId: outcome.event.id,
          target: target.rowId,
          act,
        },
      ])
    },
    [ctx, fit, boat, versions, name],
  )

  /** Undo the last change made here; the page then says what is so again. */
  const undoLast = useCallback((): void => {
    const last = ledger.at(-1)
    if (!last) return
    const back = catalogue.getState().undo(last.eventId)
    setRefusal(null)
    if (isDone(back)) {
      setLedger((was) => was.slice(0, -1))
      setUndone(`Undone: ${last.back.charAt(0).toLowerCase()}${last.back.slice(1)}`)
    } else {
      setUndone(back.refused || 'That change could not be undone.')
    }
  }, [ledger])

  /** A press the screen itself refuses (a trailer over its ATM), said where it was pressed. */
  const refuse = useCallback(
    (rowId: string, why: string): void => setRefusal(why === '' ? null : { boat, rowId, why }),
    [boat],
  )

  const standing = standingChanges(ledger)

  return { change, refusal, refuse, ledger, standing, undoLast, undone }
}
