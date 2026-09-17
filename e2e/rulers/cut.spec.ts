import { expect, test } from '@playwright/test'
import { routes } from '../routes'
import { open } from '../shots/recipe'
import { findCuts } from './measure/cut'

/* ============================================================
   cut, walked over every route the app declares.

   The difference between an elision (a decision, counted) and a cut (an
   accident, failed) is argued in `measure/cut.ts`. `fixture.spec.ts`
   plants one of each in both axes.
   ============================================================ */

for (const route of routes) {
  test(`cut — ${route.name}`, async ({ page }) => {
    await open(page, route)
    const r = await page.evaluate(findCuts)
    console.log(
      `  ${route.name.padEnd(12)} ${String(r.measured).padStart(4)} runs of text measured, ${r.elided} elided with an ellipsis, ${r.cuts.length} cut`,
    )
    for (const c of r.cuts.slice(0, 10))
      console.log(`      ${c.axis} by ${c.by}px  ${c.tag}.${c.cls}  "${c.text}"`)
    expect(r.measured, 'the route rendered text to measure').toBeGreaterThan(0)
    expect(r.cuts.map((c) => `${c.tag}.${c.cls} cut ${c.axis} by ${c.by}px — "${c.text}"`)).toEqual(
      [],
    )
  })
}
