import { expect, test, type Locator, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { written } from '../mint'

/* ============================================================
   A MAKER'S OWN PAGE, EVERY STATE AT EVERY SIZE — the screenshots the
   data round reads by eye, taken only when `HL2_PLACES_SHOTS` is set,
   so the gate never writes into docs. `HL2_PLACES_SHOTS` names the
   folder under docs/directions/data-round/places/ (`after` when it is
   just "1"). Every press is a person's press at the place the word is
   drawn, through the real door on the real price list; the one quote
   is begun from a model's own "Quote it". Each state is measured as it
   is shot: sideways scroll, text under 12px, a visible control under
   24px, text cut by its own box, and page errors.
   ============================================================ */

const FOLDER = process.env.HL2_PLACES_SHOTS ?? ''
const OUT = `docs/directions/data-round/places/${FOLDER === '1' || FOLDER === '' ? 'after' : FOLDER}`
const READY = '[data-testid="place"][data-read][data-place]'

test.skip(!process.env.HL2_PLACES_SHOTS, 'screenshots are taken on request')

async function press(page: Page, target: Locator) {
  await target.scrollIntoViewIfNeeded()
  const box = (await target.boundingBox())!
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

async function to(page: Page, path: string) {
  await page.goto(path)
  await expect(page.locator(READY)).toBeVisible({ timeout: 30_000 })
}

test('every state of a maker’s own page, photographed and measured', async ({ page }) => {
  test.setTimeout(900_000)
  await throughTheDoor(page)
  const size = `${page.viewportSize()!.width}x${page.viewportSize()!.height}`
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  const faults: string[] = []

  const measure = async (label: string) => {
    const m = await page.evaluate(() => {
      const main = document.querySelector('main')
      const seen = (el: Element) => {
        if (!main?.contains(el)) return false
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) return false
        const cs = getComputedStyle(el)
        return cs.visibility !== 'hidden' && cs.display !== 'none' && cs.clipPath !== 'inset(50%)'
      }
      const leaves = [...(main?.querySelectorAll('*') ?? [])].filter(
        (el) =>
          el instanceof HTMLElement &&
          [...el.childNodes].some((c) => c.nodeType === 3 && (c.textContent ?? '').trim() !== '') &&
          !el.closest('.pl-unseen, .pl-word[data-size="chip"]') &&
          seen(el),
      ) as HTMLElement[]
      const small = leaves
        .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 12)
        .map((el) => (el.textContent ?? '').trim().slice(0, 30))
      const cut = leaves
        .filter((el) => {
          const cs = getComputedStyle(el)
          const clips = cs.overflow !== 'visible' || cs.textOverflow === 'ellipsis'
          return (
            clips && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 2)
          )
        })
        .map((el) => (el.textContent ?? '').trim().slice(0, 30))
      const tiny = [
        ...(main?.querySelectorAll('a, button, input:not([type=radio]), select, [role="radio"]') ??
          []),
      ]
        .filter((el) => seen(el) && !el.closest('.pl-unseen'))
        .filter((el) => {
          const r = el.getBoundingClientRect()
          return r.width < 24 || r.height < 24
        })
        .map((el) => (el.textContent ?? el.getAttribute('aria-label') ?? '').trim().slice(0, 30))
      return {
        sideways: document.documentElement.scrollWidth - window.innerWidth,
        small,
        cut,
        tiny,
        height: document.documentElement.scrollHeight,
      }
    })
    const bad = [
      m.sideways > 0 ? `${m.sideways}px sideways` : '',
      m.small.length ? `small: ${m.small.join(' | ')}` : '',
      m.cut.length ? `cut: ${m.cut.join(' | ')}` : '',
      m.tiny.length ? `tiny: ${m.tiny.join(' | ')}` : '',
    ].filter(Boolean)
    console.log(`[${size}] ${label}: page ${m.height}px ${bad.length ? bad.join(' ; ') : 'clean'}`)
    if (bad.length) faults.push(`${label}: ${bad.join(' ; ')}`)
  }
  const shot = async (name: string, fullPage = false) => {
    /* a whole page is taken from its top, so the docked head stands where it is drawn */
    if (fullPage) await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(500)
    await measure(name)
    await page.screenshot({ path: `${OUT}/${name}-${size}.png`, fullPage })
  }

  /* ---- Highfield: the first screen, every model, the whole page ---- */
  await to(page, '/places/boat_highfield')
  await shot('01-highfield')
  await shot('02-highfield-full', true)

  /* the Sport series, pressed where it is drawn (a tile, or the one chooser in a hand) */
  const tile = page.locator('.pl-series').getByRole('button', { name: /^Sport/ })
  if (await tile.isVisible()) await press(page, tile)
  else await to(page, '/places/boat_highfield?series=Sport')
  await expect(page).toHaveURL(/series=Sport/)
  await shot('03-highfield-sport')

  /* scrolled into the cards: the dock under the bar */
  await page.locator('.pl-card').nth(4).scrollIntoViewIfNeeded()
  await shot('04-highfield-sport-scrolled')

  /* three set side by side, each by its own Compare, then the compare opened */
  for (const said of ['Sport 560', 'Sport 600', 'Sport 660']) {
    const c = page.locator('.pl-card', {
      has: page.getByRole('heading', { name: said, exact: true }),
    })
    await press(page, c.getByRole('button', { name: new RegExp(`^Compare the ${said}$`) }))
  }
  await press(page, page.getByRole('button', { name: 'Compare 3' }))
  await expect(page).toHaveURL(/see=compare/)
  /* as a person scrolls to it: its top under the docked head, which its scroll margin keeps clear */
  await page.locator('.pl-compare').evaluate((el) => el.scrollIntoView({ block: 'start' }))
  await shot('05-compare')
  await shot('05-compare-full', true)
  /* a fourth refused, said where it is refused */
  const fourth = page.locator('.pl-card', {
    has: page.getByRole('heading', { name: 'Sport 700 ST', exact: true }),
  })
  await press(page, fourth.getByRole('button', { name: /^Compare the Sport 700 ST$/ }))
  await expect(page.getByText(/Three boats are set side by side at most/)).toBeVisible()
  await page.locator('.pl-tray').scrollIntoViewIfNeeded()
  await shot('06-compare-refused')

  /* ordered by length: the quiet bar on each card */
  await to(page, '/places/boat_highfield?series=Sport&sort=length')
  await page.locator('.pl-card').first().scrollIntoViewIfNeeded()
  await shot('07-highfield-by-length')

  /* the find, holding nothing */
  await to(page, '/places/boat_highfield?find=zzz')
  await page.locator('.pl-dock').scrollIntoViewIfNeeded()
  await shot('08-find-nothing')

  /* every photograph of the maker, from the head */
  await to(page, '/places/boat_highfield')
  await press(page, page.getByRole('button', { name: 'See the 18 photographs' }))
  await expect(page.locator('.ui-lightbox-count')).toHaveText(/^1 of 18/)
  await shot('09-gallery')
  await page.keyboard.press('Escape')

  /* the prices, quotes, partners and changes after the range */
  await page.locator('.pl-after').scrollIntoViewIfNeeded()
  await shot('10-after')

  /* ---- the other makers ---- */
  await to(page, '/places/boat_jeanneau')
  await shot('11-jeanneau')
  await shot('11-jeanneau-full', true)
  await to(page, '/places/boat_stacer')
  await shot('12-stacer')
  await to(page, '/places/boat_formosa')
  await shot('13-formosa')

  /* ---- lists that are not boat makers ---- */
  await to(page, '/places/mot_yamaha')
  await shot('14-yamaha')
  await to(page, '/places/mot_yamaha?in=150')
  await shot('15-yamaha-150')
  await to(page, '/places/trl_redco')
  await shot('16-redco')
  await to(page, '/places/trl_obsolete')
  await shot('17-obsolete')
  await to(page, '/places/labour_rates')
  await shot('18-labour')
  await to(page, '/places/parts')
  await shot('19-parts')
  await to(page, '/places/dealer_fit')
  await shot('20-dealer-fit')
  await to(page, '/places/registration')
  await shot('21-registration')
  await to(page, '/places/dealer_fit?find=garmin')
  await shot('22-dealer-fit-find')

  /* ---- Settings ---- */
  await to(page, '/places/boat_highfield?tab=settings')
  await shot('23-highfield-settings-full', true)
  await to(page, '/places/trl_redco?tab=settings')
  await shot('24-redco-settings')

  /* ---- an address that is no place ---- */
  await page.goto('/places/nothing_here')
  await expect(page.getByRole('heading', { name: /No place is called/ })).toBeVisible({
    timeout: 30_000,
  })
  await shot('25-unknown')

  /* ---- one quote, begun from the Sport 660's own "Quote it" ---- */
  await to(page, '/places/boat_highfield?series=Sport')
  const sport = page.locator('.pl-card', {
    has: page.getByRole('heading', { name: 'Sport 660', exact: true }),
  })
  await press(page, sport.getByRole('link', { name: 'Quote the Highfield Sport 660' }))
  await expect(page).toHaveURL(/\/quote\/new\?brand=boat_highfield&model=/)
  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  await expect(panel).toBeVisible({ timeout: 15_000 })
  const materials = panel.locator('.picker-chip__name')
  if ((await materials.count()) > 0) await materials.first().click()
  await panel
    .getByRole('button', { name: /Start the quote|Open the draft already standing/ })
    .click()
  await expect(page).toHaveURL(/\/quote\/[^/?]+$/, { timeout: 15_000 })
  await written(page)
  await to(page, '/places/boat_highfield')
  await page.locator('.pl-after').scrollIntoViewIfNeeded()
  await expect(page.locator('.pl-quote')).toHaveCount(1)
  await shot('26-quotes-one')

  console.log(`[${size}] page errors: ${errors.length ? errors.join(' | ') : 'none'}`)
  console.log(`[${size}] faults: ${faults.length ? faults.join('\n  ') : 'none'}`)
  expect(errors).toEqual([])
})
