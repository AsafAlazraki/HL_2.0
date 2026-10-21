/* ============================================================
   WHAT THE SHEET READS AND WHAT IT WRITES, as pure functions over the
   engine — no React, no DOM, no store. The screen calls these; the
   store applies what they build; nothing in `Sheet.tsx` phrases a
   sentence about the data that is not phrased here or in the engine.

   THE WRITES ARE BATCHES OF THE ENGINE'S OWN COMMANDS. A fill, a
   paste, a clear and a set-all are each many `updateCell`s and ONE
   step: `batch` in `domain/catalogue/commands.ts` refuses whole if any
   part refuses, skips the parts that change nothing, and hands back
   one inverse — so the UNDO the screen pins to the event undoes the
   whole fill, which is critique-m2's finding (4) answered by
   construction rather than by care.

   THE PRICE LIST'S WORDS ARE HERE TOO (2026-09-23): what a spine says
   in its lines, what a series band says once, what a picture's
   caption says it depicts. Each is a sentence made of the file's own
   column names and the file's own values, never a word about boats
   this file would have had to know.
   ============================================================ */
import {
  isImageValue,
  PAIR_RECOMMENDED_FIELD,
  primaryImage,
  rowLabel,
  type CellValue,
  type EntityDef,
  type FieldDef,
  type RowData,
} from '@/domain/model'
import { money } from '@/domain/money'
import { isCostColumn } from '@/domain/quote/pricing'
import { measured } from '@/domain/quote/spoken'
import { colourwayOf, type Colourway } from '@/domain/quote/colourway'
import { batch, updateCell, type CatalogueCommand } from '@/domain/catalogue/commands'
import {
  coerceCellText,
  normalizeRange,
  type Range,
  type ViewRow,
} from '@/domain/catalogue/table/core'
import { countLabel, leafNoun, type LeafNoun } from '@/domain/catalogue/table/grouping'
import { cellPrintText, cellText } from '@/domain/catalogue/table/helpers'
import type { LeadFigure } from '@/domain/catalogue/table/priceList'
import type { Said } from '@/domain/catalogue/table/saidOnce'
import { bandOf, formatCell, rangePairs, splitUnit } from '@/domain/catalogue/views/columns'
import type { Held } from './pictures'

/* ---------------------------------------------------------- */
/* Sentences                                                   */
/* ---------------------------------------------------------- */

/** Where every table is listed — the pill's own Data door. */
export const DATA_INDEX = '/data'

export const noTable = (id: string): string =>
  `Nothing on the price list is called “${id}”. Every part of it is listed on Data.`

export const NO_SHEET =
  'No price list is open on this computer yet. Load the Master Price File and it shows here.'

export const NO_WAY_TO_THE_FILE =
  'Nothing was opened here. The Master Price File is loaded at sign-in.'

/** The word at a cost column's head — the dealer's own figure, shown
 *  on the dealer's own sheet and never on anything a customer sees. */
export const COST_WORD = 'cost'

/** Said on a picture whose address the ledger holds no copy of. */
export const HELD_AS_A_LINK = 'a link only'

/**
 * THE PICTURES DOOR'S ONE REFUSAL, said once for the whole door, beside
 * the first list of names it is about. The critique counted 7 of
 * Roll-Up's 8 tiles as grey boxes each printing the same 22 words, 32 of
 * Highfield's 67 (built-critique-m2-close.md §9): the door that exists to
 * make the table visual was mostly one refusal, repeated. The reason is
 * the same for every name, so it is said once — with how many it is
 * about, and, where the file gives the maker's address, that there is no
 * copy on this computer — and every later list carries only its heading.
 *
 * `across` is the door when its names stand on more than one shelf
 * (Stacer's 22 series): then the sentence counts the door, not the
 * shelf it happens to stand beside.
 */
export function noPictureSentence(
  bare: number,
  linked: number,
  across?: { of: number; noun: LeafNoun },
): string {
  if (bare === 0) return ''
  const unheld = bare - linked
  if (across) {
    const lead = `${bare} of the ${countLabel(across.of, across.noun)} here ${bare === 1 ? 'has' : 'have'} no picture.`
    if (linked === 0) return `${lead} The price list has none for ${bare === 1 ? 'it' : 'them'}.`
    const which = linked === bare ? (bare === 1 ? 'it' : 'each') : `${linked} of them`
    const rest = unheld > 0 ? `; it has none for the other ${unheld}` : ''
    return `${lead} The price list gives the maker’s web address for ${which}, with no copy on this computer${rest}.`
  }
  const these = bare === 1 ? 'this one' : `these ${bare}`
  if (linked === 0) return `The price list has no picture for ${these}.`
  if (linked === bare)
    return `The price list gives the maker’s web address for ${bare === 1 ? 'this one' : `each of ${these}`}, with no copy on this computer.`
  return `The price list gives the maker’s web address for ${linked} of ${these}, with no copy on this computer; it has none for the other ${unheld}.`
}

/**
 * A door with no picture on it at all — Mackay's 125 trailers — is not a
 * wall of names under a Pictures heading: it says so once, in a sentence,
 * and offers the price list, which has every one of them.
 */
export function noPictureAtAll(
  of: number,
  linked: number,
  noun: LeafNoun,
): { say: string; why: string } {
  const say = `No picture of any of these ${countLabel(of, noun)} yet.`
  if (linked === 0) return { say, why: 'The price list has none.' }
  const which = linked === of ? 'each' : `${linked} of them`
  const rest = linked < of ? `; it has none for the other ${of - linked}` : ''
  return {
    say,
    why: `The price list gives the maker’s web address for ${which}, with no copy on this computer${rest}.`,
  }
}

/** A hand refuses sideways scroll and says where the rest is, naming the thing a person
 *  presses as a person names it: "Press a boat to see and change its Model Code, Trade,
 *  Warranty and the rest." */
export const handSentence = (hidden: readonly string[], noun: LeafNoun): string =>
  hidden.length === 0
    ? ''
    : `Press ${/^[aeiou]/i.test(noun.one) ? 'an' : 'a'} ${noun.one} to see and change its ${hidden.slice(0, 3).join(', ')} and the rest.`

export const PICTURE_CELL_REFUSAL = 'A picture cannot be typed in. Its details show it.'

/* ---------------------------------------------------------- */
/* Cells                                                       */
/* ---------------------------------------------------------- */

/** The text a cell PAINTS: money as money, a link by its name, a
 *  picture as nothing (it is drawn, not printed). */
export function paintOf(table: EntityDef, field: FieldDef, row: ViewRow): string {
  const value = row.values[field.id] ?? null
  if (field.type === 'image') return ''
  if (field.type === 'reference') return row.text[field.id] ?? ''
  const text = cellText(value, field)
  if (field.type === 'number') return cellPrintText(field, value, text)
  return formatCell(field, value, undefined, bandOf(table, field))
}

/**
 * WHAT ONE WRITE CHANGED, IN THE SHEET'S OWN WORDS — "Cash on HBR005:
 * $3,060 → $12,345". The step line after a write said only "Cell edit ·
 * Highfield Inflatables" (built-critique-m2-close-2.md minor 15), which
 * names the kind of act and the table and not which price moved from
 * what to what. Both figures are painted as the cell paints them; an
 * empty cell is said "nothing".
 */
export function changeSaid(
  table: EntityDef,
  field: FieldDef,
  rowName: string,
  before: ViewRow,
  after: CellValue,
): string {
  const was = paintOf(table, field, before)
  const now = paintOf(table, field, {
    ...before,
    values: { ...before.values, [field.id]: after },
    text: { ...before.text, [field.id]: cellText(after, field) },
  })
  const on = rowName.trim() === '' ? '' : ` on ${rowName.trim()}`
  return `${field.name}${on}: ${was === '' ? 'nothing' : was} → ${now === '' ? 'nothing' : now}`
}

/** The text an editor is SEEDED with: the stored figure, never the
 *  painted one, so a person who typed 41340 sees 41340. */
export function seedOf(field: FieldDef, row: ViewRow): string {
  if (field.type === 'reference') return row.text[field.id] ?? ''
  return cellText(row.values[field.id] ?? null, field)
}

export type PictureCell = { kind: 'held'; held: Held } | { kind: 'link'; address: string } | null

/** What a picture cell holds: the held copy, or the words "held as a
 *  link" for an address the ledger holds no copy of, or nothing for
 *  an empty cell. */
export function pictureOf(
  row: ViewRow,
  field: FieldDef,
  heldCopy: (address: string | undefined, rowId?: string) => Held | null,
): PictureCell {
  const v = row.values[field.id]
  if (v === undefined || v === null || !isImageValue(v)) return null
  const first = primaryImage(v)
  if (!first?.src) return null
  const held = heldCopy(first.src, row.rowId)
  return held ? { kind: 'held', held } : { kind: 'link', address: first.src }
}

export const isCost = (table: EntityDef, field: FieldDef): boolean => isCostColumn(table, field)

/* ---------------------------------------------------------- */
/* The price list's words                                      */
/* ---------------------------------------------------------- */

/** A fact said once, in the file's own column name: the name, the
 *  value, and the unit the column name carried — `Max Load 350 kg`,
 *  `Beam 1.37`, `Eng Configuration Tiller`. */
export function factText(table: EntityDef, field: FieldDef, text: string): string {
  const { base, unit } = splitUnit(field.name)
  const value =
    field.type === 'number' && text !== '' && Number.isFinite(Number(text))
      ? formatCell(field, Number(text), undefined, bandOf(table, field))
      : text
  /* a value that already names its column is said once: Highfield's
     "Boat Registration" column holds "Boat Registration Not Required",
     and the spine read "Boat Registration Boat Registration Not Required" */
  const lower = value.toLowerCase()
  const words = base.trim().toLowerCase().split(/\s+/)
  /* …and so is one that opens on the END of its column's name: Highfield's
     "Boat Rego Decals" holds "Rego Decals (Std) t/s Hypalon Tubes", and 556
     of its rows' spines and bands read "Boat Rego Decals Rego Decals (Std)…" */
  const named =
    lower.startsWith(base.trim().toLowerCase()) ||
    words.some((_, k) => {
      const tail = words.slice(k).join(' ')
      return k > 0 && (lower === tail || lower.startsWith(`${tail} `))
    })
  /* a degree and a percentage close up on their figure: "20°", not "20 °" */
  const gap = unit === '°' || unit === '%' ? '' : ' '
  /* A VALUE TYPED WITH ITS UNIT is not given it twice: Highfield's "Max HP"
     cell holds "250 HP", and the ADV7's spine read "Max 250 HP HP"
     (m2-last-critique.md minor 10) */
  const carries =
    unit !== undefined &&
    unit !== '' &&
    value.toLowerCase().endsWith(unit.toLowerCase()) &&
    /[\d\s]$/.test(value.slice(0, value.length - unit.length))
  const withUnit = unit && !carries ? `${value}${gap}${unit}` : value
  if (named) return withUnit
  if (unit) return `${base} ${withUnit}`
  /* A UNIT ON EVERY MEASURE the column or its maker states one for
     (`measured`, built-critique-m2-close-2.md): "Hull Length (Mtr)" 5.29
     is "Hull Length 5.29 m", and Highfield's "OA Length" 6.98 is "6.98 m"
     because Highfield's own page states it in metres */
  const said = measured(table.id, { label: field.name, value })
  return `${said.label} ${said.value}`
}

export interface FactLine {
  /** the section the facts are filed under, for its accent */
  sectionId: string
  accent: string | undefined
  text: string
  /** the same facts one by one, so a spine can lay them into its lines whole */
  facts: string[]
}

/** The unit a typed value ends in — `HP` of `4 HP` — and the value without it. */
const unit = (s: string): string => /\s(\S+)$/.exec(s)?.[1] ?? ''
const bare = (s: string): string => s.replace(/\s\S+$/, '')

/** A bare figure: `40`, `2.5`, `1,300` — nothing typed around it. */
const FIGURE_ONLY = /^\d[\d,]*(\.\d+)?$/

/** One figure where both ends say the same, else the two with a dash. */
const between = (a: string, b: string): string => (a === b ? a : `${a}–${b}`)

/** True when a pair's label is itself a unit — "HP" of "Min HP" / "Max HP" —
 *  read by the same unit list the column names are read by. */
const isUnitWord = (label: string): boolean =>
  label.trim() !== '' &&
  splitUnit(`x ${label.trim()}`).unit?.toLowerCase() === label.trim().toLowerCase()

/**
 * ONE RANGE, SAID WITH ITS UNIT ONCE AND AFTER ITS FIGURES. Where a pair's
 * label IS its unit ("Min HP" / "Max HP"), the unit is said the way a
 * person says it, after the figures — and never also before them:
 *
 * - bare figures, typed with or without the unit: Stacer's 40 and 60 are
 *   `40–60 HP` (the spine read "HP 40–60"), Highfield's "8 HP" and "10 HP"
 *   are `8–10 HP`, and a pair saying one figure is `90 HP`;
 * - a value that is more than a figure keeps its own unit, closed onto its
 *   figure by a space, and the label is not said again: Stabicraft's
 *   "2 x 150HP" / "2 x 200HP" is `2 x 150 HP–2 x 200 HP` (the spine read
 *   "HP 2 x 150HP–2 x 200HP", the unit three times), Surtees' "150 HP" /
 *   "TBA" is `150 HP–TBA`;
 * - neither value carries a figure with the unit: the label leads, `HP TBA`.
 *
 * Any other label leads its range as before: `Length 3.5–4 m`.
 */
export function rangeSaid(label: string, lo: string, hi: string): string {
  if (!isUnitWord(label)) {
    const same = unit(lo) !== '' && unit(lo) === unit(hi)
    return `${label} ${between(same ? bare(lo) : lo, same ? bare(hi) : hi)}${same ? ` ${unit(lo)}` : ''}`
  }
  const u = label.trim()
  const tail = new RegExp(`(\\d)\\s*${u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
  const carries = (v: string): boolean => tail.test(v)
  const strip = (v: string): string => (carries(v) ? v.replace(tail, '$1') : v)
  if (FIGURE_ONLY.test(strip(lo)) && FIGURE_ONLY.test(strip(hi)))
    return `${between(strip(lo), strip(hi))} ${u}`
  if (carries(lo) || carries(hi)) {
    const spaced = (v: string): string => v.replace(tail, `$1 ${u}`)
    return between(spaced(lo), spaced(hi))
  }
  return `${u} ${between(lo, hi)}`
}

/* ---------------------------------------------------------- */
/* A fact as a dealer says it                                  */
/* ---------------------------------------------------------- */

/*
 * THE BAND SAID THE FILE'S COLUMN HEADS (refine round, 2026-10-21): Roll-Up's band read
 * "every one Shaft Lgth S · Eng Configuration Tiller · Fuel Capacity External Tank · Air
 * Chambers 3", the workbook's header row read aloud. A dealer says "short shaft, tiller
 * steer, external tank, 3 air chambers". These are the facts a boat's price list shares
 * down a whole series, each said the way the trade says it — and ONLY where the words are
 * the file's own or proved by it; any other value keeps its column's name (`factText`).
 *
 *   shaft    the transom's shaft letter. The file's own fold, verified both ways
 *            (`wb:pairing-shaft-length-matches-transom`, F6 in
 *            src/domain/rules/constraints/workbookRules.ts): S = SS = 15″, L = LS = 20″,
 *            XL = 25″, UL = XXL = 30″, agreeing 234 of 234 with the shaft letter of the
 *            Yamaha model codes on the same file — F4SMHA is 15″, F4LMHA 20″, F70XB 25″,
 *            F225UCB 30″ — Yamaha's short, long, extra-long and ultra-long shafts, the
 *            words the trade says them in. "Sng UL / Twin XL" is one motor on an ultra-long
 *            shaft or two on extra-long (`Sng` is "Single" in the names ledger).
 *   steer    "Tiller" is the file's own "Tiller Steer" (Stacer's series and pairings write
 *            it), and "Remote" its "Remote Steering" (Parts & Accessories).
 *   tank     "External Tank" is said as written, in a sentence's case.
 *   chambers a count of air chambers is "3 air chambers".
 */
const SHAFT_WORD: Readonly<Record<string, string>> = {
  S: 'short',
  SS: 'short',
  L: 'long',
  LS: 'long',
  XL: 'extra-long',
  UL: 'ultra-long',
  XXL: 'ultra-long',
}

const STEER_WORD: Readonly<Record<string, string>> = {
  tiller: 'tiller steer',
  remote: 'remote steering',
}

const named = (field: FieldDef, pattern: RegExp): boolean =>
  pattern.test(field.name.replace(/\s+/g, ' ').trim())

/** A value of plain capitalised words, said in a sentence's case: "External Tank" is
 *  "external tank". A code, a figure or an acronym is left as the file writes it. */
const sentenceCase = (value: string): string | null =>
  /^([A-Z][a-z]+)( [A-Z][a-z]+)*$/.test(value) ? value.toLowerCase() : null

/**
 * One shared fact as the dealer says it, or null where the file gives no proof of the
 * words and the column's name has to stay beside the value.
 */
export function spokenFact(field: FieldDef, text: string): string | null {
  const value = text.replace(/\s+/g, ' ').trim()
  if (value === '') return null
  if (named(field, /^shaft (lgth|length)$/i)) {
    const one = SHAFT_WORD[value.toUpperCase()]
    if (one) return `${one} shaft`
    const pair = /^sng (\w+) (?:or|\/) twin (\w+)$/i.exec(value)
    const single = pair ? SHAFT_WORD[pair[1]!.toUpperCase()] : undefined
    const twin = pair ? SHAFT_WORD[pair[2]!.toUpperCase()] : undefined
    if (single && twin) return `${single} shaft for one motor, ${twin} for two`
    return null
  }
  if (named(field, /^eng(ine)? configuration$/i)) return STEER_WORD[value.toLowerCase()] ?? null
  if (named(field, /^fuel capacity$/i)) return sentenceCase(value)
  if (named(field, /^air chambers$/i) && /^\d+$/.test(value))
    return `${value} air ${value === '1' ? 'chamber' : 'chambers'}`
  return null
}

/**
 * THE SPINE'S LINES: every fact said once at this drawer, grouped by
 * the section the file files it under, one line per section, in the
 * file's own order. A `Min X` and a `Max X` of one pair are read as
 * one range (`HP 4` where both say 4 HP, `HP 8–10` where they do not).
 * A cost is never on a spine — the head says the ones the table
 * shares, and the record carries the rest under their own word — and
 * an empty value says nothing.
 */
export function factLines(table: EntityDef, facts: readonly Said[]): FactLine[] {
  const by = new Map(facts.map((s) => [s.fieldId, s.text]))
  const pairs = rangePairs(table, { alsoText: true })
  const paired = new Map<string, string>()
  const skip = new Set<string>()
  for (const p of pairs) {
    const lo = by.get(p.min.id)
    const hi = by.get(p.max.id)
    if (lo === undefined || hi === undefined || lo === '' || hi === '') continue
    /* a pair whose label IS its unit ("Min HP" / "Max HP") says the unit
       once, after its figures: `4 HP`, `8–10 HP`, `40–60 HP` (`rangeSaid`) */
    paired.set(p.min.id, rangeSaid(p.label, lo, hi))
    skip.add(p.max.id)
  }
  const sections = table.sections ?? []
  /* THE ORDER A SPINE SAYS THEM IN: the first section (what the thing
     is), then the sections the file itself marked with an accent (on a
     boat, the motor envelope), then the rest as the file lists them —
     so a spine with room for three lines says the length, the
     horsepower and the load before it says the hull's weight */
  const marked = sections.slice(1).filter((s) => s.accent !== undefined)
  const order = [
    ...sections.slice(0, 1).map((s) => s.id),
    ...marked.map((s) => s.id),
    ...sections
      .slice(1)
      .filter((s) => s.accent === undefined)
      .map((s) => s.id),
    '',
  ]
  const lines = new Map<string, string[]>()
  for (const f of table.fields) {
    const text = by.get(f.id)
    if (text === undefined || text === '' || skip.has(f.id)) continue
    if (f.type === 'image' || isCostColumn(table, f)) continue
    if (/^source$/i.test(f.name.trim()) || f.id.startsWith('__')) continue
    const key = f.sectionId && sections.some((s) => s.id === f.sectionId) ? f.sectionId : ''
    const list = lines.get(key) ?? []
    list.push(paired.get(f.id) ?? spokenFact(f, text) ?? factText(table, f, text))
    lines.set(key, list)
  }
  const out: FactLine[] = []
  for (const id of order) {
    const list = lines.get(id)
    if (!list || list.length === 0) continue
    out.push({
      sectionId: id,
      accent: sections.find((s) => s.id === id)?.accent,
      text: list.join(' · '),
      facts: list,
    })
  }
  return out
}

/** The spine's price: `PVC $2,770 · HYP $4,500–$5,320`, or one figure
 *  or range where the rows have no leading word. */
/** One figure a card prints: the leading word it is for ("PVC"), or '', and the figure. */
export interface CardFigure {
  lead: string
  figure: string
}

/** The lit rung's figures one by one: "$2,770", "$4,500–$5,320". */
export const figuresOf = (figures: readonly LeadFigure[]): CardFigure[] =>
  figures.map((f) => ({
    lead: f.lead,
    figure: f.lo === f.hi ? money(f.lo) : `${money(f.lo)}–${money(f.hi)}`,
  }))

export function figuresText(figures: readonly LeadFigure[]): string {
  return figures
    .map((f) => {
      const figure = f.lo === f.hi ? money(f.lo) : `${money(f.lo)}–${money(f.hi)}`
      return f.lead === '' ? figure : `${f.lead} ${figure}`
    })
    .join(' · ')
}

/** What a series band says once about every row under it. */
export function bandSays(table: EntityDef, facts: readonly Said[]): string {
  return factLines(table, facts)
    .map((l) => l.text)
    .join(' · ')
}

/**
 * WHAT A PICTURE SHOWS, SAID ONCE — or nothing, where it shows every one of them.
 *
 * Until 2026-10-21 every render said "The picture: WH · 2 of 4 variants" under it, eight
 * times down Roll-Up's spines and again on its eight cards: the count is the rows beside
 * it, and only the colourway is news. The honest fact stays — a picture of the white boat
 * never passes for the light grey one — said as the colourway alone, decoded where the
 * decode reads it ("Black / Grey / Black"), the dealer's own code where it does not ("WH").
 * A picture whose rows have no word to tell them apart keeps its count: "2 of 4 variants".
 */
export function pictureShows(
  depicts: readonly string[],
  count: number,
  of: number,
  noun: LeafNoun,
): string {
  if (count >= of) return ''
  const which = depicts
    .filter((d) => d !== '')
    .map((d) => {
      const colour = colourwayOf(d)
      return colour.read ? colour.say : d
    })
  return which.length > 0
    ? `shown in ${which.join(', ')}`
    : `showing ${count} of ${countLabel(of, noun)}`
}

/** The one colourway a picture shows, for a swatch beside its words — or null. */
export function shownColour(depicts: readonly string[]): Colourway | null {
  const words = depicts.filter((d) => d !== '')
  if (words.length !== 1) return null
  const colour = colourwayOf(words[0]!)
  return colour.read ? colour : null
}

/**
 * THE ONE THING EVERY PICTURE OF A SHELF SHOWS, said once at its head rather than under
 * each: Roll-Up's eight renders are each of its white boat. '' unless two or more
 * pictures say the same, non-empty thing.
 */
export function shownByAll(shows: readonly string[]): string {
  if (shows.length < 2) return ''
  const first = shows[0]!
  return first !== '' && shows.every((s) => s === first) ? first : ''
}

/** How many of a series' models have a picture, said once on its band — and, where every
 *  picture shows the same colourway, that too. */
export function picturesHeld(held: number, of: number, branch: LeafNoun, shown = ''): string {
  if (of === 0) return ''
  if (held === 0) return `no pictures of its ${branch.many} yet`
  return `pictures of ${held} of ${countLabel(of, branch)}${shown ? `, each ${shown}` : ''}`
}

/* ---------------------------------------------------------- */
/* Writes                                                      */
/* ---------------------------------------------------------- */

export interface Write {
  command: CatalogueCommand
  /** how many cells the step would touch */
  cells: number
  /** what could not be written, each with the engine's own reason */
  skipped: string[]
}

const NOTHING: Write = { command: batch([]), cells: 0, skipped: [] }

const cellsWord = (n: number): string => `${n} ${n === 1 ? 'cell' : 'cells'}`

/** Empty every filled cell in the range, as one step. */
export function clearWrite(
  tableId: string,
  tableName: string,
  rows: readonly ViewRow[],
  fields: readonly FieldDef[],
  range: Range,
): Write {
  const n = normalizeRange(range)
  const commands: CatalogueCommand[] = []
  for (let r = n.r0; r <= n.r1; r += 1) {
    const row = rows[r]
    if (!row) continue
    for (let c = n.c0; c <= n.c1; c += 1) {
      const f = fields[c]
      if (!f || f.type === 'formula') continue
      const v = row.values[f.id]
      if (v === undefined || v === null || v === '') continue
      commands.push(updateCell(tableId, row.rowId, f.id, null))
    }
  }
  if (commands.length === 0) return NOTHING
  return {
    command: batch(commands, { said: `Cleared ${cellsWord(commands.length)} in ${tableName}.` }),
    cells: commands.length,
    skipped: [],
  }
}

/** Write the top row of the range down every row under it, column by
 *  column — Excel's Ctrl D, as one step with one way back. */
export function fillDownWrite(
  table: EntityDef,
  rows: readonly ViewRow[],
  fields: readonly FieldDef[],
  range: Range,
): Write {
  const n = normalizeRange(range)
  const top = rows[n.r0]
  if (!top || n.r1 === n.r0) return NOTHING
  const commands: CatalogueCommand[] = []
  const skipped: string[] = []
  for (let c = n.c0; c <= n.c1; c += 1) {
    const f = fields[c]
    if (!f || f.type === 'formula') continue
    if (f.type === 'image') {
      skipped.push(PICTURE_CELL_REFUSAL)
      continue
    }
    const value = top.values[f.id] ?? null
    for (let r = n.r0 + 1; r <= n.r1; r += 1) {
      const row = rows[r]
      if (!row) continue
      commands.push(updateCell(table.id, row.rowId, f.id, value))
    }
  }
  if (commands.length === 0) return { ...NOTHING, skipped }
  const from = fields[n.c0] ? seedOf(fields[n.c0]!, top) : ''
  const said =
    n.c0 === n.c1
      ? `Filled ${cellsWord(commands.length)} down with “${from}” in ${table.name}.`
      : `Filled ${cellsWord(commands.length)} down from the top row in ${table.name}.`
  return { command: batch(commands, { said }), cells: commands.length, skipped }
}

/** Set one column to one value across the given rows, as one step —
 *  the act the mixed set offers. */
export function setAllWrite(
  table: EntityDef,
  rows: readonly ViewRow[],
  field: FieldDef,
  rowIndexes: readonly number[],
  text: string,
  refLabels?: Map<string, string>,
): Write {
  const coerced = coerceCellText(text, field, refLabels)
  if (!coerced.ok) return { ...NOTHING, skipped: [coerced.reason] }
  const commands: CatalogueCommand[] = []
  for (const r of rowIndexes) {
    const row = rows[r]
    if (row) commands.push(updateCell(table.id, row.rowId, field.id, coerced.value))
  }
  if (commands.length === 0) return NOTHING
  const shown = coerced.value === null ? 'nothing' : `“${cellText(coerced.value, field)}”`
  return {
    command: batch(commands, {
      said: `${field.name} set to ${shown} on ${countLabel(commands.length, leafNoun(table))} in ${table.name}.`,
    }),
    cells: commands.length,
    skipped: [],
  }
}

/**
 * Paste a block of text at the active cell: each cell read through
 * `coerceCellText`, a cell that does not fit its column left as it
 * was and its reason kept, columns past the last omitted, rows past
 * the last omitted and counted — the contract Grist prints and this
 * sheet says in its own sentence.
 */
export function pasteWrite(
  table: EntityDef,
  rows: readonly ViewRow[],
  fields: readonly FieldDef[],
  at: { row: number; col: number },
  block: readonly (readonly string[])[],
  refLabelsOf: (field: FieldDef) => Map<string, string> | undefined,
): Write & { said: string } {
  const commands: CatalogueCommand[] = []
  const skipped: string[] = []
  let past = 0
  let beyond = 0
  block.forEach((line, i) => {
    const row = rows[at.row + i]
    if (!row) {
      past += 1
      return
    }
    line.forEach((text, j) => {
      const f = fields[at.col + j]
      if (!f) {
        beyond += 1
        return
      }
      if (f.type === 'formula' || f.type === 'image') {
        skipped.push(
          f.type === 'image' ? PICTURE_CELL_REFUSAL : `${f.name} is worked out from other columns.`,
        )
        return
      }
      const coerced = coerceCellText(text, f, refLabelsOf(f))
      if (!coerced.ok) {
        skipped.push(coerced.reason)
        return
      }
      commands.push(updateCell(table.id, row.rowId, f.id, coerced.value))
    })
  })
  const notes: string[] = []
  if (past > 0)
    notes.push(
      `${past} ${past === 1 ? 'row' : 'rows'} past the end of the table ${past === 1 ? 'was' : 'were'} not pasted`,
    )
  if (beyond > 0)
    notes.push(
      `${cellsWord(beyond)} past the last column ${beyond === 1 ? 'was' : 'were'} left out`,
    )
  if (skipped.length > 0)
    notes.push(
      `${cellsWord(skipped.length)} did not fit ${skipped.length === 1 ? 'its' : 'their'} column and ${skipped.length === 1 ? 'was' : 'were'} left as ${skipped.length === 1 ? 'it was' : 'they were'}`,
    )
  const tail = notes.length === 0 ? '' : ` ${notes.join('; ')}.`
  const said = `Pasted ${cellsWord(commands.length)} into ${table.name}.${tail}`
  if (commands.length === 0) return { ...NOTHING, skipped, said }
  return { command: batch(commands, { said }), cells: commands.length, skipped, said }
}

/* ---------------------------------------------------------- */
/* The mixed set                                               */
/* ---------------------------------------------------------- */

export interface MixedValue {
  text: string
  count: number
}

/** The distinct values one column holds across the given rows, most
 *  held first — Figma's "Selection colors", which lists each fill once
 *  with a count before anything is written. An empty cell is listed as
 *  its own value, because "3 of them are blank" is a fact a fill has
 *  to say before it fills. */
export function mixedSet(
  rows: readonly ViewRow[],
  field: FieldDef,
  rowIndexes: readonly number[],
): MixedValue[] {
  const counts = new Map<string, number>()
  for (const r of rowIndexes) {
    const row = rows[r]
    if (!row) continue
    const text = seedOf(field, row)
    counts.set(text, (counts.get(text) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([text, count]) => ({ text, count }))
    .toSorted((a, b) => b.count - a.count || a.text.localeCompare(b.text))
}

/* ---------------------------------------------------------- */
/* The Pictures door                                           */
/* ---------------------------------------------------------- */

export interface Card {
  key: string
  /** the model's name, or the row's own on a table whose rows are the models */
  name: string
  /** where this card sits: its series, or '' */
  under: string
  /** "4 variants" — or nothing, on a card that is one row */
  count: string
  picture: Held | null
  /** what the picture shows where it is not every one of them — "WH", "Black / Grey /
   *  Black" (`pictureShows`) — or '' */
  caption: string
  /** the one colourway it shows, for a swatch beside the caption */
  colour: Colourway | null
  /** true when the file carries an address this browser holds no copy of */
  linkedOnly: boolean
  /** the lit rung's figures, per leading word where there is one */
  price: string
  /** the same figures one by one, so a card can set the word apart from the figure */
  figures: CardFigure[]
  /** the row a press opens on: the one the picture depicts, or the first */
  rowId: string
  /** on a pairing, the label of the row the price file recommends */
  recommended: string | null
}

/** A `RowData` shape for `rowLabel`, which reads values only. */
export const asRow = (table: EntityDef, row: ViewRow): RowData => ({
  id: row.rowId,
  orgId: table.orgId,
  entityId: table.id,
  values: row.values as Record<string, CellValue>,
  createdAt: '',
  updatedAt: '',
})

/** On a pairing, the label of the row the price file recommends. */
export function recommendedOf(
  table: EntityDef,
  rows: readonly ViewRow[],
  refLabel: (refEntityId: string | undefined, rowId: string) => string | undefined,
): string | null {
  const second =
    table.role === 'join' ? table.fields.filter((f) => f.type === 'reference')[1] : undefined
  if (!second) return null
  const starred = rows.find((r) => r.values[PAIR_RECOMMENDED_FIELD] === true)
  const id = starred?.values[second.id]
  return typeof id === 'string' ? (refLabel(second.refEntityId, id) ?? null) : null
}

/** A row's own name, for a card that is one row. */
export const nameOfRow = (table: EntityDef, row: ViewRow): string =>
  rowLabel(table, asRow(table, row))
