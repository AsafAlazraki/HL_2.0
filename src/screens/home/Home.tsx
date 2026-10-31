import {
  ArrowRightIcon,
  DatabaseIcon,
  FilePlusIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  SlidersHorizontalIcon,
} from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { priceFileOf } from '@/domain/catalogue/priceFile'
import { makerDoors, type MakerDoor } from '@/domain/catalogue/makers'
import { markOf } from '@/domain/mark'
import type { EntityDef, RowData } from '@/domain/model'
import { readEveryone } from '@/domain/people/book'
import { CUSTOMER_TABLE_ID, customerRegister } from '@/domain/people/customers'
import { owedACall, type OwedACall } from '@/domain/people/owed'
import { localDayOf } from '@/domain/quote/day'
import { dayWritten } from '@/domain/quote/diary/days'
import { indexQuotes } from '@/domain/quote/diary/history'
import type { RegisterStateId } from '@/domain/quote/register'
import { useCatalogue, useQuotes, useSession } from '@/app/useStores'
import { Button, Icon, Input, Picture, StatusDot, Tile, Water, isField, useStill } from '@/ui'
import { boatTravel } from '@/screens/picker/travel'
import { useFinder } from '@/screens/shell/scope'
import { deskOf, type FiledCard } from './filed'
import { holdingsOf } from './holdings'
import {
  HOME_BOATS,
  boatsForHome,
  everyPhotographed,
  markFor,
  pictureById,
  type HeldPicture,
  type Photographed,
} from './ledgers'
import { boatsFirst, sectionOrder, shows } from '@/domain/northside/home'
import { useOrgMark, type OrgMark } from './mark'
import './home.css'

/* ============================================================
   HOME — built from board D, "Who is at the desk"
   (docs/directions/home2-boards/d-who-is-at-the-desk-day-one.html), the
   judge's pick of 2026-10-20, with board A's ten makers grafted on, and
   rebuilt the same day after a cold critique of the first build
   (docs/directions/home2-critique.md).

   ONE COMPOSITION IN EVERY STATE. The critic's one change: day one was
   good and a week in replaced it — the sea shrank to a 110px strip, the
   name to 32px, the boats to thumbnails, and the work stood in two
   half-empty white boxes. Now the work JOINS day one instead:

     · THE SEA, at the same size on day one and a week in: Northside's
       mark (its own logo where one is held, `./mark.ts`; its name set at
       the mark's size where none is), the date and the greeting, and the
       one find beside the one act.
     · A WEEK IN, ONE ROW OF WORK ON THE WATER, under the find and sized
       to what it holds: the drafts being written, the quotes given
       today, and the people owed a call this week, each one card, each
       one press. Nothing is drawn for a job with nothing in it.
     · THE FOOT OF THE SEA speaks only when something is wrong with the
       file: it could not be read, or it is not on this computer (with
       the door to it), or it was read and could not be kept. On a day
       when the file is in and well, the sea has no foot.
     · THE BOATS THE LEDGER PHOTOGRAPHS, each a door to quoting it, and
       THE MAKERS as ten still doors, at their day-one size in every state.

   THE SUBJECT IS THE SALESPERSON'S DAY, NOT THE PRICE FILE
   (docs/research/refs/home2/why.md). The owner, 2026-10-31: "Let's
   remove the price list of 16 september on home page and the text below
   it and the text on the right and remove the answer them on prices".
   The file's date, the price questions with their door to Prices, and
   today's line were the dealer's daily noise; the file's date is Data's,
   and the questions are Prices' own. That the file is in is said to a
   test by `data-file` on the screen's root, never in words.

   NOTHING IS INVENTED, AND NO TOTAL IS SET HERE. Every figure comes from
   `src/domain`: the doors from `catalogue/makers`, the people from
   `people/owed`, the documents from
   `quote/register`. No revenue, target, rate or trend; no cost and no
   margin; and no customer's total, because a customer may be sitting
   beside the screen — a document is drawn by its boat, its state and
   its day, and its figure is one press away on the quote itself.
   ============================================================ */

export interface HomeProps {
  /** WHOSE FILE THIS IS, read off what was opened (the catalogue store's
   *  `business`). Null is honest: nothing has said the name yet. */
  business?: string | null
  /** where the sheet came from on this open: rides on the screen's root as data */
  from?: 'pack' | 'repository' | null
  /** the sentence when the file was read but could not be kept here */
  unkept?: string | null
  /** the sentence when the sheet could not be opened at all */
  problem?: string | null
  /** the hour the greeting reads, injected so a test can ask about one */
  hour?: number
  /** THE WAY BACK TO THE DOOR, for a browser that holds no copy of the
   *  file. Home reads this browser and never the file. */
  openTheFile?: () => void
  /** the picker, at `/quote/new`, where a quote is started — and where a
   *  motor or a trailer is sold, on the boat it goes on */
  newQuote?: () => void
  /** one filed document: a draft where it is written, a given one as paper */
  openQuote?: (id: string, state: RegisterStateId) => void
  /** the picker, opened at one maker's boats */
  openBoatRegister?: (tableId: string) => void
  /** the picker, opened at the boat a photograph depicts */
  openBoat?: (tableId: string, rowId: string) => void
  /** one person's page in Customers, by the book's own key */
  openCustomer?: (key: string) => void
  /** every quote, in Quotes: where the desk's folded cards are */
  openQuotes?: () => void
  /** every person, in Customers: where the desk's folded people are */
  openCustomers?: () => void
  /** NOT READ SINCE 2026-10-31: Home no longer asks the price questions (the owner removed them
   *  with their door). Kept on the props only so the router's call still types until the route
   *  stops passing it (src/routes/index.tsx). */
  openPrices?: () => void
  /** the clock, injected so a test can say which instant it asks about */
  now?: () => Date
  /** NORTHSIDE'S MARK, handed in by a test; the screen otherwise reads
   *  the slot itself (`./mark.ts`) */
  mark?: OrgMark | null
  /** Settings, opened at Home's arrangement (Milestone 4): where Northside orders and hides
   *  what Home shows, chooses its photograph and the boats it starts with */
  arrange?: () => void
}

/** Said at the act, where the press happens: the render a component
 *  test makes with no router, and never a browser. */
export const NO_WAY_TO_THE_PICKER =
  'This screen was handed no way to the picker, so nothing was opened. Every quote starts there, from the boat.'

/** Said once under the row of work, in the same render. */
export const NO_WAY_TO_A_FILED_QUOTE =
  'This screen was handed no way to open a quote or a customer, so nothing was opened. Every one of them is behind Quotes and Customers.'

/** Said once above the boats and the doors, in the same render. */
export const NO_WAY_IN = 'This screen was handed no way to the picker, so these open nothing here.'

/** Said under the field, in a render with no finder above it. */
export const NO_FINDER =
  'This screen was handed no finder, so what is typed here opens nothing. The finder is on the bar.'

/**
 * THE MOTORS AND THE TRAILERS, SAID ONCE AND NOT AS DOORS (2026-10-20, the second cold critique,
 * major 4): a door with Yamaha's mark on it opened a boat list that never named Yamaha. Nothing
 * in this app sells a motor or a trailer on its own — each is a chapter of a boat's build — so
 * they are named in one sentence beside the boat makers' doors: "Yamaha and ePropulsion motors,
 * and trailers from 7 makers, are chosen in the build, on the boat." Null where the file sells
 * neither.
 */
export function soldOnTheBoat(doors: readonly MakerDoor[]): string | null {
  const motors = doors.filter((door) => door.kind === 'motor').map((door) => door.name)
  const trailers = doors.find((door) => door.kind === 'trailer')
  const clauses: string[] = []
  if (motors.length > 0) clauses.push(`${listed(motors)} motors`)
  if (trailers) clauses.push(`trailers from ${trailers.said}`)
  if (clauses.length === 0) return null
  const head = clauses.join(', and ')
  return `${head.charAt(0).toUpperCase()}${head.slice(1)}, ${clauses.length > 1 || motors.length > 1 ? 'are' : 'is'} chosen in the build, on the boat.`
}

/** "A", "A and B", "A, B and C" */
function listed(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? ''
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1) ?? ''}`
}

/** The greeting reads the clock and nothing else. */
export function greetingFor(hour: number, name: string | null): string {
  const part = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
  return name ? `Good ${part}, ${name}.` : `Good ${part}.`
}

/* THE ARRIVAL PLAYS ONCE A SESSION. A module flag rather than a store:
   it is not state the app keeps, only whether this page has already
   seen Northside's name rise. A return to Home within the visit draws
   the screen at rest; a reload plays it again, as a visit should. */
let arrived = false

/** Whether a media query holds, heard live: a change mid-visit is answered at once. */
function useMatch(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof matchMedia === 'function' && matchMedia(query).matches,
  )
  useEffect(() => {
    if (typeof matchMedia !== 'function') return
    const list = matchMedia(query)
    const read = (): void => setMatches(list.matches)
    read()
    list.addEventListener('change', read)
    return () => list.removeEventListener('change', read)
  }, [query])
  return matches
}

/** The breakpoints home.css reflows on, asked of the same widths. */
const HAND = '(max-width: 639.98px)'
const DESK = '(min-width: 1200px)'
const ROOMY = '(min-width: 1400px)'
const WIDE = '(min-width: 1680px)'

export function Home({
  business = null,
  from = null,
  unkept = null,
  problem = null,
  hour,
  openTheFile,
  newQuote,
  openQuote,
  openBoatRegister,
  openBoat,
  openCustomer,
  openQuotes,
  openCustomers,
  now,
  mark,
  arrange,
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
  /* HOME AS NORTHSIDE ARRANGED IT on /manage (Milestone 4); exactly as built where nothing is set */
  const arranged = useCatalogue((s) => s.org?.home)
  const hero = useCatalogue((s) => s.org?.look?.hero)
  const heroPicture = useMemo(() => (hero ? (pictureById(hero.picture) ?? null) : null), [hero])

  const held = useMemo(() => holdingsOf(tables, rows, modules), [tables, rows, modules])
  const open = status === 'ready' && held.tables > 0
  const named = business !== null && business.trim() !== '' ? business.trim() : null
  const slot = useOrgMark(named)
  const shown = mark !== undefined ? mark : slot

  const [arrive] = useState(() => !arrived)
  useEffect(() => {
    arrived = true
  }, [])

  /* THE CLOCK IS READ ONCE PER RENDER, so a card's age and today's line
     cannot be stamped a minute apart */
  const clock = now ? now() : new Date()
  const today = localDayOf(clock)
  const filed = deskOf(quotes, clock.getTime())

  const doors = useMemo(
    () => (open ? makerDoors(priceFileOf(tables, modules).tables, rows) : []),
    [open, tables, modules, rows],
  )

  /* WHO IS OWED A CALL THIS WEEK: everyone the Customers screen counts,
     kept in the book or named on a quote, read by the same function */
  const index = indexQuotes(quotes)
  const everyone = readEveryone(
    customerRegister(tables as Record<string, EntityDef>),
    rows[CUSTOMER_TABLE_ID] ?? [],
    quotes,
    index,
  )
  const owed = owedACall(everyone.rows, index, today)
  /* A WEEK IN is anything at all kept here: a quote, or a person */
  const week = quotesRead && (filed.held > 0 || everyone.rows.length > 0)

  /* THE WORK, IN THE ORDER IT IS PICKED UP: what is being written, what
     was given today, then who is owed a call */
  const jobs: Job[] = [
    ...filed.writing.map((card): Job => ({ kind: 'draft', card })),
    ...filed.given.map((card): Job => ({ kind: 'given', card })),
    ...owed.map((person): Job => ({ kind: 'owed', person })),
  ]
  /* HOW MANY CARDS THE ROW HAS ROOM FOR, each at a card's own width: five on a wide screen,
     four at 1440, three on a laptop's window, four two by two on a tablet, three in a hand */
  const hand = useMatch(HAND)
  const desk = useMatch(DESK)
  const roomy = useMatch(ROOMY)
  const wide = useMatch(WIDE)
  const room = hand ? 3 : wide ? 5 : roomy || !desk ? 4 : 3

  /* NO SCOPE CHIP ON HOME (2026-10-20, the second cold critique, minor 11): the finder this
     field opens answered "sport 560" from the whole file under a chip that said "The desk",
     which said the search was narrower than it was. The finder Home opens is the whole finder. */

  const greeting = greetingFor(hour ?? clock.getHours(), who)
  const date = dayWritten(today, today)

  /* THE BOATS THE LEDGER HOLDS A PHOTOGRAPH OF, each with the version it
     opens on — only where the file is open and still sells one */
  const boats = useMemo(
    () => (open ? photographed(tables, rows, arranged?.first) : []),
    [open, tables, rows, arranged?.first],
  )
  /* A NAME TRAVELS ONCE: a boat whose photograph a card on the desk
     already carries gives its view-transition name up to the card */
  const plan = planDesk(jobs, room)
  const taken = new Set(
    plan.drawn.flatMap((job) =>
      job.kind === 'owed' || !job.card.picture ? [] : [job.card.travel],
    ),
  )

  /* THE FOOT, ONLY WHEN THE FILE HAS SOMETHING WRONG TO SAY (the owner, 2026-10-31): a file
     that is in and well draws no foot at all, and the centre stands in the middle of the sea */
  const failed = status === 'failed' || (problem ?? refused) !== null
  const foot = !open || failed || unkept !== null

  return (
    <main
      className="home"
      data-testid="home"
      data-state={week ? 'week' : 'day-one'}
      /* THE FILE IS IN, said to a test and never to the eye: the ready signal every walk to Home
         waits on since the price list's stamp left the sea (2026-10-31) */
      data-file={open ? 'open' : undefined}
      data-from={open ? (from ?? undefined) : undefined}
      data-foot={foot ? '' : undefined}
      data-arrive={arrive ? '' : undefined}
      /* THE SHELL'S BAR STANDS AT THE HEAD OF THIS SCREEN IN A HAND, never at its foot over
         Home's own words (the critique of the built Home, blocker 2; src/screens/shell/shell.css) */
      data-pill="head"
    >
      <section className="home-sea" aria-label={named ?? 'Home'}>
        <span className="home-water" aria-hidden="true">
          {heroPicture && hero ? (
            /* NORTHSIDE'S OWN PHOTOGRAPH UNDER ITS NAME, veiled by as much navy as its own
               brightest pixels asked for when it was chosen, so the greeting keeps 4.5 : 1 */
            <span className="home-hero" style={{ '--veil': String(hero.veil) } as CSSProperties}>
              <img
                className="home-hero__img"
                src={heroPicture.src}
                srcSet={srcSetOf(heroPicture)}
                sizes="100vw"
                alt=""
                width={heroPicture.width}
                height={heroPicture.height}
              />
            </span>
          ) : (
            <Water />
          )}
        </span>
        <div className="home-sea-centre">
          <Mark business={named} mark={shown} />
          <div className="home-hello">
            <p className="home-date">{date}</p>
            <h1 className="home-greet">{greeting}</h1>
            {who === null ? (
              <p className="home-nobody">No name has been given yet, so the greeting has none.</p>
            ) : null}
          </div>
          <Ask open={open} people={everyone.rows.length > 0} boats={boats} newQuote={newQuote} />
        </div>
        {jobs.length > 0 && shows(arranged, 'desk') ? (
          <Desk
            plan={plan}
            openQuote={openQuote}
            openCustomer={openCustomer}
            openQuotes={openQuotes}
            openCustomers={openCustomers}
          />
        ) : null}
        {foot ? (
          <div className="home-sea-foot">
            <Stamp
              open={open}
              status={status}
              problem={problem ?? refused}
              unkept={unkept}
              openTheFile={openTheFile}
            />
          </div>
        ) : null}
      </section>

      {quotesProblem ? (
        <p className="home-said" role="alert">
          The saved quotes could not be read. {quotesProblem}
        </p>
      ) : null}

      {open ? (
        <>
          {sectionOrder(arranged).map((section) =>
            !shows(arranged, section) ? null : section === 'boats' ? (
              <Boats
                key="boats"
                boats={boats}
                taken={taken}
                openBoat={openBoat}
                arrange={arrange}
              />
            ) : section === 'makers' ? (
              <Makers
                key="makers"
                business={named}
                doors={doors}
                tables={tables}
                openBoatRegister={openBoatRegister}
              />
            ) : null,
          )}
        </>
      ) : status === 'ready' || status === 'failed' ? (
        <p className="home-said">
          No price list is open, so no boat and no maker is shown here. A quote or a customer is
          still found by name, above.
        </p>
      ) : null}
    </main>
  )
}

/* ---------------------------------------------------------- */
/* The showpiece                                              */
/* ---------------------------------------------------------- */

/**
 * NORTHSIDE'S MARK, OR ITS NAME AT THE MARK'S SIZE — never a drawing in
 * its place (CLAUDE.md: no stand-ins), and THE SAME SIZE IN EVERY STATE:
 * the work joins the sea under it and never shrinks it. The picture is
 * said by its alt, the business; the name set in type is said once,
 * whole, to a reader, while its letters rise one by one for the eye on
 * the first arrival.
 */
function Mark({ business, mark }: { business: string | null; mark: OrgMark | null }) {
  if (mark) {
    return (
      <p className="home-mark">
        <img
          className="home-logo"
          src={mark.src}
          alt={mark.alt}
          width={mark.width}
          height={mark.height}
          data-from={mark.from}
        />
      </p>
    )
  }
  /* NO NAME UNTIL THE FILE HAS SAID IT: the water keeps its shape */
  if (!business) return null
  const words = business.split(/\s+/)
  const first = words[0] ?? ''
  const rest = words.slice(1).join(' ')
  return (
    <p className="home-mark" data-set="type">
      <span className="home-unseen">{business}</span>
      <span className="home-name" aria-hidden="true">
        {[...first].map((letter, i) => (
          <span
            // a letter's place in the name is its identity: the name does not reorder
            // oxlint-disable-next-line react/no-array-index-key
            key={i}
            className="home-letter"
            style={{ '--i': i } as CSSProperties}
          >
            {letter}
          </span>
        ))}
      </span>
      {rest ? (
        <span
          className="home-name-rest"
          aria-hidden="true"
          style={{ '--i': first.length } as CSSProperties}
        >
          {rest}
        </span>
      ) : null}
    </p>
  )
}

/* ---------------------------------------------------------- */
/* The one find and the one act                               */
/* ---------------------------------------------------------- */

/** How long one example stands in the field before the next. */
const EXAMPLE_MS = 2800

/**
 * THE FIELD IS THE FINDER'S DOOR, AND THE ACT STANDS BESIDE IT.
 *
 * What is typed here opens the shell's one finder with those words — a
 * person by name, a boat by what a customer calls it — so Home has one
 * find and not a second field that only counts (why.md §2.6). `/` puts
 * the caret here, as on every find field in the app; Ctrl K is the
 * finder's own everywhere. When the finder closes, the caret comes back
 * here (`Finder.tsx` gives it back to whatever had it).
 *
 * ITS EXAMPLE ROLLS THROUGH THE BOATS THE LEDGER PHOTOGRAPHS, in the
 * words a customer says them ("Sport 560", "ADV7"), and STOPS while a
 * caret is in any field and the moment reduced motion is asked for —
 * heard live, not on the next load. It is the placeholder's words that
 * change, in place: nothing is drawn over the field.
 */
function Ask({
  open,
  people,
  boats,
  newQuote,
}: {
  open: boolean
  /** people are kept here, so the field finds a person as well */
  people: boolean
  boats: readonly Photographed[]
  newQuote?: () => void
}) {
  const field = useRef<HTMLElement>(null)
  const find = useFinder()
  const [query, setQuery] = useState('')
  const still = useStill()
  const reduce = useMatch('(prefers-reduced-motion: reduce)')
  const examples = useMemo(() => boats.map((boat) => boat.model), [boats])
  const [at, setAt] = useState(0)

  useEffect(() => {
    if (still || reduce || examples.length < 2) return
    const timer = setInterval(() => setAt((i) => (i + 1) % examples.length), EXAMPLE_MS)
    return () => clearInterval(timer)
  }, [still, reduce, examples.length])

  /* `/` PUTS THE CARET HERE — and a slash typed into a field is a slash */
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

  /* IN A HAND THE FIELD IS A THUMB'S WIDTH, and an example cut off mid-word says nothing: the
     lead alone stands there */
  const narrow = useMatch(HAND)
  const example = examples.length > 0 && !narrow ? examples[at % examples.length] : null
  const lead = people ? 'A name, or the boat they say' : 'The boat they say'
  const placeholder =
    example && open ? `${lead} — “${example}”` : people ? 'A name, or a boat' : lead

  return (
    <div className="home-ask">
      <div className="home-find">
        <label className="home-unseen" htmlFor="home-find">
          Find a boat or a customer
        </label>
        <Input
          id="home-find"
          ref={field}
          type="search"
          size="lg"
          icon={MagnifyingGlassIcon}
          value={query}
          aria-describedby={find ? undefined : 'home-find-said'}
          placeholder={placeholder}
          onValueChange={(value) => {
            /* THE WORDS GO TO THE FINDER AS THEY ARRIVE: it opens with them
               typed and takes the caret, and this field is left empty */
            if (find && value.trim() !== '') {
              find(value)
              setQuery('')
              return
            }
            setQuery(value)
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' || !find) return
            event.preventDefault()
            find(query)
            setQuery('')
          }}
        />
        {find ? null : query.trim() !== '' ? (
          <output className="home-find-said" id="home-find-said">
            {NO_FINDER}
          </output>
        ) : null}
      </div>
      {/* THE ONE ACT, AND IT ACTS: the live amber, ending on the new paper in
          its dark disc, the glyph every way to start a quote carries */}
      <div className="home-act">
        <Button
          intent="act"
          icon={FilePlusIcon}
          onClick={newQuote}
          refusedBecause={newQuote ? undefined : NO_WAY_TO_THE_PICKER}
        >
          New quote
        </Button>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* The file, said only when something is wrong with it        */
/* ---------------------------------------------------------- */

/**
 * THE FILE IS SAID ONLY WHEN SOMETHING IS WRONG WITH IT, in white on the water. Until
 * 2026-10-31 a file that was in and well was named here too, "Price list of 16 September 2026",
 * with the price questions and their door to Prices under it; the owner: "Let's remove the price
 * list of 16 september on home page and the text below it". What stays is what a dealer must act
 * on: the file could not be read; it is not on this computer, with the door to it; it was read
 * and could not be kept. White on the water is 5.8 : 1 or better by the water's construction
 * (src/ui/water.ts). Home never says it is reading the file, because it is not: Entry's door is
 * the one place the file is read.
 */
function Stamp({
  open,
  status,
  problem,
  unkept,
  openTheFile,
}: {
  open: boolean
  status: string
  problem: string | null
  unkept: string | null
  openTheFile?: () => void
}) {
  return (
    <div className="home-sea-file">
      {(status === 'empty' || status === 'loading') && problem === null ? (
        <p className="home-stamp">Looking for the price list…</p>
      ) : null}
      {status === 'failed' || problem !== null ? (
        <p className="home-stamp" role="alert">
          The price list could not be read. {problem}
        </p>
      ) : null}
      {status === 'ready' && !open ? (
        <div className="home-stamp-door">
          <p className="home-stamp">The Master Price File is not on this computer yet.</p>
          {openTheFile ? (
            <Button intent="veiled" size="sm" icon={DatabaseIcon} onClick={openTheFile}>
              Load the Master Price File
            </Button>
          ) : null}
        </div>
      ) : null}
      {unkept !== null ? (
        <output className="home-stamp">
          The price list was read but could not be saved on this computer, so the next visit reads
          it again. {unkept}
        </output>
      ) : null}
    </div>
  )
}

/* ---------------------------------------------------------- */
/* A week in: the work, one row on the water                  */
/* ---------------------------------------------------------- */

type Job =
  | { kind: 'draft'; card: FiledCard }
  | { kind: 'given'; card: FiledCard }
  | { kind: 'owed'; person: OwedACall }

const jobKey = (job: Job): string =>
  job.kind === 'owed' ? `owed:${job.person.key}` : `${job.kind}:${job.card.id}`

/** The row's plan: the cards drawn, and the work folded into the row's last card. */
export interface DeskPlan {
  drawn: readonly Job[]
  folded: readonly Job[]
}

/**
 * THE ROW HOLDS EXACTLY ITS ROOM, AND NEVER A LINE MORE (2026-10-20, the second cold critique,
 * blocker 1: a third draft or a fifth person added a line under the row, the sea grew 30–40px
 * and the makers went off the window at 1280 and 1440). Where the work is more than the room,
 * the last place is a card of its own that says what is folded and opens where it is — so the
 * row is one row of one card's height in every state, by construction and not by a light day.
 */
export function planDesk(jobs: readonly Job[], room: number): DeskPlan {
  if (jobs.length <= room) return { drawn: jobs, folded: [] }
  const shown = Math.max(room - 1, 0)
  return { drawn: jobs.slice(0, shown), folded: jobs.slice(shown) }
}

const count = (n: number, one: string, many: string): string =>
  `${n.toLocaleString('en-AU')} ${n === 1 ? one : many}`

/** What the folded card says it holds, short enough for its one line: "2 drafts · 1 given
 *  today · 2 to call". With `whole`, the line is the card's only one and its face already says
 *  how many ("+3"), so a card of one kind names the kind without counting it again — "Drafts",
 *  not "+3" over "3 drafts" (the refine round's second pass, 2026-10-21). Two kinds still say
 *  their split, which is a fact the face does not. */
export function foldedSaid(folded: readonly Job[], whole = false): string {
  const drafts = folded.filter((job) => job.kind === 'draft').length
  const given = folded.filter((job) => job.kind === 'given').length
  const people = folded.filter((job) => job.kind === 'owed').length
  if (whole && [drafts, given, people].filter((n) => n > 0).length === 1) {
    if (drafts > 0) return drafts === 1 ? 'A draft' : 'Drafts'
    return given > 0 ? 'Given today' : 'To call'
  }
  return [
    drafts > 0 ? count(drafts, 'draft', 'drafts') : '',
    given > 0 ? `${given.toLocaleString('en-AU')} given today` : '',
    people > 0 ? `${people.toLocaleString('en-AU')} to call` : '',
  ]
    .filter((part) => part !== '')
    .join(' · ')
}

/**
 * THE WORK, ONE ROW UNDER THE FIND, ONE CARD'S HEIGHT IN EVERY STATE. One card per thing to
 * pick up, each a card's width and never stretched to fill a panel, centred on the sea's axis,
 * every line of every card one line (a long boat's name is elided on the card and said whole
 * to a reader and on hover), as many as the row has room for; the rest fold into its last card.
 *
 *   · A DRAFT opens its build where it was left, carrying its photograph, and says what it
 *     still wants — "No motor yet", "No boat price yet" — before whom it is for.
 *   · A QUOTE GIVEN TODAY opens as the paper the customer was handed.
 *   · A PERSON OWED A CALL — given a quote this week, or kept with no quote yet — carries the
 *     number to ring, and opens the quote they were given or, with none, their own page.
 *   · THE FOLDED CARD says what it holds and opens Quotes, or Customers where it holds only
 *     people.
 *
 * No card prints a total: whoever is in the chair is not shown what another customer was quoted.
 */
function Desk({
  plan,
  openQuote,
  openCustomer,
  openQuotes,
  openCustomers,
}: {
  plan: DeskPlan
  openQuote?: (id: string, state: RegisterStateId) => void
  openCustomer?: (key: string) => void
  openQuotes?: () => void
  openCustomers?: () => void
}) {
  const go = (job: Job): (() => void) | undefined => {
    if (job.kind === 'draft') return openQuote ? () => openQuote(job.card.id, 'draft') : undefined
    if (job.kind === 'given') return openQuote ? () => openQuote(job.card.id, 'issued') : undefined
    const person = job.person
    if (person.quoteId) {
      const id = person.quoteId
      return openQuote ? () => openQuote(id, 'issued') : undefined
    }
    return openCustomer ? () => openCustomer(person.key) : undefined
  }
  const { drawn, folded } = plan
  const onlyPeople = folded.length > 0 && folded.every((job) => job.kind === 'owed')
  const anyPeople = folded.some((job) => job.kind === 'owed')
  const more = onlyPeople ? openCustomers : openQuotes
  const refused =
    drawn.some((job) => go(job) === undefined) || (folded.length > 0 && more === undefined)
  return (
    <section className="home-desk" aria-labelledby="home-desk-title">
      <h2 className="home-unseen" id="home-desk-title">
        Work in hand
      </h2>
      <ul className="home-jobs">
        {drawn.map((job, i) => {
          const press = go(job)
          return (
            <li
              className="home-job"
              key={jobKey(job)}
              data-kind={job.kind}
              style={{ '--n': i } as CSSProperties}
            >
              <Tile onSelect={press} refusedBy={press ? undefined : 'home-desk-say'}>
                {job.kind === 'owed' ? <Person person={job.person} /> : <Paper job={job} />}
              </Tile>
            </li>
          )
        })}
        {folded.length > 0 ? (
          <li
            className="home-job"
            key="more"
            data-kind="more"
            style={{ '--n': drawn.length } as CSSProperties}
          >
            <Tile onSelect={more} refusedBy={more ? undefined : 'home-desk-say'}>
              <span className="home-job-in">
                <span className="home-job-face" data-art="more" aria-hidden="true">
                  +{folded.length.toLocaleString('en-AU')}
                </span>
                {/* THE COUNT IS SAID ONCE, by the face for the eye and here for a reader; the
                    title says where the rest are, and the lines under it what they are: what is
                    in Quotes on one, who is to call on the next, so neither is elided at 1280 */}
                <span className="home-job-body">
                  <span className="home-unseen">{folded.length.toLocaleString('en-AU')} more </span>
                  <span className="home-job-title">
                    {onlyPeople
                      ? 'In Customers'
                      : anyPeople
                        ? 'In Quotes and Customers'
                        : 'In Quotes'}
                  </span>
                  {anyPeople && !onlyPeople ? (
                    <>
                      <span className="home-job-said">
                        {foldedSaid(folded.filter((job) => job.kind !== 'owed'))}
                      </span>
                      <span className="home-job-said">
                        {foldedSaid(folded.filter((job) => job.kind === 'owed'))}
                      </span>
                    </>
                  ) : (
                    <span className="home-job-said">{foldedSaid(folded, true)}</span>
                  )}
                </span>
                <span className="home-job-go" aria-hidden="true">
                  <Icon glyph={ArrowRightIcon} />
                </span>
              </span>
            </Tile>
          </li>
        ) : null}
      </ul>
      {refused ? (
        <p className="home-desk-say" id="home-desk-say">
          {NO_WAY_TO_A_FILED_QUOTE}
        </p>
      ) : null}
    </section>
  )
}

/** A space a line does not break at. */
const NO_BREAK = '\u00a0'

/** A document on the desk: a draft being written, or a quote given today. */
function Paper({ job }: { job: Extract<Job, { kind: 'draft' | 'given' }> }) {
  const card = job.card
  const said =
    job.kind === 'draft'
      ? `${card.word} · ${card.age}`
      : card.givenAt
        ? `Given today at ${card.givenAt}`
        : 'Given today'
  /* WHAT IT STILL WANTS, THEN WHOM IT IS FOR (the second cold critique, major 5): the motor, or
     the boat's own price where the price list has none (the refine round), is the next thing the
     salesperson does, so it is said first; the price it is at is the build's to say */
  const whomParts =
    job.kind === 'draft'
      ? [card.wants, card.customer ? `For ${card.customer}` : 'Nobody named yet'].filter(
          (part) => part !== null,
        )
      : [card.customer ? `To ${card.customer}` : 'Nobody named on it']
  const whom = whomParts.join(' · ')
  return (
    <span className="home-job-in">
      <span className="home-job-face" data-art={card.picture ? 'photograph' : 'mark'}>
        {card.picture ? (
          <Picture
            src={card.picture.src}
            srcSet={srcSetOf(card.picture)}
            sizes="(max-width: 639.98px) 30vw, 120px"
            alt=""
            width={card.picture.width}
            height={card.picture.height}
            shared={card.travel}
          />
        ) : (
          <MakerWell maker={card.maker} />
        )}
      </span>
      <span className="home-job-body">
        <span className="home-job-title" title={card.headline}>
          {card.headline}
        </span>
        <span className="home-job-said">
          <StatusDot state={job.kind === 'draft' ? 'draft' : 'given'} size="inherit" line>
            {said}
          </StatusDot>
        </span>
        {/* each part is one piece — its spaces do not break — so where a hand wraps the line it
            breaks at the dot, and never inside "Nobody named yet" or a person's name */}
        <span className="home-job-who" data-wants={card.wants ? '' : undefined} title={whom}>
          {whomParts.map((part) => part.replaceAll(' ', NO_BREAK)).join(' · ')}
        </span>
      </span>
      <span className="home-job-go" aria-hidden="true">
        <Icon glyph={ArrowRightIcon} />
      </span>
    </span>
  )
}

/** A person owed a call, drawn as a person: their initials, their name,
 *  what is true, and the number to ring. */
function Person({ person }: { person: OwedACall }) {
  return (
    <span className="home-job-in">
      <span className="home-job-face" data-art="person" aria-hidden="true">
        {markOf(person.name)}
      </span>
      <span className="home-job-body">
        <span className="home-job-title" title={person.name}>
          {person.name}
        </span>
        <span className="home-job-said" title={person.said}>
          {person.why === 'given' ? (
            <StatusDot state="given" size="inherit" line>
              {person.said}
            </StatusDot>
          ) : (
            person.said
          )}
        </span>
        {person.contact ? (
          <span className="home-job-who home-job-phone">
            <Icon glyph={PhoneIcon} />
            <span className="home-job-number">{person.contact}</span>
          </span>
        ) : (
          <span className="home-job-who">No number yet</span>
        )}
      </span>
      <span className="home-job-go" aria-hidden="true">
        <Icon glyph={ArrowRightIcon} />
      </span>
    </span>
  )
}

/** The maker's own mark on the card's plate, where no photograph of the
 *  boat is held — or the maker's initials in type where no mark is either. */
function MakerWell({ maker }: { maker: string }) {
  const choice = maker ? markFor(maker, 'paper') : null
  if (choice?.drawn) {
    return (
      <img
        className="home-job-mark"
        src={choice.mark.src}
        alt=""
        width={choice.mark.width}
        height={choice.mark.height}
      />
    )
  }
  return <span className="home-job-typed">{maker ? markOf(maker) : ''}</span>
}

/* ---------------------------------------------------------- */
/* The boats the ledger photographs                           */
/* ---------------------------------------------------------- */

/** The held photographs whose boat the open file still sells, with the version each opens on:
 *  the eight Home's row stands on (`boatsForHome`). */
export function photographed(
  tables: Readonly<Record<string, EntityDef>>,
  rows: Readonly<Record<string, RowData[]>>,
  first?: readonly string[],
): Photographed[] {
  const all = everyPhotographed(tables, rows)
  /* THE BOATS NORTHSIDE PUT FIRST (Milestone 4), in its order, then Home's own choice of the rest */
  const lead = boatsFirst(all, first, (b) => b.picture.id).filter((b) =>
    (first ?? []).includes(b.picture.id),
  )
  return [
    ...lead.slice(0, HOME_BOATS),
    ...boatsForHome(
      all.filter((b) => !lead.includes(b)),
      Math.max(0, HOME_BOATS - lead.length),
    ),
  ]
}

const srcSetOf = (picture: HeldPicture): string =>
  picture.widths.map((copy) => `${copy.src} ${copy.width}w`).join(', ')

/** How wide a boat's card is drawn: eight to a row on a desk, four on a
 *  tablet, two in a hand. */
const BOAT_FRAME = '(max-width: 639.98px) 50vw, (max-width: 1199.98px) 25vw, 14vw'

/**
 * START FROM THE BOAT — the boats whose own photographs the ledger
 * holds, each a door to quoting it: the picker opens at that boat, under
 * the same photograph, by the view-transition name the sale already
 * uses. Any other boat is one word away in the field, which is why the
 * sentence beside the head says so. The head says what the row is for
 * at the desk, not where its pictures came from (the critique, major 6).
 */
function Boats({
  boats,
  taken,
  openBoat,
  arrange,
}: {
  boats: readonly Photographed[]
  taken: ReadonlySet<string>
  openBoat?: (tableId: string, rowId: string) => void
  arrange?: () => void
}) {
  if (boats.length === 0) return null
  return (
    <section className="home-boats" aria-labelledby="home-boats-title">
      <div className="home-row-head">
        <h2 className="home-row-title" id="home-boats-title">
          Start from the boat
        </h2>
        <p className="home-row-say" id="home-boats-say">
          {openBoat ? 'Press one to quote it, or find any other by name.' : NO_WAY_IN}
        </p>
        {/* ARRANGE, WHERE A PERSON LOOKING AT HOME'S BOATS WOULD LOOK FOR IT (Milestone 4): it
            opens Settings at Home, drawn live beside its controls */}
        {arrange ? (
          <span className="home-arrange">
            <Button intent="quiet" size="sm" icon={SlidersHorizontalIcon} onClick={arrange}>
              Arrange Home
            </Button>
          </span>
        ) : null}
      </div>
      <ul className="home-boat-list">
        {boats.map((boat) => {
          const travel = boatTravel(boat.table, boat.row)
          return (
            <li className="home-boat" key={boat.picture.id}>
              <Tile
                onSelect={() => openBoat?.(boat.table, boat.row)}
                refusedBy={openBoat ? undefined : 'home-boats-say'}
                label={`${boat.model}, ${boat.maker} — quote it`}
              >
                <span className="home-boat-in">
                  <span className="home-boat-shot">
                    <Picture
                      src={boat.picture.src}
                      srcSet={srcSetOf(boat.picture)}
                      sizes={BOAT_FRAME}
                      alt={boat.picture.subject}
                      width={boat.picture.width}
                      height={boat.picture.height}
                      shared={taken.has(travel) ? undefined : travel}
                      priority
                    />
                  </span>
                  <span className="home-boat-model">{boat.model}</span>
                  <span className="home-boat-maker">{boat.maker}</span>
                </span>
              </Tile>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* ---------------------------------------------------------- */
/* The boat makers, as doors with their marks large           */
/* ---------------------------------------------------------- */

/**
 * THE BOAT MAKERS' OWN MARKS AS DOORS, LARGE (2026-10-20, the second cold critique, major 3:
 * ten white cards each holding a mark about 170 × 30 floating in white, Jeanneau's wordmark 7px
 * tall, "the hated shelf, larger"). Fewer doors, each mark drawn at the door's full width, the
 * way the original HelmLogic dashboard drew them: the seven boat makers, one row of seven on a
 * desk, each opening its boats in the picker. A mark is fitted into the door's face whole —
 * as wide as the door where it runs long (HIGHFIELD, Surtees), as tall as the face where it
 * stands up (Jeanneau's star, Haines's script) — never recoloured and never drawn past the copy
 * held. A maker with no mark held (Stabicraft) is set in type in its place.
 *
 * THE MOTORS AND THE TRAILERS ARE NOT DOORS (major 4): they are chosen in the build, on a boat,
 * and a door with Yamaha's mark on it that opened a boat list never named Yamaha. They are said
 * once beside the doors' head (`soldOnTheBoat`).
 */
function Makers({
  business,
  doors,
  tables,
  openBoatRegister,
}: {
  business: string | null
  doors: readonly MakerDoor[]
  tables: Readonly<Record<string, EntityDef>>
  openBoatRegister?: (tableId: string) => void
}) {
  const boats = doors.filter((door) => door.kind === 'boat')
  if (boats.length === 0) return null
  const onTheBoat = soldOnTheBoat(doors)
  const go = (door: MakerDoor): (() => void) | undefined => {
    const opens = door.opens
    return opens.at === 'picker' && openBoatRegister
      ? () => openBoatRegister(opens.tableId)
      : undefined
  }
  const everyWay = boats.every((door) => go(door) !== undefined)
  return (
    <section className="home-makers" aria-labelledby="home-makers-title">
      <div className="home-row-head">
        <h2 className="home-row-title" id="home-makers-title">
          What {business ?? 'this business'} sells
        </h2>
        {everyWay ? (
          onTheBoat ? (
            <p className="home-row-say">{onTheBoat}</p>
          ) : null
        ) : (
          <p className="home-row-say" id="home-makers-say">
            {NO_WAY_IN}
          </p>
        )}
      </div>
      <ul className="home-doors">
        {boats.map((door) => {
          const press = go(door)
          const face = markFor(tables[door.key]?.name ?? door.name, 'paper')
          return (
            <li className="home-door" key={door.key} data-kind={door.kind}>
              <Tile onSelect={press} refusedBy={press ? undefined : 'home-makers-say'}>
                <span className="home-door-in">
                  <span className="home-door-face">
                    {face.drawn ? (
                      <img
                        className="home-door-mark"
                        src={face.mark.src}
                        alt=""
                        width={face.mark.width}
                        height={face.mark.height}
                        style={{ '--aspect': face.mark.width / face.mark.height } as CSSProperties}
                      />
                    ) : (
                      <span className="home-door-typed">{door.name}</span>
                    )}
                  </span>
                  <span className="home-door-foot">
                    {/* THE NAME IS SAID ONCE: by the maker's own mark where one is drawn (and to
                        a reader here), in type where none is */}
                    {face.drawn ? <span className="home-unseen">{door.name} </span> : null}
                    <span className="home-door-count">{door.said}</span>
                    <span className="home-door-go" aria-hidden="true">
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
