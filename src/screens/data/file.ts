/* ============================================================
   WHAT THE SHIPPED FILE SAYS ABOUT ITSELF — the one sha256, the one
   fingerprint and the one packing date, for the head of the register.

   THERE IS ONE FILE-LEVEL sha256 AND ONE FINGERPRINT, not one per
   table (docs/research/refs/critique-m2.md, "checked and found
   exact"): `data/northside/manifest.json` carries `sourceSha256`,
   `sourceFingerprint` (1qz08ne) and `packedAt` once for the whole
   source, and no table entry carries a hash. A table's provenance is
   its workbook, sheet and row range, which its own description says
   and `domain/modules/register` cuts to a line; the file's provenance
   is these three, printed once at the head and in full on a page.

   WHY THEY ARE READ AT BUILD AND NOT FETCHED, and why they are not
   read off the store. Every screen behind the door reads this browser
   and never the file (docs/SCREENS.md, "Entry reads the file. Home
   reads this browser"), and the catalogue store keeps the pack's
   `version` and its name but not its hashes — so a screen that
   fetched `manifest.json` to print a fingerprint would break the
   promise that a second visit reads nothing over the network, and one
   that printed a fingerprint the store does not hold would be typing
   it. The manifest rides in the bundle through Vite's `?raw` import,
   exactly as Home's two ledgers do, and is parsed once here.

   AND THEY ARE PRINTED ONLY FOR THE FILE THEY BELONG TO. The store
   says which pack version the sheet came from; when it is the version
   this manifest describes, the fingerprint is the sheet's own. When it
   is not — a later pack, a sheet that came from nowhere — the head
   says so and prints no fingerprint at all, because a fingerprint of
   another file is the one figure this screen must never show.

   A MANIFEST THAT DOES NOT PARSE YIELDS NOTHING RATHER THAN A GUESS.
   ============================================================ */
import manifestRaw from '../../../data/northside/manifest.json?raw'

export interface ShippedFile {
  /** the pack version the three facts below belong to */
  version: string
  /** the old app's own fingerprint of the source workbook set */
  fingerprint: string
  /** sha256 of the committed source the pack was generated from */
  sha256: string
  /** ISO, when the packer ran */
  packedAt: string
}

function read(raw: string): ShippedFile | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (typeof parsed !== 'object' || parsed === null) return null
  const m = parsed as Record<string, unknown>
  const str = (key: string): string | null =>
    typeof m[key] === 'string' && (m[key] as string).trim() !== '' ? (m[key] as string).trim() : null
  const version = str('version')
  const fingerprint = str('sourceFingerprint')
  const sha256 = str('sourceSha256')
  const packedAt = str('packedAt')
  if (!version || !fingerprint || !sha256 || !packedAt) return null
  return { version, fingerprint, sha256, packedAt }
}

const shipped = read(manifestRaw)

/** The shipped file's own three facts, or null when the manifest in
 *  the bundle could not be read. */
export const shippedFile = (): ShippedFile | null => shipped

/**
 * The provenance that belongs to the sheet in the store, or the
 * reason none does. `version` is the store's own `CatalogueData.version`.
 */
export type FileProvenance =
  | { known: true; file: ShippedFile }
  | { known: false; because: string }

export function provenanceOfSheet(version: string | null): FileProvenance {
  if (!shipped) {
    return { known: false, because: 'The shipped file’s own manifest could not be read, so no fingerprint is printed.' }
  }
  if (version === null) {
    return {
      known: false,
      because: 'This sheet did not come from a packed file, so it has no fingerprint.',
    }
  }
  if (version !== shipped.version) {
    return {
      known: false,
      because: `This sheet is pack version ${version}; the fingerprint held here is for version ${shipped.version}, so none is printed.`,
    }
  }
  return { known: true, file: shipped }
}

/** A packing instant, or a calendar day, as a dealer reads a date. A bare `YYYY-MM-DD` is a
 *  day already in the dealer's calendar and is read as local midnight: `new Date('2026-09-24')`
 *  is UTC midnight, which west of Greenwich is the evening before. */
export function packedOn(iso: string): string {
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  const at = day ? new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3])) : new Date(iso)
  if (Number.isNaN(at.getTime())) return iso
  return at.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}
