import {
  createRef,
  useCallback,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useId,
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
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowsLeftRightIcon,
  ArrowsOutSimpleIcon,
  CaretDownIcon,
  CheckIcon,
  CoinsIcon,
  CopyIcon,
  EnvelopeSimpleIcon,
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
  Dialog,
  ExpandPicture,
  Field,
  Icon,
  Input,
  Kbd,
  KindMark,
  Lightbox,
  OptionTile,
  Picture,
  Popover,
  PriceFigure,
  RESPONSE,
  Refusal,
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
  kindInk,
  type DashesProps,
  type Glyph,
  type LightboxPicture,
} from '@/ui'
import { useChapterProgress, useSmoothScroll } from '@/ui/scroll'
import type { TableKind } from '@/domain/model'
import { boatOfQuote, measured } from '@/domain/quote/spoken'
import { allSpecsOf } from '@/domain/quote/freeze'
import { chapterToOpen } from '@/domain/quote/opening'
import { useCatalogue, useQuotes, useSession } from '@/app/useStores'
import { NO_WAYS, type Way } from '@/app/ways'
import { useSetScope } from '@/screens/shell/scope'
import { quotes as quotesStore } from '@/state/quotes'
import { catalogue as catalogueStore, ctxFrom } from '@/state/catalogue'
import { issueStampNow, preparerNow } from '@/app/northside'
import { unreachableSay } from '@/domain/quote/document'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { makeCtx, type CatalogueCtx, type FrozenPreparer, type QuoteDef } from '@/domain/model'
import { daySaid } from '@/domain/model/ownPictures'
import { openSay, tallyOf } from '@/domain/quote/tally'
import { money } from '@/domain/money'
import {
  ISSUED_REFUSAL,
  addLine,
  applyPriceChanges,
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
  type PriceChange,
} from '@/domain/quote'
import {
  HULL_PRICE_REASON,
  hullHasNoPrice,
  hullPriceOf,
  readHullPrice,
} from '@/domain/quote/nought'
import type { ShownFact } from '@/domain/quote/distinguish'
import { swapLines } from '@/domain/quote/swap'
import { SUBJECT_BLOCK } from '@/domain/quote'
import { emailIn, summaryItems } from './summary'
/* A CHAPTER WITH NOTHING ON IT HAS NO SUBTOTAL, and says so in the register's words, "Nothing on
   it yet". A chapter whose lines carry no figure says nothing in that cell: what is not priced is
   said once, under the total (`totalNoteSay`, docs/WORDS.md), where it stood as "Not priced on
   this quote" in four places on one screen. */
import { NOTHING_ON_IT } from '@/domain/quote/register'
import {
  KITS_WAIT,
  RIG_KITS,
  tallyParts,
  bareListsSay,
  bareSay,
  kitsForMotors,
  kitsNone,
  matchesFinish,
  readRail,
  type Act,
  type OrphanFix,
  type Chapter,
  type ChapterTable,
  type OptionRow,
  type Rail,
} from './chapters'
import type { Finish, Finishes } from './finishes'
import type { DrawnAxis, DrawnChoices, DrawnOption } from './boat'
import { hullHero, stageArt, type Held, type StageArt } from './stage'
import { copyOf, creditOf, itemOfQuote, markOnDark, markOnPaper, srcSetOf } from '@/data/pictures'
import { kindOfAct, kindOfBoat, wayBack, type Step } from './step'
import { GivenSeal, readyTheStamp } from './GivenSeal'
import {
  LEVEL_SAY,
  NO_LEVEL_SAY,
  allSay,
  cappedSay,
  choiceSay,
  giveWaitsLead,
  inSentence,
  insteadSay,
  levelCountSay,
  pictureSays,
  reasonSay,
  savedSay,
  searchSay,
  sourcesSay,
  totalNoteSay,
  unpricedSay,
  unpricedTag,
} from './say'
/* THE ADDRESS GRAMMAR OF A CASCADE, from the screen that owns it.
   This is the one import in this file that reaches into another
   screen and it is two pure functions rather than a component: the
   screen that RAISES a decision and the screen that READS it must not
   be able to spell the same `fix` two ways, and a constant in one
   place is the only thing that makes that true. */
import { levelFix } from '@/screens/cascade/proposal'
/* THE CHANDLERY IS ONE COMPONENT IN TWO PLACES (direction B): the fit chapter's parts, and
   /catalogue. It is the catalogue's own screen, reached from here as a component, never copied. */
import { Chandlery, type ChandleryFitting } from '@/screens/catalogue/Chandlery'
import { PartDrag, QUOTE_DROP, useQuoteDrop } from '@/screens/catalogue/drag'
import { PARTS_TABLE } from '@/screens/catalogue/shelf'
import { fitmentOf } from '@/app/ways'
import { boatTravel, levelGlyph } from './glyphs'
import { specsSaid } from '@/domain/quote/specSay'
import { goodsSpecs, quoteSells } from '@/domain/quote/sells'
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
export const DOCUMENT_SAY =
  'Choose which sections print in the preview. Once given, those sections and every price are final, and it can be printed or emailed from your own mail.'

/** WHAT SENDING IS HERE, said under the act: the app has no mail of its own. */
export const SEND_SAY =
  'Print it or save it as a PDF from the printed quote. Email opens your own mail, where you attach that PDF.'

/** Said on the email act where the customer's contact line holds no address. */
export const NO_EMAIL =
  'Their contact line holds no email address, so there is nowhere to send it from here.'

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

/**
 * A STEP THE BAND CAN HOLD IN TWO LINES (the build page round, 2026-10-31: at 1440 a dealer-fit
 * step, "Fusion Apollo RA670 Stereo w 2 Pairs of XS 6.5" Speakers + 1.8mtr Aerial put on the
 * quote · no price on it", stood 8–87px in the band and over the bar's Prepared by at 68; at 1920
 * a swap stood 8–98). The band is 60px over the bar, which two lines of the toast fill. A step
 * longer than that is said where a shorter one is said below 1440, in the total's own card, and
 * the toast is not raised. The width is the card's (`src/ui/toaster.css`: half the window less
 * the pill's half and its air, and Sonner's 356px below 1680 where the build does not widen it)
 * less its glyph, its padding and its way back.
 */
function bandHolds(said: string): boolean {
  if (typeof document === 'undefined' || /jsdom/i.test(navigator.userAgent)) return true
  const pen = document.createElement('canvas').getContext('2d')
  if (!pen) return true
  const wide = innerWidth >= 1680
  pen.font = `600 ${wide ? 14 : 12}px ${getComputedStyle(document.body).fontFamily}`
  const card = wide ? innerWidth / 2 - 396 : Math.min(356, innerWidth / 2 - 396)
  /* its glyph, its padding and its way back ("Put it back" the widest) take about 170px */
  const words = card - 170
  return words > 0 && pen.measureText(said).width <= words * 1.8
}

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
    /* the blocks a first window may end on: a chapter, or in a hand the boat's own specification
       under its photograph (the critic, P-15), so the search field never stands half under the
       floating total */
    const chapters = [
      ...node.querySelectorAll<HTMLElement>('.cfg-specs'),
      ...node.querySelectorAll<HTMLElement>('.cfg-chapter'),
    ]
    /* the tab bar's room, and the tally's where it stands over the foot of the window */
    const tally = node.querySelector<HTMLElement>('.cfg-tally')
    const over =
      tally && getComputedStyle(tally).position === 'sticky' ? tally.offsetHeight + ROOM_AIR : 0
    const foot = (Number.parseFloat(getComputedStyle(node).paddingBlockEnd) || 0) + over
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
  /** THE CHANDLERY'S OPEN AISLE AND ITS MAKER, positions in the fit chapter and so search params
   *  (`aisle`, `maker`); '' for none */
  aisle?: string
  maker?: string
  /** where a press in the chandlery writes them */
  goAisle?: (aisle: string, maker: string) => void
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
  aisle = '',
  maker = '',
  goAisle,
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
  /* THE WHOLE RANGE OF ONE LIST, OPEN OVER THE PAGE (`RangeSheet`), or the chandlery's aisles
     (`ChandlerySheet`): what is open is state, and the chandlery's open aisle is the address's,
     so a chandlery opened at an aisle opens again at it */
  const [range, setRange] = useState<{ tableId: string; chapter: string } | null>(null)
  const [ranging, setRanging] = useState(false)
  /* the list stays named through the sheet's exit, then is let go, so a closed sheet reads
     nothing as the quote changes */
  const letGo = useRef<number | null>(null)
  useEffect(
    () => () => {
      if (letGo.current !== null) window.clearTimeout(letGo.current)
    },
    [],
  )
  const [aisles, setAisles] = useState(aisle !== '')
  /* THE CUSTOMER'S DETAILS, open under their cell in the bar (`Customer`) */
  const [asking, setAsking] = useState(false)
  /* AT A DESK ONLY THE CHAPTERS SCROLL, inside their own column (`.cfg-scroll`) */
  const desk = useDesk()
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null)
  /* THE WIDTH THE BROWSER GIVES THE COLUMN'S SCROLLBAR, so the plate's end edge stays on the
     bar's whether the scrollbar is drawn beside it or laid over it (configurator.css) */
  useEffect(() => {
    if (!scroller || typeof ResizeObserver === 'undefined') return
    const measure = (): void => {
      scroller.style.setProperty('--cfg-bar-w', `${scroller.offsetWidth - scroller.clientWidth}px`)
    }
    measure()
    const watch = new ResizeObserver(measure)
    watch.observe(scroller)
    return () => watch.disconnect()
  }, [scroller])
  const [step, setStep] = useState<Step | null>(null)
  const [refused, setRefused] = useState<string | null>(null)
  const field = useRef<HTMLElement>(null)
  const standsStill = useStandsStill(`${step?.eventId ?? ''} ${refused ?? ''}`)
  const { hold } = standsStill

  /* THE MASTHEAD NO LONGER STICKS (the owner, 2026-10-30: the total "should move from top right
     to bottom left"). It was sticky because the running total stood in it, and it was measured
     so the search field and the stage could stick under it. The total is the tally's now, at the
     bottom left (`Tally`), so the head is the quote's identity at the top of the page and
     scrolls away with it; what sticks at a desk sticks under the shell's pill
     (`--shell-inset`, configurator.css). */

  /* THE PICTURE DRAWN LARGE, and the set it is one of: a chapter's pictures, or the boat's
     (`Lightbox`). Nothing about it is a position worth an address, so it is state. */
  const [large, setLarge] = useState<{
    set: readonly LightboxPicture[]
    at: number
    title: string
  } | null>(null)
  const showLarge = useCallback(
    (set: readonly LightboxPicture[], index: number, title: string) =>
      setLarge({ set, at: index, title }),
    [],
  )

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
    /* AT A DESK THE BOAT'S COLUMN IS AS TALL AS THE WINDOW LEAVES IT: the page is the window's
       height and only the chapters scroll (configurator.css, "the floor"), so nothing about where
       the column rests is measured any more. */
    let frame = 0
    const look = (): void => {
      frame = 0
      const stuck = window.scrollY > 0
      if (stuck !== 'stuck' in node.dataset) {
        if (stuck) node.dataset.stuck = ''
        else delete node.dataset.stuck
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
  /* the step stands in the band only where the band holds it (`bandHolds`) */
  const banded = toasts && step !== null && bandHolds(step.said)
  useEffect(() => {
    const standing = step ? quotesStore.getState().quotes.find((q) => q.id === quoteId) : undefined
    const way = step && standing ? wayBack(step, standing) : null
    if (!step || way === null || !toasts || !bandHolds(step.said)) {
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
  const sheetStep = useRef<HTMLOutputElement>(null)
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
    () => (quote && open ? readRail(ctx, quote, { query }) : null),
    [ctx, quote, open, query],
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
  useOpenedAt(scroller, here, at)
  /* THE CHAPTER THE SUMMARY WAS OPENED FROM, so leaving it lands back where the work was */
  const lastHere = useRef('')
  useEffect(() => {
    if (here !== 'finale' && here !== '') lastHere.current = here
  }, [here])
  /* AT A DESK, SCROLLING ON PAST THE LAST CHAPTER BRINGS THE SUMMARY IN (`useOnPast`) */
  const onPast = useEffectEvent(() => {
    endStep()
    goTo?.('finale')
  })
  useEffect(() => {
    if (!desk || !scroller) return
    return listenPast(
      scroller,
      'down',
      () => scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2,
      () => onPast(),
    )
  }, [desk, scroller])

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
            quoteSells(ctx, quote).noun,
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
     answers with — `readRail`. A row here is not an address (a chapter
     is a place inside one screen), so it carries `at: 'here'` and the
     shell hands the id straight back to `goTo`, which is the route's own
     way of opening a chapter.
     ITS FACT IS THE CHAPTER'S OWN, AT REST (built-critique-m3.md, major
     11: the finder said "2 more offered" where the motor chapter said
     "1 more offered"). Read with the finder's words, a chapter's count
     was the count of what those words matched, so one list said two
     figures. The rows are every chapter whatever is typed, as they were,
     and each says what the chapter's own head says. */
  const scope = useMemo(
    () =>
      quote && open
        ? {
            word: quote.reference,
            title: 'On this build',
            say: 'Each part of this quote, on this screen.',
            rows: () =>
              readRail(ctx, quote).chapters.map((chapter) => ({
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
    [ctx, quote, open, goTo, endStep],
  )
  useSetScope(scope)
  /* below a desk, the summary is at the page's end and scrolled to as often as opened: while it
     holds the window's upper half its card says the total, and the tally steps aside (`Tally`) */
  const [summarySeen, setSummarySeen] = useState(false)

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
  /* THE SUMMARY STANDS OVER THE BUILD AT A DESK, AND AT THE PAGE'S END BELOW ONE (`Summary`). It
     is open where the address names it, and on a given quote, which opens on it: its address is
     the old finale's, `at=finale`, so a link, Back and a reload all land on it. A draft whose
     every part is answered is not taken there by itself: the door at the rail's foot says it is
     ready, and the dealer goes when the customer is. */
  const summaryOpen = here === 'finale' && rail?.searching !== true && (at === 'finale' || issued)
  const firstBand = chapters.find((c) => c.kind === 'band')?.id ?? ''
  const seeSummary = (): void => {
    endStep()
    /* below a desk the summary is always the page's end: where the address already names it, the
       door takes the page there itself */
    if (!desk && summaryOpen) {
      document
        .getElementById('cfg-summary')
        ?.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'instant' : 'smooth' })
      return
    }
    goTo?.('finale')
  }
  const backToBuild = (): void => {
    endStep()
    goTo?.(lastHere.current === '' ? firstBand : lastHere.current)
  }
  const note = rail
    ? totalNoteSay(rail.unpricedNames, hullHasNoPrice(quote), rail.unpricedLists, rail.unpricedWhy)
    : ''

  /* THE STEP'S LINE IN THE HEAD, below 1440 (`StepLine`): the step and its way back, or the
     engine's refusal of the last press, in its own words */
  const said =
    !banded && step !== null && back !== null ? (
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
  /* AND ON A SHEET, WHERE THE TALLY THAT SAYS IT IS BEHIND THE SHEET (below 1440): the step a press
     inside the sheet took, with its way back, at the sheet's own head */
  const sheetSaid =
    !banded && step !== null && back !== null ? (
      <StepLine
        ref={sheetStep}
        said={step.said}
        kind={step.kind}
        way={back}
        onBack={() => goBack(step)}
      />
    ) : null

  /* THE CUSTOMER IS NAMED IN THE BAR, from wherever the build asks for them (the finale's card):
     the bar is brought into the window where the page has scrolled it away, and its cell opens */
  const askWho = (): void => {
    endStep()
    document
      .querySelector('[data-testid="configurator"] .cfg-mast')
      ?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
    setAsking(true)
  }

  /* EVERY "SHOW ALL" OPENS OVER THE PAGE (the owner, 2026-10-30: "the experience of viewing all
     of the products and things should be popup please done nicely"): a list's whole range in the
     range sheet, and the parts table's in the chandlery's aisles */
  const showAllOf = (tableId: string): void => {
    const chapter = chapters.find((c) => c.tables.some((t) => t.id === tableId))
    const table = chapter?.tables.find((t) => t.id === tableId)
    if (!chapter || !table) return
    if (table.tableId === PARTS_TABLE) {
      setAisles(true)
      return
    }
    if (letGo.current !== null) window.clearTimeout(letGo.current)
    letGo.current = null
    setRange({ tableId, chapter: chapter.name })
    setRanging(true)
  }
  const parts = chapters.flatMap((c) => c.tables).find((t) => t.tableId === PARTS_TABLE)

  /* BELOW A DESK THE SUMMARY IS ALWAYS THE PAGE'S END (the critic, P-1: "scroll down and then see
     big summary" — at 834 and 390, thirty turns of the wheel ended on the door and no summary):
     scrolling on past the last chapter reaches it, and the door and its address bring the page to
     it. At a desk it rises over the build only while the address names it. While a search
     narrows the rail it steps aside, since the rail is then a list of answers. */
  const summaryDrawn = desk ? summaryOpen : rail !== null && rail.searching !== true
  const summary = summaryDrawn ? (
    <Summary
      key="summary"
      open={summaryOpen}
      quote={quote}
      quoteId={quoteId}
      ctx={ctx}
      rail={rail}
      art={art}
      desk={desk}
      onBack={backToBuild}
      onLarge={showLarge}
      openQuote={openQuote}
      openDocument={openDocument}
      now={now}
      justGiven={justGiven}
      onPress={press}
      onWho={() => {
        /* at a desk the bar is under the summary, so the summary lowers first */
        if (desk) backToBuild()
        askWho()
      }}
      go={go}
      setStep={setStep}
      setRefused={setRefused}
      onSeen={setSummarySeen}
    />
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
    >
      {/* THE BUILD: the bar, the boat and the chapters. At a desk the summary rises over it, and
          while it stands there the build is out of reach of the keyboard and a reader */}
      <div
        className="cfg-edit"
        inert={desk && summaryOpen ? true : undefined}
        data-away={desk && summaryOpen ? '' : undefined}
      >
        <Mast
          quote={quote}
          quoteId={quoteId}
          register={ctx.entities[quote.rootTableId]?.name ?? ''}
          preparer={quote.preparer ?? preparerNow(sheet, quote.preparedBy ?? who)}
          kept={kept}
          asking={asking}
          onAsking={setAsking}
          setStep={setStep}
          setRefused={setRefused}
        />

        {/* A PART CARRIED FROM THE CHANDLERY TO THE TOTAL travels inside this (`PartDrag`) */}
        <PartDrag>
          <div className="cfg-floor">
            {/* THE BOAT AND WHAT IT COMES TO, ONE COLUMN AT A DESK: the photograph inside the page's
            measure, and the tally at the column's foot (configurator.css, "the side") */}
            <div className="cfg-side">
              <div className="cfg-side__in">
                <Stage quote={quote} ctx={ctx} art={art!} rail={rail} onLarge={showLarge} />
                <Tally
                  desk={desk}
                  quote={quote}
                  rail={rail}
                  open={open}
                  art={art}
                  note={summaryOpen ? '' : note}
                  said={said}
                  elsewhere={summaryOpen}
                  aside={!desk && summarySeen}
                  raise={raise}
                  refusal={refusal}
                  onLarge={showLarge}
                  over={ranging || aisles}
                />
              </div>
            </div>

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
                    scroller={desk ? scroller : null}
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
              {/* AT A DESK THE ONE THING ON THE PAGE THAT SCROLLS (the owner, 2026-10-30: "the only
                thing that should scroll is the right hand bar the rest stays as is"): the
                chapters, inside their own column, the bar, the boat and the total standing still
                beside them. Below a desk it is a plain block and the page scrolls. */}
              <div className="cfg-scroll" ref={setScroller}>
                <div
                  className="cfg-chapters"
                  ref={chaptersRef}
                  data-rise={quote.state === 'draft' ? '' : undefined}
                >
                  {chapters.map((chapter, i) =>
                    chapter.kind === 'finale' ? (
                      <SummaryDoor
                        key={chapter.id}
                        at={chapterRefs[i]}
                        index={i}
                        chapter={chapter}
                        open={summaryOpen}
                        onSee={seeSummary}
                      />
                    ) : (
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
                        onPress={press}
                        onLarge={showLarge}
                        ctx={ctx}
                        go={go}
                        onShowAll={showAllOf}
                        refusal={refusal}
                        quoteId={quoteId}
                        setStep={setStep}
                        setRefused={setRefused}
                      />
                    ),
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* THE WHOLE RANGE OF A LIST, AND THE CHANDLERY'S AISLES, OVER THE PAGE */}
          <RangeSheet
            open={ranging}
            onClose={() => {
              setRanging(false)
              letGo.current = window.setTimeout(() => {
                letGo.current = null
                setRange(null)
              }, SHEET_LEAVES_MS)
            }}
            tableId={range?.tableId ?? ''}
            chapter={range?.chapter ?? ''}
            ctx={ctx}
            quote={quote}
            quoteId={quoteId}
            level={level}
            total={rail?.total ?? null}
            said={sheetSaid}
            refusal={refusal}
            onPress={press}
            go={go}
          />
          {parts ? (
            <ChandlerySheet
              open={aisles}
              onClose={() => {
                setAisles(false)
                if (aisle !== '' || maker !== '') goAisle?.('', '')
              }}
              ctx={ctx}
              quote={quote}
              table={parts}
              aisle={aisle}
              maker={maker}
              goAisle={goAisle}
              total={rail?.total ?? null}
              said={sheetSaid}
              refusal={refusal}
              onPress={press}
              go={go}
            />
          ) : null}
        </PartDrag>
      </div>
      {/* THE WHOLE QUOTE AT A GLANCE, ONE SCREEN (`Summary`): at a desk it rises over the build and
          lowers again, so it stays while it leaves; below one it is the page's end, there or not */}
      {desk ? <AnimatePresence>{summary}</AnimatePresence> : summary}
      <Lightbox
        pictures={large?.set ?? []}
        at={large?.at ?? null}
        title={large?.title ?? ''}
        onAt={(next) => setLarge((was) => (was && next !== null ? { ...was, at: next } : null))}
      />
    </main>
  )
}

/* ---------------------------------------------------------- */
/* A desk, where only the chapters scroll                       */
/* ---------------------------------------------------------- */

/** WHERE THE PAGE STANDS STILL AND ONLY THE CHAPTERS SCROLL: two columns, and a window tall
 *  enough for the boat's column to hold its photograph, its facts and its total (the ladder in
 *  configurator.css; the same query). */
const DESK = '(min-width: 1200px) and (min-height: 700px)'

function deskNow(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(DESK).matches
}

/** Whether this window is a desk, where the chapters scroll in their own column. */
function useDesk(): boolean {
  const [desk, setDesk] = useState(deskNow)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const query = window.matchMedia(DESK)
    const changed = (): void => setDesk(query.matches)
    query.addEventListener('change', changed)
    return () => query.removeEventListener('change', changed)
  }, [])
  return desk
}

/**
 * THE CHAPTER THE ADDRESS NAMES IS WHERE THE COLUMN OPENS (the owner's "only the right hand bar
 * scrolls", 2026-10-30). The column's scroll is a position, and the position is already in the
 * address as the chapter (`?at=`): so a reload, Back or a shared link opens the column with that
 * chapter's head at its top, at once and without a move. Once, when the build is first drawn; from
 * then on the dealer's own presses bring chapters in (`useBroughtIn`). Below a desk the window
 * scrolls and the first address moves nothing, as before.
 */
function useOpenedAt(scroller: HTMLElement | null, here: string, at: string): void {
  const done = useRef(false)
  useLayoutEffect(() => {
    if (done.current || !scroller || here === '') return
    done.current = true
    if (at === '' || scrollerOf(scroller.firstElementChild) === null) return
    const chapter = scroller.querySelector<HTMLElement>(`[data-chapter="${here}"]`)
    if (!chapter || chapter === scroller.querySelector('[data-chapter]')) return
    const margin = Number.parseFloat(getComputedStyle(chapter).scrollMarginBlockStart) || 0
    scroller.scrollTo({
      top:
        chapter.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop -
        margin,
      behavior: 'instant',
    })
  }, [scroller, here, at])
}

/* ---------------------------------------------------------- */
/* The whole range of a list, over the page                     */
/* ---------------------------------------------------------- */

/** How long a sheet is given to leave before its list is let go: the kit's dialog leaves in
 *  `--duration-enter` (200ms), and this is twice that. */
const SHEET_LEAVES_MS = 400

/** How many powers a whole range may chip before the chips step aside for the find field. */
const POWERS_AT_MOST = 12

/** HOW MANY OF A LIST THE RANGE SHEET DRAWS AT MOST, where the column draws forty: the whole of a
 *  maker's motors ("All 209 in Yamaha Outboards" on the Sport 560, measured 2026-10-30). Past it
 *  the sheet says how many it draws, and its find field narrows. */
const RANGE_CAP = 400

/**
 * THE QUOTE'S TOTAL, DRAWN AGAIN ON A SHEET (`RangeSheet`, `ChandlerySheet`): the figure as it
 * stands, set and never counted, so a press inside the sheet is seen to change what the quote
 * comes to without closing it; and the place a part carried in the chandlery is let go, saying
 * so while one is carried (`useQuoteDrop`).
 */
function SheetTotal({ total }: { total: number | null }) {
  const { place, carrying, over } = useQuoteDrop(`${QUOTE_DROP}:sheet`)
  return (
    <div
      ref={place}
      className="cfg-sheet__total"
      data-testid="sheet-total"
      data-carrying={carrying ? '' : undefined}
      data-over={over ? '' : undefined}
    >
      <span className="cfg-sheet__lab">Total</span>
      <span className="cfg-sheet__fig">
        {total === null ? '—' : <PriceFigure amount={total} />}
      </span>
      {carrying ? (
        <output className="cfg-sheet__drop">Drop it here to put it on the quote</output>
      ) : null}
    </div>
  )
}

/**
 * EVERY ONE OF A LIST, OVER THE PAGE (the owner, 2026-10-30: "the experience of viewing all of the
 * products and things should be popup please done nicely"). "Show all 209 in Yamaha Outboards"
 * used to push 209 tiles into the column under the four made for this boat, and the column was a
 * catalogue until it was pressed shut again. Now it opens this: a large sheet over the page, with
 * its own find field, the list's pictures as tiles, and the quote's total at its head, which a
 * press on a tile changes in place. Escape, a press outside it or its close hand the caret back
 * to the press that opened it; the page behind it does not scroll while it stands.
 *
 * The list is the rail's own reading with its narrowing off (`readRail`, `showAll`), so every tile
 * is the build's own tile and every press the build's own act. A picture opens large over the
 * sheet, among the sheet's own pictures.
 */
function RangeSheet({
  open,
  onClose,
  tableId,
  chapter,
  ctx,
  quote,
  quoteId,
  level,
  total,
  said,
  refusal,
  onPress,
  go,
}: {
  open: boolean
  onClose: () => void
  /** the list's block on the quote */
  tableId: string
  /** the chapter it is a list of, for the pictures' set */
  chapter: string
  ctx: CatalogueCtx
  quote: QuoteDef
  quoteId: string
  level: string | null
  total: number | null
  /** the last step and its way back, where no toast says it */
  said: ReactNode
  refusal: string | undefined
  onPress: (act: Act) => void
  go?: ((href: string) => void) | undefined
}) {
  const [find, setFind] = useState('')
  const typed = useDeferredValue(find.trim())
  const [large, setLarge] = useState<{ set: readonly LightboxPicture[]; at: number } | null>(null)
  const read = useMemo(
    () =>
      tableId === ''
        ? null
        : readRail(ctx, quote, { query: typed, showAll: new Set([tableId]), cap: RANGE_CAP }),
    [tableId, ctx, quote, typed],
  )
  /* the list is read while its list is named, which the build keeps through the sheet's exit,
     so the sheet leaves with its tiles rather than empty */
  const shown = read?.chapters.flatMap((c) => c.tables).find((t) => t.id === tableId)
  const shutId = 'cfg-sheet-shut'
  const all = shown?.counts.catalogue ?? 0
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) return
        onClose()
        setFind('')
      }}
      size="xl"
      title={shown ? `All ${all.toLocaleString('en-AU')} in ${shown.title}` : chapter}
      description={`Every one the price list holds, whether it ${read?.sells.boat === false ? `goes with this ${read.sells.noun}` : 'is made for this boat'} or not. A press puts it on the quote, and another takes it off.`}
      bar={
        <div className="cfg-sheet__bar">
          <div className="cfg-sheet__find">
            <label className="cfg-sheet__label" htmlFor="cfg-sheet-find">
              {shown ? `Find in ${shown.title}` : 'Find'}
            </label>
            <Input
              id="cfg-sheet-find"
              type="search"
              icon={MagnifyingGlassIcon}
              value={find}
              onValueChange={setFind}
              placeholder={shown?.kind === 'motor' ? 'A name, a code, a power' : 'A name or a code'}
            />
          </div>
          <SheetTotal total={total} />
          {said ? <div className="cfg-sheet__step">{said}</div> : null}
        </div>
      }
    >
      <div className="cfg-sheet" data-testid="range-sheet">
        {refusal === undefined ? null : (
          <Said className="cfg-shut" id={shutId} glyph={LockSimpleIcon}>
            {refusal}
          </Said>
        )}
        {shown && read ? (
          <TableBlock
            table={shown}
            orphans={[]}
            told={read.unpricedLists}
            quoteId={quoteId}
            named={false}
            query={typed.length >= 2 ? typed : ''}
            level={level}
            onPress={onPress}
            onLarge={(set, at) => setLarge({ set, at })}
            onShowAll={() => {}}
            motors={quote.lines
              .filter((line) => ctx.entities[line.entityId]?.kind === 'motor')
              .map((line) => line.code ?? '')
              .filter((code) => code !== '')}
            refusedBy={refusal === undefined ? undefined : shutId}
            shop={false}
            go={go}
            noun={read.sells.noun}
            entire
          />
        ) : null}
      </div>
      <Lightbox
        pictures={large?.set ?? []}
        at={large?.at ?? null}
        title={chapter}
        onAt={(next) => setLarge((was) => (was && next !== null ? { ...was, at: next } : null))}
      />
    </Dialog>
  )
}

/** What the chandlery needs to fit a part on this quote, read off the rail's parts table. */
function fittingOf(
  quote: QuoteDef,
  table: ChapterTable,
  onPress: (act: Act) => void,
  refusedBy: string | undefined,
): ChandleryFitting {
  return {
    boat: boatOfQuote(quote).name,
    fitsHref: fitmentOf(quote.rootRowId),
    /* by the part's own row, which a pairing's key is not */
    madeFor: table.rows
      .filter((row) => !row.outside)
      .flatMap((row) => {
        const act = row.act
        const id =
          act.do === 'add'
            ? act.line.rowId
            : act.do === 'remove'
              ? quote.lines.find((line) => line.id === act.lineId)?.rowId
              : undefined
        return id ? [id] : []
      }),
    on: new Map(
      quote.lines
        .filter((line) => line.entityId === table.tableId)
        .map((line) => [line.rowId, line.id]),
    ),
    put: (line) => onPress({ do: 'add', blockId: table.id, line }),
    takeOff: (lineId) =>
      onPress({
        do: 'remove',
        lineId,
        label: quote.lines.find((line) => line.id === lineId)?.label ?? '',
      }),
    refusedBy,
  }
}

/**
 * THE CHANDLERY'S AISLES, OVER THE PAGE (direction B, picked 2026-10-30, and the owner the same
 * day: "viewing all of the products and things should be popup"). The same catalogue as
 * /catalogue — one component in two places — fitting this boat: what the price list makes for
 * it, the eighteen aisles, the open aisle's parts as cards with Add, and the quote's total at the
 * sheet's head, where a carried part is let go. The open aisle and its maker stay the address's
 * (`aisle`, `maker`), so a chandlery opened at an aisle opens again at it; closing the sheet
 * clears them.
 */
function ChandlerySheet({
  open,
  onClose,
  ctx,
  quote,
  table,
  aisle,
  maker,
  goAisle,
  total,
  said,
  refusal,
  onPress,
  go,
}: {
  open: boolean
  onClose: () => void
  ctx: CatalogueCtx
  quote: QuoteDef
  /** the rail's parts table, for what is made for this boat and what is on the quote */
  table: ChapterTable
  aisle: string
  maker: string
  goAisle?: ((aisle: string, maker: string) => void) | undefined
  total: number | null
  /** the last step and its way back, where no toast says it */
  said: ReactNode
  refusal: string | undefined
  onPress: (act: Act) => void
  go?: ((href: string) => void) | undefined
}) {
  const [large, setLarge] = useState<{
    set: readonly LightboxPicture[]
    at: number
    title: string
  } | null>(null)
  const shutId = 'cfg-chandlery-shut'
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      size="xl"
      title="The chandlery"
      description={`Every part on the price list, by what it is for, fitting the ${boatOfQuote(quote).name}.`}
      bar={
        <div className="cfg-sheet__bar cfg-sheet__bar--end">
          {said ? <div className="cfg-sheet__step">{said}</div> : null}
          <SheetTotal total={total} />
        </div>
      }
    >
      <div className="cfg-sheet" data-testid="chandlery-sheet">
        {refusal === undefined ? null : (
          <Said className="cfg-shut" id={shutId} glyph={LockSimpleIcon}>
            {refusal}
          </Said>
        )}
        <Chandlery
          ctx={ctx}
          levelKey={quote.levelKey}
          aisle={aisle}
          maker={maker}
          onAisle={(a, m) => goAisle?.(a, m)}
          onLarge={(set, at, title) => setLarge({ set, at, title })}
          go={go}
          fitting={fittingOf(quote, table, onPress, refusal === undefined ? undefined : shutId)}
        />
      </div>
      <Lightbox
        pictures={large?.set ?? []}
        at={large?.at ?? null}
        title={large?.title ?? ''}
        onAt={(next) => setLarge((was) => (was && next !== null ? { ...was, at: next } : null))}
      />
    </Dialog>
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
    /* the summary brings itself in (`Summary`), and a move here would race it */
    if (at !== '' || searching || here === '' || here === 'finale') return
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
      const view = viewOf(chapter)
      const room =
        (view.box ? view.bottom - view.top : window.innerHeight) -
        (Number.parseFloat(margins.scrollMarginBlockStart) || 0) -
        (Number.parseFloat(margins.scrollMarginBlockEnd) || 0)
      const quiet = reducedMotion()
      chapter.scrollIntoView({
        block: chapter.getBoundingClientRect().height > room ? 'start' : 'nearest',
        behavior: quiet ? 'instant' : 'smooth',
      })
      if (quiet) uncut(chapter)
      else (view.box ?? window).addEventListener('scrollend', () => uncut(chapter), { once: true })
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
    /* the summary brings itself in (`Summary`), and a move here would race it */
    if (at === '' || at === before || searching || here !== at || here === 'finale') return
    const chapter = rail.current?.querySelector<HTMLElement>(`[data-chapter="${here}"]`)
    if (!chapter || typeof chapter.scrollIntoView !== 'function') return
    pending.current?.()

    let timer: number | null = null
    let moving = false
    /* what moves: the chapters' own column at a desk, the window below one */
    let moves: HTMLElement | null = null
    const done = (): void => {
      if (timer !== null) window.clearTimeout(timer)
      timer = null
      moving = false
      for (const type of TAKES_OVER) window.removeEventListener(type, takeOver, true)
      ;(moves ?? window).removeEventListener('scrollend', arrived)
      if (pending.current === done) pending.current = null
    }
    /* the move ran to its end with nobody taking over: no head is left half under the bars */
    function arrived(): void {
      done()
      uncut(chapter!)
    }
    function takeOver(): void {
      if (moving) {
        if (moves) moves.scrollTo({ top: moves.scrollTop, behavior: 'instant' })
        else window.scrollTo({ top: window.scrollY, behavior: 'instant' })
      }
      done()
    }
    const bring = (): void => {
      chapter.style.setProperty('--cfg-cover', `${coverOf(chapter)}px`)
      const view = viewOf(chapter)
      moves = view.box
      const cover = view.top
      const foot = Number.parseFloat(getComputedStyle(chapter).scrollMarginBlockEnd) || 0
      const room = view.bottom - cover - foot
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
      /* ONE MOVE, TO WHERE IT ENDS (the critic, P-7): brought up by its head and then back down
         so the head above was not left cut, the page moved twice, past its rest and back; the
         rest is worked out first and the page goes there once */
      ;(moves ?? window).scrollBy({
        top: landing(chapter, cover),
        behavior: quiet ? 'instant' : 'smooth',
      })
      if (quiet) {
        done()
        return
      }
      moving = true
      ;(moves ?? window).addEventListener('scrollend', arrived)
      timer = window.setTimeout(done, BRINGS_MS)
    }
    for (const type of TAKES_OVER)
      window.addEventListener(type, takeOver, { capture: true, passive: true })
    pending.current = done
    /* BROUGHT IN ONCE THE CHAPTER IT REPLACED HAS FOLDED AWAY, measured where it rests: brought in
       while that fold still ran, the page went past its rest and then back (the critic, P-7) */
    const asked = performance.now()
    const once = (): void => {
      timer = null
      if (folding(chapter) && performance.now() - asked < FOLD_WAIT_MS) {
        timer = window.setTimeout(once, 16)
        return
      }
      bring()
    }
    timer = window.setTimeout(once, reducedMotion() || caretInField() ? LEAVES_MS : FOLDS_MS)
  }, [rail, here, at, searching])
}

/**
 * THE PRESSED HEAD STAYS UNDER THE POINTER WHILE THE CHAPTER IT REPLACES FOLDS (the critic, P-7:
 * 140ms after "03 Trailer" was pressed the column had moved 48px and the hull's head was half cut
 * at its top). Every frame until the fold is done (`FOLDS_MS`), whatever the fold above it moved is
 * scrolled back by exactly that much, so the head stands where it was pressed and its body grows
 * out under it; only then does `useBroughtIn` decide whether to bring it up. A wheel, a touch, a key
 * or a press ends it at once.
 */
function holdStill(head: HTMLElement): void {
  const box = scrollerOf(head)
  const from = head.getBoundingClientRect().top
  const began = performance.now()
  let stopped = false
  const stop = (): void => {
    stopped = true
  }
  for (const kind of TAKES_OVER) window.addEventListener(kind, stop, { passive: true })
  const step = (): void => {
    /* until the chapter it replaces has folded away, and never longer than a fold can take */
    const now = performance.now()
    const going =
      !stopped &&
      head.isConnected &&
      now - began < FOLD_WAIT_MS &&
      (now - began < FOLDS_MS || folding(head))
    if (going) {
      const drift = head.getBoundingClientRect().top - from
      if (Math.abs(drift) >= 0.5) (box ?? window).scrollBy({ top: drift, behavior: 'instant' })
      requestAnimationFrame(step)
      return
    }
    for (const kind of TAKES_OVER) window.removeEventListener(kind, stop)
  }
  requestAnimationFrame(step)
}

/** The longest a fold is waited for before a chapter is held or brought in regardless. */
const FOLD_WAIT_MS = 700

/** Whether a chapter is still folding away around this one: a shut chapter whose body is still in
 *  the page, leaving on the kit's exit. */
function folding(near: Element): boolean {
  const rail = near.closest('.cfg-chapters')
  if (!rail) return false
  /* a body whose section is not the open one */
  return [...rail.querySelectorAll('.cfg-body')].some(
    (body) => !body.parentElement?.hasAttribute('data-open'),
  )
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
    const view = viewOf(rail)
    const cover = view.top
    const shown = (control: Element): boolean => {
      const { top } = control.getBoundingClientRect()
      return top >= cover && top < view.bottom
    }
    const own = last.current
    if (own?.isConnected && rail.contains(own) && shown(own)) {
      remember(own)
      return
    }
    const middle = (cover + view.bottom) / 2
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
    if (Math.abs(moved) >= 1)
      (buildScroller() ?? window).scrollBy({ top: moved, behavior: 'instant' })
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
  const view = viewOf(chapter)
  const above = cutAbove(chapter, view.top)
  if (above === null) return
  const gap =
    Number.parseFloat(getComputedStyle(chapter).scrollMarginBlockStart) - coverOf(chapter) || 0
  ;(view.box ?? window).scrollBy({
    top: above.top - view.top - gap,
    behavior: reducedMotion() ? 'instant' : 'smooth',
  })
}

/**
 * HOW FAR TO MOVE SO A CHAPTER BROUGHT IN BY ITS HEAD COMES TO REST: its head at the top of the
 * room by its own scroll margin — or, where that would leave the head above it straddling the
 * room's top edge, that head wholly in view at the top instead (what `uncut` used to put right with
 * a second move).
 */
function landing(chapter: HTMLElement, cover: number): number {
  const margin = Number.parseFloat(getComputedStyle(chapter).scrollMarginBlockStart) || 0
  const move = chapter.getBoundingClientRect().top - cover - margin
  for (let el = chapter.previousElementSibling; el !== null; el = el.previousElementSibling) {
    const box = (el.querySelector('.cfg-head') ?? el).getBoundingClientRect()
    const peeks = box.bottom - move - cover
    if (peeks <= HEAD_PEEKS) return peeks > 0 ? move + peeks : move
    if (box.top - move < cover - HEAD_PEEKS)
      return box.top - cover - (margin - coverOf(chapter) || 0)
  }
  return move
}

/** How much of a head may show at the room's top edge before it reads as a head cut in two: the
 *  8px a chapter's scroll margin leaves over the head brought up shows the foot of the one above,
 *  its padding and no words, and that is a gap, not a cut (measured at 390: 7px). */
const HEAD_PEEKS = 10

/** whether a head's foot, standing this far over the room's top edge, is under the bars */
function underTheBars(bottom: number, cover: number): boolean {
  return bottom <= cover + HEAD_PEEKS
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
    if (underTheBars(box.bottom, cover)) return null
    /* a head a few pixels over the edge is a scroll's rounding, not a head cut in two */
    if (box.top < cover - HEAD_PEEKS) return box
  }
  return null
}

/**
 * THE BOX THE CHAPTERS SCROLL IN. At a desk it is their own column (`.cfg-scroll`,
 * configurator.css, "the floor"), and the page itself does not move; below a desk there is none
 * and the window scrolls. Asked of the stylesheet, so the answer is the layout's own.
 */
function scrollerOf(el: Element | null | undefined): HTMLElement | null {
  const box = el?.closest<HTMLElement>('.cfg-scroll') ?? null
  return box && /auto|scroll/.test(getComputedStyle(box).overflowY) ? box : null
}

/** The chapters' scroller on the build in the document, where there is one. */
function buildScroller(): HTMLElement | null {
  return scrollerOf(document.querySelector('[data-testid="configurator"] .cfg-chapters'))
}

/**
 * THE BAND THE CHAPTERS ARE READ IN, in the window's own coordinates: at a desk the column's
 * box; below, the window under whatever sticks over its top. `box` is what to scroll.
 */
function viewOf(el: HTMLElement): { top: number; bottom: number; box: HTMLElement | null } {
  const box = scrollerOf(el)
  if (box) {
    const { top, bottom } = box.getBoundingClientRect()
    return { top, bottom, box }
  }
  return { top: coverOf(el), bottom: window.innerHeight, box: null }
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
/* The masthead: what is sold, for whom, its number and state   */
/* ---------------------------------------------------------- */
/**
 * THE MASTHEAD IS THE TOP WHITE BAR, AND THE PAGE STARTS WITH IT (the owner, 2026-10-30: "in that
 * left hand side of that white bar on the top that is where you put highfield logo and then have
 * model details and things … customer details i live in the top bar"). One white plate, read
 * left to right: the maker's own mark beside the boat's name as a person says it and its finish
 * (the colours drawn, then the words), then the quote's facts as labelled cells — its number,
 * where it stands, the day it was started, the CUSTOMER, and who prepared it.
 *
 * THE CUSTOMER IS KEPT HERE, NOT IN A CHAPTER. "Who it is for" was the last chapter of the
 * right-hand column; the name and the one line of contact it held are this cell's now, a press
 * that opens them under it (`Customer`). The rail is the build and nothing else.
 *
 * THE TOTAL IS NOT HERE. It is the tally's, at the foot of the boat's column (`Tally`).
 */
function Mast({
  quote,
  quoteId,
  register,
  preparer,
  kept,
  asking,
  onAsking,
  setStep,
  setRefused,
}: {
  quote: QuoteDef
  quoteId: string
  /** the maker's register, by the dealer's name for it ("Stacer"), for its mark */
  register: string
  /** who prepared it, with the title and number the paper prints (carried finding 2) */
  preparer: FrozenPreparer | undefined
  /** whether the last write was kept (`savedSay`) */
  kept: string | null
  /** whether the customer's details stand open under their cell */
  asking: boolean
  onAsking: (open: boolean) => void
  setStep: (step: Step) => void
  setRefused: (said: string | null) => void
}) {
  const boat = boatOfQuote(quote)
  const mark = markOnPaper(register)
  const white = markOnDark(register)
  const given = quote.state !== 'draft'
  const by = preparer
    ? [preparer.name, preparer.title ?? '', preparer.phone ?? '']
        .filter((part) => part !== '')
        .join(' · ')
    : ''
  return (
    <header className="cfg-mast">
      <div className="cfg-mast__bar">
        <div className="cfg-mast__what">
          {/* THE MAKER'S OWN MARK, in the dark ink paper takes, where the ledger holds one; its
              name in type where it does not (Mercury and Stabicraft publish white ink only) */}
          <p className="cfg-mast__maker">
            {mark.drawn ? (
              <img
                className="cfg-mast__mark"
                src={mark.mark.src}
                alt={mark.mark.brand}
                width={mark.mark.width}
                height={mark.mark.height}
              />
            ) : white.drawn ? (
              /* A MAKER WHO PUBLISHES WHITE INK ONLY (Stabicraft, Mercury) stands on the deep blue
                 its white is made for, as the stage's well draws it (the critic, P-12: the bar
                 said "STABICRAFT" in small blue capitals where Highfield's showed its mark) */
              <span className="cfg-mast__badge">
                <img
                  className="cfg-mast__mark"
                  src={white.mark.src}
                  alt={white.mark.brand}
                  width={white.mark.width}
                  height={white.mark.height}
                />
              </span>
            ) : (
              <span className="cfg-mast__word">{register}</span>
            )}
          </p>
          <div className="cfg-mast__words">
            <h1 className="cfg-mast__name">{boat.name}</h1>
            {boat.detail === '' ? null : (
              <p className="cfg-mast__detail">
                <Swatches colour={boat.colour} />
                <span>{slashed(boat.detail)}</span>
              </p>
            )}
          </div>
        </div>

        <dl className="cfg-mast__facts">
          <div className="cfg-mast__fact">
            <dt className="cfg-mast__lab">Quote</dt>
            <dd className="cfg-mast__val cfg-mono">{quote.reference}</dd>
          </div>
          <div className="cfg-mast__fact">
            <dt className="cfg-mast__lab">Stands</dt>
            <dd className="cfg-mast__val">
              {/* WHERE THE QUOTE STANDS, as a dot in its own ink beside its word — draft rose,
                  given leaf (tokens.css, THE KIT). Keyed by the state, so the moment a quote is
                  given its dot lands anew on the settle spring. */}
              <span className="cfg-state" data-state={given ? 'given' : 'draft'}>
                <span className="cfg-state__dot" key={quote.state} aria-hidden="true" />
                {given ? 'Given' : 'Draft'}
              </span>
            </dd>
          </div>
          <div className="cfg-mast__fact cfg-mast__fact--day">
            <dt className="cfg-mast__lab">{given ? 'Given' : 'Started'}</dt>
            <dd className="cfg-mast__val">
              {daySaid(given && quote.issuedAt ? quote.issuedAt : quote.createdAt)}
            </dd>
          </div>
          <div className="cfg-mast__fact cfg-mast__fact--who">
            <dt className="cfg-mast__lab">Customer</dt>
            <dd className="cfg-mast__val">
              <Customer
                quote={quote}
                quoteId={quoteId}
                open={asking}
                onOpen={onAsking}
                setStep={setStep}
                setRefused={setRefused}
              />
            </dd>
          </div>
          <div className="cfg-mast__fact cfg-mast__fact--by">
            <dt className="cfg-mast__lab">Prepared by</dt>
            <dd className="cfg-mast__val">
              <span>{by === '' ? '—' : by}</span>
              <span className="cfg-mast__kept">{savedSay(kept, given)}</span>
            </dd>
          </div>
        </dl>
      </div>
    </header>
  )
}

/**
 * THE CUSTOMER, IN THE BAR. A press on the cell opens what the quote holds about them under it —
 * their name and one line of contact, both printed on the quote exactly as typed — and a given
 * quote says them and offers nothing.
 *
 * THIS FILE HAS NO CUSTOMER REGISTER — `hasCustomerRegister` reads false on the pack, measured —
 * so the name is typed, frozen onto the document the moment it is put on, and belongs to this
 * quote alone: a quote is a photograph, and a name corrected in a register on Friday must not
 * rewrite the document handed over on Monday.
 *
 * WHAT IS TYPED GOES ON THE QUOTE WHEN IT IS PUT ON, AND WHEN THE PANEL CLOSES (the component
 * critique, 2026-09-28, major 10: a name typed and walked away from was thrown away without a
 * word). Enter, the act, Escape, a press outside: each writes what differs from the quote with
 * the engine's own command, so the step and its Undo say it.
 */
function Customer({
  quote,
  quoteId,
  open,
  onOpen,
  setStep,
  setRefused,
}: {
  quote: QuoteDef
  quoteId: string
  open: boolean
  onOpen: (open: boolean) => void
  setStep: (step: Step) => void
  setRefused: (said: string | null) => void
}) {
  const name = quote.customer.name.trim()
  const contact = quote.customer.contact?.[0] ?? ''
  if (quote.state !== 'draft') {
    return name === '' ? (
      <span>—</span>
    ) : (
      <span className="cfg-who">
        <span className="cfg-who__name">{name}</span>
        {contact === '' ? null : <span className="cfg-who__contact">{contact}</span>}
      </span>
    )
  }
  return (
    <Popover
      open={open}
      onOpenChange={onOpen}
      side="bottom"
      align="start"
      title="The customer"
      trigger={
        name === '' ? (
          <Button intent="quiet" size="sm" icon={UserCheckIcon}>
            Name the customer
          </Button>
        ) : (
          <button
            type="button"
            className="cfg-who cfg-who--press"
            aria-label={`${name}, change the customer`}
          >
            <span className="cfg-who__name">{name}</span>
            {contact === '' ? null : <span className="cfg-who__contact">{contact}</span>}
            <span className="cfg-who__edit" aria-hidden="true">
              <Icon glyph={PencilSimpleIcon} />
            </span>
          </button>
        )
      }
    >
      <CustomerForm
        quote={quote}
        quoteId={quoteId}
        onDone={() => onOpen(false)}
        setStep={setStep}
        setRefused={setRefused}
      />
    </Popover>
  )
}

function CustomerForm({
  quote,
  quoteId,
  onDone,
  setStep,
  setRefused,
}: {
  quote: QuoteDef
  quoteId: string
  onDone: () => void
  setStep: (step: Step) => void
  setRefused: (said: string | null) => void
}) {
  const [name, setName] = useState(quote.customer.name)
  const [contact, setContact] = useState(quote.customer.contact?.[0] ?? '')
  const named = quote.customer.name.trim() !== ''

  /* only a difference is written, read off the document as it stands at that moment: the panel
     closing after the act must find nothing left to write */
  const commit = (): void => {
    const standing = quotesStore.getState().quotes.find((q) => q.id === quoteId)
    if (!standing || standing.state !== 'draft') return
    const differs =
      name.trim() !== standing.customer.name.trim() ||
      contact.trim() !== (standing.customer.contact?.[0] ?? '').trim()
    if (!differs) return
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
  }
  const onClose = useEffectEvent(commit)
  useEffect(() => () => onClose(), [])
  const put = (): void => {
    commit()
    onDone()
  }
  const onEnter = (event: ReactKeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return
    event.preventDefault()
    put()
  }

  return (
    <div className="cfg-whoform">
      <Field label="Who the quote is for">
        <Input
          id="cfg-customer"
          value={name}
          onValueChange={setName}
          onKeyDown={onEnter}
          autoComplete="name"
          placeholder="Their name, as it should print"
        />
      </Field>
      <Field label="One line of contact, as it should print">
        <Input
          id="cfg-contact"
          value={contact}
          onValueChange={setContact}
          onKeyDown={onEnter}
          placeholder="A phone number, an email, an address"
        />
      </Field>
      <p className="cfg-whoform__say">Both print on the quote exactly as typed.</p>
      <Button intent="act" icon={UserCheckIcon} onClick={put}>
        {named ? 'Save the customer' : 'Put their name on it'}
      </Button>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* The tally: what the quote comes to, at the bottom left       */
/* ---------------------------------------------------------- */

/**
 * THE TOTAL, AT THE BOTTOM LEFT, AND WHAT IT IS MADE OF (the owner, 2026-10-30: "Total should
 * move from top right to bottom left area and be way nicer and more visual").
 *
 * The figure large, the price it is at beside it (and the way to see another, which moves
 * nothing until it is accepted on the cascade — walk item 7 and the chandlery's must-change 4:
 * the level stood at the very foot of the boat's column), and under it a bar, one length per
 * part of the build that carries a price, in the part's own ink, with a key naming each part and
 * its figure (`tallyOf`, src/domain/quote/tally.ts). What nothing is on yet is said once, as not
 * chosen, and never drawn as a length.
 *
 * ALWAYS IN SIGHT WHILE BUILDING, NEVER OVER THE WORK: at a desk it stands at the foot of the
 * boat's own column, beside the chapters and over none of them; below a desk it is a card at the
 * bottom left of the window, over the shell's tab bar and never on it. It carries the step and
 * its way back where the toast is not drawn (below 1440), so the step is said beside the total
 * it changed. IT NEVER COUNTS: `PriceFigure` sets a figure and stays.
 *
 * WHILE THE FINALE IS OPEN ITS CARD SAYS THE TOTAL, at the level it is given at, and the tally
 * steps aside (docs/WORDS.md, one fact once).
 */
function Tally({
  desk,
  quote,
  rail,
  open,
  art,
  note,
  said,
  elsewhere,
  raise,
  refusal,
  onLarge,
  over = false,
  aside = false,
}: {
  /** a desk, where the tally stands open in the boat's column and never folds */
  desk: boolean
  quote: QuoteDef
  rail: Rail | null
  open: boolean
  art: StageArt | null
  /** a sheet stands over the page, and a part carried in it is dropped on the sheet's own total */
  over?: boolean
  /** what is not in the total, once (`totalNoteSay`); '' for nothing */
  note: string
  /** the last step and its way back, or the refusal of the last press, below 1440 */
  said: ReactNode
  /** the finale is open and its card says the total */
  elsewhere: boolean
  /** BELOW A DESK THE SUMMARY HAS SCROLLED INTO THE WINDOW, and its card says the total: the
   *  tally steps out of sight in place, so nothing under it moves (the paper-quote critique,
   *  2026-10-31: at 390 the total stood four times in one screen) */
  aside?: boolean
  raise: (fix: string) => void
  refusal: string | undefined
  onLarge: (set: readonly LightboxPicture[], at: number, title: string) => void
}) {
  const made = tallyOf(tallyParts(rail?.chapters ?? []))
  const notYet = openSay(made.open)
  const photo = art?.kind === 'photograph' ? art.held : null
  const boat = boatOfQuote(quote)
  const heard = made.shares.map((s) => `${s.name} ${money(s.amount)}`).join(', ')
  /* THE TOTAL IS WHERE A PART IS DROPPED (the chandlery's tray, made the total itself): while a
     part is carried it says so at its head, and it lights while the part is over it */
  const { place, carrying: lifted, over: overIt } = useQuoteDrop()
  const carrying = lifted && !over
  /* BELOW A DESK IT FLOATS FOLDED TO ONE LINE, the figure and a caret (the critic, P-1b: open, it
     stood 600 × 158 over the model prices at 834 and took 27% of every frame at 390). The caret
     opens what it is made of over the page and folds it again; at a desk it is always open, in
     the boat's column, and the caret is not drawn (configurator.css). */
  const [unfolded, setUnfolded] = useState(false)
  return (
    <aside
      ref={place}
      data-carrying={carrying ? '' : undefined}
      data-over={carrying && overIt ? '' : undefined}
      data-unfolded={unfolded ? '' : undefined}
      className="cfg-tally"
      aria-label="What the quote comes to"
      data-testid="running-total"
      data-elsewhere={elsewhere ? '' : undefined}
      data-aside={aside ? '' : undefined}
    >
      {carrying ? (
        <output className="cfg-tally__drop">Drop it here to put it on the quote</output>
      ) : null}
      {/* WHILE THE FINALE IS OPEN ONLY THE STEP STAYS HERE, where there is one: the finale's card
          says the total, at the level it is given at, and what it is made of is on the paper */}
      {elsewhere ? null : (
        <>
          {/* THE BOAT, BESIDE ITS PRICE, WHERE THE STAGE HAS SCROLLED AWAY (below a desk): its own
          photograph, small, and a press that opens it large */}
          {photo ? (
            <button
              type="button"
              className="cfg-tally__boat"
              aria-label="The boat, larger"
              onClick={() => onLarge([largeOf(photo, boat.name, boat.say)], 0, 'The boat')}
            >
              <img
                className="cfg-tally__img"
                src={photo.src}
                alt=""
                width={photo.width}
                height={photo.height}
                loading="lazy"
                decoding="async"
                {...(photo.widths.length > 1 ? { srcSet: srcSetOf(photo), sizes: '96px' } : {})}
              />
            </button>
          ) : null}

          <div className="cfg-tally__sum">
            <p className="cfg-tally__lab">Total</p>
            {rail === null || !open ? (
              <p className="cfg-tally__fig cfg-tally__fig--none">—</p>
            ) : (
              <p className="cfg-tally__fig">
                {/* folded below a desk, the figure is the line's own size */}
                <PriceFigure amount={rail.total} size={desk || unfolded ? 'display' : 'lg'} />
              </p>
            )}
          </div>

          <button
            type="button"
            className="cfg-tally__fold"
            aria-expanded={unfolded}
            aria-label={unfolded ? 'Fold the total' : 'What the total is made of'}
            onClick={() => setUnfolded((was) => !was)}
          >
            <Icon glyph={CaretDownIcon} />
          </button>

          {open ? (
            <div className="cfg-tally__level">
              <Rungs quote={quote} rail={rail} raise={raise} refusal={refusal} />
            </div>
          ) : null}

          {made.shares.length > 0 ? (
            <div className="cfg-tally__made">
              {/* the bar is a picture of the key under it, which says each part and its figure */}
              <span className="cfg-tally__heard">{`Made of: ${heard}`}</span>
              <p className="cfg-tally__bar" aria-hidden="true">
                {made.shares.map((share) => (
                  <span
                    key={share.id}
                    className="cfg-tally__len"
                    data-ink={kindInk(share.kind)}
                    style={{ '--share': share.share } as CSSProperties}
                  />
                ))}
              </p>
              <ul className="cfg-tally__key">
                {made.shares.map((share) => (
                  <li key={share.id} className="cfg-tally__part" data-ink={kindInk(share.kind)}>
                    <span className="cfg-tally__dot" aria-hidden="true" />
                    <span className="cfg-tally__name">{share.name}</span>
                    <span className="cfg-tally__amt">{money(share.amount)}</span>
                  </li>
                ))}
                {made.unpriced.map((name) => (
                  <li key={name} className="cfg-tally__part" data-unpriced="">
                    <span className="cfg-tally__dot" aria-hidden="true" />
                    <span className="cfg-tally__name">{name}</span>
                    <span className="cfg-tally__amt">no price yet</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {notYet === '' && note === '' ? null : (
            <p className="cfg-tally__note">
              {notYet === '' ? null : <span className="cfg-tally__open">{`${notYet}.`}</span>}
              {notYet !== '' && note !== '' ? ' ' : null}
              {note === '' ? null : <span data-testid="total-note">{note}</span>}
            </p>
          )}
        </>
      )}

      {said ? <div className="cfg-tally__step">{said}</div> : null}
    </aside>
  )
}

/** One held picture, as the lightbox draws it large. */
function largeOf(held: Held, caption: string, alt: string, note = ''): LightboxPicture {
  const srcSet = srcSetOf(held)
  return {
    src: held.src,
    width: held.width,
    height: held.height,
    ...(srcSet ? { srcSet } : {}),
    alt: held.subject === '' ? alt : held.subject,
    caption,
    credit: creditOf(held),
    ...(note === '' ? {} : { note }),
  }
}

/** One option's picture, as the lightbox draws it large. */
function largeOfRow(picture: NonNullable<OptionRow['picture']>, caption: string): LightboxPicture {
  return {
    src: picture.src,
    width: picture.width,
    height: picture.height,
    ...(picture.srcSet ? { srcSet: picture.srcSet } : {}),
    alt: caption,
    caption,
    credit: picture.credit,
  }
}

/** What a chapter is a chapter of, for its ink and its glyph: the hull is the boat, and a motor
 *  sold on its own is a motor (`Chapter.goods`). */
function chapterKindOf(chapter: Chapter): TableKind | null {
  if (chapter.kind !== 'band') return null
  return chapter.goods
}

/* ---------------------------------------------------------- */
/* The stage: the hull, and only the hull                       */
/* ---------------------------------------------------------- */

/**
 * THE BOAT, AS LARGE AS ITS COLUMN ALLOWS (the owner, 2026-10-30: "We dont need that little text
 * under the photo on the left so we can make the most of the space and make image bigger …
 * remove the photograph from media.high whatever because not needed"). Nothing is drawn under the
 * photograph any more: what it shows, what this quote carries that it may not (the motor), and
 * where it came from are the lightbox's caption, one press away on its corner, so nothing is lost,
 * only moved. The room they took is the picture's.
 *
 * Inside the page's measure, round on every corner, and NEVER PAST ITS OWN PIXELS: the ledger's
 * width and height are the ceiling on the box (`maxInlineSize`, `maxBlockSize`), so `cover` can
 * only scale down. The size it is painted at rides on the figure as `data-drawn`, beside
 * `data-held`, so "never enlarged" stays checkable at every width.
 */
function Stage({
  quote,
  ctx,
  art,
  rail,
  onLarge,
}: {
  quote: QuoteDef
  ctx: CatalogueCtx
  rail: Rail | null
  /** the boat's picture, read by the build (`stage.ts`) */
  art: StageArt
  onLarge: (set: readonly LightboxPicture[], at: number, title: string) => void
}) {
  const register = ctx.entities[quote.rootTableId]?.name ?? ''
  const boat = boatOfQuote(quote)
  const { noun } = quoteSells(ctx, quote)
  /* WHAT THE PICTURE SHOWS AND WHAT THIS QUOTE CARRIES, because the customer at the desk reads
     the picture (#24) — said in the lightbox now, under the picture drawn large. `say.ts` argues
     it. */
  const said = pictureSays(art, quote, rail, ctx)
  const [drawn, setDrawn] = useState<{ w: number; h: number } | null>(null)
  const photo = useRef<HTMLImageElement>(null)
  const held = art.kind === 'photograph' ? art.held : null
  /* THE PHOTOGRAPH THE BUILD OPENED ON, so a new one (another model chosen in the hull chapter)
     comes up over it on the reveal and the first, carried from the picker, does not */
  const [first, setFirst] = useState(held?.src ?? '')
  /* the first photograph is the one the ledger hands over once it is read, not the absence before */
  if (first === '' && held) setFirst(held.src)

  /* THE PAINTED SIZE, NOT THE BOX: `object-fit: cover` scales the whole picture until it covers
     the box, so the scale is the larger of the two ratios */
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

  const note = said ? [said.shows, said.ours].filter((s) => s !== '').join(' ') : ''
  /* THE FINISH ON THE QUOTE, DRAWN WHERE THE LEDGER HOLDS IT: this exact model in this colourway
     (`copyOf`, never another colourway's), on the photograph's corner (`FinishInset`) */
  const finish = useMemo(
    () => (boatOfQuote(quote).colour ? copyOf(itemOfQuote(quote)) : null),
    [quote],
  )

  return (
    <section className="cfg-stage" aria-label={`The ${noun} this quote is about`}>
      <div className="cfg-stage__pic">
        <figure
          className="cfg-shot"
          data-art={art.kind}
          data-verdict={art.kind === 'photograph' ? art.held.verdict : undefined}
          data-held={art.kind === 'photograph' ? `${art.held.width}x${art.held.height}` : undefined}
          data-drawn={drawn ? `${drawn.w}x${drawn.h}` : undefined}
          /* NEVER ENLARGED, STRUCTURALLY: the ledger's own pixels are the ceiling on the box, so
             `cover` can only scale down */
          style={
            art.kind === 'photograph'
              ? { maxInlineSize: art.held.width, maxBlockSize: art.held.height }
              : undefined
          }
        >
          {art.kind === 'photograph' ? (
            <img
              key={art.held.src}
              className="cfg-shot__img"
              data-swapped={first === '' || art.held.src === first ? undefined : ''}
              ref={photo}
              src={art.held.src}
              alt={art.held.subject === '' ? boat.say : art.held.subject}
              width={art.held.width}
              height={art.held.height}
              {...(art.held.widths.length > 1
                ? {
                    srcSet: srcSetOf(art.held),
                    sizes:
                      '(max-width: 1199px) and (max-height: 700px) 288px, (max-width: 1199px) 100vw, 48vw',
                  }
                : {})}
              decoding="async"
              fetchPriority="high"
              /* THE PHOTOGRAPH THE PICKER'S ACT CARRIED HERE: the plate's picture of this row
                 travels under the same name (src/screens/picker/travel.ts) */
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
          {art.kind === 'photograph' ? (
            <span className="cfg-shot__expand">
              <ExpandPicture
                label={`See the ${noun} larger`}
                onExpand={() =>
                  onLarge([largeOf(art.held, boat.name, boat.say, note)], 0, `The ${noun}`)
                }
              />
            </span>
          ) : null}
          {boat.colour && art.kind === 'photograph' ? (
            <FinishInset
              key={boat.colour.code}
              colour={boat.colour}
              render={finish && finish.src !== art.held.src ? finish : null}
            />
          ) : null}
        </figure>
      </div>

      {/* THE BOAT'S OWN FACTS, under its picture */}
      <div className="cfg-stage__say">
        <h2 className="cfg-stage__name">{boat.name}</h2>
        {quote.subjectSpecs.length > 0 ? (
          <Specs quote={quote} ctx={ctx} />
        ) : (
          <p className="cfg-note">{`The price list gives no specifications for this ${noun}.`}</p>
        )}
        {/* WHERE NO PHOTOGRAPH IS HELD, WHY — the one sentence a reader needs about the mark in
            its place; a photograph's provenance is its lightbox's */}
        {art.kind === 'photograph' ? null : <p className="cfg-prov">{art.because}</p>}
      </div>
    </section>
  )
}

/**
 * THE FINISH ON THE QUOTE, ON THE PHOTOGRAPH'S CORNER (the owner, 2026-10-30: "so they can see
 * differences in real time"; the critic, P-6: a colour pressed in the hull chapter changed the
 * bar's swatches and nothing on the stage). The ledger holds one photograph per model, in the
 * maker's own finish, so the photograph cannot answer a colour. What can: the maker's own drawing
 * of this exact model in this colourway, where the ledger holds it, drawn in a white card on the
 * photograph's foot with the colourway's swatches — and where it holds none, the swatches and the
 * one sentence the photograph owes: that it shows the maker's finish. Keyed by the colourway, so
 * each press brings the new one up on the reveal; the colour's words are the bar's, over it.
 */
function FinishInset({
  colour,
  render,
}: {
  colour: NonNullable<ReturnType<typeof boatOfQuote>['colour']>
  render: Held | null
}) {
  return (
    <span className="cfg-finish" data-testid="finish-inset">
      {render ? (
        <img
          className="cfg-finish__img"
          src={render.src}
          alt={`The drawing of this boat in ${colour.read ? colour.say : colour.code}`}
          width={render.width}
          height={render.height}
          decoding="async"
          {...(render.widths.length > 1 ? { srcSet: srcSetOf(render), sizes: '160px' } : {})}
        />
      ) : null}
      <span className="cfg-finish__words">
        <span className="cfg-finish__lab">Your finish</span>
        <Swatches colour={colour} />
        {render ? null : (
          <span className="cfg-finish__say">Photographed in the maker’s finish</span>
        )}
      </span>
    </span>
  )
}

/** How many of the boat's measures stand at rest, before "All the specifications". */
const SPECS_LEAD = 4

/**
 * THE BOAT'S SPECIFICATION (the owner, 2026-10-30: "for specs, ability to open more of them and
 * design that a bit nicer"). The few the paper prints lead — the file's own first measures, as
 * the quote froze them — each a small tile: the glyph of what it measures, the figure large and
 * bold, its label under it. A press under them opens EVERY measure the price file holds for this
 * boat (`allSpecsOf`, read live, never a price and never a cost), growing out of the strip on
 * the travel spring with its caret turning over; under reduced motion it is simply there. A UNIT
 * ON EVERY MEASURE the file or its maker states one for (`measured`): "6.98 m", never a bare 6.98.
 */
/** A THING SOLD ON ITS OWN WITHOUT ITS RECORD (`goodsSpecs`): a sand anchor's strip led with
 *  "No · Discontinued" and "NSM · Supplier", and a Minn Kota package's with its labour and its
 *  gross profit (2026-10-31). A boat's register is its maker's specification and is read whole. */
function ownSpecs<T extends { label: string }>(
  ctx: CatalogueCtx,
  quote: QuoteDef,
  specs: readonly T[],
): T[] {
  return quoteSells(ctx, quote).boat
    ? [...specs]
    : goodsSpecs(ctx.entities[quote.rootTableId], specs)
}

function Specs({ quote, ctx }: { quote: QuoteDef; ctx: CatalogueCtx }) {
  const [open, setOpen] = useState(false)
  const boat = boatOfQuote(quote)
  const { noun } = quoteSells(ctx, quote)
  /* SAID AS A PERSON SAYS THEM (`specsSaid`, src/domain/quote/specSay.ts): "Power 90–115 hp" for
     the file's "Min 90 HP" and "Max 115 HP", "Shaft length", "105 L", and the file's own "Matrix"
     and "Model Code" left out, since neither is the boat */
  const all = useMemo(
    () =>
      specsSaid(
        ownSpecs(ctx, quote, allSpecsOf(ctx, quote)).map((spec) =>
          measured(quote.rootTableId, spec),
        ),
      ),
    [ctx, quote],
  )
  const frozen = specsSaid(
    ownSpecs(ctx, quote, quote.subjectSpecs).map((spec) => measured(quote.rootTableId, spec)),
  )
  /* A MOTOR OR A TRAILER SOLD ON ITS OWN IS SAID IN THE PAPER'S WORDS: the facts frozen on its own
     line (`lineFactsOf`), which the printed quote's cover and specification print — "Power 150
     hp", "Shaft 20 in", "Engine L4 / 2670cc". The strip read the file's columns instead, "150 HP
     RATING", '20" SHAFT LENGTH' and "CYLINDERS / DISPLACEMENT" over two lines, so the build and
     the paper named one motor's facts two ways (the paper-quote critique, 2026-10-31). */
  const own = quoteSells(ctx, quote).boat
    ? []
    : (quote.lines.find(
        (l) => l.id === quote.sections.find((s) => s.blockId === SUBJECT_BLOCK)?.lineIds[0],
      )?.facts ?? [])
  const every =
    own.length > 0
      ? own
      : [...frozen, ...all.filter((s) => !frozen.some((f) => f.label === s.label))]
  const lead = every.slice(0, SPECS_LEAD)
  /* A PART WHOSE FILE HOLDS NOTHING BUT ITS RECORD HAS NO SPECIFICATION, and says so in a
     sentence where the strip would stand empty */
  if (every.length === 0)
    return <p className="cfg-note">{`The price list gives no specifications for this ${noun}.`}</p>
  /* EVERY MEASURE OPENS OVER THE PAGE (the critic, P-2: opened in the boat's column, fourteen rows
     took the photograph down to a 160px strip of hull). The photograph keeps its height; the
     whole specification is a sheet of its own, the figures large, closed by Escape back onto the
     press that opened it. */
  return (
    <div className="cfg-specs">
      <dl className="cfg-specs__lead">
        {lead.map((spec) => (
          <SpecTile key={spec.label} label={spec.label} value={spec.value} />
        ))}
      </dl>
      {every.length <= lead.length ? null : (
        <Dialog
          open={open}
          onOpenChange={setOpen}
          size="lg"
          title={`${boat.name}, every specification`}
          description={`Every measure the price list gives for this ${noun}.`}
          trigger={
            <button type="button" className="cfg-specs__more" aria-haspopup="dialog">
              <span>{`All ${every.length.toLocaleString('en-AU')} specifications`}</span>
              <span className="cfg-specs__chev" aria-hidden="true">
                <Icon glyph={ArrowsOutSimpleIcon} />
              </span>
            </button>
          }
        >
          <dl className="cfg-specsheet" data-testid="specifications">
            {every.map((spec) => (
              <SpecTile key={spec.label} label={spec.label} value={spec.value} />
            ))}
          </dl>
        </Dialog>
      )}
    </div>
  )
}

function SpecTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="cfg-spec">
      <dt className="cfg-spec__lab">{label}</dt>
      <dd className="cfg-spec__val">{value}</dd>
    </div>
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
  /* IN THE TALLY, BESIDE THE TOTAL (walk item 7): the price the quote is at, and the press that
     shows another. "Nothing on this quote changes until you choose" is the cascade's own head,
     where the other price is shown line by line; beside the total it was a third line of small
     type under two buttons. */
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
  onPress,
  onLarge,
  ctx,
  onShowAll,
  refusal,
  quoteId,
  setStep,
  setRefused,
  go,
}: {
  /** opens a picture large, among its chapter's (`Lightbox`) */
  onLarge: (set: readonly LightboxPicture[], at: number, title: string) => void
  /** the sheet */
  ctx: CatalogueCtx
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
  onPress: (act: Act) => void
  onShowAll: (id: string) => void
  refusal: string | undefined
  quoteId: string
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
  /* the head's answer: what is on the quote, then what is still open. OPEN, THE CHAPTER OF WHAT THE
     QUOTE IS FOR DRAWS ITS CHOICES, and the lit one names it under the bar that names it too: the
     head saying it as well made "Yamaha F150LC" four times in one window (the paper-quote
     critique, 2026-10-31). Shut, the head is the outline and says it. */
  const said =
    showing && !searching && chapter.subject === true && (chapter.boat?.axes.length ?? 0) > 0
      ? ''
      : (chapter.said ?? '')
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

  /* THE LISTS WITH NOTHING ON THEM FOR THIS QUOTE, where a chapter has two or more of them: said
     once together (`BareLists`), each still one press from its whole range */
  const bareOf = (t: ChapterTable): boolean =>
    !searching &&
    chapter.tables.length > 1 &&
    t.rows.length === 0 &&
    t.also.length === 0 &&
    t.tableId !== RIG_KITS &&
    !t.ruled.some((r) => r.refuses) &&
    t.severalSay === ''
  const bareTables = chapter.tables.filter(bareOf)
  const empties = bareTables.length >= 2 ? bareTables : []
  const full = chapter.tables.filter((t) => !empties.includes(t))

  /* WHAT THE OPEN CHAPTER HOLDS, drawn once and either animated or not */
  const inside = (
    <div className="cfg-body__in">
      {refusal !== undefined && chapter.kind === 'band' ? (
        <Said className="cfg-shut" id={shutId} glyph={LockSimpleIcon}>
          {refusal}
        </Said>
      ) : null}

      {/* A CHAPTER NOTHING ON THE QUOTE WAITS FOR SAYS SO FIRST (a boat, on a motor's own quote) */}
      {chapter.optional === undefined ? null : (
        <Said className="cfg-why" glyph={InfoIcon}>
          {chapter.optional}
        </Said>
      )}

      {chapter.subject ? (
        <HullPrice
          quote={quote}
          quoteId={quoteId}
          noun={rail.sells.noun}
          refusedBy={refusedBy}
          setStep={setStep}
          setRefused={setRefused}
        />
      ) : null}

      {/* THE BOAT IS CHOSEN HERE, axis by axis (`BoatChooser`); a search reads its finishes as
          a list, narrowed to what the words match. A MOTOR, A TRAILER OR A PART SOLD ON ITS OWN
          IS CHOSEN HERE TOO, among the ones beside it on the price list (`goodsChoices`). */}
      {chapter.boat && chapter.boat.axes.length > 0 && !searching ? (
        <BoatChooser
          boat={chapter.boat}
          kind={chapter.goods}
          noun={rail.sells.noun}
          carried={rail.chapters
            .filter((c) => c.kind === 'band' && !c.subject)
            .flatMap((c) =>
              c.tables.flatMap((t) => t.also.map((row) => ({ name: row.tail, section: c.name }))),
            )}
          onPress={onPress}
          refusedBy={refusedBy}
        />
      ) : chapter.finishes ? (
        <FinishBlock
          finishes={chapter.finishes}
          query={searching ? query : ''}
          onLarge={onLarge}
          onPress={onPress}
          refusedBy={refusedBy}
        />
      ) : chapter.boat && chapter.boat.why !== '' && !searching ? (
        <Said className="cfg-why" glyph={InfoIcon}>
          {chapter.boat.why}
        </Said>
      ) : null}

      {shopped ? <ShopSwitch open={shop} onToggle={() => setShop((was) => !was)} /> : null}

      {/* THE PARTS TABLE IS A LIST LIKE ANY OTHER IN ITS CHAPTER: what the price list makes for
          this boat, and the chandlery's aisles over the page from its "Browse" press */}
      {/* A LIST WITH SOMETHING FOR THIS BOAT BEFORE ONE WITH NOTHING (the critic, P-5) */}
      {full
        .toSorted(
          (a, b) =>
            Number(!searching && a.rows.length + a.also.length === 0) -
            Number(!searching && b.rows.length + b.also.length === 0),
        )
        .map((table) => (
          <TableBlock
            key={table.id}
            table={table}
            orphans={rail.orphans.filter((fix) => fix.blockId === table.id)}
            told={rail.unpricedLists}
            quoteId={quoteId}
            named={chapter.tables.length > 1}
            query={searching ? query : ''}
            level={level}
            onPress={onPress}
            onLarge={(set, picture) => onLarge(set, picture, chapter.name)}
            onShowAll={onShowAll}
            motors={quote.lines
              .filter((line) => ctx.entities[line.entityId]?.kind === 'motor')
              .map((line) => line.code ?? '')
              .filter((code) => code !== '')}
            refusedBy={refusedBy}
            shop={shop}
            go={go}
            noun={rail.sells.noun}
          />
        ))}
      {/* SEVERAL LISTS WITH NOTHING FOR WHAT THIS QUOTE IS FOR ARE ONE SENTENCE AT THE FOOT, with
          the way into each (a motor's own quote drew five makers' headings, five "Nothing from …"
          and five buttons, 600px of nothing, 2026-10-31) */}
      {empties.length === 0 ? null : (
        <BareLists tables={empties} sells={rail.sells} onShowAll={onShowAll} />
      )}
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
        <button
          type="button"
          className="cfg-head__press"
          aria-expanded={showing}
          onClick={(event) => {
            if (!showing) holdStill(event.currentTarget)
            onOpen()
          }}
        >
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
                    {slashed(said)}
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
              /* and a chapter the price list offers nothing for says so in its answer, and no
                 more: "Nothing on it yet" beside "nothing goes with this motor" read as a gap
                 that could be filled */
              chapter.lines === 0 && chapter.bare === undefined ? (
                <span className="cfg-head__nosum">
                  {/* a chapter nothing waits for is a choice, not a gap */}
                  {chapter.optional === undefined ? NOTHING_ON_IT : 'Optional'}
                </span>
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
  noun = 'boat',
  refusedBy,
  setStep,
  setRefused,
}: {
  quote: QuoteDef
  quoteId: string
  /** what the quote is for, as a person says it: a part's price is not "the boat's" */
  noun?: string
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
        <h3 className="cfg-table__name">{`The ${noun}’s price`}</h3>
        <p className="cfg-table__why">
          {typed === null
            ? /* the missing price is said once, under the total (docs/WORDS.md); here, the act */
              `It goes on this quote only, and prints on the customer’s quote as the ${noun}’s price.`
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
          noun={noun}
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
  noun,
  typed,
  quoteId,
  setStep,
  setRefused,
}: {
  lineId: string
  boat: string
  noun: string
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
      .apply(
        quoteId,
        setOverride(
          lineId,
          read.price,
          noun === 'boat' ? HULL_PRICE_REASON : `The price list has no price for this ${noun}.`,
        ),
      )
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
        <Field label={`The ${noun}’s price, tax included`}>
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
          {typed === null ? `Put this price on the ${noun}` : 'Change the price'}
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

/**
 * THE BOAT IS CHOSEN HERE (the owner, 2026-10-30: "I want for highfield the picking model color
 * and all of that nonsense to be done in hull section and same for all boats please so they can
 * see differences in real time and same with material and that is applicable same theme to all
 * other things like stabi with variants or whatever").
 *
 * One row of choices per axis the file distinguishes this boat's series by — Model, Version,
 * Material, Colour (`boatChoices`, src/domain/quote/choices.ts, counted off the file) — each
 * choice a press, never a dropdown, with what it does to the whole quote beside it. A press
 * re-roots the quote on that row through the engine's own `refinish`, with its Undo, and the
 * photograph, the bar's name and finish, the specifications and the total answer at once: the
 * customer at the desk sees the difference as it is made. It used to send a finish that moved
 * the total to the cascade's sheet first; at the desk the owner wants it seen, and the step's
 * Undo is the way back (docs/DECISIONS.md, 2026-10-30).
 *
 * WHAT CANNOT CARRY ACROSS IS SAID HERE, ONCE. Every line on the quote stays when the boat
 * changes. A motor, trailer or fit the price list does not offer with the boat it now is stays
 * on with its own reason in its chapter, and its name is said under the choices, so a dealer who
 * moved from a Sport 560 to a 520 is told which of the 560's pairings the 520 does not have.
 */
function BoatChooser({
  boat,
  kind = 'boat',
  noun = 'boat',
  carried,
  onPress,
  refusedBy,
}: {
  boat: DrawnChoices
  /** what the choices are, for the glyph a card with no picture held draws */
  kind?: TableKind
  /** what the quote is for, as a person says it */
  noun?: string
  /** the lines on the quote the price list does not offer with this boat, and the section each
   *  stands in, by its own name ("Motor") */
  carried: readonly { name: string; section: string }[]
  onPress: (act: Act) => void
  refusedBy: string | undefined
}) {
  const headId = useId()
  return (
    <div className="cfg-boat" data-testid="boat-choices">
      {boat.axes.map((axis) => {
        const now = axis.options.find((o) => o.current)
        return (
          <fieldset
            key={axis.id}
            className="cfg-axis"
            data-axis={axis.id}
            aria-labelledby={`${headId}-${axis.id}`}
          >
            <h3 className="cfg-axis__head" id={`${headId}-${axis.id}`}>
              <span className="cfg-axis__name">{axis.title}</span>
              {/* A BOAT'S AXES EACH SAY WHAT IS ON IT, so four rows of choices read as one finish;
                  a motor's one row has its lit card for that, beside the bar's name (the
                  paper-quote critique, 2026-10-31: "F150LC" four times in the first screen) */}
              {now && kind === 'boat' ? (
                <span className="cfg-axis__now">{slashed(now.say)}</span>
              ) : null}
              <span className="cfg-axis__count">
                {axis.count ?? `${axis.options.length.toLocaleString('en-AU')} on the price list`}
              </span>
            </h3>
            <ul className="cfg-axis__list" data-shape={axis.id === 'material' ? 'chips' : 'cards'}>
              {axis.options.map((option) => (
                <li key={option.key}>
                  <BoatPick
                    option={option}
                    axis={axis.id}
                    kind={kind}
                    onPress={onPress}
                    refusedBy={refusedBy}
                  />
                </li>
              ))}
            </ul>
          </fieldset>
        )
      })}
      {carried.length === 0 ? null : (
        <Said className="cfg-why" glyph={InfoIcon}>
          {carriedSay(carried, noun)}
        </Said>
      )}
    </div>
  )
}

/** "The Yamaha F90XB stays on this quote, though the price list does not offer it with this boat.
 *  Motor says why, with the way off." — each section named as the build names it. */
function carriedSay(carried: readonly { name: string; section: string }[], noun = 'boat'): string {
  const one = carried.length === 1
  const sections = [...new Set(carried.map((c) => c.section))]
  const where =
    sections.length === 1
      ? sections[0]!
      : `${sections.slice(0, -1).join(', ')} and ${sections.at(-1)!}`
  return `${upper(namesSay(carried.map((c) => c.name)))} ${one ? 'stays' : 'stay'} on this quote, though the price list does not offer ${one ? 'it' : 'them'} with this ${noun}. ${where} ${sections.length === 1 ? 'says' : 'say'} why, with the way off.`
}

/** One choice on one axis of the boat: its picture or its colours, its name, and what it does. */
function BoatPick({
  option,
  axis,
  kind = 'boat',
  onPress,
  refusedBy,
}: {
  option: DrawnOption
  axis: DrawnAxis['id']
  kind?: TableKind
  onPress: (act: Act) => void
  refusedBy: string | undefined
}) {
  const figure = option.current ? (
    option.amount === null ? null : (
      <PriceFigure amount={option.amount} />
    )
  ) : option.amount === null ? (
    /* A CHOICE THE PRICE LIST GIVES NO PRICE IS NOT A SAVING: a Reef Anchor Kit read "−$138"
       beside a $138 sand anchor, the whole of its price taken off a total it would not be in */
    'no price'
  ) : option.delta === 0 ? (
    'no change'
  ) : (
    <PriceFigure amount={option.delta} signed />
  )
  const also = option.also.join(' · ')
  const label = `${option.say}${also === '' ? '' : `, in ${also}`}${option.facts === '' ? '' : `, ${option.facts}`}, ${
    option.current
      ? 'on the quote'
      : option.amount === null
        ? 'no price on the price list'
        : option.delta === 0
          ? 'no change to the total'
          : signedMoney(option.delta)
  }`
  const press = (): void => {
    if (!option.current) onPress({ do: 'refinish', rowId: option.rowId, label: option.label })
  }
  if (axis === 'material') {
    return (
      <Tile
        shape="chip"
        selected={option.current}
        onSelect={press}
        refusedBy={refusedBy}
        label={label}
      >
        <span className="cfg-pick__chip">
          <span>{option.say}</span>
          <span
            className="cfg-pick__delta"
            data-way={option.current ? 'on' : way(option.amount === null ? null : option.delta)}
          >
            {option.current ? 'on the quote' : figure}
          </span>
        </span>
      </Tile>
    )
  }
  return (
    <span className="cfg-pick">
      {/* THE SCREEN'S OWN PRESS, AS THE KIT'S TILE IS ONE: a toggle a reader hears as pressed or
          not, never disabled — a refused one is dimmed, keeps the caret, swallows the press and
          points at the chapter's one sentence. Its own so the chosen card says so by its ring and
          its pill, with no disc to keep clear of in a card this small. */}
      <button
        type="button"
        className="cfg-pick__press"
        data-ground="plate"
        aria-pressed={option.current}
        aria-label={label}
        aria-disabled={refusedBy === undefined ? undefined : true}
        aria-describedby={refusedBy}
        onClick={refusedBy === undefined ? press : undefined}
      >
        <span className="cfg-pick__in" data-axis={axis}>
          {/* ONE WELL FOR EVERY CARD (the critic, P-8: photographs, line drawings and a glyph on a
              blue tile made the grid look unfinished): a photograph on the water fills it; a
              maker's drawing, or the boat's glyph where the ledger holds no picture, stands whole
              on the same white well */}
          <span
            className="cfg-pick__well"
            data-pictured={option.picture ? '' : undefined}
            data-scene={option.scene ? '' : undefined}
          >
            {option.picture ? (
              <img
                className="cfg-pick__img"
                src={option.picture.src}
                alt=""
                width={option.picture.width}
                height={option.picture.height}
                decoding="async"
                {...(option.picture.srcSet
                  ? { srcSet: option.picture.srcSet, sizes: '128px' }
                  : {})}
              />
            ) : option.colour ? (
              <Swatches colour={option.colour} />
            ) : (
              <KindMark kind={kind} />
            )}
          </span>
          <span className="cfg-pick__words">
            <span className="cfg-pick__name">
              {axis === 'colour' && option.colour && !option.colour.read ? (
                <span className="cfg-mono">{option.say}</span>
              ) : (
                slashed(option.say).replace(/ · /g, ' · ')
              )}
            </span>
            {axis === 'colour' && option.picture && option.colour ? (
              <Swatches colour={option.colour} size="sm" />
            ) : null}
            {also === '' ? null : <span className="cfg-pick__also">{`in ${also}`}</span>}
            {/* WHAT TELLS IT FROM THE NEXT ONE: a motor's power, weight and shaft, as its row
                states them and as the same motor says them offered on a boat's quote */}
            {option.facts === '' ? null : (
              <span className="cfg-pick__facts">
                {/* each fact kept whole, "172 kg" never broken from its unit, and a line breaks after a dot */}
                {option.facts
                  .split(' · ')
                  .map((fact) => fact.replaceAll(' ', '\u00a0'))
                  .join('\u00a0· ')}
              </span>
            )}
            {/* A CODE NO MAKER'S PAGE NAMES says why it is a code (names.json, `unnamed`) */}
            {option.coded ? <span className="cfg-pick__also">Unnamed by its maker</span> : null}
            {/* ON THE QUOTE IT SAYS SO, and its figure is the total's beside the boat: the others
                say what choosing them does to that total */}
            <span
              className="cfg-pick__delta"
              data-way={option.current ? 'on' : way(option.amount === null ? null : option.delta)}
            >
              {option.current ? 'on the quote' : figure}
            </span>
          </span>
        </span>
      </button>
    </span>
  )
}

function FinishBlock({
  finishes,
  query,
  onLarge,
  onPress,
  refusedBy,
}: {
  finishes: Finishes
  query: string
  /** opens a finish's picture large, among the others */
  onLarge: (set: readonly LightboxPicture[], at: number, title: string) => void
  onPress: (act: Act) => void
  /** the element holding the one reason every row here is refused
   *  for, where there is one. The sentence is drawn once, by the
   *  chapter, above every block in it. */
  refusedBy: string | undefined
}) {
  const rows =
    query === '' ? finishes.rows : finishes.rows.filter((f) => matchesFinish(f.label, query))

  const pictured = rows.filter((f) => f.picture !== null)
  const large = pictured.map((f) =>
    largeOfRow(f.picture!, `${f.colour.say}${f.materialSaid === '' ? '' : ` · ${f.materialSaid}`}`),
  )

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
      {/* COLOURS SHOWN AS COLOURS AND AS PICTURES (the original's users' first floor; the
          chandlery's graft from C2): where the ledger holds a finish's own render, each finish
          is a card with that render and its swatches, and the render opens large. Where none
          does, each is a line led by its swatches. */}
      {pictured.length > 0 ? (
        <ul className="cfg-tiles">
          {rows.map((finish) => (
            <li key={finish.rowId}>
              <FinishTile
                finish={finish}
                onPress={onPress}
                refusedBy={refusedBy}
                expand={
                  finish.picture
                    ? {
                        label: 'See this finish larger',
                        onExpand: () =>
                          onLarge(large, pictured.indexOf(finish), `${finishes.model} finishes`),
                      }
                    : undefined
                }
              />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="cfg-rows">
          {rows.map((finish) => (
            <li key={finish.rowId}>
              <FinishCard finish={finish} onPress={onPress} refusedBy={refusedBy} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** A finish as a picture card: its own render, its colours, and what it does to the total. */
function FinishTile({
  finish,
  onPress,
  refusedBy,
  expand,
}: {
  finish: Finish
  onPress: (act: Act) => void
  refusedBy: string | undefined
  expand: { label: string; onExpand: () => void } | undefined
}) {
  return (
    <OptionTile
      name={
        finish.colour.read ? (
          finish.colour.say
        ) : (
          <span className="cfg-mono">{finish.colour.code}</span>
        )
      }
      facts={finish.materialSaid === '' ? undefined : finish.materialSaid}
      detail={<Swatches colour={finish.colour} size="sm" />}
      picture={finish.picture}
      kind="boat"
      figure={
        finish.current ? (
          finish.amount === null ? undefined : (
            <PriceFigure amount={finish.amount} />
          )
        ) : finish.delta === 0 ? (
          'no change'
        ) : (
          <PriceFigure amount={finish.delta} signed />
        )
      }
      figureSay={finish.current ? 'on the quote' : undefined}
      selected={finish.current}
      onSelect={() => onPress({ do: 'refinish', rowId: finish.rowId, label: finish.label })}
      refusedBy={refusedBy}
      label={`${finish.colour.say}${finish.materialSaid === '' ? '' : `, ${finish.materialSaid}`}, ${finish.delta === 0 ? 'no change to the total' : signedMoney(finish.delta)}`}
      {...(expand ? { expand } : {})}
    />
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
  refusedBy,
}: {
  finish: Finish
  onPress: (act: Act) => void
  refusedBy: string | undefined
}) {
  return (
    <Tile
      tone="room"
      shape="row"
      selected={finish.current}
      onSelect={() => onPress({ do: 'refinish', rowId: finish.rowId, label: finish.label })}
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

/**
 * THE LISTS IN A CHAPTER WITH NOTHING ON THEM FOR THIS QUOTE, SAID ONCE (the build page round,
 * 2026-10-31): on a repower the boats that take the motor came under six makers, and five of them
 * drew their name, "Nothing from Formosa is made for this boat" and a button each. One sentence
 * names them all, and each keeps its one press into its whole range, by its name.
 */
function BareLists({
  tables,
  sells,
  onShowAll,
}: {
  tables: readonly ChapterTable[]
  sells: Rail['sells']
  onShowAll: (id: string) => void
}) {
  const wide = tables.filter((t) => t.counts.catalogue > 0)
  return (
    <div className="cfg-table cfg-bare" data-bare="">
      <p className="cfg-table__none">
        {bareListsSay(
          tables.map((t) => t.title),
          sells,
        )}
      </p>
      {wide.length === 0 ? null : (
        <ul className="cfg-bare__all" aria-label="Their whole ranges">
          {wide.map((table) => (
            <li key={table.id}>
              <Button
                intent="veiled"
                size="sm"
                icon={ArrowsOutSimpleIcon}
                aria-haspopup="dialog"
                aria-label={`Show all ${table.counts.catalogue.toLocaleString('en-AU')} in ${table.title}`}
                onClick={() => onShowAll(table.id)}
              >
                {`${table.title} · ${table.counts.catalogue.toLocaleString('en-AU')}`}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function TableBlock({
  table,
  orphans,
  told,
  named,
  query,
  level,
  onPress,
  onLarge,
  onShowAll,
  refusedBy,
  shop,
  go,
  quoteId,
  motors,
  entire = false,
  noun = 'boat',
}: {
  /** what the quote is for, as a person says it (`quoteSells`): "this boat", "this motor" */
  noun?: string
  /** the codes of the motors on this quote, which a rigging kit is offered for */
  motors: readonly string[]
  /** drawn in the range sheet, where the list is already its whole range */
  entire?: boolean
  /** opens one of this list's pictures large, among the others it draws */
  onLarge: (set: readonly LightboxPicture[], at: number) => void
  /** follow an address without a page load — a rule's sentence to the rule on /rules */
  go?: (href: string) => void
  /** the quote, so the door to Prices can lead back to it */
  quoteId: string
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
  const reason = reasonSay(table)
  /* A LIST THE PRICE LIST GIVES NO PRICE SAYS SO ONCE: as a tag beside its name while nothing
     from it is on the quote, and in the line under the total once something is, which names the
     list itself (`unpricedTag`, `totalNoteSay`) */
  const unpriced = unpricedTag(table, told)
  const capped = cappedSay(table, entire ? RANGE_CAP : undefined)
  const whole = entire ? allSay(table, noun) : ''

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
    /* from the least power to the most, as a person reads a range of outboards — a twin by the
       power it puts on the transom, so "2 x 115" stands after "200" and not before "2.5" */
    const transom = (rating: string): number => {
      const each = Number(/(\d+(?:\.\d+)?)\s*$/.exec(rating)?.[1] ?? Number.NaN)
      const many = Number(/^(\d+)\s*x/i.exec(rating)?.[1] ?? 1)
      return each * many
    }
    const sorted = [...held].toSorted(([a], [b]) => transom(a) - transom(b) || a.localeCompare(b))
    /* OVER A WHOLE RANGE THE CHIPS STEP ASIDE where they would be a wall (Yamaha's 209 rate at
       forty-odd powers): the sheet's find field narrows by power there */
    return entire && sorted.length > POWERS_AT_MOST ? [] : sorted
  }, [table, query, entire])
  const narrowed = powers.length > 1 && powers.some(([p]) => p === power) ? power : null
  /* A RIGGING KIT IS OFFERED ONLY FOR A MOTOR ON THIS QUOTE (`kitsForMotors`), while no search
     is reaching past the list */
  const kits = table.tableId === RIG_KITS && query === ''
  const shelved = kits ? kitsForMotors(table.rows, motors) : table.rows
  const kitsSay =
    !kits || shelved.length > 0 ? '' : motors.length === 0 ? KITS_WAIT : kitsNone(motors)
  const rows = narrowed === null ? shelved : shelved.filter((r) => r.fitted || r.power === narrowed)
  /* WHAT EVERY PRESS HERE DOES, ONCE (`insteadSay`): where two or more lines off the quote would
     each take the same motor off, the list says it over itself and each figure stands alone */
  const swaps = table.rows.filter((r) => !r.fitted && r.instead !== '')
  const instead =
    swaps.length > 1 && swaps.every((r) => r.instead === swaps[0]!.instead) ? swaps[0]!.instead : ''
  const replaces = insteadSay(instead)
  /* THE PICTURES THIS LIST DRAWS, in its order, so one opened large steps to the next */
  const pictured = [...rows, ...table.also].filter((row) => row.picture !== null)
  const large = pictured.map((row) =>
    largeOfRow(row.picture!, row.listed === '' ? row.tail : row.listed),
  )
  const expandOf = (row: OptionRow): { label: string; onExpand: () => void } | undefined => {
    const at = pictured.indexOf(row)
    return at < 0
      ? undefined
      : { label: 'See its picture larger', onExpand: () => onLarge(large, at) }
  }

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
  /* WHY NO LINE HERE HAS A FIGURE, ONCE, IN ITS OWN PLACE (the critic, P-3: the dealer-fit rows
     stood with no figure and nothing but "Choose its price" by the list's name): said under the
     name while the door beside it stands, and each row says what a press on it does */
  const unpricedWhy = unpriced !== '' && table.unchosen !== '' ? unpricedSay(table) : ''
  /* A LIST WITH NOTHING MADE FOR THIS BOAT, IN A CHAPTER WITH OTHERS, IS ONE QUIET LINE AT THE
     CHAPTER'S FOOT (the critic, P-5: "Nothing from GFAB Trailers is made for this boat." stood in a
     box above the trailer that is) — the chapter draws it last (`ChapterCard`) */
  const bare =
    named && !entire && query === '' && table.rows.length === 0 && table.also.length === 0
  /* THE WHOLE RANGE, BY REASON (the critic, P-4 and P-9): over a whole list the rows the boat is
     made for come first, under their own heading, and every other reason is a heading said once
     over its rows — never the same sentence under two hundred tiles */
  const groups = entire && query === '' ? rangeGroups(rows, table.sharedWhy, noun) : null
  return (
    <div className="cfg-table" data-bare={bare ? '' : undefined}>
      {head ? (
        <div className="cfg-table__head">
          {named || unpriced !== '' ? (
            <div className="cfg-table__title">
              {named ? <h3 className="cfg-table__name">{table.title}</h3> : null}
              {unpriced === '' ? null : table.unchosen !== '' ? (
                <PricesDoor tableId={table.unchosen} quoteId={quoteId} go={go}>
                  {unpriced}
                </PricesDoor>
              ) : (
                <span className="cfg-table__tag">{unpriced}</span>
              )}
            </div>
          ) : null}
          {unpricedWhy === '' ? null : <p className="cfg-table__why">{unpricedWhy}</p>}
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
        bare ? (
          <p className="cfg-table__none">
            {table.why !== '' ? table.why : bareSay(table.title, { boat: noun === 'boat', noun })}
          </p>
        ) : (
          <Said className="cfg-why" glyph={InfoIcon}>
            {query !== ''
              ? `Nothing in ${table.title} is called that.`
              : table.why !== ''
                ? table.why
                : noun === 'boat'
                  ? `Nothing more from ${table.title} is made for this boat.`
                  : `Nothing more from ${table.title} goes with this ${noun}.`}
          </Said>
        )
      ) : groups ? (
        groups.map((group) => (
          <section className="cfg-group" key={group.head} aria-label={group.head}>
            <h4 className="cfg-group__head">
              <span>{group.head}</span>
              <span className="cfg-group__count">{group.rows.length.toLocaleString('en-AU')}</span>
            </h4>
            <ul className={table.pictured ? 'cfg-tiles' : 'cfg-rows'}>
              {group.rows.map((row) => (
                <li key={row.key}>
                  <OptionCard
                    row={row}
                    kind={table.kind}
                    expand={expandOf(row)}
                    query=""
                    level={level}
                    onPress={onPress}
                    refusedBy={refusedBy}
                    includes={table.includes !== ''}
                    lazy
                    tile={table.pictured}
                    shop={shop}
                    insteadSaid={instead}
                    grouped
                  />
                </li>
              ))}
            </ul>
          </section>
        ))
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
              {/* THE COMMONEST REASON, SAID ONCE, IS NOT EVERY ROW'S: where a tile has another, it
                  says so under itself, and this says that it will */}
              {rows.some((r) => r.outside && r.why !== '')
                ? `${table.sharedWhy} Where one differs, it says so under it.`
                : table.sharedWhy}
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
                  expand={expandOf(row)}
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
                  expand={expandOf(row)}
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
      {kitsSay === '' ? null : (
        <Said className="cfg-why" glyph={InfoIcon}>
          {kitsSay}
        </Said>
      )}

      {/* THE WHOLE RANGE OPENS OVER THE PAGE (`RangeSheet`, `ChandlerySheet`), never pushed into
          the column under what is made for this boat: the column stays the build */}
      {counts.catalogue > counts.narrowed && !kits && !entire ? (
        <div className="cfg-all">
          <Button
            intent="veiled"
            size="sm"
            icon={ArrowsOutSimpleIcon}
            aria-haspopup="dialog"
            onClick={() => onShowAll(table.id)}
          >
            {table.tableId === PARTS_TABLE
              ? `Browse all ${counts.catalogue.toLocaleString('en-AU')} in the chandlery`
              : `Show all ${counts.catalogue.toLocaleString('en-AU')} in ${table.title}`}
          </Button>
        </div>
      ) : null}
      {whole === '' ? null : <p className="cfg-all__say">{whole}</p>}
    </div>
  )
}

/**
 * A WHOLE RANGE, BY WHY EACH ROW IS WHERE IT IS: what is made for this boat first, then one group
 * per reason the rest give, each reason said once as its heading. A group of motors under the
 * power the boat takes runs down from the nearest, so the first under its heading is the one a
 * dealer would reach for, never a 2.5 hp outboard.
 */
function rangeGroups(
  rows: readonly OptionRow[],
  shared: string,
  noun = 'boat',
): { head: string; rows: OptionRow[] }[] {
  const by = new Map<string, OptionRow[]>()
  for (const row of rows) {
    if (!row.outside) continue
    const why = row.why !== '' ? row.why : shared !== '' ? shared : `Not on this ${noun}’s list.`
    by.set(why, [...(by.get(why) ?? []), row])
  }
  const fits = rows.filter((row) => !row.outside)
  return [
    ...(fits.length > 0
      ? [{ head: noun === 'boat' ? 'Made for this boat' : `Goes with this ${noun}`, rows: fits }]
      : []),
    ...[...by].map(([head, list]) => ({
      head,
      rows: /^Under\b/.test(head) ? list.toReversed() : list,
    })),
  ]
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
  expand,
  grouped = false,
}: {
  /** under a heading that says why it is where it is (
angeGroups): its own sentence is that
   *  heading's, and is not said again under it */
  grouped?: boolean
  /** the press that opens its picture large, where it has one */
  expand?: { label: string; onExpand: () => void } | undefined
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
      <div className="cfg-opt" data-outside={row.outside && !grouped ? '' : undefined}>
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
            adds={!row.fitted && figure === null && figureSay === ''}
          >
            {name}
            {row.starred ? <span className="cfg-row__contains">Recommended</span> : null}
            {row.warned ? <WarnedMark /> : null}
            {row.twin && row.facts.length > 0 ? <Facts facts={row.facts} /> : null}
            {contains === '' ? null : <span className="cfg-row__contains">{contains}</span>}
          </RowFace>
        </Tile>
        {row.why === '' || grouped ? null : <p className="cfg-opt__why">{row.why}</p>}
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
    <div className="cfg-opt" data-outside={row.outside && !grouped ? '' : undefined}>
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
        recommended={row.starred && !row.fitted}
        {...(expand ? { expand } : {})}
      />
      {row.why === '' || grouped ? null : <p className="cfg-opt__why">{row.why}</p>}
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
  adds = false,
  children,
}: {
  /** NO FIGURE, AND A PRESS PUTS IT ON: said in the figure's place (the critic, P-3), so a list
   *  the price list prices nothing in still reads as things to add */
  adds?: boolean
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
        {adds ? (
          <span className="cfg-row__add" aria-hidden="true">
            <Icon glyph={PlusIcon} size="sm" />
            Add
          </span>
        ) : null}
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
    /* a fact this row leaves empty is not a line with nothing after its label */
    ...(row.twin
      ? []
      : row.facts
          .filter((f) => f.full.trim() !== '')
          .map((f) => ({ label: f.label, value: f.full }))),
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
/* The summary: the whole quote, one screen                    */
/* ---------------------------------------------------------- */

/** How far a wheel pushes on past the end before the screen turns: two notches of a mouse wheel,
 *  or a deliberate stroke of a trackpad, never the tail of a fling that only just reached it. */
const PAST_PX = 160

/** How long the column rests at its end before a push past it counts. */
const SETTLED_MS = 300

/**
 * A WHEEL PUSHED ON PAST AN END, said once per push (`onPast`). At a desk the chapters' column
 * scrolling on past its last chapter brings the summary in, and the summary pushed up past its top
 * takes it away, so the build and its summary read as two screens of one page. Nothing is moved by
 * the listener itself and nothing is held from the browser: it only notices.
 */
function listenPast(
  box: HTMLElement,
  way: 'down' | 'up',
  atEnd: (event: WheelEvent) => boolean,
  onPast: () => void,
): () => void {
  let pushed = 0
  let pushes = 0
  let idle = 0
  /* THE PUSH STARTS ONCE THE END HAS BEEN REACHED, never in the same stroke that reached it: a
     fling that carries the column to its last chapter stops there, and the summary comes only
     to a second, deliberate push (two notches of a wheel, or a stroke of a trackpad) */
  let arrived = 0
  const onScroll = (): void => {
    arrived = performance.now()
  }
  const onWheel = (event: WheelEvent): void => {
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
    const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY
    if (
      (way === 'down' ? delta <= 0 : delta >= 0) ||
      !atEnd(event) ||
      performance.now() - arrived < SETTLED_MS
    ) {
      pushed = 0
      pushes = 0
      return
    }
    pushed += Math.abs(delta)
    pushes += 1
    window.clearTimeout(idle)
    idle = window.setTimeout(() => {
      pushed = 0
      pushes = 0
    }, 400)
    if (pushed >= PAST_PX && pushes >= 2) {
      pushed = 0
      pushes = 0
      onPast()
    }
  }
  box.addEventListener('wheel', onWheel, { passive: true })
  box.addEventListener('scroll', onScroll, { passive: true })
  return () => {
    box.removeEventListener('wheel', onWheel)
    box.removeEventListener('scroll', onScroll)
    window.clearTimeout(idle)
  }
}

/**
 * THE DOOR TO THE SUMMARY, AT THE RAIL'S FOOT, where the finale's head stood: its name, where the
 * give stands ("ready to give", "after their name", "given"), the total, and an arrow down. A
 * press brings the summary in; at a desk scrolling on past it does the same.
 */
function SummaryDoor({
  at,
  index,
  chapter,
  open,
  onSee,
}: {
  at: RefObject<HTMLElement | null> | undefined
  index: number
  chapter: Chapter
  open: boolean
  onSee: () => void
}) {
  return (
    <section
      ref={at}
      className="cfg-chapter cfg-door"
      data-chapter={chapter.id}
      data-kind={chapter.kind}
      aria-label={chapter.name}
      style={{ '--i': Math.min(index, 7) } as CSSProperties}
    >
      <h2 className="cfg-head">
        <button
          type="button"
          className="cfg-head__press cfg-door__press"
          aria-expanded={open}
          aria-controls="cfg-summary"
          onClick={onSee}
        >
          <ChapterMark chapter={chapter} />
          <span className="cfg-head__num" aria-hidden="true" />
          <span className="cfg-head__body">
            <span className="cfg-head__name">{chapter.name}</span>
            {/* where the give stands, while the summary is not the thing in view: the tally says
                the total, and the summary, once open, says the rest (docs/WORDS.md, one fact once) */}
            {open ? null : (
              <span className="cfg-head__fact">
                <span className="cfg-head__rest">{chapter.fact}</span>
              </span>
            )}
          </span>
          <span className="cfg-head__sum" />
          <span className="cfg-head__chev cfg-door__chev" aria-hidden="true">
            <Icon glyph={ArrowDownIcon} />
          </span>
        </button>
      </h2>
    </section>
  )
}

/**
 * THE SUMMARY: THE WHOLE QUOTE ON ONE SCREEN (the owner, 2026-10-30: "the finale section should
 * actually take the whole page summary when you scroll to that, fits to screen size type thing
 * but big one page one filled screen summary with print and send and all of that and then you
 * scroll up and can edit and things and then scroll down and then see big summary and all of that
 * with all the photos and whatnot").
 *
 * The one screen the dealer turns towards the customer. The boat's photograph, as large as the
 * screen allows; every line on the quote with its own picture and figure; and the handover card
 * the finale was — who it is for, the total at the price it is given at, and the acts that finish
 * it: name them, give it, open the printed quote to print or save it, and, once given, email it
 * from the dealer's own mail (the app sends nothing itself, and says so).
 *
 * AT A DESK IT RISES OVER THE BUILD AND FILLS THE WINDOW, from the door at the rail's foot or by
 * scrolling on past the last chapter, and pushing up past its top, or "Back to the build", lowers
 * it again onto the chapter the dealer left. Below a desk it is the page's last screen, a window
 * tall, and the door scrolls to it. Its address is `at=finale`, so a reload lands on it.
 *
 * EVERYTHING THE FINALE DID, IT DOES: the refusals under the give and their reasons, a price put
 * on a line the price list gives none, the rules' warnings, the seal's moment, the new version.
 */
function Summary({
  open,
  quote,
  quoteId,
  ctx,
  rail,
  art,
  desk,
  onBack,
  onLarge,
  openQuote,
  openDocument,
  now,
  justGiven,
  onPress,
  onWho,
  go,
  setStep,
  setRefused,
  onSeen,
}: {
  /** the address names it (or the quote is given): it is brought into the window, and the caret
   *  comes with it */
  open: boolean
  quote: QuoteDef
  quoteId: string
  ctx: CatalogueCtx
  rail: Rail | null
  art: StageArt | null
  /** a desk, where it stands over the build rather than after it */
  desk: boolean
  onBack: () => void
  onLarge: (set: readonly LightboxPicture[], at: number, title: string) => void
  openQuote?: (id: string) => void
  openDocument?: (id: string) => void
  now?: () => Date
  justGiven: boolean
  onPress: (act: Act) => void
  onWho: () => void
  go?: (href: string) => void
  setStep: (step: Step) => void
  setRefused: (said: string | null) => void
  /** below a desk, whether it holds the window's upper half — its card then says the total */
  onSeen?: (seen: boolean) => void
}) {
  const boat = boatOfQuote(quote)
  const register = ctx.entities[quote.rootTableId]?.name ?? ''
  const isBoat = ctx.entities[quote.rootTableId]?.kind === 'boat'
  const headId = useId()
  const box = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const photo = art?.kind === 'photograph' ? art.held : null
  /* THE PHOTOGRAPH HOLDS ITS HEIGHT THROUGH THE GIVE BELOW A DESK (the build page round,
     2026-10-31). There it takes what the card and the lines leave of the window, so the given card,
     taller than the draft's, took 115px off it at 834 and 50px at 390, and the card's total rose
     under the press. Its height as a draft is watched, and at the give it is kept. */
  const pic = useRef<HTMLElement>(null)
  const [draftPic, setDraftPic] = useState(0)
  const issued = quote.state !== 'draft'
  useEffect(() => {
    const el = pic.current
    if (!el || issued || desk || typeof ResizeObserver === 'undefined') return
    const watch = new ResizeObserver(() => setDraftPic(el.getBoundingClientRect().height))
    watch.observe(el)
    return () => watch.disconnect()
  }, [issued, desk])
  const held = !desk && justGiven && draftPic > 0
  /* A LIST LONGER THAN ITS PLATE SAYS THERE IS MORE: its last visible line fades into the plate
     (`data-more`, configurator.css) rather than ending cut by the plate's edge, until it is
     scrolled to its end (the build page round, 2026-10-31: six lines at 1440 × 900). AND THE CARD
     THE SAME, at a desk, where a long quote's lines take their room first and a given card's
     footnotes scroll in their own place. */
  const card = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return
    const stops: Array<() => void> = []
    for (const el of [list.current, card.current]) {
      if (!el) continue
      const read = (): void => {
        const more = el.scrollHeight - el.clientHeight - el.scrollTop > 2
        el.toggleAttribute('data-more', more)
      }
      read()
      const watch = new ResizeObserver(read)
      watch.observe(el)
      if (el.firstElementChild) watch.observe(el.firstElementChild)
      el.addEventListener('scroll', read, { passive: true })
      stops.push(() => {
        watch.disconnect()
        el.removeEventListener('scroll', read)
      })
    }
    return () => {
      for (const stop of stops) stop()
    }
  }, [])

  /* BELOW A DESK IT IS THE PAGE'S END, reached by scrolling as often as by its door: while it
     holds the window's upper half, its card says the total and the tally steps aside */
  const seen = useEffectEvent((holds: boolean) => onSeen?.(holds))
  useEffect(() => {
    const node = box.current
    if (!node || desk || typeof IntersectionObserver === 'undefined') return
    const watch = new IntersectionObserver(([entry]) => seen(entry?.isIntersecting === true), {
      rootMargin: '0px 0px -50% 0px',
    })
    watch.observe(node)
    return () => {
      watch.disconnect()
      seen(false)
    }
  }, [desk])

  /* WHAT THE TOTAL IS MADE OF, one length per part in its ink, the ink each line's dot wears */
  const made = tallyOf(tallyParts(rail?.chapters ?? []))
  /* THE BOAT'S OWN LINE LEADS: the subject's line, which no chapter's list draws */
  const subjectIds = new Set(quote.sections.find((s) => s.blockId === SUBJECT_BLOCK)?.lineIds ?? [])
  const subject = quote.lines.find((l) => subjectIds.has(l.id))
  const items = rail
    ? summaryItems(
        rail,
        subject
          ? {
              /* THE ROW THAT PRICES THE BOAT NAMES IT, with the finish it is built in: "Adventure"
                 and "Hypalon · White / White / White/Blue" stood alone beside the hull's price,
                 the model missing from its own line (the paper-quote critique, 2026-10-31) */
              name: boat.say,
              amount: lineAmount(subject).amount,
              picture: photo
                ? {
                    src: photo.src,
                    width: photo.width,
                    height: photo.height,
                    credit: creditOf(photo),
                  }
                : null,
              chapter: isBoat
                ? (rail.chapters.find((c) => c.id === 'hull')?.name ?? register)
                : register,
              kind: ctx.entities[quote.rootTableId]?.kind ?? 'boat',
            }
          : null,
      )
    : []

  /* ARRIVING, THE CARET COMES WITH IT: to its heading, so a reader is told where they are, and
     below a desk the page is brought to it */
  useEffect(() => {
    const node = box.current
    if (!node || !open) return
    heading.current?.focus({ preventScroll: true })
    if (desk || typeof node.scrollIntoView !== 'function') return
    /* once the address has settled: the router puts a new address at the page's top, and the
       move to the summary comes after that, not before it */
    /* and where the page grew or shrank above it while it travelled, it lands exactly at the end */
    let taken = false
    const takeOver = (): void => {
      taken = true
    }
    const land = (): void => {
      if (!taken && Math.abs(node.getBoundingClientRect().top) > 1)
        node.scrollIntoView({ block: 'start', behavior: 'instant' })
    }
    let again = 0
    /* the page above it that settles a moment later (a chapter folding, a picture arriving)
       moves it: while the reader has not taken over, it is put back at the window's top */
    const grows = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => land())
    const arrived = (): void => {
      land()
      grows?.observe(document.body)
      again = window.setTimeout(() => grows?.disconnect(), BRINGS_MS * 1.5)
    }
    const timer = window.setTimeout(() => {
      node.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'instant' : 'smooth' })
      window.addEventListener('scrollend', arrived, { once: true })
      for (const kind of TAKES_OVER) window.addEventListener(kind, takeOver, { passive: true })
    }, LEAVES_MS)
    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(again)
      grows?.disconnect()
      window.removeEventListener('scrollend', arrived)
      for (const kind of TAKES_OVER) window.removeEventListener(kind, takeOver)
    }
  }, [desk, open])
  /* AT A DESK IT RISES OVER THE BUILD AND LOWERS AGAIN on the kit's travel spring; under reduced
     motion, or a caret in a field, it only fades. Below a desk it is simply there, at the page's end. */
  const reduce = useReducedMotion()
  const still = useStill()
  const quiet = Boolean(reduce) || still

  /* AT A DESK, PUSHING UP PAST ITS TOP LOWERS IT AGAIN — unless the wheel is inside the list of
     lines, or the card, and it still has somewhere to go */
  const onPast = useEffectEvent(() => onBack())
  useEffect(() => {
    const node = box.current
    if (!node || !desk) return
    return listenPast(
      node,
      'up',
      (event) => {
        /* the list and the card each scroll in their own place, and a wheel inside one that still
           has somewhere to go moves it */
        for (const el of [list.current, card.current]) {
          if (el?.contains(event.target as Node) && el.scrollTop > 0) return false
        }
        return true
      },
      () => onPast(),
    )
  }, [desk])

  return (
    <motion.section
      ref={box}
      id="cfg-summary"
      className="cfg-sum"
      data-testid="summary"
      data-open={open ? '' : undefined}
      aria-labelledby={headId}
      initial={desk ? (quiet ? { opacity: 0 } : { y: '100%' }) : false}
      animate={{ y: 0, opacity: 1 }}
      exit={
        desk
          ? quiet
            ? { opacity: 0, transition: transition('exit', true) }
            : { y: '100%', transition: transition('exit', false) }
          : { opacity: 0, transition: { duration: 0 } }
      }
      transition={transition('travel', quiet)}
    >
      <div className="cfg-sum__in">
        <header className="cfg-sum__head">
          <div className="cfg-sum__title">
            <p className="cfg-eyebrow">
              {quote.state === 'draft' ? 'Summary · draft' : 'Summary · given'}
            </p>
            {/* THE BOAT'S NAME AS THE TITLE, and once more only on the line that prices it, with its
                finish (the critic, P-10: it was the title, the line under the customer's name and
                the first line of the list; the paper-quote critique: a finish alone on that line
                named nothing) */}
            <h2 className="cfg-sum__name" id={headId} ref={heading} tabIndex={-1}>
              {boat.name}
            </h2>
          </div>
          <Button intent="quiet" size="sm" icon={ArrowUpIcon} onClick={onBack}>
            Back to the build
          </Button>
        </header>

        <div className="cfg-sum__body" data-pictured={photo ? '' : undefined}>
          {/* THE BOAT, AS LARGE AS THE SCREEN ALLOWS, never past its own pixels; a thing sold on its
              own with no picture held stands its list's name in type on the file's blue, as its
              stage does, rather than leaving half the summary empty (2026-10-31) */}
          {art ? (
            <div className="cfg-sum__boat">
              <figure
                ref={pic}
                style={
                  {
                    ...(held ? { flex: 'none', blockSize: draftPic } : {}),
                    /* A PHOTOGRAPH'S FRAME IS NEVER TALLER THAN ITS OWN PIXELS CAN COVER: at a desk a
                     frame of 605 stood a held 597 between two white hairlines (configurator.css) */
                    ...(photo ? { '--sum-held': `${photo.height}px` } : {}),
                  } as CSSProperties
                }
                className="cfg-sum__pic"
                data-art={art?.kind ?? 'word'}
                data-verdict={photo?.verdict}
              >
                {photo ? (
                  <>
                    <img
                      className="cfg-sum__img"
                      src={photo.src}
                      /* never past its own pixels: the ledger's size is the ceiling on the box */
                      style={{ maxInlineSize: photo.width, maxBlockSize: photo.height }}
                      alt=""
                      width={photo.width}
                      height={photo.height}
                      decoding="async"
                      {...(photo.widths.length > 1
                        ? /* THE FRAME COVERS, so the file chosen must cover its taller side too:
                           at 1920 the photograph is cut to 967 × 890 from a 3 : 2 file, which
                           needs 1,334 of its pixels across (the critic, P-11); and at 1440 a
                           panorama cut to 727 × 605 needs 1,470, more than 80vw, so the widest
                           file the window could want is asked for */
                          { srcSet: srcSetOf(photo), sizes: '100vw' }
                        : {})}
                    />
                    <span className="cfg-shot__expand">
                      <ExpandPicture
                        label="Open the photograph large"
                        onExpand={() =>
                          onLarge([largeOf(photo, boat.name, boat.say)], 0, 'The boat')
                        }
                      />
                    </span>
                  </>
                ) : art?.kind === 'mark' ? (
                  <img
                    className="cfg-sum__mark"
                    src={art.mark.src}
                    alt={art.mark.brand}
                    width={art.mark.width}
                    height={art.mark.height}
                  />
                ) : (
                  <span className="cfg-sum__word">{register}</span>
                )}
              </figure>
              {/* AT A DESK, ITS FACTS UNDER IT, as the build's stage stands them and the paper prints
                them: the quote's summary is the boat's too ("full spec of the quote and the boat",
                the owner, 2026-10-30). Below a desk the stage's own strip is a flick above. */}
              {desk && quote.subjectSpecs.length + (subject?.facts?.length ?? 0) > 0 ? (
                <Specs quote={quote} ctx={ctx} />
              ) : null}
            </div>
          ) : null}

          <div className="cfg-sum__side">
            {/* THE HANDOVER LEADS: who it is for and the total, which stand still at the give while the
                card below them grows its way on; then every line it is made of */}
            <div className="cfg-sum__card" ref={card}>
              {rail ? (
                <Finale
                  /* SHUT AND OPENED AGAIN, A GIVEN QUOTE IS SIMPLY THERE: below a desk the summary
                     stays on the page, so its card is drawn anew each time it is brought in */
                  key={open ? 'open' : 'shut'}
                  quote={quote}
                  quoteId={quoteId}
                  rail={rail}
                  art={null}
                  openQuote={openQuote}
                  openDocument={openDocument}
                  now={now}
                  arrives={justGiven}
                  onPress={onPress}
                  onWho={onWho}
                  go={go}
                  setStep={setStep}
                  setRefused={setRefused}
                />
              ) : null}
            </div>

            <section className="cfg-sum__lines" aria-label="On this quote">
              <h3 className="cfg-sum__count">
                <span>On this quote</span>
                <span className="cfg-sum__n">
                  {items.length === 1 ? '1 item' : `${items.length.toLocaleString('en-AU')} items`}
                </span>
              </h3>
              <ul className="cfg-sum__list" ref={list}>
                {items.map((item) => (
                  <li key={item.key} className="cfg-sum__item" data-ink={kindInk(item.kind)}>
                    <span className="cfg-sum__thumb">
                      {item.picture ? (
                        <img
                          src={item.picture.src}
                          alt=""
                          width={item.picture.width}
                          height={item.picture.height}
                          loading="lazy"
                          decoding="async"
                          {...(item.picture.srcSet
                            ? { srcSet: item.picture.srcSet, sizes: '96px' }
                            : {})}
                        />
                      ) : (
                        <KindMark kind={item.kind} size="sm" />
                      )}
                    </span>
                    <span className="cfg-sum__words">
                      <span className="cfg-sum__item-name">{slashed(item.name)}</span>
                      <span className="cfg-sum__item-in">
                        <span className="cfg-sum__dot" aria-hidden="true" />
                        {item.chapter}
                      </span>
                    </span>
                    <span className="cfg-sum__amt">
                      {item.amount === null ? (
                        <span className="cfg-sum__none">no price yet</span>
                      ) : (
                        <PriceFigure amount={item.amount} />
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              {made.shares.length > 1 ? (
                <div className="cfg-sum__made">
                  <span className="cfg-tally__heard">{`Made of: ${made.shares.map((x) => `${x.name} ${money(x.amount)}`).join(', ')}`}</span>
                  <p className="cfg-tally__bar" aria-hidden="true">
                    {made.shares.map((share) => (
                      <span
                        key={share.id}
                        className="cfg-tally__len"
                        data-ink={kindInk(share.kind)}
                        style={{ '--share': share.share } as CSSProperties}
                      />
                    ))}
                  </p>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </div>
    </motion.section>
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
  go,
  setStep,
  setRefused,
}: {
  quote: QuoteDef
  quoteId: string
  rail: Rail
  /** follow an address without a page load — a line's list to its price on Prices */
  go?: (href: string) => void
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
  const waitsId = useId()
  /* A LINE THAT STOPS THE GIVE IS SAID ONCE, BY THE GIVE (docs/WORDS.md, one fact once): on a
     draft, the refusal under the act names a line whose price is not chosen, or was chosen
     since, with what to do about it beside it; the sentence under the total keeps the rest */
  const told = (at: number): boolean => issued || rail.unpricedWhy[at] === 'none'
  const note = totalNoteSay(
    rail.unpricedNames.filter((_, at) => told(at)),
    hullHasNoPrice(quote),
    rail.unpricedLists.filter((_, at) => told(at)),
    rail.unpricedWhy.filter((_, at) => told(at)),
  )
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
    /* the letterhead and the person, as they stand at the give, are copied on (Milestone 4) */
    const stamp = issueStampNow(catalogueStore.getState(), quote.preparedBy)
    const outcome = quotesStore.getState().apply(quoteId, issue(stamp))
    if ('refused' in outcome) {
      setRefused(outcome.refused === '' ? null : outcome.refused)
      return
    }
    setRefused(null)
    setStep({ said: outcome.said, eventId: outcome.event.id, wasUndo: false })
  }, [quoteId, quote.preparedBy, setRefused, setStep])

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
  const contact = quote.customer.contact?.[0]?.trim() ?? ''
  const email = emailIn(contact)

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
              {contact === '' ? null : <span className="cfg-hand__boat">{contact}</span>}
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
                      Add their name
                    </Button>
                  )}
                </span>
              </p>
              {/* THEIR LINE OF CONTACT, AS IT PRINTS (the critic, P-10: the bar said it and the card
                  did not); the boat is the summary's title, over the card */}
              {contact === '' ? null : <p className="cfg-hand__boat">{contact}</p>}
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
          rail={rail}
          go={go}
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
            <div className="cfg-hand__acts">
              <Button
                ref={onward}
                intent="act"
                icon={FileTextIcon}
                onClick={() => openDocument?.(quoteId)}
                refusedBecause={openDocument ? undefined : NO_DOCUMENT_HERE}
              >
                Open the printed quote
              </Button>
              {/* SENT AS THIS APP CAN HONESTLY SEND IT TODAY: it holds no mail of its own, so the
                  press opens the dealer's own email to the address the customer's contact line
                  holds, the quote's number in its subject, and the PDF saved from the printed
                  quote is attached there. Where the line holds no address, the press says so. */}
              {email === '' ? (
                <Button intent="secondary" icon={EnvelopeSimpleIcon} refusedBecause={NO_EMAIL}>
                  Email it
                </Button>
              ) : (
                <a
                  className="cfg-hand__mail"
                  href={`mailto:${email}?subject=${encodeURIComponent(`Quote ${quote.reference} · ${boat.name}`)}`}
                >
                  <Icon glyph={EnvelopeSimpleIcon} />
                  {`Email it to ${email}`}
                </a>
              )}
            </div>
            <p className="cfg-act__say">{SEND_SAY}</p>
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
          <div className="cfg-hand__acts">
            {/* REFUSED, THE GIVE DOES NOT WEAR THE ACT'S AMBER (the paper-quote critique,
                2026-10-31: lit gold over "No customer's name is on this quote yet", it looked
                pressable, the sentence under it notwithstanding). Until it can act it is the kit's
                quiet press, refused as every quiet press is; the moment nothing waits it is the act. */}
            <Button
              intent={rail.blockers.length > 0 ? 'secondary' : 'act'}
              icon={PaperPlaneTiltIcon}
              onClick={doGive}
              refusedBy={rail.blockers.length > 0 ? waitsId : undefined}
            >
              Give it to the customer
            </Button>
            {/* THE PAPER AS IT STANDS, before it is given: a draft prints as a draft */}
            <Button
              intent="secondary"
              icon={FileTextIcon}
              onClick={() => openDocument?.(quoteId)}
              refusedBecause={openDocument ? undefined : NO_DOCUMENT_HERE}
            >
              Preview the printed quote
            </Button>
          </div>
          <GiveWaits id={waitsId} blockers={rail.blockers} waits={rail.waits} />
          <p className="cfg-act__say">{DOCUMENT_SAY}</p>
          <GiveReach quote={quote} />
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

/**
 * NOTHING ON THE PAPER REACHES NORTHSIDE, said at the moment of the give (quote-spec §0, rule 5;
 * the printed quote's critic, 2026-10-31: no address, phone or email on any paper, and nothing
 * said here). Read off Northside's details as the give would copy them on (`issueStampNow`) and
 * the quote's own choice of sections; it never stops the give, it says what the customer's copy
 * will lack. The sentence is the paper's own (`unreachableSay`).
 */
function GiveReach({ quote }: { quote: QuoteDef }) {
  const org = useCatalogue((s) => s.org)
  const business = useCatalogue((s) => s.business)
  const stamp = issueStampNow({ org, business }, quote.preparedBy)
  const say = unreachableSay(
    stamp.letterhead ?? null,
    stamp.preparer ?? null,
    !(quote.paperOff ?? []).includes('details'),
  )
  return say === '' ? null : (
    <p className="cfg-act__say" data-testid="give-unreachable">
      {say}
    </p>
  )
}

/**
 * WHY THE GIVE WAITS, ONE LINE PER CAUSE (built-critique-m3-2.md, major 5). The finale ran two
 * refusals into one paragraph, each ending "cannot be given". One cause alone is said whole,
 * as it always was; several are one lead that says what they stop, once, and a line for each
 * cause with what puts it right. It stands where the act's own refusal stood, under the act,
 * and the act points a reader at it (`refusedBy`). Each line is the kit's `Refusal`, so it
 * wears the reason's glyph and ink and is read by the refusal ruler.
 */
function GiveWaits({
  id,
  blockers,
  waits,
}: {
  id: string
  blockers: readonly string[]
  waits: readonly string[]
}) {
  if (blockers.length === 0) return null
  if (blockers.length === 1)
    return (
      <div className="cfg-act__waits" data-testid="give-waits">
        <Refusal id={id} on="room">
          {blockers[0]!}
        </Refusal>
      </div>
    )
  return (
    <div className="cfg-act__waits" id={id} data-testid="give-waits">
      <p className="cfg-act__lead">{giveWaitsLead(waits.length)}</p>
      <ul className="cfg-act__causes">
        {waits.map((said) => (
          <li key={said}>
            <Refusal on="room">{said}</Refusal>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** What a price put on a line the price list gives none records beside it, at the moment of the
 *  decision (`setOverride`). The dealer's note beside the printed quote says it; the customer's
 *  copy prints the price alone. */
export const LINE_PRICE_REASON = 'The price list has no price for it.'

/** The same, for a line whose list holds sell figures and names none (built-critique-m3.md,
 *  blocker 1): "no price for it" would be false there. */
export const LINE_UNCHOSEN_REASON =
  'Northside had not chosen which of the price list’s figures prices it.'

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
  rail,
  go,
  setStep,
  setRefused,
}: {
  quote: QuoteDef
  quoteId: string
  rail: Rail
  go?: (href: string) => void
  setStep: (step: Step) => void
  setRefused: (said: string | null) => void
}) {
  const names = rail.unpricedNames
  const lines = quote.lines.filter(
    (line) => line.label !== quote.subjectLabel && lineAmount(line).amount === null,
  )
  if (lines.length === 0 || lines.length !== names.length) return null
  return (
    <div className="cfg-hand__price">
      {lines.map((line, at) => {
        const again = rail.unpricedAgain[at] ?? null
        /* PUT ON BEFORE ITS LIST HAD A PRICE: the price list's own figure, in one press */
        if (rail.unpricedWhy[at] === 'before' && again && again.to !== null)
          return (
            <LineAgain
              key={line.id}
              change={again}
              name={names[at]!}
              quoteId={quoteId}
              setStep={setStep}
              setRefused={setRefused}
            />
          )
        const unchosen = rail.unpricedWhy[at] === 'unchosen'
        return (
          <LinePrice
            key={line.id}
            lineId={line.id}
            name={names[at]!}
            quoteId={quoteId}
            reason={unchosen ? LINE_UNCHOSEN_REASON : LINE_PRICE_REASON}
            setStep={setStep}
            setRefused={setRefused}
          >
            {/* NORTHSIDE'S PRICE FOR THE WHOLE LIST IS CHOSEN ON PRICES, once, and every quote
                after it is priced (built-critique-m3.md, blocker 1); a price typed here is for
                this quote alone */}
            {unchosen && rail.unpricedTables[at] ? (
              <PricesDoor tableId={rail.unpricedTables[at]!} quoteId={quoteId} go={go}>
                Choose on Prices
              </PricesDoor>
            ) : null}
          </LinePrice>
        )
      })}
    </div>
  )
}

/**
 * A LINE PUT ON BEFORE ITS LIST HAD A PRICE, AND THE PRICE THE PRICE LIST NOW GIVES IT, in one
 * press. It is `applyPriceChanges`, the engine's own re-reading with its inverse, so the step's
 * Undo takes it off again. Nothing is re-read without the press: a silent restatement is worse
 * than a stale number (`priceChanges`).
 */
function LineAgain({
  change,
  name,
  quoteId,
  setStep,
  setRefused,
}: {
  change: PriceChange
  name: string
  quoteId: string
  setStep: (step: Step) => void
  setRefused: (said: string | null) => void
}) {
  const put = (): void => {
    const outcome = quotesStore.getState().apply(quoteId, applyPriceChanges([change]))
    if ('refused' in outcome) {
      setRefused(outcome.refused === '' ? null : outcome.refused)
      return
    }
    setRefused(null)
    setStep({
      said: `${headOf(name)} priced at ${money(change.to ?? 0)}`,
      eventId: outcome.event.id,
      wasUndo: false,
    })
  }
  return (
    <div className="cfg-hand__line-again">
      <p className="cfg-hand__line-name">{headOf(name)}</p>
      <Button intent="secondary" size="sm" icon={TagIcon} onClick={put}>
        {`Price it at ${money(change.to ?? 0)}`}
      </Button>
    </div>
  )
}

/** THE DOOR TO A LIST ON PRICES, where Northside chooses which of its figures is its price; it
 *  carries the quote, so Prices can lead back to it. */
function PricesDoor({
  tableId,
  quoteId,
  go,
  children,
}: {
  tableId: string
  quoteId: string
  go?: (href: string) => void
  children: ReactNode
}) {
  const href = `/levels?list=${encodeURIComponent(tableId)}&quote=${encodeURIComponent(quoteId)}`
  return (
    <Button
      intent="quiet"
      size="sm"
      icon={CoinsIcon}
      href={href}
      onClick={go ? () => go(href) : undefined}
    >
      {children}
    </Button>
  )
}

function LinePrice({
  lineId,
  name,
  quoteId,
  reason,
  setStep,
  setRefused,
  children,
}: {
  lineId: string
  name: string
  quoteId: string
  /** recorded beside the price, for the dealer's note beside the paper */
  reason: string
  setStep: (step: Step) => void
  setRefused: (said: string | null) => void
  /** what else this line offers beside a typed price: the door to Prices */
  children?: ReactNode
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
    const outcome = quotesStore.getState().apply(quoteId, setOverride(lineId, price, reason))
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
      <span className="cfg-hand__line-acts">
        <Button intent="secondary" size="sm" icon={TagIcon} onClick={put}>
          {PUT_A_PRICE}
        </Button>
        {children}
      </span>
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
  const kind: TableKind | null = chapterKindOf(chapter)
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
/** a sentence starts with its capital */
const upper = (said: string): string => said.charAt(0).toUpperCase() + said.slice(1)

/** A COLOURWAY BREAKS BETWEEN ITS PARTS, NEVER BEFORE A SLASH (the critic, P-13: a tile read
 *  "White / White" over "/ White/Blue"): the space before each " / " does not break. */
const slashed = (said: string): string => said.replace(/ \/ /g, ' / ')

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
  scroller,
  chapters,
  open,
  names,
}: {
  /** the chapters' own column where it is what scrolls (a desk), else null for the window */
  scroller: HTMLElement | null
  chapters: readonly RefObject<HTMLElement | null>[]
  /** the chapter that is open, or -1 where none is (a search opens every one with an answer) */
  open: number
  names: DashesProps['chapters']
}) {
  const place = useChapterProgress(chapters, scroller)
  useSmoothScroll(scroller === null)
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
