import { useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { repositories } from '@/data'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { useCatalogue } from '@/app/useStores'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { Picker, type PickerAt } from '@/screens/picker/Picker'

/* ============================================================
   /quote/new — the picker's address, and the plan's own name for it
   (`docs/PLAN.md`: `quote.new (picker)`, with `quote.new.$place` and
   `quote.$id (configurator)` after it).

   THE FIRST-VISIT RULE HOLDS HERE TOO. A browser with no name in the
   session is sent to the door before anything is drawn, exactly as on
   Home — `beforeLoad`, which is the only place that runs on a typed
   address, a Back, a refresh and a preload alike. It is not
   authentication and never pretends to be; it is the order of the
   screens.

   THIS SCREEN READS THIS BROWSER AND NEVER THE FILE, which is the
   division the whole shell rests on (docs/SCREENS.md). The only call
   below is `catalogue.load(repository)`, which cannot fetch. So a desk
   that took the blank door arrives here with nothing to choose from,
   says so, and is offered the door — rather than the picker quietly
   loading the file the person declined.

   THE POSITION IS THE SEARCH PARAMS. Which register the middle column
   is listing, which model the plate is showing and which row a quote
   would be written against are all in the address, so Back works
   inside the screen and a link to one hull opens on that hull.
   ============================================================ */

/** A search param is something somebody typed, so it is read rather
 *  than trusted: anything that is not a non-empty string is not a
 *  position, and the key is simply absent. */
const one = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined

export const Route = createFileRoute('/quote/new')({
  validateSearch: (search: Record<string, unknown>): PickerAt => {
    const at: PickerAt = {}
    const brand = one(search.brand)
    if (brand) at.brand = brand
    const model = one(search.model)
    if (model) at.model = model
    const row = one(search.row)
    if (row) at.row = row
    return at
  },
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: PickerRoute,
})

function PickerRoute() {
  const navigate = useNavigate()
  const at = Route.useSearch()
  const business = useCatalogue((s) => s.business)

  useEffect(() => {
    /* A SHEET ALREADY IN MEMORY IS NOT RE-READ — the same rule Home
       keeps. Arriving from Home, the tables are in the store already
       and reading them back out of the database would be slower and no
       truer. A person who typed this address straight into a fresh tab
       gets the read, and `load` files its own refusal rather than
       throwing, so there is nothing to catch and nothing to invent. */
    if (catalogue.getState().status === 'empty') {
      void catalogue.getState().load(repositories(PACK_ORG_ID).catalogue)
    }
    /* THE QUOTES ARE READ BEFORE THE ACT, not after it: the act asks
       whether a draft is already standing for the row somebody is
       about to quote, and a store nobody has opened would answer no. */
    if (!quotes.getState().loaded) void quotes.getState().openFor(PACK_ORG_ID)
  }, [])

  return (
    <Picker
      at={at}
      /* THE SCREEN IS HANDED ITS OWN NAVIGATION rather than reaching
         for the router, so it can be rendered and pressed in a
         component test without one. A press pushes rather than
         replaces: Back inside the picker is how a person un-chooses. */
      goTo={(next) => void navigate({ to: '/quote/new', search: next })}
      business={business}
      openTheFile={() => void navigate({ to: '/sign-in', search: { again: true } })}
      /* THE ACT NOW GOES SOMEWHERE. The configurator is `quote.$id`
         and it was built on 2026-09-17, so the picker's one refusal
         — "the configurator is not built yet" — is retired by having
         built it. The screen still renders and still refuses without
         this prop, which is the path `Picker.test.tsx` exercises: a
         component test has no router, and an act that silently did
         nothing would be the pretending this app exists not to do. */
      openQuote={(quoteId) => void navigate({ to: '/quote/$id', params: { id: quoteId } })}
    />
  )
}
