/* Where the time goes drawing one catalogue address: a CPU profile of the navigation, its heaviest
   functions by self time. BASE and AT as for probe.cjs. */
const { chromium } = require('@playwright/test')
const BASE = process.env.BASE ?? 'http://localhost:6243'
;(async () => {
  const browser = await chromium.launch()
  const page = await (
    await browser.newContext({ viewport: { width: 1280, height: 800 } })
  ).newPage()
  await page.goto(`${BASE}/sign-in`, { timeout: 180_000 })
  await page.getByRole('textbox').fill('Asaf')
  await page.getByRole('button', { name: /Load the Master Price File/ }).click()
  await page.waitForURL(/\/$/, { timeout: 120_000 })
  await page.goto(`${BASE}/catalogue`, { timeout: 120_000 })
  await page.waitForSelector('[data-testid="catalogue"][data-read]', { timeout: 120_000 })
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Profiler.enable')
  await cdp.send('Profiler.setSamplingInterval', { interval: 500 })
  await cdp.send('Profiler.start')
  await page.getByRole('link', { name: new RegExp(`^${process.env.AISLE ?? 'Radios'}`) }).click()
  await page.waitForSelector('[data-testid="catalogue-aisle"]', { timeout: 120_000 })
  const { profile } = await cdp.send('Profiler.stop')
  const self = new Map()
  const dt = profile.timeDeltas
  const byId = new Map(profile.nodes.map((n) => [n.id, n]))
  profile.samples.forEach((id, i) => {
    const n = byId.get(id)
    const key = `${n.callFrame.functionName || '(anon)'} ${n.callFrame.url.split('/').pop()}:${n.callFrame.lineNumber}`
    self.set(key, (self.get(key) ?? 0) + (dt[i] ?? 0) / 1000)
  })
  console.log(
    [...self]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([k, v]) => `${Math.round(v)} ms  ${k}`)
      .join('\n'),
  )
  await browser.close()
})()
