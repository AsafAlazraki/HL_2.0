import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'

/* ============================================================
   REVIEW, EVERY STATE AT EVERY SIZE — the screenshots the data round
   reads by eye (docs/directions/data-round/review/after/), taken only
   when `HL2_REVIEW_SHOTS` is set, so the gate never writes into docs.
   Each state is reached by a person's press through the real door on
   the real price list; nothing is planted.
   ============================================================ */

const OUT = process.env.HL2_REVIEW_SHOTS_OUT ?? 'docs/directions/data-round/review/after'
const READY = '[data-testid="review"][data-read] .rv-stage__title'

test.skip(!process.env.HL2_REVIEW_SHOTS, 'screenshots are taken on request')

async function to(page: Page, query: string): Promise<void> {
  await page.goto(`/review${query}`)
  await expect(page.locator(READY)).toBeVisible({ timeout: 30_000 })
}

const at = (key: string): string => `?case=${encodeURIComponent(key)}`

test('every state of Review, photographed', async ({ page }) => {
  test.setTimeout(420_000)
  const size = `${page.viewportSize()!.width}x${page.viewportSize()!.height}`
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  const shot = async (name: string, fullPage = false) => {
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${OUT}/${name}-${size}.png`, fullPage })
  }
  /** what the window holds, for the record: sideways scroll and the press's place */
  const measure = async (label: string, press?: string) => {
    const m = await page.evaluate((name) => {
      const btn = name
        ? [...document.querySelectorAll('button')].find((b) => b.textContent?.startsWith(name))
        : null
      const box = btn?.getBoundingClientRect()
      return {
        sideways: document.documentElement.scrollWidth > window.innerWidth,
        scrollY: Math.round(window.scrollY),
        press: box
          ? `${Math.round(box.top)}-${Math.round(box.bottom)} of ${window.innerHeight}`
          : '',
      }
    }, press ?? '')
    console.log(`[${size}] ${label}: ${JSON.stringify(m)}`)
  }

  await throughTheDoor(page)
  await to(page, '')
  await shot('01-arrive')
  await shot('01-arrive-full', true)
  await measure('arrive', 'Price them at Cash')

  /* the index: its own column at a desk, one press below one */
  const door = page.getByRole('button', { name: 'Every case, by check or list' })
  if (await door.isVisible()) {
    await door.click()
    await expect(page.getByRole('navigation', { name: 'Every case' })).toBeVisible()
  }
  await shot('02-index')
  await page
    .getByRole('textbox', { name: 'Find a case by its list, maker or line' })
    .fill('lone star')
  await page.waitForTimeout(300)
  await shot('02b-index-found')
  await to(page, '?by=list&list=open')
  await page.getByRole('navigation', { name: 'Every case' }).scrollIntoViewIfNeeded()
  await shot('02c-index-by-list')

  /* a trailer: the one press in the first window, pressed, and undone */
  await to(page, at('band:trl_dunbier:trl_dunbier:67:Small Trailers - Up to 1.02t:1450'))
  await shot('03-trailer')
  await measure('trailer', 'Make it Large')
  await page.locator('.rv-kept').scrollIntoViewIfNeeded()
  await page.getByRole('button', { name: /^Make it Large/ }).click()
  await expect(page.locator(READY)).toHaveText('Rego the ALP 5.7M-13TB as a Large trailer.')
  await page.waitForTimeout(700)
  await shot('04-pressed')
  await measure('pressed')
  await page.getByRole('button', { name: 'Undo' }).click()
  await page.waitForTimeout(300)
  await shot('04b-undone')

  /* the boats, refused, then a part priced whole */
  await to(page, '')
  await page.getByRole('button', { name: /^Price them at Cash/ }).click()
  await shot('05-boats-refused')
  await to(page, at('none:parts:ANCHOR WINCHES - Lone Star:blank'))
  await shot('06-lone')
  await shot('06-lone-full', true)
  await page.getByLabel('Sell for Lone Star · GX-1 HS4mm Combo Winch Kit').fill('abc')
  await page.getByRole('button', { name: /^Price the one typed at Sell/ }).click()
  await shot('06b-lone-notaprice')

  /* $0 that says what it comes with */
  await to(page, at('none:parts:TRAILER PARTS - Trailer Plugs:zero'))
  await shot('07-comes-with')

  /* two prices, named apart */
  await to(
    page,
    at('two:parts:outboard vented cover - yamaha 4 cyl 2.8l f150d f175a f200f (2023>):129/133'),
  )
  await shot('08-two')
  await shot('08-two-full', true)

  await to(page, at('cost:parts:parts.l'))
  await shot('09-cost')
  await to(page, at('note:parts'))
  await shot('10-notes')
  await shot('10-notes-full', true)
  await to(page, at('house:F6'))
  await shot('11-house')
  await to(page, at('field-dup-name:rig_kits:rig_kits.m,rig_kits.ae'))
  await shot('12-twins')
  await to(page, at('nameless:rig_kits'))
  await shot('13-nameless')
  await to(page, '?case=tidy')
  await shot('14-tidy')
  await to(page, at('band:nothing:here'))
  await shot('15-stale')

  /* left alone, listed, then every case left: the clean day says only what is true */
  await to(page, at('none:parts:TRAILER PARTS - Trailer Plugs:zero'))
  await page.getByRole('button', { name: 'Leave them at $0' }).click()
  await page.getByRole('button', { name: 'See what was left' }).click()
  await page.getByRole('list', { name: 'Left alone' }).scrollIntoViewIfNeeded()
  await shot('16-left-list')
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
  for (let n = 38; n > 0; n -= 1) {
    await expect(
      page.getByRole('heading', { level: 1, name: new RegExp(`^Review ${n} to settle`) }),
    ).toBeVisible()
    await page.locator('body').press('l')
  }
  await expect(page.locator(READY)).toHaveText('Nothing in your price list is waiting on you.')
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot('17-clean')
  await shot('17-clean-full', true)
  expect(errors).toEqual([])
})
