/* ============================================================
   HOW MANY MEASURES STAND ACROSS THE SPECIFICATION SHEET.

   The audit, round 3, P13: at 834 the hull's sheet stood its eleven
   measures five across, so the eleventh stood alone in a row of five,
   and at 834 a motor's four stood in a row of five with an empty cell
   beside them. The sheet takes as many across as its room holds, and
   then as few as still keep its rows as many: eleven in room for five
   is three rows, and three rows of eleven are four across — four,
   four and three, the last row's three sharing its width.

   PURE: a count and two widths in, a count out.
   ============================================================ */

/**
 * The measures across one row of the sheet: never more than `room` holds at `least` each, never
 * more than there are, and as few as keep the rows that many — so no row stands one or two alone
 * under full ones.
 */
export function acrossTheSheet(count: number, room: number, least: number): number {
  if (count <= 0) return 1
  const most = Math.max(1, Math.floor(room / Math.max(1, least)))
  if (count <= most) return count
  const rows = Math.ceil(count / most)
  return Math.ceil(count / rows)
}
