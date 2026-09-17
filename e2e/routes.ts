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
  /**
   * HOW A VISITOR GETS HERE, because from Milestone 1 typing the
   * address is not always enough. `fresh` is a browser nobody has used
   * — the first-visit rule sends it to the door. `through-the-door` is
   * the real flow: a name given on Entry and the Master Price File
   * loaded, which is the only way Home has a sheet to draw, since Home
   * reads this browser and never the file.
   *
   * It is a walk rather than a seeded localStorage key on purpose: a
   * ruler that measured a Home nobody could reach would be measuring a
   * screen the app does not have.
   */
  arrive?: 'fresh' | 'through-the-door'
}

/**
 * Every screen joins this list on the day it is built, and joins five rulers by doing so.
 * `/` was Milestone 0's placeholder proof and is Home from Milestone 1; `/sign-in` is the
 * entry screen, built from the picked direction and provisional until the owner looks at it
 * (docs/SCREENS.md).
 */
export const routes: Route[] = [
  {
    path: '/',
    name: 'home',
    register: 'showroom',
    /* the stamp, which exists only once a sheet is really in the app:
       a Home drawn over a blank sheet cannot show it, so a ruler can
       never mistake the empty state for the loaded one */
    ready: '[data-testid="pack-counts"]',
    arrive: 'through-the-door',
  },
  {
    path: '/sign-in',
    name: 'entry',
    register: 'showroom',
    ready: '[data-testid="entry"]',
    arrive: 'fresh',
  },
]

export const cockpitRoutes = (): Route[] => routes.filter((r) => r.register === 'cockpit')
