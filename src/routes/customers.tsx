import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { repositories } from '@/data'
import { useCatalogue } from '@/app/useStores'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { Customers, type CustomersPosition } from '@/screens/customers/Customers'
import type { BookGrouping, BookOrder } from '@/domain/people/book'

/* ============================================================
   /customers — the book's address.

   IT IS BEHIND THE SAME DOOR AS HOME AND THE REGISTER: a browser with
   no name in the session lands on Entry whatever address was typed,
   and it is `beforeLoad` for the reason `src/routes/index.tsx` gives.

   IT READS THIS BROWSER AND NEVER THE FILE. The book is a TABLE on the
   sheet this browser keeps — `__customers`, made the day the first
   person is filed — so `catalogue.load(repository)` reads it back the
   way it reads every other table, and `quotes.openFor` reads the
   documents whose addresses point at its rows. Entry's blue door is
   the one place the Master Price File is fetched.

   THE SIX SEARCH PARAMS. `who` is the row the letter is open on (or
   the cursor in the book); `find` is what was typed into the find
   field; `book=all` is the whole book open instead of a letter;
   `order=name` is the alphabet, pressed; `group=desk` is the book cut
   by what each person is doing next; `file=1` is the filing form
   open. `at` is accepted as another spelling of `who`, because the
   diary links here with it (`src/screens/history/History.tsx`,
   `CUSTOMERS_ADDRESS`) and a link that arrived is a link to honour.
   All are written with `replace`, for the register's reason: a book
   where every arrow key is a history entry has a Back that walks a
   person back through eighteen rows instead of out of the screen.

   A SEARCH PARAM IS SOMETHING SOMEBODY TYPED, so it is read rather than
   trusted: an order is one of two words or it is not there, a grouping
   likewise, and anything else is a short non-empty string or nothing.
   ============================================================ */

export interface CustomersSearch {
  who?: string
  find?: string
  book?: 'all'
  order?: BookOrder
  group?: BookGrouping
  file?: '1'
}

const word = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const said = value.trim()
  return said === '' || said.length > 120 ? undefined : said
}

const orderOf = (value: unknown): BookOrder | undefined =>
  value === 'name' || value === 'register' ? value : undefined
const groupOf = (value: unknown): BookGrouping | undefined =>
  value === 'desk' || value === 'none' ? value : undefined

export const Route = createFileRoute('/customers')({
  validateSearch: (search: Record<string, unknown>): CustomersSearch => {
    const who = word(search.who) ?? word(search.at)
    const find = word(search.find)
    const order = orderOf(search.order)
    const group = groupOf(search.group)
    return {
      ...(who ? { who } : {}),
      ...(find ? { find } : {}),
      ...(search.book === 'all' ? { book: 'all' as const } : {}),
      ...(order && order !== 'register' ? { order } : {}),
      ...(group && group !== 'none' ? { group } : {}),
      ...(search.file === '1' || search.file === 1 ? { file: '1' as const } : {}),
    }
  },
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: CustomersRoute,
})

function CustomersRoute() {
  const navigate = useNavigate()
  const { who, find, book, order, group, file } = Route.useSearch()
  const business = useCatalogue((s) => s.business)

  useEffect(() => {
    /* a sheet already in memory is not re-read; a browser that has one
       kept is read once, and `load` files its own refusal rather than
       throwing */
    if (catalogue.getState().status === 'empty') {
      void catalogue.getState().load(repositories(PACK_ORG_ID).catalogue)
    }
    /* THE DOCUMENTS ARE READ, NOT ASSUMED: a letter that printed "no
       quotes" without asking the database would be printing a hope */
    if (!quotes.getState().loaded) void quotes.getState().openFor(PACK_ORG_ID)
  }, [])

  const onPosition = useCallback(
    (position: CustomersPosition) => {
      void navigate({ to: '/customers', search: position, replace: true })
    },
    [navigate],
  )

  return (
    <Customers
      business={business}
      who={who ?? ''}
      find={find ?? ''}
      book={book === 'all'}
      order={order ?? 'register'}
      group={group ?? 'none'}
      file={file === '1'}
      onPosition={onPosition}
      goHome={() => void navigate({ to: '/' })}
      openTheFile={() => void navigate({ to: '/sign-in', search: { again: true } })}
      /* a push and never a replace for a move to another screen, so
         Back leaves the book rather than walking back through it */
      newQuote={() => void navigate({ to: '/quote/new' })}
      /* A DRAFT OPENS WHERE IT IS WRITTEN AND A GIVEN QUOTE OPENS AS
         PAPER — the rule Home and the register settled, and the same
         two addresses; a replaced quote is a given one with something
         newer beside it, so it opens as paper too. */
      openQuote={(id, state) =>
        void navigate(
          state === 'draft'
            ? { to: '/quote/$id', params: { id } }
            : { to: '/quote/$id/document', params: { id } },
        )
      }
    />
  )
}
