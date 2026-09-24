/* ============================================================
   THE TWO LEDGERS THE PICKER DRAWS FROM, AND WHY THEY RIDE IN THE
   BUNDLE.

   `data/northside/images.json` is one row per distinct picture address
   in the price file — 4,768 of them — each carrying the maker's own
   address, the licence note, the verdict measured off the pixels, and,
   where a copy was obtained, the file under `public/seed-images` with
   its own width and height. It is the only thing that can answer "do
   we ship the bytes for this address", which every card, every door
   and the plate ask before they draw a boat.

   `marks-ledger.json` records the makers whose wordmark was looked for
   and which ink each is held in. The picker's floor is paper, so it
   draws each maker's DARK mark — six of the seven boat makers have one
   — and sets the maker's name in type where none is held (Stabicraft's
   row reads "no public wordmark verified"). Recolouring somebody else's
   mark is not something a ledger can offer, so a maker held in white
   ink alone is set in type too.

   THEY ARE IMPORTED, NOT FETCHED, AND THAT IS A STRUCTURAL DECISION
   RATHER THAN A PREFERENCE. `docs/SCREENS.md` states the division the
   whole shell rests on: Entry's blue door is the only thing in this
   app that reads the price file, and every other screen reads this
   browser. A fetch here would make the picker a second reader of
   `data/northside/`, and the first visit with no network would then
   have a sheet and no pictures for a reason nobody could see. So both
   ride in this route's own chunk through Vite's `?raw`, the decision
   `src/screens/sheet/pictures.ts` and `src/screens/home/ledgers.ts`
   each made for their own screen — written again here rather than
   imported, because a screen's folder is its own.

   A ROW THAT DOES NOT PARSE IS DROPPED RATHER THAN GUESSED: a generated
   file that changed shape draws the honest absence instead of a broken
   picture.

   AND THE THIRD LEDGER, ADDED 2026-09-24: `heroes-ledger.json`, the
   eight photographs on the water that Home and the build stand a boat
   on. The M2-close critique's finding 11 found Home selling the Stacer
   519 Sea Ranger SDF with its photograph, and this screen then drawing
   "No photograph of the 519 Sea Ranger SDF is held yet" for both of its
   versions, because the picker read the catalogue copies alone and the
   row's own address is one the image ledger holds no copy of. So a model's
   picture is read down the build's own ladder: the model's photograph
   on the water where the heroes ledger holds one — matched by
   `depictionOf` in `@/domain/catalogue/depicts`, the one rule Home and
   the build ask too — then the catalogue copy of the model's own
   address, then nothing. Nothing stands in for anything.
   ============================================================ */
import type { ImageRef } from '@/domain/model'
import { depictionOf } from '@/domain/catalogue/depicts'
import heroesRaw from '../../../data/northside/heroes-ledger.json?raw'
import imagesRaw from '../../../data/northside/images.json?raw'
import marksRaw from '../../../data/northside/marks-ledger.json?raw'
import { markScale } from './fleet'

/** Where a held copy is served from — `public/`, so the address is the
 *  deployment's own base in front of the ledger's file name. */
const SEED_IMAGES = `${import.meta.env.BASE_URL}seed-images/`
const HERO_IMAGES = `${import.meta.env.BASE_URL}hero-images/`
const MARKS = `${import.meta.env.BASE_URL}brand-marks/`

/** A picture this repository actually ships, at the size it ships it. */
export interface Held {
  /** the same-origin address of the held copy */
  at: string
  /** the held copy's own pixels. Nothing is ever drawn past them. */
  w: number
  h: number
  /** the maker's own address */
  address: string
  /** what the packer measured the picture to BE: a scene on the water,
   *  or a studio render on white. Never inferred from the file name. */
  verdict: string
  /** THE NARROWER COPIES OF THE SAME PICTURE, widest last, for a
   *  `srcset`: a 2,560px photograph on a 200px card is 300 kB nobody
   *  sees. Empty on the catalogue tier, which ships one size. */
  widths: { at: string; w: number }[]
  /** what it shows, in the heroes ledger's own words ("Stacer 519 Sea
   *  Ranger SDF on the water"); '' on the catalogue tier */
  subject: string
}

/** A maker's wordmark in dark ink, for paper. */
export interface HeldMark {
  brand: string
  at: string
  w: number
  h: number
  /** its height as a multiple of the screen's mark height, so marks of
   *  every shape weigh the same (`markScale`) */
  scale: number
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
    /* a generated file that will not parse is a generator problem; the
       screen draws the honest absence rather than a broken picture */
    return []
  }
  const list = under ? (parsed as Unknown | null)?.[under] : parsed
  if (!Array.isArray(list)) return []
  return list.filter((row): row is Unknown => typeof row === 'object' && row !== null)
}

let images: Map<string, Held> | undefined
let marks: HeldMark[] | undefined
let heroes: HeroRow[] | undefined

/** A photograph on the water, with what the ledger says it depicts. */
interface HeroRow extends Held {
  table: string
  model: string
}

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
      widths: [],
      subject: '',
    })
  }
  return by
}

function readHeroes(): HeroRow[] {
  const out: HeroRow[] = []
  for (const row of rowsOf(heroesRaw)) {
    const file = str(row, 'file')
    const table = str(row, 'table')
    const model = str(row, 'model')
    const w = num(row, 'width')
    const h = num(row, 'height')
    if (!file || !table || !model || !w || !h) continue
    const widths: { at: string; w: number }[] = []
    for (const copy of Array.isArray(row['widths']) ? row['widths'] : []) {
      if (typeof copy !== 'object' || copy === null) continue
      const its = str(copy as Unknown, 'file')
      const cw = num(copy as Unknown, 'width')
      if (!its || !cw || cw >= w) continue
      widths.push({ at: HERO_IMAGES + its, w: cw })
    }
    widths.push({ at: HERO_IMAGES + file, w })
    out.push({
      at: HERO_IMAGES + file,
      w,
      h,
      address: str(row, 'pageUrl') ?? str(row, 'url') ?? '',
      /* a hero is a scene by construction: `tools/seed/pick-heroes.ts`
         takes the first candidate judged a scene, and none where none is */
      verdict: 'scene',
      widths: widths.toSorted((a, b) => a.w - b.w),
      subject: str(row, 'subject') ?? '',
      table,
      model,
    })
  }
  return out
}

function readMarks(): HeldMark[] {
  const out: HeldMark[] = []
  for (const row of rowsOf(marksRaw)) {
    const brand = str(row, 'brand')
    const file = str(row, 'file')
    const w = num(row, 'width')
    const h = num(row, 'height')
    if (!brand || !file || !w || !h || str(row, 'variant') !== 'dark') continue
    out.push({ brand, at: MARKS + file, w, h, scale: markScale(w, h) })
  }
  return out
}

/**
 * Does this repository hold a copy of that address, and how big is it?
 *
 * `null` for every address we do not ship — including the ones that
 * would load from the maker's own host. A card that sometimes draws a
 * photograph and sometimes draws a hole is worse than one that never
 * draws one, and two of the hosts in this file refuse a browser
 * outright.
 */
export const heldCopy = (address: string | undefined): Held | null =>
  address === undefined || address === '' ? null : ((images ??= readImages()).get(address) ?? null)

/** What a model is to this ledger: its register, the names the file
 *  gives it (its series, then its own name), and its own address. */
export interface Pictured {
  tableId: string
  series: string
  name: string
  img?: ImageRef
}

/**
 * THE PICTURE OF ONE MODEL, down the ladder the build's stage reads:
 * its photograph on the water where the heroes ledger holds one that
 * depicts it (`depictionOf`, the app's one rule), else the catalogue
 * copy of its own address, else null — and a null is drawn as the
 * model's name set as a cover, never as another boat's picture.
 */
export function pictureOf(model: Pictured): Held | null {
  const names = [model.series, model.name].filter((n) => n.trim() !== '')
  const found = depictionOf((heroes ??= readHeroes()), model.tableId, names)
  if (found) {
    const { table: _register, model: _model, ...held } = found.picture
    return held
  }
  return heldCopy(model.img?.src)
}

/** `srcset` for a held picture, or undefined where it ships one size. */
export const srcSetOf = (held: Held): string | undefined =>
  held.widths.length > 1 ? held.widths.map((c) => `${c.at} ${c.w}w`).join(', ') : undefined

/**
 * The dark mark held for the maker a register is named after, or null.
 *
 * The price file calls the register "Highfield Inflatables" and the
 * ledger calls the maker "Highfield", so a match is the same name or the
 * register's name beginning with the maker's and a space — never a
 * substring anywhere, which would pair "Stacer Trailers" with a boat.
 */
export function markOf(register: string): HeldMark | null {
  const a = register.trim().toLowerCase()
  for (const mark of (marks ??= readMarks())) {
    const b = mark.brand.trim().toLowerCase()
    if (a === b || a.startsWith(`${b} `)) return mark
  }
  return null
}
