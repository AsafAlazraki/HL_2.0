/* ============================================================
   EVERY BOAT A PART IS MADE FOR, BY ITS MAKER (the verifier of the
   chandlery, round 2: "The expanded '73 boats' is one run-on
   paragraph of 73 names, each starting 'Stacer', and the chosen boat
   is not marked").

   The names are the ones `boatsNamed` counts, in the same order, and
   none is added or dropped: each maker is said once over its models,
   and a model is its name with the maker's word taken off the front
   only where the name begins with it. A name that does not is kept
   whole. The customer's boat is marked where it is one of them.

   PURE: names and their makers in; the groups out.
   ============================================================ */

export interface BoatGroup {
  /** the maker as the price list writes it, '' where it says none */
  maker: string
  models: { name: string; model: string; chosen: boolean }[]
}

export function boatsByMaker(
  names: readonly string[],
  makerOf: (name: string) => string,
  chosen = '',
): BoatGroup[] {
  const groups = new Map<string, BoatGroup>()
  for (const name of names) {
    const maker = makerOf(name).trim()
    const group = groups.get(maker) ?? { maker, models: [] }
    const model =
      maker !== '' && name.toLowerCase().startsWith(`${maker.toLowerCase()} `)
        ? name.slice(maker.length + 1).trim()
        : name
    group.models.push({ name, model, chosen: chosen !== '' && name === chosen })
    groups.set(maker, group)
  }
  return [...groups.values()]
}
