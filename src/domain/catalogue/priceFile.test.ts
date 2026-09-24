import { beforeAll, describe, expect, it } from 'vitest'
import type { EntityDef, ModuleDef, RowData } from '@/domain/model'
import { addRow, apply, batch, createTable, isDone } from '@/domain/catalogue/commands'
import { emptySheet, indexRows, type CatalogueData } from '@/domain/catalogue/sheet'
import { cellsFor, registerShape } from '@/domain/people/book'
import { CUSTOMER_TABLE_ID } from '@/domain/people/customers'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { countPriceFile, countTables, madeAtThisDesk, priceFileOf } from './priceFile'

/* ============================================================
   THE PRICE FILE AGAINST THE SHEET IT SITS ON, read off the real pack
   and then changed by the same commands the screens apply.

   Nothing here is planted: the book is made by `registerShape()` and a
   person filed into it by `addRow`, in one `batch`, exactly as
   Customers files the first person; a register is made by the bare
   `createTable` Data's "New register" applies. Every figure the file is
   held to is the manifest's own, read here only as the second opinion.
   ============================================================ */

let pack: PackFixture
let sheet: CatalogueData

beforeAll(async () => {
  pack = await loadPack()
  const rows: Record<string, RowData[]> = {}
  for (const e of pack.entities) rows[e.id] = [...(pack.rowsByEntity[e.id] ?? [])]
  sheet = {
    ...emptySheet(),
    orgId: 'northside',
    tables: Object.fromEntries(pack.entities.map((e) => [e.id, e])),
    rows,
    index: indexRows(rows),
    modules: pack.ctx.modules as Record<string, ModuleDef>,
  }
})

const NOW = '2026-09-24T00:54:00.000Z'

/** File one person the way Customers files the first: the book made and
 *  the row added in one step. */
function fileTheFirst(data: CatalogueData, name: string): CatalogueData {
  const shape = registerShape()
  const nameId = shape.fields?.[0]?.id ?? ''
  const outcome = apply(
    data,
    batch([createTable(shape), addRow(CUSTOMER_TABLE_ID, cellsFor(nameId, name))]),
    NOW,
  )
  if (!isDone(outcome)) throw new Error(outcome.refused)
  return outcome.next
}

describe('the price file, on the sheet it landed on', () => {
  it('is every table the file brought, and nothing is the desk’s', () => {
    const file = priceFileOf(sheet.tables, sheet.modules)
    expect(Object.keys(file.desk)).toEqual([])
    expect(Object.keys(file.tables)).toHaveLength(pack.manifest.tables.length)

    const count = countPriceFile(sheet.tables, sheet.rows, sheet.modules)
    expect(count.tables).toBe(pack.manifest.counts.tables)
    expect(count.rows).toBe(pack.manifest.counts.rows)
    expect(count.joins).toBe(pack.manifest.counts.joins)
    expect(count.baseTables + count.joins).toBe(count.tables)
    expect(count.baseRows + count.joinRows).toBe(count.rows)
  })
})

describe('filing a customer', () => {
  /* THE CRITIQUE'S BLOCKER, AS IT WAS DRIVEN: file M. Duffy, and every
     figure of the file moved by one — 53 tables became 54, 15,691 rows
     became 15,692, and the book was named among what the file holds. */
  it('makes the book a table on the sheet and leaves the price file as it was', () => {
    const before = countPriceFile(sheet.tables, sheet.rows, sheet.modules)
    const after = fileTheFirst(sheet, 'M. Duffy')

    /* the sheet did grow: the reading does not pretend otherwise */
    expect(countTables(after.tables, after.rows).tables).toBe(before.tables + 1)
    expect(countTables(after.tables, after.rows).rows).toBe(before.rows + 1)

    /* and the file did not */
    expect(countPriceFile(after.tables, after.rows, after.modules)).toEqual(before)
    const file = priceFileOf(after.tables, after.modules)
    expect(madeAtThisDesk(file, CUSTOMER_TABLE_ID)).toBe(true)
    expect(file.tables[CUSTOMER_TABLE_ID]).toBeUndefined()
    expect(Object.keys(file.desk)).toEqual([CUSTOMER_TABLE_ID])
  })

  it('does not grow the file with every person filed after the first', () => {
    let data = fileTheFirst(sheet, 'M. Duffy')
    const nameId = data.tables[CUSTOMER_TABLE_ID]?.displayFieldId ?? ''
    for (const name of ['R. Kelleher', 'S. Jones']) {
      const outcome = apply(data, addRow(CUSTOMER_TABLE_ID, cellsFor(nameId, name)), NOW)
      if (!isDone(outcome)) throw new Error(outcome.refused)
      data = outcome.next
    }
    expect(data.rows[CUSTOMER_TABLE_ID]).toHaveLength(3)
    expect(countPriceFile(data.tables, data.rows, data.modules).rows).toBe(
      pack.manifest.counts.rows,
    )
  })
})

describe('a register made at this desk', () => {
  it('is the desk’s, and so is a join that links it; a join between the file’s own tables is not', () => {
    const outcome = apply(sheet, createTable({ name: 'Boat show leads', kind: 'custom' }), NOW)
    if (!isDone(outcome)) throw new Error(outcome.refused)
    const made = Object.values(outcome.next.tables).find((t) => t.name === 'Boat show leads')!

    /* one of the file's own joins, re-pointed at the new register: a
       pairing with one end made here is not a pairing the file carried */
    const fileJoin = pack.entities.find((e) => e.role === 'join')!
    const linking: EntityDef = {
      ...fileJoin,
      id: 'mine_join',
      fields: fileJoin.fields.map((f, i) =>
        i === fileJoin.fields.findIndex((x) => x.type === 'reference')
          ? { ...f, refEntityId: made.id }
          : f,
      ),
    }
    const tables = { ...outcome.next.tables, mine_join: linking }
    const file = priceFileOf(tables, outcome.next.modules)

    expect(madeAtThisDesk(file, made.id)).toBe(true)
    expect(madeAtThisDesk(file, 'mine_join')).toBe(true)
    expect(madeAtThisDesk(file, fileJoin.id)).toBe(false)
    expect(Object.keys(file.tables)).toHaveLength(pack.manifest.tables.length)
  })
})

describe('a sheet with no places', () => {
  /* Nothing on it says a table came from a price file, so it shows none —
     the answer Data's register already gave such a sheet. */
  it('shows no price file, and counts every table as the desk’s', () => {
    const file = priceFileOf(sheet.tables, {})
    expect(Object.keys(file.tables)).toEqual([])
    expect(Object.keys(file.desk)).toHaveLength(pack.entities.length)
    expect(countPriceFile(sheet.tables, sheet.rows, {}).tables).toBe(0)
  })

  it('counts nothing on an empty sheet', () => {
    expect(countPriceFile({}, {}, {})).toEqual({
      tables: 0,
      rows: 0,
      joins: 0,
      joinRows: 0,
      baseTables: 0,
      baseRows: 0,
    })
  })
})
