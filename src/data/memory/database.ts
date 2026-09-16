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
   THE IN-MEMORY DATABASE — one Map per table, the same tables the
   Dexie schema declares, so an adapter over it answers the contract
   suite the way the browser's does.

   IT IS WHAT EVERY VITEST SUITE USES. A suite that needs a
   repository makes one of these, hands it to `memoryRepositories`
   and throws it away; nothing is shared between files and nothing
   touches a disk. The Dexie adapter is proved by the contract suite
   under fake-indexeddb and by its own ledger tests, not by every
   suite in the tree paying for IndexedDB.

   RECORDS ARE CLONED ON THE WAY IN, because IndexedDB clones on the
   way in: a caller that mutates an object after filing it must see
   the same (unchanged) record come back from either adapter, or a
   test that passes here would fail in the browser.
   ============================================================ */

export interface MemoryDatabase {
  meta: Map<string, CatalogueMeta>
  tables: Map<string, EntityDef>
  rows: Map<string, RowData>
  groups: Map<string, GroupDef>
  rules: Map<string, RuleDef>
  views: Map<string, ViewDef>
  modules: Map<string, ModuleDef>
  roles: Map<string, RoleDef>
  constraintDefs: Map<string, ConstraintDef>
  discoveredRules: Map<string, DiscoveredRule>
  priceLevels: Map<string, PriceLevelRecord>
  quotes: Map<string, QuoteDef>
}

export function createMemoryDatabase(): MemoryDatabase {
  return {
    meta: new Map(),
    tables: new Map(),
    rows: new Map(),
    groups: new Map(),
    rules: new Map(),
    views: new Map(),
    modules: new Map(),
    roles: new Map(),
    constraintDefs: new Map(),
    discoveredRules: new Map(),
    priceLevels: new Map(),
    quotes: new Map(),
  }
}
