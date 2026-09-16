/**
 * THE PACKER — `npm run pack`.
 *
 * Turns the old repository's committed seed into `data/northside/`: a manifest, one
 * `entities.json`, one `tables/<key>.json` per table (an array of rows, one row per line)
 * and the image ledger. Python is not on this machine and the committed TypeScript seed is
 * byte-reproducible from the extracts, so packing FROM it loses nothing; the manifest
 * records the source file's sha256 and the old app's own fingerprint of it.
 *
 * Two halves, because the seed only resolves under the old repository's tsconfig:
 *
 *   1. `pack.worker.ts`, spawned under `tsx --tsconfig <old>/tsconfig.app.json` with the
 *      preload in `pack.hooks.mjs`, calls the old `buildNorthsideProject()` and writes a
 *      snapshot.
 *   2. This file re-keys it deterministically, declares every priced table's ladder,
 *      asserts the counts against the old repository's own holds BEFORE writing anything,
 *      accounts for every picture, and writes the pack and the two documents.
 *
 * The old repository is read only. Its location is `HL_PLAYGROUND` or
 * `~/dev/HL_Playground`. Nothing here text-processes the seed through a shell: the worker
 * hashes bytes, and the one read of the source text (for the column keys) is Node reading
 * UTF-8 and verifying every key list against the built table.
 */
import { spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import type { EntityDef, PackManifest, PackTableMeta, RowData } from '../../src/domain/model'
import { DISCONTINUED_FIELD_ID, displayFieldOf } from '../../src/domain/model'
import { seedFingerprint } from '../../src/data/pack/fingerprint'
import type { PackImageEntry, PackImagesFile } from '../../src/data/pack/images'
import { countLedger, countVerdicts } from '../../src/data/pack/images'
import { imagesDoc, seedDoc } from './docs'
import {
  LEDGER_NOTE,
  LONG_EDGE,
  QUALITY,
  hostOf,
  licenceNoteFor,
  sha1Hex,
  sha256Hex,
  writeLedger,
} from './ledger'
import { declareLevels } from './levels'
import { rekey, type OldProject } from './rekey'
import { readSeedColumns, readSeedRowCounts } from './source'
import { verdictOf } from './verdict'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '..', '..')
const DATA = path.join(ROOT, 'data', 'northside')
const TABLES_DIR = path.join(DATA, 'tables')
const IMAGES_DIR = path.join(ROOT, 'public', 'seed-images')
const LEGACY_LEDGER = path.join(HERE, 'legacy', 'extracts', 'images.json')
const DOCS = path.join(ROOT, 'docs', 'data')

/** one string; a pack is versioned, never stamped or migrated */
const PACK_VERSION = '1'
const PACK_NAME = 'Northside Marine'
/** the twenty-seven fan-out joins plus the one that exists to show a defect
 *  (Surtees × OBSOLETE Trailers) — tools/seed/legacy/README.md */
const EXPECTED_JOINS = 28

interface Snapshot {
  sourcePath: string
  sourceBytes: number
  sourceSha256: string
  fingerprint: string
  name: string
  holds: { tables: number; rows: number }
  project: OldProject
}

interface LegacyImage {
  url: string
  host: string
  file?: string
  bytes?: number
  w?: number
  h?: number
  sha256?: string
  srcW?: number
  srcH?: number
  srcType?: string
  fetched?: string
  via?: string
  mirror?: string
  mirrorKey?: string
  why?: string
  status?: number
}

interface LegacyLedger {
  /* the Python fetcher's own key; read once here and never written */
  ['_meta']: { measured: string; longEdge: number; quality: number }
  images: LegacyImage[]
}

const oldRepo = process.env.HL_PLAYGROUND ?? path.join(os.homedir(), 'dev', 'HL_Playground')

function fail(message: string): never {
  throw new Error(message)
}

function same(what: string, got: number, want: number): void {
  if (got !== want) fail(`${what}: measured ${got}, expected ${want}`)
}

/* ---------------------------------------------------------- */
/* 1 · the old half                                           */
/* ---------------------------------------------------------- */

function buildSnapshot(): Snapshot {
  const seedPath = path.join(oldRepo, 'src', 'demos', 'northside.ts')
  if (!existsSync(seedPath)) fail(`no old seed at ${seedPath} — set HL_PLAYGROUND`)
  const oldTsconfig = path.join(oldRepo, 'tsconfig.app.json')
  const tsx = path.join(ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs')
  if (!existsSync(tsx)) fail(`tsx is not installed at ${tsx}`)
  const snapshotPath = path.join(os.tmpdir(), `hl2-pack-${process.pid}.json`)
  const result = spawnSync(
    process.execPath,
    [
      tsx,
      '--tsconfig',
      oldTsconfig,
      '--import',
      pathToFileURL(path.join(HERE, 'pack.hooks.mjs')).href,
      path.join(HERE, 'pack.worker.ts'),
      snapshotPath,
    ],
    { stdio: 'inherit', env: { ...process.env, HL_PLAYGROUND: oldRepo } },
  )
  if (result.status !== 0) fail(`pack.worker exited with ${result.status}`)
  const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8')) as Snapshot
  unlinkSync(snapshotPath)
  return snapshot
}

/* ---------------------------------------------------------- */
/* 2 · the assertions, before anything is written             */
/* ---------------------------------------------------------- */

function assertHolds(
  snapshot: Snapshot,
  entities: readonly EntityDef[],
  rowsByEntity: Record<string, RowData[]>,
  literalCounts: Map<string, number>,
): void {
  let rows = 0
  let joins = 0
  for (const e of entities) {
    const n = rowsByEntity[e.id]?.length ?? 0
    rows += n
    if (e.role === 'join') joins += 1
    /* THE ORDINAL IS ONLY UNAMBIGUOUS IF NOTHING WAS DROPPED. Pass 2 of
       the old builder drops a pairing whose either side does not
       resolve; the literal count is what the seed types. */
    const literal = literalCounts.get(e.id)
    if (literal === undefined) fail(`${e.id}: no ROWS literal in the source`)
    same(`${e.id} rows (source literal vs built)`, n, literal)
  }
  same('tables (northsideHolds.ts)', entities.length, snapshot.holds.tables)
  same('rows (northsideHolds.ts)', rows, snapshot.holds.rows)
  same('join tables', joins, EXPECTED_JOINS)

  /* seedFidelity.test.ts — the Surtees band is the workbook, verbatim */
  const surtees = entities.find((e) => e.name === 'Surtees') ?? fail('no Surtees table')
  const field = displayFieldOf(surtees) ?? fail('Surtees has no display column')
  const names = (rowsByEntity[surtees.id] ?? []).map((r) => String(r.values[field.id] ?? ''))
  for (const want of [
    'Surtess  -  770 Game Fisher XL',
    'Surtees  -  770 Game Fisher',
    '495 - Pro Fisher.',
    '540 - Workmate.',
  ]) {
    if (!names.includes(want)) fail(`Surtees: the seed no longer reads “${want}” verbatim`)
  }
  same('Surtees rows', names.length, 19)
  same('Surtees rows carrying the brand', names.filter((n) => n.startsWith('Surte')).length, 6)

  /* ids: unique across every table, and the pair fields literal */
  const rowIds = new Set<string>()
  for (const e of entities) {
    const fieldIds = new Set<string>()
    for (const f of e.fields) {
      if (fieldIds.has(f.id)) fail(`${e.id}: field id ${f.id} twice`)
      fieldIds.add(f.id)
      if (
        f.id.startsWith('__') &&
        f.id !== '__origin' &&
        f.id !== '__recommended' &&
        f.id !== '__order' &&
        f.id !== '__discontinued'
      ) {
        fail(`${e.id}: ${f.id} is a literal id the model does not read`)
      }
    }
    for (const r of rowsByEntity[e.id] ?? []) {
      if (rowIds.has(r.id)) fail(`row id ${r.id} twice`)
      rowIds.add(r.id)
    }
  }

  /* the fingerprint over the pack equals the old app's over the seed */
  const computed = seedFingerprint(
    entities.map((e) => ({
      name: e.name,
      role: e.role,
      rowCount: rowsByEntity[e.id]?.length ?? 0,
    })),
  )
  if (computed !== snapshot.fingerprint) {
    fail(`fingerprint over the pack is ${computed}; the old builder says ${snapshot.fingerprint}`)
  }
}

/* ---------------------------------------------------------- */
/* 3 · the pictures                                           */
/* ---------------------------------------------------------- */

/** every distinct address in a picture cell of the pack, sorted */
function seededAddresses(
  entities: readonly EntityDef[],
  rowsByEntity: Record<string, RowData[]>,
): string[] {
  const out = new Set<string>()
  for (const e of entities) {
    const picture = new Set(e.fields.filter((f) => f.type === 'image').map((f) => f.id))
    if (picture.size === 0) continue
    for (const row of rowsByEntity[e.id] ?? []) {
      for (const [fieldId, value] of Object.entries(row.values)) {
        if (!picture.has(fieldId) || !Array.isArray(value)) continue
        for (const img of value) out.add(img.src)
      }
    }
  }
  return [...out].toSorted()
}

/** What an earlier measurement recorded about an address — the
 *  provenance without the address, host, sha1, note and verdict the
 *  packer recomputes. */
type Prior = Omit<PackImageEntry, 'address' | 'host' | 'sha1' | 'licenceNote' | 'verdict'>

/** The legacy ledger's record, in the pack's own words. */
function priorOfLegacy(was: LegacyImage): Prior {
  if (!was.file) return { error: was.why ?? `${was.host} could not be reached` }
  return {
    file: was.file,
    ...(was.fetched ? { fetchedAt: was.fetched } : {}),
    ...(was.w !== undefined ? { width: was.w } : {}),
    ...(was.h !== undefined ? { height: was.h } : {}),
    ...(was.bytes !== undefined ? { bytes: was.bytes } : {}),
    ...(was.sha256 ? { sha256: was.sha256 } : {}),
    ...(was.srcW !== undefined ? { sourceWidth: was.srcW } : {}),
    ...(was.srcH !== undefined ? { sourceHeight: was.srcH } : {}),
    ...(was.srcType ? { sourceType: was.srcType } : {}),
    via: was.via === 'mpf-mirror' ? 'mpf-mirror' : 'host',
    ...(was.mirror ? { mirror: was.mirror } : {}),
    ...(was.mirrorKey ? { mirrorKey: was.mirrorKey } : {}),
  }
}

function priorOfEntry(e: PackImageEntry): Prior {
  const {
    address: _address,
    host: _host,
    sha1: _sha1,
    licenceNote: _note,
    verdict: _verdict,
    ...rest
  } = e
  return rest
}

/**
 * THE PACK'S OWN LEDGER WINS. The legacy ledger (the Python fetcher's
 * measurement, 226 addresses) seeds the first pack; every later run
 * reads `data/northside/images.json` back and keeps what
 * `fetch-images.ts` has added since, because a packer that rebuilt the
 * ledger from the legacy file alone would silently drop every picture
 * fetched after it. Whichever record an address has, the packer
 * re-checks the bytes and re-judges the picture.
 */
async function buildLedger(addresses: readonly string[]): Promise<PackImagesFile> {
  const legacy = JSON.parse(readFileSync(LEGACY_LEDGER, 'utf8')) as LegacyLedger
  const legacyMeta = legacy['_meta']
  const prior = new Map<string, Prior>()
  for (const r of legacy.images) prior.set(r.url, priorOfLegacy(r))
  let measured = legacyMeta.measured
  const existingPath = path.join(DATA, 'images.json')
  if (existsSync(existingPath)) {
    const existing = JSON.parse(readFileSync(existingPath, 'utf8')) as PackImagesFile
    for (const e of existing.images) {
      if (e.file || e.error) prior.set(e.address, priorOfEntry(e))
    }
    if (existing.meta.measured > measured) measured = existing.meta.measured
  }

  const seeded = new Set(addresses)
  for (const url of prior.keys()) {
    /* THE ONE DOOR A SUBSTITUTION COULD ENTER BY: an address in a
       ledger that the catalogue does not carry */
    if (!seeded.has(url)) fail(`the ledger holds ${url}, which no picture cell carries`)
  }

  const images: PackImageEntry[] = []
  for (const address of addresses) {
    const host = hostOf(address)
    const was = prior.get(address)
    const entry: PackImageEntry = {
      address,
      host,
      sha1: sha1Hex(address),
      licenceNote: '',
      verdict: 'unknown',
    }
    if (was?.file) {
      const file = path.join(IMAGES_DIR, was.file)
      if (!existsSync(file))
        fail(`${was.file} is named by the ledger and is not in public/seed-images`)
      const bytes = readFileSync(file)
      if (was.sha256 && sha256Hex(bytes) !== was.sha256) {
        fail(`${was.file}: the bytes on disk are not the bytes the ledger measured`)
      }
      Object.assign(entry, was, {
        bytes: bytes.length,
        sha256: sha256Hex(bytes),
        verdict: await verdictOf(file),
      })
    } else if (was?.error) {
      entry.error = was.error
    }
    entry.licenceNote = licenceNoteFor(entry)
    images.push(entry)
  }

  /* a copy on disk that nothing names is dead weight, and evidence that
     an address quietly changed — reported, never deleted here */
  const named = new Set(images.map((e) => e.file).filter((f): f is string => f !== undefined))
  const orphans = readdirSync(IMAGES_DIR).filter((f) => f.endsWith('.webp') && !named.has(f))
  for (const f of orphans) console.warn(`pack: public/seed-images/${f} is named by no address`)

  return {
    meta: {
      generatedBy:
        'tools/seed/pack.ts from tools/seed/legacy/extracts/images.json and the previous data/northside/images.json; tools/seed/fetch-images.ts adds to it',
      longEdge: legacyMeta.longEdge ?? LONG_EDGE,
      quality: legacyMeta.quality ?? QUALITY,
      measured,
      note: LEDGER_NOTE,
    },
    images,
  }
}

/* ---------------------------------------------------------- */
/* 4 · writing                                                */
/* ---------------------------------------------------------- */

const linesOf = (items: readonly unknown[]): string =>
  `[\n${items.map((x) => JSON.stringify(x)).join(',\n')}\n]\n`

async function main(): Promise<void> {
  const packedAt = new Date().toISOString()
  const started = Date.now()
  const took: string[] = []
  let mark = started
  const lap = (label: string): void => {
    const now = Date.now()
    took.push(`${label} ${((now - mark) / 1000).toFixed(1)}s`)
    mark = now
  }

  const snapshot = buildSnapshot()
  lap('old builder')
  const source = readFileSync(snapshot.sourcePath, 'utf8')
  const columns = readSeedColumns(source)
  const literalCounts = readSeedRowCounts(source)
  lap('source keys')

  const { entities, rowsByEntity } = rekey(snapshot.project, columns, packedAt)
  assertHolds(snapshot, entities, rowsByEntity, literalCounts)
  lap('re-key and assert')

  /* the ladder, declared on every table — a throw here is the refusal */
  const tables: PackTableMeta[] = entities.map((e) => {
    const { priceLevels, costColumns } = declareLevels(e)
    e.priceLevels = priceLevels
    return {
      key: e.id,
      id: e.id,
      name: e.name,
      ...(e.kind ? { kind: e.kind } : {}),
      role: e.role ?? 'base',
      rowCount: rowsByEntity[e.id]?.length ?? 0,
      file: `tables/${e.id}.json`,
      priceLevels,
      costColumns,
    }
  })

  const addresses = seededAddresses(entities, rowsByEntity)
  const ledger = await buildLedger(addresses)
  const counts = countLedger(ledger.images)
  const verdicts = countVerdicts(ledger.images)
  lap('pictures')

  const manifest: PackManifest = {
    version: PACK_VERSION,
    name: PACK_NAME,
    sourceSha256: snapshot.sourceSha256,
    sourceFingerprint: snapshot.fingerprint,
    packedAt,
    counts: {
      tables: entities.length,
      rows: tables.reduce((n, t) => n + t.rowCount, 0),
      joins: tables.filter((t) => t.role === 'join').length,
    },
    tables,
    images: { file: 'images.json', ...counts },
  }

  /* write: tables, entities, the ledger, and the manifest LAST so a
     half-written pack has no manifest to be mistaken for a whole one */
  mkdirSync(TABLES_DIR, { recursive: true })
  for (const f of readdirSync(TABLES_DIR))
    if (f.endsWith('.json')) unlinkSync(path.join(TABLES_DIR, f))
  for (const e of entities) {
    writeFileSync(path.join(TABLES_DIR, `${e.id}.json`), linesOf(rowsByEntity[e.id] ?? []), 'utf8')
  }
  writeFileSync(path.join(DATA, 'entities.json'), linesOf(entities), 'utf8')
  writeLedger(DATA, ledger)
  writeFileSync(path.join(DATA, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

  mkdirSync(DOCS, { recursive: true })
  writeFileSync(path.join(DOCS, 'SEED.md'), seedDoc(manifest, entities), 'utf8')
  writeFileSync(path.join(DOCS, 'IMAGES.md'), imagesDoc(manifest, ledger), 'utf8')
  lap('write')

  const discontinued = entities.reduce(
    (n, e) =>
      n + (rowsByEntity[e.id] ?? []).filter((r) => r.values[DISCONTINUED_FIELD_ID] === true).length,
    0,
  )
  const priced = tables.filter((t) => (t.priceLevels?.length ?? 0) > 0).length
  console.log(
    [
      `pack: ${snapshot.name}`,
      `  source ${path.basename(snapshot.sourcePath)} · ${snapshot.sourceBytes.toLocaleString('en-AU')} bytes · sha256 ${snapshot.sourceSha256} · fingerprint ${snapshot.fingerprint}`,
      `  ${manifest.counts.tables} tables · ${manifest.counts.rows.toLocaleString('en-AU')} rows · ${manifest.counts.joins} joins · ${discontinued} rows discontinued · ${entities.filter((e) => e.retired).length} tables retired`,
      `  ${priced} tables priced · ${tables.reduce((n, t) => n + t.costColumns.length, 0)} cost columns named`,
      `  ${addresses.length} picture addresses: ${counts.held} held (${verdicts.scene} scene · ${verdicts.studio} studio) · ${counts.unheld} unheld · ${counts.refused} refused`,
      `  wrote ${path.relative(ROOT, DATA)} and ${path.relative(ROOT, DOCS)}`,
      `  ${((Date.now() - started) / 1000).toFixed(1)}s: ${took.join(' · ')}`,
    ].join('\n'),
  )
}

await main()
