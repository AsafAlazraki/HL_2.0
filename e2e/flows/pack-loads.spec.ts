import { expect, test } from '@playwright/test'
import { throughTheDoor } from '../door'

/* ============================================================
   THE ONE THING NO UNIT TEST CAN SHOW: that the price file survives
   the whole way to a browser. The pack is served as JSON, fetched,
   parsed, loaded into the catalogue store and counted back out.

   IT WAS MILESTONE 0'S PROOF AND IT IS STILL THE PROOF; only the page
   it reads changed. The placeholder route that printed these counts
   has been replaced by the real screens, so the walk is the real one —
   a name at the door, the blue door pressed, the counts read off
   Home's own stamp — and the figures are read off the screen, which
   reads them off what actually arrived. A table that failed to load
   fails this test rather than showing the number the manifest hoped
   for.
   ============================================================ */

test('the browser reads the whole Master Price File', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))

  await throughTheDoor(page)
  const counts = page.getByTestId('pack-counts')
  await expect(counts).toBeVisible({ timeout: 30_000 })

  await expect(counts.getByText('53', { exact: true })).toBeVisible()
  await expect(counts.getByText('15,691', { exact: true })).toBeVisible()
  await expect(counts.getByText('28', { exact: true })).toBeVisible()
  expect(errors).toEqual([])
})

/**
 * AND THE OTHER HALF OF MILESTONE 0'S EXIT CRITERION: "the pack loads into IndexedDB and
 * reloads". The first visit fetches the file and files it, one transaction per table; the
 * second visit finds the sheet already down there and fetches nothing at all. Both states say
 * which one they are in, in the masthead, so this reads the claim off the screen rather than
 * off a network trace — and it counts the JSON requests too, because "read from this browser"
 * printed over a second full fetch would be a screen telling a comfortable lie.
 *
 * THE TWO SENTENCES COME FROM TWO DIFFERENT SCREENS' WORK, which is the wiring this proves:
 * "read from the file" is Entry's open, carried to Home through the catalogue store across a
 * navigation; "read from this browser" is Home's own, read out of IndexedDB through the
 * repository seam on a cold start.
 */
test('the second visit reads the sheet out of this browser, not out of the file', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))

  let packRequests = 0
  await page.route('**/data/northside/**', (route) => {
    packRequests += 1
    return route.continue()
  })

  await throughTheDoor(page)
  await expect(page.getByTestId('pack-counts')).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText(/read from the file/)).toBeVisible()
  expect(packRequests).toBeGreaterThan(0)

  const onFirstVisit = packRequests
  await page.reload()
  const counts = page.getByTestId('pack-counts')
  await expect(counts).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText(/read from this browser/)).toBeVisible()

  /* the same sheet, out of the database this time */
  await expect(counts.getByText('53', { exact: true })).toBeVisible()
  await expect(counts.getByText('15,691', { exact: true })).toBeVisible()
  expect(packRequests).toBe(onFirstVisit)
  expect(errors).toEqual([])
})
