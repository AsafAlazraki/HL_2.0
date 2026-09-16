/**
 * The hero tier: the few pictures that fill a stage, fetched at stage size.
 *
 *   npx tsx tools/seed/heroes.ts            # fetch what is missing
 *   npx tsx tools/seed/heroes.ts --force    # re-fetch everything
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
 * WHERE THE BIGGER PICTURE COMES FROM, AND WHY IT IS NOT A SUBSTITUTION. Each entry below
 * names one address that was verified live by the imagery sweep (docs/research/imagery/
 * *.json: status, content type, byte size and the pixel size read by sharp) and attributed
 * to the exact model by the sweep's own rule — the file name names the model, or the picture
 * sits on that model's own page on the manufacturer's site and on no other model's page. A
 * hero is never a different boat, never a sibling model, never a stock photograph. Where no
 * official picture of the exact model exists at stage size, there is NO entry and the screen
 * draws the studio render it does have: that is the true state.
 *
 * The full-size original of a WordPress `-WxH` address is NOT fetched by stripping the
 * suffix. It was tried on 2026-09-17 and northsidemarine.com.au answers 403 to a script for
 * both the variant and the original, so the seed's copies come off the dealership's own
 * mirror instead. The manufacturers' own libraries carry the same models at four to eight
 * thousand pixels, so that is where a hero comes from.
 */
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const LONG_EDGE = 2560
const QUALITY = 78
const OUT_DIR = join('public', 'hero-images')
const CHOICES = join('data', 'northside', 'heroes.json')
const LEDGER = join('data', 'northside', 'heroes-ledger.json')
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'

/** One chosen hero. `subject` is what it depicts, in the seed's own words. */
interface Choice {
  id: string
  subject: string
  table: string
  model: string
  url: string
  pageUrl: string
  kind: 'photograph' | 'render'
  licenceNote: string
  note?: string
}

interface Held extends Choice {
  file: string
  width: number
  height: number
  bytes: number
  sha256: string
  sourceWidth: number
  sourceHeight: number
  fetchedAt: string
  error?: string
}

const force = process.argv.includes('--force')
const today = new Date().toISOString().slice(0, 10)

const choices = JSON.parse(await readFile(CHOICES, 'utf8')) as Choice[]
await mkdir(OUT_DIR, { recursive: true })

/** Cross-check every choice against the imagery sweep's verified records before fetching. */
const verified = new Map<string, { width?: number; status?: number }>()
for (const f of await readdir(join('docs', 'research', 'imagery')).catch(() => [])) {
  if (!f.endsWith('.json') || f === 'candidates.json') continue
  const rows = JSON.parse(await readFile(join('docs', 'research', 'imagery', f), 'utf8')) as {
    url: string
    width?: number
    status?: number
  }[]
  for (const r of rows) if (r.url) verified.set(r.url, { width: r.width, status: r.status })
}

const ledger: Held[] = existsSync(LEDGER) ? JSON.parse(await readFile(LEDGER, 'utf8')) : []
const byId = new Map(ledger.map((h) => [h.id, h]))

for (const c of choices) {
  const seen = verified.get(c.url)
  if (!seen) {
    console.log(
      `SKIP ${c.id} — not in the imagery sweep's verified records; nothing unverified is fetched`,
    )
    continue
  }
  const already = byId.get(c.id)
  if (already && !already.error && !force && existsSync(join(OUT_DIR, already.file))) {
    console.log(`have ${c.id}  ${already.width}x${already.height}`)
    continue
  }
  const file = `${c.id}-${createHash('sha1').update(c.url).digest('hex').slice(0, 8)}.webp`
  try {
    const res = await fetch(c.url, {
      headers: { 'user-agent': UA },
      signal: AbortSignal.timeout(45_000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    const meta = await sharp(buf).metadata()
    const out = await sharp(buf)
      .resize({ width: LONG_EDGE, height: LONG_EDGE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer()
    const outMeta = await sharp(out).metadata()
    await writeFile(join(OUT_DIR, file), out)
    const held: Held = {
      ...c,
      file,
      width: outMeta.width ?? 0,
      height: outMeta.height ?? 0,
      bytes: out.length,
      sha256: createHash('sha256').update(out).digest('hex'),
      sourceWidth: meta.width ?? 0,
      sourceHeight: meta.height ?? 0,
      fetchedAt: today,
    }
    const i = ledger.findIndex((h) => h.id === c.id)
    if (i >= 0) ledger[i] = held
    else ledger.push(held)
    console.log(
      `ok   ${c.id}  ${meta.width}x${meta.height} -> ${held.width}x${held.height}  ${(out.length / 1024) | 0} kB`,
    )
  } catch (e) {
    const why = e instanceof Error ? e.message.split('\n')[0]! : String(e)
    console.log(`FAIL ${c.id}  ${why}`)
    const i = ledger.findIndex((h) => h.id === c.id)
    const rec = {
      ...c,
      file: '',
      width: 0,
      height: 0,
      bytes: 0,
      sha256: '',
      sourceWidth: 0,
      sourceHeight: 0,
      fetchedAt: today,
      error: why,
    }
    if (i >= 0) ledger[i] = rec
    else ledger.push(rec)
  }
  await new Promise((r) => setTimeout(r, 1200))
}

ledger.sort((a, b) => a.id.localeCompare(b.id))
await writeFile(LEDGER, JSON.stringify(ledger, null, 2) + '\n')
const ok = ledger.filter((h) => !h.error)
console.log(
  `\n${ok.length} held, ${ledger.length - ok.length} failed, ${(ok.reduce((n, h) => n + h.bytes, 0) / 1024 / 1024).toFixed(1)} MB in ${OUT_DIR}`,
)
