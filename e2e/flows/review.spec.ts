import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { written } from '../mint'
import { routes } from '../routes'
import { readDensity } from '../rulers/measure/density'

/* ============================================================
   REVIEW — what the rulers cannot see. Every press here is a
   person's press, and each is followed to where it lands: the fix
   writes the trailer and the head counts down, the toast's Undo
   puts it back, a group left as meant stays left across a reload and
   comes back from the foot, and "Price them" opens the price list at
   the line it names. Nothing is planted.
   ============================================================ */

async function toReview(page: Page, open = ''): Promise<void> {
  await page.goto(open === '' ? '/review' : `/review?open=${open}`)
  await expect(page.locator('[data-testid="review"][data-read]')).toBeVisible({ timeout: 30_000 })
}

const SPORTSKI = 'Offroad Single Sportski Trailer: make it Large at $283, sells at $16,273, +$117'

test.describe('review', () => {
  test('at rest the money is in the head and the nine wrong trailers stand with their fix beside each', async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await throughTheDoor(page)
    await toReview(page)

    const head = page.getByTestId('review')
    await expect(head.getByText('registration not charged on 7 trailers')).toBeVisible()
    await expect(head.getByText('charged over on 2')).toBeVisible()
    const grid = page.getByRole('grid', { name: 'The checks' })
    await expect(grid.getByRole('button', { name: /: make it (Large|Small) at/ })).toHaveCount(9)
    await expect(grid.getByRole('button', { name: /^Fix the next/ })).toHaveCount(1)
    /* Review is the price list's own room: the pill lights Data while it is open */
    await expect(
      page.getByTestId('shell-pill').getByRole('link', { name: /^Data( |$)/ }),
    ).toHaveAttribute('aria-current', 'page')
    expect(errors).toEqual([])
  })

  test('one press writes one trailer, the head counts down, and the toast takes it back', async ({
    page,
  }) => {
    await throughTheDoor(page)
    await toReview(page)
    const grid = page.getByRole('grid', { name: 'The checks' })

    await grid.getByRole('button', { name: SPORTSKI }).click()
    await expect(grid.getByRole('button', { name: SPORTSKI })).toHaveCount(0)
    await expect(grid.getByRole('button', { name: /: make it (Large|Small) at/ })).toHaveCount(8)
    await expect(page.getByText('registration not charged on 6 trailers')).toBeVisible()
    await expect(
      page.getByText(
        'GFAB Offroad Single Sportski Trailer is registered Large at $283, and sells at $16,273.',
      ),
    ).toBeVisible()

    await page.getByRole('button', { name: 'Undo' }).click()
    await expect(grid.getByRole('button', { name: SPORTSKI })).toBeVisible()
    await expect(page.getByText('registration not charged on 7 trailers')).toBeVisible()
  })

  test('a fix is the price list’s own change: it is still there after a reload, and the sheet reads it', async ({
    page,
  }) => {
    test.setTimeout(90_000)
    await throughTheDoor(page)
    await toReview(page)
    await page
      .getByRole('grid', { name: 'The checks' })
      .getByRole('button', { name: SPORTSKI })
      .click()
    await written(page)
    await page.reload()
    await expect(page.locator('[data-testid="review"][data-read]')).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText('registration not charged on 6 trailers')).toBeVisible()
    await expect(page.getByRole('button', { name: SPORTSKI })).toHaveCount(0)
  })

  test('a group left as meant stays left across a reload, and the foot brings it back', async ({
    page,
  }) => {
    await throughTheDoor(page)
    await toReview(page, 'none')
    const grid = page.getByRole('grid', { name: 'The checks' })
    await expect(grid.getByText('Labour Estimates', { exact: true })).toBeVisible()

    await grid.getByRole('button', { name: 'Leave the 86 as meant' }).click()
    await expect(grid.getByText('Labour Estimates', { exact: true })).toHaveCount(0)
    await expect(page.getByText(/^86 lines are left as meant\./)).toBeVisible()

    await page.reload()
    await expect(page.locator('[data-testid="review"][data-read]')).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText(/^86 lines are left as meant\./)).toBeVisible()
    await expect(grid.getByText('Labour Estimates', { exact: true })).toHaveCount(0)

    await page.getByRole('button', { name: 'Bring them back' }).click()
    await expect(grid.getByText('Labour Estimates', { exact: true })).toBeVisible()
  })

  test('a folded check opens in place, and its address says which', async ({ page }) => {
    await throughTheDoor(page)
    await toReview(page)
    const twins = page.locator('.rv-check[data-check="twins"]')
    await twins.getByRole('button', { name: 'Open' }).click()
    await expect(page).toHaveURL(/open=twins/)
    await expect(twins.getByText('Two called', { exact: false }).first()).toBeVisible()
    await twins.getByRole('button', { name: 'Fold' }).click()
    await expect(page).toHaveURL(/open=-/)
    await expect(twins.getByText('Two called', { exact: false })).toHaveCount(0)
  })

  test('“Price them” opens the price list at the first line of its group', async ({ page }) => {
    test.setTimeout(150_000)
    await throughTheDoor(page)
    await toReview(page, 'none')
    await page.getByRole('button', { name: 'Price them' }).first().click()
    await expect(page).toHaveURL(/\/data\/parts\?.*at=parts/)
    /* the price list of 2,937 parts reads in its own time: measured 2026-10-22 at 1440 × 900, the
       record stood 4 to 6 s after the press on a desk already running the build */
    await expect(page.getByTestId('sheet-record')).toBeVisible({ timeout: 60_000 })
    await expect(page.getByTestId('sheet-record')).toContainText('Labour Estimated')
  })

  test('the title, the money and the checks stand in one column at every size', async ({
    page,
  }) => {
    /* the critique of 2026-10-22 measured the money band at x 32–1352 over checks at 300–1620 at
       1920 × 1080: a `margin: 0` on the band undid the column's centring past 1,384px. Read
       where each one actually stands, not what the stylesheet says */
    await throughTheDoor(page)
    await toReview(page)
    const edges = await page.evaluate(() =>
      ['.rv-head', '.rv-money', '.rv-list'].map((s) => {
        const b = document.querySelector(s)!.getBoundingClientRect()
        return { s, left: Math.round(b.left), right: Math.round(b.right) }
      }),
    )
    const [head, money, list] = edges
    for (const e of [money!, list!]) {
      expect(Math.abs(e.left - head!.left), `${e.s} left edge`).toBeLessThanOrEqual(1)
      expect(Math.abs(e.right - head!.right), `${e.s} right edge`).toBeLessThanOrEqual(1)
    }
  })

  test('the list holds eighteen readable rows at the dealer’s laptop', async ({ page }, info) => {
    test.skip(info.project.name !== 'laptop', 'the density is owed at 1280 × 800')
    await throughTheDoor(page)
    await toReview(page)
    const route = routes.find((r) => r.name === 'review')!
    const read = await page.evaluate(readDensity, route.density!)
    expect(read.missing).toBeNull()
    expect(read.capacity).toBeGreaterThanOrEqual(18)
  })
})
