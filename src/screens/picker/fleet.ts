/* ============================================================
   THE FILE'S OWN SHELF — seven registers, their series, their models
   and, where the file splits one further, its variants.

   THE SWEEP'S SHARPEST FINDING IS THE WHOLE OF THIS MODULE'S BRIEF.
   Stacer's own site says "over 70 models in 9 ranges"; this file
   carries 91 rows in 22 series. Highfield's navigation ships ranges
   the file does not carry and omits one it does. So not one tier
   below is a list somebody typed: every register, every series and
   every model is read out of the sheet that loaded, and every number
   beside them is a count of rows.

   HOW A MODEL IS FOUND, WITHOUT A LIST OF BRANDS. A register declares
   its own `hierarchy`, and `trailOf` in @/domain/modules/read reads it
   — the same reader the view stage's rail uses, so the picker and the
   sheet can never disagree about where a row sits. Three shapes are on
   this file and all three fall out of one rule:

     Highfield   Series ▸ Model ▸ Variant   588 rows → 67 models
     Stacer      Series ▸ Model             91 rows → 91 models
     Formosa     (no hierarchy at all)      39 rows → 39 models

   A table with three or more levels groups its rows by the trail above
   the row, and the last step of that trail is the model's name. A
   table with two or fewer levels is one row, one model. A fourth level
   added tomorrow needs no edit here.

   THE PRICE IS THE QUOTE ENGINE'S OWN READ AND NOT A SECOND ONE.
   `freezeLevels` captures every rung the row carries and
   `priceAtLevel` picks the one `defaultLevelKey` says a fresh quote
   opens at — which is exactly what `mintLine` will freeze when the act
   is pressed. So the figure on this screen and the figure on the
   document are the same arithmetic over the same cell, and the rung is
   NAMED from the declaration rather than assumed to be called Cash.

   A ZERO IS NOT A PRICE. Eighteen rows of this file — all nine Haines
   Signature and nine of thirty-nine Formosa — hold 0 at every rung.
   Printing "$0" would be a figure nobody could act on, so a zero is
   carried as `zeroAtRung` and the screen says what the cell holds
   where the price would be. Nothing is guessed and nothing is hidden.

   NOTHING IS DROPPED SILENTLY. `buildEntries` refuses a retired
   register and a row marked no longer sold — the two things a
   catalogue must never put in front of a customer — so both are
   counted here instead and said in the sheet's own words
   (`heldBackSentence`, `retiredTableSentence`).
   ============================================================ */

import { isRetired, type EntityDef, type ImageRef, type RowData } from '@/domain/model'
import { buildEntries, type EntryFact, type IndexEntry } from '@/domain/modules/read'
import {
  countDiscontinued,
  heldBackSentence,
  retiredTableSentence,
} from '@/domain/catalogue/views/sellable'
import { colourwayOf, splitVariant, type Colourway } from '@/domain/quote/colourway'
import { modelKeyOf } from '@/domain/quote/boats'
import { materialCellWords, spokenBoat, spokenModel, type SpokenBoat } from '@/domain/quote/spoken'
import { seriesSaid } from '@/domain/catalogue/views/seriesSaid'
import { defaultLevelKey, freezeLevels, priceAtLevel, priceLevelsFor } from '@/domain/quote/pricing'

/* ---------------------------------------------------------- */
/* One row of a register                                       */
/* ---------------------------------------------------------- */

/**
 * ONE ROW, WHICH ON SIX REGISTERS IS A MODEL AND ON HIGHFIELD IS A
 * VARIANT OF ONE.
 *
 * `material` and `code` come from `splitVariant`, which is the domain's
 * own reading of the variant cell, and `say` from `colourwayOf`, which
 * is all-or-nothing on purpose: half a translation ("Black / Grey /
 * WB") reads as a decode that worked, and it did not.
 */
export interface Variant {
  rowId: string
  /** the row's own name, as the file spells it */
  label: string
  /** the variant cell verbatim — "HYP B-G-B"; '' on a register that
   *  files no third level */
  cell: string
  /** the material half of that cell — "HYP", "Open (PVC)" */
  material: string
  /** the colourway code half — "B-G-B", "WH" */
  code: string
  /** what a face prints for the code: the decoded names, or the code
   *  itself where any token of it has no decode */
  say: string
  /** the code read whole, for the swatches a chip draws — nothing is
   *  drawn for a code that did not decode */
  colour: Colourway
  /** the material half in words — "Hypalon", "Open · PVC" — as
   *  `materialCellWords` says it */
  materialSaid: string
  /** the whole version as a person says it — "Highfield ADV7 · Hypalon ·
   *  Black / Grey / Black" (`spokenBoat`); the file's own string stays in
   *  `label` for the dealer */
  spoken: string
  /** the same less the maker a line already names beside it — "ADV7 ·
   *  Hypalon · Black / Grey / Black", "Signature Fisher 525F" — the
   *  model as its card says it, then everything after the name
   *  (`versionShown`) */
  shown: string
  /** every token of the code decoded */
  reads: boolean
  /** the cell's last token is written in the file's own CODE alphabet
   *  — short groups of capitals joined by hyphens, "B-G-DG". False
   *  where the file names the colourway in English instead ("Sky",
   *  "Dune", "Mangrove"), which is not a code and has nothing to
   *  decode: those rows are printed as the word the file wrote. */
  coded: boolean
  /** the tokens of this code the map does not carry — `I`, `O`, `R`
   *  and `WH` on this file. A question for the dealer, never a guess. */
  unread: string[]
  /** the figure at the rung, when the cell holds one above zero */
  amount: number | null
  /** the cell holds exactly 0 at that rung, which is not a price */
  zeroAtRung: boolean
}

/** One material a model is built in, with what it costs. The sweep
 *  measured that the material is what moves the price in 43 of
 *  Highfield's 67 models — and that in the other 24 it splits further
 *  inside a material, which is why a span is carried and not a single
 *  figure. */
export interface Material {
  name: string
  /** what to print when the file names no material — and, where it
   *  does, the material in words ("Hypalon" for HYP) */
  label: string
  variants: Variant[]
  from: number | null
  to: number | null
  /** rows under this material whose rung holds zero */
  zeroes: number
}

/* ---------------------------------------------------------- */
/* A model                                                     */
/* ---------------------------------------------------------- */

export interface Model {
  /** the anchor row's id — stable across a repack, short in a URL, and
   *  the thing a search param carries */
  key: string
  tableId: string
  /** the register's own name */
  register: string
  /** the series this model is filed under, as the file's cell writes
   *  it; '' where the register files none or the cell is blank */
  series: string
  /** that series as a person says it (`seriesSaid`) — "Fisher Series"
   *  where the cell writes "Fisher Series (as at 18.03.2026)" */
  seriesLabel: string
  /** the model's own name, as the file spells it */
  name: string
  /** the model as a person says it, under its maker's mark: `spokenBoat`'s
   *  own `model` (and the file's words after it) — the maker's page's words
   *  for a Highfield code ("Sport 560" for SP560), the file's own words for
   *  every other maker ("519 Sea Ranger SDF", "Signature Fisher 525F") */
  said: string
  /** what the file adds in brackets after the name, said after it —
   *  "Centre Console"; '' when none */
  trim: string
  /** the two together, as one line says them: "519 Sea Ranger SDF ·
   *  Centre Console" — the build's words for the boat, less the maker the
   *  mark above it already states */
  shown: string
  /** the whole name, maker first — "Highfield Sport 560" (`spokenModel`) */
  spoken: string
  /** the trail above the row — "Sport ▸ SP560"; '' on a flat register */
  trail: string
  /** the rung its register prices at, by the register's own declared
   *  name — "Cash" on every boat register of this file, and '' on a
   *  register that declares no ladder at all */
  rung: string
  /** how many rows of the file this model is */
  rows: number
  /** one entry per row, in the file's order */
  variants: Variant[]
  /** the rows grouped by material, in first-appearance order. One
   *  group with an empty name on a register that files no material. */
  materials: Material[]
  /** the model is more than one row */
  splits: boolean
  /** the lowest figure any of its rows carries at the rung, or null */
  from: number | null
  /** the highest, so a model priced two ways can say both */
  to: number | null
  /** rows carrying a figure, and rows holding zero */
  priced: number
  zeroes: number
  /** the two or three figures that decide a sale, chosen by measuring
   *  the register's own columns (`tileFacts`), read off the anchor row */
  facts: EntryFact[]
  /** the maker's own address for this model's first picture */
  img?: ImageRef
}

/** One series of one register, with its rows counted. */
export interface Series {
  key: string
  /** the series as the file spells it; '' when the cell is blank */
  name: string
  /** what a heading prints, which is never blank: the series as a person
   *  says it (`seriesSaid`) — "Fisher Series", "OUTLAW · SIDE CONSOLES" */
  label: string
  /** what the file stamped the series' cell with, set apart from its name
   *  — "as at 18.03.2026"; '' when nothing */
  note: string
  models: Model[]
  rows: number
}

/** One register — a brand, as the file files it. */
export interface Brand {
  id: string
  name: string
  /** rows a customer may be shown */
  rows: number
  models: Model[]
  /** every group the rows fall into, the unnamed one included — the
   *  list the index draws headings from */
  series: Series[]
  /** how many of those the file actually NAMES. Two registers on this
   *  sheet leave the cell blank on some rows and one files no series
   *  column at all, so the group is real and the series is not; a
   *  masthead that counted the groups would print three series this
   *  file does not have. */
  named: number
  /** the rung a fresh quote opens at, named by the register's own
   *  declaration — "Cash" on every boat register of this file */
  rung: string
  /** the span of figures at that rung across the whole register */
  from: number | null
  to: number | null
  /** rows whose rung holds zero rather than a figure */
  zeroes: number
  /** the register files a series column at all */
  filesSeries: boolean
}

/** A register or a row this screen did not offer, and the reason. */
export interface HeldBack {
  id: string
  sentence: string
}

export interface Fleet {
  brands: Brand[]
  /** every row across every register a customer may be shown */
  rows: number
  models: number
  /** series the file NAMES, across every register — never the blank
   *  group a register with an empty cell falls into */
  series: number
  /** rows carrying a figure at their register's rung, and rows holding
   *  zero there */
  priced: number
  zeroes: number
  /** the rung's name where every register agrees on one; '' otherwise,
   *  and then each register says its own */
  rung: string
  heldBack: HeldBack[]
}

/* ---------------------------------------------------------- */
/* Reading it                                                  */
/* ---------------------------------------------------------- */

const positive = (n: number | null): boolean => n !== null && n > 0

/**
 * THE FILE'S OWN CODE ALPHABET: short groups of capitals joined by
 * hyphens — `B-G-DG`, `WH`, `I-B-C`.
 *
 * It matters because two different things fail to decode and only one
 * of them is a question for the dealer. `I`, `O`, `R` and `WH` are
 * codes with no entry in the map and nobody knows what they mean
 * (docs/STATUS.md question 3). `Sky`, `Dune`, `Mangrove`, `Ocean` and
 * `Polar` are the file naming a colourway in plain English on five
 * Adventure rows; there is nothing there to decode, and calling them
 * "not decoded" would invent a mystery where the sheet is perfectly
 * clear.
 */
const CODED = /^[A-Z]+(?:-[A-Z]+)*$/

/** The lowest and the highest figure in a list, ignoring the rows that
 *  carry none. */
function span(amounts: readonly (number | null)[]): { from: number | null; to: number | null } {
  const held = amounts.filter((n): n is number => positive(n))
  if (held.length === 0) return { from: null, to: null }
  return { from: Math.min(...held), to: Math.max(...held) }
}

/** The rung this register prices at, and the name it calls it. A
 *  register that declares no ladder prices nothing, and says so. */
function rungOf(table: EntityDef): { key: string; label: string } {
  const key = defaultLevelKey(table)
  return { key, label: priceLevelsFor(table).find((l) => l.key === key)?.label ?? '' }
}

/**
 * A VERSION AS A LINE THAT NAMES ITS MAKER BESIDE IT SAYS IT: the namer's
 * own model and the file's words after it — what the card prints — then
 * everything after the name. Taking the maker off the front of the whole
 * name, as this did until 2026-09-25, also took Haines' own first word, so
 * the finder offered "Fisher 525F" (the file's Model Code) for the boat the
 * card calls "Signature Fisher 525F" and the build "Haines Signature Fisher
 * 525F" — the fault the cards had (m2-last-critique.md, major 6).
 */
export function versionShown(b: SpokenBoat): string {
  const head = [b.model, b.qualifier].filter((part) => part !== '').join(' ')
  if (head === '')
    return b.maker !== '' && b.say.startsWith(`${b.maker} `)
      ? b.say.slice(b.maker.length + 1)
      : b.say
  return b.detail === '' ? head : `${head} · ${b.detail}`
}

/** One row, read at the register's own rung through the quote engine. */
function variantOf(
  table: EntityDef,
  row: RowData,
  entry: IndexEntry,
  rungKey: string,
  variantFieldId: string | undefined,
): Variant {
  const at = priceAtLevel(freezeLevels(table, row.values), rungKey)
  const cellValue = variantFieldId === undefined ? null : row.values[variantFieldId]
  const cell = typeof cellValue === 'string' ? cellValue.trim() : ''
  const { material, code } = splitVariant(cell)
  const read = colourwayOf(code)
  const coded = code !== '' && CODED.test(code)
  const spoken = spokenBoat(table.id, entry.label)
  return {
    rowId: row.id,
    label: entry.label,
    cell,
    material,
    code,
    say: read.say,
    colour: read,
    materialSaid: materialCellWords(table.id, material),
    spoken: spoken.say,
    shown: versionShown(spoken),
    reads: read.read,
    coded,
    /* PER TOKEN, THROUGH THE SAME DECODER. `colourwayOf` is
       all-or-nothing on a whole code, which is right for what a face
       prints; naming WHICH token is unknown is a different question and
       it is answered by asking the same function about each token on
       its own. Nothing here holds a map of its own. */
    unread:
      read.read || !coded
        ? []
        : code.split('-').filter((token) => token !== '' && !colourwayOf(token).read),
    amount: positive(at.unitPrice) ? at.unitPrice : null,
    zeroAtRung: at.unitPrice === 0,
  }
}

/** The materials of one model, in the file's own first-appearance
 *  order. A register that files no third level answers with one group
 *  whose name is empty, so a caller never branches on the shape. */
function materialsOf(variants: readonly Variant[]): Material[] {
  const out: Material[] = []
  const byName = new Map<string, Material>()
  for (const variant of variants) {
    let group = byName.get(variant.material)
    if (!group) {
      group = {
        name: variant.material,
        label: variant.material === '' ? 'No material on the sheet' : variant.materialSaid,
        variants: [],
        from: null,
        to: null,
        zeroes: 0,
      }
      byName.set(variant.material, group)
      out.push(group)
    }
    group.variants.push(variant)
    if (variant.zeroAtRung) group.zeroes += 1
  }
  for (const group of out) {
    const reach = span(group.variants.map((v) => v.amount))
    group.from = reach.from
    group.to = reach.to
  }
  return out
}

/** The column the third level of a register is filed under, when it
 *  has one — Highfield's `Variant`. */
function variantFieldOf(table: EntityDef): string | undefined {
  const levels = table.hierarchy ?? []
  return levels.length >= 3 ? levels[levels.length - 1] : undefined
}

/**
 * ONE REGISTER, READ WHOLE.
 *
 * `buildEntries` does the refusing — a retired register lists nothing
 * and a row no longer sold is never offered — and it also resolves the
 * label, the trail, the picture and the fact strip once per table
 * rather than once per row. What is added here is the collapse from
 * rows to models and the rung.
 */
export function brandOf(
  table: EntityDef,
  rows: readonly RowData[],
  rung?: { key: string; label: string },
): Brand {
  const list = [...rows]
  const entries = buildEntries([table], { [table.id]: list })
  const byId = new Map(list.map((row) => [row.id, row]))
  const at = rung ?? rungOf(table)
  const variantField = variantFieldOf(table)
  const deep = (table.hierarchy ?? []).length >= 3

  const models: Model[] = []
  const byKey = new Map<string, Model>()
  for (const entry of entries) {
    const row = byId.get(entry.rowId)
    if (!row) continue
    const variant = variantOf(table, row, entry, at.key, variantField)
    /* A DEEP REGISTER COLLAPSES ONTO ITS TRAIL; every other register
       is one row, one model. The trail already carries the series, so
       two models of the same name under two series stay two models. */
    const groupKey = modelKeyOf(table, row)
    const already = byKey.get(groupKey)
    if (already) {
      already.variants.push(variant)
      continue
    }
    const name = deep ? (entry.trail.split(' ▸ ').at(-1) ?? entry.label) : entry.label
    const said = namedAsSaid(table, name, deep)
    const model: Model = {
      key: entry.rowId,
      tableId: table.id,
      register: table.name,
      series: entry.branch,
      seriesLabel: seriesSaid(entry.branch).name,
      name,
      said: said.said,
      trim: said.trim,
      shown: said.trim === '' ? said.said : `${said.said} · ${said.trim}`,
      spoken: said.spoken,
      trail: entry.trail,
      rung: at.label,
      rows: 0,
      variants: [variant],
      materials: [],
      splits: false,
      from: null,
      to: null,
      priced: 0,
      zeroes: 0,
      facts: entry.facts ?? [],
      ...(entry.img ? { img: entry.img } : {}),
    }
    byKey.set(groupKey, model)
    models.push(model)
  }

  for (const model of models) {
    model.rows = model.variants.length
    model.splits = model.rows > 1
    model.materials = materialsOf(model.variants)
    const reach = span(model.variants.map((v) => v.amount))
    model.from = reach.from
    model.to = reach.to
    model.priced = model.variants.filter((v) => v.amount !== null).length
    model.zeroes = model.variants.filter((v) => v.zeroAtRung).length
  }

  /* THE SERIES ARE THE FILE'S, IN THE FILE'S ORDER. Sorting them
     alphabetically would be a second opinion about a dealer's own
     sheet, and the sheet's order is the one a person has already
     learned. */
  const series: Series[] = []
  const seriesByName = new Map<string, Series>()
  for (const model of models) {
    let group = seriesByName.get(model.series)
    if (!group) {
      const heading = seriesSaid(model.series)
      group = {
        key: model.series === '' ? `${table.id}none` : `${table.id}${model.series}`,
        name: model.series,
        label: model.series === '' ? 'Filed under no series' : heading.name,
        note: heading.note,
        models: [],
        rows: 0,
      }
      seriesByName.set(model.series, group)
      series.push(group)
    }
    group.models.push(model)
    group.rows += model.rows
  }

  const reach = span(models.flatMap((m) => m.variants.map((v) => v.amount)))
  return {
    id: table.id,
    name: table.name,
    rows: models.reduce((n, m) => n + m.rows, 0),
    models,
    series,
    named: series.filter((group) => group.name !== '').length,
    rung: at.label,
    from: reach.from,
    to: reach.to,
    zeroes: models.reduce((n, m) => n + m.zeroes, 0),
    filesSeries: (table.hierarchy ?? []).length >= 2,
  }
}

/**
 * EVERY REGISTER OF ONE KIND, READ OFF THE SHEET THAT LOADED.
 *
 * BY NAME, AND THAT IS A MEASUREMENT RATHER THAN A PREFERENCE. The
 * catalogue store holds the pack's own table order on the visit that
 * reads the file, and the REPOSITORY's order — by id, which is
 * alphabetical — on every visit after it, because a database promises
 * no order and `fromRepository` only re-sorts rows. Measured in the
 * browser on 2026-09-17: the rail read Stacer-first on the first open
 * and Formosa-first on the second. A rail that rearranges itself
 * between two visits is worse than one that is always in the same
 * order, and nothing on this sheet records which register comes first.
 * So it is the register's own name, which is not a ranking and is the
 * same on the first open and the tenth.
 */
export function fleetOf(
  tables: Readonly<Record<string, EntityDef>>,
  rows: Readonly<Record<string, readonly RowData[]>>,
  kind = 'boat',
): Fleet {
  const all = Object.values(tables)
    .filter((table) => table.kind === kind)
    .toSorted((a, b) => a.name.localeCompare(b.name, 'en-AU'))
  const brands: Brand[] = []
  const heldBack: HeldBack[] = []

  for (const table of all) {
    const list = rows[table.id] ?? []
    if (isRetired(table)) {
      heldBack.push({ id: table.id, sentence: retiredTableSentence(table.name) })
      continue
    }
    const gone = countDiscontinued([...list])
    if (gone > 0) heldBack.push({ id: table.id, sentence: heldBackSentence(gone, table.name) })
    brands.push(brandOf(table, list))
  }

  const rungs = new Set(brands.map((b) => b.rung).filter((r) => r !== ''))
  return {
    brands,
    rows: brands.reduce((n, b) => n + b.rows, 0),
    models: brands.reduce((n, b) => n + b.models.length, 0),
    series: brands.reduce((n, b) => n + b.named, 0),
    priced: brands.reduce((n, b) => n + b.models.reduce((m, model) => m + model.priced, 0), 0),
    zeroes: brands.reduce((n, b) => n + b.zeroes, 0),
    rung: rungs.size === 1 ? [...rungs][0] : '',
    heldBack,
  }
}

/* ---------------------------------------------------------- */
/* Finding one                                                 */
/* ---------------------------------------------------------- */

/** The models of a brand, or of the whole fleet when none is chosen. */
export const modelsOf = (fleet: Fleet, brandId: string | null): Model[] =>
  brandId === null
    ? fleet.brands.flatMap((b) => b.models)
    : (fleet.brands.find((b) => b.id === brandId)?.models ?? [])

/**
 * WORD BY WORD, OVER THE TRAIL AS WELL AS THE NAME — the same rule
 * `matchSubjects` keeps in @/domain/quote/start, and for the reason
 * written there: the haystack carries the trail's own ' ▸ ' and
 * whatever punctuation a model's name has, so "Sport 560" is never a
 * literal substring of "sport ▸ sp560" and a whole-string test answers
 * "nothing matches" for a model two screens down. Typing a series name
 * finds every model under it, which is how a dealer looks for a hull.
 *
 * The register's name is in the haystack too, because on this screen
 * the registers are all on one page and "highfield sport" is a
 * sentence somebody will type.
 */
export function matchModels(models: readonly Model[], query: string): Model[] {
  const words = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w !== '')
  if (words.length === 0) return [...models]
  return models.filter((model) => {
    /* the file's code and the name a person says, so "SP560" and "Sport 560" both find it */
    const hay =
      `${model.register} ${model.trail} ${model.series} ${model.name} ${model.spoken}`.toLowerCase()
    return words.every((word) => hay.includes(word))
  })
}

/** The models cut into their series, in the file's order, keeping only
 *  the series that still have a model in them. */
export function seriesOf(brand: Brand, keep: ReadonlySet<string>): Series[] {
  const out: Series[] = []
  for (const group of brand.series) {
    const models = group.models.filter((m) => keep.has(m.key))
    if (models.length === 0) continue
    out.push({ ...group, models, rows: models.reduce((n, m) => n + m.rows, 0) })
  }
  return out
}

/**
 * One model by the key a search param carries — its anchor row's id, or
 * the id of ANY row of it. The second is how a door elsewhere opens a
 * boat here without knowing which of its rows this screen anchored on:
 * Home's photograph names the first row the picture depicts
 * (`firstRowDepicted`), and the picker answers with the model that row
 * is a version of. An anchor always wins over a version, so a key never
 * means two things.
 */
export function modelByKey(fleet: Fleet, key: string | null): Model | null {
  if (key === null) return null
  const all = fleet.brands.flatMap((b) => b.models)
  return (
    all.find((m) => m.key === key) ??
    all.find((m) => m.variants.some((v) => v.rowId === key)) ??
    null
  )
}

/** The rows of a model whose material is the chosen one; every row
 *  when none is chosen. */
export const variantsIn = (model: Model, material: string | null): Variant[] =>
  material === null ? model.variants : model.variants.filter((v) => v.material === material)

/**
 * Every colourway token these rows use that the decode map does not
 * carry, in the file's order and without repeats.
 *
 * IT TAKES THE ROWS THAT ARE ON SCREEN and not the whole model,
 * because the sentence it feeds sits under a list: printed under the
 * seven PVC codes of a Sport 560, "the code I has no decode" names a
 * token that is in the eight HYP codes and in none of the seven above
 * it, which reads as a screen talking about something else.
 */
export function unreadIn(variants: readonly Variant[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const variant of variants) {
    for (const token of variant.unread) {
      if (seen.has(token)) continue
      seen.add(token)
      out.push(token)
    }
  }
  return out
}

/** The same question asked of a whole model. */
export const unreadTokens = (model: Model): string[] => unreadIn(model.variants)

/* ---------------------------------------------------------- */
/* What the showroom draws                                     */
/* ---------------------------------------------------------- */

/**
 * A MODEL'S NAME AS A PERSON SAYS IT, for a card and for the whole —
 * ASKED OF THE ONE NAMER, and nothing done to its answer but choose
 * which of its parts a card under the maker's mark prints.
 *
 * On a register that files its models by code (Highfield) the model is
 * its token, and `spokenModel` says it in the maker's page's words. On
 * every other register the model is its row, and `spokenBoat` says it:
 * its `model` and the file's words after it are what a card prints, and
 * its `trim` is said after them with " · ", exactly as the build and the
 * paper say it.
 *
 * WHAT THIS REPLACED (m2-last-critique.md, major 6). The card took the
 * maker's name off the front of the WHOLE name, and printed a trim in
 * brackets: "519 Sea Ranger SDF (Centre Console)" where the build says
 * "Stacer 519 Sea Ranger SDF · Centre Console", and for Haines Signature,
 * whose rows begin with the range ("Signature Fisher - 525F"), taking
 * "Haines Signature" off "Haines Signature Fisher 525F" also took the
 * row's own first word, and left "Fisher 525F" — which is the file's
 * Model Code column, and not a name anybody says. `spokenBoat`'s `model`
 * is "Signature Fisher 525F": the row's own words, none taken off, and
 * the build's name less only the maker the mark above it states.
 */
function namedAsSaid(
  table: EntityDef,
  name: string,
  deep: boolean,
): { said: string; trim: string; spoken: string } {
  if (deep) {
    const m = spokenModel(table.id, name)
    return { said: m.model, trim: '', spoken: m.name }
  }
  const b = spokenBoat(table.id, name)
  const said = [b.model, b.qualifier].filter((part) => part !== '').join(' ')
  return { said: said === '' ? shownName(name, table.name) : said, trim: b.trim, spoken: b.say }
}

/**
 * WHAT A CARD WITH NO PHOTOGRAPH SETS AS ITS COVER: the model large, and
 * its trim small under it — "519 Sea Ranger SDF" over "Centre Console" —
 * or, for a name that carries its own bracket ("Sport 760 WL (Windlass)"),
 * the same split `coverWords` makes.
 */
export function coverOf(model: Pick<Model, 'said' | 'trim'>): { main: string; rest: string } {
  return model.trim === '' ? coverWords(model.said) : { main: model.said, rest: model.trim }
}

/** A literal string, safe inside a RegExp. */
const literal = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * THE NAME A CARD PRINTS UNDER ITS MAKER'S MARK — the file's own name
 * with the maker's name taken off its front, and nothing else changed.
 *
 * Six of the seven boat tables on this file spell the maker into every
 * model: "Formosa - GRT 425 (Tiller)", "Stabicraft - 1450 Explorer",
 * "Stacer - 309 Skimma". On a card that already stands under Formosa's
 * mark that is the maker said twice, and on a phone it is the half of
 * the name that fits. So a leading "<maker> -" is dropped — the
 * register's whole name, or its first word, since the file calls the
 * maker "Highfield Inflatables" and the rows "Highfield …" — and runs
 * of spaces the workbook typed ("Merry Fisher  -  695 S2") are one.
 *
 * NEVER A REWRITE. A name that does not begin with its maker is
 * returned as the file spells it, typos included ("Surtess - 770 Game
 * Fisher XL" is not Surtees, and pretending it is would be an edit of
 * the dealer's sheet). A name that is nothing BUT its maker keeps it.
 * The search still reads the whole name, so typing "Formosa GRT"
 * finds the card that prints "GRT 425 (Tiller)".
 */
export function shownName(name: string, register: string): string {
  const tidy = name.replace(/\s+/g, ' ').trim()
  const whole = register.replace(/\s+/g, ' ').trim()
  const first = whole.split(' ')[0] ?? ''
  for (const prefix of [whole, first]) {
    if (prefix === '') continue
    const lead = new RegExp(`^${literal(prefix)}\\s*-\\s*`, 'i')
    if (!lead.test(tidy)) continue
    const rest = tidy.replace(lead, '').trim()
    if (rest !== '') return rest
  }
  return tidy
}

/**
 * A NAME SET AS A COVER, IN TWO SIZES: the model, and what the file
 * adds after it in brackets. "539 Sea Ranger SDF (Centre Console)" set
 * whole at the cover's size is four lines in a 138px frame and its last
 * line was cut off at 1440 (measured 2026-09-24, the Stacer's Sea Ranger
 * cards); the model large and "Centre Console" small under it is three,
 * and nothing is lost. A name with no bracket is all `main`. The words
 * are the file's own; only where they break is decided here.
 */
export function coverWords(name: string): { main: string; rest: string } {
  const tidy = name.replace(/\s+/g, ' ').trim()
  const open = tidy.indexOf('(')
  if (open <= 0) return { main: tidy, rest: '' }
  const main = tidy.slice(0, open).trim()
  const rest = tidy
    .slice(open)
    .replace(/^\(\s*/, '')
    .replace(/\s*\)\s*$/, '')
    .trim()
  return main === '' || rest === '' ? { main: tidy, rest: '' } : { main, rest }
}

/**
 * THE PICTURE ON A MAKER'S DOOR: the dearest of its models that this
 * browser holds a photograph of.
 *
 * Measured rather than chosen. A door is the first thing a dealer and
 * the customer beside them see of a maker, and the file's first row is
 * usually its smallest hull — Highfield's is a 2.3m roll-up tender,
 * Stacer's a 3m tinnie — so the door would sell the range by its
 * dinghy. The dearest model with a held picture is a rule anybody can
 * check against the file, it moves when the file moves, and the door
 * names the model it shows, so the picture belongs to that model and
 * to no other. Ties keep the file's order. A maker with no held
 * picture has no door picture at all, and its door is its mark.
 *
 * `held` is handed in: this module reads the sheet and never the
 * image ledger (`./pictures.ts` does).
 */
export function flagshipOf(brand: Brand, held: (model: Model) => boolean): Model | null {
  let first: Model | null = null
  let best: Model | null = null
  for (const model of brand.models) {
    if (!held(model)) continue
    first ??= model
    const top = model.to ?? model.from
    if (top === null) continue
    const bestTop = best === null ? null : (best.to ?? best.from)
    if (bestTop === null || top > bestTop) best = model
  }
  /* A MAKER WITH NO PRICE ON FILE AT ALL — Haines Signature holds a zero
     on every line — has no dearest boat, and is not therefore a maker
     with no picture: its door shows the first boat it has one of. */
  return best ?? first
}

/**
 * THE ONE DOOR DRAWN TWICE AS WIDE, so the doors fill their last row.
 *
 * The doors stand four abreast on a desk and two abreast in a hand.
 * Seven makers leave a hole in the last row of either; one door two
 * cells wide makes eight cells and fills both. It is the maker with
 * the most models — counted, and on this file that is Stacer — because
 * the widest door is the one with the most behind it. Ties go to the
 * first by name.
 *
 * Only when it fills the grid: with four abreast that is a number of
 * makers one short of a multiple of four, which is also odd, so it
 * fills the two-abreast grid too. Any other count draws every door the
 * same width and none is singled out.
 */
export function featuredOf(fleet: Fleet): string | null {
  const n = fleet.brands.length
  if (n < 3 || (n + 1) % 4 !== 0) return null
  let best: Brand | null = null
  for (const brand of fleet.brands) {
    if (best === null || brand.models.length > best.models.length) best = brand
  }
  return best?.id ?? null
}

/**
 * HOW TALL A MAKER'S MARK IS DRAWN, as a multiple of the screen's mark
 * height, so seven marks of seven shapes weigh the same.
 *
 * The marks on this file run from Jeanneau's 1.8 : 1 to Surtees' 6.3 : 1.
 * At one height the long ones read as banners and the square one as a
 * stamp. Drawing each at equal AREA instead — height proportional to
 * one over the square root of its width over its height, against a
 * 4 : 1 mark — is how a row of sponsor marks is balanced by eye, and it
 * is arithmetic on the ledger's own pixel sizes. Clamped so neither end
 * is drawn absurdly: a very long mark never below 0.7 and a square one
 * never above 1.6.
 */
export function markScale(width: number, height: number): number {
  if (!(width > 0) || !(height > 0)) return 1
  const scale = Math.sqrt(4 / (width / height))
  return Math.min(1.6, Math.max(0.7, Math.round(scale * 100) / 100))
}
