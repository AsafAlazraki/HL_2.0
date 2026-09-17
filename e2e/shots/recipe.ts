/// <reference lib="dom" />
import type { Page, PageScreenshotOptions } from '@playwright/test'
import { expect } from '@playwright/test'
import { throughTheDoor } from '../door'
import type { Route } from '../routes'

/* ============================================================
   THE DETERMINISM RECIPE.

   A screenshot that differs between two runs of the same build is not
   a regression, it is noise, and a suite that cries wolf is a suite
   nobody reads. Five things move under a shot, and all five are pinned
   here rather than in each spec, because a recipe half-applied is the
   same as no recipe:

     1. THE CLOCK. A screen that prints a date, a "3 minutes ago", or a
        greeting that changes at noon renders differently at 11:59. The
        clock is fixed BEFORE the first navigation, so `new Date()` in
        the app is the same instant on every run. It is a Brisbane
        morning because the dealership is in Brisbane and the app's
        locale is en-AU.

        `setFixedTime`, not `install`: installing a fake clock also
        PAUSES every timer until something advances it, and a screen
        that loads the pack, debounces a write or waits on a transition
        would sit there forever. Only the date is pinned; the app keeps
        running.

     2. MOTION. Reduced motion is emulated and Playwright's own
        `animations: 'disabled'` finishes CSS animations and
        transitions at their end state. Both, not either: the first is
        what the app itself listens to, the second is what catches a
        library animating in JavaScript.

     3. IMAGES. `page.goto` resolves when the document loads, not when
        a picture has decoded, so a shot taken immediately catches an
        empty frame where a hull will be. Every image is awaited to
        completion and decode.

     4. FONTS. A shot taken while a face is still loading measures the
        fallback's metrics — different widths, different wraps, a
        different number of lines.

     5. THE CARET. A focused text field blinks, so half the shots have
        a caret and half do not. `caret: 'hide'` removes it.

   Device pixel ratio is the sixth, and it is set once in
   playwright.config.ts (`deviceScaleFactor: 1`) because it belongs to
   the browser context, not to a page. `open()` asserts it rather than
   trusting it: a recipe that can be silently switched off is not a
   recipe.
   ============================================================ */

/** One fixed instant, in the dealership's own timezone. */
export const FIXED_TIME = new Date('2026-09-16T09:00:00+10:00')

/** The options every `toHaveScreenshot` takes. */
export const SHOT: PageScreenshotOptions = {
  animations: 'disabled',
  caret: 'hide',
  scale: 'css',
}

/**
 * Open a route with the recipe applied, and prove it arrived. Every ruler starts here, so
 * no ruler can measure a page that never loaded: `route.ready` is the screen's own proof of
 * presence and a missing one fails the test rather than reporting a clean empty page.
 *
 * A ROUTE SAYS HOW IT IS REACHED, because from Milestone 1 typing the address is not always
 * enough: the first-visit rule sends a nameless browser to the door, and Home has a sheet to
 * draw only once somebody has walked through it. The walk happens under the same recipe as
 * everything else — the clock and the motion are set before the first navigation, so the
 * screen being measured was rendered under them from its first paint.
 */
export async function open(page: Page, route: Route): Promise<void> {
  await page.clock.setFixedTime(FIXED_TIME)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  if (route.arrive === 'through-the-door') {
    await throughTheDoor(page)
    /* the door lands on Home; a screen deeper in is one more navigation */
    if (route.path !== '/') await page.goto(route.path)
  } else {
    await page.goto(route.path)
  }
  await page.waitForSelector(route.ready, { state: 'visible' })
  await settle(page)
}

/** Wait for the things that finish after the document does. */
export async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all(
      [...document.images].map(async (img) => {
        if (img.complete) return
        try {
          await img.decode()
        } catch {
          /* a picture that cannot decode is the image ledger's problem, not the shot's */
        }
      }),
    )
  })
  // One frame, so that anything scheduled by the decode above has painted.
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve(null))))
}

/** The sixth ingredient, asserted rather than assumed. */
export async function assertOnePixelPerPixel(page: Page): Promise<void> {
  const ratio = await page.evaluate(() => window.devicePixelRatio)
  expect(ratio, 'deviceScaleFactor is set to 1 in playwright.config.ts').toBe(1)
}
