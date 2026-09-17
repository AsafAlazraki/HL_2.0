import { expect, test } from '@playwright/test'
import { routes } from '../routes'
import { open } from '../shots/recipe'
import { sweep } from './measure/contrast'

/* ============================================================
   contrast, walked over every route the app declares.

   The measurement, its five corrections and the reasoning behind each
   of them are in `measure/contrast.ts`; this file is the walk and the
   report. `fixture.spec.ts` points the same function at a page built
   to fail, one planted defect per correction, which is what makes the
   green below mean something.
   ============================================================ */

for (const route of routes) {
  test(`contrast — ${route.name}`, async ({ page }) => {
    await open(page, route)
    const r = await page.evaluate(sweep)

    const aside = r.decorative
      ? `, ${r.decorative} aria-hidden set aside (${r.decorativeBelow} of them under the line)`
      : ''
    const note = r.unparsed ? `, ${r.unparsed} unparsed colours` : ''
    console.log(
      `  ${route.name.padEnd(12)} ${String(r.measured).padStart(4)} text nodes measured, ${r.fails.length} below threshold${aside}${note}`,
    )
    for (const f of r.fails.slice(0, 10)) {
      console.log(
        `      ${f.ratio}:1 (needs ${f.need})  ${f.px}px/${f.weight}  ${f.color}  ${f.tag}.${f.cls}  "${f.text}"`,
      )
    }

    /* A sweep that measures nothing reports clean and means nothing —
       the same failure a pipeline has when it swallows its own exit
       status. The route proved it arrived; this proves it had words. */
    expect(r.measured, 'the route rendered text to measure').toBeGreaterThan(0)
    expect(r.unparsed, 'every colour on the page parsed; an unknown format is never a pass').toBe(0)
    expect(
      r.fails.map((f) => `${f.ratio}:1 needs ${f.need} — ${f.tag}.${f.cls} "${f.text}"`),
    ).toEqual([])
  })
}
