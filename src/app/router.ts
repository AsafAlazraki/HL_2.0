import { createRouter, type RouterHistory } from '@tanstack/react-router'
import { routeTree } from '@/routeTree.gen'
import { ScreenThrew } from '@/routes/__root'

/* ============================================================
   THE ROUTER, BUILT IN ONE PLACE.

   It was built in `src/main.tsx` until 2026-09-18, which meant the app
   had one router and every test that drove the real route tree built a
   DIFFERENT one — `shell.test.tsx` passed `{ routeTree, history }` and
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

export function appRouter(options?: { history?: RouterHistory }) {
  return createRouter({
    routeTree,
    defaultPreload: 'intent',
    scrollRestoration: true,
    /* WHAT CATCHES A SCREEN THAT THREW. A route catches what its own
       component threw, so the root route's `errorComponent` would only
       ever catch the root's `<Outlet />`; this is the fallback every
       route without one of its own uses, and it is what makes "any
       screen that throws lands on a named, dark screen with a way out"
       true of all seven rather than of none. The not-found half lives
       on the root route, where an address matching nothing is caught —
       `src/routes/__root.tsx` argues both. */
    defaultErrorComponent: ScreenThrew,
    ...options,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof appRouter>
  }
}
