import { createStore, type StoreApi } from 'zustand/vanilla'
import type {
  CatalogueCtx,
  ConstraintDef,
  DiscoveredRule,
  EntityDef,
  GroupDef,
  ModuleDef,
  PackManifest,
  PriceLevel,
  RoleDef,
  RowData,
  RuleDef,
  ViewDef,
} from '@/domain/model'
import type { CatalogueRepository } from '@/data/repository'

/* ============================================================
   THE CATALOGUE STORE — the sheet and its registries, in memory,
   READ-ONLY IN MILESTONE 1. Milestone 2 adds the named commands
   (updateCell, addRow, deleteRow, addColumn, rename, retype) with
   inverses and `commit(op, fn)`; nothing here is a mutator.

   IT LOADS FROM TWO PLACES AND HOLDS ONE SHAPE. From the pack, once,
   the first time the app opens (the pack is then written to the
   repository by whoever loaded it); from the repository on every open
   after that. Either way the state below is what a screen reads and
   what `ctxFrom` hands to a pure module.

   ORDER. Loaded from the pack, rows keep the pack's own order —
   nothing is re-sorted on the way in. Loaded from a repository,
   which promises no order, rows are put back in the sheet's order by
   `rowOrder`: `createdAt` first, then the id with numbers compared
   as numbers, so the pack's `key:ordinal` ids ('boat_stacer:2'
   before 'boat_stacer:10') come back as the sheet wrote them and a
   row a person adds later lands at the end.
   ============================================================ */

export type CatalogueStatus = 'empty' | 'loading' | 'ready' | 'failed'

export interface CatalogueIndex {
  /** every row by its id, so "open this row" never scans a table */
  rowById: Readonly<Record<string, RowData>>
}

/** The pack, or any set of tables with their rows, handed in whole.
 *
 *  `modules` is here because the pack does not carry the places: a
 *  module name is a business string, so the plan mints the nine from
 *  table keys in app code when the file lands (`@/data/pack/boot`)
 *  and files them beside the tables. A source that carries them hands
 *  the store the same sheet the repository would give back on the
 *  next open; a source that does not is a sheet with no doors, which
 *  is the honest answer for a blank file. */
export interface PackSource {
  entities: readonly EntityDef[]
  rowsByEntity: Readonly<Record<string, readonly RowData[]>>
  manifest?: PackManifest
  modules?: readonly ModuleDef[]
}

export type CatalogueSource = CatalogueRepository | PackSource

export interface CatalogueData {
  /** the pack version the sheet came from; null before a load or where no pack made it */
  version: string | null
  /** every table by id, retired ones included */
  tables: Readonly<Record<string, EntityDef>>
  /** rows by table id, in the sheet's order, discontinued ones included */
  rows: Readonly<Record<string, RowData[]>>
  index: CatalogueIndex
  groups: Readonly<Record<string, GroupDef>>
  rules: Readonly<Record<string, RuleDef>>
  views: Readonly<Record<string, ViewDef>>
  modules: Readonly<Record<string, ModuleDef>>
  roles: Readonly<Record<string, RoleDef>>
  constraintDefs: readonly ConstraintDef[]
  discoveredRules: readonly DiscoveredRule[]
  /** declared ladders by table id */
  priceLevels: Readonly<Record<string, PriceLevel[]>>
}

export interface CatalogueState extends CatalogueData {
  status: CatalogueStatus
  /** the sentence, when `status` is 'failed'; null otherwise */
  problem: string | null
  load(source: CatalogueSource): Promise<void>
}

export type CatalogueStore = StoreApi<CatalogueState>

/* ---------------------------------------------------------- */
/* Selectors                                                  */
/* ---------------------------------------------------------- */

/** ON THE PACK A TABLE'S ID IS ITS SEED KEY ('boat_stacer'), so
 *  looking a table up by key is looking it up by id. A table a person
 *  makes has no seed key and nobody asks `byKey` for one. */
export const byKey = (state: CatalogueData, key: string): EntityDef | undefined => state.tables[key]

export const byId = (state: CatalogueData, rowId: string): RowData | undefined =>
  state.index.rowById[rowId]

/** the table a row belongs to, through the row's own `entityId` */
export const tableOf = (state: CatalogueData, rowId: string): EntityDef | undefined => {
  const row = byId(state, rowId)
  return row ? state.tables[row.entityId] : undefined
}

/** The part of a `CatalogueCtx` the catalogue owns, by reference —
 *  the caller adds `orgId`, `access`, `quotes`, `customers` and the
 *  clock through `makeCtx`. */
export function ctxFrom(
  state: CatalogueData,
): Pick<
  CatalogueCtx,
  | 'entities'
  | 'rowsByEntity'
  | 'groups'
  | 'rules'
  | 'views'
  | 'modules'
  | 'roles'
  | 'constraintDefs'
  | 'discoveredRules'
  | 'priceLevels'
> {
  return {
    entities: state.tables as Record<string, EntityDef>,
    rowsByEntity: state.rows as Record<string, RowData[]>,
    groups: state.groups as Record<string, GroupDef>,
    rules: state.rules as Record<string, RuleDef>,
    views: state.views as Record<string, ViewDef>,
    modules: state.modules as Record<string, ModuleDef>,
    roles: state.roles as Record<string, RoleDef>,
    constraintDefs: state.constraintDefs as ConstraintDef[],
    discoveredRules: state.discoveredRules as DiscoveredRule[],
    priceLevels: state.priceLevels as Record<string, PriceLevel[]>,
  }
}

/* ---------------------------------------------------------- */
/* Loading                                                     */
/* ---------------------------------------------------------- */

const numeric = new Intl.Collator('en', { numeric: true })

/** the sheet's order, recovered from a repository that promises none */
export const rowOrder = (a: RowData, b: RowData): number =>
  a.createdAt.localeCompare(b.createdAt) || numeric.compare(a.id, b.id)

const byIdMap = <T extends { id: string }>(items: readonly T[]): Record<string, T> => {
  const out: Record<string, T> = {}
  for (const item of items) out[item.id] = item
  return out
}

const indexRows = (rows: Readonly<Record<string, readonly RowData[]>>): CatalogueIndex => {
  const rowById: Record<string, RowData> = {}
  for (const list of Object.values(rows)) for (const row of list) rowById[row.id] = row
  return { rowById }
}

const empty = (): CatalogueData => ({
  version: null,
  tables: {},
  rows: {},
  index: { rowById: {} },
  groups: {},
  rules: {},
  views: {},
  modules: {},
  roles: {},
  constraintDefs: [],
  discoveredRules: [],
  priceLevels: {},
})

function fromPack(source: PackSource): CatalogueData {
  const rows: Record<string, RowData[]> = {}
  const priceLevels: Record<string, PriceLevel[]> = {}
  for (const entity of source.entities) {
    rows[entity.id] = [...(source.rowsByEntity[entity.id] ?? [])]
    if (entity.priceLevels && entity.priceLevels.length > 0) {
      priceLevels[entity.id] = entity.priceLevels
    }
  }
  return {
    ...empty(),
    version: source.manifest?.version ?? null,
    tables: byIdMap(source.entities),
    rows,
    index: indexRows(rows),
    modules: byIdMap(source.modules ?? []),
    priceLevels,
  }
}

async function fromRepository(repository: CatalogueRepository): Promise<CatalogueData> {
  const [
    meta,
    entities,
    allRows,
    groups,
    rules,
    views,
    modules,
    roles,
    constraintDefs,
    discoveredRules,
    ladders,
  ] = await Promise.all([
    repository.meta.get(),
    repository.tables.all(),
    repository.rows.all(),
    repository.groups.all(),
    repository.rules.all(),
    repository.views.all(),
    repository.modules.all(),
    repository.roles.all(),
    repository.constraintDefs.all(),
    repository.discoveredRules.all(),
    repository.priceLevels.all(),
  ])
  const rows: Record<string, RowData[]> = {}
  for (const entity of entities) rows[entity.id] = []
  for (const row of allRows) (rows[row.entityId] ??= []).push(row)
  for (const list of Object.values(rows)) list.sort(rowOrder)
  const priceLevels: Record<string, PriceLevel[]> = {}
  /* the filed ladder wins; a table that declares one and has no record
     yet (a table made before the Levels screen filed it) still reads */
  for (const entity of entities) {
    if (entity.priceLevels && entity.priceLevels.length > 0) {
      priceLevels[entity.id] = entity.priceLevels
    }
  }
  for (const ladder of ladders) priceLevels[ladder.tableId] = ladder.levels
  return {
    version: meta?.packVersion ?? null,
    tables: byIdMap(entities),
    rows,
    index: indexRows(rows),
    groups: byIdMap(groups),
    rules: byIdMap(rules),
    views: byIdMap(views),
    modules: byIdMap(modules),
    roles: byIdMap(roles),
    constraintDefs,
    discoveredRules,
    priceLevels,
  }
}

const isPack = (source: CatalogueSource): source is PackSource => 'entities' in source

export function createCatalogueStore(): CatalogueStore {
  return createStore<CatalogueState>()((set) => ({
    ...empty(),
    status: 'empty',
    problem: null,
    load: async (source) => {
      set({ status: 'loading', problem: null })
      try {
        const data = isPack(source) ? fromPack(source) : await fromRepository(source)
        set({ ...data, status: 'ready', problem: null })
      } catch (error) {
        /* a failed load leaves NOTHING behind: showing the previous
           sheet under a failure would be showing it as current */
        set({
          ...empty(),
          status: 'failed',
          problem: error instanceof Error ? error.message : String(error),
        })
      }
    },
  }))
}

/** The app's catalogue. */
export const catalogue: CatalogueStore = createCatalogueStore()
