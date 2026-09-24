/* ============================================================
   THE TWO LEDGERS THIS SCREEN DRAWS PICTURES FROM.

   `data/northside/heroes-ledger.json` records the eight stage
   photographs — the table and model each one depicts, the held copy's
   file name and its pixel size — and `marks-ledger.json` records the
   thirteen makers whose wordmark was looked for, the twelve that were
   found, and the one that was not. Both are provenance: address,
   page, licence note and sha256 per row. Nothing here invents a
   picture, and nothing substitutes one picture for another.

   WHY THEY ARE READ AT BUILD AND NOT FETCHED. Everything else under
   `data/northside/` is fetched once and then kept in this browser
   (`@/data/pack/boot`), and the promise that the second visit reads
   nothing over the network is a promise a screen can break by asking
   for one more file on every paint. These two ledgers are 26 rows
   between them, so they ride along in the bundle through Vite's
   `?raw` import — the same bytes, from the same single source, with
   no second copy in `public/` to go stale.

   A ROW THAT DOES NOT PARSE IS DROPPED RATHER THAN GUESSED. The
   ledgers are generated files, so a malformed row means the generator
   changed; the screen then draws the honest absence (a flat panel, a
   name set in type) instead of a broken picture.
   ============================================================ */
import heroesRaw from '../../../data/northside/heroes-ledger.json?raw'
import marksRaw from '../../../data/northside/marks-ledger.json?raw'
import { depictionOf, firstRowDepicted } from '@/domain/catalogue/depicts'
import type { EntityDef, RowData } from '@/domain/model'

/** Where the held copies are served from — `public/`, so the address
 *  is the deployment's base plus the ledger's own file name. */
const HEROES = `${import.meta.env.BASE_URL}hero-images/`
const MARKS = `${import.meta.env.BASE_URL}brand-marks/`

/** One stage photograph, as the ledger holds it. */
export interface HeldPicture {
  id: string
  /** what it shows, in words — the alt text a reader is given */
  subject: string
  /** the register the boat it depicts is a row of */
  table: string
  /** the model it depicts, spelled as that register spells it */
  model: string
  /** the address the held copy is served at */
  src: string
  /** the held copy's own pixel size. Nothing is ever drawn past it. */
  width: number
  height: number
  /**
   * THE NARROWER COPIES OF THE SAME PICTURE, widest last, ready to be
   * joined into a `srcset` — the held copy plus whatever
   * `tools/seed/hero-widths.ts` resampled under it. A ledger with none
   * hands back the held copy alone, which is what the ledger said
   * before the copies existed and is still true of a second
   * dealership's first upload.
   */
  widths: { src: string; width: number }[]
}

/** One maker's wordmark, as the ledger holds it. */
export interface HeldMark {
  id: string
  brand: string
  /** the ink it is drawn in: 'dark' for a light ground, 'white' for a
   *  dark one. A maker may hold one, both, or neither. */
  variant: string
  src: string
  width: number
  height: number
}

/** The ground a mark is asked to sit on, which decides which ink it
 *  needs. */
export type Ground = 'paper' | 'dark'

/** Either the mark to draw, or the reason there is none to draw —
 *  which is a sentence, and is printed where the mark would have been
 *  rather than leaving a hole in the row. */
export type MarkChoice = { drawn: true; mark: HeldMark } | { drawn: false; because: string }

type Unknown = Record<string, unknown>

const str = (row: Unknown, key: string): string | null =>
  typeof row[key] === 'string' && row[key].trim() !== '' ? row[key].trim() : null

const num = (row: Unknown, key: string): number | null =>
  typeof row[key] === 'number' && Number.isFinite(row[key]) && row[key] > 0 ? row[key] : null

function rowsOf(raw: string): Unknown[] {
  const parsed: unknown = JSON.parse(raw)
  if (!Array.isArray(parsed)) return []
  return parsed.filter((row): row is Unknown => typeof row === 'object' && row !== null)
}

/** The narrower copies recorded beside a held picture, widest last and
 *  with the held copy itself at the end. A malformed row is dropped
 *  rather than guessed, exactly as a malformed hero is. */
function readWidths(row: Unknown, file: string, width: number): { src: string; width: number }[] {
  const listed = Array.isArray(row['widths']) ? row['widths'] : []
  const out: { src: string; width: number }[] = []
  for (const copy of listed) {
    if (typeof copy !== 'object' || copy === null) continue
    const one = copy as Unknown
    const its = str(one, 'file')
    const w = num(one, 'width')
    if (!its || !w || w >= width) continue
    out.push({ src: HEROES + its, width: w })
  }
  out.push({ src: HEROES + file, width })
  return out.toSorted((a, b) => a.width - b.width)
}

function readHeroes(raw: string): HeldPicture[] {
  const out: HeldPicture[] = []
  for (const row of rowsOf(raw)) {
    const id = str(row, 'id')
    const subject = str(row, 'subject')
    const table = str(row, 'table')
    const model = str(row, 'model')
    const file = str(row, 'file')
    const width = num(row, 'width')
    const height = num(row, 'height')
    if (!id || !subject || !table || !model || !file || !width || !height) continue
    out.push({
      id,
      subject,
      table,
      model,
      src: HEROES + file,
      width,
      height,
      widths: readWidths(row, file, width),
    })
  }
  return out
}

function readMarks(raw: string): { held: HeldMark[]; refused: Map<string, string> } {
  const held: HeldMark[] = []
  /* the makers that were looked for and not found, by brand, with the
     ledger's own reason — Stabicraft's row reads "no public wordmark
     verified" and that is the sentence the shelf prints */
  const refused = new Map<string, string>()
  for (const row of rowsOf(raw)) {
    const brand = str(row, 'brand')
    if (!brand) continue
    const file = str(row, 'file')
    const id = str(row, 'id')
    const variant = str(row, 'variant')
    const width = num(row, 'width')
    const height = num(row, 'height')
    if (!file || !id || !variant || !width || !height) {
      const error = str(row, 'error')
      if (error && !refused.has(brand)) refused.set(brand, error)
      continue
    }
    held.push({ id, brand, variant, src: MARKS + file, width, height })
  }
  return { held, refused }
}

const heroes = readHeroes(heroesRaw)
const marks = readMarks(marksRaw)

/** Every stage photograph the ledger holds, in the ledger's order. */
export const heldPictures = (): readonly HeldPicture[] => heroes

/** One photograph by the id the ledger gives it, or nothing. A screen
 *  names the picture it wants; it never picks one by rank, by size or
 *  by whatever happens to be first. */
export const pictureById = (id: string): HeldPicture | undefined => heroes.find((h) => h.id === id)

/**
 * THE PICTURE FOR ONE BOAT ON A FILED QUOTE, OR NOTHING AT ALL.
 *
 * A quote freezes the register it was written against (`rootTableId`)
 * and the label that register gave the row ("Highfield - SP560 PVC
 * …"), and never a picture this screen could draw: `subjectImage` is
 * the MAKER'S own address, and resolving it to a held copy needs the
 * 4,768-row image ledger, which is 309 KB and belongs to the two
 * screens that already carry it. So a card on Home asks the eight
 * heroes this screen already has in the bundle, and gets an answer for
 * the models they depict and no answer at all for every other.
 *
 * A PICTURE BELONGS ONLY TO THE EXACT MODEL IT DEPICTS (CLAUDE.md), and
 * WHICH model a picture depicts is one rule for the whole app,
 * `depictionOf` in `@/domain/catalogue/depicts` — the rule the build's
 * stage and the picker's plate ask too, so a photograph Home sells is
 * the photograph the sale draws (the M2-close critique, finding 11:
 * this screen and the build used to answer it two ways, and the Stacer
 * 519 was photographed here and a wordmark there). `PA600` never
 * answers for `PA600X`; the longest model wins where two could match.
 * The label answers exactly as the row would: `depicts.test.ts` asks
 * both of every boat row in the file.
 */
export function pictureForSubject(tableId: string, label: string): HeldPicture | undefined {
  if (label.trim() === '') return undefined
  return depictionOf(heroes, tableId, [label])?.picture
}

/**
 * THE ROW A PHOTOGRAPH OPENS ON — the first version of its boat the file
 * still sells, by the same rule the build draws it by. Home's plate uses
 * it to open the picker AT the boat in the photograph rather than at the
 * top of its maker's list (the M2-close critique, finding 18), so the
 * photograph a dealer presses is the photograph the sale then stands on.
 */
export const rowPictured = (
  picture: HeldPicture,
  table: EntityDef,
  rows: readonly RowData[],
): RowData | undefined => firstRowDepicted(heroes, picture, table, rows)

/** Every mark held for a maker, whatever ink it is drawn in. */
export const marksFor = (register: string): readonly HeldMark[] =>
  marks.held.filter((m) => namesTheSame(register, m.brand))

/**
 * A register's name and a maker's name are written by two different
 * hands: the price file calls Highfield's register "Highfield
 * Inflatables" and the ledger calls the maker "Highfield". So a match
 * is the same name, or the register's name beginning with the maker's
 * followed by more words. Never a substring anywhere, which would pair
 * "Stacer Trailers" with a boat maker.
 */
function namesTheSame(register: string, brand: string): boolean {
  const a = register.trim().toLowerCase()
  const b = brand.trim().toLowerCase()
  return a === b || a.startsWith(`${b} `)
}

/**
 * THE MARK TO DRAW ON THIS GROUND, OR THE REASON THERE IS NONE.
 *
 * The ledger holds two gaps and this is where both are answered, in
 * words rather than with a hole:
 *
 *   · A MAKER WITH NO MARK AT ALL. Stabicraft's row records "no public
 *     wordmark verified", so its name is set in type at the size the
 *     marks are drawn and the ledger's own reason is printed under the
 *     shelf. That is true, and a blank cell would not be.
 *
 *   · A MAKER HELD IN ONE INK ONLY. Mercury's mark is held in white
 *     ink alone, because white ink is what Mercury publishes. On a
 *     light ground white ink is invisible, so it is refused with that
 *     reason and the name is set in type instead. Recolouring somebody
 *     else's mark is not an option a ledger can offer.
 */
export function markFor(register: string, ground: Ground): MarkChoice {
  const wanted = ground === 'paper' ? 'dark' : 'white'
  const held = marksFor(register)
  const fit = held.find((m) => m.variant === wanted)
  if (fit) return { drawn: true, mark: fit }

  const other = held[0]
  if (other) {
    return {
      drawn: false,
      because: `${other.brand}'s mark is held in ${other.variant} ink only, so the name is set in type here.`,
    }
  }

  for (const [brand, error] of marks.refused) {
    if (namesTheSame(register, brand)) return { drawn: false, because: `${brand}: ${error}.` }
  }
  return { drawn: false, because: 'No mark has been looked for under that name.' }
}

/** What the shelf says about itself: how many makers were checked, how
 *  many are held and how many files that took. Counted off the ledger,
 *  never typed. */
export function markLedgerFacts(): { checked: number; held: number; files: number } {
  const brands = new Set<string>()
  const withMark = new Set<string>()
  for (const m of marks.held) {
    brands.add(m.brand)
    withMark.add(m.brand)
  }
  for (const brand of marks.refused.keys()) brands.add(brand)
  return { checked: brands.size, held: withMark.size, files: marks.held.length }
}
