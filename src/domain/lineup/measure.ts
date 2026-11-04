/* ============================================================
   A MODEL'S MEASURES, READ OFF ITS OWN ROWS — what a maker's own page
   prints on each model's card and sets side by side in the compare.

   EVERY FIGURE IS A CELL OF THE PRICE LIST. A model is the rows the
   file sells it as (Highfield's Sport 660 is sixteen versions), and a
   measure is read across them: a number as its span (5.66–6.52 m), a
   word as the distinct words the file wrote ("4 + 1"), each with how
   many of the model's rows carry it. A row that carries nothing adds
   nothing; nothing is guessed in its place.

   THE COLUMNS ARE FOUND BY THE NAMES THE FILE GIVES THEM, because the
   seven boat makers name one measure seven ways ("OA Length", "Hull
   Length (Mtr)", "Length (mtr)"). The list of names below is the
   file's own, and no cost column is ever named in it.

   Pure: no React, no store, no DOM.
   ============================================================ */
import { readCell, type EntityDef, type FieldDef, type RowData } from '@/domain/model'

/** What a maker's page measures a boat by. */
export type MeasureKey =
  | 'length'
  | 'beam'
  | 'people'
  | 'load'
  | 'weight'
  | 'fuel'
  | 'minHp'
  | 'maxHp'
  | 'shaft'
  | 'tube'
  | 'chambers'
  | 'cabins'
  | 'berths'

/** THE FILE'S OWN NAMES FOR EACH MEASURE, first found wins. Measured on the Master Price File
 *  of 16 September 2026 across the seven boat registers. */
export const MEASURE_NAMES: Readonly<Record<MeasureKey, readonly string[]>> = {
  length: [
    'OA Length',
    'Hull Length (Mtr)',
    'Hull Length (mtr)',
    'Hull Length',
    'Length (mtr)',
    'LOA',
  ],
  beam: ['Beam', 'Beam (Mtr)', 'Beam (mtr)', 'Hull Beam (mtr)'],
  people: ['Max People'],
  load: ['Max Load kg'],
  weight: [
    'Boat Weight kg',
    'Hull Weight (Dry) kg',
    'Hull Weight @ (Dry) kg',
    'App. Dry Hull Weight kg',
    'Displacement kg',
  ],
  fuel: ['Fuel Capacity', 'Fuel Capcity L'],
  minHp: ['Min HP'],
  maxHp: ['Max HP'],
  shaft: ['Shaft Lgth'],
  tube: ['Tube Dia. cm'],
  chambers: ['Air Chambers'],
  cabins: ['Cabins'],
  berths: ['Berths'],
}

const plain = (s: string): string => s.trim().toLowerCase()

/** The column a table files a measure under, or undefined where it files none. */
export function measureField(table: EntityDef, key: MeasureKey): FieldDef | undefined {
  for (const name of MEASURE_NAMES[key]) {
    const field = table.fields.find((f) => plain(f.name) === plain(name))
    if (field) return field
  }
  return undefined
}

/** One measure across a model's rows. */
export type Measure =
  | { kind: 'span'; lo: number; hi: number; n: number; of: number }
  | { kind: 'words'; words: string[]; n: number; of: number }

/** A cell the file wrote as a figure with its unit after it ("150 HP", "140 ltr", "105 L"),
 *  read as the figure; anything else is words. */
const FIGURE = /^\s*(\d+(?:\.\d+)?)\s*(?:hp|ltr|l|kg|m)?\s*$/i

export function figureOf(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : null
  if (typeof value !== 'string') return null
  const m = FIGURE.exec(value)
  if (!m) return null
  const n = Number(m[1])
  return n > 0 ? n : null
}

/** A measure across a model's rows: a span where every row that carries it carries a figure,
 *  the distinct words otherwise; null where no row carries it. */
export function measureOf(
  table: EntityDef,
  rows: readonly RowData[],
  key: MeasureKey,
): Measure | null {
  const field = measureField(table, key)
  if (!field) return null
  const held: unknown[] = []
  for (const row of rows) {
    const v = readCell(row, field.id)
    if (v === null || v === undefined) continue
    if (typeof v === 'string' && v.trim() === '') continue
    if (typeof v === 'number' && !(v > 0)) continue
    held.push(v)
  }
  if (held.length === 0) return null
  const figures = held.map(figureOf)
  if (figures.every((f): f is number => f !== null)) {
    return {
      kind: 'span',
      lo: Math.min(...figures),
      hi: Math.max(...figures),
      n: held.length,
      of: rows.length,
    }
  }
  return {
    kind: 'words',
    words: [...new Set(held.map((v) => String(v).trim().replace(/\s+/g, ' ')))],
    n: held.length,
    of: rows.length,
  }
}

/* ---------------------------------------------------------- */
/* Saying a measure                                            */
/* ---------------------------------------------------------- */

const num = (v: number, places = 2): string =>
  v.toLocaleString('en-AU', { maximumFractionDigits: places })

/** "6.52", "5.66–6.52" */
const spanSaid = (m: { lo: number; hi: number }, places = 2): string =>
  m.lo === m.hi ? num(m.lo, places) : `${num(m.lo, places)}–${num(m.hi, places)}`

/** The file's own words, with its "x" for a twin set as a times sign and its litres said once:
 *  "2 x 480 ltr" reads "2 × 480 L". */
export function wordsSaid(word: string): string {
  return word
    .replace(/(\d)\s*x\s*(\d)/gi, '$1 × $2')
    .replace(/(\d)\s*(?:ltr|l)\b\.?/gi, '$1 L')
    .replace(/(\d)\s*HP\b/g, '$1 hp')
}

const UNIT: Partial<Record<MeasureKey, string>> = {
  length: ' m',
  beam: ' m',
  load: ' kg',
  weight: ' kg',
  fuel: ' L',
  tube: ' cm',
  minHp: ' hp',
  maxHp: ' hp',
}

/** One measure as a card prints it — "6.52 m", "1,287 kg", "4 + 1" — or null where none. */
export function measureSaid(key: MeasureKey, m: Measure | null): string | null {
  if (!m) return null
  if (m.kind === 'words') return m.words.map(wordsSaid).join(' or ')
  return `${spanSaid(m, key === 'length' || key === 'beam' ? 2 : 0)}${UNIT[key] ?? ''}`
}

/** "13 people", "4 + 1 people", "2 or 3 people" */
export function peopleSaid(m: Measure | null): string | null {
  const said = measureSaid('people', m)
  return said === null ? null : `${said} people`
}

/** One way a boat may be powered, as the file writes it: a single motor or a rig of two or
 *  three, at a horsepower. */
interface Power {
  count: number
  hp: number
}

/** A horsepower cell read as the ways it names, or null where any part of it is words. The file
 *  writes a choice with a slash: "425 / 2 x 300 HP" is a single 425 or a twin 300 (Highfield's
 *  Sport 900, measured 2026-11-04). */
function powersOf(m: Measure): Power[] | null {
  if (m.kind === 'span') {
    return m.lo === m.hi
      ? [{ count: 1, hp: m.lo }]
      : [
          { count: 1, hp: m.lo },
          { count: 1, hp: m.hi },
        ]
  }
  const out: Power[] = []
  for (const word of m.words) {
    for (const part of word.split(/\s*(?:\/|\bor\b)\s*/i)) {
      const r = /^(?:(\d)\s*x\s*)?(\d+(?:\.\d+)?)\s*(?:hp)?$/i.exec(part.trim())
      if (!r) return null
      out.push({ count: r[1] ? Number(r[1]) : 1, hp: Number(r[2]) })
    }
  }
  return out.length > 0 ? out : null
}

/** "150–200 hp", "up to 2 × 300 hp", "from 90 hp" — one count of motors, from its least to its
 *  most as Min HP and Max HP name them. */
function powerSaid(count: number, lo: number | null, hi: number | null): string {
  const rig = count > 1 ? `${count} × ` : ''
  if (lo !== null && hi !== null)
    return lo === hi ? `${rig}${num(hi)} hp` : `${rig}${num(lo)}–${num(hi)} hp`
  if (hi !== null) return `up to ${rig}${num(hi)} hp`
  return `from ${rig}${num(lo ?? 0)} hp`
}

/** THE HORSEPOWER A BOAT TAKES, from its Min HP and Max HP read together: "150–200 hp", "up to
 *  250 hp" where the file names no least, "2 × 350–450 hp" for a twin, a choice the file writes
 *  with a slash said for each count of motors ("250–350 hp or up to 2 × 200 hp"), and the file's
 *  own words where they are words ("TBA"). Null where it names neither. */
export function hpSaid(min: Measure | null, max: Measure | null): string | null {
  if (!min && !max) return null
  if (min?.kind === 'span' && max?.kind === 'span') {
    return min.lo === max.hi ? `${num(max.hi)} hp` : `${num(min.lo)}–${num(max.hi)} hp`
  }
  if (!min && max?.kind === 'span') return `up to ${spanSaid(max, 0)} hp`
  if (min?.kind === 'span' && !max) return `from ${num(min.lo)} hp`
  /* EACH COUNT OF MOTORS SAID ON ITS OWN, singles first: the least the file names for it under
     Min HP and the most under Max HP. A twin is never spanned against a single. */
  const least = min ? powersOf(min) : []
  const most = max ? powersOf(max) : []
  if (least && most) {
    const counts = [...new Set([...least, ...most].map((p) => p.count))].sort((a, b) => a - b)
    const pick = (list: Power[], count: number, f: (...v: number[]) => number): number | null => {
      const hp = list.filter((p) => p.count === count).map((p) => p.hp)
      return hp.length > 0 ? f(...hp) : null
    }
    return counts
      .map((c) => powerSaid(c, pick(least, c, Math.min), pick(most, c, Math.max)))
      .join(' or ')
  }
  const lo = measureSaid('minHp', min)
  const hi = measureSaid('maxHp', max)
  const said = [lo, hi].filter((s): s is string => s !== null)
  return said.length === 0 ? null : said.join(' to ')
}

/* ---------------------------------------------------------- */
/* A model, measured                                           */
/* ---------------------------------------------------------- */

export interface ModelMeasures {
  length: Measure | null
  beam: Measure | null
  people: Measure | null
  load: Measure | null
  weight: Measure | null
  fuel: Measure | null
  minHp: Measure | null
  maxHp: Measure | null
  shaft: Measure | null
  tube: Measure | null
  chambers: Measure | null
  cabins: Measure | null
  berths: Measure | null
}

const KEYS = Object.keys(MEASURE_NAMES) as MeasureKey[]

export function measuresOf(table: EntityDef, rows: readonly RowData[]): ModelMeasures {
  return Object.fromEntries(
    KEYS.map((k) => [k, measureOf(table, rows, k)]),
  ) as unknown as ModelMeasures
}

/** The three facts a card sets under the price, each said or null: length, people, horsepower.
 *  A register that files no people column (every maker but Highfield) says nothing of people;
 *  a Highfield model whose rows leave it empty says so, because the column is there. */
export interface ThreeFacts {
  length: string | null
  people: string | null
  /** the register files a people column and this model's rows leave it empty */
  peopleUnfiled: boolean
  hp: string | null
}

export function threeFacts(table: EntityDef, m: ModelMeasures): ThreeFacts {
  return {
    length: measureSaid('length', m.length),
    people: peopleSaid(m.people),
    peopleUnfiled: m.people === null && measureField(table, 'people') !== undefined,
    hp: hpSaid(m.minHp, m.maxHp),
  }
}

/** The length a model is sorted and barred by: the least of its versions, or null. */
export const lengthOf = (m: ModelMeasures): number | null =>
  m.length?.kind === 'span' ? m.length.lo : null
