/* ============================================================
   WHY A THING DOES OR DOES NOT GO ON A BOAT — said once, here.

   THE ONE MISSING ENGINE PIECE the fitment sweep named
   (docs/research/refs/fitment/notes.md §0.4): `offer.ts` keeps every
   reason as a closed record of FACTS, and composes the sentence "at the
   surface that prints it". Only `blocked` and `warned` ever carried a
   sentence of their own. The fitment screen's brief forbids a component
   writing one, so every sentence a struck thing carries on any screen is
   composed by this file, from the figures the verdict carries, and from
   nothing else.

   IN THE DEALER'S WORDS (docs/WORDS.md): "made for this boat", never
   "paired"; "this boat", never "this hull"; the price list, never the
   file. A dealer's own rule is quoted, never rephrased: its `because` is
   the clause the person wrote, and where they wrote none this returns ''
   so the surface names the rule instead.
   ============================================================ */

import type { Verdict } from '@/domain/model'
import type { FloorVerdict } from './trailerFitment'
import type { Envelope, HullEnvelope } from './envelope'

const AU = new Intl.NumberFormat('en-AU', { maximumFractionDigits: 1 })

/** A figure as the trade writes it: 2.5, 150, 1,990. */
export const figure = (n: number): string => AU.format(n)

/** One envelope, as a dealer says it: "150–200 hp", "up to 200 hp",
 *  "40 hp" where both bounds agree, "2 × 200–250 hp" for twins. */
export function envelopeSaid(e: Pick<Envelope, 'count' | 'min' | 'max'>): string {
  const lead = e.count > 1 ? `${e.count} × ` : ''
  if (e.min !== null && e.max !== null) {
    return e.min === e.max
      ? `${lead}${figure(e.min)} hp`
      : `${lead}${figure(e.min)}–${figure(e.max)} hp`
  }
  if (e.max !== null) return `${lead}up to ${figure(e.max)} hp`
  if (e.min !== null) return `${lead}${figure(e.min)} hp or more`
  return ''
}

/** Everything a boat's row says it takes, each way of rigging it named
 *  once: "150–200 hp", or "250–350 hp, or 2 × up to 200 hp". */
export function hullEnvelopeSaid(hull: HullEnvelope): string {
  return hull.rigs
    .map(envelopeSaid)
    .filter((s) => s !== '')
    .join(', or ')
}

/** A motor's own rig: "175 hp", "2 × 225 hp". */
export const rigSaid = (rig: { count: number; each: number }): string =>
  `${rig.count > 1 ? `${rig.count} × ` : ''}${figure(rig.each)} hp`

/** What one fact about a candidate says. '' only for a dealer's rule
 *  written without a reason, which the surface then names. */
export function sayVerdict(v: Verdict): string {
  switch (v.kind) {
    case 'outside-envelope': {
      const range = envelopeSaid({ count: v.count ?? 1, min: v.min, max: v.max })
      const under = v.min !== null && v.hp < v.min
      return `${under ? 'Under' : 'Over'} the ${range} this boat takes.`
    }
    case 'built-for-another':
      return v.subjectMarque === null
        ? `Built for ${v.bannerMarque}.`
        : `Built for ${v.bannerMarque}, not ${v.subjectMarque}.`
    case 'under-floor':
      return `Rated ${figure(v.capacity)} kg, under the ${figure(v.load)} kg this boat weighs.`
    case 'floor-not-evaluable':
      return v.why
    case 'outside-rule': {
      const named = v.failed.map((c) => c.field).filter((f) => f !== '')
      return named.length === 0
        ? NOT_MADE_FOR_IT
        : `Its ${[...new Set(named)].join(' and ')} does not suit this boat.`
    }
    case 'removed':
      return 'Taken off this boat by hand.'
    case 'discontinued':
      return 'No longer sold.'
    case 'retired-table':
      return 'From a list that is no longer sold.'
    case 'retired-pairs':
      return 'What fits this boat from this list is no longer sold.'
    case 'blocked':
    case 'warned':
      return v.because
  }
}

/** The curated case: the price list never says it goes with this boat.
 *  It is a fact about the list, not a fault in the thing. */
export const NOT_MADE_FOR_IT = 'Not made for this boat.'

/** Made for this boat, and refused by one of the dealer's own rules: what the build says above
 *  its list ("Not offered on this boat: …"), said once over the ones struck, each with its rule's
 *  own because beside it. */
export const RULE_REFUSES = 'Not offered on this boat, because one of your rules refuses it.'

/** The count beside "n of m made for this boat" where a rule refuses some of what is made for it:
 *  "1 refused by your rule", "3 refused by your rules". '' where none is. */
export function refusedSaid(refused: number, rules: number): string {
  if (refused <= 0) return ''
  return `${AU.format(refused)} refused by your ${rules > 1 ? 'rules' : 'rule'}`
}

/** A trailer whose series names no boat maker: not ruled out, not made
 *  for this boat either. */
export const NAMES_NO_MAKER = 'Its series names no boat maker.'

/** THE ONE-TRAILER RULE, as the dealer says it. A boat goes home on one
 *  trailer, so the second the price list offers is offered in place of
 *  the first, never beside it (`oneTrailer.ts`). */
export const ONE_TRAILER = 'One trailer to a boat, because a boat sits on one trailer.'

/** The boat's own weight is not on the price list, so no trailer's ATM
 *  can be weighed against it. Said once, for the boat. */
export const BOAT_NOT_WEIGHED =
  'The price list gives no weight for this boat, so no trailer’s ATM is checked against it.'

/** One trailer's ATM is not on the price list. */
export const TRAILER_NOT_RATED = 'No ATM on the price list for this trailer.'

/** What the ATM floor found, as one line: "Rated 1,990 kg · the boat
 *  weighs 740 kg · clears it by 1,250 kg". It is a warning and never a
 *  removal (`trailerFitment.ts`, F9). The engine's own `why` names the
 *  columns it looked for; the dealer is told which side has no figure,
 *  which is what `boatWeighed` says. */
export function floorSaid(floor: FloorVerdict, boatWeighed: boolean): string {
  switch (floor.kind) {
    case 'clears':
      return `Rated ${figure(floor.capacity)} kg · the boat weighs ${figure(floor.load)} kg · clears it by ${figure(floor.capacity - floor.load)} kg`
    case 'under':
      return `Rated ${figure(floor.capacity)} kg · the boat weighs ${figure(floor.load)} kg · ${figure(floor.load - floor.capacity)} kg short`
    case 'not-evaluable':
      return boatWeighed ? TRAILER_NOT_RATED : BOAT_NOT_WEIGHED
  }
}
