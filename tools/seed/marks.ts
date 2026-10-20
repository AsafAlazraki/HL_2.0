/**
 * Brand marks: one wordmark per brand in the seed, at the size a screen can use.
 *
 *   npx tsx tools/seed/marks.ts [--force] [--only=<slug>]   (--only=northside-marine: the dealership's own mark)
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
import { readVerdicts, verifiedByOf } from './accepted'

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

/** The ink's dominant opaque colour, as a hex string: what a letterhead prints. */
async function inkOf(buf: Buffer): Promise<string> {
  const { data } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const count = new Map<string, number>()
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3]! < 255) continue
    const hex =
      '#' +
      [data[i]!, data[i + 1]!, data[i + 2]!].map((v) => v.toString(16).padStart(2, '0')).join('')
    count.set(hex, (count.get(hex) ?? 0) + 1)
  }
  return [...count].toSorted((a, b) => b[1] - a[1])[0]?.[0] ?? ''
}

/* ============================================================
   THE ORGANISATION'S OWN MARK — Northside Marine, not a boat brand.

   It is the letterhead of every quote and the crest of the shell, so
   it is filed apart from the thirteen brands (`role: 'organisation'`)
   and it is chosen by a person, not ranked: the sweep's three records
   for it point at the dealership's old WordPress uploads, which
   answered 403 to scripts in September and 404 since the site moved
   to Shopify. On 2026-10-20 the new site answered a script, and its
   home page carries the mark twice with alt "Northside Marine": the
   header (blue ink) and the footer (the same artwork in white). The
   Shopify CDN serves the original when no `width` is asked, so these
   are the dealership's own files at their own size — held
   byte-for-byte, never redrawn, because this is the showpiece.
   ============================================================ */
const ORGANISATION = {
  brand: 'Northside Marine',
  slug: 'northside-marine',
  pageUrl: 'https://www.northsidemarine.com.au/',
  variants: [
    {
      variant: 'dark',
      url: 'https://www.northsidemarine.com.au/cdn/shop/files/ad992d092fdbb2a46e4b4bf12fdf71697d5f4258.png',
      where: 'the site header, <img alt="Northside Marine">',
    },
    {
      variant: 'white',
      url: 'https://www.northsidemarine.com.au/cdn/shop/files/1c76426640337ddde2fccd01874f13092f996427.png',
      where: 'the site footer, <img alt="Northside Marine">',
    },
  ],
  licenceNote:
    "Northside Marine's own mark on its own home page (northsidemarine.com.au); the dealership is this app's owner. No reuse terms are stated on the site.",
  verifiedBy:
    'Claude (imagery audit), 2026-10-20: looked at both files on white and on navy — the waves, "northside marine", "EST. 1965"; the same artwork the 2025 WordPress header carried (archived by the Internet Archive, 2025-11-29) less its "Life beyond the shore" line. Owner to confirm.',
} as const

async function holdOrganisation(): Promise<void> {
  for (const v of ORGANISATION.variants) {
    const id = ORGANISATION.slug + (v.variant === 'white' ? '-white' : '')
    const existing = ledger.find((h) => h.id === id) as { file?: string } | undefined
    if (existing?.file && !force && existsSync(join(OUT, existing.file))) {
      console.log(`have ${id}`)
      continue
    }
    try {
      const res = await fetch(v.url, {
        headers: { 'user-agent': UA, referer: ORGANISATION.pageUrl },
        signal: AbortSignal.timeout(30_000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      const meta = await sharp(buf).metadata()
      const white = await inkIsWhite(buf)
      // The variant is what a person named; the pixels must agree or nothing is held.
      if (white !== (v.variant === 'white'))
        throw new Error(`ink disagrees: named ${v.variant}, measured ${white ? 'white' : 'dark'}`)
      const file = `${id}.${meta.format === 'jpeg' ? 'jpg' : meta.format}`
      await writeFile(join(OUT, file), buf)
      const rec = {
        id,
        role: 'organisation',
        brand: ORGANISATION.brand,
        slug: ORGANISATION.slug,
        variant: v.variant,
        file,
        url: v.url,
        pageUrl: ORGANISATION.pageUrl,
        foundAt: v.where,
        host: new URL(v.url).host,
        vector: false,
        width: meta.width ?? 0,
        height: meta.height ?? 0,
        sourceWidth: meta.width ?? 0,
        sourceHeight: meta.height ?? 0,
        transparent: meta.hasAlpha ?? false,
        ink: await inkOf(buf),
        printsOnWhite: !white,
        bytes: buf.length,
        sha256: createHash('sha256').update(buf).digest('hex'),
        licenceNote: ORGANISATION.licenceNote,
        verifiedBy: ORGANISATION.verifiedBy,
        fetchedAt: today,
      }
      const i = ledger.findIndex((h) => h.id === id)
      if (i >= 0) ledger[i] = rec
      else ledger.push(rec)
      console.log(
        `ok   ${id.padEnd(22)} png ${rec.width}x${rec.height} ink ${rec.ink} ${(buf.length / 1024) | 0} kB`,
      )
    } catch (e) {
      console.log(`FAIL ${id}  ${e instanceof Error ? e.message.split('\n')[0] : String(e)}`)
    }
    await new Promise((r) => setTimeout(r, 800))
  }
}

function rank(c: Candidate): number {
  const name = decodeURIComponent(c.url)
  let score = 0
  if ((c.contentType ?? '').includes('svg')) score += 1_000_000
  if (IS_A_MARK.test(name)) score += 500_000
  score += (c.width ?? 0) * (c.height ?? 0) * 0.001
  return score
}

/* ============================================================
   A MAKER'S MARK A PERSON ACCEPTED ON A CONTACT SHEET.

   The sweep's ranking cannot find a mark a maker does not publish:
   Stabicraft draws its wordmark inline and serves a 180px "S" icon,
   so the ledger said "no public wordmark verified". The northside
   group's contact sheet (docs/research/imagery/proposals/northside.png)
   carried the full Stabicraft mark as Northside's own site serves it
   in its brand strip — a vector, nothing cut off — and the judge
   accepted it as the BOAT BRAND Stabicraft (never the organisation,
   whatever the proposal's scope said). It is held byte-for-byte, its
   ink is measured by the same detector every mark passes, and a mark
   whose pixels disagree with the ink the judge named is not held.
   ============================================================ */
async function holdAcceptedMarks(): Promise<void> {
  for (const j of readVerdicts()) {
    if (j.decision !== 'accept' || j.kind !== 'mark') continue
    const brand = j.models[0] ?? ''
    if (brand === ORGANISATION.brand || !BRANDS.includes(brand)) continue
    if (only && slug(brand) !== only) continue
    const prior = ledger.find((h) => h.slug === slug(brand) && h['verdicts'] === j.ref) as
      { file?: string } | undefined
    if (prior?.file && !force && existsSync(join(OUT, prior.file))) {
      console.log(`have ${slug(brand)} (accepted ${j.ref})`)
      continue
    }
    try {
      const res = await fetch(j.url, {
        headers: { 'user-agent': UA, referer: j.pageUrl },
        signal: AbortSignal.timeout(30_000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      const vector =
        /svg/.test(res.headers.get('content-type') ?? '') ||
        buf.subarray(0, 512).toString('utf8').includes('<svg')
      /* a vector is measured drawn, at a density a detector can read */
      const drawn = vector ? await sharp(buf, { density: 144 }).png().toBuffer() : buf
      const white = await inkIsWhite(drawn)
      const named = /white ink/i.test(`${j.depicts} ${j.reason}`) ? 'white' : 'dark'
      if ((white ? 'white' : 'dark') !== named)
        throw new Error(
          `ink disagrees: the judge said ${named}, the pixels say ${white ? 'white' : 'dark'}`,
        )
      const id = slug(brand) + (white ? '-white' : '')
      const file = `${id}.${vector ? 'svg' : 'png'}`
      await writeFile(join(OUT, file), buf)
      const meta = await sharp(buf).metadata()
      const rec = {
        id,
        brand,
        slug: slug(brand),
        variant: white ? 'white' : 'dark',
        file,
        url: j.url,
        pageUrl: j.pageUrl,
        host: new URL(j.url).host,
        vector,
        /* held byte-for-byte, so the held size IS the source's: a vector's own drawing size */
        width: meta.width ?? 0,
        height: meta.height ?? 0,
        sourceWidth: meta.width ?? 0,
        sourceHeight: meta.height ?? 0,
        transparent: meta.hasAlpha ?? false,
        ink: await inkOf(drawn),
        printsOnWhite: !white,
        bytes: buf.length,
        sha256: createHash('sha256').update(buf).digest('hex'),
        licenceNote: j.licenceNote,
        depicts: j.depicts,
        verification: j.verification,
        verifiedBy: verifiedByOf(j),
        verdicts: j.ref,
        fetchedAt: today,
      }
      const at = ledger.findIndex((h) => h.id === id)
      if (at >= 0) ledger[at] = rec
      else ledger.push(rec)
      /* the gap this fills is no longer a gap: one row per fact */
      const gap = ledger.findIndex((h) => h.id === `${slug(brand)}:none`)
      if (gap >= 0) ledger.splice(gap, 1)
      accepted.add(brand)
      console.log(
        `ok   ${id.padEnd(22)} ${vector ? 'svg' : 'png'} ${rec.width}x${rec.height} ink ${rec.ink} (accepted ${j.ref})`,
      )
    } catch (e) {
      console.log(
        `FAIL ${slug(brand)} (accepted ${j.ref})  ${e instanceof Error ? e.message.split('\n')[0] : String(e)}`,
      )
    }
  }
}

/** Brands whose mark came from a person's acceptance: the ranked sweep below leaves them alone. */
const accepted = new Set<string>()
for (const h of ledger)
  if (typeof h['verdicts'] === 'string' && h.file) accepted.add(String(h.brand))

/** The organisation's own two files, with the judge's verdict on them written beside them. */
function recordOrganisationVerdict(): void {
  const j = readVerdicts().find(
    (v) => v.decision === 'accept' && v.kind === 'mark' && v.models[0] === ORGANISATION.brand,
  )
  if (!j) return
  for (const h of ledger) {
    if (h['role'] !== 'organisation' || h['url'] !== j.url) continue
    h['verification'] = j.verification
    h['verdicts'] = j.ref
    h['judgedBy'] = verifiedByOf(j)
  }
}

/** `--only=northside-marine` (or a brand's slug) narrows a run to that one mark. */
const only = process.argv.find((a) => a.startsWith('--only='))?.slice('--only='.length)

if (!only || only === ORGANISATION.slug) {
  await holdOrganisation()
  recordOrganisationVerdict()
}
await holdAcceptedMarks()

for (const brand of BRANDS) {
  if (only && slug(brand) !== only) continue
  if (accepted.has(brand)) continue
  /* THE RANKED SWEEP CHOOSES ONCE. A brand the ledger already has a row for keeps it: a new or a
     second mark is proposed on a contact sheet and held from a person's verdict (above), never
     picked again by rank on a later run — which is what keeps a second run fetching nothing. */
  if (!force && ledger.some((h) => h.slug === slug(brand))) {
    console.log(`have ${slug(brand)}`)
    continue
  }
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
