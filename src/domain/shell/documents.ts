/* ============================================================
   THE DOCUMENTS AS THE FINDER'S INDEX HOLDS THEM — one line of the
   register, read into the three things a quote is found by.

   Written 2026-09-24 for docs/directions/m2-last-critique.md, blocker
   2. The register prints the boat as a person says it ("Highfield ADV7
   · Hypalon · Black / Grey / Black"), and until today that was the
   only boat string Ctrl K could match a quote by — so a quote a dealer
   remembered by the code on his order sheet ("SP560", "B-G-B") was
   found by the register's own field (`domain/quote/find.ts` reads both)
   and not by the finder. One adapter, pure, so the shell and its test
   read the same thing.
   ============================================================ */
import type { QuoteFacts } from '@/domain/catalogue/search'
import type { Register } from '@/domain/quote/register'

/** Every document the register reads, band by band, as the index takes
 *  it: the boat as the register prints it AND the file's own string. */
export function quoteFactsOf(register: Register): QuoteFacts[] {
  return register.bands.flatMap((band) =>
    band.rows.map((row) => ({
      id: row.id,
      reference: row.reference,
      subject: row.boat,
      label: row.label,
      customer: row.customer ?? '',
      issued: row.state !== 'draft',
      total: row.total,
    })),
  )
}
