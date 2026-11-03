/* ============================================================
   THE SHEET, at /data/$table — the dealer's own price file, one table
   at a time, laid out like the maker's own price list and edited in
   place. Direction A of the redesign, "The price list"
   (docs/directions/sheet-redesign/a-the-price-list.html), picked by
   three judges 21 · 15 · 17 on 2026-09-23, with the changes they
   asked for built in:

     · A PRICE ALWAYS SITS IN THE SAME PLACE, and the model's spine
       says it per material at the lit rung — "PVC $41,340 · HYP
       $48,350" — with a range only where the colourway changes it
       (judge two's graft from board B).
     · INSIDE A MODEL THE ROWS RUN ONE MATERIAL AT A TIME, the material
       said once at the head of its run, as a level of the engine's own
       grouping and never a sort (judge two's change).
     · A SPINE IS NEVER TALLER THAN ITS ROWS: the render when there is
       room for one worth drawing, then fewer lines, then the name
       alone, and what it cannot carry is on the record (judge three's
       change, `spineFit`). In a hand the list rests shut to the model,
       one two-line head per model, and a press opens its rows in
       place (judge three's graft from board B).

   WHAT THE CRITIC FOUND, AND WHERE EACH IS ANSWERED
   (docs/directions/built-critique-m2.md):

     (1)  `?at=` IS A ROW. A row found in the finder opens THAT row: its
          chapter, its block opened, the cursor on it a third of the way
          down the room, and its record showing under it.
     (5)  EIGHTEEN AT 1280 × 800. One series is one chapter, so the list
          stands under one band, and a model costs no line of its own —
          its spine is beside its rows, not above them.
     (6)  NOT /quotes. No right-hand column at any width; the record
          opens under its row.
     (11) THE REST STATE IS THE WORK. No form at rest: "Add a column" is
          the last line of the columns menu, behind a press.
     (12) A FOLD SURVIVES EVERY WRITE. Which models are shut is the
          address (`?read=`, `?flip=`), and a write never touches it.
     (13) THE PILL CARRIES THE DOORS. This head repeats none of them.
     (20) NOTHING UNDER THE TAB BAR at 390: the sentence that says where
          the other columns went stands above the list, and the list
          pads by `--shell-foot`.
     (22) A COLUMN THAT SAYS ONE THING IS NOT A COLUMN. `saidOnce` finds
          what the table, a series and a model share; the head, the band
          and the spine say it once. The columns are the ones a dealer
          reads (`readingColumns`); the rest are one press away.

   THE PUBLISHED NUMBERS AGAINST THE ENGINE were reconciled by the
   designer before a board was drawn (the canvas's board 0,
   docs/directions/sheet-redesign/strip/0-reconciliation.html); the
   decisions that changed anything are in docs/DECISIONS.md.

   WHAT IS TRUE ON THIS BUILD:

     · EVERY WRITE IS A COMMAND WITH A WAY BACK, applied through
       `src/state/catalogue.ts`, and UNDO is pinned to the step line at
       the foot of the list — a line that stays, never a toast.
     · A STRUCTURAL CHANGE IS OFFERED, NEVER A SIDE EFFECT — `More.tsx`.
     · A COST COLUMN SHOWS HERE AND SAYS SO: in the head's said-once
       facts, in the columns menu, at every head behind the Every column
       door, and in the record. None reaches a customer surface.
     · A COLOURWAY CODE IS SHOWN AS THE CODE IT IS. The leading word of
       a variant is said once at the head of its run; the rest is
       printed as typed, and nothing parses a code into a swatch.
     · IN THE KIT (2026-09-28): the series and the doors are the kit's
       segment on the blue bar, their white thumb travelling to the one
       pressed; the lit rung sits on the accent's thumb; the acts carry
       their glyphs; refusals are the kit's sentence; the record, the
       step line and the Pictures door's cards are white plates. A
       pointer's press on a series or a door opens it RISING ("A CHAPTER
       OPENING", below), and the maker's mark in the head is the one
       picture that travels here from Data. sheet.css says what moves.
   ============================================================ */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  ArrowLineDownIcon,
  ArrowRightIcon,
  ArrowsInLineVerticalIcon,
  ArrowsOutLineVerticalIcon,
  CheckCircleIcon,
  CheckIcon,
  ColumnsIcon,
  FunnelSimpleIcon,
  InfoIcon,
  WarningIcon,
  XIcon,
  ImagesIcon,
  ListBulletsIcon,
  MagnifyingGlassIcon,
} from '@phosphor-icons/react'
import { animate, motion, stagger } from 'motion/react'
import {
  Button,
  Icon,
  Input,
  Kbd,
  Refusal,
  caretInField,
  move,
  Popover,
  reducedMotion,
  Select,
  sharedName,
  type Glyph,
} from '@/ui'
import {
  displayFieldOf,
  isImageValue,
  primaryImage,
  rowLabel,
  type CellValue,
  type EntityDef,
  type FieldDef,
  type RowData,
} from '@/domain/model'
import { newId } from '@/domain/id'
import { addRow, deleteRow, updateCell, type CatalogueCommand } from '@/domain/catalogue/commands'
import { dataOf, catalogue } from '@/state/catalogue'
import { useCatalogue } from '@/app/useStores'
import { applyView, coerceCellText, type ViewRow } from '@/domain/catalogue/table/core'
import {
  branchNoun,
  buildGroups,
  collectLeaves,
  groupKey,
  kindNoun,
  layoutGroups,
  leafFieldsOf,
  leafNoun,
  type GroupNode,
  type LeafNoun,
} from '@/domain/catalogue/table/grouping'
import { buildSections } from '@/domain/catalogue/table/sections'
import { bandsOf, layoutColumns } from '@/domain/catalogue/table/sections'
import {
  cellText,
  DEFAULT_COL_W,
  FIT_MIN_COL_W,
  ROW_H,
  type GridSel,
} from '@/domain/catalogue/table/helpers'
import { labelIndex, outlineLevels, viewRowsOf } from '@/domain/catalogue/table/outline'
import { saidOnce } from '@/domain/catalogue/table/saidOnce'
import { columnNote } from '@/domain/catalogue/table/columnNotes'
import { alsoBySaid, spineName } from '@/domain/catalogue/views/spineSaid'
import {
  blockPicture,
  chaptersOf,
  leadFigures,
  leadLevelOf,
  leadOf,
  leadSplit,
  leavesIn,
  packFacts,
  packOneLine,
  piecesOf,
  readingColumns,
  restOf,
  spineFit,
  type FactRun,
  type HeldColumn,
  type Piece,
} from '@/domain/catalogue/table/priceList'
import { priceLevelsFor, looksMonetary } from '@/domain/quote/pricing'
import {
  applyOnly,
  comparable,
  joinOnly,
  keptRules,
  onlySaid,
  onlyToken,
  questionsOf,
  readOnly,
  ruleSaid,
  warningsFor,
  type Only,
  type PriceWarning,
} from '@/domain/catalogue/table/only'
import {
  moveWrite,
  planMove,
  planRefusal,
  planTwin,
  readMove,
  twinText,
  type MoveKind,
  type MovePlan,
} from '@/domain/catalogue/table/priceMove'
import {
  asLoaded,
  lastChangeOf,
  NOTHING_CHANGED,
  wasInFile,
  type AsLoaded,
} from '@/domain/catalogue/table/asLoaded'
import { codeFieldOf } from '@/domain/catalogue/code'
import { elsewhere } from '@/domain/catalogue/table/elsewhere'
import { CUSTOMER_TABLE_ID } from '@/domain/people/customers'
import { priceReadOf } from '@/domain/modules/read'
import { Grid, type BandSays, type Slot, type SpineSays, type Written } from './Grid'
import { ColourKey } from './ColourKey'
import { splitVariant } from '@/domain/quote/colourway'
import { Record } from './Record'
import { Gallery } from './Gallery'
import { More } from './More'
import { blockCopy, exactRowsOf, heldCopy, markFor } from './pictures'
import { useMeasure } from './measure'
import {
  bandSays,
  COST_WORD,
  factLines,
  figuresOf,
  figuresText,
  handSentence,
  isCost,
  mixedSet,
  nameOfRow,
  NO_SHEET,
  NO_WAY_TO_THE_FILE,
  noTable,
  changeSaid,
  paintOf,
  centsColumns,
  pictureOf,
  pictureShows,
  picturesHeld,
  shownByAll,
  shownColour,
  recommendedOf,
  setAllWrite,
  fillDownWrite,
  codeOfRow,
  recordSaid,
  lineSaid,
  nameSaysCode,
  figureSaid,
  isSourceColumn,
  type Card,
  type Write,
} from './read'
import { fitmentOf, pricesOf } from '@/app/ways'
import type { LineOption } from './LinePicture'
import './sheet.css'

export type Door = 'price' | 'pictures' | 'every'
export type Reading = 'models' | 'variants'

export interface SheetPosition {
  door?: Door
  /** the row the record is open on */
  at?: string
  find?: string
  /** the chapter — the outermost level's value — being read */
  chapter?: string
  /** shut to the models, or every row open */
  read?: Reading
  /** the models whose state differs from the reading, comma-joined */
  flip?: string
  /** columns pressed into the grid, comma-joined */
  show?: string
  /** the lit rung's column */
  rung?: string
  /** folded sections behind the Every column door, comma-joined */
  fold?: string
  /** the questions asked of the list's values, comma-joined tokens (`domain/catalogue/table/only`) */
  only?: string
}

export interface SheetProps extends SheetPosition {
  tableId: string
  business?: string | null
  onPosition?: (position: SheetPosition) => void
  openTheFile?: () => void
  /** another screen, by its address: a boat's "What goes on this boat" */
  goTo?: (href: string) => void
  /** THE LIST AS THE MASTER PRICE FILE CARRIES IT, fetched by whoever holds the way to the
   *  file (the route); absent, nothing is compared and nothing is marked as changed */
  fileOf?: (tableId: string) => Promise<readonly RowData[]>
}

/** THE LISTS WHOSE LINES A DEALER PICTURES: the things sold (a colourway is a boat's line). */
const PICTURED_KINDS: ReadonlySet<string> = new Set([
  'boat',
  'motor',
  'trailer',
  'accessory',
  'package',
])
const PICTURED_SHELVES: ReadonlySet<string> = new Set(['oils_lubes'])

interface Step {
  said: string
  eventId: string
  wasUndo: boolean
  /** what one cell's write changed (`changeSaid`), kept so taking it back says which price */
  detail?: string
  /** what the write breaks that the rest of the file keeps — Cash under its landed cost — each
   *  a sentence with its measurement (`warningsFor`); said beside Undo, never a refusal */
  warn?: string[]
}

/** A hand: the width under which the record is the screen. */
const HAND = '(max-width: 639.98px)'

function useHand(): boolean {
  const [hand, setHand] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(HAND).matches
      : false,
  )
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const q = window.matchMedia(HAND)
    const on = () => setHand(q.matches)
    q.addEventListener('change', on)
    return () => q.removeEventListener('change', on)
  }, [])
  return hand
}

/**
 * THE WIDTH A SCROLLBAR TAKES ON THIS MACHINE, read once off a probe:
 * 15 px where scrollbars are classic (Windows, the dealership's own
 * desk), 0 where they float over the content (a phone, a Mac left as it
 * came). `.sh-grid` keeps its gutter (`scrollbar-gutter: stable`), so
 * that much of the body is never the columns'.
 */
function scrollbarWidth(): number {
  if (typeof document === 'undefined' || !document.body) return 0
  const probe = document.createElement('div')
  probe.style.overflow = 'scroll'
  probe.style.position = 'absolute'
  probe.style.visibility = 'hidden'
  probe.style.inlineSize = '100px'
  probe.style.blockSize = '100px'
  document.body.append(probe)
  const w = probe.offsetWidth - probe.clientWidth
  probe.remove()
  return Math.max(0, w)
}

/**
 * The width the grid has, read off its own box — and the list's
 * scrollbar gutter, which is none of the columns' and none of the
 * spine's. Measured 2026-09-24 on the built app: read off the body
 * alone, the price list drew its columns and its spine 15 px wider than
 * the list's inside at 834, 844, 1280 and 1440 (1,376 px of content in a
 * 1,361 px list at 1440), so every desk but the widest carried a sideways
 * scrollbar under the price list for 15 px nobody could read. The
 * measures and the columns are still chosen from the box, so no column
 * moves; the spine, which takes what the columns leave, gives the gutter
 * back.
 */
function useWidth(
  ref: React.RefObject<HTMLElement | null>,
  ready: boolean,
): { width: number; gutter: number } {
  const [w, setW] = useState({ width: 0, gutter: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el || !ready) return
    /* THE LIST'S OWN GUTTER, read off the list once it stands: a browser
       that hides its scrollbars (a headless one, a phone) can still keep
       the gutter `scrollbar-gutter: stable` asks for, so the probe alone
       is the fallback for the one paint before the list exists. */
    let watched: HTMLElement | null = null
    let ro: ResizeObserver | null = null
    const read = (): void => {
      const grid = el.querySelector<HTMLElement>('.sh-grid')
      if (grid && grid !== watched) {
        watched = grid
        ro?.observe(grid)
      }
      const gutter = grid ? grid.offsetWidth - grid.clientWidth : scrollbarWidth()
      const box = el.getBoundingClientRect().width
      setW((was) => (was.width === box && was.gutter === gutter ? was : { width: box, gutter }))
    }
    ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(read)
    ro?.observe(el)
    read()
    /* the list is drawn after the body is, and drawn again on a change of
       door; a new one is read the moment it stands */
    const mo =
      typeof MutationObserver === 'undefined'
        ? null
        : new MutationObserver(() => {
            if (!watched || !el.contains(watched)) read()
          })
    mo?.observe(el, { childList: true, subtree: true })
    return () => {
      ro?.disconnect()
      mo?.disconnect()
    }
  }, [ref, ready])
  return w
}

/* ---------------------------------------------------------- */
/* The measures                                                */
/* ---------------------------------------------------------- */

/**
 * THE PRICE LIST'S MEASURES, per room — the one place a width is
 * decided, because the columns that fit are chosen from them before a
 * cell is drawn. `sheet.css` says in its header why each is what it
 * is; every figure column is at or above the engine's 116 px floor
 * (`FIT_MIN_COL_W`) from the laptop up, and the tablet, which has 786
 * px for a spine and its rows, gives four pixels less each rather than
 * a fourth column.
 */
interface Measures {
  spine: number
  lead: number
  name: number
  code: number
  price: number
  mark: number
  extra: number
  tail: number
  pictureMaxH: number
  rowH: number
}

function measuresFor(available: number, hand: boolean): Measures {
  if (hand) {
    return {
      spine: 0,
      lead: 56,
      name: 0,
      code: 0,
      price: 104,
      mark: 44,
      extra: 0,
      tail: 0,
      /* 54 tall is 96 wide: the rest of the head keeps the 210 px its
         figure per material needs ("PVC $4,080 · HYP $6,050–$6,870") */
      pictureMaxH: 54,
      rowH: 44,
    }
  }
  const wide = available >= 1600
  const desk = available >= 1300
  /* a list not yet measured is drawn at the laptop's measures, the
     window the promise is made at, until its own box says otherwise */
  const laptop = available <= 0 || available >= 1100
  const floor = laptop ? FIT_MIN_COL_W : FIT_MIN_COL_W - 8
  return {
    spine: wide ? 480 : desk ? 420 : laptop ? 360 : 300,
    lead: 64,
    name: wide ? 176 : laptop ? 140 : 108,
    code: wide ? 140 : floor,
    price: wide ? 140 : floor,
    mark: 100,
    extra: wide ? 168 : 140,
    tail: laptop ? 172 : 96,
    /* A TABLET'S SPINE IS 300: a render beside its words would cut the
       figure the customer asks for first, so on a tablet the render is
       the record's and the Pictures door's, and the spine is words */
    pictureMaxH: wide ? 124 : laptop ? 92 : 0,
    rowH: ROW_H,
  }
}

/** The spine's own type, px — `sheet.css`'s `.sh-spine` says the same. */
const SPINE_TYPE = { pad: 12, nameH: 22, lineH: 16, pictureMinH: 64 }

/**
 * THE SPINE'S OWN BOX, px, as `sheet.css` draws it — the room its words
 * are laid into by `packFacts`, so the arithmetic and the paint agree:
 * `.sh-spine__in` pads 16 at the edge and 28 at the rows, a render
 * stands 12 from the words, and a fact line is indented 12 under its
 * accent dot (6 px, and 6 of air).
 *
 * 28 AT THE ROWS, NOT 12 (2026-09-28): the spine's shut/open press stands
 * in its top corner, 24px square and 4 in from the edge, and with 12 the
 * model's name ran under it — measured on the built app at 844 × 390,
 * where a touch screen shows the press at rest and its caret, now the
 * kit's glyph, met four names. The words end where the press begins.
 */
const SPINE_BOX = { padX: 44, gap: 12, indent: 12, pictureMinW: 72 }

/**
 * A SHUT MODEL'S LINE: the toggle's 24 px, three gaps of 16 between the
 * name, the figure and the facts, the same 28 of padding, and the 20 a
 * scrollbar keeps (`scrollbar-gutter: stable` on the list). A section
 * on the line costs its square and the air around it (`markW`).
 */
const SHUT_BOX = { chrome: 28 + 24 + 3 * 16 + 20, markW: 26 }

/** A HAND'S HEAD: 16 + 12 of padding, the gap before the caret, and the caret — the kit's
 *  16px glyph since 2026-09-28, where a typed ▸ was 10. Measured on the built app at 390: at
 *  10 the figure per material was laid 6px wider than the words had, and "PVC $2,770 · HYP
 *  $4,500–$5,320" lost its last figure to an ellipsis. */
const HAND_BOX = { chrome: 16 + 12 + 12 + 16, gap: 12 }

/**
 * THE LIT ROW'S TAIL, drawn: room for its `record` button and nothing
 * else. The columns are still chosen against the measure's own tail
 * (`m.tail`), so no column moves; what that frees goes to the spine.
 */
const TAIL_W = 96

/** What a spine says after its last fact when there was no room for the rest. */
const moreNote = (n: number): string => `+${n} more`

/** The render's caption: `--text-2xs` (11px) at `--text-2xs--line-height` (1.35), less the
 *  2px it is pulled up under the picture (`.sh-spine__caption`). */
const CAPTION_H = 13

/** A drawer level's own word, plural: "models", "series", "boats". */
function levelNoun(table: EntityDef, levelId: string | undefined): LeafNoun | null {
  const name = levelId
    ? table.fields
        .find((f) => f.id === levelId)
        ?.name.trim()
        .toLowerCase()
    : ''
  if (!name) return null
  if (name.endsWith('s')) return { one: name, many: name }
  if (/[^aeiou]y$/.test(name)) return { one: name, many: `${name.slice(0, -1)}ies` }
  return { one: name, many: `${name}s` }
}

/** A count in the dealer's word, grouped the way a figure is read: "2,519 pairings". */
const counted = (n: number, noun: LeafNoun): string =>
  `${n.toLocaleString('en-AU')} ${n === 1 ? noun.one : noun.many}`

/** How wide a column's words run, by its longest value and its own head
 *  in caps — a width the font would give within a character or two,
 *  decided before a cell is drawn so the columns that fit are known. */
function widthFor(
  field: FieldDef,
  rows: readonly ViewRow[],
  paint: (row: ViewRow) => string,
  floor: number,
  ceiling: number,
  capsW = 8.2,
  share = 0.95,
): number {
  /* the nineteenth value in twenty, not the longest, over the whole list: one variant typed
     as a sentence (`540 open (PVC) LG-W-DG`) should not push the code out of a tablet's grid
     for every series. A name is measured over the lines DRAWN, every one of them (`share` 1),
     so the series that holds such a line gives its column the room and the rest do not */
  const lengths: number[] = []
  const step = Math.max(1, Math.floor(rows.length / 400))
  for (let i = 0; i < rows.length; i += step) lengths.push(paint(rows[i]!).length)
  lengths.sort((a, b) => a - b)
  const longest = lengths.length === 0 ? 0 : lengths[Math.floor((lengths.length - 1) * share)]!
  const words = longest * 7.4 + 28
  /* a head in caps with the caps' tracking: a mark's head stands over a glyph and nothing else,
     so it is measured at 8.8px a letter — at 8.2 "Recommended" was given 118px and drawn
     "RECOMMEND…" (the judge, the pairing lists); any other column's words are wider than its
     head, and a wider head estimate pushed a tablet's Model Code off the list */
  const head = field.name.length * capsW + 28
  return Math.round(Math.min(ceiling, Math.max(floor, words, head)))
}

/**
 * A PRICE COLUMN IS ITS FLOOR, OR WIDE ENOUGH FOR ITS HEAD ON TWO LINES. Parts' "Sell inc
 * Install (if appl.)" stood in 116px, spilled left out of its column under the lit "SELL" pill
 * beside it, and read "SEL[SELL]NSTALL" (the judge's G2, at 1440 and 1920). A head too long for
 * one line is set on two, in a column given half its length — never more than half again the
 * floor — so a figure column never takes a name's width.
 */
function priceWidth(field: FieldDef, floor: number): number {
  const one = field.name.length * 7.6 + 56
  if (one <= floor) return floor
  /* A HEAD THAT FITS ON ONE LINE IN HALF AGAIN THE FLOOR IS GIVEN ONE LINE: "Sell Price" in a
     tablet's 108px was set on two inside its pill, a two-line blob (the verifier, 834 × 1112) */
  if (one <= Math.round(floor * 1.5)) return Math.round(one)
  return Math.max(floor, Math.min(Math.round(floor * 1.5), Math.round(one / 2) + 28))
}

/** The columns a motor is fitted and sold by, in its maker's own order. */
const MOTOR_SPECS: readonly RegExp[] = [
  /^hp\b|\bhp rating\b|horse ?power/i,
  /^shaft/i,
  /^control$/i,
]
/** A spec column holds a short figure or word: "2.5", "15\"", "Tiller handle". */
const SPEC_FLOOR = 88

const splitList = (s: string | undefined): string[] =>
  (s ?? '')
    .split(',')
    .filter(Boolean)
    .map((k) => {
      try {
        return decodeURIComponent(k)
      } catch {
        return k
      }
    })
const joinList = (keys: Iterable<string>): string | undefined => {
  const out = [...keys].map((k) => encodeURIComponent(k)).join(',')
  return out === '' ? undefined : out
}

/** The innermost drawers' rows — what a leading word is measured across. */
const innermost = (nodes: readonly GroupNode[]): ViewRow[][] =>
  nodes.flatMap((n) => (n.children.length > 0 ? innermost(n.children) : [n.leaves]))

/** The drawers at one level of a tree. */
const nodesAt = (nodes: readonly GroupNode[], level: number): GroupNode[] =>
  nodes.flatMap((n) => (n.level === level ? [n] : nodesAt(n.children, level)))

/* ---------------------------------------------------------- */

export function Sheet({
  tableId,
  business = null,
  door: doorIn = 'price',
  at = '',
  find = '',
  chapter: chapterIn,
  read: readIn,
  flip: flipIn,
  show: showIn,
  rung: rungIn,
  fold: foldIn = '',
  only: onlyIn,
  onPosition,
  openTheFile,
  goTo,
  fileOf,
}: SheetProps) {
  /* WHAT THE SCREEN LAST ASKED FOR STANDS UNTIL THE ADDRESS ANSWERS. A
     press that changes the door or the chapter hands the router a new
     address, and the router's answer arrives a render later; in that
     render the screen must not read the old address back and write it
     again over the new one — measured on the phone, a card behind the
     Pictures door opened the price list and was put back on the
     Pictures door by the screen's own echo. So the position asked for
     is read in place of the address that was current when it was asked,
     and the moment the address changes it is the address again. */
  const incoming = {
    door: doorIn,
    chapter: chapterIn,
    read: readIn,
    flip: flipIn,
    show: showIn,
    rung: rungIn,
    fold: foldIn,
    only: onlyIn,
  }
  const incomingKey = JSON.stringify(incoming)
  const [asked, setAsked] = useState<{ key: string; want: Partial<SheetPosition> } | null>(null)
  const live =
    asked !== null && asked.key === incomingKey ? { ...incoming, ...asked.want } : incoming
  const door: Door = live.door ?? 'price'
  const { chapter, read, flip, show, rung, only } = live
  const fold = live.fold ?? ''

  const status = useCatalogue((s) => s.status)
  const problem = useCatalogue((s) => s.problem)
  const tables = useCatalogue((s) => s.tables)
  const allRows = useCatalogue((s) => s.rows)
  const index = useCatalogue((s) => s.index)
  const events = useCatalogue((s) => s.events)
  /* the colour key's letters Northside named itself, on its own profile */
  const named = useCatalogue((s) => s.org?.colours)

  const table: EntityDef | undefined = tables[tableId]
  /* A MODEL'S BLOCK asks its model's picture too, as the picker does; a cell asks its own */
  const blockOf = useCallback(
    (address: string | undefined, rowId?: string) => blockCopy(tableId, address, rowId ?? ''),
    [tableId],
  )
  const open = status === 'ready' && Object.keys(tables).length > 0
  const answered = status === 'ready' || status === 'failed'

  const hand = useHand()
  const body = useRef<HTMLDivElement>(null)
  const { width: available, gutter } = useWidth(body, table !== undefined)
  const m = useMemo(() => measuresFor(available, hand), [available, hand])
  const { probe, measure } = useMeasure()

  const [query, setQuery] = useState(find)
  const [peeking, setPeeking] = useState(at !== '')
  const [cursorRowId, setCursorRowId] = useState<string | null>(at === '' ? null : at)
  const [selection, setSelection] = useState<GridSel | null>(null)
  const [step, setStep] = useState<Step | null>(null)
  const [refused, setRefused] = useState<string | null>(null)
  const [focusRowId, setFocusRowId] = useState<string | null>(at === '' ? null : at)
  const field = useRef<HTMLElement>(null)

  /* ---- the reading ------------------------------------------ */

  const tableRows = useMemo(() => allRows[tableId] ?? [], [allRows, tableId])
  /* THE LINKED ROW IS FOUND BY ITS ID ALONE, through the store's own
     index: a row id names one row on the whole sheet. */
  const refLabel = useCallback(
    (_refEntityId: string | undefined, rowId: string): string | undefined => {
      const row = index.rowById[rowId]
      const target = row ? tables[row.entityId] : undefined
      return row && target ? rowLabel(target, row) : undefined
    },
    [index, tables],
  )
  const view = useMemo(
    () => (table ? viewRowsOf(table, tableRows, refLabel) : []),
    [table, tableRows, refLabel],
  )
  const levels = useMemo(() => (table ? outlineLevels(table, tables) : []), [table, tables])
  const leafFields = useMemo(
    () => (table ? leafFieldsOf(table.fields, levels) : []),
    [table, levels],
  )
  const textOf = useCallback((r: ViewRow, id: string) => r.text[id] ?? '', [])
  const roots = useMemo(() => buildGroups(view, levels, textOf), [view, levels, textOf])
  const said = useMemo(() => saidOnce(view, leafFields, roots), [view, leafFields, roots])
  const spineLevel = levels.length - 1
  const leafLevel = table?.hierarchy?.length
    ? table.hierarchy[table.hierarchy.length - 1]
    : undefined
  const split = useMemo(
    () => (spineLevel >= 0 ? leadSplit(innermost(roots), leafLevel, textOf) : null),
    [spineLevel, roots, leafLevel, textOf],
  )
  const chapters = useMemo(() => chaptersOf(roots, levels), [roots, levels])
  /* A LINE'S TWIN IN THE LIST'S FIRST MATERIAL — "HYP B-G-B" of Sport 560 is "PVC B-G-B" of Sport
     560 — read over the whole list, so a move can price Hypalon from its PVC line (Selection) */
  const twin = useMemo((): Twin | undefined => {
    if (!split || split.words.length < 2) return undefined
    const base = split.words[0]!
    const keyOf = (r: ViewRow, words: string): string =>
      JSON.stringify([...levels.map((id) => (r.text[id] ?? '').trim()), words])
    const based = new Map<string, ViewRow>()
    for (const r of view) {
      const words = (r.text[split.fieldId] ?? '').trim()
      if (words !== '' && twinText(split, words, base) === words) based.set(keyOf(r, words), r)
    }
    return {
      base,
      of: (r) => {
        const words = (r.text[split.fieldId] ?? '').trim()
        const other = twinText(split, words, base)
        if (other === '') return undefined
        if (other === words) return 'base'
        return based.get(keyOf(r, other))
      },
    }
  }, [split, levels, view])

  const noun = useMemo(() => leafNoun(table), [table])
  const branch = useMemo(() => branchNoun(table), [table])
  const spineNoun = useMemo(
    () => (table && spineLevel >= 0 ? levelNoun(table, levels[spineLevel]) : null),
    [table, levels, spineLevel],
  )
  const costFields = useMemo(
    () => (table ? table.fields.filter((f) => isCost(table, f)) : []),
    [table],
  )
  const image = useMemo(() => table?.fields.find((f) => f.type === 'image'), [table])

  /* the price ladder: what the table declares, or the one price it has */
  const prices = useMemo(() => {
    if (!table) return []
    const declared = priceLevelsFor(table).map((l) => ({ fieldId: l.fieldId, label: l.label }))
    if (declared.length > 0) return declared
    const one = priceReadOf(table)
    return one ? [{ fieldId: one.field.id, label: one.label }] : []
  }, [table])
  const rungId = prices.some((p) => p.fieldId === rung) ? rung : prices[0]?.fieldId
  /* the rung's word where it is not the list's own first price, which the heads read at rest */
  const rungAt =
    rungId !== undefined && rungId !== prices[0]?.fieldId
      ? prices.find((p) => p.fieldId === rungId)?.label
      : undefined
  const costOf = useCallback((f: FieldDef): boolean => (table ? isCost(table, f) : false), [table])
  const cents = useMemo(
    () => (table ? centsColumns(table, view) : new Set<string>()),
    [table, view],
  )
  /* EVERY LINE'S COLOURWAY CODE, for the colour key: the last level of a list filed in three
     (Highfield's Variant), as the Grid draws its stripes */
  const colourCodes = useMemo(() => {
    const h = table?.hierarchy ?? []
    const id = h.length >= 3 ? h[h.length - 1] : undefined
    return id ? view.map((r) => splitVariant(r.text[id] ?? '').code) : []
  }, [table, view])

  /* A LIST THAT IS NOT A BOAT LIST READS ITS SPINE AS A BAND (the judge's G5, 2026-11-03): the
     boats and the pairings keep the spine beside their rows — a model's render and its facts are
     what a hull's rows share — and parts, packages, kits, motors and trailers give its width to
     the names a person searches by, the category standing over its rows as one line. */
  const banded =
    spineLevel >= 0 &&
    !hand &&
    table !== undefined &&
    table.kind !== 'boat' &&
    table.role !== 'join'

  /* ---- the price file as it came ----------------------------- */

  /* WHAT NORTHSIDE CHANGED (the judge's G12): the same list as the Master Price File this app
     carries, fetched once, compared cell by cell (`asLoaded`). Where it cannot be fetched — no
     network, a list made here — nothing is marked, and nothing is said to have changed. */
  const [fileRows, setFileRows] = useState<{ id: string; rows: readonly RowData[] } | null>(null)
  const hasTable = table !== undefined
  useEffect(() => {
    if (!hasTable || !fileOf) return
    let current = true
    fileOf(tableId)
      .then((rows) => {
        if (current) setFileRows({ id: tableId, rows })
      })
      .catch(() => {
        if (current) setFileRows(null)
      })
    return () => {
      current = false
    }
  }, [tableId, hasTable, fileOf])
  const knowsFile = fileRows !== null && fileRows.id === tableId
  const changes: AsLoaded = useMemo(
    () =>
      table && fileRows && fileRows.id === tableId
        ? asLoaded(tableRows, fileRows.rows, table.fields)
        : NOTHING_CHANGED,
    [table, fileRows, tableId, tableRows],
  )
  const changedOf = useCallback(
    (rowId: string, fieldId: string): string | undefined => {
      const w = wasInFile(changes, rowId, fieldId)
      const f = w && table ? table.fields.find((x) => x.id === fieldId) : undefined
      if (!w || !f || !table) return undefined
      return paintOf(table, f, {
        rowId,
        values: { [f.id]: w.was },
        text: { [f.id]: cellText(w.was, f) },
      })
    },
    [changes, table],
  )

  /* ---- what is in view -------------------------------------- */

  /* THE QUESTIONS ASKED OF THE VALUES (the judge's G9), from the address */
  const onlyList = useMemo(() => (table ? readOnly(only, table) : []), [table, only])
  const onlyCtx = useMemo(() => (knowsFile ? { changed: changes.rows } : {}), [knowsFile, changes])
  const finding = query.trim() !== ''
  const narrowed = finding || onlyList.length > 0
  /* THE FILE'S STRINGS, AND THE NAMES THE SPINE PRINTS. The spine says
     "Roll Up 230 KAM" where the file writes RU230KAM (`spineName`), so
     "roll up 230" typed here has to find it: a name the app teaches is a
     name the app can be asked for (m2-last-critique.md blocker 2, which
     the finder and Home learned the hard way). */
  const modelLevel = levels[spineLevel]
  const found = useMemo(() => {
    if (!table || !finding) return view
    const byFile = applyView(view, table.fields, { search: query })
    if (!modelLevel) return byFile
    return alsoBySaid(view, byFile, query, (r) => {
      const n = spineName(table.id, r.text[modelLevel] ?? '')
      return n.code === '' ? '' : n.whole
    })
  }, [table, finding, query, view, modelLevel])
  const searched = useMemo(
    () => (onlyList.length === 0 ? found : applyOnly(found, onlyList, onlyCtx)),
    [found, onlyList, onlyCtx],
  )
  /* the questions this list's own columns can answer, each counted over the lines found */
  const questions = useMemo(
    () => (table ? questionsOf(table, found, prices, costOf, onlyCtx) : []),
    [table, found, prices, costOf, onlyCtx],
  )
  const compareFields = useMemo(() => (table ? comparable(table, view) : []), [table, view])
  /* A SEARCH THAT FINDS NOTHING HERE SAYS WHERE ELSE IT IS (the judge's G8): the other lists of
     the price file that carry every word, counted — never the customers, who are not a list of
     the price file */
  const others = useMemo(
    () =>
      finding && searched.length === 0
        ? elsewhere(
            Object.fromEntries(
              Object.entries(tables).filter(
                ([id]) => id !== CUSTOMER_TABLE_ID && !id.startsWith('__'),
              ),
            ),
            allRows,
            query,
            tableId,
          )
        : [],
    [finding, searched.length, tables, allRows, query, tableId],
  )
  /* a list whose figures are money but which declares no price (Dealer Fit, Rigging Kits) */
  const noPrice =
    table !== undefined &&
    prices.length === 0 &&
    table.role !== 'join' &&
    table.fields.some((f) => f.type === 'number' && !isCost(table, f) && looksMonetary(f.name))
  const atRow = useMemo(
    () => (focusRowId ? view.find((r) => r.rowId === focusRowId) : undefined),
    [focusRowId, view],
  )
  /* THE CHAPTER: the one asked for, else the one the found row is in,
     else the first. A search reads across every chapter. */
  const chapterValue = useMemo(() => {
    if (chapters.length === 0 || narrowed) return null
    if (chapter !== undefined && chapters.some((c) => c.value === chapter)) return chapter
    const levelId = levels[0]
    if (atRow && levelId) {
      const v = textOf(atRow, levelId).trim()
      if (chapters.some((c) => c.value === v)) return v
    }
    return chapters[0]!.value
  }, [chapters, narrowed, chapter, levels, atRow, textOf])
  /* THE LIT CHAPTER IS IN VIEW. On a phone and a tablet the chapters
     scroll sideways, and a sheet opened on Sport showed Roll-Up to Coaster
     with the lit chapter off the edge; the strip brings it in, centred. */
  const strip = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const s = strip.current
    const lit = s?.querySelector<HTMLElement>('[data-lit]')
    if (!s || !lit || !table || chapterValue === null) return
    const a = s.getBoundingClientRect()
    const b = lit.getBoundingClientRect()
    if (b.left < a.left || b.right > a.right)
      s.scrollLeft += b.left - a.left - (a.width - b.width) / 2
  }, [chapterValue, table])
  const shownRows = useMemo(() => {
    const levelId = levels[0]
    if (chapterValue === null || !levelId) return searched
    return searched.filter((r) => textOf(r, levelId).trim() === chapterValue)
  }, [chapterValue, levels, searched, textOf])

  /* A CHAPTER OPENING (2026-09-28, the component kit). A pointer's press on a series or a
     door sends the bar's white thumb travelling to it on the travel spring, and the list it
     opens RISES two steps of the grid into place as it fades in, on the kit's `enter` — the
     page of the price list turning to that series, rather than its rows being swapped under
     a still frame. Only a pointer's press: a key is never animated (emil-design-eng, "never
     animate keyboard-initiated actions"), and neither is anything while a caret is in a
     field or under reduced motion. Transform and opacity only, on the list and not on a row,
     so the virtualiser's own layout is never moved. */
  /* WHEN IT RUNS: in the frame after the press, which is the frame React's commit of the press
     has already landed in and the browser has not yet painted — so the new list is never seen
     standing still before it rises. */
  const opened = useCallback((pointer: boolean) => {
    if (!pointer || reducedMotion() || caretInField()) return
    requestAnimationFrame(() => {
      /* THE PICTURES DOOR IS A GROUP, and a group arrives in order: its cards come up one
         after another, a third of a press apart, where the price list rises as the one table
         it is */
      const gallery = body.current?.querySelector<HTMLElement>('.sh-gallery')
      if (gallery) {
        const cards = gallery.querySelectorAll<HTMLElement>('.sh-card:not([data-bare])')
        void animate(gallery, { opacity: [0, 1] }, move.enter)
        if (cards.length > 0)
          void animate(
            cards,
            { opacity: [0, 1], y: [8, 0] },
            { ...move.enter, delay: stagger(move.press.duration / 3) },
          )
        return
      }
      const list = body.current?.querySelector<HTMLElement>('.sh-list')
      if (list) void animate(list, { opacity: [0, 1], y: [8, 0] }, move.enter)
    })
  }, [])

  const leadId = split ? leadLevelOf(split.fieldId) : undefined
  const drawnLevels = useMemo(
    () => (leadId && door !== 'every' ? [...levels, leadId] : levels),
    [door, leadId, levels],
  )
  const drawnText = useCallback(
    (r: ViewRow, id: string): string =>
      split && id === leadId ? leadOf(split, textOf(r, split.fieldId)) : textOf(r, id),
    [leadId, split, textOf],
  )
  const drawnRoots = useMemo(
    () => buildGroups(shownRows, drawnLevels, drawnText),
    [shownRows, drawnLevels, drawnText],
  )

  /* WHICH MODELS ARE SHUT IS THE ADDRESS, so a write — which rebuilds
     every row and every drawer — cannot open one (critique §12). A hand
     rests shut to the models; a desk rests open. */
  /* BEHIND EVERY COLUMN EVERY LINE IS OPEN: the door exists to read all 33 columns, and it
     opened on sixteen shut models with nothing in them because it kept "Only the models" from
     the price list (the judge's G23). The price list keeps its own reading in the address. */
  const reading: Reading =
    door === 'every' ? 'variants' : (read ?? (hand && spineLevel >= 0 ? 'models' : 'variants'))
  const flipped = useMemo(() => new Set(door === 'every' ? [] : splitList(flip)), [flip, door])
  const spineNodes = useMemo(
    () => (spineLevel >= 0 ? nodesAt(drawnRoots, spineLevel) : []),
    [drawnRoots, spineLevel],
  )
  const atKey = useMemo(
    () =>
      atRow && spineLevel >= 0 ? groupKey(levels.map((id) => textOf(atRow, id).trim())) : null,
    [atRow, levels, spineLevel, textOf],
  )
  const collapsed = useMemo(() => {
    const out = new Set<string>()
    for (const n of spineNodes) {
      const shut = (reading === 'models') !== flipped.has(n.key)
      /* the row a finder found is never behind a shut model */
      if (shut && n.key !== atKey) out.add(n.key)
    }
    return out
  }, [spineNodes, reading, flipped, atKey])

  const layout = useMemo(
    () => layoutGroups(shownRows, drawnRoots, collapsed, { rowH: m.rowH, groupH: m.rowH, addH: 0 }),
    [shownRows, drawnRoots, collapsed, m.rowH],
  )
  const pieces = useMemo(() => piecesOf(layout.lines, spineLevel), [layout, spineLevel])

  /* ---- the columns ------------------------------------------ */

  const shownIds = useMemo(() => splitList(show), [show])
  const chosen = useMemo(
    () =>
      table
        ? readingColumns({
            table,
            leafFields,
            rows: view,
            said,
            levels,
            prices,
            isCost: (f) => isCost(table, f),
            shown: shownIds,
          })
        : { columns: [], extras: [], held: [] },
    [table, leafFields, view, said, levels, prices, shownIds],
  )

  const hasSpine = spineLevel >= 0
  const foldSet = useMemo(() => new Set(splitList(fold)), [fold])
  const every = useMemo(
    () => (table && door === 'every' ? buildSections(leafFields, table.sections, foldSet) : null),
    [table, door, leafFields, foldSet],
  )

  /* WHICH COLUMNS FIT: the name and the lit rung always; then the code,
     the rest of the ladder, the marks, what a person pressed in, and
     what else varies — each while the room allows. What does not fit
     is held with the rest, one press away, and a hand says so. */
  const { slots, spilled, slack } = useMemo(() => {
    if (door === 'every' && every) {
      const out: Slot[] = []
      for (const s of every.slots) {
        if (s.kind === 'fold')
          out.push({ kind: 'fold', section: s.section, count: s.count, w: 132 })
        else {
          /* AS WIDE AS ITS WORDS, up to two and a half floors: behind Every column the columns run
             off sideways anyway, and a fixed 160px cut every Boat ("Highfield - RU230KAM (PV…")
             and "INT LENGTH CM" at every size (the verifier, 2026-11-03) */
          const floor = Math.max(FIT_MIN_COL_W, DEFAULT_COL_W[s.field.type])
          const f = s.field
          const w =
            f.type === 'image' || !table
              ? floor
              : widthFor(
                  f,
                  view,
                  (r) => paintOf(table, f, r),
                  floor,
                  Math.round(floor * 2.5),
                  8.2,
                  1,
                )
          out.push({ kind: 'field', field: s.field, col: s.col, w, job: 'every' })
        }
      }
      return { slots: out, spilled: [] as FieldDef[], slack: 0 }
    }
    const floorOf = (job: string): number =>
      job === 'name'
        ? m.name
        : job === 'code'
          ? m.code
          : job === 'price'
            ? m.price
            : job === 'mark'
              ? m.mark
              : job === 'spec'
                ? SPEC_FLOOR
                : m.extra
    /* a column is as wide as its words, between its job's floor and a
       ceiling a third again as wide — a motor's name is longer than a
       colourway code, and a figure never needs more than its floor */
    const widths = new Map<string, number>()
    const widthOfCol = (c: { field: FieldDef; job: string }): number => {
      const known = widths.get(c.field.id)
      if (known !== undefined) return known
      const floor = floorOf(c.job)
      const w = !table
        ? floor
        : c.job === 'price'
          ? priceWidth(c.field, floor)
          : c.job === 'mark'
            ? widthFor(c.field, [], () => '', floor, floor * 1.5, 8.8)
            : widthFor(
                c.field,
                c.job === 'name' ? shownRows : view,
                (r) =>
                  split && c.field.id === split.fieldId
                    ? restOf(split, textOf(r, split.fieldId))
                    : paintOf(table, c.field, r),
                floor,
                /* a banded list's names are what it is searched by: up to four floors wide */
                Math.round(floor * (c.job === 'name' ? (banded ? 4 : 2.2) : 1.4)),
                8.2,
                c.job === 'name' ? 1 : 0.95,
              )
      widths.set(c.field.id, w)
      return w
    }
    /* A MOTOR READS LIKE ITS MAKER'S OWN PRICE LIST (the judge's G6): its code, its horsepower,
       its shaft and its control, then its price. "Yamaha - F4SMHA" beside "F4SMHA" said the
       code twice, so where the name only repeats the code (`nameSaysCode`, measured on nineteen
       lines in twenty) the code is the name; and the columns a motor is fitted by are read
       before anything else that varies. */
    const nameCol = chosen.columns.find((c) => c.job === 'name')
    const codeCol = chosen.columns.find((c) => c.job === 'code')
    const twice =
      nameCol !== undefined &&
      codeCol !== undefined &&
      nameSaysCode(view, nameCol.field, codeCol.field)
    const base: { field: FieldDef; job: string }[] = twice
      ? chosen.columns
          .filter((c) => c !== nameCol)
          .map((c) => (c === codeCol ? { field: c.field, job: 'name' } : c))
      : chosen.columns
    const specs =
      table?.kind === 'motor'
        ? MOTOR_SPECS.flatMap((re) =>
            chosen.extras.filter((f) => re.test(f.name.trim())).slice(0, 1),
          )
        : []
    const lead = base.findIndex((c) => c.job === 'name') + 1
    const all = [
      ...base.slice(0, lead),
      ...specs.map((f) => ({ field: f, job: 'spec' })),
      ...base.slice(lead),
      ...chosen.extras
        .filter((f) => !specs.includes(f))
        .map((f) => ({ field: f, job: 'varies' as const })),
    ]
    const priority = [
      ...all.filter((c) => c.job === 'name'),
      ...all.filter((c) => c.field.id === rungId),
      ...all.filter((c) => c.job === 'spec'),
      ...all.filter((c) => c.job === 'code'),
      ...all.filter((c) => c.job === 'price' && c.field.id !== rungId),
      ...all.filter((c) => c.job === 'mark'),
      ...all.filter((c) => c.job === 'varies'),
    ]
    let room =
      available > 0
        ? available - (hasSpine && !hand && !banded ? m.spine : 0) - (split ? m.lead : 0) - m.tail
        : Number.POSITIVE_INFINITY
    const keep = new Set<string>()
    for (const c of priority) {
      if (keep.has(c.field.id)) continue
      const must = c.job === 'name' || c.field.id === rungId
      if (hand && !must) continue
      const w = hand && c.job === 'name' ? 0 : widthOfCol(c)
      if (!must && w > room) continue
      keep.add(c.field.id)
      room -= w
    }
    const drawn = all.filter((c) => keep.has(c.field.id))
    const out: Slot[] = drawn.map((c, col) => ({
      kind: 'field',
      field: c.field,
      col,
      job: c.job,
      w: hand && c.job === 'name' ? 0 : widthOfCol(c),
    }))
    return {
      slots: out,
      spilled: all.filter((c) => !keep.has(c.field.id)).map((c) => c.field),
      /* the room no column took, which the spine is given (below) */
      slack: Number.isFinite(room) && !hand ? Math.max(0, room) : 0,
    }
  }, [
    door,
    every,
    chosen,
    rungId,
    available,
    hasSpine,
    hand,
    banded,
    m,
    split,
    table,
    view,
    shownRows,
    textOf,
  ])

  const fields = useMemo(() => slots.flatMap((s) => (s.kind === 'field' ? [s.field] : [])), [slots])
  const drawnIds = useMemo(() => new Set(fields.map((f) => f.id)), [fields])
  /* A FACT THE HEADING ALREADY SAYS IS NOT SAID AGAIN BESIDE IT. Highfield's "Matrix" is
     "Highfield Inflatables" on all 588 variants — the very name in the heading — and the head
     printed it under "Same on all 588 variants" a hand's width from the heading itself
     (docs/WORDS.md, refine round 2026-10-20). It is held in the columns menu with the
     columns that say what the name already says. */
  const namesTheTable = useCallback(
    (fieldId: string): boolean =>
      table !== undefined &&
      (view[0]?.text[fieldId] ?? '').trim().toLowerCase() === table.name.trim().toLowerCase(),
    [view, table],
  )
  const held: HeldColumn[] = useMemo(
    () => [
      ...spilled.map((f) => ({ field: f, where: 'other' as const })),
      ...chosen.held.map((h) =>
        h.where === 'head' && namesTheTable(h.field.id) ? { ...h, where: 'name' as const } : h,
      ),
    ],
    [spilled, chosen.held, namesTheTable],
  )
  const shownFields = useMemo(
    () => shownIds.flatMap((id) => leafFields.filter((f) => f.id === id)),
    [shownIds, leafFields],
  )
  const bands = useMemo(() => {
    if (door !== 'every') return undefined
    const layoutCols = layoutColumns(
      every?.slots ?? [],
      Object.fromEntries(
        slots.flatMap((s) => (s.kind === 'field' ? [[s.field.id, s.w]] : [])),
      ) as Record<string, number>,
      132,
    )
    return bandsOf(layoutCols, undefined)
  }, [door, every, slots])

  const refLabelsOf = useCallback(
    (f: FieldDef): Map<string, string> | undefined => {
      if (f.type !== 'reference' || !f.refEntityId) return undefined
      const target = tables[f.refEntityId]
      return target ? labelIndex(target, allRows[f.refEntityId] ?? []) : undefined
    },
    [allRows, tables],
  )

  /* ---- what each spine and band says ------------------------ */

  const pinId = table ? displayFieldOf(table)?.id : undefined
  /* the spine's level, where it is a link to another list (a pairing's hull) */
  const spineRef = useMemo(() => {
    const id = levels[spineLevel]
    const f = id ? table?.fields.find((x) => x.id === id) : undefined
    return f?.type === 'reference' ? f : undefined
  }, [levels, spineLevel, table])
  /* THE SPINE TAKES WHAT THE COLUMNS LEAVE. The columns are chosen
     first, against the measure's own spine and tail, so no column moves;
     the room none of them took, and what the tail no longer holds (its
     keys went to the record's legend), goes to the spine — the part of
     the price list that says what a model IS — up to half as wide again.
     Measured 2026-09-24 at 1440 × 900: a 420 px spine cut six of
     eighteen spec lines beside 116 px of empty tail; at 1920 it kept its
     width beside an empty strip and still cut (built-critique-m2-close.md
     §10). Behind Every column the columns run off sideways, so the spine
     keeps its measure there. */
  const spineW =
    hasSpine && !hand && !banded
      ? door === 'price'
        ? Math.min(
            m.spine + slack + Math.max(0, m.tail - TAIL_W) - gutter,
            Math.round(m.spine * 1.5),
          )
        : m.spine
      : 0

  /** A block's head: its name, how many rows it holds, and the lit rung's figure per material. */
  const headOf = useCallback(
    (p: Extract<Piece, { kind: 'block' }>) => {
      const rows = collectLeaves(p.node)
      /* THE MODEL AS A PERSON SAYS IT — "Roll Up 230 KAM" — where the
         maker's own page names the file's code (m2-last-critique.md major
         7), with the code said quietly after it on an open spine at a desk
         for the dealer who orders by it — never on a shut line or a hand's
         head, whose name column is a third of the list and was cut by it at
         834 ("Sport 700 WL (Windlass) SP700WL(Windlass) · 8 variants"); the
         file's own words everywhere else (`spineName`) */
      const spoken = spineName(table?.id ?? '', p.node.value)
      /* A PAIRING LIST'S HULL AS EVERY OTHER SCREEN SAYS IT (the judge's G7): "Roll Up 230 KAM ·
         PVC · WH", where the spine said the file's key "Highfield - RU230KAM (PVC) WH" in 588
         bands. The words are the boat list's own (`lineSaid` over the linked list). */
      const linkedTo = spineRef?.refEntityId
      const name =
        p.node.value === ''
          ? '(unassigned)'
          : linkedTo
            ? lineSaid(linkedTo, p.node.value) || p.node.value
            : spoken.name
      const whole =
        roots.length > 0 ? nodesAt(roots, spineLevel).find((n) => n.key === p.key) : undefined
      const count =
        narrowed && whole && whole.leafCount !== rows.length
          ? `${rows.length} of ${counted(whole.leafCount, noun)}`
          : counted(rows.length, noun)
      const code = spoken.code
      const each = rungId ? leadFigures(rows, rungId, split) : []
      /* A FIGURE READ AT ANOTHER RUNG SAYS WHICH (the verifier, J14): pressing TRADE turned every
         head to Trade's figures and only a tooltip said so — "Trade: PVC $2,631 · HYP …" now,
         and the list's own first price says nothing, as it always has */
      const atRung = rungAt ? `${rungAt}: ` : ''
      const figures = each.length > 0 ? atRung + figuresText(each) : ''
      /* the same figure one material at a time, for a spine too narrow to say it on one line */
      const leads = each.map((f, i) => (i === 0 ? atRung : '') + figuresText([f]))
      return { rows, name, count, code, figures, leads }
    },
    [roots, spineLevel, narrowed, noun, rungId, rungAt, split, table, spineRef],
  )

  /* A SHUT MODEL IS A LINE OF A PRICE LIST: its name, its figure and
     what it shares, each in a column of its own down every shut line, so
     a price always sits in the same place. The name's column is as wide
     as the widest shut name (never more than a third of the list), the
     figure's as the widest figure. Measured in the faces they are drawn
     in; before the probe has a box (the first paint, a document with no
     layout) both read 0 and the grid lays the line out by its content. */
  const shutCols = useMemo(() => {
    let name = 0
    let figures = 0
    if (hand || !hasSpine) return { name, figures }
    for (const p of pieces) {
      if (p.kind !== 'block' || !(p.shut || p.runs.length === 0 || banded)) continue
      const h = headOf(p)
      name = Math.max(name, measure(h.name, 'shut') + measure(` ${h.count}`, 'count'))
      figures = Math.max(figures, measure(h.figures, 'figures'))
    }
    /* a band's name has the line to itself but for its figure and a few facts: half the list */
    return { name: Math.min(name, Math.round(available / (banded ? 2 : 3))), figures }
  }, [hand, hasSpine, pieces, headOf, measure, available, banded])

  /* WHAT A MODEL'S PICTURE SHOWS, in the words the rows beside it are told apart by — the
     colourway, "WH" — or '' where it shows every one of them (`pictureShows`) */
  const shownOf = useCallback(
    (rows: readonly ViewRow[]): { shows: string; words: string[] } | null => {
      const pic = blockPicture(rows, image, spineLevel, blockOf, exactRowsOf)
      if (!pic) return null
      const words = split
        ? [
            ...new Set(
              rows
                .filter((r) => pic.depicted.includes(r.rowId))
                .map((r) => restOf(split, textOf(r, split.fieldId))),
            ),
          ]
        : []
      return { shows: pictureShows(words, pic.depicts, pic.of, noun), words }
    },
    [image, spineLevel, blockOf, split, textOf, noun],
  )

  /* SAID ONCE AT THE BAND, NOT UNDER EVERY RENDER. Where every picture of a series shows the
     same colourway — Roll-Up's eight renders are each of the white boat — the band says
     "each shown in WH" once, and the spines under it carry no caption (refine round,
     2026-10-21: "WH · 2 of 4 variants" stood under eight renders down one screen). */
  const shownOnce = useMemo(() => {
    const once = new Map<string, string>()
    const quiet = new Set<string>()
    if (!image || spineLevel < 1) return { said: once, quiet }
    for (const p of pieces) {
      if (p.kind !== 'band') continue
      const spines = nodesAt([p.node], spineLevel)
      const shows = spines.flatMap((n) => {
        const s = shownOf(collectLeaves(n))
        return s ? [s.shows] : []
      })
      const all = shownByAll(shows)
      if (all === '') continue
      once.set(p.key, all)
      for (const n of spines) quiet.add(n.key)
    }
    return { said: once, quiet }
  }, [image, spineLevel, pieces, shownOf])

  const spineOf = useCallback(
    (p: Extract<Piece, { kind: 'block' }>): SpineSays => {
      const { rows, name, count, code, figures, leads } = headOf(p)
      /* a value the rows already print in a column of their own is not said
         again beside them: SP700ST's one Cash figure stood on its spine as
         "Cash $79,760" beside a Cash column and the figure "HYP $79,760" */
      const shared = (said.groups.get(p.key) ?? []).filter((s) => !drawnIds.has(s.fieldId))
      const runs: FactRun[] = (table ? factLines(table, shared) : []).map((l) => ({
        key: l.sectionId,
        ...(l.accent ? { accent: l.accent } : {}),
        facts: l.facts,
      }))
      const fact = (s: string): number => measure(s, 'fact')
      const shut = p.shut || p.runs.length === 0
      const pic = blockPicture(rows, image, spineLevel, blockOf, exactRowsOf)
      const drawn = hand ? 0 : Math.max(1, leavesIn(p))
      const fit = hand
        ? { fit: 'words' as const, lines: 2, pictureH: pic ? m.pictureMaxH : 0 }
        : spineFit(drawn, m.rowH, pic !== null, { ...SPINE_TYPE, pictureMaxH: m.pictureMaxH })
      const figureLine = (fit.fit !== 'name' || shut || hand) && figures !== ''

      /* A SHUT LINE, AND A BAND: every section on one line, in the room its columns leave */
      if ((shut || banded) && !hand) {
        const one = packOneLine(runs, {
          width: available - SHUT_BOX.chrome - shutCols.name - shutCols.figures,
          measure: fact,
          more: moreNote,
          markW: SHUT_BOX.markW,
        })
        return {
          name,
          count,
          figures,
          figureLines: figures === '' ? [] : [figures],
          lines: [],
          one,
          picture: null,
          fit: fit.fit,
        }
      }

      /* THE WORDS COME FIRST. The render yields width to the name and to
         the figure per material — the first thing a customer asks — and a
         render that would be drawn narrower than 72 px goes to the record
         and the Pictures door instead of standing as a smudge */
      const inner = hand ? available - HAND_BOX.chrome : spineW - SPINE_BOX.padX
      /* THE FILE'S CODE IS SAID QUIETLY AFTER THE NAME WHERE THE LINE HAS ROOM FOR IT, and
         nowhere it would cut the name: a tablet's 300px spine, its words clear of the spine's
         press since 2026-09-28, had 240px for "Roll Up 230 KAM RU230KAM · 4 variants" at
         253 — so there the line is the name and its count, and the code is where the dealer
         orders by it, in the rows' own Model Code column beside it */
      const withCode = `${code} · ${count}`
      const counts =
        hand || code === '' || measure(name, 'name') + measure(` ${withCode}`, 'count') > inner
          ? count
          : withCode
      const need = Math.max(
        figureLine ? measure(figures, 'figures') : 0,
        measure(name, hand ? 'shut' : 'name') + measure(` ${counts}`, 'count'),
      )
      let picture: SpineSays['picture'] = null
      if (pic && fit.pictureH > 0) {
        const depicted = rows.filter((r) => pic.depicted.includes(r.rowId))
        const words = split
          ? [...new Set(depicted.map((r) => restOf(split, textOf(r, split.fieldId))))]
          : []
        /* THE CAPTION IS PART OF THE PICTURE'S HEIGHT. `spineFit` budgets the
           render against the block and not the line under it, so at 1920 a
           100px render in a four-variant block put "WH · 2 of 4 variants" 7px
           under the block's edge (measured 2026-09-24). The caption may use
           the bottom padding and no more. In a hand the caption is not drawn. */
        const h = hand
          ? fit.pictureH
          : Math.min(fit.pictureH, drawn * m.rowH - SPINE_TYPE.pad / 2 - CAPTION_H)
        /* never more than two fifths of the spine, and never more than the
           words leave it */
        const w = Math.min(
          Math.round((pic.held.w / pic.held.h) * h),
          Math.round(spineW * 0.4) || 160,
          inner - SPINE_BOX.gap - need,
        )
        if (w >= SPINE_BOX.pictureMinW) {
          picture = {
            held: pic.held,
            caption: shownOnce.quiet.has(p.key)
              ? ''
              : pictureShows(words, pic.depicts, pic.of, noun),
            alt: `${name}${words.length > 0 ? ` in ${words.join(', ')}` : ''}, ${pic.held.verdict === 'scene' ? 'on the water' : 'the maker’s render'}`,
            h: Math.round(Math.min(h, (w * pic.held.h) / pic.held.w)),
            w,
          }
        }
      }
      const wordsW = inner - (picture ? picture.w + SPINE_BOX.gap : 0)
      /* THE FIGURE IS NEVER CUT: where the spine is too narrow to say it on
         one line — a tablet's 300 px beside Patrol's "PVC $14,060–$15,120 ·
         HYP $18,440–$20,070" — it says it one material to a line, and the
         facts under it have a line less */
      const figureLines = !figureLine
        ? []
        : measure(figures, 'figures') <= wordsW
          ? [figures]
          : packFacts([{ key: 'figures', facts: leads }], leads.length, {
              width: wordsW,
              measure: (t) => measure(t, 'figures'),
              indent: 0,
              markW: 0,
            }).lines.map((l) => l.runs.map((r) => r.text).join(' '))

      /* A HAND'S HEAD says one line of what the model shares, every section on it */
      if (hand) {
        const one = packOneLine(runs, {
          width: wordsW,
          measure: fact,
          more: moreNote,
          markW: SHUT_BOX.markW,
        })
        return { name, count, figures, figureLines, lines: [], one, picture, fit: fit.fit }
      }
      const room = fit.fit === 'name' ? 0 : Math.max(0, fit.lines - figureLines.length)
      const packed = packFacts(runs, room, {
        width: wordsW,
        measure: fact,
        more: moreNote,
        indent: SPINE_BOX.indent,
        markW: SHUT_BOX.markW,
      })
      return {
        name,
        count: counts,
        figures,
        figureLines,
        lines: packed.lines,
        one: null,
        picture,
        fit: fit.fit,
      }
    },
    [
      headOf,
      table,
      said,
      drawnIds,
      measure,
      image,
      spineLevel,
      hand,
      banded,
      m,
      available,
      shutCols,
      spineW,
      blockOf,
      split,
      textOf,
      noun,
      shownOnce,
    ],
  )

  const bandOf = useCallback(
    (p: Extract<Piece, { kind: 'band' }>): BandSays => {
      const spines = nodesAt([p.node], spineLevel)
      const withPictures = image
        ? spines.filter(
            (n) => blockPicture(collectLeaves(n), image, spineLevel, blockOf, exactRowsOf) !== null,
          ).length
        : 0
      return {
        name: p.node.value === '' ? '(unassigned)' : p.node.value,
        count: `${spineNoun ? `${counted(spines.length, spineNoun)} · ` : ''}${counted(p.node.leafCount, noun)}`,
        says: table ? bandSays(table, said.groups.get(p.key) ?? []) : '',
        pictures:
          image && spineNoun && spineLevel >= 1
            ? picturesHeld(withPictures, spines.length, spineNoun, shownOnce.said.get(p.key))
            : '',
      }
    },
    [spineLevel, image, spineNoun, noun, table, said, blockOf, shownOnce],
  )

  /* ---- the address ------------------------------------------ */

  const cursorRow = useMemo(
    () => (cursorRowId ? layout.leafRows.find((r) => r.rowId === cursorRowId) : undefined),
    [cursorRowId, layout.leafRows],
  )
  const openRowId = peeking && cursorRow ? cursorRow.rowId : undefined

  const position = useMemo(
    (): SheetPosition => ({
      door: door === 'price' ? undefined : door,
      at: openRowId,
      find: query.trim() === '' ? undefined : query,
      chapter:
        chapterValue !== null && chapterValue !== chapters[0]?.value ? chapterValue : undefined,
      read: read,
      flip: flip === '' ? undefined : flip,
      show: show === '' ? undefined : show,
      rung: rung && rung !== prices[0]?.fieldId ? rung : undefined,
      fold: fold === '' ? undefined : fold,
      only: joinOnly(onlyList),
    }),
    [
      door,
      openRowId,
      query,
      chapterValue,
      chapters,
      read,
      flip,
      show,
      rung,
      prices,
      fold,
      onlyList,
    ],
  )
  const lastPosition = useRef('')
  useEffect(() => {
    if (!table) return
    const key = JSON.stringify(position)
    if (key === lastPosition.current) return
    lastPosition.current = key
    onPosition?.(position)
  }, [onPosition, position, table])

  /* IN A HAND, THE FIGURE JUST WRITTEN STANDS CLEAR OF ITS STEP (the verifier, 40-hand-warned): the
     step and its warning ride the foot of the record, and they stood over the Trade and Warranty
     under the Cash just changed. The record scrolls the changed fact and the two under it above
     the step — no further, and not at all where they already are — at once under reduced motion */
  useEffect(() => {
    if (!hand || !step || step.wasUndo) return
    const frame = requestAnimationFrame(() => {
      const over = body.current?.ownerDocument.querySelector<HTMLElement>('.sh-over')
      const active = over?.ownerDocument.activeElement
      const fact = active instanceof HTMLElement ? active.closest<HTMLElement>('.sh-fact') : null
      const foot = over?.querySelector<HTMLElement>('.sh-foot')
      if (!over || !fact || !foot || !over.contains(fact)) return
      const at = fact.getBoundingClientRect()
      const room = foot.getBoundingClientRect().top - at.bottom
      const want = at.height * 3
      if (room >= want) return
      over.scrollBy({ top: want - room, behavior: reducedMotion() ? 'auto' : 'smooth' })
    })
    return () => cancelAnimationFrame(frame)
  }, [hand, step])

  const go = useCallback(
    (next: Partial<SheetPosition>) => {
      setAsked({ key: incomingKey, want: next })
      onPosition?.({ ...position, ...next })
    },
    [incomingKey, onPosition, position],
  )

  /* A NEW `?at=` — a row found in the finder while this sheet is open —
     is read as the row it names, never as a flag. Adjusted during the
     render, as React asks of state that follows a prop: the address
     changed, the cursor follows it in the same pass. An address the
     screen itself wrote is the row already open, and changes nothing. */
  const [seenAt, setSeenAt] = useState(at)
  if (at !== seenAt) {
    setSeenAt(at)
    if (at !== '' && at !== cursorRowId) {
      setFocusRowId(at)
      setCursorRowId(at)
      setPeeking(true)
    }
  }

  /* ---- the writes, and the way back ---------------------------- */

  /* `detail` is what one cell's write changed (`changeSaid`), said after the
     store's own words so the step line names the price that moved */
  /* THE STEP LINE SAYS WHAT MOVED, NOT THE KIND OF ACT (the judge's G19): "Cash on Roll Up 230
     KAM · PVC · WH: $2,770 → $850", where it said "Cell edit · Highfield Inflatables ·" first —
     the engine's label, which names no price. Where a write has no detail, the store's own
     sentence stands. */
  const apply = useCallback(
    (command: CatalogueCommand, detail?: string, warn?: string[]): Written => {
      const outcome = catalogue.getState().apply(command)
      if ('refused' in outcome) {
        if (outcome.refused !== '') setRefused(outcome.refused)
        return { refused: outcome.refused }
      }
      setRefused(null)
      setStep({
        said: detail ?? outcome.said,
        eventId: outcome.event.id,
        wasUndo: false,
        detail,
        ...(warn && warn.length > 0 ? { warn } : {}),
      })
      return { said: outcome.said }
    },
    [],
  )

  const write = useCallback((w: Write): Written => apply(w.command), [apply])

  const commit = useCallback(
    (rowId: string, fieldId: string, text: string): Written => {
      if (!table) return { refused: NO_SHEET }
      const f = table.fields.find((x) => x.id === fieldId)
      if (!f) return { refused: 'That column is no longer on this table.' }
      const coerced = coerceCellText(text, f, refLabelsOf(f))
      if (!coerced.ok) return { refused: coerced.reason }
      const before = view.find((r) => r.rowId === rowId)
      const detail = before
        ? changeSaid(table, f, pinId ? (before.text[pinId] ?? '') : '', before, coerced.value)
        : undefined
      /* WHAT THE NEW FIGURE BREAKS, measured on the rest of the file before it is written */
      const warn = warningsFor(table, view, prices, costOf, rowId, fieldId, coerced.value).map(
        (w) => warningSaid(table, w),
      )
      return apply(updateCell(table.id, rowId, fieldId, coerced.value), detail, warn)
    },
    [apply, table, refLabelsOf, view, pinId, prices, costOf],
  )

  const goBack = useCallback(() => {
    if (!step) return
    const outcome = step.wasUndo
      ? catalogue.getState().redo()
      : catalogue.getState().undo(step.eventId)
    if ('refused' in outcome) {
      if (outcome.refused !== '') setRefused(outcome.refused)
      return
    }
    setRefused(null)
    /* "Undone — Cell edit · Highfield Inflatables" said which list and not which price: the
       write's own detail follows it back and forth (built-m3.md, the sheet) */
    setStep({
      said: step.detail ? `${step.wasUndo ? 'Put back' : 'Undone'} — ${step.detail}` : outcome.said,
      eventId: outcome.event.id,
      wasUndo: !step.wasUndo,
      detail: step.detail,
    })
  }, [step])

  const onUndo = useCallback(() => {
    const outcome = catalogue.getState().undo()
    if ('refused' in outcome) {
      if (outcome.refused !== '') setRefused(outcome.refused)
      return
    }
    setStep({ said: outcome.said, eventId: outcome.event.id, wasUndo: true })
  }, [])
  const onRedo = useCallback(() => {
    const outcome = catalogue.getState().redo()
    if ('refused' in outcome) {
      if (outcome.refused !== '') setRefused(outcome.refused)
      return
    }
    setStep({ said: outcome.said, eventId: outcome.event.id, wasUndo: false })
  }, [])

  const onDelete = useCallback(
    (rowId: string) => {
      if (!table) return
      const outcome = apply(deleteRow(table.id, rowId))
      if ('said' in outcome) setPeeking(false)
    },
    [apply, table],
  )

  const onAddRow = useCallback(
    (path: readonly string[], stepSaid: string) => {
      if (!table) return
      const values: Record<string, string> = {}
      levels.forEach((id, i) => {
        if (path[i] !== undefined && path[i] !== '') values[id] = path[i]!
      })
      const rowId = newId()
      const outcome = apply(addRow(table.id, values, rowId), stepSaid)
      if ('said' in outcome) setFocusRowId(rowId)
    },
    [apply, table, levels],
  )

  /* THE RECORD'S "ADD A VARIANT TO ROLL UP 230 KAM": a new row filed under
     the open row's own model, where every level of its path has a value */
  const addUnder = (path: readonly string[]): { label: string; press: () => void } | undefined => {
    if (!table || path.length === 0 || path.some((v) => v === '')) return undefined
    const model = spineName(table.id, path[path.length - 1]!).name
    return {
      label: `Add a ${noun.one} to ${model}`,
      press: () => onAddRow(path, `Added a ${noun.one} to ${model}`),
    }
  }

  /* COPY THIS LINE (the judge's G14): when a maker adds a colourway, the work is the sibling's
     prices and shared facts under a new code — so the copy carries every value of the line but
     three. Its code is left empty, because two lines cannot be ordered by one code; its picture
     is left off, because a picture belongs only to the line it depicts (CLAUDE.md); and where it
     came from in the file is left off, because it came from here. The step line says what to
     give it, and the record opens on it. */
  const copyOf = (row: ViewRow): { label: string; press: () => void } | undefined => {
    if (!table) return undefined
    const code = codeFieldOf(table)
    const source = table.fields.find(isSourceColumn)
    const values: Record<string, CellValue> = {}
    for (const f of table.fields) {
      if (f.type === 'formula' || f.type === 'image') continue
      if (f.id === code?.id || f.id === source?.id) continue
      const v = row.values[f.id]
      if (v !== undefined && v !== null) values[f.id] = v
    }
    const line =
      recordSaid(table, pinId ? (row.text[pinId] ?? '') : '', codeOfRow(table, row.text)) ||
      `this ${noun.one}`
    const needs = [code ? 'its own code' : '', image ? 'its own picture' : '']
      .filter((w) => w !== '')
      .join(' and ')
    return {
      label: `Copy as a new ${noun.one}`,
      press: () => {
        const rowId = newId()
        const outcome = apply(
          addRow(table.id, values, rowId),
          `Copied ${line} as a new ${noun.one}${needs ? `. Give it ${needs}.` : '.'}`,
        )
        if ('said' in outcome) {
          setFocusRowId(rowId)
          setCursorRowId(rowId)
          setPeeking(true)
        }
      },
    }
  }

  /* WHAT GOES ON A BOAT, ONE PRESS FROM ITS LINE (exposure.md: 3 presses and typing before) */
  const fitsOf = (row: ViewRow): { href: string; go: () => void } | undefined => {
    if (!table || table.kind !== 'boat') return undefined
    const href = fitmentOf(row.rowId)
    return { href, go: () => goTo?.(href) }
  }
  /* A LINE WITH NO NAME OF ITS OWN YET — one just added — is said by what it is and where it
     is filed: "A new variant of Roll Up 230 KAM", where the record read "(no name)" and its
     picture's offer stopped mid-sentence, "Add a picture of the" (the judge's J15) */
  /* AND IN A SENTENCE IT IS SAID WITHOUT ITS CAPITAL ARTICLE: the picture's offer is "Add a picture
     of the new variant of Roll Up 230 KAM", never "…of the A new variant…" (the verifier, J15) */
  const unnamedLine = (row: ViewRow, heading = true): string => {
    const model = spineLevel >= 0 ? (row.text[levels[spineLevel]!] ?? '').trim() : ''
    const spoken = model === '' || !table ? '' : spineName(table.id, model).name
    return `${heading ? 'A new' : 'new'} ${noun.one}${spoken ? ` of ${spoken}` : ''}`
  }

  /* A LINE A DEALER MAY PICTURE: a colourway, a motor, a trailer, a part, a package, a shelf */
  const optionOf = (row: ViewRow): LineOption | undefined => {
    if (!table) return undefined
    if (!PICTURED_KINDS.has(table.kind ?? '') && !PICTURED_SHELVES.has(table.id)) return undefined
    const imageField = table.fields.find((f) => f.type === 'image')
    const v = imageField ? row.values[imageField.id] : undefined
    const address =
      v !== undefined && v !== null && isImageValue(v) ? primaryImage(v)?.src : undefined
    return {
      table: table.id,
      row: row.rowId,
      ...(address ? { address } : {}),
      name:
        recordSaid(table, pinId ? (row.text[pinId] ?? '') : '', codeOfRow(table, row.text)) ||
        unnamedLine(row, false),
      ...(table.kind ? { kind: table.kind } : {}),
    }
  }

  /* ---- shutting and opening -------------------------------------- */

  /* A PRESS DOES WHAT ITS NAME SAYS, from what is DRAWN. The flip set
     names the blocks that differ from the reading, and the found row's
     model is held open whatever the set says — so toggling the set was
     a press that could change nothing: driven cold on 2026-09-23, "Shut
     SP560" after a finder landed on SP560 (HYP) B-B-B wrote `flip=` into
     the address and left all fifteen rows drawn, a control that silently
     did not work. Now the press asks for the opposite of what stands on
     the screen, and on the found row's own model it also ends the hold,
     because the dealer has just said where they want it. */
  const onToggle = useCallback(
    (key: string) => {
      const wantShut = !collapsed.has(key)
      const next = new Set(flipped)
      if ((reading === 'models') !== wantShut) next.add(key)
      else next.delete(key)
      if (key === atKey) setFocusRowId(null)
      go({ flip: joinList(next) })
    },
    [atKey, collapsed, flipped, go, reading],
  )

  /* ---- what is drawn ---------------------------------------- */

  if (!table) {
    return (
      <main className="sh" data-testid="sheet" data-read={answered ? '' : undefined}>
        <header className="sh-mast">
          <div className="sh-mast__id">
            <div className="sh-mast__name">
              <h1 className="sh-title">{open ? 'Not on the price list' : 'The price list'}</h1>
              {business ? <p className="sh-count">{business}</p> : null}
            </div>
          </div>
        </header>
        <div className="sh-blank">
          {problem !== null ? (
            <p role="alert" className="sh-blank__say">
              The sheet could not be read. {problem}
            </p>
          ) : !answered ? (
            <p className="sh-blank__say">Opening the price list…</p>
          ) : open ? (
            <p className="sh-blank__say">{noTable(tableId)}</p>
          ) : (
            <>
              <p className="sh-blank__say">{NO_SHEET}</p>
              <Button
                intent="primary"
                icon={ArrowRightIcon}
                onClick={openTheFile}
                refusedBecause={openTheFile ? undefined : NO_WAY_TO_THE_FILE}
              >
                Load the Master Price File
              </Button>
            </>
          )}
        </div>
      </main>
    )
  }

  const marked = markFor(table.name, 'dark')
  const spines = spineLevel >= 0 ? nodesAt(roots, spineLevel).length : 0
  const withPictures =
    image && spineLevel >= 1
      ? nodesAt(roots, spineLevel).filter(
          (n) => blockPicture(collectLeaves(n), image, spineLevel, blockOf, exactRowsOf) !== null,
        ).length
      : 0
  const rowPath = cursorRow ? levels.map((id) => cursorRow.text[id] ?? '') : []
  const hidden = hand ? spilled.map((f) => f.name) : []
  const firstRow = view[0]
  const headFacts = firstRow
    ? said.table
        .map((s) => table.fields.find((f) => f.id === s.fieldId))
        .filter((f): f is FieldDef => f !== undefined && f.type !== 'image' && !namesTheTable(f.id))
    : []
  const shutAll = reading === 'models'
  /* a hand's sentence about where the other columns went, while there is a list to press */
  const handSays =
    hand && hidden.length > 0 && door === 'price' && !(narrowed && searched.length === 0)

  const cardsFor = (): Card[] => {
    if (!image) return []
    const out: Card[] = []
    if (spineLevel >= 1) {
      /* the chapter being read, and what the find field narrowed it to —
         the same rows the price list is drawing */
      for (const n of nodesAt(buildGroups(shownRows, levels, textOf), spineLevel)) {
        const rows = collectLeaves(n)
        const pic = blockPicture(rows, image, spineLevel, blockOf, exactRowsOf)
        const linked = rows.some((r) => pictureOf(r, image, heldCopy)?.kind === 'link')
        const shown = shownOf(rows)
        const figures = rungId ? leadFigures(rows, rungId, split) : []
        out.push({
          key: n.key,
          name: spineName(table.id, n.value).name,
          under: n.path.slice(0, -1).join(' ▸ '),
          count: counted(rows.length, noun),
          picture: pic?.held ?? null,
          caption: shown?.shows ?? '',
          colour: shown && shown.shows !== '' ? shownColour(shown.words) : null,
          linkedOnly: !pic && linked,
          price: figuresText(figures),
          figures: figuresOf(figures),
          rowId: pic?.rowId ?? rows[0]?.rowId ?? '',
          recommended: recommendedOf(table, rows, refLabel),
        })
      }
      return out
    }
    const rungField = table.fields.find((f) => f.id === rungId)
    for (const r of shownRows) {
      const p = pictureOf(r, image, heldCopy)
      const price = rungField ? paintOf(table, rungField, r) : ''
      out.push({
        key: r.rowId,
        name: nameOfRow(table, r),
        under: levels[0] ? textOf(r, levels[0]) : '',
        count: '',
        picture: p?.kind === 'held' ? p.held : null,
        caption: '',
        colour: null,
        linkedOnly: p?.kind === 'link',
        price,
        figures: price === '' ? [] : [{ lead: '', figure: price }],
        rowId: r.rowId,
        recommended: null,
      })
    }
    return out
  }
  const cards: Card[] = door === 'pictures' ? cardsFor() : []
  /* THE DOOR SAYS WHAT IS BEHIND IT: how many of what it holds have a
     picture here, on a table read by model and on one whose rows are
     the models alike — "Pictures 0 of 125 trailers", never "Pictures 125
     trailers" over a door with none on it */
  const heldRows =
    image && spineLevel < 1
      ? view.filter((r) => pictureOf(r, image, heldCopy)?.kind === 'held').length
      : 0

  /* WHAT THE RECORD SAYS ABOUT ITS LINE BEYOND ITS FACTS: what the file held where this computer
     changed it, and who and when where the session kept it; that it is new here; its heading
     while it has no name of its own; the copy act; the prices first */
  const leadSectionId = table.fields.find((f) => f.id === prices[0]?.fieldId)?.sectionId
  const wasOf =
    (row: ViewRow) =>
    (fieldId: string): string | undefined => {
      const was = changedOf(row.rowId, fieldId)
      if (was === undefined) return undefined
      const last = lastChangeOf(events, row.rowId, fieldId)
      const when = last ? dayOf(last.at) : ''
      const who = last
        ? ` · changed ${last.by ? `by ${last.by} ` : 'here '}${when ? `on ${when}` : ''}`.trimEnd()
        : ''
      return `The Master Price File had ${was === '' ? 'nothing' : was}${who}`
    }
  const recordExtras = (row: ViewRow) => ({
    onCopy: copyOf(row),
    unnamed: unnamedLine(row),
    cents,
    wasOf: knowsFile ? wasOf(row) : undefined,
    added: knowsFile && changes.added.has(row.rowId),
    ...(leadSectionId ? { leadSectionId } : {}),
  })

  const renderRecord = (row: ViewRow) => (
    <Record
      table={table}
      row={row}
      path={levels.map((id) => row.text[id] ?? '')}
      pinFieldId={pinId}
      heldCopy={heldCopy}
      commit={commit}
      data={dataOf(catalogue.getState())}
      onDelete={onDelete}
      onAdd={addUnder(levels.map((id) => row.text[id] ?? ''))}
      {...recordExtras(row)}
      fits={fitsOf(row)}
      option={optionOf(row)}
      onClose={() => {
        setPeeking(false)
        body.current?.querySelector<HTMLElement>('.sh-outline')?.focus()
      }}
      hand={false}
    />
  )

  /* THE STEP LINE: the last write, with its way back — a white plate that rises from the
     list's foot the first time a write is said, a done tick in the given ink, and Undo's own
     glyph turning the way the write will turn. IN A HAND IT RIDES THE RECORD: there the record
     is the screen, and a step line left at the list's foot stood UNDER it, so a press meant for
     Undo landed on the record's "Add a variant / Delete this row" (built-critique-m3.md major
     12, the 2026-10-22 critique's major before it). Whichever ground is in front carries it. */
  const stepLine =
    step || refused ? (
      <div className="sh-foot" data-ground="plate">
        {step ? (
          <output className="sh-step" data-testid="last-step">
            {/* taken back is not done: the way-back glyph, in the quiet ink */}
            <span
              className="sh-step__done"
              data-kind={step.wasUndo ? 'undone' : 'step'}
              aria-hidden="true"
            >
              <Icon
                glyph={step.wasUndo ? ArrowCounterClockwiseIcon : CheckCircleIcon}
                weight={step.wasUndo ? 'bold' : 'fill'}
              />
            </span>
            <span className="sh-step__said">{step.said}</span>
            <Button
              intent="secondary"
              size="sm"
              icon={step.wasUndo ? ArrowClockwiseIcon : ArrowCounterClockwiseIcon}
              onClick={goBack}
            >
              {step.wasUndo ? 'Put it back' : 'Undo'}
            </Button>
          </output>
        ) : null}
        {/* THE WARNING BESIDE ITS UNDO (the judge's G11): what the figure just written breaks
            that the rest of the list keeps, with the measurement — a warning in the warning's
            ink, never a refusal, and "Keep it" says the dealer meant it */}
        {step && !step.wasUndo && step.warn && step.warn.length > 0 ? (
          <output className="sh-warn" data-testid="step-warning">
            <span className="sh-warn__glyph" aria-hidden="true">
              <Icon glyph={WarningIcon} weight="fill" />
            </span>
            <span className="sh-warn__words">
              {step.warn.map((w) => (
                <span key={w} className="sh-warn__line">
                  {w}
                </span>
              ))}
            </span>
            <Button intent="quiet" size="sm" onClick={() => setStep({ ...step, warn: undefined })}>
              Keep it
            </Button>
          </output>
        ) : null}
        {refused ? (
          <p className="sh-alarm" role="alert">
            <Refusal>{refused}</Refusal>
          </p>
        ) : null}
      </div>
    ) : null

  const recordIsTheScreen = hand && peeking && !!cursorRow
  /* WHAT THE DETAILS COVER, while they are the screen: out of reach of a key and of a reader, as
     it is out of sight (it was a Tab stop under a full-screen page, and read as if in view) */
  const behind = recordIsTheScreen ? ({ inert: true, 'aria-hidden': true } as const) : {}

  return (
    <main
      className="sh"
      data-testid="sheet"
      data-read={answered ? '' : undefined}
      data-door={door}
      data-hand={hand ? '' : undefined}
    >
      {/* the spine's words are measured here, in the faces they are drawn in (measure.ts) */}
      <span className="sh-probe" ref={probe} aria-hidden="true" />
      <header className="sh-mast" {...behind}>
        <div className="sh-mast__id">
          {marked ? (
            <img
              className="sh-mast__mark"
              src={marked.mark.at}
              width={marked.mark.w}
              height={marked.mark.h}
              alt=""
              /* THE MAKER'S MARK ARRIVES FROM WHERE IT WAS PRESSED. Data names its maker's
                 mark `mark-<table>` on the shelf and on the spread's cover
                 (src/screens/data/turn.ts), and this one carries the same name, so the
                 route's View Transition flies the mark from Data's cover into this head and
                 back — the one thing that travels between the two screens, and a picture,
                 never a figure. */
              style={{ viewTransitionName: sharedName(`mark-${table.id}`) }}
            />
          ) : null}
          <div className="sh-mast__name">
            {/* the heading's name is the table's whole name; the mark says
                the maker's part of it to the eye, and the words the rest */}
            <h1 className="sh-title" aria-label={table.name}>
              {marked && marked.rest !== '' ? marked.rest : table.name}
            </h1>
            <p className="sh-count">
              <b>{counted(view.length, noun)}</b>
              {spineNoun && spineLevel >= 1 ? ` of ${counted(spines, spineNoun)}` : ''}
              {branch && roots.length > 0 ? ` in ${counted(roots.length, branch)}` : ''}
              {' · '}
              {table.fields.length} columns
              {costFields.length > 0 ? `, ${costFields.length} of them ${COST_WORD}` : ''}
              {finding
                ? ` · ${searched.length.toLocaleString('en-AU')} match “${query.trim()}”`
                : onlyList.length > 0
                  ? ` · ${searched.length.toLocaleString('en-AU')} shown`
                  : ''}
            </p>
          </div>
        </div>

        {headFacts.length > 0 && firstRow ? (
          <dl className="sh-said" aria-label={`Said once for all ${counted(view.length, noun)}`}>
            <p className="sh-said__lead">Same on all {counted(view.length, noun)}</p>
            {(headFacts.length > 3 ? headFacts.slice(0, 2) : headFacts).map((f) => (
              <div key={f.id} className="sh-said__fact">
                <dt className="sh-said__name">
                  {columnNote(f.id) !== '' ? (
                    /* WHAT A FIGURE SAID ONCE IS, where its name does not say (the verifier:
                       "Actual $105" stood unexplained over Labour Rates) — one press, its sentence */
                    <Popover
                      side="bottom"
                      align="start"
                      title={f.name}
                      trigger={
                        <button
                          type="button"
                          className="sh-said__ask"
                          aria-label={`What ${f.name} is`}
                        >
                          {f.name}
                          <Icon glyph={InfoIcon} />
                        </button>
                      }
                    >
                      <p className="sh-said__note">{columnNote(f.id)}</p>
                    </Popover>
                  ) : (
                    f.name
                  )}
                  {isCost(table, f) ? <span className="sh-said__cost">{COST_WORD}</span> : null}
                </dt>
                <dd className="sh-said__value">{paintOf(table, f, firstRow, cents)}</dd>
              </div>
            ))}
            {headFacts.length > 3 ? (
              <div className="sh-said__fact">
                <dt className="sh-said__name">and {headFacts.length - 2} more</dt>
                <dd className="sh-said__value">in the columns menu</dd>
              </div>
            ) : null}
          </dl>
        ) : (
          /* the middle of the head, empty where the list says nothing once — and hidden where the
             said-once facts are, so the find field keeps its own column at a tablet (on Parts it
             fell under the title, and stood over the bar under it, the judge's G2) */
          <span className="sh-said" aria-hidden="true" />
        )}

        <div className="sh-find">
          <Input
            id="sh-find-field"
            ref={field}
            type="search"
            icon={MagnifyingGlassIcon}
            aria-label={`Find a ${noun.one}`}
            value={query}
            onValueChange={(v) => {
              setQuery(v)
              setFocusRowId(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault()
                setQuery('')
              } else if (e.key === 'ArrowDown' || e.key === 'Enter') {
                e.preventDefault()
                body.current?.querySelector<HTMLElement>('.sh-outline')?.focus()
              }
            }}
            placeholder={`Find a ${spineNoun?.one ?? noun.one}, a code or a word`}
          />
          {door !== 'pictures' ? (
            <Ask
              table={table}
              questions={questions}
              compare={compareFields}
              asked={onlyList.length}
              onAsk={(o) => {
                const next = [...onlyList.filter((x) => onlyToken(x) !== onlyToken(o)), o]
                setFocusRowId(null)
                setPeeking(false)
                go({ only: joinOnly(next), at: undefined })
              }}
            />
          ) : null}
        </div>
      </header>

      <nav
        className="sh-bar"
        aria-label="The series, and the ways to see them"
        data-testid="sheet-tools"
        {...behind}
      >
        {chapters.length > 0 && narrowed && searched.length === 0 ? (
          /* NOTHING FOUND IN ANY SERIES IS SAID ONCE, not as seven tabs each counting 0 */
          <p className="sh-bar__what">
            {`${counted(chapters.length, branch ?? { one: 'series', many: 'series' })}, none with a match`}
          </p>
        ) : chapters.length > 0 ? (
          /* THE SERIES, EACH A LINK, AND THE LIT ONE ON A WHITE THUMB THAT TRAVELS — the
             kit's segment (src/ui/Segmented.tsx) drawn on the file's blue bar: `motion`'s
             shared layout moves the thumb from the series that was lit to the one pressed on
             the travel spring, and `layoutScroll` keeps it true while the strip scrolls
             sideways in a hand. Under reduced motion, or while a caret is in a field, the
             thumb is simply there (MotionRoot). They stay links, so a series can still be
             opened in a new tab. */
          <motion.div className="sh-chapters" ref={strip} layoutScroll>
            {chapters.map((c) => {
              const lit = c.value === chapterValue
              const count = narrowed
                ? searched.filter((r) => textOf(r, levels[0]!).trim() === c.value).length
                : c.count
              return (
                <a
                  key={c.key}
                  className="sh-chapter"
                  href={`?in=${encodeURIComponent(c.value)}`}
                  aria-current={lit ? 'location' : undefined}
                  data-lit={lit ? '' : undefined}
                  onClick={(e) => {
                    e.preventDefault()
                    if (!lit) opened(e.detail > 0)
                    setQuery('')
                    setFocusRowId(null)
                    setPeeking(false)
                    go({
                      chapter: c.value,
                      find: undefined,
                      only: undefined,
                      at: undefined,
                      flip: undefined,
                    })
                  }}
                >
                  {lit ? (
                    <motion.span
                      className="sh-chapter__thumb"
                      layoutId="sh-chapter-thumb"
                      transition={move.travel}
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="sh-chapter__word">{c.value}</span>{' '}
                  <span className="sh-chapter__count">{count}</span>
                </a>
              )
            })}
          </motion.div>
        ) : (
          <p className="sh-bar__what">
            {spineNoun && spines > 0
              ? `${counted(spines, spineNoun)}, each said once beside its ${noun.many}`
              : counted(view.length, noun)}
          </p>
        )}

        <motion.div className="sh-bar__right" layoutScroll>
          {door === 'price' && hasSpine && spineNoun ? (
            /* THE KIT'S VEILED ACT — the dark glass behind a white edge that stands on a
               coloured ground — with the glyph of what the press does to the list: fold it
               to its models, or open every one of them out again */
            <span className="sh-reading">
              <Button
                intent="veiled"
                size="sm"
                icon={shutAll ? ArrowsOutLineVerticalIcon : ArrowsInLineVerticalIcon}
                aria-pressed={shutAll}
                onClick={() =>
                  go({
                    read: shutAll ? 'variants' : 'models',
                    flip: undefined,
                  })
                }
              >
                {shutAll ? `Open every ${spineNoun.one}` : `Only the ${spineNoun.many}`}
              </Button>
            </span>
          ) : null}
          {/* THE THREE DOORS, each with its glyph — a list, pictures, columns — and the door
              that is open on the same travelling white thumb as the series */}
          <div className="sh-doors" aria-label="How to read it">
            <Door
              href="?"
              here={door === 'price'}
              glyph={ListBulletsIcon}
              onPress={(pointer) => {
                if (door !== 'price') opened(pointer)
                go({ door: undefined })
              }}
            >
              Price list
            </Door>
            {image ? (
              <Door
                href="?door=pictures"
                here={door === 'pictures'}
                glyph={ImagesIcon}
                count={
                  spineLevel >= 1 && spineNoun
                    ? `${withPictures} of ${counted(spines, spineNoun)}`
                    : `${heldRows} of ${counted(view.length, noun)}`
                }
                onPress={(pointer) => {
                  if (door !== 'pictures') opened(pointer)
                  go({ door: 'pictures', at: undefined })
                }}
              >
                Pictures
              </Door>
            ) : null}
            <Door
              href="?door=every"
              here={door === 'every'}
              glyph={ColumnsIcon}
              count={String(table.fields.length)}
              onPress={(pointer) => {
                if (door !== 'every') opened(pointer)
                go({ door: 'every' })
              }}
            >
              Every column
            </Door>
          </div>
        </motion.div>
      </nav>

      {handSays || noPrice || onlyList.length > 0 ? (
        <div className="sh-notes" {...behind}>
          {handSays ? (
            <p className="sh-hand" data-testid="sheet-hand">
              {handSentence(
                hidden,
                (table.role !== 'join' && table.kind ? kindNoun(table.kind) : null) ?? noun,
              )}
            </p>
          ) : null}
          {/* A LIST WITH NO DECLARED PRICE SAYS SO WHERE ITS PRICE WOULD BE LIT (the judge's G3):
              Dealer Fit carries Sell and Act Sell, and which of them is the price is a decision
              for Prices, not one this screen makes by guessing */}
          {noPrice ? (
            <p className="sh-noprice" data-testid="sheet-noprice">
              No column of {table.name} is declared its price yet, so none is lit here.{' '}
              <a
                className="sh-noprice__go"
                href={pricesOf(table.id)}
                onClick={(e) => {
                  if (!goTo) return
                  e.preventDefault()
                  goTo(pricesOf(table.id))
                }}
              >
                Prices decides it
              </a>
            </p>
          ) : null}
          {onlyList.length > 0 ? (
            <section className="sh-asked" aria-label="Showing only the lines that answer">
              <span className="sh-asked__lead">Only</span>
              {onlyList.map((o) => (
                <button
                  key={onlyToken(o)}
                  type="button"
                  className="sh-asked__chip"
                  aria-label={`Stop showing only: ${onlySaid(table, o)}`}
                  onClick={() =>
                    go({ only: joinOnly(onlyList.filter((x) => onlyToken(x) !== onlyToken(o))) })
                  }
                >
                  {onlySaid(table, o)}
                  <Icon glyph={XIcon} />
                </button>
              ))}
              <span className="sh-asked__count">
                {searched.length.toLocaleString('en-AU')} of {counted(view.length, noun)}
              </span>
              <Button intent="quiet" size="sm" onClick={() => go({ only: undefined })}>
                Show every {noun.one}
              </Button>
            </section>
          ) : null}
        </div>
      ) : null}

      <div className="sh-body" ref={body} {...behind}>
        {narrowed && searched.length === 0 ? (
          <Nothing
            table={table}
            query={finding ? query.trim() : ''}
            asked={onlyList.map((o) => onlySaid(table, o))}
            others={others}
            noun={noun}
            goTo={goTo}
            onClearFind={() => {
              setQuery('')
              field.current?.focus()
            }}
            onClearOnly={() => go({ only: undefined })}
          />
        ) : door === 'pictures' ? (
          <Gallery
            tableName={table.name}
            cards={cards}
            noun={spineLevel >= 1 && spineNoun ? spineNoun : noun}
            onPriceList={() => go({ door: undefined })}
            onOpen={(card) => {
              setFocusRowId(card.rowId)
              setCursorRowId(card.rowId)
              setPeeking(true)
              go({ door: undefined, at: card.rowId, chapter: undefined, flip: undefined })
            }}
          />
        ) : (
          <Grid
            table={table}
            layout={layout}
            pieces={pieces}
            slots={slots}
            fields={fields}
            bands={bands}
            onFold={(sectionId) => {
              const next = new Set(foldSet)
              if (next.has(sectionId)) next.delete(sectionId)
              else next.add(sectionId)
              go({ fold: joinList(next) })
            }}
            split={split}
            leadCell={door === 'price'}
            spineOf={spineOf}
            bandOf={bandOf}
            spineW={spineW}
            shutCols={shutCols}
            spineHead={
              levels[spineLevel]
                ? (table.fields.find((f) => f.id === levels[spineLevel])?.name ?? '')
                : ''
            }
            hasSpine={hasSpine}
            hand={hand}
            banded={banded}
            changedOf={knowsFile ? changedOf : undefined}
            cents={cents}
            named={named}
            colourKey={
              colourCodes.length > 0 ? (
                <ColourKey codes={colourCodes} named={named ?? {}} noun={noun} apply={apply} />
              ) : undefined
            }
            rowH={m.rowH}
            leadW={m.lead}
            tailW={TAIL_W}
            rungFieldId={door === 'price' ? rungId : undefined}
            onRung={(id) => go({ rung: id })}
            collapsed={collapsed}
            onToggle={onToggle}
            write={write}
            commit={commit}
            refLabelsOf={refLabelsOf}
            cursorRowId={cursorRowId}
            onCursor={setCursorRowId}
            peeking={peeking}
            onPeek={setPeeking}
            onSelection={setSelection}
            onUndo={onUndo}
            onRedo={onRedo}
            ariaLabel={table.name}
            focusRowId={focusRowId}
            renderRecord={renderRecord}
            heldCopy={heldCopy}
            /* the step line's 48px and the 12px it floats above the list's foot, and a warning's
               two lines more where one is said */
            foot={step || refused ? (step?.warn && !step.wasUndo ? 124 : 60) : 0}
            more={
              door === 'price' ? (
                <More
                  table={table}
                  held={held}
                  shown={shownFields}
                  spineNoun={spineNoun}
                  rowCount={view.length}
                  noun={noun}
                  onShow={(id) => go({ show: joinList([...shownIds, id]) })}
                  onHide={(id) => go({ show: joinList(shownIds.filter((x) => x !== id)) })}
                  apply={apply}
                />
              ) : null
            }
          />
        )}

        {selection && door !== 'pictures' ? (
          <Selection
            table={table}
            rows={layout.leafRows}
            fields={fields}
            sel={selection}
            noun={noun}
            write={write}
            refLabelsOf={refLabelsOf}
            prices={prices}
            costOf={costOf}
            twin={twin}
          />
        ) : null}

        {recordIsTheScreen ? null : stepLine}
      </div>

      {recordIsTheScreen && cursorRow ? (
        /* IN A HAND THE LINE'S DETAILS ARE THE SCREEN, over the whole list until Back: what they
           are, said, so a reader and a ruler both know the list under them is not in view */
        <dialog open className="sh-over" data-testid="sheet-over" aria-label="The line’s details">
          <Record
            table={table}
            row={cursorRow}
            path={rowPath}
            pinFieldId={pinId}
            heldCopy={heldCopy}
            commit={commit}
            data={dataOf(catalogue.getState())}
            onDelete={onDelete}
            onAdd={addUnder(levels.map((id) => cursorRow.text[id] ?? ''))}
            {...recordExtras(cursorRow)}
            fits={fitsOf(cursorRow)}
            option={optionOf(cursorRow)}
            onClose={() => setPeeking(false)}
            hand
          />
          {stepLine}
        </dialog>
      ) : null}
    </main>
  )
}

/* ---------------------------------------------------------- */
/* Sentences the screen builds from the engine's readings      */
/* ---------------------------------------------------------- */

/** "Cash $850 is under this line's landed cost, $1,671.43. The rest of the list keeps Cash
 *  at or above it on 587 of 587 lines with both." */
function warningSaid(table: EntityDef, w: PriceWarning): string {
  const f = table.fields.find((x) => x.id === w.rule.fieldId)
  const c = table.fields.find((x) => x.id === w.rule.than)
  if (!f || !c) return ''
  return `${f.name} ${figureSaid(table, f, w.value)} is under this line’s ${c.name}, ${figureSaid(table, c, w.than)}. The rest of the list keeps ${f.name} at or above it ${ruleSaid(w.rule)}.`
}

const DAY = new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short' })

/** "3 Nov", from an event's own stamp. */
function dayOf(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : DAY.format(d)
}

/* ---------------------------------------------------------- */
/* A door of the sheet                                         */
/* ---------------------------------------------------------- */

/**
 * ONE OF THE THREE WAYS TO READ THE TABLE — a real link, so a door opens in a new tab, with
 * its glyph before its word and what is behind it counted after. The open one carries the
 * bar's travelling white thumb (the chapters' own, under another name), so the eye follows
 * the press from the door it left to the one it opened.
 */
function Door({
  href,
  here,
  glyph,
  count,
  onPress,
  children,
}: {
  href: string
  here: boolean
  glyph: Glyph
  count?: string
  /** `pointer` is whether a pointer pressed it — a key's press opens its door unmoved */
  onPress: (pointer: boolean) => void
  children: string
}) {
  return (
    <a
      className="sh-door"
      href={href}
      aria-current={here ? 'true' : undefined}
      onClick={(e) => {
        e.preventDefault()
        onPress(e.detail > 0)
      }}
    >
      {here ? (
        <motion.span
          className="sh-door__thumb"
          layoutId="sh-door-thumb"
          transition={move.travel}
          aria-hidden="true"
        />
      ) : null}
      <span className="sh-door__glyph" aria-hidden="true">
        <Icon glyph={glyph} />
      </span>
      <span className="sh-door__word">{children}</span>
      {count ? (
        <>
          {' '}
          <span className="sh-door__count">{count}</span>
        </>
      ) : null}
    </a>
  )
}

/* ---------------------------------------------------------- */
/* Asking the values: the questions, and a comparison         */
/* ---------------------------------------------------------- */

const OPS: { value: 'at-least' | 'at-most'; label: string }[] = [
  { value: 'at-least', label: 'at least' },
  { value: 'at-most', label: 'at most' },
]

/**
 * SHOW ONLY THE LINES THAT… (the judge's G9). The questions this list's own columns answer, each
 * with how many lines answer it here, and a rule's question with the measurement behind it; then
 * a comparison on any figure the list carries — "Max HP at least 150". A question pressed is put
 * in the address (`?only=`), so the list it shows is a link, and the chips over the list take it
 * away one at a time.
 */
function Ask({
  table,
  questions,
  compare,
  asked,
  onAsk,
}: {
  table: EntityDef
  questions: readonly { only: Only; said: string; count: number; rule: string }[]
  compare: readonly FieldDef[]
  asked: number
  onAsk: (only: Only) => void
}) {
  const [open, setOpen] = useState(false)
  const [col, setCol] = useState<string | null>(compare[0]?.id ?? null)
  const [op, setOp] = useState<'at-least' | 'at-most'>('at-least')
  const [figure, setFigure] = useState('')
  const [refusedWhy, setRefusedWhy] = useState<string | null>(null)
  const ask = (o: Only): void => {
    onAsk(o)
    setOpen(false)
    setRefusedWhy(null)
  }
  const compareNow = (): void => {
    const typed = figure.replace(/[$,\s]/g, '')
    const value = Number(typed)
    if (!col) {
      setRefusedWhy('Choose a column to compare first.')
      return
    }
    if (typed === '' || !Number.isFinite(value)) {
      setRefusedWhy(
        typed === '' ? 'Type a figure to compare with.' : `“${figure.trim()}” is not a number.`,
      )
      return
    }
    ask({ kind: op, fieldId: col, value })
  }
  const trigger = (
    <button type="button" className="sh-ask" data-testid="sheet-ask">
      <Icon glyph={FunnelSimpleIcon} />
      <span className="sh-ask__word">Show only</span>
      {asked > 0 ? <span className="sh-ask__count">{asked}</span> : null}
    </button>
  )
  return (
    <Popover
      trigger={trigger}
      title={`Show only the lines of ${table.name} that…`}
      open={open}
      onOpenChange={setOpen}
      align="end"
    >
      <div className="sh-asks" data-testid="sheet-asks">
        {questions.length > 0 ? (
          <ul className="sh-asks__list">
            {questions.map((q) => (
              <li key={onlyToken(q.only)}>
                <button type="button" className="sh-asks__q" onClick={() => ask(q.only)}>
                  <span className="sh-asks__said">{q.said}</span>
                  <span className="sh-asks__count">{q.count.toLocaleString('en-AU')}</span>
                  {q.rule ? (
                    <span className="sh-asks__rule">The list keeps it the other way {q.rule}</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {compare.length > 0 ? (
          <form
            className="sh-compare"
            aria-label="Compare a figure"
            onSubmit={(e) => {
              e.preventDefault()
              compareNow()
            }}
          >
            <p className="sh-compare__head">Or compare a figure</p>
            <div className="sh-compare__row">
              <Select
                options={compare.map((f) => ({ value: f.id, label: f.name }))}
                value={col}
                onValueChange={setCol}
                placeholder="A column"
              />
              <Select options={OPS} value={op} onValueChange={(v) => v && setOp(v)} />
              <Input
                aria-label="The figure to compare with"
                value={figure}
                onValueChange={setFigure}
                inputMode="decimal"
                placeholder="150"
              />
              <Button intent="primary" size="sm" type="submit">
                Show these
              </Button>
            </div>
            {refusedWhy ? (
              <p className="sh-alarm" role="alert">
                <Refusal>{refusedWhy}</Refusal>
              </p>
            ) : null}
          </form>
        ) : null}
      </div>
    </Popover>
  )
}

/* ---------------------------------------------------------- */
/* Nothing found                                               */
/* ---------------------------------------------------------- */

/**
 * A SEARCH OR A QUESTION THAT FINDS NOTHING IS A SENTENCE WHERE THE LIST WOULD BE (the judge's
 * G8): column heads over 690px of blank page said nothing but "0 match" in 11px type. It says
 * which list and what was asked, then the other lists of the price file that do carry the words,
 * counted, and the way back.
 */
function Nothing({
  table,
  query,
  asked,
  others,
  noun,
  goTo,
  onClearFind,
  onClearOnly,
}: {
  table: EntityDef
  query: string
  asked: readonly string[]
  others: readonly { tableId: string; name: string; count: number }[]
  noun: LeafNoun
  goTo?: (href: string) => void
  onClearFind: () => void
  onClearOnly: () => void
}) {
  const questions = asked.map((a) => `“${a}”`).join(' and ')
  const say =
    query !== '' && asked.length > 0
      ? `Nothing on ${table.name} matches “${query}” and answers ${questions}.`
      : query !== ''
        ? `Nothing on ${table.name} matches “${query}”.`
        : `No ${noun.one} of ${table.name} answers ${questions}.`
  return (
    <section className="sh-nothing" data-testid="sheet-nothing" aria-label="Nothing found">
      <p className="sh-nothing__say">{say}</p>
      {query !== '' ? (
        others.length > 0 ? (
          <>
            <p className="sh-nothing__why">
              “{query}” is on {others.length === 1 ? 'one other list' : 'other lists'} of the Master
              Price File:
            </p>
            <ul className="sh-nothing__lists">
              {others.map((o) => {
                const href = `/data/${encodeURIComponent(o.tableId)}?find=${encodeURIComponent(query)}`
                return (
                  <li key={o.tableId}>
                    <a
                      className="sh-nothing__list"
                      href={href}
                      onClick={(e) => {
                        if (!goTo) return
                        e.preventDefault()
                        goTo(href)
                      }}
                    >
                      <span className="sh-nothing__name">{o.name}</span>
                      <span className="sh-nothing__count">
                        {o.count.toLocaleString('en-AU')} {o.count === 1 ? 'line' : 'lines'}
                      </span>
                      <Icon glyph={ArrowRightIcon} />
                    </a>
                  </li>
                )
              })}
            </ul>
          </>
        ) : (
          <p className="sh-nothing__why">
            No other list of the Master Price File carries it either.
          </p>
        )
      ) : null}
      <div className="sh-nothing__acts">
        {query !== '' ? (
          <Button intent="secondary" size="sm" icon={XIcon} onClick={onClearFind}>
            Clear the search
          </Button>
        ) : null}
        {asked.length > 0 ? (
          <Button intent="secondary" size="sm" icon={XIcon} onClick={onClearOnly}>
            Show every {noun.one}
          </Button>
        ) : null}
      </div>
    </section>
  )
}

/* ---------------------------------------------------------- */
/* Over a selection: the mixed set, the fill, and a move       */
/* ---------------------------------------------------------- */

const MOVES: { kind: MoveKind; label: string; placeholder: string }[] = [
  { kind: 'percent', label: 'By %', placeholder: '4 or −2.5' },
  { kind: 'add', label: 'By $', placeholder: '100 or −50' },
  { kind: 'round', label: 'Round to $', placeholder: '10' },
]

/** How many lines of a move the plate prints before and after; the rest are counted. */
const MOVE_SHOWN = 3

/** A line's twin in the base material, for the move that reads from it — or 'base' for a line
 *  in the base material itself, or undefined for one with no twin. */
interface Twin {
  base: string
  of: (row: ViewRow) => ViewRow | 'base' | undefined
}

function Selection({
  table,
  rows,
  fields,
  sel,
  noun,
  write,
  refLabelsOf,
  prices,
  costOf,
  twin,
}: {
  table: EntityDef
  rows: ViewRow[]
  fields: readonly FieldDef[]
  sel: GridSel
  noun: LeafNoun
  write: (w: Write) => Written
  refLabelsOf: (field: FieldDef) => Map<string, string> | undefined
  prices: readonly { fieldId: string }[]
  costOf: (f: FieldDef) => boolean
  /** the base material a line may be priced from, where the list reads one (`twinText`) */
  twin?: Twin
}) {
  const [text, setText] = useState('')
  const [said, setSaid] = useState<string | null>(null)
  const [kind, setKind] = useState<MoveKind>('percent')
  const [by, setBy] = useState('')
  const rowSet = new Set<number>()
  const colSet = new Set<number>()
  for (const r of sel.ranges) {
    const r0 = Math.min(r.anchor.row, r.focus.row)
    const r1 = Math.max(r.anchor.row, r.focus.row)
    const c0 = Math.min(r.anchor.col, r.focus.col)
    const c1 = Math.max(r.anchor.col, r.focus.col)
    for (let i = r0; i <= r1; i += 1) rowSet.add(i)
    for (let j = c0; j <= c1; j += 1) colSet.add(j)
  }
  const rowIndexes = [...rowSet].toSorted((a, b) => a - b)
  const colIndexes = [...colSet].toSorted((a, b) => a - b)
  const shownCols = colIndexes.slice(0, 3)
  const range = sel.ranges[sel.ranges.length - 1]!
  const one = colIndexes.length === 1 ? fields[colIndexes[0]!] : undefined
  const setAll = (): void => {
    if (!one) return
    const w = setAllWrite(table, rows, one, rowIndexes, text, refLabelsOf(one))
    const out = w.cells > 0 ? write(w) : { refused: w.skipped[0] ?? 'Nothing to set.' }
    setSaid('refused' in out ? out.refused : null)
  }

  /* A MOVE ON A COLUMN OF FIGURES (the judge's G10): each line before and after, worked out
     before anything is written, then one step with one Undo */
  const figures = one !== undefined && one.type === 'number'
  /* HYPALON FROM ITS PVC LINE (the judge's missing arithmetic): offered where the list reads a
     material and the selection holds a line that is not in the first of them */
  const twinFits =
    twin !== undefined && rowIndexes.some((i) => rows[i] && twin.of(rows[i]) !== 'base')
  const kinds = twinFits
    ? [...MOVES, { kind: 'twin' as const, label: `${twin.base} + $`, placeholder: '2500 or 0' }]
    : MOVES
  const read = figures && by.trim() !== '' ? readMove(kind, by, twin?.base) : null
  const plan: (MovePlan & { based?: number; alone?: number }) | null =
    one && figures && read && !('refused' in read)
      ? read.kind === 'twin'
        ? twin
          ? planTwin(rows, one, rowIndexes, read, twin.of)
          : null
        : planMove(rows, one, rowIndexes, read)
      : null
  /* a plan that cannot be written says so before the press, and its figures below $0 are not
     drawn as if they could be (the verifier, 36-move-refused) */
  const refusal = plan ? planRefusal(plan) : null
  const rules = useMemo(
    () => (figures ? keptRules(table, rows, prices, costOf) : []),
    [figures, table, rows, prices, costOf],
  )
  const byRow = useMemo(() => new Map(rows.map((r) => [r.rowId, r])), [rows])
  const under =
    plan && one
      ? rules
          .filter((r) => r.fieldId === one.id)
          .map((r) => ({
            rule: r,
            lines: plan.lines.filter((l) => {
              const than = byRow.get(l.rowId)?.values[r.than]
              return typeof than === 'number' && l.after < than
            }).length,
          }))
          .filter((u) => u.lines > 0)
      : []
  const figureOf = (n: number): string => (one ? figureSaid(table, one, n) : String(n))
  const moveNow = (): void => {
    if (!one || !read) {
      setSaid('Type how much first.')
      return
    }
    if ('refused' in read) {
      setSaid(read.refused)
      return
    }
    if (!plan) return
    const w = moveWrite(table, one, plan, read, noun)
    if ('refused' in w) {
      setSaid(w.refused)
      return
    }
    const out = write({ command: w.command, cells: w.cells, skipped: [] })
    setSaid('refused' in out ? out.refused : null)
    if (!('refused' in out)) setBy('')
  }
  const valueSaid = (f: FieldDef, v: string): string => {
    if (v === '') return '(blank)'
    const n = Number(v)
    return f.type === 'number' && Number.isFinite(n) ? figureSaid(table, f, n) : v
  }
  const how = kinds.find((m) => m.kind === kind) ?? MOVES[0]!

  return (
    <section
      className="sh-selection"
      data-testid="sheet-selection"
      data-ground="plate"
      aria-label="The selection"
    >
      <h2 className="sh-selection__head">
        {counted(rowIndexes.length, noun)}
        <span className="sh-selection__count">
          across {colIndexes.length} {colIndexes.length === 1 ? 'column' : 'columns'}
        </span>
      </h2>
      <div className="sh-selection__sets">
        {shownCols.map((c) => {
          const f = fields[c]
          if (!f) return null
          const set = mixedSet(rows, f, rowIndexes)
          return (
            <section key={f.id} className="sh-mixed" aria-label={f.name}>
              <h3 className="sh-mixed__head">{f.name}</h3>
              <ul className="sh-mixed__list">
                {set.slice(0, 4).map((v) => (
                  <li key={v.text} className="sh-mixed__row">
                    <span className="sh-mixed__value">{valueSaid(f, v.text)}</span>
                    <span className="sh-mixed__count">× {v.count}</span>
                  </li>
                ))}
                {set.length > 4 ? (
                  <li className="sh-mixed__row sh-mixed__more">and {set.length - 4} more values</li>
                ) : null}
              </ul>
            </section>
          )
        })}
      </div>
      {figures && one ? (
        <form
          className="sh-move"
          aria-label={`Change every selected ${one.name}`}
          onSubmit={(e) => {
            e.preventDefault()
            moveNow()
          }}
        >
          <p className="sh-move__head">Change every {one.name}</p>
          <div className="sh-move__row">
            <fieldset className="sh-move__kinds">
              <legend className="sh-vh">How</legend>
              {kinds.map((m) => (
                <button
                  key={m.kind}
                  type="button"
                  className="sh-move__kind"
                  aria-pressed={kind === m.kind}
                  onClick={() => setKind(m.kind)}
                >
                  {m.label}
                </button>
              ))}
            </fieldset>
            <Input
              aria-label={`${one.name}, ${how.label}`}
              value={by}
              onValueChange={setBy}
              inputMode="decimal"
              mono
              placeholder={how.placeholder}
            />
            <Button intent="primary" size="sm" type="submit" icon={CheckIcon}>
              {plan && !refusal && plan.lines.length > 0 ? `Change ${plan.lines.length}` : 'Change'}
            </Button>
          </div>
          {plan && refusal ? (
            <p className="sh-move__refused" data-testid="sheet-move-plan">
              <Refusal>{refusal}</Refusal>
            </p>
          ) : plan ? (
            <div className="sh-move__plan" data-testid="sheet-move-plan">
              <ul className="sh-move__lines">
                {plan.lines.slice(0, MOVE_SHOWN).map((l) => (
                  <li key={l.rowId} className="sh-move__line">
                    <span className="sh-move__before">{figureOf(l.before)}</span>
                    <span aria-hidden="true">→</span>
                    <span className="sh-move__after">{figureOf(l.after)}</span>
                  </li>
                ))}
              </ul>
              {plan.lines.length > MOVE_SHOWN ||
              plan.same > 0 ||
              plan.blank > 0 ||
              (plan.based ?? 0) > 0 ||
              (plan.alone ?? 0) > 0 ? (
                <p className="sh-move__more">
                  {[
                    plan.lines.length > MOVE_SHOWN
                      ? `and ${plan.lines.length - MOVE_SHOWN} more`
                      : '',
                    plan.same > 0 ? `${plan.same} already there` : '',
                    plan.blank > 0 ? `${plan.blank} with no ${one.name}, left as they are` : '',
                    plan.based ? `${plan.based} in ${twin?.base ?? ''}, read from` : '',
                    plan.alone
                      ? `${plan.alone} with no ${twin?.base ?? ''} line to read, left as they are`
                      : '',
                  ]
                    .filter((w) => w !== '')
                    .join(' · ')}
                </p>
              ) : null}
              {under.map((u) => {
                const c = table.fields.find((f) => f.id === u.rule.than)
                return (
                  <output key={u.rule.than} className="sh-move__warn">
                    <Icon glyph={WarningIcon} weight="fill" />
                    <span>
                      {u.lines} would be under their {c?.name ?? 'other figure'}, which the list
                      keeps {one.name} at or above {ruleSaid(u.rule)}.
                    </span>
                  </output>
                )
              })}
            </div>
          ) : null}
        </form>
      ) : null}
      <div className="sh-selection__acts">
        {rowIndexes.length > 1 && range.anchor.row !== range.focus.row ? (
          <Button
            intent="secondary"
            size="sm"
            icon={ArrowLineDownIcon}
            onClick={() => {
              const w = fillDownWrite(table, rows, fields, range)
              const out = w.cells > 0 ? write(w) : { refused: w.skipped[0] ?? 'Nothing to fill.' }
              setSaid('refused' in out ? out.refused : null)
            }}
          >
            Fill down from the top row
            <span className="sh-selection__key">
              <Kbd>Mod D</Kbd>
            </span>
          </Button>
        ) : null}
        {one ? (
          <div className="sh-selection__set">
            <Input
              aria-label={`A value for every selected ${one.name}`}
              value={text}
              onValueChange={setText}
              placeholder={`Set every ${one.name} to…`}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return
                e.preventDefault()
                setAll()
              }}
            />
            <Button intent="secondary" size="sm" icon={CheckIcon} onClick={setAll}>
              Set all {rowIndexes.length}
            </Button>
          </div>
        ) : null}
        {said ? (
          <p className="sh-alarm" role="alert">
            <Refusal>{said}</Refusal>
          </p>
        ) : null}
      </div>
    </section>
  )
}
