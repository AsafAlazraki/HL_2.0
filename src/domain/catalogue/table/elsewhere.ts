/* ============================================================
   WHERE ELSE A WORD IS (the sheet's judge, G8). A search on one list
   that finds nothing used to show the column heads over a blank page;
   the honest answer is a sentence where the list would be, and then
   the other lists of the price file that DO carry the words — counted,
   so the next press is known to land on something.

   Pure, over the rows the store holds. Every word typed must appear in
   the line, in any of its values, as the sheet's own finder reads a
   line; a picture's address is not a word anybody types.
   ============================================================ */
import { isImageValue, type CellValue, type EntityDef, type RowData } from '@/domain/model'

export interface FoundElsewhere {
  tableId: string
  name: string
  count: number
}

const said = (v: CellValue | undefined): string => {
  if (v === null || v === undefined || typeof v === 'boolean') return ''
  if (isImageValue(v)) return ''
  return String(v)
}

/** The words of a query, lowered: "Sport 560" is "sport" and "560". */
export const wordsOf = (query: string): string[] =>
  query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w !== '')

export function lineCarries(row: RowData, words: readonly string[]): boolean {
  if (words.length === 0) return false
  const text = Object.values(row.values).map(said).join(' ').toLowerCase()
  return words.every((w) => text.includes(w))
}

/** The other lists that carry every word, most lines first; never the list being read. */
export function elsewhere(
  tables: Readonly<Record<string, EntityDef>>,
  rows: Readonly<Record<string, readonly RowData[]>>,
  query: string,
  except: string,
  max = 6,
): FoundElsewhere[] {
  const words = wordsOf(query)
  if (words.length === 0) return []
  const out: FoundElsewhere[] = []
  for (const [id, table] of Object.entries(tables)) {
    if (id === except) continue
    const count = (rows[id] ?? []).filter((r) => lineCarries(r, words)).length
    if (count > 0) out.push({ tableId: id, name: table.name, count })
  }
  return out.toSorted((a, b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, max)
}
