/* ============================================================
   THE COVER OF THE NEWEST QUOTE — what the room under the rows holds
   when no quote here has its boat photographed on the water (the
   M2-close critique's finding 6, rule (e)).

   Until 2026-09-24 the room was the page's own paper whenever the
   heroes ledger held no photograph of a filed quote's model, which on
   this file is every model but eight: at 1920×1080 a bordered, empty
   frame about 690px tall under one row. Nothing may be invented to
   fill it, and nothing needs to be. The newest quote is real and its
   boat has, on almost every model, something honest to show — read
   down the ladder the build's own stage and the customers' letter
   already read, one rung at a time, stopping at the first that holds:

     1. THE PHOTOGRAPH on the water — `./latest.ts`, unchanged. It wins
        over a newer quote with no photograph, as it did.
     2. THE ROW'S OWN CATALOGUE COPY — the picture the quote froze
        (`subjectImage.src`, the maker's own address), when this
        repository ships a copy of that exact address. It is the exact
        colourway on the document, a studio render cut out on white,
        so it is drawn on white at no more than its own pixels.
     3. THE MAKER'S OWN MARK, in the ink paper needs, where no picture
        of the boat is held. A mark is not a picture of the boat and it
        is never drawn as one: the cover says in words that no picture
        is held and whose mark this is.
     4. THE NAME, SET IN TYPE. Always true, and never a hole.

   A picture belongs only to the exact model it depicts (CLAUDE.md):
   the copy is matched on the frozen address and on nothing else, and
   the mark on the maker's name, never a resemblance.

   THE IMAGE LEDGER RIDES IN THE BUNDLE, as it does for the three other
   screens that draw a held copy, for the reason
   `src/screens/picker/pictures.ts` gives: Entry's blue door is the one
   thing in this app that reads `data/northside/` over the network.
   It is read here rather than imported from another screen's folder
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

/** A maker's mark, in the ink a white page needs. */
export interface CoverMark {
  src: string
  width: number
  height: number
  brand: string
}

export type Cover<P> =
  | { rung: 'photo'; picture: P }
  | { rung: 'studio'; copy: HeldCopy }
  | { rung: 'mark'; mark: CoverMark }
  | { rung: 'type' }

export interface CoverReaders<P> {
  /** the photograph on the water of this quote's exact model, or nothing */
  photo: (quote: QuoteDef) => P | undefined
  /** the copy held of this exact address, or nothing */
  copy: (address: string) => HeldCopy | undefined
  /** the maker's dark mark for this quote's register, or nothing */
  mark: (quote: QuoteDef) => CoverMark | undefined
}

/** The first rung that holds, for one quote. Pure: the readers are handed in. */
export function coverOf<P>(quote: QuoteDef, readers: CoverReaders<P>): Cover<P> {
  const picture = readers.photo(quote)
  if (picture !== undefined) return { rung: 'photo', picture }
  const address = quote.subjectImage?.src.trim() ?? ''
  const copy = address === '' ? undefined : readers.copy(address)
  if (copy !== undefined) return { rung: 'studio', copy }
  const mark = readers.mark(quote)
  if (mark !== undefined) return { rung: 'mark', mark }
  return { rung: 'type' }
}

type Unknown = Record<string, unknown>

let copies: Map<string, HeldCopy> | undefined

/* A ROW THAT DOES NOT PARSE IS DROPPED RATHER THAN GUESSED: a generated
   file that changed shape draws the next rung down, never a broken image. */
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
    const one = row as Unknown
    const { address, file, width, height } = one
    if (typeof address !== 'string' || address.trim() === '') continue
    if (typeof file !== 'string' || file.trim() === '') continue
    if (typeof width !== 'number' || !(width > 0)) continue
    if (typeof height !== 'number' || !(height > 0)) continue
    by.set(address.trim(), { src: SEED_IMAGES + file.trim(), width, height })
  }
  return by
}

/** The copy held of that exact address, or nothing for every address this repository does not ship. */
export const heldCopyOf = (address: string): HeldCopy | undefined =>
  (copies ??= readCopies()).get(address)
