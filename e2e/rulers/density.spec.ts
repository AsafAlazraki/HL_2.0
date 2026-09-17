import { expect, test } from '@playwright/test'
import { cockpitRoutes } from '../routes'
import { open } from '../shots/recipe'
import { countReadableRows } from './measure/density'

/* ============================================================
   density — a Cockpit screen shows at least 18 rows at 1280×800.

   Why 18, and why a row is counted only when a person could read it,
   are in `measure/density.ts`.

   SKIPPED UNTIL THERE IS A COCKPIT ROUTE. Milestone 0 has one address
   and it is the foundation placeholder. The skip is loud rather than
   silent: a ruler that quietly measures nothing is the failure the
   contrast sweep in the old repo shipped for months. And because a
   skip is still a ruler nobody has seen work, `fixture.spec.ts` runs
   the same count over a page with a known number of rows above and
   below the fold — so on the day a register arrives, the instrument
   pointed at it is one that has already been shown to read.
   ============================================================ */

const ROWS = 18

test.describe('density', () => {
  test.skip(({ viewport }) => viewport?.width !== 1280, 'measured at 1280×800, the dealer’s laptop')

  const cockpit = cockpitRoutes()

  if (cockpit.length === 0) {
    // A declared, skipped test rather than an empty file: the run prints one line saying
    // this ruler is waiting, which is the difference between "waiting" and "gone".
    test.skip(`density — no Cockpit screen exists yet (it will owe ${ROWS} rows at 1280×800)`, () => {
      /* nothing to measure until a route declares register: 'cockpit' */
    })
  }

  for (const route of cockpit) {
    test(`density — ${route.name}`, async ({ page }) => {
      await open(page, route)
      const visible = await page.evaluate(countReadableRows)
      console.log(`  ${route.name.padEnd(12)} ${visible} rows readable at 1280×800`)
      expect(
        visible,
        `a Cockpit screen shows at least ${ROWS} rows at 1280×800`,
      ).toBeGreaterThanOrEqual(ROWS)
    })
  }
})
