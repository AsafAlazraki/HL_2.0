import type { CSSProperties } from 'react'
import { DatabaseIcon, InfoIcon, MagnifyingGlassIcon, TagIcon } from '@phosphor-icons/react'
import { Button, Input, Select } from '@/ui'
import { money } from '@/domain/money'
import { findOnShelf, isRig, type Shelf as ShelfRead, type ShelfGroup } from '@/domain/lineup/shelf'
import type { PlacePage } from './read'
import type { PlaceAt } from './tabs'
import { Run } from './Run'

/* ============================================================
   A LIST THAT IS NOT A BOAT MAKER, READ AS ITS OWN RANGE.

   A motor maker by its own horsepower: a ladder of its ratings from
   the least, then its twin and triple rigs, each step opening its
   motors with their weight, shaft and control and the price the list
   declares (Yamaha's 209 were nine file headings until 2026-11-04). A
   trailer maker by its series, each trailer with the boats it takes
   and its ATM. A list with no headings (Labour Rates) as its lines.

   ONE HEADING OPEN AT A TIME, in the address (`?in=150`); the first
   when none is named. Thirty headings or fewer stand as a ladder of
   presses, more as one chooser, and a find reaches every line at once.

   NO FIGURE WITHOUT A DECLARED PRICE. A list that declares none a
   customer may see (Dealer Fit) prints no figure, and the sentence
   saying why stands where the figures would, with its door. Labour
   Rates declares none and is read at the column the file charges an
   hour at, its Rate (inc GST), named as the file names it
   (`chargeOf`), so what an hour costs is on the page and never what
   the file's other sheets cost it at. A list no longer sold draws
   every line as no longer sold.

   EACH MOTOR AND TRAILER SAYS WHAT IT FITS, maker by maker, counted
   the way the boat makers' cards count it (`fitsOf`); each trailer
   says the boats it takes in the file's own words and its own length
   where the file carries one, and the head says how many do.
   ============================================================ */

const n = (v: number): string => v.toLocaleString('en-AU')
const FIND_FROM = 20
const FOUND_MOST = 120
const LADDER_MOST = 48
/** the lines filed under no heading, whose key is '' — a chooser's empty value is no choice */
const NONE = '\u0000none'

export function Shelf({
  page,
  shelf,
  at,
  onAt,
  go,
  fits,
}: {
  page: PlacePage
  shelf: ShelfRead
  at: PlaceAt
  onAt?: (next: PlaceAt) => void
  go?: (href: string) => void
  /** what each line fits, said, by its row id; absent for a list no boat maker reads */
  fits?: ReadonlyMap<string, string> | null
}) {
  const table = page.table
  if (!table) return null
  const name = page.card.name
  const noun = page.noun
  const move = (next: Partial<PlaceAt>) => onAt?.({ ...at, ...next })
  const sheet = `/data/${encodeURIComponent(table.id)}`
  const finding = (at.find ?? '').trim() !== ''
  const groups = finding ? findOnShelf(shelf, at.find ?? '') : shelf.groups
  const open = finding
    ? null
    : (shelf.groups.find((g) => g.key === at.in) ?? shelf.groups[0] ?? null)
  const many = shelf.groups.length > 1
  /* "the Yamaha F175XC" on Yamaha's own page is "F175XC": the maker is named once, on the head */
  const maker = page.quoteWord
  const lineName = (s: string): string =>
    s.toLowerCase().startsWith(`${maker.toLowerCase()} `) ? s.slice(maker.length + 1) : s
  const headingWord = `${shelf.heading.slice(0, 1).toUpperCase()}${shelf.heading.slice(1)}`
  const singles = shelf.groups.filter((g) => !isRig(g.key)).length
  const rigs = shelf.groups.filter((g) => isRig(g.key))

  const title =
    shelf.by === 'hp'
      ? 'By horsepower'
      : shelf.by === 'heading'
        ? `By ${shelf.heading}`
        : `Its ${noun}`
  const lede =
    shelf.by === 'hp'
      ? `By the price list’s own HP Rating: ${n(singles)} ${singles === 1 ? 'rating' : 'ratings'}${
          rigs.length > 0
            ? `, then ${n(rigs.reduce((s, g) => s + g.lines.length, 0))} twin and triple rigs`
            : ''
        }.`
      : shelf.by === 'heading'
        ? `${n(shelf.groups.length)} ${shelf.groups.length === 1 ? shelf.heading : `${shelf.heading === 'series' ? 'series' : `${shelf.heading.replace(/y$/, 'ie')}s`}`}, in the price list’s own order.`
        : `In the price list’s own order.`

  return (
    <section className="pl-shelf" aria-labelledby="pl-shelf-title">
      <div className="pl-shelf__head">
        <div className="pl-dock__words">
          <h2 className="pl-dock__title" id="pl-shelf-title">
            {title}{' '}
            <span className="pl-dock__count">
              {n(shelf.lines)} {noun}
            </span>
          </h2>
          <p className="pl-dock__say">{lede}</p>
        </div>
        <div className="pl-dock__tools">
          {shelf.lines > FIND_FROM ? (
            <span className="pl-dock__find">
              <Input
                type="search"
                icon={MagnifyingGlassIcon}
                aria-label={`Find in ${name}`}
                placeholder="Find a name, code or figure"
                value={at.find ?? ''}
                onValueChange={(v) => move({ find: v === '' ? undefined : v })}
              />
            </span>
          ) : null}
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
      </div>

      {/* WHY A FIGURE IS NOT PRINTED, where the figures would stand */}
      {shelf.retired ? (
        <p className="pl-note">
          <InfoIcon aria-hidden="true" />
          <span>
            None of these {n(shelf.lines)} {noun} is sold now, so none is offered on a new quote and
            none is priced here. Each stands as the price list keeps it.
          </span>
        </p>
      ) : !shelf.level && shelf.charge ? (
        <p className="pl-note">
          <InfoIcon aria-hidden="true" />
          <span>
            {name} declares no price of its own, so each rate is printed at the price list’s{' '}
            {shelf.charge.label}, what an hour is charged at. Its Actual and Rate (Exc GST), which
            the price list’s other sheets cost an hour at, stay in the price list.
          </span>
        </p>
      ) : !shelf.level ? (
        <div className="pl-note" role="note">
          <InfoIcon aria-hidden="true" />
          <span>
            {name} names no price a customer may be shown, so no figure is printed here.{' '}
            {page.pricesHref
              ? `Northside chooses its price on Prices.`
              : `It is not one of the lists on Prices yet, so its figures are read in the price list.`}
          </span>
          {page.pricesHref ? (
            <Button
              intent="quiet"
              size="sm"
              icon={TagIcon}
              href={page.pricesHref}
              onClick={go && page.pricesHref ? () => go(page.pricesHref ?? '') : undefined}
            >
              Choose its price
            </Button>
          ) : null}
        </div>
      ) : null}
      {shelf.held > 0 ? (
        <p className="pl-shelf__held">
          {n(shelf.held)} more {shelf.held === 1 ? 'is' : 'are'} no longer sold and{' '}
          {shelf.held === 1 ? 'is' : 'are'} not drawn here; the price list keeps{' '}
          {shelf.held === 1 ? 'it' : 'them'}.
        </p>
      ) : null}
      {shelf.lengths && !finding ? (
        <p className="pl-shelf__held">
          {!shelf.lengths.filed
            ? `The price list files no length for ${name}, so each trailer is said by the boats it takes and its ATM.`
            : shelf.lengths.n === shelf.lengths.of
              ? `Every one of the ${n(shelf.lengths.of)} carries its own length in the price list.`
              : `${n(shelf.lengths.n)} of the ${n(shelf.lengths.of)} carry their own length in the price list; the rest are said by the boats they take and their ATM.`}
        </p>
      ) : null}
      {shelf.unfiled > 0 && !finding ? (
        <p className="pl-shelf__held">
          {n(shelf.unfiled)} {shelf.unfiled === 1 ? 'is' : 'are'} filed under no {shelf.heading} in
          the price list, and stand{shelf.unfiled === 1 ? 's' : ''} first under their own heading,
          so every one counted is drawn.
        </p>
      ) : null}

      {/* THE HEADINGS: a ladder of presses, or one chooser where there are many */}
      {many && !finding ? (
        <>
          {shelf.groups.length <= LADDER_MOST ? (
            <fieldset className="pl-ladder">
              <legend className="pl-unseen">{title}</legend>
              {shelf.groups.map((g) => (
                <button
                  key={g.key || 'none'}
                  type="button"
                  className="pl-step"
                  data-ground="plate"
                  data-rig={isRig(g.key) ? '' : undefined}
                  aria-pressed={open === g}
                  onClick={() => move({ in: g.key })}
                >
                  <span className="pl-step__name">{g.name}</span>
                  <span className="pl-step__count">{n(g.lines.length)}</span>
                </button>
              ))}
            </fieldset>
          ) : null}
          <div
            className="pl-chooser"
            data-always={shelf.groups.length > LADDER_MOST ? '' : undefined}
          >
            <span className="pl-chooser__label" aria-hidden="true">
              {shelf.by === 'hp' ? 'Horsepower' : headingWord}
            </span>
            <Select<string>
              aria-label={title}
              options={shelf.groups.map((g) => ({
                value: g.key === '' ? NONE : g.key,
                label: g.name,
                trail: n(g.lines.length),
              }))}
              value={open ? (open.key === '' ? NONE : open.key) : null}
              onValueChange={(v) => move({ in: v === null ? undefined : v === NONE ? '' : v })}
            />
          </div>
        </>
      ) : null}

      {finding && groups.length === 0 ? (
        <p className="pl-none__say">
          Nothing in {name} holds “{at.find}”.
        </p>
      ) : null}
      {(finding ? cap(groups) : open ? [open] : []).map((g) => (
        <Group
          key={g.key || 'none'}
          group={g}
          level={shelf.level?.label ?? shelf.charge?.label ?? null}
          cents={shelf.cents}
          named={many || finding}
          lineName={lineName}
          fits={fits ?? null}
        />
      ))}
      {finding && count(groups) > FOUND_MOST ? (
        <p className="pl-shelf__held">
          The first {n(FOUND_MOST)} of {n(count(groups))} found are drawn. Add a word to the find to
          narrow it.
        </p>
      ) : null}
    </section>
  )
}

const count = (gs: readonly ShelfGroup[]): number => gs.reduce((s, g) => s + g.lines.length, 0)

/** The first lines a find reached, heading by heading, to the most a page draws. */
function cap(gs: readonly ShelfGroup[]): ShelfGroup[] {
  let left = FOUND_MOST
  const out: ShelfGroup[] = []
  for (const g of gs) {
    if (left <= 0) break
    out.push({ ...g, lines: g.lines.slice(0, left) })
    left -= g.lines.length
  }
  return out
}

/** A figure said as the list says its figures: to the cent on every line where a quarter or more
 *  carry cents (`Shelf.cents`), so "$159.00" stands over "$143.10", never "$159". */
const said = (v: number, cents: boolean): string => {
  const s = money(v)
  return cents && /^−?\$[\d,]+$/.test(s) ? `${s}.00` : s
}

function Group({
  group: g,
  level,
  cents,
  named,
  lineName,
  fits,
}: {
  group: ShelfGroup
  level: string | null
  cents: boolean
  named: boolean
  lineName: (s: string) => string
  fits: ReadonlyMap<string, string> | null
}) {
  const span =
    g.from !== null && g.to !== null
      ? g.from === g.to
        ? said(g.from, cents)
        : `from ${said(g.from, cents)} to ${said(g.to, cents)}`
      : null
  return (
    <section className="pl-group" aria-label={g.name}>
      {named ? (
        <h3 className="pl-group__head">
          {g.name}{' '}
          <span className="pl-group__count">
            {n(g.lines.length)}
            {level && span ? ` · ${span} at ${level}` : ''}
          </span>
        </h3>
      ) : null}
      <ul
        className="pl-lines"
        data-ground="plate"
        style={{ '--lines': Math.min(g.lines.length, 4) } as CSSProperties}
      >
        {g.lines.map((l) => (
          <li key={l.id} className="pl-line" data-gone={l.gone ? '' : undefined}>
            <span className="pl-line__words">
              <span className="pl-line__name">{lineName(l.name)}</span>
              <Run
                className="pl-line__facts"
                items={[
                  l.gone ? (
                    <span key="gone" className="pl-line__tag">
                      No longer sold
                    </span>
                  ) : null,
                  l.code && !l.name.includes(l.code) ? (
                    <span key="code" className="pl-line__code">
                      {l.code}
                    </span>
                  ) : null,
                  ...l.facts,
                  fits ? (fits.get(l.id) ?? null) : null,
                ]}
              />
            </span>
            {level && !l.gone ? (
              <span className="pl-line__price">
                {l.price !== null ? (
                  said(l.price, cents)
                ) : (
                  <span className="pl-card__gap">No figure</span>
                )}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
