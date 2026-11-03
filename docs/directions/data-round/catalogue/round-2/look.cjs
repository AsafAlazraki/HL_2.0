/* THE CHANDLERY, LOOKED AT AGAIN — round 2 of the data round's catalogue fixes. Starts its own
   `vite` on PORT (6247 by default), walks the real door with the real Master Price File at each
   size, runs every state of STATES (a module: [{ id, url, act?, probe? }]), shoots the window and
   prints what `probe` measures, then stops the server it started.

     node look.cjs states.cjs            every state, six sizes
     SIZES=844x390 ONLY=b02 node look.cjs states.cjs
*/
const path = require('node:path')
const { spawn } = require('node:child_process')
const { chromium } = require('@playwright/test')

const PORT = Number(process.env.PORT ?? 6247)
const BASE = `http://localhost:${PORT}`
const OUT = __dirname
const ALL = ['390x844', '844x390', '834x1112', '1280x800', '1440x900', '1920x1080']
const SIZES = (process.env.SIZES ?? ALL.join(',')).split(',')
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
const STATES = require(path.resolve(process.argv[2] ?? path.join(__dirname, 'states.cjs')))
const ROOT = path.resolve(__dirname, '../../../../..')

const base = () => {
  const doc = document.documentElement
  const cuts = []
  for (const el of document.querySelectorAll('main *, .ui-popover *')) {
    if (!(el instanceof HTMLElement) || el.children.length > 0) continue
    if (!el.textContent || el.textContent.trim() === '') continue
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') continue
    if (el.scrollWidth > el.clientWidth + 1 && cs.overflowX !== 'visible')
      cuts.push(`${el.className}: ${el.textContent.trim().slice(0, 40)}`)
  }
  const sidePop = [...document.querySelectorAll('.ui-popover')].map(
    (p) => p.scrollWidth - p.clientWidth,
  )
  return {
    sideways: doc.scrollWidth - doc.clientWidth,
    cuts: cuts.slice(0, 5),
    popSideways: sidePop,
    scrollY: Math.round(window.scrollY),
  }
}

const up = async () => {
  for (let i = 0; i < 300; i++) {
    try {
      const r = await fetch(`${BASE}/`)
      if (r.ok) return
    } catch {
      /* not yet */
    }
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw new Error(`no server on ${PORT}`)
}

;(async () => {
  /* a build served by vite preview: a dev server reloads its page whenever anything in the tree
     changes, and other agents write into this tree while a look runs */
  const out = `e2e/out/dist-${PORT}`
  const cmd = `npx vite build --outDir ${out} --emptyOutDir && npx vite preview --outDir ${out} --port ${PORT} --strictPort`
  const server = spawn(cmd, {
    cwd: ROOT,
    shell: true,
    stdio: [
      'ignore',
      require('node:fs').openSync(path.join(OUT, 'server.log'), 'w'),
      require('node:fs').openSync(path.join(OUT, 'server.log'), 'a'),
    ],
    env: { ...process.env, HL2_DEV_PORT: String(PORT) },
  })
  try {
    await up()
    const browser = await chromium.launch()
    for (const size of SIZES) {
      const [w, h] = size.split('x').map(Number)
      const ctx = await browser.newContext({
        viewport: { width: w, height: h },
        deviceScaleFactor: 1,
        locale: 'en-AU',
        hasTouch: w < 900,
        isMobile: w < 900 && w !== 834,
      })
      const page = await ctx.newPage()
      const errors = []
      page.on('pageerror', (e) => errors.push(String(e)))
      await page.goto(`${BASE}/sign-in`, { timeout: 180_000, waitUntil: 'domcontentloaded' })
      await page.getByRole('textbox').fill('Asaf')
      await page.getByRole('button', { name: /Load the Master Price File/ }).click()
      await page.waitForURL(/\/$/, { timeout: 90_000 })
      for (const s of STATES) {
        if (ONLY && !ONLY.some((o) => s.id.startsWith(o))) continue
        await page.goto(`${BASE}${s.url}`, { timeout: 120_000, waitUntil: 'domcontentloaded' })
        await page.waitForSelector('[data-testid="catalogue"][data-read]', { timeout: 60_000 })
        await page.waitForTimeout(500)
        if (s.act) await s.act(page, BASE)
        await page.waitForTimeout(400)
        const m = await page.evaluate(base)
        const p = s.probe ? await page.evaluate(s.probe) : null
        await page.screenshot({
          path: path.join(OUT, `${s.id}-${size}.png`),
          animations: 'disabled',
        })
        console.log(`${size} ${s.id}: ${JSON.stringify(m)}${p ? ' ' + JSON.stringify(p) : ''}`)
      }
      if (errors.length) console.log(`${size} page errors: ${errors.join(' | ')}`)
      await ctx.close()
    }
    await browser.close()
  } finally {
    if (process.platform === 'win32') spawn('taskkill', ['/pid', String(server.pid), '/T', '/F'])
    else server.kill()
  }
})().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
