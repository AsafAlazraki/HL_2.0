/* ============================================================
   THE ONE LEDGER THE LETTER DRAWS PICTURES FROM.

   A quote freezes its boat's picture as the MAKER'S OWN ADDRESS
   (`QuoteDef.subjectImage.src`), and `data/northside/images.json` is
   the only thing that can say whether this repository ships a copy of
   that address — the file under `public/seed-images`, its width and
   its height, one row per distinct address the price file carries.
   A row on a customer's letter leads with that copy where one is held,
   and says so in words where none is: a picture belongs only to the
   exact model it depicts (CLAUDE.md), and the address on the document
   IS that model's, so nothing here matches on a name and nothing
   stands in.

   IT RIDES IN THE BUNDLE, NOT A FETCH — the decision `src/screens/
   picker/pictures.ts`, `home/ledgers.ts` and `sheet/pictures.ts` each
   made for their own screen, and for the same reason: Entry's blue
   door is the only thing in this app that reads `data/northside/` over
   the network. It is written again here rather than imported from any
   of them because a screen's folder is its own and a reader shared
   between screens would be the first shared page piece; the reading
   is thirty lines.

   THE CRITIC'S FINDING ON THIS DIRECTION, answered here: C drew "a
   miniature of its own A4 cover from the document screen's render",
   and a miniature is either the document's own DOM scaled — the
   document's rule, and its reason for `@page` — or a second renderer.
   Scaling a three-page A4 DOM into a 28px row for every quote on a
   letter is too heavy for a row, so the row leads with the boat's
   held catalogue copy instead, and this file is the whole of how.

   A ROW THAT DOES NOT PARSE IS DROPPED RATHER THAN GUESSED: a
   generated file that changed shape draws the honest absence.
   ============================================================ */
import imagesRaw from '../../../data/northside/images.json?raw'

const SEED_IMAGES = `${import.meta.env.BASE_URL}seed-images/`

/** A picture this repository actually ships, at the size it ships it. */
export interface Held {
  src: string
  width: number
  height: number
  /** the maker's own address, kept so a caption can say where from */
  address: string
}

type Unknown = Record<string, unknown>

const str = (row: Unknown, key: string): string | null =>
  typeof row[key] === 'string' && row[key].trim() !== '' ? row[key].trim() : null
const num = (row: Unknown, key: string): number | null =>
  typeof row[key] === 'number' && Number.isFinite(row[key]) && row[key] > 0 ? row[key] : null

let images: Map<string, Held> | undefined

function readImages(): Map<string, Held> {
  const by = new Map<string, Held>()
  let parsed: unknown
  try {
    parsed = JSON.parse(imagesRaw)
  } catch {
    return by
  }
  const list = (parsed as Unknown | null)?.['images']
  if (!Array.isArray(list)) return by
  for (const row of list) {
    if (typeof row !== 'object' || row === null) continue
    const one = row as Unknown
    const address = str(one, 'address')
    const file = str(one, 'file')
    const width = num(one, 'width')
    const height = num(one, 'height')
    if (!address || !file || !width || !height) continue
    by.set(address, { src: SEED_IMAGES + file, width, height, address })
  }
  return by
}

/** The held copy of that address, or null for every address this
 *  repository does not ship — the maker's own host included, because
 *  a row that sometimes draws a picture and sometimes a hole is worse
 *  than one that says what it holds. */
export const heldCopy = (address: string | undefined): Held | null =>
  address === undefined || address === '' ? null : ((images ??= readImages()).get(address) ?? null)
