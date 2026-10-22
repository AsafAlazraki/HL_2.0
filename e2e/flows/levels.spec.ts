import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { written } from '../mint'

/* ============================================================
   PRICES — what the rulers cannot see. The rulers measure the
   ladder at rest and Stacer's figures open; these press what a
   dealer presses and check where it lands: the open list follows the
   address, a typed share is counted before anything is written, the
   write is real (it is still there after a reload, read back off the
   price list this browser keeps), the one Undo puts every cell back,
   and a list with no price is given one from its own figures.

   The figures are the price list's own: Stacer's 91 boats hold the
   same Trade as Cash, the 309 Skimma at $1,730, which 95% rounds down
   to $1,643; the F90XB is $14,531 at Sell Price and $17,643 at RRP +
   Freight Inc GST. Every press is a person's press; nothing is planted.
   ============================================================ */

async function toPrices(page: Page, list = ''): Promise<void> {
  await page.goto(list === '' ? '/levels' : `/levels?list=${encodeURIComponent(list)}`)
  await expect(
    page.locator('[data-testid="levels"][data-read] [data-testid="prices-open"]'),
  ).toBeVisible({ timeout: 30_000 })
}

const opened = (page: Page) => page.getByTestId('prices-open')

test('opens on the Yamahas’ two figures, neither chosen, and a pressed list opens its own', async ({
  page,
}) => {
  await throughTheDoor(page)
  await toPrices(page)

  const yamaha = opened(page)
  await expect(yamaha).toHaveAttribute('aria-label', 'Prices of Yamaha Outboards')
  const sell = yamaha.getByRole('button', { name: 'Sell Price, $14,531' })
  const rrp = yamaha.getByRole('button', { name: 'RRP + Freight Inc GST, $17,643' })
  await expect(sell).toHaveAttribute('aria-pressed', 'false')
  await expect(rrp).toHaveAttribute('aria-pressed', 'false')

  /* Data stands lit: Prices is a room of the price list */
  await expect(
    page.getByTestId('shell-pill').getByRole('link', { name: /^Data/ }).first(),
  ).toHaveAttribute('aria-current', 'page')

  /* the trailers' head opens their figures, the address says so, and the fact is a fact */
  await page.getByRole('button', { name: /^Every trailer, 444 trailers$/ }).click()
  await expect(page).toHaveURL(/list=trailers%3Atrl_redco|list=trailers:trl_redco/)
  await expect(opened(page)).toHaveAttribute('aria-label', 'Prices of Every trailer')
  await expect(
    opened(page).getByText(
      'No Trade price on this list, so a trade buyer’s quote stays at Sell inc Rego.',
    ),
  ).toBeVisible()
})

test('a share of Cash is counted before it is written, written for real, and one Undo puts all 91 back', async ({
  page,
}) => {
  /* the clock is the page's, so the step line can be read again after a toast's whole life */
  await page.clock.install()
  await throughTheDoor(page)
  await toPrices(page, 'boat_stacer')
  const stacer = opened(page)
  const share = stacer.getByRole('textbox', { name: 'Trade as a share of Cash, in per cent' })
  await expect(share).toHaveValue('100')
  await expect(
    stacer.getByText('Every Stacer boat with a Cash figure already holds 100% of it as Trade.'),
  ).toBeVisible()

  await share.fill('95')
  await expect(stacer.getByText('309 Skimma: $1,730 →')).toBeVisible()
  await expect(stacer.getByText('$1,643', { exact: true }).first()).toBeVisible()
  const act = stacer.getByRole('button', { name: 'Set on 91 Stacer boats' })
  await act.click()

  /* THE STEP LINE says what was written, with its way back, under the act that wrote it — and
     it is still there long after a toast would have gone (built-critique-m3.md: the only Undo
     of a 91-cell write was a toast that lived 8.5 s) */
  const step = stacer.getByTestId('last-step')
  await expect(step).toContainText('Trade is 95% of Cash on 91 Stacer boats.')
  await page.clock.fastForward(20_000)
  await expect(step.getByRole('button', { name: 'Undo' })).toBeVisible()
  await expect(
    stacer.getByText('Every Stacer boat with a Cash figure already holds 95% of it as Trade.'),
  ).toBeVisible()
  await expect(page.locator('.lv-pair')).toContainText('$1,643')

  /* one Undo, every cell back, and the undo says so with the way to put it back */
  await step.getByRole('button', { name: 'Undo' }).click()
  await expect(page.locator('.lv-pair')).toContainText('$1,730')
  await expect(step).toContainText('Undone — Trade is 95% of Cash on 91 Stacer boats.')
  await expect(step.getByRole('button', { name: 'Put it back' })).toBeVisible()
  await expect(stacer.getByRole('button', { name: 'Set on 91 Stacer boats' })).toBeVisible()

  /* and written for real: set again, the page read again, it is still there */
  await stacer.getByRole('button', { name: 'Set on 91 Stacer boats' }).click()
  await written(page)
  await toPrices(page, 'boat_stacer')
  await expect(page.locator('.lv-pair')).toContainText('$1,643')
})

test('Rigging Kits are given a price from their own figures, and the ladder says so', async ({
  page,
}) => {
  await throughTheDoor(page)
  await toPrices(page, 'rig_kits')
  const kits = opened(page)
  await expect(kits.getByRole('heading', { name: 'Name the price' })).toBeVisible()
  const kit = kits.getByRole('button', { name: /^Kit Sell Price, \$/ })
  await expect(kit).toHaveAttribute('aria-pressed', 'false')
  await kit.click()
  await expect(
    page.getByText('Every Rigging Kits line is priced at its Kit Sell Price from the next quote.'),
  ).toBeVisible()
  /* the list is priced now: its figures read Kit Sell Price, and nothing is left to name */
  await expect(kits.getByRole('heading', { name: /^Cash · Kit Sell Price$/ })).toBeVisible()
})

test('the screen is found by typing its name in the finder', async ({ page }, info) => {
  test.skip(
    info.project.name.startsWith('phone') || info.project.name === 'tablet',
    'the chord is the fine pointer’s',
  )
  await throughTheDoor(page)
  await page.keyboard.press('Control+k')
  const finder = page.getByTestId('shell-finder')
  await expect(finder).toBeVisible()
  await page.keyboard.type('prices')
  await finder
    .getByRole('option', { name: /^Prices/ })
    .first()
    .click()
  await expect(page).toHaveURL(/\/levels$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Which price each customer pays.',
  )
})

test('a list pressed at the desk opens under its own flight, and its heads are never left under the pill', async ({
  page,
}, info) => {
  test.skip(
    !['laptop', 'desktop', 'wide'].includes(info.project.name),
    'the ladder is the desk’s; a hand has a card per list',
  )
  await throughTheDoor(page)
  await toPrices(page, 'boat_stacer')
  /* Stacer's figures open under the boats' flight, before the second flight */
  const flights = page.locator('.lv-flight')
  await expect(flights).toHaveCount(2)
  const order = await page.evaluate(() => {
    const dock = document.querySelector('[data-testid="prices-open"]')
    const [boats, rest] = document.querySelectorAll('.lv-flight')
    return [dock?.previousElementSibling === boats, dock?.nextElementSibling === rest]
  })
  expect(order).toEqual([true, true])

  /* the Yamahas pressed: their figures open under the second flight, and wherever the screen
     settles, no list's head stands under the pill */
  await page.getByRole('button', { name: /^Yamaha Outboards, 209/ }).click()
  await expect(opened(page)).toHaveAttribute('aria-label', 'Prices of Yamaha Outboards')
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.querySelector('[data-testid="prices-open"]')?.previousElementSibling ===
          document.querySelectorAll('.lv-flight')[1],
      ),
    )
    .toBe(true)
  await page.waitForFunction(() => {
    const y = window.scrollY
    return new Promise((done) => setTimeout(() => done(window.scrollY === y), 300))
  })
  const covered = await page.evaluate(() => {
    const pill = document.querySelector('[data-testid="shell-pill"]')!.getBoundingClientRect()
    return [...document.querySelectorAll('[data-head]')]
      .map((h) => h.getBoundingClientRect())
      .filter(
        (r) => r.bottom > 0 && r.top < pill.bottom && r.right > pill.left && r.left < pill.right,
      ).length
  })
  expect(covered).toBe(0)
})
