import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { repositories } from '@/data'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { Place, PLACE_TABS, type PlaceTab } from '@/screens/places/Place'

/* ============================================================
   /places/$id — one place, opened: its livery at page scale, then
   its range, its quotes, its prices and its settings, and what it
   goes with beside them (Milestone 4, board A with board B's rail
   and tabs grafted, as the verdict asked).

   `$id` IS THE LIST THE PLACE STANDS FOR — `boat_highfield`,
   `registration` — the same word the sheet's own address uses, so a
   place and its list read alike (`addressOf`, livery.ts).

   ONE SEARCH PARAM: `tab`, which of the four is open. Absent is the
   range. Written with `replace`: a Back that walked back through
   every tab pressed would be a Back that never leaves.
   ============================================================ */

export interface PlaceSearch {
  tab?: Exclude<PlaceTab, 'range'>
}

export const Route = createFileRoute('/places/$id')({
  validateSearch: (search: Record<string, unknown>): PlaceSearch => {
    const tab = PLACE_TABS.find((t) => t === search.tab)
    return tab && tab !== 'range' ? { tab } : {}
  },
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: PlaceRoute,
})

function PlaceRoute() {
  const navigate = useNavigate()
  const { id } = Route.useParams()
  const { tab } = Route.useSearch()

  useEffect(() => {
    if (catalogue.getState().status === 'empty') {
      void catalogue.getState().load(repositories(PACK_ORG_ID).catalogue)
    }
    /* a place's quotes are this computer's quotes that carry it */
    if (!quotes.getState().loaded) void quotes.getState().openFor(PACK_ORG_ID)
  }, [])

  const onTab = useCallback(
    (next: PlaceTab) => {
      void navigate({
        to: '/places/$id',
        params: { id },
        search: next === 'range' ? {} : { tab: next },
        replace: true,
        viewTransition: false,
        resetScroll: false,
      })
    },
    [navigate, id],
  )

  return (
    <Place
      address={id}
      tab={tab ?? 'range'}
      onTab={onTab}
      go={(href) => void navigate({ href })}
      openTheFile={() => void navigate({ to: '/sign-in', search: { again: true } })}
    />
  )
}
