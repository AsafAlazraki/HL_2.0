/* ============================================================
   WHAT FITS ONE BOAT — direction A of the fit flow, "Two doors, one
   page" (docs/directions/fit-flow/, picked 2026-11-05).

   ONE PAGE, READ TOP TO BOTTOM, NOTHING HIDDEN BEHIND A PRESS. The head
   carries the model, its version, its price and its photograph; the row
   under it what the boat takes; then Motor, Trailer and Fit-out, each
   with its choices, what is named for the boat but not listed for it,
   and why the rest do not go on it, counted. A bar fixed at the window's
   foot says the quote these choices start, with Start the quote.

   TWO JOBS, TWO MODES. Choosing for a quote is never beside changing
   what Northside offers: "Change what Northside offers" turns the same
   page into change mode (`?change=1`) under an ochre band that names
   every version a change reaches, and its own bar keeps the changes
   made here with Undo it. A line taken off stays where it was, tagged.

   Every sentence of a reason, every count and every figure is read in
   `@/domain/fitment` (`page.ts`, `plate.ts`, `rigged.ts`); this file
   draws them.
   ============================================================ */
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react'
import {
  ArrowCounterClockwiseIcon,
  CheckIcon,
  MinusCircleIcon,
  NotePencilIcon,
  PlusCircleIcon,
  ReceiptIcon,
  StarIcon,
  WarningIcon,
} from '@phosphor-icons/react'
import { Button, ExpandPicture, Icon, Picture, PriceFigure, Select } from '@/ui'
import { pricesOf } from '@/app/ways'
import { copyOf, itemOf, pictureOf, placeIn, srcSetOf } from '@/data/pictures'
import { useGallery } from '@/app/optionPicture'
import { RowGallery } from '@/app/RowGallery'
import type { CatalogueCtx } from '@/domain/model'
import {
  offeredIn,
  refusedByRule,
  type BoatFit,
  type Made,
  type Place,
  type TrailerMade,
} from '@/domain/fitment/boat'
import {
  heldBack,
  loadOf,
  motorTiles,
  towOf,
  type HeldBack,
  type HeldShare,
} from '@/domain/fitment/plate'
import {
  boatFacts,
  retiredKitsSaid,
  riggedOf,
  type Pick,
  type Rigged,
} from '@/domain/fitment/rigged'
import { versionSaid, type BoatVersions } from '@/domain/fitment/versions'
import { atmRefusal, overAtm } from '@/domain/fitment/atm'
import { gridOf } from '@/domain/fitment/rows'
import {
  canPutOnOf,
  changesOn,
  decidesSaid,
  modelWordsOf,
  namedForOf,
  quoteStartOf,
  quoteStartSaid,
  takenOffOf,
  takenOffSaid,
  type ModelWords,
  type PageLine,
  type TakenOff,
} from '@/domain/fitment/page'
import { useFitChange, type FitAct, type FitRefusal, type Made as Change } from './useFitChange'

const AU = new Intl.NumberFormat('en-AU')
const count = (n: number): string => AU.format(n)

/** Where the page was reached from, as its crumb says it. */
export type From = 'home' | 'data' | ''

export type At = 'motor' | 'trailer' | 'fitout' | ''

export interface BoatChoice {
  /** the motor chosen for the quote, by its pairing; 'none'; '' for the recommended */
  motor: string
  /** the trailer chosen for the quote; 'none'; '' for the recommended */
  trailer: string
  /** the fit-out lines ticked for the quote, by their pairing */
  fit: readonly string[]
}

export interface BoatPageProps {
  ctx: CatalogueCtx
  fit: BoatFit
  model: BoatVersions | null
  choice: BoatChoice
  onChoice: (next: Partial<BoatChoice>) => void
  from: From
  at: At
  onAt: (at: At) => void
  changing: boolean
  onChanging: (on: boolean) => void
  onVersion: (rowId: string) => void
  /** Another boat: the finder, or the chooser where no shell stands */
  another: ReactNode
  openHref: (href: string) => void
  start: (boat: Place, picks: readonly Pick[]) => void
  startRefused: string
  /** today, for "Taken off today" */
  today?: Date
}

/** ONE SET OF COLUMNS AT EACH WIDTH (`gridOf`): each thing's span, so no row ends in a blank cell
 *  and nothing stands alone on a row. */
function gridStyle(
  n: number,
  most: { desk: number; mid: number; phone: number },
): { list: CSSProperties; items: CSSProperties[] } {
  const desk = gridOf(n, most.desk)
  const mid = gridOf(n, most.mid)
  const phone = gridOf(n, most.phone)
  return {
    list: {
      '--fp-c-desk': String(desk.columns),
      '--fp-c-mid': String(mid.columns),
      '--fp-c-phone': String(phone.columns),
    } as CSSProperties,
    items: Array.from(
      { length: n },
      (_, i) =>
        ({
          '--fp-s-desk': String(desk.spans[i] ?? 1),
          '--fp-s-mid': String(mid.spans[i] ?? 1),
          '--fp-s-phone': String(phone.spans[i] ?? 1),
        }) as CSSProperties,
    ),
  }
}

const plural = (n: number, one: string, many: string): string =>
  `${count(n)} ${n === 1 ? one : many}`

/** The order a list keeps on the price list, so a line changed in change mode never moves. */
function orderIn(ctx: CatalogueCtx): (place: Place) => number {
  const at = new Map<string, number>()
  return (place) => {
    const key = place.tableId
    if (!at.has(`${key}:`)) {
      at.set(`${key}:`, 0)
      ;(ctx.rowsByEntity[key] ?? []).forEach((r, i) => at.set(`${key}:${r.id}`, i))
    }
    return at.get(`${key}:${place.rowId}`) ?? Number.MAX_SAFE_INTEGER
  }
}

export function BoatPage({
  ctx,
  fit,
  model,
  choice,
  onChoice,
  from,
  at,
  onAt,
  changing,
  onChanging,
  onVersion,
  another,
  openHref,
  start,
  startRefused,
  today,
}: BoatPageProps) {
  const maker = model?.versions[0]?.maker ?? fit.trailer?.maker ?? ''
  const words = modelWordsOf(fit, model?.name ?? fit.name, maker)
  const versions = useMemo(
    () => (model ? model.versions.map((v) => v.place) : [fit.place]),
    [model, fit.place],
  )

  /* WHAT THE PAGE SAYS ON ITS OWN, AND THE REASONS WITHOUT IT */
  const taken = useMemo(() => takenOffOf(ctx, fit), [ctx, fit])
  const named = useMemo(
    () => namedForOf(ctx, fit, words.code, taken),
    [ctx, fit, words.code, taken],
  )
  const apart = useMemo(
    () => new Set([...taken, ...named].map((l) => l.place.rowId)),
    [taken, named],
  )
  const motorHeld = useMemo(() => heldBack(ctx, fit, 'motor', apart), [ctx, fit, apart])
  const trailerHeld = useMemo(() => heldBack(ctx, fit, 'trailer', apart), [ctx, fit, apart])

  /* THE CHOICES FOR THE QUOTE */
  const rigs = useMemo(() => riggedOf(ctx, fit).filter((r) => !refusedByRule(r.motor)), [ctx, fit])
  const motorPick: Rigged | null =
    choice.motor === 'none'
      ? null
      : (rigs.find((r) => r.key === choice.motor) ?? rigs.find((r) => r.motor.starred) ?? null)
  const trailers = useMemo(() => {
    const t = fit.trailer
    if (!t) return []
    return offeredIn(t.made).toSorted(
      (a, b) =>
        t.lists.findIndex((l) => l.tableId === a.place.tableId) -
          t.lists.findIndex((l) => l.tableId === b.place.tableId) || a.at - b.at,
    )
  }, [fit])
  const over = useMemo(
    () => new Map(trailers.map((t) => [t.key, atmRefusal(ctx, fit, t, 'quote')])),
    [ctx, fit, trailers],
  )
  const trailerPick: TrailerMade | null =
    choice.trailer === 'none'
      ? null
      : (trailers.find((t) => t.key === choice.trailer && over.get(t.key) === '') ??
        trailers.find((t) => t.crosses && over.get(t.key) === '') ??
        null)
  const lists = fit.lists.filter((l) => l.live > 0)
  const ticked = new Set(choice.fit)
  const fitOut: Array<{ tableId: string; made: Made }> = lists.flatMap((l) =>
    offeredIn(l.made)
      .filter((m) => ticked.has(m.key))
      .map((m) => ({ tableId: l.tableId, made: m })),
  )

  const quote = quoteStartOf(
    { name: words.name, price: fit.price },
    motorPick,
    trailerPick,
    fitOut.map((f) => f.made),
  )
  const picks: Pick[] = [
    ...(motorPick ? [{ tableId: motorPick.motor.place.tableId, key: motorPick.key }] : []),
    ...(motorPick?.kit && !motorPick.kit.retired
      ? [
          {
            tableId: motorPick.kit.place.tableId,
            key: motorPick.key,
            rowId: motorPick.kit.place.rowId,
            pairing: motorPick.motor.pairing,
          },
        ]
      : []),
    ...(trailerPick ? [{ tableId: trailerPick.place.tableId, key: trailerPick.key }] : []),
    ...fitOut.map((f) => ({ tableId: f.tableId, key: f.made.key })),
  ]

  /* CHANGE MODE'S ONE HOOK: every press there, its refusal, and the changes made here */
  const { change, refusal, refuse, ledger, undoLast, undone } = useFitChange(
    ctx,
    fit,
    versions,
    words.name,
  )

  /* A PLACE ASKED FOR IN THE ADDRESS IS SCROLLED TO, once, on arrival (`?at=motor`, the build's
     "What fits" lands on the motors) */
  const arrived = useRef(false)
  useEffect(() => {
    if (arrived.current) return
    arrived.current = true
    if (at === '') return
    document.getElementById(`fp-${at}`)?.scrollIntoView({ block: 'start' })
  }, [at])

  /* THE ROOM UNDER THE LAST LINE IS THE BAR'S OWN HEIGHT, measured: its names wrap to two lines
     at 834 and one at 1440, so a figure written into the stylesheet left the last press under the
     bar at one size or a band of empty page at another (the overlap ruler, 2026-11-05) */
  const bar = useRef<HTMLElement>(null)
  const room = useRoomUnder(bar)

  const motorMaker = motorTiles(ctx, fit)?.maker ?? ''
  const fitOutOffered = lists.reduce((n, l) => n + offeredIn(l.made).length, 0)

  return (
    <div className="fp" data-changing={changing ? '' : undefined}>
      <div className="fp-crumb">
        <p className="fp-crumb__trail">
          {from === 'home' ? (
            <a className="fp-crumb__link" href="/" onClick={(e) => go(e, '/', openHref)}>
              Home
            </a>
          ) : (
            <a className="fp-crumb__link" href="/data" onClick={(e) => go(e, '/data', openHref)}>
              Data
            </a>
          )}
          <span className="fp-crumb__sep" aria-hidden="true">
            ›
          </span>
          <span>What fits</span>
        </p>
        <span className="fp-crumb__another">{another}</span>
      </div>

      <Head fit={fit} model={model} words={words} onVersion={onVersion} />
      <Takes ctx={ctx} fit={fit} />

      {changing ? (
        <ChangeBand words={words} versions={versions.length} onDone={() => onChanging(false)} />
      ) : (
        <nav className="fp-jump" aria-label="Places on this page">
          {fit.motor ? (
            <JumpTo to="motor" onAt={onAt}>
              <span className="fp-jump__word">Motor</span>
              <span className="fp-jump__n">{`${count(rigs.length)} go on it`}</span>
            </JumpTo>
          ) : null}
          {fit.trailer ? (
            <JumpTo to="trailer" onAt={onAt}>
              <span className="fp-jump__word">Trailer</span>
              <span className="fp-jump__n">
                {trailers.length === 0 ? 'none listed' : `${count(trailers.length)} listed`}
              </span>
            </JumpTo>
          ) : null}
          {lists.length > 0 ? (
            <JumpTo to="fitout" onAt={onAt}>
              <span className="fp-jump__word">Fit-out</span>
              <span className="fp-jump__n">{`${count(fitOutOffered)} go on it`}</span>
            </JumpTo>
          ) : null}
        </nav>
      )}

      {changing ? (
        <ChangePlaces
          ctx={ctx}
          fit={fit}
          words={words}
          rigs={rigs}
          trailers={trailers}
          taken={taken}
          named={named}
          motorMaker={motorMaker}
          change={change}
          refuse={refuse}
          refusal={refusal}
          today={today ?? new Date()}
        />
      ) : (
        <>
          {fit.motor ? (
            <MotorPlace
              words={words}
              rigs={rigs}
              motorMaker={motorMaker}
              chosen={motorPick?.key ?? null}
              onChoose={(key) => onChoice({ motor: key })}
              held={motorHeld}
              taken={taken.filter((t) => t.slot === 'motor')}
              openHref={openHref}
            />
          ) : null}
          {fit.trailer ? (
            <TrailerPlace
              ctx={ctx}
              fit={fit}
              words={words}
              trailers={trailers}
              over={over}
              chosen={trailerPick?.key ?? null}
              onChoose={(key) => onChoice({ trailer: key })}
              held={trailerHeld}
              taken={taken.filter((t) => t.slot === 'trailer')}
              named={named.filter((n) => n.slot === 'trailer')}
            />
          ) : null}
          {lists.length > 0 ? (
            <FitOutPlace
              words={words}
              lists={lists}
              ticked={ticked}
              onTick={(key, on) =>
                onChoice({
                  fit: on ? [...choice.fit, key] : choice.fit.filter((k) => k !== key),
                })
              }
              taken={taken.filter((t) => t.slot !== 'motor' && t.slot !== 'trailer')}
              named={named.filter((n) => n.slot !== 'trailer')}
              openHref={openHref}
            />
          ) : null}
          <div className="fp-decides">
            <p className="fp-decides__say">{decidesSaid(fit.rulesInForce, changesOn(ctx, fit))}</p>
            <span className="fp-decides__act">
              <Button intent="secondary" icon={NotePencilIcon} onClick={() => onChanging(true)}>
                Change what Northside offers
              </Button>
            </span>
          </div>
        </>
      )}

      {changing ? (
        <Ledger
          anchor={bar}
          words={words}
          ledger={ledger}
          undone={undone}
          onUndo={undoLast}
          onDone={() => onChanging(false)}
        />
      ) : (
        <QuoteBar
          anchor={bar}
          quote={quote}
          priceName={fit.priceName}
          retired={fit.retired}
          onStart={() => start(fit.place, picks)}
          refused={startRefused}
        />
      )}
      <div
        className="fp-room"
        aria-hidden="true"
        style={room === null ? undefined : { blockSize: `${room}px` }}
      />
    </div>
  )
}

/** How far the bar's top stands from the window's foot, and some air: what the page keeps under
 *  its last line so it scrolls clear of the bar. Null until measured. */
function useRoomUnder(bar: RefObject<HTMLElement | null>): number | null {
  const [room, setRoom] = useState<number | null>(null)
  useLayoutEffect(() => {
    const el = bar.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const measure = (): void => {
      const top = el.getBoundingClientRect().top
      setRoom(Math.max(0, Math.ceil(window.innerHeight - top)) + 24)
    }
    measure()
    const seen = new ResizeObserver(measure)
    seen.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      seen.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [bar])
  return room
}

/** a plain click on a link the router follows; any other click is the browser's */
function go(
  e: React.MouseEvent<HTMLAnchorElement>,
  href: string,
  openHref: (href: string) => void,
) {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  e.preventDefault()
  openHref(href)
}

/* ---------------------------------------------------------- */
/* The head: the model, its version, its price, its photograph */
/* ---------------------------------------------------------- */

function Head({
  fit,
  model,
  words,
  onVersion,
}: {
  fit: BoatFit
  model: BoatVersions | null
  words: ModelWords
  onVersion: (rowId: string) => void
}) {
  /* THE BOAT'S OWN PHOTOGRAPH — the price list's picture for this very finish, then the one
     picture reader's answer for this boat; the cover Northside chose wins over both. Never a
     stand-in: a boat with no picture has no photograph, and the head closes to its words. */
  const item = itemOf(fit.place.tableId, fit.place.rowId, fit.imageAddress)
  const shown = copyOf(item) ?? pictureOf(item)
  const gallery = useGallery(item)
  const [large, setLarge] = useState<number | null>(null)
  const many = model !== null && model.versions.length > 1
  const version = model?.versions.find((v) => v.place.rowId === fit.place.rowId) ?? null
  const kicker = [fit.trailer?.maker ?? model?.versions[0]?.maker ?? '', ...fit.path.slice(0, -1)]
    .filter((s) => s !== '')
    .join(' · ')
  return (
    <header className="fp-head" data-picture={shown ? '' : undefined}>
      <div className="fp-head__words">
        {kicker === '' ? null : <p className="fp-kicker">{kicker}</p>}
        <h1 className="fp-title" id="fp-name">
          {words.name}
        </h1>
        {many && model ? (
          <div className="fp-version">
            <span className="fp-version__pick">
              <Select
                aria-label={`Which version of the ${words.name}, of ${count(model.versions.length)}`}
                options={model.versions.map((v) => ({
                  value: v.place.rowId,
                  label: versionSaid(model, v),
                }))}
                value={fit.place.rowId}
                onValueChange={(next) => {
                  if (next && next !== fit.place.rowId) onVersion(next)
                }}
              />
            </span>
            <span className="fp-version__of">
              {`version ${count(model.at + 1)} of ${count(model.versions.length)}`}
            </span>
          </div>
        ) : version || fit.detail !== '' ? (
          <p className="fp-version__one">{version ? versionSaid(model!, version) : fit.detail}</p>
        ) : null}
        <p className="fp-price">
          {fit.price === null ? (
            <span>No price on the price list</span>
          ) : (
            <>
              <span className="fp-price__fig">
                <PriceFigure amount={fit.price} size="lg" />
              </span>
              <span className="fp-price__at">
                {fit.priceName === '' ? '' : `at ${fit.priceName}`}
              </span>
            </>
          )}
          {fit.code === '' ? null : <span className="fp-price__code">{fit.code}</span>}
        </p>
        {fit.retired ? <p className="fp-retired">No longer sold.</p> : null}
      </div>
      {shown ? (
        <figure
          className="fp-photo"
          style={{ ['--fp-shape' as string]: `${shown.width} / ${shown.height}` }}
        >
          <Picture
            src={shown.src}
            srcSet={srcSetOf(shown)}
            sizes="(min-width: 900px) 420px, 100vw"
            alt={`The ${words.name}${fit.detail === '' ? '' : `, ${fit.detail}`}`}
            width={shown.width}
            height={shown.height}
            fit="contain"
            priority
          />
          <span className="fp-photo__acts" data-ground="plate">
            {gallery.length > 1 ? (
              <span className="fp-photo__many">{`${count(gallery.length)} pictures`}</span>
            ) : null}
            <ExpandPicture
              label={
                gallery.length > 1
                  ? `See the ${words.name}’s ${gallery.length} pictures larger`
                  : `See the ${words.name} larger`
              }
              onExpand={() => setLarge(placeIn(gallery, shown))}
            />
          </span>
        </figure>
      ) : null}
      <RowGallery item={item} name={words.name} kind="boat" at={large} onAt={setLarge} />
    </header>
  )
}

/** WHAT THE BOAT TAKES, in one row: its horsepower first, then its own figures. */
function Takes({ ctx, fit }: { ctx: CatalogueCtx; fit: BoatFit }) {
  const facts = boatFacts(ctx, fit.place)
  const motor = fit.motor
  const single = motor?.envelope?.rigs.length === 1 && motor.envelope.rigs[0]!.count === 1
  const cells = [
    ...(motor && motor.takes !== ''
      ? [{ label: 'Motor', value: motor.takes, sub: single ? 'one motor' : '' }]
      : []),
    ...facts.map((f) => ({ label: f.label, value: f.value, sub: '' })),
  ]
  if (cells.length === 0) return null
  const grid = gridStyle(cells.length, { desk: cells.length, mid: 4, phone: 3 })
  return (
    <dl
      className="fp-takes"
      style={grid.list}
      aria-label="What the boat takes, and its own figures"
    >
      {cells.map((c, i) => (
        <div key={c.label} className="fp-takes__one" style={grid.items[i]}>
          <dt className="fp-takes__label">{c.label}</dt>
          <dd className="fp-takes__value">
            {c.value}
            {c.sub === '' ? null : <span className="fp-takes__sub">{c.sub}</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function JumpTo({ to, onAt, children }: { to: At; onAt: (at: At) => void; children: ReactNode }) {
  return (
    <a
      className="fp-jump__to"
      href={`#fp-${to}`}
      onClick={(e) => {
        e.preventDefault()
        onAt(to)
        const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? true
        document
          .getElementById(`fp-${to}`)
          ?.scrollIntoView({ block: 'start', behavior: still ? 'auto' : 'smooth' })
      }}
    >
      {children}
    </a>
  )
}

/* ---------------------------------------------------------- */
/* A place: its title column and its body                      */
/* ---------------------------------------------------------- */

function Place({
  id,
  title,
  lead,
  children,
}: {
  id: Exclude<At, ''>
  title: string
  lead: string
  children: ReactNode
}) {
  return (
    <section className="fp-place" id={`fp-${id}`} aria-labelledby={`fp-${id}-title`}>
      <div className="fp-place__head">
        <h2 className="fp-place__title" id={`fp-${id}-title`}>
          {title}
        </h2>
        <p className="fp-place__lead">{lead}</p>
      </div>
      <div className="fp-place__body">{children}</div>
    </section>
  )
}

/** One choice in a radio group or a tick list: the name over its facts, the price at its end. */
function Choice({
  type,
  name,
  group,
  checked,
  onChange,
  title,
  tag,
  facts,
  price,
  state,
  note,
}: {
  type: 'radio' | 'checkbox'
  name: string
  group: string
  checked: boolean
  onChange: (on: boolean) => void
  title: string
  tag?: ReactNode
  facts: string
  price: ReactNode
  state: string
  note?: ReactNode
}) {
  return (
    <li className="fp-line" data-chosen={checked ? '' : undefined}>
      <label className="fp-line__press">
        <input
          className="fp-line__input"
          type={type}
          name={group}
          value={name}
          checked={checked}
          onChange={(e) => onChange(e.currentTarget.checked)}
        />
        <span className="fp-line__mark" aria-hidden="true">
          {checked ? <Icon glyph={CheckIcon} size="sm" /> : null}
        </span>
        <span className="fp-line__words">
          <span className="fp-line__name">
            {title}
            {tag}
          </span>
          {facts === '' ? null : <span className="fp-line__facts">{facts}</span>}
          {note}
        </span>
        <span className="fp-line__end">
          <span className="fp-line__price">{price}</span>
          <span className="fp-line__state">{state}</span>
        </span>
      </label>
    </li>
  )
}

const Recommended = () => (
  <span className="fp-tag" data-tone="star">
    <Icon glyph={StarIcon} weight="fill" size="sm" />
    Recommended
  </span>
)

const priceOf = (p: number | null): ReactNode =>
  p === null ? <span className="fp-none">no price yet</span> : <PriceFigure amount={p} />

/* ---------------------------------------------------------- */
/* Motor                                                       */
/* ---------------------------------------------------------- */

function MotorPlace({
  words,
  rigs,
  motorMaker,
  chosen,
  onChoose,
  held,
  taken,
  openHref,
}: {
  words: ModelWords
  rigs: Rigged[]
  motorMaker: string
  chosen: string | null
  onChoose: (key: string) => void
  held: HeldBack
  taken: TakenOff[]
  openHref: (href: string) => void
}) {
  const many = `${motorMaker}s`.trim()
  const lead =
    rigs.length === 0
      ? `No ${motorMaker} on the price list is listed for the ${words.short}.`
      : `${plural(rigs.length, motorMaker, many)} ${rigs.length === 1 ? 'goes' : 'go'} on it. Choose the one for the quote.`
  const unchosenKit = rigs.find((r) => r.kit?.unchosen)?.kit ?? null
  const retired = retiredKitsSaid(rigs)
  return (
    <Place id="motor" title="Motor" lead={lead}>
      {rigs.length > 0 ? (
        <ul className="fp-lines" role="radiogroup" aria-label={`The motor for the quote`}>
          {rigs.map((r) => (
            <Choice
              key={r.key}
              type="radio"
              group="fp-motor"
              name={r.key}
              checked={chosen === r.key}
              onChange={() => onChoose(r.key)}
              title={r.motor.name}
              tag={r.motor.starred ? <Recommended /> : null}
              facts={[r.motor.facts, r.kit && !r.kit.retired ? 'with its rigging kit' : '']
                .filter((s) => s !== '')
                .join(' · ')}
              price={priceOf(r.motor.price)}
              state={chosen === r.key ? 'Chosen for the quote' : 'Choose'}
              note={
                r.motor.rule && r.motor.rule.because !== '' ? (
                  <span className="fp-line__rule">{r.motor.rule.because}</span>
                ) : null
              }
            />
          ))}
          <Choice
            type="radio"
            group="fp-motor"
            name="none"
            checked={chosen === null}
            onChange={() => onChoose('none')}
            title="No motor"
            facts="The quote starts with the boat alone."
            price={null}
            state={chosen === null ? 'Chosen for the quote' : 'Choose'}
          />
        </ul>
      ) : null}
      {unchosenKit ? (
        <p className="fp-note">
          <span>
            Each motor comes with its rigging kit. Northside has not set the kit’s price yet, so the
            quote’s total leaves it out.
          </span>
          <a
            className="fp-note__link"
            href={pricesOf(unchosenKit.place.tableId)}
            onClick={(e) => go(e, pricesOf(unchosenKit.place.tableId), openHref)}
          >
            Set it in Prices
          </a>
        </p>
      ) : null}
      {retired === '' ? null : <p className="fp-note">{retired}</p>}
      <Reasons
        title={`Why the other ${plural(held.others + taken.length, motorMaker, many)} do not go on it`}
        held={held}
        taken={taken}
      />
    </Place>
  )
}

/* ---------------------------------------------------------- */
/* Trailer                                                     */
/* ---------------------------------------------------------- */

function TrailerPlace({
  ctx,
  fit,
  words,
  trailers,
  over,
  chosen,
  onChoose,
  held,
  taken,
  named,
}: {
  ctx: CatalogueCtx
  fit: BoatFit
  words: ModelWords
  trailers: TrailerMade[]
  over: Map<string, string>
  chosen: string | null
  onChoose: (key: string) => void
  held: HeldBack
  taken: TakenOff[]
  named: PageLine[]
}) {
  const trailer = fit.trailer!
  const load = useMemo(() => loadOf(ctx, fit), [ctx, fit])
  const lead =
    trailers.length === 0
      ? `No trailer on the price list is listed for the ${words.short}.`
      : `${plural(trailers.length, 'trailer is', 'trailers are')} listed for the ${words.short}. Choose one for the quote.`
  return (
    <Place id="trailer" title="Trailer" lead={lead}>
      {trailers.length > 0 ? (
        <>
          <ul className="fp-lines" role="radiogroup" aria-label="The trailer for the quote">
            {trailers.map((t) => {
              const refused = over.get(t.key) ?? ''
              const tow = towOf(ctx, load, t)
              if (refused !== '') {
                return (
                  <li key={t.key} className="fp-line" data-refused="">
                    <div className="fp-line__press">
                      <span className="fp-line__mark" aria-hidden="true">
                        <Icon glyph={WarningIcon} size="sm" />
                      </span>
                      <span className="fp-line__words">
                        <span className="fp-line__name">{t.name}</span>
                        <span className="fp-line__facts">{tow.says}</span>
                        <span className="fp-line__rule" role="note">
                          {refused}
                        </span>
                      </span>
                      <span className="fp-line__end">
                        <span className="fp-line__price">{priceOf(t.price)}</span>
                      </span>
                    </div>
                  </li>
                )
              }
              return (
                <Choice
                  key={t.key}
                  type="radio"
                  group="fp-trailer"
                  name={t.key}
                  checked={chosen === t.key}
                  onChange={() => onChoose(t.key)}
                  title={t.name}
                  tag={t.starred ? <Recommended /> : null}
                  facts={tow.says}
                  price={priceOf(t.price)}
                  state={chosen === t.key ? 'Chosen for the quote' : 'Choose'}
                  note={
                    t.rule && t.rule.because !== '' ? (
                      <span className="fp-line__rule">{t.rule.because}</span>
                    ) : null
                  }
                />
              )
            })}
            <Choice
              type="radio"
              group="fp-trailer"
              name="none"
              checked={chosen === null}
              onChange={() => onChoose('none')}
              title="No trailer"
              facts="The quote starts without a trailer."
              price={null}
              state={chosen === null ? 'Chosen for the quote' : 'Choose'}
            />
          </ul>
          {trailer.oneTrailer === '' || trailers.length < 2 ? null : (
            <p className="fp-note">{trailer.oneTrailer}</p>
          )}
        </>
      ) : null}
      <NamedFor words={words} named={named} kind="trailer" />
      <Reasons
        title={`Why the other ${plural(held.others + taken.length, 'trailer', 'trailers')} do not go on it`}
        held={held}
        taken={taken}
      />
      {trailer.heldSays === '' ? null : <p className="fp-note">{trailer.heldSays}</p>}
    </Place>
  )
}

/* ---------------------------------------------------------- */
/* Fit-out                                                     */
/* ---------------------------------------------------------- */

function FitOutPlace({
  words,
  lists,
  ticked,
  onTick,
  taken,
  named,
  openHref,
}: {
  words: ModelWords
  lists: BoatFit['lists']
  ticked: ReadonlySet<string>
  onTick: (key: string, on: boolean) => void
  taken: TakenOff[]
  named: PageLine[]
  openHref: (href: string) => void
}) {
  const offered = lists.map((l) => ({ list: l, lines: offeredIn(l.made) }))
  const going = offered.filter((o) => o.lines.length > 0)
  const said = going.map((o) => `${count(o.lines.length)} from ${o.list.name}`)
  const lead =
    going.length === 0
      ? `Nothing in ${lists.map((l) => l.name).join(' or ')} is listed for the ${words.short}.`
      : `${said.length > 1 ? `${said.slice(0, -1).join(', ')} and ${said.at(-1)}` : said[0]} go on it. Tick what goes on the quote.`
  const unchosen = lists.find((l) => l.made.some((m) => m.price === null && m.unchosen !== null))
  const refused = lists.flatMap((l) => l.made.filter(refusedByRule))
  /* the rest of each list, never listed for this boat: its live lines less what is offered, what a
     rule refuses, what is named for the boat and what Northside took off */
  const rest = lists
    .map((l) => ({
      name: l.name,
      n:
        l.live -
        l.made.length -
        named.filter((x) => x.slot === l.tableId).length -
        taken.filter((x) => x.slot === l.tableId).length,
    }))
    .filter((r) => r.n > 0)
  return (
    <Place id="fitout" title="Fit-out" lead={lead}>
      {going.length > 0 ? (
        <ul className="fp-lines" aria-label="The fit-out for the quote">
          {going.flatMap((o) =>
            o.lines.map((m) => (
              <Choice
                key={m.key}
                type="checkbox"
                group={`fp-fit-${o.list.tableId}`}
                name={m.key}
                checked={ticked.has(m.key)}
                onChange={(on) => onTick(m.key, on)}
                title={m.name}
                facts={o.list.name}
                price={priceOf(m.price)}
                state={ticked.has(m.key) ? 'On the quote this starts' : 'Add'}
                note={
                  m.rule && m.rule.because !== '' ? (
                    <span className="fp-line__rule">{m.rule.because}</span>
                  ) : null
                }
              />
            )),
          )}
        </ul>
      ) : null}
      {unchosen ? (
        <p className="fp-note">
          <span>
            {`Northside has not set which of ${unchosen.name}’ figures is the price, so one goes on the quote marked “no price yet”.`}
          </span>
          <a
            className="fp-note__link"
            href={pricesOf(unchosen.tableId)}
            onClick={(e) => go(e, pricesOf(unchosen.tableId), openHref)}
          >
            Set it in Prices
          </a>
        </p>
      ) : null}
      {refused.length > 0 ? (
        <ul className="fp-refused" aria-label="Refused by Northside’s rules">
          {refused.map((m) => (
            <li key={m.key} className="fp-refused__one">
              <span className="fp-line__name">{m.name}</span>
              <span className="fp-line__rule">
                {m.rule?.because === '' || !m.rule
                  ? 'Not offered on this boat, because one of Northside’s rules refuses it.'
                  : m.rule.because}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      <NamedFor words={words} named={named} kind="fit-out" lists={lists} />
      {taken.length > 0 ? (
        <div className="fp-taken">
          <p className="fp-taken__head">
            {`Northside took ${plural(taken.length, 'line', 'lines')} off this boat`}
          </p>
          <p className="fp-taken__names">{taken.map((t) => t.name).join(' · ')}</p>
        </div>
      ) : null}
      {rest.length === 0 ? null : (
        <p className="fp-rest">
          {`The other ${rest.map((r) => `${count(r.n)} in ${r.name}`).join(' and ')} are listed for other boats, or for none.`}
        </p>
      )}
    </Place>
  )
}

/* ---------------------------------------------------------- */
/* Named for it, not listed for it                             */
/* ---------------------------------------------------------- */

function NamedFor({
  words,
  named,
  kind,
  lists = NO_LISTS,
}: {
  words: ModelWords
  named: PageLine[]
  kind: 'trailer' | 'fit-out'
  lists?: BoatFit['lists']
}) {
  if (named.length === 0) return null
  const one = named.length === 1
  const byList = lists
    .map((l) => ({ name: l.name, n: named.filter((x) => x.slot === l.tableId).length }))
    .filter((l) => l.n > 0)
  const examples =
    byList.length > 0
      ? lists.flatMap((l) => named.filter((x) => x.slot === l.tableId).slice(0, 2))
      : named.slice(0, 3)
  return (
    <aside className="fp-named" aria-label="Named for it, not listed for it">
      <p className="fp-named__head">Named for it, not listed for it</p>
      {kind === 'fit-out' && byList.length > 0 ? (
        <p className="fp-named__count">
          {`${byList.map((l) => `${count(l.n)} in ${l.name}`).join(' and ')} carry ${words.code} in their name, such as:`}
        </p>
      ) : null}
      <ul className="fp-named__list">
        {examples.map((n) => (
          <li key={n.place.rowId} className="fp-named__one">
            <span className="fp-named__name">{n.name}</span>
            <span className="fp-named__price">{priceOf(n.price)}</span>
          </li>
        ))}
      </ul>
      <p className="fp-named__say">
        {`${one ? 'Its name says' : 'Their names say'} ${words.code}, but the price list does not list ${one ? 'it' : 'them'} for the ${words.short}, so ${one ? 'it is' : 'they are'} not offered on a quote. Northside can offer ${one ? 'it' : 'them'} in Change what Northside offers.`}
      </p>
    </aside>
  )
}

/* ---------------------------------------------------------- */
/* The reasons                                                 */
/* ---------------------------------------------------------- */

function Reasons({ title, held, taken }: { title: string; held: HeldBack; taken: TakenOff[] }) {
  const cards: Array<HeldShare | { id: 'taken'; count: number; because: string; eg: string }> = [
    ...(taken.length > 0
      ? [
          {
            id: 'taken' as const,
            count: taken.length,
            because: `Northside took ${taken.length === 1 ? 'it' : 'them'} off this boat. Change what Northside offers puts ${taken.length === 1 ? 'it' : 'them'} back.`,
            eg: taken.map((t) => t.name).join(' · '),
          },
        ]
      : []),
    ...held.groups,
  ]
  if (cards.length === 0) return null
  const grid = gridStyle(cards.length, { desk: 3, mid: 2, phone: 1 })
  return (
    <div className="fp-why">
      <h3 className="fp-why__title">{title}</h3>
      <ul className="fp-why__list" style={grid.list}>
        {cards.map((h, i) => (
          <li
            key={h.id}
            className="fp-reason"
            style={grid.items[i]}
            data-taken={h.id === 'taken' ? '' : undefined}
          >
            <span className="fp-reason__n">{count(h.count)}</span>
            <span className="fp-reason__say">
              <span className="fp-reason__because">{h.because}</span>
              {'eg' in h ? (
                <span className="fp-reason__eg">{h.eg}</span>
              ) : (
                <>
                  {h.makers.length > 0 ? (
                    <span className="fp-reason__eg">
                      {h.makers.map((m) => `${m.maker} ${count(m.count)}`).join(' · ')}
                    </span>
                  ) : null}
                  {h.example && h.makers.length === 0 ? (
                    <span className="fp-reason__eg">
                      <span className="fp-reason__lead">{h.nearest ? 'Nearest' : 'Such as'}</span>{' '}
                      {h.example.name}
                    </span>
                  ) : null}
                </>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* The quote this starts, at the window's foot                 */
/* ---------------------------------------------------------- */

function QuoteBar({
  anchor,
  quote,
  priceName,
  retired,
  onStart,
  refused,
}: {
  anchor: RefObject<HTMLElement | null>
  quote: ReturnType<typeof quoteStartOf>
  priceName: string
  retired: boolean
  onStart: () => void
  refused: string
}) {
  const shown = quote.names.slice(0, 3)
  const more = quote.names.length - shown.length
  return (
    <section ref={anchor} className="fp-bar" data-ground="night" aria-label="The quote this starts">
      <div className="fp-bar__in">
        <div className="fp-bar__what">
          <p className="fp-bar__kicker">
            {`The quote this starts · ${plural(quote.lines, 'line', 'lines')}`}
          </p>
          <p className="fp-bar__names">
            {shown.join(' · ')}
            {more > 0 ? ` · and ${count(more)} more` : ''}
          </p>
        </div>
        <div className="fp-bar__sum">
          <span className="fp-bar__fig">
            <PriceFigure amount={quote.total} size="lg" />
          </span>
          <span className="fp-bar__said">{quoteStartSaid(quote, priceName)}</span>
        </div>
        <div className="fp-bar__go">
          <Button
            intent="act"
            icon={ReceiptIcon}
            onClick={onStart}
            {...(retired
              ? { refusedBecause: 'This boat is no longer sold, so no quote starts from it.' }
              : {})}
          >
            Start the quote
          </Button>
        </div>
      </div>
      {refused === '' ? null : (
        <p className="fp-bar__why" role="alert">
          {refused}
        </p>
      )}
    </section>
  )
}

/* ---------------------------------------------------------- */
/* Change mode                                                 */
/* ---------------------------------------------------------- */

function ChangeBand({
  words,
  versions,
  onDone,
}: {
  words: ModelWords
  versions: number
  onDone: () => void
}) {
  return (
    <section className="fp-band" aria-label="Changing what Northside offers">
      <p className="fp-band__say">
        <strong>Changing what Northside offers</strong>
        {` on the ${words.name}${versions > 1 ? `, on all ${count(versions)} of its versions` : ''}. Quotes already made keep their lines.`}
      </p>
      <span className="fp-band__done">
        <Button intent="secondary" icon={CheckIcon} onClick={onDone}>
          Done
        </Button>
      </span>
    </section>
  )
}

const NO_LISTS: BoatFit['lists'] = []

interface ChangeLine {
  key: string
  place: Place
  name: string
  facts: string
  price: number | null
  /** on: goes on it · off: Northside took it off · can: the boat takes it, not listed · named */
  state: 'on' | 'off' | 'can' | 'named'
  starred: boolean
  taken: string
}

const pageLine = (l: PageLine, state: 'can' | 'named'): ChangeLine => ({
  key: `${state}:${l.place.rowId}`,
  place: l.place,
  name: l.name,
  facts: l.facts,
  price: l.price,
  state,
  starred: false,
  taken: '',
})

const madeLine = (m: Made): ChangeLine => ({
  key: m.key,
  place: m.place,
  name: m.name,
  facts: m.facts,
  price: m.price,
  state: 'on',
  starred: m.starred,
  taken: '',
})

function ChangePlaces({
  ctx,
  fit,
  words,
  rigs,
  trailers,
  taken,
  named,
  motorMaker,
  change,
  refuse,
  refusal,
  today,
}: {
  ctx: CatalogueCtx
  fit: BoatFit
  words: ModelWords
  rigs: Rigged[]
  trailers: TrailerMade[]
  taken: TakenOff[]
  named: PageLine[]
  motorMaker: string
  change: (target: Place, act: FitAct, place?: 'motor' | 'trailer') => void
  refuse: (rowId: string, why: string) => void
  refusal: FitRefusal | null
  today: Date
}) {
  const order = useMemo(() => orderIn(ctx), [ctx])
  const can = useMemo(() => canPutOnOf(ctx, fit, taken), [ctx, fit, taken])
  const byOrder = (a: ChangeLine, b: ChangeLine): number =>
    a.place.tableId.localeCompare(b.place.tableId) || order(a.place) - order(b.place)
  const offLine = (t: TakenOff): ChangeLine => ({
    key: `off:${t.place.rowId}`,
    place: t.place,
    name: t.name,
    facts: t.facts,
    price: t.price,
    state: 'off',
    starred: false,
    taken: takenOffSaid(t.on, today),
  })

  const motors: ChangeLine[] = [
    ...rigs.map((r) => madeLine(r.motor)),
    ...taken.filter((t) => t.slot === 'motor').map(offLine),
    ...can.map((l) => pageLine(l, 'can')),
  ].toSorted(byOrder)
  const trailerLines: ChangeLine[] = [
    ...trailers.map(madeLine),
    ...taken.filter((t) => t.slot === 'trailer').map(offLine),
    ...named.filter((n) => n.slot === 'trailer').map((l) => pageLine(l, 'named')),
  ].toSorted(byOrder)
  const lists = fit.lists.filter((l) => l.live > 0)
  const fitLines: ChangeLine[] = [
    ...lists.flatMap((l) => offeredIn(l.made).map(madeLine)),
    ...taken.filter((t) => t.slot !== 'motor' && t.slot !== 'trailer').map(offLine),
    ...named.filter((n) => n.slot !== 'trailer').map((l) => pageLine(l, 'named')),
  ].toSorted(byOrder)

  const onMotors = motors.filter((m) => m.state === 'on').length
  const canMotors = motors.filter((m) => m.state === 'can').length
  const trailerOver = (place: Place): boolean => {
    const t = fit.trailer?.made.find((m) => m.place.rowId === place.rowId)
    return t ? overAtm(ctx, fit, t) !== null : false
  }
  return (
    <>
      {fit.motor ? (
        <Place
          id="motor"
          title="Motor"
          lead={`Every ${motorMaker} the ${words.short} takes by its own figures: ${count(onMotors)} go on it${canMotors > 0 ? `, ${count(canMotors)} are not listed for it` : ''}.`}
        >
          <ChangeList
            lines={motors}
            words={words}
            place="motor"
            change={change}
            refusal={refusal}
            star={(l) => change(l.place, 'star', 'motor')}
          />
        </Place>
      ) : null}
      {fit.trailer ? (
        <Place
          id="trailer"
          title="Trailer"
          lead={
            trailerLines.length === 0
              ? `No trailer is listed for the ${words.short}, and none carries ${words.code === '' ? 'its name' : words.code} in its name.`
              : `The trailers listed for the ${words.short}, and those named for it.`
          }
        >
          <ChangeList
            lines={trailerLines}
            words={words}
            place="trailer"
            change={change}
            refusal={refusal}
            star={(l) =>
              trailerOver(l.place)
                ? refuse(
                    l.place.rowId,
                    'Not made the recommended trailer: its ATM is over what goes on it.',
                  )
                : change(l.place, 'star', 'trailer')
            }
          />
        </Place>
      ) : null}
      {lists.length > 0 ? (
        <Place
          id="fitout"
          title="Fit-out"
          lead={`What goes on the ${words.short} from ${lists.map((l) => l.name).join(' and ')}, and what is named for it.`}
        >
          <ChangeList
            lines={fitLines}
            words={words}
            place="motor"
            change={change}
            refusal={refusal}
          />
        </Place>
      ) : null}
    </>
  )
}

function ChangeList({
  lines,
  words,
  place,
  change,
  refusal,
  star,
}: {
  lines: ChangeLine[]
  words: ModelWords
  place: 'motor' | 'trailer'
  change: (target: Place, act: FitAct, place?: 'motor' | 'trailer') => void
  refusal: FitRefusal | null
  star?: (l: ChangeLine) => void
}) {
  if (lines.length === 0) return null
  return (
    <ul className="fp-lines" data-change="">
      {lines.map((l) => (
        <li key={l.key} className="fp-line" data-state={l.state}>
          <div className="fp-line__press">
            <span className="fp-line__words">
              <span className="fp-line__name">
                {l.name}
                {l.starred ? <Recommended /> : null}
                {l.state === 'off' ? (
                  <span className="fp-tag" data-tone="off">
                    {l.taken}
                  </span>
                ) : l.state === 'can' ? (
                  <span className="fp-tag">Not listed for it</span>
                ) : l.state === 'named' ? (
                  <span className="fp-tag">Named for it, not listed</span>
                ) : null}
              </span>
              {l.facts === '' ? null : <span className="fp-line__facts">{l.facts}</span>}
              {refusal?.rowId === l.place.rowId ? (
                <span className="fp-line__rule" role="alert">
                  {refusal.why}
                </span>
              ) : null}
            </span>
            <span className="fp-line__end">
              <span className="fp-line__price">{priceOf(l.price)}</span>
              <span className="fp-line__acts">
                {l.state === 'on' ? (
                  <>
                    {star && !l.starred ? (
                      <Button
                        intent="quiet"
                        size="sm"
                        icon={StarIcon}
                        onClick={() => star(l)}
                        aria-label={`Recommend the ${l.name} for the ${words.short}`}
                      >
                        Recommend it
                      </Button>
                    ) : null}
                    <Button
                      intent="quiet"
                      size="sm"
                      icon={MinusCircleIcon}
                      onClick={() => change(l.place, 'off', place)}
                      aria-label={`Take the ${l.name} off the ${words.short}`}
                    >
                      Take it off
                    </Button>
                  </>
                ) : l.state === 'off' ? (
                  <Button
                    intent="quiet"
                    size="sm"
                    icon={ArrowCounterClockwiseIcon}
                    onClick={() => change(l.place, 'on', place)}
                    aria-label={`Put the ${l.name} back on the ${words.short}`}
                  >
                    Put it back
                  </Button>
                ) : (
                  <Button
                    intent="quiet"
                    size="sm"
                    icon={PlusCircleIcon}
                    onClick={() => change(l.place, 'on', place)}
                    aria-label={`Offer the ${l.name} on the ${words.short}`}
                  >
                    {l.state === 'can' ? 'Put it on' : `Offer it on the ${words.short}`}
                  </Button>
                )}
              </span>
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}

/** THE CHANGES MADE HERE, at the window's foot in change mode, with Undo it and Done. */
function Ledger({
  anchor,
  words,
  ledger,
  undone,
  onUndo,
  onDone,
}: {
  anchor: RefObject<HTMLElement | null>
  words: ModelWords
  ledger: readonly Change[]
  undone: string
  onUndo: () => void
  onDone: () => void
}) {
  const last = ledger.at(-1)
  return (
    <section
      ref={anchor}
      className="fp-bar"
      data-ground="night"
      data-tone="change"
      aria-label="The changes made here"
    >
      <div className="fp-bar__in">
        <div className="fp-bar__what">
          <p className="fp-bar__kicker">
            {ledger.length === 0
              ? 'No change made here yet'
              : `${plural(ledger.length, 'change', 'changes')} made here`}
          </p>
          <p className="fp-bar__names" aria-live="polite">
            {last
              ? last.said
              : undone !== ''
                ? undone
                : `Each change is made on every version of the ${words.short}.`}
          </p>
        </div>
        <div className="fp-bar__go">
          {last ? (
            <Button intent="veiled" icon={ArrowCounterClockwiseIcon} onClick={onUndo}>
              Undo it
            </Button>
          ) : null}
          <Button intent="act" icon={CheckIcon} onClick={onDone}>
            Done
          </Button>
        </div>
      </div>
    </section>
  )
}
