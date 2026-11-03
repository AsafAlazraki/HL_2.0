import { expect, test } from '@playwright/test'
import { throughTheDoor } from '../door'

/* TEMPORARY: removed before the report */
test('fitment show all, refused under the range', async ({ page }, info) => {
  await throughTheDoor(page)
  await page.goto('/fitment?boat=boat_highfield%3A513&all=motor&only=under')
  await expect(page.locator('[data-testid="fitment"][data-mode="all"]')).toBeVisible({ timeout: 20_000 })
  await page.getByRole('button', { name: /^Put the Yamaha F2.5SMHB on/ }).click()
  await page.waitForTimeout(400)
  await page.screenshot({
    path: `docs/directions/data-round/fitment/after/16-under-refused-${info.project.name}.png`,
  })
})
