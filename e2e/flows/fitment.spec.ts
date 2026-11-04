import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'

/* ============================================================
   WHAT FITS ONE BOAT, IN A REAL BROWSER, AT EVERY SIZE — direction A
   of the fit flow, "Two doors, one page" (docs/directions/fit-flow/).

   Rewritten 2026-11-05 for the owner's new journey, and again the same
   day for the second cold walk (walk-2-1.md, walk-2-2.md), whose every
   confusion is measured here where it was found:

     · a chip goes to its place, and a tick, a motor chosen or a
       version's place never throws the page to the top;
     · Change what Northside offers lands on its band, and Done on the
       places, wherever on the page they were pressed;
     · the 40 packages named for the Patrol 600 are said by the version
       each is made for, its own shown with what it is;
     · the F150XC and F150XCB told apart; the version picker says what
       the versions cost, never "version 9 of 10";
     · Undo says what is so again; off and back on counts as no change;
     · Another boat is a boat, never the app's whole Find;
     · something not listed for the boat can be found and offered.

   NOTHING IS PLANTED. The boats are the Highfield Patrol 600 and Sport
   560 the boards were drawn on, by their own lines on the price list;
   every figure is the one `src/domain/fitment/*.test.ts` counts.
   ============================================================ */

const PA600 = 'boat_highfield:298'
const SP560 = 'boat_highfield:483'
const OUT = path.join('docs', 'directions', 'fit-flow', 'build-fitment')
const FIX = path.join('docs', 'directions', 'fit-flow', 'fix-2')
mkdirSync(OUT, { recursive: true })
mkdirSync(FIX, { recursive: true })

async function onTheBoat(page: Page, boat: string, tail = ''): Promise<void> {
  await throughTheDoor(page)
  await page.goto(`/fitment?boat=${encodeURIComponent(boat)}${tail}`)
  await expect(page.locator('[data-testid="fitment"][data-read][data-boat]')).toBeVisible({
    timeout: 15_000,
  })
}

/** Every transition at rest, then the window or the whole page. */
async function shot(
  page: Page,
  name: string,
  project: string,
  full = false,
  dir = OUT,
): Promise<void> {
  await page.evaluate(() =>
    Promise.race([
      Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))),
      new Promise((done) => setTimeout(done, 1000)),
    ]),
  )
  await page.screenshot({ path: path.join(dir, `${name}-${project}.png`), fullPage: full })
}

/** Where an element stands on the page, not in the window: a click scrolls. */
const onPage = (el: Element): number => el.getBoundingClientRect().top + window.scrollY

const scrollY = (page: Page): Promise<number> => page.evaluate(() => Math.round(window.scrollY))

/** Where an element's top stands in the window, after any smooth scroll has come to rest. */
async function topInWindow(page: Page, selector: string): Promise<number> {
  await page.waitForFunction(
    () =>
      new Promise((done) => {
        let last = window.scrollY
        let still = 0
        const look = () => {
          if (window.scrollY === last) still += 1
          else still = 0
          last = window.scrollY
          if (still >= 6) done(true)
          else requestAnimationFrame(look)
        }
        requestAnimationFrame(look)
      }),
  )
  return page.locator(selector).evaluate((el) => Math.round(el.getBoundingClientRect().top))
}

/** The page never scrolls sideways. */
async function noSideways(page: Page): Promise<void> {
  const { scroll, width } = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    width: window.innerWidth,
  }))
  expect(scroll, 'the page scrolls sideways').toBeLessThanOrEqual(width)
}

/** The quote bar stands inside the window: over its foot, or on a low window a rail at its end. */
async function barInTheWindow(page: Page): Promise<void> {
  const bar = page.getByRole('region', { name: 'The quote this starts' })
  await expect(bar).toBeVisible()
  const box = (await bar.boundingBox())!
  const { width, height } = page.viewportSize()!
  expect(box.y + box.height).toBeLessThanOrEqual(height)
  expect(box.x + box.width).toBeLessThanOrEqual(width)
  if (height <= 520) expect(box.x).toBeGreaterThan(width / 2)
  else expect(box.y).toBeGreaterThan(height / 2)
}

/** Two boxes share some of the window. */
const overlap = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height

test('the Patrol 600 reads top to bottom: what goes on it, what is named for it, and why the rest do not', async ({
  page,
}, info) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await onTheBoat(page, PA600, '&from=home')

  /* the title is the model; under it what its versions cost, never an ordinal (walk 2, F12) */
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Highfield Patrol 600')
  await expect(page.locator('.fp-version__of')).toHaveText(
    '10 versions, $30,190 to $40,670. This one is the lowest.',
  )
  /* reached from Home, the crumb says Home */
  await expect(page.getByRole('link', { name: 'Home', exact: true }).first()).toBeVisible()
  await barInTheWindow(page)
  await noSideways(page)
  /* the places' chips stand clear of the bar on the first view (walk 2: on the phone they
     peeked out from under it) */
  const chips = (await page.locator('.fp-jump').boundingBox())!
  const quoteBar = (await page
    .getByRole('region', { name: 'The quote this starts' })
    .boundingBox())!
  expect(overlap(chips, quoteBar), 'the chips stand under the quote bar').toBe(false)
  expect(chips.y + chips.height, 'the chips are below the fold').toBeLessThanOrEqual(
    page.viewportSize()!.height,
  )
  await shot(page, 'pa600-top', info.project.name)
  await shot(page, 'fit-01-top', info.project.name, false, FIX)

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
  /* the two F150s told apart by the price list's own columns (walk 2, F10) */
  await expect(motors).toContainText('Control: Mech with Hydraulic Steering')
  await expect(motors).toContainText('Control: DEC with Hydraulic Steering')

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
  /* the answer first (walk 2, F13) */
  await expect(trailer).toContainText(
    'Not offered: the price list does not list it for this boat. Its series names no boat maker, so it is not ruled out either.',
  )

  /* FIT-OUT: every line can be added here, and the 41 named for it said by their version */
  const fitOut = page.getByRole('region', { name: 'Fit-out' })
  await expect(fitOut).toContainText(
    '4 from Dealer Fit Packages and 3 from Parts & Accessories go on it.',
  )
  await expect(fitOut.getByRole('checkbox')).toHaveCount(7)
  const namedFit = fitOut.getByRole('complementary', { name: 'Named for it, not listed for it' })
  await expect(namedFit).toContainText(
    '40 in Dealer Fit Packages and 1 in Parts & Accessories carry PA600 in their name.',
  )
  await expect(namedFit).toContainText('Patrol · PA600 OB PVC · LG-W-DG')
  await expect(namedFit).toContainText(
    'Pre Delivery Allowance (8 hrs) · made for this version, HBP181',
  )
  await expect(namedFit).toContainText(
    '9 more are made for the Patrol 600’s other versions, and can be offered only there; 30 are made for versions the price list does not carry (HBP191 to HBP220), so they are offered on none.',
  )
  await expect(namedFit).not.toContainText('B-B-B')
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
    await page.evaluate((p) => document.getElementById(`fp-${p}`)?.scrollIntoView(), place)
    await shot(page, `pa600-${place}`, info.project.name)
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await shot(page, 'pa600-end', info.project.name)
  await noSideways(page)
  expect(errors).toEqual([])
})

test('a chip goes to its place, and a choice never throws the page to the top', async ({
  page,
}, info) => {
  await onTheBoat(page, PA600, '&from=home')
  const inset = await page.evaluate(
    () =>
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--shell-inset')) || 0,
  )

  /* THE CHIPS (walk 2, F3: "I pressed Trailer and nothing happened") */
  for (const [chip, place] of [
    ['Trailer', 'trailer'],
    ['Fit-out', 'fitout'],
    ['Motor', 'motor'],
  ] as const) {
    await page.evaluate(() => window.scrollTo(0, 0))
    await page
      .locator('.fp-jump')
      .getByRole('link', { name: new RegExp(`^${chip}`) })
      .click()
    await expect(page).toHaveURL(new RegExp(`[?&]at=${place}`))
    const top = await topInWindow(page, `#fp-${place}`)
    expect(top, `${chip} lands under the nav`).toBeGreaterThanOrEqual(inset)
    expect(top, `${chip} lands at the window's top`).toBeLessThanOrEqual(inset + 40)
    if (place === 'trailer') await shot(page, 'fit-02-trailer-chip', info.project.name, false, FIX)
  }

  /* A TICK STAYS WHERE IT WAS PRESSED (walk 2, the blocker: 2,153 px to 0) */
  const vhf = page.getByRole('checkbox', { name: /VHF Radio/ })
  await vhf.scrollIntoViewIfNeeded()
  await page.evaluate(() => window.scrollBy(0, -80))
  const before = await scrollY(page)
  expect(before).toBeGreaterThan(300)
  await page.locator('.fp-line', { has: vhf }).locator('.fp-line__name').click()
  await expect(vhf).toBeChecked()
  await expect(page).toHaveURL(/[?&]fit=/)
  await page.waitForTimeout(400)
  expect(Math.abs((await scrollY(page)) - before), 'a tick moved the page').toBeLessThanOrEqual(2)
  await shot(page, 'fit-03-after-tick', info.project.name, false, FIX)

  /* AND SO DOES A MOTOR CHOSEN (walk 2: 700 px to 0) */
  const f130 = page.getByRole('radio', { name: /Yamaha F130XA/ })
  await f130.scrollIntoViewIfNeeded()
  const atMotor = await scrollY(page)
  await page.locator('.fp-line', { has: f130 }).locator('.fp-line__name').click()
  await expect(f130).toBeChecked()
  await expect(page).toHaveURL(/[?&]motor=/)
  await page.waitForTimeout(400)
  expect(
    Math.abs((await scrollY(page)) - atMotor),
    'a motor chosen moved the page',
  ).toBeLessThanOrEqual(2)
  await expect(page.getByRole('region', { name: 'The quote this starts' })).toContainText(
    'Yamaha F130XA and its rigging kit',
  )
  await shot(page, 'fit-04-after-motor', info.project.name, false, FIX)

  /* ANOTHER BOAT IS A BOAT (walk 2, F11), never the app's whole Find */
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.getByRole('button', { name: 'Another boat' }).click()
  const another = page.getByRole('dialog', { name: 'Another boat' })
  await expect(another).toBeVisible()
  await expect(another).not.toContainText('Back to Home')
  await expect(another.getByRole('searchbox', { name: 'Find a boat' })).toBeVisible()
  await shot(page, 'fit-05-another-boat', info.project.name, false, FIX)
  await page.keyboard.press('Escape')
  await noSideways(page)
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

test('change mode: it lands on its band, keeps a motor taken off in its place, and counts what stands', async ({
  page,
}, info) => {
  test.setTimeout(120_000)
  await onTheBoat(page, PA600)
  const inset = await page.evaluate(
    () =>
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--shell-inset')) || 0,
  )

  /* pressed at the page's foot, it lands on its band, not on the photograph (walk 2, F5) */
  const press = page
    .locator('.fp-decides')
    .getByRole('button', { name: 'Change what Northside offers' })
  await press.scrollIntoViewIfNeeded()
  expect(await scrollY(page)).toBeGreaterThan(600)
  await press.click()
  await expect(page).toHaveURL(/[?&]change=1/)
  const band = page.getByRole('region', { name: 'Changing what Northside offers' })
  await expect(band).toContainText('on the Highfield Patrol 600, on all 10 of its versions')
  const bandTop = await topInWindow(page, '.fp-band')
  expect(bandTop).toBeGreaterThanOrEqual(inset)
  expect(bandTop).toBeLessThanOrEqual(inset + 40)
  await expect(page.getByRole('region', { name: 'The quote this starts' })).toHaveCount(0)
  const ledger = page.getByRole('region', { name: 'The changes made here' })
  await expect(ledger).toContainText('No change made here yet')
  await shot(page, 'pa600-change', info.project.name)
  await shot(page, 'fit-06-change-lands', info.project.name, false, FIX)

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
  /* the sentence is drawn at every size, the sideways phone too (walk 2, F8) */
  await expect(ledger.locator('.fp-bar__names')).toBeVisible()
  await shot(page, 'pa600-change-taken', info.project.name)
  await shot(page, 'fit-07-change-taken', info.project.name, false, FIX)

  /* Undo says what is so again (walk 2, F7), and nothing stands */
  await ledger.getByRole('button', { name: 'Undo it' }).click()
  await expect(ledger).toContainText(
    'Undone: the Yamaha F150XC goes on the Highfield Patrol 600 again, on all 10 of its versions.',
  )
  await expect(ledger).toContainText('No change stands')
  await shot(page, 'fit-08-after-undo', info.project.name, false, FIX)

  /* off and back on is no change (walk 2, F9) */
  await takeOff.click()
  await putBack.click()
  await expect(takeOff).toBeVisible()
  await expect(ledger).toContainText('No change stands')
  await expect(ledger).not.toContainText('2 changes')

  /* take it off once more, and Done lands on the places' chips, never on the photograph */
  await takeOff.click()
  await expect(ledger).toContainText('1 change made here')
  await ledger.getByRole('button', { name: 'Done' }).click()
  await expect(page).not.toHaveURL(/change=1/)
  const jumpTop = await topInWindow(page, '.fp-jump')
  expect(jumpTop).toBeGreaterThanOrEqual(inset)
  expect(jumpTop).toBeLessThanOrEqual(inset + 40)
  const selling = page.getByRole('region', { name: 'Motor' })
  await expect(selling.getByRole('radio')).toHaveCount(5)
  await expect(selling).toContainText('Northside took it off this boat.')
  await expect(page.getByText(/Northside has taken 1 off it\./)).toBeVisible()
  await shot(page, 'pa600-after-taken', info.project.name)

  /* the sentence that names the place is the press to it (walk 2) */
  await selling
    .locator('.fp-reason[data-taken]')
    .getByRole('button', {
      name: 'Change what Northside offers',
    })
    .click()
  await expect(page).toHaveURL(/[?&]change=1/)
  await page
    .getByRole('region', { name: 'Motor' })
    .getByRole('button', { name: 'Put the Yamaha F150XC back on the Patrol 600' })
    .click()
  await expect(
    page.getByRole('button', { name: 'Take the Yamaha F150XC off the Patrol 600' }),
  ).toBeVisible()
  await noSideways(page)
})

test('change mode’s fit-out: its own package offered on this version alone, and something else found and offered', async ({
  page,
}, info) => {
  test.setTimeout(120_000)
  await onTheBoat(page, PA600, '&change=1&at=fitout')
  const fitOut = page.getByRole('region', { name: 'Fit-out' })
  await expect(fitOut).toBeInViewport()
  /* one package, this version's own, never the wall of forty (walk 2, F6) */
  await expect(fitOut.getByRole('button', { name: /^Offer the Patrol · PA600/ })).toHaveCount(1)
  await expect(fitOut).toContainText(
    'Pre Delivery Allowance (8 hrs) · made for this version, HBP181',
  )
  await expect(fitOut).toContainText('9 more are made for the Patrol 600’s other versions')
  await shot(page, 'fit-09-change-fitout', info.project.name, false, FIX)

  const own = fitOut.getByRole('button', {
    name: 'Offer the Patrol · PA600 OB PVC · LG-W-DG on this version of the Patrol 600',
  })
  await own.click()
  const ledger = page.getByRole('region', { name: 'The changes made here' })
  await expect(ledger).toContainText(
    'The Patrol · PA600 OB PVC · LG-W-DG now goes on the Highfield Patrol 600 Open · PVC · Light Grey / White / Dark Grey.',
  )
  await ledger.getByRole('button', { name: 'Undo it' }).click()
  await expect(own).toBeVisible()

  /* something the price list lists for other boats, found by its words and offered */
  const find = fitOut.getByRole('searchbox', { name: 'Offer something else on the Patrol 600' })
  await find.scrollIntoViewIfNeeded()
  await find.fill('VHF')
  await expect(page).toHaveURL(/[?&]offer=VHF/)
  await expect(fitOut.locator('.fp-offer output').first()).toContainText(/found/)
  const first = fitOut
    .locator('.fp-offer')
    .getByRole('button', { name: /^Offer the .+ on the Patrol 600$/ })
    .first()
  await expect(first).toBeVisible()
  await shot(page, 'fit-10-offer-found', info.project.name, false, FIX)
  await first.click()
  await expect(ledger).toContainText(
    'now goes on the Highfield Patrol 600, on all 10 of its versions.',
  )
  await ledger.getByRole('button', { name: 'Undo it' }).click()
  await expect(ledger).toContainText('No change stands')
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

test('on the sideways phone, the bar is a rail beside the lines and covers none of them', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'phone-landscape', 'the sideways phone alone')
  await onTheBoat(page, PA600, '&at=motor')
  /* walk 2, F8: "the nav and the quote bar leave about 240px, so I see one motor card at a time".
     The first motor brought up under the nav, as a scroll down the list would */
  await page
    .locator('#fp-motor .fp-line')
    .first()
    .evaluate((el) => {
      const inset =
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--shell-inset')) ||
        0
      window.scrollBy(0, el.getBoundingClientRect().top - inset - 8)
    })
  const rail = (await page.getByRole('region', { name: 'The quote this starts' }).boundingBox())!
  const { height } = page.viewportSize()!
  const lines = await page.locator('#fp-motor .fp-line').evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect()
      return { x: r.x, y: r.y, width: r.width, height: r.height }
    }),
  )
  for (const line of lines) expect(overlap(line, rail), 'a line runs under the rail').toBe(false)
  const whole = lines.filter((l) => l.y >= 0 && l.y + l.height <= height)
  expect(whole.length, 'motor lines whole in the window').toBeGreaterThanOrEqual(3)
  await shot(page, 'fit-11-landscape-motors', info.project.name, false, FIX)
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
