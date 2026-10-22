import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { pickAndStart, written } from '../mint'

/* ============================================================
   RULES — what the rulers cannot see, and Milestone 3's exit
   criterion walked end to end: writing a rule on /rules changes what
   the build refuses on the next pick, with the rule's own because;
   switched off, the option comes back.

   The rule is one a dealer could write and the file can measure:
   on a tiller boat the motor must have a tiller handle. The price
   list writes 45 remote motors onto tiller boats (counted in
   `src/domain/rules/constraints/pairRules.test.ts`), the Highfield
   Classic 340's Yamaha F25SWTC among them, so the walk opens a draft
   on that boat and looks for the F25SWTC where the build offers it.
   Every press is a person's press; nothing is planted.
   ============================================================ */

const BECAUSE = 'a tiller boat has no helm to steer a remote motor from'

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
  await toRules(page, 'new')
  await choose(page, 'Which of the boat’s specs', /^steering$/)
  await choose(page, 'The boat’s steering', /^tiller\b/)
  await choose(page, 'Which of the motor’s specs', /^controls$/)
  await choose(page, 'The motor’s controls', /^Tiller handle\b/)
  await page.getByRole('textbox', { name: 'Because' }).fill(BECAUSE)
  await page.getByRole('button', { name: 'Add it, refusing' }).click()
  await expect(
    page.getByText('Your rule is on. The build refuses from the next pick.'),
  ).toBeVisible()
  await written(page)
}

async function motorChapter(page: Page): Promise<void> {
  await page.getByRole('button', { name: /^02 Motor/ }).click()
  await expect(page).toHaveURL(/at=motor/)
}

test('on the first day the plate opens on the price list’s own rule, counted, and nothing is a rule yet', async ({
  page,
}) => {
  await throughTheDoor(page)
  await toRules(page)

  await expect(page.getByTestId('rule-from')).toContainText('From your price list')
  await expect(page.getByTestId('rule-sentence')).toHaveText(
    'When the boat’s steering is remote, the motor’s controls must not be Tiller handle.',
  )
  /* the census, counted off the file: 228 of the picker's 289 boats (models, never the 810 lines
     behind them), 38 of 241 motors, none of the 3,144 the list makes for them */
  const census = page.getByTestId('census')
  await expect(census).toContainText('228')
  await expect(census).toContainText('of 289 boats it is about')
  await expect(census).toContainText('of 241 motors it refuses on them')
  await expect(census).toContainText('of 3,144 motors the price list makes for them')
  /* and it costs no sale: nothing the price list makes for these boats breaks it */
  await expect(page.getByTestId('rule-cost')).toContainText('No sale.')

  /* Northside has written nothing, and says so as a fact, not a blank */
  await expect(page.getByText('None yet.', { exact: false })).toBeVisible()
  await expect(page.getByTestId('your-rules')).toHaveCount(0)
})

test('a rule written here is refused in the build on the next pick, with its because; off, the motor is back', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  await writeTheTillerRule(page)

  /* the plate is now the rule, and the list says what it does */
  await expect(page.getByTestId('rule-from')).toContainText('Your rule, written')
  const mine = page.getByTestId('your-rules')
  await expect(mine).toContainText(
    'When the boat’s steering is tiller, the motor’s controls must be Tiller handle.',
  )
  await expect(mine).toContainText('5 models lose a motor the price list makes for them.')
  await expect(page.getByTestId('rule-cost')).toContainText('The Highfield Classic 340 loses')
  await expect(page.getByTestId('rule-cost')).toContainText('Yamaha F25SWTC')

  /* THE NEXT PICK: a draft on the Classic 340, and the F25SWTC is not on its list. The refusal
     is said once above the list, in the rule's own words and with its because */
  const quoteId = await pickAndStart(page, 'boat_highfield', 'CL340')
  await motorChapter(page)
  const said = page.getByTestId('ruled-here')
  await expect(said).toHaveCount(1)
  await expect(said).toContainText('Not offered on this boat: the Yamaha F25SWTC')
  await expect(said).toContainText(`because ${BECAUSE}`)
  await expect(said).toContainText(
    'Your rule: When the boat’s steering is tiller, the motor’s controls must be Tiller handle.',
  )
  const motors = page.locator('[data-chapter="motor"]')
  await expect(motors.getByRole('button', { name: /F25SWTC/ })).toHaveCount(0)

  /* the sentence leads to the rule, and there it is switched off */
  await said.getByRole('link', { name: 'See the rule' }).click()
  await expect(page).toHaveURL(/\/rules\?open=/)
  await expect(page.locator('[data-testid="rules"][data-read]')).toBeVisible()
  await page.getByTestId('your-rules').getByRole('switch', { name: 'On' }).click()
  await expect(page.getByText('Your rule is switched off.')).toBeVisible()
  await expect(page.getByTestId('your-rules')).toContainText('Switched on, 5 models would lose')
  await expect(page.getByTestId('your-rules').getByRole('switch', { name: 'Off' })).toBeVisible()
  await expect(page.getByTestId('rule-cost')).toContainText('Nothing today: it is off.')
  await written(page)

  /* and the option is back where it was, with no sentence over the list */
  await page.goto(`/quote/${quoteId}?at=motor`)
  await expect(page.getByTestId('configurator')).toBeVisible()
  await expect(page.getByTestId('ruled-here')).toHaveCount(0)
  await expect(
    page
      .locator('[data-chapter="motor"]')
      .getByRole('button', { name: /F25SWTC/ })
      .first(),
  ).toBeVisible()
})

test('a rule deleted comes back from the toast, where it stood', async ({ page }) => {
  await throughTheDoor(page)
  await writeTheTillerRule(page)
  await page.getByRole('button', { name: 'Delete it' }).click()
  await expect(page.getByText('Your rule is deleted.')).toBeVisible()
  await expect(page.getByTestId('your-rules')).toHaveCount(0)
  await page.getByRole('button', { name: 'Undo' }).click()
  await expect(page.getByTestId('your-rules')).toContainText('steering is tiller')
})

test('the act says what is still to choose, and never adds half a sentence', async ({ page }) => {
  await throughTheDoor(page)
  await toRules(page, 'new')
  const act = page.getByRole('button', { name: 'Add it, refusing' })
  await expect(page.getByText('Choose which of the boat’s specs this rule looks at.')).toBeVisible()
  /* refused, never disabled in silence: the act names its reason and files nothing */
  await expect(act).toHaveAttribute('aria-disabled', 'true')
  await act.click({ force: true })
  await expect(page.getByTestId('your-rules')).toHaveCount(0)
})

test('what a written rule does acts at once from the plate, and its Undo never follows you out', async ({
  page,
}) => {
  await throughTheDoor(page)
  await writeTheTillerRule(page)
  /* the plate's verb, pressed once: no second press, nothing waiting to be kept */
  await page.getByText('warns', { exact: true }).click()
  await expect(page.getByText('Your rule warns from the next pick.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Keep the change' })).toHaveCount(0)
  await written(page)

  /* leave by the pill: the rule's toast stays here, and the rule still warns on the way back */
  await page
    .getByRole('link', { name: /^Quotes/ })
    .first()
    .click()
  await expect(page).toHaveURL(/\/quotes/)
  await expect(page.getByText('Your rule warns from the next pick.')).toHaveCount(0)
  await toRules(page)
  await expect(page.getByRole('radio', { name: 'warns' })).toBeChecked()
  await expect(page.getByTestId('your-rules')).toContainText('warns')
})

test('a rule names a maker and a figure, typed where the sentence says it', async ({ page }) => {
  await throughTheDoor(page)
  await toRules(page, 'new')
  await choose(page, 'Which of the boat’s specs', /^length$/)
  await page.getByRole('textbox', { name: 'The boat’s length, in metres' }).fill('6')
  await choose(page, 'Which of the motor’s specs', /^horsepower$/)
  await choose(page, 'Must be over or under', /^must be at least$/)
  await page.getByRole('textbox', { name: 'The motor’s horsepower, as a figure' }).fill('90')
  /* counted before it is added: some boats are over 6 m, and the act asks only for the because */
  await expect(page.getByTestId('census')).not.toContainText('—')
  await expect(page.getByText('Say why, so the build can say it where it refuses.')).toBeVisible()
  await page
    .getByRole('textbox', { name: 'Because' })
    .fill('a hull that long wants the power to plane')
  await page.getByRole('button', { name: 'Add it, refusing' }).click()
  await expect(page.getByTestId('your-rules')).toContainText(
    'When the boat’s length is over 6 m, the motor’s horsepower must be at least 90 hp.',
  )
  await written(page)

  /* a maker is a word like any other */
  await toRules(page, 'new')
  await choose(page, 'Which of the boat’s specs', /^maker$/)
  /* one price list, one size (built-critique-m3-2.md, major 4): each maker counts the models
     Home's door and the picker print — Highfield 67, never its 588 lines */
  await page.getByRole('combobox', { name: 'The boat’s maker' }).click()
  await expect(page.getByRole('option', { name: /^Highfield\s*67$/ })).toBeVisible()
  await expect(page.getByRole('option', { name: /^Stacer\s*91$/ })).toBeVisible()
  await page.getByRole('option', { name: /^Haines Signature/ }).click()
  await expect(page.getByRole('listbox')).toBeHidden()
  await expect(page.getByTestId('rule-sentence')).toContainText(
    'When the boat’s maker is Haines Signature,',
  )
  await expect(page.getByTestId('census')).toContainText('of 289 boats it is about')
})
