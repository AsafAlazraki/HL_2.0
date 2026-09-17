/**
 * Brand marks: one wordmark per brand in the seed, at the size a screen can use.
 *
 *   npx tsx tools/seed/marks.ts [--force]
 *
 * WHY THIS IS SEPARATE FROM THE PICTURES. A mark is not a photograph of a product: it is the
 * brand's own artwork, it is usually an SVG, and it must never be redrawn, recoloured or
 * cropped. So it is fetched byte-for-byte where it is vector and only ever downscaled where
 * it is raster, and nothing about it is judged scene or studio.
 *
 * WHY THE CHOOSING NEEDS A RULE. The imagery sweep files everything a brand publishes under
 * `kind: "mark"`, and on a trailer maker's site that includes the series badges: Mackay's
 * "MLKR-Series-HEading.png" and "KRX-Badge-01.png" are not the Mackay mark, and Dunbier's
 * "rollamatic" and "SupaRolla" are product names. So a candidate whose file name says badge,
 * series, header or heading is refused, one whose name says logo is preferred, and what is
 * left is taken largest-first with SVG ahead of raster. Every pick was then looked at.
 *
 * THE HONEST GAPS ARE NAMED, NOT FILLED. NSM Custom is the dealership's own trailer brand and
 * has no public mark; Stabicraft publishes nothing but a 180px touch icon. Those are recorded
 * with the reason and no substitute is drawn. A screen that wants a mark it does not have
 * says the brand's name in type, which is true.
 */
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const OUT = join('public', 'brand-marks')
const LEDGER = join('data', 'northside', 'marks-ledger.json')
const RASTER_LONG_EDGE = 1200
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'

/** The brands the seed actually carries, with the slug a screen asks for. */
const BRANDS = [
  'Stacer',
  'Stabicraft',
  'Surtees',
  'Jeanneau',
  'Haines Signature',
  'Highfield',
  'Formosa',
  'Yamaha',
  'ePropulsion',
  'Mercury',
  'Dunbier',
  'Mackay',
  'GFAB',
]

const NOT_A_MARK = /badge|series|heading|header|favicon|apple-touch|touch-icon/i
const IS_A_MARK = /logo|wordmark|brandmark/i

interface Candidate {
  brand?: string
  kind?: string
  url: string
  pageUrl?: string
  status?: number
  contentType?: string
  bytes?: number
  width?: number
  height?: number
  licenceNote?: string
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const dir = join('docs', 'research', 'imagery')
const all: Candidate[] = []
for (const f of await readdir(dir)) {
  if (!f.endsWith('.json') || f === 'candidates.json') continue
  all.push(...(JSON.parse(await readFile(join(dir, f), 'utf8')) as Candidate[]))
}

await mkdir(OUT, { recursive: true })
const force = process.argv.includes('--force')
const today = new Date().toISOString().slice(0, 10)
const ledger: Record<string, unknown>[] = existsSync(LEDGER)
  ? JSON.parse(await readFile(LEDGER, 'utf8'))
  : []

/** White variants are worth having: a mark on a photograph needs one. */
const isWhite = (url: string) => /white|reverse|_wht|-wht/i.test(decodeURIComponent(url))

/**
 * ASK THE PIXELS, BECAUSE THE FILE NAME LIES. Mercury publishes exactly one mark and calls it
 * "mercury-footer-logo.png"; every opaque pixel in it is pure white, because it is drawn for
 * a dark footer. Filed as the dark variant it would have shipped as an invisible logo on a
 * white page — the mark equivalent of the entry board whose photograph was a broken image.
 * So a raster mark is measured: if its ink is nearly white it is the white variant whatever
 * its name says, and if the brand then has no dark variant that is recorded as the gap it is.
 */
async function inkIsWhite(buf: Buffer): Promise<boolean> {
  const { data } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  let opaque = 0
  let sum = 0
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3]! > 128) {
      opaque++
      sum += (data[i]! + data[i + 1]! + data[i + 2]!) / 3
    }
  }
  return opaque > 0 && sum / opaque > 240
}

function rank(c: Candidate): number {
  const name = decodeURIComponent(c.url)
  let score = 0
  if ((c.contentType ?? '').includes('svg')) score += 1_000_000
  if (IS_A_MARK.test(name)) score += 500_000
  score += (c.width ?? 0) * (c.height ?? 0) * 0.001
  return score
}

for (const brand of BRANDS) {
  const pool = all.filter(
    (c) =>
      c.kind === 'mark' &&
      c.status !== undefined &&
      c.status < 300 &&
      (c.brand ?? '').toLowerCase() === brand.toLowerCase() &&
      !NOT_A_MARK.test(decodeURIComponent(c.url)),
  )
  if (pool.length === 0) {
    console.log(`NONE ${brand} — no public wordmark the sweep could verify`)
    // Replace this brand’s row, never append a second one: the gap is a fact about the
    // brand, and a re-run must restate it rather than stack it.
    const gap = {
      id: `${slug(brand)}:none`,
      brand,
      slug: slug(brand),
      error: 'no public wordmark verified',
      checkedAt: today,
    }
    const at = ledger.findIndex((h) => h.id === gap.id)
    if (at >= 0) ledger[at] = gap
    else ledger.push(gap)
    continue
  }
  const dark = pool.filter((c) => !isWhite(c.url)).toSorted((a, b) => rank(b) - rank(a))[0]
  const white = pool.filter((c) => isWhite(c.url)).toSorted((a, b) => rank(b) - rank(a))[0]

  for (const [variant, pick] of [
    ['', dark],
    ['-white', white],
  ] as const) {
    if (!pick) continue
    const id = slug(brand) + variant
    const existing = ledger.find((h) => h.id === id) as { file?: string } | undefined
    if (existing?.file && !force && existsSync(join(OUT, existing.file))) {
      console.log(`have ${id}`)
      continue
    }
    try {
      const res = await fetch(pick.url, {
        headers: { 'user-agent': UA },
        signal: AbortSignal.timeout(30_000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      const vector = (pick.contentType ?? '').includes('svg')
      const out = vector
        ? buf
        : await sharp(buf)
            .resize({
              width: RASTER_LONG_EDGE,
              height: RASTER_LONG_EDGE,
              fit: 'inside',
              withoutEnlargement: true,
            })
            .png()
            .toBuffer()
      // The name says which variant this is; the pixels get the last word.
      let realId = id
      if (!vector && variant === '' && (await inkIsWhite(out))) {
        realId = slug(brand) + '-white'
        console.log(`note ${id} is drawn in white ink — filed as ${realId}`)
      }
      const file = `${realId}.${vector ? 'svg' : 'png'}`
      await writeFile(join(OUT, file), out)
      const meta = vector ? { width: pick.width, height: pick.height } : await sharp(out).metadata()
      const rec = {
        id: realId,
        brand,
        slug: slug(brand),
        variant: realId.endsWith('-white') ? 'white' : 'dark',
        file,
        url: pick.url,
        pageUrl: pick.pageUrl ?? '',
        vector,
        width: meta.width ?? 0,
        height: meta.height ?? 0,
        bytes: out.length,
        sha256: createHash('sha256').update(out).digest('hex'),
        licenceNote: pick.licenceNote ?? '',
        fetchedAt: today,
      }
      const i = ledger.findIndex((h) => h.id === realId)
      if (i >= 0) ledger[i] = rec
      else ledger.push(rec)
      console.log(
        `ok   ${id.padEnd(22)} ${vector ? 'svg' : 'png'} ${rec.width}x${rec.height} ${(out.length / 1024) | 0} kB`,
      )
    } catch (e) {
      console.log(`FAIL ${id}  ${e instanceof Error ? e.message.split('\n')[0] : String(e)}`)
    }
    await new Promise((r) => setTimeout(r, 800))
  }
}

ledger.sort((a, b) => String(a.id ?? a.brand).localeCompare(String(b.id ?? b.brand)))
await writeFile(LEDGER, JSON.stringify(ledger, null, 2) + String.fromCharCode(10))
const held = ledger.filter((h) => h.file)
console.log(`\n${held.length} marks held, ${ledger.length - held.length} brands with none`)
