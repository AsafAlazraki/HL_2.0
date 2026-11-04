import { useMemo, useState, type ReactNode } from 'react'
import {
  ArrowRightIcon,
  ClockCounterClockwiseIcon,
  FileTextIcon,
  LinkSimpleIcon,
  MagnifyingGlassIcon,
  SlidersHorizontalIcon,
  TagIcon,
} from '@phosphor-icons/react'
import { Button, Icon, Input, KIND_GLYPH, Tile } from '@/ui'
import type { QuoteDef } from '@/domain/model'
import { money } from '@/domain/money'
import { localDay } from '@/domain/quote/day'
import {
  givenReplacements,
  registerRow,
  supersededBy,
  type RegisterRow,
} from '@/domain/quote/register'
import type { Shelf } from '@/domain/lineup/shelf'
import { Mark } from './Livery'
import { Run } from './Run'
import type { Lineup } from './models'
import type { PlacePage } from './read'

/* ============================================================
   AFTER THE RANGE, NEVER BEFORE IT — what a place holds besides its
   models, each on its own plate:

     ITS PRICES, with figures: each price a customer may be shown,
       spanned series by series with how many versions carry a figure,
       and the price kept as Northside's own named with its reason
       (the Prices tab printed three level names and no figure).
     ITS QUOTES, each by the boat as a person says it, its customer,
       its total and whether it is given, with a find once there are
       more than a few (the tab printed the file's code string).
     WHAT IT GOES WITH, each partner by its mark and its count.
     WHAT WAS CHANGED HERE, each line a door to it in the price list,
       and HOW IT IS DRESSED, the door to its Settings.

   On a phone these stand after the boats, so the range is the first
   thing under the head (judge.md: the rail stood between them).
   ============================================================ */

const n = (v: number): string => v.toLocaleString('en-AU')
const FIND_FROM = 6
const CHANGED_MOST = 8

export function After({
  page,
  lineup,
  shelf,
  quotes,
  go,
  onSettings,
}: {
  page: PlacePage
  lineup: Lineup | null
  shelf: Shelf | null
  quotes: readonly QuoteDef[]
  go?: (href: string) => void
  onSettings: () => void
}) {
  const { card } = page
  const name = card.name
  const showPrices = lineup !== null || (shelf !== null && shelf.level !== null && !shelf.retired)
  return (
    <div className="pl-after">
      {showPrices ? <Prices page={page} lineup={lineup} shelf={shelf} go={go} /> : null}
      <Quotes page={page} all={quotes} go={go} />
      <aside className="pl-box" data-ground="plate" aria-labelledby="pl-goes">
        <h2 className="pl-box__head" id="pl-goes">
          <LinkSimpleIcon aria-hidden="true" /> Goes with
        </h2>
        {page.partners.length === 0 ? (
          <p className="pl-box__say">
            No list in the price list says what fits {name}, so it goes with nothing here.
          </p>
        ) : (
          <>
            <p className="pl-box__say">
              {lineup
                ? `The lines that say what fits, across all ${n(lineup.models.length)} models. Each card above counts its own.`
                : `The lines that say what fits, across all of ${name}.`}
            </p>
            <ul className="pl-partners">
              {page.partners.map((p) => (
                <li key={p.tableId} className="pl-partner" data-livery={p.ground.key}>
                  <Tile
                    shape="row"
                    tone="room"
                    onSelect={p.address && go ? () => go(`/places/${p.address}`) : undefined}
                    label={`${p.name}: ${n(p.fits)} ${p.fits === 1 ? 'fit' : 'fits'} with ${name}`}
                  >
                    <span className="pl-partner__in">
                      <span className="pl-partner__chip" aria-hidden="true">
                        {/* a place with no mark wears its kind's glyph; its name is beside */}
                        {p.mark.drawn ? (
                          <Mark mark={p.mark} name={p.name} size="chip" />
                        ) : (
                          <Icon glyph={KIND_GLYPH[p.kind]} weight="fill" size="lg" />
                        )}
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
          </>
        )}
      </aside>
      <section className="pl-box" data-ground="plate" aria-labelledby="pl-changed">
        <h2 className="pl-box__head" id="pl-changed">
          <ClockCounterClockwiseIcon aria-hidden="true" /> Changed here
        </h2>
        {page.changed.length === 0 ? (
          <p className="pl-box__say">
            No line of {name} has been changed since the price list came in.
          </p>
        ) : (
          <>
            <p className="pl-box__say">
              {n(page.changed.length)} {page.changed.length === 1 ? 'line' : 'lines'} of {name}{' '}
              changed since the price list came in, the latest first. Each opens in the price list.
            </p>
            <ul className="pl-changed">
              {page.changed.slice(0, CHANGED_MOST).map((c) => {
                const href = `/data/${encodeURIComponent(c.tableId)}?at=${encodeURIComponent(c.rowId)}`
                return (
                  <li key={c.rowId}>
                    <a
                      className="pl-changed__line"
                      href={href}
                      onClick={(e) => {
                        if (!go || e.metaKey || e.ctrlKey || e.shiftKey) return
                        e.preventDefault()
                        go(href)
                      }}
                    >
                      <span>{c.label}</span>
                      <span className="pl-changed__day">{localDay(c.at)}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
            {page.changed.length > CHANGED_MOST ? (
              <p className="pl-box__say">
                and {n(page.changed.length - CHANGED_MOST)} more, each marked in the price list.
              </p>
            ) : null}
          </>
        )}
        <h2 className="pl-box__head">
          <SlidersHorizontalIcon aria-hidden="true" /> How it is dressed
        </h2>
        <p className="pl-box__say">
          Its line, its mark, its photograph and its colour
          {card.kind === 'boat' ? '' : ', and whether it is sold on its own'}, each one step with
          Undo.
        </p>
        <span className="pl-box__act">
          <Button
            intent="secondary"
            size="sm"
            icon={ArrowRightIcon}
            href={`/places/${encodeURIComponent(card.address)}?tab=settings`}
            onClick={(e) => {
              e.preventDefault()
              onSettings()
            }}
          >
            Its settings
          </Button>
        </span>
      </section>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* Its prices                                                  */
/* ---------------------------------------------------------- */

/** A span in a cell: "$105,930–$198,610" on one line where it fits, and in a hand its two figures
 *  one over the other as "$105,930" / "to $198,610", never broken after the dash (verify-1). */
function spanCell(lo: number | null, hi: number | null): ReactNode {
  if (lo === null || hi === null) return '—'
  if (lo === hi) return money(lo)
  return (
    <span className="pl-span">
      <span className="pl-span__lo">{money(lo)}</span>
      <span className="pl-span__hi">
        <span className="pl-span__dash">–</span>
        {money(hi)}
      </span>
    </span>
  )
}

/** A boat as the register says it, with its separators held to the word before them, so a
 *  wrapped name never starts a line on "/" or "·" (verify-1: "/ White / White/Blue"). */
const heldSaid = (s: string): string => s.replace(/ ([·/–]) /g, ' $1 ')

function Prices({
  page,
  lineup,
  shelf,
  go,
}: {
  page: PlacePage
  lineup: Lineup | null
  shelf: Shelf | null
  go?: (href: string) => void
}) {
  const name = page.card.name
  const href = page.pricesHref
  return (
    <section className="pl-box pl-box--wide" data-ground="plate" aria-labelledby="pl-prices">
      <h2 className="pl-box__head" id="pl-prices">
        <TagIcon aria-hidden="true" /> Its prices
      </h2>
      {lineup && lineup.prices.length > 0 ? (
        <>
          <div className="pl-ptable__frame">
            <table className="pl-ptable">
              <thead>
                <tr>
                  <th scope="col">{lineup.filesSeries ? 'Series' : 'Models'}</th>
                  {lineup.prices.map((p) => (
                    <th key={p.level.key} scope="col">
                      {p.level.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(lineup.filesSeries ? (lineup.prices[0]?.bySeries ?? []) : []).map((s, i) => (
                  <tr key={s.key || 'none'}>
                    <th scope="row">
                      {s.name}
                      <small>
                        {n(s.span.priced)} of {n(s.span.of)} priced
                      </small>
                    </th>
                    {lineup.prices.map((p) => {
                      const at = p.bySeries[i]?.span
                      return <td key={p.level.key}>{at ? spanCell(at.lo, at.hi) : '—'}</td>
                    })}
                  </tr>
                ))}
                <tr className="pl-ptable__whole">
                  <th scope="row">
                    Every model
                    <small>
                      {n(lineup.prices[0]?.whole.priced ?? 0)} of{' '}
                      {n(lineup.prices[0]?.whole.of ?? 0)} priced
                    </small>
                  </th>
                  {lineup.prices.map((p) => (
                    <td key={p.level.key}>{spanCell(p.whole.lo, p.whole.hi)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          {lineup.kept.length > 0 ? (
            <p className="pl-box__say">
              {lineup.kept.map((l) => l.label).join(' and ')}{' '}
              {lineup.kept.length === 1
                ? 'is kept as Northside’s own and never reaches'
                : 'are kept as Northside’s own and never reach'}{' '}
              a customer, so no figure of {lineup.kept.length === 1 ? 'it' : 'them'} is printed
              here.
            </p>
          ) : null}
        </>
      ) : shelf && shelf.level ? (
        <p className="pl-box__say">
          Every figure above is the price list’s {shelf.level.label}, the price a quote prints for{' '}
          {name}.
        </p>
      ) : null}
      {href ? (
        <span className="pl-box__act">
          <Button
            intent="secondary"
            size="sm"
            icon={ArrowRightIcon}
            href={href}
            onClick={go ? () => go(href) : undefined}
          >
            Decide its prices
          </Button>
        </span>
      ) : null}
    </section>
  )
}

/* ---------------------------------------------------------- */
/* Its quotes                                                  */
/* ---------------------------------------------------------- */

const STATE_SAID: Record<RegisterRow['state'], string> = {
  draft: 'Draft',
  issued: 'Given',
  superseded: 'Replaced',
}

function Quotes({
  page,
  all,
  go,
}: {
  page: PlacePage
  all: readonly QuoteDef[]
  go?: (href: string) => void
}) {
  const [find, setFind] = useState('')
  const rows = useMemo(() => {
    const replacedBy = supersededBy(all)
    const superseded = new Set(givenReplacements(all).keys())
    const byId = new Map(all.map((q) => [q.id, q]))
    return page.quotes.map((q) => registerRow(q, superseded, replacedBy, byId))
  }, [page.quotes, all])
  const word = page.quotable ? `a ${page.quoteWord}` : page.card.name
  const given = rows.filter((r) => r.state !== 'draft').length
  const words = find.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const shown = rows.filter((r) => {
    if (words.length === 0) return true
    const hay = [r.reference, r.boat, r.customer ?? ''].join(' ').toLowerCase()
    return words.every((w) => hay.includes(w))
  })
  return (
    <section className="pl-box" data-ground="plate" aria-labelledby="pl-quotes">
      <h2 className="pl-box__head" id="pl-quotes">
        <FileTextIcon aria-hidden="true" /> Quotes on {word}{' '}
        <span className="pl-box__count">{n(rows.length)}</span>
      </h2>
      {rows.length === 0 ? (
        <p className="pl-box__say">
          No quote on {word} is held on this computer yet. Each one started is listed here by its
          customer, its boat and its total, newest first.
        </p>
      ) : (
        <>
          <p className="pl-box__say">
            {n(rows.length)} on this computer, {n(given)} given, newest first.
          </p>
          {rows.length >= FIND_FROM ? (
            <Input
              type="search"
              icon={MagnifyingGlassIcon}
              aria-label={`Find a quote on ${word}`}
              placeholder="Find a customer, boat or quote number"
              value={find}
              onValueChange={setFind}
            />
          ) : null}
          {shown.length === 0 ? (
            <p className="pl-box__say">No quote here holds “{find}”.</p>
          ) : (
            <ul className="pl-quotes">
              {shown.map((r) => {
                const href = `/quote/${encodeURIComponent(r.id)}`
                return (
                  <li key={r.id} className="pl-quote">
                    <Tile
                      shape="row"
                      tone="room"
                      onSelect={go ? () => go(href) : undefined}
                      label={[r.boat, r.customer ?? 'Nobody named yet', STATE_SAID[r.state]].join(
                        ' · ',
                      )}
                    >
                      <span className="pl-quote__in">
                        <span className="pl-quote__boat">{heldSaid(r.boat)}</span>
                        <span className="pl-quote__total">
                          {r.total !== null ? money(r.total) : r.insteadOfTotal}
                        </span>
                        {/* who and where it stands share the full width under the boat, so the
                            boat's name has every column but the total's */}
                        <span className="pl-quote__meta">
                          <span className="pl-quote__who">{r.customer ?? 'Nobody named yet'}</span>
                          <Run
                            className="pl-quote__state"
                            items={[STATE_SAID[r.state], localDay(r.createdAt), r.reference]}
                          />
                        </span>
                      </span>
                    </Tile>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </section>
  )
}
