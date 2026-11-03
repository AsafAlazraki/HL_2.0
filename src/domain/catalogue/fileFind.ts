/* ============================================================
   ONE FIND OVER THE WHOLE PRICE FILE — Data's find (the judge of
   Data, 2026-11-03, L5).

   Data's find looked only at the names of its eighteen rows, so
   "Highfield" answered "Nothing on the price list is called
   Highfield" under the Highfield plate, and F115, KAM and "motor
   fitment" answered nothing. This reads the four things the file is
   made of, and counts each:

     MAKERS    a boat list whose name holds every word
     LISTS     any list, a list of what fits which boat included, whose
               name holds every word
     SECTIONS  a heading of a list's first level (its Series, Category
               or Section) that holds every word, with its lines
     LINES     a line whose own words hold every word, counted by list

   A LINE'S OWN WORDS are its text cells: its name, code, supplier,
   notes, a list of what fits' label. Not a number (a price is not a
   word, and "115" must not answer every $1,150), not a reference
   column (an id the engine keeps, never shown), not the cell that says
   which workbook row it was read from, and not the engine's own keys.

   EVERY WORD MUST HIT, as the app's other finds read a query; case is
   not read. Fewer than two letters reads nothing, and the screen says
   why rather than searching fifteen thousand lines for "a".

   The index is built once per price list and the find is a scan of
   pre-folded strings: 15,691 short strings on this file.

   Pure: no store, no DOM.
   ============================================================ */
import type { EntityDef, RowData } from '@/domain/model'

/** Fewer letters than this read nothing. */
export const FIND_AT_LEAST = 2

interface IndexedTable {
  id: string
  name: string
  hay: string
  role: 'base' | 'join'
  boat: boolean
  first: string | null
  /** each line's own words, folded */
  lines: string[]
  /** each line's first-level heading, as the file writes it, or null */
  heads: (string | null)[]
}

export interface FileIndex {
  tables: IndexedTable[]
}

const fold = (s: string): string => s.toLowerCase()

/** The words a query asks for, folded; empty for a query of nothing. */
export const wordsOf = (query: string): string[] =>
  fold(query)
    .split(/\s+/)
    .filter((w) => w !== '')

const ENGINE_KEY = /^__|\.src$/

/** Build the index once, off what loaded. */
export function fileIndexOf(
  tables: Readonly<Record<string, EntityDef>> | readonly EntityDef[],
  rows: Readonly<Record<string, readonly RowData[]>>,
): FileIndex {
  const list = Array.isArray(tables)
    ? (tables as readonly EntityDef[])
    : Object.values(tables as Record<string, EntityDef>)
  const out: IndexedTable[] = []
  for (const table of list) {
    const refs = new Set(table.fields.filter((f) => f.type === 'reference').map((f) => f.id))
    const first = table.role === 'join' ? null : (table.hierarchy?.[0] ?? null)
    const lines: string[] = []
    const heads: (string | null)[] = []
    for (const row of rows[table.id] ?? []) {
      const words: string[] = []
      for (const [key, value] of Object.entries(row.values)) {
        if (typeof value !== 'string' || ENGINE_KEY.test(key) || refs.has(key)) continue
        const said = value.trim()
        if (said !== '') words.push(said)
      }
      lines.push(fold(words.join('   ')))
      const h = first ? row.values[first] : undefined
      heads.push(typeof h === 'string' && h.trim() !== '' ? h.trim() : null)
    }
    out.push({
      id: table.id,
      name: table.name,
      hay: fold(table.name),
      role: table.role === 'join' ? 'join' : 'base',
      boat: table.kind === 'boat',
      first,
      lines,
      heads,
    })
  }
  return { tables: out }
}

export interface FoundSection {
  tableId: string
  tableName: string
  heading: string
  lines: number
}

export interface FoundLines {
  tableId: string
  tableName: string
  /** a list of what fits which boat, or a list you sell from */
  role: 'base' | 'join'
  lines: number
}

export interface FileFound {
  /** the words read, folded; empty when the query was too short to read */
  words: string[]
  /** too short to read: fewer than `FIND_AT_LEAST` letters */
  tooShort: boolean
  makers: string[]
  lists: string[]
  sections: FoundSection[]
  /** by list, the most first (a tie in the order handed in) */
  lines: FoundLines[]
  /** every line named, across every list */
  totalLines: number
}

const hits = (hay: string, words: readonly string[]): boolean => words.every((w) => hay.includes(w))

/** What on the price file answers to a query. */
export function findInFile(index: FileIndex, query: string): FileFound {
  const words = wordsOf(query)
  const letters = words.join('').length
  const none: FileFound = {
    words: [],
    tooShort: letters > 0 && letters < FIND_AT_LEAST,
    makers: [],
    lists: [],
    sections: [],
    lines: [],
    totalLines: 0,
  }
  if (letters < FIND_AT_LEAST) return none
  const makers: string[] = []
  const lists: string[] = []
  const sections: FoundSection[] = []
  const lines: FoundLines[] = []
  let totalLines = 0
  for (const t of index.tables) {
    if (hits(t.hay, words)) {
      if (t.boat) makers.push(t.id)
      lists.push(t.id)
    }
    if (t.first) {
      const counted = new Map<string, number>()
      for (const h of t.heads) if (h !== null) counted.set(h, (counted.get(h) ?? 0) + 1)
      for (const [heading, n] of counted)
        if (hits(fold(heading), words))
          sections.push({ tableId: t.id, tableName: t.name, heading, lines: n })
    }
    let n = 0
    for (const line of t.lines) if (hits(line, words)) n += 1
    if (n > 0) {
      lines.push({ tableId: t.id, tableName: t.name, role: t.role, lines: n })
      totalLines += n
    }
  }
  lines.sort((a, b) => b.lines - a.lines)
  return { words, tooShort: false, makers, lists, sections, lines, totalLines }
}
