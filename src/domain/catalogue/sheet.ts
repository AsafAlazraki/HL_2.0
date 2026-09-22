import type {
  ConstraintDef,
  DiscoveredRule,
  EntityDef,
  GroupDef,
  ModuleDef,
  PriceLevel,
  RoleDef,
  RowData,
  RuleDef,
  ViewDef,
} from '@/domain/model'

/* ============================================================
   THE SHEET, AS DATA — the shape the catalogue store holds and the
   shape every catalogue command is written over.

   IT LIVES IN THE DOMAIN AND NOT IN THE STORE because a command is a
   pure function `(data, now) => outcome` and `src/domain` may not
   import `src/state` (`tools/check.ts`, `domain-is-pure`). The store
   re-exports these names, so nothing above the seam has to learn a
   second spelling; the reasoning beside each field is the store's
   own and moved here with it.

   `orgId` IS THE ONE FIELD THE STORE DID NOT HAVE, and a command
   that mints a row or a table needs it: every persisted record
   carries the tenant key, and a record filed without one is refused
   by the repository with a sentence. It is derived from the source
   the sheet was loaded from and from nothing else — a repository
   says whose it is, a pack's own records do — so a blank sheet that
   came from nowhere honestly has none, and `createTable` says so
   rather than inventing one.
   ============================================================ */

export interface CatalogueIndex {
  /** every row by its id, so "open this row" never scans a table */
  rowById: Readonly<Record<string, RowData>>
}

export interface CatalogueData {
  /** whose sheet this is — the tenant key every record on it carries;
   *  null when no source named one, which is the honest state of a
   *  sheet loaded from nothing */
  orgId: string | null
  /** the pack version the sheet came from; null before a load or where no pack made it */
  version: string | null
  /**
   * WHERE THE SHEET IN THIS STORE CAME FROM ON THIS OPEN — the file,
   * or this browser's own database. Null before anything has loaded.
   *
   * It is derived from the source `load` was handed and from nothing
   * else, so it is not a new fact: it is one the store was throwing
   * away. It is here because TWO SCREENS have to agree about it. Entry
   * reads the file and then navigates; Home draws the stamp. Between
   * them there is no carrier but this store — a search param would be
   * a position, and a second store would be a second truth — and a
   * Home that guessed would be the one thing this repo refuses, a
   * figure nobody measured.
   */
  from: 'pack' | 'repository' | null
  /**
   * WHAT THE SHEET'S OWN SOURCE CALLS THE BUSINESS — the pack
   * manifest's name when the file was just read, the name filed beside
   * the sheet when it came back out of this browser. Null when no
   * source named one, which is the honest state of a blank sheet.
   *
   * IT IS NOT AN ORGANISATION RECORD and must not be mistaken for one:
   * it is a string the file carries about itself, which is exactly
   * what a masthead can honestly print today. Milestone 4's
   * `OrgProfile` replaces it, and this field is where that arrives.
   */
  business: string | null
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

/** A sheet with nothing on it and no provenance. */
export const emptySheet = (): CatalogueData => ({
  orgId: null,
  version: null,
  from: null,
  business: null,
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

/**
 * THE INDEX IS DERIVED FROM THE ROWS, AND BUILT WHEN FIRST READ.
 *
 * Measured before this was written: copying a 15,691-key record to
 * point one id at a new row object costs ~18 ms on this machine, and
 * a level set over 187 variants did it 187 times — 3.8 s for an act
 * the old store did in a loop. A Map copies in ~3 ms, and a screen
 * (`picker/mint.ts`) reads `sheet.index.rowById[id]` as a record,
 * so neither the shape nor the copying was the answer.
 *
 * So no command touches the index at all. Each hands back a sheet
 * whose `index` is a closure over its own `rows`, and the record is
 * built — once, ~5 ms over the whole pack — the first time somebody
 * reads it, then kept for as long as that version of the sheet is.
 * A command reads rows by scanning its own table, which is at most
 * a few thousand comparisons; a screen reads the record. The cost
 * moved from every write to the first read after one, and it went
 * down on the way.
 *
 * It is still a plain record to every reader: `rowById` is an own,
 * enumerable property, so `Object.keys`, `toEqual` and `in` all
 * see what they saw.
 */
export function indexRows(rows: Readonly<Record<string, readonly RowData[]>>): CatalogueIndex {
  let built: Record<string, RowData> | null = null
  return {
    get rowById(): Readonly<Record<string, RowData>> {
      if (built === null) {
        built = {}
        for (const list of Object.values(rows)) for (const row of list) built[row.id] = row
      }
      return built
    },
  }
}

/** Is this row id anywhere on the sheet — without building the
 *  index. A whole-sheet scan is ~16,000 comparisons on the pack,
 *  which is cheaper than the build it saves. */
export function hasRow(rows: Readonly<Record<string, readonly RowData[]>>, rowId: string): boolean {
  for (const list of Object.values(rows)) for (const row of list) if (row.id === rowId) return true
  return false
}
