import { expect, test } from '@playwright/test'
import { cockpitRoutes } from '../routes'
import { open } from '../shots/recipe'
import { readDensity } from './measure/density'

/* ============================================================
   density — a Cockpit screen shows at least 18 rows at 1280×800.

   Why 18, why a row is counted only when a person could read it, and
   why a register with ONE real quote on it is measured by the pitch of
   that row rather than refused for being short, are in
   `measure/density.ts`.

   A register with nothing on it fails here, and that is the point: for
   a day this ruler read "6 rows" off an empty quotes register — three
   band heads and three notices — and the number meant nothing either
   way. The walk in `e2e/mint.ts` puts a real document on the register
   first, and the pitch is read off that document's own row.

   `fixture.spec.ts` runs both readings over pages built to fail, so
   the instrument pointed at a register is one that has been shown to
   read.
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
      const d = await page.evaluate(readDensity, route.density ?? {})
      console.log(
        `  ${route.name.padEnd(12)} ${d.records} record${d.records === 1 ? '' : 's'} in view · ` +
          `${d.pitch === null ? 'no' : d.pitch.toFixed(0) + 'px'} pitch · ` +
          `${d.room.toFixed(0)}px room less ${d.heads.toFixed(0)}px of band heads → holds ${d.capacity}`,
      )
      expect(
        d.records,
        'a register with no record on it has no pitch to measure — the walk should have minted one',
      ).toBeGreaterThanOrEqual(1)
      expect(
        Math.max(d.records, d.capacity),
        `a Cockpit screen shows at least ${ROWS} rows at 1280×800`,
      ).toBeGreaterThanOrEqual(ROWS)
    })
  }
})
