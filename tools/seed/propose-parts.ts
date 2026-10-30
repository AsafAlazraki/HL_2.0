/**
 * THE PARTS' PICTURES, PROPOSED FOR A PERSON TO JUDGE.
 *
 *   npx tsx tools/seed/propose-parts.ts            fetch, measure, write proposals and sheets
 *   npx tsx tools/seed/propose-parts.ts --sheets   re-draw the sheets from the proposals written
 *
 * The owner, 2026-10-28: "if parts and things dont have images go get them". The imagery round
 * (propose-images.ts) proposed pictures of boats, motors and trailers from the measured sweep in
 * `candidates.json`; a part is found differently — by its PART NUMBER on its maker's own page —
 * so its candidates are their own file, `docs/research/imagery/parts-candidates.json`, each with
 * the page that names that part number and how the match was made.
 *
 * IT PROPOSES; IT HOLDS NOTHING. Every picture lands in `tools/seed/.imgcache/` (gitignored)
 * under the `sha1(address)` name `fetch-images.ts` uses, so `fetch-images.ts --accepted` holds
 * an approved proposal from the bytes this run paid for. One JSON and one contact sheet per
 * group are written under `docs/research/imagery/proposals/` (`parts-<maker>[-n]`), each tile
 * the picture with the FILE's name for the part under it in large type and the maker's own name
 * for that part number beneath — so a judge sees at a glance whether the two say the same item.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { format, resolveConfig } from 'prettier'
import sharp, { type OverlayOptions } from 'sharp'
import { LONG_EDGE, QUALITY, hostOf, sha1Hex } from './ledger'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '..', '..')
const CACHE = path.join(HERE, '.imgcache')
const IMAGERY = path.join(ROOT, 'docs', 'research', 'imagery')
const PROPOSALS = path.join(IMAGERY, 'proposals')
const TODAY = new Date().toISOString().slice(0, 10)
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
const PER_SHEET = 40

/** One measured candidate: a row of the file, and the maker's own picture of its part number. */
interface Candidate {
  table: string
  row: string
  code: string
  /** the file's own name for the part */
  file: string
  maker: string
  /** the maker's own name for that part number, off its page */
  said: string
  url: string
  pageUrl: string
  /** how the page was matched to the row */
  how: string
}

interface Proposal {
  n: number
  group: string
  tile: string
  table: string
  register: string
  model: string
  scope: 'model'
  kind: 'catalogue'
  sourceKind: 'product'
  url: string
  pageUrl: string
  host: string
  sourceWidth: number
  sourceHeight: number
  heldWidth: number
  heldHeight: number
  heldBytes: number
  verdict: 'studio' | 'scene'
  depicts: string
  differs: string[]
  licenceNote: string
  reason: string
  verification: string
  thumb: string
  code: string
  makerSays: string
}

const sheetsOnly = process.argv.includes('--sheets')

const licenceOf = (c: Candidate): string =>
  `Published on ${c.maker}'s own site, ${hostOf(c.pageUrl).replace(/^www\./, '')}, as the product picture for part number ${c.code}; the site states no image-reuse terms for dealers, so no licence is claimed here beyond the address being public.`

/** The bytes, from the shared cache or the maker's host. */
async function bytesOf(url: string): Promise<Buffer | null> {
  const p = path.join(CACHE, sha1Hex(url))
  if (existsSync(p) && existsSync(`${p}.json`)) return readFileSync(p)
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': UA, accept: 'image/avif,image/webp,image/png,image/*;q=0.9' },
      signal: AbortSignal.timeout(60_000),
    })
    const type = (res.headers.get('content-type') ?? '').split(';')[0]!.trim()
    if (!res.ok || !type.startsWith('image/')) return null
    const raw = Buffer.from(await res.arrayBuffer())
    mkdirSync(CACHE, { recursive: true })
    writeFileSync(p, raw)
    writeFileSync(
      `${p}.json`,
      `${JSON.stringify({ type, bytes: raw.length, via: 'host' }, null, 2)}\n`,
      'utf8',
    )
    await new Promise((r) => setTimeout(r, 400))
    return raw
  } catch {
    return null
  }
}

/** SIMRAD'S HOST REFUSES NODE'S OWN CLIENT (a bot wall that reads the TLS handshake) and serves
 *  curl, so a refused address is asked once more through curl, which writes the bytes straight
 *  to the cache file: the picture is never read as text. */
function curled(url: string): Buffer | null {
  const p = path.join(CACHE, sha1Hex(url))
  try {
    mkdirSync(CACHE, { recursive: true })
    const type = execFileSync(
      'curl',
      ['-sL', '--max-time', '60', '-A', UA, '-o', p, '-w', '%{content_type}', url],
      { encoding: 'utf8' },
    )
      .split(';')[0]!
      .trim()
    if (!type.startsWith('image/') || statSync(p).size === 0) return null
    const raw = readFileSync(p)
    writeFileSync(
      `${p}.json`,
      `${JSON.stringify({ type, bytes: raw.length, via: 'host' }, null, 2)}
`,
      'utf8',
    )
    return raw
  } catch {
    return null
  }
}

/** whether a cell of the 32×32 judge grid lies on its border */
const edge = (x: number, y: number): boolean => x === 0 || y === 0 || x === 31 || y === 31

/** A product shot on white or transparent is studio; anything else is a scene for the judge. */
async function verdictOf(raw: Buffer): Promise<'studio' | 'scene'> {
  const { data, info } = await sharp(raw)
    .flatten({ background: '#ffffff' })
    .resize(32, 32, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true })
  let light = 0
  let border = 0
  for (let y = 0; y < 32; y += 1)
    for (let x = 0; x < 32; x += 1) {
      if (!edge(x, y)) continue
      border += 1
      const i = (y * 32 + x) * info.channels
      if (data[i]! > 235 && data[i + 1]! > 235 && data[i + 2]! > 235) light += 1
    }
  return light / border > 0.8 ? 'studio' : 'scene'
}

const groupOf = (c: Candidate): string => `parts-${c.maker.toLowerCase()}`

async function propose(): Promise<Proposal[]> {
  const doc = JSON.parse(readFileSync(path.join(IMAGERY, 'parts-candidates.json'), 'utf8')) as {
    candidates: Candidate[]
  }
  const out: Proposal[] = []
  for (const c of doc.candidates) {
    const raw = (await bytesOf(c.url)) ?? curled(c.url)
    if (!raw) {
      console.log(`  refused  ${c.row} ${c.url}`)
      continue
    }
    let meta: Awaited<ReturnType<ReturnType<typeof sharp>['metadata']>>
    try {
      meta = await sharp(raw).metadata()
    } catch {
      console.log(`  unreadable ${c.row}`)
      continue
    }
    const held = await sharp(raw)
      .rotate()
      .resize({ width: LONG_EDGE, height: LONG_EDGE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 6 })
      .toBuffer({ resolveWithObject: true })
    const thumb = path.join(CACHE, `${sha1Hex(c.url)}.thumb.webp`)
    await sharp(raw)
      .rotate()
      .flatten({ background: '#ffffff' })
      .resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(thumb)
    out.push({
      n: 0,
      group: groupOf(c),
      tile: c.file,
      table: c.table,
      register: 'Parts & Accessories',
      model: c.file,
      scope: 'model',
      kind: 'catalogue',
      sourceKind: 'product',
      url: c.url,
      pageUrl: c.pageUrl,
      host: hostOf(c.url),
      sourceWidth: meta.width ?? 0,
      sourceHeight: meta.height ?? 0,
      heldWidth: held.info.width,
      heldHeight: held.info.height,
      heldBytes: held.data.length,
      verdict: await verdictOf(raw),
      depicts: `${c.maker} ${c.said} (part number ${c.code}), row ${c.row}`,
      differs: [],
      licenceNote: licenceOf(c),
      reason: c.how,
      verification:
        'Proposed, not verified: a person marks it as this exact item on the contact sheet before it is held.',
      thumb: path.relative(CACHE, thumb).replaceAll('\\', '/'),
      code: c.code,
      makerSays: c.said,
    })
  }
  return out
}

const esc = (s: string) =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

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

/** One contact sheet: the picture, the file's name large, the maker's name and code small. */
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
  const text: string[] = [
    `<text x="20" y="44" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="700" fill="#0b2540">${esc(`${group} — ${items.length} proposed (say yes or no to each by its number)`)}</text>`,
  ]
  for (const [i, p] of items.entries()) {
    const x = 10 + (i % COLS) * TILE_W + 10
    const y = HEAD + Math.floor(i / COLS) * (IMG_H + CAP_H + 20)
    const img = await sharp(path.join(CACHE, p.thumb))
      .resize({ width: IMG_W, height: IMG_H, fit: 'contain', background: '#e9ecef' })
      .flatten({ background: '#e9ecef' })
      .png()
      .toBuffer()
    layers.push({ input: img, left: x, top: y })
    text.push(
      `<rect x="${x}" y="${y}" width="44" height="30" fill="#0b2540"/><text x="${x + 22}" y="${y + 22}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="700" fill="#fff">${p.n}</text>`,
    )
    const lines = wrap(p.tile, 28).slice(0, 3)
    lines.forEach((l, j) =>
      text.push(
        `<text x="${x}" y="${y + IMG_H + 28 + j * 26}" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="700" fill="#111">${esc(l)}</text>`,
      ),
    )
    const said = wrap(`maker: ${p.makerSays}`, 44).slice(0, 2)
    said.forEach((l, j) =>
      text.push(
        `<text x="${x}" y="${y + IMG_H + 28 + lines.length * 26 + j * 18}" font-family="Segoe UI, Arial, sans-serif" font-size="15" fill="#1d4f91">${esc(l)}</text>`,
      ),
    )
    text.push(
      `<text x="${x}" y="${y + IMG_H + 28 + lines.length * 26 + said.length * 18 + 2}" font-family="Segoe UI, Arial, sans-serif" font-size="14" fill="#444">${esc(`${p.code} · ${p.verdict} · ${p.sourceWidth}×${p.sourceHeight}`)}</text>`,
    )
  }
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${text.join('')}</svg>`,
  )
  await sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } })
    .composite([...layers, { input: svg, left: 0, top: 0 }])
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toFile(path.join(PROPOSALS, `${group}.png`))
}

async function main(): Promise<void> {
  mkdirSync(PROPOSALS, { recursive: true })
  let groups = new Map<string, Proposal[]>()
  if (sheetsOnly) {
    for (const f of (await import('node:fs')).readdirSync(PROPOSALS)) {
      if (!/^parts-.*\.json$/.test(f) || f.endsWith('.verdicts.json')) continue
      const doc = JSON.parse(readFileSync(path.join(PROPOSALS, f), 'utf8')) as {
        group: string
        proposals: Proposal[]
      }
      groups.set(doc.group, doc.proposals)
    }
  } else {
    const all = (await propose()).toSorted(
      (a, b) => a.group.localeCompare(b.group) || a.tile.localeCompare(b.tile),
    )
    const byMaker = new Map<string, Proposal[]>()
    for (const p of all) byMaker.set(p.group, [...(byMaker.get(p.group) ?? []), p])
    /* a sheet a judge can read: at most forty tiles, numbered from one */
    groups = new Map()
    for (const [maker, list] of byMaker) {
      const parts = Math.ceil(list.length / PER_SHEET)
      for (let k = 0; k < parts; k += 1) {
        const name = parts === 1 ? maker : `${maker}-${k + 1}`
        groups.set(
          name,
          list
            .slice(k * PER_SHEET, (k + 1) * PER_SHEET)
            .map((p, i) => ({ ...p, group: name, n: i + 1 })),
        )
      }
    }
    for (const [g, items] of groups) {
      const file = path.join(PROPOSALS, `${g}.json`)
      const doc = {
        group: g,
        measuredAt: TODAY,
        by: 'tools/seed/propose-parts.ts',
        sheet: `${g}.png`,
        note: 'Proposals only: nothing here is held. Each tile shows the maker’s own picture for the part number the price file gives the row, with the file’s name for the part in large type and the maker’s own name for that part number beneath. A picture is held only after a person marks it as depicting exactly that part.',
        newBytes: items.reduce((n, p) => n + p.heldBytes, 0),
        proposals: items,
      }
      writeFileSync(
        file,
        await format(JSON.stringify(doc), { ...(await resolveConfig(file)), parser: 'json' }),
      )
    }
  }
  for (const [g, items] of groups) {
    await sheet(g, items)
    console.log(`sheet ${g}: ${items.length}`)
  }
}

await main()
