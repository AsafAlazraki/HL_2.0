import { useEffect, useRef, useState } from 'react'
import { reducedMotion, useStill } from '@/ui'
import { RIM_D, SEAL_BOX, TICK_D, TICK_WIDTH } from './seal'
import type { Stamping } from './stamp'

/* ============================================================
   THE SEAL, STILL OR STAMPED (the component critique, 2026-09-28,
   major 8: "Giving the quote has no moment").

   A quote given a moment ago ON THIS SCREEN is stamped: the authored
   timeline in `seal.ts`, played by lottie-web once, at the press, and
   then standing at its last frame. Every other given quote — one given
   before the build was opened, or seen again after the stamp — wears
   the same drawing still, as plain SVG, and fetches no player at all.

   IT IS STAMPED ONCE. The give's own event names it, so reopening the
   finale while the step line still says "is issued" does not stamp it
   a second time.

   MOVEMENT IS ASKED FOR, AS EVERYWHERE IN THE KIT. Under reduced
   motion, or while a caret is in a field (`useStill`), the seal is
   drawn still from its first frame and the finale around it only
   fades (`transition` in src/ui/motion.ts); a caret that arrives while
   it is stamping stands it at its last frame. If the player cannot be
   fetched, the still seal is drawn: the moment is lost, never the seal.

   It is a picture of a fact the words beside it say — "Given to …" —
   so it is hidden from a reader, and nothing in it is a figure.
   ============================================================ */

/** The gives this page has already stamped, by their event. */
const stamped = new Set<string>()

/** Fetch the stamp's player ahead of the press, so the stamp is not late for it. The finale of a
 *  draft asks for it; a failed fetch is answered by the still seal later. */
export function readyTheStamp(): void {
  import('./stamp').catch(() => undefined)
}

export function GivenSeal({ give }: { give: string | null }) {
  const still = useStill()
  const stage = useRef<HTMLSpanElement>(null)
  const playing = useRef<Stamping | null>(null)
  /* decided once, when the seal is first drawn: a give not yet stamped, with movement allowed */
  const [stamps] = useState(() => give !== null && !stamped.has(give) && !still && !reducedMotion())
  const [drawn, setDrawn] = useState<'still' | 'stamp'>(stamps ? 'stamp' : 'still')

  useEffect(() => {
    if (!stamps || give === null) return
    stamped.add(give)
    let gone = false
    import('./stamp')
      .then(({ stamp }) => {
        if (gone || !stage.current) return
        playing.current = stamp(stage.current)
      })
      .catch(() => {
        if (!gone) setDrawn('still')
      })
    return () => {
      gone = true
      playing.current?.stop()
      playing.current = null
    }
  }, [stamps, give])

  useEffect(() => {
    if (still) playing.current?.finish()
  }, [still])

  return (
    <span className="cfg-seal" aria-hidden="true" data-drawn={drawn}>
      <span className="cfg-seal__stage" ref={stage} />
      {drawn === 'still' ? (
        <svg className="cfg-seal__still" viewBox={`0 0 ${SEAL_BOX} ${SEAL_BOX}`} focusable="false">
          <path className="cfg-seal__rim" d={RIM_D} />
          <path
            className="cfg-seal__tick"
            d={TICK_D}
            fill="none"
            strokeWidth={TICK_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  )
}
