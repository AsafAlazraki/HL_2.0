import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { written } from '../mint'
import { bringInTheNewerFile } from '../trailerFile'

/* ============================================================
   REVIEW, EVERY STATE AT EVERY SIZE — the screenshots the data round
   reads by eye, taken only when `HL2_REVIEW_SHOTS` is set, so the gate
   never writes into docs. Round 1 of the verifier closed
   (docs/directions/data-round/review/verify-1.md): each state its gaps
   named is reached by a person's press through the real door on the
   real price list, and photographed; nothing is planted.
   ============================================================ */

const OUT = process.env.HL2_REVIEW_SHOTS_OUT ?? 'docs/directions/data-round/review/fixed-1'
const READY = '[data-testid="review"][data-read] .rv-stage__title'

test.skip(!process.env.HL2_REVIEW_SHOTS, 'screenshots are taken on request')

async function to(page: Page, query: string): Promise<void> {
  await page.goto(`/review${query}`)
  await expect(page.locator(READY)).toBeVisible({ timeout: 30_000 })
}

const at = (key: string): string => `?case=${encodeURIComponent(key)}`
const TRAILER = 'band:trl_dunbier:trl_dunbier:67:Small Trailers - Up to 1.02t:1450'
const LONE_STAR = 'none:parts:ANCHOR WINCHES - Lone Star:blank'
const NOTES = 'none:parts:SPECIAL NOTES:zero'
const PLUGS = 'none:parts:TRAILER PARTS - Trailer Plugs:zero'
const TWINS_LAST = 'field-dup-name:rig_kits:rig_kits.l,rig_kits.ad'
const TWIN = 'two:parts:outboard vented cover - yamaha 4 cyl 2.8l f150d f175a f200f (2023>):129/133'
const ANCHOR_KITS = 'none:parts:ANCHOR KITS:blank'

test('every state of Review, photographed', async ({ page }) => {
  test.setTimeout(600_000)
  const size = `${page.viewportSize()!.width}x${page.viewportSize()!.height}`
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  const shot = async (name: string, fullPage = false) => {
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${OUT}/${name}-${size}.png`, fullPage })
  }
  /** what the window holds, for the record: sideways scroll, a toast, and a press's place */
  const measure = async (label: string, press?: string) => {
    const m = await page.evaluate((name) => {
      const btn = name
        ? [...document.querySelectorAll('button')].find((b) => b.textContent?.startsWith(name))
        : null
      const box = btn?.getBoundingClientRect()
      return {
        sideways: document.documentElement.scrollWidth > window.innerWidth,
        toasts: document.querySelectorAll('[data-sonner-toast]').length,
        scrollY: Math.round(window.scrollY),
        press: box
          ? `${Math.round(box.top)}-${Math.round(box.bottom)} of ${window.innerHeight}`
          : '',
      }
    }, press ?? '')
    console.log(`[${size}] ${label}: ${JSON.stringify(m)}`)
  }

  await throughTheDoor(page)

  /* the boat case: its press under the lede, in the first window (gap 9) */
  await to(page, '')
  await shot('01-arrive')
  await shot('01-arrive-full', true)
  await measure('arrive, the boat case', 'Price them at Cash')

  /* the index below a desk, and the desk's column */
  const door = page.getByRole('button', { name: 'Every case, by check or list' })
  if (await door.isVisible()) {
    await door.click()
    await expect(page.getByRole('navigation', { name: 'Every case' })).toBeVisible()
  }
  await shot('02-index')

  /* a trailer pressed: the step said over the stage, no toast over the page (gap 6) */
  await to(page, at(TRAILER))
  await page.locator('.rv-kept').scrollIntoViewIfNeeded()
  await page.getByRole('button', { name: /^Make it Large/ }).click()
  await expect(page.locator(READY)).toHaveText(
    'Rego the ALP 5.7M-13TB Fibreglass Boat as a Large trailer.',
  )
  await page.waitForTimeout(800)
  await shot('03-trailer-pressed')
  await measure('trailer pressed', 'Make it Large')

  /* what was settled since the Master Price File (J11): the rail, and the foot's list */
  await expect(page.locator('.rv-money')).toContainText('settled since the Master Price File', {
    timeout: 20_000,
  })
  await page.getByRole('button', { name: 'See what was settled' }).click()
  await page
    .getByRole('list', { name: 'Settled since the Master Price File' })
    .scrollIntoViewIfNeeded()
  await shot('14-settled-since')
  await page.locator('.rv-done').getByRole('button', { name: 'Undo' }).click()
  await expect(page.locator(READY)).toHaveText(
    'Rego the ALP 5.3M-13B Fibreglass Boat as a Large trailer.',
  )
  await page.waitForTimeout(600)
  await shot('03b-trailer-undone')

  /* a refused figure: its reason under its own field, in view with it (gap 3) */
  await to(page, at(LONE_STAR))
  const gx1 = page.getByLabel('Sell for Lone Star · GX-1 HS4mm Combo Winch Kit')
  await gx1.fill('abc')
  await gx1.press('Enter')
  await expect(page.getByText(/^“abc” is not a price\./)).toBeInViewport()
  await shot('04b-lone-abc')

  /* the cases that say what they come with: one sentence each, no duplicate act (gaps 4, 5),
     and no price field on a line that says what it comes with (round 2, minor 3) */
  await to(page, at(NOTES))
  await shot('c17-notes')
  await shot('c17-notes-full', true)
  await to(page, at(PLUGS))
  await shot('c18-plugs-full', true)

  /* the press under the lede on every case (round 2, minor 7): c19 on a phone */
  await to(page, at(ANCHOR_KITS))
  await shot('c19-anchor-kits')
  await measure('anchor kits', 'Price them at Sell')

  /* one name at two prices: See both finds both (round 2, the major gap), and naming them apart
     says which code took which name (minor 8) */
  await to(page, at(TWIN))
  await shot('05a-twin')
  await page.getByRole('link', { name: 'See both in the price list' }).click()
  await expect(page.getByText(/ 2 match “Outboard Vented Cover/)).toBeAttached({ timeout: 30_000 })
  await page.waitForTimeout(800)
  await shot('06-twin-see-both')
  await to(page, at(TWIN))
  const grey = page.getByRole('textbox', { name: /for code Y10A-V$/ })
  await grey.fill(`${await grey.inputValue()} Grey`)
  await page.getByRole('button', { name: 'Name them apart' }).click()
  await expect(page.locator('.rv-done__said')).toContainText('keeps its name')
  await shot('05b-twin-named')
  await page.locator('.rv-done').getByRole('button', { name: 'Undo' }).click()
  await expect(page.locator('.rv-done__said')).toContainText('Undone')
  /* the undo is on this computer before the page is left */
  await written(page)

  /* two headings of one name: See both lands on the two (round 2, minor 4) */
  await to(page, at(TWINS_LAST))
  await page.getByRole('link', { name: 'See both in the price list' }).click()
  await expect(page.locator('.sh-th[data-lit]')).toHaveCount(2, { timeout: 30_000 })
  await page.waitForTimeout(800)
  await shot('06c-see-both-headings')

  /* the price list's other rules, with their measures (gap 10) */
  await to(page, at('house:F6'))
  await shot('c34-rules')
  await shot('c34-rules-full', true)

  /* the desk index follows the stage (gap 8) */
  await to(page, at(TWINS_LAST))
  await shot('c37-twins')

  /* a case left alone, and the left list open: nothing over Bring it back (gap 6) */
  await to(page, at(PLUGS))
  await page.getByRole('button', { name: 'Leave them at $0' }).click()
  await page.getByRole('button', { name: 'See what was left' }).click()
  await page.getByRole('button', { name: 'Bring it back' }).scrollIntoViewIfNeeded()
  await shot('12-left-list')
  await measure('left list')
  await page.getByRole('button', { name: 'Bring it back' }).click()
  await expect(page.locator(READY)).toHaveText(
    'Leave the 4 lines in Trailer Parts - Trailer Plugs at $0, as each says what they come with.',
  )

  /* the clean day: every case left alone by L, counted as it is said (gaps 1, 2, 7, 9) */
  await written(page)
  await to(page, '')
  for (let n = 39; n > 0; n -= 1) {
    await expect(
      page.getByRole('heading', { level: 1, name: new RegExp(`^Review ${n} to settle`) }),
    ).toBeVisible()
    await page.locator('body').press('l')
  }
  await expect(page.locator(READY)).toHaveText('Nothing in your price list is waiting on you.')
  await page.waitForTimeout(600)
  await shot('13-clean')
  await shot('13-clean-full', true)
  await measure('clean day')

  expect(errors).toEqual([])
})

test('what Review finds on a quote’s own lines, in the build’s finale, photographed', async ({
  page,
}) => {
  test.setTimeout(180_000)
  const size = `${page.viewportSize()!.width}x${page.viewportSize()!.height}`
  await throughTheDoor(page)
  await page.goto('/quote/new?brand=trl_dunbier')
  await page.getByRole('searchbox', { name: 'Find a model' }).fill('ALP 5.3M-13B')
  await page
    .getByRole('region', { name: 'Models' })
    .getByRole('button', { name: /ALP 5\.3M-13B \(1,450kgs\) Fibreglass Boat/ })
    .click()
  const act = page
    .getByRole('complementary', { name: 'What is chosen' })
    .getByRole('button', { name: 'Start the quote' })
  await act.scrollIntoViewIfNeeded()
  await act.click()
  await expect(page.getByTestId('configurator')).toBeVisible({ timeout: 30_000 })
  await page.goto(`${new URL(page.url()).pathname}?at=finale`)
  const said = page.locator('.cfg-flag__say').filter({ hasText: 'Review has it.' })
  await expect(said).toBeVisible({ timeout: 30_000 })
  await said.scrollIntoViewIfNeeded()
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${OUT}/20-build-warns-${size}.png` })
})

test('Review’s word where the wrong trailer is picked, photographed', async ({ page }) => {
  test.setTimeout(120_000)
  const size = `${page.viewportSize()!.width}x${page.viewportSize()!.height}`
  await throughTheDoor(page)
  await page.goto('/quote/new?brand=trl_dunbier')
  await page.getByRole('searchbox', { name: 'Find a model' }).fill('ALP 5.3M-13B')
  await page
    .getByRole('region', { name: 'Models' })
    .getByRole('button', { name: /ALP 5\.3M-13B \(1,450kgs\) Fibreglass Boat/ })
    .click()
  const said = page.locator('.picker-review')
  await expect(said).toBeVisible()
  await said.scrollIntoViewIfNeeded()
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${OUT}/21c-picker-warns-${size}.png` })
})

test('a newer price file brought in on Shelf, and what Review says of it, photographed', async ({
  page,
}) => {
  test.setTimeout(180_000)
  const size = `${page.viewportSize()!.width}x${page.viewportSize()!.height}`
  await throughTheDoor(page)
  await bringInTheNewerFile(page)
  await to(page, '')
  await expect(page.locator('.rv-money')).toContainText('settled since the Master Price File', {
    timeout: 20_000,
  })
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/14b-newer-file-${size}.png` })
  await page.getByRole('button', { name: 'See what was settled' }).click()
  await page
    .getByRole('list', { name: 'Settled since the Master Price File' })
    .scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/14c-newer-file-settled-${size}.png` })
})
