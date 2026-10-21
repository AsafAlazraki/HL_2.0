import type { PackManifest } from '@/domain/model'
import { pictureBook, type HeldMark } from '@/domain/model/pictures'
import { spokenBoat } from '@/domain/quote/spoken'
import { PackFileUnserved, PackUnreachable } from '@/data/pack/load'

/* ============================================================
   WHAT THE ENTRY SCREEN IS ALLOWED TO SAY, AND WHERE EACH WORD
   COMES FROM.

   Entry is the one screen that runs BEFORE the price file is loaded:
   the catalogue store is empty by definition, because filling it is
   what the door does. So every figure on this screen is read
   from the three small files that ship beside the pack, and nothing
   is a constant:

     · data/northside/manifest.json      the 53 tables and their row counts
     · data/northside/pictures.json      the photograph, by id, with its pixels
                                         and its provenance
     · data/northside/marks-ledger.json  the marks — the dealership's own among
                                         them — so a missing one is handled
                                         rather than drawn anyway

   THE PICTURE AND THE MARK ARE THE ONE READER'S. The two ledgers are
   fetched here, because this screen runs before anything is loaded, and
   handed to `pictureBook` in `@/domain/model/pictures` — the same pure
   reader the bundle builds for every other screen (`@/data/pictures`) —
   so the pennant and the photograph cannot be read here one way and on
   Home another.

   THE COUNTS ARE COUNTED, NOT READ OFF THE HEADER. `manifest.counts`
   carries {tables: 53, rows: 15691, joins: 28}, and the door could
   print it in one line. It does not: `factsOf` counts the table list
   itself, so a manifest whose header and body disagree shows the body
   — the thing the app will actually load — and the door's promise is
   measured rather than quoted. (They agree today; that is the point of
   checking rather than trusting.)

   NOTHING HERE IMPORTS THE CATALOGUE STORE. Reading the manifest is
   not loading the file, and the two must not be confused: this screen
   can describe the file it is offering without any of it being in the
   app, which is exactly the honest state of a first visit.

   WHERE THIS WILL MOVE. The three readers below are a screen-local
   copy of the pattern in `src/data/pack/load.ts`, which today exports
   only the pack itself. The second screen that needs a hero or a mark
   is the moment to lift them into `src/data/pack/` behind the same
   seam; doing it now, while two screens are being built at once,
   would put two authors in one file.
   ============================================================ */

const BASE = `${import.meta.env.BASE_URL}data/northside/`

/** The deployment's own base, so a picture is served under a sub-path as well as at the root. */
const PICTURE_BASE = import.meta.env.BASE_URL

/** Throws the loader's own two kinds (`src/data/pack/load.ts`), so the screen can say
 *  before the door is pressed what the door itself will say after (2026-09-25): a request
 *  that went nowhere, and a file the server answered for and did not hand over. */
async function readJson<T>(rel: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(BASE + rel)
  } catch (error) {
    throw new PackUnreachable(rel, error)
  }
  if (!res.ok) throw new PackFileUnserved(rel, res.status, `${rel} answered ${res.status}.`)
  return (await res.json()) as T
}

/** One photograph on the water, as the one reader answers it out of `pictures.json`. An
 *  entry with no held copy is not a picture the reader answers with at all. */
export interface HeroEntry {
  id: string
  subject: string
  /** the table of the price file the boat in the picture is a row of */
  table: string
  /** the model it depicts, in the file's own spelling */
  model: string
  pageUrl: string
  licenceNote: string
  /** the held copy, under the deployment's base */
  src: string
  /** the held copy's own pixels — the size it must never be drawn past */
  width: number
  height: number
}

/** One mark in `marks-ledger.json`. `variant` says which ink it is
 *  drawn in; an entry with an `error` and no `file` is a mark that was
 *  looked for and not found, which is a fact this screen says out loud
 *  rather than papering over. `role: 'organisation'` is the dealership's own. */
export interface MarkEntry {
  id: string
  brand: string
  slug: string
  role?: string
  variant?: 'dark' | 'white'
  file?: string
  width?: number
  height?: number
  error?: string
}

export const readManifest = (): Promise<PackManifest> => readJson<PackManifest>('manifest.json')
/** Every photograph on the water `pictures.json` holds, read by the one reader. */
export async function readHeroes(): Promise<HeroEntry[]> {
  const pictures = await readJson<unknown>('pictures.json')
  return pictureBook({ pictures }, PICTURE_BASE)
    .heroes()
    .map((p) => ({
      id: p.id,
      subject: p.subject,
      table: p.table,
      model: p.model,
      pageUrl: p.pageUrl,
      licenceNote: p.licenceNote,
      src: p.src,
      width: p.width,
      height: p.height,
    }))
}
export const readMarks = (): Promise<MarkEntry[]> => readJson<MarkEntry[]>('marks-ledger.json')

/* ---------------------------------------------------------- */
/* What the file says about itself                             */
/* ---------------------------------------------------------- */

export interface FileFacts {
  /** the business the pack was made for — the wordmark on the pennant */
  business: string
  tables: number
  rows: number
  joins: number
  /** the boat makers: the file's own boat lists, one per maker */
  makers: number
  /** whether the file holds motors, and trailers, at all */
  motors: boolean
  trailers: boolean
  /** ISO, when the packer ran — the date the price list goes by */
  packedAt: string
}

export function factsOf(manifest: PackManifest): FileFacts {
  const base = manifest.tables.filter((t) => t.role === 'base')
  return {
    business: manifest.name,
    tables: manifest.tables.length,
    rows: manifest.tables.reduce((n, t) => n + t.rowCount, 0),
    joins: manifest.tables.filter((t) => t.role === 'join').length,
    makers: base.filter((t) => t.kind === 'boat').length,
    motors: base.some((t) => t.kind === 'motor'),
    trailers: base.some((t) => t.kind === 'trailer'),
    packedAt: manifest.packedAt,
  }
}

/**
 * WHAT THE DOOR LOADS, IN THE WORDS A DEALER SELLS BY (2026-10-20). It said "53 lists · 15,691
 * lines · 28 of them say what fits what": the file's own shape, in its own nouns, on the first
 * screen. A dealer says what is in it — the boats, by how many makers, and the motors and
 * trailers that go with them — and "that fit them" is said only when the file carries the
 * lists that say what fits what. Every word is counted off the manifest, so a file with no
 * trailers never promises any.
 */
export function holdsSay(
  file: Pick<FileFacts, 'makers' | 'motors' | 'trailers' | 'joins'>,
): string {
  const extras = [file.motors ? 'motors' : null, file.trailers ? 'trailers' : null]
    .filter((w): w is string => w !== null)
    .join(' and ')
  if (file.makers === 0) {
    return extras === '' ? 'The price list' : `${extras.charAt(0).toUpperCase()}${extras.slice(1)}`
  }
  const boats = `Boats from ${figure(file.makers)} ${file.makers === 1 ? 'maker' : 'makers'}`
  if (extras === '') return boats
  return file.joins > 0 ? `${boats}, and the ${extras} that fit them` : `${boats}, ${extras}`
}

/** The photograph's OWN ROW IN THE FILE — the panel this direction is
 *  built around. The ledger says which table and which model the boat
 *  in the picture is; the manifest says what that table is called and
 *  how many rows it holds. Neither is a sentence anybody typed. */
export interface RowFacts {
  /** the file's own key for the table, printed in mono as evidence */
  key: string
  /** what the table is called — 'Stacer' */
  table: string
  rowCount: number
  /** the model in the photograph — '481 SeaMaster' */
  model: string
}

export function rowFactsOf(manifest: PackManifest, hero: HeroEntry): RowFacts | null {
  const table = manifest.tables.find((t) => t.key === hero.table)
  if (!table) return null
  /* the file's own spelling, less the maker the table's name already says: "481 SeaMaster" */
  const said = spokenBoat(hero.table, hero.model)
  const model = [said.model, said.qualifier].filter((w) => w !== '').join(' ') || hero.model
  return { key: table.key, table: table.name, rowCount: table.rowCount, model }
}

/* ---------------------------------------------------------- */
/* The mark, and the two ways the ledger can be short of one   */
/* ---------------------------------------------------------- */

export interface Wordmark {
  /** the mark to draw, when one is held in white ink */
  mark: { src: string; brand: string } | null
  /** the two lines of the name, when it is set in type instead */
  lines: string[]
}

/**
 * THE PENNANT IS A BLUE OBJECT, SO ONLY A WHITE-INK MARK CAN GO ON IT. Northside's own mark is
 * held in white (`marks-ledger.json`, role `organisation`) and the pennant draws it, at the
 * showpiece's size. A ledger short of one — no entry at all, or a mark held in dark ink only,
 * which would be a smudge on the flag — gets the business's name set in type, and SAYS NOTHING
 * ABOUT IT (2026-10-20). It said "…is held in dark ink only, which is a smudge on navy" and
 * "…own mark has not been added yet. Nothing stands in for it": sentences about the app's
 * ledger on the first screen anybody sees. The name in type is the name; it needs no note.
 */
export function wordmarkFor(marks: MarkEntry[], slug: string, business: string): Wordmark {
  const lines = wordmarkLines(business)
  /* the dealership's own: what the ledger files as the organisation's, or under its slug */
  const mine = marks
    .filter((m) => m.role === 'organisation' || m.slug === slug)
    .map((m) => ({ width: 1, height: 1, ...m, role: 'organisation' }))
  const chosen = pictureBook({ marks: mine }, PICTURE_BASE).organisation('white')
  if (chosen.drawn) {
    const held: HeldMark = chosen.mark
    return { mark: { src: held.src, brand: held.brand }, lines }
  }
  return { mark: null, lines }
}

/** The name broken for the pennant: the first word, then the rest.
 *  'Northside Marine' hangs as NORTHSIDE over MARINE; a one-word
 *  business hangs as one line. */
export function wordmarkLines(business: string): string[] {
  const words = business.trim().split(/\s+/).filter(Boolean)
  if (words.length < 2) return words
  return [words[0]!, words.slice(1).join(' ')]
}

/* ---------------------------------------------------------- */
/* Small readings, so no screen writes a date by hand          */
/* ---------------------------------------------------------- */

const DAY = new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })

/** '2026-09-16T08:16:21.258Z' or '2026-09-16' as a dealer reads it.
 *  A date the ledger does not carry is not invented: the caller is
 *  handed back nothing and says nothing. */
export function auDate(iso: string | undefined): string | null {
  if (!iso) return null
  const at = new Date(iso)
  return Number.isNaN(at.getTime()) ? null : DAY.format(at)
}

/** The host a picture came from, as the caption names it. */
export function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

/** A figure as this app prints one — grouped, en-AU, tabular. */
export const figure = (n: number): string => n.toLocaleString('en-AU')

/* ---------------------------------------------------------- */
/* Why the file did not load, and what to do about it          */
/* ---------------------------------------------------------- */

/**
 * THE THREE WAYS THE DOOR CAN FAIL, told apart because each asks a
 * different thing of the person at the desk (2026-09-25). There is one
 * door now: when the file cannot be read the screen says so and says
 * what to do, and it never offers a business with no file instead.
 *
 *   · `unreachable` — this computer could not reach the file: it is
 *     offline, or the network dropped. Going online and pressing again
 *     is the answer.
 *   · `missing` — the server answered and did not hand the file over.
 *     Pressing again finds the same absence; somebody has to put the
 *     file back where the app keeps it.
 *   · `other` — anything else, said in its own words; pressing again
 *     is worth a try.
 */
export type NotLoaded =
  { kind: 'unreachable' } | { kind: 'missing'; file: string } | { kind: 'other'; said: string }

/** The one sentence printed under the button when the file did not load: what happened, then
 *  what to do. Shortened 2026-10-20: "Nothing was put into the app" explained the app, and
 *  "press the door again" named a thing nobody at a desk calls a door. */
export function notLoadedSay(why: NotLoaded): string {
  switch (why.kind) {
    case 'unreachable':
      return 'The Master Price File was not loaded: this computer could not reach it. Check it is online, then try again.'
    case 'missing':
      return `The Master Price File was not loaded: part of it (${why.file}) is missing. Trying again will not find it; whoever looks after this app has to put it back.`
    case 'other':
      return `The Master Price File was not loaded: ${why.said} Try again.`
  }
}

/* ---------------------------------------------------------- */
/* One read, for one screen                                    */
/* ---------------------------------------------------------- */

export interface EntryFacts {
  file: FileFacts
  /** the photograph, when the ledger holds the one this screen names */
  hero: HeroEntry | null
  row: RowFacts | null
  wordmark: Wordmark
}

/**
 * Everything the screen may say, in one await. The three files are
 * read in parallel because none of them needs another.
 *
 * ONLY THE MANIFEST CAN FAIL THE SCREEN. It is the file the button
 * reads, so a manifest that cannot be read is said where the button is.
 * The two ledgers are not: a photograph ledger that cannot be read is a
 * screen with no photograph, and a marks ledger that cannot be read is
 * the name set in type. One absent picture is one absent picture — it
 * took the business's name off its own front door until 2026-09-17, and
 * until 2026-10-20 it still put an alarm under a button that worked.
 *
 * AND AN ABSENT PICTURE IS SAID BY ITS ABSENCE. The screen printed "No
 * photograph is drawn here: the image ledger holds no picture keyed
 * stacer-481-seamaster…" until 2026-10-20 — the app's ledger, on the
 * first screen. With no photograph there is no caption, and nothing on
 * the screen claims one.
 */
export async function readEntryFacts(heroId: string, orgSlug: string): Promise<EntryFacts> {
  const [manifest, heroes, marks] = await Promise.all([
    readManifest(),
    readHeroes().catch((): HeroEntry[] => []),
    readMarks().catch((): MarkEntry[] => []),
  ])
  const hero = heroes.find((h) => h.id === heroId) ?? null
  const file = factsOf(manifest)
  return {
    file,
    hero,
    row: hero ? rowFactsOf(manifest, hero) : null,
    wordmark: wordmarkFor(marks, orgSlug, file.business),
  }
}
