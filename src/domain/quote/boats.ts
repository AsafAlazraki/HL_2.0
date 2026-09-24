/* ============================================================
   HOW MANY BOATS — counted the way a person counts them.

   Home said "810 BOATS" and the picker it opens said "289 models from
   7 makers" (docs/directions/built-critique-m2-close-2.md, major 1).
   Both were counts of the file; they counted different things. 810 is
   LINES: a Highfield Sport 560 in fifteen finishes is fifteen lines of
   the price file and one boat on the floor. A person asked "how many
   boats do you sell" means models, so a boat here is a MODEL, and this
   is the one place that decides what a model is. Every screen that
   counts boats asks it.

   A MODEL IS THE FILE'S OWN, never a grouping chosen here. A register
   declares its hierarchy; where it files three levels or more (Highfield:
   Series ▸ Model ▸ Variant) the rows under one trail above the variant
   are one model, and where it files two or fewer (Stacer, Formosa) a
   row is a model. The trail is `trailOf`, the reader the picker and the
   sheet's rail already share, so the three can never disagree.

   WHAT A PERSON COULD BE SOLD, and nothing else: a retired register
   lists nothing and a row marked no longer sold is not counted — the
   same two refusals `buildEntries` makes for the picker.
   ============================================================ */

import { isDiscontinued, isRetired, type EntityDef, type RowData } from '@/domain/model'
import { trailOf } from '@/domain/modules/read'

/** A unit separator between a key's parts, which no name or id contains. */
const SEP = '\u001f'

/** The model a row is a version of, as a key: the register and the
 *  trail above the row on a register that files three levels, and the
 *  row itself on every other register. */
export function modelKeyOf(table: EntityDef, row: RowData): string {
  const deep = (table.hierarchy ?? []).length >= 3
  return deep ? `${table.id}${SEP}${trailOf(table, row)}` : `${table.id}${SEP}${row.id}`
}

export interface MakerBoats {
  id: string
  /** the register's own name */
  name: string
  /** models a person could be sold */
  boats: number
  /** lines of the price file behind them */
  lines: number
}

export interface BoatCount {
  /** models across every maker */
  boats: number
  /** registers with at least one model */
  makers: number
  /** lines of the price file behind them */
  lines: number
  /** per register, in the order the registers were handed in */
  byMaker: MakerBoats[]
}

/** Every boat on the file, counted as models. */
export function countBoats(
  tables: Readonly<Record<string, EntityDef>> | readonly EntityDef[],
  rows: Readonly<Record<string, readonly RowData[]>>,
  kind = 'boat',
): BoatCount {
  const list = (Array.isArray(tables) ? tables : Object.values(tables)) as EntityDef[]
  const byMaker: MakerBoats[] = []
  for (const table of list) {
    if (table.kind !== kind || isRetired(table)) continue
    const keys = new Set<string>()
    let lines = 0
    for (const row of rows[table.id] ?? []) {
      if (isDiscontinued(row)) continue
      lines += 1
      keys.add(modelKeyOf(table, row))
    }
    byMaker.push({ id: table.id, name: table.name, boats: keys.size, lines })
  }
  const counted = byMaker.filter((m) => m.boats > 0)
  return {
    boats: counted.reduce((n, m) => n + m.boats, 0),
    makers: counted.length,
    lines: counted.reduce((n, m) => n + m.lines, 0),
    byMaker,
  }
}

/** "1 boat", "289 boats" — the noun a count of models takes. */
export const boatsSaid = (n: number): string =>
  `${n.toLocaleString('en-AU')} ${n === 1 ? 'boat' : 'boats'}`
