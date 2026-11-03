/* THE BUILT CHANDLERY, SHOT AND MEASURED at the six sizes, through the real door with the real
   Master Price File. Run against a server of the app: BASE=http://localhost:<port> node shoot.cjs
   ONLY=<state ids, comma> SIZES=<390x844,...> narrow a run. Each state is shot at the window and,
   where FULL is set, whole. Every state is measured for sideways scroll, text cut by its own box
   and controls under 24px, and the figures are printed. */
const path = require('node:path')
const { chromium } = require('@playwright/test')

const BASE = process.env.BASE ?? 'http://localhost:6243'
const OUT = __dirname
const ALL_SIZES = ['390x844', '844x390', '834x1112', '1280x800', '1440x900', '1920x1080']
const SIZES = (process.env.SIZES ?? ALL_SIZES.join(',')).split(',')
const STATES = [
  ['01-front', '/catalogue'],
  ['02-anchoring-boat', '/catalogue?aisle=anchoring&boat=boat_stacer%3A30'],
  ['03-line-open', '/catalogue?aisle=anchoring&boat=boat_stacer%3A30&open=parts%3A38'],
  ['04-sounders', '/catalogue?aisle=sounders'],
  ['05-propellers', '/catalogue?aisle=propellers'],
  ['06-trailer-fitted-only', '/catalogue?aisle=trailer'],
  ['07-find-lowrance', '/catalogue?find=lowrance'],
  ['08-find-code', '/catalogue?find=SG002'],
  ['09-unsorted', '/catalogue?aisle=unsorted'],
  ['10-suppliers', '/catalogue?view=suppliers'],
  ['11-wrong-aisle', '/catalogue?aisle=nope'],
  ['12-card-open', '/catalogue?aisle=radios&open=parts%3A537'],
  ['13-without', '/catalogue?aisle=sounders&show=without&supplier=GAR'],
  ['14-workshop', '/catalogue?aisle=workshop'],
]
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null

const measure = () => {
  const doc = document.documentElement
  const sideways = doc.scrollWidth - doc.clientWidth
  const cuts = []
  for (const el of document.querySelectorAll('main *')) {
    if (!(el instanceof HTMLElement) || el.children.length > 0) continue
    if (!el.textContent || el.textContent.trim() === '') continue
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') continue
    if (
      el.scrollWidth > el.clientWidth + 1 &&
      cs.overflowX !== 'visible' &&
      cs.textOverflow !== 'ellipsis'
    )
      cuts.push(`${el.className}: ${el.textContent.trim().slice(0, 40)}`)
  }
  const small = []
  for (const el of document.querySelectorAll(
    'main button, main a, main input, main [role="button"]',
  )) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    if (getComputedStyle(el).opacity === '0') continue
    if (r.height < 24 || r.width < 24)
      small.push(`${el.tagName}.${el.className} ${Math.round(r.width)}x${Math.round(r.height)}`)
  }
  const h1 = document.querySelector('main h1')
  return {
    sideways,
    cuts: cuts.slice(0, 6),
    small: small.slice(0, 6),
    h1Top: h1 ? Math.round(h1.getBoundingClientRect().top) : null,
    scrollY: window.scrollY,
  }
}

;(async () => {
  const browser = await chromium.launch()
  for (const size of SIZES) {
    const [w, h] = size.split('x').map(Number)
    const ctx = await browser.newContext({
      viewport: { width: w, height: h },
      deviceScaleFactor: 1,
      locale: 'en-AU',
      hasTouch: w < 900,
      isMobile: w < 900,
    })
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    await page.goto(`${BASE}/sign-in`, { timeout: 180_000, waitUntil: 'domcontentloaded' })
    await page.getByRole('textbox').fill('Asaf')
    await page.getByRole('button', { name: /Load the Master Price File/ }).click()
    await page.waitForURL(/\/$/, { timeout: 60_000 })
    for (const [id, at] of STATES) {
      if (ONLY && !ONLY.some((o) => id.startsWith(o))) continue
      await page.goto(`${BASE}${at}`, { timeout: 120_000, waitUntil: 'domcontentloaded' })
      await page.waitForSelector('[data-testid="catalogue"][data-read]', { timeout: 60_000 })
      await page.waitForTimeout(600)
      const m = await page.evaluate(measure)
      await page.screenshot({
        path: path.join(OUT, `${id}-${size}.png`),
        timeout: 120_000,
        animations: 'disabled',
      })
      if (process.env.FULL)
        await page.screenshot({ path: path.join(OUT, `${id}-full-${size}.png`), fullPage: true })
      console.log(
        `${size} ${id}: sideways ${m.sideways}, cut ${m.cuts.length}${m.cuts.length ? ' ' + JSON.stringify(m.cuts) : ''}, small ${m.small.length}${m.small.length ? ' ' + JSON.stringify(m.small) : ''}, h1 at ${m.h1Top}`,
      )
      if (process.env.SCROLL && id.match(/anchoring|sounders|propellers/)) {
        await page.mouse.wheel(0, 1400)
        await page.waitForTimeout(500)
        await page.screenshot({
          path: path.join(OUT, `${id}-scrolled-${size}.png`),
          timeout: 120_000,
          animations: 'disabled',
        })
      }
    }
    if (errors.length) console.log(`${size} page errors: ${errors.join(' | ')}`)
    await ctx.close()
  }
  await browser.close()
})()
