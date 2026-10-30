/* ============================================================
   CHOOSING THE BOAT INSIDE ITS OWN CHAPTER.

   THE OWNER, 2026-10-30: "I want for highfield the picking model
   color and all of that nonsense to be done in hull section and same
   for all boats please so they can see differences in real time and
   same with material and that is applicable same theme to all other
   things like stabi with variants or whatever."

   A QUOTE IS ROOTED ON ONE ROW of a maker's register, and the rows of
   one series are the boats a customer weighs against each other at
   the desk: the Highfield Sport 520, 560 and 600, each in PVC or
   Hypalon, each in seven or eight colourways; a Stabicraft 1850
   Supercab in its Adventure, Sportfish or Profish fit-out; a Stacer
   SeaMaster in seven lengths. This reads those rows into the AXES
   they differ by, so the chapter can draw each axis as a row of
   choices with what each one does to the total beside it.

   NOTHING IS TYPED, EVERYTHING IS READ. The axes are the file's own
   distinctions, read through the one reader every screen names a
   boat with (`spokenBoat`): the model (and its qualifier, "540 open"),
   the trim the file writes in brackets ("(Profish)", "(Dune)"), the
   material ("(HYP)") and the colourway ("B-G-B"). An axis is drawn
   only where the series' rows hold two or more values of it.

   THE SIBLINGS ARE THE SERIES. The first level of the register's
   hierarchy is its series ("Sport", "Supercab Series", "SEA MASTERS"),
   and every row under it is a boat this one can become. A register
   that groups by nothing (Formosa) is one series: its 39 rows are
   eleven models in their consoles and cabins.

   A TRIM IS AN AXIS ONLY WHERE EVERY ROW OF ITS MODEL CARRIES ONE.
   Stabicraft writes "(Adventure)", "(Sportfish)" and "(Profish)" on
   every 1850 Supercab, so they are three versions of one model.
   Stacer writes "319 Skimma" and "319 Skimma (HS)": one of the two
   has no word for what it is, and naming it "Standard" would be a
   word the file never wrote. So there the trim stays part of the
   model's name, and each is its own model.

   EVERY FIGURE IS THE ENGINE'S. Each option is the quote this press
   would produce (`refinishSubject`), summed by `quoteTotals`; the
   delta is the difference between two totals the engine computed.
   An axis offers what changing THAT axis alone reaches: the other
   axes are kept where the file has such a row, and where it has none
   the nearest row is taken and the option says so (`exact: false`).
   ============================================================ */

import { isDiscontinued, readCell, SUBJECT_CHAPTER, rowLabel } from '@/domain/model'
import type { CatalogueCtx, QuoteDef, RowData } from '@/domain/model'
import type { Colourway } from './colourway'
import { refinishSubject } from './freeze'
import { quoteTotals, lineAmount } from './totals'
import { lineSaid, nameFirst, spokenBoat } from './spoken'
import { leafNoun } from '@/domain/catalogue/table/grouping'

export type AxisId = 'model' | 'trim' | 'material' | 'colour'

/** One choice on one axis: the row a press re-roots the quote on, and what that does. */
export interface BoatOption {
  /** the axis value, as the file distinguishes it */
  key: string
  /** the value as a person says it — "Sport 520", "Profish", "Hypalon", "Black / Grey / Black" */
  say: string
  /** the row a press re-roots the quote on */
  rowId: string
  /** the whole label the quote would carry */
  label: string
  /** the row the quote is rooted on now */
  current: boolean
  /** the hull's own figure on that row at the quote's price level, or null */
  amount: number | null
  /** what the whole quote would total */
  would: number
  /** the signed change to the total */
  delta: number
  /** the colourway, on the colour axis; null elsewhere */
  colour: Colourway | null
  /** every other axis kept as it is; false where the file has no such row and the nearest is
   *  taken instead */
  exact: boolean
  /** WHAT ELSE CHANGES WITH IT, where `exact` is false: the other axes' values on the row
   *  reached, as a person says them — ["Hypalon"] for a Sport 700 ST, filed in Hypalon only */
  also: string[]
  /** the row's own picture address in the file, for a screen to find its picture; '' for none */
  address: string
  /** A MODEL NO MAKER'S PAGE NAMES, said as the code the file writes (names.json `unnamed`:
   *  Highfield's SP300); false on every other option */
  coded: boolean
}

export interface BoatAxis {
  id: AxisId
  /** what the axis is called — "Model", "Version", "Material", "Colour" */
  title: string
  options: BoatOption[]
  /** how many the price list holds, as the axis says it — "9 nearest of 138" — where the axis
   *  draws fewer than its series holds; absent where it draws them all */
  count?: string
}

export interface BoatChoices {
  axes: BoatAxis[]
  /** the series these boats are, in the file's words — "Sport", "Supercab Series"; '' for none */
  series: string
  /** how many rows of the register are this boat's siblings, itself included */
  siblings: number
  /** why there is nothing to choose, or '' */
  why: string
}

/** The four axes' names, as a salesperson says them. */
export const AXIS_TITLE: Readonly<Record<AxisId, string>> = {
  model: 'Model',
  trim: 'Version',
  material: 'Material',
  colour: 'Colour',
}

/** Said where the price list holds no other boat this one could become. */
export const NO_OTHER_BOAT = 'No other version of this boat is on the price list.'

interface Read {
  row: RowData
  model: string
  modelSay: string
  trim: string
  material: string
  colourCode: string
  colour: Colourway | null
  coded: boolean
}

const AXES: readonly AxisId[] = ['model', 'trim', 'material', 'colour']

const sayOf = (read: Read, axis: AxisId): string =>
  axis === 'model'
    ? read.modelSay
    : axis === 'trim'
      ? read.trim
      : axis === 'material'
        ? read.material
        : read.colour?.read
          ? read.colour.say
          : read.colourCode

const valueOf = (read: Read, axis: AxisId): string =>
  axis === 'model'
    ? read.model
    : axis === 'trim'
      ? read.trim
      : axis === 'material'
        ? read.material
        : read.colourCode

/**
 * THE AXES THIS QUOTE'S BOAT CAN CHANGE ALONG, each with every value the series holds and the
 * row a press on it reaches.
 */
export function boatChoices(ctx: CatalogueCtx, quote: QuoteDef): BoatChoices {
  const none = (why: string, series = '', siblings = 0): BoatChoices => ({
    axes: [],
    series,
    siblings,
    why,
  })
  const root = ctx.entities[quote.rootTableId]
  if (!root || root.kind !== 'boat') return none('')
  const rows = ctx.rowsByEntity[root.id] ?? []
  const here = rows.find((r) => r.id === quote.rootRowId)
  if (!here)
    return none('This boat is no longer on the price list, so its versions cannot be read.')
  const levels = root.hierarchy ?? []
  /* a register that groups by nothing is one series: every boat on it is this one's sibling */
  const seriesField = levels.length >= 2 ? levels[0]! : null
  const seriesOf = (row: RowData): string =>
    seriesField === null ? '' : String(readCell(row, seriesField) ?? '').trim()
  const series = seriesOf(here)
  const siblings = rows.filter((r) => seriesOf(r) === series)

  /* EACH ROW AS A PERSON SAYS IT, read once */
  const reads: Read[] = siblings.map((row) => {
    const boat = spokenBoat(root.id, rowLabel(root, row))
    const model = [boat.model, boat.qualifier].filter((s) => s !== '').join(' ')
    return {
      row,
      model,
      modelSay: model,
      trim: boat.trim,
      material: boat.material,
      colourCode: boat.colour?.code ?? '',
      colour: boat.colour,
      coded: boat.from === 'code',
    }
  })
  /* A TRIM IS A VERSION ONLY WHERE EVERY ROW OF ITS MODEL WRITES ONE (the header) */
  const byModel = new Map<string, Read[]>()
  for (const read of reads) byModel.set(read.model, [...(byModel.get(read.model) ?? []), read])
  for (const group of byModel.values()) {
    if (group.every((r) => r.trim !== '')) continue
    for (const read of group) {
      if (read.trim === '') continue
      read.model = `${read.model} (${read.trim})`
      read.modelSay = `${read.modelSay} ${read.trim}`
      read.trim = ''
    }
  }

  const mine = reads.find((r) => r.row.id === here.id)!
  const now = quoteTotals(quote).total
  type Weighed = { would: number; amount: number | null; label: string; address: string }
  const weighed = new Map<string, Weighed>()
  const weigh = (rowId: string): Weighed => {
    const known = weighed.get(rowId)
    if (known) return known
    const next = refinishSubject(ctx, quote, rowId) ?? quote
    const subject = next.sections.find((s) => s.blockId === SUBJECT_CHAPTER)
    const line = next.lines.find((l) => l.id === subject?.lineIds[0])
    const out = {
      would: quoteTotals(next).total,
      amount: line ? lineAmount(line).amount : null,
      label: next.subjectLabel,
      address: next.subjectImage?.src ?? '',
    }
    weighed.set(rowId, out)
    return out
  }

  /* THE ROW A VALUE REACHES: that value, and every other axis kept in the order they are read
     (model, version, material, colour), dropping the last one kept until the file has a row */
  const reach = (axis: AxisId, value: string): { read: Read; exact: boolean } | null => {
    const pool = reads.filter((r) => valueOf(r, axis) === value)
    if (pool.length === 0) return null
    const others = AXES.filter((a) => a !== axis)
    for (let keep = others.length; keep >= 0; keep -= 1) {
      const kept = others.slice(0, keep)
      const found = pool.find((r) => kept.every((a) => valueOf(r, a) === valueOf(mine, a)))
      if (found) return { read: found, exact: keep === others.length }
    }
    return { read: pool[0]!, exact: false }
  }

  const axes: BoatAxis[] = []
  for (const axis of AXES) {
    /* the values an axis offers: on the model axis, every model of the series; below it, the
       values the rows that share every axis above this one hold */
    const above = AXES.slice(0, AXES.indexOf(axis))
    const scope = reads.filter((r) => above.every((a) => valueOf(r, a) === valueOf(mine, a)))
    const values: string[] = []
    for (const read of scope) {
      const v = valueOf(read, axis)
      if (!values.includes(v)) values.push(v)
    }
    if (values.length < 2) continue
    const options: BoatOption[] = []
    for (const value of values) {
      const reached = reach(axis, value)
      if (!reached) continue
      const { would, amount, label, address } = weigh(reached.read.row.id)
      const sample = scope.find((r) => valueOf(r, axis) === value)!
      options.push({
        key: value,
        say:
          axis === 'model'
            ? sample.modelSay
            : axis === 'trim'
              ? sample.trim
              : axis === 'material'
                ? sample.material === ''
                  ? value
                  : sample.material
                : sample.colour?.read
                  ? sample.colour.say
                  : value,
        rowId: reached.read.row.id,
        label,
        current: value === valueOf(mine, axis),
        amount,
        would,
        delta: would - now,
        colour: axis === 'colour' ? sample.colour : null,
        exact: reached.exact,
        also: reached.exact
          ? []
          : AXES.filter((a) => a !== axis && valueOf(reached.read, a) !== valueOf(mine, a))
              .map((a) => sayOf(reached.read, a))
              .filter((said) => said !== ''),
        address,
        coded: axis === 'model' && sample.coded,
      })
    }
    axes.push({ id: axis, title: AXIS_TITLE[axis], options })
  }

  return {
    axes,
    series,
    siblings: siblings.length,
    why: axes.length === 0 ? NO_OTHER_BOAT : '',
  }
}

/** How many of its neighbours on the price list a thing sold on its own is weighed against. */
export const GOODS_NEAR = 9

/**
 * A MOTOR, A TRAILER OR A PART SOLD ON ITS OWN, CHOSEN IN ITS OWN CHAPTER, as a boat is in the
 * hull's (the owner, 2026-10-30: "quotes are not just boats"). A repower is weighed against the
 * motors either side of it; a trailer against its series; a sand anchor against the other sizes
 * of its kit. One axis: the rows of its own series (the register's first level), in the file's
 * own order, of which the `near` nearest the one on the quote are offered — the file lists
 * Yamaha's 138 four-strokes from the smallest up, so the nearest are the motors either side.
 * Nothing no longer sold is offered, except the one already on the quote.
 *
 * Every figure is the engine's, as on a boat: each option is the quote `refinishSubject` would
 * produce, summed by `quoteTotals`. Each is named as its tile would name it (`lineSaid`, without
 * its code where the name already carries it), and a word every option shares in front — the
 * maker, which the bar's mark already says — is left off.
 */
export function goodsChoices(ctx: CatalogueCtx, quote: QuoteDef, near = GOODS_NEAR): BoatChoices {
  const root = ctx.entities[quote.rootTableId]
  const none: BoatChoices = { axes: [], series: '', siblings: 0, why: '' }
  if (!root || root.kind === 'boat') return none
  const rows = ctx.rowsByEntity[root.id] ?? []
  const here = rows.find((r) => r.id === quote.rootRowId)
  if (!here) return none
  const levels = root.hierarchy ?? []
  const seriesField = levels.length >= 2 ? levels[0]! : null
  const seriesOf = (row: RowData): string =>
    seriesField === null ? '' : String(readCell(row, seriesField) ?? '').trim()
  const series = seriesOf(here)
  const siblings = rows.filter(
    (r) => seriesOf(r) === series && (r.id === here.id || !isDiscontinued(r)),
  )
  const at = siblings.findIndex((r) => r.id === here.id)
  const from = Math.max(0, Math.min(at - Math.floor(near / 2), siblings.length - near))
  const shown = siblings.slice(from, from + near)
  if (shown.length < 2) return { ...none, series, siblings: siblings.length }

  const now = quoteTotals(quote).total
  const weighed = shown.map((row) => {
    const next = refinishSubject(ctx, quote, row.id) ?? quote
    const subject = next.sections.find((s) => s.blockId === SUBJECT_CHAPTER)
    const line = next.lines.find((l) => l.id === subject?.lineIds[0])
    const said = nameFirst(lineSaid(rowLabel(root, row), root.name), line?.code)
    return { row, next, line, said }
  })
  /* the maker every option shares, said once by the bar's mark */
  const first = weighed[0]!.said.split(' ')[0] ?? ''
  const shared =
    first !== '' && weighed.every((w) => w.said.startsWith(`${first} `)) ? `${first} ` : ''
  const options: BoatOption[] = weighed.map(({ row, next, line, said }) => {
    const would = quoteTotals(next).total
    return {
      key: row.id,
      say: said.slice(shared.length),
      rowId: row.id,
      label: next.subjectLabel,
      current: row.id === here.id,
      amount: line ? lineAmount(line).amount : null,
      would,
      delta: would - now,
      colour: null,
      exact: true,
      also: [],
      address: next.subjectImage?.src ?? '',
      coded: false,
    }
  })
  const count =
    shown.length < siblings.length
      ? `${shown.length} nearest of ${siblings.length.toLocaleString('en-AU')}`
      : undefined
  return {
    axes: [
      {
        id: 'model',
        title: capitalised(leafNoun(root).one),
        options,
        ...(count ? { count } : {}),
      },
    ],
    series,
    siblings: siblings.length,
    why: '',
  }
}

const capitalised = (word: string): string => word.charAt(0).toUpperCase() + word.slice(1)
