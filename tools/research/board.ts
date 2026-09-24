/**
 * Assemble one screen's direction boards into a single canvas the owner can look at.
 *
 *   npx tsx tools/research/board.ts <screen>
 *
 * Reads `docs/directions/<screen>/canvas.json`:
 *   { screen, job, preface?, directions: [{ id, name, axis, file, only, references: string[],
 *     recommended?: boolean, hand?, strip? }] }
 * where each `file` is a self-contained HTML board drawn at 1440×900 on real seed content.
 * Three optional paths, each relative to the screen's folder, added 2026-09-23 for the sheet's
 * redesign round: `hand` is the same direction drawn at 390×844, `strip` a 1440×900 text board
 * shown beneath it, and `preface` a 1440×900 board shown before every direction. A canvas.json
 * without them draws exactly what it drew before.
 * Any `src="/seed-images/…"`, `/hero-images/…` or `/brand-marks/…` inside a board is inlined as a data
 * URI from `public/`, so the canvas works when hosted away from this repo. Writes
 * `docs/directions/<screen>/canvas.html` (gitignored: it carries the pictures) and prints its
 * size; the canvas is what gets published.
 */
import { readFile, writeFile, stat } from 'node:fs/promises'
import { join, extname } from 'node:path'

interface Direction {
  id: string
  name: string
  axis: string
  file: string
  only: string
  references: string[]
  recommended?: boolean
  hand?: string
  strip?: string
}
interface Canvas {
  screen: string
  job: string
  preface?: string
  directions: Direction[]
}

const screen = process.argv[2]
if (!screen) {
  console.error('usage: board.ts <screen>')
  process.exit(2)
}
const dir = join('docs', 'directions', screen)
const canvas = JSON.parse(await readFile(join(dir, 'canvas.json'), 'utf8')) as Canvas

const MIME: Record<string, string> = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
}

const cache = new Map<string, string>()
async function dataUri(publicPath: string): Promise<string> {
  const hit = cache.get(publicPath)
  if (hit) return hit
  const file = join('public', publicPath)
  const mime = MIME[extname(file).toLowerCase()]
  if (!mime) throw new Error(`no mime for ${publicPath}`)
  const bytes = await readFile(file)
  const uri = `data:${mime};base64,${bytes.toString('base64')}`
  cache.set(publicPath, uri)
  return uri
}

async function inline(html: string): Promise<string> {
  const refs = [
    ...html.matchAll(
      /(src|href|url\()=?\(?["']?\/(seed-images|brand-marks|hero-images)\/([^"')\s]+)/g,
    ),
  ]
  let out = html
  for (const m of refs) {
    const publicPath = `${m[2]}/${m[3]}`
    const uri = await dataUri(publicPath)
    out = out.split(`/${publicPath}`).join(uri)
  }
  return out
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

/** One board in a frame that scales it to the column, at the size it was drawn for. */
async function frame(file: string, title: string, w: number, h: number): Promise<string> {
  const html = await inline(await readFile(join(dir, file), 'utf8'))
  return `<div class="frame" data-w="${w}" style="aspect-ratio: ${w} / ${h}"><iframe title="${esc(title)}" sandbox="allow-same-origin" style="width: ${w}px; height: ${h}px" srcdoc="${esc(html)}"></iframe></div>`
}

const preface = canvas.preface
  ? `<section class="direction preface">${await frame(canvas.preface, 'Preface', 1440, 900)}</section>`
  : ''

const boards: string[] = []
for (const d of canvas.directions) {
  const raw = await readFile(join(dir, d.file), 'utf8')
  const html = await inline(raw)
  const hand = d.hand
    ? `<figure class="under__hand">${await frame(d.hand, `${d.name} at 390 × 844`, 390, 844)}<figcaption>the same direction at 390 × 844</figcaption></figure>`
    : ''
  const strip = d.strip
    ? `<figure class="under__strip">${await frame(d.strip, `${d.name}, the strip`, 1440, 900)}<figcaption>the strip beneath the board</figcaption></figure>`
    : ''
  boards.push(`
<section class="direction${d.recommended ? ' recommended' : ''}" id="${esc(d.id)}">
  <header>
    <div class="row">
      <span class="id">${esc(d.id)}</span>
      <h2>${esc(d.name)}</h2>
      ${d.recommended ? '<span class="pill">recommended</span>' : ''}
    </div>
    <p class="axis">${esc(d.axis)}</p>
    <p class="only"><strong>What only this screen does:</strong> ${esc(d.only)}</p>
    <p class="refs"><strong>Drawn from:</strong> ${d.references.map(esc).join(' · ')}</p>
  </header>
  <div class="frame"><iframe title="${esc(d.name)}" sandbox="allow-same-origin" srcdoc="${esc(html)}"></iframe></div>
  ${hand || strip ? `<div class="under">${hand}${strip}</div>` : ''}
</section>`)
}

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(canvas.screen)} directions</title>
<style>
  :root { --ink: #111; --mute: #666; --line: #e6e6e6; --paper: #fafafa; --accent: #1d4ed8; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --ink: #f2f2f2; --mute: #9a9a9a; --line: #2a2a2a; --paper: #121212; --accent: #7aa2ff; } }
  :root[data-theme="dark"] { --ink: #f2f2f2; --mute: #9a9a9a; --line: #2a2a2a; --paper: #121212; --accent: #7aa2ff; }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 15px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; padding: 24px 16px 64px; }
  main { max-width: 1520px; margin: 0 auto; }
  h1 { font-size: 28px; margin: 0 0 4px; letter-spacing: -0.01em; }
  .job { color: var(--mute); margin: 0 0 32px; max-width: 70ch; }
  .direction { border-top: 1px solid var(--line); padding: 28px 0 8px; }
  .direction.recommended .id { background: var(--accent); color: #fff; }
  .row { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
  .id { font: 600 13px/1 ui-monospace, monospace; padding: 6px 8px; border-radius: 6px; background: var(--line); }
  h2 { font-size: 22px; margin: 0; }
  .pill { font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--accent); }
  .axis, .only, .refs { margin: 6px 0; max-width: 90ch; }
  .axis { color: var(--mute); }
  .frame { margin-top: 16px; width: 100%; aspect-ratio: 1440 / 900; border: 1px solid var(--line); border-radius: 10px; overflow: hidden; background: #fff; position: relative; }
  .frame iframe { position: absolute; inset: 0; width: 1440px; height: 900px; border: 0; transform-origin: 0 0; transform: scale(var(--s, 1)); }
  .under { display: grid; grid-template-columns: minmax(0, 0.27fr) minmax(0, 1fr); gap: 16px; align-items: start; }
  .under figure { margin: 0; }
  .under figcaption { color: var(--mute); font-size: 13px; margin-top: 6px; }
  .under .frame { margin-top: 16px; }
</style>
</head>
<body>
<main>
  <h1>${esc(canvas.screen)} — directions</h1>
  <p class="job">${esc(canvas.job)}</p>
  ${preface}
  ${boards.join('\n')}
</main>
<script>
  function fit() {
    document.querySelectorAll('.frame').forEach((f) => {
      f.style.setProperty('--s', String(f.clientWidth / (Number(f.dataset.w) || 1440)))
    })
  }
  fit(); addEventListener('resize', fit)
</script>
</body>
</html>
`

const out = join(dir, 'canvas.html')
await writeFile(out, page)
const size = (await stat(out)).size
console.log(
  `${out}  ${(size / 1024 / 1024).toFixed(2)} MB  (${canvas.directions.length} directions)`,
)
