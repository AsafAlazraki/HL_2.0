import { describe, expect, it } from 'vitest'
import type { EntityDef, PackManifest, RowData } from '@/domain/model'
import { memoryCatalogue } from '@/data/memory/repositories'
import { byId, byKey, createCatalogueStore, ctxFrom, rowOrder, tableOf } from './catalogue'

const NOW = '2026-09-16T00:00:00.000Z'

const table = (id: string, extra: Partial<EntityDef> = {}): EntityDef => ({
  id,
  orgId: 'o1',
  name: `Table ${id}`,
  accent: 'blue',
  fields: [{ id: `${id}.c`, name: 'C', type: 'text' }],
  position: { x: 0, y: 0 },
  createdAt: NOW,
  updatedAt: NOW,
  ...extra,
})

const row = (entityId: string, n: number, createdAt = NOW): RowData => ({
  id: `${entityId}:${n}`,
  orgId: 'o1',
  entityId,
  values: { [`${entityId}.c`]: String(n) },
  createdAt,
  updatedAt: createdAt,
})

const manifest: PackManifest = {
  version: 'test-1',
  name: 'Test pack',
  sourceSha256: '',
  sourceFingerprint: '',
  packedAt: NOW,
  counts: { tables: 1, rows: 3, joins: 0 },
  tables: [],
  images: { file: 'images.json', held: 0, unheld: 0, refused: 0 },
}

describe('the catalogue store', () => {
  it('starts empty, with no version and no problem', () => {
    const state = createCatalogueStore().getState()
    expect(state.status).toBe('empty')
    expect(state.version).toBeNull()
    expect(state.from).toBeNull()
    expect(state.business).toBeNull()
    expect(state.problem).toBeNull()
    expect(state.tables).toEqual({})
    expect(state.rows).toEqual({})
    expect(state.index.rowById).toEqual({})
  })

  it('loads from a pack source, keeps the pack’s own row order and takes the manifest version', async () => {
    const store = createCatalogueStore()
    const rows = [row('t-a', 3), row('t-a', 1), row('t-a', 2)]
    await store
      .getState()
      .load({ entities: [table('t-a')], rowsByEntity: { 't-a': rows }, manifest })
    const state = store.getState()
    expect(state.status).toBe('ready')
    expect(state.version).toBe('test-1')
    /* nothing is re-sorted on the way in */
    expect(state.rows['t-a'].map((r) => r.id)).toEqual(['t-a:3', 't-a:1', 't-a:2'])
    expect(Object.keys(state.tables)).toEqual(['t-a'])
  })

  it('a table with no rows in the pack still has an empty list, so a screen never reads undefined', async () => {
    const store = createCatalogueStore()
    await store.getState().load({ entities: [table('t-a')], rowsByEntity: {} })
    expect(store.getState().rows['t-a']).toEqual([])
    expect(store.getState().version).toBeNull()
  })

  it('loads from a repository and puts the rows back in the sheet’s order', async () => {
    const repo = memoryCatalogue('o1')
    const later = '2026-09-17T00:00:00.000Z'
    /* filed out of order, with ids whose numbers do not sort as strings */
    await repo.loadPack([table('t-a')], {
      't-a': [row('t-a', 10), row('t-a', 2), row('t-a', 1), row('t-a', 11)],
    })
    await repo.rows.put(row('t-a', 3, later))
    const store = createCatalogueStore()
    await store.getState().load(repo)
    expect(store.getState().status).toBe('ready')
    expect(store.getState().rows['t-a'].map((r) => r.id)).toEqual([
      't-a:1',
      't-a:2',
      't-a:10',
      't-a:11',
      /* added later: lands at the end */
      't-a:3',
    ])
  })

  it('rowOrder compares createdAt first and then the id with numbers as numbers', () => {
    expect(rowOrder(row('t', 2), row('t', 10))).toBeLessThan(0)
    expect(rowOrder(row('t', 10), row('t', 2))).toBeGreaterThan(0)
    expect(rowOrder(row('t', 99, NOW), row('t', 1, '2026-09-17T00:00:00.000Z'))).toBeLessThan(0)
    expect(rowOrder(row('t', 1), row('t', 1))).toBe(0)
  })

  it('takes the version from the filed meta when loading from a repository', async () => {
    const repo = memoryCatalogue('o1')
    await repo.loadPack([table('t-a')], { 't-a': [] }, manifest)
    const store = createCatalogueStore()
    await store.getState().load(repo)
    expect(store.getState().version).toBe('test-1')
  })

  it('indexes every row by id; byKey, byId and tableOf answer without a scan', async () => {
    const store = createCatalogueStore()
    await store.getState().load({
      entities: [table('t-a'), table('t-b')],
      rowsByEntity: { 't-a': [row('t-a', 1)], 't-b': [row('t-b', 1), row('t-b', 2)] },
    })
    const state = store.getState()
    expect(Object.keys(state.index.rowById).toSorted()).toEqual(['t-a:1', 't-b:1', 't-b:2'])
    expect(byKey(state, 't-b')?.name).toBe('Table t-b')
    expect(byKey(state, 't-z')).toBeUndefined()
    expect(byId(state, 't-b:2')).toBe(state.rows['t-b'][1])
    expect(byId(state, 't-b:9')).toBeUndefined()
    expect(tableOf(state, 't-b:2')).toBe(state.tables['t-b'])
    expect(tableOf(state, 'nowhere')).toBeUndefined()
  })

  it('reads the ladder off the table on the pack and off the filed record from a repository', async () => {
    const levels = [{ key: 'cash', label: 'Cash', fieldId: 't-a.c', scope: 'quote' as const }]
    const fromPack = createCatalogueStore()
    await fromPack
      .getState()
      .load({ entities: [table('t-a', { priceLevels: levels }), table('t-b')], rowsByEntity: {} })
    expect(fromPack.getState().priceLevels).toEqual({ 't-a': levels })

    const repo = memoryCatalogue('o1')
    await repo.loadPack([table('t-a', { priceLevels: levels })], { 't-a': [] })
    /* the Levels screen rewrote the filed ladder; the record wins */
    const rewritten = [{ key: 'trade', label: 'Trade', fieldId: 't-a.c', scope: 'quote' as const }]
    await repo.priceLevels.patch('t-a', { levels: rewritten })
    const fromRepo = createCatalogueStore()
    await fromRepo.getState().load(repo)
    expect(fromRepo.getState().priceLevels).toEqual({ 't-a': rewritten })
  })

  it('loads the registries from a repository, keyed the way the ctx wants them', async () => {
    const repo = memoryCatalogue('o1')
    await repo.groups.put({
      id: 'g1',
      orgId: 'o1',
      name: 'G',
      accent: 'blue',
      position: { x: 0, y: 0 },
      size: { w: 1, h: 1 },
    })
    await repo.roles.put({ id: 'r1', orgId: 'o1', name: 'Sales', createdAt: NOW, updatedAt: NOW })
    await repo.constraintDefs.put({
      id: 'c1',
      orgId: 'o1',
      kind: 'implies',
      if: { combinator: 'AND', clauses: [] },
      because: 'the test says so',
      enabled: true,
      createdAt: NOW,
      updatedAt: NOW,
    })
    const store = createCatalogueStore()
    await store.getState().load(repo)
    const state = store.getState()
    expect(Object.keys(state.groups)).toEqual(['g1'])
    expect(Object.keys(state.roles)).toEqual(['r1'])
    expect(state.constraintDefs.map((c) => c.id)).toEqual(['c1'])
    expect(state.rules).toEqual({})
    expect(state.views).toEqual({})
    expect(state.modules).toEqual({})
    expect(state.discoveredRules).toEqual([])
  })

  /* ============================================================
     WHERE THE SHEET CAME FROM, AND WHOSE IT IS. Two screens read
     these: Entry opens the file and navigates, Home prints what was
     opened. Neither may guess, so the store says which source
     answered and what that source called the business.
     ============================================================ */
  it('says the sheet came from the file, and names the business off the manifest', async () => {
    const store = createCatalogueStore()
    await store.getState().load({ entities: [table('t-a')], rowsByEntity: { 't-a': [] }, manifest })
    expect(store.getState().from).toBe('pack')
    expect(store.getState().business).toBe('Test pack')
  })

  it('a pack that names no business names none, rather than one nobody wrote', async () => {
    const store = createCatalogueStore()
    await store.getState().load({ entities: [table('t-a')], rowsByEntity: {} })
    expect(store.getState().from).toBe('pack')
    expect(store.getState().business).toBeNull()
  })

  it('says the sheet came from this browser, and names it off the record filed beside it', async () => {
    const repo = memoryCatalogue('o1')
    await repo.loadPack([table('t-a')], { 't-a': [row('t-a', 1)] })
    await repo.meta.put({
      id: 'o1',
      orgId: 'o1',
      packVersion: 'test-1',
      packName: 'Test pack',
      loadedAt: NOW,
    })
    const store = createCatalogueStore()
    await store.getState().load(repo)
    expect(store.getState().from).toBe('repository')
    expect(store.getState().business).toBe('Test pack')
  })

  /* A BROWSER THAT HAS KEPT NOTHING still answers, and what it
     answers is a blank sheet read out of this browser — which is
     exactly what Home draws for somebody who took the blank door. */
  it('an empty database is a blank sheet from the repository, not a failure', async () => {
    const store = createCatalogueStore()
    await store.getState().load(memoryCatalogue('o1'))
    const state = store.getState()
    expect(state.status).toBe('ready')
    expect(state.from).toBe('repository')
    expect(state.business).toBeNull()
    expect(state.tables).toEqual({})
    expect(state.version).toBeNull()
  })

  it('a failed load is a sentence and an empty sheet, never the previous one shown as current', async () => {
    const store = createCatalogueStore()
    await store.getState().load({ entities: [table('t-a')], rowsByEntity: {} })
    const broken = memoryCatalogue('o1')
    broken.tables.all = () => Promise.reject(new Error('the disk is not there'))
    await store.getState().load(broken)
    const state = store.getState()
    expect(state.status).toBe('failed')
    expect(state.problem).toBe('the disk is not there')
    expect(state.tables).toEqual({})
    expect(state.version).toBeNull()
    /* and it claims no provenance either: a sheet that did not arrive
       came from nowhere */
    expect(state.from).toBeNull()
    expect(state.business).toBeNull()
  })

  it('reports loading while a load is in flight', async () => {
    const store = createCatalogueStore()
    const seen: string[] = []
    store.subscribe((s) => seen.push(s.status))
    await store.getState().load({ entities: [], rowsByEntity: {} })
    expect(seen).toEqual(['loading', 'ready'])
  })

  it('ctxFrom hands the catalogue’s maps to a pure module by reference', async () => {
    const store = createCatalogueStore()
    await store
      .getState()
      .load({ entities: [table('t-a')], rowsByEntity: { 't-a': [row('t-a', 1)] } })
    const state = store.getState()
    const ctx = ctxFrom(state)
    expect(ctx.entities).toBe(state.tables)
    expect(ctx.rowsByEntity).toBe(state.rows)
    expect(ctx.priceLevels).toBe(state.priceLevels)
    expect(ctx.constraintDefs).toBe(state.constraintDefs)
  })
})
