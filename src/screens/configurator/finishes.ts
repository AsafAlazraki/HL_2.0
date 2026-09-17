/* ============================================================
   THE SAME HULL IN ANOTHER FINISH — chapter 01's own list.

   WHY THIS CHAPTER EXISTS AT ALL. The sweep counted what each
   chapter has to show (`docs/research/refs/configurator/notes.md`
   §0): motors and trailers have no scale problem, and the two that
   do are the 588-variant hull and the 2,937-row parts table. 588 is
   not 588 boats — Highfield files a row per material and colourway,
   so one model is up to sixteen rows — and the quote is rooted on
   exactly one of them. Changing which one is a decision a dealer
   makes with a customer pointing at a swatch, and before this screen
   it could only be made by going back to the picker and starting
   again.

   NOTHING HERE IS RE-DERIVED. The list is the root table's own rows;
   the grouping is the table's own hierarchy; whether the last level
   IS a finish is `finishLevels`, which the catalogue measured rather
   than assumed (Highfield reads 80%, a motor's shaft codes and a
   trailer's plug codes read 0%); the decode is `colourwayOf`, which
   refuses a code it cannot read in full; and EVERY FIGURE IS THE ONE
   SUMMATION run over the quote this pick would produce. That last
   part is the important one: `refinishSubject` re-roots the whole
   document on a sibling row, `quoteTotals` sums it, and the delta is
   the difference between two totals the engine computed. No screen
   arithmetic, and the same shape `weighPick` gives every other
   chapter.

   MEASURED on the SP560, 2026-09-17: fifteen siblings, seven in PVC
   at a delta of $0 and eight in Hypalon at +$7,010, and the whole
   list — fifteen re-roots of a three-line quote — took 15 ms.
   ============================================================ */

import { readCell, SUBJECT_CHAPTER, type EntityDef, type RowData } from '@/domain/model'
import type { CatalogueCtx } from '@/domain/model'
import { finishLevels, leafValues, materialOf } from '@/domain/catalogue/fold'
import { colourwayOf, splitVariant, type Colourway } from '@/domain/quote/colourway'
import { refinishSubject } from '@/domain/quote'
import { lineAmount, quoteTotals } from '@/domain/quote'
import type { QuoteDef } from '@/domain/model'

/** One row of the root table that is the same boat in another
 *  finish, already priced as the document it would produce. */
export interface Finish {
  rowId: string
  /** the row's own last grouping level, verbatim — 'HYP B-G-B' */
  leaf: string
  /** the material half of it — 'HYP', 'PVC'. '' where the cell is
   *  one token and the whole of it is the code. */
  material: string
  /** the colourway, decoded only where the file's own legend reads
   *  every part of it */
  colour: Colourway
  /** the whole label this quote would carry */
  label: string
  /** the business's own code for this row, frozen off the line */
  code: string
  /** the hull's own figure at this quote's rung, or null */
  amount: number | null
  /** what the whole document would total */
  would: number
  /** the signed change to the total. Never null: a re-root always
   *  produces a document and `quoteTotals` always produces a
   *  number, even where the hull itself carries no price. */
  delta: number
  /** the one the quote is rooted on now */
  current: boolean
}

export interface Finishes {
  rows: Finish[]
  /** the register, as the dealer named it */
  register: string
  /** the model these are finishes of, in the file's own words */
  model: string
  /** why there is nothing to choose between, or '' */
  why: string
  /** how many of the register's rows this model is */
  count: number
}

const NONE: Finishes = { rows: [], register: '', model: '', why: '', count: 0 }

/**
 * The finishes of the hull this quote is rooted on.
 *
 * `why` carries the reason where there is no choice to make, and the
 * two reasons are different facts: a register that files one row per
 * model has no finishes, and a register whose last level is a shaft
 * length or a plug type has a level that is not a finish. Neither is
 * a defect and both are said in the register's own name.
 */
export function readFinishes(ctx: CatalogueCtx, quote: QuoteDef): Finishes {
  const root: EntityDef | undefined = ctx.entities[quote.rootTableId]
  if (!root) return { ...NONE, why: 'The register this quote was written from is no longer here.' }
  const rows: RowData[] = ctx.rowsByEntity[root.id] ?? []
  const levels = root.hierarchy ?? []

  if (levels.length < 2) {
    return {
      ...NONE,
      register: root.name,
      why: `${root.name} files one row per boat, so this hull has no other finish on the file.`,
    }
  }

  const leaves = leafValues([root], { [root.id]: rows })
  if (!finishLevels([root], leaves).has(root.id)) {
    return {
      ...NONE,
      register: root.name,
      why: `${root.name} groups its rows by something that is not a finish, so there is no other finish of this hull to choose.`,
    }
  }

  /* THE MODEL IS EVERY GROUPING LEVEL ABOVE THE LAST, which is what
     makes two boats the same boat. The last level is the finish and
     is precisely what varies inside the group. */
  const modelKey = (row: RowData): string =>
    levels
      .slice(0, -1)
      .map((fieldId) => String(readCell(row, fieldId) ?? '').trim())
      .join(' ▸ ')

  const here = rows.find((r) => r.id === quote.rootRowId)
  if (!here) {
    return {
      ...NONE,
      register: root.name,
      why: 'The row this quote was written against is no longer on the file, so its other finishes cannot be read.',
    }
  }
  const model = modelKey(here)
  const siblings = rows.filter((r) => modelKey(r) === model)

  const nowTotal = quoteTotals(quote).total
  const out: Finish[] = []
  for (const row of siblings) {
    const next = refinishSubject(ctx, quote, row.id)
    if (!next) continue
    const subject = next.sections.find((s) => s.blockId === SUBJECT_CHAPTER)
    const line = next.lines.find((l) => l.id === subject?.lineIds[0])
    const leaf = leaves.get(`${root.id}:${row.id}`) ?? ''
    const would = quoteTotals(next).total
    out.push({
      rowId: row.id,
      leaf,
      material: materialOf(leaf),
      colour: colourwayOf(splitVariant(leaf).code),
      label: next.subjectLabel,
      code: line?.code ?? '',
      amount: line ? lineAmount(line).amount : null,
      would,
      delta: would - nowTotal,
      current: row.id === quote.rootRowId,
    })
  }

  return {
    rows: out,
    register: root.name,
    model: model.includes('▸') ? model.slice(model.lastIndexOf('▸') + 1).trim() : model,
    why:
      out.length > 1
        ? ''
        : `This model is one row of ${root.name}, so there is no other finish of it to choose.`,
    count: out.length,
  }
}
