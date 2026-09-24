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
   ============================================================ */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Input, Kbd } from '@/ui'
import { displayFieldOf, rowLabel, type EntityDef, type FieldDef } from '@/domain/model'
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
  layoutGroups,
  leafFieldsOf,
  leafNoun,
  type GroupNode,
  type LeafNoun,
} from '@/domain/catalogue/table/grouping'
import { buildSections } from '@/domain/catalogue/table/sections'
import { bandsOf, layoutColumns } from '@/domain/catalogue/table/sections'
import { DEFAULT_COL_W, FIT_MIN_COL_W, ROW_H, type GridSel } from '@/domain/catalogue/table/helpers'
import { labelIndex, outlineLevels, viewRowsOf } from '@/domain/catalogue/table/outline'
import { saidOnce } from '@/domain/catalogue/table/saidOnce'
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
import { priceLevelsFor } from '@/domain/quote/pricing'
import { priceReadOf } from '@/domain/modules/read'
import { Grid, type BandSays, type Slot, type SpineSays, type Written } from './Grid'
import { Record } from './Record'
import { Gallery } from './Gallery'
import { More } from './More'
import { heldCopy, markFor } from './pictures'
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
  paintOf,
  pictureCaption,
  pictureOf,
  picturesHeld,
  recommendedOf,
  setAllWrite,
  fillDownWrite,
  type Card,
  type Write,
} from './read'
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
}

export interface SheetProps extends SheetPosition {
  tableId: string
  business?: string | null
  onPosition?: (position: SheetPosition) => void
  openTheFile?: () => void
  now?: () => Date
}

interface Step {
  said: string
  eventId: string
  wasUndo: boolean
}

const THE_CLOCK = (): Date => new Date()

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
 * `.sh-spine__in` pads 16 at the edge and 12 at the rows, a render
 * stands 12 from the words, and a fact line is indented 12 under its
 * accent square (6 px, and 6 of air).
 */
const SPINE_BOX = { padX: 28, gap: 12, indent: 12, pictureMinW: 72 }

/**
 * A SHUT MODEL'S LINE: the toggle's 24 px, three gaps of 16 between the
 * name, the figure and the facts, the same 28 of padding, and the 20 a
 * scrollbar keeps (`scrollbar-gutter: stable` on the list). A section
 * on the line costs its square and the air around it (`markW`).
 */
const SHUT_BOX = { chrome: 28 + 24 + 3 * 16 + 20, markW: 26 }

/** A HAND'S HEAD: 16 + 12 of padding, the caret and the gap before it. */
const HAND_BOX = { chrome: 16 + 12 + 12 + 10, gap: 12 }

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
): number {
  /* the nineteenth value in twenty, not the longest: one variant typed
     as a sentence (`540 open (PVC) LG-W-DG`) should ellipsise in its
     cell rather than push the code out of a tablet's grid */
  const lengths: number[] = []
  const step = Math.max(1, Math.floor(rows.length / 400))
  for (let i = 0; i < rows.length; i += step) lengths.push(paint(rows[i]!).length)
  lengths.sort((a, b) => a - b)
  const longest = lengths.length === 0 ? 0 : lengths[Math.floor((lengths.length - 1) * 0.95)]!
  const words = longest * 7.4 + 28
  const head = field.name.length * 8.2 + 28
  return Math.round(Math.min(ceiling, Math.max(floor, words, head)))
}

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
  onPosition,
  openTheFile,
  now = THE_CLOCK,
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
  }
  const incomingKey = JSON.stringify(incoming)
  const [asked, setAsked] = useState<{ key: string; want: Partial<SheetPosition> } | null>(null)
  const live =
    asked !== null && asked.key === incomingKey ? { ...incoming, ...asked.want } : incoming
  const door: Door = live.door ?? 'price'
  const { chapter, read, flip, show, rung } = live
  const fold = live.fold ?? ''

  const status = useCatalogue((s) => s.status)
  const problem = useCatalogue((s) => s.problem)
  const tables = useCatalogue((s) => s.tables)
  const allRows = useCatalogue((s) => s.rows)
  const index = useCatalogue((s) => s.index)

  const table: EntityDef | undefined = tables[tableId]
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

  /* ---- what is in view -------------------------------------- */

  const narrowed = query.trim() !== ''
  const searched = useMemo(
    () => (table && narrowed ? applyView(view, table.fields, { search: query }) : view),
    [table, narrowed, query, view],
  )
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
  const reading: Reading = read ?? (hand && spineLevel >= 0 ? 'models' : 'variants')
  const flipped = useMemo(() => new Set(splitList(flip)), [flip])
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
          const w = Math.max(FIT_MIN_COL_W, DEFAULT_COL_W[s.field.type])
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
              : m.extra
    /* a column is as wide as its words, between its job's floor and a
       ceiling a third again as wide — a motor's name is longer than a
       colourway code, and a figure never needs more than its floor */
    const widths = new Map<string, number>()
    const widthOfCol = (c: { field: FieldDef; job: string }): number => {
      const known = widths.get(c.field.id)
      if (known !== undefined) return known
      const floor = floorOf(c.job)
      const w =
        !table || c.job === 'price'
          ? floor
          : c.job === 'mark'
            ? widthFor(c.field, [], () => '', floor, floor * 1.5)
            : widthFor(
                c.field,
                view,
                (r) =>
                  split && c.field.id === split.fieldId
                    ? restOf(split, textOf(r, split.fieldId))
                    : paintOf(table, c.field, r),
                floor,
                Math.round(floor * (c.job === 'name' ? 2.2 : 1.4)),
              )
      widths.set(c.field.id, w)
      return w
    }
    const all = [
      ...chosen.columns,
      ...chosen.extras.map((f) => ({ field: f, job: 'varies' as const })),
    ]
    const priority = [
      ...all.filter((c) => c.job === 'name'),
      ...all.filter((c) => c.field.id === rungId),
      ...all.filter((c) => c.job === 'code'),
      ...all.filter((c) => c.job === 'price' && c.field.id !== rungId),
      ...all.filter((c) => c.job === 'mark'),
      ...all.filter((c) => c.job === 'varies'),
    ]
    let room =
      available > 0
        ? available - (hasSpine && !hand ? m.spine : 0) - (split ? m.lead : 0) - m.tail
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
  }, [door, every, chosen, rungId, available, hasSpine, hand, m, split, table, view, textOf])

  const fields = useMemo(() => slots.flatMap((s) => (s.kind === 'field' ? [s.field] : [])), [slots])
  const drawnIds = useMemo(() => new Set(fields.map((f) => f.id)), [fields])
  const held: HeldColumn[] = useMemo(
    () => [...spilled.map((f) => ({ field: f, where: 'other' as const })), ...chosen.held],
    [spilled, chosen.held],
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
  const addressOf = useCallback(
    (row: ViewRow): string | undefined => {
      if (!image) return undefined
      const p = pictureOf(row, image, heldCopy)
      return p?.kind === 'held' ? p.held.address : p?.kind === 'link' ? p.address : undefined
    },
    [image],
  )

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
    hasSpine && !hand
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
      const name = p.node.value === '' ? '(unassigned)' : p.node.value
      const whole =
        roots.length > 0 ? nodesAt(roots, spineLevel).find((n) => n.key === p.key) : undefined
      const count =
        narrowed && whole && whole.leafCount !== rows.length
          ? `${rows.length} of ${counted(whole.leafCount, noun)}`
          : counted(rows.length, noun)
      const each = rungId ? leadFigures(rows, rungId, split) : []
      const figures = figuresText(each)
      /* the same figure one material at a time, for a spine too narrow to say it on one line */
      const leads = each.map((f) => figuresText([f]))
      return { rows, name, count, figures, leads }
    },
    [roots, spineLevel, narrowed, noun, rungId, split],
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
      if (p.kind !== 'block' || !(p.shut || p.runs.length === 0)) continue
      const h = headOf(p)
      name = Math.max(name, measure(h.name, 'shut') + measure(` ${h.count}`, 'count'))
      figures = Math.max(figures, measure(h.figures, 'figures'))
    }
    return { name: Math.min(name, Math.round(available / 3)), figures }
  }, [hand, hasSpine, pieces, headOf, measure, available])

  const spineOf = useCallback(
    (p: Extract<Piece, { kind: 'block' }>): SpineSays => {
      const { rows, name, count, figures, leads } = headOf(p)
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
      const pic = blockPicture(rows, image, spineLevel, heldCopy)
      const drawn = hand ? 0 : Math.max(1, leavesIn(p))
      const fit = hand
        ? { fit: 'words' as const, lines: 2, pictureH: pic ? m.pictureMaxH : 0 }
        : spineFit(drawn, m.rowH, pic !== null, { ...SPINE_TYPE, pictureMaxH: m.pictureMaxH })
      const figureLine = (fit.fit !== 'name' || shut || hand) && figures !== ''

      /* A SHUT LINE: every section on one line, in the room its columns leave */
      if (shut && !hand) {
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
      const need = Math.max(
        figureLine ? measure(figures, 'figures') : 0,
        measure(name, hand ? 'shut' : 'name') + measure(` ${count}`, 'count'),
      )
      let picture: SpineSays['picture'] = null
      if (pic && fit.pictureH > 0) {
        const found = rows.find((r) => r.rowId === pic.rowId)
        const address = found ? addressOf(found) : undefined
        const depicted = rows.filter((r) => addressOf(r) === address)
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
            caption: pictureCaption(words, pic.depicts, pic.of, noun),
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
        count,
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
      m,
      available,
      shutCols,
      spineW,
      addressOf,
      split,
      textOf,
      noun,
    ],
  )

  const bandOf = useCallback(
    (p: Extract<Piece, { kind: 'band' }>): BandSays => {
      const spines = nodesAt([p.node], spineLevel)
      const withPictures = image
        ? spines.filter((n) => blockPicture(collectLeaves(n), image, spineLevel, heldCopy) !== null)
            .length
        : 0
      return {
        name: p.node.value === '' ? '(unassigned)' : p.node.value,
        count: `${spineNoun ? `${counted(spines.length, spineNoun)} · ` : ''}${counted(p.node.leafCount, noun)}`,
        says: table ? bandSays(table, said.groups.get(p.key) ?? []) : '',
        pictures:
          image && spineNoun && spineLevel >= 1
            ? picturesHeld(withPictures, spines.length, spineNoun)
            : '',
      }
    },
    [spineLevel, image, spineNoun, noun, table, said],
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
    }),
    [door, openRowId, query, chapterValue, chapters, read, flip, show, rung, prices, fold],
  )
  const lastPosition = useRef('')
  useEffect(() => {
    if (!table) return
    const key = JSON.stringify(position)
    if (key === lastPosition.current) return
    lastPosition.current = key
    onPosition?.(position)
  }, [onPosition, position, table])

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

  const apply = useCallback((command: CatalogueCommand): Written => {
    const outcome = catalogue.getState().apply(command)
    if ('refused' in outcome) {
      if (outcome.refused !== '') setRefused(outcome.refused)
      return { refused: outcome.refused }
    }
    setRefused(null)
    setStep({ said: outcome.said, eventId: outcome.event.id, wasUndo: false })
    return { said: outcome.said }
  }, [])

  const write = useCallback((w: Write): Written => apply(w.command), [apply])

  const commit = useCallback(
    (rowId: string, fieldId: string, text: string): Written => {
      if (!table) return { refused: NO_SHEET }
      const f = table.fields.find((x) => x.id === fieldId)
      if (!f) return { refused: 'That column is no longer on this table.' }
      const coerced = coerceCellText(text, f, refLabelsOf(f))
      if (!coerced.ok) return { refused: coerced.reason }
      return apply(updateCell(table.id, rowId, fieldId, coerced.value))
    },
    [apply, table, refLabelsOf],
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
    setStep({ said: outcome.said, eventId: outcome.event.id, wasUndo: !step.wasUndo })
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
    (path: readonly string[]) => {
      if (!table) return
      const values: Record<string, string> = {}
      levels.forEach((id, i) => {
        if (path[i] !== undefined && path[i] !== '') values[id] = path[i]!
      })
      const rowId = newId()
      const outcome = apply(addRow(table.id, values, rowId))
      if ('said' in outcome) setFocusRowId(rowId)
    },
    [apply, table, levels],
  )

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
              <h1 className="sh-title">{open ? 'No such table' : 'The price file'}</h1>
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
            <p className="sh-blank__say">Looking for a price file in this browser…</p>
          ) : open ? (
            <p className="sh-blank__say">{noTable(tableId)}</p>
          ) : (
            <>
              <p className="sh-blank__say">{NO_SHEET}</p>
              <Button
                intent="primary"
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
          (n) => blockPicture(collectLeaves(n), image, spineLevel, heldCopy) !== null,
        ).length
      : 0
  const rowPath = cursorRow ? levels.map((id) => cursorRow.text[id] ?? '') : []
  const hidden = hand ? spilled.map((f) => f.name) : []
  const firstRow = view[0]
  const headFacts = firstRow
    ? said.table
        .map((s) => table.fields.find((f) => f.id === s.fieldId))
        .filter((f): f is FieldDef => f !== undefined && f.type !== 'image')
    : []
  const shutAll = reading === 'models'

  const cardsFor = (): Card[] => {
    if (!image) return []
    const out: Card[] = []
    if (spineLevel >= 1) {
      /* the chapter being read, and what the find field narrowed it to —
         the same rows the price list is drawing */
      for (const n of nodesAt(buildGroups(shownRows, levels, textOf), spineLevel)) {
        const rows = collectLeaves(n)
        const pic = blockPicture(rows, image, spineLevel, heldCopy)
        const linked = rows.some((r) => pictureOf(r, image, heldCopy)?.kind === 'link')
        const found = pic ? rows.find((r) => r.rowId === pic.rowId) : undefined
        const address = found ? addressOf(found) : undefined
        const words =
          split && pic
            ? [
                ...new Set(
                  rows
                    .filter((r) => addressOf(r) === address)
                    .map((r) => restOf(split, textOf(r, split.fieldId))),
                ),
              ]
            : []
        const figures = rungId ? leadFigures(rows, rungId, split) : []
        out.push({
          key: n.key,
          name: n.value,
          under: n.path.slice(0, -1).join(' ▸ '),
          count: counted(rows.length, noun),
          picture: pic?.held ?? null,
          caption: pic ? pictureCaption(words, pic.depicts, pic.of, noun) : '',
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
      onClose={() => {
        setPeeking(false)
        body.current?.querySelector<HTMLElement>('.sh-outline')?.focus()
      }}
      hand={false}
    />
  )

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
      <header className="sh-mast">
        <div className="sh-mast__id">
          {marked ? (
            <img
              className="sh-mast__mark"
              src={marked.mark.at}
              width={marked.mark.w}
              height={marked.mark.h}
              alt=""
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
              {narrowed
                ? ` · ${searched.length.toLocaleString('en-AU')} match “${query.trim()}”`
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
                  {f.name}
                  {isCost(table, f) ? <span className="sh-said__cost">{COST_WORD}</span> : null}
                </dt>
                <dd className="sh-said__value">{paintOf(table, f, firstRow)}</dd>
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
          <span />
        )}

        <div className="sh-find">
          <Input
            id="sh-find-field"
            ref={field}
            type="search"
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
          <span className="sh-find__key">
            <Kbd>/</Kbd>
          </span>
        </div>
      </header>

      <nav className="sh-bar" aria-label="Chapters and doors" data-testid="sheet-tools">
        {chapters.length > 0 ? (
          <div className="sh-chapters" ref={strip}>
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
                    setQuery('')
                    setFocusRowId(null)
                    setPeeking(false)
                    go({ chapter: c.value, find: undefined, at: undefined, flip: undefined })
                  }}
                >
                  {c.value} <span className="sh-chapter__count">{count}</span>
                </a>
              )
            })}
          </div>
        ) : (
          <p className="sh-bar__what">
            {spineNoun && spines > 0
              ? `${counted(spines, spineNoun)}, each said once beside its ${noun.many}`
              : counted(view.length, noun)}
          </p>
        )}

        <div className="sh-bar__right">
          {door === 'price' && hasSpine && spineNoun ? (
            <button
              type="button"
              className="sh-reading"
              aria-pressed={shutAll}
              onClick={() =>
                go({
                  read: shutAll ? 'variants' : 'models',
                  flip: undefined,
                })
              }
            >
              {shutAll ? `Open every ${spineNoun.one}` : `Only the ${spineNoun.many}`}
            </button>
          ) : null}
          <div className="sh-doors" aria-label="How to read it">
            <a
              className="sh-door"
              href="?"
              aria-current={door === 'price' ? 'true' : undefined}
              onClick={(e) => {
                e.preventDefault()
                go({ door: undefined })
              }}
            >
              Price list
            </a>
            {image ? (
              <a
                className="sh-door"
                href="?door=pictures"
                aria-current={door === 'pictures' ? 'true' : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  go({ door: 'pictures', at: undefined })
                }}
              >
                Pictures{' '}
                <span className="sh-door__count">
                  {spineLevel >= 1 && spineNoun
                    ? `${withPictures} of ${counted(spines, spineNoun)}`
                    : `${heldRows} of ${counted(view.length, noun)}`}
                </span>
              </a>
            ) : null}
            <a
              className="sh-door"
              href="?door=every"
              aria-current={door === 'every' ? 'true' : undefined}
              onClick={(e) => {
                e.preventDefault()
                go({ door: 'every' })
              }}
            >
              Every column <span className="sh-door__count">{table.fields.length}</span>
            </a>
          </div>
        </div>
      </nav>

      {hand && hidden.length > 0 && door === 'price' ? (
        <p className="sh-hand" data-testid="sheet-hand">
          {handSentence(hidden)}
        </p>
      ) : null}

      <div className="sh-body" ref={body}>
        {door === 'pictures' ? (
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
            rowH={m.rowH}
            leadW={m.lead}
            tailW={TAIL_W}
            rungFieldId={door === 'price' ? rungId : undefined}
            onRung={(id) => go({ rung: id })}
            collapsed={collapsed}
            onToggle={onToggle}
            onAddRow={onAddRow}
            write={write}
            commit={commit}
            refLabelsOf={refLabelsOf}
            cursorRowId={cursorRowId}
            onCursor={setCursorRowId}
            peeking={peeking}
            onPeek={setPeeking}
            onSelection={setSelection}
            onFindFocus={() => field.current?.focus()}
            onUndo={onUndo}
            onRedo={onRedo}
            now={now}
            ariaLabel={table.name}
            focusRowId={focusRowId}
            renderRecord={renderRecord}
            heldCopy={heldCopy}
            noun={noun}
            foot={step || refused ? 48 : 0}
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
          />
        ) : null}

        {step || refused ? (
          <div className="sh-foot">
            {step ? (
              <output className="sh-step" data-testid="last-step">
                <span className="sh-step__said">{step.said}</span>
                <Button intent="secondary" size="sm" onClick={goBack}>
                  {step.wasUndo ? 'Put it back' : 'Undo'}
                </Button>
              </output>
            ) : null}
            {refused ? (
              <p className="sh-alarm" role="alert">
                {refused}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {hand && peeking && cursorRow ? (
        <div className="sh-over" data-testid="sheet-over">
          <Record
            table={table}
            row={cursorRow}
            path={rowPath}
            pinFieldId={pinId}
            heldCopy={heldCopy}
            commit={commit}
            data={dataOf(catalogue.getState())}
            onDelete={onDelete}
            onClose={() => setPeeking(false)}
            hand
          />
        </div>
      ) : null}
    </main>
  )
}

/* ---------------------------------------------------------- */
/* Over a selection: the mixed set, then the fill               */
/* ---------------------------------------------------------- */

function Selection({
  table,
  rows,
  fields,
  sel,
  noun,
  write,
  refLabelsOf,
}: {
  table: EntityDef
  rows: ViewRow[]
  fields: readonly FieldDef[]
  sel: GridSel
  noun: LeafNoun
  write: (w: Write) => Written
  refLabelsOf: (field: FieldDef) => Map<string, string> | undefined
}) {
  const [text, setText] = useState('')
  const [said, setSaid] = useState<string | null>(null)
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

  return (
    <section className="sh-selection" data-testid="sheet-selection" aria-label="The selection">
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
                {set.slice(0, 6).map((v) => (
                  <li key={v.text} className="sh-mixed__row">
                    <span className="sh-mixed__value">{v.text === '' ? '(blank)' : v.text}</span>
                    <span className="sh-mixed__count">× {v.count}</span>
                  </li>
                ))}
                {set.length > 6 ? (
                  <li className="sh-mixed__row sh-mixed__more">and {set.length - 6} more values</li>
                ) : null}
              </ul>
            </section>
          )
        })}
      </div>
      <div className="sh-selection__acts">
        {rowIndexes.length > 1 && range.anchor.row !== range.focus.row ? (
          <Button
            intent="secondary"
            size="sm"
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
            <Button intent="primary" size="sm" onClick={setAll}>
              Set all {rowIndexes.length}
            </Button>
          </div>
        ) : null}
        {said ? (
          <p className="sh-alarm" role="alert">
            {said}
          </p>
        ) : null}
      </div>
    </section>
  )
}
