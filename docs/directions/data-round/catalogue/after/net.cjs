/* What one catalogue address fetches, through the door: each response's size and time. */
const { chromium } = require('@playwright/test')
const BASE = process.env.BASE ?? 'http://localhost:6244'
;(async () => {
  const browser = await chromium.launch()
  const [w, h] = (process.env.SIZE ?? '390x844').split('x').map(Number)
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage()
  await page.goto(`${BASE}/sign-in`)
  await page.getByRole('textbox').fill('Asaf')
  await page.getByRole('button', { name: /Load the Master Price File/ }).click()
  await page.waitForURL(/\/$/, { timeout: 60_000 })
  const seen = []
  page.on('requestfinished', async (r) => {
    const t = r.timing()
    const s = await r.sizes().catch(() => ({ responseBodySize: 0 }))
    seen.push({
      url: r.url().slice(-50),
      ms: Math.round(t.responseEnd),
      kb: Math.round(s.responseBodySize / 1024),
    })
  })
  const t0 = Date.now()
  await page.goto(`${BASE}${process.env.AT}`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('[data-testid="catalogue"][data-read]')
  const t1 = Date.now()
  await page.waitForLoadState('load')
  const t2 = Date.now()
  console.log(`drawn ${t1 - t0} ms, load ${t2 - t0} ms, ${seen.length} requests`)
  console.log(seen.sort((a, b) => b.ms - a.ms).slice(0, 8))
  await browser.close()
})()
