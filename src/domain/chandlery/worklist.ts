/* ============================================================
   THE PARTS WITH NO PICTURE, ACROSS EVERY AISLE (the verifier of the
   chandlery, round 1, J9: "There is no worklist across aisles and no
   order by use on quotes").

   Northside works through them in the order that matters at the desk:
   the parts its own quotes carry most often first, so the pictures a
   customer will see are taken before the ones nobody has asked for.
   Only quotes kept on this computer are counted; a part on none is not
   ranked at all, because there is nothing to rank it by, and the
   screen says so rather than inventing an order.

   A LINE THAT TAKES NO PICTURE IS NOT COUNTED: labour and the
   workbook's notes are never drawn with a picture and offer no way to
   add one (the verifier of the chandlery, round 2: "157 of 157 with no
   picture" counted 33 labour lines in Workshop), so the screen says
   which lines it leaves out and this list counts only the parts.

   PURE: parts, the picture reader and the quote counts in; the list
   out, every figure counted here and nowhere else.
   ============================================================ */

export interface Worklist<P> {
  /** parts on sale that take a picture, the denominator */
  total: number
  /** of them, those with no picture of their own */
  without: number
  /** the parts with no picture that quotes here carry, the most quoted first, then the price
   *  list's own order */
  quoted: { part: P; times: number }[]
  /** the lines on sale that take no picture (labour, the workbook's notes), said, never counted */
  untaken: number
  /** by aisle: its parts that take a picture, and how many of them have none */
  byAisle: ReadonlyMap<string, { takes: number; without: number }>
}

export function unpicturedByUse<P extends { id: string; aisle?: string }>(
  parts: readonly P[],
  hasPicture: (id: string) => boolean,
  timesQuoted: ReadonlyMap<string, number>,
  /** whether a line can be given a picture at all; every line can where nothing is said */
  takesPicture: (part: P) => boolean = () => true,
): Worklist<P> {
  let without = 0
  let untaken = 0
  const byAisle = new Map<string, { takes: number; without: number }>()
  const quoted: { part: P; times: number; at: number }[] = []
  for (const [at, part] of parts.entries()) {
    if (!takesPicture(part)) {
      untaken += 1
      continue
    }
    const aisle = byAisle.get(part.aisle ?? '') ?? { takes: 0, without: 0 }
    aisle.takes += 1
    byAisle.set(part.aisle ?? '', aisle)
    if (hasPicture(part.id)) continue
    without += 1
    aisle.without += 1
    const times = timesQuoted.get(part.id) ?? 0
    if (times > 0) quoted.push({ part, times, at })
  }
  return {
    total: parts.length - untaken,
    without,
    untaken,
    byAisle,
    quoted: quoted
      .toSorted((a, b) => b.times - a.times || a.at - b.at)
      .map(({ part, times }) => ({ part, times })),
  }
}
