import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { HOME_READY } from '../routes'

/* ============================================================
   THE BOAT'S DOOR, PHOTOGRAPHED AT EVERY SIZE — the screenshots the fit-flow round reads by
   eye, taken only when `HL2_DOOR_SHOTS` is set, so the gate never writes into docs. They land
   in docs/directions/fit-flow/build-door/, each named for its state and its window. Every press
   is a person's press, through the real door on the real price list; nothing is planted.
   ============================================================ */

const OUT = 'docs/directions/fit-flow/build-door'

test.skip(!process.env.HL2_DOOR_SHOTS, 'screenshots are taken on request')

const sizeOf = (page: Page) => `${page.viewportSize()!.width}x${page.viewportSize()!.height}`

test('the door, every state, photographed', async ({ page }) => {
  test.setTimeout(300_000)
  const size = sizeOf(page)
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  const shot = async (name: string, fullPage = false) => {
    await page.waitForTimeout(700)
    await page.screenshot({ path: `${OUT}/${name}-${size}.png`, fullPage })
  }

  await throughTheDoor(page)
  await expect(page.locator(HOME_READY)).toBeVisible({ timeout: 30_000 })
  await page.waitForTimeout(1_500)
  await shot('01-home')
  await shot('01-home-full', true)

  /* the boats' row in view, and one card's What fits under the pointer or the keyboard */
  const row = page.getByRole('region', { name: 'Start from the boat' })
  await row.scrollIntoViewIfNeeded()
  await shot('02-home-boats')
  const fits = row.getByRole('button', { name: /^What fits: / }).nth(3)
  await fits.focus()
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Tab')
  await shot('03-home-card-focus')

  /* Find: the exact name first, every boat with its two doors */
  await page.keyboard.press('Control+k')
  const finder = page.getByTestId('shell-finder')
  await expect(finder).toBeVisible()
  await page.keyboard.type('Patrol 600')
  await expect(finder.locator('.way-boat').first()).toBeVisible({ timeout: 15_000 })
  await shot('04-find-patrol-600')

  await page.keyboard.press('Control+a')
  await page.keyboard.type('Stabicraft PA 600')
  await expect(finder.getByText(/^No Stabicraft is called/)).toBeVisible({ timeout: 15_000 })
  await shot('05-find-stabicraft-pa-600')

  await page.keyboard.press('Control+a')
  await page.keyboard.type('motors for PA 600')
  await expect(finder.getByText(/^The motors that go on a boat/)).toBeVisible({ timeout: 15_000 })
  await shot('06-find-motors-for-pa-600')

  /* What fits pressed from Find: the boat's page, Home lit */
  await page.keyboard.press('Control+a')
  await page.keyboard.type('Patrol 600')
  await finder
    .getByRole('option', { name: 'What fits the Highfield Patrol 600', exact: true })
    .click()
  await expect(page).toHaveURL(/from=home/)
  await page.waitForTimeout(1_500)
  await shot('07-fitment-from-home')

  /* the picker's near miss, and All makers keeping the words */
  await page.goto('/quote/new?brand=boat_stabicraft')
  await page.getByLabel(/Find a model/).fill('PA 600')
  await expect(page.locator('#picker-find-said')).toContainText('No model from Stabicraft')
  await shot('08-picker-near-miss')
  await page
    .getByRole('button', { name: /^All makers/ })
    .filter({ visible: true })
    .first()
    .click()
  await expect(page.getByLabel(/Find a model/)).toHaveValue('PA 600')
  await shot('09-picker-all-makers-kept')

  expect(errors, 'no page error').toEqual([])
})
