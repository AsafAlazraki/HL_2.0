import { expect, test } from '@playwright/test'
import { AT_THE_DESK, FILE_DOOR, throughTheDoor } from '../door'

/* ============================================================
   THE TWO SCREENS AS ONE APP.

   Everything here is about the joins rather than about either screen:
   which address a visitor lands on, what the session store remembers
   across a reload, and whether the sheet Entry read is the sheet Home
   counts. The screens' own suites are `entry.spec.ts` and
   `home.spec.ts`; this one would fail if they both passed and the
   wiring between them did not.
   ============================================================ */

test('a visitor with no name lands on the door, wherever they typed', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByTestId('entry')).toBeVisible()
  /* and the redirect is the router's, before Home is drawn: no
     flash of a screen this person has no name for */
  await expect(page.getByTestId('home')).toHaveCount(0)
})

test('a returning visitor lands on Home, and the desk keeps their name', async ({ page }) => {
  await throughTheDoor(page, { door: 'blank' })
  await expect(page.getByTestId('home')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toContainText(AT_THE_DESK)

  /* the name is remembered through prefs, so a reload and a typed
     address both open on Home rather than on the door */
  await page.reload()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(AT_THE_DESK)
  await page.goto('/sign-in')
  await expect(page).toHaveURL(/\/$/)
})

test('the blank door leaves Home with nothing counted, and the way back to the file', async ({
  page,
}) => {
  /* THE TABLES, not everything under the pack's address: the entry
     screen reads three small files to say what the door WILL load —
     the manifest and the two picture ledgers — and it reads them
     whichever door is pressed. What "loads nothing" promises is that
     no row of the price file is fetched, and a row lives in a table. */
  let tableRequests = 0
  await page.route('**/data/northside/tables/**', (route) => {
    tableRequests += 1
    return route.continue()
  })

  await throughTheDoor(page, { door: 'blank' })
  await expect(page.getByTestId('home')).toBeVisible()
  await expect(
    page.getByText('A blank sheet. No price file has been read into it yet.'),
  ).toBeVisible()
  await expect(page.getByTestId('pack-counts')).toHaveCount(0)
  await expect(page.getByText(/No price file is open/)).toBeVisible()

  /* AND HOME DID NOT QUIETLY LOAD IT ANYWAY. The blank door's promise
     is "loads nothing", and a Home that fetched the file on arrival
     would break it one navigation later. */
  expect(tableRequests, 'not one table of the file was fetched').toBe(0)

  /* a reload does not change that: an empty database is an empty sheet */
  await page.reload()
  await expect(
    page.getByText('A blank sheet. No price file has been read into it yet.'),
  ).toBeVisible()
  expect(tableRequests).toBe(0)

  /* the door is still reachable, which is what makes "the file can be
     loaded later" a promise and not a line */
  await page.getByRole('button', { name: 'Load the Master Price File' }).click()
  await expect(page).toHaveURL(/\/sign-in\?again=true$/)
  await expect(page.getByTestId('entry')).toBeVisible()
  /* and it does not ask for a name it already has */
  await expect(page.getByRole('textbox')).toHaveValue(AT_THE_DESK)

  await page.getByRole('button', { name: FILE_DOOR }).click()
  await expect(page).toHaveURL(/\/$/, { timeout: 30_000 })
  await expect(page.getByTestId('pack-counts')).toBeVisible()
  expect(tableRequests, 'this time the file really was read').toBeGreaterThan(0)
})
