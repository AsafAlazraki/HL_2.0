/* ============================================================
   SAID ONCE — what a group of rows has in common, found by
   arithmetic, so a column that says one thing is said once instead of
   down every row.

   THE FAULT THIS ANSWERS (docs/directions/built-critique-m2.md §22).
   The sheet drew `Matrix` as a column and printed "Highfield
   Inflatables" on all 588 rows of the file's biggest table. It drew
   the Roll-Up series' tiller, its short shaft and its three air
   chambers on every one of its 32 rows, and each model's length, beam
   and load on every variant of that model. A price list does not do
   that: the maker's own sheet says the model's specification once, at
   the head of the model, and its rows say only what differs.

   THREE ANSWERS, EACH A PLAIN COUNT OVER THE CELLS:

     table    a column holding ONE value on every row of the table is a
              fact about the table — said once, in the table's head
     empty    a column empty on every row says nothing at all; it is
              named where the rest of the columns are listed and never
              drawn as a column of blanks
     groups   for every drawer of the outline (a series, a model, a
              hull), the columns that hold one value on every row
              filed under it and were NOT already said by the table or
              by a drawer above it — said once, in that drawer's head

   A DRAWER OF ONE ROW SAYS NOTHING ONCE. Every column is trivially
   constant across a single row, and "said once" over one row would
   empty the row into its head: on a pairing where most hulls carry
   one trailer, the trailer would leave the grid. So a one-row drawer
   hands its row every column, and constancy is only claimed over two
   rows or more.

   SETTLED is the one reading the screen chooses columns by: a column
   is settled when every innermost drawer of two rows or more says it
   once (or the table does). A settled column never varies inside a
   block, so drawing it as a column would print one value down every
   block. Everything else varies somewhere, and is a candidate.

   THE TEXT COMPARED IS THE VIEW TEXT — `ViewRow.text`, the clipboard
   text — so `2770` and `2,770.00` could never be told apart by
   formatting, and a picture column compares its addresses.

   Pure: no React, no DOM, no store. Measured on the real pack in
   `saidOnce.test.ts`.
   ============================================================ */
import type { FieldDef } from '@/domain/model'
import type { ViewRow } from '@/domain/catalogue/table/core'
import { collectLeaves, groupKey, type GroupNode } from './grouping'

/** One column, said once, with the text every row under it holds. */
export interface Said {
  fieldId: string
  text: string
}

export interface SaidOnce {
  /** one value on every row of the table, and not empty */
  table: Said[]
  /** empty on every row of the table */
  empty: string[]
  /** per drawer key: one value on every row filed under it, not said above */
  groups: ReadonlyMap<string, Said[]>
  /** never varies inside an innermost drawer of two rows or more */
  settled: ReadonlySet<string>
  /** said once — at the drawer or above it — in at least half of the
   *  innermost drawers of two rows or more. Coaster's seven rows are
   *  seven different hulls, so a length varies in one model of 67 and is
   *  not settled; it is still a fact the other 66 say once, and the
   *  screen says where it went in those words. */
  mostly: ReadonlySet<string>
}

type TextOf = (row: ViewRow, fieldId: string) => string

const viewText: TextOf = (row, id) => (row.text[id] ?? '').trim()

/** The one text every row holds in this column, or null when two differ. */
function oneText(rows: readonly ViewRow[], fieldId: string, textOf: TextOf): string | null {
  if (rows.length === 0) return null
  const first = textOf(rows[0]!, fieldId)
  for (let i = 1; i < rows.length; i += 1) {
    if (textOf(rows[i]!, fieldId) !== first) return null
  }
  return first
}

export function saidOnce(
  rows: readonly ViewRow[],
  fields: readonly FieldDef[],
  roots: readonly GroupNode[],
  textOf: TextOf = viewText,
): SaidOnce {
  const table: Said[] = []
  const empty: string[] = []
  const above = new Set<string>()

  /* the table itself: a claim over two rows or more, like any drawer */
  if (rows.length >= 2) {
    for (const f of fields) {
      const text = oneText(rows, f.id, textOf)
      if (text === null) continue
      above.add(f.id)
      if (text === '') empty.push(f.id)
      else table.push({ fieldId: f.id, text })
    }
  }

  const groups = new Map<string, Said[]>()
  /* per column: did an innermost drawer of two or more rows vary in it */
  const varies = new Set<string>()
  const saying = new Map<string, number>()
  let inner = 0

  const walk = (nodes: readonly GroupNode[], said: ReadonlySet<string>): void => {
    for (const node of nodes) {
      const leaves = collectLeaves(node)
      const here: Said[] = []
      const next = new Set(said)
      if (leaves.length >= 2) {
        for (const f of fields) {
          if (said.has(f.id)) continue
          const text = oneText(leaves, f.id, textOf)
          if (text === null) continue
          next.add(f.id)
          here.push({ fieldId: f.id, text })
        }
      }
      groups.set(node.key, here)
      if (node.children.length > 0) {
        walk(node.children, next)
        continue
      }
      if (leaves.length < 2) continue
      inner += 1
      for (const f of fields) {
        if (next.has(f.id)) saying.set(f.id, (saying.get(f.id) ?? 0) + 1)
        else varies.add(f.id)
      }
    }
  }
  walk(roots, above)

  const settled = new Set<string>()
  const mostly = new Set<string>()
  for (const f of fields) {
    if (above.has(f.id)) settled.add(f.id)
    else if (inner > 0 && !varies.has(f.id)) settled.add(f.id)
    if (settled.has(f.id) || (inner > 0 && (saying.get(f.id) ?? 0) * 2 >= inner)) mostly.add(f.id)
  }
  return { table, empty, groups, settled, mostly }
}

/** Every fact said at this drawer and at each drawer above it, outermost
 *  first — what a block's head can say about all of its rows. */
export function saidAlong(said: SaidOnce, path: readonly string[]): Said[] {
  const out: Said[] = []
  for (let i = 1; i <= path.length; i += 1) {
    out.push(...(said.groups.get(groupKey(path.slice(0, i))) ?? []))
  }
  return out
}
