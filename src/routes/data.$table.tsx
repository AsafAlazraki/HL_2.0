import { useCallback, useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { repositories } from '@/data'
import { useCatalogue } from '@/app/useStores'
import { catalogue } from '@/state/catalogue'
import { session } from '@/state/session'
import { Sheet, type Door, type Reading, type SheetPosition } from '@/screens/sheet/Sheet'

/* ============================================================
   /data/$table — one table of the sheet, laid out like the maker's own
   price list and worked in.

   IT IS BEHIND THE SAME DOOR AS HOME. A browser with no name in the
   session lands on Entry, whatever address was typed: the first-visit
   rule is the shell's, and it is `beforeLoad` for the reason
   `src/routes/index.tsx` gives.

   IT READS THIS BROWSER AND NEVER THE FILE. The only call below is
   `catalogue.load(repository)`, which cannot fetch; a browser that
   holds no copy of the file arrives on a sheet that says no file is
   open and offers the door back.

   THE POSITION IS THE SEARCH PARAMS. Which door (the price list, the
   pictures, every column), the row whose record is open (`at`), what
   was typed into the find field, the chapter being read (`in` — one
   series of Highfield), whether the models are shut (`read`) and which
   ones differ from that (`flip`), the columns pressed into the grid
   (`show`), the lit price rung (`rung`), and the sections folded behind
   the Every column door (`fold`) — every one is in the address, so a
   link to one row of one table opens on that row, and a write, which
   rebuilds every row, cannot shut or open anything. The screen is
   handed them once and hands its position back; this route writes it
   with `replace`, because a sheet where every keystroke is a history
   entry has a Back button that walks a person through eighteen rows
   instead of out of the screen.

   A SEARCH PARAM IS SOMETHING SOMEBODY TYPED, so it is read rather
   than trusted: anything that is not the shape expected is absent.
   `door=gallery` is read as the Pictures door, which is what it was
   called before 2026-09-23, so an address somebody kept still opens.
   ============================================================ */

export interface SheetSearch {
  door?: Exclude<Door, 'price'>
  at?: string
  find?: string
  in?: string
  read?: Reading
  flip?: string
  show?: string
  rung?: string
  fold?: string
}

const word = (value: unknown, max = 200): string | undefined => {
  if (typeof value !== 'string') return undefined
  const said = value.trim()
  return said === '' || said.length > max ? undefined : said
}

export const Route = createFileRoute('/data/$table')({
  validateSearch: (search: Record<string, unknown>): SheetSearch => {
    const out: SheetSearch = {}
    if (search.door === 'pictures' || search.door === 'gallery') out.door = 'pictures'
    if (search.door === 'every') out.door = 'every'
    const at = word(search.at)
    if (at) out.at = at
    const find = word(search.find, 120)
    if (find) out.find = find
    const chapter = word(search.in, 200)
    if (chapter) out.in = chapter
    if (search.read === 'models' || search.read === 'variants') out.read = search.read
    const flip = word(search.flip, 4000)
    if (flip) out.flip = flip
    const show = word(search.show, 1000)
    if (show) out.show = show
    const rung = word(search.rung, 200)
    if (rung) out.rung = rung
    const fold = word(search.fold, 400)
    if (fold) out.fold = fold
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
    ({ chapter, door, ...rest }: SheetPosition) => {
      const next: SheetSearch = { ...rest, door: door === 'price' ? undefined : door, in: chapter }
      void navigate({
        to: '/data/$table',
        params: { table },
        search: next,
        replace: true,
      })
    },
    [navigate, table],
  )

  return (
    <Sheet
      tableId={table}
      business={business}
      door={search.door ?? 'price'}
      at={search.at ?? ''}
      find={search.find ?? ''}
      chapter={search.in}
      read={search.read}
      flip={search.flip}
      show={search.show}
      rung={search.rung}
      fold={search.fold ?? ''}
      onPosition={onPosition}
      openTheFile={() => void navigate({ to: '/sign-in', search: { again: true } })}
    />
  )
}
