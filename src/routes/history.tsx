import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { repositories } from '@/data'
import { useCatalogue } from '@/app/useStores'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { History, type HistoryPosition } from '@/screens/history/History'
import type { SpanKey } from '@/domain/quote/diary/history'

/* ============================================================
   /history — the diary's address.

   IT IS BEHIND THE SAME DOOR AS HOME AND THE REGISTER. A browser with
   no name in the session lands on Entry whatever address was typed:
   the first-visit rule is the shell's, and it is `beforeLoad` for the
   reason `src/routes/index.tsx` gives.

   IT READS THIS BROWSER AND NEVER THE FILE. `catalogue.load(repository)`
   reads the sheet this browser already kept — the diary needs it for
   exactly one thing, `Quote this again, at today's prices`, which
   prices from the file as it reads today — and `quotes.openFor` reads
   the documents. A browser that holds no copy of the file still shows
   every event on every quote it has, because every sentence in a diary was said
   when it happened and is kept on the document.

   THE FIVE SEARCH PARAMS. `span` is which days (today, week, month,
   year; absent is any day); `who` is what was typed into the find
   field; `customer` is a row of the register, or `__none` for the pile
   of typed names; `open` is the quote whose line is open, and `day`
   the day it is open on, because the same document is a line under
   every day it was touched. Written with `replace`, for the register's
   reason: a diary where every arrow key is a history entry has a Back
   that walks a person back through eighteen lines instead of out.

   A SEARCH PARAM IS SOMETHING SOMEBODY TYPED, so it is read rather
   than trusted: a span is one of the four words or it is not there, a
   day is `YYYY-MM-DD` or it is not there, and anything else is a short
   non-empty string or nothing.
   ============================================================ */

export interface HistorySearch {
  span?: SpanKey
  who?: string
  customer?: string
  open?: string
  day?: string
}

const SPANS: readonly SpanKey[] = ['today', 'week', 'month', 'year']

const word = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const said = value.trim()
  return said === '' || said.length > 120 ? undefined : said
}

const spanOf = (value: unknown): SpanKey | undefined =>
  typeof value === 'string' && (SPANS as readonly string[]).includes(value)
    ? (value as SpanKey)
    : undefined

const dayOf = (value: unknown): string | undefined =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined

export const Route = createFileRoute('/history')({
  validateSearch: (search: Record<string, unknown>): HistorySearch => {
    const span = spanOf(search.span)
    const who = word(search.who)
    const customer = word(search.customer)
    const open = word(search.open)
    const day = dayOf(search.day)
    return {
      ...(span ? { span } : {}),
      ...(who ? { who } : {}),
      ...(customer ? { customer } : {}),
      ...(open ? { open } : {}),
      ...(day ? { day } : {}),
    }
  },
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: HistoryRoute,
})

function HistoryRoute() {
  const navigate = useNavigate()
  const { span, who, customer, open, day } = Route.useSearch()
  const business = useCatalogue((s) => s.business)

  useEffect(() => {
    if (catalogue.getState().status === 'empty') {
      void catalogue.getState().load(repositories(PACK_ORG_ID).catalogue)
    }
    /* THE DOCUMENTS ARE READ, NOT ASSUMED: a diary that printed "nothing
       has happened" without asking the database would be printing a
       hope. */
    if (!quotes.getState().loaded) void quotes.getState().openFor(PACK_ORG_ID)
  }, [])

  const onPosition = useCallback(
    (position: HistoryPosition) => {
      void navigate({ to: '/history', search: position, replace: true })
    },
    [navigate],
  )

  return (
    <History
      business={business}
      span={span ?? 'all'}
      who={who ?? ''}
      customer={customer ?? ''}
      open={open ?? ''}
      day={day ?? ''}
      onPosition={onPosition}
      goHome={() => void navigate({ to: '/' })}
      openTheFile={() => void navigate({ to: '/sign-in', search: { again: true } })}
      /* A push and never a replace for a move to another screen — the
         position params are what this route replaces, so that Back
         leaves the diary rather than walking back through its lines. */
      newQuote={() => void navigate({ to: '/quote/new' })}
      /* A DRAFT OPENS WHERE IT IS WRITTEN AND AN ISSUED QUOTE OPENS AS
         PAPER — the rule Home and the register settled, and the same
         two addresses. A replaced quote is an issued one with something
         newer beside it, so it opens as paper too. */
      openQuote={(id, state) =>
        void navigate(
          state === 'draft'
            ? { to: '/quote/$id', params: { id } }
            : { to: '/quote/$id/document', params: { id } },
        )
      }
      /* THE CUSTOMERS SCREEN IS BEING BUILT BESIDE THIS ONE, at its own
         address; the row id travels as a search param the way the
         register's `at` does, and that screen reads what it reads. */
      openCustomer={(rowId) =>
        void navigate({ href: `/customers?at=${encodeURIComponent(rowId)}` })
      }
    />
  )
}
