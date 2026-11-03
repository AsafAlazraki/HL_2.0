import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { loadEntities, loadTable } from '@/data/pack/load'
import { repositories } from '@/data'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { Review, type ReviewPosition } from '@/screens/review/Review'

/* ============================================================
   /review — what is wrong in Northside's own price list, one case at a time, each with its fix.

   BEHIND THE SAME DOOR AS EVERY OTHER SCREEN: a browser with no name in the session lands on
   Entry, by `beforeLoad`, for the reason `src/routes/index.tsx` gives.

   IT READS THIS COMPUTER, AND THE FILE ONLY FOR WHAT CHANGED SINCE IT. The checks are counted on
   the price list this browser kept, so the catalogue is read out of the repository, exactly as
   History, Data and Rules read it; a fix is written back through the catalogue's own command
   door. The quotes are read too, so a case can say which of them carry its line. The lists
   written on this computer since the Master Price File was packed are fetched as the file
   carries them (`fileOf`, the sheet's own door in src/routes/data.$table.tsx), so the screen can
   say what is new since the file and what was settled; a list as the file packed it is never
   fetched.

   THE POSITION IS THE SEARCH PARAMS (CLAUDE.md):
     case   the case on the stage, by its key (`cases.ts`), or `tidy` for the tidy suggestions.
            Absent, the first case still standing; naming one settled or gone, the stage says so
            and holds the first.
     list   `open`: every case, findable, is open under the rail (below a desk, where it has no
            column of its own)
     find   the words typed into the find over every case
     by     `list`: every case grouped by the list it stands on, not by its check
     left   `open`: the list of what was left alone is open at the foot
     since  `open`: the list of what was settled since the price file is open at the foot
   Written with `replace`, the register's reason: a Back that walked through every case settled
   would walk a person through the screen instead of out of it. And never with the page thrown
   to its top (`resetScroll: false`): a press on a phone lands on the next case's title, which
   the screen brings into view itself (the judge of 2026-11-04, B4).
   ============================================================ */

export type ReviewSearch = ReviewPosition

const word = (value: unknown, max = 120): string | undefined => {
  if (typeof value !== 'string') return undefined
  const said = value.trim()
  return said === '' || said.length > max ? undefined : said
}

export const Route = createFileRoute('/review')({
  validateSearch: (search: Record<string, unknown>): ReviewSearch => {
    const out: ReviewSearch = {}
    const at = word(search.case, 400)
    if (at) out.case = at
    if (search.list === 'open') out.list = 'open'
    const find = word(search.find)
    if (find) out.find = find
    if (search.by === 'list') out.by = 'list'
    if (search.left === 'open') out.left = 'open'
    if (search.since === 'open') out.since = 'open'
    return out
  },
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: ReviewRoute,
})

/** The price list at one line of it: the sheet's own `at` (src/routes/data.$table.tsx). */
const listHref = (table: string, at?: string): string =>
  `/data/${encodeURIComponent(table)}${at ? `?at=${encodeURIComponent(at)}` : ''}`

/** The Master Price File as it was packed: its lists' definitions, and one list's lines. */
const FILE_OF = { entities: loadEntities, rows: (tableId: string) => loadTable(tableId) }

function ReviewRoute() {
  const navigate = useNavigate()
  const search = Route.useSearch()

  useEffect(() => {
    if (catalogue.getState().status === 'empty') {
      void catalogue.getState().load(repositories(PACK_ORG_ID).catalogue)
    }
    if (!quotes.getState().loaded) void quotes.getState().openFor(PACK_ORG_ID)
  }, [])

  /* A POSITION IS NEVER A CHANGE OF SCREEN, so it never starts a View Transition — the reason
     `src/routes/history.tsx` gives — and never throws the page to its top. */
  const onPosition = useCallback(
    (next: ReviewPosition) => {
      void navigate({
        to: '/review',
        search: next,
        replace: true,
        viewTransition: false,
        resetScroll: false,
      })
    },
    [navigate],
  )

  return (
    <Review
      position={search}
      onPosition={onPosition}
      listHref={listHref}
      go={(href) => void navigate({ href })}
      openTheFile={() => void navigate({ to: '/sign-in', search: { again: true } })}
      fileOf={FILE_OF}
    />
  )
}
