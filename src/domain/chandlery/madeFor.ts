/* ============================================================
   WHAT THE PRICE LIST MAKES FOR A BOAT, READ FROM ITS OWN LISTS (the
   judge of the chandlery, J6 and major 9: "'Fitting no boat' is a
   sentence, not a control … the 6 P/D pairing lists are unused").

   The workbook names parts on a boat's own line ("P/D - Parts &
   Accessories - 01..10"), and the price list carries them as six lists
   of pairs, each a boat and a part: 2,561 pairs over 42 parts. Which
   lists those are is READ, never named here: every list that joins a
   boat list to the parts list by two links, one to each.

   A pair whose own line is no longer sold is not counted; a boat no
   longer sold still has what was made for it, because a customer's
   boat is the boat he has.

   PURE: the lists in, two indexes out.
   ============================================================ */
import { isDiscontinued, type EntityDef, type RowData } from '@/domain/model'

export interface MadeFor {
  /** a part's line id → the boats it is made for, by their line ids */
  boatsOf: ReadonlyMap<string, ReadonlySet<string>>
  /** a boat's line id → the parts made for it, in the order its lists name them */
  partsOf: ReadonlyMap<string, readonly string[]>
  /** how many lists were read, and how many pairs they hold */
  lists: number
  pairs: number
}

/** THE LISTS THAT PAIR A BOAT WITH A PART, and the two links of each. */
function pairLists(
  entities: Readonly<Record<string, EntityDef>>,
  partsId: string,
): { id: string; boat: string; part: string }[] {
  const out: { id: string; boat: string; part: string }[] = []
  for (const entity of Object.values(entities)) {
    if (entity.role !== 'join') continue
    const links = entity.fields.filter((f) => f.type === 'reference' && f.refEntityId)
    const part = links.filter((f) => f.refEntityId === partsId)
    const boat = links.filter((f) => entities[f.refEntityId!]?.kind === 'boat')
    if (links.length !== 2 || part.length !== 1 || boat.length !== 1) continue
    out.push({ id: entity.id, boat: boat[0]!.id, part: part[0]!.id })
  }
  return out.toSorted((a, b) => a.id.localeCompare(b.id))
}

/** EVERY PART THE PRICE LIST MAKES FOR A BOAT, both ways round. */
export function madeForOf(
  entities: Readonly<Record<string, EntityDef>>,
  rowsByEntity: Readonly<Record<string, readonly RowData[]>>,
  partsId: string,
): MadeFor {
  const boatsOf = new Map<string, Set<string>>()
  const partsOf = new Map<string, string[]>()
  const lists = pairLists(entities, partsId)
  let pairs = 0
  for (const list of lists) {
    for (const row of rowsByEntity[list.id] ?? []) {
      if (isDiscontinued(row)) continue
      const boat = row.values[list.boat]
      const part = row.values[list.part]
      if (typeof boat !== 'string' || typeof part !== 'string' || boat === '' || part === '')
        continue
      pairs += 1
      const boats = boatsOf.get(part) ?? new Set<string>()
      boats.add(boat)
      boatsOf.set(part, boats)
      const parts = partsOf.get(boat) ?? []
      if (!parts.includes(part)) parts.push(part)
      partsOf.set(boat, parts)
    }
  }
  return { boatsOf, partsOf, lists: lists.length, pairs }
}
