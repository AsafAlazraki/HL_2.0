import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { repositories } from '@/data'
import { catalogue } from '@/state/catalogue'
import { session } from '@/state/session'
import { Fitment, type FitmentPosition } from '@/screens/fitment/Fitment'

/* ============================================================
   /fitment — one boat at a time, and what can be fitted to it.

   IT IS BEHIND THE SAME DOOR AS HOME. A browser with no name in the
   session lands on Entry whatever address was typed: the first-visit
   rule is the shell's, and it is `beforeLoad` for the reason
   `src/routes/index.tsx` gives.

   IT READS THIS BROWSER AND NEVER THE FILE. The only call below is
   `catalogue.load(repository)`, which cannot fetch; a browser that holds
   no copy of the price list arrives on a screen that says so and offers
   the way to load it.

   BEFORE A BOAT, `maker` and `model` are the chooser's own position: the
   maker whose models are open, and the model whose versions are, so a
   Back or a reload keeps them (walk.md, 2026-10-30). A boat chosen
   leaves them behind: `openBoat` pushes `?boat=` alone.

   THE SEARCH PARAMS ARE THE POSITION (the fit flow, direction A,
   2026-11-05). `boat` is the boat, by its line on the price list;
   `from` the door it was opened from ('home', which the shell lights;
   absent for Data's room); `motor` and `trailer` what the quote it
   starts carries, by their pairing ('none' for none, absent for the
   recommended); `fit` the fit-out lines ticked for it, comma-separated;
   `at` the place asked for (`motor`, `trailer` or `fitout`), scrolled to
   on arrival, as the build's "What fits" asks; and `change` the mode that
   changes what Northside offers. So a link to "the Sport 560 with its
   trailer and the batteries ticked" opens exactly that.

   A boat is a CHANGE OF SCREEN and is pushed; everything else is a
   position and is replaced, for the register's reason — a Back that
   walked back through every letter typed would be a Back that never
   leaves.
   ============================================================ */

export interface FitmentSearch {
  maker?: string
  model?: string
  boat?: string
  from?: string
  motor?: string
  trailer?: string
  fit?: string
  at?: string
  /** 1 while changing what Northside offers; a number, so the address reads `change=1` */
  change?: number
}

const KEYS = ['maker', 'model', 'boat', 'from', 'motor', 'trailer', 'fit', 'at', 'change'] as const

const AT = new Set(['motor', 'trailer', 'fitout'])

const word = (value: unknown, max = 200): string | undefined => {
  if (typeof value !== 'string') return undefined
  const said = value.trim()
  return said === '' || said.length > max ? undefined : said
}

export const Route = createFileRoute('/fitment')({
  validateSearch: (search: Record<string, unknown>): FitmentSearch => {
    const out: FitmentSearch = {}
    const maker = word(search.maker, 120)
    const model = word(search.model, 200)
    const boat = word(search.boat)
    const from = search.from === 'home' ? 'home' : undefined
    const motor = word(search.motor, 200)
    const trailer = word(search.trailer, 200)
    const fit = word(search.fit, 4000)
    const at = typeof search.at === 'string' && AT.has(search.at) ? search.at : undefined
    const change = search.change === 1 || search.change === '1' ? 1 : undefined
    if (maker) out.maker = maker
    if (model) out.model = model
    if (boat) out.boat = boat
    if (from) out.from = from
    if (motor) out.motor = motor
    if (trailer) out.trailer = trailer
    if (fit) out.fit = fit
    if (at) out.at = at
    if (change) out.change = change
    return out
  },
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: FitmentRoute,
})

function FitmentRoute() {
  const navigate = useNavigate()
  const search = Route.useSearch()

  useEffect(() => {
    if (catalogue.getState().status === 'empty') {
      void catalogue.getState().load(repositories(PACK_ORG_ID).catalogue)
    }
  }, [])

  /* a position is never a change of screen, so it never starts a View Transition — the
     reason is in src/routes/data.index.tsx, measured there first */
  const onPosition = useCallback(
    (next: FitmentPosition) => {
      void navigate({
        to: '/fitment',
        search: (was: FitmentSearch) => {
          const merged: FitmentSearch = { ...was, ...next }
          const out: FitmentSearch = {}
          for (const key of KEYS) {
            const v = merged[key]
            if (v) (out as Record<string, string | number>)[key] = v
          }
          return out
        },
        replace: true,
        viewTransition: false,
      })
    },
    [navigate],
  )

  return (
    <Fitment
      boat={search.boat ?? ''}
      maker={search.maker ?? ''}
      model={search.model ?? ''}
      from={search.from === 'home' ? 'home' : ''}
      motor={search.motor ?? ''}
      trailer={search.trailer ?? ''}
      fit={search.fit ? search.fit.split(',').filter((k) => k !== '') : []}
      at={
        search.at === 'motor' || search.at === 'trailer' || search.at === 'fitout' ? search.at : ''
      }
      changing={search.change === 1}
      onPosition={onPosition}
      openBoat={(rowId) =>
        void navigate({
          to: '/fitment',
          search: search.from === 'home' ? { boat: rowId, from: 'home' } : { boat: rowId },
        })
      }
      openHref={(href) => void navigate({ href })}
      openQuote={(quoteId) => void navigate({ to: '/quote/$id', params: { id: quoteId } })}
      openTheFile={() => void navigate({ to: '/sign-in', search: { again: true } })}
    />
  )
}
