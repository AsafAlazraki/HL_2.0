/// <reference lib="dom" />
import { expect, test } from '@playwright/test'
import { cockpitRoutes } from '../routes'
import { open } from '../shots/recipe'

/* ============================================================
   density — a Cockpit screen shows at least 18 rows at 1280×800.

   The plan states the requirement per table shape before a grid is
   written: 18 rows on a dealer's laptop, and a two-level hierarchy
   costs two lines per four rows, so a grouped register must earn its
   grouping. A register that shows twelve rows makes a person scroll to
   compare two boats that are three rows apart, which is the whole job.

   It counts what a person can actually READ: a row whose box is inside
   the viewport, not a row that exists in a virtualiser's buffer below
   the fold. `[role="row"]` is what a grid gives a screen reader, so it
   is what this counts — a register that does not expose rows to a
   reader has a second defect, and this ruler finds it as a first one.

   SKIPPED UNTIL THERE IS A COCKPIT ROUTE. Milestone 0 has one address
   and it is the foundation placeholder. The skip is loud rather than
   silent: a ruler that quietly measures nothing is the failure the
   contrast sweep in the old repo shipped for months.
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
      const visible = await page.evaluate(() => {
        const height = window.innerHeight
        let seen = 0
        for (const row of document.querySelectorAll('[role="row"]')) {
          const r = row.getBoundingClientRect()
          if (r.height < 2) continue
          if (r.top >= 0 && r.bottom <= height) seen++
        }
        return seen
      })
      console.log(`  ${route.name.padEnd(12)} ${visible} rows readable at 1280×800`)
      expect(
        visible,
        `a Cockpit screen shows at least ${ROWS} rows at 1280×800`,
      ).toBeGreaterThanOrEqual(ROWS)
    })
  }
})
