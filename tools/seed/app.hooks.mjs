/**
 * The preload for a tool that runs THIS app's own readers in Node — the picker's `fleetOf`,
 * the pack fixture — rather than a copy of them:
 *
 *   npx tsx --tsconfig tsconfig.app.json --import ./tools/seed/app.hooks.mjs <tool>.ts
 *
 * It is `pack.hooks.mjs` pointed at this repository's `src/` instead of the old one's: the
 * same `pack.stubs.mjs` rewrites `import.meta.env` to a plain object and answers Vite's
 * `?raw` with the file's text, so the count a tool prints is the count the picker draws.
 */
import { register } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

globalThis.hl2ViteEnv = { BASE_URL: '/', MODE: 'production', DEV: false, PROD: true, SSR: true }

const src = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'src')
register('./pack.stubs.mjs', import.meta.url, {
  data: { oldSrc: pathToFileURL(src + path.sep).href },
})
