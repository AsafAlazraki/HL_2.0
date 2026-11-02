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

/* ============================================================
   A BOAT, A MOTOR AND A PART ON ONE DESK (the quote round's third audit, 2026-11-03: "Not
   walked: the Quotes page holding a boat, a motor and a part at once"). Each is started the way a
   dealer starts it — the boat from its maker, the motor and the part from New quote's shelves —
   in one browser, and the desk then holds three cards, each named for what it quotes, each
   picture inside its card and never drawn past its own pixels ("nothing blurry").
   ============================================================ */
test('a boat, a motor and a part stand on one desk, each its own card', async ({ page }) => {
  /* three walks into the build, as the picker's own three-kinds walk budgets them */
  test.setTimeout(120_000)
  await startAQuote(page)
  await page.waitForTimeout(600)

  const alone = async (shelf: RegExp): Promise<string> => {
    await page.goto('/quote/new')
    const door = page.getByRole('region', { name: 'Sold on its own' }).getByRole('button', {
      name: shelf,
    })
    await door.scrollIntoViewIfNeeded()
    await door.click()
    const card = page
      .getByRole('region', { name: 'Models' })
      .locator('.picker-cards__item button')
      .first()
    await card.click()
    const panel = page.getByRole('complementary', { name: 'What is chosen' })
    const name = (await panel.getByRole('heading', { level: 2 }).innerText()).trim()
    const act = panel.getByRole('button', { name: 'Start the quote' })
    await act.scrollIntoViewIfNeeded()
    await act.click()
    await expect(page.getByTestId('configurator')).toBeVisible()
    await page.waitForTimeout(600)
    return name
  }
  const motor = await alone(/^Yamaha Outboards, /)
  const part = await alone(/^Parts & Accessories, /)

  await page.goto('/quotes')
  await expect(page.locator('[data-testid="quotes"][data-read]')).toBeVisible()
  const cards = page.getByRole('region', { name: /^Being written/ }).getByRole('listitem')
  await expect(cards).toHaveCount(3)
  await expect(cards.filter({ hasText: motor })).toHaveCount(1)
  await expect(cards.filter({ hasText: part })).toHaveCount(1)
  await fits(page)

  /* every picture inside its card, and painted at no more than its own pixels, read from a
     fresh decode of what it drew (a `srcset` copy's naturalWidth is density-corrected) */
  const drawn = await page.evaluate(async () => {
    const out: string[] = []
    for (const img of document.querySelectorAll<HTMLImageElement>('.qd-deal__shot img')) {
      const box = img.getBoundingClientRect()
      const deal = img.closest('.qd-deal')!.getBoundingClientRect()
      if (box.left < deal.left - 0.5 || box.right > deal.right + 0.5)
        out.push(`${img.alt} stands outside its card`)
      const fresh = new Image()
      fresh.src = img.currentSrc
      await fresh.decode()
      const sx = box.width / fresh.naturalWidth
      const sy = box.height / fresh.naturalHeight
      const fit = getComputedStyle(img).objectFit
      const scale =
        fit === 'cover'
          ? Math.max(sx, sy)
          : fit === 'scale-down'
            ? Math.min(1, sx, sy)
            : Math.min(sx, sy)
      if (scale > 1.05) out.push(`${img.currentSrc} drawn at x${scale.toFixed(2)}`)
    }
    return out
  })
  expect(drawn, 'every picture inside its card, never past its own pixels').toEqual([])
})

test('a browser with no name in it never reaches the desk', async ({ page }) => {
  await page.goto('/quotes')
  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByTestId('entry')).toBeVisible()
})
