import type { EntityDef, PackManifest, RowData } from '@/domain/model'
import type { PackImageEntry, PackImagesFile } from './images'

/* ============================================================
   THE PACK, READ BY THE BROWSER.

   The source of truth is `data/northside/` at the repository root.
   Vite serves it at `/data/northside/…` through the `servePack`
   plugin in `tools/seed/servePack.ts` — a middleware in dev, and the
   same files emitted into `dist/data/northside/` at build — so the
   pack is never copied into `public/` where a second copy could go
   stale. Nothing here parses a row: the files are JSON, the fetch is
   plain, and every table is one request, so a screen that wants the
   boats first asks for the boats first.

   `entities.json` sits beside the manifest by convention: the
   manifest lists the tables and where each one's rows are, and the
   table definitions themselves — fields, sections, hierarchy, the
   declared price ladder — are one file so a screen can draw every
   header before a single row has landed.
   ============================================================ */

const BASE = `${import.meta.env.BASE_URL}data/northside/`

async function getJson<T>(rel: string): Promise<T> {
  const res = await fetch(BASE + rel)
  if (!res.ok) throw new Error(`The pack has no ${rel} — the server answered ${res.status}.`)
  return (await res.json()) as T
}

export const loadManifest = (): Promise<PackManifest> => getJson<PackManifest>('manifest.json')

export const loadEntities = (): Promise<EntityDef[]> => getJson<EntityDef[]>('entities.json')

/** One table's rows, by seed key. The manifest names the file; a key
 *  the manifest does not list is refused with the sentence rather
 *  than a 404 nobody reads. */
export async function loadTable(key: string, manifest?: PackManifest): Promise<RowData[]> {
  const m = manifest ?? (await loadManifest())
  const table = m.tables.find((t) => t.key === key)
  if (!table) throw new Error(`The pack has no table keyed ${key}.`)
  return getJson<RowData[]>(table.file)
}

export async function loadImages(): Promise<PackImageEntry[]> {
  const doc = await getJson<PackImagesFile>('images.json')
  return doc.images
}

export interface LoadedPack {
  manifest: PackManifest
  entities: EntityDef[]
  rowsByEntity: Record<string, RowData[]>
}

/** Everything, in manifest order. The tables are fetched in parallel
 *  and filed by id, which on the pack is the seed key. */
export async function loadAll(): Promise<LoadedPack> {
  const manifest = await loadManifest()
  const [entities, tables] = await Promise.all([
    loadEntities(),
    Promise.all(manifest.tables.map((t) => loadTable(t.key, manifest))),
  ])
  const rowsByEntity: Record<string, RowData[]> = {}
  manifest.tables.forEach((t, i) => {
    rowsByEntity[t.id] = tables[i]
  })
  return { manifest, entities, rowsByEntity }
}
