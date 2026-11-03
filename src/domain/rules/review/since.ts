/* ============================================================
   SINCE THE PRICE FILE: WHAT IS NEW, AND WHAT WAS SETTLED (the judge
   of Review, J11 and missing item 9; the verifier of 2026-11-04,
   round 1: "only lines written since packing get a 'New' mark; what a
   new file settled cannot be said").

   THE PRICE FILE IS KEPT. The Master Price File this app ships with is
   served beside it (`data/northside`), the very file every line on
   this computer was first read from, and the sheet already fetches a
   list of it to mark what Northside changed (`asLoaded.ts`). So the
   queue can be found twice — on the price list as it stands, and on
   the same lists as the file carries them — and the two compared:

     settled   a finding the file has that the price list no longer
               does: a price typed here, a line taken off sale, a
               newer price file brought in on Shelf that wrote it
     new       a finding the price list has that the file did not

   ONLY THE LISTS WRITTEN SINCE ARE READ FROM THE FILE (`writtenSince`):
   a list whose definition, lines and count are all as the file packed
   them IS the file, so it is never fetched. A line carries the instant
   it was written (`changed.ts`); a list carries its own; and a count
   that differs from the file's is a line deleted or added.

   A FINDING IS KNOWN BY WHAT IT IS ABOUT, NOT BY THE VALUE THAT MADE
   IT. A key carries its value so a case left alone comes back when the
   value moves (`checks.ts`); here that would call a trailer re-weighed
   from one wrong size to another "settled" and "new" at once. So a
   finding is its check and its line (and, below cost, its price
   column): the trailer is still wrong, and is neither.

   Nothing is said of WHO settled it, or by which act: a line's stamp
   says when it was written, never by which door.

   PURE: the lists and their lines in; no fetch, no clock.
   ============================================================ */

import type { EntityDef, RowData } from '@/domain/model'
import type { ReviewWorld } from './checks'
import { linesOfCase, meantKeysOf, type Case } from './cases'
import { restrict } from './standing'

const instant = (iso: string | undefined): number => {
  const t = iso ? Date.parse(iso) : Number.NaN
  return Number.isNaN(t) ? 0 : t
}

/**
 * THE LISTS WRITTEN ON THIS COMPUTER SINCE THE FILE WAS PACKED: a list whose own definition was
 * written after it, any of whose lines was, or whose count of lines is not the file's. A list the
 * file never carried is written since. `fileCounts` is the file's own count of each list.
 */
export function listsWrittenSince(
  tables: Readonly<Record<string, EntityDef>>,
  rows: Readonly<Record<string, readonly RowData[]>>,
  packedAt: string,
  fileCounts: Readonly<Record<string, number>>,
): string[] {
  const packed = instant(packedAt)
  if (packed === 0) return []
  const out = new Set<string>()
  for (const [id, table] of Object.entries(tables)) {
    const lines = rows[id] ?? []
    if (
      !(id in fileCounts) ||
      fileCounts[id] !== lines.length ||
      instant(table.updatedAt) > packed ||
      lines.some((r) => instant(r.updatedAt) > packed || instant(r.createdAt) > packed)
    )
      out.add(id)
  }
  /* a list the file carries that is not here any more was deleted since */
  for (const id of Object.keys(fileCounts)) if (!(id in tables)) out.add(id)
  return [...out].toSorted()
}

/** The lists as the file carries them: what the file holds for `lists`, this computer's own for the
 *  rest (which are the file's, untouched). */
export function worldAsFiled(
  now: ReviewWorld,
  file: {
    entities: Readonly<Record<string, EntityDef>>
    rows: Readonly<Record<string, readonly RowData[]>>
  },
  lists: readonly string[],
): ReviewWorld {
  const entities: Record<string, EntityDef> = {}
  const rowsByEntity: Record<string, readonly RowData[]> = {}
  const swapped = new Set(lists)
  for (const [id, e] of Object.entries(now.entities)) {
    if (!e || swapped.has(id)) continue
    entities[id] = e
    rowsByEntity[id] = now.rowsByEntity[id] ?? []
  }
  for (const id of swapped) {
    const e = file.entities[id]
    if (!e) continue
    entities[id] = e
    rowsByEntity[id] = file.rows[id] ?? []
  }
  return { entities, rowsByEntity }
}

const lessItsValue = (key: string): string => key.slice(0, key.lastIndexOf(':'))

/** What one finding of a case is about: its check and its line, never the value that made it. */
export function aboutOf(c: Case, key: string): string[] {
  switch (c.kind) {
    case 'band':
      return [`band\u0000${c.line.tableId}\u0000${c.line.rowId}`]
    case 'boat':
    case 'none':
      /* `none:<list>:<row>:<zero|blank>` — a boat and a part are one check, and $0 to blank is
         the same line still with no price */
      return [`none\u0000${lessItsValue(key)}`]
    case 'cost':
      /* `cost:<list>:<row>:<price column>:<price>` — the line at that price column */
      return [`cost\u0000${lessItsValue(key)}`]
    case 'two':
      return linesOfCase(c)
        .filter((l) => l.key === key)
        .map((l) => `two\u0000${l.tableId}\u0000${l.rowId}`)
    case 'note':
    case 'house':
    case 'twins':
    case 'nameless':
      return [`${c.kind}\u0000${key}`]
  }
}

function aboutAll(cases: readonly Case[]): Set<string> {
  const out = new Set<string>()
  for (const c of cases) for (const k of meantKeysOf(c)) for (const a of aboutOf(c, k)) out.add(a)
  return out
}

/** The cases cut to the findings `other` does not hold. */
function notIn(cases: readonly Case[], other: ReadonlySet<string>): Case[] {
  const out: Case[] = []
  for (const c of cases) {
    const cut = restrict(c, (k) => aboutOf(c, k).every((a) => !other.has(a)))
    if (cut) out.push(cut)
  }
  return out
}

export interface SinceTheFile {
  /** what the file found that the price list no longer does, each case cut to what was settled */
  settled: Case[]
  /** what the price list finds that the file did not, each case cut to what is new */
  arrived: Case[]
}

/**
 * THE QUEUE ON THE FILE AGAINST THE QUEUE NOW. Both are every case found, nothing left alone set
 * aside: a case left alone is still found, and is neither settled nor new.
 */
export function sinceTheFile(asFiled: readonly Case[], now: readonly Case[]): SinceTheFile {
  return { settled: notIn(asFiled, aboutAll(now)), arrived: notIn(now, aboutAll(asFiled)) }
}
