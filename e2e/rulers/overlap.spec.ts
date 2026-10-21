import { expect, test } from '@playwright/test'
import { routes } from '../routes'
import { open } from '../shots/recipe'
import { overlapsInEveryState } from './measure/overlap'

/* ============================================================
   overlap, walked over every route the app declares, at every one of
   the six windows, at rest and scrolled.

   What counts as an overlap — six kinds, chrome included — and the two
   things that are set aside are in `measure/overlap.ts`.
   `fixture.spec.ts` plants each failure beside its near miss and checks
   this finds exactly the failures.

   SIX WINDOWS, since 2026-10-20. Until then this ruler skipped every
   width but 1440, on the argument that a forced viewport would report
   one measurement twice. That was true of a forced viewport and false
   of the project's own six: a sticky band that clears its masthead at
   1440 is a different layout from the one that wraps at 834, and the
   overlap the owner reported is on "some screens", not at one size.
   ============================================================ */

test.describe('overlap', () => {
  for (const route of routes) {
    test(`nothing overlaps — ${route.name}`, async ({ page }) => {
      /* the walk sets its own budget for reaching the screen; the states below add five
         readings and four scrolls on top of it */
      test.setTimeout(180_000)
      await open(page, route)
      test.setTimeout(180_000)
      const readings = await overlapsInEveryState(page)
      const failures: string[] = []
      for (const { state, r } of readings) {
        console.log(
          `  ${route.name.padEnd(14)} ${state.padEnd(28)} ${r.leaves} runs of text, ${r.controls} controls, ${r.pictures} pictures, ${r.chrome} pieces of chrome, ${r.aside} set aside — ${r.pairs.length} overlapping`,
        )
        for (const p of r.pairs) {
          const line = `[${state}] ${p.kind} ${p.w}×${p.h}px: ${p.a} × ${p.b}${p.note ? ` (${p.note})` : ''}`
          console.log(`      ${line}`)
          failures.push(line)
        }
      }
      expect(readings[0]!.r.leaves, 'the route rendered text to compare').toBeGreaterThan(0)
      expect(failures).toEqual([])
    })
  }
})
