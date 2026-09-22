/* ============================================================
   THE TWO LEDGERS THE SHEET DRAWS PICTURES FROM.

   `data/northside/images.json` is one row per distinct picture address
   the price file carries — the maker's own address, the licence note,
   the verdict measured off the pixels, and, where a copy was obtained,
   the file under `public/seed-images` with its width and height. It is
   the only thing that can answer "do we ship the bytes for this
   address", which is what an image CELL asks at 24, 32 or 44 px and
   what a gallery card asks at its full width.

   `marks-ledger.json` records the makers whose wordmark was looked for
   and which ink each is held in. A gallery card with no held picture
   for its model draws the maker's white mark on the dark plate, or the
   model's name set in type where no mark is held — never a stand-in
   picture from a sibling row.

   BOTH RIDE IN THE BUNDLE, NOT A FETCH. Entry's blue door is the only
   thing in this app that reads `data/northside/` over the network;
   every other screen reads this browser (docs/SCREENS.md). So the
   ledgers come in through Vite's `?raw` into this route's own chunk —
   the same decision `src/screens/picker/pictures.ts` and
   `src/screens/home/ledgers.ts` each made for their own screen, and
   for the same reason. It is written again here rather than imported
   from either, because a screen's folder is its own and a reader
   shared between two screens is the first shared page piece this
   repository would have; the reading is forty lines.

   A ROW THAT DOES NOT PARSE IS DROPPED RATHER THAN GUESSED: a
   generated file that changed shape draws the honest absence — the
   words "held as a link" in the cell — instead of a broken picture.
   ============================================================ */
import imagesRaw from '../../../data/northside/images.json?raw'
import marksRaw from '../../../data/northside/marks-ledger.json?raw'

const SEED_IMAGES = `${import.meta.env.BASE_URL}seed-images/`
const MARKS = `${import.meta.env.BASE_URL}brand-marks/`

/** A picture this repository actually ships, at the size it ships it. */
export interface Held {
  at: string
  w: number
  h: number
  address: string
  /** scene or studio, as the packer measured it off the pixels */
  verdict: string
}

/** A maker's wordmark, held in white ink for a dark ground. */
export interface HeldMark {
  brand: string
  at: string
  w: number
  h: number
}

type Unknown = Record<string, unknown>

const str = (row: Unknown, key: string): string | null =>
  typeof row[key] === 'string' && row[key].trim() !== '' ? row[key].trim() : null
const num = (row: Unknown, key: string): number | null =>
  typeof row[key] === 'number' && Number.isFinite(row[key]) && row[key] > 0 ? row[key] : null

function rowsOf(raw: string, under?: string): Unknown[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  const list = under ? (parsed as Unknown | null)?.[under] : parsed
  if (!Array.isArray(list)) return []
  return list.filter((row): row is Unknown => typeof row === 'object' && row !== null)
}

let images: Map<string, Held> | undefined
let marks: HeldMark[] | undefined

function readImages(): Map<string, Held> {
  const by = new Map<string, Held>()
  for (const row of rowsOf(imagesRaw, 'images')) {
    const address = str(row, 'address')
    const file = str(row, 'file')
    const w = num(row, 'width')
    const h = num(row, 'height')
    if (!address || !file || !w || !h) continue
    by.set(address, {
      at: SEED_IMAGES + file,
      w,
      h,
      address,
      verdict: str(row, 'verdict') ?? 'unknown',
    })
  }
  return by
}

function readMarks(): HeldMark[] {
  const out: HeldMark[] = []
  for (const row of rowsOf(marksRaw)) {
    const brand = str(row, 'brand')
    const file = str(row, 'file')
    const w = num(row, 'width')
    const h = num(row, 'height')
    if (!brand || !file || !w || !h || str(row, 'variant') !== 'white') continue
    out.push({ brand, at: MARKS + file, w, h })
  }
  return out
}

/** Does this repository hold a copy of that address, and how big is
 *  it? `null` for every address it does not ship — including the ones
 *  that would load from the maker's own host, because a cell that
 *  sometimes draws a picture and sometimes draws a hole is worse than
 *  one that says what it holds. */
export const heldCopy = (address: string | undefined): Held | null =>
  address === undefined || address === '' ? null : ((images ??= readImages()).get(address) ?? null)

/** The white mark held for the maker a register is named after — the
 *  price file calls the register "Highfield Inflatables" and the
 *  ledger calls the maker "Highfield", so the match is the same name
 *  or the register's name beginning with the maker's and a space. */
export function whiteMarkFor(register: string): HeldMark | null {
  const a = register.trim().toLowerCase()
  for (const m of (marks ??= readMarks())) {
    const b = m.brand.trim().toLowerCase()
    if (a === b || a.startsWith(`${b} `)) return m
  }
  return null
}
