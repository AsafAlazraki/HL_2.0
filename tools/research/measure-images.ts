/**
 * Measure every imagery candidate address, then merge the group files into one ledger.
 *
 *   npx tsx tools/research/measure-images.ts [flags]
 *
 * The five group files under `docs/research/imagery/` are written by hand, one per sweep
 * (highfield, stacer, stabicraft-surtees, jeanneau-haines-formosa, motors-trailers-marks).
 * This tool is the arithmetic on top of them: it requests every address that carries no
 * measurement yet, fills `status`, `contentType`, `bytes`, `width` and `height` from what
 * the request actually returned, marks `refused: true` where a host walled it off or never
 * answered, marks `tooSmall: true` where a hero, gallery or render frame is under 800 px on
 * its long edge, and writes the merged, de-duplicated `candidates.json` plus `README.md`
 * with the counts. A 429 is treated as this sweep's fault, not the address's: see
 * `applyMeasurement`.
 *
 * Nothing is downloaded into `public/`: a request reads the first 512 KB, which is enough
 * for the header a pixel size lives in, and the byte size comes from the Content-Range the
 * server answers with. A later packer step is what fetches whole files.
 *
 * Flags:
 *   --recheck=none|missing|refused|all   re-request addresses that already carry a
 *                                        measurement (default `none`: only the unmeasured).
 *                                        `missing` = measured but with no pixel size.
 *   --sample=N          re-request N already-measured addresses chosen at random and report
 *                       whether this run agrees with what the group file says.
 *   --only=<group>[,…]  restrict to named group files.
 *   --limit=N           stop after N requests.
 *   --concurrency=N     requests in flight across all hosts (default 5).
 *   --per-host=N        requests in flight against one host (default 2).
 *   --gap=MS            wait between two requests in the same lane (default 250).
 *   --timeout=MS        per request (default 20000).
 *   --merge-only        request nothing; just merge and write.
 *
 * A record this tool measured carries `measuredAt`. A record without one was measured by
 * the sweep that wrote its group file, and the README says so rather than claiming the date.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import sharp from 'sharp'

const ROOT = fileURLToPath(new URL('../../', import.meta.url))
const DIR = join(ROOT, 'docs', 'research', 'imagery')

const GROUPS = [
  'highfield',
  'stacer',
  'stabicraft-surtees',
  'jeanneau-haines-formosa',
  'motors-trailers-marks',
] as const

const KINDS = ['hero', 'gallery', 'render', 'plan', 'mark'] as const
type Kind = (typeof KINDS)[number]

/** A picture only counts as big enough where it has to fill a surface. */
const SIZED_KINDS = new Set<Kind>(['hero', 'gallery', 'render'])
const MIN_LONG_EDGE = 800

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
const RANGE_BYTES = 512 * 1024

interface Attachment {
  group: string
  series?: string | null
  model?: string | null
  variant?: string
  pageUrl?: string
}

interface Candidate {
  brand: string
  series?: string | null
  model?: string | null
  variant?: string
  seedModels?: string[]
  kind: Kind
  url: string
  pageUrl: string
  host: string
  status?: number
  contentType?: string
  bytes?: number
  width?: number
  height?: number
  refused?: boolean
  refusedReason?: string
  tooSmall?: boolean
  measuredAt?: string
  licenceNote: string
  note?: string
  group?: string
  alsoAttachedTo?: Attachment[]
}

const KNOWN_KEYS = new Set<string>([
  'brand',
  'series',
  'model',
  'variant',
  'seedModels',
  'kind',
  'url',
  'pageUrl',
  'host',
  'status',
  'contentType',
  'bytes',
  'width',
  'height',
  'refused',
  'refusedReason',
  'tooSmall',
  'measuredAt',
  'licenceNote',
  'note',
  'group',
  'alsoAttachedTo',
])

interface Measurement {
  status?: number
  contentType?: string
  bytes?: number
  width?: number
  height?: number
  refused?: boolean
  refusedReason?: string
}

interface Options {
  recheck: 'none' | 'missing' | 'refused' | 'all'
  sample: number
  only: string[]
  limit: number
  concurrency: number
  perHost: number
  gap: number
  timeout: number
  mergeOnly: boolean
}

function parseArgs(argv: string[]): Options {
  const opts: Options = {
    recheck: 'none',
    sample: 0,
    only: [...GROUPS],
    limit: Number.POSITIVE_INFINITY,
    concurrency: 5,
    perHost: 2,
    gap: 250,
    timeout: 20_000,
    mergeOnly: false,
  }
  for (const arg of argv) {
    const [flag, value = ''] = arg.split('=', 2)
    switch (flag) {
      case '--recheck': {
        if (value !== 'none' && value !== 'missing' && value !== 'refused' && value !== 'all') {
          throw new Error(`--recheck takes none|missing|refused|all, not "${value}"`)
        }
        opts.recheck = value
        break
      }
      case '--sample':
        opts.sample = Number(value)
        break
      case '--only':
        opts.only = value.split(',').filter(Boolean)
        break
      case '--limit':
        opts.limit = Number(value)
        break
      case '--concurrency':
        opts.concurrency = Number(value)
        break
      case '--per-host':
        opts.perHost = Number(value)
        break
      case '--gap':
        opts.gap = Number(value)
        break
      case '--timeout':
        opts.timeout = Number(value)
        break
      case '--merge-only':
        opts.mergeOnly = true
        break
      default:
        throw new Error(`unknown flag: ${arg}`)
    }
  }
  for (const group of opts.only) {
    if (!(GROUPS as readonly string[]).includes(group)) throw new Error(`unknown group: ${group}`)
  }
  return opts
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function readGroup(group: string): Promise<Candidate[]> {
  const raw = await readFile(join(DIR, `${group}.json`), 'utf8')
  const parsed: unknown = JSON.parse(raw)
  if (!Array.isArray(parsed)) throw new Error(`${group}.json is not an array`)
  for (const record of parsed as Candidate[]) {
    for (const field of Object.keys(record)) {
      if (!KNOWN_KEYS.has(field)) {
        console.warn(`  ! ${group}.json carries an unknown field "${field}" on ${record.url}`)
        KNOWN_KEYS.add(field)
      }
    }
    if (!(KINDS as readonly string[]).includes(record.kind)) {
      throw new Error(
        `${group}.json: kind "${record.kind}" on ${record.url} is not one of the five`,
      )
    }
  }
  return parsed as Candidate[]
}

/** An address needs a request when nothing about the response has been written down yet. */
function needsMeasuring(record: Candidate, recheck: Options['recheck']): boolean {
  if (recheck === 'all') return true
  if (record.status === undefined && !record.refused) return true
  if (recheck === 'refused' && record.refused === true) return true
  if (recheck === 'missing') {
    const served = record.status !== undefined && record.status >= 200 && record.status < 300
    if (served && record.width === undefined) return true
  }
  return false
}

function contentTypeOf(res: Response): string | undefined {
  const raw = res.headers.get('content-type')
  return raw ? raw.split(';')[0].trim().toLowerCase() : undefined
}

function byteSize(res: Response, bodyLength: number): number | undefined {
  const range = res.headers.get('content-range')
  const total = range ? /\/(\d+)\s*$/.exec(range) : null
  if (total) return Number(total[1])
  if (res.status === 206) return undefined // partial content with no Content-Range: unknown
  const length = res.headers.get('content-length')
  if (length && Number.isFinite(Number(length))) return Number(length)
  return bodyLength
}

async function request(
  url: string,
  referer: string,
  range: boolean,
  timeout: number,
): Promise<{ res: Response; body: Buffer }> {
  const headers: Record<string, string> = {
    'user-agent': USER_AGENT,
    accept: 'image/avif,image/webp,image/apng,image/svg+xml,application/pdf,image/*,*/*;q=0.8',
    'accept-language': 'en-AU,en;q=0.9',
  }
  if (referer) headers.referer = referer
  if (range) headers.range = `bytes=0-${RANGE_BYTES - 1}`
  const res = await fetch(url, {
    headers,
    redirect: 'follow',
    signal: AbortSignal.timeout(timeout),
  })
  const body = Buffer.from(await res.arrayBuffer())
  return { res, body }
}

/** Pixel size as the file itself declares it, with EXIF rotation applied. */
async function dimensions(body: Buffer): Promise<{ width: number; height: number } | undefined> {
  const meta = await sharp(body, { failOn: 'none' }).metadata()
  if (!meta.width || !meta.height) return undefined
  const turned = typeof meta.orientation === 'number' && meta.orientation >= 5
  return turned
    ? { width: meta.height, height: meta.width }
    : { width: meta.width, height: meta.height }
}

const UNMEASURABLE = new Set(['application/pdf', 'text/html', 'application/json', 'text/plain'])

async function measure(url: string, referer: string, timeout: number): Promise<Measurement> {
  const out: Measurement = {}
  let body: Buffer
  let res: Response
  try {
    const first = await request(url, referer, true, timeout)
    res = first.res
    body = first.body
  } catch (error) {
    const reason = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
    return {
      refused: true,
      refusedReason: reason.includes('Timeout') ? `no answer within ${timeout} ms` : reason,
    }
  }
  out.status = res.status
  if (res.status === 403 || res.status === 429 || res.status === 451) {
    // The body of a refusal is the host's block page, not the picture. Recording its type
    // or its size on this record would describe the wall as though it were the file.
    out.refused = true
    out.refusedReason = `HTTP ${res.status} from ${new URL(url).host}`
    return out
  }
  out.contentType = contentTypeOf(res)
  if (res.status < 200 || res.status >= 300) return out
  const bytes = byteSize(res, body.byteLength)
  if (bytes !== undefined) out.bytes = bytes
  if (out.contentType && UNMEASURABLE.has(out.contentType)) return out
  try {
    const size = await dimensions(body)
    if (size) {
      out.width = size.width
      out.height = size.height
      return out
    }
  } catch {
    // the header may have fallen outside the first 512 KB; ask for the whole file once
  }
  if (res.status === 206) {
    try {
      const whole = await request(url, referer, false, timeout)
      if (whole.res.ok) {
        const size = await dimensions(whole.body)
        if (size) {
          out.width = size.width
          out.height = size.height
        }
        const wholeBytes = byteSize(whole.res, whole.body.byteLength)
        if (wholeBytes !== undefined) out.bytes = wholeBytes
      }
    } catch {
      // leave the pixel size absent rather than guess it
    }
  }
  return out
}

interface Task {
  record: Candidate
  group: string
}

interface Disagreement {
  url: string
  field: string
  was: unknown
  now: unknown
}

async function runTasks(
  tasks: Task[],
  opts: Options,
  onDone: (task: Task, measured: Measurement) => void,
): Promise<void> {
  const byHost = new Map<string, Task[]>()
  for (const task of tasks) {
    const list = byHost.get(task.record.host)
    if (list) list.push(task)
    else byHost.set(task.record.host, [task])
  }
  const lanes: Task[][] = []
  for (const list of byHost.values()) {
    const count = Math.max(1, Math.min(opts.perHost, list.length))
    const hostLanes: Task[][] = Array.from({ length: count }, () => [])
    list.forEach((task, index) => hostLanes[index % count].push(task))
    lanes.push(...hostLanes)
  }
  let nextLane = 0
  let done = 0
  let skipped = 0
  // A host that starts answering 429 is telling this sweep to slow down. Keeping on at it
  // would write "refused" across everything it has left; the lane waits, then gives up on
  // that host and says so, leaving those addresses as they were.
  const throttled = new Map<string, number>()
  const stopped = new Set<string>()
  const workers = Array.from(
    { length: Math.max(1, Math.min(opts.concurrency, lanes.length)) },
    async () => {
      while (nextLane < lanes.length) {
        const lane = lanes[nextLane++]
        for (const task of lane) {
          const host = task.record.host
          if (stopped.has(host)) {
            skipped += 1
            continue
          }
          const measured = await measure(task.record.url, task.record.pageUrl, opts.timeout)
          if (measured.status === 429) {
            const count = (throttled.get(host) ?? 0) + 1
            throttled.set(host, count)
            if (count >= 3) {
              stopped.add(host)
              console.warn(`  ! ${host} is answering 429; leaving the rest of its addresses alone`)
            } else {
              await sleep(Math.max(5000, opts.gap * 10))
            }
          }
          onDone(task, measured)
          done += 1
          if (done % 25 === 0) console.log(`  … ${done}/${tasks.length} requested`)
          await sleep(opts.gap)
        }
      }
    },
  )
  await Promise.all(workers)
  if (skipped > 0) {
    console.warn(`  ! ${skipped} addresses were not requested: their host was answering 429`)
  }
}

/**
 * Fill what was measured; never delete a value a request did not replace.
 *
 * 206 and 200 are the same fact about an address — the file is served. 206 is only what a
 * Range request gets back, so a 206 measured here never overwrites a 200 an earlier sweep
 * wrote down by asking for the whole file, and the pair is not reported as a disagreement.
 *
 * 429 is a fact about this sweep, not about the address: it means the host decided we were
 * asking too fast. Measured on 2026-09-17, a full re-run turned 165 Formosa addresses that
 * had answered 200 minutes earlier into 429s, and every one of them served again when asked
 * slowly. So a 429 never overwrites a status already written down; `--gap` is the answer.
 */
function applyMeasurement(record: Candidate, measured: Measurement, today: string): Disagreement[] {
  const disagreements: Disagreement[] = []
  if (measured.status === 429 && record.status !== undefined) return disagreements
  const fields = ['status', 'contentType', 'bytes', 'width', 'height'] as const
  for (const field of fields) {
    const now = measured[field]
    if (now === undefined) continue
    const was = record[field]
    if (field === 'status' && was === 200 && now === 206) continue
    if (was !== undefined && was !== now) disagreements.push({ url: record.url, field, was, now })
    // TypeScript cannot narrow a union write through a loop variable; the pairs line up.
    ;(record as unknown as Record<string, unknown>)[field] = now
  }
  if (measured.refused) {
    record.refused = true
    if (measured.refusedReason) record.refusedReason = measured.refusedReason
  } else if (record.refused && measured.status !== undefined) {
    // the wall came down: say so rather than leave the old flag standing
    delete record.refused
    delete record.refusedReason
  }
  record.measuredAt = today
  return disagreements
}

function flagTooSmall(record: Candidate): void {
  if (!SIZED_KINDS.has(record.kind) || record.width === undefined || record.height === undefined) {
    delete record.tooSmall
    return
  }
  if (Math.max(record.width, record.height) < MIN_LONG_EDGE) record.tooSmall = true
  else delete record.tooSmall
}

function key(value: string | null | undefined): string {
  return value ?? ''
}

const collate = (x: string, y: string) =>
  x.localeCompare(y, 'en', { numeric: true, sensitivity: 'base' })

function compare(a: Candidate, b: Candidate): number {
  return (
    collate(a.brand, b.brand) ||
    collate(key(a.series), key(b.series)) ||
    collate(key(a.model), key(b.model)) ||
    collate(key(a.variant), key(b.variant)) ||
    KINDS.indexOf(a.kind) - KINDS.indexOf(b.kind) ||
    collate(a.url, b.url)
  )
}

const ORDER = [
  'brand',
  'series',
  'model',
  'variant',
  'seedModels',
  'kind',
  'url',
  'pageUrl',
  'host',
  'status',
  'contentType',
  'bytes',
  'width',
  'height',
  'refused',
  'refusedReason',
  'tooSmall',
  'measuredAt',
  'licenceNote',
  'note',
  'group',
  'alsoAttachedTo',
]

/**
 * JSON in the shape Prettier writes it — two spaces, and a short array of plain values kept
 * on one line. The group files are written by hand and read by eye; a re-serialisation that
 * reflows every `seedModels` array would bury the one field this run actually changed.
 */
function stringify(value: unknown, indent = ''): string {
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const plain = value.every((item) => item === null || typeof item !== 'object')
    if (plain) {
      const line = `[${value.map((item) => JSON.stringify(item) ?? 'null').join(', ')}]`
      if (line.length + indent.length <= 100) return line
    }
    const inner = `${indent}  `
    return `[\n${value.map((item) => inner + stringify(item, inner)).join(',\n')}\n${indent}]`
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([, item]) => item !== undefined,
    )
    if (entries.length === 0) return '{}'
    const inner = `${indent}  `
    const body = entries
      .map(([field, item]) => `${inner}${JSON.stringify(field)}: ${stringify(item, inner)}`)
      .join(',\n')
    return `{\n${body}\n${indent}}`
  }
  return JSON.stringify(value) ?? 'null'
}

function ordered(record: Candidate): Candidate {
  const source = record as unknown as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const field of ORDER) if (field in source) out[field] = source[field]
  for (const field of Object.keys(source)) if (!(field in out)) out[field] = source[field]
  return out as unknown as Candidate
}

function sameAttachment(record: Candidate, other: Candidate): boolean {
  return (
    key(record.series) === key(other.series) &&
    key(record.model) === key(other.model) &&
    key(record.variant) === key(other.variant)
  )
}

/**
 * One address, one record. Where the same address is honestly attached to more than one
 * model — a Merry Fisher interior the builder publishes on both the Coupe and the Flybridge
 * page, a trailer package render two sweeps both found — the second attachment is kept in
 * `alsoAttachedTo` rather than dropped, because dropping it would lose a model's picture.
 */
function mergeByUrl(all: { record: Candidate; group: string }[]): Candidate[] {
  const byUrl = new Map<string, Candidate>()
  for (const { record, group } of all) {
    const held = byUrl.get(record.url)
    const copy: Candidate = { ...record, group }
    if (!held) {
      byUrl.set(record.url, copy)
      continue
    }
    if (sameAttachment(held, record)) {
      if (held.note === undefined && record.note !== undefined) held.note = record.note
      if (held.width === undefined && record.width !== undefined) {
        held.width = record.width
        held.height = record.height
      }
      continue
    }
    const also = held.alsoAttachedTo ?? []
    const already = also.some(
      (a) =>
        key(a.series) === key(record.series) &&
        key(a.model) === key(record.model) &&
        key(a.variant) === key(record.variant),
    )
    if (!already) {
      const attachment: Attachment = {
        group,
        series: record.series ?? null,
        model: record.model ?? null,
      }
      if (record.variant !== undefined) attachment.variant = record.variant
      if (record.pageUrl !== held.pageUrl) attachment.pageUrl = record.pageUrl
      also.push(attachment)
      held.alsoAttachedTo = also
    }
  }
  return [...byUrl.values()].toSorted(compare)
}

interface Counts {
  records: number
  hero: number
  gallery: number
  render: number
  plan: number
  mark: number
  served: number
  refused: number
  notFound: number
  tooSmall: number
  noSize: number
}

function empty(): Counts {
  return {
    records: 0,
    hero: 0,
    gallery: 0,
    render: 0,
    plan: 0,
    mark: 0,
    served: 0,
    refused: 0,
    notFound: 0,
    tooSmall: 0,
    noSize: 0,
  }
}

function tally(into: Counts, record: Candidate): void {
  into.records += 1
  into[record.kind] += 1
  const status = record.status ?? 0
  if (status >= 200 && status < 300) into.served += 1
  if (record.refused) into.refused += 1
  if (status === 404 || status === 410) into.notFound += 1
  if (record.tooSmall) into.tooSmall += 1
  if (record.width === undefined) into.noSize += 1
}

function row(name: string, c: Counts): string {
  return `| ${name} | ${c.records} | ${c.hero} | ${c.gallery} | ${c.render} | ${c.plan} | ${c.mark} | ${c.served} | ${c.refused} | ${c.notFound} | ${c.tooSmall} |`
}

function readme(
  merged: Candidate[],
  groups: Map<string, Candidate[]>,
  requested: number,
  today: string,
  disagreements: Disagreement[],
): string {
  const byBrand = new Map<string, Counts>()
  const byKind = new Map<Kind, Counts>()
  const byHost = new Map<string, Counts>()
  for (const record of merged) {
    const brand = byBrand.get(record.brand) ?? empty()
    tally(brand, record)
    byBrand.set(record.brand, brand)
    const kind = byKind.get(record.kind) ?? empty()
    tally(kind, record)
    byKind.set(record.kind, kind)
    const host = byHost.get(record.host) ?? empty()
    tally(host, record)
    byHost.set(record.host, host)
  }
  const total = empty()
  for (const record of merged) tally(total, record)

  const brands = [...byBrand.entries()].toSorted((a, b) => b[1].records - a[1].records)
  const hosts = [...byHost.entries()].toSorted((a, b) => b[1].records - a[1].records)
  const refusedHosts = hosts.filter(([, c]) => c.refused > 0)
  const notFound = merged.filter((r) => (r.status ?? 0) === 404 || (r.status ?? 0) === 410)
  const pdfs = merged.filter((r) => r.contentType === 'application/pdf')
  const measuredHere = merged.filter((r) => r.measuredAt !== undefined).length
  const refusedWithSize = merged.filter((r) => r.refused && r.width !== undefined).length
  const multi = merged.filter((r) => r.alsoAttachedTo && r.alsoAttachedTo.length > 0)
  // An address whose filename says one format and whose server answers another: the host
  // transcodes for a browser. The packer has to name what it saved, not what it asked for.
  const transcoded = merged.filter((record) => {
    if (!record.contentType?.startsWith('image/')) return false
    const extension = /\.([a-z\d]+)$/i.exec(new URL(record.url).pathname)?.[1]?.toLowerCase()
    if (!extension) return false
    const served = record.contentType.slice('image/'.length)
    if (extension === served) return false
    if (extension === 'jpg' && served === 'jpeg') return false
    return !(extension === 'svg' && served === 'svg+xml')
  })

  const lines: string[] = []
  lines.push('# Imagery candidates — what was measured')
  lines.push('')
  lines.push(
    `\`candidates.json\` is the five group files merged into one array, de-duplicated by address and sorted by brand, series, model, then kind. **${merged.length} addresses** across **${byBrand.size} brands** and **${hosts.length} hosts**. Every number below is what an HTTP request returned, not what a page claimed. Nothing has been downloaded into \`public/\`; a later packer step does that from this list.`,
  )
  lines.push('')
  const dates = new Map<string, number>()
  for (const record of merged) {
    if (record.measuredAt) dates.set(record.measuredAt, (dates.get(record.measuredAt) ?? 0) + 1)
  }
  const dateList = [...dates.entries()]
    .toSorted((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => `${count} on ${date}`)
    .join(', ')
  lines.push(
    `Last merge: **${today}**, by \`tools/research/measure-images.ts\`; that run requested **${requested}** addresses. **${measuredHere}** of the ${merged.length} carry \`measuredAt\`, meaning this tool requested them itself (${dateList || 'none yet'}). Any record without one holds what the sweep that wrote its group file measured, on the date that file's \`.md\` states.`,
  )
  lines.push('')
  if (requested > 0) {
    const byField = new Map<string, number>()
    for (const d of disagreements) byField.set(d.field, (byField.get(d.field) ?? 0) + 1)
    const fields =
      byField.size === 0
        ? 'none'
        : [...byField.entries()].map(([field, count]) => `${field} ${count}`).join(', ')
    lines.push(
      `That run disagreed with what was already written down on **${disagreements.length}** of the ${requested} addresses (${fields}). A disagreement is reported on the console, the newly measured value is kept, and 206 answering a range request never replaces a 200 an earlier sweep wrote down: both say the file is served.`,
    )
    lines.push('')
  }
  lines.push('## Group files')
  lines.push('')
  lines.push('| group | records | notes |')
  lines.push('|---|---|---|')
  for (const [group, records] of groups) {
    lines.push(`| \`${group}.json\` | ${records.length} | \`${group}.md\` |`)
  }
  lines.push('')
  lines.push('## By brand')
  lines.push('')
  lines.push(
    '| brand | records | hero | gallery | render | plan | mark | served 2xx | refused | 404 | too small |',
  )
  lines.push('|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|')
  for (const [brand, counts] of brands) lines.push(row(brand, counts))
  lines.push(row('**all**', total))
  lines.push('')
  lines.push('## By kind')
  lines.push('')
  lines.push('| kind | records | served 2xx | refused | 404 | too small | no pixel size |')
  lines.push('|---|---:|---:|---:|---:|---:|---:|')
  for (const kind of KINDS) {
    const c = byKind.get(kind)
    if (!c) continue
    lines.push(
      `| ${kind} | ${c.records} | ${c.served} | ${c.refused} | ${c.notFound} | ${c.tooSmall} | ${c.noSize} |`,
    )
  }
  lines.push('')
  lines.push(
    `\`tooSmall: true\` marks a hero, gallery or render frame under ${MIN_LONG_EDGE} px on its long edge — ${total.tooSmall} of them. A plan or a brand mark is never marked: a mark is as big as its file and a plan is read, not filled.`,
  )
  lines.push('')
  lines.push('## Refused, by host')
  lines.push('')
  if (refusedHosts.length === 0) lines.push('No host refused a request in this ledger.')
  else {
    lines.push('| host | refused | of records | what answered |')
    lines.push('|---|---:|---:|---|')
    for (const [host, counts] of refusedHosts) {
      const reasons = new Set(
        merged
          .filter((r) => r.host === host && r.refused)
          .map((r) => r.refusedReason ?? `HTTP ${r.status ?? '—'}`),
      )
      lines.push(
        `| \`${host}\` | ${counts.refused} | ${counts.records} | ${[...reasons].join('; ')} |`,
      )
    }
  }
  lines.push('')
  lines.push(
    `${refusedWithSize} of the refused records carry a pixel size anyway: the sweeps that found them opened the page in a real browser and measured the frame with \`naturalWidth\`/\`naturalHeight\`. Those sizes are measured, not guessed, but no byte size exists for them because no body was ever served to a script.`,
  )
  lines.push('')
  lines.push('## What is walled')
  lines.push('')
  lines.push(
    `- **The dealer's own site, \`www.northsidemarine.com.au\`** (and its \`stacer-boats\` subsite): Cloudflare answers 403 to every scripted request whatever the user-agent, \`robots.txt\` included. ${byHost.get('www.northsidemarine.com.au')?.records ?? 0} addresses are recorded anyway, with \`refused: true\`. They matter: the dealer's own photography of the boats it actually sells. The route is the \`mpf-mirror\` scheme or a browser pass, and the owner can simply say yes.`,
  )
  lines.push(
    "- **Mercury's colourway renders** at `shop.mercurymarine.com` answer 403 to every scripted request, and **Yamaha's Australian model pages** sit behind Imperva (its `-/media/….ashx` handler does not: all 45 of the seed's Yamaha addresses answered 200 when the motors sweep asked). Neither wall could be measured through, so those gaps show as models with no record at all rather than as refused rows — `motors-trailers-marks.md` names them one by one.",
  )
  lines.push(
    `- **${pdfs.length} general-arrangement plans are PDFs.** A PDF has no raster size, so \`width\`/\`height\` stay absent by design; the byte size and the content type are measured. They are the manufacturers' own drawings and want a render step, not a resize.`,
  )
  if (notFound.length > 0) {
    lines.push(
      `- **${notFound.length} addresses answered 404** and are kept with their status so the packer skips them rather than re-finding them:`,
    )
    for (const record of notFound) {
      lines.push(`  - ${record.brand} ${record.model ?? ''} (${record.kind}) — \`${record.url}\``)
    }
  }
  lines.push(
    '- The per-model gaps — the models for which no official picture exists anywhere public — are listed in each group `.md` under "What is walled or missing". They are a question for the builder or for the dealership\'s own photography, not for a better sweep.',
  )
  lines.push('')
  lines.push('## How an address was measured, and where that is not the whole story')
  lines.push('')
  lines.push(
    'One GET per address, following redirects, with a browser user-agent, the page it was found on as `Referer`, `Accept: image/avif,image/webp,image/apng,image/svg+xml,application/pdf,image/*,*/*;q=0.8`, `Range: bytes=0-524287` and a 20 s timeout. `width`/`height` come from the file header through `sharp`, with EXIF rotation applied, so they are the picture as it hangs, not as it is stored. `bytes` is the whole-file size the server declares in `Content-Range`. Where the header falls outside the first 512 KB the whole file is requested once.',
  )
  lines.push('')
  lines.push(
    `- **\`status\` 200 and 206 mean the same thing here**: the file is served. 206 is what a range request gets. ${merged.filter((r) => r.status === 200).length} records say 200 and ${merged.filter((r) => r.status === 206).length} say 206, depending on how the sweep that first found them asked.`,
  )
  if (transcoded.length > 0) {
    const hostList = [...new Set(transcoded.map((r) => r.host))].map((h) => `\`${h}\``).join(', ')
    lines.push(
      `- **${transcoded.length} addresses answer with a type their filename does not carry** — a \`.png\` served as \`image/webp\` — on ${hostList}. Those hosts send \`Vary: accept\` and transcode for a browser: Formosa's own mark answers 4,918 bytes of WebP to the Accept above and 5,502 bytes of PNG to \`Accept: image/*\`. **A packer must name the file it saves from the content-type it got, not from the address.**`,
    )
  }
  lines.push(
    '- **One host answers a range request with a different file from a plain GET**: `global.yamaha-motor.com/shared/img/rwd_identity.png` declares 40,094 bytes to a range request and serves 25,565 bytes to a plain GET, same content-type, no content-encoding. The pixel size is the same either way. Where a byte size has to be exact, fetch the whole file.',
  )
  lines.push(
    '- **Five Stacer overhead frames are stored landscape and hang portrait.** `519SeaMaster_OH_2022`, `589SeaMaster_OH_2022`, `539SeaMaster_OH_2023`, `589CrossfireSCSE_OH_2022` and `539CrossfireRCC_OH_2022` carry EXIF orientation 6: the file header says 1776 × 1180 and this ledger records 1180 × 1776, which is what a browser shows. They were the only five pixel sizes in the ledger that moved when every address was re-measured.',
  )
  lines.push(
    '- **A 429 is a fact about the sweep, not about the address.** Re-measuring all 4,368 records on 2026-09-17 asked `www.formosamarineboats.com.au` for its 218 addresses within a few minutes, and 166 came back 429 after answering 200 minutes earlier. Every one of them served again when asked one at a time with a 2 s gap (`--recheck=refused --per-host=1 --gap=2000`). The tool now refuses to write a 429 over a status already recorded, waits after one, and leaves a host alone once it has answered 429 three times.',
  )
  lines.push(
    '- **Byte sizes move under you.** Of the 4,368 records re-measured on 2026-09-17, 102 came back a different size from what the sweeps had written down hours earlier: 90 on `www.formosamarineboats.com.au` and 9 on `www.stacer.com.au`, every one smaller, as those libraries are re-optimised in place; 2 on `www.telwater.com.au`, which are the WebP transcodes above; and one on `global.yamaha-motor.com`, which is the range-versus-plain case above. Two content types changed, both Telwater marks. Nothing else in the ledger moved: no address gained or lost a measurement, and no other pixel size or content type changed.',
  )
  lines.push('')
  lines.push('## How the merge works')
  lines.push('')
  lines.push(
    `- **De-duplicated by address.** ${multi.length} addresses are honestly attached to more than one model — a Merry Fisher interior the builder publishes on both the Coupe and the Flybridge page, a trailer package render two sweeps both found, a brand mark listed in two groups. The second attachment is kept in \`alsoAttachedTo\` rather than dropped, because dropping it would take a picture away from a model that has one.`,
  )
  lines.push(
    '- **Sorted** by brand, series, model, variant, then kind in the order a screen wants them: hero, gallery, render, plan, mark.',
  )
  lines.push('- **`group`** on each record says which sweep found it.')
  lines.push(
    '- Merging never invents: a field is written only from a response this tool or an earlier sweep actually received.',
  )
  lines.push('')
  lines.push('## Fields')
  lines.push('')
  lines.push('| field | what it means |')
  lines.push('|---|---|')
  lines.push(
    '| `brand`, `series`, `model`, `variant` | the exact thing the picture depicts, named as the seed names it |',
  )
  lines.push(
    '| `kind` | `hero` (on-water or lifestyle), `gallery`, `render` (studio or colourway), `plan`, `mark` (brand logo) |',
  )
  lines.push(
    '| `url`, `pageUrl`, `host` | the image address, the page it was found on, the host that served it |',
  )
  lines.push('| `status`, `contentType`, `bytes`, `width`, `height` | what the request returned |')
  lines.push('| `refused`, `refusedReason` | the host answered 403/429/451 or never answered |')
  lines.push(`| \`tooSmall\` | hero/gallery/render under ${MIN_LONG_EDGE} px on the long edge |`)
  lines.push(
    '| `licenceNote` | one honest sentence about what the page says about use; never a licence nobody read |',
  )
  lines.push('| `measuredAt` | the date this tool measured the address itself |')
  lines.push('')
  lines.push('## How to re-run')
  lines.push('')
  lines.push('```')
  lines.push(
    'npx tsx tools/research/measure-images.ts                    # measure only what is unmeasured, then merge',
  )
  lines.push(
    'npx tsx tools/research/measure-images.ts --merge-only       # rebuild candidates.json and this file, no requests',
  )
  lines.push(
    'npx tsx tools/research/measure-images.ts --sample=100       # re-measure 100 at random and report disagreements',
  )
  lines.push(
    'npx tsx tools/research/measure-images.ts --recheck=refused  # try the walled hosts again',
  )
  lines.push(
    'npx tsx tools/research/measure-images.ts --recheck=all      # re-measure everything (slow, polite)',
  )
  lines.push('npx tsx tools/research/measure-images.ts --only=stacer --recheck=missing')
  lines.push('```')
  lines.push('')
  lines.push(
    'Five requests in flight at most, two per host, 250 ms between two requests in the same lane, 20 s timeout; `--concurrency`, `--per-host`, `--gap`, `--timeout` and `--limit` move those. A run rewrites every group file in place (values only, each file keeps its own key order) and rewrites `candidates.json` and this file from scratch. Adding a new group file means adding its name to `GROUPS` in the tool.',
  )
  lines.push('')
  return lines.join('\n')
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2))
  const today = new Date().toISOString().slice(0, 10)

  const groups = new Map<string, Candidate[]>()
  for (const group of GROUPS) groups.set(group, await readGroup(group))
  const totalRecords = [...groups.values()].reduce((n, list) => n + list.length, 0)
  console.log(`Read ${groups.size} group files, ${totalRecords} records.`)

  let requested = 0
  const disagreements: Disagreement[] = []

  if (!opts.mergeOnly) {
    const queue: Task[] = []
    const pool: Task[] = []
    for (const [group, records] of groups) {
      if (!opts.only.includes(group)) continue
      for (const record of records) {
        if (needsMeasuring(record, opts.recheck)) queue.push({ record, group })
        else pool.push({ record, group })
      }
    }
    if (opts.sample > 0 && pool.length > 0) {
      const picked = new Set<number>()
      const wanted = Math.min(opts.sample, pool.length)
      while (picked.size < wanted) picked.add(Math.floor(Math.random() * pool.length))
      for (const index of picked) queue.push(pool[index])
      console.log(`Sampling ${wanted} already-measured addresses to check this run agrees.`)
    }
    const tasks = Number.isFinite(opts.limit) ? queue.slice(0, opts.limit) : queue
    console.log(
      `${tasks.length} addresses to request (recheck=${opts.recheck}, concurrency=${opts.concurrency}, per-host=${opts.perHost}).`,
    )
    if (tasks.length > 0) {
      await runTasks(tasks, opts, (task, measured) => {
        disagreements.push(...applyMeasurement(task.record, measured, today))
      })
      requested = tasks.length
    }
  }

  for (const records of groups.values()) for (const record of records) flagTooSmall(record)

  for (const [group, records] of groups) {
    // A group file keeps its own key order, so its diff shows the values that changed and
    // nothing else. `candidates.json` is the one written in the canonical order.
    const path = join(DIR, `${group}.json`)
    const next = stringify(records) + '\n'
    const current = await readFile(path, 'utf8').catch(() => '')
    if (next !== current) {
      await writeFile(path, next, 'utf8')
      console.log(`Rewrote ${group}.json`)
    }
  }

  const all: { record: Candidate; group: string }[] = []
  for (const [group, records] of groups) for (const record of records) all.push({ record, group })
  const merged = mergeByUrl(all).map(ordered)
  await writeFile(join(DIR, 'candidates.json'), stringify(merged) + '\n', 'utf8')
  await writeFile(
    join(DIR, 'README.md'),
    readme(merged, groups, requested, today, disagreements),
    'utf8',
  )

  const served = merged.filter((r) => (r.status ?? 0) >= 200 && (r.status ?? 0) < 300).length
  const refused = merged.filter((r) => r.refused).length
  const tooSmall = merged.filter((r) => r.tooSmall).length
  const notFound = merged.filter((r) => (r.status ?? 0) === 404 || (r.status ?? 0) === 410).length
  const noSize = merged.filter((r) => r.width === undefined).length
  console.log('')
  console.log(
    `candidates.json: ${merged.length} addresses (${totalRecords} records before de-duplication)`,
  )
  console.log(
    `  served 2xx ${served} · refused ${refused} · 404 ${notFound} · too small ${tooSmall} · no pixel size ${noSize}`,
  )
  if (requested > 0) {
    console.log(
      `  requested this run ${requested}, disagreements with what was written down: ${disagreements.length}`,
    )
    const byField = new Map<string, number>()
    for (const d of disagreements) byField.set(d.field, (byField.get(d.field) ?? 0) + 1)
    for (const [field, count] of byField) console.log(`    ${field}: ${count}`)
    for (const d of disagreements.slice(0, 60)) {
      console.log(`    ${d.field}: ${String(d.was)} → ${String(d.now)}  ${d.url}`)
    }
    if (disagreements.length > 60) console.log(`    … and ${disagreements.length - 60} more`)
  }
}

await main()
