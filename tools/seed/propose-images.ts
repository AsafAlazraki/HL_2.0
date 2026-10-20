/**
 * WHAT THE FILE CARRIES, WHAT IS HELD OF IT, AND WHICH MEASURED PICTURES WOULD FILL THE GAPS.
 *
 *   npx tsx --tsconfig tsconfig.app.json --import ./tools/seed/app.hooks.mjs tools/seed/propose-images.ts
 *       [--count]        count only: write docs/research/imagery/gaps.md, ask the network nothing
 *       [--sheets]       re-render the contact sheets from the proposals already written
 *
 * IT PROPOSES; IT HOLDS NOTHING. Every picture it fetches lands in `tools/seed/.imgcache/`
 * (gitignored) under the same `sha1(address)` name `fetch-images.ts` uses, so the round that
 * holds an approved proposal reads the bytes this run already paid for. Nothing is written
 * under `public/` and no ledger under `data/northside/` is touched.
 *
 * THE FILE'S NAMES ARE THE TRUTH. A model is what the picker's own `fleetOf` says it is
 * (Highfield's 588 rows are 67 models, every other boat register is one row a model, a motor
 * and a trailer are one row each), read through the app's own code at run time rather than
 * re-derived here: `app.hooks.mjs` lets Node load `src/` the way Vite does. A candidate from
 * `docs/research/imagery/candidates.json` is matched to a model by the strongest join its sweep
 * recorded — Highfield's Model Codes (`seedModelCodes`), Stacer's (`seedModels`), Yamaha's
 * "Covers the seed's … rows" code list — and otherwise by name through the domain's one rule,
 * `standing()` in `src/domain/catalogue/depicts.ts`, after folding only what is spelling:
 * case, and the hyphens, underscores, full stops and runs of spaces the file writes between
 * words ("Merry Fisher  -  695 S2", "1295_Coupe", "495 - Pro Fisher."). Nothing closer than
 * that is ever a match.
 *
 * NEVER A SISTER MODEL, NEVER A SERIES SHOT. A candidate whose rows span two models is a
 * series or configuration picture and is not proposed for either (Formosa's range galleries
 * say so in their own records, `model: ""`). A candidate whose note says the file it depicts
 * is a different designator, a predecessor, or cannot be told apart is held back with that
 * note. A name that stands inside several of the file's models is proposed only where they
 * differ by a package or a transom (`1450 Frontier` for its Sportfish and Profish rows, the
 * domain's own rule: "a photograph belongs to the model it depicts and is drawn for every
 * version of it"), and the proposal says the version is not shown.
 *
 * THE GATES, IN ORDER (the lesson the hero round paid for: "not a render on white" is not "a
 * boat on water"). The maker's own file name first — Stacer's `INT`/`Internal`, an `OH`
 * overhead, a helm, a seat, a transom are not a whole boat. Then the pixels: `judge()` from
 * `verdict.ts`, scene or studio, over the fetched bytes. Then EYES: every proposal is a tile
 * on a contact sheet with its model's name under it in large type, and nothing is held until
 * a person has said yes to it there.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { format, resolveConfig } from 'prettier'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import sharp, { type OverlayOptions } from 'sharp'
import { judge, SIDE } from './verdict.ts'
import { LONG_EDGE, QUALITY, sha1Hex } from './ledger.ts'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '..', '..')
const CACHE = path.join(HERE, '.imgcache')
const OUT_DIR = path.join(ROOT, 'docs', 'research', 'imagery')
const PROPOSALS = path.join(OUT_DIR, 'proposals')
const DATA = path.join(ROOT, 'data', 'northside')
const TODAY = new Date().toISOString().slice(0, 10)
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'

/** the hero tier's long edge and quality, as `heroes.ts` writes it */
const HERO_EDGE = 2560
const HERO_QUALITY = 78
/** the owner's ceilings: new bytes in the repository, and new heroes */
const BUDGET_BYTES = 90 * 1024 * 1024
const HERO_CAP = 40
/** a hero is a wide landscape frame at least this wide at its source */
const HERO_MIN_WIDTH = 1600

/* ------------------------------------------------------------------ */
/* The app's own readers, loaded at run time                           */
/* ------------------------------------------------------------------ */

interface Row {
  id: string
  values: Record<string, unknown>
}
interface Field {
  id: string
  name?: string
  type?: string
}
interface Table {
  id: string
  name: string
  kind?: string
  hierarchy?: string[]
  displayFieldId?: string
  fields?: Field[]
}
interface FleetModel {
  key: string
  tableId: string
  register: string
  series: string
  name: string
  spoken: string
  rows: number
  variants: { rowId: string; label: string }[]
}
interface Fleet {
  brands: { id: string; name: string; rows: number; models: FleetModel[] }[]
}
interface Pack {
  entities: Table[]
  rowsByEntity: Record<string, Row[]>
}
type Standing = 'same' | 'within'

/* The app's modules resolve `@/…` and read `?raw`, which only the preload can answer, so they
   are imported by a computed address and typed here by what this tool reads of them. */
const appModule = async <T>(rel: string): Promise<T> =>
  (await import(pathToFileURL(path.join(ROOT, rel)).href)) as T
const { loadPack } = await appModule<{ loadPack: () => Promise<Pack> }>('src/test/fixtures/pack.ts')
const { fleetOf } = await appModule<{
  fleetOf: (t: Record<string, Table>, r: Record<string, Row[]>, kind: string) => Fleet
}>('src/screens/picker/fleet.ts')
const { namesOfRow, standing, depictionOf } = await appModule<{
  namesOfRow: (t: Table, r: Row) => string[]
  standing: (model: string, name: string) => Standing | null
  depictionOf: <P extends { table: string; model: string }>(
    p: readonly P[],
    tableId: string,
    names: readonly string[],
  ) => { picture: P } | null
}>('src/domain/catalogue/depicts.ts')

/* ------------------------------------------------------------------ */
/* What is held                                                        */
/* ------------------------------------------------------------------ */

interface ImageEntry {
  address: string
  host: string
  file?: string
  width?: number
  height?: number
  bytes?: number
  verdict?: string
  error?: string
  sourceWidth?: number
  sourceHeight?: number
  licenceNote?: string
}
interface HeroRow {
  id: string
  table: string
  model: string
  file?: string
  width?: number
  height?: number
}
interface MarkRow {
  id: string
  brand: string
  role?: string
  variant?: string
  file?: string
  width?: number
  height?: number
  error?: string
}

const readJson = <T>(...p: string[]): T => JSON.parse(readFileSync(path.join(...p), 'utf8')) as T
const images = new Map(
  readJson<{ images: ImageEntry[] }>(DATA, 'images.json').images.map((i) => [i.address, i]),
)
/* THE PICTURES A PERSON ATTACHED TO A MODEL (pictures.json, since 2026-10-20): the hero tier is
   where a hero is recorded, one row per model it is drawn for; the catalogue tier counts as the
   model's held picture; and a person's ruling refuses a row's own address where it is wrong. */
const picturesDoc = readJson<{
  pictures: (HeroRow & { tier: string; url: string; verdict: string; models: string[] })[]
  findings: { address: string; rows: string[]; decision: string; rule: string }[]
}>(DATA, 'pictures.json')
const heroes: HeroRow[] = picturesDoc.pictures
  .filter((p) => p.tier === 'hero')
  .flatMap((p) => p.models.map((model) => ({ ...p, model })))
const modelPictures = picturesDoc.pictures.filter((p) => p.tier === 'catalogue')
/** the rule a person (or the machine, by the file's own name) refused this address by, for this row */
const refusedFor = (address: string, rowId: string): string | undefined =>
  picturesDoc.findings.find(
    (f) =>
      f.decision === 'refuse' &&
      f.address === address &&
      (f.rows.length === 0 || f.rows.includes(rowId)),
  )?.rule
const marks = readJson<MarkRow[]>(DATA, 'marks-ledger.json')

/** A held copy whose subject is a maker's logo is not a picture of the item it hangs on. */
const LOGO = /logo|wordmark|badge/i
const isLogo = (e: ImageEntry): boolean =>
  LOGO.test(e.file ?? '') || LOGO.test(decodeURIComponent(e.address))

const pack = await loadPack()
const tables: Record<string, Table> = Object.fromEntries(pack.entities.map((e) => [e.id, e]))
const rowById = new Map<string, Row>()
for (const rows of Object.values(pack.rowsByEntity)) for (const r of rows) rowById.set(r.id, r)

const imageFieldOf = (t: Table): string | undefined => t.fields?.find((f) => f.type === 'image')?.id
const codeFieldOf = (t: Table): string | undefined =>
  t.fields?.find((f) => /^(model )?code$/i.test((f.name ?? '').trim()))?.id

function addressesOf(t: Table, row: Row): string[] {
  const id = imageFieldOf(t)
  const v = id ? row.values[id] : undefined
  if (!Array.isArray(v)) return []
  return v
    .map((x) => (x && typeof x === 'object' ? (x as { src?: unknown }).src : undefined))
    .filter((s): s is string => typeof s === 'string' && /^https?:\/\//.test(s))
}

type Kind = 'boat' | 'motor' | 'trailer' | 'package'
const KINDS: readonly Kind[] = ['boat', 'motor', 'trailer', 'package']

interface Audited {
  kind: Kind
  table: string
  register: string
  series: string
  /** the model as the file spells it */
  model: string
  /** the model as a person says it, maker first */
  spoken: string
  rows: Row[]
  codes: string[]
  /** held catalogue copies of the model's own rows' addresses, largest first */
  copies: {
    file: string
    width: number
    height: number
    address: string
    verdict: string
    logo: boolean
    /** whose picture the address is, where several models carry it (`shareOf`) */
    share?: Share
    /** a person marked it as this model on a contact sheet (pictures.json) */
    person?: boolean
  }[]
  /** rows of the model with a held copy that is not a logo */
  rowsHeld: number
  /** the rows' own addresses nobody has asked for yet */
  unasked: string[]
  /** the rows' own addresses that were asked and refused, with the reason */
  refused: { address: string; error: string }[]
  /** the rule a finding refused a row's own held copy by */
  ruled: string[]
  hero?: { file: string; width: number; height: number }
}

const audited: Audited[] = []
const registersByKind = new Map<
  Kind,
  { id: string; name: string; rows: number; models: number }[]
>()
for (const kind of KINDS) {
  const fleet = fleetOf(tables, pack.rowsByEntity, kind)
  /* a register with no picture column (Dealer Fit, beside Parts) has nothing on the file to
     fill, so it is named in the prose and never counted as a gap */
  const pictured = fleet.brands.filter(
    (b) => kind !== 'package' || imageFieldOf(tables[b.id]!) !== undefined,
  )
  registersByKind.set(
    kind,
    pictured.map((b) => ({ id: b.id, name: b.name, rows: b.rows, models: b.models.length })),
  )
  for (const brand of pictured) {
    const table = tables[brand.id]!
    const codeField = codeFieldOf(table)
    for (const m of brand.models) {
      const rows = m.variants.map((v) => rowById.get(v.rowId)).filter((r): r is Row => !!r)
      const copies: Audited['copies'] = []
      const unasked = new Set<string>()
      const refused = new Map<string, string>()
      const ruled = new Set<string>()
      let rowsHeld = 0
      for (const row of rows) {
        let heldHere = false
        for (const a of addressesOf(table, row)) {
          const e = images.get(a)
          /* a person refused this address for this row: it is not this row's picture */
          const rule = e?.file ? refusedFor(a, row.id) : undefined
          if (rule) {
            ruled.add(rule)
            continue
          }
          if (e?.file) {
            const logo = isLogo(e)
            if (!logo) heldHere = true
            if (!copies.some((c) => c.file === e.file))
              copies.push({
                file: e.file,
                width: e.width ?? 0,
                height: e.height ?? 0,
                address: a,
                verdict: e.verdict ?? 'unknown',
                logo,
              })
          } else if (e?.error) refused.set(a, e.error)
          else unasked.add(a)
        }
        if (heldHere) rowsHeld += 1
      }
      for (const p of modelPictures) {
        if (p.table !== table.id || !p.models.includes(m.name)) continue
        copies.push({
          file: p.file!,
          width: p.width ?? 0,
          height: p.height ?? 0,
          address: p.url,
          verdict: p.verdict,
          logo: false,
          person: true,
        })
        rowsHeld = rows.length
      }
      copies.sort(
        (a, b) =>
          Number(b.person ?? false) - Number(a.person ?? false) ||
          Number(a.logo) - Number(b.logo) ||
          b.width * b.height - a.width * a.height,
      )
      const names = rows.flatMap((r) => namesOfRow(table, r))
      const hero = depictionOf(heroes, table.id, names)?.picture
      audited.push({
        kind,
        table: table.id,
        register: table.name,
        series: m.series,
        model: m.name,
        spoken: m.spoken,
        rows,
        codes: codeField
          ? rows.map((r) => String(r.values[codeField] ?? '').trim()).filter((c) => c !== '')
          : [],
        copies,
        rowsHeld,
        unasked: [...unasked],
        refused: [...refused].map(([address, error]) => ({ address, error })),
        ruled: [...ruled],
        ...(hero?.file
          ? { hero: { file: hero.file, width: hero.width ?? 0, height: hero.height ?? 0 } }
          : {}),
      })
    }
  }
}

/* ------------------------------------------------------------------ */
/* One address on several models: whose picture is it?                */
/* ------------------------------------------------------------------ */

/* MEASURED ON THIS FILE, 2026-10-20: the dealer's price file hangs one picture on several
   models. Stacer's "519 Sea Ranger Lifestyle Tifs (4).jpg" is the Image Link of five rows —
   the 519, 539 and 589 Sea Rangers, centre and side console — and the 529 Assault Pro's
   photograph is held as the 509's; one "TA700.jpg" stands for the TA700, TA730 and TA800
   trailers. A picture belongs only to the model it depicts, so a copy is classified, not
   trusted:

     own       the address is on this model's rows alone
     version   shared with models of the same size that differ only by a package, a
               transom, an equipment pack (Stabicraft's Sportfish and Profish, Stacer's
               L/S and SE) or, on a motor, the shaft — a picture cannot show those, and the
               domain's rule draws a model's picture for every version, said in words
     confirm   shared with models of the same size that differ by something a picture CAN
               show (centre or side console, Open or Enclosed, Serie 1 or 2): one of them
               is depicted and a person must say which
     sister    shared with a model of another size, and the file name names that size, not
               this one's: it is another model's picture and is not held for this one */
type Share = 'own' | 'version' | 'confirm' | 'sister'

const VERSION_WORDS = new Set([
  'adventure',
  'sportfish',
  'profish',
  'offshore',
  's/s',
  'l/s',
  'se',
  'hs',
])

/** The size a model is named by: the first number in its code where the register files a
 *  code with one (a trailer, a motor), else in its name — 509, 1550, 5.5, 150, 700. */
function designatorOf(a: Audited): string {
  /* a motor is named by its power, the number after its letter: F115, LF250, T9.9 */
  if (a.kind === 'motor') {
    const hp = /[A-Z](\d+(?:\.\d+)?)/.exec(a.model.replace(/^\s*[A-Za-z]+\s*-\s*/, ''))?.[1]
    if (hp) return hp
  }
  /* a trailer's code is its size only where it is a product code (TALS650S13, RE1313-MO);
     Dunbier's and Mackay's are part numbers (9047L-IMP, 8022), so the name decides, read
     after its last " - " where it has one ("Formosa 675 Tow Catch - TA700T-EH" is a TA700) */
  const code = a.codes[0] ?? ''
  const fromCode =
    a.kind === 'boat' || !/^[A-Z]+\d/.test(code) ? undefined : code.match(/\d+(?:\.\d+)?/)?.[0]
  const stripped = a.model.replace(/^\s*[A-Za-z]+\s*-\s*/, '')
  const named = a.kind === 'trailer' ? (stripped.split(' - ').at(1) ?? stripped) : stripped
  return fromCode ?? named.match(/\d+(?:\.\d+)?/)?.[0] ?? ''
}
/** The words of a model's name beyond its maker and its size. */
const restOf = (a: Audited): Set<string> =>
  new Set(
    spellWords(a.model.replace(/^\s*[A-Za-z]+\s*-\s*/, ''))
      .filter((w) => w !== designatorOf(a) && !/^\d/.test(w))
      .map((w) => w.replace(/[()]/g, ''))
      .filter(Boolean),
  )
function spellWords(s: string): string[] {
  return s
    .toLowerCase()
    .replaceAll(/[\s_\-–.]+/g, ' ')
    .trim()
    .split(' ')
}
const numbersIn = (url: string): Set<string> =>
  new Set(
    [
      ...decodeURIComponent(url.split('?')[0]!.split('/').at(-1) ?? '')
        .replace(/\.[a-z0-9]+$/i, '')
        .matchAll(/(?<!\d)(\d+(?:\.\d+)?)(?!\d)/g),
    ].map((m) => m[1]!),
  )

const modelsOfAddress = new Map<string, Audited[]>()
for (const a of audited) {
  const table = tables[a.table]!
  for (const r of a.rows)
    for (const addr of addressesOf(table, r)) {
      const list = modelsOfAddress.get(addr) ?? []
      if (!list.includes(a)) list.push(a)
      modelsOfAddress.set(addr, list)
    }
}

function colourOf(a: Audited): string {
  const f = tables[a.table]!.fields?.find((x) => /colou?r/i.test(x.name ?? ''))?.id
  return f ? String(a.rows[0]?.values[f] ?? '') : ''
}

function shareOf(addr: string, a: Audited): Share {
  /* a factory package's picture is the motor it is built around, which every package with
     that motor shares by design */
  if (a.kind === 'package') return 'version'
  /* a motor's picture on a package row is the same motor, not a sister: compare within a kind */
  const all = (modelsOfAddress.get(addr) ?? [a]).filter((x) => x.kind === a.kind)
  if (all.length <= 1) return 'own'
  const mine = designatorOf(a)
  const same = all.filter((x) => designatorOf(x) === mine)
  if (same.length < all.length && !numbersIn(addr).has(mine)) return 'sister'
  if (same.length === 1) return 'own'
  if (a.kind === 'motor')
    return same.every((x) => colourOf(x) === colourOf(a)) ? 'version' : 'confirm'
  const rests = same.map(restOf)
  const words = new Set(rests.flatMap((s) => [...s]))
  const differing = [...words].filter((w) => !rests.every((s) => s.has(w)))
  return differing.every((w) => VERSION_WORDS.has(w)) ? 'version' : 'confirm'
}

for (const a of audited) {
  for (const c of a.copies) c.share = c.person ? 'own' : c.logo ? undefined : shareOf(c.address, a)
  a.copies.sort((x, y) => rankShare(x.share) - rankShare(y.share))
  a.rowsHeld = a.copies.some((c) => c.person)
    ? a.rows.length
    : a.rows.filter((r) =>
        addressesOf(tables[a.table]!, r).some((addr) => {
          const c = a.copies.find((x) => x.address === addr)
          return c && !c.logo && c.share !== 'sister'
        }),
      ).length
}
function rankShare(s?: Share): number {
  return s === 'own' ? 0 : s === 'version' ? 1 : s === 'confirm' ? 2 : 3
}

/** The held copy that honestly stands for the model: never a logo, never a sister's. */
const honestCopy = (a: Audited) => a.copies.find((c) => !c.logo && c.share !== 'sister')
const sisterOnly = (a: Audited) => !honestCopy(a) && a.copies.some((c) => c.share === 'sister')

/* ------------------------------------------------------------------ */
/* The brands                                                          */
/* ------------------------------------------------------------------ */

/** The makers the file sells, as marks.ts names them, and the dealership itself. */
const BRANDS = [
  'Northside Marine',
  'Highfield',
  'Stacer',
  'Stabicraft',
  'Surtees',
  'Jeanneau',
  'Haines Signature',
  'Formosa',
  'Yamaha',
  'ePropulsion',
  'Mercury',
  'Dunbier',
  'Mackay',
  'GFAB',
  'REDCO',
  'TINKA',
  'NSM Custom',
] as const

function brandRow(brand: string) {
  const rows = marks.filter((m) => m.brand === brand)
  const dark = rows.find((m) => m.file && m.variant === 'dark')
  const white = rows.find((m) => m.file && m.variant === 'white')
  const gap = rows.find((m) => m.error)
  return { brand, dark, white, gap, organisation: rows.some((m) => m.role === 'organisation') }
}

/* ------------------------------------------------------------------ */
/* gaps.md                                                             */
/* ------------------------------------------------------------------ */

/** What a held picture shows beyond the item it hangs on, read off the pixels by a person.
 *  A caption on the paper is drawn from here, never from a guess. */
const OBSERVED: readonly { item: string; file: string; shows: string; seen: string }[] = [
  {
    item: 'Stacer 529 Assault Pro (Tournament)',
    file: 'public/seed-images/529-assault-lifestyle-tiffs-7-1024x676-fbf66995.webp',
    shows:
      'the boat under way with an **Evinrude** outboard (the cowl reads EVINRUDE). The file sells Yamaha and ePropulsion; a quote with any motor captions it "photographed with a different outboard".',
    seen: 'looked at by Claude (imagery audit), 2026-10-20, at 1024×676',
  },
  {
    item: 'Highfield SP560 (hero)',
    file: 'public/hero-images/highfield-sp560-84445423.webp',
    shows:
      'a **Mercury 115** outboard (the cowl reads MERCURY and 115), light grey tubes with a dark rubbing strake, a T-top console. The colourway is not recorded against any of the SP560 rows, so the paper says "your boat’s finish and motor are as quoted", never that this is the finish quoted.',
    seen: 'looked at by Claude (imagery audit), 2026-10-20, at 1280 px',
  },
]

const size = (w?: number, h?: number) => (w && h ? `${w}×${h}` : '')
const pct = (n: number, d: number) => (d === 0 ? '' : `${Math.round((n / d) * 100)}%`)

function gapsDoc(proposed?: Map<string, number>): string {
  const L: string[] = []
  const say = (s = '') => L.push(s)
  say('# What the file carries, and which of it has a picture')
  say()
  say(
    `Counted on ${TODAY} by \`tools/seed/propose-images.ts\` over the pack in \`data/northside/\`, through the picker's own collapse (\`fleetOf\` in \`src/screens/picker/fleet.ts\`) — so a "model" here is exactly what the picker shows: Highfield's 588 rows are 67 models, every other boat register is one row a model, and a motor or a trailer is one row. A retired register (\`trl_obsolete\`) and a row marked no longer sold are not offered by the picker and are not counted.`,
  )
  say()
  say(
    "A model is **held** when a copy of one of its own rows' picture addresses sits under `public/seed-images/` (the ledger is `data/northside/images.json`) and that copy is not a maker's logo. A model is also **held** when a person attached a catalogue picture to it in `data/northside/pictures.json`, and a row's own copy a person refused there (a logo, a sister model) does not count. A **hero** is an on-water photograph in the hero tier of `data/northside/pictures.json`, attached to its model's rows by id. A **mark** is a row of `data/northside/marks-ledger.json`. Sizes are the held copy's, never the source's.",
  )
  say()

  /* the dealership's own mark first: it is the letterhead */
  const nsm = brandRow('Northside Marine')
  say("## Northside Marine's own mark — held")
  say()
  if (nsm.dark) {
    const d = marks.find((m) => m.id === nsm.dark!.id) as MarkRow & Record<string, unknown>
    const w = marks.find((m) => m.id === nsm.white?.id) as
      (MarkRow & Record<string, unknown>) | undefined
    say(
      `- **Dark ink, for white paper (the letterhead):** \`public/brand-marks/${d.file}\`, ${size(d.width, d.height)} transparent PNG, ink \`${String(d.ink)}\`, held byte-for-byte at its source size. It **prints on white paper**.`,
    )
    if (w)
      say(
        `- **White ink, for the water and dark grounds (the shell, Home):** \`public/brand-marks/${w.file}\`, ${size(w.width, w.height)}, ink \`${String(w.ink)}\`. It cannot print on the quote.`,
      )
    say(
      `- **Where it came from:** the dealership's own home page, \`${String(d.pageUrl)}\` — ${String(d.foundAt)} and the footer twin — on Shopify's CDN at \`${String(d.url)}\`. The site moved from WordPress to Shopify after the September sweep: the three addresses the sweep recorded (\`/wp-content/uploads/2025/04/nsm_logo.png\`, \`NSM_logo_w.png\`, \`/online-store/…/NSM-Logo-blue.png\`) now answer 404, and the new site answers a script (HTTP 200) where the old one answered Cloudflare's 403.`,
    )
    say(
      '- **Checked against the past:** the Internet Archive holds the old WordPress header (`web.archive.org/web/20251129171843/…/nsm_logo.png`, 800×400): the same waves and "northside marine · EST. 1965" lockup, there with a yellow "Life beyond the shore" line beneath. The current mark is that lockup without the line, at more than twice the width. The tagline lockup is offered on the `northside` sheet as a secondary mark, not held.',
    )
    say(`- **Verified:** ${String(d.verifiedBy)}`)
    say(
      '- **Still worth asking the owner for:** the vector original (SVG, PDF or AI) of the mark. No vector is served anywhere public — the site draws a PNG in both places — and a letterhead printed at 20 mm tall from 448 px is about 570 dpi, so the PNG is enough for paper; a vector is only better.',
    )
  } else {
    say(
      '- **Not held.** No honest public copy was found; see the end of this file for what to ask the owner.',
    )
  }
  say()

  /* the counts */
  say('## The counts')
  say()
  say(
    '| what the file carries | models | held | missing | of the missing: only a sister model’s picture held | of the held: a person must confirm the version | held at long edge ≥ 1100 | with a hero |',
  )
  say('|---|---:|---:|---:|---:|---:|---:|---:|')
  for (const kind of KINDS) {
    const all = audited.filter((a) => a.kind === kind)
    const held = all.filter((a) => honestCopy(a))
    const big = held.filter((a) => Math.max(honestCopy(a)!.width, honestCopy(a)!.height) >= 1100)
    const hero = all.filter((a) => a.hero)
    const label = {
      boat: 'boats',
      motor: 'motors',
      trailer: 'trailers',
      package: 'factory motor packages',
    }[kind]
    say(
      `| ${label} | ${all.length} | ${held.length} | **${all.length - held.length}** | ${all.filter(sisterOnly).length || ''} | ${held.filter((a) => honestCopy(a)!.share === 'confirm').length || ''} | ${big.length} | ${kind === 'boat' ? hero.length : '—'} |`,
    )
  }
  const brands = BRANDS.map(brandRow)
  const withMark = brands.filter((b) => b.dark || b.white)
  const withDark = brands.filter((b) => b.dark)
  say(
    `| brands (the dealership and every maker the file names) | ${brands.length} | ${withMark.length} | **${brands.length - withMark.length}** | | | ${withDark.length} with a dark-ink mark | — |`,
  )
  say()
  say(
    'Parts & Accessories (2,937 rows), Dealer Fit Packages (1,777 rows) and Rigging Kits (650 rows) carry **no picture column at all** — measured: not one of their rows holds an address — so none of them has a picture, held or not, and there is nothing on the file to hold. Labour, oils and registration are the same. They are not counted above because there is nothing on the file to fill; a picture for a part would have to start as a column a person adds on `/data`.',
  )
  say()

  for (const kind of KINDS) {
    const regs = registersByKind.get(kind) ?? []
    const label = {
      boat: 'Boats',
      motor: 'Motors',
      trailer: 'Trailers',
      package: 'Factory motor packages',
    }[kind]
    say(`### ${label}, register by register`)
    say()
    say(
      '| register | rows | models | held | missing | largest held | logo held as the picture | sister model’s picture held | version to confirm | own address never asked | own address refused |' +
        (kind === 'boat' ? ' hero |' : ''),
    )
    say('|---|---:|---:|---:|---:|---|---:|---:|---:|---:|---:|' + (kind === 'boat' ? '---:|' : ''))
    for (const r of regs) {
      const all = audited.filter((a) => a.table === r.id)
      const held = all.filter((a) => honestCopy(a))
      const largest = held
        .map((a) => honestCopy(a)!)
        .toSorted((a, b) => b.width * b.height - a.width * a.height)[0]
      const logo = all.filter((a) => a.copies.some((c) => c.logo) && !honestCopy(a)).length
      const unasked = all.filter((a) => !honestCopy(a) && a.unasked.length > 0).length
      const refused = all.filter((a) => !honestCopy(a) && a.refused.length > 0).length
      say(
        `| ${r.name} \`${r.id}\` | ${r.rows} | ${r.models} | ${held.length} | **${all.length - held.length}** | ${largest ? size(largest.width, largest.height) : '—'} | ${logo || ''} | ${all.filter(sisterOnly).length || ''} | ${held.filter((a) => honestCopy(a)!.share === 'confirm').length || ''} | ${unasked || ''} | ${refused || ''} |` +
          (kind === 'boat' ? ` ${all.filter((a) => a.hero).length} |` : ''),
      )
    }
    say()
  }

  /* Highfield, below the model: the colourways */
  const hf = audited.filter((a) => a.table === 'boat_highfield')
  const hfRows = hf.reduce((n, a) => n + a.rows.length, 0)
  const hfRowsHeld = hf.reduce((n, a) => n + a.rowsHeld, 0)
  say(
    `**Highfield below the model.** Of its ${hfRows} rows (colourways and materials), ${hfRowsHeld} (${pct(hfRowsHeld, hfRows)}) have their own picture held. A colourway row with none shows its model's picture and says it is the model's, never another colourway's.`,
  )
  say()

  /* what a held picture shows that the paper may say otherwise (quote-spec §3, §5) */
  say('## What a held picture shows that a quote may say otherwise')
  say()
  say(
    "The quote's paper reads this ledger (`docs/research/proposal/quote-spec.md` §3 and §5): a picture beside a line, or on the cover, must be one a person marked as that exact item, and where it shows something the quote does not sell, the caption says so. Each line below was looked at, not inferred.",
  )
  say()
  for (const o of OBSERVED) say(`- **${o.item}** — \`${o.file}\`: ${o.shows} *(${o.seen})*`)
  const logoRows = audited.filter((a) => a.copies.some((c) => c.logo))
  if (logoRows.length > 0) {
    const files = [
      ...new Set(logoRows.flatMap((a) => a.copies.filter((c) => c.logo).map((c) => c.file))),
    ]
    say(
      `- **${logoRows.length} trailer rows whose only held picture is a logo sheet** — \`${files.join('`, `')}\`, the REDCO and TINKA logos side by side, which the pixel judge filed as "scene". It is not a trailer, so no line and no cover may draw it; these rows count as missing above. They include ${logoRows
        .filter((a) => /SP560|SP660|MF605|CC5\.5/.test(a.model))
        .map((a) => `"${a.model}"`)
        .join(', ')} — the trailer quote B prints.`,
    )
  }
  say()

  const confirm = audited.filter((a) => honestCopy(a)?.share === 'confirm')
  if (confirm.length > 0) {
    say(`## Held, but one picture stands for versions it can tell apart — ${confirm.length} models`)
    say()
    say(
      'The dealer’s file gives these rows one picture between them, and the versions differ in something a photograph shows (a centre or a side console, an open or an enclosed cabin, a series, a trailer’s rollers or brakes). The picture is of one of them. Until a person says which, a quote line for the other must not draw it; a screen may, saying it is the model’s picture.',
    )
    say()
    const seenAddr = new Set<string>()
    for (const a of confirm) {
      const c = honestCopy(a)!
      if (seenAddr.has(c.address)) continue
      seenAddr.add(c.address)
      const on = (modelsOfAddress.get(c.address) ?? []).map((x) => x.model).join(' · ')
      say(`- \`${c.file}\` — ${on}`)
    }
    say()
  }

  /* the brands */
  say('## Brands')
  say()
  say('| brand | dark ink (prints on white) | white ink | why none |')
  say('|---|---|---|---|')
  for (const b of brands) {
    const why =
      b.gap?.error ??
      (b.brand === 'NSM Custom'
        ? "the dealership's own trailer label; no public mark exists (motors-trailers-marks.md)"
        : b.brand === 'REDCO' || b.brand === 'TINKA'
          ? 'no logo file of its own is published; the only file is `redco-tinka-logos-01.png`, both brands’ logos on one sheet, which is not a mark and must not stand as one'
          : !b.dark && !b.white && b.brand === 'Mercury'
            ? ''
            : !b.dark && !b.white
              ? 'not looked for'
              : '')
    const darkCell = b.dark ? `\`${b.dark.file}\` ${size(b.dark.width, b.dark.height)}` : '—'
    const whiteCell = b.white ? `\`${b.white.file}\` ${size(b.white.width, b.white.height)}` : '—'
    say(
      `| ${b.brand}${b.organisation ? ' (the dealership)' : ''} | ${darkCell} | ${whiteCell} | ${why} |`,
    )
  }
  say()

  /* the models with no picture, by name */
  say('## Every model with no picture held, by name')
  say()
  say(
    'Grouped by register. Beside each: why its own address does not give it one, and — once the proposal run has been made — how many measured candidates were found for it (`docs/research/imagery/proposals/`). "none honest" means nothing in `candidates.json` depicts that exact model.',
  )
  say()
  for (const kind of KINDS) {
    for (const r of registersByKind.get(kind) ?? []) {
      const missing = audited.filter((a) => a.table === r.id && !honestCopy(a))
      if (missing.length === 0) continue
      say(`### ${r.name} — ${missing.length} of ${r.models}`)
      say()
      for (const a of missing) {
        const sister = a.copies.find((c) => c.share === 'sister')
        const others = sister
          ? (modelsOfAddress.get(sister.address) ?? [])
              .filter((x) => x !== a)
              .map((x) => x.model)
              .join(', ')
          : ''
        const own = sister
          ? `its row’s picture is another model’s (\`${sister.file}\`, also the Image Link of ${others})`
          : a.copies.some((c) => c.logo)
            ? `its own picture is a logo (\`${a.copies[0]!.file}\`)`
            : a.ruled.length > 0
              ? `its own picture is refused: ${a.ruled[0]}`
              : a.unasked.length > 0
                ? 'its own address has never been asked for'
                : a.refused.length > 0
                  ? `its own address was refused: ${a.refused[0]!.error}`
                  : 'the file gives it no picture address'
        const p = proposed?.get(keyOf(a))
        const prop = proposed ? (p ? ` · **${p} proposed**` : ' · none honest') : ''
        say(`- ${a.model} — ${own}${prop}`)
      }
      say()
    }
  }
  return L.join('\n') + '\n'
}

const keyOf = (a: { table: string; model: string }) => `${a.table}::${a.model}`

if (process.argv.includes('--count')) {
  await writeFile(path.join(OUT_DIR, 'gaps.md'), gapsDoc())
  for (const kind of KINDS) {
    const all = audited.filter((a) => a.kind === kind)
    console.log(
      `${kind.padEnd(8)} ${all.length} models, ${all.filter((a) => honestCopy(a)).length} held`,
    )
  }
  process.exit(0)
}

/* ------------------------------------------------------------------ */
/* Matching the candidates to the gaps                                 */
/* ------------------------------------------------------------------ */

interface Candidate {
  brand?: string
  series?: string | null
  model?: string | null
  variant?: string
  kind?: string
  url: string
  pageUrl?: string
  host?: string
  status?: number
  contentType?: string
  bytes?: number
  width?: number
  height?: number
  refused?: boolean
  tooSmall?: boolean
  licenceNote?: string
  note?: string
  caveat?: string
  seedModels?: string[]
  seedModelCodes?: string[]
  alsoAttachedTo?: unknown[]
  group?: string
}

const candidates = readJson<Candidate[]>(OUT_DIR, 'candidates.json')

/** Which registers a sweep's brand can be a row of. */
const BRAND_TABLES: Record<string, string[]> = {
  Highfield: ['boat_highfield'],
  Stacer: ['boat_stacer', 'trl_stacertrailers'],
  'Merry Fisher': ['boat_jeanneau'],
  'Cap Camarat': ['boat_jeanneau'],
  Jeanneau: ['boat_jeanneau'],
  'Haines Signature': ['boat_haines'],
  Formosa: ['boat_formosa'],
  Stabicraft: ['boat_stabicraft'],
  Surtees: ['boat_surtees'],
  Yamaha: ['mot_yamaha'],
  ePropulsion: ['mot_epropulsion'],
  Dunbier: ['trl_dunbier', 'trl_bmt'],
  Mackay: ['trl_mackay'],
  GFAB: ['trl_gfab'],
  REDCO: ['trl_redco', 'trl_nsmcustom'],
  TINKA: ['trl_redco'],
}
/** Jeanneau's two lines are filed by their line's name; the file writes it into the model. */
const LINE_PREFIX: Record<string, string> = {
  'Merry Fisher': 'Merry Fisher ',
  'Cap Camarat': 'Cap Camarat ',
}

/** Spelling only: case, and the separators the file writes between words. */
const spell = (s: string) =>
  s
    .toLowerCase()
    .replaceAll(/[\s_\-–.]+/g, ' ')
    .trim()

/** A note that says the picture is not exactly this model. */
const DOUBT =
  /UNRESOLVED|not identified|predecessor|does not distinguish|cannot be told|one letter longer|the seed carries \S+ and \S+|named for the|older studio picture named|sister/i
/** The words in which two of the file's models differ only by a package or a transom. */
const VERSION_ONLY = /^(adventure|sportfish|profish|offshore|s\/s|l\/s|ss|ls)$/i

/** File-name gates, read before any pixel. */
const NOT_WHOLE_BOAT =
  /_int_|[-_ ]int[-_. ]|internal|interior|helm|cockpit|dash(board)?|seat|locker|transom|detail|console-?close|swatch|logo|badge|spec|layout|drawing|plan[-_. ]/i
const OVERHEAD = /(^|[-_ ])OH([-_ .]|$)|overhead|top-?down|birds?-?eye/i
const STUDIO_NAME = /PKG|package|2026WEB|render|studio|side-?view|profile|cut-?out|white/i
const SCENE_NAME = /lifestyle|EXT|DJI|on-?water|running|action|drone/i

/* Formosa's own library files other dealers' delivery photographs under the dealer's name
   (GCBC, Camden Haven Marine, Walsh): another business's branding, watermark or customer on a
   Northside quote. Read off the file names on 2026-10-20 and confirmed on the sheet. */
const OTHER_DEALER = /gcbc|camden-?haven|walsh|boating-?centre|your-?mates/i

/* THE LAST GATE, KEPT: what a person rejected on a contact sheet, so a re-run proposes the
   next candidate instead of the same wrong one. `kind` says what it was rejected AS — a
   frame can be a fine catalogue copy and no hero. */
const EYE_REJECTED: Record<string, { as: 'hero' | 'any'; why: string }> = {
  'https://www.cms.surteesboats.com/wp-content/uploads/2024/01/DJI_0252.jpg': {
    as: 'hero',
    why: 'on its trailer in a car park, not on the water',
  },
  'https://www.formosamarineboats.com.au/wp-content/uploads/2024/06/new-model-formosa-grt-425-tiller.jpg':
    { as: 'any', why: 'a “NEW!” promotion with the model name burnt in' },
  'https://www.formosamarineboats.com.au/wp-content/uploads/2021/09/2020-SRT-PRO-595-Centre-Console.jpg':
    { as: 'hero', why: 'a banner with a slogan burnt in' },
  'https://media.highfieldboats.com/wp-content/uploads/2024/05/slika-94.jpg': {
    as: 'hero',
    why: 'a steering wheel close-up, not the boat',
  },
  'https://media.highfieldboats.com/wp-content/uploads/2024/06/Polarstern-4.jpg': {
    as: 'hero',
    why: 'a ship’s deck with the RIB slung on davits, not on the water',
  },
  'https://media.highfieldboats.com/wp-content/uploads/2022/04/Sport-360-08.jpg': {
    as: 'hero',
    why: 'drone frame: the boat is a speck in the sea',
  },
  'https://media.highfieldboats.com/wp-content/uploads/2022/05/DJI_0159.jpg': {
    as: 'hero',
    why: 'a sailing yacht is the subject; the SP420 is its small tender',
  },
  'https://media.highfieldboats.com/wp-content/uploads/2024/03/084A9304.jpg': {
    as: 'hero',
    why: 'a hull light detail, not the boat',
  },
  'https://media.highfieldboats.com/wp-content/uploads/2024/06/IMG_0154.jpg': {
    as: 'hero',
    why: 'a beach; the boat is a speck',
  },
  'https://media.highfieldboats.com/wp-content/uploads/2022/08/UL310-with-engine-16.JPG': {
    as: 'hero',
    why: 'on sand, not on the water',
  },
  'https://www.highfieldboats.com/wp-content/uploads/2015/06/image-5.jpeg': {
    as: 'hero',
    why: 'two people fill the frame; the boat is barely seen',
  },
  'https://www.stacer.com.au/site/stacer.com.au/filesystem/images/Boat%20Images/2023/Open%20Boats/Seasprite/399/DSC08348.jpg':
    { as: 'any', why: 'the inside of the hull, not the boat' },
  'https://www.formosamarineboats.com.au/wp-content/uploads/2021/10/your-mates-brewing-formosa-srt-p.jpg':
    { as: 'any', why: 'a customer’s custom wrap, pillarboxed in black' },
  'https://www.formosamarineboats.com.au/wp-content/uploads/2026/07/gcbc-demo-xbow-thumbnail.jpg': {
    as: 'any',
    why: 'carries another dealer’s watermark (Gold Coast Boating Centre)',
  },
  'https://hainessignature.com.au/wp-content/uploads/2026/04/545_W.jpg': {
    as: 'any',
    why: 'the stern and outboard only, not the whole boat',
  },
  'https://www.formosamarineboats.com.au/wp-content/uploads/2026/07/495sc-tickle-5.jpg': {
    as: 'any',
    why: 'the deck and console from above, not the boat',
  },
  'https://www.formosamarineboats.com.au/wp-content/uploads/2019/05/2020-550-SRT-PRO-525-Centre-Console-Camden-Haven-Marine-black_6219.jpg':
    { as: 'hero', why: 'on its trailer in another dealer’s yard, not on the water' },
  'https://www.formosamarineboats.com.au/wp-content/uploads/2019/05/2021-548-SRT-PRO-525-Side-Console-Walsh-Laguna-ALL-Graph-Grey_6482.jpg':
    { as: 'any', why: 'the cockpit seats, not the boat' },
  'https://www.formosamarineboats.com.au/wp-content/uploads/2019/05/2020-520-SRT-PRO-565-Territory-Graphite-Grey-GCBC_6015.jpg':
    { as: 'any', why: 'the checker-plate floor, not the boat' },
  'https://www.formosamarineboats.com.au/wp-content/uploads/2026/01/Home-Page-Banner-territory-SRT-2.jpg':
    { as: 'hero', why: 'a home-page banner, mostly blank, the boat small at one side' },
  'https://stabicraft.com/assets/Uploads/1450-Frontier/Other-Images/profish.jpg': {
    as: 'hero',
    why: 'on its trailer in a car park, not on the water',
  },
  'https://www.cms.surteesboats.com/wp-content/uploads/2024/01/575-PF-73.jpg': {
    as: 'any',
    why: 'the cockpit, not the boat',
  },
}

/* Whole shoots a second look rejected as heroes: each time one frame was rejected the next
   frame of the same shoot took its place and failed the same way. */
const EYE_REJECTED_SHOOTS: { match: RegExp; why: string }[] = [
  { match: /\/slika-\d+\.jpg$/i, why: 'the PA460 detail shoot: wheel and console close-ups' },
  { match: /\/Polarstern-\d+\.jpg$/i, why: 'an expedition ship’s deck and quay; the RIB is cargo' },
  {
    match: /\/Sport-360-\d+\.jpg$/i,
    why: 'the SP360 drone set: the boat is a speck or a catamaran’s tender',
  },
  {
    match: /\/UL310-(with-engine-)?\d+\.JPG$/i,
    why: 'the UL310 shoot is on a beach: sand and tube close-ups',
  },
  { match: /Seasprite\/399\/DSC\d+\.jpg$/i, why: 'the 399 Seasprite interior set' },
  { match: /\/575-PF-\d+\.jpg$/i, why: 'the Surtees 575 Pro Fisher cockpit and fit-out set' },
  {
    match: /\/2015\/06\/image-\d+\.jpe?g$/i,
    why: 'Highfield’s 2015 set: expedition decks and close crops',
  },
  { match: /-TM\.jpg$/i, why: 'Formosa’s showroom set: boats on trailers indoors' },
  { match: /home-?page-?banner/i, why: 'a home-page banner, cropped for text beside it' },
  {
    match: /formosamarineboats\.com\.au\/wp-content\/uploads\/2019\/05\/20\d\d-/i,
    why: 'Formosa’s customer-delivery set: yards, trailers, consoles and slogans',
  },
]
const rejectedAsHero = (url: string): boolean =>
  !!EYE_REJECTED[url] || EYE_REJECTED_SHOOTS.some((s) => s.match.test(url))

const fileOf = (url: string) => decodeURIComponent(url.split('?')[0]!.split('/').at(-1) ?? '')

function eligible(c: Candidate): string | null {
  if (EYE_REJECTED[c.url]?.as === 'any') return 'rejected by eye on a contact sheet'
  if (OTHER_DEALER.test(fileOf(c.url))) return 'another dealer’s photograph, by its file name'
  if (c.status === undefined || c.status < 200 || c.status >= 300) return 'not served'
  if (c.refused) return 'refused'
  if (c.tooSmall) return 'under 800 px'
  if (!(c.contentType ?? '').startsWith('image/')) return 'not a raster or vector picture'
  if (!c.width || !c.height) return 'no pixel size'
  if (!['hero', 'gallery', 'render'].includes(c.kind ?? '')) return `a ${c.kind}`
  if (!c.model || c.model.trim() === '') return 'filed to a series or configuration, not a model'
  if (c.alsoAttachedTo && c.alsoAttachedTo.length > 0) return 'attached to two models'
  if (NOT_WHOLE_BOAT.test(fileOf(c.url))) return 'the file name says it is not the whole item'
  if (DOUBT.test(`${c.note ?? ''} ${c.caveat ?? ''}`))
    return 'its own note says it may not be this exact model'
  return null
}

interface Match {
  c: Candidate
  /** the file's models this candidate depicts */
  models: Audited[]
  /** 'model': the model itself; 'rows': only some rows of it (a colourway, a package);
   *  'hull': the hull, shared by versions the file splits by package or transom;
   *  'family': a motor family render covering the file's codes its sweep listed */
  scope: 'model' | 'rows' | 'hull' | 'family'
  /** the rows it depicts, where fewer than all */
  rowIds?: string[]
  depicts: string
  differs: string[]
}

const byTable = new Map<string, Audited[]>()
for (const a of audited) {
  if (!byTable.has(a.table)) byTable.set(a.table, [])
  byTable.get(a.table)!.push(a)
}

function matchCandidate(c: Candidate): Match | string {
  const why = eligible(c)
  if (why) return why
  const pool = (BRAND_TABLES[c.brand ?? ''] ?? []).flatMap((t) => byTable.get(t) ?? [])
  if (pool.length === 0) return 'no register of this brand'
  const differs: string[] = []
  if (c.caveat) differs.push(c.caveat)

  /* 1. Highfield: the file's own Model Codes */
  if (c.seedModelCodes && c.seedModelCodes.length > 0) {
    const codes = new Set(c.seedModelCodes)
    const hit = pool.filter((a) => a.codes.some((x) => codes.has(x)))
    if (hit.length !== 1)
      return hit.length === 0 ? 'its codes name no row' : 'its codes span two models'
    const a = hit[0]!
    if (spell(a.model) !== spell(c.model ?? '')) return 'its codes and its model name disagree'
    if (![...codes].every((x) => a.codes.includes(x))) return 'its codes span two models'
    const rowIds = a.rows.filter((r) => codes.has(codeOf(a, r))).map((r) => r.id)
    const whole = rowIds.length === a.rows.length || !c.variant
    return {
      c,
      models: [a],
      scope: whole ? 'model' : 'rows',
      ...(whole ? {} : { rowIds }),
      depicts: whole
        ? `Highfield ${a.model}`
        : `Highfield ${a.model} in the ${c.variant} colourway`,
      differs,
    }
  }

  /* 2. Stacer boats: the file's Model Codes in `seedModels` */
  if (
    c.brand === 'Stacer' &&
    c.seedModels &&
    c.seedModels.length > 0 &&
    pool.some((a) => a.table === 'boat_stacer')
  ) {
    const codes = new Set(c.seedModels)
    const hit = pool.filter((a) => a.table === 'boat_stacer' && a.codes.some((x) => codes.has(x)))
    if (hit.length === 0) return 'its codes name no row'
    if (hit.length > 1) {
      /* two rows that differ only by transom (S/S, L/S): the hull */
      const stems = new Set(
        hit.map((a) =>
          spell(a.model)
            .replace(/\s*\((s\/s|l\/s)\)$/, '')
            .replace(/\s+(s\/s|l\/s)$/, ''),
        ),
      )
      if (stems.size !== 1) return 'its codes span two models'
      return {
        c,
        models: hit,
        scope: 'hull',
        depicts: `Stacer ${c.model} (hull; transom not shown)`,
        differs,
      }
    }
    return {
      c,
      models: hit,
      scope: 'model',
      depicts: `Stacer ${stripMaker(hit[0]!.model)}`,
      differs,
    }
  }

  /* 3. Yamaha: the code list its sweep wrote, "Covers the seed's F150 rows in Grey: F150LC, …" */
  const covers = /Covers the seed's .+? rows?(?: in ([A-Za-z ]+))?: ([A-Z0-9., \-/]+)/.exec(
    c.note ?? '',
  )
  if (c.brand === 'Yamaha' && covers) {
    const codes = new Set(
      covers[2]!
        .split(',')
        .map((s) => s.trim().replace(/\.$/, ''))
        .filter(Boolean),
    )
    const hit = pool.filter((a) => a.codes.some((x) => codes.has(x)))
    if (hit.length === 0) return 'its codes name no row'
    const colour = covers[1]?.trim()
    if (c.width && c.height && c.width / c.height > 3)
      differs.push('a 360° filmstrip: one frame of it is the picture')
    return {
      c,
      models: hit,
      scope: hit.length === 1 ? 'model' : 'family',
      depicts: `Yamaha ${c.model}${colour ? ` in ${colour}` : ''} (the family render; the shaft length is not shown)`,
      differs,
    }
  }

  /* 4. Everything else: the name, through the domain's one rule, after folding spelling */
  if (c.brand === 'Formosa' && c.seedModels && c.seedModels.length > 1)
    return 'a configuration picture for several lengths'
  const base = (LINE_PREFIX[c.brand ?? ''] ?? '') + (c.model ?? '')
  const withVersion = c.variant && c.brand === 'Stabicraft' ? `${base} (${c.variant})` : base
  const found: { a: Audited; st: Standing; beyond: string }[] = []
  for (const a of pool) {
    const table = tables[a.table]!
    const names = [a.model, ...a.rows.flatMap((r) => namesOfRow(table, r))]
    let best: { st: Standing; beyond: string } | null = null
    for (const n of names) {
      const st = standing(spell(withVersion), spell(n))
      if (!st) continue
      const beyond = spell(n)
        .slice(spell(n).indexOf(spell(withVersion)) + spell(withVersion).length)
        .replace(/[()\s]+/g, ' ')
        .trim()
      if (st === 'same' || !best) best = { st, beyond }
      if (st === 'same') break
    }
    if (best) found.push({ a, ...best })
  }
  if (found.length === 0) return 'its model name is not one the file carries'
  const exact = found.filter((f) => f.st === 'same')
  if (exact.length === 1)
    return {
      c,
      models: [exact[0]!.a],
      scope: 'model',
      depicts: depictsOf(c, exact[0]!.a),
      differs: colourway(c, differs, [exact[0]!.a]),
    }
  if (found.length === 1)
    return {
      c,
      models: [found[0]!.a],
      scope: 'model',
      depicts: depictsOf(c, found[0]!.a),
      differs: colourway(c, differs, [found[0]!.a]),
    }
  /* several of the file's models carry this name: only a package or a transom may differ */
  if (found.every((f) => VERSION_ONLY.test(f.beyond)))
    return {
      c,
      models: found.map((f) => f.a),
      scope: 'hull',
      depicts: `${c.brand} ${c.model} (the hull; the package is not shown)`,
      differs: colourway(
        c,
        differs,
        found.map((f) => f.a),
      ),
    }
  return `its name stands in ${found.length} of the file's models that differ by more than a package (${found.map((f) => f.a.model).join(' / ')})`
}

function codeOf(a: Audited, r: Row): string {
  const f = codeFieldOf(tables[a.table]!)
  return f ? String(r.values[f] ?? '').trim() : ''
}
function stripMaker(name: string): string {
  return name
    .replace(/^\s*[A-Za-z]+\s*-\s*/, '')
    .replace(/\.$/, '')
    .trim()
}
function depictsOf(c: Candidate, a: Audited): string {
  const lead =
    c.brand === 'Merry Fisher' || c.brand === 'Cap Camarat' ? 'Jeanneau' : (c.brand ?? '')
  return (
    `${lead} ${(LINE_PREFIX[c.brand ?? ''] ?? '') + (c.model ?? '')}${c.variant && c.brand === 'Stabicraft' ? ` (${c.variant})` : ''}`.trim() +
    (spell(a.model).includes(spell(c.model ?? '')) ? '' : ` [file: ${a.model}]`)
  )
}
function colourway(c: Candidate, differs: string[], models: readonly Audited[]): string[] {
  /* a variant that IS the row's own code (Dunbier's 9293) confirms the match; it is not a difference */
  const v = spell(c.variant ?? '')
  if (models.some((a) => a.codes.some((x) => spell(x) === v || spell(x).startsWith(v + ' '))))
    return differs
  if (c.variant && c.brand !== 'Stabicraft')
    return [
      ...differs,
      `shows the ${c.variant} ${c.brand === 'Surtees' ? 'colour; the file names no colour for this boat' : 'variant'}`,
    ]
  return differs
}

/* every gap's candidates */
const gapModels = audited.filter((a) => a.kind !== 'package' && !honestCopy(a))
const heroGaps = audited.filter((a) => a.kind === 'boat' && !a.hero)
const forModel = new Map<string, Match[]>()
const heldBack = new Map<string, number>()
for (const c of candidates) {
  const m = matchCandidate(c)
  if (typeof m === 'string') {
    heldBack.set(m, (heldBack.get(m) ?? 0) + 1)
    continue
  }
  for (const a of m.models) {
    const k = keyOf(a)
    if (!forModel.has(k)) forModel.set(k, [])
    forModel.get(k)!.push(m)
  }
}

/* ------------------------------------------------------------------ */
/* Fetching, judging, measuring                                        */
/* ------------------------------------------------------------------ */

mkdirSync(CACHE, { recursive: true })
interface Seen {
  ok: boolean
  status?: number
  type?: string
  bytes?: number
  width?: number
  height?: number
  verdict?: string
  /** what the copy would cost held: webp at 1100 (catalogue) and at 2560 (hero) */
  catalogueBytes?: number
  heroBytes?: number
  error?: string
}
const seenPath = (url: string) => path.join(CACHE, `${sha1Hex(url)}.seen.json`)
const lastAt = new Map<string, number>()

async function see(url: string, referer?: string, filmstrip = false): Promise<Seen> {
  const sp = seenPath(url)
  if (existsSync(sp)) return JSON.parse(readFileSync(sp, 'utf8')) as Seen
  const host = url.split('/')[2] ?? ''
  const wait = (lastAt.get(host) ?? 0) + 900 - Date.now()
  if (wait > 0) await new Promise((r) => setTimeout(r, wait))
  lastAt.set(host, Date.now())
  let seen: Seen
  try {
    const orig = path.join(CACHE, sha1Hex(url))
    let buf: Buffer
    let type = ''
    let status = 200
    if (existsSync(orig)) {
      buf = readFileSync(orig)
      const meta = existsSync(`${orig}.json`)
        ? (JSON.parse(readFileSync(`${orig}.json`, 'utf8')) as { type?: string })
        : {}
      type = meta.type ?? ''
    } else {
      const res = await fetch(url, {
        headers: {
          'user-agent': UA,
          accept: 'image/avif,image/webp,image/png,image/*;q=0.9,*/*;q=0.5',
          ...(referer ? { referer } : {}),
        },
        signal: AbortSignal.timeout(60_000),
      })
      status = res.status
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      type = res.headers.get('content-type') ?? ''
      buf = Buffer.from(await res.arrayBuffer())
      writeFileSync(orig, buf)
      writeFileSync(
        `${orig}.json`,
        JSON.stringify({ type, bytes: buf.length, via: 'host' }, null, 2),
      )
    }
    /* an SVG is drawn at a density a sheet can read; a raster is taken as it hangs */
    const svg = /svg/.test(type) || buf.subarray(0, 512).toString('utf8').includes('<svg')
    let img = sharp(buf, { limitInputPixels: false, ...(svg ? { density: 300 } : {}) }).rotate()
    const meta = await img.metadata()
    let width = meta.autoOrient?.width ?? meta.width ?? 0
    let height = meta.autoOrient?.height ?? meta.height ?? 0
    if (filmstrip && width / height > 3) {
      /* a 360° filmstrip: the first of its equal frames is the picture */
      const frames = Math.round(width / height / (570 / 640)) || 5
      const fw = Math.floor(width / frames)
      img = sharp(await sharp(buf).extract({ left: 0, top: 0, width: fw, height }).toBuffer())
      width = fw
    }
    /* judged exactly as `verdictOf` judges a held copy: drawn at 32x32, alpha kept */
    const flat = await img.clone().png().toBuffer()
    const { data, info } = await sharp(flat)
      .resize(SIDE, SIDE, { fit: 'fill' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    const verdict = judge(data, info.width, info.height)
    const cat = await sharp(flat)
      .resize({ width: LONG_EDGE, height: LONG_EDGE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer()
    const hero = await sharp(flat)
      .resize({ width: HERO_EDGE, height: HERO_EDGE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: HERO_QUALITY })
      .toBuffer()
    await sharp(flat)
      .resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(CACHE, `${sha1Hex(url)}.thumb.webp`))
    seen = {
      ok: true,
      status,
      type,
      bytes: buf.length,
      width,
      height,
      verdict,
      catalogueBytes: cat.length,
      heroBytes: hero.length,
    }
  } catch (e) {
    seen = { ok: false, error: e instanceof Error ? e.message.split('\n')[0] : String(e) }
  }
  writeFileSync(sp, JSON.stringify(seen, null, 2))
  return seen
}

/* ------------------------------------------------------------------ */
/* Ranking                                                             */
/* ------------------------------------------------------------------ */

function catalogueRank(m: Match): number {
  const c = m.c
  const name = fileOf(c.url)
  let s = { render: 300, gallery: 200, hero: 120 }[c.kind as 'render'] ?? 0
  if (STUDIO_NAME.test(name)) s += 60
  if (OVERHEAD.test(name)) s -= 200
  if (m.scope === 'model') s += 80
  if (m.scope === 'rows') s += 20
  if (m.differs.some((d) => /colour|filmstrip/.test(d))) s -= 60
  s += Math.min(Math.max(c.width!, c.height!), 2560) / 40
  return s
}

const density = (c: Candidate) => (c.bytes ?? 0) / ((c.width! * c.height!) / 1e6)
function heroEligible(m: Match): boolean {
  const c = m.c
  return (
    !rejectedAsHero(c.url) &&
    /* outside Highfield's media library a sweep's "gallery" is as often a hatch or a boat
       on its trailer as a boat on water (measured on Formosa's and Surtees' sheets,
       2026-10-20); their own "hero" is the frame a person already judged exterior */
    (c.kind === 'hero' || (c.kind === 'gallery' && m.models[0]?.table === 'boat_highfield')) &&
    c.width! >= HERO_MIN_WIDTH &&
    c.width! / c.height! >= 1.25 &&
    !OVERHEAD.test(fileOf(c.url)) &&
    m.scope !== 'rows' &&
    !m.differs.some((d) => /colour/.test(d))
  )
}
function heroRank(m: Match): number {
  const c = m.c
  let s = density(c) / 10
  if (c.kind === 'hero') s += 80
  if (SCENE_NAME.test(fileOf(c.url))) s += 60
  if (m.scope === 'model') s += 40
  s += Math.min(c.width!, 4000) / 100
  return s
}

/* ------------------------------------------------------------------ */
/* The proposals                                                       */
/* ------------------------------------------------------------------ */

interface Proposal {
  group: string
  /** what a judge says yes or no to */
  tile: string
  table: string
  register: string
  /** the file's own model name(s) this would hang on */
  model: string
  models?: string[]
  rowIds?: string[]
  scope: Match['scope'] | 'row-address' | 'organisation'
  kind: 'catalogue' | 'hero' | 'mark'
  sourceKind: string
  url: string
  pageUrl: string
  host: string
  sourceWidth: number
  sourceHeight: number
  heldWidth: number
  heldHeight: number
  /** what holding it would add to the repository, measured by encoding it */
  heldBytes: number
  verdict: string
  /** the exact item it shows, and how that is known */
  depicts: string
  /** what it shows that a quote may say otherwise */
  differs: string[]
  licenceNote: string
  reason: string
  verification: string
  thumb: string
}

const groupOf = (a: { table: string; model: string }): string => {
  if (a.table === 'boat_highfield') {
    const s = audited.find((x) => keyOf(x) === keyOf(a))?.series ?? ''
    return /roll-?up|ultralite|classic|ul|cl|ru/i.test(s) ? 'highfield-tenders' : 'highfield-ribs'
  }
  if (a.table === 'boat_stacer') return 'stacer'
  if (['boat_stabicraft', 'boat_surtees'].includes(a.table)) return 'stabicraft-surtees'
  if (['boat_jeanneau', 'boat_haines', 'boat_formosa'].includes(a.table))
    return 'jeanneau-haines-formosa'
  return 'motors-trailers'
}

/** The maker each register sells, as a tile says it before the file's own model name. */
const MAKER: Record<string, string> = {
  boat_highfield: 'Highfield',
  boat_stacer: 'Stacer',
  boat_jeanneau: 'Jeanneau',
  boat_haines: 'Haines Signature',
  boat_formosa: 'Formosa',
  boat_stabicraft: 'Stabicraft',
  boat_surtees: 'Surtees',
  mot_yamaha: 'Yamaha',
  mot_epropulsion: 'ePropulsion',
}
/** What a judge reads under a tile: the maker, then the file's own name for the model with
 *  only its "<Maker> - " prefix and its trailing full stop taken off. */
function tileOf(a: Audited): string {
  const name = a.model
    .replace(/^\s*[A-Za-z]+\s*-\s*/, '')
    .replace(/\.\s*$/, '')
    .trim()
  const maker = MAKER[a.table]
  if (!maker) return name
  return name.toLowerCase().startsWith(maker.split(' ').at(-1)!.toLowerCase())
    ? name
    : `${maker} ${name}`
}

/** The row's own studio view first, then a candidate's, then the row's own photograph, then
 *  a candidate's. */
const catalogueOrder = (x: { t: { ownRow?: boolean }; s: Seen }): number =>
  (x.s.verdict === 'studio' ? 0 : 2) + (x.t.ownRow ? 0 : 1)

const held = (w: number, h: number, edge: number) => {
  const k = Math.min(1, edge / Math.max(w, h))
  return [Math.round(w * k), Math.round(h * k)] as const
}

const sheetsOnly = process.argv.includes('--sheets')
const proposals: Proposal[] = []
const unfillable: { table: string; model: string; why: string }[] = []

if (!sheetsOnly) {
  /* 0. the dealership's own mark — the tagline lockup is offered, the plain mark already held */
  const tag =
    'https://web.archive.org/web/20251129171843id_/https://www.northsidemarine.com.au/wp-content/uploads/2025/04/nsm_logo.png'
  const tagSeen = await see(tag)
  const markRow = marks.find((m) => m.id === 'northside-marine') as
    (MarkRow & Record<string, unknown>) | undefined
  if (markRow?.file) {
    const thumb = path.join(CACHE, `nsm-held.thumb.png`)
    await sharp(path.join(ROOT, 'public', 'brand-marks', markRow.file))
      .resize({ width: 640 })
      .flatten({ background: '#ffffff' })
      .png()
      .toFile(thumb)
    proposals.push({
      group: 'northside',
      tile: 'Northside Marine — HELD (dark ink, letterhead)',
      table: '',
      register: 'the organisation',
      model: 'Northside Marine',
      scope: 'organisation',
      kind: 'mark',
      sourceKind: 'mark',
      url: String(markRow.url),
      pageUrl: String(markRow.pageUrl),
      host: 'www.northsidemarine.com.au',
      sourceWidth: markRow.width ?? 0,
      sourceHeight: markRow.height ?? 0,
      heldWidth: markRow.width ?? 0,
      heldHeight: markRow.height ?? 0,
      heldBytes: 0,
      verdict: 'mark',
      depicts: 'Northside Marine’s own mark: the waves, "northside marine", "EST. 1965"',
      differs: [],
      licenceNote: String(markRow.licenceNote),
      reason:
        'Already held this round (marks-ledger.json, role "organisation"); on this sheet so the owner says yes to the letterhead with eyes.',
      verification: String(markRow.verifiedBy),
      thumb,
    })
  }
  if (tagSeen.ok) {
    proposals.push({
      group: 'northside',
      tile: 'Northside Marine — tagline lockup (secondary)',
      table: '',
      register: 'the organisation',
      model: 'Northside Marine',
      scope: 'organisation',
      kind: 'mark',
      sourceKind: 'mark',
      url: 'https://www.northsidemarine.com.au/wp-content/uploads/2025/04/nsm_logo.png',
      pageUrl: 'https://web.archive.org/web/20251129171843/https://www.northsidemarine.com.au/',
      host: 'web.archive.org',
      sourceWidth: tagSeen.width ?? 0,
      sourceHeight: tagSeen.height ?? 0,
      heldWidth: tagSeen.width ?? 0,
      heldHeight: tagSeen.height ?? 0,
      heldBytes: tagSeen.bytes ?? 0,
      verdict: 'mark',
      depicts: 'Northside Marine’s 2025 header lockup with the yellow "Life beyond the shore" line',
      differs: [
        'the yellow tagline is not on the current site; the site’s mark today is the lockup without it',
      ],
      licenceNote:
        'The dealership’s own 2025 header file, as the Internet Archive captured it on 2025-11-29; the live address now answers 404.',
      reason:
        'The only public secondary mark: HelmLogic’s organisation record held a primary and a secondary logo, and this is the one the dealership itself used with its line. Hold only if the owner wants the line on paper.',
      verification:
        'Proposed, not verified: looked at once on white by Claude (imagery audit), 2026-10-20.',
      thumb: path.join(CACHE, `${sha1Hex(tag)}.thumb.webp`),
    })
  }

  /* the one brand with no mark at all: Stabicraft draws its wordmark inline and publishes only
     a 180px icon, but the dealership's new site serves the full wordmark as a file */
  const stabi = 'https://www.northsidemarine.com.au/cdn/shop/files/stabicraft-logo-white_1.svg'
  const stabiSeen = await see(stabi, 'https://www.northsidemarine.com.au/')
  if (stabiSeen.ok) {
    proposals.push({
      group: 'northside',
      tile: 'Stabicraft wordmark, white ink',
      table: '',
      register: 'brand marks',
      model: 'Stabicraft',
      scope: 'organisation',
      kind: 'mark',
      sourceKind: 'mark (SVG)',
      url: stabi,
      pageUrl: 'https://www.northsidemarine.com.au/',
      host: 'www.northsidemarine.com.au',
      sourceWidth: stabiSeen.width ?? 0,
      sourceHeight: stabiSeen.height ?? 0,
      heldWidth: stabiSeen.width ?? 0,
      heldHeight: stabiSeen.height ?? 0,
      heldBytes: stabiSeen.bytes ?? 0,
      verdict: 'mark',
      depicts: 'the STABICRAFT wordmark, white on transparent, vector',
      differs: ['white ink only: cannot print on white paper, and a mark is never recoloured'],
      licenceNote:
        'Served by Northside Marine’s own home page, in its brand strip, as an authorised Stabicraft dealer; not published by Stabicraft as a file.',
      reason:
        'The only file of the full Stabicraft wordmark anywhere public (stabicraft.com draws it inline and serves only a 180px "S" icon). Fills the one brand the marks ledger has none for, on dark grounds only.',
      verification: 'Proposed, not verified.',
      thumb: path.join(CACHE, `${sha1Hex(stabi)}.thumb.webp`),
    })
  }

  /* 1. catalogue copies, one per model */
  for (const a of gapModels) {
    /* the row's own address is the dealer's word for its picture — unless the same address
       hangs on a model of another size and names that one (`shareOf`), which makes it a
       sister's picture whatever the file says */
    const own = a.unasked.find((addr) => shareOf(addr, a) !== 'sister' && !EYE_REJECTED[addr])
    const pool = (forModel.get(keyOf(a)) ?? []).toSorted(
      (x, y) => catalogueRank(y) - catalogueRank(x),
    )
    const tries: { m?: Match; url: string; ownRow?: boolean }[] = []
    if (own) tries.push({ url: own, ownRow: true })
    for (const m of pool.slice(0, 3)) tries.push({ m, url: m.c.url })
    /* A STUDIO VIEW IS THE CLEAREST WHOLE ITEM, and the brief prefers it for a catalogue copy:
       the row's own studio view, then a candidate's, then the row's own photograph, then a
       candidate's. Everything at 800 px or more on its long edge. */
    const seen: { t: (typeof tries)[number]; s: Seen }[] = []
    for (const t of tries) {
      const s = await see(t.url, t.m?.c.pageUrl, a.table === 'mot_yamaha')
      if (!s.ok || !s.width || !s.height || Math.max(s.width, s.height) < 800) continue
      seen.push({ t, s })
      if (t.ownRow && s.verdict === 'studio') break
    }
    const picked = seen.toSorted((x, y) => catalogueOrder(x) - catalogueOrder(y))[0] ?? null
    if (!picked) {
      unfillable.push({
        table: a.table,
        model: a.model,
        why:
          pool.length === 0 && !own
            ? 'no candidate depicts this exact model'
            : 'every candidate failed to serve or is under 800 px',
      })
      continue
    }
    const { t, s } = picked
    const m = t.m
    const [hw, hh] = held(s.width!, s.height!, LONG_EDGE)
    proposals.push({
      group: groupOf(a),
      tile: tileOf(a),
      table: a.table,
      register: a.register,
      model: a.model,
      ...(m && m.models.length > 1 ? { models: m.models.map((x) => x.model) } : {}),
      ...(m?.rowIds ? { rowIds: m.rowIds } : {}),
      scope: t.ownRow ? 'row-address' : m!.scope,
      kind: 'catalogue',
      sourceKind: t.ownRow ? 'row address' : (m!.c.kind ?? ''),
      url: t.url,
      pageUrl: t.ownRow ? '(the price file’s own Image Link)' : (m!.c.pageUrl ?? ''),
      host: t.url.split('/')[2] ?? '',
      sourceWidth: s.width!,
      sourceHeight: s.height!,
      heldWidth: hw,
      heldHeight: hh,
      heldBytes: s.catalogueBytes ?? 0,
      verdict: s.verdict ?? 'unknown',
      depicts: t.ownRow
        ? `${a.spoken} — the picture the dealer’s own price file names for row ${a.rows.find((r) => addressesOf(tables[a.table]!, r).includes(t.url))?.id ?? ''}`
        : m!.depicts,
      differs:
        m?.differs ??
        (shareOf(t.url, a) === 'confirm'
          ? [
              `the file gives this picture to ${(modelsOfAddress.get(t.url) ?? []).map((x) => x.model).join(' and ')} too; say which it shows`,
            ]
          : []),
      licenceNote: m?.c.licenceNote ?? images.get(t.url)?.licenceNote ?? '',
      reason: t.ownRow
        ? 'The row’s own Image Link, never asked for: the dealer’s file already says this is its picture. Measured 200 on ' +
          TODAY +
          '.'
        : `${m!.c.kind} on ${m!.c.host}; ${m!.c.note ?? ''}`.trim(),
      verification:
        'Proposed, not verified: a person marks it as this exact item on the contact sheet before it is held.',
      thumb: path.join(CACHE, `${sha1Hex(t.url)}.thumb.webp`),
    })
    console.log(
      `cat  ${a.table.padEnd(18)} ${a.model.slice(0, 40).padEnd(40)} ${t.ownRow ? 'own ' : m!.scope.padEnd(4)} ${s.verdict} ${s.width}x${s.height}`,
    )
  }

  /* 2. heroes, at most forty, favouring what the dealer sells most */
  const tableRows = new Map(audited.filter((a) => a.kind === 'boat').map((a) => [a.table, 0]))
  for (const a of audited)
    if (a.kind === 'boat') tableRows.set(a.table, (tableRows.get(a.table) ?? 0) + a.rows.length)
  const totalBoatRows = [...tableRows.values()].reduce((n, x) => n + x, 0)
  const quota = new Map(
    [...tableRows].map(([t, n]) => [t, Math.max(1, Math.round((HERO_CAP * n) / totalBoatRows))]),
  )
  const order = heroGaps
    .filter((a) => (forModel.get(keyOf(a)) ?? []).some(heroEligible))
    .toSorted(
      (x, y) =>
        y.rows.length - x.rows.length ||
        (tableRows.get(y.table) ?? 0) - (tableRows.get(x.table) ?? 0),
    )
  const taken = new Map<string, number>()
  const heroPicks: Proposal[] = []
  const usedHeroUrl = new Set<string>()
  const tryHero = async (a: Audited): Promise<boolean> => {
    const pool = (forModel.get(keyOf(a)) ?? [])
      .filter(heroEligible)
      .filter((m) => !usedHeroUrl.has(m.c.url))
      .toSorted((x, y) => heroRank(y) - heroRank(x))
    for (const m of pool.slice(0, 4)) {
      const s = await see(m.c.url, m.c.pageUrl)
      if (!s.ok || s.verdict !== 'scene') continue
      const [hw, hh] = held(s.width!, s.height!, HERO_EDGE)
      usedHeroUrl.add(m.c.url)
      heroPicks.push({
        group: groupOf(a),
        tile: `HERO · ${tileOf(a)}`,
        table: a.table,
        register: a.register,
        model: a.model,
        ...(m.models.length > 1 ? { models: m.models.map((x) => x.model) } : {}),
        scope: m.scope,
        kind: 'hero',
        sourceKind: m.c.kind ?? '',
        url: m.c.url,
        pageUrl: m.c.pageUrl ?? '',
        host: m.c.host ?? '',
        sourceWidth: s.width!,
        sourceHeight: s.height!,
        heldWidth: hw,
        heldHeight: hh,
        heldBytes: s.heroBytes ?? 0,
        verdict: s.verdict,
        depicts: m.depicts + ' on the water',
        differs: m.differs,
        licenceNote: m.c.licenceNote ?? '',
        reason:
          `judge(): scene; ${Math.round(density(m.c))} kB/MP at the source; ${m.c.note ?? ''}`.trim(),
        verification:
          'Proposed, not verified: a person must see an EXTERIOR of this exact boat ON THE WATER — the judge cannot tell a console from a coastline.',
        thumb: path.join(CACHE, `${sha1Hex(m.c.url)}.thumb.webp`),
      })
      console.log(
        `hero ${a.table.padEnd(18)} ${a.model.slice(0, 40).padEnd(40)} ${s.width}x${s.height}`,
      )
      return true
    }
    return false
  }
  for (const a of order) {
    if (heroPicks.length >= HERO_CAP) break
    if ((taken.get(a.table) ?? 0) >= (quota.get(a.table) ?? 0)) continue
    if (await tryHero(a)) taken.set(a.table, (taken.get(a.table) ?? 0) + 1)
  }
  for (const a of order) {
    if (heroPicks.length >= HERO_CAP) break
    if (heroPicks.some((p) => p.table === a.table && p.model === a.model)) continue
    await tryHero(a)
  }
  proposals.push(...heroPicks)

  /* the budget is the owner's, not a target */
  let spent = 0
  for (const p of proposals) spent += p.heldBytes
  if (spent > BUDGET_BYTES) console.log(`OVER BUDGET: ${(spent / 1048576).toFixed(1)} MB`)
}

/* ------------------------------------------------------------------ */
/* Writing: one JSON and one contact sheet per group                    */
/* ------------------------------------------------------------------ */

mkdirSync(PROPOSALS, { recursive: true })
const GROUP_ORDER = [
  'northside',
  'highfield-ribs',
  'highfield-tenders',
  'stacer',
  'stabicraft-surtees',
  'jeanneau-haines-formosa',
  'motors-trailers',
]

let all: Proposal[] = proposals
if (sheetsOnly) {
  all = []
  for (const g of GROUP_ORDER) {
    const f = path.join(PROPOSALS, `${g}.json`)
    if (existsSync(f))
      all.push(
        ...(JSON.parse(readFileSync(f, 'utf8')) as { proposals: Proposal[] }).proposals.map(
          (p) => ({ ...p, thumb: path.join(CACHE, p.thumb) }),
        ),
      )
  }
}

const esc = (s: string) =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

/** Lines of at most `n` characters, broken at spaces. */
function wrap(s: string, n: number): string[] {
  const out: string[] = []
  let line = ''
  for (const w of s.split(/\s+/)) {
    if ((line + ' ' + w).trim().length > n && line) {
      out.push(line)
      line = w
    } else line = (line + ' ' + w).trim()
  }
  if (line) out.push(line)
  return out
}

async function sheet(group: string, items: Proposal[]): Promise<void> {
  const TILE_W = 340
  const IMG_W = 320
  const IMG_H = 220
  const CAP_H = 150
  const COLS = Math.min(5, Math.max(1, items.length))
  const rows = Math.ceil(items.length / COLS)
  const W = COLS * TILE_W + 20
  const HEAD = 70
  const H = HEAD + rows * (IMG_H + CAP_H + 20) + 10
  const layers: OverlayOptions[] = []
  const text: string[] = []
  text.push(
    `<text x="20" y="44" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="700" fill="#0b2540">${esc(`${group} — ${items.length} proposed (say yes or no to each by its number)`)}</text>`,
  )
  for (const [i, p] of items.entries()) {
    const x = 10 + (i % COLS) * TILE_W + 10
    const y = HEAD + Math.floor(i / COLS) * (IMG_H + CAP_H + 20)
    const ground = p.kind === 'mark' && /white/i.test(p.tile) ? '#0b2540' : '#e9ecef'
    let img: Buffer
    try {
      img = await sharp(p.thumb)
        .resize({ width: IMG_W, height: IMG_H, fit: 'contain', background: ground })
        .flatten({ background: ground })
        .png()
        .toBuffer()
    } catch {
      img = await sharp({
        create: { width: IMG_W, height: IMG_H, channels: 3, background: '#f8d7da' },
      })
        .png()
        .toBuffer()
    }
    layers.push({ input: img, left: x, top: y })
    const name = wrap(p.tile, 26)
    const lines = name.slice(0, 3)
    text.push(
      `<rect x="${x}" y="${y}" width="44" height="30" fill="#0b2540"/><text x="${x + 22}" y="${y + 22}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="700" fill="#fff">${i + 1}</text>`,
    )
    lines.forEach((l, j) =>
      text.push(
        `<text x="${x}" y="${y + IMG_H + 30 + j * 28}" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="700" fill="#111">${esc(l)}</text>`,
      ),
    )
    const scopeSaid =
      p.scope === 'row-address' ? 'the row’s own picture' : `${p.scope} · ${p.sourceKind}`
    const meta =
      `${p.kind === 'hero' ? 'HERO' : p.kind === 'mark' ? 'MARK' : 'catalogue'} · ${scopeSaid} · ${p.verdict} · ${p.sourceWidth}×${p.sourceHeight}`.slice(
        0,
        52,
      )
    text.push(
      `<text x="${x}" y="${y + IMG_H + 30 + lines.length * 28 + 2}" font-family="Segoe UI, Arial, sans-serif" font-size="14" fill="#444">${esc(meta)}</text>`,
    )
    const warn =
      p.differs[0] ??
      (/prohibit|without (the )?(importer|authori)/i.test(p.licenceNote)
        ? 'licence: reproduction needs the maker’s permission'
        : undefined)
    if (warn)
      text.push(
        `<text x="${x}" y="${y + IMG_H + 30 + lines.length * 28 + 22}" font-family="Segoe UI, Arial, sans-serif" font-size="14" fill="#b02a37">${esc('⚠ ' + warn.slice(0, 44))}</text>`,
      )
  }
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${text.join('')}</svg>`,
  )
  await sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } })
    .composite([...layers, { input: svg, left: 0, top: 0 }])
    /* a sheet is read by eye and committed: a 256-colour palette keeps it legible at a
       quarter of the bytes */
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toFile(path.join(PROPOSALS, `${group}.png`))
}

const groups = new Map<string, Proposal[]>()
for (const p of all) {
  if (!groups.has(p.group)) groups.set(p.group, [])
  groups.get(p.group)!.push(p)
}
const proposedCount = new Map<string, number>()
for (const p of all)
  if (p.table)
    for (const m of p.models ?? [p.model])
      proposedCount.set(`${p.table}::${m}`, (proposedCount.get(`${p.table}::${m}`) ?? 0) + 1)

for (const g of GROUP_ORDER) {
  const items = (groups.get(g) ?? []).toSorted((a, b) =>
    a.kind === b.kind
      ? a.tile.localeCompare(b.tile)
      : a.kind === 'mark'
        ? -1
        : a.kind === 'catalogue'
          ? -1
          : 1,
  )
  if (items.length === 0) continue
  await sheet(g, items)
  if (!sheetsOnly) {
    const doc = {
      group: g,
      measuredAt: TODAY,
      by: 'tools/seed/propose-images.ts',
      sheet: `${g}.png`,
      note: 'Proposals only: nothing here is held. Each number on the sheet is the index below plus one. A picture is held only after a person marks it as depicting exactly `model` on `table`; then `verification` is rewritten with who and how.',
      newBytes: items.reduce((n, p) => n + p.heldBytes, 0),
      proposals: items.map((p, i) => ({
        n: i + 1,
        ...p,
        thumb: path.relative(CACHE, p.thumb).replaceAll('\\', '/'),
      })),
    }
    /* written as the repository's formatter writes JSON, so `npm test` reads it clean */
    await writeFile(
      path.join(PROPOSALS, `${g}.json`),
      await format(JSON.stringify(doc), {
        ...(await resolveConfig(path.join(PROPOSALS, `${g}.json`))),
        parser: 'json',
      }),
    )
  }
  console.log(`sheet ${g}: ${items.length}`)
}

if (!sheetsOnly) {
  /* gaps.md, now with what was found for each gap, and the honest gaps */
  let doc = gapsDoc(proposedCount)
  const spent = all.reduce((n, p) => n + p.heldBytes, 0)
  const L: string[] = []
  L.push('## What the proposal run found')
  L.push('')
  L.push(
    `Run on ${TODAY}. ${all.length} proposals in ${groups.size} groups under \`docs/research/imagery/proposals/\`: ${all.filter((p) => p.kind === 'catalogue').length} catalogue copies (${all.filter((p) => p.scope === 'row-address').length} of them a row’s own never-asked address), ${all.filter((p) => p.kind === 'hero').length} heroes, ${all.filter((p) => p.kind === 'mark').length} marks. Held as proposed they would add **${(spent / 1048576).toFixed(1)} MB** to the repository (measured by encoding each one as the holding tool would) against the owner’s 90 MB.`,
  )
  L.push('')
  L.push('| group | proposals | catalogue | heroes | new MB |')
  L.push('|---|---:|---:|---:|---:|')
  for (const g of GROUP_ORDER) {
    const it = groups.get(g) ?? []
    if (it.length === 0) continue
    L.push(
      `| [${g}](proposals/${g}.png) | ${it.length} | ${it.filter((p) => p.kind === 'catalogue').length} | ${it.filter((p) => p.kind === 'hero').length} | ${(it.reduce((n, p) => n + p.heldBytes, 0) / 1048576).toFixed(1)} |`,
    )
  }
  L.push('')
  L.push('### Why candidates were not proposed')
  L.push('')
  L.push(
    'Every one of the 4,768 measured addresses was put to the match. These are the reasons the ones that did not reach a gap were set aside, most common first:',
  )
  L.push('')
  for (const [why, n] of [...heldBack].toSorted((a, b) => b[1] - a[1])) L.push(`- ${n} — ${why}`)
  L.push('')
  L.push(`### The gaps that cannot be filled honestly — ${unfillable.length}`)
  L.push('')
  L.push(
    'Nothing in the measured candidates depicts these exact models, or what does would not serve. They stay gaps: the screen draws the maker’s mark or the name in type, and says so. The person who can close them is the dealership (its own photographs of stock) or the maker’s importer.',
  )
  L.push('')
  const byReg = new Map<string, string[]>()
  for (const u of unfillable) {
    const k = `${tables[u.table]?.name ?? u.table} \`${u.table}\``
    if (!byReg.has(k)) byReg.set(k, [])
    byReg
      .get(k)!
      .push(`${u.model}${u.why === 'no candidate depicts this exact model' ? '' : ` (${u.why})`}`)
  }
  for (const [k, v] of byReg) L.push(`- **${k}** (${v.length}): ${v.join(' · ')}`)
  L.push('')
  doc += '\n' + L.join('\n') + '\n'
  await writeFile(path.join(OUT_DIR, 'gaps.md'), doc)
  const summary = {
    carried: Object.fromEntries(KINDS.map((k) => [k, audited.filter((a) => a.kind === k).length])),
    held: Object.fromEntries(
      KINDS.map((k) => [k, audited.filter((a) => a.kind === k && honestCopy(a)).length]),
    ),
    heroes: audited.filter((a) => a.hero).length,
    proposals: all.length,
    unfillable: unfillable.length,
    newMB: +(spent / 1048576).toFixed(1),
  }
  console.log(JSON.stringify(summary))
}
