import { expect, test } from '@playwright/test'
import { routes } from '../routes'
import { open } from '../shots/recipe'
import { readRamp, type Step } from './measure/ramp'

/* ============================================================
   ramp, read once on every route the app declares.

   What it reports and why none of it is a threshold is argued in
   `measure/ramp.ts`. The only assertions here are that the instrument
   still reads; `fixture.spec.ts` checks the figures themselves against
   a page whose tokens are known.
   ============================================================ */

test.describe('ramp', () => {
  // The scale does not change with the viewport, so it is read once, in the wider project.
  test.skip(({ viewport }) => viewport?.width !== 1440, 'the scale is read once, not per viewport')

  for (const route of routes) {
    test(`ramp — ${route.name}`, async ({ page }) => {
      await open(page, route)
      const r = await page.evaluate(readRamp)

      console.log(`\n  the scale, measured on ${route.name} (ground ${r.ground})`)
      const families = new Map<string, Step[]>()
      for (const step of r.colours) {
        const family = step.name.replace(/-\d+$/, '')
        const list = families.get(family) ?? []
        list.push(step)
        families.set(family, list)
      }
      for (const [family, steps] of families) {
        console.log(`    ${family}`)
        steps.forEach((step, i) => {
          const previous = steps[i - 1]
          const clears =
            step.onGround >= 4.5
              ? 'body text'
              : step.onGround >= 3
                ? 'large text only'
                : 'marks only'
          const gap = previous ? `  step ${(step.onGround / previous.onGround).toFixed(2)}×` : ''
          const gamut = step.outsideGamut ? '  OUTSIDE sRGB, shown clamped' : ''
          console.log(
            `      ${step.name.padEnd(22)} ${String(step.onGround).padStart(6)}:1  ${clears.padEnd(16)}${gap}  ${step.value}${gamut}`,
          )
        })
      }

      console.log(`\n  the type scale: ${r.typeSteps.map((s) => `${s.px}px`).join(' · ')}`)
      console.log(
        `  in use on this route: ${r.typeInUse.map((s) => `${s.px}px/${s.weight} ×${s.nodes}`).join(' · ')}`,
      )
      const unused = r.typeSteps.filter((s) => !r.typeInUse.some((u) => u.px === s.px))
      console.log(
        `  ${r.typeInUse.length} of ${r.typeSteps.length} steps in use; unused: ${unused.map((s) => s.name).join(', ') || 'none'}\n`,
      )

      /* The only assertion: the instrument still reads. Every number
         above is a report for the owner and for the first picked
         direction, not a threshold anyone has agreed to yet. */
      expect(r.colours.length, 'the scale was read off the cascade').toBeGreaterThan(0)
      expect(r.typeSteps.length, 'the type scale was read off the cascade').toBeGreaterThan(0)
      expect(r.typeInUse.length, 'the route set some type').toBeGreaterThan(0)
    })
  }
})
