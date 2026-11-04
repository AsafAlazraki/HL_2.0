/* ============================================================
   WHAT THE CATALOGUE HOLDS OF THE PARTS LIST, COUNTED SO IT AGREES
   WITH DATA (the section critic, 2026-11-04: "Data counts the same
   Parts list as 187 categories and 2,937 products, and nothing says
   the 180 is only what is on sale").

   Data's plate counts every line of the list and every heading it
   files them under (src/domain/modules/register.ts, `distinctBranches`):
   a heading is the first rung of the list's own hierarchy, trimmed,
   and a line with none is under no heading. The catalogue shows only
   the lines still sold. Both figures are read here by that one rule,
   so the catalogue can say its share OF Data's figure — never a second
   figure for the same list.

   PURE: lines in, counts out. No React, no store.
   ============================================================ */

/** One line of the parts list as this count reads it. */
export interface CountedLine {
  /** the heading the list files it under, as written (a number is read as written) */
  heading: unknown
  /** whether it is still sold */
  sold: boolean
}

export interface ShelfCount {
  /** every line on the list, sold or not: Data's figure */
  lines: number
  /** the lines still sold: the catalogue's */
  onSale: number
  /** the lines no longer sold */
  gone: number
  /** the distinct headings over every line: Data's figure */
  headings: number
  /** the distinct headings the lines still sold stand under */
  headingsOnSale: number
  /** the lines still sold that the list files under no heading */
  onSaleUnheaded: number
}

/** A heading as Data reads it: trimmed text, or a number as written; '' is none. */
export function headingOf(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  return ''
}

/** THE PARTS LIST, COUNTED BOTH WAYS: all of it as Data counts it, and what of it is on sale. */
export function shelfCountOf(lines: readonly CountedLine[]): ShelfCount {
  const all = new Set<string>()
  const sold = new Set<string>()
  let onSale = 0
  let onSaleUnheaded = 0
  for (const line of lines) {
    const h = headingOf(line.heading)
    if (h !== '') all.add(h)
    if (!line.sold) continue
    onSale += 1
    if (h === '') onSaleUnheaded += 1
    else sold.add(h)
  }
  return {
    lines: lines.length,
    onSale,
    gone: lines.length - onSale,
    headings: all.size,
    headingsOnSale: sold.size,
    onSaleUnheaded,
  }
}
