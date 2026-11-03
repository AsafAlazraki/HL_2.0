/* A one-off probe: open a catalogue address through the door and print what a script asks. */
const { chromium } = require('@playwright/test')
const BASE = process.env.BASE ?? 'http://localhost:6243'
;(async () => {
  const browser = await chromium.launch()
  const [w, h] = (process.env.SIZE ?? '1440x900').split('x').map(Number)
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage()
  page.on('console', (m) => {
    if (m.type() === 'error' || process.env.LOGS) console.log('console:', m.text().slice(0, 200))
  })
  if (process.env.INIT) await page.addInitScript(process.env.INIT)
  page.on('pageerror', (e) => console.log('pageerror:', String(e).slice(0, 300)))
  await page.goto(`${BASE}/sign-in`, { timeout: 180_000, waitUntil: 'domcontentloaded' })
  await page.getByRole('textbox').fill('Asaf')
  await page.getByRole('button', { name: /Load the Master Price File/ }).click()
  await page.waitForURL(/\/$/, { timeout: 60_000 })
  await page.goto(`${BASE}${process.env.AT}`, { timeout: 120_000, waitUntil: 'domcontentloaded' })
  await page.waitForSelector('[data-testid="catalogue"][data-read]', { timeout: 60_000 })
  await page.waitForTimeout(Number(process.env.WAIT ?? 2000))
  const out = await page.evaluate(process.env.JS)
  console.log(JSON.stringify(out, null, 1))
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT })
  await browser.close()
})()
