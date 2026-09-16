import type { EntityDef, PackManifest, QuoteDef, RowData } from '@/domain/model'
import {
  assertOurs,
  newestFirst,
  refusals,
  type CatalogueMeta,
  type CatalogueRepository,
  type Filed,
  type QuoteRepository,
  type RecordStore,
  type RowStore,
} from '../repository'
import { createMemoryDatabase, type MemoryDatabase } from './database'

/* ============================================================
   THE MEMORY ADAPTER. Every method resolves on the next microtask,
   like the Dexie one, so a caller that forgets to await fails here
   too rather than only in the browser.
   ============================================================ */

const clone = <T>(record: T): T => structuredClone(record)

class MemoryStore<T extends Filed> implements RecordStore<T> {
  constructor(
    protected readonly map: Map<string, T>,
    protected readonly orgId: string,
    protected readonly what: string,
  ) {}

  protected ours(): T[] {
    const out: T[] = []
    for (const record of this.map.values()) if (record.orgId === this.orgId) out.push(record)
    return out
  }

  async all(): Promise<T[]> {
    return this.ours()
  }

  async get(id: string): Promise<T | undefined> {
    const record = this.map.get(id)
    return record && record.orgId === this.orgId ? record : undefined
  }

  async put(record: T): Promise<void> {
    assertOurs(this.what, [record], this.orgId)
    this.map.set(record.id, clone(record))
  }

  async putMany(records: readonly T[]): Promise<void> {
    assertOurs(this.what, records, this.orgId)
    for (const record of records) this.map.set(record.id, clone(record))
  }

  async patch(id: string, changes: Partial<Omit<T, 'id' | 'orgId'>>): Promise<T> {
    const existing = await this.get(id)
    if (!existing) throw new Error(refusals.missing(this.what, id, this.orgId))
    const merged = { ...existing, ...clone(changes), id, orgId: this.orgId } as T
    this.map.set(id, merged)
    return merged
  }

  async delete(id: string): Promise<void> {
    const record = this.map.get(id)
    if (!record) return
    assertOurs(this.what, [record], this.orgId)
    this.map.delete(id)
  }

  async deleteMany(ids: readonly string[]): Promise<void> {
    /* the whole batch or none of it, as the Dexie transaction does */
    const found = ids.map((id) => this.map.get(id)).filter((x): x is T => x !== undefined)
    assertOurs(this.what, found, this.orgId)
    for (const record of found) this.map.delete(record.id)
  }

  async saveAll(next: readonly T[]): Promise<void> {
    assertOurs(this.what, next, this.orgId)
    for (const record of this.ours()) this.map.delete(record.id)
    for (const record of next) this.map.set(record.id, clone(record))
  }

  /** everything of ours, gone — the wipe */
  clear(): void {
    for (const record of this.ours()) this.map.delete(record.id)
  }
}

class MemoryRowStore extends MemoryStore<RowData> implements RowStore {
  async ofTable(tableId: string): Promise<RowData[]> {
    return this.ours().filter((row) => row.entityId === tableId)
  }
}

class MemoryCatalogueRepository implements CatalogueRepository {
  readonly tables: MemoryStore<EntityDef>
  readonly rows: MemoryRowStore
  readonly groups
  readonly rules
  readonly views
  readonly modules
  readonly roles
  readonly constraintDefs
  readonly discoveredRules
  readonly priceLevels
  readonly meta: CatalogueRepository['meta']
  private readonly metaStore: MemoryStore<CatalogueMeta>

  constructor(
    readonly orgId: string,
    db: MemoryDatabase,
    private readonly now: () => string,
  ) {
    this.tables = new MemoryStore(db.tables, orgId, 'table')
    this.rows = new MemoryRowStore(db.rows, orgId, 'row')
    this.groups = new MemoryStore(db.groups, orgId, 'group')
    this.rules = new MemoryStore(db.rules, orgId, 'rule')
    this.views = new MemoryStore(db.views, orgId, 'view')
    this.modules = new MemoryStore(db.modules, orgId, 'module')
    this.roles = new MemoryStore(db.roles, orgId, 'role')
    this.constraintDefs = new MemoryStore(db.constraintDefs, orgId, 'constraint')
    this.discoveredRules = new MemoryStore(db.discoveredRules, orgId, 'discovered rule')
    this.priceLevels = new MemoryStore(db.priceLevels, orgId, 'price ladder')
    this.metaStore = new MemoryStore(db.meta, orgId, 'catalogue meta')
    this.meta = {
      get: () => this.metaStore.get(orgId),
      put: (meta) => this.metaStore.put(meta),
    }
  }

  async loadPack(
    entities: readonly EntityDef[],
    rowsByEntity: Readonly<Record<string, readonly RowData[]>>,
    manifest?: PackManifest,
  ): Promise<void> {
    assertOurs('table', entities, this.orgId)
    for (const entity of entities) assertOurs('row', rowsByEntity[entity.id] ?? [], this.orgId)
    for (const entity of entities) {
      /* one table at a time, as the Dexie adapter lands them */
      await this.tables.put(entity)
      await this.rows.putMany(rowsByEntity[entity.id] ?? [])
      if (entity.priceLevels && entity.priceLevels.length > 0) {
        await this.priceLevels.put({
          id: entity.id,
          orgId: this.orgId,
          tableId: entity.id,
          levels: entity.priceLevels,
          updatedAt: entity.updatedAt,
        })
      }
    }
    if (manifest) {
      await this.meta.put({
        id: this.orgId,
        orgId: this.orgId,
        packVersion: manifest.version,
        packName: manifest.name,
        loadedAt: this.now(),
      })
    }
  }

  async wipe(): Promise<void> {
    /* the quotes map is not on this list and cannot be: this class
       has no store over `db.quotes` */
    this.tables.clear()
    this.rows.clear()
    this.groups.clear()
    this.rules.clear()
    this.views.clear()
    this.modules.clear()
    this.roles.clear()
    this.constraintDefs.clear()
    this.discoveredRules.clear()
    this.priceLevels.clear()
    this.metaStore.clear()
  }
}

class MemoryQuoteRepository implements QuoteRepository {
  private readonly store: MemoryStore<QuoteDef>

  constructor(
    readonly orgId: string,
    db: MemoryDatabase,
  ) {
    this.store = new MemoryStore(db.quotes, orgId, 'quote')
  }

  async list(): Promise<QuoteDef[]> {
    return newestFirst(await this.store.all())
  }

  get(id: string): Promise<QuoteDef | undefined> {
    return this.store.get(id)
  }

  put(quote: QuoteDef): Promise<void> {
    return this.store.put(quote)
  }

  delete(id: string): Promise<void> {
    return this.store.delete(id)
  }
}

export interface MemoryOptions {
  /** the database to file into; a fresh one when absent */
  db?: MemoryDatabase
  /** the clock `loadPack` stamps `meta.loadedAt` with; the real one when absent */
  now?: () => string
}

export function memoryCatalogue(orgId: string, options: MemoryOptions = {}): CatalogueRepository {
  return new MemoryCatalogueRepository(
    orgId,
    options.db ?? createMemoryDatabase(),
    options.now ?? (() => new Date().toISOString()),
  )
}

export function memoryQuotes(orgId: string, options: MemoryOptions = {}): QuoteRepository {
  return new MemoryQuoteRepository(orgId, options.db ?? createMemoryDatabase())
}
