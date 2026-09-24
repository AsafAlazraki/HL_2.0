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

/** A FILE OF THE PACK THE SERVER ANSWERED FOR AND DID NOT HAND OVER — a
 *  404, a 500. It is its own kind, carrying the status, because the door
 *  says something different about it: a computer that is offline is told
 *  to go online and press again, and a file the server says is not there
 *  (404, 410) will not be found by pressing again (2026-09-25). */
export class PackFileUnserved extends Error {
  readonly file: string
  readonly status: number
  constructor(
    file: string,
    status: number,
    message = `The pack has no ${file} — the server answered ${status}.`,
  ) {
    super(message)
    this.name = 'PackFileUnserved'
    this.file = file
    this.status = status
  }
}

/** A FILE OF THE PACK THE REQUEST FOR WHICH NEVER REACHED A SERVER — the
 *  computer is offline, or the network dropped: `fetch` itself rejected.
 *  Its own kind for the same reason as the one above, and because the
 *  platform's own rejection is a bare TypeError, which a fault in the
 *  app's own code also throws; the door tells a person to go online only
 *  when the loader says the request went nowhere (2026-09-25). */
export class PackUnreachable extends Error {
  readonly file: string
  constructor(file: string, cause: unknown) {
    super(
      `The pack's ${file} could not be reached: ${cause instanceof Error ? cause.message : String(cause)}`,
      { cause },
    )
    this.name = 'PackUnreachable'
    this.file = file
  }
}

async function getJson<T>(rel: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(BASE + rel)
  } catch (error) {
    throw new PackUnreachable(rel, error)
  }
  if (!res.ok) throw new PackFileUnserved(rel, res.status)
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
