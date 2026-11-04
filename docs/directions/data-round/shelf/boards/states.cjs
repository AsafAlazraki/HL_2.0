/* Shoot each drawn state (each <main>) on its own: node states.cjs a 1440 */
const path = require('path')
const { chromium } = require(path.resolve(__dirname, '../../../../../node_modules/playwright'))
const [id, w = '1440'] = process.argv.slice(2)
;(async () => {
  const b = await chromium.launch()
  const ctx = await b.newContext({
    viewport: { width: Number(w), height: 900 },
    deviceScaleFactor: 1,
  })
  const p = await ctx.newPage()
  await p.goto(require('url').pathToFileURL(path.join(__dirname, id + '.html')).href)
  await p.waitForLoadState('networkidle')
  await p.addStyleTag({ content: '.bar,.dock,.tools,.steps{position:static!important}' })
  const mains = await p.$$('main')
  for (let i = 1; i < mains.length; i++) {
    await mains[i].screenshot({
      path: path.join(__dirname, 'shots', `${id}-state${i + 1}-${w}.png`),
    })
  }
  console.log(id, w, mains.length)
  await b.close()
})()
