/* ============================================================
   io/copyEdition — WHICH PRICE LIST A SAVED COPY HOLDS, AND WHETHER
   A COPY HOLDS WHAT WAS APPLIED.

   The shelf's verifier (docs/directions/data-round/shelf/verify-1.md,
   S3): bringing a copy back set it beside this computer kind by kind,
   but never named the copy's own price list — the Master Price File it
   came from and the workbooks applied to it — so a manager could not
   tell an older copy from a newer one by its price list. A copy now
   says so itself, beside the envelope (`EDITION_KEY`): the pack it came
   from, by version, day and fingerprint, and every workbook applied
   since, read off this computer's own account (`./brought`). The
   envelope's reader ignores a key it does not know, so a copy carrying
   it reads as every copy did; a copy saved before it carries none, and
   the shelf says that rather than guessing.

   AND (S2, gap 2): a copy saved BEFORE an Apply does not hold that
   Apply. The dock and the rest page tested only that a copy had been
   saved this visit, so a copy from 4:13 pm was said to hold changes
   applied at 4:20. `copyHolds` compares the two instants.

   Pure: no React, no store, no DOM.
   ============================================================ */

import { appliedSince, type BroughtNote } from './brought'

/** The key beside the envelope that a copy's price list is said under. */
export const EDITION_KEY = 'priceList'

export interface AppliedSince {
  file: string
  /** ISO: when it was applied */
  at: string
  changes: number
}

export interface PriceListEdition {
  /** the pack version the price list came from; null when it came from no pack this app knows */
  version: string | null
  /** ISO: when that pack was packed, when it is the pack this app was shipped with */
  packedAt: string | null
  /** the first twelve of its sha256, as the shelf prints it */
  fingerprint: string | null
  /** every workbook applied since, oldest first */
  applied: AppliedSince[]
}

/** This computer's price list, as a copy saved now names it. */
export function editionHere(
  shipped: { version: string; packedAt: string; sha256: string } | null,
  version: string | null,
  notes: readonly BroughtNote[],
): PriceListEdition {
  const known = shipped !== null && version !== null && version === shipped.version
  return {
    version,
    packedAt: known ? shipped.packedAt : null,
    fingerprint: known ? shipped.sha256.slice(0, 12) : null,
    applied: appliedSince(notes).map((n) => ({
      file: n.file,
      at: n.at ?? n.read,
      changes: n.applied ?? n.changes,
    })),
  }
}

const str = (v: unknown): string | null =>
  typeof v === 'string' && v.trim() !== '' ? v.trim() : null

/** The price list a copy names, read as untrusted; null when it names none or the block is not one. */
export function editionOfCopy(raw: unknown): PriceListEdition | null {
  if (typeof raw !== 'object' || raw === null) return null
  const e = (raw as Record<string, unknown>)[EDITION_KEY]
  if (typeof e !== 'object' || e === null || Array.isArray(e)) return null
  const r = e as Record<string, unknown>
  const applied: AppliedSince[] = []
  for (const a of Array.isArray(r.applied) ? (r.applied as unknown[]) : []) {
    if (typeof a !== 'object' || a === null) continue
    const x = a as Record<string, unknown>
    const file = str(x.file)
    const at = str(x.at)
    if (!file || !at || Number.isNaN(new Date(at).getTime())) continue
    const changes = typeof x.changes === 'number' && Number.isFinite(x.changes) ? x.changes : 0
    applied.push({ file: file.slice(0, 260), at, changes: Math.max(0, Math.round(changes)) })
  }
  const packedAt = str(r.packedAt)
  const fingerprint = str(r.fingerprint)
  return {
    version: str(r.version),
    packedAt: packedAt && !Number.isNaN(new Date(packedAt).getTime()) ? packedAt : null,
    fingerprint: fingerprint && /^[0-9a-f]{6,64}$/i.test(fingerprint) ? fingerprint : null,
    applied: applied.slice(0, 40),
  }
}

/** Whether two price lists are named alike: the same pack and the same workbooks applied, in order. */
export function sameEdition(a: PriceListEdition, b: PriceListEdition): boolean {
  if (a.version !== b.version || a.fingerprint !== b.fingerprint) return false
  if (a.applied.length !== b.applied.length) return false
  return a.applied.every((x, i) => x.file === b.applied[i].file && x.at === b.applied[i].at)
}

/**
 * WHETHER THE LAST COPY HOLDS WHAT WAS APPLIED AT `since`: only a copy saved at or after it does.
 * No copy holds anything; nothing applied is held by any copy.
 */
export function copyHolds(lastCopy: string | null, since: string | null): boolean {
  if (since === null) return lastCopy !== null
  if (lastCopy === null) return false
  const copied = new Date(lastCopy).getTime()
  const applied = new Date(since).getTime()
  if (Number.isNaN(copied) || Number.isNaN(applied)) return false
  return copied >= applied
}
