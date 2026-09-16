import type { ImageVerdict } from './images'
import type { PriceLevel } from './pricing'
import type { TableKind, TableRole } from './tables'

/* ============================================================
   THE PACK — the seeded file as a generated JSON set.

   `data/northside/manifest.json` + `tables/<key>.json` (one row per
   line) + `images.json`. No 4 MB TypeScript literal, no type-checker
   tricks, per-table loading, and ids that survive a Postgres import:

     table id   = the seed key                 'boat_stacer'
     row id     = key ':' 1-based ordinal      'boat_stacer:12'
     field id   = key '.' column key           'boat_stacer.c'

   except the three pair fields, which keep their literal ids
   (`PAIR_FIELDS`). `orgId` is 'northside' on every record.

   THE MANIFEST IS THE PROVENANCE. It carries the sha256 of the
   committed seed it was packed from and the old fingerprint of that
   seed, so a fingerprint test can prove the pack equals what the old
   app loaded, table by table and row by row. The packer asserts the
   counts against the old repo's own holds before it writes anything.
   ============================================================ */

/** One table in the pack, as the manifest lists it. */
export interface PackTableMeta {
  /** the seed key, and the table's id */
  key: string
  id: string
  name: string
  kind?: TableKind
  role: TableRole
  rowCount: number
  /** the table's file, relative to the manifest — 'tables/<key>.json' */
  file: string
  /** THE LADDER, DECLARED BY THE PACKER on every priced table: the
   *  rungs with their `RungContents` and source cells, so no Northside
   *  column name has to live in app code. The packer refuses to
   *  declare a rung that lands on a cost band; the app refuses again
   *  in `priceLevelsFor`, by construction and not by good manners. */
  priceLevels?: PriceLevel[]
  /** field ids that must never reach a customer surface — the cost
   *  and margin bands, named by the packer from the workbook's own
   *  section headers so a screen can be checked against them */
  costColumns: string[]
}

/** The pictures, as the manifest accounts for them. Every number is
 *  counted from the ledger, never typed. */
export interface PackImagesMeta {
  /** the ledger file, relative to the manifest — 'images.json' */
  file: string
  /** addresses with a held copy under public/seed-images */
  held: number
  /** addresses with no held copy yet; the app shows the address */
  unheld: number
  /** addresses the host refused; recorded with the measured reason */
  refused: number
}

export interface PackManifest {
  /** one string; a pack is versioned, never stamped or migrated */
  version: string
  /** what the set calls itself — 'Northside Marine' */
  name: string
  /** sha256 of the committed seed file the pack was generated from */
  sourceSha256: string
  /** the old app's own fingerprint of that seed — FNV-1a over every
   *  table name and row count — so the pack can be proved equal to
   *  what the old app loaded */
  sourceFingerprint: string
  /** ISO, when the packer ran */
  packedAt: string
  counts: {
    tables: number
    rows: number
    joins: number
  }
  tables: PackTableMeta[]
  images: PackImagesMeta
}

/* ---------------------------------------------------------- */
/* The image ledger                                            */
/* ---------------------------------------------------------- */

/** One entry per distinct image address in the seed — the picture's
 *  provenance. A PICTURE BELONGS ONLY TO THE EXACT MODEL IT DEPICTS:
 *  nothing is matched by resemblance and nothing is substituted. An
 *  entry with no `file` carries the measured reason the picture could
 *  not be obtained, and the app keeps showing its address instead.
 *  Trailer rows that point at a SharePoint brand logo are a workbook
 *  defect and stay honestly picture-less. */
export interface ImageLedgerEntry {
  /** the manufacturer's address, exactly as the seed carries it, and
   *  what `ImageRef.src` keeps saying */
  address: string
  /** the held copy under public/seed-images, when there is one */
  file?: string
  /** ISO date the copy was fetched */
  fetchedAt?: string
  host: string
  /** the held copy's pixel size */
  width?: number
  height?: number
  /** sha1 of the address; its first 16 characters are how the dealer's
   *  own mirror addresses the object */
  sha1?: string
  /** what may be done with the picture, in words — the licence or the
   *  absence of one, never blank */
  licenceNote: string
  /** scene or studio, measured off the pixels at pack time */
  verdict: ImageVerdict
  /** the measured reason there is no held copy — a refusing host, a
   *  broken address — recorded, never guessed */
  error?: string
}
