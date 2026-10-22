import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { repositories } from '@/data'
import { catalogue } from '@/state/catalogue'
import { session } from '@/state/session'
import { Levels } from '@/screens/levels/Levels'

/* ============================================================
   /levels — Prices: which price each customer pays, and the price
   list's own figures set from here.

   BEHIND THE SAME DOOR AS EVERY OTHER SCREEN: a browser with no name
   in the session lands on Entry, by `beforeLoad`, for the reason
   `src/routes/index.tsx` gives.

   IT READS THIS COMPUTER'S COPY AND NEVER THE FILE. The prices are
   filed beside the sheet the catalogue keeps (`priceLevels`), so the
   catalogue is read out of the repository, exactly as Rules and Data
   read it.

   ONE SEARCH PARAM, `list`: the list whose prices are open, by its
   column on the ladder (`boat_stacer`, `mot_yamaha`,
   `trailers:trl_redco`). Absent, none is. It is written with
   `replace`, the register's reason: a Back that walked back through
   every list pressed would be a Back that never leaves.
   ============================================================ */

export interface LevelsSearch {
  list?: string
}

export const Route = createFileRoute('/levels')({
  validateSearch: (search: Record<string, unknown>): LevelsSearch => {
    const list = typeof search.list === 'string' ? search.list.trim() : ''
    return list !== '' && list.length <= 80 ? { list } : {}
  },
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: LevelsRoute,
})

function LevelsRoute() {
  const navigate = useNavigate()
  const { list } = Route.useSearch()

  useEffect(() => {
    if (catalogue.getState().status === 'empty') {
      void catalogue.getState().load(repositories(PACK_ORG_ID).catalogue)
    }
  }, [])

  /* A POSITION IS NEVER A CHANGE OF SCREEN, so it never starts a View Transition — the reason
     `src/routes/history.tsx` gives. */
  const onList = useCallback(
    (next: string) => {
      void navigate({
        to: '/levels',
        search: next === '' ? {} : { list: next },
        replace: true,
        viewTransition: false,
        resetScroll: false,
      })
    },
    [navigate],
  )

  return (
    <Levels
      list={list ?? ''}
      onList={onList}
      openTheFile={() => void navigate({ to: '/sign-in', search: { again: true } })}
    />
  )
}
