/* Shoot each drawn state of a board's notes at the desk, to read: node states-shot.cjs a */
const path = require('path')
const { chromium } = require(path.resolve(__dirname, '../../../../../node_modules/playwright'))
;(async () => {
  const id = process.argv[2]
  const w = +(process.argv[3] || 1440)
  const b = await chromium.launch()
  const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage()
  await p.goto(require('url').pathToFileURL(path.join(__dirname, id + '.html')).href)
  await p.waitForLoadState('networkidle')
  await p.addStyleTag({ content: '.bar { display: none !important; }' })
  const rows = await p.$$('.notes .state')
  let i = 0
  for (const r of rows) {
    await r.scrollIntoViewIfNeeded()
    await p.waitForTimeout(150)
    await r.screenshot({ path: path.join(__dirname, 'shots', `tmp-${id}-state-${++i}.png`) })
  }
  console.log(id, i, 'states')
  await b.close()
})()
