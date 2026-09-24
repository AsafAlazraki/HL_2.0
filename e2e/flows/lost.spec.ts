import { expect, test, type Page } from '@playwright/test'
import { DOORS, START_A_QUOTE } from '../../src/app/ways'
import { throughTheDoor } from '../door'

/* ============================================================
   THE DEAD END, IN A REAL BROWSER, AT EVERY SIZE THE RULERS RUN.

   Until 2026-09-23 this screen had no flow of its own: the rulers opened
   it at `/nope` and the shell's walk stood on it, and nothing asked the
   two questions the critique of Milestone 2 asked of it — does it fit
   the window it claims to (#10: 867 in an 844 hand, 838 in an 800
   laptop), and does it repeat what the pill above it already carries
   (#13, rule (a)) or print the router's own words (#14, rule (c)).

   It is reached THROUGH THE DOOR, the way `e2e/routes.ts` reaches it for
   the rulers, because a person who mistypes an address is already
   working: the state has the dealership's name on it.
   ============================================================ */

/* Every window this screen is ONE SCREEN in. A phone on its side
   (844 x 390) scrolls on purpose, and lost.css says so. */
const FITS = new Set(['390x844', '834x1112', '1280x800', '1440x900', '1920x1080'])
const windowOf = (page: Page): string => {
  const size = page.viewportSize()
  return size ? `${size.width}x${size.height}` : ''
}

const ASKED = '/nope'

test('the dead end names the address, fits its window, and offers one way out', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))

  await throughTheDoor(page)
  await page.goto(ASKED)
  const lost = page.getByTestId('lost')
  await expect(lost).toBeVisible()

  /* ---- the address is the subject ------------------------- */
  await expect(
    lost.getByRole('heading', { level: 1, name: 'There is nothing at this address.' }),
  ).toBeVisible()
  await expect(page.getByTestId('lost-address')).toHaveText(ASKED)
  await expect(lost.getByText(/may have been mistyped/)).toBeVisible()

  /* ---- one act, and only what the pill does not carry ----- */
  const act = lost.getByRole('link', { name: /^Home/ })
  await expect(act).toBeVisible()
  await expect(act).toHaveAttribute('href', '/')
  const doors = lost.getByRole('navigation', { name: 'Also in this app' })
  for (const door of DOORS) {
    await expect(doors.locator(`a[href="${door.href}"]`), door.href).toHaveCount(0)
  }
  await expect(doors.getByRole('link', { name: new RegExp(START_A_QUOTE.title) })).toHaveAttribute(
    'href',
    START_A_QUOTE.href,
  )

  /* ---- no address printed but the one asked for: rule (c) - */
  const printed = await lost.evaluate((root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    const out: string[] = []
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = (node.textContent ?? '').trim()
      const parent = node.parentElement
      if (text === '' || !parent || parent.getClientRects().length === 0) continue
      out.push(text)
    }
    return out
  })
  expect(printed.filter((text) => text.startsWith('/'))).toEqual([ASKED])
  expect(printed.join(' ')).not.toMatch(/Milestone \d|\$id/)

  /* ---- one screen, where it claims to be one: rule (d) ---- */
  if (FITS.has(windowOf(page))) {
    const fit = await page.evaluate(() => ({
      scrollHeight: document.scrollingElement?.scrollHeight ?? Number.POSITIVE_INFINITY,
      innerHeight: window.innerHeight,
    }))
    expect(
      fit.scrollHeight,
      `the dead end is ${fit.scrollHeight} in a ${fit.innerHeight} window at ${windowOf(page)}`,
    ).toBeLessThanOrEqual(fit.innerHeight)
  }

  /* ---- and each way goes where it says -------------------- */
  await doors.getByRole('link', { name: new RegExp(START_A_QUOTE.title) }).click()
  await expect(page).toHaveURL(/\/quote\/new$/)
  await page.goBack()
  await expect(page.getByTestId('lost')).toBeVisible()
  await page.getByTestId('lost').getByRole('link', { name: /^Home/ }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByTestId('home')).toBeVisible()

  expect(errors, 'no page error').toEqual([])
})
