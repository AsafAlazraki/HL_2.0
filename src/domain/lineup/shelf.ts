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
   and the page says why where the figure would be.

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
import { defaultLevelKey } from '@/domain/quote/pricing'
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
    const size = text(row, fieldNamed(table, 'Boat Size (Mtr)'))
    const atm = figure(row, fieldNamed(table, 'ATM (KG)'))
    return [
      size ? `boats of ${size.replace(/\s*-\s*/, '–').replace(/\s*m(tr)?$/i, '')} m` : null,
      atm !== null ? `ATM ${kg(atm)}` : null,
    ].filter((s): s is string => s !== null)
  }
  return []
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
    const price = level
      ? figure(
          row,
          table.fields.find((f) => f.id === level.fieldId),
        )
      : null
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
