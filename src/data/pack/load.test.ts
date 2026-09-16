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
import { loadAll, loadEntities, loadImages, loadManifest, loadTable } from './load'

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
