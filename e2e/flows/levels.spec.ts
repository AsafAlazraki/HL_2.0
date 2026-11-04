import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { nameTheCustomer, openChapter, openThePackage, pickAndStart, written } from '../mint'

/* ============================================================
   PRICES — what the rulers cannot see. The rulers measure the page
   at rest and Stacer's tile pressed open; these press what a dealer
   presses and check where it lands: a question opens in place and the
   address says so, a typed share is counted before anything is
   written, the write is real (still there after a reload, read back
   off the price list this browser keeps), the tile folds back with
   its new fact and ONE Undo that puts all 91 back, a list with no
   price is given one from its own figures and leaves the questions,
   and nothing a press opens is left under the pill.

   The figures are the price list's own: Stacer's 91 boats hold the
   same Trade as Cash, the 309 Skimma at $1,730, which 95% rounds down
   to $1,643; the F90XB is $14,531 at Sell Price and $17,643 at RRP +
   Freight Inc GST. Every press is a person's press; nothing is planted.
   ============================================================ */

async function toPrices(page: Page, list = ''): Promise<void> {
  await page.goto(list === '' ? '/levels' : `/levels?list=${encodeURIComponent(list)}`)
  await expect(page.locator('[data-testid="levels"][data-read]')).toBeVisible({
    timeout: 30_000,
  })
}

const opened = (page: Page) => page.getByTestId('prices-open')
const settled = (page: Page) => page.getByRole('region', { name: /^Settled/ })

/** Nothing the screen drew is under the pill: the open panel's top is clear of its foot. */
async function clearOfThePill(page: Page): Promise<boolean> {
  await page.waitForFunction(() => {
    const y = window.scrollY
    return new Promise((done) => setTimeout(() => done(window.scrollY === y), 300))
  })
  return page.evaluate(() => {
    const pill = document.querySelector('[data-testid="shell-pill"]')?.getBoundingClientRect()
    const open = document.querySelector('[data-testid="prices-open"]')?.getBoundingClientRect()
    if (!pill || !open) return false
    /* the pill is at the top at the desk and the tab bar at the foot in a hand */
    const atTop = pill.top < window.innerHeight / 2
    const inSight = open.top < window.innerHeight && open.bottom > 0
    return inSight && (atTop ? open.top >= pill.bottom - 1 || open.bottom <= pill.top : true)
  })
}

/** One short thing the screen brought into sight stands wholly in sight and wholly clear of the
 *  pill: under it at the desk, above the tab bar in a hand. Read once the page has stopped. */
async function clearOfThePillAt(page: Page, selector: string): Promise<boolean> {
  await page.waitForFunction(() => {
    const y = window.scrollY
    return new Promise((done) => setTimeout(() => done(window.scrollY === y), 300))
  })
  return page.evaluate((sel) => {
    const pill = document.querySelector('[data-testid="shell-pill"]')?.getBoundingClientRect()
    const box = document.querySelector(sel)?.getBoundingClientRect()
    if (!pill || !box) return false
    const atTop = pill.top < window.innerHeight / 2
    const inSight = box.top >= 0 && box.bottom <= window.innerHeight
    return inSight && (atTop ? box.top >= pill.bottom - 1 : box.bottom <= pill.top + 1)
  }, selector)
}

test('asks four questions, and a pressed one opens in place with the F90XB’s two figures, neither chosen', async ({
  page,
}) => {
  await throughTheDoor(page)
  await toPrices(page)
  await expect(page.getByRole('heading', { level: 2, name: /^Yours to choose/ })).toHaveText(
    'Yours to choose 4',
  )
  await expect(opened(page)).toHaveCount(0)

  /* Data stands lit: Prices is a room of the price list */
  await expect(
    page.getByTestId('shell-pill').getByRole('link', { name: /^Data/ }).first(),
  ).toHaveAttribute('aria-current', 'page')

  await page.getByRole('button', { name: /^Yamaha Outboards, 209/ }).click()
  await expect(page).toHaveURL(/list=mot_yamaha/)
  const yamaha = opened(page)
  await expect(yamaha).toHaveAttribute('aria-label', 'Prices of Yamaha Outboards')
  await expect(yamaha.getByRole('button', { name: 'Sell Price, $14,531' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
  await expect(
    yamaha.getByRole('button', { name: 'RRP + Freight Inc GST, $17,643' }),
  ).toHaveAttribute('aria-pressed', 'false')
  expect(await clearOfThePill(page)).toBe(true)

  /* pressed again, it folds */
  await page.getByRole('button', { name: /^Yamaha Outboards, 209/ }).click()
  await expect(opened(page)).toHaveCount(0)
})

test('a share of Cash is counted before it is written, written for real, and one Undo puts all 91 back', async ({
  page,
}) => {
  /* the clock is the page's, so the step line can be read again after a toast's whole life */
  await page.clock.install()
  await throughTheDoor(page)
  await toPrices(page)
  const stacerTile = settled(page).getByRole('button', { name: /^Stacer, 91 boats:/ })
  await stacerTile.click()
  await expect(page).toHaveURL(/list=boat_stacer/)
  const stacer = opened(page)
  expect(await clearOfThePill(page)).toBe(true)

  const share = stacer.getByRole('textbox', { name: 'Trade as a share of Cash, in per cent' })
  await expect(share).toHaveValue('100')
  await expect(
    stacer.getByText('Every Stacer boat with a Cash figure already holds 100% of it as Trade.'),
  ).toBeVisible()

  await share.fill('95')
  await expect(stacer.getByTestId('census')).toHaveText(
    '91 written · 0 already at 95% · 0 with no Cash · 309 Skimma $1,730 → $1,643',
  )
  await expect(stacer.locator('.lv-buyer[data-key="trade"] .lv-buyer__figure')).toHaveText(
    '$1,730 $1,643',
  )
  await stacer.getByRole('button', { name: 'Write 91 Trade figures' }).click()

  /* FOLDED BACK, with its new fact and its one Undo under it — still there long after a toast
     would have gone (built-critique-m3.md: the only Undo of a 91-cell write once lived 8.5 s) */
  await expect(opened(page)).toHaveCount(0)
  await expect(
    settled(page).getByRole('button', { name: 'Stacer, 91 boats: Trade is 95% of Cash' }),
  ).toBeVisible()
  const step = settled(page).getByTestId('last-step')
  await expect(step).toContainText('Trade is 95% of Cash on 91 Stacer boats.')
  await expect(step.getByRole('button', { name: 'Undo' })).toBeFocused()
  await page.clock.fastForward(20_000)
  await expect(step.getByRole('button', { name: 'Undo' })).toBeVisible()

  /* one Undo, every cell back, and the undo says so with the way to put it back */
  await step.getByRole('button', { name: 'Undo' }).click()
  /* said as no longer so, before the claim: 'Undone — Trade is 95%…' read as the price standing
     on a tile that had just lost it (built-critique-m3 §3) */
  await expect(step).toContainText('Undone. No longer so: Trade is 95% of Cash on 91 Stacer boats.')
  await expect(step.locator('[data-kind="undone"]')).toBeVisible()
  await expect(
    settled(page).getByRole('button', { name: 'Stacer, 91 boats: One price for every buyer' }),
  ).toBeVisible()
  await step.getByRole('button', { name: 'Put it back' }).click()

  /* and written for real: the page read again, the 309 Skimma's Trade is still $1,643 */
  await written(page)
  await toPrices(page, 'boat_stacer')
  const trade = opened(page).locator('.lv-buyer[data-key="trade"]')
  await expect(trade.locator('.lv-buyer__figure')).toHaveText('$1,643')
  await expect(trade).toContainText('95% of Cash on 91 of 91.')
})

test('Rigging Kits are priced supplied or fitted, cash and trade, counted first, and leave the questions', async ({
  page,
}) => {
  await throughTheDoor(page)
  await toPrices(page, 'rig_kits')
  const kits = opened(page)
  const way = kits.getByRole('button', { name: /^Supplied, or fitted, \$/ })
  await expect(way).toHaveAttribute('aria-pressed', 'false')
  await way.click()
  await expect(
    kits.getByText(/^628 of 650 rigging kits are priced at their Kit Sell Price/),
  ).toBeVisible()
  const act = kits.getByRole('button', { name: 'Price 628 kits supplied, or fitted' })
  /* the act stands in the window once a way is pressed, at every size, and its bar covers none of
     the count it acts on (the verifier, 2026-11-04: at 390 and 844 × 390 it covered the count's
     second door, and the count was out of sight) */
  await expect(act).toBeInViewport({ ratio: 1 })
  const count = kits.locator('.lv-census')
  await expect(count.getByText(/^628 of 650 rigging kits/)).toBeInViewport({ ratio: 1 })
  await expect
    .poll(async () => {
      const c = await count.boundingBox()
      const bar = await kits.locator('.lv-census__acts').boundingBox()
      return c && bar ? Math.round(bar.y - (c.y + c.height)) : -1
    })
    .toBeGreaterThanOrEqual(0)
  await act.click()

  await expect(page.getByRole('heading', { level: 2, name: /^Yours to choose/ })).toHaveText(
    'Yours to choose 3',
  )
  await expect(
    settled(page).getByRole('button', { name: /^Rigging Kits, 650 kits: .* · 22 not priced$/ }),
  ).toBeVisible()
  await expect(settled(page).getByTestId('last-step')).toContainText(
    '628 of 650 rigging kits are priced at their Kit Sell Price, a trade buyer at Trade Price, fitted at Sell Price and fitted for a trade buyer at Trade Price, from the next quote.',
  )

  /* who chose it, and when, is kept with the price list: it is still said after a reload */
  await written(page)
  await toPrices(page, 'rig_kits')
  await expect(
    opened(page).getByText(
      /(chose “Supplied, or fitted”|“Supplied, or fitted” was chosen) at .* today\./,
    ),
  ).toBeVisible()
  await expect(opened(page).getByRole('table')).toContainText('Rigging Kits')
})

test('a line is looked up by its code, and each buyer’s price stands with its cell, kept in the address', async ({
  page,
}) => {
  await throughTheDoor(page)
  await toPrices(page)
  await page.getByRole('searchbox', { name: 'Find a line by its name or its code' }).fill('F90XB')
  await page.getByRole('list', { name: 'Lines found' }).getByRole('button').first().click()
  await expect(page).toHaveURL(/line=mot_yamaha(~|%7E)/)
  const buyers = page.getByTestId('buyers')
  await expect(buyers).toContainText('$14,531')
  await expect(buyers).toContainText('Sell Price · Motor Library!BF')
  /* the position survives a reload */
  await page.reload()
  await expect(page.getByTestId('buyers')).toContainText('$14,531')
})

test('a count opens the lines behind it on the sheet', async ({ page }) => {
  await throughTheDoor(page)
  await toPrices(page, 'parts')
  await opened(page).getByRole('link', { name: 'Open the 119 at $0 in Sell' }).click()
  await expect(page).toHaveURL(/\/data\/parts\?only=at-most(~|%7E)parts\.l(~|%7E)0/)
  /* the sheet asked exactly that question: its chip says it */
  await expect(page.getByText('Sell at most 0').first()).toBeVisible()
})

test('a settled tile opens across its own row, after the row’s last tile', async ({ page }) => {
  await throughTheDoor(page)
  await toPrices(page, 'boat_stacer')
  const shape = await page.evaluate(() => {
    const grid = document.querySelector('.lv-settled')!
    const across = getComputedStyle(grid).gridTemplateColumns.split(' ').length
    const panel = grid.querySelector('.lv-settled__open')!
    const before = [...grid.children].indexOf(panel)
    return { across, before }
  })
  /* Stacer is the first tile: its panel follows the whole of the first row */
  expect(shape.before).toBe(shape.across)
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
    'What only you can decide about price.',
  )
})

/* ============================================================
   THE BUILD AND PRICES SAY ONE FACT (built-critique-m3.md, blocker 1).
   The Classic 340's build said "Dealer Fit Packages have no price on
   the price list" while the Tube Covers' line holds Sell $2,790 and
   Act Sell $2,834, and the paper printed "Price to be confirmed" under
   a total that left it out. Walked as the dealer walks it: the build
   says the choice Northside has not made, refuses the give with that
   reason, and its door lands on Dealer Fit here; one choice, Back to
   the quote, one press prices the line, and the paper prints its
   figure. Every figure is read off the screen, never typed.
   ============================================================ */
test('the build says a price not chosen, opens it here, and the line takes the choice in one press', async ({
  page,
}) => {
  test.setTimeout(120_000)
  await throughTheDoor(page)
  await pickAndStart(page, 'boat_highfield', 'CL340')
  /* THE QUOTE STARTS WITH THE BOAT ALONE (the owner, 2026-10-30): the Tube Covers the file pairs
     with it, whose list names no price, are put on in Dealer fit by their own press */
  await openChapter(page, /^04 Dealer fit/)
  await page
    .locator('[data-chapter="fit"]')
    .getByRole('button', { name: /^Tube Covers.*, not on the quote$/ })
    .first()
    .click()
  await expect(page.getByTestId('last-step')).toContainText('Tube Covers')

  const total = page.getByTestId('running-total')
  await expect(total).toContainText(
    'Northside has not chosen which figure prices Dealer Fit Packages, so the Tube Covers',
  )
  await expect(page.getByTestId('configurator')).not.toContainText('no price on the price list')

  await nameTheCustomer(page, 'R. Kelleher')
  await openThePackage(page)

  const give = page.getByRole('button', { name: 'Give it to the customer' })
  await expect(give).toHaveAttribute('aria-disabled', 'true')
  /* the refusal is said under the act, at rest, in its own words */
  await expect(page.getByText(/and this quote cannot be given\. Choose it on Prices/)).toBeVisible()

  /* the door lands on the list, open, in sight */
  await page.getByRole('link', { name: 'Choose on Prices' }).click()
  await expect(page).toHaveURL(/\/levels\?list=dealer_fit&quote=/)
  const fit = opened(page)
  await expect(fit).toBeInViewport({ timeout: 10_000 })
  /* READ ON THE QUOTE'S OWN LINE (built-critique-m3-2.md, major 2): it landed on a VHF Radio */
  await expect(fit).toContainText('On your quote')
  await expect(fit).toContainText('Tube Covers to suit PVC Boat')
  await expect(fit).not.toContainText('VHF Radio')
  await fit.getByRole('button', { name: /^Sell, \$/ }).click()
  /* the act arrives in sight once a figure is pressed — at 390 it stood at y 977 of 844. Checked
     before the press, since a press scrolls to what it presses */
  const act = fit.getByRole('button', { name: /^Price [\d,]+ at Sell$/ })
  await expect(act).toBeInViewport({ ratio: 1 })
  await act.click()
  const step = page.getByTestId('last-step')
  await expect(step).toContainText('from the next quote')
  /* and the step, its Undo and the way back stand in sight, clear of the pill, without a scroll
     by anyone — they stood at y 1,006 at 1440 × 900 and y 2,022 at 390 × 844 */
  const back = step.getByRole('button', { name: 'Back to the quote' })
  await expect(back).toBeInViewport({ ratio: 1 })
  await expect(step.getByRole('button', { name: 'Undo' })).toBeInViewport({ ratio: 1 })
  expect(await clearOfThePillAt(page, '[data-testid="last-step"]')).toBe(true)
  await back.click()

  /* back on the finale: the line went on before, and takes the chosen figure in one press */
  await expect(page).toHaveURL(/\/quote\/[^/?]+\?at=finale/)
  const waiting = page.getByText(/went on before Dealer Fit Packages had a price/)
  await expect(waiting).toBeVisible()
  const before = Number(
    await page.locator('.cfg-hand__sum data.ui-price').first().getAttribute('value'),
  )
  const press = page.getByRole('button', { name: /^Price it at \$[\d,]+$/ })
  const figure = Number(
    ((await press.innerText()).match(/\$([\d,]+)/)?.[1] ?? '').replace(/,/g, ''),
  )
  expect(figure).toBeGreaterThan(0)
  await press.click()
  await expect(waiting).toHaveCount(0)
  await expect
    .poll(async () =>
      Number(await page.locator('.cfg-hand__sum data.ui-price').first().getAttribute('value')),
    )
    .toBe(before + figure)
  await expect(give).not.toHaveAttribute('aria-disabled', 'true')
  await give.click()
  await expect(page.getByTestId('given-seal')).toBeVisible()

  /* and the paper prints the figure, never "Price to be confirmed" */
  await page.getByRole('button', { name: 'Open the printed quote' }).first().click()
  await expect(page).toHaveURL(/\/document/)
  await expect(page.locator('.doc-page').first()).toContainText('$')
  const paper = (await page.locator('.doc-page').allInnerTexts()).join('\n')
  expect(paper).not.toContain('Price to be confirmed')
  expect(paper).toContain(`$${figure.toLocaleString('en-AU')}`)
})
