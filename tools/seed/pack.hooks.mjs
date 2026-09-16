/**
 * The preload for the packer's worker: `pack.ts` spawns
 * `node tsx --tsconfig <old>/tsconfig.app.json --import <this file> pack.worker.ts`.
 *
 * Two things, each because importing the old repository's committed seed in Node needs it:
 *
 *   - a Vite environment: `src/lib/imageSources.ts` reads `import.meta.env.BASE_URL` at
 *     module load; `pack.stubs.mjs` rewrites that expression to `globalThis.hl2ViteEnv`.
 *   - the load hook itself, told where the old repository's `src/` is.
 *
 * NOT `fake-indexeddb`, and that was measured rather than assumed: the old store constructs
 * its Dexie database at module load, but Dexie 4 constructs without an `indexedDB` global
 * and nothing in the build opens or writes it, so the worker ran clean without the preload
 * (2026-09-16). The day the old store starts opening the database at import, add
 * `import 'fake-indexeddb/auto'` here — it resolves from this repository's node_modules.
 */
import { register } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

globalThis.hl2ViteEnv = { BASE_URL: '/', MODE: 'production', DEV: false, PROD: true, SSR: true }

const old = process.env.HL_PLAYGROUND ?? path.join(os.homedir(), 'dev', 'HL_Playground')
register('./pack.stubs.mjs', import.meta.url, {
  data: { oldSrc: pathToFileURL(path.join(old, 'src') + path.sep).href },
})
