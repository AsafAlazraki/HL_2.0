import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import {
  ArrowRightIcon,
  CheckIcon,
  CircleIcon,
  DatabaseIcon,
  HouseIcon,
  LockSimpleOpenIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react'
import {
  Button,
  Icon,
  Input,
  Plate,
  RESPONSE,
  Refusal,
  Water,
  closesStage,
  settlesIn,
  stageKeyOf,
  type Glyph,
} from '@/ui'
import { MARK_TRANSITION } from '@/screens/shell/Pill'
import { countPriceFile } from '@/domain/catalogue/priceFile'
import { repositories } from '@/data'
import { PACK_ORG_ID, openCatalogue } from '@/data/pack/boot'
import { PackFileUnserved, PackUnreachable } from '@/data/pack/load'
import { catalogue } from '@/state/catalogue'
import { nameRefusal, session } from '@/state/session'
import {
  HERO_DIR,
  auDate,
  figure,
  hostOf,
  notLoadedSay,
  readEntryFacts,
  type EntryFacts,
  type HeroEntry,
  type NotLoaded,
} from './facts'
import './entry.css'

/* ============================================================
   ENTRY — "Veil and card", built from docs/directions/entry/
   b-veil-and-card.html. Provisional: the owner has not picked, and the
   plan's standing rule is to build the recommended direction and say
   so in docs/SCREENS.md.

   WHAT THE SCREEN DOES. It says who is at the desk, offers ONE door —
   open Northside's Master Price File — and is honest that nothing here
   is checked. There is no password field: a password that protects
   nothing is fake data (docs/DECISIONS.md, "sign-in is a name until
   Milestone 6"). A returning visitor never sees it by accident; the
   route redirects them to Home. They reach it once more on purpose —
   a screen whose browser holds no copy of the file offers "Load the
   Master Price File", which sends them to `/sign-in?again` — and then
   the field starts with the name this browser remembers.

   ONE DOOR, SINCE 2026-09-25. The second, "Start a blank sheet", opened
   the app on no file at all: a business with no price file building
   its own tables, which is nobody who will use this app. This is
   Northside Marine's app (docs/DECISIONS.md, 2026-09-23), so the door
   opens Northside's file, and when the file cannot be read the screen
   says so and says what to do — it never offers a business with
   nothing in it instead. The name is given to the session only once
   the file has landed, so a load that fails leaves no name behind and
   the next visit is this door again, not a desk with no file on it.

   THE BOARD'S FOUR IDEAS, KEPT. A held photograph fills the window
   under a veil; the mark is an object hung off the top edge rather
   than an eyebrow in a corner; the question sits on a card lifted
   clear of the water; and a panel names the photograph's OWN ROW IN
   THE FILE, so the picture is evidence and not decoration. That panel
   is read out of `manifest.json` and `heroes-ledger.json` at runtime
   (see `facts.ts`); not one figure on this screen is written down.

   WHAT IS NOT THE BOARD. The board is a picture drawn at 1440x900 with
   every position hard-coded. This screen is a grid with a stated
   reflow at six widths (`entry.css`), and its colours, sizes, radii
   and shadows are the tokens that were written FROM this board — so
   where the board says #1A65BD this says `--color-accent`, and the
   blue Northside sets for itself lands here without a rebuild.

   IN THE KIT'S LANGUAGE (2026-09-28), the same four ideas in the kit's
   materials — "components are so bland and boring", the owner said:
     · THE PENNANT IS THE BAND. Its ground is the kit's live water
       (`Water`, src/ui/water.ts) under the accent deepened across it, so
       the mark — "the showpiece thing" — is the one living surface on the
       first screen. It wears the mark's view-transition name, and so does
       the pill's crest on every screen after this one: opening the file
       flies the flag up into the roundel (MARK_TRANSITION, the shell's).
     · THE CARD IS A PLATE — the kit's white plate, the day wherever it
       stands — and its honest line is the plate's pale well with an open
       lock beside it, the one glyph that says "nothing is checked" faster
       than the sentence does.
     · THE DOOR CARRIES THE FILE'S GLYPH (the drum the pill's Data door
       carries) and ends on an arrow in a white disc that nudges forward
       under the pointer, the act's own disc drawn for the band.
     · THE DOOR IS ITS OWN PROGRESS (2026-09-28, the components critique,
       major 11). Pressed, it keeps the file's blue and says what it is
       doing in its own title — reading the Master Price File, then opening
       Home — with the state of it in its disc: an open ring, then a check
       that lands on the kit's settle spring. It was a
       refusal until today (navy, the warning glyph, "The Master Price File
       is being read now.") with the two steps that ticked 600px away in
       the corner of the water.
   THE FLAG IS SEEN (2026-09-28, the same critique, major 7). The field
   does NOT take the caret on arrival: nothing moves while a caret is in a
   field, and an autofocused field held the flag's water on one frame from
   the first paint until the file was read, so the showpiece never moved
   on the one screen it hangs on. Now the flag drops from the rule on the
   settle spring, the name comes out of a blur, and the water flows until
   a caret arrives — on a press in the field, a Tab, or the first letter
   typed anywhere on the screen, which lands in the field as the caret
   does. While the file is read nothing flows (the pennant's note) and the
   field is read-only, so there is no caret on the page when the file
   lands and the route's crossfade and the flag's flight run.
   ============================================================ */

/**
 * THE PICTURE, BY ID. The path, the pixels, the source and the date
 * all come out of `heroes-ledger.json` under this key; the id is the
 * only thing the screen names, because a screen must name one picture
 * and `docs/CUSTOMISATION.md` layer 2 replaces exactly this string
 * from the organisation's appearance record when that panel is built
 * in Milestone 4.
 *
 * It is the board's own picture: a Stacer 481 SeaMaster at dusk, held
 * at 1771x1183, whose table `boat_stacer` is the one the panel names.
 */
const HERO_ID = 'stacer-481-seamaster'

/** Why there is no password field — said in the words a dealership uses,
 *  never the plan's. It ended "Each person gets a sign-in of their own once
 *  quotes are kept online" until 2026-09-24: a promise of a sign-in and an
 *  online store no screen has (built-critique-m2-close-2.md, major 4). It
 *  says what is true today and nothing after it. */
export const NO_PASSWORD =
  'Nothing typed here is checked against anything, and the name stays on this computer.'

/** What the file's pairing tables are, in the dealer's words: "fitment
 *  joins" is the packer's name for them. */
export const pairingsSay = (joins: number): string =>
  `${joins === 1 ? 'says' : 'say'} what fits what`

/** One named thing the app is doing, and whether it has finished.
 *  Not a bar and not a spinner: the entry sweep found no frame
 *  anywhere showing a determinate bar for a load like this, and a
 *  named step that ticks is the shape the sweep DID find
 *  (`docs/research/refs/entry/notes.md` §7). */
interface Step {
  id: 'read' | 'file'
  say: string
  done: boolean
}

/** WHAT THE DOOR SAYS ON ITS FACE, AND THE GLYPH IN ITS DISC, BY WHERE THE READ HAS GOT TO.
 *  At rest it is the way in; pressed, its title is what it is doing and its disc the state of
 *  it — an open ring, then a check — so the progress is where the press went, and never a
 *  refusal. Two faces and not one per step: measured 2026-09-28 on the built app, the read
 *  takes two seconds and putting the sheet into the app seven milliseconds, so a face for the
 *  second step was one frame of flicker between the first and the check. Every title stands in the same cell (entry.css), so the door is as tall pressed
 *  as at rest at every width. The full sentences go to a reader through the status line under
 *  the door. */
type DoorState = 'rest' | 'read' | 'landed'

const FACES = {
  rest: { title: 'Load the Master Price File', glyph: ArrowRightIcon },
  read: { title: 'Reading the Master Price File', glyph: CircleIcon },
  landed: { title: 'Opening Home', glyph: CheckIcon },
} as const satisfies Record<DoorState, { title: string; glyph: Glyph }>

const DOOR_STATES = Object.keys(FACES) as DoorState[]

function doorStateOf(busy: boolean, steps: readonly Step[]): DoorState {
  if (!busy || steps.length === 0) return 'rest'
  return steps.some((step) => !step.done) ? 'read' : 'landed'
}

export interface EntryProps {
  /** Where the door goes when the file is in. The route hands in the
   *  router's own navigation; a test hands in a spy, which is why the
   *  screen does not reach for `useNavigate` itself. */
  goHome: () => void
}

export function Entry({ goHome }: EntryProps) {
  const [facts, setFacts] = useState<EntryFacts | null>(null)
  const [unread, setUnread] = useState<Unread | null>(null)
  const [quotesHere, setQuotesHere] = useState<number | null>(null)

  /* THE NAME THIS BROWSER ALREADY REMEMBERS, if it does. Nobody
     reaches this screen with a name by accident — the route sends a
     named visitor to Home — so the only way here is `/sign-in?again`,
     which is somebody whose browser holds no copy of the file (it was
     read once and could not be kept, or the browser let it go) coming
     back for it. Asking them to type a name the app is already printing
     on Home would be a question with a known answer. Read once, as a
     starting value: the field is the person's from the first keystroke. */
  const [knownName] = useState(() => session.getState().name)
  const [name, setName] = useState(knownName ?? '')
  const [nameRefused, setNameRefused] = useState<string | null>(null)

  const [busy, setBusy] = useState(false)
  const [steps, setSteps] = useState<Step[]>([])
  const [problem, setProblem] = useState<string | null>(null)
  const [unkept, setUnkept] = useState<string | null>(null)

  const [drawn, setDrawn] = useState<{ w: number; h: number } | null>(null)
  /* THE PHOTOGRAPH FADES IN ONCE ITS BYTES HAVE LANDED, rather than a dark room becoming a
     picture in one frame — `Picture`'s own reveal (src/ui/Picture.tsx). This one is drawn by
     the screen rather than by the primitive because it carries its held and drawn pixels
     and sizes its box by them, which the primitive's `style` refusal leaves no room for. */
  const [landed, setLanded] = useState(false)

  const field = useRef<HTMLElement>(null)
  const photo = useRef<HTMLImageElement>(null)
  const askId = useId()
  const goodsId = useId()
  const refusalId = useId()
  const useLineId = useId()

  /* A LETTER TYPED ON ARRIVAL IS A NAME BEGUN (2026-09-28). The field no longer takes the caret
     when the screen opens — a caret stills the flag's water, and an autofocused field stilled it
     for the whole of the one visit this screen gets — so the keyboard is met here instead: a
     printable key pressed while nothing on the page holds focus puts the caret in the field
     before the key lands, and the letter is the name's first. A modified key, a space, Tab and
     every key while something else holds focus are left alone. */
  useEffect(() => {
    const begin = (event: globalThis.KeyboardEvent): void => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return
      if (event.key.length !== 1 || event.key.trim() === '') return
      if (event.target !== document.body && event.target !== document.documentElement) return
      field.current?.focus()
    }
    document.addEventListener('keydown', begin)
    return () => {
      document.removeEventListener('keydown', begin)
    }
  }, [])

  /* THE THREE SMALL FILES, ONCE. None of this is loading the price
     file — it is reading what the file says about itself, which is how
     the door can state what it will load before anybody presses it. */
  useEffect(() => {
    let alive = true
    readEntryFacts(HERO_ID, PACK_ORG_ID)
      .then((read) => {
        if (alive) setFacts(read)
      })
      .catch((error: unknown) => {
        if (alive) setUnread(unreadOf(error))
      })
    return () => {
      alive = false
    }
  }, [])

  /* THE EMPTY STATE IS MEASURED, NOT ASSUMED. "No quote exists" is a
     claim about this browser, so it is read out of the quote
     repository rather than written into the sentence. A quote survives
     a sheet wipe, so a person can genuinely arrive here with quotes
     already filed. */
  useEffect(() => {
    let alive = true
    repositories(PACK_ORG_ID)
      .quotes.list()
      .then((quotes) => {
        if (alive) setQuotesHere(quotes.length)
      })
      .catch(() => {
        /* a browser that will not open its own database cannot be
           asked how many quotes are in it; the line below simply does
           not make the claim */
        if (alive) setQuotesHere(null)
      })
    return () => {
      alive = false
    }
  }, [])

  /* THE PHOTOGRAPH IS NEVER DRAWN LARGER THAN ITS OWN PIXELS, and the
     photograph carries the size it IS drawn at (`data-drawn`, beside
     `data-held`), because the size depends on the window rather than on
     a board drawn at one width. `entry.css` caps the box at the
     ledger's own width and height, so the drawn size can never exceed
     them; the caption said so in the ledger's words until 2026-09-24
     and now says only where the photograph came from.

     IT IS THE PAINTED SIZE, NOT THE BOX. `object-fit: cover` scales the
     whole picture until it covers the box and the box crops what is
     left over, so the box at 834x1112 is a 1665x1112 photograph with
     831px of it outside the window. The scale is the larger of the two
     ratios — the same arithmetic the browser does — and the size
     printed is the whole picture at that scale. */
  useEffect(() => {
    const img = photo.current
    const held = facts?.hero
    if (!img || !held?.width || !held.height || typeof ResizeObserver === 'undefined') return
    const read = (): void => {
      const box = img.getBoundingClientRect()
      if (box.width <= 0 || box.height <= 0) return
      const scale = Math.max(box.width / held.width!, box.height / held.height!)
      setDrawn({ w: Math.round(held.width! * scale), h: Math.round(held.height! * scale) })
    }
    read()
    const watch = new ResizeObserver(read)
    watch.observe(img)
    return () => {
      watch.disconnect()
    }
  }, [facts])

  /** A blank name is refused with the store's own sentence, beneath the
   *  field, before anything is read, and the keyboard is put back where
   *  the work is. Nothing is remembered here: the name reaches the
   *  session store only once the file has landed (`loadTheFile`). */
  const nameIsFit = useCallback((): boolean => {
    const refused = nameRefusal(name)
    setNameRefused(refused)
    if (refused === null) return true
    field.current?.focus()
    return false
  }, [name])

  const loadTheFile = useCallback(async () => {
    if (busy || !nameIsFit()) return
    setBusy(true)
    setProblem(null)
    setUnkept(null)
    setSteps([
      { id: 'read', say: 'Reading the Master Price File', done: false },
      {
        id: 'file',
        say: facts
          ? `Putting ${figure(facts.file.tables)} lists and ${figure(facts.file.rows)} lines into the app`
          : 'Putting the lists and lines into the app',
        done: false,
      },
    ])
    try {
      const opened = await openCatalogue(repositories(PACK_ORG_ID).catalogue)
      setSteps((was) =>
        was.map((step) =>
          step.id === 'read'
            ? {
                ...step,
                done: true,
                say:
                  opened.from === 'pack'
                    ? 'The Master Price File was read'
                    : 'The sheet was already in this browser',
              }
            : step,
        ),
      )
      await catalogue.getState().load(opened.source)
      const sheet = catalogue.getState()
      if (sheet.status !== 'ready') {
        throw new Error(sheet.problem ?? 'the sheet did not arrive.')
      }
      /* READ BACK OUT OF THE STORE, not off the manifest: this is the
         one figure on the screen that says what actually landed. And it
         is the PRICE FILE's figure, as the line it finishes promised:
         a browser that has filed customers keeps their book as a table
         on the same sheet, and counting the sheet said 54 tables under
         "Putting 53 tables … into the app" (the critique of Milestone
         2's close, blocker 2). */
      const { tables, rows } = countPriceFile(sheet.tables, sheet.rows, sheet.modules)
      /* THE NAME IS GIVEN NOW, AND NOT BEFORE (2026-09-25). The file is in
         the app, so the desk this name opens has Northside's file on it. A
         name given before the read would outlive a read that failed, and
         the next visit would open Home on no file at all. */
      session.getState().signIn(name)
      setSteps((was) =>
        was.map((step) =>
          step.id === 'file'
            ? {
                ...step,
                done: true,
                say: `${figure(tables)} lists and ${figure(rows)} lines are in the app`,
              }
            : step,
        ),
      )
      if (opened.unkept) {
        /* THE FILE IS LOADED AND IT IS NOT FILED. Two different
           promises, and the second one broke: the app works, the next
           visit simply reads the file again. Saying so is worth one
           more press. */
        setUnkept(opened.unkept)
        setBusy(false)
        return
      }
      /* THE CHECK LANDS BEFORE THE DOOR OPENS: the door's disc takes its check on the settle
         spring and Home is opened once it has settled, so the last thing the door shows is
         the file in and not a press still pending. The crossfade then carries the door, check
         and all, into Home while the flag flies to the pill. */
      await new Promise((settled) => setTimeout(settled, settlesIn(RESPONSE.settle)))
      goHome()
    } catch (error: unknown) {
      setProblem(notLoadedSay(whyNotLoaded(error)))
      /* the door is the way in again, and the status line under it says nothing stale */
      setSteps([])
      setBusy(false)
    }
  }, [busy, facts, goHome, name, nameIsFit])

  /* ESCAPE. `closesStage` answers false for a keystroke typed into a
     field — rung 2 of the ladder in src/ui/keys.ts, a field owns its
     own Escape — which is precisely why clearing the name here takes
     nothing from anything above. This screen has no surface to close,
     so it binds no Escape of its own: the rung above is nobody's on
     entry. (Its one listener on the document is the first letter's,
     above, which never reads Escape.) */
  const onFieldKey = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'Escape' || closesStage(stageKeyOf(event.nativeEvent))) return
    setName('')
    setNameRefused(null)
  }

  const hero = facts?.hero
  const business = facts?.file.business ?? null
  const state = doorStateOf(busy, steps)
  const face = FACES[state]
  const landedSay = state === 'landed' ? steps.find((step) => step.id === 'file')?.say : undefined
  /* what the door loads, in the file's own counts, off the manifest */
  const holds = facts ? (
    <>
      <span className="entry-mono">{figure(facts.file.tables)}</span> lists
      {' · '}
      <span className="entry-mono">{figure(facts.file.rows)}</span> lines
      {' · '}
      <span className="entry-mono">{figure(facts.file.joins)}</span> of them{' '}
      {pairingsSay(facts.file.joins)}
    </>
  ) : unread ? (
    'What it holds could not be read yet — the sentence is below.'
  ) : (
    <>
      <span className="entry-mono">—</span> lists
      {' · '}
      <span className="entry-mono">—</span> lines · still reading what it holds
    </>
  )

  return (
    /* THE VEIL EXISTS ONLY WHERE THERE IS A PHOTOGRAPH TO VEIL. A ledger with no picture
       for this screen gets the room flat, not four washes and a scrim drawn over nothing —
       measured on that state, they darken bare ground by a third and read as a smudge in the
       corner. `data-picture` is how the stylesheet knows.
       `data-shell="none"`: THIS SCREEN STANDS WITHOUT THE PILL, and says so for the few frames
       the router draws the pill for Home before this screen has left (src/screens/shell/
       shell.css), which the crossfade then carried over the stamp. */
    <main
      className="entry"
      data-testid="entry"
      data-shell="none"
      data-picture={hero?.file ? '' : undefined}
    >
      {hero?.file ? (
        <div className="entry-ground" aria-hidden="true">
          <img
            ref={(el) => {
              photo.current = el
              /* an image already in the cache fires `load` before React has listened */
              if (el?.complete && el.naturalWidth > 0) setLanded(true)
            }}
            onLoad={() => setLanded(true)}
            className="entry-ground__photo"
            data-landed={landed ? '' : undefined}
            data-held={hero.width && hero.height ? `${hero.width}x${hero.height}` : undefined}
            data-drawn={drawn ? `${drawn.w}x${drawn.h}` : undefined}
            src={HERO_DIR + hero.file}
            width={hero.width}
            height={hero.height}
            alt=""
            /* the ledger's own pixels, handed to the stylesheet as the ceiling on
               how large the picture may ever be drawn. A ledger entry that
               recorded no pixels sets nothing and the box falls back to the
               window, which is the only case where the rule cannot be held —
               and every entry in this ledger records them. */
            style={
              hero.width && hero.height
                ? ({
                    '--hero-w': `${hero.width}px`,
                    '--hero-h': `${hero.height}px`,
                  } as CSSProperties)
                : undefined
            }
          />
          <div className="entry-ground__flat" />
          <div className="entry-ground__left" />
          <div className="entry-ground__top" />
          <div className="entry-ground__foot" />
        </div>
      ) : null}

      <div className="entry-band">
        <header className="entry-mast">
          {/* THE FLAG IS NEVER HUNG EMPTY. It carries the business's name out of the pack's
              own manifest, so until that has been read there is no name to hang — and a navy
              pennant with nothing in it is a drawing of nothing, which is what the built
              screen did when one ledger read failed (docs/directions/built-critique.md).
              While the three small files are in the air it is absent; if they cannot be read
              at all it stays absent and the note below says so. */}
          {facts ? (
            <div
              className="entry-mast__pennant"
              data-mark="flag"
              style={{ viewTransitionName: MARK_TRANSITION }}
            >
              {/* the kit's live water: the band's ground, hung as a flag, in the close swell a
                  flag needs to show water rather than a sheen (src/ui/water.ts). Decoration,
                  hidden from a reader; still under reduced motion and while a caret is in a field —
                  AND HELD ON ONE FRAME WHILE THE FILE IS READ (the kit's `still`, which redraws
                  nothing; until the verify round it was taken off the page and the band's
                  gradient stood under the name for the read). Measured 2026-09-28 on the 4-core desk that runs the gate, beside other
                  work: with the water flowing and the steps' notch turning while the file was
                  read, the door pressed by pointer stalled past 30 s on 834 wide and up (the
                  flows failed on the tablet, the laptop and the desk) and never with the caret
                  held in the field, which stills both; with both still for the read, the same
                  tests passed twice on all four large windows. A window redrawn every frame is
                  a window the browser composites every frame, in software there. Nothing on
                  this screen moves for as long as the file is being read. */}
              <Water still={busy} swell="close" />
              {facts.wordmark.mark ? (
                <img
                  className="entry-mast__mark"
                  src={facts.wordmark.mark.src}
                  alt={facts.wordmark.mark.brand}
                />
              ) : (
                facts.wordmark.lines.map((line, i) => (
                  <span
                    className="entry-mast__word"
                    data-first={i === 0 ? '' : undefined}
                    key={line}
                  >
                    {line}
                  </span>
                ))
              )}
            </div>
          ) : null}
          <div className="entry-mast__rule" />
          {facts?.wordmark.why ? <p className="entry-mast__note">{facts.wordmark.why}</p> : null}
          {unread ? (
            <p className="entry-mast__note">
              The business’s own name is in the price file’s manifest, and it could not be read:{' '}
              {unread.said} Nothing is drawn in its place.
            </p>
          ) : null}
        </header>

        {/* The right-hand column of the board: what the file is, and the row its photograph
            shows. One block, so that on a phone the two facts about the file stay together
            below the act rather than one of them sitting over the pennant. */}
        <aside className="entry-aside">
          <p className="entry-stamp">
            Master Price File
            {facts ? (
              <>
                {' · packed '}
                {auDate(facts.file.packedAt)}
                {' · '}
                <span className="entry-mono">{facts.file.fingerprint}</span>
              </>
            ) : null}
          </p>

          {/* THREE TRUE STATES, AND NOT ONE OF THEM A DASH WHERE A FACT SHOULD BE. The row
              the photograph depicts, when the ledger and the manifest both carry it; the
              picture with no row, when this file does not hold the table the ledger names;
              and no picture at all, when the ledger holds none for this screen. */}
          <section className="entry-goods" aria-labelledby={goodsId}>
            {/* THE TABLE BY ITS OWN NAME, NOT ITS KEY. This line printed
                `boat_stacer · 91 rows` until 2026-09-23 — the packer's key for
                the table, in mono, on the first screen anyone sees. The name is
                the file's too, and the count is still the manifest's. */}
            {facts?.row ? (
              <p className="entry-goods__table">
                {facts.row.table}
                {' · '}
                <span className="entry-mono">{figure(facts.row.rowCount)}</span> lines in the file
              </p>
            ) : null}
            <h2 className="entry-goods__row" id={goodsId}>
              {facts ? headingOf(facts) : 'The file’s own photograph'}
            </h2>
            <p className="entry-goods__say">
              {facts
                ? saysOf(facts)
                : unread
                  ? 'The row this photograph shows is named out of the file, and the file could not be read — the sentence is under the door.'
                  : 'What the file holds, and the row its photograph shows, are still being read.'}
            </p>
            {hero?.file && provenanceOf(hero) !== '' ? (
              <p className="entry-goods__prov">{provenanceOf(hero)}</p>
            ) : null}
          </section>
        </aside>

        <form
          className="entry-act"
          onSubmit={(event) => {
            event.preventDefault()
            void loadTheFile()
          }}
        >
          <div className="entry-ask">
            {/* THE CARD IS THE KIT'S PLATE: white, 16px round, on its own light, and what it
                holds reads the day's inks in either theme. The grid decides where it stands and
                how wide; the plate decides what it is. */}
            <Plate pad="lg">
              <h1 className="entry-ask__ask">
                <label htmlFor={askId}>Put a name to this desk.</label>
              </h1>

              <div className="entry-ask__field">
                <Input
                  ref={field}
                  id={askId}
                  name="who"
                  size="lg"
                  /* NOT autofocused (2026-09-28): a caret stills the flag, so the caret comes
                     when the person does — a press, a Tab, or the first letter typed */
                  autoComplete="name"
                  value={name}
                  /* THE NAME IS FIXED WHILE THE FILE IS READ: the one given is the one typed
                   when the door was pressed, and a read-only field puts no caret on the
                   screen, so the flag's flight and the route's crossfade run when it lands
                   (src/app/router.ts asks whether a caret is in a field). */
                  readOnly={busy}
                  onValueChange={(next) => {
                    setName(next)
                    if (nameRefused) setNameRefused(null)
                  }}
                  onKeyDown={onFieldKey}
                  aria-describedby={`${useLineId}${nameRefused ? ` ${refusalId}` : ''}`}
                />
              </div>

              {/* THE KIT'S REFUSAL, glyph and sentence, tied to the field it refuses */}
              {nameRefused ? (
                <p className="entry-ask__refused" role="alert">
                  <Refusal id={refusalId}>{nameRefused}</Refusal>
                </p>
              ) : null}

              <p className="entry-ask__use" id={useLineId}>
                It goes on every quote written here{business ? ` for ${business}` : ''}.
              </p>

              {/* WHAT IS TRUE TODAY, IN THE DEALER'S WORDS. The last sentence ended
                "…arrives with the backend at Milestone 6" until 2026-09-23: a word
                from this repository's plan, on the fourth line of the first screen
                anybody sees (critique of Milestone 2, #14). */}
              <p className="entry-ask__honest">
                <span className="entry-ask__lock" aria-hidden="true">
                  <Icon glyph={LockSimpleOpenIcon} size="md" />
                </span>
                <span>
                  <b>There is no password.</b> {NO_PASSWORD}
                </span>
              </p>
            </Plate>
          </div>

          <div className="entry-doors">
            <div className="entry-door" data-door="file" data-state={state}>
              {/* WHILE THE FILE IS READ THE DOOR IS BUSY, NOT REFUSED (2026-09-28). It keeps the
                  file's blue and says what it is doing on its own face; a second press while it
                  does it changes nothing, and the face is the sentence that says why. It was
                  `refusedBecause` until today, drawn navy under the warning glyph as if the
                  file could not be read. */}
              <Button type="submit" intent="primary" size="door" aria-busy={busy || undefined}>
                {/* THE FILE'S GLYPH, the drum the pill's Data door carries: what this door
                    opens is what that door holds */}
                <span className="entry-door__glyph" aria-hidden="true">
                  <Icon glyph={DatabaseIcon} size="lg" />
                </span>
                <span className="entry-door__says">
                  {/* EVERY TITLE IN ONE CELL, the one being said and the others held unseen
                      and unread as its measure, so the door is exactly as tall whichever it
                      says. The one being said is keyed by the step, so each fades in where the
                      last one stood. */}
                  <span className="entry-door__title">
                    {DOOR_STATES.map((each) =>
                      each === state ? (
                        <span className="entry-door__now" key={state}>
                          {face.title}
                        </span>
                      ) : (
                        <span className="entry-door__room" key={each} aria-hidden="true">
                          {FACES[each].title}
                        </span>
                      ),
                    )}
                  </span>
                  {/* what the file holds, and once it is in, the store's own count of what
                      landed, read back — with the first held as the second's measure */}
                  <span className="entry-door__sub">
                    {landedSay ? (
                      <>
                        <span className="entry-door__now">{landedSay}</span>
                        <span className="entry-door__room" aria-hidden="true">
                          {holds}
                        </span>
                      </>
                    ) : (
                      <span className="entry-door__now">{holds}</span>
                    )}
                  </span>
                </span>
                {/* THE ACT'S DISC, drawn for the band: a white disc with the arrow in the
                    accent, which nudges forward under the pointer (entry.css). Pressed, it holds
                    the read's state instead — an open ring, then a check — and each new
                    glyph lands on the settle spring. None of them turns: nothing moves for the
                    length of the read (the pennant's note says why). */}
                <span className="entry-door__go" aria-hidden="true">
                  <span className="entry-door__state" key={state}>
                    <Icon glyph={face.glyph} size="md" />
                  </span>
                </span>
              </Button>
            </div>

            {/* A NAMED STEP THAT TICKS, SAID TO A READER. The door's face is a title and a
                glyph; a screen reader is given the steps themselves, in their sentences, as
                each one is done. Drawn for nobody else: the door already shows it. */}
            <output className="entry-said">{steps.map((step) => `${step.say}.`).join(' ')}</output>

            {unread && !problem ? (
              <p className="entry-alarm" role="alert">
                <span className="entry-alarm__glyph" aria-hidden="true">
                  <Icon glyph={WarningCircleIcon} weight="fill" size="md" />
                </span>
                <span>
                  What the file holds could not be read: {unread.said} {unread.door}
                </span>
              </p>
            ) : null}

            {/* WHAT HAPPENED AND WHAT TO DO, in one sentence (`notLoadedSay`): an offline
                computer is told to go online and press again, a file missing from where the
                app keeps it is told pressing again will not find it. Never a way round the
                file. */}
            {problem ? (
              <p className="entry-alarm" role="alert">
                <span className="entry-alarm__glyph" aria-hidden="true">
                  <Icon glyph={WarningCircleIcon} weight="fill" size="md" />
                </span>
                <span>{problem}</span>
              </p>
            ) : null}

            {unkept ? (
              <div className="entry-alarm" role="alert">
                <span className="entry-alarm__glyph" aria-hidden="true">
                  <Icon glyph={WarningCircleIcon} weight="fill" size="md" />
                </span>
                <div className="entry-alarm__body">
                  <p>
                    The file was read and is in the app, but it could not be kept in this browser:{' '}
                    {unkept} The next visit reads it again. Nothing else is different.
                  </p>
                  <Button type="button" intent="veiled" icon={HouseIcon} onClick={goHome}>
                    Go on to Home
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </form>

        <p className="entry-empty">
          {quotesHere === null || quotesHere === 0
            ? 'No customer, no quote and no draft exists here yet. '
            : `${figure(quotesHere)} ${quotesHere === 1 ? 'quote is' : 'quotes are'} already in this browser, waiting on Home. `}
          {knownName
            ? 'You have been here before, so this is the door back to the file.'
            : 'You see this screen once: the next visit opens on Home.'}
        </p>
      </div>
    </main>
  )
}

/** A thrown thing as a SENTENCE: no stack, no object, and a full stop,
 *  because the reason is set inside one of ours. The browser's own
 *  "Failed to fetch" arrives without one and would run into the next
 *  sentence — the reader is being told why something did not work, and
 *  that is the worst moment to hand them a run-on. */
function sentenceOf(error: unknown): string {
  const said = (error instanceof Error ? error.message : String(error)).trim()
  return said === '' ? 'No reason was given.' : /[.!?]$/.test(said) ? said : `${said}.`
}

/** What the panel is called, which is the row when there is one, the model when the ledger
 *  names a boat this file has no table for, and the absence when there is no picture. */
function headingOf(facts: EntryFacts): string {
  if (facts.row) return `${facts.row.table} ${facts.row.model}`
  if (facts.hero) return facts.hero.model
  return 'No photograph here'
}

/** The sentence under it. The board's own line claims the boat in the picture is one of the
 *  rows the door loads; it may only be said when both halves of that claim were read. */
function saysOf(facts: EntryFacts): string {
  if (facts.noPicture) return facts.noPicture
  if (!facts.row) {
    return `This photograph is held in the image ledger, and the table it names — ${facts.hero?.table ?? 'none'} — is not in this file, so no row is named beside it.`
  }
  return 'The boat in this photograph is on those lines. Load the file and it is in the app.'
}

/** WHY THE THREE SMALL FILES COULD NOT BE READ, AND WHAT THE DOOR CAN STILL PROMISE. `said`
 *  finishes "…could not be read:" and `door` is the sentence after it. */
interface Unread {
  said: string
  door: string
}

/** THE ALARM AT REST SAYS WHAT THE DOOR WILL SAY WHEN IT IS PRESSED (the verifier's round,
 *  2026-09-25). It printed the browser's own "Failed to fetch." and "The door still works"
 *  whatever the fault, and the door reads the same manifest: offline, the door fails the
 *  same way until the computer is online, and a manifest the server says is not there is not
 *  there for the door either. A ledger that could not be read is not one the door reads, so
 *  there the door does still work, and says so. */
function unreadOf(error: unknown): Unread {
  if (error instanceof PackUnreachable) {
    return {
      said: 'this computer could not reach it.',
      door: 'Check the computer is online, then press the door: it reads the file itself.',
    }
  }
  if (
    error instanceof PackFileUnserved &&
    error.file === 'manifest.json' &&
    (error.status === 404 || error.status === 410)
  ) {
    return {
      said: sentenceOf(error),
      door: 'The door reads the same file, so pressing it will not find it either; whoever looks after this app has to put the file back.',
    }
  }
  return {
    said: sentenceOf(error),
    door: 'The door still works — pressing it reads the file itself — but it cannot say what it will load until that is fixed.',
  }
}

/** WHICH OF THE THREE FAILURES IT WAS (`NotLoaded` in ./facts), read off the loader's own
 *  kinds and nothing else. A request that never reached a server (`PackUnreachable`) is
 *  `unreachable`. A file the server answered was not there — 404, or 410 gone — is
 *  `missing`, which pressing again will not change. Anything else is said in its own words
 *  with "the door can be pressed again", which covers a server that answered 500 or 503 as
 *  well as a fault in the app's own code: until the verifier's round of 2026-09-25 any
 *  TypeError was said to be an offline computer, and a 503 a file pressing again would never
 *  find, and neither sentence was always true. */
function whyNotLoaded(error: unknown): NotLoaded {
  if (error instanceof PackUnreachable) return { kind: 'unreachable' }
  if (error instanceof PackFileUnserved && (error.status === 404 || error.status === 410)) {
    return { kind: 'missing', file: error.file }
  }
  return { kind: 'other', said: sentenceOf(error) }
}

/**
 * The caption under the panel: where the photograph came from, in one
 * line — the build's and the cascade's own form ("Photograph from
 * media.highfieldboats.com"). Until 2026-09-24 it read "Held photograph
 * 1,771 × 1,183, drawn here at 1,440 × 962, never enlarged ·
 * stacer.com.au · in the image ledger since 16 September 2026": the image
 * ledger talking, on the first screen anyone sees (the critique of
 * Milestone 2's close, #21). The pixels are still the element's, as
 * `data-held` and `data-drawn` on the photograph, so "never enlarged"
 * stays checkable. A hero with no address says nothing rather than
 * guessing one.
 */
function provenanceOf(hero: HeroEntry): string {
  const host = hostOf(hero.pageUrl)
  return host ? `Photograph from ${host}` : ''
}
