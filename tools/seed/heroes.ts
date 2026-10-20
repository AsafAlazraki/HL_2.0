/**
 * The hero tier: the pictures that fill a stage, fetched at stage size, recorded in
 * `data/northside/pictures.json` beside the catalogue tier — the one place a hero is recorded.
 *
 *   npx tsx --tsconfig tsconfig.app.json --import ./tools/seed/app.hooks.mjs tools/seed/heroes.ts [--force]
 *   npx tsx tools/seed/hero-widths.ts                       # then the narrower copies
 *
 * WHY A SECOND TIER EXISTS. The catalogue copies under `public/seed-images` are capped at
 * long edge 1100 (tools/seed/fetch-images.ts), which is right for a row, a tile or a card
 * and wrong for a photograph that fills a 1440x900 window. Measured 2026-09-17: of 329 held
 * copies only 39 reach 1100px, and the Stacer 529 Assault Pro's on-water photograph is
 * 1024x676, because the address the price file carries is itself a WordPress `-1024x676`
 * resize of a bigger original. Drawing a stage from those means upscaling, and an upscaled
 * photograph is the difference between a configurator that looks made and one that looks
 * bought.
 *
 * WHERE A HERO COMES FROM. Only from a verdict a person wrote on a contact sheet
 * (`docs/research/imagery/proposals/<group>.verdicts.json`, read by `accepted.ts`): an
 * exterior scene ON THE WATER of that exact model, accepted as a hero. The lesson this repo
 * paid for is why: the pixel judge once promoted interiors and console close-ups, because
 * "not a render on white" is not "a boat on water". A verdict that carries a licence line
 * (Jeanneau's photography belongs to SPBI S.A.) is accepted as the right picture and NOT
 * held until the permission exists.
 *
 * THE EIGHT HEROES HELD BEFORE THE CONTACT SHEETS were chosen by `pick-heroes.ts` and the
 * pixel judge alone, and recorded in `heroes.json` + `heroes-ledger.json`. The first run of
 * this tool on 2026-10-20 migrated them into `pictures.json` with their bytes, their narrower
 * copies and their provenance unchanged, attached explicitly to the rows the app's old rule
 * (`depictionOf`) drew them for, and marked `person: false` — so a line on a quote, which
 * needs a picture a person marked, never carries one — and retired both files.
 *
 * NEVER ENLARGED: a source narrower than 2560 is held at its own width (the ADV9 at 2048, the
 * Stabicraft banners at 1700), and `src/data/imagery.test.ts` holds every entry to it.
 */
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'
import type { PictureEntry, PictureWidth } from '../../src/domain/model/pictures'
import {
  ROOT,
  exactRowsOf,
  fleetIndex,
  hullSaid,
  modelNamed,
  readVerdicts,
  saidOf,
  slug,
  verifiedByOf,
  type FleetIndex,
  spokenNamer,
} from './accepted'
import { readPictures, sha1Hex, writePictures } from './ledger'

const LONG_EDGE = 2560
const QUALITY = 78
const DATA = join(ROOT, 'data', 'northside')
const OUT_DIR = join(ROOT, 'public', 'hero-images')
const CACHE = join(ROOT, 'tools', 'seed', '.imgcache')
const LEGACY_CHOICES = join(DATA, 'heroes.json')
const LEGACY_LEDGER = join(DATA, 'heroes-ledger.json')
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'

const force = process.argv.includes('--force')
const today = new Date().toISOString().slice(0, 10)

/* ---------------------------------------------------------- */
/* The eight held before the contact sheets                    */
/* ---------------------------------------------------------- */

interface Legacy {
  id: string
  subject: string
  table: string
  model: string
  url: string
  pageUrl: string
  licenceNote: string
  note?: string
  file?: string
  width?: number
  height?: number
  bytes?: number
  sha256?: string
  sourceWidth?: number
  sourceHeight?: number
  fetchedAt?: string
  error?: string
  widths?: PictureWidth[]
}

/** What a person has since seen in two of them, written where it was seen. */
const SEEN: Record<string, { differs: string[]; seen: string }> = {
  'highfield-sp560': {
    differs: [
      'a Mercury 115 outboard (the cowl reads MERCURY and 115)',
      'light grey tubes with a dark rubbing strake and a T-top console; the colourway is not recorded against any SP560 row, so a caption says "your boat’s finish and motor are as quoted", never that this is the finish quoted',
    ],
    seen: 'looked at by Claude (imagery audit), 2026-10-20, at 1280 px (docs/research/imagery/gaps.md; docs/research/proposal/quote-spec.md §1 B)',
  },
}

function migrate(index: FleetIndex): PictureEntry[] {
  if (!existsSync(LEGACY_LEDGER)) return []
  const legacy = JSON.parse(readFileSync(LEGACY_LEDGER, 'utf8')) as Legacy[]
  const out: PictureEntry[] = []
  for (const h of legacy) {
    if (h.error || !h.file) throw new Error(`${h.id} was never held; nothing to migrate`)
    const table = index.tables[h.table]
    if (!table) throw new Error(`${h.id} names a register the pack does not have`)
    /* THE ROWS THE APP DREW IT FOR, read once by the old rule and then written down: from here
       on a hero is attached by row id, never by a name standing inside a longer one */
    const drawn = (index.rowsByEntity[h.table] ?? []).filter(
      (row) => index.depictionOf([h], h.table, index.namesOfRow(table, row)) !== null,
    )
    const rows: Record<string, string[]> = {}
    for (const model of index.models.values()) {
      if (model.tableId !== h.table) continue
      const mine = model.variants.map((v) => v.rowId).filter((id) => drawn.some((r) => r.id === id))
      if (mine.length > 0) rows[model.name] = mine
    }
    const models = Object.keys(rows)
    if (models.length === 0) throw new Error(`${h.id} depicts no row of ${h.table}`)
    const only = models.length === 1 ? index.models.get(`${h.table}::${models[0]}`) : undefined
    const seen = SEEN[h.id]
    out.push({
      id: h.id,
      tier: 'hero',
      table: h.table,
      scope: models.length === 1 ? 'model' : 'hull',
      models,
      rows,
      exactRows: only && only.variants.length === 1 ? [only.variants[0]!.rowId] : [],
      rowAddress: false,
      subject: h.subject,
      depicts: `${h.subject.replace(/ on the water$/, '')}, a photograph on the water from ${h.pageUrl}; the model is named by the maker's own page and the file name, not yet by a person on a contact sheet`,
      differs: seen?.differs ?? [],
      verdict: 'scene',
      url: h.url,
      pageUrl: h.pageUrl,
      host: new URL(h.url).host,
      licenceNote: h.licenceNote,
      fetchedAt: h.fetchedAt!,
      sourceWidth: h.sourceWidth!,
      sourceHeight: h.sourceHeight!,
      file: h.file,
      width: h.width!,
      height: h.height!,
      bytes: h.bytes!,
      sha256: h.sha256!,
      ...(h.widths && h.widths.length > 0 ? { widths: h.widths } : {}),
      verification: 'not yet marked by a person: chosen by the pixel judge',
      verifiedBy: `automatic: tools/seed/pick-heroes.ts took the first candidate verdict.judge() called a scene (${h.note ?? 'no note'}), ${h.fetchedAt}${seen ? `; since ${seen.seen}, for what it shows beside the boat` : ''}`,
      person: false,
      verdicts: 'data/northside/heroes.json (retired 2026-10-20)',
    })
  }
  return out
}

/* ---------------------------------------------------------- */
/* The bytes                                                   */
/* ---------------------------------------------------------- */

async function bytesOf(url: string, referer: string): Promise<Buffer> {
  const cached = join(CACHE, sha1Hex(url))
  if (existsSync(cached)) return readFileSync(cached)
  const res = await fetch(url, {
    headers: { 'user-agent': UA, ...(referer.startsWith('http') ? { referer } : {}) },
    signal: AbortSignal.timeout(45_000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  mkdirSync(CACHE, { recursive: true })
  writeFileSync(cached, buf)
  writeFileSync(
    `${cached}.json`,
    `${JSON.stringify({ type: res.headers.get('content-type') ?? '', bytes: buf.length, via: 'host' }, null, 2)}\n`,
  )
  await new Promise((r) => setTimeout(r, 1200))
  return buf
}

/* ---------------------------------------------------------- */
/* The run                                                     */
/* ---------------------------------------------------------- */

const index = await fleetIndex()
const spokenSaid = await spokenNamer()
const doc = readPictures(DATA)
const byId = new Map(doc.pictures.map((p) => [p.id, p]))
mkdirSync(OUT_DIR, { recursive: true })

for (const m of migrate(index)) {
  if (!byId.has(m.id)) {
    byId.set(m.id, m)
    console.log(`migrated ${m.id}  ${m.scope} ${m.models.join(' · ')}`)
  }
}

let fetched = 0
let newBytes = 0
for (const j of readVerdicts().filter((v) => v.decision === 'accept' && v.kind === 'hero')) {
  if (j.licence !== '') {
    console.log(`barred   ${j.ref} — ${j.licence.split('.')[0]}`)
    continue
  }
  const models = j.models.map((m) => modelNamed(index, j.table, m))
  const hull = j.scope === 'hull'
  const said = hull ? hullSaid(j.table, j.models) : saidOf(j.table, j.models[0]!)
  const id = slug(said)
  const file = `${id}-${sha1Hex(j.url).slice(0, 8)}.webp`
  const had = byId.get(id)
  if (had && had.url !== j.url) throw new Error(`${id} already names another picture: ${had.url}`)
  /* THE VERDICT'S WORDS, written on every run; the BYTES, only when they are not held */
  const exactRows = exactRowsOf(index, j, models)
  /* a photograph that is the price file's own Image Link for the row it shows names the file,
     not a page, as where it was found */
  const rowAddress =
    exactRows.length > 0 && exactRows.every((row) => index.addressOf(j.table, row) === j.url)
  const words = {
    id,
    tier: 'hero' as const,
    table: j.table,
    scope: hull ? ('hull' as const) : ('model' as const),
    models: models.map((m) => m.name),
    rows: Object.fromEntries(models.map((m) => [m.name, m.variants.map((v) => v.rowId)])),
    exactRows,
    rowAddress,
    /* the model as every screen says it ("Highfield Classic 420"), not the file's code */
    subject: `${hull ? said : spokenSaid(j.table, models[0]!.name, said)} on the water`,
    depicts: j.depicts,
    differs: j.differs,
    verdict: 'scene' as const,
    url: j.url,
    pageUrl: rowAddress ? '' : j.pageUrl,
    host: new URL(j.url).host,
    licenceNote: j.licenceNote,
    verification: j.verification,
    verifiedBy: verifiedByOf(j),
    person: true,
    verdicts: j.ref,
  }
  if (had && !force && existsSync(join(OUT_DIR, had.file))) {
    byId.set(id, { ...had, ...words })
    console.log(`have ${id}  ${had.width}x${had.height}`)
    continue
  }
  let buf: Buffer
  try {
    buf = await bytesOf(j.url, j.pageUrl)
  } catch (e) {
    console.log(`FAIL ${id}  ${e instanceof Error ? e.message.split('\n')[0] : String(e)}`)
    continue
  }
  const meta = await sharp(buf).metadata()
  const out = await sharp(buf)
    .rotate()
    .resize({ width: LONG_EDGE, height: LONG_EDGE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer({ resolveWithObject: true })
  writeFileSync(join(OUT_DIR, file), out.data)
  const entry: PictureEntry = {
    ...words,
    fetchedAt: today,
    sourceWidth: meta.autoOrient?.width ?? meta.width ?? 0,
    sourceHeight: meta.autoOrient?.height ?? meta.height ?? 0,
    file,
    width: out.info.width,
    height: out.info.height,
    bytes: out.data.length,
    sha256: createHash('sha256').update(out.data).digest('hex'),
  }
  byId.set(id, entry)
  fetched += 1
  newBytes += out.data.length
  console.log(
    `ok   ${id}  ${entry.sourceWidth}x${entry.sourceHeight} -> ${entry.width}x${entry.height}  ${(out.data.length / 1024) | 0} kB`,
  )
}

doc.pictures = [...byId.values()]
writePictures(DATA, doc, today)

/* the migration is complete only once the old ledgers are gone: one place records a hero */
for (const retired of [LEGACY_LEDGER, LEGACY_CHOICES]) {
  if (existsSync(retired)) {
    unlinkSync(retired)
    console.log(`retired ${retired.slice(ROOT.length + 1)} — its heroes are in pictures.json`)
  }
}

const heroes = doc.pictures.filter((p) => p.tier === 'hero')
console.log(
  `\n${heroes.length} heroes held (${fetched} written now, ${(newBytes / 1024 / 1024).toFixed(2)} MB), ${(heroes.reduce((n, h) => n + h.bytes, 0) / 1024 / 1024).toFixed(1)} MB in ${OUT_DIR.slice(ROOT.length + 1)} before the narrower copies`,
)
