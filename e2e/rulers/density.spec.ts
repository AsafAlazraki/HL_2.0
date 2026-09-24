import { expect, test } from '@playwright/test'
import { cockpitRoutes } from '../routes'
import { open } from '../shots/recipe'
import { readDensity } from './measure/density'

/* ============================================================
   density — a Cockpit screen holds at least 18 rows at 1280×800.

   THIS IS THE ONE PLACE A REGISTER'S DENSITY IS MEASURED. Until
   2026-09-23 each Cockpit screen's own flow test added up its own room
   out of its own tokens, and this ruler asserted the larger of two
   readings; on the same tree the two disagreed on three screens of
   five, and the green one was the wrong one. Now the flows either read
   `readDensity` or say nothing about density at all, and the figure
   below is the figure.

   Why 18, why a row is counted only when a person could read it, and
   why a register with ONE real quote on it is measured by the room a
   full list would have rather than refused for being short, are in
   `measure/density.ts`. A register with nothing on it fails here, and
   that is the point: a pitch nobody measured is a figure nobody has.

   `fixture.spec.ts` runs every part of the reading over pages built to
   fail, so the instrument pointed at a register is one that has been
   shown to read.
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
      expect(route.density, 'a Cockpit route names the list the ruler measures').toBeDefined()
      await open(page, route)
      const d = await page.evaluate(readDensity, route.density!)
      console.log(
        `  ${route.name.padEnd(15)}${d.records} record${d.records === 1 ? '' : 's'} in view · ` +
          `${d.pitch === null ? 'no' : d.pitch.toFixed(0) + 'px'} pitch · ` +
          `full, ${d.room.toFixed(0)}px of room ${d.framed ? 'in its own scroller' : 'to the edge that stops it'}` +
          `${d.covered > 0 ? ` (${d.covered.toFixed(0)}px under the pill)` : ''}` +
          ` less ${d.heads.toFixed(0)}px of band heads → holds ${d.capacity} of ${ROWS}`,
      )
      expect(d.missing, 'the list this route names is on the page').toBeNull()
      expect(
        d.records,
        'a register with no record on it has no pitch to measure — the walk should have minted one',
      ).toBeGreaterThanOrEqual(1)
      expect
        .soft(d.strays, 'every record a person can read is in the list this route names')
        .toBe(0)
      expect
        .soft(
          d.records,
          'a full list holds at least the records a person can already read in it — if not, the ruler is wrong, not the screen',
        )
        .toBeLessThanOrEqual(d.capacity)
      expect(
        d.capacity,
        `a Cockpit screen holds at least ${ROWS} rows at 1280×800`,
      ).toBeGreaterThanOrEqual(ROWS)
    })
  }
})
