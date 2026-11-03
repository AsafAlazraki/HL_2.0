import { expect, test, type Locator, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { pickAndStart } from '../mint'

/* ============================================================
   RULES, EVERY STATE AT EVERY SIZE — the screenshots the data round
   reads by eye, taken only when `HL2_RULES_SHOTS` is set, so the gate
   never writes into docs. `HL2_RULES_SHOTS` names the folder under
   docs/directions/data-round/rules/ (`after` when it is just "1").
   Every press is a person's press at the place the word is drawn
   (`page.mouse`), never a driver's click, so the page is photographed
   where a person would have it.
   ============================================================ */

const FOLDER = process.env.HL2_RULES_SHOTS ?? ''
const OUT = `docs/directions/data-round/rules/${FOLDER === '1' || FOLDER === '' ? 'after' : FOLDER}`
const BECAUSE = 'a tiller boat has no helm to steer a remote motor from'
/** A list opened from a word: every listbox but the marks', which are a strip on the page. */
const OPEN_LIST = '[role="listbox"]:not(.hr-field__marks)'

test.skip(!process.env.HL2_RULES_SHOTS, 'screenshots are taken on request')

async function pressOn(page: Page, target: Locator) {
  await target.scrollIntoViewIfNeeded()
  const box = (await target.boundingBox())!
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

async function press(page: Page, name: string | RegExp, role: 'combobox' | 'button' = 'combobox') {
  await pressOn(page, page.getByRole(role, { name }).first())
}

async function pick(page: Page, word: string | RegExp, choice: RegExp) {
  await press(page, word)
  const option = page.locator(OPEN_LIST).getByRole('option', { name: choice }).first()
  await expect(option).toBeVisible()
  /* the list settles before it is pressed, as under a hand: a press in its first frames is not
     a person's */
  await page.waitForTimeout(250)
  const box = (await option.boundingBox())!
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  await expect(page.getByRole('listbox').and(page.locator(OPEN_LIST))).toBeHidden()
}

async function find(page: Page, word: string, typed: string, choice: string | RegExp) {
  await press(page, word)
  /* the finder's field takes the keys only once it has the caret */
  await expect(page.locator('.hr-finder__input')).toBeFocused()
  await page.keyboard.type(typed)
  const option = page
    .getByRole('dialog')
    .getByRole(
      'option',
      typeof choice === 'string' ? { name: choice, exact: true } : { name: choice },
    )
    .first()
  const box = (await option.boundingBox())!
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

async function ready(page: Page) {
  await expect(page.locator('[data-testid="rules"][data-read]')).toBeVisible({ timeout: 30_000 })
}

test('every state of the house rules, photographed', async ({ page }) => {
  test.setTimeout(420_000)
  const size = `${page.viewportSize()!.width}x${page.viewportSize()!.height}`
  const shot = async (name: string, fullPage = false) => {
    await page.waitForTimeout(450)
    await page.screenshot({ path: `${OUT}/${name}-${size}.png`, fullPage })
  }
  await throughTheDoor(page)
  await page.goto('/rules')
  await ready(page)
  await shot('01-arrive')
  await shot('01-arrive-full', true)

  /* a measure opened on what breaks it, each with the lines that write it */
  await page.goto('/rules?look=F6')
  await expect(page.getByTestId('exceptions')).toBeVisible()
  await page.getByTestId('exceptions').scrollIntoViewIfNeeded()
  await shot('02-look-F6')
  await page.goto('/rules?look=A2')
  await expect(page.getByTestId('exceptions')).toBeVisible()
  await press(page, /^Show the other/, 'button')
  await shot('02b-look-A2-expanded')
  await page.goto('/rules?look=F16')
  await expect(page.getByTestId('exceptions')).toBeVisible()
  await page.getByTestId('exceptions').scrollIntoViewIfNeeded()
  await shot('02c-look-F16')
  /* a clause with nothing that breaks it lets its look go, and says the workbook's breaks gone */
  await page.goto('/rules?look=F15')
  await ready(page)
  await expect(page).not.toHaveURL(/look=/)
  await page.locator('[data-testid="stated-rule"][data-ref="F15"]').scrollIntoViewIfNeeded()
  await shot('02d-look-F15-dropped')
  /* the boat's transom, on its own line of the price list */
  await page.goto('/rules?look=F6')
  await expect(page.getByTestId('exceptions')).toBeVisible()
  await pressOn(
    page,
    page
      .getByTestId('exceptions')
      .getByRole('link', { name: /Sea Ranger SDF.*the boat’s transom/ }),
  )
  await expect(page).toHaveURL(/\/data\/boat_stacer\?at=/)
  await page.waitForTimeout(1200)
  await shot('02e-transom-door')

  /* Northside overrules 2.3 with a because, and the clause says so where it stands */
  await page.goto('/rules')
  await ready(page)
  const shaft = page.locator('[data-testid="stated-rule"][data-ref="F6"]')
  await pressOn(page, shaft.getByRole('button', { name: 'Overrule it' }))
  await shaft
    .getByRole('textbox', { name: 'Why Northside does not hold to 2.3' })
    .fill('the three typos are fixed with the supplier')
  await page.waitForTimeout(300)
  await shot('02f-overrule')
  await pressOn(page, shaft.getByRole('button', { name: /^Overrule 2\.3/ }))
  await expect(shaft.getByTestId('overruled')).toBeVisible()
  await page.waitForTimeout(600)
  await shot('02g-overruled')
  await pressOn(page, shaft.getByRole('button', { name: 'Hold to it again' }))
  await expect(shaft.getByTestId('overruled')).toHaveCount(0)

  /* writing the tiller rule: the page holds still while the words are chosen */
  await page.goto('/rules')
  await ready(page)
  await press(page, 'Write a rule about motors', 'button')
  await expect(page.getByTestId('open-rule')).toBeVisible()
  await page.waitForTimeout(800)
  await shot('03-writing-blank')
  await pick(page, 'Which of the boat’s specs', /^steering$/)
  await pick(page, 'The boat’s steering', /^tiller\b/)
  await pick(page, 'Which of the motor’s specs', /^controls$/)
  await pick(page, 'The motor’s controls', /^Tiller handle\b/)
  await shot('04-chosen')
  await shot('04-chosen-full', true)
  await page.getByRole('textbox', { name: 'Because' }).fill(BECAUSE)
  await shot('05-ready')
  await page.getByTestId('taken').scrollIntoViewIfNeeded()
  await shot('06-taken')

  /* one boat, found by typing */
  await find(page, 'The boat it is tried on', '340', 'Highfield Classic 340')
  await expect(page).toHaveURL(/on=/)
  await page.getByTestId('one-boat').scrollIntoViewIfNeeded()
  await shot('06d-one-boat')

  /* a mark, named on a press and on a key */
  const highfield = page.getByRole('listbox', { name: /^Highfield:/ })
  await highfield.scrollIntoViewIfNeeded()
  await highfield.focus()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await shot('07-mark-named')

  /* an exception of a model the rule never speaks of says so */
  await press(page, 'Except one model', 'button')
  await press(page, 'The model it makes an exception of')
  await expect(page.getByRole('combobox', { name: 'Find a boat model' })).toBeVisible()
  await shot('08-finder-open')
  await page.keyboard.type('pro fisher')
  await shot('08c-finder-typed')
  const pf = page
    .getByRole('dialog')
    .getByRole('option', { name: 'Surtees 495 Pro Fisher', exact: true })
    .first()
  const pfb = (await pf.boundingBox())!
  await page.mouse.click(pfb.x + pfb.width / 2, pfb.y + pfb.height / 2)
  await expect(page.getByTestId('heads-up')).toContainText('The exception changes nothing')
  await page.getByTestId('heads-up').scrollIntoViewIfNeeded()
  await shot('09a-except-idle')
  await press(page, 'Take the exception away', 'button')

  /* an exception that spares a boat */
  await press(page, 'Except one model', 'button')
  await find(page, 'The model it makes an exception of', 'classic 340', 'Highfield Classic 340')
  await expect(page.getByTestId('rule-sentence')).toContainText('except the Highfield Classic 340')
  await page.getByTestId('rule-sentence').scrollIntoViewIfNeeded()
  await shot('09-except')
  await press(page, /^Add it as 2\.4$/, 'button')
  await expect(
    page.getByText('Your rule is on. The build refuses from the next pick.'),
  ).toBeVisible()
  await shot('10-added')
  await shot('10-added-full', true)

  /* what it does, changed at rest: the clause stays clear of the toast */
  await pick(page, 'What 2.4 does', /^warns about/)
  await expect(page.getByText('Your rule warns from the next pick.')).toBeVisible()
  await shot('11-warns')
  await pick(page, 'What 2.4 does', /^is off/)
  await shot('11b-off')
  await pick(page, 'What 2.4 does', /^refuses/)
  await expect(page.getByTestId('your-rule')).toHaveAttribute('data-does', 'refuses')

  /* a rule that cannot stand beside 2.4 says so, once, by its number */
  await page.goto('/rules?open=new:motor')
  await ready(page)
  await pick(page, 'Which of the boat’s specs', /^steering$/)
  await pick(page, 'The boat’s steering', /^tiller\b/)
  await pick(page, 'Which of the motor’s specs', /^controls$/)
  await pick(page, 'Must be, or must not be', /^must not be$/)
  await pick(page, 'The motor’s controls', /^Tiller handle\b/)
  await expect(page.getByTestId('heads-up')).toBeVisible()
  await page.getByTestId('heads-up').scrollIntoViewIfNeeded()
  await shot('12-contradicts')

  /* a trailer rule that leaves a boat with nothing says so before it is added */
  await page.goto('/rules?open=new:trailer')
  await ready(page)
  await pick(page, 'Which of the boat’s specs', /^model$/)
  await find(page, 'The boat’s model', '2350 Ultra', /2350 Ultra Centrecab/)
  await pick(page, 'Which of the trailer’s specs', /^series$/)
  await pick(page, 'The trailer’s series', /^Alloy Centre-Line Series/)
  await expect(page.getByTestId('heads-up')).toBeVisible()
  await page.getByTestId('heads-up').scrollIntoViewIfNeeded()
  await shot('13-empties')

  /* a stale link says so */
  await page.goto('/rules?open=zzz-not-a-rule')
  await expect(page.getByTestId('rules-stale')).toBeVisible()
  await shot('14-stale-open')
})

test('the quotes a rule speaks of are doors to them', async ({ page }) => {
  test.setTimeout(240_000)
  const size = `${page.viewportSize()!.width}x${page.viewportSize()!.height}`
  await throughTheDoor(page)
  await pickAndStart(page, 'boat_highfield', 'CL340')
  await page.goto('/rules?open=new:motor')
  await ready(page)
  await pick(page, 'Which of the boat’s specs', /^steering$/)
  await pick(page, 'The boat’s steering', /^tiller\b/)
  await pick(page, 'Which of the motor’s specs', /^controls$/)
  await pick(page, 'The motor’s controls', /^Tiller handle\b/)
  const quotes = page.getByTestId('on-quotes')
  await quotes.scrollIntoViewIfNeeded()
  await page.waitForTimeout(450)
  await page.screenshot({ path: `${OUT}/15-on-quotes-${size}.png` })
  await pressOn(page, quotes.getByRole('link').first())
  await expect(page).toHaveURL(/\/quote\/[^/?]+/)
})

test('the foot and the printed page, photographed', async ({ page }) => {
  test.setTimeout(180_000)
  const size = `${page.viewportSize()!.width}x${page.viewportSize()!.height}`
  const shot = async (name: string, fullPage = false) => {
    await page.waitForTimeout(450)
    await page.screenshot({ path: `${OUT}/${name}-${size}.png`, fullPage })
  }
  await throughTheDoor(page)
  await page.goto('/rules')
  await ready(page)
  /* looked for and not true */
  await press(page, /^Show the 6$/, 'button')
  await shot('16-refuted')

  /* printed, on one A4 page, with a rule of Northside's on it that is off */
  await page.goto('/rules?open=new:motor')
  await ready(page)
  await pick(page, 'Which of the boat’s specs', /^steering$/)
  await pick(page, 'The boat’s steering', /^tiller\b/)
  await pick(page, 'Which of the motor’s specs', /^controls$/)
  await pick(page, 'The motor’s controls', /^Tiller handle\b/)
  await page.getByRole('textbox', { name: 'Because' }).fill(BECAUSE)
  await press(page, /^Add it as 2\.4$/, 'button')
  await expect(page.getByTestId('your-rule')).toHaveCount(1)
  await pick(page, 'What 2.4 does', /^is off/)
  await page.emulateMedia({ media: 'print' })
  await shot('17-print-full', true)
  if (size === '1280x800') await page.pdf({ path: `${OUT}/17-print.pdf`, format: 'A4' })
  await page.emulateMedia({ media: 'screen' })
})
