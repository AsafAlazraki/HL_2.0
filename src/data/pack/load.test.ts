/// <reference types="node" />
/* ============================================================
   THE BROWSER LOADER, PROVED AGAINST THE FILES ON DISK.

   `fetch` is stubbed to answer `/data/northside/…` from the folder
   the packer wrote, which is exactly what the `servePack` plugin does
   for the dev server — so this proves the loader reads the manifest,
   files every table under its id, refuses an unknown key with a
   sentence, and asks for each file once.
   ============================================================ */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  PackFileUnserved,
  PackUnreachable,
  loadAll,
  loadEntities,
  loadImages,
  loadManifest,
  loadTable,
} from './load'

const DATA = path.resolve(process.cwd(), 'data', 'northside')
const requested: string[] = []

beforeEach(() => {
  requested.length = 0
  vi.stubGlobal('fetch', (input: string | URL | Request): Promise<Response> => {
    const url = String(input)
    requested.push(url)
    const rel = url.replace(/^\/data\/northside\//, '')
    const file = path.join(DATA, rel)
    if (!existsSync(file)) return Promise.resolve(new Response('no such file', { status: 404 }))
    return Promise.resolve(
      new Response(readFileSync(file), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }),
    )
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('the loader', () => {
  it('reads the manifest from where the plugin serves it', async () => {
    const manifest = await loadManifest()
    expect(manifest.counts.tables).toBe(53)
    expect(requested).toEqual(['/data/northside/manifest.json'])
  })

  it('reads one table by its seed key, from the file the manifest names', async () => {
    const rows = await loadTable('boat_stacer')
    expect(rows.length).toBe(91)
    expect(rows[0].id).toBe('boat_stacer:1')
    expect(requested).toEqual([
      '/data/northside/manifest.json',
      '/data/northside/tables/boat_stacer.json',
    ])
  })

  it('refuses a key the manifest does not list, with the sentence', async () => {
    await expect(loadTable('nope')).rejects.toThrow('The pack has no table keyed nope.')
  })

  it('says which file is missing when the server has none', async () => {
    const manifest = await loadManifest()
    const broken = { ...manifest, tables: [{ ...manifest.tables[0], file: 'tables/gone.json' }] }
    await expect(loadTable('boat_stacer', broken)).rejects.toThrow(
      'The pack has no tables/gone.json — the server answered 404.',
    )
  })

  /* THE DOOR TELLS A MISSING FILE FROM AN UNREACHABLE ONE (2026-09-25), and it can
     only do that if the loader says which it was: a file the server answered for and
     did not hand over is its own kind, carrying the file and the status. */
  it('files a missing file as its own kind, with the file and the status', async () => {
    const manifest = await loadManifest()
    const broken = { ...manifest, tables: [{ ...manifest.tables[0], file: 'tables/gone.json' }] }
    const thrown = await loadTable('boat_stacer', broken).catch((error: unknown) => error)
    expect(thrown).toBeInstanceOf(PackFileUnserved)
    expect(thrown).toMatchObject({ file: 'tables/gone.json', status: 404 })
  })

  /* A REQUEST THAT WENT NOWHERE IS ITS OWN KIND TOO (the verifier's round, 2026-09-25): the
     platform rejects it as a bare TypeError, which the app's own code can also throw, so the
     door may only tell a person to go online when the loader says the request never landed. */
  it('files a request that never reached a server as its own kind, with the file', async () => {
    vi.stubGlobal('fetch', () => Promise.reject(new TypeError('Failed to fetch')))
    const thrown = await loadEntities().catch((error: unknown) => error)
    expect(thrown).toBeInstanceOf(PackUnreachable)
    expect(thrown).toMatchObject({ file: 'entities.json' })
    expect((thrown as Error).cause).toBeInstanceOf(TypeError)
  })

  it('loads everything, filed by table id, asking for each file once', async () => {
    const { manifest, entities, rowsByEntity } = await loadAll()
    expect(entities.length).toBe(53)
    expect(Object.keys(rowsByEntity).length).toBe(53)
    let rows = 0
    for (const t of manifest.tables) rows += rowsByEntity[t.id].length
    expect(rows).toBe(manifest.counts.rows)
    expect(new Set(requested).size).toBe(requested.length)
    expect(requested.length).toBe(2 + manifest.tables.length)
  })

  it('reads the entities and the image ledger as their own files', async () => {
    const entities = await loadEntities()
    expect(entities.map((e) => e.id)).toContain('boat_highfield')
    const images = await loadImages()
    expect(images.length).toBeGreaterThan(400)
    expect(images.every((e) => e.licenceNote.length > 0)).toBe(true)
  })
})
