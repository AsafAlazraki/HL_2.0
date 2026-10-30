/* ============================================================
   WHAT PICTURE, AT WHAT SIZE, WITH WHAT CAPTION AND PROVENANCE —
   ONE READER, FOR EVERY SCREEN AND FOR THE CUSTOMER'S PAPER.

   THREE LEDGERS, THREE JOBS, NEVER MIXED:

     · `images.json`   — the price file's OWN picture addresses, one
       entry per address, with a copy under `public/seed-images` where
       one is held. The row's own picture. Nobody chose it but the
       dealer who typed it.
     · `pictures.json` — the pictures attached to a MODEL (a hull, a
       motor, a trailer) because a person looked at them and marked
       them as that exact item: the catalogue tier (long edge 1100,
       `public/seed-images`) and the hero tier (on the water, up to
       2560, `public/hero-images`). It also carries FINDINGS: a person's
       ruling on a row's own address — "this is a logo", "this is the
       sister model" — so the row's own picture can be refused where the
       dealer's file is wrong.
     · `marks-ledger.json` — makers' wordmarks, and the dealership's own.

   THE RULES THIS FILE KEEPS, each pinned in `pictures.test.ts`:

     1. A PICTURE BELONGS ONLY TO THE EXACT MODEL IT DEPICTS. A model
        picture is attached to the rows of its model by row id, written
        into the ledger by the tool and re-checked against the price file
        by `src/data/imagery.test.ts` — never by resemblance, never by a
        name standing inside a longer one, so a sister model can never
        answer.
     2. THE ROW'S OWN ADDRESS FIRST, THEN ITS MODEL'S. And a finding that
        refuses the row's own address for that row wins over both.
     3. A COLOURWAY RENDER IS EXACT ONLY ON ITS COLOURWAY. On every other
        row of the model it is the model's picture (`exact: false`), and a
        line on a quote or a cover may not use it.
     4. NEVER ENLARGED: every answer carries the held pixels, and a
        narrower copy wider than the held one is dropped.
     5. A GAP IS RETURNED AS A GAP, with its reason in a sentence.

   PURE. No React, no store, no DOM, no import.meta: the parsed ledgers
   and the deployment's base address are handed in, so the bundle
   (`src/data/pictures.ts`) and Entry's door (which reads the ledgers
   over the network before the price file is open) ask the same code.
   A ledger row that does not parse is dropped, never guessed: a
   generated file that changed shape draws the next rung down.
   ============================================================ */

import type { OwnPicture } from './ownPictures'

/* ---------------------------------------------------------- */
/* The ledger, as `pictures.json` holds it                     */
/* ---------------------------------------------------------- */

/** The two sizes a picture of a model is held at. */
export type PictureTier = 'catalogue' | 'hero'

/** What a picture is attached to: one model, or a hull the file sells
 *  as several models (Stabicraft's packages) whose picture cannot tell
 *  them apart. A series shot would be `series`; none is held. */
export type PictureScope = 'model' | 'hull' | 'series'

/** One narrower copy of a held hero, for a `srcset`. */
export interface PictureWidth {
  width: number
  height: number
  file: string
  bytes: number
  sha256: string
}

/** One picture of a model, with everything a reader of it is owed. */
export interface PictureEntry {
  id: string
  tier: PictureTier
  /** the register the item is a row of */
  table: string
  scope: PictureScope
  /** the file's own model names (the picker's `fleetOf`), exactly one for `model` */
  models: string[]
  /** every row of those models, by model: the rows it may be drawn for */
  rows: Record<string, string[]>
  /** the rows it shows EXACTLY, model and finish both. Empty where the
   *  finish is not recorded or the scope is wider than one model. */
  exactRows: string[]
  /** true where the address is the price file's own Image Link for `exactRows` */
  rowAddress: boolean
  /** the alt text and the short caption: "Highfield SP300 on the water" */
  subject: string
  /** the exact item, as the person who verified it wrote it */
  depicts: string
  /** what the picture shows that a quote may not say: the outboard, a
   *  colourway, an accessory. The paper captions from these. */
  differs: string[]
  /** scene on the water or studio on white */
  verdict: 'scene' | 'studio'
  /** the maker's own address, and the page it was found on */
  url: string
  pageUrl: string
  host: string
  licenceNote: string
  fetchedAt: string
  sourceWidth: number
  sourceHeight: number
  /** the held copy */
  file: string
  width: number
  height: number
  bytes: number
  sha256: string
  widths?: PictureWidth[]
  /** the verification line, as the judge wrote it */
  verification: string
  /** who verified it and how — or, for a picture no person has marked,
   *  "automatic: …" and what the machine measured */
  verifiedBy: string
  /** a PERSON marked it as this exact item. Only these sit beside a line. */
  person: boolean
  /** where the verdict is: `docs/research/imagery/proposals/<group>.verdicts.json#n` */
  verdicts: string
}

/** A person's ruling on a row's OWN address in `images.json`. */
export interface PictureFinding {
  address: string
  table: string
  /** the rows the ruling is about */
  rows: string[]
  /** `refuse`: never drawn for these rows. `note`: drawn, and captioned. */
  decision: 'refuse' | 'note'
  /** the rule it breaks, in the judges' words: "a logo, not the item" */
  rule: string
  /** what the picture actually shows */
  shows: string
  differs: string[]
  verification: string
  person: boolean
  /** where the ruling is written down */
  source: string
}

export interface PicturesFile {
  meta: { note: string; generatedBy: string; updated: string }
  pictures: PictureEntry[]
  findings: PictureFinding[]
}

/* ---------------------------------------------------------- */
/* The answers                                                 */
/* ---------------------------------------------------------- */

/** How a picture stands to the item that was asked about. */
export type Standing = 'row' | 'model' | 'hull' | 'series'

/** One picture this repository ships, at the size it ships it. */
export interface Picture {
  /** the ledger id, or `row:<address>` for the row's own copy */
  id: string
  src: string
  /** the held pixels: nothing is ever drawn past them */
  width: number
  height: number
  /** narrower copies, narrowest first and the held copy last, for a `srcset` */
  widths: { src: string; width: number }[]
  tier: PictureTier
  /** the maker's own address */
  address: string
  /** the page it was read off, '' for a row's own address */
  pageUrl: string
  verdict: string
  /** alt text: what it shows in a few words ('' for a row's own copy) */
  subject: string
  /** the register it depicts a row of */
  table: string
  /** the model it depicts — its one model, or a hull's shared name ('' for the row's own copy) */
  model: string
  /** every row it may be drawn for, in the order the ledger lists them */
  rows: readonly string[]
  standing: Standing
  /** it shows exactly the row asked about: model and finish */
  exact: boolean
  /** a person marked it as this exact item */
  person: boolean
  depicts: string
  differs: string[]
  verification: string
  licenceNote: string
  /** what the asked row says beyond what the picture pins — "Side Console"
   *  under a hull's photograph. '' where the picture is the row's model. */
  beyond: string
  /** NORTHSIDE'S OWN PICTURE (`./ownPictures.ts`): who added it and when, ISO. Absent on every
   *  picture the app ships. */
  added?: { by: string; at: string }
}

/** What a line or a cover may print, or why nothing. */
export type Found = { held: true; picture: Picture } | { held: false; because: string }

/** One item asked about: a row of a register, and the address it carries. */
export interface Item {
  table: string
  row: string
  /** the row's own picture address, as the price file typed it */
  address?: string
}

/** The ink a mark is drawn in: white for a dark ground, dark for paper. */
export type Ink = 'white' | 'dark'

/** A wordmark, in the ink the ledger holds it in. */
export interface HeldMark {
  id: string
  brand: string
  ink: Ink
  src: string
  width: number
  height: number
  /** the dealership's own mark rather than a maker's */
  organisation: boolean
}

/** The mark to draw, or the reason there is none, in a sentence. */
export type MarkChoice = { drawn: true; mark: HeldMark } | { drawn: false; because: string }

export interface PictureBook {
  /** the row's own held copy, unless a finding refuses it for this row */
  rowCopy(item: Item): Picture | null
  /** the model's picture at a tier: exact first, then the model's, then the hull's */
  modelPicture(item: Item, tier: PictureTier): Picture | null
  /** the model on the water */
  hero(item: Item): Picture | null
  /** the catalogue picture: the row's own, then its model's */
  catalogue(item: Item): Picture | null
  /** a screen's ladder: on the water, then the catalogue picture */
  picture(item: Item): Picture | null
  /** the picture a COVER may print: a hero only where a person marked it, never a refused
   *  one, never another colourway */
  forCover(item: Item): Found
  /** the picture a LINE may carry: a person marked it as this exact item */
  forLine(item: Item): Found
  /** what a finding says about the row's own picture, for a caption */
  notes(item: Item): string[]
  heroById(id: string): Picture | null
  heroes(): readonly Picture[]
  /** every held mark for the maker a register is named after (or the dealership's own, by its name) */
  marksFor(register: string): readonly HeldMark[]
  mark(register: string | undefined, ink: Ink): MarkChoice
  /** the dealership's own mark in an ink, or why not */
  organisation(ink: Ink): MarkChoice
  /** makers looked for, makers held, files held — the dealership's own left out */
  markFacts(): { checked: number; held: number; files: number }
  /** the picture Northside added to this one option, where one stands (`./ownPictures.ts`) */
  own(item: Item): OwnPicture | null
  /** the held picture of this EXACT item — the row's own copy, or one a person marked as this
   *  row, model and finish — which wins over Northside's own unless Northside chose theirs */
  exactHeld(item: Item): Picture | null
}

/* ---------------------------------------------------------- */
/* Reading, defensively                                        */
/* ---------------------------------------------------------- */

type Row = Record<string, unknown>

const str = (row: Row, key: string): string =>
  typeof row[key] === 'string' ? (row[key] as string).trim() : ''
const num = (row: Row, key: string): number =>
  typeof row[key] === 'number' && Number.isFinite(row[key]) && (row[key] as number) > 0
    ? (row[key] as number)
    : 0
const strs = (row: Row, key: string): string[] =>
  Array.isArray(row[key])
    ? (row[key] as unknown[]).filter((v): v is string => typeof v === 'string' && v.trim() !== '')
    : []

/** `rows` as the ledger keys it — the file's own model name, then its row ids. */
function rowsOf(row: Row): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  const raw = row['rows']
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return out
  for (const [model, ids] of Object.entries(raw as Record<string, unknown>)) {
    if (model.trim() === '' || !Array.isArray(ids)) continue
    const list = ids.filter((v): v is string => typeof v === 'string' && v !== '')
    if (list.length > 0) out[model] = list
  }
  return out
}

/** The model of an entry a row is one of, or null where it is none of them. */
export function modelOf(e: Pick<PictureEntry, 'rows'>, rowId: string): string | null {
  for (const [model, ids] of Object.entries(e.rows)) if (ids.includes(rowId)) return model
  return null
}

function listOf(parsed: unknown, key?: string): Row[] {
  const list = key ? (parsed as Row | null | undefined)?.[key] : parsed
  return Array.isArray(list)
    ? list.filter((r): r is Row => typeof r === 'object' && r !== null)
    : []
}

/** A register's name and a maker's are written by two hands — "Highfield
 *  Inflatables" against "Highfield" — so a match is the same name, or the
 *  register's beginning with the maker's and a space. Never a substring
 *  anywhere, which would pair a trailer maker with a boat maker. */
export function namesTheSame(register: string, brand: string): boolean {
  const a = register.trim().toLowerCase()
  const b = brand.trim().toLowerCase()
  return a !== '' && b !== '' && (a === b || a.startsWith(`${b} `))
}

/** The characters every name shares from its start. */
function sharedPrefix(models: readonly string[]): string {
  let common = models[0] ?? ''
  for (const m of models) {
    let i = 0
    while (i < common.length && i < m.length && common[i] === m[i]) i += 1
    common = common.slice(0, i)
  }
  return common
}

/** A hull's own name: what its models share, less a dangling bracket —
 *  "Stacer - 519 Sea Ranger SDF" for its two consoles. */
export function hullName(models: readonly string[]): string {
  if (models.length < 2) return models[0] ?? ''
  return sharedPrefix(models)
    .replace(/[\s([\-–—,:/]+$/u, '')
    .trim()
}

/** What a row of a hull says beyond what the hull's picture pins: the
 *  words after the part every model of the hull shares, unbracketed.
 *  "Side Console" for the 519's console versions; "Profish" for a 1550. */
function beyondOf(models: readonly string[], asked: string): string {
  if (models.length < 2 || asked === '') return ''
  return asked
    .slice(sharedPrefix(models).length)
    .replace(/^[\s()[\]\-–—,:/]+/u, '')
    .replace(/[\s()[\]\-–—,:]+$/u, '')
}

/* ---------------------------------------------------------- */
/* The book                                                    */
/* ---------------------------------------------------------- */

interface Held {
  picture: Picture
  entry: PictureEntry
}

const RANK: Record<Standing, number> = { row: 0, model: 1, hull: 2, series: 3 }

/**
 * THE ONE READER. `raw` is the three ledgers as parsed JSON — any of them
 * may be missing or malformed, and the book then answers with gaps — and
 * `base` is the deployment's own base address (`import.meta.env.BASE_URL`
 * in the app), so a picture is served under a sub-path as well as at the
 * root.
 */
export function pictureBook(
  raw: { images?: unknown; pictures?: unknown; marks?: unknown },
  base: string,
): PictureBook {
  const root = base.endsWith('/') ? base : `${base}/`
  const SEED = `${root}seed-images/`
  const HERO = `${root}hero-images/`
  const MARKS = `${root}brand-marks/`

  /* the row's own copies, by address */
  const copies = new Map<string, Picture>()
  for (const row of listOf(raw.images, 'images')) {
    const address = str(row, 'address')
    const file = str(row, 'file')
    const width = num(row, 'width')
    const height = num(row, 'height')
    if (address === '' || file === '' || width === 0 || height === 0) continue
    copies.set(address, {
      id: `row:${address}`,
      src: SEED + file,
      width,
      height,
      widths: [],
      tier: 'catalogue',
      address,
      pageUrl: '',
      verdict: str(row, 'verdict') || 'unknown',
      subject: '',
      table: '',
      model: '',
      rows: [],
      standing: 'row',
      exact: true,
      person: false,
      depicts: '',
      differs: [],
      verification: '',
      licenceNote: str(row, 'licenceNote'),
      beyond: '',
    })
  }

  /* the pictures of models, by the rows they may be drawn for */
  const entries: PictureEntry[] = []
  for (const row of listOf(raw.pictures, 'pictures')) {
    const tier = str(row, 'tier')
    const scope = str(row, 'scope')
    const id = str(row, 'id')
    const table = str(row, 'table')
    const file = str(row, 'file')
    const width = num(row, 'width')
    const height = num(row, 'height')
    const rows = rowsOf(row)
    if (tier !== 'catalogue' && tier !== 'hero') continue
    if (scope !== 'model' && scope !== 'hull' && scope !== 'series') continue
    if (id === '' || table === '' || file === '' || width === 0 || height === 0) continue
    if (Object.keys(rows).length === 0) continue
    entries.push({
      ...(row as unknown as PictureEntry),
      id,
      tier,
      scope,
      table,
      file,
      width,
      height,
      rows,
      models: strs(row, 'models'),
      exactRows: strs(row, 'exactRows'),
      differs: strs(row, 'differs'),
      person: row['person'] === true,
      widths: Array.isArray(row['widths']) ? (row['widths'] as PictureWidth[]) : [],
    })
  }

  const dirOf = (tier: PictureTier): string => (tier === 'hero' ? HERO : SEED)
  const pictureOfEntry = (e: PictureEntry, rowId: string): Picture => {
    const dir = dirOf(e.tier)
    const widths: { src: string; width: number }[] = []
    for (const w of e.widths ?? []) {
      if (typeof w?.file !== 'string' || !(w.width > 0) || w.width >= e.width) continue
      widths.push({ src: dir + w.file, width: w.width })
    }
    widths.push({ src: dir + e.file, width: e.width })
    const exact = e.exactRows.includes(rowId)
    const standing: Standing = exact ? 'row' : e.scope
    /* what the picture depicts: its one model, or the hull its models share */
    const model = e.models.length === 1 ? (e.models[0] ?? '') : hullName(e.models)
    return {
      id: e.id,
      src: dir + e.file,
      width: e.width,
      height: e.height,
      widths: widths.toSorted((a, b) => a.width - b.width),
      tier: e.tier,
      address: e.url,
      pageUrl: e.pageUrl ?? '',
      verdict: e.verdict ?? 'unknown',
      subject: e.subject ?? '',
      table: e.table,
      model,
      rows: Object.values(e.rows).flat(),
      standing,
      exact,
      person: e.person,
      depicts: e.depicts ?? '',
      differs: e.differs,
      verification: e.verification ?? '',
      licenceNote: e.licenceNote ?? '',
      beyond: '',
    }
  }

  /* the findings, by address */
  const findings = new Map<string, PictureFinding[]>()
  for (const row of listOf(raw.pictures, 'findings')) {
    const address = str(row, 'address')
    const decision = str(row, 'decision')
    if (address === '' || (decision !== 'refuse' && decision !== 'note')) continue
    const finding: PictureFinding = {
      ...(row as unknown as PictureFinding),
      address,
      decision,
      rows: strs(row, 'rows'),
      differs: strs(row, 'differs'),
      person: row['person'] === true,
    }
    findings.set(address, [...(findings.get(address) ?? []), finding])
  }
  /** a ruling that names no rows rules for every row that carries the address */
  const ruling = (address: string, rowId: string, decision: 'refuse' | 'note'): PictureFinding[] =>
    (findings.get(address) ?? []).filter(
      (f) => f.decision === decision && (f.rows.length === 0 || f.rows.includes(rowId)),
    )

  const rowCopy = (item: Item): Picture | null => {
    const at = item.address?.trim() ?? ''
    if (at === '') return null
    const held = copies.get(at)
    if (!held) return null
    if (ruling(at, item.row, 'refuse').length > 0) return null
    const copy: Picture = { ...held, table: item.table, rows: [item.row] }
    const noted = ruling(at, item.row, 'note')
    if (noted.length === 0) return copy
    return {
      ...copy,
      differs: noted.flatMap((f) => f.differs),
      depicts: noted[0]?.shows ?? '',
      verification: noted[0]?.verification ?? '',
    }
  }

  /* the entries each row may be drawn with, found once: the sheet asks for every row it draws */
  const byRow = new Map<string, PictureEntry[]>()
  for (const e of entries) {
    for (const id of Object.values(e.rows).flat()) {
      const key = `${e.table}\n${id}`
      byRow.set(key, [...(byRow.get(key) ?? []), e])
    }
  }

  const modelPicture = (item: Item, tier: PictureTier): Picture | null => {
    let best: Held | null = null
    for (const e of byRow.get(`${item.table}\n${item.row}`) ?? []) {
      if (e.tier !== tier) continue
      const picture = pictureOfEntry(e, item.row)
      if (!best || RANK[picture.standing] < RANK[best.picture.standing])
        best = { picture, entry: e }
    }
    if (!best) return null
    if (best.picture.standing === 'row' || best.entry.models.length < 2) return best.picture
    return {
      ...best.picture,
      beyond: beyondOf(best.entry.models, modelOf(best.entry, item.row) ?? ''),
    }
  }

  const hero = (item: Item): Picture | null => modelPicture(item, 'hero')
  const catalogue = (item: Item): Picture | null => rowCopy(item) ?? modelPicture(item, 'catalogue')

  const gapFor = (item: Item, purpose: 'cover' | 'line'): string => {
    const at = item.address?.trim() ?? ''
    const refused = at === '' ? [] : ruling(at, item.row, 'refuse')
    if (refused[0]) {
      return `The price file’s own picture for this item is refused: ${refused[0].rule}.`
    }
    if (purpose === 'line') {
      return 'No picture of this exact item has been marked by a person, so the line carries none.'
    }
    return at === ''
      ? 'The price file names no picture for this item, and no picture of it is held.'
      : 'No picture of this exact item is held.'
  }

  const forCover = (item: Item): Found => {
    /* THE PAPER TAKES A HERO ONLY WHERE A PERSON MARKED IT. The heroes the
       machine chose (`person: false`, "automatic: …") may sit on a screen;
       on the paper a customer keeps they would be a sister model nobody
       ruled out — the SP600's was read off the SP660's page — so the cover
       falls to the row's own copy, as the quote spec's ladder does. */
    const h = hero(item)
    if (h?.person) return { held: true, picture: h }
    const own = rowCopy(item)
    if (own) return { held: true, picture: own }
    const model = modelPicture(item, 'catalogue')
    /* ANOTHER COLOURWAY IS NOT THIS BOAT. A render of the model in a
       finish the quote does not carry may sit on a screen, captioned as
       the model's; on the paper a customer keeps, it may not. */
    if (model && model.exact) return { held: true, picture: model }
    return { held: false, because: gapFor(item, 'cover') }
  }

  const forLine = (item: Item): Found => {
    const marked = entries
      .filter(
        (e) =>
          e.tier === 'catalogue' &&
          e.table === item.table &&
          e.person &&
          e.exactRows.includes(item.row),
      )
      .map((e) => pictureOfEntry(e, item.row))
    const first = marked[0]
    return first ? { held: true, picture: first } : { held: false, because: gapFor(item, 'line') }
  }

  const heroes = entries.filter((e) => e.tier === 'hero')
  const heroPictures = heroes.map((e) => pictureOfEntry(e, e.exactRows[0] ?? ''))

  /* the marks */
  const held: HeldMark[] = []
  const refusedMarks = new Map<string, string>()
  for (const row of listOf(raw.marks)) {
    const brand = str(row, 'brand')
    if (brand === '') continue
    const file = str(row, 'file')
    const width = num(row, 'width')
    const height = num(row, 'height')
    const variant = str(row, 'variant')
    if (file === '' || width === 0 || height === 0 || (variant !== 'white' && variant !== 'dark')) {
      const error = str(row, 'error')
      if (error !== '' && !refusedMarks.has(brand)) refusedMarks.set(brand, error)
      continue
    }
    held.push({
      id: str(row, 'id'),
      brand,
      ink: variant,
      src: MARKS + file,
      width,
      height,
      organisation: str(row, 'role') === 'organisation',
    })
  }
  const makers = held.filter((m) => !m.organisation)
  /* by name: a maker's register, or the dealership's own name, which is how Home asks for
     Northside's mark on the water */
  const marksFor = (register: string): readonly HeldMark[] =>
    held.filter((m) => namesTheSame(register, m.brand))

  const choose = (candidates: readonly HeldMark[], ink: Ink): MarkChoice | null => {
    const fit = candidates.find((m) => m.ink === ink)
    if (fit) return { drawn: true, mark: fit }
    const other = candidates[0]
    if (!other) return null
    return {
      drawn: false,
      because: `${other.brand}’s mark comes in ${other.ink} ink only, which ${
        ink === 'dark' ? 'cannot be printed on a white page' : 'cannot be read on a dark ground'
      }.`,
    }
  }

  const mark = (register: string | undefined, ink: Ink): MarkChoice => {
    const name = register?.trim() ?? ''
    if (name === '') return { drawn: false, because: 'No maker is named for this item.' }
    const chosen = choose(marksFor(name), ink)
    if (chosen) return chosen
    for (const [brand, error] of refusedMarks) {
      if (namesTheSame(name, brand)) return { drawn: false, because: `${brand}: ${error}.` }
    }
    return { drawn: false, because: 'No mark is held for this maker.' }
  }

  const organisation = (ink: Ink): MarkChoice =>
    choose(
      held.filter((m) => m.organisation),
      ink,
    ) ?? { drawn: false, because: 'The dealership’s own mark has not been added yet.' }

  const markFacts = (): { checked: number; held: number; files: number } => {
    const brands = new Set<string>(makers.map((m) => m.brand))
    for (const brand of refusedMarks.keys()) brands.add(brand)
    return {
      checked: brands.size,
      held: new Set(makers.map((m) => m.brand)).size,
      files: makers.length,
    }
  }

  return {
    rowCopy,
    modelPicture,
    hero,
    catalogue,
    picture: (item) => hero(item) ?? catalogue(item),
    forCover,
    forLine,
    notes: (item) => {
      const at = item.address?.trim() ?? ''
      return at === '' ? [] : ruling(at, item.row, 'note').flatMap((f) => f.differs)
    },
    heroById: (id) => heroPictures.find((p) => p.id === id) ?? null,
    heroes: () => heroPictures,
    marksFor,
    mark,
    organisation,
    markFacts,
    /* the ledgers this book reads hold no picture a dealer added: `withOwnPictures` lays those over */
    own: () => null,
    exactHeld: (item) => {
      const own = rowCopy(item)
      if (own) return own
      const model = modelPicture(item, 'catalogue')
      if (model?.exact) return model
      const h = hero(item)
      return h?.exact ? h : null
    },
  }
}
