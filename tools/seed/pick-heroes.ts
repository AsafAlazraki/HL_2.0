/**
 * Choose each hero by asking the picture what it is, not by trusting a label.
 *
 *   npx tsx tools/seed/pick-heroes.ts <model-pattern> [...]     # writes data/northside/heroes.json
 *
 * WHY THIS EXISTS. The imagery sweep files every picture under a `kind` it read off the page
 * it came from, and "gallery" there means "it was in the model's gallery" — which on a
 * manufacturer's site is as often a transom shot on white as it is a boat on water. Picking
 * the largest "gallery" photograph for the Stacer 529 Assault Pro on 2026-09-17 returned a
 * 4288x2848 studio shot of the transom on a white ground: correct model, correct source,
 * wrong picture for a stage.
 *
 * So the candidates are asked the same question the packer asks of every held picture:
 * `judge()` in verdict.ts, the old app's scene/studio test, drawn at 32x32 and sampled round
 * the edge. A hero must come back `scene`. Byte density (bytes per megapixel) pre-ranks the
 * candidates so only a handful are fetched: a render on white compresses to almost nothing
 * (that 4288x2848 transom is 57 kB) and a photograph of water does not (711 kB for the same
 * pixel count).
 */
import { writeFile, readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import { judge, SIDE } from './verdict.ts'

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'

interface Candidate {
  brand?: string
  model?: string
  kind?: string
  url: string
  pageUrl?: string
  status?: number
  contentType?: string
  bytes?: number
  width?: number
  height?: number
  licenceNote?: string
  note?: string
}

/** What the boards and the first screens need, in the seed's own words. */
const WANTED: { id: string; subject: string; table: string; model: string; match: RegExp }[] = [
  // Highfield's media library publishes full-resolution on-water photography per model.
  {
    id: 'highfield-sp560',
    subject: 'Highfield Sport 560 on the water',
    table: 'boat_highfield',
    model: 'SP560',
    match: /\bSP560\b/,
  },
  {
    id: 'highfield-sp600',
    subject: 'Highfield Sport 600 on the water',
    table: 'boat_highfield',
    model: 'SP600',
    match: /\bSP600\b/,
  },
  {
    id: 'highfield-pa600',
    subject: 'Highfield Patrol 600 on the water',
    table: 'boat_highfield',
    model: 'PA600',
    match: /\bPA600\b/,
  },
  {
    id: 'highfield-adv7',
    subject: 'Highfield Adventure 7 on the water',
    table: 'boat_highfield',
    model: 'ADV7',
    match: /\bADV7\b/,
  },
  // Stacer publishes its on-water photography at web size; these are the widest it has.
  {
    id: 'stacer-519-sea-ranger',
    subject: 'Stacer 519 Sea Ranger SDF on the water',
    table: 'boat_stacer',
    model: '519 Sea Ranger SDF',
    match: /519 Sea Ranger/i,
  },
  {
    id: 'stacer-481-seamaster',
    subject: 'Stacer 481 SeaMaster on the water',
    table: 'boat_stacer',
    model: '481 SeaMaster',
    match: /481 Sea ?Master/i,
  },
  {
    id: 'stacer-309-skimma',
    subject: 'Stacer 309 Skimma on the water',
    table: 'boat_stacer',
    model: '309 Skimma',
    match: /309 Skimma/i,
  },
  {
    id: 'stacer-359-territory-striker',
    subject: 'Stacer 359 Territory Striker on the water',
    table: 'boat_stacer',
    model: '359 Territory Striker',
    match: /359 Territory Striker/i,
  },
]

const dir = join('docs', 'research', 'imagery')
const all: Candidate[] = []
for (const f of await readdir(dir)) {
  if (!f.endsWith('.json') || f === 'candidates.json') continue
  all.push(...(JSON.parse(await readFile(join(dir, f), 'utf8')) as Candidate[]))
}

/* A hero is a wide shot of the whole boat in a place. The scene/studio judge cannot tell
   that on its own: it answers "is this a render on a white ground", and an interior detail
   photographed on grey carpet is not on a white ground, so it passes. Measured 2026-09-17,
   by looking: the largest "gallery" photographs for four Stacer models were a transom on
   white, a seat locker, a floor locker and a steering console. So the file name the maker
   gave the picture is read first — Stacer marks its on-water frames "Lifestyle" or "EXT"
   and its cabin frames "INT" or "Internal" — and the judge stays as the second gate. */
const INTERIOR = /_int_|internal|interior|factory|console-?close/i

const usable = (c: Candidate) =>
  c.status !== undefined &&
  c.status < 300 &&
  /image\//.test(c.contentType ?? '') &&
  (c.kind === 'hero' || c.kind === 'gallery') &&
  !!c.width &&
  !!c.height &&
  c.width / c.height >= 1.25 &&
  c.width >= 1180 &&
  !INTERIOR.test(decodeURIComponent(c.url))

/** Bytes per megapixel: a white-ground render is almost free to compress, water is not. */
const density = (c: Candidate) => (c.bytes ?? 0) / ((c.width! * c.height!) / 1e6)

async function isScene(url: string): Promise<{ verdict: string; bytes: number } | null> {
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': UA },
      signal: AbortSignal.timeout(45_000),
    })
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    const { data, info } = await sharp(buf)
      .resize(SIDE, SIDE, { fit: 'fill' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    return { verdict: judge(data, info.width, info.height), bytes: buf.length }
  } catch {
    return null
  }
}

/** One chosen hero, in the shape heroes.ts reads. */
interface Chosen {
  id: string
  subject: string
  table: string
  model: string
  url: string
  pageUrl: string
  kind: 'photograph'
  licenceNote: string
  note: string
}

const chosen: Chosen[] = []
const only = process.argv.slice(2)
for (const want of WANTED) {
  if (only.length > 0 && !only.includes(want.id)) continue
  const pool = all
    .filter((c) => usable(c) && want.match.test(`${c.model ?? ''} ${decodeURIComponent(c.url)}`))
    .toSorted((a, b) => density(b) - density(a))
  if (pool.length === 0) {
    console.log(`NONE  ${want.id} — no landscape photograph at 1600px or more`)
    continue
  }
  let picked: Candidate | null = null
  for (const c of pool.slice(0, 6)) {
    const seen = await isScene(c.url)
    await new Promise((r) => setTimeout(r, 900))
    if (!seen) continue
    console.log(
      `  try ${want.id.padEnd(24)} ${String(c.width).padStart(5)}x${c.height}  ${Math.round(density(c))} kB/MP  ${seen.verdict}`,
    )
    if (seen.verdict === 'scene') {
      picked = c
      break
    }
  }
  if (!picked) {
    console.log(
      `NONE  ${want.id} — every candidate judged a studio shot; the screen draws what the file has`,
    )
    continue
  }
  chosen.push({
    id: want.id,
    subject: want.subject,
    table: want.table,
    model: want.model,
    url: picked.url,
    pageUrl: picked.pageUrl ?? '',
    kind: 'photograph' as const,
    licenceNote: picked.licenceNote ?? '',
    note: `chosen by verdict.judge(): scene. ${picked.width}x${picked.height} at the source.`,
  })
  console.log(`PICK  ${want.id}  ${picked.width}x${picked.height}`)
}

/* Merge, never overwrite: a run filtered to a few ids must not drop the rest. */
const path = join('data', 'northside', 'heroes.json')
const existing: Chosen[] = await readFile(path, 'utf8')
  .then((t) => JSON.parse(t) as Chosen[])
  .catch(() => [])
const merged = new Map(existing.map((h) => [h.id, h] as const))
for (const c of chosen) merged.set(c.id, c)
const ordered = WANTED.map((w) => merged.get(w.id)).filter(Boolean)
await writeFile(path, JSON.stringify(ordered, null, 2) + String.fromCharCode(10))
console.log(`\n${ordered.length} of ${WANTED.length} subjects have an on-water photograph`)
