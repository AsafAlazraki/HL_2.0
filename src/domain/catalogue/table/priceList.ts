/* ============================================================
   THE PRICE LIST — what the sheet derives to be laid out like the
   maker's own price list rather than like a database
   (docs/directions/sheet-redesign/a-the-price-list.html, picked by
   three judges on 2026-09-23 with two changes each asked for).

   Each innermost drawer — a model on Highfield, a series on Stacer, a
   category on Parts, a hull on a pairing — is one BLOCK. Its SPINE is
   a head down the block's left edge that says once what the block's
   rows share (`saidOnce.ts`) and carries the model's held render; the
   ROWS say only what differs. Nothing here draws; the screen does.

   WHAT IS HERE, each pure and each measured on the pack in
   `priceList.test.ts`:

     leadSplit        a leading word that files a model's rows twice
                      over — PVC and HYP on Highfield's Variant — so
                      the rows can be GROUPED by it beneath the spine
                      as a level of the engine's own grouping, which
                      is judge two's change: "every PVC variant first,
                      then every HYP, with the material said once at
                      the head of its group". Done as a level of
                      `buildGroups`, not a sort, so navigation, paste
                      and fill follow the order on screen and every
                      row stays an editable row.
     readingColumns   which columns a dealer reads first, chosen by
                      what they ARE rather than by the file's order:
                      the name, the code he orders by, the price
                      ladder, then what else varies. Everything else is
                      one press away and listed with where it went.
     leadFigures      the price on the spine per leading word at the
                      lit rung — "PVC $41,340 · HYP $48,350" — with a
                      range only where the rest of the variant changes
                      the figure (judge two's graft from board B).
     spineFit         how much a spine can say inside the rows it
                      spans, which is judge three's change: a spine is
                      never taller than its block. It carries the
                      render only when the block is tall enough to draw
                      one worth drawing; it drops to fewer lines, and
                      then to the name alone, as the block shortens.
     packFacts        what the spine's lines say inside the width and
                      the lines it has: every fact whole, a section run
                      on under its accent, each section's first line
                      before any second, and what is left counted —
                      never an ellipsis through a fact.
     packOneLine      the same, on one line: a shut model and a hand.
     piecesOf         the engine's drawn lines cut into bands, blocks
                      and runs, keeping the engine's own leaf indices.
     chaptersOf       the outermost level as chapters, when it is a
                      handful — Highfield's seven series.
     blockPicture     the held render a block can carry, and which of
                      its rows it depicts.

   Pure: no React, no DOM, no store.
   ============================================================ */
import { isImageValue, primaryImage, type EntityDef, type FieldDef } from '@/domain/model'
import { looksMonetary } from '@/domain/quote/pricing'
import type { ViewRow } from '@/domain/catalogue/table/core'
import type { GridLine, GroupNode } from './grouping'
import type { SaidOnce } from './saidOnce'

/* ---------------------------------------------------------- */
/* The leading word                                            */
/* ---------------------------------------------------------- */

/**
 * A LEADING WORD THAT FILES ROWS TWICE OVER.
 *
 * Highfield types a variant as `PVC WH`, `HYP B-B-B`: the tube's
 * material, then the colourway. Two words lead 556 of its 588
 * variants; the other 32 are typed differently (`Open (PVC) O-G-DG`,
 * `540 ST (PVC) LG-W-DG`) and still name one of the two inside them.
 * So the words are found by counting, never by knowing about boats:
 *
 *   · a word is COMMON when it leads at least a tenth of the rows;
 *   · a column SPLITS when two to four words are common and between
 *     them they appear, as whole words, in at least four rows in five.
 *
 * A column led by one word everywhere (`Stacer - 309 Skimma`) says
 * that word once instead, which is `saidOnce`'s job; a column led by
 * dozens of words (Parts' products) has no second level in it.
 */
export interface LeadSplit {
  fieldId: string
  /** the common leading words, in first-appearance order */
  words: string[]
}

const WORD = /\S+/

export function leadSplit(
  /** the rows of each innermost drawer — a model's variants */
  blocks: readonly (readonly ViewRow[])[],
  fieldId: string | undefined,
  textOf: (row: ViewRow, id: string) => string = (r, id) => r.text[id] ?? '',
): LeadSplit | null {
  const rows = blocks.flat()
  if (!fieldId || rows.length < 4) return null
  const leads = new Map<string, number>()
  for (const row of rows) {
    const text = textOf(row, fieldId).trim()
    const rest = text.replace(WORD, '').trim()
    if (rest === '') continue
    const lead = WORD.exec(text)?.[0] ?? ''
    if (lead !== '') leads.set(lead, (leads.get(lead) ?? 0) + 1)
  }
  const floor = Math.max(2, Math.ceil(rows.length / 10))
  const words = [...leads.entries()].filter(([, n]) => n >= floor).map(([w]) => w)
  if (words.length < 2 || words.length > 4) return null
  const split: LeadSplit = { fieldId, words }
  let named = 0
  for (const row of rows) if (leadOf(split, textOf(row, fieldId)) !== '') named += 1
  if (named * 5 < rows.length * 4) return null
  /* AND IT FILES A MODEL TWICE OVER: in at least half the drawers of two
     rows or more, two of the words stand side by side. Jeanneau's names
     lead with Jeanneau, Merry and Cap, but each series holds one line of
     boats, so those words name the series again rather than splitting it.
     And a level is a pattern that REPEATS: three drawers at least, so the
     obsolete trailers' one series of two makers is not read as a level */
  const plural = blocks.filter((b) => b.length >= 2)
  const twice = plural.filter(
    (b) =>
      new Set(b.map((r) => leadOf(split, textOf(r, fieldId))).filter((w) => w !== '')).size >= 2,
  )
  return twice.length >= 3 && twice.length * 2 >= plural.length ? split : null
}

const escape = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** The common word this text names, first in reading order — `HYP`
 *  from `HYP B-B-B` and from `Open (HYP) O-G-DG` — or '' for none. */
export function leadOf(split: LeadSplit, text: string): string {
  let best = ''
  let at = Number.POSITIVE_INFINITY
  for (const w of split.words) {
    const m = new RegExp(`(^|[\\s(])${escape(w)}(?=$|[\\s)])`).exec(text)
    if (m && m.index < at) {
      at = m.index
      best = w
    }
  }
  return best
}

/** What is left once the leading word is said at the head of its
 *  group: `B-B-B` from `HYP B-B-B`. A value the word does not LEAD is
 *  printed as it was typed, because cutting a word out of the middle
 *  of `Open (HYP) O-G-DG` would print a variant nobody typed. */
export function restOf(split: LeadSplit, text: string): string {
  const t = text.trim()
  for (const w of split.words) {
    if (t.startsWith(`${w} `)) return t.slice(w.length + 1).trim()
  }
  return t
}

/** The id the grouping engine files a leading word under. It is a
 *  level of `buildGroups` that no column carries — the text is read
 *  through the caller's `textOf`, so the engine's tree, its drawn
 *  order and its addressable rows all follow it without learning that
 *  it is not a column. */
export const leadLevelOf = (fieldId: string): string => `${fieldId}\u001Elead`

export const isLeadLevel = (id: string): boolean => id.endsWith('\u001Elead')

/* ---------------------------------------------------------- */
/* The columns a dealer reads                                  */
/* ---------------------------------------------------------- */

export type ColumnJob = 'name' | 'code' | 'price' | 'mark' | 'varies'

export interface ReadingColumn {
  field: FieldDef
  job: ColumnJob
}

export type Elsewhere = 'head' | 'spine' | 'empty' | 'cost' | 'picture' | 'name' | 'other'

export interface HeldColumn {
  field: FieldDef
  /** where this column's words already are, so the menu can say so */
  where: Elsewhere
}

export interface ReadingInput {
  table: EntityDef
  /** the columns the grid could address: every column but the drawers */
  leafFields: readonly FieldDef[]
  rows: readonly ViewRow[]
  said: SaidOnce
  /** the outline's levels — the spine is the last */
  levels: readonly string[]
  /** the price ladder, first rung first — `priceLevelsFor`, or the one
   *  price `priceReadOf` finds on a table that declares none */
  prices: readonly { fieldId: string; label: string }[]
  isCost: (field: FieldDef) => boolean
  /** columns a person pressed into the grid, in the order pressed */
  shown?: readonly string[]
}

export interface Reading {
  /** the grid's columns, in the order they are drawn */
  columns: ReadingColumn[]
  /** what else varies and says something a dealer reads — a Stacer's
   *  length and horsepower, a trailer's size — drawn after the columns
   *  while the width allows, in the file's order; what does not fit is
   *  held with the rest */
  extras: FieldDef[]
  /** the rest, each one press away, with where its words are now */
  held: HeldColumn[]
}

/** A column the packer wrote to say where a row was read from. */
const isProvenance = (f: FieldDef): boolean => /^source$/i.test(f.name.trim())
/** The pack's bookkeeping columns — `__order`, `__origin`. `__recommended`
 *  and `__discontinued` are the dealer's own words and stay. */
const isBookkeeping = (f: FieldDef): boolean => f.id.startsWith('__') && f.type !== 'boolean'

const words = (s: string): string[] =>
  s
    .toLowerCase()
    .replace(/[()·,]/g, ' ')
    .split(/\s+/)
    .filter((w) => w !== '' && w !== '-' && w !== '×')

/**
 * THE DISPLAY COLUMN SAYS NOTHING NEW when every word of the spine's
 * name and of the row's own name already stands in it:
 * `Highfield - RU230KAM (PVC) WH` is the model and the variant, and a
 * pairing's `Label` is its two ends. Measured on nineteen rows in
 * twenty, so one hand-typed label does not put the column back.
 */
function displayRepeats(
  display: FieldDef,
  parts: readonly string[],
  rows: readonly ViewRow[],
): boolean {
  if (parts.length === 0 || rows.length === 0) return false
  let repeats = 0
  for (const row of rows) {
    const shown = new Set(words(row.text[display.id] ?? ''))
    const all = parts.every((id) => words(row.text[id] ?? '').every((w) => shown.has(w)))
    if (all) repeats += 1
  }
  return repeats * 20 >= rows.length * 19
}

/** A code a dealer orders by: short, one per row, and typed on most rows. */
function isCode(f: FieldDef, rows: readonly ViewRow[]): boolean {
  if (f.type !== 'text' || rows.length < 2) return false
  const filled = rows.map((r) => (r.text[f.id] ?? '').trim()).filter((t) => t !== '')
  if (filled.length * 2 < rows.length) return false
  const distinct = new Set(filled).size
  if (distinct * 10 < filled.length * 9) return false
  const lengths = filled.map((t) => t.length).toSorted((a, b) => a - b)
  return lengths[Math.floor(lengths.length / 2)]! <= 16
}

export function readingColumns(input: ReadingInput): Reading {
  const { table, leafFields, rows, said, levels, prices, isCost, shown = [] } = input
  const spineId = levels[levels.length - 1]
  const leafLevel =
    table.hierarchy && table.hierarchy.length > 0
      ? table.hierarchy[table.hierarchy.length - 1]
      : undefined
  const display = table.displayFieldId
    ? leafFields.find((f) => f.id === table.displayFieldId)
    : undefined
  const tableSaid = new Set(said.table.map((s) => s.fieldId))
  const empty = new Set(said.empty)

  const taken = new Set<string>()
  const columns: ReadingColumn[] = []
  const take = (field: FieldDef | undefined, job: ColumnJob): void => {
    if (!field || taken.has(field.id)) return
    taken.add(field.id)
    columns.push({ field, job })
  }

  /* 1. THE NAME. The row's own level where the table has one; on a
     pairing, the link that is not the spine; on a flat table, the
     display column. */
  const links = leafFields.filter((f) => f.type === 'reference' && f.id !== spineId)
  const nameField =
    (leafLevel ? leafFields.find((f) => f.id === leafLevel) : undefined) ??
    (table.role === 'join' ? links[0] : undefined) ??
    display ??
    leafFields.find((f) => f.type === 'text')
  take(nameField, 'name')

  /* the display column, unless it only repeats the spine and the name */
  const parts = [spineId, nameField?.id].filter((x): x is string => x !== undefined)
  const displaySaysNothing =
    display !== undefined && display.id !== nameField?.id && displayRepeats(display, parts, rows)

  /* 2. THE CODE HE ORDERS BY — a column named for a code first */
  const codes = leafFields.filter(
    (f) =>
      !taken.has(f.id) &&
      f.id !== display?.id &&
      !isProvenance(f) &&
      !isCost(f) &&
      !said.settled.has(f.id) &&
      isCode(f, rows),
  )
  take(codes.find((f) => /code|part|sku|\bno\b/i.test(f.name)) ?? codes[0], 'code')

  /* 3. THE PRICE LADDER, in the order the table declares it */
  for (const level of prices) {
    const f = leafFields.find((x) => x.id === level.fieldId)
    if (f && !isCost(f) && !tableSaid.has(f.id)) take(f, 'price')
  }

  /* 4. A MARK THAT VARIES — recommended, discontinued — a yes or no a
     dealer reads down the rows */
  for (const f of leafFields) {
    if (f.type === 'boolean' && !said.settled.has(f.id) && !empty.has(f.id)) take(f, 'mark')
  }

  /* 5. WHAT A PERSON PRESSED INTO THE GRID, in the order they pressed */
  for (const id of shown)
    take(
      leafFields.find((f) => f.id === id),
      'varies',
    )

  /* 6. WHAT ELSE VARIES, AND IS NOT MONEY. A Stacer series is five
     different hulls, so each row's length and horsepower are the row's
     own; on Highfield the same facts are the model's and live on its
     spine. Anything that reads as money and is not on the ladder —
     RRP, a nett figure, a dealer price — stays one press away, because
     a figure beside the ladder that is not the ladder is the one a
     dealer quotes by mistake. */
  const extras = leafFields.filter(
    (f) =>
      !taken.has(f.id) &&
      f.type !== 'image' &&
      !isCost(f) &&
      !looksMonetary(f.name) &&
      !isProvenance(f) &&
      !isBookkeeping(f) &&
      !said.mostly.has(f.id) &&
      !empty.has(f.id) &&
      !tableSaid.has(f.id) &&
      !(f.id === display?.id && displaySaysNothing),
  )
  const extra = new Set(extras.map((f) => f.id))

  const held: HeldColumn[] = []
  for (const f of leafFields) {
    if (taken.has(f.id) || extra.has(f.id)) continue
    const where: Elsewhere =
      f.type === 'image'
        ? 'picture'
        : empty.has(f.id)
          ? 'empty'
          : tableSaid.has(f.id)
            ? 'head'
            : isCost(f)
              ? 'cost'
              : said.mostly.has(f.id)
                ? 'spine'
                : f.id === display?.id && displaySaysNothing
                  ? 'name'
                  : 'other'
    held.push({ field: f, where })
  }
  return { columns, extras, held }
}

/* ---------------------------------------------------------- */
/* The figure on the spine                                     */
/* ---------------------------------------------------------- */

export interface LeadFigure {
  /** the leading word, or '' on a block with none */
  lead: string
  lo: number
  hi: number
}

/** The lit rung's figure for each leading word in a block — one
 *  figure where the rest of the variant does not change it, a range
 *  where it does. Rows with no number in the column are left out, and
 *  a word none of whose rows carry one is not said at all. */
export function leadFigures(
  rows: readonly ViewRow[],
  priceFieldId: string,
  split: LeadSplit | null,
  textOf: (row: ViewRow, id: string) => string = (r, id) => r.text[id] ?? '',
): LeadFigure[] {
  const by = new Map<string, LeadFigure>()
  for (const row of rows) {
    const v = row.values[priceFieldId]
    if (typeof v !== 'number' || !Number.isFinite(v)) continue
    const lead = split ? leadOf(split, textOf(row, split.fieldId)) : ''
    const was = by.get(lead)
    if (was) {
      was.lo = Math.min(was.lo, v)
      was.hi = Math.max(was.hi, v)
    } else by.set(lead, { lead, lo: v, hi: v })
  }
  return [...by.values()]
}

/* ---------------------------------------------------------- */
/* How much a spine can say                                    */
/* ---------------------------------------------------------- */

/** The spine's own measures, in px — the screen's type, read once. */
export interface SpineMeasure {
  /** the block's padding, top and bottom together */
  pad: number
  /** the model's name */
  nameH: number
  /** one line of words under it */
  lineH: number
  /** the smallest render worth drawing: below this a hull is a smudge */
  pictureMinH: number
  /** the largest the render is ever drawn — never enlarged past its copy */
  pictureMaxH: number
}

export interface SpineFit {
  /** 'name' — the name alone; 'words' — the name and lines; 'full' — and the render */
  fit: 'name' | 'words' | 'full'
  /** lines of words under the name */
  lines: number
  /** the render's drawn height, 0 when it goes to the record */
  pictureH: number
}

/**
 * A SPINE IS NEVER TALLER THAN ITS ROWS. Judge three measured the
 * board's fixed 420 px spine against Highfield × Yamaha, where 75
 * hulls carry one motor and 102 carry two, and against the trailer
 * pairing, where all 146 carry one: a head carrying a name, three
 * lines and a 92 px render cannot stand beside a 28 px block without
 * making the block taller, which breaks the density the board claims.
 * So the block's height is given and the spine fits inside it: the
 * render when there is room for one worth drawing, then as many lines
 * as fit, then the name alone. What a spine cannot carry is on the
 * record, which always has room.
 */
export function spineFit(
  rowCount: number,
  rowH: number,
  holdsPicture: boolean,
  m: SpineMeasure,
): SpineFit {
  const room = Math.max(0, rowCount * rowH - m.pad)
  const lines = Math.max(0, Math.floor((room - m.nameH) / m.lineH))
  const pictureH = holdsPicture && room >= m.pictureMinH ? Math.min(room, m.pictureMaxH) : 0
  if (lines === 0) return { fit: 'name', lines: 0, pictureH: 0 }
  return { fit: pictureH > 0 ? 'full' : 'words', lines, pictureH }
}

/* ---------------------------------------------------------- */
/* What a spine says, packed whole                             */
/* ---------------------------------------------------------- */

/** One section of what a block's rows share: its facts, in the file's order. */
export interface FactRun {
  key: string
  accent?: string
  facts: readonly string[]
}

/** A section's facts as drawn on one line: after its accent, or run on from the line above. */
export interface PackedRun {
  key: string
  accent?: string
  /** the section's first facts, which carry its accent; false where it runs on from the line above */
  lead: boolean
  text: string
}

/** One drawn line of a spine: one section's facts, or several sections' side by side. */
export interface PackedLine {
  key: string
  runs: PackedRun[]
  /** said after the last line's facts when some were left for the record — "+3 more" */
  more?: string
}

export interface Packed {
  lines: PackedLine[]
  /** facts said whole */
  said: number
  /** facts there was no room for, which the record carries */
  left: number
}

export interface PackedOneLine {
  runs: PackedRun[]
  more?: string
  said: number
  left: number
}

export interface PackOptions {
  /** the room for one line's words, px */
  width: number
  /** the drawn width of some words in the face they are drawn in, px */
  measure: (text: string) => number
  /** what follows the last fact when facts were left: `(n) => '+n more'` */
  more?: (left: number) => string
  /** what stands between two facts on a line */
  joiner?: string
}

export interface FlowOptions extends PackOptions {
  /** what a line's first section costs before its words: its accent square and the air after it, px */
  indent: number
  /** what a later section on the same line costs before its words: the air before it and its square, px */
  markW: number
}

const JOINER = ' · '

/** A fact, or a piece of one too long for a line, broken at a space. */
interface Bit {
  /** the fact's index across every run */
  fact: number
  text: string
  /** a later piece of a broken fact, joined by a space rather than the joiner */
  cont: boolean
}

const lineText = (bits: readonly Bit[], joiner: string): string =>
  bits.map((b, i) => (i === 0 ? b.text : `${b.cont ? ' ' : joiner}${b.text}`)).join('')

/** A fact wider than the line is broken at its spaces — never inside a word. */
function bitsOf(fact: string, index: number, width: number, measure: (s: string) => number): Bit[] {
  if (measure(fact) <= width) return [{ fact: index, text: fact, cont: false }]
  const out: Bit[] = []
  let at = ''
  for (const word of fact.split(' ')) {
    const next = at === '' ? word : `${at} ${word}`
    if (at !== '' && measure(next) > width) {
      out.push({ fact: index, text: at, cont: out.length > 0 })
      at = word
    } else at = next
  }
  if (at !== '') out.push({ fact: index, text: at, cont: out.length > 0 })
  return out
}

/** A section's bits on one line. */
interface Seg {
  section: number
  lead: boolean
  bits: Bit[]
}

/**
 * Lay every section's facts into lines of `width`. FLOWING, a section
 * starts on the line the one before it ended on when its first fact fits
 * there; STACKED, every section starts a line of its own. Either way a
 * section too long for its line runs on to the next, unmarked, and a
 * fact is never split except at a space when it is wider than a line.
 */
function layOut(
  runs: readonly FactRun[],
  flowing: boolean,
  { width, measure, joiner = JOINER, indent, markW }: FlowOptions,
): Seg[][] {
  const cost = (line: readonly Seg[]): number =>
    line.reduce(
      (w, seg, i) => w + (i === 0 ? indent : markW) + measure(lineText(seg.bits, joiner)),
      0,
    )
  const lines: Seg[][] = []
  let index = 0
  runs.forEach((run, section) => {
    let seg: Seg | null = null
    for (const fact of run.facts) {
      for (const bit of bitsOf(fact, index, width - indent, measure)) {
        const line = lines[lines.length - 1]
        if (seg === null) {
          const opening: Seg = { section, lead: true, bits: [bit] }
          if (flowing && line && cost([...line, opening]) <= width) line.push(opening)
          else lines.push([opening])
          seg = opening
        } else if (
          line &&
          cost([...line.slice(0, -1), { ...seg, bits: [...seg.bits, bit] }]) <= width
        ) {
          seg.bits.push(bit)
        } else {
          seg = { section, lead: false, bits: [bit] }
          lines.push([seg])
        }
      }
      index += 1
    }
  })
  return lines
}

/** Take off, whole, every fact that is not wholly on the lines kept. */
function wholeOnly(kept: Seg[][], all: readonly Seg[][]): Seg[][] {
  const where = new Map<number, number>()
  all.forEach((line, k) => line.forEach((s) => s.bits.forEach((b) => where.set(b.fact, k))))
  const inside = (fact: number): boolean => (where.get(fact) ?? Infinity) < kept.length
  return kept
    .map((line) =>
      line
        .map((s) => ({ ...s, bits: s.bits.filter((b) => inside(b.fact)) }))
        .filter((s) => s.bits.length > 0),
    )
    .filter((line) => line.length > 0)
}

const factsOn = (lines: readonly Seg[][]): Set<number> =>
  new Set(lines.flatMap((l) => l.flatMap((s) => s.bits.map((b) => b.fact))))
const sectionsOn = (lines: readonly Seg[][]): number =>
  new Set(lines.flatMap((l) => l.map((s) => s.section))).size

/**
 * THE SPINE SAYS EVERY FACT WHOLE, OR NOT AT ALL. The critique measured
 * 6 of 18 spine lines cut with an ellipsis at 1440 — `OA Length 2.3 ·
 * Beam 1.37 · Tube Di…` — on a spine that exists to say what a model's
 * variants share (built-critique-m2-close.md §10), and at 1920 a spine
 * with width to spare still cutting. So the facts are laid into the
 * width the spine has, whole, in the file's order: a section starts on
 * the line the last one ended on when there is room for it there, each
 * after its own accent, and runs on to the next line when it is long.
 * When the block has fewer lines than that needs, the same facts are
 * also laid out a section to a line with EVERY SECTION'S FIRST LINE
 * BEFORE ANY SECTION'S SECOND — and whichever of the two says more
 * sections, then more facts, is drawn. What is left is counted after
 * the last fact, and the last line gives up a fact to make room for
 * the count, so nothing is ever cut into.
 */
export function packFacts(runs: readonly FactRun[], room: number, options: FlowOptions): Packed {
  const { width, measure, more, joiner = JOINER, indent, markW } = options
  const total = runs.reduce((n, r) => n + r.facts.length, 0)
  const lines = Math.max(0, room)

  const flowed = layOut(runs, true, options)
  const flow = wholeOnly(flowed.slice(0, lines), flowed)

  /* a section to a line, breadth first: a first line each, then the rest */
  const stacked = layOut(runs, false, options)
  const bySection = runs.map((_, s) => stacked.filter((l) => l[0]!.section === s))
  const take = bySection.map(() => 0)
  let free = lines
  bySection.forEach((ls, s) => {
    if (free > 0 && ls.length > 0) {
      take[s] = 1
      free -= 1
    }
  })
  bySection.forEach((ls, s) => {
    const add = Math.min(ls.length - take[s]!, free)
    take[s]! += add
    free -= add
  })
  const keptStacked = stacked.filter((line) => {
    const s = line[0]!.section
    return bySection[s]!.indexOf(line) < take[s]!
  })
  /* a fact is whole on the stack when every piece of it made the cut */
  const cut = new Set<number>()
  stacked.forEach((line) => {
    if (!keptStacked.includes(line)) line.forEach((seg) => seg.bits.forEach((b) => cut.add(b.fact)))
  })
  const stack = keptStacked
    .map((line) =>
      line
        .map((seg) => ({ ...seg, bits: seg.bits.filter((b) => !cut.has(b.fact)) }))
        .filter((seg) => seg.bits.length > 0),
    )
    .filter((line) => line.length > 0)

  const better =
    sectionsOn(stack) > sectionsOn(flow) ||
    (sectionsOn(stack) === sectionsOn(flow) && factsOn(stack).size > factsOn(flow).size)
  let drawn = better ? stack : flow

  const cost = (line: readonly Seg[]): number =>
    line.reduce(
      (w, seg, i) => w + (i === 0 ? indent : markW) + measure(lineText(seg.bits, joiner)),
      0,
    )
  let said = factsOn(drawn).size
  let note = more && said < total ? more(total - said) : undefined
  /* the count stands after the last fact, so the last line gives up facts until it fits */
  while (note !== undefined && drawn.length > 0) {
    const last = drawn[drawn.length - 1]!
    if (cost(last) + measure(`${joiner}${note}`) <= width) break
    const lastSeg = last[last.length - 1]!
    const fact = lastSeg.bits[lastSeg.bits.length - 1]!.fact
    drawn = drawn
      .map((line) =>
        line
          .map((seg) => ({ ...seg, bits: seg.bits.filter((b) => b.fact !== fact) }))
          .filter((seg) => seg.bits.length > 0),
      )
      .filter((line) => line.length > 0)
    said = factsOn(drawn).size
    note = more!(total - said)
  }

  const out: PackedLine[] = drawn.map((line, k) => ({
    key: String(k),
    runs: line.map((seg) => {
      const run = runs[seg.section]!
      return {
        key: `${run.key}:${k}`,
        ...(run.accent !== undefined ? { accent: run.accent } : {}),
        lead: seg.lead,
        text: lineText(seg.bits, joiner),
      }
    }),
  }))
  if (note !== undefined && lines > 0) {
    if (out.length > 0) out[out.length - 1]!.more = note
    else out.push({ key: 'more', runs: [], more: note })
  }
  return { lines: out, said, left: total - said }
}

/**
 * ONE LINE, EVERY SECTION ON IT — a shut model's line and a hand's head.
 * Each section starts with its accent (`markW` px wide, the gap before
 * it included) and says its facts whole and in the file's order. The
 * sections take their facts in turn — every section's first, then every
 * section's second — so a line too short for all of them still says a
 * little of each, the way the open spine gives each its first line; a
 * section stops at its first fact that will not fit. What is left is
 * counted after the last fact, and the facts taken last give way first
 * to make room for the count.
 */
export function packOneLine(
  runs: readonly FactRun[],
  { width, measure, more, joiner = JOINER, markW }: PackOptions & { markW: number },
): PackedOneLine {
  const total = runs.reduce((n, r) => n + r.facts.length, 0)
  const cost = (taken: readonly (readonly string[])[], note?: string): number => {
    let w = 0
    taken.forEach((facts) => {
      if (facts.length > 0) w += markW + measure(facts.join(joiner))
    })
    return note === undefined ? w : w + measure(`${joiner}${note}`)
  }
  const taken: string[][] = runs.map(() => [])
  const order: number[] = []
  const open = runs.map((r) => r.facts.length > 0)
  for (let turn = 0; open.some(Boolean); turn += 1) {
    runs.forEach((run, i) => {
      if (!open[i]) return
      const fact = run.facts[turn]
      if (fact === undefined) {
        open[i] = false
        return
      }
      taken[i]!.push(fact)
      if (cost(taken) > width) {
        taken[i]!.pop()
        open[i] = false
      } else order.push(i)
    })
  }
  const saidOf = (): number => taken.reduce((n, t) => n + t.length, 0)
  let note = more && saidOf() < total ? more(total - saidOf()) : undefined
  while (note !== undefined && cost(taken, note) > width && order.length > 0) {
    taken[order.pop()!]!.pop()
    note = more!(total - saidOf())
  }
  const out: PackedRun[] = []
  runs.forEach((run, i) => {
    if (taken[i]!.length === 0) return
    out.push({
      key: run.key,
      ...(run.accent !== undefined ? { accent: run.accent } : {}),
      lead: true,
      text: taken[i]!.join(joiner),
    })
  })
  return {
    runs: out,
    ...(note !== undefined ? { more: note } : {}),
    said: saidOf(),
    left: total - saidOf(),
  }
}

/* ---------------------------------------------------------- */
/* The pieces a block is drawn from                            */
/* ---------------------------------------------------------- */

export interface Leaf {
  /** the engine's own index into `leafRows` — the grid's row */
  r: number
  rowId: string
}

/** A run of rows under one leading word — or the whole block, with no word. */
export interface Run {
  key: string
  lead: string
  leaves: Leaf[]
}

export type Piece =
  /** a drawer above the spine: a series line */
  | { kind: 'band'; key: string; node: GroupNode }
  /** a spine drawer and its rows, shut or open */
  | { kind: 'block'; key: string; node: GroupNode; shut: boolean; runs: Run[] }
  /** a row of a flat table */
  | { kind: 'row'; key: string; leaf: Leaf }

/**
 * Cut the engine's drawn lines into what the price list draws. A group
 * line ABOVE the spine level is a band; a group line AT it opens a
 * block; a group line BELOW it (the leading word) opens a run inside
 * that block; a leaf joins the run it falls in. The add lines the
 * engine emits are dropped — nothing on the price list adds a row by
 * a line of its own. Nothing is reordered, so the leaves come out in
 * exactly the engine's order and the grid's row N is the engine's N.
 */
export function piecesOf(lines: readonly GridLine[], spineLevel: number): Piece[] {
  const out: Piece[] = []
  let block: Extract<Piece, { kind: 'block' }> | null = null
  let run: Run | null = null
  for (const line of lines) {
    if (line.kind === 'group') {
      const { node } = line
      if (node.level < spineLevel) {
        block = null
        run = null
        out.push({ kind: 'band', key: node.key, node })
      } else if (node.level === spineLevel) {
        run = null
        block = { kind: 'block', key: node.key, node, shut: line.collapsed, runs: [] }
        out.push(block)
      } else if (block) {
        run = { key: node.key, lead: node.value, leaves: [] }
        block.runs.push(run)
      }
      continue
    }
    if (line.kind !== 'leaf') continue
    const leaf = { r: line.r, rowId: line.rowId }
    if (!block) {
      out.push({ kind: 'row', key: line.rowId, leaf })
      continue
    }
    if (!run) {
      run = { key: `${block.key}\u001E`, lead: '', leaves: [] }
      block.runs.push(run)
    }
    run.leaves.push(leaf)
  }
  return out
}

/** How many rows a block draws, across its runs. */
export const leavesIn = (piece: Extract<Piece, { kind: 'block' }>): number =>
  piece.runs.reduce((n, r) => n + r.leaves.length, 0)

/* ---------------------------------------------------------- */
/* Chapters                                                    */
/* ---------------------------------------------------------- */

export interface Chapter {
  key: string
  value: string
  count: number
}

/** THE OUTERMOST LEVEL AS CHAPTERS — a handful of series read one at a
 *  time, the way the maker's price list gives each series its page —
 *  only on a table whose spine is a level below it, and only when
 *  there are between two and twelve of them. Stacer's 22 series are
 *  its spines; Parts' 187 categories are too many to be chapters. */
export function chaptersOf(roots: readonly GroupNode[], levels: readonly string[]): Chapter[] {
  if (levels.length < 2 || roots.length < 2 || roots.length > 12) return []
  return roots.map((n) => ({ key: n.key, value: n.value, count: n.leafCount }))
}

/* ---------------------------------------------------------- */
/* The render a block carries                                  */
/* ---------------------------------------------------------- */

export interface BlockPicture<H> {
  held: H
  /** the row the copy was found on */
  rowId: string
  /** how many of the block's rows carry the same address — the rows it depicts */
  depicts: number
  /** how many rows the block holds */
  of: number
}

/**
 * THE HELD RENDER OF A BLOCK, and only of a block whose rows are one
 * thing in several forms — a model's variants, under a series. The
 * first row whose picture address this browser holds a copy of gives
 * it, and the count of rows sharing that address says what it
 * depicts: on RU230KAM the WH render depicts 2 of 4 variants, and the
 * caption says so. A block whose spine is the OUTERMOST level holds
 * different things in its rows (a Stacer series is five hulls), and
 * one hull's photograph beside five would be a stand-in: those rows'
 * pictures are on their records and behind the Pictures door.
 */
export function blockPicture<H>(
  rows: readonly ViewRow[],
  image: FieldDef | undefined,
  spineLevel: number,
  heldCopy: (address: string | undefined) => H | null,
): BlockPicture<H> | null {
  if (!image || spineLevel < 1) return null
  const addressOf = (row: ViewRow): string | undefined => {
    const v = row.values[image.id]
    return v !== undefined && v !== null && isImageValue(v) ? primaryImage(v)?.src : undefined
  }
  for (const row of rows) {
    const address = addressOf(row)
    const held = heldCopy(address)
    if (held === null) continue
    const depicts = rows.filter((r) => addressOf(r) === address).length
    return { held, rowId: row.rowId, depicts, of: rows.length }
  }
  return null
}
