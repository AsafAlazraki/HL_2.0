import lottie from 'lottie-web/build/player/lottie_light'
import { LAST_FRAME, stampData } from './seal'

/* ============================================================
   THE STAMP'S PLAYER, AND ONLY IT.

   Its own module so it is its own chunk: lottie-web's light player
   (SVG only, no expressions) and the timeline, 169.42 kB and 47.57 kB
   gzip as built on 2026-09-28. It is fetched by the finale of a draft,
   ahead of the press (`readyTheStamp`, GivenSeal.tsx), and never under
   reduced motion, by any other screen, or by a quote that was given
   before the build was opened.

   It draws into a box the seal gives it and nowhere else, and hands
   back the two things the seal can ask of it: to be at its last frame
   now (a caret has arrived in a field), and to be gone.
   ============================================================ */

export interface Stamping {
  /** stop moving, and stand at the last frame: the rim and the tick */
  finish: () => void
  /** take the drawing out of the page */
  stop: () => void
}

export function stamp(into: HTMLElement): Stamping {
  const item = lottie.loadAnimation({
    container: into,
    renderer: 'svg',
    loop: false,
    autoplay: true,
    animationData: stampData(),
    rendererSettings: { preserveAspectRatio: 'xMidYMid meet', progressiveLoad: false },
  })
  return {
    finish: () => {
      item.goToAndStop(LAST_FRAME - 1, true)
    },
    stop: () => {
      item.destroy()
    },
  }
}
