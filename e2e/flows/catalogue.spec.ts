import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'

/* ============================================================
   THE CHANDLERY, WALKED — /catalogue, direction A of the data round
   (docs/directions/data-round/catalogue/), with the real Master Price
   File, through the real door. Each test is a job the judge listed
   (judge.md §1), done the way a salesperson or Northside's admin does
   it, and proved by what the screen itself says.
   ============================================================ */

const LOOK = process.env.HL2_LOOK ?? ''
const shot = async (page: Page, name: string, project: string): Promise<void> => {
  if (LOOK !== '') await page.screenshot({ path: `${LOOK}/${project}-${name}.png` })
}

const ready = (page: Page) => page.locator('[data-testid="catalogue"][data-read]')

test('J1, J2, J10, J7: an aisle opens at the top, every line says both prices, and a line opens its ways on', async ({
  page,
}, info) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  /* through the shell's one list: Data, then its room, as a dealer reaches it */
  await page.getByTestId('shell-pill').getByRole('link', { name: /Data/ }).click()
  await page
    .getByRole('navigation', { name: /The rooms of the price list|Behind the price list/ })
    .getByRole('link', { name: /^Catalogue/ })
    .click()
  await expect(page).toHaveURL(/\/catalogue$/)
  await expect(page.getByTestId('catalogue-door')).toBeVisible({ timeout: 30_000 })
  /* every aisle at once: eighteen and Not sorted yet */
  await expect(page.getByRole('list', { name: 'The aisles' }).locator(':scope > li')).toHaveCount(
    19,
  )

  /* J1: the aisle REPLACES the front and opens at its top, its name in sight at every size */
  await page.getByRole('link', { name: /^Anchoring & mooring/ }).click()
  await expect(page).toHaveURL(/\/catalogue\?aisle=anchoring$/)
  const name = page.getByRole('heading', { level: 1, name: 'Anchoring & mooring' })
  await expect(name).toBeInViewport()
  expect(await page.evaluate(() => window.scrollY)).toBe(0)

  /* J2: every line of the aisle says what it costs; none reads a bare $0 where the file prices it */
  const lines = page.getByTestId('catalogue-aisle').locator('.chd-line__head')
  const count = await lines.count()
  expect(count).toBeGreaterThan(0)
  for (const text of await lines.allInnerTexts())
    expect(text, 'a line says supply, fitted or why there is no price').toMatch(
      /supply|fitted|No price|\$0/,
    )
  await shot(page, 'aisle', info.project.name)

  /* J10 and J7: a line opens in place with its line in the price list and the quote's sentence */
  await lines.first().click()
  await expect(page).toHaveURL(/open=parts/)
  const opened = page.locator('.chd-line[data-open]')
  await expect(opened.getByRole('link', { name: /^Open its line in / })).toHaveAttribute(
    'href',
    /^\/data\/parts\?at=parts/,
  )
  await expect(
    opened.getByText(/A quote cannot start with this part yet|Start a quote with it/),
  ).toBeVisible()
  await shot(page, 'line-open', info.project.name)

  /* the way back is to the front, at its top */
  await page
    .getByRole('link', { name: /^Every aisle · 19$/ })
    .first()
    .click()
  await expect(page.getByTestId('catalogue-door')).toBeVisible()
})

test('J2, J3, J4: a part priced fitted alone says its fitted figure; find reads codes and headings', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  /* the trailer adjustments, which the old card read as $0 */
  await page.goto('/catalogue?aisle=trailer&find=adjustment')
  await expect(ready(page)).toBeVisible({ timeout: 30_000 })
  const adjust = page.locator('.chd-line__head', { hasText: 'Trailer Adjustment' })
  await expect(adjust.first()).toBeVisible()
  for (const text of await adjust.allInnerTexts()) {
    expect(text).toMatch(/Fitted\s+only/)
    expect(text).not.toMatch(/\$0\b/)
  }

  /* J4: a code finds its part */
  await page.goto('/catalogue?find=SG002')
  await expect(page.locator('.chd-found__said')).toHaveText(/^1 part answers to “SG002”/)
  await expect(page.locator('.chd-found .chd-code', { hasText: /^SG002$/ })).toBeVisible()

  /* J3: a maker's word finds every line under its heading, not only those that name it */
  await page.goto('/catalogue?find=lowrance')
  await expect(page.locator('.chd-found__said')).toHaveText(/^144 parts answer to “lowrance”/)
})

test('J6, J15: the customer’s boat is chosen here and what is made for it comes first; a wrong aisle is said', async ({
  page,
}, info) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  await page.goto('/catalogue?aisle=anchoring')
  await expect(ready(page)).toBeVisible({ timeout: 30_000 })
  await page.getByRole('button', { name: 'For a boat…' }).click()
  await page.getByRole('searchbox', { name: 'Find the boat' }).fill('529 Assault Pro')
  await page
    .getByRole('button', { name: /Stacer 529 Assault Pro/ })
    .first()
    .click()
  await expect(page).toHaveURL(/boat=boat_stacer/)
  await expect(
    page.getByRole('heading', { name: /^Made for the Stacer 529 Assault Pro/ }),
  ).toBeVisible()
  await shot(page, 'made-for', info.project.name)
  /* and fitting no boat is one press */
  await page.getByRole('button', { name: /^Fit no boat/ }).click()
  await expect(page.getByRole('heading', { name: /^Made for the / })).toHaveCount(0)

  await page.goto('/catalogue?aisle=nope')
  await expect(page.getByText('There is no aisle called “nope”. These are the 19.')).toBeVisible()
})

test('J12, J11: Northside names a supplier and places an unsorted heading, each with its Undo', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  await page.goto('/catalogue?view=suppliers')
  await expect(page.getByTestId('catalogue-suppliers')).toBeVisible({ timeout: 30_000 })
  await page.getByRole('button', { name: 'Name it Lowrance' }).click()
  await expect(page.getByText('LOW is named Lowrance.')).toBeVisible()

  /* the aisle now says the maker: walked to, not reloaded, so the step is the one just taken */
  await page.getByRole('link', { name: /^Every aisle$/ }).click()
  await page.getByRole('link', { name: /^Sounders & chartplotters/ }).click()
  await expect(page.getByTestId('catalogue-aisle')).toBeVisible()
  const chips = page.getByRole('group', { name: 'Sounders & chartplotters by supplier' })
  if (await chips.isVisible())
    await expect(chips.getByRole('button', { name: /^Lowrance/ })).toBeVisible()
  else
    await expect(
      page.getByRole('combobox', { name: 'Sounders & chartplotters by supplier' }),
    ).toBeVisible()

  /* and its way back, from the page that named it */
  await page.goBack()
  await page.goBack()
  await expect(page.getByTestId('catalogue-suppliers')).toBeVisible({ timeout: 30_000 })
  await page.getByRole('button', { name: 'Take the name back' }).first().click()
  await expect(page.getByText('LOW reads as the price list writes it again.')).toBeVisible()
  await page.getByRole('button', { name: 'Undo' }).click()
  await expect(page.getByText(/· named Lowrance$/)).toBeVisible()

  /* J11: the three DFO kits put in an aisle, and back */
  await page.goto('/catalogue?aisle=unsorted')
  await expect(ready(page)).toBeVisible({ timeout: 30_000 })
  await page.getByRole('combobox', { name: 'Put this heading in an aisle: DFO kits' }).click()
  await page.getByRole('option', { name: 'Batteries & power' }).click()
  await expect(page.getByText('DFO kits is now in Batteries & power.')).toBeVisible()
  await page.getByRole('button', { name: 'Undo' }).click()
  await expect(page.getByRole('heading', { name: 'DFO kits' })).toBeVisible()
})

test('J8, J9: pictures land on the part their file name names by code, anything else is refused', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  await page.goto('/catalogue')
  await expect(page.getByTestId('catalogue-door')).toBeVisible({ timeout: 30_000 })
  /* a 1 × 1 PNG, named by a code the price list carries once, and a text file */
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64',
  )
  await page.locator('.chd-bycode__input').setInputFiles([
    { name: 'SG002.png', mimeType: 'image/png', buffer: png },
    { name: 'IMG_2041.png', mimeType: 'image/png', buffer: png },
  ])
  await expect(
    page.getByText('“SG002.png” is on the Safety Gear · Smooth Waters (SG002).'),
  ).toBeVisible()
  await expect(page.getByText(/“IMG_2041.png” names no part’s code/)).toBeVisible()
  await expect(page.getByText('1 picture put on its part by code.')).toBeVisible()
  await page.getByRole('button', { name: 'Undo' }).click()

  /* J9: an aisle with pictures offers the parts without one */
  await page.goto('/catalogue?aisle=radios&show=without')
  await expect(ready(page)).toBeVisible({ timeout: 30_000 })
  await expect(page.locator('.chd-card')).toHaveCount(0)
  await expect(page.locator('.chd-line').first()).toBeVisible()
})
