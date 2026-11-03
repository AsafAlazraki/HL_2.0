/* ============================================================
   FITMENT — one boat at a time, and what can be fitted to it, with
   everything struck through carrying the reason it was struck.

   Direction F, "The plate" (docs/directions/fitment-boards/), with E's
   trailer answer grafted under the Trailer line, the horsepower drawn as
   a band with the motors pinned on it, and the verdict's must-change
   made: not one word of the price list's own columns or cells is on the
   plate or the reasons. A cell is reached only through the doors.

   THE BOAT'S OWN PLATE IS THE SHOWPIECE. One dark riveted plate, the
   name at 40px, the render in a window, the boat's own facts, and three
   lines that are the controls: the horsepower it takes, the trailers it
   is built for, and what else is made for it. Each line is pressed to
   open what it decides below the plate — one at a time. At the plate's
   foot, the quote this answer starts.

   DEEPENED 2026-11-03 (the fitment judge's verdict, docs/directions/
   data-round/fitment/judge.md). The composition stays; what it was
   missing is here:

     · THE MODEL IS THE UNIT. The plate names the model, its versions
       are a choice on it (price and weight are a version's), and every
       change is made on every version, counted (`versions.ts`).
     · THE RIG, PRICED: each motor with its rigging kit, prop and engine
       hole from its own pairing, and the two together where Northside
       has chosen the kit list's price (`rigged.ts`).
     · THE QUOTE STARTS HERE, with the motor and trailer chosen on the
       tiles (`useStart.ts`).
     · THE MOTORS SIDE BY SIDE, the boat's own facts, reasons by shaft
       and steering, the recommended set here, and "Also made for it" at
       the depth of the other two.

   NOT ONE SENTENCE OF A REASON IS WRITTEN HERE. Every "because" comes out
   of `@/domain/fitment` (`plate.ts` shapes it, `say.ts` says it).
   ============================================================ */
import { useCallback, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import {
  ArrowUpRightIcon,
  CaretDownIcon,
  CaretRightIcon,
  CheckCircleIcon,
  CircleIcon,
  ColumnsIcon,
  DatabaseIcon,
  ListBulletsIcon,
  MinusCircleIcon,
  NotePencilIcon,
  ReceiptIcon,
  ScalesIcon,
  SquaresFourIcon,
  StarIcon,
  WarningIcon,
} from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Button,
  ExpandPicture,
  Icon,
  Picture,
  PriceFigure,
  Select,
  Tile,
  move,
  transition,
} from '@/ui'
import { useCatalogue, useQuotes } from '@/app/useStores'
import { pricesOf } from '@/app/ways'
import { ctxFrom } from '@/state/catalogue'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { copyOf, itemOf, pictureOf, placeIn, srcSetOf } from '@/data/pictures'
import { useGallery } from '@/app/optionPicture'
import { RowGallery } from '@/app/RowGallery'
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
  listHeld,
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
import {
  boatFacts,
  compareOf,
  retiredKitsSaid,
  riggedOf,
  rigSaid,
  sharedFacts,
  type Pick,
  type Rigged,
} from '@/domain/fitment/rigged'
import { acrossSaid, sameAcross, versionSaid, versionsOf } from '@/domain/fitment/versions'
import { atmNear, atmRefusal, overAtm } from '@/domain/fitment/atm'
import { evenly, gridOf, shareOf } from '@/domain/fitment/rows'
import { spokenBoat } from '@/domain/quote/spoken'
import { Whole } from './Whole'
import { useFitChange, type FitAct, type FitRefusal } from './useFitChange'
import { useStart } from './useStart'
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
  motor?: string
  trailer?: string
  compare?: string
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
  /** the motor and trailer chosen for the quote, by pairing; 'none'; '' for the recommended */
  motor?: string
  trailer?: string
  /** the offered motors side by side */
  compare?: boolean
  onPosition: (next: FitmentPosition) => void
  openBoat: (rowId: string) => void
  sheetHref: (opens: Opens) => string
  openSheet: (opens: Opens) => void
  openRules: () => void
  openTheFile: () => void
  /** any address of the app, pressed from a door here (Prices) */
  openHref?: (href: string) => void
  /** the build, on the quote just started here */
  openQuote?: (quoteId: string) => void
}

/** A fact's words, its part numbers never broken at their hyphens ("6AW-" / "459xx-xx"): a
 *  part of the value with no space in it is a code, and is kept on one line. */
function codesKept(value: string): ReactNode {
  return value.split(' · ').map((part, i) => (
    <span key={part}>
      {i > 0 ? ' · ' : ''}
      {/\s/.test(part) ? part : <span className="ft-code">{part}</span>}
    </span>
  ))
}

/** a door with nowhere to go, for a component test with no router */
const NOWHERE = (): void => {}

const AU = new Intl.NumberFormat('en-AU')
const count = (n: number): string => AU.format(n)

/** Each of n things' share of its row at the three widths the stylesheet reflows at (`rows.ts`),
 *  as the custom properties it reads: nothing alone on a row, no blank cell at a row's end. */
/** ONE SET OF COLUMNS AT EACH WIDTH (`gridOf`): the grid's columns on the list, and each thing's
 *  span on it, so every row's edges line up with the row above (the boat's facts). */
function gridStyle(
  n: number,
  most: { desk: number; mid: number; phone: number },
): { list: CSSProperties; items: CSSProperties[] } {
  const desk = gridOf(n, most.desk)
  const mid = gridOf(n, most.mid)
  const phone = gridOf(n, most.phone)
  return {
    list: {
      '--ft-c-desk': String(desk.columns),
      '--ft-c-mid': String(mid.columns),
      '--ft-c-phone': String(phone.columns),
    } as CSSProperties,
    items: Array.from(
      { length: n },
      (_, i) =>
        ({
          '--ft-s-desk': String(desk.spans[i] ?? 1),
          '--ft-s-mid': String(mid.spans[i] ?? 1),
          '--ft-s-phone': String(phone.spans[i] ?? 1),
        }) as CSSProperties,
    ),
  }
}

function rowsStyle(n: number, most: { desk: number; mid: number; phone: number }): CSSProperties[] {
  const desk = shareOf(n, most.desk)
  const mid = shareOf(n, most.mid)
  const phone = shareOf(n, most.phone)
  return Array.from(
    { length: n },
    (_, i) =>
      ({
        '--ft-k-desk': String(desk[i] ?? 1),
        '--ft-k-mid': String(mid[i] ?? 1),
        '--ft-k-phone': String(phone[i] ?? 1),
      }) as CSSProperties,
  )
}

export function Fitment({
  boat,
  maker = '',
  model = '',
  line,
  all,
  only,
  find,
  motor: chosenMotor = '',
  trailer: chosenTrailer = '',
  compare = false,
  onPosition,
  openBoat,
  sheetHref,
  openSheet,
  openRules,
  openTheFile,
  openHref = NOWHERE,
  openQuote = NOWHERE,
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
  /* THE MODEL, AND EVERY VERSION OF IT STILL SOLD: what a change here reaches */
  const boatModel = useMemo(
    () => (open && place ? versionsOf(ctx, place) : null),
    [ctx, open, place],
  )
  const versions = useMemo(
    () => (boatModel ? boatModel.versions.map((v) => v.place) : place ? [place] : []),
    [boatModel, place],
  )
  const whole = useMemo(
    () => (fit && all !== '' ? readWhole(ctx, fit, all) : null),
    [ctx, fit, all],
  )
  /* ONE PRESS PUTS A THING ON THIS BOAT OR TAKES IT OFF, on every version, with its Undo */
  const { change, refusal, refuse } = useFitChange(ctx, fit, versions)
  const { start, refused: startRefused } = useStart(openQuote)

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

  const rigs = useMemo(() => (fit ? riggedOf(ctx, fit) : []), [ctx, fit])
  /* WHAT THE QUOTE STARTS WITH: the motor and trailer chosen on their tiles, or the price list's
     recommended where nothing is chosen, or none where "none" is */
  const motorPick: Rigged | null = useMemo(() => {
    if (chosenMotor === 'none') return null
    return rigs.find((r) => r.key === chosenMotor) ?? rigs.find((r) => r.motor.starred) ?? null
  }, [rigs, chosenMotor])
  /* A TRAILER OVER ITS ATM IS LEFT OFF THE QUOTE, and the plate's foot says why (`atm.ts`) */
  const trailerWanted: TrailerMade | null = useMemo(() => {
    const offered = fit?.trailer ? offeredIn(fit.trailer.made) : []
    if (chosenTrailer === 'none') return null
    return offered.find((t) => t.key === chosenTrailer) ?? offered.find((t) => t.crosses) ?? null
  }, [fit, chosenTrailer])
  const trailerLeft = useMemo(
    () => (fit && trailerWanted ? atmRefusal(ctx, fit, trailerWanted, 'start') : ''),
    [ctx, fit, trailerWanted],
  )
  const trailerPick = trailerLeft === '' ? trailerWanted : null
  /* the press for the quote on a trailer tile: refused with its sentence where its ATM is over */
  const chooseTrailer = useCallback(
    (key: string) => {
      const t = fit?.trailer?.made.find((m) => m.key === key)
      /* said on the tile that weighs it, under its figures, so not with them again */
      if (fit && t && overAtm(ctx, fit, t)) {
        refuse(t.place.rowId, atmNear('quote'))
        return
      }
      refuse('', '')
      onPosition({ trailer: key })
    },
    [ctx, fit, refuse, onPosition],
  )
  /* and its Recommend it, on the same tile: the domain refuses it too, with the figures, for a
     press that is not under them (Show all) */
  const changeTrailer = useCallback(
    (target: Place, act: FitAct, where?: 'motor' | 'trailer') => {
      const t = fit?.trailer?.made.find((m) => m.place.rowId === target.rowId)
      if (act === 'star' && fit && t && overAtm(ctx, fit, t)) {
        refuse(target.rowId, atmNear('star'))
        return
      }
      change(target, act, where)
    },
    [ctx, fit, refuse, change],
  )

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
  ]

  return (
    <main
      className="ft"
      data-testid="fitment"
      data-read=""
      data-boat={fit.place.rowId}
      data-mode={whole ? 'all' : 'plate'}
    >
      <div className="ft-top" data-mode={whole ? 'all' : undefined}>
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
          onChange={(target, way) => change(target, way)}
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
            model={boatModel}
            onVersion={(rowId) => onPosition({ boat: rowId, motor: '', trailer: '' })}
            start={
              <StartLine
                fit={fit}
                motor={motorPick}
                trailer={trailerPick}
                left={trailerLeft}
                refused={startRefused}
                onStart={() => start(fit.place, picks)}
              />
            }
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
                    rigs={rigs}
                    across={
                      boatModel && fit.motor
                        ? acrossSaid(
                            boatModel.name,
                            sameAcross(ctx, boatModel, fit.place, fit.motor.tableId),
                          )
                        : ''
                    }
                    chosen={motorPick?.key ?? null}
                    onChoose={(key) => onPosition({ motor: key })}
                    compare={compare}
                    onCompare={(on) => onPosition({ compare: on ? 'side' : '' })}
                    change={change}
                    refusal={refusal}
                    showAll={showAll}
                    sheetHref={sheetHref}
                    openSheet={openSheet}
                    openRules={openRules}
                    openHref={openHref}
                  />
                ) : pressed.id === 'trailer' ? (
                  <TrailerOpen
                    fit={fit}
                    ctx={ctx}
                    chosen={trailerPick?.key ?? null}
                    onChoose={chooseTrailer}
                    change={changeTrailer}
                    refusal={refusal}
                    showAll={showAll}
                    sheetHref={sheetHref}
                    openSheet={openSheet}
                    openRules={openRules}
                    openHref={openHref}
                  />
                ) : (
                  <AlsoOpen
                    lists={fit.lists}
                    showAll={showAll}
                    boatName={fit.name}
                    change={change}
                    refusal={refusal}
                    openHref={openHref}
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
/* The plate: the boat, its facts, its three lines, its quote  */
/* ---------------------------------------------------------- */

function BoatPlate({
  fit,
  ctx,
  lines,
  pressed,
  onLine,
  model,
  onVersion,
  start,
}: {
  fit: BoatFit
  ctx: CatalogueCtx
  lines: PlateLine[]
  pressed: LineId | null
  onLine: (id: LineId) => void
  model: ReturnType<typeof versionsOf>
  onVersion: (rowId: string) => void
  start: ReactNode
}) {
  /* THE BOAT'S OWN RENDER — the price list's Image Link for this very finish, then the one
     picture reader's answer for this boat; the cover Northside chose wins over both. Never a
     stand-in (src/data/pictures): a boat with no picture has no window, and its name takes the
     plate's width. */
  const item = itemOf(fit.place.tableId, fit.place.rowId, fit.imageAddress)
  const shown = copyOf(item) ?? pictureOf(item)
  /* AND ITS GALLERY: every picture of this one boat, opened large on the one the window draws */
  const gallery = useGallery(item)
  const [large, setLarge] = useState<number | null>(null)
  const maker = fit.trailer?.maker ?? spokenBoat(fit.place.tableId, '').maker
  /* the maker's own words for where it sits, without the finish the version line spells out */
  const mark = [maker, ...(fit.path.length > 1 ? fit.path.slice(0, -1) : fit.path)].filter(
    (s) => s !== '',
  )
  const many = model !== null && model.versions.length > 1
  const detail = [
    many ? '' : fit.detail,
    fit.code,
    fit.priceName === '' ? '' : `prices at ${fit.priceName}`,
  ]
    .filter((s) => s !== '')
    .join(' · ')
  const tiles = motorTiles(ctx, fit)
  const facts = boatFacts(ctx, fit.place)
  /* one row on the desk; four columns at 834 and 844, three on a phone, every row on the same
     columns and none alone (`gridOf`) */
  const factGrid = gridStyle(facts.length, { desk: facts.length, mid: 4, phone: 3 })

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
          {many && model ? (
            <div className="ft-version">
              <span className="ft-version__word" id="ft-version">
                {`Version, of ${count(model.versions.length)}`}
              </span>
              <span className="ft-version__pick">
                <Select
                  aria-label={`Which of the ${fit.name}’s ${count(model.versions.length)} versions`}
                  options={model.versions.map((v) => ({
                    value: v.place.rowId,
                    label: versionSaid(model, v),
                    ...(v.code === '' ? {} : { trail: v.code }),
                  }))}
                  value={fit.place.rowId}
                  onValueChange={(next) => {
                    if (next && next !== fit.place.rowId) onVersion(next)
                  }}
                />
              </span>
            </div>
          ) : null}
          {detail === '' && fit.price === null ? null : (
            <p className="ft-id__detail">
              {fit.price === null ? null : (
                <span className="ft-id__price">
                  <PriceFigure amount={fit.price} />
                </span>
              )}
              {detail === '' ? null : <span>{detail}</span>}
            </p>
          )}
          {fit.retired ? <p className="ft-id__retired">No longer sold.</p> : null}
        </div>
        {shown ? (
          <figure
            className="ft-window"
            style={{
              ['--ft-shape' as string]: `${shown.width} / ${shown.height}`,
              ['--ft-ratio' as string]: String(shown.width / shown.height),
            }}
          >
            <Picture
              src={shown.src}
              srcSet={srcSetOf(shown)}
              sizes="(min-width: 700px) 260px, 80vw"
              alt={`The ${fit.name}${fit.detail === '' ? '' : `, ${fit.detail}`}`}
              width={shown.width}
              height={shown.height}
              fit="contain"
              priority
            />
            {/* the window is the plate's own white on the night: the press and the count wear the
                day's inks, or they are white on white */}
            <span className="ft-window__expand" data-ground="plate">
              <ExpandPicture
                label={
                  gallery.length > 1
                    ? `See the ${fit.name}’s ${gallery.length} pictures larger`
                    : `See the ${fit.name} larger`
                }
                onExpand={() => setLarge(placeIn(gallery, shown))}
              />
            </span>
            {gallery.length > 1 ? (
              <span className="ft-window__many" data-ground="plate" aria-hidden="true">
                {gallery.length.toLocaleString('en-AU')}
              </span>
            ) : null}
          </figure>
        ) : null}
        <RowGallery item={item} name={fit.name} kind="boat" at={large} onAt={setLarge} />
      </div>

      {/* THE BOAT'S OWN FACTS, off its own row (the fitment judge, major 5) */}
      {facts.length > 0 ? (
        <dl className="ft-facts" style={factGrid.list} aria-label={`The ${fit.name}’s own figures`}>
          {facts.map((f, i) => (
            <div key={f.label} className="ft-facts__one" style={factGrid.items[i]}>
              <dt className="ft-facts__label">{f.label}</dt>
              <dd className="ft-facts__value">{f.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <ul className="ft-lines" aria-label={`What the ${fit.name} takes`}>
        {lines.map((l) => (
          <li key={l.id} className="ft-lines__line">
            <Tile shape="row" tone="room" selected={pressed === l.id} onSelect={() => onLine(l.id)}>
              <span className="ft-ln" data-line={l.id}>
                <span className="ft-ln__word">{l.word}</span>{' '}
                <span className="ft-ln__value">
                  {l.id === 'also'
                    ? l.value.split(' · ').map((part, i) => (
                        <span key={part}>
                          {/* the dot is the next list's, and a phone sets each list on its own
                              line without it: it never ends a line alone (the fitment verifier) */}
                          {i > 0 ? <span className="ft-ln__dot"> · </span> : ''}
                          <span className="ft-ln__part">{part}</span>
                        </span>
                      ))
                    : l.value}
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
      {start}
    </section>
  )
}

/** THE HORSEPOWER AS A FACT: the boat's own range drawn as a band between its two figures, and ONE
 *  DOT PER MOTOR made for it, stacked where its horsepower stands, the recommended one ringed. A
 *  motor outside the range stands BEYOND the band's end, hollow — never on it (the fitment judge:
 *  a 2.5 hp drawn at the 150 end looked as though it fitted). The figures are on the line beside
 *  it and on each tile, so the band itself is not read aloud. */
/** Where a pin stands on the band, 0 to 100: the track stands inside the band's ends (9% to
 *  91%), so what is beyond it has room to be beyond. */
const bandX = (at: number): number => (at < 0 ? 2 : at > 1 ? 98 : 9 + at * 82)

function Band({ tiles }: { tiles: MotorTiles }) {
  const pins = new Map<
    string,
    { at: number; side: string; stars: Array<{ key: string; star: boolean }> }
  >()
  for (const t of tiles.tiles) {
    if (t.at === null || t.hp === null) continue
    const where = t.side ?? `${t.hp}`
    const at = t.side === 'under' ? -1 : t.side === 'over' ? 2 : t.at
    const was = pins.get(where) ?? { at, side: t.side ?? '', stars: [] }
    was.stars.push({ key: t.made.key, star: t.made.starred })
    pins.set(where, was)
  }
  if (pins.size === 0) return null
  return (
    <span className="ft-band" aria-hidden="true">
      <span className="ft-band__track" />
      {tiles.min !== null && tiles.max !== null && tiles.min !== tiles.max ? (
        <>
          <span className="ft-band__end" data-at="min">
            {AU.format(tiles.min)}
          </span>
          <span className="ft-band__end" data-at="max">
            {AU.format(tiles.max)}
          </span>
        </>
      ) : null}
      {[...pins.entries()].map(([where, p]) => (
        <span
          key={where}
          className="ft-band__pin"
          data-side={p.side === '' ? undefined : p.side}
          style={{
            ['--ft-at' as string]: `${bandX(p.at).toFixed(2)}%`,
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

/** THE QUOTE THIS ANSWER STARTS (the fitment judge, blocker 3), at the plate's foot: the boat,
 *  the motor and trailer chosen on their tiles, what the priced parts come to, and the press. */
function StartLine({
  fit,
  motor,
  trailer,
  left = '',
  refused,
  onStart,
}: {
  fit: BoatFit
  motor: Rigged | null
  trailer: TrailerMade | null
  /** the trailer left off because its ATM is over, as a sentence; '' for none */
  left?: string
  refused: string
  onStart: () => void
}) {
  const named: string[] = [`this ${fit.name}`]
  const kit = motor?.kit ?? null
  if (motor) {
    named.push(
      `the ${motor.motor.name}${kit === null ? '' : kit.retired ? ', without the rigging kit its pairing names, which is no longer sold,' : ' and its rigging kit'}`,
    )
  }
  if (trailer) named.push(`the ${trailer.name}`)
  const said =
    named.length === 1
      ? `${named[0]!.charAt(0).toUpperCase()}${named[0]!.slice(1)}, on its own.`
      : `${named.slice(0, -1).join(', ').replace(/^t/, 'T')} and ${named.at(-1)}.`
  /* only what is on the quote: a trailer not chosen is not a part with no price */
  const figures = [
    fit.price,
    ...(motor ? [motor.motor.price] : []),
    ...(trailer ? [trailer.price] : []),
  ]
  const priced = figures.filter((n): n is number => n !== null)
  const together = priced.reduce((n, p) => n + p, 0)
  const kitOut = kit !== null && !kit.retired && kit.price === null
  const kitIn = kit !== null && kit.price !== null ? kit.price : 0
  const missing = figures.length - priced.length
  return (
    <div className="ft-start" aria-labelledby="ft-start">
      <div className="ft-start__say">
        <h2 className="ft-start__word" id="ft-start">
          A quote with
        </h2>
        <p className="ft-start__what">{said}</p>
        {priced.length > 0 ? (
          <p className="ft-start__sum">
            <PriceFigure amount={together + kitIn} />
            <span>
              {fit.priceName === '' ? 'together' : `together, at ${fit.priceName}`}
              {kitOut ? ', before the rigging kit, whose price is not chosen yet' : ''}
              {missing > 0 ? `, and ${count(missing)} with no price on the price list` : ''}.
            </span>
          </p>
        ) : null}
        {left === '' ? null : (
          <p className="ft-start__left">
            <Icon glyph={WarningIcon} size="sm" />
            <span>{left}</span>
          </p>
        )}
      </div>
      <span className="ft-start__act">
        <Button intent="primary" icon={ReceiptIcon} onClick={onStart}>
          Start the quote
        </Button>
        {refused === '' ? null : (
          <span className="ft-start__why" role="alert">
            {refused}
          </span>
        )}
      </span>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* The acts on a tile                                           */
/* ---------------------------------------------------------- */

interface Changing {
  change: (target: Place, act: FitAct, place?: 'motor' | 'trailer') => void
  refusal: FitRefusal | null
}

interface OpenProps extends Changing {
  fit: BoatFit
  ctx: CatalogueCtx
  showAll: (slot: string, group?: string) => void
  sheetHref: (opens: Opens) => string
  openSheet: (opens: Opens) => void
  openRules: () => void
  openHref: (href: string) => void
  /** the pairing chosen for the quote here; null for none */
  chosen: string | null
  onChoose: (key: string) => void
}

/** THE THREE PRESSES ON A TILE: for the quote started here, the recommended, and off the boat. */
function TileActs({
  name,
  boatName,
  place,
  pairKey,
  starred,
  chosen,
  onChoose,
  where,
  change,
  refusal,
  onAccent = false,
}: Changing & {
  name: string
  boatName: string
  place: Place
  pairKey: string
  starred: boolean
  chosen: boolean
  onChoose: (key: string) => void
  where: 'motor' | 'trailer'
  onAccent?: boolean
}) {
  /* THE SAME TWO ROWS ON EVERY TILE (the fitment verifier, 2026-11-03: the starred tile put its
     two presses on one row while the others wrapped theirs, so a row of tiles ended unevenly): the
     press for the quote on its own row, then what changes the boat */
  return (
    <span className="ft-acts">
      <span className="ft-acts__row">
        <Button
          intent={onAccent ? 'veiled' : 'quiet'}
          size="sm"
          icon={chosen ? CheckCircleIcon : CircleIcon}
          aria-pressed={chosen}
          onClick={() => onChoose(chosen ? 'none' : pairKey)}
          aria-label={
            chosen
              ? `The ${name} is on the quote started here; press to start it without a ${where}`
              : `Put the ${name} on the quote started here`
          }
        >
          {chosen ? 'On the quote' : 'Quote this one'}
        </Button>
      </span>
      <span className="ft-acts__row">
        {starred ? null : (
          <Button
            intent={onAccent ? 'veiled' : 'quiet'}
            size="sm"
            icon={StarIcon}
            onClick={() => change(place, 'star', where)}
            aria-label={`Make the ${name} the recommended ${where} for the ${boatName}`}
          >
            Recommend it
          </Button>
        )}
        <Button
          intent={onAccent ? 'veiled' : 'quiet'}
          size="sm"
          icon={MinusCircleIcon}
          onClick={() => change(place, 'off')}
          aria-label={`Take the ${name} off what goes on the ${boatName}`}
        >
          Take it off
        </Button>
      </span>
      {refusal?.rowId === place.rowId ? (
        <span className="ft-off__why" role="alert">
          {refusal.why}
        </span>
      ) : null}
    </span>
  )
}

/* ---------------------------------------------------------- */
/* Under the Motor line                                         */
/* ---------------------------------------------------------- */

function MotorOpen({
  fit,
  ctx,
  rigs,
  across,
  chosen,
  onChoose,
  compare,
  onCompare,
  showAll,
  sheetHref,
  openSheet,
  openRules,
  openHref,
  change,
  refusal,
}: OpenProps & {
  rigs: Rigged[]
  across: string
  compare: boolean
  onCompare: (on: boolean) => void
}) {
  const motor = fit.motor
  const tiles = useMemo(() => motorTiles(ctx, fit), [ctx, fit])
  /* THE REASONS AND THEIR ONE HEAD FIGURE, read in src/domain off the plate line's own pair */
  const held = useMemo(() => heldBack(ctx, fit, 'motor'), [ctx, fit])
  if (!motor || !tiles) return null
  const outside = new Map(tiles.tiles.map((t) => [t.made.key, t.outside]))
  /* the kit list's price, said once over the tiles where Northside has not chosen it */
  const unchosenKit = rigs.find((r) => r.kit?.unchosen)?.kit ?? null
  /* the kits no longer sold, said once over the tiles, with the door to the first one's pairing */
  const retired = retiredKitsSaid(rigs)
  const firstRetired = rigs.find((r) => r.kit?.retired && r.motor.pairing) ?? null
  const shared = sharedFacts(rigs)
  /* four to a row on the desk, one on a phone; at 834 and 844 three to a row where they share
     their rows evenly, else ONE TO A ROW, LAID ACROSS (the fitment verifier, 2026-11-03: seven at
     three stood 3 + 2 + 2, the tiles of rows 2 and 3 wider than row 1's) */
  const midEven = evenly(rigs.length, 3)
  const tileRows = rowsStyle(rigs.length, { desk: 4, mid: midEven ? 3 : 1, phone: 1 })
  return (
    <section className="ft-place" aria-labelledby="ft-motor">
      <div className="ft-bar">
        <h2 className="ft-bar__title" id="ft-motor">
          Motor <span className="ft-bar__maker">{tiles.maker}</span>
        </h2>
        <span className="ft-bar__acts">
          {rigs.length > 1 ? (
            <Button
              intent="quiet"
              size="sm"
              icon={compare ? SquaresFourIcon : ColumnsIcon}
              aria-pressed={compare}
              onClick={() => onCompare(!compare)}
            >
              {compare ? 'Back to the tiles' : `Compare the ${count(rigs.length)} side by side`}
            </Button>
          ) : null}
          <Button intent="quiet" size="sm" icon={ListBulletsIcon} onClick={() => showAll('motor')}>
            {`Show all ${count(motor.counts.live)}, each with its reason`}
          </Button>
        </span>
      </div>
      {across === '' ? null : <p className="ft-quiet ft-across">{across}</p>}
      {unchosenKit ? (
        <p className="ft-unchosen">
          <span>
            {`Northside has not chosen which of the rigging kits’ figures is their price, so no kit is added into a figure here.`}
          </span>
          <Button
            intent="quiet"
            size="sm"
            icon={ArrowUpRightIcon}
            href={pricesOf(unchosenKit.place.tableId)}
            onClick={() => openHref(pricesOf(unchosenKit.place.tableId))}
          >
            Choose it on Prices
          </Button>
        </p>
      ) : null}
      {retired === '' ? null : (
        <p className="ft-unchosen" data-tone="gone">
          <span>{retired}</span>
          {firstRetired?.motor.pairing ? (
            <Button
              intent="quiet"
              size="sm"
              icon={ArrowUpRightIcon}
              href={sheetHref({
                tableId: firstRetired.motor.pairing.tableId,
                at: firstRetired.motor.pairing.rowId,
              })}
              onClick={() =>
                openSheet({
                  tableId: firstRetired.motor.pairing!.tableId,
                  at: firstRetired.motor.pairing!.rowId,
                })
              }
            >
              {`Open the ${firstRetired.model}’s line`}
            </Button>
          ) : null}
        </p>
      )}
      {shared.length > 0 && !compare ? (
        <div className="ft-shared">
          <p className="ft-shared__lead">{`Alike on all ${count(rigs.length)}`}</p>
          <dl className="ft-shared__list" aria-label="What every one of them is rigged with">
            {shared.map((f) => (
              <div key={f.label} className="ft-shared__one">
                <dt>{f.label}</dt>
                <dd>{codesKept(f.value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
      {rigs.length === 0 ? (
        <p className="ft-none">No {tiles.maker} motor on the price list is made for this boat.</p>
      ) : compare ? (
        <CompareTable ctx={ctx} rigs={rigs} chosen={chosen} />
      ) : (
        <ul className="ft-tiles" aria-label="Made for it" data-mid={midEven ? undefined : 'across'}>
          {rigs.map((r, i) => (
            <RigTile
              key={r.key}
              style={tileRows[i]}
              r={r}
              shared={shared}
              saidAbove={unchosenKit !== null}
              outside={outside.get(r.key) ?? ''}
              boatName={fit.name}
              chosen={chosen === r.key}
              onChoose={onChoose}
              change={change}
              refusal={refusal}
            />
          ))}
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

/** ONE MOTOR ON THIS BOAT: its figure, the rigging kit, prop and engine hole its pairing names,
 *  and the two together where both are priced (the fitment judge, blocker 2). */
function RigTile({
  r,
  outside,
  boatName,
  chosen,
  onChoose,
  change,
  refusal,
  shared,
  saidAbove,
  style,
}: Changing & {
  /** its share of its row (`rowsStyle`) */
  style?: CSSProperties | undefined
  r: Rigged
  /** what every tile shares, said once above them */
  shared: readonly { label: string; value: string }[]
  /** the kit's price not chosen is said once above the tiles */
  saidAbove: boolean
  outside: string
  boatName: string
  chosen: boolean
  onChoose: (key: string) => void
}) {
  const star = r.motor.starred
  return (
    <li
      className="ft-tile"
      style={style}
      data-ground="plate"
      data-star={star ? '' : undefined}
      data-chosen={chosen ? '' : undefined}
    >
      {/* WHO IT IS, AND WHAT IT IS RIGGED WITH: one column each where the tile is laid across a
          row (834 and 844, `data-mid`), and nothing at all in a standing tile */}
      <div className="ft-tile__who">
        <p className="ft-tile__name">
          {star ? (
            <span className="ft-tile__star" aria-label="Recommended">
              <Icon glyph={StarIcon} weight="fill" size="sm" />
            </span>
          ) : null}
          <span className="ft-tile__model">{r.model}</span>
          {r.motor.price === null ? null : (
            <span className="ft-tile__price">
              <PriceFigure amount={r.motor.price} />
            </span>
          )}
        </p>
        {r.motor.facts === '' ? null : <p className="ft-tile__facts">{r.motor.facts}</p>}
        {outside === '' ? null : (
          <p className="ft-tile__warn">
            <Icon glyph={WarningIcon} size="sm" />
            {outside}
          </p>
        )}
        {r.motor.rule && r.motor.rule.because !== '' ? (
          <p className="ft-tile__rule">{r.motor.rule.because}</p>
        ) : null}
      </div>
      <div className="ft-tile__rigged">
        <dl className="ft-rig">
          {r.kit ? (
            <div className="ft-rig__one">
              <dt>Rigging kit</dt>
              <dd>
                <span className="ft-rig__kit">{r.kit.name}</span>
                {r.kit.price === null ? (
                  <span className="ft-rig__note">
                    {r.kit.retired
                      ? 'No longer sold'
                      : r.kit.unchosen
                        ? 'Price not chosen'
                        : 'No price'}
                  </span>
                ) : (
                  <PriceFigure amount={r.kit.price} />
                )}
              </dd>
            </div>
          ) : null}
          {r.with
            .filter((w) => !shared.some((f) => f.label === w.label && f.value === w.value))
            .map((w) => (
              <div key={w.label} className="ft-rig__one">
                <dt>{w.label}</dt>
                <dd>{codesKept(w.value)}</dd>
              </div>
            ))}
        </dl>
        {r.total !== null && r.kit !== null ? (
          <p className="ft-tile__total">
            <span className="ft-tile__on">On this boat</span>
            <PriceFigure amount={r.total} />
          </p>
        ) : (saidAbove && r.kit?.unchosen) || r.kit?.retired ? null : (
          <p className="ft-tile__total">
            <span className="ft-rig__note">{rigSaid(r)}</span>
          </p>
        )}
      </div>
      <TileActs
        name={r.motor.name}
        boatName={boatName}
        place={r.motor.place}
        pairKey={r.key}
        starred={star}
        chosen={chosen}
        onChoose={onChoose}
        where="motor"
        change={change}
        refusal={refusal}
        onAccent={star}
      />
    </li>
  )
}

/** THE OFFERED MOTORS SIDE BY SIDE (the fitment judge, major 4): one column per motor, one row per
 *  fact, the recommended first, the one chosen for the quote marked. Its own box scrolls sideways
 *  on a phone; the page never does. */
function CompareTable({
  ctx,
  rigs,
  chosen,
}: {
  ctx: CatalogueCtx
  rigs: Rigged[]
  chosen: string | null
}) {
  const rows = useMemo(() => compareOf(ctx, rigs), [ctx, rigs])
  return (
    <section
      className="ft-compare"
      data-ground="plate"
      aria-label="The motors made for it, side by side"
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
    >
      <table className="ft-compare__table">
        <thead>
          <tr>
            <th scope="col" className="ft-compare__corner">
              <span className="ft-sr">What</span>
            </th>
            {rigs.map((r) => (
              <th
                key={r.key}
                scope="col"
                data-star={r.motor.starred ? '' : undefined}
                data-chosen={chosen === r.key ? '' : undefined}
              >
                <span className="ft-compare__head">
                  {r.motor.starred ? (
                    <span className="ft-tile__star" aria-label="Recommended">
                      <Icon glyph={StarIcon} weight="fill" size="sm" />
                    </span>
                  ) : null}
                  {r.model}
                </span>
                {chosen === r.key ? <span className="ft-compare__on">On the quote</span> : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} data-money={row.money ? '' : undefined}>
              <th scope="row">{row.label}</th>
              {row.cells.map((c, i) => (
                <td key={rigs[i]!.key} data-chosen={chosen === rigs[i]!.key ? '' : undefined}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

/* ---------------------------------------------------------- */
/* Under the Trailer line: E's answer, on the true weight       */
/* ---------------------------------------------------------- */

function TrailerOpen({
  fit,
  ctx,
  chosen,
  onChoose,
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
  /* what is offered, and only that: a trailer a rule refuses is one of the reasons below */
  const shown = offeredIn(trailer.made).toSorted(
    /* in the price list's own order, list by list, so Recommend it never moves a tile under the
       pointer (the fitment verifier, 2026-11-03) */
    (a, b) =>
      trailer.lists.findIndex((l) => l.tableId === a.place.tableId) -
        trailer.lists.findIndex((l) => l.tableId === b.place.tableId) || a.at - b.at,
  )
  /* NOTHING MADE FOR IT, NOTHING TO WEIGH OR TALLY. Where the price list makes no trailer for a
     boat, its line says so once, and every one on sale is still a press away in Show all. */
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
        <>
          <ul className="ft-trailers" aria-label="Made for it">
            {shown.map((t) => (
              <TrailerTile
                key={t.key}
                t={t}
                tow={tows.get(t.key) ?? null}
                scale={scale}
                offeredInstead={shown.some((o) => o.crosses && o.key !== t.key)}
                sheetHref={sheetHref}
                openSheet={openSheet}
                boatName={fit.name}
                chosen={chosen === t.key}
                onChoose={onChoose}
                change={change}
                refusal={refusal}
              />
            ))}
          </ul>
          {/* the one-trailer rule, said once, under both, where a second trailer is offered */}
          {trailer.oneTrailer === '' || shown.length < 2 ? null : (
            <p className="ft-trl__rule">{trailer.oneTrailer}</p>
          )}
        </>
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
  offeredInstead,
  sheetHref,
  openSheet,
  boatName,
  chosen,
  onChoose,
  change,
  refusal,
}: Changing & {
  boatName: string
  t: TrailerMade
  tow: Tow | null
  scale: number
  offeredInstead: boolean
  sheetHref: (opens: Opens) => string
  openSheet: (opens: Opens) => void
  chosen: boolean
  onChoose: (key: string) => void
}): ReactNode {
  const rated = tow?.rated != null && scale > 0 ? tow.rated / scale : null
  const total = tow?.total != null && scale > 0 ? tow.total / scale : null
  const over = tow?.standing === 'over'
  const opens: Opens = { tableId: t.place.tableId, at: t.place.rowId }
  return (
    <li
      className="ft-trl"
      data-ground="plate"
      data-star={t.crosses ? '' : undefined}
      data-chosen={chosen ? '' : undefined}
    >
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
      <p className="ft-trl__tag" data-over={over ? '' : undefined}>
        {/* a trailer over its ATM is put on no quote here, and its weighing says by how much */}
        {over
          ? 'Over its ATM, so not for a quote'
          : t.crosses
            ? 'On a new quote'
            : offeredInstead
              ? 'Offered in its place'
              : ''}
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
      <span className="ft-trl__foot">
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
        <TileActs
          name={t.name}
          boatName={boatName}
          place={t.place}
          pairKey={t.key}
          starred={t.starred}
          chosen={chosen}
          onChoose={onChoose}
          where="trailer"
          change={change}
          refusal={refusal}
        />
      </span>
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
  openHref,
}: Changing & {
  boatName: string
  lists: ListFit[]
  showAll: (slot: string, group?: string) => void
  openHref: (href: string) => void
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
            const held = listHeld(l)
            /* THE PRICE NOT CHOSEN, SAID ONCE FOR THE LIST (the fitment judge, major 9): four
               packages stood with no figure and no word; the build and Prices say why */
            const unchosen = l.made.some((m) => m.price === null && m.unchosen !== null)
            return (
              <section
                key={l.tableId}
                className="ft-also__list"
                data-ground="plate"
                aria-label={l.name}
              >
                <div className="ft-also__head">
                  <h3 className="ft-also__name">{l.name}</h3>
                  <span className="ft-also__n">
                    {`${count(l.made.length - held.refused)} of ${count(l.live)} offered`}
                  </span>
                </div>
                {unchosen ? (
                  <p className="ft-unchosen" data-in="list">
                    <span>
                      {`Northside has not chosen which of ${l.name}’ figures is its price, so none is shown here.`}
                    </span>
                    <Button
                      intent="quiet"
                      size="sm"
                      icon={ArrowUpRightIcon}
                      href={pricesOf(l.tableId)}
                      onClick={() => openHref(pricesOf(l.tableId))}
                    >
                      Choose it on Prices
                    </Button>
                  </p>
                ) : null}
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
                {held.others === 0 ? null : (
                  <p className="ft-also__rest">
                    <span>
                      {`The other ${count(held.notMade)} ${held.notMade === 1 ? 'is' : 'are'} not made for this boat${held.refused > 0 ? `, and ${count(held.refused)} ${held.refused === 1 ? 'is' : 'are'} refused by your rules` : ''}.`}
                    </span>
                    <Button
                      intent="quiet"
                      size="sm"
                      icon={ListBulletsIcon}
                      onClick={() => showAll(l.tableId)}
                      aria-label={`Show all ${count(l.live)} in ${l.name}`}
                    >
                      {`Show all ${count(l.live)}`}
                    </Button>
                  </p>
                )}
              </section>
            )
          })}
      </div>
    </section>
  )
}

/** THE PRESS THAT TAKES ONE THING OFF THIS BOAT, on the thing's own line, and the sentence where
 *  a press was refused. */
function TakeOff({
  name,
  boatName,
  place,
  change,
  refusal,
}: Changing & { name: string; boatName: string; place: Place }) {
  return (
    <span className="ft-off">
      <Button
        intent="quiet"
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
        word: 'Open the boat’s line',
        aria: `Open the ${boatName}’s line on the price list, which carries its horsepower`,
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
        word: 'Open its line',
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
  /* five to a row on the desk, three at 834 and 844 (five are 3 + 2, each row full), one on a
     phone: never one alone, never a blank cell (`rows.ts`) */
  const rows = gridStyle(held.groups.length, { desk: 5, mid: 3, phone: 1 })
  return (
    <>
      <h3 className="ft-why">The other {count(held.others)}, and why</h3>
      {/* A ROW OF GAUGES ON THE ROOM, NOT A WHITE CARD OF ROWS: each reason stands in its own
          column under a track filled to its share of the others. The share is drawn only; the
          count is said. */}
      <ul className="ft-reasons" data-n={held.groups.length} style={rows.list}>
        {held.groups.map((h, i) => {
          const door = h.door ? doorSaid(h.door, boatName, h.example?.name ?? '') : null
          const opens = h.door && h.door.kind !== 'rules' ? h.door.opens : null
          return (
            <li
              key={h.id}
              className="ft-reason"
              style={rows.items[i]}
              data-ruled={h.id === 'ruled' ? '' : undefined}
            >
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
      <span>
        {said}{' '}
        <span className="ft-rules__write">
          <Button intent="quiet" size="sm" href="/rules" onClick={openRules}>
            Write a rule
          </Button>
        </span>
      </span>
    </p>
  )
}
