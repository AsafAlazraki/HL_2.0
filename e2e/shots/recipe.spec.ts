/// <reference lib="dom" />
import { expect, test } from '@playwright/test'
import { routes } from '../routes'
import { FIXED_TIME, SHOT, assertOnePixelPerPixel, open } from './recipe'

/* ============================================================
   The recipe, proved on a real page.

   There are no reference shots yet: no screen has been designed, and a
   baseline PNG of a placeholder is a baseline somebody has to delete.
   What exists today is the recipe every future shot will be taken
   under, and a recipe nothing exercises is a recipe that has already
   drifted. So this asserts the five ingredients on the route that does
   exist — the clock, the motion, the pictures, the faces and the
   pixel ratio — and the options `toHaveScreenshot` will be handed.
   ============================================================ */

const route = routes[0]!

test(`the shot recipe holds on ${route.name}`, async ({ page }) => {
  await open(page, route)

  const state = await page.evaluate(() => ({
    now: Date.now(),
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    faces: document.fonts.status,
    undecoded: [...document.images].filter((img) => !img.complete).length,
  }))

  expect(state.now, 'the clock is pinned, so a date on the page cannot move').toBe(
    FIXED_TIME.getTime(),
  )
  expect(state.reduced, 'the app itself is told motion is reduced').toBe(true)
  expect(state.faces, 'no shot is taken while a face is still loading').toBe('loaded')
  expect(state.undecoded, 'every picture has decoded').toBe(0)
  await assertOnePixelPerPixel(page)
})

test('the screenshot options say what they mean', () => {
  // Playwright's own half of the recipe, next to the app's half above.
  expect(SHOT.animations).toBe('disabled')
  expect(SHOT.caret).toBe('hide')
  expect(SHOT.scale).toBe('css')
})
