import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { preload } from 'react-dom'
import { priceFileOf } from '@/domain/catalogue/priceFile'
import { MIN_QUERY, buildSearchIndex, normalizeQuery, search } from '@/domain/catalogue/search'
import type { EntityDef, QuoteDef, RowData } from '@/domain/model'
import { spokenModel } from '@/domain/quote/spoken'
import { readRegister, type RegisterStateId } from '@/domain/quote/register'
import { useCatalogue, useQuotes, useSession } from '@/app/useStores'
import { Button, Figure, Input, Kbd, PriceFigure, Tile, isField } from '@/ui'
import { useFinder, useSetScope } from '@/screens/shell/scope'
import { deskOf, type FiledCard } from './filed'
import { holdingsOf, modelRowsOf, type Holdings } from './holdings'
import { markFor, markLedgerFacts, pictureById, rowPictured, type HeldPicture } from './ledgers'
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

   ─────────────────────────────────────────────────────────────
   AND WHAT IS TRUE OF IT NOW, 2026-09-23, against the critique of
   Milestone 2 (`docs/directions/built-critique-m2.md`):

     · #23 THE EMPTY CARD IS NOT A WIREFRAME ANY MORE. It was a diagram
       of labelled empty boxes — "THE BOAT'S OWN PHOTOGRAPH", "MOTOR",
       "WHERE THE ACT THAT OPENS IT WILL SIT" — "the weakest object on
       the best screen", where every other empty state in the app is a
       sentence. An empty desk now says the true state in one sentence
       and teaches the sale in three steps, in the words the screens
       that follow actually use, and says where the quote will wait.
       Nothing is drawn that a document has not filled.
     · #10 IT FITS THE WINDOW IT IS DRAWN AT, and a flow test holds it
       there (`e2e/flows/home.spec.ts`, scrollHeight against
       innerHeight at 1280×800, 1440×900 and 1920×1080). What paid for
       it: the caption under the photographs is one line of what they
       show rather than two of pixel arithmetic, the file's split is
       said once (in "What it sells") rather than three times, and the
       columns at 1280 were rebalanced so no eyebrow wraps.
     · #18 NO KEY IS NAMED TO A FINGER. The sentence under the search
       field has a keyboard twin and a touch twin, and a coarse pointer
       draws only the second — rule (b).
     · RULE (c): no address is printed as text. The two sentences a
       render with no router says name the screen, not its path.

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
   *  Null is honest: until the file is in this browser nothing has
   *  said the name, and the screen says none rather than typing one. */
  business?: string | null
  /** where the sheet came from on this open, for the stamp under the
   *  business's name — the store's `from`, handed down the same way.
   *  Absent until the open has finished. */
  from?: 'pack' | 'repository' | null
  /** the sentence when the file was read but could not be kept here */
  unkept?: string | null
  /** the sentence when the sheet could not be opened at all, which the
   *  store never sees because nothing ever reached it */
  problem?: string | null
  /** the hour of the day the greeting reads, injected so a test can
   *  say which one it is asking about */
  hour?: number
  /**
   * THE WAY BACK TO THE DOOR, for a browser that holds no copy of the
   * price file — read once and not kept, or let go by the browser.
   * Home reads this browser and never the file — Entry's door is the
   * one place the file is read (`src/routes/index.tsx`) — so the only
   * honest thing this desk can offer is the door, and this is how the
   * route hands it over. Absent, the desk says what is missing and
   * offers nothing, which is what a render with no router can
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
  /** THE PICKER, OPENED AT ONE BOAT: the register and a row of the model
   *  a photograph on this screen depicts, so pressing the photograph's
   *  act lands on that boat's own plate rather than on its maker's list
   *  (the M2-close critique, finding 18) */
  openBoat?: (tableId: string, rowId: string) => void
  /** the clock, injected so a test can say which instant it is asking
   *  about: a card prints how long ago it was last touched */
  now?: () => Date
}

export function Home({
  business = null,
  from = null,
  unkept = null,
  problem = null,
  hour,
  openTheFile,
  newQuote,
  openQuotes,
  openQuote,
  openBoatRegister,
  openBoat,
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
     worse than one that prints no name at all. */
  const named = business !== null && business.trim() !== '' ? business.trim() : null

  /* ── WHAT THE FINDER IS SCOPED TO WHILE IT IS OPEN ON THIS SCREEN ──
     Ctrl K belonged to the field below until 2026-09-23; the shell
     takes the key everywhere and resolves the collision with the scope
     chip (`src/screens/shell/scope.tsx`), so this screen publishes its
     own rows and the field keeps `/` as its way in.

     THE DESK'S OWN ROWS ARE THE DRAFTS, not the file. The field below
     searches the price file, and the finder already answers the file
     globally under Boats and Tables — publishing that again would be
     the same rows twice in one list. What this desk has that the
     finder does not put first is the WORK STANDING ON IT, which is the
     card in the fourth column, and these are the same documents under
     the same references. The ids are the finder's own, so a draft that
     appears here is drawn once and not again under Quotes. */
  const scope = useMemo(
    () => ({
      word: 'The desk',
      title: 'Open on this desk',
      say: 'The drafts standing here, newest first.',
      rows: (query: string) =>
        (readRegister(quotes, query).bands.find((band) => band.spec.id === 'draft')?.rows ?? [])
          .slice(0, 6)
          .map((row) => ({
            id: `quote:${row.id}`,
            name: row.reference,
            fact: [row.boat, row.customer].filter((part) => part && part.trim() !== '').join(' · '),
            verb: 'Open the build',
            target: { at: 'quote' as const, id: row.id, issued: false },
          })),
    }),
    [quotes],
  )
  useSetScope(scope)

  return (
    <main className="home" data-testid="home">
      <Masthead
        business={named}
        held={held}
        open={open}
        status={status}
        problem={problem ?? refused}
        from={from}
        unkept={unkept}
        openTheFile={openTheFile}
      />

      <Fold
        tables={tables}
        rows={rows}
        open={open}
        openBoatRegister={openBoatRegister}
        openBoat={openBoat}
      />

      <div className="home-sheet">
        <Desk held={held} open={open} who={who} hour={hour} newQuote={newQuote} />
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
  unkept,
  openTheFile,
}: {
  business: string | null
  held: Holdings
  open: boolean
  status: string
  problem: string | null
  from: 'pack' | 'repository' | null
  unkept: string | null
  openTheFile?: () => void
}) {
  return (
    <header className="home-masthead">
      {/* NO NAME IS PRINTED UNTIL THE FILE HAS SAID IT, and none is said to be
          missing either. "This business has not been named yet" stood here
          until 2026-09-25: a sentence for a business nobody had named, which
          is not Northside — Northside is named by its own file, and a browser
          without the file simply has not read it yet. The line keeps its
          height so the masthead is one shape in every state. */}
      {business ? (
        <p className="home-name">{business}</p>
      ) : (
        <p className="home-name home-name-none" aria-hidden="true">
          {'\u00a0'}
        </p>
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
          <div className="home-stamp-door">
            {/* A BROWSER THAT HOLDS NO COPY OF THE FILE, said as that. It read
                "A blank sheet. No price file has been read into it yet." until
                2026-09-25, the state a person chose at a second door on Entry;
                that door is gone, and what is left is Northside's own file not
                being in this browser — read once and not kept, or let go. */}
            <p className="home-stamp-line">The Master Price File is not in this browser yet.</p>
            {/* THE DOOR, WHERE THE ABSENCE IS SAID. It is drawn veiled
                because the masthead is the dark room, and it is simply
                absent — not a dead control — where nothing handed this
                screen a way there. */}
            {openTheFile ? (
              <Button intent="veiled" onClick={openTheFile}>
                Load the Master Price File
              </Button>
            ) : null}
          </div>
        )}
        {open && (
          <div data-testid="pack-counts">
            {/* NO STOPWATCH ON THE SHOWROOM. The stamp ended "· in 438 ms",
                how long this browser took to read its own copy: a
                developer's figure, and the critique of Milestone 2's close
                quoted it among the engine's words reaching a dealer (#4).
                What the stamp owes a dealer is WHICH file, and how big it
                is — the file's own, never the sheet's (blocker 2). */}
            {/* WHERE THIS COPY CAME FROM rides on the line as data, not as
                words. "Read from this browser" was the half of the stamp
                the critique of the M2 close quoted beside the stopwatch
                (#4): how the app found its copy is the app's business. The
                claim is still checked — `pack-loads.spec.ts` reads
                `data-from` on the first visit and on the second. */}
            <p className="home-stamp-line" data-from={from ?? undefined}>
              Master Price File
            </p>
            {/* THE SAME THREE FIGURES DATA'S HEAD PRINTS, in the showroom's
                nouns. Data is the back office and says "tables" and "rows",
                which is what it shows; this is the first line a salesperson
                reads, and the M2-close critique put "tables · rows" among
                the engine's words on the sale screens (#4). A list and a
                line are what a dealer calls the same two things, and the
                "lines" here are the lines the panel below and the search
                field count. The figures are unchanged and still Data's. */}
            <p className="home-stamp-line">
              <b>{held.tables.toLocaleString('en-AU')}</b> lists ·{' '}
              <b>{held.rows.toLocaleString('en-AU')}</b> lines ·{' '}
              <b>{held.joins.toLocaleString('en-AU')}</b> of the lists say what fits what
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
  openBoat,
}: {
  tables: Readonly<Record<string, EntityDef>>
  rows: Readonly<Record<string, RowData[]>>
  open: boolean
  openBoatRegister?: (tableId: string) => void
  openBoat?: (tableId: string, rowId: string) => void
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
          openBoatRegister={openBoatRegister}
          openBoat={openBoat}
          wide
        />
        <Frame
          picture={right}
          tables={tables}
          rows={rows}
          open={open}
          sizes={NARROW_FRAME}
          openBoatRegister={openBoatRegister}
          openBoat={openBoat}
        />
      </section>
      {/* THE CAPTION IS WHAT THE PHOTOGRAPHS SHOW, ONE LINE, AND NOTHING
          ELSE. Until 2026-09-23 it was two lines of arithmetic — "held
          2,560 × 1,706, drawn 770 × 513 · … · neither drawn past its own
          size" — which was honest and was also the most database-looking
          sentence on the showroom, and its second line was fifteen of the
          fifteen pixels this screen ran over 900 by. The promise it
          printed is kept where a promise can be checked: each photograph
          carries its held width as its own `max-width`, and
          `e2e/flows/home.spec.ts` measures every one at six sizes against
          the pixels it arrived with. The ledger still holds each picture's
          address, licence note and sha256; the screen names the boat. */}
      <p className="home-filmline">
        {pictures.length > 0 && open
          ? `${pictures.map((p) => p.subject).join(' · ')}.`
          : 'No photograph is drawn above, and none is stood in for.'}
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
  openBoatRegister,
  openBoat,
  wide = false,
}: {
  picture: HeldPicture | undefined
  tables: Readonly<Record<string, EntityDef>>
  rows: Readonly<Record<string, RowData[]>>
  open: boolean
  /** what the browser should assume this frame's width is */
  sizes: string
  /** the way into the register this plate names */
  openBoatRegister?: (tableId: string) => void
  /** the way into the boat this photograph depicts */
  openBoat?: (tableId: string, rowId: string) => void
  wide?: boolean
}) {
  const register = picture ? tables[picture.table] : undefined
  const list = picture ? (rows[picture.table] ?? []) : []
  const showing = picture !== undefined && open && register !== undefined
  const ofThisModel = showing && picture ? modelRowsOf(register, list, picture.model) : 0
  /* THE VERSION THE PHOTOGRAPH OPENS ON: the first the file still sells,
     by the rule the build draws it by. None — every version marked no
     longer sold — and the plate opens the maker instead, and says so by
     naming the maker on the act. */
  const opens = showing && picture ? rowPictured(picture, register, list) : undefined

  /* THE LIGHTS COME UP ON A PHOTOGRAPH ONCE IT HAS ARRIVED, rather than
     a dark rectangle turning into a picture in one frame. `data-arrived`
     is set by the picture's own `load` — or at once, where the bytes were
     already in the cache before React could listen — and home.css fades
     it in over `--duration-reveal`, and cuts it in under reduced motion.
     It is opacity and nothing else: a scale would draw the picture past
     the size it was fetched at, which is the one thing this fold never
     does. */
  const [arrived, setArrived] = useState(false)
  const photograph = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) setArrived(true)
  }, [])

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
          data-arrived={arrived ? '' : undefined}
          onLoad={() => {
            setArrived(true)
          }}
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
            {/* the model as a person says it: the maker's own words for a
                Highfield code, the file's for every other maker */}
            <p className="home-plate-what">{spokenModel(picture.table, picture.model).model}</p>
            {/* HOW MANY VERSIONS OF THE BOAT IN THE PHOTOGRAPH THE FILE
                PRICES — the ADV7's seven colourways, the 519's two
                consoles. It read "588 rows in that register, and 7 of them
                are this model" (M2-close critique #3 and #4): two engine
                nouns on the showroom's photograph. */}
            <p className="home-plate-door">
              <b>
                {ofThisModel.toLocaleString('en-AU')} {ofThisModel === 1 ? 'version' : 'versions'}
              </b>{' '}
              of this boat on the price file.
            </p>
            {/* THE PLATE IS THE DOOR THE BOARD DREW. Its own words:
                "a named door into that boat's register" — which had
                nowhere to go while the picker was unbuilt and now
                opens the picker AT this register, so the press lands
                on the 588 rows the line above just counted. The
                register's own name is the label, because a door says
                where it goes; the arrow is the screen's child, as on
                the act, since a primitive draws no ornament. */}
            {/* THE PHOTOGRAPH OPENS ITS OWN BOAT (the M2-close critique,
                finding 18: "The hero's act, Open Highfield Inflatables,
                opens a list of 67 models, not the ADV7 in the
                photograph"). The press lands on that boat's plate in the
                picker, under the same photograph, with its colours to
                choose and its act — and the build it starts stands on the
                same photograph again, because all three screens ask one
                rule which boat a picture is of (finding 11). Where no
                version is still sold it opens the maker, and says so. */}
            {opens && openBoat ? (
              <span className="home-plate-act">
                <Button
                  intent="veiled"
                  size="sm"
                  onClick={() => {
                    openBoat(picture.table, opens.id)
                  }}
                >
                  Quote the {spokenModel(picture.table, picture.model).model}
                  <span className="home-plate-arrow" aria-hidden="true">
                    &rarr;
                  </span>
                </Button>
              </span>
            ) : openBoatRegister ? (
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
                ? 'A picture belongs to the boat it shows, and the price file is not loaded. Nothing stands in for it.'
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
 * and its reason was a lie. What is left is the one case where this
 * screen genuinely has nowhere to send anybody: a render that was
 * handed no way there, which is a component test and never a browser.
 *
 * IT NAMES THE SCREEN AND NOT ITS PATH (rule (c), 2026-09-23): the
 * sentence used to end "The picker is at /quote/new", which is the
 * router's word and not a dealer's.
 */
export const NO_WAY_TO_THE_PICKER =
  'This screen was handed no way to the picker, so nothing was opened. Every quote starts there, from the boat.'

function Desk({
  held,
  open,
  who,
  hour,
  newQuote,
}: {
  held: Holdings
  open: boolean
  who: string | null
  hour?: number
  newQuote?: () => void
}) {
  const [query, setQuery] = useState('')
  const field = useRef<HTMLElement>(null)
  const asking = normalizeQuery(query).length >= MIN_QUERY
  /* ENTER HANDS THE WORDS TO THE FINDER. The field counts what the file
     carries as it is typed; pressing Enter on it did nothing at all (the
     critique of Milestone 2's close, #12: "a counter under a search
     label"). Now Enter opens the one finder with those words typed, where
     every line it counted can be opened, quoted or read. */
  const find = useFinder()
  const tables = useCatalogue((s) => s.tables)
  const rows = useCatalogue((s) => s.rows)
  const modules = useCatalogue((s) => s.modules)

  /* THE FIELD'S KEY IS `/`, AND IT USED TO BE CTRL K. The shell was
     built on 2026-09-23 and the finder took that chord everywhere —
     one palette, reachable from all twelve screens, which is the whole
     point of having one. This field did not lose its way in: `/` is
     what every other find field in this app already answers to (the
     register, the book, the diary, a sheet), and the finder opens with
     THIS screen's rows first under a chip reading "The desk", so the
     two do not compete. `src/screens/shell/scope.tsx` argues it.

     A KEY TYPED INTO A FIELD IS A CHARACTER. The guard is `isField`,
     the same one the Escape ladder uses, so pressing `/` while typing
     into this very field types a slash. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      if (isField(event.target)) return
      event.preventDefault()
      field.current?.focus()
    }
    globalThis.addEventListener('keydown', onKey)
    return () => globalThis.removeEventListener('keydown', onKey)
  }, [])

  /* THE INDEX IS BUILT ONCE, AND ONLY IF SOMEBODY ASKS. It folds every
     label on the sheet, which is work nobody should pay for on a paint
     they may never search from.

     AND IT FOLDS THE FILE'S LABELS, NOT THE DESK'S. The field says it
     searches the file and its placeholder counts the file's rows, so a
     name in the customers book is not a row "the file" carries — the
     finder answers a person by name, as a person (`domain/shell/
     finder.ts`), and the rule that tells the two apart is
     `domain/catalogue/priceFile.ts` (the critique of Milestone 2's
     close, blocker 2). */
  const index = useMemo(
    () =>
      asking
        ? buildSearchIndex(priceFileOf(tables, modules).tables, rows as Record<string, RowData[]>, {
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
      {/* WHAT TO DO, NOT WHAT THE FILE WEIGHS. This line used to count
          the file's split — "7,012 rows are the things … sells; the other
          8,679 are the joins" — which the stamp above and "What it sells"
          beside it already said: one fact three times on one screen. It
          now says what the two controls under it are for. */}
      {open ? (
        <p className="home-line">
          <b>The Master Price File is open.</b> Start a quote from a boat, or search the file for
          anything on it by name.
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
          Search the file by name
        </label>
        <div className="home-search-row">
          <Input
            id="home-search-field"
            ref={field}
            type="search"
            value={query}
            onValueChange={setQuery}
            aria-describedby="home-search-said"
            onKeyDown={(event) => {
              if (event.key !== 'Enter' || !find || !open || !asking) return
              event.preventDefault()
              find(query)
            }}
            placeholder={
              open ? `Search ${held.rows.toLocaleString('en-AU')} lines` : 'Nothing to search yet'
            }
          />
          <Kbd>/</Kbd>
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
                {/* "ANSWER TO", NOT "CARRY THAT WORD" (m2-last-critique.md,
                    blocker 2): a boat is found by the name the app says
                    as well as the file's own, and no line of the file
                    carries the words "Sport 560" — they answer to them. */}
                <Figure value={found.rowTotal} />{' '}
                {found.rowTotal === 1 ? 'line answers' : 'lines answer'} to that.{' '}
                <FinderSay found={find !== null} />
              </>
            ) : (
              'Nothing on the price file is called that.'
            )
          ) : (
            <>
              This field counts what the file carries. <FinderSay />
            </>
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

/**
 * WHERE A FOUND ROW OPENS, SAID TWICE AND DRAWN ONCE — rule (b) of
 * 2026-09-23, "no keycap and no sentence that names a key on a coarse
 * pointer". The critique (#18) found "Ctrl K opens the finder" printed
 * at 390 on a device with no Ctrl key. The keyboard twin carries the
 * chord as a `Kbd`, so it reads ⌘ K on a Mac and Ctrl K elsewhere; the
 * touch twin names the bubble a finger presses, by its word and its
 * glyph. `home.css` draws exactly one of them per pointer, the way the
 * quotes register's legend already does, and `display: none` keeps the
 * other out of the field's description as well as off the screen.
 */
function FinderSay({ found = false }: { found?: boolean }) {
  if (found) {
    return (
      <>
        <span className="home-say-keys" data-say="keys">
          <Kbd tone="quiet">Enter</Kbd> opens them in the finder.
        </span>
        <span className="home-say-touch" data-say="touch">
          Search, on the keyboard, opens them in the finder.
        </span>
      </>
    )
  }
  const opens = 'what it finds'
  return (
    <>
      {/* the QUIET cap, the pill's own: two paper caps inside an 11px
          sentence were the brightest marks in the desk after the act,
          and they broke the sentence's line spacing where they sat */}
      <span className="home-say-keys" data-say="keys">
        <Kbd tone="quiet">Mod K</Kbd> opens the finder, which opens {opens}.
      </span>
      <span className="home-say-touch" data-say="touch">
        <span aria-hidden="true">⌕ </span>Find, on the bar, opens {opens}.
      </span>
    </>
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
 * above. The other six — 289 boats, then 241, 444, 1,866, 3,587, 64 lines — plus the
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
                <span className="home-fig">{kind.figure.toLocaleString('en-AU')}</span>
                <span className="home-kind-label">{kind.label}</span>
              </div>
            ))}
          </div>
          {/* WHAT GOES WITH WHAT, IN A DEALER'S WORDS. This read "25
              registers hold those 7,012 rows, and 28 fitment joins carry
              the other 8,679" — the file's anatomy in the engine's nouns,
              on the showroom (the owner: "it still feels like a
              database"). The six figures above already add up to the
              first half, so it is not said a second time; the second half
              is the one fact they do not show, in the word Data prints for
              it. The anatomy is Data's, where it is printed whole. */}
          <p className="home-joins">
            <b>{held.joinRows.toLocaleString('en-AU')} pairings</b> say which motor, which trailer
            and which part goes on which hull.
          </p>
          {/* THE FIGURE THE FILE DOES NOT CARRY, said out loud where
              somebody might otherwise read one of the six above as it.
              It also says once what a "line" is on the shelf and in the
              field, which count the same thing — in the dealer's word for
              it; "A row is a line of the price file" taught him the
              engine's noun in order to take it back (M2-close #4). */}
          <p className="home-joins">
            A boat listed in four colours is one boat; every other figure counts lines of the price
            file.
          </p>
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
  const refused = shelf.flatMap(({ choice }) => (choice.drawn ? [] : [choice.because]))

  return (
    <section className="home-col home-makers" aria-label="The boat makers">
      {/* ONE LINE AT EVERY DESK WIDTH. It read "THE BOAT MAKERS — 7
          REGISTERS, 810 ROWS", which wrapped at 1280 and repeated the 810
          printed as BOATS one column to the left; the count of makers is
          the one figure the shelf owns. */}
      <p className="home-eyebrow home-eyebrow-paper">
        The boat makers{open ? ` · ${held.boats.length.toLocaleString('en-AU')}` : ''}
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
                {/* ITS BOATS, COUNTED AS THE PICKER COUNTS THEM — Highfield's
                    67 models, not its 588 lines (built-critique-m2-close-2.md,
                    major 1) */}
                <span className="home-maker-count">
                  {register.boats.toLocaleString('en-AU')}{' '}
                  {register.boats === 1 ? 'model' : 'models'}
                </span>
              </li>
            ))}
          </ul>
          {/* THE CREDIT IN A DEALER'S WORDS. It was "13 makers checked, 12
              held, 17 files — each with its address, its licence note and
              its sha256": a ledger's own bookkeeping, on the showroom. The
              ledger still holds every one of those; the shelf says what
              they add up to, and still prints the one gap in full. */}
          <p className="home-credit">
            <b>Every mark is the maker&rsquo;s own</b>, kept with where it came from and its
            licence.
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
  'This screen was handed no way to open a filed quote, so nothing was opened. Every one of them is in the register, behind Quotes.'

/**
 * HOW A QUOTE IS MADE, in the words the three screens that make one
 * use: the picker's boats by maker, the build's chapters and running
 * price, the finale's own "Give it to the customer" and the paper it
 * prints. It is the empty desk's lesson and is drawn only while nothing
 * at all is filed in this browser — the moment one quote exists, the
 * card is the lesson.
 *
 * The numerals are the list's own (`counter()` in home.css), so an
 * ordinal is never read back out of this screen's text as a figure.
 */
const STEPS: readonly { title: string; say: string }[] = [
  { title: 'Choose the boat', say: 'Every hull on the price file, by maker.' },
  { title: 'Build it', say: 'Motor, trailer and fit, priced as you pick.' },
  { title: 'Give it to the customer', say: 'Named, issued and printed on A4.' },
]

/**
 * WHAT IS FILED IN THIS BROWSER, and one press to each of it.
 *
 * AN UNTOUCHED DESK IS A SENTENCE AND A LESSON, NOT A DIAGRAM (critique
 * of Milestone 2, #23). From 2026-09-17 it drew the board's empty card —
 * labelled boxes reading "THE BOAT'S OWN PHOTOGRAPH", "MOTOR", "WHO IT IS
 * FOR", "WHERE THE ACT THAT OPENS IT WILL SIT" — which was the board's
 * answer and was also a wireframe left on a finished screen, the one
 * empty state in the app that was not written. It now says the true
 * state, teaches the three steps a quote takes, and says in one line
 * where the quote will wait. Nothing is drawn in the shape of a document
 * that no document has filled.
 *
 * What changed on 2026-09-18 still holds: when the true state stops
 * being empty, the newest document lands as a card, and the card opens
 * it — a draft where it is written, an issued quote as the paper the
 * customer was given.
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
            ? 'No quote has been started in this browser yet.'
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
      ) : read && !problem ? (
        <>
          <ol className="home-steps" aria-label="How a quote is made">
            {STEPS.map((step) => (
              <li className="home-step" key={step.title}>
                <span className="home-step-title">{step.title}</span>
                <span className="home-step-say">{step.say}</span>
              </li>
            ))}
          </ol>
          <p className="home-waits">
            <b>New quote</b> starts the first. The newest waits here, with its boat and its total.
          </p>
        </>
      ) : null}

      {/* THE WAY TO EVERY OTHER ONE, WHERE THERE IS ANOTHER ONE. Home
          counts the drafts and the register lists them; before this the
          count was a dead end. It is drawn once something is filed: on an
          empty desk it led to an empty register, a press that taught
          nothing the three steps above do not, and the pill's own Quotes
          is one word away either way. It is simply absent, never a dead
          control, where nothing handed this screen a way there. */}
      {openQuotes && desk.held > 0 ? (
        <div className="home-drafts-act">
          <Button intent="veiled" onClick={openQuotes}>
            All quotes
            <span className="home-act-arrow" aria-hidden="true">
              &rarr;
            </span>
          </Button>
        </div>
      ) : null}

      {/* A dealer's sentence for what the engine calls frozen lines: it
          used to read "a card is written from frozen lines — never from a
          live price read", which is true and is the engine talking. */}
      <p className="home-kept">
        Quotes are kept in this browser, each price fixed when it was picked.
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
          {/* THE CARD'S COMPOSITION: the boat's
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
