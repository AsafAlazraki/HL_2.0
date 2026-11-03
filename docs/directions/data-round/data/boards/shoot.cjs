/* Shoot the boards at the six sizes: node shoot.cjs [a b c]. Each shot is the window; 1440 and
   390 also get the whole page. It measures sideways scroll and text under 12px as it goes. */
const path = require('path')
const { chromium } = require(path.resolve(__dirname, '../../../../../node_modules/playwright'))
const SIZES = [[390, 844], [844, 390], [834, 1112], [1280, 800], [1440, 900], [1920, 1080]]
const which = process.argv.slice(2).length ? process.argv.slice(2) : ['a', 'b', 'c']
;(async () => {
  const browser = await chromium.launch()
  try {
    for (const id of which) {
      for (const [w, hgt] of SIZES) {
        const ctx = await browser.newContext({ viewport: { width: w, height: hgt }, deviceScaleFactor: 1 })
        const page = await ctx.newPage()
        await page.goto(require('url').pathToFileURL(path.join(__dirname, id + '.html')).href)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(200)
        const m = await page.evaluate(() => {
          const sw = document.documentElement.scrollWidth
          const notes = document.querySelector('.notes')
          const top = notes ? notes.getBoundingClientRect().top + scrollY : Infinity
          let small = 0, cut = 0
          for (const el of document.querySelectorAll('main *, .c-rail *')) {
            const r = el.getBoundingClientRect()
            if (r.top + scrollY > top) continue
            const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
            if (!own) continue
            const fs = parseFloat(getComputedStyle(el).fontSize)
            if (fs < 12) small++
            if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== 'visible') cut++
          }
          return { sw, iw: innerWidth, small, cut, screenH: Math.round(top) }
        })
        const name = `${id}-${w}x${hgt}`
        await page.screenshot({ path: path.join(__dirname, 'shots', name + '.png') })
        if (w === 1440 || w === 390) await page.screenshot({ path: path.join(__dirname, 'shots', name + '-full.png'), fullPage: true })
        console.log(name, JSON.stringify(m))
        await ctx.close()
      }
    }
  } finally {
    await browser.close()
  }
})().catch((e) => { console.error(e); process.exit(1) })
