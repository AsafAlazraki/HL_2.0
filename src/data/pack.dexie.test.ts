import 'fake-indexeddb/auto'
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb'
import { afterAll, describe, expect, it, vi } from 'vitest'
import { openDatabase, type HLDatabase } from './dexie/database'
import { dexieCatalogue } from './dexie/repositories'
import { PACK_ORG_ID, openCatalogue } from './pack/boot'
import { isImageValue } from '@/domain/model'
import { createCatalogueStore, byId, byKey } from '@/state/catalogue'
import { loadPack } from '@/test/fixtures/pack'

/* ============================================================
   THE WHOLE PACK, THROUGH THE WHOLE SEAM, AND BACK — Milestone 0's
   exit criterion: "the pack loads into IndexedDB and reloads".

   Every other suite in this repository hands a pure module the pack
   out of `src/test/fixtures/pack`, which reads the JSON off the disk
   and never touches a database. This one is the opposite: the point
   is the machinery between the file and the screen, all of it at
   once and at full size — 53 tables, 15,691 rows — because the
   failures this catches are the ones that only appear at that size
   or only appear across a close.

   WHAT A CLOSE AND A REOPEN PROVE that a single pass does not. A
   value that survives being written is not the same claim as a value
   that survives being written, serialised by the structured-clone
   algorithm, put down, forgotten by the process and read back. The
   pack's pictures are arrays of objects inside a row's `values` bag,
   its figures are numbers rather than the strings a spreadsheet
   would have given, and both of those are exactly what a lazy
   `JSON.stringify` seam would quietly change. So the second half of
   this file opens a SECOND database handle over the same store, with
   nothing in memory from the first, and reads the 529 Assault Pro
   back field by field.

   fake-indexeddb, not the browser, and its own `IDBFactory` rather
   than the global one, so this suite's 15,691 rows are not in any
   other suite's way.
   ============================================================ */

const ORG = PACK_ORG_ID
const DB = 'hl2-pack-dexie'

const fixture = await loadPack()

/** the pack as `openCatalogue` reads it in the browser: the fixture
 *  is the same files, read off the disk instead of over the network */
const readPack = () =>
  Promise.resolve({
    manifest: fixture.manifest,
    entities: fixture.entities,
    rowsByEntity: fixture.rowsByEntity,
  })

/** ONE STORE ACROSS BOTH HANDLES. Passing the same `IDBFactory` to
 *  both `openDatabase` calls is what makes the second one a reopen
 *  rather than a second database. */
const disk = new IDBFactory()
const open = (): HLDatabase => openDatabase(DB, { indexedDB: disk, IDBKeyRange })

const ROWS_IN_THE_PACK = fixture.manifest.tables.reduce((n, t) => n + t.rowCount, 0)

/* ---------------------------------------------------------- */
/* The write                                                   */
/* ---------------------------------------------------------- */

const first = open()

/** ONE REQUEST PER TABLE'S ROWS, counted at the seam Dexie exposes.
 *  53 tables, 15,691 rows: if the adapter put a row at a time this
 *  would count 15,691 writes, which is the same data and a different
 *  program.
 *
 *  The two figures are taken out of the spy HERE rather than read off
 *  it in the `it` below, because vitest collects a file and then runs
 *  it: every mock made while the module body ran is cleared before
 *  the first test executes, and a spy asked afterwards answers zero
 *  for work it really did watch. */
const bulkPuts = vi.spyOn(first.rows, 'bulkPut')
const opened = await openCatalogue(dexieCatalogue(ORG, { db: first }), { read: readPack })
const bulkWrites = bulkPuts.mock.calls.length
const rowsWritten = bulkPuts.mock.calls.reduce((n, [rows]) => n + rows.length, 0)
/** read BEFORE the close below — every `describe` body in this file
 *  runs after the whole module has, so the first handle is already
 *  shut by the time an `it` executes */
const metaAfterWrite = await dexieCatalogue(ORG, { db: first }).meta.get()
const tablesWithRows = fixture.manifest.tables.filter((t) => t.rowCount > 0).length

describe('the pack lands in IndexedDB', () => {
  it('is filed for the business every record in it names', () => {
    /* the constant the app opens a repository with, pinned against the
       file it claims to be about — a repository built for anyone else
       would refuse the whole pack, table by table */
    const owners = new Set<string>()
    for (const entity of fixture.entities) owners.add(entity.orgId)
    for (const list of Object.values(fixture.rowsByEntity))
      for (const row of list) owners.add(row.orgId)
    expect([...owners]).toEqual([PACK_ORG_ID])
  })

  it('reads the pack on the first open, because nothing is down there yet', () => {
    expect(opened.from).toBe('pack')
    expect(opened.unkept).toBeUndefined()
    expect(opened.version).toBe(fixture.manifest.version)
  })

  it('files it one bulk write per table, not one request per row', () => {
    /* the table, its rows and its declared ladder land together in one
       transaction per table, so a pack interrupted between tables
       leaves whole tables and never half of one */
    expect(fixture.manifest.tables).toHaveLength(53)
    expect(bulkWrites).toBe(tablesWithRows)
    expect(rowsWritten).toBe(15691)
  })

  it('records what the sheet was loaded from, last', () => {
    expect(metaAfterWrite?.packVersion).toBe(fixture.manifest.version)
    expect(metaAfterWrite?.packName).toBe(fixture.manifest.name)
    expect(metaAfterWrite?.orgId).toBe(ORG)
  })
})

/* ---------------------------------------------------------- */
/* The close, and the reopen                                   */
/* ---------------------------------------------------------- */

first.close()

const second = open()
const repository = dexieCatalogue(ORG, { db: second })
const reopened = await openCatalogue(repository, {
  read: () => Promise.reject(new Error('the pack must not be fetched a second time')),
})

const store = createCatalogueStore()
await store.getState().load(reopened.source)
const state = store.getState()

afterAll(() => {
  second.close()
})

describe('and it is still there after a close and a reopen', () => {
  it('reads the sheet off the disk instead of the file, and never asks for the file', () => {
    expect(reopened.from).toBe('repository')
    expect(reopened.version).toBe(fixture.manifest.version)
  })

  it('has 53 tables and 15,691 rows', async () => {
    const [tables, rows] = await Promise.all([repository.tables.all(), repository.rows.all()])
    expect(tables).toHaveLength(53)
    expect(rows).toHaveLength(15691)
    expect(rows).toHaveLength(ROWS_IN_THE_PACK)
  })

  it('gives the store the same sheet the fixture reads off the disk', () => {
    expect(state.status).toBe('ready')
    expect(Object.keys(state.tables)).toHaveLength(53)
    expect(Object.values(state.rows).reduce((n, list) => n + list.length, 0)).toBe(15691)
    expect(state.version).toBe(fixture.manifest.version)
  })

  it('puts a table back in the sheet order it was written in', () => {
    const ids = state.rows.boat_stacer.map((r) => r.id)
    expect(ids.slice(0, 3)).toEqual(['boat_stacer:1', 'boat_stacer:2', 'boat_stacer:3'])
    /* 'boat_stacer:10' after 'boat_stacer:9', which is the whole
       reason `rowOrder` compares numbers as numbers */
    expect(ids[9]).toBe('boat_stacer:10')
  })

  it('carries the declared ladder with its table', () => {
    const stacer = byKey(state, 'boat_stacer')
    expect(stacer?.name).toBe('Stacer')
    expect(state.priceLevels.boat_stacer?.map((l) => l.fieldId)).toContain('boat_stacer.qr')
  })
})

describe('a boat row comes back exactly as it went down', () => {
  /* the Stacer 529 Assault Pro — the subject of the golden quote, and
     the one row in this file worth naming: it is the boat the plan
     freezes at hull $28,530, it carries a real on-water photograph
     rather than a render, and its figures are numbers */
  const row = byId(state, 'boat_stacer:30')
  const onDisk = fixture.rowsByEntity.boat_stacer.find((r) => r.id === 'boat_stacer:30')

  it('is the boat it was', () => {
    expect(row?.values['boat_stacer.c']).toBe('Stacer - 529 Assault Pro (Tournament)')
    expect(row?.values['boat_stacer.d']).toBe('SA529APTR')
    expect(row?.entityId).toBe('boat_stacer')
    expect(row?.orgId).toBe(ORG)
  })

  it('keeps its figures as NUMBERS, which is what a stringify seam would have taken', () => {
    expect(row?.values['boat_stacer.qr']).toBe(28530)
    expect(row?.values['boat_stacer.g']).toBe(5.29)
    expect(row?.values['boat_stacer.kw']).toBe(150)
    expect(typeof row?.values['boat_stacer.qr']).toBe('number')
  })

  it('keeps its picture, address and all', () => {
    const pictures = row?.values['boat_stacer.f'] ?? null
    /* a list of picture records, not the string a lazy seam would have
       left behind */
    expect(isImageValue(pictures)).toBe(true)
    expect(pictures).toHaveLength(1)
    const src = isImageValue(pictures) ? pictures[0].src : ''
    /* the address stays the one the seed recorded — the dealer's own
       mirror for this hull, not a copy this app invented */
    expect(src).toContain('529-Assault')
    expect(pictures).toEqual(onDisk?.values['boat_stacer.f'])
  })

  it('is the row the fixture reads off the disk, field for field', () => {
    expect(row).toEqual(onDisk)
  })
})
