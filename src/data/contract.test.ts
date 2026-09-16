import 'fake-indexeddb/auto'
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb'
import { describe, expect, it } from 'vitest'
import type { EntityDef, PackManifest, QuoteDef, RowData } from '@/domain/model'
import { openDatabase } from './dexie/database'
import { dexieCatalogue, dexieQuotes } from './dexie/repositories'
import { createMemoryDatabase } from './memory/database'
import { memoryCatalogue, memoryQuotes } from './memory/repositories'
import { refusals, type CatalogueRepository, type QuoteRepository } from './repository'

/* ============================================================
   THE CONTRACT SUITE — one set of promises, run against every
   adapter. An adapter that passes here is interchangeable with the
   others above the seam; an adapter that drifts fails the same test
   the others pass. The Supabase adapter of Milestone 6 is added as a
   third row of `adapters` and nothing else.

   THE RECORDS ARE STRUCTURAL. Ids like 't-a', names like 'Table A':
   no boat, no price, no customer. The pack's own shape is proved by
   `pack.test.ts`; this file proves the filing cabinet.
   ============================================================ */

const NOW = '2026-09-16T00:00:00.000Z'
const now = () => NOW

interface World {
  /** a catalogue and a quotes repository for one organisation, over
   *  the same disk as every other pair this world opens */
  open(orgId: string): { catalogue: CatalogueRepository; quotes: QuoteRepository }
}

const adapters: Array<[string, () => World]> = [
  [
    'memory',
    () => {
      const db = createMemoryDatabase()
      return {
        open: (orgId) => ({
          catalogue: memoryCatalogue(orgId, { db, now }),
          quotes: memoryQuotes(orgId, { db }),
        }),
      }
    },
  ],
  [
    'dexie',
    () => {
      /* a factory of its own per world: no name collisions, no cleanup */
      const db = openDatabase('hl2-contract', { indexedDB: new IDBFactory(), IDBKeyRange })
      return {
        open: (orgId) => ({
          catalogue: dexieCatalogue(orgId, { db, now }),
          quotes: dexieQuotes(orgId, { db }),
        }),
      }
    },
  ],
]

/* -- structural fixtures ------------------------------------ */

const table = (id: string, orgId: string, extra: Partial<EntityDef> = {}): EntityDef => ({
  id,
  orgId,
  name: `Table ${id}`,
  accent: 'blue',
  fields: [{ id: `${id}.c`, name: 'C', type: 'text' }],
  position: { x: 0, y: 0 },
  createdAt: NOW,
  updatedAt: NOW,
  ...extra,
})

const row = (id: string, orgId: string, entityId: string, c = ''): RowData => ({
  id,
  orgId,
  entityId,
  values: { [`${entityId}.c`]: c },
  createdAt: NOW,
  updatedAt: NOW,
})

const quote = (id: string, orgId: string, createdAt = NOW): QuoteDef => ({
  id,
  orgId,
  reference: id,
  state: 'draft',
  viewId: 'v',
  rootTableId: 't-a',
  rootRowId: 't-a:1',
  subjectLabel: '',
  subjectSpecs: [],
  sections: [],
  chapters: [],
  lines: [],
  adjustments: [],
  events: [],
  levelKey: 'cash',
  customer: { name: '' },
  createdAt,
  updatedAt: createdAt,
})

const manifest: PackManifest = {
  version: 'test-1',
  name: 'Test pack',
  sourceSha256: '',
  sourceFingerprint: '',
  packedAt: NOW,
  counts: { tables: 2, rows: 3, joins: 0 },
  tables: [],
  images: { file: 'images.json', held: 0, unheld: 0, refused: 0 },
}

const ids = <T extends { id: string }>(records: readonly T[]): string[] =>
  records.map((r) => r.id).sort()

describe.each(adapters)('%s adapter keeps the repository contract', (_name, world) => {
  it('puts, gets and lists; a missing id is undefined', async () => {
    const { catalogue } = world().open('o1')
    const a = table('t-a', 'o1')
    await catalogue.tables.put(a)
    expect(await catalogue.tables.get('t-a')).toEqual(a)
    expect(await catalogue.tables.get('t-z')).toBeUndefined()
    expect(await catalogue.tables.all()).toEqual([a])
  })

  it('scopes every read to the repository’s organisation', async () => {
    const w = world()
    const one = w.open('o1')
    const two = w.open('o2')
    await one.catalogue.tables.put(table('t-a', 'o1'))
    await two.catalogue.tables.put(table('t-b', 'o2'))
    await one.catalogue.rows.put(row('t-a:1', 'o1', 't-a'))
    await two.catalogue.rows.put(row('t-b:1', 'o2', 't-b'))

    expect(ids(await one.catalogue.tables.all())).toEqual(['t-a'])
    expect(ids(await two.catalogue.tables.all())).toEqual(['t-b'])
    /* another organisation's id reads as absent, not as theirs */
    expect(await one.catalogue.tables.get('t-b')).toBeUndefined()
    expect(ids(await one.catalogue.rows.all())).toEqual(['t-a:1'])
    expect(ids(await two.catalogue.rows.ofTable('t-b'))).toEqual(['t-b:1'])
    expect(await one.catalogue.rows.ofTable('t-b')).toEqual([])
  })

  it('refuses to file a record for another organisation, with the sentence', async () => {
    const { catalogue, quotes } = world().open('o1')
    const foreign = table('t-x', 'o2')
    const sentence = refusals.foreign('table', 't-x', 'o2', 'o1')
    await expect(catalogue.tables.put(foreign)).rejects.toThrow(sentence)
    await expect(catalogue.tables.putMany([table('t-a', 'o1'), foreign])).rejects.toThrow(sentence)
    await expect(catalogue.tables.saveAll([foreign])).rejects.toThrow(sentence)
    await expect(quotes.put(quote('q1', 'o2'))).rejects.toThrow(
      refusals.foreign('quote', 'q1', 'o2', 'o1'),
    )
    /* and nothing of the refused batch landed */
    expect(await catalogue.tables.all()).toEqual([])
    expect(await quotes.list()).toEqual([])
  })

  it('patches over the stored record, keeps id and orgId, and refuses a missing one', async () => {
    const { catalogue } = world().open('o1')
    await catalogue.tables.put(table('t-a', 'o1'))
    const patched = await catalogue.tables.patch('t-a', { name: 'Renamed', retired: true })
    expect(patched).toMatchObject({ id: 't-a', orgId: 'o1', name: 'Renamed', retired: true })
    expect(patched.fields).toHaveLength(1)
    expect(await catalogue.tables.get('t-a')).toEqual(patched)
    await expect(catalogue.tables.patch('t-z', { name: 'x' })).rejects.toThrow(
      refusals.missing('table', 't-z', 'o1'),
    )
  })

  it('deletes; deleting twice is nothing; another organisation’s record is refused', async () => {
    const w = world()
    const one = w.open('o1')
    const two = w.open('o2')
    await one.catalogue.tables.putMany([table('t-a', 'o1'), table('t-b', 'o1')])
    await two.catalogue.tables.put(table('t-c', 'o2'))

    await one.catalogue.tables.delete('t-a')
    await one.catalogue.tables.delete('t-a')
    expect(ids(await one.catalogue.tables.all())).toEqual(['t-b'])
    await expect(one.catalogue.tables.delete('t-c')).rejects.toThrow(
      refusals.foreign('table', 't-c', 'o2', 'o1'),
    )
    await expect(one.catalogue.tables.deleteMany(['t-b', 't-c'])).rejects.toThrow(
      refusals.foreign('table', 't-c', 'o2', 'o1'),
    )
    /* the refused batch deleted nothing */
    expect(ids(await one.catalogue.tables.all())).toEqual(['t-b'])
    expect(ids(await two.catalogue.tables.all())).toEqual(['t-c'])
    await one.catalogue.tables.deleteMany(['t-b', 't-never'])
    expect(await one.catalogue.tables.all()).toEqual([])
  })

  it('files a copy: changing the object after put changes nothing stored', async () => {
    const { catalogue } = world().open('o1')
    const a = table('t-a', 'o1')
    await catalogue.tables.put(a)
    a.name = 'changed after filing'
    expect((await catalogue.tables.get('t-a'))?.name).toBe('Table t-a')
  })

  it('saveAll leaves exactly what was given', async () => {
    const w = world()
    const { catalogue } = w.open('o1')
    const other = w.open('o2')
    await other.catalogue.rows.put(row('t-b:1', 'o2', 't-b'))
    await catalogue.rows.putMany([
      row('t-a:1', 'o1', 't-a', 'one'),
      row('t-a:2', 'o1', 't-a', 'two'),
      row('t-a:3', 'o1', 't-a', 'three'),
    ])
    const next = [
      row('t-a:1', 'o1', 't-a', 'one'),
      row('t-a:2', 'o1', 't-a', 'two, edited'),
      row('t-a:4', 'o1', 't-a', 'four'),
    ]
    await catalogue.rows.saveAll(next)
    const stored = (await catalogue.rows.all()).sort((x, y) => x.id.localeCompare(y.id))
    expect(stored).toEqual(next)
    /* the other organisation's rows were not part of "exactly" */
    expect(ids(await other.catalogue.rows.all())).toEqual(['t-b:1'])
  })

  it('loads the pack — a table, its rows, its ladder — and reads it back after a reopen', async () => {
    const w = world()
    const { catalogue } = w.open('o1')
    const a = table('t-a', 'o1', {
      priceLevels: [{ key: 'cash', label: 'Cash', fieldId: 't-a.c', scope: 'quote' }],
    })
    const b = table('t-b', 'o1')
    const rowsByEntity = {
      't-a': [row('t-a:1', 'o1', 't-a'), row('t-a:2', 'o1', 't-a')],
      't-b': [row('t-b:1', 'o1', 't-b')],
    }
    await catalogue.loadPack([a, b], rowsByEntity, manifest)

    /* a fresh repository over the same disk: nothing cached, nothing remembered */
    const reopened = w.open('o1').catalogue
    expect(ids(await reopened.tables.all())).toEqual(['t-a', 't-b'])
    expect(ids(await reopened.rows.ofTable('t-a'))).toEqual(['t-a:1', 't-a:2'])
    expect(ids(await reopened.rows.all())).toEqual(['t-a:1', 't-a:2', 't-b:1'])
    expect(await reopened.priceLevels.all()).toEqual([
      { id: 't-a', orgId: 'o1', tableId: 't-a', levels: a.priceLevels, updatedAt: NOW },
    ])
    expect(await reopened.meta.get()).toEqual({
      id: 'o1',
      orgId: 'o1',
      packVersion: 'test-1',
      packName: 'Test pack',
      loadedAt: NOW,
    })
  })

  it('refuses a pack filed for another organisation and lands nothing of it', async () => {
    const { catalogue } = world().open('o1')
    await expect(
      catalogue.loadPack([table('t-a', 'o1')], { 't-a': [row('t-a:1', 'o2', 't-a')] }),
    ).rejects.toThrow(refusals.foreign('row', 't-a:1', 'o2', 'o1'))
    expect(await catalogue.tables.all()).toEqual([])
    expect(await catalogue.meta.get()).toBeUndefined()
  })

  it('wipe empties the catalogue and keeps every quote', async () => {
    const w = world()
    const { catalogue, quotes } = w.open('o1')
    const other = w.open('o2')
    await catalogue.loadPack([table('t-a', 'o1')], { 't-a': [row('t-a:1', 'o1', 't-a')] }, manifest)
    await catalogue.groups.put({
      id: 'g1',
      orgId: 'o1',
      name: 'G',
      accent: 'blue',
      position: { x: 0, y: 0 },
      size: { w: 1, h: 1 },
    })
    await quotes.put(quote('q1', 'o1'))
    await other.catalogue.tables.put(table('t-b', 'o2'))

    await catalogue.wipe()

    expect(await catalogue.tables.all()).toEqual([])
    expect(await catalogue.rows.all()).toEqual([])
    expect(await catalogue.groups.all()).toEqual([])
    expect(await catalogue.priceLevels.all()).toEqual([])
    expect(await catalogue.meta.get()).toBeUndefined()
    /* "Your 3 quotes stay." — here, the one */
    expect(ids(await quotes.list())).toEqual(['q1'])
    /* and the other organisation's sheet was never in reach */
    expect(ids(await other.catalogue.tables.all())).toEqual(['t-b'])

    /* the wiped sheet takes a fresh pack cleanly */
    await catalogue.loadPack([table('t-c', 'o1')], { 't-c': [] })
    expect(ids(await catalogue.tables.all())).toEqual(['t-c'])
  })

  it('lists quotes newest first, and gets, puts and deletes one document', async () => {
    const { quotes } = world().open('o1')
    await quotes.put(quote('q-old', 'o1', '2026-09-14T00:00:00.000Z'))
    await quotes.put(quote('q-new', 'o1', '2026-09-16T00:00:00.000Z'))
    await quotes.put(quote('q-mid', 'o1', '2026-09-15T00:00:00.000Z'))
    expect((await quotes.list()).map((q) => q.id)).toEqual(['q-new', 'q-mid', 'q-old'])

    const issued = { ...quote('q-mid', 'o1', '2026-09-15T00:00:00.000Z'), state: 'issued' as const }
    await quotes.put(issued)
    expect(await quotes.get('q-mid')).toEqual(issued)

    await quotes.delete('q-old')
    await quotes.delete('q-old')
    expect((await quotes.list()).map((q) => q.id)).toEqual(['q-new', 'q-mid'])
    expect(await quotes.get('q-old')).toBeUndefined()
  })

  it('a quote is one document row: its lines and events come back whole', async () => {
    const { quotes } = world().open('o1')
    const q: QuoteDef = {
      ...quote('q1', 'o1'),
      lines: [
        {
          id: 'l1',
          entityId: 't-a',
          rowId: 't-a:1',
          label: 'Line',
          qty: 1,
          unitPrice: null,
          priceFieldId: null,
          priceColumnName: null,
          levelKey: 'cash',
          levelResolved: 'cash',
          levels: [],
        },
      ],
      events: [{ id: 'e1', kind: 'minted', at: NOW, said: 'Minted.', changed: [] }],
    }
    await quotes.put(q)
    expect(await quotes.get('q1')).toEqual(q)
  })
})
