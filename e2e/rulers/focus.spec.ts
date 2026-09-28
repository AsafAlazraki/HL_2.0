import { expect, test, type Page } from '@playwright/test'
import { DEEPEST } from '../mint'
import { routes } from '../routes'
import { open } from '../shots/recipe'
import { walkFocus, type FocusWalk } from './measure/focus'

/* ============================================================
   focus, walked by Tab over every route the app declares.

   What a ring is, and why focus is read as a CHANGE rather than a
   presence, is argued in `measure/focus.ts`. `fixture.spec.ts` plants
   the components critique's own cascade error — a later
   `box-shadow: none` at the ring's specificity — and the hairline that
   would hide the same error on a card, beside three rings that pass.

   IN A HAND AND AT A DESK, not at all six sizes. A ring is the cascade's,
   and the cascade does not change with the window; what changes is
   which controls are drawn — the picker's maker rail is a desk's, and a
   Tab walk at 390 × 844 never reaches it — so the walk is taken at
   390 × 844 and at 1440 × 900, the two ends the owner looks at.

   AND THE STATES A RESTING ROUTE DOES NOT OPEN. The build rests with
   its chapters closed and the picker on its seven doors, so the route
   walk never reached the controls the critique Tabbed to: the build's
   options, its refused act, the maker rail. The last two tests open
   them, as a dealer does, and walk again.
   ============================================================ */

/** Print the walk, and hold it to the line: something reached, and no control without a ring. */
function expectRings(name: string, r: FocusWalk): void {
  console.log(
    `  ${name.padEnd(22)} ${String(r.stops).padStart(4)} Tab stops, ${r.owed} owed a ring, ${r.read} read both ways, ${r.fails.length} with none${r.cycled ? '' : ' (the walk ran out of presses)'}`,
  )
  for (const f of r.fails.slice(0, 12)) console.log(`      ${f.tag}.${f.cls}  "${f.name}"`)
  expect(r.stops, `${name}: the walk reached a control`).toBeGreaterThan(0)
  expect(r.read, `${name}: a control was read focused and unfocused`).toBeGreaterThan(0)
  expect(
    r.fails.map((f) => `${name}: ${f.tag}.${f.cls} "${f.name}" shows no ring when focused`),
  ).toEqual([])
}

/** Press a chapter's head open by its name, and walk the page again. */
async function openAndWalk(page: Page, head: RegExp, name: string): Promise<FocusWalk> {
  await page.getByRole('button', { name: head }).first().click()
  const r = await walkFocus(page)
  expectRings(name, r)
  return r
}

test.describe('focus', () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1440 && viewport?.width !== 390,
    'walked in a hand (390) and at a desk (1440)',
  )

  for (const route of routes) {
    test(`every control a keyboard reaches shows its ring — ${route.name}`, async ({ page }) => {
      await open(page, route)
      expectRings(route.name, await walkFocus(page))
    })
  }

  test('the build with its chapters open, and its refused act', async ({ page }) => {
    const build = routes.find((r) => r.name === 'configurator')!
    await open(page, build)
    /* the chapters with options in them — the rows the critique Tabbed to — then the finale
       of a quote addressed to nobody, whose act is refused and must still show its ring */
    const motor = await openAndWalk(page, /^0\d Motor/, 'the build, motor')
    expect(
      motor.names.filter((n) => /on the quote/.test(n)).length,
      'the walk reached the motor chapter’s options',
    ).toBeGreaterThan(1)
    await openAndWalk(page, /^0\d Trailer/, 'the build, trailer')
    await openAndWalk(page, /^0\d Dealer fit/, 'the build, dealer fit')
    await page.getByRole('button', { name: /The finale/ }).click()
    const give = page.getByRole('button', { name: 'Give it to the customer' })
    await expect(give).toHaveAttribute('aria-disabled', 'true')
    const r = await walkFocus(page)
    expectRings('the finale, refused', r)
    expect(r.names, 'the walk reached the refused act').toContain('Give it to the customer')
  })

  test('the picker with a maker chosen, and its rail', async ({ page }) => {
    const picker = routes.find((r) => r.name === 'picker')!
    await open(page, picker)
    await page.goto(`/quote/new?brand=${DEEPEST.table.id}`)
    await expect(page.getByTestId('picker-counts')).toBeVisible()
    const r = await walkFocus(page)
    expectRings('the picker, one maker', r)
    if (page.viewportSize()!.width >= 1440)
      expect(
        r.names.filter((n) => /, \d+ models?$/.test(n)).length,
        'the walk reached the maker rail',
      ).toBeGreaterThan(1)
  })
})
