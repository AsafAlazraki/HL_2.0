import { useCallback, useState } from 'react'
import { ArrowCounterClockwiseIcon, ArrowClockwiseIcon } from '@phosphor-icons/react'
import { isDone, type CatalogueCommand } from '@/domain/catalogue/commands'
import { catalogue } from '@/state/catalogue'
import { Button, Refusal } from '@/ui'

/* ============================================================
   ONE CHANGE NORTHSIDE MADE HERE, SAID WHERE IT WAS MADE, WITH ITS
   WAY BACK — a supplier named, a heading put in an aisle, pictures
   placed by their codes. Each is one command on the catalogue's own
   stack (src/state/catalogue.ts), so the Undo here is the same Undo
   History offers, pinned to the step it is offered for; a refusal is
   its sentence, in the same place; and a press that changes nothing
   says so rather than nothing.
   ============================================================ */

export type Said =
  | { kind: 'step'; said: string; eventId: string; undone: boolean }
  | { kind: 'refused'; said: string }

export function useStep(): {
  said: Said | null
  apply: (command: CatalogueCommand, nothing: string) => boolean
  back: () => void
  clear: () => void
} {
  const [said, setSaid] = useState<Said | null>(null)
  const apply = useCallback((command: CatalogueCommand, nothing: string): boolean => {
    const outcome = catalogue.getState().apply(command)
    if (!isDone(outcome)) {
      setSaid({ kind: 'refused', said: outcome.refused === '' ? nothing : outcome.refused })
      return false
    }
    setSaid({ kind: 'step', said: `${outcome.said}.`, eventId: outcome.event.id, undone: false })
    return true
  }, [])
  const back = useCallback(() => {
    const was = said
    if (!was || was.kind !== 'step') return
    const outcome = was.undone
      ? catalogue.getState().redo()
      : catalogue.getState().undo(was.eventId)
    if (!isDone(outcome)) {
      setSaid({
        kind: 'refused',
        said:
          outcome.refused === '' ? 'Nothing to put back: it already reads so.' : outcome.refused,
      })
      return
    }
    setSaid({ kind: 'step', said: outcome.said, eventId: outcome.event.id, undone: !was.undone })
  }, [said])
  const clear = useCallback(() => setSaid(null), [])
  return { said, apply, back, clear }
}

/** The step's sentence and its way back, or the refusal, read aloud as it lands. */
export function StepSaid({ said, back }: { said: Said | null; back: () => void }) {
  return (
    <output className="chd-step" aria-live="polite">
      {said === null ? null : said.kind === 'refused' ? (
        <Refusal>{said.said}</Refusal>
      ) : (
        <>
          <span className="chd-step__said">{said.said}</span>
          <Button
            intent="quiet"
            size="sm"
            icon={said.undone ? ArrowClockwiseIcon : ArrowCounterClockwiseIcon}
            onClick={back}
          >
            {said.undone ? 'Put it back' : 'Undo'}
          </Button>
        </>
      )}
    </output>
  )
}
