import { expect, test, type Locator, type Page } from '@playwright/test'
import { throughTheDoor, withoutTheFile } from '../door'
import { written } from '../mint'

/* ============================================================
   PRICES, EVERY STATE AT EVERY SIZE — the screenshots the data round
   reads by eye, taken only when `HL2_LEVELS_SHOTS` is set, so the gate
   never writes into docs. `HL2_LEVELS_SHOTS` names the folder under
   docs/directions/data-round/levels/ (`after` when it is just "1").
   Every press is a person's press at the place the word is drawn
   (`page.mouse`), through the real door on the real price list;
   nothing is planted.
   ============================================================ */

const FOLDER = process.env.HL2_LEVELS_SHOTS ?? ''
const OUT = `docs/directions/data-round/levels/${FOLDER === '1' || FOLDER === '' ? 'after' : FOLDER}`
const READY = '[data-testid="levels"][data-read]'

test.skip(!process.env.HL2_LEVELS_SHOTS, 'screenshots are taken on request')

async function pressOn(page: Page, target: Locator) {
  await target.scrollIntoViewIfNeeded()
  const box = (await target.boundingBox())!
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

async function to(page: Page, query = '') {
  await page.goto(`/levels${query}`)
  await expect(page.locator(READY)).toBeVisible({ timeout: 30_000 })
}

const sizeOf = (page: Page) => `${page.viewportSize()!.width}x${page.viewportSize()!.height}`
test('no price file on this computer, photographed', async ({ page }) => {
  await withoutTheFile(page)
  await page.goto('/levels')
  await expect(page.getByRole('button', { name: /Load the Master Price File/ })).toBeVisible({
    timeout: 30_000,
  })
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${OUT}/00-nofile-${sizeOf(page)}.png` })
})

test('every state of Prices, photographed', async ({ page }) => {
  test.setTimeout(600_000)
  const size = `${page.viewportSize()!.width}x${page.viewportSize()!.height}`
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  const shot = async (name: string, fullPage = false) => {
    await page.waitForTimeout(600)
    await page.screenshot({ path: `${OUT}/${name}-${size}.png`, fullPage })
  }
  /** what the window holds, for the record */
  const measure = async (label: string) => {
    const m = await page.evaluate(() => {
      const small = [...document.querySelectorAll('main *')].filter((el) => {
        if (!(el instanceof HTMLElement) || el.children.length > 0) return false
        if ((el.textContent ?? '').trim() === '') return false
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) return false
        return parseFloat(getComputedStyle(el).fontSize) < 12
      }).length
      const pill = document.querySelector('[data-testid="shell-pill"]')?.getBoundingClientRect()
      const act = [...document.querySelectorAll('.lv-census__acts button')]
        .at(0)
        ?.getBoundingClientRect()
      return {
        sideways: document.documentElement.scrollWidth > window.innerWidth,
        small,
        scrollY: Math.round(window.scrollY),
        act: act ? `${Math.round(act.top)}-${Math.round(act.bottom)} of ${window.innerHeight}` : '',
        pill: pill ? `${Math.round(pill.top)}-${Math.round(pill.bottom)}` : '',
      }
    })
    console.log(`[${size}] ${label}: ${JSON.stringify(m)}`)
  }

  await throughTheDoor(page)
  await to(page)
  await shot('01-arrive')
  await shot('01-arrive-full', true)
  await measure('arrive')

  /* each buyer's price: a motor by its code, then a trade buyer's blank on a Jeanneau */
  const find = page.getByRole('searchbox', { name: 'Find a line by its name or its code' })
  await pressOn(page, find)
  await page.keyboard.type('F90XB')
  await expect(page.getByRole('list', { name: 'Lines found' })).toBeVisible()
  await shot('02-find-typed')
  await pressOn(page, page.getByRole('list', { name: 'Lines found' }).getByRole('button').first())
  await expect(page.getByTestId('buyers')).toBeVisible()
  await shot('03-find-f90xb')
  await measure('answer F90XB')
  await pressOn(page, find)
  await page.keyboard.type('DB 37 OB')
  await pressOn(page, page.getByRole('list', { name: 'Lines found' }).getByRole('button').first())
  await expect(page.getByTestId('buyers')).toBeVisible()
  await shot('03b-find-jeanneau')
  await pressOn(page, find)
  await page.keyboard.type('zzqq')
  await shot('03c-find-nothing')
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')

  /* Dealer Fit: its two ways, what each is, the spread, pressed and counted */
  await to(page)
  await pressOn(page, page.getByRole('button', { name: /^Dealer Fit, 1,777/ }))
  await expect(page.getByTestId('prices-open')).toBeVisible()
  await shot('04-dealerfit-open')
  await measure('dealer fit open')
  await pressOn(page, page.getByTestId('prices-open').getByRole('button', { name: /^Act Sell, / }))
  await expect(page.locator('.lv-census')).toBeVisible()
  await shot('05-dealerfit-picked')
  await measure('dealer fit picked')
  await pressOn(page, page.getByRole('button', { name: /^Price [\d,]+ at Act Sell$/ }))
  await expect(page.getByTestId('last-step')).toBeVisible()
  await shot('06-dealerfit-written')
  await pressOn(page, page.getByTestId('last-step').getByRole('button', { name: 'Undo' }))
  await shot('06b-dealerfit-undone')

  /* Rigging Kits: two ways, supplied or fitted */
  await to(page, '?list=rig_kits')
  await shot('07-kits-open')
  await pressOn(
    page,
    page.getByTestId('prices-open').getByRole('button', { name: /^Supplied, or fitted, / }),
  )
  await expect(page.locator('.lv-census')).toBeVisible()
  await shot('08-kits-picked')
  await measure('kits picked')

  /* the Yamahas' two figures */
  await to(page)
  await pressOn(page, page.getByRole('button', { name: /^Yamaha Outboards, 209/ }))
  await shot('09-yamaha-open')
  await pressOn(
    page,
    page.getByTestId('prices-open').getByRole('button', { name: /^RRP \+ Freight Inc GST, / }),
  )
  await expect(page.locator('.lv-census')).toBeVisible()
  await shot('10-yamaha-rrp')
  await measure('yamaha rrp')

  /* the factory packages: one figure under two names */
  await to(page)
  await pressOn(page, page.getByRole('button', { name: /^Factory packages, 89/ }))
  await shot('11-packages-open')

  /* Warranty, every maker on its scale */
  await to(page)
  await page.locator('.lv-kept').scrollIntoViewIfNeeded()
  await shot('12-warranty')

  /* settled lists opened */
  for (const [name, file] of [
    [/^Stacer, 91 boats/, '13-stacer-open'],
    [/^Jeanneau, 27 boats/, '15-jeanneau-open'],
    [/^Haines Signature, /, '16-haines-open'],
    [/^Parts, 2,937/, '17-parts-open'],
    [/^Every trailer, /, '18-trailers-open'],
    [/^Highfield/, '18b-highfield-open'],
  ] as const) {
    await to(page)
    await pressOn(
      page,
      page.getByRole('region', { name: /^Settled/ }).getByRole('button', { name }),
    )
    await expect(page.getByTestId('prices-open')).toBeVisible()
    await shot(file)
    if (file === '13-stacer-open') {
      const share = page.getByRole('textbox', { name: 'Trade as a share of Cash, in per cent' })
      await pressOn(page, share)
      await page.keyboard.press('Control+A')
      await page.keyboard.type('95')
      await expect(page.getByTestId('census')).toBeVisible()
      await shot('14-stacer-95')
      await measure('stacer 95')
    }
  }

  /* every question answered */
  await to(page, '?list=dealer_fit')
  await pressOn(page, page.getByTestId('prices-open').getByRole('button', { name: /^Act Sell, / }))
  await pressOn(page, page.getByRole('button', { name: /^Price [\d,]+ at Act Sell$/ }))
  await written(page)
  await to(page, '?list=rig_kits')
  await pressOn(
    page,
    page.getByTestId('prices-open').getByRole('button', { name: /^Supplied, or fitted, / }),
  )
  await pressOn(page, page.getByRole('button', { name: /^Price [\d,]+ kits supplied, or fitted$/ }))
  await written(page)
  await to(page, '?list=mot_yamaha')
  await pressOn(
    page,
    page.getByTestId('prices-open').getByRole('button', { name: /^Sell Price, / }),
  )
  await pressOn(page, page.getByRole('button', { name: 'Keep Sell Price' }))
  await written(page)
  await to(page, '?list=packages:mot_pkg_haines')
  await pressOn(
    page,
    page.getByTestId('prices-open').getByRole('button', { name: /^Sell Price, / }),
  )
  await pressOn(page, page.getByRole('button', { name: /^Price [\d,]+ at Sell Price$/ }))
  await written(page)
  await to(page)
  await shot('19-all-answered')
  await shot('19-all-answered-full', true)
  await to(page, '?list=rig_kits')
  await page.getByTestId('prices-open').scrollIntoViewIfNeeded()
  await shot('20-kits-settled-open')

  expect(errors).toEqual([])
})
