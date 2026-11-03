/* ============================================================
   THE DATE A SECTION SAYS IT WAS PRICED, IN ITS OWN WORDS.

   Some of the price list's section headings carry the day their prices
   were set, written into the heading itself: "LOWRANCE – HDS Live (as
   at 31/10/22)", "RIGGING KITS – Jeanneau DB/43 OB (as at 19/5/2022)".
   Nothing else in the file dates a price. Data says how current the
   price list is from these, and only from these (the judge of Data,
   2026-11-03, L1: "No date is ever inferred where the heading does not
   say one").

   WHAT IS READ. "as at" followed by a day, a month and a year, the
   three apart by a slash, a stop or a dash, the year in two digits or
   four — the shapes the file writes. The day comes first, as an
   Australian writes it. A date that is not a day of the calendar
   ("as at 31/2/23") is not read at all, rather than read as something
   near it. A two-digit year is this century's.

   WHAT IS COUNTED. A heading is the value of a list's first level (its
   Series, Category or Section: `hierarchy[0]`), counted once per list
   with the lines filed under it. A list of what fits which boat has no
   headings of its own, and a list no longer sold prices nothing again,
   so neither is read. The denominator a screen prints beside the
   figure is the headings in the lists that date ANY heading — "25 of
   the 222 headings in the 5 lists that date any" — because a list that
   never dates a heading has said nothing about its prices either way.

   Pure: no store, no clock, no DOM.
   ============================================================ */
import { isRetired, type EntityDef, type RowData } from '@/domain/model'

const AS_AT = /\bas\s+at\s+(\d{1,2})[./-](\d{1,2})[./-](\d{4}|\d{2})(?!\d)/i

const pad = (n: number): string => String(n).padStart(2, '0')

/** The calendar day a heading says it was priced, as `YYYY-MM-DD`, or null where it says none. */
export function asAtOf(heading: string): string | null {
  const m = AS_AT.exec(heading)
  if (!m) return null
  const day = Number(m[1])
  const month = Number(m[2])
  const year = m[3]!.length === 2 ? 2000 + Number(m[3]) : Number(m[3])
  if (month < 1 || month > 12 || day < 1) return null
  /* the last day of that month: day 0 of the next is it */
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate()
  if (day > last) return null
  return `${year}-${pad(month)}-${pad(day)}`
}

/** One heading that dates itself, with the lines filed under it. */
export interface DatedSection {
  tableId: string
  tableName: string
  /** the heading as the file writes it, trimmed */
  heading: string
  /** the day it says, `YYYY-MM-DD` */
  on: string
  lines: number
}

export interface DatedYear {
  year: string
  sections: number
  lines: number
}

export interface DatedReport {
  /** every dated heading, the oldest first (a tie by list, then heading) */
  sections: DatedSection[]
  /** the lists that date at least one heading, in the order handed in */
  lists: string[]
  /** every heading in those lists, dated or not: the denominator */
  headingsInThose: number
  /** the lines under the dated headings */
  lines: number
  /** the dated headings by the year they say, the oldest year first */
  byYear: DatedYear[]
  /** the oldest and newest days any heading says, or null when none does */
  oldest: string | null
  newest: string | null
}

const headingOf = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const said = value.trim()
  return said === '' ? null : said
}

/** Every heading on the price list that says when it was priced, counted off the rows. */
export function datedSections(
  tables: Readonly<Record<string, EntityDef>> | readonly EntityDef[],
  rows: Readonly<Record<string, readonly RowData[]>>,
): DatedReport {
  const list = Array.isArray(tables)
    ? (tables as readonly EntityDef[])
    : Object.values(tables as Record<string, EntityDef>)
  const sections: DatedSection[] = []
  const lists: string[] = []
  let headingsInThose = 0
  for (const table of list) {
    if (table.role === 'join' || isRetired(table)) continue
    const first = table.hierarchy?.[0]
    if (!first) continue
    const heads = new Map<string, number>()
    for (const row of rows[table.id] ?? []) {
      const h = headingOf(row.values[first])
      if (h !== null) heads.set(h, (heads.get(h) ?? 0) + 1)
    }
    let dates = 0
    for (const [heading, lines] of heads) {
      const on = asAtOf(heading)
      if (on === null) continue
      dates += 1
      sections.push({ tableId: table.id, tableName: table.name, heading, on, lines })
    }
    if (dates > 0) {
      lists.push(table.id)
      headingsInThose += heads.size
    }
  }
  sections.sort(
    (a, b) =>
      a.on.localeCompare(b.on) ||
      a.tableName.localeCompare(b.tableName) ||
      a.heading.localeCompare(b.heading),
  )
  const years = new Map<string, DatedYear>()
  for (const s of sections) {
    const year = s.on.slice(0, 4)
    const at = years.get(year) ?? { year, sections: 0, lines: 0 }
    at.sections += 1
    at.lines += s.lines
    years.set(year, at)
  }
  return {
    sections,
    lists,
    headingsInThose,
    lines: sections.reduce((n, s) => n + s.lines, 0),
    byYear: [...years.values()].sort((a, b) => a.year.localeCompare(b.year)),
    oldest: sections[0]?.on ?? null,
    newest: sections.at(-1)?.on ?? null,
  }
}
