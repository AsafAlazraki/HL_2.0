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

   PURE: parts, the picture reader and the quote counts in; the list
   out, every figure counted here and nowhere else.
   ============================================================ */

export interface Worklist<P> {
  /** parts on sale, the denominator */
  total: number
  /** of them, those with no picture of their own */
  without: number
  /** the parts with no picture that quotes here carry, the most quoted first, then the price
   *  list's own order */
  quoted: { part: P; times: number }[]
}

export function unpicturedByUse<P extends { id: string }>(
  parts: readonly P[],
  hasPicture: (id: string) => boolean,
  timesQuoted: ReadonlyMap<string, number>,
): Worklist<P> {
  let without = 0
  const quoted: { part: P; times: number; at: number }[] = []
  for (const [at, part] of parts.entries()) {
    if (hasPicture(part.id)) continue
    without += 1
    const times = timesQuoted.get(part.id) ?? 0
    if (times > 0) quoted.push({ part, times, at })
  }
  return {
    total: parts.length,
    without,
    quoted: quoted
      .toSorted((a, b) => b.times - a.times || a.at - b.at)
      .map(({ part, times }) => ({ part, times })),
  }
}
