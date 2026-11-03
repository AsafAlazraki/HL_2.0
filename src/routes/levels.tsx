import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { repositories } from '@/data'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { Levels } from '@/screens/levels/Levels'

/* ============================================================
   /levels — Prices: what only Northside can decide about price, and the price
   list's own figures set from here.

   BEHIND THE SAME DOOR AS EVERY OTHER SCREEN: a browser with no name
   in the session lands on Entry, by `beforeLoad`, for the reason
   `src/routes/index.tsx` gives.

   IT READS THIS COMPUTER'S COPY AND NEVER THE FILE. The prices are
   filed beside the sheet the catalogue keeps (`priceLevels`), so the
   catalogue is read out of the repository, exactly as Rules and Data
   read it.

   THREE SEARCH PARAMS. `line`: the line looked up for each buyer's price,
   its list and its line (`boat_stacer~boat_stacer:1`). `list`: the list whose prices are open, by its
   column on the ladder (`boat_stacer`, `mot_yamaha`,
   `trailers:trl_redco`) or by its own list's id from the build's door
   (`dealer_fit`). Absent, none is. `quote`: the quote that door came
   from, so the page reads the list on that quote's own line and
   leads back to it once it is chosen. It is written with
   `replace`, the register's reason: a Back that walked back through
   every list pressed would be a Back that never leaves.
   ============================================================ */

export interface LevelsSearch {
  list?: string
  /** THE QUOTE THAT SENT THE DEALER HERE, by its id: the build's door to a list whose price is
   *  not chosen carries it, so Prices can say "Back to the quote" once it is chosen */
  quote?: string
  /** THE LINE LOOKED UP for each buyer's price, its list and its line (`Lookup.tsx`) */
  line?: string
}

const word = (value: unknown, most: number): string | undefined => {
  const text = typeof value === 'string' ? value.trim() : ''
  return text !== '' && text.length <= most ? text : undefined
}

export const Route = createFileRoute('/levels')({
  validateSearch: (search: Record<string, unknown>): LevelsSearch => {
    const list = word(search.list, 80)
    const quote = word(search.quote, 80)
    const line = word(search.line, 200)
    return {
      ...(list ? { list } : {}),
      ...(quote ? { quote } : {}),
      ...(line ? { line } : {}),
    }
  },
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: LevelsRoute,
})

function LevelsRoute() {
  const navigate = useNavigate()
  const { list, quote, line } = Route.useSearch()

  useEffect(() => {
    if (catalogue.getState().status === 'empty') {
      void catalogue.getState().load(repositories(PACK_ORG_ID).catalogue)
    }
    /* THE QUOTES ON THE DESK ARE READ ON ARRIVAL, not only from the build's door: a choice says
       which drafts it touches before it is written (the judge of Prices, 2026-11-04, L8), and the
       quote the door came from names the line the list is read on */
    if (!quotes.getState().loaded) void quotes.getState().openFor(PACK_ORG_ID)
  }, [])

  /* A POSITION IS NEVER A CHANGE OF SCREEN, so it never starts a View Transition — the reason
     `src/routes/history.tsx` gives. Each position keeps the others. */
  const at = useCallback(
    (next: LevelsSearch) => {
      void navigate({
        to: '/levels',
        search: {
          ...(next.list ? { list: next.list } : {}),
          ...(quote ? { quote } : {}),
          ...(next.line ? { line: next.line } : {}),
        },
        replace: true,
        viewTransition: false,
        resetScroll: false,
      })
    },
    [navigate, quote],
  )
  const onList = useCallback((next: string) => at({ list: next, line }), [at, line])
  const onLine = useCallback((next: string) => at({ list, line: next }), [at, list])

  return (
    <Levels
      list={list ?? ''}
      onList={onList}
      line={line ?? ''}
      onLine={onLine}
      go={(href) => void navigate({ href })}
      quote={quote}
      openTheFile={() => void navigate({ to: '/sign-in', search: { again: true } })}
      backToQuote={
        quote
          ? () =>
              void navigate({ to: '/quote/$id', params: { id: quote }, search: { at: 'finale' } })
          : undefined
      }
    />
  )
}
