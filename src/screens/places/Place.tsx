import { useMemo, useState, type ReactNode } from 'react'
import {
  ArrowLeftIcon,
  DatabaseIcon,
  FilePlusIcon,
  ImagesIcon,
  StorefrontIcon,
} from '@phosphor-icons/react'
import { Button, Lightbox, type LightboxPicture } from '@/ui'
import { creditOf, pictures, srcSetOf } from '@/data/pictures'
import { makeCtx } from '@/domain/model'
import { money } from '@/domain/money'
import { heroesOf } from '@/domain/modules/livery'
import { shelfOf } from '@/domain/lineup/shelf'
import { fitsOf, fitsSaid } from '@/domain/lineup/fits'
import { brandOf } from '@/screens/picker/fleet'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { ctxFrom } from '@/state/catalogue'
import { useCatalogue, useQuotes } from '@/app/useStores'
import { packedOn, provenanceOfSheet } from '@/screens/data/file'
import { PARTS_TABLE } from '@/screens/catalogue/shelf'
import { Hero, Mark, markIsArt } from './Livery'
import { kindWord, readPlace, readPlaces, type PlacePage } from './read'
import { readLineup } from './models'
import { Lineup } from './Lineup'
import { Shelf } from './Shelf'
import { After } from './After'
import { Settings } from './Settings'
import { PLACE_TABS, type PlaceAt, type PlaceTab } from './tabs'
import './places.css'

/* ============================================================
   ONE MAKER, AS NORTHSIDE SELLS IT — /places/$id. Direction A of the
   data round, "The line-up" (docs/directions/data-round/places/), with
   what the three judges grafted from B and C.

   THE RANGE IS THE PAGE. The judge of 2026-11-04 found a grid of
   series tiles, each one count and a door to the sheet, under a head
   that said "67 models": no model, price, length, people or
   horsepower, and nothing of what any model carries. Now a short
   livery head says the span once, and under it every model of the
   chosen series stands as a card with its picture, its from-price at
   the register's own price, its three facts and what it carries
   (`Lineup.tsx`). A list that is not a boat maker is read as its own
   range — Yamaha by horsepower, a trailer maker by the boats its
   trailers take (`Shelf.tsx`) — and Parts hands off to the chandlery,
   which reads the same list with find, aisles and pictures.

   AFTER THE RANGE, NEVER BEFORE IT (`After.tsx`): its prices with
   figures, its quotes by customer and total, what it goes with, what
   was changed here and how it is dressed. On a phone the boats are
   the first thing under the head.

   THE HEAD. Six of the 25 places have a photograph on the water;
   they stand on it, 220 px of it. The other nineteen stand on a
   compact head with the same figures set large (C's graft), so no head
   is an empty band of colour. The mark says the name, so the name is
   not printed again under a drawn mark.

   EVERY POSITION IS IN THE ADDRESS: the series, the order, the find,
   the boats set side by side, the compare opened, the heading open on
   a list, and Settings.
   ============================================================ */

export { PLACE_TABS, type PlaceTab }

export interface PlaceProps {
  /** the list the place stands for, as its address spells it */
  address: string
  tab: PlaceTab
  onTab?: (tab: PlaceTab) => void
  /** where the page stands inside itself */
  at?: PlaceAt
  onAt?: (next: PlaceAt) => void
  /** follow an address this page links to */
  go?: (href: string) => void
  openTheFile?: () => void
}

const n = (v: number): string => v.toLocaleString('en-AU')

/** "a Highfield", "an Ultralite" */
const withArticle = (word: string): string => `${/^[aeiou]/i.test(word) ? 'an' : 'a'} ${word}`

/** "$2,770 to $198,610", "$9,643" */
export const spanSaid = (lo: number | null, hi: number | null): string | null =>
  lo === null || hi === null ? null : lo === hi ? money(lo) : `${money(lo)} to ${money(hi)}`

const AT_REST: PlaceAt = {}

export function Place({ address, tab, onTab, at = AT_REST, onAt, go, openTheFile }: PlaceProps) {
  const sheet = useCatalogue((s) => s)
  const quotes = useQuotes((s) => s.quotes)
  const { status, problem, tables, rows, modules, priceLevels, version } = sheet

  const looking = (status === 'empty' || status === 'loading') && problem === null
  const open = status === 'ready' && Object.keys(tables).length > 0
  const book = pictures()

  const page = useMemo(() => {
    if (!open) return null
    const world = { tables, rows, modules, priceLevels }
    const read = readPlaces(world, book)
    return readPlace(world, read, address, quotes, book)
  }, [open, tables, rows, modules, priceLevels, address, quotes, book])

  /* the whole catalogue, for what each model carries: read once per change of the sheet */
  const ctx = useMemo(
    () => (open ? makeCtx({ ...ctxFrom(sheet), orgId: PACK_ORG_ID }) : null),
    // the catalogue state object is replaced on every write, which is the dependency wanted
    [open, sheet],
  )
  const lineup = useMemo(
    () =>
      ctx && page?.table && page.card.kind === 'boat' ? readLineup(ctx, page.table, book) : null,
    [ctx, page, book],
  )
  const shelf = useMemo(
    () =>
      page?.table && page.card.kind !== 'boat'
        ? shelfOf(page.table, rows[page.table.id] ?? [])
        : null,
    [page, rows],
  )
  /* WHAT EACH MOTOR OR TRAILER FITS, maker by maker, read the way each boat maker's cards read
     what they carry: every boat maker's models, by the row a card opens Fitment on */
  const fits = useMemo(() => {
    const kind = page?.card.kind
    if (!ctx || !page?.table || !shelf || shelf.retired) return null
    if (kind !== 'motor' && kind !== 'trailer') return null
    const makers = Object.values(ctx.entities)
      .filter((e) => e.kind === 'boat')
      .map((e) => ({
        tableId: e.id,
        anchors: brandOf(e, ctx.rowsByEntity[e.id] ?? []).models.map((m) => m.key),
      }))
    const read = fitsOf(ctx, page.table.id, makers)
    const word = (id: string): string => {
      const name = ctx.entities[id]?.name ?? id
      return book.marksFor(name)[0]?.brand ?? name
    }
    const said = new Map<string, string>()
    for (const line of shelf.groups.flatMap((g) => g.lines))
      said.set(line.id, fitsSaid(read.get(line.id), word))
    return said
  }, [ctx, page, shelf, book])
  const stamp = useMemo(() => {
    const p = provenanceOfSheet(version)
    return p.known ? `Price list of ${packedOn(p.file.packedAt, 'long')}` : null
  }, [version])

  /* EVERY PHOTOGRAPH OF THE MAKER, IN ONE LIGHTBOX — "See the 18 photographs" (judge.md, J4) */
  const [gallery, setGallery] = useState<number | null>(null)
  const photographs = useMemo(() => (page ? heroesOf(page.card.tableIds, book) : []), [page, book])

  /* back to the spread it was opened from, on Data, with this list open; an address that is no
     place goes back to Data at rest */
  const known = page !== null
  const backTo = known ? `/data?at=${encodeURIComponent(address)}` : '/data'
  const back = (
    <nav className="pl-trail" aria-label="Back">
      <Button
        intent="quiet"
        size="sm"
        icon={ArrowLeftIcon}
        href={backTo}
        onClick={go ? () => go(backTo) : undefined}
      >
        Back to the price list
      </Button>
    </nav>
  )

  if (looking || !open || !page) {
    return (
      <main
        className="pl-page"
        data-testid="place"
        data-read={!looking ? '' : undefined}
        aria-busy={looking || undefined}
      >
        {back}
        {looking ? (
          <output className="pl-quiet">Reading the price list…</output>
        ) : !open ? (
          <div className="pl-none">
            <p className="pl-none__say">
              {problem ??
                'No price list is open on this computer, so this place has nothing to show.'}
            </p>
            {openTheFile ? (
              <Button intent="primary" icon={DatabaseIcon} onClick={openTheFile}>
                Open the Master Price File
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="pl-none">
            <h1 className="pl-none__title">No place is called “{address}”</h1>
            <p className="pl-none__say">
              Every maker and list Northside sells from is on Data, and each opens its own page
              there.
            </p>
          </div>
        )}
      </main>
    )
  }

  const { card } = page
  const quoteHref = page.table ? `/quote/new?brand=${encodeURIComponent(page.table.id)}` : null
  const set: LightboxPicture[] = photographs.map((p) => {
    const srcSet = srcSetOf(p)
    return {
      src: p.src,
      width: p.width,
      height: p.height,
      ...(srcSet ? { srcSet } : {}),
      alt: p.subject,
      caption: p.subject,
      credit: creditOf(p),
    }
  })
  const handoff = page.table?.id === PARTS_TABLE
  const settings = tab === 'settings'

  return (
    <main
      className="pl-page"
      data-testid="place"
      data-read=""
      data-place={card.address}
      data-tab={tab}
      data-kind={card.kind}
    >
      {back}
      <Head
        page={page}
        figures={figuresOf(page, lineup, shelf)}
        stamp={stamp}
        act={
          page.quotable && quoteHref ? (
            <Button
              intent="act"
              icon={FilePlusIcon}
              href={quoteHref}
              onClick={go ? () => go(quoteHref) : undefined}
            >
              Quote {withArticle(page.quoteWord)}
            </Button>
          ) : null
        }
        gallery={
          photographs.length > 0 ? (
            <Button intent="veiled" icon={ImagesIcon} onClick={() => setGallery(0)}>
              {photographs.length === 1
                ? 'See the photograph'
                : `See the ${n(photographs.length)} photographs`}
            </Button>
          ) : null
        }
      />
      {settings ? (
        <section className="pl-pane" aria-label={`${card.name}: Settings`}>
          <div className="pl-pane__head">
            <h2 className="pl-pane__title">How {card.name} is dressed</h2>
            <Button
              intent="quiet"
              size="sm"
              icon={ArrowLeftIcon}
              href={`/places/${encodeURIComponent(card.address)}`}
              onClick={(e) => {
                e.preventDefault()
                onTab?.('range')
              }}
            >
              {card.kind === 'boat' ? 'Back to its models' : 'Back to its range'}
            </Button>
          </div>
          <Settings card={card} />
        </section>
      ) : (
        <>
          {lineup ? <Lineup page={page} lineup={lineup} at={at} onAt={onAt} go={go} /> : null}
          {handoff ? <Handoff page={page} go={go} /> : null}
          {shelf && !handoff ? (
            <Shelf page={page} shelf={shelf} at={at} onAt={onAt} go={go} fits={fits} />
          ) : null}
          <After
            page={page}
            lineup={lineup}
            shelf={shelf}
            quotes={quotes}
            go={go}
            onSettings={() => onTab?.('settings')}
          />
        </>
      )}
      <Lightbox
        pictures={set}
        at={gallery}
        onAt={setGallery}
        title={`${card.name} on the water`}
        strip
      />
    </main>
  )
}

/* ---------------------------------------------------------- */
/* The head                                                    */
/* ---------------------------------------------------------- */

export interface HeadFigure {
  /** set large: "67", "2.3–9.2 m", "$2,770–$198,610" */
  big: string
  /** under it: "models in 7 series", "long", "at Cash · 588 of 588 priced" */
  small: string
}

const metres = (v: number): string => v.toLocaleString('en-AU', { maximumFractionDigits: 2 })

/** The head's figures, each measured and said once: what it holds, how long, what it costs. */
function figuresOf(
  page: PlacePage,
  lineup: ReturnType<typeof readLineup> | null,
  shelf: ReturnType<typeof shelfOf> | null,
): HeadFigure[] {
  const holds = /^([\d,]+)\s+(.*)$/.exec(page.card.figure.holds)
  const out: HeadFigure[] = holds
    ? [{ big: holds[1] ?? '', small: holds[2] ?? '' }]
    : [{ big: page.card.figure.holds, small: '' }]
  if (lineup) {
    if (lineup.length) {
      const { lo, hi } = lineup.length
      out.push({
        big: lo === hi ? `${metres(lo)} m` : `${metres(lo)}–${metres(hi)} m`,
        small: 'long',
      })
    }
    const s = lineup.span
    const said = spanSaid(s.lo, s.hi)
    if (said)
      out.push({
        big: said.replace(' to ', '–'),
        small: `at ${lineup.rung} · ${n(s.priced)} of ${n(s.of)} versions priced`,
      })
  } else if (shelf && shelf.level && !shelf.retired) {
    const lines = shelf.groups.flatMap((g) => g.lines)
    const prices = lines.map((l) => l.price).filter((p): p is number => p !== null)
    const said = prices.length ? spanSaid(Math.min(...prices), Math.max(...prices)) : null
    if (said)
      out.push({
        big: said.replace(' to ', '–'),
        small: `at ${shelf.level.label} · ${n(prices.length)} of ${n(lines.length)} priced`,
      })
  } else if (shelf?.charge) {
    /* WHAT AN HOUR COSTS, on the head: the file's first rate, the cell its other sheets read the
       hour's sell from (Labour Rates!$H$9, Retail Labour), at the column's own name */
    const first = shelf.groups.flatMap((g) => g.lines).find((l) => l.price !== null)
    if (first?.price != null) {
      const said = money(first.price)
      out.push({
        big: shelf.cents && /^\$[\d,]+$/.test(said) ? `${said}.00` : said,
        small: `an hour of ${first.name} · ${shelf.charge.label}`,
      })
    }
  }
  return out
}

function Head({
  page,
  figures,
  stamp,
  act,
  gallery,
}: {
  page: PlacePage
  figures: HeadFigure[]
  stamp: string | null
  act: ReactNode
  gallery: ReactNode
}) {
  const { card } = page
  const hero = card.hero.shown
  return (
    <header className="pl-livery" data-livery={card.ground.key} data-hero={hero ? '' : undefined}>
      <Hero hero={card.hero} sizes="(max-width: 639px) 100vw, 50vw" priority />
      <div className="pl-livery__face">
        <span className="pl-livery__kind">{kindWord(card.kind)}</span>
        <h1 className="pl-livery__title">
          <Mark mark={card.mark} name={card.name} size={hero ? 'page' : 'card'} />
          {markIsArt(card.mark) ? (
            /* the maker's mark says its name: kept for a reader, not printed twice */
            <span className="pl-unseen">{card.name}</span>
          ) : null}
        </h1>
        {card.line ? <p className="pl-livery__line">{card.line}</p> : null}
        <ul className="pl-figs">
          {figures.map((f) => (
            <li key={f.small || f.big} className="pl-fig">
              <span className="pl-fig__big">{f.big}</span>{' '}
              <span className="pl-fig__small">{f.small}</span>
            </li>
          ))}
        </ul>
        <p className="pl-livery__stamp">{[card.figure.held, stamp].filter(Boolean).join(' · ')}</p>
        {act || gallery ? (
          <span className="pl-livery__acts">
            {act}
            {gallery}
          </span>
        ) : null}
      </div>
    </header>
  )
}

/* ---------------------------------------------------------- */
/* Parts: the chandlery is where it is read                    */
/* ---------------------------------------------------------- */

function Handoff({ page, go }: { page: PlacePage; go?: (href: string) => void }) {
  const table = page.table
  const rows = useCatalogue((s) => (table ? s.rows[table.id] : undefined))
  const shelf = useMemo(() => (table ? shelfOf(table, rows ?? []) : null), [table, rows])
  if (!table || !shelf) return null
  const sheet = `/data/${encodeURIComponent(table.id)}`
  return (
    <section className="pl-hand" aria-label={`Where ${page.card.name} is read`}>
      {/* NO FIGURE THE HEAD ALREADY SAYS, AND NONE THAT DISAGREES WITH IT: the head counts every
          line and how many are no longer sold, so the sentence says only why the chandlery
          (verify-1: "2,937 products in 187 categories" over "the same 2,238 … 180 headings") */}
      <p className="pl-hand__say">
        The chandlery reads {page.card.name} with find, aisles and pictures, so this page opens it
        rather than drawing every {shelf.heading} a second time.
        {shelf.unfiled > 0
          ? ` ${n(shelf.unfiled)} carry no ${shelf.heading} in the price list, and the chandlery files them where a person looks.`
          : ''}
      </p>
      <span className="pl-hand__doors">
        <Button
          intent="act"
          icon={StorefrontIcon}
          href="/catalogue"
          onClick={go ? () => go('/catalogue') : undefined}
        >
          Open the chandlery
        </Button>
        <Button
          intent="quiet"
          size="sm"
          icon={DatabaseIcon}
          href={sheet}
          onClick={go ? () => go(sheet) : undefined}
        >
          Open in the price list
        </Button>
      </span>
    </section>
  )
}
