import type {
  ConstraintDef,
  DiscoveredRule,
  EntityDef,
  GroupDef,
  ModuleDef,
  OrgProfile,
  PackManifest,
  PriceLevelRecord,
  QuoteDef,
  RoleDef,
  RowData,
  RuleDef,
  ViewDef,
} from '@/domain/model'

/* ============================================================
   THE PERSISTENCE SEAM.

   Everything above this file — the stores, the screens — talks to
   these interfaces and never to a database. Dexie implements them
   in `./dexie` for the browser, `./memory` implements them for every
   vitest suite, and the Supabase adapter of Milestone 6 implements
   them again without a line above changing. One contract suite
   (`contract.test.ts`) runs against each adapter, so an adapter that
   drifts fails the same test the others pass.

   EVERY RECORD CARRIES `orgId`, AND EVERY REPOSITORY IS BUILT FOR
   ONE. A repository filed for 'northside' lists, patches and deletes
   only 'northside' records, and refuses — with a sentence — to file
   a record that says it belongs to somebody else. One organisation
   per database today; the Postgres adapter filters on the same key
   tomorrow, and nothing above the seam has to learn tenancy twice.

   A QUOTE IS ONE DOCUMENT ROW. Its lines, sections, chapters and
   events are embedded on `QuoteDef`, by value, because a quote is a
   photograph and a photograph is not a join. So `QuoteRepository`
   has no events table and the Postgres adapter never joins.

   THE CATALOGUE AND THE QUOTES ARE SEPARATE INTERFACES ON PURPOSE.
   `CatalogueRepository.wipe()` empties the sheet and can not reach a
   quote, by construction rather than by remembering to skip a table:
   the quotes live behind the other interface. "Your 3 quotes stay. A
   quote is a photograph of what was offered on the day."
   ============================================================ */

/** What every persisted record carries: its own id and the tenant key. */
export interface Filed {
  id: string
  orgId: string
}

/** One table of records, scoped to the repository's organisation.
 *
 *  `all()` promises no order — the Dexie adapter returns primary-key
 *  order and the memory adapter insertion order — so a caller that
 *  needs the sheet's order sorts (the catalogue store does, see its
 *  `rowOrder`). Nothing here stamps `updatedAt`: the command that
 *  changes a record mints its own clock, and a repository that
 *  quietly re-stamped would make a frozen quote's dates lie. */
export interface RecordStore<T extends Filed> {
  /** every record of this organisation */
  all(): Promise<T[]>
  /** one record, or undefined — also undefined when the id belongs to another organisation */
  get(id: string): Promise<T | undefined>
  /** file one record; refuses one whose `orgId` is not this repository's */
  put(record: T): Promise<void>
  /** file many in one transaction; refuses the whole batch if any is foreign */
  putMany(records: readonly T[]): Promise<void>
  /** merge `changes` over the stored record and return the result;
   *  `id` and `orgId` cannot be changed; a missing record is refused */
  patch(id: string, changes: Partial<Omit<T, 'id' | 'orgId'>>): Promise<T>
  /** remove one record; a missing one is nothing to do, a foreign one is refused */
  delete(id: string): Promise<void>
  /** remove many in one transaction */
  deleteMany(ids: readonly string[]): Promise<void>
  /** THE WRITE IS THE DIFFERENCE. After this resolves the store holds
   *  exactly `next` for this organisation: records that left are
   *  deleted, records that arrived or changed are put, records whose
   *  object is the one last written are left alone. The Dexie adapter
   *  keeps the identity ledger that makes a cell edit write one row
   *  and not the table (see `dexie/ledger.ts`); the memory adapter
   *  simply replaces. */
  saveAll(next: readonly T[]): Promise<void>
}

export interface RowStore extends RecordStore<RowData> {
  /** the rows of one table, this organisation only */
  ofTable(tableId: string): Promise<RowData[]>
}

/** WHAT THE SHEET WAS LOADED FROM. One record per organisation, at
 *  `id = orgId`, written last by `loadPack` so a half-landed pack is
 *  never mistaken for a loaded one. A boot reads it to tell "the pack
 *  is already here" from "load it", and a version that differs from
 *  the pack the app ships is a sentence for the owner, never a
 *  migration — a pack is versioned, never stamped or migrated. */
export interface CatalogueMeta extends Filed {
  packVersion: string
  packName: string
  /** ISO, when the pack landed */
  loadedAt: string
}

export interface CatalogueRepository {
  readonly orgId: string
  readonly meta: {
    get(): Promise<CatalogueMeta | undefined>
    put(meta: CatalogueMeta): Promise<void>
  }
  readonly tables: RecordStore<EntityDef>
  readonly rows: RowStore
  readonly groups: RecordStore<GroupDef>
  readonly rules: RecordStore<RuleDef>
  readonly views: RecordStore<ViewDef>
  readonly modules: RecordStore<ModuleDef>
  readonly roles: RecordStore<RoleDef>
  readonly constraintDefs: RecordStore<ConstraintDef>
  readonly discoveredRules: RecordStore<DiscoveredRule>
  /** one ladder per table, at `id = tableId` — the same list the
   *  table carries on `EntityDef.priceLevels`, filed on its own so
   *  the Levels screen rewrites one record and not a 2,500-row table */
  readonly priceLevels: RecordStore<PriceLevelRecord>
  /** THE PACK, ONE TRANSACTION PER TABLE: the table, its rows and its
   *  declared ladder land together or not at all, and the next table
   *  starts only when the last one has. `manifest`, when given, is
   *  recorded in `meta` after every table has landed. Refuses a table
   *  or a row filed for another organisation. */
  loadPack(
    entities: readonly EntityDef[],
    rowsByEntity: Readonly<Record<string, readonly RowData[]>>,
    manifest?: PackManifest,
  ): Promise<void>
  /** empties every catalogue table for this organisation — the sheet,
   *  its registries, its meta. NEVER a quote: the quotes are behind
   *  `QuoteRepository`, which this cannot reach. */
  wipe(): Promise<void>
}

export interface QuoteRepository {
  readonly orgId: string
  /** every quote of this organisation, newest first — see `newestFirst` */
  list(): Promise<QuoteDef[]>
  get(id: string): Promise<QuoteDef | undefined>
  /** file the whole document; refuses one filed for another organisation */
  put(quote: QuoteDef): Promise<void>
  delete(id: string): Promise<void>
}

/** The one order `QuoteRepository.list()` promises, shared by every
 *  adapter so the register reads the same in a test and in the
 *  browser: newest `createdAt` first, and the id breaks a tie so two
 *  quotes minted in the same millisecond still come back in one
 *  order. */
export function newestFirst(quotes: readonly QuoteDef[]): QuoteDef[] {
  return [...quotes].sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id),
  )
}

/* ---------------------------------------------------------- */
/* Declared now, implemented in Milestones 4–6                  */
/* ---------------------------------------------------------- */

/** M4 — the organisation's own profile: its name, its industry, the
 *  validity sentence it puts on every quote. One per database. */
export interface OrgRepository {
  readonly orgId: string
  get(): Promise<OrgProfile | undefined>
  put(org: OrgProfile): Promise<void>
}

/** M4–M6 — the people who sign in. The record shape (`User`,
 *  `Invite`) lands on the contract with that milestone; until then
 *  the interface names what an adapter owes over the filed-record
 *  minimum, and the generic closes on the day the shape exists. */
export interface UserRepository<TUser extends Filed = Filed> {
  readonly orgId: string
  list(): Promise<TUser[]>
  get(id: string): Promise<TUser | undefined>
  put(user: TUser): Promise<void>
  delete(id: string): Promise<void>
}

/** M5 — quote and document templates with the override cascade. Same
 *  arrangement as `UserRepository`: the shape arrives with the
 *  milestone, the obligation is written down now. */
export interface TemplateRepository<TTemplate extends Filed = Filed> {
  readonly orgId: string
  list(): Promise<TTemplate[]>
  get(id: string): Promise<TTemplate | undefined>
  put(template: TTemplate): Promise<void>
  delete(id: string): Promise<void>
}

/* ---------------------------------------------------------- */
/* The refusals, in one voice                                    */
/* ---------------------------------------------------------- */

/** A refusal is a sentence with its reason. These are the sentences
 *  both adapters throw, so the contract suite asserts one wording. */
export const refusals = {
  foreign: (what: string, id: string, theirs: string, ours: string): string =>
    `Refused: ${what} '${id}' is filed for organisation '${theirs}' and this repository files for '${ours}'.`,
  missing: (what: string, id: string, ours: string): string =>
    `Refused: there is no ${what} '${id}' in organisation '${ours}' to patch.`,
}

/** Throws the foreign-record sentence unless every record is ours. */
export function assertOurs(what: string, records: readonly Filed[], orgId: string): void {
  for (const record of records) {
    if (record.orgId !== orgId) {
      throw new Error(refusals.foreign(what, record.id, record.orgId, orgId))
    }
  }
}
