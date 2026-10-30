/* ============================================================
   THE PICTURES NORTHSIDE ADDS, AGAINST THE REAL STORE AND THE ONE
   READER.

   A picture rides the catalogue's own stack, so these are the
   catalogue's promises said of it: adding one is one step with its
   Undo; it is written beside the sheet and read back on the next open;
   a new price list does not wipe it; and the one reader every screen
   and the paper ask (`src/data/pictures.ts`) answers with it the moment
   it stands, and stops the moment it does not.
   ============================================================ */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { EntityDef, PackManifest, RowData } from '@/domain/model'
import { isDone } from '@/domain/catalogue/commands'
import { addOwnPicture, removeOwnPicture } from '@/domain/catalogue/pictureCommands'
import type { OwnPicture } from '@/domain/model/ownPictures'
import { createMemoryDatabase, type MemoryDatabase } from '@/data/memory/database'
import { memoryCatalogue, memoryOrg, memoryOwnPictures } from '@/data/memory/repositories'
import { holdOwnPictures } from '@/data/ownPictures'
import { catalogueOf, itemOf, ownOf, pictureOf } from '@/data/pictures'
import { createCatalogueStore, type CatalogueStore } from './catalogue'

const ISO = new Date(2026, 9, 30, 12).toISOString()
const BYTES = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3AgAA='

/* a list with two options, the second as alike as a name can be */
const parts = (): EntityDef => ({
  id: 'e-parts',
  orgId: 'northside',
  name: 'Parts',
  accent: 'blue',
  kind: 'accessory',
  position: { x: 0, y: 0 },
  fields: [{ id: 'f-name', name: 'Name', type: 'text' }],
  createdAt: ISO,
  updatedAt: ISO,
})
const line = (id: string, name: string): RowData => ({
  id,
  orgId: 'northside',
  entityId: 'e-parts',
  values: { 'f-name': name },
  createdAt: ISO,
  updatedAt: ISO,
})
const ROWS = [line('p1', 'Battery MFM50'), line('p2', '2 x MFM50 Batteries')]
const manifest = { name: 'Northside Marine', version: 't' } as PackManifest

let db: MemoryDatabase
let told: (readonly OwnPicture[])[]
let store: CatalogueStore

const make = (): CatalogueStore =>
  createCatalogueStore({
    now: () => ISO,
    writeBehindMs: 0,
    orgFor: (orgId) => memoryOrg(orgId, { db }),
    picturesFor: (orgId) => memoryOwnPictures(orgId, { db }),
    asking: () => 'Asaf',
    onOwnPictures: (standing) => {
      told.push(standing)
      holdOwnPictures(standing)
    },
  })

async function open(s: CatalogueStore, rows: RowData[] = ROWS): Promise<void> {
  await s
    .getState()
    .load(
      { entities: [parts()], rowsByEntity: { 'e-parts': rows }, manifest },
      { writeTo: memoryCatalogue('northside', { db }) },
    )
}

const add = (row = 'p1', name = 'Battery MFM50') =>
  addOwnPicture({
    table: 'e-parts',
    row,
    name,
    picture: { src: BYTES, width: 1100, height: 825, file: 'mfm50.jpg' },
    by: 'Asaf',
  })

beforeEach(async () => {
  db = createMemoryDatabase()
  told = []
  store = make()
  await open(store)
})

afterEach(() => {
  /* the reader is the app's one: leave it holding nothing for the next file */
  holdOwnPictures([])
})

describe('a picture is one step on the catalogue’s stack', () => {
  it('stands at once, is written beside the sheet, and its Undo takes it off the disk too', async () => {
    const done = store.getState().apply(add())
    expect(isDone(done) && done.said).toBe('Your picture is on the Battery MFM50 now.')
    expect(Object.values(store.getState().ownPictures ?? {})).toHaveLength(1)
    await store.getState().flush()
    const kept = await memoryOwnPictures('northside', { db }).all()
    expect(kept.map((p) => [p.row, p.addedBy, p.option])).toEqual([['p1', 'Asaf', 'Battery MFM50']])

    if (!isDone(done)) return
    const back = store.getState().undo(done.event.id)
    expect(isDone(back)).toBe(true)
    expect(store.getState().ownPictures).toBeUndefined()
    await store.getState().flush()
    expect(await memoryOwnPictures('northside', { db }).all()).toEqual([])
  })

  it('is read back on the next open, and a new price list does not wipe it', async () => {
    store.getState().apply(add())
    await store.getState().flush()

    const next = make()
    await open(next)
    expect(Object.values(next.getState().ownPictures ?? {}).map((p) => p.row)).toEqual(['p1'])

    /* the price list comes in again, the same line still at its place */
    await open(next)
    expect(Object.values(next.getState().ownPictures ?? {}).map((p) => p.row)).toEqual(['p1'])
  })

  it('takes a picture off as one step, and its Undo puts the same one back', async () => {
    store.getState().apply(add())
    const p = Object.values(store.getState().ownPictures ?? {})[0]!
    const off = store.getState().apply(removeOwnPicture(p.id, 'Asaf'))
    expect(isDone(off) && off.said).toBe('Your picture is off the Battery MFM50.')
    if (!isDone(off)) return
    store.getState().undo(off.event.id)
    expect(store.getState().ownPictures?.[p.id]).toBe(p)
  })
})

describe('the one reader answers with it', () => {
  const battery = itemOf('e-parts', 'p1')
  const alike = itemOf('e-parts', 'p2')

  it('draws it for that option, says who added it, and never for the alike one', () => {
    expect(pictureOf(battery)).toBeNull()
    store.getState().apply(add())
    expect(told.at(-1)?.map((p) => p.row)).toEqual(['p1'])
    expect(pictureOf(battery)?.src).toBe(BYTES)
    expect(catalogueOf(battery)?.verification).toBe('Added by Asaf, 30 October 2026')
    expect(ownOf(battery)?.addedBy).toBe('Asaf')
    expect(pictureOf(alike)).toBeNull()
    expect(ownOf(alike)).toBeNull()
  })

  it('stops drawing it when a new price list puts another option at its place, and keeps it', async () => {
    store.getState().apply(add())
    await store.getState().flush()
    await open(store, [line('p1', 'D Shackle - 10 mm Galv'), ROWS[1]!])
    expect(told.at(-1)).toEqual([])
    expect(pictureOf(battery)).toBeNull()
    expect(Object.values(store.getState().ownPictures ?? {})).toHaveLength(1)

    /* and the price list as it was draws it again */
    await open(store)
    expect(pictureOf(battery)?.src).toBe(BYTES)
  })
})
