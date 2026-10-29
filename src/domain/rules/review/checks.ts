/* ============================================================
   THE CHECKS — what is wrong in Northside's own price list, each
   finding with the line it names and, where one exists, the fix.

   WHY THIS FILE EXISTS (docs/research/refs/review/notes.md §0).
   `lintProject` on the real file returns 142 marks on 53 lists and
   not one of them carries a dollar: they are a data modeller's
   lessons. The faults that cost Northside money sit outside the
   linter, and this file is where they are counted:

     1  a trailer registered in a band its own weight contradicts
        (`registration.ts`'s check, with the one fix the fee list's
        own labels allow);
     2  one name, on sale, at two prices;
     3  a line on sale that sells at $0 or has no price at all;
     4  two things in one list under one name (the linter's four
        blockers, which become money the day a kit is priced from
        the wrong `Trade Price`);
     5  a line on sale with nothing to name it.

   Everything else the linter says is TIDY, counted and folded:
   none of it changes a price.

   EVERY FIGURE IS COUNTED HERE, never typed on a screen. A line no
   longer sold (`isDiscontinued`, `isRetired`) is not a fault in any
   check: nothing offers it, so nobody can pick it by mistake.

   LEFT AS MEANT. A finding a dealer has looked at and left is keyed
   on what it names AND on the value that made it a finding, so it
   comes back on its own the day that value changes: a $0 line left
   as meant returns if its price becomes blank, a name at two prices
   returns if either price moves. The keys are made here, so a screen
   never invents one.

   PURE: no React, no store. It takes the lists and their lines.
   ============================================================ */

import {
  PAIR_ORIGIN_FIELD,
  displayFieldOf,
  isDiscontinued,
  isRetired,
  readCell,
  rowLabel,
  type CellValue,
  type EntityDef,
  type FieldDef,
  type RowData,
} from '@/domain/model'
import { priceLevelsFor } from '@/domain/quote/pricing'
import {
  TRAILER_KEY_COLUMN,
  TRAILER_MASS_BANDS,
  atmBandDisagreements,
  feeForBand,
  findFeeRegister,
  massBandFor,
  type FeeRegister,
  type MassBand,
} from '@/domain/rules/constraints/registration'
import { lintProject, type LintFinding } from '@/domain/rules/lint'

export interface ReviewWorld {
  entities: Readonly<Record<string, EntityDef>>
  rowsByEntity: Readonly<Record<string, readonly RowData[]>>
}

/** What a dealer has left as meant: the finding's key, and when. */
export type Meant = Readonly<Record<string, string>>

const named = (table: EntityDef, name: string): FieldDef | undefined => {
  const wanted = name.trim().toLowerCase()
  return table.fields.find((f) => f.name.trim().toLowerCase() === wanted)
}

const norm = (s: string): string => s.replace(/\s+/g, ' ').trim().toLowerCase()

const onSale = (table: EntityDef, row: RowData): boolean =>
  !isRetired(table) && !isDiscontinued(row)

const blank = (v: CellValue): boolean => v === null || v === undefined || v === ''

/* ============================================================
   1 · THE BAND
   ============================================================ */

/** A band's first word, as a dealer says it: `Small Trailers - Up to 1.02t` is "Small". */
export const bandWord = (band: string): string => band.trim().split(/\s+/)[0] ?? band

/**
 * The bands whose OWN LABEL admits a weight — read, never derived.
 *
 * `registration.ts` refuses to derive a band, and this does not: it asks every label that
 * states a bound whether this weight is inside it. A 1,500 kg trailer is admitted by
 * `Large Trailers - Over 1.021t` alone; a 5,000 kg one by both Large and Heavy, because no
 * label gives Large a ceiling, and then no single band is proposed and the dealer chooses.
 */
export function bandsAdmitting(atmKg: number, bands: readonly MassBand[] = TRAILER_MASS_BANDS) {
  return bands.filter(
    (b) =>
      (b.atLeastKg !== undefined || b.atMostKg !== undefined) &&
      (b.atLeastKg === undefined || atmKg >= b.atLeastKg) &&
      (b.atMostKg === undefined || atmKg <= b.atMostKg),
  )
}

/** The columns one press writes on a trailer, by id. */
export interface RebandColumns {
  band: string
  fee: string | null
  sell: string | null
  /** the sell before registration, which the file adds the fee to */
  base: string | null
}

/** The line as it would read once re-banded. */
export interface RebandTo {
  band: string
  word: string
  fee: number
  /** `Sell inc Rego` after the press: the file's own `ROUNDUP(Sell + Rego ($))` */
  sell: number | null
  /** what the customer is charged more (+) or less (−) on this trailer */
  delta: number
}

export interface Reband {
  key: string
  tableId: string
  tableName: string
  rowId: string
  /** the line's name in the file */
  label: string
  code: string
  atmKg: number
  band: string
  word: string
  fee: number | null
  sell: number | null
  /** heavier than its band's ceiling, or lighter than its band's floor */
  way: 'heavier' | 'lighter'
  /** the bound its band's label states, in kilograms */
  boundKg: number
  readFrom: string
  /** the one band whose label admits this weight, priced; null when none or several do */
  to: RebandTo | null
  /** every band whose label admits this weight, by name */
  admits: string[]
  columns: RebandColumns
}

export interface BandGroup {
  key: string
  way: 'heavier' | 'lighter'
  band: string
  word: string
  fee: number | null
  boundKg: number
  lines: Reband[]
}

export interface BandReview {
  /** trailers with a weight and a band that states one — the denominator */
  tested: number
  groups: BandGroup[]
  /** every finding, heavier first, in the file's order */
  lines: Reband[]
  /** the labels the bounds were read from */
  readFrom: string[]
  /** money: the sum of the positive deltas, and of the negative ones */
  notCharged: number
  chargedOver: number
  /** how many trailers each sum is over: those charged too little, and those charged too much */
  notChargedOn: number
  chargedOverOn: number
  /** trailers a dealer left as meant, which no sum counts */
  meant: number
}

const num = (v: CellValue): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null

function priced(register: FeeRegister | undefined, band: string): number | null {
  if (!register) return null
  return feeForBand(register, band, 'sell')?.amount ?? null
}

const bandKey = (tableId: string, rowId: string, band: string, atmKg: number): string =>
  `band:${tableId}:${rowId}:${band}:${atmKg}`

export function bandReview(world: ReviewWorld, meant: Meant = {}): BandReview {
  const entities = world.entities as Record<string, EntityDef>
  const rows = world.rowsByEntity as Record<string, RowData[]>
  const check = atmBandDisagreements(entities, rows)
  const register = findFeeRegister(entities, rows)

  const lines: Reband[] = []
  let left = 0
  for (const d of check.disagreements) {
    if (d.heldBack) continue
    /* LEFT AS MEANT, keyed on the trailer, its band and its weight: it comes back the day either
       changes, as every other check's does */
    if (meant[bandKey(d.tableId, d.rowId, d.band, d.atmKg)]) {
      left += 1
      continue
    }
    const table = entities[d.tableId]
    const row = (rows[d.tableId] ?? []).find((r) => r.id === d.rowId)
    const bandCol = table ? named(table, TRAILER_KEY_COLUMN) : undefined
    if (!table || !row || !bandCol) continue
    const feeCol = named(table, 'Rego ($)')
    const sellCol = named(table, 'Sell inc Rego')
    const baseCol = named(table, 'Sell')
    const codeCol = named(table, 'Code')
    const bound = massBandFor(d.band)
    const heavier = bound?.atMostKg !== undefined && d.atmKg > bound.atMostKg
    const fee = feeCol ? num(readCell(row, feeCol.id)) : null
    const sell = sellCol ? num(readCell(row, sellCol.id)) : null
    const base = baseCol ? num(readCell(row, baseCol.id)) : null

    const admits = bandsAdmitting(d.atmKg)
    const only = admits.length === 1 ? admits[0] : undefined
    const newFee = only ? priced(register, only.band) : null
    let to: RebandTo | null = null
    if (only && newFee !== null) {
      const delta = newFee - (fee ?? priced(register, d.band) ?? 0)
      to = {
        band: only.band,
        word: bandWord(only.band),
        fee: newFee,
        sell: base !== null ? Math.ceil(base + newFee) : sell !== null ? sell + delta : null,
        delta,
      }
    }

    lines.push({
      key: bandKey(d.tableId, d.rowId, d.band, d.atmKg),
      tableId: d.tableId,
      tableName: d.tableName,
      rowId: d.rowId,
      label: d.rowLabel,
      code: codeCol ? String(readCell(row, codeCol.id) ?? '') : '',
      atmKg: d.atmKg,
      band: d.band,
      word: bandWord(d.band),
      fee,
      sell,
      way: heavier ? 'heavier' : 'lighter',
      boundKg: (heavier ? bound?.atMostKg : bound?.atLeastKg) ?? 0,
      readFrom: d.readFrom,
      to,
      admits: admits.map((b) => b.band),
      columns: {
        band: bandCol.id,
        fee: feeCol?.id ?? null,
        sell: sellCol?.id ?? null,
        base: baseCol?.id ?? null,
      },
    })
  }

  /* heavier first: they are the ones charged too little */
  lines.sort((a, b) => (a.way === b.way ? 0 : a.way === 'heavier' ? -1 : 1))

  const groups: BandGroup[] = []
  for (const line of lines) {
    const key = `${line.way}:${line.band}`
    let g = groups.find((x) => x.key === key)
    if (!g) {
      g = {
        key,
        way: line.way,
        band: line.band,
        word: line.word,
        fee: line.fee,
        boundKg: line.boundKg,
        lines: [],
      }
      groups.push(g)
    }
    g.lines.push(line)
  }

  let notCharged = 0
  let chargedOver = 0
  let notChargedOn = 0
  let chargedOverOn = 0
  for (const line of lines) {
    if (!line.to) continue
    if (line.to.delta > 0) {
      notCharged += line.to.delta
      notChargedOn += 1
    } else if (line.to.delta < 0) {
      chargedOver -= line.to.delta
      chargedOverOn += 1
    }
  }

  return {
    tested: check.tested,
    groups,
    lines,
    readFrom: [...new Set(lines.map((l) => l.readFrom))],
    notCharged,
    chargedOver,
    notChargedOn,
    chargedOverOn,
    meant: left,
  }
}

/* ============================================================
   2 · ONE NAME, TWO PRICES
   ============================================================ */

export interface PricedLine {
  rowId: string
  code: string
  price: number
  /** every price the list declares, as this line carries it: what "sell both at this" copies */
  levels: Array<{ fieldId: string; label: string; value: CellValue }>
}

export interface TwoPrices {
  key: string
  name: string
  lines: PricedLine[]
  low: number
  high: number
}

export interface PlaceGroup<T> {
  tableId: string
  tableName: string
  /** the price the check read, by the list's own name for it ('Sell', 'Cash', 'Sell inc Rego') */
  priceName: string
  items: T[]
}

const firstPrice = (table: EntityDef) => priceLevelsFor(table)[0]

export function twoPrices(world: ReviewWorld, meant: Meant = {}) {
  const groups: PlaceGroup<TwoPrices>[] = []
  let left = 0
  for (const table of tables(world)) {
    const levels = priceLevelsFor(table)
    const level = levels[0]
    if (!level || isRetired(table)) continue
    const codeCol =
      named(table, 'Code') ?? named(table, 'Model Code') ?? named(table, 'Part Number')
    const byName = new Map<string, { name: string; lines: PricedLine[] }>()
    for (const row of world.rowsByEntity[table.id] ?? []) {
      if (!onSale(table, row)) continue
      const price = num(readCell(row, level.fieldId))
      if (price === null) continue
      const name = rowLabel(table, row)
      const key = norm(name)
      if (key === '' || name.startsWith('(untitled')) continue
      const hit = byName.get(key) ?? { name: name.replace(/\s+/g, ' ').trim(), lines: [] }
      hit.lines.push({
        rowId: row.id,
        code: codeCol ? String(readCell(row, codeCol.id) ?? '').trim() : '',
        price,
        levels: levels.map((l) => ({
          fieldId: l.fieldId,
          label: l.label,
          value: readCell(row, l.fieldId) ?? null,
        })),
      })
      byName.set(key, hit)
    }
    const items: TwoPrices[] = []
    for (const [key, hit] of byName) {
      const prices = [...new Set(hit.lines.map((l) => l.price))].sort((a, b) => a - b)
      if (prices.length < 2) continue
      const item: TwoPrices = {
        key: `two:${table.id}:${key}:${prices.join('/')}`,
        name: hit.name,
        lines: hit.lines,
        low: prices[0]!,
        high: prices[prices.length - 1]!,
      }
      if (meant[item.key]) left += 1
      else items.push(item)
    }
    if (items.length > 0)
      groups.push({ tableId: table.id, tableName: table.name, priceName: level.label, items })
  }
  /* the name whose two prices lie furthest apart: the one the check is said by */
  let widest: TwoPrices | null = null
  for (const g of groups)
    for (const item of g.items)
      if (!widest || item.high - item.low > widest.high - widest.low) widest = item
  return { groups, count: count(groups), meant: left, widest }
}

/* ============================================================
   3 · ON SALE, AND NO PRICE
   ============================================================ */

export interface Unpriced {
  key: string
  rowId: string
  name: string
  /** the nearest line in the same list and group that has a price, as the dealer would see it
   *  beside this one in the price list; null when none does */
  beside: { rowId: string; name: string; price: number } | null
}

export interface NoPriceGroup {
  key: string
  tableId: string
  tableName: string
  priceName: string
  /** the list's own grouping word for these lines — its Category or Series — or null */
  category: string | null
  kind: 'zero' | 'blank'
  /** the price a typed figure is written at: the list's first, the one it is sold at */
  priceFieldId: string
  /** every price the list declares, by its own name ('Sell', 'Sell inc Install (if appl.)') */
  priceNames: string[]
  lines: Unpriced[]
}

/** One price list's groups, said once over them: the list, the price it was read at, its count. */
export interface NoPriceList {
  tableId: string
  tableName: string
  priceName: string
  groups: NoPriceGroup[]
  /** Σ lines across the list's groups */
  count: number
}

export interface NoPriceReview {
  groups: NoPriceGroup[]
  /** the same groups by list, in the order their first group stands */
  lists: NoPriceList[]
  count: number
  meant: number
  /** boats at $0 that are sold as a factory package, which carries the price — not counted */
  packages: Array<{ tableName: string; count: number }>
}

const GROUP_WORDS = ['Category', 'Series', 'Section']

/**
 * The lines of a list that a pairing list sells as a factory package: the boat whose price is
 * the package's. Haines Signature's nine boats are $0 at Cash because every one of them is sold
 * with its motor, and the package carries the price (FITMENT_RULES §1.5). Found by the shape of
 * the file — a pairing list with one end on this list and the other on a list of packages —
 * never by a maker's name.
 */
export function soldAsPackage(world: ReviewWorld, tableId: string): Set<string> {
  const out = new Set<string>()
  for (const join of tables(world)) {
    if (join.role !== 'join') continue
    const links = join.fields.filter((f) => f.type === 'reference' && f.refEntityId)
    const mine = links.find((f) => f.refEntityId === tableId)
    const pack = links.find(
      (f) => f !== mine && world.entities[f.refEntityId ?? '']?.kind === 'package',
    )
    if (!mine || !pack) continue
    for (const row of world.rowsByEntity[join.id] ?? []) {
      if (row.values[PAIR_ORIGIN_FIELD] === 'removed') continue
      const id = readCell(row, mine.id)
      if (typeof id === 'string' && id !== '') out.add(id)
    }
  }
  return out
}

export function noPrice(world: ReviewWorld, meant: Meant = {}): NoPriceReview {
  const groups: NoPriceGroup[] = []
  const packages: NoPriceReview['packages'] = []
  let left = 0
  for (const table of tables(world)) {
    /* EVERY DECLARED PRICE IS READ, not the first only (the sweep of 2026-10-28, §0.1): Parts
       declares Sell and Sell inc Install, and a labour estimate is $0 supplied by design and $44
       fitted. A line is on sale with no price only when every price its list declares is blank
       or $0 — 101 of the 147 the first-price read counted had a price. */
    const levels = priceLevelsFor(table)
    const level = levels[0]
    if (!level || isRetired(table)) continue
    const nameCol = displayFieldOf(table)
    const groupCol = GROUP_WORDS.map((w) => named(table, w)).find(Boolean)
    const packaged = table.kind === 'boat' ? soldAsPackage(world, table.id) : new Set<string>()
    let inPackages = 0
    const byGroup = new Map<string, NoPriceGroup>()
    const all = world.rowsByEntity[table.id] ?? []
    const groupOf = (row: RowData): string | null => {
      const cat = groupCol ? readCell(row, groupCol.id) : null
      return typeof cat === 'string' && cat.trim() !== '' ? cat.trim() : null
    }
    for (const [at, row] of all.entries()) {
      if (!onSale(table, row)) continue
      const values = levels.map((l) => readCell(row, l.fieldId))
      if (!values.every((v) => v === 0 || blank(v))) continue
      const kind = values.some((v) => v === 0) ? 'zero' : 'blank'
      /* a line with no name is said once, under "nothing to name it" */
      if (nameCol && blank(readCell(row, nameCol.id))) continue
      if (packaged.has(row.id)) {
        inPackages += 1
        continue
      }
      const key = `none:${table.id}:${row.id}:${kind}`
      if (meant[key]) {
        left += 1
        continue
      }
      const category = groupOf(row)
      const gk = `none:${table.id}:${category ?? ''}:${kind}`
      const g = byGroup.get(gk) ?? {
        key: gk,
        tableId: table.id,
        tableName: table.name,
        priceName: level.label,
        category,
        kind,
        priceFieldId: level.fieldId,
        priceNames: levels.map((l) => l.label),
        lines: [],
      }
      g.lines.push({
        key,
        rowId: row.id,
        name: rowLabel(table, row).replace(/\s+/g, ' ').trim(),
        beside: besideOf(table, all, at, level.fieldId, category, groupOf),
      })
      byGroup.set(gk, g)
    }
    if (inPackages > 0) packages.push({ tableName: table.name, count: inPackages })
    groups.push(...byGroup.values())
  }
  /* the group that clears most with one press first; the name breaks a tie */
  groups.sort(
    (a, b) =>
      b.lines.length - a.lines.length ||
      (a.tableName + (a.category ?? '')).localeCompare(b.tableName + (b.category ?? '')),
  )
  const lists: NoPriceList[] = []
  for (const g of groups) {
    const at = lists.find((l) => l.tableId === g.tableId)
    if (at) {
      at.groups.push(g)
      at.count += g.lines.length
    } else
      lists.push({
        tableId: g.tableId,
        tableName: g.tableName,
        priceName: g.priceName,
        groups: [g],
        count: g.lines.length,
      })
  }
  return {
    groups,
    lists,
    count: groups.reduce((n, g) => n + g.lines.length, 0),
    meant: left,
    packages,
  }
}

/**
 * THE PRICED LINE BESIDE AN UNPRICED ONE: the nearest line on sale in the same list and the same
 * group of it (its Category or Series) with a price above $0, the one before it on a tie. It is
 * what the dealer would see next to it in the price list, said so he can type a price knowing
 * what its neighbour sells at — never a price proposed for it.
 */
function besideOf(
  table: EntityDef,
  rows: readonly RowData[],
  at: number,
  fieldId: string,
  category: string | null,
  groupOf: (row: RowData) => string | null,
): Unpriced['beside'] {
  for (let d = 1; at - d >= 0 || at + d < rows.length; d += 1) {
    for (const i of [at - d, at + d]) {
      const row = rows[i]
      if (!row || !onSale(table, row) || groupOf(row) !== category) continue
      const price = num(readCell(row, fieldId))
      if (price === null || price <= 0) continue
      return { rowId: row.id, name: rowLabel(table, row).replace(/\s+/g, ' ').trim(), price }
    }
  }
  return null
}

/**
 * THE LISTS NO PRICE CHECK CAN READ: on sale, not a pairing list, and declaring no price at all,
 * so a line in them cannot be missing one (the sweep of 2026-10-28, §0.2). Said by the screen
 * once, as what was not checked — never counted as clean.
 */
export function unchecked(
  world: ReviewWorld,
): Array<{ tableId: string; tableName: string; lines: number }> {
  /* THE FEE LIST IS READ (built-critique-m3-2.md, minor): Registration Costs declares no price,
     but the wrong-size check reads its fees, and its first case shows two of them. A list a
     check reads is not "not checked". */
  const fees = findFeeRegister(
    world.entities as Record<string, EntityDef>,
    world.rowsByEntity as Record<string, RowData[]>,
  )?.table.id
  return tables(world)
    .filter(
      (t) => t.role !== 'join' && !isRetired(t) && priceLevelsFor(t).length === 0 && t.id !== fees,
    )
    .map((t) => ({
      tableId: t.id,
      tableName: t.name,
      lines: (world.rowsByEntity[t.id] ?? []).length,
    }))
}

/* ============================================================
   4 · TWO UNDER ONE NAME — the linter's blockers, with what tells them apart
   ============================================================ */

export interface TwinColumn {
  fieldId: string
  /** the name of the one before it in the list, which is how a person tells them apart */
  after: string | null
  /** its first few values as the file writes them */
  sample: Array<string | number>
  numeric: boolean
}

export interface Twins {
  key: string
  tableId: string
  tableName: string
  name: string
  columns: TwinColumn[]
}

function sampleOf(rows: readonly RowData[], field: FieldDef, n = 3): Array<string | number> {
  const out: Array<string | number> = []
  for (const row of rows) {
    const v = readCell(row, field.id)
    if (blank(v) || v === 0 || typeof v === 'boolean') continue
    if (typeof v !== 'string' && typeof v !== 'number') continue
    if (out.includes(v)) continue
    out.push(v)
    if (out.length >= n) break
  }
  return out
}

export function twins(world: ReviewWorld, findings: readonly LintFinding[], meant: Meant = {}) {
  const items: Twins[] = []
  let left = 0
  for (const f of findings) {
    if (f.ruleId !== 'field-dup-name') continue
    if (meant[f.id]) {
      left += 1
      continue
    }
    const table = world.entities[f.entityId]
    if (!table) continue
    const rows = (world.rowsByEntity[table.id] ?? []).filter((r) => onSale(table, r))
    const columns: TwinColumn[] = []
    for (const id of f.fieldIds ?? []) {
      const at = table.fields.findIndex((x) => x.id === id)
      const field = table.fields[at]
      if (!field) continue
      columns.push({
        fieldId: id,
        after: at > 0 ? (table.fields[at - 1]?.name ?? null) : null,
        sample: sampleOf(rows, field),
        numeric: field.type === 'number',
      })
    }
    if (columns.length < 2) continue
    items.push({
      key: f.id,
      tableId: table.id,
      tableName: table.name,
      name: table.fields.find((x) => x.id === columns[0]!.fieldId)?.name ?? '',
      columns,
    })
  }
  return { items, count: items.length, meant: left }
}

/* ============================================================
   5 · ON SALE, AND NOTHING TO NAME IT
   ============================================================ */

export interface Nameless {
  key: string
  tableId: string
  tableName: string
  rowId: string
  nameField: { id: string; name: string }
  /** what the line does say, so it can be told from its neighbours; '' when nothing */
  says: string
  /** its code in the list, where it has one; '' when not */
  code: string
}

/** The file's own NO, catalogued as a line ("Rigging Not Req.", "No Rigging"), is meant. */
const isSentinel = (table: EntityDef, row: RowData): boolean => {
  const f = named(table, 'Sentinel')
  return !!f && readCell(row, f.id) === true
}

export function nameless(world: ReviewWorld, meant: Meant = {}) {
  const groups: PlaceGroup<Nameless>[] = []
  let left = 0
  for (const table of tables(world)) {
    if (table.role === 'join' || isRetired(table)) continue
    const nameCol = displayFieldOf(table)
    if (!nameCol) continue
    const level = firstPrice(table)
    const codeCol =
      named(table, 'Code') ?? named(table, 'Model Code') ?? named(table, 'Part Number')
    const said = table.fields.filter(
      (f) => f.id !== nameCol.id && f.type === 'text' && norm(f.name) !== 'source',
    )
    const items: Nameless[] = []
    for (const row of world.rowsByEntity[table.id] ?? []) {
      if (!onSale(table, row) || isSentinel(table, row)) continue
      if (!blank(readCell(row, nameCol.id))) continue
      const key = `nameless:${table.id}:${row.id}`
      if (meant[key]) {
        left += 1
        continue
      }
      const first = said
        .map((f) => readCell(row, f.id))
        .find((v) => typeof v === 'string' && v.trim() !== '')
      items.push({
        key,
        tableId: table.id,
        tableName: table.name,
        rowId: row.id,
        nameField: { id: nameCol.id, name: nameCol.name },
        says: typeof first === 'string' ? first.replace(/\s+/g, ' ').trim() : '',
        code: codeCol ? String(readCell(row, codeCol.id) ?? '').trim() : '',
      })
    }
    if (items.length > 0)
      groups.push({
        tableId: table.id,
        tableName: table.name,
        priceName: level?.label ?? '',
        items,
      })
  }
  return { groups, count: count(groups), meant: left }
}

/* ============================================================
   TIDY — the linter's lessons, counted and folded
   ============================================================ */

/**
 * THE LINTER'S LESSONS IN THE DEALER'S WORDS. The engine titles them for a data modeller —
 * "Free text, few values", "Plural table name", "Hidden table" — and a dealer reads none of
 * those words (docs/WORDS.md). Each is said here as what it is about the price list, beside
 * `ruleTitle` in `describe.ts`, which cases the engine's own.
 */
const TIDY_SAID: Readonly<Record<string, string>> = {
  'text-low-cardinality': 'Typed words that could be chosen from a short list',
  'entity-plural': 'A list named for many where each of its lines is one',
  'prefix-cluster': 'A list of its own, kept inside another',
  'island-entity': 'A list nothing else points to',
  'no-identifier': 'A list with nothing that must be filled in to tell its lines apart',
  'repeating-columns': 'The same thing written out in numbered copies',
}

export const tidySaid = (ruleId: string): string =>
  TIDY_SAID[ruleId] ?? 'A suggestion about how the price list is laid out'

export interface TidyLine {
  ruleId: string
  count: number
  /** the lists it found them on, by name, most first */
  places: string[]
}

export function tidy(world: ReviewWorld, findings: readonly LintFinding[]): TidyLine[] {
  const map = new Map<string, { count: number; places: Map<string, number> }>()
  for (const f of findings) {
    if (f.ruleId === 'field-dup-name') continue
    const e = map.get(f.ruleId) ?? { count: 0, places: new Map<string, number>() }
    e.count += 1
    const name = world.entities[f.entityId]?.name ?? ''
    if (name !== '') e.places.set(name, (e.places.get(name) ?? 0) + 1)
    map.set(f.ruleId, e)
  }
  return [...map.entries()]
    .map(([ruleId, e]) => ({
      ruleId,
      count: e.count,
      places: [...e.places.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([n]) => n),
    }))
    .sort((a, b) => b.count - a.count || a.ruleId.localeCompare(b.ruleId))
}

/* ============================================================
   THE WHOLE REVIEW
   ============================================================ */

export interface Review {
  band: BandReview
  twoPrices: ReturnType<typeof twoPrices>
  noPrice: NoPriceReview
  twins: ReturnType<typeof twins>
  nameless: ReturnType<typeof nameless>
  tidy: TidyLine[]
  /** Σ count across the tidy lines */
  tidyCount: number
  /** the money and pick findings still standing — 0 is the clean day */
  open: number
  /** findings left as meant, across every check */
  meant: number
}

export function review(world: ReviewWorld, meant: Meant = {}): Review {
  const findings = lintProject({
    entities: world.entities as Record<string, EntityDef>,
    rowsByEntity: world.rowsByEntity as Record<string, RowData[]>,
  })
  const band = bandReview(world, meant)
  const two = twoPrices(world, meant)
  const none = noPrice(world, meant)
  const tw = twins(world, findings, meant)
  const nl = nameless(world, meant)
  const tidied = tidy(world, findings)
  return {
    band,
    twoPrices: two,
    noPrice: none,
    twins: tw,
    nameless: nl,
    tidy: tidied,
    tidyCount: tidied.reduce((n, t) => n + t.count, 0),
    open: band.lines.length + two.count + none.count + tw.count + nl.count,
    meant: band.meant + two.meant + none.meant + tw.meant + nl.meant,
  }
}

/** Every list, in a stable order: by name, then id. */
function tables(world: ReviewWorld): EntityDef[] {
  return Object.values(world.entities)
    .filter((e): e is EntityDef => !!e)
    .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id))
}

const count = <T>(groups: ReadonlyArray<PlaceGroup<T>>): number =>
  groups.reduce((n, g) => n + g.items.length, 0)
