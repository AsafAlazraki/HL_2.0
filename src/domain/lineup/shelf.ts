/* ============================================================
   A LIST THAT IS NOT A BOAT MAKER, READ AS ITS OWN RANGE — Yamaha by
   horsepower, a trailer maker by its series with each trailer's ATM
   and the boats it takes, Labour Rates by its rates, OBSOLETE Trailers
   by its ten.

   EVERY LINE IN THE HEAD IS A LINE DRAWN. A line the file files under
   no heading stands under "Filed under no category" rather than being
   skipped (rangeOf skipped them until 2026-11-04: Parts lost 25 and
   Dealer Fit 74 with no sentence). A line no longer sold is counted
   apart and said, never drawn as if it could be sold; a list that is
   itself no longer sold draws every line, each said as no longer sold.

   A PRICE IS PRINTED ONLY AT A LEVEL A CUSTOMER MAY BE SHOWN
   (`levelsRead`). A list that declares none is drawn with no figure,
   and the page says why where the figure would be — with one
   exception the file itself names: Labour Rates declares no price,
   and each rate is printed at its "Rate (inc GST)", which the file
   calls the sell rate (`chargeOf`), so what an hour costs is on the
   page. Its Actual and Rate (Exc GST), which the file's other sheets
   cost an hour at, are never read here.

   A TRAILER is said by the boats it takes in the file's own words
   (`boatSizeSaid`: metres where the file writes metres, the boat
   itself where it writes a boat) and its own length where it carries
   one (`trailerLengthSaid`), and the shelf counts how many do.

   THE HORSEPOWER LADDER is the motor's own HP Rating: single motors in
   their ratings from the least, then twin and triple rigs. The file's
   sheet headings ("TWIN RIG OPTIONS - DEC w Dig Electro Hyd Steering")
   say how a rig is controlled, so they ride on the line, not over it.

   Pure: no React, no store, no DOM.
   ============================================================ */
import {
  isDiscontinued,
  isRetired,
  readCell,
  rowLabel,
  type EntityDef,
  type FieldDef,
  type PriceLevel,
  type RowData,
} from '@/domain/model'
import { branchOf } from '@/domain/modules/read'
import { seriesSaid } from '@/domain/catalogue/views/seriesSaid'
import { lineSaid } from '@/domain/quote/spoken'
import { nameOnPaper } from '@/domain/quote/paperWords'
import { motorFactsOf } from '@/domain/quote/goodsFacts'
import { defaultLevelKey, isCostColumn } from '@/domain/quote/pricing'
import { headingSaid, levelsRead } from './range'

export interface ShelfLine {
  id: string
  /** the line as the build and the paper name it */
  name: string
  /** the file's own code for it, '' where it files none */
  code: string
  /** what a person chooses it by, each said: "220 kg", "25″ shaft", "ATM 1,990 kg" */
  facts: string[]
  /** at the page's price, or null where the list prints none or the cell holds none */
  price: number | null
  /** no longer sold */
  gone: boolean
}

export interface ShelfGroup {
  /** the position's word for it — the heading as filed, or the horsepower */
  key: string
  /** as a heading prints it */
  name: string
  lines: ShelfLine[]
  from: number | null
  to: number | null
  priced: number
}

export interface Shelf {
  groups: ShelfGroup[]
  /** how it is cut: the file's first heading, or the motor's horsepower */
  by: 'heading' | 'hp' | 'none'
  /** the heading's own word, lower case — "category", "series", "section" */
  heading: string
  /** the price a figure is printed at, or null where the list declares none a customer may see */
  level: PriceLevel | null
  /** where the list declares no price, the column the file charges an hour at (Labour Rates'
   *  Rate (inc GST)), whose figure each line prints by the file's own name; else null */
  charge: { label: string; fieldId: string } | null
  /** the figures are said to the cent: a quarter or more of those drawn carry cents, as the
   *  sheet says a column (Labour Rates' Rate (inc GST), 7 of 18) */
  cents: boolean
  /** a trailer list: how many of the lines drawn carry their own length, and whether the list
   *  files the column at all; null for any other kind */
  lengths: { filed: boolean; n: number; of: number } | null
  /** the lines drawn */
  lines: number
  /** lines filed under no heading, drawn under their own */
  unfiled: number
  /** lines no longer sold, counted and not drawn (a list still sold) */
  held: number
  /** the whole list is no longer sold, so every line is drawn and said so */
  retired: boolean
}

const plain = (s: string): string => s.trim().toLowerCase()
const fieldNamed = (table: EntityDef, ...names: string[]): FieldDef | undefined =>
  names
    .map((n) => table.fields.find((f) => plain(f.name) === plain(n)))
    .find((f) => f !== undefined)

const text = (row: RowData, field: FieldDef | undefined): string => {
  if (!field) return ''
  const v = readCell(row, field.id)
  return typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : ''
}
const figure = (row: RowData, field: FieldDef | undefined): number | null => {
  if (!field) return null
  const v = readCell(row, field.id)
  return typeof v === 'number' && v > 0 ? v : null
}
const kg = (v: number): string => `${v.toLocaleString('en-AU')} kg`

/** What a person chooses a line by, from the columns its kind files — never a cost. */
function factsOf(table: EntityDef, row: RowData, by: Shelf['by']): string[] {
  if (table.kind === 'motor') {
    const m = motorFactsOf(table, row)
    const control = text(row, fieldNamed(table, 'Control'))
    /* on the horsepower ladder the file's own sheet heading says how a rig is controlled or
       when a motor comes ("VMAX SHO - Forward Orders Only"), so it rides on the line */
    const sheet = by === 'hp' ? branchOf(table, row) : ''
    return [
      by === 'hp' || !m.hp ? null : `${m.hp} hp`,
      m.kg !== null ? kg(m.kg) : null,
      m.shaft ? `${m.shaft.replace(/"$/, '″')} shaft` : null,
      control || null,
      sheet ? headingSaid(seriesSaid(sheet).name) : null,
    ].filter((s): s is string => s !== null)
  }
  if (table.kind === 'trailer') {
    const size = boatSizeSaid(text(row, fieldNamed(table, 'Boat Size (Mtr)')))
    const length = trailerLengthSaid(figure(row, fieldNamed(table, TRAILER_LENGTH)))
    const atm = figure(row, fieldNamed(table, 'ATM (KG)'))
    return [size, length, atm !== null ? `ATM ${kg(atm)}` : null].filter(
      (s): s is string => s !== null,
    )
  }
  return []
}

/* ---------------------------------------------------------- */
/* A trailer's own words                                       */
/* ---------------------------------------------------------- */

/** A length in metres as the file writes one: "5.5", "4.75", "3.9M", "6.2 M", "4.5 - 4.9m". */
const METRES = /^(\d{1,2}(?:\.\d+)?)\s*(?:m|mtr)?$/i

/**
 * THE BOATS A TRAILER TAKES, from its "Boat Size (Mtr)" as the file writes it. The column is
 * named in metres and holds metres on most lists ("5.5", "5.0-5.2", "3.9M", "3.5 - 4.0m"), said
 * "boats of 5.0–5.2 m", a slash as a choice ("4.7/5.0M" is "boats of 4.7 or 5.0 m"). On NSM
 * Custom, GFAB, BMT and the OBSOLETE list it holds the boat itself, by its number or its name
 * ("495", "1450 Exp", "MF 605", "Highfield ADV7", "Jet Ski"): those are said as the boat the
 * trailer is for, in the file's own words, and never with a unit the file does not give them
 * (until 2026-11-04 every one was printed "boats of 575 m", "boats of Jet Ski m"). A figure is
 * read as metres only where it could be a boat's length, under 30.
 */
export function boatSizeSaid(value: string): string | null {
  const v = value.trim().replace(/\s+/g, ' ')
  if (v === '') return null
  const parts = v.split(/\s*([-–/])\s*/)
  /* "5.0-5.2" splits as ["5.0", "-", "5.2"]: every other part a length, between them the mark */
  const lengths = parts.filter((_, i) => i % 2 === 0)
  const marks = parts.filter((_, i) => i % 2 === 1)
  const metres = lengths.map((p) => METRES.exec(p)?.[1])
  if (metres.every((m): m is string => m !== undefined && Number(m) > 0 && Number(m) < 30)) {
    const said = metres
      .map((m, i) => (i === 0 ? m : `${marks[i - 1] === '/' ? ' or ' : '–'}${m}`))
      .join('')
    return `boats of ${said} m`
  }
  return `for the ${v}`
}

/** The column a trailer's own length is filed under. */
export const TRAILER_LENGTH = 'Trailer Length (Mtr)'

/**
 * A TRAILER'S OWN LENGTH, said in metres. The column is named in metres and holds millimetres on
 * every line that carries one (REDCO 49 of 52, NSM Custom 24 of 73, Dunbier 2 of 102, from 4,240
 * to 9,300; measured 2026-11-04), so a figure of a thousand or more is read as millimetres and a
 * figure under 30 as the metres the name says. Anything between is not a trailer's length and is
 * not said.
 */
export function trailerLengthSaid(v: number | null): string | null {
  if (v === null) return null
  const m = v >= 1000 ? v / 1000 : v < 30 ? v : null
  return m === null ? null : `${m.toLocaleString('en-AU', { maximumFractionDigits: 2 })} m long`
}

/* ---------------------------------------------------------- */
/* An hour, where a list declares no price                     */
/* ---------------------------------------------------------- */

/** THE FILE'S OWN NAME FOR WHAT AN HOUR IS CHARGED AT, on a list that declares no price. Labour
 *  Rates carries it: "THE SELL RATE, and five consumers in four workbooks agree on it". Its other
 *  two figures, Actual and Rate (Exc GST), are what the file's other sheets cost an hour at, and
 *  are never named here. */
export const CHARGE_NAMES = ['Rate (inc GST)'] as const

/** The column an hour is charged at, where a list declares no price and files one by the name
 *  the file gives it; never a cost column. */
export function chargeOf(table: EntityDef): { label: string; fieldId: string } | null {
  if (levelsRead(table).shown.length > 0 || levelsRead(table).kept.length > 0) return null
  const field = fieldNamed(table, ...CHARGE_NAMES)
  if (!field || field.type !== 'number' || isCostColumn(table, field)) return null
  return { label: field.name, fieldId: field.id }
}

/** A motor's horsepower as its ladder orders it: singles by rating, then rigs by count. */
function hpOrder(key: string): number {
  const rig = /^(\d)\s*x\s*(\d+(?:\.\d+)?)$/i.exec(key)
  if (rig) return Number(rig[1]) * 10_000 + Number(rig[2])
  const n = Number(key)
  return Number.isFinite(n) && key !== '' ? n : 1_000_000
}
export const hpHeading = (key: string): string =>
  key === '' ? 'No horsepower filed' : `${key.replace(/\s*x\s*/i, ' × ')} hp`

export function shelfOf(table: EntityDef, rows: readonly RowData[]): Shelf {
  const retired = isRetired(table)
  const levels = (table.hierarchy ?? []).length
  const hpField = table.kind === 'motor' ? fieldNamed(table, 'HP Rating') : undefined
  const by: Shelf['by'] = hpField ? 'hp' : levels >= 2 ? 'heading' : 'none'
  const headingField =
    levels >= 2 ? table.fields.find((f) => f.id === table.hierarchy?.[0]) : undefined
  const heading = plain(headingField?.name ?? 'heading')
  const shown = levelsRead(table).shown
  const level = shown.find((l) => l.key === defaultLevelKey(table)) ?? shown[0] ?? null
  const codeField = fieldNamed(table, 'Model Code', 'Code', 'Part No.', 'Part Number', 'REV Code')
  const charge = level ? null : chargeOf(table)
  const priceField = table.fields.find((f) => f.id === (level?.fieldId ?? charge?.fieldId))
  const lengthField = table.kind === 'trailer' ? fieldNamed(table, TRAILER_LENGTH) : undefined
  let lengths = 0
  let cents = 0
  let priced = 0

  const groups = new Map<string, ShelfGroup>()
  let held = 0
  let drawn = 0
  for (const row of rows) {
    const gone = retired || isDiscontinued(row)
    if (gone && !retired) {
      held += 1
      continue
    }
    const key =
      by === 'hp'
        ? text(row, hpField).replace(/\s+/g, ' ')
        : by === 'heading'
          ? branchOf(table, row)
          : ''
    let group = groups.get(key)
    if (!group) {
      group = {
        key,
        name:
          by === 'hp'
            ? hpHeading(key)
            : key === ''
              ? by === 'none'
                ? table.name
                : `Filed under no ${heading}`
              : headingSaid(seriesSaid(key).name),
        lines: [],
        from: null,
        to: null,
        priced: 0,
      }
      groups.set(key, group)
    }
    const price = figure(row, priceField)
    if (!gone && trailerLengthSaid(figure(row, lengthField)) !== null) lengths += 1
    group.lines.push({
      id: row.id,
      name: nameOnPaper(lineSaid(rowLabel(table, row), table.name)),
      code: text(row, codeField),
      facts: factsOf(table, row, by),
      price: gone ? null : price,
      gone,
    })
    drawn += 1
    if (!gone && price !== null) {
      priced += 1
      if (Math.abs(price - Math.round(price)) >= 0.005) cents += 1
      group.priced += 1
      group.from = group.from === null ? price : Math.min(group.from, price)
      group.to = group.to === null ? price : Math.max(group.to, price)
    }
  }
  let list = [...groups.values()]
  if (by === 'hp') list = list.sort((a, b) => hpOrder(a.key) - hpOrder(b.key))
  /* the unfiled stand first, where the head's count is checked against them */
  else list = [...list.filter((g) => g.key === ''), ...list.filter((g) => g.key !== '')]
  return {
    groups: list,
    by,
    heading,
    level,
    charge,
    cents: priced > 0 && cents * 4 >= priced,
    lengths:
      table.kind === 'trailer' ? { filed: lengthField !== undefined, n: lengths, of: drawn } : null,
    lines: drawn,
    unfiled: by === 'heading' ? (groups.get('')?.lines.length ?? 0) : 0,
    held,
    retired,
  }
}

/** The lines a find reaches — by name, code or fact, every word of it — group by group. */
export function findOnShelf(shelf: Shelf, query: string): ShelfGroup[] {
  const words = plain(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return shelf.groups
  return shelf.groups
    .map((g) => ({
      ...g,
      lines: g.lines.filter((l) => {
        const hay = plain([l.name, l.code, ...l.facts, g.name].join(' '))
        return words.every((w) => hay.includes(w))
      }),
    }))
    .filter((g) => g.lines.length > 0)
}

/** Whether a rig: a motor heading that is two or three motors. */
export const isRig = (key: string): boolean => /^\d\s*x\s*/i.test(key)
