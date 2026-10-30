/* ============================================================
   FITMENT — one boat at a time, and what can be fitted to it, with
   everything struck through carrying the reason it was struck.

   Direction F, "The plate" (docs/directions/fitment-boards/), with E's
   trailer answer grafted under the Trailer line, the horsepower drawn as
   a band with the motors pinned on it, and the verdict's must-change
   made: not one word of the price list's own columns or cells is on the
   plate or the reasons. A cell is reached only through the doors.

   THE BOAT'S OWN PLATE IS THE SHOWPIECE. One dark riveted plate, the
   name at 40px, the render in a window, and three lines that are the
   boat's facts: the horsepower it takes, the trailers it is built for,
   and what else is made for it. Each line is pressed to open what it
   decides below the plate — one at a time, so the screen says one thing
   at once. Which built screens it could repeat: the picker's and Levels'
   dark bands; it stays its own because the band here is ONE plate of one
   boat, riveted and inset, whose lines are the controls.

   UNDER A PRESSED LINE, THE ANSWER FIRST, THE REASONS AFTER. What is
   made for the boat as priced tiles (the recommended in the accent),
   then everything held back, ONE ROW PER REASON: its count, the engine's
   sentence, the nearest or first one struck, "Show these" and the door
   to the line of the price list that decides it. A dealer reads the tiles
   and is done; the reasons are there when the customer asks why.

   NOT ONE SENTENCE OF A REASON IS WRITTEN HERE. Every "because" comes out
   of `@/domain/fitment` (`plate.ts` shapes it, `say.ts` says it).

   EVERY NARROWING IS NAMED, COUNTED, AND CAN BE SWITCHED OFF — the
   curation contract (`@/domain/catalogue/curation`): the plate's line
   counts what is made for the boat of what is on sale, each reason counts
   what it holds back, and Show all opens the whole list (`Whole.tsx`).
   ============================================================ */
import { useCallback, useMemo, type ReactNode } from 'react'
import {
  ArrowUpRightIcon,
  CaretDownIcon,
  MinusCircleIcon,
  CaretRightIcon,
  DatabaseIcon,
  ListBulletsIcon,
  NotePencilIcon,
  ScalesIcon,
  StarIcon,
  WarningIcon,
} from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { Button, Icon, Picture, PriceFigure, Tile, move, transition } from '@/ui'
import { useCatalogue, useQuotes } from '@/app/useStores'
import { ctxFrom } from '@/state/catalogue'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { copyOf, itemOf, pictureOf, srcSetOf } from '@/data/pictures'
import { makeCtx, rowLabel, type CatalogueCtx } from '@/domain/model'
import {
  offeredIn,
  readBoatFit,
  readWhole,
  refusedByRule,
  type BoatFit,
  type BoatFound,
  type ListFit,
  type Place,
  type Opens,
  type TrailerMade,
} from '@/domain/fitment/boat'
import {
  heldBack,
  loadOf,
  motorTiles,
  plateLines,
  rulesHere,
  towOf,
  type Door,
  type HeldBack,
  type LineId,
  type MotorTiles,
  type PlateLine,
  type Tow,
} from '@/domain/fitment/plate'
import { spokenBoat } from '@/domain/quote/spoken'
import { Whole } from './Whole'
import { useFitChange, type FitRefusal } from './useFitChange'
import type { FitWay } from '@/domain/fitment/change'
import { AnotherBoat, ChooseABoat } from './Chooser'
import './fitment.css'

export type { Opens }

export interface FitmentPosition {
  maker?: string
  model?: string
  boat?: string
  line?: string
  all?: string
  only?: string
  find?: string
}

export interface FitmentProps {
  /** the boat, by its line on the price list; '' for none chosen */
  boat: string
  /** before a boat is chosen, the maker and the model open in the chooser; '' for none */
  maker?: string
  model?: string
  /** the plate's pressed line: 'motor', 'trailer' or 'also'; '' for the first */
  line: string
  /** the place whose whole list is open: 'motor', 'trailer' or a list's id */
  all: string
  /** one reason's group of that list, from its "Show these" */
  only: string
  find: string
  onPosition: (next: FitmentPosition) => void
  openBoat: (rowId: string) => void
  sheetHref: (opens: Opens) => string
  openSheet: (opens: Opens) => void
  openRules: () => void
  openTheFile: () => void
}

const AU = new Intl.NumberFormat('en-AU')
const count = (n: number): string => AU.format(n)

export function Fitment({
  boat,
  maker = '',
  model = '',
  line,
  all,
  only,
  find,
  onPosition,
  openBoat,
  sheetHref,
  openSheet,
  openRules,
  openTheFile,
}: FitmentProps) {
  const sheet = useCatalogue((s) => s)
  const filed = useQuotes((s) => s.quotes)
  const read = sheet.status === 'ready' || sheet.status === 'failed'
  const open = sheet.status === 'ready' && Object.keys(sheet.tables).length > 0

  const ctx = useMemo(
    () => makeCtx({ ...ctxFrom(sheet), orgId: PACK_ORG_ID }),
    // the catalogue state object is replaced on every write, which is the dependency wanted
    [sheet],
  )
  const place = useMemo(() => {
    const row = sheet.index?.rowById?.[boat]
    return row ? { tableId: row.entityId, rowId: row.id } : null
  }, [sheet, boat])
  const fit = useMemo(() => (open && place ? readBoatFit(ctx, place) : null), [ctx, open, place])
  const whole = useMemo(
    () => (fit && all !== '' ? readWhole(ctx, fit, all) : null),
    [ctx, fit, all],
  )
  /* ONE PRESS PUTS A THING ON THIS BOAT OR TAKES IT OFF, with its Undo (exposure.md, blocker) */
  const { change, refusal } = useFitChange(ctx, fit)

  /* THE BOATS ALREADY ON QUOTES HERE, most recent first, offered before a word is typed */
  const recent = useMemo<BoatFound[]>(() => {
    if (!open) return []
    const seen = new Set<string>()
    const out: BoatFound[] = []
    for (const q of filed.toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt))) {
      if (seen.has(q.rootRowId) || out.length >= 6) continue
      const table = ctx.entities[q.rootTableId]
      const row = (ctx.rowsByEntity[q.rootTableId] ?? []).find((r) => r.id === q.rootRowId)
      if (!table || table.kind !== 'boat' || !row) continue
      seen.add(q.rootRowId)
      const said = spokenBoat(table.id, rowLabel(table, row))
      out.push({
        place: { tableId: table.id, rowId: row.id },
        name: said.name,
        detail: said.detail,
        maker: said.maker,
        code: '',
      })
    }
    return out
  }, [filed, ctx, open])

  const showAll = useCallback(
    (slot: string, group = '') => {
      onPosition({ all: slot, only: group, find: '' })
      window.scrollTo({ top: 0 })
    },
    [onPosition],
  )

  if (!read || !open) {
    return (
      <main className="ft" data-testid="fitment" data-read={read ? '' : undefined}>
        <header className="ft-head">
          <p className="ft-eyebrow">Fitment</p>
          <h1 className="ft-title">What goes on a boat</h1>
        </header>
        <div className="ft-empty">
          <span className="ft-empty__glyph" aria-hidden="true">
            <Icon glyph={DatabaseIcon} size="lg" />
          </span>
          {read ? (
            <>
              <p className="ft-empty__say">
                No price list is open on this computer, so there is no boat to fit.
              </p>
              <Button intent="primary" icon={DatabaseIcon} onClick={openTheFile}>
                Load the Master Price File
              </Button>
            </>
          ) : (
            <p className="ft-empty__say">Looking for the price list…</p>
          )}
        </div>
      </main>
    )
  }

  if (!fit) {
    return (
      <main className="ft" data-testid="fitment" data-read="" data-mode="choose">
        <div className="ft-top">
          <p className="ft-eyebrow">Fitment · what goes on a boat</p>
        </div>
        <ChooseABoat
          world={ctx}
          onChoose={openBoat}
          recent={recent}
          missing={boat !== ''}
          at={{ maker, model }}
          onAt={(next) => onPosition(next)}
        />
      </main>
    )
  }

  const lines = plateLines(fit)
  const pressed = lines.find((l) => l.id === line) ?? lines[0] ?? null

  return (
    <main
      className="ft"
      data-testid="fitment"
      data-read=""
      data-boat={fit.place.rowId}
      data-mode={whole ? 'all' : 'plate'}
    >
      <div className="ft-top">
        {whole ? (
          <div className="ft-top__who">
            <p className="ft-eyebrow">Fitment</p>
            <h1 className="ft-title">{fit.name}</h1>
          </div>
        ) : (
          <p className="ft-eyebrow">Fitment · what goes on this boat</p>
        )}
        <AnotherBoat world={ctx} onChoose={openBoat} recent={recent} />
      </div>

      {whole ? (
        <Whole
          key={`${whole.slot}:${only}`}
          list={whole}
          only={only}
          find={find}
          onFind={(words) => onPosition({ find: words })}
          onWiden={() => onPosition({ only: '' })}
          onClose={() => onPosition({ all: '', only: '', find: '' })}
          sheetHref={sheetHref}
          openSheet={openSheet}
          boatName={fit.name}
          onChange={change}
          refusal={refusal}
        />
      ) : (
        <>
          <BoatPlate
            fit={fit}
            ctx={ctx}
            lines={lines}
            pressed={pressed?.id ?? null}
            onLine={(id) => onPosition({ line: id })}
          />
          <AnimatePresence mode="wait" initial={false}>
            {pressed ? (
              <motion.div
                key={pressed.id}
                className="ft-open"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0, transition: transition('enter') }}
                exit={{ opacity: 0, transition: move.exit }}
              >
                {pressed.id === 'motor' ? (
                  <MotorOpen
                    fit={fit}
                    ctx={ctx}
                    change={change}
                    refusal={refusal}
                    showAll={showAll}
                    sheetHref={sheetHref}
                    openSheet={openSheet}
                    openRules={openRules}
                  />
                ) : pressed.id === 'trailer' ? (
                  <TrailerOpen
                    fit={fit}
                    ctx={ctx}
                    change={change}
                    refusal={refusal}
                    showAll={showAll}
                    sheetHref={sheetHref}
                    openSheet={openSheet}
                    openRules={openRules}
                  />
                ) : (
                  <AlsoOpen
                    lists={fit.lists}
                    showAll={showAll}
                    boatName={fit.name}
                    change={change}
                    refusal={refusal}
                  />
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </main>
  )
}

/* ---------------------------------------------------------- */
/* The plate: the boat, and its three lines                    */
/* ---------------------------------------------------------- */

function BoatPlate({
  fit,
  ctx,
  lines,
  pressed,
  onLine,
}: {
  fit: BoatFit
  ctx: CatalogueCtx
  lines: PlateLine[]
  pressed: LineId | null
  onLine: (id: LineId) => void
}) {
  /* THE BOAT'S OWN RENDER — the price list's Image Link for this very finish, then the one
     picture reader's answer for this boat. Never a stand-in (src/data/pictures): a boat with no
     picture has no window, and its name takes the plate's width. */
  const item = itemOf(fit.place.tableId, fit.place.rowId, fit.imageAddress)
  const shown = copyOf(item) ?? pictureOf(item)
  const maker = fit.trailer?.maker ?? spokenBoat(fit.place.tableId, '').maker
  /* the maker's own words for where it sits, without the finish the detail line spells out */
  const mark = [maker, ...(fit.path.length > 1 ? fit.path.slice(0, -1) : fit.path)].filter(
    (s) => s !== '',
  )
  const detail = [fit.detail, fit.code, fit.priceName === '' ? '' : `prices at ${fit.priceName}`]
    .filter((s) => s !== '')
    .join(' · ')
  const tiles = motorTiles(ctx, fit)

  return (
    <section className="ft-plate" data-ground="night" aria-labelledby="ft-name">
      <span className="ft-rivet" data-at="ts" aria-hidden="true" />
      <span className="ft-rivet" data-at="te" aria-hidden="true" />
      <span className="ft-rivet" data-at="bs" aria-hidden="true" />
      <span className="ft-rivet" data-at="be" aria-hidden="true" />
      <div className="ft-plate__id" data-window={shown ? '' : undefined}>
        <div className="ft-id">
          {mark.length > 0 ? <p className="ft-id__mark">{mark.join(' · ')}</p> : null}
          <h1 className="ft-id__name" id="ft-name">
            {fit.name}
          </h1>
          {detail === '' ? null : <p className="ft-id__detail">{detail}</p>}
          {fit.retired ? <p className="ft-id__retired">No longer sold.</p> : null}
        </div>
        {shown ? (
          <figure className="ft-window">
            <Picture
              src={shown.src}
              srcSet={srcSetOf(shown)}
              sizes="(min-width: 700px) 260px, 40vw"
              alt={`The ${fit.name}${fit.detail === '' ? '' : `, ${fit.detail}`}`}
              width={shown.width}
              height={shown.height}
              fit="contain"
              priority
            />
          </figure>
        ) : null}
      </div>

      <ul className="ft-lines" aria-label={`What the ${fit.name} takes`}>
        {lines.map((l) => (
          <li key={l.id} className="ft-lines__line">
            <Tile shape="row" tone="room" selected={pressed === l.id} onSelect={() => onLine(l.id)}>
              <span className="ft-ln" data-line={l.id}>
                <span className="ft-ln__word">{l.word}</span>{' '}
                <span className="ft-ln__value">
                  {l.value}
                  {l.sub === '' ? null : <span className="ft-ln__sub"> {l.sub}</span>}
                </span>
                {l.id === 'motor' && tiles ? <Band tiles={tiles} /> : null}{' '}
                <span className="ft-ln__count">
                  <span className="ft-ln__n">{count(l.offered)}</span> of {count(l.of)} offered
                  {l.note === '' ? null : <span className="ft-ln__note"> · {l.note}</span>}
                </span>
                <span className="ft-ln__caret" aria-hidden="true">
                  <Icon glyph={pressed === l.id ? CaretDownIcon : CaretRightIcon} size="sm" />
                </span>
              </span>
            </Tile>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** THE HORSEPOWER AS A FACT: the boat's own range drawn as a band, and ONE DOT PER MOTOR made for
 *  it, stacked where its horsepower stands, the recommended one ringed. The SP660's band said a
 *  bare "2" and "5" over its pins, with no unit (built-critique-m3.md, minor): a stack of dots
 *  is the count, and needs no word. The figures are on the line beside it and on each tile, so
 *  the band itself is not read aloud. */
function Band({ tiles }: { tiles: MotorTiles }) {
  const pins = new Map<number, { at: number; stars: Array<{ key: string; star: boolean }> }>()
  for (const t of tiles.tiles) {
    if (t.at === null || t.hp === null) continue
    const was = pins.get(t.hp) ?? { at: t.at, stars: [] }
    was.stars.push({ key: t.made.key, star: t.made.starred })
    pins.set(t.hp, was)
  }
  if (pins.size === 0) return null
  return (
    <span className="ft-band" aria-hidden="true">
      <span className="ft-band__track" />
      {[...pins.values()].map((p) => (
        <span
          key={p.at}
          className="ft-band__pin"
          style={{
            ['--ft-at' as string]: `${(p.at * 100).toFixed(2)}%`,
            ['--ft-n' as string]: String(p.stars.length),
          }}
        >
          {/* the recommended motor at the foot of its stack, on the track */}
          {p.stars
            .toSorted((a, b) => Number(b.star) - Number(a.star))
            .map(({ key, star }, i) => (
              <span
                key={key}
                className="ft-band__dot"
                data-star={star ? '' : undefined}
                style={{ ['--ft-i' as string]: String(i) }}
              />
            ))}
        </span>
      ))}
    </span>
  )
}

/* ---------------------------------------------------------- */
/* Under the Motor line                                         */
/* ---------------------------------------------------------- */

interface Changing {
  change: (target: Place, way: FitWay) => void
  refusal: FitRefusal | null
}

interface OpenProps extends Changing {
  fit: BoatFit
  ctx: CatalogueCtx
  showAll: (slot: string, group?: string) => void
  sheetHref: (opens: Opens) => string
  openSheet: (opens: Opens) => void
  openRules: () => void
}

function MotorOpen({
  fit,
  ctx,
  showAll,
  sheetHref,
  openSheet,
  openRules,
  change,
  refusal,
}: OpenProps) {
  const motor = fit.motor
  const tiles = useMemo(() => motorTiles(ctx, fit), [ctx, fit])
  /* THE REASONS AND THEIR ONE HEAD FIGURE, read in src/domain off the plate line's own pair */
  const held = useMemo(() => heldBack(ctx, fit, 'motor'), [ctx, fit])
  if (!motor || !tiles) return null
  return (
    <section className="ft-place" aria-labelledby="ft-motor">
      <div className="ft-bar">
        <h2 className="ft-bar__title" id="ft-motor">
          Motor <span className="ft-bar__maker">{tiles.maker}</span>
        </h2>
        <Button intent="quiet" size="sm" icon={ListBulletsIcon} onClick={() => showAll('motor')}>
          {`Show all ${count(motor.counts.live)}, each with its reason`}
        </Button>
      </div>
      {tiles.tiles.length === 0 ? (
        <p className="ft-none">No {tiles.maker} motor on the price list is made for this boat.</p>
      ) : (
        <ul className="ft-tiles" aria-label="Made for it">
          {tiles.tiles.map((t) => {
            return (
              <li
                key={t.made.key}
                className="ft-tile"
                data-ground="plate"
                data-star={t.made.starred ? '' : undefined}
              >
                <p className="ft-tile__name">
                  {t.made.starred ? (
                    <span className="ft-tile__star" aria-label="Recommended">
                      <Icon glyph={StarIcon} weight="fill" size="sm" />
                    </span>
                  ) : null}
                  <span className="ft-tile__model">{t.model}</span>
                </p>
                <p className="ft-tile__foot">
                  <span>{t.hp === null ? '' : `${AU.format(t.hp)} hp`}</span>
                  {t.made.price === null ? null : (
                    <span className="ft-tile__price">
                      <PriceFigure amount={t.made.price} />
                    </span>
                  )}
                </p>
                {t.outside === '' ? null : (
                  <p className="ft-tile__warn">
                    <Icon glyph={WarningIcon} size="sm" />
                    {t.outside}
                  </p>
                )}
                {t.made.rule && t.made.rule.because !== '' ? (
                  <p className="ft-tile__rule">{t.made.rule.because}</p>
                ) : null}
                <TakeOff
                  name={t.model}
                  boatName={fit.name}
                  onAccent={t.made.starred}
                  place={t.made.place}
                  change={change}
                  refusal={refusal}
                />
              </li>
            )
          })}
        </ul>
      )}
      <Reasons
        held={held}
        onShow={(group) => showAll('motor', group)}
        sheetHref={sheetHref}
        openSheet={openSheet}
        openRules={openRules}
        boatName={fit.name}
      />
      <RulesLine said={rulesHere(fit, held.groups, 'motor')} openRules={openRules} />
    </section>
  )
}

/* ---------------------------------------------------------- */
/* Under the Trailer line: E's answer, on the true weight       */
/* ---------------------------------------------------------- */

function TrailerOpen({
  fit,
  ctx,
  showAll,
  sheetHref,
  openSheet,
  openRules,
  change,
  refusal,
}: OpenProps) {
  const trailer = fit.trailer
  const held = useMemo(() => heldBack(ctx, fit, 'trailer'), [ctx, fit])
  const load = useMemo(() => loadOf(ctx, fit), [ctx, fit])
  const tows = useMemo(
    () => new Map((trailer?.made ?? []).map((t) => [t.key, towOf(ctx, load, t)])),
    [ctx, load, trailer],
  )
  if (!trailer) return null
  /* ONE SCALE FOR EVERY BAR, so two trailers' ATMs are read against each other */
  const scale =
    Math.max(0, ...[...tows.values()].flatMap((w) => [w.rated ?? 0, w.total ?? 0])) * 1.06
  /* the one-trailer rule is said once, where the second trailer is offered */
  /* what is offered, and only that: a trailer a rule refuses is one of the reasons below */
  const shown = offeredIn(trailer.made)
  const second = trailer.oneTrailer === '' ? null : (shown.find((t) => !t.crosses) ?? null)
  /* NOTHING MADE FOR IT, NOTHING TO WEIGH OR TALLY. The Classic 340, an inflatable, was handed
     "The other 434, and why" in three groups and a load sentence for a trailer it never goes
     on (built-critique-m3.md, minor). Where the price list makes no trailer for a boat, its
     line says so once, and every one on sale is still a press away, each with its reason, in
     Show all. A trailer a rule refuses is made for the boat, so it still opens its reason. */
  const none = trailer.made.length === 0
  return (
    <section className="ft-place" aria-labelledby="ft-trailer">
      <div className="ft-bar">
        <h2 className="ft-bar__title" id="ft-trailer">
          Trailer
        </h2>
        <Button intent="quiet" size="sm" icon={ListBulletsIcon} onClick={() => showAll('trailer')}>
          {`Show all ${count(trailer.onSale)}, each with its reason`}
        </Button>
      </div>
      {none ? null : (
        <p className="ft-load">
          <Icon glyph={ScalesIcon} size="sm" />
          <span>{load.says}</span>
        </p>
      )}
      {none ? (
        <p className="ft-none">{`No trailer on the price list is made for the ${fit.name}.`}</p>
      ) : shown.length === 0 ? null : (
        <ul className="ft-trailers" aria-label="Made for it">
          {shown.map((t) => (
            <TrailerTile
              key={t.key}
              t={t}
              tow={tows.get(t.key) ?? null}
              scale={scale}
              rule={second?.key === t.key ? trailer.oneTrailer : ''}
              offeredInstead={shown.some((o) => o.crosses && o.key !== t.key)}
              sheetHref={sheetHref}
              openSheet={openSheet}
              boatName={fit.name}
              change={change}
              refusal={refusal}
            />
          ))}
        </ul>
      )}
      {none ? null : (
        <>
          <Reasons
            held={held}
            onShow={(group) => showAll('trailer', group)}
            sheetHref={sheetHref}
            openSheet={openSheet}
            openRules={openRules}
            boatName={fit.name}
          />
          {trailer.heldSays === '' ? null : <p className="ft-quiet">{trailer.heldSays}</p>}
        </>
      )}
      <RulesLine said={rulesHere(fit, held.groups, 'trailer')} openRules={openRules} />
    </section>
  )
}

function TrailerTile({
  t,
  tow,
  scale,
  rule,
  offeredInstead,
  sheetHref,
  openSheet,
  boatName,
  change,
  refusal,
}: Changing & {
  boatName: string
  t: TrailerMade
  tow: Tow | null
  scale: number
  /** the one-trailer rule, on the trailer offered in the place of the one on a new quote */
  rule: string
  offeredInstead: boolean
  sheetHref: (opens: Opens) => string
  openSheet: (opens: Opens) => void
}): ReactNode {
  const rated = tow?.rated != null && scale > 0 ? tow.rated / scale : null
  const total = tow?.total != null && scale > 0 ? tow.total / scale : null
  const over = tow?.standing === 'over'
  const opens: Opens = { tableId: t.place.tableId, at: t.place.rowId }
  return (
    <li className="ft-trl" data-ground="plate" data-star={t.crosses ? '' : undefined}>
      <p className="ft-trl__name">
        {t.starred ? (
          <span className="ft-tile__star" aria-label="Recommended">
            <Icon glyph={StarIcon} weight="fill" size="sm" />
          </span>
        ) : null}
        <span>{t.name}</span>
        {t.price === null ? null : (
          <span className="ft-trl__price">
            <PriceFigure amount={t.price} />
          </span>
        )}
      </p>
      <p className="ft-trl__tag">
        {t.crosses ? 'On a new quote' : offeredInstead ? 'Offered in its place' : ''}
      </p>
      {rated !== null ? (
        <span className="ft-atm" aria-hidden="true" data-over={over ? '' : undefined}>
          <span className="ft-atm__rated" style={{ inlineSize: `${(rated * 100).toFixed(2)}%` }} />
          {total !== null ? (
            <span
              className="ft-atm__load"
              style={{ insetInlineStart: `${(total * 100).toFixed(2)}%` }}
            />
          ) : null}
        </span>
      ) : null}
      {tow ? (
        <p className="ft-trl__says" data-over={over ? '' : undefined}>
          {over ? <Icon glyph={WarningIcon} size="sm" /> : null}
          <span>{tow.says}</span>
        </p>
      ) : null}
      {t.rule && t.rule.because !== '' ? <p className="ft-tile__rule">{t.rule.because}</p> : null}
      {over ? (
        <span className="ft-trl__door">
          <Button
            intent="quiet"
            size="sm"
            icon={ArrowUpRightIcon}
            href={sheetHref(opens)}
            onClick={() => openSheet(opens)}
            aria-label={`Open ${t.name} on the price list`}
          >
            Open its line
          </Button>
        </span>
      ) : null}
      {rule === '' ? null : <p className="ft-trl__rule">{rule}</p>}
      <TakeOff
        name={t.name}
        boatName={boatName}
        place={t.place}
        change={change}
        refusal={refusal}
      />
    </li>
  )
}

/* ---------------------------------------------------------- */
/* Under "Also made for it"                                     */
/* ---------------------------------------------------------- */

function AlsoOpen({
  lists,
  showAll,
  boatName,
  change,
  refusal,
}: Changing & {
  boatName: string
  lists: ListFit[]
  showAll: (slot: string, group?: string) => void
}) {
  return (
    <section className="ft-place" aria-labelledby="ft-also">
      <div className="ft-bar">
        <h2 className="ft-bar__title" id="ft-also">
          Also made for it
        </h2>
      </div>
      <div className="ft-also">
        {lists
          .filter((l) => l.live > 0)
          .map((l) => {
            return (
              <section
                key={l.tableId}
                className="ft-also__list"
                data-ground="plate"
                aria-label={l.name}
              >
                <div className="ft-also__head">
                  <h3 className="ft-also__name">{l.name}</h3>
                  <Button
                    intent="quiet"
                    size="sm"
                    icon={ListBulletsIcon}
                    onClick={() => showAll(l.tableId)}
                    aria-label={`Show all ${count(l.live)} in ${l.name}`}
                  >
                    {`Show all ${count(l.live)}`}
                  </Button>
                </div>
                {l.made.length === 0 ? (
                  <p className="ft-none">Nothing in {l.name} is made for this boat.</p>
                ) : (
                  <ul className="ft-items">
                    {l.made.map((m) => (
                      <li
                        key={m.key}
                        className="ft-item"
                        data-struck={refusedByRule(m) ? '' : undefined}
                      >
                        <span className="ft-item__name">{m.name}</span>
                        {m.price === null ? null : <PriceFigure amount={m.price} />}
                        {m.rule && m.rule.because !== '' ? (
                          <span className="ft-tile__rule">{m.rule.because}</span>
                        ) : null}
                        <TakeOff
                          name={m.name}
                          boatName={boatName}
                          place={m.place}
                          change={change}
                          refusal={refusal}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
      </div>
    </section>
  )
}

/** THE PRESS THAT TAKES ONE THING OFF THIS BOAT, on the thing's own tile, and the sentence
 *  where a press was refused. Putting one on is in Show all, beside each thing not made for
 *  it, so the plate shows what goes on and the whole list what could. */
function TakeOff({
  name,
  boatName,
  place,
  change,
  refusal,
  onAccent = false,
}: Changing & { name: string; boatName: string; place: Place; onAccent?: boolean }) {
  return (
    <span className="ft-off">
      <Button
        /* the recommended tile stands in the accent, where a quiet ink would not read: there the
           press is the kit's white plate */
        intent={onAccent ? 'veiled' : 'quiet'}
        size="sm"
        icon={MinusCircleIcon}
        onClick={() => change(place, 'off')}
        aria-label={`Take the ${name} off what goes on the ${boatName}`}
      >
        Take it off
      </Button>
      {refusal?.rowId === place.rowId ? (
        <span className="ft-off__why" role="alert">
          {refusal.why}
        </span>
      ) : null}
    </span>
  )
}

/* ---------------------------------------------------------- */
/* The reasons, one row each                                    */
/* ---------------------------------------------------------- */

/** The door's words: what it opens, as a person says it. Never a column or a cell. */
function doorSaid(door: Door, boatName: string, example: string): { word: string; aria: string } {
  switch (door.kind) {
    case 'boat':
      return {
        word: 'Open its horsepower',
        aria: `Open the ${boatName}’s horsepower on the price list`,
      }
    case 'pairing':
      return {
        word: 'Open what fits it',
        aria: `Open the list of what fits the ${boatName} on the price list`,
      }
    case 'line':
      return { word: 'Open its line', aria: `Open ${example} on the price list` }
    case 'series':
      return {
        word: 'Open its series',
        aria: `Open ${example} on the price list, where its series is written`,
      }
    case 'rules':
      return { word: 'Your rules', aria: 'Open your rules' }
  }
}

function Reasons({
  held,
  onShow,
  sheetHref,
  openSheet,
  openRules,
  boatName,
}: {
  held: HeldBack
  onShow: (group: string) => void
  sheetHref: (opens: Opens) => string
  openSheet: (opens: Opens) => void
  openRules: () => void
  boatName: string
}) {
  if (held.groups.length === 0) return null
  return (
    <>
      <h3 className="ft-why">The other {count(held.others)}, and why</h3>
      {/* A ROW OF GAUGES ON THE ROOM, NOT A WHITE CARD OF ROWS: each reason stands in its own
          column under a track filled to its share of the others, so the reasons read side by
          side as the plate's own instruments — never as Rules' numbered clauses
          (built-critique-m3.md, major 10). The share is drawn only; the count is said. */}
      <ul className="ft-reasons">
        {held.groups.map((h) => {
          const door = h.door ? doorSaid(h.door, boatName, h.example?.name ?? '') : null
          const opens = h.door && h.door.kind !== 'rules' ? h.door.opens : null
          return (
            <li key={h.id} className="ft-reason" data-ruled={h.id === 'ruled' ? '' : undefined}>
              <span className="ft-reason__gauge" aria-hidden="true">
                <span
                  className="ft-reason__fill"
                  style={{ inlineSize: `${(h.share * 100).toFixed(2)}%` }}
                />
              </span>
              <span className="ft-reason__n">{count(h.count)}</span>
              <div className="ft-reason__say">
                <p className="ft-reason__because">{h.because}</p>
                {h.makers.length > 0 ? (
                  <p className="ft-reason__makers">
                    {h.makers.map((m) => `${m.maker} ${count(m.count)}`).join(' · ')}
                  </p>
                ) : null}
                {h.example ? (
                  <p className="ft-reason__eg">
                    <span className="ft-reason__lead">{h.nearest ? 'Nearest' : 'Such as'}</span>{' '}
                    {/* struck only where its reason holds it off the boat (`Held.struck`) */}
                    <span className={h.struck ? 'ft-struck' : 'ft-reason__name'}>
                      {h.example.name}
                    </span>
                    {h.example.facts === '' ? null : (
                      <span className="ft-reason__facts"> · {h.example.facts}</span>
                    )}
                  </p>
                ) : null}
              </div>
              <div className="ft-reason__acts">
                <Button
                  intent="quiet"
                  size="sm"
                  onClick={() => onShow(h.id)}
                  aria-label={`Show these ${count(h.count)}: ${h.because}`}
                >
                  {`Show these ${count(h.count)}`}
                </Button>
                {door ? (
                  <Button
                    intent="quiet"
                    size="sm"
                    icon={h.door?.kind === 'rules' ? NotePencilIcon : ArrowUpRightIcon}
                    {...(opens
                      ? { href: sheetHref(opens), onClick: () => openSheet(opens) }
                      : { href: '/rules', onClick: openRules })}
                    aria-label={door.aria}
                  >
                    {door.word}
                  </Button>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}

function RulesLine({ said, openRules }: { said: string; openRules: () => void }) {
  if (said === '') return null
  return (
    <p className="ft-rules">
      <Icon glyph={NotePencilIcon} size="sm" />
      <span>{said}</span>
      <Button intent="quiet" size="sm" href="/rules" onClick={openRules}>
        Write a rule
      </Button>
    </p>
  )
}
