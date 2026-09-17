import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { repositories } from '@/data'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { useCatalogue } from '@/app/useStores'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { Configurator } from '@/screens/configurator/Configurator'

/* ============================================================
   /quote/$id — the configurator's address, and the plan's own name
   for it (`docs/PLAN.md`: `quote.$id (configurator)`).

   IT IS BEHIND THE SAME DOOR AS EVERY OTHER SCREEN. A browser with
   no name in the session lands on Entry, whatever address was typed:
   the first-visit rule is the shell's, not any one screen's.
   `beforeLoad`, for the reason `src/routes/index.tsx` gives — it is
   the only place that runs on a typed address, a Back, a refresh and
   a preload alike.

   IT READS THIS BROWSER AND NEVER THE FILE. Entry's blue door is the
   one place the Master Price File is fetched and nothing here can:
   `catalogue.load(repository)` reads what this browser already kept,
   and `quotes.openFor` reads the documents. So a person who took the
   blank door reaches a quote they wrote earlier, sees every frozen
   figure on it unchanged — that is what freezing is for — and is
   told that nothing new can be offered until the file is open.

   THE POSITION IS A SEARCH PARAM. `at` is the chapter that is open,
   so Back, a refresh and a shared link all land on the same chapter.
   The sweep counted a configurator whose chapter address had DIED
   (`deep/porsche-911-packages.png` returns "This Model is No Longer
   Available" with an error id), and named surviving that as the
   requirement. A chapter id that matches nothing on this document
   simply opens the first one with a decision left in it.

   IT IS WRITTEN WITH `replace`, because a chapter is a place inside
   one screen: a Back button that walked a person back through six
   chapter presses instead of out to the picker would be a Back
   button that cannot leave.

   A SEARCH PARAM IS SOMETHING SOMEBODY TYPED, so it is read rather
   than trusted: anything that is not a short non-empty string is not
   a position and the key is simply absent.
   ============================================================ */

export interface ConfiguratorSearch {
  /** the chapter the rail is open on */
  at?: string
}

const word = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const said = value.trim()
  /* A CHAPTER ID IS SHORT. A 4,000-character address is not a person
     opening a chapter, and reflecting it would put it on screen. */
  return said === '' || said.length > 120 ? undefined : said
}

export const Route = createFileRoute('/quote/$id')({
  validateSearch: (search: Record<string, unknown>): ConfiguratorSearch => {
    const at = word(search.at)
    return at ? { at } : {}
  },
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: ConfiguratorRoute,
})

function ConfiguratorRoute() {
  const navigate = useNavigate()
  const { id } = Route.useParams()
  const { at } = Route.useSearch()
  const business = useCatalogue((s) => s.business)

  useEffect(() => {
    /* A SHEET ALREADY IN MEMORY IS NOT RE-READ — the same rule every
       other screen keeps. Arriving from the picker the tables are in
       the store already, and reading them back out of the database
       would be slower and no truer. `load` files its own refusal on
       the store and never throws, so there is nothing to catch and
       nothing to invent. */
    if (catalogue.getState().status === 'empty') {
      void catalogue.getState().load(repositories(PACK_ORG_ID).catalogue)
    }
    /* THE DOCUMENT IS READ BEFORE IT IS DRAWN. A screen that printed
       "no quote is filed at this address" without asking the database
       would be printing a hope, and this is the one screen whose
       whole subject is one document. */
    if (!quotes.getState().loaded) void quotes.getState().openFor(PACK_ORG_ID)
  }, [])

  const goTo = useCallback(
    (chapterId: string) => {
      void navigate({ to: '/quote/$id', params: { id }, search: { at: chapterId }, replace: true })
    },
    [id, navigate],
  )

  return (
    <Configurator
      quoteId={id}
      at={at ?? ''}
      goTo={goTo}
      business={business}
      openTheFile={() => void navigate({ to: '/sign-in', search: { again: true } })}
      /* A NEW VERSION IS A NEW DOCUMENT AT A NEW ADDRESS, and this
         pushes rather than replaces: the quote that was superseded
         is still a document, and Back is how a person looks at it. */
      openQuote={(next) => void navigate({ to: '/quote/$id', params: { id: next } })}
    />
  )
}
