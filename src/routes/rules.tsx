import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { repositories } from '@/data'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
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

   ONE SEARCH PARAM, `open`: which clause is open in place — a rule's
   id, a price-list rule's reference (`F7`) being said as Northside's,
   or `new:motor` / `new:trailer` for a new one in that part (a bare
   `new` is a motor). Absent, nothing is open and the page is read.
   It is written with `replace`, the register's reason: a page where
   every clause opened is a history entry has a Back that walks
   through rules instead of out. A search param is something
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
    /* THE DRAFTS STANDING NOW, so the clause being written can say which of them it would hold */
    if (!quotes.getState().loaded) void quotes.getState().openFor(PACK_ORG_ID)
  }, [])

  /* A POSITION IS NEVER A CHANGE OF SCREEN, so it never starts a View Transition — the reason
     `src/routes/history.tsx` gives — and it never moves the page: opening, adding or closing a
     clause keeps the reader where they are, and the clause brings itself into sight
     (built-critique-m3.md, major 8: the page jumped to its top after Add, the rule out of sight). */
  const onOpen = useCallback(
    (next: string) => {
      void navigate({
        to: '/rules',
        search: next === '' ? {} : { open: next },
        replace: true,
        viewTransition: false,
        resetScroll: false,
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
