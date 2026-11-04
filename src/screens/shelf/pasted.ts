/* ============================================================
   LINES PASTED FROM EXCEL, READ AGAINST ONE LIST — the engine's paste
   (`src/domain/io/pasteBlock.ts`), asked only what the shelf needs.

   THE SHELF NEVER MAKES A NEW COLUMN FROM A PASTE. The engine can; a
   column is the price list editor's business, where it gets a type and
   a place. So every pasted heading that names nothing on the list is
   left out, and said to be. What is left is the same merge a workbook
   turns: by name, every change shown first, nothing removed.

   Pure: no React, no store.
   ============================================================ */
import type { CellValue, EntityDef, RowData } from '@/domain/model'
import {
  bodyOf,
  fieldOffers,
  nameKey,
  planPaste,
  proposeMapping,
  readColumns,
  readPastedBlock,
  type MapTo,
} from '@/domain/io/pasteBlock'
import type { TableUploadPlan } from '@/domain/io/tableCsv'
import { addRow, batch, updateCell, type CatalogueCommand } from '@/domain/catalogue/commands'
import { displayFieldOf } from '@/domain/model'
import { cellToText } from '@/domain/catalogue/table/core/coerce'
import { priceLevelsFor } from '@/domain/quote/pricing'

export interface PastedLine {
  /** unique within one paste: the line it changes, or its place among the new ones */
  key: string
  fate: 'change' | 'new'
  name: string
  from?: number | null
  to?: number | null
  figures: number
}

/** One pasted column, and what it becomes on the list. */
export interface PastedColumn {
  index: number
  /** its heading as pasted, or "Column 3" */
  title: string
  sample: string[]
  /** the list's figure it becomes, or null when it is left out */
  to: string | null
  /** how that was decided: by its heading, by measuring its names, by the person, or not at all */
  how: 'heading' | 'names' | 'you' | 'none'
  /** for a column read as the name by its values: how many of its lines name a line on the list */
  names?: { hit: number; of: number }
}

/** What a person pointed at: a pasted column's index → the list's figure, or 'skip'. */
export type PastePoints = Readonly<Record<number, string>>

export type PasteRead =
  | { ok: false; say: string; columns?: PastedColumn[] }
  | {
      ok: true
      columns: PastedColumn[]
      /** the list's own names of what was read, in the pasted order */
      read: string[]
      /** pasted headings that name nothing on the list, left out */
      left: string[]
      plan: TableUploadPlan
      lines: PastedLine[]
      readAt: string | null
      changing: number
      adding: number
      /** lines that name a line the list carries twice, or that repeat */
      cannot: number
    }

const numberOf = (v: CellValue | undefined): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null

export function readPaste(
  entity: EntityDef,
  rows: RowData[],
  text: string,
  points: PastePoints = {},
): PasteRead {
  if (text.trim() === '') return { ok: false, say: '' }
  const block = readPastedBlock(text)
  if (!block.ok) {
    return {
      ok: false,
      say: 'Nothing pasted could be read as lines. Copy the lines in Excel, headings and all, and paste them here.',
    }
  }
  const headerRow = block.headerLikely
  const cols = readColumns(block, headerRow)
  const proposed = proposeMapping(cols, fieldOffers(entity), headerRow)
  const columns: PastedColumn[] = cols.map((c, i) => {
    const p = proposed[i]
    return {
      index: c.index,
      title: c.title,
      sample: c.sample,
      to: p?.choice.to === 'field' ? p.choice.fieldId : null,
      how: p?.choice.to === 'field' ? 'heading' : 'none',
    }
  })
  /* WHAT THE PERSON POINTED AT WINS, and a figure two columns would fill goes to the one pointed */
  for (const [at, to] of Object.entries(points)) {
    const col = columns[Number(at)]
    if (!col) continue
    const fieldId = to === 'skip' ? null : to
    if (fieldId)
      for (const other of columns) if (other !== col && other.to === fieldId) other.to = null
    col.to = fieldId
    col.how = 'you'
  }
  const display = displayFieldOf(entity)
  const listName = entity.name
  /* NO HEADING READS THE NAME: the workbook heads its name column with the sheet's own title
     ("Parts & Accessories Module"). The column whose lines name lines on the list is read as the
     name, and the count it was read by is said beside it. */
  if (display && !columns.some((c) => c.to === display.id)) {
    const known = new Set(
      rows.map((r) => nameKey(cellToText(r.values[display.id] ?? null, display))),
    )
    const body = bodyOf(block, headerRow)
    let best: { col: PastedColumn; hit: number } | null = null
    for (const col of columns) {
      if (col.how === 'you') continue
      const values = body.map((r) => (r[col.index] ?? '').trim()).filter((v) => v !== '')
      const hit = values.filter((v) => known.has(nameKey(v))).length
      if (hit > 0 && (!best || hit > best.hit)) best = { col, hit }
    }
    if (best) {
      const of = body.filter((r) => (r[best.col.index] ?? '').trim() !== '').length
      best.col.to = display.id
      best.col.how = 'names'
      best.col.names = { hit: best.hit, of }
    }
  }
  const choices: MapTo[] = columns.map((c) =>
    c.to ? { to: 'field', fieldId: c.to } : { to: 'skip' },
  )
  const named = choices.some((c) => c.to === 'field' && c.fieldId === display?.id)
  if (!named) {
    return {
      ok: false,
      columns,
      say: `No pasted heading reads ${display?.name ?? 'the name'}, and no pasted line names a line on ${listName}. Point at the heading that holds the ${display?.name ?? 'name'} below.`,
    }
  }
  const pasted = planPaste({ entity, rows, block, headerRow, cols, choices })
  if (!pasted.ok || !pasted.plan) {
    const figures = entity.fields
      .filter((f) => f.type === 'number')
      .slice(0, 4)
      .map((f) => f.name)
      .join(', ')
    return {
      ok: false,
      columns,
      say: `Nothing pasted names a figure on ${listName}. The headings have to read as the list’s own: ${figures}.`,
    }
  }
  const plan = pasted.plan
  const level = priceLevelsFor(entity).find((l) => l.scope === 'quote')
  const byRow = new Map(rows.map((r) => [r.id, r]))
  const moved = new Map<string, PastedLine>()
  for (const c of plan.changes) {
    const line = moved.get(c.rowId) ?? {
      key: c.rowId,
      fate: 'change' as const,
      name: c.rowLabel,
      figures: 0,
    }
    line.figures += 1
    if (level && c.fieldId === level.fieldId) {
      line.from = numberOf(byRow.get(c.rowId)?.values[c.fieldId])
      line.to = numberOf(c.value)
    }
    moved.set(c.rowId, line)
  }
  const lines: PastedLine[] = [
    ...moved.values(),
    ...plan.newRows.map((r, i) => ({
      key: `new:${i}`,
      fate: 'new' as const,
      name: r.label,
      to: level ? numberOf(r.values[level.fieldId]) : null,
      figures: Object.keys(r.values).length,
    })),
  ]
  const read = choices.flatMap((c) =>
    c.to === 'field' ? [entity.fields.find((f) => f.id === c.fieldId)?.name ?? ''] : [],
  )
  return {
    ok: true,
    columns,
    read,
    left: pasted.skipped,
    plan,
    lines,
    readAt: level?.label ?? null,
    changing: plan.overwritten,
    adding: plan.newRows.length,
    cannot: plan.fileRows - plan.matched - plan.newRows.length,
  }
}

/** Every change a paste named, as one step with one way back. */
export function pasteCommand(
  tableId: string,
  plan: TableUploadPlan,
  said: string,
): CatalogueCommand {
  return batch(
    [
      ...plan.changes.map((c) => updateCell(tableId, c.rowId, c.fieldId, c.value)),
      ...plan.newRows.map((r) => addRow(tableId, r.values)),
    ],
    { said },
  )
}
