import { useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { FRONT_DOORS } from '@/app/ways'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { Document } from '@/screens/document/Document'

/* ============================================================
   /quote/$id/document — the quote as a piece of paper.

   THE FILE IS `quote.$id_.document.tsx` AND THE UNDERSCORE IS LOAD
   BEARING. Without it the router would nest this under `/quote/$id`
   and the configurator would have to become a layout with an Outlet
   in it — a change to another screen's route to make room for this
   one. The trailing underscore is TanStack's own way of saying "this
   address is under that one and this screen is not inside it", which
   is the truth: the document replaces the configurator on screen, it
   does not sit within it.

   IT IS BEHIND THE SAME DOOR AS EVERY OTHER SCREEN. A browser with no
   name in the session lands on Entry whatever address was typed, in
   `beforeLoad`, for the reason `src/routes/index.tsx` gives: it is the
   only place that runs on a typed address, a Back, a refresh and a
   preload alike.

   IT DOES NOT LOAD THE PRICE FILE, AND IT DOES NOT EVEN ASK.

   Every other screen in this app calls `catalogue.load(repository)` on
   arrival. This one deliberately does not, and that absence is the
   whole promise of the screen: a document renders from the lines it
   froze when they were picked, so the sheet is not something it needs
   and is not something it may read. `src/domain/quote/invariants.test.ts`
   asserts that an issued quote reads identically against an empty
   catalogue; a route that quietly loaded the sheet here would make
   that assertion true of the engine and untrue of the app. The only
   thing read is the quote repository.

   THERE IS NO POSITION TO PUT IN THE URL. A document has no chapter,
   no open panel and no filter: it is one object read top to bottom,
   and the page a reader is on is the scroll position, which is the
   browser's. So this route carries no search params at all, which is
   the honest answer rather than an omission.
   ============================================================ */

export const Route = createFileRoute('/quote/$id_/document')({
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: DocumentRoute,
})

function DocumentRoute() {
  const navigate = useNavigate()
  const { id } = Route.useParams()

  useEffect(() => {
    /* THE DOCUMENT IS READ BEFORE IT IS DRAWN. A screen that printed
       "no quote is filed at this address" without asking the database
       would be printing a hope, and this screen's whole subject is one
       document. `openFor` files its own refusal on the store and never
       throws, so there is nothing to catch and nothing to invent. */
    if (!quotes.getState().loaded) void quotes.getState().openFor(PACK_ORG_ID)
  }, [])

  return (
    <Document
      quoteId={id}
      goBack={() => void navigate({ to: '/quote/$id', params: { id } })}
      /* WHERE ELSE THE APP HAS A SCREEN. The paper is the end of the
         selling flow, so it was also the end of the road: measured
         2026-09-18, this screen carried `Back to the build` and
         `Print` and no way to the register a dealer opened it from.
         The list is the app's own (`src/app/ways.ts`), so nothing
         here writes an address twice. */
      ways={FRONT_DOORS}
      go={(href) => void navigate({ href })}
    />
  )
}
