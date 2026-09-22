/* ============================================================
   THE CATALOGUE STORE, CHANGED THROUGH COMMANDS.

   `domain/catalogue/commands.test.ts` proves what each act does to
   the sheet. This proves what the STORE promises around them, each
   a promise to somebody who is not in that file:

     · a refusal comes back as the command's own sentence, and the
       sheet does not move;
     · every act is on the stack with its label, pinned to its event,
       fifty deep, and a pinned UNDO pressed after the sheet moved on
       is refused rather than undoing the wrong thing;
     · a cell edit reaches the repository as ONE row and never the
       table — measured with the Dexie ledger's own arithmetic over
       what the store hands the repository, and again against the
       adapter itself on a fake IndexedDB;
     · the write is held behind rather than made per keystroke, and
       `flush` forces it out;
     · a load is not a step, and a sheet that has not loaded refuses.
   ============================================================ */
import 'fake-indexeddb/auto'
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { EntityDef, RowData } from '@/domain/model'
import {
  ROW_GONE,
  addRow,
  batch,
  createTable,
  deleteRow,
  deleteTable,
  isDone,
  updateCell,
  type Outcome,
} from '@/domain/catalogue/commands'
import { memoryCatalogue } from '@/data/memory/repositories'
import { diffStore } from '@/data/dexie/ledger'
import { openDatabase } from '@/data/dexie/database'
import { dexieCatalogue } from '@/data/dexie/repositories'
import {
  NOTHING_TO_REDO,
  NOTHING_TO_UNDO,
  NOT_READY,
  STEP_MOVED_ON,
  UNDO_DEPTH,
  createCatalogueStore,
  type Applied,
  type CatalogueStore,
} from './catalogue'

const ISO = '2026-01-01T00:00:00.000Z'
const NOW = '2026-09-22T10:00:00.000Z'

const boats = (): EntityDef => ({
  id: 'e-boats',
  orgId: 'o1',
  name: 'Boats',
  accent: 'blue',
  fields: [
    { id: 'f-model', name: 'Model', type: 'text' },
    { id: 'f-cash', name: 'Cash', type: 'number' },
  ],
  displayFieldId: 'f-model',
  position: { x: 0, y: 0 },
  createdAt: ISO,
  updatedAt: ISO,
})

const row = (id: string, model: string, cash: number): RowData => ({
  id,
  orgId: 'o1',
  entityId: 'e-boats',
  values: { 'f-model': model, 'f-cash': cash },
  createdAt: ISO,
  updatedAt: ISO,
})

const seed = (): RowData[] => [row('b1', 'One', 1), row('b2', 'Two', 2), row('b3', 'Three', 3)]

const refusalOf = (o: Outcome): string => (isDone(o) ? '' : o.refused)
const saidOf = (o: Outcome): string => (isDone(o) ? o.said : `refused: ${o.refused}`)

let store: CatalogueStore
let heard: Applied[]
let stop: () => void

const cash = (id: string) =>
  store.getState().rows['e-boats'].find((r) => r.id === id)?.values['f-cash']

beforeEach(async () => {
  store = createCatalogueStore({ now: () => NOW, writeBehindMs: 0 })
  heard = []
  stop = store.getState().onApplied((a) => heard.push(a))
  await store
    .getState()
    .load(
      { entities: [boats()], rowsByEntity: { 'e-boats': seed() } },
      { writeTo: memoryCatalogue('o1') },
    )
})

afterEach(() => stop())

/* ---------------------------------------------------------- */

describe('apply', () => {
  it('runs the command, keeps the event, says the label, and offers the way back', () => {
    const o = store.getState().apply(updateCell('e-boats', 'b1', 'f-cash', 10))
    expect(saidOf(o)).toBe('Cell edit · Boats')
    expect(cash('b1')).toBe(10)
    expect(store.getState().events.map((e) => e.kind)).toEqual(['cell-set'])
    expect(heard).toHaveLength(1)
    expect(heard[0].said).toBe('Cell edit · Boats')
    expect(heard[0].undoable).toBe(true)
    expect(store.getState().undoable()?.said).toBe('Cell edit · Boats')
    expect(store.getState().undoable()?.eventId).toBe(heard[0].event.id)
  })

  it('returns the command’s own refusal, and the sheet does not move', () => {
    const before = store.getState().rows
    const o = store.getState().apply(updateCell('e-boats', 'nope', 'f-cash', 10))
    expect(refusalOf(o)).toBe(ROW_GONE)
    expect(store.getState().rows).toBe(before)
    expect(store.getState().undoStack()).toHaveLength(0)
    expect(heard).toHaveLength(0)
    expect(store.getState().events).toHaveLength(0)
  })

  it('an act that changed nothing is not a step and is not announced', () => {
    const o = store.getState().apply(updateCell('e-boats', 'b1', 'f-cash', 1))
    expect(refusalOf(o)).toBe('')
    expect(store.getState().undoStack()).toHaveLength(0)
    expect(heard).toHaveLength(0)
  })

  it('refuses, with the sentence, before a sheet has loaded', () => {
    const fresh = createCatalogueStore({ now: () => NOW })
    expect(refusalOf(fresh.getState().apply(updateCell('e-boats', 'b1', 'f-cash', 1)))).toBe(
      NOT_READY,
    )
    expect(refusalOf(fresh.getState().undo())).toBe(NOTHING_TO_UNDO)
  })

  it('stamps who did it when the session has a name', () => {
    const named = createCatalogueStore({ now: () => NOW, by: () => 'Asaf', writeBehindMs: 0 })
    return named
      .getState()
      .load(
        { entities: [boats()], rowsByEntity: { 'e-boats': seed() } },
        { writeTo: memoryCatalogue('o1') },
      )
      .then(() => {
        const o = named.getState().apply(updateCell('e-boats', 'b1', 'f-cash', 10))
        expect(isDone(o) && o.event.by).toBe('Asaf')
      })
  })
})

describe('the stack is one, bounded, and pinned', () => {
  it('goes back one step per press, says so, and refuses when there are none left', () => {
    store.getState().apply(updateCell('e-boats', 'b1', 'f-cash', 10))
    store.getState().apply(updateCell('e-boats', 'b2', 'f-cash', 20))
    expect(saidOf(store.getState().undo())).toBe('Undone — Cell edit · Boats')
    expect(cash('b2')).toBe(2)
    expect(cash('b1')).toBe(10)
    expect(saidOf(store.getState().undo())).toBe('Undone — Cell edit · Boats')
    expect(cash('b1')).toBe(1)
    expect(refusalOf(store.getState().undo())).toBe(NOTHING_TO_UNDO)
    /* the audit says which step each way back reverses */
    const events = store.getState().events
    expect(events.map((e) => e.kind)).toEqual(['cell-set', 'cell-set', 'undone', 'undone'])
    expect(events[2].undoes).toBe(events[1].id)
    expect(events[3].undoes).toBe(events[0].id)
  })

  it('puts an undone step back, and clears the redo on any new change', () => {
    store.getState().apply(updateCell('e-boats', 'b1', 'f-cash', 10))
    store.getState().undo()
    expect(saidOf(store.getState().redo())).toBe('Redone — Cell edit · Boats')
    expect(cash('b1')).toBe(10)
    expect(refusalOf(store.getState().redo())).toBe(NOTHING_TO_REDO)
    store.getState().undo()
    store.getState().apply(updateCell('e-boats', 'b3', 'f-cash', 30))
    expect(refusalOf(store.getState().redo())).toBe(NOTHING_TO_REDO)
    expect(store.getState().redoStack()).toHaveLength(0)
  })

  it('the pinned UNDO refuses after the sheet has moved on, and the later step stands', () => {
    store.getState().apply(updateCell('e-boats', 'b1', 'f-cash', 10))
    const first = heard[0]
    store.getState().apply(updateCell('e-boats', 'b2', 'f-cash', 20))
    expect(refusalOf(store.getState().undo(first.event.id))).toBe(STEP_MOVED_ON)
    expect(STEP_MOVED_ON).toContain('Something else has happened since')
    expect(cash('b1')).toBe(10)
    expect(cash('b2')).toBe(20)
    /* the current top still answers to its own id */
    expect(isDone(store.getState().undo(heard[1].event.id))).toBe(true)
  })

  it('keeps no more than UNDO_DEPTH steps', () => {
    for (let i = 1; i <= UNDO_DEPTH + 5; i += 1) {
      store.getState().apply(updateCell('e-boats', 'b1', 'f-cash', 100 + i))
    }
    expect(store.getState().undoStack()).toHaveLength(UNDO_DEPTH)
    let steps = 0
    while (isDone(store.getState().undo())) steps += 1
    expect(steps).toBe(UNDO_DEPTH)
    /* the five oldest fell off, so the value they set is where it stops */
    expect(cash('b1')).toBe(105)
  })

  it('an add and a delete go back and forward again in order, the row itself each time', () => {
    store.getState().apply(addRow('e-boats', { 'f-model': 'Four' }, 'b4'))
    const made = store.getState().rows['e-boats'][3]
    store.getState().apply(deleteRow('e-boats', 'b4'))
    expect(store.getState().rows['e-boats']).toHaveLength(3)

    expect(saidOf(store.getState().undo())).toBe('Undone — Row deleted · Boats')
    expect(store.getState().rows['e-boats'][3]).toBe(made)
    expect(saidOf(store.getState().undo())).toBe('Undone — Row added · Boats')
    expect(store.getState().rows['e-boats']).toHaveLength(3)
    expect(store.getState().undoStack()).toHaveLength(0)

    expect(saidOf(store.getState().redo())).toBe('Redone — Row added · Boats')
    expect(store.getState().rows['e-boats'][3]).toBe(made)
    expect(saidOf(store.getState().redo())).toBe('Redone — Row deleted · Boats')
    expect(store.getState().rows['e-boats']).toHaveLength(3)
    expect(store.getState().undoStack()).toHaveLength(2)
  })

  it('a batch is ONE step, and one press takes the whole of it back', () => {
    store
      .getState()
      .apply(
        batch([
          updateCell('e-boats', 'b1', 'f-cash', 10),
          updateCell('e-boats', 'b2', 'f-cash', 20),
          updateCell('e-boats', 'b3', 'f-cash', 30),
        ]),
      )
    expect(store.getState().undoStack()).toHaveLength(1)
    expect(store.getState().undoable()?.said).toBe('3 cell edits · Boats')
    expect(saidOf(store.getState().undo())).toBe('Undone — 3 cell edits · Boats')
    expect([cash('b1'), cash('b2'), cash('b3')]).toEqual([1, 2, 3])
  })

  it('a load is not a step: the stacks are cleared', async () => {
    store.getState().apply(updateCell('e-boats', 'b1', 'f-cash', 10))
    await store
      .getState()
      .load(
        { entities: [boats()], rowsByEntity: { 'e-boats': seed() } },
        { writeTo: memoryCatalogue('o1') },
      )
    expect(store.getState().undoStack()).toHaveLength(0)
    expect(store.getState().events).toHaveLength(0)
    expect(refusalOf(store.getState().undo())).toBe(NOTHING_TO_UNDO)
  })
})

/* ============================================================
   WRITE-THROUGH — one row, never the table
   ============================================================ */

describe('every change reaches the repository, as the difference', () => {
  it('a cell edit hands the repository the rows and not the tables, and the ledger would write ONE row', async () => {
    const repo = memoryCatalogue('o1')
    await repo.loadPack([boats()], { 'e-boats': seed() })
    const filed = createCatalogueStore({ now: () => NOW, writeBehindMs: 0 })
    await filed.getState().load(repo)
    /* what the repository handed the store is what it holds — the
       ledger the Dexie adapter would keep after this load */
    const known = new Map(filed.getState().rows['e-boats'].map((r) => [r.id, r]))
    const rowsHanded = vi.spyOn(repo.rows, 'saveAll')
    const tablesHanded = vi.spyOn(repo.tables, 'saveAll')

    filed.getState().apply(updateCell('e-boats', 'b2', 'f-cash', 20))
    await filed.getState().flush()

    expect(tablesHanded).not.toHaveBeenCalled()
    expect(rowsHanded).toHaveBeenCalledTimes(1)
    const handed = rowsHanded.mock.calls[0][0]
    expect(handed).toHaveLength(3)
    /* THE MEASUREMENT: the Dexie ledger's own diff over what was handed */
    const diff = diffStore(handed, known)
    expect(diff.put.map((r) => r.id)).toEqual(['b2'])
    expect(diff.remove).toEqual([])
    /* and it is on disk */
    expect((await repo.rows.get('b2'))?.values['f-cash']).toBe(20)
  })

  it('against the Dexie adapter on a fake IndexedDB, one cell edit is one bulkPut of one row', async () => {
    const db = openDatabase('hl2-catalogue-store', { indexedDB: new IDBFactory(), IDBKeyRange })
    const repo = dexieCatalogue('o1', { db, now: () => NOW })
    await repo.loadPack([boats()], { 'e-boats': seed() })
    const filed = createCatalogueStore({ now: () => NOW, writeBehindMs: 0 })
    await filed.getState().load(repo)
    const put = vi.spyOn(db.rows, 'bulkPut')
    const del = vi.spyOn(db.rows, 'bulkDelete')
    const putTables = vi.spyOn(db.tableDefs, 'bulkPut')

    filed.getState().apply(updateCell('e-boats', 'b3', 'f-cash', 30))
    await filed.getState().flush()

    expect(put).toHaveBeenCalledTimes(1)
    expect(put.mock.calls[0][0].map((r: RowData) => r.id)).toEqual(['b3'])
    expect(del).not.toHaveBeenCalled()
    expect(putTables).not.toHaveBeenCalled()
    expect((await db.rows.get('b3'))?.values['f-cash']).toBe(30)

    /* an undo of that edit writes the one row back, and nothing else */
    put.mockClear()
    filed.getState().undo()
    await filed.getState().flush()
    expect(put).toHaveBeenCalledTimes(1)
    expect(put.mock.calls[0][0].map((r: RowData) => r.id)).toEqual(['b3'])
    expect((await db.rows.get('b3'))?.values['f-cash']).toBe(3)
  })

  it('a table delete takes its rows off the disk, and a new table lands with its ladder', async () => {
    const repo = memoryCatalogue('o1')
    await repo.loadPack([boats()], { 'e-boats': seed() })
    const filed = createCatalogueStore({ now: () => NOW, writeBehindMs: 0 })
    await filed.getState().load(repo)

    filed.getState().apply(
      createTable({
        name: 'Parts',
        tableId: 't-parts',
        fields: [
          { id: 'p-name', name: 'Name', type: 'text' },
          { id: 'p-sell', name: 'Sell', type: 'number' },
        ],
        priceLevels: [{ key: 'cash', label: 'Sell', fieldId: 'p-sell', scope: 'quote' }],
      }),
    )
    filed.getState().apply(deleteTable('e-boats'))
    await filed.getState().flush()

    expect((await repo.tables.all()).map((t) => t.id)).toEqual(['t-parts'])
    expect(await repo.rows.all()).toEqual([])
    expect((await repo.priceLevels.get('t-parts'))?.levels).toEqual([
      { key: 'cash', label: 'Sell', fieldId: 'p-sell', scope: 'quote' },
    ])

    /* and back: the way back reaches the disk too */
    filed.getState().undo()
    filed.getState().undo()
    await filed.getState().flush()
    expect((await repo.tables.all()).map((t) => t.id)).toEqual(['e-boats'])
    expect((await repo.rows.all()).map((r) => r.id).toSorted()).toEqual(['b1', 'b2', 'b3'])
    expect(await repo.priceLevels.get('t-parts')).toBeUndefined()
  })

  it('holds the write behind rather than writing once per keystroke', async () => {
    const repo = memoryCatalogue('o1')
    await repo.loadPack([boats()], { 'e-boats': seed() })
    const filed = createCatalogueStore({ now: () => NOW, writeBehindMs: 50 })
    await filed.getState().load(repo)
    const handed = vi.spyOn(repo.rows, 'saveAll')

    filed.getState().apply(updateCell('e-boats', 'b1', 'f-cash', 10))
    filed.getState().apply(updateCell('e-boats', 'b1', 'f-cash', 11))
    filed.getState().apply(updateCell('e-boats', 'b1', 'f-cash', 12))
    expect(handed).not.toHaveBeenCalled()
    expect((await repo.rows.get('b1'))?.values['f-cash']).toBe(1)

    await filed.getState().flush()
    expect(handed).toHaveBeenCalledTimes(1)
    expect((await repo.rows.get('b1'))?.values['f-cash']).toBe(12)
  })

  it('a sheet loaded from the pack writes through to the organisation’s own repository', async () => {
    const repo = memoryCatalogue('o1')
    const filed = createCatalogueStore({ now: () => NOW, writeBehindMs: 0 })
    await filed
      .getState()
      .load({ entities: [boats()], rowsByEntity: { 'e-boats': seed() } }, { writeTo: repo })
    expect(filed.getState().orgId).toBe('o1')
    filed.getState().apply(updateCell('e-boats', 'b1', 'f-cash', 10))
    await filed.getState().flush()
    expect((await repo.rows.get('b1'))?.values['f-cash']).toBe(10)
  })

  it('a write the browser refuses is a sentence, and the sheet on screen is untouched', async () => {
    const repo = memoryCatalogue('o1')
    await repo.loadPack([boats()], { 'e-boats': seed() })
    const filed = createCatalogueStore({ now: () => NOW, writeBehindMs: 0 })
    await filed.getState().load(repo)
    repo.rows.saveAll = () => Promise.reject(new Error('the disk is full'))
    filed.getState().apply(updateCell('e-boats', 'b1', 'f-cash', 10))
    await filed.getState().flush()
    expect(filed.getState().problem).toBe(
      'This browser would not keep the change to the sheet: the disk is full. What is on screen is right; it is not on disk yet.',
    )
    expect(filed.getState().rows['e-boats'][0].values['f-cash']).toBe(10)
  })
})
