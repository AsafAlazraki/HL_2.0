/* ============================================================
   A FIGURE UNDER NOUGHT — a credit where the price list says it is
   one, and no price anywhere else.

   MEASURED on the Master Price File, 2026-11-04 (the verifier of
   Prices, round 2, blocker): nine figures under $0 stand in a sell
   column on the whole file, on seven lines.

     Parts & Accessories   2 lines, Sell and Sell inc Install −$531
                           and −$115: "CREDIT - Batteries (2 x MFM70)"
                           and "CREDIT - Battery Switch - Dual", in the
                           category CREDIT ALLOCATIONS, install type
                           CREDIT PART. The file means them: a credit
                           given back on a fit-out.
     Jeanneau Factory      5 lines, Sell Price, RRP + Freight Inc GST
     Packages              and Trade Price alike, −$2,030 to −$29,390:
                           every one a Jeanneau with Mercury motors, its
                           Dealer List Price itself under nought. A boat
                           with its motors is never sold for less than
                           nothing; no word on the line calls it a
                           credit.

   So a line the price list names a credit — any of its words opens on
   "CREDIT" — holds a price under nought, and every other figure under
   nought is no price at all. Prices counted the five packages as
   priced ("78 of 89") and its look-up gave a customer −$29,390.

   Pure: no React, no store.
   ============================================================ */

import type { RowData } from '@/domain/model'

const CREDIT = /^\s*credit\b/i

/** The price list names the line a credit: one of its words opens on "CREDIT" (the category
 *  CREDIT ALLOCATIONS, the install type CREDIT PART, the name "CREDIT - Batteries"). */
export function isCredit(row: RowData): boolean {
  for (const v of Object.values(row.values))
    if (typeof v === 'string' && CREDIT.test(v)) return true
  return false
}
