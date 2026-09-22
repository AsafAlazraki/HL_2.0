/* ============================================================
   THE SHEET, at /data/$table — one table, dense, worked in, edited in
   place. Direction A, "The outline", of docs/research/refs/sheet/notes.md
   §5, ASSIGNED for this round rather than picked: the critic found
   that the obvious picks would stamp one list-left, detail-right shape
   across four Cockpit screens (critique-m2.md §3), so the sheet rests
   as one full-width grid ordered as the file and keeps the other two
   doors the plan demands as what they are — B's gallery as a head
   toggle whose unit is the model, and C's record as the side panel
   that keeps the row lit. D's "two identities" survives for a pairing:
   the master is the boat side, said in `outlineLevels`. Provisional
   until the owner looks (docs/SCREENS.md).

   ── WHAT THE SWEEP DECIDED, AND WHERE ─────────────────────────

   THE DEPTH LADDER: `tools/excel-outline.png` — one press opens the
   whole sheet to one level; ours reads Series · Model · Every row in
   the dealer's own column names (`ladderRungs`). THE COUNT ON EVERY
   BAND: `tools/aggrid-grouping.png`, "United States (1109)", so a shut
   drawer says what it holds, and while a query narrows it reads
   `n / m`. THE RECORD BESIDE THE ROW: `tools/nocodb-expand.png`, the
   side panel on a desk with the row still lit and a full-screen drawer
   in a hand. THE MIXED SET: `tools/figma-mixed.png`, every distinct
   value counted before a fill writes. THE PICTURE AT 24 / 32 / 44:
   `tools/airtable-grid-rowheight.png` and the sweep's own reading of
   the held copies.

   ── THE PUBLISHED NUMBERS AGAINST THE PORTED ENGINE ───────────
   (critique-m2.md §6 asked for this paragraph; each disagreement is
   decided here and recorded in docs/DECISIONS.md.)

   `docs/reference/dense-tables-and-selection.md` is the document
   written for this screen and the sweep never cited it. Read against
   `helpers.ts`, four of its numbers disagree with the engine:

     · 150 PX COLUMN FLOOR (Grafana) against `FIT_MIN_COL_W = 116`.
       The engine's floor was MEASURED, twice: one press of FIT at a
       28 px private floor took Stacer's clipped values from 26 to
       119, and the 116 that replaced it is the width at which the
       cell's own inset and a 12 px face still read. Grafana's 150 is
       a default for panels whose columns are few; a 33-column sheet at
       150 is 4,950 px wide against 1,280. The engine's 116 stands, and
       a value that still cannot fit says so by ellipsis with its whole
       self as the cell's title.
     · 32 PX DEFAULT ROW (Retool's ladder) against `ROW_H = 28`. The
       register already argued 28 and measured it: a grouped Cockpit
       screen at 1280 × 800 owes eighteen rows under its band heads
       and 32 does not hold them. 28 rests; 36 and 48 are the two
       steps a dealer may choose (`ROW_HEIGHTS`), each named by the
       picture it carries, and neither is the resting state the
       promise is made at.
     · FIXED LAYOUT ABOVE TWELVE COLUMNS (Observable) against FIT. Not
       a disagreement once read closely: every column here has an
       explicit width from `widthOf` and the sheet scrolls sideways,
       which IS Observable's fixed layout. FIT is the one press that
       shares the window out and stops at the floor. The rule is
       adopted as stated and it was already true.
     · WCAG 2.1.4 CHARACTER KEY SHORTCUTS against `keys.ts`'s
       single-key vocabulary. Level A, and nobody in the cohort meets
       it. The engine's own keys are all chords or named keys; the
       three single letters this screen adds — J, K, X — and `/`, `[`,
       `]` are bound on the grid alone, which is the criterion's third
       exemption ("active only on focus"), and the legend under the
       grid says so. A remap panel is Milestone 4's, beside the other
       preferences, and until then the exemption is the honest claim.

   ── WHAT IS TRUE ON THIS BUILD ─────────────────────────────────

     · EVERY WRITE IS A COMMAND WITH A WAY BACK, applied through
       `src/state/catalogue.ts`, and UNDO is pinned to the event id in
       the step line under the head — the configurator's rail head,
       not a toast. A fill, a paste and a clear are one `batch` each.
     · A STRUCTURAL CHANGE IS OFFERED, NEVER A SIDE EFFECT. The one
       thing on this screen that adds structure — a column — is a
       sentence naming the table, the column and how many rows it
       lands empty on, with the act under the sentence; `structure.test.ts`
       reads this file to hold it there (docs/LATER.md's owed guard,
       ported).
     · A COST COLUMN SHOWS HERE AND SAYS SO. The sheet is the dealer's
       own file; the word "cost" stands at the head of every column
       the file marks as one, and a sentence in the tools row counts
       them. None of it reaches a customer surface: the guard in
       tools/check.ts refuses the names and the ids in this source.
     · A COLOURWAY CODE IS SHOWN AS THE CODE IT IS. Seven tokens ride
       in the Variant column and four are undecoded; nothing here
       parses one into a swatch.
   ============================================================ */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Input, Kbd, Select, Tile } from '@/ui'
import { displayFieldOf, rowLabel, type EntityDef, type FieldDef } from '@/domain/model'
import { newId } from '@/domain/id'
import {
  addField,
  addRow,
  deleteRow,
  updateCell,
  type CatalogueCommand,
} from '@/domain/catalogue/commands'
import { dataOf, catalogue } from '@/state/catalogue'
import { useCatalogue } from '@/app/useStores'
import { applyView, coerceCellText, type ViewRow } from '@/domain/catalogue/table/core'
import {
  branchNoun,
  buildGroups,
  countLabel,
  layoutGroups,
  leafFieldsOf,
  leafNoun,
  type GroupNode,
} from '@/domain/catalogue/table/grouping'
import {
  bandsOf,
  buildSections,
  fitColumns,
  foldWidthFor,
  layoutColumns,
} from '@/domain/catalogue/table/sections'
import { DEFAULT_COL_W, type GridSel } from '@/domain/catalogue/table/helpers'
import {
  dataColumnWidth,
  nameColumnWidth,
  widestOf,
} from '@/domain/catalogue/table/nameColumnWidth'
import { COLUMN_KINDS } from '@/domain/catalogue/table/columnKinds'
import {
  chunkLines,
  collapsedAtDepth,
  handColumns,
  isRowHeightKey,
  labelIndex,
  ladderRungs,
  OUTLINE_GROUP_H,
  outlineLevels,
  ROW_HEIGHTS,
  viewRowsOf,
  type RowHeightKey,
} from '@/domain/catalogue/table/outline'
import { Legend, Outline, type Written } from './Outline'
import { Record } from './Record'
import { Gallery } from './Gallery'
import { heldCopy, whiteMarkFor } from './pictures'
import {
  cardsOf,
  COST_WORD,
  DATA_INDEX,
  handSentence,
  isCost,
  mixedSet,
  NO_SHEET,
  NO_WAY_TO_THE_FILE,
  noTable,
  setAllWrite,
  fillDownWrite,
  type Write,
} from './read'
import './sheet.css'

export type Door = 'outline' | 'gallery'

export interface SheetPosition {
  door?: Door
  at?: string
  find?: string
  depth?: number
  rows?: RowHeightKey
  fold?: string
  model?: string
}

export interface SheetProps {
  tableId: string
  business?: string | null
  door?: Door
  /** the row the record is open on */
  at?: string
  find?: string
  /** the rung of the depth ladder; absent is every row */
  depth?: number
  rows?: RowHeightKey
  /** folded section ids, comma-joined */
  fold?: string
  /** the gallery card that is open */
  model?: string
  onPosition?: (position: SheetPosition) => void
  goHome?: () => void
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

/** The width the grid has, read off its own box. */
function useWidth(ref: React.RefObject<HTMLElement | null>, ready: boolean): number {
  const [w, setW] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el || !ready) return
    setW(el.getBoundingClientRect().width)
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => setW(el.getBoundingClientRect().width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, ready])
  return w
}

/** A painted-width measure off a canvas in the grid's own face — the
 *  apparatus `nameColumnWidth.ts` says the screen brings. */
function usePainted(
  ref: React.RefObject<HTMLElement | null>,
  ready: boolean,
): ((s: string) => number) | undefined {
  const [measure, setMeasure] = useState<((s: string) => number) | undefined>(undefined)
  /* `ready` is in the dependencies because the box this reads is drawn
     only once the table has loaded, and a ref never changes identity
     when what it points at arrives */
  useEffect(() => {
    const el = ref.current
    if (!el || !ready || typeof document === 'undefined') return
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    /* the face the NAME column is painted in, read off a painted name
       cell — the shorthand `font` does not serialise in every engine,
       so the three parts are read and joined */
    const face =
      el.querySelector<HTMLElement>('.sh-cell[data-pin] .sh-cell__read') ??
      el.querySelector<HTMLElement>('.sh-cell__read') ??
      el
    const style = getComputedStyle(face)
    if (!style.fontSize || !style.fontFamily) return
    ctx.font = `${style.fontWeight || '400'} ${style.fontSize} ${style.fontFamily}`
    setMeasure(() => (s: string) => ctx.measureText(s).width)
  }, [ref, ready])
  return measure
}

export function Sheet({
  tableId,
  business = null,
  door = 'outline',
  at = '',
  find = '',
  depth,
  rows: rowsKey = 'dense',
  fold = '',
  model = '',
  onPosition,
  goHome,
  openTheFile,
  now = THE_CLOCK,
}: SheetProps) {
  const status = useCatalogue((s) => s.status)
  const problem = useCatalogue((s) => s.problem)
  const tables = useCatalogue((s) => s.tables)
  const allRows = useCatalogue((s) => s.rows)
  const index = useCatalogue((s) => s.index)

  const table: EntityDef | undefined = tables[tableId]
  const open = status === 'ready' && Object.keys(tables).length > 0
  const read = status === 'ready' || status === 'failed'

  const hand = useHand()
  const body = useRef<HTMLDivElement>(null)
  const available = useWidth(body, table !== undefined)
  const measure = usePainted(body, table !== undefined)

  const [query, setQuery] = useState(find)
  const [peeking, setPeeking] = useState(at !== '')
  const [cursorRowId, setCursorRowId] = useState<string | null>(null)
  const [selection, setSelection] = useState<GridSel | null>(null)
  const [step, setStep] = useState<Step | null>(null)
  const [refused, setRefused] = useState<string | null>(null)
  const [focusRowId, setFocusRowId] = useState<string | null>(null)
  const field = useRef<HTMLElement>(null)

  const rowH = ROW_HEIGHTS[isRowHeightKey(rowsKey) ? rowsKey : 'dense']

  /* ---- the reading ------------------------------------------ */

  const tableRows = useMemo(() => allRows[tableId] ?? [], [allRows, tableId])
  /* THE LINKED ROW IS FOUND BY ITS ID ALONE, through the store's own
     index: a row id names one row on the whole sheet, so the table a
     link was declared against is not needed to resolve it — and a
     link that was re-pointed still reads the row it holds. */
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
  const heldByKey = useMemo(() => {
    const m = new Map<string, number>()
    const walk = (nodes: readonly GroupNode[]) => {
      for (const n of nodes) {
        m.set(n.key, n.leafCount)
        walk(n.children)
      }
    }
    walk(roots)
    return m
  }, [roots])
  const narrowed = query.trim() !== ''
  const searched = useMemo(
    () => (table && narrowed ? applyView(view, table.fields, { search: query }) : view),
    [table, narrowed, query, view],
  )
  const rootsShown = useMemo(
    () => (narrowed ? buildGroups(searched, levels, textOf) : roots),
    [narrowed, searched, levels, textOf, roots],
  )

  /* the depth ladder is the URL's; a single drawer pressed is this
     render's, and a press on the ladder resets every drawer */
  const rungs = useMemo(() => (table ? ladderRungs(table, levels) : []), [table, levels])
  const rung = depth === undefined || depth < 1 || depth > rungs.length ? rungs.length : depth
  const [collapsed, setCollapsed] = useState<Set<string>>(() => collapsedAtDepth(roots, rung))
  const lastRung = useRef(rung)
  const lastRoots = useRef(roots)
  useEffect(() => {
    if (lastRung.current !== rung || lastRoots.current !== roots) {
      lastRung.current = rung
      lastRoots.current = roots
      setCollapsed(collapsedAtDepth(roots, rung))
    }
  }, [roots, rung])

  const metrics = useMemo(
    () => ({ rowH: rowH.rowH, groupH: OUTLINE_GROUP_H, addH: 0 }),
    [rowH.rowH],
  )
  const layout = useMemo(
    () => layoutGroups(searched, rootsShown, collapsed, metrics),
    [searched, rootsShown, collapsed, metrics],
  )
  const chunks = useMemo(() => chunkLines(layout.lines), [layout])

  const pinId = table ? displayFieldOf(table)?.id : undefined
  const foldSet = useMemo(() => new Set(fold.split(',').filter(Boolean)), [fold])
  const gridFields = useMemo(
    () => (table && hand ? handColumns(table, leafFields) : leafFields),
    [table, hand, leafFields],
  )
  const sections = useMemo(
    () => buildSections(gridFields, table?.sections, foldSet, pinId),
    [gridFields, table?.sections, foldSet, pinId],
  )

  /* THE NAME COLUMN TAKES THE ROOM ITS NAMES NEED, and so does a
     link column — `nameColumnWidth.ts` argues both; this is the
     canvas it asked the screen to bring. */
  const widths = useMemo(() => {
    const out: Record<string, number> = {}
    if (!table || !measure || available <= 0) return out
    for (const f of sections.fields) {
      if (f.id === pinId) {
        const widest = widestOf(
          view.map((r) => r.text[f.id] ?? ''),
          measure,
        )
        out[f.id] = nameColumnWidth(widest, available)
      } else if (f.type === 'reference') {
        const widest = widestOf(
          view.map((r) => r.text[f.id] ?? ''),
          measure,
        )
        out[f.id] = dataColumnWidth(widest, DEFAULT_COL_W.reference, available)
      }
    }
    return out
  }, [available, table, measure, pinId, sections.fields, view])
  const foldW = useMemo(
    () => foldWidthFor(sections.slots, widths, available),
    [available, sections.slots, widths],
  )
  /* A HAND REFUSES SIDEWAYS SCROLL, so its two columns share the width
     the way FIT shares it — the engine's own `fitColumns`, which stops
     at the 116 px floor. The name keeps the room its names need and the
     fact takes what is left; measured at 390 the two fit with room to
     spare, and if a name ever pushed past the floor the grid would
     scroll and the sentence under it would still say where the rest is. */
  const fitted = useMemo(() => {
    if (!hand || available <= 0) return widths
    const fit = fitColumns(sections.slots, widths, available, pinId)
    return { ...widths, ...fit.widths }
  }, [available, hand, pinId, sections.slots, widths])
  const columns = useMemo(
    () => layoutColumns(sections.slots, fitted, foldW),
    [sections.slots, fitted, foldW],
  )
  const bands = useMemo(() => bandsOf(columns, pinId), [columns, pinId])

  const noun = useMemo(() => leafNoun(table), [table])
  const branch = useMemo(() => branchNoun(table), [table])
  const costFields = useMemo(
    () => (table ? table.fields.filter((f) => isCost(table, f)) : []),
    [table],
  )
  const refLabelsOf = useCallback(
    (f: FieldDef): Map<string, string> | undefined => {
      if (f.type !== 'reference' || !f.refEntityId) return undefined
      const target = tables[f.refEntityId]
      return target ? labelIndex(target, allRows[f.refEntityId] ?? []) : undefined
    },
    [allRows, tables],
  )

  /* ---- the address ------------------------------------------ */

  const cursorRow = useMemo(
    () => (cursorRowId ? layout.leafRows.find((r) => r.rowId === cursorRowId) : undefined),
    [cursorRowId, layout.leafRows],
  )
  const openRowId = peeking && cursorRow ? cursorRow.rowId : undefined

  useEffect(() => {
    onPosition?.({
      door: door === 'outline' ? undefined : door,
      at: openRowId,
      find: query.trim() === '' ? undefined : query,
      depth: rung === rungs.length ? undefined : rung,
      rows: rowsKey === 'dense' ? undefined : rowsKey,
      fold: fold === '' ? undefined : fold,
      model: model === '' ? undefined : model,
    })
  }, [door, fold, model, onPosition, openRowId, query, rowsKey, rung, rungs.length])

  const go = useCallback(
    (next: Partial<SheetPosition>) => {
      onPosition?.({
        door: door === 'outline' ? undefined : door,
        at: openRowId,
        find: query.trim() === '' ? undefined : query,
        depth: rung === rungs.length ? undefined : rung,
        rows: rowsKey === 'dense' ? undefined : rowsKey,
        fold: fold === '' ? undefined : fold,
        model: model === '' ? undefined : model,
        ...next,
      })
    },
    [door, fold, model, onPosition, openRowId, query, rowsKey, rung, rungs.length],
  )

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

  const onAddRow = useCallback(
    (path: string[]) => {
      if (!table) return
      const values: Record<string, string> = {}
      levels.forEach((id, i) => {
        if (path[i] !== undefined) values[id] = path[i]
      })
      const rowId = newId()
      const outcome = apply(addRow(table.id, values, rowId))
      if ('said' in outcome) setFocusRowId(rowId)
    },
    [apply, table, levels],
  )

  const onDelete = useCallback(
    (rowId: string) => {
      if (!table) return
      const outcome = apply(deleteRow(table.id, rowId))
      if ('said' in outcome) setPeeking(false)
    },
    [apply, table],
  )

  /* ---- the drawers and the bands ------------------------------ */

  const onToggle = useCallback((key: string) => {
    setCollapsed((was) => {
      const next = new Set(was)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const onFold = useCallback(
    (sectionId: string) => {
      const next = new Set(foldSet)
      if (next.has(sectionId)) next.delete(sectionId)
      else next.add(sectionId)
      go({ fold: [...next].join(',') || undefined })
    },
    [foldSet, go],
  )

  /* ---- the gallery ------------------------------------------- */

  const cards = useMemo(
    () => (table ? cardsOf(table, rootsShown, searched, heldCopy, refLabel) : []),
    [table, rootsShown, searched, refLabel],
  )
  const card = model === '' ? undefined : cards.find((c) => c.key === model)
  const cardLayout = useMemo(
    () => (card ? layoutGroups(card.rows, [], new Set(), metrics) : null),
    [card, metrics],
  )
  const cardChunks = useMemo(() => (cardLayout ? chunkLines(cardLayout.lines) : []), [cardLayout])
  const mark = useMemo(() => (table ? whiteMarkFor(table.name) : null), [table])

  /* ---- what is drawn ---------------------------------------- */

  if (!table) {
    return (
      <main className="sh" data-testid="sheet" data-read={read ? '' : undefined}>
        <header className="sh-top">
          <div className="sh-top__who">
            <p className="sh-eyebrow">Data{business ? ` · ${business}` : ''}</p>
            <h1 className="sh-title">{open ? 'No such table' : 'The sheet'}</h1>
          </div>
          <nav className="sh-ways" aria-label="Ways out">
            <Button intent="veiled" size="sm" href={DATA_INDEX}>
              Data
            </Button>
            {goHome ? (
              <Button intent="veiled" size="sm" href="/" onClick={goHome}>
                Home
              </Button>
            ) : null}
          </nav>
        </header>
        <div className="sh-blank">
          {problem !== null ? (
            <p role="alert" className="sh-blank__say">
              The sheet could not be read. {problem}
            </p>
          ) : !read ? (
            <p className="sh-blank__say">Reading what this browser has kept…</p>
          ) : open ? (
            <p className="sh-blank__say">{noTable(tableId)}</p>
          ) : (
            <>
              <p className="sh-blank__say">{NO_SHEET}</p>
              <Button
                intent="veiled"
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

  const rowCount = layout.leafRows.length
  const rowPath = cursorRow ? levels.map((id) => cursorRow.text[id] ?? '') : []
  const hidden = hand ? leafFields.length - gridFields.length : 0

  return (
    <main
      className="sh"
      data-testid="sheet"
      data-read={read ? '' : undefined}
      data-door={door}
      data-hand={hand ? '' : undefined}
    >
      <header className="sh-top">
        <div className="sh-top__who">
          <p className="sh-eyebrow">Data{business ? ` · ${business}` : ''}</p>
          <h1 className="sh-title">{table.name}</h1>
        </div>

        <p className="sh-count">
          <b>{countLabel(view.length, noun)}</b>
          {branch && roots.length > 0 ? ` in ${countLabel(roots.length, branch)}` : ''} ·{' '}
          {table.fields.length} columns
          {table.sections && table.sections.length > 0
            ? ` in ${table.sections.length} sections`
            : ''}
          {costFields.length > 0 ? ` · ${costFields.length} of them ${COST_WORD}` : ''}
          {narrowed
            ? ` · ${searched.length.toLocaleString('en-AU')} of ${view.length.toLocaleString('en-AU')} match “${query.trim()}”`
            : ''}
        </p>

        <div className="sh-find">
          <span className="sh-find__field">
            <Input
              id="sh-find-field"
              ref={field}
              type="search"
              aria-label={`Find a ${noun.one}`}
              value={query}
              onValueChange={setQuery}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault()
                  setQuery('')
                } else if (e.key === 'ArrowDown' || e.key === 'Enter') {
                  e.preventDefault()
                  body.current?.querySelector<HTMLElement>('.sh-grid')?.focus()
                }
              }}
              placeholder={`Any word in any column of ${table.name}`}
            />
          </span>
          <span className="sh-find__key">
            <Kbd>/</Kbd>
          </span>
        </div>

        <nav className="sh-ways" aria-label="Ways out">
          <Button intent="veiled" size="sm" href={DATA_INDEX}>
            Data
          </Button>
          {goHome ? (
            <Button intent="veiled" size="sm" href="/" onClick={goHome}>
              Home
            </Button>
          ) : null}
        </nav>
      </header>

      <div className="sh-tools" data-testid="sheet-tools">
        {/* THE THREE DOORS AND THE TWO LADDERS ARE CHIPS, the Tile primitive's own
            "chosen thing" on a dark ground: `aria-pressed` is what chosen means to a
            reader, and the same chip the picker chooses a material with. */}
        <fieldset className="sh-doors">
          <legend className="sh-vh">Door</legend>
          <span className="sh-ladder__word" aria-hidden="true">
            Door
          </span>
          <Tile
            shape="chip"
            tone="room"
            selected={door === 'outline'}
            onSelect={() => go({ door: undefined, model: undefined })}
          >
            Outline
          </Tile>
          <Tile
            shape="chip"
            tone="room"
            selected={door === 'gallery'}
            onSelect={() => go({ door: 'gallery' })}
          >
            Gallery
          </Tile>
        </fieldset>

        {rungs.length > 0 && door === 'outline' ? (
          <fieldset className="sh-ladder">
            <legend className="sh-vh">Depth</legend>
            <span className="sh-ladder__word" aria-hidden="true">
              Depth
            </span>
            {rungs.map((word, i) => (
              <Tile
                key={word}
                shape="chip"
                tone="room"
                selected={rung === i + 1}
                onSelect={() => go({ depth: i + 1 === rungs.length ? undefined : i + 1 })}
              >
                {word}
              </Tile>
            ))}
          </fieldset>
        ) : null}

        <fieldset className="sh-ladder">
          <legend className="sh-vh">Rows</legend>
          <span className="sh-ladder__word" aria-hidden="true">
            Rows
          </span>
          {(Object.keys(ROW_HEIGHTS) as RowHeightKey[]).map((key) => (
            <Tile
              key={key}
              shape="chip"
              tone="room"
              selected={rowsKey === key}
              label={`Rows ${ROW_HEIGHTS[key].rowH} pixels tall, a ${ROW_HEIGHTS[key].thumb} pixel picture`}
              onSelect={() => go({ rows: key === 'dense' ? undefined : key })}
            >
              {ROW_HEIGHTS[key].rowH}
            </Tile>
          ))}
        </fieldset>
      </div>

      {step ? (
        <output className="sh-step" data-testid="last-step">
          <span className="sh-step__said">{step.said}</span>
          <Button intent="veiled" size="sm" onClick={goBack}>
            {step.wasUndo ? 'Put it back' : 'Undo'}
          </Button>
        </output>
      ) : null}
      {refused ? (
        <p className="sh-alarm" role="alert">
          {refused}
        </p>
      ) : null}

      <div className="sh-body" ref={body}>
        {door === 'gallery' && !card ? (
          <Gallery
            table={table}
            cards={cards}
            mark={mark}
            rowCount={view.length}
            noun={noun}
            onOpen={(key) => go({ model: key })}
            onEveryRow={() => go({ door: undefined, model: undefined })}
          />
        ) : door === 'gallery' && card && cardLayout ? (
          <div className="sh-model" data-testid="sheet-model">
            <div className="sh-model__head">
              <Button intent="veiled" size="sm" onClick={() => go({ model: undefined })}>
                ← All cards
              </Button>
              <h2 className="sh-model__name">
                {card.name} <span className="sh-model__count">{card.count}</span>
              </h2>
            </div>
            <Outline
              table={table}
              layout={cardLayout}
              chunks={cardChunks}
              fields={sections.fields}
              columns={columns}
              bands={bands}
              pinFieldId={pinId}
              rowH={rowH.rowH}
              groupH={OUTLINE_GROUP_H}
              thumb={rowH.thumb}
              noun={noun}
              heldCopy={heldCopy}
              heldOf={(key) => heldByKey.get(key) ?? 0}
              narrowed={false}
              collapsed={collapsed}
              onToggle={onToggle}
              onFold={onFold}
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
              ariaLabel={`${card.name}, ${card.count}`}
            />
          </div>
        ) : (
          <Outline
            table={table}
            layout={layout}
            chunks={chunks}
            fields={sections.fields}
            columns={columns}
            bands={bands}
            pinFieldId={pinId}
            rowH={rowH.rowH}
            groupH={OUTLINE_GROUP_H}
            thumb={rowH.thumb}
            noun={noun}
            heldCopy={heldCopy}
            heldOf={(key) => heldByKey.get(key) ?? 0}
            narrowed={narrowed}
            collapsed={collapsed}
            onToggle={onToggle}
            onFold={onFold}
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
            handSentence={handSentence(hidden)}
            focusRowId={focusRowId}
          />
        )}

        <aside
          className="sh-side"
          aria-label="The row under the cursor"
          data-peeking={peeking && cursorRow ? '' : undefined}
        >
          {peeking && cursorRow ? (
            <Record
              table={table}
              row={cursorRow}
              path={rowPath}
              pinFieldId={pinId}
              heldCopy={heldCopy}
              commit={commit}
              data={dataOf(catalogue.getState())}
              onDelete={onDelete}
              onClose={() => {
                setPeeking(false)
                body.current?.querySelector<HTMLElement>('.sh-grid')?.focus()
              }}
              hand={hand}
            />
          ) : selection ? (
            <SelectionBlock
              table={table}
              rows={layout.leafRows}
              fields={sections.fields}
              sel={selection}
              noun={noun}
              write={write}
              refLabelsOf={refLabelsOf}
            />
          ) : (
            <Standing
              table={table}
              rowCount={rowCount}
              noun={noun}
              costCount={costFields.length}
              apply={apply}
            />
          )}
        </aside>
      </div>
    </main>
  )
}

/* ---------------------------------------------------------- */
/* The panel, standing: what this sheet is, and the one offer   */
/* ---------------------------------------------------------- */

/** What a new column would be called before a person names it. */
const COLUMN_DRAFT = ''

function Standing({
  table,
  rowCount,
  noun,
  costCount,
  apply,
}: {
  table: EntityDef
  rowCount: number
  noun: { one: string; many: string }
  costCount: number
  apply: (command: CatalogueCommand) => Written
}) {
  const [name, setName] = useState(COLUMN_DRAFT)
  const [kind, setKind] = useState<string>('text')
  const [sectionId, setSectionId] = useState<string | null>(null)
  const [said, setSaid] = useState<string | null>(null)
  const clean = name.trim()
  const kinds = COLUMN_KINDS.filter((k) => k.type !== 'reference' && k.type !== 'formula')
  const sections = table.sections ?? []
  const where = sectionId ? sections.find((s) => s.id === sectionId)?.name : undefined

  /* THE OFFER: the sentence names the table, the column, its kind and
     how many rows it lands empty on, and the act sits under the
     sentence. Nothing is written until it is pressed. */
  const acceptColumn = (): void => {
    const outcome = apply(
      addField(table.id, {
        name: clean,
        type: kind as FieldDef['type'],
        ...(sectionId ? { sectionId } : {}),
      }),
    )
    setSaid('refused' in outcome ? outcome.refused : null)
    if ('said' in outcome) setName(COLUMN_DRAFT)
  }

  return (
    <div className="sh-standing">
      <h2 className="sh-standing__head">
        {table.name}
        <span className="sh-standing__count">{countLabel(rowCount, noun)} on this screen</span>
      </h2>
      <Legend />
      <p className="sh-standing__say">
        Press a row and it opens here — <Kbd>Space</Kbd> peeks, <Kbd>Enter</Kbd> edits the cell
        under the cursor, and every change has <b>Undo</b> pinned to it under the head. Select many
        cells and this panel lists what they hold before a fill writes.
      </p>
      {costCount > 0 ? (
        <p className="sh-standing__say">
          {costCount} of these columns {costCount === 1 ? 'is' : 'are'} the dealer’s own cost. A
          quote never reads them.
        </p>
      ) : null}
      {table.description ? <p className="sh-standing__prov">{table.description}</p> : null}

      <section className="sh-offer" aria-label="Add a column">
        <h3 className="sh-offer__head">Add a column</h3>
        <div className="sh-offer__fields">
          <Input
            aria-label="The new column's name"
            value={name}
            onValueChange={setName}
            placeholder="What the column is called"
          />
          <Select
            aria-label="What the column holds"
            options={kinds.map((k) => ({ value: k.type, label: k.label }))}
            value={kind}
            onValueChange={(v) => setKind(v ?? 'text')}
          />
          {sections.length > 0 ? (
            <Select
              aria-label="Which section it sits in"
              options={sections.map((s) => ({ value: s.id, label: s.name }))}
              value={sectionId}
              onValueChange={setSectionId}
              placeholder="At the end of the sheet"
            />
          ) : null}
        </div>
        <p className="sh-offer__say">
          {clean === ''
            ? `Name the column and this says what it would do to ${table.name}. Nothing is written until the act under it is pressed.`
            : `This adds a column called “${clean}” to ${table.name}, holding ${kinds.find((k) => k.type === kind)?.label.toLowerCase() ?? kind}, empty on all ${countLabel(rowCount, noun)}${where ? `, in ${where}` : ', at the end of the sheet'}. Nothing else changes, and it can be undone.`}
        </p>
        <Button
          intent="act"
          size="sm"
          onClick={acceptColumn}
          refusedBecause={
            clean === '' ? 'A column needs a name before it can be offered.' : undefined
          }
        >
          Add the column
        </Button>
        {said ? (
          <p className="sh-alarm" role="alert">
            {said}
          </p>
        ) : null}
      </section>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* The panel over a selection: the mixed set, then the fill     */
/* ---------------------------------------------------------- */

function SelectionBlock({
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
  fields: FieldDef[]
  sel: GridSel
  noun: { one: string; many: string }
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

  return (
    <div className="sh-selection" data-testid="sheet-selection">
      <h2 className="sh-standing__head">
        {countLabel(rowIndexes.length, noun)}
        <span className="sh-standing__count">
          across {colIndexes.length} {colIndexes.length === 1 ? 'column' : 'columns'}
        </span>
      </h2>
      {shownCols.map((c) => {
        const f = fields[c]
        if (!f) return null
        const set = mixedSet(rows, f, rowIndexes)
        return (
          <section key={f.id} className="sh-mixed" aria-label={f.name}>
            <h3 className="sh-mixed__head">{f.name}</h3>
            <ul className="sh-mixed__list">
              {set.slice(0, 8).map((v) => (
                <li key={v.text} className="sh-mixed__row">
                  <span className="sh-mixed__value">{v.text === '' ? '(blank)' : v.text}</span>
                  <span className="sh-mixed__count">× {v.count}</span>
                </li>
              ))}
              {set.length > 8 ? (
                <li className="sh-mixed__row sh-mixed__more">and {set.length - 8} more values</li>
              ) : null}
            </ul>
          </section>
        )
      })}
      {colIndexes.length > 3 ? (
        <p className="sh-standing__say">
          The first three columns are listed; the rest fill the same way.
        </p>
      ) : null}

      <div className="sh-selection__acts">
        {rowIndexes.length > 1 && range.anchor.row !== range.focus.row ? (
          <div className="sh-selection__act">
            <Button
              intent="veiled"
              size="sm"
              onClick={() => {
                const w = fillDownWrite(table, rows, fields, range)
                const out = w.cells > 0 ? write(w) : { refused: w.skipped[0] ?? 'Nothing to fill.' }
                setSaid('refused' in out ? out.refused : null)
              }}
            >
              Fill down from the top row
              <Kbd>Mod D</Kbd>
            </Button>
          </div>
        ) : null}
        {one ? (
          <div className="sh-selection__act sh-selection__set">
            <Input
              aria-label={`A value for every selected ${f(one)}`}
              value={text}
              onValueChange={setText}
              placeholder={`Set every ${one.name} to…`}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return
                e.preventDefault()
                const w = setAllWrite(table, rows, one, rowIndexes, text, refLabelsOf(one))
                const out = w.cells > 0 ? write(w) : { refused: w.skipped[0] ?? 'Nothing to set.' }
                setSaid('refused' in out ? out.refused : null)
              }}
            />
            <Button
              intent="act"
              size="sm"
              onClick={() => {
                const w = setAllWrite(table, rows, one, rowIndexes, text, refLabelsOf(one))
                const out = w.cells > 0 ? write(w) : { refused: w.skipped[0] ?? 'Nothing to set.' }
                setSaid('refused' in out ? out.refused : null)
              }}
            >
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
    </div>
  )
}

const f = (field: FieldDef): string => field.name
