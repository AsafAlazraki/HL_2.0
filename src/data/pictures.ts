/* ============================================================
   EVERY PICTURE OF A BOAT, AND EVERY MAKER'S MARK — ONE READER.

   THE COMPONENTS CRITIQUE, BLOCKER 3 (2026-09-28). The Stacer 519 Sea
   Ranger SDF's own photograph, `hero-images/stacer-519-sea-ranger-…`,
   was drawn on the picker, the build's stage, Home and the Quotes
   register, and said to be missing on three screens: the cascade ("No
   picture of this boat is held yet"), Customers ("no photograph held")
   and the paper, whose cover printed Stacer's logo on a pale box while
   the note beside it said "no copy of it is held here". The ledgers
   were right. Each screen read them for itself, and three asked a
   narrower question than the build: the paper and Customers asked the
   catalogue ledger alone, by the row's address, and the 519's address
   is one no copy is held of; the cascade asked the heroes ledger but
   demanded that a name of the row EQUAL the model, which "Stacer - 519
   Sea Ranger SDF (Centre Console)" never does. So the plan's one
   choreography — the picker's photograph becomes the stage becomes the
   paper's cover — ended on a logo.

   SO THE PICTURE IS READ HERE, ONCE, and every screen gets the same
   answer to the same question:

     · THE BOAT'S PICTURE (`pictureOf`, `pictureOfQuote`) — down the
       build's own ladder: the model's photograph on the water where the
       heroes ledger holds one, matched by the app's one rule for which
       boat a photograph is of (`depictionOf`, @/domain/catalogue/
       depicts); then the catalogue copy of the exact address the row
       carries; then nothing. A quote is asked by its row's names where
       the catalogue is open, and by the label it froze where it is not
       — the label answers with the same picture (`depicts.test.ts` asks
       both of every boat row), so the paper still renders from the
       quote alone.
     · THE MODEL'S PHOTOGRAPH ALONE (`heroOfQuote`) and THE ROW'S OWN
       COPY ALONE (`copyOf`), for a screen that draws both: the
       cascade's blurred ground is the model on the water and its card
       is the exact colourway where that is held.
     · THE MAKER'S MARK IN AN INK (`markOf`) — white for a dark ground,
       dark for paper — or the reason there is none, in a sentence.

   What a screen DRAWS with the answer — a blurred ground, a cover band,
   a well in a row — and the words it says about it stay the screen's.
   What it can no longer do is get a different answer.

   WHY src/data. The three ledgers are data the pack ships beside the
   price file. They ride in the bundle through Vite's `?raw` rather than
   being fetched, for the reason `src/screens/picker/pictures.ts` gives
   at length: Entry's door is the one thing in this app that reads
   `data/northside/` over the network, and a fetch here would leave a
   first visit with no network holding pictures for a reason nobody
   could see. The match is src/domain's, handed the rows.

   A ROW THAT DOES NOT PARSE IS DROPPED RATHER THAN GUESSED: a generated
   file that changed shape draws the next rung down, never a broken image.
   ============================================================ */
import { depictionOf, namesOfRow } from '@/domain/catalogue/depicts'
import type { EntityDef, QuoteDef, RowData } from '@/domain/model'
import heroesRaw from '../../data/northside/heroes-ledger.json?raw'
import imagesRaw from '../../data/northside/images.json?raw'
import marksRaw from '../../data/northside/marks-ledger.json?raw'

/** Where a held copy is served from — `public/`, so the address is the
 *  deployment's own base in front of the ledger's file name. */
const SEED_IMAGES = `${import.meta.env.BASE_URL}seed-images/`
const HERO_IMAGES = `${import.meta.env.BASE_URL}hero-images/`
const MARKS = `${import.meta.env.BASE_URL}brand-marks/`

/** A picture this repository ships, at the size it ships it. Nothing is
 *  ever drawn larger than `width` × `height`. */
export interface HeldPicture {
  src: string
  width: number
  height: number
  /** the maker's own address (or the page a photograph was read off), so
   *  a caption can name the host */
  address: string
  /** what the packer MEASURED the picture to be — `scene` on the water,
   *  `studio` cut out on white. Never inferred from a file name. */
  verdict: string
  /** `hero`: the model's photograph on the water, one per model, resampled
   *  to 2,560 for a stage. `catalogue`: the row's own copy, capped at long
   *  edge 1,100 — the exact colourway the row is written for. */
  tier: 'hero' | 'catalogue'
  /** the narrower copies of the same picture, widest last and the held
   *  copy itself at the end, for a `srcset`. Empty on the catalogue tier,
   *  which ships one size. */
  widths: { src: string; width: number }[]
  /** what it shows, in the heroes ledger's own words ("Stacer 519 Sea
   *  Ranger SDF on the water"); '' on the catalogue tier */
  subject: string
  /** the model it depicts, spelled as its register spells it; '' on the
   *  catalogue tier, whose picture is the row's own */
  model: string
}

/** The ink a mark is drawn in: white for a dark ground, dark for paper. */
export type Ink = 'white' | 'dark'

/** A maker's wordmark, in the ink the ledger holds it in. */
export interface HeldMark {
  src: string
  width: number
  height: number
  brand: string
  ink: Ink
}

/** The mark to draw, or the reason there is none — a sentence, printed
 *  where the mark would have been rather than leaving a hole. */
export type MarkChoice = { drawn: true; mark: HeldMark } | { drawn: false; because: string }

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
    return []
  }
  const list = key ? (parsed as Row | null)?.[key] : parsed
  return Array.isArray(list)
    ? list.filter((r): r is Row => typeof r === 'object' && r !== null)
    : []
}

/* ---------------------------------------------------------- */
/* The three ledgers, read once                                */
/* ---------------------------------------------------------- */

/** A hero as the ledger files it, with the register it depicts a row of —
 *  how the match is made, and never something a reader needs. */
interface HeroRow extends HeldPicture {
  table: string
}

let copies: Map<string, HeldPicture> | undefined
let heroes: HeroRow[] | undefined
let marks: { held: HeldMark[]; refused: Map<string, string> } | undefined

function readCopies(): Map<string, HeldPicture> {
  const by = new Map<string, HeldPicture>()
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
      model: '',
    })
  }
  return by
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
      const its = str(copy as Row, 'file')
      const w = num(copy as Row, 'width')
      if (its === '' || w === 0 || w >= width) continue
      widths.push({ src: HERO_IMAGES + its, width: w })
    }
    widths.push({ src: HERO_IMAGES + file, width })
    out.push({
      src: HERO_IMAGES + file,
      width,
      height,
      address: str(row, 'pageUrl') || str(row, 'url'),
      /* a scene by construction: `tools/seed/pick-heroes.ts` takes the
         first candidate `verdict.judge` calls a scene, and none where
         none is */
      verdict: 'scene',
      tier: 'hero',
      widths: widths.toSorted((a, b) => a.width - b.width),
      subject: str(row, 'subject'),
      model,
      table,
    })
  }
  return out
}

function readMarks(): { held: HeldMark[]; refused: Map<string, string> } {
  const held: HeldMark[] = []
  const refused = new Map<string, string>()
  for (const row of rowsOf(marksRaw)) {
    const brand = str(row, 'brand')
    if (brand === '') continue
    const file = str(row, 'file')
    const width = num(row, 'width')
    const height = num(row, 'height')
    const variant = str(row, 'variant')
    if (file === '' || width === 0 || height === 0 || (variant !== 'white' && variant !== 'dark')) {
      /* the maker was looked for and not found, with the ledger's own
         reason — Stabicraft's reads "no public wordmark verified" */
      const error = str(row, 'error')
      if (error !== '' && !refused.has(brand)) refused.set(brand, error)
      continue
    }
    held.push({ src: MARKS + file, width, height, brand, ink: variant })
  }
  return { held, refused }
}

/* ---------------------------------------------------------- */
/* The questions                                               */
/* ---------------------------------------------------------- */

/** The row's own copy: the one held of this exact address, or nothing —
 *  for every address this repository does not ship, the maker's own host
 *  included, because a screen that sometimes draws a picture and
 *  sometimes a hole is worse than one that says what it holds. */
export function copyOf(address: string | undefined): HeldPicture | null {
  const at = address?.trim() ?? ''
  if (at === '') return null
  return (copies ??= readCopies()).get(at) ?? null
}

/** The model's photograph on the water, for a row of `tableId` known by
 *  `names`, or nothing. The longest model answers first, and a model never
 *  answers for a longer one it is only the start of (`depictionOf`). */
export function heroOf(tableId: string, names: readonly string[]): HeldPicture | null {
  const found = depictionOf((heroes ??= readHeroes()), tableId, names)
  if (!found) return null
  const { table: _register, ...held } = found.picture
  return held
}

/** The boat's picture, down the ladder: the model on the water, then the
 *  row's own copy, then nothing. */
export function pictureOf(
  tableId: string,
  names: readonly string[],
  address: string | undefined,
): HeldPicture | null {
  return heroOf(tableId, names) ?? copyOf(address)
}

/** The only parts of the catalogue a quote's picture is read against. */
export interface CatalogueRows {
  entities: Record<string, EntityDef | undefined>
  rowsByEntity: Record<string, readonly RowData[] | undefined>
}

/** The names a quote's boat goes by: its row's, where the catalogue is
 *  open and still holds the row; the label it froze, where it is not. */
function namesOfQuote(quote: QuoteDef, catalogue?: CatalogueRows): string[] {
  const table = catalogue?.entities[quote.rootTableId]
  const row = catalogue?.rowsByEntity[quote.rootTableId]?.find((r) => r.id === quote.rootRowId)
  if (table && row) return namesOfRow(table, row)
  return quote.subjectLabel.trim() === '' ? [] : [quote.subjectLabel]
}

/** The model's photograph on the water, for the boat a quote is written
 *  against, or nothing. */
export const heroOfQuote = (quote: QuoteDef, catalogue?: CatalogueRows): HeldPicture | null =>
  heroOf(quote.rootTableId, namesOfQuote(quote, catalogue))

/** THE BOAT'S PICTURE for a quote — the answer the build's stage draws,
 *  and so the one the cascade, Customers and the paper draw too. */
export const pictureOfQuote = (quote: QuoteDef, catalogue?: CatalogueRows): HeldPicture | null =>
  pictureOf(quote.rootTableId, namesOfQuote(quote, catalogue), quote.subjectImage?.src)

/** The narrower copies as a `srcset`, or nothing for a picture held at one size. */
export const srcSetOf = (held: HeldPicture): string | undefined =>
  held.widths.length > 1 ? held.widths.map((w) => `${w.src} ${w.width}w`).join(', ') : undefined

/** A register's name and a maker's name are written by two different
 *  hands — "Highfield Inflatables" against "Highfield" — so a match is the
 *  same name, or the register's name beginning with the maker's and a
 *  space. Never a substring anywhere, which would pair a trailer maker
 *  with a boat maker. */
function namesTheSame(register: string, brand: string): boolean {
  const a = register.trim().toLowerCase()
  const b = brand.trim().toLowerCase()
  return a === b || a.startsWith(`${b} `)
}

/**
 * THE MAKER'S MARK IN THE INK THIS GROUND NEEDS, or why there is none.
 * Recolouring somebody else's mark is not something a ledger can offer,
 * so a maker held only in the other ink is refused with that reason —
 * Mercury publishes white ink alone, and white ink cannot be printed on a
 * white page.
 */
export function markOf(register: string | undefined, ink: Ink): MarkChoice {
  const name = register?.trim() ?? ''
  if (name === '') return { drawn: false, because: 'No maker is named for this boat.' }
  marks ??= readMarks()
  const held = marks.held.filter((m) => namesTheSame(name, m.brand))
  const fit = held.find((m) => m.ink === ink)
  if (fit) return { drawn: true, mark: fit }
  const other = held[0]
  if (other) {
    return {
      drawn: false,
      because: `${other.brand}’s mark is held in ${other.ink} ink only, which ${
        ink === 'dark' ? 'cannot be printed on a white page' : 'cannot be read on a dark ground'
      }.`,
    }
  }
  for (const [brand, error] of marks.refused) {
    if (namesTheSame(name, brand)) return { drawn: false, because: `${brand}: ${error}.` }
  }
  return { drawn: false, because: 'No mark is held for this maker.' }
}

/** The mark for a dark ground — the file's blue, a dark well — in white ink, or why not. */
export const markOnDark = (register: string | undefined): MarkChoice => markOf(register, 'white')

/** The mark for paper, in dark ink, or why not. */
export const markOnPaper = (register: string | undefined): MarkChoice => markOf(register, 'dark')

/** The host an address belongs to, for a caption. A malformed address
 *  says less rather than throwing. */
export function hostOf(address: string): string {
  try {
    return new URL(address).host
  } catch {
    return 'an address this file carries'
  }
}
