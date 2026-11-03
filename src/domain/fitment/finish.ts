/* ============================================================
   A VERSION'S FINISH AS A PERSON SAYS IT (the fitment verifier,
   2026-11-03: the Sport 660's version list said "Hypalon · I-B-C" in
   raw code while its fifteen siblings were spoken).

   `colourway.ts` leaves a code with an unknown part unread rather than
   guess it — `I` is in none of the production maps — so the honest
   answer is not a colour name. It is the code, named as the code it
   is: "Hypalon · colour code I-B-C". A read colourway is said as
   `spokenBoat` says it, untouched.

   Pure: no React, no store.
   ============================================================ */
import type { SpokenBoat } from '@/domain/quote/spoken'

export function finishSaid(said: Pick<SpokenBoat, 'trim' | 'material' | 'colour' | 'detail'>) {
  if (!said.colour || said.colour.read || said.colour.code === '') return said.detail
  return [said.trim, said.material, `colour code ${said.colour.code}`]
    .filter((s) => s !== '')
    .join(' · ')
}
