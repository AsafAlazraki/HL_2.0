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
import { imagesDoc } from './docs'
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
    writeFileSync(path.join(DOCS, 'IMAGES.md'), imagesDoc(manifest, doc), 'utf8')
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
    /* Anything left over from an address that has since left the seed. */
    const keep = new Set(entries.map((x) => x.file).filter((f): f is string => f !== undefined))
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

process.exitCode = await main()
