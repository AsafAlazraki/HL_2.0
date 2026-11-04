import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { repositories } from '@/data'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { Place } from '@/screens/places/Place'
import { readPlaceAt, writePlaceAt, type PlaceAt, type PlaceTab } from '@/screens/places/tabs'

/* ============================================================
   /places/$id — one maker as Northside sells it: its livery, then
   its range (every model with its price, its facts and what it
   carries), then its prices, quotes, partners and changes; and its
   Settings (the data round's direction A, "The line-up", 2026-11-04).

   `$id` IS THE LIST THE PLACE STANDS FOR — `boat_highfield`,
   `registration` — the same word the sheet's own address uses, so a
   place and its list read alike (`addressOf`, livery.ts).

   THE POSITION IS THE SEARCH: `tab=settings`, and on the range the
   series, the order, the find, the boats set side by side, the compare
   opened and the heading open (`readPlaceAt`). Written with `replace`:
   a Back that walked back through every filter pressed would be a
   Back that never leaves.
   ============================================================ */

export interface PlaceSearch extends Record<string, unknown> {
  tab?: 'settings'
}

export const Route = createFileRoute('/places/$id')({
  validateSearch: (search: Record<string, unknown>): PlaceSearch => ({
    ...(search.tab === 'settings' ? { tab: 'settings' as const } : {}),
    ...writePlaceAt(readPlaceAt(search)),
  }),
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: PlaceRoute,
})

function PlaceRoute() {
  const navigate = useNavigate()
  const { id } = Route.useParams()
  const search = Route.useSearch()
  const tab: PlaceTab = search.tab === 'settings' ? 'settings' : 'range'
  const at = readPlaceAt(search)

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
        resetScroll: next === 'settings',
      })
    },
    [navigate, id],
  )

  const onAt = useCallback(
    (next: PlaceAt) => {
      void navigate({
        to: '/places/$id',
        params: { id },
        search: writePlaceAt(next),
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
      tab={tab}
      onTab={onTab}
      at={at}
      onAt={onAt}
      go={(href) => void navigate({ href })}
      openTheFile={() => void navigate({ to: '/sign-in', search: { again: true } })}
    />
  )
}
