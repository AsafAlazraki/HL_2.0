import { useMemo } from 'react'
import { DatabaseIcon } from '@phosphor-icons/react'
import { Button, Chip, Tile } from '@/ui'
import { pictures } from '@/data/pictures'
import { placeFilters } from '@/domain/modules/places'
import { countBoats } from '@/domain/quote/boats'
import { useCatalogue } from '@/app/useStores'
import { Hero, Mark, markIsArt } from './Livery'
import { kindWord, readPlaces, runsOf, type PlaceCard } from './read'
import './places.css'

/* ============================================================
   PLACES — the register of the BUSINESS (Milestone 4), direction A,
   "The livery", of docs/directions/places-boards/ (owner 8 · dealer 7
   · design 7).

   WHAT ONLY THIS SCREEN DOES. /data is the register of the FILE: white
   plates over a ledger, what the price list holds. This is the register
   of the business: every place Northside sells from, each a card on
   its OWN coloured ground, its mark the showpiece — "I want the logo
   to be the showpiece thing" — and a boat maker's card carrying one of
   its own boats on the water, captioned with the model it shows. It is
   the only screen in the app that is a wall of saturated colour, and
   the only one where a place is a record Northside dresses (its line,
   mark, photograph and colour, set on the place's own page).

   WHAT THE VERDICT ASKED, DONE. Every figure on a card is the figure /data
   prints for the same list (`holdsSay`, livery.ts) — Parts &
   Accessories 2,937, not the board's 2,238 — and what is no longer
   sold is said beside it as its own clause from the same census.

   DAY ONE IS THE TRUE STATE. No place has a line, so none prints; the
   marks are the makers' own, a plate where only their own colours are
   shipped, the name set in type where none is (REDCO / Tinka, NSM
   Custom); the photographs are each maker's own boats; the grounds are
   each kind's ink until Northside picks.

   HOW IT REFLOWS (written into places.css's head, measured there).
   ============================================================ */

export interface PlacesProps {
  /** the kind the chips have narrowed to, or 'all' */
  kind: string
  onKind?: (kind: string) => void
  /** open one place, by its address */
  open?: (address: string) => void
  openTheFile?: () => void
}

const n = (v: number): string => v.toLocaleString('en-AU')

export function Places({ kind, onKind, open, openTheFile }: PlacesProps) {
  const status = useCatalogue((s) => s.status)
  const problem = useCatalogue((s) => s.problem)
  const tables = useCatalogue((s) => s.tables)
  const rows = useCatalogue((s) => s.rows)
  const modules = useCatalogue((s) => s.modules)
  const priceLevels = useCatalogue((s) => s.priceLevels)
  const business = useCatalogue((s) => s.business)

  const looking = (status === 'empty' || status === 'loading') && problem === null
  const filed = status === 'ready' && Object.keys(tables).length > 0

  const read = useMemo(
    () => (filed ? readPlaces({ tables, rows, modules, priceLevels }, pictures()) : null),
    [filed, tables, rows, modules, priceLevels],
  )
  const cards = useMemo(() => read?.cards ?? [], [read])
  /* THE CHIPS IN THE RUNS' OWN ORDER — Northside's, the order the cards stand in below — with
     All first, rather than the model's list of kinds */
  const chips = useMemo(() => {
    const order = runsOf(cards).map((r) => r.kind as string)
    return placeFilters(cards.map((c) => c.place)).toSorted(
      (a, b) => (a.kind ? order.indexOf(a.kind) : -1) - (b.kind ? order.indexOf(b.kind) : -1),
    )
  }, [cards])
  const wanted = chips.some((c) => c.key === kind) ? kind : 'all'
  const runs = useMemo(
    () => runsOf(wanted === 'all' ? cards : cards.filter((c) => c.kind === wanted)),
    [cards, wanted],
  )
  const boats = useMemo(() => {
    if (!filed) return null
    const counted = countBoats(tables, rows)
    const boatCards = cards.filter((c) => c.kind === 'boat' && !c.place.retired)
    const photographs = boatCards.reduce((s, c) => s + c.photographs, 0)
    const bare = boatCards.filter((c) => c.photographs === 0).map((c) => c.name)
    return { ...counted, photographs, pictured: boatCards.length - bare.length, bare }
  }, [filed, tables, rows, cards])

  const who = business?.trim() || 'the business'

  return (
    <main
      className="pl"
      data-testid="places"
      data-read={!looking ? '' : undefined}
      aria-busy={looking || undefined}
    >
      <header className="pl-head">
        <div className="pl-head__words">
          <h1 className="pl-head__title">Places</h1>
          <p className="pl-head__say">
            Every maker and list {who} sells from, each on its own colour. Open one to give it its
            line, mark, photograph and colour.
          </p>
        </div>
        {chips.length > 1 ? (
          <nav className="pl-kinds" aria-label="Show one kind of place">
            {chips.map((chip) => (
              <Chip
                key={chip.key}
                count={chip.count}
                selected={chip.key === wanted}
                onSelect={() => onKind?.(chip.key)}
              >
                {chip.kind ? kindWord(chip.kind) : chip.label}
              </Chip>
            ))}
          </nav>
        ) : null}
      </header>

      {looking ? (
        <output className="pl-quiet">Reading the price list…</output>
      ) : !filed ? (
        <div className="pl-none">
          <p className="pl-none__say">
            {problem ??
              'No price list is open on this computer, so there are no places to show. Open the Master Price File and every maker and list in it is a place here.'}
          </p>
          {openTheFile ? (
            <Button intent="primary" icon={DatabaseIcon} onClick={openTheFile}>
              Open the Master Price File
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="pl-runs">
          {runs.map((run) => (
            <section
              key={run.kind}
              className="pl-run"
              data-kind={run.kind}
              data-size={run.kind === 'boat' ? 'large' : 'small'}
              aria-labelledby={`pl-run-${run.kind}`}
            >
              <h2 className="pl-run__head" id={`pl-run-${run.kind}`}>
                <span className="pl-tick" data-kind={run.kind} aria-hidden="true" />
                {run.word}
              </h2>
              <ul className="pl-cards">
                {run.cards.map((card) => (
                  <PlaceCardView
                    key={card.address}
                    card={card}
                    large={run.kind === 'boat'}
                    open={open}
                  />
                ))}
                {run.kind === 'boat' && boats ? (
                  <li className="pl-sum">
                    <span className="pl-sum__eyebrow">The boats, counted</span>
                    <span className="pl-sum__figure">{n(boats.boats)} models</span>
                    <span className="pl-sum__say">
                      {n(boats.photographs)} photographs on the water, of {n(boats.pictured)}{' '}
                      {boats.pictured === 1 ? 'maker' : 'makers'}.
                    </span>
                    {boats.bare.length > 0 ? (
                      <span className="pl-sum__note">
                        {boats.bare.join(' and ')} {boats.bare.length === 1 ? 'has' : 'have'} no
                        photograph on the water yet, so{' '}
                        {boats.bare.length === 1 ? 'its card stands' : 'their cards stand'} on
                        colour alone.
                      </span>
                    ) : null}
                  </li>
                ) : null}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  )
}

/** "18 photographs on the water", said for a boat maker only. */
function photographsSay(card: PlaceCard): string | null {
  if (card.kind !== 'boat' || card.place.retired) return null
  if (card.photographs === 0) return 'No photograph on the water yet'
  return `${n(card.photographs)} on the water`
}

function PlaceCardView({
  card,
  large,
  open,
}: {
  card: PlaceCard
  large: boolean
  open?: (address: string) => void
}) {
  const more = [card.figure.held, photographsSay(card)].filter((s): s is string => s !== null)
  const said = [card.name, card.line, card.figure.holds, ...more].filter(Boolean).join(' · ')
  return (
    <li
      className="pl-card"
      data-size={large ? 'large' : 'small'}
      data-livery={card.ground.key}
      data-hero={large && card.hero.shown ? '' : undefined}
      data-place={card.address}
    >
      <Tile tone="livery" onSelect={() => open?.(card.address)} label={said}>
        <span className="pl-card__in">
          {large ? <Hero hero={card.hero} sizes="(max-width: 639px) 60vw, 360px" /> : null}
          <span className="pl-card__face">
            <Mark mark={card.mark} name={card.name} size={large ? 'card' : 'small'} />
            {markIsArt(card.mark) ? (
              <span className={card.nameShown ? 'pl-card__name' : 'pl-unseen'}>{card.name}</span>
            ) : null}
            {card.line ? <span className="pl-card__line">{card.line}</span> : null}
            <span className="pl-card__facts">{card.figure.holds}</span>
            {more.length > 0 ? <span className="pl-card__more">{more.join(' · ')}</span> : null}
          </span>
        </span>
      </Tile>
    </li>
  )
}
