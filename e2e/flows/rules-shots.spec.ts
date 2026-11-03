import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'

/* ============================================================
   RULES, EVERY STATE AT EVERY SIZE — the screenshots the data round
   reads by eye (docs/directions/data-round/rules/after/), taken only
   when `HL2_RULES_SHOTS` is set, so the gate never writes into docs.
   Every press is a person's press at the place the word is drawn
   (`page.mouse`), never a driver's scroll-into-view, so the page is
   photographed where a person would have it.
   ============================================================ */

const OUT = 'docs/directions/data-round/rules/after'
const BECAUSE = 'a tiller boat has no helm to steer a remote motor from'

test.skip(!process.env.HL2_RULES_SHOTS, 'screenshots are taken on request')

async function press(page: Page, name: string | RegExp, role: 'combobox' | 'button' = 'combobox') {
  const target = page.getByRole(role, { name }).first()
  await target.scrollIntoViewIfNeeded()
  const box = (await target.boundingBox())!
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

async function pick(page: Page, word: string | RegExp, choice: RegExp) {
  await press(page, word)
  const option = page.getByRole('option', { name: choice }).first()
  await expect(option).toBeVisible()
  const box = (await option.boundingBox())!
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  await expect(page.getByRole('listbox')).toBeHidden()
}

test('every state of the house rules, photographed', async ({ page }, info) => {
  test.setTimeout(300_000)
  const size = `${page.viewportSize()!.width}x${page.viewportSize()!.height}`
  const shot = async (name: string, fullPage = false) => {
    await page.waitForTimeout(450)
    await page.screenshot({ path: `${OUT}/${name}-${size}.png`, fullPage })
  }
  void info
  await throughTheDoor(page)
  await page.goto('/rules')
  await expect(page.locator('[data-testid="rules"][data-read]')).toBeVisible({ timeout: 30_000 })
  await shot('01-arrive')
  await shot('01-arrive-full', true)

  /* a measure opened on what breaks it */
  await page.goto('/rules?look=F6')
  await expect(page.getByTestId('exceptions')).toBeVisible()
  await page.getByTestId('exceptions').scrollIntoViewIfNeeded()
  await shot('02-shaft-exceptions')
  await page.goto('/rules?look=A2')
  await expect(page.getByTestId('exceptions')).toBeVisible()
  await page.getByTestId('exceptions').scrollIntoViewIfNeeded()
  await shot('02b-under-exceptions')
  await page.goto('/rules?look=F16')
  await expect(page.getByTestId('exceptions')).toBeVisible()
  await page.getByTestId('exceptions').scrollIntoViewIfNeeded()
  await shot('02c-noticed-exceptions')

  /* writing the tiller rule: the page holds still while the words are chosen */
  await page.goto('/rules')
  await expect(page.locator('[data-testid="rules"][data-read]')).toBeVisible()
  await press(page, 'Write a rule about motors', 'button')
  await expect(page.getByTestId('open-rule')).toBeVisible()
  await page.waitForTimeout(800)
  await shot('03-writing-blank')
  const y0 = await page.evaluate(() => window.scrollY)
  await pick(page, 'Which of the boat’s specs', /^steering$/)
  await pick(page, 'The boat’s steering', /^tiller\b/)
  await pick(page, 'Which of the motor’s specs', /^controls$/)
  await pick(page, 'The motor’s controls', /^Tiller handle\b/)
  const y1 = await page.evaluate(() => window.scrollY)
  console.log(`[${size}] scrollY while choosing: ${y0} -> ${y1}`)
  await shot('04-chosen-no-because')
  await shot('04-chosen-no-because-full', true)
  await page.getByRole('textbox', { name: 'Because' }).fill(BECAUSE)
  await shot('05-ready')
  await page.getByTestId('taken').scrollIntoViewIfNeeded()
  await shot('06-taken-and-one-boat')
  await page.getByTestId('on-quotes').scrollIntoViewIfNeeded()
  await shot('06b-on-quotes')

  /* the maker's line names its models */
  await page.getByTestId('field-maker').first().scrollIntoViewIfNeeded()
  await press(page, /^Highfield/, 'button')
  await expect(page.getByTestId('field-named')).toBeVisible()
  await shot('07-named-marks')

  /* an exception, found by typing */
  await page.getByRole('button', { name: 'Except one model' }).scrollIntoViewIfNeeded()
  await press(page, 'Except one model', 'button')
  await press(page, 'The model it makes an exception of')
  await expect(page.getByRole('combobox', { name: 'Find a boat model' })).toBeVisible()
  await shot('08-model-finder')
  await page.keyboard.type('classic 340')
  await shot('08b-model-finder-typed')
  const option = page.getByRole('option', { name: 'Highfield Classic 340', exact: true })
  const box = (await option.boundingBox())!
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  await expect(page.getByTestId('rule-sentence')).toContainText('except the Highfield Classic 340')
  await page.getByTestId('rule-sentence').scrollIntoViewIfNeeded()
  await shot('09-except')
  await press(page, /^Add it as 2\.4$/, 'button')
  await expect(
    page.getByText('Your rule is on. The build refuses from the next pick.'),
  ).toBeVisible()
  await shot('10-added')
  await shot('10-added-full', true)

  /* a trailer rule that leaves a boat with nothing says so before it is added */
  await page.goto('/rules?open=new:trailer')
  await expect(page.getByTestId('open-rule')).toBeVisible()
  await pick(page, 'Which of the boat’s specs', /^model$/)
  await press(page, 'The boat’s model')
  await page.keyboard.type('2350 Ultra')
  const uc = page.getByRole('option', { name: /2350 Ultra Centrecab/ }).first()
  const ub = (await uc.boundingBox())!
  await page.mouse.click(ub.x + ub.width / 2, ub.y + ub.height / 2)
  await pick(page, 'Which of the trailer’s specs', /^series$/)
  await pick(page, 'The trailer’s series', /^Alloy Centre-Line Series/)
  await page.getByRole('textbox', { name: 'Because' }).fill('a test of what it would take')
  await expect(page.getByTestId('heads-up')).toBeVisible()
  await page.getByTestId('heads-up').scrollIntoViewIfNeeded()
  await shot('11-empties-heads-up')

  /* a stale link says so */
  await page.goto('/rules?open=zzz-not-a-rule')
  await expect(page.getByTestId('rules-stale')).toBeVisible()
  await shot('12-stale-open')
})

test('the foot and the printed page, photographed', async ({ page }) => {
  const size = `${page.viewportSize()!.width}x${page.viewportSize()!.height}`
  const shot = async (name: string, fullPage = false) => {
    await page.waitForTimeout(450)
    await page.screenshot({ path: `${OUT}/${name}-${size}.png`, fullPage })
  }
  await throughTheDoor(page)
  await page.goto('/rules')
  await expect(page.locator('[data-testid="rules"][data-read]')).toBeVisible({ timeout: 30_000 })
  /* looked for and not true */
  await page
    .getByTestId('refuted')
    .getByRole('button', { name: /^Show the/ })
    .scrollIntoViewIfNeeded()
  await page
    .getByTestId('refuted')
    .getByRole('button', { name: /^Show the/ })
    .click()
  await shot('13-refuted', false)

  /* printed */
  await page.goto('/rules')
  await expect(page.locator('[data-testid="rules"][data-read]')).toBeVisible()
  await page.emulateMedia({ media: 'print' })
  await shot('14-print-full', true)
  await page.emulateMedia({ media: 'screen' })
})
