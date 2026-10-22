import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { repositories } from '@/data'
import { catalogue } from '@/state/catalogue'
import { session } from '@/state/session'
import { Rules } from '@/screens/rules/Rules'

/* ============================================================
   /rules — where a dealer says what may be sold with what.

   BEHIND THE SAME DOOR AS EVERY OTHER SCREEN: a browser with no name
   in the session lands on Entry, by `beforeLoad`, for the reason
   `src/routes/index.tsx` gives.

   IT READS THIS BROWSER AND NEVER THE FILE. The rules are filed beside
   the sheet this browser kept (`constraintDefs`), so the catalogue is
   read out of the repository, exactly as History and Data read it.

   ONE SEARCH PARAM, `open`: which sentence the plate holds — a rule's
   id, a price-list rule's reference (`F7`), or `new`. Absent, the
   screen chooses. It is written with `replace`, the register's reason:
   a plate where every rule opened is a history entry has a Back that
   walks through rules instead of out. A search param is something
   somebody typed, so it is read rather than trusted.
   ============================================================ */

export interface RulesSearch {
  open?: string
}

export const Route = createFileRoute('/rules')({
  validateSearch: (search: Record<string, unknown>): RulesSearch => {
    const open = typeof search.open === 'string' ? search.open.trim() : ''
    return open !== '' && open.length <= 64 ? { open } : {}
  },
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: RulesRoute,
})

function RulesRoute() {
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
    (next: string) => {
      void navigate({
        to: '/rules',
        search: next === '' ? {} : { open: next },
        replace: true,
        viewTransition: false,
      })
    },
    [navigate],
  )

  return (
    <Rules
      open={open ?? ''}
      onOpen={onOpen}
      openTheFile={() => void navigate({ to: '/sign-in', search: { again: true } })}
    />
  )
}
