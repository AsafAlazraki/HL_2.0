import { useCallback, useMemo, useState } from 'react'
import { useCatalogue, useQuotes } from '@/app/useStores'
import { ctxFrom } from '@/state/catalogue'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { isDiscontinued, makeCtx } from '@/domain/model'
import { aisleById, aislesOf, UNSORTED } from '@/domain/catalogue/aisles'
import { shelfCountOf } from '@/domain/catalogue/shelfCount'
import { headingSaid, picturedFirst, sectionsOf, type Section } from '@/domain/chandlery/headings'
import { findLines } from '@/domain/chandlery/find'
import { isPlaced, placeInAisle } from '@/domain/chandlery/placing'
import { sortFigure } from '@/domain/chandlery/prices'
import { supplierSaid, suppliersIn } from '@/domain/chandlery/suppliers'
import { noPriceStandings } from '@/domain/chandlery/reviewCase'
import { unpicturedByUse } from '@/domain/chandlery/worklist'
import { inShow, showCounts, suppliersShown, type ShowReaders } from '@/domain/chandlery/facets'
import { saidNames, supplierReadings, suppliersElsewhere } from '@/domain/chandlery/readings'
import { lineKindOf } from '@/domain/chandlery/prices'
import { useLeftAlone } from '@/screens/review/left'
import { copyOf, itemOf, srcSetOf, type Item } from '@/data/pictures'
import { letterheadNow } from '@/app/northside'
import { RowGallery } from '@/app/RowGallery'
import { Button } from '@/ui'
import { AislePage, type Shelved } from './Aisle'
import { Door, type AisleFront } from './Door'
import { hrefOf, type CatalogueAt } from './at'
import {
  boatsById,
  madeForIn,
  partsPlaceOf,
  pricersOf,
  wareOf,
  type Pricers,
  type Ware,
} from './read'
import { PARTS_TABLE, hasPicture, partsTable, shelfAisle, shelfOf, type ShelfPart } from './shelf'
import { Suppliers } from './Suppliers'
import { Pictures } from './Pictures'
import { useStep } from './Step'
import type { Around } from './Wares'
import './catalogue.css'

/* ============================================================
   /catalogue — THE CHANDLERY: every part and accessory the price list
   sells, by what it is for (direction A of the data round, "the aisle
   as a page", 2026-11-03, with board C's photograph cards and shop
   sign grafted on; docs/directions/data-round/catalogue/).

   THREE PAGES AT ONE ADDRESS, each a position in the search params:
   the front (every aisle), one aisle (`?aisle=`), and the suppliers
   named (`?view=suppliers`). This file reads the sheet once, counts
   off it, and hands each page what it draws; every derivation is the
   domain's (`src/domain/chandlery`, `src/domain/catalogue/aisles.ts`)
   and every price is the engine's own mint at a declared price
   (`read.ts`). A room of the price list, so Data is lit while it is
   open (src/app/ways.ts).
   ============================================================ */

export interface CatalogueProps {
  at: CatalogueAt
  /** move to a position here: `page` is a new page (an aisle, the suppliers), pushed and at the
   *  top of the window; anything else stays where it is and replaces */
  go: (next: Partial<CatalogueAt>, page?: boolean) => void
  /** follow an address anywhere in the app */
  goHref: (href: string) => void
  /** the way back to the door, for a computer with no price list on it */
  openTheFile?: () => void
}

/** The most a find over the whole chandlery draws at once; the rest are said and narrowed. */
const FOUND_CAP = 200

export function Catalogue({ at, go, goHref, openTheFile }: CatalogueProps) {
  const sheet = useCatalogue((s) => s)
  const quoted = useQuotes((s) => s.quotes)
  const ready = sheet.status === 'ready' && Object.keys(sheet.tables).length > 0
  const ctx = useMemo(
    () => makeCtx({ ...ctxFrom(sheet), views: { ...sheet.views }, orgId: PACK_ORG_ID }),
    [sheet],
  )
  const step = useStep()
  /* THE PART WHOSE GALLERY IS OPEN, kept after it shuts so the plate's own exit is seen */
  const [large, setLarge] = useState<{ item: Item; name: string; at: number | null } | null>(null)
  const onAt = useCallback(
    (n: number | null) => setLarge((was) => (was ? { ...was, at: n } : null)),
    [],
  )

  const table = ready ? partsTable(ctx) : undefined
  const placed = ctx.org?.aisles
  const shelf = useMemo(() => (table ? shelfOf(ctx) : []), [ctx, table])
  /* HOW EVERY SUPPLIER CODE IS SAID: what the price list says of it itself, and Northside's own
     name over that (src/domain/chandlery/readings.ts) */
  const readings = useMemo(
    () =>
      table
        ? supplierReadings(shelf, suppliersElsewhere(ctx.entities, ctx.rowsByEntity, table.id))
        : [],
    [ctx.entities, ctx.rowsByEntity, table, shelf],
  )
  const own = ctx.org?.suppliers
  const named = useMemo(() => saidNames(readings, own), [readings, own])
  const byId = useMemo(() => new Map(shelf.map((p) => [p.id, p])), [shelf])
  const pricers = useMemo(() => pricersOf(ctx), [ctx])
  /* A PART IS PRICED WHEN A PAGE SHOWS IT, once per sheet (`pricedOnce`) */
  const ware = useCallback((p: ShelfPart): Ware => pricedOnce(p, pricers, named), [pricers, named])
  const counted = useMemo(() => aislesOf(shelf, hasPicture, shelfAisle), [shelf])
  const pictured = counted.reduce((n, a) => n + a.pictured, 0)
  /* THE PARTS LIST COUNTED AS DATA COUNTS IT, and what of it is on sale, so the door says its
     share of Data's own figure (src/domain/catalogue/shelfCount.ts) */
  const listed = useMemo(() => {
    if (!table) return shelfCountOf([])
    const field = table.hierarchy?.[0] ?? `${PARTS_TABLE}.cat`
    return shelfCountOf(
      (ctx.rowsByEntity[table.id] ?? []).map((r) => ({
        heading: r.values[field],
        sold: !isDiscontinued(r),
      })),
    )
  }, [ctx.rowsByEntity, table])
  const fronts = useMemo<AisleFront[]>(
    () =>
      counted.map((count) => {
        const parts = shelf.filter((p) => p.aisle === count.aisle.id)
        const by = new Map<string, number>()
        for (const p of parts) by.set(p.heading, (by.get(p.heading) ?? 0) + 1)
        const heads = [...by]
          .map(([heading, n]) => ({ heading, said: headingSaid(heading), parts: n }))
          .toSorted((a, b) => b.parts - a.parts)
        const first = parts.find((p) => hasPicture(p.id))
        const held = first ? copyOf(itemOf(PARTS_TABLE, first.id)) : null
        const srcSet = held ? srcSetOf(held) : undefined
        return {
          count,
          heads,
          photo: held ? { src: held.src, srcSet, width: held.width, height: held.height } : null,
        }
      }),
    [counted, shelf],
  )
  const boats = useMemo(() => (ready ? boatsById(ctx) : new Map()), [ctx, ready])
  const made = useMemo(() => (ready ? madeForIn(ctx) : null), [ctx, ready])
  const place = useMemo(() => (ready ? partsPlaceOf(ctx) : null), [ctx, ready])
  const boat = at.boat === '' ? null : (boats.get(at.boat) ?? null)
  const madeParts = useMemo(
    () =>
      boat && made
        ? (made.partsOf.get(boat.id) ?? []).flatMap((id) => {
            const p = byId.get(id)
            return p ? [p] : []
          })
        : [],
    [boat, made, byId],
  )
  const timesQuoted = useMemo(() => {
    const n = new Map<string, number>()
    for (const q of quoted)
      for (const line of q.lines)
        if (line.entityId === PARTS_TABLE) n.set(line.rowId, (n.get(line.rowId) ?? 0) + 1)
    return n
  }, [quoted])
  /* WHERE EACH PART WITH NO PRICE STANDS ON REVIEW, so its door opens on its own case */
  const meantPref = useLeftAlone()
  const standings = useMemo(
    () =>
      table ? noPriceStandings(table, ctx.rowsByEntity[table.id] ?? [], meantPref) : new Map(),
    [table, ctx, meantPref],
  )
  /* only a part takes a picture: labour and the workbook's notes are never drawn with one */
  const worklist = useMemo(
    () => unpicturedByUse(shelf, hasPicture, timesQuoted, takesPicture),
    [shelf, timesQuoted],
  )
  const mark = useMemo(
    () => letterheadNow({ org: sheet.org, business: sheet.business })?.mark ?? null,
    [sheet.org, sheet.business],
  )

  const open = at.aisle === '' ? undefined : aisleById(at.aisle)
  const wrongAisle = at.aisle !== '' && !open ? at.aisle : ''
  const figures = useMemo(
    () =>
      open
        ? aisleFigures({
            narrowed: { supplier: at.supplier, find: at.find, show: at.show, sort: at.sort },
            aisleId: open.id,
            shelf,
            ware,
            fronts,
            named,
            madeParts,
            timesQuoted,
          })
        : null,
    [
      open,
      at.supplier,
      at.find,
      at.show,
      at.sort,
      shelf,
      ware,
      fronts,
      named,
      madeParts,
      timesQuoted,
    ],
  )

  const around: Around = {
    boats,
    boatsOf: (id) => [...(made?.boatsOf.get(id) ?? [])],
    place,
    listName: table?.name ?? 'the parts list',
    go: goHref,
    placeLine: (key, aisle, said) =>
      step.apply(placeInAisle(key, aisle, said), `${said} already stands there.`),
    placedHere: (w) => isPlaced(w, placed),
    onLarge: (w, n) => setLarge({ item: itemOf(PARTS_TABLE, w.id), name: w.name, at: n }),
    reviewOf: (id) => standings.get(id),
    open: at.open,
    onOpen: (id) => go({ open: id }),
    boatName: boat?.name,
  }

  let body
  if (sheet.status === 'empty' || sheet.status === 'loading') {
    body = <output className="chd-none">Reading the price list kept on this computer…</output>
  } else if (!ready) {
    body = (
      <section className="chd-none">
        <p>
          The price list is not open on this computer, so its parts cannot be shown. Open the Master
          Price File to see them.
        </p>
        {openTheFile ? (
          <Button intent="secondary" onClick={openTheFile}>
            Open the price list
          </Button>
        ) : null}
      </section>
    )
  } else if (!table) {
    body = <p className="chd-none">The price list carries no parts and accessories.</p>
  } else if (at.view === 'suppliers') {
    body = (
      <Suppliers
        shelf={shelf}
        own={own}
        readings={readings}
        back={hrefOf({ boat: at.boat })}
        go={goHref}
      />
    )
  } else if (at.view === 'pictures') {
    body = (
      <Pictures
        list={{
          ...worklist,
          quoted: worklist.quoted.map((q) => ({ part: ware(q.part), times: q.times })),
        }}
        fronts={fronts}
        around={around}
        aisleCount={counted.length}
        boat={at.boat}
      />
    )
  } else if (open && figures) {
    body = (
      <AislePage
        ctx={ctx}
        at={at}
        go={go}
        aisle={open}
        aisleCount={counted.length}
        placed={placed}
        placeHeading={(key, aisle, said) =>
          step.apply(placeInAisle(key, aisle, said), `${said} already stands there.`)
        }
        step={step.said}
        back={step.back}
        around={around}
        boat={boat}
        {...figures!}
      />
    )
  } else {
    const query = at.find.trim()
    const found =
      query.length < 2
        ? null
        : findLines(
            shelf.map((p) => ({ ...p, name: p.product, makerSaid: named?.[p.maker] ?? '' })),
            query,
          ).found
    const shownFound = found?.slice(0, FOUND_CAP).map((f) => ware(byId.get(f.id)!))
    const sections: Section<Shelved>[] | null = shownFound
      ? counted
          .map((c) => ({
            heading: c.aisle.id,
            said: c.aisle.name,
            parts: shownFound.filter((w) => w.aisle === c.aisle.id),
          }))
          .filter((s) => s.parts.length > 0)
      : null
    body = (
      <Door
        ctx={ctx}
        at={at}
        go={go}
        goHref={goHref}
        fronts={fronts}
        pictured={pictured}
        listed={listed}
        wrongAisle={wrongAisle}
        mark={mark}
        business={sheet.business ?? ''}
        boat={boat}
        madeFor={madeParts.map(ware)}
        found={sections}
        foundTotal={found?.length ?? 0}
        shelf={shelf}
        nameOf={(p) => ware(p).name}
        around={around}
        suppliers={new Set(shelf.map((p) => p.maker.trim()).filter((m) => m !== '')).size}
        readSuppliers={readings.length}
        namedSuppliers={Object.values(own ?? {}).filter((n) => n.trim() !== '').length}
        without={worklist.without}
        takes={worklist.total}
        goPictures={() => go({ view: 'pictures' }, true)}
      />
    )
  }

  return (
    <main className="chd" data-testid="catalogue" data-read={ready ? '' : undefined}>
      {body}
      {/* A PART'S GALLERY, with the dealer's acts on the picture open: this is a page of the
          price list Northside keeps, and the acts are Northside's */}
      {large ? (
        <RowGallery
          item={large.item}
          name={large.name}
          kind="accessory"
          at={large.at}
          onAt={onAt}
        />
      ) : null}
    </main>
  )
}

/** The figures an aisle's page draws, worked from the parts it holds. */
interface AisleFigures {
  front: AisleFront | undefined
  sections: Section<Shelved>[]
  total: number
  pictured: number
  /** the aisle's parts that could take a picture and have none (labour and notes take none) */
  without: number
  /** Pictured · All · No picture, counted under the supplier and the find chosen */
  showCounts: Record<CatalogueAt['show'], number>
  /** the suppliers, counted under which parts are shown and the find; the one chosen is kept
   *  at 0 where none of its parts are shown, so it can be let go */
  suppliers: ReturnType<typeof suppliersIn>
  supplierCount: number
  /** the parts shown under which parts and the find, before a supplier narrows them */
  shownAll: number
  wrongSupplier: boolean
  madeHere: Shelved[]
  madeElsewhere: { name: string; parts: number }[]
  madeTotal: number
}

/** ONE AISLE, NARROWED, SORTED AND GROUPED BY ITS HEADINGS: what its page draws. */
function aisleFigures({
  narrowed: at,
  aisleId,
  shelf,
  ware,
  fronts,
  named,
  madeParts,
  timesQuoted,
}: {
  narrowed: Pick<CatalogueAt, 'supplier' | 'find' | 'show' | 'sort'>
  aisleId: string
  shelf: readonly ShelfPart[]
  ware: (p: ShelfPart) => Ware
  fronts: readonly AisleFront[]
  named: Readonly<Record<string, string>> | undefined
  madeParts: readonly ShelfPart[]
  timesQuoted: ReadonlyMap<string, number>
}): AisleFigures {
  const inAisle = shelf.filter((p) => p.aisle === aisleId)
  const wares = inAisle.map(ware)
  const every = suppliersIn(inAisle, named)
  const wrongSupplier = at.supplier !== '' && !every.some((s) => s.said === at.supplier)
  const whole = showCounts(wares, SHOWN)
  /* EACH CHOICE COUNTED UNDER THE OTHER TWO (src/domain/chandlery/facets.ts): find first, then
     which parts for the suppliers' counts, and the supplier for which parts' counts */
  const found =
    at.find.trim().length >= 2
      ? findLines(
          wares.map((w) => ({ ...w, makerSaid: w.supplier })),
          at.find,
        ).found
      : wares
  const bySupplier =
    at.supplier !== '' && !wrongSupplier ? found.filter((w) => w.supplier === at.supplier) : found
  const inShown = found.filter((w) => inShow(w, at.show, SHOWN))
  const list = bySupplier.filter((w) => inShow(w, at.show, SHOWN))
  /* the headings that hold a photograph first, so a pictured aisle opens on its pictures */
  const sections = picturedFirst(sectionsOf(list), (w) => Boolean(w.tile?.picture)).map((s) => ({
    ...s,
    parts: sorted(s.parts, at.sort, timesQuoted),
  }))
  const madeHere = madeParts.filter((p) => p.aisle === aisleId).map(ware)
  const elsewhere = new Map<string, number>()
  for (const p of madeParts) {
    if (p.aisle === aisleId) continue
    const name = aisleById(p.aisle)?.name ?? aisleById(UNSORTED)!.name
    elsewhere.set(name, (elsewhere.get(name) ?? 0) + 1)
  }
  return {
    front: fronts.find((f) => f.count.aisle.id === aisleId),
    sections,
    total: wares.length,
    pictured: whole.pictured,
    without: whole.without,
    showCounts: showCounts(bySupplier, SHOWN),
    suppliers: suppliersShown(suppliersIn(inShown, named), every, at.supplier),
    supplierCount: every.length,
    shownAll: inShown.length,
    wrongSupplier,
    madeHere,
    madeElsewhere: [...elsewhere].map(([name, parts]) => ({ name, parts })),
    madeTotal: madeParts.length,
  }
}

/** A LINE TAKES A PICTURE where it is a part: labour and the workbook's notes never do. */
const takesPicture = (p: { product: string }): boolean => lineKindOf(p.product) === 'part'

/** Which parts an aisle shows, read off a priced part. */
const SHOWN: ShowReaders<Ware> = {
  pictured: (w) => Boolean(w.tile?.picture),
  takes: (w) => w.kind === 'part',
}

/** EVERY PART PRICED ONCE PER SHEET: the pricers are made once per sheet, so they key the
 *  cache, and the supplier is said again on each read because Northside may name it. */
const PRICED = new WeakMap<Pricers, Map<string, Ware>>()
function pricedOnce(
  p: ShelfPart,
  pricers: Pricers,
  named: Readonly<Record<string, string>> | undefined,
): Ware {
  let cache = PRICED.get(pricers)
  if (!cache) {
    cache = new Map()
    PRICED.set(pricers, cache)
  }
  let had = cache.get(p.id)
  if (!had || had.row !== p.row) {
    had = wareOf(p, pricers, undefined)
    cache.set(p.id, had)
  }
  const supplier = supplierSaid(p.maker, named)
  return supplier === had.supplier && had.aisle === p.aisle
    ? had
    : { ...had, aisle: p.aisle, supplier }
}

/** The order inside a heading: the price list's own, the lowest price first, or the most quoted. */
function sorted(
  parts: Shelved[],
  sort: CatalogueAt['sort'],
  quoted: ReadonlyMap<string, number>,
): Shelved[] {
  if (sort === 'price')
    return parts.toSorted((a, b) => {
      const x = sortFigure(a.prices)
      const y = sortFigure(b.prices)
      return x === null ? (y === null ? 0 : 1) : y === null ? -1 : x - y
    })
  if (sort === 'quoted')
    return parts.toSorted((a, b) => (quoted.get(b.id) ?? 0) - (quoted.get(a.id) ?? 0))
  return parts
}
