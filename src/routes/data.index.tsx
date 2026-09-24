import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { repositories } from '@/data'
import { useCatalogue } from '@/app/useStores'
import { catalogue } from '@/state/catalogue'
import { session } from '@/state/session'
import { Data, type DataPosition } from '@/screens/data/Data'

/* ============================================================
   /data — the register of the dealer's tables, and ITS OWN DOOR.

   "I WANT THE DATA STUFF AS ITS OWN MENU ITEM. NOT UNDER ADMIN!" — so
   it has an address of its own at the root and not under a settings
   screen. It is `data.index.tsx` and not `data.tsx` on purpose: a
   `data.tsx` would be a LAYOUT route wrapping the sheet's
   `data.$table.tsx`, which would then draw inside this screen's
   `<Outlet />`; an index route is a sibling of the sheet under the
   same word, so `/data` is the register and `/data/boat_stacer` is
   the sheet, and neither nests in the other.

   IT IS BEHIND THE SAME DOOR AS HOME. A browser with no name in the
   session lands on Entry, whatever address was typed: the first-visit
   rule is the shell's, and it is `beforeLoad` for the reason
   `src/routes/index.tsx` gives.

   IT READS THIS BROWSER AND NEVER THE FILE. The only call below is
   `catalogue.load(repository)`, which cannot fetch; a browser that
   holds no copy of the file arrives on a register that says no file
   is open and offers the door back. Every figure the screen prints is counted off
   what that read returned.

   THE TWO SEARCH PARAMS. `at` is the id of the table whose page is
   open beside the rows; `find` is what was typed into the find field.
   A position inside a screen is a URL search param (CLAUDE.md), so
   both are in the address and the address is shareable and reloadable.
   The screen is handed them once and hands its own position back;
   this route writes them with `replace`, for the register's reason: a
   screen where every arrow key is a history entry has a Back that
   walks a person back through eighteen rows instead of out of it.

   A SEARCH PARAM IS SOMETHING SOMEBODY TYPED, so it is read rather
   than trusted: anything that is not a short non-empty string is not
   there.
   ============================================================ */

export interface DataSearch {
  /** the id of the table whose page is open */
  at?: string
  /** what was typed into the find field */
  find?: string
}

const word = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const said = value.trim()
  return said === '' || said.length > 120 ? undefined : said
}

export const Route = createFileRoute('/data/')({
  validateSearch: (search: Record<string, unknown>): DataSearch => {
    const at = word(search.at)
    const find = word(search.find)
    return { ...(at ? { at } : {}), ...(find ? { find } : {}) }
  },
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: DataRoute,
})

function DataRoute() {
  const navigate = useNavigate()
  const { at, find } = Route.useSearch()
  const business = useCatalogue((s) => s.business)

  useEffect(() => {
    /* A SHEET ALREADY IN MEMORY IS NOT RE-READ; a browser that has one
       kept is read once. `load` files its own refusal on the store and
       never throws, so a database that will not answer leaves the
       register saying the file is not open — which is true. */
    if (catalogue.getState().status === 'empty') {
      void catalogue.getState().load(repositories(PACK_ORG_ID).catalogue)
    }
  }, [])

  const onPosition = useCallback(
    (position: DataPosition) => {
      void navigate({ to: '/data', search: position, replace: true })
    },
    [navigate],
  )

  return (
    <Data
      business={business}
      at={at ?? ''}
      find={find ?? ''}
      onPosition={onPosition}
      /* a push and never a replace for a move to another screen, so
         Back leaves the register rather than walking back through it */
      goHome={() => void navigate({ to: '/' })}
      openTheFile={() => void navigate({ to: '/sign-in', search: { again: true } })}
      /* ONE TABLE OPENS ON THE SHEET, at the address the sheet owns. The
         screen hands over the id and this route knows the address,
         which is the only place in the app that should. */
      openTable={(table) => void navigate({ to: '/data/$table', params: { table } })}
      openCustomers={() => void navigate({ to: '/customers' })}
    />
  )
}
