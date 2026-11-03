/* How long each catalogue address takes to draw, through the door, at one size: the time from the
   address typed to the screen's own ready mark. BASE, SIZE and READY as for probe.cjs. */
const { chromium } = require('@playwright/test')
const BASE = process.env.BASE ?? 'http://localhost:6244'
const AT = (process.env.ATS ?? '/catalogue?find=lowrance').split(',')
;(async () => {
  const browser = await chromium.launch()
  const [w, h] = (process.env.SIZE ?? '390x844').split('x').map(Number)
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    isMobile: w < 900,
    hasTouch: w < 900,
  })
  const page = await ctx.newPage()
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
  for (const at of AT) {
    const t0 = Date.now()
    await page.goto(`${BASE}${at}`)
    await page.waitForSelector('[data-testid="catalogue"][data-read]', { timeout: 60_000 })
    const t1 = Date.now()
    const longTasks = await page.evaluate(() => performance.getEntriesByType('longtask').length)
    console.log(`${at}: ready in ${t1 - t0} ms (${longTasks} long tasks)`)
  }
  await browser.close()
})()
