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

   IT DOES CARRY THE NINE PLACES, and they are not in the pack either.
   A module name is a business string, so the plan keeps the places
   out of the data and mints them from table keys in app code
   (`@/domain/modules/mint`); the browser mints them once, when the
   pack lands, and files them beside the tables
   (`@/data/pack/boot`). A suite handed a context with no places is
   handed a world the app never runs in — `quoteDoors` finds no door,
   and the quote cannot be started at all. So the fixture mints them
   with the SAME function the app calls, off the same table keys,
   rather than writing nine module records here: nine records written
   into a test file would be invented data, and the names, the
   descriptions and the verbs are the dealer's.

   Two arguments the app leaves to chance are pinned here, because a
   fixture must read the same in every worker: the id is derived from
   the place's own name instead of being freshly minted, and the
   stamp is the moment the pack was packed instead of now.

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
  type ModuleDef,
  type PackManifest,
  type PriceLevel,
  type RowData,
} from '@/domain/model'
import type { PackImageEntry, PackImagesFile } from '@/data/pack/images'
import { mintPlaces } from '@/data/pack/boot'

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

  const places = mintPlaces(byId, rowsByEntity, {
    orgId: 'northside',
    packedAt: manifest.packedAt,
  })
  const modules: Record<string, ModuleDef> = {}
  for (const place of places) modules[place.id] = place

  const ctx = makeCtx({
    orgId: 'northside',
    entities: byId,
    rowsByEntity,
    modules,
    priceLevels,
  })

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
