/* ============================================================
   NORTHSIDE'S SETTINGS, AGAINST THE REAL STORE (Milestone 4).

   The settings ride the catalogue's own stack, so these are the
   catalogue's promises said of them: a change is one step with its
   Undo; it is written beside the sheet and read back on the next open;
   undoing the first change forgets the profile on disk as well as on
   screen; and a person Northside has set apart is refused a price or a
   setting with a sentence, while anybody else is not.
   ============================================================ */
import { beforeEach, describe, expect, it } from 'vitest'
import type { EntityDef, PackManifest, RowData } from '@/domain/model'
import { isDone, updateCell } from '@/domain/catalogue/commands'
import { NO_BUSINESS, changeOrg, withKey } from '@/domain/catalogue/orgCommands'
import { createMemoryDatabase, type MemoryDatabase } from '@/data/memory/database'
import { memoryCatalogue, memoryOrg } from '@/data/memory/repositories'
import { createCatalogueStore, ctxFrom, type CatalogueStore } from './catalogue'

const ISO = '2026-10-29T00:00:00.000Z'

const boats = (): EntityDef => ({
  id: 'e-boats',
  orgId: 'northside',
  name: 'Boats',
  accent: 'blue',
  kind: 'boat',
  position: { x: 0, y: 0 },
  fields: [{ id: 'f-name', name: 'Name', type: 'text' }],
  createdAt: ISO,
  updatedAt: ISO,
})
const row: RowData = {
  id: 'r1',
  orgId: 'northside',
  entityId: 'e-boats',
  values: { 'f-name': 'SP 560' },
  createdAt: ISO,
  updatedAt: ISO,
}
const manifest = { name: 'Northside Marine', version: 't' } as PackManifest

let db: MemoryDatabase
let who: string | null
let store: CatalogueStore

const make = (): CatalogueStore =>
  createCatalogueStore({
    now: () => ISO,
    writeBehindMs: 0,
    orgFor: (orgId) => memoryOrg(orgId, { db }),
    asking: () => who,
  })

async function open(s: CatalogueStore): Promise<void> {
  await s
    .getState()
    .load(
      { entities: [boats()], rowsByEntity: { 'e-boats': [row] }, manifest },
      { writeTo: memoryCatalogue('northside', { db }) },
    )
}

const setAbn = (abn: string | undefined) =>
  changeOrg('ABN set', 'abn', (o) => withKey(o, 'abn', abn))

beforeEach(async () => {
  db = createMemoryDatabase()
  who = 'Asaf'
  store = make()
  await open(store)
})

describe('a setting is one step, kept beside the sheet', () => {
  it('starts from the business the price list names, and keeps the change', async () => {
    expect(store.getState().org).toBeUndefined()
    const done = store.getState().apply(setAbn('51 824 753 556'))
    expect(isDone(done)).toBe(true)
    expect(store.getState().org).toMatchObject({ name: 'Northside Marine', abn: '51 824 753 556' })
    await store.getState().flush()
    expect((await memoryOrg('northside', { db }).get())?.abn).toBe('51 824 753 556')
  })

  it('is read back on the next open, and reaches what a quote is started with', async () => {
    store.getState().apply(changeOrg('GST set', 'gstRate', (o) => withKey(o, 'gstRate', 10)))
    await store.getState().flush()
    const again = make()
    await open(again)
    expect(again.getState().org?.gstRate).toBe(10)
    expect(ctxFrom(again.getState()).org?.gstRate).toBe(10)
  })

  it('is read at boot without opening the sheet', async () => {
    store.getState().apply(setAbn('51 824 753 556'))
    await store.getState().flush()
    const boot = make()
    await boot.getState().readOrg('northside')
    expect(boot.getState().org?.abn).toBe('51 824 753 556')
    expect(boot.getState().status).toBe('empty')
  })

  it('goes back with one Undo, and the first change undone forgets the profile on disk too', async () => {
    const done = store.getState().apply(setAbn('51 824 753 556'))
    if (!isDone(done)) throw new Error('refused')
    await store.getState().flush()
    const back = store.getState().undo(done.event.id)
    expect(isDone(back)).toBe(true)
    expect(store.getState().org).toBeUndefined()
    await store.getState().flush()
    expect(await memoryOrg('northside', { db }).get()).toBeUndefined()
  })

  it('a change that changes nothing is no step', () => {
    store.getState().apply(setAbn('51 824 753 556'))
    const again = store.getState().apply(setAbn('51 824 753 556'))
    expect(again).toEqual({ refused: '' })
  })

  it('says so where no price list names a business', async () => {
    const blank = make()
    await blank.getState().load(
      { entities: [boats()], rowsByEntity: {} },
      {
        writeTo: memoryCatalogue('northside', { db }),
      },
    )
    expect(blank.getState().apply(setAbn('51 824 753 556'))).toEqual({ refused: NO_BUSINESS })
  })
})

describe('the one switch, enforced where prices and settings change', () => {
  beforeEach(() => {
    store.getState().apply(
      changeOrg('people', 'people', (o) => ({
        ...o,
        people: [
          { id: 'a', name: 'Asaf' },
          { id: 'm', name: 'Mia', mayChange: false },
        ],
      })),
    )
  })

  it('refuses a person set apart a price and a setting, with the sentence and who may', () => {
    who = 'Mia'
    const sentence =
      'Mia is set apart from changing prices and settings, so nothing was changed. Asaf may.'
    expect(store.getState().apply(updateCell('e-boats', 'r1', 'f-name', 'SP 600'))).toEqual({
      refused: sentence,
    })
    expect(store.getState().apply(setAbn('51 824 753 556'))).toEqual({ refused: sentence })
    expect(store.getState().rows['e-boats']?.[0]?.values['f-name']).toBe('SP 560')
  })

  it('lets anybody else, a name nobody listed included', () => {
    who = 'A visitor'
    expect(isDone(store.getState().apply(updateCell('e-boats', 'r1', 'f-name', 'SP 600')))).toBe(
      true,
    )
    who = 'Asaf'
    expect(isDone(store.getState().apply(setAbn('51 824 753 556')))).toBe(true)
  })
})
