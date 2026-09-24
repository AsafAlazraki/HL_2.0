import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { Button, Input, PriceFigure, Tile } from '@/ui'
import { useCatalogue, useQuotes, useSession } from '@/app/useStores'
import { quotes as quotesStore } from '@/state/quotes'
import { catalogue } from '@/state/catalogue'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { money } from '@/domain/money'
import {
  coverWords,
  featuredOf,
  flagshipOf,
  fleetOf,
  matchModels,
  modelByKey,
  modelsOf,
  seriesOf,
  unreadIn,
  variantsIn,
  type Brand,
  type Fleet,
  type Model,
  type Series,
  type Variant,
} from './fleet'
import { markOf, pictureOf, srcSetOf, type Held } from './pictures'
import { startQuote, type Started } from './mint'
import './picker.css'

/* ============================================================
   THE PICKER — the maker, then the boat, then the one version of it a
   quote is written for.

   THE SCREEN'S IDEA IS STILL DIRECTION C, "THREE TIERS AT ONCE"
   (docs/research/refs/picker/notes.md §5): once a maker is chosen, the
   makers, that maker's boats and the chosen boat stand in one window
   and nothing navigates, so changing your mind about one answer never
   blanks the other two.

   WHAT CHANGED ON 2026-09-24, AND WHY. The M2-close critique measured
   this screen at 1440 as 2,642 words, 128 of them "row" or "rows" and
   10 "register" — "Choose the register…", "810 rows · 289 models · 42
   series · 7 registers", "A model is not a row", "7 rows · one figure"
   under each model — and 289 models as a text list with no pictures:
   "the owner's own sentence, 'it still feels like a database', on the
   screen every sale passes through." So the arithmetic about the file
   left (Data prints it whole), and what is left is what a showroom
   shows:

     makers    seven doors, each the maker's own mark on paper, the
               dearest of its boats this browser holds a photograph of,
               how many models and the price they start from. The logo
               is the showpiece, which is the owner's own sentence.
     boats     that maker's models as photographs, series by series in
               the file's own order, each with its name and its price.
     the boat  its photograph large, its three figures, the material
               and colour the act waits on, the price and the act.

   Blue and white: the question stands on the file's blue and the floor
   is paper, because the makers' marks are held in dark ink (six of
   seven) and 198 of the 207 studio renders are drawn on white — the
   pictures and the marks this screen is made of are made for paper.

   THE TWO FRAMES NO EARLIER BOARD USED: `porsche-finder.png` — the
   brand step made of marks alone — and `gradywhite-models2.png`, a
   photograph over a name over three figures. Every figure on this
   screen is counted in `./fleet.ts` off the sheet that loaded; not one
   is typed here.
   ============================================================ */

/** Where the reader is inside this screen. A position is a URL search
 *  param (CLAUDE.md), so all three are handed in and handed back
 *  rather than kept in state: Back, a refresh and a shared link all
 *  land on the same three answers.
 *
 *  THE TYPED QUERY IS NOT ONE OF THEM, deliberately. A half-typed word
 *  in the address bar is not a position anybody would share. */
export interface PickerAt {
  /** the maker whose boats are listed; absent means the makers' doors */
  brand?: string
  /** the model the plate is showing */
  model?: string
  /** the one version of that model a quote would be written for */
  row?: string
}

export interface PickerProps {
  at?: PickerAt
  /** where a press writes the new position. A test hands in a spy,
   *  which is why this screen never reaches for the router itself. */
  goTo?: (next: PickerAt) => void
  /** whose file this is, read off the store by the route */
  business?: string | null
  /** the way back to the door, for a desk with no price file in it */
  openTheFile?: () => void
  /** where a minted quote opens — the build, at the quote's own
   *  address. The route always hands it in. A component test with no
   *  router leaves it out, and then the act still writes the quote and
   *  says so where it was pressed; it never claims to have gone
   *  anywhere and never says a screen is missing. */
  openQuote?: (quoteId: string) => void
  /** the clock, injected so a test can say which instant it is asking
   *  about; a quote's reference is stamped from it */
  now?: () => Date
}

/* NO_CONFIGURATOR WAS RETIRED ON 2026-09-23 (built-critique-m2.md #27):
   a refusal saying the build was not built, false since 2026-09-17 and
   kept alive by the test that asserted it. */

/** Nowhere in particular: no maker, no model, no version. One frozen
 *  object rather than a fresh `{}` per render. */
const NOWHERE: PickerAt = Object.freeze({})

/** "1 model", "39 models" — a counted figure's noun agrees with it. */
const countOf = (n: number, one: string, many: string): string =>
  `${n.toLocaleString('en-AU')} ${n === 1 ? one : many}`

/** Which of the three questions the reader is on. Under 834px it is
 *  also which column is drawn (`picker.css`, the ladder). */
type Stage = 'makers' | 'models' | 'boat'

export function Picker({
  at = NOWHERE,
  goTo,
  business = null,
  openTheFile,
  openQuote,
  now,
}: PickerProps) {
  const status = useCatalogue((s) => s.status)
  const problem = useCatalogue((s) => s.problem)
  const tables = useCatalogue((s) => s.tables)
  const rows = useCatalogue((s) => s.rows)
  const who = useSession((s) => s.name)
  /* SUBSCRIBED, AND NOT ONLY READ. Every quote filed here changes what
     the act says — a draft already standing for this boat is handed
     back rather than written twice — so the list is a dependency of the
     render and not a thing to fetch when the button is pressed. */
  const filed = useQuotes((s) => s.quotes)

  const [query, setQuery] = useState('')
  const [started, setStarted] = useState<Started | null>(null)

  const fleet = useMemo(() => fleetOf(tables, rows), [tables, rows])
  const open = status === 'ready' && fleet.brands.length > 0

  const model = modelByKey(fleet, at.model ?? null)
  /* A MODEL NAMES ITS OWN MAKER, so an address that carries a model and
     no maker still lists that maker's boats beside it. */
  const brand = fleet.brands.find((b) => b.id === (at.brand ?? model?.tableId)) ?? null
  const typed = query.trim() !== ''
  const stage: Stage = model ? 'boat' : brand || typed ? 'models' : 'makers'

  /* THE VERSION A QUOTE IS WRITTEN FOR. A model that is one line of the
     file IS that version, so nothing is asked; a model built in two
     materials and fifteen colours is a real choice, and the act refuses
     with its reason until somebody makes it. */
  const subject: Variant | null =
    model === null
      ? null
      : model.splits
        ? (model.variants.find((v) => v.rowId === at.row) ?? null)
        : (model.variants[0] ?? null)

  /* The store's own reader decides what an already-standing draft is
     (`unaddressedDraftFor`, and the bug it was written for is in its
     own header). Read on the render that `filed` above just caused. */
  const standing =
    model && subject
      ? quotesStore.getState().unaddressedDraftFor(model.tableId, subject.rowId)
      : undefined

  const move = useCallback(
    (next: PickerAt) => {
      setStarted(null)
      goTo?.(next)
    },
    [goTo],
  )

  /* BACK TO THE DOORS, from anywhere: the maker, the model and anything
     typed all let go at once, because the doors are the screen with
     nothing asked. */
  const toMakers = useCallback(() => {
    setQuery('')
    move({})
  }, [move])

  const press = useCallback(() => {
    if (!model || !subject) return
    const outcome = startQuote(
      {
        tableId: model.tableId,
        rowId: subject.rowId,
        sheet: catalogue.getState(),
        orgId: PACK_ORG_ID,
        filed,
        preparedBy: who,
        ...(now ? { at: now() } : {}),
      },
      (tableId, rowId) => quotesStore.getState().unaddressedDraftFor(tableId, rowId),
    )
    setStarted(outcome)
    if (outcome.ok && outcome.event) quotesStore.getState().file(outcome.quote, outcome.event)
    if (outcome.ok) openQuote?.(outcome.quote.id)
  }, [model, subject, filed, who, now, openQuote])

  const inScope = brand ? brand.models.length : fleet.models
  const shown = useMemo(
    () => matchModels(modelsOf(fleet, brand?.id ?? null), query),
    [fleet, brand, query],
  )
  const keep = useMemo(() => new Set(shown.map((m) => m.key)), [shown])
  const listed = useMemo(
    () =>
      (brand ? [brand] : fleet.brands)
        .map((b) => ({ brand: b, series: seriesOf(b, keep) }))
        .filter((section) => section.series.length > 0),
    [brand, fleet, keep],
  )

  return (
    <main className="picker" data-testid="picker" data-stage={stage}>
      <header className="picker-mast">
        <div className="picker-mast__ask">
          <p className="picker-eyebrow">New quote{business ? ` · ${business}` : ''}</p>
          <h1 className="picker-ask">Which boat is it?</h1>
          <p className="picker-say">
            {open ? (
              <>
                Choose the maker, then the boat.{' '}
                <span className="picker-say__count" data-testid="picker-counts">
                  {countOf(fleet.models, 'model', 'models')} from{' '}
                  {countOf(fleet.brands.length, 'maker', 'makers')}
                  {fleet.rung === '' ? '' : `, at ${fleet.rung} prices`}.
                </span>
              </>
            ) : (
              'Nothing can be chosen until a price file has been read into this browser.'
            )}
          </p>
        </div>

        {open ? (
          <div className="picker-find">
            <label className="picker-find__label" htmlFor="picker-find">
              Find a model
            </label>
            <Input
              id="picker-find"
              type="search"
              value={query}
              onValueChange={setQuery}
              aria-describedby="picker-find-said"
              placeholder={`Search ${countOf(inScope, 'model', 'models')}`}
            />
            {/* WHAT THE FIELD FOUND, and nothing while it is empty: a
                sentence about an empty field is a sentence nobody asked
                for. The noun agrees with its count, and "seven makers"
                is counted, never typed. */}
            <p className="picker-find__said" id="picker-find-said" aria-live="polite">
              {!typed
                ? ''
                : shown.length === 0
                  ? `No model from ${brand ? brand.name : `the ${fleet.brands.length} makers`} is called that.`
                  : `${countOf(shown.length, 'model matches', 'models match')}${brand ? ` from ${brand.name}` : ''}.`}
            </p>
          </div>
        ) : null}
      </header>

      {open ? (
        <div className="picker-floor">
          {stage === 'makers' ? (
            <Doors fleet={fleet} move={move} />
          ) : (
            <>
              <Rail fleet={fleet} chosen={brand} move={move} toMakers={toMakers} />
              <Gallery
                brand={brand}
                listed={listed}
                chosen={model}
                typed={typed}
                move={move}
                toMakers={toMakers}
              />
              {model ? (
                <Plate
                  /* ONE PLATE PER MODEL. What the pointer is resting on is
                     this plate's own passing state, and it must not survive
                     into the next boat's chips. */
                  key={model.key}
                  model={model}
                  subject={subject}
                  standing={standing !== undefined}
                  started={started}
                  move={move}
                  press={press}
                  goes={openQuote !== undefined}
                />
              ) : null}
            </>
          )}
          {/* NOTHING VANISHES SILENTLY. A maker whose table is history
              and a boat marked no longer sold are both refused upstream
              by `buildEntries`; when either happens, this is where it is
              said. On this file nothing is held back, and a sentence
              announcing that nothing happened is not drawn. */}
          {fleet.heldBack.length > 0 ? (
            <p className="picker-held">{fleet.heldBack.map((h) => h.sentence).join(' ')}</p>
          ) : null}
        </div>
      ) : (
        <section className="picker-blank" aria-label="No price file">
          {/* THREE DIFFERENT ABSENCES, AND ONLY ONE OF THEM IS A BLANK
              SHEET. Reaching this address in a fresh tab reads the sheet
              back out of IndexedDB, which takes about 300 ms; a screen
              may say it does not know yet, and may not say the opposite
              of what it is about to say. */}
          {status === 'failed' || problem !== null ? (
            <p className="picker-blank__say" role="alert">
              The price file could not be read. {problem}
            </p>
          ) : status === 'ready' ? (
            <p className="picker-blank__say">
              <b>No boats to choose from yet.</b> No price file has been read into this browser, so
              there is no maker, no model and no price here. An empty sheet is the true state, not a
              broken one.
            </p>
          ) : (
            <p className="picker-blank__say">Looking for a price file in this browser…</p>
          )}
          {openTheFile && status !== 'empty' && status !== 'loading' ? (
            <Button intent="primary" onClick={openTheFile}>
              Load the Master Price File
            </Button>
          ) : null}
        </section>
      )}
    </main>
  )
}

/* ---------------------------------------------------------- */
/* A maker's mark, or its name set in type                     */
/* ---------------------------------------------------------- */

/**
 * THE MAKER'S OWN MARK, from the ledger, in dark ink on paper — or its
 * name set in type where the ledger holds none. Never a stand-in, never
 * recoloured. `--mark-scale` is the ledger's own shape turned into a
 * height (`markScale`), so a square mark and a long one weigh the same.
 */
function Mark({ name, decorative = false }: { name: string; decorative?: boolean }) {
  const mark = markOf(name)
  if (!mark) {
    return (
      <span className="picker-mark picker-mark--word" aria-hidden={decorative ? true : undefined}>
        {name}
      </span>
    )
  }
  return (
    <img
      className="picker-mark"
      src={mark.at}
      alt={decorative ? '' : name}
      width={mark.w}
      height={mark.h}
      decoding="async"
      style={{ '--mark-scale': mark.scale } as CSSProperties}
    />
  )
}

/** "from $2,770", "$23,950", or the sentence where the file holds no
 *  price — never a blank and never a zero. */
function PriceLine({ model }: { model: Model }) {
  if (model.from === null) return <span className="picker-none">No price on file</span>
  return (
    <>
      {model.from === model.to ? '' : 'from '}
      <PriceFigure amount={model.from} />
    </>
  )
}

/** A photograph of exactly this model, in a frame that crops a scene to
 *  fill it and sets a studio render whole on its own white. `sizes` is
 *  the frame's own share of the window, so a photograph held at 2,560
 *  arrives at the narrowest copy that fills it. */
function Shot({ held, sizes, lazy = true }: { held: Held; sizes: string; lazy?: boolean }) {
  const srcSet = srcSetOf(held)
  return (
    <img
      className="picker-photo"
      data-art={held.verdict === 'scene' ? 'scene' : 'studio'}
      src={held.at}
      {...(srcSet ? { srcSet, sizes } : {})}
      alt=""
      width={held.w}
      height={held.h}
      loading={lazy ? 'lazy' : undefined}
      decoding="async"
    />
  )
}

/* THE SHARE OF THE WINDOW EACH FRAME IS DRAWN AT, read off `picker.css`'s
   ladder: two doors abreast under 834px and four above it, the featured
   door twice that; cards two abreast in a hand and never past 16rem on a
   desk; the plate the page's width in a hand and at most 34rem beside
   the cards. Each errs wide, because a copy narrower than its frame is a
   blur and one a step wider is a few kilobytes. */
const DOOR_SIZES = '(max-width: 833px) 50vw, 25vw'
const FEATURED_SIZES = '(max-width: 833px) 100vw, 50vw'
const CARD_SIZES = '(max-width: 833px) 50vw, 16rem'
const PLATE_SIZES = '(max-width: 833px) 100vw, 34rem'

/* ---------------------------------------------------------- */
/* The doors: seven makers, nothing asked yet                  */
/* ---------------------------------------------------------- */

/**
 * THE FIRST THING THE SCREEN ASKS, AND THE ONLY THING. Each door is a
 * maker's mark on paper, the dearest of its boats this browser holds a
 * photograph of (`flagshipOf`), named on the picture so the picture
 * belongs to that boat, and what the maker's boats start from. One door
 * is two cells wide when that fills the last row (`featuredOf`).
 */
function Doors({ fleet, move }: { fleet: Fleet; move: (next: PickerAt) => void }) {
  const featured = featuredOf(fleet)
  return (
    <section className="picker-doors" aria-label="Makers">
      <ul className="picker-doors__grid">
        {fleet.brands.map((b, i) => {
          const flagship = flagshipOf(b, (m) => pictureOf(m) !== null)
          const photo = flagship ? pictureOf(flagship) : null
          return (
            <li
              className="picker-door"
              key={b.id}
              data-featured={b.id === featured ? '' : undefined}
              style={{ '--i': i } as CSSProperties}
            >
              <Tile onSelect={() => move({ brand: b.id })} label={doorLabel(b)}>
                <span className="picker-door__in">
                  <span className="picker-door__mark">
                    <Mark name={b.name} decorative />
                  </span>
                  <span className="picker-door__frame" data-empty={photo ? undefined : ''}>
                    {photo && flagship ? (
                      <>
                        <Shot
                          held={photo}
                          sizes={b.id === featured ? FEATURED_SIZES : DOOR_SIZES}
                          lazy={false}
                        />
                        <span className="picker-door__pictured">{flagship.shown}</span>
                      </>
                    ) : null}
                  </span>
                  <span className="picker-door__foot">
                    <span className="picker-door__n">
                      {countOf(b.models.length, 'model', 'models')}
                    </span>
                    <span className="picker-door__from">
                      {b.from === null ? (
                        <span className="picker-none">No prices on file</span>
                      ) : (
                        <>
                          from <PriceFigure amount={b.from} />
                        </>
                      )}
                    </span>
                    <span className="picker-door__go" aria-hidden="true">
                      →
                    </span>
                  </span>
                </span>
              </Tile>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

const doorLabel = (b: Brand): string =>
  `${b.name}, ${countOf(b.models.length, 'model', 'models')}${b.from === null ? '' : `, from ${money(b.from)}`}`

/* ---------------------------------------------------------- */
/* The rail: the makers, once one is chosen                    */
/* ---------------------------------------------------------- */

/**
 * THE MAKERS AGAIN, SMALL, SO CHANGING YOUR MIND IS ONE PRESS. The
 * counted rail of the sweep (`porsche-models.png`), drawn in marks:
 * a column of them on a desk, a wrapping row on a tablet, and in a hand
 * it steps aside for "← All makers" at the head of the list.
 */
function Rail({
  fleet,
  chosen,
  move,
  toMakers,
}: {
  fleet: Fleet
  chosen: Brand | null
  move: (next: PickerAt) => void
  toMakers: () => void
}) {
  return (
    <nav className="picker-rail" aria-label="Makers">
      <ul className="picker-rail__list">
        <li className="picker-rail__item">
          <Tile
            shape="row"
            selected={chosen === null}
            onSelect={toMakers}
            label={`All makers, ${countOf(fleet.models, 'model', 'models')}`}
          >
            <span className="picker-railrow">
              <span className="picker-railrow__all">All makers</span>
              <span className="picker-railrow__n">{fleet.models.toLocaleString('en-AU')}</span>
            </span>
          </Tile>
        </li>
        {fleet.brands.map((b) => (
          <li className="picker-rail__item" key={b.id}>
            <Tile
              shape="row"
              selected={chosen?.id === b.id}
              onSelect={() => move({ brand: b.id })}
              label={`${b.name}, ${countOf(b.models.length, 'model', 'models')}`}
            >
              <span className="picker-railrow">
                <span className="picker-railrow__mark">
                  <Mark name={b.name} decorative />
                </span>
                <span className="picker-railrow__n">{b.models.length.toLocaleString('en-AU')}</span>
              </span>
            </Tile>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/* ---------------------------------------------------------- */
/* The gallery: one maker's boats, as photographs              */
/* ---------------------------------------------------------- */

function Gallery({
  brand,
  listed,
  chosen,
  typed,
  move,
  toMakers,
}: {
  brand: Brand | null
  listed: { brand: Brand; series: Series[] }[]
  chosen: Model | null
  typed: boolean
  move: (next: PickerAt) => void
  toMakers: () => void
}) {
  const ref = useRef<HTMLElement>(null)
  const was = useRef<string | null>(null)

  /* THE CHOSEN CARD STAYS IN VIEW. On a desk the plate arriving narrows
     this column and the cards reflow under the reader, so the one just
     pressed is brought back to the nearest edge; in a hand the list
     comes back after the plate, and it comes back AT the boat the
     reader left rather than at the top of the maker. */
  /* AND WHEN THE LIST ITSELF CHANGES under a chosen boat — a search
     cleared, which puts the other 66 models back above it — the boat on
     the plate is brought back into view beside it. */
  useEffect(() => {
    const key = chosen?.key ?? was.current
    was.current = chosen?.key ?? null
    /* nothing listed — a search that matched nothing — is nothing to bring into view */
    if (key === null || listed.length === 0) return
    const card = [...(ref.current?.querySelectorAll<HTMLElement>('[data-key]') ?? [])].find(
      (el) => el.dataset.key === key,
    )
    const box = ref.current
    if (!card || !box) return
    const frame = requestAnimationFrame(() => bringIntoView(box, card, chosen !== null))
    return () => cancelAnimationFrame(frame)
  }, [chosen, listed])

  return (
    <section className="picker-index" aria-label="Models" ref={ref}>
      {brand ? (
        <div className="picker-head">
          <div className="picker-back picker-back--makers">
            <Button intent="secondary" size="sm" onClick={toMakers}>
              ← All makers
            </Button>
          </div>
          <h2 className="picker-head__name">
            <Mark name={brand.name} />
          </h2>
          <p className="picker-head__say">{brandSay(brand)}</p>
        </div>
      ) : (
        <div className="picker-head">
          <div className="picker-back picker-back--makers">
            <Button intent="secondary" size="sm" onClick={toMakers}>
              ← All makers
            </Button>
          </div>
        </div>
      )}

      {listed.length === 0 && typed ? (
        /* THE EMPTY ANSWER, COMPOSED: what was asked, and the two ways
           on from it, rather than a blank column. */
        <div className="picker-nothing">
          <p className="picker-nothing__say">
            No model {brand ? `from ${brand.name} ` : ''}is called that.
          </p>
          <p className="picker-nothing__how">
            Try the model&rsquo;s number alone, or {brand ? 'choose another maker' : 'a maker'}{' '}
            {brand ? 'beside this list' : 'from the doors'}.
          </p>
        </div>
      ) : null}

      <div className="picker-list">
        {listed.map((section) => (
          <div className="picker-brandblock" key={section.brand.id}>
            {brand === null ? (
              <h2 className="picker-brandhead">
                <Mark name={section.brand.name} />
                <span className="picker-brandhead__n">
                  {countOf(
                    section.series.reduce((n, s) => n + s.models.length, 0),
                    'model',
                    'models',
                  )}
                </span>
              </h2>
            ) : null}
            {section.series.map((group) => (
              <SeriesBlock
                key={group.key}
                brand={section.brand}
                group={group}
                chosen={chosen}
                move={move}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

/**
 * ONE CARD BROUGHT INTO VIEW, MOVING ONLY THE LIST IT IS IN.
 *
 * `scrollIntoView` moves every scrollable ancestor, and on a desk that
 * included the room itself: measured at 1440 x 900, choosing the SP560
 * after a cleared search scrolled the whole page 700px and took the band
 * and the plate off the screen. So where the list scrolls inside itself
 * (the fixed room) only the list is moved — to the nearest edge beside a
 * plate, to the middle on the way back — and where the page is the
 * scroller (a hand, a tablet) the card is brought to the middle of the
 * window, which is the only scroller there is.
 */
function bringIntoView(list: HTMLElement, card: HTMLElement, nearest: boolean): void {
  const own = getComputedStyle(list).overflowY
  if (own === 'auto' || own === 'scroll') {
    const box = list.getBoundingClientRect()
    const at = card.getBoundingClientRect()
    if (nearest && at.top >= box.top && at.bottom <= box.bottom) return
    const top = nearest
      ? at.top < box.top
        ? at.top - box.top
        : at.bottom - box.bottom
      : at.top - box.top - (box.height - at.height) / 2
    list.scrollBy({ top, behavior: 'instant' })
    return
  }
  if (typeof card.scrollIntoView === 'function') {
    card.scrollIntoView({ block: nearest ? 'nearest' : 'center', behavior: 'instant' })
  }
}

/** The line under a maker's mark: how many models, in how many series,
 *  from what price, at which price. Counted, never typed. */
function brandSay(brand: Brand): string {
  const said = [
    `${countOf(brand.models.length, 'model', 'models')}${brand.filesSeries && brand.named > 1 ? ` in ${brand.named} series` : ''}`,
  ]
  if (brand.from !== null) said.push(`from ${money(brand.from)}`)
  if (brand.rung !== '' && brand.from !== null) said.push(`${brand.rung} prices`)
  return said.join(' · ')
}

function SeriesBlock({
  brand,
  group,
  chosen,
  move,
}: {
  brand: Brand
  group: Series
  chosen: Model | null
  move: (next: PickerAt) => void
}) {
  return (
    <div className="picker-series">
      {/* A MAKER THAT FILES NO SERIES HAS NO SERIES HEADING: its boats
          stand straight under its mark. */}
      {brand.filesSeries ? (
        <h3 className="picker-serieshead">
          <span className="picker-serieshead__name">
            {group.name === '' ? 'Not in a series' : group.label}
          </span>
          <span className="picker-serieshead__n">
            {countOf(group.models.length, 'model', 'models')}
          </span>
        </h3>
      ) : null}
      <ul className="picker-cards">
        {group.models.map((model, i) => (
          <li
            key={model.key}
            className="picker-cards__item"
            data-key={model.key}
            style={{ '--i': Math.min(i, 11) } as CSSProperties}
          >
            <Card
              model={model}
              selected={chosen?.key === model.key}
              onSelect={() => move({ brand: model.tableId, model: model.key })}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * ONE BOAT: its photograph, its name, its price. `gradywhite-models2.png`
 * without the paragraph. A model this browser holds no photograph of is
 * a cover set in type — its own name, large, on the file's pale blue —
 * which is a composed absence and not a picture of anything; no other
 * boat's picture ever stands in for it.
 */
function Card({
  model,
  selected,
  onSelect,
}: {
  model: Model
  selected: boolean
  onSelect: () => void
}) {
  const held = pictureOf(model)
  const cover = coverWords(model.shown)
  /* WHAT THE PLATE WILL ASK, said before it is asked: two materials, or
     seven colours — never the count of lines it is behind. */
  const colours = !model.splits
    ? null
    : model.materials.length > 1
      ? countOf(model.materials.length, 'material', 'materials')
      : countOf(model.rows, 'colour', 'colours')
  return (
    <Tile selected={selected} onSelect={onSelect} label={cardLabel(model, colours)}>
      <span className="picker-card">
        <span className="picker-card__frame" data-empty={held ? undefined : ''}>
          {held ? (
            <Shot held={held} sizes={CARD_SIZES} />
          ) : (
            <span className="picker-card__cover" aria-hidden="true">
              {cover.main}
              {cover.rest === '' ? null : (
                <span className="picker-card__cover-rest">{cover.rest}</span>
              )}
            </span>
          )}
        </span>
        <span className="picker-card__name">{model.shown}</span>
        <span className="picker-card__line">
          <span className="picker-card__price">
            <PriceLine model={model} />
          </span>
          {colours ? <span className="picker-card__more">{colours}</span> : null}
        </span>
      </span>
    </Tile>
  )
}

/**
 * A NAME SET LARGE MAY BREAK BEFORE A BRACKET, and only there. The file
 * writes "SP760WL(Windlass)" with no space, and a cover 160px wide broke
 * it as "SP760WL(Wind / lass)" (measured at 1440 x 900); a zero-width
 * break before each "(" lets it fall as "SP760WL / (Windlass)". The
 * cover is hidden from a reader, who hears the card's own label.
 */
const breakable = (name: string): string => name.replaceAll('(', '​(')

/** A card's name to a reader: the boat's name FIRST, because that is
 *  what a person listening for a boat is listening for. */
const cardLabel = (model: Model, colours: string | null): string =>
  [
    model.shown,
    model.from === null
      ? 'no price on file'
      : `${model.from === model.to ? '' : 'from '}${money(model.from)}`,
    colours,
  ]
    .filter(Boolean)
    .join(', ')

/* ---------------------------------------------------------- */
/* The plate: one boat, whole                                  */
/* ---------------------------------------------------------- */

function Plate({
  model,
  subject,
  standing,
  started,
  move,
  press,
  goes,
}: {
  model: Model
  subject: Variant | null
  standing: boolean
  started: Started | null
  move: (next: PickerAt) => void
  press: () => void
  goes: boolean
}) {
  const sayId = useId()
  /* WHICH CHIP THE POINTER OR THE FOCUS IS RESTING ON, so the line under
     the codes can name it before anybody commits to it. Passing state,
     never a position: nothing is written to the address until a press. */
  const [resting, setResting] = useState<string | null>(null)
  /* THE SAME PICTURE THE CARD DREW AND THE BUILD WILL STAND ON ITS
     STAGE: the model's photograph on the water where the heroes ledger
     holds one, else its catalogue copy (`pictureOf`, the M2-close
     critique's finding 11). */
  const picture = pictureOf(model)
  const plateSet = picture ? srcSetOf(picture) : undefined
  const material = subject?.material ?? null
  const codes = variantsIn(model, material)
  const unread = unreadIn(codes)
  const back: PickerAt = { brand: model.tableId }

  /* TWO QUESTIONS, ASKED ONE AT A TIME. The material is what moves the
     price (in 43 of Highfield's 67 models the price is a function of
     material alone), so it is asked first, and pressing it chooses that
     material's first colour — so the price is real and the act is live
     from that moment, and the colour is a refinement rather than a gate.
     A model built in one material has no first question. */
  const asksMaterial = model.materials.length > 1
  const showsCodes = !asksMaterial || material !== null
  const named = codes.find((v) => v.rowId === (resting ?? subject?.rowId)) ?? null

  /* THE REFUSAL, WITH ITS REASON, POINTING AT CHIPS THAT ARE REALLY
     THERE: the chips stand in the plate's foot directly over the act,
     so "above" is true at every width (built-critique-m2.md #3). */
  const refusal =
    subject === null
      ? `A quote is for one ${model.shown} in one ${asksMaterial ? 'material and colour' : 'colour'}, so choose ${asksMaterial ? 'a material' : 'a colour'} above first.`
      : undefined

  return (
    <aside className="picker-stage" aria-label="What is chosen">
      <div className="picker-stage__crest">
        {/* THE WAY BACK, AND ONLY WHERE IT MEANS ANYTHING. From 834px up
            the list stands beside this plate, so `picker.css` takes this
            out of the page there rather than leaving a control that
            points at what the reader is already looking at. */}
        <div className="picker-back">
          <Button intent="secondary" size="sm" onClick={() => move(back)}>
            ← All the models
          </Button>
        </div>
        <p className="picker-stage__over">
          <Mark name={model.register} />
          {model.series === '' ? null : (
            <span className="picker-stage__series">{model.series}</span>
          )}
        </p>
        <h2 className="picker-stage__name">{model.shown}</h2>
      </div>

      <div className="picker-stage__body">
        <figure className="picker-shot" data-empty={picture ? undefined : ''}>
          {picture ? (
            <img
              className="picker-shot__img"
              data-art={picture.verdict === 'scene' ? 'scene' : 'studio'}
              src={picture.at}
              {...(plateSet ? { srcSet: plateSet, sizes: PLATE_SIZES } : {})}
              alt={picture.subject === '' ? model.shown : picture.subject}
              width={picture.w}
              height={picture.h}
              decoding="async"
            />
          ) : (
            /* THE SAME COVER THE CARD DREW, AT THE PICTURE'S SIZE: the
               boat's own name on the file's pale blue, and one sentence
               under it saying why. It depicts nothing, so nothing stands
               in; and the plate keeps its shape, so the act does not
               climb the page for a boat nobody has photographed. */
            <>
              <span className="picker-shot__cover" aria-hidden="true">
                {breakable(model.shown)}
              </span>
              <figcaption className="picker-shot__none">
                No photograph of the {model.shown} is held yet.
              </figcaption>
            </>
          )}
        </figure>
        {model.facts.length > 0 ? (
          <dl className="picker-strip">
            {model.facts.map((fact) => (
              <Fact key={fact.label} label={fact.label} value={fact.value} say={fact.say} />
            ))}
          </dl>
        ) : null}
      </div>

      {/* THE PLATE'S FOOT — THE QUESTION, THE PRICE AND THE ACT, AND NONE
          OF THEM SCROLLS. Everything the act waits on is here, in the
          order it is answered: the material, its colours, the price they
          come to, then the press. It is the foot of the plate and never
          a floating bar; under 1200px it is an ordinary block at the end
          of the page, directly under the boat it quotes. */}
      <div className="picker-stage__foot">
        {asksMaterial ? (
          <Pick head="Material">
            <div className="picker-chips">
              {model.materials.map((group) => (
                <Tile
                  key={group.name === '' ? 'none' : group.name}
                  shape="chip"
                  selected={material === group.name}
                  onSelect={() =>
                    move({
                      ...back,
                      model: model.key,
                      ...(group.variants[0] ? { row: group.variants[0].rowId } : {}),
                    })
                  }
                  label={`${group.label}, ${countOf(group.variants.length, 'colour', 'colours')}`}
                >
                  <span className="picker-chip picker-chip--line">
                    <span className="picker-chip__name">{group.label}</span>
                    <span className="picker-chip__sub">
                      {group.from === null
                        ? 'no price'
                        : group.from === group.to
                          ? money(group.from)
                          : `${money(group.from)} – ${money(group.to ?? group.from)}`}
                    </span>
                  </span>
                </Tile>
              ))}
            </div>
          </Pick>
        ) : null}

        {model.splits && showsCodes ? (
          <Pick
            head={`Colour · ${codes.length}${material === null || material === '' ? '' : ` in ${material}`}`}
          >
            <div className="picker-chips picker-chips--codes">
              {codes.map((variant) => (
                /* THE WRAPPER LISTENS AND THE TILE PRESSES. Resting a
                   pointer or a focus on a code names it in the line
                   below; only a press writes the version to the address. */
                <span
                  className="picker-rest"
                  key={variant.rowId}
                  onPointerEnter={() => setResting(variant.rowId)}
                  onPointerLeave={() => setResting(null)}
                  onFocus={() => setResting(variant.rowId)}
                  onBlur={() => setResting(null)}
                >
                  <Tile
                    shape="chip"
                    selected={subject?.rowId === variant.rowId}
                    onSelect={() => move({ ...back, model: model.key, row: variant.rowId })}
                    label={
                      variant.reads
                        ? `${variant.code}, ${variant.say}`
                        : variant.coded
                          ? `${variant.code}, a code with no colour name on file`
                          : variant.code
                    }
                  >
                    {/* THE CODE IS THE CONTENT AND NO SWATCH IS DRAWN.
                        Four of the tokens in this file have no colour
                        name at all, and a colour nobody can name is a
                        colour nobody may paint. */}
                    <span className="picker-chip__code">
                      {variant.code === '' ? '—' : variant.code}
                    </span>
                  </Tile>
                </span>
              ))}
            </div>
            {/* THE NAME OF THE CODE, said once under all of them — for the
                chip being pointed at, else the one chosen. Its height is
                held when it is empty, so resting on a chip never moves
                the act. */}
            <p className="picker-named" aria-hidden="true">
              {named === null ? null : (
                <>
                  <span className="picker-mono">{named.code === '' ? '—' : named.code}</span>
                  {' — '}
                  {named.reads
                    ? named.say
                    : named.coded
                      ? 'no colour name on file'
                      : 'as the file writes it'}
                  {named.amount !== null && model.from !== model.to ? (
                    <>
                      {' · '}
                      <PriceFigure amount={named.amount} />
                    </>
                  ) : null}
                </>
              )}
            </p>
            {unread.length > 0 ? (
              <p className="picker-note">
                No colour name is on file for{' '}
                <span className="picker-mono">{unread.join(', ')}</span>, so{' '}
                {unread.length === 1 ? 'it is' : 'they are'} shown as{' '}
                {unread.length === 1 ? 'its code' : 'their codes'}: a question for the dealer, never
                a guess.
              </p>
            ) : null}
          </Pick>
        ) : null}

        {/* THE PRICE AND THE PRESS ON ONE LINE once the plate is wide
            enough — `surtees-770.png`'s strip, with the act at its end. */}
        <div className="picker-close">
          <div className="picker-money">
            {model.from === null ? (
              <>
                <p className="picker-money__none">No price on file</p>
                <p className="picker-money__why">
                  The price file holds no price for this boat. The quote still opens, and you put
                  the price on it.
                </p>
              </>
            ) : (
              <>
                <p className="picker-money__fig">
                  {subject === null && model.from !== model.to ? 'from ' : ''}
                  <PriceFigure amount={subject?.amount ?? model.from} />
                </p>
                <p className="picker-money__rung">
                  {model.rung === '' ? 'Price' : `${model.rung} price`}
                  {subject === null && model.from !== model.to
                    ? `, up to ${money(model.to ?? model.from)}`
                    : ''}
                </p>
              </>
            )}
          </div>

          <div className="picker-act">
            <Button
              intent="act"
              onClick={press}
              refusedBy={refusal === undefined ? undefined : sayId}
            >
              {standing ? 'Open the draft already standing' : 'Start the quote'}
            </Button>
          </div>
        </div>

        <p className="picker-act__say" id={sayId}>
          {refusal ??
            (standing
              ? 'A draft for this boat is already started with nobody named on it, so this reopens it rather than starting a second.'
              : '')}
        </p>

        {started ? <Made started={started} goes={goes} /> : null}
      </div>
    </aside>
  )
}

/** One question the act waits on, under its own small head. */
function Pick({ head, children }: { head: string; children: ReactNode }) {
  return (
    <div className="picker-pick">
      <p className="picker-pick__head">{head}</p>
      {children}
    </div>
  )
}

/** What the press did, said where the press happened. */
function Made({ started, goes }: { started: Started; goes: boolean }) {
  if (!started.ok) {
    return (
      <div className="picker-made" role="alert">
        <p>{started.refused}</p>
      </div>
    )
  }
  return (
    /* An `output`: the element already carries the status role, and it
       is the tag for a result the page computed from what somebody did.
       NO ADDRESS IS PRINTED (critique #14): the press opens the build
       itself, which is all a dealer needs to know about where it went. */
    <output className="picker-made" data-testid="picker-made">
      <p className="picker-made__head">
        Quote <span className="picker-mono">{started.quote.reference}</span>{' '}
        {started.already ? 'was already open' : 'is started'}
        {goes ? ' — opening the build' : ''}
      </p>
      <p>{started.quote.subjectLabel}</p>
    </output>
  )
}

/**
 * ONE FIGURE UNDER ITS LABEL, hairline-divided — the strip
 * `gradywhite-models2.png` runs as LENGTH · BEAM · MAX HP. The columns
 * are chosen by `tileFacts` in the domain, which MEASURES each maker's
 * own columns, so no column name from this dealer's workbook lives here.
 */
function Fact({ label, value, say }: { label: string; value: string; say?: string }) {
  return (
    <div className="picker-fact" title={say}>
      <dt className="picker-fact__label">{label}</dt>
      <dd className="picker-fact__value">{value}</dd>
    </div>
  )
}
