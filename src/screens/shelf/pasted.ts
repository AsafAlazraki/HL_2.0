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
  fieldOffers,
  planPaste,
  proposeMapping,
  readColumns,
  readPastedBlock,
  type MapTo,
} from '@/domain/io/pasteBlock'
import type { TableUploadPlan } from '@/domain/io/tableCsv'
import { addRow, batch, updateCell, type CatalogueCommand } from '@/domain/catalogue/commands'
import { displayFieldOf } from '@/domain/model'
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

export type PasteRead =
  | { ok: false; say: string }
  | {
      ok: true
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

export function readPaste(entity: EntityDef, rows: RowData[], text: string): PasteRead {
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
  const choices: MapTo[] = proposed.map((p) =>
    p.choice.to === 'field' ? p.choice : { to: 'skip' },
  )
  const display = displayFieldOf(entity)
  const named = choices.some((c) => c.to === 'field' && c.fieldId === display?.id)
  const listName = entity.name
  if (!named) {
    return {
      ok: false,
      say: `No pasted heading reads ${display?.name ?? 'the name'}, which is how a line on ${listName} is found. Copy the headings with the lines, and the ${display?.name ?? 'name'} with them.`,
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
