/* ============================================================
   THE LISTS OF WHAT FITS WHICH BOAT, AS ONE TABLE: each boat maker down
   the side, what its lists pair it with across the top, and the lines
   in each list where they cross (Data, 2026-11-03, the judge's L6 and
   board C's matrix grafted onto direction A).

   28 of the price list's 53 lists, 8,679 of its 15,691 lines, are the
   lists that say which motor, trailer, package or part goes on which
   boat. Until this table they were glyphs on a plate. Here every one
   is a figure with a door.

   THE COLUMNS ARE THE KINDS OF THING A BOAT IS PAIRED WITH, read off
   each list's own far side (`Pairing.farKind`), in the order a boat is
   built — its motor, its trailer, its packages, its parts — and any
   other kind after them in the order the makers first name it. Nothing is grouped by a name typed here: a
   column is a kind the file declares, and a cell lists every list of
   that kind the maker has, by the words the file gives it after its
   "×" ("Highfield × NSM Custom" → "NSM Custom").

   Pure: it reads the register's own plates and pairings.
   ============================================================ */
import type { TableKind } from '@/domain/model'
import type { Pairing, Plate } from './register'

export interface MatrixCell {
  joinId: string
  /** the far side, in the list's own words */
  said: string
  lines: number
  retired: boolean
}

export interface MatrixRow {
  /** the boat list */
  id: string
  name: string
  /** by column, in the columns' order; an empty cell is no list of that kind */
  cells: MatrixCell[][]
  lists: number
  lines: number
}

export interface FitsMatrix {
  columns: TableKind[]
  rows: MatrixRow[]
  lists: number
  lines: number
}

/**
 * THE FAR SIDE IN THE LIST'S OWN WORDS: what follows its "×", with the "— Motor Fitment" the
 * packer appends taken off. A list named without a "×" is called by its far side's own name.
 */
export function farSaid(joinName: string, farName: string): string {
  const at = joinName.indexOf('×')
  if (at < 0) return farName
  const said = joinName
    .slice(at + 1)
    .replace(/\s+[—–-]\s+\w+\s+Fitment\s*$/i, '')
    .trim()
  return said === '' ? farName : said
}

/** The order a boat is built in: the columns stand in it. */
const BUILT: readonly TableKind[] = ['motor', 'trailer', 'package', 'accessory']
const builtAt = (kind: TableKind): number => {
  const at = BUILT.indexOf(kind)
  return at < 0 ? BUILT.length : at
}

export function fitsMatrixOf(plates: readonly Plate[], pairings: readonly Pairing[]): FitsMatrix {
  const columns: TableKind[] = []
  for (const plate of plates)
    for (const p of pairings)
      if (p.ownerId === plate.id && !columns.includes(p.farKind)) columns.push(p.farKind)
  columns.sort((a, b) => builtAt(a) - builtAt(b))
  const rows: MatrixRow[] = plates.map((plate) => {
    const mine = pairings.filter((p) => p.ownerId === plate.id)
    return {
      id: plate.id,
      name: plate.name,
      cells: columns.map((kind) =>
        mine
          .filter((p) => p.farKind === kind)
          .map((p) => ({
            joinId: p.joinId,
            said: farSaid(p.joinName, p.farName),
            lines: p.rows,
            retired: p.retired,
          })),
      ),
      lists: mine.length,
      lines: mine.reduce((n, p) => n + p.rows, 0),
    }
  })
  return {
    columns,
    rows,
    lists: rows.reduce((n, r) => n + r.lists, 0),
    lines: rows.reduce((n, r) => n + r.lines, 0),
  }
}
