import { test } from '@playwright/test'
import { startAQuote, issueIt, DEEPEST, MODEL } from '../mint'
const OUT = 'C:/Users/Asaf/AppData/Local/Temp/claude/C--Users-Asaf-OneDrive-Desktop-HL-2-0/e815a653-d618-4431-a639-2a75ffd10b82/scratchpad/diag'
test('diag give', async ({ page }, info) => {
  test.setTimeout(150_000)
  const p = info.project.name
  await startAQuote(page)
  console.log('DEEPEST', DEEPEST.table.id, MODEL)
  await page.screenshot({ path: `${OUT}/${p}-start.png` })
  console.log('TALLY-BEFORE', (await page.getByTestId('running-total').innerHTML()).slice(0, 1500))
  const mb = await page.locator('.cfg-mast').boundingBox()
  await issueIt(page)
  const ma = await page.locator('.cfg-mast').boundingBox()
  console.log('MAST', JSON.stringify(mb), JSON.stringify(ma))
  console.log('MASTTEXT', (await page.locator('.cfg-mast').innerText()).replace(/\s+/g, ' '))
  console.log('TOTAL-COUNT', await page.getByTestId('running-total').count())
  if (await page.getByTestId('running-total').count()) console.log('TALLY-AFTER', (await page.getByTestId('running-total').innerHTML()).slice(0, 1500))
  await page.screenshot({ path: `${OUT}/${p}-given.png`, fullPage: true })
})
