/* ============================================================
   WHAT STANDS ON THE STAGE, AND WHAT IS SAID WHERE NOTHING CAN.

   THE SWEEP'S RULE, §6, and it is the one every direction had to
   answer: "a second dealership replaces the photographs and the
   mark, so every direction must degrade photograph → mark →
   wordmark; a chapter head that NEEDS a photograph has no Stabicraft
   chapter." This is that ladder, as one function, so the screen has
   one thing to draw and one sentence to print.

   AND THE OTHER HALF OF §6: "the stage cannot answer the rail."
   Porsche swings ten cameras to the option you picked. The pack
   holds ONE picture per model, no interiors, no second angle, and a
   colourway render for very few — so a stage that responded to a
   motor would be promising a render pipeline that does not exist.
   This stage shows the HULL and changes only when the hull does,
   which on this screen is the finish chapter and nothing else.

   NOTHING IS ENLARGED. The ledger records the held copy's own pixel
   width and height, and they are handed to the stylesheet as the
   ceiling, exactly as entry and home do with theirs.

   THE TWO LEDGERS RIDE IN THE BUNDLE rather than being fetched, for
   the reason `src/screens/picker/pictures.ts` gives at length: Entry's
   blue door is the one thing in this app that reads the price file,
   and a second fetch here would make the first visit with no network
   a sheet with no pictures for a reason nobody could see.
   ============================================================ */
import type { CatalogueCtx, QuoteDef } from '@/domain/model'
import { depictionOfRow } from '@/domain/catalogue/depicts'
import heroesRaw from '../../../data/northside/heroes-ledger.json?raw'
import imagesRaw from '../../../data/northside/images.json?raw'
import marksRaw from '../../../data/northside/marks-ledger.json?raw'

const SEED_IMAGES = `${import.meta.env.BASE_URL}seed-images/`
const HERO_IMAGES = `${import.meta.env.BASE_URL}hero-images/`
const MARKS = `${import.meta.env.BASE_URL}brand-marks/`

/** A picture this repository actually ships, at the size it ships it. */
export interface Held {
  src: string
  width: number
  height: number
  /** the maker's own address, so a caption can name the host */
  address: string
  /** what the packer MEASURED the picture to be — a scene on the
   *  water, or a studio render. Never inferred from a file name. */
  verdict: string
  /** WHICH LEDGER IT CAME OUT OF. `catalogue` is one of the 329
   *  copies capped at long edge 1100 — a row, a tile, a small stage.
   *  `hero` is one of the eight resampled to 2560 for a stage and
   *  nothing else. */
  tier: 'catalogue' | 'hero'
  /** the narrower copies of the same picture, widest last, ready to
   *  be joined into a `srcset`. Empty on the catalogue tier, which
   *  ships one size. */
  widths: { src: string; width: number }[]
  /** what it shows, in the ledger's own words, where a ledger says.
   *  '' on the catalogue tier, whose rows carry no subject line. */
  subject: string
  /** WHAT THIS QUOTE'S ROW SAYS BEYOND THE MODEL THE PHOTOGRAPH IS OF,
   *  in the file's own words — "Side Console" on the Stacer 519, whose
   *  one photograph is drawn for both of its consoles. '' where the row
   *  is the model, and always on the catalogue tier, whose picture is
   *  the row's own. The caption says it (`say.ts`), so the picture
   *  never implies a version it may not show. */
  beyond: string
}

/** A maker's wordmark in the ink it is published in. */
export interface Mark {
  src: string
  width: number
  height: number
  brand: string
}

/** What the stage draws for one hull, and why it draws that. */
export type StageArt =
  | { kind: 'photograph'; held: Held }
  | { kind: 'mark'; mark: Mark; because: string }
  | { kind: 'word'; because: string }

type Row = Record<string, unknown>

const str = (row: Row, key: string): string =>
  typeof row[key] === 'string' ? (row[key] as string).trim() : ''
const num = (row: Row, key: string): number =>
  typeof row[key] === 'number' && Number.isFinite(row[key]) && (row[key] as number) > 0
    ? (row[key] as number)
    : 0

function rowsOf(raw: string, key?: string): Row[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    /* a generated file that will not parse is a generator problem;
       the stage draws the honest absence rather than a broken box */
    return []
  }
  const list = key ? (parsed as Record<string, unknown>)?.[key] : parsed
  return Array.isArray(list)
    ? list.filter((r): r is Row => typeof r === 'object' && r !== null)
    : []
}

let pictures: Map<string, Held> | undefined
let heroes: HeroRow[] | undefined
let marks: { held: Mark[]; refused: Map<string, string> } | undefined

function readPictures(): Map<string, Held> {
  const by = new Map<string, Held>()
  for (const row of rowsOf(imagesRaw, 'images')) {
    const address = str(row, 'address')
    const file = str(row, 'file')
    const width = num(row, 'width')
    const height = num(row, 'height')
    if (address === '' || file === '' || width === 0 || height === 0) continue
    by.set(address, {
      src: SEED_IMAGES + file,
      width,
      height,
      address,
      verdict: str(row, 'verdict') || 'unknown',
      tier: 'catalogue',
      widths: [],
      subject: '',
      beyond: '',
    })
  }
  return by
}

/* ============================================================
   THE STAGE TIER, WHICH IS THE OTHER HALF OF §6.

   `heroes-ledger.json` holds EIGHT photographs resampled to 2560 for
   a stage — four Highfields and four Stacers, each with the register
   and the model it depicts, its source page, its licence note and its
   sha256, plus the narrower copies `tools/seed/hero-widths.ts` cut
   under it. The catalogue tier this stage has been drawing since it
   was built is capped at long edge 1100 and is a ROW's picture: on
   the SP560 it is a top-down studio render on a white ground, and at
   1920 the boat the customer is buying came out 412 x 232 — 2.6% of
   the screen, on a direction whose own words are "the boat fills two
   thirds".

   SO THE LADDER GAINS A RUNG ABOVE THE ONE IT HAD: the model's own
   photograph on the water when the ledger holds one, then the
   catalogue copy, then the maker's mark, then the name set in type.
   Nothing is invented and nothing stands in for anything — a hull
   with no hero simply gets the rung below, which is exactly what the
   screen drew before.

   A HERO IS A SCENE BY CONSTRUCTION, which is why it is cropped
   rather than fitted. `tools/seed/pick-heroes.ts` runs `verdict.judge`
   over every candidate and takes the first judged `scene`, printing
   "every candidate judged a studio shot" and choosing NOTHING where
   none is; the catalogue ledger carries both kinds, which is why that
   tier keeps its per-row verdict.
   ============================================================ */

interface HeroRow extends Held {
  /** the register the boat it depicts is a row of */
  table: string
  /** the model it depicts, spelled as that register spells it */
  model: string
}

function readHeroes(): HeroRow[] {
  const out: HeroRow[] = []
  for (const row of rowsOf(heroesRaw)) {
    const file = str(row, 'file')
    const table = str(row, 'table')
    const model = str(row, 'model')
    const width = num(row, 'width')
    const height = num(row, 'height')
    if (file === '' || table === '' || model === '' || width === 0 || height === 0) continue
    const widths: { src: string; width: number }[] = []
    for (const copy of Array.isArray(row['widths']) ? row['widths'] : []) {
      if (typeof copy !== 'object' || copy === null) continue
      const one = copy as Row
      const its = str(one, 'file')
      const w = num(one, 'width')
      if (its === '' || w === 0 || w >= width) continue
      widths.push({ src: HERO_IMAGES + its, width: w })
    }
    widths.push({ src: HERO_IMAGES + file, width })
    out.push({
      src: HERO_IMAGES + file,
      width,
      height,
      address: str(row, 'pageUrl') || str(row, 'url'),
      verdict: 'scene',
      tier: 'hero',
      widths: widths.toSorted((a, b) => a.width - b.width),
      subject: str(row, 'subject'),
      beyond: '',
      table,
      model,
    })
  }
  return out
}

/**
 * THE STAGE PHOTOGRAPH FOR THE HULL THIS QUOTE IS ROOTED ON, or
 * nothing.
 *
 * The match is the register AND the model, against the row the
 * document is actually rooted on — never the label, which on this
 * file reads `Highfield - SP560 (PVC) W-W-WB` and carries the finish
 * and the colourway as well as the model.
 *
 * WHICH MODEL A PHOTOGRAPH IS OF IS ONE RULE FOR THE WHOLE APP,
 * `depictionOfRow` in `@/domain/catalogue/depicts` (the M2-close
 * critique, finding 11). This stage used to demand that a name of the
 * row EQUAL the ledger's model, while Home took the model standing as a
 * run of words inside the name — and Stacer files its models inside a
 * longer name (`Stacer - 519 Sea Ranger SDF (Side Console)`), so every
 * Stacer photograph Home could sell was a wordmark here. Now Home, the
 * picker and this stage ask the same function, and the row's words
 * beyond the model ride along as `beyond` for the caption to say.
 */
export function hullHero(ctx: CatalogueCtx, quote: QuoteDef): Held | null {
  heroes ??= readHeroes()
  const table = ctx.entities[quote.rootTableId]
  if (!table) return null
  const row = (ctx.rowsByEntity[quote.rootTableId] ?? []).find((r) => r.id === quote.rootRowId)
  if (!row) return null

  const found = depictionOfRow(heroes, table, row)
  if (!found) return null
  const { table: _register, model: _model, ...held } = found.picture
  return { ...held, beyond: found.beyond }
}

function readMarks(): { held: Mark[]; refused: Map<string, string> } {
  const held: Mark[] = []
  const refused = new Map<string, string>()
  for (const row of rowsOf(marksRaw)) {
    const brand = str(row, 'brand')
    if (brand === '') continue
    const file = str(row, 'file')
    const width = num(row, 'width')
    const height = num(row, 'height')
    /* THE DARK ROOM WANTS WHITE INK. A maker publishes the ink it
       publishes; a dark wordmark on this screen's ground is a smudge,
       and recolouring somebody else's mark is not an option a ledger
       can offer. */
    if (file === '' || width === 0 || height === 0) {
      const error = str(row, 'error')
      if (error !== '' && !refused.has(brand)) refused.set(brand, error)
      continue
    }
    if (str(row, 'variant') !== 'white') continue
    held.push({ src: MARKS + file, width, height, brand })
  }
  return { held, refused }
}

/** A register's name and a maker's name are written by two different
 *  hands — "Highfield Inflatables" against "Highfield" — so a match
 *  is the same name, or the register's name beginning with the
 *  maker's followed by more words. Never a substring anywhere, which
 *  would pair a trailer maker with a boat maker. */
function namesTheSame(register: string, brand: string): boolean {
  const a = register.trim().toLowerCase()
  const b = brand.trim().toLowerCase()
  return a === b || a.startsWith(`${b} `)
}

/** The held copy of one address, or nothing. Nothing for every
 *  address this repository does not ship, INCLUDING the ones that
 *  would load from the maker's own host: a stage that sometimes
 *  draws a photograph and sometimes draws a hole is worse than one
 *  that never draws one, and two of the hosts in this file refuse a
 *  browser outright. */
export function heldPicture(address: string | undefined): Held | null {
  pictures ??= readPictures()
  if (address === undefined || address === '') return null
  return pictures.get(address) ?? null
}

/**
 * WHAT TO PUT ON THE STAGE for this hull, down the ladder: the
 * model's own photograph on the water where the hero ledger holds
 * one, then the catalogue copy the row itself points at, then the
 * maker's mark in the ink this dark room needs, then the name set as
 * type — each step carrying the reason the step above it could not be
 * taken.
 */
export function stageArt(
  address: string | undefined,
  register: string,
  hero: Held | null = null,
): StageArt {
  if (hero) return { kind: 'photograph', held: hero }

  const held = heldPicture(address)
  if (held) return { kind: 'photograph', held }

  marks ??= readMarks()
  const mark = marks.held.find((m) => namesTheSame(register, m.brand))
  /* IN A DEALER'S WORDS. These read "This row carries no picture
     address…" and "The row names a picture and no copy of it is held
     here" — the ledger's plumbing, on the stage of the sale (M2-close
     critique #4). The fact is the same: no photograph of this boat is
     held, and nothing is drawn in its place. */
  const missing =
    address === undefined || address === ''
      ? 'The price file names no picture for this boat'
      : 'No photograph of this boat is held yet'
  if (mark) return { kind: 'mark', mark, because: `${missing}, so its maker’s mark is shown.` }

  for (const [brand, error] of marks.refused) {
    if (namesTheSame(register, brand)) {
      return { kind: 'word', because: `${missing}. ${brand}: ${error}.` }
    }
  }
  return {
    kind: 'word',
    because: `${missing}, and no mark for its maker is held either, so the name is set in type.`,
  }
}

/** The host an address belongs to, for a caption. A malformed
 *  address says less rather than throwing. */
export function hostOf(address: string): string {
  try {
    return new URL(address).host
  } catch {
    return 'an address this file carries'
  }
}
