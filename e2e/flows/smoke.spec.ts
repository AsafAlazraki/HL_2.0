import { expect, test } from '@playwright/test'

/**
 * THE FIRST THING A BROWSER SEES. A fresh browser has no name in it, so the first-visit rule
 * sends `/` to the door — this is the app mounting, routing and drawing a real screen, with
 * nothing on the console.
 */
test('the built app mounts on the door and prints no page error', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  await expect(page.getByTestId('entry')).toBeVisible()
  await expect(page).toHaveURL(/\/sign-in$/)
  expect(errors).toEqual([])
})
