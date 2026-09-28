import type { Transition } from 'motion/react'

/* ============================================================
   THE MOTION VOCABULARY, IN THE FORM `motion` TAKES.

   Named for what moves, never for a number, and the SAME LADDER
   src/styles/tokens.css declares under "THE MOTION VOCABULARY": a
   screen asks for `move.travel` and the segment's thumb, the lit door
   and a chapter opening all land the same way, in a stylesheet or in
   a component. `motion.test.tsx` reads tokens.css and fails if the two
   ever drift, which is how the old app's CSS ladder and JS ladder
   came apart and had to be reconciled by somebody who was not there.

     press    100ms  a control answering a finger
     hover    150ms  a hover's colour and its 1px lift
     enter    200ms  a menu, a select, a popover arriving
     exit     140ms  the same leaving — exits are faster than entries
     settle   spring, response 0.2 s  a tick, a chip's fill landing
     travel   spring, response 0.3 s  a thumb, the lit door, a chapter
     morph    spring, response 0.4 s  a photograph between two places
     route    220ms  the crossfade between two screens

   THE SPRINGS ARE CRITICALLY DAMPED (damping ratio 1.0): nothing in
   this app is flicked, so nothing bounces (apple-design: "bounce only
   after a flick"). They are given to `motion` as stiffness and damping
   computed from Apple's two numbers — ω = 2π / response, stiffness ω²,
   damping 2ω at mass 1 — which is the same curve tokens.css samples
   into `linear()`, so a spring in a component and a spring in a
   stylesheet are one spring.

   The tweens use M3's standard curve, the one `--ease-out` names.
   ============================================================ */

/** md.sys.motion.easing.standard, as `--ease-out` names it in tokens.css. */
const EASE_OUT = [0.2, 0, 0, 1] as const

/** A critically damped spring with Apple's `response`, in `motion`'s own terms. */
export function critically(response: number): {
  type: 'spring'
  stiffness: number
  damping: number
  mass: number
} {
  const omega = (2 * Math.PI) / response
  return { type: 'spring', stiffness: omega * omega, damping: 2 * omega, mass: 1 }
}

/** How long a critically damped spring takes to be 99.9% of the way there, in ms. */
export function settlesIn(response: number): number {
  const omega = (2 * Math.PI) / response
  let t = 0
  while ((1 + omega * t) * Math.exp(-omega * t) > 0.001) t += 0.0005
  return Math.round(t * 1000)
}

export const move = {
  press: { type: 'tween', duration: 0.1, ease: EASE_OUT },
  hover: { type: 'tween', duration: 0.15, ease: EASE_OUT },
  enter: { type: 'tween', duration: 0.2, ease: EASE_OUT },
  exit: { type: 'tween', duration: 0.14, ease: EASE_OUT },
  settle: critically(0.2),
  travel: critically(0.3),
  morph: critically(0.4),
  route: { type: 'tween', duration: 0.22, ease: EASE_OUT },
} as const satisfies Record<string, Transition>

export type MoveName = keyof typeof move

/** The spring responses, in seconds, for the three names that are springs. */
export const RESPONSE = { settle: 0.2, travel: 0.3, morph: 0.4 } as const

/** Whether the person has asked for reduced motion. False where there is no window. */
export function reducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * The transition a component hands to `motion` for one of the names above. Under reduced
 * motion — or while a caret is in a field (`MotionRoot`) — colour and opacity still fade and
 * everything else lands at once: movement is what is taken away, never comprehension.
 */
export function transition(name: MoveName, reduced: boolean = reducedMotion()): Transition {
  if (!reduced) return move[name]
  return { default: { duration: 0 }, opacity: { duration: 0.15, ease: EASE_OUT } }
}

/* ============================================================
   THE SAME LADDER, FOR THE WEB ANIMATIONS API.

   A library that moves an element with `element.animate()` rather
   than through `motion` — NumberFlow, under the kit's `Figure` — takes
   a duration in milliseconds and a CSS easing. It is handed the same
   names: a tween is its duration on `--ease-out`, and a spring is the
   curve tokens.css samples into `--ease-spring`, 40 steps of the
   critically damped spring over the time it takes to settle, for as
   long as that name's spring takes to settle. `motion.tokens.test.ts`
   holds the curve to the stylesheet's, point for point.
   ============================================================ */

/** How many steps tokens.css samples `--ease-spring` at. */
const SPRING_STEPS = 40

/** The critically damped spring as CSS `linear()`, the curve `--ease-spring` names. A
 *  critically damped spring normalised to its own settling time has one shape whatever its
 *  response, so one curve serves all three springs, each over its own duration. */
export function springEasing(): string {
  const omega = (2 * Math.PI) / RESPONSE.travel
  const end = settlesIn(RESPONSE.travel) / 1000
  const points = Array.from({ length: SPRING_STEPS + 1 }, (_, i) => {
    if (i === SPRING_STEPS) return '1'
    const t = (end * i) / SPRING_STEPS
    return String(Number((1 - (1 + omega * t) * Math.exp(-omega * t)).toFixed(3)))
  })
  return `linear(${points.join(', ')})`
}

/** One of the names above in the form `element.animate()` takes. */
export function effect(name: MoveName): { duration: number; easing: string } {
  const m: Transition = move[name]
  if (m.type === 'spring') {
    return { duration: settlesIn(RESPONSE[name as keyof typeof RESPONSE]), easing: springEasing() }
  }
  return {
    duration: Math.round((m.duration ?? 0) * 1000),
    easing: `cubic-bezier(${EASE_OUT.join(', ')})`,
  }
}

/* ============================================================
   A CARET IN A FIELD, AS ONE QUESTION.

   "Nothing moves while a caret is in a text field, app-wide" is a
   rule the old app kept on one screen of five, so toasts reflowed and
   lists re-sorted under a typing dealer. Here it is one answer, asked
   by `MotionRoot` for every `motion` component, by the route
   crossfade in src/app/router.ts, and by the water.

   A CARET, not merely a focused control: a checkbox or a radio holds
   focus with no caret, and the segment the kit draws is exactly that.
   A read-only field shows no caret either.
   ============================================================ */

const CARET_TYPES = new Set([
  '',
  'text',
  'search',
  'email',
  'tel',
  'url',
  'password',
  'number',
  'date',
  'datetime-local',
  'month',
  'time',
  'week',
])

/** Whether this element puts a caret on the screen. */
export function holdsCaret(target: EventTarget | null | undefined): boolean {
  if (typeof HTMLElement === 'undefined' || !(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  if (target instanceof HTMLTextAreaElement) return !target.readOnly
  if (target instanceof HTMLInputElement)
    return CARET_TYPES.has(target.type.toLowerCase()) && !target.readOnly
  return false
}

/** Whether a caret is in a field on this page right now. */
export function caretInField(): boolean {
  if (typeof document === 'undefined') return false
  return holdsCaret(document.activeElement)
}
