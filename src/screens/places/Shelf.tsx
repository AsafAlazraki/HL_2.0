import { DatabaseIcon, InfoIcon, MagnifyingGlassIcon, TagIcon } from '@phosphor-icons/react'
import { Button, Input, Select } from '@/ui'
import { money } from '@/domain/money'
import { findOnShelf, isRig, type Shelf as ShelfRead, type ShelfGroup } from '@/domain/lineup/shelf'
import type { PlacePage } from './read'
import type { PlaceAt } from './tabs'

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
   customer may see (Labour Rates, Dealer Fit) prints no figure, and
   the sentence saying why stands where the figures would, with its
   door. A list no longer sold draws every line as no longer sold.
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
}: {
  page: PlacePage
  shelf: ShelfRead
  at: PlaceAt
  onAt?: (next: PlaceAt) => void
  go?: (href: string) => void
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
      ) : !shelf.level ? (
        <div className="pl-note" role="note">
          <InfoIcon aria-hidden="true" />
          <span>
            {name} names no price a customer may be shown, so no figure is printed here.{' '}
            {page.pricesHref
              ? `Northside chooses its price on Prices.`
              : `Prices does not carry ${name} yet, so its figures are read in the price list.`}
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
          level={shelf.level?.label ?? null}
          named={many || finding}
          lineName={lineName}
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

function Group({
  group: g,
  level,
  named,
  lineName,
}: {
  group: ShelfGroup
  level: string | null
  named: boolean
  lineName: (s: string) => string
}) {
  const span =
    g.from !== null && g.to !== null
      ? g.from === g.to
        ? money(g.from)
        : `from ${money(g.from)} to ${money(g.to)}`
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
      <ul className="pl-lines" data-ground="plate">
        {g.lines.map((l) => (
          <li key={l.id} className="pl-line" data-gone={l.gone ? '' : undefined}>
            <span className="pl-line__words">
              <span className="pl-line__name">{lineName(l.name)}</span>
              <span className="pl-line__facts">
                {l.gone ? <span className="pl-line__tag">No longer sold</span> : null}
                {l.code && !l.name.includes(l.code) ? (
                  <span className="pl-line__code">{l.code}</span>
                ) : null}
                {l.facts.length > 0 ? (
                  /* one run of words, each fact held to the dot before it, so a wrapped line
                     never starts on a dot */
                  <span className="pl-line__fact">{l.facts.join(' · ')}</span>
                ) : null}
              </span>
            </span>
            {level && !l.gone ? (
              <span className="pl-line__price">
                {l.price !== null ? (
                  money(l.price)
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
