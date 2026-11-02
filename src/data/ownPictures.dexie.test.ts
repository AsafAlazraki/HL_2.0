import 'fake-indexeddb/auto'
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb'
import Dexie from 'dexie'
import { describe, expect, it } from 'vitest'
import type { GalleryOrder } from '@/domain/model/gallery'
import { bytesOf, type OwnPicture } from '@/domain/model/ownPictures'
import { openDatabase } from './dexie/database'
import { dexieCatalogue, dexieGalleries, dexieOwnPictures } from './dexie/repositories'

/* ============================================================
   THE PICTURES NORTHSIDE ADDS, IN INDEXEDDB — the bytes in the record,
   across a close, beside the sheet and never wiped with it, and a
   database from before they were kept opening with them.
   ============================================================ */

const BYTES = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3AgAA='
const NOON = new Date(2026, 9, 30, 12).toISOString()

const picture = (id: string, row: string): OwnPicture => ({
  id,
  orgId: 'northside',
  table: 'parts',
  row,
  option: 'MFM50 - Battery MFM50',
  name: 'Battery MFM50',
  src: BYTES,
  width: 1100,
  height: 825,
  bytes: bytesOf(BYTES),
  addedBy: 'Asaf',
  addedAt: NOON,
  chosen: false,
})

describe('the pictures Northside added, on the disk', () => {
  it('keep their bytes across a close, and the difference is what is written', async () => {
    const indexedDB = new IDBFactory()
    const first = openDatabase('hl2-pictures', { indexedDB, IDBKeyRange })
    const repo = dexieOwnPictures('northside', { db: first })
    await repo.saveAll([picture('a', 'parts:119'), picture('b', 'parts:787')])
    await repo.saveAll([picture('b', 'parts:787')])
    first.close()

    const again = openDatabase('hl2-pictures', { indexedDB, IDBKeyRange })
    const read = await dexieOwnPictures('northside', { db: again }).all()
    expect(read).toEqual([picture('b', 'parts:787')])
    /* another organisation's are not this one's */
    expect(await dexieOwnPictures('elsewhere', { db: again }).all()).toEqual([])
    again.close()
  })

  it('are not reached by wiping the sheet for a new price list', async () => {
    const db = openDatabase('hl2-wipe', { indexedDB: new IDBFactory(), IDBKeyRange })
    await dexieOwnPictures('northside', { db }).saveAll([picture('a', 'parts:119')])
    await dexieCatalogue('northside', { db }).wipe()
    expect(await dexieOwnPictures('northside', { db }).all()).toHaveLength(1)
    db.close()
  })

  it('open beside a database written before they were kept, which keeps what it had', async () => {
    const indexedDB = new IDBFactory()
    const old = new Dexie('hl2-old', { indexedDB, IDBKeyRange })
    old.version(1).stores({ quotes: 'id, orgId' })
    old.version(2).stores({ org: 'id, orgId' })
    await old.table('org').put({ id: 'northside', orgId: 'northside', profile: { name: 'Northside' } })
    old.close()

    const db = openDatabase('hl2-old', { indexedDB, IDBKeyRange })
    expect(await db.org.get('northside')).toMatchObject({ profile: { name: 'Northside' } })
    expect(await dexieOwnPictures('northside', { db }).all()).toEqual([])
    db.close()
  })
})

describe('how Northside arranged its galleries, on the disk', () => {
  const arranged = (id: string, row: string): GalleryOrder => ({
    id,
    orgId: 'northside',
    table: 'parts',
    row,
    option: 'MFM50 - Battery MFM50',
    name: 'Battery MFM50',
    cover: 'own:a',
    order: ['own:a', 'own:b'],
    by: 'Asaf',
    at: NOON,
  })

  it('keep their cover and order across a close, beside the pictures, never wiped with the sheet', async () => {
    const indexedDB = new IDBFactory()
    const first = openDatabase('hl2-galleries', { indexedDB, IDBKeyRange })
    await dexieGalleries('northside', { db: first }).saveAll([
      arranged('o1', 'parts:119'),
      arranged('o2', 'parts:787'),
    ])
    await dexieGalleries('northside', { db: first }).saveAll([arranged('o2', 'parts:787')])
    await dexieCatalogue('northside', { db: first }).wipe()
    first.close()

    const again = openDatabase('hl2-galleries', { indexedDB, IDBKeyRange })
    expect(await dexieGalleries('northside', { db: again }).all()).toEqual([
      arranged('o2', 'parts:787'),
    ])
    expect(await dexieGalleries('elsewhere', { db: again }).all()).toEqual([])
    again.close()
  })

  it('open beside a database written before galleries were arranged, which keeps its pictures', async () => {
    const indexedDB = new IDBFactory()
    /* version 3's own tables, opened by version 4 */
    const v3 = new Dexie('hl2-v3', { indexedDB, IDBKeyRange })
    v3.version(3).stores({ ownPictures: 'id, orgId' })
    await v3.table('ownPictures').put(picture('a', 'parts:119'))
    v3.close()
    const db = openDatabase('hl2-v3', { indexedDB, IDBKeyRange })
    expect(await dexieOwnPictures('northside', { db }).all()).toEqual([picture('a', 'parts:119')])
    expect(await dexieGalleries('northside', { db }).all()).toEqual([])
    db.close()
  })
})
