/* ============================================================
   THE OUTLINE — what the sheet screen derives that the rest of the
   table engine does not already answer. Four things, each pure and
   each argued here, because they were found missing while the sheet
   was being drawn on the ported engine (docs/research/refs/critique-m2.md
   §5, "sheet D — a level the pack does not declare", and §4, the 17.6
   rows against the 18 owed).

     outlineLevels   which columns the OUTLINE files a table under. A
                     base table's own hierarchy, and — for a pairing,
                     which declares none — the boat side of the join,
                     so 2,519 Highfield × Yamaha rows read as 588
                     hulls with their motors under each.

     viewRowsOf      the rows as `ViewRow`s: values plus the display
                     text every column shows, which is what search,
                     grouping and the clipboard all read. The old repo
                     built these in a hook (`useTableData`) that did
                     not come across; nothing in `src/domain` did it.

     chunkLines      the drawn lines cut into the pieces a virtualiser
                     draws whole: an innermost drawer WITH its rows,
                     so a reader's `rowgroup` can wrap a model and its
                     variants and the density ruler can see the head.

     collapsedAtDepth  the depth ladder's one press — every drawer at
                     one level shut, everything above it open — read
                     off the tree rather than off a list of keys.

   THE HEIGHTS THE OUTLINE RESTS AT are here too, with the arithmetic,
   because a number without its reason is a number somebody re-guesses
   (`tableLod.ts` makes the same point about its own constants).

   Pure: no React, no DOM, no store. Measured against the real pack in
   `outline.test.ts`.
   ============================================================ */
import { displayFieldOf, type EntityDef, type FieldDef, type RowData } from '@/domain/model'
import type { ViewRow } from '@/domain/catalogue/table/core'
import { cellText, ROW_H } from './helpers'
import { groupLevelIds, type GridLine, type GroupNode } from './grouping'

/* ---------------------------------------------------------- */
/* Heights                                                     */
/* ---------------------------------------------------------- */

/**
 * THE RESTING GEOMETRY, AND WHY 18 HOLDS.
 *
 * The sweep (`docs/research/refs/sheet/notes.md` §0) worked the
 * resting direction out at the engine's own heights — row 28, group
 * line 30, add line 24 — and found an open two-level sheet reads
 * about 17.6 rows at 1280 × 800 on the median Highfield model, against
 * the 18 a Cockpit register owes. It named the two fixes: the series
 * line sticky, or the add line folded into its head.
 *
 * Both are taken, and a third besides, because the median model is
 * not the first screen. The first screen of Highfield Inflatables is
 * the Roll-Up series — eight models of FOUR variants — and a drawer of
 * four rows pays its whole head for four rows of return:
 *
 *   at the engine's heights   30 + 4·28 + 24 = 166 px per 4 rows
 *   add line folded           30 + 4·28      = 142 px per 4 rows
 *   and the head at 24        24 + 4·28      = 136 px per 4 rows
 *
 * In the room the built screen gives the grid at 1280 × 800 (a
 * two-line head and a 56 px column header over an 800 px window, ~660
 * px), Roll-Up at the third geometry is 24 + 4·136 + 24 + 2·28 = 648 px
 * for eighteen rows, and at the first it is 30 + 3·166 + 30 + 4·28 =
 * 670 for sixteen. So:
 *
 *   · THE ADD LINE IS FOLDED INTO ITS HEAD. `layoutGroups` is handed
 *     `addH: 0` and the screen draws the "+ row" act on the drawer's
 *     own line, at its right end — the sweep's own second fix. The
 *     engine still emits the line, at no height, so the act keeps
 *     `named` and `label` exactly as the engine computes them.
 *   · A DRAWER'S LINE IS 24, NOT 30. It carries a name, a count and
 *     one act, in the caps the register's band heads already use at
 *     that height (`quotes.css`, `--band-h`). Both levels take it, so
 *     a series line and a model line are told apart by ink, not by
 *     height.
 *   · THE ROW STAYS AT `ROW_H`. Twenty-eight is the engine's own
 *     number and the register's, and the paragraph on the published
 *     ladder (Sheet.tsx) says why it is not Retool's 32.
 *
 * The screen measures this with the density ruler and reports the
 * number it read; nothing here claims it.
 */
export const OUTLINE_GROUP_H = 24

/** THE THREE ROW HEIGHTS A DEALER MAY CHOOSE, and the picture each
 *  can carry. The sweep's own reading of the held copies: at 24 px a
 *  hull is a dash, at 32 a shape, at 44 a hull. So each row height is
 *  named by the picture it makes room for, and the rest state is the
 *  dense one because that is the one the 18-row promise is made at. */
export const ROW_HEIGHTS = {
  dense: { rowH: ROW_H, thumb: 24 },
  roomy: { rowH: 36, thumb: 32 },
  tall: { rowH: 48, thumb: 44 },
} as const

export type RowHeightKey = keyof typeof ROW_HEIGHTS

export const isRowHeightKey = (s: string | undefined): s is RowHeightKey =>
  s !== undefined && Object.hasOwn(ROW_HEIGHTS, s)

/* ---------------------------------------------------------- */
/* Levels                                                      */
/* ---------------------------------------------------------- */

/**
 * WHICH COLUMNS THE OUTLINE FILES A TABLE UNDER.
 *
 * A base table answers with its own hierarchy through `groupLevelIds`
 * — series ▸ model on Highfield, category on Parts — and a flat table
 * answers with nothing, which draws a flat sheet.
 *
 * A PAIRING DECLARES NO HIERARCHY, AND THE OUTLINE HANDS IT ONE. The
 * critic read the sweep's direction D — "a master list of the first
 * identity, 588 hulls with counts" — and found the sweep never said
 * that this is `buildGroups(rows, [boatFieldId])` on a join whose
 * `hierarchy` is empty. It is, and this is where it is said: the
 * master is the BOAT side, found as the join's link column whose
 * target table is of kind `boat`; where no link points at a boat
 * (a trailer × parts join, say), the first link column stands in, so
 * a pairing is always read from one of its two ends and never as a
 * flat run of labels. The level is a column the row already has, so
 * grouping by it invents nothing.
 */
export function outlineLevels(
  entity: EntityDef,
  tables: Readonly<Record<string, EntityDef>>,
): string[] {
  const own = groupLevelIds(entity)
  if (own.length > 0) return own
  if (entity.role !== 'join') return []
  const links = entity.fields.filter((f) => f.type === 'reference')
  const boat = links.find(
    (f) => f.refEntityId !== undefined && tables[f.refEntityId]?.kind === 'boat',
  )
  const master = boat ?? links[0]
  return master ? [master.id] : []
}

/* ---------------------------------------------------------- */
/* Rows                                                        */
/* ---------------------------------------------------------- */

/**
 * The rows as the grid reads them: the stored values, and the text
 * each column shows. `refLabel` names a linked row (`rowLabel` on the
 * target table) so a pairing's `Boat` column reads "Highfield -
 * RU230KAM (PVC) WH" and not an id, and search finds it by that name.
 *
 * The text is `cellText` — the CLIPBOARD text, which is also what an
 * editor seeds with — rather than the painted one: searching "2770"
 * has to hit a price the screen paints as "$2,770", and a group key
 * built off painted money would change the day the format did.
 */
export function viewRowsOf(
  entity: EntityDef,
  rows: readonly RowData[],
  refLabel?: (refEntityId: string | undefined, rowId: string) => string | undefined,
): ViewRow[] {
  const fields = entity.fields
  return rows.map((row) => {
    const text: Record<string, string> = {}
    for (const f of fields) {
      const v = row.values[f.id] ?? null
      text[f.id] = cellText(v, f, refLabel ? (id) => refLabel(f.refEntityId, id) : undefined)
    }
    return { rowId: row.id, values: row.values, text }
  })
}

/** The lower-cased label of every row of one table, keyed to its id —
 *  what `coerceCellText` needs to read a typed name back into a link. */
export function labelIndex(entity: EntityDef, rows: readonly RowData[]): Map<string, string> {
  const display = displayFieldOf(entity)
  const out = new Map<string, string>()
  if (!display) return out
  for (const row of rows) {
    const v = row.values[display.id]
    if (typeof v === 'string' && v.trim() !== '') out.set(v.trim().toLowerCase(), row.id)
  }
  return out
}

/* ---------------------------------------------------------- */
/* Chunks                                                      */
/* ---------------------------------------------------------- */

/** One piece a virtualiser draws whole. */
export type Chunk =
  /** a drawer that holds other drawers — a series line on its own */
  | { kind: 'branch'; key: string; at: number; line: Extract<GridLine, { kind: 'group' }> }
  /** an innermost drawer with the rows filed in it, so a reader's
   *  rowgroup can wrap a model and its variants, and so the density
   *  ruler sees the head as the first row of its group */
  | {
      kind: 'drawer'
      key: string
      /** the index of the head in the engine's own run of lines, so a
       *  reader's `aria-rowindex` counts what the engine counts */
      at: number
      head: Extract<GridLine, { kind: 'group' }>
      leaves: Extract<GridLine, { kind: 'leaf' }>[]
      /** the + ROW the engine put at the foot of this drawer, whose
       *  words the head's own act now carries */
      add?: Extract<GridLine, { kind: 'add' }>
    }
  /** a row of a flat table */
  | { kind: 'leaf'; key: string; at: number; line: Extract<GridLine, { kind: 'leaf' }> }

/**
 * Cut the flat run of drawn lines into the pieces a virtualiser draws.
 * A group line whose node has children is a branch on its own; a
 * group line whose node holds leaves takes every leaf that follows it
 * and the add line at its foot; a leaf outside any drawer (a flat
 * table) is its own piece. Nothing is reordered and nothing is
 * dropped, so the pieces concatenate back to the lines.
 */
export function chunkLines(lines: readonly GridLine[]): Chunk[] {
  const out: Chunk[] = []
  let open: Extract<Chunk, { kind: 'drawer' }> | null = null
  /* `at` counts DRAWN lines — heads and rows — and not the add lines the
     engine emits at no height, so a reader's `aria-rowindex` and the
     grid's `aria-rowcount` count what is on the sheet */
  let at = 0
  for (const line of lines) {
    if (line.kind === 'group') {
      open = null
      if (line.node.children.length > 0) {
        out.push({ kind: 'branch', key: line.node.key, at, line })
        at += 1
        continue
      }
      /* a shut drawer is still a drawer: its head stands alone and no
         leaf follows it, which is what the engine's layout already says */
      open = { kind: 'drawer', key: line.node.key, at, head: line, leaves: [] }
      out.push(open)
      at += 1
      continue
    }
    if (line.kind === 'leaf') {
      if (open) open.leaves.push(line)
      else out.push({ kind: 'leaf', key: line.rowId, at, line })
      at += 1
      continue
    }
    /* an add line belongs to the drawer it closes */
    if (open) open.add = line
  }
  return out
}

/** How many lines the pieces draw between them: every head and every
 *  row, and never an add line — the grid's `aria-rowcount`. */
export function drawnLines(chunks: readonly Chunk[]): number {
  let n = 0
  for (const c of chunks) n += c.kind === 'drawer' ? 1 + c.leaves.length : 1
  return n
}

/** The chunk index holding leaf `r` (the grid's own row index), so a
 *  cursor can be scrolled to the piece that draws it. -1 when none. */
export function chunkOfLeaf(chunks: readonly Chunk[], r: number): number {
  for (let i = 0; i < chunks.length; i += 1) {
    const c = chunks[i]
    if (c.kind === 'leaf' && c.line.r === r) return i
    if (c.kind === 'drawer' && c.leaves.some((l) => l.r === r)) return i
  }
  return -1
}

/* ---------------------------------------------------------- */
/* Depth                                                       */
/* ---------------------------------------------------------- */

/**
 * The drawers shut by one press on the depth ladder. Depth 1 shuts
 * every outermost drawer; depth 2 opens those and shuts the next
 * level; a depth past the last level shuts nothing — "every row".
 * Read off the tree, so a series with no models of its own is still
 * shut at depth 1 and a table with one level has a two-rung ladder.
 */
export function collapsedAtDepth(roots: readonly GroupNode[], depth: number): Set<string> {
  const out = new Set<string>()
  const shut = Math.max(0, Math.trunc(depth) - 1)
  const walk = (nodes: readonly GroupNode[]): void => {
    for (const n of nodes) {
      if (n.level === shut) out.add(n.key)
      else if (n.level < shut) walk(n.children)
    }
  }
  walk(roots)
  return out
}

/** The ladder's rungs, in the dealer's own words: the name of each
 *  level column, then "Every row". Empty for a flat table. */
export function ladderRungs(entity: EntityDef, levels: readonly string[]): string[] {
  if (levels.length === 0) return []
  const names = levels.map((id) => entity.fields.find((f) => f.id === id)?.name ?? 'Level')
  return [...names, 'Every row']
}

/* ---------------------------------------------------------- */
/* A hand                                                      */
/* ---------------------------------------------------------- */

/**
 * WHAT THE GRID BECOMES AT 390 PX: the name and one chosen fact, with
 * the bands kept and the record holding everything else. The name is
 * the pinned display column; the fact is the first column after it
 * that is not a drawer and not a picture — on a boat table the model
 * code, on a pairing the second identity — so a thumb reads two things
 * it can act on and nothing is sliced. Sideways scroll is refused with
 * a sentence rather than offered (`docs/research/refs/sheet/notes.md`
 * §1.6).
 */
export function handColumns(entity: EntityDef, leafFields: readonly FieldDef[]): FieldDef[] {
  const pin = displayFieldOf(entity)
  const name = pin && leafFields.some((f) => f.id === pin.id) ? pin : leafFields[0]
  if (!name) return []
  const fact = leafFields.find((f) => f.id !== name.id && f.type !== 'image')
  return fact ? [name, fact] : [name]
}
