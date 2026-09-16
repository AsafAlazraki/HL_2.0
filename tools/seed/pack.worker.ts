/**
 * THE OLD HALF OF THE PACKER.
 *
 * Runs under the OLD repository's tsconfig (`tsx --tsconfig <old>/tsconfig.app.json`),
 * because `northside.ts` imports `@/…` paths that resolve only there, and it imports
 * nothing from this repository but Node itself. It builds the committed set with the old
 * repository's own `buildNorthsideProject()`, exactly as the old app did, and writes one
 * JSON snapshot for `pack.ts` to re-key.
 *
 * NOTHING HERE DECIDES ANYTHING. The ids are the old minted ones, the two flow rules are
 * still attached, and the modules are not built — they were minted through the old
 * store's `createModule`, which this never calls. The sha256 is taken over the file's
 * BYTES, read by Node and never through a shell.
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

interface OldSeedModule {
  buildNorthsideProject(): unknown
  northsideSeedFingerprint(): string
  NORTHSIDE_NAME: string
}

interface OldHoldsModule {
  NORTHSIDE_HOLDS: { tables: number; rows: number }
}

const out = process.argv[2]
if (!out) throw new Error('pack.worker: the snapshot path is the one argument')

const old = process.env.HL_PLAYGROUND ?? path.join(os.homedir(), 'dev', 'HL_Playground')
const seedPath = path.join(old, 'src', 'demos', 'northside.ts')
const holdsPath = path.join(old, 'src', 'demos', 'northsideHolds.ts')

const seed = (await import(pathToFileURL(seedPath).href)) as OldSeedModule
const holds = (await import(pathToFileURL(holdsPath).href)) as OldHoldsModule

const bytes = readFileSync(seedPath)
const sourceSha256 = createHash('sha256').update(bytes).digest('hex')

const started = Date.now()
const project = seed.buildNorthsideProject()
console.log(`pack.worker: built the old set in ${Date.now() - started} ms`)

writeFileSync(
  out,
  JSON.stringify({
    sourcePath: seedPath,
    sourceBytes: bytes.length,
    sourceSha256,
    fingerprint: seed.northsideSeedFingerprint(),
    name: seed.NORTHSIDE_NAME,
    holds: holds.NORTHSIDE_HOLDS,
    project,
  }),
  'utf8',
)
