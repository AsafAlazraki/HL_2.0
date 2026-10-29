import { useMemo } from 'react'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  DatabaseIcon,
  FilePlusIcon,
  TagIcon,
} from '@phosphor-icons/react'
import { Button, Picture, Plate, Segmented, Tile } from '@/ui'
import { pictures, srcSetOf } from '@/data/pictures'
import { localDay } from '@/domain/quote/day'
import { useCatalogue, useQuotes } from '@/app/useStores'
import { Hero, Mark, markIsArt } from './Livery'
import { kindWord, readPlace, readPlaces, type PlacePage } from './read'
import { Settings } from './Settings'
import './places.css'

/* ============================================================
   ONE PLACE, OPENED — /places/$id. Board A's livery head at page
   scale, with what the verdict grafted from board B: tabs that carry
   their counts and live in the address, the place's one act ("Quote a
   Highfield") on the head, and a rail of the places it GOES WITH, each
   by its own mark with the count of lines that say what fits — the
   price list's lists of what fits which boat, inside the place, which
   is what the owner asked twice ("their join and view ones should lie
   within them").

   THE TWO HARD CASES. A brand with 588 lines opens on its range, one
   tile per series in the price list's order, each with one of its own
   boats on the water where the app has one; Registration Costs opens
   on its four sections the same way, and a list with no headings at
   all (Labour Rates) opens on its lines with their prices. The head is
   the same for every place; the body is what the place holds.

   EVERY FACT ONCE. The head says what the place holds; the Range tab
   carries no count of its own because the head already said it. The
   pill carries Data lit, so the one way back drawn here is to Places,
   which the pill does not carry.
   ============================================================ */

export const PLACE_TABS = ['range', 'quotes', 'prices', 'settings'] as const
export type PlaceTab = (typeof PLACE_TABS)[number]

export interface PlaceProps {
  /** the list the place stands for, as its address spells it */
  address: string
  tab: PlaceTab
  onTab?: (tab: PlaceTab) => void
  /** follow an address this page links to */
  go?: (href: string) => void
  openTheFile?: () => void
}

const n = (v: number): string => v.toLocaleString('en-AU')

/** "a Highfield", "an Ultralite" */
const withArticle = (word: string): string => `${/^[aeiou]/i.test(word) ? 'an' : 'a'} ${word}`

export function Place({ address, tab, onTab, go, openTheFile }: PlaceProps) {
  const status = useCatalogue((s) => s.status)
  const problem = useCatalogue((s) => s.problem)
  const tables = useCatalogue((s) => s.tables)
  const rows = useCatalogue((s) => s.rows)
  const modules = useCatalogue((s) => s.modules)
  const priceLevels = useCatalogue((s) => s.priceLevels)
  const quotes = useQuotes((s) => s.quotes)

  const looking = (status === 'empty' || status === 'loading') && problem === null
  const open = status === 'ready' && Object.keys(tables).length > 0

  const page = useMemo(() => {
    if (!open) return null
    const world = { tables, rows, modules, priceLevels }
    const read = readPlaces(world, pictures())
    return readPlace(world, read, address, quotes, pictures())
  }, [open, tables, rows, modules, priceLevels, address, quotes])

  const back = (
    <nav className="pl-trail" aria-label="Places">
      <Button
        intent="quiet"
        size="sm"
        icon={ArrowLeftIcon}
        href="/places"
        onClick={go ? () => go('/places') : undefined}
      >
        Every place
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
              Every place in the business is on Places, each by its own mark.
            </p>
          </div>
        )}
      </main>
    )
  }

  const { card } = page
  const tabs = [
    { value: 'range' as const, label: 'Range' },
    { value: 'quotes' as const, label: `Quotes ${n(page.quotes.length)}` },
    { value: 'prices' as const, label: `Prices ${n(page.prices.length)}` },
    { value: 'settings' as const, label: 'Settings' },
  ]
  const quoteHref = page.table ? `/quote/new?brand=${encodeURIComponent(page.table.id)}` : null
  const photos =
    card.kind === 'boat' && !card.place.retired
      ? card.photographs === 0
        ? 'No photograph on the water yet'
        : `${n(card.photographs)} ${card.photographs === 1 ? 'photograph' : 'photographs'} on the water`
      : null

  return (
    <main
      className="pl-page"
      data-testid="place"
      data-read=""
      data-place={card.address}
      data-tab={tab}
    >
      {back}
      <header
        className="pl-livery"
        data-livery={card.ground.key}
        data-hero={card.hero.shown ? '' : undefined}
      >
        <Hero hero={card.hero} sizes="(max-width: 639px) 100vw, 55vw" priority />
        <div className="pl-livery__face">
          <span className="pl-livery__kind">{kindWord(card.kind)}</span>
          <h1 className="pl-livery__title">
            <Mark mark={card.mark} name={card.name} size="page" />
            {markIsArt(card.mark) ? (
              <span className={card.nameShown ? 'pl-livery__name' : 'pl-unseen'}>{card.name}</span>
            ) : null}
          </h1>
          {card.line ? <p className="pl-livery__line">{card.line}</p> : null}
          <p className="pl-livery__facts">
            <span className="pl-livery__holds">{card.figure.holds}</span>
            {card.figure.held ? <span>{card.figure.held}</span> : null}
            {photos ? <span>{photos}</span> : null}
          </p>
          {page.quotable && quoteHref ? (
            <span className="pl-livery__act">
              <Button
                intent="act"
                icon={FilePlusIcon}
                href={quoteHref}
                onClick={go ? () => go(quoteHref) : undefined}
              >
                Quote {withArticle(page.quoteWord)}
              </Button>
            </span>
          ) : null}
        </div>
      </header>

      <div className="pl-body">
        <aside className="pl-rail" aria-labelledby="pl-goes">
          <h2 className="pl-rail__head" id="pl-goes">
            Goes with
          </h2>
          {page.partners.length === 0 ? (
            <p className="pl-rail__say">
              No list in the price list says what fits {card.name}, so it goes with nothing here.
            </p>
          ) : (
            <ul className="pl-partners">
              {page.partners.map((p) => (
                <li key={p.tableId} className="pl-partner" data-livery={p.ground.key}>
                  <Tile
                    shape="row"
                    tone="room"
                    onSelect={p.address && go ? () => go(`/places/${p.address}`) : undefined}
                    label={`${p.name}: ${n(p.fits)} ${p.fits === 1 ? 'fit' : 'fits'} with ${card.name}`}
                  >
                    <span className="pl-partner__in">
                      <span className="pl-partner__chip" aria-hidden="true">
                        {p.mark.drawn ? <Mark mark={p.mark} name={p.name} size="chip" /> : null}
                      </span>
                      <span className="pl-partner__words">
                        <span className="pl-partner__name">{p.name}</span>
                        <span className="pl-partner__fits">
                          {n(p.fits)} {p.fits === 1 ? 'fit' : 'fits'}
                        </span>
                      </span>
                      <span className="pl-partner__go" aria-hidden="true">
                        <ArrowRightIcon />
                      </span>
                    </span>
                  </Tile>
                </li>
              ))}
            </ul>
          )}
          <h2 className="pl-rail__head">Changed here</h2>
          <p className="pl-rail__say">
            {page.edited === 0
              ? `No line of ${card.name} has been changed since the price list came in.`
              : `${n(page.edited)} ${page.edited === 1 ? 'line' : 'lines'} of ${card.name} changed since the price list came in.`}
          </p>
        </aside>

        <section
          className="pl-main"
          aria-label={`${card.name}: ${tabs.find((t) => t.value === tab)?.label ?? ''}`}
        >
          <div className="pl-tabs">
            <Segmented
              label={`What to show of ${card.name}`}
              options={tabs}
              value={tab}
              onValueChange={(v) => onTab?.(v)}
            />
          </div>
          {tab === 'range' ? <Range page={page} go={go} /> : null}
          {tab === 'quotes' ? <Quotes page={page} go={go} /> : null}
          {tab === 'prices' ? <Prices page={page} go={go} /> : null}
          {tab === 'settings' ? <Settings card={card} /> : null}
        </section>
      </div>
    </main>
  )
}

/* ---------------------------------------------------------- */
/* Range                                                       */
/* ---------------------------------------------------------- */

function Range({ page, go }: { page: PlacePage; go?: (href: string) => void }) {
  const table = page.table
  if (!table) {
    return <p className="pl-pane__say">{page.card.name} has no list in the price list now.</p>
  }
  const sheet = `/data/${encodeURIComponent(table.id)}`
  const boat = page.card.kind === 'boat'
  const head = (
    <div className="pl-pane__head">
      <p className="pl-pane__say">
        {page.range.length > 0
          ? `In the price list’s own order.`
          : `${n(page.lines.length)} ${page.noun} still sold, in the price list’s own order.`}
      </p>
      <Button
        intent="quiet"
        size="sm"
        icon={DatabaseIcon}
        href={sheet}
        onClick={go ? () => go(sheet) : undefined}
      >
        Open in the price list
      </Button>
    </div>
  )
  if (page.range.length === 0) {
    return (
      <div className="pl-pane">
        {head}
        <Plate as="section" pad="none" label={`${page.card.name}, line by line`}>
          <ul className="pl-lines">
            {page.lines.map((line) => (
              <li key={line.id} className="pl-line">
                <span className="pl-line__label">{line.label}</span>
                <span className="pl-line__price">{line.price}</span>
              </li>
            ))}
          </ul>
        </Plate>
      </div>
    )
  }
  return (
    <div className="pl-pane">
      {head}
      <ul className="pl-range" data-kind={page.card.kind} data-livery={page.card.ground.key}>
        {page.range.map((part) => {
          const href = `${sheet}?in=${encodeURIComponent(part.name)}`
          const count = boat
            ? `${n(part.models)} ${part.models === 1 ? 'model' : 'models'}`
            : `${n(part.lines)} ${page.noun}`
          return (
            <li key={part.name} className="pl-part" data-pictured={part.picture ? '' : undefined}>
              <Tile
                onSelect={go ? () => go(href) : undefined}
                label={`${part.name} · ${count} — open it in the price list`}
              >
                <span className="pl-part__in">
                  {part.picture ? (
                    <span className="pl-part__shot">
                      <Picture
                        src={part.picture.src}
                        srcSet={srcSetOf(part.picture)}
                        sizes="(max-width: 639px) 40vw, 240px"
                        alt=""
                        width={part.picture.width}
                        height={part.picture.height}
                        lazy
                      />
                    </span>
                  ) : (
                    <span className="pl-part__band">
                      <span className="pl-part__band-name">{part.name}</span>
                    </span>
                  )}
                  <span className="pl-part__words">
                    {part.picture ? <span className="pl-part__name">{part.name}</span> : null}
                    <span className="pl-part__count">{count}</span>
                    {part.pictured > 0 ? (
                      <span className="pl-part__more">{n(part.pictured)} on the water</span>
                    ) : null}
                  </span>
                </span>
              </Tile>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* Quotes                                                      */
/* ---------------------------------------------------------- */

function Quotes({ page, go }: { page: PlacePage; go?: (href: string) => void }) {
  const name = page.card.name
  if (page.quotes.length === 0) {
    return (
      <div className="pl-pane">
        <p className="pl-pane__say">
          No quote has {name} on it yet. Each one that does shows here, newest first.
        </p>
      </div>
    )
  }
  return (
    <div className="pl-pane">
      <p className="pl-pane__say">Newest first.</p>
      <ul className="pl-quotes">
        {page.quotes.map((q) => {
          const href = `/quote/${encodeURIComponent(q.id)}`
          const given = q.state === 'issued'
          return (
            <li key={q.id} className="pl-quote">
              <Tile shape="row" tone="room" onSelect={go ? () => go(href) : undefined}>
                <span className="pl-quote__in">
                  <span className="pl-quote__ref">{q.reference}</span>
                  <span className="pl-quote__boat">{q.subjectLabel}</span>
                  <span className="pl-quote__who">
                    {q.customer.name.trim() || 'Nobody named yet'}
                  </span>
                  <span className="pl-quote__state" data-state={given ? 'given' : 'draft'}>
                    {given ? 'Given' : 'Draft'} · {localDay(q.createdAt)}
                  </span>
                </span>
              </Tile>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* Prices                                                      */
/* ---------------------------------------------------------- */

function Prices({ page, go }: { page: PlacePage; go?: (href: string) => void }) {
  const name = page.card.name
  const href = page.pricesHref
  return (
    <div className="pl-pane">
      {page.prices.length === 0 ? (
        <p className="pl-pane__say">{name} carries no price a quote can show.</p>
      ) : (
        <>
          <p className="pl-pane__say">
            A quote can show {name} at {page.prices.length === 1 ? 'this price' : 'these prices'},
            each the price list’s own figure.
          </p>
          <ul className="pl-prices">
            {page.prices.map((p) => (
              <li key={p.filed} className="pl-price">
                <span className="pl-price__said">{p.said}</span>
                <span className="pl-price__filed">the price list’s “{p.filed}”</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {href ? (
        <span className="pl-pane__act">
          <Button
            intent="secondary"
            icon={TagIcon}
            href={href}
            onClick={go ? () => go(href) : undefined}
          >
            Decide its prices
          </Button>
        </span>
      ) : null}
    </div>
  )
}
