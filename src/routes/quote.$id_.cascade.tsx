import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { repositories } from '@/data'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { useCatalogue } from '@/app/useStores'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { Cascade } from '@/screens/cascade/Cascade'

/* ============================================================
   /quote/$id/cascade — the cascade's address, and the whole of why
   this screen is a screen.

   IT IS A ROUTE AND NOT A MODAL STATE, and that is the finding the
   teardown rates above the layout. Selecting an option on Porsche's
   911 navigates to `/feasibility-notification?optionAdded=04P&
   options=<the whole resulting build>&feas-return=<the build to go
   back to>`: the committed state is not held in a component, it is in
   the address bar, so Back, a refresh and a shared link all behave.
   Ours carries two facts rather than three — `fix`, the pick that
   raised it, and `from`, the chapter it was raised in — because the
   build to go back to is the document itself, which this screen has
   not touched. THERE IS NOTHING TO RESTORE ON DECLINE. That is the
   half of their design we do not need.

   THE FILE NAME ENDS THE NESTING ON PURPOSE. `quote.$id_.cascade`
   rather than `quote.$id.cascade`: the trailing underscore is
   TanStack's own opt-out, and without it `/quote/$id` would become a
   layout that has to render an `<Outlet />` for this. The cascade is
   a whole screen standing in front of the build, not a panel inside
   it — the one thing the sweep says a cascade must not be.

   IT IS BEHIND THE SAME DOOR AS EVERY OTHER SCREEN. A browser with no
   name in the session lands on Entry, whatever address was typed;
   `beforeLoad`, for the reason `src/routes/index.tsx` gives.

   IT READS THIS BROWSER AND NEVER THE FILE. Entry's door is the one
   place the Master Price File is fetched. A browser that holds no copy
   of the file and then opens a cascade link is told that the file is
   shut and that every figure already on the quote is frozen and
   unchanged, which is true and is the only honest thing to say.

   A SEARCH PARAM IS SOMETHING SOMEBODY TYPED, so it is read rather
   than trusted: anything that is not a short non-empty string is not
   a fix and the key is simply absent, and the screen then says so in
   a sentence instead of drawing a sheet about nothing.
   ============================================================ */

export interface CascadeSearch {
  /** the pick that raised it — `level:trade`, `finish:<rowId>` */
  fix?: string
  /** the chapter it was raised in, so declining lands where it began */
  from?: string
}

const word = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const said = value.trim()
  /* A FIX IS SHORT. A 4,000-character address is not a person opening
     a decision, and reflecting it would put it on screen. */
  return said === '' || said.length > 200 ? undefined : said
}

export const Route = createFileRoute('/quote/$id_/cascade')({
  validateSearch: (search: Record<string, unknown>): CascadeSearch => {
    const fix = word(search.fix)
    const from = word(search.from)
    return { ...(fix ? { fix } : {}), ...(from ? { from } : {}) }
  },
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: CascadeRoute,
})

function CascadeRoute() {
  const navigate = useNavigate()
  const { id } = Route.useParams()
  const { fix, from } = Route.useSearch()
  const business = useCatalogue((s) => s.business)

  useEffect(() => {
    /* A SHEET ALREADY IN MEMORY IS NOT RE-READ — the same rule every
       other screen keeps. Arriving from the configurator the tables
       are in the store already, and reading them back out of the
       database would be slower and no truer. */
    if (catalogue.getState().status === 'empty') {
      void catalogue.getState().load(repositories(PACK_ORG_ID).catalogue)
    }
    if (!quotes.getState().loaded) void quotes.getState().openFor(PACK_ORG_ID)
  }, [])

  /* DECLINING IS A NAVIGATION AND NOTHING ELSE. It does not write, so
     there is nothing to undo; it PUSHES rather than replaces, because
     a person who declined and then pressed Back meant to look at the
     decision again. */
  const goBack = useCallback(
    (chapterId: string) => {
      void navigate({
        to: '/quote/$id',
        params: { id },
        search: chapterId === '' ? {} : { at: chapterId },
      })
    },
    [id, navigate],
  )

  return (
    <Cascade
      quoteId={id}
      fix={fix ?? ''}
      from={from ?? ''}
      business={business}
      goBack={goBack}
      openTheFile={() => void navigate({ to: '/sign-in', search: { again: true } })}
    />
  )
}
