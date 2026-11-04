import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'

/* ============================================================
   WHAT FITS ONE BOAT, IN A REAL BROWSER, AT EVERY SIZE — direction A
   of the fit flow, "Two doors, one page" (docs/directions/fit-flow/).

   Rewritten 2026-11-05 for the owner's new journey: the plate whose
   lines opened one place at a time, its Show all register and its
   toasts are gone, so the old journey's assertions went with them.
   What is asserted now is the walk's own confusions, closed: a page
   that reads top to bottom with nothing to open, a trailer named for
   the boat said as named for it and never as "not made for it", no
   "On the quote" before a quote exists, Take it off only in change
   mode, a line taken off kept in its place, every ticked line on the
   quote Start the quote makes, and the quote bar in the window at
   every size.

   NOTHING IS PLANTED. The boats are the Highfield Patrol 600 and Sport
   560 the boards were drawn on, by their own lines on the price list;
   every figure is the one `src/domain/fitment/page.test.ts` counts.
   ============================================================ */

const PA600 = 'boat_highfield:298'
const SP560 = 'boat_highfield:483'
const OUT = path.join('docs', 'directions', 'fit-flow', 'build-fitment')
mkdirSync(OUT, { recursive: true })

async function onTheBoat(page: Page, boat: string, tail = ''): Promise<void> {
  await throughTheDoor(page)
  await page.goto(`/fitment?boat=${encodeURIComponent(boat)}${tail}`)
  await expect(page.locator('[data-testid="fitment"][data-read][data-boat]')).toBeVisible({
    timeout: 15_000,
  })
}

/** Every transition at rest, then the window or the whole page. */
async function shot(page: Page, name: string, project: string, full = false): Promise<void> {
  await page.evaluate(() =>
    Promise.race([
      Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))),
      new Promise((done) => setTimeout(done, 1000)),
    ]),
  )
  await page.screenshot({ path: path.join(OUT, `${name}-${project}.png`), fullPage: full })
}

/** Where an element stands on the page, not in the window: a click scrolls. */
const onPage = (el: Element): number => el.getBoundingClientRect().top + window.scrollY

/** The page never scrolls sideways. */
async function noSideways(page: Page): Promise<void> {
  const { scroll, width } = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    width: window.innerWidth,
  }))
  expect(scroll, 'the page scrolls sideways').toBeLessThanOrEqual(width)
}

/** The quote bar stands inside the window, over its foot. */
async function barInTheWindow(page: Page): Promise<void> {
  const bar = page.getByRole('region', { name: 'The quote this starts' })
  await expect(bar).toBeVisible()
  const box = (await bar.boundingBox())!
  const height = page.viewportSize()!.height
  expect(box.y + box.height).toBeLessThanOrEqual(height)
  expect(box.y).toBeGreaterThan(height / 2)
}

test('the Patrol 600 reads top to bottom: what goes on it, what is named for it, and why the rest do not', async ({
  page,
}, info) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await onTheBoat(page, PA600, '&from=home')

  /* the title is the model; the version is under it, counted */
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Highfield Patrol 600')
  await expect(page.getByText(/^version \d+ of 10$/)).toBeVisible()
  /* reached from Home, the crumb says Home */
  await expect(page.getByRole('link', { name: 'Home', exact: true }).first()).toBeVisible()
  await barInTheWindow(page)
  await noSideways(page)
  await shot(page, 'pa600-top', info.project.name)

  /* MOTOR: five, the recommended chosen for the quote, and no "On the quote" anywhere */
  const motors = page.getByRole('radiogroup', { name: 'The motor for the quote' })
  await expect(motors.getByRole('radio')).toHaveCount(6)
  await expect(motors.getByRole('radio', { name: /Yamaha F115XB\b(?! ?2)/ })).toBeChecked()
  await expect(motors.getByText('Chosen for the quote')).toHaveCount(1)
  await expect(page.locator('main')).not.toContainText('On the quote')
  await expect(page.locator('main')).not.toContainText('Take it off')
  await expect(
    page.getByRole('heading', { name: 'Why the other 204 Yamahas do not go on it' }),
  ).toBeVisible()

  /* TRAILER: none listed, and the GFAB named for it said as exactly that */
  const trailer = page.getByRole('region', { name: 'Trailer' })
  await expect(trailer).toContainText('No trailer on the price list is listed for the Patrol 600.')
  const named = trailer.getByRole('complementary', { name: 'Named for it, not listed for it' })
  await expect(named).toContainText('GFAB Tandem Axel Trailer t/s Highfield Patrol 600')
  await expect(named).toContainText('$23,063')
  await expect(
    trailer.getByRole('heading', { name: 'Why the other 433 trailers do not go on it' }),
  ).toBeVisible()
  await expect(trailer).not.toContainText(/not made for the Patrol 600/)

  /* FIT-OUT: every line can be added here, and the 41 named for it are counted apart */
  const fitOut = page.getByRole('region', { name: 'Fit-out' })
  await expect(fitOut).toContainText(
    '4 from Dealer Fit Packages and 3 from Parts & Accessories go on it.',
  )
  await expect(fitOut.getByRole('checkbox')).toHaveCount(7)
  await expect(
    fitOut.getByRole('complementary', { name: 'Named for it, not listed for it' }),
  ).toContainText(
    '40 in Dealer Fit Packages and 1 in Parts & Accessories carry PA600 in their name',
  )
  await expect(fitOut).toContainText(
    'The other 1,532 in Dealer Fit Packages and 2,234 in Parts & Accessories are listed for other boats, or for none.',
  )

  /* THE QUOTE THIS STARTS, before the rigging kit whose price is not set */
  const bar = page.getByRole('region', { name: 'The quote this starts' })
  await expect(bar).toContainText('$47,059')
  await expect(bar).toContainText('at Cash, before the rigging kit')
  await expect(bar.getByRole('button', { name: 'Start the quote' })).toBeVisible()

  await shot(page, 'pa600-page', info.project.name, true)
  for (const place of ['motor', 'trailer', 'fitout']) {
    await page.locator(`#fp-${place}`).scrollIntoViewIfNeeded()
    await page.evaluate((p) => document.getElementById(`fp-${p}`)?.scrollIntoView(), place)
    await shot(page, `pa600-${place}`, info.project.name)
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await shot(page, 'pa600-end', info.project.name)
  await noSideways(page)
  expect(errors).toEqual([])
})

test('a part ticked on the Sport 560 is on the quote Start the quote makes, beside the motor and the trailer', async ({
  page,
}, info) => {
  await onTheBoat(page, SP560)
  /* reached from Data's room, the crumb says Data */
  await expect(page.getByRole('link', { name: 'Data', exact: true }).first()).toBeVisible()
  const trailer = page.getByRole('radiogroup', { name: 'The trailer for the quote' })
  await expect(
    trailer.getByRole('radio', {
      name: /REDCO Custom \/ Highfield Sport 560 Aluminium · TA600-MOB/,
    }),
  ).toBeChecked()
  const fitOut = page.getByRole('region', { name: 'Fit-out' })
  await fitOut.getByText('2 x MFM50 Batteries').click()
  await expect(fitOut.getByRole('checkbox', { name: /2 x MFM50 Batteries/ })).toBeChecked()
  await expect(page).toHaveURL(/[?&]fit=/)
  const bar = page.getByRole('region', { name: 'The quote this starts' })
  await expect(bar).toContainText('$66,982')
  await expect(bar).toContainText('5 lines')
  await barInTheWindow(page)
  await shot(page, 'sp560-ticked', info.project.name)

  await bar.getByRole('button', { name: 'Start the quote' }).click()
  await expect(page).toHaveURL(/\/quote\/[^/?]+/, { timeout: 15_000 })
  await expect(page.getByText('2 x MFM50 Batteries').first()).toBeVisible({ timeout: 15_000 })
})

test('change mode: Take it off keeps the motor in its place, tagged, with Put it back and Undo it', async ({
  page,
}, info) => {
  test.setTimeout(120_000)
  await onTheBoat(page, PA600)
  await page.getByRole('button', { name: 'Change what Northside offers' }).click()
  await expect(page).toHaveURL(/[?&]change=1/)
  const band = page.getByRole('region', { name: 'Changing what Northside offers' })
  await expect(band).toContainText('on the Highfield Patrol 600, on all 10 of its versions')
  await expect(page.getByRole('region', { name: 'The quote this starts' })).toHaveCount(0)
  const ledger = page.getByRole('region', { name: 'The changes made here' })
  await expect(ledger).toContainText('No change made here yet')
  await shot(page, 'pa600-change', info.project.name)

  const motor = page.getByRole('region', { name: 'Motor' })
  await expect(motor).toContainText('5 go on it, 14 are not listed for it')
  const takeOff = motor.getByRole('button', { name: 'Take the Yamaha F150XC off the Patrol 600' })
  const before = await takeOff.evaluate(onPage)
  await takeOff.click()
  const putBack = motor.getByRole('button', {
    name: 'Put the Yamaha F150XC back on the Patrol 600',
  })
  await expect(putBack).toBeVisible()
  /* the line stays where it was: its press is where the last one was */
  const after = await putBack.evaluate(onPage)
  expect(Math.abs(after - before)).toBeLessThan(4)
  await expect(motor.getByText('Taken off today')).toBeVisible()
  await expect(ledger).toContainText('1 change made here')
  await expect(ledger).toContainText(
    'The Yamaha F150XC is taken off the Highfield Patrol 600, on all 10 of its versions.',
  )
  await shot(page, 'pa600-change-taken', info.project.name)

  /* back on the selling page, it is said as taken off by Northside, never "not made for it" */
  await ledger.getByRole('button', { name: 'Done' }).click()
  await expect(page).not.toHaveURL(/change=1/)
  const selling = page.getByRole('region', { name: 'Motor' })
  await expect(selling.getByRole('radio')).toHaveCount(5)
  await expect(selling).toContainText('Northside took it off this boat.')
  await expect(page.getByText(/Northside has taken 1 off it\./)).toBeVisible()
  await shot(page, 'pa600-after-taken', info.project.name)

  /* and back again: Put it back, then Undo it gives the take-off back once more */
  await page.getByRole('button', { name: 'Change what Northside offers' }).click()
  await page
    .getByRole('region', { name: 'Motor' })
    .getByRole('button', { name: 'Put the Yamaha F150XC back on the Patrol 600' })
    .click()
  await expect(
    page.getByRole('button', { name: 'Take the Yamaha F150XC off the Patrol 600' }),
  ).toBeVisible()
  await page
    .getByRole('region', { name: 'The changes made here' })
    .getByRole('button', { name: 'Undo it' })
    .click()
  await expect(
    page.getByRole('button', { name: 'Put the Yamaha F150XC back on the Patrol 600' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Put the Yamaha F150XC back on the Patrol 600' }).click()
  await noSideways(page)
})

test('a named trailer is offered on the boat only in change mode, and then it is one to choose', async ({
  page,
}, info) => {
  await onTheBoat(page, PA600, '&change=1&at=trailer')
  const trailer = page.getByRole('region', { name: 'Trailer' })
  await expect(trailer).toBeInViewport()
  const offer = trailer.getByRole('button', {
    name: 'Offer the GFAB Tandem Axel Trailer t/s Highfield Patrol 600 on the Patrol 600',
  })
  await offer.click()
  await expect(trailer.getByRole('button', { name: /^Take the GFAB/ })).toBeVisible()
  await shot(page, 'pa600-change-trailer', info.project.name)
  await page
    .getByRole('region', { name: 'The changes made here' })
    .getByRole('button', { name: 'Undo it' })
    .click()
  await expect(offer).toBeVisible()
})

test('a boat chosen cold from What fits opens on its page', async ({ page }, info) => {
  await throughTheDoor(page)
  await page.goto('/fitment?maker=Highfield')
  await expect(page.locator('[data-testid="fitment"][data-read][data-mode="choose"]')).toBeVisible({
    timeout: 15_000,
  })
  await shot(page, 'choose-highfield', info.project.name)
  await page.getByRole('link', { name: 'Patrol 600 10 versions', exact: true }).click()
  await expect(page.locator('[data-testid="fitment"][data-boat]')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/^Highfield Patrol 600$/)
})
