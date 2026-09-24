import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import { Button, Input, closesStage, stageKeyOf } from '@/ui'
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
  id: string
  say: string
  done: boolean
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

  const field = useRef<HTMLElement>(null)
  const photo = useRef<HTMLImageElement>(null)
  const askId = useId()
  const goodsId = useId()
  const refusalId = useId()
  const useLineId = useId()

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
      goHome()
    } catch (error: unknown) {
      setProblem(notLoadedSay(whyNotLoaded(error)))
      setBusy(false)
    }
  }, [busy, facts, goHome, name, nameIsFit])

  /* ESCAPE. `closesStage` answers false for a keystroke typed into a
     field — rung 2 of the ladder in src/ui/keys.ts, a field owns its
     own Escape — which is precisely why clearing the name here takes
     nothing from anything above. This screen has no surface to close,
     so it binds no window listener at all: the rung above is nobody's
     on entry. */
  const onFieldKey = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'Escape' || closesStage(stageKeyOf(event.nativeEvent))) return
    setName('')
    setNameRefused(null)
  }

  const hero = facts?.hero
  const business = facts?.file.business ?? null
  const refusedWhileReading = busy ? 'The Master Price File is being read now.' : undefined

  return (
    /* THE VEIL EXISTS ONLY WHERE THERE IS A PHOTOGRAPH TO VEIL. A ledger with no picture
       for this screen gets the room flat, not four washes and a scrim drawn over nothing —
       measured on that state, they darken bare ground by a third and read as a smudge in the
       corner. `data-picture` is how the stylesheet knows. */
    <main className="entry" data-testid="entry" data-picture={hero?.file ? '' : undefined}>
      {hero?.file ? (
        <div className="entry-ground" aria-hidden="true">
          <img
            ref={photo}
            className="entry-ground__photo"
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
            <div className="entry-mast__pennant">
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
            <h1 className="entry-ask__ask">
              <label htmlFor={askId}>Put a name to this desk.</label>
            </h1>

            <div className="entry-ask__field">
              <Input
                ref={field}
                id={askId}
                name="who"
                size="lg"
                autoFocus
                autoComplete="name"
                value={name}
                onValueChange={(next) => {
                  setName(next)
                  if (nameRefused) setNameRefused(null)
                }}
                onKeyDown={onFieldKey}
                aria-describedby={`${useLineId}${nameRefused ? ` ${refusalId}` : ''}`}
              />
            </div>

            {nameRefused ? (
              <p className="entry-ask__refused" id={refusalId} role="alert">
                {nameRefused}
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
              <b>There is no password.</b> {NO_PASSWORD}
            </p>
          </div>

          <div className="entry-doors">
            <div className="entry-door" data-door="file">
              <Button
                type="submit"
                intent="primary"
                size="door"
                refusedBecause={refusedWhileReading}
              >
                <span className="entry-door__says">
                  <span className="entry-door__title">Load the Master Price File</span>
                  <span className="entry-door__sub">
                    {facts ? (
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
                    )}
                  </span>
                </span>
                <span className="entry-door__arrow" aria-hidden="true">
                  →
                </span>
              </Button>
            </div>

            {steps.length > 0 ? (
              <ul className="entry-steps" aria-live="polite">
                {steps.map((step) => (
                  <li
                    className="entry-steps__step"
                    data-done={step.done ? '' : undefined}
                    key={step.id}
                  >
                    <span className="entry-steps__tick" aria-hidden="true">
                      {step.done ? '✓' : '·'}
                    </span>
                    {step.say}
                  </li>
                ))}
              </ul>
            ) : null}

            {unread && !problem ? (
              <p className="entry-alarm" role="alert">
                What the file holds could not be read: {unread.said} {unread.door}
              </p>
            ) : null}

            {/* WHAT HAPPENED AND WHAT TO DO, in one sentence (`notLoadedSay`): an offline
                computer is told to go online and press again, a file missing from where the
                app keeps it is told pressing again will not find it. Never a way round the
                file. */}
            {problem ? (
              <p className="entry-alarm" role="alert">
                {problem}
              </p>
            ) : null}

            {unkept ? (
              <div className="entry-alarm" role="alert">
                <p>
                  The file was read and is in the app, but it could not be kept in this browser:{' '}
                  {unkept} The next visit reads it again. Nothing else is different.
                </p>
                <Button type="button" intent="veiled" onClick={goHome}>
                  Go on to Home
                </Button>
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
