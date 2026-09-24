import { test } from '@playwright/test'
import { routes } from '../routes'
import { open } from '../shots/recipe'
import { expectClean, readContrast, type Reading } from './measure/read'
import { THEMES } from './measure/theme'

/* ============================================================
   contrast, walked over every route the app declares, IN BOTH THEMES.

   The measurement, its six corrections and the reasoning behind each
   of them are in `measure/contrast.ts`; the pixel half and the report
   are in `measure/read.ts`; this file is the walk. `fixture.spec.ts`
   points the same functions at pages built to fail, one planted defect
   per correction, which is what makes the green below mean something.

   THE SIXTH CORRECTION IS HALF IN `measure/read.ts`, because half of
   it cannot run inside the page. Where something picture-shaped paints
   under a run of text, the walk refuses to guess at the ground and
   hands the run out; there it is scrolled into view, shot, and measured
   off the painted pixels by `measure/pixels.ts` — the same method the
   critic used by hand to find the 4.1:1 caption this ruler had called
   14.95:1.

   AND A SEVENTH, 2026-09-24: EVERY ROUTE IS READ IN THE DAY AND THE
   NIGHT. The second close's critic measured the reason under a refused
   act at 1.23 : 1 while this ruler said "0 below threshold" at six
   sizes, and two blindnesses let it: the ruler read only resting
   screens, where no refusal is said (`refusal.spec.ts` now walks the
   states that say one), and it read only the theme that happened to
   be the default. The day became the default that morning and a rule
   inked for the night was not turned; the night had been the default
   the week before and nothing had read the day. `measure/theme.ts`
   says how a theme is worn — exactly as `src/app/theme.ts` wears it —
   and `expectClean` refuses a pair of readings whose room did not
   change, so this cannot quietly read the day twice.
   ============================================================ */

for (const route of routes) {
  test(`contrast — ${route.name}`, async ({ page }) => {
    await open(page, route)
    const readings: Reading[] = []
    for (const theme of THEMES) readings.push(await readContrast(page, route.name, theme))
    expectClean(readings)
  })
}
