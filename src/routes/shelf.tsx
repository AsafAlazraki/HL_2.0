import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useBlocker, useNavigate } from '@tanstack/react-router'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { repositories } from '@/data'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { Shelf, type ShelfSee } from '@/screens/shelf/Shelf'
import { actUnderWay } from '@/screens/shelf/acts'
import type { Way } from '@/domain/io/changeSet'
import { isSwing, type NarrowBy } from '@/domain/io/swing'

/* ============================================================
   /shelf — a new Master Price File, and Northside's work kept safe
   (Milestone 4). A room of the price list, behind Data.

   BEHIND THE SAME DOOR AS EVERY OTHER SCREEN: a browser with no name
   in the session lands on Entry, by `beforeLoad`, for the reason
   `src/routes/index.tsx` gives.

   IT READS THIS COMPUTER'S KEEPING: the catalogue out of the
   repository and every quote, because the inventory counts both and a
   copy carries both.

   THE CHANGE SHEET'S NARROWING IS AN ADDRESS TOO (round 2, board A): `list`, `who` (a
   supplier), `way` (higher, lower, new, cannot, others), `twice` (doubled or halved), `q`
   (words of a name or a code) and `fig` (a figure that moves). They are written with
   `replace`, so Back leaves the sheet rather than walking back through every press.

   AND `see`: the change sheet, the paste, bringing a
   copy back, and the two pages that take things away — each a page of
   its own and never a box over the shelf — plus the two words the
   shelf is opened with after a copy comes back or the price list is
   cleared. Moving between them is a push, so Back walks back out of a
   page that takes things away rather than past it.
   ============================================================ */

export interface ShelfSearch extends NarrowBy {
  see?: ShelfSee
}

const WAYS: readonly Way[] = ['higher', 'lower', 'new', 'cannot', 'others']

const word = (value: unknown, most: number): string | undefined => {
  const text = typeof value === 'string' ? value.trim() : ''
  return text !== '' && text.length <= most ? text : undefined
}

/** The narrowing as it is read off the address; anything else is dropped, not repaired. */
function narrowOf(search: Record<string, unknown>): NarrowBy {
  const list = word(search.list, 80)
  const who = word(search.who, 80)
  const q = word(search.q, 120)
  const fig = word(search.fig, 80)
  const way = typeof search.way === 'string' && (WAYS as readonly string[]).includes(search.way)
  return {
    ...(list ? { list } : {}),
    ...(who ? { supplier: who } : {}),
    ...(way ? { way: search.way as Way } : {}),
    ...(search.twice === '1' || search.twice === 1 || search.twice === true
      ? { doubled: true }
      : {}),
    ...(q ? { q } : {}),
    ...(fig ? { figure: fig } : {}),
    ...(isSwing(search.by) ? { swing: Number(search.by) as NarrowBy['swing'] } : {}),
  }
}

/** The narrowing written back as the address says it. */
function searchOf(n: NarrowBy): Record<string, string> {
  return {
    ...(n.list ? { list: n.list } : {}),
    ...(n.supplier ? { who: n.supplier } : {}),
    ...(n.way ? { way: n.way } : {}),
    ...(n.doubled ? { twice: '1' } : {}),
    ...(n.q ? { q: n.q } : {}),
    ...(n.figure ? { fig: n.figure } : {}),
    ...(n.swing ? { by: String(n.swing) } : {}),
  }
}

const SEES: readonly ShelfSee[] = [
  'changes',
  'paste',
  'restore',
  'clear',
  'forget',
  'back',
  'cleared',
  'unread',
  'uncopied',
]

export const Route = createFileRoute('/shelf')({
  validateSearch: (search: Record<string, unknown>): ShelfSearch => {
    const see =
      typeof search.see === 'string' && (SEES as readonly string[]).includes(search.see)
        ? (search.see as ShelfSee)
        : undefined
    return see === 'changes' ? { see, ...narrowOf(search) } : see ? { see } : {}
  },
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: ShelfRoute,
})

function ShelfRoute() {
  const navigate = useNavigate()
  const { see, ...narrow } = Route.useSearch()

  /* WHILE A WIPE OR A BRINGING BACK RUNS, NOTHING LEAVES THE PAGE (the shelf's verify-2.md, gap 1):
     the bar, the browser's Back and a reload all wait for it, and the page's own Back says why
     (`holding`, src/screens/shelf/acts.ts). The act opens the page again itself when it is done. */
  useBlocker({
    shouldBlockFn: () => actUnderWay() !== null,
    enableBeforeUnload: () => actUnderWay() !== null,
  })

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

  const onNarrow = useCallback(
    (next: NarrowBy) => {
      void navigate({
        to: '/shelf',
        search: { see: 'changes', ...searchOf(next) },
        replace: true,
        resetScroll: false,
        viewTransition: false,
      })
    },
    [navigate],
  )

  const openQuote = useCallback(
    (id: string) => void navigate({ to: '/quote/$id', params: { id } }),
    [navigate],
  )

  return <Shelf see={see} onSee={onSee} narrow={narrow} onNarrow={onNarrow} openQuote={openQuote} />
}
