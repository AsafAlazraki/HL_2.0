import type { Transition } from 'motion/react'

/**
 * The shared springs, in the form the `motion` library takes (`duration` and `bounce`, the
 * Apple way, because it is easier to reason about than stiffness and damping). Named for
 * what moves, not for a number, so a screen asks for `spring.pop` and every popover in
 * the app settles the same way.
 *
 * UI motion stays under 300ms; the two longer presets are for layout and gesture-driven
 * surfaces, which a person watches rather than waits for.
 *
 * THE FIRST THREE ARE THE SAME LADDER `src/styles/tokens.css` DECLARES, in seconds because
 * that is the unit `motion` reads: press 100ms, pop 150ms, open 200ms. One ladder with one
 * citation (Material Design 3's short2/short3/short4 duration tokens), rather than a CSS
 * ladder and a JavaScript ladder that drift apart and then have to be reconciled by
 * somebody who was not here. `layout` and `drawer` have no CSS counterpart — nothing in a
 * stylesheet animates a shared element or a dragged surface — so they extend the ladder at
 * M3's medium4 (400ms) and long2 (500ms).
 */
export const spring = {
  /** a button answering a press */
  press: { type: 'spring', duration: 0.1, bounce: 0 },
  /** tooltips and small popovers */
  pop: { type: 'spring', duration: 0.15, bounce: 0.1 },
  /** menus, selects, sheets */
  open: { type: 'spring', duration: 0.2, bounce: 0.12 },
  /** layout changes and shared elements between picker → place → configurator */
  layout: { type: 'spring', duration: 0.4, bounce: 0.15 },
  /** drawers and anything a finger drags */
  drawer: { type: 'spring', duration: 0.5, bounce: 0.2 },
} as const satisfies Record<string, Transition>

export type SpringName = keyof typeof spring

/** Whether the person has asked for reduced motion. False where there is no window. */
export function reducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * The transition a screen should hand to `motion` for a given spring. Under reduced motion
 * colour and opacity still fade and everything else lands at once: movement is what
 * reduced motion removes, not comprehension.
 */
export function transition(name: SpringName, reduced: boolean = reducedMotion()): Transition {
  if (!reduced) return spring[name]
  return { default: { duration: 0 }, opacity: { duration: 0.15, ease: 'easeOut' } }
}
