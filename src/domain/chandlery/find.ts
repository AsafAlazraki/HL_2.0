/* ============================================================
   FIND A PART BY ANY WORD THE PRICE LIST CARRIES FOR IT — its name,
   its code, its supplier and its heading (the judge of the chandlery,
   J3, J4 and major 5).

   The old field read the product words alone and refused a code with
   "A code is not a name", so `SG002` found nothing although every line
   carries a Code, `lowrance` found 5 of the 144 Lowrance lines (their
   heading is LOWRANCE; their names are "HDS PRO 9…") and `yamaha` 39
   of 671. The shell's finder already reads codes (DECISIONS
   2026-09-24); the chandlery now reads what the file carries.

   EVERY WORD TYPED MUST BE SOMEWHERE in a line's words, and THE NAME
   RANKS FIRST: the lines whose name carries every word come before the
   lines found by their code, supplier or heading, each run in the
   price list's own order. Nothing is ranked by a score nobody can read.

   PURE: lines and words in, the lines found out.
   ============================================================ */

/** What find reads of one line, every word the price list carries for it. */
export interface Findable {
  /** the name as a person says it, and the file's own product words */
  name: string
  product: string
  code: string
  /** the workbook's operation code, often the code again */
  op?: string
  heading: string
  /** the supplier as the file writes it, and as Northside named it */
  maker: string
  makerSaid?: string
}

/** The words of a query: lower case, split on space, empties dropped. */
export const wordsOf = (query: string): string[] =>
  query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w !== '')

/** The fewest letters a find answers to; one letter would find most of the list. */
export const FIND_MIN = 2

/**
 * THE LINES THE WORDS FIND, the name's first. `byName` counts how many of them were found by
 * their name, so a screen can say where the rest came from.
 */
export function findLines<L extends Findable>(
  lines: readonly L[],
  query: string,
): { found: L[]; byName: number } {
  const words = wordsOf(query)
  if (words.length === 0 || query.trim().length < FIND_MIN) return { found: [], byName: 0 }
  const named: L[] = []
  const rest: L[] = []
  for (const line of lines) {
    const name = `${line.name} ${line.product}`.toLowerCase()
    if (words.every((w) => name.includes(w))) {
      named.push(line)
      continue
    }
    const all =
      `${name} ${line.code} ${line.op ?? ''} ${line.heading} ${line.maker} ${line.makerSaid ?? ''}`.toLowerCase()
    if (words.every((w) => all.includes(w))) rest.push(line)
  }
  return { found: [...named, ...rest], byName: named.length }
}
