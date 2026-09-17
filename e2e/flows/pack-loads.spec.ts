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
