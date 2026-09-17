import { useEffect, useState } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { repositories } from '@/data'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { useCatalogue } from '@/app/useStores'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { Home } from '@/screens/home/Home'

/* ============================================================
   THE ADDRESS HOME LIVES AT, and one half of the first-visit rule.

   THE RULE, IN ONE SENTENCE: a visitor with no name in the session
   lands on Entry, and a returning visitor with a name lands on Home.
   Its other half is `/sign-in`'s, which sends a named visitor back
   here rather than drawing a door they have already been through.
   Both halves are `beforeLoad`, which is the only place that runs on a
   typed address, a Back, a refresh and a preload alike — a component
   that redirected in an effect would draw Home, discover it had no
   name, and dismiss the screen it had just painted.

   IT IS NOT AUTHENTICATION and it never pretends to be. The name is
   remembered in this browser through prefs and anybody can edit it
   there; what this rule protects is the ORDER OF THE TWO SCREENS, not
   the app. `src/state/session.ts` says the rest.

   HOME READS THIS BROWSER; ENTRY READS THE FILE. That is the whole
   division and it is structural, not a convention: the only call here
   is `catalogue.load(repository)`, which cannot fetch, and the only
   call to `openCatalogue` — the one that can read the pack over the
   network — is behind Entry's blue door. So the blank-sheet door
   really does leave Home with nothing counted, instead of Home quietly
   loading the file the person just declined; and a second visit really
   does read the sheet out of IndexedDB, because there is no other
   thing this screen could read.

   WHAT THE MILESTONE 0 PAGE THAT STOOD HERE USED TO PROVE is now
   proved where it belongs: `e2e/flows/pack-loads.spec.ts` walks the
   real door in a real browser and reads the same counts off Home's own
   stamp, then reloads and reads them again with the network counted.
   A page whose only job was to print evidence is a page nobody sells
   a boat from.
   ============================================================ */

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: HomeRoute,
})

function HomeRoute() {
  const navigate = useNavigate()
  /* WHOSE SHEET IT IS AND WHERE IT CAME FROM are read off the store
     rather than measured here, because on the visit that matters this
     route did not do the opening: Entry did, and then navigated. The
     store is the one thing both screens hold. */
  const business = useCatalogue((s) => s.business)
  const from = useCatalogue((s) => s.from)
  /** how long reading this browser took, when it was this route that read it */
  const [ms, setMs] = useState<number | null>(null)

  useEffect(() => {
    const repository = repositories(PACK_ORG_ID).catalogue

    /* A SHEET ALREADY IN MEMORY IS NOT RE-READ. Arriving from Entry's
       blue door, the tables are already in the store and reading them
       back out of the database would be slower and no truer. */
    if (catalogue.getState().status === 'empty') {
      const began = performance.now()
      /* `load` files its own refusal on the store and never throws, so
         there is no catch here and nothing to invent: a database that
         will not answer leaves `status: 'failed'` with the sentence,
         and Home draws the sentence. A database that answers with
         nothing leaves a blank sheet, which is the true state of a
         browser whose visitor chose the blank door. */
      void catalogue
        .getState()
        .load(repository)
        .then(() => {
          setMs(Math.round(performance.now() - began))
        })
    }

    /* THE DRAFTS ARE READ, NOT ASSUMED. A card that printed zero
       without asking the database would be printing a hope. */
    if (!quotes.getState().loaded) void quotes.getState().openFor(PACK_ORG_ID)
  }, [])

  return (
    <Home
      business={business}
      from={from}
      ms={ms}
      /* THE DOOR IS STILL REACHABLE, which is what makes Entry's "the
         file can be loaded later" a promise and not a line. The screen
         is handed the way there rather than reaching for the router,
         so it can be rendered and pressed in a component test. */
      openTheFile={() => void navigate({ to: '/sign-in', search: { again: true } })}
    />
  )
}
