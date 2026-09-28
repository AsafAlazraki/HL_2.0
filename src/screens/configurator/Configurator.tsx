import {
  createRef,
  useCallback,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react'
import {
  ArrowsInSimpleIcon,
  ArrowsLeftRightIcon,
  ArrowsOutSimpleIcon,
  CaretDownIcon,
  CheckIcon,
  CoinsIcon,
  CopyIcon,
  FileTextIcon,
  FlagCheckeredIcon,
  FolderOpenIcon,
  InfoIcon,
  LockSimpleIcon,
  MagnifyingGlassIcon,
  PaperPlaneTiltIcon,
  PencilSimpleIcon,
  StackIcon,
  TagIcon,
  UserCheckIcon,
  UserIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react'
import {
  Button,
  Field,
  Figure,
  Icon,
  Input,
  Kbd,
  KindMark,
  OptionTile,
  PriceFigure,
  RESPONSE,
  Swatches,
  Tile,
  caretInField,
  isField,
  reducedMotion,
  settlesIn,
  transition,
  undo,
  unsay,
  useStill,
  type Glyph,
} from '@/ui'
import { useChapterProgress, useSmoothScroll } from '@/ui/scroll'
import type { TableKind } from '@/domain/model'
import { boatOfQuote, measured } from '@/domain/quote/spoken'
import { chapterToOpen } from '@/domain/quote/opening'
import { useCatalogue, useQuotes, useSession } from '@/app/useStores'
import { NO_WAYS, type Way } from '@/app/ways'
import { useSetScope } from '@/screens/shell/scope'
import { quotes as quotesStore } from '@/state/quotes'
import { ctxFrom } from '@/state/catalogue'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { makeCtx, type CatalogueCtx, type QuoteDef } from '@/domain/model'
import { money } from '@/domain/money'
import {
  ISSUED_REFUSAL,
  addLine,
  issue,
  lineAmount,
  newVersionOf,
  referenceForNow,
  refinish,
  removeLine,
  setCustomer,
  setOverride,
  signedMoney,
} from '@/domain/quote'
import {
  HULL_PRICE_REASON,
  hullHasNoPrice,
  hullPriceOf,
  readHullPrice,
} from '@/domain/quote/nought'
import type { ShownFact } from '@/domain/quote/distinguish'
/* THE TWO WAYS A CHAPTER HAS NO SUBTOTAL, each in the words of the
   screen that already says it: a chapter with nothing on it is the
   register's "Nothing on it yet", and a chapter whose lines carry no
   figure is what the customer's paper prints on each of those lines,
   "Not priced on this quote" — the cascade reads the same word
   (built-critique-m2-close-2.md blocker 3: the build said "Not priced
   yet", the cascade "Standard" and the paper "Not priced on this quote"
   for one rigging kit). */
import { NOTHING_ON_IT } from '@/domain/quote/register'
import { NOT_PRICED_ON_PAPER } from '@/screens/document/paper'
import {
  matchesFinish,
  readRail,
  type Act,
  type Chapter,
  type ChapterTable,
  type OptionRow,
  type Rail,
} from './chapters'
import type { Finish, Finishes } from './finishes'
import { hostOf, hullHero, stageArt, type StageArt } from './stage'
import { kindOfAct, kindOfBoat, wayBack, type Step } from './step'
import { GivenSeal, readyTheStamp } from './GivenSeal'
import {
  LEVEL_SAY,
  NO_LEVEL_SAY,
  allSay,
  choiceSay,
  countsCounted,
  levelCountSay,
  pictureSays,
  reasonSay,
  savedSay,
  searchSay,
  sourcesSay,
  totalCounted,
  unpricedSay,
  type Counted,
} from './say'
/* THE ADDRESS GRAMMAR OF A CASCADE, from the screen that owns it.
   This is the one import in this file that reaches into another
   screen and it is two pure functions rather than a component: the
   screen that RAISES a decision and the screen that READS it must not
   be able to spell the same `fix` two ways, and a constant in one
   place is the only thing that makes that true. */
import { finishFix, levelFix } from '@/screens/cascade/proposal'
import { boatTravel, levelGlyph, specGlyphs } from './glyphs'
import './configurator.css'

/* ============================================================
   THE CONFIGURATOR — "Stage and rail", direction B of
   docs/research/refs/configurator/notes.md §5.

   THE OWNER HANDED THE PICKS OVER, so the direction is chosen here
   and the screen is marked PROVISIONAL in docs/SCREENS.md until he
   has looked at it.

   WHY B AND NOT THE OTHER THREE. The only instruction the owner has
   ever given about this screen is "More like Porsche the right side,
   not less. STUDY IT.", and B is the only direction that IS the
   Porsche right side: one rail whose FIRST element is a search over
   every pairing on the quote, then a card per chapter, four row
   shapes for four kinds of content, the delta in the head. A is a
   flat register with no stage — the shape the owner has already
   called a database twice. C is strictly sequential, which is a
   brochure's flow and not a dealer's: a salesperson with a customer
   at the desk jumps to the chapter being argued about. D makes the
   document the configurator, which is the best idea in the sweep and
   belongs to the DOCUMENT screen, where the same table is the thing
   itself rather than a picture of it.

   And the second reason is measured. This chapter has to reach 588
   hull rows and a 2,937-row parts table; B is the one direction that
   reaches either without a second screen.

   THE TWO FRAMES NO EARLIER BOARD USED: `deep/porsche-search-open.png`
   — a field above the chapters turning the whole panel into grouped,
   priced, tickable rows with no mode change — and `premium/
   pcpartpicker-list.png`, a build as a priced table with a warning
   banner that names the problem in words and DISABLES NOT ONE ROW.
   Entry's boards leaned on Riviera, Zodiac and Lucid; Home's on
   Rapha, Sotheby's and Hagerty; the picker's on Williams and Surtees.

   WHAT THIS SCREEN DOES THAT NO OTHER DOES: it is the only one where
   a press changes a document. Everything else in this app reads.

   ── WHAT IS TRUE HERE AND IS NOT TRUE ON A FRAME ──────────────

   · THE CHAPTERS ARE NOT RADIO GROUPS. Whaler's engine chapter
     prices the 25hp at −$853 against the fitted 40hp because it is
     a radio group. Our sections hold as many lines as a dealer puts
     on them — `Highfield ADV7` slots 4–9 are six pairings of the
     same motor told apart by six rigging kits — so the delta on
     every row is what the PRESS does: plus to put it on, minus to
     take it off. `chapters.ts` argues it in full.
   · THE STAGE DOES NOT ANSWER THE RAIL. The pack holds one picture
     per model, so the stage shows the hull and moves only when the
     hull does. Promising otherwise would be promising a render
     pipeline that does not exist (the sweep's §6).
   · THE RUNG IS A FACT, NOT A SWITCH. Moving a whole quote between
     Cash and Trade re-prices every line, and what that costs line by
     line is the CASCADE SHEET — screen 5 of this milestone, with its
     own sweep and its own directions. `levelConflict` in the engine
     is ready for it. So this screen prints which rung the document
     is on and says where the switch will live.
   · THE UNDO IS IN THE KIT'S TOAST, AND THE ROW IS THE OTHER WAY
     BACK. Until 2026-09-28 the last step stood in the rail's head, a
     line that pushed the chapters down under every press and, in a
     hand, landed above the window. It is the plan's toast with UNDO
     now: in the corner, over nothing the press needs, held while a
     pointer or the caret is on it (Alt T takes the caret there and
     gives it back), and offered only when it can work (`step.ts`).
     A toast that leaves after eight seconds takes no way back with
     it: every pick on this screen is a press that says whether it is
     on the quote, and pressing it again is its way back.
   ============================================================ */

/** WHERE THE ACT OF SELLING LEADS, AND IT IS NOW A PLACE.
 *
 *  This used to be a refusal — "the document is the next screen of
 *  this milestone and it is not built yet, so nothing was opened" —
 *  printed permanently under `Give it to the customer`, so issuing a
 *  quote correctly left a dealer on a read-only screen whose only
 *  onward control was `Make a new version`. The document is built, at
 *  `/quote/$id/document`, so the refusal is retired the way the
 *  picker's and the cascade's were: by having built the thing. */
export const DOCUMENT_SAY =
  'The printed quote opens from here the moment it is given — on A4, exactly as it stands, ready to print.'

/** Said where the press would have happened, on a host that handed
 *  this screen no way to open one. A test renders it with no router. */
export const NO_DOCUMENT_HERE =
  'Nothing on this page can open the document, because this screen was given no way to. The quote is written and kept in this browser either way.'

/** WHAT MOVING THE RUNG DOES, AND WHERE IT IS DECIDED. This used to
 *  be a refusal — "the sheet that shows what that costs line by line
 *  is not built yet" — and it is retired the way the picker's was, by
 *  having built the thing. The sheet is `/quote/$id/cascade`, its own
 *  address, and nothing is written to the document until it is
 *  accepted there. */
export const CASCADE_SAY = LEVEL_SAY

export interface ConfiguratorProps {
  /** which document this is */
  quoteId: string
  /** WHICH CHAPTER IS OPEN, which is a position and therefore a URL
   *  search param (CLAUDE.md). Back, a refresh and a shared link all
   *  land on the same chapter — and the sweep's own warning is that
   *  a chapter address that dies is one of the failures it counted
   *  (`deep/porsche-911-packages.png`). '' opens the first chapter
   *  with something still to decide. */
  at?: string
  /** where a press writes the new position. A test hands in a spy,
   *  which is why this screen never reaches for the router. */
  goTo?: (chapterId: string) => void
  /** whose file this is, read off the store by the route */
  business?: string | null
  /** the way back to the door, for a desk with no price file in it */
  openTheFile?: () => void
  /** where a new version of an issued quote opens */
  openQuote?: (quoteId: string) => void
  /** where the thing you hand the customer opens — the frozen
   *  document at its own address. This is the onward route from the
   *  one irreversible act on this screen. */
  openDocument?: (quoteId: string) => void
  /** WHERE A DECISION THAT CHANGES WHAT IS ALREADY CHOSEN IS TAKEN.
   *  `fix` names the pick; `from` is the chapter it was raised in, so
   *  declining lands back on this chapter. Nothing is written here
   *  when this is called — the cascade owns the act. */
  goCascade?: (fix: string, from: string) => void
  /**
   * WHERE ELSE THIS APP HAS A SCREEN, as real addresses — the list is
   * `src/app/ways.ts`'s and the route hands it down. It is drawn in one
   * place only: the state this screen shows when no quote is filed at
   * the address somebody opened. Measured 2026-09-18 at
   * `/quote/<unknown-id>`, that state was one honest sentence with zero
   * controls on it — a dead end rather than a wrong answer, but a dead
   * end, and the one a shared link to another computer's quote lands on.
   */
  ways?: readonly Way[]
  /** follow one without a page load; without it they are still links
   *  and the browser follows them itself */
  go?: (href: string) => void
  /** the clock, injected so a test can say which instant it means */
  now?: () => Date
}

/**
 * ONE DOCUMENT, ONE SCREEN. The route draws this screen for every
 * `/quote/$id`, and the router keeps the same instance when only the
 * id moves — which is exactly what `Make a new version` does. Measured
 * 2026-09-24 on the dev server: the new draft 20260924-02 opened under
 * "20260924-01 is issued · Undo" and the old quote's refusal, and its
 * Undo answered "There is nothing to go back to on this quote." What
 * the rail's head says, the refusal under it, the search and the
 * opened lists all belong to one document, so a new document starts a
 * new screen.
 */
export function Configurator(props: ConfiguratorProps) {
  return <Build key={props.quoteId} {...props} />
}

function Build({
  quoteId,
  at = '',
  goTo,
  business = null,
  openTheFile,
  openQuote,
  openDocument,
  goCascade,
  ways = NO_WAYS,
  go,
  now,
}: ConfiguratorProps) {
  const sheet = useCatalogue((s) => s)
  const filed = useQuotes((s) => s.quotes)
  const read = useQuotes((s) => s.loaded)
  const kept = useQuotes((s) => s.problem)
  const who = useSession((s) => s.name)

  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState<ReadonlySet<string>>(() => new Set())
  const [step, setStep] = useState<Step | null>(null)
  const [refused, setRefused] = useState<string | null>(null)
  const field = useRef<HTMLElement>(null)
  const standsStill = useStandsStill(`${step?.eventId ?? ''} ${refused ?? ''}`)
  const { hold } = standsStill

  /* THE MASTHEAD'S OWN HEIGHT, MEASURED, so the two things that stick
     under it stick UNDER it.

     The search field and the stage were pinned at a typed 112px. The
     masthead is as tall as its content and as the pill's clearance
     (`--shell-inset`, a floor under its head) — and when the shell
     arrived it grew to 144.69px at 1280, 1440 and 1920, so the field
     ran 32.69px up behind it and the stage's photograph lost its top
     third of an inch the moment the page moved
     (built-critique-m2.md #8). A number typed into a stylesheet cannot
     follow a head that also grows a line when a quote is issued and
     wraps a long business name, so the head is measured where it is
     drawn and the measure is handed to the stylesheet as
     `--cfg-mast`. Without a ResizeObserver (a test's DOM) the
     stylesheet's own floor stands. */
  const [mastHeight, setMastHeight] = useState<number | null>(null)
  const measureMast = useCallback((node: HTMLElement | null) => {
    if (!node || typeof ResizeObserver === 'undefined') return
    const measure = (): void => {
      const height = Math.ceil(node.getBoundingClientRect().height)
      if (height > 0) setMastHeight(height)
    }
    measure()
    const watch = new ResizeObserver(measure)
    watch.observe(node)
    return () => {
      watch.disconnect()
    }
  }, [])

  const quote = filed.find((q) => q.id === quoteId)
  const open = sheet.status === 'ready' && Object.keys(sheet.tables).length > 0

  /* THE SHEET BECOMES A CONTEXT ONCE, AND NOT ONCE PER KEYSTROKE.
     `viewForQuote` rebuilds the page a quote was raised from when
     the stored view has not survived a reload, and files it into
     `ctx.views` — so the map handed over is a COPY and the catalogue
     store is never quietly mutated (the picker's `mint.ts` says the
     same). The quotes are deliberately NOT a dependency: a keystroke
     in the customer's name writes a document, and rebuilding the
     whole context for it would re-derive a view page per letter. */
  const ctx = useMemo(
    () => makeCtx({ ...ctxFrom(sheet), views: { ...sheet.views }, orgId: PACK_ORG_ID }),
    [sheet],
  )

  /* EVERY PICK ON THIS SCREEN COMES THROUGH HERE, so there is one
     place a refusal is caught and one place the way back is pinned.
     The store returns the engine's own sentence and the event the
     command minted; nothing is phrased here. */
  const press = useCallback(
    (act: Act) => {
      const command =
        act.do === 'add'
          ? addLine(act.blockId, act.line)
          : act.do === 'remove'
            ? removeLine(act.lineId)
            : refinish(ctx, act.rowId)
      /* the kind is read off the document as it stood before the write, where the line
         being taken off is still filed under its chapter */
      const was = quotesStore.getState().quotes.find((q) => q.id === quoteId)
      const outcome = quotesStore.getState().apply(quoteId, command)
      if ('refused' in outcome) {
        setRefused(outcome.refused === '' ? null : outcome.refused)
        return
      }
      setRefused(null)
      setStep({
        said: outcome.said,
        eventId: outcome.event.id,
        wasUndo: false,
        kind: was ? kindOfAct(act, was) : undefined,
      })
    },
    [ctx, quoteId],
  )

  /* THE WAY BACK FROM ONE STEP, pinned to that step: the toast that offers it was raised
     for it, and a later step replaces that toast before it could be pressed. Asked of the
     document as it stands at the press, so the offer and the press read one answer. */
  const goBack = useCallback(
    (from: Step) => {
      const standing = quotesStore.getState().quotes.find((q) => q.id === quoteId)
      if (!standing || wayBack(from, standing) === null) return
      /* pressed in the toast, so what the reader is looking at in the rail is held */
      hold()
      const outcome = from.wasUndo
        ? quotesStore.getState().redo(quoteId)
        : quotesStore.getState().undo(quoteId, from.eventId)
      if ('refused' in outcome) {
        setRefused(outcome.refused === '' ? null : outcome.refused)
        return
      }
      setRefused(null)
      setStep({
        said: outcome.said,
        eventId: outcome.event.id,
        wasUndo: !from.wasUndo,
        kind: from.kind,
      })
    },
    [quoteId, hold],
  )

  /* THE LAST STEP IS SAID IN THE KIT'S TOAST, and nowhere on the page (the component
     critique, 2026-09-28, major 9). It was a line inserted above the chapters, 56px that
     pushed every chapter down under the pointer at the press — and in a hand, where the
     search does not stick, it landed above the window after a press far down the list, so
     the press was said where nobody could read it and its Undo could not be seen. The toast
     stands in the corner at a desk and over the pill in a hand, wherever the press was, and
     moves nothing on the page.

     ONE STEP, ONE TOAST: every step is raised under this document's own id, so the next
     step changes the card where it stands and a way back from a step that is no longer the
     last is never on the screen (`step.ts`). A step with no way back — giving the quote to
     the customer, the one act with none — takes the toast away: the finale's seal is where
     that moment is said. Leaving the build takes it away too, since its Undo writes to this
     document and nowhere else. */
  const stepToast = `step:${quoteId}`
  useEffect(() => {
    if (!step) return
    const standing = quotesStore.getState().quotes.find((q) => q.id === quoteId)
    const back = standing ? wayBack(step, standing) : null
    if (back === null) {
      unsay(stepToast)
      return
    }
    undo(step.said, () => goBack(step), {
      id: stepToast,
      testId: 'last-step',
      way: back,
      kind: step.kind,
    })
  }, [step, quoteId, stepToast, goBack])
  useEffect(() => () => unsay(stepToast), [stepToast])

  /* THE FIELD'S KEY IS `/`, AND IT USED TO BE CTRL K. The field IS
     the navigation on this screen — the sweep's first pattern — and it
     keeps a key of its own; what it no longer keeps is the chord the
     shell's finder answers to on all twelve screens. `/` is what every
     other find field in this app already answers to, and the finder
     opens with THIS build's chapters first, under a chip carrying the
     quote's own reference, so the two do not compete for the same
     press (`src/screens/shell/scope.tsx`).

     A KEY TYPED INTO A FIELD IS A CHARACTER — `isField` is the same
     guard the Escape ladder uses. */
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

  const rail: Rail | null = useMemo(
    () => (quote && open ? readRail(ctx, quote, { query, showAll }) : null),
    [ctx, quote, open, query, showAll],
  )

  /* THE CHAPTER THE READER IS ON: the one the address names, else the
     first thing still to do on this document — read by `chapterToOpen`
     (`src/domain/quote/opening.ts`), which also says why the hull is
     never that once the last band is answered (m2-last-critique.md,
     major 3). Read here, above the absent document's early return, so
     the hook that follows it can run on every render. */
  const here = quote
    ? chapterToOpen(rail?.chapters ?? [], {
        at,
        issued: quote.state !== 'draft',
        hullUnpriced: hullHasNoPrice(quote),
        named: quote.customer.name.trim() !== '',
      })
    : ''
  const chaptersRef = useRef<HTMLDivElement>(null)
  useOnward(chaptersRef, here, at, quote?.events.length ?? 0, rail?.searching === true)

  /* ONE REF PER CHAPTER, made once for a set of chapters, so the reading
     light's triggers are made once and killed once (`useChapterProgress`
     asks for exactly that) */
  const chapterIds = (rail?.chapters ?? []).map((c) => c.id).join(' ')
  const chapterRefs = useMemo(
    () => (chapterIds === '' ? [] : chapterIds.split(' ').map(() => createRef<HTMLElement>())),
    [chapterIds],
  )

  /* ── WHAT THE FINDER IS SCOPED TO WHILE IT IS OPEN ON THIS BUILD ──
     The chip is this document's own reference and the first group is
     this build's chapters, answered by the SAME module the field above
     answers with — `readRail`, with the finder's words instead of the
     field's. A row here is not an address (a chapter is a place inside
     one screen), so it carries `at: 'here'` and the shell hands the id
     straight back to `goTo`, which is the route's own way of opening a
     chapter. */
  const scope = useMemo(
    () =>
      quote && open
        ? {
            word: quote.reference,
            title: 'On this build',
            say: 'The chapters of the document open on this screen.',
            rows: (words: string) =>
              readRail(ctx, quote, { query: words, showAll }).chapters.map((chapter) => ({
                id: `here:${chapter.id}`,
                name: chapter.num === '' ? chapter.name : `${chapter.num} ${chapter.name}`,
                fact: chapter.fact,
                verb: 'Go to it',
                target: { at: 'here' as const, id: chapter.id },
              })),
            go: (id: string) => goTo?.(id),
          }
        : null,
    [ctx, quote, open, showAll, goTo],
  )
  useSetScope(scope)

  if (!quote) {
    return (
      <Missing
        read={read}
        status={sheet.status}
        problem={sheet.problem}
        openTheFile={openTheFile}
        ways={ways}
        go={go}
      />
    )
  }

  const issued = quote.state !== 'draft'
  const refusal = issued ? ISSUED_REFUSAL : undefined
  /* THE QUOTE WAS GIVEN ON THIS SCREEN, its step the last thing that happened: the
     one moment the finale's way on arrives rather than simply standing there */
  const justGiven =
    issued && step !== null && step.eventId === quote.events[quote.events.length - 1]?.id
  /* `here`, the chapter the reader is on, is read above the early return
     by `chapterToOpen`: a chapter id that matches nothing opens the first
     thing still to do rather than a screen with every card shut; an
     issued document opens its finale, the one chapter on it that still
     does anything; a boat with no price opens 01, where the dealer puts
     the price on it (m2-last-critique.md blocker 1); and when every band
     is answered the build moves on to the name and then the finale,
     never back to the hull (major 3). */
  const chapters = rail?.chapters ?? []

  /* RAISING A DECISION IS NOT MAKING ONE. This writes nothing: it
     navigates to the cascade with the pick in the address and the
     chapter it was raised in beside it, so declining lands back here
     and the document is untouched either way. */
  const raise = (fix: string): void => goCascade?.(fix, here)

  return (
    <main
      className="cfg"
      data-testid="configurator"
      style={
        mastHeight === null ? undefined : ({ '--cfg-mast': `${mastHeight}px` } as CSSProperties)
      }
    >
      <Mast
        head={measureMast}
        quote={quote}
        business={business}
        total={rail?.total ?? null}
        unpriced={rail?.unpriced ?? 0}
        open={open}
      />

      <div className="cfg-floor">
        <Stage
          quote={quote}
          ctx={ctx}
          open={open}
          kept={kept}
          who={who}
          rail={rail}
          raise={raise}
          refusal={refusal}
        />

        <section
          className="cfg-rail"
          aria-label="The chapters of this quote"
          onClickCapture={standsStill.note}
        >
          <div className="cfg-find">
            {/* THE KEY IS A CAP BESIDE THE LABEL, NOT A WORD IN THE FIELD.
                The placeholder read "/ — a name, a code, a rigging kit",
                which names a key on a phone that has none (rule b,
                built-critique-m2.md #18) and cannot be taken away by a
                stylesheet. `Kbd` is withdrawn under `pointer: coarse` by
                its own primitive; the field keeps only what it is for. */}
            <div className="cfg-find__top">
              <label className="cfg-find__label" htmlFor="cfg-find">
                Search every option on this quote
              </label>
              {open ? <Kbd tone="quiet">/</Kbd> : null}
            </div>
            <Input
              id="cfg-find"
              ref={field}
              type="search"
              icon={MagnifyingGlassIcon}
              value={query}
              onValueChange={setQuery}
              aria-describedby="cfg-find-said"
              placeholder={open ? 'A name, a code, a rigging kit' : 'Nothing to search'}
            />
            <p className="cfg-find__said" id="cfg-find-said">
              {searchSay(rail, open)}
            </p>

            {refused ? (
              <Said className="cfg-alarm" glyph={WarningCircleIcon} alert>
                {refused}
              </Said>
            ) : null}
          </div>

          {/* THE CHAPTERS RISE INTO PLACE ON A DRAFT'S FIRST PAINT, a few frames
              apart (configurator.css); an issued document is still from its first
              frame, because every figure on it is final. */}
          <div
            className="cfg-chapters"
            ref={chaptersRef}
            data-rise={quote.state === 'draft' ? '' : undefined}
          >
            <Reading chapters={chapterRefs} />
            {chapters.map((chapter, i) => (
              <ChapterCard
                key={chapter.id}
                at={chapterRefs[i]}
                index={i}
                chapter={chapter}
                quote={quote}
                rail={rail!}
                open={chapter.id === here}
                searching={rail?.searching === true}
                query={query}
                onOpen={() => goTo?.(chapter.id)}
                onPress={press}
                onRaise={raise}
                onShowAll={(id) =>
                  setShowAll((was) => {
                    const next = new Set(was)
                    if (next.has(id)) next.delete(id)
                    else next.add(id)
                    return next
                  })
                }
                refusal={refusal}
                quoteId={quoteId}
                openQuote={openQuote}
                openDocument={openDocument}
                now={now}
                justGiven={justGiven}
                setStep={setStep}
                setRefused={setRefused}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

/* ---------------------------------------------------------- */
/* Moving on                                                   */
/* ---------------------------------------------------------- */

/**
 * A WRITE THAT MOVES THE OPEN CHAPTER ON BRINGS THE NEXT ONE TO THE HAND.
 *
 * With no `?at=`, the open chapter is `chapterToOpen`'s reading of the
 * document, so the press that answers the last empty band moves it on:
 * the motor goes on, 02 Motor folds to the answer its head now states,
 * and Who it is for opens. MEASURED 2026-09-24 on the ADV7 before this,
 * at 834 × 1112: the motor was pressed at y 1,002 of a 1,112 window and
 * whatever opened next opened below the fold — the picker's tablet
 * blocker again, "pressing does nothing" — and the pressed tile, gone
 * with its folded list, left the keyboard's focus on the page's body at
 * every size.
 *
 * So, only when a write (the diary grew) moved the open chapter while
 * the address names none and no search is running:
 *  · the chapter now open is brought into the window by the least move
 *    that shows it, its head clear of whatever sticks over the top
 *    (measured where it sticks and written as `--cfg-cover`) and its
 *    foot clear of the phone's tab bar (`configurator.css`) — smoothly,
 *    and at once under reduced motion. A chapter taller than that room
 *    is brought in by its HEAD: the least move alone lined the finale's
 *    foot up with the window at 844 × 390 and left its head under the
 *    masthead (measured 2026-09-24), and the head is what says where the
 *    reader now is;
 *  · and where the press left the focus nowhere, it goes to that
 *    chapter's head, which names the chapter and says it is open.
 * A press inside a chapter the dealer opened himself moves nothing: the
 * address names it, so it stays open under every press.
 */
function useOnward(
  rail: RefObject<HTMLDivElement | null>,
  here: string,
  at: string,
  written: number,
  searching: boolean,
): void {
  const was = useRef({ here, written })
  /* THE MOVE WAITING FOR ITS CHAPTER TO OPEN. It is kept outside the effect
     below and cancelled only by the next move or by leaving the screen: the
     same press re-renders the build again before the chapter has opened (the
     quote is written, then filed), and an effect that cancelled its own move
     on every re-render never moved at all — measured at 390 × 844, the
     window stood at 0 with Who it is for at 881. */
  const pending = useRef<number | null>(null)
  useEffect(
    () => () => {
      if (pending.current !== null) window.clearTimeout(pending.current)
    },
    [],
  )
  useEffect(() => {
    const before = was.current
    was.current = { here, written }
    if (at !== '' || searching || here === '') return
    if (before.here === '' || before.here === here || before.written === written) return
    const chapter = rail.current?.querySelector<HTMLElement>(`[data-chapter="${here}"]`)
    if (!chapter) return
    const head = chapter.querySelector<HTMLElement>('.cfg-head__press')
    const focus = document.activeElement
    /* THE PRESSED CONTROL IS FOLDING AWAY WITH ITS CHAPTER. Since the kit, a
       chapter's body closes on a spring rather than in one frame, so for a
       moment the control that was pressed is still in the page, inside a
       chapter that is no longer the open one — and it would take the focus
       down with it to the page's body when it goes. Focus inside another
       chapter is focus that is leaving. */
    const leaving = focus?.closest('[data-chapter]')
    if (
      head &&
      (focus === null || focus === document.body || (leaving != null && leaving !== chapter))
    )
      head.focus({ preventScroll: true })
    chapter.style.setProperty('--cfg-cover', `${coverOf(chapter)}px`)
    if (typeof chapter.scrollIntoView !== 'function') return
    const bring = (): void => {
      const margins = getComputedStyle(chapter)
      const room =
        window.innerHeight -
        (Number.parseFloat(margins.scrollMarginBlockStart) || 0) -
        (Number.parseFloat(margins.scrollMarginBlockEnd) || 0)
      chapter.scrollIntoView({
        block: chapter.getBoundingClientRect().height > room ? 'start' : 'nearest',
        behavior: reducedMotion() ? 'instant' : 'smooth',
      })
    }
    /* THE CHAPTER IS BROUGHT IN ONCE IT HAS OPENED (the component kit,
       2026-09-28). Its body now grows out of its head on the travel spring,
       so measured the moment it is pressed the chapter is a head and no
       more, and the least move would stop short of its act. Where it opens
       at once — reduced motion, a caret in a field — it is brought in as
       soon as the chapter it folded away has left the page (`LEAVES_MS`):
       brought in at once, it was measured with that chapter's body still in
       the page, and the page moved 556px under it when the body went
       (measured at 390 × 844 under reduced motion). The move waiting from an
       earlier press is the wrong move now, and is dropped. */
    const quiet = reducedMotion() || caretInField()
    if (pending.current !== null) window.clearTimeout(pending.current)
    pending.current = window.setTimeout(
      () => {
        pending.current = null
        bring()
      },
      quiet ? LEAVES_MS : settlesIn(RESPONSE.travel),
    )
  }, [rail, here, at, written, searching])
}

/** How long a folded chapter's body takes to leave the page where it folds
 *  at once: its exit is immediate, and motion takes it out a frame or two
 *  later. */
const LEAVES_MS = 100

/**
 * WHAT WAS PRESSED STAYS UNDER THE FINGER (the component critique, 2026-09-28,
 * majors 8 and 9).
 *
 * A press writes the document, and the write can say so ABOVE the press: a
 * second motor adds the engine's "2 lines from Yamaha Outboards…" over its
 * list, a refusal lands under the search field, and giving the quote grew the
 * masthead a row. (The step line landed under the field too, until it became
 * the kit's toast, major 9.) Measured on the Stacer 519 at 1440 × 900 before this:
 * pressing the F115LB moved the hull's head from y 307 to 363 and the pressed
 * tile from 699 to 825, under the pointer; the critic measured "Give it to the
 * customer" dropping the page 28px. The browser's own scroll anchoring cannot
 * help at the top of a page, which is where a build is first worked. After:
 * the F115LB from 751.0 to 750.6, and the finale's head still across the give.
 *
 * So the rail notes what a press landed on, and once the write has been drawn —
 * before the frame is painted — the page is moved by exactly what that thing
 * moved: the pressed control where it is still on the page, else its chapter
 * (the finale's act becomes a different act when the quote is given). It is a
 * scroll of the window by a measured distance, not an animation, so it holds
 * under reduced motion and under a caret; the sentence above still arrives,
 * and at a desk, where the search field sticks, it is still in view. A note
 * from a press that wrote nothing is dropped at the next frame, so it can
 * never move the page for a later write. `written` is what the screen says
 * about its last write — the step's event and a refusal — and changes with
 * every one.
 *
 * A WRITE FROM OUTSIDE THE RAIL HOLDS WHAT THE READER IS LOOKING AT. The step's
 * Undo is pressed in the toast, and taking a second motor back takes the
 * engine's sentence away from over the list: measured at 1440 × 900 on the
 * Highfield Sport 660, the list rose 70px under the reader, and 118px at
 * 390 × 844. `hold` notes the control the step was pressed on, where it is
 * still in the window, else the option nearest the middle of what the window
 * shows under the bars that stick, and the same measure keeps it there. The
 * first control under the bars, and at 834 × 1112 the control nearest the
 * middle, was the chapter's own head, above the sentence, and held nothing.
 */
function useStandsStill(written: string): {
  note: (event: ReactMouseEvent) => void
  hold: () => void
} {
  const pressed = useRef<{
    control: Element
    chapter: Element | null
    at: number
    chapterAt: number
  } | null>(null)

  const remember = useCallback((control: Element) => {
    const chapter = control.closest('[data-chapter]')
    pressed.current = {
      control,
      chapter,
      at: control.getBoundingClientRect().top,
      chapterAt: chapter?.getBoundingClientRect().top ?? 0,
    }
    const noted = pressed.current
    requestAnimationFrame(() => {
      if (pressed.current === noted) pressed.current = null
    })
  }, [])

  /* the last control pressed in the rail, kept past its frame: the one a toast's Undo is about */
  const last = useRef<Element | null>(null)
  const note = useCallback(
    (event: ReactMouseEvent) => {
      const control = event.target instanceof Element ? event.target.closest('button') : null
      if (!control) return
      last.current = control
      remember(control)
    },
    [remember],
  )

  const hold = useCallback(() => {
    const rail = document.querySelector<HTMLElement>('[data-testid="configurator"] .cfg-chapters')
    if (!rail) return
    const cover = coverOf(rail)
    const shown = (control: Element): boolean => {
      const { top } = control.getBoundingClientRect()
      return top >= cover && top < window.innerHeight
    }
    const own = last.current
    if (own?.isConnected && rail.contains(own) && shown(own)) {
      remember(own)
      return
    }
    const middle = (cover + window.innerHeight) / 2
    let seen: Element | null = null
    let off = Infinity
    for (const control of rail.querySelectorAll('button[aria-pressed]')) {
      if (!shown(control)) continue
      const { top, bottom } = control.getBoundingClientRect()
      const from = Math.abs((top + bottom) / 2 - middle)
      if (from < off) {
        seen = control
        off = from
      }
    }
    if (seen) remember(seen)
  }, [remember])

  const drawn = useRef(written)
  useLayoutEffect(() => {
    if (drawn.current === written) return
    drawn.current = written
    const was = pressed.current
    pressed.current = null
    if (!was) return
    const moved = was.control.isConnected
      ? was.control.getBoundingClientRect().top - was.at
      : was.chapter?.isConnected
        ? was.chapter.getBoundingClientRect().top - was.chapterAt
        : 0
    if (Math.abs(moved) >= 1) window.scrollBy({ top: moved, behavior: 'instant' })
  }, [written])

  return { note, hold }
}

/** How far down the window the bars that stick over this screen reach,
 *  each read where it sticks: its own offset from the top plus its
 *  height. Below 1200 only the masthead sticks; at a desk the search
 *  field sticks under it. */
function coverOf(chapter: HTMLElement): number {
  let cover = 0
  for (const bar of chapter
    .closest('.cfg')
    ?.querySelectorAll<HTMLElement>('.cfg-mast, .cfg-find') ?? []) {
    const style = getComputedStyle(bar)
    if (style.position !== 'sticky') continue
    cover = Math.max(
      cover,
      (Number.parseFloat(style.top) || 0) + bar.getBoundingClientRect().height,
    )
  }
  return Math.ceil(cover)
}

/* ---------------------------------------------------------- */
/* No document at this address                                 */
/* ---------------------------------------------------------- */

/**
 * THREE DIFFERENT ABSENCES AND ONLY ONE OF THEM IS AN ERROR. A
 * browser still reading its own database has not yet failed to find
 * anything; a browser that read it and found nothing has; and a
 * database that would not open is a third thing with its own
 * sentence. The picker's blank state records measuring exactly this
 * and saying the opposite of what it was about to say.
 */
function Missing({
  read,
  status,
  problem,
  openTheFile,
  ways,
  go,
}: {
  read: boolean
  status: string
  problem: string | null
  openTheFile?: () => void
  ways: readonly Way[]
  go?: (href: string) => void
}) {
  return (
    <main className="cfg cfg--blank" data-testid="configurator">
      <section className="cfg-blank" aria-label="No quote here">
        {problem !== null ? (
          <p className="cfg-blank__say" role="alert">
            The quotes in this browser could not be read. {problem}
          </p>
        ) : !read ? (
          <p className="cfg-blank__say">Reading what this browser has kept…</p>
        ) : (
          /* IN THE DEALER'S WORDS, WHAT IS TRUE TODAY. This ended "that
             arrives with the backend at Milestone 6" — a word from this
             repository's plan, shown to a dealership (rule c,
             built-critique-m2.md #14). What a person at this desk needs
             is where their quote is, not when the plan says it moves. */
          <p className="cfg-blank__say">
            <b>No quote is filed at this address in this browser.</b> A quote is kept in the browser
            it was written in, so a link to one opens only on the computer that wrote it.
          </p>
        )}
        {read && status !== 'ready' && openTheFile ? (
          <Button intent="veiled" icon={FolderOpenIcon} onClick={openTheFile}>
            Load the Master Price File
          </Button>
        ) : null}
        {/* AND A WAY OUT OF IT. That control appears only on a desk whose
            price file is shut, so on a desk with the file open this
            state was a paragraph in an empty window with nothing on it
            to press — measured at `/quote/<unknown-id>` on 2026-09-18.
            They are links, so the address can be corrected and tried
            again in the same tab or a new one. */}
        {ways.length > 0 ? (
          <nav className="cfg-blank__ways" aria-label="Elsewhere in this app">
            {ways.map((way) => (
              <Button
                key={way.href}
                intent="veiled"
                size="sm"
                href={way.href}
                onClick={
                  go
                    ? () => {
                        go(way.href)
                      }
                    : undefined
                }
              >
                {way.title}
              </Button>
            ))}
          </nav>
        ) : null}
      </section>
    </main>
  )
}

/* ---------------------------------------------------------- */
/* The masthead: what it is, and what it comes to               */
/* ---------------------------------------------------------- */

/**
 * THE RUNNING PRICE IS ALWAYS VISIBLE AND IT NEVER COUNTS UP.
 *
 * It is here and in no second place, which is a decision rather than
 * an omission. Four surfaces within a screen's width each owe ONE
 * fact (`bands.ts` counts the same defect and removes it): the
 * masthead owes the total, a chapter head owes its own subtotal, a
 * row owes what the press would move the total BY, and the finale
 * owes the arithmetic. Printing the total twice would make two of
 * those the same sentence.
 *
 * It is `PriceFigure` and never `Figure`: NumberFlow moves a figure
 * digit by digit when it changes, and a price that animates reads as
 * a price still being decided, with a customer watching.
 *
 * AND IT IS AT THE TOP RATHER THAN THE FOOT. Axopar puts its
 * configuration price in a pill beside the pager at the foot of the
 * window; the owner has called a floating bottom bar disgusting, and
 * he is right that a bar hanging over the work is not where a person
 * looks. A masthead that stays put is the same promise with none of
 * that: it is the head of the document, and the document is what the
 * figure belongs to.
 */
function Mast({
  head,
  quote,
  business,
  total,
  unpriced,
  open,
}: {
  /** where the screen measures this head, so what sticks under it
   *  sticks under it */
  head?: (node: HTMLElement | null) => void
  quote: QuoteDef
  business: string | null
  total: number | null
  unpriced: number
  open: boolean
}) {
  const boat = boatOfQuote(quote)
  return (
    <header className="cfg-mast" ref={head}>
      <div className="cfg-mast__who">
        <p className="cfg-eyebrow">
          {business ? `${business} · ` : ''}Quote{' '}
          <span className="cfg-mono">{quote.reference}</span> ·{' '}
          {/* WHERE THE QUOTE STANDS, as a dot in its own ink beside its word —
              draft rose, given leaf (tokens.css, THE KIT). Keyed by the state, so
              the moment a quote is given its dot lands anew on the settle
              spring: the one change on this screen nothing can take back.
              THE KIT'S WORD FOR THE STATE, "given", and not the sentence: in a
              hand "given to the customer" took the eyebrow to a second line at
              the press (measured at 390 × 844: the head 176.7px as a draft, 191.5
              given), and the finale's head and its seal already say who to. */}
          <span className="cfg-state" data-state={quote.state === 'draft' ? 'draft' : 'given'}>
            <span className="cfg-state__dot" key={quote.state} aria-hidden="true" />
            {quote.state === 'draft' ? 'draft' : 'given'}
          </span>
        </p>
        {/* THE BOAT AS A PERSON SAYS IT (built-critique-m2-close-2.md, the
            one thing to change first): its name as the headline, and its
            material and colour under it, drawn as colour where the decode
            names it. The price file's own string is the dealer's, on the
            sheet and beside the paper, and not a headline. */}
        <h1 className="cfg-mast__name">{boat.name}</h1>
        {boat.detail === '' ? null : (
          <p className="cfg-mast__detail">
            <Swatches colour={boat.colour} />
            {boat.detail}
          </p>
        )}
        {/* THE HEAD IS THE SAME HEIGHT GIVEN AS DRAFT (the component critique,
            2026-09-28, major 8). It carried a second "Open the document" on its
            own row once a quote was given, so the press grew the head 28px at a
            desk and 43px in a hand, under the pointer, and a hand's sticky head
            stayed 219px of an 844px window for the rest of the quote's life. The
            way to the paper is the finale's act, where the press was; the head
            says the state, and only the state changes in it. */}
      </div>

      <div className="cfg-money" data-testid="running-total">
        <p className="cfg-money__lab">Total</p>
        {total === null || !open ? (
          <p className="cfg-money__none">—</p>
        ) : (
          <p className="cfg-money__fig">
            <PriceFigure amount={total} />
          </p>
        )}
        {/* THE VERB AGREES WITH THE COUNT — "1 of them carry" was the
            fault (#25), and `linesSay` holds a case per count; `totalSay` says
            first where the boat itself has no price. */}
        <p className="cfg-money__sub">
          <Counts said={totalCounted(quote.lines.length, unpriced, hullHasNoPrice(quote))} />
        </p>
      </div>
    </header>
  )
}

/* ---------------------------------------------------------- */
/* The stage: the hull, and only the hull                       */
/* ---------------------------------------------------------- */

function Stage({
  quote,
  ctx,
  open,
  kept,
  who,
  rail,
  raise,
  refusal,
}: {
  quote: QuoteDef
  ctx: CatalogueCtx
  open: boolean
  kept: string | null
  who: string | null
  rail: Rail | null
  raise: (fix: string) => void
  refusal: string | undefined
}) {
  const register = ctx.entities[quote.rootTableId]?.name ?? ''
  /* THE HULL'S OWN PHOTOGRAPH ON THE WATER WHERE THE LEDGER HOLDS
     ONE, and the catalogue copy where it does not. `stage.ts` argues
     the rung at length; what it buys this screen is a stage worth the
     name — 2560px of scene instead of 1100px of studio render, so the
     boat can be drawn at the size the direction promised without ever
     passing the pixels the ledger holds. */
  const hero = useMemo(() => hullHero(ctx, quote), [ctx, quote])
  const art: StageArt = stageArt(quote.subjectImage?.src, register, hero)
  /* WHAT THE PICTURE SHOWS AND WHAT THIS QUOTE CARRIES, because the
     customer at the desk reads the picture (#24). `say.ts` argues it. */
  const said = pictureSays(art, quote, rail, ctx)
  const [drawn, setDrawn] = useState<{ w: number; h: number } | null>(null)
  const photo = useRef<HTMLImageElement>(null)
  const held = art.kind === 'photograph' ? art.held : null

  /* THE PAINTED SIZE, NOT THE BOX — the same arithmetic entry and
     home run on theirs. `object-fit: cover` scales the whole picture
     until it covers the box and the box crops the rest, so the scale
     is the larger of the two ratios and the size reported is the
     whole picture at that scale. It rides on the provenance line as
     `data-drawn`, beside `data-held`, so "never enlarged" stays
     checkable at every width — by a test, not by a customer. */
  useEffect(() => {
    const img = photo.current
    if (!held || !img || typeof ResizeObserver === 'undefined') return
    const measure = (): void => {
      const box = img.getBoundingClientRect()
      if (box.width <= 0 || box.height <= 0) return
      const scale = Math.max(box.width / held.width, box.height / held.height)
      setDrawn({ w: Math.round(held.width * scale), h: Math.round(held.height * scale) })
    }
    measure()
    const watch = new ResizeObserver(measure)
    watch.observe(img)
    return () => {
      watch.disconnect()
    }
  }, [held])

  return (
    <section className="cfg-stage" aria-label="The boat this quote is about">
      {/* THE PICTURE AND ITS CAPTION, AS ONE PIECE, because in a hand they
          stand above the rail and the rest of the stage below it
          (configurator.css), and a caption that says whose rig is in the
          picture belongs under the picture wherever it stands. */}
      <div className="cfg-stage__pic">
        {/* WHAT THE PACKER MEASURED THE PICTURE TO BE rides on the box,
          because a render and a scene are not drawn the same way and
          the difference is data rather than taste. See the
          stylesheet. */}
        <figure
          className="cfg-shot"
          data-art={art.kind}
          data-verdict={art.kind === 'photograph' ? art.held.verdict : undefined}
          /* NEVER ENLARGED, STRUCTURALLY. `object-fit: cover` scales a
           picture until it covers its box, so a box wider than the
           bytes is an enlargement — the cascade screen measured
           exactly that and it is recorded in docs/DECISIONS.md. The
           ledger's own pixels are the ceiling on the BOX, which makes
           the promise a bound rather than a caption: at or under the
           held size, `cover` can only scale down. Home caps its two
           plates the same way. */
          style={
            art.kind === 'photograph'
              ? { maxInlineSize: art.held.width, maxBlockSize: art.held.height }
              : undefined
          }
        >
          {art.kind === 'photograph' ? (
            <img
              className="cfg-shot__img"
              ref={photo}
              src={art.held.src}
              /* THE LEDGER'S OWN WORDS FOR WHAT IT SHOWS, where a ledger
               has them — the hero rows carry a `subject` line and the
               catalogue rows do not, so the fallback is the boat this
               document is about. */
              alt={art.held.subject === '' ? boatOfQuote(quote).say : art.held.subject}
              width={art.held.width}
              height={art.held.height}
              /* THE NARROWER COPIES THE LEDGER ALREADY HOLDS. A 2560px
               hero fetched to be drawn 913px wide is 400 kB of stall
               on the fold of the screen a sale happens on — the
               critique measured that on home and it is the same
               picture set. `sizes` is the stage's own share of the
               window at each step of this screen's ladder. */
              {...(art.held.widths.length > 1
                ? {
                    srcSet: art.held.widths.map((w) => `${w.src} ${w.width}w`).join(', '),
                    sizes:
                      '(max-width: 639px) 100vw, (max-width: 1199px) 288px, (max-width: 1439px) 44vw, 48vw',
                  }
                : {})}
              decoding="async"
              fetchPriority="high"
              /* THE PHOTOGRAPH THE PICKER'S ACT CARRIED HERE (the component kit,
               2026-09-28): the plate's picture of this row travels under the
               same name, so the route's View Transition lands it on this stage
               (src/screens/picker/travel.ts). Only the picture is named — the
               running price never travels. */
              style={
                { '--cfg-travel': boatTravel(quote.rootTableId, quote.rootRowId) } as CSSProperties
              }
            />
          ) : art.kind === 'mark' ? (
            <img
              className="cfg-shot__mark"
              src={art.mark.src}
              alt={art.mark.brand}
              width={art.mark.width}
              height={art.mark.height}
            />
          ) : (
            <span className="cfg-shot__word">{register}</span>
          )}
        </figure>
        {/* THE CAPTION STANDS DIRECTLY UNDER THE PHOTOGRAPH IT IS ABOUT.
          On the Sport 560 the maker's photograph has a Mercury on the
          transom and the quote may carry a Yamaha; the picture is the
          model's own and is neither swapped nor cropped, and this says
          in two lines whose rig it is and what is on this quote. */}
        {said ? (
          <p className="cfg-caption" data-testid="stage-caption">
            <span className="cfg-caption__shows">{said.shows}</span>
            {said.ours === '' ? null : <span className="cfg-caption__ours">{said.ours}</span>}
          </p>
        ) : null}
      </div>

      {/* EVERYTHING THAT IS NOT THE PICTURE, IN ONE BLOCK, because at
          every width under 1200 the stage is a band and the picture
          stands beside the rest of it. Without the wrapper the band is
          a grid of eight loose children and the picture spans a fixed
          number of rows — which is a count that goes wrong the day a
          line is added. Measured at 834x1112: the last two sentences
          wrapped under the photograph instead of beside it. */}
      <div className="cfg-stage__say">
        <p className="cfg-stage__over">{register}</p>
        <h2 className="cfg-stage__name">{boatOfQuote(quote).name}</h2>
        {boatOfQuote(quote).detail === '' ? null : (
          <p className="cfg-stage__detail">
            <Swatches colour={boatOfQuote(quote).colour} size="sm" />
            {boatOfQuote(quote).detail}
          </p>
        )}

        {quote.subjectSpecs.length > 0 ? (
          <Specs quote={quote} />
        ) : (
          <p className="cfg-note">The price file lists no specifications for this boat.</p>
        )}

        {/* WHERE THE PICTURE CAME FROM, IN ONE SHORT LINE. It read "Stage
            copy 2,560 × 1,708, drawn here at 624 × 416, never enlarged ·
            from media.highfieldboats.com" — the image ledger's arithmetic,
            printed to a customer at the desk (M2-close critique #4 and
            #21). The provenance is the ledger's and stays there; "never
            enlarged" is a bound the box already enforces (its max size is
            the held pixels) and is not a sentence anybody reads. The held
            and drawn sizes ride on the line as data, so a test can still
            check the bound at every width. */}
        <p
          className="cfg-prov"
          data-held={art.kind === 'photograph' ? `${art.held.width}x${art.held.height}` : undefined}
          data-drawn={drawn ? `${drawn.w}x${drawn.h}` : undefined}
        >
          {art.kind === 'photograph'
            ? `${art.held.tier === 'hero' ? 'Photograph' : 'Picture'} from ${hostOf(art.held.address)}`
            : art.because}
        </p>

        <div className="cfg-hair" />

        {open ? (
          <Rungs quote={quote} rail={rail} raise={raise} refusal={refusal} />
        ) : (
          <p className="cfg-note">
            The Master Price File is not loaded in this browser, so nothing below can be offered.
            Every price already on this quote stays as it was picked.
          </p>
        )}
        <p className="cfg-note">
          {who ? `Prepared by ${quote.preparedBy ?? who}. ` : ''}
          {savedSay(kept, quote.state !== 'draft')}
        </p>
      </div>
    </section>
  )
}

/**
 * THE BOAT'S SPECIFICATION, ruled — each label led by the glyph of what it
 * measures where every label in the strip has one (`specGlyphs`). A UNIT ON
 * EVERY MEASURE the file or its maker states one for (`measured`): "OA Length
 * 6.98 m", never a bare 6.98.
 */
function Specs({ quote }: { quote: QuoteDef }) {
  const specs = quote.subjectSpecs.map((spec) => measured(quote.rootTableId, spec))
  const glyphs = specGlyphs(specs.map((s) => s.label))
  return (
    <dl className="cfg-specs">
      {specs.map((spec, i) => {
        const glyph = glyphs[i]
        return (
          <div className="cfg-spec" key={spec.label}>
            <dt className="cfg-spec__lab">
              {glyph ? (
                <span className="cfg-spec__glyph" aria-hidden="true">
                  <Icon glyph={glyph} />
                </span>
              ) : null}
              {spec.label}
            </dt>
            <dd className="cfg-spec__val">{spec.value}</dd>
          </div>
        )
      })}
    </dl>
  )
}

/**
 * THE RUNG, AND THE WAY TO ANOTHER ONE.
 *
 * It is a FACT and then a proposal, never a switch. Pressing a rung
 * here writes nothing: it opens `/quote/$id/cascade?fix=level:<key>`,
 * where the move is shown line by line with the reason each line
 * gives and is accepted or declined. That is the difference between
 * this and production, which re-prices instantly and silently and
 * loses the level on save.
 *
 * The rungs are `quoteLevelChoices`', read off the document's own
 * frozen levels, and the count beside each is the engine's own
 * `carriedBy` — how many of this quote's lines actually carry that
 * column — so a rung two tables out of eight can offer never looks
 * universal.
 */
function Rungs({
  quote,
  rail,
  raise,
  refusal,
}: {
  quote: QuoteDef
  rail: Rail | null
  raise: (fix: string) => void
  refusal: string | undefined
}) {
  const rungs = rail?.rungs ?? []
  if (rungs.length === 0) {
    return <p className="cfg-note">{NO_LEVEL_SAY}</p>
  }
  /* A GIVEN QUOTE'S LEVEL IS A FACT, NOT A DECISION STILL OPEN
     (m2-last-critique.md, minor 14): "See what Trade does" stood on a
     given quote as a refused control under the issued sentence, offering
     a move the quote can never make. Once it is given, the level it was
     given at is all that is said here; the way on is a new version, which
     the build's head already says. */
  if (refusal !== undefined) {
    const on = rungs.find((rung) => rung.key === quote.levelKey)
    return on === undefined ? null : (
      <div className="cfg-rungs">
        <p className="cfg-rungs__lab">Priced at</p>
        <ul className="cfg-rungs__list">
          <li className="cfg-rung">
            <RungOn label={on.label} glyph={levelGlyph(on.key)}>
              {levelCountSay(on.carriedBy, quote.lines.length)}
            </RungOn>
          </li>
        </ul>
      </div>
    )
  }
  return (
    <div className="cfg-rungs">
      <p className="cfg-rungs__lab">Priced at</p>
      <ul className="cfg-rungs__list">
        {rungs.map((rung) => (
          <li className="cfg-rung" key={rung.key}>
            {rung.key === quote.levelKey ? (
              <RungOn label={rung.label} glyph={levelGlyph(rung.key)}>
                {levelCountSay(rung.carriedBy, quote.lines.length)}
              </RungOn>
            ) : (
              <Button
                intent="veiled"
                size="sm"
                icon={ArrowsLeftRightIcon}
                onClick={() => raise(levelFix(rung.key))}
              >
                See what {rung.label} does
              </Button>
            )}
          </li>
        ))}
      </ul>
      <p className="cfg-note">{CASCADE_SAY}</p>
    </div>
  )
}

/**
 * THE LEVEL THIS QUOTE IS ON, AS A FACT: the kit's chosen capsule — the
 * accent, because the accent means what is chosen — with the level's glyph
 * and the engine's count of the lines that carry it. It is not a control and
 * draws none of a control's states: moving the level is the cascade's.
 */
function RungOn({ label, glyph, children }: { label: string; glyph: Glyph; children: string }) {
  return (
    <span className="cfg-rung__on">
      <span className="cfg-rung__glyph" aria-hidden="true">
        <Icon glyph={glyph} />
      </span>
      {label}
      <span className="cfg-rung__count">{children}</span>
    </span>
  )
}

/* ---------------------------------------------------------- */
/* One chapter                                                  */
/* ---------------------------------------------------------- */

function ChapterCard({
  at,
  index,
  chapter,
  quote,
  rail,
  open,
  searching,
  query,
  onOpen,
  onPress,
  onRaise,
  onShowAll,
  refusal,
  quoteId,
  openQuote,
  openDocument,
  now,
  justGiven,
  setStep,
  setRefused,
}: {
  /** where the reading light finds this chapter */
  at: RefObject<HTMLElement | null> | undefined
  /** its place in the rail, for the rise on a draft's first paint */
  index: number
  chapter: Chapter
  quote: QuoteDef
  rail: Rail
  open: boolean
  searching: boolean
  query: string
  onOpen: () => void
  onPress: (act: Act) => void
  onRaise: (fix: string) => void
  onShowAll: (id: string) => void
  refusal: string | undefined
  quoteId: string
  openQuote?: (id: string) => void
  openDocument?: (id: string) => void
  now?: () => Date
  /** the quote was given on this screen a moment ago (`Finale`) */
  justGiven: boolean
  setStep: (step: Step) => void
  setRefused: (said: string | null) => void
}) {
  /* A SEARCH OPENS EVERY CHAPTER THAT HAS AN ANSWER, which is the
     whole of "no mode change": the rail is the same rail, narrowed
     in place, and a chapter with nothing matching stays shut and
     says so rather than disappearing. */
  const showing = searching ? chapter.matched > 0 : open

  /* THE ONE REASON EVERY ROW IN THIS CHAPTER IS REFUSED FOR, ONCE,
     ABOVE THEM ALL.
     MEASURED after issuing with chapter 02 open, 2026-09-17: five
     copies of `ISSUED_REFUSAL`, four of them a 58.5px paragraph
     wedged BETWEEN two rows, so each read as though it belonged to
     the row beneath it — and `Show all 209 in Yamaha Outboards` would
     have made it 209. One chapter above, the fitment refusal already
     said its reason once, above the list, with every row still live:
     the same screen held the right pattern and the wrong one. This is
     the right one, and the primitive gained `refusedBy` so the tiles
     still carry `aria-describedby` to the sentence. */
  const shutId = `cfg-shut-${chapter.id}`
  const refusedBy = refusal === undefined ? undefined : shutId

  /* THE BODY OPENS OUT OF ITS HEAD — height and opacity on the kit's travel
     spring, and it closes faster than it opened (the `Chapter` primitive's
     own motion, which this chapter cannot be: see the head below). Under
     reduced motion, or while a caret is in a field (a search opening every
     chapter with an answer as it is typed), it only fades. ON A GIVEN QUOTE
     IT DOES NOT MOVE AT ALL: every figure in it is final, and a final figure
     is simply there. */
  const reduce = useReducedMotion()
  const still = useStill()
  const quiet = Boolean(reduce) || still
  const frozen = refusal !== undefined

  /* WHAT THE OPEN CHAPTER HOLDS, drawn once and either animated or not */
  const inside = (
    <div className="cfg-body__in">
      {refusal !== undefined && chapter.kind === 'band' ? (
        <Said className="cfg-shut" id={shutId} glyph={LockSimpleIcon}>
          {refusal}
        </Said>
      ) : null}

      {chapter.id === 'hull' ? (
        <HullPrice
          quote={quote}
          quoteId={quoteId}
          refusedBy={refusedBy}
          setStep={setStep}
          setRefused={setRefused}
        />
      ) : null}

      {chapter.finishes ? (
        <FinishBlock
          finishes={chapter.finishes}
          query={searching ? query : ''}
          onPress={onPress}
          onRaise={onRaise}
          refusedBy={refusedBy}
        />
      ) : null}

      {chapter.tables.map((table) => (
        <TableBlock
          key={table.id}
          table={table}
          named={chapter.tables.length > 1}
          query={searching ? query : ''}
          onPress={onPress}
          onShowAll={onShowAll}
          refusedBy={refusedBy}
        />
      ))}

      {chapter.kind === 'handover' ? (
        <Handover
          quote={quote}
          quoteId={quoteId}
          refusal={refusal}
          setStep={setStep}
          setRefused={setRefused}
        />
      ) : null}

      {chapter.kind === 'finale' ? (
        <Finale
          quote={quote}
          quoteId={quoteId}
          rail={rail}
          openQuote={openQuote}
          openDocument={openDocument}
          now={now}
          arrives={justGiven}
          setStep={setStep}
          setRefused={setRefused}
        />
      ) : null}
    </div>
  )

  return (
    <section
      ref={at}
      className="cfg-chapter"
      data-chapter={chapter.id}
      data-open={showing ? '' : undefined}
      data-kind={chapter.kind}
      aria-label={`${chapter.num ? `${chapter.num} ` : ''}${chapter.name}`}
      style={{ '--i': Math.min(index, 7) } as CSSProperties}
    >
      {/* THE BAND STATES ITS OWN ANSWER — number, name, where the
          decision stands and its subtotal — so the whole build reads
          without opening anything (the sweep's §2, off
          `premium/hermanmiller-aeron-config.png`). The clause is the
          engine's own `stateSay`; no wording is invented here. */}
      {/* THE HEAD IS THE SCREEN'S OWN AND SPEAKS THE KIT (the `Chapter`
          primitive's drawing: a disc, the words, the subtotal, a caret that
          turns). It is not that primitive, for three reasons the primitive
          cannot carry: a chapter with nothing priced says so in the dealer's
          words ("Nothing on it yet", "Not priced on this quote") where the
          primitive draws a dash; the head is a heading, so the rail reads as
          an outline; and a search opens every chapter with an answer at once,
          which a head that toggles itself cannot. */}
      <h2 className="cfg-head">
        <button type="button" className="cfg-head__press" aria-expanded={showing} onClick={onOpen}>
          <ChapterMark chapter={chapter} />
          {/* THE TWO CLOSING CHAPTERS CARRY NO NUMBER AND NO MARK IN ITS
              PLACE. The numbers are the engine's fixed reading order —
              "03" is the trailer on every quote, and 05 belongs to
              Administration where a business has it — so "Who it is for"
              and the finale cannot take 05 and 06 without the column
              meaning two things. They printed "·" instead, which read as
              a number nobody could decode (the M2-close critique, #20);
              the cell stays, empty, so the names still stand in line. */}
          <span className="cfg-head__num" aria-hidden={chapter.num === '' ? true : undefined}>
            {chapter.num}
          </span>
          <span className="cfg-head__body">
            <span className="cfg-head__name">{chapter.name}</span>
            <span className="cfg-head__fact">
              {chapter.fact}
              {choiceSay(chapter, searching)}
              {/* A CHAPTER THE SEARCH DID NOT REACH SAYS SO ON ITS OWN
                  HEAD. It stays shut, in its place, still stating its
                  answer — but a head reading "3 more offered" over a
                  rail that has narrowed reads as a chapter with
                  matches in it that simply is not open. */}
              {searching
                ? chapter.matched > 0
                  ? ` · ${chapter.matched.toLocaleString('en-AU')} match`
                  : ' · nothing here matches'
                : ''}
            </span>
          </span>
          {/* THE SUBTOTAL, AND THE TWO WAYS THERE IS NOT ONE — which
              are different facts with two different words (see the
              import). A chapter with nothing on it has not
              been answered; a chapter whose lines carry no figure
              has, and the price file prices none of them. The
              handover is neither: it is a question about a person
              and owes no figure at all, so its cell is empty rather
              than carrying a word about money. */}
          <span className="cfg-head__sum">
            {chapter.kind === 'handover' ? null : chapter.amount === null ? (
              <span className="cfg-head__nosum">
                {chapter.lines === 0 ? NOTHING_ON_IT : NOT_PRICED_ON_PAPER}
              </span>
            ) : (
              <PriceFigure amount={chapter.amount} />
            )}
          </span>
          {/* A CARET IN THE PLATE'S WELL THAT TURNS OVER AS THE CHAPTER OPENS,
              where a typed "+" and "–" stood */}
          <span className="cfg-head__chev" aria-hidden="true">
            <Icon glyph={CaretDownIcon} />
          </span>
        </button>
      </h2>

      {frozen ? (
        showing ? (
          <div className="cfg-body">{inside}</div>
        ) : null
      ) : (
        <AnimatePresence initial={false}>
          {showing ? (
            <motion.div
              key="body"
              className="cfg-body"
              initial={quiet ? { opacity: 0 } : { height: 0, opacity: 0 }}
              /* ALWAYS TO ITS WHOLE HEIGHT (the second verify round, 2026-09-29). With
                 `{ opacity: 1 }` alone under a caret, a caret arriving while the body was
                 still growing — "Who it is for" pressed and the name typed at once — stopped
                 the height where it stood, and the chapter stayed open with its body folded
                 to a sliver under the finale's head (measured at 1920 × 1080 on the ADV7:
                 the Address press intercepted for two minutes). Quiet, the height lands at
                 once (`transition` gives it no duration) and only the opacity fades. */
              animate={{ height: 'auto', opacity: 1 }}
              exit={
                frozen
                  ? undefined
                  : quiet
                    ? /* folded at once: a body that faded out while it kept its
                         height would move the page under the reader when it went */
                      { opacity: 0, transition: { duration: 0 } }
                    : { height: 0, opacity: 0, transition: transition('exit', false) }
              }
              transition={transition('travel', quiet)}
            >
              {inside}
            </motion.div>
          ) : null}
        </AnimatePresence>
      )}
    </section>
  )
}

/* ---------------------------------------------------------- */
/* The boat's price, where the price file holds none            */
/* ---------------------------------------------------------- */

/**
 * THE ACT THE PICKER PROMISED, AND NO SCREEN OFFERED (m2-last-critique.md
 * blocker 1). The picker's plate for a Haines Signature says "The price
 * file holds no price for this boat. The quote still opens, and you put
 * the price on it" — and the build had nowhere to put it, so the hull
 * read $0 and the customer's paper called the boat Included.
 *
 * The file's nought is read as no price where the line is frozen
 * (`nought.ts`); this is where a price goes on. It is `setOverride`, the
 * engine's own command, with its inverse — so the step line's Undo takes
 * it off again — and the reason written beside the figure is the fact
 * that offered the act, at the moment of the decision. The price file
 * is not touched.
 *
 * DRAWN ONLY WHERE IT IS TRUE: a hull the file prices shows nothing
 * here. An issued quote keeps the sentence and loses the field, since
 * nothing on it can change and a refused field is noise.
 */
function HullPrice({
  quote,
  quoteId,
  refusedBy,
  setStep,
  setRefused,
}: {
  quote: QuoteDef
  quoteId: string
  /** the chapter's one reason, on an issued quote */
  refusedBy: string | undefined
  setStep: (step: Step) => void
  setRefused: (said: string | null) => void
}) {
  const hull = hullPriceOf(quote)
  if (!hull || hull.state === 'file') return null
  const typed = hull.state === 'typed' ? lineAmount(hull.line).amount : null
  const boat = boatOfQuote(quote).name
  return (
    <div className="cfg-table" data-testid="hull-price">
      <div className="cfg-table__head">
        <h3 className="cfg-table__name">The boat&rsquo;s price</h3>
        <p className="cfg-table__why">
          {typed === null
            ? `The price file holds no price for the ${boat}, so its price is put on here. It goes on this quote only; the price file is not changed.`
            : `Priced by hand at ${money(typed)}, because the price file holds no price for the ${boat}. It is on this quote only.`}
        </p>
      </div>
      {refusedBy === undefined ? (
        /* KEYED ON THE PRICE THE QUOTE CARRIES, so an Undo in the step's
           toast empties the field the way it emptied the quote */
        <HullPriceField
          key={typed ?? 'none'}
          lineId={hull.line.id}
          boat={boat}
          typed={typed}
          quoteId={quoteId}
          setStep={setStep}
          setRefused={setRefused}
        />
      ) : null}
    </div>
  )
}

function HullPriceField({
  lineId,
  boat,
  typed,
  quoteId,
  setStep,
  setRefused,
}: {
  lineId: string
  boat: string
  typed: number | null
  quoteId: string
  setStep: (step: Step) => void
  setRefused: (said: string | null) => void
}) {
  const [text, setText] = useState(typed === null ? '' : money(typed))
  /* WHY WHAT WAS TYPED IS NOT A PRICE, said under the field it was typed
     in and only after the press — never a control greyed out at rest */
  const [wrong, setWrong] = useState<string | null>(null)
  /* AND BROUGHT INTO THE WINDOW. Measured at 834 × 1112: the act stood at
     the foot of the window and the sentence under it began below the fold,
     so a press seemed to do nothing. */
  const said = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    if (wrong !== null) said.current?.scrollIntoView?.({ block: 'nearest' })
  }, [wrong])

  const put = (): void => {
    const read = readHullPrice(text)
    if ('refused' in read) {
      setWrong(read.refused)
      return
    }
    setWrong(null)
    const outcome = quotesStore
      .getState()
      .apply(quoteId, setOverride(lineId, read.price, HULL_PRICE_REASON))
    if ('refused' in outcome) {
      setRefused(outcome.refused === '' ? null : outcome.refused)
      return
    }
    setRefused(null)
    /* the boat as a person says it, where the command's own sentence
       names the file's line */
    const priced = quotesStore.getState().quotes.find((q) => q.id === quoteId)
    setStep({
      said: `${boat} priced at ${money(read.price)}`,
      eventId: outcome.event.id,
      wasUndo: false,
      kind: priced ? kindOfBoat(priced) : undefined,
    })
  }

  return (
    <>
      <div className="cfg-ask">
        <Field label="The boat’s price, tax included">
          <Input
            id="cfg-hull-price"
            mono
            inputMode="decimal"
            autoComplete="off"
            value={text}
            onValueChange={setText}
            onKeyDown={(event) => {
              if (event.key === 'Enter') put()
            }}
            placeholder="In dollars"
            aria-describedby={wrong === null ? undefined : 'cfg-hull-price-wrong'}
          />
        </Field>
      </div>
      <div className="cfg-act">
        {/* THE ACT WHILE THE BOAT HAS NO PRICE, and a quiet control once
            it has one: a price already on it is not the next thing to do */}
        <Button
          intent={typed === null ? 'act' : 'secondary'}
          icon={typed === null ? TagIcon : PencilSimpleIcon}
          onClick={put}
        >
          {typed === null ? 'Put this price on the boat' : 'Change the price'}
        </Button>
        {wrong === null ? (
          <p className="cfg-act__say">
            It prints on the customer&rsquo;s quote as the boat&rsquo;s price.
          </p>
        ) : (
          <Said
            className="cfg-alarm"
            id="cfg-hull-price-wrong"
            alert
            ref={said}
            glyph={WarningCircleIcon}
          >
            {wrong}
          </Said>
        )}
      </div>
    </>
  )
}

/* ---------------------------------------------------------- */
/* The hull in another finish                                   */
/* ---------------------------------------------------------- */

function FinishBlock({
  finishes,
  query,
  onPress,
  onRaise,
  refusedBy,
}: {
  finishes: Finishes
  query: string
  onPress: (act: Act) => void
  onRaise: (fix: string) => void
  /** the element holding the one reason every row here is refused
   *  for, where there is one. The sentence is drawn once, by the
   *  chapter, above every block in it. */
  refusedBy: string | undefined
}) {
  const rows =
    query === '' ? finishes.rows : finishes.rows.filter((f) => matchesFinish(f.label, query))

  if (finishes.rows.length === 0) {
    return (
      <Said className="cfg-why" glyph={InfoIcon}>
        {finishes.why}
      </Said>
    )
  }
  if (rows.length === 0) {
    return (
      <Said className="cfg-why" glyph={InfoIcon}>
        No finish of this hull is called that.
      </Said>
    )
  }

  return (
    <div className="cfg-table">
      <div className="cfg-table__head">
        <h3 className="cfg-table__name">
          {finishes.model} — {finishes.rows.length.toLocaleString('en-AU')} finishes
        </h3>
        {/* ONE FACT, IN THE WORDS A SALESPERSON SAYS IT. It read "A quote
            is written against ONE row of Highfield Inflatables … Choosing
            another re-roots the document on that row" (M2-close critique
            #4). What the press does is change the hull and nothing else. */}
        <p className="cfg-table__why">
          Choose another and only the hull changes. The motor, the trailer and everything else on
          this quote stay as they are.
        </p>
      </div>
      <ul className="cfg-rows">
        {rows.map((finish) => (
          <li key={finish.rowId}>
            <FinishCard finish={finish} onPress={onPress} onRaise={onRaise} refusedBy={refusedBy} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * A FINISH THAT COSTS SOMETHING IS A DECISION, AND A DECISION IS THE
 * CASCADE'S. Re-rooting the document on another row of the register
 * re-prices the hull and asks fitment again what the trailers already
 * on this quote are, so where the press moves the total it opens
 * `/quote/$id/cascade?fix=finish:<rowId>` and writes nothing until it
 * is accepted there.
 *
 * WHERE IT MOVES NOTHING IT IS APPLIED HERE. Seven of the SP560's
 * fifteen finishes are the same price as the one on the quote, and a
 * sheet that opens to say "nothing happens" is a full stop in the
 * middle of somebody's work — `src/domain/quote/cascade.ts` refuses to
 * build one for exactly that reason, and this is the same rule one
 * level up.
 */
function FinishCard({
  finish,
  onPress,
  onRaise,
  refusedBy,
}: {
  finish: Finish
  onPress: (act: Act) => void
  onRaise: (fix: string) => void
  refusedBy: string | undefined
}) {
  return (
    <Tile
      tone="room"
      shape="row"
      selected={finish.current}
      onSelect={() =>
        finish.delta === 0
          ? onPress({ do: 'refinish', rowId: finish.rowId, label: finish.label })
          : onRaise(finishFix(finish.rowId))
      }
      refusedBy={refusedBy}
      label={`${finish.colour.say}${finish.materialSaid === '' ? '' : `, ${finish.materialSaid}`}, ${finish.delta === 0 ? 'no change to the total' : signedMoney(finish.delta)}`}
    >
      <span className="cfg-row">
        <Tick on={finish.current} />
        <span className="cfg-row__main">
          <span className="cfg-row__name cfg-row__name--finish">
            {/* THE COLOUR IS THE CONTENT, DRAWN AS COLOUR where the decode
                names it (built-critique-m2-close-2.md, major 6), with the
                material in words. A code the decode cannot read draws no
                swatch and is printed as the code: a colour nobody can name
                is a colour nobody may paint. */}
            <Swatches colour={finish.colour} size="sm" />
            <span>
              {finish.colour.read ? (
                finish.colour.say
              ) : (
                <span className="cfg-mono">
                  {finish.colour.code === '' ? '—' : finish.colour.code}
                </span>
              )}
              {finish.materialSaid === '' ? '' : ` · ${finish.materialSaid}`}
            </span>
          </span>
          {/* THE DEALER'S CODES, quiet under it: the colourway and the line
              as the price file writes them, which is what he orders by */}
          <span className="cfg-row__facts">
            {finish.colour.read ? (
              <span className="cfg-mono">{finish.colour.code}</span>
            ) : (
              'no colour name on file for this code'
            )}
            {finish.code === '' ? '' : ` · ${finish.code}`}
          </span>
        </span>
        <span className="cfg-row__money">
          <span className="cfg-row__delta" data-way={way(finish.delta)}>
            {finish.current
              ? 'fitted'
              : finish.delta === 0
                ? 'no change'
                : signedMoney(finish.delta)}
          </span>
          {finish.amount === null ? null : (
            <span className="cfg-row__at">{money(finish.amount)} for the hull</span>
          )}
        </span>
      </span>
    </Tile>
  )
}

/* ---------------------------------------------------------- */
/* One table inside a chapter                                   */
/* ---------------------------------------------------------- */

function TableBlock({
  table,
  named,
  query,
  onPress,
  onShowAll,
  refusedBy,
}: {
  table: ChapterTable
  /** the chapter holds more than one table, so each needs its name */
  named: boolean
  query: string
  onPress: (act: Act) => void
  onShowAll: (id: string) => void
  /** the element holding the one reason every row here is refused
   *  for, where there is one */
  refusedBy: string | undefined
}) {
  const counts = table.counts
  const offered = Math.max(0, counts.admitted - counts.heldCount)
  const reason = reasonSay(table)
  const unpriced = unpricedSay(table)

  return (
    <div className="cfg-table">
      <div className="cfg-table__head">
        {named ? <h3 className="cfg-table__name">{table.title}</h3> : null}
        {/* THE COUNTED RAIL, and every figure in it comes back from
            the engine so the screen never works out its own
            denominator (`freeze.ts` Offer, at length). The
            denominator is what the switch below would show — "4 of
            1,777" over "Show all 1,576" gave a dealer two totals for
            one question. The words are `countsSay`'s: "4 of 209
            paired with this hull", which is the whole of what the
            list's workbook name and its file-wide rate were saying. */}
        <p className="cfg-table__counts">
          <Counts said={countsCounted(table, query)} />
        </p>
        {reason === '' ? null : <p className="cfg-table__why">{reason}</p>}
        {unpriced === '' ? null : <p className="cfg-table__why">{unpriced}</p>}
        {/* THE FILE'S OWN PICK, NAMED IN TEXT ABOVE THE ROWS, which
            is what §4 of the sweep measured every good reference
            doing — "None uses a star, a ribbon or a colour." The
            substance was already right: `mintQuote` brings the
            starred motor and the starred trailer across at mint, so
            the recommended row is the row already on the quote when
            the chapter opens. The ★ that used to ride on it was the
            one treatment the sweep counted its references avoiding. */}
        {table.recommends === '' ? null : (
          <p className="cfg-table__pick">
            The price file recommends <b>{table.recommends}</b> for this hull.
          </p>
        )}
      </div>

      {/* EVIDENCE, NEVER A REFUSAL — the same category the finale's
          double-charge flag is in, and the same treatment. A press on
          this screen ADDS: the chapters are not radio groups, because
          a section really does hold as many lines as a dealer puts on
          it. What was missing is that nothing said so, so pressing a
          second motor quietly fitted a second outboard to a 5.66 m
          RIB. The sentence is `severalOnStepSentence`'s, in the
          engine, beside the command whose behaviour it describes. */}
      {table.severalSay === '' ? null : (
        <Said className="cfg-several" testId="several-on-one-table" glyph={StackIcon}>
          {table.severalSay}
        </Said>
      )}

      {table.rows.length === 0 ? (
        <Said className="cfg-why" glyph={InfoIcon}>
          {query !== ''
            ? `Nothing in ${table.title} is called that.`
            : table.why !== ''
              ? table.why
              : `Nothing more from ${table.title} is paired with this hull.`}
        </Said>
      ) : (
        <>
          {/* THE ONE REASON THEY ALL SHARE, said once above them —
              `chapters.ts` records what forty copies of it looked
              like. Not one row is hidden, greyed or disabled by it:
              this is `premium/pcpartpicker-list.png`'s banner, which
              names the problem in words and leaves every control
              live. */}
          {table.sharedWhy === '' ? null : (
            <Said className="cfg-shared" glyph={InfoIcon}>
              {table.sharedWhy}
            </Said>
          )}
          <ul className={table.pictured ? 'cfg-tiles' : 'cfg-rows'}>
            {table.rows.map((row) => (
              <li key={row.key}>
                <OptionCard
                  row={row}
                  query={query}
                  onPress={onPress}
                  refusedBy={refusedBy}
                  tile={table.pictured ? { kind: table.kind, lazy: table.showingAll } : null}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      {table.also.length > 0 ? (
        <div className="cfg-also">
          <p className="cfg-also__lab">
            Also on this quote from {table.title}, and not in the list above
          </p>
          <ul className={table.pictured ? 'cfg-tiles' : 'cfg-rows'}>
            {table.also.map((row) => (
              <li key={row.key}>
                <OptionCard
                  row={row}
                  query=""
                  onPress={onPress}
                  refusedBy={refusedBy}
                  tile={table.pictured ? { kind: table.kind, lazy: false } : null}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* THE WAY PAST THE NARROWING, and it is a control rather than a
          promise. Production's trailer step has no catalogue browse at
          all, so a salesperson who can SEE a trailer on the yard is
          told by their own system that it does not exist. */}
      {counts.catalogue > counts.narrowed ? (
        <div className="cfg-all">
          <Button
            intent="veiled"
            size="sm"
            icon={table.showingAll ? ArrowsInSimpleIcon : ArrowsOutSimpleIcon}
            onClick={() => onShowAll(table.id)}
          >
            {table.showingAll
              ? `Back to the ${offered.toLocaleString('en-AU')} paired with this hull`
              : `Show all ${counts.catalogue.toLocaleString('en-AU')} in ${table.title}`}
          </Button>
          <p className="cfg-all__say">{allSay(table)}</p>
        </div>
      ) : null}
    </div>
  )
}

/* ---------------------------------------------------------- */
/* One option                                                   */
/* ---------------------------------------------------------- */

/**
 * A ROW THE NARROWING LEFT OUT IS AN ORDINARY ROW WITH A SENTENCE.
 * `premium/pcpartpicker-list.png` is the frame: a full-width banner
 * names the severity in words, and NOT ONE CONTROL IS DISABLED — the
 * clashing board and CPU sit as ordinary rows, every Buy live, the
 * total still summed. Ours is the same and one better: the sentence
 * is on the row it is about, and it is the engine's own `outsideWhy`
 * — every clause re-run through the rule that rejected it, with the
 * figures on both sides.
 */
function OptionCard({
  row,
  query,
  onPress,
  refusedBy,
  tile,
}: {
  row: OptionRow
  query: string
  onPress: (act: Act) => void
  refusedBy: string | undefined
  /** drawn as the kit's photographed option tile, on a list whose shelf holds pictures */
  tile: { kind: TableKind; lazy: boolean } | null
}) {
  /* THE RECOMMENDATION IS STILL ON THE ROW FOR A READER, and it is the
     same words the table head prints for an eye. What left is the ★
     glyph beside the name: §4 of the sweep measured Saxdor, Apple,
     Whaler and Porsche and found that "None uses a star, a ribbon or a
     colour." */
  const label = `${row.tail}${row.starred ? ', recommended by the price file' : ''}, ${row.fitted ? 'on the quote' : 'not on the quote'}`
  const name = (
    <span className={tile ? 'cfg-row__name cfg-row__name--tile' : 'cfg-row__name'}>
      {row.stem === '' ? null : <span className="cfg-row__stem">{row.stem} </span>}
      <Marked text={row.tail} query={query} />
      {row.code === '' ? null : <span className="cfg-row__code">{row.code}</span>}
    </span>
  )

  if (tile) {
    /* THE MOTOR AS THE KIT DRAWS IT (the component critique, 2026-09-28,
       blocker 1): the maker's own render in the well where the ledger
       holds it, its kind's glyph where it does not; its name; its power,
       weight and shaft off its own row; the pairing's words that tell it
       from its neighbours, whole, as the tile's quiet line; and the press's
       figure in the pill, with the price it is read at beside it. Chosen
       is the tile's ring, its tick and its filled pill. The figure is the
       same `weighPick` delta the row printed and it never moves. */
    const detail =
      row.facts.length > 0 || row.contains !== '' ? (
        <>
          {row.facts.length > 0 ? <Facts facts={row.facts} /> : null}
          {row.contains === '' ? null : <span className="cfg-row__contains">{row.contains}</span>}
        </>
      ) : undefined
    return (
      <div className="cfg-opt" data-outside={row.outside ? '' : undefined}>
        <OptionTile
          name={name}
          facts={row.spec === '' ? undefined : row.spec}
          detail={detail}
          picture={row.picture}
          kind={tile.kind}
          lazy={tile.lazy}
          /* AN EMPTY FIGURE IS AN EM-DASH, never a blank and never a nought */
          figure={row.delta === null ? '—' : <PriceFigure amount={row.delta} signed />}
          figureSay={
            row.amount === null
              ? row.column === null
                ? undefined
                : `No ${row.column} price`
              : `${money(row.amount)}${row.column === null ? '' : ` at ${row.column}`}`
          }
          selected={row.fitted}
          onSelect={() => onPress(row.act)}
          refusedBy={refusedBy}
          label={label}
        />
        {row.why === '' ? null : <p className="cfg-opt__why">{row.why}</p>}
      </div>
    )
  }

  return (
    <div className="cfg-opt" data-outside={row.outside ? '' : undefined}>
      <Tile
        tone="room"
        shape="row"
        selected={row.fitted}
        onSelect={() => onPress(row.act)}
        refusedBy={refusedBy}
        label={label}
      >
        <span className="cfg-row">
          <Tick on={row.fitted} />
          <span className="cfg-row__main">
            {name}
            {row.facts.length > 0 ? <Facts facts={row.facts} /> : null}
            {row.contains === '' ? null : <span className="cfg-row__contains">{row.contains}</span>}
          </span>
          <span className="cfg-row__money">
            {/* PRICE THE DELTA. The figure is what this press moves
                the running total by — plus to put it on, minus to
                take it off — and it is `weighPick`'s, which is the
                one summation run over the document this press would
                produce. */}
            {/* AND AN EMPTY CELL IS AN EM-DASH, never a blank and
                never a nought — the sweep's §2, off
                `premium/pcpartpicker-list.png`, a table still being
                built where every unanswered cell carries one. */}
            <span className="cfg-row__delta" data-way={way(row.delta)}>
              {row.delta === null ? '—' : signedMoney(row.delta)}
            </span>
            {row.amount === null ? (
              /* NO FIGURE IS A SENTENCE AND NOT $0.00. Where the list has
                 a price level and this row leaves it empty, it says it
                 has no price at that level, by the level's declared name
                 ("No Cash price"; it printed the list's own column name
                 alone, "Sell Price", where the figure would be, until
                 m2-last-critique.md major 5). Where the list has no
                 price at all, the head of the list says so ONCE
                 (`unpricedSay`) and the row carries only its dash:
                 "no price column on this table" under every dealer-fit
                 and rigging row was six copies of one engine sentence
                 in one chapter (M2-close critique #4). */
              row.column === null ? null : (
                <span className="cfg-row__at">No {row.column} price</span>
              )
            ) : (
              <span className="cfg-row__at">
                {money(row.amount)}
                {row.column === null ? '' : ` at ${row.column}`}
              </span>
            )}
          </span>
        </span>
      </Tile>
      {row.why === '' ? null : <p className="cfg-opt__why">{row.why}</p>}
    </div>
  )
}

/**
 * ON THE QUOTE OR NOT, AS A TICK IN A DISC — never the row's colour alone.
 * The kit's option tile draws its choice three ways (a ring, a tick, a
 * filled figure); a row of the build has the Tile row's accent edge and its
 * wash, and this is the third, the one that reads without colour: an empty
 * ring for a row the press would put on, the accent filled with a white tick
 * for one already on the quote. It lands on the settle spring. Hidden from a
 * reader, who hears "on the quote" in the row's own name.
 */
function Tick({ on }: { on: boolean }) {
  return (
    <span className="cfg-tick" data-on={on ? '' : undefined} aria-hidden="true">
      <Icon glyph={CheckIcon} />
    </span>
  )
}

/** The pairing's own columns, reduced to what tells this shelf
 *  apart. `full` rides in `title`, so nothing is hidden. */
function Facts({ facts }: { facts: ShownFact[] }) {
  return (
    <span className="cfg-row__facts">
      {facts.map((fact, i) => (
        <span className="cfg-fact" key={fact.label} title={fact.full}>
          {i > 0 ? ' · ' : ''}
          <span className="cfg-fact__lab">{fact.label}</span> {fact.value}
        </span>
      ))}
    </span>
  )
}

/** THE MATCH IS BOLDED, which is the half of Porsche's search that
 *  makes a long name readable at a glance. Whole words only, the
 *  same needles the engine matched on, and the text is never
 *  truncated — nothing is hidden to make room for a mark. */
function Marked({ text, query }: { text: string; query: string }) {
  const words = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w !== '')
  if (words.length === 0) return <>{text}</>

  const lower = text.toLowerCase()
  const hits: Array<[number, number]> = []
  for (const word of words) {
    let from = 0
    for (;;) {
      const at = lower.indexOf(word, from)
      if (at < 0) break
      hits.push([at, at + word.length])
      from = at + word.length
    }
  }
  if (hits.length === 0) return <>{text}</>
  hits.sort((a, b) => a[0] - b[0])

  /* EACH PIECE KEEPS WHERE IN THE NAME IT STARTS, which is what keys
     it: a position in this string is a fact about the content, and an
     array index is a fact about the loop. */
  const out: Array<{ said: string; hit: boolean; from: number }> = []
  let at = 0
  for (const [from, to] of hits) {
    if (to <= at) continue
    const start = Math.max(from, at)
    if (start > at) out.push({ said: text.slice(at, start), hit: false, from: at })
    out.push({ said: text.slice(start, to), hit: true, from: start })
    at = to
  }
  if (at < text.length) out.push({ said: text.slice(at), hit: false, from: at })

  return (
    <>
      {out.map((piece) =>
        piece.hit ? (
          <b className="cfg-hit" key={piece.from}>
            {piece.said}
          </b>
        ) : (
          <span key={piece.from}>{piece.said}</span>
        ),
      )}
    </>
  )
}

/* ---------------------------------------------------------- */
/* Who it is for                                                */
/* ---------------------------------------------------------- */

/**
 * THE ONE CHAPTER NO TABLE CAN CARRY. This file has no customer
 * register — `hasCustomerRegister` reads false on the pack, measured
 * — so the name is typed, frozen onto the document the moment it is
 * typed, and belongs to this quote alone. That is not a shortcut: a
 * quote is a photograph, and a name corrected in a register on
 * Friday must not rewrite the document handed over on Monday.
 */
function Handover({
  quote,
  quoteId,
  refusal,
  setStep,
  setRefused,
}: {
  quote: QuoteDef
  quoteId: string
  refusal: string | undefined
  setStep: (step: Step) => void
  setRefused: (said: string | null) => void
}) {
  const [name, setName] = useState(quote.customer.name)
  const [contact, setContact] = useState(quote.customer.contact?.[0] ?? '')
  const issued = refusal !== undefined
  const savedContact = quote.customer.contact?.[0] ?? ''
  const pending =
    !issued &&
    (name.trim() !== quote.customer.name.trim() || contact.trim() !== savedContact.trim())

  const save = useCallback(() => {
    const outcome = quotesStore.getState().apply(
      quoteId,
      setCustomer({
        name: name.trim(),
        ...(contact.trim() === '' ? {} : { contact: [contact.trim()] }),
      }),
    )
    if ('refused' in outcome) {
      setRefused(outcome.refused === '' ? null : outcome.refused)
      return
    }
    setRefused(null)
    setStep({ said: outcome.said, eventId: outcome.event.id, wasUndo: false })
  }, [contact, name, quoteId, setRefused, setStep])

  /* WHAT IS TYPED HERE GOES ON THE QUOTE WHEN THE CHAPTER CLOSES (the component
     critique, 2026-09-28, major 10). Typing "Jordan Pike", pressing Tab and
     opening The finale threw the name away without a word, and the finale then
     said the quote was addressed to nobody — on a screen whose stage says
     "Saved as you go". So closing the chapter is the press: the same command,
     the same step in the toast with its Undo, and the finale opens on a quote
     that has the name. Leaving the build does the same, with nobody left to
     say it to. Only a difference is written, and it is read off the document
     as it stands at that moment: a closing chapter is drawn from its last
     props, and the second ask (the fold, then the unmount) must find nothing
     left to write. */
  const commit = (): void => {
    const standing = quotesStore.getState().quotes.find((q) => q.id === quoteId)
    if (!standing || standing.state !== 'draft') return
    const differs =
      name.trim() !== standing.customer.name.trim() ||
      contact.trim() !== (standing.customer.contact?.[0] ?? '').trim()
    if (differs) save()
  }
  const onClose = useEffectEvent(commit)
  const present = useIsPresent()
  /* before the paint, so the finale's first frame already reads the name */
  useLayoutEffect(() => {
    if (!present) onClose()
  }, [present])
  useEffect(() => () => onClose(), [])
  /* and Enter in either field is the press, as it is in any form */
  const onEnter = (event: ReactKeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing || issued) return
    event.preventDefault()
    commit()
  }

  return (
    <div className="cfg-table">
      <div className="cfg-table__head">
        {/* WHAT HAPPENS TO A NAME TYPED HERE, and nothing about where it
            is stored. This said "This price file carries no customer
            register … It is frozen onto the document", which was the
            engine explaining itself — and on this tree it was also
            wrong, since Customers keeps a book. */}
        <p className="cfg-table__why">
          The name and the contact line print on this quote exactly as typed. Once the quote is
          given they stay as they were, even if the customer&rsquo;s details change later.
        </p>
      </div>

      <div className="cfg-ask">
        <Field label="Who the quote is addressed to">
          <Input
            id="cfg-customer"
            value={name}
            onValueChange={setName}
            onKeyDown={onEnter}
            readOnly={issued}
            autoComplete="name"
            placeholder="Nobody named yet"
          />
        </Field>
      </div>
      <div className="cfg-ask">
        <Field label="One line of contact, as it should print">
          <Input
            id="cfg-contact"
            value={contact}
            onValueChange={setContact}
            onKeyDown={onEnter}
            readOnly={issued}
            placeholder="A phone number, an email, an address"
          />
        </Field>
      </div>
      <div className="cfg-act">
        <Button intent="act" icon={UserCheckIcon} onClick={save} refusedBecause={refusal}>
          {quote.customer.name.trim() === '' ? 'Address this quote' : 'Save the name'}
        </Button>
        {/* WHAT A PRESS, OR THE CHAPTER CLOSING, WILL DO, while the fields differ
            from the quote; the name itself is not in it, so the sentence changes
            once at the first keystroke and not at every one */}
        <p className="cfg-act__say">
          {pending
            ? 'What is typed goes on the quote when you press this, or when this chapter closes.'
            : quote.customer.name.trim() === ''
              ? 'Until it has a name it cannot be given to anybody, and the finale says so.'
              : `This quote is addressed to ${quote.customer.name}.`}
        </p>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* The finale                                                   */
/* ---------------------------------------------------------- */

/**
 * ISSUING IS THE ONE IRREVERSIBLE ACT IN THIS APP, so everything
 * that cannot be repaired afterwards is refused BEFORE the press,
 * with a sentence, in the place it is refused. Every one of those
 * sentences is `issueBlockers`' own: the button, this chapter and
 * the command itself ask the same pure function, and none of them
 * may disagree.
 */
function Finale({
  quote,
  quoteId,
  rail,
  openQuote,
  openDocument,
  now,
  arrives,
  setStep,
  setRefused,
}: {
  quote: QuoteDef
  quoteId: string
  rail: Rail
  openQuote?: (id: string) => void
  openDocument?: (id: string) => void
  now?: () => Date
  /** THE MOMENT IT IS GIVEN, and only that moment: a quote given on this
   *  screen brings its way on in (the kit's settle); one that was given
   *  before the build was opened is simply there, final. */
  arrives: boolean
  setStep: (step: Step) => void
  setRefused: (said: string | null) => void
}) {
  const issued = quote.state !== 'draft'

  /* the stamp's player is fetched while the act is still to be pressed, so the
     seal is not late for its own moment (GivenSeal.tsx) */
  useEffect(() => {
    if (!issued && !reducedMotion()) readyTheStamp()
  }, [issued])

  const give = useCallback(() => {
    const outcome = quotesStore.getState().apply(quoteId, issue())
    if ('refused' in outcome) {
      setRefused(outcome.refused === '' ? null : outcome.refused)
      return
    }
    setRefused(null)
    setStep({ said: outcome.said, eventId: outcome.event.id, wasUndo: false })
  }, [quoteId, setRefused, setStep])

  /* THE ONLY WAY ON FROM AN ISSUED DOCUMENT, and the engine's own:
     the frozen lines are copied across so the new draft carries the
     figures that were agreed, not today's reading of them. */
  const again = useCallback(() => {
    const filed = quotesStore.getState().quotes
    const at = now ? now() : new Date()
    const minted = newVersionOf(quote, referenceForNow(filed, at), at.toISOString())
    quotesStore.getState().file(minted.quote, minted.event)
    openQuote?.(minted.quote.id)
  }, [now, openQuote, quote])

  return (
    <div className="cfg-table">
      <dl className="cfg-sums">
        <div className="cfg-sum">
          <dt className="cfg-sum__lab">Lines</dt>
          <dd className="cfg-sum__val">{quote.lines.length.toLocaleString('en-AU')}</dd>
        </div>
        <div className="cfg-sum">
          <dt className="cfg-sum__lab">Not priced</dt>
          <dd className="cfg-sum__val">{rail.unpriced.toLocaleString('en-AU')}</dd>
        </div>
        <div className="cfg-sum">
          <dt className="cfg-sum__lab">Total</dt>
          <dd className="cfg-sum__val">
            <PriceFigure amount={rail.total} />
          </dd>
        </div>
      </dl>

      <p className="cfg-table__why">{sourcesSay(quote)}</p>

      {rail.doubleCharged.length > 0 ? (
        <div className="cfg-flag">
          {/* EVIDENCE, NEVER A REFUSAL. A dealer may legitimately add
              a transfer fee to a quote whose trailer is priced at a
              rung that already has registration in it — `Registration
              Costs` holds several such rows — so this says what is
              true and changes nothing. */}
          {rail.doubleCharged.map((said) => (
            <Said className="cfg-flag__say" key={said} glyph={CoinsIcon}>
              {said}
            </Said>
          ))}
        </div>
      ) : null}

      {issued ? (
        <motion.div
          className="cfg-act"
          /* 0.5rem is --spacing(2) */
          initial={arrives ? { opacity: 0, transform: 'translateY(0.5rem)' } : false}
          animate={{ opacity: 1, transform: 'translateY(0rem)' }}
          transition={transition('settle', false)}
        >
          {/* THE MOMENT THE SALE EXISTS (the component critique, 2026-09-28,
              major 8): giving the quote was a dot turning green. It is stamped
              now — an authored Lottie timeline (`seal.ts`, played by `GivenSeal`):
              the rosette in the given leaf lands like a stamp on paper, the
              tick draws itself across it, rays and a ripple leave it and are
              gone. Once, at the press, by the give's own event; a quote given
              before the build was opened wears the same seal still, and so does
              every quote under reduced motion or a caret. The price is not in
              it and nothing in it counts. */}
          <p className="cfg-given" data-testid="given-seal">
            <GivenSeal
              give={arrives ? (quote.events[quote.events.length - 1]?.id ?? null) : null}
            />
            <span className="cfg-given__words">
              <span className="cfg-given__to">Given to {quote.customer.name}</span>
              <span className="cfg-given__ref">
                Quote <span className="cfg-mono">{quote.reference}</span> · every price final
              </span>
            </span>
          </p>
          {/* an `output` rather than a paragraph with `role="status"`:
              the element already carries that role, and it is the tag
              for a result the page computed from what somebody did */}
          <output className="cfg-act__say">{ISSUED_REFUSAL}</output>
          {/* THE ACT OF SELLING LEADS SOMEWHERE NOW. It used to end
              here, under a sentence saying the document was not built
              yet, with `Make a new version` as the only onward
              control — so pressing the one irreversible act in this
              app stranded a dealer. The sheet is the act; the new
              version is the way BACK to work, and is quieter. */}
          <Button
            intent="act"
            icon={FileTextIcon}
            onClick={() => openDocument?.(quoteId)}
            refusedBecause={openDocument ? undefined : NO_DOCUMENT_HERE}
          >
            Open the document
          </Button>
          <p className="cfg-act__say">
            The printed quote, on A4, exactly as it was given — and it prints from the same page.
          </p>
          <Button
            intent="veiled"
            icon={CopyIcon}
            onClick={again}
            refusedBecause={openQuote ? undefined : NO_DOCUMENT_HERE}
          >
            Make a new version
          </Button>
          <p className="cfg-act__say">
            A new version starts from the prices agreed on this one, never today&rsquo;s.
          </p>
        </motion.div>
      ) : (
        <div className="cfg-act">
          <Button
            intent="act"
            icon={PaperPlaneTiltIcon}
            onClick={give}
            refusedBecause={rail.blockers.length > 0 ? rail.blockers.join(' ') : undefined}
          >
            Give it to the customer
          </Button>
          <p className="cfg-act__say">
            Once it is given it cannot be changed, only copied into a new version. {DOCUMENT_SAY}
          </p>
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------------------- */
/* Small pieces                                                 */
/* ---------------------------------------------------------- */

/** Which way a figure moves the total, for the stylesheet. A null
 *  is a third answer and never a zero. */
const way = (delta: number | null): string =>
  delta === null ? 'none' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'

/**
 * WHAT A CHAPTER CHOOSES, AS A GLYPH IN A DISC at the head's start — the
 * kit's chapter head. A chapter of the price file wears its KIND in the
 * kind's own ink (`KindMark`: the hull cobalt, a motor carmine, a trailer
 * ochre), read off the tables the engine put in it, so the ink is the
 * model's and never chosen here. The two chapters that are not a kind of
 * thing on the file wear what they are about in the plate's blue well: a
 * person for Who it is for, the chequered flag for the finale. Hidden from a
 * reader, who hears the chapter's name.
 */
function ChapterMark({ chapter }: { chapter: Chapter }) {
  const kind: TableKind | null =
    chapter.kind !== 'band'
      ? null
      : chapter.id === 'hull'
        ? 'boat'
        : (chapter.tables[0]?.kind ?? null)
  return (
    /* the disc's frame is this screen's, so the reading ring is drawn round it and never
       onto the kit's mark */
    <span className="cfg-head__disc" aria-hidden="true">
      {kind ? (
        <KindMark kind={kind} size="lg" />
      ) : (
        <span className="cfg-head__mark">
          {chapter.kind === 'band' ? null : (
            <Icon glyph={chapter.kind === 'handover' ? UserIcon : FlagCheckeredIcon} size="md" />
          )}
        </span>
      )}
    </span>
  )
}

/**
 * ONE SENTENCE THE SCREEN SAYS ABOUT A LIST OR A PRESS, led by the glyph of
 * what kind of sentence it is: a lock where nothing can change, an i where
 * something is explained, the stacked lines where one table holds several,
 * coins where a charge is already in a price, a warning where a press was
 * refused. The glyph is hidden from a reader; the sentence is the sentence,
 * word for word, as it was before the kit.
 */
function Said({
  className,
  glyph,
  alert,
  id,
  testId,
  ref,
  children,
}: {
  className: string
  glyph: Glyph
  alert?: boolean
  id?: string
  testId?: string
  ref?: RefObject<HTMLParagraphElement | null>
  children: ReactNode
}) {
  return (
    <p
      className={`${className} cfg-said`}
      id={id}
      role={alert ? 'alert' : undefined}
      data-testid={testId}
      ref={ref}
    >
      <span className="cfg-said__glyph" aria-hidden="true">
        <Icon glyph={glyph} />
      </span>
      <span className="cfg-said__words">{children}</span>
    </p>
  )
}

/**
 * WHERE THE READER IS ON THE RAIL — GSAP's ScrollTrigger, through the kit's
 * `useChapterProgress` (src/ui/scroll.ts): the chapter the middle of the
 * window is in wears `data-reading`, and its head's disc takes the accent's
 * ring (configurator.css), because "where you are" is the accent's job. It is
 * a position and not a motion, so it runs under reduced motion too; what
 * changes is a colour.
 *
 * IT IS ITS OWN COMPONENT, which draws nothing, so the rail of two hundred rows
 * around it is never re-rendered by where the reader is. The attribute is
 * written on the chapter itself, once per change of chapter.
 *
 * ITS TRIGGERS ARE MEASURED AGAIN BY THE KIT once a chapter opening or closing
 * has settled and the page has stood still for 200 ms, never on a frame of the
 * change (src/ui/scroll.ts, which took this screen's own measuring on
 * 2026-09-28): a refresh measures from the top of the page and back, and
 * measured at 390 × 844 a refresh on every frame of a chapter's growth kept
 * the build's move to Who it is for at the top of the page.
 *
 * THE RING FILLS AS THE CHAPTER IS READ, AND THE WHEEL IS LENIS'S (2026-09-29,
 * the components critique, major 12: "GSAP: one reading ring on the build";
 * "Lenis: /kit only"). The plan's chaptered scroll is GSAP's ScrollTrigger and
 * Lenis together, and "the foot pill's dash fills on the chapter you are in".
 * The build keeps its one ring and draws that dash in it: ScrollTrigger's
 * `through`, how far the window's middle is through the chapter, is written on
 * that chapter's disc as `--cfg-read` and the accent's arc runs round the
 * halo to it (configurator.css). It is written on the disc and not on the
 * chapter, because a custom property set on a chapter of two hundred rows
 * restyles every row under it on every frame; and it is a motion value read
 * without a render. The wheel on a desk is smoothed by the kit's Lenis
 * (`useSmoothScroll`: a fine pointer only, never under reduced motion, and the
 * browser's own wheel while a caret is in a field — the search is this
 * screen's navigation).
 */
function Reading({ chapters }: { chapters: readonly RefObject<HTMLElement | null>[] }) {
  const place = useChapterProgress(chapters)
  useSmoothScroll()
  useEffect(() => {
    chapters.forEach((ref, i) => {
      const el = ref.current
      if (!el) return
      if (i === place.at) el.dataset.reading = ''
      else delete el.dataset.reading
    })
  }, [chapters, place.at])
  useEffect(() => {
    const disc = chapters[place.at]?.current?.querySelector<HTMLElement>('.cfg-head__disc')
    if (!disc) return
    const write = (through: number): void => {
      disc.style.setProperty('--cfg-read', through.toFixed(3))
    }
    write(place.through.get())
    const stop = place.through.on('change', write)
    return () => {
      stop()
      disc.style.removeProperty('--cfg-read')
    }
  }, [chapters, place.at, place.through])
  return null
}

/**
 * A SENTENCE FROM `say.ts` WHOSE COUNTS ARE THE KIT'S `Figure` (2026-09-29, the
 * components critique, major 12). A count a press changes rolls to its new
 * value — the lines under the total as a motor goes on — and a count a caret
 * changes, the search's, lands at once. The words are `spell`'s, so the
 * sentence a test reads and the one drawn are one; the total above it is a
 * `PriceFigure` and is never one of these.
 */
function Counts({ said }: { said: Counted }) {
  return (
    <>
      {said.map((word) =>
        typeof word === 'string' ? word : <Figure key={word.of} value={word.count} />,
      )}
    </>
  )
}
