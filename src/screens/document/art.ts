/* ============================================================
   WHAT GOES ON A SHEET OF PAPER, AND WHAT IS SAID WHERE NOTHING CAN.

   THE SAME LADDER EVERY SCREEN IN THIS APP WALKS — photograph, then
   the maker's mark, then the name set in type — and it is written
   here rather than imported from the configurator's stage for one
   reason that is not tidiness: A MARK ON PAPER NEEDS DARK INK. The
   configurator draws its stage in a dark room and asks the marks
   ledger for the white variant; a white wordmark on this page is
   invisible. `docs/research/refs/document/notes.md` §6 counted it:
   eighteen rows, thirteen brands, five in dark AND white, six dark
   only, and Mercury published in WHITE INK ONLY — so a Mercury mark
   cannot sit on a white page at all, and on paper Mercury is a word.
   That is a different ladder with the same three rungs, and pretending
   otherwise would have put a hole on a customer's document.

   AND THE DEALER'S OWN MARK IS NOT IN THE LEDGER. §6 again: "Northside
   Marine's own mark is not in the ledger. A quote is letterhead, so
   this bites hardest here: a board that draws the dealer's logo is
   drawing an asset we cannot ship, and must say so." So the letterhead
   is the business's name set as type — the same answer Home gives at
   the head of its room — and the document says so once, in the
   provenance line, rather than drawing a grey rectangle where a logo
   would go. `docs/CUSTOMISATION.md` layer 2 is where a dealership
   uploads one, and it lands in that same place at the ceiling the
   stylesheet already sets.

   THE COVER PICTURE IS A BAND AND NEVER A BLEED, and that is measured
   rather than chosen. §6: A4 at 300 dpi is 2480 × 3508 px; five of the
   eight held heroes clear 2480 wide and NOT ONE of the catalogue
   copies or the heroes is 3508 px tall. So no held picture can fill an
   A4 page at print resolution, and a cover that tried would be
   enlarging somebody's photograph past its own pixels — which this
   repository does not do anywhere. The band's height is set in the
   stylesheet; what this file carries is the ceiling, so the caption
   can print what was held and what was drawn.

   THE TWO LEDGERS RIDE IN THE BUNDLE rather than being fetched, for
   the reason `src/screens/picker/pictures.ts` gives at length: Entry's
   blue door is the one thing in this app that reads the price file,
   and a second fetch here would leave a first visit with no network
   holding a document with no picture for a reason nobody could see.
   ============================================================ */
import imagesRaw from '../../../data/northside/images.json?raw'
import marksRaw from '../../../data/northside/marks-ledger.json?raw'

const SEED_IMAGES = `${import.meta.env.BASE_URL}seed-images/`
const MARKS = `${import.meta.env.BASE_URL}brand-marks/`

/** A picture this repository ships, at the size it ships it. */
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

/** A maker's wordmark, in the ink a white page needs. */
export interface Mark {
  src: string
  width: number
  height: number
  brand: string
}

/** What the cover draws for this hull, and why it draws that. */
export type CoverArt =
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
       the cover draws the honest absence rather than a broken box */
    return []
  }
  const list = key ? (parsed as Record<string, unknown>)?.[key] : parsed
  return Array.isArray(list)
    ? list.filter((r): r is Row => typeof r === 'object' && r !== null)
    : []
}

let pictures: Map<string, Held> | undefined
let marks: { dark: Mark[]; refused: Map<string, string> } | undefined

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

/** The marks a white page can carry, and the reason for each one it
 *  cannot. A row with no file at all carries the ledger's own error;
 *  a row that exists only in white ink is refused HERE, with the
 *  sentence that explains why paper is different from the dark room.  */
function readMarks(): { dark: Mark[]; refused: Map<string, string> } {
  const dark: Mark[] = []
  const refused = new Map<string, string>()
  const whiteOnly = new Map<string, Mark>()
  for (const row of rowsOf(marksRaw)) {
    const brand = str(row, 'brand')
    if (brand === '') continue
    const file = str(row, 'file')
    const width = num(row, 'width')
    const height = num(row, 'height')
    if (file === '' || width === 0 || height === 0) {
      const error = str(row, 'error')
      if (error !== '' && !refused.has(brand)) refused.set(brand, error)
      continue
    }
    const mark: Mark = { src: MARKS + file, width, height, brand }
    if (str(row, 'variant') === 'white') {
      whiteOnly.set(brand, mark)
      continue
    }
    dark.push(mark)
  }
  for (const [brand] of whiteOnly) {
    if (dark.some((m) => m.brand === brand)) continue
    refused.set(
      brand,
      'the only mark held for it is published in white ink, which cannot be printed on a white page',
    )
  }
  return { dark, refused }
}

/** A register's name and a maker's name are written by two different
 *  hands — "Highfield Inflatables" against "Highfield" — so a match is
 *  the same name, or the register's name beginning with the maker's
 *  followed by more words. Never a substring anywhere, which would
 *  pair a trailer maker with a boat maker. */
function namesTheSame(register: string, brand: string): boolean {
  const a = register.trim().toLowerCase()
  const b = brand.trim().toLowerCase()
  return a === b || a.startsWith(`${b} `)
}

/** The held copy of one address, or nothing. Nothing for every address
 *  this repository does not ship, INCLUDING the ones that would load
 *  from the maker's own host: a document that sometimes prints a
 *  photograph and sometimes prints a hole is worse than one that never
 *  prints one. */
export function heldPicture(address: string | undefined): Held | null {
  pictures ??= readPictures()
  if (address === undefined || address === '') return null
  return pictures.get(address) ?? null
}

/** The two rungs below a photograph: the mark a white page can carry,
 *  or the name in type with the reason. Narrower than `CoverArt` on
 *  purpose — this half of the ladder can never answer "photograph". */
export type MarkOnPaper =
  { kind: 'mark'; mark: Mark; because: string } | { kind: 'word'; because: string }

/** The maker's mark in dark ink, or the reason there is none. */
export function markOnPaper(register: string): MarkOnPaper {
  marks ??= readMarks()
  const mark = marks.dark.find((m) => namesTheSame(register, m.brand))
  if (mark) return { kind: 'mark', mark, because: '' }
  for (const [brand, error] of marks.refused) {
    if (namesTheSame(register, brand)) {
      return { kind: 'word', because: `No mark is printed for ${brand}: ${error}.` }
    }
  }
  return {
    kind: 'word',
    because:
      'No mark is held for this maker in an ink a white page can carry, so it is set in type.',
  }
}

/**
 * WHAT TO PUT ON THE COVER for this hull, down the ladder: the
 * photograph the row itself points at, then the maker's mark in the
 * ink paper needs, then the name set as type — each rung carrying the
 * reason the rung above it could not be taken.
 */
export function coverArt(address: string | undefined, register: string): CoverArt {
  const held = heldPicture(address)
  if (held) return { kind: 'photograph', held }

  const missing =
    address === undefined || address === ''
      ? 'This row carries no picture address at all, so nothing is printed and nothing is invented.'
      : 'The row names a picture and no copy of it is held here, so nothing stands in for it.'

  const fallback = markOnPaper(register)
  return fallback.kind === 'mark'
    ? { ...fallback, because: missing }
    : { kind: 'word', because: `${missing} ${fallback.because}` }
}

/** The host an address belongs to, for a caption. A malformed address
 *  says less rather than throwing. */
export function hostOf(address: string): string {
  try {
    return new URL(address).host
  } catch {
    return 'an address this file carries'
  }
}
