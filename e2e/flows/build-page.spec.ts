import { expect, test } from '@playwright/test'
import { throughTheDoor } from '../door'
import { cameToRest, pickAndStart } from '../mint'

/* ============================================================
   THE BUILD PAGE AS THE OWNER ASKED FOR IT (2026-10-30, word for word:
   "also on the /quote/ pages we need to be able to expand images of
   products … Total should move from top right to bottom left area and
   be way nicer and more visual and always hull expanded first and the
   header section should be way nicer … and also i don't like how the
   image goes all the way to left on big screen"), each measured at
   every size the rulers run, on the Highfield Sport 560 started at the
   picker's act:

     1. the hull opens first, and the quote starts with the boat alone
        (nothing nobody chose is on it);
     2. the total stands at the bottom left, in sight, over no control
        and clear of the shell's bar, and says what it is made of;
     3. the head is the quote's identity: the boat's name, the quote's
        number, where it stands and whom it is for;
     4. the boat's photograph stands inside the page's measure, never at
        the window's edge;
     5. a product's picture opens large, never past its own pixels, with
        its caption and provenance, and Escape and the close return the
        caret to the press that opened it.

   With HL2_LOOK set it also writes screenshots there, for a person.
   ============================================================ */

const LOOK = process.env.HL2_LOOK ?? ''

test('the build page: hull first, the total at the bottom left, the head, the picture, large', async ({
  page,
}, info) => {
  test.setTimeout(240_000)
  await throughTheDoor(page)
  await pickAndStart(page, 'boat_highfield', 'SP560')
  await cameToRest(page)
  const size = page.viewportSize()!
  const shot = async (name: string): Promise<void> => {
    if (LOOK !== '') await page.screenshot({ path: `${LOOK}/${info.project.name}-${name}.png` })
  }
  await shot('top')

  /* 1. THE HULL FIRST, AND THE BOAT ALONE */
  await expect(page.getByRole('button', { name: /^01 The hull/ })).toHaveAttribute(
    'aria-expanded',
    'true',
  )
  const tally = page.getByTestId('running-total')
  await expect(tally).toContainText('Not chosen yet: motor')
  await expect(page.getByRole('region', { name: /^02 Motor/ })).toContainText('Nothing on it yet')

  /* 2. THE TOTAL AT THE BOTTOM LEFT, in sight at rest, over no control, clear of the shell */
  const box = (await tally.boundingBox())!
  expect(box.x).toBeLessThan(size.width / 2)
  expect(box.y + box.height).toBeLessThanOrEqual(size.height)
  expect(box.y).toBeGreaterThan(size.height / 3)
  const pill = (await page.getByTestId('shell-pill').boundingBox())!
  const clear = box.y + box.height <= pill.y || pill.y + pill.height <= box.y
  expect(clear, 'the total stands over the shell’s bar').toBe(true)
  /* what it is made of, said to a reader in the bar's name (not drawn in a short window's row) */
  await expect(tally).toContainText(/Made of: Hull \$/)

  /* 3. THE HEAD IS THE QUOTE'S IDENTITY */
  const head = page.locator('.cfg-mast')
  await expect(head.getByRole('heading', { level: 1 })).toHaveText(/Highfield Sport 560/)
  await expect(head).toContainText(/Quote\s*\d{8}-\d{2}/)
  await expect(head).toContainText('Draft')
  await expect(head.getByRole('button', { name: 'Name the customer' })).toBeVisible()

  /* 4. THE PHOTOGRAPH INSIDE THE PAGE'S MEASURE, its start edge on the head's */
  const photo = (await page.locator('.cfg-shot').boundingBox())!
  const name = (await head.getByRole('heading', { level: 1 }).boundingBox())!
  expect(photo.x).toBeGreaterThanOrEqual(16)
  expect(Math.abs(photo.x - name.x)).toBeLessThanOrEqual(4)

  /* 5. A PICTURE, LARGE: the boat's, then a motor's among its chapter's */
  const opener = page.getByRole('button', { name: 'See the boat larger' })
  await opener.scrollIntoViewIfNeeded()
  await opener.click()
  const large = page.getByRole('dialog')
  await expect(large).toBeVisible()
  await expect(large).toContainText('Highfield Sport 560')
  await expect(large).toContainText(/from media\.highfieldboats\.com/)
  const img = large.locator('img')
  const drawn = (await img.boundingBox())!
  const held = await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
  expect(drawn.width).toBeLessThanOrEqual(held + 1)
  await shot('large')
  await page.keyboard.press('Escape')
  await expect(large).toBeHidden()
  await expect(opener).toBeFocused()

  await page.getByRole('button', { name: /^02 Motor/ }).click()
  await cameToRest(page)
  await shot('motor')
  const motor = page.getByRole('region', { name: /^02 Motor/ })
  const expand = motor.getByRole('button', { name: 'See its picture larger' })
  await expect(expand.first()).toBeVisible()
  await expand.first().click()
  await expect(large).toBeVisible()
  await expect(large).toContainText(/1 of \d+ · Motor/)
  await page.keyboard.press('ArrowRight')
  await expect(large).toContainText(/2 of \d+ · Motor/)
  await large.getByRole('button', { name: 'Close' }).click()
  await expect(large).toBeHidden()
  await expect(expand.first()).toBeFocused()

  /* and the total stays in sight while the build is worked */
  await page.mouse.wheel(0, 900)
  await cameToRest(page)
  const after = (await tally.boundingBox())!
  expect(after.y + after.height).toBeLessThanOrEqual(size.height)
  expect(after.y).toBeGreaterThanOrEqual(0)
  await shot('scrolled')
})
