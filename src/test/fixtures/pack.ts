/// <reference types="node" />
/* ============================================================
   THE REAL PACK, ONCE PER WORKER, FOR EVERY NODE SUITE.

   The old tests built the seed with `buildNorthsideProject()`; a
   ported test loads this instead. It reads `data/northside/` off the
   disk — the same files the browser fetches — and hands back the
   manifest, the tables, the rows, the image ledger and a
   `CatalogueCtx` built with `makeCtx`, so a pure module can be
   handed exactly the world the old app loaded. Cached per worker:
   the first call reads ~10 MB of JSON, every later call returns the
   same promise.

   THE CONTEXT CARRIES NO ORGANISATION PROFILE. The pack has no
   `OrgProfile` — onboarding mints it — so `ctx.org` is absent, which
   is the honest empty; `orgId` is 'northside' because every record
   in the pack carries it.

   The `node` types reference is deliberate: `tsconfig.app.json` lists
   only `vite/client` under `types`, and this file is the one place
   under `src/` that reads the disk. It runs under vitest's node
   project and is never imported by app code.
   ============================================================ */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  makeCtx,
  type CatalogueCtx,
  type EntityDef,
  type PackManifest,
  type PriceLevel,
  type RowData,
} from '@/domain/model'
import type { PackImageEntry, PackImagesFile } from '@/data/pack/images'

export interface PackFixture {
  manifest: PackManifest
  entities: EntityDef[]
  rowsByEntity: Record<string, RowData[]>
  images: PackImageEntry[]
  ctx: CatalogueCtx
  /** a table by its seed key, which on the pack is its id */
  byKey(seedKey: string): EntityDef
  /** where the pack was read from, for a test that checks the files */
  dataDir: string
  /** where the held pictures are */
  imagesDir: string
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const DATA = path.join(ROOT, 'data', 'northside')
const IMAGES = path.join(ROOT, 'public', 'seed-images')

const readJson = <T>(rel: string): T => JSON.parse(readFileSync(path.join(DATA, rel), 'utf8')) as T

function read(): PackFixture {
  const manifest = readJson<PackManifest>('manifest.json')
  const entities = readJson<EntityDef[]>('entities.json')
  const rowsByEntity: Record<string, RowData[]> = {}
  for (const t of manifest.tables) rowsByEntity[t.id] = readJson<RowData[]>(t.file)
  const images = readJson<PackImagesFile>(manifest.images.file).images

  const byId: Record<string, EntityDef> = {}
  for (const e of entities) byId[e.id] = e
  const priceLevels: Record<string, PriceLevel[]> = {}
  for (const t of manifest.tables) priceLevels[t.id] = t.priceLevels ?? []

  const ctx = makeCtx({ orgId: 'northside', entities: byId, rowsByEntity, priceLevels })

  return {
    manifest,
    entities,
    rowsByEntity,
    images,
    ctx,
    byKey: (seedKey) => {
      const hit = byId[seedKey]
      if (!hit) throw new Error(`the pack has no table keyed ${seedKey}`)
      return hit
    },
    dataDir: DATA,
    imagesDir: IMAGES,
  }
}

let cached: Promise<PackFixture> | undefined

export function loadPack(): Promise<PackFixture> {
  cached ??= Promise.resolve().then(read)
  return cached
}
