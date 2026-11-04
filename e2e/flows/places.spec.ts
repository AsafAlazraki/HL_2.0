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
    .getByRole('complementary', { name: 'Goes with' })
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

/* ============================================================
   THE LINE-UP (2026-11-04, the data round's direction A): every press
   a person makes on a model lands where it says, and every position is
   in the address, so a reload stands where it was.
   ============================================================ */

test('a series filters the models in place, and a reload stands on it', async ({ page }) => {
  await toPlace(page, '/places/boat_highfield')
  /* every model of a maker this large: two dozen first, the rest one press away */
  await expect(page.locator('.pl-card')).toHaveCount(24)
  await page.getByRole('button', { name: 'Show all 67 models' }).click()
  await expect(page).toHaveURL(/models=all/)
  await expect(page.locator('.pl-card')).toHaveCount(67)
  const tile = page.locator('.pl-series').getByRole('button', { name: /^Sport/ })
  if (await tile.isVisible()) await tile.click()
  else {
    await page.locator('.pl-chooser').getByRole('combobox').click()
    await page.getByRole('option', { name: /^Sport/ }).click()
  }
  await expect(page).toHaveURL(/\/places\/boat_highfield\?series=Sport$/)
  await expect(page.locator('.pl-card')).toHaveCount(16)
  await page.reload()
  await expect(page.locator('[data-testid="place"][data-read]')).toBeVisible({ timeout: 30_000 })
  await expect(page.locator('.pl-card')).toHaveCount(16)
})

test('a model’s What fits opens Fitment on that boat, and its Quote it opens the picker on that model', async ({
  page,
}) => {
  await toPlace(page, '/places/boat_highfield?series=Sport')
  const sport = page.locator('.pl-card', {
    has: page.getByRole('heading', { name: 'Sport 660', exact: true }),
  })
  await expect(sport).toContainText('from $61,700')
  await sport.getByRole('link', { name: 'What fits the Highfield Sport 660' }).click()
  await expect(page).toHaveURL(/\/fitment\?boat=boat_highfield(%3A|:)513$/)
  await page.goBack()
  await expect(page.locator('[data-testid="place"][data-read]')).toBeVisible({ timeout: 30_000 })
  await page
    .locator('.pl-card', { has: page.getByRole('heading', { name: 'Sport 660', exact: true }) })
    .getByRole('link', { name: 'Quote the Highfield Sport 660' })
    .click()
  await expect(page).toHaveURL(/\/quote\/new\?brand=boat_highfield&model=boat_highfield(%3A|:)513$/)
  await expect(page.getByRole('complementary', { name: 'What is chosen' })).toBeVisible({
    timeout: 15_000,
  })
})

test('two boats set side by side stand in the address, and the compare opens in place', async ({
  page,
}) => {
  await toPlace(page, '/places/boat_highfield?series=Sport')
  for (const said of ['Sport 600', 'Sport 660']) {
    await page
      .locator('.pl-card', { has: page.getByRole('heading', { name: said, exact: true }) })
      .getByRole('button', { name: `Compare the ${said}` })
      .click()
  }
  await page.getByRole('button', { name: 'Compare 2' }).click()
  await expect(page).toHaveURL(/compare=.+&see=compare|see=compare.+compare=/)
  const sheet = page.getByRole('region', { name: 'Sport 600 and Sport 660, side by side' })
  await expect(sheet).toBeVisible()
  await expect(sheet.getByRole('rowheader', { name: 'Length' })).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole('region', { name: 'Sport 600 and Sport 660, side by side' }),
  ).toBeVisible({ timeout: 30_000 })
})

test('a compare opened at the page’s end lands with no series tile under the floating bar', async ({
  page,
}) => {
  /* the Sport 600 and the Sport 660 chosen, the compare closed, the page at its end where the
     head is let go (verify-2, gap 1: at 1280 and 1440 the tiles' names stood under the bar) */
  await toPlace(
    page,
    '/places/boat_highfield?series=Sport&compare=boat_highfield%3A498%2Cboat_highfield%3A513',
  )
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.waitForTimeout(300)
  const press = page.getByRole('button', { name: 'Compare 2' }).filter({ visible: true })
  await press.first().evaluate((el) => (el as HTMLElement).focus({ preventScroll: true }))
  await page.keyboard.press('Enter')
  await expect(page.locator('.pl-compare')).toBeVisible()
  /* until the scroll the press began has come to rest: the same place twice, 250ms apart */
  await page.evaluate(async () => {
    await new Promise((rest) => setTimeout(rest, 250))
    for (let i = 0; i < 40; i++) {
      const y = window.scrollY
      await new Promise((rest) => setTimeout(rest, 250))
      if (window.scrollY === y) return
    }
  })
  const under = await page.evaluate(() => [
    ...new Set(
      [...document.querySelectorAll('.pl-series :is(.pl-stile__name, .pl-stile__sub)')]
        .filter((words) => {
          const r = words.getBoundingClientRect()
          const y = r.top + r.height / 2
          if (r.width === 0 || y < 0 || y > window.innerHeight) return false
          /* under the floating bar AND shown through it: the topmost thing at the words is the
             bar, and the first thing of the page beneath it is the tile, not the head's ground */
          const hits = document.elementsFromPoint(r.left + Math.min(r.width / 2, 12), y)
          const main = document.querySelector('main')!
          const beneath = hits.find((el) => main.contains(el))
          return (
            hits[0] !== undefined && !main.contains(hits[0]) && !!beneath?.closest('.pl-series')
          )
        })
        .map(
          (words) =>
            words.closest('.pl-stile')?.querySelector('.pl-stile__name')?.textContent ?? '',
        ),
    ),
  ])
  expect(under).toEqual([])
  const dock = page.locator('.pl-dock')
  const docks = await dock.evaluate(
    (el) => getComputedStyle(el).getPropertyValue('--docks').trim() === '1',
  )
  if (docks) await expect(dock).toHaveAttribute('data-stuck', '')
})

test('Yamaha reads by horsepower, a rating opening in the address', async ({ page }) => {
  await toPlace(page, '/places/mot_yamaha')
  const ladder = page.getByRole('group', { name: 'By horsepower' })
  if (await ladder.isVisible()) await ladder.getByRole('button', { name: /^150 hp/ }).click()
  else {
    await page.locator('.pl-chooser').getByRole('combobox').click()
    await page.getByRole('option', { name: /^150 hp/ }).click()
  }
  await expect(page).toHaveURL(/in=/)
  await expect(page.getByRole('heading', { name: /^150 hp/ })).toBeVisible()
  await expect(page.getByText('F150XC', { exact: true })).toBeVisible()
})
