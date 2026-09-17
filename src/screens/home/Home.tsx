import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { preload } from 'react-dom'
import { MIN_QUERY, buildSearchIndex, normalizeQuery, search } from '@/domain/catalogue/search'
import type { EntityDef, QuoteDef, RowData } from '@/domain/model'
import type { RegisterStateId } from '@/domain/quote/register'
import { useCatalogue, useQuotes, useSession } from '@/app/useStores'
import { Button, Figure, Input, Kbd, PriceFigure, Tile } from '@/ui'
import { deskOf, type FiledCard } from './filed'
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

   ─────────────────────────────────────────────────────────────
   AND WHAT IS TRUE OF IT NOW, 2026-09-18. Every one of the three
   refusals above has been retired the way the picker's own was — by
   having built the screen it was waiting on. The independent critique
   is what dated them: "a dealer who lands on Home cannot start a
   quote, cannot reach the register, and cannot reach the drafts the
   same screen is counting."

     · NEW QUOTE ACTS. It opens the picker, live at `/quote/new`, in
       the LIVE amber the board spends once rather than the quiet step
       under it that a refused act wears.
     · EACH PLATE IS A DOOR into the register of the maker it shows,
       opened at that register in the picker — the board's own "named
       door into that boat's register".
     · A FILED DOCUMENT IS DRAWN AS A CARD, and the card opens it: a
       draft where it is written, an issued quote as the paper the
       customer was given. The empty card is still what an empty desk
       draws, because that is still the true state of a browser nobody
       has quoted from.

   WHAT A BOARD CAN STILL DO THAT THIS SCREEN WILL NOT: draw a
   photograph for every boat. A card's picture is drawn only where the
   ledger holds that exact model, and nothing stands in for one it
   does not.

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
  /**
   * THE FOUR WAYS OUT OF THIS SCREEN, handed in rather than reached
   * for, so Home can be rendered and pressed in a component test with
   * no router — the same rule every other screen in this app keeps.
   * Absent, each control says what it could not do instead of doing
   * nothing quietly, which is the fault the critique of 2026-09-17
   * found on the one act this screen had.
   */
  /** the picker, at `/quote/new`, where a quote is started */
  newQuote?: () => void
  /** the quotes register, at `/quotes` */
  openQuotes?: () => void
  /** one filed document: a draft opens where it is written and an
   *  issued one opens as the paper the customer was given, which is
   *  why the state travels with the id */
  openQuote?: (id: string, state: RegisterStateId) => void
  /** the picker, opened at one boat register, by that register's id */
  openBoatRegister?: (tableId: string) => void
  /** the clock, injected so a test can say which instant it is asking
   *  about: a card prints how long ago it was last touched */
  now?: () => Date
}

export function Home({
  business = null,
  from = null,
  ms = null,
  unkept = null,
  problem = null,
  hour,
  openTheFile,
  newQuote,
  openQuotes,
  openQuote,
  openBoatRegister,
  now,
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

      <Fold tables={tables} rows={rows} open={open} openBoatRegister={openBoatRegister} />

      <div className="home-sheet">
        <Desk business={named} held={held} open={open} who={who} hour={hour} newQuote={newQuote} />
        <Sells business={named} held={held} open={open} />
        <Makers held={held} open={open} />
        <Drafts
          quotes={quotes}
          read={quotesRead}
          problem={quotesProblem}
          now={now}
          openQuotes={openQuotes}
          openQuote={openQuote}
        />
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

/** And the plate on a filed card, which is `--spacing(28)` at every
 *  width (`home.css`, `.home-quote-pic`) — a fixed measure, so the
 *  hint is that measure and not a percentage of a window. It is the
 *  one length in this file that has to stay in step with the
 *  stylesheet by hand, because `sizes` cannot read a custom property;
 *  measured at all six ruler widths, the browser takes the narrowest
 *  copy the ledger holds for it. */
const CARD_FRAME = '112px'

/** `srcset` for a held picture: every copy the ledger records, each with
 *  its own pixel width, so the browser fetches the one it will draw. */
const srcSetOf = (picture: HeldPicture): string =>
  picture.widths.map((copy) => `${copy.src} ${copy.width}w`).join(', ')

function Fold({
  tables,
  rows,
  open,
  openBoatRegister,
}: {
  tables: Readonly<Record<string, EntityDef>>
  rows: Readonly<Record<string, RowData[]>>
  open: boolean
  openBoatRegister?: (tableId: string) => void
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
          openBoatRegister={openBoatRegister}
          wide
        />
        <Frame
          picture={right}
          tables={tables}
          rows={rows}
          open={open}
          sizes={NARROW_FRAME}
          onDrawn={measured}
          openBoatRegister={openBoatRegister}
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
        {/* THE CLAUSE THAT USED TO END THIS LINE WAS A LIE, and it was
            measured as one on 2026-09-17: "NEITHER PLATE OPENS YET: A
            REGISTER HAS NO SCREEN UNTIL THE PICKER IS BUILT" was
            printed under two plates whose registers both had a screen.
            It is not replaced with a sentence saying they do open —
            each plate now carries its own door, which says that where
            a person can press it. This line is what it always should
            have been: the provenance of two photographs, measured. */}
        {pictures.length > 0 && open && allMeasured
          ? enlarged.length === 0
            ? ' · neither drawn past its own size'
            : ` · ${enlarged.map((p) => p.subject).join(' and ')} is drawn past its own size`
          : ''}
        {/* THE LINE ENDS IN A FULL STOP, which it did only by accident
            before: the clause that has been deleted supplied one. A
            caption that ends on a digit runs into the next element's
            first word in `textContent`, and the case that walks this
            screen for a figure the file does not carry then reads
            "1,694The" as an invented 1. */}
        .
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
  openBoatRegister,
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
  /** the way into the register this plate names */
  openBoatRegister?: (tableId: string) => void
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
              {ofThisModel.toLocaleString('en-AU')} of them {ofThisModel === 1 ? 'is' : 'are'} this
              model.
            </p>
            {/* THE PLATE IS THE DOOR THE BOARD DREW. Its own words:
                "a named door into that boat's register" — which had
                nowhere to go while the picker was unbuilt and now
                opens the picker AT this register, so the press lands
                on the 588 rows the line above just counted. The
                register's own name is the label, because a door says
                where it goes; the arrow is the screen's child, as on
                the act, since a primitive draws no ornament. */}
            {openBoatRegister ? (
              <span className="home-plate-act">
                <Button
                  intent="veiled"
                  size="sm"
                  onClick={() => {
                    openBoatRegister(picture.table)
                  }}
                >
                  Open {register.name}
                  <span className="home-plate-arrow" aria-hidden="true">
                    &rarr;
                  </span>
                </Button>
              </span>
            ) : null}
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

/**
 * Said at the act, because that is where the press happens.
 *
 * IT IS NOT ABOUT AN UNBUILT SCREEN ANY MORE. The sentence this
 * constant replaces — "The picker is not built yet, so there is
 * nowhere for this to go" — outlived the picker by a day and was the
 * blocker the critique opened with: the only control on Home was dead
 * and its reason was a lie. The picker is at `/quote/new`. What is
 * left is the one case where this screen genuinely has nowhere to
 * send anybody: a render that was handed no way there, which is a
 * component test and never a browser.
 */
export const NO_WAY_TO_THE_PICKER =
  'This screen was handed no way to the picker, so nothing was opened. The picker is at /quote/new.'

function Desk({
  business,
  held,
  open,
  who,
  hour,
  newQuote,
}: {
  business: string | null
  held: Holdings
  open: boolean
  who: string | null
  hour?: number
  newQuote?: () => void
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

      {/* THE ONE ACT, AND IT ACTS. It opens the picker, and with the
          picker built it is the LIVE amber — `--color-act` itself,
          8.21:1 under its ink — rather than the quiet step two down
          the ramp that src/ui/button.css draws a refused act in. That
          step was written for exactly this control on exactly this
          screen, and the day the picker existed was the day it was
          meant to stop being the one a dealer sees.

          The arrow is the board's own and is the screen's child,
          because a primitive draws no ornament of its own. */}
      <div className="home-acts">
        <Button
          intent="act"
          onClick={newQuote}
          refusedBecause={newQuote ? undefined : NO_WAY_TO_THE_PICKER}
        >
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
                {/* ONE ROW IS NOT "1 ROWS". The count moves in front of
                    the reader, so the verb has to move with it — the
                    plural bug the critique found here and in the
                    drafts card below. */}
                <Figure value={found.rowTotal} />{' '}
                {found.rowTotal === 1 ? 'row carries' : 'rows carry'} that word. Opening one is the
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
/* The drafts: the card, empty or filled                       */
/* ---------------------------------------------------------- */

/** Said on the card, where the press happens. A browser never sees
 *  it: it is the render a component test makes with no router. */
export const NO_WAY_TO_A_FILED_QUOTE =
  'This screen was handed no way to open a filed quote, so nothing was opened. Every one of them is in the register at /quotes.'

/**
 * WHAT IS FILED IN THIS BROWSER, and one press to each of it.
 *
 * THE EMPTY CARD IS STILL THE BOARD'S OWN ANSWER and it is still what
 * an untouched desk draws: every region named, nothing in it, out of
 * the reading order entirely, with one sentence above it that is the
 * whole truth about this computer. What changed on 2026-09-18 is what
 * happens when the true state stops being empty. The first cut kept
 * drawing the diagram over a real draft and printed, under it, "1
 * drafts are open, and the register that lists them is not built yet"
 * — a plural bug over a false sentence over a promise ("when one does,
 * it lands in this card") that had already come true. The card lands
 * the document now, and the document opens: a draft where it is
 * written, an issued quote as the paper the customer was given.
 *
 * NOT ONE FIGURE OR WORD HERE IS THIS SCREEN'S. `./filed.ts` reads
 * them off `domain/quote/register` — the same module the register
 * screen reads — so the two can never disagree about how many drafts
 * are open, and the sentence an empty band says is the domain's own.
 */
function Drafts({
  quotes,
  read,
  problem,
  now,
  openQuotes,
  openQuote,
}: {
  quotes: readonly QuoteDef[]
  read: boolean
  problem: string | null
  now?: () => Date
  openQuotes?: () => void
  openQuote?: (id: string, state: RegisterStateId) => void
}) {
  /* THE CLOCK IS READ ONCE PER READING and never inside the card, so
     the two lines of one card cannot be stamped a minute apart. */
  const desk = useMemo(() => deskOf(quotes, (now ? now() : new Date()).getTime()), [quotes, now])

  return (
    <section className="home-col home-drafts" aria-label="Open drafts">
      <div className="home-drafts-top">
        <p className="home-eyebrow">Open drafts</p>
        <span className="home-fig" data-testid="draft-count">
          {read ? desk.drafts.toLocaleString('en-AU') : '—'}
        </span>
      </div>
      <div className="home-hair" />
      {problem ? (
        <p className="home-drafts-said" role="alert">
          The quotes in this browser could not be read. {problem}
        </p>
      ) : read ? (
        <p className="home-drafts-said">
          {desk.held === 0
            ? 'Nothing is open. No customer, no quote and no draft exists in this browser yet.'
            : desk.drafts === 0
              ? /* the register's own sentence for an empty draft band */
                desk.nothingOpen
              : `${desk.drafts.toLocaleString('en-AU')} ${desk.drafts === 1 ? 'draft is' : 'drafts are'} open.`}
          {/* AND THE CENSUS, ONLY WHERE IT SAYS SOMETHING THE SENTENCE
              DOES NOT. A desk with one draft and nothing else would
              otherwise read "1 draft is open. 1 quote is filed in this
              browser — 1 draft", which is one fact said three times.
              Each band is named in the register's own word. */}
          {desk.held > desk.drafts
            ? ` ${desk.held.toLocaleString('en-AU')} filed in all — ${desk.bands
                .map((band) => `${band.held.toLocaleString('en-AU')} ${band.word.toLowerCase()}`)
                .join(' · ')}.`
            : ''}
        </p>
      ) : (
        <p className="home-drafts-said">Reading what this browser has kept…</p>
      )}

      {desk.newest ? (
        <Filed card={desk.newest} openQuote={openQuote} />
      ) : (
        <>
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
        </>
      )}

      {/* THE WAY TO EVERY OTHER ONE. Home counts the drafts and the
          register lists them; before this the count was a dead end.
          It is offered whether or not anything is filed, because an
          empty register is a screen that says so in three honest
          zeros — and it is simply absent, never a dead control, where
          nothing handed this screen a way there. */}
      {openQuotes ? (
        <div className="home-drafts-act">
          <Button intent="veiled" onClick={openQuotes}>
            All quotes
            <span className="home-act-arrow" aria-hidden="true">
              &rarr;
            </span>
          </Button>
        </div>
      ) : null}

      <p className="home-kept">
        Work is kept in this browser until the file is exported, and a card is written from frozen
        lines — never from a live price read.
      </p>
    </section>
  )
}

/**
 * ONE FILED DOCUMENT, AS A CARD YOU PRESS.
 *
 * It is a `Tile` and not a `Button`: a tile is this app's pressable
 * SURFACE, drawn for a dark room, and a button is a label on one line.
 * The tile was a toggle until today — it wrote `aria-pressed` whether
 * or not anything could be pressed into a state — and it was extended
 * rather than worked around, so a card that OPENS something is a plain
 * button to a screen reader and a card that CHOOSES something still
 * says which one is chosen (`src/ui/Tile.tsx`).
 *
 * EVERY WORD ON IT WAS FROZEN WHEN THE QUOTE WAS WRITTEN. The boat,
 * the name, the figure and the rung come off the document through
 * `./filed.ts`, never off the price file — which is why this card is
 * drawn, correctly, on a desk whose sheet has never been opened.
 */
function Filed({
  card,
  openQuote,
}: {
  card: FiledCard
  openQuote?: (id: string, state: RegisterStateId) => void
}) {
  return (
    <div className="home-card">
      <Tile
        tone="room"
        onSelect={() => {
          openQuote?.(card.id, card.state)
        }}
        refusedBecause={openQuote ? undefined : NO_WAY_TO_A_FILED_QUOTE}
      >
        <span className="home-quote">
          {/* THE EMPTY CARD'S OWN COMPOSITION, FILLED: the boat's
                photograph on the left, what the document says on the
                right, the figure and the age along the foot. The shape
                does not change when there is no photograph to draw —
                the well keeps its place and says what is missing, which
                is the rule the fold's two frames already keep. */}
          <span className="home-quote-row">
            {card.picture ? (
              <img
                className="home-quote-pic"
                src={card.picture.src}
                srcSet={srcSetOf(card.picture)}
                sizes={CARD_FRAME}
                /* `alt=""` because the boat is named in full beside
                     it, inside the same control: a reader who cannot
                     see the picture is told the model, not told twice */
                alt=""
                width={card.picture.width}
                height={card.picture.height}
                decoding="async"
                style={{ maxWidth: card.picture.width }}
              />
            ) : (
              <span className="home-quote-nopic">No photograph held for this model</span>
            )}
            <span className="home-quote-facts">
              <span className="home-quote-head">
                <span className="home-quote-band">{card.word}</span>
                <span className="home-quote-ref">{card.reference}</span>
              </span>
              <span className="home-quote-boat">{card.boat}</span>
              <span className="home-quote-who">{card.customer ?? 'Nobody is named on it yet'}</span>
            </span>
          </span>
          <span className="home-quote-foot">
            <span className="home-quote-money">
              {card.total === null ? (
                <span className="home-quote-nofigure">{card.insteadOfTotal}</span>
              ) : (
                <PriceFigure amount={card.total} />
              )}
              <span className="home-quote-rung">
                {card.rung === null ? 'Total' : `Total at ${card.rung}`}
              </span>
            </span>
            <span className="home-quote-age">
              {card.lines.toLocaleString('en-AU')} {card.lines === 1 ? 'line' : 'lines'} ·{' '}
              {card.age}
            </span>
          </span>
        </span>
      </Tile>
    </div>
  )
}
