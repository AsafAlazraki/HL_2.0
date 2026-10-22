import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { repositories } from '@/data'
import { catalogue } from '@/state/catalogue'
import { session } from '@/state/session'
import { Review } from '@/screens/review/Review'
import { isCheck, type CheckId } from '@/screens/review/read'

/* ============================================================
   /review — what is wrong in Northside's own price list, with the fix beside it.

   BEHIND THE SAME DOOR AS EVERY OTHER SCREEN: a browser with no name in the session lands on
   Entry, by `beforeLoad`, for the reason `src/routes/index.tsx` gives.

   IT READS THIS COMPUTER AND NEVER THE FILE. The checks are counted on the price list this
   browser kept, so the catalogue is read out of the repository, exactly as History, Data and
   Rules read it; a fix is written back through the catalogue's own command door.

   ONE SEARCH PARAM, `open`: which check is open — one of the six words, or `-` for every
   check folded. Absent, the screen opens the first check that costs something. Written with
   `replace`, the register's reason: a Back that walked through every check opened would walk
   a person through the screen instead of out of it.
   ============================================================ */

export interface ReviewSearch {
  open?: CheckId | '-'
}

export const Route = createFileRoute('/review')({
  validateSearch: (search: Record<string, unknown>): ReviewSearch => {
    if (search.open === '-') return { open: '-' }
    return isCheck(search.open) ? { open: search.open } : {}
  },
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: ReviewRoute,
})

function ReviewRoute() {
  const navigate = useNavigate()
  const { open } = Route.useSearch()

  useEffect(() => {
    if (catalogue.getState().status === 'empty') {
      void catalogue.getState().load(repositories(PACK_ORG_ID).catalogue)
    }
  }, [])

  /* A POSITION IS NEVER A CHANGE OF SCREEN, so it never starts a View Transition — the reason
     `src/routes/history.tsx` gives. */
  const onOpen = useCallback(
    (next: CheckId | '-') => {
      void navigate({ to: '/review', search: { open: next }, replace: true, viewTransition: false })
    },
    [navigate],
  )

  return (
    <Review
      open={open ?? ''}
      onOpen={onOpen}
      /* the price list at the line a finding names: the sheet's own `at`, and its `find` for a
         name that stands on two lines */
      openList={(table, at, find) =>
        void navigate({
          to: '/data/$table',
          params: { table },
          search: { ...(at ? { at } : {}), ...(find ? { find } : {}) },
        })
      }
      openTheFile={() => void navigate({ to: '/sign-in', search: { again: true } })}
    />
  )
}
