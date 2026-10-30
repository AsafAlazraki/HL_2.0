import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test, type Locator, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'

/* ============================================================
   A PICTURE NORTHSIDE ADDS, WALKED ON THE KIT — `AddPicture` on two
   real options of the 529 before any screen carries it: the trailer
   the price list names for the hull, of which no picture exists, and
   the motor chosen in the build, whose maker's picture the app has.

   THE PICTURE GIVEN IS THE ITEM'S OWN. The one file this walk adds is
   the motor's own catalogue picture, read as bytes from
   public/seed-images: a picture of that exact motor, so the walk adds
   nothing a dealer could not truthfully add. The refusals are a text
   file and pasted words, which are what they say they are.

   The kit keeps nothing (KitPicture.tsx), so nothing here reaches the
   price list on this computer.
   ============================================================ */

const ROOT = process.cwd()

test.beforeEach(async ({ page }) => {
  test.setTimeout(120_000)
  await throughTheDoor(page)
  await page.goto('/kit')
  await expect(page.getByRole('heading', { name: 'A picture Northside adds' })).toBeVisible({
    timeout: 30_000,
  })
})

const group = (page: Page): Locator =>
  page.getByRole('region', { name: 'A picture Northside adds' })
const options = (page: Page): Locator => group(page).getByRole('listitem')

/** Drop what the page builds in its own `DataTransfer` on a frame, as a drag from the desktop. */
async function dropOn(frame: Locator, name: string, type: string, body: string): Promise<void> {
  const transfer = await frame.page().evaluateHandle(
    (given) => {
      const dt = new DataTransfer()
      dt.items.add(new File([given.body], given.name, { type: given.type }))
      return dt
    },
    { name, type, body },
  )
  await frame.dispatchEvent('dragenter', { dataTransfer: transfer })
  await frame.dispatchEvent('drop', { dataTransfer: transfer })
}

test('the trailer with no picture asks for one, and refuses a text file and pasted words with a sentence', async ({
  page,
}, testInfo) => {
  const trailer = options(page).first()
  const said = (await trailer.locator('.kit-cap').textContent()) ?? ''
  expect(said).not.toBe('')
  const frame = trailer.getByRole('button', { name: `Add a picture of the ${said}` })
  await expect(frame).toBeVisible()
  /* the name bound at its separators, so no line opens on a "·": the same words */
  await expect(trailer.locator('.ui-addpic-ask')).toHaveText(`Add a picture of the ${said}`)

  await dropOn(frame, 'quote-notes.txt', 'text/plain', 'the customer wants a spare wheel')
  const notAPicture = `“quote-notes.txt” is not a picture, so it cannot be the ${said}’s. A photograph or a drawing can: JPEG, PNG, WebP or GIF.`
  await expect(trailer.getByText(notAPicture)).toBeVisible()
  await expect(frame).toHaveAccessibleDescription(new RegExp('quote-notes\\.txt'))

  /* a pasted address: never fetched, refused with why */
  await frame.focus()
  await frame.evaluate((el) => {
    const dt = new DataTransfer()
    dt.setData('text/plain', 'https://www.example.com/trailer.jpg')
    el.dispatchEvent(
      new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }),
    )
  })
  await expect(trailer.getByText(/^That is an address, not a picture\./)).toBeVisible()
  await expect(trailer.getByText(notAPicture)).toHaveCount(0)
  await group(page).screenshot({
    path: testInfo.outputPath(`add-picture-refused-${testInfo.project.name}.png`),
  })
})

test('the motor takes its own picture by the keyboard’s chooser, keeps the maker’s in front until chosen, and Undo puts back what was taken off', async ({
  page,
}, testInfo) => {
  const motor = options(page).nth(1)
  const said = (await motor.locator('.kit-cap').textContent()) ?? ''
  const frame = motor.getByRole('button', { name: `Add your own picture of the ${said}` })
  await expect(frame).toBeVisible()
  await expect(motor.getByText('The maker’s picture of this exact item.')).toBeVisible()
  const makers = (await frame.locator('img').getAttribute('src')) ?? ''
  expect(makers).toMatch(/\/seed-images\/[^/]+\.webp$/)

  /* THE KEYBOARD'S WAY: Tab to the frame, Enter opens the chooser, the file is given */
  await frame.focus()
  const chooser = page.waitForEvent('filechooser')
  await page.keyboard.press('Enter')
  const file = path.join(ROOT, 'public', 'seed-images', makers.split('/').pop()!)
  await (
    await chooser
  ).setFiles({
    name: path.basename(file),
    mimeType: 'image/webp',
    buffer: readFileSync(file),
  })

  const provenance = motor.locator('.ui-addpic-line')
  await expect(provenance).toHaveText(
    /^Yours is kept: added by Asaf, \d{1,2} [A-Z][a-z]+ \d{4}\. The maker’s picture of this exact item is shown\.$/,
  )
  await expect(motor.getByRole('status')).toHaveText(/^Kept at \d+ × \d+, /)
  await expect(page.getByText(`Your picture is on the ${said} now.`)).toBeVisible()

  /* shown over the maker's: the dealer's bytes, redrawn here, are the frame's picture */
  await motor.getByRole('switch', { name: 'Show yours instead of the maker’s' }).click()
  await expect(provenance).toHaveText(/^Added by Asaf, \d{1,2} [A-Z][a-z]+ \d{4}$/)
  await expect(motor.locator('.ui-addpic-frame')).toHaveAccessibleName(
    `Put another picture on the ${said}`,
  )
  await expect(motor.locator('.ui-addpic-frame img')).toHaveAttribute(
    'src',
    /^data:image\/webp;base64,/,
  )
  await group(page).screenshot({
    path: testInfo.outputPath(`add-picture-${testInfo.project.name}.png`),
  })

  /* taken off, and back with Undo */
  await motor.getByRole('button', { name: 'Take it off' }).click()
  await expect(provenance).toHaveText('The maker’s picture of this exact item.')
  const toast = page.locator('.ui-toast', { hasText: `Your picture is off the ${said}.` })
  await toast.getByRole('button', { name: 'Undo' }).click()
  await expect(provenance).toHaveText(/^Added by Asaf, /)
  await expect(motor.locator('.ui-addpic-frame img')).toHaveAttribute(
    'src',
    /^data:image\/webp;base64,/,
  )
})
