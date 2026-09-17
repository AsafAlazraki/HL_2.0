/**
 * Screenshot each direction board for one screen, at the size it is drawn for.
 *
 *   npx tsx tools/research/shots.ts <screen> [--width 1440 --height 900]
 *
 * WHY A SERVER AND NOT A file:// URL. A board references its pictures the way the app will,
 * from the web root: `/hero-images/highfield-sp560-….webp`. Opened as a file, that resolves
 * to the drive root and every photograph silently becomes alt text on a coloured panel —
 * which is exactly how the first entry board was screenshotted on 2026-09-17, and it read as
 * a finished design with a deliberate empty panel. So the boards are served: `public/` at
 * `/`, and the board itself from `docs/directions/<screen>/`.
 *
 * Page errors and failed requests are printed per board and are the point of the exercise: a
 * board that cannot load its own photograph must fail loudly, not quietly.
 */
import { chromium } from '@playwright/test'
import { createServer } from 'node:http'
import { readFile, readdir, mkdir } from 'node:fs/promises'
import { extname, join, resolve, sep } from 'node:path'

const [screen, ...rest] = process.argv.slice(2)
if (!screen) {
  console.error('usage: shots.ts <screen> [--width N --height N]')
  process.exit(2)
}
const arg = (name: string, fallback: number) => {
  const i = rest.indexOf(`--${name}`)
  return i >= 0 ? Number(rest[i + 1]) : fallback
}
const width = arg('width', 1440)
const height = arg('height', 900)

const boardDir = join('docs', 'directions', screen)
const shotDir = join(boardDir, 'shots')
await mkdir(shotDir, { recursive: true })

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
}

/** Two roots: the board's own folder first, then `public/`, so `/hero-images/…` resolves. */
const ROOTS = [resolve(boardDir), resolve('public')]

const server = createServer(async (req, res) => {
  const path = decodeURIComponent((req.url ?? '/').split('?')[0]!)
  // Never serve outside a declared root, whatever the request says. A URL path is
  // forward-slashed by definition, so it is split rather than normalised.
  const rel = path.split('/').filter(Boolean).join('/')
  for (const root of ROOTS) {
    const file = resolve(root, rel)
    if (!file.startsWith(root + sep) && file !== root) continue
    try {
      const body = await readFile(file)
      res.writeHead(200, {
        'content-type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream',
      })
      res.end(body)
      return
    } catch {
      /* try the next root */
    }
  }
  res.writeHead(404, { 'content-type': 'text/plain' })
  res.end(`no such file: ${path}`)
})

await new Promise<void>((done) => server.listen(0, '127.0.0.1', done))
const address = server.address()
const port = typeof address === 'object' && address ? address.port : 0
const origin = `http://127.0.0.1:${port}`

const boards = (await readdir(boardDir))
  .filter((f) => f.endsWith('.html') && f !== 'canvas.html')
  .toSorted()
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })

const errors: string[] = []
const missing: string[] = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('requestfailed', (r) => missing.push(`${r.url()} — ${r.failure()?.errorText ?? 'failed'}`))
page.on('response', (r) => {
  if (r.status() >= 400) missing.push(`${r.url()} — HTTP ${r.status()}`)
})

let bad = 0
for (const f of boards) {
  errors.length = 0
  missing.length = 0
  await page.goto(`${origin}/${f}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  const out = join(shotDir, f.replace('.html', '.png'))
  await page.screenshot({ path: out })
  const scrolls = await page.evaluate(
    () =>
      document.documentElement.scrollHeight > window.innerHeight + 1 ||
      document.documentElement.scrollWidth > window.innerWidth + 1,
  )
  const problems = [
    ...errors.map((e) => `page error: ${e}`),
    ...missing.map((m) => `did not load: ${m}`),
    ...(scrolls ? [`scrolls at ${width}x${height}: a board must fit its own frame`] : []),
  ]
  if (problems.length > 0) bad++
  console.log(`${problems.length === 0 ? 'ok  ' : 'FAIL'} ${f}`)
  for (const p of problems) console.log(`       ${p}`)
}

await browser.close()
server.close()
console.log(`\n${boards.length} boards, ${bad} with problems, shots in ${shotDir}`)
if (bad > 0) process.exit(1)
