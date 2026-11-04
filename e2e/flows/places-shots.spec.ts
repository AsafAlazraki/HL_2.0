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
  /* among the cards with three chosen: the tray in the docked head at a desk, at the range's
     foot in a hand and a short window, in sight either way */
  await page.locator('.pl-card').nth(9).scrollIntoViewIfNeeded()
  const trayInSight = await page
    .locator('.pl-tray')
    .filter({ visible: true })
    .first()
    .evaluate((el) => {
      const r = el.getBoundingClientRect()
      return r.top >= 0 && r.bottom <= window.innerHeight
    })
  if (!trayInSight) faults.push('04b-tray-among-cards: the tray is out of sight')
  await shot('04b-tray-among-cards')
  await press(page, page.getByRole('button', { name: 'Compare 3' }).filter({ visible: true }))
  await expect(page).toHaveURL(/see=compare/)
  /* where the press brought it: nothing of the series tiles under the bar */
  await shot('05a-compare-as-opened')
  /* as a person scrolls to it: its top under the docked head, which its scroll margin keeps clear */
  await page.locator('.pl-compare').evaluate((el) => el.scrollIntoView({ block: 'start' }))
  await shot('05-compare')
  await shot('05-compare-full', true)
  /* a fourth refused, said where it is refused */
  const fourth = page.locator('.pl-card', {
    has: page.getByRole('heading', { name: 'Sport 700 ST', exact: true }),
  })
  await press(page, fourth.getByRole('button', { name: /^Compare the Sport 700 ST$/ }))
  const refused = fourth.locator('.pl-card__refused')
  await expect(refused).toHaveText(/Three boats are set side by side at most/)
  /* said where it was refused: in the window, on the card pressed, with nothing scrolled */
  const seen = await refused.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return r.top >= 0 && r.bottom <= window.innerHeight
  })
  if (!seen) faults.push('06-compare-refused: the refusal is out of sight of the press')
  await shot('06-compare-refused')

  /* opened from the range's foot at the page's end, where the head is let go: it lands as it
     does from the top, the head docked and no series tile's name under the floating bar
     (verify-2, gap 1, at 1280 and 1440). Pressed from the keyboard, the page left at its end. */
  await press(
    page,
    page.getByRole('button', { name: 'Close the compare' }).filter({ visible: true }),
  )
  await expect(page.locator('.pl-compare')).toHaveCount(0)
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.waitForTimeout(300)
  const again = page.getByRole('button', { name: 'Compare 3' }).filter({ visible: true }).first()
  await again.evaluate((el) => (el as HTMLElement).focus({ preventScroll: true }))
  await page.keyboard.press('Enter')
  await expect(page.locator('.pl-compare')).toBeVisible()
  /* until the scroll the press began has come to rest: the same place twice, 250ms apart */
  await page.evaluate(async () => {
    await new Promise((rest) => setTimeout(rest, 250))
    for (let i = 0; i < 40; i++) {
      const y = window.scrollY
      await new Promise((rest) => setTimeout(rest, 250))
      if (window.scrollY === y) return
    }
  })
  const landed = await page.evaluate(() => {
    const dock = document.querySelector('.pl-dock')!
    const docks = getComputedStyle(dock).getPropertyValue('--docks').trim() === '1'
    const under = [
      ...new Set(
        [...document.querySelectorAll('.pl-series :is(.pl-stile__name, .pl-stile__sub)')]
          .filter((words) => {
            const r = words.getBoundingClientRect()
            const y = r.top + r.height / 2
            if (r.width === 0 || y < 0 || y > window.innerHeight) return false
            /* under the floating bar AND shown through it: the topmost thing at the words is the
               bar, and the first thing of the page beneath it is the tile, not the head's ground */
            const hits = document.elementsFromPoint(r.left + Math.min(r.width / 2, 12), y)
            const main = document.querySelector('main')!
            const beneath = hits.find((el) => main.contains(el))
            return (
              hits[0] !== undefined && !main.contains(hits[0]) && !!beneath?.closest('.pl-series')
            )
          })
          .map(
            (words) =>
              words.closest('.pl-stile')?.querySelector('.pl-stile__name')?.textContent ?? '',
          ),
      ),
    ]
    return {
      docks,
      stuck: dock.hasAttribute('data-stuck'),
      inset: parseFloat(getComputedStyle(dock).getPropertyValue('--shell-inset')) || 0,
      top: Math.round(document.querySelector('.pl-compare')!.getBoundingClientRect().top),
      under,
    }
  })
  console.log(`[${size}] 06b-compare-from-end: ${JSON.stringify(landed)}`)
  if (landed.under.length > 0)
    faults.push(`06b-compare-from-end: series tiles under the bar: ${landed.under.join(' | ')}`)
  if (landed.docks && !landed.stuck)
    faults.push('06b-compare-from-end: the head is not docked over the compare')
  /* where the head does not dock, the compare's own top comes to the window's top, under the
     bar where a bar stands at the top (its scroll margin) */
  if (!landed.docks && (landed.top < 0 || landed.top > landed.inset + 24))
    faults.push(`06b-compare-from-end: the compare's top lands at ${landed.top}`)
  await shot('06b-compare-from-end')

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
  await to(page, '/places/trl_nsmcustom')
  await shot('16b-nsm-custom')
  await to(page, '/places/trl_gfab')
  await shot('16c-gfab')
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
  /* a refusal said out of sight of its press, or a tray out of sight among the cards, fails */
  expect(faults.filter((f) => /out of sight|06b-compare-from-end/.test(f))).toEqual([])
})
