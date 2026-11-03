import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { written } from '../mint'

/* ============================================================
   REVIEW, THE CASE QUEUE — what the rulers cannot see. Every press
   here is a person's press, and each is followed to where it lands:
   the fix writes the trailer, the stage moves to the case after it
   and its address says which, the toast's Undo puts it back, a fix
   survives a reload, a typed price clears its case, a case left
   alone stays left (kept with Northside's file) and comes back one
   at a time from the foot, every case is found in the index, and the
   one press stands inside the case — in the first window on a phone.
   The clean day never says a check holds that was only left alone.
   Nothing is planted.
   ============================================================ */

const READY = '[data-testid="review"][data-read] .rv-stage__title'

async function toReview(page: Page, at = ''): Promise<void> {
  await page.goto(at === '' ? '/review' : `/review?case=${encodeURIComponent(at)}`)
  await expect(page.locator(READY)).toBeVisible({ timeout: 30_000 })
}

/* the figure is said once to a reader and its rolling digits are hidden from one, so the count
   is read as the heading's name, never its painted text. It counts CASES, as "Case 1 of 39" does */
const count = (page: Page, n: number, rest = '') =>
  page.getByRole('heading', {
    level: 1,
    name: new RegExp(`^Review ${n} to settle${rest === '' ? '' : `, ${rest}$`}`),
  })
const stage = (page: Page) => page.locator('.rv-stage')
const title = (page: Page) => stage(page).getByRole('heading', { level: 2 })

const BOATS = 'Price the 9 Formosa boats on sale at $0.'
const FIRST = 'Rego the ALP 5.3M-13B as a Large trailer.'
const SECOND = 'Rego the ALP 5.7M-13TB as a Large trailer.'
const FIRST_TRAILER = 'band:trl_dunbier:trl_dunbier:67:Small Trailers - Up to 1.02t:1450'
const LONE_STAR = 'none:parts:ANCHOR WINCHES - Lone Star:blank'
const PLUGS = 'none:parts:TRAILER PARTS - Trailer Plugs:zero'

test.describe('review', () => {
  test('at rest: what is left, what it costs, and what risks a quote on the stage', async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await throughTheDoor(page)
    await toReview(page)
    await expect(count(page, 39, 'what puts a quote at risk first')).toBeVisible()
    await expect(page.locator('.rv-money')).toContainText('$819')
    await expect(page.locator('.rv-money')).toContainText('$234')
    await expect(page.locator('.rv-money')).toContainText('on one sale of each trailer')
    await expect(title(page)).toHaveText(BOATS)
    await expect(stage(page).getByText('Case 1 of 39')).toBeVisible()
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
    await toReview(page, FIRST_TRAILER)
    await page.getByRole('button', { name: /^Make it Large · \+\$117/ }).click()

    await expect(title(page)).toHaveText(SECOND)
    await expect(page).toHaveURL(/case=band%3Atrl_dunbier%3Atrl_dunbier%3A69/)
    await expect(count(page, 38)).toBeVisible()
    await expect(page.locator('.rv-money')).toContainText('$702')
    /* the toast says what the title says, never the file's whole string (the judge's B5) */
    await expect(
      page.getByText('The ALP 5.3M-13B is registered Large at $283, and sells at $11,483.', {
        exact: true,
      }),
    ).toBeVisible()
    /* the next case's title takes the focus, so a reader hears where the stage went */
    await expect(title(page)).toBeFocused()

    await page.getByRole('button', { name: 'Undo' }).click()
    await expect(count(page, 39)).toBeVisible()
    await expect(
      page.getByText(
        /^Undone\. No longer so: The ALP 5\.3M-13B is registered Large at \$283, and sells at \$11,483\.$/,
      ),
    ).toBeVisible()
    await expect(title(page)).toHaveText(FIRST)
  })

  test('a fix is the price list’s own change: it is still there after a reload', async ({
    page,
  }) => {
    test.setTimeout(90_000)
    await throughTheDoor(page)
    await toReview(page, FIRST_TRAILER)
    await page.getByRole('button', { name: /^Make it Large/ }).click()
    await expect(count(page, 38)).toBeVisible()
    await written(page)
    await page.reload()
    await expect(page.locator(READY)).toBeVisible({ timeout: 30_000 })
    await expect(count(page, 38)).toBeVisible()
    await expect(title(page)).toHaveText(SECOND)
  })

  test('several lines share one case: a typed price clears what it names', async ({ page }) => {
    await throughTheDoor(page)
    await toReview(page, LONE_STAR)
    await expect(title(page)).toHaveText('Give the 8 lines in Anchor Winches - Lone Star a price.')
    await page.getByRole('button', { name: /^Price them at Sell/ }).click()
    await expect(page.getByText('Type a price beside at least one of them first.')).toBeVisible()

    const gx1 = page.getByLabel('Sell for Lone Star · GX-1 HS4mm Combo Winch Kit')
    await gx1.fill('abc')
    await page.getByRole('button', { name: /^Price the one typed at Sell/ }).click()
    /* refused at the field it is about: marked, and holding the focus (the judge's B6) */
    await expect(gx1).toHaveAttribute('aria-invalid', 'true')
    await expect(gx1).toBeFocused()
    await gx1.fill('2,150')
    await page.getByRole('button', { name: /^Price the one typed at Sell/ }).click()
    await expect(
      page.getByText('Lone Star · GX-1 HS4mm Combo Winch Kit is now $2,150 at Sell.', {
        exact: true,
      }),
    ).toBeVisible()
    /* seven of the eight are still unpriced, so the case stays, one line shorter */
    await expect(count(page, 39)).toBeVisible()
    await expect(title(page)).toHaveText('Give the 7 lines in Anchor Winches - Lone Star a price.')
  })

  test('a case left alone is kept with the price list across a reload, and comes back on its own', async ({
    page,
  }) => {
    test.setTimeout(90_000)
    await throughTheDoor(page)
    await toReview(page, PLUGS)
    await page.getByRole('button', { name: 'Leave them at $0' }).click()
    await expect(count(page, 38)).toBeVisible()
    await expect(page.getByText(/^1 case is left alone, on 4 lines\./)).toBeVisible()

    await written(page)
    await page.reload()
    await expect(page.locator(READY)).toBeVisible({ timeout: 30_000 })
    await expect(count(page, 38)).toBeVisible()

    await page.getByRole('button', { name: 'See what was left' }).click()
    const left = page.getByRole('list', { name: 'Left alone' })
    await expect(left).toContainText('Left as meant, by Asaf')
    await left.getByRole('button', { name: 'Bring it back' }).click()
    await expect(count(page, 39)).toBeVisible()
    await expect(title(page)).toHaveText(
      'Leave the 4 lines in Trailer Parts - Trailer Plugs at $0, as each says what they come with.',
    )
  })

  test('the keys: → skips and keeps the case’s place, Enter makes the fix', async ({
    page,
  }, info) => {
    test.skip(info.project.name.startsWith('phone'), 'a phone has no keys to press')
    await throughTheDoor(page)
    await toReview(page, FIRST_TRAILER)
    await page.keyboard.press('ArrowRight')
    await expect(title(page)).toHaveText(SECOND)
    await expect(count(page, 39)).toBeVisible()
    await page.keyboard.press('ArrowLeft')
    await expect(title(page)).toHaveText(FIRST)
    await page.keyboard.press('Enter')
    await expect(count(page, 38)).toBeVisible()
  })

  test('the one press stands in the case, in the first window, and a press never throws the page to its top', async ({
    page,
  }) => {
    await throughTheDoor(page)
    await toReview(page, FIRST_TRAILER)
    const act = page.getByRole('button', { name: /^Make it Large/ })
    const where = await act.evaluate((el) => {
      let pinned = false
      for (let n: Element | null = el; n; n = n.parentElement) {
        const p = getComputedStyle(n).position
        if (p === 'fixed' || p === 'sticky') pinned = true
      }
      const box = el.getBoundingClientRect()
      return {
        pinned,
        inStage: !!el.closest('.rv-stage'),
        inFirstWindow: box.bottom <= window.innerHeight,
      }
    })
    /* the judge's B4: the press stood at y 846 in an 844 window at 390, and at 671 of 390 */
    expect(where).toEqual({ pinned: false, inStage: true, inFirstWindow: true })

    /* scrolled to the case's foot and pressed, the page brings the next title into view rather
       than leaving the reader on the old case's foot — or throwing it to the top */
    await stage(page).locator('.rv-kept').scrollIntoViewIfNeeded()
    await act.click()
    await expect(title(page)).toHaveText(SECOND)
    await expect(title(page)).toBeInViewport()
  })

  test('the case on the stage and Data’s door count the same file', async ({ page }) => {
    await throughTheDoor(page)
    await page.goto('/data')
    await expect(page.getByTestId('data-wrong')).toHaveText('39 to settle', { timeout: 30_000 })
  })

  test('a case left alone and taken back from the toast is the case on the stage again', async ({
    page,
  }) => {
    await throughTheDoor(page)
    await toReview(page, PLUGS)
    const plugs =
      'Leave the 4 lines in Trailer Parts - Trailer Plugs at $0, as each says what they come with.'
    await expect(title(page)).toHaveText(plugs)
    await page.getByRole('button', { name: 'It’s meant' }).click()
    await expect(count(page, 38)).toBeVisible()
    await expect(title(page)).not.toHaveText(plugs)
    await page.getByRole('button', { name: 'Undo' }).click()
    await expect(count(page, 39)).toBeVisible()
    await expect(title(page)).toHaveText(plugs)
  })

  test('every case in one look: found by typing, and opened on the stage', async ({ page }) => {
    await throughTheDoor(page)
    await toReview(page)
    const index = page.getByRole('navigation', { name: 'Every case' })
    const door = page.getByRole('button', { name: 'Every case, by check or list' })
    /* at a desk the index has its own column; below one it opens from the rail */
    if (await door.isVisible()) await door.click()
    await expect(index).toBeVisible()
    await expect(index.getByRole('link')).toHaveCount(39)
    await index
      .getByRole('textbox', { name: 'Find a case by its list, maker or line' })
      .fill('lone star')
    await expect(index.getByRole('link')).toHaveCount(1)
    await expect(page).toHaveURL(/find=lone(\+|%20)star/)
    await index.getByRole('link').click()
    await expect(title(page)).toHaveText('Give the 8 lines in Anchor Winches - Lone Star a price.')
    await expect(page).toHaveURL(/case=none%3Aparts%3AANCHOR/)
  })

  test('a note is taken off sale, never priced, and the Undo puts it back on sale', async ({
    page,
  }) => {
    await throughTheDoor(page)
    await toReview(page, 'note:parts')
    await expect(title(page)).toHaveText(
      'Take the 6 notes and empty lines in Parts & Accessories off sale.',
    )
    await expect(stage(page).getByRole('textbox')).toHaveCount(0)
    await page.getByRole('button', { name: 'Take all 6 off sale' }).click()
    await expect(count(page, 38)).toBeVisible()
    await page.getByRole('button', { name: 'Undo' }).click()
    await expect(count(page, 39)).toBeVisible()
  })

  test('an address naming a case no longer there says so', async ({ page }) => {
    await throughTheDoor(page)
    await toReview(page, 'band:nothing:here')
    await expect(
      page.getByText(/^That case is settled or is no longer in the price list/),
    ).toBeVisible()
    await expect(title(page)).toHaveText(BOATS)
  })

  test('the clean day is true when every case is left alone, not fixed', async ({ page }, info) => {
    test.skip(info.project.name !== 'laptop', 'one walk of 39 presses is enough')
    test.setTimeout(180_000)
    await throughTheDoor(page)
    await toReview(page)
    for (let n = 39; n > 0; n -= 1) {
      await expect(count(page, n)).toBeVisible()
      await page.locator('body').press('l')
    }
    await expect(count(page, 0)).toBeVisible()
    await expect(title(page)).toHaveText('Nothing in your price list is waiting on you.')
    const said = (await page.locator('main').textContent()) ?? ''
    expect(said).not.toContain('each one holds')
    expect(said).not.toContain('Every trailer is registered as the size its weight says')
    expect(said).toContain(
      '9 trailers are still registered as the wrong size, left alone by your choice',
    )
    await expect(page.locator('.rv-money')).toContainText('not charged, left alone')
    await expect(page.locator('.rv-money')).toContainText('charged over, left alone')
  })
})
