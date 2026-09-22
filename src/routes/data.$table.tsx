import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { repositories } from '@/data'
import { useCatalogue } from '@/app/useStores'
import { catalogue } from '@/state/catalogue'
import { session } from '@/state/session'
import { isRowHeightKey, type RowHeightKey } from '@/domain/catalogue/table/outline'
import { Sheet, type Door, type SheetPosition } from '@/screens/sheet/Sheet'

/* ============================================================
   /data/$table — one table of the sheet, worked in.

   IT IS BEHIND THE SAME DOOR AS HOME. A browser with no name in the
   session lands on Entry, whatever address was typed: the first-visit
   rule is the shell's, and it is `beforeLoad` for the reason
   `src/routes/index.tsx` gives.

   IT READS THIS BROWSER AND NEVER THE FILE. The only call below is
   `catalogue.load(repository)`, which cannot fetch; a desk that took
   the blank door arrives on a sheet that says no file is open and
   offers the door back.

   THE POSITION IS THE SEARCH PARAMS. Which door (outline or gallery),
   which row the record is open on, what was typed into the find field,
   which rung of the depth ladder, which row height, which sections are
   folded, and which gallery card is open — every one is in the address
   so a link to one row of one table opens on that row. The screen is
   handed them once and hands its position back; this route writes it
   with `replace`, because a sheet where every keystroke is a history
   entry has a Back button that walks a person through eighteen rows
   instead of out of the screen.

   A SEARCH PARAM IS SOMETHING SOMEBODY TYPED, so it is read rather
   than trusted: anything that is not the shape expected is absent.
   ============================================================ */

export interface SheetSearch {
  door?: Door
  at?: string
  find?: string
  depth?: number
  rows?: RowHeightKey
  fold?: string
  model?: string
}

const word = (value: unknown, max = 200): string | undefined => {
  if (typeof value !== 'string') return undefined
  const said = value.trim()
  return said === '' || said.length > max ? undefined : said
}

export const Route = createFileRoute('/data/$table')({
  validateSearch: (search: Record<string, unknown>): SheetSearch => {
    const out: SheetSearch = {}
    if (search.door === 'gallery') out.door = 'gallery'
    const at = word(search.at)
    if (at) out.at = at
    const find = word(search.find, 120)
    if (find) out.find = find
    const depth = Number(search.depth)
    if (Number.isInteger(depth) && depth >= 1 && depth <= 9) out.depth = depth
    if (isRowHeightKey(typeof search.rows === 'string' ? search.rows : undefined)) {
      out.rows = search.rows as RowHeightKey
    }
    const fold = word(search.fold, 400)
    if (fold) out.fold = fold
    const model = word(search.model, 400)
    if (model) out.model = model
    return out
  },
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
  },
  component: SheetRoute,
})

function SheetRoute() {
  const navigate = useNavigate()
  const { table } = Route.useParams()
  const search = Route.useSearch()
  const business = useCatalogue((s) => s.business)

  useEffect(() => {
    /* A SHEET ALREADY IN MEMORY IS NOT RE-READ; a browser that has one
       kept is read once. `load` files its own refusal and never throws. */
    if (catalogue.getState().status === 'empty') {
      void catalogue.getState().load(repositories(PACK_ORG_ID).catalogue)
    }
  }, [])

  const onPosition = useCallback(
    (position: SheetPosition) => {
      void navigate({
        to: '/data/$table',
        params: { table },
        search: position as SheetSearch,
        replace: true,
      })
    },
    [navigate, table],
  )

  return (
    <Sheet
      tableId={table}
      business={business}
      door={search.door ?? 'outline'}
      at={search.at ?? ''}
      find={search.find ?? ''}
      depth={search.depth}
      rows={search.rows ?? 'dense'}
      fold={search.fold ?? ''}
      model={search.model ?? ''}
      onPosition={onPosition}
      /* a push and never a replace: Back is how a person leaves the sheet */
      goHome={() => void navigate({ to: '/' })}
      openTheFile={() => void navigate({ to: '/sign-in', search: { again: true } })}
    />
  )
}
