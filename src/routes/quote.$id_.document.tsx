import { useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { repositories } from '@/data'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { FRONT_DOORS } from '@/app/ways'
import { catalogue } from '@/state/catalogue'
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

   THE PAPER NEVER READS THE PRICE LIST; THE PILL ABOVE IT DOES.

   A document renders from the lines it froze when they were picked, so
   the sheet is not something the paper needs and not something it may
   read: `Document` reads the quote store alone, and both
   `src/domain/quote/invariants.test.ts` and `Document.test.tsx` render
   an issued quote against an EMPTY catalogue and get the same paper.

   The shell is another matter. Its crest is Northside's own mark and its
   Data door counts the lists, and both are read from this browser's copy
   of the file. Until 2026-10-21 this route asked for nothing, so the
   same quote wore Northside's waves when it was reached by pressing Open
   the printed quote, and the product's helm named "HelmLogic" with an
   uncounted Data door after a reload — another letterhead over the same
   paper, depending on how it was opened. So the route reads this
   browser's copy for the pill, exactly as the Lost screen does:
   `catalogue.load(repository)` reads IndexedDB and cannot fetch, and
   nothing it loads reaches the paper.

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
    /* THE PILL'S READ, never the paper's (the header says why). */
    if (catalogue.getState().status === 'empty') {
      void catalogue.getState().load(repositories(PACK_ORG_ID).catalogue)
    }
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
