import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { repositories } from '@/data'
import { useCatalogue } from '@/app/useStores'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { Manage, type ManagePlace } from '@/screens/manage/Manage'

/* ============================================================
   /manage — Settings: Northside's details, its people, and how the app
   looks (Milestone 4).

   BEHIND THE SAME DOOR AS EVERY OTHER SCREEN: a browser with no name in
   the session lands on Entry, by `beforeLoad`, for the reason
   `src/routes/index.tsx` gives.

   IT READS THIS COMPUTER'S COPY: the catalogue out of the repository,
   where Northside's settings are kept beside the sheet, and the quotes,
   because the letterhead is drawn on the newest draft.

   TWO SEARCH PARAMS, each a position on the screen and never a change of
   screen: `line`, the letterhead line or quote line whose field is open
   ('mark' for the paper's mark), and `person`, the person being set ('new'
   for one being added). `at=home` is the way Home's "Arrange Home" opens
   it, at Home's arrangement. Written with `replace`, the register's
   reason: a Back that walked back through every field opened would be a
   Back that never leaves.
   ============================================================ */

export interface ManageSearch {
  line?: string
  person?: string
  at?: 'home'
}

const word = (value: unknown, most: number): string | undefined => {
  const text = typeof value === 'string' ? value.trim() : ''
  return text !== '' && text.length <= most && /^[\w-]+$/.test(text) ? text : undefined
}

export const Route = createFileRoute('/manage')({
  validateSearch: (search: Record<string, unknown>): ManageSearch => {
    const line = word(search.line, 40)
    const person = word(search.person, 80)
    return {
      ...(line ? { line } : {}),
      ...(person ? { person } : {}),
      ...(search.at === 'home' ? { at: 'home' as const } : {}),
    }
  },
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: ManageRoute,
})

function ManageRoute() {
  const navigate = useNavigate()
  const { line, person, at } = Route.useSearch()

  useEffect(() => {
    if (catalogue.getState().status === 'empty') {
      void catalogue.getState().load(repositories(PACK_ORG_ID).catalogue)
    }
    if (!quotes.getState().loaded) void quotes.getState().openFor(PACK_ORG_ID)
  }, [])

  /* ARRIVING FROM HOME'S "ARRANGE HOME", the page opens at Home's arrangement */
  const ready = useCatalogue((s) => s.status === 'ready')
  useEffect(() => {
    if (at !== 'home' || !ready) return
    const target = document.getElementById('mg-home-arrange')
    if (target) target.scrollIntoView({ block: 'start' })
  }, [at, ready])

  const onPlace = useCallback(
    (next: ManagePlace) => {
      void navigate({
        to: '/manage',
        search: {
          ...(next.line ? { line: next.line } : {}),
          ...(next.person ? { person: next.person } : {}),
        },
        replace: true,
        viewTransition: false,
        resetScroll: false,
      })
    },
    [navigate],
  )

  return (
    <Manage
      place={{ ...(line ? { line } : {}), ...(person ? { person } : {}) }}
      onPlace={onPlace}
      go={(href) => void navigate({ href })}
    />
  )
}
