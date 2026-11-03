/* ============================================================
   WHAT THE STORE KEEPS WHEN THE PAGE GOES, AND WHO IT SAYS WROTE IT.

   The sheet's verifier, 2026-11-03: Cash written 850, the warning up,
   Undo pressed about 350 ms later and the page reloaded at once. The
   screen had said "Undone" and the reload read $850 — the step's own
   write was landing and the Undo's was queued behind it, in a page that
   ran no later task. And a changed cell said who changed it only while
   the session's audit held the step.

   Proved here: the last write as the page goes hands the repository
   exactly what the queue has not filed, measured against what the
   queued write will leave; the Dexie adapter files it in one native
   transaction that lands after the one in flight; and who last wrote a
   cell is read back by a store that opens the sheet again.
   ============================================================ */
import 'fake-indexeddb/auto'
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb'
import { describe, expect, it, vi } from 'vitest'
import type { EntityDef, RowData } from '@/domain/model'
import { updateCell } from '@/domain/catalogue/commands'
import { stampOf } from '@/domain/catalogue/table/stamps'
import type { ExitWrite } from '@/data/repository'
import { memoryCatalogue, memoryStamps } from '@/data/memory/repositories'
import { createMemoryDatabase } from '@/data/memory/database'
import { openDatabase } from '@/data/dexie/database'
import { dexieCatalogue, dexieStamps } from '@/data/dexie/repositories'
import { createCatalogueStore } from './catalogue'

const ISO = '2026-01-01T00:00:00.000Z'
const NOW = '2026-11-03T10:00:00.000Z'

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

const row = (id: string, cash: number): RowData => ({
  id,
  orgId: 'o1',
  entityId: 'e-boats',
  values: { 'f-model': id, 'f-cash': cash },
  createdAt: ISO,
  updatedAt: ISO,
})

describe('the last write as the page goes', () => {
  it('hands over the Undo the queued write would leave behind, and nothing else', async () => {
    const db = createMemoryDatabase()
    const repo = memoryCatalogue('o1', { db })
    await repo.loadPack([boats()], { 'e-boats': [row('b1', 2770), row('b2', 4680)] })
    const kept: ExitWrite[][] = []
    const leaving = Object.assign(repo, { keepNow: (w: readonly ExitWrite[]) => kept.push([...w]) })
    const store = createCatalogueStore({
      now: () => NOW,
      by: () => 'Asaf',
      writeBehindMs: 60_000,
      stampsFor: () => memoryStamps('o1', { db }),
    })
    await store.getState().load(leaving)
    const before = store.getState().rows['e-boats']![0]!

    store.getState().apply(updateCell('e-boats', 'b1', 'f-cash', 850))
    /* the step's write starts and is not yet down */
    const landing = store.getState().flush()
    store.getState().undo()
    /* the row is the very object the disk held before the step: measured against the disk as it
       stood, nothing would have moved */
    expect(store.getState().rows['e-boats']![0]).toBe(before)

    const leave = store.getState().leave()
    expect(kept).toHaveLength(1)
    const rows = kept[0]!.find((w) => w.store === 'rows')!
    expect(rows.put).toEqual([before])
    expect(rows.remove).toEqual([])
    /* and who put it back: the Undo is the last act that wrote the cell */
    const stamps = kept[0]!.find((w) => w.store === 'stamps')!
    expect(stamps.put).toEqual([
      expect.objectContaining({ rowId: 'b1', fieldId: 'f-cash', by: 'Asaf' }),
    ])
    for (const w of kept[0]!) {
      if (w.store === 'rows' || w.store === 'stamps') continue
      expect([w.store, w.put, w.remove]).toEqual([w.store, [], []])
    }
    await landing
    await leave
    expect((await repo.rows.get('b1'))?.values['f-cash']).toBe(2770)
  })

  it('files it in one native transaction that lands after the write already landing', async () => {
    const db = openDatabase('hl2-leaving', { indexedDB: new IDBFactory(), IDBKeyRange })
    const repo = dexieCatalogue('o1', { db, now: () => NOW })
    const b1 = row('b1', 2770)
    await repo.loadPack([boats()], { 'e-boats': [b1, row('b2', 4680)] })
    const store = createCatalogueStore({
      now: () => NOW,
      by: () => 'Asaf',
      writeBehindMs: 60_000,
      stampsFor: () => dexieStamps('o1', { db }),
    })
    await store.getState().load(repo)

    store.getState().apply(updateCell('e-boats', 'b1', 'f-cash', 850))
    const landing = store.getState().flush()
    /* the step's transaction is open before the Undo is pressed, as it is in the browser */
    await new Promise((r) => setTimeout(r, 0))
    store.getState().undo()
    /* the page goes now: no later task opens the queued Undo's own transaction */
    const native = vi.spyOn(db.backendDB(), 'transaction')
    void store.getState().leave()
    expect(native).toHaveBeenCalledTimes(1)
    expect(native.mock.calls[0]![0]).toEqual(expect.arrayContaining(['rows', 'stamps']))
    await landing
    await new Promise((r) => setTimeout(r, 20))
    expect((await db.rows.get('b1'))?.values['f-cash']).toBe(2770)
  })
})

describe('who last wrote a cell, kept across a reload', () => {
  it('reads the name and the time back on a store that opens the sheet again', async () => {
    const db = createMemoryDatabase()
    const repo = memoryCatalogue('o1', { db })
    await repo.loadPack([boats()], { 'e-boats': [row('b1', 2770)] })
    const first = createCatalogueStore({
      now: () => NOW,
      by: () => 'Asaf',
      writeBehindMs: 0,
      stampsFor: () => memoryStamps('o1', { db }),
    })
    await first.getState().load(repo)
    first.getState().apply(updateCell('e-boats', 'b1', 'f-cash', 2850))
    await first.getState().flush()
    expect(stampOf(first.getState().stamps, 'b1', 'f-cash')).toEqual({ at: NOW, by: 'Asaf' })

    const again = createCatalogueStore({
      now: () => NOW,
      writeBehindMs: 0,
      stampsFor: () => memoryStamps('o1', { db }),
    })
    await again.getState().load(repo)
    expect(again.getState().events).toEqual([])
    expect(stampOf(again.getState().stamps, 'b1', 'f-cash')).toEqual({ at: NOW, by: 'Asaf' })
  })
})
