import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useMotionValue, type MotionValue } from 'motion/react'
import { useEffect, useState, type RefObject } from 'react'
import { holdsCaret, reducedMotion } from './motion'

/* ============================================================
   THE CHAPTERED SCROLL — GSAP's ScrollTrigger and Lenis, as the plan
   named them (PLAN.md § "The technology stance": "GSAP + ScrollTrigger
   and Lenis for the chaptered scroll") and as nothing in the app had
   imported until 2026-09-28.

   Imported from '@/ui/scroll', never from '@/ui', so their 50-odd
   kilobytes arrive only on the screens that scroll by chapters (the
   kit's specimen, and the build, which took both on 2026-09-29) and not
   on every screen that draws a button.

   `useChapterProgress` READS WHERE A PERSON IS: which chapter's middle
   the window's middle is in, and how far through it — the foot pill's
   dash that fills (Saxdor's, `ref/boats/saxdor-deep-10.png`). It
   reports a POSITION, not a motion, so it runs under reduced motion as
   well; what moves in reply is the dash, in CSS.

   `useSmoothScroll` SMOOTHS THE WHEEL on a desk and nowhere else: not
   on a touch screen (a finger's own momentum is already right), not
   under reduced motion, and it stands still while a caret is in a
   field. Keyboard scrolling is the browser's either way.

   WHAT THE BUILD ASKED OF BOTH, 2026-09-28 (the verify round, from the
   adopters' reports; the build had worked around each):
   - the place's `through` is a motion value, not state, so the screen
     that reads it re-renders once per chapter and never once per frame
     (the build had isolated the hook in a component that drew nothing);
   - the triggers are measured again when a chapter changes height, once
     the page has stood still for 200 ms and never while it moves — a
     refresh measures from the top of the page and back, and refreshing
     on every frame of a chapter's growth stopped the build's own move to
     Who it is for dead (measured at 390 × 844);
   - a caret in a field stops SMOOTHING the wheel and no longer stops the
     wheel: a stopped Lenis refuses every wheel event (measured on /kit:
     a 600 px wheel moved the page 0 px with the caret in the find field);
   - a list that scrolls inside the page (the finder's) is scrolled by
     the wheel over it, not the page under it.
   ============================================================ */

let registered = false
function register(): void {
  if (registered) return
  gsap.registerPlugin(ScrollTrigger)
  registered = true
}

export interface ChapterPlace {
  /** the chapter the middle of the window is in, from 0 */
  at: number
  /** how far through it, 0 to 1 — a motion value, so reading it re-renders nothing */
  through: MotionValue<number>
}

/** How long the page must have stood still before the triggers are measured again. */
const QUIET_MS = 200

/** `chapters` is one array for the life of the screen (a ref's or a memo's), so the
 *  triggers are made once and killed once. */
export function useChapterProgress(
  chapters: readonly RefObject<HTMLElement | null>[],
): ChapterPlace {
  const [at, setAt] = useState(0)
  const through = useMotionValue(0)
  useEffect(() => {
    register()
    const read = (i: number, progress: number): void => {
      setAt(i)
      through.set(progress)
    }
    const elements = chapters.flatMap((ref) => (ref.current ? [ref.current] : []))
    const triggers = chapters.flatMap((ref, i) => {
      const trigger = ref.current
      if (!trigger) return []
      return [
        ScrollTrigger.create({
          trigger,
          start: 'top center',
          end: 'bottom center',
          onUpdate: (self) => {
            if (self.isActive) read(i, self.progress)
          },
          onToggle: (self) => {
            if (self.isActive) read(i, self.progress)
          },
        }),
      ]
    })

    /* MEASURED AGAIN ONCE A CHANGE HAS SETTLED, never on a frame of it */
    let moved = 0
    let primed = false
    let timer = 0
    const measure = (): void => {
      const quiet = performance.now() - moved
      if (quiet < QUIET_MS) {
        timer = window.setTimeout(measure, QUIET_MS - quiet + 20)
        return
      }
      timer = 0
      ScrollTrigger.refresh()
    }
    const onScroll = (): void => {
      moved = performance.now()
    }
    const sized =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            /* the first answer is the observer saying what it sees, not a change */
            if (!primed) {
              primed = true
              return
            }
            moved = performance.now()
            if (timer === 0) timer = window.setTimeout(measure, QUIET_MS)
          })
    for (const el of elements) sized?.observe(el)
    if (typeof document !== 'undefined') sized?.observe(document.body)
    globalThis.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.clearTimeout(timer)
      sized?.disconnect()
      globalThis.removeEventListener('scroll', onScroll)
      for (const t of triggers) t.kill()
    }
  }, [chapters, through])
  return { at, through }
}

/** Whether the wheel may be smoothed here: a fine pointer and motion not reduced. */
export function smoothable(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(pointer: fine)').matches && !reducedMotion()
}

/** Whether a dialog has locked the page's scroll: Base UI hides the overflow of whichever of
 *  <html> and <body> scrolls the page (its `useScrollLock`), and marks nothing when the
 *  scrollbars are overlaid, so the overflow itself is what is read. */
function locked(): boolean {
  return hides(document.documentElement) || hides(document.body)
}
function hides(el: Element): boolean {
  return /hidden|clip/.test(getComputedStyle(el).overflowY)
}

export function useSmoothScroll(): void {
  useEffect(() => {
    if (!smoothable()) return
    register()
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.12,
      allowNestedScroll: true,
      /* A DIALOG'S LOCK IS THE BROWSER'S TO KEEP (2026-09-29, when the build took Lenis). A
         lock sets the page `overflow: hidden`, which stops a wheel and not a script: measured
         on /kit at 1440 × 900 with its Dialog open and <body> locked, a 500px wheel over the
         backdrop moved the page behind it 165px, to the foot of the page. While a lock stands
         Lenis leaves the wheel to the browser, which keeps the page where it was. */
      virtualScroll: () => !locked(),
    })
    lenis.on('scroll', ScrollTrigger.update)
    /* a caret in a field takes the smoothing off and leaves the wheel the browser's */
    const hold = (): void => {
      lenis.options.smoothWheel = !holdsCaret(document.activeElement)
    }
    document.addEventListener('focusin', hold)
    document.addEventListener('focusout', hold)
    return () => {
      document.removeEventListener('focusin', hold)
      document.removeEventListener('focusout', hold)
      lenis.destroy()
    }
  }, [])
}
