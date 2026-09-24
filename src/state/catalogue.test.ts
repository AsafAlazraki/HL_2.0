import { describe, expect, it } from 'vitest'
import type { EntityDef, OrgProfile, PackManifest, RowData } from '@/domain/model'
import { makeCtx } from '@/domain/model'
import { createViewFor } from '@/domain/catalogue/views'
import { mintQuote } from '@/domain/quote'
import { readDocument } from '@/domain/quote/document'
import { memoryCatalogue } from '@/data/memory/repositories'
import { loadPack } from '@/test/fixtures/pack'
import {
  byId,
  byKey,
  createCatalogueStore,
  ctxFrom,
  isNamedByTheFile,
  orgNamedByTheFile,
  rowOrder,
  tableOf,
  type OrgNamedByTheFile,
} from './catalogue'

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
     exactly what Home draws for a browser that holds no copy of the
     file, with the door beside it. */
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

/* ============================================================
   WHOSE NAME IS ON THE PAPER (critique of Milestone 2, blocker #2).

   The pack carries no organisation record — Milestone 4's `/manage`
   makes one — and until 2026-09-23 that meant every quote minted on
   the real file froze no letterhead, so page 1 of a customer's
   quotation read "This business has not been named yet" while every
   screen around it said Northside Marine. The file names the business;
   `ctxFrom` now hands that name to the engine, with its provenance,
   and a record set by a person wins over it.

   THE NAME IS NEVER TYPED INTO AN ASSERTION. The first case reads it
   off the pack's own manifest, so a file that named another business
   would print that one and this suite would still hold.
   ============================================================ */

describe('ctxFrom names the business the file names', () => {
  it('carries the manifest’s name as an organisation read off the file, not typed by anybody', async () => {
    const store = createCatalogueStore()
    await store
      .getState()
      .load({ entities: [table('t-a')], rowsByEntity: { 't-a': [row('t-a', 1)] }, manifest })
    const ctx = ctxFrom(store.getState())
    expect(ctx.org?.name).toBe(manifest.name)
    expect(isNamedByTheFile(ctx.org)).toBe(true)
    const org = ctx.org as OrgNamedByTheFile
    expect(org.namedBy).toEqual({ source: 'the price file', version: 'test-1', from: 'pack' })
    /* the tenant key the file's own records carry, and no date nobody said */
    expect(org.slug).toBe('o1')
    expect(org.createdAt).toBe('')
    /* the file carries no standing terms, so the context carries none */
    expect(org.quoteTerms).toBeUndefined()
  })

  it('reads the same name back out of this browser, and says so', async () => {
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
    const org = ctxFrom(store.getState()).org as OrgNamedByTheFile
    expect(org.name).toBe('Test pack')
    expect(org.namedBy.from).toBe('repository')
  })

  it('a sheet no source named carries no organisation, rather than one nobody wrote', async () => {
    const store = createCatalogueStore()
    await store
      .getState()
      .load({ entities: [table('t-a')], rowsByEntity: { 't-a': [row('t-a', 1)] } })
    const ctx = ctxFrom(store.getState())
    expect(ctx.org).toBeUndefined()
    expect('org' in ctx).toBe(false)
    expect(orgNamedByTheFile(store.getState())).toBeUndefined()
  })

  it('an organisation record set by a person wins over the file’s name', async () => {
    const store = createCatalogueStore()
    await store
      .getState()
      .load({ entities: [table('t-a')], rowsByEntity: { 't-a': [row('t-a', 1)] }, manifest })
    const record: OrgProfile = {
      name: 'A Trading Name Somebody Typed',
      industry: 'marine',
      createdAt: NOW,
      slug: 'o1',
      quoteTerms: 'Terms somebody typed.',
    }
    const ctx = ctxFrom(store.getState(), record)
    expect(ctx.org).toBe(record)
    expect(isNamedByTheFile(ctx.org)).toBe(false)
  })
})

/** The sheet as the app holds it after the blue door, and a quote
 *  minted through the same composition every screen that freezes
 *  uses: `makeCtx({ ...ctxFrom(sheet), views, orgId })`. */
const mintOnTheFile = async (record?: OrgProfile) => {
  const pack = await loadPack()
  const store = createCatalogueStore()
  await store.getState().load({
    entities: pack.entities,
    rowsByEntity: pack.rowsByEntity,
    manifest: pack.manifest,
    modules: Object.values(pack.ctx.modules),
  })
  const sheet = store.getState()
  const ctx = makeCtx({
    ...ctxFrom(sheet, record),
    views: { ...sheet.views },
    orgId: 'northside',
  })
  const hull = pack.byKey('boat_stacer')
  const first = (pack.rowsByEntity[hull.id] ?? [])[0]
  expect(first, 'the file carries no Stacer to quote').toBeDefined()
  const view = createViewFor(ctx, hull.id)
  const minted = mintQuote(ctx, { viewId: view.id, rowId: first!.id, reference: 'NSM-PAPER' })
  expect(minted).not.toBeNull()
  return { pack, quote: minted!.quote }
}

describe('a quote frozen on the Master Price File prints the business on the paper', () => {
  it('freezes the name the file carries, and the document reads it on page 1', async () => {
    const { pack, quote } = await mintOnTheFile()
    expect(pack.manifest.name.trim()).not.toBe('')
    expect(quote.organisation).toBe(pack.manifest.name)
    expect(readDocument(quote).business).toBe(pack.manifest.name)
  })

  it('freezes the record’s name, and its terms, when a person has set one', async () => {
    const record: OrgProfile = {
      name: 'A Trading Name Somebody Typed',
      industry: 'marine',
      createdAt: NOW,
      quoteTerms: 'Terms somebody typed.',
    }
    const { quote } = await mintOnTheFile(record)
    expect(readDocument(quote).business).toBe(record.name)
    expect(readDocument(quote).terms).toBe(record.quoteTerms)
  })
})
