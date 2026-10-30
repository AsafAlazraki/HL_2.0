import { expect, test, type Locator, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { cameToRest, pickAndStart } from '../mint'

/* ============================================================
   THE CHANDLERY, WALKED — direction B of docs/directions/choosing.md.

   On a Stacer 519 Sea Ranger SDF started at the picker's act, the
   dealer opens Dealer fit, opens the Batteries & power aisle and puts
   five parts on the quote: three by the Add press, one dragged onto
   the total at the bottom left, and one by the keyboard (Space lifts
   it, the right arrow takes it to the quote, Space puts it on). Then
   one is taken off from the basket, and Ctrl Z puts it back — every
   add and remove is a quote command with an inverse.

   Nothing is typed into an assertion that the screen could say
   instead: the parts are whichever the aisle shows first, and each
   step is proved by the basket's own count and the total moving.
   ============================================================ */

const LOOK = process.env.HL2_LOOK ?? ''
const shot = async (page: Page, name: string, project: string): Promise<void> => {
  if (LOOK !== '') await page.screenshot({ path: `${LOOK}/${project}-${name}.png` })
}

const basket = (page: Page): Locator =>
  page.getByRole('region', { name: 'Parts on this quote' }).getByRole('listitem')
const aisle = (page: Page): Locator =>
  page.getByTestId('chandlery').getByRole('region', { name: 'Batteries & power' })
const total = async (page: Page): Promise<string> =>
  (await page.getByTestId('running-total').locator('.cfg-tally__fig').innerText()).trim()

async function openTheAisle(page: Page): Promise<void> {
  await throughTheDoor(page)
  await pickAndStart(page, 'boat_stacer', '519 Sea Ranger SDF')
  await cameToRest(page)
  await page.getByRole('button', { name: /^04 / }).click()
  await cameToRest(page)
  await page.getByRole('button', { name: /^Batteries & power/ }).click()
  await expect(aisle(page)).toBeVisible()
  await expect(page).toHaveURL(/aisle=power/)
}

test('three parts by press, one by drag, one by keyboard, and one taken off', async ({
  page,
}, info) => {
  test.setTimeout(240_000)
  await openTheAisle(page)
  await expect(basket(page)).toHaveCount(0)

  /* THREE BY PRESS: Add on the first card still off the quote, each time */
  for (let n = 1; n <= 3; n += 1) {
    const before = await total(page)
    await aisle(page)
      .getByRole('button', { name: /^Add the .* to the quote$/ })
      .first()
      .click()
    await expect(basket(page)).toHaveCount(n)
    await expect.poll(() => total(page)).not.toBe(before)
  }

  /* ONE BY DRAG: the next card carried onto the total, which says where to let go */
  const card = aisle(page).locator('.cat-part:not([data-on])').first()
  /* in the middle of the window, clear of the pill and of anything that sticks */
  await card.evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await cameToRest(page)
  const from = (await card.locator('.cat-part__name').boundingBox())!
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
  await page.mouse.down()
  await page.mouse.move(from.x + from.width / 2 + 20, from.y + from.height / 2 + 20, { steps: 4 })
  const drop = page.getByText('Drop it here to put it on the quote')
  await expect(drop).toBeVisible()
  const onto = (await page.getByTestId('running-total').boundingBox())!
  await page.mouse.move(onto.x + onto.width / 2, onto.y + onto.height / 2, { steps: 12 })
  await expect(drop).toBeVisible()
  await page.mouse.up()
  await expect(basket(page)).toHaveCount(4)

  /* ONE BY KEYBOARD: the grip takes the caret; Space lifts, the right arrow goes to the quote,
     Space puts it on */
  const grip = aisle(page).getByRole('button', { name: /^Lift the .* to drag it to the quote$/ })
  await grip.first().focus()
  await page.keyboard.press('Space')
  await expect(page.getByText('Drop it here to put it on the quote')).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Space')
  await expect(basket(page)).toHaveCount(5)
  await shot(page, 'five-on', info.project.name)

  /* ONE TAKEN OFF, from the basket, and put back by Ctrl Z */
  const before = await total(page)
  await basket(page)
    .first()
    .getByRole('button', { name: /^Take the .* off the quote$/ })
    .click()
  await expect(basket(page)).toHaveCount(4)
  await expect.poll(() => total(page)).not.toBe(before)
  await page.locator('body').click({ position: { x: 2, y: 2 } })
  await page.keyboard.press('Control+z')
  await expect(basket(page)).toHaveCount(5)
  await expect.poll(() => total(page)).toBe(before)
})

test('the catalogue is the same aisles on their own, behind Data', async ({ page }) => {
  test.setTimeout(120_000)
  await throughTheDoor(page)
  /* through the shell's one list: Data, then its room, as a dealer reaches it */
  await page.getByTestId('shell-pill').getByRole('link', { name: /Data/ }).click()
  await page
    .getByRole('navigation', { name: 'Behind the price list' })
    .getByRole('link', { name: /Catalogue/ })
    .click()
  await expect(page).toHaveURL(/\/catalogue$/)
  await expect(page.getByTestId('chandlery')).toBeVisible({ timeout: 30_000 })
  /* every aisle at once, counted: eighteen and Not sorted yet */
  await expect(page.getByRole('region', { name: 'The aisles' }).getByRole('listitem')).toHaveCount(
    19,
  )
  await page.getByRole('button', { name: /^Radios & beacons/ }).click()
  await expect(page).toHaveURL(/\/catalogue\?aisle=radios/)
  /* no quote is open here, so nothing offers to put a part on one */
  await expect(page.getByRole('button', { name: /^Add the / })).toHaveCount(0)
})
