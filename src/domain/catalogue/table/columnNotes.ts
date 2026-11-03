/* ============================================================
   WHAT A COLUMN OF THE PRICE FILE IS, WHERE ITS NAME DOES NOT SAY.

   Labour Rates says "Actual $105" once over its eighteen rates, and
   nothing on the screen said what Actual is (the sheet's verifier,
   2026-11-03). Its name does not say, and the column carries no GST
   word. What it is was measured when the file was packed, and is
   written in the column's own description in `data/northside/`:

     typed, 105 on every row; it is the rate Std Service Schedules
     costs a workshop hour at, 1,727 times, while Operation Codes,
     Parts Maintenance, Dealer Fit Module and Boat Module all cost
     the same hour at Rate (Exc GST)'s 130.09; which is right is a
     question only the owner can answer.

   The note below says that in a sentence a person reads, and nothing
   more: no figure here that the file does not carry, and no answer to
   the question it leaves with Northside. A column with no note says
   nothing extra.

   Pure: no React, no store.
   ============================================================ */

const NOTES: Readonly<Record<string, string>> = {
  'labour_rates.e':
    'The hour Std Service Schedules costs work at. Operation Codes, Parts Maintenance, Dealer Fit and the Boat Module cost the same hour at $130.09, from Rate (Exc GST). Which one is right is Northside’s to say.',
}

/** What a column is, in a sentence, where its name does not say — or '' for none. */
export function columnNote(fieldId: string): string {
  return NOTES[fieldId] ?? ''
}
