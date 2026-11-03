import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { repositories } from '@/data'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { Catalogue } from '@/screens/catalogue/Catalogue'
import { NOWHERE, type CatalogueAt, type Show, type Sort } from '@/screens/catalogue/at'

/* ============================================================
   /catalogue — the chandlery: the price list's parts and
   accessories, in their aisles (direction A of the data round, "the
   aisle as a page", 2026-11-03). A room of the price list behind Data
   (src/app/ways.ts).

   THE POSITION IS THE SEARCH PARAMS (src/screens/catalogue/at.ts):
   the aisle, the supplier, the customer's boat, which parts are shown,
   what is typed into find, the order, the part opened in place, the
   heading a link lands on, the suppliers' own page and the parts with
   no picture. An aisle or one of those pages is a NEW PAGE, pushed and
   opened at the top of the window (or at its heading, where a link
   names one), so Back leaves it for the front; everything else is a
   position on the page and is replaced where the window stands.

   `maker`, the old name of `supplier`, is still read, so a link sent
   before the redraw lands on the same supplier.

   A search param is something somebody typed: anything that is not a
   short non-empty string is not a position.
   ============================================================ */

export interface CatalogueSearch {
  aisle?: string
  supplier?: string
  maker?: string
  boat?: string
  show?: Show
  find?: string
  sort?: Sort
  open?: string
  heading?: string
  view?: 'suppliers' | 'pictures'
}

const word = (value: unknown, max = 120): string | undefined => {
  if (typeof value !== 'string') return undefined
  const said = value.trim()
  return said === '' || said.length > max ? undefined : said
}

export const Route = createFileRoute('/catalogue')({
  validateSearch: (search: Record<string, unknown>): CatalogueSearch => {
    const out: CatalogueSearch = {}
    const aisle = word(search.aisle)
    if (aisle) out.aisle = aisle
    const supplier = word(search.supplier) ?? word(search.maker)
    if (supplier) out.supplier = supplier
    const boat = word(search.boat, 200)
    if (boat) out.boat = boat
    if (search.show === 'pictured' || search.show === 'without') out.show = search.show
    /* what is typed is kept as typed, its spaces included, so the field does not jump */
    if (typeof search.find === 'string' && search.find.trim() !== '' && search.find.length <= 120)
      out.find = search.find
    if (search.sort === 'price' || search.sort === 'quoted') out.sort = search.sort
    const open = word(search.open, 200)
    if (open) out.open = open
    const heading = word(search.heading, 200)
    if (heading) out.heading = heading
    if (search.view === 'suppliers' || search.view === 'pictures') out.view = search.view
    return out
  },
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: CatalogueRoute,
})

function CatalogueRoute() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const at: CatalogueAt = {
    ...NOWHERE,
    ...search,
    supplier: search.supplier ?? '',
  }

  useEffect(() => {
    if (catalogue.getState().status === 'empty') {
      void catalogue.getState().load(repositories(PACK_ORG_ID).catalogue)
    }
    /* "most often quoted here" counts this computer's quotes */
    if (!quotes.getState().loaded) void quotes.getState().openFor(PACK_ORG_ID)
  }, [])

  const go = useCallback(
    (next: Partial<CatalogueAt>, page?: boolean) => {
      void navigate({
        to: '/catalogue',
        search: (current) => {
          const was = current as CatalogueSearch
          const merged: Record<string, string | undefined> = {
            ...(page ? { boat: was.boat } : { ...was, maker: undefined }),
            ...next,
          }
          const out: CatalogueSearch = {}
          for (const [k, v] of Object.entries(merged)) {
            if (v === undefined || v === '' || v === NOWHERE[k as keyof CatalogueAt]) continue
            ;(out as Record<string, string>)[k] = v
          }
          return out as never
        },
        replace: !page,
        /* a new page opens at its top, except one sent to a heading: the aisle lands it under
           its dock itself (Aisle.tsx), and a reset after that would throw it back to the top */
        resetScroll: Boolean(page) && !next.heading,
        viewTransition: false,
      })
    },
    [navigate],
  )

  return (
    <Catalogue
      at={at}
      go={go}
      goHref={(href) => void navigate({ href })}
      openTheFile={() => void navigate({ to: '/sign-in', search: { again: true } })}
    />
  )
}
