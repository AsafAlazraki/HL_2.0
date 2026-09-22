/* ============================================================
   EVERY CATALOGUE COMMAND: forward, the way back byte-equal, what it
   said and what the audit kept, and every refusal as a sentence.

   The pack cases run over the real file — 53 tables, 15,691 rows —
   because a cascade that is right on three fixture rows and wrong on
   the 118 pairings a Highfield hull really has is the kind of wrong
   this repository exists to catch. The fixture cases carry the shapes
   the pack does not have (a calculated column, a link on a base
   table, a rule) and are obviously synthetic: "Table A", "Column 1".

   "BYTE-EQUAL" IS `toEqual` ON THE MAPS THE ACT TOUCHED, and where
   the way back puts an OBJECT back it is also `toBe`: the inverse
   restores the row, the table, the pages that were there, not
   today's re-reading of them.
   ============================================================ */

import { describe, expect, it } from 'vitest'
import type { EntityDef, FieldDef, ModuleDef, RowData, RuleDef, ViewDef } from '@/domain/model'
import { loadPack } from '@/test/fixtures/pack'
import { cascadeOfRowDelete } from './deleteCascade'
import { entityDependents } from './dependents'
import { retypePlan } from './columnFacts'
import {
  COLUMN_GONE,
  NO_ORG,
  ROW_GONE,
  TABLE_GONE,
  UID_LOCKED,
  addField,
  addRow,
  apply,
  batch,
  columnTaken,
  costAsRung,
  createTable,
  deleteField,
  deleteFieldRadius,
  deleteRow,
  deleteRowRadius,
  deleteTable,
  deleteTableRadius,
  isDone,
  ladderRung,
  machinery,
  pairingIdentity,
  renameField,
  retargetField,
  retypeField,
  retypeRadius,
  rungNotANumber,
  tableTaken,
  updateCell,
  type CatalogueCommand,
  type Done,
  type Outcome,
} from './commands'
import { emptySheet, indexRows, type CatalogueData } from './sheet'

const NOW = '2026-09-22T09:00:00.000Z'
const ISO = '2026-01-01T00:00:00.000Z'
const ORG = 'test'

/* ---------------------------------------------------------- */
/* Two sheets: the pack, and a small one with the shapes the   */
/* pack has not got                                            */
/* ---------------------------------------------------------- */

const pack = await loadPack()

function sheetOfPack(): CatalogueData {
  const tables: Record<string, EntityDef> = {}
  for (const e of pack.entities) tables[e.id] = e
  const rows: Record<string, RowData[]> = {}
  for (const e of pack.entities) rows[e.id] = [...(pack.rowsByEntity[e.id] ?? [])]
  const priceLevels: Record<
    string,
    typeof pack.ctx.priceLevels extends Record<string, infer L> ? L : never
  > = {}
  for (const [id, levels] of Object.entries(pack.ctx.priceLevels)) {
    if (levels.length > 0) priceLevels[id] = levels
  }
  return {
    ...emptySheet(),
    orgId: 'northside',
    version: pack.manifest.version,
    from: 'pack',
    business: pack.manifest.name,
    tables,
    rows,
    index: indexRows(rows),
    modules: pack.ctx.modules,
    priceLevels,
  }
}

const table = (
  id: string,
  name: string,
  fields: FieldDef[],
  extra: Partial<EntityDef> = {},
): EntityDef => ({
  id,
  orgId: ORG,
  name,
  accent: 'blue',
  fields,
  position: { x: 0, y: 0 },
  createdAt: ISO,
  updatedAt: ISO,
  ...extra,
})

const row = (entityId: string, id: string, values: RowData['values']): RowData => ({
  id,
  orgId: ORG,
  entityId,
  values,
  createdAt: ISO,
  updatedAt: ISO,
})

interface Small {
  tables?: EntityDef[]
  rows?: RowData[]
  rules?: RuleDef[]
  views?: ViewDef[]
  modules?: ModuleDef[]
}

function sheet(small: Small): CatalogueData {
  const tables: Record<string, EntityDef> = {}
  const rows: Record<string, RowData[]> = {}
  const priceLevels: Record<string, EntityDef['priceLevels'] & object> = {}
  for (const t of small.tables ?? []) {
    tables[t.id] = t
    rows[t.id] = []
    if (t.priceLevels && t.priceLevels.length > 0) priceLevels[t.id] = t.priceLevels
  }
  for (const r of small.rows ?? []) (rows[r.entityId] ??= []).push(r)
  const byId = <T extends { id: string }>(xs: T[] | undefined): Record<string, T> =>
    Object.fromEntries((xs ?? []).map((x) => [x.id, x]))
  return {
    ...emptySheet(),
    orgId: ORG,
    tables,
    rows,
    index: indexRows(rows),
    rules: byId(small.rules),
    views: byId(small.views),
    modules: byId(small.modules),
    priceLevels,
  }
}

/** Boats with a calculated column and a ladder, trailers, a join
 *  between them, a package table that links to a boat, and a rule
 *  rooted on boats — the smallest sheet that carries every act. */
function world(): CatalogueData {
  const boats = table(
    'e-boats',
    'Boats',
    [
      { id: 'f-model', name: 'Model', type: 'text', sectionId: 's-id' },
      { id: 'f-code', name: 'Model Code', type: 'text', sectionId: 's-id' },
      { id: 'f-cash', name: 'Cash', type: 'number', sectionId: 's-price' },
      { id: 'f-double', name: 'Double', type: 'formula', formula: '[Cash] * 2' },
    ],
    {
      kind: 'boat',
      sections: [
        { id: 's-id', name: 'Identity' },
        { id: 's-price', name: 'Pricing' },
      ],
      displayFieldId: 'f-model',
      hierarchy: ['f-model'],
      priceLevels: [{ key: 'cash', label: 'Cash', fieldId: 'f-cash', scope: 'quote' }],
    },
  )
  const trailers = table(
    'e-trailers',
    'Trailers',
    [{ id: 'f-tname', name: 'Model', type: 'text' }],
    {
      kind: 'trailer',
      displayFieldId: 'f-tname',
    },
  )
  const fitment = table(
    'e-fit',
    'Boats × Trailers — Trailer Fitment',
    [
      { id: 'f-label', name: 'Label', type: 'text' },
      { id: 'f-boat', name: 'Boat', type: 'reference', refEntityId: 'e-boats' },
      { id: 'f-trailer', name: 'Trailer', type: 'reference', refEntityId: 'e-trailers' },
      { id: '__origin', name: 'Origin', type: 'text' },
      { id: '__recommended', name: 'Recommended', type: 'boolean' },
      { id: '__order', name: 'Order', type: 'number' },
    ],
    { role: 'join', displayFieldId: 'f-label' },
  )
  const packages = table(
    'e-pkg',
    'Packages',
    [
      { id: 'f-pname', name: 'Name', type: 'text' },
      { id: 'f-pboat', name: 'Boat', type: 'reference', refEntityId: 'e-boats' },
    ],
    { kind: 'package', displayFieldId: 'f-pname' },
  )
  const rule: RuleDef = {
    id: 'r-fit',
    orgId: ORG,
    name: 'Trailer fitment',
    rootEntityId: 'e-boats',
    enabled: true,
    nodes: [],
    edges: [],
    createdAt: ISO,
    updatedAt: ISO,
  }
  const view: ViewDef = {
    id: 'v-boats',
    orgId: ORG,
    name: 'Boats',
    rootTableId: 'e-boats',
    blocks: [{ id: 'b1', tableId: 'e-trailers', joinTableId: 'e-fit', columns: ['f-tname'] }],
    createdAt: ISO,
    updatedAt: ISO,
  }
  const module: ModuleDef = {
    id: 'm-boats',
    orgId: ORG,
    name: 'Boats',
    description: '',
    tableIds: ['e-boats', 'e-trailers'],
    capabilities: ['browse'],
    index: 'rows',
    accent: 'blue',
    order: 0,
    viewId: 'v-boats',
    createdAt: ISO,
    updatedAt: ISO,
  }
  return sheet({
    tables: [boats, trailers, fitment, packages],
    rows: [
      row('e-boats', 'b1', { 'f-model': '540 Pro Fisher', 'f-code': '540-PF', 'f-cash': 52000 }),
      row('e-boats', 'b2', { 'f-model': '610 Pro Fisher', 'f-code': '610-PF', 'f-cash': 61000 }),
      row('e-trailers', 't1', { 'f-tname': 'SRW5.7M-13TB' }),
      row('e-fit', 'x1', { 'f-label': '540 · SRW5.7M', 'f-boat': 'b1', 'f-trailer': 't1' }),
      row('e-fit', 'x2', { 'f-label': '610 · SRW5.7M', 'f-boat': 'b2', 'f-trailer': 't1' }),
      row('e-pkg', 'p1', { 'f-pname': '540 on the road', 'f-pboat': 'b1' }),
    ],
    rules: [rule],
    views: [view],
    modules: [module],
  })
}

/* ---------------------------------------------------------- */

const done = (o: Outcome): Done => {
  if (!isDone(o)) throw new Error(`refused: ${o.refused}`)
  return o
}
const refusalOf = (o: Outcome): string => (isDone(o) ? '' : o.refused)
const run = (data: CatalogueData, c: CatalogueCommand, at = NOW): Done => done(c(data, at))
const back = (d: Done, at = '2026-09-22T09:01:00.000Z'): Done => done(d.inverse(d.next, at))
const cell = (data: CatalogueData, tableId: string, rowId: string, fieldId: string) =>
  data.rows[tableId].find((r) => r.id === rowId)?.values[fieldId]

/* ============================================================
   CELLS
   ============================================================ */

describe('updateCell', () => {
  const HF = 'boat_highfield'

  it('writes one cell, touches that one row, and leaves every other row the same object', () => {
    const data = sheetOfPack()
    const target = data.rows[HF][10]
    const fieldId = 'boat_highfield.c'
    const d = run(data, updateCell(HF, target.id, fieldId, 'A name typed for the test'))
    const after = d.next.rows[HF]
    expect(after[10].values[fieldId]).toBe('A name typed for the test')
    expect(after[10].updatedAt).toBe(NOW)
    expect(after[10]).not.toBe(target)
    /* 587 of 588 objects are the ones that were there */
    expect(after.filter((r, i) => r === data.rows[HF][i])).toHaveLength(587)
    /* the index points at the new row, and nothing else moved */
    expect(d.next.index.rowById[target.id]).toBe(after[10])
    expect(d.next.tables).toBe(data.tables)
  })

  it('says the old label and keeps the table’s own provenance on the event', () => {
    const data = sheetOfPack()
    const target = data.rows[HF][0]
    const d = run(data, updateCell(HF, target.id, 'boat_highfield.c', 'x'))
    expect(d.said).toBe('Cell edit · Highfield Inflatables')
    expect(d.event.kind).toBe('cell-set')
    expect(d.event.tableName).toBe('Highfield Inflatables')
    expect(d.event.rowId).toBe(target.id)
    expect(d.event.fieldId).toBe('boat_highfield.c')
    /* the packer's own line about where the table came from */
    expect(d.event.provenance).toBe(data.tables[HF].description)
    expect(d.event.provenance).toMatch(/Boat Module/)
    expect(d.event.changed).toEqual([
      {
        path: `${HF}.${target.id}.boat_highfield.c`,
        from: target.values['boat_highfield.c'],
        to: 'x',
      },
    ])
  })

  it('the way back puts the row object itself back, byte-equal and identical', () => {
    const data = sheetOfPack()
    const target = data.rows[HF][3]
    const d = run(data, updateCell(HF, target.id, 'boat_highfield.c', 'x'))
    const b = back(d)
    expect(b.next.rows[HF]).toEqual(data.rows[HF])
    expect(b.next.rows[HF][3]).toBe(target)
    expect(b.next.index.rowById[target.id]).toBe(target)
    /* and the way back from the way back is the forward row, by reference */
    const again = done(b.inverse(b.next, NOW))
    expect(again.next.rows[HF][3]).toBe(d.next.rows[HF][3])
  })

  it('a commit that changed nothing is not a step', () => {
    const data = sheetOfPack()
    const target = data.rows[HF][0]
    const held = target.values['boat_highfield.c']
    expect(
      refusalOf(updateCell(HF, target.id, 'boat_highfield.c', held as string)(data, NOW)),
    ).toBe('')
    /* absent and null are the same nothing */
    expect(refusalOf(updateCell(HF, target.id, 'boat_highfield.zz', null)(data, NOW))).not.toBe('')
  })

  it('refuses, with the sentence, a table, a row or a column that is not there', () => {
    const data = world()
    expect(refusalOf(updateCell('nope', 'b1', 'f-cash', 1)(data, NOW))).toBe(TABLE_GONE)
    expect(refusalOf(updateCell('e-boats', 'nope', 'f-cash', 1)(data, NOW))).toBe(ROW_GONE)
    expect(refusalOf(updateCell('e-boats', 'b1', 'nope', 1)(data, NOW))).toBe(COLUMN_GONE)
  })

  it('refuses the row’s own identity and a calculated column', () => {
    const data = world()
    expect(refusalOf(updateCell('e-boats', 'b1', '__uid', 'x')(data, NOW))).toBe(UID_LOCKED)
    expect(refusalOf(updateCell('e-boats', 'b1', 'f-double', 4)(data, NOW))).toBe(
      'Double is worked out from other columns — there is no cell to write.',
    )
  })

  it('a link cell must point at a row of the table it links to', () => {
    const data = sheetOfPack()
    const join = 'join_hf_yam'
    const pair = data.rows[join][0]
    const motor = data.rows['mot_yamaha'][0]
    expect(refusalOf(updateCell(join, pair.id, 'join_hf_yam.boat', motor.id)(data, NOW))).toBe(
      `“${motor.id}” is not a row of Highfield Inflatables, so Boat cannot point at it.`,
    )
    const hull = data.rows[HF][5]
    const d = run(data, updateCell(join, pair.id, 'join_hf_yam.boat', hull.id))
    expect(cell(d.next, join, pair.id, 'join_hf_yam.boat')).toBe(hull.id)
  })

  it('apply stamps who did it, and nothing else', () => {
    const data = world()
    const o = apply(data, updateCell('e-boats', 'b1', 'f-cash', 1), NOW, 'Asaf')
    expect(done(o).event.by).toBe('Asaf')
    expect(
      done(apply(data, updateCell('e-boats', 'b1', 'f-cash', 1), NOW)).event.by,
    ).toBeUndefined()
  })
})

/* ============================================================
   ROWS
   ============================================================ */

describe('addRow', () => {
  it('lands at the foot of the table with the columns’ defaults, and the way back takes it off', () => {
    const data = world()
    const boats = { ...data.tables['e-boats'] }
    boats.fields = boats.fields.map((f) => (f.id === 'f-code' ? { ...f, defaultValue: 'NEW' } : f))
    const withDefault = { ...data, tables: { ...data.tables, 'e-boats': boats } }
    const d = run(withDefault, addRow('e-boats', { 'f-model': 'Made now', 'f-double': 9 }, 'b-new'))
    const made = d.next.rows['e-boats'][2]
    expect(made).toEqual({
      id: 'b-new',
      orgId: ORG,
      entityId: 'e-boats',
      /* the typed value, the default, and never the calculated column */
      values: { 'f-model': 'Made now', 'f-code': 'NEW' },
      createdAt: NOW,
      updatedAt: NOW,
    })
    expect(d.next.index.rowById['b-new']).toBe(made)
    expect(d.said).toBe('Row added · Boats')
    expect(d.event.changed).toEqual([{ path: 'e-boats.b-new', from: null, to: 'Made now' }])

    const b = back(d)
    expect(b.next.rows['e-boats']).toEqual(withDefault.rows['e-boats'])
    expect(b.next.index.rowById['b-new']).toBeUndefined()
    expect(b.said).toBe('Row deleted · Boats')
    /* back again: the SAME row, at its index, not a re-add with a new id */
    const again = done(b.inverse(b.next, NOW))
    expect(again.next.rows['e-boats'][2]).toBe(made)
  })

  it('refuses a table that is gone and an id already on the sheet', () => {
    const data = world()
    expect(refusalOf(addRow('nope', {}, 'x')(data, NOW))).toBe(TABLE_GONE)
    expect(refusalOf(addRow('e-boats', {}, 'b1')(data, NOW))).toBe(
      'A row with the id “b1” is already on the sheet.',
    )
  })

  it('the way back is nothing when the row was already taken off by hand', () => {
    const data = world()
    const d = run(data, addRow('e-boats', {}, 'b-new'))
    const byHand = run(d.next, deleteRow('e-boats', 'b-new'))
    expect(refusalOf(d.inverse(byHand.next, NOW))).toBe('')
  })
})

describe('deleteRow, and what else goes', () => {
  const HF = 'boat_highfield'

  it('takes every pairing that named the hull, on the real pack, and says how many', () => {
    const data = sheetOfPack()
    /* the hull with the most pairings across the five Highfield joins */
    const counts = data.rows[HF].map((r) => ({
      id: r.id,
      n: cascadeOfRowDelete(data.tables, data.rows, HF, r.id).pairings.reduce(
        (s, p) => s + p.rowIds.length,
        0,
      ),
    }))
    const most = counts.reduce((a, b) => (b.n > a.n ? b : a))
    expect(most.n).toBeGreaterThan(0)

    const radius = deleteRowRadius(data, HF, most.id)
    const d = run(data, deleteRow(HF, most.id))
    expect(d.next.rows[HF]).toHaveLength(587)
    expect(d.next.index.rowById[most.id]).toBeUndefined()
    for (const hold of radius.cascade.pairings) {
      const left = d.next.rows[hold.tableId]
      expect(left).toHaveLength(data.rows[hold.tableId].length - hold.rowIds.length)
      for (const id of hold.rowIds) expect(d.next.index.rowById[id]).toBeUndefined()
    }
    expect(d.event.also).toBe(radius.said)
    expect(d.event.also).toMatch(/^This also removes \d+ pairings? from /)
    expect(d.said).toBe('Row deleted · Highfield Inflatables')
  })

  it('the way back puts the hull and every pairing back where each sat, byte-equal', () => {
    const data = sheetOfPack()
    const subject = data.rows[HF][20]
    const radius = deleteRowRadius(data, HF, subject.id)
    expect(radius.cascade.pairings.length).toBeGreaterThan(0)
    const d = run(data, deleteRow(HF, subject.id))
    const b = back(d)
    expect(b.next.rows[HF]).toEqual(data.rows[HF])
    expect(b.next.rows[HF][20]).toBe(subject)
    for (const hold of radius.cascade.pairings) {
      expect(b.next.rows[hold.tableId]).toEqual(data.rows[hold.tableId])
    }
    expect(Object.keys(b.next.index.rowById)).toHaveLength(Object.keys(data.index.rowById).length)
    expect(b.said).toBe('Row added · Highfield Inflatables')
  })

  it('empties the link on a base table row and keeps the row; the pairing on the join goes', () => {
    const data = world()
    const radius = deleteRowRadius(data, 'e-boats', 'b1')
    expect(radius.cascade.pairings).toEqual([
      {
        tableId: 'e-fit',
        tableName: 'Boats × Trailers — Trailer Fitment',
        fieldId: 'f-boat',
        fieldName: 'Boat',
        rowIds: ['x1'],
      },
    ])
    expect(radius.cascade.unlinked).toEqual([
      {
        tableId: 'e-pkg',
        tableName: 'Packages',
        fieldId: 'f-pboat',
        fieldName: 'Boat',
        rowIds: ['p1'],
      },
    ])
    expect(radius.said).toBe(
      'This also removes 1 pairing from Boats × Trailers — Trailer Fitment and the Boat link on 1 row of Packages.',
    )

    const d = run(data, deleteRow('e-boats', 'b1'))
    expect(d.next.rows['e-fit'].map((r) => r.id)).toEqual(['x2'])
    expect(d.next.rows['e-pkg'][0].values).toEqual({ 'f-pname': '540 on the road' })
    expect(d.next.rows['e-pkg'][0].updatedAt).toBe(NOW)

    const b = back(d)
    expect(b.next.rows).toEqual(data.rows)
    expect(b.next.rows['e-pkg'][0]).toBe(data.rows['e-pkg'][0])
    expect(b.next.rows['e-fit'][0]).toBe(data.rows['e-fit'][0])
  })

  it('a row nothing names goes alone, and the event says nothing extra', () => {
    const data = world()
    const d = run(data, deleteRow('e-pkg', 'p1'))
    expect(d.event.also).toBeUndefined()
    expect(d.next.rows['e-fit']).toBe(data.rows['e-fit'])
  })

  it('refuses a row that is not there', () => {
    expect(refusalOf(deleteRow('e-boats', 'nope')(world(), NOW))).toBe(ROW_GONE)
    expect(refusalOf(deleteRow('nope', 'b1')(world(), NOW))).toBe(TABLE_GONE)
  })
})

/* ============================================================
   COLUMNS
   ============================================================ */

describe('addField', () => {
  it('names an unnamed column “Column N”, never “Field N”, and the way back is the table as it was', () => {
    const data = world()
    const d = run(data, addField('e-boats', { fieldId: 'f-new' }))
    const t = d.next.tables['e-boats']
    expect(t.fields[4]).toEqual({ id: 'f-new', name: 'Column 5', type: 'text' })
    expect(t.updatedAt).toBe(NOW)
    expect(d.said).toBe('Column added · Boats')
    expect(d.event.changed).toEqual([
      { path: 'e-boats.fields.f-new.name', from: null, to: 'Column 5' },
      { path: 'e-boats.fields.f-new.type', from: null, to: 'text' },
    ])
    const b = back(d)
    expect(b.next.tables['e-boats']).toBe(data.tables['e-boats'])
    expect(done(b.inverse(b.next, NOW)).next.tables['e-boats']).toBe(t)
  })

  it('refuses a name or an id a sibling holds, and a link that points nowhere', () => {
    const data = world()
    expect(refusalOf(addField('e-boats', { name: ' cash ' })(data, NOW))).toBe(columnTaken('cash'))
    expect(refusalOf(addField('e-boats', { fieldId: 'f-cash' })(data, NOW))).toBe(
      'A column with the id “f-cash” is already on this table.',
    )
    expect(refusalOf(addField('e-boats', { type: 'reference' })(data, NOW))).toBe(
      'A link column needs a table to point at.',
    )
    expect(
      refusalOf(addField('e-boats', { type: 'reference', refEntityId: 'nope' })(data, NOW)),
    ).toBe('A link column needs a table to point at, and “nope” is not on the sheet.')
    expect(refusalOf(addField('nope')(data, NOW))).toBe(TABLE_GONE)
  })

  it('a cost column may not be created as a price level', () => {
    const data = world()
    const cost: FieldDef = { id: 'f-lc', name: 'Landed Hull Cost', type: 'number' }
    expect(
      refusalOf(
        addField('e-boats', {
          fieldId: 'f-lc',
          name: cost.name,
          type: 'number',
          level: { key: 'lc', scope: 'quote' },
        })(data, NOW),
      ),
    ).toBe(costAsRung(cost))
    /* and by BAND: a plainly named column filed under a cost band */
    const banded = { ...data.tables['e-boats'], sections: [{ id: 's-price', name: 'Cost Build' }] }
    const inBand = { ...data, tables: { ...data.tables, 'e-boats': banded } }
    const promo: FieldDef = { id: 'f-promo', name: 'Promo', type: 'number', sectionId: 's-price' }
    expect(
      refusalOf(
        addField('e-boats', {
          fieldId: 'f-promo',
          name: 'Promo',
          type: 'number',
          sectionId: 's-price',
          level: { key: 'promo', scope: 'quote' },
        })(inBand, NOW),
      ),
    ).toBe(costAsRung(promo))
  })

  it('a rung is a number column with a key the ladder does not have yet', () => {
    const data = world()
    const asText: FieldDef = { id: 'f-t', name: 'Promo', type: 'text' }
    expect(
      refusalOf(
        addField('e-boats', {
          fieldId: 'f-t',
          name: 'Promo',
          level: { key: 'promo', scope: 'quote' },
        })(data, NOW),
      ),
    ).toBe(rungNotANumber(asText))
    expect(
      refusalOf(
        addField('e-boats', {
          name: 'Promo',
          type: 'number',
          level: { key: 'cash', scope: 'quote' },
        })(data, NOW),
      ),
    ).toBe('This table already has a “cash” rung on its price ladder.')
  })

  it('declares the rung on the table and on the filed ladder in one step, and takes both back', () => {
    const data = world()
    const d = run(
      data,
      addField('e-boats', {
        fieldId: 'f-promo',
        name: 'Promo',
        type: 'number',
        level: { key: 'promo', scope: 'quote' },
      }),
    )
    const rung = { key: 'promo', label: 'Promo', fieldId: 'f-promo', scope: 'quote' }
    expect(d.next.priceLevels['e-boats']).toEqual([data.priceLevels['e-boats'][0], rung])
    expect(d.next.tables['e-boats'].priceLevels).toEqual(d.next.priceLevels['e-boats'])
    const b = back(d)
    expect(b.next.priceLevels).toEqual(data.priceLevels)
    expect(b.next.priceLevels['e-boats']).toBe(data.priceLevels['e-boats'])
    expect(b.next.tables['e-boats']).toBe(data.tables['e-boats'])
  })
})

describe('renameField', () => {
  it('renames, and rewrites the calculations that read the old name, in one step', () => {
    const data = world()
    const d = run(data, renameField('e-boats', 'f-cash', 'Cash Price'))
    const t = d.next.tables['e-boats']
    expect(t.fields[2].name).toBe('Cash Price')
    expect(t.fields[3].formula).toBe('[Cash Price] * 2')
    expect(d.said).toBe('Column renamed · Boats')
    expect(d.event.also).toBe('1 calculated column that read it (Double) now reads “Cash Price”.')
    expect(d.event.changed).toEqual([
      { path: 'e-boats.fields.f-cash.name', from: 'Cash', to: 'Cash Price' },
    ])
    const b = back(d)
    expect(b.next.tables['e-boats']).toBe(data.tables['e-boats'])
  })

  it('says nothing about readers when there are none', () => {
    const d = run(world(), renameField('e-boats', 'f-code', 'Code'))
    expect(d.event.also).toBeUndefined()
  })

  it('the same name is nothing; a blank, a sibling’s name and machinery are refused', () => {
    const data = world()
    expect(refusalOf(renameField('e-boats', 'f-cash', ' Cash')(data, NOW))).toBe('')
    expect(refusalOf(renameField('e-boats', 'f-cash', '  ')(data, NOW))).toBe(
      'A column needs a name.',
    )
    expect(refusalOf(renameField('e-boats', 'f-cash', 'model')(data, NOW))).toBe(
      columnTaken('model'),
    )
    const origin = data.tables['e-fit'].fields[3]
    expect(refusalOf(renameField('e-fit', '__origin', 'Source')(data, NOW))).toBe(
      machinery(origin, 'keeps its name'),
    )
    expect(refusalOf(renameField('e-boats', 'nope', 'X')(data, NOW))).toBe(COLUMN_GONE)
  })
})

describe('retypeField', () => {
  it('carries what converts, clears what cannot, and says the counts before and on the event', () => {
    const data = world()
    const mixed = {
      ...data,
      rows: {
        ...data.rows,
        'e-boats': [
          row('e-boats', 'b1', { 'f-model': 'a', 'f-code': '52000', 'f-cash': 1 }),
          row('e-boats', 'b2', { 'f-model': 'b', 'f-code': '3 + 1', 'f-cash': 2 }),
          row('e-boats', 'b3', { 'f-model': 'c', 'f-cash': 3 }),
        ],
      },
    }
    const radius = retypeRadius(mixed, 'e-boats', 'f-code', 'number')
    expect(radius.refusal).toBeNull()
    expect(radius.plan.carried).toEqual([{ rowId: 'b1', value: 52000 }])
    expect(radius.plan.lost).toBe(1)
    expect(radius.said).toBe('1 of 2 values cross as number; 1 cannot and is cleared.')

    const d = run(mixed, retypeField('e-boats', 'f-code', 'number'))
    expect(d.next.tables['e-boats'].fields[1]).toEqual({
      id: 'f-code',
      name: 'Model Code',
      type: 'number',
      sectionId: 's-id',
    })
    expect(cell(d.next, 'e-boats', 'b1', 'f-code')).toBe(52000)
    expect('f-code' in d.next.rows['e-boats'][1].values).toBe(false)
    /* the row with nothing in the column is the same object */
    expect(d.next.rows['e-boats'][2]).toBe(mixed.rows['e-boats'][2])
    expect(d.said).toBe('Column retyped · Boats')
    expect(d.event.also).toBe(radius.said)
    expect(d.event.changed).toEqual([
      { path: 'e-boats.fields.f-code.type', from: 'text', to: 'number' },
      { path: 'e-boats.fields.f-code.carried', from: null, to: 1 },
      { path: 'e-boats.fields.f-code.cleared', from: null, to: 1 },
    ])

    const b = back(d)
    expect(b.next.tables['e-boats']).toBe(mixed.tables['e-boats'])
    expect(b.next.rows['e-boats']).toBe(mixed.rows['e-boats'])
    expect(b.next.index.rowById['b1']).toBe(mixed.rows['e-boats'][0])
  })

  it('on the pack, the counts on the event are the counts retypePlan makes', () => {
    const data = sheetOfPack()
    const field = data.tables['boat_highfield'].fields.find((f) => f.name === 'Model Code')
    expect(field).toBeDefined()
    const plan = retypePlan(data.rows['boat_highfield'], field as FieldDef, 'number')
    const d = run(data, retypeField('boat_highfield', (field as FieldDef).id, 'number'))
    expect(d.event.changed[1].to).toBe(plan.carried.length)
    expect(d.event.changed[2].to).toBe(plan.lost)
    expect(plan.carried.length + plan.lost).toBe(plan.filled)
    expect(back(d).next.rows['boat_highfield']).toBe(data.rows['boat_highfield'])
  })

  it('drops the old type’s config and takes the new type’s', () => {
    const data = world()
    const d = run(data, retypeField('e-boats', 'f-code', 'select', { options: ['A', 'B'] }))
    expect(d.next.tables['e-boats'].fields[1].options).toEqual(['A', 'B'])
    const link = run(
      d.next,
      retypeField('e-boats', 'f-code', 'reference', { refEntityId: 'e-trailers' }),
    )
    expect(link.next.tables['e-boats'].fields[1]).toEqual({
      id: 'f-code',
      name: 'Model Code',
      type: 'reference',
      sectionId: 's-id',
      refEntityId: 'e-trailers',
    })
  })

  it('a pairing’s identity columns and a ladder rung keep their type; a link needs a table', () => {
    const data = world()
    const fit = data.tables['e-fit']
    expect(refusalOf(retypeField('e-fit', 'f-boat', 'text')(data, NOW))).toBe(
      pairingIdentity(fit, fit.fields[1], 'keeps its type'),
    )
    expect(refusalOf(retypeField('e-fit', '__order', 'text')(data, NOW))).toBe(
      machinery(fit.fields[5], 'keeps its type'),
    )
    const boats = data.tables['e-boats']
    expect(refusalOf(retypeField('e-boats', 'f-cash', 'text')(data, NOW))).toBe(
      ladderRung(boats.fields[2], data.priceLevels['e-boats'][0]),
    )
    expect(refusalOf(retypeField('e-boats', 'f-code', 'reference')(data, NOW))).toBe(
      'A link column needs a table to point at.',
    )
    expect(refusalOf(retypeField('e-boats', 'f-code', 'text')(data, NOW))).toBe('')
    expect(retypeRadius(data, 'e-boats', 'f-cash', 'text').refusal).toBe(
      ladderRung(boats.fields[2], data.priceLevels['e-boats'][0]),
    )
  })

  it('on the pack, a rung of Stacer’s ladder keeps its type, by the sentence', () => {
    const data = sheetOfPack()
    const stacer = data.tables['boat_stacer']
    const cash = stacer.fields.find((f) => f.id === 'boat_stacer.qr') as FieldDef
    expect(refusalOf(retypeField('boat_stacer', 'boat_stacer.qr', 'text')(data, NOW))).toBe(
      'Cash is the Cash rung of this table’s price ladder, so it keeps its type.',
    )
    expect(cash.name).toBe('Cash')
  })
})

describe('retargetField', () => {
  it('re-aims the link and empties every filled cell in one step, and the way back gives both back', () => {
    const data = world()
    const d = run(data, retargetField('e-pkg', 'f-pboat', 'e-trailers'))
    expect(d.next.tables['e-pkg'].fields[1].refEntityId).toBe('e-trailers')
    expect(d.next.rows['e-pkg'][0].values).toEqual({
      'f-pname': '540 on the road',
      'f-pboat': null,
    })
    expect(d.said).toBe('Column re-pointed · Packages')
    expect(d.event.also).toBe('1 link emptied — a row id of Boats means nothing in Trailers.')
    const b = back(d)
    expect(b.next.tables['e-pkg']).toBe(data.tables['e-pkg'])
    expect(b.next.rows['e-pkg']).toBe(data.rows['e-pkg'])
  })

  it('is nothing when the link already points there, and refuses a non-link; a pairing’s link may be re-pointed', () => {
    const data = world()
    expect(refusalOf(retargetField('e-pkg', 'f-pboat', 'e-boats')(data, NOW))).toBe('')
    expect(refusalOf(retargetField('e-pkg', 'f-pname', 'e-boats')(data, NOW))).toBe(
      'Name is not a link column, so there is nothing to re-point.',
    )
    expect(refusalOf(retargetField('e-pkg', 'f-pboat', 'nope')(data, NOW))).toBe(
      'A link column needs a table to point at, and “nope” is not on the sheet.',
    )
    /* the old designer re-pointed a join's link with a counted radius,
       and its ported suite still does: the link stays a link */
    const d = run(data, retargetField('e-fit', 'f-boat', 'e-trailers'))
    expect(d.next.tables['e-fit'].fields[1].refEntityId).toBe('e-trailers')
    expect(d.next.rows['e-fit'].map((r) => r.values['f-boat'])).toEqual([null, null])
  })
})

describe('deleteField', () => {
  it('takes the column, its cells and the rung standing on it, and counts what is left holding on', () => {
    const data = world()
    const radius = deleteFieldRadius(data, 'e-boats', 'f-cash')
    expect(radius.filled).toBe(2)
    expect(radius.rungs).toEqual(data.priceLevels['e-boats'])
    expect(radius.readers.map((f) => f.name)).toEqual(['Double'])
    expect(radius.said).toBe('This also removes 2 values and the Cash rung of the price ladder.')
    expect(radius.holding).toBe('1 calculated column (Double) reads it.')

    const d = run(data, deleteField('e-boats', 'f-cash'))
    expect(d.next.tables['e-boats'].fields.map((f) => f.id)).toEqual([
      'f-model',
      'f-code',
      'f-double',
    ])
    expect(d.next.tables['e-boats'].priceLevels).toBeUndefined()
    expect(d.next.priceLevels['e-boats']).toBeUndefined()
    expect(d.next.rows['e-boats'].every((r) => !('f-cash' in r.values))).toBe(true)
    expect(d.said).toBe('Column deleted · Boats')
    expect(d.event.also).toBe(`${radius.said} ${radius.holding}`)

    const b = back(d)
    expect(b.next.tables['e-boats']).toBe(data.tables['e-boats'])
    expect(b.next.rows['e-boats']).toBe(data.rows['e-boats'])
    expect(b.next.priceLevels['e-boats']).toBe(data.priceLevels['e-boats'])
  })

  it('clears the display column and the hierarchy entry when the column was one', () => {
    const d = run(world(), deleteField('e-boats', 'f-model'))
    expect(d.next.tables['e-boats'].displayFieldId).toBeUndefined()
    expect(d.next.tables['e-boats'].hierarchy).toEqual([])
  })

  it('a pairing keeps its identity columns and its machinery', () => {
    const data = world()
    const fit = data.tables['e-fit']
    expect(refusalOf(deleteField('e-fit', 'f-trailer')(data, NOW))).toBe(
      pairingIdentity(fit, fit.fields[2], 'stays'),
    )
    expect(refusalOf(deleteField('e-fit', '__recommended')(data, NOW))).toBe(
      machinery(fit.fields[4], 'stays'),
    )
    expect(deleteFieldRadius(data, 'e-fit', 'f-trailer').refusal).toBe(
      pairingIdentity(fit, fit.fields[2], 'stays'),
    )
    expect(refusalOf(deleteField('e-fit', 'f-label')(data, NOW))).toBe('')
  })
})

/* ============================================================
   TABLES
   ============================================================ */

describe('createTable', () => {
  it('makes a table with a Name column, no rows, and a way back that drops exactly it', () => {
    const data = world()
    const d = run(data, createTable({ name: 'Motors', kind: 'motor', tableId: 't-new' }))
    const t = d.next.tables['t-new']
    expect(t.name).toBe('Motors')
    expect(t.orgId).toBe(ORG)
    expect(t.kind).toBe('motor')
    expect(t.role).toBe('base')
    expect(t.accent).toBe('carmine')
    expect(t.fields).toHaveLength(1)
    expect(t.fields[0]).toMatchObject({ name: 'Name', type: 'text', required: true })
    expect(t.displayFieldId).toBe(t.fields[0].id)
    expect(d.next.rows['t-new']).toEqual([])
    expect(d.said).toBe('Table added · Motors')
    const b = back(d)
    expect(b.next.tables).toEqual(data.tables)
    expect(b.next.rows).toEqual(data.rows)
    expect(b.said).toBe('Table deleted · Motors')
    expect(done(b.inverse(b.next, NOW)).next.tables['t-new']).toBe(t)
  })

  it('takes the kind’s label as a name, and refuses no name at all, a taken name and a taken id', () => {
    const data = world()
    expect(run(data, createTable({ kind: 'motor', tableId: 'x' })).next.tables['x'].name).toBe(
      'Motors',
    )
    expect(refusalOf(createTable({})(data, NOW))).toBe('A table needs a name.')
    expect(refusalOf(createTable({ name: ' boats ' })(data, NOW))).toBe(tableTaken('boats'))
    expect(refusalOf(createTable({ name: 'X', tableId: 'e-boats' })(data, NOW))).toBe(
      'There is already a table with the id “e-boats” on the sheet.',
    )
  })

  it('refuses a sheet with no organisation to file the table under', () => {
    expect(refusalOf(createTable({ name: 'X' })({ ...world(), orgId: null }, NOW))).toBe(NO_ORG)
  })

  it('takes the columns and the ladder it is handed, and refuses a rung on a cost column', () => {
    const data = world()
    const fields: FieldDef[] = [
      { id: 'c-name', name: 'Name', type: 'text' },
      { id: 'c-sell', name: 'Sell', type: 'number' },
      { id: 'c-cost', name: 'Base Cost', type: 'number' },
    ]
    const d = run(
      data,
      createTable({
        name: 'Parts',
        fields,
        priceLevels: [{ key: 'cash', label: 'Sell', fieldId: 'c-sell', scope: 'quote' }],
        tableId: 't-parts',
      }),
    )
    expect(d.next.priceLevels['t-parts']).toEqual([
      { key: 'cash', label: 'Sell', fieldId: 'c-sell', scope: 'quote' },
    ])
    expect(d.next.tables['t-parts'].priceLevels).toEqual(d.next.priceLevels['t-parts'])
    expect(
      refusalOf(
        createTable({
          name: 'Parts',
          fields,
          priceLevels: [{ key: 'cash', label: 'Base Cost', fieldId: 'c-cost', scope: 'quote' }],
        })(data, NOW),
      ),
    ).toBe(costAsRung(fields[2]))
    expect(
      refusalOf(
        createTable({
          name: 'Parts',
          fields,
          priceLevels: [{ key: 'cash', label: 'Name', fieldId: 'c-name', scope: 'quote' }],
        })(data, NOW),
      ),
    ).toBe(rungNotANumber(fields[0]))
    expect(
      refusalOf(
        createTable({
          name: 'Parts',
          fields,
          priceLevels: [{ key: 'x', label: 'X', fieldId: 'nope', scope: 'quote' }],
        })(data, NOW),
      ),
    ).toBe('The X rung points at a column the table does not have.')
  })

  it('refuses columns that cannot be, and a hierarchy naming a column the table has not got', () => {
    const data = world()
    const two: FieldDef[] = [
      { id: 'a', name: 'A', type: 'text' },
      { id: 'b', name: 'a', type: 'text' },
    ]
    expect(refusalOf(createTable({ name: 'X', fields: two })(data, NOW))).toBe(
      'Two columns cannot share the name “a”.',
    )
    expect(
      refusalOf(
        createTable({
          name: 'X',
          fields: [
            { id: 'a', name: 'A', type: 'text' },
            { id: 'a', name: 'B', type: 'text' },
          ],
        })(data, NOW),
      ),
    ).toBe('Two columns cannot share the id “a”.')
    expect(
      refusalOf(
        createTable({ name: 'X', fields: [{ id: 'a', name: ' ', type: 'text' }] })(data, NOW),
      ),
    ).toBe('Every column needs a name.')
    expect(
      refusalOf(
        createTable({
          name: 'X',
          fields: [{ id: 'a', name: 'L', type: 'reference', refEntityId: 'nope' }],
        })(data, NOW),
      ),
    ).toBe('The link column L points at a table that is not on the sheet.')
    expect(
      refusalOf(
        createTable({
          name: 'X',
          fields: [{ id: 'a', name: 'A', type: 'text' }],
          hierarchy: ['zz'],
        })(data, NOW),
      ),
    ).toBe('The hierarchy names a column the table does not have.')
  })
})

describe('deleteTable, and everything that goes with it', () => {
  it('takes the rows, the link columns aimed at it, the rooted rule, and what the page and module lose', () => {
    const data = world()
    const radius = deleteTableRadius(data, 'e-boats')
    expect(radius.rows).toBe('2 models')
    expect(radius.dependents.links).toEqual([
      { tableName: 'Boats × Trailers — Trailer Fitment', columnName: 'Boat' },
      { tableName: 'Packages', columnName: 'Boat' },
    ])
    expect(radius.dependents.rootedRules).toEqual([
      { ruleId: 'r-fit', ruleName: 'Trailer fitment' },
    ])
    expect(radius.pages.rootedViews.map((p) => p.viewName)).toEqual(['Boats'])
    expect(radius.cascade.deletedViews).toEqual(['Boats'])
    expect(radius.cascade.narrowedModules).toEqual(['Boats'])
    expect(radius.cascade.closedModules).toEqual(['Boats'])
    expect(radius.said).toBe(
      'This also removes 2 models, 2 link columns on other tables, the rule Trailer fitment, the page Boats, a table from Boats and the page Boats opens.',
    )

    const d = run(data, deleteTable('e-boats'))
    expect(d.next.tables['e-boats']).toBeUndefined()
    expect(d.next.rows['e-boats']).toBeUndefined()
    expect(d.next.index.rowById['b1']).toBeUndefined()
    expect(d.next.tables['e-fit'].fields.map((f) => f.id)).toEqual([
      'f-label',
      'f-trailer',
      '__origin',
      '__recommended',
      '__order',
    ])
    expect(d.next.rows['e-fit'][0].values).toEqual({
      'f-label': '540 · SRW5.7M',
      'f-trailer': 't1',
    })
    expect(d.next.tables['e-pkg'].fields.map((f) => f.id)).toEqual(['f-pname'])
    expect(d.next.rules).toEqual({})
    expect(d.next.views).toEqual({})
    expect(d.next.modules['m-boats']).toMatchObject({ tableIds: ['e-trailers'] })
    expect(d.next.modules['m-boats'].viewId).toBeUndefined()
    expect(d.next.priceLevels['e-boats']).toBeUndefined()
    /* a table the delete does not reach is the same object */
    expect(d.next.tables['e-trailers']).toBe(data.tables['e-trailers'])
    expect(d.next.rows['e-trailers']).toBe(data.rows['e-trailers'])
    expect(d.said).toBe('Table deleted · Boats')
    expect(d.event.also).toBe(radius.said)
  })

  it('the way back brings the table, its rows, the cascaded link columns, the rule, the page and the module back, byte-equal', () => {
    const data = world()
    const d = run(data, deleteTable('e-boats'))
    const b = back(d)
    expect(b.next.tables).toEqual(data.tables)
    expect(b.next.rows).toEqual(data.rows)
    expect(b.next.rules).toBe(data.rules)
    expect(b.next.views).toBe(data.views)
    expect(b.next.modules).toBe(data.modules)
    expect(b.next.priceLevels).toEqual(data.priceLevels)
    expect(b.next.index.rowById).toEqual(data.index.rowById)
    expect(b.next.tables['e-fit']).toBe(data.tables['e-fit'])
    expect(b.next.rows['e-fit']).toBe(data.rows['e-fit'])
    expect(b.said).toBe('Table added · Boats')
    /* and the way back from that is the delete again */
    const again = done(b.inverse(b.next, NOW))
    expect(again.next.tables['e-boats']).toBeUndefined()
    expect(again.next.tables['e-fit'].fields).toHaveLength(5)
  })

  it('on the pack, deleting Highfield takes its 588 variants and the Boat link off every Highfield join, and the way back is exact', () => {
    const data = sheetOfPack()
    const deps = entityDependents(
      {
        entities: data.tables as Record<string, EntityDef>,
        rowsByEntity: data.rows as Record<string, RowData[]>,
      },
      {},
      'boat_highfield',
    )
    expect(deps.links.length).toBeGreaterThan(0)
    const radius = deleteTableRadius(data, 'boat_highfield')
    expect(radius.rows).toBe('588 variants')
    expect(radius.said).toMatch(/^This also removes 588 variants, \d+ link columns on other tables/)

    const d = run(data, deleteTable('boat_highfield'))
    expect(d.next.tables['boat_highfield']).toBeUndefined()
    expect(Object.keys(d.next.index.rowById)).toHaveLength(
      Object.keys(data.index.rowById).length - 588,
    )
    for (const join of Object.values(d.next.tables)) {
      expect(join.fields.some((f) => f.refEntityId === 'boat_highfield')).toBe(false)
    }
    const b = back(d)
    expect(b.next.tables).toEqual(data.tables)
    expect(b.next.rows).toEqual(data.rows)
    expect(b.next.modules).toBe(data.modules)
    expect(b.next.priceLevels).toEqual(data.priceLevels)
  })

  it('refuses a table that is not there', () => {
    expect(refusalOf(deleteTable('nope')(world(), NOW))).toBe(TABLE_GONE)
    expect(deleteTableRadius(world(), 'nope').refusal).toBe(TABLE_GONE)
  })
})

/* ============================================================
   THE BATCH
   ============================================================ */

describe('batch — many acts, one step', () => {
  const HF = 'boat_highfield'

  it('collapses 187 cell edits into ONE outcome, labelled as the old burst was, and one way back', () => {
    const data = sheetOfPack()
    const ids = data.rows[HF].slice(0, 187).map((r) => r.id)
    const started = performance.now()
    const d = run(data, batch(ids.map((id) => updateCell(HF, id, 'boat_highfield.c', 'XL'))))
    const took = performance.now() - started
    expect(d.said).toBe('187 cell edits · Highfield Inflatables')
    expect(d.event.kind).toBe('batch')
    expect(d.event.events).toHaveLength(187)
    expect(d.event.tableName).toBe('Highfield Inflatables')
    expect(d.next.rows[HF].filter((r) => r.values['boat_highfield.c'] === 'XL')).toHaveLength(187)
    const b = back(d)
    expect(b.next.rows[HF]).toEqual(data.rows[HF])
    expect(b.next.rows[HF][0]).toBe(data.rows[HF][0])
    /* measured, not promised: reported in the notes */
    expect(took).toBeLessThan(5_000)
  })

  it('is refused whole, with the sentence, when one act inside it is', () => {
    const data = world()
    const o = batch([
      updateCell('e-boats', 'b1', 'f-cash', 1),
      updateCell('e-boats', 'nope', 'f-cash', 1),
      updateCell('e-boats', 'b2', 'f-cash', 1),
    ])(data, NOW)
    expect(refusalOf(o)).toBe(ROW_GONE)
  })

  it('skips an act that did nothing, and is nothing when every act was', () => {
    const data = world()
    const o = batch([
      updateCell('e-boats', 'b1', 'f-cash', 52000),
      updateCell('e-boats', 'b2', 'f-cash', 61000),
    ])(data, NOW)
    expect(refusalOf(o)).toBe('')
    const d = run(
      data,
      batch([
        updateCell('e-boats', 'b1', 'f-cash', 52000),
        updateCell('e-boats', 'b2', 'f-cash', 1),
      ]),
    )
    expect(d.said).toBe('Cell edit · Boats')
    expect(d.event.events).toHaveLength(1)
  })

  it('labels a mixed burst the way the old history did, and takes a sentence of its own', () => {
    const data = world()
    const mixed = run(
      data,
      batch([updateCell('e-boats', 'b1', 'f-cash', 1), deleteRow('e-trailers', 't1')]),
    )
    expect(mixed.said).toBe('2 changes')
    expect(mixed.event.tableName).toBeUndefined()
    const same = run(
      data,
      batch([updateCell('e-boats', 'b1', 'f-cash', 1), addRow('e-boats', {}, 'n1')], {
        said: 'Two things on Boats',
      }),
    )
    expect(same.said).toBe('Two things on Boats')
    expect(same.event.tableName).toBe('Boats')
    expect(back(same).said).toBe('Two things on Boats')
  })

  it('the way back unwinds in reverse, so a row deleted and re-added inside one batch comes out right', () => {
    const data = world()
    const d = run(
      data,
      batch([deleteRow('e-trailers', 't1'), addRow('e-trailers', { 'f-tname': 'again' }, 't1')]),
    )
    expect(d.next.rows['e-trailers'][0].values['f-tname']).toBe('again')
    const b = back(d)
    expect(b.next.rows['e-trailers']).toEqual(data.rows['e-trailers'])
    expect(b.next.rows['e-fit']).toEqual(data.rows['e-fit'])
  })
})
