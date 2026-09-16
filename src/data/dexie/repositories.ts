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
import { CATALOGUE_TABLES, openDatabase, type HLDatabase, type Records } from './database'
import { diffStore } from './ledger'

/* ============================================================
   THE DEXIE ADAPTER — the browser's implementation of the seam.

   Two things live here and nowhere above: the IDENTITY LEDGER that
   makes `saveAll` write the difference (the argument is the header
   of `ledger.ts`), and the WRITE QUEUE that keeps two differential
   writes from reading one ledger. Every method returns the same
   promises the memory adapter does; only the cost differs.
   ============================================================ */

/** AND WRITES DO NOT OVERLAP. Every write on a repository is chained
 *  behind whatever is already in flight — one at a time, and a
 *  failed write must not stop the next one. Reads are not queued:
 *  IndexedDB already serialises them against a transaction on the
 *  same store, and a read that lands mid-queue reads a disk that is
 *  consistent at that moment. */
class WriteQueue {
  private chain: Promise<unknown> = Promise.resolve()

  run<R>(job: () => Promise<R>): Promise<R> {
    const run = this.chain.then(job, job)
    this.chain = run.catch(() => undefined)
    return run
  }
}

class DexieStore<T extends Filed> implements RecordStore<T> {
  /** Everything the last successful write put on disk for this
   *  organisation, as the object identities it wrote. `null` means
   *  "we do not know what is down there" — the next `saveAll`
   *  reconciles against the disk itself. */
  private ledger: Map<string, T> | null = null

  constructor(
    protected readonly table: Records<T>,
    protected readonly orgId: string,
    protected readonly what: string,
    protected readonly queue: WriteQueue,
  ) {}

  protected ours() {
    return this.table.where('orgId').equals(this.orgId)
  }

  /** a record that is now known to be on disk, as this object */
  remember(record: T): void {
    this.ledger?.set(record.id, record)
  }

  /** the disk is in an unknown state — between a wipe's two halves,
   *  or before anything has been read */
  forget(): void {
    this.ledger = null
  }

  /** nothing of ours is down there, and that is a fact */
  knowEmpty(): void {
    this.ledger = new Map()
  }

  async all(): Promise<T[]> {
    const records = await this.ours().toArray()
    /* THE OBJECTS WE HAND UP ARE THE OBJECTS ON DISK. The store keeps
       these very objects until something edits them, so the first save
       after a load writes only what the session has actually changed
       rather than re-writing the file it just read. */
    this.ledger = new Map(records.map((x) => [x.id, x]))
    return records
  }

  async get(id: string): Promise<T | undefined> {
    const record = await this.table.get(id)
    if (!record || record.orgId !== this.orgId) return undefined
    this.remember(record)
    return record
  }

  /* `async` on every write so a refusal is a rejected promise, the
     same shape the memory adapter and a network adapter give it */

  async put(record: T): Promise<void> {
    assertOurs(this.what, [record], this.orgId)
    return this.queue.run(async () => {
      await this.table.put(record)
      this.remember(record)
    })
  }

  async putMany(records: readonly T[]): Promise<void> {
    assertOurs(this.what, records, this.orgId)
    return this.queue.run(async () => {
      await this.table.bulkPut(records)
      for (const record of records) this.remember(record)
    })
  }

  patch(id: string, changes: Partial<Omit<T, 'id' | 'orgId'>>): Promise<T> {
    return this.queue.run(async () => {
      const merged = await this.table.db.transaction('rw', this.table, async () => {
        const existing = await this.table.get(id)
        if (!existing || existing.orgId !== this.orgId) {
          throw new Error(refusals.missing(this.what, id, this.orgId))
        }
        const next = { ...existing, ...changes, id, orgId: this.orgId } as T
        await this.table.put(next)
        return next
      })
      this.remember(merged)
      return merged
    })
  }

  delete(id: string): Promise<void> {
    return this.queue.run(async () => {
      await this.table.db.transaction('rw', this.table, async () => {
        const existing = await this.table.get(id)
        if (!existing) return
        assertOurs(this.what, [existing], this.orgId)
        await this.table.delete(id)
      })
      this.ledger?.delete(id)
    })
  }

  deleteMany(ids: readonly string[]): Promise<void> {
    return this.queue.run(async () => {
      await this.table.db.transaction('rw', this.table, async () => {
        const found = (await this.table.bulkGet([...ids])).filter((x): x is T => x !== undefined)
        assertOurs(this.what, found, this.orgId)
        await this.table.bulkDelete(found.map((x) => x.id))
      })
      for (const id of ids) this.ledger?.delete(id)
    })
  }

  async saveAll(next: readonly T[]): Promise<void> {
    assertOurs(this.what, next, this.orgId)
    return this.queue.run(() => this.write(next))
  }

  private async write(next: readonly T[]): Promise<void> {
    const known = this.ledger ?? new Map<string, T>()
    /* ============================================================
       AN UNKNOWN DISK IS RECONCILED AGAINST ITSELF.

       CAUGHT IN TESTING, AND IT IS THE ONLY WAY THIS DESIGN CAN LOSE.
       The first draft treated "no ledger" as "every record is new" and
       put them all. Putting is not replacing: records the incoming
       project does not have were left exactly where they were. A demo
       load that landed before `init()` had resolved therefore wrote 52
       fresh tables ON TOP of the 52 already down there, and the next
       open read back 156 — measured, at three loads.

       The old wholesale write did not have that bug because it cleared
       every store first. Clearing is not the answer either: it means a
       save that runs before the project has been read would empty the
       file and write nothing back over it.

       So an unknown disk is READ instead: the primary keys of each
       store, taken inside the same transaction, ARE the ledger this
       write needed. Everything the snapshot does not carry is deleted;
       everything it does is written. Identical in effect to the clear,
       and it can never delete anything the snapshot would not have
       replaced anyway.

       IN THIS BUILD THE KEYS READ ARE THIS ORGANISATION'S ONLY, so a
       wholesale write cannot delete another organisation's records
       any more than a known one can.
       ============================================================ */
    const wholesale = this.ledger === null
    const diff = diffStore(next, known)

    if (!wholesale && diff.quiet) {
      /* NOTHING MOVED. A pan, a selection or a re-render that stamped
         `updatedAt` on nothing else has no business opening a
         transaction. */
      return
    }

    await this.table.db.transaction('rw', this.table, async () => {
      let gone = diff.remove
      if (wholesale) {
        /* what is actually down there, read inside this transaction */
        const onDisk = (await this.ours().primaryKeys()) as string[]
        gone = onDisk.filter((k) => !diff.next.has(k))
      }
      if (gone.length > 0) await this.table.bulkDelete(gone)
      if (diff.put.length > 0) await this.table.bulkPut(diff.put)
    })

    /* only now is it a fact */
    this.ledger = diff.next
  }
}

class DexieRowStore extends DexieStore<RowData> implements RowStore {
  async ofTable(tableId: string): Promise<RowData[]> {
    const rows = await this.table
      .where('[orgId+entityId]')
      .equals([this.orgId, tableId])
      .toArray()
    for (const row of rows) this.remember(row)
    return rows
  }
}

class DexieCatalogueRepository implements CatalogueRepository {
  readonly tables: DexieStore<EntityDef>
  readonly rows: DexieRowStore
  readonly groups
  readonly rules
  readonly views
  readonly modules
  readonly roles
  readonly constraintDefs
  readonly discoveredRules
  readonly priceLevels
  readonly meta: CatalogueRepository['meta']
  private readonly metaStore: DexieStore<CatalogueMeta>
  private readonly queue = new WriteQueue()

  constructor(
    readonly orgId: string,
    private readonly db: HLDatabase,
    private readonly now: () => string,
  ) {
    const q = this.queue
    this.tables = new DexieStore(db.tableDefs, orgId, 'table', q)
    this.rows = new DexieRowStore(db.rows, orgId, 'row', q)
    this.groups = new DexieStore(db.groups, orgId, 'group', q)
    this.rules = new DexieStore(db.rules, orgId, 'rule', q)
    this.views = new DexieStore(db.views, orgId, 'view', q)
    this.modules = new DexieStore(db.modules, orgId, 'module', q)
    this.roles = new DexieStore(db.roles, orgId, 'role', q)
    this.constraintDefs = new DexieStore(db.constraintDefs, orgId, 'constraint', q)
    this.discoveredRules = new DexieStore(db.discoveredRules, orgId, 'discovered rule', q)
    this.priceLevels = new DexieStore(db.priceLevels, orgId, 'price ladder', q)
    this.metaStore = new DexieStore(db.meta, orgId, 'catalogue meta', q)
    this.meta = {
      get: () => this.metaStore.get(orgId),
      put: (meta) => this.metaStore.put(meta),
    }
  }

  /** every store's ledger, for the wipe to forget and then know empty */
  private stores(): Array<Pick<DexieStore<Filed>, 'forget' | 'knowEmpty'>> {
    return [
      this.tables,
      this.rows,
      this.groups,
      this.rules,
      this.views,
      this.modules,
      this.roles,
      this.constraintDefs,
      this.discoveredRules,
      this.priceLevels,
      this.metaStore,
    ]
  }

  async loadPack(
    entities: readonly EntityDef[],
    rowsByEntity: Readonly<Record<string, readonly RowData[]>>,
    manifest?: PackManifest,
  ): Promise<void> {
    assertOurs('table', entities, this.orgId)
    for (const entity of entities) assertOurs('row', rowsByEntity[entity.id] ?? [], this.orgId)
    return this.queue.run(async () => {
      const { db } = this
      for (const entity of entities) {
        const rows = rowsByEntity[entity.id] ?? []
        const ladder =
          entity.priceLevels && entity.priceLevels.length > 0
            ? {
                id: entity.id,
                orgId: this.orgId,
                tableId: entity.id,
                levels: entity.priceLevels,
                updatedAt: entity.updatedAt,
              }
            : null
        /* ONE TRANSACTION PER TABLE: the table, its rows and its ladder
           land together, and a pack interrupted between tables leaves
           whole tables, never half of one. `bulkPut` is one request
           for the whole table's rows, not one per row. */
        await db.transaction('rw', [db.tableDefs, db.rows, db.priceLevels], async () => {
          await db.tableDefs.put(entity)
          if (rows.length > 0) await db.rows.bulkPut(rows)
          if (ladder) await db.priceLevels.put(ladder)
        })
        this.tables.remember(entity)
        for (const row of rows) this.rows.remember(row)
        if (ladder) this.priceLevels.remember(ladder)
      }
      if (manifest) {
        /* written LAST, so a pack that did not finish landing is never
           recorded as loaded */
        const meta: CatalogueMeta = {
          id: this.orgId,
          orgId: this.orgId,
          packVersion: manifest.version,
          packName: manifest.name,
          loadedAt: this.now(),
        }
        await db.meta.put(meta)
        this.metaStore.remember(meta)
      }
    })
  }

  wipe(): Promise<void> {
    return this.queue.run(async () => {
      /* THE LEDGER GOES FIRST, and it goes to `null` rather than to
         empty: between the two statements below the disk is in neither
         state, and a read that raced in must not believe it knows what
         is down there. */
      for (const store of this.stores()) store.forget()
      const { db } = this
      const tables = CATALOGUE_TABLES.map((name) => db[name])
      /* `db.quotes` is not in CATALOGUE_TABLES and the transaction
         cannot touch a table it did not name */
      await db.transaction('rw', tables, async () => {
        await Promise.all(tables.map((table) => table.where('orgId').equals(this.orgId).delete()))
      })
      for (const store of this.stores()) store.knowEmpty()
    })
  }
}

class DexieQuoteRepository implements QuoteRepository {
  private readonly store: DexieStore<QuoteDef>

  constructor(
    readonly orgId: string,
    db: HLDatabase,
  ) {
    this.store = new DexieStore(db.quotes, orgId, 'quote', new WriteQueue())
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

export interface DexieRepositoryOptions {
  /** the database to file into; the browser's shared one when absent */
  db?: HLDatabase
  /** the clock `loadPack` stamps `meta.loadedAt` with; the real one when absent */
  now?: () => string
}

let shared: HLDatabase | null = null

/** The one database the browser opens, constructed on first use so
 *  importing this module costs nothing in a test that never asks. */
export function sharedDatabase(): HLDatabase {
  shared ??= openDatabase()
  return shared
}

export function dexieCatalogue(
  orgId: string,
  options: DexieRepositoryOptions = {},
): CatalogueRepository {
  return new DexieCatalogueRepository(
    orgId,
    options.db ?? sharedDatabase(),
    options.now ?? (() => new Date().toISOString()),
  )
}

export function dexieQuotes(orgId: string, options: DexieRepositoryOptions = {}): QuoteRepository {
  return new DexieQuoteRepository(orgId, options.db ?? sharedDatabase())
}
