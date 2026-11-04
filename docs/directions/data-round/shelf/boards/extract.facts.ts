/* Reads Northside's own Parts Module (2).xlsx through the app's own reader (workbook.ts) and
   planner (newFile.ts) against the real pack, and writes every figure the shelf boards draw:
   the census, each list's column census counted from CellChange, the supplier groups, the
   lines to look at first, every line that cannot be placed with the rows that share its name,
   and the edition. Nothing is typed in by hand. */
/// <reference types="node" />
import { test } from 'vitest'
import { readFileSync, writeFileSync, statSync } from 'node:fs'
import { inflateRawSync } from 'node:zlib'
import type { EntityDef, RowData } from '@/domain/model'
import { emptySheet, indexRows, type CatalogueData } from '@/domain/catalogue/sheet'
import { loadPack } from '@/test/fixtures/pack'
import { readWorkbook } from '@/domain/io/workbook'
import { planNewFile, sheetsOnThePriceList, writableColumns } from '@/domain/io/newFile'
import { mergeLines } from '@/domain/io/tableCsv'

const OUT = process.env.FACTS_OUT as string
const FILE = 'C:/Users/Asaf/dev/mpf-workbooks/Parts Module (2).xlsx'
const inflate = async (raw: Uint8Array) => new Uint8Array(inflateRawSync(raw))

interface Cell {
  col: string
  fieldId: string
  from: string
  to: string
  was: unknown
  now: unknown
}

test('extract', async () => {
  const pack = await loadPack()
  const tables: Record<string, EntityDef> = {}
  for (const e of pack.entities) tables[e.id] = e
  const data: CatalogueData = {
    ...emptySheet(),
    orgId: 'northside',
    tables,
    rows: pack.rowsByEntity,
    index: indexRows(pack.rowsByEntity),
  }
  const bytes = new Uint8Array(readFileSync(FILE))
  const wanted = sheetsOnThePriceList(data)
  const t0 = Date.now()
  const book = await readWorkbook(bytes, inflate, (n) => wanted.has(n))
  const plan = planNewFile(book, data, 'Parts Module (2).xlsx')
  const ms = Date.now() - t0

  const lists = plan.lists.map((l) => {
    const entity = tables[l.tableId]
    const rows: RowData[] = data.rows[l.tableId] ?? []
    const rowsById = new Map(rows.map((r) => [r.id, r]))
    const fieldNamed = (n: string) => entity.fields.find((f) => f.name === n)
    const supplierField = fieldNamed('Supplier')
    const codeField = fieldNamed('Code')
    const display = entity.fields.find((f) => f.id === `${entity.id}.c`)
    /* the column census: how many lines moved in each column, and which way */
    const byCol = new Map<
      string,
      { col: string; fieldId: string; type: string; lines: number; up: number; down: number }
    >()
    const byRow = new Map<string, Cell[]>()
    for (const c of l.plan.changes) {
      const f = entity.fields.find((x) => x.id === c.fieldId)
      const k = byCol.get(c.fieldId) ?? {
        col: c.columnName,
        fieldId: c.fieldId,
        type: f?.type ?? '',
        lines: 0,
        up: 0,
        down: 0,
      }
      k.lines += 1
      const row = rowsById.get(c.rowId)
      const was = row?.values[c.fieldId]
      if (typeof was === 'number' && typeof c.value === 'number') {
        if (c.value > was) k.up += 1
        else if (c.value < was) k.down += 1
      }
      byCol.set(c.fieldId, k)
      const r = byRow.get(c.rowId) ?? []
      r.push({ col: c.columnName, fieldId: c.fieldId, from: c.from, to: c.to, was, now: c.value })
      byRow.set(c.rowId, r)
    }
    const census = [...byCol.values()].sort((a, b) => b.lines - a.lines)
    const spread: Record<number, number> = {}
    for (const r of byRow.values()) spread[r.length] = (spread[r.length] ?? 0) + 1

    let k = 0
    const all = l.lines.map((ln) => {
      const row = ln.rowId ? rowsById.get(ln.rowId) : undefined
      let supplier = supplierField ? String(row?.values[supplierField.id] ?? '') : ''
      let code = codeField ? String(row?.values[codeField.id] ?? '') : ''
      let newValues: Record<string, unknown> | undefined
      if (ln.fate === 'new') {
        const nr = l.plan.newRows[k++]
        newValues = nr?.values
        if (supplierField) supplier = String(nr?.values[supplierField.id] ?? '')
        if (codeField) code = String(nr?.values[codeField.id] ?? '')
      }
      return {
        fate: ln.fate,
        name: ln.name,
        at: ln.at,
        rowId: ln.rowId ?? null,
        from: ln.from ?? null,
        to: ln.to ?? null,
        figures: ln.figures,
        supplier,
        code,
        cat: String((row?.values ?? newValues ?? {})[`${entity.id}.cat`] ?? ''),
        cells: ln.rowId ? (byRow.get(ln.rowId) ?? []) : [],
        newValues: newValues
          ? Object.fromEntries(
              Object.entries(newValues).map(([id, v]) => [
                entity.fields.find((f) => f.id === id)?.name ?? id,
                v,
              ]),
            )
          : undefined,
      }
    })
    const suppliers: Record<string, { change: number; fresh: number; cannot: number }> = {}
    for (const a of all) {
      const s = a.supplier || '(none)'
      suppliers[s] ??= { change: 0, fresh: 0, cannot: 0 }
      if (a.fate === 'new') suppliers[s].fresh += 1
      else suppliers[s].change += 1
    }
    const cannot = l.cannotLines.map((c) => {
      const same = rows.filter(
        (r) =>
          String(r.values[display?.id ?? ''] ?? '')
            .trim()
            .toLowerCase() === c.name.trim().toLowerCase(),
      )
      const sheet = book.sheets.find((s) => s.name === c.sheet)
      const line = sheet?.lines.find((x) => x.at === c.at)
      return {
        name: c.name,
        at: c.at,
        because: c.because,
        fileCells: line ? line.cells.slice(0, 26) : [],
        candidates: same.map((r) => ({
          id: r.id,
          code: codeField ? String(r.values[codeField.id] ?? '') : '',
          supplier: supplierField ? String(r.values[supplierField.id] ?? '') : '',
          sell: r.values[`${entity.id}.l`] ?? r.values[`${entity.id}.r`] ?? null,
          src: String(r.values[`${entity.id}.src`] ?? ''),
          cat: String(r.values[`${entity.id}.cat`] ?? ''),
        })),
      }
    })
    /* WHAT SETTLING WOULD DO: for each line, the rows whose Code (and, on Parts, Supplier) is
       the workbook's own, and — when exactly one is — the engine's own merge of that line
       against that row alone, so the changes it would add are the engine's and not a guess. */
    const writable = writableColumns(entity, l.sheet)
    const nameAt = [...writable.entries()].find(([, f]) => f.id === display?.id)?.[0] ?? 2
    const codeAt = [...writable.entries()].find(([, f]) => f.id === codeField?.id)?.[0]
    const supAt = [...writable.entries()].find(([, f]) => f.id === supplierField?.id)?.[0]
    for (const c of cannot) {
      const code = codeAt === undefined ? '' : (c.fileCells[codeAt] ?? '').trim()
      const sup = supAt === undefined ? '' : (c.fileCells[supAt] ?? '').trim()
      const byCode = c.candidates.filter((x) => x.code.trim() === code && code !== '')
      const byBoth = supAt === undefined ? byCode : byCode.filter((x) => x.supplier.trim() === sup)
      const named = byCode.length === 1 ? byCode : byBoth.length === 1 ? byBoth : []
      ;(c as Record<string, unknown>).fileCode = code
      ;(c as Record<string, unknown>).fileSupplier = sup
      ;(c as Record<string, unknown>).namedBy =
        named.length === 1 ? (byCode.length === 1 ? 'code' : 'code+supplier') : null
      if (named.length === 1) {
        const row = rows.find((r) => r.id === named[0].id)!
        const sheet = book.sheets.find((s) => s.name === l.sheet)!
        const line = sheet.lines.find((x) => x.at === c.at)!
        const p = mergeLines({
          entity,
          rows: [row],
          lines: [line.cells],
          writable,
          identity: { on: 'name', at: nameAt, field: display! },
          columns: { matched: [], unknown: [], ambiguous: [], readOnly: [], missing: [] },
          fileName: 'Parts Module (2).xlsx',
          fileColumns: line.cells.length,
        })
        ;(c as Record<string, unknown>).wouldChange = p.changes.map((x) => ({
          col: x.columnName,
          fieldId: x.fieldId,
          from: x.from,
          to: x.to,
        }))
        ;(c as Record<string, unknown>).namedRow = named[0].id
      }
    }
    for (const c of cannot) {
      const s = c.candidates[0]?.supplier || '(none)'
      suppliers[s] ??= { change: 0, fresh: 0, cannot: 0 }
      suppliers[s].cannot += 1
    }
    return {
      tableId: l.tableId,
      name: l.name,
      kind: l.kind,
      sheet: l.sheet,
      readAt: l.readAt,
      rows: l.rows,
      matched: l.matched,
      changing: l.changing,
      adding: l.adding,
      cannot: l.cannot,
      higher: l.higher,
      lower: l.lower,
      notInFile: l.notInFile,
      census,
      spread,
      suppliers,
      cellChanges: l.plan.changes.length,
      lines: all,
      cannotLines: cannot,
      columns: entity.fields.map((f) => ({ id: f.id, name: f.name, type: f.type })),
    }
  })
  writeFileSync(
    OUT,
    JSON.stringify({
      file: {
        name: 'Parts Module (2).xlsx',
        bytes: statSync(FILE).size,
        mtime: statSync(FILE).mtime.toISOString(),
        readMs: ms,
      },
      edition: {
        packedAt: pack.manifest.packedAt,
        sha: (pack.manifest as unknown as { sourceSha256?: string }).sourceSha256,
        name: pack.manifest.name,
        counts: (pack.manifest as unknown as { counts?: unknown }).counts,
      },
      heads: Object.fromEntries(
        book.sheets.map((s) => [
          s.name,
          s.lines.slice(0, 14).map((l) => ({ at: l.at, cells: l.cells.slice(0, 26) })),
        ]),
      ),
      sheetsRead: plan.sheetsRead,
      sheetsLeft: plan.sheetsLeft,
      totalRows: plan.totalRows,
      listsUntouched: plan.listsUntouched,
      changing: plan.changing,
      adding: plan.adding,
      cannot: plan.cannot,
      changes: plan.changes,
      unmoved: plan.unmoved,
      unplaced: plan.unplaced,
      lists,
      checkFirst: plan.checkFirst.map((c) => ({
        list: plan.lists.find((x) => x.tableId === c.tableId)?.name,
        tableId: c.tableId,
        name: c.name,
        at: c.at,
        rowId: c.rowId,
        from: c.from,
        to: c.to,
        figures: c.figures,
      })),
    }),
  )
})
