/**
 * Fetch the catalogue's photographs ONCE, here, so the app never hotlinks them.
 *
 * A port of `tools/seed/legacy/fetch_images.py` (Node + `sharp`; Python is not on this
 * machine). It reads the image ledger the packer wrote (`data/northside/images.json`),
 * asks about every address that has not been asked about, fetches each one once,
 * downscales it, and writes:
 *
 *   * `public/seed-images/*.webp`     — the pixels, served same-origin by Vite
 *   * `data/northside/images.json`    — the record of where each one came from, and of
 *                                        every address that could NOT be fetched, with the
 *                                        measured reason
 *
 * and then the manifest's picture counts and `docs/data/IMAGES.md`.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS DOES NOT CONTRADICT "an address is the preferred form of a picture"
 *
 * That rule is about the RUNTIME STORE: bytes held on an `ImageRef` are base64 inside a
 * row, they land in IndexedDB, and they leave in every export. That trade is refused here
 * as firmly as it was there. Nothing on this path touches any of it. `ImageRef.src` still
 * holds the manufacturer's address; the row, the store, the export and a frozen quote are
 * byte-for-byte what they were. The pixels are a BUILD ARTEFACT beside the app, resolved
 * at paint time by the ledger and never by the data.
 *
 * WHAT IS NOT DONE HERE, and why
 *
 *   * No image is substituted for another. A row whose photograph cannot be fetched keeps
 *     its address. A stand-in photograph on a quote is the failure mode this whole area
 *     exists to avoid.
 *   * No bot protection is worked around. `www.northsidemarine.com.au` answers 403 from
 *     Cloudflare with `Cf-Mitigated: challenge` to a plain client as well as to a browser;
 *     that is the site telling us not to. It is recorded as unavailable, which is the
 *     truth.
 *   * No credential is used and nothing is ever written anywhere but this repository.
 *
 * ---------------------------------------------------------------------------
 * THE MIRROR, AND WHY READING IT IS NOT GUESSING
 *
 * The dealership's own remediation run hit the SAME wall this file hits — the Cloudflare
 * 403 — and solved it once. Every picture it recovered was written to the app's Storage
 * bucket under a name derived from the ORIGINAL ADDRESS:
 *
 *     mpf-mirror/{folder}/{sha1(url).hexdigest()[:16]}.{ext}
 *
 *     remediate-images.py:170   h = hashlib.sha1(url.encode()).hexdigest()[:16]
 *     remediate-images.py:180   name = f"mpf-mirror/{folder}/{h}.{ext}"
 *     remediate-images.py:67    BUCKET = studio-2290360004-3b963.firebasestorage.app
 *     folder is "dfo" for site-hosted pictures, "motors" for the Yamaha CDN.
 *
 * THAT IS WHY THIS IS SAFE, and it is the whole argument. The object's NAME is a function
 * of the address the workbook typed. We do not search that bucket for "a picture that
 * looks like this boat" — that is exactly the substitution the honesty rule forbids. We
 * compute the name from the address we already hold and ask for that one object. A wrong
 * picture cannot arrive by this path without a SHA-1 preimage collision.
 *
 * Because a name is only as good as the thing that wrote it, a SECOND, INDEPENDENT check
 * is applied to every mirrored byte and to nothing else (`declaredSize`): a WordPress
 * derivative address states its own pixel size in its filename — `...620F-1024x683.jpg` —
 * and the bytes have to be that size or they do not land. Measured on the first run: 51 of
 * the 70 addresses made that claim and 51 of 51 agreed, 0 disagreed. It is applied only to
 * the mirror because a picture fetched from its own address is self-identifying and needs
 * no corroboration; a picture fetched from somewhere else does.
 *
 * Nothing about the bucket is authenticated: one plain unauthenticated GET per object. If
 * that ever stops being true, the fetch fails and the address goes back to being recorded
 * unavailable, which is still the truth. NOTHING is ever written to that bucket, and no
 * database document is read: the mirror is addressed arithmetically.
 * ---------------------------------------------------------------------------
 *
 * USAGE
 *
 *     npx tsx tools/seed/fetch-images.ts                 # fetch what has not been asked for
 *     npx tsx tools/seed/fetch-images.ts --probe         # report only; write nothing
 *     npx tsx tools/seed/fetch-images.ts --refetch       # ignore the cache, ask again about everything
 *     npx tsx tools/seed/fetch-images.ts --retry-refused # ask again about the refused ones too
 *     npx tsx tools/seed/fetch-images.ts --mirror        # ask ONLY the mirror, and only for what we
 *                                                        # do not hold; no request leaves for any third party
 *     --budget=<minutes> (default 10) · --pause=<ms> between requests (default 2000) · --limit=<n>
 *     --prune                                           # delete a copy under public/seed-images that
 *                                                        # no address names any more (reported otherwise)
 *
 *     npx tsx --tsconfig tsconfig.app.json --import ./tools/seed/app.hooks.mjs \
 *       tools/seed/fetch-images.ts --accepted             # THE CATALOGUE TIER OF data/northside/pictures.json:
 *                                                        # every catalogue picture a verdict under
 *                                                        # docs/research/imagery/proposals/ accepted, and
 *                                                        # nothing else, plus the findings on rows' own addresses
 *
 * THE ACCEPTED MODE IS A SECOND LEDGER, NOT A SECOND PIPELINE. The bytes come the way every
 * other copy here comes — the cache first, then the host, then `encode` at long edge 1100 —
 * and land beside the rows' own copies in public/seed-images. What differs is the record: a
 * picture a person attached to a MODEL is not a row's own address, so it is written to
 * `pictures.json` with who verified it and how, and `images.json` is left exactly as it was.
 *
 * Originals land in `tools/seed/.imgcache/` (gitignored) so re-encoding at a different
 * size costs no requests and no bandwidth from somebody else's server. Requests are made
 * one at a time with a pause between them, and the run stops when the budget is spent.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import type { PackManifest } from '../../src/domain/model'
import { countLedger } from '../../src/data/pack/images'
import { imagesDoc, modelsOnDisk } from './docs'
import {
  LONG_EDGE,
  QUALITY,
  hostOf,
  licenceNoteFor,
  mirrorKey,
  plainly,
  readLedger,
  refusal,
  sha1Hex,
  sha256Hex,
  stemFor,
  writeLedger,
} from './ledger'
import { verdictOf } from './verdict'
import type { PictureEntry, PictureFinding } from '../../src/domain/model/pictures'
import {
  exactRowsOf,
  fleetIndex,
  modelNamed,
  readVerdicts,
  saidOf,
  slug,
  verifiedByOf,
  type FleetIndex,
  type Judged,
  spokenNamer,
} from './accepted'
import { readPictures, writePictures } from './ledger'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '..', '..')
const DATA = path.join(ROOT, 'data', 'northside')
const OUT_DIR = path.join(ROOT, 'public', 'seed-images')
const CACHE = path.join(HERE, '.imgcache')
const DOCS = path.join(ROOT, 'docs', 'data')

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
const HEADERS = {
  'User-Agent': UA,
  Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
  'Accept-Language': 'en-AU,en;q=0.9',
}
const TIMEOUT_MS = 30_000
const ATTEMPTS = 3

const MIRROR_BUCKET = 'studio-2290360004-3b963.firebasestorage.app'
const MIRROR_BASE = `https://firebasestorage.googleapis.com/v0/b/${MIRROR_BUCKET}/o`
const MIRROR_PREFIX = 'mpf-mirror/'

const args = process.argv.slice(2)
const flag = (name: string): boolean => args.includes(`--${name}`)
const num = (name: string, fallback: number): number => {
  const hit = args.find((a) => a.startsWith(`--${name}=`))
  const n = hit ? Number(hit.slice(name.length + 3)) : Number.NaN
  return Number.isFinite(n) ? n : fallback
}

const probeOnly = flag('probe')
const refetch = flag('refetch')
const mirrorOnly = flag('mirror')
const retryRefused = flag('retry-refused')
const prune = flag('prune')
const budgetMs = num('budget', 10) * 60_000
const pauseMs = num('pause', 2000)
const limit = num('limit', Number.POSITIVE_INFINITY)

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface Got {
  raw: Buffer | null
  ctype: string
  status: number
  why: string
  via: 'host' | 'mpf-mirror' | ''
  mirror: string | null
}

const nothing = (why: string, mirror: string | null = null): Got => ({
  raw: null,
  ctype: '',
  status: 0,
  why,
  via: '',
  mirror,
})

/* ---------------------------------------------------------- */
/* the host                                                   */
/* ---------------------------------------------------------- */

async function fetchOne(url: string): Promise<Got> {
  const host = hostOf(url)
  let last = nothing(refusal(host, 0, '', false))
  for (let attempt = 0; attempt < ATTEMPTS; attempt += 1) {
    let res: Response
    try {
      res = await fetch(url, {
        headers: HEADERS,
        redirect: 'follow',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
    } catch {
      last = nothing(refusal(host, 0, '', false))
      await sleep(1000 * (1 + attempt))
      continue
    }
    const ctype = (res.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
    const cf = res.headers.has('cf-mitigated')
    /* Landed somewhere else entirely — an identity provider, not a
       picture. The destination is CLASSIFIED and never recorded: it
       carries the dealership's tenant id, which is nobody's business
       but theirs. */
    const landed = hostOf(res.url)
    const signin = landed !== host && /(login|signin|sign-in|auth|adfs|okta)\./.test(landed)
    if (res.status !== 200) {
      return { ...nothing(refusal(host, res.status, ctype, cf, signin)), ctype, status: res.status }
    }
    if (!ctype.startsWith('image/')) {
      return { ...nothing(refusal(host, 200, ctype, cf, signin)), ctype, status: 200 }
    }
    return {
      raw: Buffer.from(await res.arrayBuffer()),
      ctype,
      status: 200,
      why: '',
      via: 'host',
      mirror: null,
    }
  }
  return last
}

/* ---------------------------------------------------------- */
/* the mirror the business already built                      */
/* ---------------------------------------------------------- */

/** {key: object name} for every object under `mpf-mirror/`. One
 *  listing rather than guessing extensions one HEAD at a time: the
 *  extension was decided by the bytes at mirror time, so the LISTING
 *  is what tells us `.jpg` or `.png`, and the KEY is still what tells
 *  us the object is this address's. */
async function mirrorIndex(): Promise<Map<string, string>> {
  const index = new Map<string, string>()
  let token: string | undefined
  for (;;) {
    let url = `${MIRROR_BASE}?prefix=${encodeURIComponent(MIRROR_PREFIX)}&maxResults=1000`
    if (token) url += `&pageToken=${encodeURIComponent(token)}`
    let res: Response
    try {
      res = await fetch(url, {
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
    } catch {
      return new Map()
    }
    if (res.status !== 200) return new Map() // unreadable without a credential -> we do not use one
    const body = (await res.json()) as { items?: { name?: string }[]; nextPageToken?: string }
    for (const item of body.items ?? []) {
      const name = item.name ?? ''
      const leaf = name.split('/').pop() ?? ''
      const dot = leaf.lastIndexOf('.')
      if (dot > 0) index.set(leaf.slice(0, dot), name)
    }
    token = body.nextPageToken
    if (!token) return index
  }
}

const DECLARED = /-(\d{2,5})x(\d{2,5})\.(?:jpe?g|png|webp|gif)$/i

/** (w, h) the ADDRESS ITSELF claims, or null. A WordPress derivative
 *  names its own pixel size — `620F-1024x683.jpg`. That is a fact
 *  stated by the workbook's address, so it is a check the mirrored
 *  bytes have to pass that does not depend on trusting the mirror. */
function declaredSize(url: string): [number, number] | null {
  const last = url.replace(/\/+$/, '').split('/').pop()?.split('?')[0] ?? ''
  const m = DECLARED.exec(last)
  return m ? [Number(m[1]), Number(m[2])] : null
}

/** Refuses on: no object under this address's key; a non-image answer;
 *  and bytes whose real size contradicts the size the address declares. */
async function fetchMirror(url: string, index: Map<string, string>): Promise<Got> {
  const name = index.get(mirrorKey(url))
  /* NO OBJECT UNDER THIS ADDRESS'S KEY. That is not a measurement of
     anything — it says the dealership never recovered this one, not
     that the host refused us. The caller must not turn it into a
     sentence about the host. */
  if (!name) return nothing('')
  const h = plainly(hostOf(url))
  let res: Response
  try {
    res = await fetch(`${MIRROR_BASE}/${encodeURIComponent(name)}?alt=media`, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch {
    return nothing(`${h}'s mirrored copy could not be reached`, name)
  }
  const ctype = (res.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
  const raw = Buffer.from(await res.arrayBuffer())
  if (res.status !== 200 || raw.length === 0) {
    return { ...nothing(`${h}'s mirrored copy answered ${res.status}`, name), ctype }
  }
  const want = declaredSize(url)
  if (want) {
    let got: [number, number]
    try {
      const m = await sharp(raw).metadata()
      got = [m.width, m.height]
    } catch {
      return { ...nothing(`${h}'s mirrored copy is not bytes we can read`, name), ctype }
    }
    if (got[0] !== want[0] || got[1] !== want[1]) {
      /* DO NOT LAND IT. The address says one size, the copy is another:
         something between the workbook and the mirror is not the same
         picture, and a wrong photograph on a quote is the failure this
         whole area exists to avoid. */
      return {
        ...nothing(
          `${h}'s mirrored copy is ${got[0]}x${got[1]} where the address says ${want[0]}x${want[1]}`,
          name,
        ),
        ctype,
      }
    }
  }
  if (!ctype.startsWith('image/'))
    return { ...nothing(`${h}'s mirrored copy is not a picture`, name), ctype }
  return { raw, ctype, status: 200, why: '', via: 'mpf-mirror', mirror: name }
}

/* ---------------------------------------------------------- */
/* the cache of originals                                     */
/* ---------------------------------------------------------- */

interface CacheMeta {
  type: string
  bytes: number
  via: 'host' | 'mpf-mirror'
  mirror?: string
}

const cachePath = (url: string): string => path.join(CACHE, sha1Hex(url))

function loadCached(url: string): { raw: Buffer; meta: CacheMeta } | null {
  const p = cachePath(url)
  if (!existsSync(p) || !existsSync(`${p}.json`)) return null
  return { raw: readFileSync(p), meta: JSON.parse(readFileSync(`${p}.json`, 'utf8')) as CacheMeta }
}

/** Keep the original bytes AND where they came from. Provenance has to
 *  survive the cache or a re-encode would quietly forget that a picture
 *  arrived by the mirror rather than from its own host. */
function storeCached(url: string, raw: Buffer, meta: CacheMeta): void {
  mkdirSync(CACHE, { recursive: true })
  writeFileSync(cachePath(url), raw)
  /* expanded, two spaces, trailing newline — the shape prettier leaves a
     JSON file in, so `format:check` over the tree does not trip on a cache */
  writeFileSync(`${cachePath(url)}.json`, `${JSON.stringify(meta, null, 2)}\n`, 'utf8')
}

/* ---------------------------------------------------------- */
/* encoding                                                   */
/* ---------------------------------------------------------- */

interface Encoded {
  file: string
  bytes: number
  width: number
  height: number
  sha256: string
  sourceWidth: number
  sourceHeight: number
}

/** Downscale and re-encode to WebP. Returns the record, or null if the
 *  bytes are not an image we can open. */
type Metadata = Awaited<ReturnType<ReturnType<typeof sharp>['metadata']>>

async function encode(raw: Buffer, dest: string): Promise<Encoded | null> {
  let meta: Metadata
  try {
    meta = await sharp(raw).metadata()
  } catch {
    return null
  }
  /* Transparency is kept only where it is actually used — a logo on a
     transparent ground stays that way, a photograph saved as RGBA does
     not pay for an alpha channel it never varies. */
  let keepAlpha = false
  if (meta.hasAlpha) {
    const stats = await sharp(raw).stats()
    const alpha = stats.channels[stats.channels.length - 1]
    keepAlpha = alpha !== undefined && alpha.min < 255
  }
  let pipeline = sharp(raw).rotate()
  if (meta.hasAlpha && !keepAlpha) pipeline = pipeline.removeAlpha()
  const { data, info } = await pipeline
    .resize({ width: LONG_EDGE, height: LONG_EDGE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 6 })
    .toBuffer({ resolveWithObject: true })
  mkdirSync(path.dirname(dest), { recursive: true })
  writeFileSync(dest, data)
  return {
    file: path.basename(dest),
    bytes: data.length,
    width: info.width,
    height: info.height,
    sha256: sha256Hex(data),
    sourceWidth: meta.width,
    sourceHeight: meta.height,
  }
}

/* ---------------------------------------------------------- */
/* the run                                                    */
/* ---------------------------------------------------------- */

async function main(): Promise<number> {
  const doc = readLedger(DATA)
  const entries = doc.images
  const today = new Date().toISOString().slice(0, 10)
  console.log(`${entries.length} distinct image addresses in the seed`)

  const targets = entries.filter((e) => {
    if (refetch) return true
    if (e.file) return false
    return retryRefused ? true : e.error === undefined
  })
  console.log(
    mirrorOnly
      ? `  ${targets.length} addresses not already held; asking the mirror for each`
      : `  ${targets.length} addresses to ask about, one at a time, ${pauseMs} ms apart, for at most ${Math.round(budgetMs / 60_000)} minutes`,
  )

  /* ONE LISTING, SHARED. Costs a request or two whatever the mode, and
     comes back empty if the bucket ever stops answering a plain GET — in
     which case every address simply keeps the answer it already had. */
  const index = await mirrorIndex()
  console.log(
    index.size > 0
      ? `  mirror: ${index.size} objects readable without a credential`
      : '  mirror: not readable — every address is on its own host only',
  )

  let asked = 0
  let obtained = 0
  let refused = 0
  let recovered = 0
  let changed = 0
  const deadline = Date.now() + budgetMs

  const save = (): void => {
    if (probeOnly || changed === 0) return
    doc.meta.measured = today
    writeLedger(DATA, doc)
    const manifestPath = path.join(DATA, 'manifest.json')
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as PackManifest
    manifest.images = { file: 'images.json', ...countLedger(entries) }
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
    mkdirSync(DOCS, { recursive: true })
    writeFileSync(
      path.join(DOCS, 'IMAGES.md'),
      imagesDoc(manifest, doc, modelsOnDisk(DATA)),
      'utf8',
    )
  }

  for (const e of targets) {
    if (asked >= limit) break
    if (Date.now() > deadline) {
      console.log('  budget spent; the rest stay unmeasured, which is the truth')
      break
    }
    const url = e.address
    const cached = refetch ? null : loadCached(url)
    let res: Got
    if (cached) {
      res = {
        raw: cached.raw,
        ctype: cached.meta.type,
        status: 200,
        why: '',
        via: cached.meta.via,
        mirror: cached.meta.mirror ?? null,
      }
    } else {
      asked += 1
      if (mirrorOnly) {
        res = await fetchMirror(url, index)
      } else {
        const got = await fetchOne(url)
        if (got.raw === null) {
          /* THE HOST REFUSED. Before recording that, ask whether the
             business's own remediation already recovered this exact
             address — same address, same arithmetic, different shelf. */
          const m = await fetchMirror(url, index)
          res = m.raw !== null ? m : { ...got, why: m.why || got.why }
        } else {
          res = got
        }
      }
      if (res.raw !== null && !probeOnly) {
        storeCached(url, res.raw, {
          type: res.ctype,
          bytes: res.raw.length,
          via: res.via === 'mpf-mirror' ? 'mpf-mirror' : 'host',
          ...(res.mirror ? { mirror: res.mirror } : {}),
        })
      }
      await sleep(pauseMs)
    }

    if (res.raw === null) {
      /* WE MAY ONLY WRITE DOWN WHAT WE ASKED. A `--mirror` run asked the
         mirror and nobody else, so an address the mirror simply does
         not carry has been measured for NOTHING: it stays unmeasured,
         which is the truth. Writing "could not be reached" for a host
         we never called would be inventing a measurement. */
      if (res.why === '') continue
      if (e.file) {
        console.log(`  kept ${e.file} — ${res.why}`)
        continue
      }
      e.error = res.why
      e.verdict = 'unknown'
      e.licenceNote = licenceNoteFor(e)
      refused += 1
      changed += 1
      console.log(`  refused  ${url}\n           ${res.why}`)
      continue
    }

    if (probeOnly) {
      obtained += 1
      console.log(
        `  ok       ${url} (${res.raw.length} bytes, ${res.ctype}${res.via === 'mpf-mirror' ? ', off the mirror' : ''})`,
      )
      continue
    }

    const dest = path.join(OUT_DIR, `${stemFor(url)}.webp`)
    const enc = await encode(res.raw, dest)
    if (enc === null) {
      e.error = `${plainly(e.host)} answers with bytes we cannot read as a picture`
      e.verdict = 'unknown'
      e.licenceNote = licenceNoteFor(e)
      refused += 1
      changed += 1
      continue
    }
    delete e.error
    e.file = enc.file
    e.fetchedAt = today
    e.width = enc.width
    e.height = enc.height
    e.sha1 = sha1Hex(url)
    e.bytes = enc.bytes
    e.sha256 = enc.sha256
    e.sourceWidth = enc.sourceWidth
    e.sourceHeight = enc.sourceHeight
    e.sourceType = res.ctype
    if (res.via === 'mpf-mirror') {
      /* WHERE IT REALLY CAME FROM. `address` is still what the workbook
         typed and is still what the row holds; this says the BYTES were
         taken off the dealership's own mirror of that address, and
         names the object, so the chain is re-checkable by anyone with
         this file. */
      e.via = 'mpf-mirror'
      e.mirror = res.mirror ?? undefined
      e.mirrorKey = mirrorKey(url)
      recovered += 1
    } else {
      e.via = 'host'
      delete e.mirror
      delete e.mirrorKey
    }
    e.verdict = await verdictOf(dest)
    e.licenceNote = licenceNoteFor(e)
    obtained += 1
    changed += 1
    console.log(
      `  held     ${url}\n           ${enc.file} ${enc.width}x${enc.height} ${e.verdict}${e.via === 'mpf-mirror' ? ' (off the mirror)' : ''}`,
    )
    if (changed % 10 === 0) save()
  }

  save()

  if (!probeOnly) {
    /* Anything left over from an address that has since left the seed — and never a copy
       `pictures.json` holds for a model, which no row's address names by design. */
    const keep = new Set(entries.map((x) => x.file).filter((f): f is string => f !== undefined))
    for (const p of readPictures(DATA).pictures) if (p.tier === 'catalogue') keep.add(p.file)
    for (const f of readdirSync(OUT_DIR).filter((x) => x.endsWith('.webp') && !keep.has(x))) {
      if (prune) {
        unlinkSync(path.join(OUT_DIR, f))
        console.log(`  removed ${f} — no longer referenced`)
      } else {
        console.log(`  ${f} is named by no address (pass --prune to remove it)`)
      }
    }
  }

  const counts = countLedger(entries)
  console.log(
    `  asked ${asked} · obtained ${obtained} · refused ${refused}${recovered > 0 ? ` · ${recovered} of those off the mirror, keyed by the address's own sha1` : ''}`,
  )
  console.log(`  ledger: ${counts.held} held · ${counts.unheld} unheld · ${counts.refused} refused`)
  return 0
}

/* ---------------------------------------------------------- */
/* --accepted: the catalogue tier of pictures.json             */
/* ---------------------------------------------------------- */

/** The bytes of one address: the cache first, then the host. Never the mirror: a picture a
 *  person chose off a maker's page is that page's, and is fetched from it or not at all. */
async function bytesOf(url: string): Promise<{ raw: Buffer; type: string } | { why: string }> {
  const cached = loadCached(url)
  if (cached) return { raw: cached.raw, type: cached.meta.type }
  const got = await fetchOne(url)
  if (got.raw === null) return { why: got.why }
  storeCached(url, got.raw, { type: got.ctype, bytes: got.raw.length, via: 'host' })
  await sleep(pauseMs)
  return { raw: got.raw, type: got.ctype }
}

/**
 * THE RULINGS ON ROWS' OWN ADDRESSES that the judges wrote as findings rather than as a
 * numbered verdict, each with where it is written down. The address is read off the row
 * itself, so a ruling can never be about a picture the row does not carry.
 */
const RULINGS: {
  table: string
  /** the rows, by the file's model name; [] with `everyRow` for an address refused everywhere */
  models: string[]
  everyRow?: true
  /** for `everyRow`: the address, by a fragment of it */
  address?: RegExp
  /** for a ruling by model: only the rows whose own address's FILE NAME matches — the KAM rows
   *  carrying the AL render, not a KAM row carrying its own */
  only?: RegExp
  /** false where no person made the ruling (Claude looked, or the file name says it) */
  person?: false
  decision: 'refuse' | 'note'
  rule: string
  shows: string
  differs?: string[]
  verification: string
  source: string
}[] = [
  {
    table: 'boat_stacer',
    models: ['Stacer - 509 Assault Pro (Tournament)'],
    decision: 'refuse',
    rule: 'not that exact model (a sister model)',
    shows: 'a 529 Assault lifestyle photograph',
    verification: 'verified by eye, contact sheet, 2026-09-23',
    source: 'docs/research/imagery/proposals/stacer.verdicts.json, findings',
  },
  {
    table: 'boat_stacer',
    models: ['Stacer - 529 Assault Pro (Tournament)'],
    decision: 'note',
    rule: 'shows an outboard the file does not sell',
    shows:
      'the Stacer 529 Assault Pro (Tournament) under way, with an Evinrude outboard (the cowl reads EVINRUDE)',
    differs: [
      'an Evinrude outboard: the file sells Yamaha and ePropulsion, so a quote captions it "photographed with a different outboard"',
    ],
    verification: 'looked at by Claude (imagery audit), 2026-10-20, at 1024×676',
    person: false,
    source: 'docs/research/proposal/quote-spec.md §1 A; docs/research/imagery/gaps.md',
  },
  {
    table: 'boat_highfield',
    models: ['RU280KAM', 'RU320KAM'],
    only: /RU\d+AL/,
    decision: 'refuse',
    rule: 'not that exact model (a sister floor: the AL render on a KAM row)',
    shows: 'the RU280AL or RU320AL render, with aluminium floor panels',
    verification: 'verified by eye, contact sheet, 2026-09-23',
    source: 'docs/research/imagery/proposals/highfield-tenders.verdicts.json, findings',
  },
  {
    table: 'trl_redco',
    models: ['TINKA Aluminium - TA600-MOB'],
    decision: 'refuse',
    rule: 'not that exact model (a sister model)',
    shows: 'a TINKA TA500 (ta500-mob-02.jpg)',
    verification: 'verified by eye, contact sheet, 2026-09-23',
    source: 'docs/research/imagery/proposals/motors-trailers.verdicts.json, findings',
  },
  {
    table: '',
    models: [],
    everyRow: true,
    address: /Mackay-Trailers-Logo\.png$/,
    decision: 'refuse',
    rule: 'a logo, not the item',
    shows: 'the Mackay Trailers logo',
    verification: 'verified by eye, contact sheet, 2026-09-23',
    source: 'docs/research/imagery/proposals/motors-trailers.verdicts.json, findings',
  },
  {
    table: '',
    models: [],
    everyRow: true,
    address: /redco-tinka-logos-01\.png$/,
    decision: 'refuse',
    rule: 'a logo, not the item',
    shows:
      'the REDCO and TINKA logos side by side, which the pixel judge filed as "scene"; it is not a trailer',
    verification: 'looked at by Claude (imagery audit), 2026-10-20',
    person: false,
    source: 'docs/research/proposal/quote-spec.md §1 B and §5; docs/research/imagery/gaps.md',
  },
  /* THE GATE ROUND (2026-10-20), walking the picker brand by brand, found the price file giving
     one picture to several models that no contact sheet had shown a person. Two are named for
     another model by their own file name; two are the same maker's render a person already
     refused on a sister configuration. Each is refused here by the same rule a person applied,
     marked as no person's ruling, for the owner to confirm or overturn. */
  {
    table: 'boat_stacer',
    models: [
      'Stacer - 609 Ocean Ranger Cen Cab (H/Top)',
      'Stacer - 659 Ocean Ranger Cen Cab (H/Top)',
      'Stacer - 709 Ocean Ranger Cen Cab (H/Top)',
      'Stacer - 759 Ocean Ranger Cen Cab (H/Top)',
    ],
    only: /^589%20Ocean%20Ranger/,
    person: false,
    decision: 'refuse',
    rule: 'not that exact model (a sister model)',
    shows:
      'a Stacer 589 Ocean Ranger Centre Cab photograph: its file name names the 589, and the file gives it to four longer hulls as well',
    verification:
      'automatic: the file name names the 589; seen on the picker by Claude (gate round), 2026-10-20',
    source: 'tools/seed/fetch-images.ts RULINGS (gate round, 2026-10-20)',
  },
  {
    table: 'boat_stacer',
    models: ['Stacer - 399S Proline L/S'],
    only: /^359-proline/,
    person: false,
    decision: 'refuse',
    rule: 'not that exact model (a sister model)',
    shows: 'the Stacer 359 Proline: its file name names the 359, and the row is the 399S',
    verification:
      'automatic: the file name names the 359; seen on the picker by Claude (gate round), 2026-10-20',
    source: 'tools/seed/fetch-images.ts RULINGS (gate round, 2026-10-20)',
  },
  {
    table: 'boat_highfield',
    models: ['CL340', 'CL340LS', 'CL340FT'],
    only: /^CL340ST/,
    person: false,
    decision: 'refuse',
    rule: 'not that exact model (a different configuration: steering console, not tiller)',
    shows:
      'Highfield Classic 340 ST (steering console), by its file name: the same maker’s ST render a person refused on every CL310 row (highfield-tenders.verdicts.json#1–3)',
    verification:
      'automatic: the person’s CL310 ST ruling, applied to the CL340 ST render; seen on the picker by Claude (gate round), 2026-10-20',
    source: 'tools/seed/fetch-images.ts RULINGS (gate round, 2026-10-20)',
  },
  {
    table: 'boat_highfield',
    models: ['PA660EW', 'PA660ST', 'PA760EW', 'PA760ST', 'PA860EW', 'PA860ST'],
    only: /^PA\d60SB/,
    person: false,
    decision: 'refuse',
    rule: 'not that exact model',
    shows:
      'Highfield’s Patrol "SB" render, which is none of the file’s own names and is given to both the EW and the ST: the ruling a person made on the PA600SB and PA700SB renders (highfield-ribs.verdicts.json#2–6)',
    verification:
      'automatic: the person’s PA600SB ruling, applied to the same maker’s PA660SB, PA760SB and PA860SB renders; seen on the picker by Claude (gate round), 2026-10-20',
    source: 'tools/seed/fetch-images.ts RULINGS (gate round, 2026-10-20)',
  },
  /* The price file gives the F150's studio picture to four F200 rows as well, so an F200
     quote's cover and build stage drew F150s. The F150 rows keep it. */
  {
    table: 'mot_yamaha',
    models: ['Yamaha - F200XC', 'Yamaha - F200LD', 'Yamaha - F200XD', 'Yamaha - LF200XD'],
    only: /yamaha-f150-profile/,
    person: false,
    decision: 'refuse',
    rule: 'not that exact model (a sister model)',
    shows:
      'Yamaha’s F150 studio picture: its file name names the F150, and the file gives it to four F200 rows as well',
    verification:
      'looked at by Claude, 2026-10-31: the held copy (yamaha-f150-profile-800-x-600px-grey-9d6ec17d.webp) shows three grey outboards whose cowls read "150"',
    source: 'tools/seed/fetch-images.ts RULINGS (2026-10-31)',
  },
  /* THE PRINTED QUOTE'S CRITIC (2026-10-31, blocker 1): a repower's cover printed Yamaha's studio
     shot of a white F115 beside a grey one for one grey F115LB, and the F150's is a triple rig.
     Each picture below shows more outboards than a line sells; it is drawn, and a cover captions
     the count (`pictured` in src/screens/document/art.ts reads the leading count word). */
  ...(
    [
      [/f115-grey--white-800-x-600.ashx$/, 'two', 'a white F115 beside a grey one'],
      [
        /yamaha-f150-profile-800-x-600px-grey.ashx$/,
        'three',
        'three grey F150s rigged side by side',
      ],
      [/yamaha-f175-profile-800-x-600px-grey.ashx$/, 'two', 'two grey F175s side by side'],
      [
        /yamaha-f200-profile-800-x-600px-grey.ashx$/,
        'three',
        'three grey F200s rigged side by side',
      ],
      [/f250xsb2-f250xsb-product-profile-800x600.ashx$/, 'two', 'a white F250 beside a grey one'],
      [/f300xsb2-f300xsb-product-profile-800x600.ashx$/, 'two', 'a white F300 beside a grey one'],
      [
        /f300xsa2-f300xsa-product-profile-800x600.ashx$/,
        'two',
        'a white XSA outboard beside a grey one',
      ],
      [/yamaha-f50c-white-product-colour-800-x-600.ashx$/, 'two', 'a white F50 beside a grey one'],
      [/yamaha-f70b-white-product-colour-800-x-600.ashx$/, 'two', 'a white F70 beside a grey one'],
      [/f90-product-colour-800-x-600-new.ashx$/, 'two', 'a white F90 beside a grey one'],
    ] as const
  ).map(([address, count, shows]) => ({
    table: '',
    models: [],
    everyRow: true as const,
    address,
    person: false as const,
    decision: 'note' as const,
    rule: 'shows more outboards than one',
    shows: `Yamaha's studio picture: ${shows}`,
    differs: [`${count} outboards in one picture: a cover says so under it`],
    verification:
      'looked at by Claude (the printed quote round), 2026-10-31, at 800×600 on a contact sheet',
    source: 'docs/directions/paper-quote/critique.md, blocker 1',
  })),
]

/** An address whose own file name says it is a logo: refused for every row, by the machine. */
const LOGO_NAME = /logo|Quote%20Sheet%20Logos/i

function findingsOf(
  index: FleetIndex,
  verdicts: Judged[],
  pictures: PictureEntry[],
): PictureFinding[] {
  const out: PictureFinding[] = []
  const rowsCarrying = (table: string, url: string): string[] =>
    (index.rowsByEntity[table] ?? [])
      .map((r) => r.id)
      .filter((id) => index.addressOf(table, id) === url)

  /* 1. a numbered rejection of a row's own address: refused for the rows of that model */
  for (const j of verdicts.filter((v) => v.decision === 'reject' && v.scope === 'row-address')) {
    const rows = j.models
      .flatMap((m) => modelNamed(index, j.table, m).variants.map((v) => v.rowId))
      .filter((id) => index.addressOf(j.table, id) === j.url)
    out.push({
      address: j.url,
      table: j.table,
      rows,
      decision: 'refuse',
      rule: j.rule || 'not that exact model',
      shows: j.depicts,
      differs: [],
      verification: j.verification,
      person: true,
      source: j.ref,
    })
  }

  /* 2. a row's own address a person accepted for ONE model: every other row the price file gives
        it to is refused, unless a ruling above already says why */
  for (const p of pictures.filter((x) => x.rowAddress)) {
    const refusedAlready = new Set(out.filter((f) => f.address === p.url).flatMap((f) => f.rows))
    const others = rowsCarrying(p.table, p.url).filter(
      (id) => !p.exactRows.includes(id) && !refusedAlready.has(id),
    )
    if (others.length === 0) continue
    out.push({
      address: p.url,
      table: p.table,
      rows: others,
      decision: 'refuse',
      rule: 'not that exact model (the price file gives this picture to a model it does not show)',
      shows: p.depicts,
      differs: [],
      verification: p.verification,
      person: true,
      source: p.verdicts,
    })
  }

  /* 3. the findings the judges wrote in words */
  for (const r of RULINGS) {
    if (r.everyRow) {
      /* wherever the file carries it: the REDCO and TINKA logo sheet is NSM Custom's trailers' */
      const found = new Map<string, { table: string; address: string }>()
      for (const [table, rows] of Object.entries(index.rowsByEntity)) {
        for (const row of rows) {
          const address = index.addressOf(table, row.id)
          if (address !== '' && r.address!.test(address))
            found.set(`${table} ${address}`, { table, address })
        }
      }
      for (const { table, address } of found.values()) {
        out.push({
          address,
          table,
          rows: [],
          decision: r.decision,
          rule: r.rule,
          shows: r.shows,
          differs: r.differs ?? [],
          verification: r.verification,
          person: r.person ?? true,
          source: r.source,
        })
      }
      continue
    }
    const byAddress = new Map<string, string[]>()
    for (const name of r.models) {
      for (const v of modelNamed(index, r.table, name).variants) {
        const address = index.addressOf(r.table, v.rowId)
        if (address === '') continue
        /* a KAM row whose own address is its own KAM render is not what the ruling is about */
        if (r.only && !r.only.test(address.split('/').at(-1)!)) continue
        byAddress.set(address, [...(byAddress.get(address) ?? []), v.rowId])
      }
    }
    for (const [address, rows] of byAddress) {
      out.push({
        address,
        table: r.table,
        rows,
        decision: r.decision,
        rule: r.rule,
        shows: r.shows,
        differs: r.differs ?? [],
        verification: r.verification,
        person: r.person ?? true,
        source: r.source,
      })
    }
  }

  /* 4. the machine's one ruling: a file named a logo is not a picture of the item */
  const ruled = new Set(out.filter((f) => f.rows.length === 0).map((f) => f.address))
  for (const [table, rows] of Object.entries(index.rowsByEntity)) {
    const addresses = new Set(rows.map((r) => index.addressOf(table, r.id)))
    for (const address of addresses) {
      if (address === '' || ruled.has(address) || !LOGO_NAME.test(address)) continue
      ruled.add(address)
      out.push({
        address,
        table,
        rows: [],
        decision: 'refuse',
        rule: 'a logo, not the item',
        shows: 'a file its own name calls a logo',
        differs: [],
        verification: 'automatic: the file name says logo; not looked at',
        person: false,
        source: 'tools/seed/fetch-images.ts --accepted (LOGO_NAME)',
      })
    }
  }
  return out
}

async function holdAccepted(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10)
  const index = await fleetIndex()
  const spokenSaid = await spokenNamer()
  const verdicts = readVerdicts()
  const doc = readPictures(DATA)
  const byId = new Map(doc.pictures.map((p) => [p.id, p]))
  let fetched = 0
  let kept = 0
  let bytes = 0

  for (const j of verdicts.filter((v) => v.decision === 'accept' && v.kind === 'catalogue')) {
    if (j.licence !== '') {
      console.log(`  barred   ${j.ref} — ${j.licence.split('.')[0]}`)
      continue
    }
    const models = j.models.map((m) => modelNamed(index, j.table, m))
    /* a part's name can recur in another fit register, so its id says its register */
    const id = `${index.fit.has(j.table) ? `${slug(j.table)}-` : ''}${slug(saidOf(j.table, j.models[0]!))}-catalogue`
    const dest = path.join(OUT_DIR, `${stemFor(j.url)}.webp`)
    const had = byId.get(id)
    const rowAddress = j.scope === 'row-address'
    /* THE VERDICT'S WORDS are written on every run; the bytes only when they are not held */
    const words = {
      /* the model as every screen says it ("Highfield Classic 420"), not the file's code */
      subject: spokenSaid(j.table, j.models[0]!, saidOf(j.table, j.models[0]!)),
      models: models.map((m) => m.name),
      rows: Object.fromEntries(models.map((m) => [m.name, m.variants.map((v) => v.rowId)])),
      exactRows: exactRowsOf(index, j, models),
      rowAddress,
      depicts: j.depicts,
      differs: j.differs,
      pageUrl: rowAddress ? '' : j.pageUrl,
      verification: j.verification,
      verifiedBy: verifiedByOf(j),
      verdicts: j.ref,
    }
    if (had && had.url === j.url && existsSync(dest) && !refetch) {
      byId.set(id, { ...had, ...words })
      kept += 1
      continue
    }
    const got = await bytesOf(j.url)
    if ('why' in got) {
      console.log(`  refused  ${j.ref} — ${got.why}`)
      continue
    }
    const enc = await encode(got.raw, dest)
    if (enc === null) {
      console.log(`  unreadable ${j.ref}`)
      continue
    }
    const verdict = await verdictOf(dest)
    const entry: PictureEntry = {
      ...words,
      id,
      tier: 'catalogue',
      table: j.table,
      scope: 'model',
      verdict: verdict === 'scene' ? 'scene' : 'studio',
      url: j.url,
      host: hostOf(j.url),
      licenceNote: rowAddress
        ? licenceNoteFor({ host: hostOf(j.url), file: enc.file })
        : j.licenceNote || licenceNoteFor({ host: hostOf(j.url), file: enc.file }),
      fetchedAt: today,
      sourceWidth: enc.sourceWidth,
      sourceHeight: enc.sourceHeight,
      file: enc.file,
      width: enc.width,
      height: enc.height,
      bytes: enc.bytes,
      sha256: enc.sha256,
      person: true,
    }
    byId.set(id, entry)
    fetched += 1
    bytes += enc.bytes
    console.log(
      `  held     ${id}  ${enc.sourceWidth}x${enc.sourceHeight} -> ${enc.width}x${enc.height}  ${(enc.bytes / 1024) | 0} kB  exact ${words.exactRows.length}`,
    )
  }

  doc.pictures = [...byId.values()]
  doc.findings = findingsOf(index, verdicts, doc.pictures)
  writePictures(DATA, doc, today)
  /* IMAGES.md says what both ledgers hold; images.json itself is not touched by this mode */
  const manifest = JSON.parse(
    readFileSync(path.join(DATA, 'manifest.json'), 'utf8'),
  ) as PackManifest
  mkdirSync(DOCS, { recursive: true })
  writeFileSync(
    path.join(DOCS, 'IMAGES.md'),
    imagesDoc(manifest, readLedger(DATA), modelsOnDisk(DATA)),
    'utf8',
  )
  const catalogue = doc.pictures.filter((p) => p.tier === 'catalogue')
  console.log(
    `  ${fetched} written now (${(bytes / 1024 / 1024).toFixed(2)} MB), ${kept} already held; the catalogue tier holds ${catalogue.length} pictures, ${(catalogue.reduce((n, p) => n + p.bytes, 0) / 1024 / 1024).toFixed(2)} MB; ${doc.findings.length} findings`,
  )
  return 0
}

process.exitCode = flag('accepted') ? await holdAccepted() : await main()
