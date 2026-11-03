/* ============================================================
   THE BOATS A PART IS MADE FOR, SAID AS THEY ARE COUNTED (the
   verifier of the chandlery, round 1, J6: "'Made for 91 boats:
   Stacer 309, 319, 359 and 70 more' names 73, not 91: the count
   counts boat rows and the list counts names").

   The price list pairs a part with boat LINES, and one boat is often
   several lines — the same hull in two packages, or a line no longer
   sold beside the one that is. A person counts boats by their names,
   so the count is the names, and the names it shows plus "and N more"
   add up to that count exactly. The rest are handed back in full, so
   the screen can show every one of them on a press and none is lost.

   PURE: line ids and a way to name them in; the names out.
   ============================================================ */

export interface BoatsNamed {
  /** how many boats, by their names: shown.length + rest.length */
  count: number
  /** the first names, in the order the price list pairs them */
  shown: string[]
  /** every other name, in the same order */
  rest: string[]
}

/** THE BOATS OF A PART, ONE NAME EACH: lines with the same name are one boat; a line with no
 *  name is not a boat anyone can say, and is left out of both the count and the names. */
export function boatsNamed(
  lineIds: readonly string[],
  nameOf: (id: string) => string | undefined,
  show = 3,
): BoatsNamed {
  const names: string[] = []
  const seen = new Set<string>()
  for (const id of lineIds) {
    const name = nameOf(id)?.trim() ?? ''
    if (name === '' || seen.has(name)) continue
    seen.add(name)
    names.push(name)
  }
  /* "A, B, C and 1 more" says no more than "A, B, C and D": a single one left is named */
  const cut = names.length === show + 1 ? names.length : Math.min(show, names.length)
  return { count: names.length, shown: names.slice(0, cut), rest: names.slice(cut) }
}
