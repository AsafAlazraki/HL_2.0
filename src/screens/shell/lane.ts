import { useEffect } from 'react'

/* ============================================================
   WHERE THE TOAST STANDS WHILE A DIALOG IS OPEN, FROM 1440.

   At a desk the kit's toast stands in the band beside the pill, and while a dialog stands over
   the room it stands at the window's foot instead, its head 80px above the foot (shell.css, "the
   toast beside the pill"). That foot is free only while the plate ends above it. A gallery fills
   the window's height at 1440 × 900 (24 to 876), and there the card "Your picture is on the
   Yamaha F90XB now · Undo", x 1,073–1,383 and y 820–868, lay about 50px over the plate's
   lower-right corner (the quote-3 audit's H1, measured off 1440x900-g05-motor-added.png).

   So the shell measures the open plate and the toast keeps out of it: at the foot when the foot
   is free, and otherwise in the band a centred plate leaves at its right, from 16px past the
   plate's edge to 16px off the window's, where the veil has dimmed the page's gutter. A band too
   narrow to hold the card's words beside its Undo is no lane, and the card keeps the foot.
   ============================================================ */

/** The rectangle a plate stands in, as the window measures it. */
export interface Plate {
  left: number
  top: number
  right: number
  bottom: number
}

/** The window the plate stands in. */
export interface Room {
  width: number
  height: number
}

/** The two places the card can stand while a plate is open. */
export type Lane = { at: 'foot' } | { at: 'side'; left: number }

/** The head of the foot lane, above the window's foot (shell.css: `100dvh − --spacing(20)`). */
export const FOOT_HEAD = 80
/** The air the kit keeps between the card and anything beside it. */
export const AIR = 16
/** The narrowest band that holds the card's glyph, two or three lines of words and its Undo. */
export const NARROWEST = 260

const FOOT: Lane = { at: 'foot' }

/** WHERE THE CARD STANDS beside an open plate, or at the foot where nothing better is free. */
export function laneBeside(plate: Plate | null, room: Room): Lane {
  if (plate === null) return FOOT
  if (plate.bottom + AIR / 2 <= room.height - FOOT_HEAD) return FOOT
  const left = Math.ceil(plate.right + AIR)
  if (room.width - AIR - left < NARROWEST) return FOOT
  return { at: 'side', left }
}

/** An open dialog over its veil: Base UI's popup after its backdrop in their portal (shell.css). */
const OPEN_PLATE =
  "[data-base-ui-portal] > [role='presentation'][data-open] ~ [role='dialog'][data-open]"

/**
 * THE SHELL WATCHES FOR A PLATE and says where the card may stand, on the root: `data-way-lane`
 * and `--way-toast-left` while the side band is the lane, nothing otherwise. It measures again
 * when a plate opens, shuts or changes size, when its entrance settles (the plate rises out of
 * 98%, so the first measure is 2% short), and when the window changes.
 */
export function useToastLane(): void {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') return
    const root = document.documentElement
    let watched: Element | null = null
    let saying: string | null = null
    const sizes = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => place())
    function place(): void {
      const open = [...document.querySelectorAll(OPEN_PLATE)].at(-1) ?? null
      if (open !== watched) {
        if (watched !== null) sizes?.unobserve(watched)
        if (open !== null) sizes?.observe(open)
        watched = open
      }
      const box = open?.getBoundingClientRect() ?? null
      const lane = laneBeside(box, { width: window.innerWidth, height: window.innerHeight })
      /* written only when it changes, so the root is touched once per move and never in a loop */
      const said = lane.at === 'side' ? `${lane.left}px` : null
      if (said === saying) return
      saying = said
      if (lane.at === 'side') {
        root.dataset.wayLane = 'side'
        root.style.setProperty('--way-toast-left', `${lane.left}px`)
      } else {
        delete root.dataset.wayLane
        root.style.removeProperty('--way-toast-left')
      }
    }
    const settled = (event: Event): void => {
      if (watched !== null && event.target === watched) place()
    }
    const portals = new MutationObserver(place)
    portals.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-open'],
    })
    window.addEventListener('resize', place)
    document.addEventListener('transitionend', settled)
    document.addEventListener('animationend', settled)
    place()
    return () => {
      portals.disconnect()
      sizes?.disconnect()
      window.removeEventListener('resize', place)
      document.removeEventListener('transitionend', settled)
      document.removeEventListener('animationend', settled)
      delete root.dataset.wayLane
      root.style.removeProperty('--way-toast-left')
    }
  }, [])
}
