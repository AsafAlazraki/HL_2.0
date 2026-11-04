import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { HOME_READY } from '../routes'

/* ============================================================
   THE BOAT'S DOOR (fit-flow, direction A, built 2026-11-05).

   The owner, 2026-11-04: "we should be able to do the what fits from the home boats thing not
   just open quote and stuff". Two cold walks found the door group of confusions
   (docs/directions/fit-flow/walk-1-1.md, walk-1-2.md): Home's boats only quoted; Find's one
   "What fits" row followed the first boat, the Patrol 600 EW, under "Patrol 600"; a maker
   misremembered ("Stabicraft PA 600") was a dead end in Find and in the picker, and All makers
   wiped the words; Fitment reached from Home lit Data; and a phone was told "Enter opens it"
   beside an Esc key. Each is walked here, through the real door on the real price list, at
   every size. Nothing is planted.
   ============================================================ */

const boats = (page: Page) => page.getByRole('region', { name: 'Start from the boat' })
const pill = (page: Page) => page.getByTestId('shell-pill')
const lit = (page: Page, word: string) =>
  pill(page)
    .getByRole('link', { name: new RegExp(`^${word}`) })
    .first()

async function home(page: Page): Promise<void> {
  await throughTheDoor(page)
  await expect(page.locator(HOME_READY)).toBeVisible({ timeout: 30_000 })
}

async function find(page: Page, words: string) {
  await page.keyboard.press('Control+k')
  const finder = page.getByTestId('shell-finder')
  await expect(finder).toBeVisible()
  await page.keyboard.type(words)
  return finder
}

test('every boat on Home has What fits and Quote it, each one press', async ({ page }) => {
  test.setTimeout(120_000)
  await home(page)
  const cards = boats(page).getByRole('listitem')
  const count = await cards.count()
  expect(count).toBeGreaterThan(0)
  for (let i = 0; i < count; i += 1) {
    const doors = cards.nth(i).getByRole('button')
    await expect(doors).toHaveText(['What fits', 'Quote it'])
    /* each door's word is whole on its half of the card, at every size */
    for (const door of await doors.all()) {
      const fits = await door.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)
      expect(fits, `${await door.getAttribute('aria-label')} is cut`).toBe(true)
    }
  }

  /* What fits: the boat's own page, lighting Home, the door it was opened from */
  const first = cards.first()
  await first.getByRole('button', { name: /^What fits: / }).click()
  await expect(page).toHaveURL(/\/fitment\?boat=[^&]+&from=home$/)
  await expect(lit(page, 'Home')).toHaveAttribute('aria-current', 'page')
  await expect(lit(page, 'Data')).not.toHaveAttribute('aria-current', 'page')
  await page.goBack()
  await expect(page.locator(HOME_READY)).toBeVisible({ timeout: 30_000 })

  /* Quote it: the picker at that boat */
  await boats(page)
    .getByRole('listitem')
    .first()
    .getByRole('button', { name: /^Quote it: / })
    .click()
  await expect(page).toHaveURL(/\/quote\/new\?brand=[^&]+&model=/)
})

test('the photograph and the name are What fits too, so no press on a card does nothing', async ({
  page,
}) => {
  test.setTimeout(120_000)
  await home(page)
  const card = boats(page).getByRole('listitem').first()
  /* a person's press where the photograph is drawn: the door's own hit area lies over it, so the
     press lands on What fits, which is the point */
  await card.scrollIntoViewIfNeeded()
  /* the card has arrived: its own entrance has finished, so the press lands where it is drawn */
  await card.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)))
  const box = (await card.locator('img').boundingBox())!
  const centre = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  /* and the page's own arrival (its view transition) has let go of the pointer: until then the
     browser hands every press to the root, whatever is drawn */
  await expect
    .poll(() =>
      page.evaluate(
        ({ x, y }) => document.elementFromPoint(x, y)?.getAttribute('data-door') ?? '',
        centre,
      ),
    )
    .toBe('fits')
  await page.mouse.click(centre.x, centre.y)
  await expect(page).toHaveURL(/\/fitment\?boat=[^&]+&from=home$/)
})

test('Find leads with the boat named, and every boat carries its own two doors', async ({
  page,
}) => {
  test.setTimeout(120_000)
  await home(page)
  for (const words of ['Patrol 600', 'PA 600']) {
    const finder = await find(page, words)
    const first = finder.locator('.way-boat').first()
    await expect(first.locator('.way-row__name'), words).toHaveText('Patrol 600')
    /* three boats, three What fits, each its own */
    await expect(
      finder.getByRole('option', { name: /^What fits the Highfield Patrol 600/ }),
    ).toHaveCount(3)
    await expect(finder.getByRole('option').first()).toHaveAccessibleName(
      'What fits the Highfield Patrol 600',
    )
    await page.keyboard.press('Escape')
    await expect(finder).toHaveCount(0)
  }
  const finder = await find(page, 'Patrol 600')
  await finder
    .getByRole('option', { name: 'What fits the Highfield Patrol 600', exact: true })
    .click()
  await expect(page).toHaveURL(/\/fitment\?boat=[^&]+&from=home$/)
  await expect(lit(page, 'Home')).toHaveAttribute('aria-current', 'page')
})

test('a maker misremembered is named as the near miss, in Find and in the picker', async ({
  page,
}) => {
  test.setTimeout(120_000)
  await home(page)
  const finder = await find(page, 'Stabicraft PA 600')
  await expect(
    finder.getByText(
      /^No Stabicraft is called “PA 600”\. The “PA 600” on the price list is Highfield/,
    ),
  ).toBeVisible()
  await expect(finder.getByText(/^Nothing matches/)).toHaveCount(0)
  await expect(finder.getByRole('option').first()).toHaveAccessibleName(
    'What fits the Highfield Patrol 600',
  )
  await page.keyboard.press('Escape')

  /* the picker, filtered to Stabicraft, with the words typed */
  await page.goto('/quote/new?brand=boat_stabicraft')
  const field = page.getByLabel(/Find a model/)
  await field.fill('PA 600')
  await expect(page.locator('#picker-find-said')).toHaveText(
    /^No model from Stabicraft is called that\. .+ has \d+ that are\.$/,
  )
  const index = page.getByRole('region', { name: 'Models' })
  await index
    .getByRole('button', { name: /^Show the \d+ from / })
    .first()
    .click()
  await expect(page).toHaveURL(/brand=boat_highfield/)
  await expect(field).toHaveValue('PA 600')
  /* and All makers keeps the words */
  /* the rail's on a desk, the list's head in a hand: whichever this window draws */
  await page
    .getByRole('button', { name: /^All makers/ })
    .filter({ visible: true })
    .first()
    .click()
  await expect(field).toHaveValue('PA 600')
  await expect(index).toContainText('Patrol 600')
})

test('a narrow window is not told about keys', async ({ page }) => {
  test.setTimeout(120_000)
  await home(page)
  const finder = await find(page, 'Patrol 600')
  const narrow = (page.viewportSize()?.width ?? 0) < 760
  const esc = finder.locator('.way-finder__esc')
  if (narrow) {
    await expect(esc).toBeHidden()
    await expect(finder.getByText('Enter opens it.', { exact: false })).toBeHidden()
  }
  /* the doors are words, never an engine's capitals */
  await expect(finder).not.toContainText(/OPEN FITMENT|Open Fitment/)
})
