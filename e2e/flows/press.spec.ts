import { expect, test, type Locator, type Page } from '@playwright/test'
import { AT_THE_DESK, FILE_DOOR } from '../door'
import { CUSTOMER, DEEPEST, MODEL, pickAndStart } from '../mint'

/* ============================================================
   THE PRESS SINKS, READ OFF THE LIVE CONTROLS WITH A MOUSE HELD DOWN.

   Components critique, 2026-09-28, major 6: with the mouse held on
   Entry's "Load the Master Price File" and on the finale's "Give it to
   the customer", `:active` was true and the transform stayed
   `translateY(-1px)`. A mouse that presses is also hovering, and the
   lift outranked the press, so /kit drew a "pressed" the live button
   never reached. `tools/check.ts` (`the-press-beats-the-lift`) refuses
   the cascade that did it; this reads what a person gets, on the two
   controls the critique held: the door (a card-sized control, .985)
   and the act (.97, and its lip and drop go). Under reduced motion the
   press still answers, by its shadow alone.

   A FINE POINTER ONLY. On the touch projects a held touch sends
   pointerdown and touchstart and Chromium's emulation never sets
   `:active` (measured 2026-09-28 at 390 x 844, raw touch events and a
   synthesized long tap alike), so a phone's press cannot be read here
   and this does not pretend to.
   ============================================================ */

interface Held {
  active: boolean
  transform: string
  shadow: string
}

const read = (control: Locator): Promise<Held> =>
  control.evaluate((el) => {
    const style = getComputedStyle(el)
    return { active: el.matches(':active'), transform: style.transform, shadow: style.boxShadow }
  })

/** Hover, then hold the button down past its 100 ms press, read it, and let go somewhere
 *  else, so the press is never a click. */
async function hold(page: Page, control: Locator): Promise<{ rest: Held; held: Held }> {
  await control.scrollIntoViewIfNeeded()
  const box = await control.boundingBox()
  expect(box, 'the control is not on the screen').not.toBeNull()
  await page.mouse.move(1, 1)
  await page.waitForTimeout(250)
  const rest = await read(control)
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
  await page.waitForTimeout(250)
  await page.mouse.down()
  await page.waitForTimeout(250)
  const held = await read(control)
  await page.mouse.move(1, 1)
  await page.mouse.up()
  return { rest, held }
}

/** The transform read as a scale and a rise: `none` is 1 and 0. */
function given(transform: string): { scale: number; rise: number } {
  const m = /^matrix\(([^,]+), [^,]+, [^,]+, ([^,]+), [^,]+, ([^)]+)\)$/.exec(transform)
  return m ? { scale: Number(m[1]), rise: Number(m[3]) } : { scale: 1, rise: 0 }
}

/** Held with no preference, then held again with reduced motion on. */
async function pressBothWays(
  page: Page,
  control: Locator,
  scale: number,
): Promise<{ rest: Held; held: Held }> {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const moving = await hold(page, control)
  expect(moving.held.active, 'the held control is not :active').toBe(true)
  expect(given(moving.held.transform)).toEqual({ scale, rise: 0 })

  await page.emulateMedia({ reducedMotion: 'reduce' })
  const still = await hold(page, control)
  expect(still.held.active).toBe(true)
  expect(still.held.transform).toBe('none')
  /* the press still answers: the shadow is depth and colour, not movement */
  expect(still.held.shadow).not.toBe(still.rest.shadow)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  return moving
}

test('the door and the act give when held down, and the act sinks', async ({ page }, info) => {
  test.skip(
    info.project.use.hasTouch === true,
    'a held touch never sets :active in emulated Chromium, so there is no press to read',
  )

  await page.goto('/sign-in')
  await expect(page.getByTestId('entry')).toBeVisible()
  await page.getByRole('textbox').fill(AT_THE_DESK)
  const door = page.getByRole('button', { name: FILE_DOOR })
  /* the door refuses, with its sentence, while the file is still being read */
  await expect(door).not.toHaveAttribute('aria-disabled', 'true', { timeout: 30_000 })
  await pressBothWays(page, door, 0.985)

  await door.click()
  await expect(page).toHaveURL(/\/$/, { timeout: 30_000 })
  await pickAndStart(page, DEEPEST.table.id, MODEL)
  await page.getByRole('button', { name: /Who it is for/ }).click()
  await page.getByLabel(/Who the quote is addressed to/).fill(CUSTOMER)
  await page.getByRole('button', { name: /Address this quote|Save the name/ }).click()
  await expect(page.getByTestId('last-step')).toContainText(CUSTOMER)
  await page.getByRole('button', { name: /The finale/ }).click()

  const give = page.getByRole('button', { name: 'Give it to the customer' })
  await expect(give).not.toHaveAttribute('aria-disabled', 'true')
  const { rest, held } = await pressBothWays(page, give, 0.97)
  /* the act's lip and its drop go, and one lit edge is left: the key reads as pushed in */
  expect(rest.shadow.split(' inset').length - 1).toBe(2)
  expect(held.shadow).toMatch(/^\S+\(.*\) 0px 1px 0px 0px inset$/)

  /* held and let go elsewhere is never a press: the quote is still the draft */
  await expect(page.getByTestId('configurator')).not.toContainText('given to the customer')
})
