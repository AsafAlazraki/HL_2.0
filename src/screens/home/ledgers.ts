/* ============================================================
   THE PHOTOGRAPHS AND THE MARKS THIS SCREEN DRAWS — ASKED OF THE ONE
   READER, IN HOME'S OWN SHAPE AND HOME'S OWN WORDS.

   The heroes — the pictures on the water a boat is sold from — and the
   makers' marks are read by `@/data/pictures`, over the pure
   `@/domain/model/pictures`, the reader every screen and the customer's
   paper ask. Until 2026-10-20 this file parsed `heroes-ledger.json` and
   `marks-ledger.json` itself; the heroes now live in `pictures.json`
   beside the catalogue tier, each attached to the rows of its model by
   row id, so Home cannot sell a photograph the build then refuses.

   What stays here is Home's: the ground a mark is asked to sit on
   (`paper` or `dark`), and the sentences the shelf prints where a mark
   is not drawn.
   ============================================================ */
import { isDiscontinued, type EntityDef, type RowData } from '@/domain/model'
import { pictures, type HeldMark as BookMark, type HeldPicture } from '@/data/pictures'
import { spokenBoat, spokenModel } from '@/domain/quote/spoken'

export type { HeldPicture }

/** One maker's wordmark, as Home draws it. */
export interface HeldMark {
  id: string
  brand: string
  /** the ink it is drawn in: 'dark' for a light ground, 'white' for a dark one */
  variant: string
  src: string
  width: number
  height: number
}

/** The ground a mark is asked to sit on, which decides which ink it needs. */
export type Ground = 'paper' | 'dark'

/** The mark to draw, or the reason there is none — printed where the mark would have been. */
export type MarkChoice = { drawn: true; mark: HeldMark } | { drawn: false; because: string }

const shaped = (m: BookMark): HeldMark => ({
  id: m.id,
  brand: m.brand,
  variant: m.ink,
  src: m.src,
  width: m.width,
  height: m.height,
})

/** Every photograph on the water the ledger holds, in the ledger's order. */
export const heldPictures = (): readonly HeldPicture[] => pictures().heroes()

/** How many boats Home's row holds: one row of eight on a desk, which is what Home is drawn
 *  to fit at 1280, 1440 and 1920. */
export const HOME_BOATS = 8

/**
 * THE BOATS HOME'S ROW STANDS ON (2026-10-20). The ledger now holds 35 photographs on the
 * water; drawn whole, the row was five rows deep and Home was 1,423px in a 900px window. So the
 * row is eight, taken one maker at a time so a desk sees every maker that has one, a photograph
 * a person marked as its boat before one the machine chose, otherwise in the ledger's order.
 * Every other boat is one word away in the field.
 */
export function boatsForHome<T extends { table: string; picture: { person: boolean } }>(
  all: readonly T[],
  n: number = HOME_BOATS,
): T[] {
  const marked = all.toSorted((a, b) => Number(b.picture.person) - Number(a.picture.person))
  const byMaker = new Map<string, T[]>()
  for (const boat of marked) byMaker.set(boat.table, [...(byMaker.get(boat.table) ?? []), boat])
  const out: T[] = []
  for (let pass = 0; out.length < Math.min(n, all.length); pass += 1) {
    for (const boats of byMaker.values()) {
      const next = boats[pass]
      if (next && out.length < n) out.push(next)
    }
  }
  return out
}

/** One photograph by the id the ledger gives it, or nothing. A screen names the picture it
 *  wants; it never picks one by rank, by size or by whatever happens to be first. */
export const pictureById = (id: string): HeldPicture | undefined =>
  pictures().heroById(id) ?? undefined

/**
 * THE ROW A PHOTOGRAPH OPENS ON — the first version of its boat the file still sells, in the
 * file's order, among the rows the ledger attaches it to. Home's plate opens the picker AT the
 * boat in the photograph (the M2-close critique, finding 18), so the photograph a dealer presses
 * is the photograph the sale then stands on.
 */
export const rowPictured = (
  picture: HeldPicture,
  table: EntityDef,
  rows: readonly RowData[],
): RowData | undefined =>
  picture.table === table.id
    ? rows.find((row) => !isDiscontinued(row) && picture.rows.includes(row.id))
    : undefined

/** Every mark held for a maker, whatever ink it is drawn in. */
export const marksFor = (register: string): readonly HeldMark[] =>
  pictures().marksFor(register).map(shaped)

/**
 * THE MARK TO DRAW ON THIS GROUND, OR THE REASON THERE IS NONE, in the shelf's words: a maker
 * held in the other ink only is set in type (Mercury and Stabicraft publish white ink alone,
 * which a light ground cannot carry), and a name nobody looked for says so.
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
      because: `${other.brand}'s mark comes in ${other.variant} ink only, so the name is set in type here.`,
    }
  }
  const choice = pictures().mark(register, wanted)
  if (!choice.drawn && /^[^:]+: /.test(choice.because)) return choice
  return { drawn: false, because: 'No mark has been looked for under that name.' }
}

/** What the shelf says about itself: makers checked, makers held, files held — counted off the
 *  ledger, never typed, and never counting the dealership's own mark as a maker's. */
export const markLedgerFacts = (): { checked: number; held: number; files: number } =>
  pictures().markFacts()

/**
 * A PHOTOGRAPH'S BOAT, AS HOME SAYS IT: the maker, and the model in the file's own spelling — a
 * code on a register that files its models as a level (Highfield: "SP560" says "Sport 560"), a
 * row's name everywhere else ("Stacer - 481 SeaMaster" says "481 SeaMaster", and a hull's
 * version follows a dot: "709 Ocean Ranger SDF · H/Top").
 */
export function saidOfPicture(table: EntityDef, model: string): { maker: string; model: string } {
  if ((table.hierarchy ?? []).length >= 3) return spokenModel(table.id, model)
  const boat = spokenBoat(table.id, model)
  return {
    maker: boat.maker,
    model: [[boat.model, boat.qualifier].filter((w) => w !== '').join(' '), boat.trim]
      .filter((w) => w !== '')
      .join(' · '),
  }
}
