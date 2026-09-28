import { flushSync } from 'react-dom'
import { caretInField, reducedMotion } from './motion'

/* ============================================================
   A CHANGE ON ONE SCREEN, MORPHED — the View Transitions API, the
   browser's own, 0 KB of library (board C's bold tech).

   `morph(update)` runs a state change inside
   `document.startViewTransition`, so every `Picture` whose `shared`
   name stands on both sides of the change morphs from where it was to
   where it is, and everything else crossfades. The update is flushed
   synchronously inside the callback, because the browser photographs
   the new state the moment the callback returns. `types` names the
   transition (Data's `turn`), so a screen's stylesheet can shape its
   own crossfade with `:active-view-transition-type()` without touching
   the route's.

   THE ROUTES do the same through TanStack Router (src/app/router.ts),
   on a change of screen only; this is for a change INSIDE one.

   IT DOES NOTHING CLEVER WHEN IT SHOULD NOT MOVE: under reduced
   motion, while a caret is in a field, or in a browser without the
   API, the change simply happens.

   A SKIPPED TRANSITION IS NOT AN ERROR (2026-09-28, the verify round).
   The browser skips a transition when another begins over it — a
   second door pressed before the first screen has landed, a morph
   started while the route's crossfade runs — or when it cannot
   photograph a page, and says so by rejecting the transition's `ready`
   and `finished`. Nobody was holding those promises: TanStack returns
   only `updateCallbackDone`, and `morph` dropped the object. So every
   skip surfaced as an unhandled "Transition was skipped. New
   ViewTransition started", a page error the data, quotes, history and
   customers flows assert against, on screens that did nothing wrong.
   Every transition this app starts is now owned here, once: `own`
   holds its promises, and `ownTransitions` makes every call to the
   browser's `startViewTransition` go through it — the router's too,
   which is the one caller this app cannot reach any other way.
   ============================================================ */

interface Transition {
  ready: Promise<unknown>
  finished: Promise<unknown>
  updateCallbackDone: Promise<unknown>
}

const ignore = (): undefined => undefined

/** Hold a transition's three promises, so a skip is a skip and not a page error. */
export function own<T>(started: T): T {
  const t = started as Partial<Transition> | undefined
  if (t && typeof t === 'object') {
    t.ready?.catch?.(ignore)
    t.finished?.catch?.(ignore)
    t.updateCallbackDone?.catch?.(ignore)
  }
  return started
}

const OWNED = Symbol.for('hl.ownedTransitions')

/**
 * EVERY TRANSITION THE PAGE STARTS, OWNED. Wraps `document.startViewTransition` once (a
 * second call does nothing), so whoever calls it — the router, a screen, this file — gets the
 * same transition back with its promises held. Called by the router's factory, which is the
 * one place every page of the app passes through.
 */
export function ownTransitions(): void {
  if (typeof document === 'undefined') return
  const doc = document as Document & { [OWNED]?: true }
  if (typeof doc.startViewTransition !== 'function' || doc[OWNED]) return
  const start = doc.startViewTransition.bind(doc)
  doc.startViewTransition = (update) => own(start(update))
  doc[OWNED] = true
}

/** Whether a morph would run here, now. */
export function canMorph(): boolean {
  if (typeof document === 'undefined') return false
  return typeof document.startViewTransition === 'function' && !reducedMotion() && !caretInField()
}

/**
 * WHETHER THIS BROWSER KNOWS A TRANSITION'S TYPE — the router asks the same question before it
 * hands one over (TanStack's own check), because a browser with the API and without types
 * throws on the object form.
 */
function typed(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('selector(:active-view-transition-type(a))')
  )
}

export function morph(update: () => void, types?: readonly string[]): void {
  if (!canMorph()) {
    update()
    return
  }
  const run = (): void => {
    flushSync(update)
  }
  own(
    types && types.length > 0 && typed()
      ? document.startViewTransition({ update: run, types: [...types] })
      : document.startViewTransition(run),
  )
}
