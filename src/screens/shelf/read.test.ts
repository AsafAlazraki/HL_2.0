import { describe, expect, it } from 'vitest'
import type { EntityDef, QuoteDef, RowData } from '@/domain/model'
import { CUSTOMER_TABLE_ID } from '@/domain/people/customers'
import { loadPack } from '@/test/fixtures/pack'
import {
  copyFileName,
  forgetRefusal,
  inventoryOf,
  keptThroughAClear,
  lineName,
  whenSaid,
} from './read'
import { readPaste } from './pasted'

/* ============================================================
   WHAT THE SHELF COUNTS, held to the pack it is counted from. No
   figure below is written down: each is counted here off the pack and
   then asked of the screen's reader.
   ============================================================ */

async function world() {
  const pack = await loadPack()
  const tables: Record<string, EntityDef> = {}
  for (const e of pack.entities) tables[e.id] = e
  return { pack, tables }
}

describe('the inventory', () => {
  it('counts the price list as it is, and the empty day as empty', async () => {
    const { pack, tables } = await world()
    const n = inventoryOf(
      { tables, rows: pack.rowsByEntity, modules: pack.ctx.modules, constraintDefs: [] },
      [],
    )
    expect(n.lists).toBe(pack.entities.length)
    expect(n.lines).toBe(pack.entities.reduce((s, e) => s + pack.rowsByEntity[e.id].length, 0))
    expect(n).toMatchObject({ quotes: 0, customers: 0, rules: 0, details: 0, pictures: 0 })
  })

  it('keeps the customers out of the price list’s count, and counts a picture chosen on Places', async () => {
    const { pack, tables } = await world()
    const customers: EntityDef = {
      id: CUSTOMER_TABLE_ID,
      orgId: 'northside',
      name: 'Customers',
      fields: [],
      createdAt: '',
      updatedAt: '',
    } as unknown as EntityDef
    const person = { id: 'c1', entityId: CUSTOMER_TABLE_ID, values: {} } as unknown as RowData
    const place = Object.values(pack.ctx.modules)[0]
    const n = inventoryOf(
      {
        tables: { ...tables, [CUSTOMER_TABLE_ID]: customers },
        rows: { ...pack.rowsByEntity, [CUSTOMER_TABLE_ID]: [person] },
        modules: { [place.id]: { ...place, dress: { '': { hero: { from: 'maker', id: 'x' } } } } },
        constraintDefs: [],
        org: { name: 'Northside Marine', industry: 'marine', createdAt: '', abn: '51 824 753 556' },
      },
      /* two quotes that name nobody: a quote always carries a customer, and a blank name is no one */
      [
        { id: 'q1', state: 'issued', customer: { name: '' } } as QuoteDef,
        { id: 'q2', state: 'draft', customer: { name: '' } } as QuoteDef,
      ],
    )
    expect(n.lists).toBe(pack.entities.length)
    expect(n.customers).toBe(1)
    expect(n.kept).toBe(1)
    expect(n.pictures).toBe(1)
    expect(n.placesDressed).toBe(1)
    expect(n.details).toBe(2)
    expect(n).toMatchObject({ quotes: 2, given: 1 })
  })
})

describe('the customers, counted as the pill counts them', () => {
  it('counts a name a quote carries as a customer, and keeps it apart from the ones kept on Customers', async () => {
    const { pack, tables } = await world()
    const named = {
      id: 'q-given',
      state: 'issued',
      reference: '20261030-01',
      customer: { name: 'R. Kelleher' },
      createdAt: '2026-10-30T00:30:00.000Z',
      issuedAt: '2026-10-30T00:30:00.000Z',
      lines: [],
      sections: [],
    } as unknown as QuoteDef
    const n = inventoryOf(
      { tables, rows: pack.rowsByEntity, modules: pack.ctx.modules, constraintDefs: [] },
      [named],
    )
    expect(n.customers).toBe(1)
    expect(n.kept).toBe(0)
    expect(forgetRefusal(n, false)).toMatch(/^Save a copy first: /)
    expect(forgetRefusal(n, true)).toBeNull()
  })

  it('lets a computer with nothing of Northside’s own be forgotten without a copy', async () => {
    const { pack, tables } = await world()
    const n = inventoryOf(
      { tables, rows: pack.rowsByEntity, modules: pack.ctx.modules, constraintDefs: [] },
      [],
    )
    expect(forgetRefusal(n, false)).toBeNull()
  })
})

describe('a line of a workbook, as a person says it', () => {
  it('says a boat the way every screen says it, and not the workbook’s cell', async () => {
    const { tables } = await world()
    const asList = (id: string) => ({ tableId: id, name: tables[id].name, kind: tables[id].kind })
    const stacer = asList('boat_stacer')
    expect(lineName('Stacer - 509 Assault Pro (Tournament)', stacer, false)).toBe(
      'Stacer 509 Assault Pro · Tournament',
    )
    /* under its own list, whose head already says Stacer */
    expect(lineName('Stacer - 509 Assault Pro (Tournament)', stacer, true)).toBe(
      '509 Assault Pro · Tournament',
    )
    expect(lineName('Highfield - RU230KAM (PVC) WH', asList('boat_highfield'), true)).toBe(
      'Roll Up 230 KAM · PVC · WH',
    )
  })

  it('says a line that is not a boat as the build says it', async () => {
    const { pack, tables } = await world()
    const parts = { tableId: 'parts', name: tables.parts.name, kind: tables.parts.kind }
    const said = lineName('Tube Covers to suit PVC Boat - 2.0 Mtr', parts, true)
    expect(said).toBe('Tube Covers to suit PVC Boat · 2.0 Mtr')
    expect(pack.rowsByEntity.parts.length).toBeGreaterThan(0)
  })
})

describe('what clearing the price list keeps', () => {
  it('keeps the customers, the rules, the places and the prices, and nothing of the lines', async () => {
    const { pack, tables } = await world()
    const kept = keptThroughAClear({
      tables,
      rows: pack.rowsByEntity,
      constraintDefs: [],
      discoveredRules: [],
      modules: pack.ctx.modules,
      priceLevels: { boat_stacer: [] },
    })
    expect(kept.customers).toBeNull()
    expect(kept.modules).toHaveLength(Object.keys(pack.ctx.modules).length)
    expect(Object.keys(kept.priceLevels)).toEqual(['boat_stacer'])
  })
})

describe('a copy’s name and its day', () => {
  it('names the business, the day and the minute', () => {
    expect(copyFileName('Northside Marine', new Date(2026, 9, 30, 9, 41))).toBe(
      'Northside Marine copy 2026-10-30 0941.json',
    )
    const now = new Date(2026, 9, 30, 12, 0)
    expect(whenSaid(new Date(2026, 9, 30, 9, 41).toISOString(), now)).toMatch(/^today at 9:41/)
  })
})

describe('lines pasted from Excel', () => {
  it('reads a changed price by its name and a new line, and asks for the name when it is missing', async () => {
    const { pack, tables } = await world()
    const rows = pack.rowsByEntity.parts
    const tube = rows.find((r) => r.values['parts.c'] === 'Tube Covers to suit PVC Boat - 2.0 Mtr')
    const read = readPaste(
      tables.parts,
      rows,
      'Product\tSell\nTube Covers to suit PVC Boat - 2.0 Mtr\t1540\nA line this list does not carry\t99\n',
    )
    if (!read.ok) throw new Error(read.say)
    expect(read.changing).toBe(1)
    expect(read.adding).toBe(1)
    expect(read.lines[0]).toMatchObject({ fate: 'change', from: tube?.values['parts.l'], to: 1540 })
    expect(read.readAt).toBe('Sell')

    const nameless = readPaste(tables.parts, rows, 'Sell\n1540\n')
    expect(nameless.ok).toBe(false)
    if (!nameless.ok) expect(nameless.say).toMatch(/^No pasted heading reads Product/)
  })
})
