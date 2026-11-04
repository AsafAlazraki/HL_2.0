import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'

/* ============================================================
   THE BUILD SAYS WHAT WHAT FITS SAYS (fit flow, round 2, the cold
   walk of 2026-11-05). On the Highfield Patrol 600, started from What
   fits with the F130XA and the VHF radio, at every size the rulers run:

     1. the build is titled as What fits titles the boat — the Highfield
        Patrol 600, its version under it — never "Patrol 600 Open";
     2. the F130XA's rigging kit, put on from What fits, stands on its
        own row: no "stays on this quote, though …" in the hull chapter;
     3. a motor the boat's own figures rule out is refused where it is
        pressed, with What fits' own sentence, and the total stands;
     4. What fits is one press from the motor list, and lands at the
        boat's motors with Quotes lit;
     5. the trailer chapter says the GFAB trailer named for the boat,
        and "Patrol 600" finds it in GFAB's whole range;
     6. no chapter head clips the first letters of a wrapped answer;
     7. the customer's panel opens on the name, so a name typed at once
        goes in it, and an empty name is refused with its reason.
   ============================================================ */

const PATROL_600 = '/fitment?boat=boat_highfield%3A298&from=home'

/** From What fits on the Patrol 600, with the F130XA and the VHF radio, into the build. */
async function fromWhatFits(page: Page): Promise<string> {
  await throughTheDoor(page)
  await page.goto(PATROL_600)
  await page
    .getByRole('radio', { name: /Yamaha F130XA/ })
    .first()
    .check({ force: true })
  await page
    .getByRole('checkbox', { name: /VHF Radio/ })
    .first()
    .check({ force: true })
  await page
    .getByRole('button', { name: /^Start the quote/ })
    .first()
    .click()
  await expect(page).toHaveURL(/\/quote\/[^/?]+/, { timeout: 20_000 })
  await expect(page.getByTestId('configurator')).toBeVisible()
  return page.url().split('?')[0]!
}

test('the build says what What fits says about the Patrol 600', async ({ page }) => {
  const build = await fromWhatFits(page)

  /* 1. its title, as What fits titles it */
  await expect(page.locator('.cfg-mast__name')).toHaveText('Highfield Patrol 600')
  await expect(page.locator('.cfg-mast__detail')).toContainText(
    'Open · PVC · Light Grey / White / Dark Grey',
  )

  /* 2. the kit What fits put on with its motor is the build's own row */
  await expect(page.getByTestId('configurator')).not.toContainText('stays on this quote')

  /* 3. the F115LB's 20″ shaft on a 25″ transom: refused, with its reason, the total unmoved */
  await page.getByRole('button', { name: /^Show all 209 in Yamaha Outboards/ }).click()
  const sheet = page.getByTestId('range-sheet')
  await page.locator('#cfg-sheet-find').fill('F115LB')
  const tile = sheet.getByRole('button', { name: /^Yamaha F115LB, not on the quote/ }).first()
  await expect(tile).toHaveAttribute('aria-disabled', 'true')
  await expect(tile).toHaveAccessibleDescription(
    'Inside the 115–150 hp this boat takes, but its shaft is not the extra-long (25″) this boat’s transom takes.',
  )
  const total = page.getByTestId('sheet-total')
  const before = (await total.textContent()) ?? ''
  await tile.click({ force: true })
  await expect(total).toHaveText(before)
  await page.keyboard.press('Escape')
  await expect(sheet).toBeHidden()

  /* 5. the trailer named for it, said, and found by the words the build says it in */
  await page.goto(`${build}?at=trailer`)
  await expect(page.locator('[data-chapter="trailer"] .cfg-bare')).toContainText(
    'One is named for it, the GFAB Tandem Axel Trailer t/s Highfield Patrol 600',
  )
  await page.getByRole('button', { name: /Show all 32 in GFAB Trailers/ }).click()
  await page.locator('#cfg-sheet-find').fill('Patrol 600')
  await expect(page.getByTestId('range-sheet')).toContainText(
    'GFAB Tandem Axel Trailer t/s Highfield Patrol 600',
  )
  await page.keyboard.press('Escape')

  /* 6. every line of every head's answer starts inside the head */
  const clipped = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('.cfg-head__fact')].flatMap((fact) => {
      const edge = fact.getBoundingClientRect().left
      return [...fact.querySelectorAll<HTMLElement>('.cfg-head__said, .cfg-head__rest')].flatMap(
        (box) => {
          const range = document.createRange()
          range.selectNodeContents(box)
          return [...range.getClientRects()]
            .filter((r) => r.width > 1 && r.left < edge - 0.5)
            .map(() => box.textContent ?? '')
        },
      )
    }),
  )
  expect(clipped).toEqual([])

  /* 4. What fits, one press from the motors, at the motors, with Quotes lit */
  await page.goto(`${build}?at=motor`)
  await page.getByRole('link', { name: 'What fits the Patrol 600' }).first().click()
  await expect(page).toHaveURL(/\/fitment\?boat=boat_highfield%3A298&from=quotes&at=motor$/)
})

test('the customer’s panel opens on the name, and an empty name is refused where it is pressed', async ({
  page,
}) => {
  await fromWhatFits(page)
  await page.locator('.cfg-mast').getByRole('button', { name: 'Name the customer' }).click()
  const panel = page.getByRole('dialog', { name: 'The customer' })
  await expect(panel.getByLabel(/Who the quote is for/)).toBeFocused()
  await panel.getByRole('button', { name: 'Put their name on it' }).click()
  await expect(panel).toBeVisible()
  await expect(panel).toContainText(
    'Nothing is typed yet, so there is no name to put on it. Type who the quote is for.',
  )
  await expect(panel.getByLabel(/Who the quote is for/)).toBeFocused()
  await page.keyboard.type('R. Kelleher')
  await expect(panel.getByLabel(/Who the quote is for/)).toHaveValue('R. Kelleher')
  await panel.getByRole('button', { name: 'Put their name on it' }).click()
  await expect(panel).toBeHidden()
  await expect(page.locator('.cfg-mast')).toContainText('R. Kelleher')
})
