import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { repositories } from '@/data'
import { useCatalogue } from '@/app/useStores'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { Quotes } from '@/screens/quotes/Quotes'

/* ============================================================
   /quotes — the register's address.

   IT IS BEHIND THE SAME DOOR AS HOME. A browser with no name in the
   session lands on Entry, whatever address was typed: the first-visit
   rule is the shell's, not Home's, and a register reached around it
   would be the one screen in the app that did not know who was at the
   desk. `beforeLoad`, for the reason `src/routes/index.tsx` gives —
   it is the only place that runs on a typed address, a Back, a
   refresh and a preload alike.

   IT READS THIS BROWSER AND NEVER THE FILE. Entry's blue door is the
   one place the Master Price File is fetched, and nothing here can:
   `catalogue.load(repository)` reads what this browser already kept,
   and `quotes.openFor` reads the documents. So a person who took the
   blank door sees a register that says the file is not open and still
   draws every quote they have — because every figure on a quote was
   frozen when it was written, which is the whole point of freezing
   them.

   THE TWO SEARCH PARAMS. `find` is what was typed into the find
   field; `at` is the reference of the row the panel is open on. A
   position inside a screen is a URL search param (CLAUDE.md), so both
   are in the address and the address is shareable and reloadable. The
   screen is handed them once and hands its own position back; this
   route writes them with `replace`, because a register where every
   arrow key is a history entry has a Back button that walks a person
   back through eighteen rows instead of out of the screen.

   A SEARCH PARAM IS SOMETHING SOMEBODY TYPED, so it is read rather
   than trusted: anything that is not a non-empty string is not there.
   ============================================================ */

export interface QuotesSearch {
  /** what was typed into the find field */
  find?: string
  /** the reference of the row the panel is open on */
  at?: string
}

const word = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const said = value.trim()
  /* A REFERENCE AND A QUERY ARE BOTH SHORT. A 4,000-character address
     is not a person narrowing a list, and reflecting it into a field
     would put it on screen. */
  return said === '' || said.length > 120 ? undefined : said
}

export const Route = createFileRoute('/quotes')({
  validateSearch: (search: Record<string, unknown>): QuotesSearch => {
    const find = word(search.find)
    const at = word(search.at)
    return { ...(find ? { find } : {}), ...(at ? { at } : {}) }
  },
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: QuotesRoute,
})

function QuotesRoute() {
  const navigate = useNavigate()
  const { find, at } = Route.useSearch()
  const business = useCatalogue((s) => s.business)

  useEffect(() => {
    /* A SHEET ALREADY IN MEMORY IS NOT RE-READ; a browser that has one
       kept is read once. `load` files its own refusal on the store and
       never throws, so a database that will not answer leaves the
       register saying the file is not open — which is true — rather
       than saying nothing. */
    if (catalogue.getState().status === 'empty') {
      void catalogue.getState().load(repositories(PACK_ORG_ID).catalogue)
    }
    /* THE DOCUMENTS ARE READ, NOT ASSUMED. A register that printed
       three zeros without asking the database would be printing a
       hope, and this is the one screen whose whole subject is what is
       actually filed. */
    if (!quotes.getState().loaded) void quotes.getState().openFor(PACK_ORG_ID)
  }, [])

  const onPosition = useCallback(
    (position: { find?: string; at?: string }) => {
      void navigate({ to: '/quotes', search: position, replace: true })
    },
    [navigate],
  )

  return (
    <Quotes
      business={business}
      query={find ?? ''}
      at={at ?? ''}
      onPosition={onPosition}
      goHome={() => void navigate({ to: '/' })}
      openTheFile={() => void navigate({ to: '/sign-in', search: { again: true } })}
      /* ────────────────────────────────────────────────────────
         THE TWO SEAMS, CUT 2026-09-18.

         The register listed documents it could not open. Its peek
         drew `Open it` and `New quote` as refusals — "the quote
         document has no screen yet", "the picker is not built yet" —
         on a tree where both screens were live, and the props that
         would have carried the presses did not exist at all, so it
         was never a stale string: the join had not been made. A
         dealer could make version 2 on this screen and then had no
         way to open it.

         Both addresses already existed. Nothing was built to make
         these work and two sentences were deleted.

         A push and never a replace — the position params are what
         this route replaces, so that Back leaves the register
         instead of walking back through eighteen rows, and pressing
         a document is leaving the register. */
      newQuote={() => void navigate({ to: '/quote/new' })}
      /* A DRAFT OPENS WHERE IT IS WRITTEN AND AN ISSUED QUOTE OPENS
         AS PAPER, which is the rule Home settled on 2026-09-18 and
         the same two addresses. Sending an issued quote to the
         configurator would open a screen whose every control refuses
         with `ISSUED_REFUSAL`; sending a draft to the document would
         open a sheet of something nobody has finished writing. A
         superseded quote is an issued one with something newer
         beside it, so it opens as paper too. */
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
