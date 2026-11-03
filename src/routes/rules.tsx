import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { repositories } from '@/data'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { Rules, type RulesAt } from '@/screens/rules/Rules'

/* ============================================================
   /rules — where a dealer says what may be sold with what.

   BEHIND THE SAME DOOR AS EVERY OTHER SCREEN: a browser with no name
   in the session lands on Entry, by `beforeLoad`, for the reason
   `src/routes/index.tsx` gives.

   IT READS THIS BROWSER AND NEVER THE FILE. The rules are filed beside
   the sheet this browser kept (`constraintDefs`), so the catalogue is
   read out of the repository, exactly as History and Data read it.

   THREE SEARCH PARAMS, each a position inside the page:
     open   which clause is open in place — a rule's id, a price-list
            rule's reference (`F7`) being said as Northside's, or
            `new:motor` / `new:trailer` for a new one in that part (a
            bare `new` is a motor). Absent, nothing is open.
     look   which of the price list's clauses is opened on the offers
            that break it (`F6`), since 2026-11-03.
     on     the one boat the clause being written is tried on — a
            model's key — since 2026-11-03.
   Each is written with `replace`, the register's reason: a page where
   every clause opened is a history entry has a Back that walks
   through rules instead of out. A search param is something somebody
   typed, so it is read rather than trusted.
   ============================================================ */

export interface RulesSearch {
  open?: string
  look?: string
  on?: string
}

const word = (v: unknown, max: number): string | undefined => {
  const t = typeof v === 'string' ? v.trim() : ''
  return t !== '' && t.length <= max ? t : undefined
}

export const Route = createFileRoute('/rules')({
  validateSearch: (search: Record<string, unknown>): RulesSearch => {
    const out: RulesSearch = {}
    const open = word(search.open, 64)
    if (open) out.open = open
    const look = word(search.look, 16)
    if (look) out.look = look
    const on = word(search.on, 200)
    if (on) out.on = on
    return out
  },
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: RulesRoute,
})

/** The price list at one line of it: the sheet's own `at` (src/routes/data.$table.tsx), with the
 *  column in conflict pressed into the grid beside the line (the sheet's own `show`), so the value
 *  a fix is made on stands in sight on the line that writes it (verify 2, data round, J2). */
const listHref = (table: string, at: string, show?: string): string =>
  `/data/${encodeURIComponent(table)}?at=${encodeURIComponent(at)}${
    show ? `&show=${encodeURIComponent(show)}` : ''
  }`

/** One quote in the build: the configurator's own address (src/routes/quote.$id.tsx). */
const quoteHref = (id: string): string => `/quote/${encodeURIComponent(id)}`

function RulesRoute() {
  const navigate = useNavigate()
  const search = Route.useSearch()

  useEffect(() => {
    if (catalogue.getState().status === 'empty') {
      void catalogue.getState().load(repositories(PACK_ORG_ID).catalogue)
    }
    /* THE QUOTES STANDING NOW, so a clause can say which of them it speaks of */
    if (!quotes.getState().loaded) void quotes.getState().openFor(PACK_ORG_ID)
  }, [])

  /* A POSITION IS NEVER A CHANGE OF SCREEN, so it never starts a View Transition — the reason
     `src/routes/history.tsx` gives — and it never moves the page: opening, adding or closing a
     clause keeps the reader where they are, and the clause brings itself into sight
     (built-critique-m3.md, major 8: the page jumped to its top after Add, the rule out of sight).
     Opening another clause starts its boat afresh: `on` belongs to the clause it was tried in. */
  const go = useCallback(
    (next: Partial<RulesAt>) => {
      void navigate({
        to: '/rules',
        search: (prev: RulesSearch) => {
          const merged: RulesSearch = { ...prev }
          for (const key of ['open', 'look', 'on'] as const) {
            if (!(key in next)) continue
            const v = next[key]
            if (v === undefined || v === '') delete merged[key]
            else merged[key] = v
          }
          if ('open' in next && next.open !== prev.open && !('on' in next)) delete merged.on
          return merged
        },
        replace: true,
        viewTransition: false,
        resetScroll: false,
      })
    },
    [navigate],
  )

  return (
    <Rules
      at={{ open: search.open ?? '', look: search.look ?? '', on: search.on ?? '' }}
      go={go}
      listHref={listHref}
      quoteHref={quoteHref}
      follow={(href) => void navigate({ href })}
      openTheFile={() => void navigate({ to: '/sign-in', search: { again: true } })}
    />
  )
}
