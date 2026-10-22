/* ============================================================
   THE RIGGING KIT A MOTOR NAMES — the four pure readings the swap
   and the mint both need.

   They lived in `swap.ts`, which runs commands and so imports
   `commands.ts`, which imports `freeze.ts`. The mint (`freeze.ts`)
   now needs `kitGoesWith` too — a kit the price list stars FOR a motor
   the dealer's rule refuses is held back with that motor
   (built-critique-m3-2.md, blocker 1) — and reaching into `swap.ts`
   from there would close a circle. So they stand here, on their own,
   and `swap.ts` re-exports them under the names it always had.

   A name is its letters and figures in order: "Yamaha - F90LB" and
   "Yamaha · F90LB" are one, and never by resemblance: "F90LB2 - White"
   is not the F90LB. Pure: no React, no store.
   ============================================================ */

import type { QuoteLine } from '@/domain/model'

/** A name as its letters and figures, in order: "Yamaha - F90LB" and "yamaha · f90lb" are one. */
export const nameKey = (name: string): string => name.toLowerCase().replace(/[^a-z0-9]+/g, '')

const factOf = (line: QuoteLine, label: string): string =>
  (line.pairFacts ?? []).find((f) => f.label.trim().toLowerCase() === label)?.value.trim() ?? ''

/** The motor a line's own pairing names — a rigging kit's `Motor` — or ''. */
export const motorNamedBy = (line: QuoteLine): string => factOf(line, 'motor')

/** The rigging kit a motor's own pairing names — its `Rigging Kit Option` — or ''. */
export const kitNamedBy = (line: QuoteLine): string => factOf(line, 'rigging kit option')

/** This line is the kit `motor` names, or names `motor` as its own. */
export function kitGoesWith(kit: QuoteLine, motor: QuoteLine): boolean {
  const named = kitNamedBy(motor)
  if (named !== '' && nameKey(named) === nameKey(kit.label)) return true
  const of = motorNamedBy(kit)
  return of !== '' && nameKey(of) === nameKey(motor.label)
}
