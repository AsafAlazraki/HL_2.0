/* ============================================================
   THE ROUTES THE RULERS WALK.

   One list, exported, so that adding a screen adds it to every ruler
   at once. The old repo's contrast sweep carried its own list of five
   screens, three of which had been renamed or rebuilt underneath it;
   it reported COULD NOT OPEN for a screen that no longer existed and
   clean for the two empty states, and both of the failures a human
   sweep later found were on screens it had never opened. A guard aimed
   at a screen that no longer exists is worse than no guard.

   Each route carries the proof that it arrived. `ready` is a selector
   the screen only has once it is really there, so a ruler can never
   measure the previous page, a spinner, or a blank body and call it
   clean.

   `register` says which kind of screen it is, because one ruler asks a
   question only of a register: a Cockpit screen owes 18 rows at
   1280×800, and a Showroom screen owes nothing of the sort.
   ============================================================ */

export type Register = 'foundation' | 'cockpit' | 'showroom'

export interface Route {
  /** The address, as a person would type it. */
  path: string
  /** What to call it in a ruler's report. */
  name: string
  register: Register
  /** A selector that exists only once this screen has really arrived. */
  ready: string
}

/**
 * Today there is one address and it is a placeholder: no screen has been designed yet, so
 * Milestone 0 ships the foundation route and nothing else. Every screen joins this list on
 * the day it is built, and joins five rulers by doing so.
 */
export const routes: Route[] = [
  { path: '/', name: 'foundation', register: 'foundation', ready: '[data-testid="home"]' },
]

export const cockpitRoutes = (): Route[] => routes.filter((r) => r.register === 'cockpit')
