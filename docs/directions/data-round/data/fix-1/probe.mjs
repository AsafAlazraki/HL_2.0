/* A probe of one address on the sheet at one size: where the row it names stands. */
import { createServer } from 'vite'
import { chromium } from '@playwright/test'
const PORT = 6238
const server = await createServer({ server: { port: PORT, strictPort: true, hmr: false }, logLevel: 'error' })
await server.listen()
const BASE = `http://localhost:${PORT}`
const browser = await chromium.launch()
try {
  for (const [w, h, touch] of [[834, 1112, true]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/sign-in`, { timeout: 180_000 })
    await page.getByRole('textbox').fill('Asaf')
    await page.getByRole('button', { name: /Load the Master Price File/ }).click()
    await page.waitForURL(/\/$/, { timeout: 90_000 })
    for (const url of [process.env.URL1 ?? '/data/rig_kits?at=rig_kits%3A609', process.env.URL2 ?? '/data/parts?at=parts%3A300']) {
      await page.goto(`${BASE}${url}`)
      await page.waitForTimeout(6000)
      const r = await page.evaluate((word) => {
        const sel = [...document.querySelectorAll('[aria-selected="true"]')].map((e) => Math.round(e.getBoundingClientRect().top) + ':' + (e.textContent || '').trim().slice(0, 50))
        const hits = [...document.querySelectorAll('main *')].filter((e) => e.children.length === 0 && (e.textContent || '').includes(word)).map((e) => Math.round(e.getBoundingClientRect().top))
        return { url: location.pathname + location.search, selected: sel.slice(0, 3), word: hits.slice(0, 4) }
      }, url.includes('rig') ? 'Jeanneau DB/43' : 'xx')
      console.log(w, h, touch ? 'touch' : 'mouse', JSON.stringify(r))
    }
    await ctx.close()
  }
} finally {
  await browser.close()
  await server.close()
}
