import { dexieCatalogue, dexieQuotes, sharedDatabase } from './dexie/repositories'
import { createMemoryDatabase, type MemoryDatabase } from './memory/database'
import { memoryCatalogue, memoryQuotes } from './memory/repositories'
import type { CatalogueRepository, QuoteRepository } from './repository'

export type {
  CatalogueMeta,
  CatalogueRepository,
  Filed,
  OrgRepository,
  QuoteRepository,
  RecordStore,
  RowStore,
  TemplateRepository,
  UserRepository,
} from './repository'

/* ============================================================
   WHICH ADAPTER. Memory under vitest, Dexie in the browser — chosen
   here once, so no store and no screen ever names an adapter. The
   Supabase adapter of Milestone 6 is a third branch of this one
   function.

   Both repositories of an organisation file into ONE database, so a
   catalogue wipe and the quotes that survive it are on the same disk
   — which is the only way "your 3 quotes stay" is a fact about the
   database rather than about two databases that happen to differ.
   ============================================================ */

export interface Repositories {
  kind: 'memory' | 'dexie'
  catalogue: CatalogueRepository
  quotes: QuoteRepository
}

/** vitest sets `MODE` to 'test' on every file it runs; the built app
 *  never does. */
const underVitest = (): boolean => import.meta.env.MODE === 'test'

let memoryDb: MemoryDatabase | null = null

export function repositories(orgId: string): Repositories {
  if (underVitest()) {
    /* one memory database per module instance — vitest isolates
       modules per file, so suites never share it */
    memoryDb ??= createMemoryDatabase()
    return {
      kind: 'memory',
      catalogue: memoryCatalogue(orgId, { db: memoryDb }),
      quotes: memoryQuotes(orgId, { db: memoryDb }),
    }
  }
  const db = sharedDatabase()
  return {
    kind: 'dexie',
    catalogue: dexieCatalogue(orgId, { db }),
    quotes: dexieQuotes(orgId, { db }),
  }
}
