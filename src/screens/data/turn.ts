import { canMorph, morph, sharedName } from '@/ui'

/* ============================================================
   A PRESS THAT OPENS, CLOSES OR CHANGES A MAKER'S SPREAD, TURNED THE
   WAY A PAGE IS (2026-09-28, the component kit).

   The maker's own mark is the showpiece of this screen ("I want the
   logo to be the showpiece thing"), and a press on its plate now shows
   where the spread came from: the mark lifts off the plate on the shelf
   and flies into the spread's cover, growing as it lands, while the
   ledger and the spread crossfade under it. Closing flies it home, and
   pressing another maker sends the open one back to its plate as the
   new one comes down. It is the View Transitions API — the browser's
   own, no library — with ONE named thing in it, the mark, because only
   a picture ever travels in this app and never a figure.

   IT IS THE KIT'S `morph` (src/ui/transition.ts), typed `turn`. Its promises are held
   there, once, for every transition in the app: a transition the browser skips — because
   another began over it, as the router's does on a change of screen — rejects `ready` and
   `finished` with "Transition was skipped", which was a page error on a cold load of /data
   until the kit owned them (2026-09-28, the verify round; this file caught its own first).

   IT DOES NOTHING CLEVER WHEN IT SHOULD NOT MOVE: under reduced motion,
   while a caret is in a field, or in a browser without the API, the
   change simply happens (`canMorph`). And the screen asks for it only
   for a POINTER's press whose spread opens where it can be seen — a key
   is never animated, and a phone's spread opens a screen and a half
   down, where a mark flying off the bottom edge would be a press that
   seemed to throw the logo away.
   ============================================================ */

/** Whether a turn would run here, now. */
export const canTurn = canMorph

/**
 * Run `update` inside a view transition, or simply run it where one would not. The transition
 * is typed `turn`, so this screen's stylesheet can shape the crossfade under the mark — the
 * ledger leaves faster than the spread arrives, through a two-pixel blur, so the two are never
 * read on top of each other (data.css, "the page turning") — without touching the route's.
 */
export function turn(update: () => void): void {
  morph(update, ["turn"])
}

/**
 * THE NAME A MAKER'S MARK TRAVELS UNDER, the same on the shelf, on the spread's cover and on
 * the sheet's masthead (src/screens/sheet/Sheet.tsx names its own the same way), so the mark
 * flies from Data into the sheet it opens and back. One element at a time carries it: a plate
 * whose spread is open gives its name to the cover.
 */
export const markName = (tableId: string): string => sharedName(`mark-${tableId}`)
