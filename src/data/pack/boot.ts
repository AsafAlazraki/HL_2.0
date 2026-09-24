import type { EntityDef, ModuleDef, RowData } from '@/domain/model'
import { mintModules } from '@/domain/modules/mint'
import type { CatalogueRepository } from '../repository'
import { loadAll, type LoadedPack } from './load'

/* ============================================================
   THE PACK MEETS THE DISK — the one seam between the file the app
   ships with and the database the browser keeps.

   THE TWO PLACES A SHEET COMES FROM, and the order they are asked
   in. `CatalogueMeta` is written LAST by `loadPack`, after every
   table has landed, so its presence means the whole pack is down
   there and nothing else does. Present: the sheet is read from the
   repository, and no JSON is fetched at all. Absent: the pack is
   read over the network once, filed table by table, and handed
   straight to the store so the first open does not wait for the
   write to finish being read back.

   WHY THE WRITE IS NOT FATAL. Reading the file and keeping the file
   are two different promises. A browser can refuse IndexedDB — a
   private window, a disk that is full, a person who cleared site
   data mid-session — and none of that makes the 15,691 rows we just
   read wrong. So a failed write returns the pack anyway with the
   sentence beside it, and the only thing lost is the speed of the
   next open. A failed READ is a different matter and is thrown: a
   sheet nobody could read is not a sheet, and the store turns it
   into the refusal a person can act on.

   NO MIGRATION LIVES HERE, and none may. A pack whose version
   differs from what is on the disk is a sentence for the owner, not
   an upgrade path — "no boot-time migrations or adoptions",
   docs/DECISIONS.md. Comparing the two versions is the Admin
   screen's job when it exists; this function's whole question is
   "is a sheet already down there".
   ============================================================ */

/** WHOSE SHEET THE SHIPPED PACK IS. Every record in `data/northside`
 *  carries `orgId: 'northside'`, and a repository is built for one
 *  business, so the app has to name one before it can ask whether a
 *  sheet is already down there — which is the one question that must
 *  be answered before anything is fetched.
 *
 *  It is a constant rather than a read because it is not derived from
 *  anything: it is who this build is for, Northside Marine and nobody
 *  else (docs/DECISIONS.md, 2026-09-23). The onboarding that would have
 *  minted a second business's key was cut before it was built; the key
 *  stays on every record because the shared backend of Milestone 6
 *  files Northside's records by it. `pack.dexie.test.ts` pins it
 *  against every record in the pack, so it cannot drift from the file
 *  it names. */
export const PACK_ORG_ID = 'northside'

/* ---------------------------------------------------------- */
/* The places, which are not in the pack                       */
/* ---------------------------------------------------------- */

/** A place's id, derived from its own name: 'Rates & Charges' becomes
 *  'place:rates-charges'.
 *
 *  DERIVED RATHER THAN MINTED, and that is the whole point. The
 *  default in `mintModules` is a fresh id, which is what the old
 *  store action did — and it means the places a dealer's quotes point
 *  at are new records every time the pack lands. A sheet wipe keeps
 *  the quotes ("your 3 quotes stay"), so the pack lands again under
 *  them, and a quote that named a place would find nothing where it
 *  looked. Same file, same nine ids, every time. */
const placeId = (name: string): string =>
  `place:${name
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '')}`

/**
 * THE NINE PLACES, MINTED FROM THE TABLE KEYS THAT LANDED.
 *
 * A module name is a business string — "Boats", "Rates & Charges" —
 * so the plan keeps the places out of the data and makes them app
 * code: "Modules and the two seeded flow rules are NOT data: the nine
 * places are minted by app code from table keys." This is that code's
 * one caller in the app, and `src/test/fixtures/pack.ts` is its other
 * one, so a suite and the browser see the same nine places.
 *
 * STAMPED WITH THE PACK'S OWN DATE rather than with now: a place
 * arrived when the file it was read out of arrived, and a second
 * landing of the same file then writes identical records instead of
 * records that differ only in when they were written.
 *
 * NO ITEM PAGE YET. `viewIdFor` is how a caller gives each place's
 * primary table a page, and minting a view is a WRITE the catalogue
 * store owns; the store is read-only until Milestone 2, so the places
 * list and do not open — which the contract already calls a
 * legitimate module rather than a broken one.
 */
export function mintPlaces(
  entities: Record<string, EntityDef>,
  rowsByEntity: Record<string, RowData[]>,
  options: { orgId: string; packedAt: string },
): ModuleDef[] {
  return mintModules(entities, rowsByEntity, {
    orgId: options.orgId,
    now: () => options.packedAt,
    id: (seed) => placeId(seed.name),
  })
}

/** The pack plus what the app makes of it on arrival: the nine
 *  places, which the file does not carry. It is a `PackSource` by
 *  shape, which is how the store takes it. */
export interface LandedPack extends LoadedPack {
  modules: ModuleDef[]
}

/** What the boot did, and what `catalogue.load` should be handed.
 *
 *  `source` is deliberately the union the store already accepts: a
 *  landed pack is a `PackSource` by shape, and a repository is the
 *  other half of `CatalogueSource`. Nothing here imports the store —
 *  `src/state` reads `src/data`, never the other way round. */
export interface OpenedCatalogue {
  source: CatalogueRepository | LandedPack
  /** where the sheet in `source` came from on this open */
  from: 'repository' | 'pack'
  /** the pack's own version when it was read now; the repository
   *  carries its own in `meta`, which the store reads */
  version: string | null
  /** set only when the pack was read but could not be kept — see the
   *  note above. The sheet is correct; the next open is simply not
   *  faster. */
  unkept?: string
}

export interface OpenOptions {
  /** how the pack is read — the network in the browser, the disk in
   *  a node suite. Injected so the seam can be tested without a
   *  fetch, which is the only reason this parameter exists. */
  read?: () => Promise<LoadedPack>
  /** when the sheet landed, for `meta.loadedAt`. The real clock when
   *  absent; a suite hands in a fixed one. */
  now?: () => string
}

export async function openCatalogue(
  repository: CatalogueRepository,
  options: OpenOptions = {},
): Promise<OpenedCatalogue> {
  const filed = await repository.meta.get()
  if (filed) return { source: repository, from: 'repository', version: filed.packVersion }

  const pack = await (options.read ?? loadAll)()
  const entitiesById: Record<string, EntityDef> = {}
  for (const entity of pack.entities) entitiesById[entity.id] = entity
  const modules = mintPlaces(entitiesById, pack.rowsByEntity, {
    orgId: repository.orgId,
    packedAt: pack.manifest.packedAt,
  })
  const landed: LandedPack = { ...pack, modules }

  try {
    /* THE MANIFEST IS NOT PASSED HERE, and that is the whole of the
       ordering. `loadPack` writes `meta` last when it is given one,
       and `meta` means "the whole sheet is down there" — so the
       places, which are part of the sheet and are not in the file,
       have to land before it is written, or a browser closed at the
       wrong moment would come back to a sheet with no doors and
       nothing saying so. */
    await repository.loadPack(pack.entities, pack.rowsByEntity)
    await repository.modules.putMany(modules)
    await repository.meta.put({
      id: repository.orgId,
      orgId: repository.orgId,
      packVersion: pack.manifest.version,
      packName: pack.manifest.name,
      loadedAt: (options.now ?? (() => new Date().toISOString()))(),
    })
  } catch (error) {
    return {
      source: landed,
      from: 'pack',
      version: pack.manifest.version,
      unkept: error instanceof Error ? error.message : String(error),
    }
  }
  return { source: landed, from: 'pack', version: pack.manifest.version }
}
