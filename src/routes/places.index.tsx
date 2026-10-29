import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { repositories } from '@/data'
import { catalogue } from '@/state/catalogue'
import { session } from '@/state/session'
import { Places } from '@/screens/places/Places'

/* ============================================================
   /places — the places in Northside's business, each on its own
   ground (Milestone 4, board A "The livery").

   `places.index.tsx` and not `places.tsx`, for /data's reason: a
   `places.tsx` would be a LAYOUT wrapping `places.$id.tsx`, and one
   place would then draw inside the index. As siblings, `/places` is
   every place and `/places/boat_highfield` is one.

   BEHIND THE SAME DOOR AS EVERY SCREEN: a browser with no name lands on
   Entry, by `beforeLoad`. IT READS THIS COMPUTER'S COPY AND NEVER THE
   FILE: the only call is `catalogue.load(repository)`, which cannot
   fetch.

   ONE SEARCH PARAM: `kind`, the kind the chips have narrowed to. A
   position inside a screen is in the address, written with `replace`.
   ============================================================ */

export interface PlacesSearch {
  kind?: string
}

export const Route = createFileRoute('/places/')({
  validateSearch: (search: Record<string, unknown>): PlacesSearch => {
    const kind = typeof search.kind === 'string' ? search.kind.trim() : ''
    return kind !== '' && kind.length <= 20 ? { kind } : {}
  },
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: PlacesRoute,
})

function PlacesRoute() {
  const navigate = useNavigate()
  const { kind } = Route.useSearch()

  useEffect(() => {
    if (catalogue.getState().status === 'empty') {
      void catalogue.getState().load(repositories(PACK_ORG_ID).catalogue)
    }
  }, [])

  /* A POSITION IS NEVER A CHANGE OF SCREEN, so it never starts a View Transition (Data's
     route says why). */
  const onKind = useCallback(
    (next: string) => {
      void navigate({
        to: '/places',
        search: next === 'all' ? {} : { kind: next },
        replace: true,
        viewTransition: false,
        resetScroll: false,
      })
    },
    [navigate],
  )

  return (
    <Places
      kind={kind ?? 'all'}
      onKind={onKind}
      open={(id) => void navigate({ to: '/places/$id', params: { id } })}
      openTheFile={() => void navigate({ to: '/sign-in', search: { again: true } })}
    />
  )
}
