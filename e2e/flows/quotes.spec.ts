import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { startAQuote } from '../mint'

/* ============================================================
   QUOTES, A DESK OF DEALS, IN A REAL BROWSER AT EVERY SIZE
   (the flow round, 2026-10-30).

   Nothing is planted in IndexedDB by this file: the one deal it needs
   is made the way a dealer makes one, through New quote. What is asked
   here is what a component test cannot: that an empty desk says so
   quietly and starts the first quote, that a deal is a card led by its
   picture with its customer, total and next act, that the next act
   lands, and that the card fits the window it is drawn at.
   ============================================================ */

async function mintOne(page: Page): Promise<string> {
  await startAQuote(page)
  /* the write-behind is waited out, because what comes next is a page load
     (src/state/quotes.ts coalesces writes on a 300 ms interval) */
  await page.waitForTimeout(600)
  return new URL(page.url()).pathname.split('/').pop()!
}

/** Nothing on the page reaches past the window's right edge. */
async function fits(page: Page): Promise<void> {
  const over = await page.evaluate(() => {
    const width = document.documentElement.clientWidth
    return [...document.querySelectorAll('[data-testid="quotes"] *')]
      .map((el) => ({ el, box: el.getBoundingClientRect() }))
      .filter(({ box }) => box.width > 0 && box.right > width + 1)
      .map(({ el }) => `${el.tagName.toLowerCase()}.${el.className}`)
  })
  expect(over, 'nothing on the desk runs past the window').toEqual([])
}

test('an empty desk says so quietly and starts the first quote', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await throughTheDoor(page)
  await page.goto('/quotes')
  await expect(page.locator('[data-testid="quotes"][data-read]')).toBeVisible()

  await expect(page.getByText('Nothing has been quoted on this computer yet.')).toBeVisible()
  /* no group stands empty, and nothing is drawn that is not a quote */
  await expect(
    page.getByRole('region', { name: /^Being written|^With the customer|^Replaced/ }),
  ).toHaveCount(0)
  await expect(page.locator('[data-testid="quotes"] img')).toHaveCount(0)
  await fits(page)

  await page.getByRole('button', { name: 'New quote' }).click()
  await expect(page).toHaveURL(/\/quote\/new$/)
  expect(errors).toEqual([])
})

test('one deal is a card with its customer, total and next act, and the act lands', async ({
  page,
}) => {
  const id = await mintOne(page)
  await page.goto('/quotes')
  await expect(page.locator('[data-testid="quotes"][data-read]')).toBeVisible()

  const writing = page.getByRole('region', { name: /^Being written/ })
  await expect(writing).toBeVisible()
  const card = writing.getByRole('listitem')
  await expect(card).toHaveCount(1)
  await expect(card).toContainText(/\d{8}-\d{2}/)
  await expect(card.getByRole('heading', { level: 3 })).toHaveText('No customer named yet')
  /* the other groups are not drawn while they hold nothing */
  await expect(page.getByRole('region', { name: /^With the customer|^Replaced/ })).toHaveCount(0)

  /* the picture sits inside its card, never wider than it */
  const shot = card.locator('.qd-deal__shot')
  const inside = await shot.evaluate((el) => {
    const a = el.getBoundingClientRect()
    const b = el.closest('.qd-deal')!.getBoundingClientRect()
    return a.left >= b.left - 0.5 && a.right <= b.right + 0.5
  })
  expect(inside, 'the picture stands inside its card').toBe(true)
  await fits(page)

  await card.getByRole('button', { name: 'Carry on building' }).click()
  await expect(page).toHaveURL(new RegExp(`/quote/${id}(\\?|$)`))
})

test('a browser with no name in it never reaches the desk', async ({ page }) => {
  await page.goto('/quotes')
  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByTestId('entry')).toBeVisible()
})
