import { expect, test } from '@playwright/test'
import { routes } from '../routes'
import { open } from '../shots/recipe'
import { findOverlaps } from './measure/overlap'

/* ============================================================
   overlap, walked over every route the app declares.

   What counts as an overlap, and the four things that deliberately do
   not, are in `measure/overlap.ts`. `fixture.spec.ts` plants one real
   overlap and one of each exemption on a page and checks this finds
   exactly the first.
   ============================================================ */

test.describe('overlap', () => {
  /* Measured once, at the width the plan names for this ruler, by skipping
     everywhere else rather than by forcing a viewport: a forced viewport
     would run the same measurement twice and report it twice. */
  test.skip(({ viewport }) => viewport?.width !== 1440, 'measured at 1440×900')

  for (const route of routes) {
    test(`nothing overlaps — ${route.name}`, async ({ page }) => {
      await open(page, route)
      const r = await page.evaluate(findOverlaps)
      console.log(
        `  ${route.name.padEnd(12)} ${String(r.leaves).padStart(4)} runs of text compared, ${r.layered} in positioned layers set aside, ${r.pairs.length} overlapping`,
      )
      for (const p of r.pairs.slice(0, 10)) console.log(`      ${p.area}px²  ${p.a}  ×  ${p.b}`)
      expect(r.leaves, 'the route rendered text to compare').toBeGreaterThan(0)
      expect(r.pairs.map((p) => `${p.a} × ${p.b}`)).toEqual([])
    })
  }
})
