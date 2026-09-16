import 'fake-indexeddb/auto'
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb'
import { describe, expect, it, vi } from 'vitest'
import type { EntityDef, RowData } from '@/domain/model'
import { openDatabase } from './database'
import { dexieCatalogue } from './repositories'

/* ============================================================
   WHAT ONLY THE DEXIE ADAPTER PROMISES: the identity ledger. The
   contract suite proves the seam; this proves the cost — a cell edit
   writes one row, a quiet save opens nothing, and an unknown disk is
   reconciled against itself rather than written on top of.
   ============================================================ */

const NOW = '2026-09-16T00:00:00.000Z'

const fresh = () => openDatabase('hl2-ledger', { indexedDB: new IDBFactory(), IDBKeyRange })

const table = (id: string): EntityDef => ({
  id,
  orgId: 'o1',
  name: `Table ${id}`,
  accent: 'blue',
  fields: [{ id: `${id}.c`, name: 'C', type: 'text' }],
  position: { x: 0, y: 0 },
  createdAt: NOW,
  updatedAt: NOW,
})

const row = (n: number, c = ''): RowData => ({
  id: `t-a:${n}`,
  orgId: 'o1',
  entityId: 't-a',
  values: { 't-a.c': c },
  createdAt: NOW,
  updatedAt: NOW,
})

const rows = (count: number): RowData[] => Array.from({ length: count }, (_, i) => row(i + 1))

describe('the identity ledger inside the Dexie adapter', () => {
  it('a cell edit writes ONE row, never the table', async () => {
    const db = fresh()
    const repo = dexieCatalogue('o1', { db })
    await repo.rows.putMany(rows(200))
    /* the objects handed up are the objects on disk */
    const read = await repo.rows.all()
    const edited = read.map((r) => (r.id === 't-a:57' ? { ...r, values: { 't-a.c': 'typed' } } : r))

    const put = vi.spyOn(db.rows, 'bulkPut')
    const del = vi.spyOn(db.rows, 'bulkDelete')
    await repo.rows.saveAll(edited)

    expect(put).toHaveBeenCalledTimes(1)
    expect(put.mock.calls[0][0]).toHaveLength(1)
    expect((put.mock.calls[0][0] as RowData[])[0].id).toBe('t-a:57')
    expect(del).not.toHaveBeenCalled()
    expect((await repo.rows.get('t-a:57'))?.values['t-a.c']).toBe('typed')
  })

  it('nothing moved: saving the same objects again opens no write', async () => {
    const db = fresh()
    const repo = dexieCatalogue('o1', { db })
    await repo.rows.putMany(rows(20))
    const read = await repo.rows.all()

    const put = vi.spyOn(db.rows, 'bulkPut')
    const del = vi.spyOn(db.rows, 'bulkDelete')
    await repo.rows.saveAll(read)
    expect(put).not.toHaveBeenCalled()
    expect(del).not.toHaveBeenCalled()
  })

  it('a record that left the snapshot is deleted, and only that one', async () => {
    const db = fresh()
    const repo = dexieCatalogue('o1', { db })
    await repo.rows.putMany(rows(10))
    const read = await repo.rows.all()

    const del = vi.spyOn(db.rows, 'bulkDelete')
    await repo.rows.saveAll(read.filter((r) => r.id !== 't-a:3'))
    expect(del).toHaveBeenCalledTimes(1)
    expect(del.mock.calls[0][0]).toEqual(['t-a:3'])
    expect((await repo.rows.all()).map((r) => r.id)).not.toContain('t-a:3')
  })

  it('an unknown disk is reconciled against itself — this organisation only', async () => {
    const db = fresh()
    /* something is already down there, from an earlier session */
    const earlier = dexieCatalogue('o1', { db })
    await earlier.tables.putMany([table('t-a'), table('t-b')])
    const other = dexieCatalogue('o2', { db })
    await other.tables.put({ ...table('t-z'), orgId: 'o2' })

    /* a new repository that has read nothing saves a snapshot without
       't-b': the wholesale write must delete it rather than leave it
       under the snapshot (the 156-tables defect) */
    const unread = dexieCatalogue('o1', { db })
    await unread.tables.saveAll([table('t-a'), table('t-c')])
    expect((await unread.tables.all()).map((t) => t.id).sort()).toEqual(['t-a', 't-c'])
    expect((await other.tables.all()).map((t) => t.id)).toEqual(['t-z'])
  })

  it('loading the pack twice leaves one copy of every table and row', async () => {
    const db = fresh()
    const repo = dexieCatalogue('o1', { db })
    const rowsByEntity = { 't-a': rows(5) }
    await repo.loadPack([table('t-a')], rowsByEntity)
    await repo.loadPack([table('t-a')], rowsByEntity)
    expect(await repo.tables.all()).toHaveLength(1)
    expect(await repo.rows.all()).toHaveLength(5)
  })

  it('after a wipe the ledger knows the disk is empty, so the next save writes only what it is given', async () => {
    const db = fresh()
    const repo = dexieCatalogue('o1', { db })
    await repo.rows.putMany(rows(10))
    await repo.wipe()

    const del = vi.spyOn(db.rows, 'bulkDelete')
    const put = vi.spyOn(db.rows, 'bulkPut')
    await repo.rows.saveAll(rows(3))
    expect(del).not.toHaveBeenCalled()
    expect(put).toHaveBeenCalledTimes(1)
    expect(put.mock.calls[0][0]).toHaveLength(3)
  })

  it('the ledger is never ahead of the disk: a failed write leaves the next one writing everything', async () => {
    const db = fresh()
    const repo = dexieCatalogue('o1', { db })
    await repo.rows.putMany(rows(4))
    const read = await repo.rows.all()

    const failing = vi.spyOn(db.rows, 'bulkPut').mockRejectedValueOnce(new Error('disk said no'))
    const edited = read.map((r) => (r.id === 't-a:2' ? { ...r, values: { 't-a.c': 'x' } } : r))
    await expect(repo.rows.saveAll(edited)).rejects.toThrow('disk said no')
    failing.mockRestore()

    /* the edit did not land, and the ledger did not pretend it did */
    expect((await repo.rows.get('t-a:2'))?.values['t-a.c']).toBe('')
    const put = vi.spyOn(db.rows, 'bulkPut')
    await repo.rows.saveAll(edited)
    expect(put).toHaveBeenCalledTimes(1)
    expect(put.mock.calls[0][0]).toHaveLength(1)
    expect((await repo.rows.get('t-a:2'))?.values['t-a.c']).toBe('x')
  })
})
