/* ============================================================
   WHAT A WAY BACK SAYS — the sentence of an undo or a redo.

   The store used to prefix the step's own sentence: "Undone — Trade
   is 95% of Cash on 91 Stacer boats." The built critique of
   Milestone 3 read it the way a dealer does: the claim is the part
   the eye takes in, so a toast that has just TAKEN the price back
   said the price stands. Review's said a trailer "is registered Large
   at $283" when it was Small at $166 again.

   So the two shapes a step's words come in are said differently:

     · A LABEL names the step ("Cell edit · Boats", "Row deleted ·
       Boats"). It claims nothing about the price list, so "Undone —
       Cell edit · Boats" is true as it stands, and is kept.
     · A SENTENCE says what the price list now holds ("Every “X” now
       sells at $1,200."). Taken back, it is NO LONGER SO, and the
       words say that before the claim, never after it. Put back,
       the claim is true again and is said as such.

   A sentence is told from a label by the event itself: `label` is
   `said` for every act but one that carried a sentence of its own
   (`CatalogueEvent.label`).
   ============================================================ */

export type WayBackKind = 'undone' | 'redone'

/**
 * The sentence an undo or a redo says about the step it reverses.
 * `said` is the step's own words, `label` what History calls it.
 */
export function wayBackSaid(kind: WayBackKind, said: string, label: string): string {
  const sentence = said.trim()
  if (sentence === '' || sentence === label.trim())
    return `${kind === 'undone' ? 'Undone' : 'Redone'} — ${label.trim() || sentence}`
  return kind === 'undone' ? `Undone. No longer so: ${sentence}` : `Put back: ${sentence}`
}
