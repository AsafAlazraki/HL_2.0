import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Entry } from '@/screens/entry/Entry'
import { session } from '@/state/session'

/* ============================================================
   /sign-in — the entry screen's address, and the other half of the
   first-visit rule (`src/routes/index.tsx` carries the first).

   A RETURNING VISITOR NEVER SEES IT BY ACCIDENT. The session store
   remembers the name through prefs, so somebody who has given one
   already is sent straight to Home before this route renders anything:
   the door is not drawn and then dismissed, it is never drawn.
   `beforeLoad` runs on a typed address, a Back, a refresh and a
   preload alike, which is the only place that is true of.

   `?again` IS HOW THEY COME BACK ON PURPOSE. A person who took the
   blank door has no price file in this browser, and Home says so and
   offers the door — so there has to be an address that reaches it with
   a name already given, or the blank door's own sentence ("the file
   can be loaded later") is a promise nothing keeps. It is a search
   param because it is a position and positions are search params
   (CLAUDE.md); it is not remembered anywhere, so the next plain visit
   goes to Home as before.
   ============================================================ */

export interface SignInSearch {
  /** true when a named visitor asked for this door back; absent is the
   *  ordinary visit, and absent rather than `false` so that the plain
   *  address stays `/sign-in` with nothing hanging off it */
  again?: boolean
}

export const Route = createFileRoute('/sign-in')({
  /* A SEARCH PARAM IS SOMETHING SOMEBODY TYPED, so it is read rather
     than trusted: the flag is true for `?again=true`, and anything
     else at all — a word, a number, nothing — is not the flag. */
  validateSearch: (search: Record<string, unknown>): SignInSearch =>
    search.again === true || search.again === 'true' ? { again: true } : {},
  /* `=== true`, NOT `!search.again`, AND THE DIFFERENCE IS REAL.
     Measured on this router version: where `validateSearch` drops a
     key, `beforeLoad` is handed the RAW value under it, so
     `/sign-in?again=later` arrives here as the string 'later' — which
     is truthy, and a truthiness test would have let any word at all
     hold the door open. Only the validator can produce the boolean,
     so comparing to it is the one test a typed address cannot fake. */
  beforeLoad: ({ search }) => {
    if (session.getState().name && search.again !== true) throw redirect({ to: '/' })
  },
  component: SignIn,
})

function SignIn() {
  const navigate = useNavigate()
  /* The screen is handed its way out rather than reaching for the
     router, so it can be rendered and pressed in a component test
     without one. */
  return <Entry goHome={() => void navigate({ to: '/' })} />
}
