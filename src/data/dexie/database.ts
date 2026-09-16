import Dexie, { type DexieOptions, type Table } from 'dexie'
import type {
  ConstraintDef,
  DiscoveredRule,
  EntityDef,
  GroupDef,
  ModuleDef,
  PriceLevelRecord,
  QuoteDef,
  RoleDef,
  RowData,
  RuleDef,
  ViewDef,
} from '@/domain/model'
import type { CatalogueMeta } from '../repository'

/* ============================================================
   THE LOCAL DATABASE — Dexie 4 over IndexedDB, VERSION 1 ONLY.

   The old database reached version 4 by adding a table per release
   and ran six one-shot adoptions at boot to repair what it had
   outgrown. This one starts fresh with every table the contract
   names, `orgId` on every record, and no `upgrade()` anywhere: the
   first migration added here is a design smell to argue about
   (docs/DECISIONS.md, "No boot-time migrations or adoptions").

   `id` IS THE KEY ON EVERY TABLE, and `orgId` is indexed on every
   table so a repository built for one organisation lists only its
   own. Rows carry a compound `[orgId+entityId]` index because "the
   rows of this table" is the one query the sheet asks on every open,
   and a plain `entityId` index would fetch every organisation's and
   filter.

   ONLY `src/data/dexie` IMPORTS DEXIE (`tools/check.ts` enforces it).
   The repositories in `repositories.ts` are the only readers of this
   handle; nothing above the seam sees a table.
   ============================================================ */

/** A table whose key is the record's own `id`, inserted whole. Spelled
 *  out rather than `EntityTable<T, 'id'>` because that alias derives
 *  the insert type through a mapped type a class generic over T
 *  cannot resolve; the key is a string and the record is the record. */
export type Records<T> = Table<T, string, T>

/** THE TABLE OF TABLES IS CALLED `tableDefs`, not `tables`: Dexie
 *  itself owns a `tables` getter (every store, as a list) and will not
 *  place an accessor over a name its prototype already answers, so a
 *  store called `tables` would read back as that list. The seam above
 *  still says `repository.tables`; only the IndexedDB name differs. */
export type HLDatabase = Dexie & {
  meta: Records<CatalogueMeta>
  tableDefs: Records<EntityDef>
  rows: Records<RowData>
  groups: Records<GroupDef>
  rules: Records<RuleDef>
  views: Records<ViewDef>
  modules: Records<ModuleDef>
  roles: Records<RoleDef>
  constraintDefs: Records<ConstraintDef>
  discoveredRules: Records<DiscoveredRule>
  priceLevels: Records<PriceLevelRecord>
  quotes: Records<QuoteDef>
}

/** The name the browser files the database under. */
export const DATABASE_NAME = 'hl2'

/** Open (lazily — Dexie connects on first use) a database of this
 *  schema. `options` lets a test hand in fake-indexeddb's factory so
 *  each suite gets its own isolated store; the browser passes none
 *  and Dexie finds `indexedDB` on the window. */
export function openDatabase(name: string = DATABASE_NAME, options: DexieOptions = {}): HLDatabase {
  const db = new Dexie(name, options) as HLDatabase
  db.version(1).stores({
    meta: 'id, orgId',
    tableDefs: 'id, orgId',
    rows: 'id, orgId, entityId, [orgId+entityId]',
    groups: 'id, orgId',
    rules: 'id, orgId',
    views: 'id, orgId',
    modules: 'id, orgId',
    roles: 'id, orgId',
    constraintDefs: 'id, orgId',
    discoveredRules: 'id, orgId',
    priceLevels: 'id, orgId',
    quotes: 'id, orgId',
  })
  return db
}

/** The catalogue's tables, in one list, so the wipe and the write
 *  reach every one of them and never the quotes. */
export const CATALOGUE_TABLES = [
  'meta',
  'tableDefs',
  'rows',
  'groups',
  'rules',
  'views',
  'modules',
  'roles',
  'constraintDefs',
  'discoveredRules',
  'priceLevels',
] as const satisfies ReadonlyArray<Exclude<keyof HLDatabase, keyof Dexie | 'quotes'>>
