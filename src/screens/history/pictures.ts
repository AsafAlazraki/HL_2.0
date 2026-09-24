/* ============================================================
   THE PICTURE OF A QUOTE'S BOAT, FOR THE FORTNIGHT'S DAYS — the
   copy this repository ships of the exact address the quote froze
   (`subjectImage.src`, the row's own picture: the maker's render of
   that model in that colourway), or nothing.

   WHY HISTORY DRAWS BOATS AT ALL (2026-09-25, m2-last-critique.md
   major 7): at a desk the fortnight was thirteen dashed boxes and one
   tile with three dots. The days before the diary began are one span
   now (`fortnightOf`), and the days it kept hold what was done on
   them — the quotes they touched, each with its boat, where a copy of
   that boat's own picture is held. A picture belongs only to the
   exact model it depicts (CLAUDE.md): the copy is matched on the
   frozen address and on nothing else, and a quote whose address has
   no copy here is its words alone.

   THE IMAGE LEDGER RIDES IN THE BUNDLE, as it does for the register,
   the picker and the customers' letter: Entry's blue door is the one
   thing in this app that reads `data/northside/` over the network. It
   is read here rather than imported from another screen's folder
   because a screen's folder is its own; the reading is twenty lines.
   ============================================================ */
import type { QuoteDef } from '@/domain/model'
import imagesRaw from '../../../data/northside/images.json?raw'

const SEED_IMAGES = `${import.meta.env.BASE_URL}seed-images/`

/** A copy this repository ships of one address, at the size it ships it. */
export interface HeldCopy {
  src: string
  width: number
  height: number
}

type Unknown = Record<string, unknown>

let copies: Map<string, HeldCopy> | undefined

/* A ROW THAT DOES NOT PARSE IS DROPPED RATHER THAN GUESSED: a generated
   file that changed shape draws the boat's name alone, never a broken image. */
function readCopies(): Map<string, HeldCopy> {
  const by = new Map<string, HeldCopy>()
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
    const { address, file, width, height } = row as Unknown
    if (typeof address !== 'string' || address.trim() === '') continue
    if (typeof file !== 'string' || file.trim() === '') continue
    if (typeof width !== 'number' || !(width > 0)) continue
    if (typeof height !== 'number' || !(height > 0)) continue
    by.set(address.trim(), { src: SEED_IMAGES + file.trim(), width, height })
  }
  return by
}

/** The copy held of the exact picture this quote froze, or nothing. */
export function boatPicture(quote: QuoteDef): HeldCopy | undefined {
  const address = quote.subjectImage?.src.trim() ?? ''
  return address === '' ? undefined : (copies ??= readCopies()).get(address)
}
