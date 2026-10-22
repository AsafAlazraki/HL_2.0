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
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  ArrowsInSimpleIcon,
  ArrowsLeftRightIcon,
  ArrowsOutSimpleIcon,
  CaretDownIcon,
  CheckIcon,
  CoinsIcon,
  CopyIcon,
  EngineIcon,
  FileTextIcon,
  FlagCheckeredIcon,
  FolderOpenIcon,
  InfoIcon,
  LockSimpleIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  PaperPlaneTiltIcon,
  PencilSimpleIcon,
  PlusIcon,
  ProhibitIcon,
  ScalesIcon,
  StackIcon,
  TagIcon,
  UserCheckIcon,
  UserIcon,
  WarningCircleIcon,
  WrenchIcon,
} from '@phosphor-icons/react'
import {
  Button,
  Chip,
  Dashes,
  Field,
  Icon,
  Input,
  Kbd,
  KindMark,
  OptionTile,
  Picture,
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
  type DashesProps,
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
  parseAmount,
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
import { swapLines } from '@/domain/quote/swap'
/* A CHAPTER WITH NOTHING ON IT HAS NO SUBTOTAL, and says so in the register's words, "Nothing on
   it yet". A chapter whose lines carry no figure says nothing in that cell: what is not priced is
   said once, under the total (`totalNoteSay`, docs/WORDS.md), where it stood as "Not priced on
   this quote" in four places on one screen. */
import { NOTHING_ON_IT } from '@/domain/quote/register'
import {
  matchesFinish,
  offeredHere,
  readRail,
  type Act,
  type OrphanFix,
  type Chapter,
  type ChapterTable,
  type OptionRow,
  type Rail,
} from './chapters'
import type { Finish, Finishes } from './finishes'
import { hostOf, hullHero, stageArt, type StageArt } from './stage'
import { itemOfQuote } from '@/data/pictures'
import { kindOfAct, kindOfBoat, wayBack, type Step } from './step'
import { GivenSeal, readyTheStamp } from './GivenSeal'
import {
  LEVEL_SAY,
  NO_LEVEL_SAY,
  allSay,
  cappedSay,
  choiceSay,
  inSentence,
  insteadSay,
  levelCountSay,
  pictureSays,
  reasonSay,
  savedSay,
  searchSay,
  sourcesSay,
  totalNoteSay,
  unpricedTag,
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
   · THE UNDO STANDS BESIDE THE TOTAL, AND THE ROW IS THE OTHER WAY
     BACK. Until 2026-09-28 the last step stood in the rail's head, a
     line that pushed the chapters down under every press; then it was
     the kit's toast in the corner, which below 1440px lay over the
     rail it was about — the Garmin's name at 1280, the tile just
     pressed at 834 and 390 — and stayed there two chapters later
     (the refine round, 2026-10-20). It is the masthead's own line now,
     between the boat and the total the step just changed (`StepLine`),
     where the band beside the pill is too narrow for a toast; from
     1440 it is the toast, top right, over nothing. Either way it ends
     when the dealer opens another chapter, Alt T takes the caret to
     its Undo and Escape gives it back, and it is offered only when it
     can work (`step.ts`). Every pick on this screen is a press that
     says whether it is on the quote, and pressing it again is its way
     back.
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
export const DOCUMENT_SAY = 'Once given, every price on it is final.'

/** Said where the press would have happened, on a host that handed
 *  this screen no way to open one. A test renders it with no router. */
export const NO_DOCUMENT_HERE =
  'This page has no way to open the printed quote. The quote is saved either way.'

/** WHAT MOVING THE RUNG DOES, AND WHERE IT IS DECIDED. This used to
 *  be a refusal — "the sheet that shows what that costs line by line
 *  is not built yet" — and it is retired the way the picker's was, by
 *  having built the thing. The sheet is `/quote/$id/cascade`, its own
 *  address, and nothing is written to the document until it is
 *  accepted there. */
export const CASCADE_SAY = LEVEL_SAY

/** WHERE THE KIT'S TOAST STANDS OVER NOTHING: the band beside the pill, from 1440px — the same
 *  query `src/ui/Toaster.tsx` places it by. Narrower, the step is the masthead's own line. */
const TOAST_STANDS = '(min-width: 1440px)'

function toastStandsNow(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(TOAST_STANDS).matches
}

/**
 * IN A HAND THE BUILD'S FIRST WINDOW ENDS BETWEEN TWO CHAPTERS, never through one
 * (refine-critique.md, major 5, 2026-10-21). With the bar at the foot, the window ended where
 * the content happened to be: the Highfield's "$25,355" stood at 784–805 and the bar begins at
 * 794, the Stacer's trailer "$8,703" the same, and on the Formosa the "03 Trailer" head itself
 * — half of it over the bar and half under, until the page moved. The stage's picture (the
 * photograph, or where the file holds none the maker's mark on its blue, the mark itself kept at
 * its own size) is the one thing on this screen whose height is a choice, so it takes the
 * height that ends a chapter 18px above the bar (the air the pill keeps over a head on a desk;
 * the bar stands 6px inside its room): never shallower than 2:1 of its width and never deeper
 * than it is wide, and of the chapters that can end there, the furthest down. Measured at
 * 390 × 844: the Highfield Sport 660's photograph 273px, the Formosa GRT 425's 309px, and the
 * Stacer 519's mark on a well of 205px, where each was 200 and 112. Where no chapter can end
 * there, the picture keeps its own height (configurator.css).
 *
 * FITTED AS THE BUILD ARRIVES AND WHEN THE WINDOW CHANGES, NEVER WHILE THE DEALER WORKS: a
 * chapter's head grows with its answer, and a photograph that moved with it would move the work
 * under the finger. So the floor is watched until the first touch, wheel, press or key, and
 * after that only the window is.
 *
 * MEASURED, NOT TYPED: the layout's own offsets, never the painted box (a chapter rises into
 * place on arrival), with the photograph's own height taken away, so the measure does not move
 * when it does. `.cfg` pads its foot by `--shell-foot`, so that padding is the bar's room in
 * px, and it is 0 wherever the bar is not at the foot.
 */
const ROOM_AIR = 12
/** where an element stands on the page, by the layout's offsets and never its painted box */
function pageTop(el: HTMLElement): number {
  let y = 0
  for (let at: HTMLElement | null = el; at; at = at.offsetParent as HTMLElement | null)
    y += at.offsetTop
  return y
}
function fitTheBoat(node: HTMLElement): () => void {
  if (typeof ResizeObserver === 'undefined') return () => {}
  let last = ''
  const fit = (): void => {
    const stage = node.querySelector<HTMLElement>('.cfg-stage')
    const shot = node.querySelector<HTMLElement>('.cfg-shot')
    const chapters = [...node.querySelectorAll<HTMLElement>('.cfg-chapter')]
    const foot = Number.parseFloat(getComputedStyle(node).paddingBlockEnd) || 0
    let best: number | null = null
    if (stage && shot && chapters.length > 0 && foot > 0 && pageTop(shot) < pageTop(chapters[0]!)) {
      const fold = window.innerHeight - foot - ROOM_AIR
      const was = shot.offsetHeight
      const wide = shot.offsetWidth
      for (const chapter of chapters) {
        const height = Math.floor(fold - (pageTop(chapter) + chapter.offsetHeight - was))
        if (height >= wide / 2 && height <= wide) best = height
      }
    }
    const said = best === null ? '' : `${best}px`
    if (!stage || said === last) return
    last = said
    if (said === '') {
      stage.style.removeProperty('--cfg-shot-hand')
      delete stage.dataset.fit
    } else {
      stage.style.setProperty('--cfg-shot-hand', said)
      stage.dataset.fit = ''
    }
  }
  fit()
  const watch = new ResizeObserver(fit)
  watch.observe(node)
  const settled = (): void => {
    watch.disconnect()
    for (const kind of TAKES_OVER) window.removeEventListener(kind, settled)
  }
  for (const kind of TAKES_OVER) window.addEventListener(kind, settled, { passive: true })
  window.addEventListener('resize', fit)
  return () => {
    settled()
    window.removeEventListener('resize', fit)
  }
}

/** Whether this window says the step in the kit's toast (true) or in the masthead's line. */
function useToastStands(): boolean {
  const [stands, setStands] = useState(toastStandsNow)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const query = window.matchMedia(TOAST_STANDS)
    const changed = (): void => setStands(query.matches)
    query.addEventListener('change', changed)
    return () => query.removeEventListener('change', changed)
  }, [])
  return stands
}

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
  /* AND, IN A HAND, THE PART OF IT THAT LIFTS AWAY (2026-09-29, the components critique's major 8:
     "a third of the build is chrome"). At 390 the head was 193px of sticky over an 844px
     window. There the eyebrow scrolls off with the page and only the name and the total stay:
     the head sticks at minus this — the eyebrow's row and the room above it, less the head's
     own foot padding, so the row that stays keeps the same air over it as under it. It is
     measured, because the eyebrow wraps where a long business name does. */
  /* WHAT LIFTS IS THE EYEBROW AND WHAT STANDS WITH IT, measured from the eyebrow's top to the
     row's: on a phone held either way the head sticks at minus that, so the row that stays lands
     where the eyebrow stood (configurator.css, "a short window's head"). It was the row's top less
     the head's foot padding, which is the same figure where the two paddings are equal (a hand's)
     and lifted the row under the pill where they are not (a phone turned over, under the pill). */
  const [mastHeight, setMastHeight] = useState<number | null>(null)
  const [mastLift, setMastLift] = useState(0)
  const measureMast = useCallback((node: HTMLElement | null) => {
    if (!node || typeof ResizeObserver === 'undefined') return
    const measure = (): void => {
      const height = Math.ceil(node.getBoundingClientRect().height)
      if (height > 0) setMastHeight(height)
      const row = node.querySelector<HTMLElement>('.cfg-mast__row')
      const brow = node.querySelector<HTMLElement>('.cfg-mast__eyebrow')
      if (row && brow) setMastLift(Math.max(0, Math.floor(row.offsetTop - brow.offsetTop)))
    }
    measure()
    const watch = new ResizeObserver(measure)
    watch.observe(node)
    return () => {
      watch.disconnect()
    }
  }, [])

  /* TWO FACTS ABOUT WHERE THE PAGE IS, written on the screen as attributes and never through a
     render, read once a frame while it moves:
       · `data-stuck` — the page has moved, so the head is a bar over it. The head's scroll edge
         then reads on a tablet's white tiles as well as on the room (834 × 1112: "Yamaha F200XC"
         was cut through at the head's foot with no edge), and a short window's head keeps only
         its row (configurator.css).
       · `data-boat-away` — the stage's photograph has gone up under the head. On a tablet the
         boat arrives at the width of the screen, above its specification, and only once it has
         scrolled away does the head carry it beside the name (build-close-critique-2.md major 4:
         "at 834 the boat is a 250 × 140 thumbnail for the whole build"). The head grows by the
         photograph only while the page is scrolled, where the browser's scroll anchoring keeps
         every word under it where it was. */
  const watchFloor = useCallback((node: HTMLElement | null) => {
    if (!node) return
    let frame = 0
    const look = (): void => {
      frame = 0
      const stuck = window.scrollY > 0
      if (stuck !== 'stuck' in node.dataset) {
        if (stuck) node.dataset.stuck = ''
        else delete node.dataset.stuck
      }
      const shot = node.querySelector('.cfg-shot')?.getBoundingClientRect()
      const mast = node.querySelector('.cfg-mast')?.getBoundingClientRect()
      const away = shot !== undefined && mast !== undefined && shot.bottom < mast.bottom
      if (away !== 'boatAway' in node.dataset) {
        if (away) node.dataset.boatAway = ''
        else delete node.dataset.boatAway
      }
    }
    const soon = (): void => {
      if (frame === 0) frame = requestAnimationFrame(look)
    }
    look()
    window.addEventListener('scroll', soon, { passive: true })
    window.addEventListener('resize', soon)
    const unfit = fitTheBoat(node)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', soon)
      window.removeEventListener('resize', soon)
      unfit()
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
            : act.do === 'swap'
              ? swapLines(act.swap)
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

  /* THE LAST STEP IS SAID WHERE IT COVERS NOTHING (the refine round, 2026-10-20). It was a
     line inserted above the chapters until 2026-09-28, 56px that pushed every chapter down under
     the pointer at the press; then the kit's toast, which below 1440 stood in the corner over
     the rail it was about — the Garmin's name at 1280, the F175XCB tile just pressed at 834 and
     844 × 390, the F200XC's price at 390 — and stayed there two chapters later. From 1440 the
     toast stands in the band beside the pill, over nothing. Narrower, the step is the
     masthead's own line, between the boat and the total it changed (`StepLine`), and nothing
     stands over the rail.

     ONE STEP, ONE PLACE: every step is raised under this document's own id, so the next step
     changes the line where it stands and a way back from a step that is no longer the last is
     never on the screen (`step.ts`). A step with no way back — giving the quote to the
     customer, the one act with none — takes it away: the finale's seal is where that moment is
     said. OPENING ANOTHER CHAPTER ENDS IT (`endStep`): the step belongs to the chapter it was
     made in, and a toast that outlived it lay over the next two. Leaving the build takes it
     away too, since its Undo writes to this document and nowhere else. */
  const toasts = useToastStands()
  const stepToast = `step:${quoteId}`
  const back = step && quote ? wayBack(step, quote) : null
  useEffect(() => {
    const standing = step ? quotesStore.getState().quotes.find((q) => q.id === quoteId) : undefined
    const way = step && standing ? wayBack(step, standing) : null
    if (!step || way === null || !toasts) {
      unsay(stepToast)
      return
    }
    undo(step.said, () => goBack(step), {
      id: stepToast,
      testId: 'last-step',
      way,
      kind: step.kind,
    })
  }, [step, quoteId, stepToast, goBack, toasts])
  useEffect(() => () => unsay(stepToast), [stepToast])
  const endStep = useCallback(() => {
    setStep(null)
    setRefused(null)
  }, [])

  /* ALT T TAKES THE CARET TO THE STEP'S WAY BACK, AND ESCAPE GIVES IT BACK — the toast's own
     two keys (Sonner's), kept for the line that stands in its place below 1440. Where the caret
     was is remembered, and the way back's own press keeps the caret on it, as the toast's did. */
  const caretWas = useRef<HTMLElement | null>(null)
  const stepLine = useRef<HTMLOutputElement>(null)
  const toTheStep = useEffectEvent((event: KeyboardEvent) => {
    const line = stepLine.current
    if (!line) return
    if (event.altKey && event.code === 'KeyT') {
      const backPress = line.querySelector<HTMLElement>('button')
      if (!backPress) return
      event.preventDefault()
      if (!line.contains(document.activeElement)) {
        caretWas.current =
          document.activeElement instanceof HTMLElement ? document.activeElement : null
      }
      backPress.focus()
    } else if (event.key === 'Escape' && line.contains(document.activeElement)) {
      event.preventDefault()
      caretWas.current?.focus()
      caretWas.current = null
    }
  })
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => toTheStep(event)
    globalThis.addEventListener('keydown', onKey)
    return () => globalThis.removeEventListener('keydown', onKey)
  }, [])

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

  /* CTRL Z AND CTRL SHIFT Z, AS THE SHEET HAS THEM (build-close-critique.md, 2026-10-19, major
     1: "Undo lives only in the toast, which is gone after about 5 seconds. The build has no Ctrl
     Z, although the sheet does"). The same store, the same stack, the same sentences: the toast
     says the step the keys took, with its own way back. A key typed into a field is the field's
     own undo, and is left to it. */
  const keyedBack = useEffectEvent((again: boolean) => {
    const store = quotesStore.getState()
    hold()
    const outcome = again ? store.redo(quoteId) : store.undo(quoteId)
    if ('refused' in outcome) {
      setRefused(outcome.refused === '' ? null : outcome.refused)
      return
    }
    setRefused(null)
    setStep({ said: outcome.said, eventId: outcome.event.id, wasUndo: !again, kind: step?.kind })
  })
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey || isField(event.target)) return
      const key = event.key.toLowerCase()
      if (key === 'z') {
        event.preventDefault()
        keyedBack(event.shiftKey)
      } else if (key === 'y' && !event.shiftKey) {
        event.preventDefault()
        keyedBack(true)
      }
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
  useBroughtIn(chaptersRef, here, at, rail?.searching === true)

  /* THE BOAT'S PICTURE, read once for the two places that draw it: the stage, and the finale
     where the stage is not beside it (below 1200px, where the finale hands the photograph to the
     paper). `stage.ts` argues the rung. */
  const art: StageArt | null = useMemo(
    () =>
      quote
        ? stageArt(
            itemOfQuote(quote),
            ctx.entities[quote.rootTableId]?.name ?? '',
            hullHero(ctx, quote),
          )
        : null,
    [ctx, quote],
  )

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
            say: 'Each part of this quote, on this screen.',
            rows: (words: string) =>
              readRail(ctx, quote, { query: words, showAll }).chapters.map((chapter) => ({
                id: `here:${chapter.id}`,
                name: chapter.num === '' ? chapter.name : `${chapter.num} ${chapter.name}`,
                fact: chapter.fact,
                verb: 'Go to it',
                target: { at: 'here' as const, id: chapter.id },
              })),
            go: (id: string) => {
              endStep()
              goTo?.(id)
            },
          }
        : null,
    [ctx, quote, open, showAll, goTo, endStep],
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

  /* THE PRICE THE QUOTE IS AT, by its declared name ("Cash"): a figure at that price says
     nothing more about it, and only one at another price says which (`OptionCard`) */
  const level = rail?.rungs.find((rung) => rung.key === quote.levelKey)?.label ?? null
  /* WHILE THE FINALE IS OPEN ITS CARD SAYS THE TOTAL, and the masthead says no figure
     (docs/WORDS.md: "the quote's total … on the finale card once the finale is open") */
  const finaleOpen = here === 'finale' && rail?.searching !== true
  const note = rail
    ? totalNoteSay(rail.unpricedNames, hullHasNoPrice(quote), rail.unpricedLists)
    : ''

  /* THE STEP'S LINE IN THE HEAD, below 1440 (`StepLine`): the step and its way back, or the
     engine's refusal of the last press, in its own words */
  const said =
    !toasts && step !== null && back !== null ? (
      <StepLine
        ref={stepLine}
        said={step.said}
        kind={step.kind}
        way={back}
        onBack={() => goBack(step)}
      />
    ) : refused ? (
      <Said className="cfg-alarm" glyph={WarningCircleIcon} alert>
        {refused}
      </Said>
    ) : null

  return (
    <main
      ref={watchFloor}
      className="cfg"
      data-testid="configurator"
      /* THE QUOTE WAS GIVEN HERE A MOMENT AGO: the stage's photograph catches the light once
         as the seal lands (configurator.css, "the moment it is given") */
      data-given-now={justGiven ? '' : undefined}
      /* GIVEN: the boat's photograph wears the given leaf as its frame (configurator.css) */
      data-given={issued ? '' : undefined}
      style={
        mastHeight === null
          ? undefined
          : ({
              '--cfg-mast': `${mastHeight}px`,
              '--cfg-mast-lift': `${mastLift}px`,
            } as CSSProperties)
      }
    >
      <Mast
        head={measureMast}
        art={art}
        quote={quote}
        business={business}
        total={rail?.total ?? null}
        open={open}
        said={said}
        note={finaleOpen ? '' : note}
        elsewhere={finaleOpen}
      />

      <div className="cfg-floor">
        <Stage
          quote={quote}
          ctx={ctx}
          art={art!}
          open={open}
          kept={kept}
          who={who}
          rail={rail}
          raise={raise}
          refusal={refusal}
        />

        <section
          className="cfg-rail"
          aria-label="What goes on this quote"
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
            {/* THE FIELD AND, WHERE THE BAR STICKS, WHERE THE READER IS: the kit's dashes
                beside it (`Reading`), which fill on the chapter the window is in. */}
            <div className="cfg-find__row">
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
              <Reading
                chapters={chapterRefs}
                open={rail?.searching === true ? -1 : chapters.findIndex((c) => c.id === here)}
                names={chapters.map((c) =>
                  c.num === '' ? { name: c.name } : { name: c.name, number: c.num },
                )}
              />
            </div>
            {/* ONE LINE, KEPT WHETHER OR NOT IT SAYS ANYTHING, so the band that sticks is the same
                height at rest and while it answers. A refused press is said in the head beside
                the total, never here: parked in this band it grew the bar 40px and stood over the
                hull's title for half a minute (build-close-critique-2.md minor 7). */}
            <p className="cfg-find__said" id="cfg-find-said">
              {searchSay(rail, open)}
            </p>
          </div>

          {/* THE CHAPTERS RISE INTO PLACE ON A DRAFT'S FIRST PAINT, a few frames
              apart (configurator.css); an issued document is still from its first
              frame, because every figure on it is final. */}
          <div
            className="cfg-chapters"
            ref={chaptersRef}
            data-rise={quote.state === 'draft' ? '' : undefined}
          >
            {chapters.map((chapter, i) => (
              <ChapterCard
                key={chapter.id}
                at={chapterRefs[i]}
                index={i}
                chapter={chapter}
                quote={quote}
                rail={rail!}
                open={chapter.id === here}
                here={here}
                searching={rail?.searching === true}
                query={query}
                level={level}
                onOpen={() => {
                  endStep()
                  goTo?.(chapter.id)
                }}
                onFinale={() => {
                  endStep()
                  goTo?.('finale')
                }}
                onWho={() => {
                  endStep()
                  goTo?.('handover')
                }}
                onPress={press}
                go={go}
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
                art={art}
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
      const quiet = reducedMotion()
      chapter.scrollIntoView({
        block: chapter.getBoundingClientRect().height > room ? 'start' : 'nearest',
        behavior: quiet ? 'instant' : 'smooth',
      })
      if (quiet) uncut(chapter)
      else window.addEventListener('scrollend', () => uncut(chapter), { once: true })
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

/** How long a folded chapter's body takes to leave the page when it folds on the kit's exit
 *  (`--duration-exit`, 140ms), and the frame after it. */
const FOLDS_MS = 180

/**
 * A CHAPTER PRESSED OPEN IS BROUGHT TO THE HAND (2026-09-29, the components critique's major 8:
 * "pressing '02 Motor' opened it where it stood, with its head at the foot under the pill and its
 * tiles below the fold. Nothing brought it into view").
 *
 * `useOnward` moves the window for a write that moved the open chapter on; a press on a head
 * writes the address instead, and nothing moved at all. Now, when the address names a new
 * chapter — its head pressed, or the finder's "Go to it" — and its head stands low in the room
 * under the bars that stick (below two fifths of it), or under them, the chapter is brought in by
 * its head once the one it replaced has folded away: the head just under the bars, its body
 * growing into the window below it. A head already high in the room is left where it was
 * pressed, since its body opens into view, and the first address a build is opened at moves
 * nothing. Smoothly, and at once under reduced motion.
 *
 * THE READER TAKES OVER. A wheel, a touch, a key or a press while the move is waiting drops it,
 * and while it is running stops it where it stands: whoever is already reading or pressing in
 * the chapter has it where they want it, and a move under a press would move what was pressed.
 */
function useBroughtIn(
  rail: RefObject<HTMLDivElement | null>,
  here: string,
  at: string,
  searching: boolean,
): void {
  const was = useRef(at)
  /* how to drop the move that is waiting or running, while there is one */
  const pending = useRef<(() => void) | null>(null)
  useEffect(() => () => pending.current?.(), [])
  useEffect(() => {
    const before = was.current
    was.current = at
    if (at === '' || at === before || searching || here !== at) return
    const chapter = rail.current?.querySelector<HTMLElement>(`[data-chapter="${here}"]`)
    if (!chapter || typeof chapter.scrollIntoView !== 'function') return
    pending.current?.()

    let timer: number | null = null
    let moving = false
    const done = (): void => {
      if (timer !== null) window.clearTimeout(timer)
      timer = null
      moving = false
      for (const type of TAKES_OVER) window.removeEventListener(type, takeOver, true)
      window.removeEventListener('scrollend', arrived)
      if (pending.current === done) pending.current = null
    }
    /* the move ran to its end with nobody taking over: no head is left half under the bars */
    function arrived(): void {
      done()
      uncut(chapter!)
    }
    function takeOver(): void {
      if (moving) window.scrollTo({ top: window.scrollY, behavior: 'instant' })
      done()
    }
    const bring = (): void => {
      const cover = coverOf(chapter)
      chapter.style.setProperty('--cfg-cover', `${cover}px`)
      const foot = Number.parseFloat(getComputedStyle(chapter).scrollMarginBlockEnd) || 0
      const room = window.innerHeight - cover - foot
      const top = chapter.getBoundingClientRect().top
      /* AND NO HEAD LEFT HALF UNDER THE BARS (build-close-critique.md, 2026-10-19, minor 5: the
         page settled with "Trailer" cut through its title under the search band at 1440, and
         "Trailer $8,703" under the head's veil at 834). A pressed chapter already high in the
         room stays where it is only if the one above it is either wholly in view or wholly
         under the bars; otherwise it is brought up by its head, and the cut head goes under. */
      const cut = cutAbove(chapter, cover) !== null
      if (top >= cover && top <= cover + room * 0.4 && !cut) {
        done()
        return
      }
      const quiet = reducedMotion()
      chapter.scrollIntoView({ block: 'start', behavior: quiet ? 'instant' : 'smooth' })
      if (quiet) {
        done()
        uncut(chapter)
        return
      }
      moving = true
      window.addEventListener('scrollend', arrived)
      timer = window.setTimeout(done, BRINGS_MS)
    }
    for (const type of TAKES_OVER)
      window.addEventListener(type, takeOver, { capture: true, passive: true })
    pending.current = done
    timer = window.setTimeout(
      () => {
        timer = null
        bring()
      },
      reducedMotion() || caretInField() ? LEAVES_MS : FOLDS_MS,
    )
  }, [rail, here, at, searching])
}

/** What a reader does that takes the window over from a move the build started. */
const TAKES_OVER = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const

/** The longest a smooth move into place is waited on, where a browser says nothing at its end. */
const BRINGS_MS = 1000

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

/**
 * NO HEAD RESTS HALF UNDER THE BARS (build-close-critique.md, 2026-10-19, minor 5). A chapter the
 * build brought up by its head puts the one above it wholly under the bars — unless the page ends
 * first: measured at 834 × 1112, Motor brought up on the 519 stopped with the hull's head cut
 * through its words under the head's veil, the page at its foot. Where the head above is left
 * straddling the bars, the window comes back up until it is wholly in view.
 */
function uncut(chapter: HTMLElement): void {
  const cover = coverOf(chapter)
  const above = cutAbove(chapter, cover)
  if (above === null) return
  const gap = Number.parseFloat(getComputedStyle(chapter).scrollMarginBlockStart) - cover || 0
  window.scrollBy({
    top: above.top - cover - gap,
    behavior: reducedMotion() ? 'instant' : 'smooth',
  })
}

/**
 * THE HEAD ABOVE A CHAPTER THAT STRADDLES THE BARS, IF ANY, AND NOT ONLY THE ONE NEXT TO IT
 * (the build's closing verify, 2026-10-20). At 1440 "On to the finale" shut Who it is for and
 * opened the finale where it stood, so the chapter next to it was wholly in view while Dealer
 * fit, two above, rested cut through its words under the search band. Walked upwards: the
 * first head wholly under the bars ends the walk, since every one above it is under them too.
 */
function cutAbove(chapter: HTMLElement, cover: number): DOMRect | null {
  for (let el = chapter.previousElementSibling; el !== null; el = el.previousElementSibling) {
    /* a chapter's HEAD, not its whole box: an open chapter above whose list runs under the
       bars is a list scrolled past, and bringing its top back would push the pressed chapter
       down out of reach */
    const box = (el.querySelector('.cfg-head') ?? el).getBoundingClientRect()
    if (box.bottom <= cover + 1) return null
    if (box.top < cover) return box
  }
  return null
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
            The quotes on this computer could not be read. {problem}
          </p>
        ) : !read ? (
          <p className="cfg-blank__say">Reading the quotes…</p>
        ) : (
          /* IN THE DEALER'S WORDS, WHAT IS TRUE TODAY. This ended "that
             arrives with the backend at Milestone 6" — a word from this
             repository's plan, shown to a dealership (rule c,
             built-critique-m2.md #14). What a person at this desk needs
             is where their quote is, not when the plan says it moves. */
          <p className="cfg-blank__say">
            <b>No quote at this address.</b> A quote stays on the computer it was written on, so a
            link to one opens only there.
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
  art,
  quote,
  total,
  open,
  said,
  note,
  elsewhere,
}: {
  /** where the screen measures this head, so what sticks under it
   *  sticks under it */
  head?: (node: HTMLElement | null) => void
  /** the boat's picture, which the head carries on a tablet once the stage's has scrolled away */
  art: StageArt | null
  quote: QuoteDef
  business: string | null
  total: number | null
  open: boolean
  /** the last step and its way back, or the refusal of the last press, below 1440 */
  said: ReactNode
  /** what is not in the total, said once, under it (`totalNoteSay`); '' for nothing */
  note: string
  /** the finale is open and its card says the total and who it is for, so this head says
   *  neither */
  elsewhere: boolean
}) {
  const boat = boatOfQuote(quote)
  const photo = art?.kind === 'photograph' ? art.held : null
  return (
    <header className="cfg-mast" ref={head}>
      {/* THE BOAT STAYS IN VIEW ON A TABLET (build-close-critique.md, 2026-10-19, major 3: at
          834 × 1112, "after a press on Motor … the only boat on screen is a 40 px motor
          thumbnail, until the finale"). The head is the one bar that sticks below a desk, so on
          a tall tablet it carries the boat's own photograph beside its name and the total — but
          only once the stage's photograph, the width of the screen on arrival, has scrolled up
          under it (`data-boat-away`; build-close-critique-2.md major 4: "the boat is a 250 × 140
          thumbnail for the whole build"). Everywhere else it is not drawn: at a desk the stage's
          photograph stands beside the rail the whole sale, and in a hand the head is one row. */}
      {photo ? (
        <span
          className="cfg-mast__pic"
          data-verdict={photo.verdict}
          style={
            { '--cfg-travel': boatTravel(quote.rootTableId, quote.rootRowId) } as CSSProperties
          }
        >
          {/* the stage's photograph again, so it is named once, there: the caption under the
              band says it in words wherever this one stands in for it */}
          <img
            className="cfg-mast__img"
            src={photo.src}
            alt=""
            width={photo.width}
            height={photo.height}
            loading="lazy"
            decoding="async"
            {...(photo.widths.length > 1
              ? {
                  srcSet: photo.widths.map((w) => `${w.src} ${w.width}w`).join(', '),
                  sizes: '(min-width: 1200px) 1px, (max-width: 639px) 1px, 384px',
                }
              : {})}
          />
        </span>
      ) : null}
      {/* THE EYEBROW IS ITS OWN ROW, the one a hand's head lifts away as the page moves; the
          business's name in it is the first thing a hand gives up (configurator.css) */}
      <p className="cfg-eyebrow cfg-mast__eyebrow">
        {/* no business here (2026-10-21): the crest is Northside's own mark (docs/WORDS.md) */}
        Quote <span className="cfg-mono">{quote.reference}</span> ·{' '}
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
        {/* WHO IT IS FOR, once it is for somebody (build-close-critique.md, 2026-10-19, minor 4:
            "the masthead never names the customer") — and not while the finale is open, where the
            card under it names them large ("For Jordan Avery", "Given to Jordan Avery"): the name
            was in the eyebrow, Who it is for's head and the card in one window (the refine round,
            2026-10-21) */}
        {elsewhere || quote.customer.name.trim() === '' ? null : (
          <span className="cfg-mast__for"> · for {quote.customer.name.trim()}</span>
        )}
      </p>
      {/* THE FIGURE AND WHAT IS SAID ABOUT IT, AS ONE THING A TEST AND A READER FIND: the row and
          the line under it, with no box of their own (configurator.css), so each still takes its
          own place in the head at every width */}
      <div className="cfg-mast__body" data-testid="running-total">
        <div className="cfg-mast__row">
          <div className="cfg-mast__who">
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

          {/* THE STEP, WHERE THE TOAST WOULD HAVE COVERED THE RAIL (`StepLine`): between the boat
            and the figure it changed, in the head that sticks at every width below a desk's */}
          {said ? <div className="cfg-mast__step">{said}</div> : null}

          {/* THE FIGURE, AND NOT A SECOND TIME: while the finale is open its card states the total
            the quote is given at, large, and this head keeps the figure's place and says none
            (hidden, never removed, so the row keeps its height) */}
          <div
            className="cfg-money"
            data-elsewhere={elsewhere ? '' : undefined}
            aria-hidden={elsewhere ? true : undefined}
          >
            <p className="cfg-money__lab">Total</p>
            {total === null || !open ? (
              <p className="cfg-money__none">—</p>
            ) : (
              <p className="cfg-money__fig">
                <PriceFigure amount={total} />
              </p>
            )}
          </div>
        </div>
        {/* WHAT IS NOT IN THE TOTAL, ONCE, UNDER IT (docs/WORDS.md): the rigging kit the price list
          gives no price, in the words a dealer says it to the customer beside him — before the
          quote is given rather than on the paper after (build-close-critique-2.md major 5).
          Nothing about how the figure was added up: that stood here as "4 lines, each at the price
          it was picked at" and was the engine beside the figure (2026-09-29). */}
        {note === '' ? null : (
          <p className="cfg-mast__note" data-testid="total-note">
            {note}
          </p>
        )}
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
  art,
  open,
  kept,
  who,
  rail,
  raise,
  refusal,
}: {
  quote: QuoteDef
  ctx: CatalogueCtx
  /** the boat's picture, read by the build (`stage.ts`) */
  art: StageArt
  open: boolean
  kept: string | null
  who: string | null
  rail: Rail | null
  raise: (fix: string) => void
  refusal: string | undefined
}) {
  const register = ctx.entities[quote.rootTableId]?.name ?? ''
  /* THE HULL'S OWN PHOTOGRAPH ON THE WATER WHERE THE LEDGER HOLDS
     ONE, and the catalogue copy where it does not (`art`, read by the
     build). `stage.ts` argues the rung at length; what it buys this
     screen is a stage worth the name — 2560px of scene instead of
     1100px of studio render, so the boat can be drawn at the size the
     direction promised without ever passing the pixels the ledger holds. */
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

  /* EVERYTHING ON THE STAGE BUT THE PHOTOGRAPH, MEASURED, so at a desk the photograph takes the
     room the window has left and the stage ends above the floor's foot, where nothing can push
     it under the head (configurator.css, "the stage fits the window"). Written on the stage as a
     custom property, never through a render; the photograph's own height is taken away, so the
     measure does not move when the photograph does. */
  const stage = useRef<HTMLElement>(null)
  useEffect(() => {
    const node = stage.current
    const shot = node?.querySelector<HTMLElement>('.cfg-shot')
    if (!node || !shot || typeof ResizeObserver === 'undefined') return
    const measure = (): void => {
      const rest = node.getBoundingClientRect().height - shot.getBoundingClientRect().height
      node.style.setProperty('--cfg-stage-rest', `${Math.max(0, Math.ceil(rest))}px`)
    }
    measure()
    const watch = new ResizeObserver(measure)
    watch.observe(node)
    return () => {
      watch.disconnect()
    }
  }, [])

  return (
    <section className="cfg-stage" ref={stage} aria-label="The boat this quote is about">
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
                      '(max-width: 1199px) and (max-height: 700px) 288px, (max-width: 1199px) 100vw, (max-width: 1439px) 44vw, 48vw',
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
          <p className="cfg-note">The price list gives no specifications for this boat.</p>
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
            The price list is not loaded on this computer, so nothing can be added. Every price
            already on this quote stays as it is.
          </p>
        )}
        <p className="cfg-note">
          {[
            who ? `Prepared by ${quote.preparedBy ?? who}.` : '',
            savedSay(kept, quote.state !== 'draft'),
          ]
            .filter((part) => part !== '')
            .join(' ')}
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
  /* WHAT IS NOT PRICED IS SAID ONCE, UNDER THE TOTAL (docs/WORDS.md; the refine round,
     2026-10-21): "Cash · 3 of 4 items priced" beside the level said again what the line under the
     total names ("Rigging Kits have no price on the price list, so …"), in the same window, on a
     draft and on a given quote alike. Only the level's own capsule carries a count — the other
     prices are a press, "See what Trade does" — so the count compares nothing. It stays only where
     it says something the line under the total does not: an item priced at another level, or by
     hand.
     COUNTED AS PRICED, NOT AS CARRYING THE PRICE'S NAME (the refine round, Home and the Haines
     525F): a Haines boat carries Cash with no figure in it, so the count read "2 of 3 items
     priced" over one priced item, the third saying of the boat's missing price in one window.
     An item counts only where this price gives it a figure and no hand changed it. */
  const counted = (key: string): string => {
    const priced = quote.lines.filter(
      (line) =>
        typeof line.overridePrice !== 'number' &&
        line.levels.some((level) => level.key === key && level.value !== null),
    ).length
    return priced < quote.lines.length && quote.lines.length - priced !== (rail?.unpriced ?? -1)
      ? levelCountSay(priced, quote.lines.length)
      : ''
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
              {counted(on.key)}
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
                {counted(rung.key)}
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
      {children === '' ? null : <span className="cfg-rung__count">{children}</span>}
    </span>
  )
}

/* ---------------------------------------------------------- */
/* One chapter                                                  */
/* ---------------------------------------------------------- */

/**
 * WHAT A HEAD SAYS AFTER ITS NAME, WHERE THE CHAPTER IS NOT THE PRICE LIST'S (the refine round,
 * 2026-10-21). With no name on the quote one window said it three ways: "nobody named yet" in Who
 * it is for's head, "A quote needs a name before it can be given." under its act, and "not ready
 * to give yet" in the finale's head; with the finale open, the card's "For nobody named yet" and
 * the give's refusal made it four. Now it is said once, where it is acted on:
 *  · Who it is for's head says "nobody named yet" while neither it nor the finale is open. Open,
 *    the sentence under its act says it; with the finale open, the give's refusal does.
 *  · The finale's head says where the give stands only while it is shut. Open, its card and its
 *    act say it (`Finale`), and the missing name is never the finale head's (chapters.ts).
 */
function headFact(chapter: Chapter, open: boolean, here: string, quote: QuoteDef): string {
  if (chapter.kind === 'finale') return open ? '' : chapter.fact
  if (chapter.kind === 'handover' && quote.customer.name.trim() === '')
    return here === 'handover' || here === 'finale' ? '' : chapter.fact
  return chapter.fact
}

function ChapterCard({
  at,
  index,
  chapter,
  quote,
  rail,
  open,
  here,
  searching,
  query,
  level,
  onOpen,
  onFinale,
  onWho,
  onPress,
  onRaise,
  onShowAll,
  refusal,
  quoteId,
  art,
  openQuote,
  openDocument,
  now,
  justGiven,
  setStep,
  setRefused,
  go,
}: {
  /** follow an address without a page load — a rule's sentence to the rule on /rules */
  go?: (href: string) => void
  /** where the reading light finds this chapter */
  at: RefObject<HTMLElement | null> | undefined
  /** its place in the rail, for the rise on a draft's first paint */
  index: number
  chapter: Chapter
  quote: QuoteDef
  rail: Rail
  open: boolean
  /** the chapter that is open, which decides what a head says of a fact its body says */
  here: string
  searching: boolean
  query: string
  /** the price the quote is at, by its declared name */
  level: string | null
  onOpen: () => void
  /** opens the finale, the step after the name */
  onFinale: () => void
  /** opens Who it is for, from the finale of a quote with no name on it */
  onWho: () => void
  onPress: (act: Act) => void
  onRaise: (fix: string) => void
  onShowAll: (id: string) => void
  refusal: string | undefined
  quoteId: string
  /** the boat's picture, for the finale where the stage is not beside it */
  art: StageArt | null
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
  /* THE FIGURE ON THE QUOTE IS SAID ONCE IN AN OPEN CHAPTER (the refine round, 2026-10-21: after
     a swap "$16,667" stood in the head, on the tile's "on the quote" pill and in the toast). Shut,
     the head is the outline and says the chapter's figure and picture. Open, where the one thing
     on the quote is drawn under it with that same figure, the tile says it, beside the others'
     differences it is read against, and the head is its name and its answer. A chapter with two
     things on it keeps its sum, which no tile says. */
  const onFigures = [
    ...chapter.tables.flatMap((t) => [...t.rows, ...t.also]).filter((r) => r.fitted),
    ...(chapter.finishes?.rows.filter((f) => f.current) ?? []),
  ]
    .map((r) => r.amount)
    .filter((a): a is number => a !== null)
  const toldBelow =
    showing &&
    !searching &&
    chapter.kind === 'band' &&
    onFigures.length === 1 &&
    onFigures[0] === chapter.amount
  /* the head's answer: what is on the quote, then what is still open */
  const said = chapter.said ?? ''
  const rest = chapter.rest ?? headFact(chapter, showing, searching ? '' : here, quote)
  /* WHAT FOLLOWS THE ANSWER, quietly, as one run: what is still open, then (only while a search
     narrows the rail) whether the search reached this chapter. A CHAPTER THE SEARCH DID NOT REACH
     SAYS SO ON ITS OWN HEAD: it stays shut, in its place, still stating its answer, but a head
     reading "3 more offered" over a rail that has narrowed reads as a chapter with matches in it
     that simply is not open. */
  const tail = [
    rest,
    choiceSay(chapter, searching).replace(/^ · /, ''),
    searching
      ? chapter.matched > 0
        ? `${chapter.matched.toLocaleString('en-AU')} match`
        : 'nothing here matches'
      : '',
  ]
    .filter((part) => part !== '')
    .join(' · ')
    /* A COUNT KEEPS ITS WORD: at 390 the head broke "· 6" from "more offered" */
    .replace(/(\d) /g, '$1 ')

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

  /* THE CHAPTER'S ONE "FOR THE WORKSHOP" (`ShopSwitch`), drawn where an option in it has words for
     the workshop and no search is already holding them open */
  const [shop, setShop] = useState(false)
  const shopped =
    !searching &&
    chapter.tables.some((t) => [...t.rows, ...t.also].some((row) => shopOf(row).length > 0))

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

      {shopped ? <ShopSwitch open={shop} onToggle={() => setShop((was) => !was)} /> : null}

      {chapter.tables.map((table) => (
        <TableBlock
          key={table.id}
          table={table}
          orphans={rail.orphans.filter((fix) => fix.blockId === table.id)}
          told={rail.unpricedLists}
          named={chapter.tables.length > 1}
          query={searching ? query : ''}
          level={level}
          onPress={onPress}
          onShowAll={onShowAll}
          refusedBy={refusedBy}
          shop={shop}
          go={go}
        />
      ))}

      {chapter.kind === 'handover' ? (
        <Handover
          quote={quote}
          quoteId={quoteId}
          refusal={refusal}
          onNext={onFinale}
          setStep={setStep}
          setRefused={setRefused}
        />
      ) : null}

      {chapter.kind === 'finale' ? (
        <Finale
          quote={quote}
          quoteId={quoteId}
          rail={rail}
          art={art}
          openQuote={openQuote}
          openDocument={openDocument}
          now={now}
          arrives={justGiven}
          onPress={onPress}
          onWho={onWho}
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
            {/* THE ANSWER AS A PERSON SAYS IT LEADS, and what is still open follows in the
                quieter ink (the components critique, 2026-09-29, blocker 2): "Yamaha F90LB ·
                3 more offered", never "chosen: TA1400S13SB · …". `said` and `rest` are the
                rail's (chapters.ts `answerOf`); the two chapters that are not the file's say
                their `fact` as before. AN OPEN HEAD WITH NOTHING TO SAY DRAWS NO FACT AT ALL
                (refine-2): Who it is for, open, leaves the missing name to the sentence under
                its act, and an empty box in its place read as a head that says nothing. */}
            {said === '' && tail === '' ? null : (
              <span className="cfg-head__fact">
                {said === '' ? null : (
                  /* THE DOT ENDS THE ANSWER'S OWN BOX (the build's closing verify, 2026-10-20). The
                   answer is its own box, so a long one ("Yamaha/Stacer · Binnacle Mount Rigging
                   Kit" at 390, a swapped motor's "… Cables & Filter" at 834) put "· 6 more
                   offered" on a line of its own that began with the dot. The box now ends on the
                   dot (configurator.css, `[data-more]`), bound to the answer's last word by a
                   no-break space and in the quieter ink, so the line breaks after it instead. */
                  <span className="cfg-head__said" data-more={tail === '' ? undefined : ''}>
                    {said}
                  </span>
                )}
                {tail === '' ? null : (
                  <span className="cfg-head__rest">
                    {/* the dot a reader hears and reads in the head's text: the one drawn is the
                      answer's own, generated with no words of its own */}
                    {said === '' ? null : <span className="cfg-head__heard"> ·</span>}
                    {`${said === '' ? '' : ' '}${tail}`}
                  </span>
                )}
              </span>
            )}
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
            {/* WHAT IS ON THE QUOTE, SEEN: the chosen motor's or trailer's own picture beside
                its subtotal, so the shut rail reads as the build it is — the maker's render in
                a small well, laid on the plate. Only a picture the ledger holds for that very
                row; a chapter with none shows none. */}
            {chapter.picture && !toldBelow ? (
              <span className="cfg-head__pic" aria-hidden="true">
                <Picture
                  src={chapter.picture.src}
                  alt=""
                  width={chapter.picture.width}
                  height={chapter.picture.height}
                  fit="contain"
                />
              </span>
            ) : null}
            {/* THE FINALE'S HEAD SAYS NO FIGURE: shut, the masthead beside it says the total;
                open, its card does, large (docs/WORDS.md — the total was in the head, the finale's
                head and the card at once). A chapter whose lines the price list gives no price says
                nothing here: the line under the total says what is not in it, once. */}
            {chapter.kind === 'handover' || chapter.kind === 'finale' ? null : chapter.amount ===
              null ? (
              chapter.lines === 0 ? (
                <span className="cfg-head__nosum">{NOTHING_ON_IT}</span>
              ) : null
            ) : toldBelow ? null : (
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

      {/* A GIVEN QUOTE'S BODY IS SIMPLY THERE, and a chapter of it shut is gone in the same
          frame. At the give the finale's body is drawn anew, at its whole height: the handover
          is new elements in any case (`Finale`), and nothing in the body moves to arrive. */}
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
                quiet
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
            ? /* the missing price is said once, under the total (docs/WORDS.md); here, the act */
              'It goes on this quote only, and prints on the customer’s quote as the boat’s price.'
            : `Priced by hand at ${money(typed)}, on this quote only, because the price list has none.`}
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
        {/* what the price does is said once, in the block's head; under the act, only a refusal */}
        {wrong === null ? null : (
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
        No finish of this boat is called that.
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
          Another finish changes the boat only. Everything else on this quote stays.
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
      <RowFace
        on={finish.current}
        /* THE COLOUR IS THE CONTENT, DRAWN AS COLOUR where the decode names it
           (built-critique-m2-close-2.md, major 6), in the place a part's glyph stands — the
           finish's own picture. A code the decode cannot read draws no swatch and is printed
           as the code: a colour nobody can name is a colour nobody may paint. */
        mark={<Swatches colour={finish.colour} />}
        /* ON THE QUOTE, THE HULL'S OWN PRICE IN THE FILLED PILL, as every chosen option on the
           build says it; it read "fitted", a workshop's word for a colour */
        figure={
          finish.current ? (
            finish.amount === null ? null : (
              <PriceFigure amount={finish.amount} />
            )
          ) : finish.delta === 0 ? (
            'no change'
          ) : (
            <PriceFigure amount={finish.delta} signed />
          )
        }
        way={finish.current ? (finish.amount === null ? 'none' : 'on') : way(finish.delta)}
        figureSay={
          /* the hull's price beside a finish that changes it; one that changes nothing costs what
             the chosen finish costs, and that is said once, on the chosen line */
          finish.current
            ? 'on the quote'
            : finish.amount === null || finish.delta === 0
              ? ''
              : `${money(finish.amount)} for the hull`
        }
      >
        <span className="cfg-row__name">
          {finish.colour.read ? (
            finish.colour.say
          ) : (
            <span className="cfg-mono">{finish.colour.code === '' ? '—' : finish.colour.code}</span>
          )}
          {finish.materialSaid === '' ? '' : ` · ${finish.materialSaid}`}
        </span>
        {/* THE DEALER'S CODES, quiet under it: the colourway and the line as the price file
            writes them, which is what he orders by */}
        <span className="cfg-row__code">
          {finish.colour.read ? (
            <span className="cfg-mono">{finish.colour.code}</span>
          ) : (
            'no colour name on the price list for this code'
          )}
          {finish.code === '' ? null : (
            <>
              {' · '}
              <span className="cfg-mono">{finish.code}</span>
            </>
          )}
        </span>
      </RowFace>
    </Tile>
  )
}

/* ---------------------------------------------------------- */
/* One table inside a chapter                                   */
/* ---------------------------------------------------------- */

function TableBlock({
  table,
  orphans,
  told,
  named,
  query,
  level,
  onPress,
  onShowAll,
  refusedBy,
  shop,
  go,
}: {
  /** follow an address without a page load — a rule's sentence to the rule on /rules */
  go?: (href: string) => void
  table: ChapterTable
  /** the lines on this list that are for a motor the boat does not carry */
  orphans: readonly OrphanFix[]
  /** the lists the line under the total already says the price list prices nothing in */
  told: readonly string[]
  /** the chapter holds more than one table, so each needs its name */
  named: boolean
  query: string
  /** the price the quote is at, by its declared name */
  level: string | null
  onPress: (act: Act) => void
  onShowAll: (id: string) => void
  /** the element holding the one reason every row here is refused
   *  for, where there is one */
  refusedBy: string | undefined
  /** the chapter's one "For the workshop" is open, so every line shows its codes */
  shop: boolean
}) {
  const counts = table.counts
  const offered = offeredHere(table)
  const reason = reasonSay(table)
  /* A LIST THE PRICE LIST GIVES NO PRICE SAYS SO ONCE: as a tag beside its name while nothing
     from it is on the quote, and in the line under the total once something is, which names the
     list itself (`unpricedTag`, `totalNoteSay`) */
  const unpriced = unpricedTag(table, told)
  const capped = cappedSay(table)
  const whole = allSay(table)

  /* THE KIT'S POWER CHIPS OVER A LIST OF MOTORS (the components critique, 2026-09-29,
     blocker 2: /kit drew "90 hp 2 · 115 hp 2 · 130 hp 1 · 150 hp 1" over its Yamahas and the
     build drew none). Each is a power the file rates a motor on this list at, with how many
     it holds; pressing one narrows the tiles to it and pressing it again widens them. It is a
     way of looking and writes nothing, so it stands on a given quote too. A motor on the
     quote is never narrowed away — nothing on a quote is ever invisible — and while a search
     runs the search is the narrowing, so the chips step aside. */
  const [power, setPower] = useState<string | null>(null)
  const powers = useMemo(() => {
    if (table.kind !== 'motor' || query !== '') return []
    const held = new Map<string, number>()
    for (const row of table.rows)
      if (row.power !== '') held.set(row.power, (held.get(row.power) ?? 0) + 1)
    /* from the least power to the most, as a person reads a range of outboards */
    return [...held].toSorted(([a], [b]) => Number(a) - Number(b) || a.localeCompare(b))
  }, [table, query])
  const narrowed = powers.length > 1 && powers.some(([p]) => p === power) ? power : null
  const rows =
    narrowed === null ? table.rows : table.rows.filter((r) => r.fitted || r.power === narrowed)
  /* WHAT EVERY PRESS HERE DOES, ONCE (`insteadSay`): where two or more lines off the quote would
     each take the same motor off, the list says it over itself and each figure stands alone */
  const swaps = table.rows.filter((r) => !r.fitted && r.instead !== '')
  const instead =
    swaps.length > 1 && swaps.every((r) => r.instead === swaps[0]!.instead) ? swaps[0]!.instead : ''
  const replaces = insteadSay(instead)

  /* NOTHING IS COUNTED OVER A LIST AT REST (build-close-critique-2.md major 2: Dealer fit "is
     still a settings list"). "5 OF 2,238 PAIRED WITH THIS HULL" stood over every list in the
     database's capitals, with two paragraphs about the price file under it, beside a head that
     already says "13 more offered" and a switch that says "Show all 2,238". What stays over a
     list is what only it can say: its name where the chapter holds more than one, the rule that
     narrows it where a rule does, that it carries no price where it carries none, and what every
     price in it already includes. The recommendation is on the tile it is about. */
  const head =
    named ||
    reason !== '' ||
    unpriced !== '' ||
    capped !== '' ||
    table.includes !== '' ||
    replaces !== '' ||
    table.oneTrailer !== ''
  return (
    <div className="cfg-table">
      {head ? (
        <div className="cfg-table__head">
          {named || unpriced !== '' ? (
            <div className="cfg-table__title">
              {named ? <h3 className="cfg-table__name">{table.title}</h3> : null}
              {unpriced === '' ? null : <span className="cfg-table__tag">{unpriced}</span>}
            </div>
          ) : null}
          {reason === '' ? null : <p className="cfg-table__why">{reason}</p>}
          {/* WHAT EVERY PRICE HERE ALREADY HAS IN IT, said once over the list rather than
              "PRE-DELIVERY INCLUDED" in caps on every tile (`includesSay`), and what every press
              here takes off the quote */}
          {table.includes === '' && replaces === '' && table.oneTrailer === '' ? null : (
            <p className="cfg-table__pick">
              {/* ONE TRAILER TO A BOAT: the rule, said where a second trailer is offered */}
              {[table.includes, replaces, table.oneTrailer].filter((said) => said !== '').join(' ')}
            </p>
          )}
          {capped === '' ? null : <p className="cfg-table__why">{capped}</p>}
        </div>
      ) : null}

      {/* EVIDENCE, NEVER A REFUSAL — the same category the finale's
          double-charge flag is in, and the same treatment. A press on
          this screen ADDS where a list holds more than one of a thing,
          and a second motor beside the first is said out loud. */}
      {table.severalSay === '' ? null : (
        <Said className="cfg-several" testId="several-on-one-table" glyph={StackIcon}>
          {table.severalSay}
        </Said>
      )}

      {/* A KIT FOR A MOTOR THE BOAT DOES NOT CARRY, SAID AT THE KIT (build-close-critique.md,
          2026-10-19, major 2), in the act's colour as the finale's double charge is, with the
          press that puts it right */}
      {orphans.map((fix) => (
        <Orphaned key={fix.lineId} fix={fix} onPress={onPress} live={refusedBy === undefined} />
      ))}

      {/* THE DEALER'S OWN RULES, WHERE THEY BITE (Milestone 3): one sentence per rule, above
          the list, in the rule's own words and with its because — written on /rules and
          refused here on the very next pick */}
      {table.ruled.map((rule) => (
        <RuleSays key={`${rule.ruleId}:${rule.refuses ? 'r' : 'w'}`} rule={rule} go={go} />
      ))}

      {table.rows.length === 0 && table.ruled.some((r) => r.refuses) ? null : table.rows.length ===
        0 ? (
        <Said className="cfg-why" glyph={InfoIcon}>
          {query !== ''
            ? `Nothing in ${table.title} is called that.`
            : table.why !== ''
              ? table.why
              : `Nothing more from ${table.title} is made for this boat.`}
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
          {powers.length > 1 ? (
            <fieldset className="cfg-chips" aria-label={`${table.title} by power`}>
              {powers.map(([rating, count]) => (
                <Chip
                  key={rating}
                  icon={EngineIcon}
                  count={count}
                  selected={narrowed === rating}
                  onSelect={() => setPower(narrowed === rating ? null : rating)}
                >
                  {`${rating} hp`}
                </Chip>
              ))}
            </fieldset>
          ) : null}
          <ul className={table.pictured ? 'cfg-tiles' : 'cfg-rows'}>
            {rows.map((row) => (
              <li key={row.key}>
                <OptionCard
                  row={row}
                  kind={table.kind}
                  query={query}
                  level={level}
                  onPress={onPress}
                  refusedBy={refusedBy}
                  includes={table.includes !== ''}
                  lazy={table.showingAll}
                  tile={table.pictured}
                  shop={shop}
                  insteadSaid={instead}
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
                  kind={table.kind}
                  query=""
                  level={level}
                  onPress={onPress}
                  refusedBy={refusedBy}
                  includes={table.includes !== ''}
                  lazy={false}
                  tile={table.pictured}
                  shop={shop}
                  insteadSaid={instead}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* THE WAY PAST THE NARROWING, and it is a control rather than a
          promise. Production's trailer step has no catalogue browse at
          all, so a salesperson who can SEE a trailer on the yard is
          told by their own system that it does not exist. Its own words
          are the count; what the whole list leaves out is said once it
          is open (`allSay`). */}
      {counts.catalogue > counts.narrowed ? (
        <div className="cfg-all">
          <Button
            intent="veiled"
            size="sm"
            icon={table.showingAll ? ArrowsInSimpleIcon : ArrowsOutSimpleIcon}
            onClick={() => onShowAll(table.id)}
          >
            {table.showingAll
              ? `Back to the ${offered.toLocaleString('en-AU')} made for this boat`
              : `Show all ${counts.catalogue.toLocaleString('en-AU')} in ${table.title}`}
          </Button>
          {whole === '' ? null : <p className="cfg-all__say">{whole}</p>}
        </div>
      ) : null}
    </div>
  )
}

/* ---------------------------------------------------------- */
/* One option                                                   */
/* ---------------------------------------------------------- */

/**
 * EVERY OPTION IS THE KIT'S OPTION TILE, the motor's and the part's alike
 * (build-close-critique-2.md major 2: "Open Dealer fit and it is a settings list: radio circles,
 * each with a part code under it, '+$18 at Cash' five times down the right edge … no glyph and no
 * picture"). The thing a person recognises leads — its picture where the ledger holds one, else
 * its kind's glyph in the well; its name as a person says it; the facts its own row states that
 * decide it — then what the press does to the total, in the kit's pill, and nothing else about the
 * price where the quote is at that price already. The dealer's code and the price list's own
 * description are the workshop's, one press away under the tile (`Workshop`), except where two
 * options share a name and the pairing's words are what tell them apart.
 *
 * A ROW THE NARROWING LEFT OUT IS AN ORDINARY TILE WITH A SENTENCE.
 * `premium/pcpartpicker-list.png` is the frame: a full-width banner
 * names the severity in words, and NOT ONE CONTROL IS DISABLED.
 */
function OptionCard({
  row,
  kind,
  query,
  level,
  onPress,
  refusedBy,
  includes,
  lazy,
  tile,
  shop: shopOpen,
  insteadSaid,
}: {
  row: OptionRow
  /** what the list holds, for the glyph a tile without a picture is led by */
  kind: TableKind
  query: string
  /** the price the quote is at, by its declared name */
  level: string | null
  onPress: (act: Act) => void
  refusedBy: string | undefined
  /** the list says once, over itself, what every price in it includes */
  includes: boolean
  /** one of a long list: its picture is fetched only as it nears the window */
  lazy: boolean
  /** drawn as the kit's photographed option tile, on a list whose shelf holds pictures; a list
   *  of parts, which the price list gives no pictures, is a line each */
  tile: boolean
  /** the chapter's one "For the workshop" is open */
  shop: boolean
  /** the motor every press on this list takes off, where the list says it once over itself */
  insteadSaid: string
}) {
  /* THE RECOMMENDATION IS ON THE TILE IT IS ABOUT, in one word (docs/WORDS.md: "The price file
     recommends … for this hull" → "Recommended" on the tile), and a reader hears it in the
     tile's name. Still no star: §4 of the sweep found that "None uses a star, a ribbon or a
     colour." */
  const label = `${row.tail}${row.starred ? ', recommended' : ''}${row.warned ? ', your rule warns about it' : ''}, ${row.fitted ? 'on the quote' : row.instead === '' ? 'not on the quote' : `not on the quote, goes on instead of the ${row.instead}`}`
  const name = (
    <span className={tile ? 'cfg-row__name cfg-row__name--tile' : 'cfg-row__name'}>
      {row.stem === '' ? null : <span className="cfg-row__stem">{row.stem} </span>}
      <Marked text={row.tail} query={query} />
    </span>
  )
  /* what the list has not already said once over itself */
  const contains = includes ? '' : row.contains
  /* THE WORKSHOP'S WORDS: the price list's own description where the tile says the thing another
     way (a rigging kit, by its motor), the pairing's own facts where they are not already on the
     tile, and the dealer's code */
  const shop = shopOf(row)

  /* WHAT THE PRESS DOES TO THE TOTAL, and it never moves. On the quote, the figure is the price
     it stands on the quote at — the kit's filled pill — and not the minus the press would take
     off it. Off it, the figure is `weighPick`'s change to the total, signed. AT THE PRICE THE
     QUOTE IS AT, THAT IS ALL IT SAYS: "+$18 at Cash" five times down a list on a Cash quote was a
     settings list's column (build-close-critique-2.md major 2); a figure at another price says
     which. NO FIGURE IS A SENTENCE, NOT $0.00: where the list has a price and this row leaves it
     empty, it says it has no price at that one by its name ("No Cash price"); where the list has
     no price at all, its head says so once and the tile carries no pill. */
  const at = row.column === null || row.column === level ? '' : `at ${row.column}`
  const figure: ReactNode = row.fitted ? (
    row.amount === null ? null : (
      <PriceFigure amount={row.amount} />
    )
  ) : row.delta === null ? null : (
    <PriceFigure amount={row.delta} signed />
  )
  /* A MOTOR THAT GOES ON IN PLACE OF THE ONE THERE SAYS SO beside what the step does to the
     total, which is the whole step's: the new motor on, the old one off, and its kit */
  const figureSay = row.fitted
    ? row.amount === null && row.column !== null
      ? `No ${row.column} price · on the quote`
      : 'on the quote'
    : row.instead !== '' && row.instead !== insteadSaid
      ? `instead of the ${row.instead}`
      : row.amount === null
        ? row.column === null
          ? ''
          : `No ${row.column} price`
        : row.delta === row.amount || row.instead !== ''
          ? /* a motor going on in place of one the list names once says only its difference:
               its own price beside it was a second figure on the tile */
            at
          : `${money(row.amount)} ${at}`.trim()
  /* ON A HULL WHOSE OWN ROW SAYS IT TAKES TWO MOTORS, putting this one on beside the one there
     is one quiet press away under the tile — never the press itself */
  const beside = row.beside ? (
    <Button intent="quiet" size="sm" icon={PlusIcon} onClick={() => onPress(row.beside!)}>
      {`Put it on beside the ${row.instead}`}
    </Button>
  ) : null

  if (!tile) {
    /* A PART, A FIT, A KIT, AS A LINE OF THE BUILD (build-close-critique-2.md major 2): its
       kind's glyph where a radio circle stood, its name as a person says it, and the one figure
       — in the filled pill, with "on the quote" beside it, once it is on. Its code is the
       workshop's, under it. Whether it is on the quote is said in words and in the line's own
       lit edge, never by a circle alone. */
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
          <RowFace
            on={row.fitted}
            tick={false}
            mark={<KindMark kind={kind} size="sm" />}
            figure={figure}
            way={row.fitted ? (row.amount === null ? 'none' : 'on') : way(row.delta)}
            figureSay={figureSay}
          >
            {name}
            {row.starred ? <span className="cfg-row__contains">Recommended</span> : null}
            {row.warned ? <WarnedMark /> : null}
            {row.twin && row.facts.length > 0 ? <Facts facts={row.facts} /> : null}
            {contains === '' ? null : <span className="cfg-row__contains">{contains}</span>}
          </RowFace>
        </Tile>
        {row.why === '' ? null : <p className="cfg-opt__why">{row.why}</p>}
        {shop.length > 0 ? <Workshop open={shopOpen} facts={shop} query={query} /> : null}
      </div>
    )
  }

  const detail =
    row.starred || row.warned || (row.twin && row.facts.length > 0) || contains !== '' ? (
      <>
        {row.starred ? <span className="cfg-row__contains">Recommended</span> : null}
        {row.warned ? <WarnedMark /> : null}
        {row.twin && row.facts.length > 0 ? <Facts facts={row.facts} /> : null}
        {contains === '' ? null : <span className="cfg-row__contains">{contains}</span>}
      </>
    ) : undefined
  return (
    <div className="cfg-opt" data-outside={row.outside ? '' : undefined}>
      <OptionTile
        name={name}
        facts={row.spec === '' ? undefined : row.spec}
        detail={detail}
        picture={row.picture}
        kind={kind}
        lazy={lazy}
        figure={figure === null ? (figureSay === '' ? undefined : '') : figure}
        figureSay={figureSay === '' ? undefined : figureSay}
        selected={row.fitted}
        onSelect={() => onPress(row.act)}
        refusedBy={refusedBy}
        label={label}
      />
      {row.why === '' ? null : <p className="cfg-opt__why">{row.why}</p>}
      {beside === null ? null : <div className="cfg-opt__beside">{beside}</div>}
      {shop.length > 0 ? <Workshop open={shopOpen} facts={shop} query={query} /> : null}
    </div>
  )
}

/**
 * A TILE A RULE OF THE DEALER'S WARNS ABOUT, MARKED ON THE TILE (built-critique-m3-2.md, major 3:
 * the warned F25SWTC's card read only its name, its facts and its figure). The because is the
 * list's, said once above it (`RuleSays`); the mark says which tiles it is about, in the warning's
 * ochre, and the tile's name says it to a reader, so the mark itself is hidden from one.
 */
function WarnedMark() {
  return (
    <span className="cfg-row__warned" aria-hidden="true">
      <Icon glyph={WarningCircleIcon} size="sm" />
      Your rule warns
    </span>
  )
}

/**
 * ONE LINE OF A LIST THAT HAS NO PICTURES — a part, a fit, a kit, a finish — drawn as Porsche
 * draws an option line: whether it is on the quote (the tick), the thing (its kind's glyph in
 * its ink, or a finish's own colours), its name over its quiet facts, and what the press does
 * to the total in the kit's pill at the end, filled when it is on the quote.
 */
function RowFace({
  on,
  tick = true,
  mark,
  figure,
  way: moves,
  figureSay,
  children,
}: {
  on: boolean
  /** the tick in its disc, where the line has no words of its own for being chosen — a finish,
   *  whose figure is its price on the hull; a part says "on the quote" beside its figure */
  tick?: boolean
  /** the thing's own mark — a finish's colours, a part's kind — or null for none */
  mark: ReactNode | null
  /** null where there is no figure: no pill is drawn, only what `figureSay` says */
  figure: ReactNode | null
  /** which way the figure moves the total, or 'on' where the line is on the quote */
  way: string
  figureSay: string
  children: ReactNode
}) {
  return (
    <span
      className="cfg-row"
      data-bare={mark === null ? '' : undefined}
      data-untick={tick ? undefined : ''}
    >
      {tick ? <Tick on={on} /> : null}
      {mark === null ? null : (
        <span className="cfg-row__mark" aria-hidden="true">
          {mark}
        </span>
      )}
      <span className="cfg-row__main">{children}</span>
      <span className="cfg-row__money">
        {figure === null ? null : (
          <span className="cfg-row__delta" data-way={moves}>
            {figure}
          </span>
        )}
        {figureSay === '' ? null : <span className="cfg-row__at">{figureSay}</span>}
      </span>
    </span>
  )
}

/**
 * FOR THE WORKSHOP, ONE PRESS AWAY: the pairing's rigging kit, prop and code, whole, under the
 * option they belong to (the components critique, 2026-09-29, blocker 2: "Rigging Kit Option
 * Mech Rigging Kit · 704 Binnacle Mount w 6Y8 2 Gauges, 5 m Harness, Cables & Filter · Prop
 * Part No. 6FP-45943-00 · …" was two lines of every motor tile at a desk and five in a hand,
 * taller than the photograph). They are the dealer's words — what the workshop fits and what
 * the order goes out under — so they stay on the screen, and the tile says the motor.
 *
 * ONE PRESS FOR THE WHOLE CHAPTER (the refine round, 2026-10-21: "'For the workshop' repeats under
 * every tile" — six times down Dealer fit at 390, the loudest words in it). The chapter carries one
 * quiet button over its lists (`ShopSwitch`), its state in `aria-expanded`, and each option shows
 * its words in a well beneath it while it is open: a workshop reading codes off a build reads all
 * of them. It reads and writes nothing, so it answers on a given quote as well. WHILE A SEARCH RUNS
 * THE WORDS ARE OPEN, with what matched in bold, because the field searches rigging kits and codes
 * too and a match nobody can see is not an answer.
 */
function Workshop({
  open,
  facts,
  query,
}: {
  /** the chapter's "For the workshop" is open */
  open: boolean
  facts: readonly { label: string; value: string }[]
  query: string
}) {
  if (!open && query === '') return null
  return (
    <div className="cfg-shop">
      <dl className="cfg-shop__facts">
        {facts.map((fact) => (
          <div className="cfg-shop__fact" key={fact.label}>
            <dt className="cfg-shop__lab">{fact.label}</dt>
            <dd className="cfg-shop__val">
              <Marked text={fact.value} query={query} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/** THE CHAPTER'S ONE "FOR THE WORKSHOP", over its lists, where any option in it has words for the
 *  workshop. A search holds every one open, so there is nothing to press while it runs. */
function ShopSwitch({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <div className="cfg-shopall">
      <Button intent="quiet" size="sm" icon={WrenchIcon} aria-expanded={open} onClick={onToggle}>
        For the workshop
      </Button>
    </div>
  )
}

/** THE WORKSHOP'S WORDS FOR ONE OPTION: the price list's own description where the tile says the
 *  thing another way (a rigging kit, by its motor), the pairing's own facts where they are not
 *  already on the tile, and the dealer's code. */
function shopOf(row: OptionRow): { label: string; value: string }[] {
  return [
    ...(row.listed === '' ? [] : [{ label: 'On the price list', value: row.listed }]),
    ...(row.twin ? [] : row.facts.map((f) => ({ label: f.label, value: f.full }))),
    ...(row.code === '' ? [] : [{ label: 'Code', value: row.code }]),
  ]
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
  onNext,
  setStep,
  setRefused,
}: {
  quote: QuoteDef
  quoteId: string
  refusal: string | undefined
  /** where the sale goes once it has a name: the finale */
  onNext: () => void
  setStep: (step: Step) => void
  setRefused: (said: string | null) => void
}) {
  const [name, setName] = useState(quote.customer.name)
  const [contact, setContact] = useState(quote.customer.contact?.[0] ?? '')
  const issued = refusal !== undefined
  const named = quote.customer.name.trim() !== ''
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
        <p className="cfg-table__why">Both print on the quote exactly as typed.</p>
      </div>

      <div className="cfg-ask">
        <Field label="Who the quote is for">
          <Input
            id="cfg-customer"
            value={name}
            onValueChange={setName}
            onKeyDown={onEnter}
            readOnly={issued}
            autoComplete="name"
            placeholder="Their name"
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
        {/* ONCE IT IS ADDRESSED THE AMBER LEADS ON, NOT BACK (build-close-critique.md,
            2026-10-19, minor 4: "Save the name" kept the amber as the loudest thing on the screen,
            pointing at a thing already done, while the finale was a quiet row under it). With
            the name on the quote and nothing typed since, the act is the next real step. */}
        {named && !pending && !issued ? (
          <Button intent="act" icon={FlagCheckeredIcon} onClick={onNext}>
            On to the finale
          </Button>
        ) : (
          <Button intent="act" icon={UserCheckIcon} onClick={save} refusedBecause={refusal}>
            {named ? 'Save the name' : 'Put their name on it'}
          </Button>
        )}
        {/* WHAT A PRESS, OR MOVING ON, WILL DO while the fields differ from the quote, and why
            the name matters while there is none. Once it is named the head says whom for
            ("for R. Kelleher"), and so do the masthead and the step: a fourth "This quote is
            addressed to …" here was the same fact again. */}
        {pending || !named ? (
          <p className="cfg-act__say">
            {pending
              ? 'It goes on the quote when you press this, or when you move on.'
              : 'A quote needs a name before it can be given.'}
          </p>
        ) : null}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* The finale                                                   */
/* ---------------------------------------------------------- */

/** The gives whose moment this page has already played, by their event: a finale shut and
 *  opened again, or drawn again by a new render, stands at the moment's end and does not play
 *  it twice. */
const handed = new Set<string>()

/**
 * ISSUING IS THE ONE IRREVERSIBLE ACT IN THIS APP, so everything
 * that cannot be repaired afterwards is refused BEFORE the press,
 * with a sentence, in the place it is refused. Every one of those
 * sentences is `issueBlockers`' own: the button, this chapter and
 * the command itself ask the same pure function, and none of them
 * may disagree.
 *
 * AND IT IS THE MOMENT THE SALE EXISTS, WITH THE CUSTOMER BESIDE THE DEALER (2026-09-29, the
 * components critique's major 3: "the finale is three numbers and a paragraph", and its seal "a
 * 72 px rosette that is done in under half a second … It reads as a sticker"). So the finale is
 * the handover, in the order a person hands a quote over:
 *
 *   · THE BOAT: its photograph where the stage is not beside it (below 1200px — at a desk the
 *     stage stands beside the finale, and one photograph of one boat is drawn once), and its
 *     name as every screen says it;
 *   · WHO IT IS FOR, the headline of the card — "For Jordan Test";
 *   · THE TOTAL AT THE LEVEL IT IS GIVEN AT — "Total at Cash", the showroom figure, a
 *     `PriceFigure`, which never counts and never travels — with the arithmetic under it;
 *   · ONE ACT, "Give it to the customer".
 *
 * WHEN IT IS GIVEN, THE CARD ANSWERS WHERE IT WAS PRESSED, and nothing above the press moves —
 * least of all the total, which stands where it stood. "For" becomes "Given to" in the same
 * place; the person's disc is stamped over by the seal (the kit's authored Lottie timeline,
 * `seal.ts`), and the leaf spreads out from under the seal across the card like ink into
 * paper; the customer's name comes up word by word out of a blur; the boat's photograph catches
 * the light once, on the stage at a desk and on the card below it; and last, the way to the
 * paper arrives — "Open the printed quote", where the photograph is carried onto the paper's cover
 * by the route's View Transition. Every step is the kit's own ladder (press, hover, reveal,
 * settle, morph), and all of it is over in under a second. It plays once, for the give that
 * happened on this screen: a quote given before the build was opened is simply there, final.
 * Under reduced motion, or with a caret in a field, it is a clean cut to the same end state.
 */
function Finale({
  quote,
  quoteId,
  rail,
  art,
  openQuote,
  openDocument,
  now,
  arrives,
  onPress,
  onWho,
  setStep,
  setRefused,
}: {
  quote: QuoteDef
  quoteId: string
  rail: Rail
  /** every pick's one way in, for a kit the finale puts right */
  onPress: (act: Act) => void
  /** opens Who it is for, where the card has no name to say */
  onWho: () => void
  art: StageArt | null
  openQuote?: (id: string) => void
  openDocument?: (id: string) => void
  now?: () => Date
  /** THE MOMENT IT IS GIVEN, and only that moment: a quote given on this
   *  screen plays its handover; one that was given before the build was
   *  opened is simply there, final. */
  arrives: boolean
  setStep: (step: Step) => void
  setRefused: (said: string | null) => void
}) {
  const issued = quote.state !== 'draft'
  const boat = boatOfQuote(quote)
  const named = quote.customer.name.trim() !== ''
  const note = totalNoteSay(rail.unpricedNames, hullHasNoPrice(quote), rail.unpricedLists)
  /* the level every price on it is set at, by its declared name — "Cash" */
  const level = rail.rungs.find((rung) => rung.key === quote.levelKey)?.label ?? null

  /* THE GIVE THAT HAPPENED HERE, held for as long as this finale stands, so the moment runs to
     its end on the element it started on; and noted once it has played */
  const give = arrives ? (quote.events[quote.events.length - 1]?.id ?? null) : null
  const [moment, setMoment] = useState<string | null>(null)
  if (give !== null && moment === null && !handed.has(give)) setMoment(give)
  useEffect(() => {
    if (moment !== null) handed.add(moment)
  }, [moment])
  const plays = moment !== null

  /* THE WAY ON TAKES THE KEYBOARD. The act that was pressed is gone with the draft, and the
     caret would be left on the page's body; the press's own way on is the paper. */
  const onward = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!plays) return
    const focus = document.activeElement
    if (focus === null || focus === document.body) onward.current?.focus({ preventScroll: true })
  }, [plays])

  /* the stamp's player is fetched while the act is still to be pressed, so the
     seal is not late for its own moment (GivenSeal.tsx) */
  useEffect(() => {
    if (!issued && !reducedMotion()) readyTheStamp()
  }, [issued])

  const doGive = useCallback(() => {
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

  const photo = art?.kind === 'photograph' ? art.held : null

  return (
    <div className="cfg-hand" data-arrives={plays ? '' : undefined}>
      {/* THE BOAT, WHERE THE STAGE IS NOT BESIDE IT. Below 1200px the stage is a band at the
          top of the page, a screen or more above the finale, so the card carries the boat's own
          photograph — and it is this one the route carries onto the paper's cover there
          (configurator.css); at a desk it is not drawn at all. The kit's `Picture`, never
          enlarged: the frame is capped at the held pixels. */}
      {photo ? (
        <span
          className="cfg-hand__pic"
          data-verdict={photo.verdict}
          style={
            {
              '--cfg-hand-travel': boatTravel(quote.rootTableId, quote.rootRowId),
              maxInlineSize: photo.width,
              maxBlockSize: photo.height,
            } as CSSProperties
          }
        >
          <Picture
            src={photo.src}
            alt={photo.subject === '' ? boat.say : photo.subject}
            width={photo.width}
            height={photo.height}
            fit={photo.verdict === 'scene' ? 'cover' : 'contain'}
            srcSet={
              photo.widths.length > 1
                ? photo.widths.map((w) => `${w.src} ${w.width}w`).join(', ')
                : undefined
            }
            sizes="(max-width: 639px) 100vw, 60vw"
          />
        </span>
      ) : null}

      <div className="cfg-hand__head">
        {issued ? (
          /* GIVEN, WHERE "FOR" STOOD: the seal over the person's disc, the leaf under it all,
             and the words a reader is told as they arrive. A picture of a fact the words say,
             so the seal is hidden from a reader; no figure is in it. */
          /* an `output`, the element for a result the page computed from what somebody did,
             so a reader is told the give as it lands; its words are phrasing, set as lines */
          <output className="cfg-hand__who" data-given="" data-testid="given-seal">
            <GivenSeal give={moment ?? give} />
            <span className="cfg-hand__words">
              <span className="cfg-hand__line">
                <span className="cfg-hand__to">Given to</span>{' '}
                <span className="cfg-hand__name">
                  <Words text={quote.customer.name} />
                </span>
              </span>
              <span className="cfg-hand__boat">{boat.name}</span>
            </span>
          </output>
        ) : (
          <div className="cfg-hand__who">
            <span className="cfg-hand__disc" aria-hidden="true">
              <Icon glyph={UserIcon} size="md" />
            </span>
            <div className="cfg-hand__words">
              <p className="cfg-hand__line">
                <span className="cfg-hand__to">For</span>{' '}
                {/* set word by word as the given card sets it, so the two lines are the same
                    height to the pixel (an inline-block word stands a pixel taller than text in
                    the same line: measured at 834, the total dropped 1px at the press) */}
                <span className="cfg-hand__name" data-none={named ? undefined : ''}>
                  {/* NO NAME IS NOT SAID HERE, IT IS ANSWERED (the refine round, 2026-10-21):
                      "nobody named yet" on the card stood over the give's own refusal, which says
                      the same thing with its reason. The card offers the way to the name. */}
                  {named ? (
                    <Words text={quote.customer.name} />
                  ) : (
                    <Button intent="quiet" size="sm" icon={UserCheckIcon} onClick={onWho}>
                      Put their name on it
                    </Button>
                  )}
                </span>
              </p>
              {/* THE BOAT BY ITS NAME: its finish is the masthead's, over the stage (docs/WORDS.md,
                  rule 2), and it wrapped the card's column to three lines */}
              <p className="cfg-hand__boat">{boat.name}</p>
              {/* the same three lines as the given card, so the give changes the words and not
                  the card's height, and the total beside it does not move by a pixel. The quote's
                  number is the masthead's, over the card (the refine round, 2026-10-21: it was on
                  both, and "every price final" beside it was said again under the new version). */}
            </div>
          </div>
        )}

        {/* THE TOTAL AT THE LEVEL IT IS GIVEN AT, and the arithmetic under it. The same place
            on the card draft and given, so the press that gives the quote never moves it. */}
        <div className="cfg-hand__sum">
          <p className="cfg-hand__lab">{level === null ? 'Total' : `Total at ${level}`}</p>
          <p className="cfg-hand__fig">
            <PriceFigure amount={rail.total} size="display" />
          </p>
          {/* WHAT IS NOT IN IT, said here once the finale is open and the masthead says no
              figure (`totalNoteSay`, docs/WORDS.md); nothing where everything is priced */}
          {note === '' ? null : (
            <p className="cfg-hand__count" data-testid="total-note">
              {note}
            </p>
          )}
        </div>
      </div>

      {/* A LINE THE PRICE LIST GIVES NO PRICE, PRICED BEFORE THE GIVE (build-close-critique-2.md,
          major 5: "Let the dealer price the line before the customer reads the gap"). Draft only:
          a given quote's prices are final, and the sentence under the total says the rest. */}
      {issued ? null : (
        <LinePrices
          quote={quote}
          quoteId={quoteId}
          names={rail.unpricedNames}
          setStep={setStep}
          setRefused={setRefused}
        />
      )}

      {/* WHAT THE DEALER'S OWN RULES WARN ABOUT ON THIS QUOTE, OVER THE GIVE (built-critique-m3-2.md,
          major 3): one sentence per rule, with its because. A warning never refuses — the act
          below stays the dealer's to press; a refusing rule is the act's own refusal. */}
      {!issued && rail.warnedOnQuote.length > 0 ? (
        <div className="cfg-flag cfg-hand__warned" data-testid="warned-on-quote">
          {rail.warnedOnQuote.map((said) => (
            <Said className="cfg-flag__say" key={said} glyph={WarningCircleIcon}>
              {said}
            </Said>
          ))}
        </div>
      ) : null}

      {issued ? (
        <>
          {/* THE ACT OF SELLING LEADS SOMEWHERE: to the printed quote, the one act on a given
              quote, arriving last so the moment ends on it. Its name says what it opens, so no
              sentence under it does. The new version is the way BACK to work, and is quieter.
              "Nothing can go back on it" stood over it too, the second time the card's "every
              price final" was said (docs/WORDS.md, rule 2). */}
          <div className="cfg-act cfg-hand__onward">
            <Button
              ref={onward}
              intent="act"
              icon={FileTextIcon}
              onClick={() => openDocument?.(quoteId)}
              refusedBecause={openDocument ? undefined : NO_DOCUMENT_HERE}
            >
              Open the printed quote
            </Button>
          </div>
          <div className="cfg-hand__again">
            <Button
              intent="veiled"
              size="sm"
              icon={CopyIcon}
              onClick={again}
              refusedBecause={openQuote ? undefined : NO_DOCUMENT_HERE}
            >
              Make a new version
            </Button>
            {/* ONE SENTENCE FOR WHAT GIVEN MEANS AND THE WAY ON FROM IT (docs/WORDS.md: "Given.
                Make a new version to change it."). "Every price final" on the card said the first
                half again; the button beside this says the second, so the sentence keeps the one
                fact neither does: which prices a new version carries. */}
            <p className="cfg-act__say">
              Every price on it is final. A new version keeps these prices, never today&rsquo;s.
            </p>
          </div>
        </>
      ) : (
        <div className="cfg-act">
          <Button
            intent="act"
            icon={PaperPlaneTiltIcon}
            onClick={doGive}
            refusedBecause={rail.blockers.length > 0 ? rail.blockers.join(' ') : undefined}
          >
            Give it to the customer
          </Button>
          <p className="cfg-act__say">{DOCUMENT_SAY}</p>
        </div>
      )}

      {/* WHAT THE PRICES ARE, SAID ONCE AND QUIETLY, under the act rather than over it */}
      <div className="cfg-hand__notes">
        <p className="cfg-table__why">{sourcesSay(quote)}</p>
        {rail.orphans.map((fix) => (
          <Orphaned key={fix.lineId} fix={fix} onPress={onPress} live={!issued} />
        ))}
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
      </div>
    </div>
  )
}

/** What a price put on a line the price list gives none records beside it, at the moment of the
 *  decision (`setOverride`). The dealer's note beside the printed quote says it; the customer's
 *  copy prints the price alone. */
export const LINE_PRICE_REASON = 'The price list has no price for it.'

/** The finale's own act on a line with no price. */
export const PUT_A_PRICE = 'Put a price on this line'

/** "Rigging kit for the F115LB" as it stands at the head of a sentence. */
const headOf = (name: string): string => `${name.charAt(0).toUpperCase()}${name.slice(1)}`

/**
 * EVERY LINE ON A DRAFT THE PRICE LIST GIVES NO PRICE, AND A PLACE TO PUT ONE (the refine round,
 * 2026-10-21). The sentence under the total says the rigging kit is not in it; here the dealer
 * can put it in before the customer is handed the quote. It is `setOverride`, the engine's own
 * command with its inverse, as the boat's own price is in 01 (`HullPrice`), so the step's Undo
 * takes it off again. The boat is not here: a boat with no price is priced in 01.
 *
 * The lines are read by the filter the rail reads `unpricedNames` by, in the same order, so the
 * name a line is called here is the one the sentence over it says.
 */
function LinePrices({
  quote,
  quoteId,
  names,
  setStep,
  setRefused,
}: {
  quote: QuoteDef
  quoteId: string
  names: readonly string[]
  setStep: (step: Step) => void
  setRefused: (said: string | null) => void
}) {
  const lines = quote.lines.filter(
    (line) => line.label !== quote.subjectLabel && lineAmount(line).amount === null,
  )
  if (lines.length === 0 || lines.length !== names.length) return null
  return (
    <div className="cfg-hand__price">
      {lines.map((line, at) => (
        <LinePrice
          key={line.id}
          lineId={line.id}
          name={names[at]!}
          quoteId={quoteId}
          setStep={setStep}
          setRefused={setRefused}
        />
      ))}
    </div>
  )
}

function LinePrice({
  lineId,
  name,
  quoteId,
  setStep,
  setRefused,
}: {
  lineId: string
  name: string
  quoteId: string
  setStep: (step: Step) => void
  setRefused: (said: string | null) => void
}) {
  const [text, setText] = useState('')
  /* WHY WHAT WAS TYPED IS NOT A PRICE, said under the field and only after the press: never a
     control greyed out at rest */
  const [wrong, setWrong] = useState<string | null>(null)
  const field = `cfg-line-price-${lineId}`

  const put = (): void => {
    const typed = text.trim()
    if (typed === '') {
      setWrong('Type its price first, in dollars, with tax included.')
      return
    }
    const amount = parseAmount(typed)
    if (amount === null) {
      setWrong(`“${typed}” is not a price. Type it in figures, in dollars.`)
      return
    }
    if (amount <= 0) {
      setWrong(`Type a price above ${money(0)}. A price of nothing would print as included.`)
      return
    }
    setWrong(null)
    const price = Math.round(amount * 100) / 100
    const outcome = quotesStore
      .getState()
      .apply(quoteId, setOverride(lineId, price, LINE_PRICE_REASON))
    if ('refused' in outcome) {
      setRefused(outcome.refused === '' ? null : outcome.refused)
      return
    }
    setRefused(null)
    setStep({
      said: `${headOf(name)} priced at ${money(price)}`,
      eventId: outcome.event.id,
      wasUndo: false,
    })
  }

  return (
    <div className="cfg-hand__line-price">
      <Field label={`Price for the ${inSentence(name)}, tax included`}>
        <Input
          id={field}
          mono
          inputMode="decimal"
          autoComplete="off"
          value={text}
          onValueChange={setText}
          onKeyDown={(event) => {
            if (event.key === 'Enter') put()
          }}
          placeholder="In dollars"
          aria-describedby={wrong === null ? undefined : `${field}-wrong`}
        />
      </Field>
      <Button intent="secondary" size="sm" icon={TagIcon} onClick={put}>
        {PUT_A_PRICE}
      </Button>
      {wrong === null ? null : (
        <Said className="cfg-alarm" id={`${field}-wrong`} alert glyph={WarningCircleIcon}>
          {wrong}
        </Said>
      )}
    </div>
  )
}

/**
 * A KIT FOR A MOTOR THE BOAT DOES NOT CARRY, AND ITS ONE PRESS (build-close-critique.md,
 * 2026-10-19, major 2): the kit the motor on the boat names put on in its place, or the kit taken
 * off where no motor on it names one. Evidence, never a refusal — nothing is disabled by it — and
 * on a given quote it is the sentence alone, since nothing on it can change.
 */
function Orphaned({
  fix,
  onPress,
  live,
}: {
  fix: OrphanFix
  onPress: (act: Act) => void
  live: boolean
}) {
  return (
    <div className="cfg-flag" data-testid="orphaned-kit">
      <Said className="cfg-flag__say" glyph={WrenchIcon}>
        {fix.said}
      </Said>
      {live ? (
        <div className="cfg-flag__act">
          <Button
            intent="secondary"
            size="sm"
            icon={fix.act.do === 'swap' ? ArrowsLeftRightIcon : MinusIcon}
            onClick={() => onPress(fix.act)}
          >
            {fix.actSay}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

/**
 * A NAME, WORD BY WORD, so the handover can bring each one up in its turn (configurator.css,
 * `--w`). The words and the spaces between them are the name exactly as it was typed: a reader
 * hears the name, and a search finds it.
 */
function Words({ text }: { text: string }) {
  /* each word with its place among the words, and each run of space as it was typed */
  const pieces: { key: string; text: string; word: number | null }[] = []
  let words = 0
  let spaces = 0
  for (const part of text.split(/(\s+)/)) {
    if (part === '') continue
    if (/^\s+$/.test(part)) {
      pieces.push({ key: `s${spaces}`, text: part, word: null })
      spaces += 1
    } else {
      pieces.push({ key: `w${words}`, text: part, word: words })
      words += 1
    }
  }
  return (
    <>
      {pieces.map((piece) =>
        piece.word === null ? (
          piece.text
        ) : (
          <span key={piece.key} className="cfg-word" style={{ '--w': piece.word } as CSSProperties}>
            {piece.text}
          </span>
        ),
      )}
    </>
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
/** "the Yamaha F4SMHA, the Yamaha F2.5SMHB and 3 more" — at most three named. */
function namesSay(names: readonly string[]): string {
  const shown = names.slice(0, 3).map((n) => `the ${n}`)
  const more = names.length - shown.length
  const all = more > 0 ? [...shown, `${more} more`] : shown
  return all.length <= 1 ? (all[0] ?? '') : `${all.slice(0, -1).join(', ')} and ${all.at(-1)}`
}

/**
 * ONE OF THE DEALER'S OWN RULES, SAID WHERE IT BITES (Milestone 3's exit criterion): what it
 * refuses on this boat, its own because, and the rule as it was written, with the way to it on
 * /rules. Said once above the list, never on each row — and never as a disabled tile: what a
 * rule refuses is not on the list at all, and this sentence is where it went.
 */
function RuleSays({
  rule,
  go,
}: {
  rule: ChapterTable['ruled'][number]
  go?: (href: string) => void
}) {
  const href = `/rules?open=${encodeURIComponent(rule.ruleId)}`
  const because = rule.because.trim().replace(/[.\s]+$/, '')
  const kept = rule.onQuote.length
  return (
    <div
      className="cfg-said cfg-ruled"
      data-testid="ruled-here"
      data-refuses={rule.refuses ? '' : undefined}
    >
      <span className="cfg-said__glyph" aria-hidden="true">
        <Icon glyph={rule.refuses ? ProhibitIcon : WarningCircleIcon} />
      </span>
      <span className="cfg-said__words cfg-ruled__words">
        <span className="cfg-ruled__lead">
          {rule.refuses
            ? `Not offered on this boat: ${namesSay(rule.names)}, because ${because}.`
            : `Your rule warns about ${rule.every === '' ? namesSay(rule.names) : rule.every}, because ${because}.`}
        </span>
        {kept > 0 && rule.refuses ? (
          <span>
            {kept === 1 ? 'One of them is' : `${kept} of them are`} on this quote already: take{' '}
            {kept === 1 ? 'it' : 'them'} off before it goes to the customer.
          </span>
        ) : null}
        <span className="cfg-ruled__rule">
          <span className="cfg-ruled__said">{`Your rule: ${rule.sentence}`}</span>
          <Button
            intent="quiet"
            size="sm"
            icon={ScalesIcon}
            href={href}
            onClick={go ? () => go(href) : undefined}
          >
            See the rule
          </Button>
        </span>
      </span>
    </div>
  )
}

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
 * IT IS ITS OWN COMPONENT, which draws only the dashes (below), so the rail of
 * two hundred rows is never re-rendered by where the reader is. The attribute
 * is written on the chapter itself, once per change of chapter.
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
 *
 * AND THE KIT'S DASHES SAY IT BESIDE THE SEARCH (the components critique,
 * 2026-09-29, blocker 2: "Put the kit's hp chips and dashes on the build" —
 * /kit drew "02 / 03 Motor" and the build did not). The ring is on a chapter's
 * head, and a head scrolls away the moment a long chapter is read: a dealer
 * forty motors into "Show all" had nothing on the screen saying where he was.
 * The dashes stand in the search bar, which sticks at a desk, and fill as the
 * ring does: every chapter read is a full dash, the one being read follows the
 * page, and its number and name are what a reader is told. Where the bar does
 * not stick (below 1200px) they would scroll away with it, and they are not
 * drawn (configurator.css).
 */
function Reading({
  chapters,
  open,
  names,
}: {
  chapters: readonly RefObject<HTMLElement | null>[]
  /** the chapter that is open, or -1 where none is (a search opens every one with an answer) */
  open: number
  names: DashesProps['chapters']
}) {
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
  if (names.length === 0) return null
  /* THE DASHES SAY THE CHAPTER THAT IS OPEN (build-close-critique.md, 2026-10-19, minor 6: they
     read "02 Motor" while Who it is for was open), and fill as the window reads it: full once the
     window is past it, empty before the window reaches it */
  const at = open >= 0 ? open : place.at
  const through = open < 0 || place.at === open ? place.through : place.at > open ? 1 : 0
  return (
    <span className="cfg-where">
      <Dashes chapters={names} at={at} through={through} />
    </span>
  )
}

/**
 * THE LAST STEP, IN THE HEAD, BELOW 1440 (the refine round, 2026-10-20): what the press did, in
 * the command's own sentence and with the glyph of what it happened to, and its way back — the
 * kit's toast's three parts, drawn in the masthead between the boat and the total, where it
 * covers nothing. The toast stood over the rail it was about below 1440: over the Garmin's name
 * at 1280, over the tile just pressed at 834 and 844 × 390, over the F200XC's price at 390.
 *
 * A reader is told the step as it lands (`role="status"`). Alt T takes the caret to the way back
 * and Escape gives it back (`Build`); the press keeps the caret on it, as the toast's did, and
 * the way back from the way back is the same press in the same place.
 */
function StepLine({
  ref,
  said,
  kind,
  way: back,
  onBack,
}: {
  ref: RefObject<HTMLOutputElement | null>
  said: string
  kind: TableKind | undefined
  way: 'Undo' | 'Put it back'
  onBack: () => void
}) {
  return (
    <output className="cfg-step" data-testid="last-step" ref={ref}>
      {kind ? <KindMark kind={kind} size="sm" /> : null}
      <span className="cfg-step__said">{said}</span>
      <Button
        intent="secondary"
        size="sm"
        icon={back === 'Put it back' ? ArrowClockwiseIcon : ArrowCounterClockwiseIcon}
        onClick={onBack}
      >
        {back}
      </Button>
    </output>
  )
}
