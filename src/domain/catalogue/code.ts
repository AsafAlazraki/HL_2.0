/* ============================================================
   THE CODE A DEALER ORDERS BY — which column of a table holds it.

   Written 2026-09-24 for the finder (critique of Milestone 2's close,
   #8): "`HBS126` (the code a dealer orders by) answers 'Nothing in
   this browser matches'". The search index read one column per row,
   the one a table names itself by, and on Highfield that is
   "Highfield - SP560 (HYP) B-B-B". The code lives in its own column,
   `Model Code`, and nothing folded it — while the sheet's own field,
   which reads every cell, found it. Two answers to "is HBS126 here?"
   on one sheet.

   THE SPELLINGS ARE THE FILE'S, MOST SPECIFIC FIRST, and they are the
   same five the quote engine already reads a line's code by
   (`src/domain/quote/freeze.ts`, `CODE_NAMES`): measured on the pack,
   every one of the seven boat tables says `Model Code`, every trailer
   table `Code`, the motors `Model Code`, the rigging kits `Part
   Number` and the oils `Part No.`. `PD Operation Code` and `REV Code`
   are not a code a dealer orders a thing by, and neither is matched.

   TEXT COLUMNS ONLY, for freeze.ts's own reason: a code is a code even
   when it is all digits, and a number column wearing a code's name is
   a quantity or a price.

   FREEZE.TS KEEPS ITS OWN COPY OF THE LIST. It is the golden engine
   and this round does not touch it; the day it is next opened it
   should read `CODE_NAMES` from here, and `code.test.ts` pins the
   list so the two cannot drift silently in the meantime.
   ============================================================ */
import type { EntityDef, FieldDef } from '@/domain/model'
import { normName } from '@/domain/quote/pricing'

export const CODE_NAMES = ['model code', 'part number', 'part no', 'product code', 'code'] as const

/** The column this table keeps its order code in, or undefined where
 *  it keeps none. The name is compared the way the quote engine
 *  compares one (`normName`: no case, no punctuation), so "Part No."
 *  is "part no" here exactly as it is on a frozen line. */
export function codeFieldOf(entity: EntityDef): FieldDef | undefined {
  for (const wanted of CODE_NAMES) {
    const field = entity.fields.find((f) => f.type === 'text' && normName(f.name) === wanted)
    if (field) return field
  }
  return undefined
}
