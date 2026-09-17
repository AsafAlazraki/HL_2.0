import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { preload } from 'react-dom'
import { MIN_QUERY, buildSearchIndex, normalizeQuery, search } from '@/domain/catalogue/search'
import type { EntityDef, RowData } from '@/domain/model'
import { useCatalogue, useQuotes, useSession } from '@/app/useStores'
import { Button, Figure, Input, Kbd } from '@/ui'
import { holdingsOf, modelRowsOf, type Holdings } from './holdings'
import { markFor, markLedgerFacts, pictureById, type HeldPicture } from './ledgers'
import './home.css'

/* ============================================================
   HOME — built from docs/directions/home/b-one-photograph.html
   ("Cinema day"), the direction an independent critic recommended on
   2026-09-17. The owner has not picked, so the screen is marked
   provisional in docs/SCREENS.md and the board is the specification.

   THE BOARD'S OWN IDEA, kept whole: a dark room with two daylight
   photographs hanging in it, each one an object on the ground rather
   than a wallpaper with an interface floating on top; everything the
   dealer touches on the ground beneath the fold; and no word ever
   composited on a picture, which is what makes every contrast figure
   on this screen a fact about two flat colours.

   WHAT IS TRUE HERE AND IS NOT TRUE ON THE BOARD. A board is a
   picture: it can draw an act that acts and a photograph that is
   always held. This screen draws what is actually the case on this
   build, and says so in sentences:

     · NEW QUOTE REFUSES. The picker is the next screen of Milestone 1
       and it does not exist, so the act carries its reason instead of
       navigating nowhere. It is not a dead control: it keeps its
       focus, its name and its sentence.
     · NEITHER PLATE IS A DOOR. The board draws each caption as a
       named door into that boat's register. A register has no screen
       yet, so each plate is a caption that names the register and
       counts it, and one line under the fold says why it does not
       open.
     · NO DRAFT EXISTS, so the card is drawn empty with every region
       named — the board's own answer, and the true state of this
       computer.

   EVERY FIGURE IS COUNTED OFF WHAT LOADED (see ./holdings.ts), never
   read from the manifest's header and never typed. There is no total
   of boats for sale anywhere on this screen, because the file carries
   no such figure.
   ============================================================ */

/** The two photographs this screen hangs, by the ids the picture
 *  ledger gives them. Named rather than ranked: a screen that picked
 *  "the biggest" would change its own composition the day a picture
 *  was added. Both are on-water stills, which is what lets a caption
 *  sit on water and never on a hull. */
const LEFT = 'highfield-adv7'
const RIGHT = 'stacer-519-sea-ranger'

export interface HomeProps {
  /** WHOSE FILE THIS IS, read off what was opened — the pack's own
   *  name on a first open, the name kept beside the sheet on every
   *  open after that. The catalogue store carries it (`business`)
   *  because Entry opens the file and Home prints what was opened, and
   *  a navigation sits between them; the route reads it there and
   *  hands it down, so this screen can still be rendered against any
   *  business without a sheet. Milestone 4's organisation record
   *  replaces the store's field and arrives through this same prop.
   *  Null is honest: a blank sheet belongs to nobody yet. */
  business?: string | null
  /** where the sheet came from on this open, for the stamp under the
   *  business's name — the store's `from`, handed down the same way.
   *  Absent until the open has finished. */
  from?: 'pack' | 'repository' | null
  /** how long that took, in milliseconds */
  ms?: number | null
  /** the sentence when the file was read but could not be kept here */
  unkept?: string | null
  /** the sentence when the sheet could not be opened at all, which the
   *  store never sees because nothing ever reached it */
  problem?: string | null
  /** the hour of the day the greeting reads, injected so a test can
   *  say which one it is asking about */
  hour?: number
  /**
   * THE WAY BACK TO THE DOOR, for a desk with no price file in it.
   * Home reads this browser and never the file — Entry's blue door is
   * the one place the file is read (`src/routes/index.tsx`) — so the
   * only honest thing a blank sheet can offer is the door, and this is
   * how the route hands it over. Absent, the blank sheet says what it
   * is and offers nothing, which is what a render with no router can
   * truthfully do.
   */
  openTheFile?: () => void
}

export function Home({
  business = null,
  from = null,
  ms = null,
  unkept = null,
  problem = null,
  hour,
  openTheFile,
}: HomeProps) {
  const status = useCatalogue((s) => s.status)
  const refused = useCatalogue((s) => s.problem)
  const tables = useCatalogue((s) => s.tables)
  const rows = useCatalogue((s) => s.rows)
  const modules = useCatalogue((s) => s.modules)
  const who = useSession((s) => s.name)
  const quotes = useQuotes((s) => s.quotes)
  const quotesRead = useQuotes((s) => s.loaded)
  const quotesProblem = useQuotes((s) => s.problem)

  const held = useMemo(() => holdingsOf(tables, rows, modules), [tables, rows, modules])
  const open = status === 'ready' && held.tables > 0
  /* A BUSINESS WITH AN EMPTY NAME HAS NO NAME. A file packed without
     one hands us '', and a screen that then greets "What  sells" is
     worse than one that says nobody has been named yet. */
  const named = business !== null && business.trim() !== '' ? business.trim() : null

  return (
    <main className="home" data-testid="home">
      <Masthead
        business={named}
        held={held}
        open={open}
        status={status}
        problem={problem ?? refused}
        from={from}
        ms={ms}
        unkept={unkept}
        openTheFile={openTheFile}
      />

      <Fold tables={tables} rows={rows} open={open} />

      <div className="home-sheet">
        <Desk business={named} held={held} open={open} who={who} hour={hour} />
        <Sells business={named} held={held} open={open} />
        <Makers held={held} open={open} />
        <Drafts quotes={quotes} read={quotesRead} problem={quotesProblem} />
      </div>
    </main>
  )
}

/* ---------------------------------------------------------- */
/* The masthead: whose desk, and which file                    */
/* ---------------------------------------------------------- */

/**
 * THE BUSINESS'S NAME IS THE SHOWPIECE, at the head of an empty room
 * with nothing near it. This repo holds the makers' marks and not the
 * dealership's, so the name is set as type; the day a mark is uploaded
 * (docs/CUSTOMISATION.md, layer 2) it draws in this same place at the
 * ceiling the stylesheet sets and nothing below it moves.
 */
function Masthead({
  business,
  held,
  open,
  status,
  problem,
  from,
  ms,
  unkept,
  openTheFile,
}: {
  business: string | null
  held: Holdings
  open: boolean
  status: string
  problem: string | null
  from: 'pack' | 'repository' | null
  ms: number | null
  unkept: string | null
  openTheFile?: () => void
}) {
  return (
    <header className="home-masthead">
      {business ? (
        <p className="home-name">{business}</p>
      ) : (
        <p className="home-name home-name-none">This business has not been named yet</p>
      )}

      <div className="home-stamp">
        {/* THIS SCREEN DOES NOT READ THE FILE, so it never says it is:
            it reads what this browser has kept, and Entry's blue door
            is the one place the Master Price File is opened. Saying
            "reading the file" here would be a sentence about work
            nobody is doing. */}
        {(status === 'empty' || status === 'loading') && problem === null && (
          <p className="home-stamp-line">Looking for a price file in this browser…</p>
        )}
        {(status === 'failed' || problem !== null) && (
          <p className="home-stamp-line" role="alert">
            The file could not be read. {problem}
          </p>
        )}
        {status === 'ready' && !open && (
          <div className="home-stamp-blank">
            <p className="home-stamp-line">
              A blank sheet. No price file has been read into it yet.
            </p>
            {/* THE DOOR, WHERE THE ABSENCE IS SAID. The blank door on
                Entry promises the file can be loaded later; this is
                later. It is drawn veiled because the masthead is the
                dark room, and it is simply absent — not a dead
                control — where nothing handed this screen a way
                there. */}
            {openTheFile ? (
              <Button intent="veiled" onClick={openTheFile}>
                Load the Master Price File
              </Button>
            ) : null}
          </div>
        )}
        {open && (
          <div data-testid="pack-counts">
            <p className="home-stamp-line">
              Master Price File
              {from === null
                ? ''
                : from === 'pack'
                  ? ' · read from the file'
                  : ' · read from this browser'}
              {ms === null ? '' : ` · in ${ms} ms`}
            </p>
            <p className="home-stamp-line">
              <b>{held.tables.toLocaleString('en-AU')}</b> tables ·{' '}
              <b>{held.rows.toLocaleString('en-AU')}</b> rows ·{' '}
              <b>{held.joins.toLocaleString('en-AU')}</b> of them fitment joins
            </p>
          </div>
        )}
        {unkept !== null && (
          <output className="home-stamp-line">
            The file was read but could not be kept in this browser, so the next visit reads it
            again. {unkept}
          </output>
        )}
      </div>
    </header>
  )
}

/* ---------------------------------------------------------- */
/* The fold: two photographs, one seam                         */
/* ---------------------------------------------------------- */

/** The size a photograph is actually painted at, read off the element. */
interface Drawn {
  w: number
  h: number
}

/**
 * HOW WIDE THE BROWSER SHOULD ASSUME EACH FRAME IS, so it can pick a
 * width off the `srcset` before any layout exists. It is the fold's own
 * two percentages out of home.css rather than an arithmetic of gutters,
 * which would have to be re-derived at every breakpoint and would go
 * stale silently; checked at all six ruler widths, both hints pick the
 * same candidate the exact measure would.
 */
const WIDE_FRAME = '(max-width: 1199.98px) 100vw, 58vw'
const NARROW_FRAME = '(max-width: 1199.98px) 100vw, 42vw'

/** `srcset` for a held picture: every copy the ledger records, each with
 *  its own pixel width, so the browser fetches the one it will draw. */
const srcSetOf = (picture: HeldPicture): string =>
  picture.widths.map((copy) => `${copy.src} ${copy.width}w`).join(', ')

function Fold({
  tables,
  rows,
  open,
}: {
  tables: Readonly<Record<string, EntityDef>>
  rows: Readonly<Record<string, RowData[]>>
  open: boolean
}) {
  const left = pictureById(LEFT)
  const right = pictureById(RIGHT)
  const pictures = [left, right].filter((p): p is HeldPicture => p !== undefined)

  /* THE FOLD IS THE FIRST OBJECT ON THE SCREEN, SO IT IS FETCHED FIRST.
     Measured on the built screen, 2026-09-17: the two photographs were
     two dark rectangles for about two seconds on a cold cache, because
     the <img> is only rendered once the sheet is open and the request
     therefore could not start until the file had been read out of this
     browser. This asks for them at the first paint instead — the same
     addresses, the same `srcset` and the same `sizes` the frames use, so
     the preload and the picture are one request and never two. */
  for (const picture of pictures) {
    preload(picture.src, {
      as: 'image',
      imageSrcSet: srcSetOf(picture),
      imageSizes: picture === left ? WIDE_FRAME : NARROW_FRAME,
      fetchPriority: 'high',
    })
  }

  const [drawn, setDrawn] = useState<Record<string, Drawn>>({})
  const measured = useCallback((id: string, size: Drawn) => {
    setDrawn((was) =>
      was[id]?.w === size.w && was[id]?.h === size.h ? was : { ...was, [id]: size },
    )
  }, [])

  /* THE CLAIM IS A MEASUREMENT OR IT IS NOT MADE. The first cut printed
     the two held sizes and then appended "neither drawn past its own
     size" as a constant string — true on the day it was written and not
     checkable the day the fold's height changes. Each frame now reads
     its own painted size off the element and reports it here, so the
     sentence below is the arithmetic of what is on the screen. */
  const sizes = pictures.map((p) => drawn[p.id]).filter((d): d is Drawn => d !== undefined)
  const allMeasured = sizes.length === pictures.length && pictures.length > 0
  const enlarged = pictures.filter((p) => {
    const d = drawn[p.id]
    return d !== undefined && (d.w > p.width || d.h > p.height)
  })

  return (
    <>
      <section
        className="home-fold"
        aria-label="Two boats from the file"
        data-drawn={pictures.length > 0 && open ? 'photographs' : 'nothing'}
      >
        <Frame
          picture={left}
          tables={tables}
          rows={rows}
          open={open}
          sizes={WIDE_FRAME}
          onDrawn={measured}
          wide
        />
        <Frame
          picture={right}
          tables={tables}
          rows={rows}
          open={open}
          sizes={NARROW_FRAME}
          onDrawn={measured}
        />
      </section>
      <p className="home-filmline">
        {pictures.length > 0 && open
          ? pictures
              .map((p) => {
                const size = drawn[p.id]
                const held = `held ${p.width.toLocaleString('en-AU')} × ${p.height.toLocaleString('en-AU')}`
                return size
                  ? `${p.subject} — ${held}, drawn ${size.w.toLocaleString('en-AU')} × ${size.h.toLocaleString('en-AU')}`
                  : `${p.subject} — ${held}`
              })
              .join(' · ')
          : 'No photograph is drawn above, and none is stood in for.'}
        {pictures.length > 0 && open && allMeasured
          ? enlarged.length === 0
            ? ' · neither drawn past its own size'
            : ` · ${enlarged.map((p) => p.subject).join(' and ')} is drawn past its own size`
          : ''}
        {' · '}
        Neither plate opens yet: a register has no screen until the picker is built.
      </p>
    </>
  )
}

/**
 * ONE FRAME. The photograph is an object in a box on the ground, so
 * the box is what the layout depends on and the picture is what fills
 * it. A frame with no picture to put in it keeps its place and its
 * caption and says what is missing — which is the same code path for
 * the two honest absences: a sheet with nothing in it, and a second
 * dealership that has uploaded no photographs.
 */
function Frame({
  picture,
  tables,
  rows,
  open,
  sizes,
  onDrawn,
  wide = false,
}: {
  picture: HeldPicture | undefined
  tables: Readonly<Record<string, EntityDef>>
  rows: Readonly<Record<string, RowData[]>>
  open: boolean
  /** what the browser should assume this frame's width is */
  sizes: string
  /** where this frame reports the size it actually painted */
  onDrawn: (id: string, size: Drawn) => void
  wide?: boolean
}) {
  const register = picture ? tables[picture.table] : undefined
  const list = picture ? (rows[picture.table] ?? []) : []
  const showing = picture !== undefined && open && register !== undefined
  const ofThisModel = showing && picture ? modelRowsOf(register, list, picture.model) : 0
  const photograph = useRef<HTMLImageElement>(null)

  /* THE PAINTED SIZE, NOT THE BOX — the same arithmetic entry runs on
     its one photograph. `object-fit: cover` scales the whole picture
     until it covers the box and the box crops the rest, so the scale is
     the larger of the two ratios and the size reported is the whole
     picture at that scale. */
  useEffect(() => {
    const img = photograph.current
    if (!showing || !img || !picture || typeof ResizeObserver === 'undefined') return
    const read = (): void => {
      const box = img.getBoundingClientRect()
      if (box.width <= 0 || box.height <= 0) return
      const scale = Math.max(box.width / picture.width, box.height / picture.height)
      onDrawn(picture.id, {
        w: Math.round(picture.width * scale),
        h: Math.round(picture.height * scale),
      })
    }
    read()
    const watch = new ResizeObserver(read)
    watch.observe(img)
    return () => {
      watch.disconnect()
    }
  }, [showing, picture, onDrawn])

  return (
    <figure className={wide ? 'home-frame home-frame-wide' : 'home-frame'}>
      {showing && picture ? (
        <img
          className="home-pic"
          ref={photograph}
          src={picture.src}
          srcSet={srcSetOf(picture)}
          sizes={sizes}
          alt={picture.subject}
          width={picture.width}
          height={picture.height}
          /* the fold is the first object on the screen, so it is fetched
             and decoded at the front of the queue rather than lazily */
          fetchPriority="high"
          decoding="async"
          style={{ maxWidth: picture.width }}
        />
      ) : null}
      {/* THE FRAME KEEPS ITS PLACE AND THE CAPTION KEEPS ITS PLACE,
          whether or not there is a picture between them. An absence is
          said once, on the plate, where a caption always is — never as
          a second sentence inside an empty box. */}
      <figcaption className="home-plate">
        {showing && picture && register ? (
          <>
            <p className="home-plate-who">{register.name}</p>
            <p className="home-plate-what">{picture.model}</p>
            <p className="home-plate-door">
              <b>{list.length.toLocaleString('en-AU')} rows</b> in that register, and{' '}
              {ofThisModel.toLocaleString('en-AU')} of them are this model.
            </p>
          </>
        ) : (
          <>
            <p className="home-plate-who">No photograph here</p>
            <p className="home-plate-door">
              {picture
                ? 'A picture belongs to the row it depicts, and no row is open. Nothing stands in for it.'
                : 'No photograph is held for this frame, and nothing stands in for one.'}
            </p>
          </>
        )}
      </figcaption>
    </figure>
  )
}

/* ---------------------------------------------------------- */
/* The desk: the greeting, the one act, the search             */
/* ---------------------------------------------------------- */

/** The greeting reads the clock and nothing else. A name appears only
 *  when somebody has typed one at the door; until then the screen says
 *  why it has none, rather than greeting a person who does not exist. */
export function greetingFor(hour: number, name: string | null): string {
  const part = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
  return name ? `Good ${part}, ${name}.` : `Good ${part}.`
}

/** Said at the act, because that is where the press happens. */
export const NO_PICKER =
  'The picker is not built yet, so there is nowhere for this to go. It is the next screen of this milestone.'

function Desk({
  business,
  held,
  open,
  who,
  hour,
}: {
  business: string | null
  held: Holdings
  open: boolean
  who: string | null
  hour?: number
}) {
  const [query, setQuery] = useState('')
  const field = useRef<HTMLElement>(null)
  const asking = normalizeQuery(query).length >= MIN_QUERY
  const tables = useCatalogue((s) => s.tables)
  const rows = useCatalogue((s) => s.rows)
  const modules = useCatalogue((s) => s.modules)

  /* CTRL K PUTS THE CURSOR IN THE FIELD, and that is all it does
     today. The palette the sweep found behind this shortcut everywhere
     is the finder, and the finder is not built; a shortcut that opened
     a half-built palette would be the pretending this screen exists to
     avoid. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return
      event.preventDefault()
      field.current?.focus()
    }
    globalThis.addEventListener('keydown', onKey)
    return () => globalThis.removeEventListener('keydown', onKey)
  }, [])

  /* THE INDEX IS BUILT ONCE, AND ONLY IF SOMEBODY ASKS. It folds every
     label on the sheet, which is work nobody should pay for on a paint
     they may never search from. */
  const index = useMemo(
    () =>
      asking
        ? buildSearchIndex(tables as Record<string, EntityDef>, rows as Record<string, RowData[]>, {
            modules,
          })
        : null,
    [asking, tables, rows, modules],
  )
  const found = index ? search(index, query) : null

  return (
    <section className="home-col home-desk" aria-label="The desk">
      <p className="home-eyebrow">The desk</p>
      <h1 className="home-greet">{greetingFor(hour ?? new Date().getHours(), who)}</h1>
      {open ? (
        <p className="home-line">
          <b>The Master Price File is open.</b> {held.baseRows.toLocaleString('en-AU')} rows are the
          things {business ?? 'this business'} sells; the other{' '}
          {held.joinRows.toLocaleString('en-AU')} are the joins that record what fits what.
        </p>
      ) : (
        <p className="home-line">
          <b>No price file is open.</b> Nothing below is counted, because there is nothing here to
          count.
        </p>
      )}

      {/* THE ONE ACT, AND IT KEEPS ITS COLOUR. The picker does not exist
          yet, so the control refuses with its reason beneath it — and it
          is still the warm rectangle the board spends once, two steps
          down the amber ramp (src/ui/button.css). The arrow is the
          board's own and is the screen's child, because a primitive
          draws no ornament of its own. */}
      <div className="home-acts">
        <Button intent="act" refusedBecause={NO_PICKER}>
          New quote
          <span className="home-act-arrow" aria-hidden="true">
            &rarr;
          </span>
        </Button>
      </div>

      <div className="home-search">
        <label className="home-search-label" htmlFor="home-search-field">
          Search the file — every register, every row, by name
        </label>
        <div className="home-search-row">
          <Input
            id="home-search-field"
            ref={field}
            type="search"
            value={query}
            onValueChange={setQuery}
            aria-describedby="home-search-said"
            placeholder={
              open ? `Search ${held.rows.toLocaleString('en-AU')} rows` : 'Nothing to search yet'
            }
          />
          <Kbd>Mod K</Kbd>
        </div>
        {/* THE ONE FIGURE ON THIS SCREEN THAT CHANGES IN FRONT OF THE
            READER, and so the one place the Figure primitive belongs: it
            moves digit by digit as the query narrows, and holds still
            under reduced motion. See the note above `Sells` for why the
            file's own counts are not drawn through it. */}
        <p className="home-search-said" id="home-search-said">
          {!open ? (
            'There is nothing to search until a price file is read in.'
          ) : found ? (
            found.rowTotal > 0 ? (
              <>
                <Figure value={found.rowTotal} /> rows carry that word. Opening one is the
                finder&rsquo;s job, and that screen is not built yet.
              </>
            ) : (
              'Nothing on the sheet is called that.'
            )
          ) : (
            'Ctrl K puts the cursor here. It counts what the file carries; opening a result is the finder, which is not built yet.'
          )}
        </p>
      </div>

      {who === null && (
        <p className="home-footnote">
          No one has typed a name at this desk yet, so the greeting has none.
        </p>
      )}
    </section>
  )
}

/* ---------------------------------------------------------- */
/* What they sell                                              */
/* ---------------------------------------------------------- */

/**
 * WHY THE SIX COUNTS ARE NOT DRAWN THROUGH `Figure`, said here because a
 * screen made of counts that does not use the count primitive owes the
 * reason rather than a silence.
 *
 * `Figure` is NumberFlow, and NumberFlow's whole job is to move a figure
 * digit by digit WHEN IT CHANGES. Nothing on this screen changes in
 * front of the reader except the search count, which is drawn through it
 * above. The other six — 810, 241, 444, 1,866, 3,587, 64 — plus the
 * draft count and the two row totals are the file's own, counted the
 * instant the sheet landed and then still. Put through NumberFlow they
 * would spin up from zero on arrival, which is the same lie
 * `PriceFigure` exists to refuse: a figure that animates reads as a
 * figure still being decided, and these were decided by the price file.
 *
 * There is a second, smaller reason and it is worth writing down. The
 * component draws its digits into an open shadow root and exposes the
 * element as `role="img"` with the value as its label, so a count of
 * rows is announced as a picture. That is right for a figure a person
 * watches move and wrong for the six a dealer reads across a desk.
 */
function Sells({
  business,
  held,
  open,
}: {
  business: string | null
  held: Holdings
  open: boolean
}) {
  return (
    <section className="home-col home-sells" aria-label="What this business sells">
      <p className="home-eyebrow">What {business ?? 'this business'} sells</p>
      {open ? (
        <>
          <div className="home-kinds">
            {held.kinds.map((kind) => (
              <div className="home-kind" key={kind.kind}>
                <span className="home-fig">{kind.rows.toLocaleString('en-AU')}</span>
                <span className="home-kind-label">{kind.label}</span>
              </div>
            ))}
          </div>
          <p className="home-joins">
            <b>
              {held.baseTables.toLocaleString('en-AU')} registers hold those{' '}
              {held.baseRows.toLocaleString('en-AU')} rows
            </b>
            , and {held.joins.toLocaleString('en-AU')} fitment joins carry the other{' '}
            {held.joinRows.toLocaleString('en-AU')} — which motor, which trailer and which part goes
            on which hull.
          </p>
          {/* THE FIGURE THE FILE DOES NOT CARRY, said out loud where
              somebody might otherwise read one of the six above as it. */}
          <p className="home-joins">A row is a line of the price file, not a boat on the floor.</p>
        </>
      ) : (
        <p className="home-line">
          Nothing is counted here until a price file is read in. An empty sheet is the true state,
          not a broken one.
        </p>
      )}
    </section>
  )
}

/* ---------------------------------------------------------- */
/* The makers, on paper                                        */
/* ---------------------------------------------------------- */

/**
 * THE SHELF IS PAPER because most of the held marks are drawn in dark
 * ink — a maker publishes the ink it publishes — and a dark wordmark on
 * a navy ground is a smudge rather than a mark. Every cell keeps its
 * place whether or not a mark exists: `markFor` answers with the mark
 * or with the reason there is none, and the reason is printed under
 * the shelf rather than left as a hole in the row.
 */
function Makers({ held, open }: { held: Holdings; open: boolean }) {
  const facts = markLedgerFacts()
  const shelf = held.boats.map((register) => ({
    register,
    choice: markFor(register.name, 'paper'),
  }))
  const boatRows = held.boats.reduce((n, r) => n + r.rows, 0)
  const refused = shelf.flatMap(({ choice }) => (choice.drawn ? [] : [choice.because]))

  return (
    <section className="home-col home-makers" aria-label="The boat makers">
      <p className="home-eyebrow home-eyebrow-paper">
        The boat makers
        {open
          ? ` — ${held.boats.length.toLocaleString('en-AU')} registers, ${boatRows.toLocaleString('en-AU')} rows`
          : ''}
      </p>
      {open ? (
        <>
          <ul className="home-shelf">
            {shelf.map(({ register, choice }) => (
              <li className="home-maker" key={register.id}>
                <span className="home-maker-mark">
                  {choice.drawn ? (
                    <img
                      className="home-maker-img"
                      src={choice.mark.src}
                      alt=""
                      width={choice.mark.width}
                      height={choice.mark.height}
                    />
                  ) : (
                    <span className="home-maker-typed">{register.name}</span>
                  )}
                </span>
                {/* A CELL NAMES ITS MAKER EXACTLY ONCE. Where a mark
                    is drawn the name sits under it, because two of the
                    held marks are a script and a device with a very
                    small word inside, and a mark that cannot be read at
                    20px is a picture rather than a label. Where none is
                    drawn the name IS the mark, at the size the marks
                    are, and this line says so — the reason itself is
                    under the shelf. */}
                <span className="home-maker-name">
                  {choice.drawn ? register.name : 'No mark held'}
                </span>
                <span className="home-maker-count">
                  {register.rows.toLocaleString('en-AU')} rows
                </span>
              </li>
            ))}
          </ul>
          <p className="home-credit">
            <b>
              {facts.checked.toLocaleString('en-AU')} makers checked,{' '}
              {facts.held.toLocaleString('en-AU')} held, {facts.files.toLocaleString('en-AU')} files
            </b>{' '}
            — each with its address, its licence note and its sha256.
            {refused.length > 0 ? ` ${refused.join(' ')}` : ''}
          </p>
        </>
      ) : (
        <p className="home-credit">
          No register is open, so no maker is named here. The marks are held either way:{' '}
          {facts.held.toLocaleString('en-AU')} of {facts.checked.toLocaleString('en-AU')} makers
          checked.
        </p>
      )}
    </section>
  )
}

/* ---------------------------------------------------------- */
/* The drafts, drawn empty                                     */
/* ---------------------------------------------------------- */

/**
 * NO DRAFT EXISTS, and this is what that looks like. The card a draft
 * will land in is drawn with every region named and nothing in it —
 * the board's own answer to the split record card — so the emptiness
 * is a statement rather than a blank. Nothing here is a dimmed
 * control: the diagram is out of the reading order entirely, and the
 * one sentence above it is the whole truth about this computer.
 */
function Drafts({
  quotes,
  read,
  problem,
}: {
  quotes: readonly { state: string }[]
  read: boolean
  problem: string | null
}) {
  const drafts = quotes.filter((q) => q.state === 'draft').length

  return (
    <section className="home-col home-drafts" aria-label="Open drafts">
      <div className="home-drafts-top">
        <p className="home-eyebrow">Open drafts</p>
        <span className="home-fig" data-testid="draft-count">
          {read ? drafts.toLocaleString('en-AU') : '—'}
        </span>
      </div>
      <div className="home-hair" />
      {problem ? (
        <p className="home-drafts-said" role="alert">
          The quotes in this browser could not be read. {problem}
        </p>
      ) : read ? (
        <p className="home-drafts-said">
          {drafts === 0
            ? 'Nothing is open. No customer, no quote and no draft exists in this browser yet.'
            : `${drafts.toLocaleString('en-AU')} drafts are open, and the register that lists them is not built yet.`}
        </p>
      ) : (
        <p className="home-drafts-said">Reading what this browser has kept…</p>
      )}

      <p className="home-cap">
        When one does, it lands in this card — drawn empty, every region named
      </p>
      <div className="home-card" aria-hidden="true">
        <div className="home-card-row">
          <div className="home-well home-well-pic">The boat&rsquo;s own photograph</div>
          <div className="home-thumbs">
            <div className="home-well">Motor</div>
            <div className="home-well">Trailer</div>
            <div className="home-well">Fit</div>
          </div>
          <div className="home-facts">
            <div className="home-fact">Who it is for</div>
            <div className="home-fact">What is on it</div>
            <div className="home-fact">Total at the cash rung</div>
            <div className="home-fact">Last touched</div>
          </div>
        </div>
        <div className="home-strip">Where the act that opens it will sit</div>
      </div>
      <p className="home-kept">
        Work is kept in this browser until the file is exported, and a card is written from frozen
        lines — never from a live price read.
      </p>
    </section>
  )
}
