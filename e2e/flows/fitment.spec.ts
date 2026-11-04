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
  /* REWRITTEN 2026-11-03 (the fitment judge, major 6): ten of the thirty inside the range are a
     20″ leg on the 25″ transom, said as that */
  const counts = await numbers(page, '.ft-open')
  expect(counts).toEqual([74, 51, 10, 20, 47])
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
  /* REWRITTEN 2026-11-03 (minor 15): the door says it opens the boat's line */
  await over
    .getByRole('link', { name: /line on the price list, which carries its horsepower/ })
    .click()
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
  /* A list opened from a word: every listbox but the field's strips of marks, which stand on
     the page. CHANGED 2026-11-05 with the Data round: Rules draws each maker's models as a
     strip of marks (role listbox, `.hr-field__marks`), so "every listbox is hidden" could no
     longer hold; the opened list closing is what this ever asserted (`rules.spec.ts` reads
     it the same way). */
  const openList = page.locator('[role="listbox"]:not(.hr-field__marks)')
  const choose = async (word: string, choice: RegExp): Promise<void> => {
    await page.getByRole('combobox', { name: word }).click()
    await openList.getByRole('option', { name: choice }).click()
    await expect(page.getByRole('listbox').and(openList)).toBeHidden()
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

  /* the build on the same boat says the same refusal with the same because. REWRITTEN
     2026-11-03: the build's "Back to the 2 made for this boat" went when its Show all became a
     sheet (2026-10-31), so the build is read where it says the refusal now */
  await pickAndStart(page, 'boat_highfield', 'CL340')
  await openChapter(page, /^02 Motor/)
  const motors = page.locator('[data-chapter="motor"]')
  await expect(motors.getByText(/^Not offered on this boat: .*F25SWTC/)).toBeVisible()
  await expect(motors.getByText(new RegExp(BECAUSE))).toBeVisible()
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

/* REWRITTEN 2026-11-03 (the fitment judge, blocker 1 and major 12): two questions, not three —
   the maker, then the model under its series; the model opens on its first version */
test('the cold chooser offers every maker and walks maker, then model under its series, to the boat', async ({
  page,
}) => {
  await throughTheDoor(page)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/fitment')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Which boat?', {
    timeout: 15_000,
  })
  const plate = page.getByRole('region', { name: 'Which boat?' })
  await expect(plate.getByRole('searchbox', { name: 'Find a boat' })).toBeVisible()
  await expect(plate.getByText('Or by maker · 289 models')).toBeVisible()
  const marks = plate.locator('.ft-mk__img')
  await expect(marks).toHaveCount(6)
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
  await expect(page.getByRole('button', { name: /^Stacer\s*91 models$/ })).toBeVisible()
  await page.getByRole('button', { name: /^Highfield\s*67 models$/ }).click()
  await expect(page.getByText('Highfield · 67 models')).toBeVisible()
  /* the plate's explainer steps aside once a maker is pressed */
  await expect(plate.getByText('Also made for it')).toHaveCount(0)
  const classic = page.getByRole('region', { name: 'Classic' })
  await classic.getByRole('link', { name: /^Classic 340\s*9 versions/ }).click()
  await expect(page).toHaveURL(/boat=boat_highfield%3A\d+/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Highfield Classic 340')
  await expect(page.getByText('Version, of 9')).toBeVisible()
})

/* THE MODEL IS THE UNIT (blocker 1): a motor taken off the Sport 660 is off every one of its
   sixteen versions, counted in the sentence, and Undo gives all sixteen back */
test('a motor taken off is taken off every version of the model, and Undo gives it back', async ({
  page,
}) => {
  await onTheBoat(page)
  await page.getByRole('button', { name: /^Take the Yamaha F200XCC off/ }).click()
  await expect(
    page.getByText(
      'The Yamaha F200XCC is taken off the Highfield Sport 660, on all 16 of its versions.',
    ),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: /^Motor/ })).toContainText('6 of 209 offered')
  /* another version of the same model: the F200XCC is off it too */
  await page
    .getByRole('combobox', { name: /Which of the Highfield Sport 660’s 16 versions/ })
    .click()
  await page.getByRole('option').nth(4).click()
  await expect(page).not.toHaveURL(/boat=boat_highfield%3A513/)
  await expect(page.getByRole('button', { name: /^Motor/ })).toContainText('6 of 209 offered')
  await expect(
    page.getByRole('list', { name: 'Made for it' }).getByText('F200XCC', { exact: true }),
  ).toHaveCount(0)
})

/* THE RECOMMENDED, SET HERE (major 10), and a 2.5 hp refused under the range (major 8) */
test('the recommended is set on a tile, and a motor under the range is refused with its reason', async ({
  page,
}) => {
  await onTheBoat(page)
  await page.getByRole('button', { name: /^Make the Yamaha F200XC the recommended motor/ }).click()
  await expect(
    page.getByText(
      /^The Yamaha F200XC is now the recommended motor for the Highfield Sport 660, on all 16/,
    ),
  ).toBeVisible()
  /* THE TILE STAYS WHERE IT WAS PRESSED, starred there (the fitment verifier, 2026-11-03: moved to
     the front, it put another tile's Recommend it under the pointer) */
  const tiles = page.getByRole('list', { name: 'Made for it' }).getByRole('listitem')
  await expect(tiles.first()).toContainText('F175XC')
  await expect(tiles.nth(2)).toContainText('F200XC')
  await expect(tiles.nth(2).getByLabel('Recommended', { exact: true })).toBeVisible()
  await expect(tiles.first().getByLabel('Recommended', { exact: true })).toHaveCount(0)

  await page.goto(`${AT_REST}&all=motor&only=under`)
  await page.getByRole('button', { name: /^Put the Yamaha F2.5SMHB on/ }).click()
  await expect(page.getByRole('alert')).toHaveText(
    'The Yamaha F2.5SMHB is under the 150–200 hp the Highfield Sport 660 takes, so it is not put on. The boat’s own horsepower decides that.',
  )
})

/* THE RIG, SIDE BY SIDE, AND THE QUOTE STARTED FROM THE ANSWER (blockers 2 and 3, major 4) */
test('the motors side by side, then a quote started with the one chosen and the trailer', async ({
  page,
}) => {
  await onTheBoat(page)
  await page.getByRole('button', { name: 'Compare the 7 side by side' }).click()
  await expect(page).toHaveURL(/compare=side/)
  const table = page.getByRole('region', { name: 'The motors made for it, side by side' })
  await expect(table.getByRole('columnheader')).toHaveCount(8)
  await expect(table.getByRole('row', { name: /^Motor / })).toContainText('$27,565')
  await expect(table.getByRole('row', { name: /^Rigging kit price/ })).toContainText('Not chosen')
  await page.getByRole('button', { name: 'Back to the tiles' }).click()

  await page
    .getByRole('button', { name: /^Put the Yamaha F200XC on the quote started here/ })
    .click()
  await expect(page).toHaveURL(/motor=join_hf_yam/)
  const start = page.getByRole('heading', { name: 'A quote with' }).locator('..').locator('..')
  await expect(start).toContainText('the Yamaha F200XC and its rigging kit')
  await start.getByRole('button', { name: 'Start the quote' }).click()
  await expect(page).toHaveURL(/\/quote\/[^/]+$/, { timeout: 15_000 })
  await expect(page.getByTestId('configurator')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByTestId('configurator')).toContainText('F200XC')
  await expect(page.getByTestId('configurator')).toContainText('TA600T-MOB')
})

/* THE FITMENT VERIFIER, 2026-11-03: a 20″ F150LC went onto the 25″ SP660 with no word, and the
   GFAB, 750 kg over its ATM, could be quoted and recommended. Each is refused where it is pressed. */
test('a wrong-shaft motor and a trailer over its ATM are refused where they are pressed', async ({
  page,
}) => {
  await onTheBoat(page, '&all=motor&only=shaft')
  await page.getByRole('button', { name: /^Put the Yamaha F150LC on/ }).click()
  await expect(page.getByRole('alert')).toHaveText(
    'The Yamaha F150LC’s shaft is not the extra-long (25″) the Highfield Sport 660’s transom takes, so it is not put on. The boat’s own shaft decides that.',
  )

  await page.goto(`${AT_REST}&line=trailer`)
  const trailer = page.getByRole('region', { name: 'Trailer' })
  await expect(trailer.getByText('Over its ATM, so not for a quote')).toBeVisible()
  await trailer.getByRole('button', { name: /^Put the GFAB .* on the quote/ }).click()
  await expect(page).not.toHaveURL(/trailer=/)
  /* said under the weighing that holds its figures, never the figures again */
  await expect(trailer.getByRole('alert')).toHaveText(
    'Not put on the quote: its ATM, weighed above, decides that.',
  )
  await trailer.getByRole('button', { name: /^Make the GFAB .* the recommended/ }).click()
  await expect(trailer.getByRole('alert')).toHaveText(
    'Not made the recommended trailer: its ATM, weighed above, decides that.',
  )
  /* the quote the plate starts still carries the REDCO, which clears it */
  const start = page.getByRole('heading', { name: 'A quote with' }).locator('..').locator('..')
  await expect(start).toContainText('REDCO')
  await expect(start).not.toContainText('GFAB')
})

/* THE FITMENT VERIFIER, 2026-11-03, round 2: on the quote started here, one press of the build's
   Add put the GFAB on at $111,778 with no word. The build refuses it with Fitment's own sentence. */
test('the build refuses a trailer over its ATM on a quote started here, with its figures', async ({
  page,
}) => {
  await onTheBoat(page)
  await page.getByRole('button', { name: 'Start the quote' }).click()
  await expect(page.getByTestId('configurator')).toBeVisible({ timeout: 15_000 })
  const gfab = page.getByRole('button', {
    name: /GFAB Tandem Axel Trailer t\/s Highfield Sport 660/,
  })
  await gfab.first().scrollIntoViewIfNeeded()
  await gfab.first().click()
  await expect(page.getByRole('alert').filter({ hasText: 'ATM' })).toHaveText(
    'The GFAB Tandem Axel Trailer t/s Highfield Sport 660 is rated 2,200 kg and would carry 2,950 kg, 750 kg over, so it is not put on the quote. Its ATM decides that.',
  )
  await expect(page.getByTestId('configurator')).not.toContainText('$111,778')
})

/* AND A KIT THE PRICE LIST NO LONGER SELLS IS NAMED AS THAT, never "no rigging kit" (round 2) */
test('a rigging kit no longer sold is named, counted once and never priced in', async ({
  page,
}) => {
  await throughTheDoor(page)
  await page.goto('/fitment?boat=boat_stabicraft%3A30')
  await expect(page.locator('[data-testid="fitment"][data-read][data-boat]')).toBeVisible({
    timeout: 15_000,
  })
  const motor = page.getByRole('region', { name: /^Motor/ })
  await expect(motor).toContainText(
    '10 of the 11 name a rigging kit the price list marks no longer sold, so their figures are the motor alone and a quote takes the motor without it.',
  )
  await expect(motor.getByText('No longer sold', { exact: true })).toHaveCount(10)
  await expect(motor).not.toContainText('names no rigging kit')
})
