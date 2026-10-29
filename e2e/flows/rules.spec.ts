import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { pickAndStart, written } from '../mint'

/* ============================================================
   RULES — what the rulers cannot see, and Milestone 3's exit
   criterion walked end to end: writing a rule on /rules changes what
   the build refuses on the next pick, with the rule's own because;
   switched off in its own sentence, the option comes back.

   The rule is one a dealer could write and the file can measure:
   on a tiller boat the motor must have a tiller handle. The price
   list writes 45 remote motors onto tiller boats (counted in
   `src/domain/rules/constraints/pairRules.test.ts`), the Highfield
   Classic 340's Yamaha F25SWTC among them, so the walk opens a draft
   on that boat and looks for the F25SWTC where the build offers it.
   Every press is a person's press; nothing is planted.
   ============================================================ */

const BECAUSE = 'a tiller boat has no helm to steer a remote motor from'
const TILLER = 'When the boat’s steering is tiller, the motor’s controls must be Tiller handle.'

async function toRules(page: Page, open = ''): Promise<void> {
  await page.goto(open === '' ? '/rules' : `/rules?open=${open}`)
  await expect(page.locator('[data-testid="rules"][data-read]')).toBeVisible({ timeout: 30_000 })
}

/** Choose one word of the sentence: press the word, then the choice in its list. */
async function choose(page: Page, word: string | RegExp, choice: RegExp): Promise<void> {
  await page.getByRole('combobox', { name: word }).click()
  await page.getByRole('option', { name: choice }).click()
  await expect(page.getByRole('listbox')).toBeHidden()
}

async function writeTheTillerRule(page: Page): Promise<void> {
  await toRules(page)
  /* the rule goes where what the customer is buying is: under Motors */
  await page.getByRole('button', { name: 'Write a rule about motors' }).click()
  await expect(page).toHaveURL(/open=new%3Amotor|open=new:motor/)
  await choose(page, 'Which of the boat’s specs', /^steering$/)
  await choose(page, 'The boat’s steering', /^tiller\b/)
  await choose(page, 'Which of the motor’s specs', /^controls$/)
  await choose(page, 'The motor’s controls', /^Tiller handle\b/)
  await page.getByRole('textbox', { name: 'Because' }).fill(BECAUSE)
  await page.getByRole('button', { name: 'Add it as 2.4' }).click()
  await expect(
    page.getByText('Your rule is on. The build refuses from the next pick.'),
  ).toBeVisible()
  await written(page)
}

async function motorChapter(page: Page): Promise<void> {
  await page.getByRole('button', { name: /^02 Motor/ }).click()
  await expect(page).toHaveURL(/at=motor/)
}

test('on the first day the page is the house rules, measured, and nothing is Northside’s yet', async ({
  page,
}) => {
  await throughTheDoor(page)
  await toRules(page)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('What may be sold with what')
  await expect(page.getByTestId('stated-rule')).toHaveCount(7)
  await expect(page.getByText('Northside has written none yet.', { exact: false })).toBeVisible()
  await expect(page.getByTestId('your-rule')).toHaveCount(0)
  await expect(page.getByTestId('open-rule')).toHaveCount(0)
  /* noticed is never written into the text: three boxes, none numbered */
  await expect(page.getByTestId('noticed')).toHaveCount(3)
})

test('counted before it is added: the tiller rule’s boats, drawn one mark a model', async ({
  page,
}) => {
  await throughTheDoor(page)
  await toRules(page, 'new:motor')
  await choose(page, 'Which of the boat’s specs', /^steering$/)
  await choose(page, 'The boat’s steering', /^tiller\b/)
  const census = page.getByTestId('census')
  /* half answered, it already counts the boats it is about, and lights them */
  await expect(census.locator('.hr-fig[data-n="61 of 289"]')).toHaveCount(1)
  await expect(census.locator('.hr-mark[data-about]')).toHaveCount(61)
  await choose(page, 'Which of the motor’s specs', /^controls$/)
  await choose(page, 'The motor’s controls', /^Tiller handle\b/)
  await expect(census.locator('.hr-fig[data-n="45 of 540"]')).toHaveCount(1)
  await expect(census.locator('.hr-fig[data-n="171 of 241"]')).toHaveCount(1)
  /* the five Highfield Classics are ringed and named under their maker, once */
  await expect(census.locator('.hr-mark[data-loses]')).toHaveCount(5)
  await expect(page.getByTestId('rule-cost')).toHaveText(
    'The Classic 340, 360, 380, 360 LS and 380 LS lose the Yamaha F25SWTC.',
  )
  /* the count and its act are inside the window together at the dealer's laptop size */
  const act = page.getByRole('button', { name: 'Add it as 2.4' })
  await act.scrollIntoViewIfNeeded()
  await expect(act).toBeInViewport()
})

test('a rule written here is refused in the build on the next pick, with its because; off, the motor is back', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  await writeTheTillerRule(page)

  /* the clause now stands as Northside's 2.4, refusing, its figure measured */
  const mine = page.getByTestId('your-rule')
  await expect(mine).toHaveCount(1)
  await expect(mine).toContainText(TILLER)
  await expect(mine).toHaveAttribute('data-does', 'refuses')
  await expect(mine.getByRole('combobox', { name: 'What 2.4 does' })).toHaveText('refuses')

  /* THE NEXT PICK: a draft on the Classic 340, and the F25SWTC is not on its list. The refusal
     is said once above the list, in the rule's own words and with its because */
  const quoteId = await pickAndStart(page, 'boat_highfield', 'CL340')
  await motorChapter(page)
  const said = page.getByTestId('ruled-here')
  await expect(said).toHaveCount(1)
  await expect(said).toContainText('Not offered on this boat: the Yamaha F25SWTC')
  await expect(said).toContainText(`because ${BECAUSE}`)
  await expect(said).toContainText(`Your rule: ${TILLER}`)
  const motors = page.locator('[data-chapter="motor"]')
  await expect(motors.getByRole('button', { name: /F25SWTC/ })).toHaveCount(0)
  /* COUNTED, the closing proof of Milestone 3: the price list makes three Yamahas for the
     Classic 340 (`chapters.test.ts`, "offers 2 on the motor list"), and with the rule on the
     build offers two of them */
  const offered = motors.locator('.cfg-opt:not([data-outside])')
  await expect(offered).toHaveCount(2)

  /* the sentence leads to the rule, open in place, and there it is switched off in its own words */
  await said.getByRole('link', { name: 'See the rule' }).click()
  await expect(page).toHaveURL(/\/rules\?open=/)
  await expect(page.locator('[data-testid="rules"][data-read]')).toBeVisible()
  await expect(page.getByTestId('open-rule')).toBeVisible()
  /* IT LANDS ON THE CLAUSE, not at the page's top with the rule some 740px down
     (built-critique-m3.md, major 9): its sentence is on the screen, clear of the pill */
  await expect(page.getByTestId('rule-sentence')).toBeInViewport()
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  await choose(page, 'What the build does', /^is off/)
  await expect(page.getByText('Your rule is switched off.')).toBeVisible()
  await expect(page.getByTestId('open-rule')).toContainText(
    'This rule is off — kept, not enforced.',
  )
  await page.getByRole('button', { name: 'Close' }).click()
  await expect(page.getByTestId('your-rule')).toHaveAttribute('data-does', 'off')
  await written(page)

  /* and the option is back where it was, with no sentence over the list */
  await page.goto(`/quote/${quoteId}?at=motor`)
  await expect(page.getByTestId('configurator')).toBeVisible()
  await expect(page.getByTestId('ruled-here')).toHaveCount(0)
  /* switched off, the build offers the three again */
  await expect(page.locator('[data-chapter="motor"] .cfg-opt:not([data-outside])')).toHaveCount(3)
  await expect(
    page
      .locator('[data-chapter="motor"]')
      .getByRole('button', { name: /F25SWTC/ })
      .first(),
  ).toBeVisible()
})

test('on a phone the act stands under its because, and the rule just added is where the eye is', async ({
  page,
}) => {
  /* built-critique-m3.md, major 8: at 390 "Add it as 2.4" stood about 700px under the because,
     below every maker's marks, and after the press the page jumped to its top */
  await page.setViewportSize({ width: 390, height: 844 })
  await throughTheDoor(page)
  await toRules(page)
  await page.getByRole('button', { name: 'Write a rule about motors' }).click()
  await choose(page, 'Which of the boat’s specs', /^steering$/)
  await choose(page, 'The boat’s steering', /^tiller\b/)
  await choose(page, 'Which of the motor’s specs', /^controls$/)
  await choose(page, 'The motor’s controls', /^Tiller handle\b/)
  const because = page.getByRole('textbox', { name: 'Because' })
  await because.fill(BECAUSE)
  const act = page.getByRole('button', { name: 'Add it as 2.4' })
  const [input, button, census] = await Promise.all([
    because.boundingBox(),
    act.boundingBox(),
    page.getByTestId('census').boundingBox(),
  ])
  /* the act follows its because, and the count follows the act */
  expect(button!.y - (input!.y + input!.height)).toBeLessThan(160)
  expect(census!.y).toBeGreaterThan(button!.y)
  await because.scrollIntoViewIfNeeded()
  await expect(act).toBeInViewport()
  await act.click()
  await expect(
    page.getByText('Your rule is on. The build refuses from the next pick.'),
  ).toBeVisible()
  const mine = page.getByTestId('your-rule')
  await expect(mine).toBeFocused()
  await expect(mine).toBeInViewport()
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  await written(page)
})

test('a rule deleted comes back from the toast, where it stood', async ({ page }) => {
  await throughTheDoor(page)
  await writeTheTillerRule(page)
  await page.getByRole('button', { name: 'Rewrite 2.4' }).click()
  await page.getByRole('button', { name: 'Delete 2.4' }).click()
  await expect(page.getByText('Your rule is deleted.')).toBeVisible()
  await expect(page.getByTestId('your-rule')).toHaveCount(0)
  await page.getByRole('button', { name: 'Undo' }).click()
  await expect(page.getByTestId('your-rule')).toContainText('steering is tiller')
})

test('the act says what is still to choose, and never adds half a sentence', async ({ page }) => {
  await throughTheDoor(page)
  await toRules(page, 'new:motor')
  const act = page.getByRole('button', { name: 'Add it as 2.4' })
  await expect(page.getByText('Choose which of the boat’s specs this rule looks at.')).toBeVisible()
  /* refused, never disabled in silence: the act names its reason and files nothing */
  await expect(act).toHaveAttribute('aria-disabled', 'true')
  await act.click({ force: true })
  await expect(page.getByTestId('your-rule')).toHaveCount(0)
  /* Escape puts the clause away, and the words wait for it */
  await page.getByRole('combobox', { name: 'Which of the boat’s specs' }).focus()
  await page.keyboard.press('Escape')
  await expect(page.getByTestId('open-rule')).toHaveCount(0)
})

test('what a written rule does acts at once, and its Undo never follows you out', async ({
  page,
}) => {
  await throughTheDoor(page)
  await writeTheTillerRule(page)
  await choose(page, 'What 2.4 does', /^warns about/)
  await expect(page.getByText('Your rule warns from the next pick.')).toBeVisible()
  await expect(page.getByTestId('your-rule')).toHaveAttribute('data-does', 'warns')
  await written(page)

  /* leave by the pill: the rule's toast stays here, and the rule still warns on the way back */
  await page
    .getByRole('link', { name: /^Quotes/ })
    .first()
    .click()
  await expect(page).toHaveURL(/\/quotes/)
  await expect(page.getByText('Your rule warns from the next pick.')).toHaveCount(0)
  await toRules(page)
  await expect(page.getByRole('combobox', { name: 'What 2.4 does' })).toHaveText('warns about')
})

test('a rule names a maker and a figure, typed where the sentence says it', async ({ page }) => {
  await throughTheDoor(page)
  await toRules(page, 'new:motor')
  await choose(page, 'Which of the boat’s specs', /^length$/)
  await page.getByRole('textbox', { name: 'The boat’s length, in metres' }).fill('6')
  await choose(page, 'Which of the motor’s specs', /^horsepower$/)
  await choose(page, 'Must be over or under', /^must be at least$/)
  await page.getByRole('textbox', { name: 'The motor’s horsepower, as a figure' }).fill('90')
  await expect(page.getByText('Say why, so the build can say it where it refuses.')).toBeVisible()
  await page
    .getByRole('textbox', { name: 'Because' })
    .fill('a hull that long wants the power to plane')
  await page.getByRole('button', { name: 'Add it as 2.4' }).click()
  await expect(page.getByTestId('your-rule')).toContainText(
    'When the boat’s length is over 6 m, the motor’s horsepower must be at least 90 hp.',
  )
  await written(page)

  /* a maker is a word like any other, under Trailers as under Motors */
  await page.getByRole('button', { name: 'Write a rule about trailers' }).click()
  await choose(page, 'Which of the boat’s specs', /^maker$/)
  /* one price list, one size (built-critique-m3-2.md, major 4): each maker counts the models
     Home's door and the picker print — Highfield 67, never its 588 lines */
  await page.getByRole('combobox', { name: 'The boat’s maker' }).click()
  await expect(page.getByRole('option', { name: /^Highfield\s*67$/ })).toBeVisible()
  await page.getByRole('option', { name: /^Haines Signature/ }).click()
  await expect(page.getByRole('listbox')).toBeHidden()
  await expect(page.getByTestId('rule-sentence')).toContainText(
    'When the boat’s maker is Haines Signature, the trailer’s',
  )
  await expect(page.getByTestId('open-rule')).toContainText('1.3')
})

test('the finder on a build says what each chapter says, whatever is typed into it', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  await writeTheTillerRule(page)
  await pickAndStart(page, 'boat_highfield', 'CL340')
  /* the motor chapter's own head, with the refused F25SWTC not counted as offered */
  const head = page.locator('[data-chapter="motor"] .cfg-head__rest')
  await expect(head).toHaveText(/1\smore offered/)

  const finder = page.getByTestId('shell-finder')
  if ((page.viewportSize()?.width ?? 0) >= 768) await page.keyboard.press('Control+k')
  else await page.getByTestId('shell-pill').getByRole('button', { name: 'Find' }).click()
  await expect(finder).toBeVisible()
  const motor = finder.getByRole('option', { name: /^02 Motor/ })
  await expect(motor).toContainText(/1\smore offered/)
  /* TYPED WORDS ARE THE FINDER'S, NEVER THE CHAPTER'S COUNT (built-critique-m3.md, major 11: the
     finder said "2 more offered" where the motor chapter said "1 more offered", reading the
     chapter as searched for what was typed) */
  await page.keyboard.type('f25')
  await expect(motor).toContainText(/1\smore offered/)
  await expect(motor).not.toContainText(/2\smore offered/)
})

test('at a desk the because being typed stays clear of the pill while the count is read down', async ({
  page,
}) => {
  /* built-critique-m3-2.md, major 6: at 1440 and 1920 the because field and the census's top
     sat under the pill once the dealer read down the makers' marks. The overlap ruler passed it
     because the pill floats, so this presses the field after scrolling and measures it. */
  for (const width of [1440, 1920]) {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 1080 })
    if (width === 1440) await throughTheDoor(page)
    await toRules(page, 'new:motor')
    await choose(page, 'Which of the boat’s specs', /^steering$/)
    await choose(page, 'The boat’s steering', /^tiller\b/)
    await choose(page, 'Which of the motor’s specs', /^controls$/)
    await choose(page, 'The motor’s controls', /^Tiller handle\b/)
    await page.mouse.wheel(0, 600)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
    const because = page.getByRole('textbox', { name: 'Because' })
    await because.click()
    await because.pressSequentially('a tiller boat')
    const act = page.getByRole('button', { name: 'Add it as 2.4' })
    const pill = await page.getByTestId('shell-pill').boundingBox()
    for (const box of [await because.boundingBox(), await act.boundingBox()]) {
      expect(box!.y).toBeGreaterThanOrEqual(pill!.y + pill!.height)
      expect(box!.y + box!.height).toBeLessThanOrEqual(width === 1440 ? 900 : 1080)
    }
    await page.getByRole('button', { name: 'Close' }).click()
  }
})

test('“See the rule” opens it to be read, Close first and Delete last', async ({ page }) => {
  /* built-critique-m3-2.md, minor: arriving from the build it opened as "being rewritten" with
     "Delete 2.4" its first act, though the dealer came to read it */
  await throughTheDoor(page)
  await writeTheTillerRule(page)
  await page.getByRole('button', { name: 'Rewrite 2.4' }).click()
  await expect(page).toHaveURL(/\/rules\?open=/)
  await page.goto(page.url())
  await expect(page.locator('[data-testid="rules"][data-read]')).toBeVisible({ timeout: 30_000 })
  const open = page.getByTestId('open-rule')
  await expect(open).toContainText('Northside’s, written')
  await expect(open).not.toContainText('being rewritten')
  const acts = await open.getByRole('button').allInnerTexts()
  expect(acts.map((a) => a.trim()).at(-1)).toBe('Delete 2.4')
  expect(acts.findIndex((a) => a.trim() === 'Close')).toBeLessThan(acts.length - 1)
})
