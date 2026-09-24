/* ============================================================
   THE TWO PICTURES THIS SHEET MAY STAND ON — the boat in THIS quote,
   and nothing else ever.

   ── WHAT CHANGED, 2026-09-18, AND WHY ────────────────────────

   The first cut of this file read ONE picture: the catalogue copy the
   quote's own row points at, blurred to `--blur-glass` and laid over
   the whole page as Porsche's stage is. The independent critique
   measured what that costs on this dealer's file and it is the
   screen's worst defect:

     .csc-sheet starts at x=542 of 1,425 at 1440 (38%) and at x=881 of
     1,905 at 1920 (46%), and everything to its left is that catalogue
     copy under blur(20px). It is a STUDIO RENDER CUT OUT ON WHITE —
     207 of the 453 rows in `images.json` are — so blurred under a
     93% veil it is a near-black smear in which no boat is legible.
     Porsche's blurred stage works because there is a car in a SCENE
     behind it.

   That is not a veil that needs tuning. A render cut out on white is
   a technical drawing of a boat, and no amount of blur turns a
   drawing into a room. So the picture is read down a LADDER instead,
   and each rung is the honest use of the bytes on that rung:

     1. THE SCENE — the model's own photograph on the water, out of
        `heroes-ledger.json` at 2,560 on the long edge. THIS is what
        the blur was always for, and at 2,560 it is the only picture
        in the repository that can cover a 1,920 window without being
        enlarged. Eight exist: four Highfield and four Stacer.
     2. THE PLATE — the row's own catalogue copy at long edge 1,100,
        drawn SHARP at its own size on a white mount, because that is
        what a cut-out-on-white render is: a page of the catalogue.
        It is the exact colourway the document is written against,
        which the scene is not, and it is why both are drawn where
        both exist.
     3. NEITHER — the room's own ground, and a sentence saying so.
        §7 of the sweep asks this direction to draw itself once on a
        flat ground, and this is that state.

   A SCENE BELONGS TO A MODEL AND A PLATE BELONGS TO A ROW, and the
   sheet says which is which in words. `highfield-sp560` is an SP560
   on the water; it is not the (PVC) W-W-WB colourway this document is
   written against, and the provenance line says exactly that rather
   than letting a photograph imply a finish nobody bought. That is
   CLAUDE.md's rule read strictly: a picture belongs only to the exact
   model it depicts, with its provenance in the ledger.

   THE LEDGERS RIDE IN THE BUNDLE rather than being fetched, for the
   reason `src/screens/picker/pictures.ts` gives at length: Entry's
   blue door is the one thing in this app that reads the price file,
   and a second fetch here would leave a first visit with no network
   holding a sheet with no picture for a reason nobody could see.

   THIS FILE IS THE CASCADE'S OWN. There is no shared picture module
   in this repository and there is not going to be one; what is
   shared is the LEDGER, which is one file on disk. The configurator's
   `stage.ts` reads the same two ledgers for its own stage and asks
   them a different question — it needs a mark and a wordmark under
   the picture, because a chapter head must draw for a maker with no
   photograph at all, and a ground that fell back to a wordmark would
   be a wordmark blurred to nothing.
   ============================================================ */
import type { CatalogueCtx, QuoteDef } from '@/domain/model'
import heroesRaw from '../../../data/northside/heroes-ledger.json?raw'
import imagesRaw from '../../../data/northside/images.json?raw'
import marksRaw from '../../../data/northside/marks-ledger.json?raw'

/** Where a held copy is served from — `public/`, so the address is the
 *  deployment's own base in front of the ledger's file name. */
const SEED_IMAGES = `${import.meta.env.BASE_URL}seed-images/`
const HERO_IMAGES = `${import.meta.env.BASE_URL}hero-images/`
const MARKS = `${import.meta.env.BASE_URL}brand-marks/`

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

/** The model's own photograph on the water, and the ledger's own words
 *  for what it shows. */
export interface Scene extends Ground {
  /** the ledger's own subject line — "Highfield Patrol 600 on the
   *  water" — never composed here */
  subject: string
  /** the model it depicts, spelled as that register spells it, so the
   *  sheet can say what the picture is OF as against what the document
   *  is written against */
  model: string
}

/** A scene as the ledger files it, with the register it belongs to.
 *  The register never reaches the screen — it is how the match is
 *  made, not something a reader needs — so it lives here. */
interface SceneRow extends Scene {
  table: string
}

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
    /* A GENERATED FILE THAT WILL NOT PARSE is a generator problem, and
       the sheet draws the honest absence rather than a broken box. */
    return []
  }
  const list = key ? (parsed as Record<string, unknown>)?.[key] : parsed
  return Array.isArray(list)
    ? list.filter((r): r is Row => typeof r === 'object' && r !== null)
    : []
}

let held: Map<string, Ground> | undefined
let scenes: SceneRow[] | undefined

function readPictures(): Map<string, Ground> {
  const by = new Map<string, Ground>()
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

function readScenes(): SceneRow[] {
  const out: SceneRow[] = []
  for (const row of rowsOf(heroesRaw)) {
    const file = str(row, 'file')
    const table = str(row, 'table')
    const model = str(row, 'model')
    const width = num(row, 'width')
    const height = num(row, 'height')
    if (file === '' || table === '' || model === '' || width === 0 || height === 0) continue
    out.push({
      src: HERO_IMAGES + file,
      width,
      height,
      address: str(row, 'pageUrl') || str(row, 'url'),
      /* the hero tier is a scene by construction: `tools/seed/
         pick-heroes.ts` runs `verdict.judge` over every candidate and
         takes the first judged `scene`, choosing NOTHING where none
         is. */
      verdict: 'scene',
      subject: str(row, 'subject'),
      model,
      table,
    })
  }
  return out
}

/**
 * THE PLATE: the held copy of one address, or nothing.
 *
 * Nothing for every address this repository does not ship, INCLUDING
 * the ones that would load from the maker's own host: a sheet that
 * sometimes draws a photograph and sometimes draws a hole is worse
 * than one that never draws one, and two of the hosts in this file
 * refuse a browser outright.
 */
export function groundFor(address: string | undefined): Ground | null {
  held ??= readPictures()
  if (address === undefined || address === '') return null
  return held.get(address) ?? null
}

/**
 * THE SCENE: the model's own photograph on the water, where the ledger
 * holds one for the hull this document is rooted on.
 *
 * The match is the register AND the model, read out of the register's
 * own hierarchy against the row the document is actually rooted on —
 * never the label, which on this file reads `Highfield - SP560 (PVC)
 * W-W-WB` and carries the finish and the colourway as well as the
 * model. So a photograph can only ever belong to the exact model it
 * depicts, and a colourway it does not depict is named in words rather
 * than implied by a picture.
 */
export function sceneFor(ctx: CatalogueCtx, quote: QuoteDef): Scene | null {
  scenes ??= readScenes()
  const table = ctx.entities[quote.rootTableId]
  if (!table) return null
  const row = (ctx.rowsByEntity[quote.rootTableId] ?? []).find((r) => r.id === quote.rootRowId)
  if (!row) return null

  const levels = table.hierarchy?.length ? table.hierarchy : [table.displayFieldId ?? '']
  const names = new Set(
    levels
      .map((fieldId) => row.values[fieldId])
      .filter((v): v is string => typeof v === 'string')
      .map((v) => v.trim().toLowerCase()),
  )
  if (names.size === 0) return null

  const found = scenes.find(
    (s) => s.table === quote.rootTableId && names.has(s.model.trim().toLowerCase()),
  )
  if (!found) return null
  const { table: _register, ...scene } = found
  return scene
}

/* ============================================================
   THE THIRD RUNG, ADDED 2026-09-24: THE MAKER'S OWN MARK, where the
   ledger holds no photograph of the model on the water.

   The M2-close critique's finding 6 measured it: "the cascade at 1920
   on a no-picture model: the left 896 px, 47% of the window, is empty
   navy with a small card at mid-height." Rung 3 of the ladder above
   was "the room's own ground", and on every model but eight that is
   what stood beside the sheet. The build column now stands on the
   file's own blue instead, with the maker's mark set large on it — the
   configurator's stage has drawn this rung since Milestone 1, in the
   same ink for the same reason: the mark is WHITE because the ground is
   deep blue, and only the white variant is read. A maker with no white
   mark gets its name set in type, never another maker's mark and never
   a recoloured one.

   A MARK IS NOT A PICTURE OF THE BOAT, and the provenance line says so
   in words. The match is the maker's name, or the register's name
   beginning with it and a space — "Highfield Inflatables" is
   Highfield's — never a substring anywhere, which would pair a trailer
   maker with a boat maker.
   ============================================================ */

/** A maker's mark as the ledger holds it, in white ink. */
export interface Mark {
  src: string
  width: number
  height: number
  brand: string
}

let marks: Mark[] | undefined

function readMarks(): Mark[] {
  const out: Mark[] = []
  for (const row of rowsOf(marksRaw)) {
    const brand = str(row, 'brand')
    const file = str(row, 'file')
    const width = num(row, 'width')
    const height = num(row, 'height')
    if (brand === '' || file === '' || width === 0 || height === 0) continue
    if (str(row, 'variant') !== 'white') continue
    out.push({ src: MARKS + file, width, height, brand })
  }
  return out
}

/** The white mark of the maker a register is named for, or null. */
export function markFor(register: string | undefined): Mark | null {
  marks ??= readMarks()
  const a = register?.trim().toLowerCase() ?? ''
  if (a === '') return null
  return (
    marks.find((m) => {
      const b = m.brand.trim().toLowerCase()
      return a === b || a.startsWith(`${b} `)
    }) ?? null
  )
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
