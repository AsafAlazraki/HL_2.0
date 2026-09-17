import { useCallback, useMemo, useState } from 'react'
import { Button, Input, PriceFigure, Tile } from '@/ui'
import { useCatalogue, useQuotes, useSession } from '@/app/useStores'
import { quotes as quotesStore } from '@/state/quotes'
import { catalogue } from '@/state/catalogue'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { money } from '@/domain/money'
import {
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
import { heldCopy, ledgerFacts } from './pictures'
import { startQuote, type Started } from './mint'
import './picker.css'

/* ============================================================
   THE PICKER — the register, then the model, then the one row a
   quote is written against.

   THE DIRECTION IS C, "THREE TIERS AT ONCE", from
   docs/research/refs/picker/notes.md §5. The owner handed the picks
   over, so it is chosen here; the screen is marked PROVISIONAL in
   docs/SCREENS.md until he has looked at it.

   WHY C AND NOT THE OTHER THREE. The hard fact of this file is that
   588 of its 810 hulls are Highfield, and those 588 rows are 67 models
   in 7 series: the collapse IS the problem, and only a design with a
   third tier can show it without averaging it away. A ("the counted
   rail") and D ("how big, then whose") both end at a grid of cards,
   where one Highfield card would have to fold fifteen rows and two
   prices into a single figure. B ("index and stage") holds 289 models
   beautifully down one column and has nowhere to put the two material
   prices and the seven colourway codes that are the actual choice. C
   keeps all three tiers live at once, so changing your mind about a
   register never blanks the other two answers, and the panel is a
   place where a variant can be told the truth about.

   THE TWO FRAMES NO EARLIER BOARD USED. `home/live/williams-tenders.png`
   — a rail of seven ranges, a column of sizes and a fact panel, all in
   one window, nothing navigating — and `picker/surtees-770.png`, the
   three-fact strip with the act at its right end, which is literally
   three of this file's own columns under one hull. Entry's boards
   leaned on Riviera, Zodiac and Lucid; Home's on Rapha, Sotheby's and
   Hagerty; neither used either of these.

   THE TIERS ARE THE FILE'S AND NOT THE MAKER'S — the sweep's sharpest
   finding. Stacer's own site says "over 70 models in 9 ranges"; this
   file carries 91 rows in 22 series, and the rail counts the file.
   Every figure on this screen is counted in `./fleet.ts` off the sheet
   that loaded; not one is typed here and not one is read off the
   manifest's header.
   ============================================================ */

/** Where the reader is inside this screen. A position is a URL search
 *  param (CLAUDE.md), so all three are handed in and handed back
 *  rather than kept in state: Back, a refresh and a shared link all
 *  land on the same three answers.
 *
 *  THE TYPED QUERY IS NOT ONE OF THEM, deliberately. A half-typed word
 *  in the address bar is not a position anybody would share, and
 *  Home's search field is local for the same reason. */
export interface PickerAt {
  /** the register the middle column is listing; absent means all of them */
  brand?: string
  /** the model the panel is showing */
  model?: string
  /** the one row of that model a quote would be written against */
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
  /** where a minted quote opens. Absent while the configurator is not
   *  built — and then the act still mints, and says where it would go. */
  openQuote?: (quoteId: string) => void
  /** the clock, injected so a test can say which instant it is asking
   *  about; a quote's reference is stamped from it */
  now?: () => Date
}

/** Said where the press happened, because that is where a refusal
 *  belongs. */
export const NO_CONFIGURATOR =
  'The configurator is the next screen of this milestone and it is not built yet, so nothing was navigated to.'

/** Nowhere in particular: no register, no model, no row. One frozen
 *  object rather than a fresh `{}` per render, so a screen rendered
 *  without a router does not re-render itself for no reason. */
const NOWHERE: PickerAt = Object.freeze({})

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
     the act says — a draft already standing for this row is handed
     back rather than written twice — so the list is a dependency of
     the render and not a thing to fetch when the button is pressed. */
  const filed = useQuotes((s) => s.quotes)

  const [query, setQuery] = useState('')
  const [started, setStarted] = useState<Started | null>(null)

  const fleet = useMemo(() => fleetOf(tables, rows), [tables, rows])
  const open = status === 'ready' && fleet.brands.length > 0

  const brand = fleet.brands.find((b) => b.id === at.brand) ?? null
  const model = modelByKey(fleet, at.model ?? null)

  /* THE ROW A QUOTE IS WRITTEN AGAINST. A model that is one row of the
     file IS that row, so nothing is asked for; a model that is fifteen
     rows at two figures is a real choice, and the act refuses with its
     reason until somebody makes it. */
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
  const inScope = brand ? brand.models.length : fleet.models

  return (
    <main
      className="picker"
      data-testid="picker"
      /* WHICH QUESTION THE READER IS ON, which at 833px and under is
         also WHICH COLUMN IS DRAWN: the index and the plate cannot
         stand beside each other in a hand, so they take turns, and the
         plate's summary goes above the list only once it is a summary
         of something the reader asked for. `picker.css` writes the
         whole ladder, at all six widths the rulers run. */
      data-stage={model ? 'panel' : brand ? 'brand' : 'all'}
    >
      <header className="picker-mast">
        <div className="picker-mast__ask">
          <p className="picker-eyebrow">New quote{business ? ` · ${business}` : ''}</p>
          <h1 className="picker-ask">Which hull is it?</h1>
          <p className="picker-say">
            {open
              ? 'Choose the register, then the model. Pressing a model writes a quote against one row of the price file.'
              : 'Nothing can be chosen until a price file has been read into this browser.'}
          </p>
        </div>

        {open ? (
          <div className="picker-mast__count" data-testid="picker-counts">
            <p className="picker-tally">
              <b>{fleet.rows.toLocaleString('en-AU')}</b> rows ·{' '}
              <b>{fleet.models.toLocaleString('en-AU')}</b> models ·{' '}
              <b>{fleet.series.toLocaleString('en-AU')}</b> series ·{' '}
              <b>{fleet.brands.length.toLocaleString('en-AU')}</b> registers
            </p>
            {/* THE FIGURE AND ITS RUNG, TOGETHER. A bare price with no
                rung beside it is exactly what the sweep's §2 refuses,
                and a zero standing in for a figure is what it refuses
                next. Both are said here, once, in counted words. */}
            <p className="picker-tally picker-tally--quiet">
              {fleet.priced.toLocaleString('en-AU')} of those rows carry a figure at the{' '}
              <b>{fleet.rung === '' ? 'first declared' : fleet.rung}</b> rung
              {fleet.zeroes > 0
                ? `; the other ${fleet.zeroes.toLocaleString('en-AU')} hold a zero there, and a zero is not a price`
                : ''}
              .
            </p>
          </div>
        ) : null}
      </header>

      {open ? (
        <div className="picker-floor">
          <Rail fleet={fleet} chosen={brand} move={move} />

          <section className="picker-index" aria-label="Models">
            <div className="picker-find">
              <label className="picker-find__label" htmlFor="picker-find">
                Find a model, a series or a register by name
              </label>
              <Input
                id="picker-find"
                type="search"
                value={query}
                onValueChange={setQuery}
                aria-describedby="picker-find-said"
                placeholder={`Search ${inScope.toLocaleString('en-AU')} models`}
              />
              {/* ONE OF THESE COUNTS IS A WORD AND IT WAS TYPED. "the
                  seven registers" was the only figure on this screen
                  not counted off the sheet, and a second dealership
                  with six would have read a lie; it is now
                  `fleet.brands.length`. The singular is the file's own
                  too: one model CARRIES those words. */}
              <p className="picker-find__said" id="picker-find-said">
                {query.trim() === ''
                  ? `${shown.length.toLocaleString('en-AU')} models, every one of them addressable without leaving this screen.`
                  : shown.length === 0
                    ? `Nothing in ${brand ? brand.name : `the ${fleet.brands.length} registers`} is called that.`
                    : `${shown.length.toLocaleString('en-AU')} of ${inScope.toLocaleString('en-AU')} models ${shown.length === 1 ? 'carries' : 'carry'} those words, in the file's own order.`}
              </p>
            </div>

            <div className="picker-list">
              {listed.map((section) => (
                <div className="picker-brandblock" key={section.brand.id}>
                  {brand === null ? (
                    <h2 className="picker-brandhead">
                      <span className="picker-brandhead__name">{section.brand.name}</span>
                      <span className="picker-brandhead__n">
                        {section.series
                          .reduce((n, s) => n + s.models.length, 0)
                          .toLocaleString('en-AU')}{' '}
                        models
                      </span>
                    </h2>
                  ) : null}
                  {section.series.map((group) => (
                    <SeriesBlock
                      key={group.key}
                      brand={section.brand}
                      group={group}
                      chosen={model}
                      at={at}
                      move={move}
                    />
                  ))}
                </div>
              ))}
            </div>
          </section>

          <Stage
            fleet={fleet}
            brand={brand}
            model={model}
            subject={subject}
            standing={standing !== undefined}
            started={started}
            at={at}
            move={move}
            press={press}
            canGo={openQuote !== undefined}
          />
        </div>
      ) : (
        <section className="picker-blank" aria-label="No price file">
          {/* THREE DIFFERENT ABSENCES, AND ONLY ONE OF THEM IS A BLANK
              SHEET. Measured in the browser on 2026-09-17: reaching
              this address in a fresh tab reads the sheet back out of
              IndexedDB, which takes about 300 ms, and for those 300 ms
              the screen said "no price file has been read into this
              browser" — which was not true, and was about to be
              disproved by 810 hulls appearing. A screen may say it does
              not know yet; it may not say the opposite of what it is
              about to say. */}
          {status === 'failed' || problem !== null ? (
            <p className="picker-blank__say" role="alert">
              The price file could not be read. {problem}
            </p>
          ) : status === 'ready' ? (
            <p className="picker-blank__say">
              <b>A blank sheet.</b> No price file has been read into this browser, so there is no
              register, no model and no figure to choose between. An empty sheet is the true state,
              not a broken one.
            </p>
          ) : (
            <p className="picker-blank__say">Looking for a price file in this browser…</p>
          )}
          {openTheFile && status !== 'empty' && status !== 'loading' ? (
            <Button intent="veiled" onClick={openTheFile}>
              Load the Master Price File
            </Button>
          ) : null}
        </section>
      )}
    </main>
  )
}

/* ---------------------------------------------------------- */
/* The rail: every register, with its true number               */
/* ---------------------------------------------------------- */

/**
 * THE COUNTED RAIL, which is the sweep's own name for it
 * (`picker/porsche-models.png`, whose every row carries its real
 * number in grey parentheses, "All (72)" included). Ours is All 810,
 * Stacer 91, Highfield 588 — counted off the sheet.
 *
 * IT IS TYPE AND NOT WORDMARKS, and that was measured rather than
 * preferred: `marks-ledger.json` holds a white-ink mark for three of
 * the seven boat makers, a dark-ink one for three more, and
 * Stabicraft's row reads "no public wordmark verified". A rail of
 * three logos and four words on a dark ground is four apologies in a
 * column. The sweep's own fallback order (§6.2) ends at the name, and
 * Porsche's own rail is set in type.
 */
function Rail({
  fleet,
  chosen,
  move,
}: {
  fleet: Fleet
  chosen: Brand | null
  move: (next: PickerAt) => void
}) {
  return (
    <section className="picker-rail" aria-label="Registers">
      {/* TWO BLOCKS AND NOT FOUR, because on a tall window the rail's
          rows are anchored to the top of the column and its notes to
          the bottom of it (`picker.css`, the fixed-height room). At
          1920 x 1080 the eight registers left about 480px of dead
          ground under them and the column read as a list that had run
          out; anchored, the same air is between two blocks that both
          belong to their own edge. */}
      <div className="picker-rail__top">
        <p className="picker-rail__head">Register</p>
        <ul className="picker-rail__list">
          <li className="picker-rail__item">
            <Tile
              tone="room"
              shape="row"
              selected={chosen === null}
              onSelect={() => move({})}
              label={`All registers, ${fleet.rows.toLocaleString('en-AU')} rows`}
            >
              <span className="picker-railrow">
                <span className="picker-railrow__name">All</span>
                <span className="picker-railrow__n">{fleet.rows.toLocaleString('en-AU')}</span>
              </span>
            </Tile>
          </li>
          {fleet.brands.map((b) => (
            <li className="picker-rail__item" key={b.id}>
              <Tile
                tone="room"
                shape="row"
                selected={chosen?.id === b.id}
                onSelect={() => move({ brand: b.id })}
                label={`${b.name}, ${b.rows.toLocaleString('en-AU')} rows`}
              >
                <span className="picker-railrow">
                  <span className="picker-railrow__name">{b.name}</span>
                  <span className="picker-railrow__n">{b.rows.toLocaleString('en-AU')}</span>
                </span>
              </Tile>
            </li>
          ))}
        </ul>
      </div>

      <div className="picker-rail__notes">
        <p className="picker-rail__foot">
          A number beside a register counts ROWS of this file, not boats on a floor.
        </p>
        {/* NOTHING VANISHES SILENTLY. A retired register and a row
            marked no longer sold are both refused upstream by
            `buildEntries`; this is where the count comes back and says
            so in the sheet's own words. It stands under the RAIL and
            not under the list of models, because what it is about is
            registers and the rows on them — and because under a
            search that narrows the list to one name it used to hang
            alone in the middle column. */}
        <p className="picker-held">
          {fleet.heldBack.length === 0
            ? 'Nothing is held back here: no boat register on this sheet is history rather than stock, and no hull on one is marked no longer sold.'
            : fleet.heldBack.map((h) => h.sentence).join(' ')}
        </p>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------- */
/* One series, and the models under it                          */
/* ---------------------------------------------------------- */

function SeriesBlock({
  brand,
  group,
  chosen,
  at,
  move,
}: {
  brand: Brand
  group: Series
  chosen: Model | null
  at: PickerAt
  move: (next: PickerAt) => void
}) {
  return (
    <div className="picker-series">
      <h3 className="picker-serieshead">
        <span className="picker-serieshead__name">
          {brand.filesSeries ? group.label : brand.name}
        </span>
        <span className="picker-serieshead__n">
          {brand.filesSeries
            ? `${group.models.length.toLocaleString('en-AU')} ${group.models.length === 1 ? 'model' : 'models'} · ${group.rows.toLocaleString('en-AU')} ${group.rows === 1 ? 'row' : 'rows'}`
            : `files no series, so its ${group.rows.toLocaleString('en-AU')} rows are its models`}
        </span>
      </h3>
      <ul className="picker-models">
        {group.models.map((model) => (
          <li key={model.key}>
            <Tile
              tone="room"
              shape="row"
              selected={chosen?.key === model.key}
              onSelect={() => move({ ...(at.brand ? { brand: at.brand } : {}), model: model.key })}
            >
              <span className="picker-model">
                <span className="picker-model__name">{model.name}</span>
                {/* SAID ONLY WHERE IT IS NEWS. On six of the seven
                    registers every model is one row, and "1 row" under
                    two hundred names is a column of noise that halves
                    how many models fit on a screen; the series heading
                    above already counts both. Where a model IS several
                    rows at several figures, that is the one thing a
                    person needs before they press it. */}
                {model.splits ? <span className="picker-model__note">{noteOf(model)}</span> : null}
                <span className="picker-model__price">
                  {model.from === null ? (
                    /* THE REFUSAL WHERE THE PRICE WOULD BE, never a
                       blank and never a zero — `nimbus-builder.png`
                       ends its card with a sentence in exactly this
                       slot and leaves the act live. */
                    <span className="picker-model__none">no figure</span>
                  ) : (
                    <>
                      {model.from === model.to ? '' : 'from '}
                      <PriceFigure amount={model.from} />
                    </>
                  )}
                </span>
              </span>
            </Tile>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** What a model that is more than one row says about itself beside its
 *  name: how many rows of the file it is, and at how many different
 *  figures. That second number is the sweep's own finding made visible
 *  — in 43 of Highfield's 67 models the price is a function of the
 *  material alone, and in the other 24 it splits further inside one. */
function noteOf(model: Model): string {
  const figures = new Set(model.variants.map((v) => v.amount)).size
  return `${model.rows} rows · ${figures === 1 ? 'one figure' : `${figures} figures`}`
}

/* ---------------------------------------------------------- */
/* The stage                                                    */
/* ---------------------------------------------------------- */

/** The panel RE-FILLS AND NEVER BLANKS — direction C's own rule, and
 *  the answer to `zodiac-comparator.png`, which is three empty selects
 *  over four hundred pixels of nothing. */
function Stage({
  fleet,
  brand,
  model,
  subject,
  standing,
  started,
  at,
  move,
  press,
  canGo,
}: {
  fleet: Fleet
  brand: Brand | null
  model: Model | null
  subject: Variant | null
  standing: boolean
  started: Started | null
  at: PickerAt
  move: (next: PickerAt) => void
  press: () => void
  canGo: boolean
}) {
  return (
    <aside className="picker-stage" aria-label="What is chosen">
      {model ? (
        <ChosenModel
          model={model}
          subject={subject}
          standing={standing}
          started={started}
          at={at}
          move={move}
          press={press}
          canGo={canGo}
        />
      ) : brand ? (
        <ChosenBrand brand={brand} />
      ) : (
        <WholeFleet fleet={fleet} />
      )}
    </aside>
  )
}

function WholeFleet({ fleet }: { fleet: Fleet }) {
  const ledger = ledgerFacts()
  /* COUNTED, NOT TYPED. This paragraph said "Six of these registers
     file one row per model" in words, which was the last figure on
     this screen somebody had written down rather than measured — and
     on a second dealership's file it would have been wrong the day it
     loaded. A register files one row per model when its rows and its
     models are the same number. */
  const flat = fleet.brands.filter((b) => b.models.length === b.rows)
  const deep = fleet.brands.filter((b) => b.models.length !== b.rows)
  return (
    <>
      <div className="picker-stage__crest">
        <p className="picker-stage__over">Every register</p>
        <h2 className="picker-stage__name">{fleet.brands.length} makers on this sheet</h2>
        <p className="picker-stage__lede">
          Choose a register to narrow the list, or a model to see what it is made of. Nothing is
          chosen yet, so nothing is quoted yet.
        </p>
      </div>
      {/* NOTHING IS CHOSEN, SO THE PLATE IS A SHORT PANEL IN A TALL
          COLUMN. The figures take the top of it and the two sentences
          about how the file is filed take the bottom, the same way the
          rail's notes do, so the room between them is between two
          things that each belong to an edge. */}
      <div className="picker-stage__body picker-stage__body--spread">
        <dl className="picker-strip">
          <Fact label="Rows" value={fleet.rows.toLocaleString('en-AU')} />
          <Fact label="Models" value={fleet.models.toLocaleString('en-AU')} />
          <Fact label="Series" value={fleet.series.toLocaleString('en-AU')} />
        </dl>
        <div className="picker-stage__tail">
          <p className="picker-note">
            A model is not a row. {flat.length.toLocaleString('en-AU')} of these registers file one
            row per model
            {deep.length === 0
              ? '.'
              : `; ${deep.map((b) => b.name).join(', ')} ${deep.length === 1 ? 'files' : 'file'} a row per material and colourway, which is the whole of why ${fleet.rows.toLocaleString('en-AU')} rows are ${fleet.models.toLocaleString('en-AU')} models.`}
          </p>
          <p className="picker-note">
            {ledger.held.toLocaleString('en-AU')} of the {ledger.addresses.toLocaleString('en-AU')}{' '}
            picture addresses this file carries have a copy held here, each with its own provenance.
            A model with none says so; nothing stands in for it.
          </p>
        </div>
      </div>
    </>
  )
}

function ChosenBrand({ brand }: { brand: Brand }) {
  const held = brand.models.filter((m) => heldCopy(m.img?.src) !== null).length
  return (
    <>
      <div className="picker-stage__crest">
        <p className="picker-stage__over">Register</p>
        <h2 className="picker-stage__name">{brand.name}</h2>
        <p className="picker-stage__lede">
          {brand.filesSeries
            ? `${brand.named} series, ${brand.models.length} models, ${brand.rows.toLocaleString('en-AU')} rows — the file's own tiers, not the maker's.`
            : `${brand.models.length} models in ${brand.rows.toLocaleString('en-AU')} rows. This register files no series at all, so the list beside it is flat.`}
        </p>
      </div>
      <div className="picker-stage__body picker-stage__body--spread">
        <dl className="picker-strip">
          <Fact label="Rows" value={brand.rows.toLocaleString('en-AU')} />
          <Fact label="Models" value={brand.models.length.toLocaleString('en-AU')} />
          <Fact
            label={brand.rung === '' ? 'Not priced' : `From, at ${brand.rung}`}
            value={brand.from === null ? '—' : money(brand.from)}
          />
        </dl>
        <div className="picker-stage__tail">
          <p className="picker-note">
            {brand.from === null
              ? `No row of ${brand.name} carries a figure at the ${brand.rung === '' ? 'declared' : brand.rung} rung.`
              : `${money(brand.from)} to ${money(brand.to ?? brand.from)} at the ${brand.rung} rung.`}
            {brand.zeroes > 0
              ? ` ${brand.zeroes.toLocaleString('en-AU')} of its rows hold a zero there rather than a figure, and those models say so where the price would be.`
              : ''}
          </p>
          <p className="picker-note">
            {held === 0
              ? 'No model of this register resolves to a picture held here, so every panel says so rather than standing one in.'
              : `${held.toLocaleString('en-AU')} of its ${brand.models.length.toLocaleString('en-AU')} models resolve to a picture held here, each with its own provenance.`}
          </p>
        </div>
      </div>
    </>
  )
}

/* ---------------------------------------------------------- */
/* A model, whole                                               */
/* ---------------------------------------------------------- */

function ChosenModel({
  model,
  subject,
  standing,
  started,
  at,
  move,
  press,
  canGo,
}: {
  model: Model
  subject: Variant | null
  standing: boolean
  started: Started | null
  at: PickerAt
  move: (next: PickerAt) => void
  press: () => void
  canGo: boolean
}) {
  const picture = heldCopy(model.img?.src)
  const material = subject?.material ?? null
  const codes = variantsIn(model, material)
  const unread = unreadIn(codes)
  const back: PickerAt = at.brand ? { brand: at.brand } : {}

  /* TWO QUESTIONS, ASKED ONE AT A TIME. A Sport 560 is fifteen rows in
     two materials and seven or eight colourways, and putting all
     fifteen codes on screen beside two material chips asks both
     questions at once and pushes the act off the plate. The material is
     the one that moves the figure (the sweep's §0: in 43 of Highfield's
     67 models the price is a function of material alone), so it is
     asked first, and pressing it chooses that material's first row — so
     the figure is real and the act is live from that moment, and the
     colourway is a refinement rather than a gate. A model built in one
     material has no first question, so it is not asked one. */
  const asksMaterial = model.materials.length > 1
  const showsCodes = !asksMaterial || material !== null

  /* THE WORD WAS WRONG. The chips are ABOVE the act in every one of
     the six widths — they are the last thing in the plate's body and
     the act stands in its foot — and this sentence sent the reader
     down the screen past it. */
  const refusal =
    subject === null
      ? `This model is ${model.rows} rows of the price file, and a quote is written against ONE of them. Choose ${asksMaterial ? 'a material' : 'a colourway'} above and this becomes live.`
      : undefined

  return (
    <>
      <div className="picker-stage__crest">
        {/* THE WAY BACK, AND ONLY WHERE IT MEANS ANYTHING. Above 834px
            the list stands beside this panel, so a control offering to
            go back to it would point at what the reader is looking at;
            `picker.css` takes it out of the page there entirely rather
            than leaving a dead control in the reading order. */}
        <div className="picker-back">
          <Button intent="veiled" size="sm" onClick={() => move(back)}>
            ← All the models
          </Button>
        </div>

        <p className="picker-stage__over">{model.register}</p>
        <h2 className="picker-stage__name">{model.name}</h2>
        <p className="picker-stage__lede">
          {model.series === '' ? 'Filed under no series' : model.series} ·{' '}
          {model.rows.toLocaleString('en-AU')} {model.rows === 1 ? 'row' : 'rows'} of the price file
        </p>
      </div>

      <div className="picker-stage__body">
        <figure className="picker-shot">
          {picture ? (
            <img
              className="picker-shot__img"
              src={picture.at}
              alt={model.name}
              width={picture.w}
              height={picture.h}
            />
          ) : null}
          <figcaption className="picker-shot__cap">
            {picture
              ? `Held copy ${picture.w.toLocaleString('en-AU')} × ${picture.h.toLocaleString('en-AU')}, never enlarged · ${picture.verdict === 'scene' ? 'a photograph on the water' : `a ${picture.verdict} picture`} from ${hostOf(picture.address)}`
              : model.img
                ? 'The row carries a picture address and no copy of it is held here, so nothing is drawn and nothing stands in.'
                : 'This row carries no picture address at all. Nothing is drawn and nothing is invented.'}
          </figcaption>
        </figure>

        {model.facts.length > 0 ? (
          <dl className="picker-strip">
            {model.facts.map((fact) => (
              <Fact key={fact.label} label={fact.label} value={fact.value} say={fact.say} />
            ))}
          </dl>
        ) : null}

        {asksMaterial ? (
          <div className="picker-pick">
            <p className="picker-pick__head">
              Material — {model.materials.length} on this model, each at its own figure
            </p>
            <div className="picker-chips">
              {model.materials.map((group) => (
                <Tile
                  key={group.name === '' ? 'none' : group.name}
                  tone="room"
                  shape="chip"
                  selected={material === group.name}
                  onSelect={() =>
                    move({
                      ...back,
                      model: model.key,
                      ...(group.variants[0] ? { row: group.variants[0].rowId } : {}),
                    })
                  }
                  label={`${group.label}, ${group.variants.length} rows`}
                >
                  <span className="picker-chip">
                    <span className="picker-chip__name">{group.label}</span>
                    <span className="picker-chip__sub">
                      {group.from === null
                        ? 'no figure'
                        : group.from === group.to
                          ? money(group.from)
                          : `${money(group.from)} – ${money(group.to ?? group.from)}`}
                      {' · '}
                      {group.variants.length}{' '}
                      {group.variants.length === 1 ? 'colourway' : 'colourways'}
                    </span>
                  </span>
                </Tile>
              ))}
            </div>
          </div>
        ) : null}

        {model.splits && showsCodes ? (
          <div className="picker-pick">
            <p className="picker-pick__head">
              Colourway — {codes.length} {codes.length === 1 ? 'code' : 'codes'}
              {material === null || material === '' ? '' : ` in ${material}`}
            </p>
            <div className="picker-chips">
              {codes.map((variant) => (
                <Tile
                  key={variant.rowId}
                  tone="room"
                  shape="chip"
                  selected={subject?.rowId === variant.rowId}
                  onSelect={() => move({ ...back, model: model.key, row: variant.rowId })}
                  label={
                    variant.reads
                      ? `${variant.code}, ${variant.say}`
                      : variant.coded
                        ? `${variant.code}, a code this file does not decode`
                        : variant.code
                  }
                >
                  <span className="picker-chip">
                    {/* THE CODE IS THE CONTENT AND NO SWATCH IS DRAWN.
                        Four of the tokens in this file have no decode
                        at all, and a colour nobody can name is a colour
                        nobody may paint. B&O writes "5 Colours" rather
                        than guessing swatches; this writes the code. */}
                    <span className="picker-chip__code">
                      {variant.code === '' ? '—' : variant.code}
                    </span>
                    <span className="picker-chip__sub">
                      {variant.reads
                        ? variant.say
                        : variant.coded
                          ? 'not decoded'
                          : 'the file’s own word'}
                    </span>
                  </span>
                </Tile>
              ))}
            </div>
            {unread.length > 0 ? (
              <p className="picker-note">
                {unread.length === 1 ? 'The code' : 'The codes'}{' '}
                <span className="picker-mono">{unread.join(', ')}</span>{' '}
                {unread.length === 1 ? 'has' : 'have'} no decode in this file or in the dealership's
                own legend, so {unread.length === 1 ? 'it is' : 'they are'} printed as{' '}
                {unread.length === 1 ? 'the code it is' : 'the codes they are'}. It is a question
                for the dealer, never a guess.
              </p>
            ) : null}
          </div>
        ) : null}

        <p className="picker-prov">
          {model.trail === '' ? model.name : model.trail} · {model.register} ·{' '}
          <span className="picker-mono">{model.key}</span>
        </p>
      </div>

      {/* THE PLATE'S FOOT — THE FIGURE AND THE ACT, AND NEITHER OF THEM
          SCROLLS. Measured on the built screen at 1440 x 900 with the
          SP560 chosen: `Start the quote` stood at top 857, nine pixels
          sliced by the window, and choosing a material — the press
          that makes the act live — moved it to 1119, which is 219px
          below a 900px window and still below an 1080px one. The whole
          plate was one scroller, so the one thing a dealer came here
          to press was the one thing the room hid.

          The answer is the shape the sweep already found and the board
          did not take: `picker/surtees-770.png` puts the facts along a
          strip with the act at its end. Here the plate splits into a
          crest that names what is chosen, a body that scrolls through
          what it is made of, and this foot, which carries the figure
          it would be quoted at and the act that quotes it. It is not a
          floating bottom bar and never becomes one: it is the foot of
          a bordered plate a third of the screen wide, it sits under
          the thing it acts on, and under 1200px — a hand, a tablet,
          a short window — it is an ordinary block at the end of the
          page, exactly as it was at 390 where the built screen was
          already right.

          THE FIGURE CAME DOWN HERE WITH IT, and that is the second
          reason. The material chips are what move the price, and with
          the figure at the top of a scroller a dealer pressed HYP and
          watched nothing: the number that changed was above the fold
          of the panel he was reading. */}
      <div className="picker-stage__foot">
        <div className="picker-money">
          {model.from === null ? (
            <>
              <p className="picker-money__none">
                No price at the {model.rung === '' ? 'declared' : model.rung} rung
              </p>
              <p className="picker-money__why">
                {model.zeroes === model.rows
                  ? `${model.rows === 1 ? 'This row holds' : `All ${model.rows} of its rows hold`} a zero where the figure goes, and a zero is not a price. The quote still opens; a person puts the number on it.`
                  : 'The cell this rung reads is empty here. The quote still opens; a person puts the number on it.'}
              </p>
            </>
          ) : (
            <>
              <p className="picker-money__fig">
                {subject === null && model.from !== model.to ? 'from ' : ''}
                <PriceFigure amount={subject?.amount ?? model.from} />
              </p>
              <p className="picker-money__rung">
                {subject
                  ? `${model.rung} — this row's own figure, read at the rung a new quote opens at`
                  : model.from === model.to
                    ? `${model.rung}, and the same on all ${model.rows} rows`
                    : `${model.rung}, ${money(model.from)} to ${money(model.to ?? model.from)} across its ${model.rows} rows`}
              </p>
            </>
          )}
        </div>

        <div className="picker-act">
          <Button intent="act" onClick={press} refusedBecause={refusal}>
            {standing ? 'Open the draft already standing' : 'Start the quote'}
          </Button>
          {subject ? (
            <p className="picker-act__say">
              {standing
                ? 'A draft for this exact row is already open with nobody named on it, so this hands that one back rather than writing a second.'
                : `Writes a quote against ${subject.label}, at the ${model.rung} rung, and keeps it in this browser.`}
            </p>
          ) : null}
        </div>

        {started ? <Made started={started} canGo={canGo} /> : null}
      </div>
    </>
  )
}

/** What the press did, said where the press happened. */
function Made({ started, canGo }: { started: Started; canGo: boolean }) {
  if (!started.ok) {
    return (
      <div className="picker-made" role="alert">
        <p>{started.refused}</p>
      </div>
    )
  }
  return (
    /* An `output` rather than a div with `role="status"`: the element
       already carries that role, and it is the tag for a result the
       page computed from what somebody did. */
    <output className="picker-made" data-testid="picker-made">
      <p className="picker-made__head">
        Quote <span className="picker-mono">{started.quote.reference}</span>{' '}
        {started.already ? 'was already open' : 'is written'}
      </p>
      <p>
        {started.quote.subjectLabel} · {started.quote.lines.length.toLocaleString('en-AU')}{' '}
        {started.quote.lines.length === 1 ? 'line' : 'lines'} ·{' '}
        {started.quote.sections.length.toLocaleString('en-AU')}{' '}
        {started.quote.sections.length === 1 ? 'chapter' : 'chapters'}, every figure on it frozen at
        the moment it was written.
      </p>
      <p>
        It opens at <span className="picker-mono">{started.goTo}</span>.{' '}
        {canGo
          ? ''
          : `${NO_CONFIGURATOR} The document is written and kept in this browser either way.`}
      </p>
    </output>
  )
}

/* ---------------------------------------------------------- */
/* Small pieces                                                 */
/* ---------------------------------------------------------- */

/**
 * ONE FIGURE UNDER ITS LABEL, hairline-divided — the strip
 * `gradywhite-models2.png` runs as LENGTH · BEAM · MAX HP and
 * `surtees-770.png` as OVERALL LENGTH · HORSEPOWER · BMT DRY WEIGHT.
 * The columns are not named here: `tileFacts` in the domain chooses
 * them by MEASURING each register's own columns, so a register that
 * fills different ones fills this strip differently, and no column
 * name from this dealer's workbook lives in this screen.
 */
function Fact({ label, value, say }: { label: string; value: string; say?: string }) {
  return (
    <div className="picker-fact" title={say}>
      <dt className="picker-fact__label">{label}</dt>
      <dd className="picker-fact__value">{value}</dd>
    </div>
  )
}

/** The host an address belongs to, for a caption. A malformed address
 *  says less rather than throwing. */
function hostOf(address: string): string {
  try {
    return new URL(address).host
  } catch {
    return 'an address this file carries'
  }
}
