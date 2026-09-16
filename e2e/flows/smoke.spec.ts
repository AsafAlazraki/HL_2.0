import { expect, test } from '@playwright/test'

test('the built app mounts and prints no page error', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  await expect(page.getByTestId('home')).toBeVisible()
  expect(errors).toEqual([])
})
