/* ============================================================
   THE GROUND THE SHEET STANDS ON — the boat in THIS quote, blurred,
   and nothing else ever.

   WHY A PHOTOGRAPH IS HERE AT ALL, on the screen the sweep calls the
   least dependent on photography in the milestone. Porsche's
   feasibility sheet stands over a BLURRED stage, and the teardown is
   explicit that the blur is load-bearing: it says the configurator is
   still there and frozen rather than replaced. That is the one thing
   a routed sheet has to say and cannot say in words without saying it
   twice. `docs/research/refs/cascade/notes.md` §4 records it as the
   only motion-or-material claim any of the 110 frames licenses.

   AND IT IS THE ONLY HONEST USE OF A 1,100px CATALOGUE COPY behind a
   1440px window: blur lowers the resolution a background needs. It
   must be the boat in this quote, taken from the ledger by the
   address the row itself carries, never a stand-in and never another
   model's photograph (CLAUDE.md). Where the ledger holds no copy the
   sheet stands on the room's own ground, which is the state the
   direction owes and draws.

   THE LEDGER RIDES IN THE BUNDLE rather than being fetched, for the
   reason `src/screens/picker/pictures.ts` gives at length: Entry's
   blue door is the one thing in this app that reads the price file,
   and a second fetch here would leave a first visit with no network
   holding a sheet with no picture for a reason nobody could see.

   THIS FILE IS THE CASCADE'S OWN, and reads one thing rather than the
   picker's four: there is no shared picture component in this
   repository and there is not going to be one. What is shared is the
   LEDGER, which is one file on disk.
   ============================================================ */
import imagesRaw from '../../../data/northside/images.json?raw'

/** Where a held copy is served from — `public/`, so the address is the
 *  deployment's own base in front of the ledger's file name. */
const SEED_IMAGES = `${import.meta.env.BASE_URL}seed-images/`

/** A picture this repository ships, at the size it ships it. Nothing
 *  is ever drawn larger than `width` × `height`; the numbers ride on
 *  the element so "never enlarged" stays checkable at every width. */
export interface Ground {
  src: string
  width: number
  height: number
  /** the maker's own address, so a caption can name the host */
  address: string
  /** what the packer MEASURED the picture to be — a scene on the
   *  water, or a studio render. Never inferred from a file name. */
  verdict: string
}

type Row = Record<string, unknown>

const str = (row: Row, key: string): string =>
  typeof row[key] === 'string' ? (row[key] as string).trim() : ''
const num = (row: Row, key: string): number =>
  typeof row[key] === 'number' && Number.isFinite(row[key]) && (row[key] as number) > 0
    ? (row[key] as number)
    : 0

let held: Map<string, Ground> | undefined

function read(): Map<string, Ground> {
  const by = new Map<string, Ground>()
  let parsed: unknown
  try {
    parsed = JSON.parse(imagesRaw)
  } catch {
    /* A GENERATED FILE THAT WILL NOT PARSE is a generator problem, and
       the sheet draws the honest absence rather than a broken box. */
    return by
  }
  const list = (parsed as Record<string, unknown>)?.images
  if (!Array.isArray(list)) return by
  for (const entry of list) {
    if (typeof entry !== 'object' || entry === null) continue
    const row = entry as Row
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

/**
 * The held copy of one address, or nothing.
 *
 * Nothing for every address this repository does not ship, INCLUDING
 * the ones that would load from the maker's own host: a ground that
 * sometimes draws a photograph and sometimes draws a hole is worse
 * than one that never draws one, and two of the hosts in this file
 * refuse a browser outright.
 */
export function groundFor(address: string | undefined): Ground | null {
  held ??= read()
  if (address === undefined || address === '') return null
  return held.get(address) ?? null
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
