import type { ModuleDef, RoleDef } from './modules'
import type { CustomerDef } from './people'
import type { PriceLevel } from './pricing'
import type { OrgProfile } from './project'
import type { QuoteDef } from './quote'
import type { RowData } from './rows'
import type { ConstraintDef, DiscoveredRule, RuleDef } from './rules'
import type { EntityDef, GroupDef } from './tables'
import type { ViewDef } from './views'

/* ============================================================
   THE CATALOGUE, READ-ONLY, HANDED TO A PURE MODULE.

   The old app's pure logic read the store at the top of every event
   — `useProjectStore.getState()` fourteen times in `freeze.ts`, a
   `live()` helper six more, and a registry read for the constraints,
   the kept patterns, the quotes and the session. `pairs.ts` had
   already drawn the shape a pure module actually needs (`Ctx`:
   entities and rows); this is that shape, widened to every field a
   ported module reads today, so `src/domain` can be pure — no React,
   no store, no DOM — and a test can hand a module exactly the world
   it wants.

   IT IS A SNAPSHOT, NOT A SUBSCRIPTION. A caller takes one at the top
   of an event and passes it down; nothing in the domain holds one
   across events. Writes are callbacks the caller passes beside it.

   THE MAPS ARE THE STORE'S OWN SHAPES. `entities`, `groups`, `rules`,
   `views`, `modules` and `roles` are keyed by id because that is how
   every ported reader indexes them; the registries that were lists
   stay lists. Nothing is re-sorted on the way in.
   ============================================================ */

/** Who is asking — the second argument `mayDo` has always wanted.
 *  `roleId` is the `RoleDef` the session holds, or null for nobody
 *  in particular; an unrestricted module answers the same either
 *  way, and a restricted one refuses null with its sentence. */
export interface AccessCtx {
  roleId: string | null
}

export interface CatalogueCtx {
  /** the tenant key every record in this context carries, so a command that mints one can stamp it */
  orgId: string
  /** the organisation's profile — its name and its quote terms — or absent before onboarding */
  org?: OrgProfile
  /** every table, keyed by id, retired ones included */
  entities: Record<string, EntityDef>
  /** rows keyed by table id, in the sheet's own order, discontinued ones included */
  rowsByEntity: Record<string, RowData[]>
  /** whiteboard groups, keyed by id */
  groups: Record<string, GroupDef>
  /** the flow rules, keyed by id, disabled ones included */
  rules: Record<string, RuleDef>
  /** the view pages, keyed by id — what goes with what */
  views: Record<string, ViewDef>
  /** the places in the business, keyed by id */
  modules: Record<string, ModuleDef>
  /** the jobs at the dealership, keyed by id */
  roles: Record<string, RoleDef>
  /** who is asking, for `mayDo` */
  access: AccessCtx
  /** the sentence rules in force for this organisation, disabled ones included */
  constraintDefs: ConstraintDef[]
  /** what a person decided about each measured pattern — kept and dismissed */
  discoveredRules: DiscoveredRule[]
  /** declared price ladders keyed by table id — the same list a table carries on `EntityDef.priceLevels` */
  priceLevels: Record<string, PriceLevel[]>
  /** every quote, newest first, drafts and issued alike */
  quotes: QuoteDef[]
  /** the customer register as records, in the register's own order */
  customers: CustomerDef[]
  /** the clock, injected: ISO now. A pure module never calls `Date` itself */
  now: () => string
}

/** A context with every map and list filled in, for tests and for
 *  callers that hold only part of the world. Fields given are kept
 *  as given — nothing is copied or re-sorted — and `now` defaults to
 *  the real clock. `orgId` defaults to '' and that is an honest
 *  empty: a test that never names an organisation has none. */
export function makeCtx(partial: Partial<CatalogueCtx> = {}): CatalogueCtx {
  return {
    orgId: partial.orgId ?? '',
    ...(partial.org !== undefined ? { org: partial.org } : {}),
    entities: partial.entities ?? {},
    rowsByEntity: partial.rowsByEntity ?? {},
    groups: partial.groups ?? {},
    rules: partial.rules ?? {},
    views: partial.views ?? {},
    modules: partial.modules ?? {},
    roles: partial.roles ?? {},
    access: partial.access ?? { roleId: null },
    constraintDefs: partial.constraintDefs ?? [],
    discoveredRules: partial.discoveredRules ?? [],
    priceLevels: partial.priceLevels ?? {},
    quotes: partial.quotes ?? [],
    customers: partial.customers ?? [],
    now: partial.now ?? (() => new Date().toISOString()),
  }
}
