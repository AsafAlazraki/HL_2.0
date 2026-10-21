/* ============================================================
   THE DEALERSHIP'S OWN MARK FOR THE PILL'S CREST — read off the marks
   ledger alone.

   The crest is drawn on every screen, so what it reads is paid for on
   every first paint. `@/data/pictures` is the one reader of every
   picture this app ships and carries the photograph ledgers with it
   (about 826 kB before compression); importing it into the shell put
   both of its chunks on Entry's first paint. This reads only
   `marks-ledger.json` (15 kB), and answers the same question
   `pictures().organisation('white')` answers, by the same rule: the
   mark whose role is `organisation`, in white ink, for the business
   the file names (`namesTheSame`), served from `brand-marks/` under
   the app's base.
   ============================================================ */
import marksRaw from '../../data/northside/marks-ledger.json?raw'
import { namesTheSame } from '@/domain/model/pictures'

interface LedgerRow {
  role?: unknown
  brand?: unknown
  variant?: unknown
  file?: unknown
}

function organisationMarks(): LedgerRow[] {
  try {
    const rows: unknown = JSON.parse(marksRaw)
    return Array.isArray(rows) ? (rows as LedgerRow[]) : []
  } catch {
    return []
  }
}

/**
 * Northside's own mark in white ink, for the band the crest is drawn on — only for the business
 * the file names, so a file of another dealership never wears it. The address, or null.
 */
export function crestMarkOf(business: string | null | undefined): string | null {
  const name = business?.trim() ?? ''
  if (name === '') return null
  const own = organisationMarks().find(
    (row) =>
      row.role === 'organisation' &&
      row.variant === 'white' &&
      typeof row.brand === 'string' &&
      typeof row.file === 'string' &&
      row.file !== '' &&
      namesTheSame(name, row.brand),
  )
  if (!own) return null
  const base = import.meta.env.BASE_URL
  const root = base.endsWith('/') ? base : `${base}/`
  return `${root}brand-marks/${own.file as string}`
}

/**
 * WHOSE APP THIS IS, BEFORE A FILE HAS SAID (refine-2, 2026-10-21). The owner: "this is a
 * northside marine app". Until a file names a business the crest drew the product's helm,
 * named "HelmLogic" — over Northside's own letterhead on a reloaded printed quote, and on /kit
 * and Home in a browser that had never been through the door (refine-critique.md, blocker 2).
 * The marks ledger this app ships is Northside's own (`data/northside/`), and it holds one
 * organisation: the dealership that owns the app. That business, by the name the ledger gives
 * it, is the crest's until a file names another. Where the ledger holds no organisation's
 * white mark, or more than one, nothing is assumed and the answer is null.
 */
export function ownBusiness(): string | null {
  const brands = new Set(
    organisationMarks()
      .filter(
        (row) =>
          row.role === 'organisation' &&
          row.variant === 'white' &&
          typeof row.brand === 'string' &&
          row.brand.trim() !== '' &&
          typeof row.file === 'string' &&
          row.file !== '',
      )
      .map((row) => (row.brand as string).trim()),
  )
  return brands.size === 1 ? [...brands][0]! : null
}
