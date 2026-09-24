/* ============================================================
   THE PRICE LIST'S GRID — the rows a dealer works in, drawn like the
   maker's own price list: each model one block, its SPINE down the
   block's left edge saying once what the model's variants share and
   carrying its held render, and the rows saying only what differs
   (docs/directions/sheet-redesign/a-the-price-list.html).

   TWO LINT RULES ARE TURNED OFF FOR THIS FILE, for the reasons the
   quotes register gives at its own head (`src/screens/quotes/Quotes.tsx`),
   which hold here word for word: the density ruler reads WRITTEN
   `role="row"` attributes, and a grid whose one tab stop owns the
   whole keyboard vocabulary (`aria-activedescendant`) is deliberately
   not a grid of two thousand tab stops.

   WHAT THE ENGINE OWNS AND WHAT THIS FILE OWNS. `resolveKey` maps a
   keydown to an intent; `layoutGroups` decides which rows are
   addressable and in what order — the leading word (PVC, HYP) is a
   level of that grouping, so the order on screen IS the engine's —
   and `coerceCellText` writes the pill's sentence; `batch` makes a
   fill one step. The SPINE and the LEADING WORD are rowheaders, never
   cells: navigation, paste and fill never learn that they exist, the
   same way they never learned that sections or drawers did. This file
   owns the DOM: which element is the active cell, where the editor
   mounts, where the record opens, and what scrolls when the cursor
   leaves the window.

   A BLOCK IS ONE CSS GRID. The spine spans its rows (`grid-row: 1 /
   span n`), a leading word spans its run, and each row is `display:
   contents`, so every column lines up down the block and the density
   ruler reads a row by the union of its cells — the quotes register's
   own measurement of 2026-09-22. The rows' heights are an explicit
   list, never `auto`, so nothing a spine says can make its block
   taller: `spineFit` has already decided how much it may say.

   THE BLOCKS ARE VIRTUALISED, a model and its rows drawn whole, with
   react-virtuoso as the owner's own list — the reason `Outline.tsx`
   gave for 2,937 rows still holds for Parts and the pairings, and the
   price list keeps every row an addressable row rather than windowing
   by hiding them.
   ============================================================ */
/* eslint-disable jsx-a11y/prefer-tag-over-role, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ClipboardEvent as ReactClipboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import { Virtuoso, type VirtuosoHandle, type ListRange } from 'react-virtuoso'
import type { ColumnSection, EntityDef, FieldDef } from '@/domain/model'
import { Input, Kbd, Swatches, closesStage, isField, stageKeyOf } from '@/ui'
import { colourwayOf, splitVariant, type Colourway } from '@/domain/quote/colourway'
import {
  clampCell,
  normalizeRange,
  parseTsv,
  resolveKey,
  serializeTsv,
  type CellRef,
  type Range,
  type ViewRow,
} from '@/domain/catalogue/table/core'
import type { GridLayout } from '@/domain/catalogue/table/grouping'
import {
  fullySelectedRows,
  primaryRange,
  selContains,
  singleSel,
  type GridSel,
} from '@/domain/catalogue/table/helpers'
import {
  restOf,
  type LeadSplit,
  type PackedLine,
  type PackedOneLine,
  type Piece,
} from '@/domain/catalogue/table/priceList'
import type { HeaderBand } from '@/domain/catalogue/table/sections'
import type { Held } from './pictures'
import {
  clearWrite,
  COST_WORD,
  fillDownWrite,
  HELD_AS_A_LINK,
  isCost,
  paintOf,
  pasteWrite,
  PICTURE_CELL_REFUSAL,
  pictureOf,
  seedOf,
  type Write,
} from './read'

/* ---------------------------------------------------------- */
/* The seam                                                    */
/* ---------------------------------------------------------- */

/** What a write comes back as: the engine's sentence, or its refusal. */
export type Written = { said: string } | { refused: string }

/** One column slot: a field the grid addresses, or a folded section's chip. */
export type Slot =
  | { kind: 'field'; field: FieldDef; col: number; w: number; job: string }
  | { kind: 'fold'; section: ColumnSection; count: number; w: number }

/** What a spine says, decided by the screen from the engine's readings. */
export interface SpineSays {
  name: string
  count: string
  figures: string
  /** the same figure as the spine draws it: one line, or one material to a line where it is narrow */
  figureLines: string[]
  /** what the rows share, laid into the spine's lines whole (`packFacts`) */
  lines: PackedLine[]
  /** the same on one line — a shut model, a hand's head (`packOneLine`) */
  one: PackedOneLine | null
  picture: { held: Held; caption: string; alt: string; h: number; w: number } | null
  fit: 'name' | 'words' | 'full'
}

export interface BandSays {
  name: string
  count: string
  says: string
  pictures: string
}

export interface GridProps {
  table: EntityDef
  layout: GridLayout
  pieces: readonly Piece[]
  slots: readonly Slot[]
  /** the addressable columns; index === grid column */
  fields: readonly FieldDef[]
  /** the section bands over the column heads — the every-column door only */
  bands?: readonly HeaderBand[]
  onFold?: (sectionId: string) => void
  split: LeadSplit | null
  /** draw the leading word as its own spanning cell (the price list) or not (every column) */
  leadCell: boolean
  spineOf: (piece: Extract<Piece, { kind: 'block' }>) => SpineSays
  bandOf: (piece: Extract<Piece, { kind: 'band' }>) => BandSays
  /** the spine's width, px; 0 draws the spine as the block's head (a hand, or no spine) */
  spineW: number
  /** a shut line's name and figure columns, px, the same down every shut line */
  shutCols: { name: number; figures: number }
  spineHead: string
  hasSpine: boolean
  hand: boolean
  rowH: number
  /** the leading word's column, and the least the tail keeps for the lit row's keys */
  leadW: number
  tailW: number
  /** the lit rung's column, whose head says so */
  rungFieldId?: string
  onRung: (fieldId: string) => void
  collapsed: ReadonlySet<string>
  onToggle: (key: string) => void
  heldCopy: (address: string | undefined) => Held | null
  write: (w: Write) => Written
  commit: (rowId: string, fieldId: string, text: string) => Written
  refLabelsOf: (field: FieldDef) => Map<string, string> | undefined
  cursorRowId: string | null
  onCursor: (rowId: string | null) => void
  peeking: boolean
  onPeek: (open: boolean) => void
  onSelection: (sel: GridSel | null) => void
  onUndo: () => void
  onRedo: () => void
  now: () => Date
  ariaLabel: string
  /** a row the screen wants the cursor on — found, just added — and where to stand it */
  focusRowId?: string | null
  /** the record, drawn under its row on a desk */
  renderRecord: (row: ViewRow) => ReactNode
  /** the head's last cell: the columns held one press away */
  more?: ReactNode
  /** px kept clear at the list's foot, for the step line */
  foot: number
}

/** One id per cell, so `aria-activedescendant` can name it. */
export const cellDomId = (rowId: string, col: number): string => `sh-cell-${rowId}-${col}`
export const rowDomId = (rowId: string): string => `sh-row-${rowId}`

/** A held Space under a fifth of a second is a tap (Linear's peek);
 *  longer is a glance that closes with the key. */
const HOLD_MS = 200

/** How many times a row the list has not drawn yet is asked for again, and how long each
 *  look waits for the list to measure what it passed (see `chase` in `Grid`). */
const CHASE_TRIES = 8
const CHASE_GAP_MS = 60

interface Editing {
  row: number
  col: number
  rowId: string
  fieldId: string
  draft: string
}

interface Pill {
  rowId: string
  fieldId: string
  reason: string
}

/** A shut line's toggle column, px — `sheet.css`'s `--shut-toggle`, and `SHUT_BOX` in Sheet.tsx. */
const SHUT_TOGGLE_W = 24

/** A length the script decided, as a track size. */
const px = (n: number): string => `${n}px`

/** The piece that draws leaf `r`, or -1. */
function pieceOfLeaf(pieces: readonly Piece[], r: number): number {
  for (let i = 0; i < pieces.length; i += 1) {
    const p = pieces[i]!
    if (p.kind === 'row' && p.leaf.r === r) return i
    if (p.kind === 'block' && p.runs.some((run) => run.leaves.some((l) => l.r === r))) return i
  }
  return -1
}

export function Grid(props: GridProps) {
  const {
    table,
    layout,
    pieces,
    slots,
    fields,
    bands,
    onFold,
    split,
    leadCell,
    spineOf,
    bandOf,
    spineW,
    shutCols,
    spineHead,
    hasSpine,
    hand,
    rowH,
    leadW,
    tailW,
    rungFieldId,
    onRung,
    collapsed,
    onToggle,
    heldCopy,
    write,
    commit,
    refLabelsOf,
    cursorRowId,
    onCursor,
    peeking,
    onPeek,
    onSelection,
    onUndo,
    onRedo,
    now,
    ariaLabel,
    focusRowId = null,
    renderRecord,
    more,
    foot,
  } = props

  const rows = layout.leafRows
  const rowCount = rows.length
  const colCount = fields.length

  const [sel, setSelRaw] = useState<GridSel>(() => singleSel({ row: 0, col: 0 }))
  const [editing, setEditing] = useState<Editing | null>(null)
  const [pill, setPill] = useState<Pill | null>(null)

  /* THE CURSOR IS DRAWN ONCE SOMEBODY IS WORKING. On first paint the
     critic found a spreadsheet cursor outlining RU230KAM · PVC · WH and
     keycaps in its row, before anybody had touched the sheet
     (built-critique-m2-close.md, "does the sheet still feel like a
     database?"). The cursor still stands on the first row — the keyboard
     starts from it, and the grid names it to a reader — but nothing is
     lit until the grid takes the focus or a press, or the screen asks
     for a row (one found, one just added, a record open). */
  const [touched, setTouched] = useState(false)
  /* in a hand a press opens the record, which is the screen, so there is
     no cursor to draw there at all: an outlined cell on a phone is the
     spreadsheet the critique named, and does nothing a finger can use */
  const awake = (touched && !hand) || peeking || focusRowId !== null

  const handle = useRef<VirtuosoHandle>(null)
  const scroller = useRef<HTMLElement | null>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const heldSpaceAt = useRef<number | null>(null)
  const pending = useRef<{
    cell: CellRef
    third: boolean
    index: number
    tries: number
    settled: number
  } | null>(null)

  /* THE CURSOR NEVER POINTS PAST THE ROWS THAT ARE HERE. A shut
     block, a narrowing or a delete shrinks the addressable set under
     it, and an index kept as it was would name nobody. Clamped in the
     render, not repaired in an effect, for the reason the register
     gives. Memoised, because the effect that keeps the cursor on
     screen runs when this changes. */
  const active = useMemo(
    () => clampCell(sel.active, rowCount, colCount),
    [sel.active, rowCount, colCount],
  )
  const cursorRow: ViewRow | undefined = rows[active.row]

  const setSel = useCallback(
    (next: GridSel) => {
      setSelRaw(next)
      const many =
        next.ranges.length > 1 ||
        next.ranges.some((r) => r.anchor.row !== r.focus.row || r.anchor.col !== r.focus.col)
      onSelection(many ? next : null)
    },
    [onSelection],
  )

  useEffect(() => {
    onCursor(cursorRow?.rowId ?? null)
  }, [cursorRow?.rowId, onCursor])

  /* A ROW THE SCREEN ASKS FOR TAKES THE CURSOR — the one a finder
     found, the one just added — on its first column, and stands a
     third of the way down the room, where a reader's eye lands. Adjusted
     during the render rather than in an effect: the prop changed, the
     state follows it in the same pass. */
  const [followed, setFollowed] = useState<string | null>(null)
  if (focusRowId && focusRowId !== followed) {
    const r = rows.findIndex((row) => row.rowId === focusRowId)
    if (r >= 0) {
      setFollowed(focusRowId)
      setSelRaw(singleSel({ row: r, col: 0 }))
    }
  }

  /* ---- keeping the cursor on screen ------------------------ */

  /* THE HEAD STANDS ABOVE THE LIST, not inside it: the virtualiser
     wraps anything it is handed as a header in a box of its own height,
     where `position: sticky` has nothing to stick to — measured
     2026-09-23, the heads scrolled away with the first model. So the
     head is its own strip over the scroller, and follows it sideways
     (below); nothing inside the scroller stands over the rows. */
  const headH = useCallback((): number => 0, [])
  const headPort = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const sc = scroller.current
    const port = headPort.current
    if (!sc || !port) return
    const follow = (): void => {
      port.scrollLeft = sc.scrollLeft
    }
    sc.addEventListener('scroll', follow, { passive: true })
    return () => sc.removeEventListener('scroll', follow)
  })

  /** Bring a cell into the window, both axes, without smoothing — the
   *  sweep found one motion in its frames and it was a failure. With
   *  `third`, the row stands a third of the way down the room. */
  const reveal = useCallback(
    (cell: CellRef, third = false): boolean => {
      const sc = scroller.current
      const row = rows[cell.row]
      if (!sc || !row) return true
      const el = document.getElementById(cellDomId(row.rowId, cell.col))
      if (!el) return false
      const box = el.getBoundingClientRect()
      const inside = sc.getBoundingClientRect()
      const top = inside.top + headH()
      const bottom = inside.bottom - foot
      if (third) {
        sc.scrollTop += box.top - (top + (bottom - top) / 3)
      } else if (box.top < top) sc.scrollTop -= top - box.top
      else if (box.bottom > bottom) sc.scrollTop += box.bottom - bottom
      /* the pinned spine covers the left edge, so a cell hiding under
         it is genuinely off screen */
      const pinW = spineW > 0 && !hand ? spineW : 0
      if (box.left < inside.left + pinW) sc.scrollLeft -= inside.left + pinW - box.left
      else if (box.right > inside.right) sc.scrollLeft += box.right - inside.right
      return true
    },
    [foot, hand, headH, rows, spineW],
  )

  const third = useRef(false)
  useEffect(() => {
    if (focusRowId && followed === focusRowId) third.current = true
  }, [focusRowId, followed])

  /* CHASE THE ROW UNTIL IT STANDS IN THE WINDOW. `scrollToIndex` lands
     where the list's ESTIMATE of the blocks above says the row is, and
     a block nobody has drawn yet is estimated at the size of the first
     piece measured — the 28px series band. Measured 2026-09-23 on the
     built sheet at 1440 × 900: SP560 (PVC) B-W-C is block 8 of Sport's
     17 pieces, so the ask landed near 8 × 28px; the row's cells were
     drawn for a frame (the list believed block 8 was there), the old
     look found them, stood them a third of the way down — and then the
     list measured the blocks it had passed and laid itself out again,
     leaving scrollTop at 460 with SP330 in the window and no row lit and
     no record. A row found from inside the sheet (a chapter switch) and
     the same `?at=` reloaded both did it; the flow test, which arrives
     from Home on a list drawn from its first paint, never did.

     So a look succeeds only when the row's cell is INSIDE the window,
     twice running, and each look that finds it outside asks again now
     that more blocks are measured. A few asks converge; a bound keeps a
     row that cannot be drawn from asking forever. */
  const chase = useRef<() => void>(() => undefined)
  useEffect(() => {
    chase.current = () => {
      const p = pending.current
      if (!p) return
      requestAnimationFrame(() => {
        if (pending.current !== p) return
        const sc = scroller.current
        const row = rows[p.cell.row]
        const el = row ? document.getElementById(cellDomId(row.rowId, p.cell.col)) : null
        const box = el?.getBoundingClientRect()
        const port = sc?.getBoundingClientRect()
        const shown = !!box && !!port && box.bottom > port.top && box.top < port.bottom
        if (shown) {
          reveal(p.cell, p.third)
          p.settled += 1
          if (p.settled >= 2) {
            pending.current = null
            return
          }
        } else {
          if (p.tries >= CHASE_TRIES) {
            pending.current = null
            return
          }
          p.tries += 1
          p.settled = 0
          /* drawn but outside the window — a row deep in a tall block, in
             a 206px list at 844 × 390, is below the block's top that the
             list's own ask lands on — is brought in by its own box; not
             drawn at all is asked for by its block */
          if (el) reveal(p.cell, p.third)
          else handle.current?.scrollToIndex({ index: p.index, align: 'start', offset: -headH() })
        }
        /* a scroll that lands where it stood changes no range, so look again anyway */
        window.setTimeout(() => chase.current(), CHASE_GAP_MS)
      })
    }
  })

  useEffect(() => {
    if (rowCount === 0) return
    const asThird = third.current
    third.current = false
    if (reveal(active, asThird)) return
    const index = pieceOfLeaf(pieces, active.row)
    if (index < 0) return
    pending.current = { cell: active, third: asThird, index, tries: 0, settled: 0 }
    handle.current?.scrollToIndex({ index, align: 'start', offset: -headH() })
    window.setTimeout(() => chase.current(), CHASE_GAP_MS)
  }, [active, pieces, headH, reveal, rowCount])

  const onRange = useCallback((_range: ListRange) => {
    if (pending.current) chase.current()
  }, [])

  /* ---- editing ---------------------------------------------- */

  const start = useCallback(
    (cell: CellRef, seed?: string) => {
      const row = rows[cell.row]
      const field = fields[cell.col]
      if (!row || !field) return
      if (field.type === 'image') {
        setPill({ rowId: row.rowId, fieldId: field.id, reason: PICTURE_CELL_REFUSAL })
        return
      }
      if (field.type === 'formula') {
        setPill({
          rowId: row.rowId,
          fieldId: field.id,
          reason: `${field.name} is worked out from other columns — there is no cell to write.`,
        })
        return
      }
      /* a yes/no has nothing to type: the edit IS the toggle */
      if (field.type === 'boolean') {
        const v = row.values[field.id]
        const outcome = commit(row.rowId, field.id, v === true ? 'no' : 'yes')
        if ('refused' in outcome && outcome.refused !== '')
          setPill({ rowId: row.rowId, fieldId: field.id, reason: outcome.refused })
        return
      }
      setPill(null)
      setEditing({
        row: cell.row,
        col: cell.col,
        rowId: row.rowId,
        fieldId: field.id,
        draft: seed ?? seedOf(field, row),
      })
    },
    [commit, fields, rows],
  )

  const finish = useCallback(
    (move: 'down' | 'up' | 'right' | 'left' | 'none') => {
      const e = editing
      if (!e) return
      setEditing(null)
      const field = fields[e.col]
      const row = rows[e.row]
      /* A BLUR WITHOUT A CHANGE WRITES NOTHING: the engine refuses an
         unchanged cell with an empty sentence and the store records no
         step. */
      if (field && row && e.draft !== seedOf(field, row)) {
        const outcome = commit(e.rowId, e.fieldId, e.draft)
        if ('refused' in outcome && outcome.refused !== '') {
          setPill({ rowId: e.rowId, fieldId: e.fieldId, reason: outcome.refused })
          frameRef.current?.focus()
          return
        }
      }
      setPill(null)
      frameRef.current?.focus()
      if (move === 'none') return
      const step =
        move === 'down'
          ? { row: 1, col: 0 }
          : move === 'up'
            ? { row: -1, col: 0 }
            : move === 'right'
              ? { row: 0, col: 1 }
              : { row: 0, col: -1 }
      setSel(
        singleSel(clampCell({ row: e.row + step.row, col: e.col + step.col }, rowCount, colCount)),
      )
    },
    [colCount, commit, editing, fields, rowCount, rows, setSel],
  )

  const cancel = useCallback(() => {
    setEditing(null)
    frameRef.current?.focus()
  }, [])

  /* ---- the vocabulary --------------------------------------- */

  const moveTo = useCallback(
    (cell: CellRef, extend: boolean) => {
      const next = clampCell(cell, rowCount, colCount)
      if (!extend) {
        setSel(singleSel(next))
        return
      }
      const anchor = clampCell(primaryRange(sel).anchor, rowCount, colCount)
      setSel({ active: next, ranges: [{ anchor, focus: next }] })
    },
    [colCount, rowCount, sel, setSel],
  )

  /** SHIFT SPACE — a spreadsheet's own row select: the whole row joins
   *  or leaves the selection as its own range, the cursor staying where
   *  it is. It was X, a single letter, until 2026-09-25
   *  (m2-last-critique.md major 7, WCAG 2.2 SC 2.1.4). */
  const toggleRow = useCallback(() => {
    if (colCount === 0 || rowCount === 0) return
    const r = active.row
    const whole = (rg: Range): boolean => {
      const n = normalizeRange(rg)
      return n.r0 === r && n.r1 === r && n.c0 === 0 && n.c1 === colCount - 1
    }
    const already = sel.ranges.some(whole)
    const rowRange: Range = { anchor: { row: r, col: 0 }, focus: { row: r, col: colCount - 1 } }
    const ranges = already
      ? sel.ranges.filter((rg) => !whole(rg))
      : [
          ...sel.ranges.filter(
            (rg) => rg.anchor.row !== r || rg.focus.row !== r || rg.anchor.col !== rg.focus.col,
          ),
          rowRange,
        ]
    setSel({ active, ranges: ranges.length === 0 ? [{ anchor: active, focus: active }] : ranges })
  }, [active, colCount, rowCount, sel.ranges, setSel])

  /** The block the cursor is in, for `[` and `]`. */
  const blockOf = useCallback(
    (r: number): string | null => {
      for (const p of pieces) {
        if (p.kind === 'block' && p.runs.some((run) => run.leaves.some((l) => l.r === r)))
          return p.key
      }
      return null
    },
    [pieces],
  )

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (isField(event.target)) return
    const { key } = event
    const mod = event.ctrlKey || event.metaKey
    const plain = !mod && !event.altKey

    /* NO LETTER IS A SHORTCUT ON THE SHEET (2026-09-25, m2-last-critique.md
       major 7): J and K moved, X took the row and `/` went to the find
       field. The arrows move, Shift Space takes the row, and a letter typed
       on a cell is what it is on every spreadsheet — the start of an edit. */
    if (plain && event.shiftKey && (key === ' ' || key === 'Spacebar')) {
      event.preventDefault()
      toggleRow()
      return
    }
    if (plain && key === '[') {
      /* shut the block the cursor is in */
      event.preventDefault()
      const block = blockOf(active.row)
      if (block && !collapsed.has(block)) onToggle(block)
      return
    }
    if (plain && (key === ' ' || key === 'Spacebar')) {
      event.preventDefault()
      if (event.repeat) return
      heldSpaceAt.current = now().getTime()
      onPeek(!peeking)
      return
    }
    if (plain && key === 'Enter') {
      event.preventDefault()
      start(active)
      return
    }
    if (mod && !event.altKey && (key === 'z' || key === 'Z')) {
      event.preventDefault()
      if (event.shiftKey) onRedo()
      else onUndo()
      return
    }
    if (mod && !event.altKey && !event.shiftKey && (key === 'y' || key === 'Y')) {
      event.preventDefault()
      onRedo()
      return
    }
    if (key === 'Escape' && closesStage(stageKeyOf(event.nativeEvent))) {
      /* THE LADDER: the record shuts first; then a selection of many
         cells collapses to the one under the cursor; then the pill
         goes. What is left — the find field — is the screen's. */
      if (peeking) {
        event.preventDefault()
        onPeek(false)
        return
      }
      if (
        sel.ranges.length > 1 ||
        sel.ranges.some((r) => r.anchor.row !== r.focus.row || r.anchor.col !== r.focus.col)
      ) {
        event.preventDefault()
        setSel(singleSel(active))
        return
      }
      if (pill) {
        event.preventDefault()
        setPill(null)
      }
      return
    }

    const command = resolveKey({
      key,
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
      meta: event.metaKey,
      editing: false,
      rows: rowCount,
      cols: colCount,
      active,
      range: primaryRange(sel),
      pageSize: Math.max(1, Math.floor(((scroller.current?.clientHeight ?? 0) - headH()) / rowH)),
    })
    switch (command.kind) {
      case 'move':
        event.preventDefault()
        setSel({ active: command.active, ranges: [command.range] })
        return
      case 'edit-start':
        event.preventDefault()
        start(command.cell, command.seed)
        return
      case 'clear-range': {
        event.preventDefault()
        const w = clearWrite(table.id, table.name, rows, fields, command.range)
        if (w.cells > 0) write(w)
        return
      }
      case 'fill-down': {
        event.preventDefault()
        const w = fillDownWrite(table, rows, fields, command.range)
        if (w.cells > 0) write(w)
        else if (w.skipped[0] && cursorRow) {
          setPill({
            rowId: cursorRow.rowId,
            fieldId: fields[active.col]?.id ?? '',
            reason: w.skipped[0],
          })
        }
        return
      }
      case 'select-all':
        event.preventDefault()
        if (rowCount > 0 && colCount > 0) {
          setSel({
            active,
            ranges: [
              { anchor: { row: 0, col: 0 }, focus: { row: rowCount - 1, col: colCount - 1 } },
            ],
          })
        }
        return
      default:
        return
    }
  }

  const onKeyUp = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== ' ' && event.key !== 'Spacebar') return
    const down = heldSpaceAt.current
    heldSpaceAt.current = null
    if (down === null) return
    /* a held Space is a glance: letting go shuts what it opened */
    if (now().getTime() - down >= HOLD_MS && peeking) onPeek(false)
  }

  /* ---- the clipboard, through the browser's own events ------- */

  const block = useCallback(
    (range: Range): string[][] => {
      const n = normalizeRange(range)
      const out: string[][] = []
      for (let r = n.r0; r <= n.r1; r += 1) {
        const row = rows[r]
        if (!row) continue
        const line: string[] = []
        for (let c = n.c0; c <= n.c1; c += 1) {
          const f = fields[c]
          line.push(f ? seedOf(f, row) : '')
        }
        out.push(line)
      }
      return out
    },
    [fields, rows],
  )

  const onCopy = (event: ReactClipboardEvent<HTMLDivElement>): void => {
    if (isField(event.target)) return
    event.preventDefault()
    event.clipboardData.setData('text/plain', serializeTsv(block(primaryRange(sel))))
  }
  const onCut = (event: ReactClipboardEvent<HTMLDivElement>): void => {
    if (isField(event.target)) return
    event.preventDefault()
    const range = primaryRange(sel)
    event.clipboardData.setData('text/plain', serializeTsv(block(range)))
    const w = clearWrite(table.id, table.name, rows, fields, range)
    if (w.cells > 0) write(w)
  }
  const onPaste = (event: ReactClipboardEvent<HTMLDivElement>): void => {
    if (isField(event.target)) return
    event.preventDefault()
    const parsed = parseTsv(event.clipboardData.getData('text/plain'))
    if (parsed.length === 0) return
    const w = pasteWrite(table, rows, fields, active, parsed, refLabelsOf)
    if (w.cells > 0) write(w)
    else if (cursorRow) {
      setPill({ rowId: cursorRow.rowId, fieldId: fields[active.col]?.id ?? '', reason: w.said })
    }
  }

  /* ---- the pointer ------------------------------------------ */

  /* A PRESS ON THE CELL ALREADY UNDER THE CURSOR OPENS IT, which is
     what a pointer means by Enter; a press that MOVES the cursor does
     not, or every first click would open an editor. In a hand, a press
     on a row opens its record, where every value is a button — a
     44 px row is not a place to type into. */
  const downOnActive = useRef(false)

  const onCellDown = useCallback(
    (event: ReactMouseEvent, cell: CellRef) => {
      if (event.button !== 0) return
      event.preventDefault()
      frameRef.current?.focus()
      /* a press on a cursor nobody could see yet only lights it */
      downOnActive.current =
        awake && !event.shiftKey && active.row === cell.row && active.col === cell.col
      moveTo(cell, event.shiftKey)
    },
    [active, moveTo, awake],
  )

  const onCellPress = useCallback(
    (cell: CellRef) => {
      if (hand) {
        onPeek(true)
        return
      }
      if (downOnActive.current) start(cell)
      downOnActive.current = false
    },
    [hand, onPeek, start],
  )

  /* ---- what is drawn ---------------------------------------- */

  const picked = useMemo(() => new Set(fullySelectedRows(sel, colCount)), [colCount, sel])
  const editingKey = editing ? `${editing.rowId}|${editing.fieldId}` : ''
  const lead = leadCell ? split : null
  /* THE COLUMN A COLOURWAY IS FILED IN — the last level of a register that
     files three (Highfield's Variant). Its cells draw their colourway as
     colour (built-critique-m2-close-2.md, major 6); every other column's
     do not, because a motor's shaft code is not a colour. */
  const levels = table.hierarchy ?? []
  const colourFieldId = levels.length >= 3 ? levels[levels.length - 1] : undefined
  const colourOf = (field: FieldDef, row: ViewRow): Colourway | null =>
    field.id === colourFieldId ? colourwayOf(splitVariant(row.text[field.id] ?? '').code) : null
  const showLead = lead !== null
  const spineCol = hasSpine && !hand ? 1 : 0
  const firstData = spineCol + (showLead ? 1 : 0) + 1

  const template = useMemo(() => {
    const tracks: string[] = []
    if (spineCol) tracks.push(`${spineW}px`)
    if (showLead) tracks.push(`${leadW}px`)
    for (const s of slots) {
      tracks.push(hand && s.kind === 'field' && s.job === 'name' ? 'minmax(0, 1fr)' : `${s.w}px`)
    }
    if (!hand) tracks.push(`minmax(${tailW}px, 1fr)`)
    return tracks.join(' ')
  }, [hand, leadW, showLead, slots, spineCol, spineW, tailW])
  const total = useMemo(
    () =>
      (spineCol ? spineW : 0) +
      (showLead ? leadW : 0) +
      slots.reduce((n, s) => n + s.w, 0) +
      (hand ? 0 : tailW),
    [hand, leadW, showLead, slots, spineCol, spineW, tailW],
  )
  const frame: CSSProperties = { gridTemplateColumns: template, minInlineSize: total }

  /* what a cell prints when it is not its own painted value: a variant
     with its leading word said at the head of its run, or a picture
     column's words — a picture is drawn on the spine and the record,
     never at 28 px in a row */
  const paintName = (field: FieldDef, row: ViewRow): string => {
    if (lead && field.id === lead.fieldId) return restOf(lead, row.text[field.id] ?? '')
    if (field.type === 'image') {
      const p = pictureOf(row, field, heldCopy)
      return p === null ? '' : p.kind === 'held' ? 'a held picture' : HELD_AS_A_LINK
    }
    return ''
  }

  /* BEHIND EVERY COLUMN, A VALUE THE ROW ABOVE ALREADY SAID IS A DITTO
     MARK, the way a printed price list marks it: the second critique read
     "Matrix · Highfield Inflatables" and "held as a link" down every row
     of that door. The value is still there — the cell's name to a reader,
     drawn whole under the cursor, copied, changed — but the eye lands
     where a column CHANGES. The price list itself never repeats: it says
     a shared value once. */
  const quietRepeats = !leadCell
  const shownText = (field: FieldDef, row: ViewRow): string =>
    paintName(field, row) || paintOf(table, field, row)

  const renderCells = (leaf: { r: number; rowId: string }, gridRow: number, prev?: ViewRow) => {
    const row = rows[leaf.r]
    if (!row) return null
    return slots.map((slot, i) => {
      const gridColumn = firstData + i
      if (slot.kind === 'fold') {
        return (
          <div
            key={`fold:${slot.section.id}`}
            role="gridcell"
            className="sh-cell sh-cell--fold"
            aria-label={`${slot.section.name}, folded`}
            style={{ gridRow, gridColumn }}
          />
        )
      }
      const { field } = slot
      const cell: CellRef = { row: leaf.r, col: slot.col }
      const ownPill = pill && pill.rowId === row.rowId && pill.fieldId === field.id ? pill : null
      return (
        <Cell
          key={field.id}
          table={table}
          row={row}
          field={field}
          job={slot.job}
          cell={cell}
          place={{ gridRow, gridColumn }}
          rest={paintName(field, row)}
          colour={colourOf(field, row)}
          colourColumn={field.id === colourFieldId}
          active={awake && active.row === cell.row && active.col === cell.col}
          selected={awake && selContains(sel, cell)}
          rung={field.id === rungFieldId}
          repeat={
            quietRepeats &&
            prev !== undefined &&
            shownText(field, row) !== '' &&
            shownText(field, row) === shownText(field, prev)
          }
          editing={editingKey === `${row.rowId}|${field.id}` ? editing : null}
          pill={ownPill}
          onDown={onCellDown}
          onPress={onCellPress}
          onOpen={start}
          onDraft={(draft) => setEditing((e) => (e ? { ...e, draft } : e))}
          onFinish={finish}
          onCancel={cancel}
        />
      )
    })
  }

  const renderTail = (row: ViewRow, gridRow: number) => {
    if (hand) return null
    const on = awake && row.rowId === cursorRowId
    return (
      /* the row's own last cell, where its acts are: a cell of the row
         like any other, which the cursor never lands on because there
         is nothing in it to write */
      <div
        role="gridcell"
        aria-label={on ? 'The keys, and the record' : undefined}
        className="sh-tail"
        style={{ gridRow, gridColumn: -2 }}
        data-on={on ? '' : undefined}
      >
        {on ? (
          <>
            {/* THE KEYS PRINTED WHERE THEIR ACTS ARE — on the lit row, and
                only where there is a keyboard: `pointer: coarse` takes the
                caps away and the touch words stand instead (sheet.css) */}
            <span className="sh-hint sh-hint--keys">
              <Kbd>Enter</Kbd> edits · <Kbd>Space</Kbd>
            </span>
            <span className="sh-hint sh-hint--touch">Press a value again to change it ·</span>
            <button
              type="button"
              className="sh-open"
              tabIndex={-1}
              aria-expanded={peeking}
              aria-label={peeking ? 'Close the record' : 'Open the record'}
              onClick={() => onPeek(!peeking)}
            >
              {peeking ? 'close' : 'record'}
            </button>
          </>
        ) : null}
      </div>
    )
  }

  const renderRow = (
    leaf: { r: number; rowId: string },
    gridRow: number,
    extra?: { spine?: ReactNode; lead?: ReactNode; prev?: ViewRow },
  ) => {
    const row = rows[leaf.r]
    if (!row) return null
    const on = awake && row.rowId === cursorRowId
    return (
      <div
        key={row.rowId}
        role="row"
        id={rowDomId(row.rowId)}
        aria-selected={picked.has(leaf.r) ? true : undefined}
        className="sh-row"
        data-on={on ? '' : undefined}
        data-peeking={on && peeking ? '' : undefined}
        data-picked={picked.has(leaf.r) ? '' : undefined}
      >
        {extra?.spine}
        {extra?.lead}
        {renderCells(leaf, gridRow, extra?.prev)}
        {renderTail(row, gridRow)}
      </div>
    )
  }

  const recordRow = (row: ViewRow, gridRow: number) => (
    <div role="row" className="sh-recordrow" key={`record:${row.rowId}`}>
      <div
        role="gridcell"
        aria-colspan={Math.max(1, colCount)}
        className="sh-recordcell"
        /* from the first column of figures to the end: the spine and the
           leading word run on beside it, so nothing stands over anything */
        style={{ gridRow, gridColumn: `${firstData} / -1` }}
      >
        {renderRecord(row)}
      </div>
    </div>
  )

  const renderBlock = (p: Extract<Piece, { kind: 'block' }>) => {
    const says = spineOf(p)
    const leaves = p.runs.flatMap((run) => run.leaves)
    const openAt =
      !hand && peeking && cursorRowId !== null
        ? leaves.findIndex((l) => l.rowId === cursorRowId)
        : -1
    const drawn = leaves.length + (openAt >= 0 ? 1 : 0)
    const headRow = hand ? 1 : 0
    const rowsTemplate = hand
      ? ['auto', ...leaves.map(() => px(rowH))].join(' ')
      : leaves.flatMap((_, i) => (i === openAt ? [px(rowH), 'auto'] : [px(rowH)])).join(' ')
    const gridOf = (i: number): number => headRow + i + 1 + (openAt >= 0 && i > openAt ? 1 : 0)

    const spine = (
      <Spine
        key="spine"
        says={says}
        shut={p.shut}
        hand={hand}
        place={
          hand
            ? { gridRow: 1, gridColumn: '1 / -1' }
            : { gridRow: `1 / span ${Math.max(1, drawn)}`, gridColumn: 1 }
        }
        span={Math.max(1, drawn)}
        shutCols={shutCols}
        onToggle={() => onToggle(p.key)}
      />
    )

    if (p.shut || leaves.length === 0) {
      return (
        <div
          role="rowgroup"
          aria-label={says.name}
          className="sh-block"
          data-shut=""
          data-hand={hand ? '' : undefined}
        >
          <div role="row" className="sh-shutrow">
            {spine}
          </div>
        </div>
      )
    }

    let i = 0
    const out: ReactNode[] = []
    p.runs.forEach((run, runIndex) => {
      run.leaves.forEach((leaf, k) => {
        const index = i
        i += 1
        const gridRow = gridOf(index)
        const runRows =
          run.leaves.length +
          (openAt >= index - k && openAt < index - k + run.leaves.length ? 1 : 0)
        const leadCellNode =
          showLead && k === 0 ? (
            <div
              key="lead"
              role="rowheader"
              className="sh-lead"
              data-run={runIndex % 2 === 0 ? 'a' : 'b'}
              aria-rowspan={runRows}
              style={{ gridRow: `${gridRow} / span ${runRows}`, gridColumn: spineCol + 1 }}
            >
              <span className="sh-lead__word">{run.lead === '' ? 'other' : run.lead}</span>
            </div>
          ) : undefined
        out.push(
          renderRow(leaf, gridRow, {
            spine: index === 0 && !hand ? spine : undefined,
            lead: leadCellNode,
            prev: index > 0 ? rows[leaves[index - 1]!.r] : undefined,
          }),
        )
        if (index === openAt) {
          const row = rows[leaf.r]
          if (row) out.push(recordRow(row, gridRow + 1))
        }
      })
    })

    return (
      <div
        role="rowgroup"
        aria-label={says.name}
        className="sh-block"
        data-hand={hand ? '' : undefined}
        style={{ ...frame, gridTemplateRows: rowsTemplate }}
      >
        {hand ? (
          <div role="row" className="sh-headrow">
            {spine}
          </div>
        ) : null}
        {out}
      </div>
    )
  }

  const renderBand = (p: Extract<Piece, { kind: 'band' }>) => {
    const b = bandOf(p)
    return (
      <div role="rowgroup" aria-label={b.name} className="sh-bandgroup">
        <div role="row" className="sh-band" style={{ minInlineSize: total }}>
          <div role="gridcell" aria-colspan={Math.max(1, colCount)} className="sh-band__cell">
            <span className="sh-band__name">{b.name}</span>
            <span className="sh-band__count">{b.count}</span>
            {b.says ? (
              <span className="sh-band__says" title={b.says}>
                <span className="sh-band__every">every one</span> {b.says}
              </span>
            ) : null}
            {b.pictures ? <span className="sh-band__pics">{b.pictures}</span> : null}
          </div>
        </div>
      </div>
    )
  }

  const renderFlat = (p: Extract<Piece, { kind: 'row' }>) => {
    const row = rows[p.leaf.r]
    const open = !hand && peeking && row !== undefined && row.rowId === cursorRowId
    return (
      <div
        className="sh-flat"
        style={{ ...frame, gridTemplateRows: open ? `${px(rowH)} auto` : px(rowH) }}
      >
        {renderRow(p.leaf, 1)}
        {open && row ? recordRow(row, 2) : null}
      </div>
    )
  }

  const activeId = cursorRow ? cellDomId(cursorRow.rowId, active.col) : undefined

  const context: DrawContext = {
    renderBlock,
    renderBand,
    renderFlat,
    head: (
      <Head
        slots={slots}
        frame={frame}
        total={total}
        bands={bands}
        onFold={onFold}
        table={table}
        spineCol={spineCol}
        spineHead={spineHead}
        showLead={showLead}
        hand={hand}
        rungFieldId={rungFieldId}
        onRung={onRung}
        more={more}
      />
    ),
    foot,
  }
  const components = useMemo(() => ({ List, Footer }), [])
  const focusIndex = focusRowId
    ? pieceOfLeaf(
        pieces,
        rows.findIndex((r) => r.rowId === focusRowId),
      )
    : -1

  /* THE GRID IS THE FRAME, the head and the scroller together: the one
     tab stop, the one owner of the keys, and the element a reader is
     told is a grid with its column heads inside it. The scroller within
     it is where the rows are, and is what the density ruler measures. */
  return (
    <div
      ref={frameRef}
      className="sh-outline"
      data-hand={hand ? '' : undefined}
      data-testid="sheet-grid"
      data-rows={rowCount}
      role="grid"
      aria-label={ariaLabel}
      aria-rowcount={drawnRows(pieces, hand)}
      aria-colcount={colCount}
      aria-multiselectable={true}
      aria-activedescendant={activeId}
      tabIndex={0}
      onFocus={() => setTouched(true)}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onCopy={onCopy}
      onCut={onCut}
      onPaste={onPaste}
    >
      <div className="sh-headport" ref={headPort} role="rowgroup">
        {context.head}
      </div>
      <Virtuoso<Piece, DrawContext>
        ref={handle}
        scrollerRef={(el) => {
          scroller.current = el instanceof HTMLElement ? el : null
        }}
        className="sh-grid"
        data={pieces as Piece[]}
        computeItemKey={(_i, p) => p.key}
        rangeChanged={onRange}
        increaseViewportBy={{ top: rowH * 4, bottom: rowH * 8 }}
        initialItemCount={Math.min(pieces.length, Math.max(12, focusIndex + 2))}
        components={components}
        context={context}
        itemContent={drawPiece}
      />
    </div>
  )
}

/** Every row a reader is told about: the head, each band, each shut
 *  block's one line, each block's head in a hand, and each row. */
export function drawnRows(pieces: readonly Piece[], hand: boolean): number {
  let n = 1
  for (const p of pieces) {
    if (p.kind !== 'block') n += 1
    else if (p.shut || p.runs.length === 0) n += 1
    else n += p.runs.reduce((k, r) => k + r.leaves.length, 0) + (hand ? 1 : 0)
  }
  return n
}

/* ---------------------------------------------------------- */
/* The virtualiser's parts                                     */
/* ---------------------------------------------------------- */

interface DrawContext {
  renderBlock: (p: Extract<Piece, { kind: 'block' }>) => ReactNode
  renderBand: (p: Extract<Piece, { kind: 'band' }>) => ReactNode
  renderFlat: (p: Extract<Piece, { kind: 'row' }>) => ReactNode
  head: ReactNode
  foot: number
}

function drawPiece(_i: number, p: Piece, ctx: DrawContext): ReactNode {
  if (p.kind === 'band') return ctx.renderBand(p)
  if (p.kind === 'block') return ctx.renderBlock(p)
  return ctx.renderFlat(p)
}

/** The virtualiser's own list element, given nothing but its class. */
const List = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function List(props, ref) {
  return <div {...props} ref={ref} className="sh-list" />
})

/** Room at the list's foot for the step line, so no row hides under it. */
function Footer({ context }: { context?: DrawContext }) {
  if (!context || context.foot <= 0) return null
  return <div aria-hidden="true" style={{ blockSize: context.foot }} />
}

/* ---------------------------------------------------------- */
/* The head                                                    */
/* ---------------------------------------------------------- */

interface HeadProps {
  slots: readonly Slot[]
  frame: CSSProperties
  total: number
  bands?: readonly HeaderBand[]
  onFold?: (sectionId: string) => void
  table: EntityDef
  spineCol: number
  spineHead: string
  showLead: boolean
  hand: boolean
  rungFieldId?: string
  onRung: (fieldId: string) => void
  more?: ReactNode
}

/** THE STICKY HEAD: the section bands (every column only) over the
 *  column heads, inside the scroller so both scroll sideways with the
 *  cells they name. The lit rung's head says so; pressing a price
 *  head lights it, and every spine's figure follows. */
function Head({
  slots,
  frame,
  total,
  bands,
  onFold,
  table,
  spineCol,
  spineHead,
  showLead,
  hand,
  rungFieldId,
  onRung,
  more,
}: HeadProps) {
  const firstData = spineCol + (showLead ? 1 : 0) + 1
  return (
    <div className="sh-head" data-testid="sheet-head" style={{ minInlineSize: total }}>
      {bands && bands.length > 0 && onFold ? (
        <div className="sh-bands" role="row" style={frame}>
          {spineCol ? <div className="sh-bands__pin" style={{ gridColumn: 1 }} /> : null}
          <div className="sh-bands__run" style={{ gridColumn: `${firstData} / -1` }}>
            {bands
              .filter((b) => !b.pinned)
              .map((band) => (
                <BandHead key={band.key} band={band} onFold={onFold} table={table} />
              ))}
          </div>
        </div>
      ) : null}
      <div className="sh-heads" role="row" style={frame}>
        {spineCol ? (
          <div role="columnheader" className="sh-th sh-th--spine" style={{ gridColumn: 1 }}>
            <span className="sh-th__name">{spineHead}</span>
          </div>
        ) : null}
        {slots.map((slot, i) => {
          const gridColumn =
            i === 0 && showLead ? `${firstData - 1} / span 2` : String(firstData + i)
          if (slot.kind === 'fold') {
            return (
              <div
                key={`fold:${slot.section.id}`}
                role="columnheader"
                className="sh-th sh-th--fold"
                style={{ gridColumn }}
              >
                <button
                  type="button"
                  className="sh-chip"
                  tabIndex={-1}
                  onClick={() => onFold?.(slot.section.id)}
                  aria-label={`Unfold ${slot.section.name}, ${slot.count} columns`}
                >
                  {slot.section.name} · {slot.count}
                </button>
              </div>
            )
          }
          const f = slot.field
          const cost = isCost(table, f)
          const price = slot.job === 'price'
          const lit = f.id === rungFieldId
          return (
            <div
              key={f.id}
              role="columnheader"
              aria-colindex={slot.col + 1}
              className="sh-th"
              data-num={f.type === 'number' ? '' : undefined}
              data-rung={lit ? '' : undefined}
              data-job={slot.job}
              style={{ gridColumn }}
            >
              {price && !hand ? (
                <button
                  type="button"
                  className="sh-th__rung"
                  tabIndex={-1}
                  aria-pressed={lit}
                  onClick={() => onRung(f.id)}
                  aria-label={
                    lit
                      ? `${f.name}, the figure every model's head is reading`
                      : `Read every model's head at ${f.name}`
                  }
                >
                  <span className="sh-th__name">{f.name}</span>
                </button>
              ) : (
                <span className="sh-th__name">{f.name}</span>
              )}
              {cost ? (
                <span className="sh-th__cost" aria-label="the dealer's own cost column">
                  {COST_WORD}
                </span>
              ) : null}
            </div>
          )
        })}
        {!hand ? (
          <div className="sh-th sh-th--tail" style={{ gridColumn: -2 }}>
            {more}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function BandHead({
  band,
  onFold,
  table,
}: {
  band: HeaderBand
  onFold: (sectionId: string) => void
  table: EntityDef
}) {
  const section = band.section
  if (!section) {
    return (
      <div
        role="columnheader"
        aria-label="columns in no section"
        className="sh-sband sh-sband--none"
        style={{ inlineSize: band.w }}
      />
    )
  }
  const cost = /cost|markup|margin/i.test(section.name)
  const count = band.runCount ?? band.count
  const folded = band.collapsed || band.folded !== undefined
  return (
    <div
      role="columnheader"
      aria-colspan={Math.max(1, band.count)}
      className="sh-sband"
      data-folded={folded ? '' : undefined}
      data-accent={section.accent}
      style={{ inlineSize: band.w }}
    >
      <button
        type="button"
        className="sh-sband__fold"
        tabIndex={-1}
        aria-expanded={!folded}
        onClick={() => onFold(section.id)}
        aria-label={`${folded ? 'Unfold' : 'Fold'} ${section.name}, ${count} ${count === 1 ? 'column' : 'columns'}${cost ? `, the dealer's own cost on ${table.name}` : ''}`}
      >
        <span className="sh-sband__name">{section.name}</span>
        <span className="sh-sband__count">{count}</span>
        {cost ? <span className="sh-sband__cost">{COST_WORD}</span> : null}
      </button>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* A spine                                                     */
/* ---------------------------------------------------------- */

/**
 * THE MODEL, SAID ONCE. Its name large, how many rows it holds and the
 * lit rung's figure per leading word, then what every row shares, one
 * section to a line under its accent, each fact whole (`packFacts` laid
 * them into the width this spine has) — and its held render beside the
 * words when the block has room for one worth drawing. Shut, it is one
 * line of a price list: the name, the figure and what it shares each in
 * a column of its own down every shut line. In a hand it is the block's
 * head, and the whole head is the press that opens it.
 */
function Spine({
  says,
  shut,
  hand,
  place,
  span,
  shutCols,
  onToggle,
}: {
  says: SpineSays
  shut: boolean
  hand: boolean
  place: CSSProperties
  span: number
  shutCols: { name: number; figures: number }
  onToggle: () => void
}) {
  /* THE ORDER THE SPINE SAYS THINGS IN: the name and how many rows it
     holds; then the lit rung's figure, per material — the first thing a
     customer asks — then what every row shares */
  const full = says.fit !== 'name' || shut || hand
  const figureLine = full && says.figures !== ''
  const one = says.one
  const words = (
    <span className="sh-spine__words">
      <span className="sh-spine__name">
        {says.name}
        <span className="sh-spine__count"> {says.count}</span>
      </span>
      {figureLine
        ? says.figureLines.map((t) => (
            <span key={t} className="sh-spine__figures">
              {t}
            </span>
          ))
        : null}
      {one ? (
        one.runs.length > 0 || one.more ? (
          <span className="sh-spine__one">
            {one.runs.map((r) => (
              <span
                key={r.key}
                className="sh-spine__run"
                data-accent={r.accent ?? 'none'}
                data-lead=""
              >
                {r.text}
              </span>
            ))}
            {one.more ? (
              <span className="sh-spine__more">
                {one.runs.length > 0 ? ' · ' : ''}
                {one.more}
              </span>
            ) : null}
          </span>
        ) : null
      ) : (
        says.lines.map((l) => (
          <span key={l.key} className="sh-spine__line">
            {l.runs.map((r) => (
              <span
                key={r.key}
                className="sh-spine__run"
                data-accent={r.accent ?? 'none'}
                data-lead={r.lead ? '' : undefined}
              >
                {r.text}
              </span>
            ))}
            {l.more ? (
              <span className="sh-spine__more">
                {l.runs.length > 0 ? ' · ' : ''}
                {l.more}
              </span>
            ) : null}
          </span>
        ))
      )}
    </span>
  )
  const picture =
    says.picture && (hand || (!shut && says.fit === 'full')) ? (
      <figure className="sh-spine__picture" style={{ inlineSize: says.picture.w }}>
        <img
          src={says.picture.held.at}
          width={says.picture.w}
          height={says.picture.h}
          /* THE BOX IS `spineFit`'S, NOT THE PHOTOGRAPH'S. With a height of
             `auto` a loaded image takes its OWN ratio — 1,100 × 619 at 180px
             wide is 101px, not the 92px `spineFit` measured the block
             against, and the caption fell under the block's edge at 1920.
             Held at the given ratio, it is drawn whole and contained. */
          style={{ aspectRatio: `${says.picture.w} / ${says.picture.h}` }}
          alt={says.picture.alt}
          loading="lazy"
          decoding="async"
        />
        <figcaption className="sh-spine__caption">{says.picture.caption}</figcaption>
      </figure>
    ) : null

  if (hand) {
    return (
      <div
        role="rowheader"
        className="sh-spine"
        data-hand=""
        data-shut={shut ? '' : undefined}
        style={place}
      >
        <button type="button" className="sh-spine__press" aria-expanded={!shut} onClick={onToggle}>
          {words}
          {picture}
          <span className="sh-spine__caret" aria-hidden="true">
            {shut ? '▸' : '▾'}
          </span>
        </button>
      </div>
    )
  }
  return (
    <div
      role="rowheader"
      aria-rowspan={span}
      className="sh-spine"
      data-fit={says.fit}
      data-shut={shut ? '' : undefined}
      style={place}
    >
      <div
        className="sh-spine__in"
        /* a shut line's columns are the same down every shut line, so a
           price always sits in the same place (`shutCols`, Sheet.tsx) */
        style={
          shut && shutCols.name > 0
            ? {
                gridTemplateColumns: `${SHUT_TOGGLE_W}px ${shutCols.name}px ${shutCols.figures}px minmax(0, 1fr)`,
              }
            : undefined
        }
      >
        <button
          type="button"
          className="sh-spine__toggle"
          tabIndex={-1}
          aria-expanded={!shut}
          aria-label={shut ? `Open ${says.name}` : `Shut ${says.name}`}
          onClick={onToggle}
        >
          <span aria-hidden="true">{shut ? '▸' : '▾'}</span>
        </button>
        {words}
        {picture}
        {/* NO "+ variant" ON THE SPINE. It stood here, absolutely placed at the
            spine's foot, and on a tablet — where it was drawn at rest — it was
            painted over every open model's last line ("+3 m + variant"); at a
            desk, hovered, over the render's caption (built-critique-m2-close-2.md
            major 8). It was also out of the keyboard's reach. Adding a row is
            the record's act now, beside "Delete this row…" (2026-09-25). */}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* A cell                                                      */
/* ---------------------------------------------------------- */

interface CellProps {
  table: EntityDef
  row: ViewRow
  field: FieldDef
  job: string
  cell: CellRef
  place: CSSProperties
  /** the variant with its leading word said at the head of its run, or '' */
  rest: string
  /** the colourway the cell's code reads as, drawn beside it where the
   *  decode names every part; null on every column that is not one */
  colour: Colourway | null
  /** the cell is in the column a colourway is filed in, so it keeps the
   *  tile's room whether or not its own code decodes — the codes of a
   *  column stay in one line down it */
  colourColumn: boolean
  active: boolean
  selected: boolean
  rung: boolean
  /** the row above in its block said the same — drawn in the quiet ink */
  repeat: boolean
  editing: Editing | null
  pill: Pill | null
  onDown: (event: ReactMouseEvent, cell: CellRef) => void
  /** the click after the mousedown, which opens the cell when the
   *  mousedown found the cursor already on it */
  onPress: (cell: CellRef) => void
  onOpen: (cell: CellRef) => void
  onDraft: (draft: string) => void
  onFinish: (move: 'down' | 'up' | 'right' | 'left' | 'none') => void
  onCancel: () => void
}

function Cell({
  table,
  row,
  field,
  job,
  cell,
  place,
  rest,
  colour,
  colourColumn,
  active,
  selected,
  rung,
  repeat,
  editing,
  pill,
  onDown,
  onPress,
  onOpen,
  onDraft,
  onFinish,
  onCancel,
}: CellProps) {
  const mark = job === 'mark' && field.type === 'boolean'
  const text = rest !== '' ? rest : paintOf(table, field, row)
  const num = field.type === 'number'
  const said = mark
    ? row.values[field.id] === true
      ? 'yes'
      : 'no'
    : text === ''
      ? 'empty'
      : colour?.read
        ? `${colour.say}, ${paintOf(table, field, row) || text}`
        : paintOf(table, field, row) || text
  return (
    <div
      role="gridcell"
      id={cellDomId(row.rowId, cell.col)}
      tabIndex={-1}
      aria-colindex={cell.col + 1}
      aria-selected={selected ? true : undefined}
      className="sh-cell"
      data-num={num ? '' : undefined}
      data-job={job}
      data-rung={rung ? '' : undefined}
      data-repeat={repeat ? '' : undefined}
      data-active={active ? '' : undefined}
      data-selected={selected ? '' : undefined}
      data-cost={isCost(table, field) ? '' : undefined}
      data-colour={colourColumn ? '' : undefined}
      style={place}
      onMouseDown={(event) => onDown(event, cell)}
      onDoubleClick={() => onOpen(cell)}
    >
      {editing ? (
        <span className="sh-editor">
          <Input
            aria-label={`${field.name}, editing`}
            value={editing.draft}
            onValueChange={onDraft}
            mono={num}
            inputMode={num ? 'decimal' : undefined}
            autoFocus
            onFocus={(e) => e.currentTarget.select()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                onFinish(e.shiftKey ? 'up' : 'down')
              } else if (e.key === 'Tab') {
                e.preventDefault()
                onFinish(e.shiftKey ? 'left' : 'right')
              } else if (e.key === 'Escape') {
                e.preventDefault()
                onCancel()
              }
            }}
            onBlur={() => onFinish('none')}
          />
        </span>
      ) : (
        /* THE READ STATE IS A REAL BUTTON: a reader is told it can be
           pressed, a finger presses it, and Enter on it opens it. It
           is out of the tab order because the grid is the one tab stop
           and owns the keys. */
        <button
          type="button"
          className="sh-cell__read"
          tabIndex={-1}
          aria-label={`${field.name}: ${said}`}
          onClick={() => onPress(cell)}
        >
          {mark ? (
            <span className="sh-cell__mark" aria-hidden="true">
              {row.values[field.id] === true ? '★' : ''}
            </span>
          ) : repeat && !active ? (
            /* the printed list's ditto: "as above" — the value is the
               button's name, and the cursor on it draws the value itself */
            <span className="sh-cell__ditto" aria-hidden="true">
              〃
            </span>
          ) : (
            <>
              {/* THE COLOURWAY AS COLOUR, beside the dealer's own code for it:
                  the sheet is where he orders by the code, so the code stays
                  and the colour is drawn next to it, and a reader hears the
                  colour's name first. A code the decode cannot read draws
                  nothing. */}
              {colour?.read ? (
                <Swatches colour={colour} shape="flag" />
              ) : colourColumn ? (
                /* the tile's room, empty: a code nothing decodes draws no colour */
                <span className="sh-cell__noflag" aria-hidden="true" />
              ) : null}
              <span className="sh-cell__text">{text}</span>
            </>
          )}
        </button>
      )}
      {pill ? (
        <span className="sh-pill" role="alert">
          {pill.reason}
        </span>
      ) : null}
    </div>
  )
}
