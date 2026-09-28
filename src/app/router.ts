import { createRouter, type RouterHistory } from '@tanstack/react-router'
import { routeTree } from '@/routeTree.gen'
import { ScreenThrew } from '@/routes/__root'
import { caretInField, reducedMotion } from '@/ui/motion'
import { ownTransitions } from '@/ui/transition'

/* ============================================================
   THE ROUTER, BUILT IN ONE PLACE.

   It was built in `src/main.tsx` until 2026-09-18, which meant the app
   had one router and every test that drove the real route tree built a
   DIFFERENT one — `-shell.test.tsx` passed `{ routeTree, history }` and
   nothing else. So any router option that changes what a person sees
   was, by construction, the one thing no test could see. The critique
   found exactly that: `defaultErrorComponent` was unset, so a screen
   that threw landed on TanStack's white "Not Found" page, and no suite
   could have caught it because no suite used the app's router.

   One factory, used by `src/main.tsx` and by every test that drives the
   tree, so the router under a test is the router that ships. The only
   thing a caller may vary is the history, because that is the only
   thing that is genuinely different about a test: a memory history
   instead of the browser's.
   ============================================================ */

/** `/data/<table>`: the sheet, whose list is virtualised (see `scrollRestoration` below). */
const SHEET_ADDRESS = /^\/data\/[^/]+/

export function appRouter(options?: { history?: RouterHistory }) {
  /* every transition the page starts has its promises held (src/ui/transition.ts) */
  ownTransitions()
  /* the address a route's crossfade is carrying right now, until the router resolves it */
  let carrying: string | null = null
  const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    /* EVERY SCREEN BUT THE SHEET GETS ITS SCROLL BACK. The router restores
       the raw scrollTop of any element that scrolled, and the sheet's list
       is virtualised: a pixel offset written back into a list whose blocks
       are still estimated lands on some other model. Measured 2026-09-23 on
       the built sheet: `?at=boat_highfield:486` reloaded opened its row a
       third of the way down, and the router then wrote 979 back into the
       list, where SP330 to SP420 stood and the found row and its record
       were gone. The sheet's position is its address (`?at=`, `?in=`),
       which is what a position in this app is. */
    scrollRestoration: ({ location }) => !SHEET_ADDRESS.test(location.pathname),
    /* WHAT CATCHES A SCREEN THAT THREW. A route catches what its own
       component threw, so the root route's `errorComponent` would only
       ever catch the root's `<Outlet />`; this is the fallback every
       route without one of its own uses, and it is what makes "any
       screen that throws lands on a named, dark screen with a way out"
       true of all seven rather than of none. The not-found half lives
       on the root route, where an address matching nothing is caught —
       `src/routes/__root.tsx` argues both. */
    defaultErrorComponent: ScreenThrew,
    /* A NEW SCREEN CROSSFADES IN, 2026-09-28 (the component kit). TanStack Router starts a
       View Transition on the navigations it owns — the browser's own API, no library — so
       the room fades from one screen to the next over `--duration-route` (220ms,
       src/ui/route.css) and a `Picture` whose `shared` name stands on both screens morphs
       from one place to the other: the picker's photograph to the build's stage to the
       paper's cover (PLAN.md § "Motion choreography for the flow").

       ONLY WHEN THE SCREEN CHANGES. A position inside a screen is a search param here — a
       register's cursor, the sheet's `?at=`, the picker's maker — and a crossfade of the
       whole page on every arrow key would be the opposite of the rule "never animate a
       keyboard-initiated action". Nor while a caret is in a field (a search that navigates on
       Enter lands at once), nor under reduced motion, where the screen simply changes.

       ONE CROSSFADE PER CHANGE OF SCREEN (2026-09-28, the verify round). Measured on the built
       app, every arrival on a code-split screen started TWO transitions 80–260ms apart, from
       the pill and on a cold load alike, and the second skipped the first. The arriving screen
       writes its position into the address as it mounts; an address equal to the one already
       there is not a navigation to TanStack but a second `load()` (router-core's
       `commitLocation`, `isSameLocation`, which also drops that write's `viewTransition:
       false`); and that load was compared with a location not yet resolved, so it read as a
       change of screen as well. Now a load of the address a crossfade is already carrying
       runs inside it rather than over it, and the app's first paint starts none, because
       there is no screen before it to fade from. */
    defaultViewTransition: {
      types: ({ fromLocation, toLocation, pathChanged }) => {
        if (!fromLocation || !pathChanged || caretInField() || reducedMotion()) return false
        if (toLocation.href === carrying) return false
        carrying = toLocation.href
        return ['route']
      },
    },
    ...options,
  })
  router.subscribe('onResolved', () => {
    carrying = null
  })
  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof appRouter>
  }
}
