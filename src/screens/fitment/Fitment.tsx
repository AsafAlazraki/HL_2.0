/* ============================================================
   FITMENT — one boat at a time, and what can be fitted to it, with
   everything struck through carrying the reason it was struck.

   Direction C, "The rig", of docs/directions/fitment-boards/, with B's
   horsepower envelope grafted into the transom callout and the trailer
   counts made to add up to one universe (the verdict's must-change).

   THE BOAT IS THE HERO. Its own photograph stands in the middle of the
   first plate with numbered callouts round it, in the place each thing
   goes: 1 the motor at the transom, 2 the trailer under the boat, and
   then what the boat's page lists besides — dealer fit, parts — on the
   other side. The numbers are the screen's signature: they are what
   keeps it from being the build's render-and-chapters, and on a phone
   they are the order the plates come in.

   NOT ONE SENTENCE OF A REASON IS WRITTEN HERE. Every "because" — the
   horsepower the boat takes, the trailer built for another maker, the
   rule that a boat goes home on one trailer, the ATM against the boat's
   weight, a dealer's own rule — comes out of `@/domain/fitment` (`boat.ts`
   reads it, `say.ts` says it). This file lays them out.

   EVERY NARROWING IS NAMED, COUNTED, AND CAN BE SWITCHED OFF — the
   curation contract (`@/domain/catalogue/curation`): each place says how
   many of how many are made for this boat and offers Show all, which
   opens the whole list grouped by reason (`Whole.tsx`), and a struck line
   always opens on the price list where it is decided (`sheet.ts`).
   ============================================================ */
import { useCallback, useMemo, type ReactNode } from 'react'
import {
  ArrowUpRightIcon,
  DatabaseIcon,
  EngineIcon,
  ListMagnifyingGlassIcon,
  StarIcon,
  TruckTrailerIcon,
  WrenchIcon,
  XIcon,
} from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { Button, Icon, Picture, PriceFigure, move, transition } from '@/ui'
import { useCatalogue, useQuotes } from '@/app/useStores'
import { ctxFrom } from '@/state/catalogue'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { copyOf, itemOf, pictureOf, srcSetOf } from '@/data/pictures'
import { makeCtx } from '@/domain/model'
import { rowLabel } from '@/domain/model'
import {
  offeredOf,
  readBoatFit,
  readWhole,
  type BoatFit,
  type BoatFound,
  type ListFit,
  type Made,
  type MotorFit,
  type Opens,
  type RuleSaid,
  type TrailerFit,
  type TrailerMade,
} from '@/domain/fitment/boat'
import { spokenBoat } from '@/domain/quote/spoken'
import { Envelope } from './Envelope'
import { Whole } from './Whole'
import { AnotherBoat, ChooseABoat } from './Chooser'
import './fitment.css'

export type { Opens }

export interface FitmentPosition {
  boat?: string
  all?: string
  find?: string
  at?: string
}

export interface FitmentProps {
  /** the boat, by its line on the price list; '' for none chosen */
  boat: string
  /** the place whose whole list is open: 'motor', 'trailer' or a list's id */
  all: string
  find: string
  /** the motor whose note is open on the horsepower */
  at: string
  onPosition: (next: FitmentPosition) => void
  openBoat: (rowId: string) => void
  sheetHref: (opens: Opens) => string
  openSheet: (opens: Opens) => void
  openTheFile: () => void
}

const AU = new Intl.NumberFormat('en-AU')
const KIND_GLYPH = { motor: EngineIcon, trailer: TruckTrailerIcon } as const

export function Fitment({
  boat,
  all,
  find,
  at,
  onPosition,
  openBoat,
  sheetHref,
  openSheet,
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

  const inspect = useCallback((key: string) => onPosition({ at: key }), [onPosition])
  const showAll = useCallback(
    (slot: string) => {
      onPosition({ all: slot, find: '', at: '' })
      window.scrollTo({ top: 0 })
    },
    [onPosition],
  )

  if (!read || !open) {
    return (
      <main className="ft" data-testid="fitment" data-read={read ? '' : undefined}>
        <header className="ft-head">
          <div className="ft-head__who">
            <p className="ft-eyebrow">Fitment</p>
            <h1 className="ft-title">What goes on a boat</h1>
          </div>
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
        <header className="ft-head">
          <div className="ft-head__who">
            <p className="ft-eyebrow">Fitment</p>
            <h1 className="ft-title">Which boat?</h1>
            <p className="ft-crumbs">
              {boat === ''
                ? 'Choose one, and see every motor, trailer and fit-out that goes on it, and why the rest do not.'
                : 'That boat is not on the price list. Choose another.'}
            </p>
          </div>
        </header>
        <div className="ft-pick">
          <ChooseABoat world={ctx} onChoose={openBoat} recent={recent} />
        </div>
      </main>
    )
  }

  const maker = fit.trailer?.maker ?? spokenBoat(fit.place.tableId, '').maker
  const crumbs = [maker, ...fit.path].filter((s) => s !== '')

  return (
    <main
      className="ft"
      data-testid="fitment"
      data-read=""
      data-boat={fit.place.rowId}
      data-mode={whole ? 'all' : 'rig'}
    >
      <header className="ft-head">
        <div className="ft-head__who">
          <p className="ft-eyebrow">Fitment · what goes on this boat</p>
          <h1 className="ft-title">
            {fit.name}
            {fit.detail === '' ? null : <span className="ft-title__detail">{fit.detail}</span>}
          </h1>
          <p className="ft-crumbs">
            <span className="ft-path">{crumbs.join(' › ')}</span>
            {fit.code === '' ? null : <span className="ft-code">{fit.code}</span>}
            {fit.priceName === '' ? null : (
              <span className="ft-pricename">Prices at {fit.priceName}</span>
            )}
          </p>
        </div>
        <div className="ft-head__act">
          <AnotherBoat world={ctx} onChoose={openBoat} recent={recent} />
        </div>
      </header>

      {whole ? (
        <Whole
          key={whole.slot}
          list={whole}
          find={find}
          onFind={(words) => onPosition({ find: words })}
          onClose={() => onPosition({ all: '', find: '' })}
          sheetHref={sheetHref}
          openSheet={openSheet}
        />
      ) : (
        <Rig
          fit={fit}
          at={at}
          inspect={inspect}
          showAll={showAll}
          sheetHref={sheetHref}
          openSheet={openSheet}
        />
      )}
    </main>
  )
}

/* ---------------------------------------------------------- */
/* The rig: the boat in the middle, its places round it        */
/* ---------------------------------------------------------- */

interface RigProps {
  fit: BoatFit
  at: string
  inspect: (key: string) => void
  showAll: (slot: string) => void
  sheetHref: (opens: Opens) => string
  openSheet: (opens: Opens) => void
}

function Rig({ fit, at, inspect, showAll, sheetHref, openSheet }: RigProps) {
  /* THE BOAT'S OWN RENDER FIRST — the price list's Image Link for this very finish, which on a
     Highfield is the maker's view from above, the view the callouts are drawn round — and the
     one picture reader's answer for this boat after it. Never a stand-in (src/data/pictures). */
  const item = itemOf(fit.place.tableId, fit.place.rowId, fit.imageAddress)
  const shown = copyOf(item) ?? pictureOf(item)
  /* the lists after the motor and the trailer are numbered from 3, in the page's own order */
  const lists = fit.lists.map((l, i) => ({ list: l, n: i + 3 }))

  return (
    /* EVERY WORD IN THE BODY STANDS ON A WHITE PLATE — the ring's ground, the trailer's plate, and
       on a phone each callout's own — so the body wears the plate's day inks in both themes
       (tokens.css, THE PLATE), as the kit's own plates do */
    <div className="ft-body" data-ground="plate" data-photo={shown ? undefined : 'none'}>
      {/* THE RING'S ONE WHITE PLATE, holding the motor, the boat and the side lists — the board's
          single plate rather than three cards. On a phone it steps aside (`display: contents`)
          and each callout is its own plate, in the callouts' own numbers. */}
      <div className="ft-rig">
        {/* THE RING NEEDS A BOAT TO STAND ROUND. With no photograph on the price list there is
            nothing for the discs to point at, so there is no stage and no discs: the callouts
            close up into two columns and keep their own numbers in their heads, which are still
            the order a phone reads them in (built-critique-m3.md: "four dots around an empty
            box"). Never a stand-in boat (src/data/pictures). */}
        {shown ? (
          <figure className="ft-stage">
            <Picture
              src={shown.src}
              srcSet={srcSetOf(shown)}
              sizes="(min-width: 1180px) 50vw, 100vw"
              alt={`The ${fit.name}${fit.detail === '' ? '' : `, ${fit.detail}`}`}
              width={shown.width}
              height={shown.height}
              fit="contain"
              priority
            />
            <span className="ft-pin" data-at="motor" aria-hidden="true">
              1
            </span>
            <span className="ft-pin" data-at="trailer" aria-hidden="true">
              2
            </span>
            {lists.map(({ n }, i) => (
              <span
                key={n}
                className="ft-pin"
                data-at="side"
                aria-hidden="true"
                style={{ ['--ft-pin-y' as string]: `${((i + 1) / (lists.length + 1)) * 100}%` }}
              >
                {n}
              </span>
            ))}
          </figure>
        ) : null}

        {fit.motor ? (
          <MotorCallout
            motor={fit.motor}
            at={at}
            inspect={inspect}
            showAll={() => showAll('motor')}
            sheetHref={sheetHref}
            openSheet={openSheet}
            boatLabel={fit.label}
          />
        ) : (
          <section className="ft-call ft-motor" aria-label="Motor">
            <Head n={1} glyph={EngineIcon} word="Motor" where="at the transom" />
            <p className="ft-quiet">Nothing on the price list is a motor for this boat.</p>
          </section>
        )}

        <div className="ft-side">
          {lists.map(({ list, n }) => (
            <ListCallout
              key={list.tableId}
              list={list}
              n={n}
              showAll={() => showAll(list.tableId)}
            />
          ))}
        </div>
      </div>

      {fit.trailer ? (
        <TrailerPlate
          trailer={fit.trailer}
          showAll={() => showAll('trailer')}
          sheetHref={sheetHref}
          openSheet={openSheet}
        />
      ) : null}
    </div>
  )
}

function Head({
  n,
  glyph,
  word,
  where,
}: {
  n: number
  glyph: typeof EngineIcon
  word: string
  where: string
}) {
  return (
    <h2 className="ft-call__head">
      <span className="ft-num" aria-hidden="true">
        {n}
      </span>
      <Icon glyph={glyph} size="sm" />
      <span className="ft-call__word">{word}</span>
      {where === '' ? null : <span className="ft-call__where">{where}</span>}
    </h2>
  )
}

/** The narrowing, named and counted, and the way past it: the curation contract in one line.
 *  ITS FIRST FIGURE IS WHAT THE BUILD OFFERS (`offeredOf`, built-critique-m3.md blocker 4): a thing
 *  a dealer's rule refuses is one of the "more, each with its reason" — its reason is the rule's
 *  own because, struck on its line just above — so "2 of 209" here is the build's "Back to the 2". */
function Curation({
  made,
  total,
  onShowAll,
}: {
  made: readonly Made[]
  total: number
  onShowAll: () => void
}) {
  const { offered } = offeredOf(made)
  const rest = Math.max(0, total - offered)
  return (
    <div className="ft-cur">
      <p className="ft-cur__say">
        <span className="ft-cur__n">
          {AU.format(offered)} of {AU.format(total)}
        </span>{' '}
        made for this boat
        {rest > 0 ? (
          <span className="ft-cur__hid"> · {AU.format(rest)} more, each with its reason</span>
        ) : null}
      </p>
      <Button intent="quiet" size="sm" icon={ListMagnifyingGlassIcon} onClick={onShowAll}>
        {`Show all ${AU.format(total)}`}
      </Button>
    </div>
  )
}

/** A dealer's own rule, where it bites: the rule's own words, quoted. */
function RuleLine({ rule }: { rule: RuleSaid | null }) {
  if (!rule) return null
  return (
    <span className="ft-ruled" data-severity={rule.severity}>
      {rule.because === '' ? 'Refused by one of your rules.' : rule.because}
    </span>
  )
}

/* ---- 1 · the motor ---- */

function MotorCallout({
  motor,
  at,
  inspect,
  showAll,
  sheetHref,
  openSheet,
  boatLabel,
}: {
  motor: MotorFit
  at: string
  inspect: (key: string) => void
  showAll: () => void
  sheetHref: (opens: Opens) => string
  openSheet: (opens: Opens) => void
  /** the boat as the price list spells it, which its list of what fits is found by */
  boatLabel: string
}) {
  const star = motor.made.find((m) => m.starred) ?? null
  const rest = motor.made.filter((m) => m !== star)
  const kit = star?.goesWith.find((f) => /rigging kit/i.test(f.label))?.value ?? ''
  const dot = at === '' ? null : (motor.dots.find((d) => d.key === at) ?? null)
  const made = dot ? motor.made.find((m) => m.key === dot.key) : undefined
  const refusedDot = dot?.rule?.severity === 'blocked'
  const opens: Opens | null = dot
    ? made?.pairing
      ? { tableId: made.pairing.tableId, at: made.pairing.rowId }
      : motor.pairingTableId
        ? { tableId: motor.pairingTableId, find: boatLabel }
        : null
    : null

  return (
    <section className="ft-call ft-motor" aria-labelledby="ft-motor-head">
      <span id="ft-motor-head" className="ft-sr">
        Motor
      </span>
      <Head n={1} glyph={KIND_GLYPH.motor} word="Motor" where="at the transom" />
      {star ? (
        <div className="ft-star">
          <p className="ft-star__name">
            <span className="ft-star__glyph" aria-label="Recommended">
              <Icon glyph={StarIcon} weight="fill" />
            </span>
            <span className={star.rule?.severity === 'blocked' ? 'ft-struck' : undefined}>
              {star.name}
            </span>
          </p>
          <p className="ft-star__facts">
            {[star.facts, 'Recommended'].filter((s) => s !== '').join(' · ')}
            {star.price === null ? null : (
              <>
                {' · '}
                <PriceFigure amount={star.price} />
              </>
            )}
          </p>
          <RuleLine rule={star.rule} />
        </div>
      ) : null}

      <Envelope motor={motor} at={at} onInspect={inspect} />

      <AnimatePresence initial={false}>
        {dot ? (
          <motion.div
            key={dot.key}
            className="ft-note"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0, transition: transition('enter') }}
            exit={{ opacity: 0, transition: move.exit }}
          >
            <p className="ft-note__name">
              <span className={refusedDot ? 'ft-struck' : undefined}>{dot.name}</span>
              <span className="ft-note__hp">{AU.format(dot.hp)} hp</span>
              {made?.price == null ? null : <PriceFigure amount={made.price} />}
            </p>
            <p className="ft-note__why">
              {/* a motor the dealer's rule refuses says that rule, never "Made for this boat." */}
              {refusedDot ? null : dot.standing === 'made' ? 'Made for this boat.' : dot.because}
              <RuleLine rule={dot.rule} />
            </p>
            <div className="ft-note__acts">
              {opens ? (
                <Button
                  intent="quiet"
                  size="sm"
                  icon={ArrowUpRightIcon}
                  href={sheetHref(opens)}
                  onClick={() => openSheet(opens)}
                >
                  {dot.standing === 'made'
                    ? 'See it on the price list'
                    : 'See what fits on the price list'}
                </Button>
              ) : null}
              <Button intent="quiet" size="sm" icon={XIcon} onClick={() => inspect('')}>
                Close
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {rest.length > 0 ? (
        <ul className="ft-made">
          {rest.map((m) => (
            <li
              key={m.key}
              className="ft-made__line"
              data-struck={m.rule?.severity === 'blocked' ? '' : undefined}
            >
              <span className="ft-made__name">{m.name}</span>
              <span className="ft-made__fact">{m.facts.split(' · ')[0]}</span>
              <span className="ft-made__price">
                {m.price === null ? null : <PriceFigure amount={m.price} />}
              </span>
              <RuleLine rule={m.rule} />
            </li>
          ))}
        </ul>
      ) : null}

      {kit === '' ? null : (
        <p className="ft-shop">
          <Icon glyph={WrenchIcon} size="sm" />
          <span>
            <span className="ft-shop__lab">For the workshop · rigging kit</span> {kit}
          </span>
        </p>
      )}
      {motor.rigsSay === '' ? null : <p className="ft-quiet">{motor.rigsSay}</p>}

      <Curation made={motor.made} total={motor.counts.live} onShowAll={showAll} />
    </section>
  )
}

/* ---- 3, 4 · what the boat's page lists besides ---- */

function ListCallout({ list, n, showAll }: { list: ListFit; n: number; showAll: () => void }) {
  return (
    <section className="ft-call ft-list-call" aria-label={list.name}>
      <Head
        n={n}
        glyph={list.kind === 'package' ? WrenchIcon : DatabaseIcon}
        word={list.name}
        where=""
      />
      {list.made.length === 0 ? (
        <p className="ft-quiet">Nothing from {list.name} is made for this boat.</p>
      ) : (
        <ul className="ft-items">
          {list.made.map((m) => (
            <li
              key={m.key}
              className="ft-item"
              data-struck={m.rule?.severity === 'blocked' ? '' : undefined}
            >
              <span className="ft-item__name">{m.name}</span>
              {m.price === null ? null : <PriceFigure amount={m.price} />}
              <RuleLine rule={m.rule} />
            </li>
          ))}
        </ul>
      )}
      <Curation made={list.made} total={list.live} onShowAll={showAll} />
    </section>
  )
}

/* ---- 2 · the trailer, under the boat ---- */

function TrailerPlate({
  trailer,
  showAll,
  sheetHref,
  openSheet,
}: {
  trailer: TrailerFit
  showAll: () => void
  sheetHref: (opens: Opens) => string
  openSheet: (opens: Opens) => void
}) {
  const others = trailer.others
  return (
    <section className="ft-call ft-trailer" aria-label="Trailer">
      <Head n={2} glyph={KIND_GLYPH.trailer} word="Trailer" where="under the boat" />
      <div className="ft-trailer__cols">
        <div className="ft-trailer__made">
          {trailer.made.length === 0 ? (
            <p className="ft-quiet">Nothing on the price list is a trailer made for this boat.</p>
          ) : (
            <ul className="ft-trailers">
              {trailer.made.map((t) => (
                <TrailerCard
                  key={t.key}
                  t={t}
                  weight={trailer.boatWeight}
                  others={trailer.made.some((o) => o.crosses && o.key !== t.key)}
                />
              ))}
            </ul>
          )}
          {trailer.oneTrailer === '' ? null : (
            <p className="ft-rule">
              <span className="ft-rule__lab">The rule</span>
              <span>{trailer.oneTrailer}</span>
            </p>
          )}
        </div>

        <div className="ft-trailer__rest">
          <Curation made={trailer.made} total={trailer.onSale} onShowAll={showAll} />
          {others === 0 ? null : (
            <>
              <h3 className="ft-rest__head">
                The other {AU.format(others)}, and why each is not offered
              </h3>
              <ul className="ft-reasons">
                {trailer.groups.map((g) => {
                  const example = g.id === 'another' ? g.makers[0]?.example : g.members[0]
                  return (
                    <li key={g.id} className="ft-reason">
                      <span className="ft-reason__n">{AU.format(g.count)}</span>
                      <div className="ft-reason__say">
                        <p className="ft-reason__head">{g.head}</p>
                        {g.id === 'another' ? (
                          <p className="ft-reason__makers">
                            {g.makers.map((m) => `${m.maker} ${AU.format(m.count)}`).join(' · ')}
                          </p>
                        ) : null}
                        {example ? (
                          <p className="ft-reason__eg">
                            <span className="ft-struck">{example.name}</span>
                            <span className="ft-reason__series">
                              {g.id === 'another' ? `${example.because} ` : ''}
                              {example.series}
                            </span>
                            <Button
                              intent="quiet"
                              size="sm"
                              icon={ArrowUpRightIcon}
                              href={sheetHref({
                                tableId: example.place.tableId,
                                at: example.place.rowId,
                              })}
                              onClick={() =>
                                openSheet({
                                  tableId: example.place.tableId,
                                  at: example.place.rowId,
                                })
                              }
                              aria-label={`See ${example.name} on the price list`}
                            >
                              On the price list
                            </Button>
                          </p>
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
          {trailer.heldSays === '' ? null : <p className="ft-quiet">{trailer.heldSays}</p>}
        </div>
      </div>
    </section>
  )
}

function TrailerCard({
  t,
  weight,
  others,
}: {
  t: TrailerMade
  weight: number | null
  /** another trailer goes on a new quote in this one's place */
  others: boolean
}): ReactNode {
  const scale = Math.max(t.capacity ?? 0, weight ?? 0) * 1.12
  const rated = t.capacity !== null && scale > 0 ? t.capacity / scale : null
  const load = weight !== null && scale > 0 ? weight / scale : null
  return (
    <li className="ft-trl" data-crosses={t.crosses ? '' : undefined}>
      <p className="ft-trl__name">
        {t.starred ? (
          <span className="ft-star__glyph" aria-label="Recommended">
            <Icon glyph={StarIcon} weight="fill" />
          </span>
        ) : null}
        <span
          className={t.rule?.severity === 'blocked' ? 'ft-trl__said ft-struck' : 'ft-trl__said'}
        >
          {t.name}
        </span>
        {t.price === null ? null : <PriceFigure amount={t.price} />}
      </p>
      <p className="ft-trl__tag">
        {[
          t.starred ? 'Recommended' : '',
          t.crosses ? 'On a new quote' : others ? 'Offered in its place' : '',
        ]
          .filter((s) => s !== '')
          .join(' · ')}
      </p>
      {rated !== null ? (
        <div
          className="ft-atm"
          aria-hidden="true"
          data-under={t.floor === 'under' ? '' : undefined}
        >
          <span className="ft-atm__rated" style={{ inlineSize: `${(rated * 100).toFixed(2)}%` }} />
          {load !== null ? (
            <span
              className="ft-atm__load"
              style={{ insetInlineStart: `${(load * 100).toFixed(2)}%` }}
            />
          ) : null}
        </div>
      ) : null}
      <p className="ft-trl__floor" data-under={t.floor === 'under' ? '' : undefined}>
        {t.floorSays}
      </p>
      <RuleLine rule={t.rule} />
    </li>
  )
}
