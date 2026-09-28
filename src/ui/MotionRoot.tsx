import { MotionConfig } from 'motion/react'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { holdsCaret } from './motion'

/* ============================================================
   WHERE REDUCED MOTION AND THE CARET ARE HONOURED, ONCE.

   Mounted once, around the routes (src/routes/__root.tsx). It does
   three things and every moving primitive leans on them rather than
   asking for itself:

     1. `motion` is told `reducedMotion="user"`: under the person's
        own setting every `motion` component keeps opacity and colour
        and drops transform and layout — the rule, read by the library.
     2. WHILE A CARET IS IN A FIELD it is told `always` instead, so a
        list does not re-sort and a toast does not slide under a dealer
        who is typing. Nothing else in the app has to know.
     3. The same fact is written on <html> as `data-still`, because a
        stylesheet cannot ask React: the kit's CSS keyframes and the
        water read it (src/ui/*.css, src/ui/water.ts).

   `useStill()` reads the same answer for a component that moves by
   some other means — the water, a view transition.
   ============================================================ */

const Still = createContext(false)

/** Whether a caret is in a field right now, as the root last saw it. */
export function useStill(): boolean {
  return useContext(Still)
}

export function MotionRoot({ children }: { children: ReactNode }) {
  const [still, setStill] = useState(false)

  useEffect(() => {
    const read = (): void => setStill(holdsCaret(document.activeElement))
    /* focusout fires BEFORE the next element takes focus, so the answer is read a frame
       later, when `activeElement` is the new owner rather than the body in between */
    const later = (): void => void requestAnimationFrame(read)
    read()
    document.addEventListener('focusin', read)
    document.addEventListener('focusout', later)
    return () => {
      document.removeEventListener('focusin', read)
      document.removeEventListener('focusout', later)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (still) root.dataset.still = ''
    else delete root.dataset.still
  }, [still])

  return (
    <MotionConfig reducedMotion={still ? 'always' : 'user'}>
      <Still.Provider value={still}>{children}</Still.Provider>
    </MotionConfig>
  )
}
