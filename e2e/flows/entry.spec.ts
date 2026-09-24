import { expect, test } from '@playwright/test'

/* ============================================================
   THE FIRST THING THAT HAPPENS: somebody puts a name to the desk and
   picks a door.

   Every figure asserted here is read off the screen, and the screen
   reads it off `data/northside/manifest.json` — so a pack that lost a
   table fails this test with a smaller number rather than showing the
   number we hoped for. Nothing is stubbed: this is the built app, the
   real file, and a real browser.
   ============================================================ */

const FILE_DOOR = /Load the Master Price File/
const BLANK_DOOR = /Start a blank sheet/

test('the door states what it will load, and says nothing is checked', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))

  await page.goto('/sign-in')
  await expect(page.getByTestId('entry')).toBeVisible()

  /* no password field anywhere: a password that protects nothing is fake data */
  await expect(page.getByText('There is no password.')).toBeVisible()
  await expect(page.locator('input[type="password"]')).toHaveCount(0)
  await expect(page.getByRole('textbox')).toHaveCount(1)

  const door = page.getByRole('button', { name: FILE_DOOR })
  await expect(door).toContainText('53')
  await expect(door).toContainText('15,691')
  await expect(door).toContainText('28')

  /* the photograph's own row in the file, named beside it — by the table's own name, never
     the packer's key for it */
  await expect(page.getByText(/lines in the file/)).toContainText('Stacer')
  await expect(page.getByTestId('entry')).not.toContainText('boat_stacer')
  await expect(page.getByRole('heading', { name: 'Stacer 481 SeaMaster' })).toBeVisible()

  /* RULE (c) OF THE MILESTONE 2 FIX ROUND: no plan word on a screen. "…arrives with the
     backend at Milestone 6" was the fourth line of the first screen anyone sees (critique of
     Milestone 2, #14); what will happen is said in the dealer's words instead. */
  await expect(page.getByTestId('entry')).not.toContainText(/Milestone|backend|\brepo\b/)
  /* and no promise of a thing no screen does (built-critique-m2-close-2.md, major 4) */
  await expect(page.getByText(/the name stays on this computer/)).toBeVisible()
  await expect(page.getByTestId('entry')).not.toContainText(/kept online|sign-in of their own/)

  expect(errors).toEqual([])
})

/* ============================================================
   RULE (d): A SCREEN FITS THE WINDOW IT IS DRAWN AT, OR SCROLLS ON PURPOSE.

   `entry.css` claims the composition fits at the laptop, the desk and the showroom — "a
   composition that has to be scrolled to is not the composition" — and until this round
   nothing held it to that: the critique of Milestone 2 (#10) found three screens that had
   quietly stopped fitting. The phone, the turned phone and the tablet scroll on purpose and
   say so in the same header, so they are not asserted here.
   ============================================================ */

const CLAIMS_TO_FIT = new Set(['1280x800', '1440x900', '1920x1080'])

test('fits the window it is drawn at, where it claims to', async ({ page, viewport }) => {
  const size = `${viewport?.width}x${viewport?.height}`
  test.skip(!CLAIMS_TO_FIT.has(size), `entry scrolls on purpose at ${size}`)

  await page.goto('/sign-in')
  await expect(page.getByTestId('entry')).toBeVisible()
  /* the three small files have landed: the door says what it will load */
  await expect(page.getByRole('button', { name: FILE_DOOR })).toContainText('15,691')

  const { scroll, inner } = await page.evaluate(() => ({
    scroll: document.scrollingElement!.scrollHeight,
    inner: innerHeight,
  }))
  expect(scroll, `entry is ${scroll}px in a ${inner}px window at ${size}`).toBeLessThanOrEqual(
    inner,
  )
})

test('every act is reachable from the keyboard, in the order it is read', async ({ page }) => {
  await page.goto('/sign-in')
  await expect(page.getByTestId('entry')).toBeVisible()

  /* the keyboard lands in the field on arrival */
  await expect(page.getByRole('textbox')).toBeFocused()

  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: FILE_DOOR })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: BLANK_DOOR })).toBeFocused()
})

test('a name, Enter, and the whole Master Price File is in the app on Home', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))

  /* counted rather than assumed: the door promises 53 tables, so 53 table files are what
     pressing it fetches. The count is the door's own claim, checked on the wire. */
  let tableRequests = 0
  await page.route('**/data/northside/tables/**', (route) => {
    tableRequests += 1
    return route.continue()
  })

  await page.goto('/sign-in')
  const field = page.getByRole('textbox')
  await field.fill('Asaf')
  /* Enter in the field presses the first door, which is the file */
  await field.press('Enter')

  await expect(page).toHaveURL(/\/$/, { timeout: 30_000 })
  await expect(page.getByTestId('entry')).toHaveCount(0)
  expect(tableRequests).toBe(53)

  expect(errors).toEqual([])
})

test('a returning visitor never sees the door again', async ({ page }) => {
  await page.goto('/sign-in')
  await page.getByRole('textbox').fill('Asaf')
  await page.getByRole('button', { name: BLANK_DOOR }).click()
  await expect(page).toHaveURL(/\/$/)

  /* the name is remembered through prefs, so the address itself now sends them to Home */
  await page.goto('/sign-in')
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByTestId('entry')).toHaveCount(0)
})

test('the blank door loads nothing, and says so before it is pressed', async ({ page }) => {
  await page.goto('/sign-in')
  const blank = page.getByRole('button', { name: BLANK_DOOR })
  await expect(blank).toContainText('Loads nothing: no tables, no rows, no fitment')

  let packRequests = 0
  await page.route('**/data/northside/tables/**', (route) => {
    packRequests += 1
    return route.continue()
  })

  await page.getByRole('textbox').fill('Asaf')
  await blank.click()
  await expect(page).toHaveURL(/\/$/)

  /* the door's promise, measured: not one table of the file was fetched by pressing it */
  expect(packRequests).toBe(0)
})

test('a file that cannot be read is refused in a sentence, where it was pressed', async ({
  page,
}) => {
  await page.goto('/sign-in')
  await expect(page.getByTestId('entry')).toBeVisible()

  /* the tables stop answering after the screen has read the manifest, which is what a
     half-published build looks like from the browser */
  await page.route('**/data/northside/entities.json', (route) => route.abort('failed'))

  await page.getByRole('textbox').fill('Asaf')
  await page.getByRole('button', { name: FILE_DOOR }).click()

  const said = page.getByRole('alert')
  await expect(said).toContainText('The Master Price File was not loaded')
  await expect(said).toContainText('the door can be pressed again')
  /* still on the door, and the door is still a door: not disabled, not silent */
  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByRole('button', { name: FILE_DOOR })).not.toHaveAttribute(
    'aria-disabled',
    'true',
  )
})
