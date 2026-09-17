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
import imagesRaw from '../../../data/northside/images.json?raw'
import marksRaw from '../../../data/northside/marks-ledger.json?raw'

const SEED_IMAGES = `${import.meta.env.BASE_URL}seed-images/`
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
    })
  }
  return by
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
 * photograph the row itself points at, then the maker's mark in the
 * ink this dark room needs, then the name set as type — each step
 * carrying the reason the step above it could not be taken.
 */
export function stageArt(address: string | undefined, register: string): StageArt {
  const held = heldPicture(address)
  if (held) return { kind: 'photograph', held }

  marks ??= readMarks()
  const mark = marks.held.find((m) => namesTheSame(register, m.brand))
  const missing =
    address === undefined || address === ''
      ? 'This row carries no picture address at all, so nothing is drawn and nothing is invented.'
      : 'The row names a picture and no copy of it is held here, so nothing stands in for it.'
  if (mark) return { kind: 'mark', mark, because: missing }

  for (const [brand, error] of marks.refused) {
    if (namesTheSame(register, brand)) {
      return { kind: 'word', because: `${missing} ${brand}: ${error}.` }
    }
  }
  return {
    kind: 'word',
    because: `${missing} No mark is held for this maker in the ink a dark room needs, so the name is set in type.`,
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
