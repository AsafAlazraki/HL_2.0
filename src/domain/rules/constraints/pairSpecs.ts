/* ============================================================
   THE SPECS A DEALER RULES ON — each in the dealer's own word, read
   off whichever of the price list's columns says it.

   ── WHY THIS FILE EXISTS ──────────────────────────────────────

   Until 2026-10-22 a rule on /rules named the price list's columns by
   their headers, so the plate read "When the boat's Eng Configuration
   is Tiller" and the list offered Matrix, Shaft Lgth, Head/s and Boat
   Rego Decals (built-critique-m3.md). It also could not name a maker,
   a model or a figure: only a column of two to twenty-four words was
   offered, so "a Haines boat never gets …" and "a boat over 6 m …"
   could not be written at all.

   So a rule names a SPEC: one thing a dealer means — the boat's maker,
   its steering, its length — said in the trade's word (docs/WORDS.md:
   "ATM, shaft, hp are the trade's own words"), and read off whichever
   column of whichever list carries it. Northside's boat makers write
   a length as "Hull Length (Mtr)", "Hull Length", "OA Length" or
   "Length (mtr)"; a spec reads them all as one length, in metres.

   ── ONE SHAFT, IN INCHES, ON BOTH SIDES ───────────────────────

   A boat's transom is written S / SS / L / LS / XL / UL / XXL and a
   motor's leg in inches (20", 25"). The price list's own fold —
   workbookRules F6: S = SS = 15″, L = LS = 20″, XL = 25″, UL = XXL =
   30″, verified 234 of 234 inside the Motor Library — is applied here
   to both sides, so a boat's shaft and a motor's shaft are the same
   word and a rule can tie them together. A cell the fold cannot read
   as one length ("Sng UL / Twin XL", ePropulsion's XS) is left unread,
   and an unread cell never refuses — the fail-open discipline of
   `pairRules.ts`.

   ── A FIGURE IS A NUMBER THE FILE WRITES ──────────────────────

   A figure spec reads a number: a number cell as it is, a text cell by
   its figure ("8.94 m / 29' 4"" is 8.94). Horsepower is read the way
   `@/domain/fitment/envelope` reads it — a boat's Max HP for ONE motor
   ("350 / 2 x 200 HP" is 350), a motor's HP Rating per motor ("2 x
   225" is 225) — so Rules and Fitment never read one cell two ways.

   ── WHAT IS NOT A SPEC ────────────────────────────────────────

   A cost (never on a rule a salesperson's screen reads), a code, a
   picture, the file's own bookkeeping (Matrix, Source), and the
   columns only one maker writes about one boat (Head/s, Black Water,
   Boat Rego Decals). Northside rules on what goes with what; those
   are not that.

   Pure. No React, no store, no DOM.
   ============================================================ */

import { readCell } from '@/domain/model'
import type { CellValue, EntityDef, RowData } from '@/domain/model'
import { makerOfTable } from '@/domain/catalogue/makers'
import { readRigs } from '@/domain/fitment/envelope'

/** The three kinds a pair rule speaks of. */
export type PairKind = 'boat' | 'motor' | 'trailer'

/** A word chosen from a list, or a figure typed. */
export type SpecMeasure = 'word' | 'figure'

export interface PairSpec {
  /** stable forever: a filed rule names it (`spec:boat:steering`) */
  id: string
  kind: PairKind
  /** the dealer's word, as the sentence says it after "the boat's" */
  word: string
  measure: SpecMeasure
  /** a figure's unit as it follows the number: "6 m", "150 hp" */
  unit: string
  /** a figure's unit as a person is asked for it: "in metres" */
  unitAsked: string
  /** the price list's column names it reads, normalised, in the order it prefers them. Empty
   *  for the maker, which is the list itself. */
  columns: readonly string[]
  /** read one cell: a word's own value, or a figure */
  read: (cell: CellValue) => string | number | null
  /** say one of its word values in a sentence */
  say: (value: string) => string
}

export const norm = (s: string): string => s.trim().toLowerCase().replace(/\s+/g, ' ')

const text = (v: CellValue | undefined): string => {
  if (v === null || v === undefined) return ''
  if (typeof v === 'string') return v.replace(/\s+/g, ' ').trim()
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}

const asWritten = (cell: CellValue): string | null => {
  const t = text(cell)
  return t === '' ? null : t
}

const itself = (value: string): string => value

/* ---------------------------------------------------------- */
/* The shaft, folded to inches                                 */
/* ---------------------------------------------------------- */

/** The price list's own fold of a transom's letters to the inches of the leg it takes
 *  (workbookRules F6's `source`: S=SS=15" L=LS=20" XL=25" UL=XXL=30"). */
export const SHAFT_INCHES: Readonly<Record<string, number>> = {
  S: 15,
  SS: 15,
  L: 20,
  LS: 20,
  XL: 25,
  UL: 30,
  XXL: 30,
}

/** The trade's word for each length, the one the sheet says ("long shaft"). */
export const SHAFT_WORD: Readonly<Record<number, string>> = {
  15: 'short',
  20: 'long',
  25: 'extra-long',
  30: 'ultra-long',
}

/** A shaft cell as inches: "L" and "LS" are 20, `25"` is 25. A cell naming more than one
 *  length, or one the fold does not know, is not read. */
export function shaftInches(cell: CellValue): number | null {
  const t = text(cell).toUpperCase()
  if (t === '') return null
  const letters = SHAFT_INCHES[t]
  if (letters !== undefined) return letters
  const inches = /^(\d{2})\s*(?:"|”|″|IN|INCH(?:ES)?)?$/.exec(t)
  if (!inches) return null
  const n = Number(inches[1])
  return SHAFT_WORD[n] ? n : null
}

const shaftRead = (cell: CellValue): string | null => {
  const n = shaftInches(cell)
  return n === null ? null : String(n)
}

const shaftSay = (value: string): string => {
  const n = Number(value)
  const word = SHAFT_WORD[n]
  return word ? `${word} (${n}″)` : `${value}″`
}

/* ---------------------------------------------------------- */
/* Figures                                                     */
/* ---------------------------------------------------------- */

const FIGURE = /\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?/

/** A cell's figure: a number as it is, a text by the first figure it writes. */
export function figureOf(cell: CellValue): number | null {
  if (typeof cell === 'number') return Number.isFinite(cell) && cell > 0 ? cell : null
  const t = text(cell)
  const hit = FIGURE.exec(t)
  if (!hit) return null
  const n = Number(hit[0].replace(/,/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}

/** A boat's Max HP for one motor — the envelope's own reading. */
const boatHp = (cell: CellValue): number | null =>
  readRigs(cell).find((r) => r.count === 1)?.each ?? null

/** A motor's horsepower, per motor — the envelope's own reading. */
const motorHp = (cell: CellValue): number | null => readRigs(cell)[0]?.each ?? null

/* ---------------------------------------------------------- */
/* The specs                                                   */
/* ---------------------------------------------------------- */

const word = (
  kind: PairKind,
  id: string,
  said: string,
  columns: readonly string[],
  read: (cell: CellValue) => string | null = asWritten,
  say: (value: string) => string = itself,
): PairSpec => ({
  id,
  kind,
  word: said,
  measure: 'word',
  unit: '',
  unitAsked: '',
  columns,
  read,
  say,
})

const figure = (
  kind: PairKind,
  id: string,
  said: string,
  unit: string,
  unitAsked: string,
  columns: readonly string[],
  read: (cell: CellValue) => number | null = figureOf,
): PairSpec => ({
  id,
  kind,
  word: said,
  measure: 'figure',
  unit,
  unitAsked,
  columns,
  read,
  say: itself,
})

const maker = (kind: PairKind): PairSpec => word(kind, 'maker', 'maker', [])

/** Steering as a word in a sentence: "tiller", "remote". */
const steeringSay = (value: string): string => value.toLowerCase()

/**
 * EVERY SPEC, in the order a dealer reaches for them: who made it, what it is, then what it
 * measures. A spec this sheet carries on fewer than two values is not offered (`pairColumns`).
 */
export const PAIR_SPECS: readonly PairSpec[] = [
  maker('boat'),
  word('boat', 'series', 'series', ['series']),
  word('boat', 'model', 'model', ['model']),
  word(
    'boat',
    'steering',
    'steering',
    ['eng configuration', 'engine configuration'],
    asWritten,
    steeringSay,
  ),
  word('boat', 'shaft', 'shaft', ['shaft lgth', 'shaft length'], shaftRead, shaftSay),
  figure('boat', 'length', 'length', 'm', 'in metres', [
    'hull length (mtr)',
    'hull length',
    'oa length',
    'length (mtr)',
    'loa',
  ]),
  figure('boat', 'max-hp', 'max hp', 'hp', 'as a figure', ['max hp'], boatHp),

  maker('motor'),
  figure('motor', 'hp', 'horsepower', 'hp', 'as a figure', ['hp rating'], motorHp),
  word('motor', 'shaft', 'shaft', ['shaft length', 'shaft length in'], shaftRead, shaftSay),
  word('motor', 'controls', 'controls', ['control']),
  word('motor', 'starting', 'starting', ['starting']),
  word('motor', 'tilt', 'tilt and trim', ['tilt & trim']),
  word('motor', 'colour', 'colour', ['engine colour']),
  figure('motor', 'weight', 'weight', 'kg', 'in kg', ['weight kg']),

  maker('trailer'),
  word('trailer', 'series', 'series', ['series']),
  figure('trailer', 'atm', 'ATM', 'kg', 'in kg', ['atm (kg)']),
  word('trailer', 'winch', 'winch', ['winch']),
]

/** The field id a filed clause names a spec by. A spec is not one column, so it is not one
 *  column's id: `spec:boat:length` reads every length the boat makers write. */
export const specFieldId = (spec: PairSpec): string => `spec:${spec.kind}:${spec.id}`

/** The key a screen chooses a spec by: `boat::length`. */
export const specKey = (spec: PairSpec): string => `${spec.kind}::${spec.id}`

export function specByFieldId(fieldId: string): PairSpec | null {
  const hit = /^spec:(boat|motor|trailer):(.+)$/.exec(fieldId)
  if (!hit) return null
  return PAIR_SPECS.find((s) => s.kind === hit[1] && s.id === hit[2]) ?? null
}

export const specByKey = (key: string): PairSpec | null =>
  PAIR_SPECS.find((s) => specKey(s) === key) ?? null

/** The spec a column of the price list is read as — how a rule filed before specs existed, which
 *  names one column's own id, is read today. */
export function specOfColumn(kind: string, name: string): PairSpec | null {
  const n = norm(name)
  return PAIR_SPECS.find((s) => s.kind === kind && s.columns.includes(n)) ?? null
}

/* ---------------------------------------------------------- */
/* Reading a row                                               */
/* ---------------------------------------------------------- */

/** Which of a list's fields a spec reads, best first — found once per list. */
const FIELDS = new WeakMap<EntityDef, Map<string, string[]>>()

function fieldsFor(table: EntityDef, spec: PairSpec): string[] {
  let byTable = FIELDS.get(table)
  if (!byTable) {
    byTable = new Map()
    FIELDS.set(table, byTable)
  }
  const hit = byTable.get(spec.id)
  if (hit) return hit
  const ids: string[] = []
  for (const column of spec.columns) {
    const f = table.fields.find((x) => norm(x.name) === column)
    if (f) ids.push(f.id)
  }
  byTable.set(spec.id, ids)
  return ids
}

/**
 * WHAT ONE ROW SAYS FOR ONE SPEC: its maker, its word or its figure — or null, where the row is
 * another kind or writes nothing the spec can read. Null never refuses.
 */
export function specValue(spec: PairSpec, table: EntityDef, row: RowData): string | number | null {
  if (table.kind !== spec.kind) return null
  if (spec.id === 'maker') {
    const m = makerOfTable(table)
    return m === '' ? null : m
  }
  for (const id of fieldsFor(table, spec)) {
    const v = spec.read(readCell(row, id))
    if (v !== null && v !== '') return v
  }
  return null
}

/** A figure as the sentence says it: "6 m", "150 hp", "1,500 kg". */
export function figureSaid(spec: PairSpec, value: string): string {
  const n = Number(value)
  const shown = Number.isFinite(n) ? n.toLocaleString('en-AU', { maximumFractionDigits: 2 }) : value
  return spec.unit === '' ? shown : `${shown} ${spec.unit}`
}

/** A value as the sentence says it, whichever kind of spec it is. */
export const valueSaid = (spec: PairSpec, value: string): string =>
  spec.measure === 'figure' ? figureSaid(spec, value) : spec.say(value)
