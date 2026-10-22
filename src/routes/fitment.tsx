import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { repositories } from '@/data'
import { catalogue } from '@/state/catalogue'
import { session } from '@/state/session'
import { Fitment, type FitmentPosition } from '@/screens/fitment/Fitment'
import { sheetHref } from '@/screens/fitment/sheet'

/* ============================================================
   /fitment — one boat at a time, and what can be fitted to it.

   IT IS BEHIND THE SAME DOOR AS HOME. A browser with no name in the
   session lands on Entry whatever address was typed: the first-visit
   rule is the shell's, and it is `beforeLoad` for the reason
   `src/routes/index.tsx` gives.

   IT READS THIS BROWSER AND NEVER THE FILE. The only call below is
   `catalogue.load(repository)`, which cannot fetch; a browser that holds
   no copy of the price list arrives on a screen that says so and offers
   the way to load it.

   THE FOUR SEARCH PARAMS ARE THE POSITION. `boat` is the boat, by its
   line on the price list; `all` is the place whose whole list is open —
   `motor`, `trailer`, or a list's own id — `find` what is typed into
   that list's find field, and `at` the motor whose note is open on the
   horsepower. So a link to "the SP660's trailers, every one, with REDCO
   typed" opens exactly that, and the way back from the price list is one
   Back: the sheet writes its own position with `replace`, so the Back
   that leaves it lands here, on the same boat and the same list.

   A boat is a CHANGE OF SCREEN and is pushed; everything else is a
   position and is replaced, for the register's reason — a Back that
   walked back through every letter typed would be a Back that never
   leaves.
   ============================================================ */

export interface FitmentSearch {
  boat?: string
  all?: string
  find?: string
  at?: string
}

const word = (value: unknown, max = 200): string | undefined => {
  if (typeof value !== 'string') return undefined
  const said = value.trim()
  return said === '' || said.length > max ? undefined : said
}

export const Route = createFileRoute('/fitment')({
  validateSearch: (search: Record<string, unknown>): FitmentSearch => {
    const boat = word(search.boat)
    const all = word(search.all)
    const find = word(search.find, 120)
    const at = word(search.at)
    return {
      ...(boat ? { boat } : {}),
      ...(all ? { all } : {}),
      ...(find ? { find } : {}),
      ...(at ? { at } : {}),
    }
  },
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: FitmentRoute,
})

function FitmentRoute() {
  const navigate = useNavigate()
  const search = Route.useSearch()

  useEffect(() => {
    if (catalogue.getState().status === 'empty') {
      void catalogue.getState().load(repositories(PACK_ORG_ID).catalogue)
    }
  }, [])

  /* a position is never a change of screen, so it never starts a View Transition — the
     reason is in src/routes/data.index.tsx, measured there first */
  const onPosition = useCallback(
    (next: FitmentPosition) => {
      void navigate({
        to: '/fitment',
        search: (was: FitmentSearch) => {
          const merged = { ...was, ...next }
          const out: FitmentSearch = {}
          if (merged.boat) out.boat = merged.boat
          if (merged.all) out.all = merged.all
          if (merged.find) out.find = merged.find
          if (merged.at) out.at = merged.at
          return out
        },
        replace: true,
        viewTransition: false,
      })
    },
    [navigate],
  )

  return (
    <Fitment
      boat={search.boat ?? ''}
      all={search.all ?? ''}
      find={search.find ?? ''}
      at={search.at ?? ''}
      onPosition={onPosition}
      openBoat={(rowId) => void navigate({ to: '/fitment', search: { boat: rowId } })}
      sheetHref={sheetHref}
      openSheet={(opens) => void navigate({ href: sheetHref(opens) })}
      openTheFile={() => void navigate({ to: '/sign-in', search: { again: true } })}
    />
  )
}
