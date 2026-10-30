import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { escapeRe, pickAndStart, priceWhatWaits } from '../mint'

/* ============================================================
   A RULE THAT WARNS, WHERE THE CHOICE IS MADE (built-critique-m3-2.md, major 3).

   The critic pressed "warns" on Rules and found the build said it only in a sentence above
   the motor list: the warned tile carried no mark, its name said nothing to a reader, and once
   the motor was chosen the finale said nothing about the rule. This walks the same road in a
   real browser at every size: the rule is written on Rules in the dealer's words, the next
   draft is started on the picker's own act, and the build is read where the choice is made —
   the tile — and where the quote is handed over — the finale, over the give, which a warning
   never refuses.

   "At least 15 hp" on a Stacer splits the 379 Proline's five motors: the 8 and 9.9 hp it warns
   about (the 8 hp is the price list's own and comes on the draft), the 15, 20 and 25 hp it
   does not.
   ============================================================ */

const STACER = 'boat_stacer'
const PROLINE = '379 Proline L/S'
const BECAUSE = 'a small motor will not plane a Stacer'
const WRITE_BEHIND_MS = 300

const written = (page: Page) => page.waitForTimeout(WRITE_BEHIND_MS * 2)

async function writeTheWarning(page: Page): Promise<void> {
  await page.goto('/rules?open=new')
  await expect(page.locator('[data-testid="rules"][data-read]')).toBeVisible({ timeout: 30_000 })
  const choose = async (word: string, choice: RegExp) => {
    await page.getByRole('combobox', { name: word }).click()
    await page.getByRole('option', { name: choice }).click()
    await expect(page.getByRole('listbox')).toBeHidden()
  }
  await choose('Which of the boat’s specs', /^maker$/)
  await choose('The boat’s maker', /^Stacer\b/)
  await choose('Which of the motor’s specs', /^horsepower$/)
  await choose('Must be over or under', /^must be at least$/)
  await page.getByRole('textbox', { name: 'The motor’s horsepower, as a figure' }).fill('15')
  await page.getByRole('textbox', { name: 'Because' }).fill(BECAUSE)
  await choose('What the build does', /^warns about/)
  await page.getByRole('button', { name: 'Add it as 2.4' }).click()
  await expect(page.getByTestId('your-rule')).toContainText(
    'When the boat’s maker is Stacer, the motor’s horsepower must be at least 15 hp.',
  )
  await written(page)
}

test('a rule that warns marks the tile, says so over the give, and never refuses it', async ({
  page,
}, info) => {
  test.setTimeout(240_000)
  const motor = page.locator('[data-chapter="motor"]')
  const tile = (code: string) =>
    motor.getByRole('button', { name: new RegExp(`^Yamaha ${escapeRe(code)},`) })

  await throughTheDoor(page)
  await writeTheWarning(page)
  await pickAndStart(page, STACER, PROLINE)
  await page.getByRole('button', { name: /^02 Motor/ }).click()

  /* WHERE THE CHOICE IS MADE: the tile wears the mark, and its name says it to a reader */
  const warned = tile('F9.9LMHB')
  await expect(warned).toBeVisible()
  await expect(warned).toHaveAccessibleName(/your rule warns about it/)
  await expect(warned).toContainText('Your rule warns')
  /* Start puts the boat on alone since 2026-10-30 (DECISIONS, "Start puts the boat on
     alone"), so the price list's own 8 hp is pressed on, as a salesperson would */
  const fitted = tile('F8LMHB')
  await expect(fitted).toHaveAccessibleName(/your rule warns about it, not on the quote/)
  await fitted.click()
  await expect(fitted).toHaveAccessibleName(/your rule warns about it, on the quote/)
  const clear = tile('F20LMHB')
  await expect(clear).not.toHaveAccessibleName(/warns/)
  await expect(clear).not.toContainText('Your rule warns')
  /* the because once, above the list */
  const said = motor.getByTestId('ruled-here')
  await expect(said).toHaveCount(1)
  await expect(said).toContainText(`because ${BECAUSE}.`)
  await warned.scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath('warned-tile.png') })

  /* WHERE IT IS HANDED OVER: said over the give, and the give stays live */
  await page.getByRole('button', { name: /Who it is for/ }).click()
  await page.getByLabel(/Who the quote is for/).fill('R. Kelleher')
  await page.getByRole('button', { name: /Put their name on it|Save the name/ }).click()
  await expect(page.getByTestId('last-step')).toContainText('R. Kelleher')
  await page.getByRole('button', { name: /The finale/ }).click()
  await priceWhatWaits(page)
  const over = page.getByTestId('warned-on-quote')
  await expect(over).toHaveText(
    `Your rule warns about the Yamaha F8LMHB on this quote, because ${BECAUSE}.`,
  )
  const give = page.getByRole('button', { name: 'Give it to the customer' })
  await expect(give).not.toHaveAttribute('aria-disabled', 'true')
  /* said over the act, never under it where the hand has already pressed */
  await over.scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath('warned-finale.png') })
  /* measured once the card has stood still: its rise moves both by the same amount */
  await expect
    .poll(async () => {
      const [a, b] = [await over.boundingBox(), await give.boundingBox()]
      return b!.y - (a!.y + a!.height)
    })
    .toBeGreaterThanOrEqual(0)

  /* changed for a motor it does not warn about, the finale has nothing to say */
  await page.getByRole('button', { name: /^02 Motor/ }).click()
  await clear.click()
  await expect(tile('F20LMHB')).toHaveAccessibleName(/on the quote/)
  await page.getByRole('button', { name: /The finale/ }).click()
  await priceWhatWaits(page)
  await expect(give).toBeVisible()
  await expect(page.getByTestId('warned-on-quote')).toHaveCount(0)
})
