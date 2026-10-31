import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { openChapter, pickAndStart, written } from '../mint'

/* ============================================================
   FITMENT, IN A REAL BROWSER, AT EVERY SIZE — what the five rulers
   cannot see.

   The rulers read contrast, cut, overlap, focus and the line count.
   What they cannot read is whether the figures are the price list's own
   and add up, whether a reason says the engine's words, whether a press
   on a reason's door really lands on the line of the price list that
   decides it and comes back, whether the trailer's ATM is set against
   what really goes on the road, and whether the screen can be found by
   typing. That is what is below.

   NOTHING IS PLANTED. The boat is the SP660 the board was drawn on, by
   its own line on the price list; every count is the one the domain's
   own tests assert on the same file (`src/domain/fitment/plate.test.ts`).
   ============================================================ */

const SP660 = 'boat_highfield:513'
const AT_REST = `/fitment?boat=${encodeURIComponent(SP660)}`

async function onTheBoat(page: Page, tail = ''): Promise<void> {
  await throughTheDoor(page)
  await page.goto(`${AT_REST}${tail}`)
  await expect(page.locator('[data-testid="fitment"][data-read][data-boat]')).toBeVisible({
    timeout: 15_000,
  })
}

const numbers = async (page: Page, where: string): Promise<number[]> =>
  (await page.locator(`${where} .ft-reason__n`).allTextContents()).map((t) =>
    Number(t.replace(/,/g, '')),
  )

test('the boat on its plate, its motor line open, every figure counted off the price list', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await onTheBoat(page)

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Highfield Sport 660')
  const lines = page.getByRole('list', { name: 'What the Highfield Sport 660 takes' })
  const motorLine = lines.getByRole('button', { name: /^Motor 150–200 hp one motor/ })
  await expect(motorLine).toHaveAttribute('aria-pressed', 'true')
  await expect(motorLine).toContainText('7 of 209 offered')
  await expect(lines.getByRole('button', { name: /^Trailer built for Highfield/ })).toContainText(
    '2 of 434 offered · one on a new quote',
  )
  /* the verdict's must-change: no column or cell of the price list is lettered on the plate */
  const plate = page.getByRole('region', { name: 'Highfield Sport 660' })
  await expect(plate).not.toContainText(/Min HP|Max HP|Boat Module|Boat Weight/)

  /* the answer: seven priced tiles, the recommended starred; then the other 202 by reason */
  const motor = page.getByRole('region', { name: /^Motor/ })
  const tiles = motor.getByRole('list', { name: 'Made for it' }).getByRole('listitem')
  await expect(tiles).toHaveCount(7)
  await expect(tiles.first()).toContainText('F175XC')
  await expect(tiles.first()).toContainText('$25,355')
  await expect(tiles.first().getByLabel('Recommended')).toBeVisible()
  const counts = await numbers(page, '.ft-open')
  expect(counts).toEqual([74, 51, 30, 47])
  expect(7 + counts.reduce((a, b) => a + b, 0)).toBe(209)

  /* nothing here is laid wider than the window */
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(wide, 'no sideways scroll').toBeLessThanOrEqual(0)
  expect(errors, 'no page error').toEqual([])
})

test('a reason opens the line of the price list that decides it, and one Back comes home', async ({
  page,
}) => {
  await onTheBoat(page)
  const over = page
    .locator('.ft-reason')
    .filter({ hasText: 'Over the 150–200 hp this boat takes.' })
  /* the engine's own sentence, and the nearest motor it rules out, struck */
  await expect(over).toContainText('Yamaha F225UCB')
  await over.getByRole('link', { name: /horsepower on the price list/ }).click()
  await expect(page).toHaveURL(/\/data\/boat_highfield\?at=boat_highfield%3A513/)
  await expect(page.getByTestId('sheet')).toBeVisible({ timeout: 15_000 })

  await page.goBack()
  await expect(page).toHaveURL(/\/fitment\?boat=boat_highfield%3A513$/)
  await expect(page.locator('[data-testid="fitment"][data-mode="plate"]')).toBeVisible()

  /* "Show these" opens exactly that reason's motors, named and counted, with Show all past it */
  await page.getByRole('button', { name: /^Show these 51:/ }).click()
  await expect(page).toHaveURL(/all=motor/)
  await expect(page).toHaveURL(/only=over/)
  await expect(page.getByText('51 of 209', { exact: true })).toBeVisible()
  const grid = page.getByRole('grid', { name: /every one, grouped by why/ })
  await expect(grid.getByRole('columnheader')).toHaveCount(1)
  await expect(grid.getByRole('columnheader')).toContainText('Over the 150–200 hp this boat takes.')
  /* A LIST TO READ, NOT A DELETED ONE (built-critique-m3.md, major 6): under a head that says
     why, no name is struck, and the lit line — the one carrying "On the price list" — sets its
     facts and its price at the same x as every line under it */
  const lines = grid.locator('.ft-line')
  const struck = await lines.evaluateAll((all) =>
    all.filter((l) =>
      [...l.querySelectorAll('*')].some((e) =>
        getComputedStyle(e).textDecorationLine.includes('line-through'),
      ),
    ),
  )
  expect(struck).toHaveLength(0)
  await expect(lines.first().getByRole('link', { name: /on the price list/ })).toBeVisible()
  const xs = await lines.evaluateAll((all) =>
    all
      .slice(0, 4)
      .map((l) => [
        Math.round(l.querySelector('.ft-line__facts')!.getBoundingClientRect().x),
        Math.round(l.querySelector('.ft-line__price')!.getBoundingClientRect().right),
      ]),
  )
  expect(new Set(xs.map(([facts]) => facts)).size).toBe(1)
  expect(new Set(xs.map(([, price]) => price)).size).toBe(1)
  await page.getByRole('button', { name: 'Show all 209' }).click()
  await expect(page).not.toHaveURL(/only=/)
  await expect(grid.getByRole('columnheader').first()).toContainText('Offered on this boat.')
})

test('the trailer line: what goes on the road against each ATM, and one trailer to a boat', async ({
  page,
}) => {
  await onTheBoat(page)
  await page.getByRole('button', { name: /^Trailer built for Highfield/ }).click()
  await expect(page).toHaveURL(/line=trailer/)
  const trailer = page.getByRole('region', { name: 'Trailer' })
  /* the laden figure the price list supports, never the bare hull (the verdict's correction) */
  await expect(trailer).toContainText(
    'The Highfield Sport 660, 740 kg, and its F175XC, 220 kg: 960 kg on the trailer, before fuel and gear.',
  )
  await expect(trailer).toContainText('1,340 kg on the road: 650 kg to spare.')
  await expect(trailer).not.toContainText('clears it by')
  await expect(
    trailer.getByText('One trailer to a boat, because a boat sits on one trailer.'),
  ).toHaveCount(1)
  await expect(trailer.getByText('On a new quote')).toBeVisible()

  /* the other 432 in three reasons that add up, the ten no longer sold said beside them */
  const counts = await numbers(page, '.ft-open')
  expect(counts).toEqual([10, 131, 291])
  expect(2 + counts.reduce((a, b) => a + b, 0)).toBe(434)
  await expect(trailer.getByText(/^10 more are no longer sold/)).toBeVisible()

  /* the tick of the trailer that clears it stands before the end of the bar it clears */
  const bar = trailer.locator('.ft-trl[data-star] .ft-atm')
  const rated = await bar.locator('.ft-atm__rated').boundingBox()
  const tick = await bar.locator('.ft-atm__load').boundingBox()
  expect(tick!.x).toBeLessThan(rated!.x + rated!.width)
})

test('show all draws every trailer grouped by why, finds past the narrowing, and opens the deciding line', async ({
  page,
}) => {
  await onTheBoat(page, '&line=trailer')
  await page.getByRole('button', { name: 'Show all 434, each with its reason' }).click()
  await expect(page).toHaveURL(/all=trailer/)
  const grid = page.getByRole('grid', { name: /every one, grouped by why/ })
  await expect(grid).toBeVisible()
  await expect(grid.getByRole('columnheader').first()).toContainText('Offered on this boat.')
  await expect(
    grid.getByRole('columnheader', { name: /Built for Stacer, not Highfield/ }),
  ).toBeVisible()

  /* a trailer not made for the boat is still found by its words: the search is the whole list's */
  await page.getByRole('searchbox', { name: 'Find in Trailers' }).fill('TALS650S13')
  await expect(page.getByRole('status')).toContainText('1 of 434 carries those words.')
  await expect(page).toHaveURL(/find=TALS650S13/)

  /* the grid's own line opens where it is decided: the trailer's own line, whose series is the cell */
  await grid.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/data\/trl_[a-z]+\?at=/)
  await page.goBack()
  await expect(page).toHaveURL(/all=trailer/)

  await page.getByRole('button', { name: 'Back to the boat' }).click()
  await expect(page.locator('[data-testid="fitment"][data-mode="plate"]')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Trailer' })).toBeVisible()
})

test('the screen is found by typing its name in the finder, and Data stands lit', async ({
  page,
}, info) => {
  test.skip(
    info.project.name.startsWith('phone') || info.project.name === 'tablet',
    'the chord is the fine pointer’s',
  )
  await throughTheDoor(page)
  await page.keyboard.press('Control+k')
  const finder = page.getByTestId('shell-finder')
  await expect(finder).toBeVisible()
  await page.keyboard.type('fitment')
  await finder
    .getByRole('option', { name: /^Fitment/ })
    .first()
    .click()
  await expect(page).toHaveURL(/\/fitment$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Which boat?')
  await page.getByRole('searchbox', { name: 'Find a boat' }).fill('HBS145')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/boat=boat_highfield%3A513/)
  await expect(page.locator('[data-testid="fitment"][data-boat]')).toBeVisible()
})

/* ONE NUMBER ON BOTH SCREENS (built-critique-m3.md, blocker 4). With "a tiller boat must take a
   tiller motor" written on /rules — the walk `rules.spec.ts` makes, by a person's presses — the
   Classic 340's F25SWTC is said once on Fitment, as the rule's reason with the rule's because,
   and the motor line counts the 2 the build offers, where it once said "3 of 209" while the
   build's "Back to the 3 made for this boat" opened on 2. Both screens are read. */
const CL340 = 'boat_highfield:124'
const BECAUSE = 'a tiller boat has no helm to steer a remote motor from'

test('a motor the dealer’s rule refuses is said with the rule’s because, and counted as the build counts it', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)

  /* the rule, written as a dealer writes it */
  await page.goto('/rules')
  await expect(page.locator('[data-testid="rules"][data-read]')).toBeVisible({ timeout: 30_000 })
  /* the rule goes where what the customer is buying is: under Motors (`rules.spec.ts`'s walk) */
  await page.getByRole('button', { name: 'Write a rule about motors' }).click()
  const choose = async (word: string, choice: RegExp): Promise<void> => {
    await page.getByRole('combobox', { name: word }).click()
    await page.getByRole('option', { name: choice }).click()
    await expect(page.getByRole('listbox')).toBeHidden()
  }
  await choose('Which of the boat’s specs', /^steering$/)
  await choose('The boat’s steering', /^tiller\b/)
  await choose('Which of the motor’s specs', /^controls$/)
  await choose('The motor’s controls', /^Tiller handle\b/)
  await page.getByRole('textbox', { name: 'Because' }).fill(BECAUSE)
  await page.getByRole('button', { name: /^Add it as / }).click()
  await expect(
    page.getByText('Your rule is on. The build refuses from the next pick.'),
  ).toBeVisible()
  await written(page)

  /* Fitment: the F25SWTC said once, as the rule's reason with its own because, and the motor
     line counts the 2 the build offers */
  await page.goto(`/fitment?boat=${encodeURIComponent(CL340)}`)
  await expect(page.locator('[data-testid="fitment"][data-read][data-boat]')).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.getByRole('button', { name: /^Motor/ })).toContainText('2 of 209 offered')
  const motor = page.getByRole('region', { name: /^Motor/ })
  const ruled = motor.locator('.ft-reason[data-ruled]')
  await expect(ruled).toContainText(
    'Not offered on this boat, because one of your rules refuses it.',
  )
  await expect(ruled).toContainText('Yamaha F25SWTC')
  await expect(ruled).toContainText(BECAUSE)
  await expect(motor.getByRole('list', { name: 'Made for it' }).getByRole('listitem')).toHaveCount(
    2,
  )

  /* the build on the same boat: the list past the narrowing, and the way back says the same 2 */
  await pickAndStart(page, 'boat_highfield', 'CL340')
  /* every chapter stands open (2026-10-31): the motor's is opened only where it was folded, and a
     head no longer writes the address */
  await openChapter(page, /^02 Motor/)
  const motors = page.locator('[data-chapter="motor"]')
  await motors
    .getByRole('button', { name: /^Show all [\d,]+ in / })
    .first()
    .click()
  await expect(
    motors.getByRole('button', { name: 'Back to the 2 made for this boat' }),
  ).toBeVisible()
  await expect(motors.getByRole('button', { name: /Back to the 3 made/ })).toHaveCount(0)
})

/* A BOAT WITH NO PICTURE HAS NO WINDOW (built-critique-m3.md saw four discs round an empty box on
   the old ring). The Classic 340 has no picture this browser can draw: its plate has no window,
   and the motor's answer still stands under the plate. Never a stand-in boat. */
test('a boat with no picture has no window on its plate, at a desk and on a phone', async ({
  page,
}) => {
  await throughTheDoor(page)
  for (const size of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(size)
    await page.goto(`/fitment?boat=${encodeURIComponent(CL340)}`)
    await expect(page.locator('[data-testid="fitment"][data-read][data-boat]')).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.locator('.ft-window')).toHaveCount(0)
    await expect(page.getByText(/No photograph/)).toHaveCount(0)
    const plate = await page.getByRole('region', { name: 'Highfield Classic 340' }).boundingBox()
    const motor = await page.getByRole('region', { name: /^Motor/ }).boundingBox()
    expect(motor!.y).toBeGreaterThan(plate!.y + plate!.height)
  }
})

test('the cold chooser offers every maker and walks maker, model, version to the boat', async ({
  page,
}) => {
  await throughTheDoor(page)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/fitment')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Which boat?', {
    timeout: 15_000,
  })
  /* THE PLATE ASKS (built-critique-m3.md, major 7): the plate stands with the question as its
     name, the field and every maker's own mark on it, and one unit on the line — 289 models */
  const plate = page.getByRole('region', { name: 'Which boat?' })
  await expect(plate.getByRole('searchbox', { name: 'Find a boat' })).toBeVisible()
  await expect(plate.getByText('Or by maker · 289 models')).toBeVisible()
  const marks = plate.locator('.ft-mk__img')
  await expect(marks).toHaveCount(6)
  /* every mark held is really drawn, not a broken picture */
  await expect
    .poll(() =>
      marks.evaluateAll((all) =>
        all.every(
          (m) => (m as HTMLImageElement).complete && (m as HTMLImageElement).naturalWidth > 0,
        ),
      ),
    )
    .toBe(true)
  await expect(plate.getByText('Also made for it')).toBeVisible()
  /* one price list, one size: Highfield is the 67 models Home's door and the picker count */
  await expect(page.getByRole('button', { name: /^Stacer\s*91 models$/ })).toBeVisible()
  await page.getByRole('button', { name: /^Highfield\s*67 models$/ }).click()
  await expect(page.getByText('Highfield · 67 models')).toBeVisible()
  await page.getByRole('button', { name: /^Classic 340\s*9 versions/ }).click()
  await page.getByRole('link', { name: /^PVC · White \/ White \/ Wood Dark/ }).click()
  await expect(page).toHaveURL(/boat=boat_highfield%3A124/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Highfield Classic 340')
})
