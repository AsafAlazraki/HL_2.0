/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { inflateRawSync } from 'node:zlib'
import type { EntityDef, RowData } from '@/domain/model'
import { emptySheet, indexRows, type CatalogueData } from '@/domain/catalogue/sheet'
import { apply, isDone } from '@/domain/catalogue/commands'
import { loadPack } from '@/test/fixtures/pack'
import { writeWorkbook, type SheetSpec } from '@/test/fixtures/workbook'
import { readWorkbook } from './workbook'
import { newFileCommand, planNewFile, sheetOf, writableColumns } from './newFile'

/* ============================================================
   A NEW VERSION OF THE PRICE FILE, READ AGAINST THE REAL PACK.

   The workbook below is written from the pack's OWN lines — every
   cell copied out of the column it cites — and then changed on
   purpose, each change named where it is made. So what the plan finds
   is exactly what was changed and nothing the copy introduced.
   ============================================================ */

const inflate = async (raw: Uint8Array): Promise<Uint8Array> => new Uint8Array(inflateRawSync(raw))

async function sheetData(): Promise<CatalogueData> {
  const pack = await loadPack()
  const tables: Record<string, EntityDef> = {}
  for (const e of pack.entities) tables[e.id] = e
  return {
    ...emptySheet(),
    orgId: 'northside',
    tables,
    rows: pack.rowsByEntity,
    index: indexRows(pack.rowsByEntity),
  }
}

/** The workbook line a row was read from, every cited column copied back. */
function lineOf(
  data: CatalogueData,
  row: RowData,
  change: Record<string, string | number> = {},
): SheetSpec['lines'][number] {
  const entity = data.tables[row.entityId]
  const sheet = sheetOf(entity, data.rows[entity.id]) as string
  const cells: Record<string, string | number> = {}
  for (const f of writableColumns(entity, sheet).values()) {
    const v = row.values[f.id]
    if (typeof v === 'number' || (typeof v === 'string' && v !== '')) {
      cells[f.id.slice(entity.id.length + 1).toUpperCase()] = v
    }
  }
  const at = Number(String(row.values[`${entity.id}.src`]).split('!R')[1])
  return { at, cells: { ...cells, ...change } }
}

const named = (data: CatalogueData, tableId: string, name: string): RowData => {
  const row = data.rows[tableId].find((r) => r.values[`${tableId}.c`] === name)
  if (!row) throw new Error(`no ${name} on ${tableId}`)
  return row
}

describe('a new price file, read before anything is written', () => {
  it('finds each change, each new line and each line it cannot place, and nothing else', async () => {
    const data = await sheetData()
    const tube = named(data, 'parts', 'Tube Covers to suit PVC Boat - 2.0 Mtr')
    const first = data.rows.parts[0]
    const boat = data.rows.boat_highfield[0]
    const kept = data.rows.parts[1]
    const book = await readWorkbook(
      writeWorkbook([
        {
          name: 'Parts Maintenance',
          lines: [
            /* the heading and the column numbers, as the real sheet carries them */
            { at: 1, cells: { C: 'Parts & Accessories Module', L: 'Sell' } },
            { at: 2, cells: { C: 1, D: 2, L: 10 } },
            /* CHANGED: Sell to 1,540, the figure Parts Module (2) carries (notes.md §0.3) */
            lineOf(data, tube, { L: 1540 }),
            /* CHANGED: Sell halved and more, so it is one to check first */
            lineOf(data, first, { L: 3 }),
            /* UNCHANGED: copied as it is */
            lineOf(data, kept),
            /* NEW: a name no line here carries, under the line above it */
            { at: 9000, cells: { C: 'A line this price list does not carry', L: 115 } },
          ],
        },
        {
          name: 'Boat Module',
          lines: [
            /* CHANGED: Cash up by 1,000 */
            lineOf(data, boat, { QR: Number(boat.values['boat_highfield.qr']) + 1000 }),
            /* CANNOT: a boat no maker's list here carries, on a sheet seven lists share */
            { at: 9001, cells: { C: 'A boat this price list does not carry', QR: 50000 } },
          ],
        },
        { name: 'Dropdowns', lines: [{ at: 1, cells: { A: 'Yes' } }] },
      ]),
      inflate,
    )
    const plan = planNewFile(book, data, 'Parts Module (2).xlsx')

    expect(plan.sheetsRead).toEqual(['Parts Maintenance', 'Boat Module'])
    expect(plan.sheetsLeft).toEqual(['Dropdowns'])
    expect(plan.changing).toBe(3)
    expect(plan.adding).toBe(1)
    expect(plan.cannot).toBe(1)
    expect(plan.changes).toBe(4)
    expect(plan.totalRows).toBe(15_691)
    expect(plan.unmoved).toBe(15_691 - 3)

    const parts = plan.lists.find((l) => l.tableId === 'parts')
    expect(parts?.readAt).toBe('Sell')
    expect(parts?.lines.find((l) => l.name === tube.values['parts.c'])).toMatchObject({
      fate: 'change',
      from: 1640,
      to: 1540,
    })
    expect(parts?.lower).toBe(2)
    expect(parts?.notInFile).toBe(data.rows.parts.length - 3)
    expect(plan.checkFirst.map((l) => l.name)).toEqual([first.values['parts.c']])

    /* the new line is filed under the category of the line above it in the workbook — the tube
       cover at R597 — with its own cell */
    const fresh = parts?.plan.newRows[0]
    expect(fresh?.values['parts.cat']).toBe(tube.values['parts.cat'])
    expect(fresh?.values['parts.src']).toBe('Parts Maintenance!R9000')

    const boats = plan.lists.find((l) => l.tableId === 'boat_highfield')
    expect(boats?.higher).toBe(1)
    expect(boats?.cannot).toBe(0)
    expect(plan.unplaced.map((l) => [l.sheet, l.because])).toEqual([['Boat Module', 'no-list']])
  })

  it('applies as one step and comes back exactly in one', async () => {
    const data = await sheetData()
    const tube = named(data, 'parts', 'Tube Covers to suit PVC Boat - 2.0 Mtr')
    const book = await readWorkbook(
      writeWorkbook([
        {
          name: 'Parts Maintenance',
          lines: [
            lineOf(data, tube, { L: 1540 }),
            { at: 9000, cells: { C: 'A line this price list does not carry', L: 115 } },
          ],
        },
      ]),
      inflate,
    )
    const plan = planNewFile(book, data, 'Parts Module (2).xlsx')
    const done = apply(data, newFileCommand(plan, 'Parts Module (2).xlsx: 2 changes'), 'now')
    if (!isDone(done)) throw new Error(done.refused)
    const after = done.next.rows.parts
    expect(after).toHaveLength(data.rows.parts.length + 1)
    expect(after.find((r) => r.id === tube.id)?.values['parts.l']).toBe(1540)
    expect(done.said).toBe('Parts Module (2).xlsx: 2 changes')

    const back = apply(done.next, done.inverse, 'later')
    if (!isDone(back)) throw new Error(back.refused)
    expect(back.next.rows.parts).toHaveLength(data.rows.parts.length)
    expect(back.next.rows.parts.find((r) => r.id === tube.id)?.values).toEqual(tube.values)
  })

  /* NORTHSIDE'S OWN RE-ISSUE, when it is on this machine (outside the repository, not in CI).
     The figures are printed so docs/SCREENS.md can quote what was measured, not expected. */
  const real = 'C:/Users/Asaf/dev/mpf-workbooks/Parts Module (2).xlsx'
  it.runIf(existsSync(real))('reads Northside’s Parts Module (2) against the pack', async () => {
    const data = await sheetData()
    const book = await readWorkbook(new Uint8Array(readFileSync(real)), inflate, (n) =>
      ['Parts Maintenance', 'Dealer Fit Module'].includes(n),
    )
    const plan = planNewFile(book, data, 'Parts Module (2).xlsx')
    const say = plan.lists.map(
      (l) =>
        `${l.name}: change ${l.changing} (higher ${l.higher}, lower ${l.lower}), new ${l.adding}, cannot ${l.cannot}, not in it ${l.notInFile}`,
    )
    console.log(
      [
        `Parts Module (2): changes ${plan.changes} = ${plan.changing} + ${plan.adding}; cannot ${plan.cannot}; unmoved ${plan.unmoved} of ${plan.totalRows}; check first ${plan.checkFirst.length}`,
        ...say,
        ...plan.checkFirst.slice(0, 3).map((l) => `  ${l.name}: ${l.from} → ${l.to}`),
      ].join('\n'),
    )
    expect(plan.changes).toBe(plan.changing + plan.adding)
    expect(plan.unmoved + plan.changing).toBe(plan.totalRows)
  })
})
