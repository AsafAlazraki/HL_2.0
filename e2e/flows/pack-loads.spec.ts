import { expect, test } from '@playwright/test'

/**
 * THE ONE THING NO UNIT TEST CAN SHOW: that the price file survives the whole way to a
 * browser. The pack is served as JSON, fetched, parsed, loaded into the catalogue store and
 * counted back out. The figures asserted here are read off the screen, and the screen reads
 * them off what actually arrived, so a table that failed to load fails this test rather than
 * showing the number the manifest hoped for.
 */
test('the browser reads the whole Master Price File', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))

  await page.goto('/')
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
 * which one they are in, in the foot of the page, so this reads the claim off the screen
 * rather than off a network trace — and it counts the JSON requests too, because "read from
 * this browser" printed over a second full fetch would be a screen telling a comfortable lie.
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

  await page.goto('/')
  await expect(page.getByTestId('pack-counts')).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText('read from the file')).toBeVisible()
  expect(packRequests).toBeGreaterThan(0)

  const onFirstVisit = packRequests
  await page.reload()
  const counts = page.getByTestId('pack-counts')
  await expect(counts).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText('read from this browser')).toBeVisible()

  /* the same sheet, out of the database this time */
  await expect(counts.getByText('53', { exact: true })).toBeVisible()
  await expect(counts.getByText('15,691', { exact: true })).toBeVisible()
  expect(packRequests).toBe(onFirstVisit)
  expect(errors).toEqual([])
})
