/* ============================================================
   NORTHSIDE'S PRICES, CHANGED THE WAY EVERYTHING ON THE PRICE LIST
   IS CHANGED — a command with its inverse, the sentence the step
   says, and the event the audit keeps. The Prices screen (`/levels`)
   is the only caller.

   THREE ACTS, AND EACH IS ONE UNDO.

   1. NAME A LIST'S PRICE (`namePrice`). Rigging Kits and Dealer Fit
      Packages carry sell columns and declare no price, so every one of
      them prints "Not priced" on a customer's quote; the dealer says
      which of the list's own columns is the price. The same act points
      a motor's Cash at the column a customer's quote should print —
      Sell Price ($14,531 on the F90XB) or RRP + Freight Inc GST
      ($17,643, the figure Mark McWilliams matched to Northside's
      Display Sheet) — and records that the dealer chose it, so the
      screen can tell "chosen" from "never asked".

   2. LET A PRICE REACH A CUSTOMER, OR NOT (`letReach`). Every declared
      price carries the flag; a price worked from cost starts off
      (`src/domain/pricing/worked.ts`). One press sets it on every list
      that carries that price — Warranty on all seven boat lists — as
      one step.

   3. SET ONE PRICE AS A SHARE OF ANOTHER (`sharePlan`). Trade at 95% of
      Cash, written into every real cell of the list, rounded down as the
      price list's own Trade does (Boat Module!QT =
      ROUNDDOWN(QR − QR × Trade%,)). It is `batch` over `updateCell`, so
      the hundreds of cell edits are ONE undo — the property the old
      repo's suite pinned ("187 cell edits collapse into ONE undo
      entry") — and the plan is counted BEFORE anything is written:
      how many cells change, how many hold the same figure as Cash
      today, how many have no Cash to work from.

   A LADDER IS WRITTEN IN BOTH PLACES IT LIVES: the table's own
   `priceLevels`, which `priceLevelsFor` and every quote read, and the
   filed `priceLevels[tableId]`, which the store keeps as one record per
   table. `addField` already writes both; this does the same.

   Pure: no React, no store. The clock is the one the store hands in.
   ============================================================ */

import { newId } from '@/domain/id'
import { isCostColumn, namedLevelsFor } from '@/domain/quote/pricing'
import { workedFromCost } from '@/domain/pricing/worked'
import type { CellValue, EntityDef, FieldDef, PriceLevel, RowData } from '@/domain/model'
import {
  COLUMN_GONE,
  TABLE_GONE,
  batch,
  updateCell,
  type CatalogueChange,
  type CatalogueCommand,
  type CatalogueEvent,
} from './commands'
import type { CatalogueData } from './sheet'

/* ---------------------------------------------------------- */
/* Reading a ladder                                           */
/* ---------------------------------------------------------- */

/** The prices a table stands on: the filed ladder first, the table's own declaration where
 *  nothing has been filed — the store's own reading (`ladderOf` in commands.ts). */
export const ladderOn = (
  data: Pick<CatalogueData, 'priceLevels'>,
  table: EntityDef,
): PriceLevel[] => data.priceLevels[table.id] ?? table.priceLevels ?? []

const asNumber = (v: CellValue | undefined): number | null => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  if (typeof v === 'string') {
    const t = v.replace(/[$,\s]/g, '')
    if (t === '') return null
    const n = Number(t)
    return Number.isFinite(n) ? n : null
  }
  return null
}

/** A row's figure in one column, or null where it holds none. Nought is NO price, as the quote
 *  reads it (`src/domain/quote/nought.ts`): the price list writes 0 where nobody has priced it. */
export function priceIn(row: RowData, fieldId: string): number | null {
  const n = asNumber(row.values[fieldId])
  return n === null || n === 0 ? null : n
}

/* ---------------------------------------------------------- */
/* Writing a ladder                                           */
/* ---------------------------------------------------------- */

const LABEL = 'Prices changed'

function eventOf(
  at: string,
  said: string,
  changed: CatalogueChange[],
  table?: EntityDef,
): CatalogueEvent {
  return {
    id: newId(),
    kind: 'prices-changed',
    at,
    said,
    label: table ? `${LABEL} · ${table.name}` : LABEL,
    ...(table ? { tableId: table.id, tableName: table.name } : {}),
    changed,
  }
}

/** What each touched table stood on before: its own declaration and its filed ladder, by
 *  reference, so the way back puts exactly those objects back. */
interface Was {
  table: EntityDef
  filed: PriceLevel[] | undefined
}

/** The sheet with new ladders on the named tables — written on the table and filed. */
function withLadders(
  data: CatalogueData,
  ladders: ReadonlyArray<{ table: EntityDef; ladder: PriceLevel[] }>,
  now: string,
): CatalogueData {
  const tables = { ...data.tables }
  const priceLevels = { ...data.priceLevels }
  for (const { table, ladder } of ladders) {
    tables[table.id] = { ...table, priceLevels: ladder, updatedAt: now }
    priceLevels[table.id] = ladder
  }
  return { ...data, tables, priceLevels }
}

/** Put the tables' ladders back exactly as they were. Its own way back is the state it found. */
function restore(was: readonly Was[], said: string): CatalogueCommand {
  return (data, now) => {
    const present = was.filter((w) => data.tables[w.table.id])
    if (present.length === 0) return { refused: '' }
    const back: Was[] = present.map((w) => ({
      table: data.tables[w.table.id]!,
      filed: data.priceLevels[w.table.id],
    }))
    const tables = { ...data.tables }
    const priceLevels = { ...data.priceLevels }
    const changed: CatalogueChange[] = []
    for (const w of present) {
      tables[w.table.id] = w.table
      if (w.filed === undefined) delete priceLevels[w.table.id]
      else priceLevels[w.table.id] = w.filed
      changed.push({ path: `${w.table.id}.priceLevels`, from: 'changed', to: 'as it was' })
    }
    return {
      next: { ...data, tables, priceLevels },
      inverse: restore(back, said),
      said,
      event: eventOf(now, said, changed, present.length === 1 ? present[0]!.table : undefined),
    }
  }
}

/* ---------------------------------------------------------- */
/* 1 · Name a list's price                                     */
/* ---------------------------------------------------------- */

/** The price a quote starts at, and the one every price a list lacks falls back to. */
export const CASH = 'cash'

/** What a cost is told when somebody tries to make it a price — the same refusal as the
 *  sheet's own (`costAsRung` in commands.ts), said in the dealer's words, since Prices is a
 *  screen a dealer reads. */
export const costNeverAPrice = (field: Pick<FieldDef, 'name'>): string =>
  `${field.name} is what something costs Northside, and a cost never reaches a customer, so it can never be a price.`

/** Why a column cannot be a list's price, or null when it can. The one way past the cost guard
 *  is a price WORKED from cost (`worked.ts`), which a dealer may name and which then starts as
 *  Northside's only. */
export function cannotBePrice(table: EntityDef, field: FieldDef): string | null {
  if (field.type !== 'number' && field.type !== 'formula')
    return `${field.name} holds words, not a figure, so it cannot be a price.`
  if (isCostColumn(table, field) && workedFromCost(field) === null) return costNeverAPrice(field)
  return null
}

/**
 * THE DEALER NAMES THE COLUMN A PRICE READS. On a list that declares no price (Rigging Kits), the
 * named column becomes its Cash, and every line of it is priced from the next quote. On a list
 * that has the price already (a motor's Cash), the price is pointed at the chosen column and
 * marked as the dealer's choice — pressing the column it already reads records the choice and
 * changes no figure.
 *
 * WHAT A PRICE ALREADY CONTAINS TRAVELS WITH ITS COLUMN, NOT WITH ITS NAME. A motor's Sell Price
 * contains pre-delivery (Motor Library!BF ← AX ← AV); pointed at RRP + Freight, nothing is
 * claimed, because no cell says; pointed back at Sell Price, it is read again from the named
 * prices this kind of list is known to carry (`namedLevelsFor`).
 */
export function namePrice(tableId: string, key: string, fieldId: string): CatalogueCommand {
  return (data, now) => {
    const table = data.tables[tableId]
    if (!table) return { refused: TABLE_GONE }
    const field = table.fields.find((f) => f.id === fieldId)
    if (!field) return { refused: COLUMN_GONE }
    const why = cannotBePrice(table, field)
    if (why) return { refused: why }

    const ladder = ladderOn(data, table)
    const at = ladder.findIndex((l) => l.key === key)
    const had = at >= 0 ? ladder[at]! : undefined
    if (had && had.fieldId === fieldId && had.named === true) return { refused: '' }

    const sameColumn = had?.fieldId === fieldId
    const contains = sameColumn
      ? had?.contains
      : namedLevelsFor(table).find((l) => l.fieldId === fieldId)?.contains
    const rung: PriceLevel = {
      key,
      label: field.name,
      fieldId,
      scope: had?.scope ?? (key === CASH || key === 'trade' ? 'quote' : 'line'),
      ...(contains ? { contains } : {}),
      /* the dealer's answer on who may read it belongs to the column he answered it for */
      ...(sameColumn && had?.mayReachCustomer !== undefined
        ? { mayReachCustomer: had.mayReachCustomer }
        : {}),
      named: true,
    }
    const next = [...ladder]
    if (had) next[at] = rung
    else if (key === CASH) next.unshift(rung)
    else next.push(rung)

    const said =
      had && sameColumn
        ? `${table.name} keeps ${field.name} as its ${key === CASH ? 'Cash' : had.label} price, now by your choice.`
        : `Every ${table.name} line is priced at its ${field.name} from the next quote.`
    return {
      next: withLadders(data, [{ table, ladder: next }], now),
      inverse: restore([{ table, filed: data.priceLevels[tableId] }], said),
      said,
      event: eventOf(
        now,
        said,
        [{ path: `${tableId}.priceLevels.${key}`, from: had?.fieldId ?? null, to: fieldId }],
        table,
      ),
    }
  }
}

/* ---------------------------------------------------------- */
/* 2 · Let a price reach a customer                            */
/* ---------------------------------------------------------- */

/**
 * WHETHER A PRICE MAY REACH A CUSTOMER, set on every list named, as one step. A list that does
 * not carry the price is passed over; nothing changing is no step at all.
 */
export function letReach(
  targets: ReadonlyArray<{ tableId: string; key: string }>,
  on: boolean,
): CatalogueCommand {
  return (data, now) => {
    const ladders: Array<{ table: EntityDef; ladder: PriceLevel[] }> = []
    const was: Was[] = []
    const changed: CatalogueChange[] = []
    let label = ''
    for (const { tableId, key } of targets) {
      const table = data.tables[tableId]
      if (!table) continue
      const ladder = ladderOn(data, table)
      const at = ladder.findIndex((l) => l.key === key)
      if (at < 0) continue
      const had = ladder[at]!
      if (had.mayReachCustomer === on) continue
      const next = [...ladder]
      next[at] = { ...had, mayReachCustomer: on }
      ladders.push({ table, ladder: next })
      was.push({ table, filed: data.priceLevels[tableId] })
      changed.push({
        path: `${tableId}.priceLevels.${key}.mayReachCustomer`,
        from: had.mayReachCustomer ?? null,
        to: on,
      })
      label ||= had.label
    }
    if (ladders.length === 0) return { refused: '' }
    const said = on
      ? `${label} may reach a customer now: a quote priced at it can be given.`
      : `${label} is Northside’s only: a quote priced at it cannot be given.`
    return {
      next: withLadders(data, ladders, now),
      inverse: restore(was, said),
      said,
      event: eventOf(now, said, changed, ladders.length === 1 ? ladders[0]!.table : undefined),
    }
  }
}

/* ---------------------------------------------------------- */
/* 3 · One price as a share of another                         */
/* ---------------------------------------------------------- */

/** The figure a share gives, rounded down to the dollar as the price list's own Trade is
 *  (ROUNDDOWN(QR − QR × Trade%,)). The product is settled to six places first, so 1,730 × 95%
 *  is 1,643 and never 1,643.4999… taken down to 1,643 by accident of binary. */
export function shareFigure(from: number, percent: number): number {
  return Math.floor(Number(((from * percent) / 100).toFixed(6)))
}

/** The written answer for a share a person typed: a number of per cent, or why not. */
export function readShare(
  text: string,
  of: string = 'Cash',
): { percent: number } | { refused: string } {
  const t = text.replace(/%/g, '').trim()
  if (t === '') return { refused: `Type the share of ${of}, as a per cent.` }
  const n = Number(t)
  if (!Number.isFinite(n)) return { refused: `“${text.trim()}” is not a per cent.` }
  if (n <= 0) return { refused: 'A share of nothing would price every line at nought.' }
  if (n > 100)
    return {
      refused: `Above 100% of ${of}, a trade buyer would pay more than a customer off the street.`,
    }
  return { percent: Math.round(n * 100) / 100 }
}

export interface SharePlan {
  tableId: string
  /** the price written, and the one it is a share of */
  to: PriceLevel
  from: PriceLevel
  percent: number
  /** every line of the list */
  total: number
  /** lines with a Cash figure to work from */
  priced: number
  /** lines with no Cash figure, left exactly as they are */
  blank: number
  /** lines whose figure this writes */
  written: number
  /** lines whose figure is the same as Cash today */
  sameAsFrom: number
  /** lines that already hold the share's figure */
  already: number
  /** one line, before and after, for the two figures the screen shows */
  sample: { rowId: string; from: number; now: number | null; after: number } | null
  /** why it would not be written, or null */
  refusal: string | null
  /** the one step it becomes; null when refused or when it writes nothing */
  command: CatalogueCommand | null
}

/** What a list's lines are called in a sentence: "Stacer boat", "Stacer boats". */
export interface LineNoun {
  one: string
  many: string
}

/**
 * EVERY LINE OF A LIST, ITS `to` PRICE SET TO A SHARE OF ITS `from` PRICE — counted before
 * anything is written. `noun` names the list's lines in the step's sentence.
 */
export function sharePlan(
  data: Pick<CatalogueData, 'tables' | 'rows' | 'priceLevels'>,
  tableId: string,
  toKey: string,
  percent: number,
  noun: LineNoun,
  fromKey: string = CASH,
): SharePlan | null {
  const table = data.tables[tableId]
  if (!table) return null
  const ladder = ladderOn(data, table)
  const from = ladder.find((l) => l.key === fromKey)
  const to = ladder.find((l) => l.key === toKey)
  if (!from || !to) return null
  const rows = data.rows[tableId] ?? []

  let priced = 0
  let sameAsFrom = 0
  let already = 0
  const writes: Array<{ rowId: string; value: number }> = []
  let sample: SharePlan['sample'] = null
  for (const row of rows) {
    const base = priceIn(row, from.fieldId)
    if (base === null) continue
    priced += 1
    const now = asNumber(row.values[to.fieldId])
    const after = shareFigure(base, percent)
    if (now === base) sameAsFrom += 1
    sample ??= { rowId: row.id, from: base, now, after }
    if (now === after) already += 1
    else writes.push({ rowId: row.id, value: after })
  }

  const field = table.fields.find((f) => f.id === to.fieldId)
  const refusal =
    field?.type === 'formula'
      ? `${to.label} is worked out by the price list itself on every ${noun.one}, so it is not typed.`
      : priced === 0
        ? `No ${noun.one} has a ${from.label} figure, so there is nothing to work ${to.label} from.`
        : writes.length === 0
          ? `Every ${noun.one} with a ${from.label} figure already holds ${percent}% of it as ${to.label}.`
          : null

  const said = `${to.label} is ${percent}% of ${from.label} on ${writes.length} ${writes.length === 1 ? noun.one : noun.many}.`
  return {
    tableId,
    to,
    from,
    percent,
    total: rows.length,
    priced,
    blank: rows.length - priced,
    written: writes.length,
    sameAsFrom,
    already,
    sample,
    refusal,
    command:
      refusal === null
        ? batch(
            writes.map((w) => updateCell(tableId, w.rowId, to.fieldId, w.value)),
            { said },
          )
        : null,
  }
}
