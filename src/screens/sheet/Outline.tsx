/* ============================================================
   THE OUTLINE — the resting door of the sheet: one full-width grid
   ordered as the file, the hierarchy as bands with a count on every
   one, identity pinned, sections folding to chips, 28 px rows.

   TWO LINT RULES ARE TURNED OFF FOR THIS FILE, for the reasons the
   quotes register gives at its own head (`src/screens/quotes/Quotes.tsx`),
   which hold here word for word: the density ruler reads WRITTEN
   `role="row"` attributes, and a grid whose one tab stop owns the
   whole keyboard vocabulary (`aria-activedescendant`) is deliberately
   not a grid of two thousand tab stops.

   WHAT THE ENGINE OWNS AND WHAT THIS FILE OWNS. `resolveKey` maps a
   keydown to an intent; `buildSections` decides which columns are
   addressable and `layoutGroups` which rows; `coerceCellText` writes
   the pill's sentence; `batch` makes a fill one step. This file owns
   the DOM: which element is the active cell, where the editor mounts,
   what scrolls when the cursor leaves the window, and the three keys
   the register vocabulary adds on top of the spreadsheet's — J, K and
   X — which are the price of a Cockpit screen and are said so in the
   legend. Folding a band or a drawer never reaches this file's
   arithmetic at all: the engine hands over `fields` and `leafRows`
   with the folded cells already gone, so navigation, paste and fill
   never learn that sections exist.

   THE ROWS ARE VIRTUALISED, and the argument the register made
   against it is answered rather than ignored. `quotes.css` refused JS
   virtualisation for a register of tens of rows because it costs the
   accessibility contract; this is a sheet of 588 to 2,937 rows across
   up to 44 columns, and the engine's own measurement (`helpers.ts`,
   "690 composited layers") is why `shouldWindowRows` exists. What is
   kept: every row in the DOM is a real `role="row"` with real cells, a
   reader is told the count (`aria-rowcount`) and each row's place
   (`aria-rowindex`), and the unit drawn whole is the DRAWER — a model
   and its variants inside one `rowgroup` — so the density ruler sees
   the head of every group it can see. react-virtuoso is the owner's
   own list (package.json) and is used as it is written: a flat list of
   pieces, measured, with the sticky header inside the scroller so the
   column heads scroll sideways with the columns they name.
   ============================================================ */
/* eslint-disable jsx-a11y/prefer-tag-over-role, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ClipboardEvent as ReactClipboardEvent,
  type MouseEvent as ReactMouseEvent,
  type HTMLAttributes,
} from 'react'
import { Virtuoso, type VirtuosoHandle, type ListRange } from 'react-virtuoso'
import type { EntityDef, FieldDef } from '@/domain/model'
import { Input, Kbd, closesStage, isField, stageKeyOf } from '@/ui'
import {
  clampCell,
  coerceCellText,
  normalizeRange,
  parseTsv,
  resolveKey,
  serializeTsv,
  type CellRef,
  type Range,
  type ViewRow,
} from '@/domain/catalogue/table/core'
import type { GridLayout } from '@/domain/catalogue/table/grouping'
import { countLabel, type LeafNoun } from '@/domain/catalogue/table/grouping'
import {
  COL_OVERSCAN,
  fullySelectedRows,
  primaryRange,
  selContains,
  singleSel,
  type GridSel,
} from '@/domain/catalogue/table/helpers'
import {
  foldChipText,
  windowColumns,
  type ColumnLayout,
  type DrawItem,
  type HeaderBand,
} from '@/domain/catalogue/table/sections'
import type { Chunk } from '@/domain/catalogue/table/outline'
import { chunkOfLeaf, drawnLines } from '@/domain/catalogue/table/outline'
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

export interface OutlineProps {
  table: EntityDef
  /** the engine's layout — `leafRows` is the addressable set */
  layout: GridLayout
  chunks: Chunk[]
  /** the addressable columns; index === grid column */
  fields: FieldDef[]
  columns: ColumnLayout
  bands: HeaderBand[]
  pinFieldId?: string
  rowH: number
  groupH: number
  /** the picture a dense row can carry, in px */
  thumb: number
  noun: LeafNoun
  heldCopy: (address: string | undefined) => Held | null
  /** the whole tree's count for a drawer, so a narrowed band can read `n / m` */
  heldOf: (key: string) => number
  narrowed: boolean
  collapsed: ReadonlySet<string>
  onToggle: (key: string) => void
  onFold: (sectionId: string) => void
  onAddRow: (path: string[], label: string) => void
  /** every cell write, whatever built it, goes through here */
  write: (w: Write) => Written
  /** one cell, typed: the engine's `updateCell` through the store */
  commit: (rowId: string, fieldId: string, text: string) => Written
  refLabelsOf: (field: FieldDef) => Map<string, string> | undefined
  cursorRowId: string | null
  onCursor: (rowId: string | null) => void
  peeking: boolean
  onPeek: (open: boolean) => void
  onSelection: (sel: GridSel | null) => void
  onFindFocus?: () => void
  onUndo: () => void
  onRedo: () => void
  now: () => Date
  ariaLabel: string
  /** a hand: two columns and a sentence for the rest */
  handSentence?: string
  /** a row the screen wants the cursor on — the one it just added */
  focusRowId?: string | null
}

/** One id per cell, so `aria-activedescendant` can name it. */
export const cellDomId = (rowId: string, col: number): string => `sh-cell-${rowId}-${col}`
export const rowDomId = (rowId: string): string => `sh-row-${rowId}`

/** A held Space under a fifth of a second is a tap (Linear's peek);
 *  longer is a glance that closes with the key. */
const HOLD_MS = 200

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

export function Outline(props: OutlineProps) {
  const {
    table,
    layout,
    chunks,
    fields,
    columns,
    bands,
    pinFieldId,
    rowH,
    groupH,
    thumb,
    noun,
    heldCopy,
    heldOf,
    narrowed,
    collapsed,
    onToggle,
    onFold,
    onAddRow,
    write,
    commit,
    refLabelsOf,
    cursorRowId,
    onCursor,
    peeking,
    onPeek,
    onSelection,
    onFindFocus,
    onUndo,
    onRedo,
    now,
    ariaLabel,
    handSentence,
    focusRowId = null,
  } = props

  const rows = layout.leafRows
  const rowCount = rows.length
  const colCount = fields.length

  const [sel, setSelRaw] = useState<GridSel>(() => singleSel({ row: 0, col: 0 }))
  const [editing, setEditing] = useState<Editing | null>(null)
  const [pill, setPill] = useState<Pill | null>(null)

  const handle = useRef<VirtuosoHandle>(null)
  const scroller = useRef<HTMLElement | null>(null)
  const heldSpaceAt = useRef<number | null>(null)
  const pending = useRef<CellRef | null>(null)

  /* THE COLUMN WINDOW — the other half of the windowing, and the
     engine's own (`windowColumns`): only the columns the scroller
     shows, two either side, are drawn on each row, and the skipped
     runs are handed back as gaps so the row keeps the sheet's width.
     A 33-column sheet draws about ten per row instead of thirty-three,
     and — the reason it was wired the day the rulers first ran — a
     thumbnail in a column scrolled out of view is not painted at all,
     so nothing off the edge of the grid can be read as standing under
     the panel beside it. The window is read off the scroller on a
     frame, never on every scroll event. */
  const [port, setPort] = useState({ left: 0, width: 0 })
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    let frame = 0
    const read = (): void => {
      frame = 0
      setPort((was) =>
        was.left === el.scrollLeft && was.width === el.clientWidth
          ? was
          : { left: el.scrollLeft, width: el.clientWidth },
      )
    }
    const ask = (): void => {
      if (frame === 0) frame = requestAnimationFrame(read)
    }
    ask()
    el.addEventListener('scroll', ask, { passive: true })
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(ask)
    ro?.observe(el)
    return () => {
      el.removeEventListener('scroll', ask)
      ro?.disconnect()
      if (frame !== 0) cancelAnimationFrame(frame)
    }
  }, [])

  /* THE CURSOR NEVER POINTS PAST THE ROWS THAT ARE HERE. A fold, a
     narrowing or a delete shrinks the addressable set under it, and
     an index kept as it was would name nobody. Clamped in the render,
     not repaired in an effect, for the reason the register gives. */
  /* memoised, because the effect that keeps the cursor on screen runs
     when this changes — a fresh object on every render meant every
     re-render, a sideways scroll included, dragged the sheet back to
     the cursor */
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

  /* A ROW THE SCREEN JUST ADDED TAKES THE CURSOR, on its first
     addressable column, so the next keystroke lands in it. Adjusted
     during the render rather than in an effect — the prop changed, the
     state follows it in the same pass, one paint instead of two. */
  const [followed, setFollowed] = useState<string | null>(null)
  if (focusRowId && focusRowId !== followed) {
    const r = rows.findIndex((row) => row.rowId === focusRowId)
    if (r >= 0) {
      setFollowed(focusRowId)
      setSelRaw(singleSel({ row: r, col: 0 }))
    }
  }

  /* ---- keeping the cursor on screen ------------------------ */

  const headH = useCallback((): number => {
    const head = scroller.current?.querySelector<HTMLElement>('.sh-head')
    return head ? head.getBoundingClientRect().height : 0
  }, [])

  /** Bring a cell into the window, both axes, without smoothing —
   *  the sweep found one motion in its frames and it was a failure. */
  const reveal = useCallback(
    (cell: CellRef): boolean => {
      const sc = scroller.current
      const row = rows[cell.row]
      if (!sc || !row) return true
      const el = document.getElementById(cellDomId(row.rowId, cell.col))
      if (!el) return false
      const box = el.getBoundingClientRect()
      const inside = sc.getBoundingClientRect()
      const top = inside.top + headH()
      if (box.top < top) sc.scrollTop -= top - box.top
      else if (box.bottom > inside.bottom) sc.scrollTop += box.bottom - inside.bottom
      /* the frozen name column covers the left edge, so a cell hiding
         under it is genuinely off screen — `pinWidthOf`'s own point */
      const pinCell = el.parentElement?.querySelector<HTMLElement>('[data-pin]')
      const pinW = pinCell && pinCell !== el ? pinCell.getBoundingClientRect().width : 0
      if (el.hasAttribute('data-pin')) return true
      if (box.left < inside.left + pinW) sc.scrollLeft -= inside.left + pinW - box.left
      else if (box.right > inside.right) sc.scrollLeft += box.right - inside.right
      return true
    },
    [headH, rows],
  )

  useEffect(() => {
    if (rowCount === 0) return
    if (reveal(active)) return
    /* the piece that draws it is not mounted: ask the virtualiser,
       then finish the job when it has drawn the piece */
    const index = chunkOfLeaf(chunks, active.row)
    if (index < 0) return
    pending.current = active
    handle.current?.scrollToIndex({ index, align: 'start', offset: -headH() })
  }, [active, chunks, headH, reveal, rowCount])

  const onRange = useCallback(
    (_range: ListRange) => {
      if (!pending.current) return
      requestAnimationFrame(() => {
        if (pending.current && reveal(pending.current)) pending.current = null
      })
    },
    [reveal],
  )

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
        if ('refused' in outcome)
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
      /* A BLUR WITHOUT A CHANGE WRITES NOTHING — the original's own
         component rule, kept: the engine refuses an unchanged cell
         with an empty sentence and the store records no step. */
      if (field && row && e.draft !== seedOf(field, row)) {
        const outcome = commit(e.rowId, e.fieldId, e.draft)
        if ('refused' in outcome && outcome.refused !== '') {
          setPill({ rowId: e.rowId, fieldId: e.fieldId, reason: outcome.refused })
          scroller.current?.focus()
          return
        }
      }
      setPill(null)
      scroller.current?.focus()
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
    scroller.current?.focus()
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

  /** X — Linear's row select: the whole row joins or leaves the
   *  selection as its own range, the cursor staying where it is. */
  const toggleRow = useCallback(() => {
    if (colCount === 0 || rowCount === 0) return
    const r = active.row
    const already = sel.ranges.some((rg) => {
      const n = normalizeRange(rg)
      return n.r0 === r && n.r1 === r && n.c0 === 0 && n.c1 === colCount - 1
    })
    const rowRange: Range = { anchor: { row: r, col: 0 }, focus: { row: r, col: colCount - 1 } }
    const ranges = already
      ? sel.ranges.filter((rg) => {
          const n = normalizeRange(rg)
          return !(n.r0 === r && n.r1 === r && n.c0 === 0 && n.c1 === colCount - 1)
        })
      : [
          ...sel.ranges.filter(
            (rg) => rg.anchor.row !== r || rg.focus.row !== r || rg.anchor.col !== rg.focus.col,
          ),
          rowRange,
        ]
    setSel({ active, ranges: ranges.length === 0 ? [{ anchor: active, focus: active }] : ranges })
  }, [active, colCount, rowCount, sel.ranges, setSel])

  /** The drawer the cursor is in, innermost first, for `[` and `]`. */
  const drawerOf = useCallback(
    (r: number): string[] => {
      const out: string[] = []
      let inner: string | null = null
      for (const c of chunks) {
        if (c.kind === 'drawer' && c.leaves.some((l) => l.r === r)) {
          inner = c.key
          break
        }
      }
      if (inner === null) return out
      out.push(inner)
      /* the branch above it: the longest key that prefixes this one */
      for (const c of chunks) {
        if (c.kind === 'branch' && inner.startsWith(`${c.key}001F`)) out.push(c.key)
      }
      return out
    },
    [chunks],
  )

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (isField(event.target)) return
    const { key } = event
    const mod = event.ctrlKey || event.metaKey
    const plain = !mod && !event.altKey

    if (plain && !event.shiftKey && (key === 'j' || key === 'J')) {
      event.preventDefault()
      moveTo({ row: active.row + 1, col: active.col }, false)
      return
    }
    if (plain && !event.shiftKey && (key === 'k' || key === 'K')) {
      event.preventDefault()
      moveTo({ row: active.row - 1, col: active.col }, false)
      return
    }
    if (plain && (key === 'x' || key === 'X')) {
      event.preventDefault()
      toggleRow()
      return
    }
    if (plain && key === '/') {
      event.preventDefault()
      onFindFocus?.()
      return
    }
    if (plain && (key === '[' || key === ']')) {
      event.preventDefault()
      const drawers = drawerOf(active.row)
      if (key === '[') {
        const open = drawers.find((k) => !collapsed.has(k))
        if (open) onToggle(open)
      } else {
        const shut = drawers.toReversed().find((k) => collapsed.has(k))
        if (shut) onToggle(shut)
      }
      return
    }
    if (plain && (key === ' ' || key === 'Spacebar')) {
      event.preventDefault()
      if (event.repeat) return
      heldSpaceAt.current = now().getTime()
      onPeek(true)
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
        return
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
      case 'copy':
      case 'paste':
        /* the browser's own copy, cut and paste events carry the
           clipboard without a permission prompt; they fire after this
           keydown and are handled below */
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
    if (now().getTime() - down >= HOLD_MS) onPeek(false)
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
    const text = event.clipboardData.getData('text/plain')
    const parsed = parseTsv(text)
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
     not, or every first click would open an editor. The mousedown
     moves the cursor and the click that follows it has to know which
     kind it was, so the answer is kept across the two events. */
  const downOnActive = useRef(false)

  const onCellDown = useCallback(
    (event: ReactMouseEvent, cell: CellRef) => {
      if (event.button !== 0) return
      /* the grid keeps the focus, so the vocabulary keeps working and
         nothing in the page is text-selected by a drag across cells */
      event.preventDefault()
      scroller.current?.focus()
      downOnActive.current = !event.shiftKey && active.row === cell.row && active.col === cell.col
      moveTo(cell, event.shiftKey)
      if (peeking) onPeek(true)
    },
    [active, moveTo, onPeek, peeking],
  )

  const onCellPress = useCallback(
    (cell: CellRef) => {
      if (downOnActive.current) start(cell)
      downOnActive.current = false
    },
    [start],
  )

  /* ---- what is drawn ---------------------------------------- */

  const total = columns.total
  const items = useMemo(
    () => windowColumns(columns, port.left, port.width, COL_OVERSCAN, editing?.col, pinFieldId),
    [columns, editing?.col, pinFieldId, port.left, port.width],
  )
  /* a picture is painted only inside the window itself, with no overscan */
  const pictureInView = (x: number, w: number): boolean =>
    port.width > 0 && x < port.left + port.width && x + w > port.left
  const picked = useMemo(() => new Set(fullySelectedRows(sel, colCount)), [colCount, sel])
  const editingKey = editing ? `${editing.rowId}|${editing.fieldId}` : ''

  const renderLine = (
    line: Extract<Chunk, { kind: 'branch' }>['line'],
    at: number,
    add?: { path: string[]; label: string; named: boolean },
  ) => {
    const { node } = line
    const shut = collapsed.has(node.key)
    const held = heldOf(node.key)
    return (
      <div
        role="row"
        aria-rowindex={at + 1}
        className="sh-line"
        data-level={node.level}
        style={{ height: groupH, width: total }}
      >
        <div role="gridcell" aria-colspan={Math.max(1, colCount)} className="sh-line__cell">
          <button
            type="button"
            className="sh-line__toggle"
            tabIndex={-1}
            aria-expanded={!shut}
            onClick={() => onToggle(node.key)}
          >
            <span className="sh-line__caret" aria-hidden="true">
              {shut ? '▸' : '▾'}
            </span>
            <span className="sh-line__name">{node.value === '' ? '(unassigned)' : node.value}</span>
            <span className="sh-line__count">
              {narrowed && held !== node.leafCount
                ? `${node.leafCount.toLocaleString('en-AU')} / ${held.toLocaleString('en-AU')}`
                : countLabel(node.leafCount, noun)}
            </span>
          </button>
          {add && add.named && !shut ? (
            <button
              type="button"
              className="sh-line__add"
              tabIndex={-1}
              onClick={() => onAddRow(add.path, add.label)}
            >
              + {noun.one}
            </button>
          ) : null}
        </div>
      </div>
    )
  }

  const renderLeaf = (line: Extract<Chunk, { kind: 'leaf' }>['line'], at: number) => {
    const row = rows[line.r]
    if (!row) return null
    const on = row.rowId === cursorRowId
    return (
      <div
        key={row.rowId}
        role="row"
        id={rowDomId(row.rowId)}
        aria-rowindex={at + 1}
        aria-selected={picked.has(line.r) ? true : undefined}
        className="sh-row"
        data-on={on ? '' : undefined}
        data-peeking={on && peeking ? '' : undefined}
        data-picked={picked.has(line.r) ? '' : undefined}
        style={{ height: rowH, width: total }}
      >
        {items.map((item) => {
          if (item.kind === 'gap') {
            return (
              <div key={item.key} className="sh-gap" style={{ width: item.w }} aria-hidden="true" />
            )
          }
          const { slot, w, x } = item.placed
          if (slot.kind === 'fold') {
            return (
              <div
                key={`fold:${slot.section.id}`}
                role="gridcell"
                className="sh-cell sh-cell--fold"
                aria-label={`${slot.section.name}, folded`}
                style={{ width: w }}
              />
            )
          }
          const field = slot.field
          const cell: CellRef = { row: line.r, col: slot.col }
          const isActive = active.row === cell.row && active.col === cell.col
          const isEditing = editingKey === `${row.rowId}|${field.id}`
          const ownPill =
            pill && pill.rowId === row.rowId && pill.fieldId === field.id ? pill : null
          return (
            <Cell
              key={field.id}
              table={table}
              row={row}
              field={field}
              cell={cell}
              width={w}
              pinned={field.id === pinFieldId}
              active={isActive}
              selected={selContains(sel, cell)}
              editing={isEditing ? editing : null}
              pill={ownPill}
              thumb={pictureInView(x, w) ? thumb : 0}
              heldCopy={heldCopy}
              onDown={onCellDown}
              onPress={onCellPress}
              onOpen={start}
              onDraft={(draft) => setEditing((e) => (e ? { ...e, draft } : e))}
              onFinish={finish}
              onCancel={cancel}
            />
          )
        })}
      </div>
    )
  }

  const activeId = cursorRow ? cellDomId(cursorRow.rowId, active.col) : undefined

  /* the virtualiser is handed the two drawing functions through its
     own `context`, so the piece renderer is one module-level function
     and nothing component-shaped is minted inside a render */
  const headContext: DrawContext = {
    bands,
    columns,
    table,
    onFold,
    pinFieldId,
    total,
    items,
    renderLine,
    renderLeaf,
  }
  const components = useMemo(() => ({ Header, List }), [])

  return (
    <div className="sh-outline">
      <Virtuoso<Chunk>
        ref={handle}
        scrollerRef={(el) => {
          scroller.current = el instanceof HTMLElement ? el : null
        }}
        className="sh-grid"
        data-testid="sheet-grid"
        data-rows={rowCount}
        role="grid"
        aria-label={ariaLabel}
        aria-rowcount={drawnLines(chunks)}
        aria-colcount={colCount}
        aria-multiselectable={true}
        aria-activedescendant={activeId}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onCopy={onCopy}
        onCut={onCut}
        onPaste={onPaste}
        data={chunks}
        computeItemKey={(_i, c) => c.key}
        rangeChanged={onRange}
        increaseViewportBy={{ top: rowH * 2, bottom: rowH * 4 }}
        initialItemCount={Math.min(chunks.length, 12)}
        components={components}
        context={headContext}
        itemContent={drawChunk}
      />

      {handSentence ? (
        <p className="sh-hand" data-testid="sheet-hand">
          {handSentence}
        </p>
      ) : null}
    </div>
  )
}

/** THE VOCABULARY, PRINTED WHERE THE KEYS ARE LIVE. Superhuman renders
 *  the shortcut inline to teach it; the register prints its own on its
 *  act row. Each key here is an act on the grid, and the three the
 *  register vocabulary adds to the spreadsheet's — J, K and X — are
 *  named so nobody types a K into a cell and wonders where it went. */
export function Legend() {
  return (
    <p className="sh-keys" data-testid="sheet-keys">
      <Kbd>J</Kbd>
      <Kbd>K</Kbd> move · <Kbd>Shift ↕</Kbd> extend · <Kbd>X</Kbd> row · <Kbd>Space</Kbd> peeks ·{' '}
      <Kbd>Enter</Kbd> edits · <Kbd>Mod D</Kbd> fill · <Kbd>Mod Z</Kbd> undo · <Kbd>Esc</Kbd> closes
      · <Kbd>/</Kbd> find
    </p>
  )
}

/** The virtualiser's own list element, given nothing but its role: the
 *  grid's rows sit under it and the header before it. */
const List = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function List(props, ref) {
  return <div {...props} ref={ref} className="sh-list" />
})

/** What the sticky header needs, handed to it through the
 *  virtualiser's own `context` so the component is defined once and
 *  never re-created inside a render. */
interface HeadContext {
  bands: HeaderBand[]
  columns: ColumnLayout
  /** the columns in the window, with the skipped runs as gaps */
  items: DrawItem[]
  table: EntityDef
  onFold: (sectionId: string) => void
  pinFieldId?: string
  total: number
}

type GroupLine = Extract<Chunk, { kind: 'branch' }>['line']
type LeafLine = Extract<Chunk, { kind: 'leaf' }>['line']

/** …and what each piece needs: the two drawing functions, which close
 *  over the grid's state and are handed down the same way. */
interface DrawContext extends HeadContext {
  renderLine: (
    line: GroupLine,
    at: number,
    add?: { path: string[]; label: string; named: boolean },
  ) => React.ReactNode
  renderLeaf: (line: LeafLine, at: number) => React.ReactNode
}

/** One piece of the list: a series line alone, a drawer with its rows
 *  inside one rowgroup, or a row of a flat table. */
function drawChunk(_i: number, c: Chunk, ctx: DrawContext): React.ReactNode {
  if (c.kind === 'branch') {
    return (
      <div
        role="rowgroup"
        aria-label={c.line.node.value === '' ? '(unassigned)' : c.line.node.value}
      >
        {ctx.renderLine(c.line, c.at)}
      </div>
    )
  }
  if (c.kind === 'drawer') {
    return (
      <div
        role="rowgroup"
        aria-label={c.head.node.value === '' ? '(unassigned)' : c.head.node.value}
      >
        {ctx.renderLine(
          c.head,
          c.at,
          c.add ? { path: c.add.path, label: c.add.label, named: c.add.named } : undefined,
        )}
        {c.leaves.map((leaf, i) => ctx.renderLeaf(leaf, c.at + 1 + i))}
      </div>
    )
  }
  return ctx.renderLeaf(c.line, c.at)
}

/** THE STICKY HEADER: the section bands over the column heads, inside
 *  the scroller so both scroll sideways with the cells they name. Two
 *  rows of the grid, not a rowgroup — the density ruler subtracts the
 *  whole header through the route's own `minus`, so a rowgroup here
 *  would count its band row twice. */
function Header({ context }: { context?: HeadContext }) {
  if (!context) return null
  const { bands, items, table, onFold, pinFieldId, total } = context
  return (
    <div className="sh-head" style={{ width: total }} data-testid="sheet-head">
      <div className="sh-bands" role="row" style={{ width: total }}>
        {bands.map((band) => (
          <BandHead key={band.key} band={band} onFold={onFold} table={table} />
        ))}
      </div>
      <div className="sh-heads" role="row" style={{ width: total }}>
        {items.map((item) => {
          if (item.kind === 'gap') {
            return (
              <div key={item.key} className="sh-gap" style={{ width: item.w }} aria-hidden="true" />
            )
          }
          const { slot, w } = item.placed
          return slot.kind === 'fold' ? (
            <div
              key={`fold:${slot.section.id}`}
              role="columnheader"
              className="sh-th sh-th--fold"
              style={{ width: w }}
            >
              <button
                type="button"
                className="sh-chip"
                tabIndex={-1}
                onClick={() => onFold(slot.section.id)}
                aria-label={`Unfold ${slot.section.name}, ${slot.count} columns`}
              >
                {foldChipText(slot.section, slot.count)}
              </button>
            </div>
          ) : (
            <div
              key={slot.field.id}
              role="columnheader"
              aria-colindex={slot.col + 1}
              className="sh-th"
              data-pin={slot.field.id === pinFieldId ? '' : undefined}
              data-num={slot.field.type === 'number' ? '' : undefined}
              style={{ width: w }}
            >
              <span className="sh-th__name">{slot.field.name}</span>
              {isCost(table, slot.field) ? (
                <span className="sh-th__cost" aria-label="the dealer's own cost column">
                  {COST_WORD}
                </span>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* A band's head                                               */
/* ---------------------------------------------------------- */

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
        className="sh-band sh-band--none"
        style={{ width: band.w }}
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
      className="sh-band"
      data-pin={band.pinned ? '' : undefined}
      data-muted={band.muted ? '' : undefined}
      data-folded={folded ? '' : undefined}
      style={{ width: band.w }}
    >
      {band.muted ? null : (
        <button
          type="button"
          className="sh-band__fold"
          tabIndex={-1}
          aria-expanded={!folded}
          onClick={() => onFold(section.id)}
          aria-label={`${folded ? 'Unfold' : 'Fold'} ${section.name}, ${count} ${count === 1 ? 'column' : 'columns'}${cost ? `, the dealer's own cost on ${table.name}` : ''}`}
        >
          <span className="sh-band__name">{section.name}</span>
          <span className="sh-band__count">{count}</span>
          {cost ? <span className="sh-band__cost">{COST_WORD}</span> : null}
        </button>
      )}
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
  cell: CellRef
  width: number
  pinned: boolean
  active: boolean
  selected: boolean
  editing: Editing | null
  pill: Pill | null
  thumb: number
  heldCopy: (address: string | undefined) => Held | null
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
  cell,
  width,
  pinned,
  active,
  selected,
  editing,
  pill,
  thumb,
  heldCopy,
  onDown,
  onPress,
  onOpen,
  onDraft,
  onFinish,
  onCancel,
}: CellProps) {
  const picture = field.type === 'image' ? pictureOf(row, field, heldCopy) : null
  const text = field.type === 'image' ? '' : paintOf(table, field, row)
  const num = field.type === 'number'
  const said =
    field.type === 'image'
      ? picture === null
        ? 'no picture'
        : picture.kind === 'held'
          ? 'a held picture'
          : HELD_AS_A_LINK
      : text === ''
        ? 'empty'
        : text
  return (
    <div
      role="gridcell"
      id={cellDomId(row.rowId, cell.col)}
      tabIndex={-1}
      aria-colindex={cell.col + 1}
      aria-selected={selected ? true : undefined}
      className="sh-cell"
      data-pin={pinned ? '' : undefined}
      data-num={num ? '' : undefined}
      data-active={active ? '' : undefined}
      data-selected={selected ? '' : undefined}
      data-cost={isCost(table, field) ? '' : undefined}
      style={{ width }}
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
           is out of the tab order because the grid is the one tab
           stop and owns the keys. */
        <button
          type="button"
          className="sh-cell__read"
          tabIndex={-1}
          aria-label={`${field.name}: ${said}`}
          onClick={() => onPress(cell)}
        >
          {picture === null ? (
            /* a span, because an ellipsis is drawn by a block with inline
               content and never by a flex box's own text */
            <span className="sh-cell__text">{text}</span>
          ) : picture.kind === 'held' ? (
            /* a held copy is painted only while its column is in the
               window (a zero thumb is the grid saying "not now"); the
               cell keeps its words for a reader either way */
            thumb > 0 ? (
              <img
                className="sh-thumb"
                src={picture.held.at}
                width={Math.round((picture.held.w / picture.held.h) * thumb)}
                height={thumb}
                alt=""
                loading="lazy"
                decoding="async"
              />
            ) : null
          ) : (
            <span className="sh-cell__link">{HELD_AS_A_LINK}</span>
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

/** The engine's own coercion, exposed so the record panel commits a
 *  typed value the way a cell does. */
export const coerce = coerceCellText
