/// <reference lib="dom" />
import type { Page, PageScreenshotOptions } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { throughTheDoor } from '../door'
import { issueIt, openTheDocument, raiseTheRung, startAQuote, written } from '../mint'
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
 * draw only once somebody has walked through it. From 2026-09-18 a route can also say that
 * it is reached with a DOCUMENT — the three screens of the sale have no address until one has
 * been minted, which is why no ruler had ever opened them. The walk happens under the same
 * recipe as everything else — the clock and the motion are set before the first navigation,
 * so the screen being measured was rendered under them from its first paint.
 */
export async function open(page: Page, route: Route): Promise<void> {
  await page.clock.setFixedTime(FIXED_TIME)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  if (route.arrive === 'with-a-document') {
    /* THE THIRD MODE, AND WHY IT IS PRESSES AND NOT A `goto`. The three
       screens of the sale have no address until a quote has been
       minted, so the walk in `e2e/mint.ts` makes one — and then each of
       them is reached the way a dealer reaches it. The cascade's
       address carries the pick that raised it; the document is opened
       from the finale that froze it. Only the build itself, which does
       have an address the moment it exists, is navigated to. */
    /* THE BUDGET, SAID OUT LOUD. Playwright's default 30s is the budget
       for a `goto` and one assertion; this walk is four screens long and
       reads 53 tables and 15,691 rows on the way through the blue door.
       A ruler that timed out would report a screen as broken when what
       failed was the walk to it. */
    test.setTimeout(120_000)
    const id = await startAQuote(page)
    if (route.raise === 'a rung') await raiseTheRung(page)
    else if (route.raise === 'the sale') {
      await issueIt(page)
      /* A SCREEN THAT IS NOT THE DOCUMENT STILL WANTS THE SALE MADE.
         Added 2026-09-23 for `/customers`: the walk has to reach a
         screen with a real CUSTOMER on it, and the only honest way a
         name gets into this app is somebody typing one at the desk —
         which `issueIt` does, under "Who it is for", before it presses
         the finale. So a route with `raise: 'the sale'` and an address
         of its own is walked through the sale and then RELOADED onto
         that address, rather than left on the document. It is the same
         reload the register does two branches down, and it waits the
         300 ms write-behind out for the same reason. */
      if (route.path.includes('$id')) await openTheDocument(page)
      else {
        await written(page)
        await page.goto(route.path)
      }
    } else if (!route.path.includes('$id')) {
      /* A SCREEN THAT LISTS DOCUMENTS RATHER THAN BEING ONE — the quotes
         register — has its own address and wants the document on the
         register, not open. That is a reload, and a reload inside the
         300 ms write-behind reads the database back before the draft
         has reached it (the finding two comments down), so the walk
         waits the write out first, the way `e2e/mint.ts` says to. */
      await written(page)
      await page.goto(route.path)
    } else {
      /* AND THE BUILD IS NOT NAVIGATED TO EITHER — the act on the picker
         already landed on it. Measured 2026-09-18: a `page.goto` of the
         address the walk was standing at threw the store away, read the
         database back inside the 300 ms write-behind and drew "no quote
         is filed at this address", so the first thing the contrast ruler
         ever did on this screen was time out on a document that existed
         in memory. What the address is worth asserting for is that it is
         the one this route names. */
      expect(new URL(page.url()).pathname).toBe(route.path.replace('$id', id))
    }
  } else if (route.arrive === 'through-the-door') {
    await throughTheDoor(page)
    /* the door lands on Home; a screen deeper in is one more navigation */
    if (route.path !== '/') await page.goto(route.path)
  } else {
    await page.goto(route.path)
  }
  /* AND ONE PRESS ON THE SCREEN ITSELF, where arriving is not enough to
     have anything to measure.

     `/customers` is a register that DOES NOT EXIST until somebody files
     the first person, and nothing else in this app files one: the
     build's "Who it is for" types a name onto the document and says so
     (`Configurator.tsx` — "this price file carries no customer
     register"). So a browser that has been through the whole sale has
     a name typed on a quote and an empty book, which is the true state
     and has no row for the density ruler to measure a pitch off. The
     screen's own answer to that state is the pile, with one act on it,
     and `then: 'file the name'` presses exactly that act — the press a
     dealer makes, on the screen being measured, with no record planted
     anywhere. It is the same argument `e2e/mint.ts` makes for pressing
     the act on the picker instead of writing a quote into IndexedDB. */
  if (route.then === 'file the name') {
    /* THE BUDGET, SAID OUT LOUD, for the same reason the walk's is. This
       press is waiting on the two database reads the screen makes after
       its first paint — the whole sheet and every document — and
       Playwright's default 5s is the budget for an ordinary click. On a
       four-core machine with a second suite running, that read is what
       ran out: three separate runs each lost ONE check here, a different
       one each time, which is a measurement about the machine and not
       about the screen. The walk above already carries 120s. */
    await page
      .getByRole('region', { name: 'Names typed on quotes, not filed' })
      .getByRole('button', { name: /^File / })
      .first()
      .click({ timeout: 30_000 })
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
