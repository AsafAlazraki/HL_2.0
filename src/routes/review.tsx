import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { repositories } from '@/data'
import { catalogue } from '@/state/catalogue'
import { session } from '@/state/session'
import { Review } from '@/screens/review/Review'

/* ============================================================
   /review — what is wrong in Northside's own price list, one case at a time, each with its fix.

   BEHIND THE SAME DOOR AS EVERY OTHER SCREEN: a browser with no name in the session lands on
   Entry, by `beforeLoad`, for the reason `src/routes/index.tsx` gives.

   IT READS THIS COMPUTER AND NEVER THE FILE. The checks are counted on the price list this
   browser kept, so the catalogue is read out of the repository, exactly as History, Data and
   Rules read it; a fix is written back through the catalogue's own command door.

   ONE SEARCH PARAM, `case`: the case on the stage, by its key (`cases.ts`), or `tidy` for the
   tidy suggestions after the queue. Absent, or naming a case already settled, the stage holds
   the first case still standing. Written with `replace`, the register's reason: a Back that
   walked through every case settled would walk a person through the screen instead of out of
   it, and a settled case's address would open on a case that no longer exists.
   ============================================================ */

export interface ReviewSearch {
  case?: string
}

export const Route = createFileRoute('/review')({
  validateSearch: (search: Record<string, unknown>): ReviewSearch =>
    typeof search.case === 'string' && search.case !== '' ? { case: search.case } : {},
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: ReviewRoute,
})

/** The price list at one line of it: the sheet's own `at` (src/routes/data.$table.tsx). */
const listHref = (table: string, at?: string): string =>
  `/data/${encodeURIComponent(table)}${at ? `?at=${encodeURIComponent(at)}` : ''}`

function ReviewRoute() {
  const navigate = useNavigate()
  const search = Route.useSearch()

  useEffect(() => {
    if (catalogue.getState().status === 'empty') {
      void catalogue.getState().load(repositories(PACK_ORG_ID).catalogue)
    }
  }, [])

  /* A POSITION IS NEVER A CHANGE OF SCREEN, so it never starts a View Transition — the reason
     `src/routes/history.tsx` gives. */
  const onAt = useCallback(
    (key: string) => {
      void navigate({
        to: '/review',
        search: key === '' ? {} : { case: key },
        replace: true,
        viewTransition: false,
      })
    },
    [navigate],
  )

  return (
    <Review
      at={search.case ?? ''}
      onAt={onAt}
      listHref={listHref}
      go={(href) => void navigate({ href })}
      openTheFile={() => void navigate({ to: '/sign-in', search: { again: true } })}
    />
  )
}
