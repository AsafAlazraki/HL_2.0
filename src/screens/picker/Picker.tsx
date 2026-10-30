import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react'
import { flushSync } from 'react-dom'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  FolderOpenIcon,
  MagnifyingGlassIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react'
import {
  Button,
  Figure,
  Icon,
  Input,
  KindMark,
  PriceFigure,
  STATE_GLYPH,
  Tile,
  canMorph,
  say,
  undo,
  unsay,
  type Glyph,
} from '@/ui'
import type { EntityDef, TableKind } from '@/domain/model'
import {
  nounOf,
  quoteDoors,
  whatIsSold,
  type QuoteDoor,
  type SellingShelf,
} from '@/domain/quote/start'
import { isDone } from '@/domain/catalogue/commands'
import { letQuote } from '@/domain/catalogue/quotingCommand'
import { measured } from '@/domain/quote/spoken'
/* THE CARDS AND THE DOORS NEVER OPEN A LINE ON A SEPARATOR
   (m2-last-critique.md, minor 8): the one rule the cascade and the register use */
import { keepSeparators } from '@/domain/quote/wrap'
import { useCatalogue, useQuotes, useSession } from '@/app/useStores'
import { quotes as quotesStore } from '@/state/quotes'
import { catalogue } from '@/state/catalogue'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { money } from '@/domain/money'
import {
  featuredOf,
  flagshipOf,
  fleetOf,
  fleetsTogether,
  matchModels,
  modelByKey,
  modelsOf,
  openingOf,
  seriesOf,
  type Brand,
  type Fleet,
  type Model,
  type Series,
  type Variant,
} from './fleet'
import { markOf, pictureOf, srcSetOf, type Held } from './pictures'
import { startQuote, type Started } from './mint'
import { stripGlyphs } from './glyphs'
import { spokenFact } from './facts'
import { boatTravel, markTravel } from './travel'
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
   *  which is why this screen never reaches for the router itself.
   *  `stay` marks a refinement of the boat already on the plate (a
   *  material or a colour): the page is not a new page, so the route is
   *  asked to leave the window where it stands. */
  goTo?: (next: PickerAt, how?: { stay?: boolean }) => void
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

/**
 * WHAT A PRESS CARRIES TO ITS NEW PLACE (the component kit, 2026-09-28).
 *
 * The route answers a change of maker with the browser's own View Transition
 * (src/routes/quote.new.tsx), and whatever stands under the same
 * `view-transition-name` on both sides of the change morphs from where it
 * was to where it is. So the press names, for one frame, exactly the mark it
 * is about: the door's, which lands at the head of that maker's boats, or
 * the head's, which goes back to its door. Under reduced motion, or with a
 * caret in a field, nothing is lifted and the change simply happens
 * (`canMorph`).
 *
 * A BOAT IS NOT CARRIED FROM ITS CARD, AND THAT IS MEASURED. A View
 * Transition holds the new page back until the old one is photographed, and
 * a plate that is not in the page the moment its card is pressed is a plate
 * the next press cannot find: the build's own walk, and the cascade's and the
 * paper's, press a material the instant the card lands, and on the laptop
 * and the wide screen the plate was not there yet, so no quote was ever
 * started (three failures in one run). The plate arrives by fading; its
 * photograph travels once, on the act, onto the build's stage.
 */
interface Lift {
  /** the maker whose mark is carried */
  mark: string | null
}
const NOTHING_LIFTED: Lift = Object.freeze({ mark: null })

/** The price's name under the figure: "Cash price", and a rung the file already calls a price
 *  ("Sell Price") is not called a price twice. */
const rungSaid = (rung: string): string =>
  rung.trim() === '' ? 'Price' : /\bprice\b/i.test(rung) ? rung.trim() : `${rung.trim()} price`

/** The most cards one list draws at once; the rest are said and reached by the search. */
const CARD_CAP = 120

/** The draft already standing for any version of this model with nobody named on it. */
function standingFor(model: Model) {
  const store = quotesStore.getState()
  for (const v of model.variants) {
    const draft = store.unaddressedDraftFor(model.tableId, v.rowId)
    if (draft) return draft
  }
  return undefined
}

/** The lists a shelf sells from, by table id. */
const tablesOf = (shelf: SellingShelf): string[] =>
  shelf.doors.flatMap((d) => d.tables.map((t) => t.id))

/** Each shelf's lists read as a fleet — makers, series, models, prices — exactly as the boats
 *  are, over that shelf's own tables and nothing else. */
function shelfFleets(
  alone: readonly SellingShelf[],
  tables: Readonly<Record<string, EntityDef>>,
  sheet: Parameters<typeof fleetOf>[1],
): Map<string, Fleet> {
  const out = new Map<string, Fleet>()
  for (const shelf of alone) {
    const own: Record<string, EntityDef> = {}
    for (const id of tablesOf(shelf)) {
      const table = tables[id]
      if (table) own[id] = table
    }
    const kind: TableKind = shelf.doors[0]?.kind ?? 'custom'
    out.set(shelf.moduleId, fleetOf(own, sheet, kind))
  }
  return out
}

export function Picker({ at = NOWHERE, goTo, openTheFile, openQuote, now }: PickerProps) {
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
  const [lift, setLift] = useState<Lift>(NOTHING_LIFTED)
  /* named synchronously, so the browser photographs the old page with the
     name already on it when the route starts its transition */
  const carry = useCallback((next: Lift) => {
    if (canMorph()) flushSync(() => setLift(next))
  }, [])

  const modules = useCatalogue((s) => s.modules)
  const boats = useMemo(() => fleetOf(tables, rows), [tables, rows])
  const open = status === 'ready' && boats.brands.length > 0

  /* WHAT IS SOLD, read off the places the dealer made (the owner, 2026-10-30: "quotes are
     not just boats"). Each shelf's own lists are read the way the boats are, by `fleetOf`
     over that shelf's tables alone, once per sheet. */
  const sold = useMemo(() => whatIsSold(quoteDoors(modules, tables, rows)), [modules, tables, rows])
  const shelves = useMemo(() => shelfFleets(sold.alone, tables, rows), [sold, tables, rows])
  /* the shelf this address is about, when it names one of a shelf's lists */
  const shelf = at.brand
    ? (sold.alone.find((s) => tablesOf(s).includes(at.brand ?? '')) ?? null)
    : null
  const fleet = (shelf ? shelves.get(shelf.moduleId) : undefined) ?? boats
  const door = shelf?.doors.find((d) => d.tables.some((t) => t.id === at.brand)) ?? null
  const noun = door ? nounOf(door) : 'boat'

  /* EVERYTHING SOLD, AS ONE LIST FOR THE FIELD: before a maker or a shelf is chosen, the field
     searches the boats and every shelf at once, because the question it stands beside is "What
     are you selling?" and not "Which boat?" (the critic, 2026-10-31, S-4: "Search every boat"
     under that question). */
  const everything = useMemo(
    () => fleetsTogether([boats, ...sold.alone.flatMap((s) => shelves.get(s.moduleId) ?? [])]),
    [boats, sold, shelves],
  )
  /* what one thing on each list is called, for a list's count where the field found it */
  const nouns = useMemo(() => {
    const out = new Map<string, readonly [string, string]>()
    for (const s of sold.alone)
      for (const d of s.doors)
        for (const t of d.tables) out.set(t.id, [nounOf(d), d.census.noun] as const)
    return out
  }, [sold])

  const model = modelByKey(shelf ? fleet : everything, at.model ?? null)
  /* A MODEL NAMES ITS OWN MAKER, so an address that carries a model and
     no maker still lists that maker's boats beside it. */
  const brand = fleet.brands.find((b) => b.id === (at.brand ?? model?.tableId)) ?? null
  const typed = query.trim() !== ''
  const stage: Stage = model ? 'boat' : brand || typed ? 'models' : 'makers'
  /* the list the field searches, and the rail beside what it found: the chosen maker's or
     shelf's, else everything sold */
  const searched = shelf || brand ? fleet : everything
  /* the way back to the first question, said as what it shows: the boat makers' rail is "All
     makers", and a shelf's, or everything sold while the field searches it, is "Everything sold" */
  const allWord = shelf || searched === everything ? 'Everything sold' : 'All makers'

  /* THE VERSION A QUOTE IS WRITTEN FOR, and nothing is asked here any more (the owner,
     2026-10-30: "the picking model color and all of that nonsense to be done in hull section
     and same for all boats please so they can see differences in real time"). The quote opens
     on the version the card's "from" figure prices (`openingOf`); its material and colour are
     chosen in the build's hull section, where the total answers each press. An address that
     names a version (a door elsewhere that knows one) still opens on that one. */
  const named = model?.variants.find((v) => v.rowId === at.row) ?? null
  const subject: Variant | null = model === null ? null : (named ?? openingOf(model))

  /* The store's own reader decides what an already-standing draft is
     (`unaddressedDraftFor`, and the bug it was written for is in its
     own header). Any version of this model counts: a draft whose colour was changed in the
     hull chapter is still the draft for this boat. Read on the render that `filed` above
     just caused. */
  const standing = model ? standingFor(model) : undefined

  /* THE ACT KEEPS THE WORDS IT WAS PRESSED UNDER (components-critique-2.md,
     major 4). The press files its draft, and the render that filing causes
     asked the store again: a draft for this boat now stood, so the act
     re-labelled itself "Open the draft already standing" and said "…so this
     reopens it rather than starting a second" directly above "Quote
     20260929-03 is started — opening the build" — in the frame the route's
     crossfade photographs, on a boat that had no draft when it was pressed.
     So while the press's answer is about this boat and this version, what
     the press FOUND decides the act's words, not what it left behind. Every
     move clears `started`, and the next boat or version asks the store. */
  const pressed =
    started !== null &&
    started.ok &&
    model !== null &&
    started.quote.rootTableId === model.tableId &&
    model.variants.some((v) => v.rowId === started.quote.rootRowId)
      ? started.already
      : undefined
  const actSays = pressed ?? standing !== undefined

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
    /* the maker's mark goes back to its own door */
    carry({ mark: at.brand ?? model?.tableId ?? null })
    setQuery('')
    move({})
  }, [move, carry, at.brand, model])

  /* A MAKER CHOSEN, from its door or from the rail: its mark is carried to the
     head of its boats. */
  const toMaker = useCallback(
    (id: string) => {
      carry({ mark: id })
      move({ brand: id })
    },
    [move, carry],
  )

  /* A BOAT CHOSEN: the plate is in the page the moment the card is pressed
     (`Lift` says why nothing is carried from the card). */
  const toBoat = useCallback(
    (chosen: Model) => move({ brand: chosen.tableId, model: chosen.key }),
    [move],
  )

  const press = useCallback(() => {
    if (!model || !subject || (shelf?.refusal ?? '') !== '') return
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
      () => standingFor(model),
    )
    setStarted(outcome)
    if (outcome.ok && outcome.event) quotesStore.getState().file(outcome.quote, outcome.event)
    if (outcome.ok) openQuote?.(outcome.quote.id)
  }, [model, subject, filed, who, now, openQuote, shelf])

  const shown = useMemo(
    () => matchModels(modelsOf(searched, brand?.id ?? null), query),
    [searched, brand, query],
  )
  /* A LIST NOBODY CAN SCROLL TO THE END OF IS A LIST NOBODY READS: Parts & Accessories holds
     2,238 products. The first CARD_CAP are drawn in the list's own order and the rest are
     said, and the search reaches every one (`picker-capped`). No maker of boats holds more. */
  const drawn = useMemo(() => shown.slice(0, CARD_CAP), [shown])
  const keep = useMemo(() => new Set(drawn.map((m) => m.key)), [drawn])
  const listed = useMemo(
    () =>
      (brand ? [brand] : searched.brands)
        .map((b) => ({ brand: b, series: seriesOf(b, keep) }))
        .filter((section) => section.series.length > 0),
    [brand, searched, keep],
  )

  return (
    <main className="picker" data-testid="picker" data-stage={stage}>
      <header className="picker-mast">
        <div className="picker-mast__ask">
          {/* THE BUSINESS IS NAMED ONCE, BY THE CREST (docs/WORDS.md, "one fact, one place"),
              and the head says what to do and stops (the refine round, 2026-10-21): the count
              of models and makers stood beside "All makers 289" and each door's own count, and
              "Cash prices" beside the plate's "Cash price". The price's name is said once, by
              the price. `picker-counts` is the mark the walks wait on: the file is read. */}
          <p className="picker-eyebrow">New quote</p>
          <h1 className="picker-ask">
            {stage === 'makers'
              ? 'What are you selling?'
              : brand || shelf
                ? `Which ${noun} is it?`
                : 'Which one is it?'}
          </h1>
          {open ? (
            <p className="picker-say" data-testid="picker-counts">
              {stage === 'makers'
                ? 'A boat, or a motor, a trailer or a part on its own.'
                : shelf
                  ? `Choose the ${noun}.`
                  : brand
                    ? 'Choose the maker, then the boat.'
                    : 'Choose the one you are selling.'}
            </p>
          ) : null}
        </div>

        {open ? (
          <div className="picker-find">
            <label className="picker-find__label" htmlFor="picker-find">
              Find a model
            </label>
            <Input
              id="picker-find"
              type="search"
              icon={MagnifyingGlassIcon}
              value={query}
              onValueChange={setQuery}
              aria-describedby="picker-find-said"
              placeholder={brand ? `Search ${brand.name}` : 'Search everything sold'}
            />
            {/* WHAT THE FIELD FOUND, and nothing while it is empty: a
                sentence about an empty field is a sentence nobody asked
                for. The noun agrees with its count, and "seven makers"
                is counted, never typed.
                THE COUNT IS THE KIT'S FIGURE (2026-09-29, the components
                critique, major 12: "the picker's '2 models match from
                Stacer'" stayed static). It lands at once while the caret
                is in the field, and rolls to its new value when a maker is
                chosen with the words still in it. */}
            <p className="picker-find__said" id="picker-find-said" aria-live="polite">
              {!typed ? (
                ''
              ) : shown.length === 0 ? (
                brand ? (
                  `No model from ${brand.name} is called that.`
                ) : (
                  'Nothing on the price list is called that.'
                )
              ) : (
                <>
                  <Figure value={shown.length} />
                  {brand && !shelf
                    ? shown.length === 1
                      ? ' model matches'
                      : ' models match'
                    : ' found'}
                  {brand ? ` from ${brand.name}` : ''}.
                </>
              )}
            </p>
          </div>
        ) : null}
      </header>

      {open ? (
        <div className="picker-floor">
          {stage === 'makers' ? (
            <Sold>
              <Doors fleet={boats} toMaker={toMaker} lifted={lift.mark} />
              <Shelves sold={sold} fleets={shelves} toMaker={toMaker} />
            </Sold>
          ) : (
            <>
              <Rail
                fleet={searched}
                chosen={brand}
                toMaker={toMaker}
                toMakers={toMakers}
                lifted={lift.mark}
                allWord={allWord}
                held={searched.heldBack.map((h) => h.sentence).join(' ')}
              />
              <Gallery
                brand={brand}
                nouns={nouns}
                listed={listed}
                chosen={model}
                typed={typed}
                toBoat={toBoat}
                toMakers={toMakers}
                allWord={allWord}
                capped={shown.length - drawn.length}
                total={shown.length}
              />
              {model ? (
                <Plate
                  /* ONE PLATE PER MODEL, so its arrival runs once for each boat pressed */
                  key={model.key}
                  model={model}
                  subject={subject}
                  ranged={named === null && model.from !== model.to}
                  standing={actSays}
                  started={started}
                  move={move}
                  press={press}
                  goes={openQuote !== undefined}
                  noun={noun}
                  shut={shelf?.refusal ?? ''}
                  moduleId={shelf?.moduleId ?? null}
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
            <p className="picker-held picker-held--floor">
              {fleet.heldBack.map((h) => h.sentence).join(' ')}
            </p>
          ) : null}
        </div>
      ) : (
        <section className="picker-blank" aria-label="No price list">
          {/* THREE DIFFERENT ABSENCES, AND ONLY ONE OF THEM IS A BLANK
              SHEET. Reaching this address in a fresh tab reads the sheet
              back out of IndexedDB, which takes about 300 ms; a screen
              may say it does not know yet, and may not say the opposite
              of what it is about to say. */}
          {status === 'failed' || problem !== null ? (
            <p className="picker-blank__say" role="alert">
              The price list could not be read. {problem}
            </p>
          ) : status === 'ready' ? (
            <p className="picker-blank__say">
              <b>No boats to choose from yet.</b> No price list is loaded, so there is no maker, no
              model and no price here.
            </p>
          ) : (
            <p className="picker-blank__say">Looking for the price list…</p>
          )}
          {openTheFile && status !== 'empty' && status !== 'loading' ? (
            <Button intent="primary" icon={FolderOpenIcon} onClick={openTheFile}>
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
function Mark({
  name,
  decorative = false,
  travel,
}: {
  name: string
  decorative?: boolean
  /** the name this mark travels under when a press carries it (`Lift`). A
   *  mark set in type never travels: only a picture is ever carried, so no
   *  words ride along a morph. */
  travel?: string
}) {
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
      style={
        {
          '--mark-scale': mark.scale,
          ...(travel ? { viewTransitionName: travel } : {}),
        } as CSSProperties
      }
    />
  )
}

/** "from $2,770", "$23,950", or the sentence where the file holds no
 *  price — never a blank and never a zero. */
function PriceLine({ model }: { model: Model }) {
  if (model.from === null) return <span className="picker-none">Not priced</span>
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
/** No photograph of this boat, in the one sentence every screen uses (docs/WORDS.md). */
const NO_PHOTOGRAPH_YET = 'No photograph of this boat yet.'

/* ---------------------------------------------------------- */
/* The first question: the boats and the shelves               */
/* ---------------------------------------------------------- */

function Sold({ children }: { children: ReactNode }) {
  const floor = useRef<HTMLDivElement>(null)
  useSeamAtTheFold(floor)
  return (
    <div className="picker-sold" ref={floor}>
      {/* THE FIRST QUESTION'S CAP UNDER THE PILL, as the list of boats has one: the floor the
          pill stands on while the doors and the shelves scroll under it (picker.css, "the cap") */}
      <div className="picker-cap" aria-hidden="true" />
      {children}
    </div>
  )
}

/**
 * IN A HAND THE FIRST WINDOW ENDS ON A SEAM, never through a row (refine-critique.md, major 5,
 * 2026-10-21: at 390 × 844 the second row of doors stood half over the tab bar and half under
 * it until the page moved). The makers are rows of marks in a hand now, with the shelves under
 * them, so the seam is found among those rows: each maker's row is given the same few pixels
 * more (`--door-give`, at most 8px a row) until no row, head or shelf row stands across the
 * bar's top, read as the foot of the room `.picker` pads for the bar. The fewest pixels that do
 * it win; where none do, nothing is given. Above 600px the bar is not at the foot (`.picker`'s
 * own `--shell-foot` is 0) and nothing here runs.
 */
/* the seam may stand from 2px above the bar's room to 4px into it: every row keeps 8px of its own
   ground inside its edge, so no word or mark of it reaches the bar's top, 3px into the room */
const SEAM = { above: 2, into: 4 }
/** An element's box in the page's own coordinates. */
const pageY = (a: Element): { top: number; bottom: number } => {
  const r = a.getBoundingClientRect()
  return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY }
}
function useSeamAtTheFold(floor: RefObject<HTMLDivElement | null>): void {
  useEffect(() => {
    const el = floor.current
    const room = el?.closest<HTMLElement>('.picker')
    if (!el || !room || typeof ResizeObserver === 'undefined') return
    let busy = false
    const fit = (): void => {
      if (busy) return
      busy = true
      el.style.removeProperty('--door-give')
      const foot = Number.parseFloat(getComputedStyle(room).paddingBlockEnd) || 0
      const doors = [...el.querySelectorAll<HTMLElement>('[data-seam="maker"]')]
      if (foot <= 0 || doors.length === 0) {
        busy = false
        return
      }
      /* the first window at rest: where the bar's room begins, in the page's own coordinates */
      const fold = window.innerHeight - foot
      const pastDoors = pageY(doors.at(-1)!).bottom
      /* each thing that must not be cut, and how many makers' rows stand above it */
      const atoms = [...el.querySelectorAll<HTMLElement>('[data-seam]')].map((a) => {
        const at = pageY(a)
        const door = doors.indexOf(a)
        const above = door >= 0 ? door : at.top >= pastDoors ? doors.length : 0
        return { ...at, above, own: door >= 0 ? 1 : 0 }
      })
      const clear = (give: number): boolean =>
        atoms.every(({ top, bottom, above, own }) => {
          const t = top + above * give
          const b = bottom + (above + own) * give
          return b <= fold + SEAM.into || t >= fold - SEAM.above
        })
      const give = Array.from({ length: 17 }, (_, i) => i / 2).find((g) => clear(g))
      if (give !== undefined && give > 0) el.style.setProperty('--door-give', `${give}px`)
      busy = false
    }
    fit()
    const watch = new ResizeObserver(fit)
    watch.observe(el)
    window.addEventListener('resize', fit)
    return () => {
      watch.disconnect()
      window.removeEventListener('resize', fit)
    }
  }, [floor])
}

/* ---------------------------------------------------------- */
/* The doors: seven makers, nothing asked yet                  */
/* ---------------------------------------------------------- */

/**
 * THE MAKER'S PICTURE IS A BOAT ON THE WATER WHEREVER IT HAS ONE. The dearest boat this browser
 * holds a photograph of (`flagshipOf`), and a scene before a studio render: Stacer's dearest was
 * a cut-out on white, and in the one wide door it stood small in a white field among six boats on
 * the water (the critic, 2026-10-31, S-4). A maker with only renders still shows its dearest.
 */
const doorPictureOf = (brand: Brand): Model | null =>
  flagshipOf(brand, (m) => pictureOf(m)?.verdict === 'scene') ??
  flagshipOf(brand, (m) => pictureOf(m) !== null)

/**
 * THE BOATS, FIRST AND LARGEST. Each door is a maker's mark on paper, a photograph of the dearest
 * of its boats on the water (`doorPictureOf`), and what the maker's boats start from. One door is
 * two cells wide when that fills the last row (`featuredOf`). The boat in the picture is no longer
 * named under it (the owner, 2026-10-30, of the build: "we dont need that little text under the
 * photo"): the door is the maker's, the picture is still that boat's own, and the plate names
 * every boat once it is chosen. In a hand the doors are the makers' marks alone, as rows, so the
 * first window shows the shelves start under them (picker.css).
 */
function Doors({
  fleet,
  toMaker,
  lifted,
}: {
  fleet: Fleet
  toMaker: (id: string) => void
  /** the maker whose mark a press is carrying back to its door */
  lifted: string | null
}) {
  const featured = featuredOf(fleet)
  const headId = useId()
  /* THE WIDE DOOR IS THE LAST DOOR, because it is wide to fill the last row (2026-10-21): last,
     it ends the grid whole at four abreast, and the order a screen reader says is the order
     drawn. */
  const doors =
    featured === null
      ? fleet.brands
      : [
          ...fleet.brands.filter((b) => b.id !== featured),
          ...fleet.brands.filter((b) => b.id === featured),
        ]
  return (
    <section className="picker-doors" aria-labelledby={headId}>
      <h2 className="picker-kind" id={headId} data-seam="">
        <KindMark kind="boat" size="sm" />
        Boats
      </h2>
      <ul className="picker-doors__grid">
        {doors.map((b, i) => {
          const flagship = doorPictureOf(b)
          const photo = flagship ? pictureOf(flagship) : null
          return (
            <li
              className="picker-door"
              data-seam="maker"
              key={b.id}
              data-featured={b.id === featured ? '' : undefined}
              style={{ '--i': i } as CSSProperties}
            >
              <Tile onSelect={() => toMaker(b.id)} label={doorLabel(b)}>
                <span className="picker-door__in">
                  <span className="picker-door__mark">
                    <Mark
                      name={b.name}
                      decorative
                      travel={lifted === b.id ? markTravel(b.id) : undefined}
                    />
                  </span>
                  <span className="picker-door__frame" data-empty={photo ? undefined : ''}>
                    {photo ? (
                      <Shot
                        held={photo}
                        sizes={b.id === featured ? FEATURED_SIZES : DOOR_SIZES}
                        lazy={false}
                      />
                    ) : null}
                  </span>
                  <span className="picker-door__foot">
                    <span className="picker-door__n">
                      {countOf(b.models.length, 'model', 'models')}
                    </span>
                    <span className="picker-door__from">
                      {b.from === null ? (
                        <span className="picker-none">Not priced</span>
                      ) : (
                        <>
                          from <PriceFigure amount={b.from} />
                        </>
                      )}
                    </span>
                    {/* THE DOOR'S WAY IN, a glyph in the plate's blue well that
                        slides forward under the pointer */}
                    <span className="picker-door__go" aria-hidden="true">
                      <Icon glyph={ArrowRightIcon} />
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

const doorLabel = (b: Brand, one = 'model', many = 'models'): string =>
  `${b.name}, ${countOf(b.models.length, one, many)}${b.from === null ? '' : `, from ${money(b.from)}`}`

/* ---------------------------------------------------------- */
/* The shelves: what is sold on its own                        */
/* ---------------------------------------------------------- */

/**
 * EVERYTHING ELSE NORTHSIDE SELLS ON ITS OWN, beside the boats (the owner, 2026-10-30: "quotes
 * are not just boats - also motors or trailers or even dealer fit things"): a motor for a
 * repower, a trailer, a package, a part. One plate per place in the business, in the
 * dashboard's order, each list on it one row: its maker's mark or its name, how many and from
 * what price. No pictures: a shelf's lists are told apart by their makers, and the photographs
 * they hold were a cut-out here, a lone photograph there and an empty tile with a glyph in a
 * third (the critic, 2026-10-31, S-4). Beside the boats on a desk, so the first window answers
 * "What are you selling?" whole. A shelf that is sold only with a boat says so under its name,
 * with the switch that changes it (`letQuote`); its rows still open, so what is on it can be
 * looked at.
 */
function Shelves({
  sold,
  fleets,
  toMaker,
}: {
  sold: ReturnType<typeof whatIsSold>
  fleets: ReadonlyMap<string, Fleet>
  toMaker: (id: string) => void
}) {
  const headId = useId()
  if (sold.alone.length === 0 && sold.notGoods === '') return null
  return (
    <section className="picker-alone" aria-labelledby={headId}>
      <h2 className="picker-kind" id={headId} data-seam="">
        Sold on its own
      </h2>
      {sold.alone.map((shelf) => (
        <Shelf
          key={shelf.moduleId}
          shelf={shelf}
          fleet={fleets.get(shelf.moduleId) ?? null}
          toMaker={toMaker}
        />
      ))}
      {sold.notGoods === '' ? null : <p className="picker-alone__note">{sold.notGoods}</p>}
    </section>
  )
}

function Shelf({
  shelf,
  fleet,
  toMaker,
}: {
  shelf: SellingShelf
  fleet: Fleet | null
  toMaker: (id: string) => void
}) {
  const headId = useId()
  const lists = shelf.doors.flatMap((door) =>
    door.tables.flatMap((table) => {
      const brand = fleet?.brands.find((b) => b.id === table.id)
      return brand ? [{ door, brand }] : []
    }),
  )
  /* TWO LISTS UNDER ONE MAKER'S MARK (Dunbier Trailers and Dunbier / Haines BMT) are told apart
     by their names under it */
  const marks = lists.map(({ brand }) => markOf(brand.name)?.at ?? '')
  const shared = new Set(marks.filter((at, i) => at !== '' && marks.indexOf(at) !== i))
  return (
    <section className="picker-shelf" aria-labelledby={headId} data-ground="plate">
      <h3 className="picker-shelf__head" id={headId} data-seam="">
        <KindMark kind={shelf.doors[0]?.kind ?? 'custom'} size="sm" />
        {shelf.name}
      </h3>
      {shelf.refusal === '' ? null : (
        <div className="picker-shelf__shut" data-seam="">
          <p>{shelf.refusal}</p>
          <SellAlone moduleId={shelf.moduleId} />
        </div>
      )}
      <ul className="picker-shelf__rows">
        {lists.map(({ door, brand }, i) => (
          <li
            className="picker-small"
            key={brand.id}
            data-seam=""
            style={{ '--i': i } as CSSProperties}
          >
            <ShelfRow
              door={door}
              brand={brand}
              named={shared.has(markOf(brand.name)?.at ?? '')}
              toMaker={toMaker}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

/** One list on a shelf: its maker's mark or its name, how many, from what, and the way in. */
function ShelfRow({
  door,
  brand,
  named,
  toMaker,
}: {
  door: QuoteDoor
  brand: Brand
  /** its mark is another list's too, so its name is said beside it */
  named: boolean
  toMaker: (id: string) => void
}) {
  const one = nounOf(door)
  const many = door.census.noun
  return (
    <Tile shape="row" onSelect={() => toMaker(brand.id)} label={doorLabel(brand, one, many)}>
      <span className="picker-small__in">
        <span className="picker-small__mark">
          {markOf(brand.name) ? (
            <span className="picker-small__marked">
              <Mark name={brand.name} decorative />
              {named ? <span className="picker-small__sub">{brand.name}</span> : null}
            </span>
          ) : (
            <span className="picker-small__name">{brand.name}</span>
          )}
        </span>
        <span className="picker-small__figures">
          <span className="picker-small__n">{countOf(brand.models.length, one, many)}</span>
          <span className="picker-small__from">
            {brand.from === null ? (
              <span className="picker-none">Not priced</span>
            ) : (
              <>
                from <PriceFigure amount={brand.from} />
              </>
            )}
          </span>
        </span>
        <span className="picker-door__go" aria-hidden="true">
          <Icon glyph={ArrowRightIcon} />
        </span>
      </span>
    </Tile>
  )
}

const SELL_STEP = 'picker-sell-alone'

/** THE SWITCH, WHERE THE REFUSAL IS: Northside's own setting for the place (`letQuote`, the
 *  same one step with its Undo as the place's Settings tab), pressed from New quote. */
function SellAlone({ moduleId }: { moduleId: string }) {
  const press = (): void => {
    const outcome = catalogue.getState().apply(letQuote(moduleId, true))
    if (!isDone(outcome)) {
      if (outcome.refused !== '') say(outcome.refused, { id: SELL_STEP })
      return
    }
    unsay(SELL_STEP)
    const eventId = outcome.event.id
    undo(
      outcome.said,
      () => {
        const back = catalogue.getState().undo(eventId)
        say(isDone(back) ? back.said : back.refused || 'Nothing to change.', { id: SELL_STEP })
      },
      { id: SELL_STEP },
    )
  }
  return (
    <Button intent="secondary" size="sm" onClick={press}>
      Sell it on its own too
    </Button>
  )
}

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
  toMaker,
  toMakers,
  lifted,
  allWord,
  held,
}: {
  fleet: Fleet
  chosen: Brand | null
  toMaker: (id: string) => void
  toMakers: () => void
  /** the maker whose mark a press is carrying from this rail to the head */
  lifted: string | null
  /** the first row's words: back to the first question */
  allWord: string
  /** what this list holds back and why, said under the makers; '' when nothing is */
  held: string
}) {
  /* TWO LISTS UNDER ONE MARK (Signature's boats and its packages, while the field searches
     everything sold) are told apart by their names under it */
  const marks = fleet.brands.map((b) => markOf(b.name)?.at ?? '')
  const shared = new Set(marks.filter((at, i) => at !== '' && marks.indexOf(at) !== i))
  return (
    <nav className="picker-rail" aria-label="Makers">
      <ul className="picker-rail__list">
        <li className="picker-rail__item">
          <Tile
            shape="row"
            selected={chosen === null}
            onSelect={toMakers}
            label={
              allWord === 'All makers'
                ? `All makers, ${countOf(fleet.models, 'model', 'models')}`
                : allWord
            }
          >
            <span className="picker-railrow">
              <span className="picker-railrow__all">{allWord}</span>
              {allWord === 'All makers' ? (
                <span className="picker-railrow__n">{fleet.models.toLocaleString('en-AU')}</span>
              ) : null}
            </span>
          </Tile>
        </li>
        {fleet.brands.map((b) => (
          <li className="picker-rail__item" key={b.id}>
            <Tile
              shape="row"
              selected={chosen?.id === b.id}
              onSelect={() => toMaker(b.id)}
              label={`${b.name}, ${countOf(b.models.length, 'model', 'models')}`}
            >
              <span className="picker-railrow">
                <span className="picker-railrow__mark">
                  {/* the chosen maker's mark stands at the head of its boats,
                      so only another maker's is ever carried from here */}
                  <Mark
                    name={b.name}
                    decorative
                    travel={lifted === b.id && chosen?.id !== b.id ? markTravel(b.id) : undefined}
                  />
                  {shared.has(markOf(b.name)?.at ?? '') ? (
                    <span className="picker-small__sub">{b.name}</span>
                  ) : null}
                </span>
                <span className="picker-railrow__n">{b.models.length.toLocaleString('en-AU')}</span>
              </span>
            </Tile>
          </li>
        ))}
      </ul>
      {/* NOTHING VANISHES SILENTLY: what this list holds back is said under its makers, in the
          rail's own column, so it never takes a row from the list beside it */}
      {held === '' ? null : <p className="picker-held">{held}</p>}
    </nav>
  )
}

/* ---------------------------------------------------------- */
/* The gallery: one maker's boats, as photographs              */
/* ---------------------------------------------------------- */

function Gallery({
  brand,
  nouns,
  listed,
  chosen,
  typed,
  toBoat,
  toMakers,
  allWord,
  capped,
  total,
}: {
  brand: Brand | null
  /** what one thing on each list that is not a boat maker's is called, by its table */
  nouns: ReadonlyMap<string, readonly [string, string]>
  listed: { brand: Brand; series: Series[] }[]
  chosen: Model | null
  typed: boolean
  toBoat: (model: Model) => void
  toMakers: () => void
  allWord: string
  /** how many the search matched that are not drawn */
  capped: number
  total: number
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
      {/* THE LIST'S CAP UNDER THE PILL: the floor the pill stands on while the boats scroll
          under it, drawn only while they do (picker.css, "the cap") */}
      <div className="picker-cap" aria-hidden="true" />
      {brand ? (
        <div className="picker-head">
          <div className="picker-back picker-back--makers">
            <Button intent="secondary" size="sm" icon={ArrowLeftIcon} onClick={toMakers}>
              {allWord}
            </Button>
          </div>
          {/* THE MAKER'S MARK AT THE HEAD OF ITS BOATS, where a pressed door's
              or rail row's mark lands (`Lift`) — and from where it goes back
              to its door */}
          <h2 className="picker-head__name">
            <Mark name={brand.name} travel={markTravel(brand.id)} />
          </h2>
          <BrandSay brand={brand} noun={nouns.get(brand.id)} />
        </div>
      ) : (
        <div className="picker-head">
          <div className="picker-back picker-back--makers">
            <Button intent="secondary" size="sm" icon={ArrowLeftIcon} onClick={toMakers}>
              {allWord}
            </Button>
          </div>
        </div>
      )}

      {listed.length === 0 && typed ? (
        /* THE EMPTY ANSWER, COMPOSED: the two ways on from it, rather than a
           blank column. That nothing is called that is said once, under the
           field it was typed in (`picker-find__said`), and not again here. */
        <div className="picker-nothing">
          <p className="picker-nothing__how">
            Try the model&rsquo;s number alone, or choose{' '}
            {brand ? 'another maker beside this list' : 'a maker'}.
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
                    ...(nouns.get(section.brand.id) ?? (['model', 'models'] as const)),
                  )}
                </span>
              </h2>
            ) : null}
            {typed ? (
              <Found
                brand={section.brand}
                groups={section.series}
                chosen={chosen}
                toBoat={toBoat}
              />
            ) : (
              section.series.map((group) => (
                <SeriesBlock
                  key={group.key}
                  brand={section.brand}
                  group={group}
                  chosen={chosen}
                  toBoat={toBoat}
                />
              ))
            )}
          </div>
        ))}
      </div>
      {capped > 0 ? (
        <p className="picker-capped" data-testid="picker-capped">
          The first {CARD_CAP.toLocaleString('en-AU')} of {total.toLocaleString('en-AU')} are shown.
          Search {brand ? brand.name : 'the list'} to reach the other{' '}
          {capped.toLocaleString('en-AU')}.
        </p>
      ) : null}
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
    /* AND NEVER UNDER ITS OWN SERIES HEAD, which sticks at the list's top: brought to
       the nearest edge, the card a press had just chosen settled with its photograph's
       top under "ROLL-UP" (measured at 1440 x 900, 2026-10-19). Its height is the
       band the card is kept below; a search's run of cards has no head. */
    const head = card.closest('.picker-series')?.querySelector<HTMLElement>('.picker-serieshead')
    const under = head ? head.getBoundingClientRect().height : 0
    const clear = box.top + under
    if (nearest && at.top >= clear && at.bottom <= box.bottom) return
    const top = nearest
      ? at.top < clear
        ? at.top - clear
        : at.bottom - box.bottom
      : at.top - box.top - (box.height - at.height) / 2
    list.scrollBy({ top, behavior: 'instant' })
    return
  }
  if (typeof card.scrollIntoView === 'function') {
    card.scrollIntoView({ block: nearest ? 'nearest' : 'center', behavior: 'instant' })
  }
}

/**
 * THE ACT BROUGHT INTO THE WINDOW BY THE LEAST MOVE THAT SHOWS IT, and no
 * move at all where it is already there — which is every desk, where the
 * room is the window, and the tablet once its plate is held beside the
 * list. `nearest` is what keeps the boat's name on screen above the act
 * in a hand: the page moves only as far as the act's sentence, never to
 * put the act at the top. How much of the window the shell takes, the
 * pill at the head or the tab bar at the foot, is the block's own
 * `scroll-margin` in `picker.css`, read from the shell's tokens, so no
 * figure about the shell is written here. `scrollIntoView` moves every
 * scroller the act is inside: the page in a hand, the plate itself in a
 * window too short to hold it whole, and nothing in the desk's room,
 * which clips rather than scrolls.
 */
function bringTheActIn(block: HTMLElement | null): void {
  if (!block || typeof block.scrollIntoView !== 'function') return
  block.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' })
}

/**
 * The line under a maker's mark: how many models, in how many series, from
 * what price. Counted, never typed.
 *
 * EACH FACT ONCE (the refine round, 2026-10-21). The price's name ("Cash") is
 * said by the price on the plate, and not here as well. The count of models is
 * the rail's wherever the rail stands — "Stacer 91" beside "91 models in 22
 * series" was the same figure twice in one window — so `picker.css` takes it
 * out of this line from 1200px up, where the rail is drawn; below that the
 * rail steps aside and this line is the only place the count is said.
 */
const MODEL_NOUN = ['model', 'models'] as const

function BrandSay({
  brand,
  noun = MODEL_NOUN,
}: {
  brand: Brand
  /** what one thing on this list is called, where it is not a boat maker's */
  noun?: readonly [string, string] | undefined
}) {
  const rest: string[] = []
  if (brand.filesSeries && brand.named > 1) rest.push(`${brand.named} series`)
  if (brand.from !== null) rest.push(`from ${money(brand.from)}`)
  return (
    <p className="picker-head__say">
      <span className="picker-head__n">
        {countOf(brand.models.length, ...noun)}
        {rest.length > 0 ? ' · ' : ''}
      </span>
      {rest.join(' · ')}
    </p>
  )
}

function SeriesBlock({
  brand,
  group,
  chosen,
  toBoat,
}: {
  brand: Brand
  group: Series
  chosen: Model | null
  toBoat: (model: Model) => void
}) {
  const framed = group.models.some((m) => pictureOf(m) !== null)
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
            {/* THE DATE THE FILE STAMPED THIS SERIES WITH, beside its count and
                never in its name: "Fisher Series", 5 models · as at 18.03.2026
                (m2-last-critique.md, major 6) */}
            {group.note === '' ? null : ` · ${group.note}`}
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
              framed={framed}
              selected={chosen?.key === model.key}
              onSelect={() => toBoat(model)}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * WHAT A SEARCH FOUND, AS ONE RUN OF CARDS (2026-10-19, build-close-critique.md,
 * minor 14 of the second critique): "519" finds 7 models in 7 series, and drawn
 * series by series each card stood alone on its own row with two thirds of the
 * list blank beside it. A search is a question about boats, not about how the
 * file groups them, so the answers stand side by side in the file's own order,
 * and where they come from more than one series each card names its series
 * over its name — the file's words (`label`), never a heading of one.
 */
function Found({
  brand,
  groups,
  chosen,
  toBoat,
}: {
  brand: Brand
  groups: Series[]
  chosen: Model | null
  toBoat: (model: Model) => void
}) {
  const named = brand.filesSeries && groups.length > 1
  const framed = groups.some((group) => group.models.some((m) => pictureOf(m) !== null))
  const found = groups.flatMap((group) =>
    group.models.map((model) => ({
      model,
      series: named && group.name !== '' ? group.label : null,
    })),
  )
  return (
    <ul className="picker-cards">
      {found.map(({ model, series }, i) => (
        <li
          key={model.key}
          className="picker-cards__item"
          data-key={model.key}
          style={{ '--i': Math.min(i, 11) } as CSSProperties}
        >
          <Card
            model={model}
            framed={framed}
            series={series}
            selected={chosen?.key === model.key}
            onSelect={() => toBoat(model)}
          />
        </li>
      ))}
    </ul>
  )
}

/**
 * ONE BOAT: its photograph, its name, its price. `gradywhite-models2.png`
 * without the paragraph. A model with no photograph yet says so on the
 * file's pale blue, under its own name rather than over it — a composed
 * absence and not a picture of anything; no other boat's picture ever
 * stands in for it.
 */
function Card({
  model,
  framed,
  series = null,
  selected,
  onSelect,
}: {
  model: Model
  /** a frame is drawn for its photograph: false where nothing beside it holds one, so a run of
   *  cards with no photograph between them is a run of names and prices, not of empty frames */
  framed: boolean
  /** the series it is filed under, said over its name where a search set
   *  it beside boats of other series (`Found`); null under a series head */
  series?: string | null
  selected: boolean
  onSelect: () => void
}) {
  const held = pictureOf(model)
  /* WHAT THE PLATE WILL ASK, said before it is asked: two materials, or
     seven colours — never the count of lines it is behind. */
  const colours = !model.splits
    ? null
    : model.materials.length > 1
      ? countOf(model.materials.length, 'material', 'materials')
      : countOf(model.rows, 'colour', 'colours')
  return (
    <Tile
      selected={selected}
      onSelect={onSelect}
      label={cardLabel(model, colours, series)}
      /* THE TICK OFF THE PHOTOGRAPH: the card's top corner is the boat, so the chosen disc
         stands at the foot, in the room `.picker-card__line` keeps clear for it */
      tick="foot"
    >
      <span className="picker-card">
        {held || framed ? (
          <span className="picker-card__frame" data-empty={held ? undefined : ''}>
            {held ? (
              <Shot held={held} sizes={CARD_SIZES} />
            ) : (
              /* NO PHOTOGRAPH, SAID QUIETLY IN THE FRAME'S CORNER (the owner, 2026-10-30: shown
               honestly, "not as a big crossed-camera tile"). The frame keeps its place so every
               card in a row is one height, and it depicts nothing, so nothing stands in for the
               model. Not the name a second time: that was the cover of 2026-10-21. */
              <span className="picker-card__cover">
                <span className="picker-card__cover-word">No photograph yet</span>
              </span>
            )}
          </span>
        ) : null}
        {series === null || namesSeries(model.shown, series) ? null : (
          <span className="picker-card__series">{keepSeparators(series)}</span>
        )}
        <span className="picker-card__name">{keepSeparators(model.shown)}</span>
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

/** A word lowered and made singular, to compare a series with a name. */
const one = (word: string): string => word.toLowerCase().replace(/s$/u, '')

/** Whether a boat's name already carries its series: every word of the series, singular, is a
 *  word of the name — "Sea Rangers" in "519 Sea Ranger SDF". */
function namesSeries(said: string, series: string): boolean {
  const words = new Set(
    said
      .split(/[^\p{L}\p{N}]+/u)
      .filter(Boolean)
      .map(one),
  )
  /* "Series" and "Range" name the grouping, not the boat: "Fisher Series" over "Signature
     Fisher 525F" says Fisher twice */
  const wanted = series
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map(one)
    .filter((word) => word !== 'serie' && word !== 'range')
  if (wanted.length === 0) return false
  if (wanted.every((word) => words.has(word))) return true
  /* or run together, as a maker writes a model: "Sea Masters" over "519 SeaMaster" */
  const run = said.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
  return run.includes(wanted.join(''))
}

/** A card's name to a reader: the boat's name FIRST, because that is
 *  what a person listening for a boat is listening for. */
const cardLabel = (model: Model, colours: string | null, series: string | null): string =>
  [
    model.shown,
    model.from === null
      ? 'not priced'
      : `${model.from === model.to ? '' : 'from '}${money(model.from)}`,
    colours,
    series,
  ]
    .filter(Boolean)
    .join(', ')

/* ---------------------------------------------------------- */
/* The plate: one boat, whole                                  */
/* ---------------------------------------------------------- */

function Plate({
  model,
  subject,
  ranged,
  standing,
  started,
  move,
  press,
  goes,
  noun,
  shut,
  moduleId,
}: {
  model: Model
  /** the version the quote opens on (`openingOf`), or the one the address names */
  subject: Variant | null
  /** the price is said as the span the model's versions run over, because no version was named */
  ranged: boolean
  standing: boolean
  started: Started | null
  move: (next: PickerAt) => void
  press: () => void
  goes: boolean
  /** what one of these is called — "boat", "motor", "product" */
  noun: string
  /** why this place cannot start a quote on its own, or '' */
  shut: string
  /** the place in the business that would be switched on, where it is shut */
  moduleId: string | null
}) {
  const sayId = useId()
  /* THE ACT AND ITS SENTENCE, as one block the window can be brought to. */
  const go = useRef<HTMLDivElement>(null)
  /* THE SAME PICTURE THE CARD DREW AND THE BUILD WILL STAND ON ITS
     STAGE: the model's photograph on the water where the heroes ledger
     holds one, else its catalogue copy (`pictureOf`, the M2-close
     critique's finding 11). */
  const picture = pictureOf(model)
  const plateSet = picture ? srcSetOf(picture) : undefined
  const back: PickerAt = { brand: model.tableId }

  /* THE ONE REFUSAL LEFT: a place that does not sell on its own. A boat's material and colour
     no longer hold the act back (the owner, 2026-10-30): they are chosen in the hull section. */
  const refusal = shut !== '' ? shut : undefined

  /* WHAT THE BUILD WILL ASK, SAID WHERE THE ACT IS: a model built in more than one version opens
     on the one its "from" figure prices, and the rest are a press away in the build, where the
     total answers each one. Said in the card's own words — materials, or colours. */
  const later = !model.splits
    ? ''
    : `${model.materials.length > 1 ? 'Its material and colour are' : 'Its colour is'} chosen in ${
        noun === 'boat' ? 'the hull section' : 'the build'
      }, where the price follows ${model.materials.length > 1 ? 'each one' : 'it'}.`

  /* THE BOAT ARRIVES WITH ITS ACT IN REACH (built-critique-m2-close-2.md,
     blocker 2 and major 9). One plate is mounted per model, so this runs
     once for each boat pressed: in a hand the router puts the window back
     at the top on every change of address, and this is the least move that
     shows the act. The frame is the one after the router's own reset, which a
     promise runs before it. */
  useEffect(() => {
    const frame = requestAnimationFrame(() => bringTheActIn(go.current))
    return () => cancelAnimationFrame(frame)
  }, [])

  /* THE NAME THIS BOAT'S PHOTOGRAPH TRAVELS UNDER: the version the quote
     will be written for, which is the row the build's stage names its
     photograph by (`rootRowId`), so the act carries this photograph onto
     the stage. */
  const travel = boatTravel(model.tableId, subject?.rowId ?? model.key)

  return (
    /* A WHITE PLATE, the kit's one material (tokens.css, THE PLATE), drawn
       here rather than by `Plate` because this one is a grid of three parts
       that holds its crest and foot still and a container the foot lays
       itself out by — which a primitive that refuses a screen's styling
       cannot be. It wears the plate's ground so what it holds reads the
       day's inks. */
    <aside className="picker-stage" aria-label="What is chosen" data-ground="plate">
      <div className="picker-stage__crest">
        {/* THE WAY BACK, AND ONLY WHERE IT MEANS ANYTHING. From 834px up
            the list stands beside this plate, so `picker.css` takes this
            out of the page there rather than leaving a control that
            points at what the reader is already looking at. */}
        <div className="picker-back">
          <Button intent="secondary" size="sm" icon={ArrowLeftIcon} onClick={() => move(back)}>
            All the models
          </Button>
        </div>
        <p className="picker-stage__over">
          <Mark name={model.register} />
          {/* THE SERIES ONLY WHERE THE NAME DOES NOT SAY IT (the refine round's second pass,
              2026-10-21): "Sea Ranger" stood over "519 Sea Ranger SDF", the series said twice
              in two lines. A series the name does not carry is still said here. */}
          {model.series === '' ||
          namesSeries(`${model.said} ${model.trim}`, model.seriesLabel) ? null : (
            <span className="picker-stage__series">{model.seriesLabel}</span>
          )}
        </p>
        {/* THE BOAT AS THE BUILD'S HEADLINE SAYS IT, under its maker's mark: the
            model large, and what the file adds after it on its own line
            under it — "519 Sea Ranger SDF" over "Centre Console" — where the
            build sets "Stacer 519 Sea Ranger SDF" over the same words. */}
        <h2 className="picker-stage__name">{model.said}</h2>
        {model.trim === '' ? null : <p className="picker-stage__trim">{model.trim}</p>}
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
              style={{ '--picker-travel': travel } as CSSProperties}
            />
          ) : (
            /* NO PHOTOGRAPH, SAID ONCE, IN THE WORDS EVERY SCREEN USES
               (docs/WORDS.md): the file's pale blue at the picture's size
               with the sentence on it. It depicts nothing, so nothing stands
               in; and the plate keeps its shape, so the act does not climb
               the page for a boat nobody has photographed. */
            <figcaption className="picker-shot__none">
              {noun === 'boat' ? NO_PHOTOGRAPH_YET : `No photograph of this ${noun} yet.`}
            </figcaption>
          )}
        </figure>
        {model.facts.length > 0 ? <Strip model={model} /> : null}
      </div>

      {/* THE PLATE'S FOOT — THE PRICE AND THE ACT, AND NEITHER SCROLLS. It is
          the foot of the plate and never a floating bar; under 1200px it is an
          ordinary block at the end of the page, directly under the boat it
          quotes. */}
      <div className="picker-stage__foot">
        {/* THE ACT WITH ITS PRICE AND ITS SENTENCE: the block the window is
            brought to when a boat arrives. */}
        <div className="picker-go" ref={go}>
          {/* THE PRICE AND THE PRESS ON ONE LINE once the plate is wide
            enough — `surtees-770.png`'s strip, with the act at its end. */}
          <div className="picker-close">
            <div className="picker-money">
              {model.from === null ? (
                <>
                  <p className="picker-money__none">Not priced</p>
                  <p className="picker-money__why">
                    The price list has no price for this {noun}. The quote still opens, and you put
                    the price on it.
                  </p>
                </>
              ) : (
                <>
                  <p className="picker-money__fig">
                    {ranged ? 'from ' : ''}
                    <PriceFigure amount={ranged ? model.from : (subject?.amount ?? model.from)} />
                  </p>
                  <p className="picker-money__rung">
                    {rungSaid(model.rung)}
                    {ranged ? `, up to ${money(model.to ?? model.from)}` : ''}
                  </p>
                </>
              )}
            </div>

            <div className="picker-act" data-waits={refusal === undefined ? undefined : ''}>
              {/* THE ONE LOUD PRESS ENDS ON ITS ARROW IN A DARK DISC, which
                  nudges forward under the pointer (the kit's act) */}
              <Button
                intent="act"
                icon={ArrowRightIcon}
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
                ? `A draft for this ${noun} is already started with nobody named on it, so this reopens it rather than starting a second.`
                : later)}
          </p>
          {shut !== '' && moduleId !== null ? <SellAlone moduleId={moduleId} /> : null}
        </div>

        {started ? <Made started={started} goes={goes} /> : null}
      </div>
    </aside>
  )
}

/** What the press did, said where the press happened. */
function Made({ started, goes }: { started: Started; goes: boolean }) {
  if (!started.ok) {
    return (
      <div className="picker-made" role="alert">
        <span className="picker-made__glyph" data-refused="" aria-hidden="true">
          <Icon glyph={WarningCircleIcon} size="md" weight="fill" />
        </span>
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
      {/* A DRAFT'S OWN GLYPH IN ITS OWN INK — the circle still being drawn,
          rose (tokens.css, THE KIT: where a quote stands) — beside the words
          that say it is a draft */}
      <span className="picker-made__glyph" aria-hidden="true">
        <Icon glyph={STATE_GLYPH.draft} size="md" />
      </span>
      <p className="picker-made__head">
        Quote <span className="picker-mono">{started.quote.reference}</span>{' '}
        {started.already ? 'was already open' : 'is started'}
        {goes ? ' — opening the build' : ''}
      </p>
      {/* THE BOAT IS NOT NAMED HERE AGAIN: this stands in the foot of the plate
          whose heading names it (the refine round, 2026-10-21). */}
    </output>
  )
}

/**
 * THE BOAT'S FIGURES, hairline-divided — the strip `gradywhite-models2.png`
 * runs as LENGTH · BEAM · MAX HP, each label led by the glyph of what it
 * measures where every label in the strip has one (`stripGlyphs`). A UNIT ON
 * EVERY MEASURE (`measured`): "Int Length 154 cm", never a file header over a
 * bare figure.
 */
function Strip({ model }: { model: Model }) {
  const facts = model.facts.map((fact) => ({
    ...fact,
    ...spokenFact(measured(model.tableId, fact)),
  }))
  const glyphs = stripGlyphs(facts.map((f) => f.label))
  return (
    <dl className="picker-strip">
      {facts.map((fact, i) => (
        <Fact key={fact.label} label={fact.label} value={fact.value} glyph={glyphs[i] ?? null} />
      ))}
    </dl>
  )
}

/**
 * ONE FIGURE UNDER ITS LABEL. The columns are chosen by `tileFacts` in the
 * domain, which MEASURES each maker's own columns, so no column name from
 * this dealer's workbook lives here.
 *
 * AND NOTHING ON HOVER (the refine round, 2026-10-21): each figure carried
 * the cell it was read from as its title — "Boat Module!S · labelled here by
 * header row 278" — which is how the app reads the workbook, said to a
 * customer at the desk. The figure is the boat's; where it sits is not.
 */
function Fact({ label, value, glyph }: { label: string; value: string; glyph: Glyph | null }) {
  return (
    <div className="picker-fact">
      <dt className="picker-fact__label">
        {glyph ? (
          <span className="picker-fact__glyph" aria-hidden="true">
            <Icon glyph={glyph} />
          </span>
        ) : null}
        {label}
      </dt>
      <dd className="picker-fact__value">{value}</dd>
    </div>
  )
}
