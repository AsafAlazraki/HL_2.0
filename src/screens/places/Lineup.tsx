import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react'
import {
  ArrowDownIcon,
  ArrowRightIcon,
  CheckIcon,
  DatabaseIcon,
  EngineIcon,
  FilePlusIcon,
  InfoIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ScalesIcon,
  WrenchIcon,
  XIcon,
} from '@phosphor-icons/react'
import { Button, Input, Picture, Segmented, Select, Toggle } from '@/ui'
import { srcSetOf } from '@/data/pictures'
import { money } from '@/domain/money'
import { fitmentOf } from '@/app/ways'
import { hpSaid, measureSaid, peopleSaid, lengthOf } from '@/domain/lineup/measure'
import { compareRows, ordered, type CompareRow } from '@/domain/lineup/range'
import type { Lineup as LineupRead, LineupModel, LineupSeries } from './models'
import type { PlacePage } from './read'
import { COMPARE_MOST, type PlaceAt } from './tabs'
import { Run } from './Run'

/* ============================================================
   THE LINE-UP — every model of a boat maker, the range a person at the
   desk is asked about first ("what do you have, and what does it
   cost?"), and the compare it is asked about second ("the 600 or the
   660?").

   THE SERIES FILTER IN PLACE (`?series=Sport`). Seven or fewer stand
   as pictured tiles, each with its count and its from-price; a maker
   cut finer (Stacer's 22) and every phone get one chooser. A model the
   file files under no series stands under "Filed under no series" with
   the sentence naming them, so the head's count is the count drawn
   (Jeanneau 27, not 23: judge.md §2).

   ONE CARD PER MODEL: its own picture, or its length and horsepower set
   large where no picture of it is held; its name as a person says it
   and its code; from its least figure at the register's own price; its
   length, people and horsepower; the motor the price list marks
   recommended; and motors, trailers, packages and parts as four counted
   figures (`carriesOf`, Fitment's own reading). Its presses: Compare,
   What fits (Fitment opened on that boat) and Quote it (the picker on
   that model).

   THE RANGE HEAD DOCKS under the bar once the page scrolls, with the
   order, the find and the compare tray, so the tray never floats over a
   card. Up to three boats are set side by side, in place under it, in
   bands — Price, Specifications, What fits — with a dash where the file
   carries nothing, and the rows that differ lit. Opened by a press, the
   page is brought to the compare with the head docked over it, so the
   series tiles never stand half under the bar (verify-1, gap 7).

   IN A HAND, AND IN A WINDOW TOO SHORT TO DOCK, the head is not docked,
   so the tray stands at the foot of the range instead, held at the
   bottom of the screen while the cards pass (verify-1, gap 2). A
   compare refused is said on the card whose Compare was pressed, and
   to a screen reader, at every size.
   ============================================================ */

const n = (v: number): string => v.toLocaleString('en-AU')
const plural = (v: number, one: string, many = `${one}s`): string =>
  `${n(v)} ${v === 1 ? one : many}`
const ALL = '\u0000every'
/** how many of every model a large maker draws before its one press for the rest, and the
 *  most a maker draws whole (Formosa 39, Stabicraft 37; Highfield 67 and Stacer 91 are cut) */
const FIRST_DRAWN = 24
const WHOLE_UP_TO = 40
/** the models filed under no series, whose key is '' — a chooser's empty value is no choice */
const NONE = '\u0000none'
const toChoice = (key: string): string => (key === '' ? NONE : key)
const fromChoice = (v: string): string => (v === NONE ? '' : v)

/** "from $15,040", "$9,643", or null where the file carries no figure */
function fromSaid(m: Pick<LineupModel, 'from' | 'to'>): string | null {
  if (m.from === null) return null
  return m.to !== null && m.to !== m.from ? `from ${money(m.from)}` : money(m.from)
}

/** "15 versions in PVC or Hypalon", "1 version" */
function versionsSaid(m: LineupModel): string {
  const v = plural(m.versions, 'version')
  return m.materials.length > 0 ? `${v} in ${m.materials.join(' or ')}` : v
}

export function Lineup({
  page,
  lineup,
  at,
  onAt,
  go,
}: {
  page: PlacePage
  lineup: LineupRead
  at: PlaceAt
  onAt?: (next: PlaceAt) => void
  go?: (href: string) => void
}) {
  const table = page.table
  const name = page.card.name
  const maker = page.quoteWord
  const move = (next: Partial<PlaceAt>) => onAt?.({ ...at, ...next })

  /* the series shown, read against the file's own: an address naming none of them is every model */
  const shown: LineupSeries | null =
    at.series === undefined ? null : (lineup.series.find((s) => s.key === at.series) ?? null)
  const words = (at.find ?? '').trim().toLowerCase().split(/\s+/).filter(Boolean)
  const base = shown ? shown.models : lineup.models
  const found = base.filter((m) => {
    if (words.length === 0) return true
    const hay = `${m.said} ${m.code} ${m.spoken}`.toLowerCase()
    return words.every((w) => hay.includes(w))
  })
  const models = ordered(found, at.sort ?? 'file')
  /* EVERY MODEL OF A LARGE MAKER IS DRAWN TWO DOZEN FIRST, then one press for the rest, so a
     keyboard reaches the plates after the range in a hundred presses, not three hundred. A
     series or a find draws its whole. */
  const drawn =
    shown === null && words.length === 0 && !at.all && models.length > WHOLE_UP_TO
      ? models.slice(0, FIRST_DRAWN)
      : models
  const longest = Math.max(0, ...lineup.models.map((m) => lengthOf(m.measures) ?? 0))

  /* THE BOATS SET SIDE BY SIDE, by their anchor rows, from any series */
  const chosen = (at.compare ?? [])
    .map((k) => lineup.models.find((m) => m.key === k))
    .filter((m): m is LineupModel => m !== undefined)
  /* a refusal belongs to the boats it was said over, and is said on the card whose Compare was
     pressed: a change of the boats takes it away */
  const compareKey = chosen.map((c) => c.key).join(',')
  const [refusal, setRefusal] = useState<{ over: string; at: string; said: string } | null>(null)
  const refused = refusal && refusal.over === compareKey ? refusal : null
  /* the compare is brought into view only when a press opens it, never on a load */
  const [brought, setBrought] = useState(0)
  const toggle = (m: LineupModel): void => {
    const keys = chosen.map((c) => c.key)
    if (keys.includes(m.key)) {
      const rest = keys.filter((k) => k !== m.key)
      move({ compare: rest, ...(rest.length < 2 ? { see: undefined } : {}) })
      return
    }
    if (keys.length >= COMPARE_MOST) {
      setRefusal({
        over: compareKey,
        at: m.key,
        said: `Three boats are set side by side at most. Take one off to add the ${m.said}.`,
      })
      return
    }
    move({ compare: [...keys, m.key] })
  }
  const comparing = at.see === 'compare' && chosen.length >= 2

  /* THE DOCK: stuck under the bar once the page scrolls past where it stands, and LET GO where
     the cards end — a sticky head pushed to its section's end would stand over the last cards
     and the sentence under them, so past the last card it scrolls away with the range */
  const mark = useRef<HTMLSpanElement>(null)
  const end = useRef<HTMLSpanElement>(null)
  const dock = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState(false)
  const [released, setReleased] = useState(false)
  useEffect(() => {
    const top = mark.current
    const foot = end.current
    const head = dock.current
    if (!top || !foot || !head) return
    let frame = 0
    const read = () => {
      frame = 0
      const shell = parseFloat(getComputedStyle(head).getPropertyValue('--shell-inset')) || 0
      const past = foot.getBoundingClientRect().top < shell + head.offsetHeight
      setReleased(past)
      setStuck(!past && top.getBoundingClientRect().top < shell + 1)
    }
    const ask = () => {
      if (frame === 0) frame = requestAnimationFrame(read)
    }
    ask()
    window.addEventListener('scroll', ask, { passive: true })
    window.addEventListener('resize', ask)
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', ask)
      window.removeEventListener('resize', ask)
    }
  }, [])

  /* THE TRAY: in the dock at a desk; at the range's foot in a hand and in a short window, where
     the head is not docked (the window decides which of the two is drawn, places.css) */
  const tray = (where: 'head' | 'foot') => (
    <fieldset className="pl-tray" data-at={where} data-empty={chosen.length === 0 ? '' : undefined}>
      <legend className="pl-unseen">Boats set side by side</legend>
      <span className="pl-tray__head" aria-hidden="true">
        <ScalesIcon /> Compare
      </span>
      {chosen.length === 0 ? (
        <span className="pl-tray__say">Choose two or three boats to set side by side.</span>
      ) : (
        chosen.map((m) => (
          <button
            key={m.key}
            type="button"
            className="pl-tray__chip"
            onClick={() => toggle(m)}
            aria-label={`Take the ${m.said} out of the compare`}
          >
            {m.said}
            <XIcon aria-hidden="true" />
          </button>
        ))
      )}
      {chosen.length === 1 ? (
        <span className="pl-tray__say">Choose one more to set beside it.</span>
      ) : null}
      {chosen.length >= 2 ? (
        <Button
          intent={comparing ? 'secondary' : 'primary'}
          size="sm"
          icon={comparing ? XIcon : ArrowRightIcon}
          onClick={() => {
            if (!comparing) setBrought((b) => b + 1)
            move({ see: comparing ? undefined : 'compare' })
          }}
        >
          {comparing ? 'Close the compare' : `Compare ${chosen.length}`}
        </Button>
      ) : null}
    </fieldset>
  )

  if (!table) return null
  const sheet = `/data/${encodeURIComponent(table.id)}`
  const sheetAt = shown && shown.key !== '' ? `${sheet}?in=${encodeURIComponent(shown.key)}` : sheet
  const quoteOf = (m: LineupModel) =>
    `/quote/new?brand=${encodeURIComponent(table.id)}&model=${encodeURIComponent(m.key)}`
  const tiles = lineup.filesSeries && lineup.series.length > 1
  const few = lineup.series.length <= 7
  const span = shown ? shown.span : lineup.span
  const title = shown ? shown.name : 'Every model'
  const count = shown ? shown.models.length : lineup.models.length
  const rows = comparing ? readCompare(chosen, lineup.rung) : []

  return (
    <section className="pl-range" aria-labelledby="pl-range-title">
      {tiles ? (
        <>
          {few ? (
            <nav
              className="pl-series"
              aria-label={`${maker}’s series`}
              style={{ '--tiles': lineup.series.length + 1 } as CSSProperties}
            >
              <SeriesTile
                label="Every model"
                count={plural(lineup.models.length, 'model')}
                sub={plural(lineup.series.filter((s) => s.key !== '').length, 'series', 'series')}
                from={lineup.span.lo}
                figure={n(lineup.models.length)}
                on={shown === null}
                onSelect={() => move({ series: undefined, find: undefined, all: undefined })}
              />
              {lineup.series.map((s) => (
                <SeriesTile
                  key={s.key || 'none'}
                  label={s.name}
                  count={plural(s.models.length, 'model')}
                  from={s.span.lo}
                  picture={s.picture}
                  on={shown === s}
                  onSelect={() => move({ series: s.key, find: undefined, all: undefined })}
                />
              ))}
            </nav>
          ) : null}
          <div className="pl-chooser" data-always={few ? undefined : ''}>
            <span className="pl-chooser__label" aria-hidden="true">
              Series
            </span>
            <Select<string>
              aria-label={`Which of ${maker}’s series`}
              options={[
                {
                  value: ALL,
                  label: 'Every model',
                  trail: plural(lineup.models.length, 'model'),
                },
                ...lineup.series.map((s) => ({
                  value: toChoice(s.key),
                  label: s.name,
                  trail: plural(s.models.length, 'model'),
                })),
              ]}
              value={shown ? toChoice(shown.key) : ALL}
              onValueChange={(v) =>
                move({
                  series: v === null || v === ALL ? undefined : fromChoice(v),
                  find: undefined,
                  all: undefined,
                })
              }
            />
          </div>
        </>
      ) : null}

      <span ref={mark} className="pl-dock-mark" aria-hidden="true" />
      <div
        ref={dock}
        className="pl-dock"
        data-stuck={stuck ? '' : undefined}
        data-released={released ? '' : undefined}
      >
        <div className="pl-dock__words">
          <h2 className="pl-dock__title" id="pl-range-title">
            {title} <span className="pl-dock__count">{plural(count, 'model')}</span>
          </h2>
          <p className="pl-dock__say">
            {[
              span.lo !== null && span.hi !== null
                ? `${span.lo === span.hi ? money(span.lo) : `from ${money(span.lo)} to ${money(span.hi)}`} at ${lineup.rung}`
                : `No figure at ${lineup.rung}`,
              `${n(span.priced)} of ${n(span.of)} versions priced`,
            ].join(' · ')}
          </p>
        </div>
        <div className="pl-dock__tools">
          <Segmented
            label="Order the models"
            options={[
              { value: 'file', label: 'File order' },
              { value: 'price', label: 'Price' },
              { value: 'length', label: 'Length' },
            ]}
            value={at.sort ?? 'file'}
            onValueChange={(v) => move({ sort: v === 'file' ? undefined : v })}
          />
          <span className="pl-dock__find">
            <Input
              type="search"
              icon={MagnifyingGlassIcon}
              aria-label={`Find a ${maker} model or code`}
              placeholder="Find a model or code"
              value={at.find ?? ''}
              onValueChange={(v) => move({ find: v === '' ? undefined : v })}
            />
          </span>
          <Button
            intent="quiet"
            size="sm"
            icon={DatabaseIcon}
            href={sheetAt}
            onClick={go ? () => go(sheetAt) : undefined}
          >
            {shown && shown.key !== ''
              ? `Open ${shown.name} in the price list`
              : 'Open the price list'}
          </Button>
        </div>
        {tray('head')}
      </div>

      {comparing ? (
        <Compare
          models={chosen}
          rows={rows}
          rung={lineup.rung}
          go={go}
          quoteOf={quoteOf}
          brought={brought}
          dock={dock}
          mark={mark}
        />
      ) : null}

      {shown?.key === '' || (!shown && lineup.unfiled.length > 0 && lineup.filesSeries) ? (
        <p className="pl-note">
          <InfoIcon aria-hidden="true" />
          <span>
            {lineup.unfiled.length === 1
              ? `1 ${maker} model has no series in the price list: ${lineup.unfiled[0]}. It stands under its own heading, so every model counted above is drawn.`
              : `${n(lineup.unfiled.length)} ${maker} models have no series in the price list: ${lineup.unfiled.join(', ')}. They stand under their own heading, so every model counted above is drawn.`}
          </span>
        </p>
      ) : null}

      {/* THE CARDS AND THE FOOT TRAY IN ONE BOX: the tray holds to the window's foot only while
          the cards are in the window, and never floats over the series or the head above them */}
      <div className="pl-deck">
        {models.length === 0 ? (
          <p className="pl-none__say">
            No {title === 'Every model' ? maker : title} model or code holds “{at.find}”.
          </p>
        ) : (
          <ul className="pl-cards" data-sort={at.sort ?? 'file'}>
            {drawn.map((m) => (
              <Card
                key={m.key}
                model={m}
                rung={lineup.rung}
                picked={chosen.some((c) => c.key === m.key)}
                longest={at.sort === 'length' ? longest : 0}
                onCompare={() => toggle(m)}
                refused={refused?.at === m.key ? refused.said : null}
                fits={fitmentOf(m.key)}
                quote={page.quotable ? quoteOf(m) : null}
                go={go}
              />
            ))}
          </ul>
        )}
        {chosen.length > 0 ? tray('foot') : null}
      </div>
      {drawn.length < models.length ? (
        <span className="pl-more">
          <Button intent="secondary" icon={ArrowDownIcon} onClick={() => move({ all: true })}>
            {`Show all ${n(models.length)} models`}
          </Button>
          <span className="pl-more__say">
            {n(drawn.length)} of {n(models.length)} drawn, in the order chosen above. A series above
            shows its whole.
          </span>
        </span>
      ) : null}
      <span ref={end} className="pl-dock-mark" aria-hidden="true" />

      <p className="pl-note">
        <InfoIcon aria-hidden="true" />
        <span>
          What comes standard on each boat is not held yet: it waits on Northside’s Boat Module and
          Factory Options workbooks. Each count above is what the price list makes for that boat
          {lineup.rulesInForce > 0
            ? `; ${plural(lineup.rulesInForce, 'rule')} of Northside’s own may strike some of it, and What fits says which.`
            : '.'}
        </span>
      </p>
      <span className="pl-unseen" aria-live="polite">
        {refused
          ? refused.said
          : words.length > 0
            ? `${plural(models.length, 'model')} of ${name} found`
            : ''}
      </span>
    </section>
  )
}

/* ---------------------------------------------------------- */
/* A series tile                                               */
/* ---------------------------------------------------------- */

function SeriesTile({
  label,
  count,
  sub,
  from,
  picture,
  figure,
  on,
  onSelect,
}: {
  label: string
  count: string
  sub?: string
  from: number | null
  picture?: LineupModel['picture']
  figure?: string
  on: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      className="pl-stile"
      data-ground="plate"
      aria-pressed={on}
      onClick={onSelect}
    >
      <span className="pl-stile__well" data-figure={figure ? '' : undefined}>
        {figure ? (
          <span className="pl-stile__figure">{figure}</span>
        ) : picture ? (
          <Picture
            src={picture.src}
            srcSet={srcSetOf(picture)}
            sizes="160px"
            alt=""
            width={picture.width}
            height={picture.height}
            fit="contain"
          />
        ) : null}
      </span>
      <span className="pl-stile__name">{label}</span>
      <span className="pl-stile__sub">{sub ?? count}</span>
      <span className="pl-stile__sub">{from !== null ? `from ${money(from)}` : 'No figure'}</span>
    </button>
  )
}

/* ---------------------------------------------------------- */
/* A model's card                                              */
/* ---------------------------------------------------------- */

function Card({
  model: m,
  rung,
  picked,
  longest,
  onCompare,
  refused,
  fits,
  quote,
  go,
}: {
  model: LineupModel
  rung: string
  picked: boolean
  longest: number
  onCompare: () => void
  /** the sentence a press of this card's Compare was refused with, or null */
  refused: string | null
  fits: string
  quote: string | null
  go?: (href: string) => void
}) {
  const price = fromSaid(m)
  const length = lengthOf(m.measures)
  const facts = m.facts
  const c = m.carries
  return (
    <li className="pl-card" data-ground="plate" data-picked={picked ? '' : undefined}>
      <div className="pl-card__well" data-type={m.picture ? undefined : ''}>
        {m.picture ? (
          <Picture
            src={m.picture.src}
            srcSet={srcSetOf(m.picture)}
            sizes="(max-width: 639px) 40vw, 320px"
            alt={m.spoken}
            width={m.picture.width}
            height={m.picture.height}
            fit="contain"
            lazy
          />
        ) : (
          <span className="pl-card__type">
            {facts.length ? <b>{facts.length}</b> : null}
            {facts.hp ? <b>{facts.hp}</b> : null}
            <small>No picture of the {m.said} is held</small>
          </span>
        )}
      </div>
      <div className="pl-card__words">
        <div className="pl-card__nameline">
          <h3 className="pl-card__name">{m.said}</h3>
          <span className="pl-card__price">
            {price ? (
              <>
                <b>{price}</b> <small>{rung}</small>
              </>
            ) : (
              <span className="pl-card__gap">
                {m.zeroes > 0 ? `0 at ${rung} in the price list` : `No figure at ${rung}`}
              </span>
            )}
          </span>
        </div>
        <Run
          as="p"
          className="pl-card__sub"
          items={[
            m.code ? (
              <span key="code" className="pl-card__code">
                {m.code}
              </span>
            ) : null,
            versionsSaid(m),
          ]}
        />
        <Run
          as="p"
          className="pl-card__facts"
          items={[
            facts.length,
            facts.people ??
              (facts.peopleUnfiled ? (
                <span key="gap" className="pl-card__gap">
                  people not in the price list
                </span>
              ) : null),
            facts.hp,
          ]}
        />
        {longest > 0 && length !== null ? (
          <span
            className="pl-card__bar"
            aria-hidden="true"
            style={{ inlineSize: `${Math.max(6, (length / longest) * 100)}%` }}
          />
        ) : null}
        <p className="pl-card__rec">
          <EngineIcon aria-hidden="true" />
          <span>
            {c.recommended ? (
              <>
                <b>{c.recommended}</b> recommended
              </>
            ) : c.motors > 0 ? (
              'No motor marked recommended'
            ) : (
              'No motor in the price list for it'
            )}
          </span>
        </p>
        <dl className="pl-card__kit" aria-label={`What the price list makes for the ${m.spoken}`}>
          <div>
            <dt>{c.motors === 1 ? 'motor' : 'motors'}</dt>
            <dd>{n(c.motors)}</dd>
          </div>
          <div>
            <dt>{c.trailers === 1 ? 'trailer' : 'trailers'}</dt>
            <dd>{n(c.trailers)}</dd>
          </div>
          <div>
            <dt>{c.packages === 1 ? 'package' : 'packages'}</dt>
            <dd>{n(c.packages)}</dd>
          </div>
          <div>
            <dt>{c.parts === 1 ? 'part' : 'parts'}</dt>
            <dd>{n(c.parts)}</dd>
          </div>
        </dl>
      </div>
      <div className="pl-card__foot">
        <button
          type="button"
          className="pl-card__cmp"
          aria-pressed={picked}
          aria-label={picked ? `Take the ${m.said} out of the compare` : `Compare the ${m.said}`}
          aria-describedby={refused ? `pl-refused-${m.key}` : undefined}
          onClick={onCompare}
        >
          {picked ? <CheckIcon aria-hidden="true" /> : <PlusIcon aria-hidden="true" />}
          {picked ? 'Comparing' : 'Compare'}
        </button>
        <Button
          intent="quiet"
          size="sm"
          icon={WrenchIcon}
          href={fits}
          onClick={go ? () => go(fits) : undefined}
          aria-label={`What fits the ${m.spoken}`}
        >
          What fits
        </Button>
        {quote ? (
          <Button
            intent="secondary"
            size="sm"
            icon={FilePlusIcon}
            href={quote}
            onClick={go ? () => go(quote) : undefined}
            aria-label={`Quote the ${m.spoken}`}
          >
            Quote it
          </Button>
        ) : null}
      </div>
      {refused ? (
        <p className="pl-card__refused" id={`pl-refused-${m.key}`}>
          <InfoIcon aria-hidden="true" />
          <span>{refused}</span>
        </p>
      ) : null}
    </li>
  )
}

/* ---------------------------------------------------------- */
/* The compare                                                 */
/* ---------------------------------------------------------- */

function readCompare(models: readonly LineupModel[], rung: string): CompareRow[] {
  const all = (f: (m: LineupModel) => string | null) => models.map(f)
  return compareRows([
    { band: 'Price', label: `From, at ${rung}`, cells: all((m) => fromSaid(m)) },
    { band: 'Price', label: 'Versions', cells: all((m) => versionsSaid(m)) },
    {
      band: 'Specifications',
      label: 'Length',
      cells: all((m) => measureSaid('length', m.measures.length)),
    },
    {
      band: 'Specifications',
      label: 'Beam',
      cells: all((m) => measureSaid('beam', m.measures.beam)),
    },
    { band: 'Specifications', label: 'People', cells: all((m) => peopleSaid(m.measures.people)) },
    {
      band: 'Specifications',
      label: 'Max load',
      cells: all((m) => measureSaid('load', m.measures.load)),
    },
    {
      band: 'Specifications',
      label: 'Weight',
      cells: all((m) => measureSaid('weight', m.measures.weight)),
    },
    {
      band: 'Specifications',
      label: 'Fuel',
      cells: all((m) => measureSaid('fuel', m.measures.fuel)),
    },
    {
      band: 'Specifications',
      label: 'Horsepower',
      cells: all((m) => hpSaid(m.measures.minHp, m.measures.maxHp)),
    },
    {
      band: 'Specifications',
      label: 'Shaft',
      cells: all((m) => measureSaid('shaft', m.measures.shaft)),
    },
    {
      band: 'Specifications',
      label: 'Tube',
      cells: all((m) => measureSaid('tube', m.measures.tube)),
    },
    {
      band: 'Specifications',
      label: 'Air chambers',
      cells: all((m) => measureSaid('chambers', m.measures.chambers)),
    },
    {
      band: 'Specifications',
      label: 'Cabins',
      cells: all((m) => measureSaid('cabins', m.measures.cabins)),
    },
    {
      band: 'Specifications',
      label: 'Berths',
      cells: all((m) => measureSaid('berths', m.measures.berths)),
    },
    { band: 'What fits', label: 'Motors', cells: all((m) => n(m.carries.motors)) },
    {
      band: 'What fits',
      label: 'Recommended motor',
      cells: all((m) => m.carries.recommended),
    },
    { band: 'What fits', label: 'Trailers', cells: all((m) => n(m.carries.trailers)) },
    { band: 'What fits', label: 'Packages', cells: all((m) => n(m.carries.packages)) },
    { band: 'What fits', label: 'Parts', cells: all((m) => n(m.carries.parts)) },
  ])
}

function Compare({
  models,
  rows,
  rung,
  go,
  quoteOf,
  brought,
  dock,
  mark,
}: {
  models: readonly LineupModel[]
  rows: readonly CompareRow[]
  rung: string
  go?: (href: string) => void
  quoteOf: (m: LineupModel) => string
  /** how many times a press has opened the compare; 0 where the address opened it */
  brought: number
  dock: RefObject<HTMLDivElement | null>
  mark: RefObject<HTMLSpanElement | null>
}) {
  const [lit, setLit] = useState(true)
  const bands = useMemo(() => [...new Set(rows.map((r) => r.band))], [rows])
  const same = rows.filter((r) => !r.differs).length
  /* OPENED BY A PRESS, IT IS BROUGHT INTO VIEW. Where the head docks, the page comes to rest with
     the head just docked and the compare straight under it: the dock's own ground then covers
     the window above it to its edge, so the series tiles never stand half under the bar with
     their words through it (verify-1, gap 7, measured at 1280 and 1440). Where it does not dock
     (a hand, a short window) the compare's own top comes to the window's top. Opened from an
     address, the page is left where it loads. */
  const here = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = here.current
    if (!el || brought === 0) return
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? true
    const behavior: ScrollBehavior = still ? 'auto' : 'smooth'
    const head = dock.current
    const top = mark.current
    /* asked of the window, not of the dock's state: pressed from the range's foot, the head is
       let go (static) for the moment, yet it docks again once the page comes up to the compare
       (verify-2, gap 1: the tiles under the bar at 1280 and 1440) */
    if (head && top && getComputedStyle(head).getPropertyValue('--docks').trim() === '1') {
      const shell = parseFloat(getComputedStyle(head).getPropertyValue('--shell-inset')) || 0
      /* two pixels past where the head docks, so it is docked */
      window.scrollTo({
        top: window.scrollY + top.getBoundingClientRect().top - shell + 2,
        behavior,
      })
      return
    }
    el.scrollIntoView({ block: 'start', behavior })
  }, [brought, dock, mark])
  return (
    <section
      ref={here}
      className="pl-compare"
      data-ground="plate"
      aria-labelledby="pl-compare-title"
      data-lit={lit ? '' : undefined}
      style={{ '--cols': models.length } as CSSProperties}
    >
      <div className="pl-compare__head">
        <h3 className="pl-compare__title" id="pl-compare-title">
          {models
            .map((m) => m.said)
            .join(', ')
            .replace(/, ([^,]*)$/, ' and $1')}
          , side by side
        </h3>
        <Toggle label="Light what differs" checked={lit} onCheckedChange={setLit} />
      </div>
      <table className="pl-compare__table">
        <thead>
          <tr>
            <th scope="col" className="pl-compare__corner">
              <span className="pl-unseen">What is set side by side</span>
            </th>
            {models.map((m) => (
              <th key={m.key} scope="col" className="pl-compare__boat">
                <span className="pl-compare__shot">
                  {m.picture ? (
                    <Picture
                      src={m.picture.src}
                      srcSet={srcSetOf(m.picture)}
                      sizes="200px"
                      alt=""
                      width={m.picture.width}
                      height={m.picture.height}
                      fit="contain"
                    />
                  ) : null}
                </span>
                <span className="pl-compare__name">{m.said}</span>
                <span className="pl-compare__acts">
                  <Button
                    intent="quiet"
                    size="sm"
                    icon={WrenchIcon}
                    href={fitmentOf(m.key)}
                    onClick={go ? () => go(fitmentOf(m.key)) : undefined}
                    aria-label={`What fits the ${m.spoken}`}
                  >
                    What fits
                  </Button>
                  <Button
                    intent="secondary"
                    size="sm"
                    icon={FilePlusIcon}
                    href={quoteOf(m)}
                    onClick={go ? () => go(quoteOf(m)) : undefined}
                    aria-label={`Quote the ${m.spoken}`}
                  >
                    Quote
                  </Button>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        {bands.map((band) => (
          <tbody key={band}>
            <tr className="pl-compare__band">
              <th scope="colgroup" colSpan={models.length + 1}>
                {band}
              </th>
            </tr>
            {rows
              .filter((r) => r.band === band)
              .map((r) => (
                <tr key={r.label} data-differs={r.differs ? '' : undefined}>
                  <th scope="row">{r.label}</th>
                  {r.cells.map((cell, i) => (
                    <td key={models[i]?.key ?? i}>{cell}</td>
                  ))}
                </tr>
              ))}
          </tbody>
        ))}
      </table>
      <p className="pl-compare__say">
        {same === 0
          ? `Every measure differs between them. A dash is a cell the price list leaves empty.`
          : `${plural(same, 'measure')} of ${n(rows.length)} read the same for all ${models.length}, as the price list gives them. A dash is a cell it leaves empty. Every figure is at ${rung}.`}
      </p>
    </section>
  )
}
