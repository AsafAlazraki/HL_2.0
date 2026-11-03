/* How long pressing an aisle on the front takes to draw it, through the door, with CSS a run may
   add (to find what costs the time). BASE, SIZE, AISLE and CSS as for time.cjs. */
const { chromium } = require('@playwright/test')
const BASE = process.env.BASE ?? 'http://localhost:6244'
;(async () => {
  const browser = await chromium.launch()
  const [w, h] = (process.env.SIZE ?? '1280x800').split('x').map(Number)
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage()
  if (process.env.CSS)
    await page.addInitScript((css) => {
      document.addEventListener('DOMContentLoaded', () => {
        const s = document.createElement('style')
        s.textContent = css
        document.head.append(s)
      })
    }, process.env.CSS)
  await page.goto(`${BASE}/sign-in`)
  await page.getByRole('textbox').fill('Asaf')
  await page.getByRole('button', { name: /Load the Master Price File/ }).click()
  await page.waitForURL(/\/$/, { timeout: 60_000 })
  const out = []
  for (let i = 0; i < 2; i++) {
    await page.goto(`${BASE}/catalogue`)
    await page.waitForSelector('[data-testid="catalogue-door"]', { timeout: 60_000 })
    await page.waitForTimeout(300)
    const t0 = await page.evaluate(() => performance.now())
    await page.getByRole('link', { name: new RegExp(`^${process.env.AISLE ?? 'Radios'}`) }).click()
    await page.waitForSelector('[data-testid="catalogue-aisle"]', { timeout: 120_000 })
    const t1 = await page.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => r(performance.now()))),
    )
    out.push(Math.round(t1 - t0))
  }
  console.log(`${process.env.CSS || 'as built'}: ${out.join(', ')} ms`)
  await browser.close()
})()
