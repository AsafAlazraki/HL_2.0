/**
 * The load hook the packer's worker runs under, and nothing else does.
 *
 * `buildNorthsideProject()` lives in the old repository beside the old store, and importing
 * it drags in that store's import graph: a stylesheet (`src/ui/button.css`) and
 * `src/lib/imageSources.ts`, which reads `import.meta.env.BASE_URL` at module load. Neither
 * exists in Node, and both are Vite's rather than the seed's, so they are stubbed here for
 * the one import the packer makes: an asset resolves to an empty module, and
 * `import.meta.env` in a file under the old repository's `src/` is rewritten to the plain
 * object `pack.hooks.mjs` defines on `globalThis`. The seed's own text is never touched —
 * the rewrite applies only to a source that mentions `import.meta.env`, which
 * `northside.ts` does not.
 *
 * Hooks run on their own thread, so the old repository's location arrives through
 * `initialize(data)` rather than through a global.
 */
const ASSET = /\.(css|svg|png|jpe?g|webp|gif|woff2?|ttf)(\?.*)?$/i

let oldSrc = ''

export function initialize(data) {
  oldSrc = data?.oldSrc ?? ''
}

export async function load(url, context, nextLoad) {
  /* Vite's `?raw`: the file's text as the default export. The app reads its ledgers this way
     (`names.json?raw`, `marks-ledger.json?raw`), and a tool that runs the app's own readers
     in Node (`app.hooks.mjs`) needs the same answer the bundle gets. */
  if (url.endsWith('?raw')) {
    const { readFile } = await import('node:fs/promises')
    const text = await readFile(new URL(url.slice(0, -'?raw'.length)), 'utf8')
    return {
      format: 'module',
      source: 'export default ' + JSON.stringify(text),
      shortCircuit: true,
    }
  }
  if (ASSET.test(url)) {
    return { format: 'module', source: 'export default {}', shortCircuit: true }
  }
  const out = await nextLoad(url, context)
  if (oldSrc !== '' && url.startsWith(oldSrc) && out.source != null) {
    const text = typeof out.source === 'string' ? out.source : new TextDecoder().decode(out.source)
    if (text.includes('import.meta.env')) {
      return { ...out, source: text.replaceAll('import.meta.env', '(globalThis.hl2ViteEnv)') }
    }
  }
  return out
}
