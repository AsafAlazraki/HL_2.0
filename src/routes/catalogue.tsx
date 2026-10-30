import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { repositories } from '@/data'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { catalogue } from '@/state/catalogue'
import { session } from '@/state/session'
import { Catalogue } from '@/screens/catalogue/Catalogue'

/* ============================================================
   /catalogue — the price list's parts and accessories, in their
   aisles (direction B, "the chandlery", picked 2026-10-30). A room of
   the price list behind Data (src/app/ways.ts).

   THE POSITION IS A SEARCH PARAM: `aisle` is the aisle open and
   `maker` the maker it is narrowed to, written with `replace`, so Back
   leaves the page rather than walking back through every aisle opened.
   A search param is something somebody typed: anything that is not a
   short non-empty string is not a position.
   ============================================================ */

export interface CatalogueSearch {
  aisle?: string
  maker?: string
}

const word = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const said = value.trim()
  return said === '' || said.length > 120 ? undefined : said
}

export const Route = createFileRoute('/catalogue')({
  validateSearch: (search: Record<string, unknown>): CatalogueSearch => {
    const aisle = word(search.aisle)
    const maker = word(search.maker)
    return { ...(aisle ? { aisle } : {}), ...(maker ? { maker } : {}) }
  },
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: CatalogueRoute,
})

function CatalogueRoute() {
  const navigate = useNavigate()
  const { aisle, maker } = Route.useSearch()

  useEffect(() => {
    if (catalogue.getState().status === 'empty') {
      void catalogue.getState().load(repositories(PACK_ORG_ID).catalogue)
    }
  }, [])

  const onAisle = useCallback(
    (nextAisle: string, nextMaker: string) => {
      void navigate({
        to: '/catalogue',
        search: {
          ...(nextAisle ? { aisle: nextAisle } : {}),
          ...(nextMaker ? { maker: nextMaker } : {}),
        },
        replace: true,
        viewTransition: false,
      })
    },
    [navigate],
  )

  return (
    <Catalogue
      aisle={aisle ?? ''}
      maker={maker ?? ''}
      onAisle={onAisle}
      openTheFile={() => void navigate({ to: '/sign-in', search: { again: true } })}
      go={(href) => void navigate({ href })}
    />
  )
}
