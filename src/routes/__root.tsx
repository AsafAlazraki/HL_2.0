import { useCallback, useEffect } from 'react'
import {
  Outlet,
  createRootRoute,
  useNavigate,
  useRouterState,
  type ErrorComponentProps,
} from '@tanstack/react-router'
import { repositories } from '@/data'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { useCatalogue } from '@/app/useStores'
import { FRONT_DOORS } from '@/app/ways'
import { catalogue } from '@/state/catalogue'
import { Lost } from '@/screens/lost/Lost'
import { ShellAround } from '@/screens/shell/Shell'

/* ============================================================
   THE ROOT, AND THE TWO ENDINGS EVERY SCREEN CAN HAVE.

   Until 2026-09-18 this file was four lines and set neither, so a
   mistyped address was TanStack's own default: a white page with the
   words "Not Found" on it, measured at `/nope` with body background
   `rgb(255,255,255)`, zero buttons, no dealership and no way back — in
   an app that is otherwise entirely dark and named. And because
   `src/main.tsx` set no `defaultErrorComponent` either, any screen that
   threw while drawing landed on the same white page.

   Both now land on `src/screens/lost/Lost.tsx`, which is a built screen
   with its own stylesheet, its own ladder and its own idea, rather than
   a fallback: it prints the address that was asked for as its subject
   and offers the app's real front doors as real links.

   WHY THE NOT-FOUND IS DECLARED HERE AND THE THROWN ONE IN
   `src/app/router.ts`. They are caught in different places. A route
   catches what its OWN component threw, so the root route's
   `errorComponent` would only ever catch the root's `<Outlet />`; what
   catches a screen is `defaultErrorComponent` on the router, which every
   route without one of its own falls back to. `notFoundComponent` is the
   other way round: an address that matches no route is the ROOT's
   not-found, so declaring it here means every router built from this
   tree behaves the same — the app's, and the one `-shell.test.tsx`
   builds.
   ============================================================ */

export const Route = createRootRoute({
  component: Root,
  notFoundComponent: () => <LostAt />,
})

/* ============================================================
   THE SHELL IS MOUNTED HERE, AND ONLY HERE.

   `src/screens/shell` draws one floating pill over every screen but
   Entry, and one finder behind Ctrl K. The root route is the only
   place in this app that is inside every address at once — a pathless
   layout route would have been the alternative and would have had to
   be written around the Lost screen, which is the absence of an
   address and therefore belongs to no layout.

   IT IS HANDED THE ADDRESS AND THE WAY TO MOVE, never reaching for
   the router itself, so the whole object can be rendered and pressed
   in a component test. `ShellAround` also carries the seat a screen
   publishes its own rows into — see `src/screens/shell/scope.tsx` for
   why one Ctrl K can serve a screen that already had a field.

   THE ORG IS THE ROUTE'S TO KNOW. A screen in this app never imports
   `@/data`; the shell counts the drafts standing on the Quotes door
   and needs to know whose, so this file — which already holds
   `PACK_ORG_ID` for the Lost screen's own read — hands it over.
   ============================================================ */
function Root() {
  const navigate = useNavigate()
  const at = useRouterState({ select: (s) => s.location.pathname })
  const go = useCallback((href: string) => void navigate({ href }), [navigate])
  return (
    <ShellAround at={at} go={go} org={PACK_ORG_ID}>
      <Outlet />
    </ShellAround>
  )
}

/**
 * THE LOST SCREEN, WIRED. It is written here rather than in a file of
 * its own under `src/routes/` for one reason: a file there IS an
 * address, and this screen is the absence of one.
 *
 * It reads this browser and never the file, which is the division the
 * whole shell rests on (docs/SCREENS.md): the only call below is
 * `catalogue.load(repository)`, which cannot fetch. That is how a dead
 * end can still say whose app it is — the dealership's name is read
 * back out of IndexedDB — without the one screen nobody meant to open
 * quietly downloading the Master Price File.
 */
export function LostAt({ error, retry }: { error?: unknown; retry?: () => void }) {
  const navigate = useNavigate()
  /* THE ADDRESS IS THE ROUTER'S, not `window.location`: it is the same
     string in a memory history, in a test and in a browser, which is
     what lets this screen be driven without one. */
  const address = useRouterState({ select: (s) => s.location.href })
  const business = useCatalogue((s) => s.business)
  const reading = useCatalogue((s) => s.status === 'empty' || s.status === 'loading')

  useEffect(() => {
    if (catalogue.getState().status === 'empty') {
      void catalogue.getState().load(repositories(PACK_ORG_ID).catalogue)
    }
  }, [])

  return (
    <Lost
      address={address}
      business={business}
      reading={reading}
      ways={FRONT_DOORS}
      thrown={error === undefined ? null : { message: saidBy(error) }}
      retry={retry}
      /* `href` rather than `to`: these are addresses in a list, not
         literals the type checker can narrow, and every one of them is
         asserted to be a real route by `-shell.test.tsx`. The link is a
         real link either way; this only keeps a plain click from
         reloading the whole app. */
      go={(href) => void navigate({ href })}
    />
  )
}

/** The screen that threw is quoted, never paraphrased and never
 *  guessed at. A thrown thing that is not an `Error` is whatever it is,
 *  turned into a string; one that says nothing at all is reported as
 *  having said nothing, because inventing a cause is the one thing this
 *  app does not do. */
export function saidBy(error: unknown): string {
  const said =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : String(error as { toString(): string })
  return said.trim() === '' ? 'It stopped without saying anything.' : said.trim()
}

/** The router's own fallback for a screen that threw while drawing,
 *  handed the same screen with the error's own words on it. */
export function ScreenThrew({ error, reset }: ErrorComponentProps) {
  return <LostAt error={error} retry={reset} />
}
