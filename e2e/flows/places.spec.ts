import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'

/* ============================================================
   A PLACE'S OWN PAGE, WALKED — what the rulers cannot see: that Data
   is the one register of the lists and a place's page is opened from
   its spread there, with Data lit; that the old address lands on Data;
   that a press lands where it says; and that what a place's Settings
   writes is on its page after a reload, and gone again after Undo.
   Every press is checked for WHERE IT LANDS.

   ONE REGISTER (2026-10-30, built-critique-m4.md major 1): the wall of
   place cards at /places was Data's 25 lists drawn a second time
   behind the same door, so it is gone.
   ============================================================ */

async function toPlace(page: Page, path: string): Promise<void> {
  await page.goto(path)
  await expect(page.locator('[data-testid="place"][data-read]')).toBeVisible({ timeout: 30_000 })
}

const lit = (page: Page) => page.getByTestId('shell-pill').getByRole('link', { name: /^Data( |$)/ })

test.beforeEach(async ({ page }) => {
  test.setTimeout(120_000)
  await throughTheDoor(page)
})

test('the old address of every place lands on Data, the one register, with nothing drawn twice', async ({
  page,
}) => {
  await page.goto('/places')
  await expect(page).toHaveURL(/\/data$/)
  await expect(page.locator('[data-testid="data"][data-read]')).toBeVisible({ timeout: 30_000 })
  await expect(lit(page)).toHaveAttribute('aria-current', 'page')
  /* no room behind the price list is a second register of its lists */
  await expect(
    page.getByRole('navigation', { name: 'Behind the price list' }).getByRole('link', {
      name: /^Places/,
    }),
  ).toHaveCount(0)
})

test('a maker’s spread on Data opens its own page, which goes back to the spread', async ({
  page,
}) => {
  await page.goto('/data')
  await expect(page.locator('[data-testid="data"][data-read]')).toBeVisible({ timeout: 30_000 })
  /* the maker's own press on its plate, never a line of what goes with it inside the plate */
  await page.getByRole('button', { name: /^Stacer · / }).click()
  const spread = page.getByTestId('data-page')
  await expect(spread.getByRole('heading', { name: 'Stacer', exact: true })).toBeVisible()
  await spread.getByRole('link', { name: 'Stacer’s own page' }).click()
  await expect(page).toHaveURL(/\/places\/boat_stacer$/)
  await expect(page.locator('[data-testid="place"][data-place="boat_stacer"]')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: /Stacer/ })).toBeVisible()
  await expect(lit(page)).toHaveAttribute('aria-current', 'page')
  /* and back lands on the spread it came from, Stacer still open */
  await page.getByRole('link', { name: 'Back to the price list' }).click()
  await expect(page).toHaveURL(/\/data\?at=boat_stacer$/)
  await expect(
    page.getByTestId('data-page').getByRole('heading', { name: 'Stacer', exact: true }),
  ).toBeVisible({
    timeout: 15_000,
  })
})

test('what a place goes with opens that place', async ({ page }) => {
  await toPlace(page, '/places/boat_stacer')
  await page
    .getByRole('complementary')
    .getByRole('button', { name: /^Yamaha Outboards/ })
    .click()
  await expect(page).toHaveURL(/\/places\/mot_yamaha$/)
  await expect(page.locator('[data-testid="place"][data-place="mot_yamaha"]')).toBeVisible()
})

test('the act on a boat maker’s head starts a quote on that maker', async ({ page }) => {
  await toPlace(page, '/places/boat_stacer')
  await page.getByRole('link', { name: /Quote a Stacer/ }).click()
  await expect(page).toHaveURL(/\/quote\/new\?brand=boat_stacer$/)
})

test('a line and a photograph set in Settings are on the page after a reload, and Undo takes the line off', async ({
  page,
}) => {
  await toPlace(page, '/places/boat_stacer?tab=settings')
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
  /* and the line comes off with one step back */
  await page.getByRole('textbox', { name: 'What is Stacer to Northside, in a line?' }).fill('')
  await page.getByRole('button', { name: 'Take the line off' }).click()
  /* the step is said first; its Undo is pressed once the card saying it has settled */
  await expect(page.getByText('Stacer’s line is taken off.')).toBeVisible()
  await expect(page.locator('.pl-livery__line')).toHaveCount(0)
  await page.getByRole('button', { name: 'Undo' }).click()
  await expect(page.locator('.pl-livery__line')).toHaveText('Our everyday tinnies')
})
