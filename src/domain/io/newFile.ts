/* ============================================================
   io/newFile — A NEW VERSION OF THE MASTER PRICE FILE, READ AGAINST
   THE PRICE LIST THIS COMPUTER KEEPS, BEFORE ANYTHING IS WRITTEN.

   Milestone 4, the shelf. A supplier re-issues its prices; Northside
   re-issues a module of its Master Price File (`Parts Module (2).xlsx`);
   until now somebody re-keyed the figures. This reads the workbook
   (`./workbook`) against every list it feeds and says, in counts a
   dealer can check, what would change — and only `newFileCommand`
   writes, through the command layer, as ONE step with one way back.

   HOW A SHEET FINDS ITS LISTS — MEASURED, NEVER DECLARED. Every line
   on the price list carries the cell it was read from (`Source`,
   `Parts Maintenance!R597`), so a list is fed by the sheet its lines
   name. Nothing here holds a table of sheet names: a sheet nobody's
   lines name feeds nothing and is said to be left alone.

   HOW A FIGURE FINDS ITS COLUMN. A list's columns are named for the
   workbook column they were read from (`parts.l` is column L), and
   each says so in its own description (`Parts Maintenance!L`). Only a
   column that CITES its sheet and letter is written — measured on the
   pack, that separates the 14 real columns of Parts & Accessories
   from `cat` and `src`, which are three letters long and would
   otherwise read as columns CAT and SRC. A calculated column or a
   picture is never written (`./tableCsv`, reason 4).

   HOW A LINE FINDS ITS ROW. By its name, in the list's own name
   column — exactly, ignoring case — which is the engine's own
   fallback (`mergeLines`, identity `name`). A name two rows share is
   never guessed: the line is counted as one that cannot be placed.
   Where one sheet feeds several lists (the Boat Module feeds seven
   makers), a line goes to the one list whose name it matches; a line
   that matches none is NEW only when its sheet feeds exactly one
   list, and otherwise cannot be placed, because nothing in it says
   which maker's list it belongs on.

   WHAT IS NEVER DONE, by `mergeLines` itself: no line is deleted (a
   row with no line in the file is kept exactly as it is), no
   discontinued model is brought back, no column is added.

   A LINE IS A PRICED LINE ONLY WHEN IT LOOKS LIKE ONE. A workbook's
   heading rows, its column numbers and its category banners are lines
   too. One is read only when its name is words (not a bare number)
   and it carries at least one figure in a column it can write.

   Pure: no React, no store, no DOM.
   ============================================================ */

import {
  DISCONTINUED_FIELD_ID,
  UID_FIELD_ID,
  displayFieldOf,
  type CellValue,
  type EntityDef,
  type FieldDef,
  type RowData,
} from '@/domain/model'
import { cellToText } from '@/domain/catalogue/table/core/coerce'
import { addRow, batch, updateCell, type CatalogueCommand } from '@/domain/catalogue/commands'
import type { CatalogueData } from '@/domain/catalogue/sheet'
import { priceLevelsFor } from '@/domain/quote/pricing'
import { mergeLines, type TableUploadPlan } from './tableCsv'
import { columnIndex, type SheetLine, type Workbook } from './workbook'

/* ------------------------------------------------------------ */
/* what the plan says                                            */
/* ------------------------------------------------------------ */

/** How one line of the workbook lands. */
export type LineFate = 'change' | 'new' | 'cannot'

/** Why a line cannot be placed, one cause each. */
export type CannotBecause =
  /** two rows on the list share its name */
  | 'shared-name'
  /** an earlier line in the workbook already named the same row */
  | 'said-twice'
  /** its sheet feeds several lists and its name is on none of them */
  | 'no-list'
  /** its name is on two of the lists its sheet feeds */
  | 'two-lists'

/** One line a dealer would want to see. */
export interface FileLine {
  fate: LineFate
  tableId: string
  /** the sheet it is on */
  sheet: string
  /** the line's own name, as the workbook writes it */
  name: string
  /** the workbook's row number, for the person who opens it in Excel */
  at: number
  /** the row it changes, when it changes one */
  rowId?: string
  /** the figure a quote reads, before and after, when that is what moves */
  from?: number | null
  to?: number | null
  /** how many figures on the line change — the read figure among them or not */
  figures: number
  because?: CannotBecause
}

/** One list the workbook feeds, and what it would do to it. */
export interface FileList {
  tableId: string
  name: string
  /** what the list holds — a boat, a motor, a part — for its mark */
  kind: EntityDef['kind']
  sheet: string
  /** the price a quote reads on this list, by its own name ("Cash"), or null when unpriced */
  readAt: string | null
  /** lines on the list now */
  rows: number
  /** lines of the workbook that named a row here */
  matched: number
  changing: number
  adding: number
  cannot: number
  /** at the read figure: how many go up and how many go down */
  higher: number
  lower: number
  /** rows on the list the workbook does not mention: kept exactly as they are */
  notInFile: number
  /** the changes and the new lines, in workbook order */
  lines: FileLine[]
  /** the lines that cannot be placed, in workbook order */
  cannotLines: FileLine[]
  /** the engine's own plan, kept for the write */
  plan: TableUploadPlan
}

export interface NewFilePlan {
  fileName: string
  /** sheets that feed a list here */
  sheetsRead: string[]
  /** sheets in the workbook that no list here was read from */
  sheetsLeft: string[]
  lists: FileList[]
  /** every line on the price list now, every list counted */
  totalRows: number
  /** lists the workbook does not touch */
  listsUntouched: number
  changing: number
  adding: number
  cannot: number
  /** lines of a sheet several lists share that name none of them: kept out, in workbook order */
  unplaced: FileLine[]
  /** `changing + adding`: what Apply counts */
  changes: number
  /** the price list's lines that stay exactly as they are */
  unmoved: number
  /** read figures that more than double or fall below half — looked at before Apply */
  checkFirst: FileLine[]
}

/* ------------------------------------------------------------ */
/* reading the price list for its sheets                         */
/* ------------------------------------------------------------ */

const norm = (s: string): string => s.replace(/\s+/g, ' ').trim().toLowerCase()

/** The column each line's cell of origin is kept in, if the list keeps one. */
function sourceFieldOf(entity: EntityDef): FieldDef | undefined {
  return entity.fields.find((f) => f.id === `${entity.id}.src`)
}

/** The sheet a list's lines were read from — the one most of them name. */
export function sheetOf(entity: EntityDef, rows: readonly RowData[]): string | null {
  const src = sourceFieldOf(entity)
  if (!src) return null
  const count = new Map<string, number>()
  for (const r of rows) {
    const v = r.values[src.id]
    if (typeof v !== 'string') continue
    const bang = v.lastIndexOf('!')
    if (bang <= 0) continue
    const sheet = v.slice(0, bang)
    count.set(sheet, (count.get(sheet) ?? 0) + 1)
  }
  let best: string | null = null
  let most = 0
  for (const [sheet, n] of count) {
    if (n > most) {
      best = sheet
      most = n
    }
  }
  return best
}

/** The columns of a list a workbook may write, by workbook column index. */
export function writableColumns(entity: EntityDef, sheet: string): Map<number, FieldDef> {
  const out = new Map<number, FieldDef>()
  const prefix = `${entity.id}.`
  for (const f of entity.fields) {
    if (!f.id.startsWith(prefix)) continue
    const letters = f.id.slice(prefix.length)
    if (!/^[a-z]{1,3}$/.test(letters)) continue
    if (f.type === 'formula' || f.type === 'image') continue
    if (f.id === UID_FIELD_ID || f.id === DISCONTINUED_FIELD_ID) continue
    /* THE COLUMN CITES ITS OWN SHEET AND LETTER, or it is not a column of the sheet */
    if (!(f.description ?? '').includes(`${sheet}!${letters.toUpperCase()}`)) continue
    out.set(columnIndex(letters), f)
  }
  return out
}

interface Fed {
  entity: EntityDef
  rows: RowData[]
  display: FieldDef
  nameAt: number
  writable: Map<number, FieldDef>
  /** the name, normalised → the rows that carry it */
  byName: Map<string, RowData[]>
  /** the column the price a quote reads sits in, when the list is priced */
  read: { label: string; fieldId: string } | null
}

function feedOf(entity: EntityDef, rows: RowData[], sheet: string): Fed | null {
  const display = displayFieldOf(entity)
  if (!display) return null
  const writable = writableColumns(entity, sheet)
  const nameAt = [...writable.entries()].find(([, f]) => f.id === display.id)?.[0]
  if (nameAt === undefined) return null
  const byName = new Map<string, RowData[]>()
  for (const r of rows) {
    const key = norm(cellToText(r.values[display.id] ?? null, display))
    if (key === '') continue
    const list = byName.get(key)
    if (list) list.push(r)
    else byName.set(key, [r])
  }
  const level = priceLevelsFor(entity).find((l) => l.scope === 'quote') ?? priceLevelsFor(entity)[0]
  const levelField = level ? entity.fields.find((f) => f.id === level.fieldId) : undefined
  const read =
    level && levelField && [...writable.values()].some((f) => f.id === level.fieldId)
      ? { label: level.label, fieldId: level.fieldId }
      : null
  return { entity, rows, display, nameAt, writable, byName, read }
}

const isFigure = (text: string | undefined): boolean => {
  const t = (text ?? '').trim()
  return t !== '' && Number.isFinite(Number(t))
}

/** A heading, a column number or a category banner is a line too; this keeps only priced lines. */
function isPricedLine(line: SheetLine, feeds: readonly Fed[]): boolean {
  return feeds.some((feed) => {
    const name = (line.cells[feed.nameAt] ?? '').trim()
    if (name === '' || /^[\d\s.,-]+$/.test(name)) return false
    for (const [at, f] of feed.writable) {
      if (f.type === 'number' && isFigure(line.cells[at])) return true
    }
    return false
  })
}

const numberOf = (v: CellValue | undefined): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null

/* ------------------------------------------------------------ */
/* the plan                                                      */
/* ------------------------------------------------------------ */

/** Every sheet the price list here was read from, so a reader inflates only those. */
export function sheetsOnThePriceList(data: Pick<CatalogueData, 'tables' | 'rows'>): Set<string> {
  const out = new Set<string>()
  for (const entity of Object.values(data.tables)) {
    if (entity.role === 'join') continue
    const sheet = sheetOf(entity, data.rows[entity.id] ?? [])
    if (sheet) out.add(sheet)
  }
  return out
}

/**
 * READ A WORKBOOK AGAINST THE PRICE LIST AND SAY WHAT APPLYING IT WOULD DO.
 * Writes nothing.
 */
export function planNewFile(
  book: Workbook,
  data: Pick<CatalogueData, 'tables' | 'rows'>,
  fileName: string,
): NewFilePlan {
  /* every list a sheet could feed, grouped by that sheet */
  const fedBySheet = new Map<string, Fed[]>()
  for (const entity of Object.values(data.tables)) {
    if (entity.role === 'join') continue
    const rows = data.rows[entity.id] ?? []
    const sheet = sheetOf(entity, rows)
    if (!sheet) continue
    const feed = feedOf(entity, rows, sheet)
    if (!feed) continue
    const list = fedBySheet.get(sheet)
    if (list) list.push(feed)
    else fedBySheet.set(sheet, [feed])
  }

  const lists: FileList[] = []
  const sheetsRead: string[] = []
  /* lines a shared sheet carries that no list here names: the sheet's, not any one maker's */
  const unplaced: FileLine[] = []
  for (const sheet of book.sheets) {
    const feeds = fedBySheet.get(sheet.name)
    if (!feeds) continue
    sheetsRead.push(sheet.name)

    /* each line to the one list it belongs on, or to nowhere, with the reason */
    const assigned = new Map<string, { line: SheetLine; fresh: boolean }[]>()
    const cannot = new Map<string, FileLine[]>()
    const seen = new Set<string>()
    const cannotOf = (feed: Fed, line: SheetLine, because: CannotBecause): void => {
      const entry: FileLine = {
        fate: 'cannot',
        tableId: feed.entity.id,
        sheet: sheet.name,
        name: (line.cells[feed.nameAt] ?? '').trim(),
        at: line.at,
        figures: 0,
        because,
      }
      const list = cannot.get(feed.entity.id)
      if (list) list.push(entry)
      else cannot.set(feed.entity.id, [entry])
    }
    for (const line of sheet.lines) {
      if (!isPricedLine(line, feeds)) continue
      const hits = feeds.filter((f) => f.byName.has(norm(line.cells[f.nameAt] ?? '')))
      if (hits.length > 1) {
        cannotOf(hits[0], line, 'two-lists')
        continue
      }
      if (hits.length === 0) {
        if (feeds.length === 1) {
          const at = assigned.get(feeds[0].entity.id) ?? []
          at.push({ line, fresh: true })
          assigned.set(feeds[0].entity.id, at)
        } else {
          unplaced.push({
            fate: 'cannot',
            tableId: '',
            sheet: sheet.name,
            name: (line.cells[feeds[0].nameAt] ?? '').trim(),
            at: line.at,
            figures: 0,
            because: 'no-list',
          })
        }
        continue
      }
      const feed = hits[0]
      const rows = feed.byName.get(norm(line.cells[feed.nameAt] ?? '')) ?? []
      if (rows.length > 1) {
        cannotOf(feed, line, 'shared-name')
        continue
      }
      if (seen.has(rows[0].id)) {
        cannotOf(feed, line, 'said-twice')
        continue
      }
      seen.add(rows[0].id)
      const at = assigned.get(feed.entity.id) ?? []
      at.push({ line, fresh: false })
      assigned.set(feed.entity.id, at)
    }

    for (const feed of feeds) {
      const mine = assigned.get(feed.entity.id) ?? []
      const cannotLines = cannot.get(feed.entity.id) ?? []
      if (mine.length === 0 && cannotLines.length === 0) continue
      const width = mine.reduce((n, a) => Math.max(n, a.line.cells.length), 0)
      const plan = mergeLines({
        entity: feed.entity,
        rows: feed.rows,
        lines: mine.map((a) => a.line.cells),
        writable: feed.writable,
        identity: { on: 'name', at: feed.nameAt, field: feed.display },
        columns: { matched: [], unknown: [], ambiguous: [], readOnly: [], missing: [] },
        fileName,
        fileColumns: width,
      })
      lists.push(listOf(feed, sheet.name, mine, cannotLines, plan))
    }
  }

  const totalRows = Object.values(data.rows).reduce((n, list) => n + list.length, 0)
  const changing = lists.reduce((n, l) => n + l.changing, 0)
  const adding = lists.reduce((n, l) => n + l.adding, 0)
  const checkFirst = lists
    .flatMap((l) => l.lines)
    .filter((l) => l.fate === 'change' && swing(l) >= 2)
    .sort((a, b) => swing(b) - swing(a))
  const touched = new Set(lists.map((l) => l.tableId))
  return {
    fileName,
    sheetsRead,
    sheetsLeft: book.names.filter((n) => !sheetsRead.includes(n)),
    lists,
    totalRows,
    listsUntouched: Object.keys(data.tables).filter((id) => !touched.has(id)).length,
    changing,
    adding,
    cannot: lists.reduce((n, l) => n + l.cannot, 0) + unplaced.length,
    unplaced,
    changes: changing + adding,
    unmoved: totalRows - changing,
    checkFirst,
  }
}

/** How far a figure swung, as a ratio either way: 98 → 3 is 32.7, a credit of −531 → −519 is
 *  1.02. A figure that crosses or leaves nought has swung as far as a figure can. */
function swing(l: FileLine): number {
  if (l.from == null || l.to == null || l.from === l.to) return 0
  if (l.from === 0 || l.to === 0 || l.from < 0 !== l.to < 0) return Number.POSITIVE_INFINITY
  const ratio = Math.abs(l.to / l.from)
  return Math.max(ratio, 1 / ratio)
}

function listOf(
  feed: Fed,
  sheet: string,
  mine: readonly { line: SheetLine; fresh: boolean }[],
  cannotLines: FileLine[],
  plan: TableUploadPlan,
): FileList {
  const entity = feed.entity
  const rowById = new Map(feed.rows.map((r) => [r.id, r]))
  const byRow = new Map<string, { figures: number; from?: number | null; to?: number | null }>()
  for (const c of plan.changes) {
    const at = byRow.get(c.rowId) ?? { figures: 0 }
    at.figures += 1
    if (feed.read && c.fieldId === feed.read.fieldId) {
      const row = rowById.get(c.rowId)
      at.from = numberOf(row?.values[c.fieldId])
      at.to = numberOf(c.value)
    }
    byRow.set(c.rowId, at)
  }

  const lines: FileLine[] = []
  let higher = 0
  let lower = 0
  let fresh = 0
  for (const { line, fresh: isNew } of mine) {
    const name = (line.cells[feed.nameAt] ?? '').trim()
    if (isNew) {
      const values = plan.newRows[fresh]?.values ?? {}
      fresh += 1
      lines.push({
        fate: 'new',
        tableId: entity.id,
        sheet,
        name,
        at: line.at,
        to: feed.read ? numberOf(values[feed.read.fieldId]) : null,
        figures: Object.keys(values).length,
      })
      continue
    }
    const row = feed.byName.get(norm(name))?.[0]
    const moved = row ? byRow.get(row.id) : undefined
    if (!row || !moved) continue
    if (moved.from != null && moved.to != null) {
      if (moved.to > moved.from) higher += 1
      else if (moved.to < moved.from) lower += 1
    }
    lines.push({
      fate: 'change',
      tableId: entity.id,
      sheet,
      name,
      at: line.at,
      rowId: row.id,
      ...(moved.from !== undefined ? { from: moved.from } : {}),
      ...(moved.to !== undefined ? { to: moved.to } : {}),
      figures: moved.figures,
    })
  }

  /* A NEW LINE IS FILED BESIDE ITS NEIGHBOURS: the words a list keeps that are not a column
     of the sheet (Parts' category, a boat's series) are taken from the line above it in the
     workbook that names a row here, and the cell it came from is its own. */
  const source = sourceFieldOf(entity)
  const kept = entity.fields.filter(
    (f) =>
      f.type === 'text' &&
      f.id !== source?.id &&
      f.id.startsWith(`${entity.id}.`) &&
      ![...feed.writable.values()].some((w) => w.id === f.id),
  )
  let neighbour: RowData | undefined
  let k = 0
  const newRows = plan.newRows.map((r) => r)
  for (const { line, fresh: isNew } of mine) {
    if (!isNew) {
      neighbour = feed.byName.get(norm(line.cells[feed.nameAt] ?? ''))?.[0] ?? neighbour
      continue
    }
    const r = newRows[k]
    k += 1
    if (!r) continue
    const values: Record<string, CellValue> = { ...r.values }
    for (const f of kept) {
      const v = neighbour?.values[f.id]
      if (v !== undefined && v !== null && v !== '') values[f.id] = v
    }
    if (source) values[source.id] = `${sheet}!R${line.at}`
    newRows[k - 1] = { ...r, values }
  }

  return {
    tableId: entity.id,
    name: entity.name,
    kind: entity.kind,
    sheet,
    readAt: feed.read?.label ?? null,
    rows: feed.rows.length,
    matched: plan.matched,
    changing: plan.overwritten,
    adding: plan.newRows.length,
    cannot: cannotLines.length,
    higher,
    lower,
    notInFile: feed.rows.length - plan.matched,
    lines,
    cannotLines,
    plan: { ...plan, newRows },
  }
}

/* ------------------------------------------------------------ */
/* the write                                                     */
/* ------------------------------------------------------------ */

/**
 * EVERY CHANGE THE PLAN NAMED, AS ONE STEP. A cell edit per changed figure and a new row per
 * new line, through the catalogue's own commands, batched so that one Undo puts every one of
 * them back. The step says what it did in the sentence the screen hands it.
 */
export function newFileCommand(plan: NewFilePlan, said: string): CatalogueCommand {
  const commands: CatalogueCommand[] = []
  for (const list of plan.lists) {
    for (const c of list.plan.changes) {
      commands.push(updateCell(list.tableId, c.rowId, c.fieldId, c.value))
    }
    for (const r of list.plan.newRows) commands.push(addRow(list.tableId, r.values))
  }
  return batch(commands, { said })
}
