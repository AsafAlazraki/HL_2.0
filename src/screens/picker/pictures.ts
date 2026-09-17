/* ============================================================
   THE IMAGE LEDGER, AND WHY IT RIDES IN THE BUNDLE.

   `data/northside/images.json` is one row per distinct picture address
   in the price file — 4,768 of them — each carrying the maker's own
   address, the licence note, the verdict measured off the pixels, and,
   where a copy was obtained, the file under `public/seed-images` with
   its own width and height. It is the only thing that can answer "do
   we ship the bytes for this address", and this screen is the first
   one in the app that needs an answer.

   IT IS IMPORTED, NOT FETCHED, AND THAT IS A STRUCTURAL DECISION
   RATHER THAN A PREFERENCE. `docs/SCREENS.md` states the division the
   whole shell rests on: Entry's blue door is the only thing in this
   app that reads the price file, and every other screen reads this
   browser. A fetch here would make the picker a second reader of
   `data/northside/`, and the first visit with no network would then
   have a sheet and no pictures for a reason nobody could see. So it
   rides in this route's own chunk through Vite's `?raw`, exactly as
   `src/screens/home/ledgers.ts` carries the two small ledgers — same
   bytes, same single source, no second copy under `public/` to go
   stale.

   MEASURED BEFORE IT WAS CHOSEN: 309 KB of JSON, in the chunk for one
   route that TanStack already code-splits, parsed once and lazily —
   nothing is read until a panel asks for its first picture — and the
   map kept afterwards holds only the address, the file, the size and
   the verdict.

   A ROW THAT DOES NOT PARSE IS DROPPED RATHER THAN GUESSED, which is
   the rule the other two ledgers keep: the generated file changed, so
   the panel says it holds no picture instead of drawing a broken one.
   ============================================================ */
import imagesRaw from '../../../data/northside/images.json?raw'

/** Where a held copy is served from — `public/`, so the address is the
 *  deployment's own base in front of the ledger's file name. */
const SEED_IMAGES = `${import.meta.env.BASE_URL}seed-images/`

/** A picture this repository actually ships, at the size it ships it. */
export interface Held {
  /** the same-origin address of the held copy */
  at: string
  /** the held copy's own pixels. Nothing is ever drawn past them. */
  w: number
  h: number
  /** the maker's own address, kept so a caption can name the host */
  address: string
  /** what the packer measured the picture to BE: a scene on the water,
   *  or a studio render. Never inferred from the file name. */
  verdict: string
}

/** What the ledger holds, counted rather than claimed. */
export interface LedgerFacts {
  /** distinct addresses in the price file */
  addresses: number
  /** addresses a copy was obtained for */
  held: number
  /** addresses asked for and refused, with the reason recorded */
  refused: number
  /** addresses nobody has asked for yet */
  unheld: number
}

interface Row {
  address: string
  file?: string
  width?: number
  height?: number
  error?: string
  verdict?: string
}

interface Read {
  by: Map<string, Held>
  facts: LedgerFacts
}

let read: Read | undefined

function readLedger(): Read {
  const by = new Map<string, Held>()
  const facts: LedgerFacts = { addresses: 0, held: 0, refused: 0, unheld: 0 }
  let rows: unknown
  try {
    rows = (JSON.parse(imagesRaw) as { images?: unknown }).images
  } catch {
    /* a generated file that will not parse is a generator problem; the
       panels draw the honest absence rather than a broken picture */
    return { by, facts }
  }
  if (!Array.isArray(rows)) return { by, facts }

  for (const entry of rows) {
    if (typeof entry !== 'object' || entry === null) continue
    const row = entry as Row
    if (typeof row.address !== 'string' || row.address === '') continue
    facts.addresses += 1
    if (
      typeof row.file === 'string' &&
      row.file !== '' &&
      typeof row.width === 'number' &&
      row.width > 0 &&
      typeof row.height === 'number' &&
      row.height > 0
    ) {
      facts.held += 1
      by.set(row.address, {
        at: SEED_IMAGES + row.file,
        w: row.width,
        h: row.height,
        address: row.address,
        verdict: typeof row.verdict === 'string' ? row.verdict : 'unknown',
      })
      continue
    }
    if (typeof row.error === 'string' && row.error !== '') facts.refused += 1
    else facts.unheld += 1
  }
  return { by, facts }
}

const ledger = (): Read => (read ??= readLedger())

/**
 * Does this repository hold a copy of that address, and how big is it?
 *
 * `null` for every address we do not ship — including the ones that
 * would load from the maker's own host. A panel that sometimes draws a
 * photograph and sometimes draws a hole is worse than one that never
 * draws one, and two of the hosts in this file refuse a browser
 * outright.
 */
export const heldCopy = (address: string | undefined): Held | null =>
  address === undefined || address === '' ? null : (ledger().by.get(address) ?? null)

/** What the ledger says about itself. Counted off the rows. */
export const ledgerFacts = (): LedgerFacts => ledger().facts
