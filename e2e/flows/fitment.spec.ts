import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { pickAndStart, written } from '../mint'

/* ============================================================
   FITMENT, IN A REAL BROWSER, AT EVERY SIZE — what the five rulers
   cannot see.

   The rulers read contrast, cut, overlap, focus and the line count.
   What they cannot read is whether the figures are the price list's own
   and add up, whether a struck thing says the engine's reason, whether a
   press on a struck thing really lands on the line of the price list
   that decides it and comes back, and whether the screen can be found
   by typing. That is what is below.

   NOTHING IS PLANTED. The boat is the SP660 the board was drawn on, by
   its own line on the price list; every count is the one the domain's
   own test asserts on the same file (`src/domain/fitment/boat.test.ts`).
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

test('the boat, its motor and its trailers, counted off the price list and adding up', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await onTheBoat(page)

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Highfield Sport 660')
  /* the motor: the star, the envelope as a fact, the narrowing counted with its way past */
  await expect(page.getByText('Yamaha F175XC', { exact: true })).toBeVisible()
  await expect(page.getByText('150–200 hp', { exact: false }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Show all 209' })).toBeVisible()
  await expect(page.getByText('7 of 209')).toBeVisible()

  /* the trailers: ONE universe — 2 made for the boat, and the other 432 in three reasons that
     sum to it; the ten no longer sold said beside it and never inside it */
  await expect(page.getByText('2 of 434')).toBeVisible()
  await expect(page.getByText('The other 432, and why each is not offered')).toBeVisible()
  const reasons = page.locator('.ft-reason__n')
  const counts = (await reasons.allTextContents()).map((t) => Number(t.replace(/,/g, '')))
  expect(counts).toEqual([10, 131, 291])
  expect(counts.reduce((a, b) => a + b, 0)).toBe(432)
  await expect(page.getByText(/^10 more are no longer sold/)).toBeVisible()

  /* one boat, one trailer: the rule said once, the REDCO on a new quote, the GFAB in its place */
  await expect(
    page.getByText('One trailer to a boat, because a boat sits on one trailer.'),
  ).toHaveCount(1)
  await expect(
    page.getByText('Rated 1,990 kg · the boat weighs 740 kg · clears it by 1,250 kg'),
  ).toBeVisible()

  /* nothing here is laid wider than the window */
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(wide, 'no sideways scroll').toBeLessThanOrEqual(0)
  expect(errors, 'no page error').toEqual([])
})

test('a motor in the boat’s range says why it is not offered, and opens the price list and comes back', async ({
  page,
}) => {
  await onTheBoat(page)
  const dot = page.getByRole('button', { name: /^Yamaha F150XC, 150 hp, in its range/ })
  await dot.click()
  await expect(page).toHaveURL(/[?&]at=/)
  const note = page.locator('.ft-note')
  await expect(note).toContainText('Yamaha F150XC')
  /* the engine's own sentence, from @/domain/fitment — never a component's */
  await expect(note).toContainText(
    'Not made for this boat, though it is inside the 150–200 hp it takes.',
  )

  await note.getByRole('link', { name: /See what fits on the price list/ }).click()
  await expect(page).toHaveURL(/\/data\/join_hf_yam\?/)
  await expect(page.getByTestId('sheet')).toBeVisible({ timeout: 15_000 })

  /* ONE BACK, and the same boat with the same note open */
  await page.goBack()
  await expect(page).toHaveURL(/\/fitment\?.*boat=boat_highfield%3A513/)
  await expect(page.locator('.ft-note')).toContainText('Yamaha F150XC')
})

test('show all draws every trailer grouped by why, finds past the narrowing, and opens the deciding line', async ({
  page,
}) => {
  await onTheBoat(page)
  await page.getByRole('button', { name: 'Show all 434' }).click()
  await expect(page).toHaveURL(/all=trailer/)
  const grid = page.getByRole('grid', { name: /every one, grouped by why/ })
  await expect(grid).toBeVisible()
  await expect(grid.getByRole('columnheader').first()).toContainText('Made for this boat.')
  await expect(
    grid.getByRole('columnheader', { name: /Built for Stacer, not Highfield/ }),
  ).toBeVisible()

  /* a struck trailer is still found by its words: the search is the whole list's */
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
  await expect(page.locator('[data-testid="fitment"][data-mode="rig"]')).toBeVisible()
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
   Classic 340's F25SWTC is struck on Fitment with the rule's because, and the motor's count is the
   2 the build offers, where it said "3 of 209" while the build's "Back to the 3 made for this
   boat" opened on 2. Both screens are read, and the figure is the same on each. */
const CL340 = 'boat_highfield:124'
const BECAUSE = 'a tiller boat has no helm to steer a remote motor from'

test('a motor the dealer’s rule refuses is struck, and counted as the build counts it', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)

  /* the rule, written as a dealer writes it */
  await page.goto('/rules?open=new')
  await expect(page.locator('[data-testid="rules"][data-read]')).toBeVisible({ timeout: 30_000 })
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
  await page.getByRole('button', { name: 'Add it, refusing' }).click()
  await expect(
    page.getByText('Your rule is on. The build refuses from the next pick.'),
  ).toBeVisible()
  await written(page)

  /* Fitment: the F25SWTC struck with the because, and 2 of 209 made for this boat */
  await page.goto(`/fitment?boat=${encodeURIComponent(CL340)}`)
  await expect(page.locator('[data-testid="fitment"][data-read][data-boat]')).toBeVisible({
    timeout: 15_000,
  })
  const motor = page.getByRole('region', { name: 'Motor' })
  await expect(motor.getByText('Yamaha F25SWTC', { exact: true })).toBeVisible()
  await expect(motor.getByText(BECAUSE)).toBeVisible()
  await expect(motor.getByText('2 of 209')).toBeVisible()
  await expect(motor.getByText('3 of 209')).toHaveCount(0)
  await expect(motor.getByText('1 refused by your rule')).toBeVisible()

  /* the build on the same boat: the list past the narrowing, and the way back says the same 2 */
  await pickAndStart(page, 'boat_highfield', 'CL340')
  await page.getByRole('button', { name: /^02 Motor/ }).click()
  await expect(page).toHaveURL(/at=motor/)
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

/* WHAT THE BUILT CRITIQUE SAW (built-critique-m3.md): a boat with no photograph drew four discs
   round an empty box, and the cold chooser was one field on an empty page. The Classic 340 has no
   photograph this browser can draw: no stage, no disc, and on a phone the first plate is the
   motor. With no boat chosen, every maker is offered, counted, and three presses reach the boat. */
test('a boat with no photograph has no ring round nothing, at a desk and on a phone', async ({
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
    await expect(page.locator('.ft-body[data-photo="none"]')).toBeVisible()
    await expect(page.locator('.ft-pin')).toHaveCount(0)
    await expect(page.getByText(/No photograph/)).toHaveCount(0)
    /* the first plate under the head is the motor's, whose top sits under the head's foot */
    const head = await page.locator('.ft-head').boundingBox()
    const motor = await page.getByRole('region', { name: 'Motor' }).boundingBox()
    expect(motor!.y).toBeGreaterThan(head!.y + head!.height - 1)
    expect(motor!.y - (head!.y + head!.height)).toBeLessThan(64)
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
  await expect(page.getByText('Every boat on the price list, by maker · 289 boats')).toBeVisible()
  /* one price list, one size: Highfield is the 67 models Home's door and the picker count */
  await expect(page.getByRole('button', { name: /^Stacer\s*91 models$/ })).toBeVisible()
  await page.getByRole('button', { name: /^Highfield\s*67 models$/ }).click()
  await expect(page.getByText('Highfield · 67 models')).toBeVisible()
  await page.getByRole('button', { name: /^Classic 340\s*9 versions/ }).click()
  await page.getByRole('link', { name: /^PVC · White \/ White \/ Wood Dark/ }).click()
  await expect(page).toHaveURL(/boat=boat_highfield%3A124/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Highfield Classic 340')
})
