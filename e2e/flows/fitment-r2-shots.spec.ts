import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'

/* TEMPORARY: the round-2 fixer's screenshots, at every size (removed before the report). */
const OUT = 'docs/directions/data-round/fitment/fix-2'
const SP660 = '/fitment?boat=boat_highfield%3A513'

async function at(page: Page, url: string): Promise<void> {
  await page.goto(url)
  await expect(page.locator('[data-testid="fitment"][data-read]')).toBeVisible({ timeout: 15_000 })
  await page.waitForTimeout(600)
}

const shot = (page: Page, name: string, full = true) =>
  page.screenshot({ path: `${OUT}/${name}-${test.info().project.name}.png`, fullPage: full })

test('fitment round 2, every size', async ({ page }) => {
  test.setTimeout(240_000)
  await throughTheDoor(page)
  const measures: Record<string, unknown> = {}

  await page.goto('/fitment?maker=Highfield')
  await page.waitForTimeout(1200)
  await page
    .getByText('SP300')
    .first()
    .scrollIntoViewIfNeeded()
    .catch(() => {})
  await page.waitForTimeout(600)
  await shot(page, '00-chooser-sp300', false)

  await at(page, SP660)
  await shot(page, '01-sp660-motor')
  await shot(page, '01b-sp660-top', false)
  await page.locator('.ft-rules').scrollIntoViewIfNeeded()
  await shot(page, '01c-sp660-reasons', false)
  measures.tiles = await page.evaluate(() => {
    const tiles = [...document.querySelectorAll('.ft-tiles > .ft-tile')]
    return tiles.map((t) => Math.round(t.getBoundingClientRect().width))
  })
  measures.facts = await page.evaluate(() =>
    [...document.querySelectorAll('.ft-facts > *')].map((f) => {
      const r = f.getBoundingClientRect()
      return [Math.round(r.left), Math.round(r.top), Math.round(r.width)]
    }),
  )

  await at(page, '/fitment?boat=boat_stabicraft%3A30')
  await shot(page, '02-stabi2350-motor')
  await page.locator('.ft-tiles').scrollIntoViewIfNeeded()
  await shot(page, '02b-stabi2350-tiles', false)

  await at(page, '/fitment?boat=boat_highfield%3A513&line=trailer')
  await page.getByRole('button', { name: /^Put the GFAB .* on the quote/ }).click()
  await shot(page, '03-sp660-trailer-gfab-refused')

  await at(page, '/fitment?boat=boat_highfield%3A513&line=also')
  await shot(page, '04-sp660-also')

  await at(page, '/fitment?boat=boat_highfield%3A124&line=trailer')
  await shot(page, '08-cl340-trailer')
  measures.cl340 = await page.evaluate(() =>
    [...document.querySelectorAll('.ft-facts > *')].map((f) => {
      const r = f.getBoundingClientRect()
      return [Math.round(r.left), Math.round(r.top), Math.round(r.width)]
    }),
  )

  await at(page, '/fitment?boat=boat_highfield%3A513&all=motor')
  await shot(page, '05-sp660-all-motor', false)
  measures.keys = await page.locator('.ft-whole__keys').isVisible()

  /* the recommended pressed: the tile under the pointer stays the same tile */
  await at(page, SP660)
  const before = await page.locator('.ft-tiles > .ft-tile .ft-tile__model').allTextContents()
  await page
    .getByRole('button', { name: /^Make the Yamaha F200XC the recommended/ })
    .first()
    .click()
  await page.waitForTimeout(600)
  const after = await page.locator('.ft-tiles > .ft-tile .ft-tile__model').allTextContents()
  measures.order = { before, after }
  await shot(page, '06-sp660-recommended')
  await page
    .getByRole('button', { name: 'Undo' })
    .first()
    .click()
    .catch(() => {})
  await page.waitForTimeout(400)

  /* the build: started here, the GFAB pressed on */
  await at(page, SP660)
  await page.getByRole('button', { name: 'Start the quote' }).click()
  await expect(page.getByTestId('configurator')).toBeVisible({ timeout: 15_000 })
  await page.waitForTimeout(800)
  const gfab = page.getByRole('button', {
    name: /GFAB Tandem Axel Trailer t\/s Highfield Sport 660/,
  })
  measures.gfabButtons = await gfab.count()
  if ((await gfab.count()) > 0) {
    await gfab.first().scrollIntoViewIfNeeded()
    await gfab.first().click()
    await page.waitForTimeout(800)
  }
  measures.alert = await page.getByRole('alert').allTextContents()
  measures.total = await page
    .locator('body')
    .innerText()
    .then((t) => /\$111,778/.test(t))
  await shot(page, '07-build-gfab-refused', false)

  test.info().annotations.push({ type: 'measures', description: JSON.stringify(measures) })
  console.log(test.info().project.name, JSON.stringify(measures))
})
