import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { repositories } from '@/data'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { Shelf, type ShelfSee } from '@/screens/shelf/Shelf'

/* ============================================================
   /shelf — a new Master Price File, and Northside's work kept safe
   (Milestone 4). A room of the price list, behind Data.

   BEHIND THE SAME DOOR AS EVERY OTHER SCREEN: a browser with no name
   in the session lands on Entry, by `beforeLoad`, for the reason
   `src/routes/index.tsx` gives.

   IT READS THIS COMPUTER'S KEEPING: the catalogue out of the
   repository and every quote, because the inventory counts both and a
   copy carries both.

   ONE SEARCH PARAM, `see`: the change sheet, the paste, bringing a
   copy back, and the two pages that take things away — each a page of
   its own and never a box over the shelf — plus the two words the
   shelf is opened with after a copy comes back or the price list is
   cleared. Moving between them is a push, so Back walks back out of a
   page that takes things away rather than past it.
   ============================================================ */

export interface ShelfSearch {
  see?: ShelfSee
}

const SEES: readonly ShelfSee[] = [
  'changes',
  'paste',
  'restore',
  'clear',
  'forget',
  'back',
  'cleared',
]

export const Route = createFileRoute('/shelf')({
  validateSearch: (search: Record<string, unknown>): ShelfSearch =>
    typeof search.see === 'string' && (SEES as readonly string[]).includes(search.see)
      ? { see: search.see as ShelfSee }
      : {},
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: ShelfRoute,
})

function ShelfRoute() {
  const navigate = useNavigate()
  const { see } = Route.useSearch()

  useEffect(() => {
    if (catalogue.getState().status === 'empty') {
      void catalogue.getState().load(repositories(PACK_ORG_ID).catalogue)
    }
    if (!quotes.getState().loaded) void quotes.getState().openFor(PACK_ORG_ID)
  }, [])

  const onSee = useCallback(
    (next: ShelfSee | undefined) => {
      void navigate({ to: '/shelf', search: next ? { see: next } : {}, viewTransition: false })
      window.scrollTo({ top: 0 })
    },
    [navigate],
  )

  return <Shelf see={see} onSee={onSee} />
}
