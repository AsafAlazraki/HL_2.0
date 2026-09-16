import type { ImageLedgerEntry, ImageVerdict } from '../../domain/model'

/* ============================================================
   THE IMAGE LEDGER, AS THE FILE HOLDS IT.

   `data/northside/images.json` is the contract's `ImageLedgerEntry`
   list with the chain of custody the old repository already kept
   beside every picture — the copy's byte size and sha256, the
   original's pixel size and type, and, where the host refused a plain
   request, the dealership's own mirror the bytes came off instead,
   named by object and by the address's own sha1 so anyone with this
   file can re-check the chain. The extra fields are optional and
   additive: a reader that knows only the contract reads the same
   entries.

   This file is imported by the packer and the fetcher under
   `tools/seed` (relatively, because `tools` has no `@` alias) and by
   the browser loader, so the shape is written once. It imports only
   types from the model, so it costs nothing at runtime.
   ============================================================ */

export interface PackImageEntry extends ImageLedgerEntry {
  /** the held copy's byte size */
  bytes?: number
  /** sha256 of the held copy's bytes */
  sha256?: string
  /** the original's natural pixel size, as fetched — what a person
   *  means by how big the photograph is */
  sourceWidth?: number
  sourceHeight?: number
  /** the original's media type, as the host declared it */
  sourceType?: string
  /** where the BYTES came from: the address's own host, or the
   *  dealership's mirror of that same address because the host
   *  refuses a plain request */
  via?: 'host' | 'mpf-mirror'
  /** the mirror object, when `via` is the mirror */
  mirror?: string
  /** sha1(address)[:16] — how the mirror names the object */
  mirrorKey?: string
}

export interface PackImagesMetaBlock {
  generatedBy: string
  /** the long edge every held copy is downscaled to */
  longEdge: number
  /** the WebP quality every held copy is encoded at */
  quality: number
  /** ISO date of the most recent measurement */
  measured: string
  note: string
}

export interface PackImagesFile {
  meta: PackImagesMetaBlock
  images: PackImageEntry[]
}

/** The three states an address can be in, counted off the ledger and
 *  never typed: HELD (a copy exists), REFUSED (asked and refused, with
 *  the reason), UNHELD (nobody has asked yet). */
export function countLedger(images: readonly PackImageEntry[]): {
  held: number
  unheld: number
  refused: number
} {
  let held = 0
  let unheld = 0
  let refused = 0
  for (const e of images) {
    if (e.file) held += 1
    else if (e.error) refused += 1
    else unheld += 1
  }
  return { held, unheld, refused }
}

/** How many held pictures carry each verdict. */
export function countVerdicts(images: readonly PackImageEntry[]): Record<ImageVerdict, number> {
  const out: Record<ImageVerdict, number> = { scene: 0, studio: 0, unknown: 0 }
  for (const e of images) if (e.file) out[e.verdict] += 1
  return out
}
