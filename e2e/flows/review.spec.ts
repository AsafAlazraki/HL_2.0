import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { written } from '../mint'

/* ============================================================
   REVIEW, THE CASE QUEUE — what the rulers cannot see. Every press
   here is a person's press, and each is followed to where it lands:
   the fix writes the trailer, the stage moves to the case after it
   and its address says which, the toast's Undo puts it back, a fix
   survives a reload, a typed price clears its case, a case left as
   meant stays left and comes back from the foot, and the one press
   stands inside the case at every size — never a bar pinned over the
   page. Nothing is planted.
   ============================================================ */

const READY = '[data-testid="review"][data-read] .rv-stage__title'

async function toReview(page: Page, at = ''): Promise<void> {
  await page.goto(at === '' ? '/review' : `/review?case=${encodeURIComponent(at)}`)
  await expect(page.locator(READY)).toBeVisible({ timeout: 30_000 })
}

/* the figure is said once to a reader and its rolling digits are hidden from one, so the count
   is read as the heading's name, never its painted text. It counts CASES, as "Case 1 of 37" does
   (built-critique-m3.md, major 11: "69 to settle" stood beside "Case 1 of 37"), under the
   screen's own name */
const count = (page: Page, n: number, rest = '') =>
  page.getByRole('heading', {
    level: 1,
    name: new RegExp(`^Review ${n} to settle${rest === '' ? '' : `, ${rest}$`}`),
  })
const title = (page: Page) => page.getByRole('heading', { level: 2 })

const FIRST = 'Rego the ALP 5.3M-13B as a Large trailer.'
const SECOND = 'Rego the ALP 5.7M-13TB as a Large trailer.'
const LONE_STAR = 'none:parts:ANCHOR WINCHES - Lone Star:blank'
const PLUGS = 'none:parts:TRAILER PARTS - Trailer Plugs:zero'

test.describe('review', () => {
  test('at rest: what is left, what it costs, and the most money on the stage', async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await throughTheDoor(page)
    await toReview(page)
    await expect(count(page, 37, 'the most money first')).toBeVisible()
    await expect(page.locator('.rv-money')).toContainText('$819')
    await expect(page.locator('.rv-money')).toContainText('$234')
    await expect(title(page)).toHaveText(FIRST)
    await expect(page.getByText('Case 1 of 37 · Registered as the wrong size')).toBeVisible()
    /* Review is the price list's own room: the pill lights Data while it is open */
    await expect(
      page.getByTestId('shell-pill').getByRole('link', { name: /^Data( |$)/ }),
    ).toHaveAttribute('aria-current', 'page')
    expect(errors).toEqual([])
  })

  test('the press writes the trailer, the stage moves on, and the toast takes it back', async ({
    page,
  }) => {
    await throughTheDoor(page)
    await toReview(page)
    await page.getByRole('button', { name: /^Make it Large · \+\$117/ }).click()

    await expect(title(page)).toHaveText(SECOND)
    await expect(page).toHaveURL(/case=band%3Atrl_dunbier%3Atrl_dunbier%3A69/)
    await expect(count(page, 36)).toBeVisible()
    await expect(page.locator('.rv-money')).toContainText('$702')
    await expect(
      page.getByText(/is registered Large at \$283, and sells at \$11,483\.$/),
    ).toBeVisible()
    /* the next case's title takes the focus, so a reader hears where the stage went */
    await expect(title(page)).toBeFocused()

    await page.getByRole('button', { name: 'Undo' }).click()
    await expect(count(page, 37)).toBeVisible()
    /* the toast says the size is NO LONGER so, before the claim, and the case taken back is the
       one on the stage again (built-critique-m3 §3 and its minors) */
    await expect(
      page.getByText(
        /^Undone\. No longer so: .* is registered Large at \$283, and sells at \$11,483\.$/,
      ),
    ).toBeVisible()
    await expect(title(page)).toHaveText(FIRST)
    await expect(page).not.toHaveURL(/case=band%3Atrl_dunbier%3Atrl_dunbier%3A69/)
  })

  test('a fix is the price list’s own change: it is still there after a reload', async ({
    page,
  }) => {
    test.setTimeout(90_000)
    await throughTheDoor(page)
    await toReview(page)
    await page.getByRole('button', { name: /^Make it Large/ }).click()
    await expect(count(page, 36)).toBeVisible()
    await written(page)
    await page.reload()
    await expect(page.locator(READY)).toBeVisible({ timeout: 30_000 })
    await expect(count(page, 36)).toBeVisible()
    await expect(title(page)).toHaveText(SECOND)
  })

  test('several lines share one case: a typed price clears what it names', async ({ page }) => {
    await throughTheDoor(page)
    await toReview(page, LONE_STAR)
    await expect(title(page)).toHaveText('Give the 8 lines in Anchor Winches - Lone Star a price.')
    const press = page.getByRole('button', { name: /^Price them at Sell/ })
    await press.click()
    await expect(page.getByText('Type a price beside at least one of them first.')).toBeVisible()

    /* the line as the dealer says it (`nameSaid`), not as the file writes it */
    await page.getByLabel('Sell for Lone Star · GX-1 HS4mm Combo Winch Kit').fill('2,150')
    await page.getByRole('button', { name: /^Price the one typed at Sell/ }).click()
    await expect(
      page.getByText('Lone Star - GX-1 HS4mm Combo Winch Kit is now $2,150 at Sell.'),
    ).toBeVisible()
    /* seven of the eight are still unpriced, so the case stays, one line shorter, and the
       queue still counts it */
    await expect(count(page, 37)).toBeVisible()
    await expect(title(page)).toHaveText('Give the 7 lines in Anchor Winches - Lone Star a price.')
  })

  test('a case left as meant stays left across a reload, and the foot brings it back', async ({
    page,
  }) => {
    await throughTheDoor(page)
    await toReview(page, PLUGS)
    await page.getByRole('button', { name: 'It’s meant' }).click()
    await expect(count(page, 36)).toBeVisible()
    await expect(page.getByText(/^4 lines are left alone\./)).toBeVisible()

    await page.reload()
    await expect(page.locator(READY)).toBeVisible({ timeout: 30_000 })
    await expect(count(page, 36)).toBeVisible()

    await page.getByRole('button', { name: 'Bring them back' }).click()
    await expect(count(page, 37)).toBeVisible()
  })

  test('the keys: → skips and keeps the case’s place, Enter makes the fix', async ({
    page,
  }, info) => {
    test.skip(info.project.name.startsWith('phone'), 'a phone has no keys to press')
    await throughTheDoor(page)
    await toReview(page)
    await page.keyboard.press('ArrowRight')
    await expect(title(page)).toHaveText(SECOND)
    await expect(count(page, 37)).toBeVisible()
    await page.keyboard.press('ArrowLeft')
    await expect(title(page)).toHaveText(FIRST)
    await page.keyboard.press('Enter')
    await expect(count(page, 36)).toBeVisible()
  })

  test('the one press stands inside the case at every size, never pinned over the page', async ({
    page,
  }) => {
    await throughTheDoor(page)
    await toReview(page)
    const act = page.getByRole('button', { name: /^Make it Large/ })
    const where = await act.evaluate((el) => {
      let pinned = false
      for (let n: Element | null = el; n; n = n.parentElement) {
        const p = getComputedStyle(n).position
        if (p === 'fixed' || p === 'sticky') pinned = true
      }
      return { pinned, inStage: !!el.closest('.rv-stage') }
    })
    expect(where).toEqual({ pinned: false, inStage: true })
  })

  test('the case on the stage and Data’s door count the same file', async ({ page }) => {
    await throughTheDoor(page)
    await page.goto('/data')
    await expect(page.getByTestId('data-wrong')).toHaveText('37 to settle', { timeout: 30_000 })
  })

  test('a case left alone and taken back from the toast is the case on the stage again', async ({
    page,
  }) => {
    await throughTheDoor(page)
    await toReview(page, PLUGS)
    const plugs = 'Price the 4 lines in Trailer Parts - Trailer Plugs, or leave them at $0.'
    await expect(title(page)).toHaveText(plugs)
    await page.getByRole('button', { name: 'It’s meant' }).click()
    await expect(count(page, 36)).toBeVisible()
    await expect(title(page)).not.toHaveText(plugs)
    await page.getByRole('button', { name: 'Undo' }).click()
    await expect(count(page, 37)).toBeVisible()
    /* the one taken back, never the case that stood after it (built-critique-m3.md, minor) */
    await expect(title(page)).toHaveText(plugs)
  })
})
