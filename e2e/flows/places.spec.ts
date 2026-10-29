import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'

/* ============================================================
   PLACES, WALKED — what the rulers cannot see: that the door lands
   here with Data lit, that a card's figure is the figure /data prints
   for the same list, that a press lands where it says, and that what a
   place's Settings writes is on its card after a reload, and gone again
   after Undo. Every press is checked for WHERE IT LANDS.
   ============================================================ */

async function toPlaces(page: Page, path = '/places'): Promise<void> {
  await page.goto(path)
  await expect(page.locator('[data-read]').first()).toBeVisible({ timeout: 30_000 })
}

const card = (page: Page, name: RegExp) => page.getByRole('button', { name })

test.beforeEach(async ({ page }) => {
  test.setTimeout(120_000)
  await throughTheDoor(page)
})

test('Data’s head opens Places, and the pill keeps Data lit', async ({ page }) => {
  await page.goto('/data')
  await expect(page.locator('[data-testid="data"][data-read]')).toBeVisible({ timeout: 30_000 })
  await page
    .getByRole('navigation', { name: 'Behind the price list' })
    .getByRole('link', { name: /^Places — / })
    .click()
  await expect(page).toHaveURL(/\/places$/)
  await expect(page.locator('[data-testid="places"][data-read] .pl-card').first()).toBeVisible()
  await expect(
    page.getByTestId('shell-pill').getByRole('link', { name: /^Data( |$)/ }),
  ).toHaveAttribute('aria-current', 'page')
})

test('a card prints the figure /data prints for the same list', async ({ page }) => {
  await toPlaces(page)
  const parts = await card(page, /^Parts & Accessories · /).getAttribute('aria-label')
  const holds = /· ([\d,]+ products in [\d,]+ categories)/.exec(parts ?? '')?.[1]
  expect(holds, parts ?? '').toBeTruthy()
  await page.goto('/data')
  await expect(page.locator('[data-testid="data"][data-read]')).toBeVisible({ timeout: 30_000 })
  const [count] = holds!.split(' in ')
  await expect(page.getByText(count!, { exact: true }).first()).toBeVisible()
})

test('a card opens its place, and what it goes with opens that place', async ({ page }) => {
  await toPlaces(page)
  await card(page, /^Stacer · /).click()
  await expect(page).toHaveURL(/\/places\/boat_stacer$/)
  await expect(page.getByRole('heading', { level: 1, name: /Stacer/ })).toBeVisible()
  await page
    .getByRole('complementary')
    .getByRole('button', { name: /^Yamaha Outboards/ })
    .click()
  await expect(page).toHaveURL(/\/places\/mot_yamaha$/)
  await expect(page.locator('[data-testid="place"][data-place="mot_yamaha"]')).toBeVisible()
})

test('the act on a boat maker’s head starts a quote on that maker', async ({ page }) => {
  await toPlaces(page, '/places/boat_stacer')
  await page.getByRole('link', { name: /Quote a Stacer/ }).click()
  await expect(page).toHaveURL(/\/quote\/new\?brand=boat_stacer$/)
})

test('a line and a photograph set in Settings are on the card after a reload, and Undo takes the line off', async ({
  page,
}) => {
  await toPlaces(page, '/places/boat_stacer?tab=settings')
  await page
    .getByRole('textbox', { name: 'What is Stacer to Northside, in a line?' })
    .fill('Our everyday tinnies')
  await page.getByRole('button', { name: 'Keep this line' }).click()
  await page.getByRole('button', { name: 'Stacer 309 Skimma on the water' }).click()
  /* the write is behind by a moment; give it the moment, then read this computer's copy back */
  await page.waitForTimeout(800)
  await page.reload()
  await expect(page.locator('[data-testid="place"][data-read]')).toBeVisible({ timeout: 30_000 })
  await expect(page.locator('.pl-livery__line')).toHaveText('Our everyday tinnies')
  await expect(page.locator('.pl-livery .pl-hero__caption')).toHaveText(
    'Stacer 309 Skimma on the water',
  )
  await toPlaces(page)
  const stacer = page.locator('[data-place="boat_stacer"]')
  await expect(stacer.getByText('Our everyday tinnies')).toBeVisible()
  await expect(stacer.locator('.pl-hero__caption')).toHaveText('Stacer 309 Skimma on the water')
  /* and the line comes off with one step back, from Settings */
  await toPlaces(page, '/places/boat_stacer?tab=settings')
  await page.getByRole('textbox', { name: 'What is Stacer to Northside, in a line?' }).fill('')
  await page.getByRole('button', { name: 'Take the line off' }).click()
  /* the step is said first; its Undo is pressed once the card saying it has settled */
  await expect(page.getByText('Stacer’s line is taken off.')).toBeVisible()
  await expect(page.locator('.pl-livery__line')).toHaveCount(0)
  await page.getByRole('button', { name: 'Undo' }).click()
  await expect(page.locator('.pl-livery__line')).toHaveText('Our everyday tinnies')
})
